import React from 'react';
import { Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';

/**
 * Reusable unified CampusHub Brand Logo
 * Features a modern red brand icon, refined Manrope typography
 * Variants:
 *  - default: Red brand icon, neutral dark text, red accent
 *  - white: White logo with dark red/red background support
 */
export default function Logo({
  to = '/',
  size = 'md',
  variant = 'default',
  showText = true,
  showBadge = false,
  className = '',
}) {
  const isWhite = variant === 'white';

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-9 w-9 text-sm',
    lg: 'h-10 w-10 text-base',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-5 w-5',
  };

  const logoContent = (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      {/* Icon Emblem */}
      <div
        className={`
          flex items-center justify-center rounded-xl shadow-xs shrink-0
          ${sizeClasses[size] || sizeClasses.md}
          ${isWhite ? 'bg-white text-[#DC2626] shadow-md' : 'bg-[#DC2626] text-white'}
        `}
      >
        <Building2 className={iconSizes[size] || iconSizes.md} />
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-extrabold tracking-tight text-base sm:text-lg leading-tight ${
                isWhite ? 'text-white' : 'text-[#171717]'
              }`}
            >
              Campus<span className={isWhite ? 'text-red-100' : 'text-[#DC2626]'}>Hub</span>
            </span>
            {showBadge && (
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  isWhite
                    ? 'bg-white/20 text-white border border-white/30'
                    : 'bg-[#F5F5F5] text-[#525252] border border-[#E5E5E5]'
                }`}
              >
                Student
              </span>
            )}
          </div>
          <span
            className={`text-[10px] font-medium leading-none mt-0.5 ${
              isWhite ? 'text-white/80' : 'text-[#737373]'
            }`}
          >
            University Portal
          </span>
        </div>
      )}
    </div>
  );

  if (!to) return logoContent;

  return (
    <Link
      to={to}
      className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]/40 rounded-xl p-0.5 inline-block"
      aria-label="CampusHub home"
    >
      {logoContent}
    </Link>
  );
}
