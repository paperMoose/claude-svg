# SVG Editor Enhancement TODO

Based on your requirements for intelligent flowchart editing, here's our step-by-step plan:

## Current Status
- ✅ Basic SVG editor loads flowchart content
- ✅ Basic dragging works for rectangles and circles
- ✅ Diamond/path dragging now works
- ✅ UTF-8 encoding fixed (no more weird characters)

## Goals
Make the SVG editor respect existing connections so that when you move shapes, connected lines follow intelligently.

## Step-by-Step Implementation Plan

### Phase 1: Foundation (Test Each Step)
- [ ] **Test basic dragging works** - Confirm rectangles, circles, diamonds all drag properly
- [ ] **Test flowchart loads correctly** - All elements visible, no encoding issues

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

## Success Criteria
✅ **Shapes are the unit** - Moving a shape moves its text and connected lines  
✅ **Lines follow destinations** - Arrows pointing to a shape follow when it moves  
✅ **No "flying off"** - Only intended elements move, others stay in place  
✅ **Intuitive editing** - Flowchart editing feels natural and predictable