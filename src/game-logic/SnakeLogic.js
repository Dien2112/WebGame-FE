import GameLogic from './model/GameLogic';
import { createEmptyGrid, COLORS, GRID_SIZE } from './utils/constants';
import { getCharGrid } from './utils/pixel-font';
import { drawSprite } from './utils/menu';

class SnakeLogic extends GameLogic {
    constructor(setMatrix, setScore, setStatus, setTimer, onExit, savedState, gameId, config = {}) {
        super(setMatrix, setScore, setStatus, onExit);
        this.name = 'SNAKE';
        this.setTimer = setTimer;
        this.gameId = gameId;
        this.config = {
            snakeSpeed: config.snakeSpeed || config.speed || 4, 
            timeLimit: config.timeLimit || 60, 
            appleCoefficient: config.appleCoefficient || 10,
            size: config.size || GRID_SIZE 
        };
        
        this.gridSize = parseInt(this.config.size);
        this.initGame(savedState);
        this.setStatus('SNAKE');
    }

    initGame(savedState = null) {
        if (savedState && savedState.snake) {
            this.snake = savedState.snake;
            this.direction = savedState.direction || 'RIGHT';
            this.nextDirection = savedState.nextDirection || this.direction;
            this.apple = savedState.apple;
            this.applesEaten = savedState.applesEaten || 0;
            this.gameOver = savedState.gameOver || false;
            this.won = savedState.won || false;
            this.remainingTime = savedState.remainingTime || this.config.timeLimit;
            this.isPaused = savedState.isPaused || false;
            this.gameStarted = true; 
        } else {
            this.snake = this.createInitialSnake();
            this.direction = 'RIGHT';
            this.nextDirection = 'RIGHT';
            this.apple = this.spawnApple();
            this.applesEaten = 0;
            this.gameOver = false;
            this.won = false;
            this.remainingTime = this.config.timeLimit;
            this.isPaused = false;
            this.gameStarted = true; 
        }
        const speed = this.config.snakeSpeed;
        const intervalMs = 125 * (9 - speed);
        this.ticksPerMove = Math.max(1, Math.round(intervalMs / 100));
        this.lastMoveTick = null;
        this.lastSecondTick = null;
        this.lastMoveTick = null;
        this.lastSecondTick = null;
        
        if (!savedState) {
            this.score = 0;
            if (this.setScore) this.setScore(0);
        } else {
            this.score = savedState.score || 0;
            if (this.setScore) this.setScore(this.score);
        }
    }

    createInitialSnake() {
        const centerY = Math.floor(this.gridSize / 2);
        const centerX = Math.floor(this.gridSize / 2) - 2;
        return [
            { x: centerX + 2, y: centerY },
            { x: centerX + 1, y: centerY },
            { x: centerX, y: centerY }
        ];
    }

    spawnApple() {
        let apple;
        let attempts = 0;
        const maxAttempts = 100;
        
        do {
            apple = {
                x: Math.floor(Math.random() * (this.gridSize - 4)) + 2, 
                y: Math.floor(Math.random() * (this.gridSize - 4)) + 2
            };
            attempts++;
        } while (this.isOccupiedBySnake(apple.x, apple.y) && attempts < maxAttempts);
        
        return apple;
    }

    isOccupiedBySnake(x, y) {
        return this.snake.some(segment => segment.x === x && segment.y === y);
    }

    onConsolePress(action, tick) {
        if (action === 'BACK') {
            this.onExit();
            return;
        }

        if (this.gameOver) {
            if (action === 'ENTER') {
                this.initGame();
                return;
            }
            return;
        }

        if (action === 'ENTER') {
            this.isPaused = !this.isPaused;
            return;
        }

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

    onTick(tick) {
        if (this.lastMoveTick === null) {
            this.lastMoveTick = tick;
            this.lastSecondTick = tick;
        }

        if (this.gameStarted && !this.gameOver && !this.isPaused) {
            if (tick - this.lastSecondTick >= 10) {
                this.lastSecondTick = tick;
                this.remainingTime--;

                if (this.setTimer) this.setTimer(this.remainingTime);
                
                if (this.remainingTime <= 0) {
                    this.endGame(true); 
                }
            }
        }

        if (this.gameStarted && !this.gameOver && !this.isPaused) {
            if (tick - this.lastMoveTick >= this.ticksPerMove) {
                this.lastMoveTick = tick;
                this.moveSnake();
            }
        }

        this.render(tick);
        this.updateStatus();
    }

    moveSnake() {
        this.direction = this.nextDirection;

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

        if (head.x <= 0 || head.x >= this.gridSize - 1 || head.y <= 0 || head.y >= this.gridSize - 1) {
            this.endGame(false); 
            return;
        }

        if (this.isOccupiedBySnake(head.x, head.y)) {
            this.endGame(false); 
            return;
        }

        this.snake.unshift(head);

        if (head.x === this.apple.x && head.y === this.apple.y) {
            this.applesEaten++;
            this.apple = this.spawnApple();
            
            this.score = this.applesEaten * this.config.appleCoefficient;
            if (this.setScore) this.setScore(this.score);
            
        } else {
            this.snake.pop();
        }
    }

    /**
     * @param {boolean} won
     */
    endGame(won) {
        this.gameOver = true;
        this.won = won;
                
        const rawScore = this.applesEaten * 10; 
        const penalty = 2 * this.remainingTime;
        const finalScore = rawScore - penalty;

        this.score = finalScore;
        this.setScore(this.score);
        
        if (this.gameId) {
             import('./utils/game-service').then(mod => mod.submitScore(this.gameId, this.score));
        }

        if (this.setTimer) this.setTimer(this.remainingTime);
    }

    render(tick) {
        const grid = createEmptyGrid();

        for (let i = 0; i < this.gridSize; i++) {
            if (i < GRID_SIZE) {
                grid[0][i] = COLORS.CYAN;
                grid[this.gridSize - 1][i] = COLORS.CYAN;
                grid[i][0] = COLORS.CYAN;
                grid[i][this.gridSize - 1] = COLORS.CYAN;
            }
        }

        if (this.gameOver) {
            this.renderGameOver(grid, tick);
            this.setMatrix(grid);
            return;
        }

        if (this.isPaused) {
            drawSprite(grid, getCharGrid('P'), 4, 4, COLORS.YELLOW);
            drawSprite(grid, getCharGrid('A'), 4, 9, COLORS.YELLOW);
            drawSprite(grid, getCharGrid('U'), 4, 14, COLORS.YELLOW);
            drawSprite(grid, getCharGrid('S'), 10, 4, COLORS.YELLOW);
            drawSprite(grid, getCharGrid('E'), 10, 9, COLORS.YELLOW);
            this.setMatrix(grid);
            return;
        }

        if (this.apple && Math.floor(tick / 5) % 2 === 0) {
            if (this.apple.y >= 0 && this.apple.y < this.gridSize && 
                this.apple.x >= 0 && this.apple.x < this.gridSize) {
                grid[this.apple.y][this.apple.x] = COLORS.RED;
            }
        }

        this.snake.forEach((segment, index) => {
            if (segment.y >= 0 && segment.y < this.gridSize && 
                segment.x >= 0 && segment.x < this.gridSize) {
                if (index === 0) {
                    grid[segment.y][segment.x] = COLORS.BLACK;
                } else {
                    grid[segment.y][segment.x] = COLORS.PURPLE;
                }
            }
        });

        this.setMatrix(grid);
    }

    renderGameOver(grid, tick) {
        if (this.won) {
            if (Math.floor(tick / 10) % 2 === 0) {
                drawSprite(grid, getCharGrid('W'), 6, 1, COLORS.YELLOW);
                drawSprite(grid, getCharGrid('I'), 6, 7, COLORS.YELLOW);
                drawSprite(grid, getCharGrid('N'), 6, 13, COLORS.YELLOW);
            }
        } else {
            if (Math.floor(tick / 10) % 2 === 0) {
                drawSprite(grid, getCharGrid('L'), 6, 1, COLORS.RED);
                drawSprite(grid, getCharGrid('O'), 6, 6, COLORS.RED);
                drawSprite(grid, getCharGrid('S'), 6, 11, COLORS.RED);
                drawSprite(grid, getCharGrid('E'), 6, 16, COLORS.RED);
            }
        }
        
        const scoreStr = Math.abs(this.score).toString();
        const startX = Math.floor((GRID_SIZE - scoreStr.length * 5) / 2); 
        scoreStr.split('').forEach((char, i) => {
            drawSprite(grid, getCharGrid(char), 12, startX + i * 5, 
                this.won ? COLORS.YELLOW : COLORS.RED);
        });
    }

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
            width: this.gridSize, 
            height: this.gridSize,
            border: true
        };
    }

    preview(saveData, tick) {
        if (saveData && saveData.snake) {
            const grid = createEmptyGrid();
            
            for (let i = 0; i < GRID_SIZE; i++) {
                grid[0][i] = COLORS.BLUE;
                grid[GRID_SIZE - 1][i] = COLORS.BLUE;
                grid[i][0] = COLORS.BLUE;
                grid[i][GRID_SIZE - 1] = COLORS.BLUE;
            }
            
            if (saveData.apple && Math.floor(tick / 5) % 2 === 0) {
                grid[saveData.apple.y][saveData.apple.x] = COLORS.RED;
            }
            
            saveData.snake.forEach((segment, index) => {
                if (segment.y >= 0 && segment.y < GRID_SIZE && 
                    segment.x >= 0 && segment.x < GRID_SIZE) {
                    grid[segment.y][segment.x] = index === 0 ? COLORS.BLACK : COLORS.PURPLE;
                }
            });
            
            return grid;
        }
        
        const grid = createEmptyGrid();
        
        if (Math.floor(tick / 10) % 2 === 0) {
             drawSprite(grid, getCharGrid('S'), 6, 8, COLORS.GREEN);
        } else {
             drawSprite(grid, getCharGrid('S'), 6, 8, COLORS.CYAN);
        }
        
        return grid;
    }

    /**
     * @returns {number}
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
