import React from 'react';
import { User, Shield, Link2, Bell, ChevronRight } from 'lucide-react';

export const DEFAULT_SETTINGS_SECTIONS = [
  {
    id: 'account',
    label: 'Account',
    description: 'Personal & academic info',
    icon: User,
  },
  {
    id: 'security',
    label: 'Security',
    description: 'Password & authentication',
    icon: Shield,
  },
  {
    id: 'connected-accounts',
    label: 'Connected Accounts',
    description: 'Google, GitHub & Microsoft',
    icon: Link2,
  },
  {
    id: 'preferences',
    label: 'Preferences',
    description: 'Notifications & alerts',
    icon: Bell,
  },
];

/**
 * SettingsSidebar Component
 * Desktop: Vertical navigation sidebar with active state indicators.
 * Mobile: Responsive pill tabs or dropdown switcher.
 */
export default function SettingsSidebar({
  activeSection = 'account',
  onSelectSection,
  sections = DEFAULT_SETTINGS_SECTIONS,
  className = '',
}) {
  return (
    <div className={className}>
      {/* Mobile: Tabs navigation */}
      <div className="md:hidden mb-6">
        <label htmlFor="settings-mobile-nav" className="sr-only">
          Select Settings Section
        </label>
        <div className="flex bg-[#F5F5F5] p-1 rounded-xl border border-[#E5E5E5]">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => onSelectSection?.(section.id)}
                className={`
                  flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer
                  ${
                    isActive
                      ? 'bg-white text-[#DC2626] shadow-xs'
                      : 'text-[#737373] hover:text-[#171717]'
                  }
                `}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{section.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop: Vertical navigation list */}
      <nav
        aria-label="Settings Navigation"
        className="hidden md:block bg-white rounded-xl border border-[#E5E5E5] p-2 shadow-xs space-y-1"
      >
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#737373]">
          Settings Navigation
        </div>

        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSelectSection?.(section.id)}
              className={`
                w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-left transition-all duration-150 cursor-pointer group
                ${
                  isActive
                    ? 'bg-[#FEF2F2] text-[#DC2626] font-bold shadow-xs'
                    : 'text-[#171717] hover:bg-[#FEF2F2]/40 font-medium'
                }
              `}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`
                    p-1.5 rounded-md transition-colors shrink-0
                    ${
                      isActive
                        ? 'bg-white text-[#DC2626] shadow-xs'
                        : 'bg-[#F5F5F5] text-[#737373] group-hover:text-[#171717]'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm tracking-tight truncate">{section.label}</p>
                  {section.description && (
                    <p
                      className={`text-[11px] truncate ${
                        isActive ? 'text-[#DC2626]/80' : 'text-[#737373]'
                      }`}
                    >
                      {section.description}
                    </p>
                  )}
                </div>
              </div>

              <ChevronRight
                className={`h-4 w-4 shrink-0 transition-transform ${
                  isActive
                    ? 'text-[#DC2626] translate-x-0.5'
                    : 'text-neutral-300 group-hover:text-neutral-400'
                }`}
              />
            </button>
          );
        })}
      </nav>
    </div>
  );
}
