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
    savedState, 
    gameId, 
    pointsPerWin = 10,
    pointsPerLose = 5,
  ) {
    super(setMatrix, setScore, setStatus, onExit);
    this.name = gameName;
    this.setTimer = setTimer; 
    this.gameId = gameId;
    const youGoFirst = Math.random() < 0.5;
    this.state = {
      ...initialCaroState(boardSize, winLength),
      ...savedState, 
      players: (savedState && savedState.players) ? savedState.players : {
        Red: youGoFirst ? "HUMAN" : "COMPUTER",
        Blue: youGoFirst ? "COMPUTER" : "HUMAN",
      },
      startingPlayer: youGoFirst ? "You" : "Computer",
    };
    if (savedState && savedState.currentScore !== undefined) {
        this.currentScore = savedState.currentScore;
        this.setScore(this.currentScore);
    }
    this.computerMoved = false;
    this.labelChar = labelChar;
    this.computerThinkUntil = null; 
    this.pointsPerWin = pointsPerWin;
    this.pointsPerLose = pointsPerLose;
    this.pointsPerLose = pointsPerLose;
    this.currentScore = 0; 
    this.scoreCalculated = false; 
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
    if (action === "HELP") {
        const move = getRandomMove(this.state.board, this.state.boardSize);
        if (move) {
            this.state = {
                ...this.state,
                cursor: move
            };
        }
        return;
    }
    const currentRole = this.state.players[this.state.turn];
    if (currentRole === "COMPUTER") return;
    if (currentRole === "COMPUTER") return;
    const prevTurn = this.state.turn;
    const wasGameOver = !!this.state.winner;
    
    this.state = updateCaro(this.state, action);
    
    if (wasGameOver && !this.state.winner) {
        this.turnStartTime = null;
        this.remainingTime = this.turnTimeLimit;
        this.computerMoved = false;
        this.scoreCalculated = false;
        this.scoreSubmitted = false;
        this.currentScore = 0; 
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
    const now = performance.now(); 

    if (
      !this.state.winner &&
      currentRole === "COMPUTER" &&
      !this.computerMoved
    ) {
      if (this.computerThinkUntil === null) {
        const delayMs = 1000 + Math.random() * 2000; 
        this.computerThinkUntil = now + delayMs;
        if (this.setTimer) this.setTimer(null);
      }

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
      
      if (!this.state.winner) {
          if (this.turnStartTime === null) {
            this.turnStartTime = now;
            this.remainingTime = this.turnTimeLimit;
          }

          const elapsed = now - this.turnStartTime;
          this.remainingTime = Math.max(0, this.turnTimeLimit - elapsed);
          
          if (this.setTimer) {
               this.setTimer(Math.ceil(this.remainingTime / 1000));
          }

          if (this.remainingTime === 0) {
            const computerColor =
                this.state.players.Red === "COMPUTER" ? "Red" : "Blue";
            this.state = {
              ...this.state,
              winner: computerColor,
            };
            this.updateStatus();
          }
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
    
    this.currentScore += scoreChange;
    if (scoreChange !== 0) {
      this.setScore(scoreChange);
    }
    
    if (!this.scoreSubmitted) {
        this.scoreSubmitted = true;
        if (this.gameId) {
             submitScore(this.gameId, scoreChange);
        } else {
             console.warn("[BaseCaro] No Game ID provided for score submission!");
        }
    }
  }

  getSaveData(time) {
      return {
          boardSize: this.state.boardSize, 
          board: this.state.board,
          turn: this.state.turn,
          players: this.state.players,
          winner: this.state.winner,
          currentScore: this.currentScore, 
          remainingTime: this.remainingTime, 
          cursor: this.state.cursor
      };
  }

  preview(saveData, tick) {
    const grid = createEmptyGrid();
    
    if (!saveData) {
        const { boardSize } = this.state; 
        const is5 = this.labelChar === '5';
        
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
