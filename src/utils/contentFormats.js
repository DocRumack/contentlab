// contentFormats.js - Content Creation Lab version
// Complete copy to ensure accurate rendering

/**
 * Centralized content format definitions for the ContentRenderer system.
 * Each format defines how content should be styled and displayed.
 */

import { fontConfig } from "./fontConfig";

export const contentFormats = {
  // ========================================
  // Basic text formats
  // ========================================
  text: {
    className: "format-text",
    styles: {
      textAlign: "left",
      fontSize: fontConfig.getSizeCSS("default", "text"),
      fontWeight: "normal",
      fontStyle: "normal",
      color: "#000000",
      paddingLeft: "1.5em",
      marginBottom: "0.5em",
    },
    wrapper: "div",
  },

  formula: {
    className: "format-formula",
    styles: {
      textAlign: "center",
      fontSize: fontConfig.getSizeCSS("default", "formula"),
      fontWeight: "normal",
      fontStyle: "normal",
      color: "#000000",
      marginTop: "0.8em",
      marginBottom: "0.8em",
    },
    wrapper: "div",
  },

  svg: {
    className: "format-svg",
    styles: {
      textAlign: "center",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      margin: "1em auto",
    },
    wrapper: "div",
  },

  separator: {
    className: "format-separator",
    styles: {
      display: "block",
      width: "80%",
      height: "2px",
      backgroundColor: "#555",
      margin: "1.5em auto",
      border: "none",
      borderRadius: "1px",
    },
    wrapper: "hr",
  },

  // ========================================
  // Heading levels
  // ========================================
  h1: {
    className: "format-h1",
    styles: {
      textAlign: "left",
      fontSize: fontConfig.getSizeCSS("default", "h1"),
      fontWeight: "bold",
      fontStyle: "normal",
      color: "#1a1a1a",
      marginTop: "0.5em",
      marginBottom: "0.8em",
      paddingBottom: "0.3em",
      borderBottom: "2px solid #666",
    },
    wrapper: "h1",
  },

  h2: {
    className: "format-h2",
    styles: {
      textAlign: "left",
      fontSize: fontConfig.getSizeCSS("default", "h2"),
      fontWeight: "bold",
      fontStyle: "normal",
      color: "#2c3e50",
      marginTop: "0.7em",
      marginBottom: "0.6em",
      marginLeft: "0 !important",
    },
    wrapper: "h2",
  },

  h3: {
    className: "format-h3",
    styles: {
      textAlign: "left",
      fontSize: fontConfig.getSizeCSS("default", "h3"),
      fontWeight: "600",
      fontStyle: "normal",
      color: "#34495e",
      marginTop: "0.6em",
      marginBottom: "0.5em",
      marginLeft: "0 !important",
    },
    wrapper: "h3",
  },

  h4: {
    className: "format-h4",
    styles: {
      textAlign: "left",
      fontSize: fontConfig.getSizeCSS("default", "h4"),
      fontWeight: "600",
      fontStyle: "normal",
      color: "#555",
      marginTop: "0.5em",
      marginBottom: "0.4em",
      marginLeft: "0",
    },
    wrapper: "h4",
  },

  // ========================================
  // Special content types with prefixes
  // ========================================
  kc: {
    className: "format-kc",
    styles: {
      textAlign: "left",
      fontSize: fontConfig.getSizeCSS("default", "kc"),
      fontWeight: "normal",
      fontStyle: "normal",
      marginTop: "0.8em",
      marginBottom: "0.8em",
      marginLeft: "1.5em",
      padding: "0.5em 1em",
      backgroundColor: "#f8f9fa",
      borderLeft: "4px solid #6c5ce7",
      borderRadius: "4px",
    },
    prefix: {
      text: "Key Concept: ",
      className: "kc-prefix",
      styles: {
        fontWeight: "bold",
        color: "#6c5ce7",
        marginRight: "0.3em",
      },
    },
    contentClassName: "kc-content",
    contentStyles: {
      fontWeight: "600",
      color: "#2d3436",
    },
    wrapper: "div",
  },

  def: {
    className: "format-def",
    styles: {
      textAlign: "left",
      fontSize: fontConfig.getSizeCSS("default", "def"),
      marginTop: "0.8em",
      marginBottom: "0.8em",
      padding: "0.5em 1em",
      backgroundColor: "#e8f5e9",
      borderLeft: "4px solid #4caf50",
      borderRadius: "4px",
    },
    prefix: {
      text: "Definition: ",
      className: "def-prefix",
      styles: {
        fontWeight: "bold",
        color: "#2e7d32",
        marginRight: "0.3em",
      },
    },
    contentClassName: "def-content",
    contentStyles: {
      fontStyle: "italic",
      color: "#1b5e20",
    },
    wrapper: "div",
  },

  note: {
    className: "format-note",
    styles: {
      textAlign: "left",
      fontSize: fontConfig.getSizeCSS("default", "note"),
      marginTop: "0.8em",
      marginBottom: "0.8em",
      marginLeft: "1.5em",
      padding: "0.6em 1em",
      backgroundColor: "#fff3e0",
      border: "1px solid #ffb74d",
      borderRadius: "6px",
    },
    prefix: {
      text: "Note: ",
      className: "note-prefix",
      styles: {
        fontWeight: "bold",
        color: "#e65100",
        marginRight: "0.3em",
      },
    },
    contentClassName: "note-content",
    contentStyles: {
      color: "#5d4037",
    },
    wrapper: "div",
  },

  warning: {
    className: "format-warning",
    styles: {
      textAlign: "left",
      fontSize: fontConfig.getSizeCSS("default", "warning"),
      marginTop: "0.8em",
      marginBottom: "0.8em",
      padding: "0.6em 1em",
      backgroundColor: "#ffebee",
      border: "1px solid #ef5350",
      borderRadius: "6px",
    },
    prefix: {
      text: "⚠️ Warning: ",
      className: "warning-prefix",
      styles: {
        fontWeight: "bold",
        color: "#c62828",
        marginRight: "0.3em",
      },
    },
    contentClassName: "warning-content",
    contentStyles: {
      color: "#b71c1c",
    },
    wrapper: "div",
  },

  inlineExample: {
    className: "format-inline-example",
    styles: {
      textAlign: "left",
      fontSize: fontConfig.getSizeCSS("default", "inlineExample"),
      marginTop: "0.6em",
      marginBottom: "0.6em",
      marginLeft: "2em",
      padding: "0.8em 1.2em",
      backgroundColor: "#f0f4f8",
      borderLeft: "3px solid #64b5f6",
      borderRadius: "4px",
    },
    wrapper: "div",
  },

  example: {
    className: "format-example",
    styles: {
      textAlign: "left",
      fontSize: fontConfig.getSizeCSS("default", "example"),
      fontWeight: "bold",
      marginTop: "1em",
      marginBottom: "0.5em",
      padding: "0.4em 0.8em",
      backgroundColor: "#e3f2fd",
      borderLeft: "4px solid #2196f3",
      borderRadius: "4px",
    },
    prefix: {
      text: "Example: ",
      className: "example-prefix",
      styles: {
        fontWeight: "bold",
        color: "#1565c0",
        marginRight: "0.3em",
      },
    },
    contentClassName: "example-content",
    contentStyles: {
      fontWeight: "normal",
      color: "#0d47a1",
    },
    wrapper: "div",
  },

  summary: {
    className: "format-summary",
    styles: {
      textAlign: "left",
      fontSize: fontConfig.getSizeCSS("default", "summary"),
      marginTop: "0.6em",
      marginBottom: "0.6em",
      padding: "0.5em 1em",
      backgroundColor: "#f5f5f5",
      borderLeft: "4px solid #9e9e9e",
      borderRadius: "4px",
    },
    prefix: {
      text: "Summary: ",
      className: "summary-prefix",
      styles: {
        fontWeight: "bold",
        color: "#616161",
        marginRight: "0.3em",
      },
    },
    contentClassName: "summary-content",
    contentStyles: {
      color: "#424242",
    },
    wrapper: "div",
  },

  // ========================================
  // List and structure formats
  // ========================================
  bullet: {
    className: "format-bullet",
    styles: {
      textAlign: "left",
      fontSize: fontConfig.getSizeCSS("default", "bullet"),
      marginTop: "0.3em",
      marginBottom: "0.3em",
      paddingLeft: "3em",
      position: "relative",
    },
    bullet: {
      symbol: "▸",
      className: "bullet-symbol",
      styles: {
        position: "absolute",
        left: "1.5em",
        color: "#666",
      },
    },
    wrapper: "div",
  },

  indentedBullet: {
    className: "format-indented-bullet",
    styles: {
      textAlign: "left",
      fontSize: fontConfig.getSizeCSS("default", "indentedBullet"),
      marginTop: "0.3em",
      marginBottom: "0.3em",
      marginLeft: "4em",
      paddingLeft: "2.5em",
      position: "relative",
    },
    bullet: {
      symbol: "◦",
      className: "indented-bullet-symbol",
      styles: {
        position: "absolute",
        left: "1em",
        color: "#666",
        fontSize: "1.1em",
      },
    },
    wrapper: "div",
  },

  numberedItem: {
    className: "format-numbered",
    styles: {
      textAlign: "left",
      fontSize: fontConfig.getSizeCSS("default", "numberedItem"),
      marginTop: "0.3em",
      marginBottom: "0.3em",
      paddingLeft: "3.5em",
      position: "relative",
    },
    numberPrefix: true,
    wrapper: "div",
  },

  numberReset: {
    className: "format-number-reset",
    styles: {
      display: "none",
      height: "0",
      width: "0",
      margin: "0",
      padding: "0",
    },
    wrapper: "div",
  },

  quote: {
    className: "format-quote",
    styles: {
      textAlign: "left",
      fontSize: fontConfig.getSizeCSS("default", "quote"),
      fontStyle: "italic",
      marginTop: "0.8em",
      marginBottom: "0.8em",
      paddingLeft: "2em",
      paddingRight: "1em",
      borderLeft: "3px solid #ccc",
      color: "#555",
    },
    wrapper: "blockquote",
  },

  caption: {
    className: "format-caption",
    styles: {
      textAlign: "center",
      fontSize: fontConfig.getSizeCSS("default", "caption"),
      fontStyle: "italic",
      color: "#666",
      marginTop: "0.5em",
      marginBottom: "1em",
    },
    wrapper: "div",
  },

  // ========================================
  // Advanced formats
  // ========================================
  theorem: {
    className: "format-theorem",
    styles: {
      textAlign: "left",
      fontSize: fontConfig.getSizeCSS("default", "theorem"),
      marginTop: "1em",
      marginBottom: "1em",
      padding: "0.8em 1.2em",
      backgroundColor: "#f0f7ff",
      border: "1px solid #1976d2",
      borderRadius: "8px",
    },
    prefix: {
      text: "Theorem: ",
      className: "theorem-prefix",
      styles: {
        fontWeight: "bold",
        color: "#0d47a1",
        marginRight: "0.5em",
        fontSize: fontConfig.getSizeCSS("default", "theoremPrefix"),
      },
    },
    contentClassName: "theorem-content",
    contentStyles: {
      fontStyle: "italic",
    },
    wrapper: "div",
  },

  proof: {
    className: "format-proof",
    styles: {
      textAlign: "left",
      fontSize: fontConfig.getSizeCSS("default", "proof"),
      marginTop: "0.5em",
      marginBottom: "1em",
      paddingLeft: "1em",
      borderLeft: "2px solid #ccc",
    },
    prefix: {
      text: "Proof: ",
      className: "proof-prefix",
      styles: {
        fontWeight: "600",
        fontStyle: "italic",
        marginRight: "0.5em",
      },
    },
    suffix: {
      text: " ■",
      className: "proof-qed",
      styles: {
        marginLeft: "0.5em",
        fontWeight: "bold",
      },
    },
    wrapper: "div",
  },

  step: {
    className: "format-step",
    styles: {
      textAlign: "left",
      fontSize: fontConfig.getSizeCSS("default", "step"),
      marginTop: "0.5em",
      marginBottom: "0.5em",
      paddingLeft: "2em",
    },
    prefix: {
      text: "Step ",
      className: "step-prefix",
      styles: {
        fontWeight: "bold",
        color: "#ff6b6b",
        marginRight: "0.3em",
      },
    },
    stepNumber: true,
    wrapper: "div",
  },

  highlight: {
    className: "format-highlight",
    styles: {
      backgroundColor: "#ffeb3b",
      padding: "0.2em 0.4em",
      borderRadius: "3px",
      fontWeight: "500",
    },
    wrapper: "span",
  },

  important: {
    className: "format-important",
    styles: {
      textAlign: "left",
      fontSize: fontConfig.getSizeCSS("default", "important"),
      fontWeight: "500",
      color: "#7c2e8a",
      marginTop: "0.8em",
      marginBottom: "0.8em",
      padding: "0.6em 1em",
      backgroundColor: "#faf5ff",
      borderRadius: "6px",
      border: "1px solid #e9d5ff",
    },
    prefix: {
      text: "Important: ",
      className: "important-prefix",
      styles: {
        fontWeight: "600",
        textTransform: "none",
        letterSpacing: "normal",
        color: "#7c3aed",
      },
    },
    wrapper: "div",
  },

  code: {
    className: "format-code",
    styles: {
      fontFamily: "'Courier New', Consolas, monospace",
      fontSize: fontConfig.getSizeCSS("default", "code"),
      backgroundColor: "#f5f5f5",
      padding: "0.2em 0.4em",
      borderRadius: "3px",
      border: "1px solid #ddd",
    },
    wrapper: "code",
  },

  codeBlock: {
    className: "format-code-block",
    styles: {
      fontFamily: "'Courier New', Consolas, monospace",
      fontSize: fontConfig.getSizeCSS("default", "codeBlock"),
      backgroundColor: "#f8f9fa",
      color: "#1f2937",
      padding: "1.2em",
      borderRadius: "6px",
      border: "1px solid #e5e7eb",
      overflowX: "auto",
      marginTop: "1em",
      marginBottom: "1em",
      whiteSpace: "pre-wrap",
      lineHeight: "1.5",
    },
    wrapper: "pre",
  },

  // ========================================
  // Preview-specific formats for dark backgrounds
  // ========================================
  previewText: {
    className: "format-preview-text",
    styles: {
      textAlign: "left",
      fontSize: fontConfig.getSizeCSS("preview", "text"),
      fontWeight: "normal",
      fontStyle: "normal",
      color: "#f3f3f4",
      paddingLeft: "1.5em",
      marginBottom: "0.5em",
    },
    wrapper: "div",
  },

  previewH1: {
    className: "format-preview-h1",
    styles: {
      textAlign: "left",
      fontSize: fontConfig.getSizeCSS("preview", "h1"),
      fontWeight: "bold",
      fontStyle: "normal",
      color: "#d1d1d3",
      marginTop: "0.5em",
      marginBottom: "0.8em",
      paddingBottom: "0.3em",
      borderBottom: "2px solid rgba(255, 255, 255, 0.2)",
    },
    wrapper: "h1",
  },

  previewH2: {
    className: "format-preview-h2",
    styles: {
      textAlign: "left",
      fontSize: fontConfig.getSizeCSS("preview", "h2"),
      fontWeight: "bold",
      fontStyle: "normal",
      color: "#d8d8da",
      marginTop: "0.7em",
      marginBottom: "0.6em",
      marginLeft: "0",
    },
    wrapper: "h2",
  },

  previewH3: {
    className: "format-preview-h3",
    styles: {
      textAlign: "left",
      fontSize: fontConfig.getSizeCSS("preview", "h3"),
      fontWeight: "600",
      fontStyle: "normal",
      color: "#e1e1e3",
      marginTop: "0.6em",
      marginBottom: "0.5em",
      marginLeft: "0",
    },
    wrapper: "h3",
  },

  previewBullet: {
    className: "format-preview-bullet",
    styles: {
      textAlign: "left",
      fontSize: fontConfig.getSizeCSS("preview", "bullet"),
      color: "#f3f3f4",
      marginTop: "0.3em",
      marginBottom: "0.3em",
      paddingLeft: "3em",
      position: "relative",
    },
    bullet: {
      symbol: "▸",
      className: "preview-bullet-symbol",
      styles: {
        position: "absolute",
        left: "1.5em",
        color: "#a8a8ab",
      },
    },
    wrapper: "div",
  },

  previewIndentedBullet: {
    className: "format-preview-indented-bullet",
    styles: {
      textAlign: "left",
      fontSize: fontConfig.getSizeCSS("preview", "indentedBullet"),
      color: "#f3f3f4",
      marginTop: "0.3em",
      marginBottom: "0.3em",
      marginLeft: "4em",
      paddingLeft: "2.5em",
      position: "relative",
    },
    bullet: {
      symbol: "◦",
      className: "preview-indented-bullet-symbol",
      styles: {
        position: "absolute",
        left: "1em",
        color: "#a8a8ab",
        fontSize: "1.1em",
      },
    },
    wrapper: "div",
  },

  previewNumberedItem: {
    className: "format-preview-numbered",
    styles: {
      textAlign: "left",
      fontSize: fontConfig.getSizeCSS("preview", "numberedItem"),
      color: "#f3f3f4",
      marginTop: "0.3em",
      marginBottom: "0.3em",
      paddingLeft: "3.5em",
      position: "relative",
    },
    numberPrefix: true,
    wrapper: "div",
  },

  previewNumberReset: {
    className: "format-preview-number-reset",
    styles: {
      display: "none",
      height: "0",
      width: "0",
      margin: "0",
      padding: "0",
    },
    wrapper: "hr",
  },

  previewFormula: {
    className: "format-preview-formula",
    styles: {
      textAlign: "center",
      fontSize: fontConfig.getSizeCSS("preview", "formula"),
      fontWeight: "normal",
      fontStyle: "normal",
      color: "#f3f3f4",
      marginTop: "0.8em",
      marginBottom: "0.8em",
    },
    wrapper: "div",
  },

  previewSeparator: {
    className: "format-preview-separator",
    styles: {
      display: "block",
      width: "60%",
      height: "2px",
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      margin: "1.5em auto",
      border: "none",
      borderRadius: "1px",
    },
    wrapper: "hr",
  },
};

/**
 * Get the format configuration for a given content format type
 */
export function getContentFormat(formatType) {
  return contentFormats[formatType] || contentFormats.text;
}

/**
 * Apply format styles to an element
 */
export function getFormatStyles(formatType) {
  const format = getContentFormat(formatType);
  return {
    className: format.className || "",
    style: format.styles || {},
  };
}

/**
 * Process content with prefix/suffix
 */
export function processFormattedContent(
  content,
  formatType,
  context = "default",
  scale = 1.0
) {
  const format = getContentFormat(formatType);

  const fontSize = fontConfig.getSizeCSS(context, formatType, scale);

  const result = {
    prefix: null,
    content: content,
    suffix: null,
    wrapper: format.wrapper || "div",
    className: format.className || "",
    style: {
      ...format.styles,
      fontSize: fontSize,
    },
  };

  if (format.prefix) {
    result.prefix = {
      text: format.prefix.text,
      className: format.prefix.className,
      style: format.prefix.styles,
    };
  }

  if (format.suffix) {
    result.suffix = {
      text: format.suffix.text,
      className: format.suffix.className,
      style: format.suffix.styles,
    };
  }

  if (format.contentClassName) {
    result.contentClassName = format.contentClassName;
  }

  if (format.contentStyles) {
    result.contentStyle = format.contentStyles;
  }

  return result;
}

/**
 * Process moderate hint markers in formula content
 */
export function processModerateHints(
  content,
  showModerateHints,
  moderateHelpConfig
) {
  if (!content || typeof content !== "string") {
    return content;
  }

  const shouldShowHints = showModerateHints;

  if (!shouldShowHints) {
    return content.replace(/\\hint\{([^}]+)\}/g, "$1");
  }

  const color = moderateHelpConfig?.highlightColor || "#fb923c";

  return content.replace(/\\hint\{([^}]+)\}/g, (match, text) => {
    return `\\textcolor{${color}}{${text}}`;
  });
}

export default contentFormats;
