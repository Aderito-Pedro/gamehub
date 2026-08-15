export default class StarBlasterGame {
  constructor(canvas, onScoreUpdate, onGameOver) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.onScoreUpdate = onScoreUpdate;
    this.onGameOver = onGameOver;

    this.ship = { x: canvas.width / 2, y: canvas.height - 50, width: 30, height: 26, speed: 5 };
    this.keys = {};
    this.running = false;
    this.frame = 0;
    this.fireCooldown = 0;

    this.setupInput();
    this.resetGame();
  }

  setupInput() {
    this.handleKeyDown = (e) => {
      this.keys[e.key] = true;
      if (["ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
    };
    this.handleKeyUp = (e) => { this.keys[e.key] = false; };
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
  }

  destroy() {
    this.stop();
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
  }

  resetGame() {
    this.ship.x = this.canvas.width / 2;
    this.bullets = [];
    this.asteroids = [];
    this.frame = 0;
    this.score = 0;
    this.fireCooldown = 0;
  }

  start() {
    this.running = true;
    this.tick();
  }

  stop() {
    this.running = false;
  }

  tick() {
    if (!this.running) return;
    this.update();
    this.render();
    requestAnimationFrame(() => this.tick());
  }

  spawnAsteroid() {
    const radius = 14 + Math.random() * 18;
    this.asteroids.push({
      x: radius + Math.random() * (this.canvas.width - radius * 2),
      y: -radius,
      radius,
      speed: 1.6 + Math.random() * 1.8,
    });
  }

  update() {
    this.frame++;

    if (this.keys["ArrowLeft"]) this.ship.x = Math.max(this.ship.width / 2, this.ship.x - this.ship.speed);
    if (this.keys["ArrowRight"]) this.ship.x = Math.min(this.canvas.width - this.ship.width / 2, this.ship.x + this.ship.speed);

    if (this.fireCooldown > 0) this.fireCooldown--;
    if (this.keys[" "] && this.fireCooldown === 0) {
      this.bullets.push({ x: this.ship.x, y: this.ship.y - this.ship.height / 2 });
      this.fireCooldown = 10;
    }

    for (const bullet of this.bullets) bullet.y -= 8;
    this.bullets = this.bullets.filter((b) => b.y > -10);

    if (this.frame % 45 === 0) this.spawnAsteroid();
    for (const asteroid of this.asteroids) asteroid.y += asteroid.speed;
    this.asteroids = this.asteroids.filter((a) => a.y - a.radius < this.canvas.height + 20);

    for (const bullet of this.bullets) {
      for (const asteroid of this.asteroids) {
        if (asteroid.hit) continue;
        const dx = bullet.x - asteroid.x;
        const dy = bullet.y - asteroid.y;
        if (Math.sqrt(dx * dx + dy * dy) < asteroid.radius) {
          asteroid.hit = true;
          bullet.hit = true;
          this.score += Math.round(30 - asteroid.radius);
          this.onScoreUpdate(this.score);
          break;
        }
      }
    }
    this.bullets = this.bullets.filter((b) => !b.hit);
    this.asteroids = this.asteroids.filter((a) => !a.hit);

    for (const asteroid of this.asteroids) {
      const dx = this.ship.x - asteroid.x;
      const dy = this.ship.y - asteroid.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < asteroid.radius + this.ship.width / 2.4) {
        this.endGame();
        return;
      }
    }
  }

  endGame() {
    this.stop();
    this.onGameOver(this.score);
  }

  render() {
    this.ctx.fillStyle = "#020617";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = "#94a3b8";
    for (const bullet of this.bullets) {
      this.ctx.fillRect(bullet.x - 2, bullet.y - 8, 4, 10);
    }

    for (const asteroid of this.asteroids) {
      this.drawAvatar("🪨", asteroid.x, asteroid.y, asteroid.radius * 2.2, 0);
    }

    this.drawAvatar("🚀", this.ship.x, this.ship.y, this.ship.height * 1.4, -Math.PI / 4);
  }

  drawAvatar(emoji, cx, cy, size, rotation = 0) {
    this.ctx.save();
    this.ctx.translate(cx, cy);
    if (rotation) this.ctx.rotate(rotation);
    this.ctx.font = `${Math.floor(size)}px sans-serif`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(emoji, 0, 0);
    this.ctx.restore();
  }
}
