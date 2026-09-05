// src/components/common/Spinner/Spinner.jsx
import React from 'react';
import './Spinner.css';

export const Spinner = ({ 
  size = 'md', 
  color = 'primary',
  className = '', 
  label = 'Carregando...',
  showLabel = true,
  variant = 'default', // 'default' | 'inline' | 'overlay'
  ...props 
}) => {
  const sizeClasses = {
    xs: 'spinner-xs',
    sm: 'spinner-sm',
    md: 'spinner-md',
    lg: 'spinner-lg',
    xl: 'spinner-xl',
  };

  const colorClasses = {
    primary: 'spinner-primary',
    secondary: 'spinner-secondary',
    white: 'spinner-white',
    dark: 'spinner-dark',
    success: 'spinner-success',
    danger: 'spinner-danger',
    warning: 'spinner-warning',
  };

  const variantClasses = {
    default: 'spinner-container',
    inline: 'spinner-inline',
    overlay: 'spinner-overlay',
  };

  const containerClass = variant === 'overlay' 
    ? `${variantClasses[variant]} ${className}`
    : `${variantClasses[variant]} ${className}`;

  return (
    <div 
      className={containerClass} 
      role="status" 
      aria-live="polite"
      {...props}
    >
      <div className={`spinner ${sizeClasses[size]} ${colorClasses[color]}`} />
      {showLabel && label && (
        <span className="spinner-label">{label}</span>
      )}
      {/* 🔥 Para screen readers (acessibilidade) */}
      <span className="sr-only">{label}</span>
    </div>
  );
};

export default Spinner;
