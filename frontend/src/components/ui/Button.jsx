import React from 'react';

/**
 * Reusable Button component for CampusHub
 * Colors: Primary #4F46E5, Hover #4338CA, Dark #0F172A, Error #DC2626
 * Radius: rounded-lg
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className = '',
  type = 'button',
  onClick,
  id,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-lg cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-[#DC2626] text-white hover:bg-[#B91C1C] focus-visible:ring-[#DC2626] shadow-xs active:scale-[0.99]',
    secondary:
      'bg-white text-[#171717] border border-[#E5E5E5] hover:bg-neutral-50 hover:border-neutral-300 focus-visible:ring-neutral-400 active:scale-[0.99]',
    outline:
      'border border-[#E5E5E5] bg-white text-[#171717] hover:border-[#DC2626] hover:text-[#DC2626] hover:bg-white focus-visible:ring-[#DC2626] shadow-xs active:scale-[0.99]',
    ghost:
      'text-[#737373] hover:text-[#171717] hover:bg-neutral-100 focus-visible:ring-neutral-300',
    danger:
      'bg-[#991B1B] text-white hover:bg-[#7F1D1D] focus-visible:ring-[#991B1B] shadow-xs active:scale-[0.99]',
    subtle:
      'bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2] focus-visible:ring-[#DC2626]',
  };

  return (
    <button
      id={id}
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${
        variantStyles[variant] || variantStyles.primary
      } ${className}`}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-0.5 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!isLoading && LeftIcon && <LeftIcon className="h-4 w-4 shrink-0" />}
      <span>{children}</span>
      {!isLoading && RightIcon && <RightIcon className="h-4 w-4 shrink-0" />}
    </button>
  );
}
