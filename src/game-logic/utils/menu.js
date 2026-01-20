import { COLORS, BUTTONS, createEmptyGrid } from './constants';
import { getCharGrid } from './pixel-font';

// Define Icons
const SNAKE_ICON = [
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,1,1,1,1,0,0,0,0,0,0],
    [0,1,1,0,0,1,1,0,0,0,0,0],
    [0,1,0,0,0,0,1,0,0,0,0,0],
    [0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,0,0,0,0],
    [0,0,1,1,1,1,1,0,0,0,0,0],
    [0,0,1,0,0,0,0,0,0,0,0,0],
    [0,0,1,1,1,1,1,1,1,0,1,0], // Head at end
    [0,0,0,0,0,0,0,0,0,0,0,0]
];

const CARO_ICON = [
    [1,0,0,0,1,0,0,1,1,0],
    [0,1,0,1,0,0,1,0,0,1],
    [0,0,1,0,0,0,1,0,0,1],
    [0,1,0,1,0,0,0,1,1,0],
    [1,0,0,0,1,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,0,0],
    [0,0,1,0,0,1,1,1,0,0],
    [0,1,1,1,0,1,0,1,0,0],
    [0,0,1,0,0,1,1,1,0,0]
];

const PAINT_ICON = [
    [0,0,0,1,1,1,0,0,0],
    [0,0,1,1,1,1,1,0,0],
    [0,1,1,0,1,0,1,1,0],
    [0,1,0,0,1,0,0,1,0],
    [0,1,0,0,1,0,0,1,0],
    [0,0,1,1,1,1,1,0,0],
    [0,0,0,0,1,0,0,0,0],
    [0,0,0,1,1,1,0,0,0]
];

const MEM_ICON = [
    [1,1,1,0,0,1,1,1],
    [1,0,1,0,0,1,0,1],
    [1,1,1,0,0,1,1,1],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [1,1,1,0,0,1,1,1],
    [1,1,1,0,0,1,0,1],
    [1,1,1,0,0,1,1,1]
];




const TICTACTOE_ICON = [
    [0,0,1,0,0,1,0,0], // # #
    [0,0,1,0,0,1,0,0],
    [1,1,1,1,1,1,1,1], // -------
    [0,0,1,0,0,1,0,0],
    [0,0,1,0,0,1,0,0], // X O
    [1,1,1,1,1,1,1,1], // -------
    [0,0,1,0,0,1,0,0],
    [0,0,1,0,0,1,0,0],
];

const LINE_ICON = [
    [0,0,1,0,0,1,0,0],
    [0,1,0,1,0,1,0,1],
    [1,0,1,0,1,0,1,0],
    [0,1,0,1,0,1,0,1],
    [1,0,1,0,1,0,1,0],
    [0,1,0,1,0,1,0,1],
    [0,0,1,0,0,1,0,0],
    [0,0,0,0,0,0,0,0]
];

export const MENU_ITEMS = [
  { id: 'CARO5', label: 'CARO5', icon: CARO_ICON },
  { id: 'CARO4', label: 'CARO4', icon: CARO_ICON },
  { id: 'TICTACTOE', label: 'X-O', icon: TICTACTOE_ICON },
  { id: 'SNAKE', label: 'SNAKE', icon: SNAKE_ICON },
  { id: 'LINE', label: 'LINE', icon: LINE_ICON },
  { id: 'MEM', label: 'MEM', icon: MEM_ICON },
  { id: 'PAINT', label: 'PAINT', icon: PAINT_ICON },
];

export const initialMenuState = {
  selectedIndex: 0,
};

// Generic sprite drawer
export const drawSprite = (grid, sprite, top, left, color) => {
  if (!sprite) return;
  for (let r = 0; r < sprite.length; r++) {
    for (let c = 0; c < sprite[r].length; c++) {
      if (sprite[r] && sprite[r][c] === 1) { // Added safety check for row
        const targetR = top + r;
        const targetC = left + c;
        if (targetR >= 0 && targetR < 20 && targetC >= 0 && targetC < 20) {
          grid[targetR][targetC] = color;
        }
      }
    }
  }
};

export const updateMenu = (state, input, items = MENU_ITEMS) => {
  let selectedIndex = state.selectedIndex;

  if (input === BUTTONS.RIGHT) {
    if (selectedIndex < items.length - 1) {
       selectedIndex++;
    }
  } else if (input === BUTTONS.LEFT) {
    if (selectedIndex > 0) {
        selectedIndex--;
    }
  } else if (input === BUTTONS.ENTER) {
    if (items[selectedIndex]) {
        return { ...state, selectedIndex, launch: items[selectedIndex].id || items[selectedIndex].internalId };
    }
  }

  return { ...state, selectedIndex, launch: null };
};

export const renderMenu = (state, tick, items = MENU_ITEMS) => {
  const grid = createEmptyGrid();
  
  if (!items[state.selectedIndex]) return grid;

  const item = items[state.selectedIndex];
  
  // Render Label (Game Name) at Top
  const label = item.label || item.name || '';
  const totalWidth = (label.length * 4) - 1; 
  let startX = Math.floor((20 - totalWidth) / 2);
  if (startX < 0) startX = 0; // Safety
  
  for (let i = 0; i < label.length; i++) {
    const charGrid = getCharGrid(label[i]);
    if (charGrid) drawSprite(grid, charGrid, 1, startX, COLORS.ON); // Draw text at top
    startX += 4;
  }

  // Render Icon in Center/Bottom
  const icon = item.icon;
  if (icon) {
      // Approximate centering based on icon size
      const iconW = icon[0] ? icon[0].length : 8; // assuming rectangle
      const iconX = Math.floor((20 - iconW) / 2);
      const iconY = 8; // push down
      drawSprite(grid, icon, iconY, iconX, COLORS.BLUE); // Use Blue for icon
  } else {
      // Fallback if no icon: Show something or just center text more?
      // For Pause menu, maybe just text is enough.
      // Or we can draw a default box/icon.
  }


  // Draw Flickering Arrows
  const showArrows = Math.floor(tick / 5) % 2 === 0; 

  if (showArrows) {
    // Left Arrow (only if not first)
    if (state.selectedIndex > 0) {
       drawSprite(grid, getCharGrid('<'), 9, 0, COLORS.YELLOW);
    }
    // Right Arrow (only if not last)
    if (state.selectedIndex < items.length - 1) {
       drawSprite(grid, getCharGrid('>'), 9, 17, COLORS.YELLOW);
    }
  }

  return grid;
};
