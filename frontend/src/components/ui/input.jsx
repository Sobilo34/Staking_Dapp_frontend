import React from 'react';

const Input = React.forwardRef(({ className = '', type = 'text', ...props }, ref) => {
  return (
    <input
      type={type}
      className={`form-input ${className}`.trim()}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };
