import { useEffect, useRef } from "react";
import ContentRenderer from "../ContentSystem/ContentRenderer";
import ContentArrayRenderer from "../ContentSystem/ContentArrayRenderer";
import ContentAdapter from "../ContentSystem/ContentAdapter";
import { 
  getContainerHeight, 
  getContainerCoverage,
  calculateContainerDimensions 
} from "./containerMeasurements";
import { getContentFormat } from "../../utils/contentFormats";

const ContainerEmulator = ({
  type,
  viewport,
  content,
  width,
  scale = false,
  activeTool,
  onManipulation,
  interactive = true,
}) => {
  const containerRef = useRef(null);

  // Get viewport dimensions for scaling
  // Use actual window height or fallback to TestConstructor001 reference height
  const viewportHeights = {
    desktop: window.innerHeight || 1270,  // Use actual window height
    laptop: window.innerHeight || 800,   // Use actual window height
    tablet: window.innerHeight || 1024,  // Use actual window height
    phone: 667     // iPhone standard height
  };
  
  const currentViewportHeight = viewportHeights[viewport] || window.innerHeight || 1270;

  // Calculate dimensions based on TestConstructor001 measurements
  const dimensions = calculateContainerDimensions(type, width, currentViewportHeight);
  
  // Container configurations with exact TestConstructor001 specs
  const containerConfigs = {
    problemSolver: {
      background: "transparent",
      padding: "0 40px",
      height: dimensions ? `${dimensions.height}px` : getContainerHeight('problemSolver', currentViewportHeight),
      width: dimensions ? `${dimensions.width}px` : undefined,
      titleBar: false,
      context: "problemSolver",
      cssVars: {
        "--katex-inline-scale": "1.05em",
        "--katex-display-scale": "1.2em",
      },
    },
    problemSelector: {
      background: "transparent",
      padding: "0 40px",
      height: dimensions ? `${dimensions.height}px` : getContainerHeight('problemSelector', currentViewportHeight),
      width: dimensions ? `${dimensions.width}px` : undefined,
      titleBar: false,
      context: "problemSolver",
    },
    stepDescription: {
      background: "#f8f8f8",
      padding: "20px",
      height: dimensions ? `${dimensions.height}px` : getContainerHeight('stepDescription', currentViewportHeight),
      width: dimensions ? `${dimensions.width}px` : undefined,
      titleBar: false,
      context: "default",
    },
    lessonDescription: {
      background: "#d8d8d8",
      padding: "20px",
      height: dimensions ? `${dimensions.height}px` : getContainerHeight('lessonDescription', currentViewportHeight),
      width: width + "px", // Full width for lessonDescription
      titleBar: {
        height: 48,
        background:
          "linear-gradient(to bottom, #505a68 0%, #3a4452 50%, #2d3748 100%)",
        title: "Lesson Description",
      },
      context: "lessonDescription",
      coverage: getContainerCoverage('lessonDescription'), // 49.5% from measurements
    },
    previewBox: {
      background: "#5a6268",
      padding: "10px",
      height: dimensions ? `${dimensions.height}px` : getContainerHeight('previewBox', currentViewportHeight),
      width: dimensions && dimensions.width ? `${dimensions.width}px` : 
             (viewport === "phone" ? "100%" : `${Math.round(width * 0.654)}px`), // 65.4% of viewport width
      titleBar: {
        height: 32,
        background:
          "linear-gradient(to bottom, #505a68 0%, #3a4452 50%, #2d3748 100%)",
        title: "Preview",
      },
      textColor: "white",
      context: "preview",
      coverage: getContainerCoverage('previewBox'), // 50% from measurements
    },
    reviewBox: {
      background: "#f8f8f8",
      padding: "20px",
      height: "calc(100% - 40px)",
      width: viewport === "phone" ? "100%" : "55%",
      titleBar: {
        height: 40,
        background: "#e8e8e8",
        title: "Review",
        borderBottom: "1px solid #d1d5db",
      },
      context: "default",
    },
    toolsContainer: {
      background: "#ffffff",
      padding: "20px",
      height: "600px",
      titleBar: false,
      context: "default",
    },
  };

  const config = containerConfigs[type] || containerConfigs.problemSolver;

  // Apply CSS variables for KaTeX scaling
  useEffect(() => {
    if (containerRef.current && config.cssVars) {
      Object.entries(config.cssVars).forEach(([key, value]) => {
        containerRef.current.style.setProperty(key, value);
      });
    }
  }, [config.cssVars]);

  // Calculate actual dimensions
  const containerWidth = config.width || width + "px";
  const containerHeight = config.height;

  // Scale calculation for fitting in grid view
  const scaleStyle = scale
    ? {
        transform: `scale(${Math.min(1, 300 / parseInt(containerHeight))})`,
        transformOrigin: "top left",
      }
    : {};

  // Add debug info in development
  const debugInfo = process.env.NODE_ENV === 'development' && dimensions ? (
    <div className="absolute top-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 z-50">
      {dimensions.width}x{dimensions.height}
      {dimensions.hasSubcontainers && ` (${config.coverage || 50}% split)`}
    </div>
  ) : null;

  return (
    <div
      ref={containerRef}
      className="container-emulator relative"
      style={{
        width: containerWidth,
        height: containerHeight,
        background: config.background,
        ...scaleStyle,
      }}
      data-container={type}
      data-viewport={viewport}
    >
      {debugInfo}
      
      {/* Title Bar */}
      {config.titleBar && (
        <div
          className="title-bar flex items-center justify-center text-white text-sm font-medium"
          style={{
            height: config.titleBar.height + "px",
            background: config.titleBar.background,
            borderBottom: config.titleBar.borderBottom || "none",
          }}
        >
          {config.titleBar.title}
        </div>
      )}

      {/* Content Area */}
      <div
        className="content-area"
        style={{
          height: config.titleBar
            ? `calc(100% - ${config.titleBar.height}px)`
            : "100%",
          padding: config.padding,
          color: config.textColor || "inherit",
          overflow: "hidden",
        }}
      >
        {/* Render actual content using ContentRenderer */}
        {content ? (
          <div className="rendered-content h-full">
            {(() => {
              const adapted = ContentAdapter.adaptContent(content, type);

              // Check if this is a split content/visualization structure
              if (
                adapted &&
                adapted.content &&
                adapted.visualization &&
                (type === "lessonDescription" || type === "previewBox")
              ) {
                // Use the exact coverage from TestConstructor001 measurements
                const coverage = config.coverage || adapted.coverage || 50;

                return (
                  <div className="flex h-full">
                    {/* Text content side - SCROLLABLE */}
                    <div
                      style={{
                        width: `${coverage}%`,
                        paddingRight: "10px",
                        height: "100%",
                        overflow: "auto",
                        position: "relative",
                      }}
                      className="content-text-side"
                    >
                      <ContentArrayRenderer
                        content={adapted.content}
                        context={config.context}
                        className=""
                      />
                    </div>

                    {/* Divider */}
                    <div
                      style={{
                        width: "2px",
                        background: "#ccc",
                        margin: "0 5px",
                        flexShrink: 0,
                      }}
                    />

                    {/* Visualization side - FIXED/CENTERED */}
                    <div
                      style={{
                        width: `${100 - coverage}%`,
                        paddingLeft: "10px",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                      className="content-visual-side"
                    >
                      {adapted.visualization?.type === "svg" ||
                      (typeof adapted.visualization?.content === "string" &&
                        adapted.visualization.content.includes("<svg")) ? (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          dangerouslySetInnerHTML={{
                            __html:
                              adapted.visualization.content ||
                              adapted.visualization,
                          }}
                        />
                      ) : adapted.visualization ? (
                        <ContentRenderer
                          content={
                            adapted.visualization.content ||
                            adapted.visualization
                          }
                          context={config.context}
                          className="w-full h-full flex items-center justify-center"
                        />
                      ) : (
                        <div className="text-gray-400">No visualization</div>
                      )}
                    </div>
                  </div>
                );
              }

              // Regular single content (problemSolver, etc.) - scrollable
              // Use contentFormats to check for formula and text formatting
              
              // Determine content type and get appropriate format styles
              let contentType = "text"; // Default to text
              let formatStyles = {};
              
              if (adapted) {
                // Check if content is formula type
                if (Array.isArray(adapted) && adapted[0]?.type === 'formula') {
                  contentType = "formula";
                } else if (adapted.type === 'formula') {
                  contentType = "formula";
                } else if (Array.isArray(adapted) && adapted[0]?.type === 'text') {
                  contentType = "text";
                } else if (adapted.type === 'text') {
                  contentType = "text";
                }
                
                // Get the format configuration from contentFormats
                const format = getContentFormat(contentType);
                formatStyles = format.styles || {};
              }
              
              // Apply proper alignment and styling based on content type
              // ALL content should be vertically centered in the container
              const containerStyles = {
                height: "100%",
                overflow: "auto",
                display: "flex",
                alignItems: "center",  // Vertically center ALL content
                justifyContent: contentType === "formula" ? "center" : "flex-start",  // Horizontally: center formulas, left-align text
              };
              
              return (
                <div style={containerStyles}>
                  <div style={{ 
                    width: "100%",
                    textAlign: formatStyles.textAlign || (contentType === "formula" ? "center" : "left")
                  }}>
                    <ContentRenderer
                      content={adapted}
                      context={config.context}
                      className=""
                    />
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="empty-state flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📦</div>
              <div>No content</div>
            </div>
          </div>
        )}

        {/* Interactive manipulation layer */}
        {interactive && activeTool && onManipulation && (
          <div className="manipulation-layer absolute inset-0 pointer-events-none">
            {/* Tool-specific manipulation handles would go here */}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContainerEmulator;
