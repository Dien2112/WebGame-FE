import ConsoleLogic from './model/ConsoleLogic';
import { initialMenuState, updateMenu, renderMenu, MENU_ITEMS } from './utils/menu';
import { BUTTONS } from './utils/constants';

class MenuLogic extends ConsoleLogic {
    constructor(setMatrix, setScore, setStatus, onExit, onHighlight, data, onStartGame = null) {
        super(setMatrix, setScore, setStatus, onExit);
        this.state = { ...initialMenuState };
        this.onGameSelect = onStartGame; // Changed from onGameSelect to onStartGame
        this.gamesData = data; // Changed from gamesData to data
        this.onHighlight = onHighlight;
        
        // Initial Highlight
        this.handleHighlight();
    }

    onConsolePress(action, tick) {
        if (action === BUTTONS.ENTER) {
            // Check for launch
            const nextState = updateMenu(this.state, action);
            if (nextState.launch) {
                // Game Selected
                const launchId = nextState.launch;
                this.handleGameLaunch(launchId);
            } else {
                this.state = nextState;
            }
        } else {
            const prevState = this.state;
            this.state = updateMenu(this.state, action);
            if (this.state.selectedIndex !== prevState.selectedIndex) {
                this.handleHighlight();
            }
        }
    }

    handleHighlight() {
        if (!this.onHighlight) return;
        const item = MENU_ITEMS[this.state.selectedIndex];
        if (item) {
             const game = this.gamesData.find(g => g.internalId === item.id);
             const finalGame = game || this.gamesData[this.state.selectedIndex]; // Fallback
             this.onHighlight(finalGame);
        }
    }

    handleGameLaunch(launchId) {
        // This is where we might transition to a Scenario Select or directly start logic
        // For now, standard behavior was to go to SCENARIO_SELECT in RetroConsole
        // But the user wants standardization.
        // Let's assume for now MenuLogic handles the "Selection" and notifies the parent
        // or effectively "switches" the logic. 
        
        // Use the callback provided in constructor
        if (this.onGameSelect) {
            this.onGameSelect(launchId);
        }
    }

    onTick(tick) {
        const grid = renderMenu(this.state, tick);
        this.setMatrix(grid);
        
        const item = MENU_ITEMS[this.state.selectedIndex];
        if (item) {
            this.setStatus(`${item.label} (${this.state.selectedIndex + 1}/${MENU_ITEMS.length})`);
        }
    }
}

export default MenuLogic;
