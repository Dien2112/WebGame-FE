import GameLogic from './model/GameLogic';
import { createEmptyGrid, COLORS } from './utils/constants';
import { getCharGrid } from './utils/pixel-font';
import { drawSprite } from './utils/menu';

class Caro4Logic extends GameLogic {
    constructor(setMatrix, setScore, setStatus, onExit) {
        super(setMatrix, setScore, setStatus, onExit);
        this.setStatus('CARO4');
        this.name = 'CARO4';
    }

    onConsolePress(action, tick) {
        if (action === 'BACK') this.onExit();
    }

    onTick(tick) {
        const grid = createEmptyGrid();
        if (Math.floor(tick / 10) % 2 === 0) {
            drawSprite(grid, getCharGrid('4'), 8, 8, COLORS.RED);
        }
        this.setMatrix(grid);
    }

    preview(saveData, tick) {
        const grid = createEmptyGrid();
        drawSprite(grid, getCharGrid('4'), 8, 8, COLORS.YELLOW);
        return grid;
    }
}

export default Caro4Logic;
