import { createContext, useContext, useState, useEffect } from "react";

// Default game configurations
const defaultGameConfigs = [
    {
        id: "snake",
        name: "Snake",
        description: "Classic snake game - eat food and grow longer",
        icon: "🐍",
        enabled: true,
        hasBoardSize: true,
        boardSize: { width: 20, height: 20 },
        minSize: { width: 10, height: 10 },
        maxSize: { width: 40, height: 40 },
    },
    {
        id: "tictactoe",
        name: "Tic Tac Toe",
        description: "Classic 3x3 X and O game",
        icon: "⭕",
        enabled: true,
        hasBoardSize: false,
        boardSize: { width: 3, height: 3 },
    },
    {
        id: "caro4",
        name: "Caro (4 in a row)",
        description: "Connect 4 pieces in a row to win",
        icon: "🔴",
        enabled: true,
        hasBoardSize: true,
        boardSize: { width: 10, height: 10 },
        minSize: { width: 6, height: 6 },
        maxSize: { width: 20, height: 20 },
    },
    {
        id: "caro5",
        name: "Caro (5 in a row)",
        description: "Connect 5 pieces in a row to win",
        icon: "⚫",
        enabled: true,
        hasBoardSize: true,
        boardSize: { width: 15, height: 15 },
        minSize: { width: 10, height: 10 },
        maxSize: { width: 30, height: 30 },
    },
    {
        id: "memory",
        name: "Memory Game",
        description: "Find matching pairs of cards",
        icon: "🃏",
        enabled: true,
        hasBoardSize: true,
        boardSize: { width: 4, height: 4 },
        minSize: { width: 2, height: 2 },
        maxSize: { width: 6, height: 6 },
        note: "Total cards must be even number",
    },
    {
        id: "paint",
        name: "Paint (Coloring)",
        description: "Creative coloring game",
        icon: "🎨",
        enabled: true,
        hasBoardSize: false,
        boardSize: null,
    },
    {
        id: "candycrush",
        name: "Candy Crush",
        description: "Match 3 or more candies",
        icon: "🍬",
        enabled: true,
        hasBoardSize: true,
        boardSize: { width: 8, height: 8 },
        minSize: { width: 5, height: 5 },
        maxSize: { width: 12, height: 12 },
    },
];

const STORAGE_KEY = "webgame_game_configs";

const GameConfigContext = createContext(null);

export function GameConfigProvider({ children }) {
    const [games, setGames] = useState(() => {
        // Load from localStorage on initial render
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse saved game configs:", e);
            }
        }
        return defaultGameConfigs;
    });

    // Save to localStorage whenever games change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
    }, [games]);

    // Toggle game enabled/disabled
    const toggleGame = (gameId) => {
        setGames(games.map(game =>
            game.id === gameId ? { ...game, enabled: !game.enabled } : game
        ));
    };

    // Update board size for a game
    const updateBoardSize = (gameId, newSize) => {
        setGames(games.map(game =>
            game.id === gameId ? { ...game, boardSize: newSize } : game
        ));
    };

    // Get a specific game config
    const getGameConfig = (gameId) => {
        return games.find(game => game.id === gameId);
    };

    // Get all enabled games
    const getEnabledGames = () => {
        return games.filter(game => game.enabled);
    };

    // Reset all configs to default
    const resetToDefault = () => {
        setGames(defaultGameConfigs);
    };

    const value = {
        games,
        setGames,
        toggleGame,
        updateBoardSize,
        getGameConfig,
        getEnabledGames,
        resetToDefault,
    };

    return (
        <GameConfigContext.Provider value={value}>
            {children}
        </GameConfigContext.Provider>
    );
}

export function useGameConfig() {
    const context = useContext(GameConfigContext);
    if (!context) {
        throw new Error("useGameConfig must be used within a GameConfigProvider");
    }
    return context;
}
