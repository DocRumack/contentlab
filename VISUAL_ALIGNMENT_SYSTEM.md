# Visual Alignment System - Complete Implementation Guide

## Overview
This system creates perfectly aligned step-by-step algebraic equation solving using LaTeX formatting with automated visual verification. The system achieves precise place value alignment (ones under ones, tens under tens) for any algebraic equation.

## Critical Requirements
1. **LaTeX Format**: Use `\begin{array}{cccc}` and `\end{array}` (KaTeX-compatible, NOT `\align`)
2. **Input Format**: Semicolon-separated: `"equation1;operation1;equation2;operation2;equation3"`
3. **Place Value Alignment**: Measure from RIGHTMOST character positions for proper alignment
4. **Universal Solution**: Must work for ALL algebra, not just simple linear equations

## Core Technical Architecture

### 1. Visual Alignment Analyzer (`src/api/visual-alignment-analyzer.js`)
The main system that:
- Renders equations using Puppeteer and KaTeX
- Takes screenshots for visual analysis
- Uses Jimp for pixel-level alignment detection
- Iteratively adjusts spacing until perfect alignment achieved

### 2. Adaptive Block Detector (`src/api/adaptive-block-detector.js`)
Handles complex algebraic expressions by:
- Analyzing gap distribution to find natural boundaries
- Small gaps (2-3px) = within a number/term
- Large gaps (15-20px) = between separate elements
- Adapts threshold based on content complexity

## Key Technical Discoveries

### 1. The `-0.8em` Universal Rule
**CRITICAL**: After extensive testing, `-0.8em` spacing works for ALL addition/subtraction operations regardless of digit count:
```javascript
// For addition/subtraction operations
leftOp = -0.8;  // Universal left spacing for all operations

// Right side varies by operation length
rightOp = -0.1 - (opLength * 0.2);
// 2 chars (like -4): -0.5em
// 3 chars (like -12): -0.7em
// 4 chars (like -100): -0.9em
// 5 chars (like +2500): -1.1em
```

### 2. Block Detection Algorithm
The system MUST detect complete number blocks, not individual characters:
```javascript
findContentBlocks(image, row, width) {
  const blocks = [];
  let inBlock = false;
  let blockStart = 0;
  let blockEnd = 0;
  let gapSize = 0;

  // Critical: Use adaptive threshold, not fixed 15px
  const MIN_GAP_FOR_NEW_BLOCK = this.analyzeGapDistribution(gaps);

  for (let x = 0; x < width; x++) {
    let hasContent = false;

    for (let y = row.top; y <= row.bottom; y++) {
      const pixel = this.getPixel(image, x, y);
      if (pixel.r < 128) { // Dark pixel
        hasContent = true;
        break;
      }
    }

    if (hasContent) {
      if (!inBlock) {
        inBlock = true;
        blockStart = x;
      }
      blockEnd = x;
      gapSize = 0;
    } else {
      gapSize++;
      if (inBlock && gapSize >= MIN_GAP_FOR_NEW_BLOCK) {
        blocks.push({
          start: blockStart,
          end: blockEnd,
          width: blockEnd - blockStart + 1
        });
        inBlock = false;
      }
    }
  }

  // Don't forget the last block
  if (inBlock) {
    blocks.push({
      start: blockStart,
      end: blockEnd,
      width: blockEnd - blockStart + 1
    });
  }

  return blocks;
}
```

### 3. Measurement from Rightmost Position
**CRITICAL**: Always measure alignment from the END position of blocks for place value alignment:
```javascript
// CORRECT: Compare end positions for place value alignment
const targetEnd = targetBlock.end;
const opEnd = leftOpBlock.end;
leftMisalign = opEnd - targetEnd;

// WRONG: Don't use start positions or leftmost alignment
// This would misalign place values
```

### 4. LaTeX Array Structure
The array format with proper column alignment:
```latex
\begin{array}{cccc}
100x&-&2500&=\hspace{0.4em}&7500 \\[0.5em]
&&\hspace{-0.8em}+2500& &\hspace{-1.1em}+2500 \\[0.5em]
\hline
\\
&&100x &=\hspace{0.4em}& \hspace{0em}10000
\end{array}
```

Key points:
- Column 1: First term (like `100x`)
- Column 2: Operator (like `-`)
- Column 3: Second term (like `2500`) AND operations
- Column 4: Equals sign with spacing
- Column 5: Right side values

### 5. Division Operation Special Handling
Division uses a different format with underlines:
```latex
\begin{array}{crcl}
100x &=& 10000 \\[-0.5em]
\underline{\phantom{xxxxx}} && \hspace{-0.1em}\underline{\phantom{xxxxxxx}} \\[0.5em]
\hspace{0.1em}100 && 100 \\[2em]
x &=& \hspace{0em}100
\end{array}
```

The phantom width is dynamically calculated based on content length.

## Common Pitfalls and Solutions

### Problem 1: Detecting Individual Characters Instead of Numbers
**Symptom**: Algorithm sees "2", "5", "0", "0" instead of "2500"
**Solution**: Use gap-based detection with appropriate threshold (15-20px between terms)

### Problem 2: Algorithm "Fixing" Correct Alignment
**Symptom**: `-0.8em` works perfectly but algorithm tries to change it
**Solution**: Measure from rightmost positions and use proper block detection

### Problem 3: Clamp Limits Too Restrictive
**Symptom**: Can't achieve proper spacing because of [-2, 0] limits
**Solution**: Expand range to [-3, +2] for left/right operations

### Problem 4: Fixed Gap Threshold
**Symptom**: Works for simple equations but fails on complex expressions
**Solution**: Implement adaptive gap detection based on content analysis

## Testing Approach

### Visual Verification Loop
1. Generate LaTeX with initial spacing
2. Render in browser with KaTeX
3. Take screenshot with Puppeteer
4. Analyze alignment with Jimp
5. Adjust spacing based on pixel misalignment
6. Repeat until alignment < 1px threshold

### Test Coverage
The system must handle:
- Simple linear equations: `2x+4=10`
- Large numbers: `100x-2500=7500`
- Parentheses: `2(x+3)=14`
- Complex parentheses: `3(2x-5)=21`
- Fractions: `x/4+3=7`
- Exponents: `x^2=25`
- Mixed operations: `5x+10=2x+25`
- Negative coefficients: `-3x+12=6`

## Implementation Checklist

When implementing from scratch:

1. **Set up Visual Analyzer**
   - [ ] Puppeteer for browser automation
   - [ ] Jimp for image analysis
   - [ ] Screenshot directory structure

2. **Implement Block Detection**
   - [ ] Gap analysis algorithm
   - [ ] Adaptive threshold calculation
   - [ ] Complete number/term detection

3. **Configure Spacing Rules**
   - [ ] `-0.8em` for left operations
   - [ ] Variable right spacing based on length
   - [ ] Special handling for division

4. **Measurement System**
   - [ ] Find text rows in image
   - [ ] Detect content blocks per row
   - [ ] Measure from rightmost positions
   - [ ] Calculate misalignment in pixels

5. **Iterative Adjustment**
   - [ ] Convert pixel error to em adjustment (0.05em ≈ 1px)
   - [ ] Apply adjustments to spacing
   - [ ] Detect stuck loops (same score 3+ times)
   - [ ] Stop at < 1px misalignment

## File Structure
```
src/
├── api/
│   ├── visual-alignment-analyzer.js  # Main alignment system
│   └── adaptive-block-detector.js    # Complex expression handler
├── tests/
│   └── test-adaptive-alignment.js    # Comprehensive test suite
```

## Key Code Patterns

### Generating Aligned LaTeX
```javascript
// Operation placement depends on target term
if (operationTarget.targetTerm === 'term1') {
  // Operating on term1 - operation goes under first column
  latex += `\\hspace{${spacing.leftOp}em}${operation}&&&`;
  latex += ` &\\hspace{${spacing.rightOp}em}${operation}`;
} else {
  // Operating on term2 - operation goes in third column
  latex += `&&\\hspace{${spacing.leftOp}em}${operation}& `;
  latex += `&\\hspace{${spacing.rightOp}em}${operation}`;
}
```

### Pixel to Em Conversion
```javascript
const pixelToEm = 0.05;  // Each em is roughly 16-24 pixels
const adjustment = -misalignment * pixelToEm;
```

### Identifying Operation Target
```javascript
// The operation value tells us which term is being cancelled
const opValue = operation.substring(1); // Remove sign
if (eq1Parts.terms.term2?.value === opValue) {
  return { targetTerm: 'term2', leftAlignsWith: 'term2' };
}
```

## Success Criteria
- Achieves 0px misalignment for addition/subtraction
- Handles complex algebraic expressions with parentheses
- Adapts to varying number sizes (1 to 5+ digits)
- Works with all standard algebraic operations
- Provides visual verification screenshots

## Remember
1. **NEVER** hardcode spacing values without understanding why
2. **ALWAYS** measure from rightmost positions for place value alignment
3. **ALWAYS** detect complete blocks, not individual characters
4. The `-0.8em` rule is universal for left operations
5. Visual verification is essential - the algorithm confirms what looks right

This system is the result of extensive iteration and testing. The key insight is that place value alignment requires measuring from the rightmost character of each term, and the array column structure handles most of the heavy lifting with minimal spacing adjustments needed.