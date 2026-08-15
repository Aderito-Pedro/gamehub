export default class BreakoutGame {
  constructor(canvas, onScoreUpdate, onGameOver) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.onScoreUpdate = onScoreUpdate;
    this.onGameOver = onGameOver;

    this.paddle = { width: 90, height: 12, x: 0, y: canvas.height - 30, speed: 7 };
    this.keys = {};
    this.running = false;

    this.rows = 5;
    this.cols = 8;
    this.brickGap = 6;
    this.brickWidth = Math.floor((canvas.width * 0.92 - (this.cols - 1) * this.brickGap) / this.cols);
    this.brickHeight = 18;
    this.brickOffsetTop = 40;
    this.brickOffsetLeft = (canvas.width - (this.cols * (this.brickWidth + this.brickGap) - this.brickGap)) / 2;
    this.brickColors = ["#f87171", "#fb923c", "#facc15", "#4ade80", "#60a5fa"];

    this.setupInput();
    this.resetGame();
  }

  setupInput() {
    this.handleKeyDown = (e) => {
      this.keys[e.key] = true;
      if (["ArrowLeft", "ArrowRight"].includes(e.key)) e.preventDefault();
    };
    this.handleKeyUp = (e) => {
      this.keys[e.key] = false;
    };
    this.handleMouseMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scale = this.canvas.width / rect.width;
      const x = (e.clientX - rect.left) * scale;
      this.paddle.x = Math.min(Math.max(0, x - this.paddle.width / 2), this.canvas.width - this.paddle.width);
    };

    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
    this.canvas.addEventListener("mousemove", this.handleMouseMove);
  }

  destroy() {
    this.stop();
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    this.canvas.removeEventListener("mousemove", this.handleMouseMove);
  }

  resetGame() {
    this.paddle.x = (this.canvas.width - this.paddle.width) / 2;
    this.score = 0;
    this.lives = 3;
    this.bricks = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        this.bricks.push({
          x: this.brickOffsetLeft + c * (this.brickWidth + this.brickGap),
          y: this.brickOffsetTop + r * (this.brickHeight + this.brickGap),
          alive: true,
          color: this.brickColors[r % this.brickColors.length],
        });
      }
    }
    this.resetBall();
  }

  resetBall() {
    this.ball = {
      x: this.canvas.width / 2,
      y: this.paddle.y - 20,
      dx: (Math.random() > 0.5 ? 1 : -1) * 3.2,
      dy: -3.6,
      radius: 8,
    };
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

  update() {
    if (this.keys["ArrowLeft"]) this.paddle.x = Math.max(0, this.paddle.x - this.paddle.speed);
    if (this.keys["ArrowRight"]) this.paddle.x = Math.min(this.canvas.width - this.paddle.width, this.paddle.x + this.paddle.speed);

    this.ball.x += this.ball.dx;
    this.ball.y += this.ball.dy;

    if (this.ball.x - this.ball.radius < 0) {
      this.ball.x = this.ball.radius;
      this.ball.dx *= -1;
    } else if (this.ball.x + this.ball.radius > this.canvas.width) {
      this.ball.x = this.canvas.width - this.ball.radius;
      this.ball.dx *= -1;
    }
    if (this.ball.y - this.ball.radius < 0) {
      this.ball.y = this.ball.radius;
      this.ball.dy *= -1;
    }

    if (
      this.ball.dy > 0 &&
      this.ball.y + this.ball.radius > this.paddle.y &&
      this.ball.y + this.ball.radius < this.paddle.y + this.paddle.height + 12 &&
      this.ball.x > this.paddle.x &&
      this.ball.x < this.paddle.x + this.paddle.width
    ) {
      this.ball.y = this.paddle.y - this.ball.radius;
      this.ball.dy *= -1;
      const hitPos = (this.ball.x - (this.paddle.x + this.paddle.width / 2)) / (this.paddle.width / 2);
      this.ball.dx = hitPos * 4.5;
    }

    for (const brick of this.bricks) {
      if (!brick.alive) continue;
      if (
        this.ball.x + this.ball.radius > brick.x &&
        this.ball.x - this.ball.radius < brick.x + this.brickWidth &&
        this.ball.y + this.ball.radius > brick.y &&
        this.ball.y - this.ball.radius < brick.y + this.brickHeight
      ) {
        brick.alive = false;
        this.ball.dy *= -1;
        this.score += 10;
        this.onScoreUpdate(this.score);
        break;
      }
    }

    if (this.ball.y - this.ball.radius > this.canvas.height) {
      this.lives -= 1;
      if (this.lives <= 0) {
        this.stop();
        this.onGameOver(this.score);
        return;
      }
      this.resetBall();
    }

    if (this.bricks.every((b) => !b.alive)) {
      this.stop();
      this.onGameOver(this.score);
    }
  }

  render() {
    this.ctx.fillStyle = "#0f172a";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (const brick of this.bricks) {
      if (!brick.alive) continue;
      this.ctx.fillStyle = brick.color;
      this.ctx.beginPath();
      this.ctx.roundRect(brick.x, brick.y, this.brickWidth, this.brickHeight, 4);
      this.ctx.fill();
    }

    this.ctx.fillStyle = "#e2e8f0";
    this.ctx.beginPath();
    this.ctx.roundRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height, this.paddle.height / 2);
    this.ctx.fill();

    this.ctx.fillStyle = "#38bdf8";
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = "#e2e8f0";
    this.ctx.font = "14px sans-serif";
    this.ctx.textAlign = "left";
    this.ctx.fillText(`Vidas: ${this.lives}`, 10, 20);
  }
}
