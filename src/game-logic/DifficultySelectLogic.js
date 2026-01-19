import ConsoleLogic from './model/ConsoleLogic';
import { createEmptyGrid, COLORS, BUTTONS } from './utils/constants';
import TicTacToeLogic from './TicTacToeLogic';
import Caro5Logic from './Caro5Logic';
import Caro4Logic from './Caro4Logic';
import SnakeLogic from './SnakeLogic';
import LineLogic from './LineLogic';
import MemLogic from './MemLogic';
import PaintLogic from './PaintLogic';

const DIFFICULTIES = [
    { id: 'EASY', label: 'EASY' },
    { id: 'MEDIUM', label: 'MEDIUM' },
    { id: 'HARD', label: 'HARD' }
];

class DifficultySelectLogic extends ConsoleLogic {
    constructor(setMatrix, setScore, setStatus, onExit, onSelectDifficulty, gameId = 'CARO_5') {
        super(setMatrix, setScore, setStatus, onExit);
        this.selectedIndex = 0;
        this.onSelectDifficulty = onSelectDifficulty;
        this.transitionTick = 0;
        this.isTransitioning = false;
        this.gameId = gameId;
        
        // Create temporary game logic instance for preview
        this.gameLogicInstance = this.getGameLogic(gameId);
    }

    /**
     * Factory method to get the correct GameLogic class based on ID.
     */
    getGameLogic(id) {
        const dummySet = () => {};
        
        switch (id) {
            case 'CARO_5': return new Caro5Logic(dummySet, dummySet, dummySet, dummySet);
            case 'CARO_4': return new Caro4Logic(dummySet, dummySet, dummySet, dummySet);
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
            this.selectedIndex = Math.min(DIFFICULTIES.length - 1, this.selectedIndex + 1);
        } else if (action === BUTTONS.ENTER) {
            const selectedDifficulty = DIFFICULTIES[this.selectedIndex];
            this.isTransitioning = true;
            this.transitionTick = 0;
            this.setStatus(`Starting ${selectedDifficulty.label}...`);
        }
    }

    onTick(tick) {
        if (this.isTransitioning) {
            this.transitionTick++;
            if (this.transitionTick > 10) {
                const selectedDifficulty = DIFFICULTIES[this.selectedIndex];
                this.onSelectDifficulty(selectedDifficulty.id);
                return;
            }
            // Show "Starting..." message during transition
            const selectedDifficulty = DIFFICULTIES[this.selectedIndex];
            this.setStatus(`Starting ${selectedDifficulty.label}...`);
        } else {
            // Show difficulty selection UI in status message
            const optionsText = DIFFICULTIES
                .map((d, i) => {
                    const marker = i === this.selectedIndex ? '▶' : ' ';
                    return `${marker} ${d.label}`;
                })
                .join('  |  ');
            this.setStatus(`SELECT DIFFICULTY:  ${optionsText}`);
        }

        // Draw game preview on boardgame
        const grid = createEmptyGrid();
        if (this.gameLogicInstance && this.gameLogicInstance.preview) {
            const previewGrid = this.gameLogicInstance.preview(undefined, tick);
            if (previewGrid) {
                for (let r = 0; r < 20; r++) {
                    for (let c = 0; c < 20; c++) {
                        if (previewGrid[r][c] !== COLORS.OFF) {
                            grid[r][c] = previewGrid[r][c];
                        }
                    }
                }
            }
        }
        
        this.setMatrix(grid);
    }
}

export default DifficultySelectLogic;
