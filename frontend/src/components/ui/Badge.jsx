import React from 'react';

/**
 * Reusable Badge component for CampusHub
 * Colors aligned with platform palette
 */
export default function Badge({
  children,
  variant = 'primary',
  size = 'md',
  dot = false,
  className = '',
  id,
  ...props
}) {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
    lg: 'text-sm px-3 py-1 font-semibold',
  };

  const variantStyles = {
    primary: 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]',
    secondary: 'bg-[#F5F5F5] text-[#737373] border border-[#E5E5E5]',
    success: 'bg-emerald-50 text-[#16A34A] border border-emerald-200',
    warning: 'bg-amber-50 text-[#D97706] border border-amber-200',
    error: 'bg-[#FEF2F2] text-[#DC2626] border border-red-200',
    dark: 'bg-[#171717] text-white',
    outline: 'bg-transparent text-[#737373] border border-[#E5E5E5]',
  };

  const dotColors = {
    primary: 'bg-[#DC2626]',
    secondary: 'bg-[#737373]',
    success: 'bg-[#16A34A]',
    warning: 'bg-[#D97706]',
    error: 'bg-[#DC2626]',
    dark: 'bg-white',
    outline: 'bg-[#A3A3A3]',
  };

  return (
    <span
      id={id}
      className={`
        inline-flex items-center gap-1.5 rounded-full whitespace-nowrap select-none
        ${sizeStyles[size] || sizeStyles.md}
        ${variantStyles[variant] || variantStyles.primary}
        ${className}
      `}
      {...props}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${dotColors[variant] || dotColors.primary}`}
        />
      )}
      {children}
    </span>
  );
}
