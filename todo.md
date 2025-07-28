# SVG Editor Enhancement TODO

Based on your requirements for intelligent flowchart editing, here's our step-by-step plan:

## Current Status
- ✅ Basic SVG editor loads flowchart content
- ✅ Basic dragging works for ALL shapes (rectangles, circles, diamonds, lines)
- ✅ Diamond/path dragging fixed (no more "flying off")
- ✅ UTF-8 encoding fixed (no more weird characters)
- ✅ Modular architecture implemented
- ✅ Complete undo/redo system with keyboard shortcuts
- ✅ Code refactored into maintainable modules

## Goals
Make the SVG editor respect existing connections so that when you move shapes, connected lines follow intelligently.

## Step-by-Step Implementation Plan

### Phase 1: Foundation (Test Each Step)
- [x] **Test basic dragging works** - Confirm rectangles, circles, diamonds all drag properly
- [x] **Test flowchart loads correctly** - All elements visible, no encoding issues

### Phase 1.5: Essential Editor Features (COMPLETED ✅)
- [x] **Add undo functionality** - Ctrl+Z to undo last action
- [x] **Add redo functionality** - Ctrl+Y to redo undone action
- [x] **Test undo/redo system** - Verified working for all operations
- [x] **Refactor to modular architecture** - Better maintainability

### Phase 1.6: Bulk Selection (NEXT PRIORITY 🎯)
- [ ] **Implement selection rectangle** - Click-drag on empty canvas to draw selection box
- [ ] **Multi-select detection** - Elements inside rectangle become selected
- [ ] **Visual feedback** - Show all selected elements with consistent styling
- [ ] **Multi-element dragging** - Drag any selected element moves entire group
- [ ] **Maintain relative positions** - Elements keep their spacing when moved as group
- [ ] **Undo/redo for bulk operations** - Single undo for entire group movement

### Phase 2: Text Grouping
- [ ] **Identify text-shape relationships** - Find which text belongs to which shape
- [ ] **Group text with shapes** - When you drag a shape, its text moves with it
- [ ] **Test text grouping** - Drag decision diamond, verify question text moves too

### Phase 3: Simple Connection Detection  
- [ ] **Detect line endpoints** - Find start/end points of all lines
- [ ] **Match lines to shapes** - Which lines connect to which shapes
- [ ] **Visual feedback** - Highlight connected elements when selected
- [ ] **Test connection detection** - Select shape, verify connected lines highlight

### Phase 4: Basic Connection Following
- [ ] **Implement single line following** - Pick ONE line type (e.g., "YES" arrow)
- [ ] **Test single connection** - Move decision diamond, verify YES arrow follows
- [ ] **Debug and refine** - Fix any issues with the simple case

### Phase 5: Full Connection System
- [ ] **Handle all line types** - Straight lines, curved paths, arrows
- [ ] **Direction awareness** - Lines point TO shapes (destination-focused)
- [ ] **Multiple connections** - Shapes can have multiple incoming/outgoing lines
- [ ] **Test all connections** - Move any shape, verify all connected lines follow

### Phase 6: Smart Connection Points
- [ ] **Edge connection points** - Lines connect to shape edges, not centers
- [ ] **Optimal routing** - Lines connect to nearest edge point
- [ ] **Arrow preservation** - Maintain arrowhead directions and markers

## Key Principles
1. **One change at a time** - Test each feature before adding the next
2. **Start simple** - Basic cases first, then handle edge cases
3. **Destination-focused** - Lines point TO shapes and follow the target
4. **Preserve structure** - Don't break existing flowchart relationships

## Testing Strategy
- Test with the prompt checklist flowchart after each phase
- Verify specific scenarios:
  - Drag "Is it checkable?" diamond → YES/NO arrows should follow
  - Drag "Add measurable constraints" box → incoming red arrow should follow
  - Drag any shape → only connected elements should move, nothing else

## Technical Implementation Details

### Completed Architecture
1. **Modular JS Files**
   - `js/undo-system.js` - UndoSystem class with keyboard handling
   - `js/drag-handler.js` - DragHandler class for all drag operations
   - `js/svg-utils.js` - SVGUtils static methods for SVG manipulation

2. **Key Fixes Implemented**
   - **Diamond dragging**: Store original path data, calculate from original positions
   - **UTF-8 encoding**: Removed deprecated `unescape()`, use proper encoding
   - **State management**: Save state BEFORE operations, not after
   - **Event handling**: Separated concerns, drag handler manages its own events

3. **Undo System Design**
   - Stack-based history (undoStack, redoStack)
   - Saves full SVG innerHTML for simplicity
   - Rebuilds interactions after restore
   - Keyboard shortcuts work cross-platform

### Upcoming Technical Challenges

1. **Bulk Selection Implementation**
   - Need selection rectangle overlay element
   - Intersection detection for elements within rectangle
   - Multiple selected elements array management
   - Group movement coordinate calculations

2. **Connection Intelligence**
   - Destination detection using arrow markers
   - Connection point calculation (center vs edge)
   - Line endpoint updates during shape movement
   - Text-to-shape proximity detection

## Success Criteria
✅ **Shapes are the unit** - Moving a shape moves its text and connected lines  
✅ **Lines follow destinations** - Arrows pointing to a shape follow when it moves  
✅ **No "flying off"** - Only intended elements move, others stay in place  
✅ **Intuitive editing** - Flowchart editing feels natural and predictable
✅ **Maintainable code** - Modular architecture for easy updates