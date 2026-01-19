import BaseCaroLogic from './BaseCaroLogic';

class Caro5Logic extends BaseCaroLogic {
    constructor(setMatrix, setScore, setStatus, onExit, difficulty = 'EASY') {
        super(5, '5', 'CARO5', setMatrix, setScore, setStatus, onExit, difficulty);
    }
}

export default Caro5Logic;
