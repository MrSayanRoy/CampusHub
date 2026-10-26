import React from 'react';

/**
 * Reusable SectionHeader component for Dashboard
 */
export default function SectionHeader({
  title,
  subtitle,
  action,
  badge,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 mb-3.5 ${className}`}
    >
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-base sm:text-lg font-bold text-[#171717] tracking-tight">
            {title}
          </h3>
          {badge && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F5F5F5] text-[#737373] border border-[#E5E5E5]">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-[#737373] mt-0.5">{subtitle}</p>
        )}
      </div>

      {action && <div className="mt-1 sm:mt-0">{action}</div>}
    </div>
  );
}
