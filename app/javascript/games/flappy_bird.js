export default class FlappyBirdGame {
  constructor(canvas, onScoreUpdate, onGameOver) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.onScoreUpdate = onScoreUpdate;
    this.onGameOver = onGameOver;

    this.gravity = 0.45;
    this.flapStrength = -7.5;
    this.pipeWidth = 60;
    this.gapHeight = 130;
    this.pipeSpeed = 2.8;
    this.pipeInterval = 100;

    this.running = false;

    this.setupInput();
    this.resetGame();
  }

  setupInput() {
    this.handleKeyDown = (e) => {
      if (e.key === " " || e.key === "ArrowUp") {
        e.preventDefault();
        this.flap();
      }
    };
    this.handleFlapEvent = () => this.flap();

    window.addEventListener("keydown", this.handleKeyDown);
    this.canvas.addEventListener("mousedown", this.handleFlapEvent);
    this.canvas.addEventListener("touchstart", this.handleFlapEvent);
  }

  destroy() {
    this.stop();
    window.removeEventListener("keydown", this.handleKeyDown);
    this.canvas.removeEventListener("mousedown", this.handleFlapEvent);
    this.canvas.removeEventListener("touchstart", this.handleFlapEvent);
  }

  flap() {
    if (!this.running) return;
    this.bird.velocity = this.flapStrength;
  }

  resetGame() {
    this.bird = { x: 90, y: this.canvas.height / 2, velocity: 0, radius: 14 };
    this.pipes = [];
    this.score = 0;
    this.frame = 0;
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

  spawnPipe() {
    const margin = 40;
    const gapY = margin + Math.random() * (this.canvas.height - margin * 2 - this.gapHeight);
    this.pipes.push({ x: this.canvas.width, gapY, passed: false });
  }

  update() {
    this.bird.velocity += this.gravity;
    this.bird.y += this.bird.velocity;

    this.frame++;
    if (this.frame % this.pipeInterval === 0) this.spawnPipe();

    for (const pipe of this.pipes) {
      pipe.x -= this.pipeSpeed;

      if (!pipe.passed && pipe.x + this.pipeWidth < this.bird.x) {
        pipe.passed = true;
        this.score += 1;
        this.onScoreUpdate(this.score);
      }
    }
    this.pipes = this.pipes.filter((p) => p.x + this.pipeWidth > 0);

    if (this.bird.y - this.bird.radius < 0 || this.bird.y + this.bird.radius > this.canvas.height) {
      this.endGame();
      return;
    }

    for (const pipe of this.pipes) {
      const withinX = this.bird.x + this.bird.radius > pipe.x && this.bird.x - this.bird.radius < pipe.x + this.pipeWidth;
      if (!withinX) continue;
      const withinGap = this.bird.y - this.bird.radius > pipe.gapY && this.bird.y + this.bird.radius < pipe.gapY + this.gapHeight;
      if (!withinGap) {
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
    this.ctx.fillStyle = "#1e3a5f";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = "#22c55e";
    for (const pipe of this.pipes) {
      this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.gapY);
      this.ctx.fillRect(pipe.x, pipe.gapY + this.gapHeight, this.pipeWidth, this.canvas.height - (pipe.gapY + this.gapHeight));
    }

    const tilt = Math.max(-0.5, Math.min(0.9, this.bird.velocity * 0.06));
    this.ctx.save();
    this.ctx.translate(this.bird.x, this.bird.y);
    this.ctx.rotate(tilt);
    this.ctx.font = `${Math.floor(this.bird.radius * 2.4)}px sans-serif`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText("🐦", 0, 0);
    this.ctx.restore();
  }
}
