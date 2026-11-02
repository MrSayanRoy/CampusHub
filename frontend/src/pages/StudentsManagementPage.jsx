import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Award,
  Mail,
  GraduationCap,
  FileText,
  Clock,
  ArrowRight,
  BookOpen,
  Send,
  UserCheck,
  ChevronDown,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import Modal from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { ENROLLED_STUDENTS_LIST, FACULTY_COURSES } from '../data/facultyData.js';
import { ASSIGNMENT_GRADING_SCALE, getAlphabetGrade } from '../data/assignmentsData.js';

export default function StudentsManagementPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [students, setStudents] = useState(ENROLLED_STUDENTS_LIST);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [attendanceFilter, setAttendanceFilter] = useState('all'); // all, eligible, defaulter
  const [searchQuery, setSearchQuery] = useState('');

  // Selected student for detail/evaluation modal
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [newGrade, setNewGrade] = useState('A+');
  const [feedbackNote, setFeedbackNote] = useState('');

  // Filter students
  const filteredStudents = students.filter((stu) => {
    const matchesCourse = selectedCourse === 'all' || stu.courseCode === selectedCourse;
    const matchesAttendance =
      attendanceFilter === 'all' ||
      (attendanceFilter === 'eligible' && stu.attendancePercent >= 75) ||
      (attendanceFilter === 'defaulter' && stu.attendancePercent < 75);
    const matchesSearch =
      stu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stu.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stu.email.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCourse && matchesAttendance && matchesSearch;
  });

  const defaultersCount = students.filter((s) => s.attendancePercent < 75).length;
  const topPerformersCount = students.filter((s) => s.currentGrade === 'O' || s.currentGrade === 'A+').length;

  const handleOpenEvaluation = (student) => {
    setSelectedStudent(student);
    setNewGrade(student.currentGrade || 'A+');
    setFeedbackNote('');
    setIsEvaluationModalOpen(true);
  };

  const handleSaveEvaluation = () => {
    if (!selectedStudent) return;
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === selectedStudent.id) {
          const scale = ASSIGNMENT_GRADING_SCALE[newGrade] || { points: 8, label: 'Very Good' };
          return {
            ...s,
            currentGrade: newGrade,
            gradePoint: scale.points,
            performanceStatus: scale.label,
          };
        }
        return s;
      })
    );
    addToast({
      title: 'Grade Updated Successfully',
      description: `Assigned Grade ${newGrade} to ${selectedStudent.name}.`,
      variant: 'success',
    });
    setIsEvaluationModalOpen(false);
  };

  const handleSendAttendanceWarning = (student) => {
    addToast({
      title: 'Attendance Advisory Dispatched',
      description: `Formal official notification transmitted to ${student.name} (${student.email}) regarding ${student.attendancePercent}% attendance shortage.`,
      variant: 'default',
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
              Student Cohorts
            </span>
            <span className="text-xs text-[#737373]">Undergraduate Computer Science</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight mt-1">
            My Students & Rosters
          </h1>
          <p className="mt-1 text-sm text-[#737373]">
            Track student attendance eligibility, alphabet grading records, and performance alerts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/app/academics?tab=assignments')}
            leftIcon={FileText}
          >
            Assignments
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/app/academics?tab=attendance')}
            leftIcon={UserCheck}
          >
            Take Attendance
          </Button>
        </div>
      </div>

      {/* Cohort Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E5E5E5] flex items-center gap-3.5 shadow-xs">
          <div className="h-11 w-11 rounded-lg bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#DC2626] shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#737373]">Total Enrolled</p>
            <p className="text-xl font-extrabold text-[#171717]">{students.length} Students</p>
            <p className="text-[11px] text-[#737373]">Active in your courses</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E5E5E5] flex items-center gap-3.5 shadow-xs">
          <div className="h-11 w-11 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#737373]">Attendance Average</p>
            <p className="text-xl font-extrabold text-[#171717]">87.4%</p>
            <p className="text-[11px] text-emerald-700 font-medium">Eligible for end-sem exams</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E5E5E5] flex items-center gap-3.5 shadow-xs">
          <div className="h-11 w-11 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#737373]">Shortage Alerts (&lt;75%)</p>
            <p className="text-xl font-extrabold text-amber-600">{defaultersCount} Students</p>
            <p className="text-[11px] text-[#737373]">Immediate action required</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E5E5E5] flex items-center gap-3.5 shadow-xs">
          <div className="h-11 w-11 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#737373]">Top Performers (O / A+)</p>
            <p className="text-xl font-extrabold text-blue-600">{topPerformersCount} Students</p>
            <p className="text-[11px] text-[#737373]">Outstanding academic standing</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E5E5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373]" />
          <input
            type="text"
            placeholder="Search by student name, roll number, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-1 focus:ring-[#DC2626] focus:border-[#DC2626]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-[#737373]">
            <span>Course:</span>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-[#E5E5E5] bg-white text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#DC2626]"
            >
              <option value="all">All Courses</option>
              {FACULTY_COURSES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.title.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#737373]">
            <span>Status:</span>
            <select
              value={attendanceFilter}
              onChange={(e) => setAttendanceFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-[#E5E5E5] bg-white text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#DC2626]"
            >
              <option value="all">All Attendance</option>
              <option value="eligible">Eligible (&ge;75%)</option>
              <option value="defaulter">Defaulter (&lt;75%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50/80 border-b border-[#E5E5E5] text-[#737373] uppercase tracking-wider font-bold">
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Roll Number</th>
                <th className="py-3.5 px-4">Course</th>
                <th className="py-3.5 px-4">Attendance</th>
                <th className="py-3.5 px-4">Assignments</th>
                <th className="py-3.5 px-4">Current Grade</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#737373]">
                    No students matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stu) => {
                  const isShortage = stu.attendancePercent < 75;
                  const isRedo = stu.currentGrade === 'F';

                  return (
                    <tr key={stu.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={stu.avatar} name={stu.name} size="sm" />
                          <div>
                            <p className="font-bold text-[#171717]">{stu.name}</p>
                            <p className="text-[11px] text-[#737373]">{stu.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-[#171717]">
                        {stu.rollNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
                          {stu.courseCode}
                        </span>
                        <span className="block text-[11px] text-[#737373] mt-0.5">
                          {stu.section}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                              isShortage
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {stu.attendancePercent}%
                          </span>
                          <span className="block text-[10px] text-[#737373]">
                            {isShortage ? 'Defaulter (<75%)' : 'Eligible'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#171717]">
                        {stu.assignmentsSubmitted}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-black ${
                              isRedo
                                ? 'bg-red-100 text-red-800 border border-red-300'
                                : stu.currentGrade === 'O'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {stu.currentGrade}
                          </span>
                          <span className="text-[11px] text-[#737373]">
                            ({stu.gradePoint} pts)
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isShortage && (
                            <button
                              type="button"
                              onClick={() => handleSendAttendanceWarning(stu)}
                              title="Send Attendance Warning"
                              className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                            >
                              <AlertTriangle className="h-4 w-4" />
                            </button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => handleOpenEvaluation(stu)}
                          >
                            Grade
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grade Evaluation Modal */}
      {isEvaluationModalOpen && selectedStudent && (
        <Modal
          isOpen={isEvaluationModalOpen}
          onClose={() => setIsEvaluationModalOpen(false)}
          title={`Grade Student: ${selectedStudent.name}`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-[#FAFAFA] rounded-xl border border-[#E5E5E5] flex items-center justify-between">
              <div>
                <p className="font-bold text-[#171717]">{selectedStudent.name}</p>
                <p className="text-[#737373]">{selectedStudent.rollNumber} • {selectedStudent.courseCode}</p>
              </div>
              <span className="px-2 py-1 rounded bg-[#FEF2F2] text-[#DC2626] font-bold">
                Attendance: {selectedStudent.attendancePercent}%
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                Select Letter Grade (Standard University Scale)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(ASSIGNMENT_GRADING_SCALE).map(([letter, meta]) => (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => setNewGrade(letter)}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      newGrade === letter
                        ? 'border-[#DC2626] bg-[#FEF2F2] text-[#DC2626] font-bold shadow-xs'
                        : 'border-[#E5E5E5] hover:border-neutral-300 text-[#171717]'
                    }`}
                  >
                    <p className="text-sm font-extrabold">{letter}</p>
                    <p className="text-[10px] text-[#737373]">{meta.points} Pts</p>
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[11px] text-[#737373]">
                Alphabet scale: O=10, A+=9, A=8, B+=7, B=6, C=5, F=REDO/FAIL
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">
                Faculty Evaluator Remarks (Optional)
              </label>
              <textarea
                rows={3}
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
                placeholder="Add formative feedback, strengths, or recommendations for revision..."
                className="w-full p-2.5 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-1 focus:ring-[#DC2626]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E5E5]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEvaluationModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveEvaluation}
              >
                Save Evaluation
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
