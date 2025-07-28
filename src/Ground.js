export class Ground {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.height = 50;
    this.y = canvasHeight - this.height;
    this.scrollSpeed = 2;
    this.offset = 0;
  }

  update(deltaTime) {
    this.offset -= this.scrollSpeed;
    if (this.offset <= -this.canvasWidth) {
      this.offset = 0;
    }
  }

  render(ctx) {
    // Рисуем землю
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, this.y, this.canvasWidth, this.height);
    
    // Рисуем траву сверху земли
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, this.y, this.canvasWidth, 10);
    
    // Добавляем текстуру
    this.drawTexture(ctx);
  }

  drawTexture(ctx) {
    ctx.fillStyle = '#654321';
    for (let i = 0; i < this.canvasWidth; i += 20) {
      ctx.fillRect(i, this.y + 15, 10, 5);
    }
  }

  getBounds() {
    return {
      left: 0,
      right: this.canvasWidth,
      top: this.y,
      bottom: this.canvasHeight
    };
  }
} 