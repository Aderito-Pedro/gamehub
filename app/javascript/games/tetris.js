export default class TetrisGame {
  constructor(canvas, onScoreUpdate, onGameOver) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.onScoreUpdate = onScoreUpdate;
    this.onGameOver = onGameOver;

    this.cols = 10;
    this.rows = 20;
    this.cellSize = Math.floor(Math.min(this.canvas.width / this.cols, this.canvas.height / this.rows));
    this.offsetX = (this.canvas.width - this.cols * this.cellSize) / 2;
    this.offsetY = (this.canvas.height - this.rows * this.cellSize) / 2;

    this.shapes = {
      I: { matrix: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], color: "#22d3ee" },
      O: { matrix: [[1, 1], [1, 1]], color: "#facc15" },
      T: { matrix: [[0, 1, 0], [1, 1, 1], [0, 0, 0]], color: "#a855f7" },
      S: { matrix: [[0, 1, 1], [1, 1, 0], [0, 0, 0]], color: "#4ade80" },
      Z: { matrix: [[1, 1, 0], [0, 1, 1], [0, 0, 0]], color: "#f87171" },
      J: { matrix: [[1, 0, 0], [1, 1, 1], [0, 0, 0]], color: "#60a5fa" },
      L: { matrix: [[0, 0, 1], [1, 1, 1], [0, 0, 0]], color: "#fb923c" },
    };

    this.running = false;
    this.gameInterval = null;
    this.speed = 650;

    this.setupInput();
    this.resetGame();
  }

  setupInput() {
    this.handleKeyDown = (e) => {
      if (!this.running) return;
      if (["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", " "].includes(e.key)) e.preventDefault();
      if (e.key === "ArrowLeft") this.move(-1);
      if (e.key === "ArrowRight") this.move(1);
      if (e.key === "ArrowDown") this.softDrop();
      if (e.key === "ArrowUp") this.rotate();
    };
    window.addEventListener("keydown", this.handleKeyDown);
  }

  destroy() {
    this.stop();
    window.removeEventListener("keydown", this.handleKeyDown);
  }

  resetGame() {
    this.board = Array.from({ length: this.rows }, () => Array(this.cols).fill(null));
    this.score = 0;
    this.speed = 650;
    this.spawnPiece();
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

  randomShapeKey() {
    const keys = Object.keys(this.shapes);
    return keys[Math.floor(Math.random() * keys.length)];
  }

  spawnPiece() {
    const key = this.randomShapeKey();
    const { matrix, color } = this.shapes[key];
    const width = matrix[0].length;
    this.current = {
      matrix,
      color,
      x: Math.floor((this.cols - width) / 2),
      y: 0,
    };

    if (this.collides(this.current.matrix, this.current.x, this.current.y)) {
      this.stop();
      this.onGameOver(this.score);
    }
  }

  collides(matrix, x, y) {
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (!matrix[r][c]) continue;
        const boardX = x + c;
        const boardY = y + r;
        if (boardX < 0 || boardX >= this.cols || boardY >= this.rows) return true;
        if (boardY >= 0 && this.board[boardY][boardX]) return true;
      }
    }
    return false;
  }

  move(dir) {
    const newX = this.current.x + dir;
    if (!this.collides(this.current.matrix, newX, this.current.y)) {
      this.current.x = newX;
      this.render();
    }
  }

  rotateMatrix(matrix) {
    const n = matrix.length;
    const rotated = Array.from({ length: n }, () => Array(n).fill(0));
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        rotated[c][n - 1 - r] = matrix[r][c];
      }
    }
    return rotated;
  }

  rotate() {
    const rotated = this.rotateMatrix(this.current.matrix);
    const kicks = [0, -1, 1, -2, 2];
    for (const kick of kicks) {
      if (!this.collides(rotated, this.current.x + kick, this.current.y)) {
        this.current.matrix = rotated;
        this.current.x += kick;
        this.render();
        return;
      }
    }
  }

  softDrop() {
    if (!this.collides(this.current.matrix, this.current.x, this.current.y + 1)) {
      this.current.y += 1;
      this.render();
    } else {
      this.lockPiece();
    }
  }

  tick() {
    if (!this.collides(this.current.matrix, this.current.x, this.current.y + 1)) {
      this.current.y += 1;
    } else {
      this.lockPiece();
    }
    this.render();
  }

  lockPiece() {
    const { matrix, x, y, color } = this.current;
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c]) {
          const boardY = y + r;
          const boardX = x + c;
          if (boardY >= 0) this.board[boardY][boardX] = color;
        }
      }
    }

    let cleared = 0;
    for (let r = this.rows - 1; r >= 0; r--) {
      if (this.board[r].every((cell) => cell)) {
        this.board.splice(r, 1);
        this.board.unshift(Array(this.cols).fill(null));
        cleared++;
        r++; // re-check the row that just shifted down into this index
      }
    }

    if (cleared > 0) {
      const points = [0, 100, 300, 500, 800][cleared] || cleared * 200;
      this.score += points;
      this.onScoreUpdate(this.score);

      if (this.speed > 200) {
        this.speed = Math.max(200, this.speed - cleared * 15);
        clearInterval(this.gameInterval);
        this.gameInterval = setInterval(() => this.tick(), this.speed);
      }
    }

    this.spawnPiece();
  }

  render() {
    this.ctx.fillStyle = "#0f172a";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    this.ctx.translate(this.offsetX, this.offsetY);

    this.ctx.strokeStyle = "rgba(255,255,255,0.06)";
    for (let r = 0; r <= this.rows; r++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, r * this.cellSize);
      this.ctx.lineTo(this.cols * this.cellSize, r * this.cellSize);
      this.ctx.stroke();
    }
    for (let c = 0; c <= this.cols; c++) {
      this.ctx.beginPath();
      this.ctx.moveTo(c * this.cellSize, 0);
      this.ctx.lineTo(c * this.cellSize, this.rows * this.cellSize);
      this.ctx.stroke();
    }

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.board[r][c]) this.drawCell(c, r, this.board[r][c]);
      }
    }

    if (this.current) {
      const { matrix, x, y, color } = this.current;
      for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
          if (matrix[r][c]) this.drawCell(x + c, y + r, color);
        }
      }
    }

    this.ctx.restore();
  }

  drawCell(col, row, color) {
    const x = col * this.cellSize;
    const y = row * this.cellSize;
    const pad = 1;
    const size = this.cellSize - pad * 2;

    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.roundRect(x + pad, y + pad, size, size, size * 0.2);
    this.ctx.fill();

    this.ctx.fillStyle = "rgba(255,255,255,0.25)";
    this.ctx.beginPath();
    this.ctx.roundRect(x + pad + 2, y + pad + 2, size - 4, size * 0.35, size * 0.15);
    this.ctx.fill();
  }
}
