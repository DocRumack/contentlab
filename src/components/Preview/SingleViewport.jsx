import ContainerEmulator from '../Containers/ContainerEmulator';

const SingleViewport = ({ content, container, viewport, splitView = 'full', activeTool, onManipulation }) => {
  // Viewport dimensions
  const viewportSizes = {
    desktop: { width: 1440, label: 'Desktop' },
    laptop: { width: 1024, label: 'Laptop' },
    tablet: { width: 768, label: 'Tablet' },
    phone: { width: 375, label: 'Phone' }
  };
  
  const currentViewport = viewportSizes[viewport];
  
  // For split view of teaching containers, modify the container type
  let effectiveContainer = container;
  if (['lessonDescription', 'previewBox'].includes(container) && splitView !== 'full') {
    if (container === 'lessonDescription') {
      effectiveContainer = splitView === 'text' ? 'lessonDescription_text' : 'lessonDescription_viz';
    } else if (container === 'previewBox') {
      effectiveContainer = splitView === 'text' ? 'previewBox_text' : 'previewBox_viz';
    }
  }
  
  // Check if we're in full-width mode
  const isFullWidth = splitView === 'full' && ['lessonDescription', 'previewBox'].includes(container);
  
  return (
    <div className={`h-full flex ${isFullWidth ? 'justify-center' : ''} items-center p-8`}>
      <div className="relative bg-white rounded-lg shadow-xl" style={{ maxWidth: isFullWidth ? '90%' : '100%' }}>
        {/* Viewport Label */}
        <div className="absolute -top-8 left-0 text-sm text-gray-600">
          {currentViewport.label} ({currentViewport.width}px)
          {splitView !== 'full' && ` - ${splitView === 'text' ? 'Text Content' : 'Visualization'}`}
        </div>
        
        {/* Container */}
        <ContainerEmulator
          type={effectiveContainer}
          viewport={viewport}
          content={content}
          width={currentViewport.width}
          splitView={splitView}
          activeTool={activeTool}
          onManipulation={onManipulation}
        />
      </div>
    </div>
  );
};

export default SingleViewport;
