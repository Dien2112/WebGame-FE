import GameLogic from './model/GameLogic';
import { initialTicTacToeState, updateTicTacToe, renderTicTacToe, computerMove } from './utils/tic-tac-toe';
import { getCharGrid } from './utils/pixel-font';
import { drawSprite } from './utils/menu';
import { COLORS, createEmptyGrid } from './utils/constants';

class TicTacToeLogic extends GameLogic {
    constructor(setMatrix, setScore, setStatus, onExit, savedState) {
        super(setMatrix, setScore, setStatus, onExit);
        this.status = {
            ...initialTicTacToeState,
            ...(savedState || {})
        };
        this.setStatus('TIC-TAC-TOE');
        this.name = 'TICTACTOE';
        this.state = this.status; // Ensure state is synced
        if (!this.state.cursor) this.state.cursor = { r: 1, c: 1 };
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

        // Debug Enter Key
        if (action === 'ENTER') {
            console.log('[TicTacToeLogic] Enter Pressed. Current State:', this.state);
        }

        const nextState = updateTicTacToe(this.state, action);
        
        if (action === 'ENTER' && nextState === this.state) {
             console.log('[TicTacToeLogic] State update ignored. Turn:', this.state.turn, 'Winner:', this.state.winner);
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
    }

    getSaveData(time) {
        return {
            time: time || 0,
            board: this.state.board,
            turn: this.state.turn,
            winner: this.state.winner
        };
    }
}

export default TicTacToeLogic;
