# SERENA TOOLS - CORRECT USAGE BASED ON VERIFIED TESTING

## 🚨 CRITICAL: READ THIS BEFORE EVERY TOOL USE 🚨

**IF YOU DO NOT FOLLOW THESE EXACT RULES, YOU WILL BREAK THE CODE**

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

## THE VERIFICATION PROTOCOL YOU MUST FOLLOW

```
1. BEFORE using any tool:
   - Write the file (if new)
   - READ IT BACK to verify it exists and is correct
   - NEVER assume a file was created correctly

2. BEFORE replace_symbol_body:
   - Run find_symbol with include_body=true
   - LOOK at what the body shows
   - Identify: Regular function? Arrow no JSX? Arrow with JSX?
   - Apply the EXACT rule for that type

3. AFTER using any tool:
   - READ THE FILE IMMEDIATELY
   - Verify the change worked correctly
   - If broken, fix with replace_regex, not file rewrite

4. NEVER skip verification steps
   - Every write needs a read
   - Every change needs verification
   - Assumptions = broken code
```

## WHY YOU KEEP FAILING

1. You don't read files after writing them
2. You don't verify tool results
3. You assume instead of checking
4. You panic when things break instead of fixing surgically
5. You ignore the actual body shown by find_symbol
6. You treat all functions the same when they're different

## YOUR COMMITMENT

Before EVERY tool use, you WILL:
1. State which type of symbol you're dealing with
2. State the exact rule you're following
3. Show where your replacement will end
4. Verify the file state before and after
5. Never skip steps because you're "confident"

CONFIDENCE WITHOUT VERIFICATION = BROKEN CODE

## REMEMBER

- JSX components are SPECIAL - the tool preserves their closures
- Regular arrows and functions need their closing braces
- ALWAYS verify, NEVER assume
- One verification skip = cascading failures