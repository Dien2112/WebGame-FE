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
        this.items = customItems || MENU_ITEMS;
        
        this.handleHighlight();
    }

    onConsolePress(action, tick) {
        if (action === BUTTONS.ENTER) {
            const nextState = updateMenu(this.state, action, this.items);
            if (nextState.launch) {
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
             const id = item.id || item.internalId;
             const game = this.gamesData ? this.gamesData.find(g => g.internalId === id) : null;
             const finalGame = game || item; 
             this.onHighlight(finalGame);
        }
    }

    handleGameLaunch(launchId) {
        if (this.onGameSelect) {
            this.onGameSelect(launchId);
        }
    }

    onTick(tick) {
        const grid = renderMenu(this.state, tick, this.items);
        this.setMatrix(grid);
        
        const item = this.items[this.state.selectedIndex];
        if (item) {
            const label = item.label || item.name || '';
            this.setStatus(`${label} (${this.state.selectedIndex + 1}/${this.items.length})`);
        }
    }
}

export default MenuLogic;
