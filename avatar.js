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
    .replace('viewBox="0 0 120 160"', 'viewBox="28 18 64 64"')
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
  const dark = shade(color, 0.25);
  switch (style) {
    case 'bob':
      return `<path d="M30 44 C29 14 91 14 90 44 L92 78 L84 72 L80 80 L74 70 L46 70 L40 80 L36 72 L28 78 Z" fill="${color}"/>`;
    case 'long':
      return `<path d="M30 44 C28 12 92 12 90 44 L95 100 L88 94 L86 108 L78 98 L72 106 L66 98 L54 98 L48 106 L42 98 L34 108 L32 94 L25 100 Z" fill="${color}"/>
        <path d="M36 60 L34 96 M84 60 L86 96" stroke="${dark}" stroke-width="1.5" opacity="0.6"/>`;
    case 'pony':
      return `<path d="M80 30 C100 26 112 46 106 74 L100 66 L98 92 L92 80 L86 96 L88 62 C88 50 84 42 76 38 Z" fill="${color}"/>
        <path d="M78 30 L84 26 L86 34 Z" fill="#B8332A"/>`;
    case 'twin':
      return `<path d="M34 40 C16 42 10 66 16 92 L22 84 L24 100 L30 88 L32 60 C32 52 34 46 38 44 Z" fill="${color}"/>
        <path d="M86 40 C104 42 110 66 104 92 L98 84 L96 100 L90 88 L88 60 C88 52 86 46 82 44 Z" fill="${color}"/>
        <path d="M32 40 l6 -4 2 6 z M88 40 l-6 -4 -2 6 z" fill="#B8332A"/>`;
    default:
      return `<path d="M31 44 C30 16 90 16 89 44 L90 56 L84 50 L36 50 L30 56 Z" fill="${color}"/>`;
  }
}

// 앞머리: 끝이 뾰족하게 갈라지는 무협풍 머리카락
function hairFront(style, color) {
  const dark = shade(color, 0.3);
  const shine = `<path d="M44 26 Q54 20 66 21" stroke="#FFFFFF" stroke-width="2" fill="none" opacity="0.18" stroke-linecap="round"/>`;
  switch (style) {
    case 'spiky':
      return `<path d="M29 52 L27 30 L37 34 L35 13 L47 25 L51 4 L60 21 L69 4 L73 25 L85 13 L83 34 L93 30 L91 52 L85 41 L81 48 L75 35 L67 43 L60 31 L53 43 L45 35 L39 48 L35 41 Z" fill="${color}"/>
        <path d="M51 6 L56 24 M69 6 L64 24" stroke="${dark}" stroke-width="1.4"/>${shine}`;
    case 'side':
      return `<path d="M30 54 C28 20 50 15 64 16 C82 18 93 30 90 52 L86 43 Q76 35 62 41 Q50 47 39 60 Q42 48 47 41 Q39 45 33 55 Z" fill="${color}"/>
        <path d="M62 41 Q52 48 44 56 M74 36 Q62 40 54 50" stroke="${dark}" stroke-width="1.4" fill="none"/>${shine}`;
    case 'bob':
      return `<path d="M31 47 C31 11 89 11 89 47 L85 40 L81 46 L76 38 L70 45 L64 37 L58 45 L52 37 L46 45 L40 38 L35 46 Z" fill="${color}"/>
        <path d="M52 37 L50 44 M64 37 L66 44" stroke="${dark}" stroke-width="1.3"/>`;
    case 'long':
      return `<path d="M31 54 C29 11 91 11 89 54 Q84 41 74 34 L70 42 L66 32 Q62 30 60 34 Q58 30 54 32 L50 42 L46 34 Q36 41 31 54 Z" fill="${color}"/>
        <path d="M60 34 L60 22" stroke="${dark}" stroke-width="1.4"/>`;
    case 'pony':
    case 'twin':
      return `<path d="M31 49 C31 11 89 11 89 49 L84 40 L79 46 L74 36 L67 44 L60 34 L53 44 L46 36 L41 46 L36 40 Z" fill="${color}"/>
        <path d="M60 34 L60 22" stroke="${dark}" stroke-width="1.4"/>`;
    default: // short
      return `<path d="M30 50 C29 20 48 15 62 16 C80 17 92 28 90 50 L86 41 L83 49 L78 36 L72 45 L66 32 L60 43 L54 31 L48 44 L42 34 L38 47 L35 39 Z" fill="${color}"/>
        <path d="M30 46 L31 60 L35 52 Z M90 46 L89 60 L85 52 Z" fill="${color}"/>
        <path d="M54 31 L52 42 M66 32 L68 42" stroke="${dark}" stroke-width="1.3"/>${shine}`;
  }
}

// 아몬드 모양 눈 (side: -1 왼쪽 눈, 1 오른쪽 눈 — 눈꼬리가 바깥으로 올라감)
function avEye(cx, cy, side, { lid = 0, iris = '#3A2A22' } = {}) {
  const ink = '#1F1A17';
  const ox = cx + side * 6.5;
  const ix = cx - side * 5.5;
  return `<path d="M${ix} ${cy + 0.5} Q${cx} ${cy - 5 + lid} ${ox} ${cy - 1.8} Q${cx} ${cy + 3.6} ${ix} ${cy + 0.5} Z" fill="#FFFDF7"/>
    <circle cx="${cx + side * 0.6}" cy="${cy - 0.4 + lid * 0.3}" r="2.7" fill="${iris}"/>
    <circle cx="${cx + side * 0.6 - 0.9}" cy="${cy - 1.4 + lid * 0.3}" r="0.85" fill="#FFFFFF"/>
    <path d="M${ix - side * 0.5} ${cy + 0.2} Q${cx} ${cy - 5.4 + lid} ${ox + side * 1.6} ${cy - 3.2}" stroke="${ink}" stroke-width="2" fill="none" stroke-linecap="round"/>
    ${lid ? `<path d="M${ix} ${cy - 1.2 + lid * 0.5} Q${cx} ${cy - 3.6 + lid} ${ox} ${cy - 2.2 + lid * 0.4}" stroke="${ink}" stroke-width="1.3" fill="none"/>` : ''}`;
}

function avBrows(kind) {
  const ink = '#1F1A17';
  const w = 'stroke-width="2.6" stroke-linecap="round" fill="none"';
  switch (kind) {
    case 'fierce': return `<path d="M41 41 L55 46" stroke="${ink}" ${w}/><path d="M79 41 L65 46" stroke="${ink}" ${w}/>`;
    case 'flat': return `<path d="M42 44 L55 44" stroke="${ink}" ${w}/><path d="M78 44 L65 44" stroke="${ink}" ${w}/>`;
    case 'up': return `<path d="M42 42 Q48 38 55 41" stroke="${ink}" ${w}/><path d="M78 42 Q72 38 65 41" stroke="${ink}" ${w}/>`;
    default: return `<path d="M42 43 Q48 40 55 42.5" stroke="${ink}" ${w}/><path d="M78 43 Q72 40 65 42.5" stroke="${ink}" ${w}/>`;
  }
}

function faceParts(face, mood) {
  const ink = '#1F1A17';
  const nose = `<path d="M60 55 L58.6 61 L61.2 61.2" stroke="${shade('#C98E6A', 0)}" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"/>`;
  if (mood === 'hurt') {
    return `${avBrows('fierce')}<path d="M44 50 L54 53 L44 55 M76 50 L66 53 L76 55" stroke="${ink}" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>${nose}
      <path d="M53 66 L67 66 L66 69 L54 69 Z" fill="#FFFDF7" stroke="${ink}" stroke-width="1.6" stroke-linejoin="round"/><path d="M57 66 v3 M60 66 v3 M63 66 v3" stroke="${ink}" stroke-width="1"/>`;
  }
  if (mood === 'win') {
    return `${avBrows('up')}${avEye(49, 51, -1)}${avEye(71, 51, 1)}${nose}
      <path d="M53 64 Q60 71 67 64 Q60 66.5 53 64 Z" fill="#8E241D" stroke="${ink}" stroke-width="1.4" stroke-linejoin="round"/>`;
  }
  switch (face) {
    case 'grin':
      return `${avBrows('up')}${avEye(49, 51, -1)}${avEye(71, 51, 1)}${nose}<path d="M54 65 Q61 69 67 62.5" stroke="${ink}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    case 'cool':
      return `${avBrows('flat')}${avEye(49, 51, -1, { lid: 2.2 })}${avEye(71, 51, 1, { lid: 2.2 })}${nose}<path d="M55.5 66 L64.5 65.5" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>`;
    case 'fierce':
      return `${avBrows('fierce')}${avEye(49, 52, -1, { lid: 1.4, iris: '#5A1A12' })}${avEye(71, 52, 1, { lid: 1.4, iris: '#5A1A12' })}${nose}<path d="M54.5 67 Q60 64.5 65.5 67" stroke="${ink}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    case 'wink':
      return `${avBrows('up')}${avEye(49, 51, -1)}<path d="M65 51.5 Q71 48 77 50.5" stroke="${ink}" stroke-width="2.2" fill="none" stroke-linecap="round"/>${nose}<path d="M54 65 Q60 69 66 64" stroke="${ink}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    default: // smile: 차분하고 늠름한 얼굴
      return `${avBrows()}${avEye(49, 51, -1)}${avEye(71, 51, 1)}${nose}<path d="M55 65.5 Q60 68 65 65.5" stroke="${ink}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
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

// 매화 한 송이: 동그란 꽃잎 다섯 장 + 노란 꽃술이 사방으로 퍼짐
function plumBlossom(cx, cy, k = 1) {
  const petals = [0, 72, 144, 216, 288].map((a) => {
    const rad = (a - 90) * Math.PI / 180;
    const px = cx + Math.cos(rad) * 2.5 * k;
    const py = cy + Math.sin(rad) * 2.5 * k;
    return `<circle cx="${px.toFixed(2)}" cy="${py.toFixed(2)}" r="${(2.1 * k).toFixed(2)}" fill="#FBE1E7" stroke="#D9536F" stroke-width="${(0.55 * k).toFixed(2)}"/>`;
  }).join('');
  const stamens = [0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
    const rad = a * Math.PI / 180;
    const x2 = cx + Math.cos(rad) * 1.9 * k;
    const y2 = cy + Math.sin(rad) * 1.9 * k;
    return `<path d="M${cx} ${cy} L${x2.toFixed(2)} ${y2.toFixed(2)}" stroke="#C9A14A" stroke-width="${(0.35 * k).toFixed(2)}"/><circle cx="${x2.toFixed(2)}" cy="${y2.toFixed(2)}" r="${(0.38 * k).toFixed(2)}" fill="#E3A92B"/>`;
  }).join('');
  return `<g>${petals}<circle cx="${cx}" cy="${cy}" r="${(1.25 * k).toFixed(2)}" fill="#F7C9D3"/>${stamens}<circle cx="${cx}" cy="${cy}" r="${(0.6 * k).toFixed(2)}" fill="#9C6B1E"/></g>`;
}

// 화산파 문장(이 게임만의 디자인): 붉은 원 테두리 안에 문양화한 매화, 뒤로 비스듬한 검
function hwasanCrest(cx, cy, k = 1) {
  const R = 6.2 * k;
  const petals = [0, 72, 144, 216, 288].map((a) => {
    const rad = (a - 90) * Math.PI / 180;
    return `<circle cx="${(cx + Math.cos(rad) * 2.45 * k).toFixed(2)}" cy="${(cy + Math.sin(rad) * 2.45 * k).toFixed(2)}" r="${(1.75 * k).toFixed(2)}" fill="#B8332A"/>`;
  }).join('');
  const lines = [0, 72, 144, 216, 288].map((a) => {
    const rad = (a - 90) * Math.PI / 180;
    const x2 = cx + Math.cos(rad) * 2.6 * k;
    const y2 = cy + Math.sin(rad) * 2.6 * k;
    return `<path d="M${cx} ${cy} L${x2.toFixed(2)} ${y2.toFixed(2)}" stroke="#FFF6E6" stroke-width="${(0.45 * k).toFixed(2)}"/><circle cx="${x2.toFixed(2)}" cy="${y2.toFixed(2)}" r="${(0.45 * k).toFixed(2)}" fill="#F2C230"/>`;
  }).join('');
  return `<g>
    <path d="M${cx - R * 1.15} ${cy + R * 1.15} L${cx + R * 1.15} ${cy - R * 1.15}" stroke="#5F6368" stroke-width="${(1.2 * k).toFixed(2)}" stroke-linecap="round"/>
    <path d="M${cx - R * 1.15} ${cy + R * 1.15} l${(1.6 * k).toFixed(2)} -${(1.6 * k).toFixed(2)}" stroke="#5C3A1A" stroke-width="${(1.8 * k).toFixed(2)}" stroke-linecap="round"/>
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="#FFFBF3" stroke="#B8332A" stroke-width="${(1.1 * k).toFixed(2)}"/>
    <circle cx="${cx}" cy="${cy}" r="${(R - 1.3 * k).toFixed(2)}" fill="none" stroke="#B8332A" stroke-width="${(0.4 * k).toFixed(2)}"/>
    ${petals}<circle cx="${cx}" cy="${cy}" r="${(1.1 * k).toFixed(2)}" fill="#8E241D"/>${lines}
  </g>`;
}

// 무당파 문장: 남색 팔각 테두리 + 팔괘의 효(爻) 막대 8개 + 가운데 태극
function wudangCrest(cx, cy, k = 1) {
  const R = 6.4 * k;
  const oct = [...Array(8)].map((_, i) => {
    const a = (i * 45 + 22.5) * Math.PI / 180;
    return `${(cx + Math.cos(a) * R).toFixed(2)},${(cy + Math.sin(a) * R).toFixed(2)}`;
  }).join(' ');
  // 효 막대: 양효(긴 막대)·음효(가운데가 끊긴 막대)를 번갈아
  const bars = [...Array(8)].map((_, i) => {
    const a = i * 45;
    const r = 4.9 * k;
    const len = 2.2 * k;
    const broken = i % 2 === 1;
    const seg = broken
      ? `<path d="M${-len} 0 L${-len * 0.25} 0 M${len * 0.25} 0 L${len} 0" stroke="#F4EBDD" stroke-width="${(0.7 * k).toFixed(2)}"/>`
      : `<path d="M${-len} 0 L${len} 0" stroke="#F4EBDD" stroke-width="${(0.7 * k).toFixed(2)}"/>`;
    return `<g transform="translate(${cx} ${cy}) rotate(${a}) translate(0 ${-r})">${seg}</g>`;
  }).join('');
  const t = 2.9 * k;
  return `<g>
    <polygon points="${oct}" fill="#24394F" stroke="#C9A14A" stroke-width="${(0.6 * k).toFixed(2)}"/>
    ${bars}
    <circle cx="${cx}" cy="${cy}" r="${t}" fill="#F4EBDD" stroke="#1F1A17" stroke-width="${(0.3 * k).toFixed(2)}"/>
    <path d="M${cx} ${cy - t} A${t} ${t} 0 0 1 ${cx} ${cy + t} A${t / 2} ${t / 2} 0 0 1 ${cx} ${cy} A${t / 2} ${t / 2} 0 0 0 ${cx} ${cy - t} Z" fill="#1F1A17"/>
    <circle cx="${cx}" cy="${cy - t / 2}" r="${(0.5 * k).toFixed(2)}" fill="#1F1A17"/>
    <circle cx="${cx}" cy="${cy + t / 2}" r="${(0.5 * k).toFixed(2)}" fill="#F4EBDD"/>
  </g>`;
}

// 개방 문장: 새끼줄로 엮은 둥근 테 + 엇갈린 대나무 지팡이와 붉은 끈을 맨 표주박
function gaibangCrest(cx, cy, k = 1) {
  const R = 6.2 * k;
  return `<g>
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="#F1E3C8" stroke="#8C6A44" stroke-width="${(1.3 * k).toFixed(2)}"/>
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#C9A27A" stroke-width="${(0.9 * k).toFixed(2)}" stroke-dasharray="${(1.1 * k).toFixed(2)} ${(0.9 * k).toFixed(2)}"/>
    <path d="M${cx - 4 * k} ${cy + 4.2 * k} L${cx + 4 * k} ${cy - 4.2 * k}" stroke="#5E8C3E" stroke-width="${(1.3 * k).toFixed(2)}" stroke-linecap="round"/>
    <path d="M${cx - 1.6 * k} ${cy + 1.2 * k} l${0.9 * k} ${0.9 * k} M${cx + 1.4 * k} ${cy - 1.9 * k} l${0.9 * k} ${0.9 * k}" stroke="#3F6B2A" stroke-width="${(0.5 * k).toFixed(2)}"/>
    <g transform="translate(${cx + 0.6 * k} ${cy + 0.4 * k}) rotate(-28)">
      <circle cx="0" cy="${-2 * k}" r="${(1.25 * k).toFixed(2)}" fill="#C98E3A" stroke="#4A3828" stroke-width="${(0.35 * k).toFixed(2)}"/>
      <ellipse cx="0" cy="${1.4 * k}" rx="${(2 * k).toFixed(2)}" ry="${(2.4 * k).toFixed(2)}" fill="#C98E3A" stroke="#4A3828" stroke-width="${(0.35 * k).toFixed(2)}"/>
      <path d="M${-1.1 * k} ${-0.7 * k} q${1.1 * k} ${0.6 * k} ${2.2 * k} 0" stroke="#B8332A" stroke-width="${(0.55 * k).toFixed(2)}" fill="none"/>
      <path d="M0 ${-3.2 * k} v${-0.9 * k}" stroke="#5C3A1A" stroke-width="${(0.6 * k).toFixed(2)}"/>
    </g>
  </g>`;
}

const SECT_CRESTS = { hwasan: hwasanCrest, wudang: wudangCrest, gaibang: gaibangCrest };

// ---------- 문파 옷 ----------
// equip.sect 가 있으면 도포를 문파 옷으로: 바탕색·깃·소매 끝·가슴 문양·장식이 바뀌고,
// 내가 고른 '옷 색'은 허리띠 색으로 남음
const SECT_UNIFORM = {
  // 화산파: 흰 비단 도포 + 붉은 깃·소매, 가슴에 매화 자수, 머리에 매화 장식
  hwasan: {
    cloth: '#F4EFE6', dark: '#D9CEBF', collar: '#B8332A', cuff: '#B8332A',
    // 가슴: 화산파 문장
    chest: hwasanCrest(73.5, 93, 1),
    head: '',
    extra: '<path d="M30 130 L90 130" stroke="#B8332A" stroke-width="2.5" opacity="0.9"/>',
  },
  // 무당파: 짙은 남색 도사 도포 + 흰 깃, 가슴에 태극, 머리에 도관
  wudang: {
    cloth: '#33506E', dark: '#24394F', collar: '#F4EBDD', cuff: '#F4EBDD',
    chest: wudangCrest(73.5, 93, 1),
    head: '<path d="M52 24 Q52 14 60 13 Q68 14 68 24 Z" fill="#2B2321"/><rect x="51" y="21" width="18" height="5" rx="2" fill="#C9A14A"/><path d="M60 13 L60 7" stroke="#C9A14A" stroke-width="2"/>',
    hideHeadWithHat: true,
    extra: '<path d="M36 112 L84 112" stroke="#F4EBDD" stroke-width="1.5" opacity="0.6"/>',
  },
  // 개방: 해진 갈색 옷에 기운 조각, 새끼줄 허리띠, 허리에 술 호리병
  gaibang: {
    cloth: '#8B6A48', dark: '#6B4E34', collar: '#C9A27A', cuff: '#C9A27A', rope: true,
    chest: '<rect x="42" y="92" width="7" height="7" fill="#A8925E" stroke="#4A3828" stroke-width="0.8" stroke-dasharray="1.5 1"/>' + gaibangCrest(73.5, 93, 1),
    head: '',
    extra: '<rect x="38" y="116" width="9" height="8" fill="#A8925E" stroke="#4A3828" stroke-width="0.8" stroke-dasharray="1.5 1" transform="rotate(10 42 120)"/><path d="M78 118 l3 6 -4 4 3 4" stroke="#4A3828" stroke-width="1" fill="none"/>'
      + '<g transform="translate(86 112)"><path d="M0 -6 v3" stroke="#C9A27A" stroke-width="1.5"/><circle cy="-1" r="3" fill="#C98E3A" stroke="#4A3828" stroke-width="1"/><ellipse cy="6" rx="4.5" ry="5.5" fill="#C98E3A" stroke="#4A3828" stroke-width="1"/><path d="M-2 0 q2 1.5 4 0" stroke="#B8332A" stroke-width="1.2" fill="none"/></g>',
  },
};

// 내 캐릭터 그리기용 장비: 장착 장비 + 내 문파
function withSect(equip) {
  const sect = typeof mySect === 'function' ? mySect() : null;
  return { ...(equip || {}), sect: sect ? sect.id : null };
}

function renderAvatar(avatarIn, mood = 'normal', equip = null) {
  const [weaponUnder, weaponOver] = weaponParts(equip && equip.weapon);
  const hat = hatPart(equip && equip.hat);
  const [armorBody, armorShoulder] = armorParts(equip && equip.armor);
  const pants = pantsPart(equip && equip.pants);
  const a = validAvatar(avatarIn) || DEFAULT_AVATAR;
  const skin = a.skin;
  const skinDark = shade(skin, 0.12);
  const u = equip && equip.sect ? SECT_UNIFORM[equip.sect] : null;
  const cloth = u ? u.cloth : a.outfit;
  const clothDark = u ? u.dark : shade(cloth, 0.25);
  const collarColor = u ? u.collar : '#F4EBDD';
  const cuffColor = u ? u.cuff : '#F4EBDD';
  const sashColor = u ? a.outfit : (a.gender === 'f' ? '#C9A14A' : '#2B2321');
  // 동양풍 도포: 교차 깃(交領) + 허리띠, 남자는 무릎까지 오는 도포와 바지, 여자는 발목까지 오는 긴 치마
  const legs = pants
    ? `${pants}<path d="M35 108 L85 108 L90 ${a.gender === 'f' ? 128 : 126} L30 ${a.gender === 'f' ? 128 : 126} Z" fill="${a.gender === 'f' ? clothDark : cloth}"/><path d="M60 110 L60 126" stroke="${clothDark}" stroke-width="2"/>`
    : a.gender === 'f'
    ? `<path d="M36 108 L84 108 L94 146 L26 146 Z" fill="${clothDark}"/><path d="M48 112 L44 144 M72 112 L76 144" stroke="${cloth}" stroke-width="2" opacity="0.6"/>`
    : `<rect x="44" y="118" width="14" height="29" rx="4" fill="#3A3530"/><rect x="62" y="118" width="14" height="29" rx="4" fill="#3A3530"/>
       <path d="M35 108 L85 108 L90 130 L30 130 Z" fill="${cloth}"/><path d="M60 110 L60 130" stroke="${clothDark}" stroke-width="2"/>`;
  const collar = `<path d="M49 82 L69 106" stroke="${collarColor}" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M71 82 L61 94" stroke="${collarColor}" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M49 82 L69 106" stroke="${clothDark}" stroke-width="1" stroke-linecap="round" opacity="0.5"/>`;
  const sash = u && u.rope
    ? `<path d="M35 104 Q60 108 85 104" stroke="#C9A27A" stroke-width="5" fill="none"/><path d="M35 104 Q60 108 85 104" stroke="#8C6A44" stroke-width="1.2" stroke-dasharray="3 2" fill="none"/>
       <path d="M74 106 l-2 12 M76 106 l3 11" stroke="#C9A27A" stroke-width="2.5" stroke-linecap="round"/>`
    : `<rect x="35" y="101" width="50" height="8" rx="2" fill="${sashColor}"/>
    <path d="M74 105 L80 118 L76 119 Z M74 105 L71 119 L68 117 Z" fill="${sashColor}"/>
    <circle cx="74" cy="105" r="3.2" fill="${u ? '#C9A14A' : '#B8332A'}"/>`;
  // 문파 옷 장식 (가슴 문양·덧댄 조각·머리 장식). 투구·모자를 쓰면 머리 장식은 숨김
  const sectChest = u ? `${u.extra || ''}${u.chest}` : '';
  const sectHead = u && u.head && !(equip && equip.hat) ? u.head : '';
  return `<svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" class="avatar-svg" overflow="visible">
  <ellipse cx="60" cy="152" rx="30" ry="5" fill="rgba(0,0,0,0.18)"/>
  <g transform="translate(60 80) scale(0.86) translate(-60 -80)">${hairBack(a.hair, a.hairColor)}</g>
  ${legs}
  <ellipse cx="50" cy="148" rx="9" ry="5" fill="#2B2321"/><ellipse cx="70" cy="148" rx="9" ry="5" fill="#2B2321"/>
  <g class="arm-back"><path d="M80 88 Q91 99 89 111" fill="none" stroke="${cloth}" stroke-width="12" stroke-linecap="round"/><path d="M84 108 L95 108" stroke="${cuffColor}" stroke-width="3" stroke-linecap="round"/><circle cx="89" cy="115" r="6" fill="${skin}"/></g>
  <path d="M38 88 Q60 78 82 88 L86 110 L34 110 Z" fill="${cloth}"/>
  ${collar}
  ${sash}
  ${sectChest}
  ${armorBody}
  <rect x="54.5" y="70" width="11" height="13" rx="3" fill="${skinDark}"/>
  <g class="avatar-head" transform="translate(60 80) scale(0.86) translate(-60 -80)">
  <path d="M30 50 q-6 -3 -5 5 q1 7 7 7 Z M90 50 q6 -3 5 5 q-1 7 -7 7 Z" fill="${skinDark}"/>
  <path d="M32 44 Q31 22 60 21 Q89 22 88 44 Q88 60 78 70 Q69 78 60 78 Q51 78 42 70 Q32 60 32 44 Z" fill="${skin}"/>
  <path d="M42 70 Q51 78 60 78 Q69 78 78 70 Q70 74 60 74.5 Q50 74 42 70 Z" fill="${skinDark}" opacity="0.6"/>
  ${faceParts(a.face, mood)}
  ${hairFront(a.hair, a.hairColor)}
  ${sectHead}
  ${hat}
  </g>
  <g class="arm-front"><path d="M40 88 Q29 99 31 111" fill="none" stroke="${cloth}" stroke-width="12" stroke-linecap="round"/><path d="M25 108 L37 108" stroke="${cuffColor}" stroke-width="3" stroke-linecap="round"/>${armorShoulder}${weaponUnder}<circle class="fist" cx="31" cy="115" r="6.5" fill="${skin}" stroke="${skinDark}" stroke-width="1.2"/>${weaponOver}</g>
</svg>`;
}

// ---------- 캐릭터 만들기 화면 ----------
const avatarMaker = document.getElementById('avatar-maker');
const avatarPreview = document.getElementById('avatar-preview');
const avatarOptionsEl = document.getElementById('avatar-options');
let draftAvatar = null;
let avatarMakerDone = null; // 완료 후 실행할 함수

// 외모는 처음 한 번 정하면 확정(avatarLocked). 그 뒤에는 상점의 교체권이 있는 항목만 바꿀 수 있음
let makerUnlocked = {}; // 항목 → 이번에 쓰기로 한 교체권 id

function avatarLocked() {
  return Boolean(userRecord && userRecord.game && userRecord.game.avatarLocked);
}

// 이 항목을 바꿀 수 있는 교체권 중 가진 것 (전용 교체권 먼저, 없으면 환골탈태권)
function ticketFor(key) {
  if (typeof SUPPLIES === 'undefined') return null;
  const p = gamePlayer();
  const own = SUPPLIES.filter((t) => t.kind === 'ticket' && t.unlock.includes(key) && p.supplies[t.id] > 0);
  own.sort((a, b) => a.unlock.length - b.unlock.length);
  return own[0] || null;
}

function openAvatarMaker(onDone) {
  // 처음 정할 때는 문파 옷을 입은 기본 캐릭터에서 시작
  draftAvatar = { ...(getAvatar() || DEFAULT_AVATAR) };
  avatarMakerDone = onDone;
  makerUnlocked = {};
  const locked = avatarLocked();
  const sect = typeof mySect === 'function' ? mySect() : null;
  document.getElementById('maker-desc').textContent = locked
    ? '확정한 외모는 상점의 교체권으로 바꿀 수 있어요.'
    : `${sect ? `${sect.name} 제자의` : '나만의 무인'} 모습을 정해 주세요.`;
  const notice = document.getElementById('maker-notice');
  notice.innerHTML = locked
    ? '<span class="seal-icon" aria-hidden="true">鎖</span>바꾸고 싶은 항목의 <b>교체권 쓰기</b>를 누르세요.'
    : '<span class="seal-icon" aria-hidden="true">定</span>한 번 정하면 <b>바꿀 수 없어요.</b> (나중에 상점의 교체권으로만 바꿀 수 있어요)';
  document.getElementById('btn-avatar-random').style.display = locked ? 'none' : '';
  document.getElementById('btn-avatar-done').textContent = locked ? '저장하고 돌아가기' : '이 모습으로 확정 →';
  // 뒤로 버튼 대신 빈 곳을 누르면 저장하고 돌아감 (처음 만들 때는 '완료'로만)
  document.getElementById('avatar-tap-hint').style.display = locked ? '' : 'none';
  // 처음 캐릭터를 만들 때는 도감 탭 없이 꾸미기만
  if (typeof resetMakerTabs === 'function') resetMakerTabs(locked);
  renderAvatarMaker();
  avatarMaker.style.display = '';
}

function renderAvatarMaker() {
  avatarPreview.innerHTML = renderAvatar(draftAvatar, 'normal', withSect());
  const locked = avatarLocked();
  avatarOptionsEl.replaceChildren(...AVATAR_GROUPS.map((group) => {
    const section = document.createElement('div');
    const groupLocked = locked && !makerUnlocked[group.key];
    section.className = 'avatar-group' + (groupLocked ? ' locked' : '');
    const title = document.createElement('span');
    title.className = 'avatar-group-title';
    title.textContent = group.title;
    if (locked) {
      // 잠긴 항목: 교체권이 있으면 '교체권 쓰기', 없으면 상점 안내
      const tag = document.createElement('span');
      tag.className = 'group-lock';
      if (makerUnlocked[group.key]) {
        tag.textContent = `${SUPPLY_BY_ID[makerUnlocked[group.key]].name} 사용 중`;
        tag.classList.add('using');
      } else {
        const t = ticketFor(group.key);
        if (t) {
          const use = document.createElement('button');
          use.className = 'btn-use-ticket';
          use.textContent = `${t.name} 쓰기 (${gamePlayer().supplies[t.id]}장)`;
          use.addEventListener('click', () => {
            // 환골탈태권은 모든 항목을 한꺼번에 풂
            t.unlock.forEach((k) => { if (!makerUnlocked[k]) makerUnlocked[k] = t.id; });
            renderAvatarMaker();
          });
          tag.appendChild(use);
        } else {
          tag.innerHTML = `${typeof uiIcon === 'function' ? uiIcon('lock') : ''} 상점의 교체권 필요`;
        }
      }
      title.appendChild(tag);
    }
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
        mini.innerHTML = renderAvatar({ ...draftAvatar, [group.key]: opt.id }, 'normal', withSect());
        const label = document.createElement('span');
        label.textContent = opt.label;
        btn.append(mini, label);
      } else {
        btn.textContent = opt.label;
      }
      btn.disabled = groupLocked && !selected;
      btn.addEventListener('click', () => {
        if (groupLocked) return;
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
  const next = validAvatar(draftAvatar);
  if (!avatarLocked()) {
    // 처음 확정: 한 번 더 확인
    if (!confirm('이 모습으로 확정할까요?\n확정한 외모는 상점의 교체권으로만 바꿀 수 있어요.')) return;
    userRecord.game.avatarLocked = true;
    saveAvatar(next);
  } else {
    // 확정 뒤: 실제로 바뀐 항목의 교체권만 사용 (같은 교체권은 한 장만)
    const prev = getAvatar() || DEFAULT_AVATAR;
    const used = new Set(AVATAR_GROUPS.filter((g) => makerUnlocked[g.key] && next[g.key] !== prev[g.key]).map((g) => makerUnlocked[g.key]));
    if (used.size) {
      const p = gamePlayer();
      used.forEach((id) => { p.supplies[id] = Math.max(0, p.supplies[id] - 1); });
      saveAvatar(next);
      if (typeof showToast === 'function') showToast(`${[...used].map((id) => SUPPLY_BY_ID[id].name).join(', ')}을(를) 사용했어요`);
    }
  }
  makerUnlocked = {};
  avatarMaker.style.display = 'none';
  if (avatarMakerDone) avatarMakerDone();
});

document.getElementById('btn-avatar-back').addEventListener('click', () => {
  avatarMaker.style.display = 'none';
  if (avatarMakerDone) avatarMakerDone();
});
