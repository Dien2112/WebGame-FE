import { GRID_SIZE, COLORS } from './constants';

export const initialCaroState = (winLength) => ({
    board: Array(GRID_SIZE)
        .fill(null)
        .map(() => Array(GRID_SIZE).fill(null)), // 20x20

    cursor: { r: 10, c: 10 }, // bắt đầu giữa bàn
    turn: 'Red',               // 'Red' | 'Blue'
    winner: null,            // 'Red' | 'Blue' | 'DRAW' | null
    winningLine: null,        // [[r,c], ...]
    players: null,      // { Red: 'HUMAN' | 'COMPUTER', Blue: 'HUMAN' | 'COMPUTER' }
    startingPlayer: null,
    winLength
});

const DIRECTIONS = [
    [0, 1],   // ngang phải
    [1, 0],   // dọc xuống
    [1, 1],   // chéo phải xuống
    [1, -1]   // chéo trái xuống
];

export const getRandomMove = (board) => {
    const emptyCells = [];
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (board[r][c] === null) {
                emptyCells.push({ r, c });
            }
        }
    }
    if (emptyCells.length === 0) return null;
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
};


const inBounds = (r, c) => r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE;

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
            if (inBounds(nr, nc) && board[nr][nc] === player) {
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
            if (inBounds(nr, nc) && board[nr][nc] === player) {
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
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
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
            return { ...initialCaro5State };
        }
        return state;
    }

    let { board, cursor, turn } = state;

    if (action === 'LEFT') {
        cursor = { r: cursor.r, c: Math.max(0, cursor.c - 1) };
    } else if (action === 'RIGHT') {
        cursor = { r: cursor.r, c: Math.min(GRID_SIZE - 1, cursor.c + 1) };
    } else if (action === 'UP') {
        cursor = { r: Math.max(0, cursor.r - 1), c: cursor.c };
    } else if (action === 'DOWN') {
        cursor = { r: Math.min(GRID_SIZE - 1, cursor.r + 1), c: cursor.c };
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
        .map(() => Array(GRID_SIZE).fill(COLORS.OFF));

    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (state.board[r][c] === 'Red') {
                grid[r][c] = COLORS.RED;
            } else if (state.board[r][c] === 'Blue') {
                grid[r][c] = COLORS.BLUE;
            }
        }
    }

    // Highlight winning line
    if (state.winningLine) {
        for (const [r, c] of state.winningLine) {
            grid[r][c] = COLORS.YELLOW;
        }
    }

    // Cursor blinking
    if (!state.winner && Math.floor(tick / 3) % 2 === 0) {
        const { r, c } = state.cursor;
        grid[r][c] = COLORS.WHITE;
    }
    return grid;
}