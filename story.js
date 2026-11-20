// ========================================
// 게임 모드 이야기 (story.js) — 프롤로그 · 문파 선택 · 비법서 되찾기 · 엔딩
// ========================================
// rewards.js 다음, stage-game.js 앞에 불러오는 일반 스크립트입니다.
// (renderMonster·renderShopkeeper: art.js, renderAvatar·randomAvatar: avatar.js, gamePlayer: rewards.js)
//
// 줄거리: 중원의 전설적인 마라탕집 비법서를 마왕이 훔쳐 여섯 장으로 찢어 HSK 1~6급 마왕성에 숨김.
//        급수마다 마왕을 물리치면 비법서 한 장씩 되찾고, 여섯 장을 모으면 엔딩.
// 기록: userRecord.game.story = { prologue: true, sect: 'hwasan', pages: { 1: true, ... }, ending: true }

// ---------- 문파 ----------
const SECTS = [
  {
    id: 'hwasan', name: '화산파', han: '華山派', emblem: '梅', color: '#B8332A', light: '#F6D7D2',
    motto: '매화처럼 피어나는 번개 같은 검', desc: '빠른 공격(×2·×3) 판정 +5%', crit: 0.05,
  },
  {
    id: 'wudang', name: '무당파', han: '武當派', emblem: '太', color: '#3F7D6B', light: '#D6EAE3',
    motto: '부드러움으로 강함을 이긴다', desc: '몬스터 공격 막기 +8%', guard: 0.08,
  },
  {
    id: 'gaibang', name: '개방', han: '丐幫', emblem: '丐', color: '#8B5A2B', light: '#EEDFCB',
    motto: '천하의 맛집은 우리가 다 안다', desc: '클리어 보상(경험치·코인) +10%', reward: 0.1,
  },
];
const SECT_BY_ID = Object.fromEntries(SECTS.map((s) => [s.id, s]));
const RECIPE_PAGES = 6; // 급수 1~6 마왕성마다 한 장

function storyState() {
  if (!userRecord.game) userRecord.game = {};
  const s = userRecord.game.story;
  if (!s || typeof s !== 'object') userRecord.game.story = { pages: {} };
  if (!userRecord.game.story.pages || typeof userRecord.game.story.pages !== 'object') userRecord.game.story.pages = {};
  return userRecord.game.story;
}

function mySect() {
  return (userRecord && userRecord.game && userRecord.game.story && SECT_BY_ID[userRecord.game.story.sect]) || null;
}

// 문파 효과 (rewards.js 의 critBonus · guardChance · rewardBonus 에 더해짐)
function sectBonus(kind) {
  const s = mySect();
  return s && s[kind] ? s[kind] : 0;
}

function recoveredPageCount() {
  const pages = storyState().pages;
  return Object.keys(pages).filter((k) => pages[k]).length;
}

// ---------- 장면 그림 (320×200) ----------
const SC_INK = '#2B2321';

// 다른 그림 함수가 만든 <svg> 를 장면 안 원하는 자리에 끼워 넣음
function embedSvg(svg, x, y, w, h) {
  return svg.replace('<svg ', `<svg x="${x}" y="${y}" width="${w}" height="${h}" `);
}

function sceneSky(top, bottom, id) {
  return `<defs><linearGradient id="sky-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs>
    <rect width="320" height="200" fill="url(#sky-${id})"/>`;
}

function sceneMountains(color, opacity = 0.35) {
  return `<path d="M0 130 L40 92 L70 110 L110 70 L150 104 L190 80 L230 108 L270 76 L320 100 L320 200 L0 200Z" fill="${color}" opacity="${opacity}"/>
    <path d="M0 150 L50 124 L90 140 L140 118 L200 142 L250 122 L320 140 L320 200 L0 200Z" fill="${color}" opacity="${opacity + 0.15}"/>`;
}

// 마라탕집: 처마가 들린 지붕, 麻辣烫 현판, 붉은 등불, 김이 나는 문
function sceneInn(x, y, s = 1, ruined = false) {
  const wall = ruined ? '#8C7A6A' : '#E9DCC4';
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="10" y="40" width="120" height="60" fill="${wall}" stroke="${SC_INK}" stroke-width="2.5"/>
    <rect x="18" y="48" width="104" height="6" fill="#8E241D"/>
    <rect x="55" y="62" width="30" height="38" fill="${ruined ? '#3A2A22' : '#5C3A1A'}" stroke="${SC_INK}" stroke-width="2"/>
    <rect x="22" y="62" width="22" height="18" fill="${ruined ? '#3A2A22' : '#F2D58A'}" stroke="${SC_INK}" stroke-width="2"/>
    <rect x="96" y="62" width="22" height="18" fill="${ruined ? '#3A2A22' : '#F2D58A'}" stroke="${SC_INK}" stroke-width="2"/>
    <path d="M-6 42 Q4 40 10 30 L130 30 Q136 40 146 42 Q132 22 120 16 L20 16 Q8 22 -6 42 Z" fill="#2B2321" stroke="${SC_INK}" stroke-width="2"/>
    <path d="M18 18 Q70 8 122 18" stroke="#B8332A" stroke-width="3" fill="none"/>
    <rect x="46" y="20" width="48" height="16" rx="2" fill="#B8332A" stroke="#C9A14A" stroke-width="2"/>
    <text x="70" y="32.5" text-anchor="middle" font-size="12" fill="#F2D58A" font-family="'Ma Shan Zheng', 'Noto Serif SC', serif">麻辣烫</text>
    ${ruined ? '' : `<g class="lantern-sway"><path d="M14 42 v6" stroke="${SC_INK}" stroke-width="1.5"/><ellipse cx="14" cy="54" rx="6" ry="7" fill="#D9363E" stroke="${SC_INK}" stroke-width="1.5"/></g>
    <g class="lantern-sway"><path d="M126 42 v6" stroke="${SC_INK}" stroke-width="1.5"/><ellipse cx="126" cy="54" rx="6" ry="7" fill="#D9363E" stroke="${SC_INK}" stroke-width="1.5"/></g>`}
    ${ruined
    ? '<path d="M40 40 L48 56 L42 70 M100 40 L94 52 L102 66" stroke="#2B2321" stroke-width="2" fill="none"/><path d="M-6 42 L20 16" stroke="#8C7A6A" stroke-width="4"/>'
    : `<path class="steam" d="M62 58 q-4 -8 0 -14 q4 -6 0 -12" stroke="#FFFFFF" stroke-width="2.5" fill="none" opacity="0.8"/><path class="steam s2" d="M78 58 q4 -8 0 -14 q-4 -6 0 -12" stroke="#FFFFFF" stroke-width="2.5" fill="none" opacity="0.7"/>`}
  </g>`;
}

// 마라탕 한 그릇: 청화 백자 그릇, 붉은 국물, 고추·두부·청경채·완자, 피어오르는 김
function sceneBowl(cx, cy, s = 1) {
  return `<g transform="translate(${cx} ${cy}) scale(${s})">
    <path class="steam" d="M-20 -30 q-6 -10 0 -18 q6 -8 0 -16" stroke="#FFFFFF" stroke-width="3" fill="none" opacity="0.85"/>
    <path class="steam s2" d="M0 -32 q6 -10 0 -18 q-6 -8 0 -16" stroke="#FFFFFF" stroke-width="3" fill="none" opacity="0.85"/>
    <path class="steam" d="M20 -30 q-6 -10 0 -18 q6 -8 0 -16" stroke="#FFFFFF" stroke-width="3" fill="none" opacity="0.85"/>
    <ellipse cx="0" cy="-12" rx="46" ry="12" fill="#B8332A" stroke="${SC_INK}" stroke-width="2.5"/>
    <ellipse cx="-4" cy="-14" rx="30" ry="6" fill="#D9533F" opacity="0.7"/>
    <rect x="-24" y="-20" width="9" height="7" fill="#FFF6E6" stroke="${SC_INK}" stroke-width="1"/>
    <rect x="10" y="-19" width="8" height="6" fill="#FFF6E6" stroke="${SC_INK}" stroke-width="1"/>
    <circle cx="-4" cy="-16" r="4" fill="#E8B796" stroke="${SC_INK}" stroke-width="1"/>
    <path d="M22 -16 q6 -6 12 -2 q-6 4 -12 2z" fill="#5E9C3E" stroke="${SC_INK}" stroke-width="1"/>
    <path d="M-34 -14 q4 -6 10 -4 M-12 -10 q4 -6 10 -4 M28 -10 q-3 -6 -9 -5" stroke="#8E241D" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M-46 -12 Q-44 22 0 26 Q44 22 46 -12 Q40 -2 0 0 Q-40 -2 -46 -12 Z" fill="#F4F1EA" stroke="${SC_INK}" stroke-width="2.5"/>
    <path d="M-36 4 q8 6 16 0 q8 6 16 0 q8 6 16 0 q8 6 16 0" stroke="#2F6FB0" stroke-width="2" fill="none"/>
    <path d="M-14 26 h28 l-4 6 h-20 z" fill="#E9E2D3" stroke="${SC_INK}" stroke-width="2"/>
  </g>`;
}

// 비법서: 낡은 책에 '麻辣烫秘法'
function sceneBook(x, y, s = 1, glow = false, torn = false) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    ${glow ? '<circle cx="18" cy="22" r="34" fill="#FFE9A8" opacity="0.55"/><circle cx="18" cy="22" r="24" fill="#FFF6C9" opacity="0.6"/>' : ''}
    <rect x="0" y="0" width="36" height="46" rx="2" fill="#C9A14A" stroke="${SC_INK}" stroke-width="2"/>
    <rect x="4" y="4" width="28" height="38" fill="#8E241D"/>
    <rect x="12" y="7" width="12" height="32" fill="#F4EBDD" stroke="${SC_INK}" stroke-width="1"/>
    <text x="18" y="16" text-anchor="middle" font-size="7" fill="${SC_INK}" font-family="'Ma Shan Zheng', serif">麻</text>
    <text x="18" y="24" text-anchor="middle" font-size="7" fill="${SC_INK}" font-family="'Ma Shan Zheng', serif">辣</text>
    <text x="18" y="32" text-anchor="middle" font-size="7" fill="${SC_INK}" font-family="'Ma Shan Zheng', serif">秘</text>
    ${torn ? '<path d="M36 10 l-6 5 6 5 -6 6 6 5 -6 6" stroke="#F4EBDD" stroke-width="3" fill="none"/>' : ''}
  </g>`;
}

// 아직 얼굴이 없는 '당신': 삿갓을 쓰고 검을 멘 무인의 먹빛 뒷모습
function sceneHeroSilhouette(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="${SC_INK}">
    <path d="M-30 18 Q0 -6 30 18 Q0 12 -30 18 Z"/>
    <circle cx="0" cy="26" r="11"/>
    <path d="M-16 36 Q0 30 16 36 L22 92 L-22 92 Z"/>
    <path d="M14 30 L40 -8" stroke="${SC_INK}" stroke-width="4"/>
    <path d="M36 -2 l8 -10" stroke="#C9A14A" stroke-width="3"/>
    <path d="M-22 92 l4 18 M22 92 l-4 18" stroke="${SC_INK}" stroke-width="7" stroke-linecap="round"/>
  </g>`;
}

function sceneBubble(x, y, text, w = 64) {
  return `<g><rect x="${x}" y="${y}" width="${w}" height="20" rx="10" fill="#FFFBF3" stroke="${SC_INK}" stroke-width="1.5"/>
    <text x="${x + w / 2}" y="${y + 14}" text-anchor="middle" font-size="10" fill="${SC_INK}" font-family="'Ma Shan Zheng', 'Noto Serif SC', serif">${text}</text></g>`;
}

function sceneFire(x, y, s = 1) {
  return `<g class="fire" transform="translate(${x} ${y}) scale(${s})">
    <path d="M0 0 Q-10 -14 -2 -26 Q0 -16 6 -20 Q4 -34 14 -40 Q12 -22 20 -16 Q24 -8 16 0 Z" fill="#E0624F" stroke="#8E241D" stroke-width="1.5"/>
    <path d="M4 0 Q0 -8 6 -14 Q8 -8 12 -10 Q14 -4 10 0 Z" fill="#F2C230"/>
  </g>`;
}

// 장면 모음
const SCENES = {
  // 1) 평화로운 중원의 마라탕집
  peace: () => `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" class="story-svg">
    ${sceneSky('#F6E7C8', '#F3EAD9', 'peace')}
    <circle cx="256" cy="46" r="22" fill="#F2C230" opacity="0.6"/>
    ${sceneMountains('#5E7D6B', 0.25)}
    <path d="M0 176 L320 176 L320 200 L0 200 Z" fill="#C9B48A"/>
    ${sceneInn(90, 70, 1)}
    <path d="M20 176 q6 -20 2 -40 M30 176 q-4 -16 4 -32 M290 176 q-6 -18 0 -36" stroke="#3F7D6B" stroke-width="4" fill="none"/>
    <circle cx="24" cy="132" r="10" fill="#E8A3B0" opacity="0.8"/><circle cx="292" cy="136" r="9" fill="#E8A3B0" opacity="0.8"/>
  </svg>`,
  // 2) 사람들과 무인들이 지상 최고의 마라탕이라 칭찬
  praise: () => {
    const people = [0, 1, 2, 3].map(() => randomAvatar());
    return `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" class="story-svg">
    ${sceneSky('#FBEFD9', '#F3EAD9', 'praise')}
    <circle cx="160" cy="110" r="70" fill="#FFF6C9" opacity="0.7"/>
    ${sceneBowl(160, 112, 1.25)}
    ${embedSvg(renderAvatar(people[0], 'win'), 4, 92, 70, 94)}
    ${embedSvg(renderAvatar(people[1], 'win'), 58, 104, 62, 84)}
    ${embedSvg(renderAvatar(people[2], 'win'), 200, 104, 62, 84)}
    ${embedSvg(renderAvatar(people[3], 'win'), 250, 92, 70, 94)}
    ${sceneBubble(8, 58, '天下第一!', 62)}
    ${sceneBubble(250, 58, '太好吃了!', 62)}
    ${sceneBubble(124, 14, '最好吃的麻辣烫!', 74)}
  </svg>`;
  },
  // 3) 마왕이 마을을 습격해 비법서를 훔쳐 감
  attack: () => `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" class="story-svg">
    ${sceneSky('#3A1A2E', '#8E241D', 'attack')}
    <circle cx="60" cy="44" r="20" fill="#E0624F" opacity="0.8"/>
    ${sceneMountains('#1F1A17', 0.5)}
    <path d="M0 176 L320 176 L320 200 L0 200 Z" fill="#3A2A22"/>
    ${sceneInn(20, 82, 0.9, true)}
    ${sceneFire(30, 160, 1.1)}${sceneFire(120, 164, 0.9)}${sceneFire(70, 120, 0.8)}
    ${embedSvg(renderMonster('demonking'), 168, 30, 150, 150)}
    ${sceneBook(196, 112, 0.9)}
    <text x="250" y="24" text-anchor="middle" font-size="16" fill="#F2D58A" font-family="'Ma Shan Zheng', serif" class="story-shout">哈哈哈!</text>
  </svg>`,
  // 4) 망연자실한 주인에게 '당신'이 비법서를 되찾겠다고 약속
  vow: () => `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" class="story-svg">
    ${sceneSky('#E9D8C0', '#F3EAD9', 'vow')}
    ${sceneMountains('#6B5E52', 0.2)}
    <path d="M0 176 L320 176 L320 200 L0 200 Z" fill="#B8A588"/>
    ${sceneInn(-30, 76, 0.75, true)}
    ${embedSvg(renderShopkeeper('sad'), 62, 66, 96, 120)}
    <path d="M150 112 q4 8 0 14" stroke="#7FC3E0" stroke-width="3" fill="none"/>
    ${sceneHeroSilhouette(236, 70, 0.95)}
    ${sceneBubble(54, 40, '我的秘法书…', 72)}
    ${sceneBubble(196, 26, '我一定找回来!', 78)}
  </svg>`,
  // 5) 비법서는 여섯 장으로 찢겨 여섯 마왕성에 — 여정의 시작
  journey: () => `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" class="story-svg">
    ${sceneSky('#F3E2C0', '#F3EAD9', 'journey')}
    ${sceneMountains('#2B2321', 0.22)}
    <path d="M30 178 Q100 150 160 160 T300 120" stroke="#C9A14A" stroke-width="3" fill="none" stroke-dasharray="6 6"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => {
    const x = 40 + i * 48;
    const y = 160 - i * 9;
    return `<g><rect x="${x - 12}" y="${y - 36}" width="24" height="28" fill="#2B2321" opacity="0.85"/><path d="M${x - 16} ${y - 36} L${x} ${y - 50} L${x + 16} ${y - 36} Z" fill="#6B2A8C"/>
      <text x="${x}" y="${y - 16}" text-anchor="middle" font-size="11" fill="#F2D58A" font-family="'Ma Shan Zheng', serif">${'一二三四五六'[i]}</text>
      <rect x="${x - 5}" y="${y - 6}" width="10" height="13" fill="#F4EBDD" stroke="${SC_INK}" stroke-width="1" transform="rotate(${i % 2 ? 8 : -8} ${x} ${y})"/></g>`;
  }).join('')}
    ${sceneHeroSilhouette(20, 96, 0.6)}
  </svg>`,
  // 비법서 한 장을 되찾음
  page: (n) => `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" class="story-svg">
    ${sceneSky('#FBEFD9', '#F3EAD9', 'page')}
    <g class="story-rays"><circle cx="160" cy="96" r="80" fill="#FFF6C9" opacity="0.7"/></g>
    ${embedSvg(renderMonster('demonking', 'ko'), 18, 96, 90, 90)}
    ${embedSvg(renderAvatar(getAvatar(), 'win', withSect(gamePlayer().equip)), 216, 52, 96, 128)}
    <g transform="translate(160 92) rotate(-6)"><rect x="-26" y="-34" width="52" height="68" fill="#F4EBDD" stroke="${SC_INK}" stroke-width="2"/>
      <text x="0" y="-12" text-anchor="middle" font-size="11" fill="#8E241D" font-family="'Ma Shan Zheng', serif">秘法书</text>
      <text x="0" y="12" text-anchor="middle" font-size="22" fill="${SC_INK}" font-family="'Ma Shan Zheng', serif">第${'一二三四五六'[n - 1]}章</text>
      <path d="M-18 22 h36 M-18 28 h28" stroke="#C9A14A" stroke-width="1.5"/></g>
    ${[...Array(n)].map((_, i) => `<rect x="${104 + i * 20}" y="176" width="14" height="16" fill="#C9A14A" stroke="${SC_INK}" stroke-width="1"/>`).join('')}
    ${[...Array(RECIPE_PAGES - n)].map((_, i) => `<rect x="${104 + (n + i) * 20}" y="176" width="14" height="16" fill="none" stroke="#A89A86" stroke-width="1" stroke-dasharray="2 2"/>`).join('')}
  </svg>`,
  // 엔딩 1) 여섯 장이 모여 비법서가 빛남
  reunite: () => `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" class="story-svg">
    ${sceneSky('#2B1F16', '#5C3A1A', 'reunite')}
    <g class="story-rays"><circle cx="160" cy="100" r="90" fill="#FFE9A8" opacity="0.35"/></g>
    ${[0, 1, 2, 3, 4, 5].map((i) => {
    const a = (i / 6) * Math.PI * 2;
    return `<rect x="${160 + Math.cos(a) * 78 - 7}" y="${100 + Math.sin(a) * 64 - 9}" width="14" height="18" fill="#F4EBDD" stroke="#C9A14A" stroke-width="1.5" class="flying-page"/>`;
  }).join('')}
    ${sceneBook(136, 70, 1.35, true)}
  </svg>`,
  // 엔딩 2) 마라탕집이 다시 문을 열고 모두가 기뻐함
  reopen: () => `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" class="story-svg">
    ${sceneSky('#F6E7C8', '#F3EAD9', 'reopen')}
    ${sceneMountains('#5E7D6B', 0.22)}
    <path d="M0 176 L320 176 L320 200 L0 200 Z" fill="#C9B48A"/>
    ${sceneInn(150, 62, 1.05)}
    ${embedSvg(renderShopkeeper('happy'), 110, 80, 80, 100)}
    ${embedSvg(renderAvatar(getAvatar(), 'win', withSect(gamePlayer().equip)), 10, 66, 90, 120)}
    ${sceneBowl(86, 170, 0.55)}
    ${sceneBubble(110, 50, '谢谢你，英雄!', 76)}
    ${[30, 70, 250, 290].map((x, i) => `<path d="M${x} 10 v${12 + (i % 2) * 8}" stroke="#2B2321" stroke-width="1"/><ellipse cx="${x}" cy="${28 + (i % 2) * 8}" rx="7" ry="9" fill="#D9363E" stroke="#2B2321" stroke-width="1.5" class="lantern-sway"/>`).join('')}
  </svg>`,
};

// 이야기 묶음: [장면, 글]
function storyPages(kind, n) {
  const sect = mySect();
  const name = typeof playerDisplayName === 'function' ? playerDisplayName() : '나';
  if (kind === 'prologue') {
    return [
      ['peace', '옛날 옛적에 평화로운 중원에는 전설의 마라탕집이 있었습니다.'],
      ['praise', '마을 사람들과 무인들은 그 마라탕이 지상 최고의 마라탕이라고 칭찬했습니다.'],
      ['attack', '이 소식이 마왕에게 들어가자, 마왕은 마을을 습격하여 마라탕 비법서를 훔쳐갔습니다.'],
      ['vow', '망연자실한 마라탕집 주인에게 당신은 비법서를 되찾아오겠노라 말합니다.'],
      ['journey', '마왕은 비법서를 여섯 장으로 찢어 중원 여섯 지역(HSK 1~6급)의 마왕성에 숨겼다고 합니다. 이제 당신의 여정이 시작됩니다!'],
    ];
  }
  if (kind === 'page') {
    return [['page', n >= RECIPE_PAGES
      ? `마왕을 물리치고 마지막 비법서까지 되찾았습니다! 드디어 여섯 장이 모두 모였어요. (${n}/${RECIPE_PAGES})`
      : `마왕을 물리치고 마라탕 비법서 한 장을 되찾았습니다! 지금까지 ${n}장을 모았어요. (${n}/${RECIPE_PAGES}) 남은 비법서를 찾아 다음 마왕성으로 떠나요.`]];
  }
  // 엔딩
  return [
    ['reunite', '여섯 장의 비법서가 하나로 모이자, 황금빛이 번쩍이며 전설의 마라탕 비법서가 되살아났습니다.'],
    ['reopen', `되찾은 비법서를 건네받은 주인은 눈물을 흘리며 다시 가게 문을 열었습니다. 중원에 다시 얼얼하고 향긋한 마라탕 냄새가 퍼졌습니다.`],
    ['reopen', `${sect ? `${sect.name}의 ` : ''}${name && name !== '나' ? `${name} 대협은` : '무인인 당신은'} 천하제일 마라탕을 지켜 낸 영웅으로 중원에 이름을 떨쳤습니다. — 끝 —`],
  ];
}

// ---------- 이야기 화면 ----------
const storyScreen = document.getElementById('story-screen');
const storyArt = document.getElementById('story-art');
const storyText = document.getElementById('story-text');
const storyNext = document.getElementById('btn-story-next');
const storyStepEl = document.getElementById('story-step');
let storyQueue = [];
let storyIndex = 0;
let storyDone = null;
let storyTyping = null;
let storyFull = '';

function openStory(kind, n, onDone) {
  storyQueue = storyPages(kind, n);
  storyIndex = 0;
  storyDone = onDone;
  storyScreen.className = `story-screen story-${kind}`;
  storyScreen.style.display = '';
  showStoryPage();
}

function showStoryPage() {
  const [scene, text] = storyQueue[storyIndex];
  storyArt.innerHTML = SCENES[scene](recoveredPageCount());
  storyArt.classList.remove('turn');
  void storyArt.offsetWidth;
  storyArt.classList.add('turn');
  storyStepEl.textContent = storyQueue.length > 1 ? `${storyIndex + 1} / ${storyQueue.length}` : '';
  storyNext.textContent = storyIndex === storyQueue.length - 1 ? '좋아, 가자!' : '다음 ›';
  if (scene === 'attack' || scene === 'reunite') Sfx.begin();
  typeStory(text);
}

// 글자가 한 자씩 써짐 (누르면 바로 끝까지)
function typeStory(text) {
  clearInterval(storyTyping);
  storyFull = text;
  const chars = Array.from(text);
  if (reduceMotion.matches) {
    storyText.textContent = text;
    return;
  }
  let i = 0;
  storyText.textContent = '';
  storyTyping = setInterval(() => {
    i += 1;
    storyText.textContent = chars.slice(0, i).join('');
    if (i >= chars.length) clearInterval(storyTyping);
  }, 38);
}

function advanceStory() {
  if (storyText.textContent !== storyFull) {
    clearInterval(storyTyping);
    storyText.textContent = storyFull;
    return;
  }
  storyIndex += 1;
  if (storyIndex >= storyQueue.length) {
    closeStory();
    return;
  }
  Sfx.tap();
  showStoryPage();
}

function closeStory() {
  clearInterval(storyTyping);
  storyScreen.style.display = 'none';
  const done = storyDone;
  storyDone = null;
  if (done) done();
}

storyNext.addEventListener('click', (e) => {
  e.stopPropagation();
  advanceStory();
});
storyScreen.addEventListener('click', (e) => {
  if (e.target.closest('#btn-story-skip')) return;
  advanceStory();
});
document.getElementById('btn-story-skip').addEventListener('click', (e) => {
  e.stopPropagation();
  closeStory();
});

// ---------- 문파 선택 ----------
const sectSelect = document.getElementById('sect-select');
const sectCards = document.getElementById('sect-cards');
const btnSectJoin = document.getElementById('btn-sect-join');
let sectChoice = null;
let sectDone = null;

function sectEmblem(s, size = 'big') {
  // 화산파는 매화 문장 그림, 나머지는 문파 글자
  // 문파마다 그린 문장 (없으면 문파 글자)
  const crest = typeof SECT_CRESTS !== 'undefined' && SECT_CRESTS[s.id];
  const inner = crest
    ? `<svg viewBox="-8 -8 16 16" class="crest-svg" aria-hidden="true">${crest(0, 0, 1)}</svg>`
    : `<b>${s.emblem}</b>`;
  return `<span class="sect-emblem ${size}${crest ? ` crest crest-${s.id}` : ''}" style="--sect:${s.color};--sect-light:${s.light}">${inner}</span>`;
}

function openSectSelect(onDone) {
  sectDone = onDone;
  sectChoice = storyState().sect || null;
  renderSectCards();
  sectSelect.style.display = '';
}

function renderSectCards() {
  sectCards.replaceChildren(...SECTS.map((s) => {
    const card = document.createElement('button');
    card.className = `sect-card${sectChoice === s.id ? ' selected' : ''}`;
    card.style.setProperty('--sect', s.color);
    card.style.setProperty('--sect-light', s.light);
    card.setAttribute('aria-pressed', String(sectChoice === s.id));
    // 내 캐릭터(아직 없으면 기본 캐릭터)가 이 문파 옷을 입은 모습 + 문파 문장
    const model = (typeof getAvatar === 'function' && getAvatar()) || DEFAULT_AVATAR;
    card.innerHTML = `<span class="sect-model" aria-hidden="true">${renderAvatar(model, sectChoice === s.id ? 'win' : 'normal', { sect: s.id })}${sectEmblem(s)}</span>
      <span class="sect-info"><strong>${s.name} <small>${s.han}</small></strong>
      <em>“${s.motto}”</em><span class="sect-bonus">${s.desc}</span></span>`;
    card.addEventListener('click', () => {
      sectChoice = s.id;
      Sfx.tap();
      renderSectCards();
    });
    return card;
  }));
  btnSectJoin.disabled = !sectChoice;
  btnSectJoin.textContent = sectChoice ? `${SECT_BY_ID[sectChoice].name}에 입문하기` : '문파를 골라 주세요';
}

btnSectJoin.addEventListener('click', () => {
  if (!sectChoice) return;
  const s = SECT_BY_ID[sectChoice];
  if (!confirm(`${s.name}(${s.han})에 입문할까요?\n한 번 입문한 문파는 바꿀 수 없어요.`)) return;
  storyState().sect = sectChoice;
  scheduleRecordSave();
  Sfx.levelUp();
  sectSelect.style.display = 'none';
  const done = sectDone;
  sectDone = null;
  if (done) done();
});

// ---------- 게임 모드 들어올 때 이어질 이야기 ----------
// 프롤로그 → 문파 선택 → (캐릭터 만들기·튜토리얼은 stage-game.js) / 마왕을 물리친 뒤 → 비법서 장면 → 엔딩
// 이어서 보여 줄 이야기가 있으면 보여 주고 true, 없으면 false
function runStoryGate(onContinue) {
  const st = storyState();
  if (!st.prologue) {
    openStory('prologue', 0, () => {
      st.prologue = true;
      scheduleRecordSave();
      onContinue();
    });
    return true;
  }
  if (!st.sect) {
    openSectSelect(onContinue);
    return true;
  }
  // 문파를 고른 뒤: 문파 옷을 입은 기본 캐릭터로 꾸미기 창을 열어 외모를 한 번 확정
  if (!userRecord.game.avatarLocked) {
    openAvatarMaker(onContinue);
    return true;
  }
  if (!getAvatar()) return false;
  // 마왕성을 깬 급수마다 비법서 한 장
  for (let lv = 1; lv <= RECIPE_PAGES; lv++) {
    const prog = userRecord.game[lv];
    const total = typeof levelStages === 'function' ? levelStages(lv).length : Infinity;
    if (prog && prog.cleared >= total && !st.pages[lv]) {
      st.pages[lv] = true;
      scheduleRecordSave();
      openStory('page', recoveredPageCount(), onContinue);
      return true;
    }
  }
  if (recoveredPageCount() >= RECIPE_PAGES && !st.ending) {
    st.ending = true;
    scheduleRecordSave();
    openStory('ending', 0, onContinue);
    return true;
  }
  return false;
}
