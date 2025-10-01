export const MathBeautyRules = {
  // SPACING RULES
  spacing: {
    operators: {
      binary: {
        // +, -, =, <, >, etc.
        pattern: /([^\s\\])([+\-=<>≤≥±∓×÷])([^\s\\])/g,
        replacement: '$1\\hspace{0.2em}$2\\hspace{0.2em}$3',
        description: 'Add space around binary operators'
      },
      equals: {
        pattern: /([^\s\\])=([^\s\\])/g,
        replacement: '$1\\hspace{0.25em}=\\hspace{0.25em}$2',
        priority: 'high'
      }
    },
    
    differentials: {
      pattern: /([^\s\\])(d[xyztr])/g,
      replacement: '$1\\hspace{0.15em}$2',
      description: 'Space before differentials'
    },
    
    functions: {
      trig: {
        pattern: /(\\(?:sin|cos|tan|cot|sec|csc))([^\s\\{])/g,
        replacement: '$1\\hspace{0.1em}$2'
      },
      log: {
        pattern: /(\\(?:log|ln|lg))([^\s\\{])/g,
        replacement: '$1\\hspace{0.1em}$2'
      }
    }
  },

  // ALIGNMENT PATTERNS
  alignment: {
    arithmeticSteps: {
      detect: /.*[+\-×÷].*\\\\.*[+\-×÷].*/,
      process: function(input) {
        // Parse into operation steps
        const lines = input.split('\\\\');
        const parsed = parseArithmeticSteps(lines);
        return buildArithmeticArray(parsed);
      }
    },
    
    equationSolving: {
      detect: /.*=.*\\\\.*=.*/,
      columnSpec: 'rcl', // right, center, left
      alignOn: '='
    }
  },

  // ALGEBRAIC SOLVING PATTERNS
  algebraicSolving: {
    // Detect equation solving steps like "2x+4=10\\2x=6\\x=3"
    detectPattern: /^([^\\]+)=([^\\]+)\\\\([^\\]+)=([^\\]+)\\\\([^\\]+)=([^\\]+)$/,
    
    // Analyze what operation was performed between steps
    analyzeSteps: function(step1, step2) {
      // Check if it's subtraction (terms disappear)
      if (step1.includes('+') && !step2.includes('+')) {
        const removed = step1.match(/\+(\d+)/);
        if (removed) return { operation: 'subtract', value: removed[1] };
      }
      if (step1.includes('-') && !step2.includes('-')) {
        const removed = step1.match(/-(\d+)/);
        if (removed) return { operation: 'add', value: removed[1] };
      }
      
      // Check if it's division (coefficient changes)
      const coef1 = step1.match(/(\d+)x/);
      const coef2 = step2.match(/(\d+)?x/) || step2.match(/^x/);
      if (coef1 && coef1[1] && (coef2 || step2.includes('x'))) {
        // If step2 has just 'x' or '1x', the coefficient is 1
        const newCoef = coef2 && coef2[1] ? coef2[1] : '1';
        if (newCoef === '1' && coef1[1] !== '1') {
          return { operation: 'divide', value: coef1[1] };
        }
      }
      
      return { operation: 'unknown' };
    },
    
    // Build the formatted solution with operation lines
    buildSolution: function(steps) {
      const lines = steps.split('\\\\');
      if (lines.length !== 3) return steps;

      const [line1, line2, line3] = lines;

      // Parse the equations
      const eq1 = line1.split('=').map(s => s.trim());
      const eq2 = line2.split('=').map(s => s.trim());
      const eq3 = line3.split('=').map(s => s.trim());

      // Determine operations
      const op1 = this.analyzeSteps(eq1[0], eq2[0]);
      const op2 = this.analyzeSteps(eq2[0], eq3[0]);

      // Build array with operation lines between equations
      let result = '\\begin{array}{rcl}\n';

      // First equation
      result += eq1[0] + ' & = & ' + eq1[1] + ' \\\\\n';

      // First operation line (centered between equations)
      if (op1.operation === 'subtract') {
        result += '& & -' + op1.value + ' \\quad -' + op1.value + ' \\\\\n';
        result += '\\hline\n';
      } else if (op1.operation === 'add') {
        result += '& & +' + op1.value + ' \\quad +' + op1.value + ' \\\\\n';
        result += '\\hline\n';
      }

      // Second equation
      result += eq2[0] + ' & = & ' + eq2[1] + ' \\\\\n';

      // Second operation line (centered between equations)
      if (op2.operation === 'divide') {
        result += '& & \\div ' + op2.value + ' \\quad \\div ' + op2.value + ' \\\\\n';
        result += '\\hline\n';
      } else if (op2.operation === 'multiply') {
        result += '& & \\times ' + op2.value + ' \\quad \\times ' + op2.value + ' \\\\\n';
        result += '\\hline\n';
      }

      // Final equation
      result += eq3[0] + ' & = & ' + eq3[1] + ' \\\\\n';

      result += '\\end{array}';

      return result;
    }
  },

  // ARITHMETIC SPECIFIC
  arithmetic: {
    subtraction: {
      pattern: `\\begin{array}{r@{\\,}r}
  & {number1} \\\\
- & {number2} \\\\
\\cline{2-2}
  & {result}
\\end{array}`
    },
    
    division: {
      pattern: `\\begin{array}{r|l}
  & {quotient} \\\\
\\hline
{divisor} & {dividend}
\\end{array}`
    }
  }
};