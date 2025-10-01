/**
 * Test Problems - Examples to test the AST pipeline
 */

const ProblemProcessor = require('../processors/problemProcessor');

// Create processor instance
const processor = new ProblemProcessor();

// Test problems of varying complexity
const testProblems = [
  {
    name: 'Simple Linear - Addition',
    markdown: 'Solve: x + 4 = 10',
    expected: {
      steps: 2,
      operations: ['subtract']
    }
  },
  {
    name: 'Simple Linear - Subtraction',
    markdown: 'Solve: x - 3 = 7',
    expected: {
      steps: 2,
      operations: ['add']
    }
  },
  {
    name: 'Linear with Coefficient',
    markdown: 'Solve: 2x + 4 = 10',
    expected: {
      steps: 3,
      operations: ['subtract', 'divide']
    }
  },
  {
    name: 'Linear with Negative',
    markdown: 'Solve: 3x - 6 = 9',
    expected: {
      steps: 3,
      operations: ['add', 'divide']
    }
  },
  {
    name: 'Both Sides Variables',
    markdown: 'Solve: 2x + 3 = x + 7',
    expected: {
      steps: 4,
      operations: ['subtract', 'subtract']
    }
  },
  {
    name: 'Simple Quadratic',
    markdown: 'Solve: x^2 - 5x + 6 = 0',
    expected: {
      type: 'quadratic',
      method: 'factoring'
    }
  },
  {
    name: 'Derivative Power Rule',
    markdown: 'Find the derivative: f(x) = x^3',
    expected: {
      type: 'derivative',
      result: '3x^2'
    }
  },
  {
    name: 'Complex Linear',
    markdown: 'Solve: 3(x + 2) = 2(x - 1) + 10',
    expected: {
      steps: 5,
      operations: ['expand', 'simplify', 'subtract', 'subtract']
    }
  }
];

/**
 * Run tests
 */
async function runTests() {
  console.log('='.repeat(60));
  console.log('AST Pipeline Test Suite');
  console.log('='.repeat(60));
  
  for (const test of testProblems) {
    console.log(`\nTesting: ${test.name}`);
    console.log(`Input: ${test.markdown}`);
    console.log('-'.repeat(40));
    
    try {
      const result = await processor.processProblem(test.markdown);
      
      if (result.success) {
        console.log('✓ Processing successful');
        console.log(`  Problem Type: ${result.data.problemType}`);
        console.log(`  Complexity: ${result.data.complexity}`);
        console.log(`  Steps Generated: ${result.data.Steps.length}`);
        
        // Display each step
        result.data.Steps.forEach(step => {
          console.log(`\n  Step ${step.stepNumber}:`);
          console.log(`    Description: ${step.description}`);
          if (step.instruction) {
            console.log(`    Instruction: ${step.instruction}`);
          }
          console.log(`    LaTeX: ${step.latex.substring(0, 50)}...`);
        });
        
        // Validation
        if (result.validation.isValid) {
          console.log('\n  ✓ Validation passed');
        } else {
          console.log('\n  ✗ Validation issues:');
          result.validation.issues.forEach(issue => {
            console.log(`    - ${issue}`);
          });
        }
      } else {
        console.log('✗ Processing failed');
        console.log(`  Error: ${result.error}`);
      }
    } catch (error) {
      console.log('✗ Test crashed');
      console.log(`  Error: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('Test Suite Complete');
  console.log('='.repeat(60));
}

/**
 * Example of processing a single problem with full output
 */
async function demonstrateSingleProblem() {
  console.log('\n' + '='.repeat(60));
  console.log('Detailed Example: 2x + 4 = 10');
  console.log('='.repeat(60));
  
  const problem = 'Solve: 2x + 4 = 10';
  const result = await processor.processProblem(problem, {
    metadata: {
      courseId: 'algebra-1',
      chapterId: 'linear-equations',
      lessonId: 'solving-basics'
    }
  });
  
  if (result.success) {
    console.log('\nGenerated JSON:');
    console.log(JSON.stringify(result.data, null, 2));
    
    console.log('\nFormatted LaTeX for Display:');
    result.data.Steps.forEach(step => {
      console.log(`\nStep ${step.stepNumber}:`);
      console.log(step.latex);
    });
    
    console.log('\nDebug Information:');
    console.log('Parsed:', result.debug.parsed);
    console.log('Template Applied:', result.debug.templated.complete ? 'Yes' : 'No');
  }
}

/**
 * Test batch processing
 */
async function testBatchProcessing() {
  console.log('\n' + '='.repeat(60));
  console.log('Batch Processing Test');
  console.log('='.repeat(60));
  
  const problems = [
    'Solve: x + 5 = 12',
    'Solve: 3x - 2 = 13',
    'Solve: 2x + 8 = 20',
    'Find derivative: f(x) = x^2'
  ];
  
  const results = await processor.processBatch(problems);
  
  console.log(`\nProcessed: ${results.total} problems`);
  console.log(`Successful: ${results.successful}`);
  console.log(`Failed: ${results.failed}`);
  
  results.results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.input}`);
    console.log(`   Status: ${result.success ? '✓' : '✗'}`);
    if (result.success) {
      console.log(`   Steps: ${result.data.Steps.length}`);
    }
  });
}

// Run all tests
if (require.main === module) {
  (async () => {
    await runTests();
    await demonstrateSingleProblem();
    await testBatchProcessing();
  })();
}

module.exports = { testProblems, processor };