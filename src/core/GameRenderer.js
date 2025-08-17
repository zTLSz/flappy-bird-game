export class GameRenderer {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {CanvasRenderingContext2D} ctx
   * @param {Object} modules - { bird, pipes, background, ... }
   */
  constructor(canvas, ctx, modules) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.bird = modules.bird;
    this.pipes = modules.pipes;
    this.background = modules.background;
    this.ground = modules.ground;
    this.bonus = modules.bonus;
    this.antiBonus = modules.antiBonus;
    this.onInput = null; // callback для делегирования ввода
    this._bindedHandleInput = this._handleInput.bind(this);
    this.lastTouchTime = 0; // Для предотвращения двойных событий на мобильных
  }

  /**
   * Отрисовка всех игровых объектов
   */
  render() {
    // Очистка canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // Фон
    if (this.background) this.background.render(this.ctx);
    // Трубы
    if (this.pipes) this.pipes.render(this.ctx);
    // Бонусы
    if (this.bonus) this.bonus.render(this.ctx);
    // Антибонусы
    if (this.antiBonus) this.antiBonus.render(this.ctx);
    // Птичка
    if (this.bird) this.bird.render(this.ctx);
    // Земля
    if (this.ground) this.ground.render(this.ctx);
  }

  /**
   * Привязка обработчиков пользовательского ввода
   * @param {Function} onInput - callback (например, (type) => ...)
   */
  bindInputHandlers(onInput) {
    this.onInput = onInput;
    window.addEventListener('keydown', this._bindedHandleInput);
    this.canvas.addEventListener('mousedown', this._bindedHandleInput);
    this.canvas.addEventListener('touchstart', this._bindedHandleInput);
  }

  /**
   * Отвязка обработчиков (например, при уничтожении)
   */
  unbindInputHandlers() {
    window.removeEventListener('keydown', this._bindedHandleInput);
    this.canvas.removeEventListener('mousedown', this._bindedHandleInput);
    this.canvas.removeEventListener('touchstart', this._bindedHandleInput);
  }

  /**
   * Внутренняя обработка ввода, делегирует наружу
   */
  _handleInput(e) {
    if (!this.onInput) return;
    
    if (e.type === 'keydown' && (e.code === 'Space' || e.key === ' ')) {
      e.preventDefault();
      this.onInput('jump');
    }
    
    if (e.type === 'touchstart') {
      e.preventDefault(); // Предотвращаем стандартное поведение
      const currentTime = Date.now();
      if (currentTime - this.lastTouchTime > 100) { // Защита от двойных событий
        this.lastTouchTime = currentTime;
        this.onInput('jump');
      }
    }
    
    if (e.type === 'mousedown') {
      // На мобильных устройствах игнорируем mousedown события
      // так как они дублируют touchstart
      if (!('ontouchstart' in window)) {
        this.onInput('jump');
      }
    }
  }

  /**
   * Масштабирование/адаптация canvas (по необходимости)
   */
  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
  }
} 