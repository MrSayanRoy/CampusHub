import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  BookOpen,
  Download,
  Printer,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Filter,
  Grid3X3,
  List,
  Layers,
  ChevronRight,
  Share2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import { useToast } from '../ui/Toast';
import {
  DAYS_OF_WEEK,
  TIME_SLOTS,
  SEMESTER_TIMETABLES,
} from '../../data/timetableData.js';

export default function TimetableSection({ selectedSem, onSelectSem, user, onSwitchToCurriculum }) {
  const { addToast } = useToast();

  const currentTimetable = SEMESTER_TIMETABLES[selectedSem] || {
    semester: `${selectedSem}th Semester`,
    academicYear: '2026 - 2027',
    term: `Term ${selectedSem}`,
    section: 'CSE - Section A',
    classroom: `Hall ${selectedSem}01`,
    schedule: {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
    },
  };

  // Determine current day of week (Monday through Saturday, default to Monday)
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const initialActiveDay = DAYS_OF_WEEK.includes(todayName) && todayName !== 'Sunday'
    ? todayName
    : 'Monday';

  const [activeDay, setActiveDay] = useState(initialActiveDay);
  const [viewMode, setViewMode] = useState('day'); // 'day' (Timeline) | 'weekly' (Master Grid)
  const [filterType, setFilterType] = useState('All'); // 'All', 'Theory', 'Lab', 'Elective'
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Compute total weekly classes
  const totalWeeklyClasses = Object.values(currentTimetable.schedule || {}).reduce(
    (acc, dayList) => acc + (dayList?.length || 0),
    0
  );

  const activeDayClasses = currentTimetable.schedule?.[activeDay] || [];

  const filteredDayClasses = activeDayClasses.filter((item) => {
    if (filterType === 'All') return true;
    if (filterType === 'Theory') return item.type.includes('Theory');
    if (filterType === 'Lab') return item.type.includes('Lab') || item.type.includes('Practical');
    if (filterType === 'Elective') return item.type.includes('Elective');
    return true;
  });

  // Next up class (first class of active day)
  const nextClass = activeDayClasses[0] || null;

  const handleExportICS = () => {
    // Generate clean iCalendar data
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CampusHub//Academic Timetable//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    Object.entries(currentTimetable.schedule || {}).forEach(([day, classes]) => {
      classes.forEach((cls) => {
        icsContent.push('BEGIN:VEVENT');
        icsContent.push(`SUMMARY:${cls.courseCode} - ${cls.title}`);
        icsContent.push(`DESCRIPTION:Instructor: ${cls.instructor} | Type: ${cls.type}`);
        icsContent.push(`LOCATION:${cls.room}`);
        icsContent.push(`RRULE:FREQ=WEEKLY;BYDAY=${day.slice(0, 2).toUpperCase()}`);
        icsContent.push('STATUS:CONFIRMED');
        icsContent.push('END:VEVENT');
      });
    });

    icsContent.push('END:VCALENDAR');

    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CampusHub_Timetable_Sem${selectedSem}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'success',
      title: 'Timetable Exported (.ics)',
      message: `Weekly schedule for ${currentTimetable.semester} downloaded for Apple/Google Calendar.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Weekly Academic Load */}
        <div className="p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-xs">
          <div className="flex items-center justify-between text-[#737373] text-[11px] font-bold uppercase tracking-wider">
            <span>Weekly Class Load</span>
            <span className="p-1 rounded bg-red-50 text-[#DC2626]">
              <Clock className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-[#171717] mt-1.5">
            {totalWeeklyClasses} Sessions
          </p>
          <span className="text-[11px] text-[#737373] mt-0.5 block">
            Approved syllabus timetable load
          </span>
        </div>

        {/* Selected Day Status */}
        <div className="p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-xs">
          <div className="flex items-center justify-between text-[#737373] text-[11px] font-bold uppercase tracking-wider">
            <span>{activeDay}'s Schedule</span>
            <span className="p-1 rounded bg-blue-50 text-blue-600">
              <Calendar className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-blue-600 mt-1.5">
            {activeDayClasses.length} Classes
          </p>
          <span className="text-[11px] text-[#737373] mt-0.5 block truncate">
            {activeDayClasses.length > 0 ? `${activeDayClasses[0].courseCode} at ${activeDayClasses[0].time}` : 'No sessions today'}
          </span>
        </div>

        {/* Classroom & Section */}
        <div className="p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-xs">
          <div className="flex items-center justify-between text-[#737373] text-[11px] font-bold uppercase tracking-wider">
            <span>Home Lecture Hall</span>
            <span className="p-1 rounded bg-emerald-50 text-emerald-600">
              <MapPin className="h-4 w-4" />
            </span>
          </div>
          <p className="text-sm font-black text-[#171717] mt-2 truncate font-mono">
            {currentTimetable.classroom || 'LH 301'}
          </p>
          <span className="text-[11px] text-[#737373] mt-0.5 block">
            {currentTimetable.section || 'CSE Section A'}
          </span>
        </div>

        {/* Attendance Rule Sync */}
        <div className="p-4 rounded-xl border border-[#E5E5E5] bg-white shadow-xs">
          <div className="flex items-center justify-between text-[#737373] text-[11px] font-bold uppercase tracking-wider">
            <span>Attendance Criteria</span>
            <span className="p-1 rounded bg-purple-50 text-purple-600">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-purple-700 mt-1.5">75% Min</p>
          <span className="text-[11px] text-emerald-700 font-semibold mt-0.5 block">
            Statutory Examination Cutoff
          </span>
        </div>
      </div>

      {/* 2. UPCOMING / NEXT CLASS HIGHLIGHT BANNER */}
      {nextClass && (
        <div className="p-4 sm:p-5 rounded-xl border border-red-200 bg-[#FEF2F2] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-white border border-red-200 text-[#DC2626] shrink-0 mt-0.5">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-[#991B1B]">
                  {activeDay} Schedule Highlight
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#DC2626] text-white">
                  Opening Session
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-[#171717] mt-0.5">
                {nextClass.courseCode}: {nextClass.title}
              </h4>
              <p className="text-xs text-[#525252] mt-0.5 flex items-center gap-3 flex-wrap">
                <span>Time: <strong>{nextClass.time}</strong></span>
                <span>•</span>
                <span>Room: <strong>{nextClass.room}</strong></span>
                <span>•</span>
                <span>Instructor: <strong>{nextClass.instructor}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportICS}
              className="gap-1.5 bg-white text-xs font-semibold cursor-pointer"
            >
              <Calendar className="h-3.5 w-3.5 text-[#DC2626]" />
              <span>Sync to Calendar</span>
            </Button>
          </div>
        </div>
      )}

      {/* 3. TIMETABLE CONTROLS & DAY SWITCHER */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E5E5E5]">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#171717] flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#DC2626]" />
              {currentTimetable.semester} Class Timetable & Timings
            </h2>
            <p className="text-xs text-[#737373] mt-0.5">
              Approved lecture slots, laboratory allocations, and instructor contact schedules
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Toggle: Day vs Master Grid */}
            <div className="flex items-center p-0.5 rounded-lg border border-[#E5E5E5] bg-neutral-50 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('day')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                  viewMode === 'day'
                    ? 'bg-white text-[#DC2626] shadow-xs'
                    : 'text-[#737373] hover:text-[#171717]'
                }`}
              >
                <List className="h-3.5 w-3.5" />
                <span>Day Timeline</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('weekly')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                  viewMode === 'weekly'
                    ? 'bg-white text-[#DC2626] shadow-xs'
                    : 'text-[#737373] hover:text-[#171717]'
                }`}
              >
                <Grid3X3 className="h-3.5 w-3.5" />
                <span>Master Weekly Grid</span>
              </button>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPrintModalOpen(true)}
              className="gap-1.5 cursor-pointer text-xs font-semibold"
            >
              <Printer className="h-3.5 w-3.5 text-[#DC2626]" />
              <span>Print Timetable</span>
            </Button>
          </div>
        </div>

        {/* Day Selector Buttons when in 'day' view */}
        {viewMode === 'day' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
                {DAYS_OF_WEEK.map((day) => {
                  const isDaySelected = activeDay === day;
                  const dayCount = currentTimetable.schedule?.[day]?.length || 0;
                  const isCurrentToday = todayName === day;

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setActiveDay(day)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap relative ${
                        isDaySelected
                          ? 'bg-white text-[#DC2626] shadow-xs'
                          : 'text-[#737373] hover:text-[#171717]'
                      }`}
                    >
                      <span>{day}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          isDaySelected
                            ? 'bg-[#FEF2F2] text-[#DC2626]'
                            : 'bg-neutral-200 text-[#525252]'
                        }`}
                      >
                        {dayCount}
                      </span>
                      {isCurrentToday && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute top-1.5 right-1.5" title="Today" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Type Filter Dropdown / Pills */}
              <div className="flex items-center gap-1 text-xs">
                {['All', 'Theory', 'Lab', 'Elective'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFilterType(t)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                      filterType === t
                        ? 'bg-[#DC2626] text-white font-bold'
                        : 'bg-neutral-100 text-[#737373] hover:bg-neutral-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Day Class List Timeline */}
            {filteredDayClasses.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#737373] border border-dashed border-[#E5E5E5] rounded-xl p-6">
                <Calendar className="h-8 w-8 text-[#A3A3A3] mx-auto mb-2 opacity-50" />
                <p className="font-semibold text-[#171717]">No classes scheduled for {activeDay}.</p>
                <p className="mt-1">Use the day buttons above to inspect schedules for other working weekdays.</p>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {filteredDayClasses.map((item, idx) => {
                  const isLab = item.type.includes('Lab') || item.type.includes('Practical');
                  const isElective = item.type.includes('Elective');

                  return (
                    <div
                      key={item.id}
                      className="p-4 sm:p-5 rounded-xl border border-[#E5E5E5] bg-white hover:border-[#DC2626]/40 transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Time Slot Block */}
                        <div className="w-32 shrink-0 p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 text-center">
                          <span className="text-[10px] font-bold text-[#737373] uppercase block">
                            Slot {idx + 1}
                          </span>
                          <span className="text-xs font-mono font-bold text-[#171717] block mt-0.5">
                            {item.time}
                          </span>
                          <span className="text-[10px] text-[#DC2626] font-semibold block mt-0.5">
                            {isLab ? '3 Periods' : '90 Mins'}
                          </span>
                        </div>

                        {/* Subject & Instructor Details */}
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] px-2 py-0.5 rounded">
                              {item.courseCode}
                            </span>
                            <h3 className="font-bold text-sm sm:text-base text-[#171717]">
                              {item.title}
                            </h3>
                            <Badge
                              variant={isLab ? 'success' : isElective ? 'warning' : 'primary'}
                              size="sm"
                              className="text-[10px]"
                            >
                              {item.type}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-[#737373] flex-wrap pt-0.5">
                            <span className="flex items-center gap-1.5 text-[#171717] font-medium">
                              <User className="h-3.5 w-3.5 text-[#737373]" /> {item.instructor}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-[#DC2626]" /> {item.room}
                            </span>
                            {item.batch && (
                              <span className="bg-neutral-100 px-2 py-0.5 rounded font-mono text-[11px] text-[#525252]">
                                {item.batch}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Action: Syllabus Shortcut */}
                      <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
                        {onSwitchToCurriculum && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={onSwitchToCurriculum}
                            className="text-[11px] py-1.5 px-3 cursor-pointer"
                          >
                            <BookOpen className="h-3.5 w-3.5 text-[#737373]" />
                            <span>View Syllabus</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Master Weekly Grid View (All Days Columns / Table) */}
        {viewMode === 'weekly' && (
          <div className="space-y-3 pt-2">
            <div className="overflow-x-auto rounded-xl border border-[#E5E5E5]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#FAFAFA] border-b border-[#E5E5E5] text-[11px] font-bold text-[#737373] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3 w-28 border-r border-[#E5E5E5]">Day / Weekday</th>
                    <th className="py-3 px-4">Period 1 & 2 (09:00 - 11:00 AM)</th>
                    <th className="py-3 px-2 w-12 text-center bg-neutral-100 text-[10px] font-mono border-x border-[#E5E5E5]">Tea</th>
                    <th className="py-3 px-4">Period 3 & 4 (11:15 AM - 01:15 PM)</th>
                    <th className="py-3 px-2 w-14 text-center bg-neutral-100 text-[10px] font-mono border-x border-[#E5E5E5]">Lunch</th>
                    <th className="py-3 px-4">Period 5 & 6 (02:00 - 05:00 PM)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {DAYS_OF_WEEK.map((day) => {
                    const dayClasses = currentTimetable.schedule?.[day] || [];
                    const morningSlot1 = dayClasses.find((c) => c.time.includes('09:') || c.time.includes('10:'));
                    const morningSlot2 = dayClasses.find((c) => c.time.includes('11:') || c.time.includes('12:'));
                    const afternoonSlot = dayClasses.find((c) => c.time.includes('02:') || c.time.includes('03:'));

                    return (
                      <tr key={day} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-3.5 px-3 font-bold text-[#171717] border-r border-[#E5E5E5] bg-[#FAFAFA]">
                          <span className="block">{day}</span>
                          <span className="text-[10px] text-[#737373] font-normal">{dayClasses.length} sessions</span>
                        </td>

                        {/* Morning Slot 1 */}
                        <td className="py-3 px-3 align-top">
                          {morningSlot1 ? (
                            <div className="p-2.5 rounded-lg border border-neutral-200 bg-white shadow-2xs space-y-1">
                              <span className="font-mono text-[11px] font-bold text-[#DC2626] block">
                                {morningSlot1.courseCode}
                              </span>
                              <p className="font-semibold text-xs text-[#171717] leading-tight">
                                {morningSlot1.title}
                              </p>
                              <span className="text-[10px] text-[#737373] block">
                                {morningSlot1.room} • {morningSlot1.time}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-[#A3A3A3] italic">Free Period / Self Study</span>
                          )}
                        </td>

                        {/* Tea Break Column */}
                        <td className="py-3 px-1 text-center bg-neutral-50 text-[10px] text-[#737373] border-x border-[#E5E5E5] writing-mode-vertical">
                          11:00 AM
                        </td>

                        {/* Morning Slot 2 */}
                        <td className="py-3 px-3 align-top">
                          {morningSlot2 ? (
                            <div className="p-2.5 rounded-lg border border-neutral-200 bg-white shadow-2xs space-y-1">
                              <span className="font-mono text-[11px] font-bold text-[#DC2626] block">
                                {morningSlot2.courseCode}
                              </span>
                              <p className="font-semibold text-xs text-[#171717] leading-tight">
                                {morningSlot2.title}
                              </p>
                              <span className="text-[10px] text-[#737373] block">
                                {morningSlot2.room} • {morningSlot2.time}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-[#A3A3A3] italic">No scheduled class</span>
                          )}
                        </td>

                        {/* Lunch Column */}
                        <td className="py-3 px-1 text-center bg-neutral-50 text-[10px] text-[#737373] border-x border-[#E5E5E5]">
                          Lunch
                        </td>

                        {/* Afternoon Slot */}
                        <td className="py-3 px-3 align-top">
                          {afternoonSlot ? (
                            <div className="p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/40 shadow-2xs space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-[11px] font-bold text-emerald-800">
                                  {afternoonSlot.courseCode}
                                </span>
                                <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                                  {afternoonSlot.type}
                                </span>
                              </div>
                              <p className="font-semibold text-xs text-[#171717] leading-tight">
                                {afternoonSlot.title}
                              </p>
                              <span className="text-[10px] text-[#737373] block">
                                {afternoonSlot.room} • {afternoonSlot.time}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-[#A3A3A3] italic">Library / Project Work</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: PRINTABLE OFFICIAL SEMESTER TIMETABLE                              */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Official Department Class Timetable"
        description="Certified semester class routine issued by the Academic Dean & Head of Department"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPrintModalOpen(false)}
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
              <span>Print Official Routine</span>
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
              Department of Computer Science & Engineering • Academic Routine
            </p>
            <p className="text-[10px] text-[#DC2626] font-bold">
              OFFICIAL CLASS TIMETABLE • {currentTimetable.semester} ({currentTimetable.academicYear})
            </p>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 text-xs">
            <div>
              <span className="text-[10px] text-[#737373] block uppercase">Section:</span>
              <strong className="text-[#171717]">{currentTimetable.section}</strong>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#737373] block uppercase">Lecture Hall:</span>
              <strong className="font-mono text-[#DC2626]">{currentTimetable.classroom}</strong>
            </div>
            <div>
              <span className="text-[10px] text-[#737373] block uppercase">Batch Coordinator:</span>
              <span className="text-[#525252]">{currentTimetable.coordinator || 'Dr. Arvind Patel'}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#737373] block uppercase">Student:</span>
              <strong className="text-[#171717]">{user?.name || 'Sayan Mukherjee'}</strong>
            </div>
          </div>

          {/* Daily Table Summary */}
          <div className="space-y-2">
            {DAYS_OF_WEEK.map((d) => {
              const list = currentTimetable.schedule?.[d] || [];
              if (list.length === 0) return null;

              return (
                <div key={d} className="p-2.5 rounded-lg border border-neutral-200">
                  <span className="font-bold text-xs text-[#DC2626] block mb-1">{d}</span>
                  <div className="divide-y divide-neutral-100">
                    {list.map((c) => (
                      <div key={c.id} className="py-1 flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-[#171717]">
                          {c.time}: {c.courseCode} - {c.title}
                        </span>
                        <span className="text-[#737373] text-[11px]">{c.room} ({c.instructor})</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Signature */}
          <div className="flex items-center justify-between pt-3 border-t border-neutral-200 text-[10px] text-[#737373]">
            <span>Authenticated by Dean of Academic Affairs</span>
            <span className="font-bold text-[#171717]">Head, Dept of Computer Science & Eng.</span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
