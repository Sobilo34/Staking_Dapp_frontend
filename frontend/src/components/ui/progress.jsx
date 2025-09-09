
import React from 'react';

const Progress = React.forwardRef(({ className = '', value = 0, ...props }, ref) => (
  <div
    ref={ref}
    className={`progress ${className}`.trim()}
    {...props}
  >
    <div
      className="progress-bar"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
));
Progress.displayName = 'Progress';

export { Progress };

