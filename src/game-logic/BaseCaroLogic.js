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
import { submitScore } from "./utils/game-service";

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
    setTimer,
    onExit,
    savedState, // LOAD STATE
    gameId, // Numeric ID injected
    pointsPerWin = 10,
    pointsPerLose = 5,
  ) {
    super(setMatrix, setScore, setStatus, onExit);
    this.name = gameName;
    this.setTimer = setTimer; // Store setter
    this.gameId = gameId;
    const youGoFirst = Math.random() < 0.5;
    this.state = {
      ...initialCaroState(boardSize, winLength),
      ...savedState, // Overwrite with saved state
      players: (savedState && savedState.players) ? savedState.players : {
        Red: youGoFirst ? "HUMAN" : "COMPUTER",
        Blue: youGoFirst ? "COMPUTER" : "HUMAN",
      },
      startingPlayer: youGoFirst ? "You" : "Computer",
    };
    // Restore score if saved
    if (savedState && savedState.currentScore !== undefined) {
        this.currentScore = savedState.currentScore;
        this.setScore(this.currentScore);
    }
    this.computerMoved = false;
    this.labelChar = labelChar;
    this.computerThinkUntil = null; // Thời gian máy tính suy nghĩ
    this.pointsPerWin = pointsPerWin;
    this.pointsPerLose = pointsPerLose;
    this.pointsPerLose = pointsPerLose;
    this.currentScore = 0; // Điểm số hiện tại trong ván chơi
    this.scoreCalculated = false; // Flag để theo dõi điểm đã được tính hay chưa
    this.scoreSubmitted = false;
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
    if (currentRole === "COMPUTER") return;
    const prevTurn = this.state.turn;
    const wasGameOver = !!this.state.winner;
    
    this.state = updateCaro(this.state, action);
    
    // Check for Reset (Winner cleared)
    if (wasGameOver && !this.state.winner) {
        // Reset Logic
        this.turnStartTime = null;
        this.remainingTime = this.turnTimeLimit;
        this.computerMoved = false;
        this.scoreCalculated = false;
        this.scoreSubmitted = false;
        this.currentScore = 0; // Optional: Reset score on new game? Matches TicTacToe behavior.
    } else if (action === "ENTER" && prevTurn !== this.state.turn) {
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
        // Hide timer during computer think
        if (this.setTimer) this.setTimer(null);
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
      
      // Stop timer if winner exists
      if (this.state.winner) return; 

      const elapsed = now - this.turnStartTime;
      this.remainingTime = Math.max(0, this.turnTimeLimit - elapsed);
      
      // Update UI Timer
      if (this.setTimer) {
           this.setTimer(Math.ceil(this.remainingTime / 1000));
      }

      // HẾT GIỜ → COMPUTER THẮNG (chỉ xử lý nếu chưa có winner)
      if (this.remainingTime === 0 && !this.state.winner) {
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
        if (!this.scoreCalculated) {
          this.calculateScore("DRAW");
          this.scoreCalculated = true;
        }
        this.setStatus(`End game: Draw! | Score: ${this.currentScore}`);
      } else {
        const role = this.state.players[this.state.winner];
        if (!this.scoreCalculated) {
          this.calculateScore(role === "HUMAN" ? "WIN" : "LOSE");
          this.scoreCalculated = true;
        }
        if (role === "HUMAN") {
          this.setStatus(`You Win! + ${this.pointsPerWin} points | Total: ${this.currentScore}`);
        } else {
          this.setStatus(`Computer Wins! - ${this.pointsPerLose} points | Total: ${this.currentScore}`);
        }
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
    
    // Submit Score
    if (!this.scoreSubmitted) {
        this.scoreSubmitted = true;
        // Use currentScore or scoreChange? User said "win score = 10". 
        // Logic accumulates currentScore. 
        // Usually we submit the FINAL result of that match.
        // TicTacToe submitted 10.
        // Here currentScore might start at 0? 
        // BaseCaroLogic logic: currentScore += scoreChange.
        // It seems to be session score? 
        // If it's session score, we might want to just submit scoreChange if backend sums it, or currentScore if backend replaces it.
        // But user said "win score = 10". TicTacToe sets score=10.
        // Let's submit scoreChange for now to be safe, or 10/-5 specifically.
        // Wait, BaseCaroLogic has pointsPerWin (10) and pointsPerLose (5).
        // I will submit scoreChange.
        console.log(`[BaseCaro] Submitting Score: ${scoreChange}, GameID: ${this.gameId}`);
        if (this.gameId) {
             submitScore(this.gameId, scoreChange);
        } else {
             console.warn("[BaseCaro] No Game ID provided for score submission!");
        }
    }
  }

  // Save Data Implementation
  getSaveData(time) {
      return {
          boardSize: this.state.boardSize, // Needed to reconstruct
          board: this.state.board,
          turn: this.state.turn,
          players: this.state.players,
          winner: this.state.winner,
          currentScore: this.currentScore, // Save Score
          remainingTime: this.remainingTime, // Save Time
          // Note: When loading, constructor re-inits. We need to handle this.status in constructor or helper.
          // Currently ScenarioSelectLogic passes `item.data.preview` (this object) to constructor as `gameId` ?? NO.
          // RetroConsole passes `savedState` to createGameLogic. 
          // But BaseCaroLogic constructor doesn't accept `savedState`! 
          // We need to fix Constructor signature to accept `savedState` OR handle it.
          // For now, let's implement getSaveData.
          cursor: this.state.cursor
      };
  }

  // Visual Preview
  preview(saveData, tick) {
    const grid = createEmptyGrid();
    
    // Draw Logo for New Game
    if (!saveData) {
        // Draw a simple pattern
        const { boardSize } = this.state; // Default from constructor
        const is5 = this.labelChar === '5';
        
        // Draw Border
        for(let i=4; i<16; i++) {
            grid[i][4] = COLORS.BLUE;
            grid[i][15] = COLORS.BLUE;
            grid[4][i] = COLORS.BLUE;
            grid[15][i] = COLORS.BLUE;
        }
        
        drawSprite(grid, getCharGrid('C'), 6, 6, COLORS.YELLOW);
        drawSprite(grid, getCharGrid('A'), 6, 10, COLORS.YELLOW);
        drawSprite(grid, getCharGrid(this.labelChar), 10, 8, COLORS.RED);
        
        return grid;
    }

    // Draw Saved Game State
    // Need to handle board size scaling if different? 
    // Assuming saved board matches logic class.
    
    // Use renderCaro? But renderCaro uses `this.state`. 
    // We can use a static helper or just inline text.
    // Let's rely on renderCaro if possible, but it takes `state`.
    // We can construct a temp state.
    const tempState = {
        boardSize: saveData.boardSize || 15,
        board: saveData.board,
        cursor: saveData.cursor || {r:0, c:0},
        winner: saveData.winner
    };
    
    return renderCaro(tempState, tick);
  }
}

export default BaseCaroLogic;
