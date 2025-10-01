# AST Pipeline Core
MathParser: src/ast-pipeline/core/mathParser.js@6
AlignmentEngine: src/ast-pipeline/core/alignmentEngine.js
TemplateLibrary: src/ast-pipeline/core/templateLibrary.js

# Processors
ProblemProcessor: src/ast-pipeline/processors/problemProcessor.js@10
ProblemProcessor.processProblem: src/ast-pipeline/processors/problemProcessor.js@20
ProblemProcessor.generateJSON: src/ast-pipeline/processors/problemProcessor.js@68
ProblemProcessor.processBatch: src/ast-pipeline/processors/problemProcessor.js@213

# UI Integration
ASTTool: src/components/Tools/ASTTool.js@8
ASTTool.processContent: src/components/Tools/ASTTool.js@19
ToolsPanel AST integration: src/components/Tools/ToolsPanel.jsx@30,117

# Test Files
quickTest.js: src/ast-pipeline/test/quickTest.js
testProblems.js: src/ast-pipeline/test/testProblems.js