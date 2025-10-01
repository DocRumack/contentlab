/**
 * ContentLab API Usage Examples for Claude Code
 * 
 * This file demonstrates how Claude Code can use the ContentLab API
 * to process formulas, capture screenshots, and iterate on alignment.
 */

// ============================================
// BASIC USAGE
// ============================================

// Access the API (ContentLab must be running with enableAPI=true)
const api = window.ContentLabAPI;

// Process a single formula
async function testSingleFormula() {
  const formula = "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}";
  
  const result = await api.processFormula(formula);
  
  console.log("Formula processed:", result.success);
  console.log("Screenshot captured:", result.hasScreenshot);
  
  if (result.screenshot) {
    // Claude Code could analyze the screenshot here
    console.log("Screenshot data length:", result.screenshot.length);
  }
}

// ============================================
// MANUAL CONTROL FLOW
// ============================================

async function manualControl() {
  // Set a formula
  await api.setFormulaContent("\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}");
  
  // Wait for render
  await api.waitForRender(200);
  
  // Capture screenshot
  const screenshot = await api.getScreenshot();
  
  // Get the current formula back
  const currentFormula = api.getFormulaContent();
  console.log("Current formula:", currentFormula);
}

// ============================================
// BATCH PROCESSING
// ============================================

async function processBatch() {
  const formulas = [
    "E = mc^2",
    "\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}",
    "\\nabla \\times \\vec{B} = \\mu_0 \\vec{J} + \\mu_0 \\epsilon_0 \\frac{\\partial \\vec{E}}{\\partial t}",
    "\\oint_C \\vec{F} \\cdot d\\vec{r} = \\iint_S (\\nabla \\times \\vec{F}) \\cdot d\\vec{S}"
  ];
  
  const results = await api.processFormulaBatch(formulas, async (result, index, total) => {
    console.log(`Processed ${index + 1}/${total}: ${result.success ? '✓' : '✗'}`);
    
    // Claude Code could analyze each screenshot here
    if (result.screenshot) {
      // Analyze alignment, spacing, etc.
      const alignmentIssues = analyzeScreenshot(result.screenshot);
      if (alignmentIssues.length > 0) {
        console.log(`Formula ${index + 1} has alignment issues:`, alignmentIssues);
      }
    }
  });
  
  console.log(`Batch complete: ${results.length} formulas processed`);
}

// ============================================
// ITERATIVE ALIGNMENT (What Claude Code Would Do)
// ============================================

async function iterativeAlignment(formula) {
  const maxIterations = 5;
  let currentFormula = formula;
  let iteration = 0;
  
  while (iteration < maxIterations) {
    // Process the formula
    const result = await api.processFormula(currentFormula);
    
    if (!result.screenshot) {
      console.error("Failed to capture screenshot");
      break;
    }
    
    // Analyze the screenshot (Claude Code would implement this)
    const issues = analyzeScreenshot(result.screenshot);
    
    if (issues.length === 0) {
      console.log(`✓ Formula aligned perfectly after ${iteration + 1} iterations`);
      return currentFormula;
    }
    
    // Apply corrections based on issues found
    currentFormula = applyCorrections(currentFormula, issues);
    iteration++;
    
    console.log(`Iteration ${iteration}: Found ${issues.length} issues, applying corrections...`);
  }
  
  console.log(`Reached max iterations (${maxIterations})`);
  return currentFormula;
}

// ============================================
// HELPER FUNCTIONS (Claude Code would implement these)
// ============================================

function analyzeScreenshot(screenshotBase64) {
  // Claude Code would implement visual analysis here
  // For now, return mock issues
  return [];
}

function applyCorrections(formula, issues) {
  // Claude Code would implement corrections here
  // Examples of corrections:
  // - Add spacing: formula.replace('=', '\\,=\\,')
  // - Adjust fractions: formula.replace('\\frac', '\\tfrac')
  // - Add phantoms for alignment: formula + '\\phantom{0}'
  return formula;
}

// ============================================
// SPACING ADJUSTMENTS EXAMPLES
// ============================================

const spacingAdjustments = {
  thin: '\\,',      // Thin space (3/18 em)
  medium: '\\:',    // Medium space (4/18 em)  
  thick: '\\;',     // Thick space (5/18 em)
  quad: '\\quad',   // 1 em space
  qquad: '\\qquad', // 2 em space
  negative: '\\!',  // Negative thin space (-3/18 em)
};

async function testSpacing() {
  // Test different spacing adjustments
  const formulas = [
    "a+b",                    // No spacing
    "a\\,+\\,b",             // Thin spaces
    "a\\:+\\:b",             // Medium spaces
    "a\\;+\\;b",             // Thick spaces
    "a\\quad+\\quad b",      // Quad spaces
  ];
  
  for (const formula of formulas) {
    await api.processFormula(formula);
    await api.waitForRender(500); // Wait to see the result
  }
}

// ============================================
// EXPORT FOR TESTING
// ============================================

window.ContentLabTests = {
  testSingleFormula,
  manualControl,
  processBatch,
  iterativeAlignment,
  testSpacing
};

console.log("ContentLab API test functions loaded. Access via window.ContentLabTests");
console.log("Example: await window.ContentLabTests.testSingleFormula()");
