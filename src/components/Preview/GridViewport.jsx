import ContainerEmulator from '../Containers/ContainerEmulator';

const GridViewport = ({ content, container, activeTool, onManipulation }) => {
  const viewports = [
    { name: 'desktop', width: 1440, label: 'Desktop' },
    { name: 'laptop', width: 1024, label: 'Laptop' },
    { name: 'tablet', width: 768, label: 'Tablet' },
    { name: 'phone', width: 375, label: 'Phone' }
  ];
  
  return (
    <div className="viewport-grid">
      {viewports.map((vp) => (
        <div key={vp.name} className="viewport-grid-item bg-white">
          <div className="viewport-grid-label">
            {vp.label} ({vp.width}px)
          </div>
          <div className="h-full overflow-auto">
            <ContainerEmulator
              type={container}
              viewport={vp.name}
              content={content}
              width={vp.width}
              scale={true} // Enable scaling to fit
              activeTool={vp.name === 'desktop' ? activeTool : null}
              onManipulation={vp.name === 'desktop' ? onManipulation : null}
              interactive={vp.name === 'desktop'}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default GridViewport;
