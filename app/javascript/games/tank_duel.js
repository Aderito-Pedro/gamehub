export default class TankDuelGame {
  constructor(canvas, onScoreUpdate, onGameOver) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.onScoreUpdate = onScoreUpdate;
    this.onGameOver = onGameOver;

    this.groundY = canvas.height - 40;
    this.gravity = 0.25;
    this.running = false;

    this.setupInput();
    this.resetGame();
  }

  setupInput() {
    this.handleKeyDown = (e) => {
      if (!this.running || this.phase !== "aim") return;
      if (e.key === "ArrowUp") { this.angle = Math.min(85, this.angle + 2); e.preventDefault(); }
      if (e.key === "ArrowDown") { this.angle = Math.max(5, this.angle - 2); e.preventDefault(); }
      if (e.key === "ArrowRight") { this.power = Math.min(100, this.power + 2); e.preventDefault(); }
      if (e.key === "ArrowLeft") { this.power = Math.max(10, this.power - 2); e.preventDefault(); }
      if (e.key === " ") { this.fire("player"); e.preventDefault(); }
      this.render();
    };
    window.addEventListener("keydown", this.handleKeyDown);
  }

  destroy() {
    this.stop();
    window.removeEventListener("keydown", this.handleKeyDown);
  }

  resetGame() {
    this.player = { x: 60, y: this.groundY, health: 100 };
    this.enemy = { x: this.canvas.width - 60, y: this.groundY, health: 100 };
    this.angle = 35;
    this.power = 55;
    this.phase = "aim";
    this.projectile = null;
    this.score = 0;
    this.turnTimer = 0;
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

  fire(who) {
    const shooter = who === "player" ? this.player : this.enemy;
    const angle = who === "player" ? this.angle : this.enemyAngle;
    const power = who === "player" ? this.power : this.enemyPower;
    const dir = who === "player" ? 1 : -1;
    const rad = (angle * Math.PI) / 180;
    const speed = power * 0.16;

    this.projectile = {
      x: shooter.x,
      y: shooter.y - 10,
      vx: Math.cos(rad) * speed * dir,
      vy: -Math.sin(rad) * speed,
      owner: who,
    };
    this.phase = "flying";
  }

  update() {
    if (this.phase === "flying" && this.projectile) {
      const p = this.projectile;
      p.vy += this.gravity;
      p.x += p.vx;
      p.y += p.vy;

      const target = p.owner === "player" ? this.enemy : this.player;
      const dx = p.x - target.x;
      const dy = p.y - target.y;
      const hit = Math.sqrt(dx * dx + dy * dy) < 22;

      if (hit) {
        target.health = Math.max(0, target.health - 25);
        if (p.owner === "player") {
          this.score += 25;
          this.onScoreUpdate(this.score);
        }
        this.projectile = null;
        this.resolveTurn(p.owner);
        return;
      }

      if (p.y >= this.groundY || p.x < 0 || p.x > this.canvas.width) {
        this.projectile = null;
        this.resolveTurn(p.owner);
      }
    } else if (this.phase === "ai_turn") {
      this.turnTimer -= 1;
      if (this.turnTimer <= 0) {
        this.enemyAngle = 25 + Math.random() * 30;
        this.enemyPower = 45 + Math.random() * 25;
        this.fire("enemy");
      }
    }
  }

  resolveTurn(lastShooter) {
    if (this.enemy.health <= 0 || this.player.health <= 0) {
      this.endGame();
      return;
    }

    if (lastShooter === "player") {
      this.phase = "ai_turn";
      this.turnTimer = 45;
    } else {
      this.phase = "aim";
    }
  }

  endGame() {
    this.stop();
    if (this.enemy.health <= 0) this.score += 100;
    this.onGameOver(this.score);
  }

  render() {
    this.ctx.fillStyle = "#0ea5e9";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = "#65a30d";
    this.ctx.fillRect(0, this.groundY, this.canvas.width, this.canvas.height - this.groundY);

    this.drawTank(this.player.x, this.player.y, "#3b82f6", "#1e3a8b");
    this.drawTank(this.enemy.x, this.enemy.y, "#dc2626", "#7f1d1d");

    if (this.phase === "aim") {
      const rad = (this.angle * Math.PI) / 180;
      const len = 28;
      this.ctx.strokeStyle = "#f8fafc";
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(this.player.x, this.player.y - 14);
      this.ctx.lineTo(this.player.x + Math.cos(rad) * len, this.player.y - 14 - Math.sin(rad) * len);
      this.ctx.stroke();
    }

    if (this.projectile) {
      this.ctx.fillStyle = "#facc15";
      this.ctx.beginPath();
      this.ctx.arc(this.projectile.x, this.projectile.y, 5, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.fillStyle = "#f8fafc";
    this.ctx.font = "14px sans-serif";
    this.ctx.textAlign = "left";
    this.ctx.fillText(`Vida: ${this.player.health}`, 10, 20);
    this.ctx.textAlign = "right";
    this.ctx.fillText(`Inimigo: ${this.enemy.health}`, this.canvas.width - 10, 20);
    this.ctx.textAlign = "left";
    if (this.phase === "aim") {
      this.ctx.fillText(`Ângulo: ${Math.round(this.angle)}° Potência: ${Math.round(this.power)}`, 10, this.canvas.height - 10);
    }
  }

  drawTank(x, y, bodyColor, darkColor) {
    // Tracks
    this.ctx.fillStyle = darkColor;
    this.ctx.beginPath();
    this.ctx.roundRect(x - 18, y - 6, 36, 8, 4);
    this.ctx.fill();

    // Hull
    this.ctx.fillStyle = bodyColor;
    this.ctx.beginPath();
    this.ctx.roundRect(x - 15, y - 14, 30, 10, 3);
    this.ctx.fill();

    // Turret
    this.ctx.beginPath();
    this.ctx.arc(x, y - 16, 7, 0, Math.PI * 2);
    this.ctx.fill();
  }
}
