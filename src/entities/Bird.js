export class Bird {
  constructor(canvasWidth, canvasHeight) {
    this.x = canvasWidth * 0.2;
    this.y = canvasHeight * 0.9;
    this.velocityY = 0;
    this.gravity = 0.2;
    this.jumpPower = -8;
    this.rotation = 0;
    this.width = 48;
    this.height = 34;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.sprite = null;
    this.onJumpSound = null;
  }

  update(deltaTime) {
    // Используем deltaTime для независимой от FPS скорости
    const timeScale = Math.min(deltaTime * 60, 2.0); // Ограничиваем максимальную скорость
    
    this.velocityY += this.gravity * timeScale;
    this.y += this.velocityY * timeScale;

    this.rotation = Math.min(Math.PI / 2, Math.max(-Math.PI / 4, this.velocityY * 0.1));

    this.y = Math.max(0, Math.min(this.canvasHeight - this.height, this.y));
  }

  jump() {
    this.velocityY = this.jumpPower;
    if (this.onJumpSound) this.onJumpSound();
  }

  render(ctx) {
    if (!this.sprite) return;
    
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate(this.rotation);
    ctx.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();
  }

  reset() {
    this.y = this.canvasHeight * 0.5;
    this.velocityY = 0;
    this.rotation = 0;
  }

  getBounds() {
    return {
      left: this.x,
      right: this.x + this.width,
      top: this.y,
      bottom: this.y + this.height,
    };
  }

  setSprite(sprite) {
    this.sprite = sprite;
  }
} 