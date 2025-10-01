// ToolButton.jsx - Simplified for Content Creation Lab

import React from 'react';
import PropTypes from 'prop-types';

const ToolButton = ({ color = "#ca8a04", onClick, toolName }) => {
  return (
    <button
      onClick={onClick}
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: color,
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '18px',
        fontWeight: 'bold',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}
      title={toolName || "Tool"}
    >
      T
    </button>
  );
};

ToolButton.propTypes = {
  color: PropTypes.string,
  onClick: PropTypes.func,
  toolName: PropTypes.string
};

export default ToolButton;
