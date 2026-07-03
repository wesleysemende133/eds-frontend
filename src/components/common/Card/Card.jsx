import React from 'react';
import './Card.css';

export const Card = ({
  children,
  title,
  subtitle,
  className = '',
  variant = 'default',
  ...props
}) => {
  return (
    <div className={`card card-${variant} ${className}`} {...props}>
      {(title || subtitle) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};
