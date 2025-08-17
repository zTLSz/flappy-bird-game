export class Pipes {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.pipes = [];
    this.speed = 2;
    this.spawnInterval = 2500;
    this.lastSpawnTime = 0;
    this.pipeWidth = 52;
    this.gapSize = 320;
    this.sprite = null;
  }

  update(deltaTime) {
    // Используем deltaTime для независимой от FPS скорости
    const timeScale = Math.min(deltaTime * 60, 2.0); // Ограничиваем максимальную скорость
    
    this.pipes.forEach(pipe => {
      pipe.x -= this.speed * timeScale;
    });

    this.pipes = this.pipes.filter(pipe => pipe.x + this.pipeWidth > 0);

    const currentTime = performance.now();
    if (currentTime - this.lastSpawnTime > this.spawnInterval) {
      this.spawnPipe();
      this.lastSpawnTime = currentTime;
    }
  }

  spawnPipe() {
    const gapY = Math.random() * (this.canvasHeight - this.gapSize - 100) + 50;
    const topPipe = {
      x: this.canvasWidth,
      y: 0,
      height: gapY,
      isTop: true,
      passed: false,
      scored: false
    };
    const bottomPipe = {
      x: this.canvasWidth,
      y: gapY + this.gapSize,
      height: this.canvasHeight - gapY - this.gapSize,
      isTop: false,
      passed: false,
      scored: false
    };
    this.pipes.push(topPipe, bottomPipe);
  }

  render(ctx) {
    if (!this.sprite) return;
    
    this.pipes.forEach(pipe => {
      ctx.save();
      if (pipe.isTop) {
        ctx.translate(pipe.x + this.pipeWidth / 2, pipe.height / 2);
        ctx.scale(1, -1);
        ctx.drawImage(this.sprite, -this.pipeWidth / 2, -pipe.height / 2, this.pipeWidth, pipe.height);
      } else {
        ctx.drawImage(this.sprite, pipe.x, pipe.y, this.pipeWidth, pipe.height);
      }
      ctx.restore();
    });
  }

  reset() {
    this.pipes = [];
    this.lastSpawnTime = 0;
  }

  getPipes() {
    return this.pipes;
  }

  checkPassed(bird) {
    const birdX = bird.x + bird.width / 2;
    let scored = false;
    
    this.pipes.forEach(pipe => {
      if (!pipe.passed && pipe.x + this.pipeWidth < birdX) {
        pipe.passed = true;
        if (!pipe.scored) {
          pipe.scored = true;
          scored = true;
        }
      }
    });
    
    return scored;
  }

  setSprite(sprite) {
    this.sprite = sprite;
  }
} 