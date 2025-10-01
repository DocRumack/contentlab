/**
 * Quick test runner to verify the AST pipeline is working
 * Run with: node src/ast-pipeline/test/quickTest.js
 */

import ProblemProcessor from '../processors/problemProcessor.js';

async function quickTest() {
  console.log('Testing AST Pipeline for Problem Processing\n');
  console.log('='.repeat(50));
  
  const processor = new ProblemProcessor();
  
  // Test Case 1: Simple linear equation
  console.log('\n📝 Test 1: Simple Linear Equation');
  console.log('Problem: "Solve: 2x + 4 = 10"');
  
  const result = await processor.processProblem('Solve: 2x + 4 = 10');
  
  if (result.success) {
    console.log('✅ Success! Generated', result.data.Steps.length, 'steps\n');
    
    result.data.Steps.forEach(step => {
      console.log(`Step ${step.stepNumber}: ${step.description}`);
      console.log('LaTeX:', step.latex);
      console.log('');
    });
  } else {
    console.log('❌ Failed:', result.error);
  }
  
  // Show the final JSON structure
  console.log('='.repeat(50));
  console.log('\n📋 Generated JSON Structure:');
  console.log(JSON.stringify(result.data, null, 2));
}

quickTest().catch(console.error);