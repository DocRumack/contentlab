// GraphTool.js - 4 Quadrant Coordinate Graph Tool for ContentLab
// Generates SVG-based coordinate graphs for algebra problems

class GraphTool {
  constructor() {
    this.name = 'Coordinate Graph';
    this.id = 'graph';
    this.icon = '📈';
    this.defaults = {
      width: 400,
      height: 400,
      xMin: -10,
      xMax: 10,
      yMin: -10,
      yMax: 10,
      gridStep: 1,
      showGrid: true,
      showAxes: true,
      axisColor: '#000000',
      gridColor: '#e0e0e0',
      backgroundColor: '#ffffff',
      size: 'medium'
    };
    
    // Size presets for responsive sizing
    this.sizePresets = {
      small: { width: 300, height: 300, baseFontSize: 9 },
      medium: { width: 400, height: 400, baseFontSize: 10 },
      large: { width: 600, height: 600, baseFontSize: 12 },
      xlarge: { width: 800, height: 800, baseFontSize: 14 }
    };
  }

  /**
   * Process content to generate graph
   */
  async processContent(content, options = {}) {
    try {
      // Parse the content to determine what to graph
      const graphData = this.parseGraphContent(content);
      
      // Generate the SVG graph
      const svg = this.generateGraph(graphData, options);
      
      return {
        success: true,
        data: {
          type: 'graph',
          svg: svg,
          graphData: graphData,
          options: { ...this.defaults, ...options }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Parse content to extract graph instructions
   */
  parseGraphContent(content) {
    const data = {
      points: [],
      lines: [],
      functions: [],
      shaded: [],
      labels: []
    };

    // Split content into lines
    const lines = content.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
      line = line.trim();
      
      // Parse points: point(2, 3)
      const pointMatch = line.match(/point\s*\(\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)/i);
      if (pointMatch) {
        data.points.push({
          x: parseFloat(pointMatch[1]),
          y: parseFloat(pointMatch[2])
        });
      }
      
      // Parse lines: line y = 2x + 3
      const lineMatch = line.match(/line\s+y\s*=\s*(-?\d*\.?\d*)?\s*x\s*([\+\-]\s*\d+\.?\d*)?/i);
      if (lineMatch) {
        const slope = lineMatch[1] ? parseFloat(lineMatch[1]) : 1;
        const intercept = lineMatch[2] ? parseFloat(lineMatch[2].replace(/\s/g, '')) : 0;
        // Check for color modifier
        const colorMatch = line.match(/\[color:\s*(\w+)\]/i);
        data.lines.push({ 
          slope, 
          intercept,
          color: colorMatch ? colorMatch[1] : 'blue'
        });
      }
      
      // Parse function: f(x) = x^2 or f(x) = x^2 [color:blue]
      const funcMatch = line.match(/f\(x\)\s*=\s*(.+?)(?:\s*\[color:\s*(\w+)\])?$/i);
      if (funcMatch) {
        const funcData = {
          expression: funcMatch[1].trim(),
          color: funcMatch[2] || 'green'
        };
        data.functions.push(funcData);
      }
      
      // Parse shaded regions: shade x > 2
      const shadeMatch = line.match(/shade\s+([xy])\s*([<>=]+)\s*(-?\d+\.?\d*)/i);
      if (shadeMatch) {
        data.shaded.push({
          variable: shadeMatch[1].toLowerCase(),
          operator: shadeMatch[2],
          value: parseFloat(shadeMatch[3])
        });
      }
      
      // Parse labels: label(2, 3, "A")
      const labelMatch = line.match(/label\s*\(\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*,\s*"([^"]+)"\s*\)/i);
      if (labelMatch) {
        data.labels.push({
          x: parseFloat(labelMatch[1]),
          y: parseFloat(labelMatch[2]),
          text: labelMatch[3]
        });
      }
    });
    
    return data;
  }

  /**
   * Generate the SVG graph
   */
  generateGraph(graphData, options = {}) {
    const config = { ...this.defaults, ...options };
    
    // Apply size preset
    const sizePreset = this.sizePresets[config.size] || this.sizePresets.medium;
    const width = sizePreset.width;
    const height = sizePreset.height;
    const baseFontSize = sizePreset.baseFontSize;
    
    const { gridStep } = config;
    
    // Add padding to prevent cutoff - extend the actual drawing area
    const padding = 1.0; // Add 1 unit of padding on each side for better visibility
    const xMin = (config.xMin || -10) - padding;
    const xMax = (config.xMax || 10) + padding;
    const yMin = (config.yMin || -10) - padding;
    const yMax = (config.yMax || 10) + padding;
    
    // Use the original bounds for display purposes
    const displayXMin = config.xMin || -10;
    const displayXMax = config.xMax || 10;
    const displayYMin = config.yMin || -10;
    const displayYMax = config.yMax || 10;
    
    // Calculate scale
    const xScale = width / (xMax - xMin);
    const yScale = height / (yMax - yMin);
    
    // Transform coordinates to SVG space
    const toSVGX = (x) => (x - xMin) * xScale;
    const toSVGY = (y) => height - (y - yMin) * yScale;
    
    // Add viewBox for responsive scaling and max-width for container fit
    let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="display: block; margin: 0 auto; max-width: 100%;" xmlns="http://www.w3.org/2000/svg">`;
    
    // Background
    svg += `<rect width="${width}" height="${height}" fill="${config.backgroundColor}" />`;
    
    // Grid
    if (config.showGrid) {
      svg += '<g stroke="' + config.gridColor + '" stroke-width="0.5">';
      
      // Vertical grid lines - only within display bounds
      for (let x = Math.ceil(displayXMin / gridStep) * gridStep; x <= displayXMax; x += gridStep) {
        const svgX = toSVGX(x);
        svg += `<line x1="${svgX}" y1="0" x2="${svgX}" y2="${height}" />`;
      }
      
      // Horizontal grid lines - only within display bounds
      for (let y = Math.ceil(displayYMin / gridStep) * gridStep; y <= displayYMax; y += gridStep) {
        const svgY = toSVGY(y);
        svg += `<line x1="0" y1="${svgY}" x2="${width}" y2="${svgY}" />`;
      }
      
      svg += '</g>';
    }
    
    // Shaded regions
    graphData.shaded.forEach(region => {
      svg += '<g fill="rgba(0, 100, 200, 0.2)">';
      
      if (region.variable === 'x') {
        const svgX = toSVGX(region.value);
        if (region.operator.includes('>')) {
          svg += `<rect x="${svgX}" y="0" width="${width - svgX}" height="${height}" />`;
        } else if (region.operator.includes('<')) {
          svg += `<rect x="0" y="0" width="${svgX}" height="${height}" />`;
        }
      } else if (region.variable === 'y') {
        const svgY = toSVGY(region.value);
        if (region.operator.includes('>')) {
          svg += `<rect x="0" y="0" width="${width}" height="${svgY}" />`;
        } else if (region.operator.includes('<')) {
          svg += `<rect x="0" y="${svgY}" width="${width}" height="${height - svgY}" />`;
        }
      }
      
      svg += '</g>';
    });
    
    // Axes
    if (config.showAxes) {
      svg += '<g stroke="' + config.axisColor + '" stroke-width="2">';
      
      // X-axis
      const xAxisY = toSVGY(0);
      svg += `<line x1="0" y1="${xAxisY}" x2="${width}" y2="${xAxisY}" />`;
      
      // Y-axis  
      const yAxisX = toSVGX(0);
      svg += `<line x1="${yAxisX}" y1="0" x2="${yAxisX}" y2="${height}" />`;
      
      svg += '</g>';
      
      // Axis labels and values (separate group for text)
      const labelStep = config.labelStep || 1;
      const showAxisLabels = config.showAxisLabels !== false;
      const showAxisValues = config.showAxisValues !== false;
      
      if (showAxisLabels) {
        // Position labels very close to the ends of axis lines
        // X label: at the far right of the x-axis, ABOVE the line
        const xLabelX = width - 8;
        const xLabelY = xAxisY - 4;
        
        // Y label: at the very top of the y-axis, close to the line
        const yLabelX = yAxisX + 6;
        const yLabelY = 12;
        
        svg += `<text x="${xLabelX}" y="${xLabelY}" font-size="${baseFontSize + 2}" font-weight="normal" text-anchor="end" fill="${config.axisColor}">x</text>`;
        svg += `<text x="${yLabelX}" y="${yLabelY}" font-size="${baseFontSize + 2}" font-weight="normal" text-anchor="start" fill="${config.axisColor}">y</text>`;
      }
      
      // Show origin label separately if requested
      const showOrigin = config.showOrigin !== false;
      if (showOrigin) {
        const position = config.originPosition || 'lower-left';
        let originX, originY, anchor;
        
        // Position the origin label based on selected quadrant
        switch(position) {
          case 'upper-right':
            originX = yAxisX + 2;
            originY = xAxisY - 4;
            anchor = 'start';
            break;
          case 'lower-right':
            originX = yAxisX + 2;
            originY = xAxisY + 12;
            anchor = 'start';
            break;
          case 'upper-left':
            originX = yAxisX - 2;
            originY = xAxisY - 4;
            anchor = 'end';
            break;
          case 'lower-left':
          default:
            originX = yAxisX - 2;
            originY = xAxisY + 12;
            anchor = 'end';
            break;
        }
        
        svg += `<text x="${originX}" y="${originY}" text-anchor="${anchor}" font-size="${baseFontSize}" font-weight="normal" fill="${config.axisColor}">(0,0)</text>`;
      }
      
      if (showAxisValues) {
        // X-axis numbers - stop before edges
        for (let x = Math.ceil(displayXMin / labelStep) * labelStep; x <= displayXMax; x += labelStep) {
          if (x !== 0 && x >= displayXMin && x <= displayXMax) {
            const svgX = toSVGX(x);
            svg += `<text x="${svgX}" y="${xAxisY + 15}" text-anchor="middle" font-size="${baseFontSize}" font-weight="normal" fill="${config.axisColor}">${x}</text>`;
          }
        }
        
        // Y-axis numbers - stop before edges
        for (let y = Math.ceil(displayYMin / labelStep) * labelStep; y <= displayYMax; y += labelStep) {
          if (y !== 0 && y >= displayYMin && y <= displayYMax) {
            const svgY = toSVGY(y);
            svg += `<text x="${yAxisX - 15}" y="${svgY + 3}" text-anchor="end" font-size="${baseFontSize}" font-weight="normal" fill="${config.axisColor}">${y}</text>`;
          }
        }
      }
    }
    
    // Lines
    graphData.lines.forEach(line => {
      svg += `<g stroke="${line.color || 'blue'}" stroke-width="2">`;
      
      // Calculate line endpoints using full padded range
      const y1 = line.slope * xMin + line.intercept;
      const y2 = line.slope * xMax + line.intercept;
      
      svg += `<line x1="${toSVGX(xMin)}" y1="${toSVGY(y1)}" x2="${toSVGX(xMax)}" y2="${toSVGY(y2)}" />`;
      svg += '</g>';
    });
    
    // Functions (simplified - just plot points)
    graphData.functions.forEach(func => {
      const funcColor = func.color || 'green';
      const expression = func.expression || func;
      svg += `<g stroke="${funcColor}" stroke-width="2" fill="none">`;
      svg += '<polyline points="';
      
      const step = (xMax - xMin) / 100;
      for (let x = xMin; x <= xMax; x += step) {
        try {
          let y = 0;
          let expr = expression;
          
          // Replace x with actual value
          expr = expr.replace(/x\^3/g, `(${x}*${x}*${x})`);
          expr = expr.replace(/x\^2/g, `(${x}*${x})`);
          expr = expr.replace(/\bx\b/g, x);
          
          try {
            y = eval(expr);
          } catch (e) {
            continue;
          }
          
          svg += `${toSVGX(x)},${toSVGY(y)} `;
        } catch (e) {
          // Skip invalid points
        }
      }
      
      svg += '" />';
      svg += '</g>';
    });
    
    // Points
    graphData.points.forEach(point => {
      const svgX = toSVGX(point.x);
      const svgY = toSVGY(point.y);
      svg += `<circle cx="${svgX}" cy="${svgY}" r="4" fill="red" />`;
    });
    
    // Labels
    graphData.labels.forEach(label => {
      const svgX = toSVGX(label.x);
      const svgY = toSVGY(label.y);
      svg += `<text x="${svgX + 5}" y="${svgY - 5}" font-size="${baseFontSize + 2}" font-weight="normal" fill="black">${label.text}</text>`;
    });
    
    svg += '</svg>';
    return svg;
  }

  /**
   * Generate preview for the PreviewPanel
   */
  generatePreview(processedData) {
    if (!processedData.success) {
      return {
        html: `<div class="error">Error: ${processedData.error}</div>`,
        visualization: null
      };
    }

    return {
      html: `
        <div class="graph-preview">
          <h3>Coordinate Graph</h3>
          <div class="graph-container">${processedData.data.svg}</div>
        </div>
      `,
      visualization: {
        type: 'svg',
        content: processedData.data.svg
      }
    };
  }
}

export default GraphTool;
