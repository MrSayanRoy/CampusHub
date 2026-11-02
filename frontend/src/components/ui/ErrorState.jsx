import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

/**
 * Reusable ErrorState component for CampusHub
 * When an error occurs or failed network request
 */
export default function ErrorState({
  title = 'Something went wrong',
  message = 'We encountered an error while loading the campus data. Please try again.',
  onRetry,
  className = '',
  id,
}) {
  return (
    <div
      id={id}
      className={`
        bg-[#FEF2F2] rounded-xl border border-red-200 p-8
        flex flex-col items-center justify-center text-center max-w-md mx-auto
        ${className}
      `}
    >
      <div className="h-11 w-11 rounded-full bg-red-100 text-[#DC2626] flex items-center justify-center mb-3">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-bold text-[#171717]">{title}</h3>
      <p className="text-xs text-[#737373] mt-1 leading-relaxed max-w-xs">
        {message}
      </p>
      {onRetry && (
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            leftIcon={RefreshCw}
            className="border-red-200 hover:bg-[#FEE2E2] text-[#171717]"
          >
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}
