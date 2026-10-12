// Firestore 보안 규칙 테스트 (Firebase 에뮬레이터에서 실행)
// 실행: npm run test:rules
import { test, before, after } from 'node:test';
import { readFileSync } from 'node:fs';
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from '@firebase/rules-unit-testing';
import {
  doc, getDoc, setDoc, deleteDoc, writeBatch, serverTimestamp,
  collection, query, where, getDocs,
} from 'firebase/firestore';

let env;
const db = (uid) => (uid ? env.authenticatedContext(uid) : env.unauthenticatedContext()).firestore();

// 앱(firebase.js)과 같은 방식으로 프로필 + 닉네임·고유 번호 점유를 한 번에 저장
function profileBatch(fs, uid, nickname, userCode, { claimCode = true, releaseNickname } = {}) {
  const batch = writeBatch(fs);
  batch.set(doc(fs, 'nicknames', 'n_' + nickname.toLowerCase()), { uid });
  if (claimCode) batch.set(doc(fs, 'userCodes', userCode), { uid });
  if (releaseNickname) batch.delete(doc(fs, 'nicknames', 'n_' + releaseNickname.toLowerCase()));
  batch.set(doc(fs, 'profiles', uid), { nickname, userCode, updatedAt: serverTimestamp() });
  return batch.commit();
}

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-hanzi',
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
  });
  await env.clearFirestore();
});

after(async () => {
  await env.cleanup();
});

test('학습 기록: 본인만 읽고 쓸 수 있음', async () => {
  await assertSucceeds(setDoc(doc(db('alice'), 'users/alice'), { words: {} }));
  await assertSucceeds(getDoc(doc(db('alice'), 'users/alice')));
  await assertFails(getDoc(doc(db('bob'), 'users/alice')));
  await assertFails(setDoc(doc(db('bob'), 'users/alice'), { words: {} }));
  await assertFails(getDoc(doc(db(null), 'users/alice')));
});

test('프로필 만들기: 닉네임·고유 번호 점유와 함께 저장', async () => {
  await assertSucceeds(profileBatch(db('alice'), 'alice', 'Alice', '12345678'));
  await assertSucceeds(profileBatch(db('bob'), 'bob', '밥돌이', '22222222'));
});

test('닉네임 중복: 대소문자만 다른 같은 닉네임은 쓸 수 없음', async () => {
  await assertFails(profileBatch(db('carol'), 'carol', 'ALICE', '33333333'));
});

test('고유 번호 중복: 남의 번호는 쓸 수 없음', async () => {
  await assertFails(profileBatch(db('carol'), 'carol', 'Carol', '12345678'));
});

test('닉네임 사재기 방지: 내 프로필이 아닌 닉네임만 따로 점유할 수 없음', async () => {
  await assertFails(setDoc(doc(db('carol'), 'nicknames/n_squat'), { uid: 'carol' }));
  await assertFails(setDoc(doc(db('carol'), 'userCodes/99999999'), { uid: 'carol' }));
});

test('남의 이름으로 점유하거나 프로필을 쓸 수 없음', async () => {
  const fs = db('carol');
  const batch = writeBatch(fs);
  batch.set(doc(fs, 'nicknames', 'n_fake'), { uid: 'bob' });
  batch.set(doc(fs, 'userCodes', '44444444'), { uid: 'carol' });
  batch.set(doc(fs, 'profiles', 'carol'), { nickname: 'fake', userCode: '44444444', updatedAt: serverTimestamp() });
  await assertFails(batch.commit());
  await assertFails(setDoc(doc(db('carol'), 'profiles/bob'), { nickname: 'x1', userCode: '55555555', updatedAt: serverTimestamp() }));
});

test('닉네임 형식 검사: 너무 짧거나 번호 형식이 틀리면 거부', async () => {
  await assertFails(profileBatch(db('carol'), 'carol', 'C', '66666666'));
  await assertFails(profileBatch(db('carol'), 'carol', 'Carol', '1234'));
});

test('고유 번호는 바꿀 수 없음', async () => {
  await assertFails(profileBatch(db('alice'), 'alice', 'Alice', '77777777'));
});

test('닉네임 바꾸기: 새 닉네임 점유 + 예전 닉네임 해제 → 다른 사람이 예전 닉네임 사용 가능', async () => {
  await assertSucceeds(profileBatch(db('alice'), 'alice', 'Alice2', '12345678', { claimCode: false, releaseNickname: 'Alice' }));
  await assertSucceeds(profileBatch(db('carol'), 'carol', 'alice', '33333333'));
  // 남의 닉네임 점유는 지울 수 없음
  await assertFails(deleteDoc(doc(db('bob'), 'nicknames/n_alice')));
});

test('프로필 읽기: 로그인한 사용자만', async () => {
  await assertSucceeds(getDoc(doc(db('bob'), 'profiles/alice')));
  await assertSucceeds(getDoc(doc(db('bob'), 'userCodes/12345678')));
  await assertSucceeds(getDoc(doc(db('bob'), 'nicknames/n_alice2')));
  await assertFails(getDoc(doc(db(null), 'profiles/alice')));
});

test('친구 요청: 내 이름으로만, 프로필이 있는 사람끼리만', async () => {
  const req = (fs, from, to) => setDoc(doc(fs, 'friendRequests', `${from}_${to}`), { from, to, createdAt: serverTimestamp() });
  await assertSucceeds(req(db('alice'), 'alice', 'bob'));
  await assertFails(req(db('carol'), 'bob', 'carol')); // 남의 이름으로
  await assertFails(req(db('alice'), 'alice', 'alice')); // 나에게
  await assertFails(req(db('dave'), 'dave', 'alice')); // 프로필 없음
  await assertFails(req(db('alice'), 'alice', 'nobody')); // 없는 사용자
  await assertFails(setDoc(doc(db('alice'), 'friendRequests/alice_carol'), { from: 'alice', to: 'bob', createdAt: serverTimestamp() })); // 문서 이름 불일치
});

test('친구 요청 읽기: 보낸 사람·받은 사람만', async () => {
  await assertSucceeds(getDoc(doc(db('alice'), 'friendRequests/alice_bob')));
  await assertSucceeds(getDoc(doc(db('bob'), 'friendRequests/alice_bob')));
  await assertFails(getDoc(doc(db('carol'), 'friendRequests/alice_bob')));
  await assertSucceeds(getDoc(doc(db('carol'), 'friendRequests/bob_carol'))); // 없는 문서 확인은 허용
  await assertSucceeds(getDocs(query(collection(db('bob'), 'friendRequests'), where('to', '==', 'bob'))));
  await assertSucceeds(getDocs(query(collection(db('alice'), 'friendRequests'), where('from', '==', 'alice'))));
  await assertFails(getDocs(query(collection(db('carol'), 'friendRequests'), where('to', '==', 'bob'))));
});

test('친구 수락: 요청을 받은 사람만 친구 관계를 만들 수 있음', async () => {
  const pair = (fs) => {
    const batch = writeBatch(fs);
    batch.set(doc(fs, 'friendships', 'alice_bob'), { members: ['alice', 'bob'], createdAt: serverTimestamp() });
    batch.delete(doc(fs, 'friendRequests', 'alice_bob'));
    return batch.commit();
  };
  await assertFails(setDoc(doc(db('alice'), 'friendships/alice_bob'), { members: ['alice', 'bob'], createdAt: serverTimestamp() })); // 보낸 사람이 직접
  await assertFails(setDoc(doc(db('carol'), 'friendships/bob_carol'), { members: ['bob', 'carol'], createdAt: serverTimestamp() })); // 요청 없음
  await assertFails(setDoc(doc(db('bob'), 'friendships/bob_alice'), { members: ['bob', 'alice'], createdAt: serverTimestamp() })); // 순서 틀림
  await assertSucceeds(pair(db('bob')));
  // 요청 문서는 수락과 함께 지워짐
  await assertSucceeds(getDoc(doc(db('bob'), 'friendRequests/alice_bob')));
});

test('친구 관계 읽기·삭제: 두 사람만', async () => {
  await assertSucceeds(getDoc(doc(db('alice'), 'friendships/alice_bob')));
  await assertFails(getDoc(doc(db('carol'), 'friendships/alice_bob')));
  await assertSucceeds(getDocs(query(collection(db('alice'), 'friendships'), where('members', 'array-contains', 'alice'))));
  await assertFails(getDocs(query(collection(db('carol'), 'friendships'), where('members', 'array-contains', 'alice'))));
  await assertFails(deleteDoc(doc(db('carol'), 'friendships/alice_bob')));
  await assertSucceeds(deleteDoc(doc(db('alice'), 'friendships/alice_bob')));
});

test('요청 취소·거절: 보낸 사람·받은 사람만 삭제', async () => {
  await assertSucceeds(setDoc(doc(db('carol'), 'friendRequests/carol_bob'), { from: 'carol', to: 'bob', createdAt: serverTimestamp() }));
  await assertFails(deleteDoc(doc(db('alice'), 'friendRequests/carol_bob')));
  await assertSucceeds(deleteDoc(doc(db('bob'), 'friendRequests/carol_bob')));
});

test('계정 삭제: 내 프로필·점유 표시를 지울 수 있음', async () => {
  const fs = db('carol');
  const batch = writeBatch(fs);
  batch.delete(doc(fs, 'nicknames', 'n_alice'));
  batch.delete(doc(fs, 'userCodes', '33333333'));
  batch.delete(doc(fs, 'profiles', 'carol'));
  await assertSucceeds(batch.commit());
});
