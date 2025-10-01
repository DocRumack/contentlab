# Serena Usage Guide

## For Claude: START HERE
When working on TestConstructor001 or ContentLab, ALWAYS use semantic tools first:
1. `find_symbol "ComponentName"` - Find any component/function/class
2. `get_symbols_overview "path/to/file.jsx"` - See file structure
3. `find_referencing_symbols` - Track dependencies
4. `search_for_pattern "regex"` - Find patterns
5. Only use `read_file` as last resort

## For Human: Optimal Prompting
Instead of: "Look at ProblemManager and fix the bug"
Use: "Find how ProblemManager handles state updates"

Trigger phrases that help:
- "Find where..." → triggers symbol search
- "Show dependencies of..." → triggers reference search  
- "What components use..." → triggers pattern search
- "serena-first" → reminds Claude to use semantic tools

## Quick Reference
Both projects are INDEXED - semantic tools are FAST:
- TestConstructor001: 183 files indexed
- ContentLab: 33 files indexed

## Common Tasks
**Finding a component:**
```
find_symbol "ComponentName"
```

**Understanding file structure:**
```
get_symbols_overview "src/components/File.jsx"
```

**Finding all usages:**
```
find_referencing_symbols "FunctionName" "src/file.jsx"
```

**Pattern matching:**
```
search_for_pattern "handle[A-Z]\w+"
```

## Performance Tips
- Indexes rebuilt: Run `uvx --from git+https://github.com/oraios/serena serena project index` after major changes
- Mode matters: Currently in "editing" mode for symbol operations
- Token savings: ~20-30x fewer tokens vs file reading

## Red Flags (Don't Do)
- Starting with read_file
- Reading entire components unnecessarily
- Ignoring symbol relationships
- Using text search instead of semantic search