import React from 'react';

/**
 * Reusable Card component system for CampusHub
 * Radius: rounded-xl
 * Surface: #FFFFFF
 * Border: #E2E8F0
 */
export function Card({
  children,
  className = '',
  hoverEffect = false,
  id,
  onClick,
  ...props
}) {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`
        bg-white rounded-xl border border-[#E5E5E5] shadow-xs
        ${hoverEffect ? 'transition-all duration-200 hover:border-[#FCA5A5] hover:shadow-sm cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`p-5 pb-3 border-b border-[#E5E5E5] ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3
      className={`text-base font-bold text-[#171717] tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '', ...props }) {
  return (
    <p className={`text-xs text-[#737373] mt-1 leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`p-5 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div
      className={`p-5 pt-3 border-t border-[#E5E5E5] flex items-center justify-between gap-3 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
