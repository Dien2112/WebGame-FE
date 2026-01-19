import BaseCaroLogic from './BaseCaroLogic';

class Caro5Logic extends BaseCaroLogic {
    constructor(setMatrix, setScore, setStatus, onExit) {
        super(15, //Board Size
            5, 
            30, // Time per turn in seconds
            '5', 'CARO5', setMatrix, setScore, setStatus, onExit);
    }
}

export default Caro5Logic;
