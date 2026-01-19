import GameLogic from './model/GameLogic';
import { createEmptyGrid, COLORS, BUTTONS } from './utils/constants';
import { getCharGrid } from './utils/pixel-font';
import { drawSprite } from './utils/menu';

const PALETTE_COLORS = [
    COLORS.BLACK, '#555555', '#AAAAAA', COLORS.WHITE, // Grayscale
    COLORS.RED, '#EF9999', // Reds
    '#F97316', COLORS.YELLOW, // Orange/Yellow
    COLORS.GREEN, '#10B981', // Greens
    '#06B6D4', COLORS.BLUE, // Cyan/Blue
    '#6366F1', COLORS.PURPLE, // Indigo/Purple
    '#EC4899', '#DB2777'  // Pinks
];

class PaintLogic extends GameLogic {
    constructor(setMatrix, setScore, setStatus, onExit, savedState) {
        super(setMatrix, setScore, setStatus, onExit);
        this.setStatus('PAINT');
        
        this.state = {
            canvas: this.initCanvas(savedState?.canvas),
            cursor: { r: 5, c: 5 }, // Start in canvas
            brushColor: COLORS.BLACK,
            ...savedState
        };
    }

    initCanvas(savedCanvas) {
        if (savedCanvas) return savedCanvas;
        // 20x20 transparent/off
        return createEmptyGrid(); 
    }

    onConsolePress(action, tick) {
        if (action === BUTTONS.BACK) {
            this.onExit();
            return;
        }

        const { cursor } = this.state;
        let nextCursor = { ...cursor };

        if (action === BUTTONS.UP) nextCursor.r = Math.max(0, cursor.r - 1);
        if (action === BUTTONS.DOWN) nextCursor.r = Math.min(19, cursor.r + 1);
        if (action === BUTTONS.LEFT) nextCursor.c = Math.max(0, cursor.c - 1);
        if (action === BUTTONS.RIGHT) nextCursor.c = Math.min(19, cursor.c + 1);

        // Divider Skip Logic (Row 1 is divider)
        // If moving DOWN from 0, jump to 2.
        if (cursor.r === 0 && nextCursor.r === 1) nextCursor.r = 2;
        // If moving UP from 2, jump to 0.
        if (cursor.r === 2 && nextCursor.r === 1) nextCursor.r = 0;

        if (action === BUTTONS.ENTER) {
            this.handleAction(cursor.r, cursor.c);
            return;
        }

        this.updateState({ cursor: nextCursor });
    }

    onDotClick(r, c) {
        if (r < 0 || r >= 20 || c < 0 || c >= 20) return;
        
        // Skip Divider click (Row 1)
        if (r === 1) return;

        this.updateState({ cursor: { r, c } });
        this.handleAction(r, c);
    }

    handleAction(r, c) {
        if (r === 0) {
            // Palette Area (1x1 dots, contiguous)
            // c is directly the index
            const colorIndex = c;
            if (colorIndex < PALETTE_COLORS.length) {
                this.updateState({ brushColor: PALETTE_COLORS[colorIndex] });
            }
        } else if (r >= 2) {
            // Canvas Area
            const newCanvas = this.state.canvas.map(row => [...row]);
            newCanvas[r][c] = this.state.brushColor;
            this.updateState({ canvas: newCanvas });
        }
    }

    updateState(updates) {
        this.state = { ...this.state, ...updates };
        this.status = this.state;
    }

    onTick(tick) {
        const grid = createEmptyGrid();
        const { canvas, cursor, brushColor } = this.state;

        // 1. Draw Canvas (Rows 2+)
        for (let r = 0; r < 20; r++) {
            for (let c = 0; c < 20; c++) {
                 if (r >= 2) {
                     grid[r][c] = canvas[r][c];
                 }
            }
        }

        // 2. Draw Divider (Row 1 - Solid)
        for (let c = 0; c < 20; c++) {
            grid[1][c] = '#555'; // Solid Line
        }

        // 3. Draw Palette (Row 0)
        // Contiguous
        PALETTE_COLORS.forEach((color, idx) => {
            if (idx >= 20) return;
            
            grid[0][idx] = color;
            
            // Selected Indicator
            if (color === brushColor) {
                 if (Math.floor(tick / 10) % 2 === 0) {
                     // Flicker to OFF (Blink) to avoid confusion with White/Greys
                     grid[0][idx] = COLORS.OFF; 
                 }
            }
        });

        // 4. Draw Cursor
        if (Math.floor(tick / 3) % 2 === 0) {
            grid[cursor.r][cursor.c] = COLORS.WHITE; 
        }

        this.setMatrix(grid);
    }

    preview(saveData, tick) {
        const grid = createEmptyGrid();
        drawSprite(grid, getCharGrid('P'), 8, 8, COLORS.RED);
        return grid;
    }
}

export default PaintLogic;
