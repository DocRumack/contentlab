# Content Patterns

## Overview
This document contains successful content patterns that work well in TestConstructor. These patterns have been tested across all containers and viewports.

---

## Math Problem Patterns

### Basic Step-by-Step Solution
**Use Case:** Simple algebraic problems with clear steps

```json
[
  {
    "type": "text",
    "content": "Solve for x:"
  },
  {
    "type": "formula",
    "content": "2x + 5 = 13"
  },
  {
    "type": "separator"
  },
  {
    "type": "text",
    "content": "Step 1: Subtract 5 from both sides"
  },
  {
    "type": "formula",
    "content": "2x + 5 - 5 = 13 - 5"
  },
  {
    "type": "formula",
    "content": "2x = 8"
  },
  {
    "type": "separator"
  },
  {
    "type": "text",
    "content": "Step 2: Divide both sides by 2"
  },
  {
    "type": "formula",
    "content": "\\frac{2x}{2} = \\frac{8}{2}"
  },
  {
    "type": "formula",
    "content": "x = 4"
  },
  {
    "type": "separator"
  },
  {
    "type": "kc",
    "content": "Answer: x = 4"
  }
]
```

### Quadratic Equation Solution
**Use Case:** Solving quadratics with factoring

```json
[
  {
    "type": "text",
    "content": "Solve the quadratic equation:"
  },
  {
    "type": "formula",
    "content": "x^2 - 5x + 6 = 0"
  },
  {
    "type": "separator"
  },
  {
    "type": "text",
    "content": "Step 1: Factor the quadratic"
  },
  {
    "type": "text",
    "content": "Find two numbers that multiply to 6 and add to -5:"
  },
  {
    "type": "formula",
    "content": "-2 \\times -3 = 6"
  },
  {
    "type": "formula",
    "content": "-2 + (-3) = -5"
  },
  {
    "type": "text",
    "content": "Therefore:"
  },
  {
    "type": "formula",
    "content": "(x - 2)(x - 3) = 0"
  },
  {
    "type": "separator"
  },
  {
    "type": "text",
    "content": "Step 2: Solve each factor"
  },
  {
    "type": "formula",
    "content": "x - 2 = 0 \\quad \\text{or} \\quad x - 3 = 0"
  },
  {
    "type": "formula",
    "content": "x = 2 \\quad \\text{or} \\quad x = 3"
  },
  {
    "type": "separator"
  },
  {
    "type": "kc",
    "content": "Solutions: x = 2 or x = 3"
  }
]
```

### Multi-Part Problem
**Use Case:** Problems with multiple sub-questions

```json
[
  {
    "type": "h3",
    "content": "Problem: Analyzing a Quadratic Function"
  },
  {
    "type": "text",
    "content": "Given the function $f(x) = x^2 - 4x + 3$"
  },
  {
    "type": "separator"
  },
  {
    "type": "text",
    "content": "Part (a): Find the y-intercept"
  },
  {
    "type": "text",
    "content": "The y-intercept occurs when $x = 0$:"
  },
  {
    "type": "formula",
    "content": "f(0) = 0^2 - 4(0) + 3 = 3"
  },
  {
    "type": "kc",
    "content": "Y-intercept: (0, 3)"
  },
  {
    "type": "separator"
  },
  {
    "type": "text",
    "content": "Part (b): Find the x-intercepts"
  },
  {
    "type": "text",
    "content": "Set $f(x) = 0$ and solve:"
  },
  {
    "type": "formula",
    "content": "x^2 - 4x + 3 = 0"
  },
  {
    "type": "formula",
    "content": "(x - 1)(x - 3) = 0"
  },
  {
    "type": "formula",
    "content": "x = 1 \\text{ or } x = 3"
  },
  {
    "type": "kc",
    "content": "X-intercepts: (1, 0) and (3, 0)"
  },
  {
    "type": "separator"
  },
  {
    "type": "text",
    "content": "Part (c): Find the vertex"
  },
  {
    "type": "text",
    "content": "The x-coordinate of the vertex is:"
  },
  {
    "type": "formula",
    "content": "x = -\\frac{b}{2a} = -\\frac{-4}{2(1)} = 2"
  },
  {
    "type": "text",
    "content": "The y-coordinate is:"
  },
  {
    "type": "formula",
    "content": "f(2) = 2^2 - 4(2) + 3 = -1"
  },
  {
    "type": "kc",
    "content": "Vertex: (2, -1)"
  }
]
```

---

## Lesson Content Patterns

### Concept Introduction
**Use Case:** Introducing a new mathematical concept

```json
[
  {
    "type": "h2",
    "content": "The Pythagorean Theorem"
  },
  {
    "type": "def",
    "content": "In a right triangle, the square of the hypotenuse (the side opposite the right angle) equals the sum of squares of the other two sides."
  },
  {
    "type": "formula",
    "content": "a^2 + b^2 = c^2"
  },
  {
    "type": "text",
    "content": "Where:"
  },
  {
    "type": "list",
    "style": "bullet",
    "items": [
      "$a$ and $b$ are the lengths of the legs",
      "$c$ is the length of the hypotenuse",
      "The angle between sides $a$ and $b$ is 90°"
    ]
  },
  {
    "type": "separator"
  },
  {
    "type": "example",
    "content": "If a = 3 and b = 4, then $c = \\sqrt{3^2 + 4^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5$"
  }
]
```

### Worked Example
**Use Case:** Detailed example showing method application

```json
[
  {
    "type": "h3",
    "content": "Example: Finding the Derivative Using the Power Rule"
  },
  {
    "type": "text",
    "content": "Find the derivative of $f(x) = 3x^4 + 2x^2 - 5x + 7$"
  },
  {
    "type": "separator"
  },
  {
    "type": "text",
    "content": "Solution:"
  },
  {
    "type": "text",
    "content": "Apply the power rule to each term: if $f(x) = x^n$, then $f'(x) = nx^{n-1}$"
  },
  {
    "type": "formula",
    "content": "f'(x) = \\frac{d}{dx}(3x^4) + \\frac{d}{dx}(2x^2) - \\frac{d}{dx}(5x) + \\frac{d}{dx}(7)"
  },
  {
    "type": "text",
    "content": "Calculate each derivative:"
  },
  {
    "type": "list",
    "style": "bullet",
    "items": [
      "$\\frac{d}{dx}(3x^4) = 3 \\cdot 4x^3 = 12x^3$",
      "$\\frac{d}{dx}(2x^2) = 2 \\cdot 2x^1 = 4x$",
      "$\\frac{d}{dx}(5x) = 5 \\cdot 1 = 5$",
      "$\\frac{d}{dx}(7) = 0$ (constant rule)"
    ]
  },
  {
    "type": "text",
    "content": "Combine the results:"
  },
  {
    "type": "formula",
    "content": "f'(x) = 12x^3 + 4x - 5"
  },
  {
    "type": "kc",
    "content": "The derivative is $f'(x) = 12x^3 + 4x - 5$"
  }
]
```

### Definition with Examples
**Use Case:** Defining a concept with multiple examples

```json
[
  {
    "type": "h3",
    "content": "Types of Numbers"
  },
  {
    "type": "def",
    "content": "Natural Numbers: The counting numbers starting from 1"
  },
  {
    "type": "example",
    "content": "Natural numbers: 1, 2, 3, 4, 5, ..."
  },
  {
    "type": "separator"
  },
  {
    "type": "def",
    "content": "Whole Numbers: Natural numbers including zero"
  },
  {
    "type": "example",
    "content": "Whole numbers: 0, 1, 2, 3, 4, 5, ..."
  },
  {
    "type": "separator"
  },
  {
    "type": "def",
    "content": "Integers: Whole numbers and their negatives"
  },
  {
    "type": "example",
    "content": "Integers: ..., -3, -2, -1, 0, 1, 2, 3, ..."
  },
  {
    "type": "separator"
  },
  {
    "type": "def",
    "content": "Rational Numbers: Numbers that can be expressed as a fraction"
  },
  {
    "type": "example",
    "content": "Rational numbers: $\\frac{1}{2}$, $\\frac{3}{4}$, $0.75$, $-2.5$"
  }
]
```

---

## Review Content Patterns

### Quick Formula Reference
**Use Case:** Summary of important formulas

```json
[
  {
    "type": "h3",
    "content": "Quick Reference: Quadratic Formulas"
  },
  {
    "type": "text",
    "content": "Key formulas for quadratic equations:"
  },
  {
    "type": "list",
    "style": "numbered",
    "items": [
      "Standard form: $ax^2 + bx + c = 0$",
      "Quadratic formula: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$",
      "Discriminant: $D = b^2 - 4ac$",
      "Vertex form: $y = a(x - h)^2 + k$",
      "Vertex coordinates: $(h, k)$ or $\\left(-\\frac{b}{2a}, f\\left(-\\frac{b}{2a}\\right)\\right)$"
    ]
  },
  {
    "type": "note",
    "content": "The discriminant determines the number of real solutions: D > 0 (two), D = 0 (one), D < 0 (none)"
  }
]
```

### Practice Problem Set
**Use Case:** Set of problems with answers

```json
[
  {
    "type": "h3",
    "content": "Practice: Solving Linear Equations"
  },
  {
    "type": "text",
    "content": "Solve each equation for x:"
  },
  {
    "type": "list",
    "style": "numbered",
    "items": [
      "$3x + 7 = 22$",
      "$5x - 3 = 2x + 9$",
      "$\\frac{x}{2} + 4 = 10$",
      "$2(x - 3) = 4x + 2$"
    ]
  },
  {
    "type": "separator"
  },
  {
    "type": "text",
    "content": "Check your answers:"
  },
  {
    "type": "list",
    "style": "numbered",
    "items": [
      "$x = 5$",
      "$x = 4$",
      "$x = 12$",
      "$x = -4$"
    ]
  },
  {
    "type": "note",
    "content": "Remember to check your solutions by substituting back into the original equation"
  }
]
```

### Concept Summary
**Use Case:** Brief review of a topic

```json
[
  {
    "type": "h3",
    "content": "Summary: Properties of Exponents"
  },
  {
    "type": "text",
    "content": "Remember these key properties:"
  },
  {
    "type": "table",
    "headers": ["Property", "Rule", "Example"],
    "rows": [
      ["Product Rule", "$a^m \\cdot a^n = a^{m+n}$", "$x^2 \\cdot x^3 = x^5$"],
      ["Quotient Rule", "$\\frac{a^m}{a^n} = a^{m-n}$", "$\\frac{x^5}{x^2} = x^3$"],
      ["Power Rule", "$(a^m)^n = a^{mn}$", "$(x^2)^3 = x^6$"],
      ["Zero Exponent", "$a^0 = 1$ (if $a \\neq 0$)", "$5^0 = 1$"],
      ["Negative Exponent", "$a^{-n} = \\frac{1}{a^n}$", "$x^{-2} = \\frac{1}{x^2}$"]
    ]
  },
  {
    "type": "warning",
    "content": "Common mistake: $(x + y)^2 \\neq x^2 + y^2$. The correct expansion is $(x + y)^2 = x^2 + 2xy + y^2$"
  }
]
```

---

## Special Content Patterns

### Theorem with Proof
**Use Case:** Mathematical theorem with formal proof

```json
[
  {
    "type": "h3",
    "content": "Theorem: Sum of Angles in a Triangle"
  },
  {
    "type": "def",
    "content": "The sum of the interior angles of any triangle equals 180°"
  },
  {
    "type": "separator"
  },
  {
    "type": "text",
    "content": "Proof:"
  },
  {
    "type": "text",
    "content": "Consider triangle ABC. Draw a line through vertex C parallel to side AB."
  },
  {
    "type": "list",
    "style": "numbered",
    "items": [
      "Let the angles of the triangle be $\\alpha$, $\\beta$, and $\\gamma$",
      "The parallel line creates alternate interior angles equal to $\\alpha$ and $\\beta$",
      "The three angles at vertex C form a straight line: $\\alpha + \\gamma + \\beta = 180°$",
      "Therefore, the sum of the triangle's angles is 180°"
    ]
  },
  {
    "type": "kc",
    "content": "Q.E.D. The sum of angles in any triangle is 180°"
  }
]
```

### Algorithm Description
**Use Case:** Step-by-step algorithm or procedure

```json
[
  {
    "type": "h3",
    "content": "Algorithm: Finding the GCD (Euclidean Algorithm)"
  },
  {
    "type": "text",
    "content": "To find the greatest common divisor of two numbers:"
  },
  {
    "type": "list",
    "style": "numbered",
    "items": [
      "Let $a$ be the larger number and $b$ be the smaller",
      "Divide $a$ by $b$ and find the remainder $r$",
      "If $r = 0$, then $b$ is the GCD",
      "If $r \\neq 0$, replace $a$ with $b$ and $b$ with $r$",
      "Repeat from step 2"
    ]
  },
  {
    "type": "separator"
  },
  {
    "type": "example",
    "content": "Find GCD(48, 18): 48 ÷ 18 = 2 remainder 12, 18 ÷ 12 = 1 remainder 6, 12 ÷ 6 = 2 remainder 0. GCD = 6"
  }
]
```

---

## Container-Specific Patterns

### ProblemSolver Pattern
**Best for:** Step-by-step solutions

```json
[
  {"type": "text", "content": "Problem statement"},
  {"type": "formula", "content": "Given equation"},
  {"type": "separator"},
  {"type": "text", "content": "Step 1: Description"},
  {"type": "formula", "content": "Work shown"},
  {"type": "separator"},
  {"type": "text", "content": "Step 2: Description"},
  {"type": "formula", "content": "Work shown"},
  {"type": "separator"},
  {"type": "kc", "content": "Final answer"}
]
```

### LessonDescription Pattern
**Best for:** Educational content

```json
[
  {"type": "h2", "content": "Topic Title"},
  {"type": "def", "content": "Key definition"},
  {"type": "text", "content": "Explanation"},
  {"type": "formula", "content": "Important equation"},
  {"type": "example", "content": "Concrete example"},
  {"type": "note", "content": "Additional insight"}
]
```

### PreviewBox Pattern
**Best for:** Quick reference

```json
[
  {"type": "h3", "content": "Formula Name"},
  {"type": "formula", "content": "Main formula"},
  {"type": "text", "content": "Brief description"},
  {"type": "example", "content": "Quick example"}
]
```

### ReviewBox Pattern
**Best for:** Summary and practice

```json
[
  {"type": "h3", "content": "Review Topic"},
  {"type": "list", "style": "bullet", "items": ["Key point 1", "Key point 2"]},
  {"type": "separator"},
  {"type": "text", "content": "Practice problems:"},
  {"type": "list", "style": "numbered", "items": ["Problem 1", "Problem 2"]},
  {"type": "note", "content": "Helpful tip"}
]
```

---

## Best Practices

### Content Structure
1. **Start with context** - Tell what will be covered
2. **Use separators** - Break up logical sections
3. **Highlight key results** - Use `kc` for answers
4. **Provide examples** - Concrete cases help understanding
5. **End with summary** - Reinforce main points

### Math Formatting
1. **Inline math** - Use single `$` for flow within text
2. **Display math** - Use formula type for important equations
3. **Align multi-step** - Use `\\begin{align}` for alignment
4. **Text in math** - Use `\\text{}` for words in formulas
5. **Escape properly** - Double backslashes in JSON

### Visual Hierarchy
1. **Headers** - Use h2 for main topics, h3 for subtopics
2. **Lists** - Numbered for sequences, bullets for items
3. **Special formats** - def for definitions, kc for key content
4. **Spacing** - Separators between major sections
5. **Emphasis** - Bold/italic in HTML content sparingly

### Common Pitfalls to Avoid
1. **Too much text** - Break up with formulas and examples
2. **No visual breaks** - Use separators and spacing
3. **Missing context** - Always explain what and why
4. **No answer highlight** - Always use kc for final answers
5. **Inconsistent formatting** - Maintain style throughout

---

## Testing Your Patterns

Before using a pattern:
1. Test in all container types
2. Check all viewport sizes
3. Verify math renders correctly
4. Ensure readability
5. Validate JSON structure

Remember: These patterns are starting points. Adapt them to your specific content needs while maintaining the structure that works well in TestConstructor.
