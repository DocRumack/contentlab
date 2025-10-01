import { useState, useEffect, useRef, useCallback } from "react";
import Header from "./Header";
import PreviewPanel from "../Preview/PreviewPanel";
import EditorPanel from "../Editor/EditorPanel";
import ToolsPanel from "../Tools/ToolsPanel";
import { ContentLabAPI } from "../../api/ContentLabAPI";

const ContentLab = ({ mode = "visual", enableAPI = false }) => {
  // Core state
  const [content, setContent] = useState("");
  const [contentType, setContentType] = useState("json"); // json | markdown | latex
  const [container, setContainer] = useState("problemSolver");
  const [viewport, setViewport] = useState("desktop");
  const [overlayMode, setOverlayMode] = useState("single"); // single | overlay | grid
  const [splitView, setSplitView] = useState("full"); // full | text | visualization - for containers with subcontainers
  const [activeTool, setActiveTool] = useState(null);
  const [parseError, setParseError] = useState(null);

  // API reference for programmatic access
  const apiRef = useRef(null);
  const previewRef = useRef(null);

  // Initialize API if enabled
  useEffect(() => {
    if (enableAPI) {
      apiRef.current = new ContentLabAPI({
        mode: mode === "headless" ? "headless" : "visual",
        getContent: () => content,
        setContent: setContent,
        getContainer: () => container,
        setContainer: setContainer,
        captureScreenshot: () => captureScreenshot(),
      });

      // Expose to window for Claude Code access
      window.ContentLabAPI = apiRef.current;
      console.log(
        "ContentLab API initialized and available at window.ContentLabAPI"
      );
    }
  }, [enableAPI, mode]);

  // Parse and prepare content for rendering with debouncing
  const [processedContent, setProcessedContent] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (content.trim()) {
          let processed = null;

          // Handle JSON content
          if (contentType === "json") {
            try {
              processed = JSON.parse(content);
            } catch (jsonError) {
              // Provide helpful error with expected format
              const hasTypeOrContent = content.includes('type') || content.includes('content');
              const errorMsg = hasTypeOrContent 
                ? `Invalid JSON syntax: ${jsonError.message}` 
                : 'Expected format: {"type": "formula", "content": "..."}';
              throw new Error(errorMsg);
            }
          }
          // Handle LaTeX content
          else if (contentType === "latex") {
            // Convert LaTeX to ContentRenderer format
            // Check if it's already wrapped in $ delimiters
            const cleanLatex = content.trim();
            const hasDelimiters =
              cleanLatex.startsWith("$") || cleanLatex.startsWith("\\[");

            processed = [
              {
                type: "formula",
                content: hasDelimiters ? cleanLatex : `$${cleanLatex}$`,
              },
            ];
          }
          // Handle Markdown content (future)
          else if (contentType === "markdown") {
            // For now, treat as text
            processed = [
              {
                type: "text",
                content: content,
              },
            ];
          }

          setProcessedContent(processed);
          setParseError(null);
        } else {
          setProcessedContent(null);
          setParseError(null);
        }
      } catch (error) {
        setProcessedContent(null);
        setParseError(error.message);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [content, contentType]);

  // Screenshot capability
  const captureScreenshot = useCallback(async () => {
    // Try to capture just the container, not the entire preview panel
    const container = document.querySelector('.container-emulator') || 
                     document.querySelector('.rendered-content') ||
                     previewRef.current;

    if (!container) return null;

    try {
      // Use html2canvas for screenshot
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(container, {
        backgroundColor: '#ffffff', // White background for clean formula screenshots
        scale: 2, // Higher quality
        logging: false,
        width: container.offsetWidth,
        height: container.offsetHeight,
      });

      return canvas.toDataURL("image/png");
    } catch (error) {
      console.error("Screenshot failed:", error);
      return null;
    }
  }, []);

  // Handle tool updates - Enhanced to support insertion
  const handleToolUpdate = useCallback((toolData) => {
    // Check if toolData is a string (from templates) or object (from tools)
    const isTemplateContent = typeof toolData === 'string';
    
    if (isTemplateContent) {
      // For template insertion, use cursor-based insertion
      const textarea = document.querySelector('.editor-content textarea');
      if (textarea && textarea.selectionStart !== undefined) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentContent = content || '';
        
        // Insert at cursor or replace selection
        const updatedContent = 
          currentContent.substring(0, start) + 
          toolData + 
          currentContent.substring(end);
        
        setContent(updatedContent);
        
        // Try to detect content type from inserted content
        if (toolData.trim().startsWith('[') || toolData.trim().startsWith('{')) {
          setContentType("json");
        } else if (toolData.includes('\\begin') || toolData.includes('\\frac')) {
          setContentType("latex");
        }
        
        // Restore focus and set cursor position after the inserted content
        setTimeout(() => {
          textarea.focus();
          const newPosition = start + toolData.length;
          textarea.setSelectionRange(newPosition, newPosition);
        }, 10);
      } else {
        // Fallback: append to end if no cursor position
        const separator = content ? '\n' : '';
        setContent(content + separator + toolData);
      }
    } else {
      // For tool-generated content (objects), replace all content
      const newContent = JSON.stringify(toolData, null, 2);
      setContent(newContent);
      setContentType("json");
    }
  }, [content]);

  // Handle direct manipulation in preview
  const handlePreviewManipulation = useCallback(
    (updates) => {
      if (!activeTool) return;

      // Update content based on manipulation
      const currentData = content ? JSON.parse(content) : {};
      const updatedData = { ...currentData, ...updates };
      setContent(JSON.stringify(updatedData, null, 2));
    },
    [content, activeTool]
  );

  return (
    <div
      className="content-lab h-screen flex flex-col bg-gray-50"
      data-testid="content-lab"
    >
      {/* Header Controls */}
      <Header
        container={container}
        setContainer={setContainer}
        viewport={viewport}
        setViewport={setViewport}
        overlayMode={overlayMode}
        setOverlayMode={setOverlayMode}
        splitView={splitView}
        setSplitView={setSplitView}
        onScreenshot={captureScreenshot}
      />

      {/* Main Layout - Based on splitView */}
      {splitView === 'full' && (container === 'previewBox' || container === 'lessonDescription') ? (
        // Special case: Full-width preview for teaching containers in full mode
        <>
          <div className="preview-section flex-1 min-h-0 border-b-2 border-gray-300">
            <PreviewPanel
              ref={previewRef}
              content={processedContent}
              container={container}
              viewport={viewport}
              overlayMode={overlayMode}
              splitView={splitView}
              activeTool={activeTool}
              parseError={parseError}
              onManipulation={handlePreviewManipulation}
            />
          </div>
          <div className="work-section h-1/2 flex">
            <div className="w-1/2 border-r border-gray-300">
              <EditorPanel
                content={content}
                setContent={setContent}
                contentType={contentType}
                setContentType={setContentType}
                parseError={parseError}
                activeTool={activeTool}
              />
            </div>
            <div className="w-1/2">
              <ToolsPanel
                activeTool={activeTool}
                setActiveTool={setActiveTool}
                onToolUpdate={handleToolUpdate}
                content={content}
                setContent={setContent}
                contentType={contentType}
                setContentType={setContentType}
              />
            </div>
          </div>
        </>
      ) : (
        // Default layout: Left side split (preview upper-left, editor lower-left), Tools full right
        <div className="flex h-full">
          {/* Left Side - Split vertically */}
          <div className="w-1/2 flex flex-col">
            {/* Preview - Upper Left */}
            <div className="h-1/2 border-b border-gray-300">
              <PreviewPanel
                ref={previewRef}
                content={processedContent}
                container={container}
                viewport={viewport}
                overlayMode={overlayMode}
                splitView={splitView}
                activeTool={activeTool}
                parseError={parseError}
                onManipulation={handlePreviewManipulation}
              />
            </div>
            
            {/* Editor - Lower Left */}
            <div className="h-1/2">
              <EditorPanel
                content={content}
                setContent={setContent}
                contentType={contentType}
                setContentType={setContentType}
                parseError={parseError}
                activeTool={activeTool}
              />
            </div>
          </div>
          
          {/* Right Side - Full height Tools Panel */}
          <div className="w-1/2 h-full border-l border-gray-300">
            <ToolsPanel
              activeTool={activeTool}
              setActiveTool={setActiveTool}
              onToolUpdate={handleToolUpdate}
              content={content}
              setContent={setContent}
              contentType={contentType}
              setContentType={setContentType}
              fullHeight={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentLab;
