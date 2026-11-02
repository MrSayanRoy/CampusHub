import React, { useState } from 'react';

/**
 * Reusable Avatar component for CampusHub
 */
export default function Avatar({
  src,
  alt = '',
  name = '',
  size = 'md',
  status,
  className = '',
  id,
}) {
  const [imageError, setImageError] = useState(false);

  const getInitials = (str) => {
    if (!str) return 'CH';
    const parts = str.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const sizeStyles = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base font-semibold',
    xl: 'h-16 w-16 text-xl font-bold',
    '2xl': 'h-24 w-24 sm:h-28 sm:w-28 text-2xl sm:text-3xl font-extrabold',
  };

  const statusDotSizes = {
    xs: 'h-1.5 w-1.5 bottom-0 right-0',
    sm: 'h-2 w-2 bottom-0 right-0',
    md: 'h-2.5 w-2.5 bottom-0.5 right-0.5',
    lg: 'h-3 w-3 bottom-0.5 right-0.5',
    xl: 'h-3.5 w-3.5 bottom-1 right-1',
    '2xl': 'h-4 w-4 bottom-1.5 right-1.5',
  };

  const statusColors = {
    online: 'bg-[#16A34A] ring-white ring-2',
    busy: 'bg-[#DC2626] ring-white ring-2',
    away: 'bg-[#F59E0B] ring-white ring-2',
    offline: 'bg-slate-400 ring-white ring-2',
  };

  const showImage = src && !imageError;

  return (
    <div id={id} className={`relative inline-block shrink-0 ${className}`}>
      <div
        className={`
          rounded-full flex items-center justify-center font-medium overflow-hidden select-none
          border border-[#E5E5E5] shadow-xs
          ${sizeStyles[size] || sizeStyles.md}
          ${showImage ? 'bg-[#FAFAFA]' : 'bg-[#FEF2F2] text-[#DC2626] font-semibold'}
        `}
      >
        {showImage ? (
          <img
            src={src}
            alt={alt || name}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>

      {status && (
        <span
          className={`
            absolute rounded-full
            ${statusDotSizes[size] || statusDotSizes.md}
            ${statusColors[status] || statusColors.online}
          `}
          title={`Status: ${status}`}
        />
      )}
    </div>
  );
}
