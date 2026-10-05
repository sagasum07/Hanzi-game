// ========================================
// Firebase 연동 (로그인 + 학습 기록 저장)
// ========================================
// app.js 는 일반 스크립트라 먼저 실행되고, 이 모듈은 그 뒤에 실행됩니다.
// 준비가 끝나면 window.hanziFirebase 를 만들고 app.js 의 콜백을 호출합니다.
//   - window.onHanziAuthChanged(user | null)  : 로그인 상태가 바뀔 때
//   - window.onHanziFirebaseUnavailable(msg)  : 설정 누락, 네트워크 오류 등으로 사용할 수 없을 때

const SDK_URL = 'https://www.gstatic.com/firebasejs/10.12.2';

// 안드로이드 앱(Capacitor) 안에서 실행 중인지 여부
// 앱에서는 팝업 로그인이 동작하지 않으므로, 안드로이드 기본 구글 로그인으로 받은 토큰으로 Firebase 에 로그인합니다.
const isNativeApp = Boolean(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
const callNativeAuth = (method, options = {}) => window.Capacitor.nativePromise('FirebaseAuthentication', method, options);

try {
  const { firebaseConfig } = await import('./firebase-config.js');
  if (!firebaseConfig || !firebaseConfig.apiKey) {
    throw new Error('firebase-config.js 에 Firebase 설정값이 비어 있습니다.');
  }

  const [appSdk, authSdk, firestoreSdk] = await Promise.all([
    import(`${SDK_URL}/firebase-app.js`),
    import(`${SDK_URL}/firebase-auth.js`),
    import(`${SDK_URL}/firebase-firestore.js`),
  ]);

  const app = appSdk.initializeApp(firebaseConfig);
  // 앱의 WebView 에서는 로그인 상태 저장 방식을 명시해야 초기화가 멈추지 않음
  const auth = isNativeApp
    ? authSdk.initializeAuth(app, { persistence: authSdk.indexedDBLocalPersistence })
    : authSdk.getAuth(app);
  const db = firestoreSdk.getFirestore(app);

  const provider = new authSdk.GoogleAuthProvider();
  // 로그아웃 후 다시 로그인할 때 다른 계정을 고를 수 있게 항상 계정 선택 창을 띄움
  provider.setCustomParameters({ prompt: 'select_account' });

  const userDoc = (uid) => firestoreSdk.doc(db, 'users', uid);

  async function signInNative() {
    let result;
    try {
      result = await callNativeAuth('signInWithGoogle');
    } catch (error) {
      // 사용자가 계정 선택 창을 닫은 경우는 오류 안내 없이 넘어가도록 웹과 같은 코드로 바꿈
      if (/cancel/i.test(error.message || '')) {
        throw Object.assign(new Error(error.message), { code: 'auth/popup-closed-by-user' });
      }
      throw error;
    }
    const idToken = result && result.credential && result.credential.idToken;
    if (!idToken) throw new Error('구글 로그인 토큰을 받지 못했습니다.');
    return authSdk.signInWithCredential(auth, authSdk.GoogleAuthProvider.credential(idToken));
  }

  async function signOutAll() {
    if (isNativeApp) {
      try {
        await callNativeAuth('signOut'); // 다음 로그인 때 계정을 다시 고를 수 있게 기기 쪽 로그인도 해제
      } catch (error) {
        console.warn('기기 구글 로그아웃 실패:', error);
      }
    }
    await authSdk.signOut(auth);
  }

  window.hanziFirebase = {
    signIn: isNativeApp ? signInNative : () => authSdk.signInWithPopup(auth, provider),
    signOut: signOutAll,
    loadRecord: async (uid) => {
      const snap = await firestoreSdk.getDoc(userDoc(uid));
      return snap.exists() ? snap.data() : null;
    },
    saveRecord: (uid, data) => firestoreSdk.setDoc(userDoc(uid), data),
  };

  authSdk.onAuthStateChanged(auth, (user) => {
    const info = user ? { uid: user.uid, name: user.displayName || user.email || '사용자' } : null;
    if (window.onHanziAuthChanged) window.onHanziAuthChanged(info);
  });
} catch (error) {
  console.error('Firebase 초기화 실패:', error);
  if (window.onHanziFirebaseUnavailable) window.onHanziFirebaseUnavailable(error.message);
}
