import React, { useState, useRef, useEffect } from 'react';

/**
 * Reusable Dropdown menu for CampusHub
 * Surface: #FFFFFF, Border: #E2E8F0, Radius: rounded-xl
 */
export default function Dropdown({
  trigger,
  items = [],
  align = 'right',
  width = 'w-56',
  className = '',
  id,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const alignmentStyles = {
    left: 'left-0',
    right: 'right-0',
  };

  return (
    <div ref={dropdownRef} id={id} className={`relative inline-block text-left ${className}`}>
      <div onClick={() => setIsOpen(!isOpen)} className="inline-flex cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`
            absolute z-50 mt-1.5 ${width} ${alignmentStyles[align] || alignmentStyles.right}
            bg-white rounded-xl border border-[#E5E5E5] shadow-lg py-1.5 focus:outline-none
            animate-in fade-in zoom-in-95 duration-150
          `}
          role="menu"
          aria-orientation="vertical"
        >
          {items.map((item, index) => {
            if (item.divider) {
              return <div key={`div-${index}`} className="my-1 border-t border-[#E5E5E5]" />;
            }

            const Icon = item.icon;
            const isDanger = item.variant === 'danger';

            return (
              <button
                key={item.key || item.label || index}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick?.();
                    setIsOpen(false);
                  }
                }}
                className={`
                  w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between gap-2.5
                  transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                  ${
                    isDanger
                      ? 'text-[#DC2626] hover:bg-[#FEF2F2]'
                      : 'text-[#171717] hover:bg-[#FEF2F2] hover:text-[#DC2626]'
                  }
                `}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {Icon && <Icon className={`h-4 w-4 shrink-0 ${isDanger ? 'text-[#DC2626]' : 'text-[#737373]'}`} />}
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] bg-[#F5F5F5] text-[#737373] px-1.5 py-0.5 rounded-full font-semibold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
