export const GRID_SIZE = 20;

export const COLORS = {
  OFF: '#CBD5E1', // Slate-300 - Darker for better visibility against white
  ON: '#EF4444',  // Red for active dots (matches image heart/text)
  RED: '#EF4444', // Red (Apple)
  GREEN: '#22C55E', // Green
  YELLOW: '#EAB308', // Yellow
  WHITE: '#F8FAFC', // White
  BLUE: '#3B82F6', // Blue
  PURPLE: '#8B5CF6', // Purple
  BLACK: '#000000' // Black (Snake Head)
};

export const BUTTONS = {
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  UP: 'UP',
  DOWN: 'DOWN',
  ENTER: 'ENTER',
  BACK: 'BACK',
  HELP: 'HELP'
};

export const createEmptyGrid = () => {
  return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(COLORS.OFF));
};
