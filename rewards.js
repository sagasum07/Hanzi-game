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

const CHESTS = [
  { id: 'worn', name: '낡은 상자', slots: [1, 1], gear: 0.12, color: '#8B6B4A', trim: '#5C4630', glow: 'rgba(160,130,90,0.0)' },
  { id: 'common', name: '일반 상자', slots: [2, 2], gear: 0.2, color: '#B5783A', trim: '#6E6E78', glow: 'rgba(255,255,255,0.25)' },
  { id: 'shiny', name: '반짝이는 상자', slots: [2, 3], gear: 0.32, color: '#4A7FD9', trim: '#C9D6F2', glow: 'rgba(120,180,255,0.55)' },
  { id: 'gold', name: '금 상자', slots: [3, 3], gear: 0.45, color: '#E3A92B', trim: '#FFF0B3', glow: 'rgba(255,210,80,0.7)' },
  { id: 'diamond', name: '다이아몬드 상자', slots: [3, 4], gear: 0.6, color: '#46C8E0', trim: '#E8FBFF', glow: 'rgba(120,240,255,0.85)' },
];

const RARITIES = [
  { id: 'common', name: '일반', color: '#8E8E93' },
  { id: 'uncommon', name: '고급', color: '#3DAA6D' },
  { id: 'rare', name: '희귀', color: '#4A7FD9' },
  { id: 'epic', name: '영웅', color: '#8A5CC0' },
  { id: 'legendary', name: '전설', color: '#E3A92B' },
];

// 무기: 크리티컬 판정이 쉬워짐 (남은 시간 기준을 낮춤) / 모자: 제한 시간이 늘어남
const GEAR = [
  { id: 'stick', slot: 'weapon', rarity: 0, name: '나무 막대기', icon: '🪵', crit: 0.04 },
  { id: 'glove', slot: 'weapon', rarity: 0, name: '가죽 장갑', icon: '🥊', crit: 0.05 },
  { id: 'woodsword', slot: 'weapon', rarity: 1, name: '목검', icon: '🗡️', crit: 0.08 },
  { id: 'knuckle', slot: 'weapon', rarity: 1, name: '쇠 너클', icon: '👊', crit: 0.09 },
  { id: 'brush', slot: 'weapon', rarity: 2, name: '서예 붓', icon: '🖌️', crit: 0.12 },
  { id: 'bronzesword', slot: 'weapon', rarity: 2, name: '청동검', icon: '⚔️', crit: 0.13 },
  { id: 'goldbrush', slot: 'weapon', rarity: 3, name: '황금 붓', icon: '✒️', crit: 0.17 },
  { id: 'dragonbrush', slot: 'weapon', rarity: 4, name: '용의 붓', icon: '🐉', crit: 0.22 },
  { id: 'straw', slot: 'hat', rarity: 0, name: '밀짚모자', icon: '👒', time: 1 },
  { id: 'cap', slot: 'hat', rarity: 0, name: '야구 모자', icon: '🧢', time: 1 },
  { id: 'band', slot: 'hat', rarity: 1, name: '무사 머리띠', icon: '🎽', time: 1.5 },
  { id: 'gradcap', slot: 'hat', rarity: 2, name: '학사모', icon: '🎓', time: 2 },
  { id: 'scholar', slot: 'hat', rarity: 3, name: '선비 갓', icon: '🎩', time: 3 },
  { id: 'crown', slot: 'hat', rarity: 4, name: '황금 왕관', icon: '👑', time: 4 },
];
const GEAR_BY_ID = Object.fromEntries(GEAR.map((g) => [g.id, g]));
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
  };
  // 저장된 장착 장비가 목록에 없거나 가지고 있지 않으면 해제
  for (const slot of ['weapon', 'hat']) {
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
  return { weapon: GEAR_BY_ID[p.equip.weapon] || null, hat: GEAR_BY_ID[p.equip.hat] || null };
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
  return (level - 1) * 0.65 + Math.min(stage.chapter - 1, 12) * 0.08 + (stage.boss ? 1.4 : 0) + (stars - 1) * 0.35;
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
  const mult = LEVEL_MULT[level] * (1 + Math.min(stage.chapter - 1, 20) * 0.06) * (stage.boss ? 2 : 1) * (0.7 + stars * 0.1);
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
  const gem = tier === 4
    ? '<path d="M60 66 l9 7 -9 11 -9 -11z" fill="#B8F4FF" stroke="#fff" stroke-width="1.5"/><path d="M51 73 h18" stroke="#7ADCEB" stroke-width="1.2"/>'
    : tier === 3
      ? '<circle cx="60" cy="74" r="7" fill="#FF5A5A" stroke="#FFF0B3" stroke-width="2"/>'
      : '<rect x="54" y="66" width="12" height="15" rx="3" fill="' + c.trim + '" stroke="' + dark + '" stroke-width="2"/><circle cx="60" cy="72" r="2.5" fill="' + dark + '"/>';
  const lid = open
    ? `<g class="chest-lid open"><path d="M22 40 Q60 6 98 40 L98 30 Q60 -4 22 30 Z" fill="${c.color}" stroke="${dark}" stroke-width="3"/></g>`
    : `<g class="chest-lid"><path d="M20 58 L20 44 Q60 14 100 44 L100 58 Z" fill="${c.color}" stroke="${dark}" stroke-width="3"/>
        <path d="M20 52 L100 52" stroke="${c.trim}" stroke-width="5"/><path d="M40 30 L40 58 M80 30 L80 58" stroke="${c.trim}" stroke-width="5"/></g>`;
  const light = open ? `<path d="M30 58 L10 0 L110 0 L90 58 Z" fill="url(#chestLight${tier})" opacity="0.9"/>` : '';
  return `<svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg" class="chest-svg tier-${c.id}">
  <defs><linearGradient id="chestLight${tier}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FFF6C9" stop-opacity="1"/><stop offset="1" stop-color="#FFF6C9" stop-opacity="0"/></linearGradient></defs>
  <ellipse cx="60" cy="102" rx="44" ry="6" fill="rgba(0,0,0,0.2)"/>
  ${light}
  <rect x="20" y="56" width="80" height="44" rx="5" fill="${c.color}" stroke="${dark}" stroke-width="3"/>
  <path d="M20 66 L100 66" stroke="${dark}" stroke-width="2" opacity="0.4"/>
  <path d="M40 56 L40 100 M80 56 L80 100" stroke="${c.trim}" stroke-width="5"/>
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
  return g.slot === 'weapon' ? `크리티컬 판정 +${Math.round(g.crit * 100)}%` : `제한 시간 +${g.time}초`;
}

function openBag(onClose) {
  onBagClose = onClose;
  renderBag();
  bagModal.style.display = '';
}

function renderBag() {
  const p = gamePlayer();
  bagPreview.innerHTML = renderAvatar(getAvatar(), 'normal', p.equip);
  const eq = equippedGear();
  bagStats.textContent = `👊 ${eq.weapon ? eq.weapon.name : '맨손'} · 🎩 ${eq.hat ? eq.hat.name : '모자 없음'}`;
  const owned = GEAR.filter((g) => p.items[g.id]);
  if (owned.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'bag-empty';
    empty.textContent = '아직 장비가 없어요. 스테이지를 클리어하고 상자를 열어 보세요!';
    bagList.replaceChildren(empty);
    return;
  }
  bagList.replaceChildren(...owned.map((g) => {
    const row = document.createElement('div');
    const equipped = p.equip[g.slot] === g.id;
    row.className = 'bag-item' + (equipped ? ' equipped' : '');
    row.style.setProperty('--rarity', RARITIES[g.rarity].color);
    const icon = document.createElement('span');
    icon.className = 'bag-item-icon';
    icon.textContent = g.icon;
    const info = document.createElement('span');
    info.className = 'bag-item-info';
    const name = document.createElement('strong');
    name.textContent = g.name;
    const meta = document.createElement('small');
    meta.textContent = `${RARITIES[g.rarity].name} ${g.slot === 'weapon' ? '무기' : '모자'} · ${gearEffectText(g)}`;
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
  }));
}

document.getElementById('btn-bag-close').addEventListener('click', () => {
  bagModal.style.display = 'none';
  if (onBagClose) onBagClose();
});
