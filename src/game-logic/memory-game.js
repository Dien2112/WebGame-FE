import { COLORS, BUTTONS, createEmptyGrid } from './constants';

// Memory Game: 4x4 grid with 8 color pairs
// Player flips 2 cards at a time to find matching colors

const COLOR_PAIRS = [
    COLORS.RED,
    COLORS.BLUE,
    COLORS.YELLOW,
    COLORS.PURPLE,
    '#F97316',      // Orange
    '#d82ea8ff', // pink
    //COLORS.BLACK,
    '#06b6d4',      // Cyan (was COLORS.WHITE)
    '#10B981'       // Green
];

// Shuffle array helper
const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

// Generate shuffled cards (8 pairs = 16 cards)
const generateCards = () => {
    const pairs = [...COLOR_PAIRS, ...COLOR_PAIRS]; // Duplicate for pairs
    return shuffleArray(pairs);
};

export const initialMemoryState = {
    cards: generateCards(),
    flipped: [],        // Indices of currently flipped cards
    matched: [],        // Indices of matched cards
    cursor: null,       // No default cursor for click-only
    score: 0,
    moves: 0,
    gameOver: false,
    canFlip: true,      // Prevent flipping during comparison
    firstCard: null,    // First card index in current move
    secondCard: null,   // Second card index in current move
    hideTimer: 0        // Timer for auto-hiding cards
};

export const updateMemory = (state, button) => {
    if (state.gameOver) {
        // Reset on ENTER
        if (button === BUTTONS.ENTER) {
            return { ...initialMemoryState, cards: generateCards() };
        }
        return state;
    }

    // Only handle ENTER (triggered by Click)
    if (button === BUTTONS.ENTER && state.canFlip) {
        const idx = state.cursor;

        // Validation
        if (idx === null || idx === undefined || idx < 0) return state;

        // Can't flip already matched or already flipped cards
        if (state.matched.includes(idx) || state.flipped.includes(idx)) {
            return state;
        }

        // First card flip
        if (state.firstCard === null) {
            return {
                ...state,
                firstCard: idx,
                flipped: [idx]
            };
        }

        // Second card flip
        if (state.secondCard === null && state.firstCard !== idx) {
            const newFlipped = [state.firstCard, idx];
            const newMoves = state.moves + 1;

            // Check if cards match
            const firstColor = state.cards[state.firstCard];
            const secondColor = state.cards[idx];

            if (firstColor === secondColor) {
                // Match found!
                const newMatched = [...state.matched, state.firstCard, idx];
                const newScore = state.score + 10;
                const gameOver = newMatched.length === 16; // All cards matched

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
                // No match - show both cards briefly, then hide
                return {
                    ...state,
                    flipped: newFlipped,
                    secondCard: idx,
                    moves: newMoves,
                    canFlip: false, // Disable flipping during reveal
                    hideTimer: 8   // Wait 1.5 seconds (15 ticks)
                };
            }
        }

        return state;
    }

    return state;
};

// Auto-hide mismatched cards after delay
export const autoHideCards = (state) => {
    if (state.secondCard !== null && !state.canFlip) {
        if (state.hideTimer > 0) {
            return { ...state, hideTimer: state.hideTimer - 1 };
        }

        // Reset flipped cards
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

// Game Layout Constants
export const MEMORY_LAYOUT = {
    offsetY: 1,
    offsetX: 1,
    cardSize: 4,
    gap: 1
};

export const getCardIndexFromGrid = (row, col) => {
    const { offsetY, offsetX, cardSize, gap } = MEMORY_LAYOUT;

    // Normalize coordinates relative to the grid start
    const r = row - offsetY;
    const c = col - offsetX;

    if (r < 0 || c < 0) return -1;

    const cellSize = cardSize + gap;
    const totalSize = 4 * cellSize - gap; // 19

    if (r >= totalSize || c >= totalSize) return -1;

    // Determine potential row/col index in the 4x4 array
    const gridRow = Math.floor(r / cellSize);
    const gridCol = Math.floor(c / cellSize);

    // Check if the click is within the card (not in the gap)
    const inCardY = r % cellSize < cardSize;
    const inCardX = c % cellSize < cardSize;

    if (inCardY && inCardX && gridRow >= 0 && gridRow < 4 && gridCol >= 0 && gridCol < 4) {
        return gridRow * 4 + gridCol;
    }

    return -1;
};

export const renderMemory = (state, tick) => {
    const grid = createEmptyGrid();
    const { offsetY, offsetX, cardSize, gap } = MEMORY_LAYOUT;

    for (let i = 0; i < 16; i++) {
        const row = Math.floor(i / 4);
        const col = i % 4;

        const startY = offsetY + row * (cardSize + gap);
        const startX = offsetX + col * (cardSize + gap);

        const FACE_DOWN_COLOR = '#475569';
        let cardColor = FACE_DOWN_COLOR; // Default: face down

        // Priority 1: Matched (Static Color)
        if (state.matched.includes(i)) {
            cardColor = state.cards[i];
        }
        // Priority 2: Flipped (Blinking its color)
        else if (state.flipped.includes(i)) {
            // Blink between Card Color and Face Down Color (hiding/showing logic)
            if (Math.floor(tick / 4) % 2 === 0) {
                cardColor = state.cards[i];
            } else {
                cardColor = FACE_DOWN_COLOR;
            }
        }

        // Draw card (4x4 block)
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
