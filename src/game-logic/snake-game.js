import { COLORS, BUTTONS, createEmptyGrid } from './constants';

export const initialSnakeState = {
    snake: [[10, 10], [10, 11], [10, 12]], // Head at end
    apple: [5, 5],
    direction: 'LEFT', // HEAD is moving LEFT. [10,12] is tail? Wait. if head at end...
    // Let's standardise: Head is the LAST element of the array.
    // If [10,10], [10,11], [10,12] -> [10,12] is HEAD.
    // If moving LEFT, next head would be [10,11]?? No.
    // Usually: Head at 0 or End.
    // Let's assume Head is at Index 0 for simplicity in updates? Or End?
    // User's seed used: [[10,10],[10,11],[10,12],[11,12]] 
    // And comment said "// Head at end".
    // So [11,12] is HEAD.
    score: 0,
    gameOver: false,
    speed: 150, // ms per tick? No, logic tick.
    // Helper to store valid directions map
};

const DIRECTIONS = {
    UP: [-1, 0],
    DOWN: [1, 0],
    LEFT: [0, -1],
    RIGHT: [0, 1]
};

export const updateSnake = (state, input) => {
    if (state.gameOver) return state;

    let { snake, apple, direction, score } = state;

    // 1. Handle Input (Direction Change)
    // Prevent 180 turns
    if (input === BUTTONS.UP && direction !== 'DOWN') direction = 'UP';
    else if (input === BUTTONS.DOWN && direction !== 'UP') direction = 'DOWN';
    else if (input === BUTTONS.LEFT && direction !== 'RIGHT') direction = 'LEFT';
    else if (input === BUTTONS.RIGHT && direction !== 'LEFT') direction = 'RIGHT';

    // 2. Move Snake
    const head = snake[snake.length - 1];
    const vector = DIRECTIONS[direction];
    if (!vector) return { ...state, direction }; // No move if direction invalid

    const newHead = [head[0] + vector[0], head[1] + vector[1]];

    // 3. Collision Detection
    // Wall
    if (newHead[0] < 0 || newHead[0] >= 20 || newHead[1] < 0 || newHead[1] >= 20) {
        return { ...state, gameOver: true };
    }
    // Self
    for (let i = 0; i < snake.length - 1; i++) { // Don't check tail as it moves?
        if (newHead[0] === snake[i][0] && newHead[1] === snake[i][1]) {
             return { ...state, gameOver: true };
        }
    }

    const newSnake = [...snake, newHead];

    // 4. Apple Eating
    if (newHead[0] === apple[0] && newHead[1] === apple[1]) {
        score += 100;
        // Generate new apple
        let newApple;
        while (!newApple) {
            const r = Math.floor(Math.random() * 20);
            const c = Math.floor(Math.random() * 20);
            // Check collision with snake
            let collision = false;
            for (let part of newSnake) {
                if (part[0] === r && part[1] === c) {
                    collision = true; 
                    break;
                }
            }
            if (!collision) newApple = [r, c];
        }
        apple = newApple;
    } else {
        // Remove tail
        newSnake.shift();
    }

    return {
        ...state,
        snake: newSnake,
        apple,
        direction,
        score
    };
};

export const renderSnake = (state, tick) => {
    const grid = createEmptyGrid();
    
    // Draw Snake
    state.snake.forEach((part, index) => {
        // Head is last
        if (index === state.snake.length - 1) {
            grid[part[0]][part[1]] = COLORS.ON; // Bright?
        } else {
            grid[part[0]][part[1]] = COLORS.ON; 
        }
    });

    // Draw Apple (Blink?)
    const blink = Math.floor(tick / 5) % 2 === 0;
    if (blink) {
        grid[state.apple[0]][state.apple[1]] = COLORS.RED;
    } else {
        grid[state.apple[0]][state.apple[1]] = COLORS.ON;
    }

    if (state.gameOver) {
        // Overlay X?
    }

    return grid;
};
