import GameLogic from './model/GameLogic';
import { createEmptyGrid, COLORS } from './utils/constants';
import { getCharGrid } from './utils/pixel-font';
import { drawSprite } from './utils/menu';

class SnakeLogic extends GameLogic {
    constructor(setMatrix, setScore, setStatus, onExit) {
        super(setMatrix, setScore, setStatus, onExit);
        this.setStatus('SNAKE');
        this.name = 'SNAKE';
    }

    onConsolePress(action, tick) {
        if (action === 'BACK') this.onExit();
    }

    onTick(tick) {
        const grid = createEmptyGrid();
        if (Math.floor(tick / 10) % 2 === 0) {
            drawSprite(grid, getCharGrid('S'), 8, 8, COLORS.RED);
        }
        this.setMatrix(grid);
    }

    preview(saveData, tick) {
        if (saveData && Array.isArray(saveData)) {
            // game-service.js creates a visual snapshot grid for Snake
            return saveData;
        }
        
        // New Game: Draw Border (Big Square) + Logo
        const grid = createEmptyGrid();
        // Border
        for(let i=0; i<20; i++) {
            grid[0][i] = COLORS.BLUE;
            grid[19][i] = COLORS.BLUE;
            grid[i][0] = COLORS.BLUE;
            grid[i][19] = COLORS.BLUE;
        }
        
        // Center 'S'
        drawSprite(grid, getCharGrid('S'), 8, 8, COLORS.YELLOW);
        return grid;
    }
}

export default SnakeLogic;
