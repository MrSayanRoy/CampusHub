import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Clock,
  MapPin,
  User,
  Search,
  Filter,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  Layers,
  Sparkles,
  Info,
  Code2,
  CalendarCheck,
  FileCheck2,
  ShieldCheck,
  Calculator,
  ArrowRight,
  TrendingUp,
  Percent,
  CreditCard,
  Laptop,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ui/Toast';
import { SEMESTERS_LIST, ACADEMIC_CURRICULUM } from '../data/academicsData.js';
import { SEMESTER_ATTENDANCE_REGISTRY, ATTENDANCE_POLICY } from '../data/attendanceData.js';
import { ACADEMIC_FEE_SCHEDULE } from '../data/paymentsData.js';
import PaymentsAndFeesSection from '../components/academics/PaymentsAndFeesSection';
import OnlineExamsSection from '../components/academics/OnlineExamsSection';
import ResultsSection from '../components/academics/ResultsSection';
import TimetableSection from '../components/academics/TimetableSection';
import AssignmentsSection from '../components/academics/AssignmentsSection';

export default function AcademicsPage({ defaultTab }) {
  const { user } = useApp();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Fees & Payments schedule state (synced with paymentsData)
  const [feeSchedule, setFeeSchedule] = useState(ACADEMIC_FEE_SCHEDULE);

  const isFaculty =
    (user?.role || '').toLowerCase() === 'faculty' ||
    (user?.email || '').includes('faculty') ||
    (user?.name || '').toLowerCase().includes('dr.');

  // Active sub-section tab ('attendance', 'assignments', 'timetable', 'exams', or 'fees' for students)
  const initialTab =
    defaultTab ||
    (!isFaculty && searchParams.get('tab') === 'fees'
      ? 'fees'
      : searchParams.get('tab') === 'exams'
      ? 'exams'
      : searchParams.get('tab') === 'assignments'
      ? 'assignments'
      : searchParams.get('tab') === 'timetable'
      ? 'timetable'
      : searchParams.get('tab') === 'attendance'
      ? 'attendance'
      : 'attendance');
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync tab with URL search parameter if defaultTab prop changes or user navigates
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    } else {
      const urlTab = searchParams.get('tab');
      if (urlTab === 'attendance') {
        setActiveTab('attendance');
      } else if (urlTab === 'assignments') {
        setActiveTab('assignments');
      } else if (urlTab === 'timetable') {
        setActiveTab('timetable');
      } else if (urlTab === 'fees') {
        if (!isFaculty) {
          setActiveTab('fees');
        } else {
          setActiveTab('attendance');
        }
      } else if (urlTab === 'exams') {
        setActiveTab('exams');
      } else if (urlTab === 'curriculum') {
        setActiveTab('curriculum');
      }
    }
  }, [searchParams, defaultTab, isFaculty]);

  const handleTabSwitch = (tabKey) => {
    setActiveTab(tabKey);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tabKey === 'curriculum') {
        next.delete('tab');
      } else {
        next.set('tab', tabKey);
      }
      return next;
    });
  };

  // Parse user's default semester number (e.g., '7th Semester' -> 7)
  const defaultSemNum = useMemo(() => {
    if (!user?.semester) return 7;
    const match = String(user.semester).match(/\d+/);
    return match ? parseInt(match[0], 10) : 7;
  }, [user?.semester]);

  // Semester selected in UI (for curriculum & attendance)
  const [selectedSem, setSelectedSem] = useState(defaultSemNum);

  // ----------------------------------------------------
  // CURRICULUM STATE
  // ----------------------------------------------------
  const [selectedType, setSelectedType] = useState('All');
  const [curriculumSearchQuery, setCurriculumSearchQuery] = useState('');
  const [expandedSubjectCodes, setExpandedSubjectCodes] = useState({});
  const [bookmarkedCodes, setBookmarkedCodes] = useState({ CS401: true, CS403: true });

  const currentSemesterCurriculum = ACADEMIC_CURRICULUM[selectedSem] || {
    semester: `${selectedSem}th Semester`,
    totalCredits: 0,
    academicSession: 'Regular Session',
    subjects: [],
  };

  const subjectTypes = ['All', 'Core Theory', 'Practical / Lab', 'Professional Elective', 'Capstone / Project'];

  const filteredCurriculumSubjects = useMemo(() => {
    return currentSemesterCurriculum.subjects.filter((subject) => {
      const matchesType =
        selectedType === 'All' ||
        subject.type === selectedType ||
        (selectedType === 'Core Theory' && subject.type.includes('Core')) ||
        (selectedType === 'Practical / Lab' && (subject.type.includes('Lab') || subject.type.includes('Practical')));

      const query = curriculumSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        subject.code.toLowerCase().includes(query) ||
        subject.title.toLowerCase().includes(query) ||
        subject.instructor.toLowerCase().includes(query) ||
        subject.room.toLowerCase().includes(query) ||
        subject.description.toLowerCase().includes(query) ||
        (subject.modules && subject.modules.some((m) => m.toLowerCase().includes(query)));

      return matchesType && matchesSearch;
    });
  }, [currentSemesterCurriculum.subjects, selectedType, curriculumSearchQuery]);

  // ----------------------------------------------------
  // ATTENDANCE STATE
  // ----------------------------------------------------
  const [attendanceSubjectFilter, setAttendanceSubjectFilter] = useState('All');
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState('All'); // 'All', 'Present', 'Absent', 'Excused'
  const [attendanceSearchQuery, setAttendanceSearchQuery] = useState('');
  const [expandedAttendanceCodes, setExpandedAttendanceCodes] = useState({});

  // Modals state
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simulatedExtraClasses, setSimulatedExtraClasses] = useState(10);
  const [simulatedClassesAttended, setSimulatedClassesAttended] = useState(8);

  const [isExemptionModalOpen, setIsExemptionModalOpen] = useState(false);
  const [selectedSessionForExemption, setSelectedSessionForExemption] = useState(null);
  const [exemptionReason, setExemptionReason] = useState('Medical Leave with doctor certificate');
  const [exemptionRemarks, setExemptionRemarks] = useState('');

  // Get attendance data for selected semester
  const semesterAttendanceData = SEMESTER_ATTENDANCE_REGISTRY[selectedSem] || SEMESTER_ATTENDANCE_REGISTRY[7];

  // Helper to jump from curriculum card directly to attendance for that subject
  const jumpToSubjectAttendance = (subjectCode) => {
    setActiveTab('attendance');
    setSearchParams({ tab: 'attendance' });
    setAttendanceSubjectFilter(subjectCode);
    setExpandedAttendanceCodes((prev) => ({ ...prev, [subjectCode]: true }));
  };

  // Filtered attendance subjects and sessions
  const filteredAttendanceSubjects = useMemo(() => {
    let list = semesterAttendanceData.subjects;

    if (attendanceSubjectFilter !== 'All') {
      list = list.filter((s) => s.subjectCode === attendanceSubjectFilter);
    }

    // Filter sessions inside each subject based on status & search query
    return list.map((sub) => {
      const filteredSessions = sub.sessions.filter((sess) => {
        // Status filter
        const matchesStatus =
          attendanceStatusFilter === 'All' || sess.status === attendanceStatusFilter;

        // Search query
        const q = attendanceSearchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          sess.date.toLowerCase().includes(q) ||
          sess.formattedDate.toLowerCase().includes(q) ||
          sess.classTime.toLowerCase().includes(q) ||
          sess.topic.toLowerCase().includes(q) ||
          sess.room.toLowerCase().includes(q) ||
          sess.dayOfWeek.toLowerCase().includes(q);

        return matchesStatus && matchesSearch;
      });

      return {
        ...sub,
        filteredSessions,
      };
    });
  }, [semesterAttendanceData.subjects, attendanceSubjectFilter, attendanceStatusFilter, attendanceSearchQuery]);

  // Statistics for curriculum
  const totalCredits = currentSemesterCurriculum.totalCredits;
  const theoryCount = currentSemesterCurriculum.subjects.filter((s) => s.type === 'Core Theory').length;
  const labCount = currentSemesterCurriculum.subjects.filter((s) => s.type.includes('Lab') || s.type.includes('Practical')).length;
  const electiveCount = currentSemesterCurriculum.subjects.filter((s) => s.type.includes('Elective')).length;

  const toggleExpandSubject = (code) => {
    setExpandedSubjectCodes((prev) => ({
      ...prev,
      [code]: !prev[code],
    }));
  };

  const toggleExpandAttendanceSessions = (code) => {
    setExpandedAttendanceCodes((prev) => ({
      ...prev,
      [code]: prev[code] !== false ? false : true,
    }));
  };

  const toggleBookmark = (code, title) => {
    setBookmarkedCodes((prev) => {
      const isCurrently = !!prev[code];
      const next = { ...prev, [code]: !isCurrently };
      addToast({
        title: isCurrently ? 'Removed from Study Plan' : 'Saved to Study Plan',
        message: isCurrently
          ? `${code} removed from your saved courses.`
          : `${code}: ${title} saved for quick reference.`,
        type: isCurrently ? 'info' : 'success',
      });
      return next;
    });
  };

  const handleDownloadSyllabus = (subject) => {
    addToast({
      title: 'Downloading Course Syllabus',
      message: `Generating ${subject.code}_Syllabus_Spring2026.pdf for offline reading...`,
      type: 'info',
    });
  };

  const handleOpenResources = (subject) => {
    addToast({
      title: 'Course Materials & Lecture Slides',
      message: `Opening shared drive repository for ${subject.code} (${subject.instructor}).`,
      type: 'success',
    });
  };

  // Download Attendance CSV
  const handleDownloadAttendanceCSV = () => {
    const headers = ['Semester', 'Subject Code', 'Subject Title', 'Date', 'Class Time', 'Day', 'Topic', 'Room', 'Faculty', 'Status', 'Verification Mode'];
    const rows = [];

    semesterAttendanceData.subjects.forEach((subj) => {
      subj.sessions.forEach((sess) => {
        rows.push([
          `"${semesterAttendanceData.semesterName}"`,
          `"${subj.subjectCode}"`,
          `"${subj.subjectTitle}"`,
          `"${sess.date}"`,
          `"${sess.classTime}"`,
          `"${sess.dayOfWeek}"`,
          `"${sess.topic.replace(/"/g, '""')}"`,
          `"${sess.room}"`,
          `"${sess.instructor}"`,
          `"${sess.status}"`,
          `"${sess.mode}"`,
        ]);
      });
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CampusHub_Attendance_${semesterAttendanceData.semesterName.replace(/\s+/g, '_')}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      title: 'Attendance CSV Exported',
      message: `Downloaded complete attendance logs with date & class time for ${semesterAttendanceData.semesterName}.`,
      type: 'success',
    });
  };

  const handleDownloadAttendancePDF = () => {
    addToast({
      title: 'Generating Attendance Transcript PDF',
      message: `Compiled official transcript for ${semesterAttendanceData.semesterName} with QR verification code.`,
      type: 'info',
    });
  };

  const handleOpenExemptionModal = (session, subjectCode) => {
    setSelectedSessionForExemption({ ...session, subjectCode });
    setIsExemptionModalOpen(true);
  };

  const handleSubmitExemption = (e) => {
    e.preventDefault();
    setIsExemptionModalOpen(false);
    addToast({
      title: 'Exemption Application Submitted',
      message: `Request for ${selectedSessionForExemption?.subjectCode} on ${selectedSessionForExemption?.formattedDate} (${selectedSessionForExemption?.classTime}) sent to Department Head for review.`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Department Info Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-50 text-[#DC2626] border border-red-100">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#171717] tracking-tight">
                Academic Portal
              </h1>
              <p className="text-xs sm:text-sm text-[#737373] mt-0.5">
                Manage curriculum, faculty syllabi, and track class-by-class attendance with exact dates and timings.
              </p>
            </div>
          </div>
        </div>

        {/* Current Student Academic Meta Pill */}
        <div className="flex items-center gap-2.5 p-2 px-3 rounded-xl border border-[#E5E5E5] bg-white shadow-2xs self-start md:self-auto">
          <div className="p-1.5 rounded-lg bg-neutral-100 text-[#525252]">
            <Code2 className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#171717]">
                {user?.departmentCode || 'CSE'} Department
              </span>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Enrolled: {user?.semester || '7th Semester'}
              </span>
            </div>
            <span className="text-[11px] text-[#737373] block truncate max-w-[220px]">
              {user?.department || 'Computer Science & Engineering'}
            </span>
          </div>
        </div>
      </div>

      {/* Sub-sections Switcher Navigation Tabs */}
      <div className="border-b border-[#E5E5E5] flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {/* Sub-section 1: Attendance Tracker */}
          <button
            type="button"
            onClick={() => handleTabSwitch('attendance')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer relative ${
              activeTab === 'attendance'
                ? 'border-[#DC2626] text-[#DC2626]'
                : 'border-transparent text-[#737373] hover:text-[#171717] hover:border-neutral-300'
            }`}
          >
            <CalendarCheck className="h-4 w-4" />
            <span>Attendance Tracker</span>
            <span
              className={`ml-1 text-[11px] px-2 py-0.5 rounded-full font-bold border ${
                semesterAttendanceData.overallPercentage >= 75
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-red-50 text-[#DC2626] border-red-200'
              }`}
            >
              {semesterAttendanceData.overallPercentage}% Overall
            </span>
          </button>

          {/* Sub-section 3: Assignments */}
          <button
            type="button"
            onClick={() => handleTabSwitch('assignments')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer relative ${
              activeTab === 'assignments'
                ? 'border-[#DC2626] text-[#DC2626]'
                : 'border-transparent text-[#737373] hover:text-[#171717] hover:border-neutral-300'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Assignments</span>
            <span className="ml-1 text-[11px] px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Active Tasks
            </span>
          </button>

          {/* Sub-section 4: Class Timetable */}
          <button
            type="button"
            onClick={() => handleTabSwitch('timetable')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer relative ${
              activeTab === 'timetable'
                ? 'border-[#DC2626] text-[#DC2626]'
                : 'border-transparent text-[#737373] hover:text-[#171717] hover:border-neutral-300'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Class Timetable</span>
            <span className="ml-1 text-[11px] px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Weekly Routine
            </span>
          </button>

          {/* Sub-section 4: Online Exams */}
          <button
            type="button"
            onClick={() => handleTabSwitch('exams')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer relative ${
              activeTab === 'exams'
                ? 'border-[#DC2626] text-[#DC2626]'
                : 'border-transparent text-[#737373] hover:text-[#171717] hover:border-neutral-300'
            }`}
          >
            <Laptop className="h-4 w-4" />
            <span>Online Exams</span>
            <span className="ml-1 text-[11px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active Session
            </span>
          </button>

          {/* Sub-section: Semester Fees (Students Only) */}
          {!isFaculty && (
            <button
              type="button"
              onClick={() => handleTabSwitch('fees')}
              className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer relative ${
                activeTab === 'fees'
                  ? 'border-[#DC2626] text-[#DC2626]'
                  : 'border-transparent text-[#737373] hover:text-[#171717] hover:border-neutral-300'
              }`}
            >
              <CreditCard className="h-4 w-4" />
              <span>Semester Fees</span>
              <span className="ml-1 text-[11px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Tuition & Dues
              </span>
            </button>
          )}
        </div>

        {/* Quick Help / Context Info */}
        {activeTab === 'attendance' && (
          <div className="flex items-center gap-2 pb-2 sm:pb-0">
            <button
              type="button"
              onClick={() => setIsPolicyModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs text-[#737373] hover:text-[#DC2626] transition-colors font-medium cursor-pointer"
            >
              <Info className="h-3.5 w-3.5" />
              <span>75% Attendance Criteria</span>
            </button>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="flex items-center gap-2 pb-2 sm:pb-0">
            <span className="inline-flex items-center gap-1.5 text-xs text-[#737373]">
              <FileText className="h-3.5 w-3.5 text-amber-600" />
              <span>Course Assignments & Project Submissions Portal</span>
            </span>
          </div>
        )}

        {activeTab === 'timetable' && (
          <div className="flex items-center gap-2 pb-2 sm:pb-0">
            <span className="inline-flex items-center gap-1.5 text-xs text-[#737373]">
              <Calendar className="h-3.5 w-3.5 text-blue-600" />
              <span>Official Department Class Routine & Timings</span>
            </span>
          </div>
        )}

        {activeTab === 'fees' && (
          <div className="flex items-center gap-2 pb-2 sm:pb-0">
            <span className="inline-flex items-center gap-1.5 text-xs text-[#737373]">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Secure University Finance Gateway</span>
            </span>
          </div>
        )}

        {activeTab === 'exams' && (
          <div className="flex items-center gap-2 pb-2 sm:pb-0">
            <span className="inline-flex items-center gap-1.5 text-xs text-[#737373]">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>AI Proctored Examination Suite</span>
            </span>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="flex items-center gap-2 pb-2 sm:pb-0">
            <span className="inline-flex items-center gap-1.5 text-xs text-[#737373]">
              <Sparkles className="h-3.5 w-3.5 text-purple-600" />
              <span>Official UGC 10-Point Grade Registry</span>
            </span>
          </div>
        )}
      </div>

      {/* Semester Selection Bar (Common for both Curriculum and Attendance) */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-3 sm:p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#737373] flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" /> Select Semester:
            </span>
            <span className="text-xs font-bold text-[#DC2626]">
              {currentSemesterCurriculum.semester}
            </span>
            <span className="text-xs text-[#737373]">
              ({currentSemesterCurriculum.academicSession})
            </span>
          </div>

          {selectedSem === defaultSemNum && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
              <Sparkles className="h-3 w-3" /> Your Current Semester
            </span>
          )}
        </div>

        {/* Semester Buttons (Sem 1 through Sem 8) */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {SEMESTERS_LIST.map((sem) => {
            const isSelected = selectedSem === sem.number;
            const isUserCurrent = defaultSemNum === sem.number;

            return (
              <button
                key={sem.id}
                type="button"
                onClick={() => {
                  setSelectedSem(sem.number);
                  setCurriculumSearchQuery('');
                  setSelectedType('All');
                  setAttendanceSubjectFilter('All');
                  setAttendanceSearchQuery('');
                }}
                className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-lg border text-center transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-[#DC2626] bg-[#FEF2F2] text-[#DC2626] font-bold shadow-xs ring-1 ring-[#DC2626]'
                    : 'border-[#E5E5E5] bg-[#FAFAFA] text-[#525252] hover:bg-white hover:border-neutral-300'
                }`}
              >
                {isUserCurrent && (
                  <span className="absolute -top-1.5 -right-1 px-1 py-0.2 rounded-full text-[9px] font-extrabold bg-[#DC2626] text-white">
                    You
                  </span>
                )}
                <span className="text-xs sm:text-sm font-bold">
                  {sem.shortName}
                </span>
                <span className="text-[10px] text-[#737373] truncate max-w-full">
                  Sem {sem.roman}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-SECTION 1: CURRICULUM & SUBJECTS                                     */}
      {/* ========================================================================= */}
      {activeTab === 'curriculum' && (
        <div className="space-y-6">
          {/* Semester Academic Overview Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-3.5 sm:p-4 rounded-xl border border-[#E5E5E5] bg-white">
              <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider block">
                Semester Credits
              </span>
              <p className="text-xl font-bold text-[#171717] mt-1">{totalCredits} Credits</p>
              <span className="text-[11px] text-[#737373] mt-0.5 block">Approved syllabus load</span>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl border border-[#E5E5E5] bg-white">
              <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider block">
                Theory Courses
              </span>
              <p className="text-xl font-bold text-[#171717] mt-1">{theoryCount} Subjects</p>
              <span className="text-[11px] text-[#737373] mt-0.5 block">Core curriculum</span>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl border border-[#E5E5E5] bg-white">
              <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider block">
                Practicals & Labs
              </span>
              <p className="text-xl font-bold text-[#171717] mt-1">{labCount} Labs</p>
              <span className="text-[11px] text-[#737373] mt-0.5 block">Hands-on systems work</span>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl border border-[#E5E5E5] bg-white">
              <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider block">
                Electives / Projects
              </span>
              <p className="text-xl font-bold text-[#171717] mt-1">
                {electiveCount || currentSemesterCurriculum.subjects.length - theoryCount - labCount} Tracks
              </p>
              <span className="text-[11px] text-[#737373] mt-0.5 block">Specialization areas</span>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="bg-white rounded-xl border border-[#E5E5E5] p-4 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Course Type Filter Tabs */}
              <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg w-fit overflow-x-auto">
                {subjectTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                      selectedType === type
                        ? 'bg-white text-[#171717] shadow-xs'
                        : 'text-[#737373] hover:text-[#171717]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="w-full md:w-80">
                <Input
                  placeholder="Search by code (CS401), title, or faculty..."
                  icon={Search}
                  value={curriculumSearchQuery}
                  onChange={(e) => setCurriculumSearchQuery(e.target.value)}
                  className="py-1.5 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Subjects List */}
          {filteredCurriculumSubjects.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No subjects match your query"
              description={`No courses found under ${currentSemesterCurriculum.semester} for "${curriculumSearchQuery || selectedType}".`}
              actionText="Clear Filters"
              onAction={() => {
                setCurriculumSearchQuery('');
                setSelectedType('All');
              }}
            />
          ) : (
            <div className="space-y-4">
              {filteredCurriculumSubjects.map((subject) => {
                const isExpanded = !!expandedSubjectCodes[subject.code];
                const isBookmarked = !!bookmarkedCodes[subject.code];
                const isLab = subject.type.includes('Lab') || subject.type.includes('Practical');
                const isElective = subject.type.includes('Elective');
                const isCapstone = subject.type.includes('Capstone') || subject.type.includes('Project');

                // Get quick attendance metric for this subject
                const subjAttendance = semesterAttendanceData.subjects.find((s) => s.subjectCode === subject.code);

                return (
                  <Card key={subject.code} className="hover:border-neutral-300 transition-all duration-150">
                    <CardHeader className="p-4 sm:p-5 pb-3">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          {/* Meta Tags Row */}
                          <div className="flex items-center gap-2 flex-wrap text-xs">
                            <span className="font-mono font-bold text-xs bg-neutral-100 text-[#171717] px-2 py-0.5 rounded border border-[#E5E5E5]">
                              {subject.code}
                            </span>

                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                                isLab
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : isElective
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : isCapstone
                                  ? 'bg-purple-50 text-purple-800 border-purple-200'
                                  : 'bg-neutral-50 text-[#525252] border-neutral-200'
                              }`}
                            >
                              {subject.type}
                            </span>

                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FAFAFA] text-[#737373] border border-[#E5E5E5]">
                              {subject.credits} Credits ({subject.hours})
                            </span>

                            {/* Attendance Quick Badge */}
                            {subjAttendance && (
                              <button
                                type="button"
                                onClick={() => jumpToSubjectAttendance(subject.code)}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer transition-colors ${
                                  subjAttendance.percentage >= 85
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                    : subjAttendance.percentage >= 75
                                    ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                                    : 'bg-red-50 text-[#DC2626] border-red-200 hover:bg-red-100'
                                }`}
                                title="Click to view detailed attendance history for this subject"
                              >
                                <CalendarCheck className="h-3 w-3" />
                                <span>{subjAttendance.percentage}% Attendance</span>
                                <ArrowRight className="h-2.5 w-2.5 ml-0.5" />
                              </button>
                            )}
                          </div>

                          {/* Course Title */}
                          <h3 className="text-base sm:text-lg font-bold text-[#171717]">
                            {subject.title}
                          </h3>

                          {/* Faculty, Timing & Room Row */}
                          <div className="flex items-center gap-4 text-xs text-[#737373] flex-wrap pt-0.5">
                            <span className="flex items-center gap-1 font-medium text-[#525252]">
                              <User className="h-3.5 w-3.5 text-[#737373]" />
                              {subject.instructor}
                              {subject.designation && (
                                <span className="text-[11px] text-[#737373] font-normal">
                                  ({subject.designation})
                                </span>
                              )}
                            </span>

                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-[#737373]" />
                              {subject.schedule}
                            </span>

                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-[#737373]" />
                              {subject.room}
                            </span>
                          </div>
                        </div>

                        {/* Bookmark / Study Plan Button */}
                        <div className="flex items-center gap-2 self-start">
                          <button
                            type="button"
                            onClick={() => toggleBookmark(subject.code, subject.title)}
                            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                              isBookmarked
                                ? 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]'
                                : 'bg-white border-[#E5E5E5] text-[#737373] hover:text-[#171717] hover:bg-neutral-50'
                            }`}
                            title={isBookmarked ? 'Saved in Study Plan' : 'Save to Study Plan'}
                            aria-label="Bookmark subject"
                          >
                            {isBookmarked ? (
                              <BookmarkCheck className="h-4 w-4" />
                            ) : (
                              <Bookmark className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4 sm:p-5 pt-0 space-y-3">
                      <p className="text-xs sm:text-sm text-[#525252] leading-relaxed">
                        {subject.description}
                      </p>

                      {/* Expanded Syllabus Breakdown */}
                      {isExpanded && (
                        <div className="mt-3 p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E5E5] space-y-4 animate-in fade-in duration-150">
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#171717] flex items-center gap-1.5 mb-2">
                              <BookOpen className="h-3.5 w-3.5 text-[#525252]" /> Syllabus Modules Breakdown
                            </h4>
                            <ul className="space-y-1.5 text-xs text-[#404040]">
                              {subject.modules.map((mod, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="font-bold text-[#DC2626] shrink-0 mt-0.5">•</span>
                                  <span className="leading-relaxed">{mod}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {subject.textbooks && subject.textbooks.length > 0 && (
                            <div className="pt-2 border-t border-[#E5E5E5]">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-[#737373] block mb-1">
                                Recommended Textbooks & References:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {subject.textbooks.map((book, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center text-[11px] px-2 py-0.5 rounded bg-white border border-[#E5E5E5] text-[#525252]"
                                  >
                                    {book}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="p-4 sm:p-5 pt-2 border-t border-[#E5E5E5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <button
                        type="button"
                        onClick={() => toggleExpandSubject(subject.code)}
                        className="flex items-center gap-1 font-semibold text-[#DC2626] hover:underline cursor-pointer self-start"
                      >
                        {isExpanded ? (
                          <>
                            <span>Hide Syllabus Modules</span>
                            <ChevronUp className="h-3.5 w-3.5" />
                          </>
                        ) : (
                          <>
                            <span>View Syllabus Modules ({subject.modules.length} Modules)</span>
                            <ChevronDown className="h-3.5 w-3.5" />
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-2 flex-wrap">
                        {subjAttendance && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            leftIcon={CalendarCheck}
                            onClick={() => jumpToSubjectAttendance(subject.code)}
                            className="text-xs font-semibold"
                          >
                            Attendance Logs
                          </Button>
                        )}

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          leftIcon={FileText}
                          onClick={() => handleDownloadSyllabus(subject)}
                          className="text-xs font-semibold"
                        >
                          Syllabus PDF
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          leftIcon={Clock}
                          onClick={() => handleTabSwitch('timetable')}
                          className="text-xs font-semibold"
                        >
                          Timetable
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          leftIcon={FileText}
                          onClick={() => handleTabSwitch('assignments')}
                          className="text-xs font-semibold"
                        >
                          Assignments
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          leftIcon={ExternalLink}
                          onClick={() => handleOpenResources(subject)}
                          className="text-xs font-semibold"
                        >
                          Resources
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-SECTION 2: ATTENDANCE TRACKER                                        */}
      {/* ========================================================================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Semester Overall Attendance Overview Card */}
          <div className="bg-white rounded-xl border border-[#E5E5E5] p-5 shadow-xs space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-4 border-b border-[#E5E5E5]">
              {/* Left: Overall Attendance Percentage Meter */}
              <div className="flex items-center gap-5">
                <div
                  className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center border shadow-xs shrink-0 ${
                    semesterAttendanceData.overallPercentage >= 85
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : semesterAttendanceData.overallPercentage >= 75
                      ? 'bg-amber-50 border-amber-200 text-amber-800'
                      : 'bg-red-50 border-red-200 text-[#DC2626]'
                  }`}
                >
                  <span className="text-2xl font-black tracking-tight">
                    {semesterAttendanceData.overallPercentage}%
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373]">
                    Overall
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-[#171717]">
                      {semesterAttendanceData.semesterName} Attendance
                    </h2>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border ${
                        semesterAttendanceData.isEligible
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-red-50 text-[#DC2626] border-red-200'
                      }`}
                    >
                      {semesterAttendanceData.isEligible ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Eligible for Examinations (≥ 75%)</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span>Shortage Alert (&lt; 75%)</span>
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-[#737373] mt-1">
                    Recorded across {semesterAttendanceData.totalSubjects} enrolled subjects for the {semesterAttendanceData.academicSession}.
                  </p>
                </div>
              </div>

              {/* Action Buttons: Export PDF, CSV & Simulator */}
              <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={Calculator}
                  onClick={() => setIsSimulatorOpen(!isSimulatorOpen)}
                  className="text-xs font-semibold"
                >
                  {isSimulatorOpen ? 'Hide Simulator' : 'Attendance Simulator'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={Download}
                  onClick={handleDownloadAttendanceCSV}
                  className="text-xs font-semibold"
                >
                  Export CSV
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  leftIcon={FileText}
                  onClick={handleDownloadAttendancePDF}
                  className="text-xs font-semibold"
                >
                  Download Transcript
                </Button>
              </div>
            </div>

            {/* Attendance Metric Counters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5]">
                <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider block">
                  Total Classes Held
                </span>
                <p className="text-xl font-bold text-[#171717] mt-1">
                  {semesterAttendanceData.totalClasses} Sessions
                </p>
                <span className="text-[11px] text-[#737373] mt-0.5 block">Scheduled & conducted</span>
              </div>

              <div className="p-3.5 rounded-lg bg-emerald-50/50 border border-emerald-100">
                <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                  Classes Attended
                </span>
                <p className="text-xl font-bold text-emerald-800 mt-1">
                  {semesterAttendanceData.totalAttended} Sessions
                </p>
                <span className="text-[11px] text-emerald-700 mt-0.5 block">Physically verified</span>
              </div>

              <div className="p-3.5 rounded-lg bg-blue-50/50 border border-blue-100">
                <span className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider block">
                  Duty / Medical Leave
                </span>
                <p className="text-xl font-bold text-blue-800 mt-1">
                  {semesterAttendanceData.totalExcused} Approved
                </p>
                <span className="text-[11px] text-blue-700 mt-0.5 block">Granted condonation</span>
              </div>

              <div className="p-3.5 rounded-lg bg-red-50/50 border border-red-100">
                <span className="text-[11px] font-semibold text-red-800 uppercase tracking-wider block">
                  Classes Missed
                </span>
                <p className="text-xl font-bold text-[#DC2626] mt-1">
                  {semesterAttendanceData.totalAbsent} Unexcused
                </p>
                <span className="text-[11px] text-red-700 mt-0.5 block">Recorded absences</span>
              </div>
            </div>

            {/* University 75% Rule Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#525252] flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[#DC2626]" />
                  Minimum Mandatory Attendance Benchmark (Academic Regulation)
                </span>
                <span className="font-bold text-[#171717]">
                  {semesterAttendanceData.overallPercentage}% / 75.0% Required
                </span>
              </div>

              {/* Track bar with 75% indicator line */}
              <div className="relative h-3 w-full bg-neutral-100 rounded-full overflow-hidden border border-[#E5E5E5]">
                {/* 75% benchmark indicator */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-neutral-900 z-10"
                  style={{ left: '75%' }}
                  title="75% Mandatory Cutoff"
                />

                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    semesterAttendanceData.overallPercentage >= 85
                      ? 'bg-emerald-500'
                      : semesterAttendanceData.overallPercentage >= 75
                      ? 'bg-amber-500'
                      : 'bg-[#DC2626]'
                  }`}
                  style={{ width: `${Math.min(100, semesterAttendanceData.overallPercentage)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#737373]">
                <span>0%</span>
                <span className="font-bold text-[#171717]">75% Mandatory Threshold</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Interactive Attendance Simulator (Expandable) */}
          {isSimulatorOpen && (
            <Card className="bg-[#FEF2F2]/30 border-red-200 animate-in fade-in duration-150">
              <CardHeader className="p-4 sm:p-5 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-4.5 w-4.5 text-[#DC2626]" />
                    <CardTitle className="text-sm font-bold text-[#171717]">
                      Attendance Goal & Bunk Projection Simulator
                    </CardTitle>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSimulatorOpen(false)}
                    className="text-xs text-[#737373] hover:text-[#171717] font-semibold"
                  >
                    Close
                  </button>
                </div>
                <CardDescription className="text-xs text-[#525252]">
                  Simulate future class sessions to calculate what your final attendance percentage will be.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 pt-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#525252] block mb-1">
                      Upcoming classes remaining: {simulatedExtraClasses}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={simulatedExtraClasses}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setSimulatedExtraClasses(val);
                        if (simulatedClassesAttended > val) setSimulatedClassesAttended(val);
                      }}
                      className="w-full accent-[#DC2626] cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#525252] block mb-1">
                      Classes you plan to attend: {simulatedClassesAttended} of {simulatedExtraClasses}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max={simulatedExtraClasses}
                      value={simulatedClassesAttended}
                      onChange={(e) => setSimulatedClassesAttended(parseInt(e.target.value, 10))}
                      className="w-full accent-[#DC2626] cursor-pointer"
                    />
                  </div>
                </div>

                {/* Projected Result */}
                {(() => {
                  const projectedTotal = semesterAttendanceData.totalClasses + simulatedExtraClasses;
                  const projectedAttended = semesterAttendanceData.totalAttended + semesterAttendanceData.totalExcused + simulatedClassesAttended;
                  const projectedPct = ((projectedAttended / projectedTotal) * 100).toFixed(1);
                  const isProjSafe = parseFloat(projectedPct) >= 75.0;

                  return (
                    <div className="p-3 rounded-lg bg-white border border-[#E5E5E5] flex items-center justify-between flex-wrap gap-2 text-xs">
                      <div>
                        <span className="text-[#737373] block">Simulated Final Attendance:</span>
                        <span className="text-base font-extrabold text-[#171717]">
                          {projectedPct}% ({projectedAttended} of {projectedTotal} sessions)
                        </span>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold border ${
                          isProjSafe
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-red-50 text-[#DC2626] border-red-200'
                        }`}
                      >
                        {isProjSafe ? '✓ Exam Eligible (≥ 75%)' : '⚠ At Risk of Shortage (< 75%)'}
                      </span>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          {/* Subject Filter Chips & Search Bar */}
          <div className="bg-white rounded-xl border border-[#E5E5E5] p-4 shadow-xs space-y-3">
            {/* Subject Selector Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#737373] block">
                Filter by Subject in {semesterAttendanceData.semesterName}:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setAttendanceSubjectFilter('All')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                    attendanceSubjectFilter === 'All'
                      ? 'bg-[#171717] text-white border-[#171717] shadow-xs'
                      : 'bg-[#FAFAFA] text-[#525252] border-[#E5E5E5] hover:bg-neutral-100'
                  }`}
                >
                  All Subjects ({semesterAttendanceData.subjects.length})
                </button>

                {semesterAttendanceData.subjects.map((sub) => {
                  const isSelected = attendanceSubjectFilter === sub.subjectCode;
                  return (
                    <button
                      key={sub.subjectCode}
                      type="button"
                      onClick={() => setAttendanceSubjectFilter(sub.subjectCode)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? 'bg-[#FEF2F2] text-[#DC2626] border-[#DC2626] shadow-xs font-bold ring-1 ring-[#DC2626]'
                          : 'bg-[#FAFAFA] text-[#525252] border-[#E5E5E5] hover:bg-neutral-100'
                      }`}
                    >
                      <span className="font-mono">{sub.subjectCode}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                          sub.percentage >= 85
                            ? 'bg-emerald-100 text-emerald-800'
                            : sub.percentage >= 75
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-[#DC2626]'
                        }`}
                      >
                        {sub.percentage}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Second row: Status filter & search bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-[#E5E5E5]">
              {/* Status Tabs */}
              <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg w-fit">
                {['All', 'Present', 'Absent', 'Excused'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setAttendanceStatusFilter(status)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      attendanceStatusFilter === status
                        ? 'bg-white text-[#171717] shadow-xs'
                        : 'text-[#737373] hover:text-[#171717]'
                    }`}
                  >
                    {status} Sessions
                  </button>
                ))}
              </div>

              {/* Search by date or topic */}
              <div className="w-full md:w-80">
                <Input
                  placeholder="Search date (Sep 28), time, topic..."
                  icon={Search}
                  value={attendanceSearchQuery}
                  onChange={(e) => setAttendanceSearchQuery(e.target.value)}
                  className="py-1.5 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Subject Attendance Cards with Detailed Sessions Log (Date & Class Time) */}
          {filteredAttendanceSubjects.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No subjects or sessions found"
              description={`No attendance records matched your filter criteria.`}
              actionText="Reset Filters"
              onAction={() => {
                setAttendanceSubjectFilter('All');
                setAttendanceStatusFilter('All');
                setAttendanceSearchQuery('');
              }}
            />
          ) : (
            <div className="space-y-6">
              {filteredAttendanceSubjects.map((subject) => {
                const isSessionsOpen = expandedAttendanceCodes[subject.subjectCode] !== false;
                const sessionsToShow = subject.filteredSessions || [];

                return (
                  <Card key={subject.subjectCode} className="border-[#E5E5E5] shadow-xs overflow-hidden">
                    {/* Subject Attendance Header */}
                    <CardHeader className="p-4 sm:p-5 bg-white border-b border-[#E5E5E5]">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          {/* Subject Meta Tags */}
                          <div className="flex items-center gap-2 flex-wrap text-xs">
                            <span className="font-mono font-bold text-xs bg-neutral-100 text-[#171717] px-2 py-0.5 rounded border border-[#E5E5E5]">
                              {subject.subjectCode}
                            </span>
                            <span className="text-[11px] font-semibold text-[#525252] bg-[#FAFAFA] px-2 py-0.5 rounded border border-[#E5E5E5]">
                              {subject.type} • {subject.credits} Credits
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                                subject.percentage >= 85
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : subject.percentage >= 75
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-red-50 text-[#DC2626] border-red-200'
                              }`}
                            >
                              {subject.statusBadge} ({subject.percentage}%)
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="text-base sm:text-lg font-bold text-[#171717]">
                            {subject.subjectTitle}
                          </h3>

                          {/* Instructor, Weekly Schedule & Room */}
                          <div className="flex items-center gap-4 text-xs text-[#737373] flex-wrap pt-0.5">
                            <span className="flex items-center gap-1 font-medium text-[#525252]">
                              <User className="h-3.5 w-3.5 text-[#737373]" />
                              {subject.instructor}
                            </span>

                            <span className="flex items-center gap-1 font-semibold text-[#171717] bg-red-50/80 text-[#DC2626] px-2 py-0.5 rounded border border-red-100">
                              <Clock className="h-3.5 w-3.5 text-[#DC2626]" />
                              Schedule: {subject.schedule}
                            </span>

                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-[#737373]" />
                              {subject.room}
                            </span>
                          </div>
                        </div>

                        {/* Subject Progress Gauge */}
                        <div className="p-3 px-4 rounded-xl bg-[#FAFAFA] border border-[#E5E5E5] flex flex-col justify-center min-w-[240px] space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-[#171717]">Subject Attendance</span>
                            <span
                              className={`font-black text-sm ${
                                subject.percentage >= 75 ? 'text-emerald-700' : 'text-[#DC2626]'
                              }`}
                            >
                              {subject.percentage}%
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="relative h-2.5 w-full bg-neutral-200 rounded-full overflow-hidden">
                            <div
                              className="absolute top-0 bottom-0 w-0.5 bg-neutral-800 z-10"
                              style={{ left: '75%' }}
                              title="75% minimum"
                            />
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                subject.percentage >= 85
                                  ? 'bg-emerald-500'
                                  : subject.percentage >= 75
                                  ? 'bg-amber-500'
                                  : 'bg-[#DC2626]'
                              }`}
                              style={{ width: `${Math.min(100, subject.percentage)}%` }}
                            />
                          </div>

                          {/* Tally */}
                          <div className="flex items-center justify-between text-[11px] text-[#737373]">
                            <span>
                              <strong className="text-emerald-700">{subject.attendedClasses}</strong> Present
                            </span>
                            <span>
                              <strong className="text-blue-700">{subject.excusedClasses}</strong> Leave
                            </span>
                            <span>
                              <strong className="text-[#DC2626]">{subject.absentClasses}</strong> Absent
                            </span>
                            <span>
                              Total: <strong>{subject.totalClasses}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Policy recommendation message */}
                      <div className="mt-3 text-xs flex items-center justify-between gap-2 pt-2 border-t border-[#E5E5E5]">
                        <span className="text-[#525252] flex items-center gap-1.5">
                          <Info className="h-3.5 w-3.5 text-[#737373]" />
                          {subject.statusNote}
                        </span>

                        <button
                          type="button"
                          onClick={() => toggleExpandAttendanceSessions(subject.subjectCode)}
                          className="font-bold text-[#DC2626] hover:underline cursor-pointer flex items-center gap-1 shrink-0"
                        >
                          {isSessionsOpen ? (
                            <>
                              <span>Collapse Session History</span>
                              <ChevronUp className="h-3.5 w-3.5" />
                            </>
                          ) : (
                            <>
                              <span>View All {sessionsToShow.length} Sessions (Date & Class Time)</span>
                              <ChevronDown className="h-3.5 w-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    </CardHeader>

                    {/* Detailed Sessions List with EXACT DATE and CLASS TIME */}
                    {isSessionsOpen && (
                      <CardContent className="p-0 bg-[#FAFAFA]">
                        {sessionsToShow.length === 0 ? (
                          <div className="p-6 text-center text-xs text-[#737373]">
                            No class sessions found matching your filter criteria.
                          </div>
                        ) : (
                          <div className="divide-y divide-[#E5E5E5]">
                            {/* Table Header Bar for sessions */}
                            <div className="grid grid-cols-12 gap-2 px-4 sm:px-5 py-2.5 bg-neutral-100 text-[11px] font-bold text-[#525252] uppercase tracking-wider">
                              <div className="col-span-12 sm:col-span-4">Date & Class Time</div>
                              <div className="hidden sm:block sm:col-span-5">Lecture Topic & Venue</div>
                              <div className="col-span-12 sm:col-span-3 text-left sm:text-right">Attendance Status</div>
                            </div>

                            {/* Session Rows */}
                            {sessionsToShow.map((sess) => {
                              const isPresent = sess.status === 'Present';
                              const isAbsent = sess.status === 'Absent';
                              const isExcused = sess.status === 'Excused';

                              return (
                                <div
                                  key={sess.id}
                                  className="grid grid-cols-12 gap-2 px-4 sm:px-5 py-3 items-center hover:bg-white transition-colors"
                                >
                                  {/* Date and Class Time Mentioned */}
                                  <div className="col-span-12 sm:col-span-4 space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                      <Calendar className="h-3.5 w-3.5 text-[#DC2626] shrink-0" />
                                      <span className="text-xs font-bold text-[#171717]">
                                        {sess.formattedDate}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 pl-5">
                                      <Clock className="h-3 w-3 text-[#737373] shrink-0" />
                                      <span className="text-xs font-semibold text-[#DC2626] font-mono">
                                        {sess.classTime}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Topic, Session Type & Classroom */}
                                  <div className="col-span-12 sm:col-span-5 space-y-0.5">
                                    <p className="text-xs font-medium text-[#171717] line-clamp-1">
                                      {sess.topic}
                                    </p>
                                    <div className="flex items-center gap-2 text-[11px] text-[#737373]">
                                      <span>{sess.sessionType}</span>
                                      <span>•</span>
                                      <span>{sess.room}</span>
                                    </div>
                                  </div>

                                  {/* Status Badge & Action */}
                                  <div className="col-span-12 sm:col-span-3 flex items-center sm:justify-end gap-2">
                                    <span
                                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold border ${
                                        isPresent
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                          : isExcused
                                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                                          : 'bg-red-50 text-[#DC2626] border-red-200'
                                      }`}
                                    >
                                      {isPresent && <CheckCircle2 className="h-3.5 w-3.5" />}
                                      {isExcused && <FileCheck2 className="h-3.5 w-3.5" />}
                                      {isAbsent && <XCircle className="h-3.5 w-3.5" />}
                                      <span>{sess.status}</span>
                                    </span>

                                    {/* Action button if absent */}
                                    {isAbsent && (
                                      <button
                                        type="button"
                                        onClick={() => handleOpenExemptionModal(sess, subject.subjectCode)}
                                        className="text-[11px] font-semibold text-[#DC2626] hover:underline cursor-pointer ml-1"
                                      >
                                        Dispute / Leave
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-SECTION 3: ASSIGNMENTS & PROJECT SUBMISSIONS                          */}
      {/* ========================================================================= */}
      {activeTab === 'assignments' && (
        <AssignmentsSection
          selectedSem={selectedSem}
          onSelectSem={(sNum) => setSelectedSem(sNum)}
          user={user}
          onSwitchToCurriculum={() => handleTabSwitch('curriculum')}
        />
      )}

      {/* ========================================================================= */}
      {/* SUB-SECTION 4: CLASS TIMETABLE                                            */}
      {/* ========================================================================= */}
      {activeTab === 'timetable' && (
        <TimetableSection
          selectedSem={selectedSem}
          onSelectSem={(sNum) => setSelectedSem(sNum)}
          user={user}
          onSwitchToCurriculum={() => handleTabSwitch('curriculum')}
        />
      )}

      {/* ========================================================================= */}
      {/* SUB-SECTION: SEMESTER FEES (STUDENTS ONLY)                                */}
      {/* ========================================================================= */}
      {!isFaculty && activeTab === 'fees' && (
        <PaymentsAndFeesSection
          selectedSem={selectedSem}
          onSelectSem={(sNum) => setSelectedSem(sNum)}
          user={user}
          feeSchedule={feeSchedule}
          onUpdateFeeSchedule={(newSchedule) => setFeeSchedule(newSchedule)}
        />
      )}

      {/* ========================================================================= */}
      {/* SUB-SECTION 4: ONLINE EXAMS                                              */}
      {/* ========================================================================= */}
      {activeTab === 'exams' && (
        <OnlineExamsSection
          selectedSem={selectedSem}
          onSelectSem={(sNum) => setSelectedSem(sNum)}
          user={user}
        />
      )}

      {/* ========================================================================= */}
      {/* SUB-SECTION 5: RESULTS & GRADE CARDS                                     */}
      {/* ========================================================================= */}
      {activeTab === 'results' && (
        <ResultsSection
          selectedSem={selectedSem}
          onSelectSem={(sNum) => setSelectedSem(sNum)}
          user={user}
        />
      )}

      {/* ========================================================================= */}
      {/* MODALS                                                                   */}
      {/* ========================================================================= */}

      {/* 1. Official 75% Attendance Regulation Modal */}
      <Modal
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
        title="University Academic Attendance Regulations"
        description="Statutory guidelines mandated by the Academic Council for semester examinations"
      >
        <div className="space-y-4 text-xs text-[#525252]">
          <div className="p-3.5 rounded-lg bg-red-50 border border-red-100 flex items-start gap-2.5">
            <AlertTriangle className="h-4.5 w-4.5 text-[#DC2626] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#DC2626] text-xs">
                Mandatory 75% Minimum Cutoff Rule
              </p>
              <p className="text-[11px] text-red-800 mt-0.5 leading-relaxed">
                Students must maintain a minimum of 75% attendance in each registered theory and laboratory subject to be eligible to appear for Semester End Examinations (SEE).
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-[#171717] text-xs uppercase tracking-wider">
              Statutory Clauses:
            </h4>
            <ul className="space-y-2 list-disc list-inside">
              <li>
                <strong>Condonation Range (65% to 74%):</strong> Allowed only on valid medical grounds, official university sports representation, or sanctioned conference presentations with Dean approval.
              </li>
              <li>
                <strong>Detention Below 60%:</strong> Students with overall or subject attendance below 60% are ineligible for condonation and must repeat the course during subsequent summer or regular terms.
              </li>
              <li>
                <strong>Automated Biometric Logging:</strong> Attendance is registered within the first 10 minutes of scheduled class time via classroom doorway RFID terminals.
              </li>
            </ul>
          </div>
        </div>
      </Modal>

      {/* 2. Leave / Exemption Application Modal */}
      <Modal
        isOpen={isExemptionModalOpen}
        onClose={() => setIsExemptionModalOpen(false)}
        title="Submit Attendance Exemption Request"
        description="Apply for duty leave or medical condonation for missed class sessions"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsExemptionModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSubmitExemption}
            >
              Submit Application
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmitExemption} className="space-y-4 text-xs">
          {selectedSessionForExemption && (
            <div className="p-3 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] space-y-1">
              <span className="font-bold text-[#171717] block">
                Session Selected: {selectedSessionForExemption.subjectCode}
              </span>
              <p className="text-[#737373]">
                Date: <strong>{selectedSessionForExemption.formattedDate}</strong>
              </p>
              <p className="text-[#DC2626] font-mono">
                Class Time: <strong>{selectedSessionForExemption.classTime}</strong>
              </p>
            </div>
          )}

          <div>
            <label className="block font-bold text-[#171717] mb-1">
              Exemption Category:
            </label>
            <select
              value={exemptionReason}
              onChange={(e) => setExemptionReason(e.target.value)}
              className="w-full p-2 border border-[#E5E5E5] rounded-lg bg-white text-xs text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#DC2626]"
            >
              <option value="Medical Leave with doctor certificate">Medical Leave with physician certificate</option>
              <option value="University Event / Hackathon Representation">Official College Hackathon / Event Duty</option>
              <option value="Placement Drive / Corporate Interview">Campus Placement / Technical Interview</option>
              <option value="Biometric Terminal Glitch / Card Error">Biometric Terminal Discrepancy / Scanner Glitch</option>
              <option value="Family Emergency">Emergency Personal Leave</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#171717] mb-1">
              Supporting Remarks / Doctor or Supervisor Details:
            </label>
            <textarea
              rows={3}
              value={exemptionRemarks}
              onChange={(e) => setExemptionRemarks(e.target.value)}
              placeholder="Provide doctor name, clinic registration number, or event faculty coordinator name..."
              className="w-full p-2 border border-[#E5E5E5] rounded-lg bg-white text-xs text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#DC2626]"
            />
          </div>

          <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 text-[11px] text-[#737373]">
            Exemption applications are digitally routed to the CSE Department HOD and verified within 48 business hours.
          </div>
        </form>
      </Modal>
    </div>
  );
}
