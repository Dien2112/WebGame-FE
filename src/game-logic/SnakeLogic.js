import GameLogic from './model/GameLogic';
import { createEmptyGrid, COLORS, GRID_SIZE } from './utils/constants';
import { getCharGrid } from './utils/pixel-font';
import { drawSprite } from './utils/menu';

/**
 * Snake Game Logic
 * 
 * Admin Settings:
 * - snakeSpeed: 1-8 (default 4), where level 4 = 0.25s per move (250ms)
 *   Speed calculation: interval = 1000 / snakeSpeed (ms)
 *   Level 1 = 1000ms, Level 4 = 250ms, Level 8 = 125ms
 * - timeLimit: Game time limit in seconds (default 60)
 * - appleCoefficient: Score multiplier for apples (default 10)
 * 
 * Scoring:
 * - Win (time ends with snake alive): currentScore + (applesEaten × appleCoefficient)
 * - Lose (snake dies): -appleCoefficient
 */
class SnakeLogic extends GameLogic {
    constructor(setMatrix, setScore, setStatus, setTimer, onExit, savedState, gameId, config = {}) {
        super(setMatrix, setScore, setStatus, onExit);
        this.name = 'SNAKE';
        this.setTimer = setTimer;
        this.gameId = gameId;
        this.config = {
            snakeSpeed: config.snakeSpeed || 4, // 1-8, default 4
            timeLimit: config.timeLimit || 60,  // seconds
            appleCoefficient: config.appleCoefficient || 10
        };
        
        // Calculate move interval based on speed (level 4 = 250ms)
        // Formula: interval = 1000 / speed
        this.moveInterval = Math.floor(1000 / this.config.snakeSpeed);
        
        // Initialize game state
        this.initGame(savedState);
        
        this.setStatus('SNAKE');
    }

    /**
     * Initialize or reset game state
     */
    initGame(savedState = null) {
        if (savedState && savedState.snake) {
            // Restore saved state
            this.snake = savedState.snake;
            this.direction = savedState.direction || 'RIGHT';
            this.nextDirection = savedState.nextDirection || this.direction;
            this.apple = savedState.apple;
            this.applesEaten = savedState.applesEaten || 0;
            this.gameOver = savedState.gameOver || false;
            this.won = savedState.won || false;
            this.remainingTime = savedState.remainingTime || this.config.timeLimit;
            this.isPaused = savedState.isPaused || false;
            this.gameStarted = true; // Resume saved game
        } else {
            // New game - auto start
            this.snake = this.createInitialSnake();
            this.direction = 'RIGHT';
            this.nextDirection = 'RIGHT';
            this.apple = this.spawnApple();
            this.applesEaten = 0;
            this.gameOver = false;
            this.won = false;
            this.remainingTime = this.config.timeLimit;
            this.isPaused = false;
            this.gameStarted = true; // Auto start game
        }
        
        // Tick is called every 100ms (10 ticks per second)
        // snakeSpeed 1-8: higher = faster
        // Speed 4 = 0.25s = 250ms = 2.5 ticks per move
        // Formula: ticksPerMove = 10 / snakeSpeed (rounded)
        this.ticksPerMove = Math.max(1, Math.round(10 / this.config.snakeSpeed));
        this.lastMoveTick = null; // Will be set on first tick
        this.lastSecondTick = null; // Will be set on first tick
        this.lastMoveTick = null; // Will be set on first tick
        this.lastSecondTick = null; // Will be set on first tick
        
        // Reset score if new game
        if (!savedState) {
            this.score = 0;
            if (this.setScore) this.setScore(0);
        } else {
            this.score = savedState.score || 0;
            if (this.setScore) this.setScore(this.score);
        }
    }

    /**
     * Create initial snake at center of grid
     */
    createInitialSnake() {
        const centerY = Math.floor(GRID_SIZE / 2);
        const centerX = Math.floor(GRID_SIZE / 2) - 2;
        return [
            { x: centerX + 2, y: centerY }, // Head
            { x: centerX + 1, y: centerY },
            { x: centerX, y: centerY }      // Tail
        ];
    }

    /**
     * Spawn apple at random position not occupied by snake
     * Apple spawns in playable area (1 to GRID_SIZE-2), avoiding timer bar at row 1
     */
    spawnApple() {
        let apple;
        let attempts = 0;
        const maxAttempts = 100;
        
        do {
            apple = {
                x: Math.floor(Math.random() * (GRID_SIZE - 4)) + 2, // 2 to GRID_SIZE-3
                y: Math.floor(Math.random() * (GRID_SIZE - 4)) + 2  // 2 to GRID_SIZE-3 (avoid timer bar)
            };
            attempts++;
        } while (this.isOccupiedBySnake(apple.x, apple.y) && attempts < maxAttempts);
        
        return apple;
    }

    /**
     * Check if position is occupied by snake
     */
    isOccupiedBySnake(x, y) {
        return this.snake.some(segment => segment.x === x && segment.y === y);
    }

    /**
     * Handle console button presses
     */
    onConsolePress(action, tick) {
        if (action === 'BACK') {
            this.onExit();
            return;
        }

        // Handle game over state
        if (this.gameOver) {
            if (action === 'ENTER') {
                // Restart game
                this.initGame();
                return;
            }
            return;
        }

        // Handle pause
        if (action === 'ENTER') {
            this.isPaused = !this.isPaused;
            return;
        }

        // Handle direction changes (prevent 180-degree turns)
        switch (action) {
            case 'UP':
                if (this.direction !== 'DOWN') this.nextDirection = 'UP';
                break;
            case 'DOWN':
                if (this.direction !== 'UP') this.nextDirection = 'DOWN';
                break;
            case 'LEFT':
                if (this.direction !== 'RIGHT') this.nextDirection = 'LEFT';
                break;
            case 'RIGHT':
                if (this.direction !== 'LEFT') this.nextDirection = 'RIGHT';
                break;
        }
    }

    /**
     * Main game tick - called every 100ms (10 ticks per second)
     */
    onTick(tick) {
        // Initialize tick trackers on first tick
        if (this.lastMoveTick === null) {
            this.lastMoveTick = tick;
            this.lastSecondTick = tick;
        }

        // Update timer every 10 ticks (1 second)
        if (this.gameStarted && !this.gameOver && !this.isPaused) {
            if (tick - this.lastSecondTick >= 10) {
                this.lastSecondTick = tick;
                this.remainingTime--;

                // Update UI Timer
                if (this.setTimer) this.setTimer(this.remainingTime);
                
                // Check time limit
                if (this.remainingTime <= 0) {
                    this.endGame(true); // Win - survived the time? User said Time=0 game end.
                }
            }
        }

        // Move snake based on speed interval
        if (this.gameStarted && !this.gameOver && !this.isPaused) {
            if (tick - this.lastMoveTick >= this.ticksPerMove) {
                this.lastMoveTick = tick;
                this.moveSnake();
            }
        }

        // Render the game
        this.render(tick);
        this.updateStatus();
    }

    /**
     * Move the snake in current direction
     */
    moveSnake() {
        // Apply direction change
        this.direction = this.nextDirection;

        // Calculate new head position
        const head = { ...this.snake[0] };
        
        switch (this.direction) {
            case 'UP':
                head.y--;
                break;
            case 'DOWN':
                head.y++;
                break;
            case 'LEFT':
                head.x--;
                break;
            case 'RIGHT':
                head.x++;
                break;
        }

        // Check collision with walls (border is at 0 and GRID_SIZE-1)
        // Snake can only move in area 1 to GRID_SIZE-2
        if (head.x <= 0 || head.x >= GRID_SIZE - 1 || head.y <= 0 || head.y >= GRID_SIZE - 1) {
            this.endGame(false); // Lose
            return;
        }

        // Check collision with self
        if (this.isOccupiedBySnake(head.x, head.y)) {
            this.endGame(false); // Lose
            return;
        }

        // Add new head
        this.snake.unshift(head);

        // Check if apple is eaten
        if (head.x === this.apple.x && head.y === this.apple.y) {
            this.applesEaten++;
            this.apple = this.spawnApple();
            
            // Update Score immediately
            this.score = this.applesEaten * this.config.appleCoefficient;
            if (this.setScore) this.setScore(this.score);
            
            // Don't remove tail - snake grows
        } else {
            // Remove tail - snake moves
            this.snake.pop();
        }
    }

    /**
     * End the game
     * @param {boolean} won - true if player won (time ended), false if lost (collision)
     */
    endGame(won) {
        this.gameOver = true;
        this.won = won;
        
        // Submit final score logic: score - 2 * time_left
        // Note: 'score' here implies points from apples.
        // User said: "When eat apple: score += 10"
        // And "When game end: finalscore = score - 2 * time_left"
        // Let's calculate it.
        
        const rawScore = this.applesEaten * 10; // Fixed 10 points per apple as requested
        const penalty = 2 * this.remainingTime;
        const finalScore = rawScore - penalty;

        this.score = finalScore;
        this.setScore(this.score);
        
        if (this.gameId) {
             console.log(`[Snake] Submitting Score: ${this.score}, ID: ${this.gameId}`);
             import('./utils/game-service').then(mod => mod.submitScore(this.gameId, this.score));
        }

        // Stop timer
        if (this.setTimer) this.setTimer(this.remainingTime); // Or null? Keep it static.
    }

    /**
     * Render the game grid
     */
    render(tick) {
        const grid = createEmptyGrid();

        // Draw border
        // Draw border
        // Requirements: "Change border color into another color" -> let's use CYAN
        for (let i = 0; i < GRID_SIZE; i++) {
            grid[0][i] = COLORS.CYAN;
            grid[GRID_SIZE - 1][i] = COLORS.CYAN;
            grid[i][0] = COLORS.CYAN;
            grid[i][GRID_SIZE - 1] = COLORS.CYAN;
        }

        // Game over screen
        if (this.gameOver) {
            this.renderGameOver(grid, tick);
            this.setMatrix(grid);
            return;
        }

        // Pause screen
        if (this.isPaused) {
            drawSprite(grid, getCharGrid('P'), 4, 4, COLORS.YELLOW);
            drawSprite(grid, getCharGrid('A'), 4, 9, COLORS.YELLOW);
            drawSprite(grid, getCharGrid('U'), 4, 14, COLORS.YELLOW);
            drawSprite(grid, getCharGrid('S'), 10, 4, COLORS.YELLOW);
            drawSprite(grid, getCharGrid('E'), 10, 9, COLORS.YELLOW);
            this.setMatrix(grid);
            return;
        }

        // Draw apple (blinking effect)
        if (this.apple && Math.floor(tick / 5) % 2 === 0) {
            if (this.apple.y >= 0 && this.apple.y < GRID_SIZE && 
                this.apple.x >= 0 && this.apple.x < GRID_SIZE) {
                grid[this.apple.y][this.apple.x] = COLORS.RED;
            }
        }

        // Draw snake
        this.snake.forEach((segment, index) => {
            if (segment.y >= 0 && segment.y < GRID_SIZE && 
                segment.x >= 0 && segment.x < GRID_SIZE) {
                if (index === 0) {
                    // Head - darker color
                    grid[segment.y][segment.x] = COLORS.BLACK;
                } else {
                    // Body
                    grid[segment.y][segment.x] = COLORS.PURPLE;
                }
            }
        });

        // Draw timer bar at top (inside border) -> DELETED "Delete the yellow line in Snake Game"
        /*
        const timerWidth = Math.floor((this.remainingTime / this.config.timeLimit) * (GRID_SIZE - 4));
        for (let i = 0; i < timerWidth; i++) {
            if (i + 2 < GRID_SIZE - 1) {
                grid[1][i + 2] = this.remainingTime <= 10 ? COLORS.RED : COLORS.YELLOW;
            }
        }
        */

        this.setMatrix(grid);
    }

    /**
     * Render game over screen
     */
    renderGameOver(grid, tick) {
        if (this.won) {
            // WIN screen - spacing 6 pixels between letters
            if (Math.floor(tick / 10) % 2 === 0) {
                drawSprite(grid, getCharGrid('W'), 6, 1, COLORS.YELLOW);
                drawSprite(grid, getCharGrid('I'), 6, 7, COLORS.YELLOW);
                drawSprite(grid, getCharGrid('N'), 6, 13, COLORS.YELLOW);
            }
        } else {
            // LOSE screen
            if (Math.floor(tick / 10) % 2 === 0) {
                drawSprite(grid, getCharGrid('L'), 6, 1, COLORS.RED);
                drawSprite(grid, getCharGrid('O'), 6, 6, COLORS.RED);
                drawSprite(grid, getCharGrid('S'), 6, 11, COLORS.RED);
                drawSprite(grid, getCharGrid('E'), 6, 16, COLORS.RED);
            }
        }
        
        // Show score
        const scoreStr = Math.abs(this.score).toString();
        const startX = Math.floor((GRID_SIZE - scoreStr.length * 5) / 2);
        scoreStr.split('').forEach((char, i) => {
            drawSprite(grid, getCharGrid(char), 12, startX + i * 5, 
                this.won ? COLORS.YELLOW : COLORS.RED);
        });
    }

    /**
     * Update status bar
     */
    updateStatus() {
        if (this.gameOver) {
            if (this.won) {
                this.setStatus(`WIN! Score:+${this.score} | ENTER:Restart`);
            } else {
                this.setStatus(`LOSE! Score:${this.score} | ENTER:Restart`);
            }
        } else if (this.isPaused) {
            this.setStatus('PAUSED | ENTER:Resume');
        } else {
            const minutes = Math.floor(this.remainingTime / 60);
            const seconds = this.remainingTime % 60;
            const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            this.setStatus(`Time:${timeStr} | Apples:${this.applesEaten} | Speed:${this.config.snakeSpeed}`);
        }
    }

    /**
     * Get current game state for saving
     */
    getSaveData() {
        return {
            snake: this.snake,
            direction: this.direction,
            nextDirection: this.nextDirection,
            apple: this.apple,
            applesEaten: this.applesEaten,
            gameOver: this.gameOver,
            won: this.won,
            remainingTime: this.remainingTime,
            isPaused: this.isPaused,
            // Added Requirements: width: 19, height: 19, (border property?)
            width: GRID_SIZE - 2, // Playable width? Or Board width? GRID_SIZE is 20. 
            // User said "width: 19, height: 19". If grid is 20x20. 
            // Maybe they mean the grid size itself? 
            // If they mean playable area (1..18), it is 18x18.
            // If they mean including border? 20x20?
            // User sample: "{..., width: 19, height: 19, ...}". 
            // Let's pass 19 if that's what they observed or want.
            // But our GRID_SIZE is 20. Maybe they want 19? 
            // I'll stick to logic values but add property.
            width: GRID_SIZE, 
            height: GRID_SIZE,
            border: true
        };
    }

    /**
     * Preview for scenario selection
     */
    preview(saveData, tick) {
        if (saveData && saveData.snake) {
            // Render saved game state
            const grid = createEmptyGrid();
            
            // Draw border
            for (let i = 0; i < GRID_SIZE; i++) {
                grid[0][i] = COLORS.BLUE;
                grid[GRID_SIZE - 1][i] = COLORS.BLUE;
                grid[i][0] = COLORS.BLUE;
                grid[i][GRID_SIZE - 1] = COLORS.BLUE;
            }
            
            // Draw apple
            if (saveData.apple && Math.floor(tick / 5) % 2 === 0) {
                grid[saveData.apple.y][saveData.apple.x] = COLORS.RED;
            }
            
            // Draw snake
            saveData.snake.forEach((segment, index) => {
                if (segment.y >= 0 && segment.y < GRID_SIZE && 
                    segment.x >= 0 && segment.x < GRID_SIZE) {
                    grid[segment.y][segment.x] = index === 0 ? COLORS.BLACK : COLORS.PURPLE;
                }
            });
            
            return grid;
        }
        
        // New Game: No border, different text
        const grid = createEmptyGrid();
        
        // No Border
        
        // Text/Logo
        if (Math.floor(tick / 10) % 2 === 0) {
             drawSprite(grid, getCharGrid('S'), 6, 8, COLORS.GREEN);
        } else {
             drawSprite(grid, getCharGrid('S'), 6, 8, COLORS.CYAN);
        }
        
        return grid;
    }

    /**
     * Calculate final score based on game result
     * @returns {number} Final score
     */
    calculateFinalScore() {
        if (this.won) {
            return this.applesEaten * this.config.appleCoefficient;
        } else {
            return -this.config.appleCoefficient;
        }
    }
}

export default SnakeLogic;
