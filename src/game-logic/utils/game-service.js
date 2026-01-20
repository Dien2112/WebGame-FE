import { COLORS, createEmptyGrid } from './constants';
import { api } from '@/lib/api';

// Helper to generate a fake "snake" state
const createSnakeSnapshot = (snakePoints, applePoint) => {
    const grid = createEmptyGrid();
    snakePoints.forEach(([r, c], index) => {
        if (grid[r] && grid[r][c] !== undefined) {
            // Last point is head -> BLACK
            grid[r][c] = index === snakePoints.length - 1 ? COLORS.BLACK : COLORS.ON;
        }
    });
    if (applePoint) {
        const [r, c] = applePoint;
         if (grid[r] && grid[r][c] !== undefined) grid[r][c] = COLORS.RED;
    }
    return grid;
};


export const fetchGames = async () => {
    try {
        const games = await api.get('/api/games');
        console.log("games", games, "game data:" , games.data);
        const processedGames = (games.data || []).map(g => ({
            ...g,
            internalId: g.internal_id || g.internalId,
            saved_game: (g.saved_game || []).map(s => {
                // Determine if we need to process preview
                let preview = s.preview;
                if (g.internalId === 'SNAKE' && preview && preview.snake && preview.apple) {
                     preview = createSnakeSnapshot(preview.snake, preview.apple);
                }
                // Handle text/string previews if any (historical or other games)
                else if (typeof preview === 'string') {
                    try {
                        const parsed = JSON.parse(preview);
                        if (g.internalId === 'SNAKE' && parsed.snake && parsed.apple) {
                            preview = createSnakeSnapshot(parsed.snake, parsed.apple);
                        } else {
                            preview = parsed;
                        }
                    } catch (e) {
                         // Keep as is
                    }
                }
                
                return {
                    ...s,
                    preview
                };
            })
        }));

        // Ensure LINE is present (Temporary/Dev addition)
        if (!processedGames.find(g => g.internalId === 'LINE')) {
            processedGames.push({
                id: 999, // Temp ID
                internalId: 'LINE',
                name: 'Line',
                config: {},
                saved_game: []
            });
        }
        
        if (!processedGames.find(g => g.internalId === 'PAINT')) {
            processedGames.push({
                id: 998,
                internalId: 'PAINT',
                name: 'Paint',
                config: {},
                saved_game: []
            });
        }

        return processedGames;
    } catch (error) {
        console.error("Failed to fetch games", error);
        return [];
    }
};

export const saveGame = async (gameId, gameState) => {
    try {
        console.log(`[GameService] Saving ${gameId}...`, gameState);
        const response = await api.post(`/api/games/${gameId}/save`, {
            data: gameState
        });
        return response.data;
    } catch (error) {
        console.error("Failed to save game", error);
        throw error;
    }
};

export const submitScore = async (gameId, score) => {
    try {
        console.log(`[GameService] Submitting Score for ${gameId}: ${score}`);
        const response = await api.post(`/api/games/${gameId}/score`, {
            score: score
        });
        return response.data;
    } catch (error) {
        console.error("Failed to submit score", error);
        // Don't throw, just log, so game flow isn't interrupted?
        // Or throw to let Logic handle feedback?
        // Let's return null to indicate failure safely.
        return null;
    }
};