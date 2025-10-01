# Content Lab Tool Development Plan

## Overview
This document outlines the planned visual tools for Content Lab that will enhance content creation efficiency and accuracy. Each tool will have both a visual interface and programmatic API.

---

## Tool Priority Order

1. **Pattern Library Manager** - Foundation for all content reuse
2. **LaTeX Alignment Tool** - Most immediately useful for math content
3. **Bracket Equation Tool** - Common math formatting need  
4. **Graph Tool** - Essential for many math topics
5. **Number Line Tool** - Important for inequalities and ranges
6. **Table Builder** - General purpose utility
7. **Triangle Tool** - Geometry specific
8. **Fraction Tool** - Elementary math focus

---

## 1. Pattern Library Manager

### Purpose
Save, organize, and reuse successful content patterns across projects.

### User Interface
```
┌─────────────────────────────────────────┐
│ Pattern Library                         │
├─────────────────────────────────────────┤
│ [Search: _______________] [+ New]       │
├─────────────────────────────────────────┤
│ Categories:                             │
│ ☐ All (47)                             │
│ ☐ Algebra (12)                         │
│ ☐ Geometry (8)                         │
│ ☐ Calculus (15)                        │
│ ☐ Statistics (12)                      │
├─────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐        │
│ │ Quadratic   │ │ Linear Eq   │        │
│ │ Solution    │ │ Steps       │        │
│ │ ⭐⭐⭐⭐⭐  │ │ ⭐⭐⭐⭐☆  │        │
│ │ Used: 24x   │ │ Used: 18x   │        │
│ └─────────────┘ └─────────────┘        │
└─────────────────────────────────────────┘
```

### Features
- Save current content as pattern
- Categorize by subject/topic
- Tag patterns for search
- Rate patterns by usefulness
- Track usage statistics
- Quick preview on hover
- One-click insertion
- Pattern variations/templates
- Import/Export patterns
- Share patterns between projects

### Data Structure
```javascript
{
  "id": "uuid-here",
  "name": "Quadratic Solution Steps",
  "category": "algebra",
  "subcategory": "quadratic-equations",
  "tags": ["solving", "step-by-step", "factoring"],
  "content": [...],  // The actual content array
  "metadata": {
    "created": "2024-12-28T10:30:00Z",
    "modified": "2024-12-28T10:30:00Z",
    "author": "user",
    "usageCount": 24,
    "rating": 5,
    "container": "ProblemSolver",  // Preferred container
    "description": "Standard pattern for solving quadratic equations"
  },
  "thumbnail": "base64-image-data",  // Preview screenshot
  "variables": [  // For templates
    {
      "name": "equation",
      "default": "x^2 + 5x + 6 = 0",
      "type": "latex"
    }
  ]
}
```

### API
```javascript
// Pattern operations
ContentLabAPI.patterns = {
  save: (pattern) => string,  // Returns ID
  load: (id) => Pattern,
  search: (query) => Pattern[],
  getByCategory: (category) => Pattern[],
  getByTags: (tags) => Pattern[],
  delete: (id) => boolean,
  rate: (id, rating) => void,
  incrementUsage: (id) => void,
  export: (ids) => string,  // JSON export
  import: (json) => Pattern[]
};
```

### Storage
- Local Storage for browser persistence
- Export to JSON for backup
- Future: Cloud sync capability

---

## 2. LaTeX Alignment Tool

### Purpose
Create properly aligned multi-line equations with visual guides.

### User Interface
```
┌─────────────────────────────────────────┐
│ LaTeX Alignment Tool                    │
├─────────────────────────────────────────┤
│ Alignment Point: [&] at position: [=]   │
├─────────────────────────────────────────┤
│ 2x + 3 │&│ = 7          [+ Add Line]   │
│ 2x     │&│ = 4          [× Remove]     │
│ x      │&│ = 2          [× Remove]     │
├─────────────────────────────────────────┤
│ Preview:                                │
│   2x + 3 = 7                           │
│   2x     = 4                           │
│   x      = 2                           │
├─────────────────────────────────────────┤
│ [Copy LaTeX] [Insert to Content]        │
└─────────────────────────────────────────┘
```

### Features
- Visual alignment guides
- Automatic `&` insertion
- Multiple alignment points
- Drag to adjust alignment
- Common equation templates
- Preview with alignment visible
- Support for align, align*, alignat environments
- Smart detection of = signs
- Undo/redo support

### Templates
- Solving linear equations
- Factoring steps
- System of equations
- Derivative steps
- Integration steps
- Proof sequences

### API
```javascript
ContentLabAPI.latexAlign = {
  createAlignment: (equations: string[]) => string,
  autoAlign: (latex: string) => string,
  addAlignmentPoint: (latex: string, position: number) => string,
  removeAlignmentPoint: (latex: string, index: number) => string,
  suggestAlignment: (latex: string) => number[],  // Positions
  validateAlignment: (latex: string) => {valid: boolean, errors: string[]}
};
```

---

## 3. Bracket Equation Tool

### Purpose
Automatically manage brackets, parentheses, and braces in complex expressions.

### User Interface
```
┌─────────────────────────────────────────┐
│ Bracket Tool                            │
├─────────────────────────────────────────┤
│ Expression: [x + (2y - 3z) + 4]        │
├─────────────────────────────────────────┤
│ Bracket Levels:                         │
│ Level 1: ( )  Level 2: [ ]  Level 3: { }│
│                                         │
│ Visual:    x + (2y - 3z) + 4           │
│           └─┘ └───────┘ └─┘            │
│            1      2       1             │
├─────────────────────────────────────────┤
│ Options:                                │
│ ☑ Auto-size brackets (\left \right)    │
│ ☑ Balance brackets                     │
│ ☐ Matrix brackets                      │
├─────────────────────────────────────────┤
│ [Apply] [Preview] [Reset]               │
└─────────────────────────────────────────┘
```

### Features
- Automatic bracket sizing
- Nested bracket management
- Visual bracket level indicator
- Balance checker
- Matrix/vector brackets
- Set notation helpers
- Interval notation
- Ceiling/floor functions
- Automatic \left \right insertion
- Bracket style suggestions

### Bracket Types
- Parentheses: ( )
- Square brackets: [ ]
- Curly braces: { }
- Angle brackets: ⟨ ⟩
- Ceiling: ⌈ ⌉
- Floor: ⌊ ⌋
- Absolute value: | |
- Double bars: ‖ ‖

### API
```javascript
ContentLabAPI.brackets = {
  autoBracket: (expression: string) => string,
  balanceBrackets: (latex: string) => string,
  addBrackets: (content: string, type: BracketType) => string,
  removeBrackets: (latex: string, level: number) => string,
  suggestBrackets: (expression: string) => Suggestion[],
  validateBrackets: (latex: string) => {balanced: boolean, errors: string[]}
};
```

---

## 4. Graph Tool

### Purpose
Create coordinate planes with points, lines, curves, and shaded regions.

### User Interface
```
┌─────────────────────────────────────────┐
│ Graph Tool                              │
├─────────────────────────────────────────┤
│ ┌─────────────────────┐ Tools:         │
│ │     ↑               │ ○ Point        │
│ │     │               │ ○ Line         │
│ │     │               │ ○ Curve        │
│ │─────┼─────→        │ ○ Region       │
│ │     │               │ ○ Label        │
│ │     │               │                │
│ │     ↓               │ [Clear]        │
│ └─────────────────────┘                │
├─────────────────────────────────────────┤
│ Range: X[-10,10] Y[-10,10]             │
│ Grid: [1] units  Snap: [ON]            │
├─────────────────────────────────────────┤
│ Objects:                                │
│ • Point A at (2, 3)                    │
│ • Line: y = 2x + 1                     │
│ • Region: y > 2x + 1                   │
├─────────────────────────────────────────┤
│ [Export JSON] [Export Image]            │
└─────────────────────────────────────────┘
```

### Features
- Click to place points
- Click-drag for lines
- Function plotting from equations
- Inequality shading
- Grid with adjustable scale
- Snap-to-grid option
- Labels and annotations
- Multiple graphs overlay
- Zoom and pan
- Export as JSON or image

### Graph Elements
- Points with labels
- Lines (solid, dashed, dotted)
- Curves from functions
- Shaded regions
- Axes labels
- Grid lines
- Asymptotes
- Tangent lines

### Output Format
```javascript
{
  "type": "tool",
  "tool": "graph",
  "data": {
    "xRange": [-10, 10],
    "yRange": [-10, 10],
    "gridStep": 1,
    "showGrid": true,
    "elements": [
      {
        "type": "point",
        "x": 2,
        "y": 3,
        "label": "A",
        "color": "blue"
      },
      {
        "type": "line",
        "equation": "y = 2x + 1",
        "style": "solid",
        "color": "red"
      },
      {
        "type": "region",
        "inequality": "y > 2x + 1",
        "style": "shaded",
        "color": "rgba(0,0,255,0.2)"
      }
    ]
  }
}
```

### API
```javascript
ContentLabAPI.graph = {
  create: (config: GraphConfig) => GraphData,
  addPoint: (graph: GraphData, x: number, y: number, label?: string) => void,
  addLine: (graph: GraphData, equation: string) => void,
  addCurve: (graph: GraphData, func: Function) => void,
  addRegion: (graph: GraphData, inequality: string) => void,
  clear: (graph: GraphData) => void,
  export: (graph: GraphData) => string
};
```

---

## 5. Number Line Tool

### Purpose
Create number lines with points, intervals, and inequalities.

### User Interface
```
┌─────────────────────────────────────────┐
│ Number Line Tool                        │
├─────────────────────────────────────────┤
│   -5    -3    0     3     5            │
│ ──┼──────┼────┼─────●─────┼──→        │
│                     └─ x = 3           │
├─────────────────────────────────────────┤
│ Range: [-10] to [10]                   │
│ Step: [1]                              │
├─────────────────────────────────────────┤
│ Elements:                              │
│ • Point at 3 (closed)                  │
│ • Interval [-3, 5) (closed-open)       │
├─────────────────────────────────────────┤
│ Add: [Point] [Interval] [Inequality]   │
└─────────────────────────────────────────┘
```

### Features
- Click to add points
- Drag to create intervals
- Open/closed endpoints
- Multiple number lines
- Labels and values
- Inequality notation
- Union/intersection display
- Zoom and pan
- Tick mark customization

### Element Types
- Points (open/closed)
- Intervals (open/closed/mixed)
- Rays (extending to infinity)
- Compound inequalities
- Solution sets

### Output Format
```javascript
{
  "type": "tool",
  "tool": "numberLine",
  "data": {
    "min": -10,
    "max": 10,
    "step": 1,
    "showNumbers": true,
    "elements": [
      {
        "type": "point",
        "value": 3,
        "style": "closed",
        "label": "x"
      },
      {
        "type": "interval",
        "start": -3,
        "end": 5,
        "startStyle": "closed",
        "endStyle": "open",
        "color": "blue"
      }
    ]
  }
}
```

### API
```javascript
ContentLabAPI.numberLine = {
  create: (min: number, max: number) => NumberLineData,
  addPoint: (line: NumberLineData, value: number, style: PointStyle) => void,
  addInterval: (line: NumberLineData, start: number, end: number, style: IntervalStyle) => void,
  addInequality: (line: NumberLineData, inequality: string) => void,
  clear: (line: NumberLineData) => void,
  export: (line: NumberLineData) => string
};
```

---

## 6. Table Builder

### Purpose
Create formatted tables with math content support.

### User Interface
```
┌─────────────────────────────────────────┐
│ Table Builder                           │
├─────────────────────────────────────────┤
│ Rows: [3] Columns: [3]  [+ Row] [+ Col]│
├─────────────────────────────────────────┤
│ ┌───────┬───────┬───────┐              │
│ │   x   │  f(x) │ f'(x) │ ← Headers   │
│ ├───────┼───────┼───────┤              │
│ │   0   │   1   │   0   │              │
│ │   1   │   e   │   e   │              │
│ │   2   │  e²   │  2e²  │              │
│ └───────┴───────┴───────┘              │
├─────────────────────────────────────────┤
│ Options:                                │
│ ☑ First row as headers                 │
│ ☐ First column as headers              │
│ ☐ Show borders                         │
│ Caption: [________________]            │
└─────────────────────────────────────────┘
```

### Features
- Visual table editor
- Click to edit cells
- Math content in cells
- Row/column operations
- Cell merging
- Alignment options
- Border customization
- Import from CSV
- Export to JSON/LaTeX

### Cell Types
- Text
- Math (LaTeX)
- Numbers
- HTML

### Output Format
```javascript
{
  "type": "table",
  "headers": ["x", "f(x)", "f'(x)"],
  "rows": [
    ["0", "1", "0"],
    ["1", "e", "e"],
    ["2", "e^2", "2e^2"]
  ],
  "caption": "Function values and derivatives",
  "style": {
    "borders": true,
    "striped": false,
    "compact": false
  }
}
```

### API
```javascript
ContentLabAPI.table = {
  create: (rows: number, cols: number) => TableData,
  setCell: (table: TableData, row: number, col: number, content: string) => void,
  addRow: (table: TableData) => void,
  addColumn: (table: TableData) => void,
  deleteRow: (table: TableData, index: number) => void,
  deleteColumn: (table: TableData, index: number) => void,
  mergeCell |
  s: (table: TableData, startRow: number, startCol: number, endRow: number, endCol: number) => void,
  export: (table: TableData, format: 'json'|'latex'|'html') => string
};
```

---

## 7. Triangle Tool

### Purpose
Create geometric triangles with measurements and annotations.

### User Interface
```
┌─────────────────────────────────────────┐
│ Triangle Tool                           │
├─────────────────────────────────────────┤
│         C                               │
│        /|\                              │
│       / | \                             │
│      /  |  \  5 cm                     │
│   4 /   |3  \                          │
│    /    |    \                         │
│   /_____|_____\                        │
│  A      6      B                       │
├─────────────────────────────────────────┤
│ Vertices: Drag to adjust               │
│ A: (0,0)  B: (6,0)  C: (3,4)          │
├─────────────────────────────────────────┤
│ Display:                                │
│ ☑ Side lengths  ☑ Angles               │
│ ☑ Height       ☐ Area                  │
│ ☑ Right angle marker                   │
├─────────────────────────────────────────┤
│ Type: Right Triangle                   │
│ Perimeter: 12 cm                       │
│ Area: 12 cm²                           │
└─────────────────────────────────────────┘
```

### Features
- Drag vertices to adjust
- Automatic measurements
- Angle calculations
- Triangle type detection
- Special markers (right angle)
- Area and perimeter
- Similar triangle comparison
- Congruence checking
- Construction tools

### Triangle Types
- Equilateral
- Isosceles
- Scalene
- Right
- Acute
- Obtuse

### Output Format
```javascript
{
  "type": "tool",
  "tool": "triangle",
  "data": {
    "vertices": [
      {"x": 0, "y": 0, "label": "A"},
      {"x": 6, "y": 0, "label": "B"},
      {"x": 3, "y": 4, "label": "C"}
    ],
    "display": {
      "sides": true,
      "angles": true,
      "height": true,
      "area": false,
      "rightAngleMarker": true
    },
    "measurements": {
      "sides": [6, 5, 5],
      "angles": [53.13, 53.13, 73.74],
      "area": 12,
      "perimeter": 16,
      "type": "isosceles"
    }
  }
}
```

### API
```javascript
ContentLabAPI.triangle = {
  create: (v1: Point, v2: Point, v3: Point) => TriangleData,
  setVertex: (triangle: TriangleData, index: number, point: Point) => void,
  calculate: (triangle: TriangleData) => Measurements,
  getType: (triangle: TriangleData) => string,
  isCongruent: (t1: TriangleData, t2: TriangleData) => boolean,
  isSimilar: (t1: TriangleData, t2: TriangleData) => boolean,
  export: (triangle: TriangleData) => string
};
```

---

## 8. Fraction Tool

### Purpose
Visual fraction creation and manipulation for elementary math.

### User Interface
```
┌─────────────────────────────────────────┐
│ Fraction Tool                           │
├─────────────────────────────────────────┤
│     3     │  Visual:  ███░░            │
│    ───    │           3/5              │
│     5     │                            │
├─────────────────────────────────────────┤
│ Numerator: [3] [+] [-]                 │
│ Denominator: [5] [+] [-]               │
├─────────────────────────────────────────┤
│ Display as:                            │
│ ○ Fraction  ○ Mixed  ○ Decimal        │
│                                        │
│ Equivalent: 6/10, 9/15, 12/20         │
│ Decimal: 0.6                          │
│ Percentage: 60%                        │
├─────────────────────────────────────────┤
│ Operations:                            │
│ [Simplify] [Add] [Subtract] [Multiply] │
└─────────────────────────────────────────┘
```

### Features
- Visual representations (pie, bar)
- Drag to adjust values
- Mixed number conversion
- Simplification
- Equivalent fractions
- Decimal conversion
- Percentage display
- Operation visualization
- Common denominators

### Visual Modes
- Pie chart
- Bar model
- Number line
- Area model
- Set model

### Output Format
```javascript
{
  "type": "tool",
  "tool": "fraction",
  "data": {
    "numerator": 3,
    "denominator": 5,
    "display": "fraction",  // or "mixed", "decimal"
    "visual": "bar",  // or "pie", "numberLine", etc.
    "simplified": true,
    "equivalents": ["6/10", "9/15", "12/20"],
    "decimal": 0.6,
    "percentage": 60
  }
}
```

### API
```javascript
ContentLabAPI.fraction = {
  create: (numerator: number, denominator: number) => FractionData,
  simplify: (fraction: FractionData) => FractionData,
  toMixed: (fraction: FractionData) => MixedNumber,
  toDecimal: (fraction: FractionData) => number,
  add: (f1: FractionData, f2: FractionData) => FractionData,
  subtract: (f1: FractionData, f2: FractionData) => FractionData,
  multiply: (f1: FractionData, f2: FractionData) => FractionData,
  divide: (f1: FractionData, f2: FractionData) => FractionData,
  getEquivalents: (fraction: FractionData, count: number) => string[],
  export: (fraction: FractionData) => string
};
```

---

## Implementation Strategy

### Phase 1: Foundation (Week 1-2)
1. Create tool framework/interface
2. Implement Pattern Library Manager
3. Set up storage system
4. Create base tool component

### Phase 2: Math Tools (Week 3-4)
1. LaTeX Alignment Tool
2. Bracket Equation Tool
3. Integration with content editor

### Phase 3: Visual Tools (Week 5-6)
1. Graph Tool
2. Number Line Tool
3. Canvas/SVG rendering system

### Phase 4: Geometry & Tables (Week 7-8)
1. Triangle Tool
2. Table Builder
3. Export functionality

### Phase 5: Elementary Tools (Week 9)
1. Fraction Tool
2. Additional elementary math tools
3. Visual representations

### Phase 6: Polish & Integration (Week 10)
1. Keyboard shortcuts
2. Touch support
3. Performance optimization
4. Documentation

---

## Technical Considerations

### Architecture
```
ContentLab
├── Tools
│   ├── ToolManager.jsx
│   ├── PatternLibrary/
│   ├── LaTeXAlign/
│   ├── BracketTool/
│   ├── GraphTool/
│   ├── NumberLine/
│   ├── TableBuilder/
│   ├── TriangleTool/
│   └── FractionTool/
├── ToolAPI
│   └── toolAPI.js
└── Storage
    └── patternStorage.js
```

### State Management
- Tool state in React context
- Undo/redo with command pattern
- Local storage for persistence

### Performance
- Lazy load tools
- Virtual rendering for large datasets
- Debounce updates
- Web workers for calculations

### Accessibility
- Keyboard navigation
- Screen reader support
- High contrast mode
- Alternative text for visuals

### Testing
- Unit tests for each tool
- Integration tests
- Visual regression tests
- Performance benchmarks

---

## Success Metrics

Each tool should:
- ✅ Generate valid TestConstructor content
- ✅ Work in all containers
- ✅ Support undo/redo
- ✅ Handle edge cases gracefully
- ✅ Provide API access
- ✅ Include keyboard shortcuts
- ✅ Work on touch devices
- ✅ Meet performance targets
- ✅ Pass accessibility audit
- ✅ Have comprehensive tests

---

## Future Enhancements

### Advanced Tools
- Formula builder with templates
- Geometry construction kit
- Statistics visualizations
- Calculus graphing
- 3D geometry viewer
- Animation timeline
- Interactive simulations

### AI Integration
- Content suggestions
- Auto-formatting
- Error detection
- Pattern recognition
- Solution checking

### Collaboration
- Real-time sharing
- Comments and annotations
- Version history
- Team libraries
- Review workflow

### Export Options
- PDF generation
- PowerPoint slides
- HTML packages
- LaTeX documents
- Markdown files
