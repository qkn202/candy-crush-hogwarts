// Bộ tổng hợp Âm Thanh Phép Thuật Hogwarts: Nhạc Nền Celesta Đêm Huyền Bí + Hiệu Ứng SFX + Giọng Khen Candy Crush

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.bgmTimer = null;
    this.bgmStep = 0;
    this.lastVoiceAt = 0;

    try {
      this.muted = localStorage.getItem('hpvn_muted') === '1';
      this.bgmMuted = localStorage.getItem('hpvn_bgm_muted') === '1';
    } catch {
      this.muted = false;
      this.bgmMuted = false;
    }

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) this.stopBgmLoop();
        else if (!this.bgmMuted) this.startBgmLoop();
      });
    }
  }

  ensureCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (!this.bgmMuted && !this.bgmTimer) {
      this.startBgmLoop();
    }
    return this.ctx;
  }

  toggleMute() {
    this.muted = !this.muted;
    try {
      localStorage.setItem('hpvn_muted', this.muted ? '1' : '0');
    } catch {
      // ignore storage restrictions
    }
    if (!this.muted) this.playSelect();
    return this.muted;
  }

  toggleBgm() {
    this.bgmMuted = !this.bgmMuted;
    try {
      localStorage.setItem('hpvn_bgm_muted', this.bgmMuted ? '1' : '0');
    } catch {
      // ignore storage restrictions
    }
    if (this.bgmMuted) {
      this.stopBgmLoop();
    } else {
      this.ensureCtx();
      this.startBgmLoop();
    }
    return this.bgmMuted;
  }

  // Nhạc nền Celesta & Đàn Hạc đêm Hogwarts (vòng hoà âm E thứ huyền ảo lấy cảm hứng từ Hedwig's Waltz)
  startBgmLoop() {
    if (this.bgmMuted || this.bgmTimer || typeof window === 'undefined') return;
    if (typeof document !== 'undefined' && document.hidden) return;

    // Giai điệu Celesta nhịp 3/8 ma mị nhẹ nhàng (tần số Hz, 0 = ngân nghỉ)
    const melody = [
      246.94, 329.63, 392.00, 369.99, 329.63, 0,
      493.88, 440.00, 0, 369.99, 0, 0,
      329.63, 392.00, 369.99, 311.13, 349.23, 246.94,
      0, 329.63, 293.66, 261.63, 246.94, 0
    ];
    const bass = [
      164.81, 0, 0, 164.81, 0, 0,
      196.00, 0, 0, 185.00, 0, 0,
      164.81, 0, 0, 155.56, 0, 0,
      123.47, 0, 0, 164.81, 0, 0
    ];

    this.bgmTimer = setInterval(() => {
      if (this.bgmMuted || (typeof document !== 'undefined' && document.hidden)) return;
      const ctx = this.ctx;
      if (!ctx || ctx.state !== 'running') return;

      const idx = this.bgmStep % melody.length;
      this.bgmStep++;
      const mFreq = melody[idx];
      const bFreq = bass[idx];

      if (mFreq > 0) {
        this.playRawNote(ctx, mFreq, 'sine', 0.42, 0.026, 0);
        this.playRawNote(ctx, mFreq * 2, 'triangle', 0.22, 0.011, 0.01);
      }
      if (bFreq > 0) {
        this.playRawNote(ctx, bFreq, 'triangle', 0.72, 0.022, 0);
      }
    }, 340);
  }

  stopBgmLoop() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  playRawNote(ctx, freq, type, duration, vol, delay = 0, slideTo = null) {
    if (!Number.isFinite(freq) || freq <= 0 || !Number.isFinite(duration) || duration <= 0) return;
    const safeVol = Math.max(0.0002, Math.min(1, Number(vol) || 0.08));
    const t0 = ctx.currentTime + Math.max(0, delay);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo && Number.isFinite(slideTo)) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), t0 + duration);
    }
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(safeVol, t0 + Math.min(0.018, duration * 0.4));
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }

  playTone(freq, type = 'sine', duration = 0.16, vol = 0.12, delay = 0, slideTo = null) {
    if (this.muted) return;
    const ctx = this.ensureCtx();
    if (!ctx) return;
    this.playRawNote(ctx, freq, type, duration, vol, delay, slideTo);
  }

  // Giọng đọc trầm ấm chuẩn Candy Crush ("Sweet!", "Delicious!", "Divine!", "Bertie Crush!")
  playVoiceCallout(phrase) {
    if (this.muted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const now = Date.now();
    if (now - this.lastVoiceAt < 1300) return;
    this.lastVoiceAt = now;

    try {
      const synth = window.speechSynthesis;
      if (synth.speaking) synth.cancel();
      const utter = new SpeechSynthesisUtterance(phrase);
      utter.lang = 'en-GB';
      utter.pitch = 0.78;
      utter.rate = 0.92;
      utter.volume = 0.55;
      const voices = synth.getVoices?.() || [];
      const enVoice = voices.find((v) => v.lang?.startsWith('en-GB')) || voices.find((v) => v.lang?.startsWith('en'));
      if (enVoice) utter.voice = enVoice;
      synth.speak(utter);
    } catch {
      // ignore speech synthesis restrictions
    }
  }

  playSelect() {
    this.playTone(660, 'triangle', 0.08, 0.09, 0, 880);
  }

  playSwap() {
    this.playTone(440, 'sine', 0.1, 0.09, 0, 587);
  }

  playInvalid() {
    this.playTone(230, 'sawtooth', 0.12, 0.07, 0, 175);
    this.playTone(175, 'sawtooth', 0.14, 0.07, 0.09, 140);
  }

  playMatch(comboStep = 1) {
    const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 987.77, 1046.5, 1174.66, 1318.51];
    const base = scale[Math.min(scale.length - 1, Math.max(0, comboStep - 1))];
    this.playTone(base, 'triangle', 0.24, 0.13, 0);
    this.playTone(base * 1.5, 'sine', 0.28, 0.07, 0.035);
    if (comboStep >= 3) {
      this.playTone(base * 2, 'sine', 0.32, 0.06, 0.07);
    }
  }

  playBeam() {
    this.playTone(320, 'sawtooth', 0.28, 0.1, 0, 1280);
    this.playTone(640, 'triangle', 0.32, 0.11, 0.02, 1760);
  }

  playBomb() {
    this.playTone(160, 'sawtooth', 0.35, 0.15, 0, 48);
    this.playTone(240, 'triangle', 0.26, 0.12, 0.03, 75);
    this.playTone(920, 'sine', 0.22, 0.08, 0.04, 420);
  }

  playColorBomb() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
    notes.forEach((n, i) => {
      this.playTone(n, 'triangle', 0.32, 0.1, i * 0.045);
    });
  }

  playSeeker() {
    const notes = [783.99, 987.77, 1174.66, 1567.98];
    notes.forEach((n, i) => this.playTone(n, 'sine', 0.16, 0.09, i * 0.04, n * 1.12));
  }

  playPortal() {
    this.playTone(310, 'sine', 0.22, 0.08, 0, 740);
  }

  playIceBreak() {
    this.playTone(1350, 'sine', 0.09, 0.08, 0, 920);
    this.playTone(1720, 'triangle', 0.11, 0.07, 0.03, 1180);
  }

  playChocolateSpread() {
    this.playTone(145, 'triangle', 0.22, 0.09, 0, 95);
  }

  playConveyor() {
    this.playTone(260, 'triangle', 0.11, 0.065, 0, 340);
    this.playTone(390, 'sine', 0.09, 0.05, 0.03, 520);
  }

  playKeyUnlock() {
    const notes = [880, 1174.66, 1567.98, 2093.0];
    notes.forEach((n, i) => this.playTone(n, 'triangle', 0.2, 0.1, i * 0.045));
  }

  playBossHex() {
    this.playTone(196, 'sawtooth', 0.28, 0.11, 0, 110);
    this.playTone(146.83, 'triangle', 0.34, 0.1, 0.06, 82.41);
  }

  playPatronus() {
    const chord = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
    chord.forEach((freq, i) => {
      this.playTone(freq, 'triangle', 0.42, 0.12, i * 0.05);
      this.playTone(freq * 1.5, 'sine', 0.36, 0.06, i * 0.05 + 0.02);
    });
    this.playVoiceCallout('Expecto Patronum!');
  }

  playWheelTick() {
    this.playTone(880, 'triangle', 0.045, 0.06, 0, 620);
  }

  playVictory() {
    const melody = [
      [493.88, 0],
      [659.25, 0.12],
      [783.99, 0.24],
      [739.99, 0.36],
      [659.25, 0.50],
      [987.77, 0.68],
      [880.0, 0.88]
    ];
    for (const [freq, delay] of melody) {
      this.playTone(freq, 'triangle', 0.28, 0.13, delay);
      this.playTone(freq * 0.5, 'sine', 0.3, 0.07, delay);
    }
    this.playVoiceCallout('Divine! Bertie Crush!');
  }

  playDefeat() {
    const notes = [392.0, 369.99, 349.23, 311.13];
    notes.forEach((f, i) => this.playTone(f, 'triangle', 0.26, 0.1, i * 0.15));
  }

  playSortingHat() {
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((f, i) => this.playTone(f, 'triangle', 0.35, 0.12, i * 0.08));
  }
}

export const sound = new SoundEngine();
