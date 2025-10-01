/**
 * Alignment Engine - Handles mathematical equation alignment
 * Creates properly aligned multi-step solutions
 */

class AlignmentEngine {
  constructor() {
    this.alignmentStrategies = {
      'equals': this.alignByEquals.bind(this),
      'operator': this.alignByOperator.bind(this),
      'decimal': this.alignByDecimal.bind(this),
      'fraction': this.alignByFraction.bind(this)
    };
  }

  /**
   * Main alignment method - determines best strategy and applies it
   */
  alignSteps(steps, strategy = 'auto') {
    if (strategy === 'auto') {
      strategy = this.detectBestStrategy(steps);
    }
    
    const alignmentFunc = this.alignmentStrategies[strategy] || this.alignByEquals;
    return alignmentFunc(steps);
  }

  /**
   * Detect the best alignment strategy based on content
   */
  detectBestStrategy(steps) {
    // Check if all steps have equals signs
    const allHaveEquals = steps.every(step => 
      step.expression && step.expression.includes('=')
    );
    
    if (allHaveEquals) return 'equals';
    
    // Check for consistent operators
    const hasConsistentOps = steps.every(step =>
      step.expression && /[+\-*/]/.test(step.expression)
    );
    
    if (hasConsistentOps) return 'operator';
    
    return 'equals'; // Default
  }

  /**
   * Align by equals sign - most common for equation solving
   */
  alignByEquals(steps) {
    const aligned = [];
    
    for (const step of steps) {
      if (!step.expression) {
        aligned.push(step);
        continue;
      }
      
      const parts = step.expression.split('=');
      if (parts.length === 2) {
        const left = parts[0].trim();
        const right = parts[1].trim();
        
        aligned.push({
          ...step,
          aligned: {
            left: left,
            operator: '=',
            right: right,
            latex: `${left} &=& ${right}`
          }
        });
      } else {
        aligned.push({
          ...step,
          aligned: {
            center: step.expression,
            latex: step.expression
          }
        });
      }
    }
    
    return this.createLatexArray(aligned);
  }

  /**
   * Create a LaTeX array from aligned steps
   */
  createLatexArray(alignedSteps) {
    const latexLines = [];
    
    for (let i = 0; i < alignedSteps.length; i++) {
      const step = alignedSteps[i];
      
      if (step.isOperation) {
        // This is an operation line (like "- 4 = - 4")
        latexLines.push(this.formatOperationLine(step));
      } else if (step.aligned) {
        // This is a regular equation line
        latexLines.push(step.aligned.latex);
      }
      
      // Add horizontal line after operation if needed
      if (step.isOperation && i < alignedSteps.length - 1) {
        latexLines.push('\\hline');
      }
    }
    
    // Wrap in array environment
    const latex = `\\begin{array}{rcl}\n${latexLines.join(' \\\\\n')}\n\\end{array}`;
    
    return {
      steps: alignedSteps,
      latex: latex,
      display: this.generateDisplay(alignedSteps)
    };
  }

  /**
   * Format an operation line (like "- 4 = - 4")
   */
  formatOperationLine(step) {
    if (step.operation === 'subtract') {
      return `-${step.value} &=& -${step.value}`;
    } else if (step.operation === 'add') {
      return `+${step.value} &=& +${step.value}`;
    } else if (step.operation === 'multiply') {
      return `\\times ${step.value} &=& \\times ${step.value}`;
    } else if (step.operation === 'divide') {
      return `\\div ${step.value} &=& \\div ${step.value}`;
    }
    return step.aligned?.latex || '';
  }

  /**
   * Generate display object for each step
   */
  generateDisplay(alignedSteps) {
    const displays = [];
    let currentGroup = [];
    
    for (let i = 0; i < alignedSteps.length; i++) {
      const step = alignedSteps[i];
      
      if (step.newGroup && currentGroup.length > 0) {
        // Start a new display group
        displays.push(this.createDisplayGroup(currentGroup));
        currentGroup = [];
      }
      
      currentGroup.push(step);
      
      // Check if this completes an operation sequence
      if (step.isResult || (step.isOperation && i + 1 < alignedSteps.length && alignedSteps[i + 1].isResult)) {
        // Include the next step if it's the result
        if (step.isOperation && i + 1 < alignedSteps.length) {
          currentGroup.push(alignedSteps[i + 1]);
          i++; // Skip the next iteration since we've included it
        }
        displays.push(this.createDisplayGroup(currentGroup));
        currentGroup = [];
      }
    }
    
    // Add any remaining steps
    if (currentGroup.length > 0) {
      displays.push(this.createDisplayGroup(currentGroup));
    }
    
    return displays;
  }

  /**
   * Create a display group (typically 3 lines: equation, operation, result)
   */
  createDisplayGroup(steps) {
    const latexLines = [];
    
    for (const step of steps) {
      if (step.aligned) {
        latexLines.push(step.aligned.latex);
      }
      if (step.isOperation) {
        // Add horizontal line after operation
        latexLines.push('\\hline');
      }
    }
    
    return {
      latex: `\\begin{array}{rcl}\n${latexLines.join(' \\\\\n')}\n\\end{array}`,
      steps: steps.map(s => ({
        expression: s.expression,
        operation: s.operation,
        description: s.description
      }))
    };
  }

  /**
   * Align by operator position
   */
  alignByOperator(steps) {
    // Implementation for operator-based alignment
    // Useful for showing distribution, factoring, etc.
    return this.alignByEquals(steps); // Fallback for now
  }

  /**
   * Align by decimal point
   */
  alignByDecimal(steps) {
    // Implementation for decimal alignment
    // Useful for arithmetic operations
    return this.alignByEquals(steps); // Fallback for now
  }

  /**
   * Align fractions
   */
  alignByFraction(steps) {
    // Implementation for fraction alignment
    // Useful for fraction operations
    return this.alignByEquals(steps); // Fallback for now
  }

  /**
   * Check visual alignment quality
   */
  checkAlignment(latex) {
    // This would integrate with visual validation later
    const checks = {
      hasArray: latex.includes('\\begin{array}'),
      hasAlignment: latex.includes('&'),
      lineCount: (latex.match(/\\\\/g) || []).length + 1,
      hasHline: latex.includes('\\hline')
    };
    
    return {
      valid: checks.hasArray && checks.hasAlignment,
      checks: checks
    };
  }
}

export default AlignmentEngine;