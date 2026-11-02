import React from 'react';
import { Edit3, Calendar, GraduationCap, Mail, ShieldCheck } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

/**
 * ProfileInfoCard Component
 * Displays the large profile header card with avatar (or initials like SR),
 * student name, department, semester, role badge "Student", and join date.
 */
export default function ProfileInfoCard({
  user,
  onEditClick,
  className = '',
}) {
  const student = user || {};
  const displayName = student.name || student.fullName || 'Student';
  const department = student.department || 'Computer Science & Engineering';
  const semester = student.semester || '7th Semester';
  const role = student.role || 'Student';
  const joinedDate = student.joinedDate || 'Joined September 2026';
  const studentId = student.studentId || 'CS-2024-8831';
  const email = student.email || '';

  return (
    <div
      className={`
        bg-white rounded-xl border border-[#E5E5E5] p-5 sm:p-7 shadow-xs
        hover:border-neutral-300 transition-all duration-150 relative overflow-hidden
        ${className}
      `}
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        {/* Left / Info grouping */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left w-full sm:w-auto">
          {/* Large circular avatar with fallback to initials (e.g., AM) */}
          <Avatar
            src={student.avatar}
            name={displayName}
            size="2xl"
            status="online"
            className="ring-4 ring-[#F5F5F5] shadow-xs shrink-0"
          />

          {/* Student Info Details */}
          <div className="space-y-2 min-w-0">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 flex-wrap justify-center sm:justify-start">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#171717] tracking-tight truncate">
                {displayName}
              </h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F5F5F5] text-[#525252] border border-[#E5E5E5]">
                {role}
              </span>
              {studentId && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-[#FAFAFA] text-[#737373] border border-[#E5E5E5]">
                  ID: {studentId}
                </span>
              )}
            </div>

            {/* Department and Semester */}
            <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 text-xs sm:text-sm text-[#737373]">
              <span className="flex items-center gap-1.5 font-medium text-[#171717]">
                <GraduationCap className="h-4 w-4 text-[#525252] shrink-0" />
                {department}
              </span>
              <span className="hidden sm:inline text-neutral-300">•</span>
              <span className="font-medium text-[#737373]">{semester}</span>
            </div>

            {/* Email if available */}
            {email && (
              <p className="text-xs text-[#737373] flex items-center justify-center sm:justify-start gap-1.5">
                <Mail className="h-3.5 w-3.5 text-[#A3A3A3] shrink-0" />
                <span className="truncate">{email}</span>
              </p>
            )}

            {/* Joined date */}
            <div className="pt-1 flex items-center justify-center sm:justify-start gap-1.5 text-xs text-[#737373]">
              <Calendar className="h-3.5 w-3.5 text-[#A3A3A3] shrink-0" />
              <span>{joinedDate}</span>
            </div>
          </div>
        </div>

        {/* Right / Edit Profile Button */}
        <div className="w-full sm:w-auto shrink-0 flex justify-center sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="md"
            leftIcon={Edit3}
            onClick={onEditClick}
            className="w-full sm:w-auto font-semibold bg-white text-[#171717] border border-[#E5E5E5] hover:border-[#DC2626] hover:text-[#DC2626] hover:bg-white transition-colors"
          >
            Edit Profile
          </Button>
        </div>
      </div>
    </div>
  );
}
