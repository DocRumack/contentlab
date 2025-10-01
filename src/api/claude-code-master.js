/**
 * CLAUDE CODE MASTER REFERENCE FOR FORMULA BEAUTIFICATION
 * ========================================================
 * 
 * This file contains all instructions and utilities for Claude Code to
 * beautify mathematical formulas using ContentLab's enhanced API.
 * 
 * USAGE: Tell Claude Code to "Read src/api/claude-code-master.js and execute formula beautification"
 */

// ============================================
// FORMULA TEST DATA
// ============================================

const TEST_FORMULAS = [
  // Simple equations
  'x+2=5',
  'x-3=7',
  
  // Algebraic solving (compressed format - will be auto-expanded)
  '2x+4=10\\\\2x=6\\\\x=3',           // System will add -4 lines
  '3x-9=18\\\\3x=27\\\\x=9',          // System will add +9 lines
  '5x+15=40\\\\5x=25\\\\x=5',         // System will add -15 and ÷5 lines
  '4x-8=12\\\\4x=20\\\\x=5',          // System will add +8 and ÷4 lines
  
  // Two-step equations (compressed)
  '6x+12=30\\\\6x=18\\\\x=3',
  '7x-14=21\\\\7x=35\\\\x=5',
  '8x+24=56\\\\8x=32\\\\x=4',
  '9x-27=45\\\\9x=72\\\\x=8',
  
  // Integrals and derivatives
  '\\int f(x)dx',
  '\\int_0^1 x^2dx',
  '\\frac{d}{dx}(x^2)=2x',
  
  // Trigonometric
  '\\sin x+\\cos x=1',
  '\\tan\\theta=\\frac{\\sin\\theta}{\\cos\\theta}',
  
  // Fractions
  '\\frac{x+2}{3}=5',
  '\\frac{2x-4}{6}=\\frac{x+1}{3}'
];

// ============================================
// MAIN PROCESSING FUNCTIONS
// ============================================

/**
 * Initialize ContentLab API and beautification system
 */
async function initializeSystem() {
  const api = window.ContentLabAPI;
  if (!api) {
    throw new Error('ContentLabAPI not found. Make sure ContentLab is running.');
  }
  
  console.log('✅ ContentLab API loaded');
  api.initBeautification();
  console.log('✅ Beautification system initialized');
  
  return api;
}

/**
 * Process a single formula with intelligent expansion
 * @param {string} formula - LaTeX formula (may be compressed)
 * @param {object} api - ContentLabAPI instance
 */
async function processFormula(formula, api) {
  console.log(`\n--- Processing: ${formula} ---`);
  
  // The beautifyFormula method will:
  // 1. Detect if it's an algebraic solving pattern
  // 2. Expand it to show operation lines (e.g., -4 on both sides)
  // 3. Apply proper spacing with \hspace
  // 4. Format with proper alignment using \begin{array}
  
  const result = await api.beautifyFormula(formula);
  
  console.log('Original (compressed):', formula);
  console.log('Expanded & beautified:', result.beautified);
  
  // Display the beautified version
  await api.setFormulaContent(result.beautified);
  await new Promise(resolve => setTimeout(resolve, 500)); // Wait for render
  
  // Capture screenshot to verify visual appearance
  const screenshot = await api.getScreenshot();
  
  // Check if it properly shows the operation lines
  if (formula.includes('\\\\') && !result.beautified.includes('\\cline')) {
    console.warn('⚠️ Warning: Algebraic steps may not have operation lines');
  }
  
  return {
    original: formula,
    beautified: result.beautified,
    expanded: result.beautified.includes('\\begin{array}'),
    hasOperationLines: result.beautified.includes('\\cline'),
    screenshot: screenshot,
    timestamp: new Date().toISOString()
  };
}

/**
 * Process all formulas in batch
 * @param {Array<string>} formulas - Array of LaTeX formulas
 * @param {object} api - ContentLabAPI instance
 */
async function processBatch(formulas, api) {
  const results = [];
  const startTime = Date.now();
  
  for (let i = 0; i < formulas.length; i++) {
    const formula = formulas[i];
    
    try {
      const result = await processFormula(formula, api);
      results.push(result);
      
      console.log(`[${i+1}/${formulas.length}] Complete`);
      console.log('  - Expanded:', result.expanded ? '✅' : '❌');
      console.log('  - Has operation lines:', result.hasOperationLines ? '✅' : '❌');
      
      // Small delay between formulas
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.error(`❌ Error with formula ${i}:`, error);
      results.push({
        original: formula,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  const duration = (Date.now() - startTime) / 1000;
  console.log(`\n⏱️ Processed ${formulas.length} formulas in ${duration.toFixed(2)} seconds`);
  
  return results;
}

// ============================================
// VISUALIZATION FUNCTIONS
// ============================================

/**
 * View a specific formula's screenshot
 * @param {number} index - Index in results array
 */
function viewScreenshot(index) {
  const results = window.beautificationResults;
  if (!results || !results[index]) {
    console.error('No result found at index', index);
    return;
  }
  
  const result = results[index];
  if (result.screenshot) {
    const win = window.open('', 'Screenshot', 'width=800,height=600');
    win.document.write(`
      <html>
        <head><title>Formula ${index + 1}</title></head>
        <body style="padding:20px;">
          <h2>Formula ${index + 1}</h2>
          <p><strong>Original:</strong> ${result.original}</p>
          <p><strong>Beautified:</strong> <code>${result.beautified}</code></p>
          <img src="${result.screenshot}" style="max-width:100%; border:1px solid #ccc;">
        </body>
      </html>
    `);
  } else {
    console.error('No screenshot available for formula', index);
  }
}

/**
 * Create a gallery of all screenshots
 */
function createScreenshotGallery() {
  const results = window.beautificationResults;
  if (!results) {
    console.error('No results available. Run processing first.');
    return;
  }
  
  const win = window.open('', 'Gallery', 'width=1200,height=800');
  let html = `
    <html>
    <head>
      <title>Formula Gallery</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .formula-card { 
          margin-bottom: 30px; 
          border: 1px solid #ccc; 
          padding: 15px; 
          border-radius: 5px;
        }
        .formula-card h3 { margin-top: 0; color: #333; }
        .original { background: #f5f5f5; padding: 5px; margin: 5px 0; }
        .beautified { background: #e8f4e8; padding: 5px; margin: 5px 0; }
        .status { margin: 10px 0; }
        .status span { 
          display: inline-block; 
          margin-right: 15px;
          padding: 3px 8px;
          border-radius: 3px;
          background: #f0f0f0;
        }
        .status .yes { background: #d4edda; color: #155724; }
        .status .no { background: #f8d7da; color: #721c24; }
        img { 
          max-width: 600px; 
          display: block; 
          margin-top: 10px; 
          border: 1px solid #ddd;
        }
      </style>
    </head>
    <body>
      <h1>Formula Beautification Gallery</h1>
      <p>Total formulas: ${results.length}</p>
  `;
  
  results.forEach((result, index) => {
    html += `
      <div class="formula-card">
        <h3>Formula ${index + 1}</h3>
        <div class="original"><strong>Original:</strong> <code>${result.original}</code></div>
        <div class="beautified"><strong>Beautified:</strong> <code>${result.beautified}</code></div>
        <div class="status">
          <span class="${result.expanded ? 'yes' : 'no'}">
            Expanded: ${result.expanded ? '✅' : '❌'}
          </span>
          <span class="${result.hasOperationLines ? 'yes' : 'no'}">
            Operation Lines: ${result.hasOperationLines ? '✅' : '❌'}
          </span>
        </div>
        ${result.screenshot ? `<img src="${result.screenshot}">` : '<p>No screenshot available</p>'}
      </div>
    `;
  });
  
  html += '</body></html>';
  win.document.write(html);
}

// ============================================
// EXPORT FUNCTIONS
// ============================================

/**
 * Export results as JSON
 */
function exportJSON() {
  const results = window.beautificationResults;
  if (!results) {
    console.error('No results to export');
    return;
  }
  
  const data = JSON.stringify(results, null, 2);
  const blob = new Blob([data], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `beautification-results-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  console.log('✅ Results exported as JSON');
}

/**
 * Export results as HTML report
 */
function exportHTMLReport() {
  const results = window.beautificationResults;
  const report = window.beautificationReport;
  
  if (!results) {
    console.error('No results to export');
    return;
  }
  
  let html = `<!DOCTYPE html>
<html>
<head>
  <title>Beautification Report - ${new Date().toLocaleDateString()}</title>
  <style>
    body { 
      font-family: 'Segoe UI', Arial, sans-serif; 
      padding: 40px; 
      max-width: 1200px; 
      margin: 0 auto;
    }
    h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
    .summary { 
      background: #ecf0f1; 
      padding: 20px; 
      border-radius: 5px; 
      margin: 20px 0;
    }
    .summary-stat { 
      display: inline-block; 
      margin: 10px 20px 10px 0; 
      font-size: 18px;
    }
    .formula { 
      margin: 20px 0; 
      padding: 20px; 
      border: 1px solid #ddd; 
      border-radius: 5px;
      background: #fff;
    }
    .original { 
      color: #666; 
      background: #f8f9fa;
      padding: 10px;
      border-radius: 3px;
      margin: 10px 0;
    }
    .beautified { 
      background: #e8f5e9; 
      padding: 15px; 
      margin: 10px 0;
      border-left: 4px solid #4caf50;
      border-radius: 3px;
    }
    pre { 
      overflow-x: auto; 
      white-space: pre-wrap;
      font-size: 14px;
    }
    .success { color: #27ae60; }
    .error { color: #e74c3c; }
  </style>
</head>
<body>
  <h1>Formula Beautification Report</h1>
  <p>Generated: ${new Date().toLocaleString()}</p>
  `;
  
  if (report) {
    html += `
    <div class="summary">
      <h2>Summary</h2>
      <div class="summary-stat">Total Formulas: <strong>${report.summary.total}</strong></div>
      <div class="summary-stat">Successful: <strong class="success">${report.summary.successful}</strong></div>
      <div class="summary-stat">Expanded: <strong>${report.summary.expanded}</strong></div>
      <div class="summary-stat">With Operation Lines: <strong>${report.summary.withOperationLines}</strong></div>
    </div>`;
  }
  
  html += '<h2>Detailed Results</h2>';
  
  results.forEach((result, i) => {
    html += `
    <div class="formula">
      <h3>Formula ${i + 1}</h3>
      <div class="original"><strong>Original:</strong> <code>${result.original}</code></div>
      <div class="beautified">
        <strong>Beautified LaTeX:</strong>
        <pre>${result.beautified}</pre>
      </div>
      <div>
        <span class="${result.expanded ? 'success' : ''}">Expanded: ${result.expanded ? '✅' : '❌'}</span> | 
        <span class="${result.hasOperationLines ? 'success' : ''}">Operation Lines: ${result.hasOperationLines ? '✅' : '❌'}</span>
      </div>
      ${result.error ? `<div class="error">Error: ${result.error}</div>` : ''}
    </div>`;
  });
  
  html += '</body></html>';
  
  const blob = new Blob([html], {type: 'text/html'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `beautification-report-${Date.now()}.html`;
  a.click();
  URL.revokeObjectURL(url);
  console.log('✅ Report exported as HTML');
}

// ============================================
// REPORT GENERATION
// ============================================

/**
 * Generate comprehensive report
 * @param {Array} results - Processing results
 */
function generateReport(results) {
  const successful = results.filter(r => !r.error);
  const expanded = successful.filter(r => r.expanded);
  const withLines = successful.filter(r => r.hasOperationLines);
  
  console.log('\n========================================');
  console.log('    BEAUTIFICATION REPORT');
  console.log('========================================');
  console.log(`Total formulas processed: ${results.length}`);
  console.log(`Successfully beautified: ${successful.length}`);
  console.log(`Algebraic steps expanded: ${expanded.length}`);
  console.log(`With operation lines: ${withLines.length}`);
  console.log(`Errors: ${results.length - successful.length}`);
  console.log('========================================\n');
  
  // Show examples of expanded algebraic steps
  const algebraicExample = results.find(r => r.hasOperationLines);
  if (algebraicExample) {
    console.log('📝 Example of Expanded Algebraic Steps:');
    console.log('Original:', algebraicExample.original);
    console.log('Expanded:', algebraicExample.beautified);
  }
  
  return {
    summary: {
      total: results.length,
      successful: successful.length,
      expanded: expanded.length,
      withOperationLines: withLines.length,
      errors: results.length - successful.length
    },
    results: results,
    timestamp: new Date().toISOString()
  };
}

// ============================================
// MAIN EXECUTION FUNCTION
// ============================================

/**
 * Main function to run the complete beautification process
 * @param {Array<string>} formulas - Optional custom formula array
 */
async function runBeautification(formulas = null) {
  try {
    console.log('🚀 Starting Formula Beautification System...\n');
    
    // Use provided formulas or default test set
    const formulasToProcess = formulas || TEST_FORMULAS;
    
    // Initialize system
    const api = await initializeSystem();
    
    // Process all formulas
    console.log(`\n📊 Processing ${formulasToProcess.length} formulas...\n`);
    const results = await processBatch(formulasToProcess, api);
    
    // Generate report
    const report = generateReport(results);
    
    // Save to window for access
    window.beautificationResults = results;
    window.beautificationReport = report;
    
    console.log('✅ Processing complete!');
    console.log('📁 Results saved to: window.beautificationResults');
    console.log('📊 Report saved to: window.beautificationReport');
    console.log('\n🔍 To view results:');
    console.log('  - Gallery: createScreenshotGallery()');
    console.log('  - Export JSON: exportJSON()');
    console.log('  - Export HTML: exportHTMLReport()');
    console.log('  - View specific: viewScreenshot(0)');
    
    return report;
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    throw error;
  }
}

// ============================================
// QUICK START COMMANDS
// ============================================

console.log('═══════════════════════════════════════════');
console.log('  FORMULA BEAUTIFICATION SYSTEM LOADED');
console.log('═══════════════════════════════════════════');
console.log('');
console.log('Quick Start Commands:');
console.log('  runBeautification()     - Process default formulas');
console.log('  runBeautification([...]) - Process custom formulas');
console.log('');
console.log('After processing:');
console.log('  createScreenshotGallery() - View all screenshots');
console.log('  exportJSON()              - Export results as JSON');
console.log('  exportHTMLReport()        - Export HTML report');
console.log('  viewScreenshot(n)         - View specific result');
console.log('');
console.log('═══════════════════════════════════════════');

// Export functions to window for easy access
window.runBeautification = runBeautification;
window.createScreenshotGallery = createScreenshotGallery;
window.exportJSON = exportJSON;
window.exportHTMLReport = exportHTMLReport;
window.viewScreenshot = viewScreenshot;