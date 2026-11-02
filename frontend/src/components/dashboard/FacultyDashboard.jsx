import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Clock,
  Users,
  FileText,
  CalendarCheck,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  BookOpen,
  Send,
  Plus,
  Award,
  Layers,
  GraduationCap,
  MapPin,
  Bell,
  Eye,
  Check,
  RotateCcw,
  UploadCloud,
  FileCheck2,
  ExternalLink,
} from 'lucide-react';
import StatCard from './StatCard';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import { useToast } from '../ui/Toast';
import { useApp } from '../../context/AppContext';
import {
  FACULTY_COURSES,
  TODAY_CLASSES,
  PENDING_TASKS,
  ENROLLED_STUDENTS_LIST,
} from '../../data/facultyData.js';
import { getAlphabetGrade, ASSIGNMENT_GRADING_SCALE } from '../../data/assignmentsData.js';

export default function FacultyDashboard({ user, onSwitchRole }) {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { notices = [], setNotices } = useApp();

  // Local state for classes & attendance records to allow interactive submissions
  const [todayClasses, setTodayClasses] = useState(TODAY_CLASSES);
  const [tasksList, setTasksList] = useState(PENDING_TASKS);
  const [enrolledStudents, setEnrolledStudents] = useState(ENROLLED_STUDENTS_LIST);

  // Quick Action Modal States
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedClassForAttendance, setSelectedClassForAttendance] = useState(todayClasses[0] || null);
  const [attendanceSheet, setAttendanceSheet] = useState(() => {
    const initial = {};
    ENROLLED_STUDENTS_LIST.forEach((s) => {
      initial[s.id] = 'P'; // Default Present
    });
    return initial;
  });
  const [isAttendanceReviewStep, setIsAttendanceReviewStep] = useState(false);

  // Create Assignment Modal State
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    courseCode: 'CS401',
    title: '',
    category: 'Lab Assignment',
    dueDate: '',
    dueTime: '11:59 PM',
    maxMarks: 50,
    weightage: '15% of Internal Assessment',
    submissionFormat: 'ZIP Archive or GitHub Repository URL',
    instructions: '',
  });

  // Grade Submissions Modal State
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [gradingCourse, setGradingCourse] = useState('CS401');
  const [selectedStudentForGrading, setSelectedStudentForGrading] = useState(ENROLLED_STUDENTS_LIST[0]);
  const [numericScore, setNumericScore] = useState(45);
  const [maxScoreInput, setMaxScoreInput] = useState(50);
  const [gradingFeedback, setGradingFeedback] = useState('Comprehensive architecture diagrams and excellent unit test coverage.');

  // Post Announcement Modal State
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    category: 'Academic Circular',
    targetAudience: 'All Enrolled Students (CS401 & CS405)',
    priority: 'high',
    content: '',
  });
  const [isPreviewAnnouncement, setIsPreviewAnnouncement] = useState(false);

  // Date formatting
  const todayDateString = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = user?.name || user?.fullName || 'Dr. Sarah Chen, Ph.D.';
  const designation = user?.designation || user?.title || 'Associate Professor & Lab Director';

  // -------------------------------------------------------------
  // QUICK ACTION HANDLERS
  // -------------------------------------------------------------

  // 1. Attendance Action
  const handleOpenAttendance = (classItem) => {
    setSelectedClassForAttendance(classItem || todayClasses[0]);
    setIsAttendanceReviewStep(false);
    setIsAttendanceModalOpen(true);
  };

  const handleToggleStudentAttendance = (studentId, status) => {
    setAttendanceSheet((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleMarkAllPresent = () => {
    const allP = {};
    enrolledStudents.forEach((s) => {
      allP[s.id] = 'P';
    });
    setAttendanceSheet(allP);
    addToast({
      type: 'info',
      title: 'Batch Action Applied',
      message: 'All students marked as Present. Review and confirm submission.',
    });
  };

  const handleConfirmAttendanceSubmission = () => {
    if (!selectedClassForAttendance) return;

    // Prevent duplicate
    if (selectedClassForAttendance.attendanceSubmitted) {
      addToast({
        type: 'error',
        title: 'Attendance Already Submitted',
        message: `Attendance for ${selectedClassForAttendance.courseCode} has already been logged.`,
      });
      return;
    }

    // Mark as submitted
    setTodayClasses((prev) =>
      prev.map((c) =>
        c.id === selectedClassForAttendance.id ? { ...c, attendanceSubmitted: true } : c
      )
    );

    // Remove or complete from pending tasks
    setTasksList((prev) => prev.filter((t) => !t.title.includes(selectedClassForAttendance.courseCode + ' Morning Session')));

    setIsAttendanceModalOpen(false);
    setIsAttendanceReviewStep(false);

    const presentCount = Object.values(attendanceSheet).filter((s) => s === 'P').length;
    const absentCount = Object.values(attendanceSheet).filter((s) => s === 'A').length;

    addToast({
      type: 'success',
      title: 'Attendance Logged Successfully',
      message: `Recorded ${presentCount} Present and ${absentCount} Absent for ${selectedClassForAttendance.courseCode} (${selectedClassForAttendance.section}).`,
    });
  };

  // 2. Create Assignment Handler
  const handleCreateAssignment = (e) => {
    e.preventDefault();
    if (!newAssignment.title.trim() || !newAssignment.dueDate) {
      addToast({
        type: 'error',
        title: 'Required Fields Missing',
        message: 'Please provide an assignment title and due date.',
      });
      return;
    }

    addToast({
      type: 'success',
      title: 'Assignment Published',
      message: `${newAssignment.courseCode}: "${newAssignment.title}" published and dispatched to student portals.`,
    });

    setIsAssignmentModalOpen(false);
    setNewAssignment({
      courseCode: 'CS401',
      title: '',
      category: 'Lab Assignment',
      dueDate: '',
      dueTime: '11:59 PM',
      maxMarks: 50,
      weightage: '15% of Internal Assessment',
      submissionFormat: 'ZIP Archive or GitHub Repository URL',
      instructions: '',
    });
  };

  // 3. Grade Submissions Handler
  const computedAlphabetGrade = useMemo(() => {
    return getAlphabetGrade(numericScore, maxScoreInput) || { grade: 'O', point: 10, label: 'Outstanding' };
  }, [numericScore, maxScoreInput]);

  const handleSaveGradeEvaluation = (e) => {
    e.preventDefault();

    if (numericScore > maxScoreInput || numericScore < 0) {
      addToast({
        type: 'error',
        title: 'Invalid Score Range',
        message: `Score must be between 0 and ${maxScoreInput}.`,
      });
      return;
    }

    // Update student grade in local list
    setEnrolledStudents((prev) =>
      prev.map((s) =>
        s.id === selectedStudentForGrading.id
          ? {
              ...s,
              currentGrade: computedAlphabetGrade.grade,
              gradePoint: computedAlphabetGrade.point,
              performanceStatus: computedAlphabetGrade.label,
              flaggedShortage: computedAlphabetGrade.isRedo,
            }
          : s
      )
    );

    setIsGradeModalOpen(false);

    addToast({
      type: 'success',
      title: 'Grade Evaluated & Recorded',
      message: `${selectedStudentForGrading.name} awarded Grade ${computedAlphabetGrade.grade} = ${computedAlphabetGrade.point} (${computedAlphabetGrade.label}) on official 10-point scale.`,
    });
  };

  // 4. Post Announcement Handler
  const handlePublishAnnouncement = (e) => {
    e.preventDefault();
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      addToast({
        type: 'error',
        title: 'Incomplete Announcement',
        message: 'Please enter both an announcement title and message content.',
      });
      return;
    }

    const createdNotice = {
      id: `not-${Date.now()}`,
      title: newAnnouncement.title,
      date: 'Just now',
      category: newAnnouncement.category,
      priority: newAnnouncement.priority,
      author: `${displayName} (${designation})`,
      summary: newAnnouncement.content.slice(0, 140) + '...',
      content: newAnnouncement.content,
      read: false,
      pinned: true,
      tag: newAnnouncement.targetAudience,
    };

    if (typeof setNotices === 'function') {
      setNotices((prev) => [createdNotice, ...prev]);
    }

    setIsAnnouncementModalOpen(false);
    setIsPreviewAnnouncement(false);
    setNewAnnouncement({
      title: '',
      category: 'Academic Circular',
      targetAudience: 'All Enrolled Students (CS401 & CS405)',
      priority: 'high',
      content: '',
    });

    addToast({
      type: 'success',
      title: 'Official Announcement Broadcasted',
      message: `Notice broadcasted to ${createdNotice.tag}.`,
    });
  };

  // Compute attendance modal summary
  const attendanceSummary = useMemo(() => {
    const values = Object.values(attendanceSheet);
    return {
      present: values.filter((v) => v === 'P').length,
      absent: values.filter((v) => v === 'A').length,
      late: values.filter((v) => v === 'L').length,
      excused: values.filter((v) => v === 'E').length,
      total: enrolledStudents.length,
    };
  }, [attendanceSheet, enrolledStudents.length]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* 1. FACULTY WELCOME & TEACHING HEADER                                      */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-[#E5E5E5] p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Spring Semester 2026 • Academic Year 2025–2026</span>
            </span>
            <span className="text-xs text-[#737373] font-medium">• {todayDateString}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
            {getGreeting()}, {displayName}
          </h1>

          <p className="text-sm text-[#737373] max-w-2xl">
            Here's your university teaching overview for today. You have{' '}
            <strong className="text-[#171717]">{todayClasses.length} lectures scheduled</strong> and{' '}
            <strong className="text-[#DC2626]">{tasksList.filter((t) => t.urgent).length} priority tasks</strong> requiring attention.
          </p>
        </div>

        {/* Faculty Meta Badge & Portal Switcher for Testing/Role Verification */}
        <div className="flex items-center gap-3 shrink-0 self-start lg:self-auto">
          <div className="flex items-center gap-3 p-2.5 px-3.5 rounded-xl border border-[#E5E5E5] bg-[#FAFAFA]">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80'}
              alt={displayName}
              className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-2xs"
            />
            <div className="text-left">
              <span className="text-xs font-bold text-[#171717] block truncate max-w-[180px]">
                {displayName}
              </span>
              <span className="text-[11px] text-[#737373] block truncate max-w-[180px]">
                {designation}
              </span>
            </div>
          </div>

          {onSwitchRole && (
            <button
              type="button"
              onClick={onSwitchRole}
              className="p-2.5 px-3 rounded-xl border border-[#E5E5E5] bg-white hover:bg-neutral-50 text-xs font-bold text-[#525252] hover:text-[#171717] transition-colors cursor-pointer"
              title="Toggle to student portal view"
            >
              Switch Role
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FACULTY DASHBOARD OVERVIEW STATISTICS CARDS                            */}
      {/* ========================================================================= */}
      <section aria-label="Faculty Teaching Overview Statistics">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Classes Today */}
          <StatCard
            label="Classes Today"
            value={`${todayClasses.length} Scheduled`}
            subtext={`Next: ${todayClasses[0]?.courseCode || 'CS401'} at ${todayClasses[0]?.startTime || '09:00 AM'}`}
            icon={Clock}
            to="/app/academics?tab=timetable"
            badge="Timetable"
          />

          {/* Card 2: Total Students */}
          <StatCard
            label="Total Students"
            value="184 Students"
            subtext="64 in CS401 • 84 in CS405 • 36 in CS491"
            icon={Users}
            to="/app/students"
            badge="Enrolled Cohort"
          />

          {/* Card 3: Pending Evaluations */}
          <StatCard
            label="Pending Evaluations"
            value="21 Submissions"
            subtext="18 Lab Reports • 2 Redo (F) Awaiting Review"
            icon={FileText}
            to="/app/academics?tab=assignments"
            badge="O - F Alphabet Scale"
            indicatorColor="bg-amber-500"
          />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. FUNCTIONAL QUICK ACTIONS                                               */}
      {/* ========================================================================= */}
      <section aria-label="Faculty Quick Actions" className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#171717] tracking-tight">
              Faculty Quick Actions
            </h2>
            <p className="text-xs text-[#737373]">
              Immediate tools to mark daily attendance, publish assignments, grade papers, and broadcast circulars.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Action 1: Take Attendance */}
          <div
            onClick={() => handleOpenAttendance(todayClasses[0])}
            className="p-4 sm:p-5 rounded-xl border border-[#E5E5E5] bg-white hover:border-[#DC2626] hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-3 text-left"
          >
            <div className="flex items-start justify-between">
              <div className="p-2.5 rounded-xl bg-red-50 text-[#DC2626] border border-red-100 group-hover:bg-[#DC2626] group-hover:text-white transition-colors">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Live Roster
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#171717] group-hover:text-[#DC2626] transition-colors">
                Take Attendance
              </h3>
              <p className="text-xs text-[#737373] mt-1 leading-relaxed">
                Log RFID presence for CS401 or CS405 with single-click batch marking.
              </p>
            </div>
            <div className="pt-2 border-t border-[#E5E5E5] flex items-center justify-between text-xs font-semibold text-[#DC2626]">
              <span>Record Sheet</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Action 2: Create Assignment */}
          <div
            onClick={() => setIsAssignmentModalOpen(true)}
            className="p-4 sm:p-5 rounded-xl border border-[#E5E5E5] bg-white hover:border-[#DC2626] hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-3 text-left"
          >
            <div className="flex items-start justify-between">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Plus className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                New Task
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#171717] group-hover:text-[#DC2626] transition-colors">
                Create Assignment
              </h3>
              <p className="text-xs text-[#737373] mt-1 leading-relaxed">
                Publish lab problems, specify due dates, weightages, and attach rubric files.
              </p>
            </div>
            <div className="pt-2 border-t border-[#E5E5E5] flex items-center justify-between text-xs font-semibold text-[#DC2626]">
              <span>Publish Now</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Action 3: Grade Submissions */}
          <div
            onClick={() => setIsGradeModalOpen(true)}
            className="p-4 sm:p-5 rounded-xl border border-[#E5E5E5] bg-white hover:border-[#DC2626] hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-3 text-left"
          >
            <div className="flex items-start justify-between">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                <Award className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                21 Pending
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#171717] group-hover:text-[#DC2626] transition-colors">
                Grade Submissions
              </h3>
              <p className="text-xs text-[#737373] mt-1 leading-relaxed">
                Evaluate student code using the alphabet scale (O=10, A+=9, A=8, B+=7, B=6, C=5, F=REDO).
              </p>
            </div>
            <div className="pt-2 border-t border-[#E5E5E5] flex items-center justify-between text-xs font-semibold text-[#DC2626]">
              <span>Open Gradebook</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Action 4: Post Announcement */}
          <div
            onClick={() => setIsAnnouncementModalOpen(true)}
            className="p-4 sm:p-5 rounded-xl border border-[#E5E5E5] bg-white hover:border-[#DC2626] hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-3 text-left"
          >
            <div className="flex items-start justify-between">
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-100 group-hover:bg-purple-700 group-hover:text-white transition-colors">
                <Send className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                Broadcast
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#171717] group-hover:text-[#DC2626] transition-colors">
                Post Announcement
              </h3>
              <p className="text-xs text-[#737373] mt-1 leading-relaxed">
                Broadcast circulars to specific classes, sections, or entire department with preview.
              </p>
            </div>
            <div className="pt-2 border-t border-[#E5E5E5] flex items-center justify-between text-xs font-semibold text-[#DC2626]">
              <span>Compose Circular</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. TODAY'S TEACHING SCHEDULE & TIMETABLE HIGHLIGHT                        */}
      {/* ========================================================================= */}
      <section aria-label="Today's Teaching Schedule" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#171717] flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#DC2626]" />
              Today's Teaching Schedule
            </h2>
            <p className="text-xs text-[#737373]">
              Chronologically scheduled lectures, tutorial blocks, and lab slots for {todayDateString}.
            </p>
          </div>

          <Link
            to="/app/academics?tab=timetable"
            className="text-xs font-bold text-[#DC2626] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>View Full Timetable</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {todayClasses.map((item, idx) => {
            const isFirst = idx === 0;

            return (
              <div
                key={item.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-150 bg-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isFirst
                    ? 'border-red-300 ring-1 ring-red-200'
                    : 'border-[#E5E5E5] hover:border-neutral-300'
                }`}
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Time Badge Block */}
                  <div className="w-32 shrink-0 p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373] block">
                      Session {idx + 1}
                    </span>
                    <span className="text-xs font-mono font-black text-[#171717] block mt-0.5">
                      {item.startTime} - {item.endTime}
                    </span>
                    <span
                      className={`inline-block mt-1 text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                        item.attendanceSubmitted
                          ? 'bg-emerald-100 text-emerald-800'
                          : isFirst
                          ? 'bg-red-100 text-[#DC2626]'
                          : 'bg-neutral-200 text-[#525252]'
                      }`}
                    >
                      {item.attendanceSubmitted ? 'Attendance In' : isFirst ? 'Next Up' : item.status}
                    </span>
                  </div>

                  {/* Course Details */}
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] px-2 py-0.5 rounded">
                        {item.courseCode}
                      </span>
                      <h3 className="font-bold text-sm sm:text-base text-[#171717] truncate">
                        {item.courseTitle}
                      </h3>
                      <span className="text-[11px] font-semibold text-[#525252] bg-neutral-100 px-2 py-0.5 rounded">
                        {item.type}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-[#525252] truncate">
                      Topic: <strong>{item.topic}</strong>
                    </p>

                    <div className="flex items-center gap-4 text-xs text-[#737373] flex-wrap pt-0.5">
                      <span className="flex items-center gap-1 text-[#171717] font-semibold">
                        <MapPin className="h-3.5 w-3.5 text-[#DC2626]" />
                        {item.classroom}
                      </span>
                      <span>•</span>
                      <span>{item.department} • {item.semester}</span>
                      <span>•</span>
                      <span className="font-mono">{item.section} ({item.enrolledCount} Students)</span>
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
                  {!item.attendanceSubmitted ? (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      leftIcon={CalendarCheck}
                      onClick={() => handleOpenAttendance(item)}
                      className="text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Take Attendance
                    </Button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Attendance Logged
                    </span>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    leftIcon={BookOpen}
                    onClick={() => navigate('/app/courses')}
                    className="text-xs font-semibold cursor-pointer"
                  >
                    Course Roster
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. NEEDS YOUR ATTENTION & PENDING ACADEMIC TASKS                           */}
      {/* ========================================================================= */}
      <section aria-label="Needs Your Attention" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#171717] flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Needs Your Attention
            </h2>
            <p className="text-xs text-[#737373]">
              Urgent academic grading, attendance reconciliations, and student resubmissions awaiting sign-off.
            </p>
          </div>

          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 self-start sm:self-auto">
            {tasksList.length} Active Items
          </span>
        </div>

        <div className="space-y-2.5">
          {tasksList.map((task) => {
            const isUrgent = task.priority === 'urgent' || task.priority === 'high';

            return (
              <div
                key={task.id}
                className={`p-4 rounded-xl border bg-white shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-colors ${
                  task.priority === 'urgent'
                    ? 'border-red-200 bg-red-50/20 hover:border-red-300'
                    : 'border-[#E5E5E5] hover:border-neutral-300'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div
                    className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      task.priority === 'urgent'
                        ? 'bg-red-50 text-[#DC2626] border border-red-100'
                        : task.priority === 'high'
                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                        : 'bg-neutral-100 text-[#525252]'
                    }`}
                  >
                    {task.category === 'Attendance' ? (
                      <CalendarCheck className="h-4 w-4" />
                    ) : task.category.includes('Grading') || task.category.includes('Resubmission') ? (
                      <FileText className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[11px] font-bold text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] px-1.5 py-0.2 rounded">
                        {task.courseCode}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-[#171717]">
                        {task.title}
                      </h4>
                      <span
                        className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${
                          task.priority === 'urgent'
                            ? 'bg-red-100 text-[#DC2626] border-red-200'
                            : task.priority === 'high'
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-neutral-100 text-[#525252] border-neutral-200'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    <p className="text-xs text-[#737373] flex items-center gap-3 flex-wrap">
                      <span>Category: <strong>{task.category}</strong></span>
                      <span>•</span>
                      <span>Items Pending: <strong className="text-[#171717]">{task.pendingCount}</strong></span>
                      <span>•</span>
                      <span className="text-[#DC2626] font-medium">
                        Due: {task.dueDate} {task.daysLeft === 0 ? '(Today)' : `(${task.daysLeft} days left)`}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                  <Button
                    type="button"
                    variant={isUrgent ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => {
                      if (task.category === 'Attendance') {
                        handleOpenAttendance(todayClasses[0]);
                      } else if (task.category.includes('Resubmission') || task.category.includes('Grading')) {
                        setIsGradeModalOpen(true);
                      } else {
                        navigate(task.actionRoute);
                      }
                    }}
                    className={`text-xs font-bold cursor-pointer ${
                      task.priority === 'urgent' ? 'bg-[#DC2626] hover:bg-red-700' : ''
                    }`}
                  >
                    {task.actionText}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. ASSIGNED COURSES & STUDENT ROSTER QUICK SUMMARY                        */}
      {/* ========================================================================= */}
      <section aria-label="Assigned Courses Summary" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#171717] flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[#DC2626]" />
              My Assigned Teaching Courses
            </h2>
            <p className="text-xs text-[#737373]">
              Active curriculum tracks under your direct academic instruction for {todayDateString}.
            </p>
          </div>

          <Link
            to="/app/courses"
            className="text-xs font-bold text-[#DC2626] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>Manage All Courses & Syllabi</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FACULTY_COURSES.map((course) => (
            <div
              key={course.id}
              className="p-5 rounded-2xl border border-[#E5E5E5] bg-white hover:border-[#DC2626]/40 transition-all shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] px-2 py-0.5 rounded">
                    {course.code}
                  </span>
                  <span className="text-[10px] font-bold text-[#525252] bg-neutral-100 px-2 py-0.5 rounded">
                    {course.credits} Credits
                  </span>
                </div>

                <h3 className="font-bold text-sm sm:text-base text-[#171717] line-clamp-1">
                  {course.title}
                </h3>

                <p className="text-xs text-[#737373]">
                  {course.semester} • {course.section} • {course.classroom}
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E5E5E5] text-xs">
                  <div>
                    <span className="text-[10px] text-[#737373] uppercase block">Enrolled</span>
                    <strong className="text-sm font-bold text-[#171717]">{course.totalStudents} Students</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#737373] uppercase block">Attendance Avg</span>
                    <strong className="text-sm font-bold text-emerald-700">{course.attendanceAvg}%</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5E5E5] flex items-center justify-between text-xs">
                <span className="text-[#737373] text-[11px] truncate">
                  Next: {course.nextClass}
                </span>
                <Link
                  to={`/app/academics?tab=assignments&course=${course.code}`}
                  className="font-bold text-[#DC2626] hover:underline"
                >
                  Grade Submissions →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* MODAL 1: TAKE ATTENDANCE MODAL (WORKING)                                   */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        title={
          isAttendanceReviewStep
            ? 'Review & Confirm Attendance Submission'
            : `Take Attendance — ${selectedClassForAttendance?.courseCode || 'CS401'}`
        }
        description={
          selectedClassForAttendance
            ? `${selectedClassForAttendance.courseTitle} (${selectedClassForAttendance.section}) • ${selectedClassForAttendance.classroom}`
            : 'Record student lecture attendance'
        }
        footer={
          <div className="flex items-center justify-between w-full">
            {!isAttendanceReviewStep ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllPresent}
                >
                  Mark All Present
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAttendanceModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => setIsAttendanceReviewStep(true)}
                    className="font-bold cursor-pointer"
                  >
                    Review & Submit ({attendanceSummary.present} Present)
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAttendanceReviewStep(false)}
                >
                  Back to Roster
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleConfirmAttendanceSubmission}
                  className="bg-[#DC2626] hover:bg-red-700 font-bold cursor-pointer"
                >
                  Confirm & Finalize Attendance
                </Button>
              </>
            )}
          </div>
        }
      >
        {!isAttendanceReviewStep ? (
          <div className="space-y-4 text-xs">
            {/* Class Meta Pill */}
            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="font-bold text-[#171717] block">
                  Lecture Timing: {selectedClassForAttendance?.startTime} - {selectedClassForAttendance?.endTime}
                </span>
                <span className="text-[11px] text-[#737373]">
                  Date: {todayDateString} • Verification Terminal: Doorway RFID Scanner 04
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="px-2 py-0.5 rounded font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {attendanceSummary.present} Present
                </span>
                <span className="px-2 py-0.5 rounded font-bold bg-red-50 text-[#DC2626] border border-red-200">
                  {attendanceSummary.absent} Absent
                </span>
              </div>
            </div>

            {/* Student Roster Table */}
            <div className="max-h-72 overflow-y-auto rounded-xl border border-neutral-200 divide-y divide-neutral-100">
              {enrolledStudents.map((student) => {
                const currentStatus = attendanceSheet[student.id] || 'P';

                return (
                  <div
                    key={student.id}
                    className="p-2.5 px-3 flex items-center justify-between gap-3 hover:bg-neutral-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="h-7 w-7 rounded-full object-cover border border-neutral-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-[#171717] truncate">{student.name}</p>
                        <p className="text-[10px] font-mono text-[#737373]">{student.rollNumber}</p>
                      </div>
                    </div>

                    {/* Status Pill Switcher */}
                    <div className="flex items-center gap-1 shrink-0">
                      {['P', 'A', 'L', 'E'].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleToggleStudentAttendance(student.id, st)}
                          className={`w-7 h-7 rounded-md font-black text-xs transition-colors cursor-pointer ${
                            currentStatus === st
                              ? st === 'P'
                                ? 'bg-emerald-600 text-white'
                                : st === 'A'
                                ? 'bg-[#DC2626] text-white'
                                : st === 'L'
                                ? 'bg-amber-600 text-white'
                                : 'bg-blue-600 text-white'
                              : 'bg-neutral-100 text-[#737373] hover:bg-neutral-200'
                          }`}
                          title={st === 'P' ? 'Present' : st === 'A' ? 'Absent' : st === 'L' ? 'Late' : 'Excused'}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
              <h4 className="font-bold text-[#171717] text-sm">Attendance Summary Verification</h4>
              <p className="text-[#525252]">
                You are about to digitally lock and submit the attendance record for{' '}
                <strong>{selectedClassForAttendance?.courseCode}</strong> session.
              </p>
              <div className="grid grid-cols-4 gap-2 pt-2">
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
                  <span className="text-[10px] text-emerald-800 font-bold block uppercase">Present</span>
                  <span className="text-xl font-black text-emerald-700">{attendanceSummary.present}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-center">
                  <span className="text-[10px] text-red-800 font-bold block uppercase">Absent</span>
                  <span className="text-xl font-black text-[#DC2626]">{attendanceSummary.absent}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-center">
                  <span className="text-[10px] text-amber-800 font-bold block uppercase">Late</span>
                  <span className="text-xl font-black text-amber-700">{attendanceSummary.late}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-center">
                  <span className="text-[10px] text-blue-800 font-bold block uppercase">Excused</span>
                  <span className="text-xl font-black text-blue-700">{attendanceSummary.excused}</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
              <strong>Statutory Compliance:</strong> Attendance once locked is pushed directly to the Controller of Examinations server. Unexcused absentees will receive automatic shortage notices.
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: CREATE ASSIGNMENT MODAL (WORKING)                                */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        title="Create & Publish Course Assignment"
        description="Deploy programming tasks, lab problems, or term papers to student portals"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAssignmentModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleCreateAssignment}
              className="font-bold cursor-pointer"
            >
              Publish to Class
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#171717] mb-1">Target Course:</label>
              <select
                value={newAssignment.courseCode}
                onChange={(e) => setNewAssignment({ ...newAssignment, courseCode: e.target.value })}
                className="w-full p-2 border border-[#E5E5E5] rounded-lg bg-white text-xs font-semibold text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#DC2626]"
              >
                {FACULTY_COURSES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} - {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#171717] mb-1">Category:</label>
              <select
                value={newAssignment.category}
                onChange={(e) => setNewAssignment({ ...newAssignment, category: e.target.value })}
                className="w-full p-2 border border-[#E5E5E5] rounded-lg bg-white text-xs font-semibold text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#DC2626]"
              >
                <option value="Lab Assignment">Programming Lab Assignment</option>
                <option value="Research & Implementation">Research & Implementation Task</option>
                <option value="Theory Problem Set">Theory Problem Set</option>
                <option value="Milestone Review">Capstone Milestone Review</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#171717] mb-1">Assignment Title:</label>
            <Input
              placeholder="e.g. Assignment 4: Paxos Consensus State Machine"
              value={newAssignment.title}
              onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
              className="py-1.5 text-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-[#171717] mb-1">Due Date:</label>
              <Input
                type="date"
                value={newAssignment.dueDate}
                onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                className="py-1.5 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-[#171717] mb-1">Maximum Marks:</label>
              <Input
                type="number"
                value={newAssignment.maxMarks}
                onChange={(e) => setNewAssignment({ ...newAssignment, maxMarks: parseInt(e.target.value, 10) || 50 })}
                className="py-1.5 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-[#171717] mb-1">Grading Scale:</label>
              <span className="p-2 border border-neutral-200 rounded-lg bg-neutral-50 block font-bold text-[#171717] text-xs">
                O = 10 to F = REDO
              </span>
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#171717] mb-1">Detailed Instructions / Problem Scope:</label>
            <textarea
              rows={3}
              value={newAssignment.instructions}
              onChange={(e) => setNewAssignment({ ...newAssignment, instructions: e.target.value })}
              placeholder="Outline deliverables, expected RPC test cases, and edge case parameters..."
              className="w-full p-2 border border-[#E5E5E5] rounded-lg bg-white text-xs text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#DC2626]"
            />
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 3: GRADE SUBMISSIONS MODAL (WORKING WITH O=10 TO F=REDO SCALE)      */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isGradeModalOpen}
        onClose={() => setIsGradeModalOpen(false)}
        title="Grade Student Submissions"
        description="Official Alphabet Evaluation using O=10, A+=9, A=8, B+=7, B=6, C=5, F=REDO"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              Assigned Grade: {computedAlphabetGrade.grade} = {computedAlphabetGrade.point} GP
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsGradeModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSaveGradeEvaluation}
                className="font-bold cursor-pointer"
              >
                Submit Grade & Feedback
              </Button>
            </div>
          </div>
        }
      >
        <form onSubmit={handleSaveGradeEvaluation} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#171717] mb-1">Select Student:</label>
              <select
                value={selectedStudentForGrading?.id}
                onChange={(e) => {
                  const s = enrolledStudents.find((st) => st.id === e.target.value);
                  if (s) setSelectedStudentForGrading(s);
                }}
                className="w-full p-2 border border-[#E5E5E5] rounded-lg bg-white text-xs font-semibold text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#DC2626]"
              >
                {enrolledStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.rollNumber} - {s.name} ({s.courseCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#171717] mb-1">Assignment Track:</label>
              <span className="p-2 border border-neutral-200 rounded-lg bg-neutral-50 block font-semibold text-[#171717] text-xs truncate">
                CS401: Raft Consensus State Machine
              </span>
            </div>
          </div>

          {/* Score & Alphabet Grade Preview */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <label className="block font-bold text-[#171717] mb-1">Raw Marks:</label>
                <div className="flex items-center gap-1.5">
                  <Input
                    type="number"
                    value={numericScore}
                    onChange={(e) => setNumericScore(parseInt(e.target.value, 10) || 0)}
                    className="w-20 py-1 text-base font-black text-center font-mono"
                  />
                  <span className="font-bold text-[#737373]">/ {maxScoreInput}</span>
                </div>
              </div>

              <div className="h-10 w-px bg-neutral-200" />

              <div>
                <span className="text-[10px] font-bold text-[#737373] uppercase tracking-wider block">
                  Computed Alphabet Grade
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-black text-[#DC2626]">
                    {computedAlphabetGrade.grade}
                  </span>
                  <span className="text-xs font-bold text-[#171717]">
                    = {computedAlphabetGrade.point} / 10 GP ({computedAlphabetGrade.label})
                  </span>
                </div>
              </div>
            </div>

            {computedAlphabetGrade.isRedo && (
              <span className="p-2 rounded bg-red-100 text-[#DC2626] font-bold text-[11px] border border-red-200">
                Grade F triggers Mandatory Student Resubmission
              </span>
            )}
          </div>

          <div>
            <label className="block font-bold text-[#171717] mb-1">Written Feedback & Examiner Observations:</label>
            <textarea
              rows={3}
              value={gradingFeedback}
              onChange={(e) => setGradingFeedback(e.target.value)}
              placeholder="Highlight strengths, code efficiency, or failing unit test assertions..."
              className="w-full p-2 border border-[#E5E5E5] rounded-lg bg-white text-xs text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#DC2626]"
            />
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 4: POST ANNOUNCEMENT MODAL (WORKING WITH LIVE PREVIEW)              */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isAnnouncementModalOpen}
        onClose={() => setIsAnnouncementModalOpen(false)}
        title={isPreviewAnnouncement ? 'Preview Announcement Circular' : 'Compose Faculty Announcement'}
        description="Broadcast verified departmental advisories directly to student dashboard noticeboards"
        footer={
          <div className="flex items-center justify-between w-full">
            {!isPreviewAnnouncement ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAnnouncementModalOpen(false)}
                >
                  Cancel
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPreviewAnnouncement(true)}
                    className="font-semibold cursor-pointer"
                  >
                    Preview Message
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handlePublishAnnouncement}
                    className="font-bold cursor-pointer"
                  >
                    Publish Circular
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPreviewAnnouncement(false)}
                >
                  Edit Message
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handlePublishAnnouncement}
                  className="bg-[#DC2626] hover:bg-red-700 font-bold cursor-pointer"
                >
                  Confirm & Broadcast
                </Button>
              </>
            )}
          </div>
        }
      >
        {!isPreviewAnnouncement ? (
          <form onSubmit={handlePublishAnnouncement} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#171717] mb-1">Target Audience:</label>
                <select
                  value={newAnnouncement.targetAudience}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, targetAudience: e.target.value })}
                  className="w-full p-2 border border-[#E5E5E5] rounded-lg bg-white text-xs font-semibold text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#DC2626]"
                >
                  <option value="All Enrolled Students (CS401 & CS405)">All Enrolled Students (CS401 & CS405)</option>
                  <option value="CS401: Distributed Systems Only">CS401: Distributed Systems Only</option>
                  <option value="CS405: Compiler Design Only">CS405: Compiler Design Only</option>
                  <option value="Entire Computer Science Department">Entire Computer Science Department</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#171717] mb-1">Category & Priority:</label>
                <div className="flex items-center gap-2">
                  <select
                    value={newAnnouncement.category}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, category: e.target.value })}
                    className="w-full p-2 border border-[#E5E5E5] rounded-lg bg-white text-xs font-semibold text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#DC2626]"
                  >
                    <option value="Academic Circular">Academic Circular</option>
                    <option value="Lab & Project Viva">Lab & Project Viva</option>
                    <option value="Exam Schedule Alert">Exam Schedule Alert</option>
                    <option value="Faculty Notice">Faculty Notice</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#171717] mb-1">Circular Headline / Title:</label>
              <Input
                placeholder="e.g. Schedule for CS401 Distributed Systems Mock Lab Viva"
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                className="py-1.5 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-[#171717] mb-1">Announcement Body:</label>
              <textarea
                rows={4}
                value={newAnnouncement.content}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                placeholder="Enter complete circular text with relevant timings, room allocations, or document download requirements..."
                className="w-full p-2 border border-[#E5E5E5] rounded-lg bg-white text-xs text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#DC2626]"
              />
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl border border-neutral-200 bg-[#FAFAFA] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#DC2626] bg-[#FEF2F2] px-2 py-0.5 rounded border border-[#FECACA]">
                  {newAnnouncement.category}
                </span>
                <span className="text-[10px] text-[#737373]">
                  Author: {displayName}
                </span>
              </div>
              <h3 className="font-extrabold text-base text-[#171717] mt-1">
                {newAnnouncement.title || 'Untitled Circular'}
              </h3>
              <p className="text-[#404040] text-xs leading-relaxed whitespace-pre-wrap">
                {newAnnouncement.content || 'No circular content entered.'}
              </p>
              <div className="pt-2 border-t border-neutral-200 flex items-center justify-between text-[10px] text-[#737373]">
                <span>Audience: <strong>{newAnnouncement.targetAudience}</strong></span>
                <span>Dispatch Mode: Live Student Feed Pin</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
