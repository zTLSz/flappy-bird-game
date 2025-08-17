export class Assets {
  constructor() {
    this.images = {};
    this.sounds = {};
    this._imageList = {
      bird: 'src/assets/bird.svg',
      'bird-red': 'src/assets/bird-red.svg',
      'bird-green': 'src/assets/bird-green.svg',
      pipe: 'src/assets/pipe.svg',
      // ground, background можно добавить позже
    };
    // Звуки будут генерироваться через Web Audio API
    this._soundList = ['jump', 'hit', 'score'];
    this._audioCtx = null;
    this.backgroundMusic = null;
    this.isMusicPlaying = false;
    this.currentBirdSkin = 'bird'; // Текущий скин птички
    this.availableBirdSkins = ['bird', 'bird-red', 'bird-green']; // Доступные скины
  }

  async loadAll() {
    await Promise.all([
      this._loadImages(),
      this._generateSounds(),
      this._loadBackgroundMusic()
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

  // --- Фоновая музыка ---
  async _loadBackgroundMusic() {
    try {
      const response = await fetch('src/assets/title.wav');
      const arrayBuffer = await response.arrayBuffer();
      this._audioCtx = this._audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await this._audioCtx.decodeAudioData(arrayBuffer);
      this.backgroundMusic = audioBuffer;
    } catch (error) {
      console.warn('Could not load background music:', error);
    }
  }

  playBackgroundMusic() {
    if (!this.backgroundMusic || this.isMusicPlaying) return;
    
    this._audioCtx = this._audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    
    const playMusic = () => {
      const source = this._audioCtx.createBufferSource();
      const gainNode = this._audioCtx.createGain();
      
      source.buffer = this.backgroundMusic;
      source.loop = true;
      gainNode.gain.value = 0.3; // Громкость 30%
      
      source.connect(gainNode).connect(this._audioCtx.destination);
      source.start();
      
      this.isMusicPlaying = true;
      
      // Сохраняем ссылку для остановки
      this.currentMusicSource = source;
      this.currentMusicGain = gainNode;
    };

    // Если контекст приостановлен, возобновляем его
    if (this._audioCtx.state === 'suspended') {
      this._audioCtx.resume().then(playMusic);
    } else {
      playMusic();
    }
  }

  stopBackgroundMusic() {
    if (this.currentMusicSource) {
      this.currentMusicSource.stop();
      this.currentMusicSource = null;
      this.currentMusicGain = null;
      this.isMusicPlaying = false;
    }
  }

  pauseBackgroundMusic() {
    if (this.currentMusicGain) {
      this.currentMusicGain.gain.value = 0;
    }
  }

  resumeBackgroundMusic() {
    if (this.currentMusicGain) {
      this.currentMusicGain.gain.value = 0.3;
    }
  }

  // --- Система скинов птички ---
  getCurrentBirdSkin() {
    return this.currentBirdSkin;
  }

  getBirdSkinImage() {
    return this.images[this.currentBirdSkin] || this.images['bird'];
  }

  setBirdSkin(skinName) {
    if (this.availableBirdSkins.includes(skinName)) {
      this.currentBirdSkin = skinName;
      return true;
    }
    return false;
  }

  getAvailableBirdSkins() {
    return this.availableBirdSkins;
  }

  getNextBirdSkin() {
    const currentIndex = this.availableBirdSkins.indexOf(this.currentBirdSkin);
    const nextIndex = (currentIndex + 1) % this.availableBirdSkins.length;
    return this.availableBirdSkins[nextIndex];
  }

  getPreviousBirdSkin() {
    const currentIndex = this.availableBirdSkins.indexOf(this.currentBirdSkin);
    const prevIndex = (currentIndex - 1 + this.availableBirdSkins.length) % this.availableBirdSkins.length;
    return this.availableBirdSkins[prevIndex];
  }
} 