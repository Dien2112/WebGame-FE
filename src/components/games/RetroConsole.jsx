import React, { useState, useEffect } from 'react';
import DotMatrix from './DotMatrix';
import ConsoleControls from './ConsoleControls';
import ColorPicker from './ColorPicker';
import MenuLogic from '@/game-logic/MenuLogic';
import ScenarioSelectLogic, { createGameLogic } from '@/game-logic/ScenarioSelectLogic';
import { createEmptyGrid, COLORS } from '@/game-logic/utils/constants';
import { fetchGames } from '@/game-logic/utils/game-service';

// ... (existing imports)

const RetroConsole = ({ onGameSelect }) => {
    // App States: LOADING -> MENU -> SCENARIO_SELECT -> PLAYING
    const [activeApp, setActiveApp] = useState('LOADING');

    // Data State
    const [gamesData, setGamesData] = useState([]);

    // Game Logic Instance
    const gameLogicRef = React.useRef(null);

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
    // const [playTime, setPlayTime] = useState(0); // If needed by parent? 
    // Actually Logic handles its own time internally often, or we pass a global tick.
    // TTT Logic doesn't really use time except in display.
    // Placeholder uses global tick.

    // Initial Fetch
    useEffect(() => {
        fetchGames().then(data => {
            setGamesData(data);
            setActiveApp('MENU');
            setMessage('');

            // Initialize MenuLogic
            // Initialize MenuLogic
            initializeMenu(data);
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
        const timer = setInterval(() => {
            setTick(t => t + 1);

            // Delegate to GameLogic if active
            if (gameLogicRef.current) {
                gameLogicRef.current.onTick(tick);
            }

            if (isTransitioning) {
                setTransitionTick(t => t + 1);
            }
        }, 100);
        return () => clearInterval(timer);
    }, [isTransitioning, tick]); // Added tick to dependancy if needed, usually cleaner to use functional update or ref for tick


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
            const currentItem = scenarioState.items[scenarioState.selectedIndex];
            let s = 0, t = 0;
            if (currentItem && currentItem.type === 'SAVE') {
                s = currentItem.data.preview?.score ?? 0;
                t = currentItem.data.preview?.time ?? 0;
            }
            onGameSelect && onGameSelect(game, { score: s, time: t });
        }
    }, [activeApp, scenarioState, gamesData, score]);

    const handleMenuSelection = (launchId, currentGamesData) => {
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
                initializeMenu(currentGamesData);
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

    const initializeMenu = (data) => {
        if (gameLogicRef.current) gameLogicRef.current.destroy();
        gameLogicRef.current = new MenuLogic(
            setMatrix,
            setScore,
            setMessage,
            () => { },
            (game) => onGameSelect && onGameSelect(game, { score: 0, time: 0 }), // onHighlight: Notify parent
            data,
            (gameId) => handleMenuSelection(gameId, data) // onStartGame: Launch Scenario
        );
        setActiveApp('MENU');
    };

    const startGame = (item, gameId) => {
        let loadedScore = 0;
        if (item.type === 'SAVE') {
            loadedScore = item.data.preview?.score ?? 0;
        }

        setScore(loadedScore);
        setMessage(`Starting ${item.label}...`);

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

        // Use Factory to create Logic Instance
        gameLogicRef.current = createGameLogic(
            gameId,
            setMatrix,
            setScore,
            setMessage,
            () => { // onExit
                setActiveApp('MENU');
                initializeMenu(gamesData);
            },
            savedState
        );

        setActiveApp('PLAYING');
    };


    // ... (Inside handleInput) ...


    const handleInput = (button) => {
        if (activeApp === 'LOADING') return;

        // Unified Delegation to GameLogic
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

    return (
        <div className="flex flex-col items-center justify-center p-4 w-full">
            {isPaintGame && (
                <ColorPicker
                    selectedColorIndex={selectedColorIndex}
                    onColorSelect={handleColorSelect}
                    onClearAll={handleClearAll}
                />
            )}
            <DotMatrix matrix={matrix} onDotClick={handleDotClick} />
            <ConsoleControls
                onButtonPress={handleInput}
                showVertical={true} // Always show controls? Or logic dependent. Logic doesn't control this prop yet.
            />
            <div className="mt-6 text-sm font-mono text-gray-500 font-bold uppercase tracking-widest text-center h-4 w-full">
                {message}
            </div>
        </div>
    );
};

export default RetroConsole;
