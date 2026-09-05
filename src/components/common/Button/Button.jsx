// src/components/common/Button/Button.jsx
import React from 'react';
import './Button.css';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  loadingText = 'A processar...',
  iconLeft = null,
  iconRight = null,
  ...props
}) => {
  const classes = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth && 'btn-full',
    isLoading && 'btn-loading',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {/* 🔥 SEMPRE MANTER A MESMA ESTRUTURA */}
      <span className="btn-content">
        {isLoading ? (
          <>
            <span className="btn-spinner" />
            <span className="btn-loading-text">{loadingText}</span>
          </>
        ) : (
          <>
            {iconLeft && <span className="btn-icon-left">{iconLeft}</span>}
            <span className="btn-label">{children}</span>
            {iconRight && <span className="btn-icon-right">{iconRight}</span>}
          </>
        )}
      </span>
    </button>
  );
};

export default Button;