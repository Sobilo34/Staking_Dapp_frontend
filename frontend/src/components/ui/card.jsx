import React from 'react';

const Card = React.forwardRef(({ className = '', children, ...props }, ref) => (
  <div
    ref={ref}
    className={`card ${className}`.trim()}
    {...props}
  >
    {children}
  </div>
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef(({ className = '', children, ...props }, ref) => (
  <div
    ref={ref}
    className={`card-header ${className}`.trim()}
    {...props}
  >
    {children}
  </div>
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef(({ className = '', children, ...props }, ref) => (
  <h3
    ref={ref}
    className={`card-title ${className}`.trim()}
    {...props}
  >
    {children}
  </h3>
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef(({ className = '', children, ...props }, ref) => (
  <p
    ref={ref}
    className={`card-subtitle ${className}`.trim()}
    {...props}
  >
    {children}
  </p>
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef(({ className = '', children, ...props }, ref) => (
  <div
    ref={ref}
    className={`card-body ${className}`.trim()}
    {...props}
  >
    {children}
  </div>
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef(({ className = '', children, ...props }, ref) => (
  <div
    ref={ref}
    className={`p-6 ${className}`.trim()}
    {...props}
  >
    {children}
  </div>
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
