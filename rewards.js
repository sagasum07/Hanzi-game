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

// 상점 소모품 (엽전으로 사서 전투에서 씀)
const SUPPLIES = [
  { id: 'revive', name: '부활권', sub: '되살림 부적', price: 120,
    desc: '하트를 모두 잃었을 때 하트를 가득 채워 다시 싸워요. 이기면 별은 1개! (전투마다 한 번)' },
  { id: 'heart', name: '하트 추가', sub: '붉은 옥 심장', price: 40,
    desc: '전투 중에 누르면 하트가 하나 늘어나요. (최대 5개)' },
  { id: 'time', name: '시간 추가', sub: '느린 향', price: 25,
    desc: '문제를 푸는 중에 누르면 제한 시간이 10초 늘어나요.' },
];
const SUPPLY_BY_ID = Object.fromEntries(SUPPLIES.map((s) => [s.id, s]));
const SUPPLY_MAX = 99; // 한 종류를 최대 몇 개까지 가질 수 있는지
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
    supplies: Object.fromEntries(SUPPLIES.map(({ id }) => [id, Math.max(0, Math.min(SUPPLY_MAX, Math.floor(Number((p.supplies || {})[id]) || 0)))])),
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
  return (a ? a.guard : 0) + (typeof sectBonus === 'function' ? sectBonus('guard') : 0);
}

// 바지: 클리어 보상 추가 비율
function rewardBonus() {
  const b = equippedGear().pants;
  return (b ? b.bonus : 0) + (typeof sectBonus === 'function' ? sectBonus('reward') : 0);
}

// 장비 종류 이름 (투구는 머리 칸이지만 이름은 '투구')
function gearKindName(g) {
  return SLOT_NAME[g.kind || g.slot];
}

function critBonus() {
  const w = equippedGear().weapon;
  return (w ? w.crit : 0) + (typeof sectBonus === 'function' ? sectBonus('crit') : 0);
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
// 중국식 보물함(寶箱): 칠기 몸통 + 놋쇠 여의(如意) 구름 모서리 장식 + 둥근 면엽판에 걸린 가로 자물쇠(글자)
// 낡은 상자는 나뭇결·쇠붙이·새끼줄, 등급이 오를수록 붉은 칠기 → 비취 → 금박 → 수정
const CHEST_STYLE = [
  { body: '#8B6A48', dark: '#4A3828', metal: '#6E757D', metalDark: '#3F4449', lock: '', inner: '#2B1F16' },
  { body: '#A8342B', dark: '#5E1A14', metal: '#D4A83A', metalDark: '#8E6A1E', lock: '福', inner: '#3A1410' },
  { body: '#2F6F60', dark: '#173B33', metal: '#E3E8EC', metalDark: '#8A9199', lock: '玉', inner: '#10261F' },
  { body: '#E3B341', dark: '#8E6A1E', metal: '#B8332A', metalDark: '#6E1A12', lock: '寶', inner: '#4A2E0E' },
  { body: '#8FD9EA', dark: '#2E7A8C', metal: '#FFFFFF', metalDark: '#7ADCEB', lock: '珍', inner: '#163E48' },
];

function renderChest(tier, open = false) {
  const c = CHESTS[tier];
  const st = CHEST_STYLE[tier];
  // 모서리 여의 구름 장식 (왼쪽 위 기준, 나머지는 뒤집어서)
  const corner = `<path d="M18 58 H32 Q33 62 29 63 Q32 67 27 69 Q24 72 18 70 Z" fill="${st.metal}" stroke="${st.metalDark}" stroke-width="1.5" stroke-linejoin="round"/>`;
  const corners = `${corner}
    <g transform="translate(120 0) scale(-1 1)">${corner}</g>
    <g transform="translate(0 156) scale(1 -1)">${corner}</g>
    <g transform="translate(120 156) scale(-1 -1)">${corner}</g>`;
  // 회문(回紋) 띠
  const fret = Array.from({ length: 9 }, (_, i) => {
    const x = 24 + i * 8;
    return `<path d="M${x} 93 h6 v-4 h-4 v2" stroke="${st.metalDark}" stroke-width="1.2" fill="none" opacity="0.8"/>`;
  }).join('');
  const grain = tier === 0
    ? '<path d="M24 66 q18 -3 36 0 t36 0 M24 74 q20 3 40 0 t32 0 M24 84 q16 -3 32 0 t40 0" stroke="#5C4430" stroke-width="1.2" fill="none" opacity="0.6"/><path d="M36 64 l5 9 -3 6 M84 70 l-4 8 3 5" stroke="#2B1F16" stroke-width="1.8" fill="none"/>'
    : '';
  const rope = tier === 0
    ? '<path d="M18 76 Q60 84 102 76" stroke="#C9A27A" stroke-width="3.2" fill="none"/><path d="M18 76 Q60 84 102 76" stroke="#8C6A44" stroke-width="1" stroke-dasharray="3 3" fill="none"/><circle cx="60" cy="80" r="3" fill="#C9A27A" stroke="#8C6A44"/>'
    : '';
  const shine = tier === 4
    ? '<path d="M26 62 L34 62 L28 94 L22 94 Z M40 62 L44 62 L38 94 L35 94 Z" fill="#FFFFFF" opacity="0.35"/>'
    : tier >= 2 ? '<path d="M26 62 L32 62 L27 92 L23 92 Z" fill="#FFFFFF" opacity="0.18"/>' : '';
  // 둥근 면엽판 + 가로 자물쇠 (글자)
  const lockFace = tier === 0
    ? `<rect x="54" y="66" width="12" height="10" rx="2" fill="${st.metal}" stroke="${st.metalDark}" stroke-width="1.5"/><circle cx="60" cy="71" r="1.8" fill="#2B2321"/>`
    : `<circle cx="60" cy="68" r="10" fill="${st.metal}" stroke="${st.metalDark}" stroke-width="1.8"/>
       <circle cx="60" cy="68" r="6.5" fill="none" stroke="${st.metalDark}" stroke-width="1" opacity="0.7"/>
       <path d="M54 74 v-3 a6 6 0 0 1 12 0 v3" fill="none" stroke="${st.metalDark}" stroke-width="2"/>
       <rect x="49" y="74" width="22" height="11" rx="3" fill="${st.metal}" stroke="${st.metalDark}" stroke-width="1.8"/>
       <text x="60" y="83" text-anchor="middle" font-size="8.5" fill="${st.metalDark}" font-family="'Ma Shan Zheng', 'Noto Serif SC', serif">${st.lock}</text>`;
  const gem = tier === 4
    ? '<path d="M60 61 l4 4 -4 5 -4 -5z" fill="#DFF9FF" stroke="#2E7A8C" stroke-width="1"/>'
    : tier === 3 ? '<circle cx="60" cy="65" r="2.6" fill="#7FD3C0" stroke="#FFF0B3" stroke-width="1"/>' : '';
  const sparkle = tier >= 2
    ? `<g class="chest-sparkles" fill="#fff">
        <path d="M14 22 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z"/><path d="M106 14 l1.5 4.5 4.5 1.5 -4.5 1.5 -1.5 4.5 -1.5 -4.5 -4.5 -1.5 4.5 -1.5z"/>
        <path d="M110 72 l1.5 4.5 4.5 1.5 -4.5 1.5 -1.5 4.5 -1.5 -4.5 -4.5 -1.5 4.5 -1.5z"/></g>`
    : '';
  // 뚜껑: 닫힘 = 비스듬히 깎인 평뚜껑 + 손잡이 고리 / 열림 = 뒤로 젖힌 뚜껑 + 안쪽 원보(元寶)와 빛
  const lid = open
    ? `<g class="chest-lid open">
        <path d="M20 40 L26 14 H94 L100 40 Z" fill="${st.dark}" stroke="${st.dark}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M24 38 L29 18 H91 L96 38 Z" fill="${st.body}" opacity="0.55"/>
        <path d="M26 14 H94" stroke="${st.metal}" stroke-width="3"/>
       </g>
       <rect x="18" y="44" width="84" height="14" fill="${st.inner}" stroke="${st.dark}" stroke-width="2.5"/>
       <g class="chest-ingots">
        <path d="M34 56 q1 -7 8 -5 q4 -6 8 0 q7 -2 8 5 z" fill="#F2C230" stroke="#8E6A1E" stroke-width="1.2"/>
        <path d="M62 56 q1 -8 9 -6 q4 -6 9 0 q7 -2 8 6 z" fill="#F2C230" stroke="#8E6A1E" stroke-width="1.2"/>
        <circle cx="56" cy="53" r="4" fill="#E3B341" stroke="#8E6A1E" stroke-width="1"/><rect x="54.5" y="51.5" width="3" height="3" fill="#8E6A1E"/>
       </g>`
    : `<g class="chest-lid">
        <path d="M14 58 L20 40 H100 L106 58 Z" fill="${st.body}" stroke="${st.dark}" stroke-width="3" stroke-linejoin="round"/>
        <path d="M20 40 H100" stroke="${st.metal}" stroke-width="3"/>
        <path d="M17 51 H103" stroke="${st.metal}" stroke-width="2.2" opacity="0.9"/>
        <path d="M50 40 q10 -10 20 0" stroke="${st.metal}" stroke-width="3" fill="none"/>
        <circle cx="50" cy="40" r="2.2" fill="${st.metalDark}"/><circle cx="70" cy="40" r="2.2" fill="${st.metalDark}"/>
       </g>`;
  const light = open ? `<path d="M26 50 L4 0 L116 0 L94 50 Z" fill="url(#chestLight${tier})" opacity="0.9"/>` : '';
  return `<svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg" class="chest-svg tier-${c.id}" overflow="visible">
  <defs><linearGradient id="chestLight${tier}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FFF6C9" stop-opacity="1"/><stop offset="1" stop-color="#FFF6C9" stop-opacity="0"/></linearGradient></defs>
  <ellipse cx="60" cy="104" rx="46" ry="5.5" fill="rgba(0,0,0,0.22)"/>
  ${light}
  <path d="M22 96 h10 l-2 8 h-6 z M88 96 h10 l-2 8 h-6 z" fill="${st.dark}"/>
  <rect x="18" y="56" width="84" height="42" rx="2" fill="${st.body}" stroke="${st.dark}" stroke-width="3"/>
  <rect x="23" y="61" width="74" height="26" rx="2" fill="none" stroke="${st.dark}" stroke-width="1.4" opacity="0.45"/>
  ${grain}
  ${shine}
  ${fret}
  ${corners}
  ${rope}
  ${lid}
  ${lockFace}
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
  bagPreview.innerHTML = renderAvatar(getAvatar(), 'normal', withSect(p.equip));
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

// ---------- 상점 ----------
// 동양풍 가게: 주인이 "어서옵쇼~" 하고 맞이하고, 엽전으로 소모품을 삼
const shopModal = document.getElementById('shop-modal');
const shopkeeperEl = document.getElementById('shopkeeper');
const shopBubble = document.getElementById('shop-bubble');
const shopCoins = document.getElementById('shop-coins');
const shopItems = document.getElementById('shop-items');
let onShopClose = null;
let shopTalkTimer = null;
const SHOP_GREETINGS = ['어서옵쇼~', '어서옵쇼~ 좋은 물건 많습니다요!', '어서옵쇼~ 오늘도 요괴 사냥 가십니까?'];

function shopSay(text, mood = 'normal') {
  shopBubble.textContent = text;
  shopBubble.classList.remove('pop');
  void shopBubble.offsetWidth;
  shopBubble.classList.add('pop');
  shopkeeperEl.innerHTML = renderShopkeeper(mood);
  shopkeeperEl.className = `shopkeeper ${mood}`;
  clearTimeout(shopTalkTimer);
  if (mood !== 'normal') {
    shopTalkTimer = setTimeout(() => { shopkeeperEl.innerHTML = renderShopkeeper('normal'); shopkeeperEl.className = 'shopkeeper'; }, 1600);
  }
}

function openShop(onClose) {
  onShopClose = onClose;
  renderShop();
  shopModal.style.display = '';
  shopSay(SHOP_GREETINGS[Math.floor(Math.random() * SHOP_GREETINGS.length)], 'happy');
}

function renderShop() {
  const p = gamePlayer();
  shopCoins.innerHTML = `${uiIcon('coin')} 내 엽전 <strong>${p.coins.toLocaleString()}</strong>`;
  shopItems.replaceChildren(...SUPPLIES.map((s) => {
    const card = document.createElement('div');
    card.className = 'shop-item';
    const icon = document.createElement('span');
    icon.className = 'shop-item-icon';
    icon.innerHTML = renderSupplyIcon(s.id);
    const info = document.createElement('span');
    info.className = 'shop-item-info';
    info.innerHTML = `<strong>${s.name} <small>${s.sub}</small></strong><span>${s.desc}</span><em>가진 개수 ${p.supplies[s.id]}개</em>`;
    const btn = document.createElement('button');
    btn.className = 'shop-buy';
    btn.innerHTML = `${uiIcon('coin')}${s.price}`;
    btn.setAttribute('aria-label', `${s.name} 사기, 엽전 ${s.price}개`);
    const full = p.supplies[s.id] >= SUPPLY_MAX;
    btn.classList.toggle('poor', p.coins < s.price);
    btn.disabled = full;
    btn.addEventListener('click', () => buySupply(s));
    card.append(icon, info, btn);
    return card;
  }));
}

function buySupply(s) {
  const p = gamePlayer();
  if (p.coins < s.price) {
    shopSay('아이고, 엽전이 조금 모자라시네요… 요괴를 더 잡고 오십쇼!', 'sad');
    return;
  }
  if (p.supplies[s.id] >= SUPPLY_MAX) return;
  p.coins -= s.price;
  p.supplies[s.id] += 1;
  scheduleRecordSave();
  Sfx.loot(2);
  shopSay(['감사합니다요~!', '탁월한 선택이십니다요!', '또 오십쇼~!'][Math.floor(Math.random() * 3)], 'happy');
  renderShop();
}

document.getElementById('btn-shop-close').addEventListener('click', () => {
  shopModal.style.display = 'none';
  clearTimeout(shopTalkTimer);
  if (onShopClose) onShopClose();
});

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
