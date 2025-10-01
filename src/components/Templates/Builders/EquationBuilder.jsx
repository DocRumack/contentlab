import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Enhanced Equation Builder with hierarchical row structure
 * Fractions and other complex elements create sub-rows below
 */
const EquationBuilder = ({ onInsertTemplate, onLatexUpdate, setContent, contentType, setContentType, currentContent }) => {
  // Kit types
  const KIT_TYPES = {
    SIMPLE: 'simple',
    FRACTION: 'fraction',
    SUMMATION: 'sum',
    INTEGRAL: 'integral',
    SQRT: 'sqrt',
  };

  // Color palette for highlighting
  const COLORS = [
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#10b981', // green
    '#f59e0b', // orange
    '#ef4444', // red
    '#06b6d4', // cyan
    '#ec4899', // pink
  ];

  // Generate unique IDs
  let idCounter = 0;
  const generateId = () => `id_${Date.now()}_${idCounter++}`;

  // Create a new simple kit
  const createKit = (content = '', type = KIT_TYPES.SIMPLE) => ({
    id: generateId(),
    type,
    content,
    leftSpace: '',
    rightSpace: '',
    useAmpersand: false,
    // For complex types, store IDs of their sub-rows
    numeratorRowId: type === KIT_TYPES.FRACTION ? generateId() : null,
    denominatorRowId: type === KIT_TYPES.FRACTION ? generateId() : null,
    expressionRowId: (type === KIT_TYPES.SUMMATION || type === KIT_TYPES.INTEGRAL || type === KIT_TYPES.SQRT) ? generateId() : null,
    lowerBound: type === KIT_TYPES.SUMMATION || type === KIT_TYPES.INTEGRAL ? '' : null,
    upperBound: type === KIT_TYPES.SUMMATION || type === KIT_TYPES.INTEGRAL ? '' : null,
    colorIndex: null
  });

  // Create a new row
  const createRow = (parentKitId = null, rowType = 'main') => ({
    id: generateId(),
    parentKitId,
    rowType, // 'main', 'numerator', 'denominator', 'expression'
    leftKits: [createKit()],
    equalKit: rowType === 'main' ? { content: '=', leftSpace: '', rightSpace: '', useAmpersand: false } : null,
    rightKits: rowType === 'main' ? [createKit()] : null
  });

  // ==================== LATEX PARSER FUNCTIONS ====================
  
  /**
   * Parse LaTeX string into builder kit structure
   */
  const parseLatexToBuilder = (latex) => {
    try {
      // Remove $ delimiters if present
      latex = latex.replace(/^\$+/, '').replace(/\$+$/, '').trim();
      
      // Check for array environment (multi-row equations)
      if (latex.includes('\\begin{array}')) {
        return parseArrayEnvironment(latex);
      }
      
      // Single equation/expression
      return [parseSingleRow(latex)];
    } catch (error) {
      console.error('Error parsing LaTeX:', error);
      alert('Failed to parse LaTeX. Please check the format.');
      return null;
    }
  };

  /**
   * Parse array environment for multi-row equations
   */
  const parseArrayEnvironment = (latex) => {
    // Extract content between \begin{array} and \end{array}
    const match = latex.match(/\\begin\{array\}.*?\n?([\s\S]*?)\\end\{array\}/);
    if (!match) return [parseSingleRow(latex)];
    
    const content = match[1];
    // Split by \\ for rows
    const rowStrings = content.split(/\\\\/);
    
    return rowStrings
      .filter(row => row.trim())
      .map(row => parseSingleRow(row.trim()));
  };

  /**
   * Parse a single row of LaTeX
   */
  const parseSingleRow = (latex) => {
    latex = latex.trim();
    
    // Check if it's an equation (has =) or expression
    const hasEquals = latex.includes('=');
    
    if (hasEquals) {
      const equalIndex = latex.indexOf('=');
      const leftSide = latex.substring(0, equalIndex).trim();
      const rightSide = latex.substring(equalIndex + 1).trim();
      
      return {
        id: generateId(),
        parentKitId: null,
        rowType: 'main',
        leftKits: parseExpression(leftSide),
        equalKit: { 
          content: '=', 
          leftSpace: '', 
          rightSpace: '', 
          useAmpersand: false 
        },
        rightKits: parseExpression(rightSide)
      };
    } else {
      return {
        id: generateId(),
        parentKitId: null,
        rowType: 'main',
        leftKits: parseExpression(latex),
        equalKit: null,
        rightKits: null
      };
    }
  };

  /**
   * Parse an expression into an array of kits
   */
  const parseExpression = (expr) => {
    if (!expr || !expr.trim()) {
      return [createKit()];
    }
    
    const kits = [];
    let currentPos = 0;
    
    while (currentPos < expr.length) {
      // Skip whitespace
      while (currentPos < expr.length && expr[currentPos] === ' ') {
        currentPos++;
      }
      
      if (currentPos >= expr.length) break;
      
      // Check for special structures
      if (expr.substring(currentPos).startsWith('\\frac{')) {
        const fractionKit = parseFraction(expr, currentPos);
        if (fractionKit) {
          kits.push(fractionKit.kit);
          currentPos = fractionKit.endPos;
          // Store sub-rows for later addition
          if (fractionKit.subRows) {
            fractionKit.kit._subRows = fractionKit.subRows;
          }
          continue;
        }
      }
      
      if (expr.substring(currentPos).startsWith('\\sqrt{')) {
        const sqrtKit = parseSqrt(expr, currentPos);
        if (sqrtKit) {
          kits.push(sqrtKit.kit);
          currentPos = sqrtKit.endPos;
          if (sqrtKit.subRows) {
            sqrtKit.kit._subRows = sqrtKit.subRows;
          }
          continue;
        }
      }
      
      // Parse regular terms and operators
      const termKit = parseSimpleTerm(expr, currentPos);
      if (termKit) {
        kits.push(termKit.kit);
        currentPos = termKit.endPos;
      } else {
        currentPos++;
      }
    }
    
    return kits.length > 0 ? kits : [createKit()];
  };

  /**
   * Parse a fraction structure
   */
  const parseFraction = (expr, startPos) => {
    // Match nested braces properly
    let pos = startPos + 6; // Skip "\frac{"
    let braceCount = 1;
    let numeratorEnd = -1;
    
    // Find end of numerator
    while (pos < expr.length && braceCount > 0) {
      if (expr[pos] === '{') braceCount++;
      else if (expr[pos] === '}') {
        braceCount--;
        if (braceCount === 0) {
          numeratorEnd = pos;
        }
      }
      pos++;
    }
    
    if (numeratorEnd === -1 || pos >= expr.length || expr[pos] !== '{') {
      return null;
    }
    
    // Find end of denominator
    pos++; // Skip opening brace of denominator
    braceCount = 1;
    let denominatorEnd = -1;
    
    while (pos < expr.length && braceCount > 0) {
      if (expr[pos] === '{') braceCount++;
      else if (expr[pos] === '}') {
        braceCount--;
        if (braceCount === 0) {
          denominatorEnd = pos;
        }
      }
      pos++;
    }
    
    if (denominatorEnd === -1) return null;
    
    const numerator = expr.substring(startPos + 6, numeratorEnd);
    const denominator = expr.substring(numeratorEnd + 2, denominatorEnd);
    
    const kit = createKit('', KIT_TYPES.FRACTION);
    kit.colorIndex = 0; // Default color
    
    const numRow = {
      id: kit.numeratorRowId,
      parentKitId: kit.id,
      rowType: 'numerator',
      leftKits: parseExpression(numerator),
      equalKit: null,
      rightKits: null
    };
    
    const denRow = {
      id: kit.denominatorRowId,
      parentKitId: kit.id,
      rowType: 'denominator',
      leftKits: parseExpression(denominator),
      equalKit: null,
      rightKits: null
    };
    
    return {
      kit,
      subRows: [numRow, denRow],
      endPos: denominatorEnd + 1
    };
  };

  /**
   * Parse a square root structure
   */
  const parseSqrt = (expr, startPos) => {
    // Match content in braces
    let pos = startPos + 6; // Skip "\sqrt{"
    let braceCount = 1;
    let contentEnd = -1;
    
    while (pos < expr.length && braceCount > 0) {
      if (expr[pos] === '{') braceCount++;
      else if (expr[pos] === '}') {
        braceCount--;
        if (braceCount === 0) {
          contentEnd = pos;
        }
      }
      pos++;
    }
    
    if (contentEnd === -1) return null;
    
    const content = expr.substring(startPos + 6, contentEnd);
    
    const kit = createKit('', KIT_TYPES.SQRT);
    kit.colorIndex = 2; // Default green color
    
    const exprRow = {
      id: kit.expressionRowId,
      parentKitId: kit.id,
      rowType: 'expression',
      leftKits: parseExpression(content),
      equalKit: null,
      rightKits: null
    };
    
    return {
      kit,
      subRows: [exprRow],
      endPos: contentEnd + 1
    };
  };

  /**
   * Parse a simple term (number, variable, operator)
   */
  const parseSimpleTerm = (expr, startPos) => {
    // Skip \hspace commands
    if (expr.substring(startPos).startsWith('\\hspace{')) {
      const match = expr.substring(startPos).match(/^\\hspace\{([^}]*)\}/);
      if (match) {
        return {
          kit: createKit(''),
          endPos: startPos + match[0].length
        };
      }
    }
    
    // Skip other LaTeX commands we don't handle yet
    if (expr[startPos] === '\\') {
      const match = expr.substring(startPos).match(/^\\[a-zA-Z]+/);
      if (match) {
        return {
          kit: createKit(match[0]),
          endPos: startPos + match[0].length
        };
      }
    }
    
    // Match operators
    if (['+', '-', '*', '/', '±'].includes(expr[startPos])) {
      return {
        kit: createKit(expr[startPos]),
        endPos: startPos + 1
      };
    }
    
    // Match numbers and variables
    const match = expr.substring(startPos).match(/^[a-zA-Z0-9]+/);
    if (match) {
      return {
        kit: createKit(match[0]),
        endPos: startPos + match[0].length
      };
    }
    
    // Match parentheses
    if (['(', ')', '[', ']', '{', '}'].includes(expr[startPos])) {
      return {
        kit: createKit(expr[startPos]),
        endPos: startPos + 1
      };
    }
    
    // Single character
    return {
      kit: createKit(expr[startPos]),
      endPos: startPos + 1
    };
  };

  /**
   * Import LaTeX from current content
   */
  const importLatexFromContent = () => {
    try {
      let latexToImport = '';
      
      // Get content based on contentType
      if (contentType === 'latex') {
        latexToImport = currentContent;
      } else if (contentType === 'json') {
        // Try to parse JSON and extract LaTeX
        try {
          const parsed = JSON.parse(currentContent);
          if (Array.isArray(parsed) && parsed[0]?.content) {
            latexToImport = parsed[0].content;
          } else if (parsed.content) {
            latexToImport = parsed.content;
          } else if (typeof parsed === 'string') {
            latexToImport = parsed;
          }
        } catch (e) {
          // If JSON parse fails, try as raw LaTeX
          latexToImport = currentContent;
        }
      } else {
        latexToImport = currentContent;
      }
      
      if (!latexToImport || !latexToImport.trim()) {
        alert('No LaTeX content found to import');
        return;
      }
      
      // Parse LaTeX
      const parsedRows = parseLatexToBuilder(latexToImport);
      if (!parsedRows) return;
      
      // Collect all rows including sub-rows
      const allRows = [];
      parsedRows.forEach(row => {
        allRows.push(row);
        // Add sub-rows from kits
        [...(row.leftKits || []), ...(row.rightKits || [])]
          .forEach(kit => {
            if (kit._subRows) {
              allRows.push(...kit._subRows);
              delete kit._subRows;
            }
          });
      });
      
      // Update state with new rows
      setRows(allRows);
      setIsExpression(!parsedRows[0]?.equalKit);
      
      // Reset other settings
      setSelectedKitId(null);
      setColorCounter(3);
      
      alert('LaTeX imported successfully!');
    } catch (error) {
      console.error('Import error:', error);
      alert('Failed to import LaTeX: ' + error.message);
    }
  };

  // Initialize state
  const [rows, setRows] = useState([createRow()]);
  const [selectedKitId, setSelectedKitId] = useState(null);
  const [rowSpacing, setRowSpacing] = useState(['', '1em']);
  const [useAlign, setUseAlign] = useState(true);
  const [isExpression, setIsExpression] = useState(false);
  const [colorCounter, setColorCounter] = useState(0);

  // Find a kit by ID in all rows
  const findKit = (kitId) => {
    for (const row of rows) {
      for (const kit of row.leftKits) {
        if (kit.id === kitId) return { kit, row, section: 'leftKits' };
      }
      if (row.rightKits) {
        for (const kit of row.rightKits) {
          if (kit.id === kitId) return { kit, row, section: 'rightKits' };
        }
      }
    }
    return null;
  };

  // Get all sub-rows for a kit
  const getSubRows = (kit) => {
    const subRows = [];
    if (kit.type === KIT_TYPES.FRACTION) {
      const numRow = rows.find(r => r.id === kit.numeratorRowId);
      const denRow = rows.find(r => r.id === kit.denominatorRowId);
      if (numRow) subRows.push(numRow);
      if (denRow) subRows.push(denRow);
    } else if (kit.expressionRowId) {
      const exprRow = rows.find(r => r.id === kit.expressionRowId);
      if (exprRow) subRows.push(exprRow);
    }
    return subRows;
  };

  // Generate LaTeX for a kit and its sub-rows
  const generateKitLatex = (kit) => {
    let latex = '';
    
    if (kit.leftSpace) {
      latex += `\\hspace{${kit.leftSpace}}`;
    }
    
    if (kit.type === KIT_TYPES.SIMPLE) {
      if (kit.content && kit.content.trim()) {
        // Check for parentheses and convert to auto-scaling
        let content = kit.content;
        // Replace ( with \left( and ) with \right)
        content = content.replace(/\(/g, '\\left(');
        content = content.replace(/\)/g, '\\right)');
        // Also handle brackets and braces
        content = content.replace(/\[/g, '\\left[');
        content = content.replace(/\]/g, '\\right]');
        content = content.replace(/\{/g, '\\left\\{');
        content = content.replace(/\}/g, '\\right\\}');
        latex += content;
      }
    } else if (kit.type === KIT_TYPES.FRACTION) {
      const numRow = rows.find(r => r.id === kit.numeratorRowId);
      const denRow = rows.find(r => r.id === kit.denominatorRowId);
      
      let numerator = '';
      let denominator = '';
      
      if (numRow) {
        numerator = numRow.leftKits.map(k => generateKitLatex(k)).filter(l => l).join(' ');
      }
      if (denRow) {
        denominator = denRow.leftKits.map(k => generateKitLatex(k)).filter(l => l).join(' ');
      }
      
      latex += `\\frac{${numerator}}{${denominator}}`;
    } else if (kit.type === KIT_TYPES.SUMMATION) {
      const exprRow = rows.find(r => r.id === kit.expressionRowId);
      let expression = '';
      if (exprRow) {
        expression = exprRow.leftKits.map(k => generateKitLatex(k)).filter(l => l).join(' ');
      }
      latex += `\\sum_{${kit.lowerBound}}^{${kit.upperBound}} ${expression}`;
    } else if (kit.type === KIT_TYPES.INTEGRAL) {
      const exprRow = rows.find(r => r.id === kit.expressionRowId);
      let expression = '';
      if (exprRow) {
        expression = exprRow.leftKits.map(k => generateKitLatex(k)).filter(l => l).join(' ');
      }
      latex += `\\int_{${kit.lowerBound}}^{${kit.upperBound}} ${expression} \\, dx`;
    } else if (kit.type === KIT_TYPES.SQRT) {
      const exprRow = rows.find(r => r.id === kit.expressionRowId);
      let expression = '';
      if (exprRow) {
        expression = exprRow.leftKits.map(k => generateKitLatex(k)).filter(l => l).join(' ');
      }
      latex += `\\sqrt{${expression}}`;
    }
    
    if (kit.rightSpace) {
      latex += `\\hspace{${kit.rightSpace}}`;
    }
    
    return latex;
  };

  // Generate complete LaTeX
  const generateLatex = () => {
    // Only process main rows
    const mainRows = rows.filter(r => r.rowType === 'main');
    if (mainRows.length === 0) return '';

    const latexRows = mainRows.map((row) => {
      let parts = [];
      
      // Left side
      row.leftKits.forEach((kit, idx) => {
        if (kit.useAmpersand && idx > 0) {
          parts.push('&');
        }
        const kitLatex = generateKitLatex(kit);
        if (kitLatex) parts.push(kitLatex);
      });
      
      // Equal sign
      if (!isExpression && row.equalKit) {
        if (row.equalKit.useAmpersand) {
          parts.push('&');
        }
        if (row.equalKit.leftSpace) {
          parts.push(`\\hspace{${row.equalKit.leftSpace}}`);
        }
        parts.push(row.equalKit.content);
        if (row.equalKit.rightSpace) {
          parts.push(`\\hspace{${row.equalKit.rightSpace}}`);
        }
        
        // Right side
        if (row.rightKits) {
          row.rightKits.forEach((kit, idx) => {
            if (kit.useAmpersand && idx > 0) {
              parts.push('&');
            }
            const kitLatex = generateKitLatex(kit);
            if (kitLatex) parts.push(kitLatex);
          });
        }
      }
      
      return parts.filter(p => p).join(' ');
    });
    
    let latex = '';
    if (useAlign) {
      // KaTeX uses array instead of align
      // Count max ampersands to determine column count
      let maxCols = 1;
      latexRows.forEach(row => {
        const ampCount = (row.match(/&/g) || []).length + 1;
        maxCols = Math.max(maxCols, ampCount);
      });
      
      // Create column spec (all left-aligned)
      const colSpec = 'l'.repeat(maxCols);
      
      latex = `\\begin{array}{${colSpec}}\n`;
      latexRows.forEach((row, idx) => {
        latex += row;
        if (idx < latexRows.length - 1) {
          latex += ` \\\\`;
        }
        latex += '\n';
      });
      latex += `\\end{array}`;
    } else {
      latex = latexRows.join(` \\\\ `);
    }
    
    return `$${latex}$`;
  };

  // Update content directly when equation changes
  useEffect(() => {
    const latex = generateLatex();
    if (setContent) {
      // Always update the EditorPanel content
      if (!contentType || contentType === 'latex') {
        // Default to LaTeX mode or when in LaTeX mode
        setContent(latex.replace(/^\$/, '').replace(/\$$/, ''));
        // Ensure we're in LaTeX mode if not set
        if (!contentType && setContentType) {
          setContentType('latex');
        }
      } else if (contentType === 'json') {
        // For JSON mode, wrap in content structure
        const jsonContent = [
          {
            type: "formula",
            content: latex
          }
        ];
        setContent(JSON.stringify(jsonContent, null, 2));
      } else {
        // For any other mode, default to LaTeX
        setContent(latex.replace(/^\$/, '').replace(/\$$/, ''));
      }
    }
    // Still call onLatexUpdate for preview if provided
    if (onLatexUpdate) {
      onLatexUpdate(latex);
    }
  }, [rows, useAlign, isExpression, contentType, setContent, setContentType, onLatexUpdate]);

  // Convert a selected kit to a complex type
  // Initialize to LaTeX mode on mount if not already set
  useEffect(() => {
    if (!contentType && setContentType) {
      setContentType('latex');
    }
  }, []); // Run only on mount

  const convertKitToType = (newType) => {
    if (!selectedKitId) return;
    
    const found = findKit(selectedKitId);
    if (!found || found.kit.type !== KIT_TYPES.SIMPLE) return;
    
    const newRows = [...rows];
    const kit = found.kit;
    
    // Update kit type
    kit.type = newType;
    kit.colorIndex = colorCounter % COLORS.length;
    setColorCounter(colorCounter + 1);
    
    // Create sub-rows based on type
    if (newType === KIT_TYPES.FRACTION) {
      const numRow = createRow(kit.id, 'numerator');
      const denRow = createRow(kit.id, 'denominator');
      kit.numeratorRowId = numRow.id;
      kit.denominatorRowId = denRow.id;
      newRows.push(numRow, denRow);
    } else if (newType === KIT_TYPES.SUMMATION || newType === KIT_TYPES.INTEGRAL) {
      const exprRow = createRow(kit.id, 'expression');
      kit.expressionRowId = exprRow.id;
      kit.lowerBound = newType === KIT_TYPES.SUMMATION ? 'i=1' : 'a';
      kit.upperBound = newType === KIT_TYPES.SUMMATION ? 'n' : 'b';
      newRows.push(exprRow);
    } else if (newType === KIT_TYPES.SQRT) {
      const exprRow = createRow(kit.id, 'expression');
      kit.expressionRowId = exprRow.id;
      newRows.push(exprRow);
    }
    
    setRows(newRows);
  };

  // Add a kit to a row
  const addKit = (rowId, section = 'left', position = 'end') => {
    const newRows = [...rows];
    const row = newRows.find(r => r.id === rowId);
    if (!row) return;
    
    const newKit = createKit();
    
    if (section === 'left') {
      if (position === 'start') {
        row.leftKits.unshift(newKit);
      } else {
        row.leftKits.push(newKit);
      }
    } else if (section === 'right' && row.rightKits) {
      if (position === 'start') {
        row.rightKits.unshift(newKit);
      } else {
        row.rightKits.push(newKit);
      }
    }
    
    setRows(newRows);
  };

  // Remove a kit
  const removeKit = (kitId) => {
    const found = findKit(kitId);
    if (!found) return;
    
    const newRows = [...rows];
    const { kit, row, section } = found;
    
    // Remove sub-rows if it's a complex kit
    if (kit.type !== KIT_TYPES.SIMPLE) {
      const subRowIds = [kit.numeratorRowId, kit.denominatorRowId, kit.expressionRowId].filter(id => id);
      // Recursively remove sub-rows
      const removeRowAndChildren = (rowId) => {
        const rowIndex = newRows.findIndex(r => r.id === rowId);
        if (rowIndex !== -1) {
          const rowToRemove = newRows[rowIndex];
          // Remove all kits' sub-rows in this row
          rowToRemove.leftKits.forEach(k => {
            if (k.type !== KIT_TYPES.SIMPLE) {
              [k.numeratorRowId, k.denominatorRowId, k.expressionRowId].filter(id => id).forEach(removeRowAndChildren);
            }
          });
          newRows.splice(rowIndex, 1);
        }
      };
      subRowIds.forEach(removeRowAndChildren);
    }
    
    // Remove the kit itself
    const kitIndex = row[section].findIndex(k => k.id === kitId);
    if (kitIndex !== -1 && row[section].length > 1) {
      row[section].splice(kitIndex, 1);
    }
    
    setRows(newRows);
  };

  // Update kit field
  const updateKit = (kitId, field, value) => {
    const newRows = [...rows];
    const found = findKit(kitId);
    if (found) {
      found.kit[field] = value;
    }
    setRows(newRows);
  };

  // Render a kit with its sub-rows inline
  const renderKitWithSubRows = (kit, row, depth = 0) => {
    const isSelected = selectedKitId === kit.id;
    const color = kit.colorIndex !== null ? COLORS[kit.colorIndex] : null;
    
    return (
      <div key={kit.id} className="inline-block align-top">
        {/* The kit itself */}
        <div className="flex items-center gap-1 mb-2">
          {/* Alignment checkbox */}
          {row.leftKits.indexOf(kit) > 0 && (
            <input
              type="checkbox"
              checked={kit.useAmpersand}
              onChange={(e) => updateKit(kit.id, 'useAmpersand', e.target.checked)}
              className="mx-1"
              title="Alignment &"
            />
          )}
          
          {/* Kit container */}
          <div 
            className={`flex flex-col gap-1 border-2 rounded p-1 bg-white cursor-pointer ${
              isSelected ? 'ring-2 ring-blue-500' : ''
            }`}
            style={{ 
              width: '75px',
              borderColor: color || '#d1d5db',
              backgroundColor: kit.type !== KIT_TYPES.SIMPLE ? (color + '20') : 'white'
            }}
            onClick={() => setSelectedKitId(kit.id)}
          >
            {kit.type === KIT_TYPES.SIMPLE ? (
              <>
                <input
                  type="text"
                  value={kit.content}
                  onChange={(e) => updateKit(kit.id, 'content', e.target.value)}
                  placeholder="..."
                  className="w-full px-1 py-0.5 border rounded text-sm font-mono text-center"
                  style={{ fontSize: '11px' }}
                  onFocus={() => setSelectedKitId(kit.id)}
                  onFocus={() => setSelectedKitId(kit.id)}
                    onClick={(e) => {
                  e.stopPropagation();
                  setSelectedKitId(kit.id);
                }}
                />
                
                <div className="flex gap-0.5">
                  <input
                    type="text"
                    value={kit.leftSpace}
                    onChange={(e) => updateKit(kit.id, 'leftSpace', e.target.value)}
                    placeholder="←"
                    className="w-1/2 px-0.5 text-xs border rounded"
                    style={{ fontSize: '9px' }}
                    title="Left spacing"
                    onFocus={() => setSelectedKitId(kit.id)}
                    onClick={(e) => {
                  e.stopPropagation();
                  setSelectedKitId(kit.id);
                }}
                  />
                  <input
                    type="text"
                    value={kit.rightSpace}
                    onChange={(e) => updateKit(kit.id, 'rightSpace', e.target.value)}
                    placeholder="→"
                    className="w-1/2 px-0.5 text-xs border rounded"
                    style={{ fontSize: '9px' }}
                    title="Right spacing"
                    onFocus={() => setSelectedKitId(kit.id)}
                    onClick={(e) => {
                  e.stopPropagation();
                  setSelectedKitId(kit.id);
                }}
                  />
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="text-xs font-bold">
                  {kit.type === KIT_TYPES.FRACTION && 'FRAC'}
                  {kit.type === KIT_TYPES.SUMMATION && 'Σ'}
                  {kit.type === KIT_TYPES.INTEGRAL && '∫'}
                  {kit.type === KIT_TYPES.SQRT && '√'}
                </div>
                {(kit.type === KIT_TYPES.SUMMATION || kit.type === KIT_TYPES.INTEGRAL) && (
                  <div className="flex gap-0.5 mt-1">
                    <input
                      type="text"
                      value={kit.lowerBound}
                      onChange={(e) => updateKit(kit.id, 'lowerBound', e.target.value)}
                      placeholder="low"
                      className="w-1/2 px-0.5 text-xs border rounded"
                      style={{ fontSize: '8px' }}
                      onFocus={() => setSelectedKitId(kit.id)}
                    onClick={(e) => {
                  e.stopPropagation();
                  setSelectedKitId(kit.id);
                }}
                    />
                    <input
                      type="text"
                      value={kit.upperBound}
                      onChange={(e) => updateKit(kit.id, 'upperBound', e.target.value)}
                      placeholder="up"
                      className="w-1/2 px-0.5 text-xs border rounded"
                      style={{ fontSize: '8px' }}
                      onFocus={() => setSelectedKitId(kit.id)}
                    onClick={(e) => {
                  e.stopPropagation();
                  setSelectedKitId(kit.id);
                }}
                    />
                  </div>
                )}
              </div>
            )}
            
            {/* Remove button */}
            {row.leftKits.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeKit(kit.id);
                }}
                className="text-xs text-red-500 hover:text-red-700"
              >
                ×
              </button>
            )}
          </div>
        </div>
        
        {/* Sub-rows directly below this kit if it's complex */}
        {kit.type !== KIT_TYPES.SIMPLE && (
          <div 
            className="border-l-4 pl-3 ml-2"
            style={{ borderColor: COLORS[kit.colorIndex] }}
          >
            {kit.type === KIT_TYPES.FRACTION && (
              <>
                {(() => {
                  const numRow = rows.find(r => r.id === kit.numeratorRowId);
                  const denRow = rows.find(r => r.id === kit.denominatorRowId);
                  return (
                    <>
                      {numRow && (
                        <div className="mb-2">
                          <div className="text-xs text-gray-600 mb-1">Numerator:</div>
                          <div className="flex flex-wrap items-center gap-1">
                            {numRow.leftKits.map(k => renderKitWithSubRows(k, numRow, depth + 1))}
                            <button
                              onClick={() => addKit(numRow.id, 'left', 'end')}
                              className="ml-2 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}
                      {denRow && (
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Denominator:</div>
                          <div className="flex flex-wrap items-center gap-1">
                            {denRow.leftKits.map(k => renderKitWithSubRows(k, denRow, depth + 1))}
                            <button
                              onClick={() => addKit(denRow.id, 'left', 'end')}
                              className="ml-2 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </>
            )}
            
            {(kit.type === KIT_TYPES.SUMMATION || kit.type === KIT_TYPES.INTEGRAL || kit.type === KIT_TYPES.SQRT) && (
              <>
                {(() => {
                  const exprRow = rows.find(r => r.id === kit.expressionRowId);
                  return exprRow && (
                    <div>
                      <div className="text-xs text-gray-600 mb-1">
                        {kit.type === KIT_TYPES.SQRT && 'Inside √:'}
                        {kit.type === KIT_TYPES.SUMMATION && 'Sum expression:'}
                        {kit.type === KIT_TYPES.INTEGRAL && 'Integral expression:'}
                      </div>
                      <div className="flex flex-wrap items-center gap-1">
                        {exprRow.leftKits.map(k => renderKitWithSubRows(k, exprRow, depth + 1))}
                        <button
                          onClick={() => addKit(exprRow.id, 'left', 'end')}
                          className="ml-2 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  

  // Add new main row
  const addMainRow = () => {
    setRows([...rows, createRow()]);
  };

  // Insert content
  const insertContent = () => {
    const latex = generateLatex();
    if (latex) {
      const content = [{ type: "formula", content: latex }];
      onInsertTemplate(JSON.stringify(content, null, 2));
    }
  };

  return (
    <div className="equation-builder p-4 bg-white rounded-lg h-full overflow-y-auto">
      <div className="mb-4 border-b pb-4">
        <h3 className="text-lg font-semibold mb-3">Hierarchical Equation Builder</h3>
        
        {/* Mode controls */}
        <div className="flex gap-4 mb-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isExpression}
              onChange={(e) => setIsExpression(e.target.checked)}
            />
            <span className="text-sm">Expression Mode (no equals)</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={useAlign}
              onChange={(e) => setUseAlign(e.target.checked)}
            />
            <span className="text-sm">Use align environment</span>
          </label>
        </div>
        
        {/* Convert buttons */}
        <div className="mb-3">
          <span className="text-sm text-gray-600 mr-2">
            {selectedKitId ? 'Convert selected to:' : 'Select a simple element first'}
          </span>
          {selectedKitId && (
            <>
              <button
                onClick={() => convertKitToType(KIT_TYPES.FRACTION)}
                className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs mr-1"
              >
                Fraction
              </button>
              <button
                onClick={() => convertKitToType(KIT_TYPES.SUMMATION)}
                className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs mr-1"
              >
                Σ Sum
              </button>
              <button
                onClick={() => convertKitToType(KIT_TYPES.INTEGRAL)}
                className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs mr-1"
              >
                ∫ Integral
              </button>
              <button
                onClick={() => convertKitToType(KIT_TYPES.SQRT)}
                className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs"
              >
                √ Sqrt
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main rows */}
      <div className="space-y-4">
        {rows.filter(r => r.rowType === 'main').map((row, rowIndex) => (
          <div key={row.id} className="border rounded p-3 bg-gray-50">
            <div className="mb-3">
              <span className="text-sm font-medium">Row {rowIndex + 1}</span>
            </div>
            
            {/* Left side */}
            <div className="mb-3">
              <div className="text-xs text-gray-600 mb-1">Left Side Elements</div>
              <div className="flex flex-wrap items-start gap-1">
                <button
                  onClick={() => addKit(row.id, 'left', 'start')}
                  className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
                >
                  + Element
                </button>
                {row.leftKits.map(kit => renderKitWithSubRows(kit, row, 0))}
                <button
                  onClick={() => addKit(row.id, 'left', 'end')}
                  className="ml-2 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
                >
                  + Element
                </button>
              </div>
            </div>
            
            {/* Equal sign */}
            {!isExpression && row.equalKit && (
              <div className="mb-3">
                <div className="text-xs text-gray-600 mb-1">Equal Sign</div>
                <div className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={row.equalKit.useAmpersand}
                    onChange={(e) => {
                      const newRows = [...rows];
                      row.equalKit.useAmpersand = e.target.checked;
                      setRows(newRows);
                    }}
                    className="mx-1"
                    title="Alignment &"
                  />
                  <div className="flex flex-col gap-1 border rounded p-1 bg-white" style={{ width: '75px' }}>
                    <input
                      type="text"
                      value={row.equalKit.content}
                      onChange={(e) => {
                        const newRows = [...rows];
                        row.equalKit.content = e.target.value;
                        setRows(newRows);
                      }}
                      placeholder="="
                      className="w-full px-1 py-0.5 border rounded text-sm font-mono text-center"
                      style={{ fontSize: '11px' }}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Right side */}
            {!isExpression && row.rightKits && (
              <div className="mb-3">
                <div className="text-xs text-gray-600 mb-1">Right Side Elements</div>
                <div className="flex flex-wrap items-start gap-1">
                  <button
                    onClick={() => addKit(row.id, 'right', 'start')}
                    className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
                  >
                    + Element
                  </button>
                  {row.rightKits.map(kit => renderKitWithSubRows(kit, row, 0))}
                  <button
                    onClick={() => addKit(row.id, 'right', 'end')}
                    className="ml-2 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
                  >
                    + Element
                  </button>
                </div>
              </div>
            )}
            

          </div>
        ))}
        
        <button
          onClick={addMainRow}
          className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
        >
          + Add Row
        </button>
      </div>

      {/* LaTeX Preview */}
      <div className="mt-4 p-3 bg-gray-100 rounded">
        <label className="text-sm text-gray-600 block mb-1">Generated LaTeX:</label>
        <code className="text-xs font-mono block p-2 bg-white rounded border overflow-x-auto">
          {generateLatex()}
        </code>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={insertContent}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
        >
          Insert Equation
        </button>
        <button
          onClick={() => {
            setRows([createRow()]);
            setSelectedKitId(null);
            setRowSpacing(['', '1em']);
            setColorCounter(0);
          }}
          className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded"
        >
          Clear Equation
        </button>
        <button
          onClick={importLatexFromContent}
          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded ml-2"
          title="Import LaTeX from editor panel"
        >
          Import LaTeX
        </button>
        
        {/* Save/Export Options */}
        <div className="border-t pt-2 mt-2">
          <div className="text-xs text-gray-600 mb-2">Save Options:</div>
          <button
            onClick={() => {
              const latex = generateLatex();
              const jsonContent = [{
                type: "formula",
                content: latex
              }];
              // Save to localStorage for later use
              localStorage.setItem('savedEquation', JSON.stringify(jsonContent));
              alert('Equation saved for replacement!');
            }}
            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs mr-2"
          >
            Store for Replace
          </button>
          <button
            onClick={() => {
              const latex = generateLatex();
              const jsonContent = [{
                type: "formula", 
                content: latex
              }];
              navigator.clipboard.writeText(JSON.stringify(jsonContent, null, 2));
              alert('Copied to clipboard!');
            }}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs mr-2"
          >
            Copy JSON
          </button>
          <button
            onClick={() => {
              const latex = generateLatex();
              navigator.clipboard.writeText(latex);
              alert('LaTeX copied to clipboard!');
            }}
            className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded text-xs"
          >
            Copy LaTeX
          </button>
        </div>
      </div>
    </div>
  );
};

EquationBuilder.propTypes = {
  onInsertTemplate: PropTypes.func.isRequired,
  onLatexUpdate: PropTypes.func,
  setContent: PropTypes.func,
  contentType: PropTypes.string,
  setContentType: PropTypes.func,
  currentContent: PropTypes.string
};

export default EquationBuilder;