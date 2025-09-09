import React from 'react';

const Button = React.forwardRef(({ 
  className = '', 
  variant = 'primary', 
  size = 'default', 
  children, 
  ...props 
}, ref) => {
  const baseClasses = 'btn';
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    danger: 'btn-danger'
  };
  const sizeClasses = {
    sm: 'btn-sm',
    default: '',
    lg: 'btn-lg'
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim();

  return (
    <button
      ref={ref}
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };
