// NumberLineTool.js - Number Line Tool for ContentLab
// Generates SVG-based number lines for algebra problems

class NumberLineTool {
  constructor() {
    this.name = 'Number Line';
    this.id = 'number-line';
    this.icon = '—';
    this.defaults = {
      size: 'medium', // small, medium, large, xlarge
      min: -10,
      max: 10,
      showLabels: true,
      labelStep: 1,
      showTicks: true,
      lineColor: '#000000',
      backgroundColor: '#ffffff',
      highlightColor: '#ff0000',
      tickHeight: 10,
      fontSize: 12,
      padding: 60
    };
    
    // Size presets (width is main dimension, height calculated dynamically)
    this.sizePresets = {
      small: { width: 400, baseFontSize: 10, basePadding: 40 },
      medium: { width: 580, baseFontSize: 12, basePadding: 60 },
      large: { width: 800, baseFontSize: 14, basePadding: 80 },
      xlarge: { width: 1000, baseFontSize: 16, basePadding: 100 }
    };
  }

  /**
   * Process content to generate number line
   */
  async processContent(content, options = {}) {
    try {
      // Parse the content to determine what to show on the number line
      const lineData = this.parseNumberLineContent(content);
      
      // Generate the SVG number line
      const svg = this.generateNumberLine(lineData, options);
      
      return {
        success: true,
        data: {
          type: 'number-line',
          svg: svg,
          lineData: lineData,
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
   * Parse content to extract number line instructions
   */
  parseNumberLineContent(content) {
    const data = {
      points: [],
      intervals: [],
      inequalities: [],
      labels: [],
      range: null
    };

    // Split content into lines
    const lines = content.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
      line = line.trim();
      
      // Extract color tag if present
      const colorMatch = line.match(/\[color:\s*(\w+)\]/i);
      const color = colorMatch ? colorMatch[1] : null;
      
      // Parse points: point(3) or point(-2.5) [color:blue]
      const pointMatch = line.match(/point\s*\(\s*(-?\d+\.?\d*)\s*\)/i);
      if (pointMatch) {
        data.points.push({
          value: parseFloat(pointMatch[1]),
          type: 'solid',
          color: color
        });
      }
      
      // Parse open points: open(3) [color:blue]
      const openPointMatch = line.match(/open\s*\(\s*(-?\d+\.?\d*)\s*\)/i);
      if (openPointMatch) {
        data.points.push({
          value: parseFloat(openPointMatch[1]),
          type: 'open',
          color: color
        });
      }
      
      // Parse intervals: interval[2, 5] or interval(2, 5) [color:green]
      const intervalMatch = line.match(/interval\s*([\[\(])\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*([\]\)])/i);
      if (intervalMatch) {
        data.intervals.push({
          start: parseFloat(intervalMatch[2]),
          end: parseFloat(intervalMatch[3]),
          startInclusive: intervalMatch[1] === '[',
          endInclusive: intervalMatch[4] === ']',
          color: color
        });
      }
      
      // Parse inequalities: x > 3, x <= -2 [color:purple]
      const inequalityMatch = line.match(/x\s*([<>=]+)\s*(-?\d+\.?\d*)/i);
      if (inequalityMatch) {
        data.inequalities.push({
          operator: inequalityMatch[1],
          value: parseFloat(inequalityMatch[2]),
          color: color
        });
      }
      
      // Parse labels: label(3, "A")
      const labelMatch = line.match(/label\s*\(\s*(-?\d+\.?\d*)\s*,\s*"([^"]+)"\s*\)/i);
      if (labelMatch) {
        data.labels.push({
          value: parseFloat(labelMatch[1]),
          text: labelMatch[2]
        });
      }
      
      // Parse range: range(-5, 5)
      const rangeMatch = line.match(/range\s*\(\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)/i);
      if (rangeMatch) {
        data.range = {
          min: parseFloat(rangeMatch[1]),
          max: parseFloat(rangeMatch[2])
        };
      }
    });
    
    return data;
  }

  /**
   * Generate the SVG number line
   */
  generateNumberLine(lineData, options = {}) {
    const config = { ...this.defaults, ...options };
    
    // Override range if specified in content
    if (lineData.range) {
      config.min = lineData.range.min;
      config.max = lineData.range.max;
    }
    
    // Apply size preset
    const sizePreset = this.sizePresets[config.size] || this.sizePresets.medium;
    const width = sizePreset.width;
    const fontSize = sizePreset.baseFontSize;
    const padding = sizePreset.basePadding;
    
    // Calculate DYNAMIC height based on content
    const intervalCount = lineData.intervals.length;
    const hasLabelsAbove = lineData.labels.length > 0;
    
    // Base height components:
    const baseLineHeight = 40;  // Space for the main line and ticks
    const labelSpaceBelow = config.showLabels ? fontSize + 15 : 10;  // Space for value labels below line
    const labelSpaceAbove = hasLabelsAbove ? 20 : 10;  // Space for text labels above line
    const intervalSpacing = 25;  // Space per interval
    const intervalHeight = intervalCount > 0 ? (intervalCount * intervalSpacing) + 15 : 0;  // Total space for stacked intervals
    
    // Calculate total height dynamically
    const height = baseLineHeight + labelSpaceBelow + labelSpaceAbove + intervalHeight;
    
    const { min, max, labelStep, tickHeight } = config;
    
    // Calculate dimensions
    const lineY = height - baseLineHeight - labelSpaceBelow + 10;  // Position line in lower portion
    const lineStartX = padding;
    const lineEndX = width - padding;
    const lineWidth = lineEndX - lineStartX;
    
    // Base offset for first interval, then stack each additional one
    const baseIntervalOffsetY = -25;
    const stackSpacing = 25;  // Space between stacked intervals
    
    // Scale function
    const toX = (value) => lineStartX + ((value - min) / (max - min)) * lineWidth;
    
    // Create SVG with viewBox for responsive scaling
    let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="display: block; margin: 0 auto; max-width: 100%;" xmlns="http://www.w3.org/2000/svg">`;
    
    // Background
    svg += `<rect width="${width}" height="${height}" fill="${config.backgroundColor}" />`;
    
    // Draw intervals ABOVE the line with stacking for multiple intervals
    lineData.intervals.forEach((interval, index) => {
      const startX = toX(interval.start);
      const endX = toX(interval.end);
      const intervalColor = interval.color || config.highlightColor;
      // Stack each interval above the previous one
      const intervalY = lineY + baseIntervalOffsetY - (index * stackSpacing);
      
      // Draw line for interval above the main line
      svg += `<line x1="${startX}" y1="${intervalY}" x2="${endX}" y2="${intervalY}" `;
      svg += `stroke="${intervalColor}" stroke-width="4" />`;
      
      // All circles are 6px radius for consistency
      const circleRadius = 6;
      
      if (interval.startInclusive) {
        svg += `<circle cx="${startX}" cy="${intervalY}" r="${circleRadius}" `;
        svg += `fill="${intervalColor}" />`;
      } else {
        svg += `<circle cx="${startX}" cy="${intervalY}" r="${circleRadius}" `;
        svg += `fill="${config.backgroundColor}" stroke="${intervalColor}" stroke-width="1.5" />`;
      }
      
      if (interval.endInclusive) {
        svg += `<circle cx="${endX}" cy="${intervalY}" r="${circleRadius}" `;
        svg += `fill="${intervalColor}" />`;
      } else {
        svg += `<circle cx="${endX}" cy="${intervalY}" r="${circleRadius}" `;
        svg += `fill="${config.backgroundColor}" stroke="${intervalColor}" stroke-width="1.5" />`;
      }
    });
    
    // Draw inequalities (always on the main line)
    lineData.inequalities.forEach(inequality => {
      const x = toX(inequality.value);
      const inequalityColor = inequality.color || config.highlightColor;
      
      if (inequality.operator.includes('>')) {
        // Draw arrow to the right
        svg += `<line x1="${x}" y1="${lineY}" x2="${lineEndX}" y2="${lineY}" `;
        svg += `stroke="${inequalityColor}" stroke-width="4" />`;
        svg += `<polygon points="${lineEndX - 10},${lineY - 5} ${lineEndX},${lineY} ${lineEndX - 10},${lineY + 5}" `;
        svg += `fill="${inequalityColor}" />`;
        
        // Draw point - all circles 6px for consistency
        if (inequality.operator === '>') {
          svg += `<circle cx="${x}" cy="${lineY}" r="6" `;
          svg += `fill="${config.backgroundColor}" stroke="${inequalityColor}" stroke-width="1.5" />`;
        } else {
          svg += `<circle cx="${x}" cy="${lineY}" r="6" fill="${inequalityColor}" />`;
        }
      } else if (inequality.operator.includes('<')) {
        // Draw arrow to the left
        svg += `<line x1="${lineStartX}" y1="${lineY}" x2="${x}" y2="${lineY}" `;
        svg += `stroke="${inequalityColor}" stroke-width="4" />`;
        svg += `<polygon points="${lineStartX + 10},${lineY - 5} ${lineStartX},${lineY} ${lineStartX + 10},${lineY + 5}" `;
        svg += `fill="${inequalityColor}" />`;
        
        // Draw point - all circles 6px for consistency
        if (inequality.operator === '<') {
          svg += `<circle cx="${x}" cy="${lineY}" r="6" `;
          svg += `fill="${config.backgroundColor}" stroke="${inequalityColor}" stroke-width="1.5" />`;
        } else {
          svg += `<circle cx="${x}" cy="${lineY}" r="6" fill="${inequalityColor}" />`;
        }
      }
    });
    
    // Main number line
    svg += `<line x1="${lineStartX}" y1="${lineY}" x2="${lineEndX}" y2="${lineY}" `;
    svg += `stroke="${config.lineColor}" stroke-width="2" />`;
    
    // Draw ticks and numbers
    if (config.showTicks) {
      for (let value = Math.ceil(min / labelStep) * labelStep; value <= max; value += labelStep) {
        if (value >= min && value <= max) {
          const x = toX(value);
          
          // Tick mark
          svg += `<line x1="${x}" y1="${lineY - tickHeight / 2}" x2="${x}" y2="${lineY + tickHeight / 2}" `;
          svg += `stroke="${config.lineColor}" stroke-width="1" />`;
          
          // Number label
          if (config.showLabels) {
            svg += `<text x="${x}" y="${lineY + tickHeight + fontSize}" `;
            svg += `text-anchor="middle" font-size="${fontSize}" font-weight="normal" fill="${config.lineColor}">${value}</text>`;
          }
        }
      }
    }
    
    // Draw points (ALWAYS on the main line, regardless of intervals)
    lineData.points.forEach(point => {
      const x = toX(point.value);
      const pointColor = point.color || config.highlightColor;
      
      // All circles are 6px for consistency
      if (point.type === 'solid') {
        svg += `<circle cx="${x}" cy="${lineY}" r="6" fill="${pointColor}" />`;
      } else {
        svg += `<circle cx="${x}" cy="${lineY}" r="6" `;
        svg += `fill="${config.backgroundColor}" stroke="${pointColor}" stroke-width="1.5" />`;
      }
    });
    
    // Draw labels (on the main line)
    lineData.labels.forEach(label => {
      const x = toX(label.value);
      svg += `<text x="${x}" y="${lineY - 15}" `;
      svg += `text-anchor="middle" font-size="${fontSize + 2}" font-weight="normal" fill="${config.lineColor}">${label.text}</text>`;
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
        <div class="number-line-preview">
          <h3>Number Line</h3>
          <div class="number-line-container">${processedData.data.svg}</div>
        </div>
      `,
      visualization: {
        type: 'svg',
        content: processedData.data.svg
      }
    };
  }
}

export default NumberLineTool;
