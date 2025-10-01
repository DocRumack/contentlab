/**
 * AST Pipeline Tool - Integration with ContentLab
 * This connects the AST pipeline to the ContentLab UI
 */

import ProblemProcessor from '../../ast-pipeline/processors/problemProcessor.js';

class ASTTool {
  constructor() {
    this.processor = new ProblemProcessor();
    this.name = 'AST Problem Processor';
    this.id = 'ast-processor';
    this.icon = '🔄';
  }

  /**
   * Process content from the editor
   */
  async processContent(content, options = {}) {
    try {
      // Detect content type
      const contentType = this.detectContentType(content);
      
      if (contentType === 'problem') {
        // Process as a math problem
        return await this.processor.processProblem(content, options);
      } else if (contentType === 'batch') {
        // Process multiple problems
        const problems = content.split('\n\n').filter(p => p.trim());
        return await this.processor.processBatch(problems, options);
      } else {
        // Process as teaching content
        return this.processTeachingContent(content, options);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Detect content type
   */
  detectContentType(content) {
    if (/solve|find|calculate|derivative|integral/i.test(content)) {
      return 'problem';
    }
    if (content.includes('---') || content.split('\n\n').length > 3) {
      return 'batch';
    }
    return 'teaching';
  }

  /**
   * Process teaching content (sections, lessons, etc.)
   */
  processTeachingContent(content, options) {
    // This would integrate with the teaching content processor
    // For now, return a structured format
    return {
      success: true,
      data: {
        type: 'teaching',
        content: content,
        formatted: this.formatTeachingContent(content)
      }
    };
  }

  /**
   * Format teaching content
   */
  formatTeachingContent(content) {
    // Basic markdown to structure conversion
    const lines = content.split('\n');
    const formatted = [];
    
    lines.forEach(line => {
      if (line.startsWith('##')) {
        formatted.push({
          type: 'h2',
          content: line.replace(/^##\s*/, '')
        });
      } else if (line.startsWith('#')) {
        formatted.push({
          type: 'h1',
          content: line.replace(/^#\s*/, '')
        });
      } else if (line.startsWith('- ')) {
        formatted.push({
          type: 'bullet',
          content: line.replace(/^-\s*/, '')
        });
      } else if (line.trim()) {
        formatted.push({
          type: 'text',
          content: line
        });
      }
    });
    
    return formatted;
  }

  /**
   * Generate preview for the PreviewPanel
   */
  generatePreview(processedData) {
    if (!processedData.success) {
      return {
        html: `<div class="error">Error: ${processedData.error}</div>`,
        latex: null
      };
    }

    const data = processedData.data;
    
    if (data.type === 'teaching') {
      return this.generateTeachingPreview(data);
    } else if (data.Steps) {
      return this.generateProblemPreview(data);
    }
    
    return {
      html: '<div>No preview available</div>',
      latex: null
    };
  }

  /**
   * Generate problem preview
   */
  generateProblemPreview(data) {
    const steps = data.Steps.map(step => {
      return `
        <div class="step">
          <h4>Step ${step.stepNumber}: ${step.description}</h4>
          <div class="latex-display">
            ${step.latex}
          </div>
          ${step.instruction ? `<p class="instruction">${step.instruction}</p>` : ''}
          ${step.hints && step.hints.length > 0 ? `
            <div class="hints">
              ${step.hints.map(hint => `<li>${hint}</li>`).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    return {
      html: `
        <div class="problem-preview">
          <h3>${data.problemStatement || 'Problem'}</h3>
          <div class="steps">${steps}</div>
        </div>
      `,
      latex: data.Steps.map(s => s.latex)
    };
  }

  /**
   * Generate teaching preview
   */
  generateTeachingPreview(data) {
    const html = data.formatted.map(item => {
      const format = this.getFormat(item.type);
      return `<div class="${format.className}" style="${format.style}">${item.content}</div>`;
    }).join('');

    return {
      html: html,
      latex: null
    };
  }

  /**
   * Get format styles (would integrate with contentFormats.js)
   */
  getFormat(type) {
    const formats = {
      h1: { className: 'heading-1', style: 'font-size: 2em; font-weight: bold;' },
      h2: { className: 'heading-2', style: 'font-size: 1.5em; font-weight: bold;' },
      text: { className: 'text', style: 'font-size: 1em;' },
      bullet: { className: 'bullet', style: 'margin-left: 2em;' }
    };
    
    return formats[type] || formats.text;
  }

  /**
   * Save pattern to library
   */
  savePattern(name, data) {
    // This would save to pattern library
    const pattern = {
      id: Date.now(),
      name: name,
      type: 'ast-processed',
      data: data,
      created: new Date().toISOString()
    };
    
    // Save to localStorage for now
    const patterns = JSON.parse(localStorage.getItem('ast-patterns') || '[]');
    patterns.push(pattern);
    localStorage.setItem('ast-patterns', JSON.stringify(patterns));
    
    return pattern;
  }

  /**
   * Load patterns from library
   */
  loadPatterns() {
    return JSON.parse(localStorage.getItem('ast-patterns') || '[]');
  }
}

export default ASTTool;