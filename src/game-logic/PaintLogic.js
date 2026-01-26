import GameLogic from './model/GameLogic';
import { createEmptyGrid, COLORS } from './utils/constants';
import { getCharGrid } from './utils/pixel-font';
import { drawSprite } from './utils/menu';

class PaintLogic extends GameLogic {
    constructor(setMatrix, setScore, setStatus, onExit, savedState) {
        super(setMatrix, setScore, setStatus, onExit);

        this.colorPalette = [
            COLORS.OFF,    // Eraser
            COLORS.BLACK,  // Black
            '#6B7280',     // Gray
            '#991B1B',     // Dark Red
            COLORS.RED,    // Red
            '#F97316',     // Orange
            COLORS.YELLOW, // Yellow
            '#10B981',     // Green
            '#06B6D4',     // Cyan
            COLORS.BLUE,   // Blue
            COLORS.PURPLE, // Purple
            '#FFFFFF',     // White
            '#9CA3AF',     // Light Gray
            '#92400E',     // Brown
            '#FCA5A5',     // Pink
            '#FCD34D',     // Gold
            '#FEF3C7',     // Cream
            '#BEF264',     // Lime
            '#A5F3FC',     // Light Cyan
            '#93C5FD',     // Light Blue
            '#DDD6FE',     // Lavender
        ];

        this.state = {
            selectedColorIndex: savedState?.selectedColorIndex || 4, 
            canvas: savedState?.canvas || this.createEmptyCanvas(),
            customColor: savedState?.customColor || '#FF00FF',
        };

        this.setStatus('PAINT - CLICK TO DRAW');
        this.name = 'PAINT';
    }

    createEmptyCanvas() {
        const canvas = [];
        for (let i = 0; i < 20; i++) {
            canvas.push(new Array(20).fill(COLORS.OFF));
        }
        return canvas;
    }

    setSelectedColor(colorIndex, customColor) {
        this.state.selectedColorIndex = colorIndex;
        if (customColor) {
            this.state.customColor = customColor;
        }
    }

    getSelectedColorIndex() {
        return this.state.selectedColorIndex;
    }

    clearCanvas() {
        this.state.canvas = this.createEmptyCanvas();
        this.setStatus('CANVAS CLEARED!');
        setTimeout(() => this.setStatus('PAINT - CLICK TO DRAW'), 500);
    }

    onConsolePress(action, tick) {
        if (action === 'BACK') {
            this.onExit();
            return;
        }

        if (action === 'LEFT') {
            this.state.selectedColorIndex =
                (this.state.selectedColorIndex - 1 + this.colorPalette.length) % this.colorPalette.length;
        } else if (action === 'RIGHT') {
            this.state.selectedColorIndex =
                (this.state.selectedColorIndex + 1) % this.colorPalette.length;
        } else if (action === 'ENTER') {
            this.state.canvas = this.createEmptyCanvas();
            this.setStatus('CANVAS CLEARED!');
            setTimeout(() => this.setStatus('PAINT - CLICK TO DRAW'), 500);
        }
    }

    onDotClick(r, c) {
        if (r >= 0 && r < 20 && c >= 0 && c < 20) {
            let selectedColor;
            if (this.state.selectedColorIndex === 21) {
                selectedColor = this.state.customColor;
            } else {
                selectedColor = this.colorPalette[this.state.selectedColorIndex];
            }
            this.state.canvas[r][c] = selectedColor;
        }
    }

    onTick(tick) {
        const grid = createEmptyGrid();

        for (let r = 0; r < 20; r++) {
            for (let c = 0; c < 20; c++) {
                grid[r][c] = this.state.canvas[r][c];
            }
        }

        this.setMatrix(grid);
    }

    preview(saveData, tick) {
        const grid = createEmptyGrid();

        if (!saveData) {
            drawSprite(grid, getCharGrid('P'), 8, 4, COLORS.RED);
            drawSprite(grid, getCharGrid('A'), 8, 8, COLORS.YELLOW);
            drawSprite(grid, getCharGrid('I'), 8, 12, COLORS.BLUE);
            drawSprite(grid, getCharGrid('N'), 13, 4, COLORS.PURPLE);
            drawSprite(grid, getCharGrid('T'), 13, 8, COLORS.ON);
            return grid;
        }

        if (saveData.canvas) {
            for (let r = 0; r < 20; r++) {
                for (let c = 0; c < 20; c++) {
                    if (saveData.canvas[r] && saveData.canvas[r][c]) {
                        grid[r][c] = saveData.canvas[r][c];
                    }
                }
            }
        }

        return grid;
    }

    getSaveData() {
        return {
            canvas: this.state.canvas,
            selectedColorIndex: this.state.selectedColorIndex,
            customColor: this.state.customColor,
            width: 20,
            height: 20
        };
    }
}

export default PaintLogic;
