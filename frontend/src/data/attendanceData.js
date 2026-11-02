/**
 * Attendance Tracking Dataset for CampusHub Academics
 * Contains comprehensive attendance records for all semesters (Sem 1 through Sem 8)
 * and each subject, including exact class date, time, topic, room, and attendance status.
 */

import { ACADEMIC_CURRICULUM, SEMESTERS_LIST } from './academicsData.js';

// Helper to generate realistic dates and times for class sessions
function generateSessionsForSubject(subject, semesterNum) {
  const scheduleStr = subject.schedule || '';
  
  // Extract class time from schedule string (e.g., "Mon, Wed 10:00 AM - 11:30 AM" -> "10:00 AM - 11:30 AM")
  let classTime = '10:00 AM - 11:30 AM';
  const timeMatch = scheduleStr.match(/\d{1,2}:\d{2}\s*(?:AM|PM)\s*-\s*\d{1,2}:\d{2}\s*(?:AM|PM)/i);
  if (timeMatch) {
    classTime = timeMatch[0];
  } else if (scheduleStr.toLowerCase().includes('practicum') || scheduleStr.toLowerCase().includes('execution')) {
    classTime = '09:00 AM - 05:00 PM';
  }

  // Determine days of the week from schedule
  const days = [];
  if (scheduleStr.includes('Mon')) days.push(1); // Monday
  if (scheduleStr.includes('Tue')) days.push(2); // Tuesday
  if (scheduleStr.includes('Wed')) days.push(3); // Wednesday
  if (scheduleStr.includes('Thu')) days.push(4); // Thursday
  if (scheduleStr.includes('Fri')) days.push(5); // Friday
  if (scheduleStr.includes('Sat')) days.push(6); // Saturday
  if (days.length === 0) days.push(1, 3); // Fallback: Mon & Wed

  // Sample curriculum topics per module
  const topicsPool = (subject.modules && subject.modules.length > 0)
    ? subject.modules
    : [
        'Fundamental Principles & Theoretical Foundations',
        'Architecture Overview & Core Primitives',
        'State Machines, Execution Models & Control Structures',
        'Algorithmic Implementations & Complexity Analysis',
        'Practical Case Studies & Production Benchmarks',
        'System Optimization & Memory Profiling',
        'Mid-Term Assessment & Problem Solving Workshop',
        'Advanced Paradigms & Industry Best Practices',
        'Integration Testing & Verification Protocols',
        'Capstone Synthesis & Final Project Evaluation',
      ];

  // Specific predetermined records for current semester (Sem 7) or standard past sessions
  // Generate around 14 to 22 past conducted sessions from Aug 10, 2026 to Sep 30, 2026
  const sessions = [];
  
  // Candidate dates between Aug 10, 2026 and Sep 30, 2026 that match the class days
  // Let's create an explicit list of calendar days in August/September 2026
  const termStartDate = new Date(2026, 7, 10); // Aug 10, 2026 (Monday)
  const termEndDate = new Date(2026, 8, 30);   // Sep 30, 2026 (Wednesday)

  let curDate = new Date(termStartDate);
  let sessionIndex = 0;

  // Derive pseudo-random but deterministic pattern based on subject code and sem
  let seed = 0;
  for (let i = 0; i < subject.code.length; i++) {
    seed += subject.code.charCodeAt(i);
  }

  while (curDate <= termEndDate) {
    const dayOfWeek = curDate.getDay();
    if (days.includes(dayOfWeek)) {
      sessionIndex++;
      const dateStr = curDate.toISOString().split('T')[0];
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const formattedDate = `${dayNames[dayOfWeek]}, ${curDate.getDate()} ${monthNames[curDate.getMonth()]} 2026`;

      // Topic cycle
      const topicIndex = (sessionIndex - 1) % topicsPool.length;
      const topic = topicsPool[topicIndex];

      // Deterministic attendance status
      // Aim for 80% - 95% attendance for most subjects, with 1-2 borderline ones
      const isShortageSub = (subject.code === 'CS407PE' || subject.code === 'MA102' || subject.code === 'CS206');
      const hash = (seed * 17 + sessionIndex * 23 + curDate.getDate()) % 100;
      
      let status = 'Present';
      let remarks = 'Verified via biometric card scan at doorway terminal.';

      if (isShortageSub) {
        if (hash < 26) {
          status = 'Absent';
          remarks = 'Unexcused absence recorded during digital roll call.';
        } else if (hash < 32) {
          status = 'Excused';
          remarks = 'Official duty / department council leave approved.';
        }
      } else {
        if (hash < 8) {
          status = 'Absent';
          remarks = 'Unexcused absence recorded by professor.';
        } else if (hash < 12) {
          status = 'Excused';
          remarks = 'Medical / approved college event leave certificate accepted.';
        }
      }

      sessions.unshift({
        id: `${subject.code}-sess-${dateStr}`,
        sessionNumber: sessionIndex,
        date: dateStr,
        formattedDate,
        dayOfWeek: dayNames[dayOfWeek],
        classTime,
        topic: `Lecture #${sessionIndex}: ${topic}`,
        room: subject.room,
        instructor: subject.instructor,
        sessionType: subject.type.includes('Lab') ? 'Laboratory Practical' : 'Classroom Lecture',
        status, // 'Present', 'Absent', 'Excused'
        mode: subject.type.includes('Lab') ? 'Lab Terminal Login Record' : 'Biometric RFID Scanner #4',
        remarks,
      });
    }

    curDate.setDate(curDate.getDate() + 1);
  }

  // Calculate totals
  const totalClasses = sessions.length;
  const attendedClasses = sessions.filter((s) => s.status === 'Present').length;
  const excusedClasses = sessions.filter((s) => s.status === 'Excused').length;
  const absentClasses = sessions.filter((s) => s.status === 'Absent').length;

  // University policy: Excused leaves often count toward attended or reduce denominator
  // Let's count (attended + excused) as effective attended for percentage
  const effectiveAttended = attendedClasses + excusedClasses;
  const percentage = totalClasses > 0 ? ((effectiveAttended / totalClasses) * 100).toFixed(1) : '100.0';
  const numericPct = parseFloat(percentage);

  // Status threshold (75% standard)
  let statusBadge = 'Safe';
  let statusNote = 'Well above the 75% university requirement.';
  if (numericPct < 75) {
    statusBadge = 'Shortage';
    // Calculate how many consecutive classes need to be attended to reach 75%
    // (attended + X) / (total + X) >= 0.75  =>  attended + X >= 0.75*total + 0.75*X  =>  0.25*X >= 0.75*total - attended
    const needed = Math.max(1, Math.ceil((0.75 * totalClasses - effectiveAttended) / 0.25));
    statusNote = `Attendance shortage! Must attend next ${needed} consecutive class${needed > 1 ? 'es' : ''} to reach 75%.`;
  } else if (numericPct < 80) {
    statusBadge = 'Borderline';
    statusNote = 'Borderline attendance. Missing 1 more class will put you at risk of shortage.';
  } else {
    // How many classes can be safely missed without falling below 75%
    // (attended) / (total + Y) >= 0.75  =>  total + Y <= attended / 0.75
    const canBunk = Math.max(0, Math.floor((effectiveAttended - 0.75 * totalClasses) / 0.75));
    statusNote = canBunk > 0
      ? `Eligible for semester end exams. Can safely afford to miss ${canBunk} class${canBunk > 1 ? 'es' : ''}.`
      : 'Eligible for semester end exams. Maintain your current attendance.';
  }

  return {
    subjectCode: subject.code,
    subjectTitle: subject.title,
    instructor: subject.instructor,
    designation: subject.designation,
    schedule: subject.schedule,
    classTime,
    room: subject.room,
    type: subject.type,
    credits: subject.credits,
    totalClasses,
    attendedClasses,
    excusedClasses,
    absentClasses,
    effectiveAttended,
    percentage: numericPct,
    statusBadge,
    statusNote,
    sessions,
  };
}

// Generate the complete attendance registry for all 8 semesters
export const SEMESTER_ATTENDANCE_REGISTRY = {};

Object.entries(ACADEMIC_CURRICULUM).forEach(([semNum, semData]) => {
  const subjectsAttendance = semData.subjects.map((sub) =>
    generateSessionsForSubject(sub, parseInt(semNum, 10))
  );

  const totalClasses = subjectsAttendance.reduce((acc, s) => acc + s.totalClasses, 0);
  const totalAttended = subjectsAttendance.reduce((acc, s) => acc + s.attendedClasses, 0);
  const totalExcused = subjectsAttendance.reduce((acc, s) => acc + s.excusedClasses, 0);
  const totalAbsent = subjectsAttendance.reduce((acc, s) => acc + s.absentClasses, 0);
  const effectiveTotal = totalAttended + totalExcused;
  const overallPercentage = totalClasses > 0 ? ((effectiveTotal / totalClasses) * 100).toFixed(1) : '100.0';

  SEMESTER_ATTENDANCE_REGISTRY[semNum] = {
    semesterNumber: parseInt(semNum, 10),
    semesterName: semData.semester,
    academicSession: semData.academicSession,
    totalSubjects: subjectsAttendance.length,
    totalClasses,
    totalAttended,
    totalExcused,
    totalAbsent,
    overallPercentage: parseFloat(overallPercentage),
    isEligible: parseFloat(overallPercentage) >= 75.0,
    subjects: subjectsAttendance,
  };
});

/**
 * Helper to get attendance stats for a specific semester
 */
export function getSemesterAttendance(semNum = 7) {
  return SEMESTER_ATTENDANCE_REGISTRY[semNum] || SEMESTER_ATTENDANCE_REGISTRY[7];
}

/**
 * Attendance Policy Rules Configuration
 */
export const ATTENDANCE_POLICY = {
  mandatoryPercentage: 75.0,
  condonationThreshold: 65.0,
  deanApprovalRequired: 65.0,
  detentionThreshold: 60.0,
  description: 'Minimum 75% attendance in each registered theory and laboratory course is strictly required by the Academic Council to qualify for Semester End Examinations (SEE).',
};
