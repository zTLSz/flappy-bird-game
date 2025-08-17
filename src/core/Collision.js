export class Collision {
  constructor(canvasHeight) {
    this.canvasHeight = canvasHeight;
    this.groundHeight = 50;
  }

  check(bird, pipes) {
    const birdBounds = bird.getBounds();
    
    // Проверка столкновения с землёй
    if (birdBounds.bottom >= this.canvasHeight - this.groundHeight) {
      return true;
    }
    
    // Проверка столкновения с потолком
    if (birdBounds.top <= 0) {
      return true;
    }
    
    // Проверка столкновения с трубами
    const pipesList = pipes.getPipes();
    for (let pipe of pipesList) {
      if (this.checkBirdPipeCollision(birdBounds, pipe, pipes.pipeWidth)) {
        return true;
      }
    }
    
    return false;
  }

  checkBirdPipeCollision(birdBounds, pipe, pipeWidth) {
    const pipeBounds = {
      left: pipe.x,
      right: pipe.x + pipeWidth,
      top: pipe.y,
      bottom: pipe.y + pipe.height
    };
    
    return !(birdBounds.left > pipeBounds.right || 
             birdBounds.right < pipeBounds.left || 
             birdBounds.top > pipeBounds.bottom || 
             birdBounds.bottom < pipeBounds.top);
  }
} 