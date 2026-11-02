import React from 'react';
import { User, Sparkles } from 'lucide-react';

/**
 * ProfileHeader Component
 * Title: "My Profile"
 * Subtitle: "Manage your personal information and campus profile."
 */
export default function ProfileHeader({
  title = 'My Profile',
  subtitle = 'Manage your personal information and campus profile.',
  action,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 ${className}`}
    >
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
            {title}
          </h1>
        </div>
        <p className="mt-1 text-sm text-[#737373] leading-relaxed">
          {subtitle}
        </p>
      </div>

      {action && <div className="self-start sm:self-auto">{action}</div>}
    </div>
  );
}
