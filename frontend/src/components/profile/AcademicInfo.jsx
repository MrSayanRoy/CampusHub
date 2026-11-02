import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { GraduationCap, Calendar, CheckCircle2, ShieldCheck, Edit3, Terminal } from 'lucide-react';
import Button from '../ui/Button';

/**
 * AcademicInfo Component
 * Displays Department, Semester, Student ID, Campus Status, and CSE Department details.
 */
export default function AcademicInfo({
  user = {},
  onEditClick,
  className = '',
}) {
  const department = user.department || 'Computer Science & Engineering';
  const semester = user.semester || '7th Semester';
  const studentId = user.studentId || 'CS-2024-8831';
  const campusStatus = user.campusStatus || 'All systems normal';

  const academicItems = [
    {
      label: 'Department',
      value: department,
      icon: GraduationCap,
      iconColor: 'text-[#525252]',
      subtext: user.departmentCode ? `Code: ${user.departmentCode}` : 'Engineering Faculty',
    },
    {
      label: 'Semester',
      value: semester,
      icon: Calendar,
      iconColor: 'text-[#525252]',
      subtext: 'Academic Session 2025-2026',
    },
    {
      label: 'Student ID',
      value: studentId,
      icon: ShieldCheck,
      iconColor: 'text-[#525252]',
      subtext: 'Official Institutional Roll No.',
    },
    {
      label: 'Campus Status',
      value: campusStatus,
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      subtext: 'Active enrollment in good standing',
      statusPill: 'Normal',
    },
  ];

  return (
    <Card className={className}>
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-[#525252]" />
          <CardTitle>Academic Information</CardTitle>
        </div>

        {onEditClick && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            leftIcon={Edit3}
            onClick={onEditClick}
            className="text-xs font-semibold text-[#525252] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
          >
            Edit
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {academicItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="p-3.5 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] hover:bg-white hover:border-neutral-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md bg-white border border-[#E5E5E5] ${item.iconColor || 'text-[#525252]'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold text-[#737373] uppercase tracking-wider">
                      {item.label}
                    </span>
                  </div>
                  {item.statusPill && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {item.statusPill}
                    </span>
                  )}
                </div>

                <div className="mt-2 pl-0.5">
                  <p className="text-sm font-bold text-[#171717] truncate">
                    {item.value}
                  </p>
                  {item.subtext && (
                    <p className="text-xs text-[#737373] mt-0.5 truncate">
                      {item.subtext}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Dedicated CSE Department Section */}
        {(department.includes('Computer Science') || user.departmentCode === 'CSE') && (
          <div className="mt-5 pt-4 border-t border-[#E5E5E5]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-[#F5F5F5] border border-[#E5E5E5] text-[#525252]">
                  <Terminal className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#171717] uppercase tracking-wider">
                    CSE Department Details
                  </h4>
                  <p className="text-[11px] text-[#737373]">
                    Computer Science & Engineering specialization and laboratory allocation
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F5F5F5] text-[#525252] border border-[#E5E5E5]">
                CSE Faculty
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA]">
                <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider block">
                  Track / Specialization
                </span>
                <p className="text-xs sm:text-sm font-bold text-[#171717] mt-1">
                  {user.cseSpecialization || 'Software Systems & Distributed Computing'}
                </p>
              </div>

              <div className="p-3 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA]">
                <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider block">
                  Class Section
                </span>
                <p className="text-xs sm:text-sm font-bold text-[#171717] mt-1">
                  {user.cseSection || 'Section A (CSE-A)'}
                </p>
              </div>

              <div className="p-3 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA]">
                <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider block">
                  Assigned Computing Lab
                </span>
                <p className="text-xs sm:text-sm font-bold text-[#171717] mt-1 truncate">
                  {user.cseLabGroup || 'Turing Advanced Computing Lab (Lab 4)'}
                </p>
              </div>

              <div className="p-3 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA]">
                <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider block">
                  Faculty Advisor
                </span>
                <p className="text-xs sm:text-sm font-bold text-[#171717] mt-1 truncate">
                  {user.cseAdvisor || 'Dr. Rajesh Sharma (Head of CSE)'}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
