// 플레이 스토어 업로드용 앱 번들(.aab)을 만듭니다.
// 1) 웹 파일을 www/ 로 복사  2) 안드로이드 프로젝트에 반영  3) 출시용 번들 빌드
// JAVA_HOME 이 없으면 Android Studio 에 들어 있는 Java 를 사용합니다.
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';

const env = { ...process.env };
const studioJava = '/Applications/Android Studio.app/Contents/jbr/Contents/Home';
if (!env.JAVA_HOME && existsSync(studioJava)) env.JAVA_HOME = studioJava;
if (!env.ANDROID_HOME) env.ANDROID_HOME = `${homedir()}/Library/Android/sdk`;

const run = (cmd, cwd = '.') => execSync(cmd, { stdio: 'inherit', cwd, env });

if (!existsSync('android/keystore.properties')) {
  console.warn('⚠️  android/keystore.properties 가 없어 서명되지 않은 번들을 만듭니다. (플레이 스토어에는 올릴 수 없음)');
}
run('node scripts/build-web.mjs');
run('npx cap sync android');
run('./gradlew bundleRelease', 'android');
console.log('\n✅ 완료: android/app/build/outputs/bundle/release/app-release.aab');
