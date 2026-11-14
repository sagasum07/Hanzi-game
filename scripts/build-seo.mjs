// 검색엔진용 정적 페이지를 만듭니다.
//   words/index.html          HSK 급수별 단어 목록 모음
//   words/hsk-1.html ~ hsk-6  급수별 단어 목록 (한자·병음·뜻)
//   sitemap.xml               검색엔진에 알려 줄 페이지 목록
// 단어 데이터(data*.js)를 바꾼 뒤에는 `npm run build:seo` 로 다시 만드세요.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import vm from 'node:vm';

const SITE = 'https://www.zhongwenxuexi-app.com';
const TODAY = new Date().toISOString().slice(0, 10);

// 브라우저용 데이터 파일(const hsk1Words = [...])을 읽어서 급수별 단어 배열로
const dataCode = ['data.js', 'data_hsk3.js', 'data_hsk4.js', 'data_hsk5.js', 'data_hsk6.js']
  .map((f) => readFileSync(f, 'utf8'))
  .join('\n');
const wordsByLevel = vm.runInNewContext(
  `${dataCode}\n({ 1: hsk1Words, 2: hsk2Words, 3: hsk3Words, 4: hsk4Words, 5: hsk5Words, 6: hsk6Words })`
);

const LEVELS = {
  1: { name: '입문', plan: '2주', days: 14, total: 150,
    about: '중국어를 처음 시작하는 단계예요. 인사, 숫자, 가족, 시간처럼 일상에서 가장 자주 쓰는 기초 단어를 익히고, 아주 간단한 문장을 이해하고 말할 수 있게 됩니다.' },
  2: { name: '초급', plan: '2주', days: 14, total: 300,
    about: '간단한 일상 대화를 나눌 수 있는 단계예요. 날씨, 쇼핑, 교통, 음식처럼 생활과 가까운 주제의 단어가 늘어나고, 자기 생각을 짧게 표현할 수 있게 됩니다.' },
  3: { name: '중급', plan: '한 달', days: 30, total: 600,
    about: '생활·학습·업무에서 기본적인 의사소통을 할 수 있는 단계예요. 감정을 나타내는 말과 문장을 이어 주는 접속사가 많아지고, 여행지에서 대부분의 상황에 대처할 수 있게 됩니다.' },
  4: { name: '고급', plan: '두 달', days: 60, total: 1200,
    about: '여러 주제에 대해 원어민과 비교적 자연스럽게 대화할 수 있는 단계예요. 추상적인 개념을 나타내는 단어와 2음절 동사·형용사가 본격적으로 나옵니다.' },
  5: { name: '심화', plan: '두 달', days: 60, total: 2500,
    about: '중국어 신문과 잡지를 읽고 영화나 드라마를 즐길 수 있는 단계예요. 사회, 경제, 문화와 관련된 어휘가 크게 늘어나고, 긴 글의 흐름을 따라갈 수 있게 됩니다.' },
  6: { name: '마스터', plan: '네 달', days: 120, total: 5000,
    about: '중국어로 된 정보를 쉽게 이해하고 자신의 의견을 유창하게 표현할 수 있는 최상위 단계예요. 성어(사자성어)와 문어체 표현이 많이 나옵니다.' },
};

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function page({ path, title, description, body, jsonLd }) {
  const url = `${SITE}${path}`;
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="中文学习">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${SITE}/og-image.png">
  <link rel="icon" href="/favicon.png">
  <link rel="stylesheet" href="/pages.css">
  ${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ''}
</head>
<body>
  <header class="site-header">
    <a class="brand" href="/">中文学习</a>
    <nav>
      <a href="/words">단어 목록</a>
      <a class="nav-about" href="/about">소개</a>
      <a class="nav-cta" href="/">게임 시작</a>
    </nav>
  </header>
  <main>
${body}
  </main>
  <footer class="site-footer">
    <p><a href="/">中文学习</a> · <a href="/words">HSK 단어 목록</a> · <a href="/about">소개</a> · <a href="/privacy">개인정보처리방침</a></p>
    <p>문의: <a href="mailto:sagasum07@gmail.com">sagasum07@gmail.com</a></p>
  </footer>
</body>
</html>
`;
}

function breadcrumbLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE}${path}` })),
  };
}

mkdirSync('words', { recursive: true });

// ---------- 급수별 단어 목록 ----------
for (const level of [1, 2, 3, 4, 5, 6]) {
  const info = LEVELS[level];
  const words = wordsByLevel[level];
  const perDay = Math.round(words.length / info.days);
  const rows = words.map((w, i) => `        <tr><td class="num">${i + 1}</td><td class="hanzi" lang="zh-CN">${esc(w.hanzi)}</td><td class="pinyin">${esc(w.pinyin)}</td><td>${esc(w.meaning)}</td></tr>`).join('\n');
  const levelNav = [1, 2, 3, 4, 5, 6].map((l) => (l === level
    ? `<span class="level-chip current">${l}급</span>`
    : `<a class="level-chip" href="/words/hsk-${l}">${l}급</a>`)).join('');
  const sample = words.slice(0, 5).map((w) => w.hanzi).join(', ');

  const body = `    <nav class="breadcrumb"><a href="/">홈</a> › <a href="/words">HSK 단어 목록</a> › HSK ${level}급</nav>
    <h1>HSK ${level}급 단어 ${words.length}개 <small>병음·뜻 총정리</small></h1>
    <div class="level-nav">${levelNav}</div>
    <section class="intro">
      <p>${info.about}</p>
      <p>HSK ${level}급(${info.name})을 준비하려면 누적 약 ${info.total.toLocaleString()}개 단어를 알아야 해요. 이 페이지에는 <strong>${level}급에서 새로 배우는 단어 ${words.length}개</strong>를 병음 알파벳 순서로 정리했습니다. (예: ${esc(sample)} …)</p>
      <ul class="stats">
        <li><strong>${words.length}개</strong><span>${level}급 새 단어</span></li>
        <li><strong>${info.plan}</strong><span>학습 플랜</span></li>
        <li><strong>하루 약 ${perDay}개</strong><span>${info.days}일 기준</span></li>
      </ul>
      <a class="cta" href="/">🎮 中文学习에서 ${info.plan} 플랜으로 외우기</a>
      <p class="hint">게임에서는 하루 분량의 단어를 공부한 뒤 퀴즈로 확인하고, 틀린 단어는 오답 노트에, 외우고 싶은 단어는 나의 단어장에 모을 수 있어요. 단어마다 원어민 발음도 들을 수 있습니다.</p>
    </section>
    <section>
      <h2>HSK ${level}급 단어 목록</h2>
      <div class="table-wrap">
      <table class="word-table">
        <thead><tr><th class="num">번호</th><th>한자</th><th>병음</th><th>뜻</th></tr></thead>
        <tbody>
${rows}
        </tbody>
      </table>
      </div>
    </section>
    <section class="next">
      <h2>다른 급수 단어 보기</h2>
      <div class="level-nav">${levelNav}</div>
    </section>`;

  writeFileSync(`words/hsk-${level}.html`, page({
    path: `/words/hsk-${level}`,
    title: `HSK ${level}급 단어 ${words.length}개 총정리 (병음·뜻) | 中文学习`,
    description: `HSK ${level}급(${info.name}) 필수 단어 ${words.length}개를 한자·병음·한국어 뜻으로 정리했어요. ${info.plan} 학습 플랜과 퀴즈 게임으로 무료로 외워 보세요.`,
    body,
    jsonLd: breadcrumbLd([['홈', '/'], ['HSK 단어 목록', '/words'], [`HSK ${level}급`, `/words/hsk-${level}`]]),
  }));
  console.log(`words/hsk-${level}.html  (${words.length}개)`);
}

// ---------- 단어 목록 모음 ----------
const cards = [1, 2, 3, 4, 5, 6].map((level) => {
  const info = LEVELS[level];
  const words = wordsByLevel[level];
  return `      <a class="level-card" href="/words/hsk-${level}">
        <span class="level-badge">HSK ${level}급</span>
        <strong>${info.name}</strong>
        <span>새 단어 ${words.length}개 · ${info.plan} 플랜</span>
        <span class="sample" lang="zh-CN">${words.slice(0, 4).map((w) => esc(w.hanzi)).join(' · ')}</span>
      </a>`;
}).join('\n');
const totalWords = [1, 2, 3, 4, 5, 6].reduce((n, l) => n + wordsByLevel[l].length, 0);

writeFileSync('words/index.html', page({
  path: '/words',
  title: 'HSK 1~6급 단어 목록 총정리 (병음·뜻) | 中文学习',
  description: `HSK 1급부터 6급까지 필수 단어 ${totalWords.toLocaleString()}개를 급수별로 한자·병음·한국어 뜻과 함께 정리했어요. 급수를 골라 단어를 확인하고 게임으로 외워 보세요.`,
  body: `    <nav class="breadcrumb"><a href="/">홈</a> › HSK 단어 목록</nav>
    <h1>HSK 1~6급 단어 목록 <small>${totalWords.toLocaleString()}개</small></h1>
    <section class="intro">
      <p>HSK(汉语水平考试)는 중국어 능력을 평가하는 대표적인 시험이에요. 급수가 올라갈수록 알아야 할 단어가 늘어나서, 6급까지 누적 약 5,000개 단어를 익히게 됩니다.</p>
      <p>아래에서 급수를 고르면 그 급수에서 새로 배우는 단어를 한자·병음·뜻과 함께 볼 수 있어요. 목록을 훑어본 뒤 <a href="/">中文学习 게임</a>에서 하루 분량씩 퀴즈로 외워 보세요.</p>
    </section>
    <div class="level-grid">
${cards}
    </div>`,
  jsonLd: breadcrumbLd([['홈', '/'], ['HSK 단어 목록', '/words']]),
}));
console.log('words/index.html');

// ---------- 사이트맵 ----------
const paths = ['/', '/words', ...[1, 2, 3, 4, 5, 6].map((l) => `/words/hsk-${l}`), '/about', '/privacy'];
writeFileSync('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${SITE}${p === '/' ? '/' : p}</loc><lastmod>${TODAY}</lastmod></url>`).join('\n')}
</urlset>
`);
console.log('sitemap.xml');
