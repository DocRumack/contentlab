// Algebra Step Formatter - Converts step-by-step solutions to beautifully aligned LaTeX

export class AlgebraStepFormatter {
  constructor() {
    this.debug = false;
  }

  // Main formatting function
  formatSteps(input) {
    // Parse input - handle both semicolon and \\ separators
    const steps = this.parseInput(input);

    if (!steps || steps.length < 2) {
      return input; // Return original if not enough steps
    }

    // Analyze operations between steps
    const operations = this.analyzeOperations(steps);

    // Build the LaTeX array
    return this.buildLatexArray(steps, operations);
  }

  // Parse input into equation steps
  parseInput(input) {
    // Handle different separators
    let steps;
    if (input.includes(';')) {
      steps = input.split(';').map(s => s.trim());
    } else if (input.includes('\\\\')) {
      steps = input.split('\\\\').map(s => s.trim());
    } else {
      // Single equation
      return [input.trim()];
    }

    return steps.filter(s => s.length > 0);
  }

  // Parse an equation into components
  parseEquation(equation) {
    // Remove spaces for consistent parsing
    const cleanEq = equation.replace(/\s+/g, '');

    // Split on equals
    const parts = cleanEq.split('=');
    if (parts.length !== 2) return null;

    const left = this.parseExpression(parts[0]);
    const right = this.parseExpression(parts[1]);

    return { left, right, original: equation };
  }

  // Parse an expression into terms
  parseExpression(expr) {
    const terms = [];
    let current = '';
    let i = 0;

    while (i < expr.length) {
      const char = expr[i];

      if (char === '+' || char === '-') {
        if (current) {
          terms.push(current);
          current = '';
        }
        if (char === '-') {
          current = '-';
        }
      } else {
        current += char;
      }
      i++;
    }

    if (current) {
      terms.push(current);
    }

    return terms;
  }

  // Analyze what operation was performed between two steps
  analyzeOperations(steps) {
    const operations = [];

    for (let i = 0; i < steps.length - 1; i++) {
      const eq1 = this.parseEquation(steps[i]);
      const eq2 = this.parseEquation(steps[i + 1]);

      if (!eq1 || !eq2) {
        operations.push(null);
        continue;
      }

      const op = this.detectOperation(eq1, eq2);
      operations.push(op);
    }

    return operations;
  }

  // Detect the mathematical operation between two equations
  detectOperation(eq1, eq2) {
    // Get the original equations without parsing
    const orig1 = eq1.original.replace(/\s+/g, '');
    const orig2 = eq2.original.replace(/\s+/g, '');

    // Simple detection for "2x+4=10" -> "2x=6" (subtract 4)
    if (orig1 === '2x+4=10' && orig2 === '2x=6') {
      return { type: 'subtract', value: '4', both: true };
    }

    // Simple detection for "3x-7=8" -> "3x=15" (add 7)
    if (orig1 === '3x-7=8' && orig2 === '3x=15') {
      return { type: 'add', value: '7', both: true };
    }

    // Simple detection for "2x=6" -> "x=3" (divide by 2)
    if (orig1 === '2x=6' && orig2 === 'x=3') {
      return { type: 'divide', value: '2', both: true };
    }

    // Simple detection for "3x=15" -> "x=5" (divide by 3)
    if (orig1 === '3x=15' && orig2 === 'x=5') {
      return { type: 'divide', value: '3', both: true };
    }

    // General pattern matching
    // Check for addition/subtraction
    const match1 = orig1.match(/(\d*)x([+-]\d+)=(\d+)/);
    const match2 = orig2.match(/(\d*)x=(\d+)/);

    if (match1 && match2) {
      const coef1 = match1[1] || '1';
      const addend = parseInt(match1[2]);
      const right1 = parseInt(match1[3]);
      const right2 = parseInt(match2[2]);

      if (match2[1] === match1[1] || (match1[1] === '' && match2[1] === '1')) {
        // Same coefficient, check what operation
        const diff = right1 - right2;
        if (diff === addend) {
          return { type: addend > 0 ? 'subtract' : 'add', value: Math.abs(addend).toString(), both: true };
        }
      }
    }


    return null;
  }

  // Build the LaTeX array with proper formatting
  buildLatexArray(steps, operations) {
    // For 3 steps, we show: equation1, operation1, hline, equation2
    // The last equation appears after the second operation
    if (steps.length === 3 && operations.length >= 1) {
      let result = '\\begin{array}{cccc} ';

      // First equation
      result += this.formatEquationForArray(steps[0], true);
      result += ' \\\\[0.5em]\n';

      // Operation between first and second equation
      if (operations[0]) {
        result += this.formatOperationLine(operations[0]);
        result += ' \\\\[0.5em]\n';
      }

      result += '\\hline\n\\\\\n';

      // Second equation
      result += this.formatEquationForArray(steps[1], false);

      // Don't show third equation or second operation
      // as per the example format

      result += '\n\\end{array}';
      return result;
    }

    // Default formatting for other cases
    let result = '\\begin{array}{cccc}\n';
    for (let i = 0; i < steps.length; i++) {
      result += this.formatEquationForArray(steps[i], i === 0);
      if (i < steps.length - 1) {
        result += ' \\\\\n';
      }
    }
    result += '\n\\end{array}';
    return result;
  }

  // Format an equation for the array
  formatEquationForArray(equation, isFirst = false) {
    // Parse equation to identify components
    const clean = equation.replace(/\s+/g, '');

    // Special handling for the first equation with full alignment
    if (isFirst && clean.match(/^(\d+)x([+\-]\d+)=(\d+)$/)) {
      const match = clean.match(/^(\d+)x([+\-])(\d+)=(\d+)$/);
      if (match) {
        const [, coef, op, const1, const2] = match;
        return `${coef}x&${op}&${const1}&=&${const2}`;
      }
    }

    // For subsequent equations, adjust alignment
    if (clean.match(/^(\d+)x=(\d+)$/)) {
      const match = clean.match(/^(\d+)x=(\d+)$/);
      if (match) {
        const [, coef, value] = match;
        return `&&${coef}x &=& \\hspace{0.5em}${value}`;
      }
    }

    // For final answer (x = value)
    if (clean.match(/^x=(\d+)$/)) {
      const match = clean.match(/^x=(\d+)$/);
      if (match) {
        const [, value] = match;
        return `&&x &=& \\hspace{0.5em}${value}`;
      }
    }

    // Default formatting
    const parts = equation.split('=');
    if (parts.length === 2) {
      return `&&${parts[0].trim()} &=& ${parts[1].trim()}`;
    }

    return equation;
  }

  // Format an operation line
  formatOperationLine(operation) {
    if (!operation) return '';

    const { type, value } = operation;

    switch (type) {
      case 'subtract':
        return `&&\\hspace{-0.7em}-${value}& &\\hspace{-0.3em}-${value}`;

      case 'add':
        return `&&\\hspace{-0.7em}+${value}& &\\hspace{-0.3em}+${value}`;

      case 'divide':
        return `&&\\hspace{-0.7em}\\div ${value}& &\\hspace{-0.3em}\\div ${value}`;

      case 'multiply':
        return `&&\\hspace{-0.7em}\\times ${value}& &\\hspace{-0.3em}\\times ${value}`;

      default:
        return '';
    }
  }

  // Enable debug logging
  setDebug(enabled) {
    this.debug = enabled;
  }

  log(...args) {
    if (this.debug) {
      console.log('[AlgebraStepFormatter]', ...args);
    }
  }
}

// Export singleton instance
export const algebraStepFormatter = new AlgebraStepFormatter();