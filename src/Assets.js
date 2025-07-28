export class Assets {
  constructor() {
    this.images = {};
    this.sounds = {};
    this._imageList = {
      bird: 'src/assets/bird.svg',
      pipe: 'src/assets/pipe.svg',
      // ground, background можно добавить позже
    };
    // Звуки будут генерироваться через Web Audio API
    this._soundList = ['jump', 'hit', 'score'];
    this._audioCtx = null;
  }

  async loadAll() {
    await Promise.all([
      this._loadImages(),
      this._generateSounds()
    ]);
  }

  getImage(key) {
    return this.images[key];
  }

  getSound(key) {
    return this.sounds[key];
  }

  async _loadImages() {
    const entries = Object.entries(this._imageList);
    await Promise.all(entries.map(([key, src]) => {
      return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => { this.images[key] = img; resolve(); };
        img.onerror = reject;
        img.src = src;
      });
    }));
  }

  async _generateSounds() {
    this._audioCtx = this._audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    // Генерируем три простых звука
    this.sounds.jump = this._createJumpSound();
    this.sounds.hit = this._createHitSound();
    this.sounds.score = this._createScoreSound();
  }

  // --- Генераторы звуков ---
  _createJumpSound() {
    return () => {
      const ctx = this._audioCtx;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'square';
      o.frequency.value = 600;
      g.gain.value = 0.15;
      o.connect(g).connect(ctx.destination);
      o.start();
      o.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.15);
      o.stop(ctx.currentTime + 0.18);
    };
  }

  _createHitSound() {
    return () => {
      const ctx = this._audioCtx;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.value = 120;
      g.gain.value = 0.22;
      o.connect(g).connect(ctx.destination);
      o.start();
      o.frequency.linearRampToValueAtTime(40, ctx.currentTime + 0.18);
      g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.18);
      o.stop(ctx.currentTime + 0.2);
    };
  }

  _createScoreSound() {
    return () => {
      const ctx = this._audioCtx;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.value = 400;
      g.gain.value = 0.13;
      o.connect(g).connect(ctx.destination);
      o.start();
      o.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.09);
      g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.12);
      o.stop(ctx.currentTime + 0.13);
    };
  }
} 