import React from 'react';
import './Spinner.css';

export const Spinner = ({ 
  size = 'md', 
  className = '', 
  label = 'Carregando...',
  ...props 
}) => {
  const sizeClasses = {
    sm: 'spinner-sm',
    md: '',
    lg: 'spinner-lg',
  };

  return (
    <div className={`spinner-container ${className}`} {...props}>
      <div className={`spinner ${sizeClasses[size]}`} />
      {label && <span className="spinner-label">{label}</span>}
    </div>
  );
};
