import { Controller } from "@hotwired/stimulus"
import PongGame from "games/pong"
import SnakeGame from "games/snake"
import Game2048 from "games/g2048"
import TetrisGame from "games/tetris"
import FlappyBirdGame from "games/flappy_bird"
import BreakoutGame from "games/breakout"
import MemoryGame from "games/memory"
import MazeChaseGame from "games/maze_chase"
import SpeedRacerGame from "games/speed_racer"
import PlatformHeroGame from "games/platform_hero"
import TankDuelGame from "games/tank_duel"
import BombArenaGame from "games/bomb_arena"
import BlockSmashGame from "games/block_smash"
import StarBlasterGame from "games/star_blaster"

const GAME_CLASSES = {
  "pong": PongGame,
  "snake": SnakeGame,
  "2048": Game2048,
  "tetris": TetrisGame,
  "flappy bird": FlappyBirdGame,
  "breakout": BreakoutGame,
  "memory": MemoryGame,
  "maze chase": MazeChaseGame,
  "speed racer": SpeedRacerGame,
  "platform hero": PlatformHeroGame,
  "tank duel": TankDuelGame,
  "bomb arena": BombArenaGame,
  "block smash": BlockSmashGame,
  "star blaster": StarBlasterGame,
}

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
      this.gameInstance.destroy();
    }
  }

  setupGame() {
    const canvas = this.canvasTarget;
    const name = this.gameNameValue.toLowerCase();
    const GameClass = GAME_CLASSES[name];

    if (GameClass) {
      this.gameInstance = new GameClass(canvas, this.updateScore.bind(this), this.gameOver.bind(this));
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