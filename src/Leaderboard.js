export class Leaderboard {
  constructor() {
    this.scores = []; // Глобальные рекорды из Firebase
    this.maxScores = 100;
    this.lastSavedScore = null; // Последний записанный счёт в текущей игре
    this.isOnline = false;
    this.playerName = this.getPlayerName();
    
    // Проверяем доступность Firebase
    this.checkFirebaseAvailability();
    this.load();
  }

  getPlayerName() {
    let name = localStorage.getItem('flappyBirdPlayerName');
    if (!name) {
      name = `Player${Math.floor(Math.random() * 1000)}`;
      localStorage.setItem('flappyBirdPlayerName', name);
    }
    return name;
  }

  checkFirebaseAvailability() {
    this.isOnline = !!(window.firebaseDB && window.firebaseRef && window.firebaseSet);
    console.log('Firebase доступен:', this.isOnline);
  }

  async load() {
    try {
      // Загружаем только глобальные рекорды из Firebase
      if (this.isOnline) {
        await this.loadGlobalScores();
      } else {
        this.scores = [];
      }
    } catch (e) {
      console.error('Ошибка загрузки рекордов:', e);
      this.scores = [];
    }
  }

  async loadGlobalScores() {
    try {
      const scoresRef = window.firebaseRef(window.firebaseDB, 'scores');
      
      // Сначала пробуем загрузить все рекорды без сортировки
      const snapshot = await window.firebaseGet(scoresRef);
      
      if (snapshot.exists()) {
        const scoresData = snapshot.val();
        // Преобразуем объект в массив и сортируем локально
        this.scores = Object.values(scoresData)
          .filter(score => score && score.score) // Фильтруем валидные записи
          .sort((a, b) => b.score - a.score)
          .slice(0, this.maxScores);
      } else {
        this.scores = [];
      }
    } catch (e) {
      console.error('Ошибка загрузки глобальных рекордов:', e);
      this.scores = [];
    }
  }

  // Метод save больше не нужен, так как не сохраняем локально
  // save() {
  //   try {
  //     localStorage.setItem('flappyBirdScores', JSON.stringify(this.scores));
  //   } catch (e) {
  //     console.error('Ошибка сохранения рекордов:', e);
  //   }
  // }

  async addScore(score, telegramUser = null) {
    // Записываем только если счёт больше 0 и ещё не был записан в этой игре
    if (score > 0 && this.lastSavedScore !== score) {
      this.lastSavedScore = score;
      
      // Получаем имя пользователя из Telegram или используем локальное
      let userName = this.playerName;
      let userId = null;
      
      if (telegramUser && telegramUser.isInTelegram()) {
        userName = telegramUser.getUserName();
        userId = telegramUser.getUserId();
      }
      
      const scoreEntry = {
        score: score,
        playerName: userName,
        userId: userId,
        date: new Date().toLocaleDateString('ru-RU'),
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now()
      };
      
      // Если Firebase доступен, сохраняем в глобальную таблицу
      if (this.isOnline) {
        await this.saveGlobalScore(scoreEntry);
        // Обновляем локальный список рекордов
        await this.loadGlobalScores();
      }
    }
  }

  async saveGlobalScore(scoreEntry) {
    try {
      const scoresRef = window.firebaseRef(window.firebaseDB, 'scores');
      const newScoreRef = window.firebasePush(scoresRef);
      await window.firebaseSet(newScoreRef, scoreEntry);
      console.log('Счёт сохранён в глобальную таблицу:', scoreEntry);
    } catch (e) {
      console.error('Ошибка сохранения в глобальную таблицу:', e);
    }
  }

  getTopScores() {
    return this.scores.slice(0, 100);
  }

  getBestScore() {
    return this.scores.length > 0 ? this.scores[0].score : 0;
  }

  resetScores() {
    this.scores = [];
    this.currentGameScore = null;
    // Убираем вызов save(), так как больше не сохраняем локально
  }

  resetCurrentGame() {
    this.currentGameScore = null;
  }

  formatScores() {
    return this.scores.map((entry, index) => {
      const playerName = entry.playerName || 'Unknown';
      return `${index + 1}. ${playerName} - ${entry.score} (${entry.date} ${entry.time})`;
    }).join('\n');
  }

  // Метод getLocalScores больше не нужен, так как не используем локальные рекорды
  // getLocalScores() {
  //   const saved = localStorage.getItem('flappyBirdScores');
  //   return saved ? JSON.parse(saved) : [];
  // }

  // Получить только глобальные рекорды
  async getGlobalScores() {
    if (!this.isOnline) return [];
    
    try {
      const scoresRef = window.firebaseRef(window.firebaseDB, 'scores');
      const snapshot = await window.firebaseGet(scoresRef);
      
      if (snapshot.exists()) {
        const scoresData = snapshot.val();
        return Object.values(scoresData)
          .filter(score => score && score.score)
          .sort((a, b) => b.score - a.score)
          .slice(0, 100);
      }
      return [];
    } catch (e) {
      console.error('Ошибка получения глобальных рекордов:', e);
      return [];
    }
  }

  // Обновить имя игрока
  updatePlayerName(newName) {
    this.playerName = newName;
    localStorage.setItem('flappyBirdPlayerName', newName);
  }
} 