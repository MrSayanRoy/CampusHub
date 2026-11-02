import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * Reusable accessible Modal dialog for CampusHub
 * Border #E2E8F0, Radius rounded-xl
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'max-w-lg',
  id,
}) {
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id={id}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        ref={overlayRef}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Card */}
      <div
        className={`
          relative w-full ${maxWidth} bg-white rounded-xl border border-[#E5E5E5] shadow-xl z-10
          overflow-hidden my-8 transform transition-all animate-in zoom-in-95 duration-200
        `}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E5E5] flex items-start justify-between gap-4">
          <div>
            {title && (
              <h2 className="text-lg font-bold text-[#171717] leading-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs text-[#737373] mt-1">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            type="button"
            aria-label="Close modal"
            className="p-1 rounded-lg text-[#737373] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-3.5 bg-[#FAFAFA] border-t border-[#E5E5E5] flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
