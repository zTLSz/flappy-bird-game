export class Bonus {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.bonuses = [];
    this.speed = 2;
    this.spawnInterval = 300;
    this.lastSpawnTime = 0;
    this.bonusSize = 20;
  }

  update(deltaTime) {
    this.bonuses.forEach(bonus => {
      bonus.x -= this.speed;
    });

    this.bonuses = this.bonuses.filter(bonus => bonus.x + this.bonusSize > 0);

    const currentTime = performance.now();
    if (currentTime - this.lastSpawnTime > this.spawnInterval) {
      this.spawnBonus();
      this.lastSpawnTime = currentTime;
    }
  }

  spawnBonus() {
    const x = this.canvasWidth;
    const y = Math.random() * (this.canvasHeight - 100 - this.bonusSize) + 50;
    
    this.bonuses.push({
      x: x,
      y: y,
      collected: false
    });
  }

  render(ctx) {
    ctx.fillStyle = '#FFD700';
    this.bonuses.forEach(bonus => {
      if (!bonus.collected) {
        ctx.beginPath();
        ctx.arc(bonus.x + this.bonusSize / 2, bonus.y + this.bonusSize / 2, this.bonusSize / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Блики
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(bonus.x + this.bonusSize / 3, bonus.y + this.bonusSize / 3, this.bonusSize / 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFD700';
      }
    });
  }

  checkCollision(bird) {
    const birdBounds = bird.getBounds();
    let collected = false;
    
    this.bonuses.forEach(bonus => {
      if (!bonus.collected) {
        const bonusBounds = {
          left: bonus.x,
          right: bonus.x + this.bonusSize,
          top: bonus.y,
          bottom: bonus.y + this.bonusSize
        };
        
        if (this.isColliding(birdBounds, bonusBounds)) {
          bonus.collected = true;
          collected = true;
        }
      }
    });
    
    return collected;
  }

  isColliding(birdBounds, bonusBounds) {
    return !(birdBounds.left > bonusBounds.right || 
             birdBounds.right < bonusBounds.left || 
             birdBounds.top > bonusBounds.bottom || 
             birdBounds.bottom < bonusBounds.top);
  }

  reset() {
    this.bonuses = [];
    this.lastSpawnTime = 0;
  }
} 