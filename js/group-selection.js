// Group Selection Box for SVG Editor
class GroupSelectionBox {
    constructor(svg, selectedElements, undoSystem) {
        this.svg = svg;
        this.selectedElements = selectedElements;
        this.undoSystem = undoSystem;
        
        // Create the group selection box
        this.createGroupBox();
        
        // Track resize/transform state
        this.isResizing = false;
        this.isDragging = false;
        this.resizeHandle = null;
        this.startBounds = null;
        this.elementStartStates = new Map();
        this.dragStartX = 0;
        this.dragStartY = 0;
        
        this.updateBounds();
        this.setupEventListeners();
    }
    
    createGroupBox() {
        // Create container div for the group selection box
        this.container = document.createElement('div');
        this.container.className = 'group-selection-box';
        this.container.style.cssText = `
            position: fixed;
            border: 2px solid #6366f1;
            background: rgba(99, 102, 241, 0.05);
            pointer-events: all;
            cursor: move;
            z-index: 1000;
        `;
        
        // Add resize handles
        const handles = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'];
        handles.forEach(position => {
            const handle = document.createElement('div');
            handle.className = `resize-handle ${position}`;
            handle.dataset.position = position;
            handle.style.cssText = `
                position: absolute;
                width: 8px;
                height: 8px;
                background: #6366f1;
                border: 1px solid white;
                border-radius: 2px;
                pointer-events: all;
            `;
            
            // Position handles
            switch(position) {
                case 'nw': handle.style.cssText += 'top: -4px; left: -4px; cursor: nw-resize;'; break;
                case 'ne': handle.style.cssText += 'top: -4px; right: -4px; cursor: ne-resize;'; break;
                case 'sw': handle.style.cssText += 'bottom: -4px; left: -4px; cursor: sw-resize;'; break;
                case 'se': handle.style.cssText += 'bottom: -4px; right: -4px; cursor: se-resize;'; break;
                case 'n': handle.style.cssText += 'top: -4px; left: 50%; transform: translateX(-50%); cursor: n-resize;'; break;
                case 's': handle.style.cssText += 'bottom: -4px; left: 50%; transform: translateX(-50%); cursor: s-resize;'; break;
                case 'e': handle.style.cssText += 'right: -4px; top: 50%; transform: translateY(-50%); cursor: e-resize;'; break;
                case 'w': handle.style.cssText += 'left: -4px; top: 50%; transform: translateY(-50%); cursor: w-resize;'; break;
            }
            
            this.container.appendChild(handle);
        });
        
        document.body.appendChild(this.container);
    }
    
    updateBounds() {
        if (this.selectedElements.size === 0) {
            this.hide();
            return;
        }
        
        // Calculate bounding box of all selected elements
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        
        const svgRect = this.svg.getBoundingClientRect();
        const viewBox = this.svg.viewBox.baseVal;
        const scaleX = svgRect.width / viewBox.width;
        const scaleY = svgRect.height / viewBox.height;
        
        this.selectedElements.forEach(element => {
            try {
                const bbox = element.getBBox();
                const left = bbox.x;
                const top = bbox.y;
                const right = bbox.x + bbox.width;
                const bottom = bbox.y + bbox.height;
                
                minX = Math.min(minX, left);
                minY = Math.min(minY, top);
                maxX = Math.max(maxX, right);
                maxY = Math.max(maxY, bottom);
            } catch (e) {
                // Skip elements without getBBox
            }
        });
        
        // Convert to screen coordinates and set container position
        const padding = 10;
        this.container.style.left = (svgRect.left + minX * scaleX - padding) + 'px';
        this.container.style.top = (svgRect.top + minY * scaleY - padding) + 'px';
        this.container.style.width = ((maxX - minX) * scaleX + padding * 2) + 'px';
        this.container.style.height = ((maxY - minY) * scaleY + padding * 2) + 'px';
        this.container.style.display = 'block';
        
        // Store bounds for transform calculations
        this.bounds = { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
    }
    
    setupEventListeners() {
        // Drag the entire group
        this.container.addEventListener('mousedown', (e) => {
            if (e.target === this.container) {
                this.startDrag(e);
            }
        });
        
        // Resize handles
        this.container.querySelectorAll('.resize-handle').forEach(handle => {
            handle.addEventListener('mousedown', (e) => {
                this.startResize(e, handle.dataset.position);
            });
        });
        
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }
    
    startDrag(e) {
        this.isDragging = true;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        
        // Save state before transform
        this.undoSystem.saveState('before_group_drag');
        
        // Store initial positions of all elements
        this.selectedElements.forEach(element => {
            const state = this.getElementState(element);
            this.elementStartStates.set(element, state);
        });
        
        e.preventDefault();
    }
    
    startResize(e, handle) {
        this.isResizing = true;
        this.resizeHandle = handle;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        this.startBounds = { ...this.bounds };
        
        // Save state before transform
        this.undoSystem.saveState('before_group_resize');
        
        // Store initial states of all elements
        this.selectedElements.forEach(element => {
            const state = this.getElementState(element);
            this.elementStartStates.set(element, state);
        });
        
        e.preventDefault();
        e.stopPropagation();
    }
    
    handleMouseMove(e) {
        if (this.isDragging) {
            const deltaX = e.clientX - this.dragStartX;
            const deltaY = e.clientY - this.dragStartY;
            
            // Move all selected elements
            this.selectedElements.forEach(element => {
                const startState = this.elementStartStates.get(element);
                if (!startState) return;
                
                this.moveElement(element, startState, deltaX, deltaY);
            });
            
            // Update the selection box position
            this.updateBounds();
            
            // Trigger change callback
            if (window.updateIfChanged) {
                window.updateIfChanged();
            }
        }
        else if (this.isResizing) {
            const deltaX = e.clientX - this.dragStartX;
            const deltaY = e.clientY - this.dragStartY;
            
            // Calculate scale based on resize handle
            const scaleX = this.calculateScaleX(deltaX);
            const scaleY = this.calculateScaleY(deltaY);
            
            // Transform all selected elements
            this.selectedElements.forEach(element => {
                const startState = this.elementStartStates.get(element);
                if (!startState) return;
                
                this.transformElement(element, startState, scaleX, scaleY);
            });
            
            // Update the selection box
            this.updateBounds();
            
            // Trigger change callback
            if (window.updateIfChanged) {
                window.updateIfChanged();
            }
        }
    }
    
    handleMouseUp(e) {
        this.isDragging = false;
        this.isResizing = false;
        this.resizeHandle = null;
        this.elementStartStates.clear();
    }
    
    calculateScaleX(deltaX) {
        const handle = this.resizeHandle;
        let scaleX = 1;
        
        if (handle.includes('e')) {
            scaleX = (this.startBounds.width + deltaX) / this.startBounds.width;
        } else if (handle.includes('w')) {
            scaleX = (this.startBounds.width - deltaX) / this.startBounds.width;
        }
        
        return Math.max(0.1, scaleX); // Minimum scale
    }
    
    calculateScaleY(deltaY) {
        const handle = this.resizeHandle;
        let scaleY = 1;
        
        if (handle.includes('s')) {
            scaleY = (this.startBounds.height + deltaY) / this.startBounds.height;
        } else if (handle.includes('n')) {
            scaleY = (this.startBounds.height - deltaY) / this.startBounds.height;
        }
        
        return Math.max(0.1, scaleY); // Minimum scale
    }
    
    getElementState(element) {
        const state = {};
        
        if (element.tagName === 'rect') {
            state.x = parseFloat(element.getAttribute('x') || 0);
            state.y = parseFloat(element.getAttribute('y') || 0);
            state.width = parseFloat(element.getAttribute('width') || 0);
            state.height = parseFloat(element.getAttribute('height') || 0);
        } else if (element.tagName === 'circle') {
            state.cx = parseFloat(element.getAttribute('cx') || 0);
            state.cy = parseFloat(element.getAttribute('cy') || 0);
            state.r = parseFloat(element.getAttribute('r') || 0);
        } else if (element.tagName === 'text') {
            state.x = parseFloat(element.getAttribute('x') || 0);
            state.y = parseFloat(element.getAttribute('y') || 0);
            state.fontSize = parseFloat(element.getAttribute('font-size') || 16);
        } else if (element.tagName === 'path') {
            state.d = element.getAttribute('d');
            element.setAttribute('data-original-path', state.d);
        } else if (element.tagName === 'line') {
            state.x1 = parseFloat(element.getAttribute('x1') || 0);
            state.y1 = parseFloat(element.getAttribute('y1') || 0);
            state.x2 = parseFloat(element.getAttribute('x2') || 0);
            state.y2 = parseFloat(element.getAttribute('y2') || 0);
        }
        
        return state;
    }
    
    moveElement(element, startState, deltaX, deltaY) {
        const viewBox = this.svg.viewBox.baseVal;
        const svgRect = this.svg.getBoundingClientRect();
        const scaleX = svgRect.width / viewBox.width;
        const scaleY = svgRect.height / viewBox.height;
        
        // Convert screen delta to SVG delta
        const svgDeltaX = deltaX / scaleX;
        const svgDeltaY = deltaY / scaleY;
        
        if (element.tagName === 'rect') {
            element.setAttribute('x', startState.x + svgDeltaX);
            element.setAttribute('y', startState.y + svgDeltaY);
        } else if (element.tagName === 'circle') {
            element.setAttribute('cx', startState.cx + svgDeltaX);
            element.setAttribute('cy', startState.cy + svgDeltaY);
        } else if (element.tagName === 'text') {
            element.setAttribute('x', startState.x + svgDeltaX);
            element.setAttribute('y', startState.y + svgDeltaY);
        } else if (element.tagName === 'path') {
            SVGUtils.updatePathPosition(element, svgDeltaX, svgDeltaY);
        } else if (element.tagName === 'line') {
            element.setAttribute('x1', startState.x1 + svgDeltaX);
            element.setAttribute('y1', startState.y1 + svgDeltaY);
            element.setAttribute('x2', startState.x2 + svgDeltaX);
            element.setAttribute('y2', startState.y2 + svgDeltaY);
        }
    }
    
    transformElement(element, startState, scaleX, scaleY) {
        // Calculate element's relative position to group center
        const centerX = (this.startBounds.minX + this.startBounds.maxX) / 2;
        const centerY = (this.startBounds.minY + this.startBounds.maxY) / 2;
        
        if (element.tagName === 'rect') {
            const relX = startState.x - centerX;
            const relY = startState.y - centerY;
            element.setAttribute('x', centerX + relX * scaleX);
            element.setAttribute('y', centerY + relY * scaleY);
            element.setAttribute('width', startState.width * scaleX);
            element.setAttribute('height', startState.height * scaleY);
        } else if (element.tagName === 'circle') {
            const relX = startState.cx - centerX;
            const relY = startState.cy - centerY;
            element.setAttribute('cx', centerX + relX * scaleX);
            element.setAttribute('cy', centerY + relY * scaleY);
            element.setAttribute('r', startState.r * Math.max(scaleX, scaleY));
        } else if (element.tagName === 'text') {
            const relX = startState.x - centerX;
            const relY = startState.y - centerY;
            element.setAttribute('x', centerX + relX * scaleX);
            element.setAttribute('y', centerY + relY * scaleY);
            element.setAttribute('font-size', startState.fontSize * Math.max(scaleX, scaleY));
        } else if (element.tagName === 'path') {
            // Transform path points
            const pathData = SVGUtils.parsePath(startState.d);
            const transformed = pathData.map(point => ({
                x: centerX + (point.x - centerX) * scaleX,
                y: centerY + (point.y - centerY) * scaleY
            }));
            
            let newD = `M ${transformed[0].x} ${transformed[0].y}`;
            for (let i = 1; i < transformed.length; i++) {
                newD += ` L ${transformed[i].x} ${transformed[i].y}`;
            }
            if (startState.d.includes('Z')) newD += ' Z';
            
            element.setAttribute('d', newD);
        } else if (element.tagName === 'line') {
            const relX1 = startState.x1 - centerX;
            const relY1 = startState.y1 - centerY;
            const relX2 = startState.x2 - centerX;
            const relY2 = startState.y2 - centerY;
            element.setAttribute('x1', centerX + relX1 * scaleX);
            element.setAttribute('y1', centerY + relY1 * scaleY);
            element.setAttribute('x2', centerX + relX2 * scaleX);
            element.setAttribute('y2', centerY + relY2 * scaleY);
        }
    }
    
    show() {
        this.container.style.display = 'block';
        this.updateBounds();
    }
    
    hide() {
        this.container.style.display = 'none';
    }
    
    destroy() {
        this.container.remove();
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GroupSelectionBox;
}