# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm install` - Install dependencies
- `npm run dev` - Run development server on default Vite port
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build

### Testing
- `npm run test-ast` - Run AST pipeline tests for problem processing

### API & Automation
- `npm run api` - Start API server on port 3003 for automation endpoints
- `npm run headless` - Run headless Puppeteer server for automated content processing

## Architecture

### Core Systems

#### AST Pipeline (`src/ast-pipeline/`)
Mathematical content processing system that handles LaTeX parsing and alignment:
- `core/mathParser.js` - LaTeX to AST conversion
- `core/alignmentEngine.js` - Multi-line equation alignment
- `core/templateLibrary.js` - Reusable math templates
- `processors/problemProcessor.js` - Problem-specific processing

#### Content System (`src/components/ContentSystem/`)
Unified rendering system for all content types:
- `ContentAdapter.js` - Converts raw content to structured format
- `ContentRenderer.jsx` - Main rendering component
- `KaTeXDisplay.jsx` - Math rendering with KaTeX
- `TableRenderer.jsx` - Table formatting

#### Container Emulation (`src/components/Containers/`)
Reproduces exact container specifications:
- `ContainerEmulator.jsx` - Main container component
- `containerMeasurements.js` - Container specifications (ProblemSolver, LessonDescription, PreviewBox, ReviewBox)

#### API Layer (`src/api/`)
Automation and beautification system:
- `beautification-engine.js` - Core beautification logic for math content
- `ContentLabAPI.js` - Browser-exposed API for automation
- `batch-processor.js` - Batch content processing
- `beauty-rules.js` - Beautification rules and configurations

### Frontend Structure
- React 18 with Vite bundler
- TailwindCSS for styling
- KaTeX for math rendering
- Puppeteer for automation

### Content Flow
1. Raw content (LaTeX/Markdown) → AST Pipeline → Structured JSON
2. Structured JSON → Content Adapter → Unified format
3. Unified format → Content Renderer → Visual output
4. Visual output → Container Emulator → Final display

## Key Conventions

- All math content uses KaTeX for rendering
- Container types: `problemSolver`, `lessonDescription`, `previewBox`, `reviewBox`
- API endpoints expect JSON with `content` and `options` fields
- Beautification focuses on alignment, spacing, and visual consistency