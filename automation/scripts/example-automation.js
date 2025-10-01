/**
 * Example automation script for Claude Code
 * This demonstrates how to use the ContentLabAPI for batch processing
 */

const puppeteer = require('puppeteer');

class ContentLabAutomation {
  constructor() {
    this.browser = null;
    this.page = null;
    this.api = null;
  }
  
  /**
   * Initialize the automation environment
   */
  async init() {
    // Launch browser
    this.browser = await puppeteer.launch({
      headless: false, // Set to true for headless mode
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    
    // Set viewport to desktop size
    await this.page.setViewport({
      width: 1920,
      height: 1080
    });
    
    // Navigate to Content Lab
    await this.page.goto('http://localhost:3002', {
      waitUntil: 'networkidle2'
    });
    
    // Wait for API to be available
    await this.page.waitForFunction(
      () => window.ContentLabAPI !== undefined,
      { timeout: 10000 }
    );
    
    // Get API reference
    this.api = await this.page.evaluateHandle(() => window.ContentLabAPI);
    
    console.log('✅ Automation environment initialized');
  }
  
  /**
   * Process a LaTeX alignment task
   */
  async alignLatexEquations(equations) {
    console.log('📐 Starting LaTeX alignment task...');
    
    // Load equations into editor
    await this.page.evaluate((content) => {
      window.ContentLabAPI.loadContent(content);
    }, equations);
    
    // Set container to ProblemSolver
    await this.page.evaluate(() => {
      window.ContentLabAPI.setContainerType('problemSolver');
    });
    
    // Take initial screenshot
    await this.screenshot('before-alignment');
    
    // Analyze alignment
    const alignment = await this.page.evaluate(() => {
      return window.ContentLabAPI.analyzeAlignment('.equation');
    });
    
    console.log('Initial alignment:', alignment);
    
    // Iterate until aligned
    const result = await this.page.evaluate(() => {
      return window.ContentLabAPI.iterateUntilAligned({
        selector: '.equation',
        tolerance: 1,
        maxIterations: 20
      });
    });
    
    // Take final screenshot
    await this.screenshot('after-alignment');
    
    console.log(`✅ Alignment complete in ${result.iterations} iterations`);
    return result;
  }
  
  /**
   * Process multiple content items
   */
  async processBatch(items) {
    console.log(`📦 Processing batch of ${items.length} items...`);
    
    const results = [];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      console.log(`\n[${i + 1}/${items.length}] Processing: ${item.id}`);
      
      try {
        // Load content
        await this.page.evaluate((content) => {
          window.ContentLabAPI.loadContent(content);
        }, item.content);
        
        // Set appropriate container
        await this.page.evaluate((container) => {
          window.ContentLabAPI.setContainerType(container);
        }, item.container || 'problemSolver');
        
        // Take screenshot
        await this.screenshot(`${item.id}-before`);
        
        // Process based on type
        let result;
        if (item.type === 'latex') {
          result = await this.alignLatexEquations(item.content);
        } else {
          // Generic processing
          result = await this.page.evaluate(() => {
            return window.ContentLabAPI.getContent();
          });
        }
        
        // Take final screenshot
        await this.screenshot(`${item.id}-after`);
        
        results.push({
          id: item.id,
          success: true,
          result
        });
        
      } catch (error) {
        console.error(`❌ Error processing ${item.id}:`, error.message);
        results.push({
          id: item.id,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }
  
  /**
   * Test responsive rendering
   */
  async testResponsive(content) {
    console.log('📱 Testing responsive rendering...');
    
    const viewports = [
      { name: 'desktop', width: 1440, height: 900 },
      { name: 'laptop', width: 1024, height: 768 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'phone', width: 375, height: 667 }
    ];
    
    const results = [];
    
    for (const viewport of viewports) {
      // Set viewport
      await this.page.setViewport({
        width: viewport.width,
        height: viewport.height
      });
      
      // Load content
      await this.page.evaluate((content) => {
        window.ContentLabAPI.loadContent(content);
      }, content);
      
      // Wait for render
      await this.page.waitForTimeout(500);
      
      // Take screenshot
      const screenshot = await this.screenshot(`responsive-${viewport.name}`);
      
      // Measure content
      const measurements = await this.page.evaluate(() => {
        return window.ContentLabAPI.measure('.content');
      });
      
      results.push({
        viewport: viewport.name,
        dimensions: viewport,
        screenshot,
        measurements
      });
    }
    
    return results;
  }
  
  /**
   * Take a screenshot
   */
  async screenshot(name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `automation/screenshots/${name}-${timestamp}.png`;
    
    await this.page.screenshot({
      path: filename,
      fullPage: false
    });
    
    console.log(`📸 Screenshot saved: ${filename}`);
    return filename;
  }
  
  /**
   * Clean up resources
   */
  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
    console.log('🧹 Cleanup complete');
  }
}

// Example usage
async function main() {
  const automation = new ContentLabAutomation();
  
  try {
    // Initialize
    await automation.init();
    
    // Example: Align LaTeX equations
    const latexContent = {
      type: 'latex',
      equations: [
        'x + 2 = 5',
        '3x = 15',
        'x = 5'
      ]
    };
    
    await automation.alignLatexEquations(latexContent);
    
    // Example: Process batch
    const batchItems = [
      {
        id: 'problem-001',
        type: 'latex',
        container: 'problemSolver',
        content: {
          equations: ['2x + 3 = 7', '2x = 4', 'x = 2']
        }
      },
      {
        id: 'lesson-001',
        container: 'lessonDescription',
        content: {
          title: 'Introduction to Algebra',
          sections: ['Overview', 'Examples', 'Practice']
        }
      }
    ];
    
    const results = await automation.processBatch(batchItems);
    console.log('\n📊 Batch Results:', results);
    
    // Example: Test responsive
    await automation.testResponsive(latexContent);
    
  } catch (error) {
    console.error('❌ Automation error:', error);
  } finally {
    await automation.cleanup();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = ContentLabAutomation;
