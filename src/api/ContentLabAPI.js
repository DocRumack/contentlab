import { ClaudeCodeHelper } from './claude-code-helpers.js';
import { BatchProcessor } from './batch-processor.js';
import NumberLineTool from '../components/Tools/NumberLineTool.js';
import GraphTool from '../components/Tools/GraphTool.js';

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
   * Generate a number line SVG from commands
   * @param {string} commands - Number line commands (one per line)
   * @param {object} options - Generation options (min, max, size, etc.)
   * @returns {Promise<object>} Result with success, svg, and metadata
   */
  async generateNumberLine(commands, options = {}) {
    try {
      // Use imported NumberLineTool
      const tool = new NumberLineTool();
      
      // Process the commands
      const result = await tool.processContent(commands, options);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return {
        success: true,
        svg: result.data.svg,
        metadata: {
          type: 'number-line',
          lineData: result.data.lineData,
          options: result.data.options,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        svg: null,
        metadata: null
      };
    }
  }

  /**
   * Generate a coordinate graph SVG from commands
   * @param {string} commands - Graph commands (one per line)
   * @param {object} options - Generation options (xMin, xMax, yMin, yMax, size, etc.)
   * @returns {Promise<object>} Result with success, svg, and metadata
   */
  async generateGraph(commands, options = {}) {
    try {
      // Use imported GraphTool
      const tool = new GraphTool();
      
      // Process the commands
      const result = await tool.processContent(commands, options);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return {
        success: true,
        svg: result.data.svg,
        metadata: {
          type: 'graph',
          graphData: result.data.graphData,
          options: result.data.options,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        svg: null,
        metadata: null
      };
    }
  }


  /**
   * Verify visual correctness of generated content using computer vision rules
   * @param {string} type - Type of content ('number-line' or 'graph')
   * @param {string} screenshotData - Base64 screenshot data or file path
   * @param {object} verificationRules - Rules to check (optional, uses defaults)
   * @returns {Promise<object>} Verification results with pass/fail and details
   */
  async verifyVisual(type, screenshotData, verificationRules = {}) {
    try {
      const results = {
        passed: true,
        checks: {},
        errors: [],
        timestamp: new Date().toISOString()
      };

      // Default verification rules based on type
      const defaultRules = this.getDefaultVerificationRules(type);
      const rules = { ...defaultRules, ...verificationRules };

      // Perform checks based on type
      if (type === 'number-line') {
        await this.verifyNumberLine(screenshotData, rules, results);
      } else if (type === 'graph') {
        await this.verifyGraph(screenshotData, rules, results);
      } else {
        throw new Error(`Unknown content type: ${type}`);
      }

      // Check if any verification failed
      results.passed = results.errors.length === 0;

      return {
        success: true,
        results
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        results: null
      };
    }
  }

  /**
   * Get default verification rules for a content type
   * @private
   */
  getDefaultVerificationRules(type) {
    const rules = {
      'number-line': {
        checkIntervalPosition: true,
        checkCircleTypes: true,
        checkSpacing: true,
        checkBounds: true,
        checkColors: true,
        checkReadability: true,
        tolerancePixels: 5
      },
      'graph': {
        checkFunctionAccuracy: true,
        checkLineSlope: true,
        checkAxisLabels: true,
        checkGridVisibility: true,
        checkOriginLabel: true,
        checkBounds: true,
        checkColors: true,
        checkReadability: true,
        tolerancePixels: 5
      }
    };

    return rules[type] || {};
  }

  /**
   * Verify number line visual correctness
   * @private
   */
  async verifyNumberLine(screenshotData, rules, results) {
    // Check 1: Intervals positioned above main line
    if (rules.checkIntervalPosition) {
      const intervalCheck = await this.checkIntervalPosition(screenshotData);
      results.checks.intervalPosition = intervalCheck.passed;
      if (!intervalCheck.passed) {
        results.errors.push('Intervals overlap with tick marks');
      }
    }

    // Check 2: Open vs closed circles
    if (rules.checkCircleTypes) {
      const circleCheck = await this.checkCircleTypes(screenshotData);
      results.checks.circleTypes = circleCheck.passed;
      if (!circleCheck.passed) {
        results.errors.push('Circle types (open/closed) incorrect');
      }
    }

    // Check 3: Interval spacing
    if (rules.checkSpacing) {
      const spacingCheck = await this.checkIntervalSpacing(screenshotData);
      results.checks.spacing = spacingCheck.passed;
      if (!spacingCheck.passed) {
        results.errors.push('Interval spacing incorrect (expected 25px)');
      }
    }

    // Check 4: Content within bounds
    if (rules.checkBounds) {
      const boundsCheck = await this.checkContentBounds(screenshotData, 'number-line');
      results.checks.bounds = boundsCheck.passed;
      if (!boundsCheck.passed) {
        results.errors.push('Content cutoff at edges detected');
      }
    }

    // Check 5: Colors applied correctly
    if (rules.checkColors) {
      const colorCheck = await this.checkColors(screenshotData);
      results.checks.colors = colorCheck.passed;
      if (!colorCheck.passed) {
        results.errors.push('Colors not applied correctly');
      }
    }

    // Check 6: Readability
    if (rules.checkReadability) {
      const readabilityCheck = await this.checkReadability(screenshotData);
      results.checks.readability = readabilityCheck.passed;
      if (!readabilityCheck.passed) {
        results.errors.push('Content not readable at current size');
      }
    }
  }

  /**
   * Verify graph visual correctness
   * @private
   */
  async verifyGraph(screenshotData, rules, results) {
    // Check 1: Function accuracy
    if (rules.checkFunctionAccuracy) {
      const functionCheck = await this.checkFunctionAccuracy(screenshotData);
      results.checks.functionAccuracy = functionCheck.passed;
      if (!functionCheck.passed) {
        results.errors.push('Function does not pass through expected points');
      }
    }

    // Check 2: Line slope and intercept
    if (rules.checkLineSlope) {
      const lineCheck = await this.checkLineSlope(screenshotData);
      results.checks.lineSlope = lineCheck.passed;
      if (!lineCheck.passed) {
        results.errors.push('Line slope or intercept incorrect');
      }
    }

    // Check 3: Axis labels
    if (rules.checkAxisLabels) {
      const axisCheck = await this.checkAxisLabels(screenshotData);
      results.checks.axisLabels = axisCheck.passed;
      if (!axisCheck.passed) {
        results.errors.push('Axis labels (x, y) missing or incorrect');
      }
    }

    // Check 4: Grid visibility
    if (rules.checkGridVisibility) {
      const gridCheck = await this.checkGridVisibility(screenshotData);
      results.checks.gridVisibility = gridCheck.passed;
      if (!gridCheck.passed) {
        results.errors.push('Grid lines not visible or too cluttered');
      }
    }

    // Check 5: Origin label position
    if (rules.checkOriginLabel) {
      const originCheck = await this.checkOriginLabel(screenshotData);
      results.checks.originLabel = originCheck.passed;
      if (!originCheck.passed) {
        results.errors.push('Origin label not positioned correctly');
      }
    }

    // Check 6: Content within bounds
    if (rules.checkBounds) {
      const boundsCheck = await this.checkContentBounds(screenshotData, 'graph');
      results.checks.bounds = boundsCheck.passed;
      if (!boundsCheck.passed) {
        results.errors.push('Content clipping outside viewBox');
      }
    }

    // Check 7: Colors applied correctly
    if (rules.checkColors) {
      const colorCheck = await this.checkColors(screenshotData);
      results.checks.colors = colorCheck.passed;
      if (!colorCheck.passed) {
        results.errors.push('Colors not applied correctly');
      }
    }

    // Check 8: Readability
    if (rules.checkReadability) {
      const readabilityCheck = await this.checkReadability(screenshotData);
      results.checks.readability = readabilityCheck.passed;
      if (!readabilityCheck.passed) {
        results.errors.push('Content not readable at current size');
      }
    }
  }

  /**
   * Placeholder computer vision check methods
   * These will be implemented with actual CV logic by Claude Code
   * @private
   */
  async checkIntervalPosition(screenshotData) {
    // TODO: Implement actual computer vision check
    return { passed: true };
  }

  async checkCircleTypes(screenshotData) {
    // TODO: Implement actual computer vision check
    return { passed: true };
  }

  async checkIntervalSpacing(screenshotData) {
    // TODO: Implement actual computer vision check
    return { passed: true };
  }

  async checkContentBounds(screenshotData, type) {
    // TODO: Implement actual computer vision check
    return { passed: true };
  }

  async checkColors(screenshotData) {
    // TODO: Implement actual computer vision check
    return { passed: true };
  }

  async checkReadability(screenshotData) {
    // TODO: Implement actual computer vision check
    return { passed: true };
  }

  async checkFunctionAccuracy(screenshotData) {
    // TODO: Implement actual computer vision check
    return { passed: true };
  }

  async checkLineSlope(screenshotData) {
    // TODO: Implement actual computer vision check
    return { passed: true };
  }

  async checkAxisLabels(screenshotData) {
    // TODO: Implement actual computer vision check
    return { passed: true };
  }

  async checkGridVisibility(screenshotData) {
    // TODO: Implement actual computer vision check
    return { passed: true };
  }

  async checkOriginLabel(screenshotData) {
    // TODO: Implement actual computer vision check
    return { passed: true };
  }


  /**
   * Batch generate and verify multiple items with retry logic
   * @param {Array} items - Array of items to process, each with {type, commands, options, verificationRules}
   * @param {object} batchOptions - Batch processing options
   * @returns {Promise<object>} Aggregated results with successes, failures, and errors
   */
  async batchGenerateAndVerify(items, batchOptions = {}) {
    const {
      maxRetries = 3,
      retryDelay = 1000,
      captureScreenshots = true,
      saveResults = true,
      outputDir = './output'
    } = batchOptions;

    const results = {
      total: items.length,
      successful: 0,
      failed: 0,
      items: [],
      errors: [],
      timestamp: new Date().toISOString()
    };

    console.log(`Starting batch processing of ${items.length} items...`);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemResult = {
        index: i,
        type: item.type,
        commands: item.commands,
        attempts: 0,
        success: false,
        svg: null,
        metadata: null,
        verificationResults: null,
        error: null
      };

      // Retry loop for each item
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        itemResult.attempts = attempt;
        
        try {
          console.log(`Processing item ${i + 1}/${items.length} (attempt ${attempt}/${maxRetries})...`);

          // Step 1: Generate the content
          let generateResult;
          if (item.type === 'number-line') {
            generateResult = await this.generateNumberLine(item.commands, item.options || {});
          } else if (item.type === 'graph') {
            generateResult = await this.generateGraph(item.commands, item.options || {});
          } else {
            throw new Error(`Unknown item type: ${item.type}`);
          }

          if (!generateResult.success) {
            throw new Error(`Generation failed: ${generateResult.error}`);
          }

          itemResult.svg = generateResult.svg;
          itemResult.metadata = generateResult.metadata;

          // Step 2: Capture screenshot if enabled
          let screenshotData = null;
          if (captureScreenshots) {
            // Load the generated content into ContentLab
            await this.loadContent(generateResult.svg);
            await this.waitForRender(500); // Wait for render
            
            // Capture screenshot
            const screenshotResult = await this.screenshot();
            screenshotData = screenshotResult;
          }

          // Step 3: Verify the content
          const verifyResult = await this.verifyVisual(
            item.type,
            screenshotData,
            item.verificationRules || {}
          );

          if (!verifyResult.success) {
            throw new Error(`Verification failed: ${verifyResult.error}`);
          }

          itemResult.verificationResults = verifyResult.results;

          // Check if verification passed
          if (!verifyResult.results.passed) {
            // If verification failed and we have retries left, adjust parameters and retry
            if (attempt < maxRetries) {
              console.log(`Verification failed on attempt ${attempt}. Errors: ${verifyResult.results.errors.join(', ')}`);
              console.log(`Retrying with adjusted parameters...`);
              
              // Adjust parameters based on verification errors
              item.options = this.adjustParametersForRetry(item.options, verifyResult.results.errors);
              
              await new Promise(resolve => setTimeout(resolve, retryDelay));
              continue; // Retry
            } else {
              throw new Error(`Verification failed after ${maxRetries} attempts: ${verifyResult.results.errors.join(', ')}`);
            }
          }

          // Success!
          itemResult.success = true;
          results.successful++;
          console.log(`✓ Item ${i + 1}/${items.length} processed successfully`);
          break; // Exit retry loop

        } catch (error) {
          itemResult.error = error.message;
          
          if (attempt === maxRetries) {
            // Final attempt failed
            results.failed++;
            results.errors.push({
              index: i,
              type: item.type,
              commands: item.commands,
              error: error.message,
              attempts: attempt
            });
            console.log(`✗ Item ${i + 1}/${items.length} failed after ${maxRetries} attempts: ${error.message}`);
          } else {
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        }
      }

      results.items.push(itemResult);
    }

    // Save results if enabled
    if (saveResults) {
      await this.saveBatchResults(results, outputDir);
    }

    console.log(`\nBatch processing complete: ${results.successful}/${results.total} successful, ${results.failed}/${results.total} failed`);

    return results;
  }

  /**
   * Adjust generation parameters based on verification errors
   * @private
   */
  adjustParametersForRetry(currentOptions, errors) {
    const adjusted = { ...currentOptions };

    // Check for specific error patterns and adjust accordingly
    errors.forEach(error => {
      if (error.includes('Content cutoff') || error.includes('clipping')) {
        // Increase bounds
        if (adjusted.min !== undefined) adjusted.min -= 1;
        if (adjusted.max !== undefined) adjusted.max += 1;
        if (adjusted.xMin !== undefined) adjusted.xMin -= 1;
        if (adjusted.xMax !== undefined) adjusted.xMax += 1;
        if (adjusted.yMin !== undefined) adjusted.yMin -= 1;
        if (adjusted.yMax !== undefined) adjusted.yMax += 1;
      }

      if (error.includes('not readable')) {
        // Try increasing size
        const sizeMap = { small: 'medium', medium: 'large', large: 'xlarge' };
        if (adjusted.size && sizeMap[adjusted.size]) {
          adjusted.size = sizeMap[adjusted.size];
        }
      }

      if (error.includes('spacing')) {
        // Adjust spacing parameters if available
        if (adjusted.intervalSpacing !== undefined) {
          adjusted.intervalSpacing = 25; // Ensure proper spacing
        }
      }
    });

    return adjusted;
  }

  /**
   * Save batch processing results to JSON file
   * @private
   */
  async saveBatchResults(results, outputDir) {
    try {
      const fs = require('fs').promises;
      const path = require('path');

      // Ensure output directory exists
      await fs.mkdir(outputDir, { recursive: true });

      // Create filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `batch-results-${timestamp}.json`;
      const filepath = path.join(outputDir, filename);

      // Save results
      await fs.writeFile(filepath, JSON.stringify(results, null, 2));

      // Also save individual successful items
      const successfulDir = path.join(outputDir, 'successful');
      await fs.mkdir(successfulDir, { recursive: true });

      for (const item of results.items) {
        if (item.success && item.svg) {
          const itemFilename = `${item.type}-${item.index}.json`;
          const itemData = {
            type: item.type,
            content: item.svg,
            commands: item.commands,
            metadata: item.metadata,
            verificationResults: item.verificationResults
          };
          await fs.writeFile(
            path.join(successfulDir, itemFilename),
            JSON.stringify(itemData, null, 2)
          );
        }
      }

      console.log(`Results saved to ${filepath}`);
    } catch (error) {
      console.error(`Failed to save batch results: ${error.message}`);
    }
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

// Expose to window for browser automation
if (typeof window !== 'undefined') {
  window.ContentLabAPI = ContentLabAPI;
}
