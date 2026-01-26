import { GRID_SIZE, COLORS } from './constants';

export const initialTicTacToeState = {
    board: Array(3).fill(null).map(() => Array(3).fill(null)),
    turn: 'X',
    cursor: { r: 1, c: 1 },
    winner: null,
    winningLine: null
};

const checkWin = (board) => {
    const lines = [
        [[0,0], [0,1], [0,2]],
        [[1,0], [1,1], [1,2]],
        [[2,0], [2,1], [2,2]],
        [[0,0], [1,0], [2,0]],
        [[0,1], [1,1], [2,1]],
        [[0,2], [1,2], [2,2]],
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

export const computerMove = (state) => {
    const newBoard = state.board.map(row => [...row]);
    const moves = getAvailableMoves(newBoard);

    if (moves.length > 0) {
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        newBoard[randomMove.r][randomMove.c] = 'O';

        const cpuWin = checkWin(newBoard);
        if (cpuWin) {
             return {
                ...state,
                board: newBoard,
                winner: cpuWin.winner,
                winningLine: cpuWin.line
            };
        }
        if (checkDraw(newBoard)) {
            return { ...state, board: newBoard, winner: 'DRAW' };
        }
    }

    return {
        ...state,
        board: newBoard,
        turn: 'X'
    };
};

export const updateTicTacToe = (state, button) => {
    if (state.winner) {
        
        if (button === 'ENTER') {
            return { ...initialTicTacToeState };
        }
        return state;
    }

    if (state.turn !== 'X') return state;

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
                newBoard[r][c] = 'X';
                
                const winResult = checkWin(newBoard);
                if (winResult) {
                    return {
                        ...state,
                        board: newBoard,
                        winner: winResult.winner,
                        winningLine: winResult.line
                    };
                }
                if (checkDraw(newBoard)) {
                    return { ...state, board: newBoard, winner: 'DRAW' };
                }

                const intermediateState = { ...state, board: newBoard, turn: 'O' };
                return computerMove(intermediateState);
            }
            break;
    }

    return {
        ...state,
        cursor: { r, c }
    };
};

const drawX = (grid, startY, startX, color) => {
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

    const startRow = 3;
    const startCol = 3;
    const cellSize = 4;
    const gap = 1;

    for (let r = startRow; r < startRow + 14; r++) {
        grid[r][startCol + 4] = COLORS.BLACK; 
        grid[r][startCol + 9] = COLORS.BLACK; 
    }
    for (let c = startCol; c < startCol + 14; c++) {
        grid[startRow + 4][c] = COLORS.BLACK;
        grid[startRow + 9][c] = COLORS.BLACK;
    }

    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            const cellValue = state.board[r][c];
            const cellY = startRow + r * (cellSize + gap);
            const cellX = startCol + c * (cellSize + gap);

            const isSelected = !state.winner && state.cursor.r === r && state.cursor.c === c;
            
            if (isSelected && cellValue) {
                 if (Math.floor(tick / 2) % 2 === 0) {
                     for(let i=0; i<4; i++) for(let j=0; j<4; j++) grid[cellY+i][cellX+j] = COLORS.WHITE;
                 }
            }
            else if (isSelected && !cellValue) {
                if (Math.floor(tick / 3) % 2 === 0) {
                    for(let i=0; i<4; i++) for(let j=0; j<4; j++) grid[cellY+i][cellX+j] = '#94A3B8'; // Slate-400 (visible but not ON)
                }
            }

            if (cellValue === 'X') {
                drawX(grid, cellY, cellX, COLORS.RED);
            } else if (cellValue === 'O') {
                drawO(grid, cellY, cellX, COLORS.BLUE);
            }
        }
    }

    if (state.winningLine) {
         state.winningLine.forEach(([r, c]) => {
             const cellY = startRow + r * (cellSize + gap);
             const cellX = startCol + c * (cellSize + gap);
             if (Math.floor(tick / 2) % 2 === 0) {
                 for(let i=0; i<4; i++) for(let j=0; j<4; j++) grid[cellY+i][cellX+j] = COLORS.WHITE;
             }
         });
    }

    return grid;
};
