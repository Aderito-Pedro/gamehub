import { Controller } from "@hotwired/stimulus"
import PongGame from "../games/pong"
import SnakeGame from "../games/snake"
import Game2048 from "../games/g2048"

export default class extends Controller {
  static targets = ["canvas", "scoreDisplay", "startBtn", "stopBtn", "message"]
  static values = { gameName: String, saveUrl: String }

  connect() {
    this.score = 0;
    this.gameInstance = null;
    this.setupGame();
  }

  disconnect() {
    if (this.gameInstance) {
      this.gameInstance.stop();
    }
  }

  setupGame() {
    const canvas = this.canvasTarget;
    const name = this.gameNameValue.toLowerCase();

    if (name === "pong") {
      this.gameInstance = new PongGame(canvas, this.updateScore.bind(this), this.gameOver.bind(this));
    } else if (name === "snake") {
      this.gameInstance = new SnakeGame(canvas, this.updateScore.bind(this), this.gameOver.bind(this));
    } else if (name === "2048") {
      this.gameInstance = new Game2048(canvas, this.updateScore.bind(this), this.gameOver.bind(this));
    }
  }

  start() {
    if (!this.gameInstance) return;
    this.messageTarget.classList.add("hidden");
    this.startBtnTarget.classList.add("hidden");
    if (this.hasStopBtnTarget) this.stopBtnTarget.classList.remove("hidden");
    
    this.gameInstance.resetGame();
    this.gameInstance.start();
  }

  stop() {
    if (!this.gameInstance) return;
    this.gameInstance.stop();
    this.startBtnTarget.classList.remove("hidden");
    if (this.hasStopBtnTarget) this.stopBtnTarget.classList.add("hidden");
  }

  updateScore(newScore) {
    this.score = newScore;
    this.scoreDisplayTarget.textContent = `Pontuação: ${newScore}`;
  }

  gameOver(finalScore) {
    this.messageTarget.textContent = `Fim de Jogo! Pontuação Final: ${finalScore}`;
    this.messageTarget.classList.remove("hidden");
    this.startBtnTarget.classList.remove("hidden");
    if (this.hasStopBtnTarget) this.stopBtnTarget.classList.add("hidden");

    this.submitScore(finalScore);
  }

  async submitScore(value) {
    if (!this.hasSaveUrlValue) return;

    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      
      const response = await fetch(this.saveUrlValue, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken
        },
        body: JSON.stringify({ value: value })
      });

      const data = await response.json();
      if (data.success) {
        console.log("Score saved:", data);
        // Dispatch event or update UI if needed
      } else {
        console.warn("Failed to save score:", data.errors);
      }
    } catch (e) {
      console.error("Error submitting score:", e);
    }
  }
}