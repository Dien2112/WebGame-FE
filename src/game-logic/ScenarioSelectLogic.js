import ConsoleLogic from './model/ConsoleLogic';
import TicTacToeLogic from './TicTacToeLogic';
import Caro5Logic from './Caro5Logic';
import Caro4Logic from './Caro4Logic';
import SnakeLogic from './SnakeLogic';
import LineLogic from './LineLogic';
import MemLogic from './MemLogic';
import PaintLogic from './PaintLogic';
import { createEmptyGrid, COLORS, BUTTONS } from './utils/constants';
import { getCharGrid } from './utils/pixel-font';
import { drawSprite } from './utils/menu';

class ScenarioSelectLogic extends ConsoleLogic {
    constructor(setMatrix, setScore, setStatus, onExit, items, gameId, onStartGame) {
        super(setMatrix, setScore, setStatus, onExit);
        this.items = items;
        this.gameId = gameId;
        this.onStartGame = onStartGame;
        this.selectedIndex = 0;
        this.transitionTick = 0;
        this.isTransitioning = false;

        this.gameLogicInstance = this.getGameLogic(gameId); 
    }

    getGameLogic(id) {
        const dummySet = () => {};
        
        switch (id) {
            case 'CARO_5': return new Caro5Logic(dummySet, dummySet, dummySet, dummySet);
            case 'CARO_4': return new Caro4Logic(dummySet, dummySet, dummySet, dummySet);
            case 'CARO5': return new Caro5Logic(dummySet, dummySet, dummySet, dummySet);
            case 'CARO4': return new Caro4Logic(dummySet, dummySet, dummySet, dummySet);
            case 'SNAKE': return new SnakeLogic(dummySet, dummySet, dummySet, dummySet);
            case 'LINE': return new LineLogic(dummySet, dummySet, dummySet, dummySet);
            case 'MEM': return new MemLogic(dummySet, dummySet, dummySet, dummySet);
            case 'PAINT': return new PaintLogic(dummySet, dummySet, dummySet, dummySet);
            default: return new TicTacToeLogic(dummySet, dummySet, dummySet, dummySet);

        }
    }
    
    onConsolePress(action, tick) {
        if (this.isTransitioning) return;

        if (action === BUTTONS.BACK) {
            this.onExit();
        } else if (action === BUTTONS.LEFT) {
            this.selectedIndex = Math.max(0, this.selectedIndex - 1);
        } else if (action === BUTTONS.RIGHT) {
            this.selectedIndex = Math.min(this.items.length - 1, this.selectedIndex + 1);
        } else if (action === BUTTONS.ENTER) {                        
            this.isTransitioning = true;
            this.transitionTick = 0;
        }
    }

    onTick(tick) {
        if (this.isTransitioning) {
            this.transitionTick++;
            if (this.transitionTick > 10) {
                 this.isTransitioning = false;
                 this.onStartGame(this.items[this.selectedIndex], this.gameId);
                 return;
            }
        }

        const grid = createEmptyGrid();
        const currentItem = this.items[this.selectedIndex];

        if (currentItem && this.gameLogicInstance && this.gameLogicInstance.preview) {
             const stateData = currentItem.type === 'SAVE' ? currentItem.data?.preview : undefined;
             
             const previewGrid = this.gameLogicInstance.preview(stateData, tick);
             if (previewGrid) {
                 for(let r=0; r<20; r++) {
                     for(let c=0; c<20; c++) {
                         if (previewGrid[r][c] !== COLORS.OFF) grid[r][c] = previewGrid[r][c];
                     }
                 }
             }
        }
        
        const hasLeft = this.selectedIndex > 0;
        const hasRight = this.selectedIndex < this.items.length - 1;
        this.drawArrows(grid, hasLeft, hasRight, tick);

        this.setMatrix(grid);
        this.setStatus(`${currentItem.label}`);
    }

    drawText(grid, text, startY, startX, color) {
        let currentX = startX;
        for (let i = 0; i < text.length && i < 5; i++) {
            const charGrid = getCharGrid(text[i]);
            drawSprite(grid, charGrid, startY, currentX, color);
            currentX += 4;
        }
    }

    drawArrows(grid, hasLeft, hasRight, tick) {
        if (Math.floor(tick / 5) % 2 !== 0) return;
        if (hasLeft) drawSprite(grid, getCharGrid('<'), 9, 0, COLORS.YELLOW);
        if (hasRight) drawSprite(grid, getCharGrid('>'), 9, 17, COLORS.YELLOW);
    }
}

export const createGameLogic = (internalId, matrix, score, status, setTimer, onExit, savedState, gameId, config = {}) => {
    
    switch (internalId) {
        case 'TICTACTOE': return new TicTacToeLogic(matrix, score, status, onExit, savedState, gameId);
        case 'CARO5': return new Caro5Logic(matrix, score, status, setTimer, onExit, savedState, gameId);
        case 'CARO4': return new Caro4Logic(matrix, score, status, setTimer, onExit, savedState, gameId);
        case 'CARO_5': return new Caro5Logic(matrix, score, status, setTimer, onExit, savedState, gameId); // Fallback/Legacy
        case 'CARO_4': return new Caro4Logic(matrix, score, status, setTimer, onExit, savedState, gameId); // Fallback/Legacy
        case 'SNAKE': return new SnakeLogic(matrix, score, status, setTimer, onExit, savedState, gameId, config);
        case 'LINE': return new LineLogic(matrix, score, status, setTimer, onExit, savedState, gameId, config);
        case 'MEM': return new MemLogic(matrix, score, status, onExit, savedState, gameId, config);
        case 'PAINT': return new PaintLogic(matrix, score, status, onExit, gameId);
        default: return new TicTacToeLogic(matrix, score, status, onExit, savedState, gameId);
    }
};

export default ScenarioSelectLogic;
