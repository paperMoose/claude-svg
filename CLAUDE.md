# Claude Memory

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