import React from 'react';

const Header = ({
  container,
  setContainer,
  viewport,
  setViewport,
  overlayMode,
  setOverlayMode,
  splitView,
  setSplitView,
  onScreenshot
}) => {
  // Determine if current container supports split view
  const supportsSplitView = ['lessonDescription', 'previewBox'].includes(container);
  
  return (
    <header className="lab-header h-12 bg-gray-900 text-white flex items-center px-4 gap-4 flex-shrink-0">
      {/* Container Selector */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-300">Container:</label>
        <select 
          value={container} 
          onChange={(e) => {
            setContainer(e.target.value);
            // Reset to full view when changing containers
            setSplitView('full');
          }}
          className="bg-gray-800 text-white px-3 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {/* Main Teaching Containers */}
          <optgroup label="Teaching Containers">
            <option value="previewBox">Preview Box (31.6% × 40.9%)</option>
            <option value="lessonDescription">Lesson Description (43.9% × 38.0%)</option>
          </optgroup>
          
          {/* Problem Management Containers */}
          <optgroup label="Problem Containers">
            <option value="problemSelector">Problem Selector (42.0% × 44.0%)</option>
            <option value="problemSolver">Problem Solver (46.8% × 44.0%)</option>
            <option value="stepDescription">Step Description (41.7% × 38.2%)</option>
          </optgroup>
          
          {/* Other Containers */}
          <optgroup label="Other">
            <option value="reviewBox">Review Box</option>
            <option value="toolsContainer">Tools Container</option>
          </optgroup>
        </select>
      </div>
      
      {/* Split View Selector - Only show for containers that support it */}
      {supportsSplitView && (
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-300">View:</label>
          <select 
            value={splitView} 
            onChange={(e) => setSplitView(e.target.value)}
            className="bg-gray-800 text-white px-3 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="full">Full (Both)</option>
            <option value="text">Text Only</option>
            <option value="visualization">Visualization Only</option>
          </select>
        </div>
      )}
      
      {/* Viewport Selector */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-300">Viewport:</label>
        <select 
          value={viewport} 
          onChange={(e) => setViewport(e.target.value)}
          className="bg-gray-800 text-white px-3 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="desktop">Desktop (1440px)</option>
          <option value="laptop">Laptop (1024px)</option>
          <option value="tablet">Tablet (768px)</option>
          <option value="phone">Phone (375px)</option>
        </select>
      </div>
      
      {/* View Mode Toggles */}
      <div className="flex gap-1 ml-auto">
        <button 
          onClick={() => setOverlayMode('single')}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            overlayMode === 'single' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
          title="Single viewport"
        >
          Single
        </button>
        <button 
          onClick={() => setOverlayMode('overlay')}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            overlayMode === 'overlay' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
          title="Overlay all viewports"
        >
          Overlay
        </button>
        <button 
          onClick={() => setOverlayMode('grid')}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            overlayMode === 'grid' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
          title="Grid view of all viewports"
        >
          Grid
        </button>
      </div>
      
      {/* Screenshot Button */}
      <button 
        onClick={onScreenshot}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded text-sm ml-4 transition-colors flex items-center gap-2"
        title="Capture screenshot"
      >
        <span>📸</span>
        <span>Screenshot</span>
      </button>
      
      {/* API Status Indicator */}
      {window.ContentLabAPI && (
        <div className="flex items-center gap-2 ml-4">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-400">API Ready</span>
        </div>
      )}
    </header>
  );
};

export default Header;
