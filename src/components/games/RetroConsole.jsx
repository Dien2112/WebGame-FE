import React, { useState, useEffect } from 'react';
import DotMatrix from './DotMatrix';
import ConsoleControls from './ConsoleControls';
import { initialMenuState, updateMenu, renderMenu, drawSprite } from '@/game-logic/menu';
import { createEmptyGrid, COLORS } from '@/game-logic/constants';
import { getCharGrid } from '@/game-logic/pixel-font';
import { fetchGames } from '@/game-logic/game-service';
import { initialTicTacToeState, updateTicTacToe, renderTicTacToe } from '@/game-logic/tic-tac-toe';
import { initialLineState, updateLineGame, renderLineGame } from '@/game-logic/line-game';

const RetroConsole = () => {
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

    // Initial Fetch
    useEffect(() => {
        fetchGames().then(data => {
            setGamesData(data);
            setActiveApp('MENU');
            setMessage('');
        });
    }, []);

    // Tick Loop
    useEffect(() => {
        const timer = setInterval(() => setTick(t => t + 1), 100);
        return () => clearInterval(timer);
    }, []);

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
    const drawArrows = (grid, hasLeft, hasRight, tick) => {
        if (Math.floor(tick / 5) % 2 !== 0) return; // Blink
        if (hasLeft) drawSprite(grid, getCharGrid('<'), 9, 0, COLORS.YELLOW);
        if (hasRight) drawSprite(grid, getCharGrid('>'), 9, 17, COLORS.YELLOW);
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
                setMessage(`Starting ${item.label}...`);

                // START GAME LOGIC
                if (scenarioState.gameId === 'TICTACTOE') {
                    setPlayingGame('TICTACTOE');
                    setTTTState(initialTicTacToeState);
                    setActiveApp('PLAYING');
                    setMessage('TIC-TAC-TOE');
                } else if (scenarioState.gameId === 'LINE') {
                    setPlayingGame('LINE');
                    setLineState(initialLineState);
                    setActiveApp('PLAYING');
                    setMessage('LINE MATCH');
                } else {
                    // Placeholder for other games
                    setMessage(`Launching ${scenarioState.gameId}... (Not Implemented)`);
                }
            }
        } else if (activeApp === 'PLAYING') {
            if (button === 'BACK') {
                setActiveApp('MENU');
                setPlayingGame(null);
                return;
            }

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
            }
        }
    };

    // Render Logic
    useEffect(() => {
        if (activeApp === 'LOADING') {
            // Simple Loading Animation logic or just text
            const grid = createEmptyGrid();
            // Maybe a spinner?
            const frame = Math.floor(tick / 2) % 4;
            // [ . . . . ]
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
            const { items, selectedIndex } = scenarioState;
            const currentItem = items[selectedIndex];
            const grid = createEmptyGrid();

            if (currentItem) {
                if (currentItem.type === 'NEW') {
                    // Draw "NEW" text centered
                    // Center "NEW": 3 chars * 4 - 1 = 11px. StartX = (20-11)/2 = 4.5 -> 2 to move left
                    drawText(grid, 'NEW', 8, 2, COLORS.ON);
                } else if (currentItem.type === 'SAVE') {
                    // Draw Preview
                    const preview = currentItem.data.preview;
                    if (preview) {
                        for (let r = 0; r < 20; r++) {
                            for (let c = 0; c < 20; c++) {
                                if (preview[r][c] !== COLORS.OFF) {
                                    grid[r][c] = preview[r][c];
                                }
                            }
                        }
                    }
                }
            }

            // Draw Arrows
            const hasLeft = selectedIndex > 0;
            const hasRight = selectedIndex < items.length - 1;
            drawArrows(grid, hasLeft, hasRight, tick);

            setMatrix(grid);
            setMessage(`${currentItem.label} (${selectedIndex + 1}/${items.length})`);
        } else if (activeApp === 'PLAYING') {
            if (playingGame === 'TICTACTOE') {
                setMatrix(renderTicTacToe(tttState, tick));
            } else if (playingGame === 'LINE') {
                setMatrix(renderLineGame(lineState, tick));
            }
        }
    }, [activeApp, menuState, scenarioState, tick, playingGame, tttState, lineState]);

    return (
        <div className="flex flex-col items-center justify-center p-4 w-full">
            <DotMatrix matrix={matrix} />
            <ConsoleControls
                onButtonPress={handleInput}
                showVertical={activeApp === 'PLAYING' && (playingGame === 'TICTACTOE' || playingGame === 'LINE')}
            />
            <div className="mt-6 text-sm font-mono text-gray-500 font-bold uppercase tracking-widest text-center h-4">
                {message}
            </div>
        </div>
    );
};

export default RetroConsole;
