# SVG-Edit Integration Guide

This guide shows how to integrate SVG-Edit into our visualization workflow, allowing in-browser editing of generated SVGs.

## Installation

```bash
npm install svgedit
```

## Basic Integration

### 1. Create an SVG Editor HTML Template

Create a new file `svg-editor-template.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>SVG Editor</title>
    <link href="./node_modules/svgedit/dist/editor/svgedit.css" rel="stylesheet" media="all">
    <style>
        body {
            margin: 0;
            padding: 0;
            overflow: hidden;
        }
        #editor-container {
            width: 100vw;
            height: 100vh;
        }
    </style>
</head>
<body>
    <div id="editor-container"></div>
    
    <script type="module">
        import Editor from './node_modules/svgedit/dist/editor/Editor.js';
        
        // Initialize the editor
        const svgEditor = new Editor(document.getElementById('editor-container'));
        
        // Configure the editor
        svgEditor.setConfig({
            allowInitialUserOverride: true,
            extensions: [],
            noDefaultExtensions: false,
            userExtensions: [],
            // Optional: Set initial SVG content
            initTool: 'select',
            exportWindowType: 'new', // 'same' for same window
            dimensions: [1200, 800],
            gridSnapping: true,
            gridColor: "#000",
            baseUnit: 'px',
            snappingStep: 10,
            showRulers: true
        });
        
        // Initialize the editor
        svgEditor.init();
        
        // Load SVG content if passed via URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const svgFile = urlParams.get('file');
        
        if (svgFile) {
            fetch(svgFile)
                .then(response => response.text())
                .then(svgContent => {
                    // Wait for editor to be ready
                    setTimeout(() => {
                        svgEditor.loadFromString(svgContent);
                    }, 1000);
                })
                .catch(error => console.error('Error loading SVG:', error));
        }
        
        // Add save functionality
        window.addEventListener('message', function(e) {
            if (e.data.action === 'save') {
                const svgString = svgEditor.getCanvas().getSvgString();
                // Send back to parent window or save to file
                window.parent.postMessage({
                    action: 'saved',
                    svg: svgString
                }, '*');
            }
        });
    </script>
</body>
</html>
```

### 2. Modify Your Visualization Template

Update your existing `visualization-template.html` to include an "Edit in SVG-Edit" button:

```javascript
// Add this button to your controls
<button onclick="openInEditor()" style="width: 100%; padding: 8px; background: #8b5cf6; color: white; border: none; border-radius: 4px; cursor: pointer; margin-bottom: 10px;">
    Edit in SVG-Edit
</button>

// Add this function
function openInEditor() {
    const svg = document.getElementById('visualization');
    const svgString = new XMLSerializer().serializeToString(svg);
    
    // Create a blob URL for the SVG
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    // Open editor in new window
    const editorWindow = window.open(`svg-editor-template.html?file=${encodeURIComponent(url)}`, '_blank');
    
    // Clean up blob URL after a delay
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
```

### 3. Alternative: Inline Integration

For a more integrated experience, you can embed SVG-Edit directly in your page:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Visualization with Editor</title>
    <link href="./node_modules/svgedit/dist/editor/svgedit.css" rel="stylesheet" media="all">
    <style>
        .container {
            display: flex;
            height: 100vh;
        }
        .visualization-pane {
            flex: 1;
            padding: 20px;
            background: #0a0e27;
        }
        .editor-pane {
            flex: 2;
            border-left: 2px solid #475569;
        }
        #editor-container {
            width: 100%;
            height: 100%;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="visualization-pane">
            <!-- Your original visualization here -->
            <div id="visualization-container">
                <svg id="visualization" width="1200" height="800">
                    <!-- SVG content -->
                </svg>
            </div>
            <button onclick="loadIntoEditor()">Load into Editor →</button>
        </div>
        
        <div class="editor-pane">
            <div id="editor-container"></div>
        </div>
    </div>
    
    <script type="module">
        import Editor from './node_modules/svgedit/dist/editor/Editor.js';
        
        const svgEditor = new Editor(document.getElementById('editor-container'));
        
        svgEditor.setConfig({
            // Configuration options
        });
        
        svgEditor.init();
        
        // Make editor accessible globally
        window.svgEditor = svgEditor;
        
        window.loadIntoEditor = function() {
            const svg = document.getElementById('visualization');
            const svgString = new XMLSerializer().serializeToString(svg);
            svgEditor.loadFromString(svgString);
        }
    </script>
</body>
</html>
```

## Key Features Available in SVG-Edit

- **Drawing Tools**: Rectangle, circle, ellipse, line, polyline, path, text
- **Selection and Transformation**: Move, resize, rotate, skew
- **Styling**: Fill color, stroke color, stroke width, opacity
- **Layers**: Create and manage multiple layers
- **Zoom and Pan**: Navigate large SVGs easily
- **Grid and Snapping**: Align elements precisely
- **Export**: Save as SVG, PNG, or other formats

## Advanced Integration Options

### 1. Custom Extensions

Create custom tools or functionality:

```javascript
svgEditor.setConfig({
    userExtensions: ['./my-custom-extension.js']
});
```

### 2. Programmatic Control

```javascript
// Get the current SVG
const svgString = svgEditor.getCanvas().getSvgString();

// Load new SVG
svgEditor.loadFromString(newSvgContent);

// Access the canvas API
const canvas = svgEditor.getCanvas();
canvas.setZoom(2); // 200% zoom
canvas.setFillColor('#ff0000');
```

### 3. Event Handling

```javascript
// Listen for changes
svgEditor.getCanvas().bind('changed', function(window, elems) {
    console.log('SVG changed', elems);
});
```

## Implementation Steps

1. **Install SVG-Edit**: `npm install svgedit`
2. **Copy the template files** to your project
3. **Update paths** to match your project structure
4. **Test** with your generated SVGs
5. **Customize** the configuration as needed

## Benefits

- **Visual Editing**: Drag, resize, and modify shapes directly
- **No External Dependencies**: Runs entirely in the browser
- **Export Options**: Save edited SVGs in various formats
- **Extensible**: Add custom tools and functionality
- **Open Source**: Fully customizable to your needs

This integration gives you a powerful SVG editor that works seamlessly with your visualization generation workflow!