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

Then provide: `/full/absolute/path/to/your-visualization.html`

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