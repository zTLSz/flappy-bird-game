export class UI {
  constructor() {
    this.startScreen = this._getOrCreateStartScreen();
    this.gameOverScreen = this._getOrCreateGameOverScreen();
    this.scoreDisplay = this._getOrCreateScoreDisplay();
    this._bindedStart = null;
    this._bindedRestart = null;
    this._bindedLeaderboard = null;
    this._bindedBack = null;
  }

  showStart(onStart, onLeaderboard) {
    this.hideAll();
    this.startScreen.classList.remove('hidden');
    const startBtn = this.startScreen.querySelector('.start-btn');
    const leaderboardBtn = this.startScreen.querySelector('.leaderboard-btn');
    
    if (this._bindedStart) startBtn.removeEventListener('click', this._bindedStart);
    this._bindedStart = () => onStart && onStart();
    startBtn.addEventListener('click', this._bindedStart);
    
    if (this._bindedLeaderboard) leaderboardBtn.removeEventListener('click', this._bindedLeaderboard);
    this._bindedLeaderboard = () => onLeaderboard && onLeaderboard();
    leaderboardBtn.addEventListener('click', this._bindedLeaderboard);
  }

  showGameOver(score, onRestart, onLeaderboard) {
    this.hideAll();
    this.gameOverScreen.classList.remove('hidden');
    this.gameOverScreen.querySelector('.final-score').textContent = `Счёт: ${score}`;
    
    const restartBtn = this.gameOverScreen.querySelector('.restart-btn');
    const leaderboardBtn = this.gameOverScreen.querySelector('.leaderboard-btn');
    
    if (this._bindedRestart) restartBtn.removeEventListener('click', this._bindedRestart);
    this._bindedRestart = () => onRestart && onRestart();
    restartBtn.addEventListener('click', this._bindedRestart);
    
    if (this._bindedLeaderboard) leaderboardBtn.removeEventListener('click', this._bindedLeaderboard);
    this._bindedLeaderboard = () => onLeaderboard && onLeaderboard();
    leaderboardBtn.addEventListener('click', this._bindedLeaderboard);
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
    this.scoreDisplay.textContent = score;
  }

  hideAll() {
    this.startScreen.classList.add('hidden');
    this.gameOverScreen.classList.add('hidden');
    this.scoreDisplay.classList.add('hidden');
    const leaderboardScreen = document.getElementById('leaderboard-screen');
    if (leaderboardScreen) leaderboardScreen.classList.add('hidden');
  }

  _getOrCreateStartScreen() {
    let el = document.getElementById('start-screen');
    if (!el) {
      el = document.createElement('div');
      el.id = 'start-screen';
      el.className = 'ui-screen';
      el.innerHTML = `<h1>Flappy Bird</h1><button class="start-btn">Начать игру</button><button class="leaderboard-btn">Таблица рекордов</button>`;
      document.getElementById('game-container').appendChild(el);
    }
    return el;
  }

  _getOrCreateGameOverScreen() {
    let el = document.getElementById('gameover-screen');
    if (!el) {
      el = document.createElement('div');
      el.id = 'gameover-screen';
      el.className = 'ui-screen hidden';
      el.innerHTML = `<h2>Игра окончена</h2><div class="final-score"></div><button class="restart-btn">Сыграть ещё</button><button class="leaderboard-btn">Таблица рекордов</button>`;
      document.getElementById('game-container').appendChild(el);
    }
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
} 