import { useState, useEffect, useRef } from "react";
import ASTTool from "./ASTTool";
import GraphTool from "./GraphTool";
import NumberLineTool from "./NumberLineTool";
import TemplateLibrary from "../Templates/TemplateLibrary";

const ToolsPanel = ({ activeTool, setActiveTool, onToolUpdate, content, setContent, contentType, setContentType }) => {
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [astTool] = useState(() => new ASTTool());
  const [graphTool] = useState(() => new GraphTool());
  const [numberLineTool] = useState(() => new NumberLineTool());
  const [processing, setProcessing] = useState(false);
  const [processedResult, setProcessedResult] = useState(null);
  const [mode, setMode] = useState("tools"); // 'tools' | 'templates'
  const prevActiveTool = useRef(null);

  // Available tools
  const tools = [
    { id: "ast-processor", name: "AST Processor", icon: "🔄" },
    { id: "latex-align", name: "LaTeX Alignment", icon: "∑" },
    { id: "bracket", name: "Bracket Equation", icon: "{ }" },
{ id: "number-line", name: "Number Line", icon: "—" },
    { id: "graph", name: "Coordinate Graph", icon: "📈" },
    { id: "triangle", name: "Triangle Tool", icon: "△" },
    { id: "fraction", name: "Fraction Visual", icon: "½" },
  ];

  // Process content with AST
  const processWithAST = async () => {
    if (!content) {
      alert("Please enter content in the editor first");
      return;
    }

    setProcessing(true);
    try {
      const result = await astTool.processContent(content);
      setProcessedResult(result);

      if (result.success) {
        onToolUpdate(result.data);
        console.log("AST Processing successful:", result);
      } else {
        console.error("AST Processing failed:", result.error);
      }
    } catch (error) {
      console.error("AST Processing error:", error);
    } finally {
      setProcessing(false);
    }
  };

  // Process content with Graph Tool
  const processWithGraph = async () => {
    // Get commands from the tool panel input
    const graphCommands = document.getElementById('graph-commands')?.value;
    
    if (!graphCommands || graphCommands.trim() === '') {
      alert("Please enter graph commands in the Graph Commands field");
      return;
    }

    setProcessing(true);
    try {
      // Get the graph bounds and options from the input fields
      const options = {
        xMin: parseFloat(document.getElementById('graph-xmin')?.value || -10),
        xMax: parseFloat(document.getElementById('graph-xmax')?.value || 10),
        yMin: parseFloat(document.getElementById('graph-ymin')?.value || -10),
        yMax: parseFloat(document.getElementById('graph-ymax')?.value || 10),
        showAxisLabels: document.getElementById('graph-showlabels')?.checked ?? true,
        showAxisValues: document.getElementById('graph-showvalues')?.checked ?? true,
        showOrigin: document.getElementById('graph-showorigin')?.checked ?? true,
        originPosition: document.getElementById('graph-originposition')?.value || 'lower-left',
        labelStep: parseFloat(document.getElementById('graph-labelstep')?.value || 1)
      };
      
      const result = await graphTool.processContent(graphCommands, options);
      setProcessedResult(result);

      if (result.success) {
        // Create the JSON structure with the SVG content
        const graphJson = {
          type: "graph",
          content: result.data.svg  // Changed from 'svg' to 'content' to match expected format
        };
        
        // Set the content as JSON with the SVG embedded
        setContent(JSON.stringify(graphJson, null, 2));
        setContentType("json");
        console.log("Graph generation successful:", result);
      } else {
        console.error("Graph generation failed:", result.error);
        alert(`Graph generation failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Graph generation error:", error);
      alert(`Graph generation error: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  // Process content with Number Line Tool  
  const processWithNumberLine = async () => {
    // Get commands from the tool panel input
    const numberLineCommands = document.getElementById('numberline-commands')?.value;
    
    if (!numberLineCommands || numberLineCommands.trim() === '') {
      alert("Please enter number line commands in the Number Line Commands field");
      return;
    }

    setProcessing(true);
    try {
      // Get the bounds and options from the input fields
      const options = {
        min: parseFloat(document.getElementById('numberline-min')?.value || -10),
        max: parseFloat(document.getElementById('numberline-max')?.value || 10),
        showLabels: document.getElementById('numberline-showlabels')?.checked ?? true,
        labelStep: parseFloat(document.getElementById('numberline-labelstep')?.value || 1),
        size: document.getElementById('numberline-size')?.value || 'medium'
      };
      
      const result = await numberLineTool.processContent(numberLineCommands, options);
      setProcessedResult(result);

      if (result.success) {
        // Create the JSON structure with the SVG content
        const numberLineJson = {
          type: "number-line",
          content: result.data.svg
        };
        
        // Set the content as JSON with the SVG embedded
        setContent(JSON.stringify(numberLineJson, null, 2));
        setContentType("json");
        console.log("Number line generation successful:", result);
      } else {
        console.error("Number line generation failed:", result.error);
        alert(`Number line generation failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Number line generation error:", error);
      alert(`Number line generation error: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

// Set template when graph tool is selected
  useEffect(() => {
    // Only run when changing TO graph tool, not when already on graph
    if (activeTool === 'graph' && prevActiveTool.current !== 'graph') {
      const template = {
        type: "graph",
        content: "[CLICK THE GENERATE GRAPH BUTTON TO INJECT CONTENT]"
      };
      setContent(JSON.stringify(template, null, 2));
      setContentType("json");
    }
    // Only run when changing TO number-line tool
    if (activeTool === 'number-line' && prevActiveTool.current !== 'number-line') {
      const template = {
        type: "number-line",
        content: "[CLICK THE GENERATE NUMBER LINE BUTTON TO INJECT CONTENT]"
      };
      setContent(JSON.stringify(template, null, 2));
      setContentType("json");
    }
    // Update previous tool ref
    prevActiveTool.current = activeTool;
  }, [activeTool, setContent, setContentType]);

  // Save current result as pattern
  const saveAsPattern = () => {
    if (!processedResult?.success) return;

    const name = prompt("Enter pattern name:");
    if (name) {
      const pattern = astTool.savePattern(name, processedResult.data);
      // Pattern saved to AST tool
      console.log("Pattern saved:", pattern);
    }
  };

  // Handle template insertion
  const handleTemplateInsert = (templateContent) => {
    // Send the template content to the editor
    onToolUpdate(templateContent);
  };

  return (
    <div className="tools-panel h-full flex flex-col bg-gray-50">
      {/* Mode Toggle */}
      <div className="p-2 bg-white border-b border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={() => setMode("tools")}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === "tools"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Visual Tools
          </button>
          <button
            onClick={() => setMode("templates")}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === "templates"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Template Library
          </button>
        </div>
      </div>

      {/* Content Area */}
      {mode === "tools" ? (
        <>
          {/* Tools Header */}
          <div className="p-4 bg-white border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Visual Tools
            </h3>

            {/* Tool Grid */}
            <div className="grid grid-cols-3 gap-2">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() =>
                    setActiveTool(tool.id === activeTool ? null : tool.id)
                  }
                  className={`p-3 rounded-lg text-center transition-all ${
                    activeTool === tool.id
                      ? "bg-blue-500 text-white shadow-md transform scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <div className="text-2xl mb-1">{tool.icon}</div>
                  <div className="text-xs">{tool.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Tool Interface */}
          {activeTool && (
            <div className="p-4 bg-white border-b border-gray-200">
<h4 className="text-sm font-semibold text-gray-700 mb-2">
                {(() => {
                  const tool = tools.find((t) => t.id === activeTool);
                  const baseName = tool?.name || '';
                  // Add "Tool" suffix for number-line and graph, just "Settings" for others
                  if (activeTool === 'number-line' || activeTool === 'graph') {
                    return `${baseName} Tool`;
                  }
                  return `${baseName} Settings`;
                })()}
              </h4>

              {/* AST Processor Interface */}
              {activeTool === "ast-processor" && (
                <div className="space-y-3">
                  <div className="text-xs text-gray-600">
                    Process markdown content into structured JSON with proper
                    math alignment
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={processWithAST}
                      disabled={processing}
                      className={`flex-1 px-3 py-2 rounded text-sm font-medium ${
                        processing
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                    >
                      {processing ? "Processing..." : "Process Content"}
                    </button>

                    {processedResult?.success && (
                      <button
                        onClick={saveAsPattern}
                        className="px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                      >
                        Save Pattern
                      </button>
                    )}
                  </div>

                  {processedResult && (
                    <div
                      className={`p-2 rounded text-xs ${
                        processedResult.success
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {processedResult.success
                        ? `✓ Processed successfully: ${
                            processedResult.data?.Steps?.length || 0
                          } steps generated`
                        : `✗ Error: ${processedResult.error}`}
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    <div>Supported formats:</div>
                    <ul className="ml-4 mt-1">
                      <li>• Math problems (Solve: 2x + 4 = 10)</li>
                      <li>• Derivatives (Find derivative: f(x) = x³)</li>
                      <li>• Teaching content (markdown sections)</li>
                      <li>• Batch processing (separate with blank lines)</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Other tool interfaces */}
              {activeTool === "latex-align" && (
                <div className="space-y-2">
                  <textarea
                    className="w-full h-20 p-2 border rounded text-sm font-mono"
                    placeholder="Enter LaTeX equations to align..."
                  />
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm">
                      Auto Align
                    </button>
                    <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm">
                      Add Guide
                    </button>
                  </div>
                </div>
              )}

              {activeTool === "number-line" && (
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded text-xs space-y-2">
                    <div className="font-semibold text-blue-900">Number Line Commands (one per line):</div>
                    <div className="text-blue-800 space-y-1 text-[11px]">
                      <div><b>Points:</b></div>
                      <div className="ml-2 font-mono">point(3)</div>
                      <div className="ml-2 font-mono">point(-2) [color:blue]</div>
                      
                      <div className="mt-1"><b>Open Points:</b></div>
                      <div className="ml-2 font-mono">open(5)</div>
                      <div className="ml-2 font-mono">open(-1) [color:green]</div>
                      
                      <div className="mt-1"><b>Intervals:</b></div>
                      <div className="ml-2 font-mono">interval[2, 5]</div>
                      <div className="ml-2 font-mono">interval(-3, 0) [color:purple]</div>
                      
                      <div className="mt-1"><b>Inequalities:</b></div>
                      <div className="ml-2 font-mono">x {">"} 3</div>
                      <div className="ml-2 font-mono">x {"<"}= -2 [color:red]</div>
                      
                      <div className="mt-1"><b>Labels:</b></div>
                      <div className="ml-2 font-mono">label(0, "Origin")</div>
                      <div className="ml-2 font-mono">label(5, "Point A")</div>
                      
                      <div className="mt-2 text-blue-600"><b>Colors:</b> red, blue, green, purple, orange, black, pink, etc.</div>
                    </div>
                  </div>
                  
                  <textarea
                    id="numberline-commands"
                    className="w-full h-20 p-2 border rounded text-xs font-mono"
                    placeholder="point(0)
point(3)
interval[-2, 2]
label(3, &quot;Point A&quot;)"
                    defaultValue=""
                  />
                  
<div className="text-xs font-semibold text-gray-700">Number Line Settings:</div>
                  
                  <div className="space-y-2">
                    {/* Bounds */}
                    <div>
                      <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-600 mb-1">
                        <div className="text-center">Min</div>
                        <div className="text-center">Max</div>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <input
                          id="numberline-min"
                          type="number"
                          className="p-1 border rounded text-xs text-center"
                          defaultValue="-10"
                        />
                        <input
                          id="numberline-max"
                          type="number"
                          className="p-1 border rounded text-xs text-center"
                          defaultValue="10"
                        />
                      </div>
                    </div>
                    
                    {/* Label Options */}
                    <div className="flex gap-2 items-center text-xs">
                      <label className="flex items-center gap-1">
                        <input
                          id="numberline-showlabels"
                          type="checkbox"
                          defaultChecked
                        />
                        <span>Value Labels</span>
                      </label>
                    </div>
                    
                    {/* Label Interval */}
                    <div className="flex gap-2 items-center text-xs">
                      <span>Label every</span>
                      <input
                        id="numberline-labelstep"
                        type="number"
                        className="w-12 p-1 border rounded text-xs"
                        defaultValue="1"
                        min="1"
                      />
                      <span>units</span>
                    </div>
                    
                    {/* Size Preset */}
                    <div className="flex gap-2 items-center text-xs">
                      <span>Size:</span>
                      <select
                        id="numberline-size"
                        className="flex-1 p-1 border rounded text-xs"
                        defaultValue="medium"
                      >
                        <option value="small">Small (400px)</option>
                        <option value="medium">Medium (580px)</option>
                        <option value="large">Large (800px)</option>
                        <option value="xlarge">X-Large (1000px)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={processWithNumberLine}
                      disabled={processing}
                      className={`flex-1 px-3 py-2 rounded text-sm font-medium ${
                        processing
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                    >
                      {processing ? "Generating..." : "Generate Number Line"}
                    </button>
                    
                    <button
                      onClick={() => {
                        // Clear only the number line commands input
                        const commandsInput = document.getElementById('numberline-commands');
                        if (commandsInput) commandsInput.value = '';
                        setProcessedResult(null);
                      }}
                      className="px-3 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {activeTool === "graph" && (
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded text-xs space-y-2">
                    <div className="font-semibold text-blue-900">Graph Commands (one per line):</div>
                    <div className="text-blue-800 space-y-1 text-[11px]">
                      <div><b>Points:</b></div>
                      <div className="ml-2 font-mono">point(2, 3)</div>
                      <div className="ml-2 font-mono">point(-1, 4)</div>
                      
                      <div className="mt-1"><b>Lines (linear only):</b></div>
                      <div className="ml-2 font-mono">line y = 2x + 3</div>
                      <div className="ml-2 font-mono">line y = -0.5x - 1 [color:red]</div>
                      
                      <div className="mt-1"><b>Functions (any expression):</b></div>
                      <div className="ml-2 font-mono">f(x) = x^2</div>
                      <div className="ml-2 font-mono">f(x) = x^2 - 4 [color:blue]</div>
                      <div className="ml-2 font-mono">f(x) = x^3 + 2x - 1 [color:purple]</div>
                      
                      <div className="mt-1"><b>Shading:</b></div>
                      <div className="ml-2 font-mono">shade x {">"} 2</div>
                      <div className="ml-2 font-mono">shade y {"<"} -1</div>
                      
                      <div className="mt-1"><b>Labels:</b></div>
                      <div className="ml-2 font-mono">label(2, 3, "Point A")</div>
                      <div className="ml-2 font-mono">label(-1, 0, "Origin")</div>
                      
                      <div className="mt-2 text-blue-600"><b>Colors:</b> red, blue, green, purple, orange, black, pink, etc.</div>
                    </div>
                  </div>
                  
                  <textarea
                    id="graph-commands"
                    className="w-full h-20 p-2 border rounded text-xs font-mono"
                    placeholder="point(0, 0)
point(3, 4)
line y = 2x - 1
label(3, 4, &quot;Point A&quot;)"
                    defaultValue=""
                  />
                  
<div className="text-xs font-semibold text-gray-700">Coordinate Graph Settings:</div>
                  
                  <div className="space-y-2">
                    {/* Bounds */}
                    <div>
                      <div className="grid grid-cols-4 gap-1 text-[10px] text-gray-600 mb-1">
                        <div className="text-center">X Min</div>
                        <div className="text-center">X Max</div>
                        <div className="text-center">Y Min</div>
                        <div className="text-center">Y Max</div>
                      </div>
                      <div className="grid grid-cols-4 gap-1 text-xs">
                        <input
                          id="graph-xmin"
                          type="number"
                          className="p-1 border rounded text-xs text-center"
                          defaultValue="-10"
                        />
                        <input
                          id="graph-xmax"
                          type="number"
                          className="p-1 border rounded text-xs text-center"
                          defaultValue="10"
                        />
                        <input
                          id="graph-ymin"
                          type="number"
                          className="p-1 border rounded text-xs text-center"
                          defaultValue="-10"
                        />
                        <input
                          id="graph-ymax"
                          type="number"
                          className="p-1 border rounded text-xs text-center"
                          defaultValue="10"
                        />
                      </div>
                    </div>
                    
                    {/* Axis Options */}
                    <div className="flex gap-2 items-center text-xs">
                      <label className="flex items-center gap-1">
                        <input
                          id="graph-showlabels"
                          type="checkbox"
                          defaultChecked
                        />
                        <span>Axis Labels (x,y)</span>
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          id="graph-showvalues"
                          type="checkbox"
                          defaultChecked
                        />
                        <span>Axis Values</span>
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          id="graph-showorigin"
                          type="checkbox"
                          defaultChecked
                        />
                        <span>Origin (0,0)</span>
                      </label>
                      <select
                        id="graph-originposition"
                        className="text-xs p-1 border rounded"
                        defaultValue="lower-left"
                      >
                        <option value="upper-right">Upper Right</option>
                        <option value="lower-right">Lower Right</option>
                        <option value="lower-left">Lower Left</option>
                        <option value="upper-left">Upper Left</option>
                      </select>
                    </div>
                    
                    {/* Label Interval */}
                    <div className="flex gap-2 items-center text-xs">
                      <span>Label every</span>
                      <input
                        id="graph-labelstep"
                        type="number"
                        className="w-12 p-1 border rounded text-xs"
                        defaultValue="1"
                        min="1"
                      />
                      <span>units</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={processWithGraph}
                      disabled={processing}
                      className={`flex-1 px-3 py-2 rounded text-sm font-medium ${
                        processing
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                    >
                      {processing ? "Generating..." : "Generate Graph"}
                    </button>
                    
                    <button
                      onClick={() => {
                        // Clear only the graph commands input
                        const commandsInput = document.getElementById('graph-commands');
                        if (commandsInput) commandsInput.value = '';
                        setProcessedResult(null);
                      }}
                      className="px-3 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                    >
                      Clear
                    </button>
                  </div>
                  
                  {processedResult?.success && processedResult.data.type === 'graph' && (
                    <div className="p-2 rounded bg-green-100 text-green-800 text-xs">
                      ✓ Graph generated successfully
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Quick Actions - only in tools mode */}
          <div className="flex-1"></div>
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200">
                Validate
              </button>
              <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200">
                Save Pattern
              </button>
              <button className="flex-1 px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600">
                Export JSON
              </button>
            </div>
          </div>
        </>
      ) : (
        /* Template Library Mode - Full height */
        <div className="flex-1 min-h-0 overflow-hidden">
          <TemplateLibrary
            currentContent={content}
            onInsertTemplate={handleTemplateInsert}
            setContent={setContent}
            contentType={contentType}
            setContentType={setContentType}
          />
        </div>
      )}
    </div>
  );
};

export default ToolsPanel;
