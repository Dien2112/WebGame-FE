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

/**
 * MEDIUM AI - Heuristic đơn giản: Thắng → Chặn → Tấn công gần các quân
 */
const isOpenThreat = (board, r, c, player, winLength) => {
    const DIRECTIONS = [[0,1], [1,0], [1,1], [1,-1]];

    for (const [dr, dc] of DIRECTIONS) {
        let count = 1;
        let openEnds = 0;

        // forward
        let i = 1;
        while (true) {
            const nr = r + dr * i;
            const nc = c + dc * i;
            if (nr < 0 || nc < 0 || nr >= GRID_SIZE || nc >= GRID_SIZE) break;
            if (board[nr][nc] === player) count++;
            else {
                if (board[nr][nc] === null) openEnds++;
                break;
            }
            i++;
        }

        // backward
        i = 1;
        while (true) {
            const nr = r - dr * i;
            const nc = c - dc * i;
            if (nr < 0 || nc < 0 || nr >= GRID_SIZE || nc >= GRID_SIZE) break;
            if (board[nr][nc] === player) count++;
            else {
                if (board[nr][nc] === null) openEnds++;
                break;
            }
            i++;
        }

        // Điều kiện đe doạ
        if (
            count >= winLength - 2 &&
            openEnds === 2
        ) {
            return true;
        }
    }
    return false;
};

export const getMediumMove = (board, player, opponent, winLength) => {
    const GRID_SIZE = 20;
    
    // Helper: Count pieces in direction
    const countDir = (r, c, dr, dc) => {
        let count = 0;
        for (let i = 1; i < winLength; i++) {
            const nr = r + dr * i;
            const nc = c + dc * i;
            if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE || board[nr][nc] !== player) break;
            count++;
        }
        return count;
    };
    
    const canWin = (r, c, checkPlayer) => {
        const directions = [[0,1], [1,0], [1,1], [1,-1]];
        for (const [dr, dc] of directions) {
            const pos = countDir(r, c, dr, dc);
            const neg = countDir(r, c, -dr, -dc);
            if (pos + neg + 1 >= winLength) return true;
        }
        return false;
    };
    
    // Step 1: Check if can win
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (board[r][c] === null) {
                board[r][c] = player;
                if (canWin(r, c, player)) {
                    board[r][c] = null;
                    return { r, c };
                }
                board[r][c] = null;
            }
        }
    }

    // Step 1.5: Block open-ended threats
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (board[r][c] === null) {
                board[r][c] = opponent;
                if (isOpenThreat(board, r, c, opponent, winLength)) {
                    board[r][c] = null;
                    return { r, c };
                }
                board[r][c] = null;
            }
        }
    }
    
    // Step 2: Check if need to block opponent
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (board[r][c] === null) {
                board[r][c] = opponent;
                if (canWin(r, c, opponent)) {
                    board[r][c] = null;
                    return { r, c };
                }
                board[r][c] = null;
            }
        }
    }
    
    // Step 3: Find best attacking position
    const scoredMoves = [];
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (board[r][c] === null) {
                // Check if near any piece
                let nearPiece = false;
                for (let dr = -2; dr <= 2; dr++) {
                    for (let dc = -2; dc <= 2; dc++) {
                        const nr = r + dr;
                        const nc = c + dc;
                        if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && board[nr][nc] !== null) {
                            nearPiece = true;
                            break;
                        }
                    }
                    if (nearPiece) break;
                }
                
                if (nearPiece) {
                    // Score based on piece count
                    let score = 0;
                    const directions = [[0,1], [1,0], [1,1], [1,-1]];
                    for (const [dr, dc] of directions) {
                        const pos = countDir(r, c, dr, dc);
                        const neg = countDir(r, c, -dr, -dc);
                        score += pos + neg;
                    }
                    scoredMoves.push({ r, c, score });
                }
            }
        }
    }
    
    if (scoredMoves.length > 0) {
        scoredMoves.sort((a, b) => b.score - a.score);
        // Pick top move with 30% random choice for variety
        const topMoves = scoredMoves.slice(0, 3);
        return topMoves[Math.floor(Math.random() * topMoves.length)];
    }
    
    return getRandomMove(board);
};

/**
 * HARD AI - Minimax depth 2 với heuristic evaluation
 */
export const getHardMove = (board, player, opponent, winLength) => {
    const GRID_SIZE = 20;
    const DEPTH = 2; // Shallow depth to avoid lag
    
    const getEmptyCellsNearby = () => {
        const cells = [];
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (board[r][c] === null) {
                    let nearby = false;
                    for (let dr = -3; dr <= 3; dr++) {
                        for (let dc = -3; dc <= 3; dc++) {
                            const nr = r + dr;
                            const nc = c + dc;
                            if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && board[nr][nc] !== null) {
                                nearby = true;
                                break;
                            }
                        }
                        if (nearby) break;
                    }
                    if (nearby) cells.push({ r, c });
                }
            }
        }
        return cells.length > 0 ? cells : getRandomMove(board) ? [getRandomMove(board)] : [];
    };
    
    const evaluateBoard = (testBoard) => {
        let score = 0;
        const DIRECTIONS = [[0,1], [1,0], [1,1], [1,-1]];
        
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (testBoard[r][c] === null) {
                    // ⚠️ ĐÁNH GIÁ ĐE DOẠ MỞ

                    // Đối thủ đánh vào đây có nguy hiểm không?
                    testBoard[r][c] = opponent;
                    if (isOpenThreat(testBoard, r, c, opponent, winLength)) {
                        score -= 10000; // BẮT BUỘC phải block
                    }
                    testBoard[r][c] = null;

                    // AI đánh vào đây có lợi không?
                    testBoard[r][c] = player;
                    if (isOpenThreat(testBoard, r, c, player, winLength)) {
                        score += 8000;
                    }
                    testBoard[r][c] = null;
                }
                if (testBoard[r][c] === player) {
                    for (const [dr, dc] of DIRECTIONS) {
                        let count = 1;
                        for (let i = 1; i < winLength; i++) {
                            const nr = r + dr * i;
                            const nc = c + dc * i;
                            if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && testBoard[nr][nc] === player) {
                                count++;
                            }
                        }
                        score += count * count; // Exponential scoring
                    }
                } else if (testBoard[r][c] === opponent) {
                    for (const [dr, dc] of DIRECTIONS) {
                        let count = 1;
                        for (let i = 1; i < winLength; i++) {
                            const nr = r + dr * i;
                            const nc = c + dc * i;
                            if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && testBoard[nr][nc] === opponent) {
                                count++;
                            }
                        }
                        score -= count * count * 1.2; // Opponent weighted more
                    }
                }
            }
        }
        return score;
    };
    
    const minimax = (testBoard, depth, isMax, alpha, beta) => {
        if (depth === 0) {
            return evaluateBoard(testBoard);
        }
        
        const availableMoves = getEmptyCellsNearby().slice(0, 8); // Limit to 8 moves
        
        if (isMax) {
            let maxEval = -Infinity;
            for (const { r, c } of availableMoves) {
                const newBoard = testBoard.map(row => [...row]);
                newBoard[r][c] = player;
                const eval_ = minimax(newBoard, depth - 1, false, alpha, beta);
                maxEval = Math.max(maxEval, eval_);
                alpha = Math.max(alpha, eval_);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const { r, c } of availableMoves) {
                const newBoard = testBoard.map(row => [...row]);
                newBoard[r][c] = opponent;
                const eval_ = minimax(newBoard, depth - 1, true, alpha, beta);
                minEval = Math.min(minEval, eval_);
                beta = Math.min(beta, eval_);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    };
    
    let bestMove = null;
    let bestValue = -Infinity;
    const topMoves = getEmptyCellsNearby().slice(0, 10);
    
    for (const { r, c } of topMoves) {
        const newBoard = board.map(row => [...row]);
        newBoard[r][c] = player;
        const value = minimax(newBoard, DEPTH - 1, false, -Infinity, Infinity);
        
        if (value > bestValue) {
            bestValue = value;
            bestMove = { r, c };
        }
    }
    
    return bestMove || getMediumMove(board, player, opponent, winLength);
};