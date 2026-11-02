import React, { useState, useMemo } from 'react';
import {
  FileText,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  ExternalLink,
  Download,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Award,
  Sparkles,
  Info,
  BookOpen,
  Send,
  Link2,
  FileCheck2,
  AlertTriangle,
  RotateCcw,
  Check,
  GraduationCap,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import EmptyState from '../ui/EmptyState';
import { useToast } from '../ui/Toast';
import {
  SEMESTER_ASSIGNMENTS,
  ASSIGNMENT_STATUS_TYPES,
  ASSIGNMENT_GRADING_SCALE,
  getAlphabetGrade,
} from '../../data/assignmentsData.js';

export default function AssignmentsSection({ selectedSem, onSelectSem, user, onSwitchToCurriculum }) {
  const { addToast } = useToast();

  // Local state for assignments list (allows interactive submissions & redos)
  const semesterData = SEMESTER_ASSIGNMENTS[selectedSem] || {
    semester: `${selectedSem}th Semester`,
    academicSession: 'Academic Term 2026',
    assignments: [],
  };

  const [assignmentsList, setAssignmentsList] = useState(semesterData.assignments);

  // Sync if selectedSem changes
  React.useEffect(() => {
    const nextData = SEMESTER_ASSIGNMENTS[selectedSem] || {
      semester: `${selectedSem}th Semester`,
      academicSession: 'Academic Term 2026',
      assignments: [],
    };
    setAssignmentsList(nextData.assignments);
  }, [selectedSem]);

  // Filters & Search
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [courseFilter, setCourseFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState({});

  // Modals & Scale Guide
  const [submissionModalAssignment, setSubmissionModalAssignment] = useState(null);
  const [feedbackModalAssignment, setFeedbackModalAssignment] = useState(null);
  const [isScaleGuideOpen, setIsScaleGuideOpen] = useState(false);

  // Submission Form State
  const [uploadedFile, setUploadedFile] = useState(null);
  const [githubUrl, setGithubUrl] = useState('');
  const [submissionRemarks, setSubmissionRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedoMode, setIsRedoMode] = useState(false);

  // Get distinct course codes for the filter dropdown
  const uniqueCourses = useMemo(() => {
    const courses = new Set(assignmentsList.map((a) => a.courseCode));
    return ['All', ...Array.from(courses)];
  }, [assignmentsList]);

  // Compute metrics
  const totalCount = assignmentsList.length;
  const pendingCount = assignmentsList.filter((a) => a.status === 'pending').length;
  const submittedCount = assignmentsList.filter((a) => a.status === 'submitted').length;
  const gradedAssignments = assignmentsList.filter((a) => a.status === 'graded' && a.submission?.score != null);
  const gradedCount = gradedAssignments.length;

  // Count redo required (Grade F)
  const redoCount = assignmentsList.filter((a) => {
    if (a.status !== 'graded') return false;
    const alpha = getAlphabetGrade(a.submission?.score, a.maxMarks);
    return alpha?.isRedo || a.submission?.letterGrade === 'F' || a.submission?.isRedo;
  }).length;

  // Average numeric score & average Grade Point (out of 10.0)
  const avgScore = gradedAssignments.length > 0
    ? (
        gradedAssignments.reduce((acc, curr) => acc + (curr.submission.score / curr.maxMarks) * 100, 0) /
        gradedAssignments.length
      ).toFixed(1)
    : '95.0';

  const avgGradePoint = gradedAssignments.length > 0
    ? (
        gradedAssignments.reduce((acc, curr) => {
          const alpha = getAlphabetGrade(curr.submission?.score, curr.maxMarks);
          return acc + (alpha ? alpha.point : 10);
        }, 0) / gradedAssignments.length
      ).toFixed(1)
    : '10.0';

  const avgAlphaGrade = gradedAssignments.length > 0
    ? getAlphabetGrade(parseFloat(avgScore), 100)
    : { grade: 'O', point: 10, label: 'Outstanding' };

  // Filtered list
  const filteredAssignments = useMemo(() => {
    return assignmentsList.filter((asgn) => {
      const alpha = getAlphabetGrade(asgn.submission?.score, asgn.maxMarks);

      // Status filter
      if (selectedStatus === 'pending' && asgn.status !== 'pending') return false;
      if (selectedStatus === 'submitted' && asgn.status !== 'submitted') return false;
      if (selectedStatus === 'graded' && asgn.status !== 'graded') return false;
      if (selectedStatus === 'redo') {
        const isRedo = alpha?.isRedo || asgn.submission?.isRedo || asgn.submission?.letterGrade === 'F';
        if (!isRedo) return false;
      }
      if (selectedStatus === 'late' && asgn.status !== 'late') return false;

      // Course filter
      if (courseFilter !== 'All' && asgn.courseCode !== courseFilter) return false;

      // Search query
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesQuery =
          asgn.title.toLowerCase().includes(q) ||
          asgn.courseCode.toLowerCase().includes(q) ||
          asgn.courseTitle.toLowerCase().includes(q) ||
          asgn.instructor.toLowerCase().includes(q) ||
          asgn.category.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      return true;
    });
  }, [assignmentsList, selectedStatus, courseFilter, searchQuery]);

  const toggleExpand = (id) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenSubmissionModal = (assignment, isRedo = false) => {
    setSubmissionModalAssignment(assignment);
    setIsRedoMode(isRedo);
    setUploadedFile(null);
    setGithubUrl(assignment.submission?.repoUrl || '');
    setSubmissionRemarks(isRedo ? 'Revision responding to faculty feedback on test case defects.' : '');
  };

  const handleFileDrop = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      });
    }
  };

  const handleSubmitAssignment = (e) => {
    e.preventDefault();
    if (!uploadedFile && !githubUrl.trim()) {
      addToast({
        type: 'error',
        title: 'Submission Required',
        message: 'Please attach a solution file or provide a public repository URL.',
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const updatedList = assignmentsList.map((a) => {
        if (a.id === submissionModalAssignment.id) {
          return {
            ...a,
            status: 'submitted',
            submission: {
              submittedAt: new Date().toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }),
              submissionMode: uploadedFile ? 'Direct File Upload' : 'Repository Link',
              fileName: uploadedFile?.name || (isRedoMode ? 'Revised_Solution_v2.zip' : 'GitHub_Repository_Submission'),
              fileSize: uploadedFile?.size || 'External Repo',
              repoUrl: githubUrl,
              score: null,
              outOf: a.maxMarks,
              letterGrade: null,
              gradePoint: null,
              grade: isRedoMode ? 'Resubmitted for Re-evaluation' : 'Under Review',
              isRedo: false,
              gradedBy: null,
              gradedOn: null,
              feedback: isRedoMode
                ? 'Resubmission received. Faculty will re-evaluate revised test suite against the O=10 / A+=9 / A=8 / B+=7 / B=6 alphabet scale.'
                : 'Assignment received and logged into Department Submission Portal. Grading in progress.',
            },
          };
        }
        return a;
      });

      setAssignmentsList(updatedList);
      const currentCourse = submissionModalAssignment.courseCode;
      const currentTitle = submissionModalAssignment.title;
      setSubmissionModalAssignment(null);

      addToast({
        type: 'success',
        title: isRedoMode ? 'Assignment Resubmitted (Redo)' : 'Assignment Submitted Successfully',
        message: `Your solution for ${currentCourse} (${currentTitle}) has been timestamped.`,
      });
    }, 600);
  };

  const handleDownloadAttachment = (attachment, assignment) => {
    addToast({
      type: 'info',
      title: 'Downloading Attachment',
      message: `Fetching ${attachment.name} (${attachment.size}) from Courseware server...`,
    });
  };

  const handleDownloadReceipt = (assignment) => {
    addToast({
      type: 'success',
      title: 'Submission Receipt Downloaded',
      message: `Official digital receipt for ${assignment.courseCode} downloaded with cryptographic SHA-256 hash.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP METRIC OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Semester Assignments */}
        <div className="p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-xs">
          <div className="flex items-center justify-between text-[#737373] text-[11px] font-bold uppercase tracking-wider">
            <span>Total Assignments</span>
            <span className="p-1 rounded bg-red-50 text-[#DC2626]">
              <FileText className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-[#171717] mt-1.5">{totalCount} Tasks</p>
          <span className="text-[11px] text-[#737373] mt-0.5 block">
            {semesterData.semester} Course Work
          </span>
        </div>

        {/* Due / Pending */}
        <div className="p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-xs">
          <div className="flex items-center justify-between text-[#737373] text-[11px] font-bold uppercase tracking-wider">
            <span>Pending Submissions</span>
            <span className="p-1 rounded bg-amber-50 text-amber-700">
              <Clock className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-1.5">{pendingCount} Active</p>
          <span className="text-[11px] text-amber-700 font-semibold mt-0.5 block">
            {pendingCount > 0 ? 'Requires attention before due date' : 'All assignments submitted!'}
          </span>
        </div>

        {/* Under Review / Submitted */}
        <div className="p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-xs">
          <div className="flex items-center justify-between text-[#737373] text-[11px] font-bold uppercase tracking-wider">
            <span>Under Review</span>
            <span className="p-1 rounded bg-blue-50 text-blue-600">
              <UploadCloud className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-blue-600 mt-1.5">{submittedCount} Submissions</p>
          <span className="text-[11px] text-[#737373] mt-0.5 block">
            Awaiting faculty alphabet evaluation
          </span>
        </div>

        {/* Alphabet Grade Point Average */}
        <div className="p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-xs">
          <div className="flex items-center justify-between text-[#737373] text-[11px] font-bold uppercase tracking-wider">
            <span>Alphabet GPA Average</span>
            <span className="p-1 rounded bg-emerald-50 text-emerald-700">
              <Award className="h-4 w-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1.5">
            <p className="text-2xl font-black text-emerald-700">
              Grade {avgAlphaGrade?.grade || 'O'}
            </p>
            <span className="text-xs font-bold text-[#525252]">
              ({avgGradePoint} / 10 GP)
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] mt-0.5">
            <span className="text-[#737373]">{avgScore}% overall score</span>
            {redoCount > 0 && (
              <span className="text-[#DC2626] font-bold">
                {redoCount} Redo Required (F)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. OFFICIAL ALPHABET GRADING SCALE BANNER (O=10, A+=9, A=8, B+=7, B=6, C=5, F=REDO/FAIL) */}
      <div className="p-3.5 sm:p-4 rounded-xl border border-neutral-200 bg-white shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-50 text-[#DC2626] border border-red-100 shrink-0">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-[#171717]">
                  Alphabet Grading Scale
                </span>
                <span className="inline-flex items-center px-2 py-0.2 rounded text-[10px] font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
                  UGC 10-Point Standard
                </span>
              </div>
              <p className="text-xs text-[#737373] mt-0.5">
                All assignments are evaluated on the official scale: <strong className="text-[#171717]">O = 10</strong>,{' '}
                <strong className="text-[#171717]">A+ = 9</strong>, <strong className="text-[#171717]">A = 8</strong>,{' '}
                <strong className="text-[#171717]">B+ = 7</strong>, <strong className="text-[#171717]">B = 6</strong>,{' '}
                <strong className="text-[#171717]">C = 5</strong>, and <strong className="text-[#DC2626]">F = REDO / FAIL</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsScaleGuideOpen(!isScaleGuideOpen)}
              className="text-xs font-semibold cursor-pointer gap-1.5"
            >
              <Info className="h-3.5 w-3.5 text-[#DC2626]" />
              <span>{isScaleGuideOpen ? 'Hide Scale Guide' : 'View Full Scale Table'}</span>
            </Button>
          </div>
        </div>

        {/* Expandable Alphabet Scale Matrix */}
        {isScaleGuideOpen && (
          <div className="pt-3 border-t border-[#E5E5E5] space-y-2 animate-in fade-in duration-150">
            <div className="overflow-x-auto rounded-lg border border-[#E5E5E5]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#FAFAFA] border-b border-[#E5E5E5] text-[10px] font-bold text-[#737373] uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Alphabet Grade</th>
                    <th className="py-2.5 px-3 text-center">Grade Point (GP)</th>
                    <th className="py-2.5 px-3">Mark Range (%)</th>
                    <th className="py-2.5 px-3">Performance Category</th>
                    <th className="py-2.5 px-3">Evaluation Action / Academic Standing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5] text-xs">
                  {ASSIGNMENT_GRADING_SCALE.map((tier) => (
                    <tr
                      key={tier.grade}
                      className={
                        tier.grade === 'F'
                          ? 'bg-red-50/40 hover:bg-red-50/70'
                          : 'hover:bg-neutral-50/70'
                      }
                    >
                      <td className="py-2.5 px-3 font-black text-sm">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded border font-mono ${tier.badgeClass}`}>
                          {tier.grade}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-[#171717]">
                        {tier.point} / 10
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#525252]">
                        {tier.minPercent}% – {tier.maxPercent}%
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-[#171717]">
                        {tier.label}
                      </td>
                      <td className="py-2.5 px-3 text-[#737373] text-[11px]">
                        {tier.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 3. FILTER & SEARCH CONTROLS */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tab Pills */}
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg overflow-x-auto w-full md:w-auto">
            {ASSIGNMENT_STATUS_TYPES.map((type) => {
              const isSelected = selectedStatus === type.id;
              let count = totalCount;
              if (type.id === 'pending') count = pendingCount;
              if (type.id === 'submitted') count = submittedCount;
              if (type.id === 'graded') count = gradedCount;
              if (type.id === 'redo') count = redoCount;
              if (type.id === 'late') count = assignmentsList.filter((a) => a.status === 'late').length;

              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSelectedStatus(type.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-white text-[#DC2626] font-bold shadow-xs'
                      : 'text-[#737373] hover:text-[#171717]'
                  }`}
                >
                  <span>{type.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      type.id === 'redo' && count > 0
                        ? 'bg-red-100 text-[#DC2626]'
                        : isSelected
                        ? 'bg-red-50 text-[#DC2626]'
                        : 'bg-neutral-200 text-[#525252]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box & Course Filter Dropdown */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full md:w-auto">
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="p-1.5 px-2.5 rounded-lg border border-[#E5E5E5] bg-white text-xs font-semibold text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#DC2626] cursor-pointer"
            >
              {uniqueCourses.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Subjects' : c}
                </option>
              ))}
            </select>

            <div className="w-full sm:w-64">
              <Input
                placeholder="Search assignments or topics..."
                icon={Search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="py-1 text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. ASSIGNMENTS LIST */}
      {filteredAssignments.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No assignments match your filter"
          description={`No course assignments found under ${semesterData.semester} for status: "${selectedStatus}".`}
          actionText="Reset Filters"
          onAction={() => {
            setSelectedStatus('all');
            setCourseFilter('All');
            setSearchQuery('');
          }}
        />
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map((assignment) => {
            const isExpanded = !!expandedIds[assignment.id];
            const isPending = assignment.status === 'pending';
            const isSubmitted = assignment.status === 'submitted';
            const isGraded = assignment.status === 'graded';
            const isLate = assignment.status === 'late';

            // Calculate Alphabet Grade details
            const alphaGrade = isGraded
              ? getAlphabetGrade(assignment.submission?.score, assignment.maxMarks)
              : null;
            const isRedo = alphaGrade?.isRedo || assignment.submission?.isRedo;

            return (
              <Card
                key={assignment.id}
                className={`transition-all duration-150 overflow-hidden ${
                  isRedo
                    ? 'border-red-300 bg-red-50/10 hover:border-red-400'
                    : 'hover:border-neutral-300'
                }`}
              >
                <CardHeader className="p-4 sm:p-5 pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      {/* Meta Pills Row */}
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="font-mono font-bold text-xs bg-[#FEF2F2] text-[#DC2626] px-2 py-0.5 rounded border border-[#FECACA]">
                          {assignment.courseCode}
                        </span>

                        <span className="text-[11px] font-semibold text-[#525252] truncate">
                          {assignment.courseTitle}
                        </span>

                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-[#525252]">
                          {assignment.category}
                        </span>

                        {/* Status / Alphabet Grade Badges */}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="h-3 w-3" />
                            {assignment.daysLeft > 0
                              ? `Due in ${assignment.daysLeft} days`
                              : `Due Today`}
                          </span>
                        )}

                        {isSubmitted && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <UploadCloud className="h-3 w-3" />
                            Submitted • Under Alphabet Review
                          </span>
                        )}

                        {isGraded && alphaGrade && (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black border ${alphaGrade.badgeClass}`}
                          >
                            <Award className="h-3.5 w-3.5" />
                            <span>
                              Grade {alphaGrade.grade} = {alphaGrade.point} ({alphaGrade.label}) •{' '}
                              {assignment.submission?.score}/{assignment.maxMarks} ({alphaGrade.percent}%)
                            </span>
                          </span>
                        )}

                        {isLate && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-[#DC2626] border border-red-200">
                            <AlertCircle className="h-3 w-3" />
                            Past Deadline
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-base sm:text-lg font-bold text-[#171717] mt-1">
                        {assignment.title}
                      </h3>

                      {/* Instructor, Due Date, and Weightage Row */}
                      <div className="flex items-center gap-4 text-xs text-[#737373] flex-wrap pt-0.5">
                        <span className="flex items-center gap-1 text-[#171717] font-medium">
                          <strong>Instructor:</strong> {assignment.instructor}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-[#DC2626]" />
                          <strong>Due Date:</strong> {assignment.dueDate} ({assignment.dueTime})
                        </span>
                        <span className="flex items-center gap-1">
                          <Award className="h-3.5 w-3.5 text-[#737373]" />
                          <strong>Weightage:</strong> {assignment.weightage}
                        </span>
                        <span className="text-[#525252] font-semibold">
                          Max Marks: {assignment.maxMarks}
                        </span>
                      </div>
                    </div>

                    {/* Right Action: Submit / Redo / Feedback CTA */}
                    <div className="flex items-center gap-2 self-start shrink-0">
                      {isPending && (
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          leftIcon={UploadCloud}
                          onClick={() => handleOpenSubmissionModal(assignment, false)}
                          className="font-bold text-xs cursor-pointer shadow-xs"
                        >
                          Submit Assignment
                        </Button>
                      )}

                      {isSubmitted && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          leftIcon={FileCheck2}
                          onClick={() => handleDownloadReceipt(assignment)}
                          className="font-semibold text-xs cursor-pointer text-[#171717]"
                        >
                          Receipt
                        </Button>
                      )}

                      {isGraded && (
                        <div className="flex items-center gap-1.5">
                          {isRedo && (
                            <Button
                              type="button"
                              variant="primary"
                              size="sm"
                              leftIcon={RotateCcw}
                              onClick={() => handleOpenSubmissionModal(assignment, true)}
                              className="font-bold text-xs bg-[#DC2626] hover:bg-red-700 text-white cursor-pointer"
                            >
                              Redo Submission
                            </Button>
                          )}

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            leftIcon={Award}
                            onClick={() => setFeedbackModalAssignment(assignment)}
                            className={`font-bold text-xs cursor-pointer ${
                              isRedo
                                ? 'border-red-300 text-[#DC2626] bg-red-50 hover:bg-red-100'
                                : 'border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
                            }`}
                          >
                            {isRedo
                              ? 'View Redo Notice (Grade F)'
                              : `View Grade ${alphaGrade?.grade} = ${alphaGrade?.point}`}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-5 pt-0 space-y-3">
                  {/* Redo Notice Banner if Grade F */}
                  {isRedo && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs">
                      <AlertTriangle className="h-4 w-4 text-[#DC2626] shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <strong className="text-[#DC2626] block">
                          Grade F = 0 (REDO / FAIL) Mandated by Evaluator
                        </strong>
                        <p className="text-red-800 text-[11px] mt-0.5">
                          Score achieved ({assignment.submission?.score}/{assignment.maxMarks}) is below the 50% passing cutoff.
                          You are permitted to fix failing test cases and resubmit your solution.
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="xs"
                        variant="primary"
                        onClick={() => handleOpenSubmissionModal(assignment, true)}
                        className="bg-[#DC2626] text-white font-bold cursor-pointer shrink-0"
                      >
                        Resubmit Now
                      </Button>
                    </div>
                  )}

                  {/* Submission format pill */}
                  <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-between flex-wrap gap-2 text-xs">
                    <span className="text-[#737373]">
                      Accepted Formats: <strong className="text-[#171717]">{assignment.submissionFormat}</strong>
                    </span>

                    {/* Submission state info */}
                    {assignment.submission?.submittedAt && (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        Uploaded: {assignment.submission.submittedAt} (File: {assignment.submission.fileName})
                      </span>
                    )}
                  </div>

                  {/* Expandable Instructions & Rubric */}
                  {isExpanded && (
                    <div className="mt-3 p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E5E5] space-y-4 animate-in fade-in duration-150 text-xs">
                      {/* Instructions */}
                      <div>
                        <h4 className="font-bold text-[#171717] uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5 text-[#DC2626]" />
                          Specific Assignment Instructions:
                        </h4>
                        <ul className="space-y-1.5 text-[#404040]">
                          {assignment.instructions.map((inst, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-[#DC2626] font-bold mt-0.5">•</span>
                              <span className="leading-relaxed">{inst}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Rubric Breakdown */}
                      {assignment.rubric && assignment.rubric.length > 0 && (
                        <div className="pt-2 border-t border-[#E5E5E5]">
                          <h4 className="font-bold text-[#171717] uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                            <Award className="h-3.5 w-3.5 text-purple-600" />
                            Evaluation Marking Rubric (Converted to Alphabet Grade O - F):
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {assignment.rubric.map((r, idx) => (
                              <div
                                key={idx}
                                className="p-2.5 rounded-lg bg-white border border-[#E5E5E5] flex items-center justify-between text-xs"
                              >
                                <span className="text-[#525252] font-medium">{r.criteria}</span>
                                <span className="font-mono font-bold text-[#DC2626]">{r.points} Pts</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Attachments */}
                      {assignment.attachments && assignment.attachments.length > 0 && (
                        <div className="pt-2 border-t border-[#E5E5E5]">
                          <span className="font-bold uppercase tracking-wider text-[11px] text-[#737373] block mb-2">
                            Downloadable Attachments & Templates:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {assignment.attachments.map((att, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleDownloadAttachment(att, assignment)}
                                className="inline-flex items-center gap-2 p-2 px-3 rounded-lg border border-[#E5E5E5] bg-white hover:border-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer text-xs"
                              >
                                <Download className="h-3.5 w-3.5 text-[#DC2626]" />
                                <span className="font-medium text-[#171717]">{att.name}</span>
                                <span className="text-[10px] text-[#737373]">({att.size})</span>
                              </button>
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
                    onClick={() => toggleExpand(assignment.id)}
                    className="flex items-center gap-1 font-semibold text-[#DC2626] hover:underline cursor-pointer self-start"
                  >
                    {isExpanded ? (
                      <>
                        <span>Hide Assignment Details & Rubric</span>
                        <ChevronUp className="h-3.5 w-3.5" />
                      </>
                    ) : (
                      <>
                        <span>View Instructions, Rubric & Attachments</span>
                        <ChevronDown className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2 flex-wrap">
                    {onSwitchToCurriculum && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        leftIcon={BookOpen}
                        onClick={onSwitchToCurriculum}
                        className="text-xs font-semibold cursor-pointer"
                      >
                        Course Syllabus
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: SUBMIT / REDO ASSIGNMENT MODAL                                   */}
      {/* ========================================================================= */}
      <Modal
        isOpen={!!submissionModalAssignment}
        onClose={() => setSubmissionModalAssignment(null)}
        title={isRedoMode ? 'Redo & Resubmit Assignment' : 'Submit Course Assignment'}
        description={
          submissionModalAssignment
            ? `${submissionModalAssignment.courseCode}: ${submissionModalAssignment.title}`
            : 'Upload your completed solution'
        }
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSubmissionModalAssignment(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              leftIcon={Send}
              onClick={handleSubmitAssignment}
              disabled={isSubmitting}
              className={`font-bold cursor-pointer ${
                isRedoMode ? 'bg-[#DC2626] hover:bg-red-700' : ''
              }`}
            >
              {isSubmitting ? 'Uploading...' : isRedoMode ? 'Confirm Redo Submission' : 'Confirm Submission'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmitAssignment} className="space-y-4 text-xs">
          {submissionModalAssignment && (
            <div
              className={`p-3 rounded-lg border text-xs space-y-1 ${
                isRedoMode
                  ? 'bg-red-50 border-red-200'
                  : 'bg-[#FEF2F2] border-red-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#991B1B] block">
                  {isRedoMode ? 'Resubmission / Revision Round' : 'Initial Submission'}
                </span>
                <span className="font-mono text-[11px] text-[#525252]">
                  Target Grade Scale: O = 10 to F = REDO
                </span>
              </div>
              <p className="text-[#525252]">
                Instructor: <strong>{submissionModalAssignment.instructor}</strong> • Max Marks:{' '}
                <strong>{submissionModalAssignment.maxMarks}</strong>
              </p>
            </div>
          )}

          {/* Drag & Drop File Upload Area */}
          <div>
            <label className="block font-bold text-[#171717] mb-1">
              Upload Solution File (ZIP / PDF / TAR / IPYNB):
            </label>
            <div className="border-2 border-dashed border-[#E5E5E5] hover:border-[#DC2626] rounded-xl p-6 text-center cursor-pointer transition-colors bg-[#FAFAFA] relative">
              <input
                type="file"
                onChange={handleFileDrop}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <UploadCloud className="h-8 w-8 text-[#DC2626] mx-auto mb-2" />
              {uploadedFile ? (
                <div className="space-y-0.5">
                  <p className="font-bold text-[#171717] text-xs">{uploadedFile.name}</p>
                  <p className="text-[11px] text-emerald-600 font-semibold">{uploadedFile.size} - Ready to submit</p>
                  <p className="text-[10px] text-[#737373] mt-1">Click to select a different file</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="font-semibold text-[#171717] text-xs">
                    Drop your archive or document here, or <span className="text-[#DC2626] underline">browse</span>
                  </p>
                  <p className="text-[10px] text-[#737373]">
                    Accepted: .zip, .tar.gz, .pdf, .ipynb, .cpp, .java (Max 50MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* GitHub Repository Link */}
          <div>
            <label className="block font-bold text-[#171717] mb-1 flex items-center gap-1.5">
              <Link2 className="h-3.5 w-3.5 text-[#737373]" /> Public Repository URL (Optional):
            </label>
            <Input
              placeholder="https://github.com/your-username/assignment-repo"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="py-1.5 text-xs font-mono"
            />
          </div>

          {/* Submission Remarks */}
          <div>
            <label className="block font-bold text-[#171717] mb-1">
              {isRedoMode ? 'Revision Notes / Fixes Applied:' : 'Student Notes / Compilation Instructions:'}
            </label>
            <textarea
              rows={2}
              value={submissionRemarks}
              onChange={(e) => setSubmissionRemarks(e.target.value)}
              placeholder={
                isRedoMode
                  ? 'Detail the bugs fixed, memory leaks resolved, or test cases corrected...'
                  : 'e.g. Run make test in root directory to execute all unit test cases...'
              }
              className="w-full p-2 border border-[#E5E5E5] rounded-lg bg-white text-xs text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#DC2626]"
            />
          </div>

          <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 text-[11px] text-[#737373] flex items-start gap-2">
            <Info className="h-4 w-4 text-[#737373] shrink-0 mt-0.5" />
            <span>
              Submissions undergo automated plagiarism checks via MOSS/Turnitin upon departmental logging.
            </span>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: VIEW ALPHABET GRADES & FEEDBACK REPORT MODAL                     */}
      {/* ========================================================================= */}
      <Modal
        isOpen={!!feedbackModalAssignment}
        onClose={() => setFeedbackModalAssignment(null)}
        title="Faculty Alphabet Evaluation & Feedback Report"
        description={
          feedbackModalAssignment
            ? `${feedbackModalAssignment.courseCode}: ${feedbackModalAssignment.title}`
            : 'Assessment result'
        }
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleDownloadReceipt(feedbackModalAssignment)}
              leftIcon={Download}
            >
              Export Grade Transcript
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setFeedbackModalAssignment(null)}
            >
              Close Report
            </Button>
          </div>
        }
      >
        {feedbackModalAssignment?.submission && (() => {
          const alpha = getAlphabetGrade(
            feedbackModalAssignment.submission.score,
            feedbackModalAssignment.maxMarks
          );

          return (
            <div className="space-y-4 text-xs">
              {/* Score & Alphabet Grade Banner */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  alpha?.isRedo
                    ? 'bg-red-50 border-red-300'
                    : 'bg-emerald-50 border-emerald-300'
                }`}
              >
                <div>
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider block ${
                      alpha?.isRedo ? 'text-red-800' : 'text-emerald-800'
                    }`}
                  >
                    Alphabet Grade Awarded
                  </span>
                  <div className="flex items-baseline gap-3 mt-0.5">
                    <p
                      className={`text-4xl font-black ${
                        alpha?.isRedo ? 'text-[#DC2626]' : 'text-emerald-800'
                      }`}
                    >
                      {alpha?.grade}
                    </p>
                    <div>
                      <p className="text-base font-bold text-[#171717]">
                        = {alpha?.point} / 10 Grade Points
                      </p>
                      <p className="text-xs font-semibold text-[#525252]">
                        {alpha?.label} ({feedbackModalAssignment.submission.score} /{' '}
                        {feedbackModalAssignment.maxMarks} • {alpha?.percent}%)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-[#737373] block">Evaluated By:</span>
                  <strong className="text-[#171717] block">
                    {feedbackModalAssignment.submission.gradedBy || feedbackModalAssignment.instructor}
                  </strong>
                  <span className="text-[10px] text-[#737373]">
                    {feedbackModalAssignment.submission.gradedOn}
                  </span>
                </div>
              </div>

              {/* Redo Callout if Grade F */}
              {alpha?.isRedo && (
                <div className="p-3.5 rounded-xl border border-red-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#DC2626] uppercase text-[11px] tracking-wide flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4" /> Action Required: Resubmit Work (Grade F)
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        const asgn = feedbackModalAssignment;
                        setFeedbackModalAssignment(null);
                        handleOpenSubmissionModal(asgn, true);
                      }}
                      className="bg-[#DC2626] text-white font-bold cursor-pointer"
                    >
                      Resubmit Now
                    </Button>
                  </div>
                  <p className="text-[#525252] text-xs leading-relaxed">
                    Under university guidelines, assignments graded <strong>F (REDO/FAIL)</strong> must be revised.
                    Correct failing test assertions and re-upload your solution to claim credit.
                  </p>
                </div>
              )}

              {/* Faculty Written Feedback */}
              <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 space-y-1">
                <span className="font-bold text-[#171717] block text-[11px] uppercase tracking-wide">
                  Faculty Remarks & Examiner Observations:
                </span>
                <p className="text-[#404040] leading-relaxed italic">
                  "{feedbackModalAssignment.submission.feedback}"
                </p>
              </div>

              {/* Rubric Breakdown Scores */}
              {feedbackModalAssignment.submission.rubricScores && (
                <div className="space-y-2">
                  <span className="font-bold text-[#171717] block text-[11px] uppercase tracking-wide">
                    Criteria Score Breakdown:
                  </span>
                  <div className="space-y-1.5">
                    {feedbackModalAssignment.submission.rubricScores.map((r, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg border border-neutral-200 bg-white flex items-center justify-between"
                      >
                        <span className="text-[#525252] font-medium">{r.criteria}</span>
                        <span
                          className={`font-mono font-bold ${
                            r.score / r.max < 0.5 ? 'text-[#DC2626]' : 'text-emerald-700'
                          }`}
                        >
                          {r.score} / {r.max} Pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Alphabet Scale Reference in Modal */}
              <div className="pt-2 border-t border-[#E5E5E5] space-y-2">
                <span className="font-bold text-[#171717] block text-[11px] uppercase tracking-wide">
                  Official UGC 10-Point Alphabet Scale Standard:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {ASSIGNMENT_GRADING_SCALE.map((s) => {
                    const isEarned = alpha?.grade === s.grade;
                    return (
                      <div
                        key={s.grade}
                        className={`p-2 rounded-lg border text-center transition-all ${
                          isEarned
                            ? 'border-[#DC2626] bg-[#FEF2F2] ring-1 ring-[#DC2626]'
                            : 'border-neutral-200 bg-neutral-50'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-black text-xs text-[#171717]">
                            {s.grade} = {s.point}
                          </span>
                          {isEarned && (
                            <span className="text-[9px] font-extrabold text-[#DC2626] bg-red-100 px-1 rounded">
                              Earned
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#737373] block truncate">
                          {s.label} ({s.minPercent}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
