// ========================================
// 게임 모드 효과음 — 소리 파일 없이 Web Audio 로 직접 합성합니다.
// ========================================
// app.js 다음에 불러오는 일반 스크립트입니다. (userSettings.sfxOn, currentVolume 을 씀, 배경음악과는 다른 AudioContext 사용)
// 동양풍 느낌: 북(둥) · 징(웅~) · 오음계(궁상각치우) 종소리
//
// 사용: Sfx.punch(), Sfx.critical() … 소리를 낼 수 없는 환경이면 조용히 넘어갑니다.

const Sfx = (() => {
  let ctx = null;
  let master = null;
  let noiseBuffer = null;

  // 효과음 전용 AudioContext (배경음악과 따로 써서 효과음 문제가 배경음악에 번지지 않음)
  function getCtx() {
    if (!userSettings.sfxOn || currentVolume <= 0) return null;
    try {
      if (!ctx || ctx.state === 'closed') {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return null;
        ctx = new AudioCtx();
        // 리미터: 소리가 겹쳐도 찢어지지 않게
        const limiter = ctx.createDynamicsCompressor();
        limiter.threshold.value = -6;
        limiter.knee.value = 6;
        limiter.ratio.value = 12;
        limiter.attack.value = 0.003;
        limiter.release.value = 0.15;
        limiter.connect(ctx.destination);
        master = ctx.createGain();
        master.connect(limiter);
        noiseBuffer = null;
      }
      master.gain.value = Math.min(1, 0.25 + currentVolume * 0.85);
      if (ctx.state !== 'running') ctx.resume().catch(() => {});
      return ctx;
    } catch (error) {
      return null;
    }
  }

  // 전투마다 효과음 장치를 새로 만들어, 혹시 멈추거나 고장 난 상태가 이어지지 않게 함
  function reset() {
    if (ctx) ctx.close().catch(() => {});
    ctx = null;
    master = null;
    noiseBuffer = null;
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

  function play(fn) {
    const c = getCtx();
    if (!c) return;
    try {
      fn(c);
    } catch (error) {
      // 효과음 실패는 게임 진행에 영향 없음
    }
  }

  return {
    reset,
    // 전투 시작: 효과음 장치를 새로 만들고 북 두 번
    battleStart: (boss) => { reset(); play((c) => {
      drum(c, 0, 0.8, boss ? 80 : 100);
      drum(c, 0.22, 0.9, boss ? 70 : 90);
      if (boss) gong(c, 0.45, 0.3, 98);
    }); },
    // 开始！: 큰 북과 징
    begin: () => play((c) => {
      drum(c, 0, 1, 75);
      hiss(c, 0, 0.12, { gain: 0.5, freq: 1600 });
      gong(c, 0.02, 0.38, 147);
    }),
    // 글자 조각 놓기·빼기
    tap: () => play((c) => tone(c, 1320, 0, 0.06, { type: 'triangle', gain: 0.18 })),
    untap: () => play((c) => tone(c, 880, 0, 0.06, { type: 'triangle', gain: 0.14, slideTo: 660 })),
    // 달려가는 바람 소리
    whoosh: (strong) => play((c) => hiss(c, 0, strong ? 0.28 : 0.22, { gain: strong ? 0.35 : 0.25, type: 'bandpass', freq: 500, slideTo: 3200, q: 1.2 })),
    // 주먹 타격 (빠른 공격은 더 묵직하게)
    punch: (fast) => play((c) => {
      hiss(c, 0, 0.09, { gain: fast ? 0.75 : 0.6, freq: fast ? 1800 : 1300 });
      tone(c, fast ? 190 : 160, 0, 0.18, { gain: fast ? 0.9 : 0.75, slideTo: 55 });
      if (fast) tone(c, PENTA[4], 0.02, 0.18, { type: 'triangle', gain: 0.12 });
    }),
    // 크리티컬 마지막 한 방: 큰 북 + 징
    critical: () => play((c) => {
      drum(c, 0, 1, 70);
      hiss(c, 0, 0.18, { gain: 0.8, freq: 2400 });
      gong(c, 0.05, 0.4, 110);
    }),
    // 몬스터 공격: 할퀴기 세 번 + 맞는 소리
    claw: () => play((c) => {
      [0, 0.05, 0.1].forEach((at) => hiss(c, at, 0.14, { gain: 0.45, type: 'highpass', freq: 4200, slideTo: 900 }));
      tone(c, 140, 0.05, 0.25, { type: 'square', gain: 0.18, slideTo: 70 });
      tone(c, 233, 0.12, 0.3, { type: 'sawtooth', gain: 0.07, slideTo: 196 });
    }),
    // 몬스터 쓰러짐
    ko: () => play((c) => {
      drum(c, 0, 1, 65);
      hiss(c, 0, 0.6, { gain: 0.5, freq: 900, slideTo: 120 });
      gong(c, 0.1, 0.45, 98);
    }),
    // 승리: 오음계 상행
    victory: () => play((c) => {
      [0, 2, 4, 5, 7].forEach((n, i) => tone(c, PENTA[n], i * 0.11, 0.5, { type: 'triangle', gain: 0.22 }));
      tone(c, PENTA[9], 0.6, 0.9, { type: 'sine', gain: 0.18 });
    }),
    // 패배: 낮게 내려가는 소리
    defeat: () => play((c) => {
      [4, 2, 1, 0].forEach((n, i) => tone(c, PENTA[n] / 2, i * 0.18, 0.5, { type: 'triangle', gain: 0.2 }));
      gong(c, 0.75, 0.25, 82);
    }),
    // 상자: 덜컹덜컹 → 열림 → 보상 하나씩 → 레벨 업
    chestShake: () => play((c) => {
      [0, 0.14, 0.27, 0.39, 0.5, 0.6, 0.69, 0.77, 0.84].forEach((at, i) => {
        hiss(c, at, 0.05, { gain: 0.25 + i * 0.03, type: 'bandpass', freq: 700 + i * 60, q: 3 });
        tone(c, 180 + i * 8, at, 0.05, { type: 'square', gain: 0.05 });
      });
    }),
    chestOpen: (tier = 0) => play((c) => {
      hiss(c, 0, 0.5, { gain: 0.4, type: 'bandpass', freq: 400, slideTo: 5000, q: 0.9 });
      tone(c, 98, 0, 0.4, { gain: 0.6, slideTo: 60 });
      const notes = [5, 7, 8, 9].slice(0, 2 + Math.min(2, tier));
      notes.forEach((n, i) => tone(c, PENTA[n], 0.08 + i * 0.07, 0.8, { gain: 0.16 }));
      if (tier >= 3) gong(c, 0.05, 0.25, 196);
    }),
    loot: (rarity = -1) => play((c) => {
      tone(c, 660, 0, 0.12, { type: 'sine', gain: 0.18, slideTo: 1320 });
      if (rarity >= 2) [6, 8, 9].forEach((n, i) => tone(c, PENTA[n], 0.08 + i * 0.06, 0.5, { gain: 0.12 + rarity * 0.02 }));
    }),
    levelUp: () => play((c) => {
      [0, 2, 4, 5].forEach((n, i) => tone(c, PENTA[n], i * 0.09, 0.35, { type: 'triangle', gain: 0.22 }));
      [5, 7, 9].forEach((n) => tone(c, PENTA[n], 0.4, 0.9, { type: 'triangle', gain: 0.14 }));
    }),
  };
})();
