import GameLogic from './model/GameLogic';
import { createEmptyGrid, COLORS } from './utils/constants';
import { getCharGrid } from './utils/pixel-font';
import { drawSprite } from './utils/menu';
import { initialCaro5State, updateCaro5, renderCaro5, getRandomMove } from './utils/caro5';

class Caro5Logic extends GameLogic {
    constructor(setMatrix, setScore, setStatus, onExit) {
        super(setMatrix, setScore, setStatus, onExit);
        this.name = 'CARO5';
        const youGoFirst = Math.random() < 0.5;
        this.state = {
            ...initialCaro5State,
            players: {
                Red: youGoFirst ? 'HUMAN' : 'COMPUTER',
                Blue: youGoFirst ? 'COMPUTER' : 'HUMAN'
            },
            startingPlayer: youGoFirst ? 'You' : 'Computer'
        };
        this.computerMoved = false;
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
        this.state = updateCaro5(this.state, action);
        this.updateStatus();
    }

    onDotClick(r, c) {
        this.state = {
            ...this.state,
            cursor: { r, c }
        };
        this.onConsolePress('ENTER');
    }

    onTick(tick) {
        const currentRole = this.state.players[this.state.turn];

        if (!this.state.winner && currentRole === 'COMPUTER' && !this.computerMoved) {
            const move = getRandomMove(this.state.board);
            if (move) {
                this.state = {
                    ...this.state,
                    cursor: move
                };
                this.state = updateCaro5(this.state, 'ENTER');
                this.computerMoved = true;
            }
        }
        if (currentRole === 'HUMAN') {
            this.computerMoved = false;
        }
        const grid = renderCaro5(this.state, tick);
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
        drawSprite(grid, getCharGrid('5'), 8, 8, COLORS.YELLOW);
        return grid;
    }
}

export default Caro5Logic;
