export default class SpeedRacerGame {
  constructor(canvas, onScoreUpdate, onGameOver) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.onScoreUpdate = onScoreUpdate;
    this.onGameOver = onGameOver;

    this.roadWidth = canvas.width * 0.7;
    this.roadX = (canvas.width - this.roadWidth) / 2;

    this.car = { width: 34, height: 58, y: canvas.height - 90, speed: 6 };
    this.keys = {};
    this.running = false;
    this.frame = 0;

    this.setupInput();
    this.resetGame();
  }

  setupInput() {
    this.handleKeyDown = (e) => {
      this.keys[e.key] = true;
      if (["ArrowLeft", "ArrowRight"].includes(e.key)) e.preventDefault();
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

  resetGame() {
    this.car.x = this.roadX + this.roadWidth / 2 - this.car.width / 2;
    this.traffic = [];
    this.frame = 0;
    this.score = 0;
    this.speedMultiplier = 1;
    this.spawnInterval = 70;
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

  spawnTraffic() {
    const width = 34;
    const x = this.roadX + Math.random() * (this.roadWidth - width);
    const emojis = ["🚗", "🚕", "🚙", "🚌", "🚓"];
    this.traffic.push({
      x,
      y: -70,
      width,
      height: 58,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
    });
  }

  update() {
    this.frame++;
    if (this.frame % 6 === 0) {
      this.score += 1;
      this.onScoreUpdate(this.score);
    }

    if (this.frame % Math.max(30, this.spawnInterval) === 0) this.spawnTraffic();
    if (this.frame % 300 === 0) {
      this.speedMultiplier += 0.15;
      this.spawnInterval = Math.max(30, this.spawnInterval - 5);
    }

    if (this.keys["ArrowLeft"]) this.car.x = Math.max(this.roadX, this.car.x - this.car.speed);
    if (this.keys["ArrowRight"]) this.car.x = Math.min(this.roadX + this.roadWidth - this.car.width, this.car.x + this.car.speed);

    const fallSpeed = 4.5 * this.speedMultiplier;
    for (const t of this.traffic) t.y += fallSpeed;
    this.traffic = this.traffic.filter((t) => t.y < this.canvas.height + 80);

    for (const t of this.traffic) {
      if (
        this.car.x < t.x + t.width &&
        this.car.x + this.car.width > t.x &&
        this.car.y < t.y + t.height &&
        this.car.y + this.car.height > t.y
      ) {
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
    this.ctx.fillStyle = "#334155";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = "#1e293b";
    this.ctx.fillRect(this.roadX, 0, this.roadWidth, this.canvas.height);

    this.ctx.strokeStyle = "rgba(255,255,255,0.5)";
    this.ctx.lineWidth = 3;
    this.ctx.setLineDash([18, 16]);
    const laneX = this.roadX + this.roadWidth / 2;
    const dashOffset = (this.frame * 2) % 34;
    this.ctx.beginPath();
    this.ctx.moveTo(laneX, -dashOffset);
    this.ctx.lineTo(laneX, this.canvas.height);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    for (const t of this.traffic) {
      this.drawVehicle(t.emoji, t.x + t.width / 2, t.y + t.height / 2, t.height);
    }

    this.drawVehicle("🏎️", this.car.x + this.car.width / 2, this.car.y + this.car.height / 2, this.car.height);
  }

  drawVehicle(emoji, cx, cy, size) {
    this.ctx.save();
    this.ctx.translate(cx, cy);
    this.ctx.rotate(Math.PI); // emoji vehicles face left by default; flip to face up the road
    this.ctx.font = `${Math.floor(size * 0.85)}px sans-serif`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(emoji, 0, 0);
    this.ctx.restore();
  }
}
