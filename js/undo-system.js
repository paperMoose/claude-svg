// Undo/Redo System for SVG Editor
class UndoSystem {
    constructor(svg, maxSteps = 50) {
        this.svg = svg;
        this.undoStack = [];
        this.redoStack = [];
        this.maxUndoSteps = maxSteps;
        
        this.setupKeyboardShortcuts();
    }
    
    saveState(actionName) {
        // Save current SVG state to undo stack
        const currentState = {
            svg: this.svg.innerHTML,
            action: actionName,
            timestamp: Date.now()
        };
        
        this.undoStack.push(currentState);
        
        // Limit undo stack size
        if (this.undoStack.length > this.maxUndoSteps) {
            this.undoStack.shift();
        }
        
        // Clear redo stack when new action is performed
        this.redoStack = [];
        
        console.log(`State saved: ${actionName}`, this.undoStack.length, 'undo steps available');
    }
    
    undo() {
        if (this.undoStack.length === 0) {
            console.log('Nothing to undo');
            return false;
        }
        
        // Save current state to redo stack before undoing
        const currentState = {
            svg: this.svg.innerHTML,
            action: 'current',
            timestamp: Date.now()
        };
        this.redoStack.push(currentState);
        
        // Get previous state and restore it
        const previousState = this.undoStack.pop();
        this.svg.innerHTML = previousState.svg;
        
        console.log(`Undid: ${previousState.action}`, this.undoStack.length, 'undo steps remaining');
        return true;
    }
    
    redo() {
        if (this.redoStack.length === 0) {
            console.log('Nothing to redo');
            return false;
        }
        
        // Save current state to undo stack before redoing
        const currentState = {
            svg: this.svg.innerHTML,
            action: 'before_redo',
            timestamp: Date.now()
        };
        this.undoStack.push(currentState);
        
        // Get next state and restore it
        const nextState = this.redoStack.pop();
        this.svg.innerHTML = nextState.svg;
        
        console.log('Redid action', this.redoStack.length, 'redo steps remaining');
        return true;
    }
    
    setupKeyboardShortcuts() {
        // Keyboard shortcuts for undo/redo
        document.addEventListener('keydown', (e) => {
            // Undo: Ctrl+Z (or Cmd+Z on Mac)
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                if (this.undo()) {
                    // Trigger refresh callback if provided
                    if (this.onStateRestore) {
                        this.onStateRestore();
                    }
                }
            }
            // Redo: Ctrl+Y (or Cmd+Y on Mac, or Ctrl+Shift+Z)
            else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                if (this.redo()) {
                    // Trigger refresh callback if provided
                    if (this.onStateRestore) {
                        this.onStateRestore();
                    }
                }
            }
        });
    }
    
    // Callback for when state is restored (to rebuild interactions, etc.)
    onStateRestore = null;
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UndoSystem;
}