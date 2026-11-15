// 앱(Capacitor)에 넣을 웹 파일을 www/ 폴더로 복사합니다.
// 웹사이트(Vercel)는 프로젝트 루트의 파일을 그대로 쓰므로 이 스크립트와 무관합니다.
import { cpSync, mkdirSync, rmSync, readFileSync, writeFileSync, existsSync } from 'node:fs';

const FILES = [
  'index.html',
  'app.js',
  'avatar.js',
  'stage-game.js',
  'style.css',
  'firebase.js',
  'firebase-config.js',
  'data.js',
  'data_hsk3.js',
  'data_hsk4.js',
  'data_hsk5.js',
  'data_hsk6.js',
  'bgm.mp3',
];

rmSync('www', { recursive: true, force: true });
mkdirSync('www');
for (const file of FILES) {
  cpSync(file, `www/${file}`);
}

// 단어 예문 (급수별 JSON 만, 원본 tsv 와 병음 사전은 제외)
mkdirSync('www/examples');
for (const level of [1, 2, 3, 4, 5, 6]) {
  const file = `examples/hsk${level}.json`;
  if (existsSync(file)) cpSync(file, `www/${file}`);
}

// 애드센스는 웹사이트 전용: 앱(WebView) 안에 넣으면 정책 위반이라 앱용 index.html 에서 제거
const appIndex = readFileSync('www/index.html', 'utf8').replace(/[ \t]*<!-- adsense:start[\s\S]*?<!-- adsense:end -->\n?/g, '');
if (appIndex.includes('adsbygoogle')) throw new Error('앱용 index.html 에 애드센스 코드가 남아 있습니다.');
writeFileSync('www/index.html', appIndex);
console.log(`www/ 에 ${FILES.length}개 파일을 복사했습니다.`);
