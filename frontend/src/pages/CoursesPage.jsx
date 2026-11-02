import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Users,
  Clock,
  Calendar,
  CheckCircle2,
  FileText,
  FolderOpen,
  ArrowRight,
  Search,
  Filter,
  Sparkles,
  MapPin,
  Award,
  ChevronRight,
  ExternalLink,
  GraduationCap,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { FACULTY_COURSES } from '../data/facultyData.js';

export default function CoursesPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [courses, setCourses] = useState(FACULTY_COURSES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [activeCourseModal, setActiveCourseModal] = useState(null);

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.classroom.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSem = selectedSemester === 'all' || c.semester.toLowerCase().includes(selectedSemester.toLowerCase());
    return matchesSearch && matchesSem;
  });

  const totalStudents = courses.reduce((acc, c) => acc + c.totalStudents, 0);
  const totalClassesThisWeek = 9;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
              Faculty Management
            </span>
            <span className="text-xs text-[#737373]">Academic Year 2025–2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight mt-1">
            My Courses & Classes
          </h1>
          <p className="mt-1 text-sm text-[#737373]">
            Manage assigned syllabi, section rosters, lecture materials, and academic schedules.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/app/materials')}
            leftIcon={FolderOpen}
          >
            Study Materials
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/app/academics?tab=timetable')}
            leftIcon={Clock}
          >
            View Timetable
          </Button>
        </div>
      </div>

      {/* Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E5E5E5] flex items-center gap-3.5 shadow-xs">
          <div className="h-11 w-11 rounded-lg bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#DC2626] shrink-0">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#737373]">Assigned Courses</p>
            <p className="text-xl font-extrabold text-[#171717]">{courses.length} Active Courses</p>
            <p className="text-[11px] text-[#737373]">Spring 2026 Semester</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E5E5E5] flex items-center gap-3.5 shadow-xs">
          <div className="h-11 w-11 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#737373]">Total Enrolled Cohort</p>
            <p className="text-xl font-extrabold text-[#171717]">{totalStudents} Students</p>
            <p className="text-[11px] text-[#737373]">Across 3 undergraduate tracks</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E5E5E5] flex items-center gap-3.5 shadow-xs">
          <div className="h-11 w-11 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#737373]">Weekly Contact Hours</p>
            <p className="text-xl font-extrabold text-[#171717]">{totalClassesThisWeek} Scheduled Sessions</p>
            <p className="text-[11px] text-[#737373]">Lectures, tutorials & labs</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E5E5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373]" />
          <input
            type="text"
            placeholder="Search by course code, title, or hall..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-1 focus:ring-[#DC2626] focus:border-[#DC2626]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[#737373]">Filter:</span>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg border border-[#E5E5E5] bg-white text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#DC2626]"
          >
            <option value="all">All Semesters</option>
            <option value="7th">7th Semester</option>
            <option value="8th">8th Semester</option>
          </select>
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-xl border border-[#E5E5E5] hover:border-red-300 transition-all shadow-xs flex flex-col justify-between overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-[#E5E5E5] space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
                  {course.code}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-neutral-100 text-[#737373]">
                  {course.credits} Credits
                </span>
              </div>
              <h3 className="text-base font-bold text-[#171717] line-clamp-1">
                {course.title}
              </h3>
              <p className="text-xs text-[#737373]">
                {course.department} • {course.semester} ({course.section})
              </p>
            </div>

            {/* Details */}
            <div className="p-5 space-y-3.5 flex-1 text-xs">
              <div className="flex items-center justify-between text-[#737373]">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#DC2626]" />
                  Classroom
                </span>
                <span className="font-semibold text-[#171717]">{course.classroom}</span>
              </div>

              <div className="flex items-center justify-between text-[#737373]">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-[#DC2626]" />
                  Weekly Schedule
                </span>
                <span className="font-semibold text-[#171717] text-right truncate max-w-[170px]">
                  {course.schedule}
                </span>
              </div>

              <div className="flex items-center justify-between text-[#737373]">
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-blue-600" />
                  Enrolled Students
                </span>
                <span className="font-semibold text-[#171717]">{course.totalStudents} Active</span>
              </div>

              <div className="flex items-center justify-between text-[#737373]">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Attendance Average
                </span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {course.attendanceAvg}%
                </span>
              </div>

              {/* Syllabus Progress */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#737373]">Curriculum Progress</span>
                  <span className="font-bold text-[#171717]">{course.syllabusProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#DC2626] rounded-full transition-all"
                    style={{ width: `${course.syllabusProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-4 bg-[#FAFAFA] border-t border-[#E5E5E5] grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => navigate('/app/students')}
              >
                View Roster
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="text-xs"
                onClick={() => navigate('/app/academics?tab=attendance')}
              >
                Attendance
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
