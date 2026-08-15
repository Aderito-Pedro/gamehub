export default class PlatformHeroGame {
  constructor(canvas, onScoreUpdate, onGameOver) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.onScoreUpdate = onScoreUpdate;
    this.onGameOver = onGameOver;

    this.gravity = 0.6;
    this.maxFallSpeed = 13;
    this.jumpForce = -11;
    this.moveSpeed = 3.6;
    this.keys = {};
    this.running = false;

    this.levelWidth = 3000;
    this.groundY = canvas.height - 40;

    this.setupInput();
    this.resetGame();
  }

  setupInput() {
    this.handleKeyDown = (e) => {
      this.keys[e.key] = true;
      if (["ArrowLeft", "ArrowRight", "ArrowUp", " "].includes(e.key)) e.preventDefault();
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

  buildLevel() {
    const g = this.groundY;

    this.groundSegments = [
      { x: 0, width: 500 },
      { x: 600, width: 400 },
      { x: 1100, width: 300 },
      { x: 1500, width: 600 },
      { x: 2200, width: 800 },
    ];

    this.platforms = [
      { x: 250, y: g - 110, width: 120 },
      { x: 700, y: g - 140, width: 120 },
      { x: 1150, y: g - 100, width: 100 },
      { x: 1650, y: g - 150, width: 140 },
      { x: 2000, y: g - 90, width: 140 },
      { x: 2400, y: g - 130, width: 120 },
    ];

    this.enemies = [
      { x: 650, minX: 600, maxX: 1000, y: g - 32, width: 28, height: 32, dir: 1, alive: true },
      { x: 1550, minX: 1500, maxX: 1900, y: g - 32, width: 28, height: 32, dir: 1, alive: true },
      { x: 2300, minX: 2200, maxX: 2700, y: g - 32, width: 28, height: 32, dir: -1, alive: true },
    ];

    this.coins = [];
    const coinSpots = [300, 720, 1170, 1670, 2020, 2420, 900, 1750, 2600];
    for (const x of coinSpots) {
      this.coins.push({ x, y: g - 160, collected: false });
    }

    this.flag = { x: this.levelWidth - 80, y: g - 120, width: 20, height: 120 };
  }

  allSolids() {
    const solids = [];
    for (const s of this.groundSegments) {
      solids.push({ x: s.x, y: this.groundY, width: s.width, height: this.canvas.height - this.groundY });
    }
    for (const p of this.platforms) {
      solids.push({ x: p.x, y: p.y, width: p.width, height: 16 });
    }
    return solids;
  }

  resetGame() {
    this.buildLevel();
    this.player = { x: 40, y: this.groundY - 40, width: 26, height: 40, vx: 0, vy: 0, onGround: false };
    this.camera = 0;
    this.score = 0;
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

  rectsOverlap(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  }

  update() {
    const p = this.player;

    if (this.keys["ArrowLeft"]) p.vx = -this.moveSpeed;
    else if (this.keys["ArrowRight"]) p.vx = this.moveSpeed;
    else p.vx = 0;

    if ((this.keys["ArrowUp"] || this.keys[" "]) && p.onGround) {
      p.vy = this.jumpForce;
      p.onGround = false;
    }

    p.vy = Math.min(p.vy + this.gravity, this.maxFallSpeed);

    const solids = this.allSolids();

    p.x += p.vx;
    for (const s of solids) {
      if (this.rectsOverlap(p, s)) {
        if (p.vx > 0) p.x = s.x - p.width;
        else if (p.vx < 0) p.x = s.x + s.width;
      }
    }
    p.x = Math.max(0, Math.min(this.levelWidth - p.width, p.x));

    p.y += p.vy;
    p.onGround = false;
    for (const s of solids) {
      if (this.rectsOverlap(p, s)) {
        if (p.vy > 0) {
          p.y = s.y - p.height;
          p.vy = 0;
          p.onGround = true;
        } else if (p.vy < 0) {
          p.y = s.y + s.height;
          p.vy = 0;
        }
      }
    }

    if (p.y > this.canvas.height + 100) {
      this.endGame();
      return;
    }

    for (const coin of this.coins) {
      if (coin.collected) continue;
      const coinBox = { x: coin.x - 8, y: coin.y - 8, width: 16, height: 16 };
      if (this.rectsOverlap(p, coinBox)) {
        coin.collected = true;
        this.score += 20;
        this.onScoreUpdate(this.score);
      }
    }

    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      enemy.x += enemy.dir * 1.6;
      if (enemy.x < enemy.minX || enemy.x > enemy.maxX) enemy.dir *= -1;

      if (this.rectsOverlap(p, enemy)) {
        if (p.vy > 0 && p.y + p.height - enemy.y < 16) {
          enemy.alive = false;
          p.vy = this.jumpForce * 0.6;
          this.score += 50;
          this.onScoreUpdate(this.score);
        } else {
          this.endGame();
          return;
        }
      }
    }

    if (this.rectsOverlap(p, this.flag)) {
      this.score += 200;
      this.onScoreUpdate(this.score);
      this.endGame();
      return;
    }

    this.camera = Math.max(0, Math.min(this.levelWidth - this.canvas.width, p.x - this.canvas.width / 3));
  }

  endGame() {
    this.stop();
    this.onGameOver(this.score);
  }

  render() {
    this.ctx.fillStyle = "#7dd3fc";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    this.ctx.translate(-this.camera, 0);

    this.ctx.fillStyle = "#166534";
    for (const s of this.groundSegments) {
      this.ctx.fillRect(s.x, this.groundY, s.width, this.canvas.height - this.groundY);
    }

    this.ctx.fillStyle = "#78350f";
    for (const p of this.platforms) {
      this.ctx.fillRect(p.x, p.y, p.width, 16);
    }

    for (const coin of this.coins) {
      if (coin.collected) continue;
      this.drawAvatar("🪙", coin.x, coin.y, 20);
    }

    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      this.drawAvatar("👾", enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.height + 8);
    }

    this.ctx.fillStyle = "#f8fafc";
    this.ctx.fillRect(this.flag.x, this.flag.y, 4, this.flag.height);
    this.drawAvatar("🏁", this.flag.x + 14, this.flag.y + 12, 26);

    this.drawAvatar("🦸", this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, this.player.height + 10);

    this.ctx.restore();
  }

  drawAvatar(emoji, cx, cy, size) {
    this.ctx.font = `${Math.floor(size)}px sans-serif`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(emoji, cx, cy);
  }
}
