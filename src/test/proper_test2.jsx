import React from 'react';

const TestComponent = ({ name }) => {
  return (
    <div>
      <h1>MODIFIED without closures</h1>
      <p>Hello {name}</p>
    </div>
  );
};

export default TestComponent;