import React from 'react';

const Badge = React.forwardRef(({ className = '', variant = 'primary', children, ...props }, ref) => {
  const variantClasses = {
    primary: 'badge-primary',
    secondary: 'badge-secondary',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger'
  };

  const classes = `badge ${variantClasses[variant]} ${className}`.trim();

  return (
    <div
      ref={ref}
      className={classes}
      {...props}
    >
      {children}
    </div>
  );
});
Badge.displayName = 'Badge';

export { Badge };
