# Claude Code Automation Guide for ContentLab

## Overview

This guide explains how to use Claude Code to automate the generation and verification of number lines and coordinate graphs using the ContentLab API.

## Table of Contents

1. [Quick Start](#quick-start)
2. [API Reference](#api-reference)
3. [Workflow Pattern](#workflow-pattern)
4. [Computer Vision Implementation](#computer-vision-implementation)
5. [Size Selection Strategy](#size-selection-strategy)
6. [Error Handling](#error-handling)
7. [Example Use Cases](#example-use-cases)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Installation

```bash
# Install ContentLab dependencies
npm install

# Start ContentLab in headless mode
npm run headless
```

### Basic Usage

```javascript
const ContentLabAPI = require('./src/api/ContentLabAPI');

// Initialize API in headless mode
const api = new ContentLabAPI({ mode: 'headless' });

// Generate a number line
const result = await api.generateNumberLine(
  'interval[-2, 5]\npoint(0)',
  { min: -5, max: 8, size: 'medium' }
);

console.log(result.svg); // Generated SVG code
```

---

## API Reference

### Generation Methods

#### `generateNumberLine(commands, options)`

Generate a number line SVG from text commands.

**Parameters:**
- `commands` (string): Number line commands, one per line
  - `point(x)` - Closed point
  - `open(x)` - Open point
  - `interval[a, b]` or `interval(a, b)` - Interval notation
  - `x > value` - Inequality
  - `label(x, "text")` - Label
  - `[color:name]` - Color modifier (append to any command)

- `options` (object):
  - `min` (number): Minimum value (default: auto-calculated)
  - `max` (number): Maximum value (default: auto-calculated)
  - `size` (string): Size preset - 'small' (400px), 'medium' (580px), 'large' (800px), 'xlarge' (1000px)
  - `labelStep` (number): Step between labels (default: 1)
  - `showLabels` (boolean): Show numeric labels (default: true)

**Returns:**
```javascript
{
  success: true,
  svg: "<svg>...</svg>",
  metadata: {
    type: 'number-line',
    lineData: {...},
    options: {...},
    timestamp: "2025-01-01T00:00:00Z"
  }
}
```

**Example:**
```javascript
const result = await api.generateNumberLine(
  `interval[-2, 5)
point(0) [color:blue]
label(0, "Origin")`,
  { min: -5, max: 8, size: 'medium' }
);
```

#### `generateGraph(commands, options)`

Generate a coordinate graph SVG from text commands.

**Parameters:**
- `commands` (string): Graph commands, one per line
  - `point(x, y)` - Plot a point
  - `line y = mx + b` - Linear function
  - `f(x) = expression` - General function
  - `shade x > value` or `shade y < value` - Shaded region
  - `label(x, y, "text")` - Label
  - `[color:name]` - Color modifier

- `options` (object):
  - `xMin` (number): X-axis minimum (default: -10)
  - `xMax` (number): X-axis maximum (default: 10)
  - `yMin` (number): Y-axis minimum (default: -10)
  - `yMax` (number): Y-axis maximum (default: 10)
  - `size` (string): Size preset - 'small' (300x300), 'medium' (400x400), 'large' (600x600), 'xlarge' (800x800)
  - `showGrid` (boolean): Show grid lines (default: true)
  - `showAxes` (boolean): Show axes (default: true)
  - `originQuadrant` (string): Origin position - 'center', 'bottomLeft', etc.

**Returns:**
```javascript
{
  success: true,
  svg: "<svg>...</svg>",
  metadata: {
    type: 'graph',
    graphData: {...},
    options: {...},
    timestamp: "2025-01-01T00:00:00Z"
  }
}
```

**Example:**
```javascript
const result = await api.generateGraph(
  `line y = 2x + 3
point(0, 3) [color:red]
label(0, 3, "Y-intercept")`,
  { xMin: -5, xMax: 5, yMin: -5, yMax: 10, size: 'medium' }
);
```

### Verification Method

#### `verifyVisual(type, screenshotData, verificationRules)`

Verify visual correctness using computer vision.

**Parameters:**
- `type` (string): 'number-line' or 'graph'
- `screenshotData` (string): Base64 screenshot data or file path
- `verificationRules` (object): Optional custom rules (uses defaults if not provided)

**Returns:**
```javascript
{
  success: true,
  results: {
    passed: true,
    checks: {
      intervalPosition: true,
      circleTypes: true,
      spacing: true,
      // ... more checks
    },
    errors: [],
    timestamp: "2025-01-01T00:00:00Z"
  }
}
```

**Default Verification Rules:**

**For Number Lines:**
- `checkIntervalPosition` - Intervals above main line
- `checkCircleTypes` - Open vs closed circles correct
- `checkSpacing` - 25px spacing between intervals
- `checkBounds` - No content cutoff
- `checkColors` - Colors applied correctly
- `checkReadability` - Readable at size

**For Graphs:**
- `checkFunctionAccuracy` - Functions pass through expected points
- `checkLineSlope` - Lines have correct slope/intercept
- `checkAxisLabels` - Axes labeled correctly
- `checkGridVisibility` - Grid visible but not cluttered
- `checkOriginLabel` - Origin positioned correctly
- `checkBounds` - No clipping outside viewBox
- `checkColors` - Colors applied correctly
- `checkReadability` - Readable at size

### Batch Processing

#### `batchGenerateAndVerify(items, batchOptions)`

Process multiple items with automatic retry logic.

**Parameters:**
- `items` (array): Array of items to process
  ```javascript
  [
    {
      type: 'number-line',
      commands: 'interval[-2, 5]',
      options: { min: -5, max: 8, size: 'medium' },
      verificationRules: {} // optional
    },
    // ... more items
  ]
  ```

- `batchOptions` (object):
  - `maxRetries` (number): Max retry attempts per item (default: 3)
  - `retryDelay` (number): Delay between retries in ms (default: 1000)
  - `captureScreenshots` (boolean): Capture screenshots for verification (default: true)
  - `saveResults` (boolean): Save results to JSON (default: true)
  - `outputDir` (string): Output directory (default: './output')

**Returns:**
```javascript
{
  total: 100,
  successful: 98,
  failed: 2,
  items: [
    {
      index: 0,
      type: 'number-line',
      commands: '...',
      attempts: 1,
      success: true,
      svg: '<svg>...</svg>',
      metadata: {...},
      verificationResults: {...},
      error: null
    },
    // ... all items
  ],
  errors: [
    {
      index: 42,
      type: 'graph',
      commands: '...',
      error: 'Verification failed after 3 attempts: ...',
      attempts: 3
    }
  ],
  timestamp: "2025-01-01T00:00:00Z"
}
```

---

## Workflow Pattern

### Recommended Pattern for Processing Content

```javascript
async function processMarkdownContent(markdownFile) {
  // Step 1: Parse markdown to extract visual content needs
  const items = parseMarkdownForVisuals(markdownFile);
  
  // Step 2: Process all items with batch API
  const results = await api.batchGenerateAndVerify(items, {
    maxRetries: 3,
    captureScreenshots: true,
    saveResults: true,
    outputDir: './output/batch-results'
  });
  
  // Step 3: Review results
  console.log(`Processed ${results.total} items`);
  console.log(`Successful: ${results.successful}`);
  console.log(`Failed: ${results.failed}`);
  
  // Step 4: Handle failures
  if (results.failed > 0) {
    for (const error of results.errors) {
      console.log(`Item ${error.index} failed: ${error.error}`);
      // Flag for human review or adjust parameters
    }
  }
  
  return results;
}

function parseMarkdownForVisuals(markdown) {
  const items = [];
  
  // Example: Look for number line patterns
  const numberLineRegex = /interval\[.*?\]/g;
  const matches = markdown.match(numberLineRegex);
  
  if (matches) {
    matches.forEach(match => {
      items.push({
        type: 'number-line',
        commands: match,
        options: { size: 'medium' }
      });
    });
  }
  
  // Example: Look for graph patterns
  const graphRegex = /line y = .*$/gm;
  // ... parse and add graph items
  
  return items;
}
```

---

## Computer Vision Implementation

The ContentLab API provides placeholder methods for computer vision checks. **Claude Code must implement these methods** using actual CV libraries or APIs.

### Recommended Approach

Use libraries like:
- **OpenCV** (via opencv4nodejs)
- **Tesseract.js** (for OCR of labels)
- **Puppeteer** (for pixel-perfect screenshot comparison)
- **Sharp** (for image processing)

### Example Implementation

```javascript
// In ContentLabAPI.js, replace placeholder methods:

async checkIntervalPosition(screenshotData) {
  const cv = require('opencv4nodejs');
  
  // Load screenshot
  const img = cv.imdecode(Buffer.from(screenshotData, 'base64'));
  
  // Detect horizontal lines (main number line)
  const lines = detectHorizontalLines(img);
  
  // Detect colored regions (intervals)
  const intervals = detectColoredRegions(img);
  
  // Check if intervals are positioned above main line
  const minMainLineY = Math.min(...lines.map(l => l.y));
  const maxIntervalY = Math.max(...intervals.map(i => i.y + i.height));
  
  const passed = maxIntervalY < minMainLineY - 5; // 5px buffer
  
  return { passed };
}

async checkCircleTypes(screenshotData) {
  // Detect circles in image
  // Analyze fill to determine open vs closed
  // Compare with expected circle types from commands
  
  return { passed: true };
}

// ... implement other check methods
```

### Tolerance Settings

When implementing checks, use these tolerances:

- **Position tolerance**: ±5 pixels
- **Color tolerance**: ±10 RGB values
- **Function accuracy**: ±0.1 units for coordinate checks
- **Text readability**: Minimum 12px font size

---

## Size Selection Strategy

Choose size presets based on content complexity:

### Number Lines

| Size | Width | Use When |
|------|-------|----------|
| small | 400px | Simple intervals, 1-2 elements |
| medium | 580px | Standard use, 3-5 elements |
| large | 800px | Multiple stacked intervals, complex labels |
| xlarge | 1000px | Dense content, many overlapping elements |

### Graphs

| Size | Dimensions | Use When |
|------|------------|----------|
| small | 300x300 | Simple lines, few points |
| medium | 400x400 | Standard use, 1-2 functions |
| large | 600x600 | Multiple functions, dense points |
| xlarge | 800x800 | Complex visualizations, detailed labels |

### Auto-Selection Logic

```javascript
function selectSize(type, commands) {
  const elementCount = commands.split('\n').length;
  
  if (type === 'number-line') {
    if (elementCount <= 2) return 'small';
    if (elementCount <= 5) return 'medium';
    if (elementCount <= 8) return 'large';
    return 'xlarge';
  }
  
  if (type === 'graph') {
    if (elementCount <= 2) return 'small';
    if (elementCount <= 4) return 'medium';
    if (elementCount <= 7) return 'large';
    return 'xlarge';
  }
}
```

---

## Error Handling

### Common Errors and Solutions

#### 1. Generation Failures

**Error:** "Invalid command syntax"
- **Solution:** Check command format, ensure proper spacing
- **Example:** `interval[-2,5]` → `interval[-2, 5]`

#### 2. Verification Failures

**Error:** "Content cutoff at edges"
- **Solution:** Increase bounds (min/max or xMin/xMax/yMin/yMax)
- **Auto-adjustment:** Batch API automatically adjusts on retry

**Error:** "Not readable at current size"
- **Solution:** Increase size preset
- **Auto-adjustment:** Batch API steps up size on retry

#### 3. Retry Strategy

The batch API automatically:
1. Retries up to 3 times (configurable)
2. Adjusts parameters based on error type
3. Waits 1 second between retries (configurable)

### Manual Retry

```javascript
async function generateWithRetry(api, type, commands, options, maxAttempts = 3) {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await api[`generate${type === 'number-line' ? 'NumberLine' : 'Graph'}`](
      commands,
      options
    );
    
    if (result.success) {
      // Verify
      const screenshot = await captureScreenshot(result.svg);
      const verification = await api.verifyVisual(type, screenshot);
      
      if (verification.results.passed) {
        return result;
      }
      
      // Adjust options based on errors
      options = adjustOptions(options, verification.results.errors);
    }
  }
  
  throw new Error(`Failed after ${maxAttempts} attempts`);
}
```

---

## Example Use Cases

### Use Case 1: Process Single Markdown File

```javascript
const fs = require('fs').promises;
const ContentLabAPI = require('./src/api/ContentLabAPI');

async function processSingleFile(inputFile, outputFile) {
  const api = new ContentLabAPI({ mode: 'headless' });
  
  // Read markdown
  const markdown = await fs.readFile(inputFile, 'utf8');
  
  // Extract inequality: -2 < x ≤ 5
  const commands = 'interval(-2, 5]';
  const options = { min: -5, max: 8, size: 'medium' };
  
  // Generate
  const result = await api.generateNumberLine(commands, options);
  
  if (!result.success) {
    throw new Error(`Generation failed: ${result.error}`);
  }
  
  // Verify
  const screenshot = await api.screenshot();
  const verification = await api.verifyVisual('number-line', screenshot);
  
  if (!verification.results.passed) {
    console.warn('Verification issues:', verification.results.errors);
  }
  
  // Save
  const output = {
    type: 'number-line',
    content: result.svg,
    commands,
    options,
    verified: verification.results.passed,
    verificationResults: verification.results
  };
  
  await fs.writeFile(outputFile, JSON.stringify(output, null, 2));
  console.log(`Saved to ${outputFile}`);
}
```

### Use Case 2: Batch Process 100 Files

```javascript
async function batchProcess100Files(inputDir, outputDir) {
  const api = new ContentLabAPI({ mode: 'headless' });
  
  // Read all markdown files
  const files = await fs.readdir(inputDir);
  const mdFiles = files.filter(f => f.endsWith('.md'));
  
  // Parse all files to extract visual needs
  const items = [];
  for (const file of mdFiles) {
    const content = await fs.readFile(path.join(inputDir, file), 'utf8');
    const parsed = parseMarkdownForVisuals(content);
    items.push(...parsed);
  }
  
  console.log(`Found ${items.length} visuals to generate`);
  
  // Process all items
  const results = await api.batchGenerateAndVerify(items, {
    maxRetries: 3,
    captureScreenshots: true,
    saveResults: true,
    outputDir
  });
  
  // Report
  console.log(`\n=== BATCH RESULTS ===`);
  console.log(`Total: ${results.total}`);
  console.log(`Successful: ${results.successful}`);
  console.log(`Failed: ${results.failed}`);
  
  if (results.failed > 0) {
    console.log(`\nFailed items requiring review:`);
    results.errors.forEach(e => {
      console.log(`  - Item ${e.index}: ${e.error}`);
    });
  }
  
  return results;
}
```

### Use Case 3: Generate from JSON Configuration

```javascript
const config = {
  items: [
    {
      type: 'number-line',
      commands: 'interval[-2, 5]\npoint(0)',
      options: { min: -5, max: 8, size: 'medium' }
    },
    {
      type: 'graph',
      commands: 'line y = 2x + 3\npoint(0, 3)',
      options: { xMin: -5, xMax: 5, yMin: -5, yMax: 10, size: 'medium' }
    }
  ]
};

async function processFromConfig(config) {
  const api = new ContentLabAPI({ mode: 'headless' });
  
  const results = await api.batchGenerateAndVerify(config.items, {
    maxRetries: 3,
    saveResults: true,
    outputDir: './output'
  });
  
  return results;
}
```

---

## Troubleshooting

### Issue: API not responding

**Check:**
1. ContentLab server is running
2. Headless mode initialized properly
3. Port not blocked by firewall

**Solution:**
```bash
npm run headless
# Verify server started on correct port
```

### Issue: Screenshots not capturing

**Check:**
1. Puppeteer installed correctly
2. Screenshot method implemented
3. Content loaded before screenshot

**Solution:**
```javascript
await api.loadContent(svg);
await api.waitForRender(500); // Wait for render
const screenshot = await api.screenshot();
```

### Issue: Verification always passing (placeholder methods)

**Action Required:**
Implement actual computer vision methods as described in [Computer Vision Implementation](#computer-vision-implementation).

### Issue: High failure rate in batch processing

**Check:**
1. Parameter ranges appropriate for content
2. Size preset adequate
3. Commands properly formatted

**Solution:**
- Review failed items in batch results
- Adjust default parameters
- Increase maxRetries if intermittent failures

---

## Output Format

### Successful Item JSON

```json
{
  "type": "number-line",
  "content": "<svg width=\"580\" height=\"85\">...</svg>",
  "commands": "interval(-2, 5]",
  "metadata": {
    "type": "number-line",
    "lineData": {
      "intervals": [[{-2, 5, "(-2, 5]"}]],
      "points": [],
      "openPoints": [],
      "labels": []
    },
    "options": {
      "min": -5,
      "max": 8,
      "size": "medium",
      "labelStep": 1,
      "showLabels": true
    },
    "timestamp": "2025-01-01T00:00:00Z"
  },
  "verificationResults": {
    "passed": true,
    "checks": {
      "intervalPosition": true,
      "circleTypes": true,
      "spacing": true,
      "bounds": true,
      "colors": true,
      "readability": true
    },
    "errors": [],
    "timestamp": "2025-01-01T00:00:00Z"
  }
}
```

### Batch Results JSON

```json
{
  "total": 100,
  "successful": 98,
  "failed": 2,
  "items": [
    {
      "index": 0,
      "type": "number-line",
      "commands": "interval[-2, 5]",
      "attempts": 1,
      "success": true,
      "svg": "<svg>...</svg>",
      "metadata": {...},
      "verificationResults": {...},
      "error": null
    }
  ],
  "errors": [
    {
      "index": 42,
      "type": "graph",
      "commands": "line y = 2x + 3",
      "error": "Verification failed: Line slope incorrect",
      "attempts": 3
    }
  ],
  "timestamp": "2025-01-01T00:00:00Z"
}
```

---

## Next Steps

1. **Implement Computer Vision Methods** - Replace placeholder methods with actual CV logic
2. **Test with Sample Data** - Run batch processing on test markdown files
3. **Tune Parameters** - Adjust default options and verification tolerances
4. **Scale Up** - Process production content files
5. **Monitor Results** - Review verification results and adjust as needed

---

## Support

For issues or questions:
- Check existing documentation in `/docs`
- Review ContentLabAPI source code
- Test with simple examples before batch processing
