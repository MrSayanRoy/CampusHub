import React from 'react';

/**
 * Reusable accessible Toggle switch component for CampusHub
 * Follows design system: Brand #4F46E5, Border #E2E8F0, Dark #0F172A
 */
export default function Toggle({
  id,
  label,
  description,
  checked = false,
  onChange,
  disabled = false,
  className = '',
}) {
  const toggleId = id || (label ? `toggle-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  const handleToggle = () => {
    if (disabled) return;
    onChange?.(!checked);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange?.(!checked);
    }
  };

  return (
    <div
      className={`flex items-start justify-between gap-4 py-3.5 ${className}`}
    >
      <div className="flex-1 pr-2">
        {label && (
          <label
            htmlFor={toggleId}
            onClick={handleToggle}
            className={`text-sm font-semibold text-[#171717] block cursor-pointer select-none ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {label}
          </label>
        )}
        {description && (
          <p className="text-xs text-[#737373] mt-0.5 leading-relaxed select-none">
            {description}
          </p>
        )}
      </div>

      <button
        id={toggleId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`
          relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent
          transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${checked ? 'bg-[#DC2626]' : 'bg-neutral-200 hover:bg-neutral-300'}
        `}
      >
        <span
          aria-hidden="true"
          className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0
            transition duration-200 ease-in-out
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  );
}
