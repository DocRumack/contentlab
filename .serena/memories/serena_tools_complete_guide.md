# SERENA TOOLS - CORRECT USAGE BASED ON VERIFIED TESTING

## 🚨 CRITICAL: READ THIS BEFORE EVERY TOOL USE 🚨

**IF YOU DO NOT FOLLOW THESE EXACT RULES, YOU WILL BREAK THE CODE**

## MANDATORY CODING STANDARD: FILE HEADERS

**EVERY file MUST start with a header comment containing at minimum the filename.**

```javascript
// filename.js
import React from 'react';
// ... rest of code
```

This ensures:
- No active code on line 0
- Files are self-identifying
- serena:read_file is less error-prone (imports start at line 1+)
- Context is preserved if file contents are copied elsewhere

When creating new files, ALWAYS add this header first.

## replace_symbol_body - THE ACTUAL RULES (TESTED & VERIFIED)

### STEP 1: ALWAYS run find_symbol with include_body=true FIRST
Look at what the body shows. The tool may preserve MORE than what find_symbol shows.

### STEP 2: Determine your symbol type and follow the EXACT rule:

#### Regular Functions (function keyword):
```javascript
// find_symbol shows: function name() { ... }
// YOU MUST INCLUDE: The closing }
// YOU MUST NOT INCLUDE: Any semicolon

// ✅ CORRECT:
function myFunction(params) {
  // your new code
  return result;
}  // <- YES include this brace

// ❌ WRONG: Missing the closing brace
function myFunction(params) {
  return result
```

#### Arrow Functions WITHOUT JSX:
```javascript  
// find_symbol shows: name = () => { ... };
// YOU MUST INCLUDE: The closing }
// YOU MUST NOT INCLUDE: The semicolon

// ✅ CORRECT:
calculate = (a, b) => {
  // your new code
  return result;
}  // <- YES include brace, NO semicolon

// ❌ WRONG: Including semicolon
calculate = (a, b) => {
  return result;
};  // <- This will create double semicolon!
```

#### Arrow Functions WITH JSX (React Components):
```javascript
// find_symbol shows: Component = () => { return (<div>...</div>
// The tool PRESERVES the ); and }; that aren't shown!
// YOU MUST NOT INCLUDE: The ); or }

// ✅ CORRECT:
TestComponent = ({ props }) => {
  return (
    <div>
      Your content
    </div>  // <- STOP HERE! No ); or }

// ❌ WRONG: Including closures
TestComponent = ({ props }) => {
  return (
    <div>content</div>
  );
}  // <- This will create DUPLICATE closures!
```

### STEP 3: VERIFY AFTER EVERY USE
1. Read the file immediately after using replace_symbol_body
2. Check for duplicate closures or missing closures
3. If broken, use replace_regex to fix ONLY the error

## insert_before_symbol & insert_after_symbol

These work as expected:
- insert_before_symbol: Inserts content BEFORE the symbol definition
- insert_after_symbol: Inserts content AFTER the symbol ends
- Include proper newlines in your content for spacing

## replace_regex

- Default behavior: Fails if multiple matches found
- Use allow_multiple_occurrences=true for intentional multiple replacements
- ALWAYS escape special regex characters: ( ) [ ] { } . * + ? ^ $ \ |
- Test your regex pattern mentally before running

## serena:read_file - CRITICAL LINE NUMBERING RULES

### 🚨 LINE NUMBERING IS 0-INDEXED - THIS IS NOT NEGOTIABLE

**The first line of any file is line 0, not line 1.**

#### Examples:
```python
# If a file contains:
# Line 0: // MyFile.js
# Line 1: import React from 'react';
# Line 2: import { useState } from 'react';
# Line 3: 
# Line 4: function MyComponent() {

# To read the header and imports (lines 0-2):
start_line: 0  # <- Includes first line (header comment)
end_line: 2    # <- Includes third line

# ❌ WRONG - This skips the header comment:
start_line: 1  # <- Starts from SECOND line
end_line: 3
```

### ALWAYS READ FROM LINE 0 WHEN CHECKING FILE BEGINNING

**When checking imports, headers, or the start of any file:**
- Use `start_line: 0` 
- NEVER use `start_line: 1` unless you intentionally want to skip the header

### VERIFICATION AFTER READ

After EVERY serena:read_file, verify you got what you expected:
1. Check the line count matches (end_line - start_line + 1)
2. Verify the first line shown is what you expected
3. If the header comment or imports are missing, you started from line 1 instead of 0

### WHEN TO USE FILESYSTEM VS SERENA

**Use serena:read_file when:**
- Reading code sections
- Checking specific line ranges
- You know the approximate location

**Use filesystem:read_file when:**
- Serena read fails after proper debugging
- You need to verify the exact disk state
- You've tried serena read from line 0 and results are still unexpected

**Use filesystem:write_file when:**
- User explicitly approves file writes
- Creating entirely new files
- Rewriting a file is genuinely the correct solution (rare)

**DO NOT use filesystem:write_file when:**
- Serena read didn't work because you used wrong line numbers
- You're avoiding debugging why serena tools failed
- A surgical fix with replace_regex would work instead
- You haven't tried serena tools properly yet

The distinction: filesystem:write_file has legitimate uses, but using it to avoid learning serena tools properly is wrong.

### TESTING EDGE CASES

If uncertain about line behavior, test with a dummy file:
1. Create a 5-line test file
2. Read with start_line: 0, end_line: 0 (should show 1 line)
3. Read with start_line: 0, end_line: 4 (should show all 5 lines)
4. Read with start_line: 1, end_line: 4 (should show last 4 lines)

This confirms the 0-indexing behavior before using on real files.

## THE VERIFICATION PROTOCOL YOU MUST FOLLOW

```
1. BEFORE creating any file:
   - Add header comment with filename as line 0
   - Then add imports/code starting at line 1+
   
2. BEFORE using any tool:
   - Write the file (if new)
   - READ IT BACK to verify it exists and is correct
   - NEVER assume a file was created correctly

3. BEFORE replace_symbol_body:
   - Run find_symbol with include_body=true
   - LOOK at what the body shows
   - Identify: Regular function? Arrow no JSX? Arrow with JSX?
   - Apply the EXACT rule for that type

4. AFTER using any tool:
   - READ THE FILE IMMEDIATELY
   - Verify the change worked correctly
   - If broken, fix with replace_regex, not file rewrite

5. WHEN USING serena:read_file:
   - Always use start_line: 0 for file beginning
   - Verify line count matches expectations
   - Check first line is what you expected (should be header comment)
   - Don't skip to filesystem without debugging serena first

6. NEVER skip verification steps
   - Every write needs a read
   - Every change needs verification
   - Every read needs line count verification
   - Assumptions = broken code
```

## WHY YOU KEEP FAILING

1. You don't read files after writing them
2. You don't verify tool results
3. You assume instead of checking
4. You panic when things break instead of fixing surgically
5. You ignore the actual body shown by find_symbol
6. You treat all functions the same when they're different
7. **You start serena:read_file from line 1 instead of line 0**
8. **You use filesystem:write_file to avoid debugging serena failures**
9. **You don't verify which lines were actually returned**
10. **You forget to add header comments to new files**

## YOUR COMMITMENT

Before EVERY tool use, you WILL:
1. State which type of symbol you're dealing with
2. State the exact rule you're following
3. Show where your replacement will end
4. Verify the file state before and after
5. Never skip steps because you're "confident"
6. **Use start_line: 0 when reading file beginnings**
7. **Verify returned lines match expectations**
8. **Debug serena issues before considering filesystem tools**
9. **Add header comments to all new files**

CONFIDENCE WITHOUT VERIFICATION = BROKEN CODE

## REMEMBER

- **ALL files must start with header comment containing at least the filename**
- JSX components are SPECIAL - the tool preserves their closures
- Regular arrows and functions need their closing braces
- **serena:read_file is 0-INDEXED - line 0 is the first line**
- **Always read from start_line: 0 for file headers**
- **Verify what lines you actually got back**
- **filesystem:write_file has legitimate uses, but not as a serena workaround**
- ALWAYS verify, NEVER assume
- One verification skip = cascading failures