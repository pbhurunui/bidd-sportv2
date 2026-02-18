/**
 * UndoRedoManager - Comprehensive Undo/Redo System for BIDD-Sport
 * Tracks all data changes and allows users to undo/redo modifications
 */

class UndoRedoManager {
    constructor() {
        this.undoStack = [];
        this.redoStack = [];
        this.maxHistorySize = 50; // Keep last 50 actions
        this.isExecuting = false; // Prevent recursive undo/redo
    }

    /**
     * Create a snapshot of current state for undo/redo
     */
    createSnapshot(description, dataObject) {
        if (this.isExecuting) return; // Prevent recording during undo/redo
        
        const snapshot = {
            description,
            timestamp: new Date().toLocaleTimeString(),
            data: JSON.parse(JSON.stringify(dataObject))
        };
        
        this.undoStack.push(snapshot);
        this.redoStack = []; // Clear redo stack when new action is performed
        
        // Limit history size
        if (this.undoStack.length > this.maxHistorySize) {
            this.undoStack.shift();
        }
        
        this.updateUI();
    }

    /**
     * Undo last action
     */
    undo() {
        if (this.undoStack.length === 0) {
            alert('Nothing to undo');
            return false;
        }

        this.isExecuting = true;
        
        // Get current state
        const currentSnapshot = this.getCurrentSnapshot();
        
        // Get previous state
        const previousSnapshot = this.undoStack.pop();
        
        // Save current to redo stack
        if (currentSnapshot) {
            this.redoStack.push(currentSnapshot);
        }
        
        // Restore previous state
        this.restoreSnapshot(previousSnapshot);
        
        this.isExecuting = false;
        this.updateUI();
        return true;
    }

    /**
     * Redo last undone action
     */
    redo() {
        if (this.redoStack.length === 0) {
            alert('Nothing to redo');
            return false;
        }

        this.isExecuting = true;
        
        // Get current state
        const currentSnapshot = this.getCurrentSnapshot();
        
        // Get next state
        const nextSnapshot = this.redoStack.pop();
        
        // Save current to undo stack
        if (currentSnapshot) {
            this.undoStack.push(currentSnapshot);
        }
        
        // Restore next state
        this.restoreSnapshot(nextSnapshot);
        
        this.isExecuting = false;
        this.updateUI();
        return true;
    }

    /**
     * Get current state snapshot
     */
    getCurrentSnapshot() {
        return {
            description: 'Current State',
            timestamp: new Date().toLocaleTimeString(),
            data: {
                tournaments,
                events,
                competitors,
                heats,
                houses,
                results,
                ageCategories,
                yearGroups,
                eventTypes,
                records,
                roundRobinTournaments,
                roundRobinMatches,
                roundRobinStandings,
                roundRobinSignups
            }
        };
    }

    /**
     * Restore state from snapshot
     */
    restoreSnapshot(snapshot) {
        try {
            // Restore all global data
            tournaments = JSON.parse(JSON.stringify(snapshot.data.tournaments));
            events = JSON.parse(JSON.stringify(snapshot.data.events));
            competitors = JSON.parse(JSON.stringify(snapshot.data.competitors));
            heats = JSON.parse(JSON.stringify(snapshot.data.heats));
            houses = JSON.parse(JSON.stringify(snapshot.data.houses));
            results = JSON.parse(JSON.stringify(snapshot.data.results));
            ageCategories = JSON.parse(JSON.stringify(snapshot.data.ageCategories));
            yearGroups = JSON.parse(JSON.stringify(snapshot.data.yearGroups));
            eventTypes = JSON.parse(JSON.stringify(snapshot.data.eventTypes));
            records = JSON.parse(JSON.stringify(snapshot.data.records));
            roundRobinTournaments = JSON.parse(JSON.stringify(snapshot.data.roundRobinTournaments));
            roundRobinMatches = JSON.parse(JSON.stringify(snapshot.data.roundRobinMatches));
            roundRobinStandings = JSON.parse(JSON.stringify(snapshot.data.roundRobinStandings));
            roundRobinSignups = JSON.parse(JSON.stringify(snapshot.data.roundRobinSignups));

            // Save to localStorage
            saveData();

            // Refresh UI
            location.reload();
            
        } catch (error) {
            console.error('Error restoring snapshot:', error);
            alert('Error restoring state: ' + error.message);
        }
    }

    /**
     * Update UI buttons (enable/disable based on stack state)
     */
    updateUI() {
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');
        const historyPanel = document.getElementById('historyPanel');

        if (undoBtn) {
            undoBtn.disabled = this.undoStack.length === 0;
            undoBtn.title = this.undoStack.length > 0 
                ? `Undo: ${this.undoStack[this.undoStack.length - 1].description}` 
                : 'Nothing to undo';
        }

        if (redoBtn) {
            redoBtn.disabled = this.redoStack.length === 0;
            redoBtn.title = this.redoStack.length > 0 
                ? `Redo: ${this.redoStack[this.redoStack.length - 1].description}` 
                : 'Nothing to redo';
        }

        if (historyPanel) {
            this.updateHistoryPanel();
        }
    }

    /**
     * Update history panel display
     */
    updateHistoryPanel() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;

        let html = '<div class="space-y-2">';
        
        // Show redo stack (in reverse order)
        if (this.redoStack.length > 0) {
            html += '<div class="font-semibold text-green-600 text-sm">Available to Redo:</div>';
            for (let i = this.redoStack.length - 1; i >= 0; i--) {
                html += `<div class="text-xs text-gray-600 pl-2">• ${this.redoStack[i].description} (${this.redoStack[i].timestamp})</div>`;
            }
        }

        // Show undo stack
        if (this.undoStack.length > 0) {
            html += '<div class="font-semibold text-blue-600 text-sm mt-2">Undo History:</div>';
            for (let i = this.undoStack.length - 1; i >= Math.max(0, this.undoStack.length - 10); i--) {
                const isLast = i === this.undoStack.length - 1;
                html += `<div class="text-xs ${isLast ? 'text-blue-600 font-semibold' : 'text-gray-600'} pl-2">
                    ${isLast ? '→ ' : '• '} ${this.undoStack[i].description} (${this.undoStack[i].timestamp})
                </div>`;
            }
        }

        html += '</div>';
        historyList.innerHTML = html;
    }

    /**
     * Clear all history
     */
    clearHistory() {
        if (confirm('Are you sure you want to clear all undo/redo history?')) {
            this.undoStack = [];
            this.redoStack = [];
            this.updateUI();
        }
    }

    /**
     * Get status information
     */
    getStatus() {
        return {
            undoCount: this.undoStack.length,
            redoCount: this.redoStack.length,
            lastUndoDescription: this.undoStack.length > 0 ? this.undoStack[this.undoStack.length - 1].description : null,
            lastRedoDescription: this.redoStack.length > 0 ? this.redoStack[this.redoStack.length - 1].description : null
        };
    }
}

// Create global instance
const undoRedoManager = new UndoRedoManager();
