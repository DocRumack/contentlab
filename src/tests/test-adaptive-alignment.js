import { VisualAlignmentAnalyzer } from '../api/visual-alignment-analyzer.js';

async function testAdaptiveAlignment() {
  const analyzer = new VisualAlignmentAnalyzer();

  // Test equations of increasing complexity
  const testEquations = [
    // Simple linear equations (should still work)
    {
      id: 'simple_linear',
      input: '2x+4=10; -4; 2x=6; ÷2; x=3'
    },

    // Larger numbers with different digit counts
    {
      id: 'large_numbers',
      input: '100x-2500=7500; +2500; 100x=10000; ÷100; x=100'
    },

    // Equations with parentheses
    {
      id: 'parentheses_simple',
      input: '2(x+3)=14; ÷2; x+3=7; -3; x=4'
    },

    // More complex parentheses
    {
      id: 'parentheses_complex',
      input: '3(2x-5)=21; ÷3; 2x-5=7; +5; 2x=12; ÷2; x=6'
    },

    // Equations with fractions (represented as division)
    {
      id: 'fraction_equation',
      input: 'x/4+3=7; -3; x/4=4; ×4; x=16'
    },

    // Equations with exponents (using ^ notation)
    {
      id: 'exponent_simple',
      input: 'x^2=25; √; x=5'
    },

    // Mixed operations
    {
      id: 'mixed_operations',
      input: '5x+10=2x+25; -2x; 3x+10=25; -10; 3x=15; ÷3; x=5'
    },

    // Negative coefficients
    {
      id: 'negative_coefficients',
      input: '-3x+12=6; -12; -3x=-6; ÷-3; x=2'
    }
  ];

  console.log('Testing Adaptive Alignment System');
  console.log('==================================\n');

  await analyzer.setup();

  // Process just the first few complex ones for testing
  const testSubset = testEquations.slice(1, 4); // large_numbers, parentheses_simple, parentheses_complex

  for (const equation of testSubset) {
    console.log(`\nTesting: ${equation.id}`);
    console.log(`Input: ${equation.input}`);
    console.log('-'.repeat(60));

    try {
      const result = await analyzer.processEquation(equation.input, equation.id);

      console.log('\nResults:');
      for (const step of result.steps) {
        console.log(`  ${step.from} → ${step.to}`);
        console.log(`  Operation: ${step.operation}`);
        console.log(`  Iterations: ${step.iterations}`);
        console.log(`  Final alignment: ${step.finalAlignment?.score?.toFixed(2)}px`);
        if (step.needsVisualCheck) {
          console.log(`  ⚠️ Needs visual verification: ${step.screenshotPath}`);
        }
        console.log();
      }

    } catch (error) {
      console.error(`Error: ${error.message}`);
    }
  }

  await analyzer.cleanup();
  console.log('\n✅ Adaptive alignment testing complete');
}

// Run the test
testAdaptiveAlignment().catch(console.error);