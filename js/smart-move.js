// Smart Move System for SVG Editor
// Moves shapes while maintaining line connections
class SmartMove {
    constructor(svg, undoSystem) {
        this.svg = svg;
        this.undoSystem = undoSystem;
        
        // State management
        this.isSelecting = false;
        this.isDragging = false;
        this.selectionRect = null;
        this.selectionStartX = 0;
        this.selectionStartY = 0;
        
        // Elements in the region
        this.shapesInRegion = new Set(); // Shapes to move
        this.linesFullyInside = new Set(); // Lines with both ends inside
        this.linesPartiallyConnected = new Map(); // Lines with one end connected
        
        // Drag state
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.initialPositions = new Map();
        
        // Connection map for quick lookups
        this.connectionMap = new Map(); // shape -> Set of connected lines
        
        this.createSelectionRectangle();
        this.setupEventListeners();
    }
    
    createSelectionRectangle() {
        // Create the selection rectangle element
        this.selectionRect = document.createElement('div');
        this.selectionRect.className = 'smart-move-selection-rect';
        this.selectionRect.style.cssText = `
            position: fixed;
            border: 2px dashed #10b981;
            background: rgba(16, 185, 129, 0.1);
            pointer-events: none;
            display: none;
            z-index: 999;
        `;
        document.body.appendChild(this.selectionRect);
    }
    
    setupEventListeners() {
        // Only activate when smart-move tool is selected
        // Use capture phase to get events before other handlers
        this.svg.addEventListener('mousedown', this.handleMouseDown.bind(this), true);
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }
    
    isActive() {
        const activeBtn = document.querySelector('.tool-btn[data-tool="smart-move"]');
        return activeBtn && activeBtn.classList.contains('active');
    }
    
    handleMouseDown(e) {
        
        if (!this.isActive()) return;
        
        // Start selection rectangle
        if (e.target === this.svg) {
            e.stopPropagation();
            e.preventDefault();
            this.startSelection(e);
        }
        // Start dragging if clicking inside a selected shape
        else if (this.shapesInRegion.has(e.target)) {
            e.stopPropagation();
            e.preventDefault();
            this.startDrag(e);
        }
        // Clicking on a shape that's not selected
        else {
            // Allow shift+click on a shape to start selection from that point
            if (e.shiftKey) {
                e.stopPropagation();
                e.preventDefault();
                this.startSelection(e);
            } else {
                // Show visual hint
                this.showHint('Hold Shift + Click to start selection here');
                // Flash the shape to indicate it was clicked
                e.target.style.opacity = '0.5';
                setTimeout(() => {
                    e.target.style.opacity = '';
                }, 200);
            }
        }
    }
    
    startSelection(e) {
        this.isSelecting = true;
        this.selectionStartX = e.clientX;
        this.selectionStartY = e.clientY;
        
        this.selectionRect.style.display = 'block';
        this.selectionRect.style.left = this.selectionStartX + 'px';
        this.selectionRect.style.top = this.selectionStartY + 'px';
        this.selectionRect.style.width = '0px';
        this.selectionRect.style.height = '0px';
        
        
        e.preventDefault();
    }
    
    handleMouseMove(e) {
        if (this.isSelecting) {
            this.updateSelectionRectangle(e);
        } else if (this.isDragging) {
            this.performSmartDrag(e);
        }
    }
    
    updateSelectionRectangle(e) {
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
        
    }
    
    handleMouseUp(e) {
        if (this.isSelecting) {
            this.finishSelection();
        } else if (this.isDragging) {
            this.finishDrag();
        }
    }
    
    finishSelection() {
        this.isSelecting = false;
        
        // Find all shapes within the selection rectangle BEFORE hiding it
        this.identifyElementsInRegion();
        
        // Now hide the selection rectangle
        this.selectionRect.style.display = 'none';
        
        // Analyze line connections
        this.analyzeConnections();
        
        // Add visual feedback
        this.highlightSelectedElements();
        
    }
    
    identifyElementsInRegion() {
        // Clear previous selection
        this.shapesInRegion.clear();
        this.linesFullyInside.clear();
        this.linesPartiallyConnected.clear();
        
        const selRect = this.selectionRect.getBoundingClientRect();
        const svgRect = this.svg.getBoundingClientRect();
        
        
        // Get all shapes EXCEPT lines and line-like paths
        const shapes = this.svg.querySelectorAll('rect, circle, text, path, polygon, polyline, g');
        
        shapes.forEach(shape => {
            if (shape.getAttribute('data-background') === 'true') return;
            
            // Skip line-like paths (paths with stroke but no fill)
            if (shape.tagName === 'path') {
                const fill = shape.getAttribute('fill');
                const stroke = shape.getAttribute('stroke');
                if (fill === 'none' && stroke) {
                    // This is likely a line, skip it
                    return;
                }
            }
            
            if (this.isElementInRectangle(shape, selRect, svgRect)) {
                this.shapesInRegion.add(shape);
            }
        });
    }
    
    analyzeConnections() {
        // Build connection map first
        this.buildConnectionMap();
        
        // Now analyze each line (including path-based lines)
        const lines = this.svg.querySelectorAll('line, path');
        console.log('Analyzing', lines.length, 'potential lines');
        
        lines.forEach(line => {
            // Skip non-line paths
            if (line.tagName === 'path') {
                const fill = line.getAttribute('fill');
                if (fill && fill !== 'none') {
                    return; // Skip filled paths
                }
            }
            
            const connectedShapes = this.getConnectedShapes(line);
            console.log('Line', line, 'connected to:', connectedShapes);
            
            if (connectedShapes.start && connectedShapes.end) {
                // Both ends connected
                if (this.shapesInRegion.has(connectedShapes.start) && 
                    this.shapesInRegion.has(connectedShapes.end)) {
                    // Both connected shapes are in region - line moves with them
                    this.linesFullyInside.add(line);
                    console.log('Line fully inside region');
                } else if (this.shapesInRegion.has(connectedShapes.start) || 
                           this.shapesInRegion.has(connectedShapes.end)) {
                    // One end in region - line will stretch
                    this.linesPartiallyConnected.set(line, {
                        start: connectedShapes.start,
                        end: connectedShapes.end,
                        startInRegion: this.shapesInRegion.has(connectedShapes.start),
                        endInRegion: this.shapesInRegion.has(connectedShapes.end)
                    });
                    console.log('Line partially connected - will re-route');
                }
            }
        });
        
        console.log('Lines analysis complete:', {
            fullyInside: this.linesFullyInside.size,
            partiallyConnected: this.linesPartiallyConnected.size
        });
    }
    
    buildConnectionMap() {
        this.connectionMap.clear();
        
        const lines = this.svg.querySelectorAll('line');
        lines.forEach(line => {
            const shapes = this.getConnectedShapes(line);
            
            if (shapes.start) {
                if (!this.connectionMap.has(shapes.start)) {
                    this.connectionMap.set(shapes.start, new Set());
                }
                this.connectionMap.get(shapes.start).add(line);
            }
            
            if (shapes.end) {
                if (!this.connectionMap.has(shapes.end)) {
                    this.connectionMap.set(shapes.end, new Set());
                }
                this.connectionMap.get(shapes.end).add(line);
            }
        });
    }
    
    getConnectedShapes(line) {
        let x1, y1, x2, y2;
        
        if (line.tagName === 'line') {
            x1 = parseFloat(line.getAttribute('x1'));
            y1 = parseFloat(line.getAttribute('y1'));
            x2 = parseFloat(line.getAttribute('x2'));
            y2 = parseFloat(line.getAttribute('y2'));
        } else if (line.tagName === 'path') {
            // Extract endpoints from path
            const points = this.extractPathEndpoints(line.getAttribute('d'));
            if (!points) {
                console.log('Could not extract endpoints from path:', line.getAttribute('d'));
                return { start: null, end: null };
            }
            x1 = points.x1;
            y1 = points.y1;
            x2 = points.x2;
            y2 = points.y2;
        }
        
        console.log('Line endpoints:', {x1, y1, x2, y2});
        
        // Find shapes at line endpoints
        const startShape = this.findShapeAtPoint(x1, y1, line);
        const endShape = this.findShapeAtPoint(x2, y2, line);
        
        console.log('Found shapes:', {
            start: startShape ? startShape.tagName : null, 
            end: endShape ? endShape.tagName : null
        });
        
        return { start: startShape, end: endShape };
    }
    
    findShapeAtPoint(x, y, excludeLine) {
        const threshold = 10; // Increased threshold for better detection
        
        // Get all shapes, prioritizing shapes over text for connections
        const shapes = this.svg.querySelectorAll('rect, circle, path, polygon, polyline, g');
        const candidates = [];
        
        for (let shape of shapes) {
            if (shape === excludeLine || shape.getAttribute('data-background') === 'true') continue;
            
            // Skip line-like paths
            if (shape.tagName === 'path') {
                const fill = shape.getAttribute('fill');
                if (fill === 'none') continue;
            }
            
            try {
                let bbox;
                
                // Use SVGUtils for better path bounds detection
                if (shape.tagName === 'path' && window.SVGUtils) {
                    const bounds = window.SVGUtils.getElementBounds(shape);
                    if (bounds) {
                        bbox = bounds;
                    } else {
                        bbox = shape.getBBox();
                    }
                } else {
                    bbox = shape.getBBox();
                }
                
                // Check if point is within or near the shape's bounding box
                if (x >= bbox.x - threshold && 
                    x <= bbox.x + bbox.width + threshold &&
                    y >= bbox.y - threshold && 
                    y <= bbox.y + bbox.height + threshold) {
                    
                    // Calculate distance from point to shape edge, not center
                    let distance;
                    if (x >= bbox.x && x <= bbox.x + bbox.width &&
                        y >= bbox.y && y <= bbox.y + bbox.height) {
                        // Point is inside shape
                        distance = 0;
                    } else {
                        // Calculate distance to nearest edge
                        const dx = Math.max(bbox.x - x, 0, x - (bbox.x + bbox.width));
                        const dy = Math.max(bbox.y - y, 0, y - (bbox.y + bbox.height));
                        distance = Math.sqrt(dx * dx + dy * dy);
                    }
                    
                    candidates.push({
                        shape: shape,
                        distance: distance,
                        isText: shape.tagName === 'text'
                    });
                }
            } catch (e) {
                // Silently skip shapes without valid bounding boxes
            }
        }
        
        if (candidates.length === 0) {
            // If no shapes found, check text elements as fallback
            const textElements = this.svg.querySelectorAll('text');
            for (let text of textElements) {
                if (text === excludeLine) continue;
                
                try {
                    const bbox = text.getBBox();
                    if (x >= bbox.x - threshold && 
                        x <= bbox.x + bbox.width + threshold &&
                        y >= bbox.y - threshold && 
                        y <= bbox.y + bbox.height + threshold) {
                        return text;
                    }
                } catch (e) {}
            }
            return null;
        }
        
        // Sort by priority: non-text shapes first, then by distance
        candidates.sort((a, b) => {
            if (a.isText && !b.isText) return 1;  // b wins (non-text beats text)
            if (!a.isText && b.isText) return -1; // a wins (non-text beats text)
            return a.distance - b.distance;       // closer wins
        });
        
        return candidates[0].shape;
    }
    
    isElementInRectangle(element, selRect, svgRect) {
        try {
            let bbox;
            
            // Special handling for path elements (diamonds)
            if (element.tagName === 'path') {
                // Try to get bounds using SVGUtils if available
                if (window.SVGUtils) {
                    const bounds = window.SVGUtils.getElementBounds(element);
                    if (bounds) {
                        bbox = {
                            x: bounds.x,
                            y: bounds.y,
                            width: bounds.width,
                            height: bounds.height
                        };
                    }
                }
                
                // Fallback to getBBox for paths
                if (!bbox) {
                    bbox = element.getBBox();
                }
            } else {
                bbox = element.getBBox();
            }
            
            // Convert to viewport coordinates
            const viewBox = this.svg.viewBox.baseVal;
            const scaleX = svgRect.width / viewBox.width;
            const scaleY = svgRect.height / viewBox.height;
            
            const elementRect = {
                left: svgRect.left + (bbox.x * scaleX),
                top: svgRect.top + (bbox.y * scaleY),
                right: svgRect.left + ((bbox.x + bbox.width) * scaleX),  
                bottom: svgRect.top + ((bbox.y + bbox.height) * scaleY)
            };
            
            // Check if element is inside selection rectangle
            return this.isIntersecting(selRect, elementRect);
        } catch (e) {
            // Element doesn't have valid bounds - skip it
            return false;
        }
    }
    
    isIntersecting(rect1, rect2) {
        return !(rect1.right < rect2.left || 
                rect1.left > rect2.right || 
                rect1.bottom < rect2.top || 
                rect1.top > rect2.bottom);
    }
    
    highlightSelectedElements() {
        // Clear previous highlights
        this.svg.querySelectorAll('.smart-selected').forEach(el => {
            el.classList.remove('smart-selected');
        });
        
        console.log('Highlighting', this.shapesInRegion.size, 'shapes');
        
        // Highlight shapes
        this.shapesInRegion.forEach(shape => {
            console.log('Adding smart-selected class to:', shape.tagName, shape);
            shape.classList.add('smart-selected');
            console.log('Classes after adding:', shape.classList.toString());
        });
        
        // Highlight lines that will move
        this.linesFullyInside.forEach(line => {
            line.classList.add('smart-selected');
        });
        
        // Different highlight for lines that will stretch
        this.linesPartiallyConnected.forEach((info, line) => {
            line.classList.add('smart-connected');
        });
    }
    
    startDrag(e) {
        if (this.shapesInRegion.size === 0) return;
        
        this.isDragging = true;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        
        // Save undo state
        this.undoSystem.saveState('before_smart_move');
        
        // Store initial positions
        this.storeInitialPositions();
        
        e.preventDefault();
    }
    
    storeInitialPositions() {
        this.initialPositions.clear();
        
        // Store positions of all shapes
        this.shapesInRegion.forEach(shape => {
            this.initialPositions.set(shape, this.getElementPosition(shape));
        });
        
        // Store positions of fully inside lines
        this.linesFullyInside.forEach(line => {
            this.initialPositions.set(line, {
                x1: parseFloat(line.getAttribute('x1')),
                y1: parseFloat(line.getAttribute('y1')),
                x2: parseFloat(line.getAttribute('x2')),
                y2: parseFloat(line.getAttribute('y2'))
            });
        });
        
        // Store only the moving endpoint for partially connected lines
        this.linesPartiallyConnected.forEach((info, line) => {
            if (line.tagName === 'line') {
                this.initialPositions.set(line, {
                    x1: parseFloat(line.getAttribute('x1')),
                    y1: parseFloat(line.getAttribute('y1')),
                    x2: parseFloat(line.getAttribute('x2')),
                    y2: parseFloat(line.getAttribute('y2')),
                    moveStart: info.startInRegion,
                    moveEnd: info.endInRegion
                });
            } else if (line.tagName === 'path') {
                // For paths, extract the start and end points
                const pathData = line.getAttribute('d');
                const points = this.extractPathEndpoints(pathData);
                if (points) {
                    this.initialPositions.set(line, {
                        x1: points.x1,
                        y1: points.y1,
                        x2: points.x2,
                        y2: points.y2,
                        moveStart: info.startInRegion,
                        moveEnd: info.endInRegion
                    });
                }
            }
        });
    }
    
    performSmartDrag(e) {
        const deltaX = e.clientX - this.dragStartX;
        const deltaY = e.clientY - this.dragStartY;
        
        // Convert to SVG coordinates
        const viewBox = this.svg.viewBox.baseVal;
        const svgRect = this.svg.getBoundingClientRect();
        const scaleX = viewBox.width / svgRect.width;
        const scaleY = viewBox.height / svgRect.height;
        
        const svgDeltaX = deltaX * scaleX;
        const svgDeltaY = deltaY * scaleY;
        
        // Move all shapes
        this.shapesInRegion.forEach(shape => {
            const initial = this.initialPositions.get(shape);
            this.updateElementPosition(shape, initial, svgDeltaX, svgDeltaY);
        });
        
        // Move fully inside lines
        this.linesFullyInside.forEach(line => {
            const initial = this.initialPositions.get(line);
            line.setAttribute('x1', initial.x1 + svgDeltaX);
            line.setAttribute('y1', initial.y1 + svgDeltaY);
            line.setAttribute('x2', initial.x2 + svgDeltaX);
            line.setAttribute('y2', initial.y2 + svgDeltaY);
        });
        
        // Update partially connected lines with intelligent routing
        console.log('Updating', this.linesPartiallyConnected.size, 'partially connected lines');
        this.linesPartiallyConnected.forEach((info, line) => {
            const initial = this.initialPositions.get(line);
            console.log('Updating line:', line.tagName, 'initial:', initial);
            
            if (line.tagName === 'line') {
                // For simple lines, just update endpoints
                if (initial.moveStart) {
                    line.setAttribute('x1', initial.x1 + svgDeltaX);
                    line.setAttribute('y1', initial.y1 + svgDeltaY);
                }
                if (initial.moveEnd) {
                    line.setAttribute('x2', initial.x2 + svgDeltaX);
                    line.setAttribute('y2', initial.y2 + svgDeltaY);
                }
            } else if (line.tagName === 'path') {
                // For paths, re-route with 90-degree angles
                console.log('Re-routing path with right angles');
                this.reroutePathWithRightAngles(line, info, initial, svgDeltaX, svgDeltaY);
            }
        });
        
        // Trigger change callback
        if (window.updateIfChanged) {
            window.updateIfChanged();
        }
    }
    
    getElementPosition(element) {
        if (element.tagName === 'rect') {
            return {
                x: parseFloat(element.getAttribute('x') || '0'),
                y: parseFloat(element.getAttribute('y') || '0')
            };
        } else if (element.tagName === 'circle') {
            return {
                cx: parseFloat(element.getAttribute('cx') || '0'),
                cy: parseFloat(element.getAttribute('cy') || '0')
            };
        } else if (element.tagName === 'text') {
            return {
                x: parseFloat(element.getAttribute('x') || '0'),
                y: parseFloat(element.getAttribute('y') || '0')
            };
        } else if (element.tagName === 'path') {
            // For paths, we'll need to use the path transformation approach
            if (!element.getAttribute('data-original-path')) {
                element.setAttribute('data-original-path', element.getAttribute('d') || '');
            }
            // Also get the current transform if any
            const transform = element.getAttribute('transform') || '';
            const match = transform.match(/translate\(([^,\s]+)[,\s]+([^)]+)\)/);
            const currentX = match ? parseFloat(match[1]) : 0;
            const currentY = match ? parseFloat(match[2]) : 0;
            
            return { 
                isPath: true,
                currentTranslateX: currentX,
                currentTranslateY: currentY
            };
        }
        // Add more element types as needed
        return {};
    }
    
    updateElementPosition(element, initial, deltaX, deltaY) {
        if (element.tagName === 'rect') {
            element.setAttribute('x', initial.x + deltaX);
            element.setAttribute('y', initial.y + deltaY);
        } else if (element.tagName === 'circle') {
            element.setAttribute('cx', initial.cx + deltaX);
            element.setAttribute('cy', initial.cy + deltaY);
        } else if (element.tagName === 'text') {
            element.setAttribute('x', initial.x + deltaX);
            element.setAttribute('y', initial.y + deltaY);
        } else if (element.tagName === 'path' && initial.isPath) {
            // For paths, apply transform instead of modifying the path data
            const newX = initial.currentTranslateX + deltaX;
            const newY = initial.currentTranslateY + deltaY;
            element.setAttribute('transform', `translate(${newX}, ${newY})`);
        }
    }
    
    reroutePathWithRightAngles(path, info, initial, deltaX, deltaY) {
        // Get current endpoints
        let x1 = initial.x1;
        let y1 = initial.y1;
        let x2 = initial.x2;
        let y2 = initial.y2;
        
        // Apply movement to the appropriate endpoint
        if (initial.moveStart) {
            x1 += deltaX;
            y1 += deltaY;
        }
        if (initial.moveEnd) {
            x2 += deltaX;
            y2 += deltaY;
        }
        
        // Calculate path with right angles
        const pathData = this.calculateRightAnglePath(x1, y1, x2, y2);
        
        // Preserve the path but update the d attribute
        // This keeps all other attributes like marker-end, stroke, etc.
        path.setAttribute('d', pathData);
        
        // Force re-render to ensure arrow markers update
        path.style.display = 'none';
        path.offsetHeight; // Trigger reflow
        path.style.display = '';
    }
    
    extractPathEndpoints(pathData) {
        // Extract all moveto and lineto commands
        const moveMatch = pathData.match(/M\s*([\d\.\-]+)[,\s]+([\d\.\-]+)/i);
        if (!moveMatch) return null;
        
        // Find all L commands
        const lineCommands = [...pathData.matchAll(/L\s*([\d\.\-]+)[,\s]+([\d\.\-]+)/gi)];
        if (lineCommands.length === 0) return null;
        
        // Get the last L command
        const lastLine = lineCommands[lineCommands.length - 1];
        
        return {
            x1: parseFloat(moveMatch[1]),
            y1: parseFloat(moveMatch[2]),
            x2: parseFloat(lastLine[1]),
            y2: parseFloat(lastLine[2])
        };
    }
    
    calculateRightAnglePath(x1, y1, x2, y2) {
        // Simple L-shaped path for now
        // If moving horizontally more than vertically, go horizontal first
        const dx = x2 - x1;
        const dy = y2 - y1;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal then vertical
            return `M${x1},${y1} L${x2},${y1} L${x2},${y2}`;
        } else {
            // Vertical then horizontal
            return `M${x1},${y1} L${x1},${y2} L${x2},${y2}`;
        }
    }
    
    finishDrag() {
        this.isDragging = false;
        
        // Clear highlights after a short delay
        setTimeout(() => {
            this.clearHighlights();
        }, 500);
    }
    
    clearHighlights() {
        this.svg.querySelectorAll('.smart-selected').forEach(el => {
            el.classList.remove('smart-selected');
        });
        this.svg.querySelectorAll('.smart-connected').forEach(el => {
            el.classList.remove('smart-connected');
        });
        
        // Clear internal state
        this.shapesInRegion.clear();
        this.linesFullyInside.clear();
        this.linesPartiallyConnected.clear();
        this.initialPositions.clear();
    }
    
    showHint(message) {
        // Remove any existing hint
        const existingHint = document.querySelector('.smart-move-hint');
        if (existingHint) existingHint.remove();
        
        // Create hint element
        const hint = document.createElement('div');
        hint.className = 'smart-move-hint';
        hint.textContent = message;
        hint.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 16px;
            z-index: 10000;
            pointer-events: none;
        `;
        document.body.appendChild(hint);
        
        // Remove after 2 seconds
        setTimeout(() => hint.remove(), 2000);
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SmartMove;
}