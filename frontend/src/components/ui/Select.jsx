import React from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Reusable Select component for CampusHub
 * Border #E2E8F0, Focus #4F46E5, Error #DC2626
 * Radius: rounded-lg
 */
export default function Select({
  label,
  id,
  options = [],
  value,
  onChange,
  error,
  helperText,
  icon: Icon,
  placeholder = 'Select an option',
  disabled = false,
  required = false,
  className = '',
  ...props
}) {
  const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-[#171717] mb-1.5"
        >
          {label}
          {required && <span className="text-[#DC2626] ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737373]">
            <Icon className="h-4 w-4" />
          </div>
        )}

        <select
          id={selectId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`
            w-full text-sm rounded-lg bg-white border transition-all duration-150
            text-[#171717] appearance-none
            ${Icon ? 'pl-9.5' : 'pl-3.5'}
            pr-10 py-2.5
            ${
              error
                ? 'border-[#DC2626] bg-[#FFF7F7] focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/15'
                : 'border-[#E5E5E5] hover:border-[#D4D4D4] focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/15'
            }
            focus:outline-none
            disabled:bg-[#FAFAFA] disabled:text-[#A3A3A3] disabled:cursor-not-allowed
            ${!value ? 'text-[#A3A3A3]' : 'text-[#171717]'}
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="text-[#A3A3A3]">
              {placeholder}
            </option>
          )}
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const lbl = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val} className="text-[#171717]">
                {lbl}
              </option>
            );
          })}
        </select>

        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#737373]">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>

      {error ? (
        <p id={`${selectId}-error`} className="mt-1 text-xs text-[#DC2626] font-medium">
          {error}
        </p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-[#737373]">{helperText}</p>
      ) : null}
    </div>
  );
}
