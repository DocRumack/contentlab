import { useState, useEffect } from "react";

const TemplateParameterModal = ({ template, onConfirm, onCancel }) => {
  const [paramValues, setParamValues] = useState({});
  const [previewContent, setPreviewContent] = useState("");

  // Initialize parameter values with defaults
  useEffect(() => {
    const defaults = {};
    Object.entries(template.parameters || {}).forEach(([key, config]) => {
      defaults[key] = config.default || "";
    });
    setParamValues(defaults);
  }, [template]);

  // Update preview when parameters change
  useEffect(() => {
    updatePreview();
  }, [paramValues]);

  const updatePreview = () => {
    let contentStr;
    
    if (template.contentType === "latex") {
      contentStr = template.content;
    } else {
      contentStr = JSON.stringify(template.content, null, 2);
    }

    // Replace parameters in preview
    Object.entries(paramValues).forEach(([key, value]) => {
      contentStr = contentStr.replace(new RegExp(`{{${key}}}`, 'g'), value);
      
      // Handle conditional sections
      if (typeof value === 'boolean') {
        const conditionalRegex = new RegExp(`{{#${key}}}([\\s\\S]*?){{/${key}}}`, 'g');
        contentStr = contentStr.replace(conditionalRegex, value ? '$1' : '');
      }
    });

    // Handle computed parameters
    const computedRegex = /\{\{(\w+)(plus|minus)(\d+)\}\}/g;
    contentStr = contentStr.replace(computedRegex, (match, base, op, amount) => {
      if (paramValues[base]) {
        return op === 'plus' 
          ? parseInt(paramValues[base]) + parseInt(amount)
          : parseInt(paramValues[base]) - parseInt(amount);
      }
      return match;
    });

    setPreviewContent(contentStr);
  };

  const handleParamChange = (key, value, type) => {
    // Convert value based on type
    let typedValue = value;
    if (type === 'number') {
      typedValue = value === '' ? 0 : parseFloat(value);
    } else if (type === 'boolean') {
      typedValue = value === 'true' || value === true;
    }
    
    setParamValues(prev => ({
      ...prev,
      [key]: typedValue
    }));
  };

  const renderParameterInput = (key, config) => {
    const value = paramValues[key];
    
    switch (config.type) {
      case 'number':
        return (
          <div key={key} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {config.label || key}
            </label>
            <input
              type="number"
              value={value || ''}
              onChange={(e) => handleParamChange(key, e.target.value, config.type)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );
      
      case 'boolean':
        return (
          <div key={key} className="mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={value || false}
                onChange={(e) => handleParamChange(key, e.target.checked, config.type)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                {config.label || key}
              </span>
            </label>
          </div>
        );
      
      case 'color':
        return (
          <div key={key} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {config.label || key}
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={value || ''}
                onChange={(e) => handleParamChange(key, e.target.value, config.type)}
                className="w-12 h-10 border rounded cursor-pointer"
              />
              <input
                type="text"
                value={value || ''}
                onChange={(e) => handleParamChange(key, e.target.value, config.type)}
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#000000"
              />
            </div>
          </div>
        );
      
      case 'select':
        return (
          <div key={key} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {config.label || key}
            </label>
            <select
              value={value || ''}
              onChange={(e) => handleParamChange(key, e.target.value, config.type)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {config.options?.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        );
      
      default: // text
        return (
          <div key={key} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {config.label || key}
            </label>
            <input
              type="text"
              value={value || ''}
              onChange={(e) => handleParamChange(key, e.target.value, config.type)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );
    }
  };

  // Group parameters by category if specified
  const groupedParams = {};
  Object.entries(template.parameters || {}).forEach(([key, config]) => {
    const group = config.group || 'General';
    if (!groupedParams[group]) {
      groupedParams[group] = {};
    }
    groupedParams[group][key] = config;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Configure: {template.name}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Set parameters for your template
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Parameters Panel */}
          <div className="w-1/3 p-6 border-r overflow-y-auto">
            <h3 className="font-semibold text-gray-700 mb-4">Parameters</h3>
            
            {Object.entries(groupedParams).map(([group, params]) => (
              <div key={group}>
                {Object.keys(groupedParams).length > 1 && (
                  <h4 className="text-sm font-medium text-gray-500 mb-2 mt-4 first:mt-0">
                    {group}
                  </h4>
                )}
                {Object.entries(params).map(([key, config]) =>
                  renderParameterInput(key, config)
                )}
              </div>
            ))}
          </div>

          {/* Preview Panel */}
          <div className="flex-1 p-6 overflow-y-auto">
            <h3 className="font-semibold text-gray-700 mb-4">Preview</h3>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                {previewContent}
              </pre>
            </div>
            
            {/* Quick Actions */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 <strong>Tip:</strong> The preview shows the code that will be inserted. 
                Parameters are replaced with your values.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-between">
          <button
            onClick={() => {
              const defaults = {};
              Object.entries(template.parameters || {}).forEach(([key, config]) => {
                defaults[key] = config.default || "";
              });
              setParamValues(defaults);
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Reset to Defaults
          </button>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(paramValues)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Insert Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateParameterModal;
