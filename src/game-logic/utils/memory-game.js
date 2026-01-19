import { COLORS, BUTTONS, createEmptyGrid } from './constants';

// Game ghép thẻ: Lưới 4x4 với 8 cặp màu
// Người chơi lật 2 thẻ mỗi lượt để tìm cặp giống nhau

const COLOR_PAIRS = [
    COLORS.RED,
    COLORS.BLUE,
    COLORS.YELLOW,
    COLORS.PURPLE,
    '#F97316',      // Cam
    '#d82ea8ff',    // Hồng
    '#06b6d4',      // Xanh lơ
    '#10B981'       // Xanh lá
];

// Hàm xáo trộn mảng
const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

// Tạo 16 thẻ ngẫu nhiên (8 cặp)
const generateCards = () => {
    const pairs = [...COLOR_PAIRS, ...COLOR_PAIRS]; // Nhân đôi để tạo cặp
    return shuffleArray(pairs);
};

export const initialMemoryState = {
    cards: generateCards(),
    flipped: [],        // Các thẻ đang lật
    matched: [],        // Các thẻ đã ghép đúng
    cursor: null,       // Vị trí thẻ hiện tại
    score: 0,
    moves: 0,
    gameOver: false,
    canFlip: true,      // Cho phép lật thẻ
    firstCard: null,    // Thẻ đầu tiên
    secondCard: null,   // Thẻ thứ hai
    hideTimer: 0,       // Bộ đếm tự động úp thẻ
    timeLeft: 120,      // Thời gian còn lại (giây) - 2 phút
    isTimedOut: false   // Đã hết giờ chưa
};

export const updateMemory = (state, button) => {
    if (state.gameOver) {
        // Nhấn ENTER để chơi lại
        if (button === BUTTONS.ENTER) {
            return { ...initialMemoryState, cards: generateCards() };
        }
        return state;
    }

    // Chỉ xử lý ENTER (khi click thẻ)
    if (button === BUTTONS.ENTER && state.canFlip) {
        const idx = state.cursor;

        // Kiểm tra hợp lệ
        if (idx === null || idx === undefined || idx < 0) return state;

        // Không lật thẻ đã ghép hoặc đang lật
        if (state.matched.includes(idx) || state.flipped.includes(idx)) {
            return state;
        }

        // Lật thẻ đầu tiên
        if (state.firstCard === null) {
            return {
                ...state,
                firstCard: idx,
                flipped: [idx]
            };
        }

        // Lật thẻ thứ hai
        if (state.secondCard === null && state.firstCard !== idx) {
            const newFlipped = [state.firstCard, idx];
            const newMoves = state.moves + 1;

            // So sánh 2 thẻ
            const firstColor = state.cards[state.firstCard];
            const secondColor = state.cards[idx];

            if (firstColor === secondColor) {
                // Khớp!
                const newMatched = [...state.matched, state.firstCard, idx];
                const newScore = state.score + 10;
                const gameOver = newMatched.length === 16; // Đã ghép hết

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
                // Không khớp - hiển thị rồi úp lại
                return {
                    ...state,
                    flipped: newFlipped,
                    secondCard: idx,
                    moves: newMoves,
                    canFlip: false, // Khóa lật thẻ
                    hideTimer: 9   // Đợi 0.9 giây (9 ticks × 100ms)
                };
            }
        }

        return state;
    }

    return state;
};

// Tự động úp thẻ không khớp sau delay
export const autoHideCards = (state) => {
    if (state.secondCard !== null && !state.canFlip) {
        if (state.hideTimer > 0) {
            return { ...state, hideTimer: state.hideTimer - 1 };
        }

        // Reset thẻ đã lật
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

// Cập nhật đồng hồ đếm ngược (gọi mỗi giây)
export const updateTimer = (state) => {
    // Không đếm nếu game đã kết thúc
    if (state.gameOver || state.isTimedOut) {
        return state;
    }

    // Giảm thời gian
    const newTimeLeft = state.timeLeft - 1;

    // Kiểm tra hết giờ
    if (newTimeLeft <= 0) {
        return {
            ...state,
            timeLeft: 0,
            isTimedOut: true,
            gameOver: true,
            score: 0,  // Điểm về 0 khi hết giờ
            canFlip: false
        };
    }

    return {
        ...state,
        timeLeft: newTimeLeft
    };
};

// Thông số bố trí game
export const MEMORY_LAYOUT = {
    offsetY: 1,     // Khoảng cách từ trên
    offsetX: 1,     // Khoảng cách từ trái
    cardSize: 4,    // Kích thước thẻ (4x4)
    gap: 1          // Khoảng cách giữa thẻ
};

export const getCardIndexFromGrid = (row, col) => {
    const { offsetY, offsetX, cardSize, gap } = MEMORY_LAYOUT;

    // Chuẩn hóa tọa độ về gốc (0,0)
    const r = row - offsetY;
    const c = col - offsetX;

    if (r < 0 || c < 0) return -1;

    const cellSize = cardSize + gap;
    const totalSize = 4 * cellSize - gap; // 19

    if (r >= totalSize || c >= totalSize) return -1;

    // Tìm thẻ ở hàng/cột nào trong lưới 4x4
    const gridRow = Math.floor(r / cellSize);
    const gridCol = Math.floor(c / cellSize);

    // Kiểm tra click vào thẻ (không phải khoảng trống)
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
        let cardColor = FACE_DOWN_COLOR; // Mặc định: thẻ úp

        // Ưu tiên 1: Thẻ đã ghép (hiển thị màu cố định)
        if (state.matched.includes(i)) {
            cardColor = state.cards[i];
        }
        // Ưu tiên 2: Thẻ đang lật (nhấp nháy)
        else if (state.flipped.includes(i)) {
            // Nhấp nháy giữa màu thật và màu úp
            if (Math.floor(tick / 4) % 2 === 0) {
                cardColor = state.cards[i];
            } else {
                cardColor = FACE_DOWN_COLOR;
            }
        }

        // Vẽ thẻ (khối 4x4)
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
