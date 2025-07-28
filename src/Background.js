export class Background {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.clouds = [];
    this.initClouds();
  }

  initClouds() {
    for (let i = 0; i < 5; i++) {
      this.clouds.push({
        x: Math.random() * this.canvasWidth,
        y: Math.random() * (this.canvasHeight * 0.6),
        speed: 0.5 + Math.random() * 0.5,
        size: 30 + Math.random() * 40
      });
    }
  }

  update(deltaTime) {
    this.clouds.forEach(cloud => {
      cloud.x -= cloud.speed;
      if (cloud.x + cloud.size < 0) {
        cloud.x = this.canvasWidth + cloud.size;
        cloud.y = Math.random() * (this.canvasHeight * 0.6);
      }
    });
  }

  render(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.7, '#98D8E8');
    gradient.addColorStop(1, '#B0E0E6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    this.drawClouds(ctx);
  }

  drawClouds(ctx) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.clouds.forEach(cloud => {
      this.drawCloud(ctx, cloud.x, cloud.y, cloud.size);
    });
  }

  drawCloud(ctx, x, y, size) {
    ctx.beginPath();
    ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
    ctx.arc(x + size * 0.3, y, size * 0.4, 0, Math.PI * 2);
    ctx.arc(x + size * 0.6, y, size * 0.3, 0, Math.PI * 2);
    ctx.arc(x + size * 0.3, y - size * 0.2, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
} 