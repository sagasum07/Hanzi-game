// ========================================
// 화면 아이콘 (icons.js) — 이모지 대신 직접 그린 동양풍 아이콘
// ========================================
// app.js 보다 먼저 불러오는 일반 스크립트입니다.
//   icon('home')                → <svg class="ico">…</svg> 문자열
//   setIconLabel(el, '글자', 'go')  → 글자 + 아이콘 (아이콘이 앞이면 4번째 인자 true)
//   HTML 의 <i data-icon="이름"></i> 는 불러올 때 그림으로 바뀝니다.
// 색은 대부분 currentColor(글자색)를 따라가고, 포인트 색만 주홍·금·비취를 씁니다.

const ICON_ART = {
  // 소리 (징 모양 스피커 + 소리 물결)
  speaker: '<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" fill="currentColor"/><path d="M15 9a4 4 0 0 1 0 6M17.5 6.5a7.5 7.5 0 0 1 0 11" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/>',
  'speaker-low': '<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" fill="currentColor"/><path d="M15 9a4 4 0 0 1 0 6" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/>',
  mute: '<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" fill="currentColor"/><path d="M15.5 9.5l5 5M20.5 9.5l-5 5" stroke="#B8332A" stroke-width="2" stroke-linecap="round"/>',
  // 앞으로 (붓으로 그은 화살)
  go: '<path d="M4 12.5c4-1 8-1 13-.5" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M13 7.5l5.5 4.6L13 16.8" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  back: '<path d="M20 12.5c-4-1-8-1-13-.5" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M11 7.5L5.5 12.1 11 16.8" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  // 집 (기와지붕 한옥)
  home: '<path d="M2.5 11.5Q6 11 8 8.5L12 4l4 4.5q2 2.5 5.5 3" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 11v8.5h12V11" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round"/><rect x="10" y="14" width="4" height="5.5" fill="#B8332A"/>',
  // 다시 (둥근 구름 화살)
  repeat: '<path d="M18.5 9A7 7 0 1 0 19 14" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M19.5 4.5V9.5h-5" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  // 책 (펼친 죽간·책)
  book: '<path d="M3 6c3-1.5 6-1.5 9 .5 3-2 6-2 9-.5v12c-3-1.5-6-1.5-9 .5-3-2-6-2-9-.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 6.5V19" stroke="currentColor" stroke-width="1.6"/><path d="M5.5 9.5c1.5-.5 3-.5 4.5 0M5.5 12.5c1.5-.5 3-.5 4.5 0M14 9.5c1.5-.5 3-.5 4.5 0" stroke="#B8332A" stroke-width="1.3" stroke-linecap="round"/>',
  // 주사위
  dice: '<rect x="4" y="4" width="16" height="16" rx="3.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="8.5" cy="8.5" r="1.6" fill="#B8332A"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.6" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1.6" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1.6" fill="currentColor"/>',
  // 달력 (붉은 고리 달력)
  calendar: '<rect x="3.5" y="5.5" width="17" height="15" rx="2" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M3.5 10h17" stroke="currentColor" stroke-width="1.9"/><path d="M8 3.5v4M16 3.5v4" stroke="#B8332A" stroke-width="2.2" stroke-linecap="round"/><rect x="7" y="13" width="3" height="3" fill="#B8332A"/>',
  // 맞음 · 틀림
  check: '<path d="M4.5 12.5l5 5L19.5 6.5" stroke="#3F7D6B" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  cross: '<path d="M6 6l12 12M18 6L6 18" stroke="#B8332A" stroke-width="2.8" stroke-linecap="round"/>',
  // 힌트 (등불)
  lantern: '<path d="M12 2.5v2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M8.5 5h7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><ellipse cx="12" cy="12" rx="6" ry="6.8" fill="#D9533F" stroke="currentColor" stroke-width="1.5"/><path d="M12 5.4v13.2M9 6.5q-2 5.5 0 11M15 6.5q2 5.5 0 11" stroke="#8E241D" stroke-width="1" fill="none"/><path d="M8.5 19h7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 19.5v2.5" stroke="#C9A14A" stroke-width="1.8" stroke-linecap="round"/>',
  // 넘기기
  skip: '<path d="M5 6.5l6.5 5.5L5 17.5M12 6.5l6.5 5.5L12 17.5" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 6v12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
  // 좋아요 · 싫어요 (엄지)
  'thumb-up': '<path d="M7.5 11v9H4.5v-9z" fill="currentColor"/><path d="M9 11l3.5-7c1.6 0 2.5 1.2 2.1 3L14 10h5c1.2 0 2 1 1.7 2.2l-1.6 6.3c-.3 1-1.1 1.5-2 1.5H9z" fill="#E8B796" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
  'thumb-down': '<g transform="rotate(180 12 12)"><path d="M7.5 11v9H4.5v-9z" fill="currentColor"/><path d="M9 11l3.5-7c1.6 0 2.5 1.2 2.1 3L14 10h5c1.2 0 2 1 1.7 2.2l-1.6 6.3c-.3 1-1.1 1.5-2 1.5H9z" fill="#E8B796" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></g>',
  // 자물쇠
  lock: '<path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="2" fill="none"/><rect x="5" y="11" width="14" height="10" rx="2" fill="#C9A14A" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="15.5" r="1.6" fill="currentColor"/>',
  // 복사 (겹친 종이)
  copy: '<rect x="8" y="8" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M5.5 15.5h-.5a1.5 1.5 0 0 1-1.5-1.5V5a1.5 1.5 0 0 1 1.5-1.5h9A1.5 1.5 0 0 1 15.5 5v.5" stroke="currentColor" stroke-width="1.9" fill="none"/>',
  // 카메라
  camera: '<path d="M4 8h3l1.6-2.5h6.8L17 8h3a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 20 19H4a1.5 1.5 0 0 1-1.5-1.5v-8A1.5 1.5 0 0 1 4 8z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/><circle cx="12" cy="13.2" r="3.4" fill="none" stroke="currentColor" stroke-width="1.9"/><circle cx="18.2" cy="10.5" r="0.9" fill="#B8332A"/>',
  // 별 (단어장)
  star: '<path d="M12 3.2l2.6 5.5 6 .8-4.4 4.1 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.5l6-.8z" fill="#E3B341" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>',
  // 트로피 대신 금 원보(元寶)
  ingot: '<path d="M3 15c.5-4 3.5-5 6-4 1-3 5-3 6 0 2.5-1 5.5 0 6 4z" fill="#F2C230" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M3 15c3 2.5 15 2.5 18 0v2c-3 2.5-15 2.5-18 0z" fill="#C9A14A" stroke="currentColor" stroke-width="1.4"/>',
};

function icon(name, extraClass = '') {
  return `<svg class="ico${extraClass ? ` ${extraClass}` : ''}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${ICON_ART[name] || ''}</svg>`;
}

// 버튼 글자 + 아이콘 (글자는 textContent 로 넣어 안전하게)
function setIconLabel(el, text, iconName, iconFirst = false) {
  if (!el) return;
  el.textContent = text;
  if (!iconName) return;
  el.insertAdjacentHTML(iconFirst ? 'afterbegin' : 'beforeend', iconFirst ? `${icon(iconName)} ` : ` ${icon(iconName)}`);
}

function hydrateIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach((el) => {
    el.innerHTML = icon(el.dataset.icon);
  });
}

hydrateIcons();
