import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Calendar,
  Clock,
  ShieldAlert,
  Play,
  CheckCircle2,
  AlertTriangle,
  Download,
  ExternalLink,
  Laptop,
  Video,
  Mic,
  Eye,
  Sparkles,
  HelpCircle,
  FileText,
  Printer,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import { useToast } from '../ui/Toast';
import {
  ONLINE_EXAMS_REGISTRY,
  SAMPLE_MOCK_TEST_QUESTIONS,
  EXAM_POLICY_GUIDELINES,
} from '../../data/examsData.js';

export default function OnlineExamsSection({ selectedSem, onSelectSem, user }) {
  const { addToast } = useToast();

  const semData = ONLINE_EXAMS_REGISTRY[selectedSem] || {
    semester: `${selectedSem}th Semester`,
    activeTerm: `Term ${selectedSem}`,
    hallTicketStatus: 'Not Scheduled',
    hallTicketNumber: `HT-2026-CSE-${selectedSem}000`,
    exams: [],
  };

  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [activeExamForTest, setActiveExamForTest] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes for mock test
  const [isHallTicketModalOpen, setIsHallTicketModalOpen] = useState(false);

  // Timer countdown when test modal is active
  useEffect(() => {
    let timer;
    if (isTestModalOpen && !testSubmitted && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTestModalOpen, testSubmitted, timeRemaining]);

  const handleStartExam = (exam) => {
    setActiveExamForTest(exam);
    setCurrentQIndex(0);
    setSelectedAnswers({});
    setTestSubmitted(false);
    setTimeRemaining(600);
    setIsTestModalOpen(true);
    addToast({
      type: 'info',
      title: 'Online Exam Session Started',
      message: `Proctored session initialized for ${exam.courseCode}: ${exam.title}`,
    });
  };

  const handleSelectAnswer = (qIndex, optionIndex) => {
    if (testSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIndex]: optionIndex,
    }));
  };

  const handleSubmitTest = () => {
    setTestSubmitted(true);
    let correctCount = 0;
    SAMPLE_MOCK_TEST_QUESTIONS.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        correctCount += 1;
      }
    });
    const percentage = Math.round((correctCount / SAMPLE_MOCK_TEST_QUESTIONS.length) * 100);
    addToast({
      type: 'success',
      title: 'Exam Submitted Successfully!',
      message: `You scored ${correctCount}/${SAMPLE_MOCK_TEST_QUESTIONS.length} (${percentage}%). Your answer script has been digitally logged.`,
    });
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Calculate score for display
  const totalQuestions = SAMPLE_MOCK_TEST_QUESTIONS.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const correctScore = SAMPLE_MOCK_TEST_QUESTIONS.reduce((acc, q, idx) => {
    return selectedAnswers[idx] === q.correctAnswer ? acc + 1 : acc;
  }, 0);

  return (
    <div className="space-y-6">
      {/* 1. TOP STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Scheduled Exams */}
        <div className="p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-xs">
          <div className="flex items-center justify-between text-[#737373] text-[11px] font-bold uppercase tracking-wider">
            <span>Scheduled Papers</span>
            <span className="p-1 rounded bg-red-50 text-[#DC2626]">
              <FileCheck2 className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-[#171717] mt-1.5">
            {semData.exams?.length || 0} Assessments
          </p>
          <span className="text-[11px] text-[#737373] mt-0.5 block">
            Online midterm & semester papers
          </span>
        </div>

        {/* Live / Active Today */}
        <div className="p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-xs">
          <div className="flex items-center justify-between text-[#737373] text-[11px] font-bold uppercase tracking-wider">
            <span>Live / Active Now</span>
            <span className="p-1 rounded bg-emerald-50 text-emerald-600 animate-pulse">
              <Play className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-1.5">
            {semData.exams?.filter((e) => e.status === 'Live Now').length || 0} Active
          </p>
          <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">
            AI proctored browser open
          </span>
        </div>

        {/* Digital Hall Ticket */}
        <div className="p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-xs">
          <div className="flex items-center justify-between text-[#737373] text-[11px] font-bold uppercase tracking-wider">
            <span>Admit Card / Hall Ticket</span>
            <span className="p-1 rounded bg-blue-50 text-blue-600">
              <FileText className="h-4 w-4" />
            </span>
          </div>
          <p className="text-sm font-black text-[#171717] mt-2 font-mono truncate">
            {semData.hallTicketNumber}
          </p>
          <button
            type="button"
            onClick={() => setIsHallTicketModalOpen(true)}
            className="text-[11px] font-bold text-[#DC2626] hover:underline mt-1 block cursor-pointer flex items-center gap-1"
          >
            <span>View & Print Admit Card</span>
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>

        {/* Proctoring Readiness */}
        <div className="p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-xs">
          <div className="flex items-center justify-between text-[#737373] text-[11px] font-bold uppercase tracking-wider">
            <span>Proctoring Compliance</span>
            <span className="p-1 rounded bg-purple-50 text-purple-600">
              <ShieldAlert className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-purple-700 mt-1.5">Verified</p>
          <span className="text-[11px] text-[#737373] mt-0.5 block flex items-center gap-1">
            <Video className="h-3 w-3 text-emerald-600" /> Cam & Mic Ready
          </span>
        </div>
      </div>

      {/* 2. ONLINE EXAMS SCHEDULE & ACTION LIST */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E5E5]">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#171717] flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-[#DC2626]" />
              {semData.semester} Online Examination Schedule
            </h2>
            <p className="text-xs text-[#737373] mt-0.5">
              Secure proctored assessments, continuous evaluations, and laboratory viva sessions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleStartExam({
                id: 'practice-quiz',
                courseCode: 'CS700-MOCK',
                title: 'Comprehensive CSE Online Assessment Mock Simulator',
                durationMinutes: 10,
              })}
              className="gap-1.5 font-bold cursor-pointer"
            >
              <Play className="h-4 w-4 text-[#DC2626]" />
              <span>Launch Mock Test</span>
            </Button>
          </div>
        </div>

        {semData.exams?.length === 0 ? (
          <div className="py-10 text-center text-xs text-[#737373] border border-dashed border-[#E5E5E5] rounded-xl p-6">
            <Calendar className="h-8 w-8 text-[#A3A3A3] mx-auto mb-2 opacity-50" />
            <p className="font-semibold text-[#171717]">No online exams currently published for {semData.semester}.</p>
            <p className="mt-1">Semester End Examinations and mid-term assessments will appear here once released by the Exam Cell.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {semData.exams.map((exam) => {
              const isLive = exam.status === 'Live Now';
              const isCompleted = exam.status === 'Completed';

              return (
                <div
                  key={exam.id}
                  className={`p-4 sm:p-5 rounded-xl border transition-all ${
                    isLive
                      ? 'border-[#DC2626] bg-[#FEF2F2]/30 shadow-xs ring-1 ring-[#DC2626]'
                      : isCompleted
                      ? 'border-[#E5E5E5] bg-[#FAFAFA]'
                      : 'border-[#E5E5E5] bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-[#DC2626] bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                          {exam.courseCode}
                        </span>
                        <h3 className="font-bold text-sm text-[#171717]">{exam.title}</h3>
                        <Badge
                          variant={
                            isLive
                              ? 'error'
                              : isCompleted
                              ? 'success'
                              : 'secondary'
                          }
                          size="sm"
                        >
                          {exam.status}
                        </Badge>
                      </div>

                      <p className="text-xs text-[#737373] leading-relaxed">
                        {exam.type} • <strong>Syllabus Scope:</strong> {exam.syllabusSummary}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-[#525252] flex-wrap pt-1">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-[#737373]" /> {exam.date}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-[#737373]" /> {exam.time} ({exam.durationMinutes} mins)
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Laptop className="h-3.5 w-3.5 text-[#737373]" /> Max Marks: {exam.totalMarks}
                        </span>
                        {exam.score && (
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Score: {exam.score} ({exam.grade})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                      {isLive && (
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => handleStartExam(exam)}
                          className="gap-1.5 font-bold cursor-pointer shadow-xs"
                        >
                          <Play className="h-4 w-4" />
                          <span>Enter Exam Lobby</span>
                        </Button>
                      )}

                      {!isLive && !isCompleted && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => handleStartExam(exam)}
                          className="gap-1.5 cursor-pointer text-xs"
                        >
                          <Play className="h-3.5 w-3.5" />
                          <span>Practice Test</span>
                        </Button>
                      )}

                      {isCompleted && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-4 w-4" /> Evaluated
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. PROCTORING & EXAM HALL CODE OF CONDUCT */}
      <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-5 space-y-3">
        <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-[#DC2626]" /> Statutory Online Examination Regulations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs text-[#525252]">
          {EXAM_POLICY_GUIDELINES.map((guide, idx) => (
            <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-white border border-neutral-200">
              <span className="font-bold text-[#DC2626] shrink-0 font-mono">0{idx + 1}.</span>
              <span className="leading-relaxed">{guide}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: LIVE ONLINE EXAM & MOCK SIMULATOR                                */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isTestModalOpen}
        onClose={() => {
          if (!testSubmitted) {
            if (window.confirm('Are you sure you want to exit the exam lobby? Your progress will be lost.')) {
              setIsTestModalOpen(false);
            }
          } else {
            setIsTestModalOpen(false);
          }
        }}
        title={activeExamForTest ? `${activeExamForTest.courseCode}: ${activeExamForTest.title}` : 'Online Examination'}
        description={testSubmitted ? 'Examination Evaluation Summary & Performance Report' : 'Proctored Assessment Session • Auto-submission enabled'}
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-[#737373]">
              {!testSubmitted ? (
                <>Answered: <strong>{answeredCount} / {totalQuestions}</strong></>
              ) : (
                <>Final Score: <strong className="text-emerald-700">{correctScore} / {totalQuestions}</strong> ({Math.round((correctScore / totalQuestions) * 100)}%)</>
              )}
            </span>

            <div className="flex items-center gap-2">
              {!testSubmitted ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={currentQIndex === 0}
                    onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                  >
                    Previous
                  </Button>
                  {currentQIndex < totalQuestions - 1 ? (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => setCurrentQIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                    >
                      Next Question
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleSubmitTest}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      Submit Exam Paper
                    </Button>
                  )}
                </>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setIsTestModalOpen(false)}
                >
                  Close & Return
                </Button>
              )}
            </div>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          {/* Top Status Bar during active test */}
          {!testSubmitted && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-center gap-2 text-xs">
                <span className="p-1 rounded bg-[#DC2626] text-white">
                  <Clock className="h-3.5 w-3.5" />
                </span>
                <span className="font-bold text-[#991B1B]">Time Remaining:</span>
                <span className="font-mono font-extrabold text-[#DC2626] text-sm">
                  {formatTimer(timeRemaining)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <Video className="h-3 w-3 text-emerald-600" /> AI Proctor Active
                </span>
              </div>
            </div>
          )}

          {/* Test Questions Navigation Palette */}
          <div className="flex items-center gap-1.5 flex-wrap pb-2 border-b border-[#E5E5E5]">
            <span className="text-[11px] font-bold text-[#737373] mr-1">Questions:</span>
            {SAMPLE_MOCK_TEST_QUESTIONS.map((_, idx) => {
              const isAnswered = selectedAnswers[idx] !== undefined;
              const isCurrent = currentQIndex === idx;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentQIndex(idx)}
                  className={`w-7 h-7 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-[#DC2626] text-white ring-2 ring-red-300'
                      : isAnswered
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'bg-neutral-100 text-[#525252] hover:bg-neutral-200'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Active Question Box */}
          {(() => {
            const q = SAMPLE_MOCK_TEST_QUESTIONS[currentQIndex];
            if (!q) return null;

            return (
              <div className="space-y-3 p-4 rounded-xl border border-neutral-200 bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#DC2626] uppercase">
                    Question {currentQIndex + 1} of {totalQuestions}
                  </span>
                  <span className="text-[11px] text-[#737373] font-medium">{q.subject}</span>
                </div>

                <p className="font-bold text-sm text-[#171717] leading-relaxed">
                  {q.question}
                </p>

                <div className="space-y-2 pt-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[currentQIndex] === optIdx;
                    const isCorrect = q.correctAnswer === optIdx;

                    let optionStyle = 'border-[#E5E5E5] bg-white hover:bg-neutral-50/70 text-[#171717]';
                    if (testSubmitted) {
                      if (isCorrect) {
                        optionStyle = 'border-emerald-500 bg-emerald-50/60 text-emerald-900 font-bold';
                      } else if (isSelected && !isCorrect) {
                        optionStyle = 'border-red-400 bg-red-50 text-red-900';
                      }
                    } else if (isSelected) {
                      optionStyle = 'border-[#DC2626] bg-[#FEF2F2] text-[#DC2626] font-bold ring-1 ring-[#DC2626]';
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectAnswer(currentQIndex, optIdx)}
                        disabled={testSubmitted}
                        className={`w-full p-3 rounded-lg border text-left flex items-start gap-3 transition-all cursor-pointer ${optionStyle}`}
                      >
                        <span className="font-mono font-bold text-xs shrink-0 mt-0.5">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <span className="flex-1 text-xs leading-relaxed">{opt}</span>
                        {testSubmitted && isCorrect && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation if submitted */}
                {testSubmitted && (
                  <div className="mt-3 p-3 rounded-lg bg-neutral-50 border border-neutral-200 text-xs">
                    <span className="font-bold text-[#171717] block mb-0.5">Concept Explanation:</span>
                    <p className="text-[#525252] leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: PRINTABLE DIGITAL ADMIT CARD / HALL TICKET                       */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isHallTicketModalOpen}
        onClose={() => setIsHallTicketModalOpen(false)}
        title="Official Examination Hall Ticket"
        description="Statutory digital admit card for university mid-term & semester end examinations"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsHallTicketModalOpen(false)}
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
              Office of the Controller of Examinations • Autonomous Examination Wing
            </p>
            <p className="text-[10px] text-[#DC2626] font-bold">
              DIGITAL ADMIT CARD / EXAM HALL TICKET • {semData.semester} (2026 - 2027)
            </p>
          </div>

          {/* Student Meta Grid */}
          <div className="grid grid-cols-2 gap-2.5 p-3 rounded-lg bg-neutral-50 border border-neutral-200">
            <div>
              <span className="text-[10px] text-[#737373] block uppercase font-bold">Student Name:</span>
              <strong className="text-[#171717]">{user?.name || user?.fullName || 'Sayan Mukherjee'}</strong>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#737373] block uppercase font-bold">Hall Ticket Number:</span>
              <strong className="font-mono text-[#DC2626]">{semData.hallTicketNumber}</strong>
            </div>
            <div>
              <span className="text-[10px] text-[#737373] block uppercase font-bold">Roll / Reg Number:</span>
              <strong className="font-mono text-[#171717]">{user?.rollNo || '21BCSE084'}</strong>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#737373] block uppercase font-bold">Examination Centre:</span>
              <strong className="text-[#171717]">Aryabhatta Block & Online Lab</strong>
            </div>
          </div>

          {/* Table of Papers */}
          <div>
            <h5 className="font-bold text-xs text-[#171717] mb-2">Registered Examination Papers:</h5>
            <div className="overflow-x-auto rounded border border-neutral-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-[10px] font-bold text-[#737373] uppercase">
                  <tr>
                    <th className="py-2 px-2.5">Code</th>
                    <th className="py-2 px-3">Subject Title</th>
                    <th className="py-2 px-2.5">Date</th>
                    <th className="py-2 px-2.5">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {semData.exams?.map((e) => (
                    <tr key={e.id}>
                      <td className="py-2 px-2.5 font-mono font-bold text-[#DC2626]">{e.courseCode}</td>
                      <td className="py-2 px-3 font-semibold text-[#171717]">{e.title}</td>
                      <td className="py-2 px-2.5 text-[#525252]">{e.date}</td>
                      <td className="py-2 px-2.5 text-[#525252]">{e.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Seals */}
          <div className="flex items-center justify-between pt-3 border-t border-neutral-200 text-[10px] text-[#737373]">
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              <span>Biometrically Cleared & Authorized</span>
            </div>
            <div className="text-right">
              <span className="block font-bold text-[#171717]">Dr. R. K. Bhattacharya</span>
              <span>Controller of Examinations</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
