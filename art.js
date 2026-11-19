// ========================================
// 게임 모드 그림 — 몬스터 14종, 장비 아이콘 14종, UI 아이콘 (모두 직접 그린 SVG)
// ========================================
// app.js 다음, stage-game.js 앞에 불러오는 일반 스크립트입니다.
// 이모티콘은 기기마다 모양이 달라서, 동양풍 테마에 맞춘 그림으로 통일합니다.
// 모든 그림은 고정 도형만으로 만든 SVG 문자열입니다 (사용자 입력이 들어가지 않음).
//
//   renderMonster(id, mood)  mood: 'normal' | 'hurt' | 'ko'
//   renderGearIcon(id)
//   uiIcon(name)             name: 'coin' | 'exp' | 'heart' | 'heart-empty' | 'heartbreak' | 'lock' | 'crown'

const INK = '#2B2321';

// ---------- 눈 (몬스터마다 위치·색만 다르고 표정은 공통) ----------
// eyes: [{ x, y, r, color }] / mood 에 따라 보통 눈 · 찡그린 눈(><) · 기절 눈(X)
function monsterEyes(eyes, mood, glow) {
  return eyes.map((e, i) => {
    const { x, y } = e;
    const r = e.r || 6;
    if (mood === 'hurt') {
      const d = r * 0.9;
      const dir = i % 2 === 0 ? 1 : -1; // 왼쪽 눈 '>' 오른쪽 눈 '<'
      return `<path d="M${x - d * dir} ${y - d} L${x + d * dir} ${y} L${x - d * dir} ${y + d}" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    if (mood === 'ko') {
      const d = r * 0.85;
      return `<path d="M${x - d} ${y - d} L${x + d} ${y + d} M${x + d} ${y - d} L${x - d} ${y + d}" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
    }
    const color = e.color || '#F2C230';
    return `${glow ? `<circle cx="${x}" cy="${y}" r="${r + 3}" fill="${color}" opacity="0.35"/>` : ''}
      <ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 1.05}" fill="${color}" stroke="${INK}" stroke-width="2"/>
      <ellipse cx="${x + (e.look || 0)}" cy="${y + 0.5}" rx="${r * (e.slit ? 0.22 : 0.48)}" ry="${r * 0.78}" fill="${INK}"/>
      <circle cx="${x + (e.look || 0) - r * 0.25}" cy="${y - r * 0.35}" r="${r * 0.22}" fill="#fff"/>`;
  }).join('');
}

const shadow = (w = 34, y = 110) => `<ellipse cx="60" cy="${y}" rx="${w}" ry="6" fill="rgba(31,26,23,0.22)"/>`;

// ---------- 몬스터 ----------
// 각 몬스터: body(눈 아래 그림), eyes, front(눈 위에 겹칠 부분, 선택)
const MONSTER_ART = {
  // 물귀신: 젖은 긴 머리에 하늘거리는 하얀 몸, 물방울
  ghost: {
    body: `${shadow(26, 112)}
      <path d="M30 98 Q26 40 60 26 Q94 40 90 98 Q83 90 76 99 Q68 90 60 99 Q52 90 44 99 Q37 90 30 98 Z" fill="#E6F0F4" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M33 66 Q16 66 10 80 Q22 76 30 80 Z" fill="#E6F0F4" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M87 66 Q104 66 110 80 Q98 76 90 80 Z" fill="#E6F0F4" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M33 62 Q34 24 60 22 Q86 24 87 62 L86 92 Q81 72 78 58 Q60 46 42 58 Q39 72 34 92 Z" fill="#1F1A17"/>
      <path d="M44 56 Q52 50 60 50 M60 50 Q68 50 76 56" stroke="#3A3530" stroke-width="2" fill="none"/>
      <ellipse cx="60" cy="80" rx="5" ry="6.5" fill="#3A3530"/>
      <path d="M18 40 q4 -8 0 -12 q-4 4 0 12z M104 48 q4 -8 0 -12 q-4 4 0 12z M100 92 q3 -6 0 -9 q-3 3 0 9z" fill="#7FC3E0" stroke="${INK}" stroke-width="1.5"/>`,
    eyes: [{ x: 50, y: 66, r: 5.5, color: '#9FE3F5' }, { x: 70, y: 66, r: 5.5, color: '#9FE3F5' }],
    glow: true,
  },
  // 꼬리 아홉 여우
  fox: {
    body: `${shadow(34)}
      ${[-80, -60, -40, -20, 0, 20, 40, 60, 80].map((a) => `<g transform="rotate(${a} 60 86)"><path d="M60 86 Q48 52 60 16 Q72 52 60 86 Z" fill="#E8843A" stroke="${INK}" stroke-width="2.2"/><path d="M60 30 Q55 22 60 14 Q65 22 60 30 Z" fill="#FFF3E0"/></g>`).join('')}
      <ellipse cx="60" cy="92" rx="22" ry="17" fill="#E8843A" stroke="${INK}" stroke-width="3"/>
      <ellipse cx="60" cy="96" rx="12" ry="11" fill="#FFF3E0"/>
      <path d="M40 46 L36 24 L52 38 Z M80 46 L84 24 L68 38 Z" fill="#E8843A" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M41 42 L39 30 L48 38 Z M79 42 L81 30 L72 38 Z" fill="#F4B7A8"/>
      <ellipse cx="60" cy="56" rx="22" ry="19" fill="#E8843A" stroke="${INK}" stroke-width="3"/>
      <path d="M44 62 Q60 82 76 62 Q70 72 60 74 Q50 72 44 62 Z" fill="#FFF3E0"/>
      <ellipse cx="60" cy="68" rx="3.5" ry="2.6" fill="${INK}"/>
      <path d="M60 41 q-4 -6 0 -10 q4 4 0 10z" fill="#C0392B"/>`,
    eyes: [{ x: 51, y: 56, r: 5, color: '#F2C230', slit: true }, { x: 69, y: 56, r: 5, color: '#F2C230', slit: true }],
  },
  // 깡충 강시: 관모, 이마의 부적, 앞으로 뻗은 팔
  jiangshi: {
    body: `${shadow(26)}
      <rect x="44" y="102" width="14" height="7" rx="3" fill="${INK}"/><rect x="62" y="102" width="14" height="7" rx="3" fill="${INK}"/>
      <path d="M42 74 L78 74 L82 104 L38 104 Z" fill="#2C3E5C" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M60 74 L60 104" stroke="#C9A14A" stroke-width="3"/><rect x="40" y="94" width="40" height="5" fill="#C9A14A"/>
      <path d="M44 80 L12 78 L12 88 L44 90 Z M76 80 L108 78 L108 88 L76 90 Z" fill="#2C3E5C" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
      <rect x="2" y="78" width="11" height="9" rx="4" fill="#A9C7A0" stroke="${INK}" stroke-width="2"/><rect x="107" y="78" width="11" height="9" rx="4" fill="#A9C7A0" stroke="${INK}" stroke-width="2"/>
      <rect x="40" y="34" width="40" height="42" rx="12" fill="#B9D3B0" stroke="${INK}" stroke-width="3"/>
      <path d="M50 70 L54 66 L58 70 L62 66 L66 70 L70 66" fill="none" stroke="${INK}" stroke-width="2"/>
      <path d="M52 69 L53.5 74 L55 69 M65 69 L66.5 74 L68 69" fill="#fff" stroke="${INK}" stroke-width="1"/>
      <path d="M36 36 Q60 26 84 36 L82 40 L38 40 Z" fill="${INK}"/><path d="M44 36 Q46 16 60 16 Q74 16 76 36 Z" fill="${INK}"/>
      <circle cx="60" cy="13" r="5" fill="#C0392B" stroke="${INK}" stroke-width="2"/>`,
    eyes: [{ x: 49, y: 56, r: 4.5, color: '#E05A4A' }, { x: 71, y: 56, r: 4.5, color: '#E05A4A' }],
    front: `<path d="M55 38 L65 38 L65 66 L60 62 L55 66 Z" fill="#F2D06B" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M58 43 h4 M57 48 q3 2 6 0 M60 50 v8 M57 55 h6" stroke="#C0392B" stroke-width="1.8" stroke-linecap="round" fill="none"/>`,
  },
  // 이무기: 똬리 튼 큰 뱀, 작은 뿔
  imugi: {
    body: `${shadow(38)}
      <ellipse cx="60" cy="98" rx="38" ry="12" fill="#3F8F7F" stroke="${INK}" stroke-width="3"/>
      <ellipse cx="60" cy="96" rx="26" ry="6" fill="#A8D5B8" opacity="0.6"/>
      <ellipse cx="58" cy="84" rx="30" ry="11" fill="#3F8F7F" stroke="${INK}" stroke-width="3"/>
      <path d="M66 82 Q86 70 76 52 Q70 42 62 44" fill="none" stroke="${INK}" stroke-width="20" stroke-linecap="round"/>
      <path d="M66 82 Q86 70 76 52 Q70 42 62 44" fill="none" stroke="#3F8F7F" stroke-width="14" stroke-linecap="round"/>
      <path d="M70 78 Q82 70 76 56" fill="none" stroke="#A8D5B8" stroke-width="4" stroke-linecap="round"/>
      <path d="M48 32 L44 20 L54 30 Z M68 30 L72 18 L66 31 Z" fill="#E8CF8A" stroke="${INK}" stroke-width="2"/>
      <ellipse cx="58" cy="42" rx="22" ry="15" fill="#3F8F7F" stroke="${INK}" stroke-width="3"/>
      <ellipse cx="54" cy="50" rx="14" ry="6" fill="#A8D5B8"/>
      <path d="M38 50 L28 52 M28 52 L24 48 M28 52 L24 56" stroke="#C0392B" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M44 74 q4 -3 8 0 M56 74 q4 -3 8 0 M40 92 q4 -3 8 0 M70 92 q4 -3 8 0" stroke="#2C6B5E" stroke-width="2" fill="none"/>`,
    eyes: [{ x: 50, y: 39, r: 4.5, color: '#F2C230', slit: true }, { x: 66, y: 38, r: 4.5, color: '#F2C230', slit: true }],
  },
  // 박쥐 요괴
  bat: {
    body: `${shadow(24, 112)}
      <path d="M44 62 Q24 40 4 50 Q14 56 12 66 Q20 62 24 70 Q30 64 36 74 Z" fill="#3E2A55" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M76 62 Q96 40 116 50 Q106 56 108 66 Q100 62 96 70 Q90 64 84 74 Z" fill="#3E2A55" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M44 34 L40 14 L54 28 Z M76 34 L80 14 L66 28 Z" fill="#5B3F7A" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
      <ellipse cx="60" cy="62" rx="22" ry="28" fill="#5B3F7A" stroke="${INK}" stroke-width="3"/>
      <ellipse cx="60" cy="72" rx="12" ry="14" fill="#8A6BAF"/>
      <path d="M52 62 Q60 68 68 62" fill="none" stroke="${INK}" stroke-width="2"/>
      <path d="M54 63 L56 69 L58 63 M62 63 L64 69 L66 63" fill="#fff" stroke="${INK}" stroke-width="1"/>
      <path d="M52 90 l-2 8 M60 90 v8 M68 90 l2 8" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`,
    eyes: [{ x: 51, y: 50, r: 5, color: '#FF5A5A' }, { x: 69, y: 50, r: 5, color: '#FF5A5A' }],
    glow: true,
  },
  // 두꺼비 도사: 도사 모자와 흰 수염
  toad: {
    body: `${shadow(38)}
      <ellipse cx="60" cy="84" rx="38" ry="25" fill="#6E9B4F" stroke="${INK}" stroke-width="3"/>
      <ellipse cx="60" cy="92" rx="24" ry="14" fill="#D9E3B0"/>
      <circle cx="34" cy="78" r="3" fill="#4F7A38"/><circle cx="86" cy="80" r="3.5" fill="#4F7A38"/><circle cx="44" cy="68" r="2.5" fill="#4F7A38"/><circle cx="78" cy="70" r="2.5" fill="#4F7A38"/>
      <circle cx="44" cy="58" r="11" fill="#6E9B4F" stroke="${INK}" stroke-width="3"/><circle cx="76" cy="58" r="11" fill="#6E9B4F" stroke="${INK}" stroke-width="3"/>
      <path d="M38 74 Q60 84 82 74" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      <path d="M52 80 Q50 94 46 100 M60 82 Q60 96 58 104 M68 80 Q70 94 74 100" stroke="#F4EBDD" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M48 46 L72 46 L68 34 L52 34 Z" fill="${INK}"/><rect x="46" y="44" width="28" height="4" rx="2" fill="#3A3530"/>
      <circle cx="60" cy="40" r="3" fill="#5E9C8E"/>
      <path d="M24 102 q-4 6 -10 6 M96 102 q4 6 10 6" stroke="${INK}" stroke-width="3" stroke-linecap="round" fill="none"/>`,
    eyes: [{ x: 44, y: 57, r: 5.5, color: '#F2C230' }, { x: 76, y: 57, r: 5.5, color: '#F2C230' }],
  },
  // 멧돼지 장수: 투구와 엄니
  boar: {
    body: `${shadow(34)}
      <path d="M32 50 L22 34 L42 40 Z M88 50 L98 34 L78 40 Z" fill="#7A5236" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
      <ellipse cx="60" cy="70" rx="32" ry="30" fill="#7A5236" stroke="${INK}" stroke-width="3"/>
      <path d="M40 46 Q60 30 80 46" stroke="#4A3020" stroke-width="5" fill="none" stroke-linecap="round"/>
      <ellipse cx="60" cy="84" rx="15" ry="11" fill="#C98E6B" stroke="${INK}" stroke-width="2.5"/>
      <ellipse cx="55" cy="84" rx="2.5" ry="3.5" fill="${INK}"/><ellipse cx="65" cy="84" rx="2.5" ry="3.5" fill="${INK}"/>
      <path d="M44 88 Q40 78 42 70 Q46 80 48 86 Z M76 88 Q80 78 78 70 Q74 80 72 86 Z" fill="#FFF8E6" stroke="${INK}" stroke-width="2"/>
      <path d="M30 50 Q60 24 90 50 L86 56 Q60 38 34 56 Z" fill="#A8342B" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M60 30 L56 16 L60 20 L64 16 Z" fill="#C9A14A" stroke="${INK}" stroke-width="1.5"/>
      <path d="M44 58 L54 62 M76 58 L66 62" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
    eyes: [{ x: 49, y: 66, r: 4, color: '#F2C230' }, { x: 71, y: 66, r: 4, color: '#F2C230' }],
  },
  // 산원숭이 요괴
  monkey: {
    body: `${shadow(28)}
      <path d="M84 96 Q108 92 104 70 Q100 60 92 66" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
      <path d="M84 96 Q108 92 104 70 Q100 60 92 66" fill="none" stroke="#8B5A3C" stroke-width="3.5" stroke-linecap="round"/>
      <ellipse cx="60" cy="94" rx="20" ry="15" fill="#8B5A3C" stroke="${INK}" stroke-width="3"/>
      <circle cx="30" cy="58" r="10" fill="#8B5A3C" stroke="${INK}" stroke-width="3"/><circle cx="30" cy="58" r="5" fill="#E8B796"/>
      <circle cx="90" cy="58" r="10" fill="#8B5A3C" stroke="${INK}" stroke-width="3"/><circle cx="90" cy="58" r="5" fill="#E8B796"/>
      <circle cx="60" cy="56" r="27" fill="#8B5A3C" stroke="${INK}" stroke-width="3"/>
      <path d="M60 44 Q44 36 40 52 Q36 70 60 78 Q84 70 80 52 Q76 36 60 44 Z" fill="#E8B796"/>
      <ellipse cx="44" cy="66" rx="5" ry="3" fill="#E57A6B" opacity="0.7"/><ellipse cx="76" cy="66" rx="5" ry="3" fill="#E57A6B" opacity="0.7"/>
      <path d="M50 68 Q60 76 70 68" fill="#fff" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M46 30 Q60 22 74 30" stroke="#5E3A26" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    eyes: [{ x: 52, y: 56, r: 4.5, color: '#FFF3C4', look: 1 }, { x: 68, y: 56, r: 4.5, color: '#FFF3C4', look: 1 }],
  },
  // 독전갈 요괴
  scorpion: {
    body: `${shadow(40)}
      <path d="M72 86 Q100 86 102 62 Q104 40 86 32 Q76 28 72 36" fill="none" stroke="${INK}" stroke-width="13" stroke-linecap="round"/>
      <path d="M72 86 Q100 86 102 62 Q104 40 86 32 Q76 28 72 36" fill="none" stroke="#B5532E" stroke-width="8" stroke-linecap="round" stroke-dasharray="10 3"/>
      <path d="M72 36 L62 40 L70 28 Z" fill="#E8CF8A" stroke="${INK}" stroke-width="2"/>
      <path d="M38 90 L26 102 M44 92 L36 106 M76 92 L84 106 M82 90 L94 102" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="60" cy="86" rx="26" ry="15" fill="#B5532E" stroke="${INK}" stroke-width="3"/>
      <path d="M46 80 q14 -4 28 0 M44 88 q16 -3 32 0" stroke="#8A3A1E" stroke-width="2" fill="none"/>
      <path d="M38 80 Q26 74 22 62" stroke="${INK}" stroke-width="6" stroke-linecap="round" fill="none"/>
      <path d="M38 80 Q26 74 22 62" stroke="#B5532E" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M22 62 Q10 56 14 44 Q20 50 24 50 Q22 42 30 40 Q30 54 22 62 Z" fill="#B5532E" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
      <ellipse cx="42" cy="78" rx="12" ry="9" fill="#B5532E" stroke="${INK}" stroke-width="2.5"/>`,
    eyes: [{ x: 38, y: 76, r: 3.2, color: '#F2C230' }, { x: 46, y: 75, r: 3.2, color: '#F2C230' }],
  },
  // 거미 요괴
  spider: {
    body: `${shadow(40)}
      ${[[-1, 0], [1, 0]].map(([s]) => [0, 1, 2, 3].map((i) => {
        const y = 66 + i * 8;
        const x1 = 60 + s * 16;
        const x2 = 60 + s * (34 + i * 4);
        const x3 = 60 + s * (44 + i * 3);
        return `<path d="M${x1} ${y} Q${x2} ${y - 22 + i * 4} ${x3} ${y + 26}" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;
      }).join('')).join('')}
      <ellipse cx="60" cy="86" rx="26" ry="21" fill="${INK}"/>
      <path d="M60 74 L66 84 L60 94 L54 84 Z" fill="#C0392B"/>
      <circle cx="60" cy="60" r="16" fill="#3A3530" stroke="${INK}" stroke-width="2"/>
      <path d="M54 72 L52 80 M66 72 L68 80" stroke="#E8CF8A" stroke-width="3" stroke-linecap="round"/>`,
    eyes: [{ x: 54, y: 56, r: 3.5, color: '#FF5A5A' }, { x: 66, y: 56, r: 3.5, color: '#FF5A5A' }, { x: 49, y: 63, r: 2.6, color: '#FF5A5A' }, { x: 71, y: 63, r: 2.6, color: '#FF5A5A' }],
    glow: true,
  },
  // ---- 두목 ----
  // 청룡: 사슴뿔, 긴 수염, 구름 위의 몸
  dragon: {
    body: `${shadow(42)}
      <path d="M96 96 Q110 74 92 64 Q78 58 86 44" fill="none" stroke="${INK}" stroke-width="16" stroke-linecap="round"/>
      <path d="M96 96 Q110 74 92 64 Q78 58 86 44" fill="none" stroke="#2F6FB0" stroke-width="11" stroke-linecap="round"/>
      <path d="M100 86 l6 -2 M104 76 l6 0 M98 66 l5 -4" stroke="#F2C230" stroke-width="3" stroke-linecap="round"/>
      <path d="M20 100 q8 -10 18 -4 q6 -10 18 -4 q10 -6 18 4 q10 -4 14 6 Z" fill="#F4EBDD" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M44 30 L36 10 L42 16 L40 4 L48 18 M70 28 L76 8 L72 16 L80 6 L74 22" fill="none" stroke="#E8CF8A" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M30 40 L22 34 L30 32 L24 24 L36 30 M88 38 L98 32 L90 30 L96 22 L84 28" fill="#2F6FB0" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M34 52 Q34 28 60 26 Q86 28 86 52 Q86 66 76 72 L44 72 Q34 66 34 52 Z" fill="#2F6FB0" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M38 64 Q36 84 60 88 Q84 84 82 64 Q72 70 60 70 Q48 70 38 64 Z" fill="#7FB3E0" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M44 76 L48 82 L52 76 L56 82 L60 76 L64 82 L68 76 L72 82 L76 76" fill="#fff" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>
      <ellipse cx="52" cy="66" rx="2.5" ry="2" fill="${INK}"/><ellipse cx="68" cy="66" rx="2.5" ry="2" fill="${INK}"/>
      <path d="M40 70 Q20 74 14 92 M80 70 Q100 74 106 90" fill="none" stroke="#E8CF8A" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M42 44 L54 48 M78 44 L66 48" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
    eyes: [{ x: 49, y: 53, r: 5.5, color: '#F2C230', slit: true }, { x: 71, y: 53, r: 5.5, color: '#F2C230', slit: true }],
    glow: true,
  },
  // 도깨비 대왕: 붉은 얼굴, 외뿔, 금관, 방망이
  dokkaebi: {
    body: `${shadow(38)}
      <path d="M96 104 L104 46" stroke="#5C3A1A" stroke-width="9" stroke-linecap="round"/>
      <ellipse cx="104" cy="40" rx="10" ry="16" fill="#7A5236" stroke="${INK}" stroke-width="3"/>
      <circle cx="100" cy="34" r="2.5" fill="#C9A14A"/><circle cx="108" cy="42" r="2.5" fill="#C9A14A"/><circle cx="101" cy="48" r="2.5" fill="#C9A14A"/>
      <path d="M32 74 L28 104 L92 104 L88 74 Z" fill="#3A5A8C" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M28 96 h64" stroke="#C9A14A" stroke-width="4"/>
      <path d="M26 50 Q18 30 34 26 Q40 14 54 20 Q60 10 66 20 Q80 14 86 26 Q102 30 94 50 Z" fill="#2B2321"/>
      <circle cx="60" cy="56" r="27" fill="#C8402F" stroke="${INK}" stroke-width="3"/>
      <path d="M56 32 L60 8 L64 32 Z" fill="#E8CF8A" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M42 30 L46 18 L52 26 L60 14 L68 26 L74 18 L78 30 Z" fill="#F2C230" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M40 44 L52 50 M80 44 L68 50" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M44 66 Q60 82 76 66 Z" fill="#7A1F16" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M48 67 L50 60 L53 68 M67 68 L70 60 L72 67" fill="#FFF8E6" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>
      <ellipse cx="60" cy="60" rx="5" ry="3.5" fill="#A8342B"/>`,
    eyes: [{ x: 49, y: 53, r: 5.5, color: '#FFF3C4' }, { x: 71, y: 53, r: 5.5, color: '#FFF3C4' }],
  },
  // 산군 백호: 이마의 '王' 무늬
  tiger: {
    body: `${shadow(40)}
      <ellipse cx="60" cy="98" rx="30" ry="12" fill="#F2EEE6" stroke="${INK}" stroke-width="3"/>
      <path d="M40 100 q4 -6 8 0 M72 100 q4 -6 8 0" stroke="${INK}" stroke-width="2" fill="none"/>
      <path d="M30 36 Q26 20 40 22 Z M90 36 Q94 20 80 22 Z" fill="#F2EEE6" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M32 32 Q30 26 36 26 Z M88 32 Q90 26 84 26 Z" fill="${INK}"/>
      <ellipse cx="60" cy="58" rx="34" ry="30" fill="#F2EEE6" stroke="${INK}" stroke-width="3"/>
      <path d="M52 34 h16 M60 34 v14 M54 41 h12 M50 48 h20" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      <path d="M28 52 l10 2 M28 62 l10 0 M92 52 l-10 2 M92 62 l-10 0 M36 40 l8 6 M84 40 l-8 6" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="60" cy="72" rx="14" ry="10" fill="#FFFDF7"/>
      <path d="M55 66 L65 66 L60 72 Z" fill="#E57A8A" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M60 72 v4 M52 78 Q60 84 68 78" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M54 79 L55 84 L57 79 M63 79 L65 84 L66 79" fill="#fff" stroke="${INK}" stroke-width="1"/>
      <path d="M44 72 L28 70 M44 76 L28 78 M76 72 L92 70 M76 76 L92 78" stroke="#8C8278" stroke-width="1.5" stroke-linecap="round"/>`,
    eyes: [{ x: 48, y: 56, r: 5.5, color: '#7FC3E0', slit: true }, { x: 72, y: 56, r: 5.5, color: '#7FC3E0', slit: true }],
    glow: true,
  },
  // 붉은 얼굴 천구: 긴 코, 흰 갈기, 검은 날개
  tengu: {
    body: `${shadow(40)}
      <path d="M36 70 Q10 50 4 70 Q12 72 10 80 Q18 76 20 86 Q26 80 34 88 Z" fill="${INK}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M84 70 Q110 50 116 70 Q108 72 110 80 Q102 76 100 86 Q94 80 86 88 Z" fill="${INK}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M14 66 l8 4 M10 76 l8 2 M106 66 l-8 4 M110 76 l-8 2" stroke="#4A423A" stroke-width="2" stroke-linecap="round"/>
      <path d="M36 76 L32 104 L88 104 L84 76 Z" fill="#E9E2D3" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M48 76 L60 92 L72 76" fill="none" stroke="#5E9C8E" stroke-width="4"/>
      <path d="M30 50 Q22 72 40 82 L80 82 Q98 72 90 50 Z" fill="#F4F1EA" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="60" cy="52" r="24" fill="#C8402F" stroke="${INK}" stroke-width="3"/>
      <path d="M60 52 L36 60 L60 60 Z" fill="#A8342B" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M42 40 L54 46 M78 40 L66 46" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M50 70 Q60 64 70 70" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>
      <rect x="52" y="22" width="16" height="10" rx="3" fill="${INK}"/><path d="M50 30 h20" stroke="${INK}" stroke-width="3"/>`,
    eyes: [{ x: 49, y: 50, r: 4.5, color: '#F2C230' }, { x: 71, y: 50, r: 4.5, color: '#F2C230' }],
  },
  // ---- 마왕: 급수의 마지막 결전 ----
  // 보랏빛 요기, 굽은 두 뿔, 흑금관, 어깨 갑옷과 망토, 가슴의 '魔' 문장
  demonking: {
    body: `${shadow(46)}
      <path d="M12 104 Q2 72 16 50 Q16 66 26 64 Q18 40 36 24 Q36 42 46 38 Q46 16 60 2 Q74 16 74 38 Q84 42 84 24 Q102 40 94 64 Q104 66 104 50 Q118 72 108 104 Z" fill="#6B2A8C" opacity="0.5"/>
      <path d="M22 104 Q12 74 34 60 Q18 82 30 104 Z M98 104 Q108 74 86 60 Q102 82 90 104 Z" fill="#9B4FC0" opacity="0.55"/>
      <path d="M24 68 Q12 92 16 108 L104 108 Q108 92 96 68 Z" fill="#241326" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M26 72 Q24 92 28 108 M94 72 Q96 92 92 108" stroke="#8E241D" stroke-width="5" fill="none"/>
      <path d="M38 72 L36 108 L84 108 L82 72 Z" fill="#3A2A44" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M37 79 h46" stroke="#C9A14A" stroke-width="4"/>
      <circle cx="60" cy="94" r="10" fill="#C9A14A" stroke="${INK}" stroke-width="2.5"/>
      <text x="60" y="98.5" font-size="13" text-anchor="middle" fill="#8E241D" font-weight="700" font-family="'Ma Shan Zheng', 'Noto Serif SC', serif">魔</text>
      <path d="M20 76 Q26 62 44 68 L42 82 Q30 84 20 76 Z" fill="#4E3A5C" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M100 76 Q94 62 76 68 L78 82 Q90 84 100 76 Z" fill="#4E3A5C" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M24 70 L16 58 L30 66 Z M96 70 L104 58 L90 66 Z" fill="#E8DCC0" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M42 40 Q18 36 14 8 Q28 28 48 30 Z" fill="#E8DCC0" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M78 40 Q102 36 106 8 Q92 28 72 30 Z" fill="#E8DCC0" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M24 24 l7 3 M30 32 l6 1 M96 24 l-7 3 M90 32 l-6 1" stroke="#A89878" stroke-width="2" stroke-linecap="round"/>
      <path d="M38 50 Q38 28 60 28 Q82 28 82 50 Q82 66 70 74 L50 74 Q38 66 38 50 Z" fill="#7A3A8C" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M42 36 L44 16 L52 26 L60 10 L68 26 L76 16 L78 36 Z" fill="#2B2321" stroke="#C9A14A" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="60" cy="25" r="3.5" fill="#E0302A" stroke="#C9A14A" stroke-width="1.2"/>
      <path d="M43 44 L56 50 M77 44 L64 50" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
      <path d="M47 63 Q60 72 73 63 Q60 67 47 63 Z" fill="#3A0F14" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M51 64 L53 71 L56 65 M64 65 L67 71 L69 64" fill="#FFF8E6" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"/>`,
    eyes: [{ x: 50, y: 54, r: 5.5, color: '#FF3B30', slit: true }, { x: 70, y: 54, r: 5.5, color: '#FF3B30', slit: true }],
    glow: true,
  },
};

function renderMonster(id, mood = 'normal') {
  const art = MONSTER_ART[id] || MONSTER_ART.ghost;
  return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" class="monster-svg" overflow="visible">
  ${art.body}
  ${monsterEyes(art.eyes, mood, art.glow)}
  ${art.front || ''}
</svg>`;
}

// ---------- 장비 아이콘 (48×48) ----------
const GEAR_ICON_ART = {
  stick: `<path d="M10 40 L38 10" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><path d="M10 40 L38 10" stroke="#8B5A2B" stroke-width="5" stroke-linecap="round"/><circle cx="22" cy="27" r="2.5" fill="#5C3A1A"/><path d="M30 18 l5 2" stroke="#5C3A1A" stroke-width="2" stroke-linecap="round"/>`,
  glove: `<path d="M12 22 Q12 8 26 8 Q40 8 38 24 Q38 34 30 36 L18 36 Q12 34 12 22 Z" fill="#D9363E" stroke="${INK}" stroke-width="2.5"/><path d="M12 22 Q6 20 7 28 Q8 34 14 32" fill="#D9363E" stroke="${INK}" stroke-width="2.5"/><rect x="16" y="34" width="16" height="8" rx="2" fill="#F4EBDD" stroke="${INK}" stroke-width="2.5"/><path d="M18 14 q6 -3 12 0" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.7"/>`,
  woodsword: `<path d="M12 36 L36 8 L40 12 L16 40 Z" fill="#D9B47A" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><path d="M8 30 L18 40" stroke="#5C3A1A" stroke-width="5" stroke-linecap="round"/><path d="M8 44 L14 38" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M8 44 L14 38" stroke="#8B5A2B" stroke-width="3.5" stroke-linecap="round"/>`,
  knuckle: `<rect x="8" y="18" width="32" height="14" rx="6" fill="#B0B6BC" stroke="${INK}" stroke-width="2.5"/><circle cx="15" cy="25" r="3" fill="#5F6368"/><circle cx="24" cy="25" r="3" fill="#5F6368"/><circle cx="33" cy="25" r="3" fill="#5F6368"/><path d="M12 18 l3 -8 3 8 M21 18 l3 -8 3 8 M30 18 l3 -8 3 8" fill="#D8DDE1" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`,
  brush: `<path d="M14 34 L38 8" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M14 34 L38 8" stroke="#C9A15B" stroke-width="4" stroke-linecap="round"/><path d="M22 25 l4 4 M30 16 l4 4" stroke="#8B6A2B" stroke-width="1.5"/><path d="M15 31 Q4 38 6 44 Q12 46 19 36 Z" fill="${INK}"/>`,
  bronzesword: `<path d="M14 34 L38 6 L42 8 L40 12 L18 38 Z" fill="#D49A5A" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><path d="M10 28 L22 40" stroke="#8E5A2B" stroke-width="5" stroke-linecap="round"/><path d="M9 43 L15 37" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M8 44 q-4 2 -2 6 M8 44 q2 4 6 4" stroke="#C0392B" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
  goldbrush: `<circle cx="24" cy="24" r="18" fill="#FFE066" opacity="0.25"/><path d="M14 34 L38 8" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M14 34 L38 8" stroke="#F2C230" stroke-width="4" stroke-linecap="round"/><path d="M15 31 Q4 38 6 44 Q12 46 19 36 Z" fill="${INK}"/><path d="M38 30 l2 4 4 2 -4 2 -2 4 -2 -4 -4 -2 4 -2z" fill="#fff"/>`,
  dragonbrush: `<circle cx="24" cy="24" r="20" fill="#FF6B3D" opacity="0.2"/><path d="M14 34 L38 8" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><path d="M14 34 L38 8" stroke="#C0392B" stroke-width="5" stroke-linecap="round"/><path d="M20 27 l3 3 M26 20 l3 3 M32 13 l3 3" stroke="#F2C230" stroke-width="2.5"/><path d="M15 31 Q2 38 5 46 Q13 47 19 36 Z" fill="${INK}"/><path d="M36 6 q6 -2 6 4 q-4 -2 -6 -4z" fill="#F2C230" stroke="${INK}" stroke-width="1.5"/>`,
  straw: `<ellipse cx="24" cy="30" rx="21" ry="7" fill="#EED38A" stroke="${INK}" stroke-width="2.5"/><path d="M12 29 Q13 12 24 12 Q35 12 36 29 Z" fill="#E8C872" stroke="${INK}" stroke-width="2.5"/><rect x="12" y="23" width="24" height="4" fill="#C0392B"/>`,
  cap: `<path d="M8 30 Q8 10 26 10 Q42 10 42 30 Z" fill="#4A90D9" stroke="${INK}" stroke-width="2.5"/><path d="M8 30 Q2 30 2 34 L22 34 L22 30 Z" fill="#2F6BB0" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="26" cy="11" r="2.5" fill="#2F6BB0"/><path d="M26 12 v16" stroke="#2F6BB0" stroke-width="1.5"/>`,
  band: `<rect x="6" y="18" width="30" height="11" rx="4" fill="#E05252" stroke="${INK}" stroke-width="2.5"/><path d="M35 20 L46 13 L44 24 Z M35 26 L45 33 L38 35 Z" fill="#E05252" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><circle cx="21" cy="23.5" r="3" fill="#fff"/>`,
  gradcap: `<path d="M18 22 L18 30 Q24 34 30 30 L30 22" fill="#2B2B33" stroke="${INK}" stroke-width="2"/><path d="M4 18 L24 10 L44 18 L24 26 Z" fill="#3A3A44" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><path d="M24 18 L40 22 L40 34" stroke="#F2C230" stroke-width="2" fill="none"/><circle cx="40" cy="36" r="2.5" fill="#F2C230"/>`,
  scholar: `<rect x="17" y="6" width="14" height="16" rx="4" fill="rgba(30,30,36,0.92)" stroke="${INK}" stroke-width="2"/><ellipse cx="24" cy="23" rx="22" ry="5" fill="rgba(30,30,36,0.88)" stroke="${INK}" stroke-width="2"/><path d="M8 25 Q6 38 14 44 M40 25 Q42 38 34 44" stroke="${INK}" stroke-width="1.5" fill="none"/>`,
  crown: `<path d="M6 36 L8 12 L17 22 L24 6 L31 22 L40 12 L42 36 Z" fill="#F2C230" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><rect x="6" y="34" width="36" height="6" rx="2" fill="#D4A83A" stroke="${INK}" stroke-width="2"/><circle cx="24" cy="26" r="3.5" fill="#E05252" stroke="${INK}" stroke-width="1.5"/><circle cx="14" cy="29" r="2.5" fill="#4A90D9"/><circle cx="34" cy="29" r="2.5" fill="#3DAA6D"/>`,
  // ---- 새 무기 ----
  dagger: `<path d="M18 30 L38 8 L40 10 L20 32 Z" fill="#D8DDE1" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/><path d="M12 26 L22 36" stroke="#5C3A1A" stroke-width="5" stroke-linecap="round"/><path d="M8 42 L15 35" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M8 42 L15 35" stroke="#8B5A2B" stroke-width="3.5" stroke-linecap="round"/>`,
  spear: `<path d="M8 44 L36 12" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M8 44 L36 12" stroke="#8B5A2B" stroke-width="3.5" stroke-linecap="round"/><path d="M34 14 L44 4 L40 18 Z" fill="#D8DDE1" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><path d="M30 16 q4 4 6 0" stroke="#C0392B" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  glaive: `<path d="M8 44 L30 18" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M8 44 L30 18" stroke="#5C3A1A" stroke-width="3.5" stroke-linecap="round"/><path d="M28 20 Q30 4 44 4 Q42 18 32 24 Z" fill="#C9CED3" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><path d="M34 12 q4 -2 6 0" stroke="#2F6FB0" stroke-width="1.8" fill="none"/><circle cx="29" cy="20" r="3" fill="#C9A14A" stroke="${INK}" stroke-width="1"/>`,
  jadesword: `<circle cx="26" cy="22" r="18" fill="#7FD3C0" opacity="0.25"/><path d="M14 34 L38 6 L42 8 L40 12 L18 38 Z" fill="#7FD3C0" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/><path d="M20 30 L38 10" stroke="#E6F2EE" stroke-width="1.5"/><path d="M10 28 L22 40" stroke="#C9A14A" stroke-width="5" stroke-linecap="round"/><path d="M9 43 L15 37" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`,
  // ---- 투구 ----
  leatherhelm: `<path d="M8 30 Q8 8 24 8 Q40 8 40 30 Z" fill="#8B5A3C" stroke="${INK}" stroke-width="2.5"/><rect x="6" y="26" width="36" height="6" rx="3" fill="#6B4228" stroke="${INK}" stroke-width="2"/><path d="M9 32 L8 42 L14 40 L14 32 Z M39 32 L40 42 L34 40 L34 32 Z" fill="#7A5236" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`,
  ironhelm: `<path d="M8 30 Q8 6 24 6 Q40 6 40 30 Z" fill="#8A9199" stroke="${INK}" stroke-width="2.5"/><path d="M24 6 V28" stroke="#5F6368" stroke-width="2.5"/><path d="M21 7 L24 1 L27 7 Z" fill="#B0B6BC" stroke="${INK}" stroke-width="1.5"/><rect x="6" y="26" width="36" height="6" rx="3" fill="#5F6368" stroke="${INK}" stroke-width="2"/><path d="M8 32 L5 46 L14 44 L14 32 Z M40 32 L43 46 L34 44 L34 32 Z" fill="#6E757D" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`,
  generalhelm: `<path d="M21 8 Q18 -2 24 -2 Q30 -2 27 8 Z" fill="#D9363E" stroke="${INK}" stroke-width="1.5"/><path d="M7 30 Q7 7 24 7 Q41 7 41 30 Z" fill="#2B2321" stroke="#C9A14A" stroke-width="2.5"/><rect x="5" y="26" width="38" height="6" rx="3" fill="#A8342B" stroke="#C9A14A" stroke-width="1.8"/><circle cx="24" cy="29" r="2.5" fill="#F2C230"/><path d="M7 32 L3 46 L14 44 L14 32 Z M41 32 L45 46 L34 44 L34 32 Z" fill="#A8342B" stroke="#C9A14A" stroke-width="1.8" stroke-linejoin="round"/>`,
  dragonhelm: `<circle cx="24" cy="24" r="22" fill="#F2C230" opacity="0.2"/><path d="M12 16 Q2 6 4 -2 Q10 8 16 12 Z M36 16 Q46 6 44 -2 Q38 8 32 12 Z" fill="#E8CF8A" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/><path d="M7 30 Q7 6 24 6 Q41 6 41 30 Z" fill="#F2C230" stroke="${INK}" stroke-width="2.5"/><path d="M24 6 Q19 14 24 22 Q29 14 24 6 Z" fill="#C0392B"/><rect x="5" y="26" width="38" height="6" rx="3" fill="#B8892E" stroke="${INK}" stroke-width="1.8"/><circle cx="24" cy="29" r="2.8" fill="#7FD3C0" stroke="${INK}" stroke-width="1"/><path d="M7 32 L3 46 L14 44 L14 32 Z M41 32 L45 46 L34 44 L34 32 Z" fill="#E3B341" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>`,
  // ---- 갑옷 ----
  paddedarmor: `<path d="M10 12 Q24 6 38 12 L40 42 L8 42 Z" fill="#B49C72" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><path d="M10 20 h28 M9 27 h30 M9 34 h30" stroke="#7A6440" stroke-width="1.5" stroke-dasharray="2.5 2"/><path d="M24 8 V42" stroke="#7A6440" stroke-width="2"/>`,
  leatherarmor: `<path d="M4 16 Q8 8 16 10 L14 20 Z M44 16 Q40 8 32 10 L34 20 Z" fill="#7A5236" stroke="${INK}" stroke-width="2"/><path d="M12 10 Q24 6 36 10 L38 42 L10 42 Z" fill="#7A5236" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><path d="M14 12 L34 40 M34 12 L14 40" stroke="#4A2E1C" stroke-width="3.5"/><rect x="20" y="22" width="8" height="7" rx="1.5" fill="#C9A14A" stroke="${INK}" stroke-width="1.2"/>`,
  scalearmor: `<path d="M3 16 Q8 7 17 10 L15 21 Z M45 16 Q40 7 31 10 L33 21 Z" fill="#8A9199" stroke="${INK}" stroke-width="2"/><path d="M12 10 Q24 5 36 10 L38 40 L10 40 Z" fill="#8A9199" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><path d="M14 16 q3 4 5 0 q3 4 5 0 q3 4 5 0 q3 4 5 0 M13 23 q3 4 5 0 q3 4 5 0 q3 4 5 0 q3 4 5 0 q3 4 5 0 M14 30 q3 4 5 0 q3 4 5 0 q3 4 5 0 q3 4 5 0" stroke="#D8DDE1" stroke-width="1.4" fill="none"/><rect x="9" y="38" width="30" height="5" rx="2" fill="#5F6368" stroke="${INK}" stroke-width="1.5"/>`,
  lamellar: `<path d="M3 16 Q8 7 17 10 L15 21 Z M45 16 Q40 7 31 10 L33 21 Z" fill="#A8342B" stroke="${INK}" stroke-width="2"/><path d="M12 10 Q24 5 36 10 L38 36 L10 36 Z" fill="#A8342B" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><path d="M16 9 V36 M20 8 V36 M24 7 V36 M28 8 V36 M32 9 V36" stroke="#7A1F16" stroke-width="1.2"/><path d="M11 18 h26 M11 27 h26" stroke="#C9A14A" stroke-width="2"/><path d="M9 36 L12 46 L22 46 L22 36 Z M26 36 L26 46 L36 46 L39 36 Z" fill="#A8342B" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`,
  goldarmor: `<circle cx="24" cy="24" r="22" fill="#F2C230" opacity="0.22"/><path d="M2 16 Q7 6 17 10 L15 22 Z M46 16 Q41 6 31 10 L33 22 Z" fill="#E3B341" stroke="${INK}" stroke-width="2"/><path d="M12 10 Q24 5 36 10 L38 36 L10 36 Z" fill="#E3B341" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="24" cy="22" r="6" fill="#C0392B" stroke="${INK}" stroke-width="1.5"/><path d="M20.5 22 q3.5 -5 7 0 q-3.5 5 -7 0" fill="#F2C230"/><path d="M9 36 L12 46 L22 46 L22 36 Z M26 36 L26 46 L36 46 L39 36 Z" fill="#E3B341" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`,
  // ---- 바지 ----
  cottonpants: `<path d="M10 6 H38 L40 40 L27 42 L24 18 L21 42 L8 40 Z" fill="#E9E2D3" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><rect x="9" y="6" width="30" height="5" fill="#8C7A5B"/><path d="M8 36 L21 38 M27 38 L40 36" stroke="#8C7A5B" stroke-width="3"/>`,
  trainpants: `<path d="M10 6 H38 L40 40 L27 42 L24 18 L21 42 L8 40 Z" fill="#3F7D6B" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><rect x="9" y="6" width="30" height="5" fill="#24493F"/><path d="M8 36 L21 38 M27 38 L40 36" stroke="#E9E2D3" stroke-width="3"/>`,
  warriorpants: `<path d="M10 6 H38 L40 40 L27 42 L24 18 L21 42 L8 40 Z" fill="#2B2321" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><rect x="9" y="6" width="30" height="5" fill="#B8332A"/><path d="M8 36 L21 38 M27 38 L40 36" stroke="#B8332A" stroke-width="3"/><path d="M16 14 L18 30 M32 14 L30 30" stroke="#4A423A" stroke-width="1.5"/>`,
  cloudpants: `<path d="M10 6 H38 L40 40 L27 42 L24 18 L21 42 L8 40 Z" fill="#7FA7D9" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><rect x="9" y="6" width="30" height="5" fill="#3E6AA3"/><path d="M12 22 q3 -4 6 0 q3 -3 4 1 M28 28 q3 -4 6 0 q3 -3 4 1" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M8 36 L21 38 M27 38 L40 36" stroke="#fff" stroke-width="3"/>`,
  qilinpants: `<circle cx="24" cy="24" r="22" fill="#F2C230" opacity="0.2"/><path d="M10 6 H38 L40 40 L27 42 L24 18 L21 42 L8 40 Z" fill="#C9A14A" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><rect x="9" y="6" width="30" height="5" fill="#B8332A"/><path d="M11 20 q3 3 5 0 q3 3 5 0 M28 26 q3 3 5 0 q3 3 5 0" stroke="#B8332A" stroke-width="1.6" fill="none"/><path d="M8 36 L21 38 M27 38 L40 36" stroke="#B8332A" stroke-width="3"/>`,
};

function renderGearIcon(id) {
  return `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" class="gear-icon" aria-hidden="true" overflow="visible">${GEAR_ICON_ART[id] || ''}</svg>`;
}

// ---------- UI 아이콘 (24×24) ----------
const UI_ICON_ART = {
  // 엽전 코인
  coin: `<circle cx="12" cy="12" r="10" fill="#E3B341" stroke="#8E6A1E" stroke-width="2"/><circle cx="12" cy="12" r="7" fill="none" stroke="#B8892E" stroke-width="1"/><rect x="9" y="9" width="6" height="6" fill="#F4EBDD" stroke="#8E6A1E" stroke-width="1.5"/>`,
  // 경험치: 빛나는 기(氣) 구슬
  exp: `<circle cx="12" cy="12" r="10" fill="#5E9C8E" opacity="0.25"/><circle cx="12" cy="12" r="7" fill="#7FD3C0" stroke="#2C5E50" stroke-width="2"/><path d="M12 3 v3 M12 18 v3 M3 12 h3 M18 12 h3" stroke="#C9A14A" stroke-width="2" stroke-linecap="round"/><circle cx="10" cy="10" r="2" fill="#fff" opacity="0.8"/>`,
  heart: `<path d="M12 21 C6 16 2 12.5 2 8.5 A5 5 0 0 1 12 6 A5 5 0 0 1 22 8.5 C22 12.5 18 16 12 21 Z" fill="#C8402F" stroke="#7A1F16" stroke-width="1.8" stroke-linejoin="round"/><path d="M6 8 q1 -2 3 -2" stroke="#fff" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.7"/>`,
  'heart-empty': `<path d="M12 21 C6 16 2 12.5 2 8.5 A5 5 0 0 1 12 6 A5 5 0 0 1 22 8.5 C22 12.5 18 16 12 21 Z" fill="rgba(244,235,221,0.5)" stroke="#8C8278" stroke-width="1.8" stroke-linejoin="round"/>`,
  heartbreak: `<path d="M11 21 C6 16 2 12.5 2 8.5 A5 5 0 0 1 11 5.5 L9 10 L12 13 L10 18 Z" fill="#C8402F" stroke="#7A1F16" stroke-width="1.6" stroke-linejoin="round"/><path d="M13 21 C18 16 22 12.5 22 8.5 A5 5 0 0 0 13 5.5 L11.5 10 L14.5 13 L12.5 18 Z" fill="#C8402F" stroke="#7A1F16" stroke-width="1.6" stroke-linejoin="round" transform="translate(2 1) rotate(8 12 12)"/>`,
  lock: `<path d="M7 11 V8 a5 5 0 0 1 10 0 v3" fill="none" stroke="#6E655A" stroke-width="2.5"/><rect x="5" y="11" width="14" height="10" rx="2" fill="#8C8278" stroke="#4A423A" stroke-width="1.5"/><circle cx="12" cy="15.5" r="1.6" fill="#2B2321"/><path d="M12 16.5 v2" stroke="#2B2321" stroke-width="1.5"/>`,
  crown: `<path d="M3 18 L4 7 L8.5 11 L12 4 L15.5 11 L20 7 L21 18 Z" fill="#F2C230" stroke="#8E6A1E" stroke-width="1.6" stroke-linejoin="round"/><rect x="3" y="17" width="18" height="3.5" rx="1" fill="#D4A83A" stroke="#8E6A1E" stroke-width="1.2"/><circle cx="12" cy="13" r="1.6" fill="#C0392B"/>`,
};

function uiIcon(name, className = '') {
  return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="ui-icon ${className}" aria-hidden="true">${UI_ICON_ART[name] || ''}</svg>`;
}

// ---------- 상점 ----------
// 상점 주인: 둥근 검은 모자(瓜皮帽), 팔자 콧수염, 웃는 눈, 비단 마고자, 손에 주판
// mood: 'normal' | 'happy'(물건을 샀을 때) | 'sad'(엽전이 모자랄 때)
function renderShopkeeper(mood = 'normal') {
  const eyes = mood === 'sad'
    ? `<path d="M46 56 Q51 60 56 56 M64 56 Q69 60 74 56" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M45 48 L55 51 M75 48 L65 51" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`
    : `<path d="M45 56 Q50 50 55 56 M65 56 Q70 50 75 56" stroke="${INK}" stroke-width="2.8" fill="none" stroke-linecap="round"/>`;
  const mouth = mood === 'sad'
    ? `<path d="M54 74 Q60 70 66 74" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
    : `<path d="M52 70 Q60 ${mood === 'happy' ? 82 : 78} 68 70 Z" fill="#B23A48" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>`;
  return `<svg viewBox="0 0 120 150" xmlns="http://www.w3.org/2000/svg" class="shopkeeper-svg" overflow="visible">
  <ellipse cx="60" cy="144" rx="38" ry="5" fill="rgba(0,0,0,0.18)"/>
  <path d="M20 146 Q20 98 60 94 Q100 98 100 146 Z" fill="#8E241D" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M60 96 V146" stroke="#C9A14A" stroke-width="3"/>
  ${[106, 118, 130].map((y) => `<circle cx="60" cy="${y}" r="3" fill="#F2C230" stroke="${INK}" stroke-width="1"/>`).join('')}
  <path d="M30 120 q10 6 20 0 M70 120 q10 6 20 0" stroke="#C9A14A" stroke-width="2" fill="none"/>
  <circle cx="60" cy="60" r="32" fill="#F5C7A1" stroke="${INK}" stroke-width="3"/>
  <ellipse cx="28" cy="62" rx="5" ry="8" fill="#F5C7A1" stroke="${INK}" stroke-width="2.5"/>
  <ellipse cx="92" cy="62" rx="5" ry="8" fill="#F5C7A1" stroke="${INK}" stroke-width="2.5"/>
  <path d="M27 46 Q30 18 60 18 Q90 18 93 46 Q78 38 60 38 Q42 38 27 46 Z" fill="#2B2321" stroke="${INK}" stroke-width="2"/>
  <path d="M30 42 Q60 34 90 42" stroke="#8E241D" stroke-width="4" fill="none"/>
  <circle cx="60" cy="18" r="5" fill="#B8332A" stroke="${INK}" stroke-width="2"/>
  ${eyes}
  <ellipse cx="44" cy="66" rx="6" ry="3.5" fill="#F28B8B" opacity="0.6"/><ellipse cx="76" cy="66" rx="6" ry="3.5" fill="#F28B8B" opacity="0.6"/>
  ${mouth}
  <path d="M60 66 Q48 62 38 70 Q48 68 58 69 Z M60 66 Q72 62 82 70 Q72 68 62 69 Z" fill="#2B2321"/>
  <path d="M58 82 Q60 92 62 82" stroke="#2B2321" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <g class="shopkeeper-abacus">
    <rect x="74" y="104" width="38" height="26" rx="3" fill="#8B5A2B" stroke="${INK}" stroke-width="2.5"/>
    <rect x="78" y="108" width="30" height="18" fill="#F4EBDD"/>
    <path d="M78 114 h30" stroke="#5C3A1A" stroke-width="1.5"/>
    ${[0, 1, 2, 3].map((r) => [0, 1, 2].map((c) => `<circle cx="${82 + r * 7.5}" cy="${110 + c * 6 + (c ? 2 : 0)}" r="2.3" fill="#B8332A"/>`).join('')).join('')}
    <ellipse cx="78" cy="122" rx="6" ry="5" fill="#F5C7A1" stroke="${INK}" stroke-width="2"/>
  </g>
</svg>`;
}

// 상점 소모품 그림 (48×48)
const SUPPLY_ART = {
  // 부활권: 노란 부적 종이에 붉은 '生'
  revive: `<path d="M14 4 H34 L36 44 H12 Z" fill="#F2D58A" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M16 8 H32" stroke="#B8332A" stroke-width="2"/><path d="M15 40 H33" stroke="#B8332A" stroke-width="2"/>
    <text x="24" y="30" text-anchor="middle" font-size="17" font-weight="700" fill="#B8332A" font-family="'Ma Shan Zheng', 'Noto Serif SC', serif">生</text>
    <path d="M24 44 v3" stroke="#B8332A" stroke-width="2"/><circle cx="38" cy="10" r="4" fill="#FFE066" opacity="0.7"/>`,
  // 하트 추가: 붉은 하트 + 금빛 '+'
  heart: `<path d="M24 42 C8 30 4 20 10 13 C16 7 22 10 24 15 C26 10 32 7 38 13 C44 20 40 30 24 42 Z" fill="#D9363E" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M14 16 q3 -4 7 -2" stroke="#fff" stroke-width="2" fill="none" opacity="0.7" stroke-linecap="round"/>
    <circle cx="37" cy="36" r="9" fill="#F2C230" stroke="${INK}" stroke-width="2"/><path d="M37 31 v10 M32 36 h10" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`,
  // 시간 추가: 향로와 피어오르는 연기 + '+'
  time: `<path d="M20 4 q-6 6 0 12 q6 6 0 12" stroke="#9C9389" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M22 18 V30" stroke="#8B5A2B" stroke-width="2.5"/><circle cx="22" cy="17" r="2" fill="#E0624F"/>
    <path d="M8 30 H36 L32 42 H12 Z" fill="#C9A14A" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M10 34 H34" stroke="#8E6A1E" stroke-width="1.5"/><path d="M12 42 L10 46 M32 42 L34 46" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="38" cy="14" r="8" fill="#3F7D6B" stroke="${INK}" stroke-width="2"/><path d="M38 10 v8 M34 14 h8" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>`,
};

function renderSupplyIcon(id) {
  return `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" class="supply-icon" aria-hidden="true" overflow="visible">${SUPPLY_ART[id] || ''}</svg>`;
}
