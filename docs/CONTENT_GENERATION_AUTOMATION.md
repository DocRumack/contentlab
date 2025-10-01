# Content Generation Automation Plan

## Overview
This document outlines the automated content generation pipeline for creating course content at scale using Claude Code, converting raw educational materials into structured MD files and then into TestConstructor-ready JSON format.

---

## The Vision

Instead of manually processing content one section at a time, Claude Code can:
1. **Traverse** an entire directory structure of raw content
2. **Generate** structured MD files for each section/lesson/chapter
3. **Convert** all MD files to JSON format
4. **Validate** the output in ContentLab
5. **Report** on what was generated and any issues

**Potential Output**: Generate an entire course worth of content in one evening

---

## Pipeline Architecture

### Stage 1: Raw Content → Markdown
**Input**: Text files, notes, problem sets, resources
**Process**: Apply course guidelines to structure content
**Output**: Formatted MD files with consistent structure

### Stage 2: Markdown → JSON  
**Input**: Structured MD files
**Process**: Apply conversion rules to create content arrays
**Output**: TestConstructor-compatible JSON files

### Stage 3: Validation
**Input**: Generated JSON files
**Process**: Load in ContentLab, validate, capture screenshots
**Output**: Validation report with any issues

---

## Directory Structure

```
c:\code\content-generation\
│
├── guides\                          # Rules and templates
│   ├── course_overview.md          # Course structure and goals
│   ├── md_generation_rules.md      # How to create MD from raw content
│   ├── md_to_json_rules.md        # Conversion rules MD→JSON
│   ├── section_template.md        # Template for section content
│   ├── problem_template.md        # Template for problems
│   └── quality_checklist.md       # What makes good content
│
├── examples\                        # Reference examples
│   ├── section_algebra.md         # Example section MD
│   ├── section_algebra.json       # Corresponding JSON
│   ├── problem_quadratic.md       # Example problem MD
│   └── problem_quadratic.json     # Corresponding JSON
│
├── raw-content\                     # Input materials
│   ├── algebra\
│   │   ├── chapter1-linear\
│   │   │   ├── overview.txt       # Chapter overview notes
│   │   │   ├── section1-intro.txt # Section content
│   │   │   ├── section2-solving.txt
│   │   │   ├── problems.txt       # Problem bank
│   │   │   └── resources.txt      # Additional resources
│   │   ├── chapter2-quadratic\
│   │   └── chapter3-systems\
│   │
│   ├── geometry\
│   └── calculus\
│
├── output\                          # Generated content
│   ├── md\
│   │   ├── algebra\
│   │   │   ├── chapter1-linear\
│   │   │   │   ├── overview.md
│   │   │   │   ├── section1-intro.md
│   │   │   │   └── section2-solving.md
│   │   │   └── chapter2-quadratic\
│   │   └── geometry\
│   │
│   ├── json\
│   │   └── [same structure as md]\
│   │
│   └── reports\
│       ├── generation_log.txt
│       ├── validation_report.html
│       └── screenshots\
│
└── scripts\                         # Automation scripts
    ├── generate_md.js              # Raw → MD conversion
    ├── convert_to_json.js          # MD → JSON conversion
    ├── validate_content.js         # ContentLab validation
    ├── pipeline.js                 # Full pipeline orchestration
    └── utils.js                    # Helper functions
```

---

## Claude Code Automation Scripts

### 1. Main Pipeline Orchestrator
```javascript
// pipeline.js
async function generateCourse(courseDir) {
  console.log(`Starting course generation for ${courseDir}`);
  
  const stats = {
    chapters: 0,
    sections: 0,
    problems: 0,
    errors: []
  };
  
  // Phase 1: Generate MD files
  const chapters = await scanChapters(courseDir);
  
  for (const chapter of chapters) {
    console.log(`Processing chapter: ${chapter.name}`);
    stats.chapters++;
    
    const sections = await scanSections(chapter.path);
    
    for (const section of sections) {
      try {
        // Generate MD for this section
        const md = await generateSectionMD(section);
        await saveMD(md, section.outputPath);
        stats.sections++;
        
        // Convert to JSON immediately
        const json = await convertMDtoJSON(md);
        await saveJSON(json, section.jsonPath);
        
        // Validate in ContentLab
        const validation = await validateInContentLab(json);
        if (!validation.valid) {
          stats.errors.push({
            section: section.name,
            errors: validation.errors
          });
        }
      } catch (error) {
        stats.errors.push({
          section: section.name,
          error: error.message
        });
      }
    }
  }
  
  // Generate report
  await generateReport(stats);
  
  return stats;
}
```

### 2. MD Generation from Raw Content
```javascript
// generate_md.js
async function generateSectionMD(section) {
  // Load guides and templates
  const guides = await loadGuides();
  const template = await loadTemplate('section');
  
  // Load raw content
  const rawContent = await loadRawContent(section.rawPath);
  
  // Load course context
  const courseOverview = await loadCourseOverview();
  const chapterContext = await loadChapterContext(section.chapter);
  
  // Generate MD using Claude's capabilities
  const md = await processWithRules({
    raw: rawContent,
    template: template,
    guides: guides,
    context: {
      course: courseOverview,
      chapter: chapterContext,
      section: section.metadata
    }
  });
  
  return md;
}

async function processWithRules(input) {
  // This is where Claude Code applies intelligence
  // to convert raw content into structured MD
  
  const { raw, template, guides, context } = input;
  
  // Parse raw content
  const parsed = parseRawContent(raw);
  
  // Apply section template
  let md = template;
  
  // Fill in the template sections
  md = md.replace('{{TITLE}}', context.section.title);
  md = md.replace('{{OVERVIEW}}', generateOverview(parsed, context));
  md = md.replace('{{CONCEPTS}}', generateConcepts(parsed, guides));
  md = md.replace('{{EXAMPLES}}', generateExamples(parsed, guides));
  md = md.replace('{{PRACTICE}}', generatePractice(parsed, guides));
  
  return md;
}
```

### 3. MD to JSON Conversion
```javascript
// convert_to_json.js
async function convertMDtoJSON(mdContent) {
  // Load conversion rules
  const rules = await loadConversionRules();
  
  // Parse MD structure
  const parsed = parseMD(mdContent);
  
  // Convert to TestConstructor format
  const contentArray = [];
  
  for (const block of parsed.blocks) {
    const jsonBlock = convertBlock(block, rules);
    if (jsonBlock) {
      contentArray.push(jsonBlock);
    }
  }
  
  return contentArray;
}

function convertBlock(block, rules) {
  // Apply conversion rules based on block type
  switch(block.type) {
    case 'heading':
      return {
        type: `h${block.level}`,
        content: block.content
      };
      
    case 'paragraph':
      // Check for math content
      if (block.content.includes('$')) {
        return {
          type: 'text',
          content: block.content
        };
      }
      return {
        type: 'text',
        content: block.content
      };
      
    case 'math':
      return {
        type: 'formula',
        content: block.content.replace(/\$/g, '')
      };
      
    case 'list':
      return {
        type: 'list',
        style: block.ordered ? 'numbered' : 'bullet',
        items: block.items
      };
      
    case 'codeblock':
      if (block.lang === 'problem') {
        return convertProblem(block.content);
      }
      break;
      
    case 'blockquote':
      if (block.content.startsWith('NOTE:')) {
        return {
          type: 'note',
          content: block.content.replace('NOTE:', '').trim()
        };
      }
      break;
  }
  
  return null;
}
```

### 4. ContentLab Validation
```javascript
// validate_content.js
async function validateInContentLab(jsonContent) {
  // Start ContentLab if not running
  await ensureContentLabRunning();
  
  // Load content
  await page.evaluate((content) => {
    window.ContentLabAPI.setContent(content);
  }, jsonContent);
  
  // Validate
  const validation = await page.evaluate(() => {
    return window.ContentLabAPI.validateContent();
  });
  
  if (validation.valid) {
    // Test in all containers
    const containers = ['ProblemSolver', 'LessonDescription', 'ReviewBox'];
    
    for (const container of containers) {
      await page.evaluate((c) => {
        window.ContentLabAPI.setContainer(c);
      }, container);
      
      await page.waitForTimeout(200);
      
      // Capture screenshot
      await page.screenshot({
        path: `output/reports/screenshots/${container}-${Date.now()}.png`
      });
    }
  }
  
  return validation;
}
```

---

## Content Generation Rules

### Section MD Structure
```markdown
# Section Title

## Overview
Brief introduction to what this section covers.

## Learning Objectives
- Objective 1
- Objective 2

## Concepts

### Concept 1 Name
Explanation of concept with inline math $x = y$.

### Concept 2 Name
Another concept explanation.

## Examples

### Example 1: Title
**Problem**: State the problem

**Solution**:
Step 1: Explanation
$$math expression$$

Step 2: Explanation  
$$math expression$$

**Answer**: Final answer

## Practice Problems

1. Problem statement 1
2. Problem statement 2

## Key Takeaways
- Important point 1
- Important point 2
```

### Conversion Rules Summary
1. `#` → `h1`, `##` → `h2`, etc.
2. Regular paragraphs → `type: "text"`
3. `$$...$$` → `type: "formula"`
4. Lists → `type: "list"` with style
5. `> NOTE:` → `type: "note"`
6. `> WARNING:` → `type: "warning"`
7. `**Answer**:` → `type: "kc"`
8. `---` → `type: "separator"`

---

## Claude Code Execution Flow

### For Single Section
```javascript
// Interactive mode for single section
async function generateSingleSection() {
  const sectionPath = await promptForPath();
  const rawContent = await loadRawContent(sectionPath);
  
  console.log('Generating MD from raw content...');
  const md = await generateSectionMD({
    rawPath: sectionPath,
    metadata: extractMetadata(sectionPath)
  });
  
  console.log('Converting to JSON...');
  const json = await convertMDtoJSON(md);
  
  console.log('Validating in ContentLab...');
  const validation = await validateInContentLab(json);
  
  if (validation.valid) {
    await saveFiles(md, json, sectionPath);
    console.log('✅ Section generated successfully!');
  } else {
    console.log('❌ Validation errors:', validation.errors);
  }
}
```

### For Full Course
```javascript
// Batch mode for entire course
async function generateFullCourse() {
  const coursePath = 'raw-content/algebra';
  const stats = await generateCourse(coursePath);
  
  console.log(`
    Generation Complete!
    ===================
    Chapters: ${stats.chapters}
    Sections: ${stats.sections}  
    Problems: ${stats.problems}
    Errors: ${stats.errors.length}
  `);
  
  if (stats.errors.length > 0) {
    console.log('\nErrors encountered:');
    stats.errors.forEach(err => {
      console.log(`- ${err.section}: ${err.error}`);
    });
  }
}
```

---

## Benefits of This Approach

### 1. **Massive Scale**
- Process entire courses in hours instead of weeks
- Generate hundreds of sections in one run
- Consistent quality across all content

### 2. **Consistency**
- Every section follows the same structure
- Conversion rules applied uniformly
- No manual formatting errors

### 3. **Validation**
- Automatic testing in ContentLab
- Visual verification via screenshots
- Error reporting for issues

### 4. **Iterative Improvement**
- Easy to refine rules and regenerate
- Can target specific problem areas
- Version control for all generated content

### 5. **Claude Code Advantages**
- Can understand context across multiple files
- Applies pedagogical rules consistently
- Maintains narrative flow between sections
- Handles complex mathematical notation

---

## Implementation Steps

### Phase 1: Setup (Day 1)
1. Create directory structure
2. Write generation rules and templates
3. Create example MD and JSON pairs
4. Set up basic automation scripts

### Phase 2: Test (Day 2)
1. Test with single section
2. Verify MD generation quality
3. Test JSON conversion accuracy
4. Validate in ContentLab

### Phase 3: Scale (Day 3)
1. Process full chapter
2. Review and refine rules
3. Process multiple chapters
4. Generate validation reports

### Phase 4: Production (Day 4+)
1. Process entire courses
2. Review generated content
3. Fix any systematic issues
4. Deploy to TestConstructor

---

## Example Guides for Claude Code

### `guides/md_generation_rules.md`
```markdown
# MD Generation Rules

## Structure Rules
1. Every section starts with overview
2. Include 2-3 learning objectives
3. Explain concepts before examples
4. Provide 3-5 practice problems
5. End with key takeaways

## Math Formatting
- Inline math: $expression$
- Display math: $$expression$$
- Always use LaTeX notation
- Escape special characters

## Tone and Style
- Clear and concise explanations
- Build from simple to complex
- Use encouraging language
- Provide step-by-step solutions
```

### `guides/json_conversion_rules.md`
```markdown
# JSON Conversion Rules

## Block Mappings
| Markdown | JSON Type | Notes |
|----------|-----------|-------|
| # Title | h1 | Section titles |
| ## Subtitle | h2 | Major sections |
| Paragraph | text | Regular content |
| $$...$$ | formula | Display math |
| - Item | list (bullet) | Unordered lists |
| 1. Item | list (numbered) | Ordered lists |
| > NOTE: | note | Special callout |
| **Answer**: | kc | Key content |
| --- | separator | Section break |

## Special Cases
- Step-by-step solutions use separators
- Problems end with kc type for answer
- Examples use h3 for titles
```

---

## Success Metrics

### Quality Indicators
- ✅ All content validates in ContentLab
- ✅ Consistent structure across sections
- ✅ Math renders correctly
- ✅ No overflow in containers
- ✅ Progressive difficulty maintained

### Performance Targets
- Generate 10 sections per minute
- Process full chapter in 30 minutes
- Complete course in 3-4 hours
- <5% error rate

---

## Potential Challenges and Solutions

### Challenge: Context Loss
**Solution**: Load chapter and course overview for each section

### Challenge: Math Formatting Errors
**Solution**: Validate LaTeX before JSON conversion

### Challenge: Inconsistent Quality
**Solution**: Use templates and strict rules

### Challenge: Memory/Performance
**Solution**: Process in batches, clear cache regularly

### Challenge: Raw Content Variety
**Solution**: Multiple parsers for different formats

---

## Next Steps

1. **Create the directory structure** as outlined
2. **Write the guide documents** with your specific rules
3. **Provide example content** (both raw and processed)
4. **Set up ContentLab** for automated validation
5. **Run test generation** on small subset
6. **Refine and scale** based on results

With this system, you could literally seed Claude Code with a semester's worth of raw content and wake up to a fully generated, validated course ready for TestConstructor!
