import GameLogic from './model/GameLogic';
import { initialMemoryState, updateMemory, renderMemory, autoHideCards, getCardIndexFromGrid, updateTimer, GAME_CONFIG } from './utils/memory-game';
import { createEmptyGrid, COLORS } from './utils/constants';
import { getCharGrid } from './utils/pixel-font';
import { drawSprite } from './utils/menu';

const TOTAL_CARDS = GAME_CONFIG.rows * GAME_CONFIG.cols;

class MemLogic extends GameLogic {
    constructor(setMatrix, setScore, setStatus, onExit, savedState, gameId, config = {}) {
        super(setMatrix, setScore, setStatus, onExit);
        
        this.config = {
            timeLimit: config.timeLimit || config.time || 120 
        };

        this.state = {
            ...initialMemoryState,
            timeLeft: savedState ? (savedState.timeLeft || this.config.timeLimit) : this.config.timeLimit,
            ...(savedState || {})
        };
        // Restore hints
        if (savedState && savedState.hintsRemaining !== undefined) this.state.hintsRemaining = savedState.hintsRemaining;

        this.setStatus('MEMORY GAME');
        this.name = 'MEM';
        this.gameId = gameId;
        this.tickCounter = 0;  
    }

    preview(saveData, tick) {
        if (!saveData) {
            const grid = createEmptyGrid();
            drawSprite(grid, getCharGrid('M'), 6, 2, COLORS.RED);
            drawSprite(grid, getCharGrid('E'), 6, 7, COLORS.BLUE);
            drawSprite(grid, getCharGrid('M'), 6, 12, COLORS.YELLOW);

            drawSprite(grid, getCharGrid('G'), 12, 2, COLORS.PURPLE);
            drawSprite(grid, getCharGrid('A'), 12, 7, '#F97316');
            drawSprite(grid, getCharGrid('M'), 12, 12, '#06b6d4');
            drawSprite(grid, getCharGrid('E'), 12, 17, '#10B981');

            return grid;
        }

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

        if (action === 'HELP' && !this.state.gameOver) {
             this.activateHint();
             return;
        }

        if (this.state.gameOver && action === 'ENTER') {
            this.tickCounter = 0;
            const nextState = updateMemory(this.state, action);
            this.state = nextState;
        } else {
            const nextState = updateMemory(this.state, action);
            this.state = nextState;
            
            if (this.state.gameOver && !this.state.submitted) {
                this.endGame();
            }
        }
        
        this.updateStatus();

        this.setScore(this.state.score);
    }

    onDotClick(r, c) {
        const cardIndex = getCardIndexFromGrid(r, c);

        if (cardIndex >= 0 && cardIndex < TOTAL_CARDS) {

            if (!this.state.gameOver && this.state.canFlip) {
                this.state = {
                    ...this.state,
                    cursor: cardIndex
                };

                this.onConsolePress('ENTER');
            }
        }
    }

    onTick(tick) {
        this.state = autoHideCards(this.state);

        this.tickCounter++;
        if (this.tickCounter >= 10) {
            this.state = updateTimer(this.state);
            this.tickCounter = 0;
            
            if (this.state.gameOver && !this.state.submitted) {
                this.endGame();
            }
        }
        
        if (this.state.hintTimer > 0) {
            this.state.hintTimer--;
            if (this.state.hintTimer <= 0) {
                 this.state.hintCards = [];
            }
        }

        const grid = renderMemory(this.state, tick);
        this.setMatrix(grid);
        this.updateStatus();
    }

    updateStatus() {
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

    endGame() {
        this.state.submitted = true;
        
        if (!this.state.isTimedOut) {
             const rawBonus = (this.state.timeLeft - 120) * 2;
             this.state.score = Math.max(0, this.state.score + rawBonus);
        } else {
             this.state.score = 0; 
        }

        this.setScore(this.state.score);
        
        if (this.gameId) { 
             import('./utils/game-service').then(mod => mod.submitScore(this.gameId, this.state.score));
        }
    }

    activateHint() {
        if (this.state.hintsRemaining <= 0 || this.state.score < 40) return;

        const cards = this.state.cards;
        const unrevealedIndices = [];
        for(let i=0; i<cards.length; i++) {
            if (!this.state.matched.includes(i) && !this.state.flipped.includes(i)) {
                unrevealedIndices.push(i);
            }
        }

        let pair = null;
        for (let i = 0; i < unrevealedIndices.length; i++) {
            for (let j = i + 1; j < unrevealedIndices.length; j++) {
                const idx1 = unrevealedIndices[i];
                const idx2 = unrevealedIndices[j];
                if (cards[idx1] === cards[idx2]) {
                    pair = [idx1, idx2];
                    break;
                }
            }
            if (pair) break;
        }

        if (pair) {
            this.state.hintsRemaining--;
            this.state.score -= 40;
            this.state.hintCards = pair;
            this.state.hintTimer = 20; // 2s
        }
    }
    
    getSaveData() {
        return {
            cards: this.state.cards,
            matched: this.state.matched,
            score: this.state.score,
            timeLeft: this.state.timeLeft,
            hintsRemaining: this.state.hintsRemaining,
            width: 4, 
            height: 4
        };
    }
}

export default MemLogic;
