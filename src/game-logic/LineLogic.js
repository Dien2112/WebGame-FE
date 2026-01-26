
import GameLogic from './model/GameLogic';
import { createEmptyGrid, COLORS, BUTTONS } from './utils/constants';
import { getCharGrid } from './utils/pixel-font';
import { drawSprite } from './utils/menu';

const DEFAULT_GRID_SIZE = 5;
const TILE_SIZE = 3;
const TILE_GAP = 1;

const TILE_COLORS = [
    COLORS.RED, 
    COLORS.GREEN, 
    COLORS.BLUE, 
    COLORS.YELLOW, 
    COLORS.PURPLE || COLORS.PINK || [1, 0, 1]
];

const getRandomColor = () => TILE_COLORS[Math.floor(Math.random() * TILE_COLORS.length)];

class LineLogic extends GameLogic {
    constructor(setMatrix, setScore, setStatus, setTimer, onExit, savedState, gameId, config = {}) {
        super(setMatrix, setScore, setStatus, onExit);
        this.setTimer = setTimer;
        this.gameId = gameId;
        this.config = config;
        this.gridSize = config.size || DEFAULT_GRID_SIZE;
        
        this.timeLimit = 120; 

        this.status = {
            board: this.initBoard(),
            cursor: { r: 2, c: 2 },
            selected: null,
            mode: 'INPUT', 
            animState: 'IDLE',
            animData: {
                waitTick: 0,
                pixelOffset: 0,
                activeDroppers: [], 
                newSpawns: [] 
            },
            score: 0,
            remainingTime: 120, 
            gameOver: false,
            hintsRemaining: 3,
            hintPair: null,
            hintTimer: 0,
            ...savedState
        };
        
        if (!this.status.board) this.status.board = this.initBoard();
        if (savedState && savedState.hintsRemaining !== undefined) this.status.hintsRemaining = savedState.hintsRemaining;
        
        if (this.setScore) this.setScore(this.status.score);
        if (this.setTimer && this.status.remainingTime !== undefined) this.setTimer(this.status.remainingTime);
        
        this.setStatus('LINE');
        this.name = 'LINE';
        this.state = this.status;
        
        this.lastSecondTick = null;
    }

    getSaveData() {
        return {
            board: this.state.board,
            score: this.state.score,
            remainingTime: this.state.remainingTime,
            cursor: this.state.cursor,
            selected: this.state.selected,
            mode: this.state.mode,
            animState: this.state.animState,
            animData: this.state.animData,
            animData: this.state.animData,
            gameOver: this.state.gameOver,
            hintsRemaining: this.state.hintsRemaining,
            width: this.gridSize,
            height: this.gridSize
        };
    }

    initBoard() {
        const board = [];
        for (let r = 0; r < this.gridSize; r++) {
            const row = [];
            for (let c = 0; c < this.gridSize; c++) {
                let color;
                do {
                    color = getRandomColor();
                } while (
                    (c >= 2 && row[c - 1].color === color && row[c - 2].color === color) ||
                    (r >= 2 && board[r - 1][c].color === color && board[r - 2][c].color === color)
                );
                row.push({
                    color: color,
                    type: 0 
                });
            }
            board.push(row);
        }
        return board;
    }

    onDotClick(r, c) {
        if (this.state.mode === 'ANIMATING') return;

        const pitch = TILE_SIZE + TILE_GAP;
        
        if (r % pitch === TILE_SIZE || c % pitch === TILE_SIZE) return;

        const gridR = Math.floor(r / pitch);
        const gridC = Math.floor(c / pitch);

        if (gridR < 0 || gridR >= this.gridSize || gridC < 0 || gridC >= this.gridSize) return;

        this.updateState({ cursor: { r: gridR, c: gridC } });
        
        this.handleEnter();
    }

    onConsolePress(action, tick) {
        if (this.state.mode === 'ANIMATING') return; 

        if (action === BUTTONS.BACK) {
            this.onExit();
            return;
        }

        if (this.state.hintPair) {
             this.updateState({ hintPair: null, hintTimer: 0 });
        }

        if (action === BUTTONS.HELP && this.state.mode === 'INPUT' && this.state.hintsRemaining > 0) {
             this.activateHint();
             return;
        }

        const { cursor } = this.state;
        let nextCursor = { ...cursor };

        if (action === BUTTONS.UP) nextCursor.r = Math.max(0, cursor.r - 1);
        if (action === BUTTONS.DOWN) nextCursor.r = Math.min(this.gridSize - 1, cursor.r + 1);
        if (action === BUTTONS.LEFT) nextCursor.c = Math.max(0, cursor.c - 1);
        if (action === BUTTONS.RIGHT) nextCursor.c = Math.min(this.gridSize - 1, cursor.c + 1);

        if (action === BUTTONS.ENTER) {
            this.handleEnter();
            return;
        }

        this.updateState({ cursor: nextCursor });
    }

    handleEnter() {
        const { cursor, selected, board } = this.state;

        if (!selected) {
            this.updateState({ selected: { ...cursor } });
        } else {
            if (cursor.r === selected.r && cursor.c === selected.c) return; 

            const distR = Math.abs(cursor.r - selected.r);
            const distC = Math.abs(cursor.c - selected.c);
            
            if (distR + distC === 1) {
                // Immediate Swap
                const newBoard = JSON.parse(JSON.stringify(board));
                const temp = newBoard[cursor.r][cursor.c].color;
                newBoard[cursor.r][cursor.c].color = newBoard[selected.r][selected.c].color;
                newBoard[selected.r][selected.c].color = temp;

                this.updateState({ selected: null, board: newBoard });

                const matches = this.findMatches(newBoard);
                if (matches.length > 0) {
                    this.startAnimation('CLEAR', { matches });
                }
            } else {
                this.updateState({ selected: { ...cursor } });
            }
        }
    }

    startAnimation(state, data = {}) {
        this.updateState({
            mode: 'ANIMATING',
            animState: state,
            animData: { ...this.state.animData, ...data, waitTick: 0, pixelOffset: 0 },
            hintPair: null, 
            hintTimer: 0
        });
    }

    endGame() {
        const currentScore = this.state.score || 0;
        const finalScore = currentScore - 240;
        
        this.updateState({ gameOver: true, score: finalScore });
        if (this.setScore) this.setScore(finalScore);
        
        if (this.gameId) {
             import('./utils/game-service').then(mod => mod.submitScore(this.gameId, finalScore));
        }
    }

    onTick(tick) {
        if (this.state.gameOver) {
            const grid = createEmptyGrid();
            drawSprite(grid, getCharGrid('E'), 5, 2, COLORS.RED);
            drawSprite(grid, getCharGrid('N'), 5, 7, COLORS.RED);
            drawSprite(grid, getCharGrid('D'), 5, 12, COLORS.RED);
            this.setMatrix(grid);
            this.setStatus(`Final Score: ${this.state.score} | ENTER: Replay`);
            return;
        }

        if (this.lastSecondTick === null) this.lastSecondTick = tick;
        if (tick - this.lastSecondTick >= 10 && this.state.mode !== 'ANIMATING') { 
            this.lastSecondTick = tick;
            const newTime = Math.max(0, (this.state.remainingTime || 0) - 1);
            this.updateState({ remainingTime: newTime });
            
            if (this.setTimer) this.setTimer(newTime);
            
            if (newTime <= 0) {
                 this.endGame();
                 return;
            }
        }

        const { mode, animState, animData, board } = this.state;
        const grid = createEmptyGrid();

        if (mode === 'ANIMATING') {
            if (animState === 'CLEAR') {
                 if (animData.waitTick === 0) {
                     animData.matches.forEach(({r, c}) => {
                         if (board[r] && board[r][c]) board[r][c].color = null;
                     });
                     const uniqueBroken = new Set(animData.matches.map(m => `${m.r},${m.c}`));
                     const count = uniqueBroken.size;
                     
                     if (count > 0) { 
                         const points = (count - 2) * 10;
                         const newScore = (this.state.score || 0) + points;
                         this.updateState({ score: newScore });
                         if (this.setScore) this.setScore(newScore);
                     }

                     this.updateState({ animData: { ...animData, waitTick: 1 } }); 
                     this.startAnimation('DROP_CHECK');
                     return; 
                 }
            } else if (animState === 'DROP_CHECK') { 
                 const droppers = []; 
                 const newSpawns = []; 

                 const isFalling = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(false));

                 for (let c = 0; c < this.gridSize; c++) {
                     
                     for (let r = this.gridSize - 2; r >= 0; r--) {
                         const below = board[r+1][c];
                         
                         if (current.color !== null) {
                             const belowEmpty = (below.color === null);
                             const belowFalling = isFalling[r+1][c];
                             
                             if (belowEmpty || belowFalling) {
                                 droppers.push({ r, c });
                                 isFalling[r][c] = true;
                             }
                         }
                     }

                     if (board[0][c].color === null || isFalling[0][c]) {
                         newSpawns.push({ c, color: getRandomColor() });
                     }
                 }

                 if (droppers.length === 0 && newSpawns.length === 0) {
                     this.startAnimation('CHECK_MATCH');
                 } else {
                     this.startAnimation('DROPPING', { droppers, newSpawns });
                 }
            
            } else if (animState === 'DROPPING') {
                 if (animData.pixelOffset < 4) { 
                     this.updateState({ 
                         animData: { ...animData, pixelOffset: animData.pixelOffset + 1 }
                     });
                 } else {
                     const newBoard = JSON.parse(JSON.stringify(board));
                     
                     animData.droppers.sort((a, b) => b.r - a.r).forEach(({r, c}) => {
                         newBoard[r+1][c].color = newBoard[r][c].color;
                         newBoard[r][c].color = null;
                     });
                     animData.newSpawns.forEach(({c, color}) => {
                         newBoard[0][c].color = color;
                     });

                     this.updateState({ board: newBoard });
                     this.startAnimation('DROP_CHECK'); 
                 }

            } else if (animState === 'CHECK_MATCH') {
                 const matches = this.findMatches(board);
                 if (matches.length > 0) {
                     this.startAnimation('CLEAR', { matches });
                 } else {
                     this.updateState({ mode: 'INPUT', animState: 'IDLE' });
                 }
            }
        }

        const isDropping = (mode === 'ANIMATING' && animState === 'DROPPING');
        const dropOffset = isDropping ? animData.pixelOffset : 0;
        
        const movingCells = new Set();
        if (isDropping) {
            animData.droppers.forEach(({r, c}) => movingCells.add(`${r},${c}`));
        }

        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                const cell = board[r][c];
                if (cell.color) {
                    const isMoving = movingCells.has(`${r},${c}`);
                    const offsetY = isMoving ? dropOffset : 0;
                    
                    const isCursor = (r === this.state.cursor.r && c === this.state.cursor.c);
                    const isSelected = (this.state.selected && r === this.state.selected.r && c === this.state.selected.c);

                    this.drawTile(grid, r, c, cell.color, tick, isCursor && mode === 'INPUT', isSelected, offsetY);
                }
            }
        }
        if (isDropping) {
             animData.newSpawns.forEach(({c, color}) => {
                 this.drawTile(grid, -1, c, color, tick, false, false, dropOffset);
             });
        }

        this.setMatrix(grid);
    }
    findMatches(board) {
        const matches = [];
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize - 2; c++) {
                const color = board[r][c].color;
                if (color && color === board[r][c+1].color && color === board[r][c+2].color) {
                    matches.push({r, c}, {r, c: c+1}, {r, c: c+2});
                    let k = c + 3;
                    while(k < this.gridSize && board[r][k].color === color) {
                        matches.push({r, c: k});
                        k++;
                    }
                }
            }
        }
        for (let c = 0; c < this.gridSize; c++) {
            for (let r = 0; r < this.gridSize - 2; r++) {
                const color = board[r][c].color;
                if (color && color === board[r+1][c].color && color === board[r+2][c].color) {
                     matches.push({r, c}, {r: r+1, c}, {r: r+2, c});
                     let k = r + 3;
                     while(k < this.gridSize && board[k][c].color === color) {
                         matches.push({r: k, c});
                         k++;
                     }
                }
            }
        }
        return matches;
    }

    activateHint() {
        const move = this.findValidMove(this.state.board);
        if (move) {
            const currentScore = this.state.score || 0;
            this.updateState({ 
                score: Math.max(0, currentScore - 10),
                hintsRemaining: this.state.hintsRemaining - 1,
                hintPair: move,
                hintTimer: 20, 
                cursor: { r: move[0].r, c: move[0].c }
            });
            if (this.setScore) this.setScore(Math.max(0, currentScore - 10));
        }
    }

    findValidMove(board) {
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize - 1; c++) {
                if (this.checkSwap(board, r, c, r, c+1)) return [{r, c}, {r, c: c+1}];
            }
        }
        for (let r = 0; r < this.gridSize - 1; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                if (this.checkSwap(board, r, c, r+1, c)) return [{r, c}, {r: r+1, c}];
            }
        }
        return null;
    }

    checkSwap(board, r1, c1, r2, c2) {
        const sim = JSON.parse(JSON.stringify(board));
        const temp = sim[r1][c1].color;
        sim[r1][c1].color = sim[r2][c2].color;
        sim[r2][c2].color = temp;
        
        const matches = this.findMatches(sim);
        return matches.length > 0;
    }

    hasValidMoves(board) {
        return !!this.findValidMove(board);
    }
    
    shuffleBoard() {
        let attempts = 0;
        let valid = false;
        let newBoard = null;
        
        while (!valid && attempts < 100) {
             attempts++;
             let colors = [];
             for(let r=0; r<this.gridSize; r++) {
                 for(let c=0; c<this.gridSize; c++) {
                     if (this.state.board[r][c].color) colors.push(this.state.board[r][c].color);
                     else colors.push(getRandomColor()); 
                 }
             }
             for (let i = colors.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [colors[i], colors[j]] = [colors[j], colors[i]];
             }
             
             newBoard = [];
             let idx = 0;
             for(let r=0; r<this.gridSize; r++) {
                 const row = [];
                 for(let c=0; c<this.gridSize; c++) {
                     row.push({ color: colors[idx++], type: 0 });
                 }
                 newBoard.push(row);
             }
             
             if (this.findMatches(newBoard).length === 0 && this.hasValidMoves(newBoard)) {
                 valid = true;
             }
        }
        
        if (valid) {
            this.updateState({ board: newBoard });
            this.setStatus('No Moves! Shuffled Board.');
        } else {
             this.updateState({ board: this.initBoard() });
        }
    }


    drawTile(grid, r, c, color, tick, isHovered, isSelected, offsetY = 0) {
        const startY = r * (TILE_SIZE + TILE_GAP) + offsetY;
        const startX = c * (TILE_SIZE + TILE_GAP);

        const safeDraw = (y, x, val) => {
            if (grid[y] && grid[y][x] !== undefined) grid[y][x] = val;
        };

        for(let i=0; i<TILE_SIZE; i++) {
             for(let j=0; j<TILE_SIZE; j++) {
                 safeDraw(startY + i, startX + j, color);
             }
        }

        const drawCorners = (cColor) => {
            const corners = [[0, 0], [0, 2], [2, 0], [2, 2]];
            corners.forEach(([dy, dx]) => {
                safeDraw(startY + dy, startX + dx, cColor);
            });
        };

        if (isSelected) {
            drawCorners(COLORS.WHITE); 
        } else if (isHovered) {
             if (Math.floor(tick / 5) % 2 === 0) {
                 drawCorners(COLORS.WHITE); 
             }
        }
        
        if (this.state.hintPair) {
             const isHinted = this.state.hintPair.some(h => h.r === r && h.c === c);
             if (isHinted && Math.floor(tick / 2) % 2 === 0) {
                  for(let i=0; i<TILE_SIZE; i++) {
                     for(let j=0; j<TILE_SIZE; j++) {
                         safeDraw(startY + i, startX + j, COLORS.WHITE);
                     }
                  }
             }
        }
    }


    updateState(updates) {
        this.state = { ...this.state, ...updates };
        this.status = this.state; 
    }

    preview(saveData, tick) {
        const grid = createEmptyGrid();
        
        if (!saveData || !saveData.board) {
            drawSprite(grid, getCharGrid('L'), 5, 2, COLORS.RED);
            drawSprite(grid, getCharGrid('I'), 5, 6, COLORS.GREEN);
            drawSprite(grid, getCharGrid('N'), 5, 10, COLORS.BLUE);
            drawSprite(grid, getCharGrid('E'), 5, 14, COLORS.YELLOW);
            return grid;
        }

        const board = saveData.board;
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (board[r] && board[r][c] && board[r][c].color) {
                    this.drawTile(grid, r, c, board[r][c].color, tick, false, false, 0);
                }
            }
        }

        return grid;
    }
}


export default LineLogic;