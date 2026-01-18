import BaseCaroLogic from './BaseCaroLogic';

class Caro5Logic extends BaseCaroLogic {
    constructor(setMatrix, setScore, setStatus, onExit) {
        super(5, '5', 'CARO5', setMatrix, setScore, setStatus, onExit);
    }
}

export default Caro5Logic;
