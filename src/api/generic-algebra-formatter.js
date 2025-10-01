// Generic Algebra Step Formatter - Works with ANY equation sequence
// Input format: "equation1; operation1; equation2; operation2; equation3"
// Example: "2x+4=10; -4; 2x=6; ÷2; x=3"

export class GenericAlgebraFormatter {
  constructor() {
    this.debug = false;
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
          // Single equation
          result = equation.content;
        }
        break;
      }

      // Format based on operation type
      const operationType = this.getOperationType(nextOperation.content);

      if (operationType === 'add_subtract') {
        // Format for addition/subtraction (operation above the line)
        result += this.formatAddSubtract(equation, nextOperation, nextEquation);
        currentEquationIndex += 2; // Skip the next equation as it's included
      } else if (operationType === 'mult_divide') {
        // Format for multiplication/division (operation below with underlines)
        result += this.formatMultDivide(equation, nextOperation, nextEquation);
        currentEquationIndex += 2; // Skip the next equation as it's included
      } else {
        // Unknown operation, skip
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

  // Format addition/subtraction with operation above the line
  formatAddSubtract(eq1, operation, eq2) {
    const eq1Parts = this.parseEquation(eq1.content);
    const eq2Parts = this.parseEquation(eq2.content);
    const opValue = this.extractOperationValue(operation.content);

    let result = '\\begin{array}{cccc}\n';

    // First equation with proper column separation
    if (eq1Parts.leftOp) {
      result += `${eq1Parts.leftMain}&${eq1Parts.leftOp}&${eq1Parts.leftSecond}&=&${eq1Parts.right}`;
    } else {
      result += `&&${eq1Parts.leftMain}&=&${eq1Parts.right}`;
    }
    result += ' \\\\[0.5em]\n';

    // Operation line
    result += `&&\\hspace{-0.7em}${operation.content}& &\\hspace{-0.3em}${operation.content}`;
    result += ' \\\\[0.5em]\n';

    // Horizontal line
    result += '\\hline\n\\\\\n';

    // Second equation
    result += `&&${eq2Parts.leftMain} &=& \\hspace{0.5em}${eq2Parts.right}`;
    result += '\n\\end{array}';

    return result;
  }

  // Format multiplication/division with operation below and underlines
  formatMultDivide(eq1, operation, eq2) {
    const eq1Parts = this.parseEquation(eq1.content);
    const eq2Parts = this.parseEquation(eq2.content);
    const opValue = this.extractOperationValue(operation.content);

    let result = '\\begin{array}{crcl}\n';

    // First equation
    result += `${eq1Parts.leftMain} &=& ${eq1Parts.right}`;
    result += ' \\\\[-0.5em]\n';

    // Underlines
    result += '\\underline{\\phantom{xxx}} && \\hspace{-0.1em}\\underline{\\phantom{xxx}}';
    result += ' \\\\[0.5em]\n';

    // Operation values (divisor/multiplier shown below)
    const divSymbol = operation.content.includes('÷') ? '' : '';
    const divValue = opValue || '2';
    result += `\\hspace{0.1em}${divValue} && ${divValue}`;
    result += ' \\\\[2em]\n';

    // Result equation
    result += `${eq2Parts.leftMain} &=& ${eq2Parts.right}`;
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

  // Process multiple problems in sequence
  formatMultipleProblems(problems) {
    const results = [];

    for (const problem of problems) {
      results.push({
        input: problem,
        output: this.formatSteps(problem)
      });
    }

    return results;
  }
}

// Export singleton
export const genericAlgebraFormatter = new GenericAlgebraFormatter();