export class UI {
  constructor() {
    this.startScreen = this._getOrCreateStartScreen();
    this.gameOverScreen = this._getOrCreateGameOverScreen();
    this.scoreDisplay = this._getOrCreateScoreDisplay();
    this._bindedStart = null;
    this._bindedRestart = null;
    this._bindedLeaderboard = null;
    this._bindedSkins = null;
    this._bindedSkinSelect = null;
    this._bindedBack = null;
    this._bindedSoundToggle = null;
  }

  showStart(onStart, onLeaderboard, onSkins, onSoundToggle, telegramUser = null, totalEarned = 0) {
    this.hideAll();
    
    
    // Пересоздаем стартовый экран с актуальными данными пользователя
    this.startScreen = this._getOrCreateStartScreen(telegramUser);
    this.startScreen.classList.remove('hidden');
    
    // Обновляем отображение токенов после создания DOM
    setTimeout(() => {
      this.updateTokenDisplay(totalEarned);
    }, 0);
    
    const startBtn = this.startScreen.querySelector('.start-btn');
    const leaderboardBtn = this.startScreen.querySelector('.leaderboard-btn');
    const skinsBtn = this.startScreen.querySelector('.skins-btn');
    const soundBtn = this.startScreen.querySelector('.sound-toggle-btn');
    
    if (this._bindedStart) startBtn.removeEventListener('click', this._bindedStart);
    this._bindedStart = () => {
      onStart && onStart();
    };
    startBtn.addEventListener('click', this._bindedStart);
    
    if (this._bindedLeaderboard) leaderboardBtn.removeEventListener('click', this._bindedLeaderboard);
    this._bindedLeaderboard = () => onLeaderboard && onLeaderboard();
    leaderboardBtn.addEventListener('click', this._bindedLeaderboard);
    
    if (this._bindedSkins) skinsBtn.removeEventListener('click', this._bindedSkins);
    this._bindedSkins = () => onSkins && onSkins();
    skinsBtn.addEventListener('click', this._bindedSkins);
    
    if (this._bindedSoundToggle) soundBtn.removeEventListener('click', this._bindedSoundToggle);
    this._bindedSoundToggle = () => onSoundToggle && onSoundToggle();
    soundBtn.addEventListener('click', this._bindedSoundToggle);
  }

  showGameOver(score, onRestart, onLeaderboard, onSkins, onSoundToggle, gameTokensEarned = 0, totalTokensEarned = 0) {
    this.hideAll();
    
    // Пересоздаем экран геймовера с актуальными данными
    this.gameOverScreen = this._getOrCreateGameOverScreen();
    this.gameOverScreen.classList.remove('hidden');
    this.gameOverScreen.querySelector('.final-score').textContent = `Счёт: ${score}`;
    
    // Обновляем отображение токенов
    const gameTokensElement = this.gameOverScreen.querySelector('#game-tokens-earned');
    const totalTokensElement = this.gameOverScreen.querySelector('#total-tokens-earned');
    
    if (gameTokensElement) {
      gameTokensElement.textContent = `${gameTokensEarned} 🪙`;
    }
    if (totalTokensElement) {
      totalTokensElement.textContent = `${totalTokensEarned} 🪙`;
    }
    
    const restartBtn = this.gameOverScreen.querySelector('.restart-btn');
    const leaderboardBtn = this.gameOverScreen.querySelector('.leaderboard-btn');
    const skinsBtn = this.gameOverScreen.querySelector('.skins-btn');
    const soundBtn = this.gameOverScreen.querySelector('.sound-toggle-btn');
    
    // Удаляем старые обработчики и привязываем новые
    if (this._bindedRestart) restartBtn.removeEventListener('click', this._bindedRestart);
    this._bindedRestart = () => onRestart && onRestart();
    restartBtn.addEventListener('click', this._bindedRestart);
    
    if (this._bindedLeaderboard) leaderboardBtn.removeEventListener('click', this._bindedLeaderboard);
    this._bindedLeaderboard = () => onLeaderboard && onLeaderboard();
    leaderboardBtn.addEventListener('click', this._bindedLeaderboard);
    
    if (this._bindedSkins) skinsBtn.removeEventListener('click', this._bindedSkins);
    this._bindedSkins = () => onSkins && onSkins();
    skinsBtn.addEventListener('click', this._bindedSkins);
    
    if (this._bindedSoundToggle) soundBtn.removeEventListener('click', this._bindedSoundToggle);
    this._bindedSoundToggle = () => onSoundToggle && onSoundToggle();
    soundBtn.addEventListener('click', this._bindedSoundToggle);
  }

  showLeaderboard(onBack) {
    this.hideAll();
    const leaderboardScreen = this._getOrCreateLeaderboardScreen();
    leaderboardScreen.classList.remove('hidden');
    
    const backBtn = leaderboardScreen.querySelector('button');
    if (this._bindedBack) backBtn.removeEventListener('click', this._bindedBack);
    this._bindedBack = () => onBack && onBack();
    backBtn.addEventListener('click', this._bindedBack);
  }

  showSkins(onBack, onSkinSelect, currentSkin = 'bird') {
    this.hideAll();
    const skinsScreen = this._getOrCreateSkinsScreen();
    skinsScreen.classList.remove('hidden');
    
    // Обновляем выбранный скин
    this._updateSelectedSkin(skinsScreen, currentSkin);
    
    const backBtn = skinsScreen.querySelector('.back-btn');
    if (this._bindedBack) backBtn.removeEventListener('click', this._bindedBack);
    this._bindedBack = () => onBack && onBack();
    backBtn.addEventListener('click', this._bindedBack);
    
    // Добавляем обработчики для кнопок скинов
    const skinButtons = skinsScreen.querySelectorAll('.skin-item');
    skinButtons.forEach((button, index) => {
      if (this._bindedSkinSelect) button.removeEventListener('click', this._bindedSkinSelect);
      this._bindedSkinSelect = () => {
        if (onSkinSelect) onSkinSelect(index);
        // Обновляем выбранный скин после клика
        const selectedSkin = button.getAttribute('data-skin');
        this._updateSelectedSkin(skinsScreen, selectedSkin);
      };
      button.addEventListener('click', this._bindedSkinSelect);
    });
  }

  updateLeaderboardList(scores, isOnline = false) {
    const listEl = document.querySelector('.leaderboard-list');
    if (listEl) {
      if (scores.length > 0) {
        listEl.innerHTML = scores.map((entry, index) => {
          const playerName = entry.playerName || 'Unknown';
          return `<div class="score-entry">${index + 1}. ${playerName} - ${entry.score} (${entry.date} ${entry.time})</div>`;
        }).join('');
      } else {
        listEl.innerHTML = '<div class="no-scores">Пока нет рекордов</div>';
      }
      
      // Добавляем индикатор статуса подключения
      const statusEl = document.querySelector('.connection-status');
      if (statusEl) {
        statusEl.textContent = isOnline ? '🌐 Онлайн' : '📱 Только локально';
        statusEl.className = `connection-status ${isOnline ? 'online' : 'offline'}`;
      }
    }
  }

  showScore(score) {
    this.hideAll();
    this.scoreDisplay.classList.remove('hidden');
    
    // Создаем контейнер для счета и токенов
    if (!this.scoreDisplay.querySelector('.score-container')) {
      this.scoreDisplay.innerHTML = `
        <div class="score-container">
          <div class="score-text">${score}</div>
          <div class="tokens-earned">+${Math.floor(score / 5)} 🪙</div>
        </div>
      `;
    } else {
      this.scoreDisplay.querySelector('.score-text').textContent = score;
      this.scoreDisplay.querySelector('.tokens-earned').textContent = `+${Math.floor(score / 5)} 🪙`;
    }
  }

  updateTokenDisplay(totalEarned) {
    // Обновляем отображение токенов на главном экране
    const tokenDisplay = document.getElementById('token-display');
    if (tokenDisplay) {
      tokenDisplay.textContent = `${totalEarned} 🪙`;
    } else {
      console.warn('⚠️ Элемент token-display не найден, попробуем найти в start-screen');
      // Попробуем найти элемент внутри start-screen
      const startScreen = document.getElementById('start-screen');
      if (startScreen) {
        const tokenDisplayInStart = startScreen.querySelector('#token-display');
        if (tokenDisplayInStart) {
          tokenDisplayInStart.textContent = `${totalEarned} 🪙`;
        } else {
          console.error('❌ Элемент token-display не найден даже в start-screen');
        }
      }
    }
  }

  updateSoundButton(isSoundOn) {
    const soundButtons = document.querySelectorAll('.sound-toggle-btn');
    soundButtons.forEach(button => {
      if (isSoundOn) {
        button.innerHTML = '🔊';
        button.classList.remove('sound-off');
        button.classList.add('sound-on');
      } else {
        button.innerHTML = '🔇';
        button.classList.remove('sound-on');
        button.classList.add('sound-off');
      }
    });
    
    // Добавляем отладочную информацию
    console.log(`🔊 Обновление кнопки звука: ${isSoundOn ? 'включен' : 'выключен'}, найдено кнопок: ${soundButtons.length}`);
  }

  hideAll() {
    this.startScreen.classList.add('hidden');
    this.gameOverScreen.classList.add('hidden');
    this.scoreDisplay.classList.add('hidden');
    const leaderboardScreen = document.getElementById('leaderboard-screen');
    if (leaderboardScreen) leaderboardScreen.classList.add('hidden');
    const skinsScreen = document.getElementById('skins-screen');
    if (skinsScreen) skinsScreen.classList.add('hidden');
  }

  _getOrCreateStartScreen(telegramUser = null) {
    // Удаляем старый стартовый экран, если он существует
    let oldEl = document.getElementById('start-screen');
    if (oldEl) {
      oldEl.remove();
    }
    
    // Создаем новый стартовый экран
    const el = document.createElement('div');
    el.id = 'start-screen';
    el.className = 'ui-screen';
    
    // Получаем имя пользователя из Telegram
    let userName = null;
    if (telegramUser && telegramUser.isInTelegram()) {
      userName = telegramUser.getUserName();
    }
    
    // Обновляем содержимое экрана с актуальными данными
    el.innerHTML = `
      <h1>Flappy Bird</h1>
      ${userName ? `<div class="telegram-user">Привет, ${userName}! 👋</div>` : ''}
      <div class="token-info">
        <div class="token-label">Заработано токенов:</div>
        <div id="token-display" class="token-display">0 🪙</div>
      </div>
      <button class="start-btn">Начать игру</button>
      <button class="leaderboard-btn">Таблица рекордов</button>
      <button class="skins-btn">Выбор облика</button>
      <button class="sound-toggle-btn sound-on">🔊</button>
    `;
    
    document.getElementById('game-container').appendChild(el);
    return el;
  }

  _getOrCreateGameOverScreen() {
    // Удаляем старый экран геймовера, если он существует
    let oldEl = document.getElementById('gameover-screen');
    if (oldEl) {
      oldEl.remove();
    }
    
    // Создаем новый экран геймовера
    const el = document.createElement('div');
    el.id = 'gameover-screen';
    el.className = 'ui-screen hidden';
    el.innerHTML = `
      <h2>Игра окончена</h2>
      <div class="final-score"></div>
      <div class="game-stats">
        <div class="token-info">
          <div class="token-label">Заработано в этой игре:</div>
          <div id="game-tokens-earned" class="token-display">0 🪙</div>
        </div>
        <div class="token-info">
          <div class="token-label">Всего заработано:</div>
          <div id="total-tokens-earned" class="token-display">0 🪙</div>
        </div>
      </div>
      <button class="restart-btn">Сыграть ещё</button>
      <button class="leaderboard-btn">Таблица рекордов</button>
      <button class="skins-btn">Выбор облика</button>
      <button class="sound-toggle-btn sound-on">🔊</button>
    `;
    document.getElementById('game-container').appendChild(el);
    return el;
  }

  _getOrCreateLeaderboardScreen() {
    let el = document.getElementById('leaderboard-screen');
    if (!el) {
      el = document.createElement('div');
      el.id = 'leaderboard-screen';
      el.className = 'ui-screen hidden';
      el.innerHTML = `
        <h2>Таблица рекордов</h2>
        <div class="connection-status offline">📱 Только локально</div>
        <div class="leaderboard-list"></div>
        <button>Назад</button>
      `;
      document.getElementById('game-container').appendChild(el);
    }
    return el;
  }

  _getOrCreateSkinsScreen() {
    let el = document.getElementById('skins-screen');
    if (!el) {
      el = document.createElement('div');
      el.id = 'skins-screen';
      el.className = 'ui-screen hidden';
      el.innerHTML = `
        <h2>Выберите облик птички</h2>
        <div class="skins-grid">
          <div class="skin-item" data-skin="bird">
            <img src="src/assets/bird.svg" alt="Жёлтая птичка" width="70" height="50">
          </div>
          <div class="skin-item" data-skin="bird-red">
            <img src="src/assets/bird-red.svg" alt="Красная птичка" width="70" height="50">
          </div>
          <div class="skin-item" data-skin="bird-green">
            <img src="src/assets/bird-green.svg" alt="Зелёная птичка" width="70" height="50">
          </div>
        </div>
        <button class="back-btn">Назад</button>
      `;
      document.getElementById('game-container').appendChild(el);
    }
    return el;
  }

  _getOrCreateScoreDisplay() {
    let el = document.getElementById('score-display');
    if (!el) {
      el = document.createElement('div');
      el.id = 'score-display';
      el.className = 'hidden';
      el.style.position = 'absolute';
      el.style.top = '20px';
      el.style.right = '20px';
      el.style.fontSize = '2rem';
      el.style.fontWeight = 'bold';
      el.style.color = 'white';
      el.style.textShadow = '2px 2px 4px rgba(0,0,0,0.7)';
      document.getElementById('game-container').appendChild(el);
    }
    return el;
  }

  _updateSelectedSkin(skinsScreen, selectedSkin) {
    // Убираем выделение со всех скинов
    const allSkinItems = skinsScreen.querySelectorAll('.skin-item');
    allSkinItems.forEach(item => {
      item.classList.remove('selected');
    });
    
    // Добавляем выделение к выбранному скину
    const selectedItem = skinsScreen.querySelector(`[data-skin="${selectedSkin}"]`);
    if (selectedItem) {
      selectedItem.classList.add('selected');
    }
  }
} 