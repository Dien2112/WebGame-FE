import GameLogic from "./model/GameLogic";
import {
  initialTicTacToeState,
  updateTicTacToe,
  renderTicTacToe,
  computerMove,
} from "./utils/tic-tac-toe";
import { getCharGrid } from "./utils/pixel-font";
import { drawSprite } from "./utils/menu";
import { COLORS, createEmptyGrid } from "./utils/constants";
import { submitScore } from "./utils/game-service";

class TicTacToeLogic extends GameLogic {
  constructor(setMatrix, setScore, setStatus, onExit, savedState, gameId) {
    super(setMatrix, setScore, setStatus, onExit);
    this.status = {
      ...initialTicTacToeState,
      hintsRemaining: 1,
      hintTile: null,
      hintTimer: 0,
      cursor: { r: 1, c: 1 },
      ...(savedState || {}),
    };

    if (savedState && savedState.hintsRemaining !== undefined) {
      this.status.hintsRemaining = savedState.hintsRemaining;
    }
    this.setStatus("TIC-TAC-TOE");
    this.name = "TICTACTOE";
    this.gameId = gameId;
    this.state = this.status;
    if (!this.state.cursor) this.state.cursor = { r: 1, c: 1 };

    this.scoreSubmitted = false;
  }

  preview(saveData, tick) {
    if (!saveData) {
      const grid = createEmptyGrid();

      drawSprite(grid, getCharGrid("T"), 5, 4, COLORS.ON);
      drawSprite(grid, getCharGrid("I"), 5, 8, COLORS.ON);
      drawSprite(grid, getCharGrid("C"), 5, 12, COLORS.ON);

      drawSprite(grid, getCharGrid("T"), 10, 4, COLORS.YELLOW);
      drawSprite(grid, getCharGrid("A"), 10, 8, COLORS.YELLOW);
      drawSprite(grid, getCharGrid("C"), 10, 12, COLORS.YELLOW);

      drawSprite(grid, getCharGrid("T"), 15, 4, COLORS.BLUE);
      drawSprite(grid, getCharGrid("O"), 15, 8, COLORS.BLUE);
      drawSprite(grid, getCharGrid("E"), 15, 12, COLORS.BLUE);

      return grid;
    }

    const state = {
      board: saveData.board || initialTicTacToeState.board,
      winner: saveData.winner,
      turn: "X",
      cursor: { r: -1, c: -1 },
    };

    return renderTicTacToe(state, tick);
  }

  onConsolePress(action, tick) {
    if (action === "BACK") {
      this.onExit();
      return;
    }

    if (action === "HELP" && !this.state.winner && this.state.turn === "X") {
      if (this.state.hintsRemaining > 0 && !this.state.hintTile) {
        this.activateHint();
      }
      return;
    }

    const nextState = updateTicTacToe(this.state, action);

    if (this.scoreSubmitted && !nextState.winner) {
      this.scoreSubmitted = false;
    }

    this.state = nextState;
    this.updateStatus();
  }

  onDotClick(r, c) {
    if (r < 3 || c < 3) return;
    if (r >= 18 || c >= 18) return;

    const rIndex = (r - 3) / 5;
    const cIndex = (c - 3) / 5;

    if (Math.floor(rIndex) !== rIndex && (r - 3) % 5 === 4) return;
    if (Math.floor(cIndex) !== cIndex && (c - 3) % 5 === 4) return;

    const gridR = Math.floor((r - 3) / 5);
    const gridC = Math.floor((c - 3) / 5);

    if (gridR >= 0 && gridR < 3 && gridC >= 0 && gridC < 3) {

      if (!this.state.winner) {
        this.state = {
          ...this.state,
          cursor: { r: gridR, c: gridC },
        };
        this.onConsolePress("ENTER");
      }
    }
  }

  onTick(tick) {
    const grid = renderTicTacToe(this.state, tick);
    this.setMatrix(grid);
    this.updateStatus();

    if (this.state.hintDuration > 0) {
      this.state.hintDuration--;
      if (this.state.hintDuration <= 0) {
        this.state.hintTile = null;
      }
    }

    if (this.state.turn === "O" && !this.state.winner) {
      if (tick % 5 === 0) {
        const nextState = computerMove(this.state);
        this.state = nextState;
        this.updateStatus();
      }
    }
  }

  updateStatus() {
    let baseMsg = "";
    if (this.state.winner === "DRAW") baseMsg = "DRAW! 'ENTER' to RESET";
    else if (this.state.winner) baseMsg = `WINNER:${this.state.winner}!`;
    else baseMsg = `TURN:${this.state.turn}`;

    this.setStatus(baseMsg);

    if (this.state.winner && !this.scoreSubmitted) {
      this.submitGameScore();
    }
  }

  async submitGameScore() {
    if (this.scoreSubmitted) return;
    this.scoreSubmitted = true;

    let score = 0;
    if (this.state.winner === "X") score = 10;
    else if (this.state.winner === "O") score = 0;
    else if (this.state.winner === "DRAW") score = 5;
    if (this.gameId) {
      await submitScore(this.gameId, score);
    } else {
      console.warn("[TicTacToe] No Game ID provided for score submission!");
    }
    this.setScore(score);
  }

  getSaveData(time) {
    return {
      time: time || 0,
      board: this.state.board,
      turn: this.state.turn,
      winner: this.state.winner,
      hintsRemaining: this.state.hintsRemaining,
    };
  }

  activateHint() {
    const board = this.state.board;
    let move =
      this.findBestMove(board, "X") ||
      this.findBestMove(board, "O") ||
      this.findRandomMove(board);

    if (move) {
      this.state.hintsRemaining--;
      this.state.hintTile = move;
      this.state.hintDuration = 20;

      this.state.cursor = { ...move };
    }
  }

  findBestMove(board, player) {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (!board[r][c]) {
          board[r][c] = player;
          const win = this.checkWin(board, player);
          board[r][c] = null;
          if (win) return { r, c };
        }
      }
    }
    return null;
  }

  findRandomMove(board) {
    const empty = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (!board[r][c]) empty.push({ r, c });
      }
    }
    return empty.length > 0
      ? empty[Math.floor(Math.random() * empty.length)]
      : null;
  }

  checkWin(board, player) {
    const b = board;
    const p = player;
    for (let i = 0; i < 3; i++)
      if (b[i][0] === p && b[i][1] === p && b[i][2] === p) return true;
    for (let i = 0; i < 3; i++)
      if (b[0][i] === p && b[1][i] === p && b[2][i] === p) return true;
    if (b[0][0] === p && b[1][1] === p && b[2][2] === p) return true;
    if (b[0][2] === p && b[1][1] === p && b[2][0] === p) return true;
    return false;
  }
}

export default TicTacToeLogic;
