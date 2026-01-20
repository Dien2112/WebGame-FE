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