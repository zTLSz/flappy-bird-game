export class Leaderboard {
  constructor() {
    this.scores = [];
    this.maxScores = 10;
    this.lastSavedScore = null; // Последний записанный счёт в текущей игре
    this.load();
  }

  load() {
    try {
      const saved = localStorage.getItem('flappyBirdScores');
      this.scores = saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Ошибка загрузки рекордов:', e);
      this.scores = [];
    }
  }

  save() {
    try {
      localStorage.setItem('flappyBirdScores', JSON.stringify(this.scores));
    } catch (e) {
      console.error('Ошибка сохранения рекордов:', e);
    }
  }

  addScore(score) {
    // Записываем только если счёт больше 0 и ещё не был записан в этой игре
    if (score > 0 && this.lastSavedScore !== score) {
      this.lastSavedScore = score;
      
      const scoreEntry = {
        score: score,
        date: new Date().toLocaleDateString('ru-RU'),
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
      };
      
      this.scores.push(scoreEntry);
      this.scores.sort((a, b) => b.score - a.score);
      this.scores = this.scores.slice(0, this.maxScores);
      
      this.save();
    }
  }

  getTopScores() {
    return this.scores.slice(0, 5);
  }

  getBestScore() {
    return this.scores.length > 0 ? this.scores[0].score : 0;
  }

  resetScores() {
    this.scores = [];
    this.currentGameScore = null;
    this.save();
  }

  resetCurrentGame() {
    this.currentGameScore = null;
  }

  formatScores() {
    return this.scores.map((entry, index) => 
      `${index + 1}. ${entry.score} (${entry.date} ${entry.time})`
    ).join('\n');
  }
} 