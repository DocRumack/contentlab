# Claude Code Formula Beautification Guide

## Quick Start

```javascript
// Get the API
const api = window.ContentLabAPI;

// Single formula
const result = await api.beautifyFormula('x+2=5');
console.log(result.beautified); 
// Output: 'x\\hspace{0.2em}+\\hspace{0.2em}2\\hspace{0.25em}=\\hspace{0.25em}5'

// Batch processing
const formulas = ['x+2=5', '∫f(x)dx', '2x+4=10\\\\2x=6'];
const report = await api.beautifyBatch(formulas);
console.log(report);
```

## Features

### 1. Automatic Spacing
The system automatically adds proper spacing around:
- Binary operators (+, -, =, <, >, ≤, ≥, ±, ∓, ×, ÷)
- Differentials (dx, dy, dz, dt, dr)
- Trigonometric functions (sin, cos, tan, cot, sec, csc)
- Logarithmic functions (log, ln, lg)

### 2. Alignment for Multi-line Formulas
Detects and applies proper alignment for:
- Arithmetic steps
- Equation solving
- Matrix operations

### 3. Visual Verification
- Captures screenshots of rendered formulas
- Analyzes alignment quality
- Iteratively improves formatting

## Advanced Usage

### Custom Options for Batch Processing

```javascript
const options = {
  saveProgress: true,      // Save progress to localStorage
  parallel: false,          // Process sequentially (default)
  onProgress: (current, total, result) => {
    console.log(`Processing ${current}/${total}`);
    console.log('Result:', result);
  }
};

const report = await api.beautifyBatch(formulas, options);
```

### Working with Test Cases

```javascript
import { runTests, runSingleTest } from './tests/beautification-tests.js';

// Run all tests
const results = await runTests(api);

// Run a specific test
const testResult = await runSingleTest(api, 'Basic equation');
```

### Export Results

```javascript
const processor = api.batchProcessor;

// Export as JSON
const json = await processor.exportResults('json');

// Export as CSV
const csv = await processor.exportResults('csv');

// Export as Markdown
const markdown = await processor.exportResults('markdown');
```

## Pattern Library

The system includes pre-defined patterns for common formula types:

### Basic Equation
- Input: `x+2=5`
- Output: `x\hspace{0.2em}+\hspace{0.2em}2\hspace{0.25em}=\hspace{0.25em}5`

### Integral
- Input: `\int f(x)dx`
- Output: `\int f(x)\hspace{0.15em}dx`

### Algebraic Steps
- Input: `2x+4=10\\2x=6\\x=3`
- Output: Array-formatted with proper alignment

### Trigonometric Functions
- Input: `\sin x+\cos x`
- Output: `\sin\hspace{0.1em}x\hspace{0.2em}+\hspace{0.2em}\cos\hspace{0.1em}x`

## API Reference

### ContentLabAPI Methods

#### `beautifyFormula(latex)`
Process a single LaTeX formula with beautification.

**Parameters:**
- `latex` (string): The LaTeX formula to beautify

**Returns:**
- Object with:
  - `original`: Original formula
  - `beautified`: Beautified formula
  - `screenshot`: Screenshot of rendered formula
  - `iterations`: Number of improvement iterations

#### `beautifyBatch(formulas, options)`
Process multiple formulas in batch.

**Parameters:**
- `formulas` (array): Array of LaTeX formulas
- `options` (object): Processing options

**Returns:**
- Report object with statistics and results

### Helper Classes

#### `ClaudeCodeHelper`
Main helper class for formula processing.

#### `BatchProcessor`
Handles batch processing of multiple formulas.

#### `BeautificationEngine`
Core engine that applies beauty rules.

## Tips for Best Results

1. **Use standard LaTeX notation** - The system works best with properly formatted LaTeX
2. **Include line breaks for multi-line formulas** - Use `\\` for line breaks
3. **Test incrementally** - Start with simple formulas and gradually increase complexity
4. **Review visual output** - Always check the screenshot to verify alignment
5. **Iterate when needed** - The system can iteratively improve alignment

## Troubleshooting

### Common Issues

1. **Spacing not applied**
   - Check if the formula uses standard operators
   - Verify LaTeX syntax is correct

2. **Alignment issues**
   - Ensure line breaks are properly formatted
   - Check for missing or extra backslashes

3. **Visual verification fails**
   - Make sure ContentLab is running
   - Verify the container is properly configured

## Examples

### Complete Workflow Example

```javascript
// Initialize API
const api = window.ContentLabAPI;

// Define formulas
const formulas = [
  'x+2=5',
  '\\int_0^1 f(x)dx',
  '2x+4=10\\\\2x=6\\\\x=3',
  '\\sin x + \\cos x = 1'
];

// Process with progress tracking
const report = await api.beautifyBatch(formulas, {
  onProgress: (i, total, result) => {
    console.log(`[${i}/${total}] Processed:`, result.original);
    console.log('Beautified:', result.beautified);
    console.log('Iterations:', result.iterations);
    console.log('---');
  }
});

// Display summary
console.log('Processing Complete!');
console.log(`Total: ${report.total}`);
console.log(`Successful: ${report.successful}`);
console.log(`Failed: ${report.failed}`);
console.log(`Average iterations: ${report.averageIterations}`);

// Export results
const markdown = await api.batchProcessor.exportResults('markdown');
console.log(markdown);
```

## Next Steps

1. Start with simple formulas to understand the beautification process
2. Build a library of formula patterns
3. Customize rules for specific use cases
4. Contribute improvements to the beauty rules engine

For more information about ContentLab, see the main documentation in `CONTENT_LAB_GUIDE.md`.