# Content Creation Automation Procedures

**Purpose:** This memory documents the automated workflows for creating educational content files in the TestConstructor project. Use these procedures when creating sections, problems, or other content to automatically populate parent references and follow correct file organization.

**Project:** testconstructor001
**Related Memories:** serena_tools_complete_guide.md

---

## Overview

When you receive instructions like "Create C02-L03-S01 through S04", this memory tells you how to:
1. Parse the notation to understand what to create
2. Use Serena tools to look up parent IDs from existing overview files
3. Generate new IDs correctly
4. Create files in the correct locations with complete parent references

**CRITICAL:** Always use Serena semantic tools FIRST (find_symbol, get_symbols_overview, search_for_pattern) before falling back to filesystem tools.

---

## Notation Parsing

### Standard Content Notation

**Pattern:** `C[chapter#]-L[lesson#]-S[section#]` or `C[chapter#]-L[lesson#]-P[problem#]`

**Examples:**
- `C02-L03-S01` = Chapter 2, Lesson 3, Section 1
- `C01-L01-S01 through S04` = Chapter 1, Lesson 1, Sections 1-4
- `C02-L03-P01 through P20` = Chapter 2, Lesson 3, Problems 1-20

**Parsing Logic:**
```
"C02-L03-S01"
├── C02 → chapterNumber = 2
├── L03 → lessonNumber = 3
└── S01 → sectionNumber = 1
```

---

## Parent Reference Lookup Using Serena

### Project Root
`C:\Code\testconstructor001\`

### Course Content Base Path
`C:\Code\testconstructor001\course_content\Algebra\`

### For Creating Sections

**Input:** "Create C02-L03-S01"
**Need:** courseId, chapterId, lessonId (+ names)

**Step 1: Get Course Information**
```javascript
// Use serena:find_symbol to extract course ID
const courseIdResult = await serena.find_symbol({
  name_path: "_id",
  relative_path: "C:\\Code\\testconstructor001\\course_content\\Algebra\\Algebra I_Overview.json"
});
// Extract: courseId = "COID-qnwzyh2dnx"

// Get course name
const courseNameResult = await serena.find_symbol({
  name_path: "courseName",
  relative_path: "C:\\Code\\testconstructor001\\course_content\\Algebra\\Algebra I_Overview.json"
});
// Extract: courseName = "Algebra I"
```

**Step 2: Get Chapter Information**
```javascript
// For Chapter 2 (C02)
const chapterIdResult = await serena.find_symbol({
  name_path: "_id",
  relative_path: "C:\\Code\\testconstructor001\\course_content\\Algebra\\Chapter 2\\Ch02_Overview.json"
});
// Extract: chapterId = "CHID-hjcahzma9w"

const chapterNameResult = await serena.find_symbol({
  name_path: "chapterName",
  relative_path: "C:\\Code\\testconstructor001\\course_content\\Algebra\\Chapter 2\\Ch02_Overview.json"
});
// Extract: chapterName = "Foundations of Algebra"

const chapterNumberResult = await serena.find_symbol({
  name_path: "chapterNumber",
  relative_path: "C:\\Code\\testconstructor001\\course_content\\Algebra\\Chapter 2\\Ch02_Overview.json"
});
// Extract: chapterNumber = 2
```

**Step 3: Get Lesson Information**
```javascript
// For Lesson 3 (L03)
const lessonIdResult = await serena.find_symbol({
  name_path: "_id",
  relative_path: "C:\\Code\\testconstructor001\\course_content\\Algebra\\Chapter 2\\Lesson 3\\Ch02L03_Overview.json"
});
// Extract: lessonId = "LEID-7s5d6rkdqp"

const lessonNameResult = await serena.find_symbol({
  name_path: "lessonName",
  relative_path: "C:\\Code\\testconstructor001\\course_content\\Algebra\\Chapter 2\\Lesson 3\\Ch02L03_Overview.json"
});
// Extract: lessonName = "Variables and Expressions"

const lessonNumberResult = await serena.find_symbol({
  name_path: "lessonNumber",
  relative_path: "C:\\Code\\testconstructor001\\course_content\\Algebra\\Chapter 2\\Lesson 3\\Ch02L03_Overview.json"
});
// Extract: lessonNumber = 3
```

**Step 4: Generate New Section ID**
```javascript
// Use the random ID generation algorithm (10 random characters)
function generateRandomId(prefix) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let suffix = "";
  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * 36);
    suffix += chars[randomIndex];
  }
  return `${prefix}-${suffix}`;
}

const newSectionId = generateRandomId("SEID");
// Example: "SEID-6fg9lx4sbz"
```

**Step 5: Create Section .md File**

File location: `C:\Code\testconstructor001\course_content\Algebra\Chapter 2\Lesson 3\Sections\[filename].md`

Parent references block (at top of file):
```markdown
**Parent References:**
- Course: Algebra I (COID-qnwzyh2dnx)
- Chapter: Foundations of Algebra (CHID-hjcahzma9w)
- Lesson: Variables and Expressions (LEID-7s5d6rkdqp)
- Section: [Section Name] (SEID-6fg9lx4sbz)
```

### For Creating Problems

**Input:** "Create problems for C02-L03-S01"
**Need:** courseId, chapterId, lessonId, sectionId (+ names)

Follow same steps 1-3 as sections, then:

**Step 4: Get Section Information**
```javascript
// Find the section .md file first
const sectionFiles = await serena.find_file({
  file_mask: "*.md",
  relative_path: "C:\\Code\\testconstructor001\\course_content\\Algebra\\Chapter 2\\Lesson 3\\Sections"
});

// Read section file to extract sectionId from parent references
// Use serena:search_for_pattern to find the Section line in parent references
const sectionIdPattern = await serena.search_for_pattern({
  substring_pattern: "- Section:.*\\(SEID-",
  relative_path: "C:\\Code\\testconstructor001\\course_content\\Algebra\\Chapter 2\\Lesson 3\\Sections\\[sectionfile].md"
});
// Extract: sectionId = "SEID-6fg9lx4sbz"
// Extract: sectionName from same line
```

**Step 5: Generate New Problem IDs**
```javascript
// Generate as many as needed
const problemIds = [];
for (let i = 0; i < numberOfProblems; i++) {
  problemIds.push(generateRandomId("PRID"));
}
// Example: ["PRID-kjj8i0yoyb", "PRID-wtbf1cwzr9", ...]
```

**Step 6: Create Problem .md Files**

File location: `C:\Code\testconstructor001\course_content\Algebra\Chapter 2\Lesson 3\Problems\PRID-[id].md`

Parent references block:
```markdown
**Parent References:**
- Course: Algebra I (COID-qnwzyh2dnx)
- Chapter: Foundations of Algebra (CHID-hjcahzma9w)
- Lesson: Variables and Expressions (LEID-7s5d6rkdqp)
- Section: [Section Name] (SEID-6fg9lx4sbz)
```

---

## File Path Conventions

### Directory Structure
```
course_content/
└── Algebra/
    ├── Algebra I_Overview.json                    ← Course overview
    ├── Chapter 1/
    │   ├── Ch01_Overview.json                     ← Chapter overview
    │   └── Lesson 1/
    │       ├── Ch01L01_Overview.json              ← Lesson overview
    │       ├── Sections/
    │       │   ├── [sectionname].md               ← Section .md files
    │       │   └── [sectionname].json             ← Section .json files (after conversion)
    │       └── Problems/
    │           ├── PRID-[id].md                   ← Problem .md files
    │           └── PRID-[id].json                 ← Problem .json files (after conversion)
    └── Chapter 2/
        └── [same structure]
```

### File Naming Patterns

**Overview files:**
- Course: `[CourseName]_Overview.json`
- Chapter: `Ch[NN]_Overview.json` (NN = zero-padded chapter number)
- Lesson: `Ch[NN]L[MM]_Overview.json` (MM = zero-padded lesson number)

**Content files:**
- Section .md: Descriptive name, typically `ALG-C[NN]-L[MM]-S[PP].md`
- Problem .md: `PRID-[10randomchars].md`

**Zero-padding:** Use 2 digits (01, 02, ..., 10, 11)

---

## Batch Operations

### Creating Multiple Sections

**Input:** "Create C02-L03-S01 through S04"

**Procedure:**
1. Parse notation once to get chapter/lesson numbers
2. Look up parent references once (course, chapter, lesson)
3. Generate 4 new section IDs
4. Create 4 section .md files, each with:
   - Same parent references (course, chapter, lesson)
   - Unique sectionId
   - Incrementing sectionNumber (1, 2, 3, 4)

### Creating Multiple Problems

**Input:** "Create problems 1-20 for C02-L03-S01"

**Procedure:**
1. Parse notation to get chapter/lesson/section
2. Look up parent references (course, chapter, lesson, section)
3. Generate 20 new problem IDs
4. Create 20 problem .md files, each with:
   - Same parent references
   - Unique problemId (PRID)
   - Incrementing problemNumber (1-20)

---

## ID Generation Algorithm

### The Random Character Generation

**Format:** `[PREFIX]-[10-RANDOM-CHARS]`

**Character set:** `abcdefghijklmnopqrstuvwxyz0123456789` (36 characters)

**Implementation:**
```javascript
function generateRandomSuffixes(count) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const suffixes = [];
  
  for (let s = 0; s < count; s++) {
    let suffix = "";
    for (let i = 0; i < 10; i++) {
      const randomIndex = Math.floor(Math.random() * 36);
      suffix += chars[randomIndex];
    }
    suffixes.push(suffix);
  }
  
  return suffixes;
}

// Usage
const sectionIds = generateRandomSuffixes(4).map(s => `SEID-${s}`);
// Example output: ["SEID-qnwzyh2dnx", "SEID-hjcahzma9w", "SEID-7s5d6rkdqp", "SEID-6fg9lx4sbz"]
```

### Prefixes by Entity Type
- Course: `COID-`
- Chapter: `CHID-`
- Lesson: `LEID-`
- Section: `SEID-`
- Tool: `TOID-`
- Problem: `PRID-`

**CRITICAL:** IDs are permanent once created. Never regenerate an ID for existing content.

---

## Directory Setup

### Creating New Directories

When creating content for a new lesson/chapter, ensure directories exist:

```javascript
// Check if Sections directory exists, create if not
const sectionsPath = "C:\\Code\\testconstructor001\\course_content\\Algebra\\Chapter 2\\Lesson 3\\Sections";
// Use serena:create_directory or filesystem:create_directory if needed

// Same for Problems directory
const problemsPath = "C:\\Code\\testconstructor001\\course_content\\Algebra\\Chapter 2\\Lesson 3\\Problems";
```

**Standard directories per lesson:**
- `Sections/` - Contains all section .md and .json files
- `Problems/` - Contains all problem .md and .json files

---

## Workflow Summary

### Creating Sections
1. Parse notation (C02-L03-S01)
2. Use Serena to look up course/chapter/lesson IDs from overview files
3. Generate new section ID(s)
4. Create .md file(s) in `Sections/` directory with complete parent references
5. Follow Section_Style_Guide_v8.md for content structure

### Creating Problems
1. Parse notation (C02-L03-S01 or just C02-L03)
2. Use Serena to look up course/chapter/lesson/section IDs
3. Generate new problem ID(s)
4. Create .md file(s) in `Problems/` directory with complete parent references
5. Follow Problem_Style_Guide_v1.md for content structure

### Converting to JSON
1. Read .md file
2. Follow Section_JSON_Conversion_Guide_v3.md or Problems_JSON_Conversion_Guide_v2.md
3. Create .json file in same directory as .md file
4. Extract parent references from .md file's parent references block

---

## Error Handling

### If Overview File Not Found
- **Error:** "Cannot find Ch02_Overview.json"
- **Solution:** That chapter doesn't exist yet. Create chapter overview first, or verify chapter number is correct.

### If Parent References Are Missing
- **Error:** "Cannot extract sectionId from section file"
- **Solution:** The section .md file may not have parent references block at top. This is required.

### If Directory Doesn't Exist
- **Error:** "Sections directory not found"
- **Solution:** Create the directory structure first using serena:create_directory

---

## Key Principles

1. **Always use Serena semantic tools first** - Don't read entire files with filesystem tools
2. **Single source of truth** - Overview files contain authoritative IDs
3. **IDs are permanent** - Never regenerate IDs for existing content
4. **Parent references are complete** - Every content file lists full ancestry
5. **File locations are standard** - Follow the directory structure conventions
6. **Batch operations are efficient** - Look up parent references once, create multiple files

---

## Related Documentation

- **Content Style:** Section_Style_Guide_v8.md, Problem_Style_Guide_v1.md
- **Conversion:** Section_JSON_Conversion_Guide_v3.md, Problems_JSON_Conversion_Guide_v2.md
- **Tool Usage:** serena_tools_complete_guide.md (in this project's memories)

---

**Last Updated:** 2025-10-03
**Project:** testconstructor001 (contentlab project)
