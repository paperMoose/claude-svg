# Claude Memory

## SVG Editor Progress (Updated)

### What We've Built
We've created a powerful SVG editor integrated with the visualization template system. The editor is now modular and includes:

1. **Basic Features Working**
   - Load flowcharts from the template (UTF-8 encoding fixed)
   - Select and drag any shape type (rectangles, circles, diamonds/paths, lines)
   - Fixed diamond dragging "flying off" issue by storing original path data
   - All basic editing tools functional

2. **Modular Architecture** 
   - `js/undo-system.js` - Complete undo/redo with keyboard shortcuts
   - `js/drag-handler.js` - Separated drag handling logic
   - `js/svg-utils.js` - Utility functions for SVG manipulation
   - Main editor imports modules for better maintainability

3. **Undo/Redo System**
   - Ctrl+Z (Cmd+Z on Mac) for undo
   - Ctrl+Y or Ctrl+Shift+Z for redo
   - 50-step history
   - Saves state before drag, create, and delete operations
   - Restores element interactions after undo/redo

### Key Lessons Learned
1. **Incremental Development** - Make one change at a time and test
2. **Path Element Dragging** - Must store original coordinates to prevent cumulative movement
3. **UTF-8 Encoding** - Use proper encoding/decoding (not deprecated `unescape`)
4. **State Management** - Save state BEFORE operations, not after
5. **Modular Design** - Separate concerns into different files for maintainability

### Current State
- All basic dragging works perfectly
- Undo/redo system fully functional
- Code is modular and maintainable
- Ready for next features

### Next Features to Implement
1. **Bulk Selection** (Next Priority)
   - Click-drag rectangle to select multiple elements
   - Move selected group while maintaining relative positions
   - Visual feedback for selected elements
   
2. **Intelligent Connections** (After Bulk Selection)
   - Lines follow shapes when moved
   - Text groups with parent shapes
   - Destination-focused connection logic

#

## Initial Context

This is Claude's memory file. The information below provides context and guidelines, but Claude should not take any action until the user makes an initial request. 

When starting a conversation, Claude should:
1. Ask what kind of image/visualization the user wants to generate
2. Workshop the idea with them through conversation
3. Ask clarifying questions to refine the concept
4. Once the concept is clear, ask "Are you ready to generate it?"
5. Only then proceed with creating the visualization

Initial greeting should be something like: "What kind of image should we generate? Tell me about what you want to create - we'll workshop it together and then I'll generate it for you."

## Visualization Creation Workflow

When creating visualizations, architecture diagrams, or graphics:

1. **USE THE TEMPLATE**: Copy `visualization-template.html` to a new file with descriptive name
2. Replace the placeholder SVG with your custom visualization
3. User opens the HTML file in a browser
4. User configures export options and downloads
5. **ALWAYS provide the full absolute path to the HTML file** so the user can easily open it

**Template-Based Approach:**
- Start with `visualization-template.html` - it has all export logic built in
- Only generate the SVG content, not the entire HTML structure
- The template includes: format selection, resolution scaling, quality settings, theme switching
- Users can export as PNG, JPEG, or WebP at various resolutions

**IMPORTANT SVG Design Rules:**
- Ensure NO text overlaps with other elements
- Add adequate padding around all text (minimum 10px)
- Position status indicators away from text content
- Use proper spacing between elements (minimum 20px)
- Test all text fits within container boundaries
- Consider longer text strings when sizing containers
- Default SVG dimensions: 1200x800 (template default)

**CRITICAL Layout Rules for Diagrams:**
- **NEVER overlap shapes** - Every shape must have clear space around it
- **Subnet/container boxes must be larger** - They should clearly contain their elements with padding
- **Minimum padding between shapes: 30px** - No shapes should touch or be too close
- **Text must stay within its parent shape** - Never let labels extend outside their containers
- **Center elements within containers** - If API Gateway is in public subnet, center it properly
- **Animate ALL connection lines** - Every line should have flowing animation to show data movement
- **Background containers (like subnets) must not overlap** - Each should have its own clear space
- **Leave breathing room** - Better to have a larger diagram with good spacing than cramped elements

**CRITICAL Line Routing Rules:**
- **NO CURVES** - Use only straight lines and right angles
- **Maximum ONE right angle per connection** - Keep it simple and clean
- **Use proper angles** - Only 90-degree turns, no arbitrary angles
- **Vary connection points** - Lines don't have to connect at center; use top/bottom/sides
- **NO CORNER INTERSECTIONS** - Lines must connect at: center, 1/4 from edge, or 3/4 from edge
- **Stay within containers** - Lines should not extend outside subnet boundaries
- **Logical routing** - Lines should make visual sense and follow the data flow
- **Example good routing**: `M100,50 L200,50 L200,150` (horizontal, then vertical)
- **Example bad routing**: `M100,50 Q150,100 200,150` (curved - never do this)
- **Avoid diagonal lines when possible** - Use horizontal/vertical segments
  1. Simplicity First

  - Show only essential components needed to communicate the concept
  - Remove unnecessary details that don't add to understanding
  - Focus on the core pattern or flow being illustrated
  - When asked to simplify, aggressively reduce complexity

  2. Prevent Visual Overlaps

  - No overlapping lines - route connections cleanly
  - Elements should never overlap with each other
  - Text must not overlap with shapes or lines
  - Keep adequate spacing (30px minimum) between all elements

  3. Respect Container Boundaries

  - All elements must fit within their parent containers
  - Text must stay within shape boundaries
  - Container boxes must fully encompass their contents with padding
  - Extend container sizes rather than letting content overflow

  4. Clear Visual Hierarchy

  - Make important information larger and more prominent
  - Use consistent sizing for similar elements
  - Key messages (like callout boxes) should have larger, readable text
  - Group related elements visually

  5. Strategic Use of Color

  - Use different colors to distinguish between element types
  - Apply color consistently for the same type of element
  - Use semi-transparent backgrounds for visual depth
  - Ensure sufficient contrast for readability

  6. Clean Layout Principles

  - Align elements on a clear grid when possible
  - Maintain consistent spacing between elements
  - Position labels close to but not overlapping their subjects
  - Keep connection lines as simple as possible (straight lines, minimal turns)

  7. Text Readability

  - Ensure all text is large enough to read
  - Position text with adequate padding from edges
  - Use appropriate font sizes for hierarchy (titles > labels > details)
  - Never let text extend outside its container

**FINAL CHECK before rendering:**
1. Check all shapes have 30px+ padding
2. Verify no text extends outside containers
3. Ensure all lines use straight segments with max 1 right angle
4. Confirm subnets don't overlap
5. Validate all animations are present
6. Review connection points vary (not all center-to-center)
7. No lines intersect at corners (use center or 1/4 positions)
8. All lines stay within their container boundaries

**ELEMENT-BY-ELEMENT VALIDATION:**
When validating diagrams, create a todo for EACH element in the SVG. This ensures systematic validation of every component. For EVERY element in the diagram, check:
- [ ] Shape has 30px+ padding from neighbors
- [ ] Text fits within shape boundaries
- [ ] Connected lines use proper intersection points (not corners)
- [ ] Lines to/from this element use max 1 right angle
- [ ] If in a subnet, element is fully contained with padding
- [ ] Any animations on this element work properly
- [ ] Colors/gradients render correctly
- [ ] Element labels are readable and properly positioned

**IMPORTANT:** Use the TodoWrite tool to create a checklist with one todo item per SVG element (e.g., "Validate API Gateway spacing", "Check Lambda-to-RDS connection", "Verify S3 text fits within bounds"). This ensures no element is missed during validation.

**When creating visualizations:**
1. Read the visualization-template.html file
2. Copy it to a new file (e.g., `architecture-diagram.html`)
3. Replace the placeholder SVG with your generated content:
   ```svg
   <!-- CLAUDE WILL REPLACE THIS COMMENT WITH SVG -->
   ```
4. Keep the SVG id as "visualization" for the export script to work

Example SVG structure to insert:
```svg
<svg id="visualization" width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="800" fill="#0a0e27"/>
    <!-- Your visualization content here -->
</svg>
```

**CRITICAL FILE PATH REQUIREMENTS:**
When providing the HTML file path to users, you MUST:
- Use the complete absolute file path with NO line breaks, spaces, or formatting
- Ensure the path is clean and copyable in a single line
- Never include markdown formatting, line numbers, or any other characters
- Format: `/Users/username/.claude-squad/worktrees/project/filename.html`
- BAD: `/Users/username/.claude-squad/worktrees/project/\nfilename.html` (line break)
- BAD: ` /Users/username/...` (leading space)
- BAD: `/Users/username/... ` (trailing space)
- GOOD: `/Users/ryanbrandt/.claude-squad/worktrees/vunda_1851fd245cfa9a78/architecture-diagram.html`

The visualization template now includes:
- **Cropping**: Enable crop mode to select specific areas of the image
- **Rotation**: Rotate the image from 0-360 degrees  
- **Scaling**: Scale the image from 25% to 200%
- **Interactive crop handles**: Drag to move crop area, resize using corner handles
- **Real-time preview**: All transformations visible before download

## Twitter Banner Creation

Twitter banner dimensions: 1500x500px
- Use HTML/CSS approach for consistent rendering
- **IMPORTANT**: Shift content significantly right (left: 400px+) because profile picture overlays on the left
- No animations since this will be a screenshot
- Use pun names instead of real names for personal branding
- Include subtle tech elements with high contrast typography

## LinkedIn Banner Creation

LinkedIn banner dimensions: 1584x396px
- Similar design approach to Twitter but more professional
- Use "Connect" instead of "Follow" for LinkedIn audience
- Focus on enterprise/professional themes: scaling teams, strategies, production systems
- Slightly more sophisticated color palette and network graphics