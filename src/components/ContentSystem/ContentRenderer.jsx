// ContentRenderer for Content Creation Lab
// Complete version with all content types including tools

import { useContext, createContext, useState } from "react";
import PropTypes from "prop-types";
import KaTeXDisplay from "./KaTeXDisplay";
import {
  processFormattedContent,
  processModerateHints,
} from "../../utils/contentFormats";
import TableRenderer from "./TableRenderer";
import ToolButton from "./ToolButton";
import "./ContentRenderer.css";
import { fontConfig } from "../../utils/fontConfig";

// Simple context for preferences
const UserPreferencesContext = createContext({ preferences: {} });

// Simple toolbox hook replacement for Content Lab
const useToolbox = () => {
  const [activeTool, setActiveTool] = useState(null);

  return {
    activateTool: (toolName) => {
      console.log("Tool activated:", toolName);
      setActiveTool(toolName);
    },
    activeTool,
  };
};

// Check if content should be rendered as block-level math
const isBlockLevelMath = (content) => {
  if (!content || typeof content !== "string") return false;

  const blockPatterns = [
    /\\begin\{array\}/,
    /\\begin\{align\}/,
    /\\begin\{equation\}/,
    /\\begin\{gather\}/,
    /\\begin\{multline\}/,
    /\\begin\{split\}/,
    /\\begin\{cases\}/,
    /\\\[/,
    /\$\$/,
  ];

  return blockPatterns.some((pattern) => pattern.test(content));
};

// Preprocess content for KaTeX compatibility
const preprocessContent = (
  text,
  _context,
  _contentFormat,
  activeHelpLevel,
  showHints,
  moderateHelpConfig
) => {
  if (!text || typeof text !== "string") return text;

  let result = text;

  // Process hint markers based on hint state
  const showModerateHints =
    showHints &&
    (activeHelpLevel === "moderate" || activeHelpLevel === "major");
  result = processModerateHints(result, showModerateHints, moderateHelpConfig);

  // Replace \bigcdot with \cdot
  result = result.replace(/\\bigcdot/g, "\\cdot");

  // Replace \div with ÷
  result = result.replace(/\\div/g, "÷");

  // Convert \class{color}{content} to \textcolor{color}{content} for KaTeX
  result = result.replace(
    /\\class\{([^}]+)\}\{([^}]+)\}/g,
    (match, colorClass, innerContent) => {
      const colorMap = {
        "answer-highlight": "#4CAF50",
        "error-highlight": "#F44336",
        "hint-highlight": "#2196F3",
        "step-highlight": "#FF9800",
        correct: "#4CAF50",
        incorrect: "#F44336",
        warning: "#FF9800",
        info: "#2196F3",
      };

      const color = colorMap[colorClass] || colorClass;
      const processedContent = innerContent.replace(/ /g, "\\ ");
      return `\\textcolor{${color}}{${processedContent}}`;
    }
  );

  // Remove all \smash{} wrapping
  result = result.replace(/\\smash\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g, "$1");

  // Handle \cancel commands
  result = result.replace(
    /\\cancel\{([^}]+)\}/g,
    "\\enclose{updiagonalstrike}{$1}"
  );

  return result;
};

// Split content into segments of text and math
const splitMixedContent = (content) => {
  const segments = [];
  let currentPos = 0;

  const mathRegex = /\$([^$]+?)\$/g;
  let match;

  while ((match = mathRegex.exec(content)) !== null) {
    if (match.index > currentPos) {
      const textContent = content.substring(currentPos, match.index);
      if (textContent) {
        segments.push({ type: "text", content: textContent });
      }
    }

    segments.push({ type: "math", content: match[0] });
    currentPos = match.index + match[0].length;
  }

  if (currentPos < content.length) {
    const remainingText = content.substring(currentPos);
    if (remainingText) {
      segments.push({ type: "text", content: remainingText });
    }
  }

  return segments;
};

// Main function to render content with math
const renderMathContent = (
  content,
  className,
  key = 0,
  preferences,
  context = "default",
  item = null,
  stepIndex = 0,
  activeHelpLevel = null,
  showHints = false,
  moderateHelpConfig = null
) => {
  if (!content || typeof content !== "string" || content.trim() === "") {
    return null;
  }

  // Check content characteristics
  const hasHtmlTags = /<[^>]+>/.test(content);
  const hasMathDelimiters = /\$/.test(content);
  const hasLatexCommands = /\\[a-zA-Z]+/.test(content);

  // Process content format if available
  let formatClass = "";
  let formatStyle = {};
  let processedFormat = null;

  if (item?.contentFormat) {
    processedFormat = processFormattedContent(
      content,
      item.contentFormat,
      context,
      item?.scale || 1.0
    );
    formatClass = processedFormat.className;
    formatStyle = processedFormat.style;
  }

  // Add KaTeX scaling CSS variables based on context
  const katexInlineScale = fontConfig.getKatexSizeEM(
    context,
    item?.contentFormat || "text",
    false,
    item?.scale || 1.0
  );
  const katexDisplayScale = fontConfig.getKatexSizeEM(
    context,
    item?.contentFormat || "text",
    true,
    item?.scale || 1.0
  );

  formatStyle = {
    ...formatStyle,
    "--katex-inline-scale": katexInlineScale,
    "--katex-display-scale": katexDisplayScale,
  };

  const fullClassName = `${className} ${formatClass}`.trim();

  // Special handling for formats with prefix/suffix
  if (processedFormat && (processedFormat.prefix || processedFormat.suffix)) {
    const WrapperElement = processedFormat.wrapper || "div";

    return (
      <WrapperElement key={key} className={fullClassName} style={formatStyle}>
        {processedFormat.prefix && (
          <span
            className={processedFormat.prefix.className}
            style={processedFormat.prefix.style}
          >
            {processedFormat.prefix.text}
          </span>
        )}
        <span
          className={processedFormat.contentClassName || ""}
          style={processedFormat.contentStyle || {}}
        >
          {renderContentCore(
            content,
            hasHtmlTags,
            hasMathDelimiters,
            hasLatexCommands,
            key,
            context,
            item,
            stepIndex,
            activeHelpLevel,
            showHints,
            moderateHelpConfig,
            formatStyle
          )}
        </span>
        {processedFormat.suffix && (
          <span
            className={processedFormat.suffix.className}
            style={processedFormat.suffix.style}
          >
            {processedFormat.suffix.text}
          </span>
        )}
      </WrapperElement>
    );
  }

  // ORIGINAL LOGIC FOR NON-PREFIX/SUFFIX FORMATS
  // Case 1: Pure HTML with no math
  if (hasHtmlTags && !hasMathDelimiters && !hasLatexCommands) {
    return (
      <div
        key={key}
        className={fullClassName}
        style={formatStyle}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Case 2: HTML with embedded math
  if (hasHtmlTags && hasMathDelimiters) {
    const segments = splitMixedContent(content);
    return (
      <div
        key={key}
        className={`${fullClassName} mixed-content`}
        style={formatStyle}
      >
        {segments.map((segment, idx) => {
          if (segment.type === "text") {
            return (
              <span
                key={`${key}-${idx}`}
                dangerouslySetInnerHTML={{ __html: segment.content }}
              />
            );
          } else {
            let mathContent = segment.content;
            if (mathContent.startsWith("$") && mathContent.endsWith("$")) {
              mathContent = mathContent.slice(1, -1);
            }

            return (
              <KaTeXDisplay
                key={`${key}-${idx}`}
                content={preprocessContent(
                  mathContent,
                  context,
                  item?.contentFormat,
                  activeHelpLevel,
                  showHints,
                  item?.moderateHelpConfig
                )}
                className="inline-math"
                context={context}
                stepIndex={stepIndex}
                activeHelpLevel={activeHelpLevel}
                showHints={showHints}
                style={{
                  "--katex-inline-scale": formatStyle["--katex-inline-scale"],
                  "--katex-display-scale": formatStyle["--katex-display-scale"],
                }}
              />
            );
          }
        })}
      </div>
    );
  }

  // Case 3: Pure text with no math or LaTeX
  if (!hasHtmlTags && !hasMathDelimiters && !hasLatexCommands) {
    return (
      <div
        key={key}
        className={`${fullClassName} text-content`}
        style={formatStyle}
      >
        {content}
      </div>
    );
  }

  // Case 4: Text with inline math
  if (!hasHtmlTags && hasMathDelimiters) {
    const segments = splitMixedContent(content);
    const isBlock = isBlockLevelMath(content);

    return (
      <div
        key={key}
        className={`${fullClassName} mixed-content ${
          isBlock ? "math-block" : ""
        }`}
        style={formatStyle}
      >
        {segments.map((segment, idx) => {
          if (segment.type === "text") {
            return <span key={`${key}-${idx}`}>{segment.content}</span>;
          } else {
            let mathContent = segment.content;
            if (mathContent.startsWith("$") && mathContent.endsWith("$")) {
              mathContent = mathContent.slice(1, -1);
            }

            return (
              <KaTeXDisplay
                key={`${key}-${idx}`}
                content={preprocessContent(
                  mathContent,
                  context,
                  item?.contentFormat,
                  activeHelpLevel,
                  showHints,
                  item?.moderateHelpConfig
                )}
                className="inline-math"
                context={context}
                stepIndex={stepIndex}
                activeHelpLevel={activeHelpLevel}
                showHints={showHints}
                style={{
                  "--katex-inline-scale": formatStyle["--katex-inline-scale"],
                  "--katex-display-scale": formatStyle["--katex-display-scale"],
                }}
              />
            );
          }
        })}
      </div>
    );
  }

  // Case 5: Pure LaTeX commands without delimiters
  if (!hasHtmlTags && !hasMathDelimiters && hasLatexCommands) {
    const processedContent = preprocessContent(
      content,
      context,
      item?.contentFormat,
      activeHelpLevel,
      showHints,
      item?.moderateHelpConfig
    );

    return (
      <KaTeXDisplay
        key={key}
        content={processedContent}
        className={fullClassName}
        style={formatStyle}
        context={context}
        stepIndex={stepIndex}
        activeHelpLevel={activeHelpLevel}
        showHints={showHints}
      />
    );
  }

  // Case 6: HTML with LaTeX commands but no delimiters
  if (hasHtmlTags && hasLatexCommands && !hasMathDelimiters) {
    return (
      <div key={key} className={fullClassName} style={formatStyle}>
        <KaTeXDisplay
          content={preprocessContent(
            content,
            context,
            item?.contentFormat,
            activeHelpLevel,
            showHints,
            item?.moderateHelpConfig
          )}
          className=""
          context={context}
          stepIndex={stepIndex}
          activeHelpLevel={activeHelpLevel}
          showHints={showHints}
          style={{
            "--katex-inline-scale": formatStyle["--katex-inline-scale"],
            "--katex-display-scale": formatStyle["--katex-display-scale"],
          }}
        />
      </div>
    );
  }

  // Fallback
  return (
    <div key={key} className={fullClassName} style={formatStyle}>
      {content}
    </div>
  );
};

// Helper function to render core content
const renderContentCore = (
  content,
  hasHtmlTags,
  hasMathDelimiters,
  hasLatexCommands,
  key,
  context,
  item,
  stepIndex,
  activeHelpLevel,
  showHints,
  moderateHelpConfig,
  formatStyle
) => {
  // Case 1: Pure HTML with no math
  if (hasHtmlTags && !hasMathDelimiters && !hasLatexCommands) {
    return <span dangerouslySetInnerHTML={{ __html: content }} />;
  }

  // Case 2: HTML with embedded math
  if (hasHtmlTags && hasMathDelimiters) {
    const segments = splitMixedContent(content);
    return segments.map((segment, idx) => {
      if (segment.type === "text") {
        return (
          <span
            key={`${key}-${idx}`}
            dangerouslySetInnerHTML={{ __html: segment.content }}
          />
        );
      } else {
        let mathContent = segment.content;
        if (mathContent.startsWith("$") && mathContent.endsWith("$")) {
          mathContent = mathContent.slice(1, -1);
        }
        return (
          <KaTeXDisplay
            key={`${key}-${idx}`}
            content={preprocessContent(
              mathContent,
              context,
              item?.contentFormat,
              activeHelpLevel,
              showHints,
              moderateHelpConfig
            )}
            className="inline-math"
            context={context}
            stepIndex={stepIndex}
            activeHelpLevel={activeHelpLevel}
            showHints={showHints}
            style={{
              "--katex-inline-scale": formatStyle["--katex-inline-scale"],
              "--katex-display-scale": formatStyle["--katex-display-scale"],
            }}
          />
        );
      }
    });
  }

  // Case 3: Pure text with no math or LaTeX
  if (!hasHtmlTags && !hasMathDelimiters && !hasLatexCommands) {
    return content;
  }

  // Case 4: Text with inline math
  if (!hasHtmlTags && hasMathDelimiters) {
    const segments = splitMixedContent(content);
    return segments.map((segment, idx) => {
      if (segment.type === "text") {
        return <span key={`${key}-${idx}`}>{segment.content}</span>;
      } else {
        let mathContent = segment.content;
        if (mathContent.startsWith("$") && mathContent.endsWith("$")) {
          mathContent = mathContent.slice(1, -1);
        }
        return (
          <KaTeXDisplay
            key={`${key}-${idx}`}
            content={preprocessContent(
              mathContent,
              context,
              item?.contentFormat,
              activeHelpLevel,
              showHints,
              item?.moderateHelpConfig
            )}
            className="inline-math"
            context={context}
            stepIndex={stepIndex}
            activeHelpLevel={activeHelpLevel}
            showHints={showHints}
            style={{
              "--katex-inline-scale": formatStyle["--katex-inline-scale"],
              "--katex-display-scale": formatStyle["--katex-display-scale"],
            }}
          />
        );
      }
    });
  }

  // Case 5: Pure LaTeX commands without delimiters
  if (!hasHtmlTags && !hasMathDelimiters && hasLatexCommands) {
    return (
      <KaTeXDisplay
        content={preprocessContent(
          content,
          context,
          item?.contentFormat,
          activeHelpLevel,
          showHints,
          item?.moderateHelpConfig
        )}
        className=""
        context={context}
        stepIndex={stepIndex}
        activeHelpLevel={activeHelpLevel}
        showHints={showHints}
        style={{
          "--katex-inline-scale": formatStyle["--katex-inline-scale"],
          "--katex-display-scale": formatStyle["--katex-display-scale"],
        }}
      />
    );
  }

  // Case 6: HTML with LaTeX commands but no delimiters
  if (hasHtmlTags && hasLatexCommands && !hasMathDelimiters) {
    return (
      <KaTeXDisplay
        content={preprocessContent(
          content,
          context,
          item?.contentFormat,
          activeHelpLevel,
          showHints,
          item?.moderateHelpConfig
        )}
        className=""
        context={context}
        stepIndex={stepIndex}
        activeHelpLevel={activeHelpLevel}
        showHints={showHints}
        style={{
          "--katex-inline-scale": formatStyle["--katex-inline-scale"],
          "--katex-display-scale": formatStyle["--katex-display-scale"],
        }}
      />
    );
  }

  return content;
};

// Main ContentRenderer component
const ContentRenderer = ({
  content,
  className = "",
  context = "default",
  stepIndex = 0,
  activeHelpLevel,
  showHints,
  moderateHelpConfig,
}) => {
  const { preferences } = useContext(UserPreferencesContext) || {};
  const { activateTool } = useToolbox();

  // Process array content to add numbering
  const processNumbering = (contentArray) => {
    let currentNumber = 0;
    const processedContent = [];

    for (let i = 0; i < contentArray.length; i++) {
      const item = contentArray[i];

      if (!item) {
        processedContent.push(item);
        continue;
      }

      // Reset counter when we hit a numberReset marker
      if (item.type === "numberReset") {
        currentNumber = 0;
        processedContent.push(item);
        continue;
      }

      // Increment and assign number for numbered items
      if (item.type === "numberedItem") {
        currentNumber++;
        processedContent.push({
          ...item,
          assignedNumber: currentNumber,
        });
        continue;
      }

      processedContent.push(item);
    }

    return processedContent;
  };
  const renderContentItem = (
    item,
    className,
    key = 0,
    preferences,
    context,
    stepIndex,
    activeHelpLevel,
    showHints,
    moderateHelpConfig
  ) => {
    if (!item) return null;

    // Handle separator type
    if (item.type === "separator") {
      return (
        <hr
          key={key}
          className="format-separator"
          style={{
            display: "block",
            width: "80%",
            height: "2px",
            backgroundColor: "#555",
            margin: "1.5em auto",
            border: "none",
            borderRadius: "1px",
          }}
        />
      );
    }

    // Handle string content directly
    if (typeof item === "string") {
      return renderMathContent(
        item,
        className,
        key,
        preferences,
        context,
        null,
        stepIndex,
        activeHelpLevel,
        showHints,
        moderateHelpConfig
      );
    }

    // Handle key concept type
    if (item.type === "kc") {
      return (
        <div key={key} className="kc-block" style={{ position: "relative" }}>
          <div className="kc-header">
            <span className="kc-prefix">Key Concept:</span>
            <span className="kc-title">{item.content}</span>
          </div>
          {item.description && (
            <div className="kc-description">{item.description}</div>
          )}
        </div>
      );
    }

    // Handle table type items
    if (item.type === "table") {
      return (
        <div
          key={key}
          style={{
            width: "100%",
            maxWidth: "100%",
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          <TableRenderer
            content={item.content}
            context={context}
            className={className}
            highlightCells={item.highlightCells || []}
          />
        </div>
      );
    }

    // Handle tool type items - IMPORTANT FOR FULL CONTENT RENDERING
    if (item.type === "tool") {
      return (
        <div key={key} className="flex items-center gap-3 px-4 py-2">
          <div className="flex-shrink-0">
            <ToolButton
              color="#ca8a04"
              onClick={() => {
                activateTool(item.toolName);
              }}
              toolName={item.toolName}
            />
          </div>
          <div className="text-left">
            <span className="text-[#654321] font-bold">Tool: </span>
            <span className="font-medium">{item.toolName}</span>
          </div>
        </div>
      );
    }

    // Handle practice earmark type (simplified for Content Lab)
    if (item.type === "practiceEarmark") {
      return (
        <div
          key={key}
          className="practice-earmark-anchor"
          data-practice-eligible="true"
          data-practice-id={item.concept || `practice-${key}`}
          data-problem-ids={JSON.stringify(item.problemIds || [])}
          data-problem-count={(item.problemIds || []).length}
          data-practice-title={item.title || "Practice"}
          style={{ height: "1px", opacity: 0 }}
        >
          <span className="practice-anchor-marker" />
        </div>
      );
    }

    // Handle numbered item type
    if (item.type === "numberedItem") {
      const number = item.assignedNumber || 1;
      return (
        <div
          key={key}
          className="numbered-item"
          style={{
            display: "flex",
            marginBottom: "0.5em",
            paddingLeft: "1.5em",
            position: "relative",
          }}
        >
          <span
            style={{
              position: "absolute",
              left: 0,
              fontWeight: "bold",
              marginRight: "0.5em",
            }}
          >
            {number}.
          </span>
          <div style={{ flex: 1 }}>
            {renderMathContent(
              item.content,
              className,
              key,
              preferences,
              context,
              item,
              stepIndex,
              activeHelpLevel,
              showHints,
              moderateHelpConfig
            )}
          </div>
        </div>
      );
    }

    // Handle numberReset type (just for completeness, though it doesn't render anything)
    if (item.type === "numberReset") {
      return null; // Don't render anything for reset markers
    }

    // Handle graph type - show SVG or placeholder
    if (item.type === "graph") {
      // If it has SVG content, render it
      if (item.content && item.content.includes('<svg')) {
        return (
<div 
            key={key} 
            className="graph-container"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%'
            }}
          >
            <div style={{
              position: 'relative',
              display: 'inline-block',
              padding: '8px'
            }}>
              {/* Corner brackets to show SVG bounds */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '20px',
                height: '20px',
                borderTop: '2px solid #3b82f6',
                borderLeft: '2px solid #3b82f6'
              }} />
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '20px',
                height: '20px',
                borderTop: '2px solid #3b82f6',
                borderRight: '2px solid #3b82f6'
              }} />
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '20px',
                height: '20px',
                borderBottom: '2px solid #3b82f6',
                borderLeft: '2px solid #3b82f6'
              }} />
              <div style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '20px',
                height: '20px',
                borderBottom: '2px solid #3b82f6',
                borderRight: '2px solid #3b82f6'
              }} />
              <div dangerouslySetInnerHTML={{ __html: item.content }} />
            </div>
          </div>
        );
      }
      // If it's the placeholder text, don't show anything
      if (item.content === '[CLICK THE GENERATE GRAPH BUTTON TO INJECT CONTENT]') {
        return null;
      }
      // Otherwise show the content as-is
      return (
        <div key={key} className="graph-placeholder">
          {item.content || 'Graph will appear here'}
        </div>
      );
    }

    // Handle number-line type - show SVG or placeholder
    if (item.type === "number-line") {
      // If it has SVG content, render it
      if (item.content && item.content.includes('<svg')) {
        return (
<div 
            key={key} 
            className="number-line-container"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%'
            }}
          >
            <div style={{
              position: 'relative',
              display: 'inline-block',
              padding: '8px'
            }}>
              {/* Corner brackets to show SVG bounds */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '20px',
                height: '20px',
                borderTop: '2px solid #3b82f6',
                borderLeft: '2px solid #3b82f6'
              }} />
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '20px',
                height: '20px',
                borderTop: '2px solid #3b82f6',
                borderRight: '2px solid #3b82f6'
              }} />
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '20px',
                height: '20px',
                borderBottom: '2px solid #3b82f6',
                borderLeft: '2px solid #3b82f6'
              }} />
              <div style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '20px',
                height: '20px',
                borderBottom: '2px solid #3b82f6',
                borderRight: '2px solid #3b82f6'
              }} />
              <div dangerouslySetInnerHTML={{ __html: item.content }} />
            </div>
          </div>
        );
      }
      // If it's the placeholder text, don't show anything
      if (item.content === '[CLICK THE GENERATE NUMBER LINE BUTTON TO INJECT CONTENT]') {
        return null;
      }
      // Otherwise show the content as-is
      return (
        <div key={key} className="number-line-placeholder">
          {item.content || 'Number line will appear here'}
        </div>
      );
    }

    // Handle object with type
    if (typeof item === "object" && item.type) {
      // Special handling for old mathjaxContent type
      if (item.type === "mathjaxContent") {
        const format = item.contentFormat || "text";
        const normalizedItem = {
          ...item,
          contentFormat: format,
        };

        return renderMathContent(
          item.content,
          `content-${format} ${className}`.trim(),
          key,
          preferences,
          context,
          normalizedItem,
          stepIndex,
          activeHelpLevel,
          showHints,
          moderateHelpConfig
        );
      }

      // New format - type IS the format
      if (item.content !== undefined || item.content === "") {
        const normalizedItem = {
          ...item,
          contentFormat: item.type,
        };

        return renderMathContent(
          item.content,
          `content-${item.type} ${className}`.trim(),
          key,
          preferences,
          context,
          normalizedItem,
          stepIndex,
          activeHelpLevel,
          showHints,
          moderateHelpConfig
        );
      }
    }

    console.warn("Invalid content item structure:", item);
    return null;
  };

  // Handle null/empty content
  if (
    !content ||
    (Array.isArray(content) && content.length === 0) ||
    (typeof content === "string" && content.trim() === "")
  ) {
    return null;
  }

  // Handle single content item
  if (!Array.isArray(content)) {
    return renderContentItem(
      content,
      className,
      0,
      preferences,
      context,
      stepIndex,
      activeHelpLevel,
      showHints,
      moderateHelpConfig
    );
  }

  // Process array to add numbering
  const processedContent = processNumbering(content);

  // Filter out null/undefined
  const filteredContent = processedContent.filter(
    (item) => item !== null && item !== undefined
  );

  return filteredContent.map((item, index) =>
    renderContentItem(
      item,
      className,
      index,
      preferences,
      context,
      stepIndex,
      activeHelpLevel,
      showHints,
      moderateHelpConfig
    )
  );
};

ContentRenderer.propTypes = {
  content: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.array,
  ]),
  className: PropTypes.string,
  context: PropTypes.string,
  stepIndex: PropTypes.number,
  activeHelpLevel: PropTypes.oneOf(["minor", "moderate", "major"]),
  showHints: PropTypes.bool,
  moderateHelpConfig: PropTypes.object,
};

export default ContentRenderer;
export { UserPreferencesContext };
