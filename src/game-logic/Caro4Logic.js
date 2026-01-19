import BaseCaroLogic from './BaseCaroLogic';

class Caro4Logic extends BaseCaroLogic {
    constructor(setMatrix, setScore, setStatus, onExit) {
        super(4, '4', 'CARO4', setMatrix, setScore, setStatus, onExit);
    }
}

export default Caro4Logic;
