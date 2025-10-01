// Visual Alignment Analyzer - Automated system that analyzes screenshots and adjusts alignment
import puppeteer from 'puppeteer';
import { Jimp, intToRGBA } from 'jimp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { AdaptiveBlockDetector } from './adaptive-block-detector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class VisualAlignmentAnalyzer {
  constructor() {
    this.browser = null;
    this.page = null;
    this.outputDir = path.join(__dirname, '..', 'tests', 'auto-aligned-output');
    this.screenshotDir = path.join(this.outputDir, 'screenshots');
    this.threshold = 1; // Pixel threshold for "good enough" alignment (tighter precision)
    this.maxIterations = 10; // Maximum attempts per equation
    this.results = [];
    this.blockDetector = new AdaptiveBlockDetector();
  }

  async setup() {
    // Create output directories
    await fs.mkdir(this.outputDir, { recursive: true });
    await fs.mkdir(this.screenshotDir, { recursive: true });

    // Launch browser
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1280, height: 800 });

    console.log('Visual Alignment Analyzer initialized');
  }

  // Main processing loop for an equation
  async processEquation(input, equationId) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Processing: ${equationId}`);
    console.log(`Input: ${input}`);
    console.log('-'.repeat(60));

    // Parse the input
    const steps = this.parseSteps(input);
    const processedSteps = [];

    // Process each step pair
    for (let i = 0; i < steps.equations.length - 1; i++) {
      const eq1 = steps.equations[i];
      const operation = steps.operations[i];
      const eq2 = steps.equations[i + 1];

      if (!operation) continue;

      console.log(`\nStep ${i + 1}: ${eq1} → ${eq2} (${operation})`);

      // Iteratively improve alignment
      const alignedLatex = await this.iterativelyAlignStep(
        eq1, operation, eq2, `${equationId}_step${i + 1}`
      );

      processedSteps.push({
        from: eq1,
        to: eq2,
        operation: operation,
        latex: alignedLatex.latex,
        iterations: alignedLatex.iterations,
        finalAlignment: alignedLatex.alignment,
        needsVisualCheck: alignedLatex.needsVisualCheck,
        screenshotPath: alignedLatex.screenshotPath
      });
    }

    return {
      id: equationId,
      input: input,
      steps: processedSteps,
      success: true
    };
  }

  // Parse input like "2x+4=10; -4; 2x=6; ÷2; x=3"
  parseSteps(input) {
    const parts = input.split(';').map(s => s.trim());
    const equations = [];
    const operations = [];

    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        equations.push(parts[i]);
      } else {
        operations.push(parts[i]);
      }
    }

    return { equations, operations };
  }

  // Iteratively improve alignment for a single step
  async iterativelyAlignStep(eq1, operation, eq2, stepId) {
    // Calculate initial spacing based on content width
    const initialSpacing = this.calculateInitialSpacing(eq1, operation, eq2);
    let currentSpacing = { ...initialSpacing };

    let bestAlignment = null;
    let bestScore = Infinity;
    let bestScreenshotPath = null;

    // Track recent scores to detect stuck loops
    const recentScores = [];
    const recentAdjustments = [];
    let stuckIterations = 0;
    const STUCK_THRESHOLD = 3; // If same score for 3 iterations, we're stuck

    for (let iteration = 1; iteration <= this.maxIterations; iteration++) {
      console.log(`  Iteration ${iteration}:`);

      // Generate LaTeX with current spacing
      const latex = this.generateLatex(eq1, operation, eq2, currentSpacing);

      // Render and screenshot
      const screenshotPath = path.join(
        this.screenshotDir,
        `${stepId}_iter${iteration}.png`
      );
      await this.renderAndScreenshot(latex, screenshotPath);

      // Analyze alignment
      const alignment = await this.analyzeAlignment(screenshotPath);
      console.log(`    Alignment score: ${alignment.score.toFixed(2)}px off`);

      // Check if good enough
      if (alignment.score < this.threshold) {
        console.log(`    ✓ Alignment acceptable!`);

        // NEW: Visual verification step
        console.log(`    📸 Visual verification: Screenshot saved at ${screenshotPath}`);
        console.log(`    🔍 MANUAL CHECK NEEDED: Please verify alignment visually`);

        return {
          latex: latex,
          iterations: iteration,
          alignment: alignment,
          screenshotPath: screenshotPath,
          needsVisualCheck: true
        };
      }

      // Track best attempt
      if (alignment.score < bestScore) {
        bestScore = alignment.score;
        bestScreenshotPath = screenshotPath;
        bestAlignment = {
          latex: latex,
          iterations: iteration,
          alignment: alignment,
          screenshotPath: screenshotPath
        };
      }

      // Check if we're stuck in a loop
      recentScores.push(alignment.score);
      if (recentScores.length > STUCK_THRESHOLD) {
        recentScores.shift(); // Keep only last N scores
      }

      // If all recent scores are the same, we're stuck
      if (recentScores.length === STUCK_THRESHOLD &&
          recentScores.every(score => Math.abs(score - recentScores[0]) < 0.1)) {
        stuckIterations++;

        if (stuckIterations >= 2) {
          console.log(`  ⚠ STUCK LOOP DETECTED: Alignment not improving after ${iteration} iterations`);
          console.log(`    Problem: The adjustments aren't affecting the alignment (stuck at ${alignment.score.toFixed(2)}px)`);

          // For division operations, this might be expected due to different formatting
          const isDivision = operation.includes('÷') || operation.includes('/');
          if (isDivision) {
            console.log(`    Note: Division operations use different formatting that may not align traditionally`);
          } else {
            console.log(`    FLAG FOR INVESTIGATION: This step needs manual review of the alignment algorithm`);
          }

          // Return best attempt so far
          bestAlignment.stuckLoop = true;
          bestAlignment.stuckScore = alignment.score;
          bestAlignment.needsVisualCheck = true;
          console.log(`    📸 Visual verification: Screenshot saved at ${bestScreenshotPath}`);
          console.log(`    🔍 MANUAL CHECK NEEDED: Algorithm stuck - please verify alignment visually`);
          return bestAlignment;
        }
      } else {
        stuckIterations = 0; // Reset if scores are changing
      }

      // Adjust spacing based on misalignment
      const previousSpacing = { ...currentSpacing };
      currentSpacing = this.adjustSpacing(currentSpacing, alignment);

      // Track if adjustments are having no effect
      const adjustmentMade =
        Math.abs(currentSpacing.leftOp - previousSpacing.leftOp) > 0.001 ||
        Math.abs(currentSpacing.rightOp - previousSpacing.rightOp) > 0.001 ||
        Math.abs(currentSpacing.result - previousSpacing.result) > 0.001;

      if (!adjustmentMade && iteration > 1) {
        console.log(`    ⚠ No adjustment made - alignment algorithm may need review`);
      }

      console.log(`    Adjusted spacing: L=${currentSpacing.leftOp.toFixed(2)}em, R=${currentSpacing.rightOp.toFixed(2)}em, Result=${currentSpacing.result.toFixed(2)}em`);
    }

    console.log(`  ⚠ Max iterations reached. Using best attempt (score: ${bestScore.toFixed(2)}px)`);
    bestAlignment.needsVisualCheck = true;
    console.log(`    📸 Visual verification: Screenshot saved at ${bestScreenshotPath}`);
    console.log(`    🔍 MANUAL CHECK NEEDED: Max iterations reached - please verify alignment visually`);
    return bestAlignment;
  }

  // Utility to round spacing values to avoid floating point errors
  roundSpacing(value) {
    // Round to 2 decimal places to avoid issues like -0.7500000000000001em
    return Math.round(value * 100) / 100;
  }

  // Generate LaTeX with specific spacing values
  generateLatex(eq1, operation, eq2, spacing) {
    // Parse equations to get components and terms
    const eq1Parts = this.parseEquation(eq1);
    const eq2Parts = this.parseEquation(eq2);

    // Identify which term is being operated on
    const operationTarget = this.identifyOperationTarget(eq1Parts, operation);

    // Check if this is a division operation
    const isDivision = operation.includes('÷') || operation.includes('/');

    if (isDivision) {
      return this.generateDivisionLatex(eq1, operation, eq2, spacing);
    }

    let latex = '\\begin{array}{cccc}\n';

    // First equation
    if (eq1Parts.leftOp) {
      latex += `${eq1Parts.leftMain}&${eq1Parts.leftOp}&${eq1Parts.leftSecond}&=\\hspace{0.4em}&${eq1Parts.right}`;
    } else {
      latex += `&&${eq1Parts.leftMain}&=\\hspace{0.4em}&${eq1Parts.right}`;
    }
    latex += ' \\\\[0.5em]\n';

    // Operation line - placement depends on which term we're operating on
    if (operationTarget.targetTerm === 'term1') {
      // Operating on term1 - operation goes under first column
      // Need to align with term1 position
      latex += `\\hspace{${this.roundSpacing(spacing.leftOp)}em}${operation}&&&`;
      latex += ` &\\hspace{${this.roundSpacing(spacing.rightOp)}em}${operation}`;
    } else {
      // Operating on term2 (default) - operation goes in third column
      latex += `&&\\hspace{${this.roundSpacing(spacing.leftOp)}em}${operation}& `;
      latex += `&\\hspace{${this.roundSpacing(spacing.rightOp)}em}${operation}`;
    }
    latex += ' \\\\[0.5em]\n';

    // Horizontal line
    latex += '\\hline\n\\\\\n';

    // Result line - format depends on what was canceled
    if (operationTarget.targetTerm === 'term1' && eq2Parts.leftOp) {
      // term1 was canceled, show remaining term in proper position
      // If original was "15+x" and we subtract 15, result is just "x"
      latex += `&&${eq2Parts.leftSecond || eq2Parts.leftMain} &=\\hspace{0.4em}& \\hspace{${this.roundSpacing(spacing.result)}em}${eq2Parts.right}`;
    } else {
      // Standard result line
      latex += `&&${eq2Parts.leftMain} &=\\hspace{0.4em}& \\hspace{${this.roundSpacing(spacing.result)}em}${eq2Parts.right}`;
    }
    latex += '\n\\end{array}';

    return latex;
  }

  // Generate LaTeX for division operations with underlines
  generateDivisionLatex(eq1, operation, eq2, spacing) {
    // Parse equations to get components
    const eq1Parts = this.parseEquation(eq1);
    const eq2Parts = this.parseEquation(eq2);

    // Extract the divisor from the operation (e.g., "÷3" -> "3")
    const divisor = operation.replace(/[÷\/]/g, '');

    // Determine what's being divided (numerator) on both sides
    const leftNumerator = eq1Parts.leftMain || '';
    const rightNumerator = eq1Parts.right || '';

    // Determine the result (what remains after division) on both sides
    const leftResult = eq2Parts.leftMain || '';
    const rightResult = eq2Parts.right || '';

    // Calculate phantom width for underlines
    // The underline should be wider than the content above it
    // We count characters and add padding
    const leftContentLength = Math.max(leftNumerator.length, divisor.length);
    const rightContentLength = Math.max(rightNumerator.length, divisor.length);

    // Create phantom strings ('x' repeated for the width needed)
    // Add 2 extra chars for visual padding
    const leftPhantom = 'x'.repeat(leftContentLength + 2);
    const rightPhantom = 'x'.repeat(rightContentLength + 2);

    let latex = '\\begin{array}{crcl}\n';

    // First equation (what's being divided)
    latex += `${leftNumerator} &=& ${rightNumerator}`;
    latex += ' \\\\[-0.5em]\n';

    // Underlines for division with dynamic phantom sizing (rounded spacing)
    const leftUnderline = `\\underline{\\phantom{${leftPhantom}}}`;
    const rightUnderline = `\\underline{\\phantom{${rightPhantom}}}`;
    latex += `${leftUnderline} && \\hspace{${this.roundSpacing(spacing.rightOp)}em}${rightUnderline} \\\\[0.5em]\n`;

    // Divisor line with rounded spacing
    latex += `\\hspace{${this.roundSpacing(spacing.leftOp)}em}${divisor} && ${divisor} \\\\[2em]\n`;

    // Result with rounded spacing
    latex += `${leftResult} &=& \\hspace{${this.roundSpacing(spacing.result)}em}${rightResult}`;
    latex += '\n\\end{array}';

    return latex;
  }

  // Parse equation into components and identify terms
  parseEquation(equation) {
    const clean = equation.replace(/\s+/g, '');
    const parts = clean.split('=');

    if (parts.length !== 2) {
      return { leftMain: equation, right: '', terms: {} };
    }

    const left = parts[0];
    const right = parts[1];

    let leftMain = left;
    let leftOp = '';
    let leftSecond = '';
    const terms = {};

    // Parse left side to identify terms
    const opMatch = left.match(/^([^+-]+)([+-])(.+)$/);
    if (opMatch) {
      leftMain = opMatch[1];
      leftOp = opMatch[2];
      leftSecond = opMatch[3];

      // Store terms by logical position
      terms.term1 = { value: leftMain, side: 'left', text: leftMain };
      terms.term2 = { value: leftSecond, side: 'left', text: leftOp + leftSecond };
    } else {
      // Single term on left
      terms.term1 = { value: leftMain, side: 'left', text: leftMain };
    }

    // Right side is term3
    terms.term3 = { value: right, side: 'right', text: right };

    return {
      leftMain,
      leftOp,
      leftSecond,
      right,
      terms
    };
  }

  // Render LaTeX and take screenshot
  async renderAndScreenshot(latex, outputPath) {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
      <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
      <style>
        body { margin: 0; padding: 50px; background: white; }
        #formula { font-size: 24px; }
      </style>
    </head>
    <body>
      <div id="formula"></div>
      <script>
        katex.render(${JSON.stringify(latex)}, document.getElementById('formula'), {
          displayMode: true,
          throwOnError: false
        });
      </script>
    </body>
    </html>`;

    await this.page.goto(`data:text/html,${encodeURIComponent(html)}`);
    await new Promise(resolve => setTimeout(resolve, 300));

    // Take screenshot of just the formula
    const element = await this.page.$('#formula');
    if (element) {
      await element.screenshot({ path: outputPath });
    }
  }

  // Analyze alignment in screenshot using image processing
  async analyzeAlignment(imagePath) {
    try {
      const image = await Jimp.read(imagePath);

      // Find digit positions by scanning for dark pixels
      const digitPositions = this.findDigitPositions(image);

      // Calculate alignment score (deviation from vertical alignment)
      const score = this.calculateAlignmentScore(digitPositions);

      return {
        score: score,
        positions: digitPositions,
        needsLeftAdjust: score > this.threshold && digitPositions.leftMisalign > 0,
        needsRightAdjust: score > this.threshold && digitPositions.rightMisalign > 0,
        needsResultAdjust: score > this.threshold && digitPositions.resultMisalign > 0
      };
    } catch (error) {
      console.error('Error analyzing image:', error);
      return {
        score: Infinity,
        positions: null,
        error: error.message
      };
    }
  }

  // Find positions of digits in the image
  findDigitPositions(image) {
    const width = image.bitmap.width;
    const height = image.bitmap.height;

    // Find the three main rows (equation, operation, result)
    const rows = this.findTextRows(image);

    // Filter out the horizontal line (it will be much thinner than text rows)
    const textRows = rows.filter(row => {
      const height = row.bottom - row.top;
      return height > 5; // Text rows are typically >10px, lines are 1-3px
    });

    if (textRows.length < 3) {
      console.log(`    Warning: Found ${textRows.length} text rows (expected 3)`);
      return { leftMisalign: 0, rightMisalign: 0, resultMisalign: 0 };
    }

    // Find content boundaries in each row
    const rowBounds = [];
    for (let i = 0; i < Math.min(3, textRows.length); i++) {
      const row = textRows[i];
      let leftmost = -1;
      let rightmost = -1;

      // Find leftmost text pixel
      for (let x = 0; x < width; x++) {
        for (let y = row.top; y <= row.bottom; y++) {
          const pixel = intToRGBA(image.getPixelColor(x, y));
          if (pixel.r < 128) { // Dark pixel (text)
            leftmost = x;
            break;
          }
        }
        if (leftmost !== -1) break;
      }

      // Find rightmost text pixel
      for (let x = width - 1; x >= 0; x--) {
        for (let y = row.top; y <= row.bottom; y++) {
          const pixel = intToRGBA(image.getPixelColor(x, y));
          if (pixel.r < 128) { // Dark pixel (text)
            rightmost = x;
            break;
          }
        }
        if (rightmost !== -1) break;
      }

      rowBounds.push({ leftmost, rightmost, row: i });
    }

    // Now analyze alignment based on actual content positions
    // For operations (row 1), we need to check:
    // 1. LEFT operation alignment: does it align with the number above it?
    // 2. RIGHT operation alignment: does it align with the right side number?

    // Row 0: equation (reference for both sides)
    // Row 1: operation (should have operations that align with numbers)
    // Row 2: result (should align)

    let leftMisalign = 0;
    let rightMisalign = 0;
    let resultMisalign = 0;

    if (rowBounds.length >= 2) {
      // For the operation row (row 1), we need to check if the operations
      // are properly positioned under/over the numbers they operate on

      // Find the equals sign position in the first row to split left/right
      const equalsPosition = this.findEqualsSignPosition(image, textRows[0]);

      if (equalsPosition > 0) {
        // LEFT SIDE: For the array layout, operations should align with the numbers above them
        // The key insight is that the left operation aligns with the term being cancelled

        // Find all content blocks in the equation row (row 0)
        const eqRow = textRows[0];
        const eqBlocks = this.findContentBlocks(image, eqRow, width);
        console.log(`      Equation blocks: ${eqBlocks.map(b => `[${b.start}-${b.end}] (${b.type})`).join(' ')}`);

        // Find all content blocks in the operation row (row 1)
        const opRow = textRows[1];
        const opBlocks = this.findContentBlocks(image, opRow, width);
        console.log(`      Operation blocks: ${opBlocks.map(b => `[${b.start}-${b.end}]`).join(' ')}`);

        // For proper alignment in the array format:
        // - If equation has form "ax+b=c", the operation aligns with "b"
        // - If equation has form "ax-b=c", the operation aligns with "b"
        // - The operation should be in column 3 of the array

        if (eqBlocks.length >= 3 && opBlocks.length >= 1) {
          // With proper block detection, we now have complete numbers/terms
          // Equation blocks: [100x] [2500] [7500] (or similar)
          // Operation blocks: [+2500] [+2500]

          // Find the block containing the term being operated on
          // With 5 blocks: [100x] [-] [2500] [=] [7500], we want block index 2
          // With 3 blocks: might be merged differently
          let targetBlock = null;

          if (eqBlocks.length >= 5) {
            // Well-separated: term2 is block 2 (0-indexed)
            targetBlock = eqBlocks[2];
            console.log(`      Using block 2 as target (5+ blocks found)`);
          } else if (eqBlocks.length >= 3) {
            // Less separation, find the block before the equals
            // Look for a block that's left of the equals position
            for (let i = 0; i < eqBlocks.length; i++) {
              const block = eqBlocks[i];
              if (block.end < equalsPosition - 20 && block.start > width * 0.4) {
                targetBlock = block;
                console.log(`      Using block ${i} as target (3-4 blocks found)`);
                break;
              }
            }
          }

          // The left operation is the first block in the operation row
          const leftOpBlock = opBlocks[0];

          if (targetBlock && leftOpBlock) {
            // For place value alignment, compare the END positions
            // This ensures the ones digits align properly
            const targetEnd = targetBlock.end;
            const opEnd = leftOpBlock.end;
            leftMisalign = opEnd - targetEnd;

            // Debug output
            console.log(`      Target block: [${targetBlock.start}-${targetBlock.end}] width=${targetBlock.width}px`);
            console.log(`      Left op block: [${leftOpBlock.start}-${leftOpBlock.end}] width=${leftOpBlock.width}px`);

            // Only report significant misalignments (more than 5 pixels)
            if (Math.abs(leftMisalign) > 5) {
              console.log(`      Misalignment: ${leftMisalign}px (operation ends at ${opEnd}, target ends at ${targetEnd})`);
            } else {
              leftMisalign = 0; // Within tolerance
              console.log(`      ✓ Aligned within ${Math.abs(leftMisalign)}px tolerance`);
            }
          } else {
            if (!targetBlock) {
              console.log(`      Warning: Could not find target term block`);
              console.log(`      Equation blocks found: ${eqBlocks.map(b => `[${b.start}-${b.end}]`).join(', ')}`);
            }
            if (!leftOpBlock) {
              console.log(`      Warning: No operation blocks found`);
            }
          }
        }
      }

      // RIGHT SIDE: Use existing rightmost digit logic
      const rightmostDigits = rowBounds.map(b => b.rightmost);
      const reference = rightmostDigits[0];

      rightMisalign = rightmostDigits.length > 1 && reference > 0 && rightmostDigits[1] > 0 ?
        rightmostDigits[1] - reference : 0;
      resultMisalign = rightmostDigits.length > 2 && reference > 0 && rightmostDigits[2] > 0 ?
        rightmostDigits[2] - reference : 0;
    }

    return {
      leftMisalign,
      rightMisalign,
      resultMisalign,
      rowBounds // For debugging
    };
  }

  // Helper to find the equals sign position in a row
  findEqualsSignPosition(image, row) {
    const width = image.bitmap.width;

    // Look for the equals sign pattern (horizontal line of dark pixels)
    // in the middle area of the image
    for (let x = Math.floor(width * 0.4); x < Math.floor(width * 0.7); x++) {
      let consecutiveDark = 0;

      for (let y = row.top; y <= row.bottom; y++) {
        const pixel = intToRGBA(image.getPixelColor(x, y));
        if (pixel.r < 128) {
          consecutiveDark++;
        }
      }

      // Equals sign tends to have a horizontal bar
      if (consecutiveDark > (row.bottom - row.top) * 0.3) {
        return x;
      }
    }

    return -1;
  }

  // Helper to find content blocks in a row using adaptive gap detection
  findContentBlocks(image, row, width) {
    // Use the adaptive block detector for better handling of complex expressions
    const blocks = this.blockDetector.detectBlocks(image, row, width);

    // Convert to our expected format if needed
    return blocks.map(block => ({
      start: block.start,
      end: block.end,
      width: block.width,
      type: block.type || 'unknown',
      content: block.content || 'unknown'
    }));
  }

  // Helper to find content segments in a row (deprecated - use findContentBlocks)
  findContentSegments(image, row, width) {
    return this.findContentBlocks(image, row, width);
  }

  // Identify which term the operation is targeting
  identifyOperationTarget(eq1Parts, operation) {
    // Remove the operation sign to get the value
    // Only remove the FIRST character if it's an operation sign
    let opValue = operation;
    if (opValue.startsWith('+') || opValue.startsWith('-') || opValue.startsWith('÷') || opValue.startsWith('/') || opValue.startsWith('×') || opValue.startsWith('*')) {
      opValue = opValue.substring(1);
    }

    // The operation tells us which term we're canceling
    // Check each term to see if it matches the operation value

    // Check term1 first
    if (eq1Parts.terms.term1) {
      // For term1, we need to check just the numeric part (without variable)
      const term1Numeric = eq1Parts.terms.term1.value.replace(/[a-z]/gi, '');
      console.log(`      Checking term1: "${eq1Parts.terms.term1.value}" -> numeric: "${term1Numeric}" vs opValue: "${opValue}"`);
      if (term1Numeric === opValue) {
        // Operating on term1 (like in 15+x=42 with -15)
        console.log(`      -> MATCH! Operating on term1`);
        return {
          targetTerm: 'term1',
          leftAlignsWith: 'term1',  // Left operation aligns with term1
          rightAlignsWith: 'term3'   // Right operation aligns with term3
        };
      }
    }

    // Check term2
    if (eq1Parts.terms.term2) {
      // For term2, also check just the numeric part (without variable)
      const term2Numeric = eq1Parts.terms.term2.value.replace(/[a-z]/gi, '');
      if (term2Numeric === opValue || eq1Parts.terms.term2.value === opValue) {
        // Operating on term2 (like in 2x+4=10 with -4)
        return {
          targetTerm: 'term2',
          leftAlignsWith: 'term2',  // Left operation aligns with term2
          rightAlignsWith: 'term3'  // Right operation aligns with term3
        };
      }
    }

    // For division/multiplication, we're operating on the coefficient
    if (operation.includes('÷') || operation.includes('/') || operation.includes('×') || operation.includes('*')) {
      // Extract coefficient from term1 if it has a variable
      const coeff = eq1Parts.terms.term1?.value.replace(/[a-z]/gi, '') || '';
      if (coeff === opValue) {
        return {
          targetTerm: 'coefficient',
          isDivision: operation.includes('÷') || operation.includes('/')
        };
      }
    }

    // Default case - try to be smart about it
    // If operation value matches the numeric part of any term, target that term
    console.log(`    ⚠️ Could not determine target term for operation ${operation}`);
    return {
      targetTerm: 'term2',
      leftAlignsWith: 'term2',
      rightAlignsWith: 'term3'
    };
  }

  // Calculate initial spacing based on content analysis
  calculateInitialSpacing(eq1, operation, eq2) {
    // Parse equations to understand their structure
    const eq1Parts = this.parseEquation(eq1);
    const eq2Parts = this.parseEquation(eq2);

    // Identify which terms the operation targets
    const operationTarget = this.identifyOperationTarget(eq1Parts, operation);

    // Log term analysis for debugging
    console.log(`    Term analysis for ${eq1}:`);
    if (eq1Parts.terms.term1) console.log(`      Term1: "${eq1Parts.terms.term1.text}" (${eq1Parts.terms.term1.side})`);
    if (eq1Parts.terms.term2) console.log(`      Term2: "${eq1Parts.terms.term2.text}" (${eq1Parts.terms.term2.side})`);
    if (eq1Parts.terms.term3) console.log(`      Term3: "${eq1Parts.terms.term3.text}" (${eq1Parts.terms.term3.side})`);
    console.log(`      Operation "${operation}" targets: ${operationTarget.targetTerm}`);
    if (!operationTarget.isDivision) {
      console.log(`      Left ${operation} aligns with: ${operationTarget.leftAlignsWith}`);
      console.log(`      Right ${operation} aligns with: ${operationTarget.rightAlignsWith}`);
    }

    // Count total characters in operation (including sign)
    const opLength = operation.length; // Full length including signs

    // For division operations, use different spacing
    const isDivision = operation.includes('÷') || operation.includes('/');

    let leftOp, rightOp, result;

    if (isDivision) {
      // Division operations need different spacing for underline format
      leftOp = 0.1;  // Slight positive spacing for divisor
      rightOp = -0.1; // Slight negative for right underline
      result = 0;
    } else {
      // For addition/subtraction
      // User testing shows ALL operations need approximately -0.8em for left spacing
      // regardless of character count (2, 3, 4, 5+ characters all use -0.8em)
      // This is because the array column structure handles most of the alignment
      leftOp = -0.8;  // Universal left spacing for all operations

      // Right side operation spacing based on operation character count
      // 2 chars (like -4): -0.5em
      // 3 chars (like -12): -0.7em
      // 4 chars (like -100): -0.9em
      rightOp = -0.1 - (opLength * 0.2);

      // If result has fewer digits than the equation above, it may need adjustment
      const rightDigits1 = eq1Parts.right.length;
      const rightDigits2 = eq2Parts.right.length;
      if (rightDigits2 < rightDigits1) {
        result = (rightDigits1 - rightDigits2) * 0.3;
      } else {
        result = 0;
      }
    }

    console.log(`    Initial spacing calculated:`);
    console.log(`      Operation: "${operation}" (${opLength} characters)`);
    console.log(`      Left: ${leftOp.toFixed(2)}em, Right: ${rightOp.toFixed(2)}em, Result: ${result.toFixed(2)}em`);

    // Allow wider range for spacing adjustments
    // Positive values move content RIGHT, negative values move content LEFT
    return {
      leftOp: Math.max(-3, Math.min(2, leftOp)),  // Allow -3 to +2em range
      rightOp: Math.max(-3, Math.min(2, rightOp)), // Allow -3 to +2em range
      result: Math.max(-2, Math.min(2, result))    // Allow -2 to +2em range
    };
  }

  // Find text rows in the image
  findTextRows(image) {
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    const rows = [];
    let inRow = false;
    let rowStart = 0;

    for (let y = 0; y < height; y++) {
      let hasText = false;
      for (let x = 0; x < width; x++) {
        const pixel = intToRGBA(image.getPixelColor(x, y));
        if (pixel.r < 128) { // Dark pixel
          hasText = true;
          break;
        }
      }

      if (hasText && !inRow) {
        inRow = true;
        rowStart = y;
      } else if (!hasText && inRow) {
        inRow = false;
        rows.push({ top: rowStart, bottom: y - 1 });
      }
    }

    if (inRow) {
      rows.push({ top: rowStart, bottom: height - 1 });
    }

    return rows;
  }

  // Calculate how misaligned the digits are
  calculateAlignmentScore(positions) {
    // Calculate total misalignment in pixels
    const leftError = Math.abs(positions.leftMisalign);
    const rightError = Math.abs(positions.rightMisalign);
    const resultError = Math.abs(positions.resultMisalign);

    // Return the maximum error (worst case alignment)
    const score = Math.max(leftError, rightError, resultError);

    // Log detailed alignment info for debugging
    if (positions.rowBounds) {
      console.log(`    Row bounds: ${positions.rowBounds.map(b => `[${b.leftmost}-${b.rightmost}]`).join(', ')}`);
    }
    console.log(`    Misalignments: Left=${leftError}px, Right=${rightError}px, Result=${resultError}px`);

    return score;
  }

  // Adjust spacing based on alignment analysis
  adjustSpacing(current, alignment) {
    const adjusted = { ...current };
    // Adjust more aggressively based on actual pixel error
    // Each em is roughly 16-24 pixels, so 0.05em ≈ 1px
    const pixelToEm = 0.05;

    // Adjust LEFT operation spacing if misaligned
    if (alignment.positions?.leftMisalign && alignment.positions.leftMisalign !== 0) {
      const leftAdjust = -alignment.positions.leftMisalign * pixelToEm;
      adjusted.leftOp += leftAdjust;
      console.log(`    Left adjustment: ${leftAdjust.toFixed(3)}em for ${alignment.positions.leftMisalign}px error`);
    }

    // Adjust right operation spacing if misaligned
    if (alignment.positions?.rightMisalign && alignment.positions.rightMisalign !== 0) {
      const rightAdjust = -alignment.positions.rightMisalign * pixelToEm;
      adjusted.rightOp += rightAdjust;
      console.log(`    Right adjustment: ${rightAdjust.toFixed(3)}em for ${alignment.positions.rightMisalign}px error`);
    }

    // FIX: The result adjustment was wrong - positive misalign means result is too far right
    // So we need to SUBTRACT to move it left, not add
    if (alignment.positions?.resultMisalign && alignment.positions.resultMisalign !== 0) {
      const resultAdjust = -alignment.positions.resultMisalign * pixelToEm; // FIXED: negative adjustment
      adjusted.result += resultAdjust;
      console.log(`    Result adjustment: ${resultAdjust.toFixed(3)}em for ${alignment.positions.resultMisalign}px error`);
    }

    // Clamp values to reasonable ranges
    // Allow positive values to move content RIGHT when needed
    adjusted.leftOp = Math.max(-3, Math.min(2, adjusted.leftOp));
    adjusted.rightOp = Math.max(-3, Math.min(2, adjusted.rightOp));
    adjusted.result = Math.max(-2, Math.min(2, adjusted.result));

    return adjusted;
  }

  // Process multiple equations from a list
  async processEquationList(equations) {
    await this.setup();

    const results = [];
    const screenshotsToCheck = [];

    for (let i = 0; i < equations.length; i++) {
      const equation = equations[i];
      const id = equation.id || `equation_${i + 1}`;

      try {
        const result = await this.processEquation(equation.input || equation, id);
        results.push(result);

        // Collect screenshots that need visual verification
        for (const step of result.steps) {
          if (step.needsVisualCheck && step.screenshotPath) {
            screenshotsToCheck.push({
              equationId: id,
              step: `${step.from} → ${step.to}`,
              operation: step.operation,
              path: step.screenshotPath,
              algorithmScore: step.finalAlignment?.score || step.alignment?.score
            });
          }
        }

        // Save successful LaTeX
        await this.saveResult(result);

      } catch (error) {
        console.error(`Error processing ${id}:`, error);
        results.push({
          id: id,
          input: equation.input || equation,
          error: error.message
        });
      }
    }

    // Report screenshots that need visual verification
    if (screenshotsToCheck.length > 0) {
      console.log('\n' + '='.repeat(60));
      console.log('VISUAL VERIFICATION NEEDED');
      console.log('='.repeat(60));
      console.log(`Found ${screenshotsToCheck.length} screenshots that need visual verification:`);
      for (const check of screenshotsToCheck) {
        console.log(`\n📸 ${check.equationId}: ${check.step}`);
        console.log(`   Operation: ${check.operation}`);
        console.log(`   Algorithm score: ${check.algorithmScore?.toFixed(2)}px`);
        console.log(`   Path: ${check.path}`);
      }
      console.log('\n' + '='.repeat(60));
    }

    await this.cleanup();
    return results;
  }

  // Save successful alignment result
  async saveResult(result) {
    // Create clean output with just essential data
    const cleanResult = {
      id: result.id,
      input: result.input,
      steps: result.steps.map(step => ({
        from: step.from,
        to: step.to,
        operation: step.operation,
        latex: step.latex,
        iterations: step.iterations,
        finalScore: step.finalAlignment?.score
      })),
      success: result.success
    };

    const outputFile = path.join(this.outputDir, `${result.id}.json`);
    await fs.writeFile(outputFile, JSON.stringify(cleanResult, null, 2));
    console.log(`✓ Saved result to ${outputFile}`);

    // Also save just the LaTeX strings to a separate file for easy access
    const latexOnlyFile = path.join(this.outputDir, `${result.id}_latex.txt`);
    const latexContent = result.steps.map(step => step.latex).join('\n\n');
    await fs.writeFile(latexOnlyFile, latexContent);
    console.log(`✓ Saved LaTeX-only version to ${latexOnlyFile}`);
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Export for use
export default VisualAlignmentAnalyzer;