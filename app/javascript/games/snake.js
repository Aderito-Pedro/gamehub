export default class SnakeGame {
  constructor(canvas, onScoreUpdate, onGameOver) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.onScoreUpdate = onScoreUpdate;
    this.onGameOver = onGameOver;

    this.gridSize = 20;
    this.snake = [];
    this.food = { x: 0, y: 0 };
    this.dx = this.gridSize;
    this.dy = 0;
    
    this.score = 0;
    this.running = false;
    this.gameInterval = null;
    this.speed = 100; // ms per tick

    this.setupInput();
    this.resetGame();
  }

  setupInput() {
    this.handleKeyDown = (e) => {
      if (!this.running) return;

      const goingUp = this.dy === -this.gridSize;
      const goingDown = this.dy === this.gridSize;
      const goingRight = this.dx === this.gridSize;
      const goingLeft = this.dx === -this.gridSize;

      if (e.key === "ArrowLeft" && !goingRight) {
        this.dx = -this.gridSize;
        this.dy = 0;
        e.preventDefault();
      }
      if (e.key === "ArrowUp" && !goingDown) {
        this.dx = 0;
        this.dy = -this.gridSize;
        e.preventDefault();
      }
      if (e.key === "ArrowRight" && !goingLeft) {
        this.dx = this.gridSize;
        this.dy = 0;
        e.preventDefault();
      }
      if (e.key === "ArrowDown" && !goingUp) {
        this.dx = 0;
        this.dy = this.gridSize;
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", this.handleKeyDown);
  }

  destroy() {
    this.stop();
    window.removeEventListener("keydown", this.handleKeyDown);
  }

  resetGame() {
    this.snake = [
      { x: 160, y: 200 },
      { x: 140, y: 200 },
      { x: 120, y: 200 },
      { x: 100, y: 200 }
    ];
    this.score = 0;
    this.dx = this.gridSize;
    this.dy = 0;
    this.generateFood();
  }

  generateFood() {
    const randomCoord = (max) => Math.floor(Math.random() * (max / this.gridSize)) * this.gridSize;

    let onSnake;
    do {
      this.food.x = randomCoord(this.canvas.width);
      this.food.y = randomCoord(this.canvas.height);
      onSnake = this.snake.some(part => part.x === this.food.x && part.y === this.food.y);
    } while (onSnake);
  }

  start() {
    this.running = true;
    this.gameInterval = setInterval(() => this.tick(), this.speed);
  }

  stop() {
    this.running = false;
    clearInterval(this.gameInterval);
  }

  tick() {
    if (this.hasGameEnded()) {
      this.stop();
      this.onGameOver(this.score);
      return;
    }

    this.moveSnake();
    this.render();
  }

  moveSnake() {
    const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };
    this.snake.unshift(head);

    const hasEatenFood = this.snake[0].x === this.food.x && this.snake[0].y === this.food.y;
    if (hasEatenFood) {
      this.score += 10;
      this.onScoreUpdate(this.score);
      this.generateFood();
      
      // Speed up slightly
      if (this.speed > 50) {
        this.speed -= 2;
        clearInterval(this.gameInterval);
        this.gameInterval = setInterval(() => this.tick(), this.speed);
      }
    } else {
      this.snake.pop();
    }
  }

  hasGameEnded() {
    // Collision with self
    for (let i = 4; i < this.snake.length; i++) {
      if (this.snake[i].x === this.snake[0].x && this.snake[i].y === this.snake[0].y) return true;
    }

    // Collision with wall
    const hitLeftWall = this.snake[0].x < 0;
    const hitRightWall = this.snake[0].x >= this.canvas.width;
    const hitToptWall = this.snake[0].y < 0;
    const hitBottomWall = this.snake[0].y >= this.canvas.height;

    return hitLeftWall || hitRightWall || hitToptWall || hitBottomWall;
  }

  render() {
    // Background
    this.ctx.fillStyle = "#1e293b";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Food
    this.ctx.font = `${Math.floor(this.gridSize * 0.9)}px sans-serif`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText("🍎", this.food.x + this.gridSize / 2, this.food.y + this.gridSize / 2);

    // Snake
    this.snake.forEach((part, index) => {
      this.ctx.fillStyle = index === 0 ? "#10b981" : "#34d399"; // Green header
      this.ctx.strokeStyle = "#064e3b";
      this.ctx.fillRect(part.x, part.y, this.gridSize, this.gridSize);
      this.ctx.strokeRect(part.x, part.y, this.gridSize, this.gridSize);
    });

    this.drawEyes();
  }

  drawEyes() {
    const head = this.snake[0];
    const cx = head.x + this.gridSize / 2;
    const cy = head.y + this.gridSize / 2;
    const eyeOffset = this.gridSize * 0.22;
    const eyeRadius = Math.max(1.5, this.gridSize * 0.09);

    const perpX = this.dx !== 0 ? 0 : 1;
    const perpY = this.dx !== 0 ? 1 : 0;
    const forwardX = this.dx / this.gridSize || 0;
    const forwardY = this.dy / this.gridSize || 0;
    const forwardOffset = this.gridSize * 0.12;

    const eyes = [
      { x: cx + perpX * eyeOffset + forwardX * forwardOffset, y: cy + perpY * eyeOffset + forwardY * forwardOffset },
      { x: cx - perpX * eyeOffset + forwardX * forwardOffset, y: cy - perpY * eyeOffset + forwardY * forwardOffset },
    ];

    this.ctx.fillStyle = "#f8fafc";
    for (const eye of eyes) {
      this.ctx.beginPath();
      this.ctx.arc(eye.x, eye.y, eyeRadius * 1.8, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.fillStyle = "#052e1a";
    for (const eye of eyes) {
      this.ctx.beginPath();
      this.ctx.arc(eye.x, eye.y, eyeRadius, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
}