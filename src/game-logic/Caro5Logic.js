import GameLogic from './model/GameLogic';
import { createEmptyGrid, COLORS } from './utils/constants';
import { getCharGrid } from './utils/pixel-font';
import { drawSprite } from './utils/menu';
import { initialCaro5State, updateCaro5, renderCaro5 } from './utils/caro5';

class Caro5Logic extends GameLogic {
    constructor(setMatrix, setScore, setStatus, onExit) {
        super(setMatrix, setScore, setStatus, onExit);
        this.setStatus('CARO5');
        this.name = 'CARO5';
        this.state = initialCaro5State;
    }

    onConsolePress(action, tick) {
        if (action === 'BACK') {
            this.onExit();
            return;
        }
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
        // const grid = createEmptyGrid();
        // if (Math.floor(tick / 10) % 2 === 0) {
        //     drawSprite(grid, getCharGrid('5'), 8, 8, COLORS.RED);
        // }
        // this.setMatrix(grid);
        const grid = renderCaro5(this.state, tick);
        this.setMatrix(grid);
        this.updateStatus();
    }

    updateStatus() {
        if (this.state.winner) {
            if (this.state.winner === 'DRAW') {
                this.setStatus('End game: Draw!');
            } else {
                this.setStatus(`End game: ${this.state.winner} Wins!`);
            }
        } else {
            this.setStatus(`Turn: ${this.state.turn}`);
        }
    }

    preview(saveData, tick) {
        const grid = createEmptyGrid();
        drawSprite(grid, getCharGrid('5'), 8, 8, COLORS.YELLOW);
        return grid;
    }
}

export default Caro5Logic;
