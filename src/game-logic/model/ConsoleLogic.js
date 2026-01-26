
class ConsoleLogic {
    /**
     * @param {function} setMatrix 
     * @param {function} setScore 
     * @param {function} setStatus
     * @param {function} onExit 
     */
    constructor(setMatrix, setScore, setStatus, onExit) {
        this.setMatrix = setMatrix;
        this.setScore = setScore;
        this.setStatus = setStatus;
        this.onExit = onExit;
    }

    /**
     * @param {string} action - 'LEFT', 'RIGHT', 'UP', 'DOWN', 'ENTER', 'BACK'
     * @param {number} tick 
     */
    onConsolePress(action, tick) {
    }

    /**
     * @param {number} r 
     * @param {number} c 
     */
    onDotClick(r, c) {
    }

    /**
     * @param {number} tick
     */
    onTick(tick) {
    }
    
    destroy() {
    }
}

export default ConsoleLogic;
