import { useState, useEffect, useRef } from 'react';

const EditorPanel = ({ content, setContent, contentType, setContentType, parseError, activeTool }) => {
  const [fileContent, setFileContent] = useState('');
  const defaultTemplate = JSON.stringify({ type: "formula", content: "" }, null, 2);
  const [objectContent, setObjectContent] = useState(defaultTemplate);
  const [latexContent, setLatexContent] = useState(''); // NEW: Separate state for LaTeX
  const syncingRef = useRef(false);
  const [activeTab, setActiveTab] = useState('object'); // 'file', 'object', or 'latex'
  const [prevActiveTab, setPrevActiveTab] = useState('object');

  
// Sync graph content when graph tool updates it
  useEffect(() => {
    if (activeTool === 'graph' && content && !syncingRef.current) {
      try {
        const parsed = JSON.parse(content);
        // Only sync if it's graph content AND different from current objectContent
        if (parsed.type === 'graph' && content !== objectContent) {
          syncingRef.current = true;
          if (activeTab === 'object') {
            setObjectContent(content);
          } else if (activeTab === 'file' && content !== fileContent) {
            setFileContent(content);
          }
          // Reset sync flag after a brief delay
          setTimeout(() => {
            syncingRef.current = false;
          }, 100);
        }
      } catch (e) {
        // Not JSON, ignore
      }
    }
  }, [content, activeTool, objectContent, fileContent, activeTab]);
  
  // Sync number-line content when number-line tool updates it
  useEffect(() => {
    if (activeTool === 'number-line' && content && !syncingRef.current) {
      try {
        const parsed = JSON.parse(content);
        // Only sync if it's number-line content AND different from current objectContent
        if (parsed.type === 'number-line' && content !== objectContent) {
          syncingRef.current = true;
          if (activeTab === 'object') {
            setObjectContent(content);
          } else if (activeTab === 'file' && content !== fileContent) {
            setFileContent(content);
          }
          // Reset sync flag after a brief delay
          setTimeout(() => {
            syncingRef.current = false;
          }, 100);
        }
      } catch (e) {
        // Not JSON, ignore
      }
    }
  }, [content, activeTool, objectContent, fileContent, activeTab]);
  
  // Update content when tab changes  
  useEffect(() => {
    // When switching TO Object JSON from another mode, reset to template (unless graph tool is active)
    if (activeTab === 'object' && prevActiveTab !== 'object') {
// Don't override if graph tool or number-line tool is active
      if (activeTool !== 'graph' && activeTool !== 'number-line') {
        setObjectContent(defaultTemplate);
        setContent(defaultTemplate);
        setContentType('json');
      }
    } else if (activeTab === 'file') {
      setContent(fileContent);
      setContentType('json');
    } else if (activeTab === 'object') {
      setContent(objectContent);
      setContentType('json');
    } else if (activeTab === 'latex') {
      setContent(latexContent); // FIXED: Use latexContent instead of objectContent
      setContentType('latex');
    }
    setPrevActiveTab(activeTab);
  }, [activeTab, prevActiveTab, defaultTemplate, setContent, setContentType, fileContent, objectContent, latexContent]); // Added latexContent to deps
  
  // Real-time content updates when objectContent or fileContent changes
  useEffect(() => {
    if (activeTab === 'file') {
      setContent(fileContent);
      setContentType('json');
    } else if (activeTab === 'object') {
      setContent(objectContent);
      setContentType('json');
    } else if (activeTab === 'latex') {
      setContent(latexContent); // FIXED: Use latexContent instead of objectContent
      setContentType('latex');
    }
  }, [objectContent, fileContent, latexContent, activeTab, setContent, setContentType]); // Added latexContent to deps
  
  // Editor configuration
  const getEditorClass = () => {
    if (parseError) return 'editor-error';
    if (content && !parseError) return 'editor-valid';
    return 'editor-invalid';
  };
  
  // Helper to find enclosing braces
  const findEnclosingBraces = (text, position) => {
    let start = -1;
    let end = -1;
    let depth = 0;
    
    // Find opening brace
    for (let i = position; i >= 0; i--) {
      if (text[i] === '}') depth++;
      if (text[i] === '{') {
        if (depth === 0) {
          start = i;
          break;
        }
        depth--;
      }
    }
    
    // Find closing brace
    depth = 0;
    for (let i = position; i < text.length; i++) {
      if (text[i] === '{') depth++;
      if (text[i] === '}') {
        if (depth === 0) {
          end = i + 1;
          break;
        }
        depth--;
      }
    }
    
    return { start, end };
  };
  
  // Helper to find enclosing quotes
  const findEnclosingQuotes = (text, position) => {
    let start = -1;
    let end = -1;
    
    // Find opening quote
    for (let i = position - 1; i >= 0; i--) {
      if (text[i] === '"' && (i === 0 || text[i-1] !== '\\')) {
        start = i + 1;
        break;
      }
    }
    
    // Find closing quote
    for (let i = position; i < text.length; i++) {
      if (text[i] === '"' && text[i-1] !== '\\') {
        end = i;
        break;
      }
    }
    
    return { start, end };
  };
  
  return (
    <div className="editor-panel h-full flex flex-col bg-white">
      {/* Editor Tabs */}
      <div className="editor-tabs flex bg-gray-200 border-b border-gray-300">
        <button 
          onClick={() => setActiveTab('file')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'file' 
              ? 'bg-white text-gray-900 border-b-2 border-blue-500' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          File JSON
        </button>
        <button 
          onClick={() => setActiveTab('object')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'object' 
              ? 'bg-white text-gray-900 border-b-2 border-blue-500' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Object JSON
        </button>
        <button 
          onClick={() => setActiveTab('latex')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'latex' 
              ? 'bg-white text-gray-900 border-b-2 border-blue-500' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          LaTeX
        </button>
        
        {/* Editor Action Buttons */}
        <div className="ml-auto flex gap-2">
          {activeTab === 'file' && (
            <>
              <button 
                onClick={() => {
                  const textarea = document.querySelector('.editor-content textarea');
                  if (textarea) {
                    const cursorPos = textarea.selectionStart;
                    const { start, end } = findEnclosingBraces(fileContent, cursorPos);
                    if (start !== -1 && end !== -1) {
                      const extractedObject = fileContent.substring(start, end);
                      setObjectContent(extractedObject);
                      setActiveTab('object');
                      alert('JSON object extracted!');
                    } else {
                      alert('Could not find enclosing braces at cursor position!');
                    }
                  }
                }}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Extract JSON Object
              </button>
              
              <button 
                onClick={() => {
                  const textarea = document.querySelector('.editor-content textarea');
                  if (textarea) {
                    const cursorPos = textarea.selectionStart;
                    const { start, end } = findEnclosingQuotes(fileContent, cursorPos);
                    if (start !== -1 && end !== -1) {
                      const extractedString = fileContent.substring(start, end);
                      setLatexContent(extractedString);
                      setActiveTab('latex');
                      alert('LaTeX string extracted!');
                    } else {
                      alert('Could not find enclosing quotes at cursor position!');
                    }
                  }
                }}
                className="px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
              >
                Extract LaTeX String
              </button>
            </>
          )}
          
          {(activeTab === 'object' || activeTab === 'latex') && (
            <button 
              onClick={() => {
                const savedEquation = localStorage.getItem('savedEquation');
                if (savedEquation) {
                  // For object tab, parse and simplify to single object
                  if (activeTab === 'object') {
                    try {
                      const parsed = JSON.parse(savedEquation);
                      // Extract just the object, not the array
                      const obj = Array.isArray(parsed) ? parsed[0] : parsed;
                      setObjectContent(JSON.stringify(obj, null, 2));
                    } catch (e) {
                      setObjectContent(savedEquation);
                    }
                  } else {
                    // For LaTeX tab, extract just the content
                    try {
                      const parsed = JSON.parse(savedEquation);
                      const obj = Array.isArray(parsed) ? parsed[0] : parsed;
                      const latexContent = obj.content || savedEquation;
                      // Remove $ delimiters if present
                      setLatexContent(latexContent.replace(/^\$/, '').replace(/\$$/, ''));
                    } catch (e) {
                      setLatexContent(savedEquation);
                    }
                  }
                  alert('Replaced with saved equation!');
                } else {
                  alert('No saved equation found! Build and save one first.');
                }
              }}
              className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Replace with Saved
            </button>
          )}
          
          <button 
            onClick={() => {
// If graph tool is active, reset to graph template
              if (activeTool === 'graph') {
                const graphTemplate = {
                  type: "graph",
                  content: "[CLICK THE GENERATE GRAPH BUTTON TO INJECT CONTENT]"
                };
                setContent(JSON.stringify(graphTemplate, null, 2));
                setContentType('json');
                // Also update the appropriate tab content
                if (activeTab === 'file') {
                  setFileContent(JSON.stringify(graphTemplate, null, 2));
                } else if (activeTab === 'object') {
                  setObjectContent(JSON.stringify(graphTemplate, null, 2));
                }
              } else if (activeTool === 'number-line') {
                // If number-line tool is active, reset to number-line template
                const numberLineTemplate = {
                  type: "number-line",
                  content: "[CLICK THE GENERATE NUMBER LINE BUTTON TO INJECT CONTENT]"
                };
                setContent(JSON.stringify(numberLineTemplate, null, 2));
                setContentType('json');
                // Also update the appropriate tab content
                if (activeTab === 'file') {
                  setFileContent(JSON.stringify(numberLineTemplate, null, 2));
                } else if (activeTab === 'object') {
                  setObjectContent(JSON.stringify(numberLineTemplate, null, 2));
                }
              } else {
                // Original clear behavior
                if (activeTab === 'file') {
                  setFileContent('');
                } else if (activeTab === 'object') {
                  setObjectContent(defaultTemplate);
                } else {
                  setLatexContent('');
                }
              }
            }}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
      
      {/* Editor Content */}
      <div className="editor-content flex-1 p-4">
        <textarea
          value={activeTab === 'file' ? fileContent : activeTab === 'object' ? objectContent : latexContent}
          onChange={(e) => {
            if (activeTab === 'file') {
              setFileContent(e.target.value);
            } else if (activeTab === 'object') {
              setObjectContent(e.target.value);
            } else {
              setLatexContent(e.target.value);
            }
          }}
          className={`w-full h-full font-mono text-sm p-3 border-2 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${getEditorClass()}`}
          placeholder={
            activeTab === 'file' 
              ? 'Paste full JSON file here...' 
              : activeTab === 'latex' 
                ? 'Enter LaTeX formula (without $ delimiters)...'
                : 'Single JSON object for editing:\n{\n  "type": "formula",\n  "content": "..."\n}'
          }
          spellCheck={false}
        />
      </div>
      
      {/* Status Bar */}
      <div className="editor-status h-8 bg-gray-100 px-4 flex items-center justify-between text-xs border-t border-gray-300">
        <div className="flex items-center gap-2">
          {parseError ? (
            <>
              <span className="text-red-500">⚠️</span>
              <span className="text-red-700">{parseError.substring(0, 50)}...</span>
            </>
          ) : content ? (
            <>
              <span className="text-green-500">✓</span>
              <span className="text-green-700">Valid {activeTab === 'latex' ? 'LaTeX' : 'JSON'}</span>
            </>
          ) : (
            <span className="text-gray-500">Ready</span>
          )}
        </div>
        <div className="text-gray-500">
          {(activeTab === 'file' ? fileContent : objectContent) 
            ? `${(activeTab === 'file' ? fileContent : objectContent).length} characters` 
            : 'Empty'}
        </div>
      </div>
    </div>
  );
};

export default EditorPanel;