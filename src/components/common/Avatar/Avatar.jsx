import React from 'react';
import { User } from 'lucide-react';
import './Avatar.css';

export const Avatar = ({
  src,
  alt = 'Avatar',
  size = 'md',
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'avatar-sm',
    md: 'avatar-md',
    lg: 'avatar-lg',
    xl: 'avatar-xl',
  };

  return (
    <div className={`avatar ${sizeClasses[size]} ${className}`} {...props}>
      {src ? (
        <img src={src} alt={alt} className="avatar-image" />
      ) : (
        <User className="avatar-fallback" />
      )}
    </div>
  );
};
