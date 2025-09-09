import React from 'react';

export default function Label({ children, ...props }) {
  return (
    <label data-testid="ui-label" {...props}>
      {children}
    </label>
  );
}
