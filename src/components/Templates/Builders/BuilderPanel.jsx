// BuilderPanel.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import EquationBuilder from './EquationBuilder';

/**
 * BuilderPanel - Main container for interactive content builders
 * Manages different builder types and provides live preview
 */
const BuilderPanel = ({ onInsertTemplate, currentContent, setContent, contentType, setContentType }) => {
  const [activeBuilder, setActiveBuilder] = useState('equation');
  const [previewLatex, setPreviewLatex] = useState('');
  const [previewContent, setPreviewContent] = useState(null);

  // Available builders
  const builders = [
    { id: 'equation', name: 'Equation Builder', icon: '∑', component: EquationBuilder },
    { id: 'triangle', name: 'Triangle Builder', icon: '△', component: null, coming: true },
    { id: 'graph', name: 'Graph Builder', icon: '📈', component: null, coming: true },
    { id: 'fraction', name: 'Fraction Builder', icon: '½', component: null, coming: true },
    { id: 'matrix', name: 'Matrix Builder', icon: '⊞', component: null, coming: true },
  ];

  // Get the active builder component
  const ActiveBuilderComponent = builders.find(b => b.id === activeBuilder)?.component;

  // Handle LaTeX updates from builders
  const handleLatexUpdate = (latex) => {
    setPreviewLatex(latex);
    
    // Create preview content
    if (latex) {
      const content = [
        {
          type: "formula",
          content: latex
        }
      ];
      setPreviewContent(JSON.stringify(content, null, 2));
    } else {
      setPreviewContent(null);
    }
  };

  return (
    <div className="builder-panel h-full flex flex-col">
      {/* Builder Type Selector */}
      <div className="p-3 bg-gray-50 border-b">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Builder Mode</h3>
        <div className="flex gap-2 flex-wrap">
          {builders.map(builder => (
            <button
              key={builder.id}
              onClick={() => !builder.coming && setActiveBuilder(builder.id)}
              disabled={builder.coming}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                activeBuilder === builder.id
                  ? 'bg-blue-500 text-white shadow-md'
                  : builder.coming
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <span className="text-lg">{builder.icon}</span>
              <span>{builder.name}</span>
              {builder.coming && (
                <span className="text-xs bg-yellow-200 text-yellow-800 px-1 rounded">Soon</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Active Builder */}
      <div className="flex-1 overflow-y-auto">
        {ActiveBuilderComponent ? (
          <ActiveBuilderComponent
            onInsertTemplate={onInsertTemplate}
            onLatexUpdate={handleLatexUpdate}
            currentContent={currentContent}
            setContent={setContent}
            contentType={contentType}
            setContentType={setContentType}
          />
        ) : (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-3">🚧</div>
            <div className="text-lg font-medium">Coming Soon!</div>
            <div className="text-sm mt-2">This builder is under development</div>
          </div>
        )}
      </div>

      {/* Live Preview Panel */}
      {previewContent && (
        <div className="p-3 bg-gray-50 border-t">
          <div className="mb-2">
            <h4 className="text-sm font-semibold text-gray-700">Live Preview JSON:</h4>
          </div>
          <div className="bg-gray-900 rounded-lg p-3 max-h-32 overflow-y-auto">
            <pre className="text-xs text-green-400 font-mono">
              {previewContent}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

BuilderPanel.propTypes = {
  onInsertTemplate: PropTypes.func.isRequired,
  currentContent: PropTypes.string
};

export default BuilderPanel;
