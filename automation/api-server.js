/**
 * API Server for Content Lab
 * Provides HTTP endpoints for Claude Code automation
 */

import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer';

class ContentLabServer {
  constructor() {
    this.app = express();
    this.browser = null;
    this.page = null;
    this.port = process.env.PORT || 3003;
    
    this.setupMiddleware();
    this.setupRoutes();
  }
  
  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
  }
  
  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        browser: this.browser !== null,
        page: this.page !== null
      });
    });
    
    // Initialize browser
    this.app.post('/api/init', async (req, res) => {
      try {
        await this.initBrowser();
        res.json({ success: true });
      } catch (error) {
        console.error('❌ Browser initialization failed:', error.message);
        res.status(500).json({ error: error.message });
      }
    });
    
    // Load content
    this.app.post('/api/load', async (req, res) => {
      try {
        const { content } = req.body;
        const result = await this.page.evaluate((content) => {
          return window.ContentLabAPI.loadContent(content);
        }, content);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Set container
    this.app.post('/api/container', async (req, res) => {
      try {
        const { type } = req.body;
        const result = await this.page.evaluate((type) => {
          return window.ContentLabAPI.setContainerType(type);
        }, type);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Take screenshot
    this.app.post('/api/screenshot', async (req, res) => {
      try {
        const screenshot = await this.page.screenshot({
          encoding: 'base64',
          fullPage: false
        });
        res.json({
          success: true,
          screenshot: `data:image/png;base64,${screenshot}`
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Measure elements
    this.app.post('/api/measure', async (req, res) => {
      try {
        const { selector } = req.body;
        const measurements = await this.page.evaluate((selector) => {
          return window.ContentLabAPI.measure(selector);
        }, selector);
        res.json({ measurements });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Analyze alignment
    this.app.post('/api/analyze', async (req, res) => {
      try {
        const { selector } = req.body;
        const analysis = await this.page.evaluate((selector) => {
          return window.ContentLabAPI.analyzeAlignment(selector);
        }, selector);
        res.json(analysis);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Iterate until aligned
    this.app.post('/api/iterate', async (req, res) => {
      try {
        const { options } = req.body;
        const result = await this.page.evaluate((options) => {
          return window.ContentLabAPI.iterateUntilAligned(options);
        }, options);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Process batch
    this.app.post('/api/batch', async (req, res) => {
      try {
        const { items, options } = req.body;
        const result = await this.page.evaluate((items, options) => {
          return window.ContentLabAPI.processBatch(items, options);
        }, items, options);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    // Visual Tools - Generate Number Line
    this.app.post('/api/generate-number-line', async (req, res) => {
      try {
        const { commands, options } = req.body;
        const result = await this.page.evaluate((commands, options) => {
          return window.ContentLabAPI.generateNumberLine(commands, options);
        }, commands, options);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Visual Tools - Generate Graph
    this.app.post('/api/generate-graph', async (req, res) => {
      try {
        const { commands, options } = req.body;
        const result = await this.page.evaluate((commands, options) => {
          return window.ContentLabAPI.generateGraph(commands, options);
        }, commands, options);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Visual Tools - Verify Visual
    this.app.post('/api/verify-visual', async (req, res) => {
      try {
        const { type, rules } = req.body;
        
        // Take screenshot for verification
        const screenshot = await this.page.screenshot({
          encoding: 'base64',
          fullPage: false
        });
        
        // Verify in browser context
        const result = await this.page.evaluate((type, screenshotData, rules) => {
          return window.ContentLabAPI.verifyVisual(type, screenshotData, rules);
        }, type, screenshot, rules);
        
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Visual Tools - Process Markdown (Batch with optional verification)
    this.app.post('/api/process-markdown', async (req, res) => {
      try {
        const { markdown, options = {} } = req.body;
        const { verify = false, maxRetries = 3 } = options;
        
        // Extract visual blocks - will use helper method
        const visuals = this.extractVisualBlocks(markdown);
        
        // Generate SVGs for each visual
        const results = [];
        
        for (const visual of visuals) {
          let attempts = 0;
          let success = false;
          let svgResult = null;
          let verificationResult = null;
          
          // Try to generate and verify (if enabled)
          while (attempts < maxRetries && !success) {
            attempts++;
            
            // Parse options string into object
            const optionsObj = this.parseVisualOptions(visual.options);
            
            // Generate SVG
            if (visual.type === 'number-line') {
              svgResult = await this.page.evaluate((commands, options) => {
                return window.ContentLabAPI.generateNumberLine(commands, options);
              }, visual.commands, optionsObj);
            } else {
              svgResult = await this.page.evaluate((commands, options) => {
                return window.ContentLabAPI.generateGraph(commands, options);
              }, visual.commands, optionsObj);
            }
            
            if (!svgResult.success) {
              continue; // Try again
            }
            
            // Verify if requested
            if (verify) {
              // Load the SVG for visual verification
              await this.page.evaluate((svg) => {
                window.ContentLabAPI.setContent([{ type: 'svg', content: svg }]);
              }, svgResult.svg);
              
              await this.page.waitForTimeout(200); // Wait for render
              
              const screenshot = await this.page.screenshot({
                encoding: 'base64',
                fullPage: false
              });
              
              verificationResult = await this.page.evaluate((type, screenshotData) => {
                return window.ContentLabAPI.verifyVisual(type, screenshotData, {});
              }, visual.type, screenshot);
              
              if (verificationResult.success && verificationResult.results.passed) {
                success = true;
              }
            } else {
              // No verification, accept on first successful generation
              success = true;
            }
          }
          
          results.push({
            type: visual.type,
            originalBlock: visual.originalBlock,
            position: visual.position,
            svg: svgResult?.svg || null,
            success: success,
            attempts: attempts,
            verified: verify ? (verificationResult?.results?.passed || false) : null,
            verificationErrors: verify ? (verificationResult?.results?.errors || []) : null
          });
        }
        
        res.json({
          success: true,
          visuals: results,
          totalFound: visuals.length,
          totalSuccess: results.filter(r => r.success).length
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Cleanup
    this.app.post('/api/cleanup', async (req, res) => {
      try {
        await this.cleanup();
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }
  
  async initBrowser() {
    if (this.browser) {
      await this.cleanup();
    }
    
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    
    await this.page.setViewport({
      width: 1920,
      height: 1080
    });
    
    await this.page.goto('http://localhost:3002', {
      waitUntil: 'networkidle2'
    });
    
    await this.page.waitForFunction(
      () => window.ContentLabAPI !== undefined,
      { timeout: 10000 }
    );
    
    console.log('✅ Browser initialized');
  }

  
  extractVisualBlocks(markdown) {
    const visuals = [];
    
    // Pattern for number-line blocks
    const numberLinePattern = /\[number-line([^\]]*)\]([\s\S]*?)\[\/number-line\]/g;
    let match;
    
    while ((match = numberLinePattern.exec(markdown)) !== null) {
      visuals.push({
        type: 'number-line',
        originalBlock: match[0],
        options: match[1].trim(),
        commands: match[2].trim(),
        position: match.index
      });
    }
    
    // Pattern for graph blocks
    const graphPattern = /\[graph([^\]]*)\]([\s\S]*?)\[\/graph\]/g;
    
    while ((match = graphPattern.exec(markdown)) !== null) {
      visuals.push({
        type: 'graph',
        originalBlock: match[0],
        options: match[1].trim(),
        commands: match[2].trim(),
        position: match.index
      });
    }
    
    // Sort by position in document
    visuals.sort((a, b) => a.position - b.position);
    
    return visuals;
  }
  
  parseVisualOptions(optionsString) {
    const options = {};
    
    if (!optionsString || optionsString.trim() === '') {
      return options;
    }
    
    // Parse key=value pairs
    // Example: "min=-10 max=10 size=large"
    const pairs = optionsString.match(/(\w+)=([^\s]+)/g) || [];
    
    pairs.forEach(pair => {
      const [key, value] = pair.split('=');
      
      // Convert to appropriate type
      if (value === 'true') {
        options[key] = true;
      } else if (value === 'false') {
        options[key] = false;
      } else if (!isNaN(value)) {
        options[key] = Number(value);
      } else {
        options[key] = value;
      }
    });
    
    return options;
  }
  
  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }
  
  start() {
    this.app.listen(this.port, () => {
      console.log(`🚀 Content Lab API Server running on port ${this.port}`);
      console.log(`   Health check: http://localhost:${this.port}/health`);
    });
  }
}

// Start server
const server = new ContentLabServer();
server.start();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏹️  Shutting down...');
  await server.cleanup();
  process.exit(0);
});
