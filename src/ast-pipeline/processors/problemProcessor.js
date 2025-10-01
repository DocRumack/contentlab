/**
 * Problem Processor - Main orchestrator for problem parsing and formatting
 * Combines parser, alignment engine, and templates
 */

import MathParser from "../core/mathParser.js";
import AlignmentEngine from "../core/alignmentEngine.js";
import TemplateLibrary from "../core/templateLibrary.js";

class ProblemProcessor {
  constructor() {
    this.parser = new MathParser();
    this.aligner = new AlignmentEngine();
    this.templates = new TemplateLibrary();
  }

  /**
   * Process a complete problem from markdown to JSON
   */
  async processProblem(markdown, options = {}) {
    try {
      // Step 1: Parse the problem
      const parsed = this.parser.parseProblem(markdown);
      console.log("Parsed problem:", parsed);

      // Step 2: Apply template if available
      const templated = this.templates.getTemplate(
        parsed.problemType.key,
        parsed
      );
      console.log("Applied template:", templated);

      // Step 3: Align the steps
      let aligned;
      if (templated.formattedSteps) {
        aligned = templated.formattedSteps;
      } else {
        aligned = this.aligner.alignSteps(templated.steps);
      }
      console.log("Aligned steps:", aligned);

      // Step 4: Generate final JSON structure
      const json = this.generateJSON(parsed, aligned, options);

      // Step 5: Validate the output
      const validation = this.validateOutput(json);

      return {
        success: validation.isValid,
        data: json,
        validation: validation,
        debug: {
          parsed,
          templated,
          aligned,
        },
      };
    } catch (error) {
      console.error("Problem processing error:", error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  /**
   * Generate JSON in TestConstructor format
   */
  generateJSON(parsed, aligned, options) {
    // Generate proper TestConstructor Problem format
    const problemId = this.generateProblemId();
    const stepsArray = [];

    // Process steps into proper format
    if (Array.isArray(aligned)) {
      aligned.forEach((group, index) => {
        const stepId = `STID-${
          new Date().toISOString().split("T")[0]
        }-${Math.random().toString(36).substring(2, 11)}`;

        const step = {
          stepId: stepId,
          stepNumber: index + 1,
          stepFormula: [
            {
              type: "formula",
              content: `$${group.latex || group.expression}$`,
            },
          ],
        };

        // Add interactive helper (hints)
        const hints = this.generateHints(group, parsed.problemType);
        if (hints.length > 0) {
          step.interactiveHelper = {
            minimumHelp: hints[0] ? [{ type: "text", content: hints[0] }] : [],
            moderateHelp: hints[1] ? [{ type: "text", content: hints[1] }] : [],
            majorHelp: hints[2] ? [{ type: "text", content: hints[2] }] : [],
          };
        }

        // Add instructions if this is not the first step
        if (index > 0 && group.description) {
          step.stepInstructions = [
            {
              type: "text",
              content: group.description || this.generateDescription(group),
            },
          ];
        }

        stepsArray.push(step);
      });
    }

    const json = {
      _id: problemId,
      problemNumber: options.problemNumber || 1,
      problemTitle: [
        {
          type: "text",
          content: parsed.originalText,
        },
      ],
      parentReferences: options.parentReferences || {
        courseId: "COID-temp",
        courseName: "Generated Content",
        chapterId: "CHID-temp",
        chapterName: "Generated Chapter",
        chapterNumber: 1,
        lessonId: "LEID-temp",
        lessonName: "Generated Lesson",
        lessonNumber: 1,
        sectionId: "SEID-temp",
        sectionName: "Generated Section",
        sectionNumber: 1,
      },
      structure: {
        numberOfSteps: stepsArray.length,
        stepsArray: stepsArray,
      },
    };

    return json;
  }

  /**
   * Generate a problem ID
   */
  generateProblemId() {
    const date = new Date().toISOString().split("T")[0];
    const random = Math.random().toString(36).substring(2, 11);
    return `PRID-${date}-${random}`;
  }

  /**
   * Generate step description
   */
  generateDescription(group) {
    if (group.steps && group.steps.length > 0) {
      const lastStep = group.steps[group.steps.length - 1];
      if (lastStep.description) return lastStep.description;

      const hasOperation = group.steps.some((s) => s.isOperation);
      if (hasOperation) {
        const op = group.steps.find((s) => s.isOperation);
        return `After ${op.operation}ing ${op.value}`;
      }
    }
    return "Solution step";
  }

  /**
   * Generate instruction for a step
   */
  generateInstruction(operation) {
    const instructions = {
      add: `Add ${operation.value} to both sides`,
      subtract: `Subtract ${operation.value} from both sides`,
      multiply: `Multiply both sides by ${operation.value}`,
      divide: `Divide both sides by ${operation.value}`,
      factor: "Factor the expression",
      expand: "Expand the expression",
      simplify: "Simplify",
    };

    return instructions[operation.operation] || "Perform operation";
  }

  /**
   * Generate hints based on problem type and step
   */
  generateHints(group, problemType) {
    const hints = [];

    // Add general hints based on problem type
    if (problemType.type === "linear_equation") {
      hints.push("Remember: what you do to one side, you must do to the other");
      hints.push("Goal: isolate the variable on one side");
    } else if (problemType.type === "quadratic_equation") {
      hints.push("Consider factoring or using the quadratic formula");
      hints.push("Set the equation equal to zero first");
    }

    // Add specific hints based on operations
    if (group.steps) {
      const operations = group.steps.filter((s) => s.operation);
      operations.forEach((op) => {
        if (op.operation === "subtract") {
          hints.push(
            `Subtracting ${op.value} will eliminate the constant term`
          );
        } else if (op.operation === "divide") {
          hints.push(
            `Dividing by ${op.value} will give you the value of the variable`
          );
        }
      });
    }

    return hints.slice(0, 3); // Limit to 3 hints
  }

  /**
   * Validate the output JSON
   */
  validateOutput(json) {
    const issues = [];

    // Check required fields for new format
    if (!json._id) issues.push("Missing problem ID");
    if (!json.problemTitle || json.problemTitle.length === 0)
      issues.push("Missing problem title");
    if (!json.structure || !json.structure.stepsArray)
      issues.push("Missing steps structure");

    // Check each step
    json.structure?.stepsArray?.forEach((step, index) => {
      if (!step.stepFormula)
        issues.push(`Step ${index + 1}: Missing step formula`);
      if (!step.stepId) issues.push(`Step ${index + 1}: Missing step ID`);
    });

    return {
      isValid: issues.length === 0,
      issues: issues,
    };
  }

  /**
   * Basic LaTeX validation
   */
  isValidLatex(latex) {
    // Check for balanced braces
    let braceCount = 0;
    for (const char of latex) {
      if (char === "{") braceCount++;
      if (char === "}") braceCount--;
      if (braceCount < 0) return false;
    }
    if (braceCount !== 0) return false;

    // Check for required array structure
    if (latex.includes("\\begin{array}")) {
      if (!latex.includes("\\end{array}")) return false;
    }

    return true;
  }

  /**
   * Process multiple problems in batch
   */
  async processBatch(problems, options = {}) {
    const results = [];

    for (const problem of problems) {
      const result = await this.processProblem(problem, options);
      results.push({
        input: problem,
        ...result,
      });
    }

    return {
      total: problems.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results: results,
    };
  }
}

export default ProblemProcessor;
