import ConsoleLogic from './ConsoleLogic';

class GameLogic extends ConsoleLogic {
    constructor(setMatrix, setScore, setStatus, onExit) {
        super(setMatrix, setScore, setStatus, onExit);
    }

    /**
     * @param {object} saveData
     * @param {number} tick 
     * @returns {Array<Array<number>>} 
     */
    preview(saveData, tick) {
        return null; 
    }

    calculateScore(time, currentScore) {
        return currentScore;
    }

    /**
     * @returns {object} 
     */
    getSaveData() {
        return null;
    }
}

export default GameLogic;
