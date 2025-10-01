// Corrected Algebra Formatter with independent left/right spacing
// Fixes the critical bug where both sides used the same spacing values

export class CorrectedAlgebraFormatter {
  constructor() {
    this.debug = false;
    // Standard spacing after equal signs to prevent crowding
    this.equalSignSpacing = '0.4em';
  }

  // Main formatting function
  formatSteps(input) {
    const parts = this.parseInput(input);

    if (!parts || parts.length < 3) {
      return input;
    }

    return this.buildFormattedOutput(parts);
  }

  // Parse input into alternating equations and operations
  parseInput(input) {
    const parts = input.split(';').map(s => s.trim()).filter(s => s.length > 0);

    const result = [];
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        result.push({ type: 'equation', content: parts[i], index: i });
      } else {
        result.push({ type: 'operation', content: parts[i], index: i });
      }
    }

    return result;
  }

  // Build formatted output
  buildFormattedOutput(parts) {
    const equations = parts.filter(p => p.type === 'equation');
    const operations = parts.filter(p => p.type === 'operation');

    if (equations.length === 0) return '';

    let result = '';
    let currentEquationIndex = 0;

    while (currentEquationIndex < equations.length) {
      const equation = equations[currentEquationIndex];
      const nextOperation = operations[currentEquationIndex];
      const nextEquation = equations[currentEquationIndex + 1];

      if (!nextOperation || !nextEquation) {
        if (result === '') {
          result = equation.content;
        }
        break;
      }

      const operationType = this.getOperationType(nextOperation.content);

      if (operationType === 'add_subtract') {
        result += this.formatAddSubtractCorrected(equation, nextOperation, nextEquation);
        currentEquationIndex += 2;
      } else if (operationType === 'mult_divide') {
        result += this.formatMultDivideCorrected(equation, nextOperation, nextEquation);
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

  // Calculate LEFT side operation spacing
  calculateLeftOperationSpacing(leftTerm, operation) {
    // For left side alignment (like "9" → "-9" → "x")
    // The operation needs to align under the leftmost term

    const termDigits = leftTerm.length;
    const opDigits = this.extractOperationValue(operation).length;

    // Left side specific spacing values
    if (termDigits === 1 && opDigits === 1) {
      // Single digit term and operation (9 → -9)
      return '-0.8em';
    } else if (termDigits === 2 && opDigits === 2) {
      // Double digit term and operation (25 → -25)
      return '-0.7em';
    } else if (termDigits === 3 && opDigits === 3) {
      // Triple digit (100 → -100)
      return '-0.7em';
    } else if (termDigits === 2 && opDigits === 1) {
      // Double to single (48 → -48 but op is single digit)
      return '-0.7em';
    } else {
      // Default
      return '-0.8em';
    }
  }

  // Calculate RIGHT side operation and result spacing
  calculateRightSpacing(right1, right2, operation) {
    // For right side alignment (like "23" → "-9" → "14")
    // We need the ones digits to align vertically

    const val1Digits = right1.length;
    const val2Digits = right2.length;
    const opDigits = this.extractOperationValue(operation).length;

    let operationSpacing = '-0.3em';
    let resultSpacing = '0em';

    // Specific cases based on digit transitions
    if (val1Digits === 2 && opDigits === 1 && val2Digits === 2) {
      // 23 → -9 → 14
      operationSpacing = '-0.3em';  // -9 aligns under 3
      resultSpacing = '0em';         // 14 aligns naturally
    } else if (val1Digits === 1 && opDigits === 1 && val2Digits === 2) {
      // 8 → +7 → 15
      operationSpacing = '-0.8em';
      resultSpacing = '-0.4em';
    } else if (val1Digits === 2 && opDigits === 2 && val2Digits === 1) {
      // 30 → -25 → 5
      operationSpacing = '-0.7em';
      resultSpacing = '0.5em';
    } else if (val1Digits === 3 && opDigits === 3 && val2Digits === 2) {
      // 150 → -100 → 50
      operationSpacing = '-0.7em';
      resultSpacing = '0.5em';
    } else if (val1Digits === 2 && opDigits === 2 && val2Digits === 2) {
      // 12 → -5 → 7 (both double digits)
      operationSpacing = '-0.7em';
      resultSpacing = '0em';
    } else if (val1Digits === 3 && opDigits === 2 && val2Digits === 2) {
      // 120 → -48 → 72
      operationSpacing = '-0.7em';
      resultSpacing = '-0.3em';
    }

    return { operationSpacing, resultSpacing };
  }

  // Format addition/subtraction with CORRECTED independent spacing
  formatAddSubtractCorrected(eq1, operation, eq2) {
    const eq1Parts = this.parseEquation(eq1.content);
    const eq2Parts = this.parseEquation(eq2.content);

    // Get values for calculations
    const leftTerm = eq1Parts.leftSecond || eq1Parts.leftMain;
    const right1 = eq1Parts.right;
    const right2 = eq2Parts.right;

    // Calculate LEFT side spacing
    const leftOpSpacing = this.calculateLeftOperationSpacing(leftTerm, operation.content);

    // Calculate RIGHT side spacing (independent from left!)
    const rightSpacing = this.calculateRightSpacing(right1, right2, operation.content);

    // Build the array
    let result = '\\begin{array}{cccc}\n';

    // First equation
    if (eq1Parts.leftOp) {
      result += `${eq1Parts.leftMain}&${eq1Parts.leftOp}&${eq1Parts.leftSecond}&=\\hspace{${this.equalSignSpacing}}&${right1}`;
    } else {
      result += `&&${eq1Parts.leftMain}&=\\hspace{${this.equalSignSpacing}}&${right1}`;
    }
    result += ' \\\\[0.5em]\n';

    // Operation line with INDEPENDENT spacing for each side
    result += `&&\\hspace{${leftOpSpacing}}${operation.content}& &`;
    result += `\\hspace{${rightSpacing.operationSpacing}}${operation.content}`;
    result += ' \\\\[0.5em]\n';

    // Horizontal line
    result += '\\hline\n\\\\\n';

    // Second equation with result
    result += `&&${eq2Parts.leftMain} &=\\hspace{${this.equalSignSpacing}}& `;
    result += `\\hspace{${rightSpacing.resultSpacing}}${right2}`;
    result += '\n\\end{array}';

    return result;
  }

  // Format multiplication/division
  formatMultDivideCorrected(eq1, operation, eq2) {
    const eq1Parts = this.parseEquation(eq1.content);
    const eq2Parts = this.parseEquation(eq2.content);
    const opValue = this.extractOperationValue(operation.content);

    let result = '\\begin{array}{crcl}\n';

    result += `${eq1Parts.leftMain} &=\\hspace{${this.equalSignSpacing}}& ${eq1Parts.right}`;
    result += ' \\\\[-0.5em]\n';

    result += '\\underline{\\phantom{xxx}} && \\hspace{-0.1em}\\underline{\\phantom{xxx}}';
    result += ' \\\\[0.5em]\n';

    const divValue = opValue || '2';
    result += `\\hspace{0.1em}${divValue} && ${divValue}`;
    result += ' \\\\[2em]\n';

    result += `${eq2Parts.leftMain} &=\\hspace{${this.equalSignSpacing}}& ${eq2Parts.right}`;
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

    let leftMain = left;
    let leftOp = '';
    let leftSecond = '';

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

  // Enable debug logging
  setDebug(enabled) {
    this.debug = enabled;
  }

  log(...args) {
    if (this.debug) {
      console.log('[CorrectedFormatter]', ...args);
    }
  }
}

// Export singleton
export const correctedAlgebraFormatter = new CorrectedAlgebraFormatter();