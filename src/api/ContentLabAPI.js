import { ClaudeCodeHelper } from './claude-code-helpers.js';
import { BatchProcessor } from './batch-processor.js';

/**
 * ContentLabAPI - Programmatic interface for Claude Code automation
 * This API enables headless operation and batch processing
 */

export class ContentLabAPI {
  constructor(options = {}) {
    this.mode = options.mode || 'visual'; // visual | headless
    this.getContent = options.getContent;
    this.setContent = options.setContent;
    this.getContainer = options.getContainer;
    this.setContainer = options.setContainer;
    this.captureScreenshot = options.captureScreenshot;
    
    // Initialize headless browser if needed
    if (this.mode === 'headless') {
      this.initHeadless();
    }
    
    console.log(`ContentLabAPI initialized in ${this.mode} mode`);
  }
  
  async initHeadless() {
    // Would initialize Puppeteer here for headless mode
    console.log('Headless browser initialization would happen here');
  }
  
  // Core API Methods
  
  /**
   * Load content into the editor
   */
  async loadContent(content) {
    if (typeof content === 'object') {
      content = JSON.stringify(content, null, 2);
    }
    this.setContent(content);
    await this.waitForRender();
    return { success: true, content };
  }
  
  /**
   * Get current content from editor
   */
  async getContent() {
    const content = this.getContent();
    try {
      return JSON.parse(content);
    } catch {
      return content;
    }
  }
  
  /**
   * Switch container type
   */
  async setContainerType(type) {
    const validTypes = ['problemSolver', 'lessonDescription', 'previewBox', 'reviewBox', 'toolsContainer'];
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid container type: ${type}`);
    }
    this.setContainer(type);
    await this.waitForRender();
    return { success: true, container: type };
  }
  
  /**
   * Take screenshot of preview
   */
  async screenshot(options = {}) {
    const dataUrl = await this.captureScreenshot(options);
    return { success: true, screenshot: dataUrl };
  }
  
  /**
   * Measure elements in the preview
   */
  async measure(selector) {
    const elements = document.querySelectorAll(selector);
    const measurements = [];
    
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      measurements.push({
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right
      });
    });
    
    return measurements;
  }
  
  /**
   * Analyze alignment of elements
   */
  async analyzeAlignment(selector) {
    const measurements = await this.measure(selector);
    if (measurements.length < 2) {
      return { aligned: true, deviations: [] };
    }
    
    // Check horizontal alignment
    const xPositions = measurements.map(m => m.x);
    const xDeviation = Math.max(...xPositions) - Math.min(...xPositions);
    
    // Check vertical spacing
    const yPositions = measurements.map(m => m.y);
    const spacings = [];
    for (let i = 1; i < yPositions.length; i++) {
      spacings.push(yPositions[i] - yPositions[i-1]);
    }
    
    const avgSpacing = spacings.reduce((a, b) => a + b, 0) / spacings.length;
    const spacingDeviations = spacings.map(s => Math.abs(s - avgSpacing));
    
    return {
      aligned: xDeviation < 2, // 2px tolerance
      xDeviation,
      spacings,
      avgSpacing,
      spacingDeviations,
      maxDeviation: Math.max(xDeviation, ...spacingDeviations)
    };
  }
  
  /**
   * Iterate until content is aligned
   */
  async iterateUntilAligned(options = {}) {
    const {
      selector = '.equation',
      tolerance = 1,
      maxIterations = 50,
      adjustmentStrategy = 'binary'
    } = options;
    
    for (let i = 0; i < maxIterations; i++) {
      // Take screenshot for analysis
      await this.screenshot();
      
      // Analyze alignment
      const alignment = await this.analyzeAlignment(selector);
      
      if (alignment.maxDeviation < tolerance) {
        return {
          success: true,
          iterations: i + 1,
          finalAlignment: alignment,
          content: await this.getContent()
        };
      }
      
      // Calculate corrections
      const corrections = this.calculateCorrections(alignment, adjustmentStrategy);
      
      // Apply corrections to content
      await this.applyCorrections(corrections);
      
      // Wait for re-render
      await this.waitForRender();
    }
    
    return {
      success: false,
      iterations: maxIterations,
      message: 'Max iterations reached without achieving alignment'
    };
  }
  
  /**
   * Process batch of content items
   */
  async processBatch(items, options = {}) {
    const results = [];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      console.log(`Processing item ${i + 1}/${items.length}: ${item.id}`);
      
      try {
        await this.loadContent(item.content);
        const result = await this.iterateUntilAligned(options);
        results.push({
          id: item.id,
          success: result.success,
          iterations: result.iterations,
          content: result.content
        });
      } catch (error) {
        results.push({
          id: item.id,
          success: false,
          error: error.message
        });
      }
    }
    
    return {
      processed: items.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  }
  
  // Helper methods
  
  async waitForRender(ms = 100) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


  /**
   * Set content as a formula object for easy Claude Code access
   * @param {string} formulaString - LaTeX formula string
   */
  async setFormulaContent(formulaString) {
    // Set the content as a formula object
    const formulaObject = {
      type: "formula",
      content: formulaString
    };
    
    // Use the existing setContent method
    if (this.setContent) {
      this.setContent(JSON.stringify(formulaObject, null, 2));
    } else {
      console.error('setContent method not available');
    }
    
    // Wait for React to re-render
    await this.waitForRender();
  }

  /**
   * Get just the formula string from current content
   */
  getFormulaContent() {
    try {
      const content = this.getContent();
      if (!content) return null;
      
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed[0]?.type === 'formula') {
        return parsed[0].content;
      } else if (parsed.type === 'formula') {
        return parsed.content;
      }
      return null;
    } catch (e) {
      console.error('Error parsing formula content:', e);
      return null;
    }
  }

  /**
   * Capture screenshot of just the render container
   */
  async getScreenshot() {
    // Call the existing captureScreenshot method
    if (this.captureScreenshot) {
      const screenshot = await this.captureScreenshot();
      return screenshot; // Returns base64 string
    }
    console.error('captureScreenshot method not available');
    return null;
  }

  /**
   * Convenience method for Claude Code to process a formula
   * Sets the formula, waits for render, and captures screenshot
   * @param {string} latexString - LaTeX formula to process
   * @returns {Object} Result with formula, screenshot, and metadata
   */
  async processFormula(latexString) {
    try {
      // Set the formula
      await this.setFormulaContent(latexString);
      
      // Wait a bit longer to ensure full render
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Capture the screenshot
      const screenshot = await this.getScreenshot();
      
      return {
        success: true,
        formula: latexString,
        screenshot: screenshot,
        timestamp: Date.now(),
        hasScreenshot: !!screenshot
      };
    } catch (error) {
      console.error('Error processing formula:', error);
      return {
        success: false,
        formula: latexString,
        error: error.message,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Process multiple formulas in sequence
   * Useful for Claude Code batch processing
   * @param {Array<string>} formulas - Array of LaTeX strings
   * @param {Function} onEach - Optional callback after each formula
   */
  async processFormulaBatch(formulas, onEach = null) {
    const results = [];
    
    for (let i = 0; i < formulas.length; i++) {
      const formula = formulas[i];
      console.log(`Processing formula ${i + 1}/${formulas.length}`);
      
      const result = await this.processFormula(formula);
      results.push(result);
      
      // Call the callback if provided (for Claude Code analysis)
      if (onEach) {
        await onEach(result, i, formulas.length);
      }
      
      // Small delay between formulas to avoid overwhelming
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }
  
  calculateCorrections(alignment, strategy) {
    // Implementation would depend on specific correction strategies
    const corrections = [];
    
    if (strategy === 'binary') {
      // Binary search approach
      if (alignment.xDeviation > 0) {
        corrections.push({
          type: 'hspace',
          value: alignment.xDeviation / 2
        });
      }
    }
    
    return corrections;
  }
  
  async applyCorrections(corrections) {
    // Get current content
    let content = this.getContent();
    
    // Apply each correction
    for (const correction of corrections) {
      if (correction.type === 'hspace') {
        // Add \hspace{} commands to LaTeX
        content = content.replace(
          /=/g,
          `\\hspace{${correction.value}px}=`
        );
      }
    }
    
    // Update content
    this.setContent(content);
  }
  
  // Utility methods for automation
  
  /**
   * Wait for specific condition
   */
  async waitFor(condition, timeout = 5000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return true;
      }
      await this.waitForRender(100);
    }
    
    throw new Error('Timeout waiting for condition');
  }
  
  /**
   * Get automation metrics
   */
  getMetrics() {
    return {
      mode: this.mode,
      apiVersion: '1.0.0',
      features: [
        'content-loading',
        'screenshot-capture',
        'element-measurement',
        'alignment-analysis',
        'batch-processing',
        'iterative-correction'
      ]
    };
  }

  // Initialize beautification system
  initBeautification() {
    this.beautifier = new ClaudeCodeHelper(this);
    this.batchProcessor = new BatchProcessor(this);
  }

  // Convenience method for Claude Code to beautify a single formula
  async beautifyFormula(latex) {
    if (!this.beautifier) {
      this.initBeautification();
    }
    return await this.beautifier.processFormula(latex);
  }

  // Convenience method for Claude Code to beautify multiple formulas
  async beautifyBatch(formulas, options) {
    if (!this.batchProcessor) {
      this.initBeautification();
    }
    return await this.batchProcessor.processBatch(formulas, options);
  }
}

// Export for use in Node.js environment (Claude Code)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ContentLabAPI };
}
