import { ClaudeCodeHelper } from '../claude-code-helpers.js';

export const TestCases = [
  {
    name: 'Basic equation',
    input: 'x+2=5',
    expected: 'x\\hspace{0.2em}+\\hspace{0.2em}2\\hspace{0.25em}=\\hspace{0.25em}5'
  },
  {
    name: 'Algebraic steps',
    input: '2x+4=10\\\\2x=6\\\\x=3',
    expectedStructure: 'array',
    expectedAlignment: 'equals'
  },
  {
    name: 'Integral with differential',
    input: '\\int f(x)dx',
    expected: '\\int f(x)\\hspace{0.15em}dx'
  },
  {
    name: 'Arithmetic subtraction',
    input: '45\\\\-18\\\\27',
    expectedStructure: 'array',
    expectedLines: ['\\hline', '\\cline']
  },
  {
    name: 'Trigonometric functions',
    input: '\\sin x+\\cos x',
    expected: '\\sin\\hspace{0.1em}x\\hspace{0.2em}+\\hspace{0.2em}\\cos\\hspace{0.1em}x'
  },
  {
    name: 'Logarithmic function',
    input: '\\log x+\\ln y',
    expected: '\\log\\hspace{0.1em}x\\hspace{0.2em}+\\hspace{0.2em}\\ln\\hspace{0.1em}y'
  }
];

export async function runTests(api) {
  const helper = new ClaudeCodeHelper(api);
  const results = [];
  
  for (const test of TestCases) {
    console.log(`Testing: ${test.name}`);
    const result = await helper.processFormula(test.input);
    
    // Verify expectations
    const passed = verifyTest(result, test);
    results.push({
      name: test.name,
      passed: passed,
      result: result
    });
  }
  
  return results;
}

function verifyTest(result, test) {
  if (test.expected) {
    return result.beautified === test.expected;
  }
  
  if (test.expectedStructure === 'array') {
    return result.beautified.includes('\\begin{array}');
  }
  
  if (test.expectedAlignment === 'equals') {
    return result.beautified.includes('&') && result.beautified.includes('=');
  }
  
  if (test.expectedLines) {
    return test.expectedLines.every(line => result.beautified.includes(line));
  }
  
  return true;
}

export async function runSingleTest(api, testName) {
  const test = TestCases.find(t => t.name === testName);
  if (!test) {
    throw new Error(`Test not found: ${testName}`);
  }
  
  const helper = new ClaudeCodeHelper(api);
  const result = await helper.processFormula(test.input);
  const passed = verifyTest(result, test);
  
  return {
    name: test.name,
    input: test.input,
    expected: test.expected || 'See structure expectations',
    actual: result.beautified,
    passed: passed
  };
}