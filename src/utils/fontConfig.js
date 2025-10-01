/**
 * fontConfig.js - Content Creation Lab version
 * Centralized font sizing system for consistent rendering
 */

export const fontConfig = {
  // Base font size in pixels
  baseSize: 14,

  // Global scale (0.8=xs, 0.9=s, 1.0=m, 1.1=l, 1.2=xl)
  globalScale: 1.0,

  // Component-specific scales
  componentScales: {
    // Navigation components
    navigation: 1.0,
    navigationTitle: 0.86,

    // Preview component
    preview: 1.0,
    previewTitle: 1.29,

    // Lesson description
    lesson: 1.0,
    lessonTitle: 1.29,
    lessonTab: 0.86,

    // Problem display components
    problemSelector: 1.0,
    problemSolver: 1.0,

    // Step description
    stepDescription: 1.0,

    // Progress tracking
    progress: 1.0,
    progressInfo: 0.86,

    // Goals
    goals: 1.0,

    // Practice indicators
    practiceIndicator: 0.71,

    // Special contexts
    tooltip: 0.79,
    button: 0.86,
  },

  // Content format specific scales
  formatScales: {
    text: 1.0,
    formula: 1.0,
    h1: 1.8,
    h2: 1.4,
    h3: 1.2,
    h4: 1.1,
    kc: 1.1,
    def: 1.0,
    note: 0.95,
    caption: 0.9,
    code: 0.9,
    inlineExample: 1.0,
  },

  // KaTeX-specific scaling
  katexScales: {
    inline: 1.05,
    display: 1.2,

    navigation: {
      inline: 1.05,
      display: 1.2,
    },
    preview: {
      inline: 1.05,
      display: 1.2,
    },
    lesson: {
      inline: 1.05,
      display: 1.2,
    },
    problemSelector: {
      inline: 1.05,
      display: 1.3,
    },
    problemSolver: {
      inline: 1.2,
      display: 1.2,
    },
    stepDescription: {
      inline: 1.05,
      display: 1.2,
    },
    progress: {
      inline: 1.0,
      display: 1.0,
    },
    goals: {
      inline: 1.05,
      display: 1.2,
    },
  },

  /**
   * Calculate final font size
   */
  getSize(component = "default", format = "text", contentScale = 1.0) {
    const componentScale = this.componentScales[component] || 1.0;
    const formatScale = this.formatScales[format] || 1.0;
    return Math.round(
      this.baseSize *
        this.globalScale *
        componentScale *
        formatScale *
        contentScale
    );
  },

  /**
   * Get font size as CSS string
   */
  getSizeCSS(component = "default", format = "text", contentScale = 1.0) {
    return `${this.getSize(component, format, contentScale)}px`;
  },

  /**
   * Get font size as em value
   */
  getSizeEM(component = "default", format = "text", contentScale = 1.0) {
    const componentScale = this.componentScales[component] || 1.0;
    const formatScale = this.formatScales[format] || 1.0;
    const totalScale =
      this.globalScale * componentScale * formatScale * contentScale;
    return `${totalScale}em`;
  },

  /**
   * Get KaTeX-specific font size
   */
  getKatexSizeEM(
    component = "default",
    format = "text",
    isDisplay = false,
    contentScale = 1.0
  ) {
    const componentScale = this.componentScales[component] || 1.0;
    const formatScale = this.formatScales[format] || 1.0;

    const mathType = isDisplay ? "display" : "inline";
    let katexScale = 1.0;

    if (this.katexScales[component] && this.katexScales[component][mathType]) {
      katexScale = this.katexScales[component][mathType];
    } else {
      katexScale = this.katexScales[mathType] || 1.0;
    }

    const totalScale =
      this.globalScale *
      componentScale *
      formatScale *
      katexScale *
      contentScale;
    return `${totalScale}em`;
  },

  /**
   * Update global scale
   */
  setGlobalScale(scale) {
    this.globalScale = Math.max(0.5, Math.min(2.0, scale));
  },

  /**
   * Update component-specific scale
   */
  setComponentScale(component, scale) {
    this.componentScales[component] = Math.max(0.5, Math.min(2.0, scale));
  },

  /**
   * Get debug information
   */
  getDebugInfo() {
    return {
      baseSize: this.baseSize,
      globalScale: this.globalScale,
      effectiveBase: this.baseSize * this.globalScale,
      componentScales: { ...this.componentScales },
      formatScales: { ...this.formatScales },
    };
  },
};

// Export context-aware font size function
export function getFontSizeForContext(context, format = "text", scale = 1.0) {
  const contextMap = {
    problemSelector: "problemSelector",
    problemSolver: "problemSolver",
    stepDescription: "stepDescription",
    lessonDescription: "lesson",
    navigation: "navigation",
    preview: "preview",
    progress: "progress",
    goals: "goals",
  };

  const component = contextMap[context] || "default";
  return fontConfig.getSizeCSS(component, format, scale);
}
