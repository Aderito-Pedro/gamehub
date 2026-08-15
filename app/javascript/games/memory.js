export default class MemoryGame {
  constructor(canvas, onScoreUpdate, onGameOver) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.onScoreUpdate = onScoreUpdate;
    this.onGameOver = onGameOver;

    this.cols = 4;
    this.rows = 4;
    this.cellSize = this.canvas.width / this.cols;
    this.symbols = ["🍎", "🍌", "🍇", "🍉", "🐸", "🐵", "🚀", "⭐"];

    this.running = false;
    this.busy = false;

    this.setupInput();
    this.resetGame();
  }

  setupInput() {
    this.handleClick = (e) => {
      if (!this.running || this.busy) return;
      const rect = this.canvas.getBoundingClientRect();
      const scale = this.canvas.width / rect.width;
      const x = (e.clientX - rect.left) * scale;
      const y = (e.clientY - rect.top) * scale;
      const col = Math.floor(x / this.cellSize);
      const row = Math.floor(y / this.cellSize);
      this.reveal(row * this.cols + col);
    };
    this.canvas.addEventListener("click", this.handleClick);
  }

  destroy() {
    this.stop();
    this.canvas.removeEventListener("click", this.handleClick);
  }

  resetGame() {
    const deck = [...this.symbols, ...this.symbols];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    this.cards = deck.map((symbol) => ({ symbol, revealed: false, matched: false }));
    this.selected = [];
    this.attempts = 0;
    this.matches = 0;
    this.score = 0;
    this.busy = false;
  }

  start() {
    this.running = true;
    this.render();
  }

  stop() {
    this.running = false;
  }

  reveal(index) {
    if (index < 0 || index >= this.cards.length) return;
    const card = this.cards[index];
    if (card.revealed || card.matched) return;

    card.revealed = true;
    this.selected.push(index);
    this.render();

    if (this.selected.length === 2) {
      this.busy = true;
      this.attempts += 1;
      const [a, b] = this.selected;

      if (this.cards[a].symbol === this.cards[b].symbol) {
        this.cards[a].matched = true;
        this.cards[b].matched = true;
        this.matches += 1;
        this.score += 100;
        this.onScoreUpdate(this.score);
        this.selected = [];
        this.busy = false;
        this.render();

        if (this.matches === this.symbols.length) {
          const extraAttempts = Math.max(0, this.attempts - this.symbols.length);
          const bonus = Math.max(0, 200 - extraAttempts * 20);
          this.score += bonus;
          this.onScoreUpdate(this.score);
          this.stop();
          this.onGameOver(this.score);
        }
      } else {
        setTimeout(() => {
          this.cards[a].revealed = false;
          this.cards[b].revealed = false;
          this.selected = [];
          this.busy = false;
          this.render();
        }, 700);
      }
    }
  }

  render() {
    this.ctx.fillStyle = "#0f172a";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.cards.forEach((card, index) => {
      const col = index % this.cols;
      const row = Math.floor(index / this.cols);
      const x = col * this.cellSize;
      const y = row * this.cellSize;
      const pad = 6;

      this.ctx.fillStyle = card.matched ? "#166534" : (card.revealed ? "#334155" : "#1e293b");
      this.ctx.fillRect(x + pad, y + pad, this.cellSize - pad * 2, this.cellSize - pad * 2);

      this.ctx.strokeStyle = "rgba(255,255,255,0.08)";
      this.ctx.strokeRect(x + pad, y + pad, this.cellSize - pad * 2, this.cellSize - pad * 2);

      if (card.revealed || card.matched) {
        this.ctx.font = `${Math.floor(this.cellSize * 0.45)}px sans-serif`;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(card.symbol, x + this.cellSize / 2, y + this.cellSize / 2);
      }
    });
  }
}
