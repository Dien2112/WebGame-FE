import BaseCaroLogic from './BaseCaroLogic';

class Caro4Logic extends BaseCaroLogic {
    constructor(setMatrix, setScore, setStatus, onExit) {
        super(10, //Board Size
            4, // Win Length
            30, // Time per turn in seconds
            '4', 'CARO4', setMatrix, setScore, setStatus, onExit);
    }
}

export default Caro4Logic;
