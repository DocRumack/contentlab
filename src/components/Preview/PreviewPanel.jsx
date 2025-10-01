import { forwardRef } from "react";
import SingleViewport from "./SingleViewport";
import OverlayViewport from "./OverlayViewport";
import GridViewport from "./GridViewport";

const PreviewPanel = forwardRef(
  (
    {
      content,
      container,
      viewport,
      overlayMode,
      splitView,
      activeTool,
      parseError,
      onManipulation,
    },
    ref
  ) => {
    // Content is already parsed/processed by parent
    const parsedContent = content;

    return (
      <div
        ref={ref}
        className="preview-panel h-full bg-gray-100 relative overflow-hidden"
      >
        {/* Error/Status Indicator */}
        {parseError && (
          <div className="absolute top-2 right-2 z-50 bg-red-500 text-white px-3 py-2 rounded text-sm max-w-md shadow-lg">
            <div className="font-semibold mb-1">⚠️ Format Error</div>
            <div className="text-xs">{parseError}</div>
          </div>
        )}

        {/* Empty State */}
        {!content && (
          <div className="h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-6xl mb-4">📝</div>
              <div className="text-xl">
                Start typing in the editor to see preview
              </div>
            </div>
          </div>
        )}

        {/* Preview Modes */}
        {content && overlayMode === "single" && (
          <SingleViewport
            content={parsedContent}
            container={container}
            viewport={viewport}
            splitView={splitView}
            activeTool={activeTool}
            onManipulation={onManipulation}
          />
        )}

        {content && overlayMode === "overlay" && (
          <OverlayViewport
            content={parsedContent}
            container={container}
            activeTool={activeTool}
            onManipulation={onManipulation}
          />
        )}

        {content && overlayMode === "grid" && (
          <GridViewport
            content={parsedContent}
            container={container}
            activeTool={activeTool}
            onManipulation={onManipulation}
          />
        )}
      </div>
    );
  }
);

PreviewPanel.displayName = "PreviewPanel";

export default PreviewPanel;
