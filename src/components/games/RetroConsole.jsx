import React, { useState, useEffect } from 'react';
import DotMatrix from './DotMatrix';
import ConsoleControls from './ConsoleControls';
import ColorPicker from './ColorPicker';
import { Star, MessageSquare, Clock, Trophy } from 'lucide-react';
import MenuLogic from '@/game-logic/MenuLogic';
import PauseLogic from '@/game-logic/PauseLogic';
import ScenarioSelectLogic, { createGameLogic } from '@/game-logic/ScenarioSelectLogic';
import { createEmptyGrid, COLORS, BUTTONS } from '@/game-logic/utils/constants';
import { fetchGames, saveGame } from '@/game-logic/utils/game-service';

// ... (existing imports)

const RetroConsole = ({ onGameSelect }) => {
    // App States: LOADING -> MENU -> SCENARIO_SELECT -> PLAYING
    const [activeApp, setActiveApp] = useState('LOADING');

    // Data State
    const [gamesData, setGamesData] = useState([]);
    const gamesDataRef = React.useRef([]);

    useEffect(() => {
        gamesDataRef.current = gamesData;
    }, [gamesData]);

    // Game Logic Instance
    const gameLogicRef = React.useRef(null);
    const pausedGameLogicRef = React.useRef(null);

    // Scenario State
    const [scenarioState, setScenarioState] = useState({
        gameId: null,
        items: [],
        selectedIndex: 0
    });

    const [matrix, setMatrix] = useState(createEmptyGrid());
    const [message, setMessage] = useState('Booting System...');
    const [tick, setTick] = useState(0);
    const [selectedColorIndex, setSelectedColorIndex] = useState(4); // For Paint game
    // Stats State - Managed by Logic via callbacks, but maintained here for display if component needs it
    // Actually, matrix and message are the main display outputs. 
    // RetroConsole displays message at bottom.
    // Logic classes call setScore/playTime directly? 
    // The Logic classes accept setScore. 

    // We keep these to pass setters to Logic
    const [score, setScore] = useState(0);
    const [timer, setTimer] = useState(120);
    const [isTimerDescending, setIsTimerDescending] = useState(true);
    // const [playTime, setPlayTime] = useState(0); // If needed by parent? 
    // Actually Logic handles its own time internally often, or we pass a global tick.
    // TTT Logic doesn't really use time except in display.
    // Placeholder uses global tick.

    // Initial Fetch
    useEffect(() => {
        fetchGames().then(data => {
            const activeGames = Array.isArray(data) ? data.filter(g => g.is_active) : [];
            setGamesData(activeGames);
            setActiveApp('MENU');
            setMessage('');
            console.log(activeGames);
            if (activeGames.length > 0) {
                onGameSelect({ game: activeGames[0], isPlaying: false });
            }

            // Initialize MenuLogic
            initializeMenu(activeGames);
        });

        return () => {
            if (gameLogicRef.current) gameLogicRef.current.destroy();
        };
    }, []);

    // Transition State
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [transitionTick, setTransitionTick] = useState(0);

    // Tick Loop
    useEffect(() => {
        const timerInterval = setInterval(() => {
            setTick(t => t + 1);

            // Delegate to GameLogic if active
            if (gameLogicRef.current) {
                gameLogicRef.current.onTick(tick);

                // Timer Logic
                // Only run timer if playing and NOT paint game
                if (activeApp === 'PLAYING' && gameLogicRef.current.name !== 'PAINT') {
                    // Run every 10 ticks (1000ms) approx
                    if (tick % 10 === 0) {
                        if (isTimerDescending && timer > 0) {
                            setTimer(t => Math.max(0, t - 1));
                        }
                    }
                }
            }

            if (isTransitioning) {
                setTransitionTick(t => t + 1);
            }
        }, 100);
        return () => clearInterval(timerInterval);
    }, [isTransitioning, tick, activeApp, isTimerDescending, timer]); // Added dependencies for timer


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
            // Handled by MenuLogic via onHighlight callback
        } else if (activeApp === 'SCENARIO_SELECT') {
            const game = gamesData.find(g => g.internalId === scenarioState.gameId);
            if (game && onGameSelect) {
                onGameSelect({ game, isPlaying: false });
            }
        }
    }, [activeApp, scenarioState, gamesData /* score removed as it caused loop/unnecessary updates? */]);

    const handleMenuSelection = (launchId, _unused) => {
        const currentGamesData = gamesDataRef.current;
        const gameInfo = currentGamesData.find(g => g.internalId === launchId);
        const saves = gameInfo ? gameInfo.saved_game : [];

        console.log(`[RetroConsole] Launching ${launchId}, Config:`, gameInfo?.config, `Saves:`, saves);

        const items = [
            { type: 'NEW', label: 'NEW GAME' },
            ...saves.map(s => ({ type: 'SAVE', data: s, label: `SAVE ${s.id}` }))
        ];

        // START SCENARIO SELECT LOGIC
        if (gameLogicRef.current) gameLogicRef.current.destroy();
        gameLogicRef.current = new ScenarioSelectLogic(
            setMatrix,
            setScore,
            setMessage,
            () => {
                // onExit: Back to Menu
                setActiveApp('MENU');
                // Re-init MenuLogic? Or just keep it resident? 
                // Since we destroyed it, we need to reinit or swap.
                // Simpler to just re-init MenuLogic here.
                refreshMenu();
            },
            items,
            launchId,
            (item, gameId) => startGame(item, gameId) // onStartGame
        );

        setActiveApp('SCENARIO_SELECT'); // effectively just a label now for render effect cleanup?
        // Actually we should rely on GameLogic for render. 
        // But RetroConsole still has some legacy renders in useEffect that checks activeApp.
        // We need to clean that up.
    };

    const handlePause = () => {
        if (activeApp === 'PLAYING') {
            pausedGameLogicRef.current = gameLogicRef.current;

            gameLogicRef.current = new PauseLogic(
                setMatrix,
                setScore,
                setMessage,
                () => handleResume(), // onResume
                () => handleSaveGame(), // onSave
                () => { // onExit (optional, maybe added to PauseLogic later)
                    if (pausedGameLogicRef.current) pausedGameLogicRef.current.destroy();
                    pausedGameLogicRef.current = null;
                    setActiveApp('MENU');
                    refreshMenu();
                }
            );
            setActiveApp('PAUSED');
            setMessage('PAUSED');
        } else if (activeApp === 'PAUSED') {
            handleResume();
        }
    };

    const handleResume = () => {
        if (pausedGameLogicRef.current) {
            gameLogicRef.current.destroy(); // Destroy menu
            gameLogicRef.current = pausedGameLogicRef.current;
            pausedGameLogicRef.current = null;
            setActiveApp('PLAYING');
            setMessage('RESUMING...');
        } else {
            // Fallback
            initializeMenu(gamesDataRef.current);
        }
    };

    const handlePauseAction = async (actionId) => {
        if (actionId === 'RESUME') {
            handleResume();
        } else if (actionId === 'SAVE') {
            await handleSaveGame();
        } else if (actionId === 'EXIT') {
            if (pausedGameLogicRef.current) pausedGameLogicRef.current.destroy();
            pausedGameLogicRef.current = null;
            setActiveApp('MENU');
            refreshMenu();
        }
    };

    const handleSaveGame = async () => {
        // Support saving from Pause Menu OR active Paint game
        const logic = pausedGameLogicRef.current || (activeApp === 'PLAYING' ? gameLogicRef.current : null);

        if (logic) {
            setMessage('SAVING...');
            // Pass current timer (from RetroConsole state) to logic if needed
            const gameState = logic.getSaveData ? logic.getSaveData(timer) : null;
            const gameId = logic.name; // Logic should have name matching internalId

            if (gameState && gameId) {
                try {
                    await saveGame(gameId, { preview: gameState });
                    setMessage('GAME SAVED!');
                    // Update cache silently so if they exit later it's fresh?
                    // Actually, refreshMenu on exit covers it. 
                    // But if they save, resume, play more, save again...
                    // We don't need to refresh MENU data until we GO to menu.
                    // But user might want to see save slot update immediately? No, valid only when loading.

                    // We can trigger a background fetch just in case.
                    fetchGames().then(d => setGamesData(d));

                    setTimeout(() => {
                        if (pausedGameLogicRef.current) {
                            handleResume(); // Auto resume after save if paused
                        } else {
                            setMessage('PAINT - CLICK TO DRAW'); // Restore paint message
                        }
                    }, 1000);
                } catch (e) {
                    setMessage('SAVE FAILED');
                    setTimeout(() => {
                        if (pausedGameLogicRef.current) {
                            setMessage('PAUSED');
                        } else {
                            setMessage('PAINT - CLICK TO DRAW');
                        }
                    }, 1000);
                }
            } else {
                setMessage('CANNOT SAVE');
            }
        }
    };

    const refreshMenu = () => {
        // Re-fetch logic
        fetchGames().then(data => {
            setGamesData(data); // This updates ref
            // Note: MenuLogic needs to be re-initialized with new data?
            // Yes, initializeMenu calls new MenuLogic with data.
            // If data is passed to initializeMenu, it uses it.
            // We need to wait for fetch? 
            // Or just fetch and then init.
            initializeMenu(data);
        });
    };

    const initializeMenu = (data) => {
        if (gameLogicRef.current) gameLogicRef.current.destroy();

        // Explicitly set Playing to false when entering menu
        // We do this via the callback or directly here if we know the default selection
        // But MenuLogic will trigger onHighlight immediately.

        const menuData = data || gamesDataRef.current;

        gameLogicRef.current = new MenuLogic(
            setMatrix,
            setScore,
            setMessage,
            () => { },
            (game) => {
                if (onGameSelect) onGameSelect({ game, isPlaying: false });
            }, // onHighlight: Notify parent
            menuData,
            (gameId) => handleMenuSelection(gameId, menuData) // onStartGame: Launch Scenario
        );
        setActiveApp('MENU');
    };

    const startGame = (item, gameId) => {
        let loadedScore = 0;
        if (item.type === 'SAVE') {
            loadedScore = item.data.preview?.score ?? 0;
        }

        setScore(loadedScore);
        // Reset Timer defaults
        setTimer(120);
        setIsTimerDescending(true);

        setMessage(`Starting ${item.label}...`);

        const currentGamesData = gamesDataRef.current;
        const gameInfo = currentGamesData.find(g => g.internalId === gameId);

        // Notify Parent
        if (onGameSelect) {
            // Ensure we pass a game object even if find fails (shouldn't happen if IDs match)
            if (gameInfo) {
                onGameSelect({ game: gameInfo, isPlaying: true });
            } else {
                console.warn(`[RetroConsole] Could not find game info for ${gameId}`);
            }
        }

        // Destroy previous logic
        if (gameLogicRef.current) gameLogicRef.current.destroy();

        // Prepare Initial State if needed (mostly for TTT legacy support or generic saved state)
        // ideally logic classes handle their own saved state parsing.
        // For now, pass 'item.data' which is the saved state object.
        let savedState = null;
        if (item.type === 'SAVE') {
            // Unwrap the state from the save object
            savedState = item.data?.preview;
        }

        console.log(`[RetroConsole] Starting Game: ${gameId}, SavedState:`, savedState);

        // Use Factory to create Logic Instance
        console.log(`[RetroConsole] Creating GameLogic for ${gameId}...`);
        try {
            gameLogicRef.current = createGameLogic(
                gameId, // Internal ID usage for switch
                setMatrix,
                setScore,
                setMessage, // status/message
                setTimer, // Pass setTimer
                () => { // onExit
                    setActiveApp('MENU');
                    refreshMenu();
                },
                savedState,
                gameInfo ? gameInfo.id : null, // PASS NUMERIC ID HERE
                gameInfo ? gameInfo.config : {} // PASS CONFIG HERE
            );
            console.log(`[RetroConsole] GameLogic Created:`, gameLogicRef.current);
        } catch (e) {
            console.error(`[RetroConsole] Failed to create logic:`, e);
        }

        setActiveApp('PLAYING');
    };


    // ... (Inside handleInput) ...


    const handleInput = (button) => {
        if (activeApp === 'LOADING') return;

        // Unified Delegation to GameLogic
        if (button === BUTTONS.PAUSE) {
            // Per request: Pause in PaintGame acts as Save
            if (gameLogicRef.current && gameLogicRef.current.name === 'PAINT') {
                handleSaveGame();
            } else {
                handlePause();
            }
            return;
        }

        if (gameLogicRef.current) {
            gameLogicRef.current.onConsolePress(button, tick);
            return;
        }

        // Emergency Fallback
        if (button === 'BACK') {
            setActiveApp('MENU');
            initializeMenu(gamesData);
            return;
        }
    };

    const handleDotClick = (r, c) => {
        if (gameLogicRef.current) {
            gameLogicRef.current.onDotClick(r, c);
        }
    };

    const handleColorSelect = (colorIndex, customColor) => {
        setSelectedColorIndex(colorIndex);
        if (gameLogicRef.current && gameLogicRef.current.setSelectedColor) {
            gameLogicRef.current.setSelectedColor(colorIndex, customColor);
        }
    };

    const handleClearAll = () => {
        if (gameLogicRef.current && gameLogicRef.current.clearCanvas) {
            gameLogicRef.current.clearCanvas();
        }
    };

    // Sync selected color from game logic (for keyboard navigation)
    useEffect(() => {
        if (gameLogicRef.current && gameLogicRef.current.getSelectedColorIndex) {
            const interval = setInterval(() => {
                const currentIndex = gameLogicRef.current.getSelectedColorIndex();
                if (currentIndex !== selectedColorIndex) {
                    setSelectedColorIndex(currentIndex);
                }
            }, 100);
            return () => clearInterval(interval);
        }
    }, [activeApp, selectedColorIndex]);

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

        // All other Rendering is handled by gameLogicRef.current.onTick()
        // which calls setMatrix directly.

    }, [activeApp, tick]);

    // Check if current game is Paint
    const isPaintGame = activeApp === 'PLAYING' && gameLogicRef.current?.name === 'PAINT';

    const formatTime = (seconds) => {
        if (seconds === null || seconds === undefined) return "--:--";
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col items-center justify-center p-4 w-full">
            {/* Score & Timer Panel */}
            {!isPaintGame && (activeApp === 'PLAYING' || activeApp === 'PAUSED') && (
                <div className="flex justify-between w-[380px] mb-2 font-mono text-xs font-bold text-slate-100">
                    {/* Time Box */}
                    <div className="flex flex-col items-center justify-center w-[110px] px-1 py-1 bg-slate-800 border-2 border-slate-500 rounded-sm shadow-md">
                        <span className="text-[8px] text-slate-400 uppercase tracking-widest mb-0.5 self-start">TIME</span>
                        <div className="flex items-center space-x-1.5 text-sm tracking-widest text-blue-200 drop-shadow-[0_0_3px_rgba(191,219,254,0.5)]">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(timer)}</span>
                        </div>
                    </div>

                    {/* Score Box */}
                    <div className="flex flex-col items-center justify-center w-[110px] px-1 py-1 bg-slate-800 border-2 border-slate-500 rounded-sm shadow-md">
                        <span className="text-[8px] text-slate-400 uppercase tracking-widest mb-0.5 self-start">SCORE</span>
                        <div className="flex items-center space-x-1.5 text-sm tracking-widest text-yellow-200 drop-shadow-[0_0_3px_rgba(254,240,138,0.5)]">
                            <Trophy className="w-3 h-3" />
                            <span>{score}</span>
                        </div>
                    </div>
                </div>
            )}
            {isPaintGame && (
                <ColorPicker
                    selectedColorIndex={selectedColorIndex}
                    onColorSelect={handleColorSelect}
                    onClearAll={handleClearAll}
                />
            )}
            <DotMatrix matrix={matrix} onDotClick={handleDotClick} />

            <div className="mt-4 mb-2 text-sm font-mono text-gray-500 font-bold uppercase tracking-widest text-center h-4 w-full">
                {message}
            </div>

            <div className="transform scale-150 origin-top mt-4 mb-8">
                <ConsoleControls
                    onButtonPress={handleInput}
                    showVertical={true}
                    pauseLabel={isPaintGame ? 'SAVE' : 'PAUSE'}
                />
            </div>
        </div>
    );
};

export default RetroConsole;
