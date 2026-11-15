// ========================================
// 게임 모드 — 스테이지를 클리어하며 몬스터를 물리치는 단어·문장 조립 게임
// ========================================
// app.js 다음에 불러오는 일반 스크립트로, app.js 의 전역(wordsByLevel, userRecord, showScreen,
// recordAnswer, loadExamples, speakHanzi, shuffle 등)을 그대로 씁니다.
//
// 구성
//   - 급수마다 단어를 STAGE_WORDS 개씩 나눠 한 스테이지로 삼습니다.
//   - 학습 스테이지 6개 + 보스 스테이지 1개가 한 챕터예요. 보스는 그 챕터 6개 스테이지의 단어를 모두 복습합니다.
//   - 몬스터가 한국어 뜻(또는 예문 해석)을 내면 제한 시간 안에 글자 조각으로 단어를,
//     단어 카드로 문장을 조립해 답합니다. 맞히면 몬스터 체력이 줄고, 틀리거나 시간이 다 되면 생명이 줄어요.
//   - 진행 기록: userRecord.game = { 급수: { cleared: 클리어한 마지막 스테이지 번호, stars: { 스테이지: 별 1~3 } } }

const STAGE_WORDS = 10; // 학습 스테이지 하나에 나오는 단어 수
const STAGES_PER_CHAPTER = 6; // 보스 전까지의 학습 스테이지 수
const PLAYER_HEARTS = 3;
const MONSTER_HP = { normal: 12, boss: 20 }; // 크리티컬(2)을 섞어 학습 스테이지는 문제 8~12개쯤
const SENTENCE_RATE = { normal: 0.3, boss: 0.45 }; // 문장 조립 문제가 나올 확률
const MAX_SENTENCE_TILES = 8;
const REVEAL_MS = { correct: 1300, wrong: 2300 }; // 답을 보여 주는 시간

const MONSTERS = [
  { icon: '👾', name: '꼬마 외계인' },
  { icon: '👻', name: '장난꾸러기 유령' },
  { icon: '🦇', name: '밤의 박쥐' },
  { icon: '🐙', name: '먹물 문어' },
  { icon: '🦂', name: '사막 전갈' },
  { icon: '🐺', name: '회색 늑대' },
  { icon: '🧟', name: '느림보 좀비' },
  { icon: '🦖', name: '아기 공룡' },
  { icon: '🕷️', name: '거미 여왕' },
  { icon: '🐍', name: '독뱀' },
];
const BOSSES = [
  { icon: '🐉', name: '한자 드래곤' },
  { icon: '👹', name: '단어 도깨비' },
  { icon: '🧙', name: '문장 마법사' },
  { icon: '🤖', name: '병음 로봇' },
];

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
  return stages;
}

function stageWords(level, stage) {
  const words = levelStageWords(level);
  return stage.chunks.flatMap((k) => words.slice(k * STAGE_WORDS, (k + 1) * STAGE_WORDS));
}

function stageMonster(stage) {
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
  if (level) gameLevel = level;
  stopBattleTimer();
  battle = null;
  gameBattle.style.display = 'none';
  gameMap.style.display = '';
  showScreen('game');
  renderGameMap();
}

function renderGameMap() {
  gameLevelTabs.replaceChildren(...[1, 2, 3, 4, 5, 6].map((l) => {
    const btn = document.createElement('button');
    btn.className = 'game-level-tab' + (l === gameLevel ? ' active' : '');
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', String(l === gameLevel));
    btn.textContent = `HSK ${l}`;
    btn.addEventListener('click', () => {
      gameLevel = l;
      renderGameMap();
    });
    return btn;
  }));

  const stages = levelStages(gameLevel);
  const prog = gameProgress(gameLevel);
  const totalStars = Object.values(prog.stars).reduce((a, b) => a + b, 0);
  gameMapSummary.textContent = `HSK ${gameLevel}급 · 스테이지 ${Math.min(prog.cleared, stages.length)}/${stages.length} 클리어 · ⭐ ${totalStars}`;

  const nextNo = prog.cleared + 1;
  const chapters = [];
  for (let c = 1; c <= chapterCount(gameLevel); c++) {
    const card = document.createElement('section');
    card.className = 'game-chapter';
    const head = document.createElement('h3');
    head.className = 'game-chapter-title';
    head.textContent = `챕터 ${c}`;
    const path = document.createElement('div');
    path.className = 'stage-path';
    stages.filter((s) => s.chapter === c).forEach((s) => {
      const node = document.createElement('button');
      const cleared = s.no <= prog.cleared;
      const open = s.no === nextNo;
      node.className = 'stage-node' + (s.boss ? ' boss' : '') + (cleared ? ' cleared' : '') + (open ? ' current' : '') + (!cleared && !open ? ' locked' : '');
      node.disabled = !cleared && !open;
      const stars = prog.stars[s.no] || 0;
      const icon = document.createElement('span');
      icon.className = 'stage-node-icon';
      icon.textContent = s.boss ? (cleared ? '👑' : stageMonster(s).icon) : (!cleared && !open ? '🔒' : String(s.no));
      const label = document.createElement('span');
      label.className = 'stage-node-label';
      label.textContent = s.boss ? '보스' : `${c}-${s.pos}`;
      const starEl = document.createElement('span');
      starEl.className = 'stage-node-stars';
      starEl.textContent = cleared ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : '';
      node.append(icon, label, starEl);
      node.setAttribute('aria-label', `${s.boss ? `챕터 ${c} 보스` : `스테이지 ${c}-${s.pos}`}${cleared ? `, 별 ${stars}개` : node.disabled ? ', 잠김' : ''}`);
      node.addEventListener('click', () => startBattle(gameLevel, s.no));
      path.appendChild(node);
    });
    card.append(head, path);
    chapters.push(card);
  }
  gameChapters.replaceChildren(...chapters);

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
  const kind = stage.boss ? 'boss' : 'normal';
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
    queue: [],
    question: null,
    busy: false,
    timer: null,
  };

  gameMap.style.display = 'none';
  gameBattle.style.display = '';
  battleResult.style.display = 'none';
  gameBattle.classList.toggle('boss-battle', stage.boss);
  battleTitle.textContent = stage.boss ? `챕터 ${stage.chapter} 보스` : `스테이지 ${stage.chapter}-${stage.pos}`;
  monsterName.textContent = `${monster.name}${stage.boss ? ' 👑' : ''}`;
  monsterEl.textContent = monster.icon;
  monsterEl.className = 'monster appear';
  showScreen('game');
  renderBattleStatus();
  nextQuestion();
}

function renderBattleStatus() {
  battleHearts.textContent = '❤️'.repeat(battle.hearts) + '🤍'.repeat(PLAYER_HEARTS - battle.hearts);
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
    seconds: 8 + answer.length * 4,
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
    seconds: Math.min(32, 8 + sentence.tiles.length * 3),
  };
}

function nextQuestion() {
  if (!battle) return;
  const word = nextWord();
  const sentence = Math.random() < SENTENCE_RATE[battle.kind] ? sentenceFor(word) : null;
  const q = sentence ? sentenceQuestion(word, sentence) : wordQuestion(word);
  battle.question = q;
  battle.busy = false;
  q.filled = []; // 채운 칸: 조각 인덱스

  bubbleKind.textContent = q.type === 'word' ? '🔤 이 뜻의 중국어 단어를 만들어라!' : '✍️ 이 문장을 중국어로 조립해라!';
  bubbleText.textContent = q.prompt;
  battleFeedback.replaceChildren();
  battleFeedback.className = 'battle-feedback';
  answerSlots.classList.toggle('sentence', q.type === 'sentence');
  tilePool.classList.toggle('sentence', q.type === 'sentence');
  renderTiles();
  startBattleTimer(q.seconds);
}

function renderTiles() {
  const q = battle.question;
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
  battle.busy = true;
  const remainRatio = stopBattleTimer();
  renderTiles();
  recordAnswer('words', battle.level, q.word.hanzi, correct);

  const answerText = q.type === 'word' ? q.word.hanzi : q.sentence.zh;
  const answerPinyin = q.type === 'word' ? q.word.pinyin : q.sentence.pinyin;
  const head = document.createElement('strong');
  const zh = document.createElement('span');
  zh.className = 'feedback-zh';
  zh.lang = 'zh-CN';
  zh.textContent = answerText;
  const py = document.createElement('span');
  py.className = 'feedback-py';
  py.textContent = answerPinyin;

  if (correct) {
    // 남은 시간이 60% 이상이면 크리티컬 (2 데미지)
    const damage = remainRatio >= 0.6 ? 2 : 1;
    battle.hp = Math.max(0, battle.hp - damage);
    head.textContent = damage === 2 ? '⚡ 크리티컬! ' : '⚔️ 공격 성공! ';
    battleFeedback.className = 'battle-feedback correct';
    showDamage(damage === 2 ? `-${damage} CRITICAL` : `-${damage}`);
    hitMonster();
    if (q.type === 'word') speakHanzi(q.word.hanzi);
  } else {
    battle.hearts -= 1;
    head.textContent = timedOut ? '⏰ 시간 초과! 정답: ' : '💥 반격을 받았어요! 정답: ';
    battleFeedback.className = 'battle-feedback wrong';
    answerSlots.classList.add('shake');
    setTimeout(() => answerSlots.classList.remove('shake'), 450);
    gameBattle.classList.add('player-hit');
    setTimeout(() => gameBattle.classList.remove('player-hit'), 450);
  }
  battleFeedback.replaceChildren(head, zh, py);
  renderBattleStatus();

  const current = battle;
  setTimeout(() => {
    if (battle !== current) return; // 그사이 나갔거나 다른 스테이지를 시작함
    if (battle.hp <= 0) finishBattle(true);
    else if (battle.hearts <= 0) finishBattle(false);
    else nextQuestion();
  }, correct ? REVEAL_MS.correct : REVEAL_MS.wrong);
}

function showDamage(text) {
  damagePop.textContent = text;
  damagePop.classList.remove('show');
  void damagePop.offsetWidth; // 애니메이션 다시 시작
  damagePop.classList.add('show');
}

function hitMonster() {
  monsterEl.classList.remove('appear', 'hit');
  void monsterEl.offsetWidth;
  monsterEl.classList.add('hit');
}

// ---------- 제한 시간 ----------
function startBattleTimer(seconds) {
  stopBattleTimer();
  const total = seconds * 1000;
  const startAt = performance.now();
  battle.timer = { total, startAt, id: 0 };
  battleTimerFill.style.width = '100%';
  battleTimerFill.classList.remove('danger');
  const tick = () => {
    if (!battle || !battle.timer) return;
    const left = Math.max(0, total - (performance.now() - startAt));
    battleTimerFill.style.width = `${(left / total) * 100}%`;
    battleTimerFill.classList.toggle('danger', left / total < 0.3);
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
  const { level, stage } = battle;
  stopBattleTimer();
  const stars = won ? battle.hearts : 0;
  const total = levelStages(level).length;
  if (won) saveStageClear(level, stage.no, stars);
  flushRecordSave();

  battleResultIcon.textContent = won ? (stage.boss ? '👑' : '🎉') : '💀';
  battleResultTitle.textContent = won ? (stage.boss ? '보스 격파!' : '스테이지 클리어!') : '패배했어요…';
  battleResultStars.textContent = won ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : '';
  battleResultText.textContent = won
    ? (stage.no >= total ? `HSK ${level}급의 모든 스테이지를 클리어했어요! 🏆` : stage.boss ? `챕터 ${stage.chapter}를 마쳤어요. 다음 챕터가 열렸어요!` : '다음 스테이지가 열렸어요.')
    : '틀린 단어는 오답 노트에 모였어요. 다시 도전해 보세요!';
  btnBattleNext.style.display = won && stage.no < total ? '' : 'none';
  if (won) monsterEl.classList.add('defeated');
  battleResult.style.display = '';
  battle.finished = true;
}

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
btnGameMode.addEventListener('click', () => openGameMap());

// 안드로이드 뒤로 가기 (app.js handleBackButton 에서 호출)
function gameHandleBack() {
  if (gameBattle.style.display !== 'none') openGameMap();
  else showScreen('start');
}

// 화면을 떠나면 진행 중인 전투 타이머 정리
const _showScreenForGame = showScreen;
// eslint-disable-next-line no-global-assign
showScreen = function (name) {
  if (name !== 'game' && battle) {
    stopBattleTimer();
    battle = null;
  }
  _showScreenForGame(name);
};
