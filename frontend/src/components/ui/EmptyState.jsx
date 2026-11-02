import React from 'react';
import Button from './Button';

/**
 * Reusable EmptyState component for CampusHub
 * When no data, search results, or items are found
 */
export default function EmptyState({
  icon: Icon,
  title = 'No items found',
  description = 'There are no records to display at this moment.',
  actionLabel,
  onAction,
  className = '',
  id,
}) {
  return (
    <div
      id={id}
      className={`
        bg-white rounded-xl border border-dashed border-[#E5E5E5] p-10
        flex flex-col items-center justify-center text-center max-w-md mx-auto
        ${className}
      `}
    >
      {Icon && (
        <div className="h-12 w-12 rounded-full bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center mb-4">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <h3 className="text-base font-bold text-[#171717] tracking-tight">{title}</h3>
      <p className="text-xs text-[#737373] mt-1.5 leading-relaxed max-w-xs">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button variant="outline" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
