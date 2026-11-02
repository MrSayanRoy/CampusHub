import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { User } from 'lucide-react';

/**
 * AboutSection Component
 * Displays student bio or prompt to add one.
 */
export default function AboutSection({ bio, onEditClick, className = '' }) {
  const hasBio = bio && typeof bio === 'string' && bio.trim().length > 0;

  return (
    <Card className={className}>
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-[#525252]" />
          <CardTitle>About</CardTitle>
        </div>
        {onEditClick && !hasBio && (
          <button
            type="button"
            onClick={onEditClick}
            className="text-xs font-semibold text-[#DC2626] hover:underline cursor-pointer"
          >
            Add Bio
          </button>
        )}
      </CardHeader>

      <CardContent className="p-5">
        {hasBio ? (
          <p className="text-sm text-[#171717] leading-relaxed whitespace-pre-line">
            {bio}
          </p>
        ) : (
          <p className="text-sm text-[#737373] italic">
            Tell your campus community a little about yourself.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
