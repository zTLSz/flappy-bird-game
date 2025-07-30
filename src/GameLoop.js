export class GameLoop {
  /**
   * @param {Object} modules - { bird, pipes, collision, ... }
   * @param {Object} gameState - объект управления состояниями
   * @param {Function} onUpdate - колбэк, вызываемый после update (например, для рендера)
   */
  constructor(modules, gameState, onUpdate) {
    this.bird = modules.bird;
    this.pipes = modules.pipes;
    this.collision = modules.collision;
    this.bonus = modules.bonus;
    this.gameState = gameState;
    this.onUpdate = onUpdate;
    this.score = 0;
    this.lastTimestamp = null;
    this.isRunning = false;
    this._boundTick = this._tick.bind(this);
    
  }

  /** Запуск игрового цикла */
  start() {
    this.isRunning = true;
    this.lastTimestamp = performance.now();
    this.gameState.setState('playing');
    requestAnimationFrame(this._boundTick);
  }

  /** Остановка игрового цикла */
  stop() {
    this.isRunning = false;
    this.gameState.setState('gameOver');
  }

  /** Сброс состояния игры */
  reset() {
    this.score = 0;
    if (this.bird && this.bird.reset) this.bird.reset();
    if (this.pipes && this.pipes.reset) this.pipes.reset();
    if (this.bonus && this.bonus.reset) this.bonus.reset();
    if (this.leaderboard) this.leaderboard.resetCurrentGame();
    this.gameState.setState('start');
    this.lastTimestamp = null;
  }

  /** Основной игровой цикл */
  _tick(currentTimestamp) {
    if (!this.isRunning) return;
    const deltaTime = (currentTimestamp - (this.lastTimestamp || currentTimestamp)) / 400;
    this.lastTimestamp = currentTimestamp;
    this.update(deltaTime);
    if (typeof this.onUpdate === 'function') this.onUpdate();
    if (this.isRunning) requestAnimationFrame(this._boundTick);
  }

  /** Обновление состояния всех игровых объектов */
  update(deltaTime) {
    if (!this.gameState.isPlaying()) return;
    if (this.bird && this.bird.update) this.bird.update(deltaTime);
    if (this.pipes && this.pipes.update) this.pipes.update(deltaTime);
    if (this.bonus && this.bonus.update) {
      this.bonus.update(deltaTime);
    }
    if (this.collision && this.collision.check && this.collision.check(this.bird, this.pipes)) {
      if (this.onHitSound) this.onHitSound();
      this.stop();
    }
    // Проверка прохождения труб для увеличения счёта
    if (this.pipes && this.pipes.checkPassed && this.pipes.checkPassed(this.bird)) {
      this.score++;
      if (this.onScoreSound) this.onScoreSound();
    }
    // Проверка сбора бонусов
    if (this.bonus && this.bonus.checkCollision && this.bonus.checkCollision(this.bird)) {
      this.score++;
      if (this.onScoreSound) this.onScoreSound();
    }
  }

  /** Обработка событий от renderer (например, прыжок) */
  handleInput(input) {
    if (this.gameState.isPlaying() && input === 'jump') {
      if (this.bird && this.bird.jump) this.bird.jump();
    }
  }

  /** Получить текущий счёт */
  getScore() {
    return this.score;
  }
} 