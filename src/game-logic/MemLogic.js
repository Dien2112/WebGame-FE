import GameLogic from './model/GameLogic';
import { initialMemoryState, updateMemory, renderMemory, autoHideCards, getCardIndexFromGrid } from './utils/memory-game';
import { createEmptyGrid, COLORS } from './utils/constants';
import { getCharGrid } from './utils/pixel-font';
import { drawSprite } from './utils/menu';

class MemLogic extends GameLogic {
    constructor(setMatrix, setScore, setStatus, onExit, savedState) {
        super(setMatrix, setScore, setStatus, onExit);

        // Initialize state from saved data or use initial state
        this.state = {
            ...initialMemoryState,
            ...(savedState || {})
        };

        this.setStatus('MEMORY GAME');
        this.name = 'MEMORY';
    }

    preview(saveData, tick) {
        if (!saveData) {
            // "New Game" Preview -> Show "MEM" text
            const grid = createEmptyGrid();
            drawSprite(grid, getCharGrid('M'), 6, 2, COLORS.RED);
            drawSprite(grid, getCharGrid('E'), 6, 7, COLORS.BLUE);
            drawSprite(grid, getCharGrid('M'), 6, 12, COLORS.YELLOW);

            // Draw small preview cards
            drawSprite(grid, getCharGrid('G'), 12, 2, COLORS.PURPLE);
            drawSprite(grid, getCharGrid('A'), 12, 7, '#F97316');
            drawSprite(grid, getCharGrid('M'), 12, 12, '#06b6d4');
            drawSprite(grid, getCharGrid('E'), 12, 17, '#10B981');

            return grid;
        }

        // Show saved game state
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

        // Handle game reset when game is over
        if (this.state.gameOver && action === 'ENTER') {
            console.log('[MemLogic] Resetting game');
        }

        // Update state using memory game logic
        const nextState = updateMemory(this.state, action);
        this.state = nextState;
        this.updateStatus();

        // Update score
        this.setScore(this.state.score);
    }

    onDotClick(r, c) {
        // Convert pixel coordinates to card index
        const cardIndex = getCardIndexFromGrid(r, c);

        if (cardIndex >= 0 && cardIndex < 16) {
            console.log(`[MemLogic] Clicked Card: ${cardIndex}`);

            if (!this.state.gameOver && this.state.canFlip) {
                // Set cursor to clicked card
                this.state = {
                    ...this.state,
                    cursor: cardIndex
                };

                // Trigger ENTER to flip the card
                this.onConsolePress('ENTER');
            }
        }
    }

    onTick(tick) {
        // Auto-hide mismatched cards after delay
        this.state = autoHideCards(this.state);

        // Render the game
        const grid = renderMemory(this.state, tick);
        this.setMatrix(grid);
        this.updateStatus();
    }

    updateStatus() {
        if (this.state.gameOver) {
            this.setStatus(`WIN! Score:${this.state.score} Moves:${this.state.moves}`);
        } else {
            this.setStatus(`Score:${this.state.score} Moves:${this.state.moves}`);
        }
    }
}

export default MemLogic;
