import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Send,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Pin,
  Trash2,
  Eye,
  Calendar,
  Users,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { useApp } from '../context/AppContext';
import { FACULTY_COURSES } from '../data/facultyData.js';

export default function AnnouncementsPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { notices = [], setNotices } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAudienceFilter, setSelectedAudienceFilter] = useState('all');
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Form State
  const [newNotice, setNewNotice] = useState({
    title: '',
    category: 'Academic Circular',
    targetAudience: 'All Enrolled Students (CS401 & CS405)',
    priority: 'high',
    content: '',
  });

  // Local state initialized with AppContext notices or defaults
  const [localNotices, setLocalNotices] = useState(() => {
    return [
      {
        id: 'ann-1',
        title: 'Mid-Term Evaluation Schedule: CS401 Distributed Systems',
        category: 'Exam Notice',
        targetAudience: 'CS401 Section A',
        priority: 'high',
        date: 'Today, 08:30 AM',
        author: 'Dr. Sarah Chen, Ph.D.',
        summary: 'Theory assessment will take place on November 10th in Lecture Hall 301. Bring student RFID credentials.',
        pinned: true,
        readCount: 58,
      },
      {
        id: 'ann-2',
        title: 'Assignment 2 Grace Period Extension & Docker Container Guidelines',
        category: 'Lab Instruction',
        targetAudience: 'CS401 & CS405',
        priority: 'medium',
        date: 'Yesterday, 04:15 PM',
        author: 'Dr. Sarah Chen, Ph.D.',
        summary: 'Due date extended by 48 hours to accommodate cloud cluster maintenance. Follow the Dockerfile instructions in Module 3.',
        pinned: true,
        readCount: 112,
      },
      {
        id: 'ann-3',
        title: 'Guest Lecture: Scalable Storage Architectures at Datacenter Scale',
        category: 'Guest Lecture',
        targetAudience: 'Department of CSE',
        priority: 'normal',
        date: 'Oct 24, 2026',
        author: 'Dr. Sarah Chen, Ph.D.',
        summary: 'Principal Storage Engineer from Google Cloud will deliver an interactive tech session this Friday at 3:00 PM.',
        pinned: false,
        readCount: 144,
      },
      ...notices.map((n, idx) => ({
        id: n.id || `not-${idx}`,
        title: n.title,
        category: n.category || 'General Notice',
        targetAudience: 'Campus Community',
        priority: 'normal',
        date: n.date || 'Oct 20, 2026',
        author: 'University Administration',
        summary: n.summary || n.description || '',
        pinned: false,
        readCount: 95,
      })),
    ];
  });

  const filteredNotices = localNotices.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAudience =
      selectedAudienceFilter === 'all' ||
      n.targetAudience.toLowerCase().includes(selectedAudienceFilter.toLowerCase());
    return matchesSearch && matchesAudience;
  });

  const handleTogglePin = (id) => {
    setLocalNotices((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
    addToast({
      title: 'Announcement Updated',
      description: 'Pinning status updated successfully.',
      variant: 'default',
    });
  };

  const handleDeleteNotice = (id) => {
    setLocalNotices((prev) => prev.filter((n) => n.id !== id));
    addToast({
      title: 'Notice Archived',
      description: 'The announcement was removed from active broadcasts.',
      variant: 'default',
    });
  };

  const handlePublishSubmit = (e) => {
    e.preventDefault();
    if (!newNotice.title.trim() || !newNotice.content.trim()) {
      addToast({
        title: 'Validation Error',
        description: 'Please provide both title and announcement body.',
        variant: 'destructive',
      });
      return;
    }

    const created = {
      id: `ann-${Date.now()}`,
      title: newNotice.title,
      category: newNotice.category,
      targetAudience: newNotice.targetAudience,
      priority: newNotice.priority,
      date: 'Just now',
      author: 'Dr. Sarah Chen, Ph.D.',
      summary: newNotice.content,
      pinned: newNotice.priority === 'urgent',
      readCount: 0,
    };

    setLocalNotices([created, ...localNotices]);

    // Also inject into AppContext notices if available
    if (setNotices) {
      setNotices((prev) => [
        {
          id: created.id,
          title: created.title,
          summary: created.summary,
          date: 'Just now',
          read: false,
          category: created.category,
        },
        ...prev,
      ]);
    }

    setIsComposeModalOpen(false);
    setIsPreviewMode(false);
    setNewNotice({
      title: '',
      category: 'Academic Circular',
      targetAudience: 'All Enrolled Students (CS401 & CS405)',
      priority: 'high',
      content: '',
    });

    addToast({
      title: 'Announcement Broadcasted Live',
      description: `Notification transmitted to ${newNotice.targetAudience}.`,
      variant: 'success',
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
              Faculty Dispatch
            </span>
            <span className="text-xs text-[#737373]">Broadcast & Circulars</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight mt-1">
            Announcements & Circulars
          </h1>
          <p className="mt-1 text-sm text-[#737373]">
            Broadcast academic circulars, reschedule notifications, and exam instructions to your enrolled cohorts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/app/feed')}
            leftIcon={Bell}
          >
            Student Feed View
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsComposeModalOpen(true)}
            leftIcon={Send}
          >
            Post Announcement
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E5E5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373]" />
          <input
            type="text"
            placeholder="Search circulars by headline or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-1 focus:ring-[#DC2626] focus:border-[#DC2626]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[#737373]">Audience:</span>
          <select
            value={selectedAudienceFilter}
            onChange={(e) => setSelectedAudienceFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg border border-[#E5E5E5] bg-white text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#DC2626]"
          >
            <option value="all">All Recipients</option>
            <option value="CS401">CS401 Only</option>
            <option value="CS405">CS405 Only</option>
            <option value="Department">Department Wide</option>
          </select>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredNotices.map((notice) => (
          <div
            key={notice.id}
            className={`bg-white rounded-xl border p-5 shadow-xs transition-all relative ${
              notice.pinned
                ? 'border-red-300 bg-red-50/15'
                : 'border-[#E5E5E5] hover:border-neutral-300'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {notice.pinned && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
                      <Pin className="h-3 w-3" /> Pinned
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-neutral-100 text-[#171717]">
                    {notice.category}
                  </span>
                  <span className="text-xs font-bold text-[#DC2626]">
                    To: {notice.targetAudience}
                  </span>
                  <span className="text-xs text-[#737373]">• {notice.date}</span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-[#171717]">
                  {notice.title}
                </h3>

                <p className="text-xs text-[#525252] leading-relaxed whitespace-pre-line">
                  {notice.summary}
                </p>

                <div className="flex items-center gap-4 text-[11px] text-[#737373] pt-1">
                  <span>Author: {notice.author}</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-medium">
                    {notice.readCount} student views
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleTogglePin(notice.id)}
                  title={notice.pinned ? 'Unpin Announcement' : 'Pin to Top'}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    notice.pinned ? 'text-[#DC2626] hover:bg-red-50' : 'text-[#737373] hover:text-[#171717] hover:bg-neutral-100'
                  }`}
                >
                  <Pin className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteNotice(notice.id)}
                  title="Archive Notice"
                  className="p-1.5 rounded-lg text-[#737373] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Compose Announcement Modal */}
      {isComposeModalOpen && (
        <Modal
          isOpen={isComposeModalOpen}
          onClose={() => setIsComposeModalOpen(false)}
          title="Compose Official Academic Announcement"
          size="lg"
        >
          <form onSubmit={handlePublishSubmit} className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E5]">
              <span className="text-[11px] text-[#737373]">
                Announcements are broadcast instantly to student portals and mobile notification bars.
              </span>
              <button
                type="button"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="text-xs font-semibold text-[#DC2626] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5" />
                {isPreviewMode ? 'Back to Editor' : 'Live Preview'}
              </button>
            </div>

            {isPreviewMode ? (
              <div className="p-4 rounded-xl border border-red-200 bg-[#FEF2F2]/30 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
                    {newNotice.category}
                  </span>
                  <span className="text-xs font-bold text-[#DC2626]">
                    Audience: {newNotice.targetAudience}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#171717]">
                  {newNotice.title || 'Untitled Circular'}
                </h4>
                <p className="text-xs text-[#525252] leading-relaxed whitespace-pre-line">
                  {newNotice.content || 'No message content entered yet.'}
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1">
                    Announcement Headline
                  </label>
                  <Input
                    placeholder="e.g., Mid-Term Examination Guidelines & Permitted Reference Materials"
                    value={newNotice.title}
                    onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#171717] mb-1">
                      Target Audience
                    </label>
                    <select
                      value={newNotice.targetAudience}
                      onChange={(e) => setNewNotice({ ...newNotice, targetAudience: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-[#E5E5E5] bg-white text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#DC2626]"
                    >
                      <option value="All Enrolled Students (CS401 & CS405)">All Enrolled Students</option>
                      <option value="CS401: Distributed Systems">CS401 Only</option>
                      <option value="CS405: Compiler Design">CS405 Only</option>
                      <option value="Department of Computer Science & Eng.">Entire CSE Department</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#171717] mb-1">
                      Category
                    </label>
                    <select
                      value={newNotice.category}
                      onChange={(e) => setNewNotice({ ...newNotice, category: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-[#E5E5E5] bg-white text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#DC2626]"
                    >
                      <option value="Academic Circular">Academic Circular</option>
                      <option value="Exam Notice">Exam Notice</option>
                      <option value="Lab Instruction">Lab Instruction</option>
                      <option value="Class Reschedule">Class Reschedule</option>
                      <option value="General Notice">General Notice</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#171717] mb-1">
                      Priority Level
                    </label>
                    <select
                      value={newNotice.priority}
                      onChange={(e) => setNewNotice({ ...newNotice, priority: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-[#E5E5E5] bg-white text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#DC2626]"
                    >
                      <option value="high">High (Red Banner)</option>
                      <option value="urgent">Urgent & Pinned</option>
                      <option value="normal">Normal</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1">
                    Announcement Body
                  </label>
                  <textarea
                    rows={5}
                    value={newNotice.content}
                    onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                    placeholder="Provide full instructions, room allocations, prerequisites, or schedules..."
                    className="w-full p-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-1 focus:ring-[#DC2626]"
                    required
                  />
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E5E5]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsComposeModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" leftIcon={Send}>
                Broadcast Announcement
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
