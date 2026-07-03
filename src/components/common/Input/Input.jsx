import React, { forwardRef } from 'react';
import './Input.css';

export const Input = forwardRef(({
  label,
  error,
  icon,
  className = '',
  fullWidth = true,
  ...props
}, ref) => {
  const classes = [
    'input',
    error && 'input-error',
    fullWidth && 'w-full',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={`form-group ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="form-label">
          {label}
        </label>
      )}
      <div className={`input-wrapper ${icon ? 'input-with-icon' : ''}`}>
        {icon && <span className="input-icon">{icon}</span>}
        <input ref={ref} className={classes} {...props} />
      </div>
      {error && <span className="input-error-message">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
