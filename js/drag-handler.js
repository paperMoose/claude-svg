// Drag Handling System for SVG Editor
class DragHandler {
    constructor(svg, undoSystem) {
        this.svg = svg;
        this.undoSystem = undoSystem;
        
        // Drag state
        this.isDragging = false;
        this.selectedElement = null;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.elementStartX = 0;
        this.elementStartY = 0;
        this.lineStartX2 = 0;
        this.lineStartY2 = 0;
        this.lastDragTime = 0;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.svg.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }
    
    handleMouseDown(e) {
        if (!this.selectedElement) return;
        
        // Save state before dragging for undo functionality
        this.undoSystem.saveState('before_drag');
        
        this.isDragging = true;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        
        // Store original position based on element type
        this.storeOriginalPosition();
        
        this.selectedElement.classList.add('dragging');
        e.preventDefault();
    }
    
    storeOriginalPosition() {
        if (this.selectedElement.tagName === 'rect') {
            this.elementStartX = parseFloat(this.selectedElement.getAttribute('x') || 0);
            this.elementStartY = parseFloat(this.selectedElement.getAttribute('y') || 0);
        } else if (this.selectedElement.tagName === 'circle') {
            this.elementStartX = parseFloat(this.selectedElement.getAttribute('cx') || 0);
            this.elementStartY = parseFloat(this.selectedElement.getAttribute('cy') || 0);
        } else if (this.selectedElement.tagName === 'text') {
            this.elementStartX = parseFloat(this.selectedElement.getAttribute('x') || 0);
            this.elementStartY = parseFloat(this.selectedElement.getAttribute('y') || 0);
        } else if (this.selectedElement.tagName === 'path') {
            // For path elements (diamonds), store the original path and center
            const bounds = SVGUtils.getElementBounds(this.selectedElement);
            if (bounds) {
                this.elementStartX = bounds.centerX;
                this.elementStartY = bounds.centerY;
                // Store original path data
                this.selectedElement.setAttribute('data-original-path', this.selectedElement.getAttribute('d'));
            }
        } else if (this.selectedElement.tagName === 'line') {
            this.elementStartX = parseFloat(this.selectedElement.getAttribute('x1') || 0);
            this.elementStartY = parseFloat(this.selectedElement.getAttribute('y1') || 0);
            this.lineStartX2 = parseFloat(this.selectedElement.getAttribute('x2') || 0);
            this.lineStartY2 = parseFloat(this.selectedElement.getAttribute('y2') || 0);
        }
    }
    
    handleMouseMove(e) {
        if (!this.isDragging || !this.selectedElement) return;
        
        const deltaX = e.clientX - this.dragStartX;
        const deltaY = e.clientY - this.dragStartY;
        
        // Update element position based on type
        this.updateElementPosition(deltaX, deltaY);
        
        // Update selection box if it exists
        if (window.updateSelectionBox) {
            window.updateSelectionBox();
        }
        
        // Trigger change callback
        if (window.updateIfChanged) {
            window.updateIfChanged();
        }
    }
    
    updateElementPosition(deltaX, deltaY) {
        if (this.selectedElement.tagName === 'rect') {
            this.selectedElement.setAttribute('x', this.elementStartX + deltaX);
            this.selectedElement.setAttribute('y', this.elementStartY + deltaY);
        } else if (this.selectedElement.tagName === 'circle') {
            this.selectedElement.setAttribute('cx', this.elementStartX + deltaX);
            this.selectedElement.setAttribute('cy', this.elementStartY + deltaY);
        } else if (this.selectedElement.tagName === 'text') {
            this.selectedElement.setAttribute('x', this.elementStartX + deltaX);
            this.selectedElement.setAttribute('y', this.elementStartY + deltaY);
        } else if (this.selectedElement.tagName === 'path') {
            // Handle diamond/path shapes by translating
            SVGUtils.updatePathPosition(this.selectedElement, deltaX, deltaY);
        } else if (this.selectedElement.tagName === 'line') {
            this.selectedElement.setAttribute('x1', this.elementStartX + deltaX);
            this.selectedElement.setAttribute('y1', this.elementStartY + deltaY);
            this.selectedElement.setAttribute('x2', this.lineStartX2 + deltaX);
            this.selectedElement.setAttribute('y2', this.lineStartY2 + deltaY);
        }
        
        // Future: Update connected lines
        // this.updateConnectedLines(this.selectedElement, deltaX, deltaY);
    }
    
    handleMouseUp() {
        if (this.isDragging) {
            this.lastDragTime = Date.now();
        }
        
        this.isDragging = false;
        
        if (this.selectedElement) {
            this.selectedElement.classList.remove('dragging');
        }
    }
    
    setSelectedElement(element) {
        this.selectedElement = element;
    }
    
    getSelectedElement() {
        return this.selectedElement;
    }
    
    isCurrentlyDragging() {
        return this.isDragging;
    }
    
    getLastDragTime() {
        return this.lastDragTime;
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DragHandler;
}