import React from 'react';
import { X } from 'lucide-react';
import './Alert.css';

export const Alert = ({
  children,
  variant = 'info',
  onClose,
  className = '',
  ...props
}) => {
  return (
    <div className={`alert alert-${variant} ${className}`} {...props}>
      <span className="alert-message">{children}</span>
      {onClose && (
        <button className="alert-close" onClick={onClose}>
          <X size={16} />
        </button>
      )}
    </div>
  );
};
