import React from 'react';
import { ArrowRight } from 'lucide-react';

/**
 * Reusable QuickActionCard component
 * Contains: Lucide icon, Title, Short description, Arrow icon, and subtle Coming Soon badge
 */
export default function QuickActionCard({
  icon: Icon,
  title,
  description,
  badge = 'Coming Soon',
  onClick,
  disabled = false,
  className = '',
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full text-left bg-white rounded-xl border border-[#E5E5E5] p-4 sm:p-5
        shadow-xs hover:border-[#FCA5A5] hover:shadow-xs transition-all duration-150
        group cursor-pointer flex flex-col justify-between relative
        focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20
        ${className}
      `}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          {Icon && (
            <div className="h-10 w-10 rounded-lg bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#DC2626] group-hover:bg-[#DC2626] group-hover:text-white transition-colors">
              <Icon className="h-5 w-5" />
            </div>
          )}
          {badge && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-[#F5F5F5] text-[#737373] border border-[#E5E5E5]">
              {badge}
            </span>
          )}
        </div>

        <h4 className="text-sm sm:text-base font-bold text-[#171717] group-hover:text-[#DC2626] transition-colors">
          {title}
        </h4>
        <p className="mt-1 text-xs text-[#737373] line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>


