/**
 * ContentAdapter - Converts various JSON inputs to container-specific formats
 * Intelligently extracts content from full document structures
 */

class ContentAdapter {
  /**
   * Extract usable content from full JSON documents
   */
  static extractContent(input) {
    if (!input) return null;

    // If it's already a simple array, return it
    if (Array.isArray(input)) {
      return input;
    }

    // Check for section document structure
    if (input.content) {
      // Full section document - extract the content object
      if (
        input.content.contentDescription ||
        input.content.contentVisualization
      ) {
        return input.content; // Return the whole content object for visualization support
      }
      // Simple content
      if (Array.isArray(input.content)) {
        return input.content;
      }
    }

    // Check for problem document structure
    if (input.structure?.stepsArray) {
      // Full problem document - extract steps for problemSolver
      return {
        type: "problem",
        steps: input.structure.stepsArray,
        problemTitle: input.problemTitle,
      };
    }

    // Check for individual step structure
    if (input.stepFormula) {
      return {
        type: "step",
        stepFormula: input.stepFormula,
        stepInstructions: input.stepInstructions,
        interactiveHelper: input.interactiveHelper,
      };
    }

    // Check for lesson/chapter preview structure
    if (input.preview?.previewDescription) {
      return input.preview.previewDescription;
    }

    // Check for direct content arrays in various formats
    if (input.contentDescription) return input;
    if (input.previewDescription) return input.previewDescription;
    if (input.stepFormula) return input.stepFormula;

    // If we can't identify the structure, return as-is
    return input;
  }

  /**
   * Detect content type from the extracted content
   */
  static detectContentType(content) {
    if (!content) return "unknown";

    // Check for extracted problem/step types
    if (content.type === "problem") return "problem";
    if (content.type === "step") return "step";

    // Check if it's already an array (simple content)
    if (Array.isArray(content)) {
      // Check for problem-like content
      if (
        content.some(
          (item) => item.type === "formula" && item.content?.includes("=")
        )
      ) {
        return "problem-step";
      }
      // Check for preview content
      if (content.some((item) => item.type?.startsWith("preview"))) {
        return "preview";
      }
      return "section";
    }

    // Check for section with visualization
    if (content.contentDescription && content.contentVisualization) {
      return "section-with-visual";
    }

    // Check for structured objects
    if (content.stepFormula) return "step";
    if (content.contentDescription) return "section";
    if (content.previewDescription) return "preview";

    return "unknown";
  }

  /**
   * Main adapter function - handles all input types
   */
  static adaptContent(input, containerType) {
    // First, extract the actual content from any wrapper structure
    const content = this.extractContent(input);

    if (!content) return null;

    // Handle problem structures specially
    if (content.type === "problem") {
      return this.adaptProblemContent(content, containerType);
    }

    // Handle individual step structures
    if (content.type === "step") {
      return this.adaptStepContent(content, containerType);
    }

    // Handle section with visualization
    if (content.contentDescription && content.contentVisualization) {
      return {
        content: this.adaptArrayForContainer(
          content.contentDescription,
          containerType
        ),
        visualization: content.contentVisualization,
        coverage: content.descriptionCoverage || 50,
      };
    }

    // If it's an array, adapt based on container
    if (Array.isArray(content)) {
      return this.adaptArrayForContainer(content, containerType);
    }

    // Handle other structured content
    const contentType = this.detectContentType(content);

    switch (contentType) {
      case "section":
        return this.adaptArrayForContainer(
          content.contentDescription || content,
          containerType
        );

      case "preview":
        return this.adaptArrayForContainer(
          content.previewDescription || content,
          containerType
        );

      default:
        return content;
    }
  }

  /**
   * Adapt problem content for different containers
   */
  static adaptProblemContent(problemContent, containerType) {
    const { steps, problemTitle } = problemContent;

    if (containerType === "problemSolver") {
      // For problemSolver, we typically show one step at a time
      // Return the first step's formula or allow cycling through steps
      if (steps && steps.length > 0) {
        // For now, return first step - could be enhanced to handle step navigation
        return steps[0].stepFormula;
      }
    } else if (containerType === "problemSelector") {
      // For problemSelector, show the problem title
      return problemTitle || [{ type: "text", content: "Problem" }];
    }

    // Default: return all steps as a sequence
    const allContent = [];
    if (problemTitle) {
      allContent.push(...problemTitle);
      allContent.push({ type: "separator" });
    }
    steps.forEach((step, index) => {
      if (index > 0) allContent.push({ type: "separator" });
      allContent.push(...(step.stepFormula || []));
      if (step.stepInstructions) {
        allContent.push(...step.stepInstructions);
      }
    });
    return allContent;
  }

  /**
   * Adapt individual step content
   */
  static adaptStepContent(stepContent, containerType) {
    if (containerType === "problemSolver") {
      return stepContent.stepFormula;
    } else if (containerType === "stepDescription") {
      return (
        stepContent.stepInstructions ||
        stepContent.interactiveHelper?.minimumHelp ||
        []
      );
    }

    // Default: combine formula and instructions
    const combined = [...(stepContent.stepFormula || [])];
    if (stepContent.stepInstructions) {
      combined.push({ type: "separator" });
      combined.push(...stepContent.stepInstructions);
    }
    return combined;
  }

  /**
   * Adapt a simple array for specific container needs
   */
  static adaptArrayForContainer(contentArray, containerType) {
    if (!Array.isArray(contentArray)) return contentArray;

    switch (containerType) {
      case "problemSolver":
        // Problem solver expects formula-heavy content
        return contentArray.map((item) => {
          // Ensure math content has proper delimiters
          if (item.type === "formula" && item.content) {
            const content = item.content.trim();
            if (!content.startsWith("$") && !content.startsWith("\\[")) {
              return {
                ...item,
                content: `$${content}$`,
              };
            }
          }
          return item;
        });

      case "previewBox":
        // Preview box expects preview-prefixed types
        return contentArray.map((item) => {
          if (item.type && !item.type.startsWith("preview")) {
            const typeMap = {
              text: "previewText",
              h1: "previewH1",
              h2: "previewH2",
              h3: "previewH3",
              bullet: "previewBullet",
              numberedItem: "previewNumberedItem",
              formula: "previewFormula",
              separator: "previewSeparator",
            };

            return {
              ...item,
              type: typeMap[item.type] || item.type,
            };
          }
          return item;
        });

      case "lessonDescription":
      case "stepDescription":
        // These can handle regular content as-is
        return contentArray;

      default:
        return contentArray;
    }
  }

  /**
   * Helper to create a step selector for problems
   */
  static createStepSelector(steps) {
    // This could be used to create UI for selecting different steps
    return {
      type: "stepSelector",
      steps: steps.map((step, index) => ({
        stepNumber: step.stepNumber || index + 1,
        stepId: step.stepId,
        preview: step.stepFormula?.[0]?.content || "Step " + (index + 1),
      })),
    };
  }
}

export default ContentAdapter;
