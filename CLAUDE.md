# Claude Memory

## Visualization Creation Workflow

When creating visualizations, architecture diagrams, or graphics:

1. Create an HTML file with embedded SVG, CSS styling, and download functionality
2. User opens the HTML file in a browser
3. User clicks "Download as PNG" button to save the image
4. **ALWAYS provide the full absolute path to the HTML file** so the user can easily open it

**Approach: HTML/CSS with embedded SVG and download capability**
- Create `.html` files with inline SVG
- Include JavaScript to convert SVG to PNG and download
- Add a download button for easy export
- No external tools or screenshots needed

**IMPORTANT SVG Design Rules:**
- Ensure NO text overlaps with other elements
- Add adequate padding around all text (minimum 10px)
- Position status indicators away from text content
- Use proper spacing between elements (minimum 20px)
- Test all text fits within container boundaries
- Consider longer text strings when sizing containers

Example structure:
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { margin: 0; padding: 20px; background: #0a0e27; font-family: Arial, sans-serif; }
        #download-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            z-index: 1000;
        }
        #download-btn:hover { background: #2563eb; }
    </style>
</head>
<body>
    <button id="download-btn" onclick="downloadSVGAsPNG()">Download as PNG</button>
    
    <svg id="visualization" width="1200" height="800" viewBox="0 0 1200 800">
        <!-- SVG content here -->
    </svg>

    <script>
        function downloadSVGAsPNG() {
            const svg = document.getElementById('visualization');
            const svgData = new XMLSerializer().serializeToString(svg);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            canvas.width = svg.width.baseVal.value;
            canvas.height = svg.height.baseVal.value;
            
            img.onload = function() {
                ctx.drawImage(img, 0, 0);
                canvas.toBlob(function(blob) {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'visualization.png';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                });
            };
            
            img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
        }
    </script>
</body>
</html>
```

Then provide: `/full/absolute/path/to/visualization.html`

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