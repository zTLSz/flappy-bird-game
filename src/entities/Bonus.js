export class Bonus {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.bonuses = [];
    this.speed = 2;
    this.spawnInterval = 1000; // Увеличиваем интервал до 2 секунд
    this.lastSpawnTime = 0;
    this.bonusSize = 20;
    this.pipes = null; // Ссылка на объект труб
  }

  update(deltaTime) {
    // Используем deltaTime для независимой от FPS скорости
    const timeScale = Math.min(deltaTime * 60, 2.0); // Ограничиваем максимальную скорость
    
    this.bonuses.forEach(bonus => {
      bonus.x -= this.speed * timeScale;
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
    let y;
    let attempts = 0;
    const maxAttempts = 15;
    
    // Сначала попробуем найти место в проходе между трубами
    const gapPosition = this.findGapPosition();
    if (gapPosition !== null) {
      y = gapPosition;
    } else {
      // Если прохода нет, ищем случайное место
      do {
        y = Math.random() * (this.canvasHeight - 100 - this.bonusSize) + 50;
        attempts++;
      } while (this.isPositionOccupiedByPipe(x, y) && attempts < maxAttempts);
    }
    
    // Если не удалось найти свободное место, не создаём бонус
    if (attempts >= maxAttempts && gapPosition === null) {
      return;
    }
    
    this.bonuses.push({
      x: x,
      y: y,
      collected: false
    });
  }

  findGapPosition() {
    if (!this.pipes) return null;
    
    const pipesList = this.pipes.getPipes();
    const gapPositions = [];
    
    // Группируем трубы по парам (верхняя и нижняя)
    for (let i = 0; i < pipesList.length; i += 2) {
      if (i + 1 < pipesList.length) {
        const topPipe = pipesList[i];
        const bottomPipe = pipesList[i + 1];
        
        if (topPipe.isTop && !bottomPipe.isTop) {
          // Находим центр прохода
          const gapCenter = topPipe.height + (bottomPipe.y - topPipe.height) / 2;
          const gapSize = bottomPipe.y - topPipe.height;
          
          // Проверяем, что проход достаточно большой для бонуса
          if (gapSize > this.bonusSize + 20) {
            // Добавляем небольшую случайность в пределах прохода
            const randomOffset = (Math.random() - 0.5) * (gapSize - this.bonusSize - 20);
            const y = gapCenter + randomOffset;
            
            // Проверяем, что позиция не пересекается с трубами
            if (!this.isPositionOccupiedByPipe(this.canvasWidth, y)) {
              gapPositions.push(y);
            }
          }
        }
      }
    }
    
    // Возвращаем случайную позицию из найденных проходов
    if (gapPositions.length > 0) {
      return gapPositions[Math.floor(Math.random() * gapPositions.length)];
    }
    
    return null;
  }

  isPositionOccupiedByPipe(x, y) {
    if (!this.pipes) return false;
    
    const pipesList = this.pipes.getPipes();
    const bonusBounds = {
      left: x,
      right: x + this.bonusSize,
      top: y,
      bottom: y + this.bonusSize
    };
    
    for (let pipe of pipesList) {
      const pipeBounds = {
        left: pipe.x,
        right: pipe.x + this.pipes.pipeWidth,
        top: pipe.y,
        bottom: pipe.y + pipe.height
      };
      
      // Проверяем пересечение с трубой
      if (!(bonusBounds.left > pipeBounds.right || 
            bonusBounds.right < pipeBounds.left || 
            bonusBounds.top > pipeBounds.bottom || 
            bonusBounds.bottom < pipeBounds.top)) {
        return true; // Позиция занята трубой
      }
    }
    
    return false; // Позиция свободна
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

  setPipes(pipes) {
    this.pipes = pipes;
  }
} 