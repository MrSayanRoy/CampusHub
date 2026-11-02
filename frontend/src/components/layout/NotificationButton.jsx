import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import Badge from '../ui/Badge';
import { useApp } from '../../context/AppContext';

/**
 * Reusable NotificationButton component
 * Shows notification bell, unread badge, and accessible dropdown
 */
export default function NotificationButton({ className = '' }) {
  const { notices = [], markNoticeAsRead } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const unreadNotices = notices.filter((n) => !n.read);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg text-[#737373] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20"
        aria-label="Campus notifications"
        aria-expanded={isOpen}
      >
        <Bell className="h-5 w-5" />
        {unreadNotices.length > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#DC2626] ring-2 ring-white" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl border border-[#E5E5E5] shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="p-3.5 border-b border-[#E5E5E5] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-[#171717] tracking-tight">
                Campus Notifications
              </h4>
              {unreadNotices.length > 0 && (
                <Badge size="sm" variant="primary">
                  {unreadNotices.length} new
                </Badge>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs text-[#737373] hover:text-[#DC2626] font-medium cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-[#E5E5E5]">
            {notices.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#737373]">
                No notices available.
              </div>
            ) : (
              notices.map((notice) => (
                <div
                  key={notice.id}
                  onClick={() => markNoticeAsRead && markNoticeAsRead(notice.id)}
                  className={`p-3.5 hover:bg-[#FEF2F2]/60 transition-colors cursor-pointer ${
                    !notice.read ? 'bg-[#FEF2F2]/50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-semibold text-[#DC2626] uppercase tracking-wider">
                      {notice.category}
                    </span>
                    <span className="text-[10px] text-[#A3A3A3]">
                      {notice.date}
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-[#171717] mt-1 leading-snug">
                    {notice.title}
                  </h5>
                  <p className="text-[11px] text-[#737373] mt-1 line-clamp-2 leading-relaxed">
                    {notice.summary}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-[#737373] font-medium">
                      {notice.author}
                    </span>
                    {!notice.read ? (
                      <span className="text-[10px] text-[#DC2626] font-semibold flex items-center gap-1">
                        <Check className="h-3 w-3" /> Mark read
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#A3A3A3]">Read</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
