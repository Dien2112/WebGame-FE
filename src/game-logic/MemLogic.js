import GameLogic from './model/GameLogic';
import { initialMemoryState, updateMemory, renderMemory, autoHideCards, getCardIndexFromGrid, updateTimer, GAME_CONFIG } from './utils/memory-game';
import { createEmptyGrid, COLORS } from './utils/constants';
import { getCharGrid } from './utils/pixel-font';
import { drawSprite } from './utils/menu';

const TOTAL_CARDS = GAME_CONFIG.rows * GAME_CONFIG.cols;

class MemLogic extends GameLogic {
    constructor(setMatrix, setScore, setStatus, onExit, savedState) {
        super(setMatrix, setScore, setStatus, onExit);

        // Khởi tạo state từ dữ liệu đã lưu hoặc state mặc định
        this.state = {
            ...initialMemoryState,
            ...(savedState || {})
        };

        this.setStatus('MEMORY GAME');
        this.name = 'MEMORY';
        this.tickCounter = 0;  // Đếm tick để update timer mỗi giây
    }

    preview(saveData, tick) {
        if (!saveData) {
            // Preview game mới -> Hiển thị chữ "MEM"
            const grid = createEmptyGrid();
            drawSprite(grid, getCharGrid('M'), 6, 2, COLORS.RED);
            drawSprite(grid, getCharGrid('E'), 6, 7, COLORS.BLUE);
            drawSprite(grid, getCharGrid('M'), 6, 12, COLORS.YELLOW);

            // Vẽ chữ "GAME"
            drawSprite(grid, getCharGrid('G'), 12, 2, COLORS.PURPLE);
            drawSprite(grid, getCharGrid('A'), 12, 7, '#F97316');
            drawSprite(grid, getCharGrid('M'), 12, 12, '#06b6d4');
            drawSprite(grid, getCharGrid('E'), 12, 17, '#10B981');

            return grid;
        }

        // Hiển thị game đã lưu
        const state = {
            cards: saveData.cards || initialMemoryState.cards,
            matched: saveData.matched || [],
            flipped: [],
            firstCard: null,
            secondCard: null,
            cursor: null
        };

        return renderMemory(state, tick);
    }

    onConsolePress(action, tick) {
        if (action === 'BACK') {
            this.onExit();
            return;
        }

        // Xử lý reset game khi đã thắng hoặc thua
        if (this.state.gameOver && action === 'ENTER') {
            console.log('[MemLogic] Resetting game');
            this.tickCounter = 0;  // Reset bộ đếm tick
        }

        // Cập nhật state theo logic game
        const nextState = updateMemory(this.state, action);
        this.state = nextState;
        this.updateStatus();

        // Cập nhật điểm
        this.setScore(this.state.score);
    }

    onDotClick(r, c) {
        // Chuyển tọa độ pixel thành index thẻ
        const cardIndex = getCardIndexFromGrid(r, c);

        if (cardIndex >= 0 && cardIndex < TOTAL_CARDS) {
            console.log(`[MemLogic] Clicked Card: ${cardIndex}`);

            if (!this.state.gameOver && this.state.canFlip) {
                // Đặt cursor vào thẻ được click
                this.state = {
                    ...this.state,
                    cursor: cardIndex
                };

                // Kích hoạt ENTER để lật thẻ
                this.onConsolePress('ENTER');
            }
        }
    }

    onTick(tick) {
        // Tự động úp thẻ không khớp sau delay
        this.state = autoHideCards(this.state);

        // Cập nhật timer mỗi giây (10 ticks = 1 giây vì tick = 100ms)
        this.tickCounter++;
        if (this.tickCounter >= 10) {
            this.state = updateTimer(this.state);
            this.tickCounter = 0;
        }

        // Vẽ game
        const grid = renderMemory(this.state, tick);
        this.setMatrix(grid);
        this.updateStatus();
    }

    updateStatus() {
        // Chuyển đổi giây thành phút:giây
        const minutes = Math.floor(this.state.timeLeft / 60);
        const seconds = this.state.timeLeft % 60;
        const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        if (this.state.gameOver) {
            if (this.state.isTimedOut) {
                this.setStatus(`TIME OUT! Score:0 Time:0:00`);
            } else {
                this.setStatus(`WIN! Score:${this.state.score} Moves:${this.state.moves} Time:${timeStr}`);
            }
        } else {
            this.setStatus(`Score:${this.state.score} Moves:${this.state.moves} Time:${timeStr}`);
        }
    }
}

export default MemLogic;
