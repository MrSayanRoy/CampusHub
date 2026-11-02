import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

/**
 * Reusable StatCard component for Overview metrics
 * Clean, compact, subtle border (#E5E5E5), high contrast typography.
 * Supports linking via `to` prop or interactive clicks via `onClick`.
 */
export default function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  badge,
  badgeVariant = 'secondary',
  indicatorColor,
  to,
  onClick,
  className = '',
}) {
  const content = (
    <div
      className={`
        bg-white rounded-xl border border-[#E5E5E5] p-4 sm:p-5
        shadow-xs hover:border-[#DC2626] hover:shadow-md transition-all duration-200
        flex flex-col justify-between relative overflow-hidden group h-full
        ${to || onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#737373] group-hover:text-[#DC2626] transition-colors truncate">
              {label}
            </p>
            {to && (
              <ArrowUpRight className="h-3.5 w-3.5 text-[#A3A3A3] group-hover:text-[#DC2626] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
            )}
          </div>
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
          <div className="h-10 w-10 rounded-lg bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#DC2626] shrink-0 group-hover:bg-[#DC2626] group-hover:text-white transition-colors">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      {badge && (
        <div className="mt-3 pt-2.5 border-t border-[#E5E5E5] flex items-center justify-between">
          <span className="text-[11px] font-medium text-[#737373]">Status</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 group-hover:border-emerald-300">
            {badge}
          </span>
        </div>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="block no-underline focus:outline-none focus:ring-2 focus:ring-[#DC2626]/30 rounded-xl h-full">
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="w-full text-left focus:outline-none focus:ring-2 focus:ring-[#DC2626]/30 rounded-xl h-full cursor-pointer">
        {content}
      </button>
    );
  }

  return content;
}
