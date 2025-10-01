// Container configurations based on actual TestConstructor001 measurements
// Measurements taken with console in separate window for accurate viewport
// Viewport reference: 1557px x 1270px (full height)

export const TEST_CONSTRUCTOR_MEASUREMENTS = {
  viewport: {
    width: 1557,
    height: 1270
  },
  
  containers: {
    // PreviewBox subcontainers
    previewBox: {
      previewDescription: {
        pixels: { width: 492, height: 519 },
        percentages: { width: '31.6%', height: '40.9%' }
      },
      previewVisualization: {
        pixels: { width: 492, height: 519 },
        percentages: { width: '31.6%', height: '40.9%' }
      },
      // Total container dimensions
      totalWidth: '65.4%',
      totalHeight: '40.9%',
      coverage: 50
    },
    
    // LessonDescription subcontainers
    lessonDescription: {
      contentDescription: {
        pixels: { width: 684, height: 483 },
        percentages: { width: '43.9%', height: '38.0%' }
      },
      contentVisualization: {
        pixels: { width: 696, height: 483 },
        percentages: { width: '44.7%', height: '38.0%' }
      },
      // Total container dimensions
      totalWidth: '100%',
      totalHeight: '38.0%',
      coverage: 49.5
    },
    
    // Problem Manager subcontainers
    problemSolver: {
      pixels: { width: 729, height: 559 },
      percentages: { width: '46.8%', height: '44.0%' },
      totalWidth: '46.8%',
      totalHeight: '44.0%'
    },
    
    problemSelector: {
      pixels: { width: 655, height: 559 },
      percentages: { width: '42.0%', height: '44.0%' },
      totalWidth: '42.0%',
      totalHeight: '44.0%'
    },
    
    stepDescription: {
      pixels: { width: 650, height: 485 },
      percentages: { width: '41.7%', height: '38.2%' },
      totalWidth: '41.7%',
      totalHeight: '38.2%'
    }
  }
};

// Helper function to calculate actual dimensions based on current viewport
export function calculateContainerDimensions(containerType, viewportWidth, viewportHeight) {
  const measurements = TEST_CONSTRUCTOR_MEASUREMENTS.containers[containerType];
  
  if (!measurements) {
    return null;
  }
  
  // For containers with subcontainers (previewBox, lessonDescription)
  if (containerType === 'previewBox' || containerType === 'lessonDescription') {
    return {
      width: Math.round(viewportWidth * parseFloat(measurements.totalWidth) / 100),
      height: Math.round(viewportHeight * parseFloat(measurements.totalHeight) / 100),
      coverage: measurements.coverage,
      hasSubcontainers: true
    };
  }
  
  // For single containers (problemSolver, problemSelector, stepDescription)
  return {
    width: Math.round(viewportWidth * parseFloat(measurements.totalWidth) / 100),
    height: Math.round(viewportHeight * parseFloat(measurements.totalHeight) / 100),
    hasSubcontainers: false
  };
}

// Get the appropriate height for a container type
export function getContainerHeight(containerType, viewportHeight = 1270) {
  const measurements = TEST_CONSTRUCTOR_MEASUREMENTS.containers[containerType];
  
  if (!measurements) {
    return '400px'; // Default fallback
  }
  
  const heightPercentage = parseFloat(measurements.totalHeight || measurements.percentages?.height || '40');
  return Math.round(viewportHeight * heightPercentage / 100) + 'px';
}

// Get the coverage percentage for split containers
export function getContainerCoverage(containerType) {
  const measurements = TEST_CONSTRUCTOR_MEASUREMENTS.containers[containerType];
  return measurements?.coverage || 50;
}
