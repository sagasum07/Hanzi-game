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

  // 개발용: localhost 에서 ?emulator 를 붙여 열면 내 컴퓨터의 Firebase 에뮬레이터에 연결 (실제 서비스와 무관)
  const useEmulator = ['localhost', '127.0.0.1'].includes(location.hostname)
    && new URLSearchParams(location.search).has('emulator');
  if (useEmulator) {
    authSdk.connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    firestoreSdk.connectFirestoreEmulator(db, '127.0.0.1', 8080);
  }

  const provider = new authSdk.GoogleAuthProvider();
  // 로그아웃 후 다시 로그인할 때 다른 계정을 고를 수 있게 항상 계정 선택 창을 띄움
  provider.setCustomParameters({ prompt: 'select_account' });

  const { doc, getDoc, getDocs, setDoc, deleteDoc, collection, query, where, runTransaction, writeBatch, serverTimestamp } = firestoreSdk;
  const userDoc = (uid) => doc(db, 'users', uid);

  // ---------- 프로필 · 닉네임 · 고유 번호 ----------
  // profiles/{uid}: { nickname, userCode } — 친구 찾기를 위해 로그인한 사용자 누구나 읽을 수 있음
  // nicknames/{n_닉네임 소문자}, userCodes/{8자리}: 점유 표시 (보안 규칙이 중복 생성을 막음)
  const profileDoc = (uid) => doc(db, 'profiles', uid);
  const nicknameKey = (nickname) => 'n_' + nickname.toLowerCase();
  const nicknameDoc = (nickname) => doc(db, 'nicknames', nicknameKey(nickname));
  const userCodeDoc = (code) => doc(db, 'userCodes', code);
  const requestDoc = (from, to) => doc(db, 'friendRequests', `${from}_${to}`);
  const pairId = (a, b) => (a < b ? `${a}_${b}` : `${b}_${a}`);
  const friendshipDoc = (a, b) => doc(db, 'friendships', pairId(a, b));
  const randomUserCode = () => String(Math.floor(10000000 + Math.random() * 90000000));
  const socialError = (code, message) => Object.assign(new Error(message), { code });

  function myUid() {
    if (!auth.currentUser) throw socialError('not-signed-in', '로그인이 필요합니다.');
    return auth.currentUser.uid;
  }

  async function getProfile(uid) {
    const snap = await getDoc(profileDoc(uid));
    return snap.exists() ? { uid, ...snap.data() } : null;
  }

  async function isNicknameAvailable(nickname) {
    const snap = await getDoc(nicknameDoc(nickname));
    return !snap.exists() || snap.data().uid === myUid();
  }

  // 닉네임 저장 (처음이면 고유 번호도 발급). 중복이면 code 'nickname-taken' 오류
  async function saveProfile(nickname) {
    const uid = myUid();
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidateCode = randomUserCode();
      try {
        return await runTransaction(db, async (tx) => {
          const prevSnap = await tx.get(profileDoc(uid));
          const prev = prevSnap.exists() ? prevSnap.data() : null;
          const nickSnap = await tx.get(nicknameDoc(nickname));
          if (nickSnap.exists() && nickSnap.data().uid !== uid) {
            throw socialError('nickname-taken', '이미 사용 중인 닉네임이에요.');
          }
          let userCode = prev && prev.userCode;
          if (!userCode) {
            const codeSnap = await tx.get(userCodeDoc(candidateCode));
            if (codeSnap.exists()) throw socialError('code-taken', '고유 번호 충돌');
            userCode = candidateCode;
            tx.set(userCodeDoc(userCode), { uid });
          }
          if (!nickSnap.exists()) tx.set(nicknameDoc(nickname), { uid });
          if (prev && nicknameKey(prev.nickname) !== nicknameKey(nickname)) tx.delete(nicknameDoc(prev.nickname));
          tx.set(profileDoc(uid), { nickname, userCode, updatedAt: serverTimestamp() });
          return { nickname, userCode };
        });
      } catch (error) {
        if (error.code !== 'code-taken') throw error; // 번호가 겹치면 다른 번호로 다시 시도
      }
    }
    throw socialError('code-failed', '고유 번호를 만들지 못했어요. 다시 시도해 주세요.');
  }

  // @12345678 / 12345678 은 고유 번호로, 그 외는 닉네임으로 찾음
  async function findUser(text) {
    const value = text.trim().replace(/\s+/g, ' ');
    if (!value || value.includes('/')) return null;
    const codeMatch = value.match(/^@?(\d{8})$/);
    const claim = await getDoc(codeMatch ? userCodeDoc(codeMatch[1]) : nicknameDoc(value));
    return claim.exists() ? getProfile(claim.data().uid) : null;
  }

  // ---------- 친구 ----------
  async function acceptFriendRequest(fromUid) {
    const uid = myUid();
    const members = [uid, fromUid].sort();
    const batch = writeBatch(db);
    batch.set(friendshipDoc(uid, fromUid), { members, createdAt: serverTimestamp() });
    batch.delete(requestDoc(fromUid, uid));
    await batch.commit();
  }

  // 결과: 'sent' | 'accepted'(상대가 먼저 요청해 둔 경우 바로 친구) | 'already-sent' | 'already-friends'
  async function sendFriendRequest(toUid) {
    const uid = myUid();
    if (toUid === uid) throw socialError('self', '나 자신은 친구로 추가할 수 없어요.');
    const [friendship, reverse, mine] = await Promise.all([
      getDoc(friendshipDoc(uid, toUid)),
      getDoc(requestDoc(toUid, uid)),
      getDoc(requestDoc(uid, toUid)),
    ]);
    if (friendship.exists()) return 'already-friends';
    if (reverse.exists()) {
      await acceptFriendRequest(toUid);
      return 'accepted';
    }
    if (mine.exists()) return 'already-sent';
    await setDoc(requestDoc(uid, toUid), { from: uid, to: toUid, createdAt: serverTimestamp() });
    return 'sent';
  }

  async function countIncomingRequests() {
    const snap = await getDocs(query(collection(db, 'friendRequests'), where('to', '==', myUid())));
    return snap.size;
  }

  // 받은 요청 · 보낸 요청 · 친구 목록 (각 { uid, nickname, userCode }, 탈퇴한 사용자는 제외)
  async function getFriendData() {
    const uid = myUid();
    const [incoming, outgoing, friendships] = await Promise.all([
      getDocs(query(collection(db, 'friendRequests'), where('to', '==', uid))),
      getDocs(query(collection(db, 'friendRequests'), where('from', '==', uid))),
      getDocs(query(collection(db, 'friendships'), where('members', 'array-contains', uid))),
    ]);
    const byTime = (a, b) => ((b.data().createdAt || {}).seconds || 0) - ((a.data().createdAt || {}).seconds || 0);
    const incomingIds = incoming.docs.sort(byTime).map((d) => d.data().from);
    const outgoingIds = outgoing.docs.sort(byTime).map((d) => d.data().to);
    const friendIds = friendships.docs.sort(byTime).map((d) => d.data().members.find((m) => m !== uid));
    const allIds = [...new Set([...incomingIds, ...outgoingIds, ...friendIds])];
    const profiles = new Map((await Promise.all(allIds.map(getProfile))).filter(Boolean).map((p) => [p.uid, p]));
    const pick = (ids) => ids.map((id) => profiles.get(id)).filter(Boolean);
    return { incoming: pick(incomingIds), outgoing: pick(outgoingIds), friends: pick(friendIds) };
  }

  // 계정 삭제 때: 친구 관계·요청, 공개 프로필과 닉네임·고유 번호 점유를 모두 지움
  async function deleteSocialData(uid) {
    const [profileSnap, incoming, outgoing, friendships] = await Promise.all([
      getDoc(profileDoc(uid)),
      getDocs(query(collection(db, 'friendRequests'), where('to', '==', uid))),
      getDocs(query(collection(db, 'friendRequests'), where('from', '==', uid))),
      getDocs(query(collection(db, 'friendships'), where('members', 'array-contains', uid))),
    ]);
    const batch = writeBatch(db);
    [...incoming.docs, ...outgoing.docs, ...friendships.docs].forEach((d) => batch.delete(d.ref));
    if (profileSnap.exists()) {
      const { nickname, userCode } = profileSnap.data();
      batch.delete(nicknameDoc(nickname));
      batch.delete(userCodeDoc(userCode));
      batch.delete(profileDoc(uid));
    }
    await batch.commit();
  }

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

  // 계정 삭제: 본인 확인을 위해 다시 로그인 → 학습 기록 문서 삭제 → Firebase 계정 삭제
  // (Firebase 는 최근에 로그인한 경우에만 계정 삭제를 허용하므로 먼저 재인증)
  async function deleteAccount() {
    const user = auth.currentUser;
    if (!user) throw new Error('로그인 상태가 아닙니다.');

    if (isNativeApp) {
      const result = await callNativeAuth('signInWithGoogle');
      const idToken = result && result.credential && result.credential.idToken;
      if (!idToken) throw new Error('구글 로그인 토큰을 받지 못했습니다.');
      await authSdk.reauthenticateWithCredential(user, authSdk.GoogleAuthProvider.credential(idToken));
    } else {
      await authSdk.reauthenticateWithPopup(user, provider);
    }

    await deleteSocialData(user.uid);
    await deleteDoc(userDoc(user.uid));
    await authSdk.deleteUser(user);

    if (isNativeApp) {
      try {
        await callNativeAuth('signOut');
      } catch (error) {
        console.warn('기기 구글 로그아웃 실패:', error);
      }
    }
  }

  window.hanziFirebase = {
    signIn: isNativeApp ? signInNative : () => authSdk.signInWithPopup(auth, provider),
    signOut: signOutAll,
    deleteAccount: deleteAccount,
    loadRecord: async (uid) => {
      const snap = await firestoreSdk.getDoc(userDoc(uid));
      return snap.exists() ? snap.data() : null;
    },
    saveRecord: (uid, data) => setDoc(userDoc(uid), data),
    getMyProfile: () => getProfile(myUid()),
    isNicknameAvailable: isNicknameAvailable,
    saveProfile: saveProfile,
    findUser: findUser,
    sendFriendRequest: sendFriendRequest,
    acceptFriendRequest: acceptFriendRequest,
    declineFriendRequest: (fromUid) => deleteDoc(requestDoc(fromUid, myUid())),
    cancelFriendRequest: (toUid) => deleteDoc(requestDoc(myUid(), toUid)),
    removeFriend: (friendUid) => deleteDoc(friendshipDoc(myUid(), friendUid)),
    countIncomingRequests: countIncomingRequests,
    getFriendData: getFriendData,
  };

  // 개발용: 에뮬레이터에서는 가짜 구글 계정으로 로그인 (sub 가 같으면 같은 사용자)
  if (useEmulator) {
    window.hanziFirebase.emulatorSignIn = (sub, name) => authSdk.signInWithCredential(auth,
      authSdk.GoogleAuthProvider.credential(JSON.stringify({ sub, email: `${sub}@example.com`, email_verified: true, name })));
  }

  authSdk.onAuthStateChanged(auth, (user) => {
    const info = user ? { uid: user.uid, name: user.displayName || user.email || '사용자' } : null;
    if (window.onHanziAuthChanged) window.onHanziAuthChanged(info);
  });
} catch (error) {
  console.error('Firebase 초기화 실패:', error);
  if (window.onHanziFirebaseUnavailable) window.onHanziFirebaseUnavailable(error.message);
}
