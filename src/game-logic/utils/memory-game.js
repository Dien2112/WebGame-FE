import { COLORS, BUTTONS, createEmptyGrid } from './constants';

export const GAME_CONFIG = {
    rows: 4,
    cols: 4,
    cardSize: 4,
    gap: 1,
    offsetY: 1,
    offsetX: 1,
    timeLimit: 120
};

const TOTAL_CARDS = GAME_CONFIG.rows * GAME_CONFIG.cols;
const PAIRS_NEEDED = TOTAL_CARDS / 2;

const COLOR_PAIRS = [
    COLORS.RED,
    COLORS.BLUE,
    COLORS.YELLOW,
    COLORS.PURPLE,
    '#F97316',      // Cam
    '#d82ea8ff',    // Hồng
    '#06b6d4',      // Xanh lơ
    '#10B981',      // Xanh lá
    '#8B5CF6',      // Tím đậm
    '#EC4899',      // Hồng đậm
    '#F59E0B',      // Vàng cam
    '#14B8A6',      // Xanh ngọc
    '#6366F1',      // Indigo
    '#A855F7',      // Tím hồng
    '#EF4444',      // Đỏ tươi
    '#22D3EE',      // Cyan sáng
    '#84CC16',      // Lime
    '#F97316'       // Cam đậm
];

const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

const generateCards = () => {
    if (PAIRS_NEEDED > COLOR_PAIRS.length) {
        console.warn(`Cần ${PAIRS_NEEDED} màu nhưng chỉ có ${COLOR_PAIRS.length} màu!`);
    }

    const selectedColors = COLOR_PAIRS.slice(0, PAIRS_NEEDED);
    const pairs = [...selectedColors, ...selectedColors]; 
    return shuffleArray(pairs);
};

export const initialMemoryState = {
    cards: generateCards(),
    flipped: [],
    matched: [],
    cursor: null,
    score: 0,
    moves: 0,
    gameOver: false,
    canFlip: true,
    firstCard: null,
    secondCard: null,
    hideTimer: 0,
    timeLeft: GAME_CONFIG.timeLimit,
    isTimedOut: false,
    hintsRemaining: 1,
    hintCards: [],
    hintTimer: 0
};

export const updateMemory = (state, button) => {
    if (state.gameOver) {
        if (button === BUTTONS.ENTER) {
            return { ...initialMemoryState, cards: generateCards() };
        }
        return state;
    }

    if (button === BUTTONS.ENTER && state.canFlip) {
        const idx = state.cursor;

        if (idx === null || idx === undefined || idx < 0) return state;

        if (state.matched.includes(idx) || state.flipped.includes(idx)) {
            return state;
        }

        if (state.firstCard === null) {
            return {
                ...state,
                firstCard: idx,
                flipped: [idx]
            };
        }

        if (state.secondCard === null && state.firstCard !== idx) {
            const newFlipped = [state.firstCard, idx];
            const newMoves = state.moves + 1;

            const firstColor = state.cards[state.firstCard];
            const secondColor = state.cards[idx];

            if (firstColor === secondColor) {
                const newMatched = [...state.matched, state.firstCard, idx];
                const newScore = state.score + 40; 
                const gameOver = newMatched.length === TOTAL_CARDS; 

                return {
                    ...state,
                    flipped: [],
                    matched: newMatched,
                    firstCard: null,
                    secondCard: null,
                    moves: newMoves,
                    score: newScore,
                    gameOver
                };
            } else {
                return {
                    ...state,
                    flipped: newFlipped,
                    secondCard: idx,
                    moves: newMoves,
                    canFlip: false, 
                    hideTimer: 9
                };
            }
        }

        return state;
    }

    return state;
};

export const autoHideCards = (state) => {
    if (state.secondCard !== null && !state.canFlip) {
        if (state.hideTimer > 0) {
            return { ...state, hideTimer: state.hideTimer - 1 };
        }

        return {
            ...state,
            flipped: [],
            firstCard: null,
            secondCard: null,
            canFlip: true,
            hideTimer: 0
        };
    }
    return state;
};

export const updateTimer = (state) => {
    if (state.gameOver || state.isTimedOut) {
        return state;
    }

    const newTimeLeft = state.timeLeft - 1;

    if (newTimeLeft <= 0) {
        return {
            ...state,
            timeLeft: 0,
            isTimedOut: true,
            gameOver: true,
            score: 0,  
            canFlip: false
        };
    }

    return {
        ...state,
        timeLeft: newTimeLeft
    };
};

export const getCardIndexFromGrid = (row, col) => {
    const { offsetY, offsetX, cardSize, gap, rows, cols } = GAME_CONFIG;

    const r = row - offsetY;
    const c = col - offsetX;

    if (r < 0 || c < 0) return -1;

    const cellSize = cardSize + gap;
    const totalSizeY = rows * cellSize - gap;
    const totalSizeX = cols * cellSize - gap;

    if (r >= totalSizeY || c >= totalSizeX) return -1;

    const gridRow = Math.floor(r / cellSize);
    const gridCol = Math.floor(c / cellSize);

    const inCardY = r % cellSize < cardSize;
    const inCardX = c % cellSize < cardSize;

    if (inCardY && inCardX && gridRow >= 0 && gridRow < rows && gridCol >= 0 && gridCol < cols) {
        return gridRow * cols + gridCol;
    }

    return -1;
};

export const renderMemory = (state, tick) => {
    const grid = createEmptyGrid();
    const { offsetY, offsetX, cardSize, gap, cols } = GAME_CONFIG;

    for (let i = 0; i < TOTAL_CARDS; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;

        const startY = offsetY + row * (cardSize + gap);
        const startX = offsetX + col * (cardSize + gap);

        const FACE_DOWN_COLOR = '#475569';
        let cardColor = FACE_DOWN_COLOR;

        if (state.matched.includes(i)) {
            cardColor = state.cards[i];
        }
        else if (state.flipped.includes(i)) {
            if (Math.floor(tick / 4) % 2 === 0) {
                cardColor = state.cards[i];
            } else {
                cardColor = FACE_DOWN_COLOR;
            }
        }
        else if (state.hintCards && state.hintCards.includes(i)) {
             if (Math.floor(tick / 2) % 2 === 0) {
                 cardColor = state.cards[i];
             } else {
                 cardColor = FACE_DOWN_COLOR;
             }
        }

        for (let dy = 0; dy < cardSize; dy++) {
            for (let dx = 0; dx < cardSize; dx++) {
                const y = startY + dy;
                const x = startX + dx;
                if (y >= 0 && y < 20 && x >= 0 && x < 20) {
                    grid[y][x] = cardColor;
                }
            }
        }
    }

    return grid;
};
