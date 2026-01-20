import BaseCaroLogic from './BaseCaroLogic';

class Caro4Logic extends BaseCaroLogic {
    constructor(setMatrix, setScore, setStatus, setTimer, onExit, savedState, gameId) {
        super(10, //Board Size
            4, // Win Length
            30, // Time per turn in seconds
            '4', 'CARO4', setMatrix, setScore, setStatus, setTimer, onExit, savedState,
            gameId,
            10, // Points per win
            5   // Points per lose
        );
    }
}

export default Caro4Logic;

