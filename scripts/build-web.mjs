// 앱(Capacitor)에 넣을 웹 파일을 www/ 폴더로 복사합니다.
// 웹사이트(Vercel)는 프로젝트 루트의 파일을 그대로 쓰므로 이 스크립트와 무관합니다.
import { cpSync, mkdirSync, rmSync } from 'node:fs';

const FILES = [
  'index.html',
  'app.js',
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
console.log(`www/ 에 ${FILES.length}개 파일을 복사했습니다.`);
