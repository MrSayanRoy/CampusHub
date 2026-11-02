import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Calendar,
  CheckCircle2,
  FolderKanban,
  MapPin,
  AlertTriangle,
  BookOpen,
  Bell,
  Sparkles,
  ArrowRight,
  Info,
  Clock,
  Users,
  FileText,
} from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import QuickActionCard from '../components/dashboard/QuickActionCard';
import SectionHeader from '../components/dashboard/SectionHeader';
import FacultyDashboard from '../components/dashboard/FacultyDashboard';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ui/Toast';
import { getCurrentUserApi } from '../services/userService';

/**
 * CampusHub Authenticated Dashboard
 * The primary screen users see after logging in.
 * Architected with real authenticated user data from GET /api/users/me.
 */
export default function Dashboard() {
  const navigate = useNavigate();
  const { user: contextUser, updateProfile, events = [], projects = [], notices = [] } = useApp();
  const { addToast } = useToast();

  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch authenticated user profile
  useEffect(() => {
    let isMounted = true;

    async function loadStudentProfile() {
      setIsLoading(true);
      try {
        const result = await getCurrentUserApi(contextUser);
        if (isMounted && result.success && result.user) {
          setUserData(result.user);
          // Sync with AppContext if new fields are present
          if (updateProfile) {
            updateProfile(result.user);
          }
        }
      } catch (err) {
        if (isMounted) {
          setUserData(contextUser);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadStudentProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute time-aware greeting with student's first name
  const student = userData || contextUser || {};
  const rawName = student.name || student.fullName || 'Student';
  const firstName = rawName.trim().split(' ')[0] || 'Student';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleActionClick = (path) => {
    navigate(path);
  };

  // 1. Loading Skeleton State
  if (isLoading && !userData) {
    return (
      <div className="space-y-6 sm:space-y-8 animate-pulse" aria-busy="true">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-200 rounded-lg" />
          <div className="h-4 w-96 bg-slate-200 rounded-md" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl" />
          ))}
        </div>

        {/* Quick Actions Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 bg-slate-200 rounded-xl" />
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <div className="h-60 bg-slate-200 rounded-xl" />
            <div className="h-60 bg-slate-200 rounded-xl" />
          </div>
          <div className="lg:col-span-5 space-y-6">
            <div className="h-60 bg-slate-200 rounded-xl" />
            <div className="h-60 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Check if active user is faculty
  const isFacultyUser =
    (student.role || '').toLowerCase() === 'faculty' ||
    (student.email || '').includes('faculty') ||
    (student.name || '').toLowerCase().includes('dr.');

  if (isFacultyUser) {
    return (
      <FacultyDashboard
        user={student}
        onSwitchRole={() => {
          if (updateProfile) {
            updateProfile({
              id: 'u-1',
              name: 'Alex Morgan',
              email: 'alex.morgan@university.edu',
              role: 'Student',
              department: 'Computer Science & Engineering',
              departmentCode: 'CSE',
              semester: 7,
            });
            addToast({
              title: 'Switched to Student Portal',
              description: 'Now viewing student dashboard.',
              variant: 'default',
            });
          }
        }}
      />
    );
  }

  // Format department code & semester
  const dept = student.departmentCode || (
    student.department?.includes('Computer Science') ? 'CSE' :
    student.department?.includes('Information') ? 'IT' :
    student.department?.includes('Electronics') ? 'ECE' :
    student.department?.includes('Electrical') ? 'EE' :
    student.department?.includes('Mechanical') ? 'ME' :
    student.department?.includes('Civil') ? 'CE' : 'CSE'
  );

  const semesterText = student.semester
    ? (String(student.semester).toLowerCase().includes('semester')
        ? student.semester
        : `${student.semester}th Semester`)
    : '7th Semester';

  const campusStatusText = student.campusStatus || 'All systems normal';

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Header: Greeting & Subtext */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
            {getGreeting()}, {firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-[#737373]">
            Here's what's happening around your campus.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => {
              if (updateProfile) {
                updateProfile({
                  id: 'u-faculty-1',
                  name: 'Dr. Sarah Chen, Ph.D.',
                  email: 'dr.chen@faculty.university.edu',
                  role: 'Faculty',
                  department: 'Computer Science & Engineering',
                  departmentCode: 'CSE',
                  designation: 'Associate Professor & Lab Director',
                  academicRank: 'Associate Professor',
                });
                addToast({
                  title: 'Switched to Faculty Portal',
                  description: 'Welcome Dr. Sarah Chen, Ph.D. - Full faculty interface enabled.',
                  variant: 'success',
                });
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E5E5E5] hover:border-[#DC2626] text-xs font-bold text-[#171717] hover:text-[#DC2626] transition-colors cursor-pointer shadow-2xs"
            title="Preview Faculty Portal view"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#DC2626]" />
            <span>Switch to Faculty View</span>
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Spring Semester 2026</span>
          </div>
        </div>
      </div>

      {/* 2. Overview Metric Cards */}
      <section aria-label="Academic Overview">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: My Classes Today */}
          <StatCard
            label="My Classes Today"
            value="4 Classes"
            subtext="Next: CS401 at 09:00 AM (LH 301)"
            icon={Clock}
            to="/app/academics?tab=timetable"
            badge="Timetable"
          />

          {/* Card 2: Pending Evaluations */}
          <StatCard
            label="Pending Evaluations"
            value="3 Assignments"
            subtext="2 Due Soon • 1 Redo (F)"
            icon={FileText}
            to="/app/academics?tab=assignments"
            badge="O - F Scale"
          />
        </div>
      </section>

      {/* 3. Quick Actions */}
      <section aria-label="Quick Actions">
        <SectionHeader
          title="Quick Actions"
          subtitle="Essential shortcuts for student projects, events, and campus life"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            icon={FolderKanban}
            title="Find Projects"
            description="Discover student teams and collaborate on capstone or hackathon projects."
            onClick={() => navigate('/app/projects')}
          />

          <QuickActionCard
            icon={Calendar}
            title="Explore Events"
            description="Browse upcoming hackathons, tech workshops, and college fests."
            onClick={() => navigate('/app/events')}
          />

          <QuickActionCard
            icon={MapPin}
            title="Campus Map"
            description="Navigate university buildings, auditoriums, lecture halls, and labs."
            onClick={() => navigate('/app/map')}
          />

          <QuickActionCard
            icon={AlertTriangle}
            title="Report Issue"
            description="Log facility concerns, classroom repairs, or WiFi connectivity tickets."
            onClick={() => navigate('/app/report')}
          />
        </div>
      </section>

      {/* 4. Responsive 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Upcoming Events & Recommended Projects */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section: Upcoming Events */}
          <section className="bg-white rounded-xl border border-[#E5E5E5] p-5 sm:p-6 shadow-xs">
            <SectionHeader
              title="Upcoming Events"
              subtitle="Campus schedules, hackathons, and guest seminars"
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/app/events')}
                >
                  View All Events
                </Button>
              }
            />

            {events.length === 0 ? (
              <div className="py-6">
                <EmptyState
                  icon={Calendar}
                  title="No upcoming events yet."
                  description="Campus event registrations and schedules will be published here as clubs and departments schedule new sessions."
                  actionLabel="Explore Events"
                  onAction={() => navigate('/app/events')}
                />
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {events.slice(0, 2).map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => navigate('/app/events')}
                    className="p-4 rounded-xl border border-[#E5E5E5] hover:border-[#DC2626]/40 hover:bg-[#FEF2F2]/20 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[#171717] group-hover:text-[#DC2626] transition-colors">
                          {ev.title}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
                          {ev.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-[#737373]">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {ev.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {ev.location}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      rightIcon={ArrowRight}
                      className="text-xs self-start sm:self-auto shrink-0"
                    >
                      Details
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section: Recommended Projects */}
          <section className="bg-white rounded-xl border border-[#E5E5E5] p-5 sm:p-6 shadow-xs">
            <SectionHeader
              title="Recommended Projects"
              subtitle="Project opportunities matching your department"
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/app/projects')}
                >
                  View All Projects
                </Button>
              }
            />

            {projects.length === 0 ? (
              <div className="py-6">
                <EmptyState
                  icon={FolderKanban}
                  title="No active projects found."
                  description="Be the first to propose a capstone or hackathon project."
                  actionLabel="Create Project"
                  onAction={() => navigate('/app/projects')}
                />
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {projects.slice(0, 2).map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => navigate('/app/projects')}
                    className="p-4 rounded-xl border border-[#E5E5E5] hover:border-[#DC2626]/40 hover:bg-[#FEF2F2]/20 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[#171717] group-hover:text-[#DC2626] transition-colors truncate">
                          {proj.title}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {proj.category}
                        </span>
                      </div>
                      <p className="text-xs text-[#737373] line-clamp-1">
                        {proj.description}
                      </p>
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        <span className="text-[11px] font-medium text-neutral-500">Looking for:</span>
                        {proj.lookingFor.slice(0, 2).map((role, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-[#171717] font-medium"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      rightIcon={ArrowRight}
                      className="text-xs self-start sm:self-auto shrink-0"
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column (5 cols): Academic Overview & Latest Notices */}
        <div className="lg:col-span-5 space-y-6">
          {/* Section: Academic Overview */}
          <section className="bg-white rounded-xl border border-[#E5E5E5] p-5 sm:p-6 shadow-xs">
            <SectionHeader
              title="Academic Overview"
              subtitle="Enrolled courses & attendance"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/app/academics')}
                  className="text-xs"
                >
                  Curriculum
                </Button>
              }
            />

            {/* Attendance & Subject Highlights */}
            <div className="space-y-3 pt-1">
              <div
                onClick={() => navigate('/app/academics?tab=attendance')}
                className="p-3.5 rounded-lg border border-[#E5E5E5] hover:bg-[#FEF2F2]/20 transition-colors flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#DC2626]">
                    <GraduationCap className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#171717]">
                      CS401: Distributed Systems
                    </h4>
                    <p className="text-[11px] text-[#737373]">
                      Mon, Wed 10:00 AM • Lecture Hall 204
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  93.8% Attended
                </span>
              </div>

              <div
                onClick={() => navigate('/app/academics?tab=attendance')}
                className="p-3.5 rounded-lg border border-[#E5E5E5] hover:bg-[#FEF2F2]/20 transition-colors flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-[#DC2626]">
                    <BookOpen className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#171717]">
                      CS403: Deep Learning
                    </h4>
                    <p className="text-[11px] text-[#737373]">
                      Tue, Thu 02:00 PM • AI Wing (Room 304)
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  86.7% Attended
                </span>
              </div>

              <div
                onClick={() => navigate('/app/academics?tab=attendance')}
                className="p-3.5 rounded-lg border border-[#E5E5E5] hover:bg-[#FEF2F2]/20 transition-colors flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-neutral-100 border border-[#E5E5E5] flex items-center justify-center text-neutral-700">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#171717]">
                      CS405: Big Data Analytics
                    </h4>
                    <p className="text-[11px] text-[#737373]">
                      Mon, Fri 09:00 AM • Turing Hall 3
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  100% Attended
                </span>
              </div>
            </div>

            {/* Footnote */}
            <div className="mt-4 pt-3 border-t border-[#E5E5E5] flex items-center justify-between text-xs text-[#737373]">
              <span className="flex items-center gap-1.5 text-neutral-500">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                Exam eligible (overall 89.2% &gt; 75%)
              </span>
              <button
                type="button"
                onClick={() => navigate('/app/academics?tab=attendance')}
                className="font-semibold text-[#DC2626] hover:underline cursor-pointer"
              >
                Attendance logs →
              </button>
            </div>
          </section>

          {/* Section: Latest Notices */}
          <section className="bg-white rounded-xl border border-[#E5E5E5] p-5 sm:p-6 shadow-xs">
            <SectionHeader
              title="Latest Notices"
              subtitle="Official university circulars"
            />

            {notices.length === 0 ? (
              <div className="py-6">
                <EmptyState
                  icon={Bell}
                  title="No notices available."
                  description="Official campus announcements and academic schedules will appear here."
                />
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                {notices.slice(0, 3).map((notice) => (
                  <div
                    key={notice.id}
                    onClick={() => navigate('/app/feed')}
                    className="p-3.5 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] space-y-1 hover:border-neutral-300 hover:bg-white transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#171717] line-clamp-1 hover:text-[#DC2626]">
                        {notice.title}
                      </span>
                      <span className="text-[10px] text-[#737373] whitespace-nowrap shrink-0">
                        {notice.date || notice.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#737373] line-clamp-2">
                      {notice.summary}
                    </p>
                  </div>
                ))}

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => navigate('/app/feed')}
                    className="text-xs font-semibold text-[#DC2626] hover:underline cursor-pointer"
                  >
                    View Community Feed & Exam Notices →
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
