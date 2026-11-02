import React, { useState, useMemo } from 'react';
import {
  Newspaper,
  Search,
  Bell,
  CheckCircle2,
  Calendar,
  FileText,
  Download,
  Share2,
  AlertCircle,
  Pin,
  Clock,
  Building2,
  GraduationCap,
  Filter,
  ExternalLink,
  BookOpen,
  Info,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ui/Toast';

export default function FeedPage() {
  const { notices = [], markNoticeAsRead, markAllNoticesAsRead } = useApp();
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filterPriority, setFilterPriority] = useState('all'); // 'all', 'unread', 'high'
  const [expandedNoticeId, setExpandedNoticeId] = useState(null);

  const categories = ['All', 'Exams', 'CSE Department', 'Facilities', 'IT Services', 'Opportunity'];

  // Metrics
  const unreadCount = useMemo(() => notices.filter((n) => !n.read).length, [notices]);
  const examNoticesCount = useMemo(
    () => notices.filter((n) => n.category === 'Exams' || n.title.toLowerCase().includes('exam')).length,
    [notices]
  );

  // Filtered notices
  const filteredNotices = useMemo(() => {
    return notices.filter((notice) => {
      // Category filter
      const matchesCategory =
        selectedCategory === 'All' ||
        notice.category === selectedCategory ||
        (selectedCategory === 'Exams' && notice.category === 'Academic' && notice.title.toLowerCase().includes('exam'));

      // Priority / Read filter
      const matchesPriority =
        filterPriority === 'all' ||
        (filterPriority === 'unread' && !notice.read) ||
        (filterPriority === 'high' && notice.priority === 'high');

      // Search query
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        notice.title.toLowerCase().includes(query) ||
        notice.author.toLowerCase().includes(query) ||
        notice.summary.toLowerCase().includes(query) ||
        (notice.content && notice.content.toLowerCase().includes(query)) ||
        (notice.tag && notice.tag.toLowerCase().includes(query));

      return matchesCategory && matchesPriority && matchesSearch;
    });
  }, [notices, selectedCategory, filterPriority, searchQuery]);

  const handleDownloadAttachment = (notice) => {
    addToast({
      title: 'Downloading Notice Attachment',
      message: `Preparing ${notice.attachmentName || 'circular.pdf'} for offline access...`,
      type: 'info',
    });
  };

  const handleCopyLink = (notice) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/app/feed#${notice.id}`);
    }
    addToast({
      title: 'Notice Link Copied',
      message: 'Direct link to this official circular copied to clipboard.',
      type: 'success',
    });
  };

  const handleToggleRead = (noticeId, currentReadState) => {
    if (!currentReadState) {
      markNoticeAsRead(noticeId);
      addToast({
        title: 'Notice Marked as Read',
        message: 'Your feed badge has been updated.',
        type: 'info',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-red-50 text-[#DC2626] border border-red-100">
              <Newspaper className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-[#171717] tracking-tight">
              Community Feed & Notices
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#737373] mt-1 pl-0.5">
            Official university circulars, exam timetables, CSE department updates, and academic notifications.
          </p>
        </div>
      </div>

      {/* Top Advisory Banner for Exams */}
      <div className="p-4 sm:p-5 rounded-xl border border-red-200 bg-[#FEF2F2] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-start gap-3.5">
          <div className="p-2 rounded-lg bg-white border border-red-200 text-[#DC2626] shrink-0 mt-0.5">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-[#991B1B]">
                Spring 2026 Examination Notice
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#DC2626] text-white">
                Active Circular
              </span>
            </div>
            <p className="text-sm font-bold text-[#171717] mt-0.5">
              End-Semester Timetable & Digital Hall Tickets Are Now Available
            </p>
            <p className="text-xs text-[#737373] mt-1 max-w-2xl">
              End-term theory examinations begin April 14, 2026. Verify your hall ticket, course paper codes, and reporting time in Aryabhatta and Ramanujan blocks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="primary"
            size="sm"
            leftIcon={Download}
            onClick={() =>
              handleDownloadAttachment({
                attachmentName: 'End_Semester_Exam_TimeTable_Spring_2026.pdf',
              })
            }
            className="text-xs font-semibold whitespace-nowrap"
          >
            Download Schedule (PDF)
          </Button>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-4 rounded-xl border border-[#E5E5E5] bg-white">
          <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider block">
            Total Notices
          </span>
          <p className="text-xl font-bold text-[#171717] mt-1">{notices.length}</p>
          <span className="text-[11px] text-[#737373] mt-0.5 block">Campus-wide circulars</span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl border border-[#E5E5E5] bg-white">
          <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider block">
            Exam Updates
          </span>
          <p className="text-xl font-bold text-[#171717] mt-1">{examNoticesCount}</p>
          <span className="text-[11px] text-red-600 font-medium mt-0.5 block">Dates & hall tickets</span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl border border-[#E5E5E5] bg-white">
          <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider block">
            Unread Bulletins
          </span>
          <p className="text-xl font-bold text-[#171717] mt-1">{unreadCount}</p>
          <span className="text-[11px] text-[#737373] mt-0.5 block">Awaiting review</span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl border border-[#E5E5E5] bg-white">
          <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider block">
            Latest Circular
          </span>
          <p className="text-xs sm:text-sm font-bold text-[#171717] mt-1 truncate">
            {notices[0]?.date || 'Today'}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">Feed up to date</span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-4 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Priority / Status Tabs */}
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg w-fit overflow-x-auto">
            <button
              type="button"
              onClick={() => setFilterPriority('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                filterPriority === 'all'
                  ? 'bg-white text-[#171717] shadow-xs'
                  : 'text-[#737373] hover:text-[#171717]'
              }`}
            >
              All Notices ({notices.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterPriority('unread')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                filterPriority === 'unread'
                  ? 'bg-white text-[#171717] shadow-xs'
                  : 'text-[#737373] hover:text-[#171717]'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterPriority('high')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                filterPriority === 'high'
                  ? 'bg-white text-[#171717] shadow-xs'
                  : 'text-[#737373] hover:text-[#171717]'
              }`}
            >
              High Priority & Urgent
            </button>
          </div>

          {/* Search Input */}
          <div className="w-full md:w-72">
            <Input
              placeholder="Search exam, timetable, CSE..."
              icon={Search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-1.5 text-xs"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-t border-[#E5E5E5] pt-3 scrollbar-none">
          <span className="text-xs font-semibold text-[#737373] shrink-0 mr-1 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs rounded-full font-medium transition-colors shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#171717] text-white'
                  : 'bg-neutral-100 text-[#525252] hover:bg-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notices Stream */}
      {filteredNotices.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="No notices found"
          description="There are no announcements or circulars matching your current search or category filter."
          actionText="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedCategory('All');
            setFilterPriority('all');
          }}
        />
      ) : (
        <div className="space-y-4">
          {filteredNotices.map((notice) => {
            const isUnread = !notice.read;
            const isExam = notice.category === 'Exams' || notice.title.toLowerCase().includes('exam');
            const isCse = notice.category === 'CSE Department' || notice.title.toLowerCase().includes('cse');
            const isExpanded = expandedNoticeId === notice.id;

            return (
              <Card
                key={notice.id}
                id={notice.id}
                className={`transition-all duration-200 ${
                  isUnread ? 'border-neutral-300 bg-white ring-1 ring-neutral-200' : 'bg-white'
                }`}
              >
                <CardHeader className="p-4 sm:p-5 pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      {/* Meta Tags Row */}
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        {notice.pinned && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
                            <Pin className="h-3 w-3" /> Pinned
                          </span>
                        )}

                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            isExam
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : isCse
                              ? 'bg-neutral-100 text-[#171717] border-neutral-300'
                              : 'bg-neutral-50 text-[#525252] border-neutral-200'
                          }`}
                        >
                          {notice.category}
                        </span>

                        {notice.tag && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#FAFAFA] text-[#737373] border border-[#E5E5E5]">
                            {notice.tag}
                          </span>
                        )}

                        {notice.priority === 'high' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            High Priority
                          </span>
                        )}

                        {isUnread && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#DC2626]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                            Unread
                          </span>
                        )}
                      </div>

                      {/* Notice Title */}
                      <h3 className="text-base sm:text-lg font-bold text-[#171717] hover:text-[#DC2626] transition-colors">
                        {notice.title}
                      </h3>

                      {/* Author & Timestamp */}
                      <div className="flex items-center gap-4 text-xs text-[#737373] flex-wrap">
                        <span className="flex items-center gap-1 font-medium text-[#525252]">
                          <Building2 className="h-3.5 w-3.5 text-[#737373]" />
                          {notice.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-[#737373]" />
                          {notice.date}
                        </span>
                      </div>
                    </div>

                    {/* Quick Read / Unread Action */}
                    <div className="flex items-center gap-2 self-start">
                      {isUnread ? (
                        <button
                          type="button"
                          onClick={() => handleToggleRead(notice.id, false)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-md border border-[#E5E5E5] text-[#525252] hover:bg-neutral-50 hover:text-[#171717] transition-colors cursor-pointer"
                          title="Mark as read"
                        >
                          Mark Read
                        </button>
                      ) : (
                        <span className="text-[11px] font-medium text-[#737373] flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Read
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-5 pt-0 space-y-3">
                  <p className="text-xs sm:text-sm text-[#404040] leading-relaxed">
                    {notice.summary}
                  </p>

                  {/* Expanded Content Details */}
                  {isExpanded && notice.content && (
                    <div className="mt-3 p-3.5 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] text-xs sm:text-sm text-[#171717] space-y-2 animate-in fade-in duration-150">
                      <div className="font-semibold text-xs text-[#737373] uppercase tracking-wider flex items-center gap-1">
                        <Info className="h-3.5 w-3.5" /> Full Circular Details
                      </div>
                      <p className="leading-relaxed text-[#262626] whitespace-pre-line">
                        {notice.content}
                      </p>
                    </div>
                  )}

                  {/* Attachment Pill if available */}
                  {notice.attachmentName && (
                    <div className="p-3 rounded-lg border border-[#E5E5E5] bg-[#F9FAFB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded bg-white border border-[#E5E5E5] text-[#DC2626]">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#171717] truncate max-w-xs sm:max-w-md">
                            {notice.attachmentName}
                          </p>
                          <span className="text-[11px] text-[#737373]">
                            Official Document • {notice.attachmentSize || 'PDF'}
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={Download}
                        onClick={() => handleDownloadAttachment(notice)}
                        className="text-xs font-semibold shrink-0"
                      >
                        Download PDF
                      </Button>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="p-4 sm:p-5 pt-2 border-t border-[#E5E5E5] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setExpandedNoticeId(isExpanded ? null : notice.id)}
                      className="text-xs font-semibold text-[#DC2626] hover:underline cursor-pointer"
                    >
                      {isExpanded ? 'Show Less' : 'Read Full Notice & Instructions'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(notice)}
                      className="p-1.5 rounded text-[#737373] hover:text-[#171717] hover:bg-neutral-100 transition-colors cursor-pointer"
                      title="Share / Copy Link"
                      aria-label="Share notice link"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
