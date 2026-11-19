// ========================================
// 게임 모드 캐릭터 — 성별·헤어스타일·머리색·표정·피부·옷 색을 골라 SVG 로 그립니다.
// ========================================
// stage-game.js 보다 먼저 불러오는 일반 스크립트입니다.
// 저장 위치: userRecord.game.avatar (계정·게스트 기록과 함께 저장)
// renderAvatar(avatar, mood) 는 고정된 도형만으로 만든 SVG 문자열을 돌려줍니다 (사용자 입력이 들어가지 않음).
//   mood: 'normal' | 'hurt' | 'win'
// renderAvatar(avatar, mood, equip) 의 equip = { weapon, hat, armor, pants: 장비 id } 이면
// 무기는 주먹에, 모자·투구는 머리에, 갑옷은 몸통(+어깨)에, 바지는 다리에 그립니다.

const AVATAR_OPTIONS = {
  gender: [
    { id: 'm', label: '남자' },
    { id: 'f', label: '여자' },
  ],
  hair: [
    { id: 'short', label: '짧은 머리' },
    { id: 'spiky', label: '삐죽 머리' },
    { id: 'side', label: '옆 가르마' },
    { id: 'bob', label: '단발' },
    { id: 'pony', label: '포니테일' },
    { id: 'twin', label: '양갈래' },
    { id: 'long', label: '긴 생머리' },
  ],
  hairColor: [
    { id: '#2B2321', label: '검정' },
    { id: '#6B4226', label: '갈색' },
    { id: '#C98B3A', label: '금발' },
    { id: '#B5463A', label: '빨강' },
    { id: '#5B6FB5', label: '파랑' },
    { id: '#D9D2CC', label: '은발' },
  ],
  face: [
    { id: 'smile', label: '미소' },
    { id: 'grin', label: '활짝' },
    { id: 'cool', label: '자신만만' },
    { id: 'fierce', label: '진지' },
    { id: 'wink', label: '윙크' },
  ],
  skin: [
    { id: '#FFE0C7', label: '밝은' },
    { id: '#F5C7A1', label: '보통' },
    { id: '#D99B6C', label: '구릿빛' },
    { id: '#9C6644', label: '갈색' },
  ],
  outfit: [
    { id: '#E8844A', label: '주황' },
    { id: '#4A90D9', label: '파랑' },
    { id: '#3DAA6D', label: '초록' },
    { id: '#8A5CC0', label: '보라' },
    { id: '#E05A7A', label: '분홍' },
    { id: '#3A3F4B', label: '검정' },
  ],
};

const AVATAR_GROUPS = [
  { key: 'gender', title: '성별', kind: 'chip' },
  { key: 'hair', title: '헤어스타일', kind: 'preview' },
  { key: 'hairColor', title: '머리 색', kind: 'swatch' },
  { key: 'face', title: '표정', kind: 'preview' },
  { key: 'skin', title: '피부', kind: 'swatch' },
  { key: 'outfit', title: '옷 색', kind: 'swatch' },
];

const DEFAULT_AVATAR = { gender: 'm', hair: 'short', hairColor: '#2B2321', face: 'smile', skin: '#F5C7A1', outfit: '#E8844A' };

function validAvatar(a) {
  if (!a || typeof a !== 'object') return null;
  const out = {};
  for (const key of Object.keys(DEFAULT_AVATAR)) {
    out[key] = AVATAR_OPTIONS[key].some((o) => o.id === a[key]) ? a[key] : DEFAULT_AVATAR[key];
  }
  return out;
}

function getAvatar() {
  return (userRecord.game && validAvatar(userRecord.game.avatar)) || null;
}

function saveAvatar(avatar) {
  if (!userRecord.game) userRecord.game = {};
  userRecord.game.avatar = avatar;
  scheduleRecordSave();
  if (typeof syncMyProgress === 'function') syncMyProgress();
}

// 작은 얼굴 그림 (친구 표시용): 전신 그림에서 머리 부분만 잘라 보여 줌
function renderAvatarFace(avatar, hat = null) {
  return renderAvatar(avatar, 'normal', { hat })
    .replace('viewBox="0 0 120 160"', 'viewBox="24 4 72 72"')
    .replace('class="avatar-svg"', 'class="avatar-svg avatar-face"');
}

function randomAvatar() {
  const pick = (key) => AVATAR_OPTIONS[key][Math.floor(Math.random() * AVATAR_OPTIONS[key].length)].id;
  const gender = pick('gender');
  // 성별에 어울리는 머리를 조금 더 자주 고르되, 모든 조합이 가능
  const hairPool = gender === 'm' ? ['short', 'spiky', 'side', 'short', 'spiky', 'bob', 'pony'] : ['bob', 'pony', 'twin', 'long', 'bob', 'long', 'side'];
  return {
    gender,
    hair: hairPool[Math.floor(Math.random() * hairPool.length)],
    hairColor: pick('hairColor'),
    face: pick('face'),
    skin: pick('skin'),
    outfit: pick('outfit'),
  };
}

// 색을 조금 어둡게 (옷 그림자·바지 등)
function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.min(255, Math.round(v * (1 - amount))));
  return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => f(v).toString(16).padStart(2, '0')).join('')}`;
}

// ---------- SVG ----------
// viewBox 0 0 120 160, 머리 중심 (60, 50) 반지름 28. 캐릭터는 왼쪽(몬스터 쪽)을 보고 앞쪽 팔(.arm-front)로 주먹을 뻗습니다.
function hairBack(style, color) {
  switch (style) {
    case 'bob':
      return `<path d="M31 46 C30 16 90 16 89 46 L91 80 C86 84 79 83 76 79 L76 58 L44 58 L44 79 C41 83 34 84 29 80 Z" fill="${color}"/>`;
    case 'long':
      return `<path d="M31 46 C29 15 91 15 89 46 L94 108 C84 112 74 106 70 100 L50 100 C46 106 36 112 26 108 Z" fill="${color}"/>`;
    case 'pony':
      return `<path d="M84 40 C104 40 108 64 100 88 C97 96 90 98 88 92 C94 74 92 56 82 50 Z" fill="${color}"/><circle cx="85" cy="44" r="4" fill="#E05A7A"/>`;
    case 'twin':
      return `<path d="M33 44 C14 46 10 72 18 92 C21 98 28 98 28 92 C24 76 26 60 36 52 Z" fill="${color}"/><path d="M87 44 C106 46 110 72 102 92 C99 98 92 98 92 92 C96 76 94 60 84 52 Z" fill="${color}"/><circle cx="34" cy="47" r="4" fill="#E05A7A"/><circle cx="86" cy="47" r="4" fill="#E05A7A"/>`;
    default:
      return '';
  }
}

function hairFront(style, color) {
  switch (style) {
    case 'spiky':
      return `<path d="M30 50 L33 30 L41 34 L45 15 L53 29 L60 10 L67 29 L75 15 L79 34 L87 30 L90 50 C83 40 71 36 60 38 C49 36 37 40 30 50 Z" fill="${color}"/>`;
    case 'side':
      return `<path d="M31 52 C29 20 91 18 89 50 C85 44 81 40 77 37 C67 46 48 45 38 40 C35 44 33 48 31 52 Z" fill="${color}"/>`;
    case 'bob':
      return `<path d="M32 47 C33 21 87 21 88 47 C80 41 70 39 60 39 C50 39 40 41 32 47 Z" fill="${color}"/>`;
    case 'long':
      return `<path d="M32 50 C31 19 89 19 88 50 C84 42 74 36 66 37 L62 44 L58 37 C48 37 37 42 32 50 Z" fill="${color}"/>`;
    case 'pony':
    case 'twin':
      return `<path d="M32 48 C32 20 88 20 88 48 C82 40 72 36 60 37 C48 36 38 40 32 48 Z" fill="${color}"/>`;
    default: // short
      return `<path d="M31 50 C30 19 90 19 89 50 C86 44 82 41 78 40 C70 38 64 41 60 40 C52 38 44 40 38 42 C35 44 33 47 31 50 Z" fill="${color}"/><rect x="31" y="46" width="4" height="10" rx="2" fill="${color}"/><rect x="85" y="46" width="4" height="10" rx="2" fill="${color}"/>`;
  }
}

function faceParts(face, mood) {
  const ink = '#2B2321';
  if (mood === 'hurt') {
    return `<path d="M45 48 L53 54 M53 48 L45 54 M67 48 L75 54 M75 48 L67 54" stroke="${ink}" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M51 66 Q55 62 59 66 Q63 70 67 66" fill="none" stroke="${ink}" stroke-width="2.4" stroke-linecap="round"/>`;
  }
  if (mood === 'win') {
    return `<path d="M44 52 Q49 46 54 52 M66 52 Q71 46 76 52" fill="none" stroke="${ink}" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M50 61 Q60 74 70 61 Z" fill="#B23A48"/>`;
  }
  const blush = '<ellipse cx="43" cy="60" rx="4.5" ry="2.6" fill="#F28B8B" opacity="0.55"/><ellipse cx="77" cy="60" rx="4.5" ry="2.6" fill="#F28B8B" opacity="0.55"/>';
  switch (face) {
    case 'grin':
      return `${blush}<path d="M44 52 Q49 46 54 52 M66 52 Q71 46 76 52" fill="none" stroke="${ink}" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M50 61 Q60 73 70 61 Z" fill="#B23A48"/>`;
    case 'cool':
      return `${blush}<path d="M43 44 L54 46 M66 46 L77 43" stroke="${ink}" stroke-width="2.4" stroke-linecap="round"/>
        <ellipse cx="49" cy="52" rx="3" ry="3.6" fill="${ink}"/><ellipse cx="71" cy="52" rx="3" ry="3.6" fill="${ink}"/>
        <path d="M53 65 Q61 68 68 62" fill="none" stroke="${ink}" stroke-width="2.4" stroke-linecap="round"/>`;
    case 'fierce':
      return `<path d="M43 43 L54 48 M77 43 L66 48" stroke="${ink}" stroke-width="2.8" stroke-linecap="round"/>
        <ellipse cx="49" cy="53" rx="3" ry="3.4" fill="${ink}"/><ellipse cx="71" cy="53" rx="3" ry="3.4" fill="${ink}"/>
        <path d="M53 66 L67 66" stroke="${ink}" stroke-width="2.6" stroke-linecap="round"/>`;
    case 'wink':
      return `${blush}<ellipse cx="49" cy="52" rx="3" ry="3.8" fill="${ink}"/>
        <path d="M66 53 Q71 48 76 53" fill="none" stroke="${ink}" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M52 63 Q60 70 68 63" fill="none" stroke="${ink}" stroke-width="2.4" stroke-linecap="round"/>`;
    default: // smile
      return `${blush}<ellipse cx="49" cy="52" rx="3" ry="3.8" fill="${ink}"/><ellipse cx="71" cy="52" rx="3" ry="3.8" fill="${ink}"/>
        <circle cx="50" cy="50.5" r="1" fill="#fff"/><circle cx="72" cy="50.5" r="1" fill="#fff"/>
        <path d="M52 63 Q60 70 68 63" fill="none" stroke="${ink}" stroke-width="2.4" stroke-linecap="round"/>`;
  }
}

// 무기: 앞쪽 팔(주먹 위치 31,115)에서 아래로 뻗게 그림 → 주먹을 휘두르면 몬스터 쪽을 향함
// [주먹 아래에 깔리는 부분, 주먹 위에 덮는 부분]
function weaponParts(id) {
  switch (id) {
    case 'stick':
      return ['<rect x="28.5" y="110" width="5" height="30" rx="2" fill="#8B5A2B" stroke="#5C3A1A" stroke-width="1"/>', ''];
    case 'glove':
      return ['', '<circle cx="31" cy="115" r="9.5" fill="#D9363E" stroke="#8E1F25" stroke-width="2"/><path d="M25 112 h12" stroke="#fff" stroke-width="2" opacity="0.7"/>'];
    case 'woodsword':
      return ['<rect x="28" y="118" width="6" height="32" rx="2" fill="#D9B47A" stroke="#9C7A45" stroke-width="1"/><rect x="23" y="116" width="16" height="4" rx="2" fill="#8B5A2B"/>', ''];
    case 'knuckle':
      return ['', '<rect x="23.5" y="110" width="15" height="7" rx="3" fill="#B0B6BC" stroke="#5F6368" stroke-width="1.5"/><path d="M26 110 l1 -4 1 4 M31 110 l1 -4 1 4 M36 110 l1 -4 1 4" stroke="#5F6368" stroke-width="1.5" fill="#B0B6BC"/>'];
    case 'brush':
      return ['<rect x="29" y="108" width="4.5" height="30" rx="2" fill="#C9A15B" stroke="#8B6A2B" stroke-width="1"/><path d="M27.5 137 Q31.2 156 35 137 Z" fill="#2B2321"/>', ''];
    case 'bronzesword':
      return ['<path d="M28 119 L34 119 L33 152 L31 156 L29 152 Z" fill="#D49A5A" stroke="#8E5A2B" stroke-width="1"/><rect x="22" y="116" width="18" height="4.5" rx="2" fill="#8E5A2B"/>', ''];
    case 'goldbrush':
      return ['<rect x="29" y="106" width="4.5" height="32" rx="2" fill="#F2C230" stroke="#B8860B" stroke-width="1"/><path d="M27.5 137 Q31.2 157 35 137 Z" fill="#2B2321"/><circle cx="31.2" cy="147" r="5" fill="#FFE066" opacity="0.45"/>', ''];
    case 'dagger':
      return ['<path d="M29 119 L33 119 L32.5 140 L31 145 L29.5 140 Z" fill="#D8DDE1" stroke="#5F6368" stroke-width="1"/><rect x="25" y="116" width="12" height="4" rx="2" fill="#5C3A1A"/>', ''];
    case 'spear':
      return ['<rect x="29.5" y="92" width="3.5" height="66" rx="1.5" fill="#8B5A2B" stroke="#5C3A1A" stroke-width="0.8"/><path d="M28 156 L31.2 172 L34.5 156 Z" fill="#D8DDE1" stroke="#5F6368" stroke-width="1"/><path d="M28 152 q3 4 6.5 0" stroke="#C0392B" stroke-width="3" fill="none"/>', ''];
    case 'glaive':
      return ['<rect x="29.5" y="94" width="4" height="58" rx="2" fill="#5C3A1A"/><path d="M31 150 Q22 158 24 174 Q34 170 36 152 Z" fill="#C9CED3" stroke="#4A5056" stroke-width="1.2"/><path d="M26 160 q4 -2 6 2" stroke="#2F6FB0" stroke-width="1.5" fill="none"/><circle cx="31.5" cy="150" r="3" fill="#C9A14A"/>', ''];
    case 'jadesword':
      return ['<path d="M28.5 120 L34 120 L33.2 156 L31.2 161 L29.3 156 Z" fill="#7FD3C0" stroke="#2C5E50" stroke-width="1"/><path d="M31.2 124 v30" stroke="#E6F2EE" stroke-width="1" opacity="0.8"/><rect x="21" y="116" width="20" height="5" rx="2.5" fill="#C9A14A" stroke="#8E6A1E" stroke-width="0.8"/><circle cx="31.2" cy="140" r="9" fill="#7FD3C0" opacity="0.3"/>', ''];
    case 'dragonbrush':
      return ['<rect x="28.5" y="104" width="5.5" height="34" rx="2.5" fill="#C0392B" stroke="#7A1F16" stroke-width="1"/><path d="M28.5 112 h5.5 M28.5 122 h5.5 M28.5 132 h5.5" stroke="#F2C230" stroke-width="2"/><path d="M27 137 Q31.2 160 35.5 137 Z" fill="#2B2321"/><circle cx="31.2" cy="148" r="8" fill="#FF6B3D" opacity="0.4"/>', ''];
    default:
      return ['', ''];
  }
}

function hatPart(id) {
  switch (id) {
    case 'straw':
      return '<path d="M40 28 Q41 8 60 8 Q79 8 80 28 Z" fill="#E8C872" stroke="#B8954A" stroke-width="1.5"/><rect x="40" y="22" width="40" height="5" fill="#C0392B"/><ellipse cx="60" cy="28" rx="40" ry="7" fill="#EED38A" stroke="#B8954A" stroke-width="1.5"/>';
    case 'cap':
      return '<path d="M33 31 Q35 7 60 7 Q85 7 87 31 Z" fill="#4A90D9" stroke="#2F6BB0" stroke-width="1.5"/><ellipse cx="33" cy="31" rx="17" ry="5" fill="#2F6BB0"/><circle cx="60" cy="8" r="3" fill="#2F6BB0"/>';
    case 'band':
      return '<rect x="30" y="32" width="60" height="8" rx="3" fill="#E05252" stroke="#A93636" stroke-width="1"/><path d="M89 34 L102 28 L99 38 Z M89 37 L101 44 L94 46 Z" fill="#E05252"/><circle cx="60" cy="36" r="3" fill="#fff"/>';
    case 'gradcap':
      return '<rect x="40" y="18" width="40" height="12" rx="3" fill="#2B2B33"/><path d="M24 18 L60 6 L96 18 L60 30 Z" fill="#3A3A44" stroke="#1E1E24" stroke-width="1.5"/><path d="M60 18 L92 21 L92 34" stroke="#F2C230" stroke-width="2" fill="none"/><circle cx="92" cy="36" r="3" fill="#F2C230"/>';
    case 'scholar':
      return '<rect x="46" y="2" width="28" height="24" rx="5" fill="rgba(30,30,36,0.9)"/><ellipse cx="60" cy="26" rx="46" ry="6.5" fill="rgba(30,30,36,0.82)"/><path d="M34 28 Q30 60 44 74 M86 28 Q90 60 76 74" stroke="#2B2B33" stroke-width="1.2" fill="none"/>';
    case 'leatherhelm':
      return '<path d="M30 42 Q30 12 60 12 Q90 12 90 42 Z" fill="#8B5A3C" stroke="#5C3A1A" stroke-width="1.5"/><path d="M38 20 Q60 10 82 20" stroke="#A8744E" stroke-width="2" fill="none"/><rect x="29" y="36" width="62" height="7" rx="3" fill="#6B4228" stroke="#4A2E1C" stroke-width="1"/><path d="M30 42 L28 64 Q33 66 36 60 L36 43 Z M90 42 L92 64 Q87 66 84 60 L84 43 Z" fill="#7A5236" stroke="#4A2E1C" stroke-width="1"/>';
    case 'ironhelm':
      return '<path d="M30 42 Q30 10 60 10 Q90 10 90 42 Z" fill="#8A9199" stroke="#4A5056" stroke-width="1.5"/><path d="M60 10 V40" stroke="#5F6368" stroke-width="2.5"/><path d="M57 10 L60 0 L63 10 Z" fill="#B0B6BC" stroke="#4A5056" stroke-width="1"/><rect x="29" y="36" width="62" height="7" rx="3" fill="#5F6368"/><circle cx="40" cy="39.5" r="1.6" fill="#D8DDE1"/><circle cx="52" cy="39.5" r="1.6" fill="#D8DDE1"/><circle cx="68" cy="39.5" r="1.6" fill="#D8DDE1"/><circle cx="80" cy="39.5" r="1.6" fill="#D8DDE1"/><path d="M29 42 L25 70 L36 68 L37 43 Z M91 42 L95 70 L84 68 L83 43 Z" fill="#6E757D" stroke="#4A5056" stroke-width="1"/><path d="M27 52 h9 M26 60 h10 M84 52 h9 M84 60 h10" stroke="#4A5056" stroke-width="1"/>';
    case 'generalhelm':
      return '<path d="M56 4 Q50 -12 60 -16 Q70 -12 64 4 Z" fill="#D9363E"/><path d="M58 -4 q2 -8 4 0" stroke="#FF8A80" stroke-width="1.5" fill="none"/><rect x="57" y="2" width="6" height="8" fill="#C9A14A"/><path d="M29 42 Q29 9 60 9 Q91 9 91 42 Z" fill="#2B2321" stroke="#C9A14A" stroke-width="2"/><path d="M40 14 Q60 6 80 14 M34 26 Q60 16 86 26" stroke="#C9A14A" stroke-width="1.5" fill="none"/><rect x="28" y="35" width="64" height="8" rx="3" fill="#A8342B" stroke="#C9A14A" stroke-width="1.5"/><circle cx="60" cy="39" r="3" fill="#F2C230"/><path d="M28 42 L22 74 L37 71 L37 43 Z M92 42 L98 74 L83 71 L83 43 Z" fill="#A8342B" stroke="#C9A14A" stroke-width="1.2"/><path d="M24 54 h12 M23 63 h13 M84 54 h12 M84 63 h13" stroke="#C9A14A" stroke-width="1"/>';
    case 'dragonhelm':
      return '<path d="M36 22 Q20 8 22 -6 Q30 8 42 14 Z M84 22 Q100 8 98 -6 Q90 8 78 14 Z" fill="#E8CF8A" stroke="#8E6A1E" stroke-width="1.5" stroke-linejoin="round"/><path d="M29 42 Q29 8 60 8 Q91 8 91 42 Z" fill="#F2C230" stroke="#8E6A1E" stroke-width="2"/><path d="M60 8 Q52 20 60 30 Q68 20 60 8 Z" fill="#C0392B" stroke="#8E6A1E" stroke-width="1"/><path d="M38 24 q6 -4 10 0 q6 -4 10 0 M62 24 q6 -4 10 0 q6 -4 10 0" stroke="#B8892E" stroke-width="1.5" fill="none"/><rect x="28" y="35" width="64" height="8" rx="3" fill="#B8892E" stroke="#8E6A1E" stroke-width="1.5"/><circle cx="60" cy="39" r="3.5" fill="#7FD3C0" stroke="#2C5E50" stroke-width="1"/><path d="M28 42 L21 76 L37 72 L37 43 Z M92 42 L99 76 L83 72 L83 43 Z" fill="#E3B341" stroke="#8E6A1E" stroke-width="1.2"/><path d="M23 54 q6 3 13 0 M22 64 q7 3 14 0 M84 54 q6 3 13 0 M84 64 q7 3 14 0" stroke="#8E6A1E" stroke-width="1" fill="none"/>';
    case 'crown':
      return '<path d="M35 28 L37 6 L48 18 L60 0 L72 18 L83 6 L85 28 Z" fill="#F2C230" stroke="#B8860B" stroke-width="2" stroke-linejoin="round"/><circle cx="60" cy="20" r="3.5" fill="#E05252"/><circle cx="46" cy="23" r="2.5" fill="#4A90D9"/><circle cx="74" cy="23" r="2.5" fill="#3DAA6D"/>';
    default:
      return '';
  }
}

// 갑옷: [몸통에 덮는 부분, 앞쪽 팔 어깨에 붙는 견갑]
function armorParts(id) {
  const torso = 'M37 87 Q60 77 83 87 L85 106 L35 106 Z';
  const scales = (fill, stroke) => {
    let out = '';
    for (let r = 0; r < 4; r++) {
      const y = 90 + r * 4.5;
      for (let x = 40 + (r % 2) * 3; x < 80; x += 6) out += `<path d="M${x} ${y} q3 4 6 0" fill="${fill}" stroke="${stroke}" stroke-width="0.8"/>`;
    }
    return out;
  };
  const tassets = (fill, stroke, trim) => `<path d="M35 106 L40 126 L50 128 L52 108 Z M68 108 L70 128 L80 126 L85 106 Z" fill="${fill}" stroke="${stroke}" stroke-width="1"/>
    <path d="M37 113 L51 114 M38 120 L51 121 M69 114 L83 113 M69 121 L82 120" stroke="${trim}" stroke-width="1.2"/>`;
  const pauldron = (fill, stroke, trim) => `<path d="M30 86 Q38 78 48 86 L46 96 Q37 98 30 94 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/><path d="M32 91 Q39 88 46 91" stroke="${trim}" stroke-width="1.2" fill="none"/>`;
  switch (id) {
    case 'paddedarmor':
      return [`<path d="${torso}" fill="#B49C72" stroke="#7A6440" stroke-width="1.2"/>
        <path d="M38 92 h44 M37 97 h46 M36 102 h48" stroke="#7A6440" stroke-width="1" stroke-dasharray="2 2"/>
        <path d="M60 80 V106" stroke="#7A6440" stroke-width="1.5"/>`, ''];
    case 'leatherarmor':
      return [`<path d="${torso}" fill="#7A5236" stroke="#4A2E1C" stroke-width="1.2"/>
        <path d="M44 84 L76 104 M76 84 L44 104" stroke="#4A2E1C" stroke-width="3"/>
        <rect x="56" y="91" width="8" height="6" rx="1.5" fill="#C9A14A" stroke="#8E6A1E" stroke-width="0.8"/>`,
        pauldron('#7A5236', '#4A2E1C', '#A8744E')];
    case 'scalearmor':
      return [`<path d="${torso}" fill="#8A9199" stroke="#4A5056" stroke-width="1.2"/>${scales('#A9B0B7', '#5F6368')}
        <rect x="35" y="104" width="50" height="4" rx="1.5" fill="#5F6368"/>
        ${tassets('#8A9199', '#4A5056', '#5F6368')}`,
        pauldron('#8A9199', '#4A5056', '#D8DDE1')];
    case 'lamellar':
      return [`<path d="${torso}" fill="#A8342B" stroke="#5E1A14" stroke-width="1.2"/>
        ${[42, 48, 54, 60, 66, 72, 78].map((x) => `<path d="M${x} 84 V106" stroke="#7A1F16" stroke-width="1"/>`).join('')}
        <path d="M37 92 h46 M36 99 h48" stroke="#C9A14A" stroke-width="1.5"/>
        <circle cx="60" cy="95" r="4" fill="#C9A14A" stroke="#8E6A1E" stroke-width="1"/>
        ${tassets('#A8342B', '#5E1A14', '#C9A14A')}`,
        pauldron('#A8342B', '#5E1A14', '#C9A14A')];
    case 'goldarmor':
      return [`<path d="${torso}" fill="#E3B341" stroke="#8E6A1E" stroke-width="1.4"/>${scales('#F2C230', '#B8892E')}
        <circle cx="60" cy="94" r="7" fill="#C0392B" stroke="#8E6A1E" stroke-width="1.5"/>
        <path d="M56 94 q4 -6 8 0 q-4 6 -8 0" fill="#F2C230"/>
        ${tassets('#E3B341', '#8E6A1E', '#C0392B')}`,
        `${pauldron('#E3B341', '#8E6A1E', '#C0392B')}<path d="M30 86 L26 80 L34 83 Z" fill="#E8CF8A" stroke="#8E6A1E" stroke-width="0.8"/>`];
    default:
      return ['', ''];
  }
}

// 바지 (입으면 여자 캐릭터도 치마를 짧게 하고 바지가 보이게)
function pantsPart(id) {
  const styles = {
    cottonpants: { fill: '#E9E2D3', stroke: '#A89A82', band: '#8C7A5B' },
    trainpants: { fill: '#3F7D6B', stroke: '#24493F', band: '#E9E2D3' },
    warriorpants: { fill: '#2B2321', stroke: '#141010', band: '#B8332A' },
    cloudpants: { fill: '#7FA7D9', stroke: '#3E6AA3', band: '#FFFFFF', cloud: true },
    qilinpants: { fill: '#C9A14A', stroke: '#8E6A1E', band: '#B8332A', scale: true },
  };
  const st = styles[id];
  if (!st) return '';
  const leg = (x) => `<path d="M${x - 1} 116 L${x + 15} 116 L${x + 14} 140 Q${x + 7} 145 ${x} 140 Z" fill="${st.fill}" stroke="${st.stroke}" stroke-width="1.2"/>
    <rect x="${x}" y="138" width="14" height="5" rx="2" fill="${st.band}"/>`
    + (st.cloud ? `<path d="M${x + 3} 126 q3 -4 6 0 q3 -3 4 1" stroke="#fff" stroke-width="1.5" fill="none"/>` : '')
    + (st.scale ? `<path d="M${x + 2} 124 q3 3 5 0 q3 3 5 0 M${x + 2} 130 q3 3 5 0 q3 3 5 0" stroke="#B8332A" stroke-width="1" fill="none"/>` : '');
  return leg(44) + leg(62);
}

function renderAvatar(avatarIn, mood = 'normal', equip = null) {
  const [weaponUnder, weaponOver] = weaponParts(equip && equip.weapon);
  const hat = hatPart(equip && equip.hat);
  const [armorBody, armorShoulder] = armorParts(equip && equip.armor);
  const pants = pantsPart(equip && equip.pants);
  const a = validAvatar(avatarIn) || DEFAULT_AVATAR;
  const skin = a.skin;
  const skinDark = shade(skin, 0.12);
  const cloth = a.outfit;
  const clothDark = shade(cloth, 0.25);
  // 동양풍 도포: 교차 깃(交領) + 허리띠, 남자는 무릎까지 오는 도포와 바지, 여자는 발목까지 오는 긴 치마
  const legs = pants
    ? `${pants}<path d="M35 108 L85 108 L90 ${a.gender === 'f' ? 128 : 126} L30 ${a.gender === 'f' ? 128 : 126} Z" fill="${a.gender === 'f' ? clothDark : cloth}"/><path d="M60 110 L60 126" stroke="${clothDark}" stroke-width="2"/>`
    : a.gender === 'f'
    ? `<path d="M36 108 L84 108 L94 146 L26 146 Z" fill="${clothDark}"/><path d="M48 112 L44 144 M72 112 L76 144" stroke="${cloth}" stroke-width="2" opacity="0.6"/>`
    : `<rect x="44" y="118" width="14" height="29" rx="4" fill="#3A3530"/><rect x="62" y="118" width="14" height="29" rx="4" fill="#3A3530"/>
       <path d="M35 108 L85 108 L90 130 L30 130 Z" fill="${cloth}"/><path d="M60 110 L60 130" stroke="${clothDark}" stroke-width="2"/>`;
  const collar = `<path d="M49 82 L69 106" stroke="#F4EBDD" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M71 82 L61 94" stroke="#F4EBDD" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M49 82 L69 106" stroke="${clothDark}" stroke-width="1" stroke-linecap="round" opacity="0.5"/>`;
  const sash = `<rect x="35" y="101" width="50" height="8" rx="2" fill="${a.gender === 'f' ? '#C9A14A' : '#2B2321'}"/>
    <path d="M74 105 L80 118 L76 119 Z M74 105 L71 119 L68 117 Z" fill="${a.gender === 'f' ? '#C9A14A' : '#2B2321'}"/>
    <circle cx="74" cy="105" r="3.2" fill="#B8332A"/>`;
  return `<svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" class="avatar-svg" overflow="visible">
  <ellipse cx="60" cy="152" rx="30" ry="5" fill="rgba(0,0,0,0.18)"/>
  ${hairBack(a.hair, a.hairColor)}
  ${legs}
  <ellipse cx="50" cy="148" rx="9" ry="5" fill="#2B2321"/><ellipse cx="70" cy="148" rx="9" ry="5" fill="#2B2321"/>
  <g class="arm-back"><path d="M80 88 Q91 99 89 111" fill="none" stroke="${cloth}" stroke-width="12" stroke-linecap="round"/><path d="M84 108 L95 108" stroke="#F4EBDD" stroke-width="3" stroke-linecap="round"/><circle cx="89" cy="115" r="6" fill="${skin}"/></g>
  <path d="M38 88 Q60 78 82 88 L86 110 L34 110 Z" fill="${cloth}"/>
  ${collar}
  ${sash}
  ${armorBody}
  <rect x="54" y="72" width="12" height="10" rx="3" fill="${skinDark}"/>
  <circle cx="60" cy="50" r="28" fill="${skin}"/>
  <ellipse cx="32" cy="54" rx="4" ry="6" fill="${skin}"/><ellipse cx="88" cy="54" rx="4" ry="6" fill="${skin}"/>
  ${faceParts(a.face, mood)}
  ${hairFront(a.hair, a.hairColor)}
  ${hat}
  <g class="arm-front"><path d="M40 88 Q29 99 31 111" fill="none" stroke="${cloth}" stroke-width="12" stroke-linecap="round"/><path d="M25 108 L37 108" stroke="#F4EBDD" stroke-width="3" stroke-linecap="round"/>${armorShoulder}${weaponUnder}<circle class="fist" cx="31" cy="115" r="6.5" fill="${skin}" stroke="${skinDark}" stroke-width="1.2"/>${weaponOver}</g>
</svg>`;
}

// ---------- 캐릭터 만들기 화면 ----------
const avatarMaker = document.getElementById('avatar-maker');
const avatarPreview = document.getElementById('avatar-preview');
const avatarOptionsEl = document.getElementById('avatar-options');
let draftAvatar = null;
let avatarMakerDone = null; // 완료 후 실행할 함수

function openAvatarMaker(onDone) {
  draftAvatar = { ...(getAvatar() || randomAvatar()) };
  avatarMakerDone = onDone;
  document.getElementById('btn-avatar-back').style.display = getAvatar() ? '' : 'none';
  renderAvatarMaker();
  avatarMaker.style.display = '';
}

function renderAvatarMaker() {
  avatarPreview.innerHTML = renderAvatar(draftAvatar);
  avatarOptionsEl.replaceChildren(...AVATAR_GROUPS.map((group) => {
    const section = document.createElement('div');
    section.className = 'avatar-group';
    const title = document.createElement('span');
    title.className = 'avatar-group-title';
    title.textContent = group.title;
    const row = document.createElement('div');
    row.className = `avatar-choices ${group.kind}`;
    row.setAttribute('role', 'radiogroup');
    row.setAttribute('aria-label', group.title);
    AVATAR_OPTIONS[group.key].forEach((opt) => {
      const btn = document.createElement('button');
      const selected = draftAvatar[group.key] === opt.id;
      btn.className = 'avatar-choice' + (selected ? ' selected' : '');
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', String(selected));
      btn.setAttribute('aria-label', opt.label);
      btn.title = opt.label;
      if (group.kind === 'swatch') {
        btn.style.setProperty('--swatch', opt.id);
      } else if (group.kind === 'preview') {
        const mini = document.createElement('span');
        mini.className = 'avatar-mini';
        mini.innerHTML = renderAvatar({ ...draftAvatar, [group.key]: opt.id });
        const label = document.createElement('span');
        label.textContent = opt.label;
        btn.append(mini, label);
      } else {
        btn.textContent = opt.label;
      }
      btn.addEventListener('click', () => {
        draftAvatar[group.key] = opt.id;
        renderAvatarMaker();
      });
      row.appendChild(btn);
    });
    section.append(title, row);
    return section;
  }));
}

document.getElementById('btn-avatar-random').addEventListener('click', () => {
  draftAvatar = randomAvatar();
  renderAvatarMaker();
});

document.getElementById('btn-avatar-done').addEventListener('click', () => {
  saveAvatar(validAvatar(draftAvatar));
  avatarMaker.style.display = 'none';
  if (avatarMakerDone) avatarMakerDone();
});

document.getElementById('btn-avatar-back').addEventListener('click', () => {
  avatarMaker.style.display = 'none';
  if (avatarMakerDone) avatarMakerDone();
});
