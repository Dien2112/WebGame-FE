import GameLogic from './model/GameLogic';
import { initialTicTacToeState, updateTicTacToe, renderTicTacToe, computerMove } from './utils/tic-tac-toe';
import { getCharGrid } from './utils/pixel-font';
import { drawSprite } from './utils/menu';
import { COLORS, createEmptyGrid } from './utils/constants';
import { submitScore } from './utils/game-service';

class TicTacToeLogic extends GameLogic {
    constructor(setMatrix, setScore, setStatus, onExit, savedState, gameId) {
        super(setMatrix, setScore, setStatus, onExit);
        this.status = {
            ...initialTicTacToeState,
            hintsRemaining: 1, // Max 1 hint
            hintTile: null,
            hintTimer: 0,
            cursor: { r: 1, c: 1 }, // Ensure default cursor cursor
            ...(savedState || {})
        };
        // Restore hints from save if explicit
        if (savedState && savedState.hintsRemaining !== undefined) {
             this.status.hintsRemaining = savedState.hintsRemaining;
        }
        this.setStatus('TIC-TAC-TOE');
        this.name = 'TICTACTOE';
        this.gameId = gameId; // Store Numeric ID
        this.state = this.status; // Ensure state is synced
        if (!this.state.cursor) this.state.cursor = { r: 1, c: 1 };
        
        this.scoreSubmitted = false;
    }

    preview(saveData, tick) {
        if (!saveData) {
            // "New Game" Preview -> Show Logo/Title
            const grid = createEmptyGrid();
            
            // Draw "TIC"
            drawSprite(grid, getCharGrid('T'), 5, 4, COLORS.ON);
            drawSprite(grid, getCharGrid('I'), 5, 8, COLORS.ON);
            drawSprite(grid, getCharGrid('C'), 5, 12, COLORS.ON);

            // Draw "TAC"
            drawSprite(grid, getCharGrid('T'), 10, 4, COLORS.YELLOW);
            drawSprite(grid, getCharGrid('A'), 10, 8, COLORS.YELLOW);
            drawSprite(grid, getCharGrid('C'), 10, 12, COLORS.YELLOW);

             // Draw "TOE"
            drawSprite(grid, getCharGrid('T'), 15, 4, COLORS.BLUE);
            drawSprite(grid, getCharGrid('O'), 15, 8, COLORS.BLUE);
            drawSprite(grid, getCharGrid('E'), 15, 12, COLORS.BLUE);

             return grid;
        }

        const state = { 
            board: saveData.board || initialTicTacToeState.board,
            winner: saveData.winner,
            turn: 'X',
            cursor: {r:-1, c:-1} 
        };
        
        return renderTicTacToe(state, tick);
    }

    onConsolePress(action, tick) {
        if (action === 'BACK') {
            this.onExit();
            return;
        }
        
        // Handle Hint
        if (action === 'HELP' && !this.state.winner && this.state.turn === 'X') {
             if (this.state.hintsRemaining > 0 && !this.state.hintTile) {
                 this.activateHint();
             }
             return;
        }

        // Debug Enter Key
        if (action === 'ENTER') {
            console.log('[TicTacToeLogic] Enter Pressed. Current State:', this.state);
        }

        const nextState = updateTicTacToe(this.state, action);
        
        if (action === 'ENTER' && nextState === this.state) {
             console.log('[TicTacToeLogic] State update ignored. Turn:', this.state.turn, 'Winner:', this.state.winner);
             
             // If game over and ENTER pressed, it might be a reset.
             if (this.state.winner) {
                 // Check if state actually reset? 
                 // updateTicTacToe returns initial state if ENTER is pressed on winner.
                 // But wait, updateTicTacToe returns a NEW object if reset.
                 // So nextState !== this.state SHOULD be true if reset happened.
                 // If we are here, nextState === this.state, meaning NO reset occurred or something failed.
                 
                 // Actually updateTicTacToe returns clone.
                 // If it returns a reset state, it will be different from current state (winner null vs winner X).
             }
        }
        
        // Reset score submitted flag if game reset
        if (this.scoreSubmitted && !nextState.winner) {
             this.scoreSubmitted = false;
        }

        this.state = nextState;
        this.updateStatus();
    }

    onDotClick(r, c) {
        // Map pixel r,c to grid cell r,c
        // Grid Logic from renderTicTacToe:
        // StartRow=3, StartCol=3, CellSize=4, Gap=1
        // CellY = 3 + r*(5)
        // CellX = 3 + c*(5)
        
        // Inverse:
        // r_index = (r - 3) / 5
        // c_index = (c - 3) / 5
        
        // Check if within bounds
        if (r < 3 || c < 3) return; // Top/Left margin
        if (r >= 18 || c >= 18) return; // Bottom/Right margin (3 + 15 = 18)

        const rIndex = (r - 3) / 5;
        const cIndex = (c - 3) / 5;

        // Check if integer (within cell bounds) - Gap check
        if (Math.floor(rIndex) !== rIndex && ((r - 3) % 5) === 4) return; // Gap 
        if (Math.floor(cIndex) !== cIndex && ((c - 3) % 5) === 4) return; // Gap

        const gridR = Math.floor((r - 3) / 5);
        const gridC = Math.floor((c - 3) / 5);

        if (gridR >= 0 && gridR < 3 && gridC >= 0 && gridC < 3) {
            // Valid Cell Clicked
            console.log(`[TicTacToe] Clicked Cell: ${gridR}, ${gridC}`);
            
            if (!this.state.winner) {
                 // Move Cursor AND Select immediately
                 this.state = {
                     ...this.state,
                     cursor: { r: gridR, c: gridC }
                 };
                 // Trigger Enter to confirm selection
                 this.onConsolePress('ENTER');
            }
        }
    }

    onTick(tick) {
        // Pass tick to render for animations
        const grid = renderTicTacToe(this.state, tick);
        this.setMatrix(grid);
        this.updateStatus();
        
        // Update Hint Timer
        if (this.state.hintDuration > 0) {
            this.state.hintDuration--;
            if (this.state.hintDuration <= 0) {
                this.state.hintTile = null;
            }
        }

        // Check if Computer Move Needed (e.g. loaded game in 'O' turn)
        if (this.state.turn === 'O' && !this.state.winner) {
            // Add a small delay/throttle if needed, but for now immediate is fine
            // We use a tick counter or similar to prevent instant moves on load if desired, 
            // but immediate is robust.
            
            // To prevent rapid-fire if something is wrong, we can check a flag or throttle.
            // But since computerMove flips turn to 'X', it runs once.
            
            // Artificial delay: only move if tick % 10 === 0 (1 sec)
            if (tick % 5 === 0) { 
                 const nextState = computerMove(this.state);
                 this.state = nextState;
                 this.updateStatus();
            }
        }
    }

    updateStatus() {
        let baseMsg = "";
        if (this.state.winner === 'DRAW') baseMsg = "DRAW! 'ENTER' to RESET";
        else if (this.state.winner) baseMsg = `WINNER:${this.state.winner}!`;
        else baseMsg = `TURN:${this.state.turn}`;
        
        this.setStatus(baseMsg);
        
        // Handle Score Submission
        if (this.state.winner && !this.scoreSubmitted) {
            this.submitGameScore();
        }
    }

    async submitGameScore() {
        if (this.scoreSubmitted) return;
        this.scoreSubmitted = true;

        let score = 0;
        if (this.state.winner === 'X') score = 10;
        else if (this.state.winner === 'O') score = 0;
        else if (this.state.winner === 'DRAW') score = 5;

        console.log(`[TicTacToe] Game Over. Winner: ${this.state.winner}. Score: ${score}`);
        if (this.gameId) {
            await submitScore(this.gameId, score);
        } else {
             console.warn("[TicTacToe] No Game ID provided for score submission!");
        }
        this.setScore(score); // Show score on UI?
    }

    getSaveData(time) {
        return {
            time: time || 0,
            board: this.state.board,
            turn: this.state.turn,
            winner: this.state.winner,
            hintsRemaining: this.state.hintsRemaining
        };
    }

    activateHint() {
        // Simple AI to find best move
        // 1. Check for Win
        // 2. Check for Block
        // 3. Random Empty
        const board = this.state.board;
        let move = this.findBestMove(board, 'X') || this.findBestMove(board, 'O') || this.findRandomMove(board);
        
        if (move) {
            this.state.hintsRemaining--;
            this.state.hintTile = move;
            this.state.hintDuration = 20; // 2s (20 ticks)
            
            // Move Cursor to Hint
            this.state.cursor = { ...move };
            
            console.log(`[TicTacToe] Hint Activated at ${move.r},${move.c}. Remaining: ${this.state.hintsRemaining}`);
        }
    }

    findBestMove(board, player) {
        // Iterate empty cells, simulate move, check win
        for(let r=0; r<3; r++) {
            for(let c=0; c<3; c++) {
                if (!board[r][c]) {
                     board[r][c] = player;
                     const win = this.checkWin(board, player);
                     board[r][c] = null; // Backtrack
                     if (win) return {r, c};
                }
            }
        }
        return null;
    }
    
    findRandomMove(board) {
        const empty = [];
        for(let r=0; r<3; r++) {
            for(let c=0; c<3; c++) {
                if (!board[r][c]) empty.push({r, c});
            }
        }
        return empty.length > 0 ? empty[Math.floor(Math.random() * empty.length)] : null;
    }

    checkWin(board, player) {
        // Simple win check reuse from utils?? 
        // utils/tic-tac-toe 'checkWinner' returns 'X'/'O'.
        // I'll quickly implement local check for efficiency/simplicity
        // Rows, Cols, Diags
        const b = board;
        const p = player;
         // Rows
        for(let i=0; i<3; i++) if(b[i][0]===p && b[i][1]===p && b[i][2]===p) return true;
        // Cols
        for(let i=0; i<3; i++) if(b[0][i]===p && b[1][i]===p && b[2][i]===p) return true;
        // Diags
        if(b[0][0]===p && b[1][1]===p && b[2][2]===p) return true;
        if(b[0][2]===p && b[1][1]===p && b[2][0]===p) return true;
        return false;
    }
}

export default TicTacToeLogic;
