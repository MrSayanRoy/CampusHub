import React, { useState } from 'react';
import {
  Award,
  TrendingUp,
  FileText,
  Download,
  Printer,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  BookOpen,
  Calendar,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import { useToast } from '../ui/Toast';
import {
  SEMESTER_RESULTS_REGISTRY,
  CUMULATIVE_PERFORMANCE,
  GRADING_SCALE_LEGEND,
} from '../../data/resultsData.js';

export default function ResultsSection({ selectedSem, onSelectSem, user }) {
  const { addToast } = useToast();

  const semResults = SEMESTER_RESULTS_REGISTRY[selectedSem] || {
    semester: `${selectedSem}th Semester`,
    academicYear: '2026 - 2027',
    term: `Semester ${selectedSem}`,
    status: 'Not Published',
    sgpa: null,
    cgpa: CUMULATIVE_PERFORMANCE.overallCgpa,
    creditsRegistered: 0,
    creditsEarned: 0,
    courses: [],
  };

  const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState(false);
  const [isGradingScaleModalOpen, setIsGradingScaleModalOpen] = useState(false);

  const handleDownloadTranscript = () => {
    addToast({
      type: 'info',
      title: 'Preparing Transcript',
      message: `Compiling consolidated official grade sheet for ${user?.name || 'Student'}...`,
    });
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Cumulative CGPA */}
        <div className="p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-xs">
          <div className="flex items-center justify-between text-[#737373] text-[11px] font-bold uppercase tracking-wider">
            <span>Cumulative CGPA</span>
            <span className="p-1 rounded bg-red-50 text-[#DC2626]">
              <Award className="h-4 w-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-3xl font-black text-[#171717]">
              {CUMULATIVE_PERFORMANCE.overallCgpa}
            </span>
            <span className="text-xs font-bold text-[#737373]">/ 10.00</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> {CUMULATIVE_PERFORMANCE.academicStatus}
          </span>
        </div>

        {/* Selected Semester SGPA */}
        <div className="p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-xs">
          <div className="flex items-center justify-between text-[#737373] text-[11px] font-bold uppercase tracking-wider">
            <span>{semResults.semester} SGPA</span>
            <span className="p-1 rounded bg-blue-50 text-blue-600">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-3xl font-black text-blue-600">
              {semResults.sgpa !== null ? semResults.sgpa : 'N/A'}
            </span>
            {semResults.sgpa !== null && (
              <span className="text-xs font-bold text-[#737373]">/ 10.00</span>
            )}
          </div>
          <span className="text-[11px] text-[#737373] mt-0.5 block">
            {semResults.status}
          </span>
        </div>

        {/* Credits Earned */}
        <div className="p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-xs">
          <div className="flex items-center justify-between text-[#737373] text-[11px] font-bold uppercase tracking-wider">
            <span>Credits Earned</span>
            <span className="p-1 rounded bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-3xl font-black text-[#171717]">
              {CUMULATIVE_PERFORMANCE.totalCreditsEarned}
            </span>
            <span className="text-xs font-bold text-[#737373]">
              / {CUMULATIVE_PERFORMANCE.totalCreditsRequired} Req.
            </span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">
            {Math.round((CUMULATIVE_PERFORMANCE.totalCreditsEarned / CUMULATIVE_PERFORMANCE.totalCreditsRequired) * 100)}% of degree requirements met
          </span>
        </div>

        {/* Academic Standing */}
        <div className="p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-xs">
          <div className="flex items-center justify-between text-[#737373] text-[11px] font-bold uppercase tracking-wider">
            <span>Class Standing</span>
            <span className="p-1 rounded bg-purple-50 text-purple-600">
              <GraduationCap className="h-4 w-4" />
            </span>
          </div>
          <p className="text-sm font-black text-[#171717] mt-2 truncate">
            {CUMULATIVE_PERFORMANCE.classStanding}
          </p>
          <span className="text-[11px] text-[#737373] mt-1 block">
            University Rank: <strong>{CUMULATIVE_PERFORMANCE.universityRank}</strong>
          </span>
        </div>
      </div>

      {/* 2. SEMESTER GRADE SHEET TABLE */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E5E5]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-[#171717]">
                {semResults.semester} Grade Card & Performance Sheet
              </h2>
              <Badge
                variant={semResults.sgpa ? 'success' : 'secondary'}
                size="sm"
              >
                {semResults.status}
              </Badge>
            </div>
            <p className="text-xs text-[#737373] mt-0.5">
              Academic Term: <strong>{semResults.term}</strong> • Declared:{' '}
              <strong>{semResults.declarationDate || 'Pending Final Evaluation'}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsTranscriptModalOpen(true)}
              className="gap-1.5 font-bold cursor-pointer"
            >
              <FileText className="h-4 w-4 text-[#DC2626]" />
              <span>Official Grade Card</span>
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsGradingScaleModalOpen(true)}
              className="gap-1 cursor-pointer text-xs"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Grading Scale</span>
            </Button>
          </div>
        </div>

        {semResults.courses?.length === 0 ? (
          <div className="py-10 text-center text-xs text-[#737373] border border-dashed border-[#E5E5E5] rounded-xl p-6">
            <Award className="h-8 w-8 text-[#A3A3A3] mx-auto mb-2 opacity-50" />
            <p className="font-semibold text-[#171717]">No evaluation records published for {semResults.semester}.</p>
            <p className="mt-1">Grade cards and SGPA results will be published here upon ratification by the Academic Council.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[#E5E5E5]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAFA] border-b border-[#E5E5E5] text-[11px] font-bold text-[#737373] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Course Code</th>
                  <th className="py-2.5 px-4">Subject Title</th>
                  <th className="py-2.5 px-3 text-center">Type</th>
                  <th className="py-2.5 px-3 text-center">Credits</th>
                  <th className="py-2.5 px-3 text-center">Internal (30)</th>
                  <th className="py-2.5 px-3 text-center">Mid (20)</th>
                  <th className="py-2.5 px-3 text-center">End (50)</th>
                  <th className="py-2.5 px-3 text-center font-bold text-[#171717]">Total (100)</th>
                  <th className="py-2.5 px-3 text-center">Grade</th>
                  <th className="py-2.5 px-3 text-center">Grade Points</th>
                  <th className="py-2.5 px-3 text-center">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {semResults.courses.map((course) => {
                  const isO = course.grade === 'O';
                  const isA = course.grade.startsWith('A');

                  return (
                    <tr key={course.code} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-[#DC2626]">
                        {course.code}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#171717]">
                        {course.title}
                      </td>
                      <td className="py-3 px-3 text-center text-[#737373]">
                        {course.type}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-[#171717]">
                        {course.credits}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-[#525252]">
                        {course.internalMarks ?? '-'}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-[#525252]">
                        {course.midTermMarks ? course.midTermMarks : '-'}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-[#525252]">
                        {course.endTermMarks ?? '-'}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-[#171717] bg-neutral-50">
                        {course.totalMarks ?? '-'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded font-black font-mono text-xs ${
                            isO
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : isA
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-neutral-100 text-[#525252]'
                          }`}
                        >
                          {course.grade}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-[#171717]">
                        {course.gradePoints}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {course.result}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-[#FAFAFA] border-t-2 border-[#E5E5E5] text-xs font-bold">
                <tr>
                  <td colSpan={3} className="py-3 px-4 text-[#171717]">
                    Total Registered Credits: {semResults.creditsRegistered}
                  </td>
                  <td className="py-3 px-3 text-center text-[#171717]">
                    {semResults.creditsEarned}
                  </td>
                  <td colSpan={4} className="py-3 px-3 text-right text-[#737373]">
                    Semester Grade Point Average:
                  </td>
                  <td colSpan={3} className="py-3 px-3 text-center font-mono text-base font-extrabold text-[#DC2626]">
                    SGPA: {semResults.sgpa ?? 'Pending'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* 3. GPA PROGRESSION & SEMESTER PERFORMANCE TREND */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E5]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#737373] flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-[#DC2626]" /> Degree GPA Progression History (Sem 1 to 7)
          </h3>
          <span className="text-xs font-bold text-[#171717]">
            Overall CGPA: <span className="text-[#DC2626] font-mono">{CUMULATIVE_PERFORMANCE.overallCgpa}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {CUMULATIVE_PERFORMANCE.gpaTrend.map((trend, idx) => {
            const semNum = idx + 1;
            const isSelected = selectedSem === semNum;
            const heightPercent = Math.min(100, Math.max(30, (trend.sgpa / 10) * 100));

            return (
              <button
                key={trend.sem}
                type="button"
                onClick={() => onSelectSem(semNum)}
                className={`p-3 rounded-xl border flex flex-col items-center justify-between text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#DC2626] bg-[#FEF2F2]/50 shadow-xs ring-1 ring-[#DC2626]'
                    : 'border-[#E5E5E5] bg-[#FAFAFA] hover:bg-white hover:border-neutral-300'
                }`}
              >
                <span className="text-xs font-bold text-[#171717]">{trend.sem}</span>

                <div className="w-full bg-neutral-200 h-16 rounded-lg my-2 flex items-end p-1">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded transition-all ${
                      isSelected ? 'bg-[#DC2626]' : 'bg-emerald-600'
                    }`}
                  />
                </div>

                <div className="space-y-0.5">
                  <span className="font-mono font-extrabold text-sm text-[#171717] block">
                    {trend.sgpa}
                  </span>
                  <span className="text-[10px] text-[#737373] block">
                    CGPA {trend.cgpa}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: OFFICIAL GRADE CARD / TRANSCRIPT POPUP                           */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isTranscriptModalOpen}
        onClose={() => setIsTranscriptModalOpen(false)}
        title="Official Academic Grade Card"
        description="Statutory digital grade transcript issued by the Examination Controller"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsTranscriptModalOpen(false)}
            >
              Close
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => window.print()}
              className="gap-1.5 font-bold cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Print / Download PDF</span>
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs p-4 rounded-xl border border-neutral-200 bg-white">
          {/* Header */}
          <div className="text-center pb-3 border-b-2 border-neutral-200 space-y-0.5">
            <h4 className="font-black text-sm text-[#171717] uppercase tracking-wide">
              CampusHub Institute of Technology
            </h4>
            <p className="text-[11px] text-[#737373]">
              Autonomous Institution Accredited with 'A++' Grade
            </p>
            <p className="text-[10px] text-[#DC2626] font-bold">
              OFFICIAL SEMESTER GRADE TRANSCRIPT • {semResults.semester}
            </p>
          </div>

          {/* Student Info Box */}
          <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 text-xs">
            <div>
              <span className="text-[10px] text-[#737373] block uppercase font-bold">Student Name:</span>
              <strong className="text-[#171717]">{user?.name || user?.fullName || 'Sayan Mukherjee'}</strong>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#737373] block uppercase font-bold">Roll / Reg Number:</span>
              <strong className="font-mono text-[#DC2626]">{user?.rollNo || '21BCSE084'}</strong>
            </div>
            <div>
              <span className="text-[10px] text-[#737373] block uppercase font-bold">Program:</span>
              <span className="text-[#525252]">B.Tech (Computer Science & Eng.)</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#737373] block uppercase font-bold">Academic Session:</span>
              <span className="font-bold text-[#171717]">{semResults.academicYear}</span>
            </div>
          </div>

          {/* Grades Table */}
          <div className="overflow-x-auto rounded border border-neutral-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-[10px] font-bold text-[#737373] uppercase">
                <tr>
                  <th className="py-2 px-2.5">Code</th>
                  <th className="py-2 px-3">Subject Name</th>
                  <th className="py-2 px-2 text-center">Credits</th>
                  <th className="py-2 px-2 text-center">Grade</th>
                  <th className="py-2 px-2 text-center">Points</th>
                  <th className="py-2 px-2 text-center">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {semResults.courses?.map((c) => (
                  <tr key={c.code}>
                    <td className="py-2 px-2.5 font-mono font-bold text-[#DC2626]">{c.code}</td>
                    <td className="py-2 px-3 font-semibold text-[#171717]">{c.title}</td>
                    <td className="py-2 px-2 text-center font-bold">{c.credits}</td>
                    <td className="py-2 px-2 text-center font-mono font-black">{c.grade}</td>
                    <td className="py-2 px-2 text-center font-mono">{c.gradePoints}</td>
                    <td className="py-2 px-2 text-center text-emerald-700 font-bold">{c.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* SGPA & CGPA Highlight Banner */}
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-emerald-900 block">
                Semester Grade Point Average (SGPA):
              </span>
              <span className="text-[10px] text-emerald-700">
                Credits Earned: {semResults.creditsEarned} • Cumulative CGPA: {semResults.cgpa}
              </span>
            </div>
            <span className="text-2xl font-black text-emerald-800 font-mono">
              {semResults.sgpa ?? '9.15'}
            </span>
          </div>

          {/* Digital Signature & Seal */}
          <div className="flex items-center justify-between pt-3 border-t border-neutral-200 text-[10px] text-[#737373]">
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              <span>Certified Digital Academic Record</span>
            </div>
            <div className="text-right">
              <span className="block font-bold text-[#171717]">Dr. R. K. Bhattacharya</span>
              <span>Controller of Examinations</span>
            </div>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: GRADING SCALE LEGEND POPUP                                       */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isGradingScaleModalOpen}
        onClose={() => setIsGradingScaleModalOpen(false)}
        title="10-Point Academic Grading Scale"
        description="UGC & AICTE standardized letter grading framework"
      >
        <div className="space-y-3 text-xs">
          <div className="overflow-x-auto rounded border border-[#E5E5E5]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAFA] border-b border-[#E5E5E5] text-[11px] font-bold text-[#737373] uppercase">
                <tr>
                  <th className="py-2 px-3">Grade</th>
                  <th className="py-2 px-3">Grade Points</th>
                  <th className="py-2 px-3">Marks Range</th>
                  <th className="py-2 px-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {GRADING_SCALE_LEGEND.map((scale) => (
                  <tr key={scale.grade}>
                    <td className="py-2 px-3 font-mono font-black text-[#DC2626]">{scale.grade}</td>
                    <td className="py-2 px-3 font-mono font-bold text-[#171717]">{scale.points}</td>
                    <td className="py-2 px-3 text-[#525252]">{scale.range}</td>
                    <td className="py-2 px-3 font-medium text-[#171717]">{scale.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 text-[11px] text-[#737373]">
            <strong>Conversion Formula:</strong> Equivalent Percentage (%) = CGPA × 9.5 as mandated by Institute Academic Ordinance.
          </div>
        </div>
      </Modal>
    </div>
  );
}
