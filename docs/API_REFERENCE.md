# Content Lab API Reference

## Overview
Content Lab provides a global API object (`window.ContentLabAPI`) for programmatic control of content creation, rendering, and testing. This API is designed for automation tools like Claude Code, Puppeteer, and custom scripts.

---

## Global API Object

### Availability
```javascript
// The API is available after DOM content loads
document.addEventListener('DOMContentLoaded', () => {
  if (window.ContentLabAPI) {
    console.log('ContentLab API ready');
  }
});

// Or wait for it
async function waitForAPI() {
  while (!window.ContentLabAPI) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return window.ContentLabAPI;
}
```

---

## Content Management Methods

### setContent(content)
Sets the content to be rendered.

**Parameters:**
- `content` (Array): Array of content objects

**Returns:** void

**Example:**
```javascript
window.ContentLabAPI.setContent([
  { type: 'text', content: 'Hello World' },
  { type: 'formula', content: 'x^2 + y^2 = z^2' }
]);
```

### getContent()
Gets the current content array.

**Parameters:** None

**Returns:** Array - The current content

**Example:**
```javascript
const content = window.ContentLabAPI.getContent();
console.log('Current content:', content);
```

### clearContent()
Clears all content from the editor and preview.

**Parameters:** None

**Returns:** void

**Example:**
```javascript
window.ContentLabAPI.clearContent();
```

### validateContent()
Validates the current content for errors.

**Parameters:** None

**Returns:** Object
- `valid` (boolean): Whether content is valid
- `errors` (Array<string>): List of validation errors

**Example:**
```javascript
const validation = window.ContentLabAPI.validateContent();
if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}
```

---

## Container Methods

### setContainer(type)
Sets the active container for preview.

**Parameters:**
- `type` (string): Container type
  - `'ProblemSolver'`
  - `'LessonDescription'`
  - `'PreviewBox'`
  - `'ReviewBox'`
  - `'ToolsContainer'`

**Returns:** void

**Example:**
```javascript
window.ContentLabAPI.setContainer('ProblemSolver');
```

### getContainer()
Gets the current container type.

**Parameters:** None

**Returns:** string - Current container type

**Example:**
```javascript
const container = window.ContentLabAPI.getContainer();
console.log('Current container:', container);
```

---

## Viewport Methods

### setViewport(viewport)
Sets the active viewport for preview.

**Parameters:**
- `viewport` (string): Viewport size
  - `'desktop'` - 1920x1080
  - `'laptop'` - 1366x768
  - `'tablet'` - 768x1024
  - `'phone'` - 375x667

**Returns:** void

**Example:**
```javascript
window.ContentLabAPI.setViewport('tablet');
```

### getViewport()
Gets the current viewport.

**Parameters:** None

**Returns:** string - Current viewport

**Example:**
```javascript
const viewport = window.ContentLabAPI.getViewport();
console.log('Current viewport:', viewport);
```

---

## View Control Methods

### toggleOverlay()
Toggles overlay mode (all viewports simultaneously).

**Parameters:** None

**Returns:** void

**Example:**
```javascript
window.ContentLabAPI.toggleOverlay();
```

### toggleGrid()
Toggles grid view (2x2 viewport layout).

**Parameters:** None

**Returns:** void

**Example:**
```javascript
window.ContentLabAPI.toggleGrid();
```

### renderContent()
Forces a re-render of the current content.

**Parameters:** None

**Returns:** void

**Example:**
```javascript
window.ContentLabAPI.renderContent();
```

---

## Utility Methods

### captureScreenshot()
Captures a screenshot of the current preview.

**Parameters:** None

**Returns:** Promise<Blob> - Image blob of the screenshot

**Example:**
```javascript
async function saveScreenshot() {
  const blob = await window.ContentLabAPI.captureScreenshot();
  
  // Convert to data URL
  const reader = new FileReader();
  reader.onloadend = () => {
    const dataUrl = reader.result;
    console.log('Screenshot captured:', dataUrl);
  };
  reader.readAsDataURL(blob);
}
```

### measureContent()
Gets the dimensions of the rendered content.

**Parameters:** None

**Returns:** DOMRect
- `x` (number): X position
- `y` (number): Y position
- `width` (number): Width in pixels
- `height` (number): Height in pixels
- `top` (number): Top position
- `bottom` (number): Bottom position
- `left` (number): Left position
- `right` (number): Right position

**Example:**
```javascript
const dimensions = window.ContentLabAPI.measureContent();
console.log(`Content size: ${dimensions.width}x${dimensions.height}`);
```

### loadSampleContent(name)
Loads predefined sample content.

**Parameters:**
- `name` (string): Name of sample content
  - `'algebraSteps'`
  - `'geometryLesson'`
  - `'calculusReview'`
  - `'mixedContent'`

**Returns:** void

**Example:**
```javascript
window.ContentLabAPI.loadSampleContent('algebraSteps');
```

### exportContent()
Exports the current content as a JSON string.

**Parameters:** None

**Returns:** string - JSON string of content

**Example:**
```javascript
const json = window.ContentLabAPI.exportContent();
console.log('Exported content:', json);

// Save to file
const blob = new Blob([json], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'content.json';
a.click();
```

---

## Content Types Reference

### Text Content
```javascript
{
  type: 'text',
  content: 'Plain text or text with $inline math$'
}
```

### Formula Content
```javascript
{
  type: 'formula',
  content: '\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}'
}
```

### HTML Content
```javascript
{
  type: 'html',
  content: '<p>HTML <strong>content</strong></p>'
}
```

### Heading Content
```javascript
{
  type: 'h2',  // h1, h2, h3, or h4
  content: 'Section Title'
}
```

### List Content
```javascript
{
  type: 'list',
  items: ['Item 1', 'Item 2'],
  style: 'bullet',  // or 'numbered'
  indent: 0  // 0, 1, or 2
}
```

### Separator
```javascript
{
  type: 'separator'
}
```

### Special Formats
```javascript
// Key content (highlighted)
{ type: 'kc', content: 'Important point' }

// Definition
{ type: 'def', content: 'Term definition' }

// Note
{ type: 'note', content: 'Additional info' }

// Warning
{ type: 'warning', content: 'Caution message' }

// Example
{ type: 'example', content: 'Example text' }
```

### Tool Button
```javascript
{
  type: 'tool',
  tool: 'calculator',
  label: 'Open Calculator',
  action: 'openCalc()'
}
```

### Table
```javascript
{
  type: 'table',
  headers: ['Column 1', 'Column 2'],
  rows: [
    ['Row 1, Col 1', 'Row 1, Col 2'],
    ['Row 2, Col 1', 'Row 2, Col 2']
  ],
  caption: 'Table caption'
}
```

---

## Automation Examples

### Basic Content Test
```javascript
async function testContent() {
  const API = window.ContentLabAPI;
  
  // Set test content
  API.setContent([
    { type: 'h2', content: 'Test Heading' },
    { type: 'text', content: 'Test paragraph with $math$' },
    { type: 'formula', content: 'x = \\frac{-b}{2a}' }
  ]);
  
  // Test in all containers
  const containers = ['ProblemSolver', 'LessonDescription', 'PreviewBox', 'ReviewBox'];
  
  for (const container of containers) {
    API.setContainer(container);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const screenshot = await API.captureScreenshot();
    console.log(`Tested ${container}:`, screenshot);
  }
}
```

### Responsive Testing
```javascript
async function testResponsive(content) {
  const API = window.ContentLabAPI;
  const viewports = ['desktop', 'laptop', 'tablet', 'phone'];
  const results = {};
  
  API.setContent(content);
  
  for (const viewport of viewports) {
    API.setViewport(viewport);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const dimensions = API.measureContent();
    results[viewport] = {
      width: dimensions.width,
      height: dimensions.height,
      screenshot: await API.captureScreenshot()
    };
  }
  
  return results;
}
```

### Batch Processing
```javascript
async function processBatch(contentArray) {
  const API = window.ContentLabAPI;
  const results = [];
  
  for (const content of contentArray) {
    API.setContent(content);
    
    // Validate
    const validation = API.validateContent();
    if (!validation.valid) {
      results.push({
        content,
        error: validation.errors
      });
      continue;
    }
    
    // Process
    await new Promise(resolve => setTimeout(resolve, 100));
    
    results.push({
      content,
      dimensions: API.measureContent(),
      screenshot: await API.captureScreenshot()
    });
  }
  
  return results;
}
```

### Pattern Development
```javascript
async function developPattern() {
  const API = window.ContentLabAPI;
  
  // Start with base content
  let content = [
    { type: 'text', content: 'Solve for x:' },
    { type: 'formula', content: '2x + 3 = 7' }
  ];
  
  // Iterate and refine
  for (let i = 0; i < 5; i++) {
    API.setContent(content);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Capture and analyze
    const screenshot = await API.captureScreenshot();
    const dimensions = API.measureContent();
    
    // Refine based on analysis
    if (dimensions.height > 600) {
      // Content too tall, adjust
      content = content.slice(0, -1);
    }
    
    // Add more steps
    content.push({
      type: 'formula',
      content: `x = ${4 - i}`
    });
  }
  
  return content;
}
```

---

## Error Handling

### Common Errors

#### Invalid Content Type
```javascript
try {
  window.ContentLabAPI.setContent([
    { type: 'invalid', content: 'test' }
  ]);
} catch (error) {
  console.error('Invalid content type:', error);
}
```

#### Invalid Container
```javascript
try {
  window.ContentLabAPI.setContainer('InvalidContainer');
} catch (error) {
  console.error('Invalid container:', error);
}
```

#### API Not Ready
```javascript
if (!window.ContentLabAPI) {
  console.error('ContentLab API not loaded');
  return;
}
```

### Best Practices

1. **Always validate content before rendering**
```javascript
const validation = API.validateContent();
if (validation.valid) {
  API.renderContent();
}
```

2. **Wait for renders to complete**
```javascript
API.setContent(content);
await new Promise(resolve => setTimeout(resolve, 200));
```

3. **Handle async operations properly**
```javascript
async function workflow() {
  try {
    const screenshot = await API.captureScreenshot();
    // Process screenshot
  } catch (error) {
    console.error('Screenshot failed:', error);
  }
}
```

4. **Check API availability**
```javascript
async function ensureAPI() {
  while (!window.ContentLabAPI) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return window.ContentLabAPI;
}
```

5. **Clean up between tests**
```javascript
function resetState() {
  API.clearContent();
  API.setContainer('ProblemSolver');
  API.setViewport('desktop');
}
```

---

## Performance Considerations

### Rendering Delays
Always wait after content changes:
```javascript
API.setContent(content);
await new Promise(resolve => setTimeout(resolve, 200)); // Wait for render
```

### Large Content Arrays
For arrays with 100+ items:
```javascript
// Break into chunks
function processLargeContent(content) {
  const chunkSize = 50;
  for (let i = 0; i < content.length; i += chunkSize) {
    const chunk = content.slice(i, i + chunkSize);
    API.setContent(chunk);
    // Process chunk
  }
}
```

### Screenshot Performance
Screenshots can be memory-intensive:
```javascript
async function efficientScreenshots(count) {
  const screenshots = [];
  
  for (let i = 0; i < count; i++) {
    const blob = await API.captureScreenshot();
    
    // Process immediately instead of storing
    await processScreenshot(blob);
    
    // Release memory
    URL.revokeObjectURL(blob);
  }
}
```

---

## Integration Examples

### Puppeteer Integration
```javascript
const puppeteer = require('puppeteer');

async function runPuppeteerTests() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173');
  
  // Wait for API
  await page.waitForFunction(() => window.ContentLabAPI);
  
  // Run tests
  await page.evaluate(() => {
    window.ContentLabAPI.setContent([
      { type: 'text', content: 'Automated test' }
    ]);
  });
  
  // Capture result
  await page.screenshot({ path: 'test.png' });
  
  await browser.close();
}
```

### Claude Code Integration
```javascript
// For Claude Code automation
async function claudeCodeWorkflow() {
  const API = await ensureAPI();
  
  // Load content from Claude's analysis
  const content = [
    { type: 'h2', content: 'Solution' },
    { type: 'text', content: 'Step 1: ...' }
  ];
  
  API.setContent(content);
  API.setContainer('ProblemSolver');
  
  // Iterate based on visual feedback
  const screenshot = await API.captureScreenshot();
  // Claude analyzes screenshot
  
  // Refine content based on analysis
  content.push({ type: 'formula', content: 'x = 5' });
  API.setContent(content);
}
```

### CI/CD Integration
```javascript
// Jest test example
describe('ContentLab API', () => {
  beforeEach(async () => {
    await page.goto('http://localhost:5173');
    await page.waitForFunction(() => window.ContentLabAPI);
  });
  
  test('renders math content', async () => {
    await page.evaluate(() => {
      window.ContentLabAPI.setContent([
        { type: 'formula', content: 'E = mc^2' }
      ]);
    });
    
    const dimensions = await page.evaluate(() => {
      return window.ContentLabAPI.measureContent();
    });
    
    expect(dimensions.width).toBeGreaterThan(0);
    expect(dimensions.height).toBeGreaterThan(0);
  });
});
```

---

## Troubleshooting

### Issue: API methods return undefined
**Solution:** Ensure the API is loaded and methods are called correctly.

### Issue: Content doesn't update
**Solution:** Call `renderContent()` after setting content.

### Issue: Screenshot is blank
**Solution:** Wait longer for content to render, especially math.

### Issue: Validation always fails
**Solution:** Check content format matches the schema exactly.

### Issue: Memory leaks with screenshots
**Solution:** Release blob URLs after use.

---

## Future API Enhancements

### Planned Features
- WebSocket support for real-time updates
- Content diffing and version control
- PDF and image export
- Accessibility testing methods
- Performance profiling tools
- Batch operations endpoint
- Content templates system
- AI-powered content suggestions

### Experimental Features
These may change in future versions:
- `ContentLabAPI.experimental.animate()`
- `ContentLabAPI.experimental.compare()`
- `ContentLabAPI.experimental.suggest()`

---

## Support and Resources

- **Source Code:** `/src/api/ContentLabAPI.js`
- **Component Map:** Serena memory `ContentLab_component_map`
- **Documentation:** `/docs/` directory
- **Examples:** `/public/sample-content/`
- **Tests:** `/tests/api/` (coming soon)

For issues or questions, check the project documentation or create an issue in the repository.
