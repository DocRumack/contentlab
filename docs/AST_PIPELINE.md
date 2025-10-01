# AST-Based Content Processing Pipeline

## Overview
Using an Abstract Syntax Tree (AST) as an intermediate representation between Markdown and JSON provides intelligent content processing capabilities that simple text conversion cannot achieve.

---

## Why Use an AST?

### Direct Conversion Problems
```markdown
# Direct MD → JSON Conversion
- Regex-based, fragile
- No understanding of structure
- Can't make intelligent decisions
- Difficult to handle edge cases
```

### AST Advantages
```markdown
# MD → AST → JSON
- Structural understanding
- Context-aware transformations
- Intelligent content decisions
- Robust edge case handling
```

---

## The AST Pipeline

### 1. Parse MD to AST
```javascript
// Using a library like remark or marked
import { remark } from 'remark';
import { visit } from 'unist-util-visit';

async function parseToAST(mdContent) {
  const processor = remark();
  const ast = processor.parse(mdContent);
  return ast;
}

// Example AST structure
{
  type: 'root',
  children: [
    {
      type: 'heading',
      depth: 1,
      children: [{
        type: 'text',
        value: 'Solving Quadratic Equations'
      }]
    },
    {
      type: 'paragraph',
      children: [
        { type: 'text', value: 'The equation ' },
        { type: 'inlineMath', value: 'x^2 + 5x + 6 = 0' },
        { type: 'text', value: ' can be solved by factoring.' }
      ]
    },
    {
      type: 'math',
      value: '(x + 2)(x + 3) = 0'
    }
  ]
}
```

### 2. Analyze and Enrich AST
```javascript
// Add metadata and intelligence to the AST
function enrichAST(ast) {
  const enriched = JSON.parse(JSON.stringify(ast)); // Deep clone
  
  visit(enriched, 'math', (node) => {
    // Analyze math complexity
    node.complexity = analyzeMathComplexity(node.value);
    node.renderingHints = {
      needsMoreSpace: node.complexity > 7,
      shouldBeDisplayMath: node.value.length > 30,
      containsMatrix: /\\begin{matrix}/.test(node.value)
    };
  });
  
  visit(enriched, 'paragraph', (node) => {
    // Detect content patterns
    const text = extractText(node);
    node.metadata = {
      isStep: /^Step \d+:/.test(text),
      isAnswer: /^Answer:/.test(text),
      isNote: /^Note:/.test(text),
      hasInlineMath: hasInlineMath(node),
      wordCount: text.split(' ').length
    };
  });
  
  visit(enriched, 'list', (node) => {
    // Analyze list content
    node.metadata = {
      hasMath: node.children.some(child => hasmath(child)),
      isStepList: node.children.every(child => 
        extractText(child).match(/^Step \d+/)
      ),
      averageItemLength: calculateAvgLength(node.children)
    };
  });
  
  return enriched;
}
```

### 3. Apply Intelligent Transformations
```javascript
// Make smart decisions based on AST analysis
function transformAST(ast, options = {}) {
  const { targetContainer, viewport } = options;
  
  // Smart content splitting for responsive design
  if (viewport === 'phone') {
    visit(ast, 'math', (node, index, parent) => {
      if (node.complexity > 5) {
        // Split complex math into steps
        const steps = splitComplexMath(node.value);
        parent.children.splice(index, 1, ...steps);
      }
    });
  }
  
  // Intelligent formatting based on container
  if (targetContainer === 'ProblemSolver') {
    visit(ast, 'paragraph', (node) => {
      if (node.metadata.isStep) {
        // Add separator before each step
        node.addSeparatorBefore = true;
      }
    });
  }
  
  // Auto-detect when to use special formats
  visit(ast, 'paragraph', (node) => {
    const text = extractText(node);
    
    if (text.startsWith('Definition:')) {
      node.convertTo = 'def';
    } else if (text.startsWith('Warning:')) {
      node.convertTo = 'warning';
    } else if (text.startsWith('Example:')) {
      node.convertTo = 'example';
    } else if (node.metadata.isAnswer) {
      node.convertTo = 'kc';
    }
  });
  
  // Optimize list presentation
  visit(ast, 'list', (node) => {
    if (node.metadata.isStepList) {
      // Convert to numbered with separators
      node.style = 'numbered';
      node.addSeparators = true;
    } else if (node.metadata.averageItemLength > 50) {
      // Long items need more spacing
      node.addPadding = true;
    }
  });
  
  return ast;
}
```

### 4. Generate JSON from Transformed AST
```javascript
// Convert enriched AST to TestConstructor JSON
function astToJSON(ast) {
  const contentArray = [];
  
  function processNode(node) {
    switch (node.type) {
      case 'heading':
        contentArray.push({
          type: `h${node.depth}`,
          content: extractText(node)
        });
        break;
        
      case 'paragraph':
        if (node.addSeparatorBefore) {
          contentArray.push({ type: 'separator' });
        }
        
        if (node.convertTo) {
          contentArray.push({
            type: node.convertTo,
            content: extractText(node).replace(/^.*?:\s*/, '')
          });
        } else if (node.metadata.hasInlineMath) {
          contentArray.push({
            type: 'text',
            content: reconstructWithMath(node)
          });
        } else {
          contentArray.push({
            type: 'text',
            content: extractText(node)
          });
        }
        break;
        
      case 'math':
        if (node.renderingHints.needsMoreSpace) {
          // Add padding or special handling
          contentArray.push({ type: 'separator' });
        }
        
        contentArray.push({
          type: 'formula',
          content: node.value
        });
        
        if (node.renderingHints.needsMoreSpace) {
          contentArray.push({ type: 'separator' });
        }
        break;
        
      case 'list':
        const listItem = {
          type: 'list',
          style: node.ordered ? 'numbered' : 'bullet',
          items: node.children.map(child => extractText(child))
        };
        
        if (node.metadata.hasMath) {
          // Process math in list items
          listItem.items = node.children.map(child => 
            reconstructWithMath(child)
          );
        }
        
        contentArray.push(listItem);
        
        if (node.addSeparators) {
          contentArray.push({ type: 'separator' });
        }
        break;
        
      case 'blockquote':
        const quoteText = extractText(node);
        if (quoteText.startsWith('NOTE:')) {
          contentArray.push({
            type: 'note',
            content: quoteText.replace('NOTE:', '').trim()
          });
        } else {
          contentArray.push({
            type: 'text',
            content: quoteText
          });
        }
        break;
    }
  }
  
  ast.children.forEach(processNode);
  
  return contentArray;
}
```

---

## Intelligent Processing Examples

### Example 1: Math Complexity Detection
```javascript
function analyzeMathComplexity(mathString) {
  let complexity = 0;
  
  // Check for complex structures
  if (mathString.includes('\\frac')) complexity += 2;
  if (mathString.includes('\\sqrt')) complexity += 2;
  if (mathString.includes('\\int')) complexity += 3;
  if (mathString.includes('\\sum')) complexity += 3;
  if (mathString.includes('\\matrix')) complexity += 4;
  if (mathString.includes('\\begin{align}')) complexity += 3;
  
  // Check for nested structures
  const nestingLevel = countNesting(mathString);
  complexity += nestingLevel * 2;
  
  // Check length
  if (mathString.length > 50) complexity += 2;
  if (mathString.length > 100) complexity += 3;
  
  return complexity;
}

// Use complexity to make decisions
if (node.complexity > 7) {
  // This math needs special handling
  // - Larger container
  // - More padding
  // - Possibly split into steps
}
```

### Example 2: Responsive Content Adaptation
```javascript
function adaptForViewport(ast, viewport) {
  if (viewport === 'phone') {
    visit(ast, (node) => {
      // Split long paragraphs
      if (node.type === 'paragraph' && node.metadata.wordCount > 50) {
        const sentences = splitIntoSentences(node);
        return sentences.map(s => ({
          type: 'paragraph',
          children: s.children
        }));
      }
      
      // Simplify complex math
      if (node.type === 'math' && node.complexity > 5) {
        // Convert to step-by-step
        return createStepByStep(node);
      }
      
      // Convert wide tables to lists
      if (node.type === 'table' && node.columns > 3) {
        return convertTableToList(node);
      }
    });
  }
  
  return ast;
}
```

### Example 3: Auto-Detection of Content Types
```javascript
function detectContentPattern(ast) {
  const patterns = {
    problemSolution: false,
    conceptExplanation: false,
    reviewSummary: false,
    practiceSet: false
  };
  
  // Analyze AST structure
  let hasSteps = false;
  let hasAnswer = false;
  let hasDefinition = false;
  let hasPracticeProblems = false;
  
  visit(ast, (node) => {
    if (node.metadata?.isStep) hasSteps = true;
    if (node.metadata?.isAnswer) hasAnswer = true;
    if (node.convertTo === 'def') hasDefinition = true;
    if (node.type === 'list' && node.metadata?.isProblemList) {
      hasPracticeProblems = true;
    }
  });
  
  // Determine pattern
  if (hasSteps && hasAnswer) {
    patterns.problemSolution = true;
  }
  if (hasDefinition && !hasSteps) {
    patterns.conceptExplanation = true;
  }
  if (hasPracticeProblems) {
    patterns.practiceSet = true;
  }
  
  return patterns;
}

// Use pattern detection to optimize output
const patterns = detectContentPattern(ast);
if (patterns.problemSolution) {
  // Apply problem-solution optimizations
  ast = optimizeForProblemSolving(ast);
} else if (patterns.conceptExplanation) {
  // Apply concept explanation optimizations
  ast = optimizeForConceptTeaching(ast);
}
```

### Example 4: Smart Content Splitting
```javascript
function intelligentSplit(ast, maxHeight = 600) {
  const chunks = [];
  let currentChunk = [];
  let currentHeight = 0;
  
  ast.children.forEach(node => {
    const estimatedHeight = estimateNodeHeight(node);
    
    if (currentHeight + estimatedHeight > maxHeight) {
      // Check if we can split the node itself
      if (node.type === 'list' && node.children.length > 3) {
        // Split long lists
        const halfIndex = Math.floor(node.children.length / 2);
        const firstHalf = {
          ...node,
          children: node.children.slice(0, halfIndex)
        };
        const secondHalf = {
          ...node,
          children: node.children.slice(halfIndex)
        };
        
        currentChunk.push(firstHalf);
        chunks.push(currentChunk);
        
        currentChunk = [secondHalf];
        currentHeight = estimateNodeHeight(secondHalf);
      } else {
        // Start new chunk
        chunks.push(currentChunk);
        currentChunk = [node];
        currentHeight = estimatedHeight;
      }
    } else {
      currentChunk.push(node);
      currentHeight += estimatedHeight;
    }
  });
  
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}

function estimateNodeHeight(node) {
  // Estimate pixel height based on content
  const baseHeights = {
    heading: { 1: 50, 2: 40, 3: 35, 4: 30 },
    paragraph: 25, // base + 20 per line
    math: 60, // depends on complexity
    list: 30, // per item
    separator: 20,
    note: 60,
    warning: 60,
    example: 80,
    table: 40 // per row
  };
  
  if (node.type === 'heading') {
    return baseHeights.heading[node.depth] || 30;
  }
  
  if (node.type === 'paragraph') {
    const words = node.metadata?.wordCount || 10;
    const lines = Math.ceil(words / 10); // ~10 words per line
    return baseHeights.paragraph * lines;
  }
  
  if (node.type === 'math') {
    return baseHeights.math * (1 + node.complexity / 10);
  }
  
  if (node.type === 'list') {
    return baseHeights.list * node.children.length;
  }
  
  return baseHeights[node.type] || 30;
}
```

---

## Complete Pipeline Example

```javascript
// Full pipeline with AST
async function processContent(mdContent, options = {}) {
  const {
    targetContainer = 'ProblemSolver',
    viewport = 'desktop',
    optimize = true
  } = options;
  
  // Step 1: Parse to AST
  let ast = await parseToAST(mdContent);
  
  // Step 2: Enrich with metadata
  ast = enrichAST(ast);
  
  // Step 3: Detect patterns
  const patterns = detectContentPattern(ast);
  
  // Step 4: Apply transformations
  ast = transformAST(ast, {
    targetContainer,
    viewport,
    patterns
  });
  
  // Step 5: Optimize if needed
  if (optimize) {
    ast = optimizeContent(ast, {
      viewport,
      patterns,
      targetContainer
    });
  }
  
  // Step 6: Handle responsive requirements
  if (viewport === 'phone' || viewport === 'tablet') {
    ast = adaptForViewport(ast, viewport);
  }
  
  // Step 7: Generate JSON
  const json = astToJSON(ast);
  
  // Step 8: Validate
  const validation = validateJSON(json);
  
  return {
    json,
    ast, // Keep AST for debugging
    patterns,
    validation
  };
}

// Usage
const result = await processContent(mdContent, {
  targetContainer: 'ProblemSolver',
  viewport: 'phone',
  optimize: true
});

if (result.validation.valid) {
  console.log('Content processed successfully');
  console.log('Detected patterns:', result.patterns);
  saveJSON(result.json, outputPath);
} else {
  console.error('Validation failed:', result.validation.errors);
}
```

---

## AST Benefits Summary

### 1. **Structural Understanding**
- Knows what's a heading vs. a step vs. an answer
- Understands nesting and relationships
- Can identify patterns and content types

### 2. **Intelligent Decisions**
- Automatically detects when to use special formats
- Splits content intelligently for responsive design
- Adapts complexity based on viewport

### 3. **Robust Processing**
- Handles edge cases gracefully
- Can recover from malformed input
- Provides detailed debugging information

### 4. **Extensibility**
- Easy to add new transformations
- Can plug in additional analyzers
- Supports custom node types

### 5. **Optimization**
- Can optimize for specific containers
- Adjusts for viewport constraints
- Minimizes redundant content

---

## Libraries and Tools

### Markdown AST Parsers
- **remark** - Part of unified ecosystem, very extensible
- **marked** - Fast, lightweight parser
- **markdown-it** - Pluggable with many extensions
- **mdast** - Markdown AST specification

### AST Utilities
- **unist-util-visit** - Traverse AST nodes
- **unist-util-map** - Transform AST nodes
- **unist-util-filter** - Filter AST nodes
- **unist-builder** - Build AST nodes

### Example Setup
```bash
npm install remark unist-util-visit unist-util-map
npm install remark-math remark-gfm
npm install mdast-util-to-string
```

---

## Implementation Strategy

### Phase 1: Basic AST Pipeline
1. Set up remark parser
2. Create basic enrichment functions
3. Implement simple AST to JSON conversion
4. Test with sample content

### Phase 2: Intelligence Layer
1. Add complexity analysis
2. Implement pattern detection
3. Create transformation rules
4. Add viewport adaptations

### Phase 3: Optimization
1. Implement smart splitting
2. Add container-specific optimizations
3. Create responsive adaptations
4. Performance tuning

### Phase 4: Production
1. Handle all content types
2. Add comprehensive error handling
3. Create debugging tools
4. Document the pipeline

---

## Conclusion

Using an AST-based pipeline provides the intelligence needed to:
- **Automatically adapt content** for different contexts
- **Make smart formatting decisions** based on content analysis
- **Optimize for responsive design** without manual intervention
- **Maintain consistency** while allowing flexibility
- **Handle complex content** with grace

This approach transforms content processing from a mechanical conversion to an intelligent transformation that understands and enhances your educational content.
