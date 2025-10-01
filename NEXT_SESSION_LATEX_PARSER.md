# NEXT SESSION PROMPT: LaTeX Parser for Equation Builder

## CRITICAL RULES FOR THIS CONVERSATION:
1. **USE SERENA TOOLS PROPERLY** - Read the serena_tools_complete_guide memory FIRST
2. **MANDATORY TOOL ANNOUNCEMENT PROTOCOL** - Before EVERY tool use, announce: Tool, Why, Rule Quote, End Point
3. **DO NOT WRITE FILES** unless explicitly permitted - suggest changes with specific code locations
4. **ALWAYS READ FILES BEFORE SUGGESTING UPDATES** - Your memory is stale

## Context: ContentLab Equation Builder Enhancement

We've built a hierarchical equation builder that creates LaTeX from a visual kit-based interface. Now we need the **reverse functionality**: parsing LaTeX/equations back into the builder structure.

## Current State:

### What We Have:
- **Equation Builder** (`src/components/Templates/Builders/EquationBuilder.jsx`)
  - Creates rows with left/right kits
  - Kits can be: SIMPLE, FRACTION, SUMMATION, INTEGRAL, SQRT
  - Generates LaTeX from kit structure
- **EditorPanel** with three tabs:
  - File JSON (full JSON files)
  - Object JSON (single objects)
  - LaTeX (raw LaTeX strings)
- **Extract functionality**: Can extract JSON objects or LaTeX strings from cursor position
- **Save/Export**: Can save equations and replace in documents

### What We Need:
**"Import LaTeX" button** in the Equation Builder that:
1. Takes the current content from the EditorPanel (LaTeX or Object JSON)
2. Parses it into the kit structure
3. Populates the builder with the parsed structure

## Implementation Requirements:

### Phase 1: Basic Parser (Start Here)
Handle simple cases:
- Basic arithmetic: `2x + 4 = 10`
- Multiple terms: `3x - 2y + 5 = 0`
- Simple fractions: `\frac{x+1}{2} = 5`
- Square roots: `\sqrt{x+4} = 2`

Parser should:
1. Detect equation vs expression (has `=` or not)
2. Split into left/right sides
3. Tokenize into terms and operators
4. Create appropriate kit objects
5. Handle spacing between elements

### Phase 2: Advanced Features (If Time Permits)
- Nested structures: `\frac{\sqrt{x}}{2}`
- Summations: `\sum_{i=1}^{n} i^2`
- Integrals: `\int_0^1 x dx`
- Parentheses grouping
- Implicit multiplication: `2x`, `3(x+1)`

## Technical Approach:

### Core Parser Structure:
```javascript
const parseLatexToBuilder = (latex) => {
  // Remove $ delimiters if present
  latex = latex.replace(/^\$/, '').replace(/\$$/, '');
  
  // Check for array environment (multi-row)
  if (latex.includes('\\begin{array}')) {
    return parseArrayEnvironment(latex);
  }
  
  // Single equation/expression
  return parseSingleRow(latex);
};

const parseSingleRow = (latex) => {
  // Detect special structures first
  const structures = detectStructures(latex); // fractions, sqrts, etc.
  
  // Split on equals if present
  const hasEquals = latex.includes('=');
  
  if (hasEquals) {
    const [left, right] = latex.split('=');
    return {
      leftKits: parseExpression(left, structures),
      equalKit: { content: '=', ... },
      rightKits: parseExpression(right, structures)
    };
  } else {
    return {
      leftKits: parseExpression(latex, structures),
      equalKit: null,
      rightKits: null
    };
  }
};
```

### Kit Creation:
- Simple terms/operators → SIMPLE kits with content
- `\frac{}{}`→ FRACTION kit with numerator/denominator sub-rows
- `\sqrt{}`→ SQRT kit with expression sub-row
- Operators (+, -, *, /) → Separate SIMPLE kits

## Files to Modify:

1. **EquationBuilder.jsx**:
   - Add "Import LaTeX" button
   - Add `parseLatexToBuilder` function
   - Add method to populate builder from parsed structure

2. **Integration**:
   - Button should read from active EditorPanel tab
   - Handle both LaTeX strings and JSON objects with LaTeX content
   - Clear existing equation before importing

## Success Criteria:

1. Can parse: `2x + 4 = 10` into 3 left kits, equals, 1 right kit
2. Can parse: `\frac{a+b}{2} = c` into fraction kit with sub-rows
3. Can parse: `\sqrt{x^2 + y^2} = r` into sqrt kit with expression
4. Handles expressions without equals sign
5. Preserves spacing where logical

## Testing Examples:

Start with these test cases:
1. `2x + 4 = 10`
2. `x - 3 = 0`
3. `\frac{1}{2} + \frac{1}{3} = \frac{5}{6}`
4. `\sqrt{9} = 3`
5. `ax^2 + bx + c = 0`
6. `\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}` (quadratic formula, no equals)

## Important Notes:

- Start simple, get basic arithmetic working first
- Use regex carefully - LaTeX has many special characters
- Handle edge cases gracefully - show error if can't parse
- The goal is to make round-trip editing possible: Build → Export → Edit → Import → Build

## Remember:
- ALWAYS use the TOOL ANNOUNCEMENT PROTOCOL before any Serena tool use
- Activate the contentlab project first
- Read all memories, especially serena_tools_complete_guide
- Test each parsing function incrementally