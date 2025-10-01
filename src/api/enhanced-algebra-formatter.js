// Enhanced Algebra Step Formatter with proper place value alignment and spacing
// Input format: "equation1; operation1; equation2; operation2; equation3"
// Example: "3x-7=8; +7; 3x=15; ÷3; x=5"

export class EnhancedAlgebraFormatter {
  constructor() {
    this.debug = false;
    // Standard spacing after equal signs to prevent crowding
    this.equalSignSpacing = '\\hspace{0.4em}';
  }

  // Main formatting function
  formatSteps(input) {
    const parts = this.parseInput(input);

    if (!parts || parts.length < 3) {
      return input; // Not enough parts for formatting
    }

    // Build formatted output based on parts
    return this.buildFormattedOutput(parts);
  }

  // Parse input into alternating equations and operations
  parseInput(input) {
    const parts = input.split(';').map(s => s.trim()).filter(s => s.length > 0);

    const result = [];
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        // Even indices are equations
        result.push({ type: 'equation', content: parts[i], index: i });
      } else {
        // Odd indices are operations
        result.push({ type: 'operation', content: parts[i], index: i });
      }
    }

    return result;
  }

  // Build the formatted LaTeX output
  buildFormattedOutput(parts) {
    const equations = parts.filter(p => p.type === 'equation');
    const operations = parts.filter(p => p.type === 'operation');

    if (equations.length === 0) return '';

    let result = '';
    let currentEquationIndex = 0;

    // Process each pair of equation + operation
    while (currentEquationIndex < equations.length) {
      const equation = equations[currentEquationIndex];
      const nextOperation = operations[currentEquationIndex];
      const nextEquation = equations[currentEquationIndex + 1];

      if (!nextOperation || !nextEquation) {
        // Last equation or no following operation
        if (result === '') {
          result = equation.content;
        }
        break;
      }

      // Format based on operation type
      const operationType = this.getOperationType(nextOperation.content);

      if (operationType === 'add_subtract') {
        result += this.formatAddSubtractEnhanced(equation, nextOperation, nextEquation);
        currentEquationIndex += 2;
      } else if (operationType === 'mult_divide') {
        result += this.formatMultDivideEnhanced(equation, nextOperation, nextEquation);
        currentEquationIndex += 2;
      } else {
        currentEquationIndex++;
      }
    }

    return result;
  }

  // Determine operation type
  getOperationType(operation) {
    const op = operation.toLowerCase().replace(/\s+/g, '');

    if (op.includes('+') || op.includes('-')) {
      return 'add_subtract';
    } else if (op.includes('×') || op.includes('*') || op.includes('÷') || op.includes('/')) {
      return 'mult_divide';
    }

    return 'unknown';
  }

  // Calculate alignment spacing for place value alignment
  calculateAlignmentSpacing(eq1Parts, eq2Parts, operation) {
    // Get the right side values
    const right1 = eq1Parts.right;
    const right2 = eq2Parts.right;

    // Calculate digit lengths
    const len1 = right1.length;
    const len2 = right2.length;

    // For place value alignment, we need to adjust based on digit count difference
    let operationSpacing = '\\hspace{-0.7em}';
    let resultSpacing = '\\hspace{-0.4em}';

    // Critical cases for proper alignment
    if (len1 === 1 && len2 === 2) {
      // 8 -> 15 (single to double digit) - key case!
      // The 5 in "15" must align under the 8
      operationSpacing = '\\hspace{-0.8em}';  // Move operation left to align under 8
      resultSpacing = '\\hspace{-0.4em}';     // Move 15 left so 5 aligns under 8
    } else if (len1 === 2 && len2 === 1) {
      // 30 -> 5 (double to single digit)
      operationSpacing = '\\hspace{-0.7em}';
      resultSpacing = '\\hspace{0em}';        // Single digit needs no adjustment
    } else if (len1 === 2 && len2 === 2) {
      // Both double digits (30 -> 15)
      operationSpacing = '\\hspace{-0.7em}';
      resultSpacing = '\\hspace{-0.4em}';
    } else if (len1 === 3 && len2 === 2) {
      // 120 -> 72 (triple to double)
      operationSpacing = '\\hspace{-0.7em}';
      resultSpacing = '\\hspace{-0.3em}';
    } else if (len1 === 1 && len2 === 1) {
      // Both single digits
      operationSpacing = '\\hspace{-0.7em}';
      resultSpacing = '\\hspace{0em}';
    } else {
      // Default case
      operationSpacing = '\\hspace{-0.7em}';
      resultSpacing = '\\hspace{-0.4em}';
    }

    return { operationSpacing, resultSpacing };
  }

  // Enhanced format for addition/subtraction with proper alignment
  formatAddSubtractEnhanced(eq1, operation, eq2) {
    const eq1Parts = this.parseEquation(eq1.content);
    const eq2Parts = this.parseEquation(eq2.content);

    // Calculate proper spacing for alignment
    const { operationSpacing, resultSpacing } = this.calculateAlignmentSpacing(
      eq1Parts, eq2Parts, operation.content
    );

    let result = '\\begin{array}{cccc}\n';

    // First equation with equal sign spacing
    if (eq1Parts.leftOp) {
      result += `${eq1Parts.leftMain}&${eq1Parts.leftOp}&${eq1Parts.leftSecond}&=${this.equalSignSpacing}&${eq1Parts.right}`;
    } else {
      result += `&&${eq1Parts.leftMain}&=${this.equalSignSpacing}&${eq1Parts.right}`;
    }
    result += ' \\\\[0.5em]\n';

    // Operation line with calculated spacing
    result += `&&${operationSpacing}${operation.content}& &${operationSpacing}${operation.content}`;
    result += ' \\\\[0.5em]\n';

    // Horizontal line
    result += '\\hline\n\\\\\n';

    // Second equation with equal sign spacing and result alignment
    result += `&&${eq2Parts.leftMain} &=${this.equalSignSpacing}& ${resultSpacing}${eq2Parts.right}`;
    result += '\n\\end{array}';

    return result;
  }

  // Enhanced format for multiplication/division with proper alignment
  formatMultDivideEnhanced(eq1, operation, eq2) {
    const eq1Parts = this.parseEquation(eq1.content);
    const eq2Parts = this.parseEquation(eq2.content);
    const opValue = this.extractOperationValue(operation.content);

    let result = '\\begin{array}{crcl}\n';

    // First equation with equal sign spacing
    result += `${eq1Parts.leftMain} &=${this.equalSignSpacing}& ${eq1Parts.right}`;
    result += ' \\\\[-0.5em]\n';

    // Underlines
    result += '\\underline{\\phantom{xxx}} && \\hspace{-0.1em}\\underline{\\phantom{xxx}}';
    result += ' \\\\[0.5em]\n';

    // Operation values (divisor/multiplier shown below)
    const divValue = opValue || '2';
    result += `\\hspace{0.1em}${divValue} && ${divValue}`;
    result += ' \\\\[2em]\n';

    // Result equation with equal sign spacing
    result += `${eq2Parts.leftMain} &=${this.equalSignSpacing}& ${eq2Parts.right}`;
    result += '\n\\end{array}';

    return result;
  }

  // Parse equation into components
  parseEquation(equation) {
    const clean = equation.replace(/\s+/g, '');
    const parts = clean.split('=');

    if (parts.length !== 2) {
      return { leftMain: equation, right: '' };
    }

    const left = parts[0];
    const right = parts[1];

    // Parse left side for operator and terms
    let leftMain = left;
    let leftOp = '';
    let leftSecond = '';

    // Check for addition/subtraction in left side
    const opMatch = left.match(/^([^+-]+)([+-])(.+)$/);
    if (opMatch) {
      leftMain = opMatch[1];
      leftOp = opMatch[2];
      leftSecond = opMatch[3];
    }

    return {
      leftMain,
      leftOp,
      leftSecond,
      right,
      original: equation
    };
  }

  // Extract numeric value from operation
  extractOperationValue(operation) {
    const match = operation.match(/\d+/);
    return match ? match[0] : '';
  }

  // Enable/disable debug logging
  setDebug(enabled) {
    this.debug = enabled;
  }

  log(...args) {
    if (this.debug) {
      console.log('[EnhancedFormatter]', ...args);
    }
  }
}

// Export singleton
export const enhancedAlgebraFormatter = new EnhancedAlgebraFormatter();