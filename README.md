# Content Creation Lab

A unified content creation interface designed for both human interaction and Claude Code automation.

## Features

- **Container Emulation**: Accurate reproduction of ProblemSolver, LessonDescription, PreviewBox, ReviewBox containers
- **Responsive Testing**: View all breakpoints simultaneously with overlay mode
- **Interactive Tools**: Direct manipulation of visual elements with drag handles
- **Live Preview**: Real-time content rendering as you type
- **Automation API**: Built for Claude Code batch processing
- **Pattern Library**: Save and reuse successful content patterns

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run headless mode for automation
npm run headless

# Run API server for Claude Code
npm run api
```

## Project Structure

```
contentlab/
├── src/
│   ├── components/     # React components
│   ├── api/            # Automation API
│   ├── lib/            # Utilities
│   └── styles/         # CSS files
├── automation/         # Claude Code scripts
└── public/            # Static assets
```

## Container Specifications

- **ProblemSolver**: Full width, transparent background, KaTeX rendering
- **LessonDescription**: Full width, gray background, tab system
- **PreviewBox**: Variable width, dark background, white text
- **ReviewBox**: 55% width overlay, light background

## Automation Support

This lab is designed to be controlled programmatically by Claude Code for batch processing of content.
