// SVG Utility Functions
class SVGUtils {
    
    // Get line endpoints
    static getLineEndpoints(line) {
        if (line.tagName === 'line') {
            return [
                { x: parseFloat(line.getAttribute('x1')), y: parseFloat(line.getAttribute('y1')) },
                { x: parseFloat(line.getAttribute('x2')), y: parseFloat(line.getAttribute('y2')) }
            ];
        } else if (line.tagName === 'path') {
            const d = line.getAttribute('d');
            const pathData = this.parsePath(d);
            if (pathData.length >= 2) {
                return [
                    pathData[0], // First point
                    pathData[pathData.length - 1] // Last point
                ];
            }
        }
        return null;
    }
    
    // Simple path parser for M and L commands
    static parsePath(d) {
        const points = [];
        const commands = d.match(/[ML]\s*[\d\.\-\s,]+/g) || [];
        
        commands.forEach(cmd => {
            const coords = cmd.substring(1).trim().split(/[\s,]+/).map(parseFloat);
            if (coords.length >= 2) {
                points.push({ x: coords[0], y: coords[1] });
            }
        });
        
        return points;
    }
    
    // Get element bounds
    static getElementBounds(element) {
        try {
            if (element.tagName === 'rect') {
                const x = parseFloat(element.getAttribute('x')) || 0;
                const y = parseFloat(element.getAttribute('y')) || 0;
                const width = parseFloat(element.getAttribute('width')) || 0;
                const height = parseFloat(element.getAttribute('height')) || 0;
                return { x, y, width, height, centerX: x + width/2, centerY: y + height/2 };
            } else if (element.tagName === 'circle') {
                const cx = parseFloat(element.getAttribute('cx')) || 0;
                const cy = parseFloat(element.getAttribute('cy')) || 0;
                const r = parseFloat(element.getAttribute('r')) || 0;
                return { x: cx - r, y: cy - r, width: r * 2, height: r * 2, centerX: cx, centerY: cy };
            } else if (element.tagName === 'path') {
                // For diamond shapes, get bounding box from path data
                const d = element.getAttribute('d');
                const points = this.parsePath(d);
                if (points.length > 0) {
                    const xs = points.map(p => p.x);
                    const ys = points.map(p => p.y);
                    const minX = Math.min(...xs);
                    const maxX = Math.max(...xs);
                    const minY = Math.min(...ys);
                    const maxY = Math.max(...ys);
                    return {
                        x: minX, y: minY,
                        width: maxX - minX, height: maxY - minY,
                        centerX: (minX + maxX) / 2, centerY: (minY + maxY) / 2
                    };
                }
            }
        } catch (e) {
            console.warn('Error getting bounds for element:', element, e);
        }
        return null;
    }
    
    // Check if point is near shape
    static isPointNearShape(point, bounds, tolerance) {
        return point.x >= bounds.x - tolerance &&
               point.x <= bounds.x + bounds.width + tolerance &&
               point.y >= bounds.y - tolerance &&
               point.y <= bounds.y + bounds.height + tolerance;
    }
    
    // Update path position (for diamond shapes) - fixed to prevent "flying off"
    static updatePathPosition(pathElement, deltaX, deltaY) {
        // Get the original path data stored when dragging started
        const originalD = pathElement.getAttribute('data-original-path');
        if (!originalD) return;
        
        const originalPoints = this.parsePath(originalD);
        if (originalPoints.length === 0) return;
        
        // Apply the delta to all points from the ORIGINAL positions
        const updatedPoints = originalPoints.map(point => ({
            x: point.x + deltaX,
            y: point.y + deltaY
        }));
        
        // Reconstruct the path data
        let newD = `M ${updatedPoints[0].x} ${updatedPoints[0].y}`;
        for (let i = 1; i < updatedPoints.length; i++) {
            newD += ` L ${updatedPoints[i].x} ${updatedPoints[i].y}`;
        }
        if (originalD.includes('Z') || originalD.includes('z')) {
            newD += ' Z';
        }
        
        pathElement.setAttribute('d', newD);
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SVGUtils;
}