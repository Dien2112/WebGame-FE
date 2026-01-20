import BaseCaroLogic from './BaseCaroLogic';

class Caro5Logic extends BaseCaroLogic {
    constructor(setMatrix, setScore, setStatus, setTimer, onExit, savedState, gameId) {
        super(15, //Board Size
            5, 
            30, // Time per turn in seconds
            '5', 'CARO5', setMatrix, setScore, setStatus, setTimer, onExit, savedState,
            gameId,
            15, // Points per win
            7   // Points per lose
        );
    }
}

export default Caro5Logic;

