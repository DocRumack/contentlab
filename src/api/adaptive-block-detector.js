// Adaptive block detection for complex algebraic expressions
export class AdaptiveBlockDetector {
  constructor() {
    // Base gap thresholds
    this.MIN_INTRA_CHAR_GAP = 5;   // Max gap within a character/digit
    this.MIN_INTER_TERM_GAP = 12;  // Min gap between separate terms
    this.ADAPTIVE_THRESHOLD = 10;  // Middle ground for adaptive detection
  }

  // Analyze gap distribution to find natural boundaries
  analyzeGapDistribution(gapSizes) {
    if (gapSizes.length === 0) return this.ADAPTIVE_THRESHOLD;

    // Sort gaps to find patterns
    const sorted = [...gapSizes].sort((a, b) => a - b);

    // Look for clustering - small gaps (within terms) vs large gaps (between terms)
    const median = sorted[Math.floor(sorted.length / 2)];
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];

    // If there's a clear separation in gap sizes
    if (q3 > q1 * 2) {
      // Use the median as the threshold
      return Math.max(this.MIN_INTRA_CHAR_GAP, Math.min(median * 1.5, this.MIN_INTER_TERM_GAP));
    }

    // Default to adaptive threshold
    return this.ADAPTIVE_THRESHOLD;
  }

  // Detect blocks with context awareness
  detectBlocks(image, row, width, context = {}) {
    const blocks = [];
    const gaps = [];
    let inBlock = false;
    let blockStart = 0;
    let blockEnd = 0;
    let currentGap = 0;
    let lastContentX = -1;

    // First pass: collect gap statistics
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
        if (lastContentX >= 0 && x - lastContentX > 1) {
          gaps.push(x - lastContentX - 1);
        }
        lastContentX = x;
      }
    }

    // Determine adaptive threshold based on gap distribution
    const gapThreshold = this.analyzeGapDistribution(gaps);
    console.log(`      Adaptive gap threshold: ${gapThreshold}px (gaps: ${gaps.join(', ')})`);

    // Second pass: detect blocks using adaptive threshold
    inBlock = false;
    currentGap = 0;

    for (let x = 0; x < width; x++) {
      let hasContent = false;

      for (let y = row.top; y <= row.bottom; y++) {
        const pixel = this.getPixel(image, x, y);
        if (pixel.r < 128) {
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
        currentGap = 0;
      } else {
        currentGap++;
        if (inBlock && currentGap >= gapThreshold) {
          // Special handling for certain patterns
          const blockContent = this.analyzeBlockContent(image, row, blockStart, blockEnd);

          blocks.push({
            start: blockStart,
            end: blockEnd,
            width: blockEnd - blockStart + 1,
            type: blockContent.type,
            content: blockContent.content
          });

          inBlock = false;
        }
      }
    }

    // Don't forget the last block
    if (inBlock) {
      const blockContent = this.analyzeBlockContent(image, row, blockStart, blockEnd);
      blocks.push({
        start: blockStart,
        end: blockEnd,
        width: blockEnd - blockStart + 1,
        type: blockContent.type,
        content: blockContent.content
      });
    }

    return blocks;
  }

  // Analyze what type of content is in a block
  analyzeBlockContent(image, row, startX, endX) {
    const width = endX - startX + 1;

    // Heuristics for content type
    if (width < 15) {
      // Likely a single character, operator, or small number
      return { type: 'symbol', content: 'unknown' };
    } else if (width < 30) {
      // Could be a small term like "2x" or a number
      return { type: 'term', content: 'unknown' };
    } else {
      // Larger expression, possibly with operators
      return { type: 'expression', content: 'unknown' };
    }
  }

  // Helper to get pixel with proper color extraction
  getPixel(image, x, y) {
    const color = image.getPixelColor(x, y);
    return {
      r: (color >> 24) & 0xff,
      g: (color >> 16) & 0xff,
      b: (color >> 8) & 0xff,
      a: color & 0xff
    };
  }

  // Handle complex expressions with parentheses, exponents, etc.
  parseComplexExpression(blocks, equation) {
    // This would need to understand:
    // 1. Parentheses grouping: (x+2)
    // 2. Exponents: x^2 or x²
    // 3. Fractions: displayed vertically or inline
    // 4. Nested expressions: 2x(x^2-4)
    // 5. Functions: sin(x), log(x)
    // 6. Radicals: √(x+1)

    const parsed = {
      terms: [],
      operators: [],
      groups: []
    };

    // For now, return a basic structure
    // This would need significant expansion for full algebra support
    return parsed;
  }

  // Determine alignment rules for different expression types
  getAlignmentRules(expressionType, operation) {
    const rules = {
      // Simple linear equations (what we have now)
      linear: {
        leftSpacing: -0.8,
        rightSpacing: operation.length * -0.2 - 0.1,
        resultSpacing: 0
      },

      // Quadratic equations
      quadratic: {
        leftSpacing: -0.8,
        rightSpacing: operation.length * -0.2 - 0.1,
        resultSpacing: 0
      },

      // Equations with fractions
      fraction: {
        // Fractions need different alignment strategies
        leftSpacing: -0.5,
        rightSpacing: -0.5,
        resultSpacing: 0
      },

      // Equations with exponents
      exponential: {
        // Account for superscript positioning
        leftSpacing: -0.8,
        rightSpacing: operation.length * -0.2 - 0.1,
        resultSpacing: 0
      },

      // Complex nested expressions
      complex: {
        // May need multiple alignment points
        leftSpacing: -0.8,
        rightSpacing: operation.length * -0.2,
        resultSpacing: 0
      }
    };

    return rules[expressionType] || rules.linear;
  }
}

export default AdaptiveBlockDetector;