import React, { forwardRef } from 'react';
import './Input.css';

export const Input = forwardRef(({
  label,
  error,
  icon,
  placeholder,
  className = '',
  fullWidth = true,
  size = 'md',
  ...props
}, ref) => {
  const classes = [
    'input',
    error && 'input-error',
    fullWidth && 'w-full',
    `input-${size}`,
    icon && 'input-with-icon',
    className,
  ].filter(Boolean).join(' ');

  const wrapperClasses = [
    'input-wrapper',
    fullWidth && 'w-full',
  ].filter(Boolean).join(' ');

  return (
    <div className={`form-group ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="form-label" htmlFor={props.id || props.name}>
          {label}
        </label>
      )}
      <div className={wrapperClasses}>
        {icon && <span className="input-icon">{icon}</span>}
        <input
          ref={ref}
          className={classes}
          placeholder={placeholder}
          {...props}
        />
      </div>
      {error && <span className="input-error-message">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
