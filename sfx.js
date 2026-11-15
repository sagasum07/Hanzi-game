// ========================================
// 게임 모드 효과음 — 소리 파일 없이 Web Audio 로 직접 합성합니다.
// ========================================
// app.js 다음에 불러오는 일반 스크립트입니다. (userSettings.sfxOn, currentVolume, audioCtx, setupAudioGraph 를 씀)
// 동양풍 느낌: 북(둥) · 징(웅~) · 오음계(궁상각치우) 종소리
//
// 안전한 방식: 효과음은 '녹음용' 장치(OfflineAudioContext)에서 미리 만들어 두고(한 번만),
// 실제 소리 장치에서는 그 녹음을 틀기만 함. 그래서 필터 등이 고장 나도 실제 소리 장치(배경음악 포함)가
// 망가지지 않고, 아이폰에서도 장치 하나로 배경음악과 효과음을 함께 냄.
//
// 사용: Sfx.punch(), Sfx.critical() … 소리를 낼 수 없는 환경이면 조용히 넘어갑니다.

const Sfx = (() => {
  let ctx = null; // 실제로 소리를 내는 장치 (아이폰은 배경음악 장치와 같음)
  let out = null; // 효과음 음량
  let master = null; // 녹음할 때 쓰는 출구
  let noiseBuffer = null;
  const cache = new Map(); // 효과 이름 → 만들어 둔 소리 (또는 만드는 중인 Promise)
  const RENDER_SECONDS = 3.6;
  const OfflineCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;

  function liveCtx() {
    if (!userSettings.sfxOn || currentVolume <= 0) return null;
    try {
      if (!ctx || ctx.state === 'closed') {
        const shared = typeof audioCtx !== 'undefined' && audioCtx && audioCtx.state !== 'closed' ? audioCtx : null;
        if (shared) {
          ctx = shared;
        } else {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (!AudioCtx) return null;
          ctx = new AudioCtx();
        }
        out = ctx.createGain();
        out.connect(ctx.destination);
      }
      out.gain.value = Math.min(1, 0.25 + currentVolume * 0.85);
      if (ctx.state !== 'running') ctx.resume().catch(() => {});
      return ctx;
    } catch (error) {
      return null;
    }
  }

  // 화면을 누를 때(사용자 동작 중)마다 불러서 소리 장치를 깨움.
  // 아이폰은 이때 아주 짧은 무음을 한 번 재생해야 이후 효과음이 확실히 남
  let unlocked = false;
  function unlock() {
    const c = liveCtx();
    if (!c || (unlocked && c.state === 'running')) return;
    try {
      const src = c.createBufferSource();
      src.buffer = c.createBuffer(1, 1, 22050);
      src.connect(c.destination);
      src.start(0);
      unlocked = true;
      setTimeout(warm, 300);
    } catch (error) {
      // 무시
    }
  }

  // 예전 이름 호환: 장치를 깨우기만 함
  function reset() {
    if (ctx && ctx.state !== 'running' && ctx.state !== 'closed') ctx.resume().catch(() => {});
  }

  const safe = (v, min, max) => Math.min(max, Math.max(min, Number.isFinite(v) ? v : min));

  function noise(c) {
    if (!noiseBuffer) {
      noiseBuffer = c.createBuffer(1, c.sampleRate * 1, c.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    const src = c.createBufferSource();
    src.buffer = noiseBuffer;
    return src;
  }

  // 음 하나: 주파수, 시작(초, 지금부터), 길이, 옵션
  function tone(c, freq, at, dur, { type = 'sine', gain = 0.3, attack = 0.005, slideTo, detune = 0 } = {}) {
    const t = c.currentTime + at;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(safe(freq, 20, 12000), t);
    osc.detune.value = detune;
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(safe(slideTo, 20, 12000), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(master);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  // 잡음: 필터로 깎아서 바람·타격·할퀴기 소리
  function hiss(c, at, dur, { gain = 0.4, type = 'lowpass', freq = 1200, slideTo, q = 0.8 } = {}) {
    const t = c.currentTime + at;
    const src = noise(c);
    const filter = c.createBiquadFilter();
    filter.type = type;
    // 필터 값은 안전한 범위로 (지나친 값은 필터가 불안정해져 소리 전체가 끊길 수 있음)
    const nyquist = c.sampleRate / 2 - 100;
    filter.Q.value = safe(q, 0.1, 10);
    filter.frequency.setValueAtTime(safe(freq, 40, nyquist), t);
    if (slideTo) filter.frequency.exponentialRampToValueAtTime(safe(slideTo, 40, nyquist), t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter).connect(g).connect(master);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.05);
  }

  // 북: 낮은 '둥'
  function drum(c, at = 0, gain = 0.9, pitch = 110) {
    tone(c, pitch, at, 0.35, { gain, slideTo: pitch * 0.45 });
    hiss(c, at, 0.06, { gain: gain * 0.35, freq: 900 });
  }

  // 징: 여러 배음이 길게 울리는 '웅~'
  function gong(c, at = 0, gain = 0.35, base = 130) {
    [1, 1.48, 2.02, 2.74, 3.6].forEach((ratio, i) => {
      tone(c, base * ratio, at, 2.2 - i * 0.3, { gain: gain / (i + 1.2), attack: 0.01, detune: i % 2 ? 6 : -6 });
    });
    hiss(c, at, 0.25, { gain: gain * 0.25, type: 'bandpass', freq: 2500, q: 2 });
  }

  // 오음계 (C D E G A)
  const PENTA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98, 1760];

  // 효과 하나를 녹음해서, 고장 난 값(NaN)을 지우고 너무 큰 소리를 눌러 둔 버퍼로 만듦
  function render(fn) {
    if (!OfflineCtx) return Promise.resolve(null);
    const rate = 44100;
    const off = new OfflineCtx(1, Math.ceil(rate * RENDER_SECONDS), rate);
    noiseBuffer = null;
    const limiter = off.createDynamicsCompressor();
    limiter.threshold.value = -6;
    limiter.knee.value = 6;
    limiter.ratio.value = 12;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.15;
    limiter.connect(off.destination);
    master = off.createGain();
    master.connect(limiter);
    fn(off);
    master = null;
    const done = new Promise((resolve) => {
      off.oncomplete = (e) => resolve(e.renderedBuffer);
      const p = off.startRendering();
      if (p && p.then) p.then(resolve, () => resolve(null));
    });
    return done.then((buf) => {
      if (!buf) return null;
      const data = buf.getChannelData(0);
      let peak = 0;
      let last = 0;
      for (let i = 0; i < data.length; i++) {
        const v = data[i];
        if (!Number.isFinite(v)) { data[i] = 0; continue; }
        const a = Math.abs(v);
        if (a > peak) peak = a;
        if (a > 0.0005) last = i;
      }
      if (peak > 0.95) {
        const k = 0.95 / peak;
        for (let i = 0; i < data.length; i++) data[i] *= k;
      }
      // 뒤쪽 무음은 잘라 냄
      const len = Math.min(data.length, last + Math.ceil(rate * 0.05));
      if (len < 2) return null;
      const trimmed = (ctx || off).createBuffer(1, len, rate);
      trimmed.getChannelData(0).set(data.subarray(0, len));
      return trimmed;
    }).catch(() => null);
  }

  function getSound(key, fn) {
    if (!cache.has(key)) {
      let promise;
      try {
        promise = render(fn);
      } catch (error) {
        promise = Promise.resolve(null);
      }
      cache.set(key, promise);
      promise.then((buf) => cache.set(key, buf));
    }
    return cache.get(key);
  }

  function start(buf) {
    const c = liveCtx();
    if (!c || !buf) return;
    try {
      const src = c.createBufferSource();
      src.buffer = buf;
      src.connect(out);
      src.start(0);
    } catch (error) {
      // 효과음 실패는 게임 진행에 영향 없음
    }
  }

  let playing = true; // false 이면 녹음만 해 두고 재생하지 않음 (미리 만들기)

  function play(key, fn) {
    if (!liveCtx()) return;
    const sound = getSound(key, fn);
    if (!playing) return;
    if (sound && typeof sound.then === 'function') sound.then(start);
    else start(sound);
  }

  // 자주 쓰는 효과를 미리 만들어 둠 (첫 재생이 늦지 않게)
  let warmed = false;
  function warm() {
    if (warmed || !liveCtx()) return;
    warmed = true;
    ['tap', 'untap', 'begin', 'claw', 'ko', 'victory', 'defeat', 'fall', 'crack', 'critical']
      .forEach((name) => {
        playing = false;
        try { api[name](); } catch (error) { /* 무시 */ } finally { playing = true; }
      });
  }

  const api = {
    reset,
    unlock,
    warm,
    // 전투 시작: 북 두 번
    battleStart: (boss) => play(`battleStart:${boss}`, (c) => {
      drum(c, 0, 0.8, boss ? 80 : 100);
      drum(c, 0.22, 0.9, boss ? 70 : 90);
      if (boss) gong(c, 0.45, 0.3, 98);
    }),
    // 开始！: 큰 북과 징
    begin: () => play(`begin`, (c) => {
      drum(c, 0, 1, 75);
      hiss(c, 0, 0.12, { gain: 0.5, freq: 1600 });
      gong(c, 0.02, 0.38, 147);
    }),
    // 글자 조각 놓기·빼기
    tap: () => play(`tap`, (c) => tone(c, 1320, 0, 0.06, { type: 'triangle', gain: 0.18 })),
    untap: () => play(`untap`, (c) => tone(c, 880, 0, 0.06, { type: 'triangle', gain: 0.14, slideTo: 660 })),
    // 달려가는 바람 소리
    whoosh: (strong) => play(`whoosh:${strong}`, (c) => hiss(c, 0, strong ? 0.28 : 0.22, { gain: strong ? 0.35 : 0.25, type: 'bandpass', freq: 500, slideTo: 3200, q: 1.2 })),
    // 주먹 타격 (빠른 공격은 더 묵직하게)
    punch: (fast) => play(`punch:${fast}`, (c) => {
      hiss(c, 0, 0.09, { gain: fast ? 0.75 : 0.6, freq: fast ? 1800 : 1300 });
      tone(c, fast ? 190 : 160, 0, 0.18, { gain: fast ? 0.9 : 0.75, slideTo: 55 });
      if (fast) tone(c, PENTA[4], 0.02, 0.18, { type: 'triangle', gain: 0.12 });
    }),
    // 크리티컬 마지막 한 방: 큰 북 + 징
    critical: () => play(`critical`, (c) => {
      drum(c, 0, 1, 70);
      hiss(c, 0, 0.18, { gain: 0.8, freq: 2400 });
      gong(c, 0.05, 0.4, 110);
    }),
    // 몬스터 공격: 할퀴기 세 번 + 맞는 소리
    claw: () => play(`claw`, (c) => {
      [0, 0.05, 0.1].forEach((at) => hiss(c, at, 0.14, { gain: 0.45, type: 'highpass', freq: 4200, slideTo: 900 }));
      tone(c, 140, 0.05, 0.25, { type: 'square', gain: 0.18, slideTo: 70 });
      tone(c, 233, 0.12, 0.3, { type: 'sawtooth', gain: 0.07, slideTo: 196 });
    }),
    // 갑옷으로 막기: 쇠가 부딪히는 '쨍'
    guard: () => play('guard', (c) => {
      hiss(c, 0, 0.08, { gain: 0.5, type: 'highpass', freq: 3000 });
      [1, 2.76, 5.4].forEach((r, i) => tone(c, 620 * r, 0, 0.5 - i * 0.12, { type: 'triangle', gain: 0.16 / (i + 1) }));
      tone(c, 180, 0, 0.15, { gain: 0.4, slideTo: 90 });
    }),
    // 몬스터 쓰러짐
    ko: () => play(`ko`, (c) => {
      drum(c, 0, 1, 65);
      hiss(c, 0, 0.6, { gain: 0.5, freq: 900, slideTo: 120 });
      gong(c, 0.1, 0.45, 98);
    }),
    // 승리: 오음계 상행
    victory: () => play(`victory`, (c) => {
      [0, 2, 4, 5, 7].forEach((n, i) => tone(c, PENTA[n], i * 0.11, 0.5, { type: 'triangle', gain: 0.22 }));
      tone(c, PENTA[9], 0.6, 0.9, { type: 'sine', gain: 0.18 });
    }),
    // 쓰러짐: 털썩
    fall: () => play(`fall`, (c) => {
      drum(c, 0, 0.9, 85);
      hiss(c, 0.02, 0.35, { gain: 0.35, freq: 700, slideTo: 150 });
      tone(c, 220, 0, 0.5, { type: 'sawtooth', gain: 0.06, slideTo: 110 });
    }),
    // 패배: 낮게 가라앉는 오음계 + 무거운 징
    defeat: () => play(`defeat`, (c) => {
      drum(c, 0, 1, 60);
      [4, 2, 1, 0].forEach((n, i) => tone(c, PENTA[n] / 2, 0.1 + i * 0.22, 0.6, { type: 'triangle', gain: 0.2 }));
      tone(c, PENTA[0] / 4, 0.95, 1.6, { type: 'sine', gain: 0.3 });
      gong(c, 0.9, 0.35, 73);
    }),
    // 글자가 쩍 갈라짐
    crack: () => play(`crack`, (c) => {
      hiss(c, 0, 0.16, { gain: 0.7, type: 'highpass', freq: 2500, slideTo: 600 });
      hiss(c, 0.04, 0.1, { gain: 0.5, type: 'bandpass', freq: 1200, q: 4 });
      tone(c, 90, 0, 0.4, { gain: 0.7, slideTo: 45 });
    }),
    // 상자: 덜컹덜컹 → 열림 → 보상 하나씩 → 레벨 업
    chestShake: () => play(`chestShake`, (c) => {
      [0, 0.14, 0.27, 0.39, 0.5, 0.6, 0.69, 0.77, 0.84].forEach((at, i) => {
        hiss(c, at, 0.05, { gain: 0.25 + i * 0.03, type: 'bandpass', freq: 700 + i * 60, q: 3 });
        tone(c, 180 + i * 8, at, 0.05, { type: 'square', gain: 0.05 });
      });
    }),
    chestOpen: (tier = 0) => play(`chestOpen:${tier}`, (c) => {
      hiss(c, 0, 0.5, { gain: 0.4, type: 'bandpass', freq: 400, slideTo: 5000, q: 0.9 });
      tone(c, 98, 0, 0.4, { gain: 0.6, slideTo: 60 });
      const notes = [5, 7, 8, 9].slice(0, 2 + Math.min(2, tier));
      notes.forEach((n, i) => tone(c, PENTA[n], 0.08 + i * 0.07, 0.8, { gain: 0.16 }));
      if (tier >= 3) gong(c, 0.05, 0.25, 196);
    }),
    loot: (rarity = -1) => play(`loot:${rarity}`, (c) => {
      tone(c, 660, 0, 0.12, { type: 'sine', gain: 0.18, slideTo: 1320 });
      if (rarity >= 2) [6, 8, 9].forEach((n, i) => tone(c, PENTA[n], 0.08 + i * 0.06, 0.5, { gain: 0.12 + rarity * 0.02 }));
    }),
    levelUp: () => play(`levelUp`, (c) => {
      [0, 2, 4, 5].forEach((n, i) => tone(c, PENTA[n], i * 0.09, 0.35, { type: 'triangle', gain: 0.22 }));
      [5, 7, 9].forEach((n) => tone(c, PENTA[n], 0.4, 0.9, { type: 'triangle', gain: 0.14 }));
    }),
  };

  return api;
})();
// 휴대폰은 사용자 동작(터치) 중에만 소리 장치를 깨울 수 있어서, 화면을 누를 때마다
// 효과음 장치를 깨우고 멈춘 배경음악도 다시 켬
['pointerdown', 'touchend', 'click'].forEach((type) => {
  document.addEventListener(type, () => {
    setupAudioGraph(); // 아이폰: 배경음악 장치를 먼저 만들어 효과음도 같은 장치를 쓰게 함
    Sfx.unlock();
    ensureBgm();
  }, { capture: true, passive: true });
});
