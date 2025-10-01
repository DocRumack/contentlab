import React from 'react';

// Test 1: const arrow function with JSX (React Component)
const TestComponent = ({ name }) => {
  return (
    <div>
      TEST2: Hello {name}!
    </div>
  );
}
  );
};

// Test 2: const arrow function without JSX
const calculateSum = (a, b) => {
  const result = a + b;
  return result;
};

// Test 3: regular function
function regularFunction(x) {
  return x * 2;
}

// Test 4: class method (if needed)
class TestClass {
  methodName(param) {
    return param + 1;
  }
}

export { TestComponent, calculateSum, regularFunction, TestClass };
