// ========================================
// 게임 모드(stage-game.js) — 스테이지를 클리어하며 몬스터를 물리치는 단어·문장 조립 게임
// ========================================
// app.js 다음에 불러오는 일반 스크립트로, app.js 의 전역(wordsByLevel, userRecord, showScreen,
// recordAnswer, loadExamples, speakHanzi, shuffle 등)을 그대로 씁니다.
//
// 구성
//   - 급수마다 단어를 STAGE_WORDS 개씩 나눠 한 스테이지로 삼습니다.
//   - 학습 스테이지 6개 + 보스 스테이지 1개가 한 챕터예요. 보스는 그 챕터 6개 스테이지의 단어를 모두 복습합니다.
//   - 몬스터가 한국어 뜻(또는 예문 해석)을 내면 제한 시간 안에 글자 조각으로 단어를,
//     단어 카드로 문장을 조립해 답합니다. 맞히면 몬스터 체력이 줄고, 틀리거나 시간이 다 되면 생명이 줄어요.
//   - 진행 기록: userRecord.game = { 급수: { cleared: 클리어한 마지막 스테이지 번호, stars: { 스테이지: 별 1~3 } }, avatar: {...} }
//   - 전투 무대: 몬스터(왼쪽)와 내 캐릭터(오른쪽, avatar.js)가 말풍선으로 문제와 답을 주고받고,
//     맞히면 캐릭터가 달려가 주먹으로 때리고, 틀리면 몬스터에게 공격받는 모션이 나옵니다.

const STAGE_WORDS = 10; // 학습 스테이지 하나에 나오는 단어 수
const STAGES_PER_CHAPTER = 6; // 보스 전까지의 학습 스테이지 수
const PLAYER_HEARTS = 3;
// 몬스터 체력: 빨리 풀수록 데미지가 커서(1~3) 금방 이기고,
// 천천히 풀면 그 스테이지의 단어·문장을 더 여러 번 풀며 체력을 깎게 됨 (학습 스테이지 약 7~20문제)
// 마왕: 급수의 모든 챕터를 끝내면 나오는 마지막 결전. 급수 전체 단어를 복습하고, 두목의 2배 체력(= 문제 수 2배)
const MONSTER_HP = { normal: 20, boss: 32, final: 64 };
// 남은 시간 비율에 따른 데미지 단계 (무기를 장착하면 기준이 낮아짐)
const SPEED_TIERS = [
  { min: 0.75, damage: 3, kind: '会心一击! 번개 같은 답!', cry: '크아아악!!' },
  { min: 0.45, damage: 2, kind: '快! 빠른 공격!', cry: '크윽!' },
  { min: 0, damage: 1, kind: '击! 명중!', cry: '으윽!' },
];

function speedTier(remainRatio) {
  const bonus = critBonus();
  return SPEED_TIERS.find((t) => t.min === 0 || remainRatio >= t.min - bonus);
}
// 문장 조립 문제가 나올 확률: 챕터마다 1~3번째 스테이지는 단어 문제만,
// 4번째부터 조금씩 늘어나고 두목전에서 가장 많이 나옴 (단어를 먼저 익힌 뒤 문장으로)
const SENTENCE_RATE_BY_POS = { 1: 0, 2: 0, 3: 0, 4: 0.15, 5: 0.25, 6: 0.35 };
const SENTENCE_RATE_BOSS = 0.4;
function sentenceRate(stage) {
  return stage.boss ? SENTENCE_RATE_BOSS : (SENTENCE_RATE_BY_POS[stage.pos] || 0);
}
const MAX_SENTENCE_TILES = 8;
const REVEAL_MS = { correct: 1300 }; // 맞혔을 때 답을 보여 주는 시간 (틀리면 확인 창에서 직접 넘김)

// 동양 설화 속 요괴들 (이름은 일반적인 요괴 종류로만 지음)
const MONSTERS = [
  { art: 'ghost', name: '물귀신', han: '鬼' },
  { art: 'fox', name: '꼬리 아홉 여우', han: '狐' },
  { art: 'jiangshi', name: '깡충 강시', han: '尸' },
  { art: 'imugi', name: '이무기', han: '蛇' },
  { art: 'bat', name: '박쥐 요괴', han: '蝠' },
  { art: 'toad', name: '두꺼비 도사', han: '蟾' },
  { art: 'boar', name: '멧돼지 장수', han: '猪' },
  { art: 'monkey', name: '산원숭이 요괴', han: '猴' },
  { art: 'scorpion', name: '독전갈 요괴', han: '蝎' },
  { art: 'spider', name: '거미 요괴', han: '蛛' },
];
const BOSSES = [
  { art: 'dragon', name: '청룡', han: '龍' },
  { art: 'dokkaebi', name: '도깨비 대왕', han: '王' },
  { art: 'tiger', name: '산군 백호', han: '虎' },
  { art: 'tengu', name: '붉은 얼굴 천구', han: '天' },
];
const DEMON_KING = { art: 'demonking', name: '마왕', han: '魔' };

// 한자 숫자 (一 ~ 九十九)
const HAN_DIGITS = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
function hanNum(n) {
  if (n < 10) return HAN_DIGITS[n];
  const tens = Math.floor(n / 10);
  return `${tens > 1 ? HAN_DIGITS[tens] : ''}十${HAN_DIGITS[n % 10]}`;
}

// ---------- DOM ----------
const btnGameMode = document.getElementById('btn-game-mode');
const gameMap = document.getElementById('game-map');
const gameBattle = document.getElementById('game-battle');
const gameLevelTabs = document.getElementById('game-level-tabs');
const gameMapSummary = document.getElementById('game-map-summary');
const gameChapters = document.getElementById('game-chapters');
const battleTitle = document.getElementById('battle-title');
const battleHearts = document.getElementById('battle-hearts');
const monsterName = document.getElementById('monster-name');
const monsterHpFill = document.getElementById('monster-hp-fill');
const monsterEl = document.getElementById('monster');
const damagePop = document.getElementById('damage-pop');
const bubbleKind = document.getElementById('bubble-kind');
const bubbleText = document.getElementById('bubble-text');
const battleTimerFill = document.getElementById('battle-timer-fill');
const answerSlots = document.getElementById('answer-slots');
const tilePool = document.getElementById('tile-pool');
const battleFeedback = document.getElementById('battle-feedback');
const battleResult = document.getElementById('battle-result');
const battleResultIcon = document.getElementById('battle-result-icon');
const battleResultTitle = document.getElementById('battle-result-title');
const battleResultStars = document.getElementById('battle-result-stars');
const battleResultText = document.getElementById('battle-result-text');
const btnBattleNext = document.getElementById('btn-battle-next');
const btnBattleRetry = document.getElementById('btn-battle-retry');
const monsterFighter = document.getElementById('monster-fighter');
const playerFighter = document.getElementById('player-fighter');
const playerAvatarEl = document.getElementById('player-avatar');
const playerNameEl = document.getElementById('player-name');
const playerPop = document.getElementById('player-pop');
const playerBubbleText = document.getElementById('player-bubble-text');
const playerBubbleSub = document.getElementById('player-bubble-sub');
const myAvatarEl = document.getElementById('game-my-avatar');
const myAvatarName = document.getElementById('my-avatar-name');
const ATTACK_MS = 260; // 주먹이 닿는 시점 (CSS 애니메이션과 맞춤)
const REVEAL_DELAY_MS = 900; // 오답 모션이 끝난 뒤 정답 확인 창을 띄우는 시점
const appContainer = document.querySelector('.app-container');
const battleStage = document.querySelector('.battle-stage');
const fightersEl = document.querySelector('.fighters');
const fxLayer = document.getElementById('fx-layer');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const CRIT_HITS_MS = [260, 400, 540]; // 크리티컬 연타가 닿는 시점
const answerReveal = document.getElementById('answer-reveal');
const revealTitle = document.getElementById('reveal-title');
const revealZh = document.getElementById('reveal-zh');
const revealPinyin = document.getElementById('reveal-pinyin');
const revealMeaning = document.getElementById('reveal-meaning');
const revealMine = document.getElementById('reveal-mine');
const btnRevealNext = document.getElementById('btn-reveal-next');

let gameLevel = 1;
let battle = null; // 진행 중인 전투 상태

// ---------- 스테이지 구성 ----------
// 같은 급수는 늘 같은 순서로 섞어서(병음 순으로 몰리지 않게) 스테이지를 나눔
function seededShuffle(arr, seed) {
  const a = [...arr];
  let s = seed;
  const rand = () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const stageWordCache = {};
function levelStageWords(level) {
  if (!stageWordCache[level]) stageWordCache[level] = seededShuffle(wordsByLevel[level], level * 7919);
  return stageWordCache[level];
}

function chunkCount(level) {
  return Math.ceil(wordsByLevel[level].length / STAGE_WORDS);
}

function chapterCount(level) {
  return Math.ceil(chunkCount(level) / STAGES_PER_CHAPTER);
}

// 챕터 c(1부터)에 속한 학습 스테이지 수 (마지막 챕터는 6개보다 적을 수 있음)
function chapterChunkCount(level, c) {
  return Math.min(STAGES_PER_CHAPTER, chunkCount(level) - (c - 1) * STAGES_PER_CHAPTER);
}

// 급수의 전체 스테이지 목록: [{ no, chapter, pos, boss, chunks: [청크 번호...] }]
function levelStages(level) {
  const stages = [];
  for (let c = 1; c <= chapterCount(level); c++) {
    const n = chapterChunkCount(level, c);
    const first = (c - 1) * STAGES_PER_CHAPTER;
    for (let p = 0; p < n; p++) {
      stages.push({ no: stages.length + 1, chapter: c, pos: p + 1, boss: false, chunks: [first + p] });
    }
    stages.push({
      no: stages.length + 1, chapter: c, pos: n + 1, boss: true,
      chunks: Array.from({ length: n }, (_, i) => first + i),
    });
  }
  // 모든 챕터 뒤의 마왕성: 급수의 모든 단어를 복습
  stages.push({
    no: stages.length + 1, chapter: chapterCount(level) + 1, pos: 1, boss: true, final: true,
    chunks: Array.from({ length: chunkCount(level) }, (_, i) => i),
  });
  return stages;
}

// 화면에 쓰는 스테이지 이름
function stageKindName(stage) {
  return stage.final ? '마왕' : stage.boss ? '두목' : '';
}

function stageWords(level, stage) {
  const words = levelStageWords(level);
  return stage.chunks.flatMap((k) => words.slice(k * STAGE_WORDS, (k + 1) * STAGE_WORDS));
}

function stageMonster(stage) {
  if (stage.final) return DEMON_KING;
  if (stage.boss) return BOSSES[(stage.chapter - 1) % BOSSES.length];
  return MONSTERS[(stage.no - 1) % MONSTERS.length];
}

// ---------- 진행 기록 ----------
function gameProgress(level) {
  if (!userRecord.game) userRecord.game = {};
  if (!userRecord.game[level]) userRecord.game[level] = { cleared: 0, stars: {} };
  return userRecord.game[level];
}

function saveStageClear(level, stageNo, stars) {
  const prog = gameProgress(level);
  prog.cleared = Math.max(prog.cleared, stageNo);
  prog.stars[stageNo] = Math.max(prog.stars[stageNo] || 0, stars);
  scheduleRecordSave();
}

// ---------- 스테이지 지도 ----------
function openGameMap(level) {
  claimPendingRewards();
  if (level) gameLevel = level;
  stopBattleTimer();
  battle = null;
  gameBattle.style.display = 'none';
  avatarMaker.style.display = 'none';
  showScreen('game');
  // 처음 들어오면 캐릭터부터 만들기
  if (!getAvatar()) {
    gameMap.style.display = 'none';
    openAvatarMaker(() => openGameMap());
    return;
  }
  gameMap.style.display = '';
  renderGameMap();
  loadFriendProgress();
  syncMyProgress();
  // 처음 들어온 사람에게는 게임 방법을 한 번 보여 줌
  if (!userRecord.game.tutorialDone) openTutorial();
}

// ---------- 친구 진행 상황 ----------
// 로그인해서 닉네임이 있으면, 내 진행 상황(캐릭터 얼굴·투구·급수별 클리어 단계)을 서버에 올리고
// 친구들의 진행 상황을 받아 지도의 스테이지 위에 친구 얼굴을 띄움
const friendProgressEl = document.getElementById('friend-progress');
let friendProgress = []; // [{ uid, nickname, avatar, hat, cleared }]
let friendProgressAt = 0;
let friendProgressLoading = false;
const FRIEND_PROGRESS_TTL = 60 * 1000; // 1분 동안은 다시 받지 않음

function socialReady() {
  return typeof recordOwner !== 'undefined' && recordOwner && recordOwner.type === 'google'
    && typeof userProfile !== 'undefined' && userProfile && window.hanziFirebase
    && window.hanziFirebase.getFriendsProgress;
}

// 친구 진행 상황 받아 오기 (친구 목록 → 각 친구의 gameProgress)
async function loadFriendProgress(force = false) {
  if (!socialReady()) {
    friendProgress = [];
    renderFriendPins();
    return;
  }
  if (friendProgressLoading || (!force && Date.now() - friendProgressAt < FRIEND_PROGRESS_TTL)) return;
  friendProgressLoading = true;
  try {
    const { friends } = await window.hanziFirebase.getFriendData();
    const progress = friends.length ? await window.hanziFirebase.getFriendsProgress(friends.map((f) => f.uid)) : [];
    const byUid = new Map(friends.map((f) => [f.uid, f]));
    friendProgress = progress.map((p) => ({
      uid: p.uid,
      nickname: (byUid.get(p.uid) || {}).nickname || '친구',
      photo: (byUid.get(p.uid) || {}).photo || null,
      avatar: validAvatar(p.avatar) || DEFAULT_AVATAR,
      hat: GEAR_BY_ID[p.hat] && GEAR_BY_ID[p.hat].slot === 'hat' ? p.hat : null,
      cleared: p.cleared && typeof p.cleared === 'object' ? p.cleared : {},
    }));
    friendProgressAt = Date.now();
  } catch (error) {
    console.warn('친구 진행 상황을 불러오지 못했어요.', error);
    friendProgressAt = Date.now(); // 실패해도 1분 동안은 다시 시도하지 않음
  } finally {
    friendProgressLoading = false;
  }
  if (gameMap.style.display !== 'none') renderFriendPins();
}

// 이 급수에서 친구가 있는 스테이지: 클리어한 다음 스테이지 (모두 깼으면 마왕성)
function friendStageNo(friend, level, total) {
  const cleared = Math.max(0, Math.min(total, Math.floor(Number(friend.cleared[level]) || 0)));
  if (cleared === 0) return 0; // 이 급수를 아직 시작하지 않음
  return Math.min(cleared + 1, total);
}

// 친구 얼굴: 프로필 사진이 있으면 사진, 없으면 게임 캐릭터 얼굴
function fillFriendFace(el, f) {
  if (typeof validPhoto === 'function' && validPhoto(f.photo)) {
    const img = document.createElement('img');
    img.src = f.photo;
    img.alt = '';
    el.appendChild(img);
  } else {
    el.innerHTML = renderAvatarFace(f.avatar, f.hat);
  }
}

function renderFriendPins() {
  gameChapters.querySelectorAll('.friend-pins').forEach((el) => el.remove());
  const total = levelStages(gameLevel).length;
  const here = friendProgress
    .map((f) => ({ ...f, no: friendStageNo(f, gameLevel, total) }))
    .filter((f) => f.no > 0)
    .sort((a, b) => b.no - a.no);
  // 스테이지별로 묶어서 얼굴 띄우기 (최대 3명 + 나머지 수)
  const byStage = new Map();
  here.forEach((f) => {
    if (!byStage.has(f.no)) byStage.set(f.no, []);
    byStage.get(f.no).push(f);
  });
  byStage.forEach((list, no) => {
    const node = gameChapters.querySelector(`.stage-node[data-no="${no}"]`);
    if (!node) return;
    const pins = document.createElement('span');
    pins.className = 'friend-pins';
    pins.setAttribute('aria-hidden', 'true');
    list.slice(0, 3).forEach((f) => {
      const pin = document.createElement('span');
      pin.className = 'friend-pin';
      fillFriendFace(pin, f);
      pins.appendChild(pin);
    });
    if (list.length > 3) {
      const more = document.createElement('span');
      more.className = 'friend-pin more';
      more.textContent = `+${list.length - 3}`;
      pins.appendChild(more);
    }
    node.appendChild(pins);
    node.title = `친구: ${list.map((f) => f.nickname).join(', ')}`;
    node.setAttribute('aria-label', `${node.getAttribute('aria-label')}, 여기 있는 친구 ${list.map((f) => f.nickname).join(', ')}`);
  });

  // 지도 위쪽: 이 급수의 친구 목록 (누가 어디까지 왔는지)
  if (!here.length) {
    friendProgressEl.style.display = 'none';
    friendProgressEl.replaceChildren();
    return;
  }
  const stages = levelStages(gameLevel);
  const title = document.createElement('span');
  title.className = 'friend-progress-title';
  title.textContent = '친구 진행';
  const chips = here.map((f) => {
    const s = stages[f.no - 1];
    const chip = document.createElement('span');
    chip.className = 'friend-chip';
    const face = document.createElement('span');
    face.className = 'friend-pin';
    fillFriendFace(face, f);
    const name = document.createElement('span');
    name.className = 'friend-chip-name';
    name.textContent = f.nickname;
    const where = document.createElement('small');
    const allClear = (Number(f.cleared[gameLevel]) || 0) >= stages.length;
    where.textContent = allClear ? '마왕 격파!' : s.final ? '마왕성' : s.boss ? `${s.chapter}장 두목` : `${s.chapter}-${s.pos}`;
    chip.append(face, name, where);
    return chip;
  });
  friendProgressEl.replaceChildren(title, ...chips);
  friendProgressEl.style.display = '';
}

// 내 진행 상황 올리기: 바뀌었을 때만, 잠깐 모아서 한 번에
let progressSyncTimer = null;
let lastProgressJson = '';
let progressSyncFailed = false;
function syncMyProgress() {
  if (progressSyncFailed || !socialReady() || !userRecord || !userRecord.game) return;
  clearTimeout(progressSyncTimer);
  progressSyncTimer = setTimeout(() => {
    if (!socialReady()) return;
    const cleared = {};
    for (let l = 1; l <= 6; l++) {
      const prog = userRecord.game[l];
      if (prog && prog.cleared > 0) cleared[l] = prog.cleared;
    }
    const data = { avatar: getAvatar(), hat: gamePlayer().equip.hat || null, cleared };
    const json = JSON.stringify(data);
    if (json === lastProgressJson) return;
    window.hanziFirebase.saveGameProgress(data)
      .then(() => { lastProgressJson = json; })
      .catch((error) => {
        progressSyncFailed = true; // 이번 접속에서는 다시 시도하지 않음
        console.warn('게임 진행 상황을 저장하지 못했어요.', error);
      });
  }, 1500);
}

// ---------- 게임 방법 안내 (튜토리얼) ----------
const tutorialModal = document.getElementById('tutorial-modal');
const tutorialArt = document.getElementById('tutorial-art');
const tutorialTitle = document.getElementById('tutorial-title');
const tutorialText = document.getElementById('tutorial-text');
const tutorialStepNo = document.getElementById('tutorial-step-no');
const tutorialDots = document.getElementById('tutorial-dots');
const btnTutorialPrev = document.getElementById('btn-tutorial-prev');
const btnTutorialNext = document.getElementById('btn-tutorial-next');
let tutorialStep = 0;

const TUTORIAL_STEPS = [
  {
    title: '한자 무림에 온 걸 환영해요!',
    text: '요괴를 물리치며 HSK 단어와 문장을 익히는 모험이에요. 어떻게 싸우는지 차근차근 알려 줄게요.',
    art: () => `
      <div class="tut-duo">
        <div class="tut-fighter tut-monster">${renderMonster('fox')}</div>
        <div class="tut-vs">對</div>
        <div class="tut-fighter tut-me">${renderAvatar(getAvatar(), 'win', gamePlayer().equip)}</div>
      </div>`,
  },
  {
    title: '관문을 하나씩 넘어요',
    text: '관문을 클리어하면 다음 관문이 열려요. 여섯 관문마다 일곱 번째에는 그 챕터를 복습하는 <b>요괴 두목</b>이, 모든 챕터를 끝내면 급수 전체를 문제로 내는 <b>마왕</b>이 기다려요.',
    art: () => `
      <div class="tut-path">
        ${HAN_DIGITS.slice(1, 7).map((h, i) => `<span class="tut-coin${i < 2 ? ' done' : i === 2 ? ' now' : ''}">${h}</span>`).join('<i class="tut-link"></i>')}
        <i class="tut-link"></i><span class="tut-coin boss">${renderMonster('dragon')}<em>두목</em></span>
        <i class="tut-link dots"></i><span class="tut-coin boss final">${renderMonster('demonking')}<em>마왕</em></span>
      </div>`,
  },
  {
    title: '한자 조각을 맞춰 공격!',
    text: '몬스터가 말풍선으로 <b>한국어 뜻</b>을 내면, 아래 한자 조각을 <b>순서대로</b> 눌러 중국어를 만들어요. 잘못 놓은 조각은 다시 누르면 빠져요. 챕터마다 4번째 관문부터는 문장 문제도 나와요.',
    art: () => `
      <div class="tut-battle">
        <div class="tut-ask">
          <span class="tut-mini-monster">${renderMonster('ghost')}</span>
          <span class="tut-bubble"><small>問 중국어 단어는?</small>과일</span>
        </div>
        <div class="tut-slots"><span class="filled">水</span><span class="next"></span></div>
        <div class="tut-tiles"><span class="used">水</span><span>喝</span><span class="pulse">果</span><span>茶</span></div>
      </div>`,
  },
  {
    title: '빨리 풀수록 강한 공격',
    text: '향이 타들어 가듯 시간이 줄어요. <b>×3</b> 눈금 전에 맞히면 데미지 3배, <b>×2</b> 눈금 전이면 2배! 몬스터의 체력을 모두 깎으면 승리예요.',
    art: () => `
      <div class="tut-speed">
        <div class="tut-hp"><span class="tut-mini-monster">${renderMonster('toad', 'hurt')}</span><span class="tut-hp-bar"><i></i></span></div>
        <div class="tut-timer"><i class="tut-timer-fill"></i><b class="m2">×2</b><b class="m3">×3</b></div>
        <div class="tut-damage"><span class="x3">×3 크리티컬!</span><span class="x2">×2</span><span class="x1">×1</span></div>
      </div>`,
  },
  {
    title: '하트 세 개를 지켜요',
    text: '틀리거나 시간이 다 되면 하트 하나를 잃고 <b>정답을 보여 줘요</b>. 하트를 모두 잃으면 패배지만, 틀린 단어는 오답 노트에 모여요. 별은 남은 하트 수만큼 받아요.',
    art: () => `
      <div class="tut-hearts">
        <div class="tut-heart-row">${uiIcon('heart')}${uiIcon('heart')}<span class="tut-break">${uiIcon('heartbreak')}</span></div>
        <div class="tut-reveal"><small>정답</small><strong>水果</strong><span>shuǐguǒ · 과일</span></div>
      </div>`,
  },
  {
    title: '상자를 열어 보상 받기',
    text: '클리어하면 <b>경험치·코인</b>과 함께 상자를 얻어요. 높은 급수와 두목일수록 좋은 상자가 나와요. 상자를 눌러 열면 경험치·코인·<b>장비</b>가 쏟아져요.',
    art: () => `
      <div class="tut-chests">
        <div class="tut-chest-row">${CHESTS.map((c, i) => `<span class="tut-chest" style="--i:${i}">${renderChest(i)}<em>${c.name}</em></span>`).join('')}</div>
        <div class="tut-loot"><span>${uiIcon('exp')} 경험치</span><span>${uiIcon('coin')} 코인</span><span class="gear">${renderGearIcon('brush')} 장비</span></div>
      </div>`,
  },
  {
    title: '장비로 더 강해지기',
    text: '<b>무기</b>는 빠른 공격(×2·×3)을 쉽게, <b>모자·투구</b>는 제한 시간을, <b>갑옷</b>은 공격을 막을 확률을, <b>바지</b>는 보상을 늘려 줘요. 지도 위 <b>가방</b>에서 장착하고, <b>꾸미기</b>로 캐릭터를 바꿀 수 있어요. 이 안내는 지도의 ‘게임 방법 보기’로 다시 볼 수 있어요.',
    art: () => `
      <div class="tut-gear">
        <span class="tut-gear-col"><span class="tut-gear-item">${renderGearIcon('glaive')}<em>무기</em></span><span class="tut-gear-item">${renderGearIcon('generalhelm')}<em>투구</em></span></span>
        <span class="tut-fighter tut-me">${renderAvatar(getAvatar(), 'win', { weapon: 'glaive', hat: 'generalhelm', armor: 'lamellar', pants: 'warriorpants' })}</span>
        <span class="tut-gear-col"><span class="tut-gear-item">${renderGearIcon('lamellar')}<em>갑옷</em></span><span class="tut-gear-item">${renderGearIcon('warriorpants')}<em>바지</em></span></span>
      </div>`,
  },
];

function openTutorial() {
  tutorialStep = 0;
  renderTutorial();
  tutorialModal.style.display = '';
  btnTutorialNext.focus();
}

function renderTutorial() {
  const step = TUTORIAL_STEPS[tutorialStep];
  const last = tutorialStep === TUTORIAL_STEPS.length - 1;
  tutorialStepNo.textContent = `${tutorialStep + 1} / ${TUTORIAL_STEPS.length}`;
  tutorialArt.innerHTML = step.art();
  tutorialTitle.textContent = step.title;
  tutorialText.innerHTML = step.text;
  tutorialDots.innerHTML = TUTORIAL_STEPS.map((_, i) => `<i class="${i === tutorialStep ? 'on' : ''}"></i>`).join('');
  btnTutorialPrev.style.visibility = tutorialStep === 0 ? 'hidden' : '';
  btnTutorialNext.textContent = last ? '모험 시작!' : '다음 →';
  document.getElementById('btn-tutorial-skip').style.visibility = last ? 'hidden' : '';
  // 넘길 때마다 그림·글이 새로 나타나는 연출
  const card = document.getElementById('tutorial-card');
  card.classList.remove('turn');
  void card.offsetWidth;
  card.classList.add('turn');
}

function closeTutorial() {
  tutorialModal.style.display = 'none';
  if (!userRecord.game) userRecord.game = {};
  if (!userRecord.game.tutorialDone) {
    userRecord.game.tutorialDone = true;
    scheduleRecordSave();
  }
}

function moveTutorial(delta) {
  const next = tutorialStep + delta;
  if (next < 0) return;
  if (next >= TUTORIAL_STEPS.length) {
    closeTutorial();
    return;
  }
  tutorialStep = next;
  renderTutorial();
  Sfx.tap();
}

btnTutorialNext.addEventListener('click', () => moveTutorial(1));
btnTutorialPrev.addEventListener('click', () => moveTutorial(-1));
document.getElementById('btn-tutorial-skip').addEventListener('click', closeTutorial);
document.getElementById('btn-game-help').addEventListener('click', openTutorial);
tutorialModal.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') moveTutorial(1);
  else if (e.key === 'ArrowLeft') moveTutorial(-1);
  else if (e.key === 'Escape') closeTutorial();
});
// 휴대폰: 옆으로 밀어서 넘기기
let tutorialTouchX = null;
tutorialModal.addEventListener('touchstart', (e) => { tutorialTouchX = e.touches[0].clientX; }, { passive: true });
tutorialModal.addEventListener('touchend', (e) => {
  if (tutorialTouchX === null) return;
  const dx = e.changedTouches[0].clientX - tutorialTouchX;
  tutorialTouchX = null;
  if (Math.abs(dx) > 50) moveTutorial(dx < 0 ? 1 : -1);
}, { passive: true });

function playerDisplayName() {
  const name = typeof getDisplayName === 'function' ? getDisplayName() : '';
  return name && name !== '게스트' ? name : '나';
}

// 닉네임 + 착용한 칭호 배지
function setNameWithTitle(el, name) {
  el.textContent = name;
  const badge = titleBadgeHtml();
  if (badge) el.insertAdjacentHTML('beforeend', ` ${badge}`);
}

// 칭호를 바꾸면 보이는 곳을 모두 다시 그림
function refreshTitleDisplays() {
  const welcomeTitleEl = document.getElementById('welcome-title');
  if (typeof userRecord === 'undefined' || !userRecord || !userRecord.game) {
    welcomeTitleEl.style.display = 'none';
    return;
  }
  if (myAvatarName) setNameWithTitle(myAvatarName, playerDisplayName());
  if (battle) setNameWithTitle(playerNameEl, playerDisplayName());
  const welcomeTitle = document.getElementById('welcome-title');
  const badge = titleBadgeHtml();
  welcomeTitle.innerHTML = badge;
  welcomeTitle.style.display = badge ? '' : 'none';
  syncProfileTitle();
}

// 착용한 칭호를 친구들이 볼 수 있게 공개 프로필에 저장 (로그인 + 닉네임이 있을 때만, 바뀌었을 때만)
let titleSyncing = false;
let titleSyncFailed = false; // 한 번 실패하면 이번 접속에서는 다시 시도하지 않음 (헛된 요청 반복 방지)
function syncProfileTitle() {
  if (titleSyncing || titleSyncFailed || typeof userProfile === 'undefined' || !userProfile || !window.hanziFirebase
    || !window.hanziFirebase.setProfileTitle || !userRecord || !userRecord.game) return;
  const want = gamePlayer().equip.title || null;
  if ((userProfile.title || null) === want) return;
  titleSyncing = true;
  const profile = userProfile;
  window.hanziFirebase.setProfileTitle(want)
    .then(() => { profile.title = want; })
    .catch((error) => {
      titleSyncFailed = true;
      console.warn('칭호를 프로필에 저장하지 못했어요.', error);
    })
    .finally(() => { titleSyncing = false; });
}

function setPlayerMood(mood) {
  playerAvatarEl.innerHTML = renderAvatar(getAvatar(), mood, gamePlayer().equip);
}

// 지도 위 내 캐릭터 카드: 레벨·경험치·코인·장비
function renderPlayerCard() {
  const p = gamePlayer();
  const info = levelInfo(p.exp);
  myAvatarEl.innerHTML = renderAvatar(getAvatar(), 'normal', p.equip);
  setNameWithTitle(myAvatarName, playerDisplayName());
  document.getElementById('player-level').textContent = `Lv.${info.level}`;
  document.getElementById('exp-bar-fill').style.width = `${(info.exp / info.need) * 100}%`;
  document.getElementById('exp-text').textContent = `${info.exp.toLocaleString()} / ${info.need.toLocaleString()} EXP`;
  document.getElementById('coin-text').textContent = p.coins.toLocaleString();
  document.querySelector('.my-avatar-card .coin-mark').innerHTML = uiIcon('coin');
  const eq = equippedGear();
  // 장비 이름은 고정 목록에서 온 문자열이라 그림과 함께 HTML 로 넣어도 안전함
  const worn = GEAR_SLOTS.map((slot) => eq[slot.id]).filter(Boolean);
  document.getElementById('player-gear').innerHTML = worn.length
    ? worn.map((g) => `<span class="worn-gear">${renderGearIcon(g.id)}${g.name}</span>`).join('')
    : '맨손';
}

function renderGameMap() {
  renderPlayerCard();
  gameLevelTabs.replaceChildren(...[1, 2, 3, 4, 5, 6].map((l) => {
    const btn = document.createElement('button');
    btn.className = 'game-level-tab' + (l === gameLevel ? ' active' : '');
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', String(l === gameLevel));
    // 一級·二級… (아래에 작게 HSK 숫자)
    const han = document.createElement('span');
    han.className = 'tab-han';
    han.textContent = `${hanNum(l)}级`;
    const small = document.createElement('small');
    small.textContent = `HSK ${l}`;
    btn.append(han, small);
    btn.setAttribute('aria-label', `HSK ${l}급`);
    btn.addEventListener('click', () => {
      gameLevel = l;
      renderGameMap();
    });
    return btn;
  }));

  const stages = levelStages(gameLevel);
  const prog = gameProgress(gameLevel);
  const totalStars = Object.values(prog.stars).reduce((a, b) => a + b, 0);
  gameMapSummary.textContent = `HSK ${gameLevel}급 · 스테이지 ${Math.min(prog.cleared, stages.length)}/${stages.length} 클리어 · ★ ${totalStars}`;

  const nextNo = prog.cleared + 1;
  const chapters = [];
  for (let c = 1; c <= chapterCount(gameLevel) + 1; c++) {
    const isFinal = c > chapterCount(gameLevel);
    const card = document.createElement('section');
    card.className = 'game-chapter' + (isFinal ? ' final-chapter' : '');
    const head = document.createElement('h3');
    head.className = 'game-chapter-title';
    const chapterHan = document.createElement('span');
    chapterHan.className = 'chapter-han';
    chapterHan.textContent = isFinal ? '魔王城' : `第${hanNum(c)}章`;
    head.append(chapterHan, isFinal ? ' 마왕성' : ` 챕터 ${c}`);
    const path = document.createElement('div');
    path.className = 'stage-path';
    stages.filter((s) => s.chapter === c).forEach((s) => {
      const node = document.createElement('button');
      node.dataset.no = String(s.no);
      const cleared = s.no <= prog.cleared;
      const open = s.no === nextNo;
      node.className = 'stage-node' + (s.boss ? ' boss' : '') + (cleared ? ' cleared' : '') + (open ? ' current' : '') + (!cleared && !open ? ' locked' : '');
      node.disabled = !cleared && !open;
      const stars = prog.stars[s.no] || 0;
      const icon = document.createElement('span');
      icon.className = 'stage-node-icon';
      if (s.boss) icon.innerHTML = cleared ? uiIcon('crown') : renderMonster(stageMonster(s).art);
      else if (!cleared && !open) icon.innerHTML = uiIcon('lock');
      else icon.textContent = String(s.no);
      const label = document.createElement('span');
      label.className = 'stage-node-label';
      label.textContent = s.boss ? stageKindName(s) : `${c}-${s.pos}`;
      const starEl = document.createElement('span');
      starEl.className = 'stage-node-stars';
      starEl.textContent = cleared ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : '';
      // 엽전(동그라미) 그림과 라벨·별을 나눠 라벨이 엽전과 겹치지 않게 함
      const coin = document.createElement('span');
      coin.className = 'stage-coin';
      coin.appendChild(icon);
      node.append(coin, label, starEl);
      node.setAttribute('aria-label', `${s.final ? '마왕성 마왕' : s.boss ? `챕터 ${c} 두목` : `스테이지 ${c}-${s.pos}`}${cleared ? `, 별 ${stars}개` : node.disabled ? ', 잠김' : ''}`);
      node.addEventListener('click', () => startBattle(gameLevel, s.no));
      path.appendChild(node);
    });
    card.append(head, path);
    if (isFinal) {
      const desc = document.createElement('p');
      desc.className = 'final-chapter-desc';
      desc.textContent = `모든 챕터를 끝내면 열려요 · HSK ${gameLevel}급 단어 ${wordsByLevel[gameLevel].length}개 총복습 · 문제 2배`;
      card.append(desc);
    }
    chapters.push(card);
  }
  gameChapters.replaceChildren(...chapters);

  renderFriendPins();

  // 지금 도전할 스테이지가 보이도록 스크롤
  const current = gameChapters.querySelector('.stage-node.current');
  if (current) current.scrollIntoView({ block: 'center' });
}

// ---------- 전투 ----------
async function startBattle(level, stageNo) {
  const stage = levelStages(level).find((s) => s.no === stageNo);
  if (!stage) return;
  const words = stageWords(level, stage);
  const examples = await loadExamples(level);
  const kind = stage.final ? 'final' : stage.boss ? 'boss' : 'normal';
  const monster = stageMonster(stage);

  battle = {
    level,
    stage,
    words,
    examples,
    kind,
    hp: MONSTER_HP[kind],
    maxHp: MONSTER_HP[kind],
    hearts: PLAYER_HEARTS,
    maxHearts: PLAYER_HEARTS, // 하트 추가 아이템을 쓰면 늘어남
    revived: false, // 부활권은 전투마다 한 번
    queue: [],
    question: null,
    busy: false,
    timer: null,
  };

  gameMap.style.display = 'none';
  gameBattle.style.display = '';
  battleResult.style.display = 'none';
  answerReveal.style.display = 'none';
  battleVictory.style.display = 'none';
  battleDefeat.style.display = 'none';
  revivePrompt.style.display = 'none';
  rewardArea.style.display = 'none';
  resultButtons.style.display = '';
  hideChestOpen();
  fxLayer.replaceChildren();
  battleStage.className = 'battle-stage';
  gameBattle.classList.toggle('boss-battle', stage.boss);
  gameBattle.classList.toggle('final-battle', !!stage.final);
  battleTitle.textContent = stage.final ? '魔王城 마왕전' : stage.boss ? `第${hanNum(stage.chapter)}章 두목전` : `스테이지 ${stage.chapter}-${stage.pos}`;
  const seal = document.createElement('span');
  seal.className = 'name-seal';
  seal.textContent = monster.han;
  monsterName.replaceChildren(seal, `${monster.name}${stage.boss && !stage.final ? ' (두목)' : ''}`);
  monsterEl.innerHTML = renderMonster(monster.art);
  monsterEl.className = 'monster appear';
  battle.monsterArt = monster.art;
  monsterFighter.className = 'fighter monster-side';
  playerFighter.className = 'fighter player-side';
  setNameWithTitle(playerNameEl, playerDisplayName());
  setPlayerMood('normal');
  showScreen('game');
  renderBattleStatus();
  ensureBgm(); // 전투에 들어올 때 멈춰 있던 배경음악 다시 재생
  playIntro(stage, monster);
}

// ---------- 시작 연출: 准备 → 开始！ ----------
const battleIntro = document.getElementById('battle-intro');
const introWord = document.getElementById('intro-word');
const introPinyin = document.getElementById('intro-pinyin');
const INTRO_READY_MS = 450;
const INTRO_GO_MS = 1500;
const INTRO_END_MS = 2350;

function playIntro(stage, monster) {
  const current = battle;
  battle.busy = true;
  battle.intro = true;
  answerSlots.replaceChildren();
  tilePool.replaceChildren();
  battleTimerFill.style.width = '100%';
  bubbleKind.textContent = '';
  bubbleText.textContent = stage.final ? '네가 배운 모든 것을 시험해 주마!' : stage.boss ? '여기까지 온 걸 후회하게 해 주마!' : '덤벼라!';
  bubbleText.removeAttribute('lang');
  playerBubbleText.textContent = '좋아, 간다!';
  playerBubbleText.lang = 'ko';
  playerBubbleSub.textContent = '';

  document.getElementById('intro-stage').textContent = stage.final
    ? `魔王城 · HSK ${battle.level}급 최종 결전`
    : stage.boss
    ? `第${hanNum(stage.chapter)}章 · 두목전`
    : `第${hanNum(stage.chapter)}章 · 스테이지 ${stage.chapter}-${stage.pos}`;
  document.getElementById('intro-monster').innerHTML = renderMonster(monster.art);
  const seal = document.createElement('span');
  seal.className = 'name-seal';
  seal.textContent = monster.han;
  document.getElementById('intro-name').replaceChildren(seal, monster.name);
  introWord.textContent = '';
  introWord.className = 'intro-word';
  introPinyin.textContent = '';
  battleIntro.className = `battle-intro${stage.boss ? ' boss' : ''}${stage.final ? ' final' : ''}`;
  battleIntro.style.display = '';

  const timers = [];
  const at = (ms, fn) => timers.push(setTimeout(() => { if (battle === current && current.intro) fn(); }, ms));
  at(INTRO_READY_MS, () => {
    introWord.textContent = '准备';
    introPinyin.textContent = 'zhǔnbèi · 준비';
    introWord.className = 'intro-word ready';
    Sfx.battleStart(stage.boss);
  });
  at(INTRO_GO_MS, () => {
    introWord.textContent = '开始！';
    introPinyin.textContent = 'kāishǐ · 시작!';
    introWord.className = 'intro-word go';
    battleIntro.classList.add('go');
    Sfx.begin();
  });
  at(INTRO_END_MS, () => endIntro(current));
  current.introTimers = timers;
}

function endIntro(current) {
  if (battle !== current || !current.intro) return;
  current.intro = false;
  (current.introTimers || []).forEach(clearTimeout);
  battleIntro.classList.add('leaving');
  setTimeout(() => {
    if (battle === current) battleIntro.style.display = 'none';
  }, 280);
  nextQuestion();
}

// 연출 중에 화면을 누르면 바로 시작
battleIntro.addEventListener('click', () => {
  if (battle && battle.intro) endIntro(battle);
});

// ---------- 클리어 연출: 胜！ ----------
const battleVictory = document.getElementById('battle-victory');

function playVictory(stage) {
  document.getElementById('victory-sub').textContent = stage.final ? '마왕 격파!' : stage.boss ? '두목 격파!' : '스테이지 클리어!';
  const sparks = document.getElementById('victory-sparks');
  sparks.replaceChildren();
  if (!reduceMotion.matches) {
    for (let i = 0; i < 26; i++) {
      const sp = document.createElement('span');
      sp.className = i % 4 === 0 ? 'victory-spark coin' : 'victory-spark';
      if (i % 4 === 0) sp.innerHTML = uiIcon('coin');
      const angle = Math.random() * Math.PI * 2;
      const dist = 90 + Math.random() * 120;
      sp.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
      sp.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
      sp.style.setProperty('--d', `${0.25 + Math.random() * 0.3}s`);
      sparks.appendChild(sp);
    }
  }
  battleVictory.className = `battle-victory${stage.boss ? ' boss' : ''}`;
  battleVictory.style.display = '';
  if (!reduceMotion.matches) stageEffect('shake-l', 600);
  Sfx.victory();
}

function hideVictory() {
  battleVictory.style.display = 'none';
}

// ---------- 패배 연출: 败 ----------
// 몬스터가 비웃고 내 캐릭터가 쓰러진 뒤, 화면이 잿빛으로 바래고 먹물이 흘러내리며 '败'가 갈라짐
const battleDefeat = document.getElementById('battle-defeat');
const DEFEAT_SHOW_MS = 650; // 쓰러지는 모습을 먼저 보여 줌
const DEFEAT_END_MS = 3600;
const DEFEAT_TAUNTS = ['크하하! 아직 멀었다!', '그 정도 실력으론 어림없지!', '다음엔 공부 좀 하고 오너라!'];

function playDefeat(current) {
  const { stage } = current;
  current.defeating = true;
  stopBattleTimer();
  setPlayerMood('hurt');
  playerFighter.classList.add('fallen');
  monsterFighter.classList.add('taunt');
  bubbleKind.textContent = '';
  bubbleText.textContent = stage.final ? '크하하! 이 마왕을 넘기엔 아직 멀었다!' : stage.boss ? '하찮은 녀석! 썩 물러가라!' : DEFEAT_TAUNTS[Math.floor(Math.random() * DEFEAT_TAUNTS.length)];
  bubbleText.removeAttribute('lang');
  playerBubbleText.textContent = '으윽…';
  playerBubbleText.lang = 'ko';
  playerBubbleSub.textContent = '';
  if (!reduceMotion.matches) stageEffect('shake-l', 500);
  Sfx.fall();

  const timers = [];
  const at = (ms, fn) => timers.push(setTimeout(() => { if (battle === current && current.defeating) fn(); }, ms));
  at(DEFEAT_SHOW_MS, () => {
    document.getElementById('defeat-sub').textContent = stage.final ? '마왕에게 패배했어요…' : stage.boss ? '두목에게 패배했어요…' : '패배했어요…';
    document.getElementById('defeat-tip').textContent = '틀린 단어를 익히고 다시 도전!';
    const ash = document.getElementById('defeat-ash');
    ash.replaceChildren();
    if (!reduceMotion.matches) {
      for (let i = 0; i < 22; i++) {
        const a = document.createElement('span');
        a.style.left = `${Math.random() * 100}%`;
        a.style.setProperty('--sway', `${(Math.random() - 0.5) * 60}px`);
        a.style.setProperty('--d', `${1.2 + Math.random() * 1.6}s`);
        a.style.animationDelay = `${0.3 + Math.random() * 1.4}s`;
        const size = 3 + Math.random() * 5;
        a.style.width = `${size}px`;
        a.style.height = `${size}px`;
        ash.appendChild(a);
      }
    }
    battleDefeat.className = `battle-defeat${stage.boss ? ' boss' : ''}`;
    battleDefeat.style.display = '';
    Sfx.defeat();
  });
  // 글자가 쩍 갈라지는 순간
  at(DEFEAT_SHOW_MS + 1050, () => {
    battleDefeat.classList.add('split');
    if (!reduceMotion.matches) stageEffect('shake-l', 350);
    Sfx.crack();
  });
  at(DEFEAT_END_MS, () => endDefeat(current));
  current.defeatTimers = timers;
}

function endDefeat(current) {
  if (battle !== current || !current.defeating) return;
  current.defeating = false;
  (current.defeatTimers || []).forEach(clearTimeout);
  battleDefeat.style.display = 'none';
  finishBattle(false);
}

// 연출 중에 누르면 바로 결과 창으로 (쓰러지는 순간 바로 누르는 실수는 막음)
battleDefeat.addEventListener('click', () => {
  if (battle && battle.defeating) endDefeat(battle);
});

function renderBattleStatus() {
  battleHearts.innerHTML = uiIcon('heart').repeat(Math.max(0, battle.hearts)) + uiIcon('heart-empty').repeat(Math.max(0, battle.maxHearts - battle.hearts));
  renderBattleItems();
  monsterHpFill.style.width = `${(battle.hp / battle.maxHp) * 100}%`;
}

// 같은 단어가 연달아 나오지 않도록 스테이지 단어를 섞어 차례로 꺼냄
function nextWord() {
  if (battle.queue.length === 0) battle.queue = shuffle(battle.words);
  return battle.queue.shift();
}

function sentenceFor(word) {
  const ex = battle.examples[word.hanzi];
  if (!ex || !Array.isArray(ex[3])) return null;
  const tiles = ex[3];
  if (tiles.length < 3 || tiles.length > MAX_SENTENCE_TILES || /[“”"]/.test(ex[0])) return null;
  return { zh: ex[0], pinyin: ex[1], ko: ex[2], tiles };
}

// 단어 조립: 정답 글자 + 같은 급수 다른 단어의 글자로 섞은 조각
function wordQuestion(word) {
  const answer = Array.from(word.hanzi);
  const need = Math.min(8, Math.max(6, answer.length + 4)) - answer.length;
  const pool = shuffle(Array.from(new Set(wordsByLevel[battle.level].flatMap((w) => Array.from(w.hanzi)))))
    .filter((ch) => !answer.includes(ch));
  return {
    type: 'word',
    word,
    prompt: word.meaning,
    answer,
    tiles: shuffle([...answer, ...pool.slice(0, need)]),
    seconds: 8 + answer.length * 4 + timeBonus(), // 모자를 쓰면 제한 시간이 늘어남
  };
}

// 문장 조립: 예문 단어 카드 + 함정 카드 2장
function sentenceQuestion(word, sentence) {
  const traps = shuffle(battle.words.map((w) => w.hanzi))
    .filter((h) => !sentence.zh.includes(h))
    .slice(0, 2);
  return {
    type: 'sentence',
    word,
    sentence,
    prompt: sentence.ko,
    answer: sentence.tiles,
    tiles: shuffle([...sentence.tiles, ...traps]),
    // 문장은 읽고 어순을 생각할 시간이 필요하므로 단어보다 넉넉하게 (카드 3장 26초 ~ 8장 46초)
    seconds: Math.min(46, 14 + sentence.tiles.length * 4) + timeBonus(),
  };
}

function nextQuestion() {
  if (!battle) return;
  const word = nextWord();
  const sentence = Math.random() < sentenceRate(battle.stage) ? sentenceFor(word) : null;
  const q = sentence ? sentenceQuestion(word, sentence) : wordQuestion(word);
  battle.question = q;
  battle.busy = false;
  q.filled = []; // 채운 칸: 조각 인덱스

  bubbleKind.textContent = q.type === 'word' ? '問 중국어 단어는?' : '問 중국어로 말해 봐!';
  bubbleText.textContent = q.prompt;
  bubbleText.removeAttribute('lang');
  battleFeedback.textContent = '';
  setPlayerMood('normal');
  answerSlots.classList.toggle('sentence', q.type === 'sentence');
  tilePool.classList.toggle('sentence', q.type === 'sentence');
  renderTiles();
  startBattleTimer(q.seconds);
  renderBattleItems(); // 문제가 시작되면 시간 추가를 쓸 수 있음
}

// 내 말풍선: 답을 고르는 동안 지금까지 조립한 말을 보여 줌
function renderPlayerBubble() {
  const q = battle.question;
  const built = q.filled.map((i) => q.tiles[i]).join(q.type === 'sentence' ? ' ' : '');
  playerBubbleText.textContent = built || '음…';
  playerBubbleText.lang = built ? 'zh-CN' : 'ko';
  playerBubbleSub.textContent = built ? `${q.filled.length}/${q.answer.length}` : '';
}

function renderTiles() {
  const q = battle.question;
  if (!battle.busy) renderPlayerBubble();
  answerSlots.replaceChildren(...q.answer.map((_, i) => {
    const slot = document.createElement('button');
    slot.className = 'answer-slot';
    const tileIdx = q.filled[i];
    if (tileIdx !== undefined) {
      slot.textContent = q.tiles[tileIdx];
      slot.classList.add('filled');
      slot.addEventListener('click', () => {
        if (battle.busy) return;
        q.filled.splice(i, 1);
        Sfx.untap();
        renderTiles();
      });
    } else {
      slot.disabled = true;
      slot.setAttribute('aria-label', '빈칸');
    }
    slot.lang = 'zh-CN';
    return slot;
  }));

  tilePool.replaceChildren(...q.tiles.map((text, idx) => {
    const tile = document.createElement('button');
    tile.className = 'pool-tile';
    tile.lang = 'zh-CN';
    tile.textContent = text;
    const used = q.filled.includes(idx);
    tile.disabled = used || battle.busy;
    if (used) tile.classList.add('used');
    tile.addEventListener('click', () => placeTile(idx));
    return tile;
  }));
}

function placeTile(idx) {
  const q = battle && battle.question;
  if (!q || battle.busy || q.filled.includes(idx) || q.filled.length >= q.answer.length) return;
  q.filled.push(idx);
  Sfx.tap();
  ensureBgm(); // 터치(사용자 동작) 중에 배경음악이 멈춰 있으면 다시 켬 (모바일 정책상 이때 가능)
  renderTiles();
  if (q.filled.length === q.answer.length) checkAnswer();
}

function checkAnswer() {
  const q = battle.question;
  const built = q.filled.map((i) => q.tiles[i]).join('');
  let correct = built === q.answer.join('');
  // 뜻이 같은 다른 단어(星期日/星期天 등)를 만들어도 정답으로 인정
  if (!correct && q.type === 'word') {
    correct = wordsByLevel[battle.level].some((w) => w.hanzi === built && w.meaning === q.word.meaning);
  }
  resolveQuestion(correct, false);
}

function resolveQuestion(correct, timedOut) {
  const q = battle.question;
  const built = q.filled.map((i) => q.tiles[i]).join(q.type === 'sentence' ? ' ' : '');
  battle.busy = true;
  const remainRatio = stopBattleTimer();
  renderBattleItems();
  renderTiles();
  recordAnswer('words', battle.level, q.word.hanzi, correct);

  const answerText = q.type === 'word' ? q.word.hanzi : q.sentence.zh;
  const answerPinyin = q.type === 'word' ? q.word.pinyin : q.sentence.pinyin;
  const current = battle;

  if (correct) {
    // 빨리 풀수록 큰 데미지: 남은 시간 75% 이상 3, 45% 이상 2, 그 밖에는 1
    const tier = speedTier(remainRatio);
    const damage = tier.damage;
    battle.hp = Math.max(0, battle.hp - damage);
    // 내 캐릭터가 정답을 외치며 달려가 주먹으로 공격
    playerBubbleText.textContent = /[。！？!?]$/.test(answerText) ? answerText : `${answerText}!`;
    playerBubbleText.lang = 'zh-CN';
    playerBubbleSub.textContent = answerPinyin;
    bubbleKind.textContent = tier.kind;
    bubbleText.textContent = tier.cry;
    battleFeedback.textContent = `정답! ${answerText} ${answerPinyin}. 데미지 ${damage}`;
    if (damage === 3) criticalAttack(current, damage);
    else normalAttack(current, damage);
    if (q.type === 'word') speakHanzi(q.word.hanzi);
  } else {
    // 갑옷: 일정 확률로 몬스터의 공격을 막아 하트를 지킴 (정답 확인 창은 그대로 보여 줌)
    const guarded = Math.random() < guardChance();
    if (!guarded) battle.hearts -= 1;
    // 몬스터가 정답을 알려 주며 달려들어 공격
    playerBubbleText.textContent = guarded ? '갑옷으로 막았다!' : timedOut ? '앗, 시간이…!' : '으악!';
    playerBubbleText.lang = 'ko';
    playerBubbleSub.textContent = '';
    bubbleKind.textContent = timedOut ? '시간 초과! 정답은' : '틀렸다! 정답은';
    bubbleText.textContent = `${answerText} (${answerPinyin})`;
    bubbleText.lang = 'zh-CN';
    battleFeedback.textContent = `${timedOut ? '시간 초과' : '오답'}. 정답: ${answerText} ${answerPinyin}`;
    answerSlots.classList.add('shake');
    setTimeout(() => answerSlots.classList.remove('shake'), 450);
    monsterAttack(current, guarded);
    // 틀리면 정답 확인 창을 띄우고, 사용자가 확인을 눌러야 다음으로 넘어감
    setTimeout(() => {
      if (battle !== current) return;
      showAnswerReveal(q, timedOut, built);
    }, REVEAL_DELAY_MS);
    return;
  }

  setTimeout(() => {
    if (battle !== current) return; // 그사이 나갔거나 다른 스테이지를 시작함
    continueBattle();
  }, REVEAL_MS.correct);
}

// 다음 문제로 넘어가거나, 승패가 났으면 결과를 보여 줌
function continueBattle() {
  if (battle.hp <= 0) finishBattle(true);
  else if (battle.hearts <= 0) {
    // 부활권이 있고 이번 전투에서 아직 안 썼으면 물어봄
    if (!battle.revived && gamePlayer().supplies.revive > 0) showRevivePrompt();
    else finishBattle(false);
  } else nextQuestion();
}

// ---------- 전투 아이템 ----------
const battleItemsEl = document.getElementById('battle-items');
const revivePrompt = document.getElementById('revive-prompt');
const MAX_BATTLE_HEARTS = 5;
const TIME_ITEM_SECONDS = 10;

function renderBattleItems() {
  if (!battle) return;
  const p = gamePlayer();
  const items = [
    { id: 'heart', label: '하트 +1', usable: battle.hearts > 0 && battle.hearts < MAX_BATTLE_HEARTS },
    { id: 'time', label: `시간 +${TIME_ITEM_SECONDS}초`, usable: Boolean(battle.timer) && !battle.busy },
  ];
  battleItemsEl.replaceChildren(...items.map((it) => {
    const btn = document.createElement('button');
    btn.className = 'battle-item';
    btn.dataset.item = it.id;
    const count = p.supplies[it.id];
    btn.disabled = !count || !it.usable || battle.finished || battle.intro;
    btn.innerHTML = `${renderSupplyIcon(it.id)}<span>${it.label}</span><b>${count}</b>`;
    btn.setAttribute('aria-label', `${it.label} 사용, ${count}개 남음`);
    btn.addEventListener('click', () => useBattleItem(it.id));
    return btn;
  }), Object.assign(document.createElement('span'), {
    className: 'battle-item-revive',
    innerHTML: `${renderSupplyIcon('revive')}<b>${p.supplies.revive}</b>`,
    title: '부활권: 하트를 모두 잃으면 쓸 수 있어요',
  }));
}

function useBattleItem(id) {
  if (!battle || battle.finished) return;
  const p = gamePlayer();
  if (!p.supplies[id]) return;
  if (id === 'heart') {
    if (battle.hearts >= MAX_BATTLE_HEARTS) return;
    p.supplies.heart -= 1;
    battle.hearts += 1;
    battle.maxHearts = Math.max(battle.maxHearts, battle.hearts);
    Sfx.levelUp();
    showDamage(playerPop, `+1 ${uiIcon('heart')}`, true);
    flash('rgba(217,54,62,0.25)', 300);
  } else if (id === 'time') {
    if (!battle.timer || battle.busy) return;
    p.supplies.time -= 1;
    battle.timer.total += TIME_ITEM_SECONDS * 1000;
    Sfx.loot(1);
    showDamage(playerPop, `+${TIME_ITEM_SECONDS}초`);
    battleTimerFill.classList.add('time-added');
    setTimeout(() => battleTimerFill.classList.remove('time-added'), 700);
  }
  scheduleRecordSave();
  renderBattleStatus();
}

function showRevivePrompt() {
  const count = gamePlayer().supplies.revive;
  document.getElementById('revive-icon').innerHTML = renderSupplyIcon('revive');
  document.getElementById('revive-text').textContent = `부활권을 쓰면 하트를 가득 채워 다시 싸울 수 있어요. (가진 부활권 ${count}장 · 전투마다 한 번)`;
  revivePrompt.style.display = '';
  document.getElementById('btn-revive-yes').focus({ preventScroll: true });
}

document.getElementById('btn-revive-yes').addEventListener('click', () => {
  if (!battle || revivePrompt.style.display === 'none') return;
  const p = gamePlayer();
  revivePrompt.style.display = 'none';
  if (!p.supplies.revive) {
    finishBattle(false);
    return;
  }
  p.supplies.revive -= 1;
  scheduleRecordSave();
  battle.revived = true;
  battle.hearts = battle.maxHearts;
  setPlayerMood('win');
  playerBubbleText.textContent = '아직 끝나지 않았다!';
  playerBubbleText.lang = 'ko';
  playerBubbleSub.textContent = '';
  const c = centerOf(playerAvatarEl);
  if (!reduceMotion.matches) spawnFx('fx-guard', c.x, c.y - 10, 900, (el) => { el.innerHTML = renderSupplyIcon('revive'); });
  flash('rgba(242,213,138,0.6)', 500);
  Sfx.levelUp();
  renderBattleStatus();
  const current = battle;
  setTimeout(() => { if (battle === current) nextQuestion(); }, 900);
});

document.getElementById('btn-revive-no').addEventListener('click', () => {
  if (!battle) return;
  revivePrompt.style.display = 'none';
  finishBattle(false);
});

function showAnswerReveal(q, timedOut, built) {
  revealTitle.textContent = timedOut ? '시간이 다 됐어요' : '아쉬워요, 틀렸어요';
  if (q.type === 'word') {
    revealZh.textContent = q.word.hanzi;
    revealPinyin.textContent = q.word.pinyin;
    revealMeaning.textContent = q.word.meaning;
  } else {
    revealZh.textContent = q.sentence.zh;
    revealPinyin.textContent = q.sentence.pinyin;
    revealMeaning.textContent = q.sentence.ko;
  }
  revealZh.classList.toggle('sentence', q.type === 'sentence');
  revealMine.textContent = !timedOut && built ? `내 답: ${built}` : '';
  renderSentenceExplain(q, timedOut);
  btnRevealNext.textContent = battle.hearts <= 0 ? '결과 보기 →' : '확인, 다음 문제 →';
  battle.revealing = q;
  answerReveal.style.display = '';
  answerReveal.scrollTop = 0; // 해설이 길어도 맨 위(정답)부터 보이게
  btnRevealNext.focus({ preventScroll: true });
}

// 문장 문제를 틀렸을 때: 내 답(맞은 자리 초록·틀린 자리 빨강) → 정답 → 왜 틀렸는지 → 관련 문법 노트
const revealExplain = document.getElementById('reveal-explain');
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

function renderSentenceExplain(q, timedOut) {
  if (q.type !== 'sentence' || typeof GrammarNotes === 'undefined') {
    revealExplain.style.display = 'none';
    revealExplain.replaceChildren();
    return;
  }
  const userTiles = q.filled.map((i) => q.tiles[i]);
  const { marks, reasons, points } = GrammarNotes.explainSentence(q.answer, userTiles, timedOut);
  const tileRow = (items) => items.map(({ tile, ok }) => `<span class="ex-tile ${ok ? 'ok' : 'bad'}">${escapeHtml(tile)}</span>`).join('');
  const highlight = (tokens) => q.answer.map((t) => (tokens.includes(t)
    ? `<mark>${escapeHtml(t)}</mark>` : escapeHtml(t))).join('');
  revealMine.textContent = '';
  revealExplain.innerHTML = `
    ${userTiles.length ? `<div class="ex-row"><span class="ex-label">내 답</span><span class="ex-tiles" lang="zh-CN">${tileRow(marks)}</span></div>` : ''}
    <div class="ex-row"><span class="ex-label">정답</span><span class="ex-tiles" lang="zh-CN">${tileRow(q.answer.map((tile) => ({ tile, ok: true })))}</span></div>
    <div class="ex-why">
      <strong class="ex-heading"><i aria-hidden="true">解</i>왜 틀렸을까?</strong>
      <ul>${reasons.map((r) => `<li>${escapeHtml(r)}</li>`).join('')}</ul>
    </div>
    ${points.map((p) => `
      <div class="ex-note">
        <strong class="ex-heading"><i aria-hidden="true">法</i>${escapeHtml(p.title)}</strong>
        <span class="ex-formula">${escapeHtml(p.formula)}</span>
        <p>${escapeHtml(p.desc)}</p>
        <p class="ex-example" lang="zh-CN">${highlight(p.tokens)}</p>
      </div>`).join('')}`;
  revealExplain.style.display = '';
}

btnRevealNext.addEventListener('click', () => {
  if (!battle || !battle.revealing) return;
  battle.revealing = null;
  answerReveal.style.display = 'none';
  continueBattle();
});

document.getElementById('btn-reveal-speak').addEventListener('click', () => {
  const q = battle && battle.revealing;
  if (q) speakHanzi(q.type === 'word' ? q.word.hanzi : q.sentence.zh);
});

function showDamage(el, text, isHtml = false) {
  if (isHtml) el.innerHTML = text; // 고정 그림(uiIcon)만 들어감
  else el.textContent = text;
  el.classList.remove('show');
  void el.offsetWidth; // 애니메이션 다시 시작
  el.classList.add('show');
}

// 공격·피격 모션: 클래스를 붙였다가 애니메이션이 끝나면 뗌
function playMotion(fighter, motion) {
  const base = fighter === playerFighter ? 'fighter player-side' : 'fighter monster-side';
  fighter.className = base;
  void fighter.offsetWidth;
  fighter.className = `${base} ${motion}`;
  setTimeout(() => {
    if (fighter.className === `${base} ${motion}`) fighter.className = base;
  }, 700);
}

function hitMonster(strong) {
  monsterEl.classList.remove('appear', 'hit', 'hit-strong');
  void monsterEl.offsetWidth;
  monsterEl.classList.add(strong ? 'hit-strong' : 'hit');
  // 맞는 동안 찡그린 표정
  if (!battle || !battle.monsterArt) return;
  const current = battle;
  monsterEl.innerHTML = renderMonster(battle.monsterArt, 'hurt');
  clearTimeout(current.faceTimer);
  current.faceTimer = setTimeout(() => {
    if (battle === current && !current.exploded) monsterEl.innerHTML = renderMonster(current.monsterArt);
  }, strong ? 650 : 450);
}

// ---------- 타격 연출 ----------
// 무대(.battle-stage) 위의 효과 층에 불꽃·충격파·글자·섬광을 잠깐 그렸다가 지웁니다.
function centerOf(el) {
  const stage = battleStage.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2 - stage.left, y: r.top + r.height / 2 - stage.top, w: r.width };
}

function spawnFx(className, x, y, life = 900, setup) {
  const el = document.createElement('div');
  el.className = `fx ${className}`;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  if (setup) setup(el);
  fxLayer.appendChild(el);
  setTimeout(() => el.remove(), life);
  return el;
}

function stageEffect(className, ms) {
  battleStage.classList.remove(className);
  void battleStage.offsetWidth;
  battleStage.classList.add(className);
  setTimeout(() => battleStage.classList.remove(className), ms);
}

// 타격 순간 모든 움직임을 잠깐 멈춰 묵직한 손맛을 줌
function hitStop(ms) {
  battleStage.classList.add('hitstop');
  setTimeout(() => battleStage.classList.remove('hitstop'), ms);
}

function flash(color, ms = 350) {
  spawnFx('fx-flash', 0, 0, ms, (el) => el.style.setProperty('--flash', color));
}

// 효과음은 붓글씨 한자로 (破 깨뜨리다 · 击 치다 · 砰/嘭 쾅)
const IMPACT_WORDS = ['破!', '击!', '砰!', '嘭!'];
const SPARK_COLORS = ['#1F1A17', '#B8332A', '#C9A14A', '#F4EBDD']; // 먹·주홍·금박·한지

function impactBurst(x, y, { big = false, word } = {}) {
  spawnFx(big ? 'fx-impact big' : 'fx-impact', x, y, 500);
  spawnFx('fx-ring', x, y, 600, (el) => big && el.classList.add('big'));
  const sparks = big ? 16 : 10;
  for (let i = 0; i < sparks; i++) {
    const angle = (Math.PI * 2 * i) / sparks + Math.random() * 0.4;
    const dist = (big ? 90 : 60) + Math.random() * 40;
    spawnFx('fx-spark', x, y, 650, (el) => {
      el.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
      el.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
      el.style.setProperty('--c', SPARK_COLORS[i % SPARK_COLORS.length]);
      el.style.setProperty('--s', `${(big ? 8 : 6) + Math.random() * 5}px`);
    });
  }
  spawnFx(big ? 'fx-word big' : 'fx-word', x + (Math.random() * 30 - 15), y - 30, 800, (el) => {
    el.textContent = word || IMPACT_WORDS[Math.floor(Math.random() * IMPACT_WORDS.length)];
    el.style.setProperty('--r', `${Math.random() * 24 - 12}deg`);
  });
}

// 달려가는 동안 남는 잔상
function afterimages() {
  const avatar = centerOf(playerAvatarEl);
  [60, 120, 180].forEach((delay, i) => {
    setTimeout(() => {
      spawnFx('fx-ghost', avatar.x, avatar.y, 380, (el) => {
        el.innerHTML = playerAvatarEl.innerHTML;
        el.style.width = `${avatar.w}px`;
        el.style.setProperty('--gx', `${-(i + 1) * 0.22 * avatar.w}px`);
      });
    }, delay);
  });
}

// 일반(1)·빠른(2) 공격: 빠른 공격은 더 세게 맞고 화면도 더 흔들림
function normalAttack(current, damage) {
  const fast = damage >= 2;
  playMotion(playerFighter, 'attack');
  Sfx.whoosh(fast);
  if (!reduceMotion.matches) afterimages();
  setTimeout(() => {
    if (battle !== current) return;
    const m = centerOf(monsterEl);
    Sfx.punch(fast);
    hitStop(fast ? 120 : 90);
    hitMonster(fast);
    if (!reduceMotion.matches) {
      impactBurst(m.x, m.y, fast ? { word: '快!' } : {});
      stageEffect(fast ? 'shake-m' : 'shake-s', fast ? 400 : 350);
    }
    flash(fast ? 'rgba(201,161,74,0.45)' : 'rgba(244,235,221,0.6)', 250);
    showDamage(damagePop, fast ? `-${damage} 빠름!` : `-${damage}`);
    renderBattleStatus();
  }, ATTACK_MS);
}

// 크리티컬: 화면이 확대되고 "CRITICAL" 배너와 함께 3연타, 마지막 한 방에 큰 충격파
function criticalAttack(current, damage) {
  playMotion(playerFighter, 'attack critical');
  Sfx.whoosh(true);
  if (!reduceMotion.matches) {
    afterimages();
    stageEffect('crit-zoom', 900);
    const stage = battleStage.getBoundingClientRect();
    spawnFx('fx-banner', stage.width / 2, stage.height * 0.42, 1000, (el) => { el.textContent = '会心一击!'; });
  }
  CRIT_HITS_MS.forEach((ms, i) => {
    setTimeout(() => {
      if (battle !== current) return;
      const m = centerOf(monsterEl);
      const last = i === CRIT_HITS_MS.length - 1;
      if (last) Sfx.critical();
      else Sfx.punch(true);
      hitStop(last ? 140 : 60);
      hitMonster(last);
      if (!reduceMotion.matches) {
        impactBurst(m.x + (last ? 0 : (i ? 18 : -18)), m.y + (last ? 0 : (i ? -14 : 12)), last ? { big: true, word: '轰!!' } : {});
        stageEffect(last ? 'shake-l' : 'shake-s', last ? 500 : 250);
      }
      if (last) {
        flash('rgba(201,161,74,0.65)', 420);
        showDamage(damagePop, `-${damage} 会心!`);
        renderBattleStatus();
      }
    }, ms);
  });
}

// 몬스터 공격: 달려들어 할퀴기 → 붉은 섬광, 하트가 깨짐
function monsterAttack(current, guarded = false) {
  playMotion(monsterFighter, 'attack');
  Sfx.whoosh(false);
  setTimeout(() => {
    if (battle !== current) return;
    if (guarded) {
      // 갑옷이 공격을 튕겨 냄: 금빛 방패 + 쨍 소리, 하트는 그대로
      Sfx.guard();
      const p = centerOf(playerAvatarEl);
      hitStop(60);
      playMotion(playerFighter, 'guard');
      if (!reduceMotion.matches) {
        spawnFx('fx-guard', p.x - 18, p.y - 4, 750, (el) => {
          el.innerHTML = '<svg viewBox="0 0 60 70" aria-hidden="true"><path d="M30 4 L54 13 Q54 48 30 66 Q6 48 6 13 Z" fill="rgba(242,194,48,0.35)" stroke="#F2C230" stroke-width="4" stroke-linejoin="round"/><path d="M30 14 L44 20 Q44 44 30 56 Q16 44 16 20 Z" fill="none" stroke="#FFF6E6" stroke-width="2" opacity="0.8"/><text x="30" y="44" text-anchor="middle" font-size="20" fill="#8E241D" font-family="serif">守</text></svg>';
        });
        stageEffect('shake-l', 250);
      }
      flash('rgba(242,194,48,0.45)', 300);
      showDamage(playerPop, '막기!');
      renderBattleStatus();
      return;
    }
    Sfx.claw();
    const p = centerOf(playerAvatarEl);
    hitStop(80);
    setPlayerMood('hurt');
    playMotion(playerFighter, 'hurt');
    if (!reduceMotion.matches) {
      [-26, 0, 26].forEach((offset, i) => {
        setTimeout(() => spawnFx('fx-slash', p.x + offset, p.y - 6, 450), i * 50);
      });
      stageEffect('shake-m', 420);
      spawnFx('fx-heartbreak', p.x, p.y - 40, 900, (el) => { el.innerHTML = uiIcon('heartbreak'); });
    }
    flash('rgba(184,51,42,0.5)', 380);
    showDamage(playerPop, `-1 ${uiIcon('heart')}`, true);
    renderBattleStatus();
  }, ATTACK_MS);
}

// 마지막 일격: 몬스터가 폭발하며 사라짐
function monsterExplode() {
  Sfx.ko();
  if (battle && battle.monsterArt) monsterEl.innerHTML = renderMonster(battle.monsterArt, 'ko');

  const m = centerOf(monsterEl);
  monsterEl.classList.add('defeated');
  flash('rgba(244,235,221,0.9)', 500);
  if (reduceMotion.matches) return;
  stageEffect('shake-l', 600);
  impactBurst(m.x, m.y, { big: true, word: '胜!' });
  spawnFx('fx-ink', m.x, m.y, 1000); // 먹물이 사방으로 튀는 폭발
  setTimeout(() => impactBurst(m.x - 20, m.y + 10, { big: false, word: '破!' }), 150);
}

// ---------- 제한 시간 ----------
// 데미지 단계 눈금 위치 (남은 시간 비율 = 향 길이). 무기 보너스만큼 왼쪽으로 내려감
function placeTimerMarks() {
  const bonus = critBonus();
  [3, 2].forEach((dmg) => {
    const t = SPEED_TIERS.find((x) => x.damage === dmg);
    document.getElementById(`timer-mark-${dmg}`).style.left = `${Math.max(0, t.min - bonus) * 100}%`;
  });
}

function startBattleTimer(seconds) {
  stopBattleTimer();
  const total = seconds * 1000;
  const startAt = performance.now();
  battle.timer = { total, startAt, id: 0 };
  battleTimerFill.style.width = '100%';
  battleTimerFill.classList.remove('danger');
  placeTimerMarks();
  const tick = () => {
    if (!battle || !battle.timer) return;
    // 시간 추가 아이템이 total 을 늘릴 수 있으므로 매번 battle.timer 에서 읽음
    const left = Math.max(0, battle.timer.total - (performance.now() - battle.timer.startAt));
    const ratio = left / battle.timer.total;
    battleTimerFill.style.width = `${ratio * 100}%`;
    battleTimerFill.classList.toggle('danger', ratio < 0.3);
    // 지금 맞히면 들어갈 데미지 단계를 색으로 보여 줌
    battleTimerFill.dataset.tier = String(speedTier(ratio).damage);
    if (left <= 0) {
      battle.timer = null;
      resolveQuestion(false, true);
      return;
    }
    battle.timer.id = requestAnimationFrame(tick);
  };
  battle.timer.id = requestAnimationFrame(tick);
}

// 타이머를 멈추고 남은 시간 비율(0~1)을 돌려줌
function stopBattleTimer() {
  if (!battle || !battle.timer) return 0;
  cancelAnimationFrame(battle.timer.id);
  const { total, startAt } = battle.timer;
  battle.timer = null;
  return Math.max(0, total - (performance.now() - startAt)) / total;
}

// 화면을 벗어나면(앱 전환 등) 시간이 흐르지 않도록 문제를 다시 시작
document.addEventListener('visibilitychange', () => {
  if (document.hidden && battle && battle.timer && !battle.busy) {
    const q = battle.question;
    stopBattleTimer();
    battle.pausedSeconds = q.seconds;
  } else if (!document.hidden && battle && battle.pausedSeconds && !battle.busy) {
    startBattleTimer(battle.pausedSeconds);
    battle.pausedSeconds = null;
  }
});

// ---------- 결과 ----------
function finishBattle(won) {
  // 이겼으면 몬스터 폭발 연출을 먼저 보여 주고 결과 창을 띄움
  if (won && !battle.exploded) {
    battle.exploded = true;
    const current = battle;
    monsterExplode();
    setPlayerMood('win');
    playerBubbleText.textContent = battle.stage.final ? '마왕을 쓰러뜨렸다!' : battle.stage.boss ? '두목을 쓰러뜨렸다!' : '이겼다!';
    playerBubbleText.lang = 'ko';
    playerBubbleSub.textContent = '';
    // 폭발 → 胜！ 연출 → 결과 창
    setTimeout(() => {
      if (battle === current) playVictory(current.stage);
    }, 700);
    setTimeout(() => {
      if (battle !== current) return;
      hideVictory();
      finishBattle(true);
    }, 2700);
    return;
  }
  // 졌으면 패배 연출을 먼저 보여 줌
  if (!won && !battle.defeatShown) {
    battle.defeatShown = true;
    playDefeat(battle);
    return;
  }
  const { level, stage } = battle;
  stopBattleTimer();
  const stars = won ? Math.min(3, Math.max(1, battle.hearts)) : 0; // 하트를 늘려도 별은 최대 3개
  const total = levelStages(level).length;
  const replay = stage.no <= gameProgress(level).cleared; // 이미 클리어했던 스테이지
  if (won) {
    saveStageClear(level, stage.no, stars);
    syncMyProgress();
    // 마왕을 물리치면 칭호
    const earned = stage.final ? grantMasterTitle(level) : [];
    showTitleEarned(earned);
    if (earned.length) syncProfileTitle();
    showRewards(makeStageRewards(level, stage, stars, replay), replay);
  } else {
    showTitleEarned([]);
    rewardArea.style.display = 'none';
    resultButtons.style.display = '';
  }
  flushRecordSave();

  // 낙관 도장: 이기면 '胜', 지면 '败'
  battleResultIcon.textContent = won ? '胜' : '败';
  battleResultIcon.className = `battle-result-icon result-seal ${won ? 'win' : 'lose'}`;
  battleResultTitle.textContent = won ? (stage.final ? '마왕 격파!' : stage.boss ? '보스 격파!' : '스테이지 클리어!') : '패배했어요…';
  battleResultStars.textContent = won ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : '';
  battleResultText.textContent = won
    ? (stage.final ? `HSK ${level}급 마왕을 물리쳤어요! 이 급수의 모든 단어를 정복했어요!`
      : stage.no === total - 1 ? '모든 챕터를 마쳤어요. 마왕성의 문이 열렸어요!'
      : stage.boss ? `챕터 ${stage.chapter}를 마쳤어요. 다음 챕터가 열렸어요!` : '다음 스테이지가 열렸어요.')
    : '틀린 단어는 오답 노트에 모였어요. 다시 도전해 보세요!';
  btnBattleNext.style.display = won && stage.no < total ? '' : 'none';
  if (!won) setPlayerMood('hurt');
  battleResult.style.display = '';
  battle.finished = true;
}

// ---------- 클리어 보상 ----------
// 1) 결과 창: 기본 경험치·코인과 '얻은 상자'만 보여 줌
// 2) 상자 열기 화면: 사용자가 상자를 누르면 흔들리다 열리고, 보상이 상자에서 튀어나와 카드로 뒤집힘
const rewardArea = document.getElementById('reward-area');
const rewardBase = document.getElementById('reward-base');
const chestGot = document.getElementById('chest-got');
const chestArt = document.getElementById('chest-art');
const chestName = document.getElementById('chest-name');
const btnGoOpen = document.getElementById('btn-go-open');
const resultButtons = document.getElementById('battle-result-buttons');
const chestOpen = document.getElementById('chest-open');
const chestOpenTitle = document.getElementById('chest-open-title');
const chestStage = document.getElementById('chest-stage');
const chestBig = document.getElementById('chest-big');
const chestBigArt = document.getElementById('chest-big-art');
const chestParticles = document.getElementById('chest-particles');
const chestOpenHint = document.getElementById('chest-open-hint');
const chestLoot = document.getElementById('chest-loot');
const levelUpEl = document.getElementById('level-up');
const lootButtons = document.getElementById('loot-buttons');
let pendingRewards = null;
const LOOT_GAP_MS = 380; // 보상이 하나씩 튀어나오는 간격

// 결과 창: 새로 얻은 칭호를 두루마리처럼 펼쳐 보여 줌
function showTitleEarned(earned) {
  const el = document.getElementById('title-earned');
  if (!earned.length) {
    el.style.display = 'none';
    el.replaceChildren();
    return;
  }
  const equippedId = gamePlayer().equip.title;
  el.innerHTML = earned.map((t) => `
    <div class="title-earned-row">
      <span class="title-earned-label">칭호 획득!</span>
      ${titleBadgeHtml(t)}
      <small>${equippedId === t.id ? '닉네임 옆에 달았어요 · 가방 › 칭호에서 바꿀 수 있어요' : '가방 › 칭호에서 착용할 수 있어요'}</small>
    </div>`).join('');
  el.style.display = '';
  Sfx.levelUp();
}

function showRewards(rewards, replay) {
  pendingRewards = rewards;
  rewardArea.style.display = '';
  rewardBase.innerHTML = `${uiIcon('exp')} +${rewards.base.exp} EXP · ${uiIcon('coin')} +${rewards.base.coins}${replay ? ' (다시 클리어)' : ''}`;
  chestArt.innerHTML = renderChest(rewards.tier);
  chestName.textContent = rewards.chest.name;
  chestGot.className = `chest-box chest-got tier-${rewards.chest.id}`;
  resultButtons.style.display = 'none'; // 상자를 열어야 다음으로
}

// 상자를 열지 않고 나가면(뒤로 가기·✕) 보상은 그대로 받게 함
function claimPendingRewards() {
  if (!pendingRewards) return;
  applyRewards(pendingRewards);
  pendingRewards = null;
  flushRecordSave();
}

function hideChestOpen() {
  chestOpen.style.display = 'none';
  chestLoot.replaceChildren();
  chestParticles.replaceChildren();
}

btnGoOpen.addEventListener('click', () => {
  if (!pendingRewards) return;
  const rewards = pendingRewards;
  battleResult.style.display = 'none';
  chestOpenTitle.textContent = rewards.chest.name;
  chestBigArt.innerHTML = renderChest(rewards.tier);
  chestStage.className = `chest-stage tier-${rewards.chest.id} waiting`;
  chestBig.disabled = false;
  chestOpenHint.textContent = '상자를 눌러 열어 보세요!';
  chestOpenHint.style.display = '';
  chestLoot.replaceChildren();
  chestParticles.replaceChildren();
  levelUpEl.style.display = 'none';
  lootButtons.style.display = 'none';
  document.getElementById('btn-loot-next').style.display = btnBattleNext.style.display;
  chestOpen.style.display = '';
  chestBig.focus();
});

// 보상 카드: 뒷면(낙관 '?')으로 날아와서 앞면으로 뒤집힘
function lootCard(item) {
  const card = document.createElement('div');
  card.className = `loot-item ${item.type}`;
  const inner = document.createElement('div');
  inner.className = 'loot-inner';
  const back = document.createElement('div');
  back.className = 'loot-face loot-back';
  back.textContent = '宝';
  const front = document.createElement('div');
  front.className = 'loot-face loot-front';
  const icon = document.createElement('span');
  icon.className = 'loot-icon';
  const label = document.createElement('span');
  label.className = 'loot-label';
  if (item.type === 'exp') {
    icon.innerHTML = uiIcon('exp');
    label.textContent = `+${item.amount} EXP`;
  } else if (item.type === 'coins') {
    icon.innerHTML = uiIcon('coin');
    label.textContent = `+${item.amount}`;
  } else {
    const g = item.gear;
    card.style.setProperty('--rarity', RARITIES[g.rarity].color);
    card.classList.add(`rarity-${RARITIES[g.rarity].id}`);
    icon.innerHTML = renderGearIcon(g.id);
    const name = document.createElement('strong');
    name.textContent = g.name;
    const sub = document.createElement('small');
    sub.textContent = item.duplicate ? `중복 → 코인 +${item.duplicate}` : `${RARITIES[g.rarity].name} · ${gearEffectText(g)}`;
    label.append(name, sub);
    if (item.isNew) {
      const badge = document.createElement('span');
      badge.className = 'loot-new';
      badge.textContent = 'NEW';
      front.appendChild(badge);
    }
  }
  front.prepend(icon, label);
  inner.append(back, front);
  card.appendChild(inner);
  return card;
}

// 상자가 열릴 때 금빛 조각·엽전이 사방으로 튐
function chestBurst(tier) {
  const count = 10 + tier * 4;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('span');
    p.className = 'chest-particle';
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.4;
    const dist = 70 + Math.random() * (60 + tier * 15);
    p.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    p.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
    p.style.setProperty('--d', `${Math.random() * 0.15}s`);
    if (Math.random() < 0.35) p.innerHTML = uiIcon('coin');
    chestParticles.appendChild(p);
  }
  setTimeout(() => chestParticles.replaceChildren(), 1400);
}

// 카드 하나를 상자에서 포물선으로 날려 제자리에 놓고 뒤집기
function flyLoot(card, index, rarity = -1) {
  const from = chestBig.getBoundingClientRect();
  const to = card.getBoundingClientRect();
  const dx = from.left + from.width / 2 - (to.left + to.width / 2);
  const dy = from.top + from.height * 0.45 - (to.top + to.height / 2);
  const delay = index * LOOT_GAP_MS;
  if (reduceMotion.matches || !card.animate) {
    card.classList.add('landed', 'flipped');
    return;
  }
  card.animate([
    { transform: `translate(${dx}px, ${dy}px) scale(0.2) rotate(-200deg)`, opacity: 0 },
    { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 90}px) scale(1.15) rotate(-40deg)`, opacity: 1, offset: 0.55 },
    { transform: 'translate(0, 0) scale(1) rotate(0deg)', opacity: 1 },
  ], { duration: 700, delay, easing: 'cubic-bezier(0.25, 0.8, 0.35, 1)', fill: 'backwards' });
  setTimeout(() => {
    card.classList.add('landed');
    Sfx.loot(rarity);
  }, delay + 700);
  setTimeout(() => card.classList.add('flipped'), delay + 820);
}

chestBig.addEventListener('click', () => {
  if (!pendingRewards || chestBig.disabled) return;
  const rewards = pendingRewards;
  pendingRewards = null;
  chestBig.disabled = true;
  chestOpenHint.textContent = '두근두근…';
  chestStage.className = `chest-stage tier-${rewards.chest.id} opening`;
  Sfx.chestShake();

  setTimeout(() => {
    const result = applyRewards(rewards);
    flushRecordSave();
    chestBigArt.innerHTML = renderChest(rewards.tier, true);
    chestStage.className = `chest-stage tier-${rewards.chest.id} opened`;
    Sfx.chestOpen(rewards.tier);
    chestOpenHint.style.display = 'none';
    if (!reduceMotion.matches) chestBurst(rewards.tier);

    // 카드를 먼저 자리에 놓고(보이지 않게) 상자에서 날아오게 함
    const cards = rewards.contents.map(lootCard);
    chestLoot.replaceChildren(...cards);
    cards.forEach((card, i) => flyLoot(card, i, rewards.contents[i].type === 'gear' ? rewards.contents[i].gear.rarity : -1));

    const done = rewards.contents.length * LOOT_GAP_MS + 1000;
    setTimeout(() => {
      if (result.levelUp) {
        levelUpEl.textContent = `升级! 레벨 업! Lv.${result.level}`;
        Sfx.levelUp();
        levelUpEl.style.display = '';
      }
      lootButtons.style.display = '';
      lootButtons.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, done);
  }, 950);
});

document.getElementById('btn-loot-next').addEventListener('click', () => btnBattleNext.click());
document.getElementById('btn-loot-retry').addEventListener('click', () => btnBattleRetry.click());
document.getElementById('btn-loot-map').addEventListener('click', () => document.getElementById('btn-battle-map').click());

btnBattleNext.addEventListener('click', () => {
  if (!battle) return;
  startBattle(battle.level, battle.stage.no + 1);
});
btnBattleRetry.addEventListener('click', () => {
  if (!battle) return;
  startBattle(battle.level, battle.stage.no);
});
document.getElementById('btn-battle-map').addEventListener('click', () => openGameMap());
document.getElementById('btn-battle-exit').addEventListener('click', () => {
  if (battle && !battle.finished && !confirm('스테이지를 나갈까요? 진행 중인 전투는 저장되지 않아요.')) return;
  openGameMap();
});
document.getElementById('btn-game-home').addEventListener('click', () => showScreen('start'));
// 캐릭터를 아직 안 만들고 '뒤로'를 누르면 처음 화면으로
document.getElementById('btn-avatar-back').addEventListener('click', () => {
  if (!getAvatar()) showScreen('start');
});
btnGameMode.addEventListener('click', () => {
  openGameMap();
  ensureBgm();
});

// 게임 화면에서는 화면을 누를 때마다(모바일은 사용자 동작 중에만 소리를 다시 켤 수 있음)
// 그리고 몇 초마다 배경음악이 멈춰 있지 않은지 확인해서 다시 재생
const gameScreenEl = document.getElementById('game-screen');
gameScreenEl.addEventListener('pointerdown', () => ensureBgm(), { passive: true });
gameScreenEl.addEventListener('touchend', () => ensureBgm(), { passive: true });
setInterval(() => {
  if (gameScreenEl.style.display !== 'none' && !document.hidden) ensureBgm();
}, 3000);
document.getElementById('btn-bag').addEventListener('click', () => openBag(() => renderPlayerCard()));
document.getElementById('btn-shop').addEventListener('click', () => openShop(() => renderPlayerCard()));
document.getElementById('btn-avatar-edit').addEventListener('click', () => {
  gameMap.style.display = 'none';
  openAvatarMaker(() => openGameMap());
});

// 안드로이드 뒤로 가기 (app.js handleBackButton 에서 호출)
function gameHandleBack() {
  if (shopModal.style.display !== 'none') {
    document.getElementById('btn-shop-close').click();
  } else if (bagModal.style.display !== 'none') {
    document.getElementById('btn-bag-close').click();
  } else if (gameBattle.style.display !== 'none') {
    openGameMap();
  } else if (avatarMaker.style.display !== 'none') {
    avatarMaker.style.display = 'none';
    if (getAvatar()) openGameMap();
    else showScreen('start');
  } else {
    showScreen('start');
  }
}

// 화면을 떠나면 진행 중인 전투 타이머 정리
const _showScreenForGame = showScreen;
// eslint-disable-next-line no-global-assign
showScreen = function (name) {
  if (name !== 'game') claimPendingRewards();
  if (name !== 'game' && battle) {
    stopBattleTimer();
    battle = null;
  }
  // 게임 화면에서는 컴퓨터 화면에 맞게 넓게 표시
  appContainer.classList.toggle('game-wide', name === 'game');
  if (name === 'start') refreshTitleDisplays();
  _showScreenForGame(name);
};
