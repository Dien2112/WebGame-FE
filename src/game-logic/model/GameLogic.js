import ConsoleLogic from './ConsoleLogic';

/**
 * Abstract class for playable games.
 * Extends ConsoleLogic to add preview capabilities.
 */
class GameLogic extends ConsoleLogic {
    constructor(setMatrix, setScore, setStatus, onExit) {
        super(setMatrix, setScore, setStatus, onExit);
    }

    /**
     * Generates a preview grid for the scenario selection screen.
     * This method should return a 20x20 grid representing the game state.
     * @param {object} saveData - Saved game data (if any)
     * @param {number} tick - Current tick for animations
     * @returns {Array<Array<number>>} 20x20 grid
     */
    preview(saveData, tick) {
        // To be implemented by subclasses
        // Default: return empty grid or generic icon?
        return null; 
    }
    /**
     * Calculate score based on game rules
     */
    calculateScore(time, currentScore) {
        // Base implementation
        return currentScore;
    }

    /**
     * Get current game state for saving
     * @returns {object} Serializable game state
     */
    getSaveData() {
        return null;
    }
}

export default GameLogic;
