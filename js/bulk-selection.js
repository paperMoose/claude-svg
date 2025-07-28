// Bulk Selection System for SVG Editor
class BulkSelection {
    constructor(svg, dragHandler, undoSystem) {
        this.svg = svg;
        this.dragHandler = dragHandler;
        this.undoSystem = undoSystem;
        
        // Selection state
        this.isSelecting = false;
        this.selectedElements = new Set();
        this.selectionRect = null;
        this.selectionStartX = 0;
        this.selectionStartY = 0;
        
        // Dragging multiple elements
        this.isDraggingMultiple = false;
        this.dragStartPositions = new Map();
        
        // Group selection box
        this.groupSelectionBox = null;
        
        this.setupEventListeners();
        this.createSelectionRectangle();
    }
    
    createSelectionRectangle() {
        // Create the selection rectangle element
        this.selectionRect = document.createElement('div');
        this.selectionRect.className = 'bulk-selection-rect';
        this.selectionRect.style.cssText = `
            position: fixed;
            border: 1px dashed #6366f1;
            background: rgba(99, 102, 241, 0.1);
            pointer-events: none;
            display: none;
            z-index: 999;
        `;
        document.body.appendChild(this.selectionRect);
    }
    
    setupEventListeners() {
        // We'll hook into existing mouse events
        this.svg.addEventListener('mousedown', this.handleMouseDown.bind(this), true);
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        
        // Keyboard shortcuts for selection
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }
    
    handleMouseDown(e) {
        // Only start selection rectangle on empty canvas with select tool active
        if (e.target === this.svg && document.querySelector('.tool-btn[data-tool="select"]').classList.contains('active')) {
            // Check if we're clicking on empty space (not on any element)
            const rect = this.svg.getBoundingClientRect();
            this.selectionStartX = e.clientX;
            this.selectionStartY = e.clientY;
            
            this.isSelecting = true;
            this.selectionRect.style.display = 'block';
            this.selectionRect.style.left = this.selectionStartX + 'px';
            this.selectionRect.style.top = this.selectionStartY + 'px';
            this.selectionRect.style.width = '0px';
            this.selectionRect.style.height = '0px';
            
            e.preventDefault();
            e.stopPropagation();
        }
        // Don't handle clicking on selected elements here - let group selection box handle it
    }
    
    handleMouseMove(e) {
        if (this.isSelecting) {
            // Update selection rectangle
            const currentX = e.clientX;
            const currentY = e.clientY;
            
            const left = Math.min(this.selectionStartX, currentX);
            const top = Math.min(this.selectionStartY, currentY);
            const width = Math.abs(currentX - this.selectionStartX);
            const height = Math.abs(currentY - this.selectionStartY);
            
            this.selectionRect.style.left = left + 'px';
            this.selectionRect.style.top = top + 'px';
            this.selectionRect.style.width = width + 'px';
            this.selectionRect.style.height = height + 'px';
            
            // Check which elements are inside the selection rectangle
            this.updateSelection();
        }
        else if (this.isDraggingMultiple) {
            this.handleMultiDrag(e);
        }
    }
    
    handleMouseUp(e) {
        if (this.isSelecting) {
            this.isSelecting = false;
            this.selectionRect.style.display = 'none';
            
            // Final selection update
            this.updateSelection();
            
            // If we have selected elements, create a group selection box
            if (this.selectedElements.size > 0) {
                // Clear the single selection
                if (window.deselectElement) {
                    window.deselectElement();
                }
                
                // Create or update the group selection box
                this.showGroupSelectionBox();
            }
        }
        else if (this.isDraggingMultiple) {
            this.isDraggingMultiple = false;
            this.dragStartPositions.clear();
        }
    }
    
    updateSelection() {
        // Get selection rectangle bounds
        const selRect = this.selectionRect.getBoundingClientRect();
        const svgRect = this.svg.getBoundingClientRect();
        
        // Clear previous multi-selection styling
        this.clearMultiSelection();
        
        // Get SVG viewBox for coordinate transformation
        const viewBox = this.svg.viewBox.baseVal;
        const scaleX = svgRect.width / viewBox.width;
        const scaleY = svgRect.height / viewBox.height;
        
        // Check each element in the SVG
        const elements = this.svg.querySelectorAll('rect, circle, text, path, line, polygon, polyline, g');
        elements.forEach(element => {
            // Skip background elements
            if (element.getAttribute('data-background') === 'true') {
                return;
            }
            
            try {
                // Get element bounds in SVG coordinates
                const bbox = element.getBBox();
                
                // Convert to viewport coordinates
                const elementRect = {
                    left: svgRect.left + (bbox.x * scaleX),
                    top: svgRect.top + (bbox.y * scaleY),
                    right: svgRect.left + ((bbox.x + bbox.width) * scaleX),
                    bottom: svgRect.top + ((bbox.y + bbox.height) * scaleY)
                };
                
                // Check if element is inside selection rectangle
                if (this.isIntersecting(selRect, elementRect)) {
                    console.log('Element selected:', element.tagName, element);
                    this.selectedElements.add(element);
                    element.classList.add('bulk-selected');
                }
            } catch (e) {
                console.warn('Error getting bounds for element:', e);
            }
        });
        
        // Update visual feedback
        this.updateVisualFeedback();
    }
    
    isIntersecting(rect1, rect2) {
        return !(rect1.right < rect2.left || 
                rect1.left > rect2.right || 
                rect1.bottom < rect2.top || 
                rect1.top > rect2.bottom);
    }
    
    clearMultiSelection() {
        this.selectedElements.forEach(element => {
            element.classList.remove('bulk-selected');
        });
        this.selectedElements.clear();
        
        // Destroy group selection box if it exists
        if (this.groupSelectionBox) {
            this.groupSelectionBox.destroy();
            this.groupSelectionBox = null;
        }
    }
    
    updateVisualFeedback() {
        // Add visual styling to selected elements
        this.selectedElements.forEach(element => {
            element.classList.add('bulk-selected');
        });
    }
    
    startMultiDrag(e) {
        if (this.selectedElements.size <= 1) return;
        
        // Save state before dragging
        this.undoSystem.saveState('before_bulk_drag');
        
        this.isDraggingMultiple = true;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        
        // Store initial positions of all selected elements
        this.selectedElements.forEach(element => {
            const pos = this.getElementPosition(element);
            this.dragStartPositions.set(element, pos);
        });
        
        e.preventDefault();
        e.stopPropagation();
    }
    
    handleMultiDrag(e) {
        const deltaX = e.clientX - this.dragStartX;
        const deltaY = e.clientY - this.dragStartY;
        
        // Move all selected elements
        this.selectedElements.forEach(element => {
            const startPos = this.dragStartPositions.get(element);
            if (!startPos) return;
            
            this.updateElementPosition(element, startPos, deltaX, deltaY);
        });
        
        // Trigger change callback
        if (window.updateIfChanged) {
            window.updateIfChanged();
        }
    }
    
    getElementPosition(element) {
        if (element.tagName === 'rect') {
            return {
                x: parseFloat(element.getAttribute('x') || 0),
                y: parseFloat(element.getAttribute('y') || 0)
            };
        } else if (element.tagName === 'circle') {
            return {
                cx: parseFloat(element.getAttribute('cx') || 0),
                cy: parseFloat(element.getAttribute('cy') || 0)
            };
        } else if (element.tagName === 'text') {
            return {
                x: parseFloat(element.getAttribute('x') || 0),
                y: parseFloat(element.getAttribute('y') || 0)
            };
        } else if (element.tagName === 'path') {
            // Store original path data
            element.setAttribute('data-original-path', element.getAttribute('d'));
            const bounds = SVGUtils.getElementBounds(element);
            return bounds ? { centerX: bounds.centerX, centerY: bounds.centerY } : { centerX: 0, centerY: 0 };
        } else if (element.tagName === 'line') {
            return {
                x1: parseFloat(element.getAttribute('x1') || 0),
                y1: parseFloat(element.getAttribute('y1') || 0),
                x2: parseFloat(element.getAttribute('x2') || 0),
                y2: parseFloat(element.getAttribute('y2') || 0)
            };
        } else if (element.tagName === 'g') {
            // Handle groups
            const transform = element.getAttribute('transform') || '';
            const match = transform.match(/translate\(([^,]+),([^)]+)\)/);
            return {
                x: match ? parseFloat(match[1]) : 0,
                y: match ? parseFloat(match[2]) : 0
            };
        }
        return { x: 0, y: 0 };
    }
    
    updateElementPosition(element, startPos, deltaX, deltaY) {
        if (element.tagName === 'rect') {
            element.setAttribute('x', startPos.x + deltaX);
            element.setAttribute('y', startPos.y + deltaY);
        } else if (element.tagName === 'circle') {
            element.setAttribute('cx', startPos.cx + deltaX);
            element.setAttribute('cy', startPos.cy + deltaY);
        } else if (element.tagName === 'text') {
            element.setAttribute('x', startPos.x + deltaX);
            element.setAttribute('y', startPos.y + deltaY);
        } else if (element.tagName === 'path') {
            // Use SVGUtils for path updates
            SVGUtils.updatePathPosition(element, deltaX, deltaY);
        } else if (element.tagName === 'line') {
            element.setAttribute('x1', startPos.x1 + deltaX);
            element.setAttribute('y1', startPos.y1 + deltaY);
            element.setAttribute('x2', startPos.x2 + deltaX);
            element.setAttribute('y2', startPos.y2 + deltaY);
        } else if (element.tagName === 'g') {
            element.setAttribute('transform', `translate(${startPos.x + deltaX}, ${startPos.y + deltaY})`);
        }
    }
    
    handleKeyDown(e) {
        // Ctrl/Cmd + A to select all
        if ((e.ctrlKey || e.metaKey) && e.key === 'a' && document.querySelector('.tool-btn[data-tool="select"]').classList.contains('active')) {
            e.preventDefault();
            this.selectAll();
        }
        // Escape to clear selection
        else if (e.key === 'Escape') {
            this.clearMultiSelection();
            if (window.deselectElement) {
                window.deselectElement();
            }
        }
        // Delete selected elements
        else if ((e.key === 'Delete' || e.key === 'Backspace') && this.selectedElements.size > 0) {
            e.preventDefault();
            this.deleteSelected();
        }
    }
    
    selectAll() {
        // Clear existing selection
        this.clearMultiSelection();
        if (window.deselectElement) {
            window.deselectElement();
        }
        
        // Select all elements except backgrounds
        const elements = this.svg.querySelectorAll('rect, circle, text, path, line, polygon, polyline, g');
        elements.forEach(element => {
            // Skip background elements
            if (element.getAttribute('data-background') === 'true') {
                return;
            }
            this.selectedElements.add(element);
            element.classList.add('bulk-selected');
        });
        
        this.updateVisualFeedback();
    }
    
    deleteSelected() {
        if (this.selectedElements.size === 0) return;
        
        // Save state before deletion
        this.undoSystem.saveState('before_bulk_delete');
        
        // Delete all selected elements
        this.selectedElements.forEach(element => {
            element.remove();
        });
        
        // Clear selection
        this.clearMultiSelection();
        
        // Trigger change callback
        if (window.updateIfChanged) {
            window.updateIfChanged();
        }
    }
    
    // Check if an element is selected
    isSelected(element) {
        return this.selectedElements.has(element);
    }
    
    // Get the number of selected elements
    getSelectionCount() {
        return this.selectedElements.size;
    }
    
    // Add element to selection
    addToSelection(element) {
        this.selectedElements.add(element);
        element.classList.add('bulk-selected');
        this.updateVisualFeedback();
    }
    
    // Remove element from selection
    removeFromSelection(element) {
        this.selectedElements.delete(element);
        element.classList.remove('bulk-selected');
        this.updateVisualFeedback();
    }
    
    // Show group selection box for selected elements
    showGroupSelectionBox() {
        console.log('showGroupSelectionBox called with', this.selectedElements.size, 'elements');
        
        // Destroy existing box if any
        if (this.groupSelectionBox) {
            this.groupSelectionBox.destroy();
        }
        
        // Create new group selection box
        if (this.selectedElements.size > 0) {
            console.log('Creating GroupSelectionBox...');
            try {
                this.groupSelectionBox = new GroupSelectionBox(this.svg, this.selectedElements, this.undoSystem);
                this.groupSelectionBox.show();
                console.log('GroupSelectionBox created and shown');
            } catch (error) {
                console.error('Error creating GroupSelectionBox:', error);
            }
        }
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BulkSelection;
}