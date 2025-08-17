export class AntiBonus {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.antiBonuses = [];
    this.speed = 2;
    this.spawnInterval = 4000; // Реже чем обычные бонусы (4 секунды)
    this.lastSpawnTime = 0;
    this.antiBonusSize = 20;
    this.pipes = null; // Ссылка на объект труб
  }

  update(deltaTime) {
    // Используем deltaTime для независимой от FPS скорости
    const timeScale = Math.min(deltaTime * 60, 2.0); // Ограничиваем максимальную скорость
    
    this.antiBonuses.forEach(antiBonus => {
      antiBonus.x -= this.speed * timeScale;
    });

    this.antiBonuses = this.antiBonuses.filter(antiBonus => antiBonus.x + this.antiBonusSize > 0);

    const currentTime = performance.now();
    if (currentTime - this.lastSpawnTime > this.spawnInterval) {
      this.spawnAntiBonus();
      this.lastSpawnTime = currentTime;
    }
  }

  spawnAntiBonus() {
    const x = this.canvasWidth;
    let y;
    let attempts = 0;
    const maxAttempts = 10;
    
    // Сначала попробуем найти место в проходе между трубами
    const gapPosition = this.findGapPosition();
    if (gapPosition !== null) {
      y = gapPosition;
    } else {
      // Если прохода нет, ищем случайное место
      do {
        y = Math.random() * (this.canvasHeight - 100 - this.antiBonusSize) + 50;
        attempts++;
      } while (this.isPositionOccupiedByPipe(x, y) && attempts < maxAttempts);
    }
    
    // Если не удалось найти свободное место, не создаём антибонус
    if (attempts >= maxAttempts && gapPosition === null) {
      return;
    }
    
    this.antiBonuses.push({
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
          
          // Проверяем, что проход достаточно большой для антибонуса
          if (gapSize > this.antiBonusSize + 20) {
            // Добавляем небольшую случайность в пределах прохода
            const randomOffset = (Math.random() - 0.5) * (gapSize - this.antiBonusSize - 20);
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
    const antiBonusBounds = {
      left: x,
      right: x + this.antiBonusSize,
      top: y,
      bottom: y + this.antiBonusSize
    };
    
    for (let pipe of pipesList) {
      const pipeBounds = {
        left: pipe.x,
        right: pipe.x + this.pipes.pipeWidth,
        top: pipe.y,
        bottom: pipe.y + pipe.height
      };
      
      // Проверяем пересечение с трубой
      if (!(antiBonusBounds.left > pipeBounds.right || 
            antiBonusBounds.right < pipeBounds.left || 
            antiBonusBounds.top > pipeBounds.bottom || 
            antiBonusBounds.bottom < pipeBounds.top)) {
        return true; // Позиция занята трубой
      }
    }
    
    return false; // Позиция свободна
  }

  render(ctx) {
    ctx.fillStyle = '#000000'; // Черный цвет для антибонусов
    this.antiBonuses.forEach(antiBonus => {
      if (!antiBonus.collected) {
        ctx.beginPath();
        ctx.arc(antiBonus.x + this.antiBonusSize / 2, antiBonus.y + this.antiBonusSize / 2, this.antiBonusSize / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Добавляем красный крестик для обозначения опасности
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(antiBonus.x + this.antiBonusSize * 0.3, antiBonus.y + this.antiBonusSize * 0.3);
        ctx.lineTo(antiBonus.x + this.antiBonusSize * 0.7, antiBonus.y + this.antiBonusSize * 0.7);
        ctx.moveTo(antiBonus.x + this.antiBonusSize * 0.7, antiBonus.y + this.antiBonusSize * 0.3);
        ctx.lineTo(antiBonus.x + this.antiBonusSize * 0.3, antiBonus.y + this.antiBonusSize * 0.7);
        ctx.stroke();
      }
    });
  }

  checkCollision(bird) {
    const birdBounds = bird.getBounds();
    let collected = false;
    
    this.antiBonuses.forEach(antiBonus => {
      if (!antiBonus.collected) {
        const antiBonusBounds = {
          left: antiBonus.x,
          right: antiBonus.x + this.antiBonusSize,
          top: antiBonus.y,
          bottom: antiBonus.y + this.antiBonusSize
        };
        
        if (this.isColliding(birdBounds, antiBonusBounds)) {
          antiBonus.collected = true;
          collected = true;
        }
      }
    });
    
    return collected;
  }

  isColliding(birdBounds, antiBonusBounds) {
    return !(birdBounds.left > antiBonusBounds.right || 
             birdBounds.right < antiBonusBounds.left || 
             birdBounds.top > antiBonusBounds.bottom || 
             birdBounds.bottom < antiBonusBounds.top);
  }

  reset() {
    this.antiBonuses = [];
    this.lastSpawnTime = 0;
  }

  setPipes(pipes) {
    this.pipes = pipes;
  }

  updateDimensions(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    // Удаляем антибонусы, которые выходят за пределы нового экрана
    this.antiBonuses = this.antiBonuses.filter(antiBonus => antiBonus.x + this.antiBonusSize > 0);
  }
} 