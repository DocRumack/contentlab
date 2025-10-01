# Content Lab Automation Guide

## Overview
This guide explains how to automate Content Lab for efficient content creation, testing, and validation using various automation tools and techniques.

---

## Quick Start

### Basic Automation Script
```javascript
// Wait for Content Lab to load
async function initContentLab() {
  // Wait for API
  while (!window.ContentLabAPI) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('ContentLab ready for automation');
  
  // Basic test
  window.ContentLabAPI.setContent([
    { type: 'text', content: 'Automation test successful!' }
  ]);
  
  return window.ContentLabAPI;
}

// Run when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContentLab);
} else {
  initContentLab();
}
```

---

## Claude Code Integration

### Setup for Claude Code
```javascript
// Initialize for Claude Code session
async function setupForClaude() {
  const API = await initContentLab();
  
  // Set default configuration
  API.setContainer('ProblemSolver');
  API.setViewport('desktop');
  
  // Load sample for testing
  API.loadSampleContent('algebraSteps');
  
  // Enable overlay for comparison
  API.toggleOverlay();
  
  console.log('Ready for Claude Code automation');
  return API;
}
```

### Iteration Workflow
```javascript
// Claude Code iteration helper
async function iterateContent(initialContent, maxIterations = 10) {
  const API = window.ContentLabAPI;
  let content = initialContent;
  let iteration = 0;
  
  while (iteration < maxIterations) {
    // Set and render content
    API.setContent(content);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Capture current state
    const screenshot = await API.captureScreenshot();
    const dimensions = API.measureContent();
    
    console.log(`Iteration ${iteration + 1}:`, {
      dimensions: `${dimensions.width}x${dimensions.height}`,
      items: content.length
    });
    
    // Check if content meets criteria
    if (dimensions.height < 600 && dimensions.width < 800) {
      console.log('Content fits perfectly!');
      break;
    }
    
    // Adjust content based on dimensions
    if (dimensions.height > 600) {
      // Content too tall, might need to split
      console.log('Content too tall, adjusting...');
      // Modify content array
    }
    
    iteration++;
  }
  
  return {
    finalContent: content,
    iterations: iteration + 1,
    dimensions: API.measureContent()
  };
}
```

---

## Batch Content Processing

### Process Multiple Content Sets
```javascript
async function processBatch(contentArray) {
  const API = window.ContentLabAPI;
  const results = [];
  const containers = ['ProblemSolver', 'LessonDescription', 'PreviewBox', 'ReviewBox'];
  
  for (const content of contentArray) {
    // Validate first
    API.setContent(content);
    const validation = API.validateContent();
    
    if (!validation.valid) {
      results.push({
        content: content,
        status: 'failed',
        errors: validation.errors
      });
      continue;
    }
    
    // Test in each container
    const containerResults = {};
    for (const container of containers) {
      API.setContainer(container);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      containerResults[container] = {
        dimensions: API.measureContent(),
        screenshot: await API.captureScreenshot()
      };
    }
    
    results.push({
      content: content,
      status: 'success',
      containers: containerResults
    });
  }
  
  return results;
}
```

### Content Validation Pipeline
```javascript
async function validatePipeline(content) {
  const API = window.ContentLabAPI;
  const report = {
    content: content,
    validation: null,
    rendering: {},
    issues: []
  };
  
  // Step 1: Validate structure
  API.setContent(content);
  report.validation = API.validateContent();
  
  if (!report.validation.valid) {
    report.issues.push(...report.validation.errors);
    return report;
  }
  
  // Step 2: Test rendering
  const viewports = ['desktop', 'laptop', 'tablet', 'phone'];
  
  for (const viewport of viewports) {
    API.setViewport(viewport);
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const dimensions = API.measureContent();
    report.rendering[viewport] = dimensions;
    
    // Check for overflow
    if (viewport === 'phone' && dimensions.width > 375) {
      report.issues.push(`Content overflows on ${viewport}`);
    }
  }
  
  // Step 3: Check math rendering
  const hasMath = content.some(item => 
    item.type === 'formula' || 
    (item.content && item.content.includes('$'))
  );
  
  if (hasMath) {
    // Extra time for KaTeX
    await new Promise(resolve => setTimeout(resolve, 300));
    report.mathRendered = true;
  }
  
  report.status = report.issues.length === 0 ? 'passed' : 'failed';
  return report;
}
```

---

## Responsive Testing

### Test Across All Viewports
```javascript
async function responsiveTest(content) {
  const API = window.ContentLabAPI;
  const viewports = {
    desktop: { width: 1920, height: 1080, fontSize: 16 },
    laptop: { width: 1366, height: 768, fontSize: 14 },
    tablet: { width: 768, height: 1024, fontSize: 14 },
    phone: { width: 375, height: 667, fontSize: 12 }
  };
  
  const results = {};
  
  API.setContent(content);
  
  for (const [name, specs] of Object.entries(viewports)) {
    API.setViewport(name);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const dimensions = API.measureContent();
    const screenshot = await API.captureScreenshot();
    
    results[name] = {
      expected: specs,
      actual: dimensions,
      fits: dimensions.width <= specs.width && dimensions.height <= specs.height,
      screenshot: screenshot
    };
    
    console.log(`${name}: ${results[name].fits ? '✓' : '✗'} ${dimensions.width}x${dimensions.height}`);
  }
  
  return results;
}
```

### Overlay Mode Testing
```javascript
async function overlayTest(content) {
  const API = window.ContentLabAPI;
  
  // Enable overlay mode
  API.toggleOverlay();
  
  // Set content
  API.setContent(content);
  
  // Wait for all viewports to render
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Capture composite screenshot
  const screenshot = await API.captureScreenshot();
  
  console.log('Overlay test complete - all viewports captured');
  
  // Disable overlay
  API.toggleOverlay();
  
  return screenshot;
}
```

---

## Pattern Library Management

### Save Successful Patterns
```javascript
class PatternLibrary {
  constructor() {
    this.patterns = JSON.parse(localStorage.getItem('contentPatterns') || '[]');
  }
  
  async save(content, metadata) {
    const API = window.ContentLabAPI;
    
    // Set content for screenshot
    API.setContent(content);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const pattern = {
      id: this.generateId(),
      name: metadata.name,
      category: metadata.category || 'general',
      tags: metadata.tags || [],
      content: content,
      created: new Date().toISOString(),
      screenshot: await API.captureScreenshot(),
      usage: 0,
      rating: 0
    };
    
    this.patterns.push(pattern);
    this.persist();
    
    return pattern.id;
  }
  
  load(id) {
    const pattern = this.patterns.find(p => p.id === id);
    if (pattern) {
      window.ContentLabAPI.setContent(pattern.content);
      pattern.usage++;
      this.persist();
      return pattern;
    }
    return null;
  }
  
  search(query) {
    return this.patterns.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.tags.some(tag => tag.includes(query.toLowerCase()))
    );
  }
  
  getByCategory(category) {
    return this.patterns.filter(p => p.category === category);
  }
  
  generateId() {
    return 'pattern_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  persist() {
    localStorage.setItem('contentPatterns', JSON.stringify(this.patterns));
  }
}

// Usage
const library = new PatternLibrary();

// Save a pattern
await library.save(
  [
    { type: 'text', content: 'Quadratic Formula:' },
    { type: 'formula', content: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' }
  ],
  {
    name: 'Quadratic Formula',
    category: 'algebra',
    tags: ['quadratic', 'formula', 'solving']
  }
);
```

---

## Visual Regression Testing

### Screenshot Comparison
```javascript
class VisualTester {
  constructor() {
    this.baselines = new Map();
  }
  
  async captureBaseline(name, content, container = 'ProblemSolver') {
    const API = window.ContentLabAPI;
    
    API.setContent(content);
    API.setContainer(container);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const screenshot = await API.captureScreenshot();
    this.baselines.set(name, screenshot);
    
    return screenshot;
  }
  
  async compare(name, content, container = 'ProblemSolver') {
    const API = window.ContentLabAPI;
    
    if (!this.baselines.has(name)) {
      throw new Error(`No baseline for ${name}`);
    }
    
    API.setContent(content);
    API.setContainer(container);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const current = await API.captureScreenshot();
    const baseline = this.baselines.get(name);
    
    // Convert to base64 for comparison
    const currentBase64 = await this.blobToBase64(current);
    const baselineBase64 = await this.blobToBase64(baseline);
    
    const match = currentBase64 === baselineBase64;
    
    return {
      match: match,
      baseline: baseline,
      current: current,
      name: name
    };
  }
  
  async blobToBase64(blob) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }
}

// Usage
const tester = new VisualTester();

// Capture baseline
await tester.captureBaseline('algebra_steps', [
  { type: 'text', content: 'Solve: 2x + 3 = 7' },
  { type: 'formula', content: 'x = 2' }
]);

// Later, compare against baseline
const result = await tester.compare('algebra_steps', [
  { type: 'text', content: 'Solve: 2x + 3 = 7' },
  { type: 'formula', content: 'x = 2' }
]);

console.log(result.match ? 'Visual test passed' : 'Visual test failed');
```

---

## Performance Testing

### Measure Rendering Performance
```javascript
async function performanceTest(content, iterations = 100) {
  const API = window.ContentLabAPI;
  const metrics = {
    renderTimes: [],
    avgRenderTime: 0,
    minRenderTime: Infinity,
    maxRenderTime: 0,
    memoryUsage: []
  };
  
  for (let i = 0; i < iterations; i++) {
    // Clear content first
    API.clearContent();
    
    // Measure render time
    const startTime = performance.now();
    API.setContent(content);
    API.renderContent();
    await new Promise(resolve => requestAnimationFrame(resolve));
    const endTime = performance.now();
    
    const renderTime = endTime - startTime;
    metrics.renderTimes.push(renderTime);
    
    // Track memory if available
    if (performance.memory) {
      metrics.memoryUsage.push(performance.memory.usedJSHeapSize);
    }
    
    // Update min/max
    metrics.minRenderTime = Math.min(metrics.minRenderTime, renderTime);
    metrics.maxRenderTime = Math.max(metrics.maxRenderTime, renderTime);
  }
  
  // Calculate average
  metrics.avgRenderTime = metrics.renderTimes.reduce((a, b) => a + b, 0) / iterations;
  
  // Calculate median
  const sorted = [...metrics.renderTimes].sort((a, b) => a - b);
  metrics.medianRenderTime = sorted[Math.floor(iterations / 2)];
  
  console.log('Performance Test Results:', {
    average: `${metrics.avgRenderTime.toFixed(2)}ms`,
    median: `${metrics.medianRenderTime.toFixed(2)}ms`,
    min: `${metrics.minRenderTime.toFixed(2)}ms`,
    max: `${metrics.maxRenderTime.toFixed(2)}ms`
  });
  
  return metrics;
}
```

### Stress Testing
```javascript
async function stressTest() {
  const API = window.ContentLabAPI;
  const results = {};
  
  // Test 1: Large content array
  const largeContent = [];
  for (let i = 0; i < 500; i++) {
    largeContent.push({
      type: i % 2 === 0 ? 'text' : 'formula',
      content: i % 2 === 0 ? `Item ${i}` : `x_{${i}} = ${i}^2`
    });
  }
  
  const start1 = performance.now();
  API.setContent(largeContent);
  await new Promise(resolve => setTimeout(resolve, 1000));
  results.largeArray = performance.now() - start1;
  
  // Test 2: Complex math
  const complexMath = [
    {
      type: 'formula',
      content: '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}'
    },
    {
      type: 'formula',
      content: '\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}'
    },
    {
      type: 'formula',
      content: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}^{-1} = \\frac{1}{ad-bc} \\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix}'
    }
  ];
  
  const start2 = performance.now();
  API.setContent(complexMath);
  await new Promise(resolve => setTimeout(resolve, 500));
  results.complexMath = performance.now() - start2;
  
  // Test 3: Rapid updates
  const start3 = performance.now();
  for (let i = 0; i < 50; i++) {
    API.setContent([{ type: 'text', content: `Update ${i}` }]);
    await new Promise(resolve => requestAnimationFrame(resolve));
  }
  results.rapidUpdates = performance.now() - start3;
  
  console.log('Stress Test Results:', results);
  return results;
}
```

---

## Browser Automation

### Puppeteer Script
```javascript
const puppeteer = require('puppeteer');

async function runPuppeteerTests() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  // Navigate to Content Lab
  await page.goto('http://localhost:5173');
  
  // Wait for API to be available
  await page.waitForFunction(() => window.ContentLabAPI, { timeout: 5000 });
  
  // Run test suite
  const results = await page.evaluate(async () => {
    const API = window.ContentLabAPI;
    const results = [];
    
    // Test content
    const testContent = [
      { type: 'h2', content: 'Automated Test' },
      { type: 'text', content: 'Testing with Puppeteer' },
      { type: 'formula', content: 'E = mc^2' }
    ];
    
    // Test all containers
    const containers = ['ProblemSolver', 'LessonDescription', 'PreviewBox', 'ReviewBox'];
    
    for (const container of containers) {
      API.setContent(testContent);
      API.setContainer(container);
      
      // Wait for render
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const dimensions = API.measureContent();
      results.push({
        container: container,
        dimensions: dimensions
      });
    }
    
    return results;
  });
  
  console.log('Puppeteer test results:', results);
  
  // Take screenshots
  await page.screenshot({ path: 'puppeteer-test.png', fullPage: true });
  
  await browser.close();
}

// Run tests
runPuppeteerTests().catch(console.error);
```

### Playwright Script
```javascript
const { chromium } = require('playwright');

async function runPlaywrightTests() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Navigate to Content Lab
  await page.goto('http://localhost:5173');
  
  // Wait for API
  await page.waitForFunction(() => window.ContentLabAPI);
  
  // Test responsive viewports
  const viewports = [
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 }
  ];
  
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    
    await page.evaluate((vp) => {
      window.ContentLabAPI.setContent([
        { type: 'text', content: `Testing on ${vp.name}` }
      ]);
    }, viewport);
    
    await page.screenshot({ 
      path: `playwright-${viewport.name.toLowerCase()}.png` 
    });
  }
  
  await browser.close();
}

runPlaywrightTests().catch(console.error);
```

---

## CI/CD Integration

### GitHub Actions Workflow
```yaml
name: Content Lab Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm install
    
    - name: Start Content Lab
      run: |
        npm run dev &
        sleep 5
    
    - name: Run automated tests
      run: npm run test:automation
    
    - name: Upload screenshots
      uses: actions/upload-artifact@v2
      with:
        name: test-screenshots
        path: screenshots/
```

### Jest Test Suite
```javascript
// contentlab.test.js
describe('Content Lab API', () => {
  let page;
  
  beforeAll(async () => {
    await page.goto('http://localhost:5173');
    await page.waitForFunction(() => window.ContentLabAPI);
  });
  
  test('renders text content', async () => {
    const result = await page.evaluate(() => {
      window.ContentLabAPI.setContent([
        { type: 'text', content: 'Test content' }
      ]);
      return window.ContentLabAPI.getContent();
    });
    
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('text');
  });
  
  test('validates content correctly', async () => {
    const validation = await page.evaluate(() => {
      window.ContentLabAPI.setContent([
        { type: 'invalid', content: 'test' }
      ]);
      return window.ContentLabAPI.validateContent();
    });
    
    expect(validation.valid).toBe(false);
    expect(validation.errors).toHaveLength(1);
  });
  
  test('switches containers', async () => {
    const container = await page.evaluate(() => {
      window.ContentLabAPI.setContainer('ReviewBox');
      return window.ContentLabAPI.getContainer();
    });
    
    expect(container).toBe('ReviewBox');
  });
});
```

---

## Debugging and Troubleshooting

### Debug Helper Functions
```javascript
// Debug utility class
class ContentLabDebugger {
  constructor() {
    this.logs = [];
    this.API = window.ContentLabAPI;
  }
  
  log(message, data = null) {
    const entry = {
      timestamp: new Date().toISOString(),
      message: message,
      data: data
    };
    this.logs.push(entry);
    console.log(`[ContentLab Debug] ${message}`, data || '');
  }
  
  async diagnose() {
    this.log('Starting diagnosis');
    
    // Check API availability
    if (!this.API) {
      this.log('ERROR: ContentLabAPI not found');
      return;
    }
    
    // Test basic functionality
    try {
      // Test content setting
      this.API.setContent([{ type: 'text', content: 'Diagnostic test' }]);
      this.log('Content setting: OK');
      
      // Test validation
      const validation = this.API.validateContent();
      this.log('Validation:', validation);
      
      // Test container switching
      const containers = ['ProblemSolver', 'LessonDescription'];
      for (const container of containers) {
        this.API.setContainer(container);
        this.log(`Container ${container}: OK`);
      }
      
      // Test viewport switching
      const viewports = ['desktop', 'tablet'];
      for (const viewport of viewports) {
        this.API.setViewport(viewport);
        this.log(`Viewport ${viewport}: OK`);
      }
      
      // Test measurements
      const dimensions = this.API.measureContent();
      this.log('Dimensions:', dimensions);
      
    } catch (error) {
      this.log('ERROR during diagnosis:', error.message);
    }
    
    this.log('Diagnosis complete');
    return this.logs;
  }
  
  exportLogs() {
    const logText = this.logs.map(entry => 
      `[${entry.timestamp}] ${entry.message} ${entry.data ? JSON.stringify(entry.data) : ''}`
    ).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contentlab-debug.log';
    a.click();
  }
}

// Usage
const debugger = new ContentLabDebugger();
await debugger.diagnose();
debugger.exportLogs();
```

### Common Issues and Solutions

#### Issue: API not available
```javascript
// Solution: Wait for API to load
async function waitForAPI() {
  let attempts = 0;
  while (!window.ContentLabAPI && attempts < 50) {
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }
  if (!window.ContentLabAPI) {
    throw new Error('ContentLabAPI failed to load after 5 seconds');
  }
  return window.ContentLabAPI;
}
```

#### Issue: Content not rendering
```javascript
// Solution: Force render and wait
function forceRender(content) {
  const API = window.ContentLabAPI;
  API.clearContent();
  API.setContent(content);
  API.renderContent();
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      setTimeout(resolve, 100);
    });
  });
}
```

#### Issue: Screenshot is blank
```javascript
// Solution: Wait longer for complex content
async function safeScreenshot(waitTime = 500) {
  await new Promise(resolve => setTimeout(resolve, waitTime));
  return window.ContentLabAPI.captureScreenshot();
}
```

#### Issue: Memory leaks
```javascript
// Solution: Clean up properly
function cleanup() {
  const API = window.ContentLabAPI;
  API.clearContent();
  // Release any blob URLs
  if (window.screenshotURLs) {
    window.screenshotURLs.forEach(url => URL.revokeObjectURL(url));
    window.screenshotURLs = [];
  }
}
```

---

## Best Practices

### 1. Always Wait for Renders
```javascript
API.setContent(content);
await new Promise(resolve => setTimeout(resolve, 200));
```

### 2. Validate Before Processing
```javascript
const validation = API.validateContent();
if (!validation.valid) {
  console.error('Invalid content:', validation.errors);
  return;
}
```

### 3. Handle Errors Gracefully
```javascript
try {
  const screenshot = await API.captureScreenshot();
  // Process screenshot
} catch (error) {
  console.error('Screenshot failed:', error);
  // Fallback behavior
}
```

### 4. Clean Up Resources
```javascript
// After using screenshots
URL.revokeObjectURL(screenshotBlob);

// After batch processing
API.clearContent();
```

### 5. Use Appropriate Delays
```javascript
const delays = {
  simpleText: 100,
  withMath: 300,
  complexMath: 500,
  largeContent: 1000
};
```

### 6. Monitor Performance
```javascript
console.time('render');
API.setContent(content);
await new Promise(resolve => setTimeout(resolve, 200));
console.timeEnd('render');
```

---

## Advanced Techniques

### Content Generation Pipeline
```javascript
class ContentGenerator {
  constructor() {
    this.templates = new Map();
  }
  
  registerTemplate(name, template) {
    this.templates.set(name, template);
  }
  
  generate(templateName, data) {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }
    
    return template(data);
  }
  
  // Example template
  quadraticSolution(data) {
    const { a, b, c } = data;
    const discriminant = b * b - 4 * a * c;
    const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    
    return [
      { type: 'text', content: 'Solve the quadratic equation:' },
      { type: 'formula', content: `${a}x^2 + ${b}x + ${c} = 0` },
      { type: 'separator' },
      { type: 'text', content: 'Using the quadratic formula:' },
      { type: 'formula', content: `x = \\frac{-${b} \\pm \\sqrt{${b}^2 - 4(${a})(${c})}}{2(${a})}` },
      { type: 'formula', content: `x = \\frac{-${b} \\pm \\sqrt{${discriminant}}}{${2 * a}}` },
      { type: 'separator' },
      { type: 'kc', content: `Solutions: x = ${x1.toFixed(2)} or x = ${x2.toFixed(2)}` }
    ];
  }
}
```

### Automated Content Optimization
```javascript
async function optimizeContent(content, targetHeight = 600) {
  const API = window.ContentLabAPI;
  let optimized = [...content];
  
  // Initial measurement
  API.setContent(optimized);
  await new Promise(resolve => setTimeout(resolve, 200));
  let dimensions = API.measureContent();
  
  // If content is too tall, try to optimize
  if (dimensions.height > targetHeight) {
    // Try removing separators first
    optimized = optimized.filter(item => item.type !== 'separator');
    
    API.setContent(optimized);
    await new Promise(resolve => setTimeout(resolve, 200));
    dimensions = API.measureContent();
    
    // If still too tall, try condensing text
    if (dimensions.height > targetHeight) {
      optimized = optimized.map(item => {
        if (item.type === 'text' && item.content.length > 100) {
          return {
            ...item,
            content: item.content.substring(0, 80) + '...'
          };
        }
        return item;
      });
    }
  }
  
  return optimized;
}
```

---

## Resources and References

### Documentation
- API Reference: `/docs/API_REFERENCE.md`
- Content Patterns: `/docs/CONTENT_PATTERNS.md`
- Testing Guide: `/docs/TESTING_CHECKLIST.md`

### Code Locations
- API Implementation: `/src/api/ContentLabAPI.js`
- Main Component: `/src/components/Framework/ContentLab.jsx`
- Content Renderer: `/src/components/ContentSystem/ContentRenderer.jsx`

### External Tools
- [Puppeteer](https://pptr.dev/) - Browser automation
- [Playwright](https://playwright.dev/) - Cross-browser testing
- [Jest](https://jestjs.io/) - JavaScript testing
- [GitHub Actions](https://github.com/features/actions) - CI/CD

### Support
For issues or questions:
1. Check the troubleshooting section above
2. Review the API documentation
3. Check browser console for errors
4. Create an issue in the repository

---

## Summary

Content Lab automation enables:
- **Efficient content creation** through programmatic generation
- **Comprehensive testing** across containers and viewports
- **Quality assurance** through visual regression testing
- **Performance optimization** through automated measurements
- **CI/CD integration** for continuous validation

Use these automation techniques to create high-quality educational content efficiently and ensure it works perfectly in TestConstructor.
