# Claude Memory

## SVG to PNG Conversion Workflow

When creating SVG files and converting them to PNG:

1. Create the SVG file
2. **IMPORTANT: Ensure all text content fits within the SVG viewBox boundaries** - long text at large font sizes can extend beyond canvas and get cropped
3. Use `qlmanage -t -o . filename.svg` to convert to PNG (no size restrictions to avoid cropping)
4. Rename the output from `filename.svg.png` to `filename.png`
5. **ALWAYS provide the full absolute path to the PNG file** so the user can easily locate and view it

Common issue: Text cropping occurs when text elements are too wide for the canvas, even when centered.
Solution: Break long titles into multiple lines or reduce font size.

Example:
```bash
qlmanage -t -o . linkedin_post.svg
mv linkedin_post.svg.png linkedin_post.png
```

Then provide: `/full/absolute/path/to/linkedin_post.png`

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