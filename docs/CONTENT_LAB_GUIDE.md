# Content Lab Guide

## Overview

Content Lab is a unified interface for creating and testing educational content that will be displayed in TestConstructor001. It provides a complete content creation, preview, and testing environment with production-accurate rendering.

## Why Content Lab Exists

1. **Accurate Preview**: See exactly how content will look in TestConstructor before deploying
2. **Rapid Iteration**: Test content across multiple containers and viewports instantly
3. **Tool Development**: Build visual tools for complex content creation (LaTeX alignment, graphs, etc.)
4. **Automation Support**: Enable Claude Code and other tools to create content programmatically
5. **Pattern Library**: Save and reuse successful content patterns

## Architecture

### Core System
Content Lab uses the exact same rendering system as TestConstructor001 to ensure pixel-perfect accuracy:

```
ContentLab
├── ContentRenderer (copied from TestConstructor)
│   ├── Text rendering
│   ├── Math rendering (KaTeX)
│   ├── HTML rendering
│   └── Special format rendering
├── Container Emulation
│   ├── ProblemSolver
│   ├── LessonDescription
│   ├── PreviewBox
│   ├── ReviewBox
│   └── ToolsContainer
└── Preview System
    ├── Single viewport
    ├── Overlay mode
    └── Grid view
```

### Technology Stack
- **React 18**: Component framework
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Styling
- **KaTeX**: Math rendering
- **Prism**: Code syntax highlighting
- **JavaScript/JSX**: Implementation language

## Container Types

### ProblemSolver Container
- **Purpose**: Step-by-step problem solving
- **Dimensions**: 800x600px (desktop), scales down for smaller viewports
- **Best for**: Mathematical solutions, worked examples
- **Styling**: Clean, focused, educational

### LessonDescription Container
- **Purpose**: Educational content with mixed formats
- **Dimensions**: 900x700px (desktop)
- **Best for**: Lessons, explanations, theory
- **Styling**: Readable, structured, sectioned

### PreviewBox Container
- **Purpose**: Quick preview with high contrast
- **Dimensions**: 600x400px (desktop)
- **Best for**: Formulas, key concepts, definitions
- **Styling**: White text on dark background

### ReviewBox Container
- **Purpose**: Review and summary content
- **Dimensions**: 700x500px (desktop)
- **Best for**: Quick reviews, practice problems, summaries
- **Styling**: Compact, scrollable

### ToolsContainer
- **Purpose**: Interactive tool content
- **Dimensions**: 800x600px (desktop)
- **Best for**: Graphs, diagrams, interactive elements
- **Styling**: Flexible, tool-dependent

## Content Format Reference

### Basic Content Types

#### Text Content
```json
{
  "type": "text",
  "content": "Plain text or text with $inline math$"
}
```

#### Formula Content
```json
{
  "type": "formula",
  "content": "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}"
}
```

#### HTML Content
```json
{
  "type": "html",
  "content": "<p>HTML with <strong>formatting</strong></p>"
}
```

### Structural Elements

#### Headings
```json
{
  "type": "h2",  // h1, h2, h3, or h4
  "content": "Section Title"
}
```

#### Lists
```json
{
  "type": "list",
  "style": "bullet",  // or "numbered"
  "items": ["First item", "Second item"],
  "indent": 0  // 0, 1, or 2 for nesting
}
```

#### Separator
```json
{
  "type": "separator"
}
```

### Special Formats

#### Key Content (Highlighted)
```json
{
  "type": "kc",
  "content": "Important answer or key point"
}
```

#### Definition
```json
{
  "type": "def",
  "content": "A formal definition"
}
```

#### Note
```json
{
  "type": "note",
  "content": "Additional information"
}
```

#### Warning
```json
{
  "type": "warning",
  "content": "Important warning or caution"
}
```

#### Example
```json
{
  "type": "example",
  "content": "An illustrative example"
}
```

### Interactive Elements

#### Tool Button
```json
{
  "type": "tool",
  "tool": "calculator",
  "label": "Open Calculator",
  "action": "openCalc()"
}
```

#### Table
```json
{
  "type": "table",
  "headers": ["Column 1", "Column 2"],
  "rows": [
    ["Row 1, Col 1", "Row 1, Col 2"],
    ["Row 2, Col 1", "Row 2, Col 2"]
  ],
  "caption": "Table caption"
}
```

## Visual Tools (Planned)

### Current Tools
- JSON Editor with syntax highlighting
- Live preview
- Container switcher
- Viewport switcher
- Overlay/Grid modes

### Planned Tools
1. **LaTeX Alignment Tool**: Visual equation alignment
2. **Bracket Tool**: Auto-bracket placement
3. **Graph Tool**: Coordinate plane creation
4. **Number Line Tool**: Interactive number lines
5. **Triangle Tool**: Geometric constructions
6. **Pattern Library**: Save/load content patterns

## Workflow

### Basic Content Creation
1. Open Content Lab (`npm run dev` in `/code/contentlab`)
2. Enter content in JSON format in the editor
3. Select container type for preview
4. Test across viewports
5. Export JSON for use in TestConstructor

### Responsive Testing
1. Create or load content
2. Select a container
3. Use viewport switcher to test each size
4. Or use Overlay mode to see all at once
5. Or use Grid view for side-by-side comparison

### Pattern Development
1. Create successful content
2. Test in all containers
3. Save as pattern (coming soon)
4. Reuse in future content

## API Usage

Content Lab exposes a global API for automation:

```javascript
// Set content
window.ContentLabAPI.setContent([
  { type: "text", content: "Example" }
]);

// Change container
window.ContentLabAPI.setContainer("ProblemSolver");

// Change viewport
window.ContentLabAPI.setViewport("tablet");

// Capture screenshot
const screenshot = await window.ContentLabAPI.captureScreenshot();

// Validate content
const validation = window.ContentLabAPI.validateContent();
if (!validation.valid) {
  console.log(validation.errors);
}
```

See `API_REFERENCE.md` for complete API documentation.

## Integration with TestConstructor

### Shared Components
- ContentRenderer system
- Math rendering configuration
- Font scaling rules
- Container specifications

### Content Compatibility
- All content created in Content Lab works in TestConstructor
- JSON format is identical
- Rendering is pixel-perfect match
- Container dimensions are exact

### Workflow Integration
1. Create content in Content Lab
2. Test and refine
3. Export JSON
4. Import into TestConstructor content files
5. Deploy to production

## Tips and Best Practices

### Content Creation
- Start simple, add complexity
- Test in target container first
- Use separators to break up content
- Highlight answers with `kc` type
- Use appropriate heading levels

### Math Content
- Use `$` for inline math
- Use `$$` or formula type for display math
- Escape backslashes in JSON
- Test complex equations carefully
- Use `\text{}` for text in formulas

### Responsive Design
- Test all viewports
- Check font scaling
- Verify math readability
- Ensure no horizontal overflow
- Test scrolling behavior

### Performance
- Keep content arrays reasonable (<100 items)
- Optimize complex math expressions
- Use efficient JSON structures
- Clear content between tests

## Troubleshooting

### Content Not Rendering
- Check JSON validity
- Verify content type is correct
- Look for unescaped characters
- Check browser console for errors

### Math Not Displaying
- Verify LaTeX syntax
- Check delimiter usage
- Escape backslashes in JSON
- Try simpler expression first

### Container Issues
- Ensure container type is valid
- Check viewport settings
- Verify dimensions are correct
- Clear cache if needed

### API Not Working
- Wait for ContentLabAPI to load
- Check browser console
- Verify method names
- Ensure proper async handling

## Getting Help

- **Component Locations**: See Serena `ContentLab_component_map` memory
- **API Reference**: See `docs/API_REFERENCE.md`
- **Testing Guide**: See `docs/TESTING_CHECKLIST.md`
- **Content Patterns**: See `docs/CONTENT_PATTERNS.md`
- **Tool Development**: See `docs/TOOL_DEVELOPMENT_PLAN.md`
