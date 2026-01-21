
import GameLogic from './model/GameLogic';
import { createEmptyGrid, COLORS, BUTTONS } from './utils/constants';
import { getCharGrid } from './utils/pixel-font';
import { drawSprite } from './utils/menu';

const DEFAULT_GRID_SIZE = 5;
const TILE_SIZE = 3;
const TILE_GAP = 1;

// Available colors for tiles
const TILE_COLORS = [
    COLORS.RED, 
    COLORS.GREEN, 
    COLORS.BLUE, 
    COLORS.YELLOW, 
    COLORS.PURPLE || COLORS.PINK || [1, 0, 1] // Fallback if PINK/PURPLE not defined, assuming [r,g,b] or simple coloring
];

// Helper to get random color
const getRandomColor = () => TILE_COLORS[Math.floor(Math.random() * TILE_COLORS.length)];

class LineLogic extends GameLogic {
    constructor(setMatrix, setScore, setStatus, setTimer, onExit, savedState, gameId, config = {}) {
        super(setMatrix, setScore, setStatus, onExit);
        this.setTimer = setTimer;
        this.gameId = gameId;
        this.config = config;
        this.gridSize = config.size || DEFAULT_GRID_SIZE;
        
        // Initial Game Config
        this.timeLimit = 120; // Default 120s? User logic "score - 240". Maybe different? 
        // If I use 120s, and formula is score-240. 
        // If user didn't specify start time, I'll use 120s.

        this.status = {
            board: this.initBoard(),
            cursor: { r: 2, c: 2 },
            selected: null,
            mode: 'INPUT', // INPUT, ANIMATING
            animState: 'IDLE', // IDLE, CLEAR, DROP_CHECK, DROPPING, CHECK_MATCH
            animData: {
                waitTick: 0,
                pixelOffset: 0,
                activeDroppers: [], // Indices of cols? or specific tiles? Simpler: Board-wide gravity step.
                newSpawns: [] // {c, color} ready to enter at r=-1
            },
            score: 0,
            remainingTime: 120, // Default start
            gameOver: false,
            hintsRemaining: 3,
            hintPair: null,
            hintTimer: 0,
            ...savedState
        };
        
        // Ensure complex objects are restored if savedState was partial or missing
        if (!this.status.board) this.status.board = this.initBoard();
        if (savedState && savedState.hintsRemaining !== undefined) this.status.hintsRemaining = savedState.hintsRemaining;
        
        // Restore external UI
        if (this.setScore) this.setScore(this.status.score);
        if (this.setTimer && this.status.remainingTime !== undefined) this.setTimer(this.status.remainingTime);
        
        this.setStatus('LINE');
        this.name = 'LINE';
        this.state = this.status;
        
        // Tick tracking
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

    // ... initBoard same ...
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

        // Map pixel (0-19) to grid (0-4)
        // TILE_SIZE=3, GAP=1 -> Pitch=4
        const pitch = TILE_SIZE + TILE_GAP;
        
        // Ignore clicks on gaps
        if (r % pitch === TILE_SIZE || c % pitch === TILE_SIZE) return;

        const gridR = Math.floor(r / pitch);
        const gridC = Math.floor(c / pitch);

        // Bounds check
        if (gridR < 0 || gridR >= this.gridSize || gridC < 0 || gridC >= this.gridSize) return;

        // Update Cursor
        this.updateState({ cursor: { r: gridR, c: gridC } });
        
        // Trigger Selection/Swap
        this.handleEnter();
    }

    onConsolePress(action, tick) {
        if (this.state.mode === 'ANIMATING') return; // BLOCK INPUT

        if (action === BUTTONS.BACK) {
            this.onExit();
            return;
        }

        // Clear Hint on any input
        if (this.state.hintPair) {
             this.updateState({ hintPair: null, hintTimer: 0 });
        }

        // Handle Hint
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

                // Check Matches to start animation
                const matches = this.findMatches(newBoard);
                if (matches.length > 0) {
                    this.startAnimation('CLEAR', { matches });
                } else {
                    // Start 'Swap Back' animation? 
                    // User said "No swap func rn" before, but implies standard logic now.
                    // For now, accept invalid moves until requested.
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
            hintPair: null, // Clear hint if animation starts (e.g. valid move made)
            hintTimer: 0
        });
    }

    endGame() {
        // Final Score Calculation
        // Formula: score - 240
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
            // Render Game Over?
            const grid = createEmptyGrid();
            drawSprite(grid, getCharGrid('E'), 5, 2, COLORS.RED);
            drawSprite(grid, getCharGrid('N'), 5, 7, COLORS.RED);
            drawSprite(grid, getCharGrid('D'), 5, 12, COLORS.RED);
            this.setMatrix(grid);
            this.setStatus(`Final Score: ${this.state.score} | ENTER: Replay`);
            return;
        }

        // Timer Logic
        if (this.lastSecondTick === null) this.lastSecondTick = tick;
        if (tick - this.lastSecondTick >= 10 && this.state.mode !== 'ANIMATING') { 
            // Pause timer during animation? User didn't specify. 
            // Usually match-3 timers keep running.
            // But let's keep running for pressure.
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
            if (animState === 'CLEAR') { // 1. Clear Matches
                 if (animData.waitTick === 0) {
                     // Clear cells logically
                     animData.matches.forEach(({r, c}) => {
                         if (board[r] && board[r][c]) board[r][c].color = null;
                     });
                     
                     // Scoring Logic: (tiles break - 2) * 10
                     // Count unique tiles broken in this batch?
                     // matches is array of {r,c}. Duplicates possible if horizontal+vertical intersect?
                     // findMatches usually returns unique set or list. 
                     // My findMatches implementation adds duplicates?
                     // findMatches implementation: push {r,c}. 
                     // Let's create a Set of IDs "r,c" to count unique broken tiles.
                     // Let's create a Set of IDs "r,c" to count unique broken tiles.
                     const uniqueBroken = new Set(animData.matches.map(m => `${m.r},${m.c}`));
                     const count = uniqueBroken.size;
                     
                     if (count > 0) { // Should be > 0
                         const points = (count - 2) * 10;
                         const newScore = (this.state.score || 0) + points;
                         this.updateState({ score: newScore });
                         if (this.setScore) this.setScore(newScore);
                     }

                     // Wait logic
                     this.updateState({ animData: { ...animData, waitTick: 1 } }); // 1 tick = 100ms
                 } else {
                     // Done waiting -> Check Gravity
                     this.startAnimation('DROP_CHECK');
                     return; 
                 }
            } else if (animState === 'DROP_CHECK') { // 2. Identify Drops
                 const droppers = []; // List of {r, c} that can move DOWN 1 slot
                 const newSpawns = []; // List of {c, color}

                 // Track falling status map for chaining
                 const isFalling = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(false));

                 for (let c = 0; c < this.gridSize; c++) {
                     // 1. Identify Droppers (Bottom-Up)
                     for (let r = this.gridSize - 2; r >= 0; r--) { // Start from second last row
                         const current = board[r][c];
                         const below = board[r+1][c];
                         
                         // If current has a tile
                         if (current.color !== null) {
                             const belowEmpty = (below.color === null);
                             const belowFalling = isFalling[r+1][c];
                             
                             if (belowEmpty || belowFalling) {
                                 droppers.push({ r, c });
                                 isFalling[r][c] = true;
                             }
                         }
                     }

                     // 2. Identify Spawns
                     // Spawn if top is empty OR top is falling (will create space)
                     if (board[0][c].color === null || isFalling[0][c]) {
                         // Ensure we don't double spawn if multiple "slots" open? 
                         // No, we only spawn 1 tile per column per "tick" (at r=-1).
                         // The loop will repeat to fill more gaps.
                         newSpawns.push({ c, color: getRandomColor() });
                     }
                 }

                 if (droppers.length === 0 && newSpawns.length === 0) {
                     // Stable? Check if more matches formed
                     this.startAnimation('CHECK_MATCH');
                 } else {
                     // Start Falling
                     this.startAnimation('DROPPING', { droppers, newSpawns });
                 }
            
            } else if (animState === 'DROPPING') { // 3. Animate 4px Drop
                 if (animData.pixelOffset < 4) { // 3px tile + 1px gap = 4px pitch
                     this.updateState({ 
                         animData: { ...animData, pixelOffset: animData.pixelOffset + 1 }
                     });
                 } else {
                     // Commit Drop
                     const newBoard = JSON.parse(JSON.stringify(board));
                     
                     // Move Droppers: Bottom-up to avoid overwriting
                     // Using the saved 'droppers' list is safer
                     // Sort droppers by R desc
                     animData.droppers.sort((a, b) => b.r - a.r).forEach(({r, c}) => {
                         newBoard[r+1][c].color = newBoard[r][c].color;
                         newBoard[r][c].color = null;
                     });

                     // Move Spawns (visual at -1 -> 0)
                     animData.newSpawns.forEach(({c, color}) => {
                         newBoard[0][c].color = color;
                     });

                     this.updateState({ board: newBoard });
                     this.startAnimation('DROP_CHECK'); // Re-check gravity (recursive fall)
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

        // --- RENDER ---
        
        // Render Tiles
        // If DROPPING, we draw 'droppers' and 'newSpawns' with offset.
        // Others draw normally.
        const isDropping = (mode === 'ANIMATING' && animState === 'DROPPING');
        const dropOffset = isDropping ? animData.pixelOffset : 0;
        
        // Map of moving cells for quick lookup
        const movingCells = new Set();
        if (isDropping) {
            animData.droppers.forEach(({r, c}) => movingCells.add(`${r},${c}`));
        }

        // Draw Board Tiles
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

        // Draw New Spawns (only if dropping)
        if (isDropping) {
             animData.newSpawns.forEach(({c, color}) => {
                 // Spawning from "row -1".
                 // Initial Y for a tile is r*(SIZE+GAP). For -1: -1*4 = -4.
                 // Plus Render Offset.
                 // -4 + offset.
                 // But wait, drawTile takes (r,c). We can hack r=-1?
                 // drawTile logic: startY = r * 4. -4. Correct.
                 this.drawTile(grid, -1, c, color, tick, false, false, dropOffset);
             });
        }

        this.setMatrix(grid);
    }
    
    // ... findMatches same ...
    findMatches(board) {
        const matches = [];
        // Horizontal
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
        // Vertical
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

    // --- HINT & DEADLOCK UTILS ---

    activateHint() {
        // Find first valid swap
        const move = this.findValidMove(this.state.board);
        if (move) {
            const currentScore = this.state.score || 0;
            this.updateState({ 
                // Deduct 10 points for hint
                score: Math.max(0, currentScore - 10),
                hintsRemaining: this.state.hintsRemaining - 1,
                hintPair: move,
                hintTimer: 20, // 2s (20 ticks)
                cursor: { r: move[0].r, c: move[0].c } // Move cursor to suggested tile
            });
            if (this.setScore) this.setScore(Math.max(0, currentScore - 10));
        }
    }

    findValidMove(board) {
        // Check Horizontal Swaps
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize - 1; c++) {
                if (this.checkSwap(board, r, c, r, c+1)) return [{r, c}, {r, c: c+1}];
            }
        }
        // Check Vertical Swaps
        for (let r = 0; r < this.gridSize - 1; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                if (this.checkSwap(board, r, c, r+1, c)) return [{r, c}, {r: r+1, c}];
            }
        }
        return null;
    }

    checkSwap(board, r1, c1, r2, c2) {
        // Clone board, swap, check matches
        // Optimization: Don't deep clone entire board, just swap vals and check
        // But findMatches takes full board.
        // We can do a shallow clone of rows but deep clone of tile objects?
        // Let's use JSON parse/stringify for safety for now (5x5 is small)
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
        // Keep shuffling until valid moves exist AND no immediate matches
        let attempts = 0;
        let valid = false;
        let newBoard = null;
        
        while (!valid && attempts < 100) {
             attempts++;
             // Create flat list of colors
             let colors = [];
             for(let r=0; r<this.gridSize; r++) {
                 for(let c=0; c<this.gridSize; c++) {
                     if (this.state.board[r][c].color) colors.push(this.state.board[r][c].color);
                     else colors.push(getRandomColor()); // Filling gaps if any?
                 }
             }
             
             // Fisher-Yates
             for (let i = colors.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [colors[i], colors[j]] = [colors[j], colors[i]];
             }
             
             // Rebuild Board
             newBoard = [];
             let idx = 0;
             for(let r=0; r<this.gridSize; r++) {
                 const row = [];
                 for(let c=0; c<this.gridSize; c++) {
                     row.push({ color: colors[idx++], type: 0 });
                 }
                 newBoard.push(row);
             }
             
             // Check: No immediate matches + Has valid moves
             if (this.findMatches(newBoard).length === 0 && this.hasValidMoves(newBoard)) {
                 valid = true;
             }
        }
        
        if (valid) {
            this.updateState({ board: newBoard });
            this.setStatus('No Moves! Shuffled Board.');
            // Maybe animate?
        } else {
             // Failed to find good shuffle? Just fallback to Random init?
             this.updateState({ board: this.initBoard() });
        }
    }


    drawTile(grid, r, c, color, tick, isHovered, isSelected, offsetY = 0) {
        const startY = r * (TILE_SIZE + TILE_GAP) + offsetY;
        const startX = c * (TILE_SIZE + TILE_GAP);

        // Bounds Check Logic helper
        const safeDraw = (y, x, val) => {
            if (grid[y] && grid[y][x] !== undefined) grid[y][x] = val;
        };

        // 1. Draw Base 3x3 Block
        for(let i=0; i<TILE_SIZE; i++) {
             for(let j=0; j<TILE_SIZE; j++) {
                 safeDraw(startY + i, startX + j, color);
             }
        }

        // Helper to draw corners
        const drawCorners = (cColor) => {
            const corners = [[0, 0], [0, 2], [2, 0], [2, 2]];
            corners.forEach(([dy, dx]) => {
                safeDraw(startY + dy, startX + dx, cColor);
            });
        };

        // 2. Logic: Selected overrides Selecting
        if (isSelected) {
            drawCorners(COLORS.WHITE); 
        } else if (isHovered) {
             if (Math.floor(tick / 5) % 2 === 0) {
                 drawCorners(COLORS.WHITE); 
             }
        }
        
        // 3. Hint Drawing (Flicker)
        if (this.state.hintPair) {
             const isHinted = this.state.hintPair.some(h => h.r === r && h.c === c);
             if (isHinted && Math.floor(tick / 2) % 2 === 0) {
                  // Flash White
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
        // Sync with base status for saving if needed (GameLogic structure might vary)
        this.status = this.state; 
    }

    preview(saveData, tick) {
        const grid = createEmptyGrid();
        
        if (!saveData || !saveData.board) {
            // New Game Preview
            drawSprite(grid, getCharGrid('L'), 5, 2, COLORS.RED);
            drawSprite(grid, getCharGrid('I'), 5, 6, COLORS.GREEN);
            drawSprite(grid, getCharGrid('N'), 5, 10, COLORS.BLUE);
            drawSprite(grid, getCharGrid('E'), 5, 14, COLORS.YELLOW);
            return grid;
        }

        // Saved Game Preview: Render Board
        const board = saveData.board;
        // reuse drawTile logic or simplistic render
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