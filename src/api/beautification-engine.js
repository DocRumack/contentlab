import { MathBeautyRules } from './beauty-rules.js';
import { algebraStepFormatter } from './algebra-step-formatter.js';
import { genericAlgebraFormatter } from './generic-algebra-formatter.js';

export class BeautificationEngine {
  constructor() {
    this.rules = MathBeautyRules;
    this.history = [];
    this.algebraFormatter = algebraStepFormatter;
    this.genericFormatter = genericAlgebraFormatter;
  }

  // Main beautification function
  async beautify(formula, api) {
    let improved = formula;

    // Step 0: Check for explicit operation format (e.g., "2x+4=10; -4; 2x=6")
    if (this.hasExplicitOperations(improved)) {
      // Use generic formatter and return immediately (no further processing needed)
      return this.genericFormatter.formatSteps(improved);
    } else if (this.isAlgebraicSolving(improved)) {
      // Legacy format without explicit operations
      improved = this.algebraFormatter.formatSteps(improved);
    } else if (improved.includes(';') && improved.includes('=')) {
      // Try the generic formatter for semicolon-separated equations
      return this.genericFormatter.formatSteps(improved);
    }

    // Step 1: Basic spacing (only for non-algebra formatting)
    improved = this.applySpacingRules(improved);
    
    // Step 2: Check for multi-line alignment needs
    if (this.needsAlignment(improved)) {
      improved = this.applyAlignmentRules(improved);
    }
    
    // Step 3: Visual verification
    if (api) {
      const result = await api.processFormula(improved);
      if (result.screenshot) {
        const adjustments = this.analyzeVisual(result.screenshot);
        if (adjustments.needed) {
          improved = this.applyVisualAdjustments(improved, adjustments);
        }
      }
    }
    
    return improved;
  }

  applySpacingRules(formula) {
    let result = formula;
    
    // Apply operator spacing
    Object.values(this.rules.spacing.operators).forEach(rule => {
      result = result.replace(rule.pattern, rule.replacement);
    });
    
    // Apply differential spacing
    result = result.replace(
      this.rules.spacing.differentials.pattern,
      this.rules.spacing.differentials.replacement
    );
    
    // Apply function spacing
    Object.values(this.rules.spacing.functions).forEach(rule => {
      result = result.replace(rule.pattern, rule.replacement);
    });
    
    return result;
  }

  needsAlignment(formula) {
    return formula.includes('\\\\') || 
           (formula.includes('=') && formula.length > 40);
  }

  applyAlignmentRules(formula) {
    // Detect type of alignment needed
    if (this.rules.alignment.arithmeticSteps.detect.test(formula)) {
      return this.alignArithmeticSteps(formula);
    }
    
    if (this.rules.alignment.equationSolving.detect.test(formula)) {
      return this.alignEquations(formula);
    }
    
    return formula;
  }

  alignArithmeticSteps(formula) {
    const lines = formula.split('\\\\').map(l => l.trim());
    const components = this.parseArithmeticComponents(lines);
    
    // Build array with proper columns
    let arraySpec = this.determineColumnSpec(components);
    let arrayContent = this.buildArrayContent(components);
    
    return `\\begin{array}{${arraySpec}}\n${arrayContent}\n\\end{array}`;
  }

  alignEquations(formula) {
    const lines = formula.split('\\\\').map(l => l.trim());
    const aligned = lines.map(line => {
      // Split on equals sign
      const parts = line.split('=').map(p => p.trim());
      if (parts.length === 2) {
        return `${parts[0]} & = & ${parts[1]}`;
      }
      return line;
    });
    
    return `\\begin{array}{rcl}\n${aligned.join(' \\\\\n')}\n\\end{array}`;
  }

  parseArithmeticComponents(lines) {
    return lines.map(line => {
      // Split on operators while preserving them
      const parts = line.split(/([+\-=×÷])/);
      return parts.filter(p => p.trim()).map(p => p.trim());
    });
  }

  determineColumnSpec(components) {
    // Determine the maximum number of columns needed
    const maxColumns = Math.max(...components.map(c => c.length));
    
    // Build column specification
    let spec = '';
    for (let i = 0; i < maxColumns; i++) {
      if (i % 2 === 0) {
        spec += 'r'; // Right-aligned for numbers
      } else {
        spec += 'c'; // Centered for operators
      }
    }
    
    return spec;
  }

  buildArrayContent(components) {
    return components.map(row => {
      return row.join(' & ');
    }).join(' \\\\\n');
  }

  analyzeVisual(screenshot) {
    // Placeholder for visual analysis
    // In real implementation, this would analyze the screenshot
    return {
      needed: false,
      adjustments: []
    };
  }

  applyVisualAdjustments(formula, adjustments) {
    // Placeholder for visual adjustments
    return formula;
  }

  hasExplicitOperations(formula) {
    // Check if formula has explicit operations like "2x+4=10; -4; 2x=6"
    const parts = formula.split(';').map(s => s.trim());
    if (parts.length < 3) return false;

    // Check if odd indices contain operations (+, -, ×, ÷)
    for (let i = 1; i < parts.length; i += 2) {
      if (parts[i].match(/^[+\-×÷*/]\d+$/) || parts[i].match(/^[+\-]\s*\d+$/)) {
        return true;
      }
    }
    return false;
  }

  isAlgebraicSolving(formula) {
    // Check if it matches pattern like "2x+4=10\\2x=6\\x=3"
    return this.rules.algebraicSolving &&
           this.rules.algebraicSolving.detectPattern.test(formula);
  }

  expandAlgebraicSteps(formula) {
    // Use the algebraic solving rules to expand the steps
    if (this.rules.algebraicSolving && this.rules.algebraicSolving.buildSolution) {
      return this.rules.algebraicSolving.buildSolution.call(this.rules.algebraicSolving, formula);
    }
    return formula;
  }
}