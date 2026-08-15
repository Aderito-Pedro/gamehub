export default class Game2048 {
  constructor(canvas, onScoreUpdate, onGameOver) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.onScoreUpdate = onScoreUpdate;
    this.onGameOver = onGameOver;

    this.size = 4;
    this.grid = [];
    this.score = 0;
    this.running = false;
    this.cellSize = this.canvas.width / this.size;

    this.setupInput();
    this.resetGame();
  }

  setupInput() {
    window.addEventListener("keydown", (e) => {
      if (!this.running) return;
      let moved = false;
      if (e.key === "ArrowLeft") { moved = this.moveLeft(); e.preventDefault(); }
      if (e.key === "ArrowRight") { moved = this.moveRight(); e.preventDefault(); }
      if (e.key === "ArrowUp") { moved = this.moveUp(); e.preventDefault(); }
      if (e.key === "ArrowDown") { moved = this.moveDown(); e.preventDefault(); }

      if (moved) {
        this.addRandomTile();
        this.onScoreUpdate(this.score);
        this.render();
        if (this.isGameOver()) {
          this.running = false;
          this.onGameOver(this.score);
        }
      }
    });
  }

  resetGame() {
    this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
    this.score = 0;
    this.addRandomTile();
    this.addRandomTile();
  }

  start() {
    this.running = true;
    this.render();
  }

  stop() {
    this.running = false;
  }

  addRandomTile() {
    const emptyCells = [];
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.grid[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length > 0) {
      const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      this.grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
  }

  slide(row) {
    let arr = row.filter(val => val);
    let missing = this.size - arr.length;
    let zeros = Array(missing).fill(0);
    return arr.concat(zeros);
  }

  combine(row) {
    for (let i = 0; i < this.size - 1; i++) {
      if (row[i] !== 0 && row[i] === row[i + 1]) {
        row[i] *= 2;
        this.score += row[i];
        row[i + 1] = 0;
      }
    }
    return row;
  }

  moveLeft() {
    let moved = false;
    for (let r = 0; r < this.size; r++) {
      let row = this.grid[r];
      let newRow = this.slide(this.combine(this.slide(row)));
      if (JSON.stringify(row) !== JSON.stringify(newRow)) moved = true;
      this.grid[r] = newRow;
    }
    return moved;
  }

  moveRight() {
    let moved = false;
    for (let r = 0; r < this.size; r++) {
      let row = [...this.grid[r]].reverse();
      let newRow = this.slide(this.combine(this.slide(row)));
      newRow.reverse();
      if (JSON.stringify(this.grid[r]) !== JSON.stringify(newRow)) moved = true;
      this.grid[r] = newRow;
    }
    return moved;
  }

  rotateGrid() {
    let temp = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        temp[c][this.size - 1 - r] = this.grid[r][c];
      }
    }
    this.grid = temp;
  }

  moveUp() {
    // Rotate counter-clockwise to treat as moveLeft
    this.rotateGrid();
    this.rotateGrid();
    this.rotateGrid();
    let moved = this.moveLeft();
    this.rotateGrid(); // Rotate back
    return moved;
  }

  moveDown() {
    this.rotateGrid();
    let moved = this.moveLeft();
    this.rotateGrid();
    this.rotateGrid();
    this.rotateGrid();
    return moved;
  }

  isGameOver() {
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.grid[r][c] === 0) return false;
        if (r < this.size - 1 && this.grid[r][c] === this.grid[r + 1][c]) return false;
        if (c < this.size - 1 && this.grid[r][c] === this.grid[r][c + 1]) return false;
      }
    }
    return true;
  }

  render() {
    this.ctx.fillStyle = "#bbada0";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const val = this.grid[r][c];
        const x = c * this.cellSize + 8;
        const y = r * this.cellSize + 8;
        const w = this.cellSize - 16;
        const h = this.cellSize - 16;

        this.ctx.fillStyle = this.getTileColor(val);
        this.ctx.fillRect(x, y, w, h);

        if (val > 0) {
          this.ctx.fillStyle = val <= 4 ? "#776e65" : "#f9f6f2";
          this.ctx.font = "bold 32px sans-serif";
          this.ctx.textAlign = "center";
          this.ctx.textBaseline = "middle";
          this.ctx.fillText(val, x + w / 2, y + h / 2);
        }
      }
    }
  }

  getTileColor(val) {
    const colors = {
      0: "#cdc1b4",
      2: "#eee4da",
      4: "#ede0c8",
      8: "#f2b179",
      16: "#f59563",
      32: "#f67c5f",
      64: "#f65e3b",
      128: "#edcf72",
      256: "#edcc61",
      512: "#edc850",
      1024: "#edc53f",
      2048: "#edc22e"
    };
    return colors[val] || "#3c3a32";
  }
}