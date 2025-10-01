import ContainerEmulator from '../Containers/ContainerEmulator';

const OverlayViewport = ({ content, container, activeTool, onManipulation }) => {
  // Calculate relative sizes for overlay
  const viewports = [
    { 
      name: 'desktop', 
      width: 1440, 
      scale: 1, 
      color: 'blue',
      opacity: 1,
      zIndex: 10
    },
    { 
      name: 'laptop', 
      width: 1024, 
      scale: 0.71, // 1024/1440
      color: 'green',
      opacity: 0.3,
      zIndex: 20
    },
    { 
      name: 'tablet', 
      width: 768, 
      scale: 0.53, // 768/1440
      color: 'orange',
      opacity: 0.3,
      zIndex: 30
    },
    { 
      name: 'phone', 
      width: 375, 
      scale: 0.26, // 375/1440
      color: 'red',
      opacity: 0.3,
      zIndex: 40
    }
  ];
  
  return (
    <div className="h-full relative flex items-center justify-center p-8 overflow-hidden">
      {/* Base container for scaling */}
      <div className="relative" style={{ width: '90%', maxWidth: '1440px' }}>
        {viewports.map((vp) => (
          <div
            key={vp.name}
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}
            style={{
              width: `${vp.scale * 100}%`,
              zIndex: vp.zIndex,
              opacity: vp.opacity
            }}
          >
            {/* Viewport border */}
            <div 
              className={`absolute inset-0 border-2 border-${vp.color}-500 pointer-events-none`}
              style={{ 
                borderColor: `var(--tw-${vp.color}-500)`,
                background: `var(--viewport-${vp.name})`
              }}
            >
              {/* Label */}
              <div className={`absolute -top-6 left-0 text-xs font-medium text-${vp.color}-600`}>
                {vp.name.charAt(0).toUpperCase() + vp.name.slice(1)} ({vp.width}px)
              </div>
            </div>
            
            {/* Container content */}
            <ContainerEmulator
              type={container}
              viewport={vp.name}
              content={content}
              width={vp.width}
              activeTool={vp.name === 'desktop' ? activeTool : null}
              onManipulation={vp.name === 'desktop' ? onManipulation : null}
              interactive={vp.name === 'desktop'}
            />
          </div>
        ))}
        
        {/* Alignment guides */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Center line vertical */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 opacity-30"></div>
          {/* Center line horizontal */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300 opacity-30"></div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3">
        <div className="text-xs font-medium text-gray-600 mb-2">Viewport Sizes</div>
        <div className="space-y-1">
          {viewports.map((vp) => (
            <div key={vp.name} className="flex items-center gap-2">
              <div 
                className={`w-3 h-3 border-2`}
                style={{ borderColor: `var(--tw-${vp.color}-500)` }}
              ></div>
              <span className="text-xs text-gray-700">
                {vp.name}: {vp.width}px
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverlayViewport;
