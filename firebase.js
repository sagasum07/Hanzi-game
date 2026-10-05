// ========================================
// Firebase 연동 (로그인 + 학습 기록 저장)
// ========================================
// app.js 는 일반 스크립트라 먼저 실행되고, 이 모듈은 그 뒤에 실행됩니다.
// 준비가 끝나면 window.hanziFirebase 를 만들고 app.js 의 콜백을 호출합니다.
//   - window.onHanziAuthChanged(user | null)  : 로그인 상태가 바뀔 때
//   - window.onHanziFirebaseUnavailable(msg)  : 설정 누락, 네트워크 오류 등으로 사용할 수 없을 때

const SDK_URL = 'https://www.gstatic.com/firebasejs/10.12.2';

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
  const auth = authSdk.getAuth(app);
  const db = firestoreSdk.getFirestore(app);

  const provider = new authSdk.GoogleAuthProvider();
  // 로그아웃 후 다시 로그인할 때 다른 계정을 고를 수 있게 항상 계정 선택 창을 띄움
  provider.setCustomParameters({ prompt: 'select_account' });

  const userDoc = (uid) => firestoreSdk.doc(db, 'users', uid);

  window.hanziFirebase = {
    signIn: () => authSdk.signInWithPopup(auth, provider),
    signOut: () => authSdk.signOut(auth),
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
