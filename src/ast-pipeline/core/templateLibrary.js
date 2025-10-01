/**
 * Template Library - Pre-built templates for common problem types
 * Provides structured solutions with proper alignment
 */

class TemplateLibrary {
  constructor() {
    this.templates = {
      linear_single_add: this.linearSingleAdd.bind(this),
      linear_single_subtract: this.linearSingleSubtract.bind(this),
      linear_both_sides: this.linearBothSides.bind(this),
      quadratic_factor: this.quadraticFactor.bind(this),
      quadratic_formula: this.quadraticFormula.bind(this),
      derivative_power: this.derivativePower.bind(this),
      derivative_chain: this.derivativeChain.bind(this),
      integral_power: this.integralPower.bind(this),
    };
  }

  /**
   * Get template for a specific problem type
   */
  getTemplate(problemType, problemData) {
    // Try to find exact match
    const templateKey = this.findTemplateKey(problemType, problemData);
    const template = this.templates[templateKey];

    if (template) {
      return template(problemData);
    }

    // Return generic template
    return this.genericTemplate(problemData);
  }

  /**
   * Find the best matching template key
   */
  findTemplateKey(problemType, problemData) {
    if (problemType.includes("linear")) {
      if (problemData.components?.operators?.includes("+")) {
        return "linear_single_subtract"; // Subtract to solve
      } else if (problemData.components?.operators?.includes("-")) {
        return "linear_single_add"; // Add to solve
      }
    }

    if (problemType.includes("quadratic")) {
      return "quadratic_factor"; // Try factoring first
    }

    if (problemType.includes("derivative")) {
      return "derivative_power"; // Most common
    }

    return "generic";
  }

  /**
   * Template: Linear equation with addition (e.g., x - 3 = 5)
   */
  linearSingleAdd(data) {
    const { cleanedText, components } = data;
    const expression = cleanedText || data.expression;
    const steps = [];

    // Parse the expression (e.g., "x - 3 = 5")
    const match = expression
      ? expression.match(/([a-z])\s*-\s*(\d+)\s*=\s*(\d+)/i)
      : null;
    if (!match) return this.genericTemplate(data);

    const [, variable, subtracted, result] = match;
    const sum = parseInt(result) + parseInt(subtracted);

    steps.push({
      stepNumber: 1,
      expression: `${variable} - ${subtracted} = ${result}`,
      description: "Original equation",
      isResult: false,
    });

    steps.push({
      stepNumber: 2,
      expression: `+ ${subtracted} = + ${subtracted}`,
      description: `Add ${subtracted} to both sides`,
      operation: "add",
      value: subtracted,
      isOperation: true,
    });

    steps.push({
      stepNumber: 3,
      expression: `${variable} = ${sum}`,
      description: "Simplified result",
      isResult: true,
    });

    return this.formatStepsWithLatex(steps);
  }

  /**
   * Template: Linear equation with subtraction (e.g., x + 4 = 10)
   */
  linearSingleSubtract(data) {
    const expression = data.cleanedText || data.expression;
    const steps = [];

    // Parse the expression (e.g., "2x + 4 = 10")
    const match = expression
      ? expression.match(/(\d*)([a-z])\s*\+\s*(\d+)\s*=\s*(\d+)/i)
      : null;
    if (!match) return this.genericTemplate(data);

    const [, coefficient, variable, added, result] = match;
    const coef = coefficient || "1";
    const difference = parseInt(result) - parseInt(added);

    // Step 1: Original equation
    steps.push({
      stepNumber: 1,
      expression: `${
        coef === "1" ? "" : coef
      }${variable} + ${added} = ${result}`,
      description: "Original equation",
      isResult: false,
    });

    // Step 2: Subtract from both sides
    steps.push({
      stepNumber: 2,
      expression: `- ${added} = - ${added}`,
      description: `Subtract ${added} from both sides`,
      operation: "subtract",
      value: added,
      isOperation: true,
    });

    // Step 3: Simplified after subtraction
    steps.push({
      stepNumber: 3,
      expression: `${coef === "1" ? "" : coef}${variable} = ${difference}`,
      description: "Simplified equation",
      isResult: true,
      newGroup: coef !== "1", // Start new group if we need to divide
    });

    // Step 4: Divide if there's a coefficient
    if (coef !== "1") {
      steps.push({
        stepNumber: 4,
        expression: `÷ ${coef} = ÷ ${coef}`,
        description: `Divide both sides by ${coef}`,
        operation: "divide",
        value: coef,
        isOperation: true,
      });

      const finalResult = difference / parseInt(coef);
      steps.push({
        stepNumber: 5,
        expression: `${variable} = ${finalResult}`,
        description: "Final answer",
        isResult: true,
      });
    }

    return this.formatStepsWithLatex(steps);
  }

  /**
   * Template: Quadratic by factoring
   */
  quadraticFactor(data) {
    const expression = data.cleanedText || data.expression;
    const steps = [];

    // This is a simplified example - real implementation would be more complex
    steps.push({
      stepNumber: 1,
      expression: expression,
      description: "Original equation",
    });

    steps.push({
      stepNumber: 2,
      expression: "Move all terms to one side",
      description: "Standard form",
    });

    steps.push({
      stepNumber: 3,
      expression: "Factor the expression",
      description: "Factored form",
    });

    return this.formatStepsWithLatex(steps);
  }

  /**
   * Template: Quadratic formula
   */
  quadraticFormula(data) {
    // Implementation for quadratic formula
    return this.genericTemplate(data);
  }

  /**
   * Template: Derivative using power rule
   */
  derivativePower(data) {
    const expression = data.cleanedText || data.expression;
    const steps = [];

    // Parse for power rule (e.g., "f(x) = x^3")
    const match = expression ? expression.match(/([a-z])\^(\d+)/i) : null;
    if (match) {
      const [, variable, power] = match;
      const newPower = parseInt(power) - 1;

      steps.push({
        stepNumber: 1,
        expression: `f(x) = ${variable}^${power}`,
        description: "Original function",
      });

      steps.push({
        stepNumber: 2,
        expression: `f'(x) = ${power}${variable}^${newPower}`,
        description: "Apply power rule: bring down exponent, reduce by 1",
      });
    }

    return this.formatStepsWithLatex(steps);
  }

  /**
   * Template: Derivative using chain rule
   */
  derivativeChain(data) {
    // Implementation for chain rule
    return this.genericTemplate(data);
  }

  /**
   * Template: Integral using power rule
   */
  integralPower(data) {
    // Implementation for integration
    return this.genericTemplate(data);
  }

  /**
   * Template: Linear equation with variables on both sides
   */
  linearBothSides(data) {
    // Implementation for both sides
    return this.genericTemplate(data);
  }

  /**
   * Generic template for unmatched problems
   */
  genericTemplate(data) {
    return {
      steps: [
        {
          stepNumber: 1,
          expression:
            data.cleanedText || data.expression || "Unknown expression",
          description: "Please provide manual solution steps",
        },
      ],
      needsManualIntervention: true,
    };
  }

  /**
   * Format steps with proper LaTeX
   */
  formatStepsWithLatex(steps) {
    const formatted = [];
    let currentGroup = [];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      // Check if we should start a new group
      if (step.newGroup && currentGroup.length > 0) {
        formatted.push(this.createLatexGroup(currentGroup));
        currentGroup = [];
      }

      currentGroup.push(step);

      // Check if we should close the current group
      if (step.isOperation) {
        // Look ahead for the result
        if (i + 1 < steps.length && steps[i + 1].isResult) {
          currentGroup.push(steps[i + 1]);
          i++; // Skip next iteration
        }
        formatted.push(this.createLatexGroup(currentGroup));
        currentGroup = [];
      }
    }

    // Add any remaining steps
    if (currentGroup.length > 0) {
      formatted.push(this.createLatexGroup(currentGroup));
    }

    return {
      steps: steps,
      formattedSteps: formatted,
      complete: true,
    };
  }

  /**
   * Create a LaTeX group for display
   */
  createLatexGroup(steps) {
    const lines = [];
    let hasOperation = false;

    for (const step of steps) {
      if (step.isOperation) {
        hasOperation = true;
        // Format operation line
        const op = this.getOperatorSymbol(step.operation);
        lines.push(`${op} ${step.value} &=& ${op} ${step.value}`);
      } else {
        // Format equation line
        const parts = step.expression.split("=");
        if (parts.length === 2) {
          lines.push(`${parts[0].trim()} &=& ${parts[1].trim()}`);
        } else {
          lines.push(step.expression);
        }
      }
    }

    // Add horizontal line after operation
    const latexLines = [];
    for (let i = 0; i < lines.length; i++) {
      latexLines.push(lines[i]);
      if (hasOperation && i === lines.length - 2) {
        latexLines.push("\\hline");
      }
    }

    return {
      latex: `\\begin{array}{rcl}\n${latexLines.join(" \\\\\n")}\n\\end{array}`,
      steps: steps,
      description: steps[steps.length - 1].description || "",
    };
  }

  /**
   * Get LaTeX operator symbol
   */
  getOperatorSymbol(operation) {
    const symbols = {
      add: "+",
      subtract: "-",
      multiply: "\\times",
      divide: "\\div",
    };
    return symbols[operation] || "";
  }
}

export default TemplateLibrary;
