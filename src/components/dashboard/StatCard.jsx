import React from 'react';

/**
 * Reusable StatCard component for Student Overview
 * Clean, compact, subtle border (#E2E8F0), high contrast typography.
 */
export default function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  badge,
  badgeVariant = 'secondary',
  indicatorColor,
  className = '',
}) {
  return (
    <div
      className={`
        bg-white rounded-xl border border-[#E5E5E5] p-4 sm:p-5
        shadow-xs hover:border-[#FCA5A5] transition-all duration-150
        flex flex-col justify-between relative overflow-hidden
        ${className}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
            {label}
          </p>
          <div className="mt-1 flex items-baseline gap-2 flex-wrap">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#171717] tracking-tight truncate">
              {value}
            </h3>
            {indicatorColor && (
              <span className="relative flex h-2.5 w-2.5 shrink-0 self-center">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${indicatorColor}`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${indicatorColor}`}
                />
              </span>
            )}
          </div>
          {subtext && (
            <p className="mt-1 text-xs text-[#737373] truncate">{subtext}</p>
          )}
        </div>

        {Icon && (
          <div className="h-10 w-10 rounded-lg bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#DC2626] shrink-0">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      {badge && (
        <div className="mt-3 pt-2.5 border-t border-[#E5E5E5] flex items-center justify-between">
          <span className="text-[11px] font-medium text-[#737373]">Status</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            {badge}
          </span>
        </div>
      )}
    </div>
  );
}
