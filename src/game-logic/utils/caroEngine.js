import { GRID_SIZE, COLORS } from './constants';

export const initialCaroState = (boardSize, winLength) => ({
    board: Array(boardSize)
        .fill(null)
        .map(() => Array(boardSize).fill(null)), // 20x20

    cursor: { r: Math.floor(boardSize / 2), c: Math.floor(boardSize / 2) }, // bắt đầu giữa bàn
    turn: 'Red',               // 'Red' | 'Blue'
    winner: null,            // 'Red' | 'Blue' | 'DRAW' | null
    winningLine: null,        // [[r,c], ...]
    players: null,      // { Red: 'HUMAN' | 'COMPUTER', Blue: 'HUMAN' | 'COMPUTER' }
    startingPlayer: null,
    boardSize,
    winLength
});

const DIRECTIONS = [
    [0, 1],   // ngang phải
    [1, 0],   // dọc xuống
    [1, 1],   // chéo phải xuống
    [1, -1]   // chéo trái xuống
];

export const getRandomMove = (board, boardSize) => {
    const emptyCells = [];
    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            if (board[r][c] === null) {
                emptyCells.push({ r, c });
            }
        }
    }
    if (emptyCells.length === 0) return null;
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
};


const inBounds = (r, c, boardSize) => r >= 0 && r < boardSize && c >= 0 && c < boardSize;

export const checkWinner = (board, lastMoveR, lastMoveC, winLength) => {
    const player = board[lastMoveR][lastMoveC];
    if (!player) return null;
    for (const [dr, dc] of DIRECTIONS) {
        let count = 1;
        let line = [[lastMoveR, lastMoveC]];

        // Kiếm tra hướng dương
        for (let step = 1; step < winLength; step++) {
            const nr = lastMoveR + dr * step;
            const nc = lastMoveC + dc * step;
            if (inBounds(nr, nc, board.length) && board[nr][nc] === player) {
                count++;
                line.push([nr, nc]);
            } else {
                break;
            }
        }

        // Kiếm tra hướng âm
        for (let step = 1; step < winLength; step++) {
            const nr = lastMoveR - dr * step;
            const nc = lastMoveC - dc * step;
            if (inBounds(nr, nc, board.length) && board[nr][nc] === player) {
                count++;
                line.push([nr, nc]);
            } else {
                break;
            }
        }

        if (count >= winLength) {
            return { winner: player, line };
        }
    }
    return null;
}

export const isBoardFull = (board) => {
    const size = board.length;
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (board[r][c] === null) {
                return false;
            }
        }
    }
    return true;
}

export const updateCaro = (state, action) => {
    if (state.winner) {
        if (action === 'ENTER' || action === 'RESET') {
            return { ...initialCaroState(state.boardSize, state.winLength) };
        }
        return state;
    }

    let { board, cursor, turn } = state;

    if (action === 'LEFT') {
        cursor = { r: cursor.r, c: Math.max(0, cursor.c - 1) };
    } else if (action === 'RIGHT') {
        cursor = { r: cursor.r, c: Math.min(state.boardSize - 1, cursor.c + 1) };
    } else if (action === 'UP') {
        cursor = { r: Math.max(0, cursor.r - 1), c: cursor.c };
    } else if (action === 'DOWN') {
        cursor = { r: Math.min(state.boardSize - 1, cursor.r + 1), c: cursor.c };
    } else if (action === 'ENTER') {
        if (board[cursor.r][cursor.c] === null) {
            const newBoard = board.map(row => row.slice());
            newBoard[cursor.r][cursor.c] = turn;
            const result = checkWinner(newBoard, cursor.r, cursor.c, state.winLength);
            if (result) {
                return {
                    ...state,
                    board: newBoard,
                    winner: result.winner,
                    winningLine: result.line
                };
            } else if (isBoardFull(newBoard)) {
                return {
                    ...state,
                    board: newBoard,
                    winner: 'DRAW'
                };
            } else {
                return {
                    ...state,
                    board: newBoard,
                    turn: turn === 'Red' ? 'Blue' : 'Red'
                };
            }
        }
    }
    return {
        ...state,
        cursor
    };
}

export const renderCaro = (state, tick) => {
    const grid = Array(GRID_SIZE)
        .fill(null)
        .map(() => Array(GRID_SIZE).fill(COLORS.BLACK));

    const offset = Math.floor((GRID_SIZE - state.boardSize) / 2);

    for (let r = 0; r < state.boardSize; r++) {
        for (let c = 0; c < state.boardSize; c++) {
            grid[r + offset][c + offset] = COLORS.OFF;
        }
    }

    for (let r = 0; r < state.boardSize; r++) {
        for (let c = 0; c < state.boardSize; c++) {
            const gr = r + offset;
            const gc = c + offset;
            if (state.board[r][c] === 'Red') {
                grid[gr][gc] = COLORS.RED;
            } else if (state.board[r][c] === 'Blue') {
                grid[gr][gc] = COLORS.BLUE;
            }
        }
    }

    // Highlight winning line
    if (state.winningLine) {
        for (const [r, c] of state.winningLine) {
            grid[r+ offset][c+ offset] = COLORS.YELLOW;
        }
    }

    // Cursor blinking
    if (!state.winner && Math.floor(tick / 3) % 2 === 0) {
        const { r, c } = state.cursor;
        grid[r+ offset][c+ offset] = COLORS.WHITE;
    }
    return grid;
}