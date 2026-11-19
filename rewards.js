// ========================================
// 게임 모드 보상 — 경험치·레벨, 코인, 보상 상자, 장비(무기·모자)
// ========================================
// avatar.js 다음, stage-game.js 앞에 불러오는 일반 스크립트입니다.
// 저장 위치: userRecord.game.player = { exp: 누적 경험치, coins, items: { 장비 id: true }, equip: { weapon, hat } }
//
// 보상 규칙
//   - 클리어 기본 보상(경험치·코인)은 급수가 높을수록, 뒤쪽 챕터일수록, 보스일수록, 별이 많을수록 커집니다.
//   - 클리어하면 상자 하나를 받습니다. 상자 등급(낡은 → 일반 → 반짝이는 → 금 → 다이아몬드)도 같은 조건으로 좋아지고,
//     등급이 높을수록 들어 있는 보상 개수가 많고 장비가 나올 확률이 높아요.
//   - 이미 클리어한 스테이지를 다시 깨면 보상이 줄어듭니다(반복 사냥 방지).
//   - 이미 가진 장비가 다시 나오면 코인으로 바꿔 줍니다.

const LEVEL_MULT = { 1: 1, 2: 1.3, 3: 1.7, 4: 2.2, 5: 2.8, 6: 3.5 };
const REPLAY_RATE = 0.35; // 다시 클리어할 때 보상 비율

// 동양풍 보물함: 낡은 나무함 · 붉은 옻칠함 · 청자빛 함 · 금박 함 · 수정 함
const CHESTS = [
  { id: 'worn', name: '낡은 상자', slots: [1, 1], gear: 0.12, color: '#7A5C3E', trim: '#4A3828' },
  { id: 'common', name: '일반 상자', slots: [2, 2], gear: 0.2, color: '#A8342B', trim: '#C9A14A' },
  { id: 'shiny', name: '반짝이는 상자', slots: [2, 3], gear: 0.32, color: '#5E9C8E', trim: '#E6F2EE' },
  { id: 'gold', name: '금 상자', slots: [3, 3], gear: 0.45, color: '#D4A83A', trim: '#FFF0B3' },
  { id: 'diamond', name: '다이아몬드 상자', slots: [3, 4], gear: 0.6, color: '#7FD3E6', trim: '#F4FDFF' },
];

const RARITIES = [
  { id: 'common', name: '일반', color: '#8E8E93' },
  { id: 'uncommon', name: '고급', color: '#3DAA6D' },
  { id: 'rare', name: '희귀', color: '#4A7FD9' },
  { id: 'epic', name: '영웅', color: '#8A5CC0' },
  { id: 'legendary', name: '전설', color: '#E3A92B' },
];

// 장비 칸 4개
//   무기: 빠른 공격(데미지 ×2·×3) 판정이 쉬워짐 (남은 시간 기준을 낮춤)
//   머리(모자·투구): 제한 시간이 늘어남
//   갑옷: 틀려도 일정 확률로 공격을 막아 하트를 지킴
//   바지: 클리어 보상(경험치·코인)이 늘어남
const GEAR_SLOTS = [
  { id: 'weapon', name: '무기', empty: '맨손' },
  { id: 'hat', name: '머리', empty: '맨머리' },
  { id: 'armor', name: '갑옷', empty: '도포만' },
  { id: 'pants', name: '바지', empty: '기본 바지' },
];
const SLOT_NAME = { weapon: '무기', hat: '모자', helmet: '투구', armor: '갑옷', pants: '바지' };
const GEAR = [
  { id: 'stick', slot: 'weapon', rarity: 0, name: '나무 막대기', crit: 0.04 },
  { id: 'glove', slot: 'weapon', rarity: 0, name: '가죽 장갑', crit: 0.05 },
  { id: 'woodsword', slot: 'weapon', rarity: 1, name: '목검', crit: 0.08 },
  { id: 'knuckle', slot: 'weapon', rarity: 1, name: '쇠 너클', crit: 0.09 },
  { id: 'brush', slot: 'weapon', rarity: 2, name: '서예 붓', crit: 0.12 },
  { id: 'bronzesword', slot: 'weapon', rarity: 2, name: '청동검', crit: 0.13 },
  { id: 'goldbrush', slot: 'weapon', rarity: 3, name: '황금 붓', crit: 0.17 },
  { id: 'dragonbrush', slot: 'weapon', rarity: 4, name: '용의 붓', crit: 0.22 },
  { id: 'dagger', slot: 'weapon', rarity: 1, name: '비수', crit: 0.08 },
  { id: 'spear', slot: 'weapon', rarity: 2, name: '장창', crit: 0.13 },
  { id: 'glaive', slot: 'weapon', rarity: 3, name: '청룡언월도', crit: 0.18 },
  { id: 'jadesword', slot: 'weapon', rarity: 4, name: '옥룡검', crit: 0.23 },
  { id: 'straw', slot: 'hat', rarity: 0, name: '밀짚모자', time: 1 },
  { id: 'cap', slot: 'hat', rarity: 0, name: '야구 모자', time: 1 },
  { id: 'band', slot: 'hat', rarity: 1, name: '무사 머리띠', time: 1.5 },
  { id: 'gradcap', slot: 'hat', rarity: 2, name: '학사모', time: 2 },
  { id: 'scholar', slot: 'hat', rarity: 3, name: '선비 갓', time: 3 },
  { id: 'crown', slot: 'hat', rarity: 4, name: '황금 왕관', time: 4 },
  // 투구 (머리 칸)
  { id: 'leatherhelm', slot: 'hat', kind: 'helmet', rarity: 1, name: '가죽 투구', time: 1.5 },
  { id: 'ironhelm', slot: 'hat', kind: 'helmet', rarity: 2, name: '철 투구', time: 2 },
  { id: 'generalhelm', slot: 'hat', kind: 'helmet', rarity: 3, name: '장군 투구', time: 3 },
  { id: 'dragonhelm', slot: 'hat', kind: 'helmet', rarity: 4, name: '용린 투구', time: 4 },
  // 갑옷
  { id: 'paddedarmor', slot: 'armor', rarity: 0, name: '누비 갑옷', guard: 0.08 },
  { id: 'leatherarmor', slot: 'armor', rarity: 1, name: '가죽 갑옷', guard: 0.12 },
  { id: 'scalearmor', slot: 'armor', rarity: 2, name: '비늘 갑옷', guard: 0.16 },
  { id: 'lamellar', slot: 'armor', rarity: 3, name: '장수 찰갑', guard: 0.2 },
  { id: 'goldarmor', slot: 'armor', rarity: 4, name: '황금 용갑', guard: 0.25 },
  // 바지
  { id: 'cottonpants', slot: 'pants', rarity: 0, name: '무명 바지', bonus: 0.05 },
  { id: 'trainpants', slot: 'pants', rarity: 1, name: '수련 바지', bonus: 0.08 },
  { id: 'warriorpants', slot: 'pants', rarity: 2, name: '무사 바지', bonus: 0.12 },
  { id: 'cloudpants', slot: 'pants', rarity: 3, name: '구름 비단 바지', bonus: 0.16 },
  { id: 'qilinpants', slot: 'pants', rarity: 4, name: '기린 바지', bonus: 0.2 },
];
const GEAR_BY_ID = Object.fromEntries(GEAR.map((g) => [g.id, g]));

// 칭호: 급수별 마왕성을 깨면 'HSK n급 마스터', 여섯 급수를 모두 깨면 특별 칭호
// 착용하면 닉네임 옆에 붙음 (지도 카드·전투 이름표·처음 화면 인사)
const TITLES = [
  ...[1, 2, 3, 4, 5, 6].map((n) => ({
    id: `hsk${n}`, level: n, name: `HSK ${n}급 마스터`, han: '一二三四五六'[n - 1],
    how: `HSK ${n}급 마왕성의 마왕을 물리치면 얻어요`,
    color: ['#A0652E', '#3DAA6D', '#4A7FD9', '#8A5CC0', '#E3A92B', '#B8332A'][n - 1],
  })),
  { id: 'allmaster', level: 0, name: '한자 무림 맹주', han: '盟', how: '여섯 급수의 마왕을 모두 물리치면 얻어요', color: '#1F1A17', special: true },
];
const TITLE_BY_ID = Object.fromEntries(TITLES.map((t) => [t.id, t]));
const DUPLICATE_COINS = [30, 60, 120, 250, 500]; // 같은 장비가 또 나오면 등급별로 바꿔 주는 코인

// ---------- 플레이어 기록 ----------
function gamePlayer() {
  if (!userRecord.game) userRecord.game = {};
  const p = userRecord.game.player || {};
  userRecord.game.player = {
    exp: Number(p.exp) || 0,
    coins: Number(p.coins) || 0,
    items: p.items && typeof p.items === 'object' ? p.items : {},
    equip: p.equip && typeof p.equip === 'object' ? p.equip : { weapon: null, hat: null },
    titles: p.titles && typeof p.titles === 'object' ? p.titles : {},
  };
  // 착용한 칭호가 없어졌거나 얻지 못한 칭호면 해제
  const t = userRecord.game.player.equip.title;
  if (t && (!TITLE_BY_ID[t] || !userRecord.game.player.titles[t])) userRecord.game.player.equip.title = null;
  // 저장된 장착 장비가 목록에 없거나 가지고 있지 않으면 해제
  for (const slot of GEAR_SLOTS.map((g) => g.id)) {
    const id = userRecord.game.player.equip[slot];
    if (id && (!GEAR_BY_ID[id] || !userRecord.game.player.items[id])) userRecord.game.player.equip[slot] = null;
  }
  return userRecord.game.player;
}

// 레벨 n → n+1 에 필요한 경험치
function expToNext(level) {
  return Math.round(60 + level * 40 + level * level * 6);
}

function levelInfo(totalExp) {
  let level = 1;
  let rest = totalExp;
  while (rest >= expToNext(level)) {
    rest -= expToNext(level);
    level++;
  }
  return { level, exp: rest, need: expToNext(level) };
}

function equippedGear() {
  const p = gamePlayer();
  return Object.fromEntries(GEAR_SLOTS.map(({ id }) => [id, GEAR_BY_ID[p.equip[id]] || null]));
}

// 갑옷: 틀렸을 때 공격을 막을 확률
function guardChance() {
  const a = equippedGear().armor;
  return a ? a.guard : 0;
}

// 바지: 클리어 보상 추가 비율
function rewardBonus() {
  const b = equippedGear().pants;
  return b ? b.bonus : 0;
}

// 장비 종류 이름 (투구는 머리 칸이지만 이름은 '투구')
function gearKindName(g) {
  return SLOT_NAME[g.kind || g.slot];
}

function critBonus() {
  const w = equippedGear().weapon;
  return w ? w.crit : 0;
}

function timeBonus() {
  const h = equippedGear().hat;
  return h ? h.time : 0;
}

// ---------- 보상 계산 ----------
// 스테이지의 '난이도 점수' (0 ~ 약 6): 급수·챕터·보스·별
function rewardPower(level, stage, stars) {
  return (level - 1) * 0.65 + Math.min(stage.chapter - 1, 12) * 0.08 + (stage.final ? 2.4 : stage.boss ? 1.4 : 0) + (stars - 1) * 0.35;
}

function pickChestTier(power, replay) {
  // 난이도 점수 근처의 등급이 가장 잘 나오는 종 모양 확률
  const center = power * 0.7 - (replay ? 1 : 0);
  const weights = CHESTS.map((_, i) => Math.exp(-((i - center) ** 2) / 1.3));
  let r = Math.random() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return 0;
}

function randInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function rollGear(tier) {
  // 상자 등급 근처 희귀도의 장비가 나옴
  const rarity = Math.max(0, Math.min(4, tier + (Math.random() < 0.25 ? 1 : 0) - (Math.random() < 0.3 ? 1 : 0)));
  const pool = GEAR.filter((g) => g.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)];
}

function makeStageRewards(level, stage, stars, replay) {
  const mult = LEVEL_MULT[level] * (1 + Math.min(stage.chapter - 1, 20) * 0.06) * (stage.final ? 3 : stage.boss ? 2 : 1) * (0.7 + stars * 0.1)
    * (1 + rewardBonus()); // 바지 효과
  const rate = replay ? REPLAY_RATE : 1;
  const base = {
    exp: Math.round(25 * mult * rate),
    coins: Math.round(12 * mult * rate),
  };
  const tier = pickChestTier(rewardPower(level, stage, stars), replay);
  const chest = CHESTS[tier];
  const count = randInt(chest.slots[0], chest.slots[1]);
  const contents = [];
  for (let i = 0; i < count; i++) {
    const roll = Math.random();
    if (roll < chest.gear) {
      contents.push({ type: 'gear', gear: rollGear(tier) });
    } else if (roll < chest.gear + (1 - chest.gear) / 2) {
      contents.push({ type: 'exp', amount: Math.round(12 * (tier + 1) * mult * (0.8 + Math.random() * 0.5) * rate) });
    } else {
      contents.push({ type: 'coins', amount: Math.round(8 * (tier + 1) * mult * (0.8 + Math.random() * 0.5) * rate) });
    }
  }
  return { base, tier, chest, contents };
}

// 보상을 기록에 반영하고 레벨 변화와 장비 결과를 돌려줌
function applyRewards(rewards) {
  const p = gamePlayer();
  const before = levelInfo(p.exp).level;
  p.exp += rewards.base.exp;
  p.coins += rewards.base.coins;
  for (const item of rewards.contents) {
    if (item.type === 'exp') p.exp += item.amount;
    else if (item.type === 'coins') p.coins += item.amount;
    else if (p.items[item.gear.id]) {
      item.duplicate = DUPLICATE_COINS[item.gear.rarity];
      p.coins += item.duplicate;
    } else {
      p.items[item.gear.id] = true;
      item.isNew = true;
    }
  }
  scheduleRecordSave();
  const after = levelInfo(p.exp).level;
  return { levelUp: after > before, level: after };
}

// ---------- 상자 그림 ----------
// 등급마다 색·장식이 다른 보물상자 SVG (고정 도형만 사용)
function renderChest(tier, open = false) {
  const c = CHESTS[tier];
  const dark = shade(c.color, 0.3);
  const sparkle = tier >= 2
    ? `<g class="chest-sparkles" fill="#fff">
        <path d="M18 18 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z"/><path d="M104 12 l1.5 4.5 4.5 1.5 -4.5 1.5 -1.5 4.5 -1.5 -4.5 -4.5 -1.5 4.5 -1.5z"/>
        <path d="M110 70 l1.5 4.5 4.5 1.5 -4.5 1.5 -1.5 4.5 -1.5 -4.5 -4.5 -1.5 4.5 -1.5z"/></g>`
    : '';
  const cracks = tier === 0
    ? '<path d="M34 70 l6 8 -3 7 M86 64 l-5 9 4 6" stroke="#3B2A1A" stroke-width="2" fill="none"/><path d="M28 44 l8 4" stroke="#3B2A1A" stroke-width="2"/>'
    : '';
  // 자물쇠판 가운데 장식: 수정 · 홍옥 · 열쇠 구멍
  const gem = tier === 4
    ? '<path d="M60 71 l8 7 -8 10 -8 -10z" fill="#DFF9FF" stroke="#fff" stroke-width="1.5"/><path d="M52 78 h16" stroke="#7ADCEB" stroke-width="1.2"/>'
    : tier === 3
      ? '<circle cx="60" cy="80" r="6" fill="#B8332A" stroke="#FFF0B3" stroke-width="2"/>'
      : '<circle cx="60" cy="77" r="3" fill="' + dark + '"/><path d="M58.5 79 h3 l1 7 h-5z" fill="' + dark + '"/>';
  // 처마처럼 끝이 들린 뚜껑
  const lid = open
    ? `<g class="chest-lid open"><path d="M12 30 Q20 34 26 26 Q60 10 94 26 Q100 34 108 30 L102 40 Q60 22 18 40 Z" fill="${c.color}" stroke="${dark}" stroke-width="3" stroke-linejoin="round"/></g>`
    : `<g class="chest-lid"><path d="M12 54 Q20 56 24 46 Q60 30 96 46 Q100 56 108 54 L102 60 L18 60 Z" fill="${c.color}" stroke="${dark}" stroke-width="3" stroke-linejoin="round"/>
        <path d="M24 52 Q60 40 96 52" stroke="${c.trim}" stroke-width="3" fill="none"/></g>`;
  const light = open ? `<path d="M30 58 L10 0 L110 0 L90 58 Z" fill="url(#chestLight${tier})" opacity="0.9"/>` : '';
  return `<svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg" class="chest-svg tier-${c.id}">
  <defs><linearGradient id="chestLight${tier}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FFF6C9" stop-opacity="1"/><stop offset="1" stop-color="#FFF6C9" stop-opacity="0"/></linearGradient></defs>
  <ellipse cx="60" cy="102" rx="44" ry="6" fill="rgba(0,0,0,0.2)"/>
  ${light}
  <rect x="20" y="58" width="80" height="42" rx="3" fill="${c.color}" stroke="${dark}" stroke-width="3"/>
  <path d="M20 68 L100 68" stroke="${dark}" stroke-width="2" opacity="0.35"/>
  <path d="M20 58 h12 v8 h-4 v-4 h-8z M100 58 h-12 v8 h4 v-4 h8z M20 100 h12 v-8 h-4 v4 h-8z M100 100 h-12 v-8 h4 v4 h8z" fill="${c.trim}"/>
  <circle cx="60" cy="80" r="13" fill="${c.trim}" stroke="${dark}" stroke-width="2"/>
  ${cracks}
  ${lid}
  ${gem}
  ${sparkle}
</svg>`;
}

// ---------- 가방(장비) 화면 ----------
const bagModal = document.getElementById('bag-modal');
const bagList = document.getElementById('bag-list');
const bagStats = document.getElementById('bag-stats');
const bagPreview = document.getElementById('bag-preview');
let onBagClose = null;

function gearEffectText(g) {
  if (g.slot === 'weapon') return `빠른 공격 판정 +${Math.round(g.crit * 100)}%`;
  if (g.slot === 'armor') return `공격 막기 ${Math.round(g.guard * 100)}%`;
  if (g.slot === 'pants') return `보상 +${Math.round(g.bonus * 100)}%`;
  return `제한 시간 +${g.time}초`;
}

// ---------- 칭호 ----------
function equippedTitle() {
  const id = gamePlayer().equip.title;
  return id ? TITLE_BY_ID[id] : null;
}

// 칭호 배지 HTML (닉네임 옆에 붙임)
function titleBadgeHtml(title = equippedTitle()) {
  if (!title) return '';
  return `<span class="title-badge${title.special ? ' special' : ''}" style="--title-color:${title.color}"><i aria-hidden="true">${title.han}</i>${title.name}</span>`;
}

// 마왕을 물리치면 칭호를 줌. 새로 얻은 칭호 목록을 돌려줌 (처음 얻은 칭호는 자동 착용)
function grantMasterTitle(level) {
  const p = gamePlayer();
  const earned = [];
  const give = (id) => {
    if (p.titles[id]) return;
    p.titles[id] = true;
    earned.push(TITLE_BY_ID[id]);
  };
  give(`hsk${level}`);
  if ([1, 2, 3, 4, 5, 6].every((n) => p.titles[`hsk${n}`])) give('allmaster');
  if (earned.length && !p.equip.title) p.equip.title = earned[earned.length - 1].id;
  if (earned.length) scheduleRecordSave();
  return earned;
}

let bagTab = 'gear';

function openBag(onClose) {
  onBagClose = onClose;
  bagTab = 'gear';
  renderBag();
  bagModal.style.display = '';
}

function renderBag() {
  const p = gamePlayer();
  bagPreview.innerHTML = renderAvatar(getAvatar(), 'normal', p.equip);
  const eq = equippedGear();
  // 장착 중인 장비 4칸 (무기·머리·갑옷·바지)
  bagStats.innerHTML = `<span class="bag-slots">${GEAR_SLOTS.map((slot) => {
    const g = eq[slot.id];
    return `<span class="bag-slot${g ? ' on' : ''}"${g ? ` style="--rarity:${RARITIES[g.rarity].color}"` : ''}>`
      + `<span class="bag-slot-icon">${g ? renderGearIcon(g.id) : ''}</span>`
      + `<span class="bag-slot-text"><small>${slot.name}</small>${g ? g.name : slot.empty}</span></span>`;
  }).join('')}</span>`
    + `<span class="bag-title-line">${titleBadgeHtml() || '<span class="bag-no-title">칭호 없음</span>'}</span>`;
  document.querySelectorAll('.bag-tab').forEach((b) => {
    const on = b.dataset.tab === bagTab;
    b.classList.toggle('active', on);
    b.setAttribute('aria-selected', on ? 'true' : 'false');
  });
  if (bagTab === 'title') {
    renderTitleList(p);
    return;
  }
  const owned = GEAR.filter((g) => p.items[g.id]);
  if (owned.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'bag-empty';
    empty.textContent = '아직 장비가 없어요. 스테이지를 클리어하고 상자를 열어 보세요!';
    bagList.replaceChildren(empty);
    return;
  }
  // 칸별로 묶고, 칸 안에서는 희귀한 장비부터
  const rows = [];
  GEAR_SLOTS.forEach((slot) => {
    const list = owned.filter((g) => g.slot === slot.id).sort((a, b) => b.rarity - a.rarity);
    if (!list.length) return;
    const head = document.createElement('p');
    head.className = 'bag-slot-head';
    head.textContent = `${slot.name} · ${list.length}개`;
    rows.push(head, ...list.map(gearRow));
  });
  bagList.replaceChildren(...rows);
}

function gearRow(g) {
  const p = gamePlayer();
  {
    const row = document.createElement('div');
    const equipped = p.equip[g.slot] === g.id;
    row.className = 'bag-item' + (equipped ? ' equipped' : '');
    row.style.setProperty('--rarity', RARITIES[g.rarity].color);
    const icon = document.createElement('span');
    icon.className = 'bag-item-icon';
    icon.innerHTML = renderGearIcon(g.id);
    const info = document.createElement('span');
    info.className = 'bag-item-info';
    const name = document.createElement('strong');
    name.textContent = g.name;
    const meta = document.createElement('small');
    meta.textContent = `${RARITIES[g.rarity].name} ${gearKindName(g)} · ${gearEffectText(g)}`;
    info.append(name, meta);
    const btn = document.createElement('button');
    btn.className = 'bag-item-btn';
    btn.textContent = equipped ? '해제' : '장착';
    btn.addEventListener('click', () => {
      p.equip[g.slot] = equipped ? null : g.id;
      scheduleRecordSave();
      renderBag();
    });
    row.append(icon, info, btn);
    return row;
  }
}

// ---------- 장비 도감 (꾸미기 화면) ----------
// 모든 장비를 칸별로 보여 주고, 얻은 장비는 밝게 · 못 얻은 장비는 어둡게 + 자물쇠
const makerTabs = document.getElementById('maker-tabs');
const makerAvatarPane = document.getElementById('maker-avatar-pane');
const makerDexPane = document.getElementById('maker-dex-pane');
const dexProgress = document.getElementById('dex-progress');
const dexDetail = document.getElementById('dex-detail');
const dexSections = document.getElementById('dex-sections');
let dexSelected = null;

function resetMakerTabs(showTabs) {
  makerTabs.style.display = showTabs ? '' : 'none';
  showMakerTab('avatar');
}

function showMakerTab(tab) {
  makerAvatarPane.style.display = tab === 'avatar' ? '' : 'none';
  makerDexPane.style.display = tab === 'dex' ? '' : 'none';
  makerTabs.querySelectorAll('.bag-tab').forEach((b) => {
    const on = b.dataset.tab === tab;
    b.classList.toggle('active', on);
    b.setAttribute('aria-selected', on ? 'true' : 'false');
  });
  if (tab === 'dex') renderGearDex();
}

makerTabs.querySelectorAll('.bag-tab').forEach((b) => b.addEventListener('click', () => showMakerTab(b.dataset.tab)));

function renderGearDex() {
  const p = gamePlayer();
  const ownedCount = GEAR.filter((g) => p.items[g.id]).length;
  dexProgress.innerHTML = `모은 장비 <strong>${ownedCount}</strong> / ${GEAR.length}`
    + `<span class="dex-bar"><i style="width:${(ownedCount / GEAR.length) * 100}%"></i></span>`;
  if (!dexSelected || !GEAR_BY_ID[dexSelected]) dexSelected = (GEAR.find((g) => p.items[g.id]) || GEAR[0]).id;
  renderDexDetail();

  dexSections.replaceChildren(...GEAR_SLOTS.map((slot) => {
    const list = GEAR.filter((g) => g.slot === slot.id).sort((a, b) => a.rarity - b.rarity);
    const section = document.createElement('section');
    section.className = 'dex-section';
    const head = document.createElement('h4');
    head.className = 'dex-section-title';
    head.textContent = `${slot.name} · ${list.filter((g) => p.items[g.id]).length}/${list.length}`;
    const grid = document.createElement('div');
    grid.className = 'dex-grid';
    list.forEach((g) => {
      const owned = Boolean(p.items[g.id]);
      const card = document.createElement('button');
      card.className = 'dex-card' + (owned ? ' owned' : ' locked') + (p.equip[g.slot] === g.id ? ' equipped' : '') + (dexSelected === g.id ? ' selected' : '');
      card.style.setProperty('--rarity', RARITIES[g.rarity].color);
      card.setAttribute('aria-label', `${g.name}, ${RARITIES[g.rarity].name}, ${owned ? '획득' : '미획득'}`);
      card.innerHTML = `<span class="dex-icon">${renderGearIcon(g.id)}${owned ? '' : `<span class="dex-lock">${uiIcon('lock')}</span>`}</span>`
        + `<span class="dex-name">${g.name}</span>`;
      card.addEventListener('click', () => {
        dexSelected = g.id;
        renderGearDex();
      });
      grid.appendChild(card);
    });
    section.append(head, grid);
    return section;
  }));
}

// 위쪽 상세 칸: 고른 장비의 그림·희귀도·효과, 얻었으면 장착 버튼, 못 얻었으면 얻는 곳
function renderDexDetail() {
  const p = gamePlayer();
  const g = GEAR_BY_ID[dexSelected];
  const owned = Boolean(p.items[g.id]);
  const equipped = p.equip[g.slot] === g.id;
  const rarity = RARITIES[g.rarity];
  dexDetail.className = 'dex-detail' + (owned ? ' owned' : ' locked');
  dexDetail.style.setProperty('--rarity', rarity.color);
  dexDetail.innerHTML = `
    <span class="dex-icon big">${renderGearIcon(g.id)}${owned ? '' : `<span class="dex-lock">${uiIcon('lock')}</span>`}</span>
    <span class="dex-detail-info">
      <strong>${g.name}</strong>
      <small><b style="color:${rarity.color}">${rarity.name}</b> ${gearKindName(g)} · ${gearEffectText(g)}</small>
      <small class="dex-how">${owned ? (equipped ? '장착 중이에요' : '가방에 있어요') : `아직 못 얻었어요 · 주로 ‘${CHESTS[g.rarity].name}’에서 나와요`}</small>
    </span>`;
  if (owned) {
    const btn = document.createElement('button');
    btn.className = 'bag-item-btn';
    btn.textContent = equipped ? '해제' : '장착';
    btn.addEventListener('click', () => {
      p.equip[g.slot] = equipped ? null : g.id;
      scheduleRecordSave();
      if (typeof syncMyProgress === 'function') syncMyProgress();
      renderGearDex();
    });
    dexDetail.appendChild(btn);
  }
}

// 칭호 칸: 얻은 칭호는 착용·해제, 아직 못 얻은 칭호는 얻는 방법을 보여 줌
function renderTitleList(p) {
  const count = TITLES.filter((t) => p.titles[t.id]).length;
  const head = document.createElement('p');
  head.className = 'bag-title-count';
  head.textContent = `모은 칭호 ${count} / ${TITLES.length}`;
  bagList.replaceChildren(head, ...TITLES.map((t) => {
    const owned = !!p.titles[t.id];
    const equipped = p.equip.title === t.id;
    const row = document.createElement('div');
    row.className = 'bag-item title-item' + (equipped ? ' equipped' : '') + (owned ? '' : ' locked');
    row.style.setProperty('--rarity', owned ? t.color : '#C9C1B6');
    const icon = document.createElement('span');
    icon.className = 'bag-item-icon title-seal-icon';
    icon.style.setProperty('--title-color', t.color);
    icon.innerHTML = owned ? t.han : uiIcon('lock');
    const info = document.createElement('span');
    info.className = 'bag-item-info';
    const name = document.createElement('strong');
    name.textContent = t.name;
    const meta = document.createElement('small');
    meta.textContent = owned ? (t.special ? '모든 급수 정복의 증표' : `HSK ${t.level}급 마왕성 정복의 증표`) : t.how;
    info.append(name, meta);
    row.append(icon, info);
    if (owned) {
      const btn = document.createElement('button');
      btn.className = 'bag-item-btn';
      btn.textContent = equipped ? '해제' : '착용';
      btn.addEventListener('click', () => {
        p.equip.title = equipped ? null : t.id;
        scheduleRecordSave();
        renderBag();
        if (typeof refreshTitleDisplays === 'function') refreshTitleDisplays();
      });
      row.append(btn);
    }
    return row;
  }));
}

document.querySelectorAll('.bag-tab').forEach((b) => b.addEventListener('click', () => {
  bagTab = b.dataset.tab;
  renderBag();
}));

document.getElementById('btn-bag-close').addEventListener('click', () => {
  if (typeof syncMyProgress === 'function') syncMyProgress(); // 바꾼 모자·투구를 친구 지도에도
  bagModal.style.display = 'none';
  if (onBagClose) onBagClose();
});
