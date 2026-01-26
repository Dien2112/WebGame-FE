import ConsoleLogic from "./model/ConsoleLogic";
import { createEmptyGrid, BUTTONS, COLORS } from "./utils/constants";
import { getCharGrid } from "./utils/pixel-font";
import { drawSprite } from "./utils/menu";

class PauseLogic extends ConsoleLogic {
  constructor(setMatrix, setScore, setStatus, onResume, onSave, onExit) {
    super(setMatrix, setScore, setStatus, () => onResume());
    this.onResume = onResume;
    this.onSave = onSave;
    this.onExit = onExit;

    this.selectedIndex = 0;
    this.items = [
      { label: "CON.", action: "RESUME" },
      { label: "SAVE", action: "SAVE" },
    ];
  }

  onConsolePress(action, tick) {
    if (action === BUTTONS.UP || action === BUTTONS.DOWN) {
      this.selectedIndex = this.selectedIndex === 0 ? 1 : 0;
    } else if (action === BUTTONS.ENTER) {
      const item = this.items[this.selectedIndex];
      if (item.action === "RESUME") {
        this.onResume();
      } else if (item.action === "SAVE") {
        this.onSave();
      }
    } else if (action === BUTTONS.PAUSE) {
      this.onResume();
    } else if (action === BUTTONS.BACK) {
      this.onResume();
    }
  }

  onTick(tick) {
    const grid = createEmptyGrid();

    this.drawText(grid, "PAUSE", 1, 0, COLORS.YELLOW);

    const arrowRow = this.selectedIndex === 0 ? 6 : 11;
    drawSprite(grid, getCharGrid(">"), arrowRow, 0, COLORS.YELLOW);

    this.drawText(
      grid,
      "CON.",
      6,
      5,
      this.selectedIndex === 0 ? COLORS.RED : COLORS.YELLOW,
    );
    this.drawText(
      grid,
      "SAVE",
      11,
      5,
      this.selectedIndex === 1 ? COLORS.RED : COLORS.YELLOW,
    );

    this.setMatrix(grid);
    this.setStatus(
      this.selectedIndex === 0 ? "Resume Game" : "Save Game State",
    );
  }

  drawText(grid, text, row, startCol, color) {
    let col = startCol;
    if (startCol === 0) {
      const width = text.length * 4 - 1;
      col = Math.floor((20 - width) / 2);
    }

    for (let i = 0; i < text.length; i++) {
      const charGrid = getCharGrid(text[i]);
      if (charGrid) drawSprite(grid, charGrid, row, col, color);
      col += 4;
    }
  }
}

export default PauseLogic;
