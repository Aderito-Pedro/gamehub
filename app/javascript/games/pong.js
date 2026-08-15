export default class PongGame {
  constructor(canvas, onScoreUpdate, onGameOver) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.onScoreUpdate = onScoreUpdate;
    this.onGameOver = onGameOver;

    this.ball = { x: 0, y: 0, dx: 0, dy: 0, radius: 10 };
    this.player = { x: 10, y: 0, width: 12, height: 80, score: 0 };
    this.ai = { x: 0, y: 0, width: 12, height: 80, score: 0 };
    
    this.keys = {};
    this.running = false;
    
    this.setupInput();
    this.resetGame();
  }

  setupInput() {
    this.handleKeyDown = (e) => {
      this.keys[e.key] = true;
      if (["ArrowUp", "ArrowDown", " ", "w", "s", "W", "S"].includes(e.key)) {
        e.preventDefault();
      }
    };
    this.handleKeyUp = (e) => {
      this.keys[e.key] = false;
    };
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
  }

  destroy() {
    this.stop();
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
  }

  resetGame() {
    this.player.y = this.canvas.height / 2 - this.player.height / 2;
    this.ai.x = this.canvas.width - 22;
    this.ai.y = this.canvas.height / 2 - this.ai.height / 2;
    this.player.score = 0;
    this.ai.score = 0;
    this.resetBall();
  }

  resetBall() {
    this.ball.x = this.canvas.width / 2;
    this.ball.y = this.canvas.height / 2;
    this.ball.dx = (Math.random() > 0.5 ? 1 : -1) * 4;
    this.ball.dy = (Math.random() * 2 - 1) * 3;
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
    // Player movement
    if (this.keys["ArrowUp"] || this.keys["w"] || this.keys["W"]) {
      this.player.y = Math.max(0, this.player.y - 6);
    }
    if (this.keys["ArrowDown"] || this.keys["s"] || this.keys["S"]) {
      this.player.y = Math.min(this.canvas.height - this.player.height, this.player.y + 6);
    }

    // AI movement (Simple tracking)
    let aiSpeed = 3.8;
    let targetY = this.ball.y - this.ai.height / 2;
    if (this.ai.y < targetY) {
      this.ai.y = Math.min(this.canvas.height - this.ai.height, this.ai.y + aiSpeed);
    } else if (this.ai.y > targetY) {
      this.ai.y = Math.max(0, this.ai.y - aiSpeed);
    }

    // Ball movement
    this.ball.x += this.ball.dx;
    this.ball.y += this.ball.dy;

    // Wall collision (top / bottom)
    if (this.ball.y - this.ball.radius < 0) {
      this.ball.y = this.ball.radius;
      this.ball.dy *= -1;
    } else if (this.ball.y + this.ball.radius > this.canvas.height) {
      this.ball.y = this.canvas.height - this.ball.radius;
      this.ball.dy *= -1;
    }

    // Player collision
    if (this.ball.x - this.ball.radius < this.player.x + this.player.width &&
        this.ball.y > this.player.y &&
        this.ball.y < this.player.y + this.player.height) {
      this.ball.x = this.player.x + this.player.width + this.ball.radius;
      this.ball.dx *= -1.05; // Slightly speed up
      this.player.score += 1;
      this.onScoreUpdate(this.player.score);
    }

    // AI collision
    if (this.ball.x + this.ball.radius > this.ai.x &&
        this.ball.y > this.ai.y &&
        this.ball.y < this.ai.y + this.ai.height) {
      this.ball.x = this.ai.x - this.ball.radius;
      this.ball.dx *= -1.05;
    }

    // Score point / Game Over conditions
    if (this.ball.x - this.ball.radius < 0) {
      // AI Scores (Player missed)
      this.ai.score += 1;
      this.stop();
      this.onGameOver(this.player.score);
    } else if (this.ball.x + this.ball.radius > this.canvas.width) {
      // Ball out of bounds on AI side (reset ball and speed up)
      this.resetBall();
    }
  }

  render() {
    this.ctx.fillStyle = "#1e293b"; // Tailwind Slate-800
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Center line
    this.ctx.strokeStyle = "rgba(255,255,255,0.1)";
    this.ctx.lineWidth = 4;
    this.ctx.setLineDash([10, 10]);
    this.ctx.beginPath();
    this.ctx.moveTo(this.canvas.width / 2, 0);
    this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // Player paddle
    this.ctx.fillStyle = "#3b82f6"; // Tailwind Blue-500
    this.drawPaddle(this.player);

    // AI paddle
    this.ctx.fillStyle = "#ef4444"; // Tailwind Red-500
    this.drawPaddle(this.ai);

    // Ball
    this.ctx.fillStyle = "#ffffff";
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawPaddle(paddle) {
    this.ctx.beginPath();
    this.ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, paddle.width / 2);
    this.ctx.fill();
  }
}