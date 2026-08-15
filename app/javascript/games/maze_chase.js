export default class MazeChaseGame {
  constructor(canvas, onScoreUpdate, onGameOver) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.onScoreUpdate = onScoreUpdate;
    this.onGameOver = onGameOver;

    this.cols = 15;
    this.rows = 17;
    this.cellSize = Math.floor(Math.min(canvas.width / this.cols, canvas.height / this.rows));
    this.offsetX = (canvas.width - this.cols * this.cellSize) / 2;
    this.offsetY = (canvas.height - this.rows * this.cellSize) / 2;

    this.running = false;
    this.gameInterval = null;
    this.speed = 180;

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
    };
    window.addEventListener("keydown", this.handleKeyDown);
  }

  destroy() {
    this.stop();
    window.removeEventListener("keydown", this.handleKeyDown);
  }

  buildMaze() {
    const { cols, rows } = this;
    const grid = Array.from({ length: rows }, () => Array(cols).fill(0));
    for (let c = 0; c < cols; c++) { grid[0][c] = 1; grid[rows - 1][c] = 1; }
    for (let r = 0; r < rows; r++) { grid[r][0] = 1; grid[r][cols - 1] = 1; }
    for (let r = 2; r < rows - 2; r += 3) {
      for (let c = 2; c < cols - 2; c += 3) {
        grid[r][c] = 1;
        if (c + 1 < cols - 1) grid[r][c + 1] = 1;
      }
    }
    return grid;
  }

  isOpen(x, y) {
    if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return false;
    return this.maze[y][x] === 0;
  }

  resetGame() {
    this.maze = this.buildMaze();
    this.dots = new Set();
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.maze[y][x] === 0) this.dots.add(`${x},${y}`);
      }
    }

    this.player = { x: 1, y: 1 };
    this.dots.delete(`${this.player.x},${this.player.y}`);
    this.dir = { x: 0, y: 0 };
    this.nextDir = { x: 0, y: 0 };

    const ghostSpots = [
      { x: this.cols - 2, y: this.rows - 2 },
      { x: this.cols - 2, y: 1 },
      { x: 1, y: this.rows - 2 },
    ];
    this.ghosts = ghostSpots.map((pos, i) => ({
      ...pos,
      emoji: ["👻", "👹", "👽"][i % 3],
    }));

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

  tick() {
    if (this.isOpen(this.player.x + this.nextDir.x, this.player.y + this.nextDir.y)) {
      this.dir = this.nextDir;
    }
    const nx = this.player.x + this.dir.x;
    const ny = this.player.y + this.dir.y;
    if (this.isOpen(nx, ny)) {
      this.player.x = nx;
      this.player.y = ny;
    }

    const key = `${this.player.x},${this.player.y}`;
    if (this.dots.has(key)) {
      this.dots.delete(key);
      this.score += 10;
      this.onScoreUpdate(this.score);
    }

    // Catch check before ghosts move too: a ghost must move every tick (it
    // never "stays"), so if we only checked after moveGhosts() a ghost that
    // the player just walked into would already have shuffled off that exact
    // cell by the time we looked, letting the player walk through it for free.
    if (this.ghosts.some((g) => g.x === this.player.x && g.y === this.player.y)) {
      this.endGame();
      return;
    }

    this.moveGhosts();

    if (this.ghosts.some((g) => g.x === this.player.x && g.y === this.player.y)) {
      this.endGame();
      return;
    }

    if (this.dots.size === 0) {
      this.score += 200;
      this.onScoreUpdate(this.score);
      this.endGame();
      return;
    }

    this.render();
  }

  moveGhosts() {
    for (const ghost of this.ghosts) {
      const options = [
        { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 },
      ].filter((d) => this.isOpen(ghost.x + d.x, ghost.y + d.y));

      if (options.length === 0) continue;

      options.sort((a, b) => {
        const da = Math.abs(ghost.x + a.x - this.player.x) + Math.abs(ghost.y + a.y - this.player.y);
        const db = Math.abs(ghost.x + b.x - this.player.x) + Math.abs(ghost.y + b.y - this.player.y);
        return da - db;
      });

      const choice = Math.random() < 0.75 ? options[0] : options[Math.floor(Math.random() * options.length)];
      ghost.x += choice.x;
      ghost.y += choice.y;
    }
  }

  endGame() {
    this.stop();
    this.onGameOver(this.score);
  }

  render() {
    this.ctx.fillStyle = "#0b1023";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    this.ctx.translate(this.offsetX, this.offsetY);

    this.ctx.fillStyle = "#1d3a8f";
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.maze[y][x] === 1) {
          this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
        }
      }
    }

    this.ctx.fillStyle = "#fef08a";
    for (const key of this.dots) {
      const [x, y] = key.split(",").map(Number);
      const cx = x * this.cellSize + this.cellSize / 2;
      const cy = y * this.cellSize + this.cellSize / 2;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, Math.max(2, this.cellSize * 0.08), 0, Math.PI * 2);
      this.ctx.fill();
    }

    for (const ghost of this.ghosts) {
      const cx = ghost.x * this.cellSize + this.cellSize / 2;
      const cy = ghost.y * this.cellSize + this.cellSize / 2;
      this.drawAvatar(ghost.emoji, cx, cy);
    }

    const px = this.player.x * this.cellSize + this.cellSize / 2;
    const py = this.player.y * this.cellSize + this.cellSize / 2;
    this.drawAvatar("😀", px, py);

    this.ctx.restore();
  }

  drawAvatar(emoji, cx, cy) {
    this.ctx.font = `${Math.floor(this.cellSize * 0.85)}px sans-serif`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(emoji, cx, cy);
  }
}
