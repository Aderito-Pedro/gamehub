export default class BombArenaGame {
  constructor(canvas, onScoreUpdate, onGameOver) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.onScoreUpdate = onScoreUpdate;
    this.onGameOver = onGameOver;

    this.cols = 13;
    this.rows = 13;
    this.cellSize = Math.floor(Math.min(canvas.width / this.cols, canvas.height / this.rows));
    this.offsetX = (canvas.width - this.cols * this.cellSize) / 2;
    this.offsetY = (canvas.height - this.rows * this.cellSize) / 2;

    this.running = false;
    this.gameInterval = null;
    this.speed = 160;
    this.blastRadius = 2;
    this.fuseTicks = 7;
    this.explosionTicks = 3;

    this.setupInput();
    this.resetGame();
  }

  setupInput() {
    this.handleKeyDown = (e) => {
      if (!this.running) return;
      if (e.key === "ArrowLeft") { this.nextDir = { x: -1, y: 0 }; e.preventDefault(); }
      if (e.key === "ArrowRight") { this.nextDir = { x: 1, y: 0 }; e.preventDefault(); }
      if (e.key === "ArrowUp") { this.nextDir = { x: 0, y: -1 }; e.preventDefault(); }
      if (e.key === "ArrowDown") { this.nextDir = { x: 0, y: 1 }; e.preventDefault(); }
      if (e.key === " ") { this.placeBomb(); e.preventDefault(); }
    };
    window.addEventListener("keydown", this.handleKeyDown);
  }

  destroy() {
    this.stop();
    window.removeEventListener("keydown", this.handleKeyDown);
  }

  buildGrid() {
    const { cols, rows } = this;
    const grid = Array.from({ length: rows }, () => Array(cols).fill(0));
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (x === 0 || y === 0 || x === cols - 1 || y === rows - 1 || (x % 2 === 0 && y % 2 === 0)) {
          grid[y][x] = 1;
        }
      }
    }
    return grid;
  }

  resetGame() {
    this.hardWalls = this.buildGrid();
    this.softWalls = Array.from({ length: this.rows }, () => Array(this.cols).fill(false));

    for (let y = 1; y < this.rows - 1; y++) {
      for (let x = 1; x < this.cols - 1; x++) {
        if (this.hardWalls[y][x]) continue;
        if (Math.random() < 0.55) this.softWalls[y][x] = true;
      }
    }

    this.player = { x: 1, y: 1, alive: true };
    this.dir = { x: 0, y: 0 };
    this.nextDir = { x: 0, y: 0 };

    this.enemies = [
      { x: this.cols - 2, y: this.rows - 2, alive: true, emoji: "👹" },
      { x: this.cols - 2, y: 1, alive: true, emoji: "👽" },
    ];

    // Guarantee every spawn point and its immediate neighbors are walkable,
    // regardless of the random soft-wall fill above.
    const clearAround = (cx, cy) => {
      const spots = [[cx, cy], [cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]];
      for (const [x, y] of spots) {
        if (x >= 0 && x < this.cols && y >= 0 && y < this.rows && !this.hardWalls[y][x]) {
          this.softWalls[y][x] = false;
        }
      }
    };
    clearAround(this.player.x, this.player.y);
    for (const enemy of this.enemies) clearAround(enemy.x, enemy.y);

    this.bombs = [];
    this.explosions = [];
    this.score = 0;
  }

  start() {
    this.running = true;
    clearInterval(this.gameInterval);
    this.gameInterval = setInterval(() => this.tick(), this.speed);
    this.render();
  }

  stop() {
    this.running = false;
    clearInterval(this.gameInterval);
  }

  isWalkable(x, y) {
    if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return false;
    if (this.hardWalls[y][x] || this.softWalls[y][x]) return false;
    if (this.bombs.some((b) => b.x === x && b.y === y)) return false;
    return true;
  }

  placeBomb() {
    if (this.bombs.some((b) => b.x === this.player.x && b.y === this.player.y)) return;
    this.bombs.push({ x: this.player.x, y: this.player.y, fuse: this.fuseTicks });
  }

  explodeBomb(bomb) {
    const cells = [{ x: bomb.x, y: bomb.y }];
    const dirs = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
    for (const d of dirs) {
      for (let i = 1; i <= this.blastRadius; i++) {
        const x = bomb.x + d.x * i;
        const y = bomb.y + d.y * i;
        if (x < 0 || x >= this.cols || y < 0 || y >= this.rows || this.hardWalls[y][x]) break;
        cells.push({ x, y });
        if (this.softWalls[y][x]) {
          this.softWalls[y][x] = false;
          break;
        }
      }
    }
    this.explosions.push({ cells, ticks: this.explosionTicks });
  }

  tick() {
    if (this.isWalkable(this.player.x + this.nextDir.x, this.player.y + this.nextDir.y)) {
      this.dir = this.nextDir;
    }
    const nx = this.player.x + this.dir.x;
    const ny = this.player.y + this.dir.y;
    if (this.isWalkable(nx, ny)) {
      this.player.x = nx;
      this.player.y = ny;
    }

    // Catch check before enemies wander: an enemy with an open neighbor will
    // always move, so if the player just walked onto its cell and we only
    // checked after this loop, it could shuffle off before ever registering.
    if (this.enemies.some((e) => e.alive && e.x === this.player.x && e.y === this.player.y)) {
      this.player.alive = false;
    }

    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const dirs = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }].filter((d) =>
        this.isWalkable(enemy.x + d.x, enemy.y + d.y)
      );
      if (dirs.length > 0) {
        const choice = dirs[Math.floor(Math.random() * dirs.length)];
        enemy.x += choice.x;
        enemy.y += choice.y;
      }
    }

    for (const bomb of this.bombs) bomb.fuse -= 1;
    const exploding = this.bombs.filter((b) => b.fuse <= 0);
    this.bombs = this.bombs.filter((b) => b.fuse > 0);
    for (const bomb of exploding) this.explodeBomb(bomb);

    for (const explosion of this.explosions) {
      for (const cell of explosion.cells) {
        if (this.player.alive && this.player.x === cell.x && this.player.y === cell.y) {
          this.player.alive = false;
        }
        for (const enemy of this.enemies) {
          if (enemy.alive && enemy.x === cell.x && enemy.y === cell.y) {
            enemy.alive = false;
            this.score += 50;
            this.onScoreUpdate(this.score);
          }
        }
      }
    }

    for (const explosion of this.explosions) explosion.ticks -= 1;
    this.explosions = this.explosions.filter((e) => e.ticks > 0);

    if (this.enemies.some((e) => e.alive && e.x === this.player.x && e.y === this.player.y)) {
      this.player.alive = false;
    }

    if (!this.player.alive) {
      this.endGame();
      return;
    }

    if (this.enemies.every((e) => !e.alive)) {
      this.score += 100;
      this.onScoreUpdate(this.score);
      this.endGame();
      return;
    }

    this.render();
  }

  endGame() {
    this.stop();
    this.onGameOver(this.score);
  }

  render() {
    this.ctx.fillStyle = "#111827";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    this.ctx.translate(this.offsetX, this.offsetY);

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.hardWalls[y][x]) {
          this.ctx.fillStyle = "#374151";
          this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
        } else if (this.softWalls[y][x]) {
          this.ctx.fillStyle = "#a16207";
          this.ctx.fillRect(x * this.cellSize + 1, y * this.cellSize + 1, this.cellSize - 2, this.cellSize - 2);
        }
      }
    }

    for (const bomb of this.bombs) {
      const cx = bomb.x * this.cellSize + this.cellSize / 2;
      const cy = bomb.y * this.cellSize + this.cellSize / 2;
      this.drawAvatar("💣", cx, cy);
    }

    for (const explosion of this.explosions) {
      this.ctx.fillStyle = "rgba(251,146,60,0.85)";
      for (const cell of explosion.cells) {
        this.ctx.fillRect(cell.x * this.cellSize + 2, cell.y * this.cellSize + 2, this.cellSize - 4, this.cellSize - 4);
      }
    }

    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const cx = enemy.x * this.cellSize + this.cellSize / 2;
      const cy = enemy.y * this.cellSize + this.cellSize / 2;
      this.drawAvatar(enemy.emoji, cx, cy);
    }

    if (this.player.alive) {
      const cx = this.player.x * this.cellSize + this.cellSize / 2;
      const cy = this.player.y * this.cellSize + this.cellSize / 2;
      this.drawAvatar("🙂", cx, cy);
    }

    this.ctx.restore();
  }

  drawAvatar(emoji, cx, cy) {
    this.ctx.font = `${Math.floor(this.cellSize * 0.85)}px sans-serif`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(emoji, cx, cy);
  }
}
