import GameLogic from './model/GameLogic';
import { createEmptyGrid, COLORS } from './utils/constants';
import { getCharGrid } from './utils/pixel-font';
import { drawSprite } from './utils/menu';
import { initialCaroState, updateCaro, renderCaro, getRandomMove } from './utils/caroEngine';
import { GRID_SIZE } from './utils/constants';

class BaseCaroLogic extends GameLogic {
    constructor(boardSize, winLength, labelChar, gameName, setMatrix, setScore, setStatus, onExit) {
        super(setMatrix, setScore, setStatus, onExit);
        this.name = gameName;
        const youGoFirst = Math.random() < 0.5;
        this.state = {
            ...initialCaroState(boardSize, winLength),
            players: {
                Red: youGoFirst ? 'HUMAN' : 'COMPUTER',
                Blue: youGoFirst ? 'COMPUTER' : 'HUMAN'
            },
            startingPlayer: youGoFirst ? 'You' : 'Computer'
        };
        this.computerMoved = false;
        this.labelChar = labelChar;
        this.computerThinkUntil = null; // Thời gian máy tính suy nghĩ
        this.setStatus(
            youGoFirst ? 'You go first (Red)' : 'Computer goes first (Red)'
        );
    };
        

    onConsolePress(action, tick) {
        if (action === 'BACK') {
            this.onExit();
            return;
        }
        const currentRole = this.state.players[this.state.turn];
        if (currentRole === 'COMPUTER') return;
        this.state = updateCaro(this.state, action);
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
            cursor: { r: br, c: bc }
        };
        this.onConsolePress('ENTER');
    }

    onTick(tick) {
        const currentRole = this.state.players[this.state.turn];
        const now = performance.now(); // thời gian thật (ms)

        if (!this.state.winner && currentRole === 'COMPUTER' && !this.computerMoved) {
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
                        cursor: move
                    };
                    this.state = updateCaro(this.state, 'ENTER');
                    this.computerMoved = true;
                }
            }
        }
        if (currentRole === 'HUMAN') {
            this.computerMoved = false;
            this.computerThinkUntil = null;
        }
        const grid = renderCaro(this.state, tick);
        this.setMatrix(grid);
        this.updateStatus();
    }

    updateStatus() {
        if (this.state.winner) {
            if (this.state.winner === 'DRAW') {
                this.setStatus('End game: Draw!');
            } else {
                const role = this.state.players[this.state.winner];
                this.setStatus(
                    role === 'HUMAN'
                        ? 'You Win!'
                        : 'Computer Wins!'
                );
            }
        } else {
            const role = this.state.players[this.state.turn];
            this.setStatus(
                role === 'HUMAN'
                    ? 'Your Turn'
                    : 'Computer Thinking...'
            );
        }
    }

    preview(saveData, tick) {
        const grid = createEmptyGrid();
        drawSprite(grid, getCharGrid(this.labelChar), 8, 8, COLORS.YELLOW);
        return grid;
    }
}

export default BaseCaroLogic;
