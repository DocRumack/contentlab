/**
 * Math Parser - Core parsing engine for mathematical expressions
 * Handles detection and parsing of math problems and their steps
 */

class MathParser {
  constructor() {
    // Problem type patterns
    this.problemPatterns = {
      linear_single: {
        pattern: /^[\s\S]*?(\d*)\s*([a-zA-Z])\s*([+\-])\s*(\d+)\s*=\s*(\d+)/,
        type: 'linear_equation',
        variables: 1,
        description: 'Single variable linear equation'
      },
      linear_both_sides: {
        pattern: /^[\s\S]*?(\d*)\s*([a-zA-Z])\s*([+\-])\s*(\d+)\s*=\s*(\d*)\s*([a-zA-Z])\s*([+\-])\s*(\d+)/,
        type: 'linear_equation_both_sides',
        variables: 1,
        description: 'Linear equation with variables on both sides'
      },
      quadratic_standard: {
        pattern: /^[\s\S]*?(\d*)\s*([a-zA-Z])\^2\s*([+\-])\s*(\d*)\s*([a-zA-Z])\s*([+\-])\s*(\d+)\s*=\s*(\d+)/,
        type: 'quadratic_equation',
        variables: 1,
        description: 'Standard form quadratic equation'
      },
      system_linear: {
        pattern: /system|equations/i,
        type: 'system_of_equations',
        variables: 2,
        description: 'System of linear equations'
      },
      derivative: {
        pattern: /derivative|\\frac\{d\}\{dx\}|f'\(x\)|dy\/dx/i,
        type: 'derivative',
        description: 'Calculus derivative'
      },
      integral: {
        pattern: /integral|\\int|∫/i,
        type: 'integral',
        description: 'Calculus integral'
      }
    };

    // Operation patterns
    this.operations = {
      addition: /add|plus|\+/i,
      subtraction: /subtract|minus|\-/i,
      multiplication: /multiply|times|\*/i,
      division: /divide|over|\//i,
      factoring: /factor/i,
      expanding: /expand|distribute/i,
      simplifying: /simplify/i
    };
  }

  /**
   * Parse a math problem and identify its type
   */
  parseProblem(text) {
    // Clean the input
    const cleaned = this.cleanInput(text);
    
    // Identify problem type
    const problemType = this.identifyProblemType(cleaned);
    
    // Extract components
    const components = this.extractComponents(cleaned, problemType);
    
    // Determine solution steps
    const steps = this.determineSolutionSteps(components, problemType);
    
    return {
      originalText: text,
      cleanedText: cleaned,
      problemType: problemType,
      components: components,
      suggestedSteps: steps,
      metadata: {
        hasVariables: this.detectVariables(cleaned),
        hasFractions: this.detectFractions(cleaned),
        hasExponents: this.detectExponents(cleaned),
        complexity: this.assessComplexity(problemType, components)
      }
    };
  }

  /**
   * Clean input text for parsing
   */
  cleanInput(text) {
    return text
      .replace(/\\text\{([^}]+)\}/g, '$1')  // Remove LaTeX text commands
      .replace(/\s+/g, ' ')                  // Normalize whitespace
      .trim();
  }

  /**
   * Identify the type of math problem
   */
  identifyProblemType(text) {
    for (const [key, pattern] of Object.entries(this.problemPatterns)) {
      if (pattern.pattern.test(text)) {
        return {
          key: key,
          ...pattern
        };
      }
    }
    
    return {
      key: 'unknown',
      type: 'unknown',
      description: 'Unidentified problem type'
    };
  }

  /**
   * Extract mathematical components from the problem
   */
  extractComponents(text, problemType) {
    const components = {
      variables: [],
      constants: [],
      operators: [],
      equals: false,
      leftSide: '',
      rightSide: ''
    };

    // Split on equals if present
    if (text.includes('=')) {
      components.equals = true;
      const parts = text.split('=');
      components.leftSide = parts[0].trim();
      components.rightSide = parts[1]?.trim() || '';
    }

    // Extract variables (single letters)
    const varMatches = text.match(/[a-zA-Z]/g);
    if (varMatches) {
      components.variables = [...new Set(varMatches)];
    }

    // Extract numbers
    const numMatches = text.match(/\d+/g);
    if (numMatches) {
      components.constants = numMatches.map(n => parseInt(n));
    }

    // Extract operators
    const ops = text.match(/[+\-*/]/g);
    if (ops) {
      components.operators = ops;
    }

    return components;
  }

  /**
   * Determine solution steps based on problem type
   */
  determineSolutionSteps(components, problemType) {
    const steps = [];
    
    switch (problemType.key) {
      case 'linear_single':
        // Example: 2x + 4 = 10
        if (components.operators.includes('+') || components.operators.includes('-')) {
          steps.push({
            operation: 'isolate_constant',
            description: 'Move constant to right side'
          });
        }
        steps.push({
          operation: 'isolate_variable',
          description: 'Divide by coefficient'
        });
        break;
        
      case 'quadratic_standard':
        steps.push({
          operation: 'move_to_standard',
          description: 'Move all terms to one side'
        });
        steps.push({
          operation: 'factor_or_formula',
          description: 'Factor or use quadratic formula'
        });
        break;
        
      case 'derivative':
        steps.push({
          operation: 'identify_rule',
          description: 'Identify differentiation rule'
        });
        steps.push({
          operation: 'apply_rule',
          description: 'Apply the rule'
        });
        steps.push({
          operation: 'simplify',
          description: 'Simplify the result'
        });
        break;
    }
    
    return steps;
  }

  /**
   * Detect if expression contains variables
   */
  detectVariables(text) {
    return /[a-zA-Z]/.test(text);
  }

  /**
   * Detect if expression contains fractions
   */
  detectFractions(text) {
    return /\\frac|\//.test(text);
  }

  /**
   * Detect if expression contains exponents
   */
  detectExponents(text) {
    return /\^|\\pow|\*\*/.test(text);
  }

  /**
   * Assess problem complexity
   */
  assessComplexity(problemType, components) {
    let score = 1; // Base complexity
    
    // Add complexity for various factors
    if (components.variables.length > 1) score += 2;
    if (components.operators.length > 2) score += 1;
    if (problemType.key.includes('quadratic')) score += 2;
    if (problemType.key.includes('system')) score += 3;
    if (problemType.key.includes('derivative')) score += 3;
    if (problemType.key.includes('integral')) score += 4;
    
    if (score <= 2) return 'basic';
    if (score <= 4) return 'intermediate';
    return 'advanced';
  }
}

export default MathParser;