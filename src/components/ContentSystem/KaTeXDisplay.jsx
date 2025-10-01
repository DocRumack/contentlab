// KaTeXDisplay.jsx - Content Creation Lab version
import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import katex from "katex/dist/katex.mjs";
import "katex/dist/katex.min.css"; // CRITICAL: Import KaTeX CSS

const KaTeXDisplay = ({
  content,
  className = "",
  context = "default",
  stepIndex = 0,
  activeHelpLevel,
  showHints,
  style = {},
}) => {
  const displayRef = useRef(null);

  useEffect(() => {
    if (displayRef.current && content) {
      // Check if the element already has KaTeX-rendered content for this exact content
      const currentKatexElement = displayRef.current.querySelector(".katex");

      // If there's already a KaTeX element, check if it's for the same content
      if (
        currentKatexElement &&
        displayRef.current.dataset.katexContent === content
      ) {
        return;
      }

      // Process the content
      let mathContent = content;
      let displayMode = false;

      // Check for display mode delimiters
      if (mathContent.startsWith("\\[") && mathContent.endsWith("\\]")) {
        mathContent = mathContent.slice(2, -2);
        displayMode = true;
      } else if (mathContent.startsWith("$$") && mathContent.endsWith("$$")) {
        mathContent = mathContent.slice(2, -2);
        displayMode = true;
      } else if (mathContent.startsWith("$") && mathContent.endsWith("$")) {
        mathContent = mathContent.slice(1, -1);
        displayMode = false;
      } else if (
        context === "formula" &&
        !mathContent.includes("\\begin{") &&
        !mathContent.includes("\\[")
      ) {
        displayMode = false;
      }

      // Convert \class{color}{content} to \textcolor{color}{content}
      mathContent = mathContent.replace(
        /\\class\{([^}]+)\}\{([^}]+)\}/g,
        (match, colorClass, innerContent) => {
          const colorMap = {
            "answer-highlight": "#4CAF50",
            "error-highlight": "#F44336",
            "hint-highlight": "#2196F3",
            "step-highlight": "#FF9800",
          };
          const color = colorMap[colorClass] || colorClass;
          return `\\textcolor{${color}}{${innerContent}}`;
        }
      );

      // Remove any \smash{} wrapping
      mathContent = mathContent.replace(/\\smash\{([^}]+)\}/g, "$1");

      try {
        // Clear and render
        displayRef.current.innerHTML = "";

        katex.render(mathContent, displayRef.current, {
          displayMode: displayMode,
          throwOnError: false,
          errorColor: "#cc0000",
          strict: false,
          trust: true,
          macros: {
            "\\cancel": "\\enclose{updiagonalstrike}{#1}",
          },
        });

        // Mark this element as having rendered this specific content
        displayRef.current.dataset.katexContent = content;

        // Adjust vertical alignment if needed
        if (!displayMode && displayRef.current.firstChild) {
          const katexElement = displayRef.current.querySelector(".katex");
          if (katexElement) {
            katexElement.style.lineHeight = "1";
          }
        }
      } catch (err) {
        console.error("KaTeX rendering error:", err);
        displayRef.current.textContent = content;
        displayRef.current.style.color = "#cc0000";
      }
    }
  }, [content, context, stepIndex, activeHelpLevel, showHints, className]);

  const isDisplay =
    content &&
    (content.includes("\\[") ||
      content.includes("$$") ||
      content.includes("\\begin{"));

  const Element = isDisplay ? "div" : "span";

  return (
    <Element
      ref={displayRef}
      className={`${className} ${isDisplay ? "katex-display" : "katex-inline"}`}
      style={{ color: "#000", ...style }}
    />
  );
};

KaTeXDisplay.propTypes = {
  content: PropTypes.string.isRequired,
  className: PropTypes.string,
  context: PropTypes.string,
  stepIndex: PropTypes.number,
  activeHelpLevel: PropTypes.oneOf(["minor", "moderate", "major"]),
  showHints: PropTypes.bool,
  style: PropTypes.object,
};

export default KaTeXDisplay;
