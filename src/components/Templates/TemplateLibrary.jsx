import { useState, useEffect, useRef } from "react";
import TemplateParameterModal from "./TemplateParameterModal";
import TemplateCategoryManager from "./TemplateCategoryManager";
import { BuilderPanel } from "./Builders";

const TemplateLibrary = ({ onInsertTemplate, currentContent, setContent, contentType: parentContentType, setContentType: parentSetContentType }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateName, setTemplateName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showParameterModal, setShowParameterModal] = useState(false);
  const [templateToUse, setTemplateToUse] = useState(null);
  const [contentType, setContentType] = useState("json"); // json | latex
  const [previewExpanded, setPreviewExpanded] = useState(null);
  const [libraryMode, setLibraryMode] = useState("templates"); // templates | builder
  
  // Categories
  const categories = [
    { id: "all", name: "All Templates", icon: "📚" },
    { id: "geometry", name: "Geometry", icon: "📐" },
    { id: "algebra", name: "Algebra", icon: "🔤" },
    { id: "calculus", name: "Calculus", icon: "∫" },
    { id: "statistics", name: "Statistics", icon: "📊" },
    { id: "latex", name: "LaTeX", icon: "📝" },
    { id: "custom", name: "Custom", icon: "⭐" },
  ];

  // Load templates from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("contentLabTemplates");
    if (saved) {
      const loadedTemplates = JSON.parse(saved);
      // Update usage stats
      const withStats = loadedTemplates.map(t => ({
        ...t,
        usageCount: t.usageCount || 0,
        lastUsed: t.lastUsed || null
      }));
      setTemplates(withStats);
    } else {
      // Load default templates
      loadDefaultTemplates();
    }
  }, []);

  // Load default templates
  const loadDefaultTemplates = () => {
    const defaults = [
      {
        id: "tpl_triangle_basic",
        name: "Basic Triangle",
        category: "geometry",
        contentType: "json",
        content: [
          {
            type: "svg",
            content: `<svg width="300" height="250" xmlns="http://www.w3.org/2000/svg">
              <polygon points="{{x1}},{{y1}} {{x2}},{{y2}} {{x3}},{{y3}}" 
                fill="none" stroke="black" stroke-width="2"/>
              {{#showLabels}}
              <text x="{{x1}}" y="{{y1minus10}}" font-size="14">{{labelA}}</text>
              <text x="{{x2}}" y="{{y2plus20}}" font-size="14">{{labelB}}</text>
              <text x="{{x3}}" y="{{y3plus20}}" font-size="14">{{labelC}}</text>
              {{/showLabels}}
            </svg>`
          }
        ],
        parameters: {
          x1: { type: "number", default: 150, label: "Point A - X" },
          y1: { type: "number", default: 30, label: "Point A - Y" },
          x2: { type: "number", default: 50, label: "Point B - X" },
          y2: { type: "number", default: 200, label: "Point B - Y" },
          x3: { type: "number", default: 250, label: "Point C - X" },
          y3: { type: "number", default: 200, label: "Point C - Y" },
          showLabels: { type: "boolean", default: true, label: "Show Labels" },
          labelA: { type: "text", default: "A", label: "Label for A" },
          labelB: { type: "text", default: "B", label: "Label for B" },
          labelC: { type: "text", default: "C", label: "Label for C" }
        },
        usageCount: 0,
        created: new Date().toISOString()
      },
      {
        id: "tpl_aligned_equations",
        name: "Aligned Equations", 
        category: "algebra",
        contentType: "json",
        content: [
          {
            type: "formula",
            content: "$\\begin{array}{rl}{{equation1}} &= {{result1}} \\\\ {{equation2}} &= {{result2}} \\\\ {{equation3}} &= {{result3}}\\end{array}$"
          }
        ],
        parameters: {
          equation1: { type: "text", default: "2x + 4", label: "Equation 1 Left" },
          result1: { type: "text", default: "10", label: "Equation 1 Right" },
          equation2: { type: "text", default: "2x", label: "Equation 2 Left" },
          result2: { type: "text", default: "10 - 4", label: "Equation 2 Right" },
          equation3: { type: "text", default: "x", label: "Equation 3 Left" },
          result3: { type: "text", default: "3", label: "Equation 3 Right" }
        },
        usageCount: 0,
        created: new Date().toISOString()
      }
    ];

    setTemplates(defaults);
    localStorage.setItem("contentLabTemplates", JSON.stringify(defaults));
  };

  // Save template from current content (with selection support)
  const saveTemplate = () => {
    if (!currentContent || !templateName.trim()) return;

    // Get selected text if available
    const editor = document.querySelector('textarea');
    let contentToSave = currentContent;
    
    if (editor && editor.selectionStart !== editor.selectionEnd) {
      contentToSave = currentContent.substring(
        editor.selectionStart,
        editor.selectionEnd
      );
    }

    // Try to parse content type
    let detectedType = "json";
    let parsedContent = contentToSave;
    
    try {
      parsedContent = JSON.parse(contentToSave);
    } catch {
      // If not JSON, assume LaTeX
      detectedType = "latex";
    }

    // Extract parameters
    const paramRegex = /\{\{([^}]+)\}\}/g;
    const foundParams = new Set();
    let match;
    
    const contentStr = typeof contentToSave === "string" 
      ? contentToSave 
      : JSON.stringify(contentToSave, null, 2);
    
    while ((match = paramRegex.exec(contentStr)) !== null) {
      // Handle special template syntax like {{#showLabels}} 
      if (!match[1].startsWith('#') && !match[1].startsWith('/')) {
        foundParams.add(match[1]);
      }
    }

    // Create parameter definitions
    const parameters = {};
    foundParams.forEach(param => {
      parameters[param] = {
        type: "text",
        default: "",
        label: param.charAt(0).toUpperCase() + param.slice(1)
      };
    });

    const newTemplate = {
      id: `tpl_${Date.now()}`,
      name: templateName,
      content: parsedContent,
      contentType: detectedType,
      parameters: parameters,
      category: detectCategory(contentToSave),
      usageCount: 0,
      created: new Date().toISOString(),
    };

    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    localStorage.setItem("contentLabTemplates", JSON.stringify(updatedTemplates));

    setShowSaveDialog(false);
    setTemplateName("");
  };

  // Detect category based on content
  const detectCategory = (content) => {
    const contentStr = JSON.stringify(content).toLowerCase();
    if (contentStr.includes("triangle") || contentStr.includes("angle") || contentStr.includes("polygon"))
      return "geometry";
    if (contentStr.includes("equation") || contentStr.includes("solve") || contentStr.includes("align"))
      return "algebra";
    if (contentStr.includes("derivative") || contentStr.includes("integral") || contentStr.includes("\\int"))
      return "calculus";
    if (contentStr.includes("mean") || contentStr.includes("median") || contentStr.includes("probability"))
      return "statistics";
    if (contentStr.includes("\\begin") || contentStr.includes("\\frac"))
      return "latex";
    return "custom";
  };

  // Use template with parameters
  const useTemplate = (template) => {
    // Update usage statistics
    const updatedTemplates = templates.map(t => 
      t.id === template.id 
        ? { ...t, usageCount: (t.usageCount || 0) + 1, lastUsed: new Date().toISOString() }
        : t
    );
    setTemplates(updatedTemplates);
    localStorage.setItem("contentLabTemplates", JSON.stringify(updatedTemplates));

    // Check if template has parameters
    if (template.parameters && Object.keys(template.parameters).length > 0) {
      setTemplateToUse(template);
      setShowParameterModal(true);
    } else {
      // No parameters, insert directly
      insertTemplateContent(template, {});
    }
  };

  // Insert template content with replaced parameters
  const insertTemplateContent = (template, paramValues) => {
    // Always stringify content since all templates are JSON structures now
    let contentStr = JSON.stringify(template.content, null, 2);

    // Replace parameters
    Object.entries(paramValues).forEach(([key, value]) => {
      // Handle computed values (like y1minus10)
      if (key.includes('minus')) {
        const [baseParam, amount] = key.split('minus');
        if (paramValues[baseParam]) {
          value = paramValues[baseParam] - parseInt(amount);
        }
      } else if (key.includes('plus')) {
        const [baseParam, amount] = key.split('plus');
        if (paramValues[baseParam]) {
          value = paramValues[baseParam] + parseInt(amount);
        }
      }
      
      // Replace the parameter
      contentStr = contentStr.replace(new RegExp(`{{${key}}}`, 'g'), value);
      
      // Handle conditional sections (mustache-style)
      if (typeof value === 'boolean') {
        const conditionalRegex = new RegExp(`{{#${key}}}([\\s\\S]*?){{/${key}}}`, 'g');
        contentStr = contentStr.replace(conditionalRegex, value ? '$1' : '');
      }
    });

    // Handle computed parameters that weren't explicitly set
    const computedRegex = /\{\{(\w+)(plus|minus)(\d+)\}\}/g;
    contentStr = contentStr.replace(computedRegex, (match, base, op, amount) => {
      if (paramValues[base]) {
        return op === 'plus' 
          ? paramValues[base] + parseInt(amount)
          : paramValues[base] - parseInt(amount);
      }
      return match;
    });

    onInsertTemplate(contentStr);
    setShowParameterModal(false);
  };

  // Delete template
  const deleteTemplate = (id) => {
    if (confirm("Are you sure you want to delete this template?")) {
      const updatedTemplates = templates.filter((t) => t.id !== id);
      setTemplates(updatedTemplates);
      localStorage.setItem("contentLabTemplates", JSON.stringify(updatedTemplates));
    }
  };

  // Export templates
  const exportTemplates = () => {
    const dataStr = JSON.stringify(templates, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `templates_${Date.now()}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  // Import templates
  const importTemplates = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          const merged = [...templates, ...imported];
          setTemplates(merged);
          localStorage.setItem("contentLabTemplates", JSON.stringify(merged));
          alert(`Imported ${imported.length} templates successfully!`);
        } catch (error) {
          alert("Error importing templates: " + error.message);
        }
      };
      reader.readAsText(file);
    }
  };

  // Filter templates
  const filteredTemplates = templates
    .filter(t => selectedCategory === "all" || t.category === selectedCategory)
    .filter(t => 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      JSON.stringify(t.content).toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      // Sort by usage count (frequently used first)
      return (b.usageCount || 0) - (a.usageCount || 0);
    });

  return (
    <div className="template-library h-full flex flex-col bg-white">
      {/* Header with Mode Toggle */}
      <div className="p-3 bg-gray-50 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-800">Template Library</h3>
          
          {/* Mode Toggle */}
          <div className="flex gap-1 bg-gray-200 p-1 rounded-lg">
            <button
              onClick={() => setLibraryMode("templates")}
              className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                libraryMode === "templates"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              📋 Templates
            </button>
            <button
              onClick={() => setLibraryMode("builder")}
              className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                libraryMode === "builder"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              🔧 Builder
            </button>
          </div>
        </div>

        {/* Template Mode Controls */}
        {libraryMode === "templates" && (
          <>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setShowSaveDialog(true)}
                className="px-3 py-1.5 bg-green-500 text-white text-sm rounded hover:bg-green-600 flex items-center gap-1"
              >
                <span>💾</span> Save Selection
              </button>
              <button
                onClick={exportTemplates}
                className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 flex items-center gap-1"
              >
                <span>📤</span> Export
              </button>
              <label className="px-3 py-1.5 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 cursor-pointer flex items-center gap-1">
                <span>📥</span> Import
                <input
                  type="file"
                  accept=".json"
                  onChange={importTemplates}
                  className="hidden"
                />
              </label>
            </div>

            {/* Search Bar */}
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 pr-10 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  }`}
                >
                  <span className="mr-1">{cat.icon}</span>
                  {cat.name}
                  {cat.id !== "all" && (
                    <span className="ml-1 opacity-70">
                      ({templates.filter(t => t.category === cat.id).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Content Area */}
      {libraryMode === "templates" ? (
        <>
          {/* Save Dialog */}
          {showSaveDialog && (
            <div className="p-3 bg-yellow-50 border-b">
              <div className="mb-2">
                <input
                  type="text"
                  placeholder="Template name..."
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={saveTemplate}
                  className="px-4 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                >
                  Save Template
                </button>
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="px-4 py-2 bg-gray-400 text-white text-sm rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Template Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-3">📭</div>
                <div>No templates found</div>
                <button
                  onClick={loadDefaultTemplates}
                  className="mt-3 px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                >
                  Load Default Templates
                </button>
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`template-card p-4 bg-white border-2 rounded-lg transition-all hover:shadow-lg ${
                      selectedTemplate?.id === template.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {categories.find(c => c.id === template.category)?.icon || "📄"}
                          </span>
                          <h4 className="font-semibold text-gray-800">{template.name}</h4>
                          {template.contentType === "latex" && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                              LaTeX
                            </span>
                          )}
                          {template.usageCount > 0 && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                              Used {template.usageCount}x
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {Object.keys(template.parameters || {}).length} parameters
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => useTemplate(template)}
                          className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                        >
                          Use
                        </button>
                        <button
                          onClick={() => setPreviewExpanded(
                            previewExpanded === template.id ? null : template.id
                          )}
                          className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                        >
                          {previewExpanded === template.id ? "Hide" : "Code"}
                        </button>
                        <button
                          onClick={() => deleteTemplate(template.id)}
                          className="px-2 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    </div>

                    {/* Code Preview */}
                    {previewExpanded === template.id && (
                      <div className="mt-3 p-3 bg-gray-900 rounded-lg overflow-x-auto">
                        <pre className="text-xs text-green-400 font-mono">
                          {template.contentType === "latex" 
                            ? template.content
                            : JSON.stringify(template.content, null, 2)
                          }
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Builder Mode */
        <div className="flex-1 overflow-hidden">
          <BuilderPanel 
            onInsertTemplate={onInsertTemplate}
            currentContent={currentContent}
            setContent={setContent}
            contentType={parentContentType}
            setContentType={parentSetContentType}
          />
        </div>
      )}

      {/* Parameter Modal */}
      {showParameterModal && templateToUse && (
        <TemplateParameterModal
          template={templateToUse}
          onConfirm={(params) => insertTemplateContent(templateToUse, params)}
          onCancel={() => setShowParameterModal(false)}
        />
      )}
    </div>
  );
};

export default TemplateLibrary;
