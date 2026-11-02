import React from 'react';

/**
 * Reusable Loader & Skeleton components for CampusHub
 */
export default function Loader({ size = 'md', text, className = '' }) {
  const sizeMap = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-10 w-10 border-3',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 p-6 ${className}`}>
      <div
        className={`
          animate-spin rounded-full border-[#E5E5E5] border-t-[#DC2626]
          ${sizeMap[size] || sizeMap.md}
        `}
      />
      {text && <p className="text-xs font-medium text-[#737373]">{text}</p>}
    </div>
  );
}

export function CardSkeleton({ count = 1 }) {
  return (
    <div className="space-y-4 w-full">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-xl border border-[#E5E5E5] p-5 shadow-xs animate-pulse space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="h-4 bg-neutral-200 rounded w-1/3" />
            <div className="h-4 bg-neutral-200 rounded-full w-16" />
          </div>
          <div className="h-3 bg-neutral-100 rounded w-4/5" />
          <div className="h-3 bg-neutral-100 rounded w-2/3" />
          <div className="pt-2 flex items-center justify-between">
            <div className="h-6 bg-neutral-200 rounded-full w-24" />
            <div className="h-7 bg-neutral-200 rounded-lg w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
