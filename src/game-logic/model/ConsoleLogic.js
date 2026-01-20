
/**
 * Base abstract class for all Retro Console apps (games, menus, etc.).
 */
class ConsoleLogic {
    /**
     * @param {function} setMatrix - Function to update the DotMatrix grid state
     * @param {function} setScore - Function to update the score display
     * @param {function} setStatus - Function to update the status message
     * @param {function} onExit - Function to call when exiting the logic (e.g. back to previous)
     */
    constructor(setMatrix, setScore, setStatus, onExit) {
        this.setMatrix = setMatrix;
        this.setScore = setScore;
        this.setStatus = setStatus;
        this.onExit = onExit;
    }

    /**
     * Called when a console button is pressed.
     * @param {string} action - 'LEFT', 'RIGHT', 'UP', 'DOWN', 'ENTER', 'BACK'
     * @param {number} tick - Current game tick count
     */
    onConsolePress(action, tick) {
        // To be implemented by subclasses
    }

    /**
     * Called when a dot on the matrix is clicked.
     * @param {number} r - Row index (0-based)
     * @param {number} c - Column index (0-based)
     */
    onDotClick(r, c) {
        // To be implemented by subclasses
        console.log(`Dot clicked at ${r}, ${c}`);
    }

    /**
     * Called on every timer tick (e.g. 100ms).
     * Used for animations, game loops, blinking cursors, etc.
     * @param {number} tick - Current global tick count
     */
    onTick(tick) {
        // To be implemented by subclasses
    }
    
    /**
     * Cleanup resources when this logic is replaced.
     */
    destroy() {
        // Cleanup if necessary
    }
}

export default ConsoleLogic;
