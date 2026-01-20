import GameLogic from "./model/GameLogic";
import { createEmptyGrid, COLORS } from "./utils/constants";
import { getCharGrid } from "./utils/pixel-font";
import { drawSprite } from "./utils/menu";
import {
  initialCaroState,
  updateCaro,
  renderCaro,
  getRandomMove,
} from "./utils/caroEngine";
import { GRID_SIZE } from "./utils/constants";

class BaseCaroLogic extends GameLogic {
  constructor(
    boardSize,
    winLength,
    timePerTurn,
    labelChar,
    gameName,
    setMatrix,
    setScore,
    setStatus,
    onExit,
    pointsPerWin = 10,
    pointsPerLose = 5,
  ) {
    super(setMatrix, setScore, setStatus, onExit);
    this.name = gameName;
    const youGoFirst = Math.random() < 0.5;
    this.state = {
      ...initialCaroState(boardSize, winLength),
      players: {
        Red: youGoFirst ? "HUMAN" : "COMPUTER",
        Blue: youGoFirst ? "COMPUTER" : "HUMAN",
      },
      startingPlayer: youGoFirst ? "You" : "Computer",
    };
    this.computerMoved = false;
    this.labelChar = labelChar;
    this.computerThinkUntil = null; // Thời gian máy tính suy nghĩ
    this.pointsPerWin = pointsPerWin;
    this.pointsPerLose = pointsPerLose;
    this.currentScore = 0; // Điểm số hiện tại trong ván chơi
    this.scoreDisplay = ""; // Lưu thông tin điểm số để hiển thị
    this.setStatus(
      youGoFirst ? "You go first (Red)" : "Computer goes first (Red)",
    );
    this.turnTimeLimit = timePerTurn * 1000; // ms per turn
    this.turnStartTime = null;
    this.remainingTime = this.turnTimeLimit;
  }

  onConsolePress(action, tick) {
    if (action === "BACK") {
      this.onExit();
      return;
    }
    const currentRole = this.state.players[this.state.turn];
    if (currentRole === "COMPUTER") return;
    const prevTurn = this.state.turn;
    this.state = updateCaro(this.state, action);
    if (action === "ENTER" && prevTurn !== this.state.turn) {
      this.turnStartTime = null;
      this.remainingTime = this.turnTimeLimit;
    }
    this.updateStatus();
  }

  onDotClick(r, c) {
    const { boardSize } = this.state;
    const offset = Math.floor((GRID_SIZE - boardSize) / 2);

    const br = r - offset;
    const bc = c - offset;

    if (br < 0 || br >= boardSize || bc < 0 || bc >= boardSize) {
      return;
    }
    this.state = {
      ...this.state,
      cursor: { r: br, c: bc },
    };
    this.onConsolePress("ENTER");
  }

  onTick(tick) {
    const currentRole = this.state.players[this.state.turn];
    const now = performance.now(); // thời gian thật (ms)

    if (
      !this.state.winner &&
      currentRole === "COMPUTER" &&
      !this.computerMoved
    ) {
      // Lần đầu vào lượt COMPUTER → set thời gian suy nghĩ
      if (this.computerThinkUntil === null) {
        const delayMs = 1000 + Math.random() * 2000; // 1–3 giây
        this.computerThinkUntil = now + delayMs;
      }

      // Đã đến thời gian đánh
      if (now >= this.computerThinkUntil && !this.computerMoved) {
        const move = getRandomMove(this.state.board, this.state.boardSize);
        if (move) {
          this.state = {
            ...this.state,
            cursor: move,
          };
          this.state = updateCaro(this.state, "ENTER");
          this.computerMoved = true;

          this.turnStartTime = null;
          this.remainingTime = this.turnTimeLimit;
        }
      }
    }
    if (currentRole === "HUMAN") {
      this.computerMoved = false;
      this.computerThinkUntil = null;
      if (this.turnStartTime === null) {
        this.turnStartTime = now;
        this.remainingTime = this.turnTimeLimit;
      }

      const elapsed = now - this.turnStartTime;
      this.remainingTime = Math.max(0, this.turnTimeLimit - elapsed);

      // HẾT GIỜ → COMPUTER THẮNG
      if (this.remainingTime === 0) {
        const computerColor =
            this.state.players.Red === "COMPUTER" ? "Red" : "Blue";
        this.state = {
          ...this.state,
          winner: computerColor,
        };
        this.updateStatus();
        return;
      }
    }
    const grid = renderCaro(this.state, tick);
    this.setMatrix(grid);
    this.updateStatus();
  }

  updateStatus() {
    if (this.state.winner) {
      if (this.state.winner === "DRAW") {
        this.setStatus(`End game: Draw! | Score: ${this.currentScore}`);
        this.calculateScore("DRAW");
      } else {
        const role = this.state.players[this.state.winner];
        if (role === "HUMAN") {
          this.setStatus(`You Win! +${this.pointsPerWin} points | Total: ${this.currentScore + this.pointsPerWin}`);
        } else {
          this.setStatus(`Computer Wins! -${this.pointsPerLose} points | Total: ${this.currentScore - this.pointsPerLose}`);
        }
        this.calculateScore(role === "HUMAN" ? "WIN" : "LOSE");
      }
    } else {
      const role = this.state.players[this.state.turn];
      if (role === "HUMAN") {
        const sec = Math.ceil(this.remainingTime / 1000);
        this.setStatus(`Your Turn ⏱ ${sec}s | Score: ${this.currentScore}`);
      } else {
        this.setStatus(`Computer Thinking... | Score: ${this.currentScore}`);
      }
    }
  }

  calculateScore(result) {
    let scoreChange = 0;
    if (result === "WIN") {
      scoreChange = this.pointsPerWin;
    } else if (result === "LOSE") {
      scoreChange = -this.pointsPerLose;
    }
    // result === "DRAW" thì scoreChange = 0 (không cộng/trừ điểm)
    
    this.currentScore += scoreChange;
    if (scoreChange !== 0) {
      this.setScore(scoreChange);
    }
  }

  preview(saveData, tick) {
    const grid = createEmptyGrid();
    drawSprite(grid, getCharGrid(this.labelChar), 8, 8, COLORS.YELLOW);
    return grid;
  }
}

export default BaseCaroLogic;
