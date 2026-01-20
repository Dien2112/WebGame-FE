import ConsoleLogic from './model/ConsoleLogic';
import { initialMenuState, updateMenu, renderMenu, MENU_ITEMS } from './utils/menu';
import { BUTTONS } from './utils/constants';

class MenuLogic extends ConsoleLogic {
    constructor(setMatrix, setScore, setStatus, onExit, onHighlight, data, onStartGame = null, customItems = null) {
        super(setMatrix, setScore, setStatus, onExit);
        this.state = { ...initialMenuState };
        this.onGameSelect = onStartGame; 
        this.gamesData = data; 
        this.onHighlight = onHighlight;
        this.items = customItems || MENU_ITEMS; // Use custom items or default
        
        // Initial Highlight
        this.handleHighlight();
    }

    onConsolePress(action, tick) {
        if (action === BUTTONS.ENTER) {
            // Check for launch
            const nextState = updateMenu(this.state, action, this.items);
            if (nextState.launch) {
                // Game Selected
                const launchId = nextState.launch;
                this.handleGameLaunch(launchId);
            } else {
                this.state = nextState;
            }
        } else {
            const prevState = this.state;
            this.state = updateMenu(this.state, action, this.items);
            if (this.state.selectedIndex !== prevState.selectedIndex) {
                this.handleHighlight();
            }
        }
    }

    handleHighlight() {
        if (!this.onHighlight) return;
        const item = this.items[this.state.selectedIndex];
        if (item) {
             // Try to find matching game data by ID or InternalID
             const id = item.id || item.internalId;
             const game = this.gamesData ? this.gamesData.find(g => g.internalId === id) : null;
             const finalGame = game || item; // Fallback to item itself if no game data found (e.g. Pause Menu)
             this.onHighlight(finalGame);
        }
    }

    handleGameLaunch(launchId) {
        // ... (same as before)
        
        // Use the callback provided in constructor
        if (this.onGameSelect) {
            this.onGameSelect(launchId);
        }
    }

    onTick(tick) {
        const grid = renderMenu(this.state, tick, this.items);
        this.setMatrix(grid);
        
        const item = this.items[this.state.selectedIndex];
        if (item) {
            // Show label and index
            const label = item.label || item.name || '';
            this.setStatus(`${label} (${this.state.selectedIndex + 1}/${this.items.length})`);
        }
    }
}

export default MenuLogic;
