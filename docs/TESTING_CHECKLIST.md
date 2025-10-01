# Content Lab Testing Checklist

## Overview
This comprehensive testing checklist ensures all Content Lab features work correctly and content renders properly across all containers and viewports.

## How to Use This Checklist
1. Work through each section systematically
2. Check off items as you test them
3. Document any issues found
4. Create test files for automated regression testing
5. Report results in the test log at the bottom

---

## 1. Content Type Rendering Tests

### Basic Text Content
- [ ] Plain text rendering
- [ ] Text with special characters (&, <, >, ", ')
- [ ] Very long text (full paragraph)
- [ ] Empty text content
- [ ] Unicode characters (emojis, symbols)
- [ ] Text with inline math using $...$

### Math Content
- [ ] Pure formula (no delimiters)
- [ ] Inline math with single $ delimiters
- [ ] Display math with double $$ delimiters
- [ ] Display math with \[ \] delimiters
- [ ] Display math with \( \) delimiters
- [ ] Mixed text and inline math
- [ ] Complex nested math (fractions within fractions)
- [ ] Matrices using \begin{matrix}
- [ ] Aligned equations using \begin{align}
- [ ] Math with \text{} for embedded text
- [ ] Special symbols (Greek letters, operators)
- [ ] Math with color using \color{}

### HTML Content
- [ ] Basic HTML tags (`<p>`, `<span>`, `<div>`)
- [ ] HTML with inline styles
- [ ] HTML with embedded math
- [ ] HTML lists (`<ul>`, `<ol>`)
- [ ] HTML tables
- [ ] HTML links (`<a href>`)
- [ ] Bold and italic tags
- [ ] Malformed HTML handling
- [ ] Script tags (should be sanitized)

### Headings
- [ ] h1 heading rendering and sizing
- [ ] h2 heading rendering and sizing
- [ ] h3 heading rendering and sizing
- [ ] h4 heading rendering and sizing
- [ ] Heading with inline math
- [ ] Empty heading
- [ ] Very long heading text

### Lists
- [ ] Bullet list with multiple items
- [ ] Numbered list with multiple items
- [ ] List with indent level 0
- [ ] List with indent level 1
- [ ] List with indent level 2
- [ ] Mixed indent levels
- [ ] List items containing math
- [ ] List items containing HTML
- [ ] Empty list items
- [ ] Single item list
- [ ] Very long list items

### Special Formats
- [ ] `kc` (key content) - yellow background
- [ ] `def` (definition) - blue styling
- [ ] `note` - green box
- [ ] `warning` - red/orange box
- [ ] `example` - purple box
- [ ] Each format with math content
- [ ] Each format with long content
- [ ] Each format with HTML content
- [ ] Empty special format content

### Separators
- [ ] Basic separator line
- [ ] Multiple consecutive separators
- [ ] Separator at beginning of content
- [ ] Separator at end of content
- [ ] Separator between different content types

### Tool Buttons
- [ ] Single tool button renders
- [ ] Multiple tool buttons in sequence
- [ ] Tool button with custom label
- [ ] Tool button without label
- [ ] Tool button with action property
- [ ] Tool button styling and hover states

### Tables
- [ ] Basic 2x2 table
- [ ] Table with headers
- [ ] Table without headers
- [ ] Table with math content in cells
- [ ] Table with HTML content in cells
- [ ] Table with merged cells (if supported)
- [ ] Large table (10x10)
- [ ] Table with empty cells
- [ ] Table with caption
- [ ] Table responsive behavior

---

## 2. Container-Specific Tests

### ProblemSolver Container (800x600)
- [ ] Correct dimensions on desktop
- [ ] Step-by-step solution displays properly
- [ ] Font size is 16px base
- [ ] Padding and margins correct
- [ ] Background color correct
- [ ] Math scaling appropriate
- [ ] Overflow handling with scroll
- [ ] Border and shadow styling

### LessonDescription Container (900x700)
- [ ] Correct dimensions on desktop
- [ ] Mixed content types display well
- [ ] Section headers clearly visible
- [ ] Lists properly indented
- [ ] Examples highlighted appropriately
- [ ] Definitions styled correctly
- [ ] Vertical scrolling when needed
- [ ] No horizontal overflow

### PreviewBox Container (600x400)
- [ ] Correct dimensions on desktop
- [ ] White text on dark background
- [ ] Sufficient contrast for readability
- [ ] Math formulas clearly visible
- [ ] Border styling correct
- [ ] Content properly centered
- [ ] Padding appropriate
- [ ] Overflow handled gracefully

### ReviewBox Container (700x500)
- [ ] Correct dimensions on desktop
- [ ] Summary content displays clearly
- [ ] Bullet points well formatted
- [ ] Key concepts highlighted
- [ ] Scrollbar appears when needed
- [ ] Practice problems formatted correctly
- [ ] Compact layout maintained
- [ ] Headers scaled appropriately

### ToolsContainer (800x600)
- [ ] Correct dimensions on desktop
- [ ] Tool-specific content renders
- [ ] Interactive elements visible
- [ ] Custom styling applied correctly
- [ ] Responsive to different tool types
- [ ] Background appropriate for tools
- [ ] Padding allows for interaction
- [ ] Border and styling consistent

---

## 3. Viewport Responsive Tests

### Desktop (1920x1080)
- [ ] All containers fit without scroll
- [ ] Font size is 16px base
- [ ] Math scaling appropriate
- [ ] No unexpected line breaks
- [ ] Content spacing comfortable
- [ ] All elements visible

### Laptop (1366x768)
- [ ] Containers scale down properly
- [ ] Font size adjusted to 14px base
- [ ] Math remains readable
- [ ] Layout structure maintained
- [ ] No horizontal overflow
- [ ] Appropriate padding adjustments

### Tablet (768x1024)
- [ ] Portrait orientation correct
- [ ] Touch-friendly sizing
- [ ] Content reflows for narrow width
- [ ] Math equations fit width
- [ ] Font size is 14px base
- [ ] Scrolling works smoothly

### Phone (375x667)
- [ ] Mobile layout active
- [ ] Font size is 12px base
- [ ] Content stacks vertically
- [ ] Math scales to fit width
- [ ] No horizontal scrolling needed
- [ ] Touch targets appropriately sized

### Overlay Mode
- [ ] All viewports visible simultaneously
- [ ] Content synchronized across viewports
- [ ] Performance remains acceptable
- [ ] Toggle works smoothly
- [ ] Transparency levels appropriate
- [ ] Alignment is pixel-perfect

### Grid View
- [ ] 2x2 grid layout displays correctly
- [ ] All viewports equal size
- [ ] Labels visible and correct
- [ ] Responsive to window resize
- [ ] No overlap between viewports
- [ ] Performance with all viewports

---

## 4. Interactive Features Tests

### Editor Panel
- [ ] JSON syntax highlighting works
- [ ] Live preview updates immediately
- [ ] Error messages display clearly
- [ ] JSON validation catches errors
- [ ] Copy/paste functionality works
- [ ] Large content doesn't freeze editor
- [ ] Sample content loads correctly
- [ ] Clear button works

### Preview Controls
- [ ] Container switcher changes view
- [ ] Container labels are clear
- [ ] Viewport switcher works
- [ ] Viewport labels are clear
- [ ] Overlay toggle functions
- [ ] Grid view toggle works
- [ ] Active states clearly visible
- [ ] Keyboard shortcuts (if any)

### Tools Panel
- [ ] Tool selection interface works
- [ ] Tool options display correctly
- [ ] Settings persist during session
- [ ] Reset functionality works
- [ ] Panel can be collapsed/expanded
- [ ] Visual feedback on selection
- [ ] Help text displays
- [ ] Future tools placeholder

---

## 5. Edge Cases and Error Handling

### Invalid Input
- [ ] Invalid JSON shows clear error
- [ ] Error specifies the problem
- [ ] Missing required fields handled
- [ ] Malformed math shows error
- [ ] Circular references caught
- [ ] Type mismatches handled
- [ ] Recovery is possible
- [ ] No crashes on bad input

### Extreme Content
- [ ] 1000+ content items render
- [ ] Very long single item (10000 chars)
- [ ] Deeply nested structures (10+ levels)
- [ ] 100+ math equations on page
- [ ] Large tables (100x100 cells)
- [ ] Performance degrades gracefully
- [ ] Browser doesn't crash
- [ ] Scrolling remains smooth

### Special Characters
- [ ] Math with $, %, &, # symbols
- [ ] Text with quotes and apostrophes
- [ ] Unicode in all content types
- [ ] RTL text support
- [ ] Escaped characters in JSON
- [ ] HTML entities handled
- [ ] Emoji rendering
- [ ] Special math symbols

### Empty/Null Cases
- [ ] Empty content array []
- [ ] Null content handled
- [ ] Undefined fields ignored
- [ ] Empty strings in content
- [ ] Whitespace-only content
- [ ] Missing optional fields
- [ ] Zero-length arrays
- [ ] Null in arrays handled

---

## 6. Performance Tests

### Rendering Speed
- [ ] Initial render < 100ms
- [ ] Re-render on change < 50ms
- [ ] Container switch < 100ms
- [ ] Viewport switch < 100ms
- [ ] Large content < 500ms
- [ ] Math rendering < 200ms
- [ ] No visible lag on typing
- [ ] Smooth transitions

### Memory Usage
- [ ] No memory leaks detected
- [ ] Memory freed on unmount
- [ ] Efficient re-renders only
- [ ] DOM node count reasonable
- [ ] Event listeners cleaned up
- [ ] No accumulating state
- [ ] Cache cleared appropriately
- [ ] Performance stable over time

### Responsiveness
- [ ] UI remains responsive during render
- [ ] Scrolling stays at 60fps
- [ ] Animations smooth
- [ ] No blocking operations
- [ ] Input remains responsive
- [ ] No frozen UI states
- [ ] Async operations handled
- [ ] Progress indicators where needed

---

## 7. API/Automation Tests

### ContentLabAPI Methods
- [ ] `setContent(content)` works
- [ ] `getContent()` returns correct data
- [ ] `setContainer(type)` switches properly
- [ ] `getContainer()` returns current
- [ ] `setViewport(viewport)` changes view
- [ ] `getViewport()` returns current
- [ ] `captureScreenshot()` generates blob
- [ ] `measureContent()` returns dimensions
- [ ] `loadSampleContent(name)` loads
- [ ] `exportContent()` formats properly
- [ ] `validateContent()` catches errors
- [ ] `renderContent()` triggers update
- [ ] `clearContent()` empties display
- [ ] `toggleOverlay()` switches mode
- [ ] `toggleGrid()` changes layout

### Error Handling
- [ ] API handles invalid input gracefully
- [ ] Meaningful error messages returned
- [ ] No crashes on bad API calls
- [ ] Recovery from errors possible
- [ ] Promises reject appropriately
- [ ] Timeouts handled
- [ ] Network errors caught
- [ ] State remains consistent

---

## 8. Browser Compatibility

### Chrome (Latest)
- [ ] All features work correctly
- [ ] Performance is optimal
- [ ] No console errors
- [ ] DevTools integration works
- [ ] Screenshots work

### Firefox (Latest)
- [ ] All features work correctly
- [ ] Math renders identically
- [ ] Layout consistent with Chrome
- [ ] No Firefox-specific issues
- [ ] Performance acceptable

### Safari (Latest)
- [ ] All features work correctly
- [ ] iOS Safari compatible
- [ ] Touch events work properly
- [ ] No webkit-specific issues
- [ ] Performance acceptable

### Edge (Latest)
- [ ] All features work correctly
- [ ] No legacy IE issues
- [ ] Performance comparable
- [ ] No Edge-specific bugs
- [ ] DevTools work

---

## 9. Accessibility Tests

### Keyboard Navigation
- [ ] Tab order is logical
- [ ] All controls keyboard accessible
- [ ] Focus indicators visible
- [ ] Escape key handled
- [ ] Enter key works on buttons
- [ ] Arrow keys in lists
- [ ] No keyboard traps
- [ ] Skip links available

### Screen Reader
- [ ] Semantic HTML used throughout
- [ ] ARIA labels present
- [ ] Math has alternative text
- [ ] Headings properly structured
- [ ] Lists announced correctly
- [ ] Buttons have labels
- [ ] Form inputs labeled
- [ ] Status messages announced

### Color Contrast
- [ ] Text meets WCAG AA standards
- [ ] Buttons have sufficient contrast
- [ ] Error messages visible
- [ ] Dark mode contrast good
- [ ] Focus indicators visible
- [ ] Links distinguishable
- [ ] Math symbols clear
- [ ] Special formats readable

---

## 10. Integration Tests

### With TestConstructor
- [ ] Content format matches exactly
- [ ] Rendering is identical
- [ ] Container dimensions same
- [ ] Font configurations match
- [ ] Math rendering identical
- [ ] Special formats same
- [ ] Colors match
- [ ] Spacing matches

### With Claude Code
- [ ] API globally accessible
- [ ] Automation scripts work
- [ ] Screenshots capture correctly
- [ ] Iteration workflow functions
- [ ] No timing issues
- [ ] State updates properly
- [ ] Error handling works
- [ ] Performance acceptable

---

## Test Log

### Test Session Information
```
Date: _______________
Tester: _____________
Version: ____________
Browser: ___________
OS: ________________
```

### Issues Found

#### Issue #1
- **Category**: 
- **Description**: 
- **Steps to Reproduce**: 
- **Expected Result**: 
- **Actual Result**: 
- **Severity**: Critical / High / Medium / Low
- **Status**: Open / Fixed / Won't Fix

#### Issue #2
- **Category**: 
- **Description**: 
- **Steps to Reproduce**: 
- **Expected Result**: 
- **Actual Result**: 
- **Severity**: Critical / High / Medium / Low
- **Status**: Open / Fixed / Won't Fix

### Summary
- **Total Tests**: _____ 
- **Passed**: _____
- **Failed**: _____
- **Skipped**: _____
- **Pass Rate**: _____%

### Notes
_Additional observations, recommendations, or concerns:_

---

## Automated Test Setup

To create automated tests, create these test files:

### `/public/test-content/basic-tests.json`
```json
{
  "text-simple": [{"type": "text", "content": "Simple text"}],
  "text-math": [{"type": "text", "content": "Equation: $x^2 + y^2 = z^2$"}],
  "formula": [{"type": "formula", "content": "\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}"}]
}
```

### `/public/test-content/edge-cases.json`
```json
{
  "empty": [],
  "null-content": [{"type": "text", "content": null}],
  "special-chars": [{"type": "text", "content": "Test & < > \" ' symbols"}]
}
```

### `/public/test-content/performance.json`
Create content with 100+ items for performance testing.

---

## Success Criteria

Testing is considered complete when:
- ✅ All critical tests pass
- ✅ No blocking issues remain
- ✅ Performance meets targets
- ✅ Accessibility standards met
- ✅ Browser compatibility verified
- ✅ API fully functional
- ✅ Documentation complete
