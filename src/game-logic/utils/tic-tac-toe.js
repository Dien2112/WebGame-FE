import { GRID_SIZE, COLORS } from './constants';

export const initialTicTacToeState = {
    board: Array(3).fill(null).map(() => Array(3).fill(null)), // 3x3 game board
    turn: 'X', // 'X' (Player) or 'O' (Computer)
    cursor: { r: 1, c: 1 }, // Cursor position (0-2, 0-2)
    winner: null, // 'X', 'O', 'DRAW', or null
    winningLine: null // Array of coordinates [[r,c],...]
};

const checkWin = (board) => {
    const lines = [
        // Rows
        [[0,0], [0,1], [0,2]],
        [[1,0], [1,1], [1,2]],
        [[2,0], [2,1], [2,2]],
        // Cols
        [[0,0], [1,0], [2,0]],
        [[0,1], [1,1], [2,1]],
        [[0,2], [1,2], [2,2]],
        // Diagonals
        [[0,0], [1,1], [2,2]],
        [[0,2], [1,1], [2,0]]
    ];

    for (const line of lines) {
        const [a, b, c] = line;
        if (board[a[0]][a[1]] && 
            board[a[0]][a[1]] === board[b[0]][b[1]] && 
            board[a[0]][a[1]] === board[c[0]][c[1]]) {
            return { winner: board[a[0]][a[1]], line };
        }
    }
    return null;
};

const checkDraw = (board) => {
    return board.every(row => row.every(cell => cell !== null));
};

const getAvailableMoves = (board) => {
    const moves = [];
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            if (!board[r][c]) moves.push({ r, c });
        }
    }
    return moves;
};

export const updateTicTacToe = (state, button) => {
    if (state.winner) {
        // Game over, any button resets
        if (button === 'ENTER') {
            return { ...initialTicTacToeState };
        }
        return state;
    }

    // Player Turn Logic ('X')
    if (state.turn !== 'X') return state; // Ignore input if not player turn

    let { r, c } = state.cursor;
    const newBoard = state.board.map(row => [...row]);

    switch (button) {
        case 'UP':
            r = Math.max(0, r - 1);
            break;
        case 'DOWN':
            r = Math.min(2, r + 1);
            break;
        case 'LEFT':
            c = Math.max(0, c - 1);
            break;
        case 'RIGHT':
            c = Math.min(2, c + 1);
            break;
        case 'ENTER':
            if (!newBoard[r][c]) {
                // 1. PLACE PLAYER MOVE
                newBoard[r][c] = 'X';
                
                // Check Player Win
                const winResult = checkWin(newBoard);
                if (winResult) {
                    return {
                        ...state,
                        board: newBoard,
                        winner: winResult.winner,
                        winningLine: winResult.line
                    };
                }
                // Check Draw
                if (checkDraw(newBoard)) {
                    return { ...state, board: newBoard, winner: 'DRAW' };
                }

                // 2. COMPUTER TURN (Immediate Response)
                let computerBoard = newBoard.map(row => [...row]);
                const moves = getAvailableMoves(computerBoard);
                if (moves.length > 0) {
                    const randomMove = moves[Math.floor(Math.random() * moves.length)];
                    computerBoard[randomMove.r][randomMove.c] = 'O';

                    // Check Computer Win
                    const cpuWin = checkWin(computerBoard);
                    if (cpuWin) {
                         return {
                            ...state,
                            board: computerBoard,
                            cursor: { r, c },
                            winner: cpuWin.winner,
                            winningLine: cpuWin.line
                        };
                    }
                     // Check Draw (Unlikely but possible)
                    if (checkDraw(computerBoard)) {
                        return { ...state, board: computerBoard, cursor: {r,c}, winner: 'DRAW' };
                    }
                }

                return {
                    ...state,
                    board: computerBoard,
                    turn: 'X', // Back to player
                    cursor: { r, c }
                };
            }
            break;
    }

    return {
        ...state,
        cursor: { r, c }
    };
};

const drawX = (grid, startY, startX, color) => {
    // 4x4 X shape
    // X . . X
    // . X X .
    // . X X .
    // X . . X
    if (startY < 0 || startY+3 >= GRID_SIZE || startX < 0 || startX+3 >= GRID_SIZE) return;
    grid[startY][startX] = color;
    grid[startY][startX+3] = color;
    grid[startY+1][startX+1] = color;
    grid[startY+1][startX+2] = color;
    grid[startY+2][startX+1] = color;
    grid[startY+2][startX+2] = color;
    grid[startY+3][startX] = color;
    grid[startY+3][startX+3] = color;
};

const drawO = (grid, startY, startX, color) => {
    // 4x4 Circle shape
    // . X X .
    // X . . X
    // X . . X
    // . X X .
    if (startY < 0 || startY+3 >= GRID_SIZE || startX < 0 || startX+3 >= GRID_SIZE) return;
    grid[startY][startX+1] = color;
    grid[startY][startX+2] = color;
    grid[startY+1][startX] = color;
    grid[startY+1][startX+3] = color;
    grid[startY+2][startX] = color;
    grid[startY+2][startX+3] = color;
    grid[startY+3][startX+1] = color;
    grid[startY+3][startX+2] = color;
};

export const renderTicTacToe = (state, tick) => {
    const grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(COLORS.OFF));

    // Layout Calculation
    // Total Grid: 20x20
    // Cell size: 4x4
    // Gap: 1
    // Total dim = (4 * 3) + (1 * 2) = 14 pixels.
    // Center: (20 - 14) / 2 = 3.
    // Start at 3.
    
    const startRow = 3;
    const startCol = 3;
    const cellSize = 4;
    const gap = 1;

    // Draw Grid Lines (Separators)
    // Vert: 3 + 4 = 7; 7+1+4 = 12.
    // Horz: same
    for (let r = startRow; r < startRow + 14; r++) {
        grid[r][startCol + 4] = COLORS.BLACK; 
        grid[r][startCol + 9] = COLORS.BLACK; 
    }
    for (let c = startCol; c < startCol + 14; c++) {
        grid[startRow + 4][c] = COLORS.BLACK;
        grid[startRow + 9][c] = COLORS.BLACK;
    }

    // Draw Cells
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            const cellValue = state.board[r][c];
            const cellY = startRow + r * (cellSize + gap);
            const cellX = startCol + c * (cellSize + gap);

            // Flicker logic for Cursor
            const isSelected = !state.winner && state.cursor.r === r && state.cursor.c === c;
            
            // Background Flicker if Occupied and Selected
            if (isSelected && cellValue) {
                 if (Math.floor(tick / 2) % 2 === 0) {
                     for(let i=0; i<4; i++) for(let j=0; j<4; j++) grid[cellY+i][cellX+j] = COLORS.WHITE;
                 }
            }
            // Background Flicker if Empty and Selected (Cursor)
            else if (isSelected && !cellValue) {
                // Subtle flicker of edges or faint color? 
                // Let's use a weak color or just Blink Blue?
                // "selecting - other color"
                if (Math.floor(tick / 3) % 2 === 0) {
                    for(let i=0; i<4; i++) for(let j=0; j<4; j++) grid[cellY+i][cellX+j] = '#94A3B8'; // Slate-400 (visible but not ON)
                }
            }

            // Draw Content
            if (cellValue === 'X') {
                drawX(grid, cellY, cellX, COLORS.RED);
            } else if (cellValue === 'O') {
                drawO(grid, cellY, cellX, COLORS.BLUE);
            }
        }
    }

    // Draw Winner Line
    if (state.winningLine) {
         state.winningLine.forEach(([r, c]) => {
             const cellY = startRow + r * (cellSize + gap);
             const cellX = startCol + c * (cellSize + gap);
             // Highlight winning cells
             if (Math.floor(tick / 2) % 2 === 0) {
                 for(let i=0; i<4; i++) for(let j=0; j<4; j++) grid[cellY+i][cellX+j] = COLORS.WHITE;
             }
         });
    }

    return grid;
};
