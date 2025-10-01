/**
 * API Server for Content Lab
 * Provides HTTP endpoints for Claude Code automation
 */

const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

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
