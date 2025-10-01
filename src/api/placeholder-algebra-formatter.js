// Placeholder-based Algebra Formatter with consistent place value alignment
// Uses placeholders (\hspace{0em}) everywhere, then calculates proper adjustments

export class PlaceholderAlgebraFormatter {
  constructor() {
    this.debug = false;
    // Standard spacing after equal signs to prevent crowding
    this.equalSignSpacing = '0.4em';
    // Base unit for spacing adjustments (1 digit width)
    this.digitWidth = '0.5em';
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
        result += this.formatAddSubtractWithPlaceholders(equation, nextOperation, nextEquation);
        currentEquationIndex += 2;
      } else if (operationType === 'mult_divide') {
        result += this.formatMultDivideWithPlaceholders(equation, nextOperation, nextEquation);
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

  // Calculate how many em units to shift left to align digits
  calculateDigitAlignment(value1, value2, operation = null) {
    // Count digits in each value
    const digits1 = value1.toString().length;
    const digits2 = value2.toString().length;

    // For operations, we need to consider the operation width too
    let operationDigits = 0;
    if (operation) {
      // Extract just the numeric part from operations like "+25", "-7", "÷2"
      const opMatch = operation.match(/\d+/);
      operationDigits = opMatch ? opMatch[0].length : 0;
    }

    // Calculate the difference in positions
    // The goal is to align the rightmost (ones) digits
    const maxDigits = Math.max(digits1, digits2, operationDigits);

    // Return adjustments for each value
    return {
      value1Adjust: (maxDigits - digits1) * 0.5,  // em units to add
      value2Adjust: (maxDigits - digits2) * 0.5,
      operationAdjust: (maxDigits - operationDigits) * 0.5
    };
  }

  // Format addition/subtraction with placeholder approach
  formatAddSubtractWithPlaceholders(eq1, operation, eq2) {
    const eq1Parts = this.parseEquation(eq1.content);
    const eq2Parts = this.parseEquation(eq2.content);

    // Get the numeric values
    const value1 = eq1Parts.right;
    const value2 = eq2Parts.right;
    const opValue = this.extractOperationValue(operation.content);

    // Calculate alignment adjustments
    const alignment = this.calculateDigitAlignment(value1, value2, opValue);

    // Build the array with placeholders
    let result = '\\begin{array}{cccc}\n';

    // First equation
    if (eq1Parts.leftOp) {
      result += `${eq1Parts.leftMain}&${eq1Parts.leftOp}&${eq1Parts.leftSecond}&=\\hspace{${this.equalSignSpacing}}&`;
    } else {
      result += `&&${eq1Parts.leftMain}&=\\hspace{${this.equalSignSpacing}}&`;
    }
    // Add value1 with alignment spacing if needed
    result += alignment.value1Adjust > 0
      ? `\\hspace{${alignment.value1Adjust}em}${value1}`
      : value1;
    result += ' \\\\[0.5em]\n';

    // Operation line
    // Calculate how far left to move the operation to align under the rightmost digit
    const operationShift = -0.7 - alignment.operationAdjust;
    result += `&&\\hspace{${operationShift}em}${operation.content}& &`;
    result += `\\hspace{${operationShift}em}${operation.content}`;
    result += ' \\\\[0.5em]\n';

    // Horizontal line
    result += '\\hline\n\\\\\n';

    // Second equation with result
    result += `&&${eq2Parts.leftMain} &=\\hspace{${this.equalSignSpacing}}& `;
    // Add value2 with alignment spacing
    const value2Spacing = alignment.value2Adjust > 0
      ? `\\hspace{${alignment.value2Adjust}em}`
      : '\\hspace{0em}';
    result += `${value2Spacing}${value2}`;
    result += '\n\\end{array}';

    return result;
  }

  // Format multiplication/division with placeholder approach
  formatMultDivideWithPlaceholders(eq1, operation, eq2) {
    const eq1Parts = this.parseEquation(eq1.content);
    const eq2Parts = this.parseEquation(eq2.content);
    const opValue = this.extractOperationValue(operation.content);

    let result = '\\begin{array}{crcl}\n';

    // First equation
    result += `${eq1Parts.leftMain} &=\\hspace{${this.equalSignSpacing}}& ${eq1Parts.right}`;
    result += ' \\\\[-0.5em]\n';

    // Underlines
    result += '\\underline{\\phantom{xxx}} && \\hspace{-0.1em}\\underline{\\phantom{xxx}}';
    result += ' \\\\[0.5em]\n';

    // Operation values
    const divValue = opValue || '2';
    result += `\\hspace{0.1em}${divValue} && ${divValue}`;
    result += ' \\\\[2em]\n';

    // Result equation
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
      console.log('[PlaceholderFormatter]', ...args);
    }
  }
}

// Export singleton
export const placeholderAlgebraFormatter = new PlaceholderAlgebraFormatter();