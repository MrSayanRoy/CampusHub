import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';

/**
 * Reusable SettingsSection component
 * Wraps individual settings cards with standardized typography, borders, and spacing.
 */
export default function SettingsSection({
  id,
  title,
  description,
  icon: Icon,
  children,
  footer,
  className = '',
  danger = false,
}) {
  return (
    <section id={id} className={`scroll-mt-24 ${className}`}>
      <Card
        className={`
          transition-all duration-150
          ${danger ? 'border-[#FECACA] bg-white hover:border-[#DC2626]' : 'border-[#E5E5E5]'}
        `}
      >
        {(title || description) && (
          <CardHeader className={danger ? 'border-b border-[#FECACA]' : ''}>
            <div className="flex items-center gap-2.5">
              {Icon && (
                <div
                  className={`p-1.5 rounded-lg shrink-0 ${
                    danger
                      ? 'bg-[#FEF2F2] text-[#DC2626]'
                      : 'bg-[#FEF2F2] text-[#DC2626]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              )}
              <div>
                {title && (
                  <CardTitle className={danger ? 'text-[#991B1B] font-bold' : ''}>
                    {title}
                  </CardTitle>
                )}
                {description && (
                  <CardDescription className={danger ? 'text-[#B91C1C]' : ''}>
                    {description}
                  </CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
        )}

        <CardContent className="p-5 sm:p-6">{children}</CardContent>

        {footer && (
          <CardFooter
            className={`p-4 sm:p-5 bg-[#FAFAFA] border-t ${
              danger ? 'border-[#FECACA] bg-[#FEF2F2]/40' : 'border-[#E5E5E5]'
            }`}
          >
            {footer}
          </CardFooter>
        )}
      </Card>
    </section>
  );
}
