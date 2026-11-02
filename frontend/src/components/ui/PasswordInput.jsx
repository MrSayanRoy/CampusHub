import React, { useState } from 'react';
import { Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';

/**
 * Reusable PasswordInput component for CampusHub
 * Includes password toggle icon, focus state, error state, and caps-lock warning
 */
export default function PasswordInput({
  label = 'Password',
  id = 'password',
  value,
  onChange,
  error,
  helperText,
  placeholder = '••••••••',
  disabled = false,
  required = false,
  className = '',
  autoComplete = 'current-password',
  onKeyDown,
  onKeyUp,
  onBlur,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  const toggleVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleKeyModifier = (e) => {
    if (e.getModifierState) {
      setCapsLockOn(e.getModifierState('CapsLock'));
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-[#171717] mb-1.5"
        >
          {label}
          {required && <span className="text-[#DC2626] ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737373]">
          <Lock className="h-4 w-4" />
        </div>

        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          onKeyDown={(e) => {
            handleKeyModifier(e);
            if (onKeyDown) onKeyDown(e);
          }}
          onKeyUp={(e) => {
            handleKeyModifier(e);
            if (onKeyUp) onKeyUp(e);
          }}
          onBlur={(e) => {
            setCapsLockOn(false);
            if (onBlur) onBlur(e);
          }}
          className={`
            w-full text-sm rounded-lg bg-white border transition-all duration-150
            placeholder:text-[#A3A3A3] text-[#171717]
            pl-9.5 pr-10 py-2.5
            ${
              error
                ? 'border-[#DC2626] bg-[#FFF7F7] focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/15'
                : 'border-[#E5E5E5] hover:border-[#D4D4D4] focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/15'
            }
            focus:outline-none
            disabled:bg-[#FAFAFA] disabled:text-[#A3A3A3] disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />

        <button
          type="button"
          tabIndex={-1}
          onClick={toggleVisibility}
          disabled={disabled}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#737373] hover:text-[#DC2626] transition-colors focus:outline-none cursor-pointer"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-[#737373] hover:text-[#171717]" />
          ) : (
            <Eye className="h-4 w-4 text-[#A3A3A3] hover:text-[#171717]" />
          )}
        </button>
      </div>

      {capsLockOn && (
        <div
          role="alert"
          className="mt-1.5 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium animate-in fade-in duration-150"
        >
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
          <span>Caps Lock is ON</span>
        </div>
      )}

      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs text-[#DC2626] font-medium">
          {error}
        </p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-[#737373]">{helperText}</p>
      ) : null}
    </div>
  );
}
