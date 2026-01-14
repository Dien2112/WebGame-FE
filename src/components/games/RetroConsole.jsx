import React, { useState, useEffect } from 'react';
import DotMatrix from './DotMatrix';
import ConsoleControls from './ConsoleControls';
import { initialMenuState, updateMenu, renderMenu, drawSprite, MENU_ITEMS } from '@/game-logic/menu';
import { createEmptyGrid, COLORS } from '@/game-logic/constants';
import { getCharGrid } from '@/game-logic/pixel-font';
import { fetchGames } from '@/game-logic/game-service';
import { initialTicTacToeState, updateTicTacToe, renderTicTacToe } from '@/game-logic/tic-tac-toe';
import { initialLineState, updateLineGame, renderLineGame } from '@/game-logic/line-game';
import { initialSnakeState, updateSnake, renderSnake } from '@/game-logic/snake-game';

// ... (existing imports)

const RetroConsole = ({ onGameSelect }) => {
    // App States: LOADING -> MENU -> SCENARIO_SELECT -> PLAYING
    const [activeApp, setActiveApp] = useState('LOADING');

    // Data State
    const [gamesData, setGamesData] = useState([]);

    // Menu State
    const [menuState, setMenuState] = useState(initialMenuState);

    // Scenario State
    const [scenarioState, setScenarioState] = useState({
        gameId: null,
        items: [],
        selectedIndex: 0
    });

    const [matrix, setMatrix] = useState(createEmptyGrid());
    const [message, setMessage] = useState('Booting System...');
    const [tick, setTick] = useState(0);

    // Game States
    const [playingGame, setPlayingGame] = useState(null);
    const [tttState, setTTTState] = useState(initialTicTacToeState);
    const [lineState, setLineState] = useState(initialLineState);
    const [snakeState, setSnakeState] = useState(initialSnakeState);

    // Stats State
    const [playTime, setPlayTime] = useState(0);
    const [score, setScore] = useState(0);

    // Initial Fetch
    useEffect(() => {
        fetchGames().then(data => {
            setGamesData(data);
            setActiveApp('MENU');
            setMessage('');
        });
    }, []);

    // Transition State
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [transitionTick, setTransitionTick] = useState(0);

    // Tick Loop
    useEffect(() => {
        const timer = setInterval(() => {
            setTick(t => t + 1);
            if (activeApp === 'PLAYING') {
                setPlayTime(prev => prev + 1);
            }
            if (isTransitioning) {
                setTransitionTick(t => t + 1);
            }
        }, 100);
        return () => clearInterval(timer);
    }, [activeApp, isTransitioning]);

    // Handle Transition Completion
    useEffect(() => {
        if (isTransitioning && transitionTick > 10) { // Run for 10 ticks (1s)
            setIsTransitioning(false);
            setTransitionTick(0);
            startGame(scenarioState.items[scenarioState.selectedIndex]);
        }
    }, [isTransitioning, transitionTick, scenarioState]);

    // Notify Parent of selection changes
    useEffect(() => {
        if (activeApp === 'MENU') {
            const menuItem = MENU_ITEMS[menuState.selectedIndex];
            // Safe check in case MENU_ITEMS length != menuState.selectedIndex (should match logic)
            if (menuItem) {
                const game = gamesData.find(g => g.internalId === menuItem.id);
                // Fallback to index if no ID match (legacy), but ID match is preferred
                const finalGame = game || gamesData[menuState.selectedIndex];
                onGameSelect && onGameSelect(finalGame, { score: 0, time: 0 });
            }
        } else if (activeApp === 'SCENARIO_SELECT') {
            const game = gamesData.find(g => g.internalId === scenarioState.gameId);
            const currentItem = scenarioState.items[scenarioState.selectedIndex];
            let s = 0, t = 0;
            if (currentItem && currentItem.type === 'SAVE') {
                s = currentItem.data.preview?.score ?? 0;
                t = currentItem.data.preview?.time ?? 0;
            }
            onGameSelect && onGameSelect(game, { score: s, time: t });
        } else if (activeApp === 'PLAYING') {
            const game = gamesData.find(g => g.internalId === playingGame);
            onGameSelect && onGameSelect(game, { score: score, time: Math.floor(playTime / 10) });
        }
    }, [activeApp, menuState.selectedIndex, scenarioState, playingGame, gamesData, score, playTime]);

    const startGame = (item) => {
        let loadedScore = 0;
        let loadedTime = 0;

        if (item.type === 'SAVE') {
            // Score/Time are now strictly in item.data.preview as per user request
            loadedScore = item.data.preview?.score ?? 0;
            loadedTime = item.data.preview?.time ?? 0;
        }

        setScore(loadedScore);
        setPlayTime(loadedTime * 10); // 10 ticks per second
        setMessage(`Starting ${item.label}...`);

        // START GAME LOGIC
        if (scenarioState.gameId === 'TICTACTOE') {
            setPlayingGame('TICTACTOE');
            setTTTState(initialTicTacToeState);
            if (item.type === 'SAVE' && item.data.preview && item.data.preview.board) {
                const savedBoard = item.data.preview.board;
                const savedWinner = item.data.preview.winner;
                setTTTState({
                    ...initialTicTacToeState,
                    board: savedBoard,
                    winner: savedWinner,
                    turn: 'X'
                });
            }
            setActiveApp('PLAYING');
            setMessage('TIC-TAC-TOE');
        } else if (scenarioState.gameId === 'LINE') {
            setPlayingGame('LINE');
            setLineState(initialLineState);
            setActiveApp('PLAYING');
            setMessage('LINE MATCH');
        } else if (scenarioState.gameId === 'SNAKE') {
            setPlayingGame('SNAKE');
            if (item.type === 'SAVE' && item.data.preview && item.data.preview.snake) {
                setSnakeState({
                    ...initialSnakeState,
                    snake: item.data.preview.snake,
                    apple: item.data.preview.apple || [10, 10],
                    score: loadedScore,
                    direction: 'LEFT' // Default
                });
            } else {
                setSnakeState(initialSnakeState);
            }
            setActiveApp('PLAYING');
            setMessage('SNAKE');
        } else {
            setPlayingGame(scenarioState.gameId);
            setActiveApp('PLAYING');
            setMessage(`${scenarioState.gameId} ACTIVE`);
        }
    };


    // ... (Inside handleInput) ...
    // Helper: Draw Text Helper
    const drawText = (grid, text, startY, startX, color) => {
        let currentX = startX;
        for (let i = 0; i < text.length && i < 5; i++) { // Limit length for safety
            const charGrid = getCharGrid(text[i]);
            drawSprite(grid, charGrid, startY, currentX, color);
            currentX += 4;
        }
    };

    // Helper: Draw Nav Arrows
    const drawArrows = (grid, hasLeft, hasRight, tick, isTicTacToe = false) => {
        // Animation for TicTacToe: Move quickly to outer border
        // Normal: Blink
        let leftX = 0;
        let rightX = 17;

        if (isTicTacToe) {
            // Expand out effect
            if (isTransitioning) {
                const offset = transitionTick;
                leftX -= offset;
                rightX += offset;
            } else {
                const offset = Math.floor(tick / 2) % 2; // 0 or 1
                leftX -= offset;
                rightX += offset;
            }
        } else {
            if (Math.floor(tick / 5) % 2 !== 0) return; // Blink
        }

        if (hasLeft) drawSprite(grid, getCharGrid('<'), 9, leftX, COLORS.YELLOW);
        if (hasRight) drawSprite(grid, getCharGrid('>'), 9, rightX, COLORS.YELLOW);
    };

    const handleInput = (button) => {
        if (activeApp === 'LOADING') return;

        if (activeApp === 'MENU') {
            const nextState = updateMenu(menuState, button);
            if (nextState.launch) {
                // Find game data
                const launchId = nextState.launch;
                const gameInfo = gamesData.find(g => g.internalId === launchId);
                const saves = gameInfo ? gameInfo.saved_game : [];

                console.log(`[RetroConsole] Launching ${launchId}, Config:`, gameInfo?.config, `Saves:`, saves);

                const items = [
                    { type: 'NEW', label: 'NEW GAME' },
                    ...saves.map(s => ({ type: 'SAVE', data: s, label: `SAVE ${s.id}` }))
                ];

                setScenarioState({
                    gameId: launchId,
                    items,
                    selectedIndex: 0
                });
                setActiveApp('SCENARIO_SELECT');
            } else {
                setMenuState(nextState);
            }
        } else if (activeApp === 'SCENARIO_SELECT') {
            if (button === 'BACK') {
                setActiveApp('MENU');
            } else if (button === 'LEFT') {
                setScenarioState(prev => ({
                    ...prev,
                    selectedIndex: Math.max(0, prev.selectedIndex - 1)
                }));
            } else if (button === 'RIGHT') {
                setScenarioState(prev => ({
                    ...prev,
                    selectedIndex: Math.min(prev.items.length - 1, prev.selectedIndex + 1)
                }));
            } else if (button === 'ENTER') {
                const item = scenarioState.items[scenarioState.selectedIndex];
                console.log(`[RetroConsole] Start Scenario:`, item);

                if (scenarioState.gameId === 'TICTACTOE') {
                    // Trigger Transition
                    setIsTransitioning(true);
                    setTransitionTick(0);
                    return;
                }

                startGame(item);
            }
        } else if (activeApp === 'PLAYING') {
            if (button === 'BACK') {
                setActiveApp('MENU');
                setPlayingGame(null);
                return;
            }

            // Generic Playing Logic
            if (playingGame === 'TICTACTOE') {
                const newState = updateTicTacToe(tttState, button);
                setTTTState(newState);

                // Update Message based on state
                if (newState.winner === 'DRAW') setMessage("DRAW! 'ENTER' to RESET");
                else if (newState.winner) setMessage(`WINNER: ${newState.winner}! 'ENTER' -> RESET`);
                else setMessage(`TURN: ${newState.turn}`);
            } else if (playingGame === 'LINE') {
                const newState = updateLineGame(lineState, button);
                setLineState(newState);
                setMessage('SELECT TILES...');
            } else if (playingGame === 'SNAKE') {
                const newState = updateSnake(snakeState, button);
                setSnakeState(newState);
                // If game over, maybe reset on enter?
                if (snakeState.gameOver && button === 'ENTER') {
                    setSnakeState(initialSnakeState);
                    setScore(0);
                    setPlayTime(0);
                    setMessage('SNAKE');
                }
            }
        }
    };

    // Render Logic
    useEffect(() => {
        if (activeApp === 'LOADING') {
            const grid = createEmptyGrid();
            const frame = Math.floor(tick / 2) % 4;
            if (frame === 0) grid[10][8] = COLORS.ON;
            if (frame === 1) grid[10][9] = COLORS.ON;
            if (frame === 2) grid[10][10] = COLORS.ON;
            if (frame === 3) grid[10][11] = COLORS.ON;
            setMatrix(grid);
            setMessage('CONNECTING...');
            return;
        }

        if (activeApp === 'MENU') {
            setMatrix(renderMenu(menuState, tick));
            setMessage('SELECT GAME (LEFT/RIGHT -> ENTER)');
        } else if (activeApp === 'SCENARIO_SELECT') {
            const { items, selectedIndex, gameId } = scenarioState;
            const currentItem = items[selectedIndex];
            const grid = createEmptyGrid();

            if (currentItem) {
                if (currentItem.type === 'NEW') {
                    drawText(grid, 'NEW', 8, 2, COLORS.ON);
                } else if (currentItem.type === 'SAVE') {
                    // Draw Preview
                    const preview = currentItem.data.preview;

                    if (Array.isArray(preview)) { // Legacy Grid/Generic Grid
                        for (let r = 0; r < 20; r++) {
                            for (let c = 0; c < 20; c++) {
                                if (preview[r] && preview[r][c] !== COLORS.OFF) {
                                    grid[r][c] = preview[r][c];
                                }
                            }
                        }
                    } else if (preview && preview.snake) { // Snake State Object
                        // Render Snake
                        preview.snake.forEach(pos => {
                            if (pos[0] >= 0 && pos[0] < 20 && pos[1] >= 0 && pos[1] < 20) {
                                grid[pos[0]][pos[1]] = COLORS.ON; // Snake Body
                            }
                        });
                        // Render Apple
                        if (preview.apple) {
                            const [ay, ax] = preview.apple;
                            grid[ay][ax] = COLORS.RED;
                        }
                    } else if (preview && preview.board) { // TTT State
                        // Render full TTT preview using saved board
                        const tempState = {
                            board: preview.board,
                            winner: preview.winner || null,
                            turn: 'X', // Default, doesn't match for static render
                            winningLine: null, // Don't show winning line in preview mainly
                            cursor: { r: -1, c: -1 } // Dummy cursor to prevent crash
                        };
                        // We can reuse renderTicTacToe but it might rely on state structure
                        // Let's assume renderTicTacToe handles the grid drawing based on board.
                        const tttGrid = renderTicTacToe(tempState, tick);

                        // Copy tttGrid to main grid
                        for (let r = 0; r < 20; r++) {
                            for (let c = 0; c < 20; c++) {
                                if (tttGrid[r][c] !== COLORS.OFF) grid[r][c] = tttGrid[r][c];
                            }
                        }
                    }

                    // Show Score/Time overlay if available? 
                    // User asked: "on Game load: showing the timer (count up) of the game, and the score"
                    // We update the message lower down. 
                }
            }

            // Draw Arrows (Special effect for TICTACTOE)
            const hasLeft = selectedIndex > 0;
            const hasRight = selectedIndex < items.length - 1;
            drawArrows(grid, hasLeft, hasRight, tick, gameId === 'TICTACTOE');

            // MediaPausing Visual (Blinking Dots on Bottom Right 3x2)
            // ... (keep existing MediaPausing logic) ...
            // MediaPausing Visual (Blinking Shape on Bottom Right 3x5)
            // Pattern (Cols 17, 18, 19):
            // R15: 1 0 0
            // R16: 1 1 0
            // R17: 1 1 1
            // R18: 1 1 0
            // R19: 1 0 0
            if (Math.floor(tick / 5) % 2 === 0) {
                const c1 = COLORS.RED;
                const c0 = COLORS.OFF; // Or just don't set if transparent, but here override 

                // Row 15
                grid[15][17] = c1; grid[15][18] = c0; grid[15][19] = c0;
                // Row 16
                grid[16][17] = c1; grid[16][18] = c1; grid[16][19] = c0;
                // Row 17
                grid[17][17] = c1; grid[17][18] = c1; grid[17][19] = c1;
                // Row 18
                grid[18][17] = c1; grid[18][18] = c1; grid[18][19] = c0;
                // Row 19
                grid[19][17] = c1; grid[19][18] = c0; grid[19][19] = c0;
            }

            setMatrix(grid);

            // Message Update: Timer and Score (FIXED)
            if (currentItem && currentItem.type === 'SAVE') {
                const s = currentItem.data.preview?.score ?? 0;
                const t = currentItem.data.preview?.time ?? 0;
                setMessage(`SCORE:${s} TIME:${t}s`);
            } else {
                setMessage(`${currentItem.label} (${selectedIndex + 1}/${items.length})`);
            }

        } else if (activeApp === 'PLAYING') {
            // Overlay Timer on Message
            // We use the 'message' state as base, but maybe prepend Timer?
            // "TIME: 123 | [Status]"
            const timeSec = Math.floor(playTime / 10);
            const timeStr = `T:${timeSec}`;

            if (playingGame === 'TICTACTOE') {
                setMatrix(renderTicTacToe(tttState, tick));
                // TTT uses message for Winner/Turn. Append Timer?
                // TTT updates message in handleInput, so we might overwrite it here if we aren't careful.
                // Better: Update message in handleInput to include time, OR just override here?
                // Overriding here might flicker or lose 'WINNER' state if handleInput isn't called every tick.
                // Let's rely on handleInput updating the Core message, and we render it. 
                // BUT handleInput doesn't run on tick.
                // So we need a dynamic message renderer.

                let baseMsg = "";
                if (tttState.winner === 'DRAW') baseMsg = "DRAW! 'ENTER' to RESET";
                else if (tttState.winner) baseMsg = `WINNER:${tttState.winner}!`;
                else baseMsg = `TURN:${tttState.turn}`;

                setMessage(`${timeStr} | ${baseMsg}`);

            } else if (playingGame === 'LINE') {
                setMatrix(renderLineGame(lineState, tick));
                setMessage(`${timeStr} | SCORE:${score}`);
            } else if (playingGame === 'SNAKE') {
                if (tick % 2 === 0 && !snakeState.gameOver) {
                    const newState = updateSnake(snakeState, null);
                    setSnakeState(newState);
                    setScore(newState.score);
                    if (newState.gameOver) setMessage(`GAME OVER! SCORE:${newState.score}`);
                }
                setMatrix(renderSnake(snakeState, tick));

                if (snakeState.gameOver) setMessage(`GAME OVER! ENTER->RESTART`);
                else setMessage(`${timeStr} | SCORE:${score}`);
            } else {
                setMessage(`${timeStr} | PLAYING ${playingGame}`);
            }
        }
    }, [activeApp, menuState, scenarioState, tick, playingGame, tttState, lineState, playTime, score]);

    return (
        <div className="flex flex-col items-center justify-center p-4 w-full">
            <DotMatrix matrix={matrix} />
            <ConsoleControls
                onButtonPress={handleInput}
                showVertical={activeApp === 'PLAYING' && (playingGame === 'TICTACTOE' || playingGame === 'LINE')}
            />
            <div className="mt-6 text-sm font-mono text-gray-500 font-bold uppercase tracking-widest text-center h-4 w-full">
                {message}
            </div>
        </div>
    );
};

export default RetroConsole;
