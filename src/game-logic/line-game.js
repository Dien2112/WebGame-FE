import { GRID_SIZE, COLORS } from './constants';

const GAME_COLORS = [COLORS.RED, COLORS.BLUE, COLORS.YELLOW, COLORS.PURPLE, COLORS.WHITE];

export const initialLineState = {
    board: Array(5).fill(null).map(() => 
        Array(5).fill(null).map(() => GAME_COLORS[Math.floor(Math.random() * GAME_COLORS.length)])
    ),
    cursor: { r: 2, c: 2 },
    selected: null // {r, c}
};

export const updateLineGame = (state, button) => {
    let { r, c } = state.cursor;
    
    switch (button) {
        case 'UP':
            r = Math.max(0, r - 1);
            break;
        case 'DOWN':
            r = Math.min(4, r + 1);
            break;
        case 'LEFT':
            c = Math.max(0, c - 1);
            break;
        case 'RIGHT':
            c = Math.min(4, c + 1);
            break;
        case 'ENTER':
            // Selection Logic
            if (state.selected) {
                if (state.selected.r === r && state.selected.c === c) {
                    // Deselect if same
                    return { ...state, selected: null };
                } else {
                    // Swap Logic Placeholder
                    // For now, just select the new one as requested ("if far, the new-chosen become the chosen")
                    // Let's implement adjacent check later or now? User said "dont implement now" for swap.
                    return { ...state, selected: { r, c } }; 
                }
            } else {
                return { ...state, selected: { r, c } };
            }
    }

    return {
        ...state,
        cursor: { r, c }
    };
};

export const renderLineGame = (state, tick) => {
    const grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(COLORS.OFF));

    // Layout
    // 5x5 grid.
    // Tile 3x3.
    // Gap 1.
    // Total dim = 5*3 + 4*1 = 15 + 4 = 19.
    // Center in 20x20. (20-19)/2 = 0.5 -> Start at 0 or 1. Let's start at 0 (centering 0-18 vs 1-19).
    // Let's start at 0, so it uses 0..18. 
    // Wait, 3*5 + 4 = 19 pixels.
    // Indices: 0, 4, 8, 12, 16.
    
    const startRow = 0;
    const startCol = 0;
    const cellSize = 3;
    const gap = 1;

    // Draw Board
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            const color = state.board[r][c];
            const cellY = startRow + r * (cellSize + gap);
            const cellX = startCol + c * (cellSize + gap);

            // Determine rendering style based on selection
            const isCursor = state.cursor.r === r && state.cursor.c === c;
            const isSelected = state.selected && state.selected.r === r && state.selected.c === c;

            // Base Tile Draw
            for(let i=0; i<3; i++) {
                for(let j=0; j<3; j++) {
                    grid[cellY+i][cellX+j] = color;
                }
            }

            // Effects
            if (isSelected) {
                // "flicker harder/ paint the whole border (?)"
                // Let's invert colors or flash white aggressively
                if (Math.floor(tick / 2) % 2 === 0) {
                     // Draw Border White
                     for(let i=0; i<3; i++) {
                        grid[cellY][cellX+i] = COLORS.WHITE; // Top
                        grid[cellY+2][cellX+i] = COLORS.WHITE; // Bottom
                        grid[cellY+i][cellX] = COLORS.WHITE; // Left
                        grid[cellY+i][cellX+2] = COLORS.WHITE; // Right
                     }
                }
            } else if (isCursor) {
                // "selector on tile: flicker the corner"
                if (Math.floor(tick / 4) % 2 === 0) {
                    grid[cellY][cellX] = COLORS.BLACK;
                    grid[cellY][cellX+2] = COLORS.BLACK;
                    grid[cellY+2][cellX] = COLORS.BLACK;
                    grid[cellY+2][cellX+2] = COLORS.BLACK;
                }
            }
        }
    }

    return grid;
};
