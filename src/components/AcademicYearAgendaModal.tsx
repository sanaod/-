import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  CalendarDays,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
  Flag,
  ArrowRight,
  School,
  Check,
} from 'lucide-react';
import {
  PALESTINIAN_MINISTRY_HOLIDAYS,
  MinistryHoliday,
  formatDateToIso,
  parseDateSafely,
  isWeekendDay,
  getHolidayForDate,
  getNextTeachingDays,
} from '../utils/palestinianCalendar';
import { getAcademicYearInfo, getCurrentSemesterName } from '../utils/academicYear';
import { formatDateDMY, toArabicDigits } from '../utils/arabicNumerals';

export interface AcademicYearAgendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTargetField?: 'start' | 'end';
  currentStartDate?: string;
  currentEndDate?: string;
  totalPeriods?: number;
  onSelectDate: (target: 'start' | 'end', isoDate: string) => void;
  onSelectRange?: (startIso: string, endIso: string) => void;
}

const MONTH_NAMES_ARABIC = [
  'كانون الثاني (يناير)',
  'شباط (فبراير)',
  'آذار (مارس)',
  'نيسان (أبريل)',
  'أيار (مايو)',
  'حزيران (يونيو)',
  'تموز (يوليو)',
  'آب (أغسطس)',
  'أيلول (سبتمبر)',
  'تشرين الأول (أكتوبر)',
  'تشرين الثاني (نوفمبر)',
  'كانون الأول (ديسمبر)',
];

const WEEKDAY_NAMES_ARABIC = [
  { short: 'أحد', full: 'الأحد', weekend: false },
  { short: 'إثنين', full: 'الإثنين', weekend: false },
  { short: 'ثلاثاء', full: 'الثلاثاء', weekend: false },
  { short: 'أربعاء', full: 'الأربعاء', weekend: false },
  { short: 'خميس', full: 'الخميس', weekend: false },
  { short: 'جمعة', full: 'الجمعة', weekend: true },
  { short: 'سبت', full: 'السبت', weekend: true },
];

export const AcademicYearAgendaModal: React.FC<AcademicYearAgendaModalProps> = ({
  isOpen,
  onClose,
  initialTargetField = 'start',
  currentStartDate = '',
  currentEndDate = '',
  totalPeriods = 2,
  onSelectDate,
  onSelectRange,
}) => {
  const [targetField, setTargetField] = useState<'start' | 'end'>(initialTargetField);
  const [activeTab, setActiveTab] = useState<'calendar' | 'milestones'>('calendar');

  // Academic year info for reference
  const now = new Date();
  const academicInfo = useMemo(() => getAcademicYearInfo(now), []);

  // Determine starting month based on currentStartDate or now
  const parsedInitialDate = useMemo(() => {
    const targetDateStr = targetField === 'start' ? currentStartDate : currentEndDate;
    if (targetDateStr) {
      const d = parseDateSafely(targetDateStr);
      if (!isNaN(d.getTime())) return d;
    }
    return now;
  }, [targetField, currentStartDate, currentEndDate]);

  const [currentYear, setCurrentYear] = useState<number>(() => parsedInitialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(() => parsedInitialDate.getMonth()); // 0-11

  // Start & End ISO for highlighting
  const currentStartIso = useMemo(() => {
    if (!currentStartDate) return '';
    try {
      return formatDateToIso(currentStartDate);
    } catch {
      return '';
    }
  }, [currentStartDate]);

  const currentEndIso = useMemo(() => {
    if (!currentEndDate) return '';
    try {
      return formatDateToIso(currentEndDate);
    } catch {
      return '';
    }
  }, [currentEndDate]);

  if (!isOpen) return null;

  // Calendar calculations
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday

  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
  const leadingDays = Array.from({ length: firstDayOfWeek }, (_, i) => ({
    dayNumber: prevMonthDays - firstDayOfWeek + 1 + i,
    isCurrentMonth: false,
    date: new Date(currentYear, currentMonth - 1, prevMonthDays - firstDayOfWeek + 1 + i),
  }));

  const monthDays = Array.from({ length: daysInMonth }, (_, i) => ({
    dayNumber: i + 1,
    isCurrentMonth: true,
    date: new Date(currentYear, currentMonth, i + 1),
  }));

  const totalGridCount = Math.ceil((leadingDays.length + monthDays.length) / 7) * 7;
  const trailingCount = totalGridCount - (leadingDays.length + monthDays.length);
  const trailingDays = Array.from({ length: trailingCount }, (_, i) => ({
    dayNumber: i + 1,
    isCurrentMonth: false,
    date: new Date(currentYear, currentMonth + 1, i + 1),
  }));

  const allCalendarDays = [...leadingDays, ...monthDays, ...trailingDays];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  const handleJumpToSemester = (sem: 1 | 2) => {
    if (sem === 1) {
      // Semester 1 starts in September (month 8)
      setCurrentMonth(8);
      setCurrentYear(academicInfo.startYear);
    } else {
      // Semester 2 starts in February (month 1)
      setCurrentMonth(1);
      setCurrentYear(academicInfo.endYear);
    }
  };

  const handleDayClick = (date: Date) => {
    const iso = formatDateToIso(date);
    onSelectDate(targetField, iso);
  };

  const handleApplyFullRangeFromDate = (startDate: Date) => {
    const startIso = formatDateToIso(startDate);
    const periods = Math.max(1, totalPeriods);
    const nextTeaching = getNextTeachingDays(startIso, periods, PALESTINIAN_MINISTRY_HOLIDAYS);
    if (onSelectRange) {
      onSelectRange(startIso, nextTeaching.endDate);
    } else {
      onSelectDate('start', startIso);
      onSelectDate('end', nextTeaching.endDate);
    }
  };

  const todayIso = formatDateToIso(now);

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto font-['Cairo',sans-serif]"
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full border border-emerald-200 overflow-hidden my-auto flex flex-col max-h-[95vh] animate-in fade-in duration-200">
        {/* Modal Header */}
        <div className="bg-linear-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-500/30 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-inner">
              <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-wide">
                  أجندة العام الدراسي (التقويم المدرسي المعتمد)
                </h3>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  🇵🇸 التقويم الوزاري
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                تحديد وضبط التواريخ في خانتي (من) و(إلى) وفق التقويم المدرسي المعتمد والعطل الرسمية لعام{' '}
                <span className="font-bold text-amber-300">{academicInfo.academicYearFormatted}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-emerald-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              title="إغلاق الأجندة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Target Field Switcher & Quick Navigation Bar */}
        <div className="bg-emerald-50/90 border-b border-emerald-200 p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Target Field Radio Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-emerald-950 shrink-0">
              📌 تغيير التاريخ في:
            </span>
            <div className="inline-flex bg-white p-1 rounded-xl border border-emerald-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setTargetField('start')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  targetField === 'start'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-slate-700 hover:bg-emerald-50'
                }`}
              >
                <span>خانة البداية (من)</span>
                {currentStartDate && (
                  <span className="text-[10px] opacity-80 font-normal">({currentStartDate})</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setTargetField('end')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  targetField === 'end'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'text-slate-700 hover:bg-amber-50'
                }`}
              >
                <span>خانة النهاية (إلى)</span>
                {currentEndDate && (
                  <span className="text-[10px] opacity-80 font-normal">({currentEndDate})</span>
                )}
              </button>
            </div>
          </div>

          {/* Quick Academic Semester Jumpers */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={handleJumpToToday}
              className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <span>⚡ اليوم الحالي</span>
            </button>
            <button
              type="button"
              onClick={() => handleJumpToSemester(1)}
              className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              <span>الفصل الأول (أيلول)</span>
            </button>
            <button
              type="button"
              onClick={() => handleJumpToSemester(2)}
              className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              <span>الفصل الثاني (شباط)</span>
            </button>
            <div className="border-r border-emerald-300 h-6 mx-1 hidden sm:block" />
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'calendar' ? 'milestones' : 'calendar')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                activeTab === 'milestones'
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'bg-emerald-100/70 hover:bg-emerald-200 text-emerald-900'
              }`}
            >
              <Flag className="w-3 h-3" />
              <span>{activeTab === 'milestones' ? 'العودة للتقويم' : 'محطات وعطل الأجندة'}</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'calendar' ? (
            <>
              {/* Month Navigation Controls */}
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-slate-800 border border-slate-300 hover:border-emerald-400 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="الشهر التالي"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>الشهر التالي</span>
                </button>

                <div className="text-center">
                  <div className="text-base sm:text-lg font-black text-slate-900 font-['Tajawal']">
                    {MONTH_NAMES_ARABIC[currentMonth]} {toArabicDigits(currentYear)}م
                  </div>
                  <div className="text-[11px] font-bold text-emerald-700">
                    {getCurrentSemesterName(new Date(currentYear, currentMonth, 15))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-slate-800 border border-slate-300 hover:border-emerald-400 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="الشهر السابق"
                >
                  <span>الشهر السابق</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Month Calendar Grid */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                {/* Weekday headers */}
                <div className="grid grid-cols-7 bg-emerald-900 text-white text-center text-xs font-black py-2.5">
                  {WEEKDAY_NAMES_ARABIC.map((day, idx) => (
                    <div key={idx} className="flex flex-col items-center justify-center">
                      <span>{day.full}</span>
                      {day.weekend && (
                        <span className="text-[9px] text-amber-300 font-normal">عطلة</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Calendar Days Cells */}
                <div className="grid grid-cols-7 bg-slate-100 gap-px border-t border-slate-200">
                  {allCalendarDays.map((cell, idx) => {
                    const dayIso = formatDateToIso(cell.date);
                    const isWeekend = isWeekendDay(cell.date);
                    const holiday = getHolidayForDate(dayIso, PALESTINIAN_MINISTRY_HOLIDAYS);
                    const isToday = dayIso === todayIso;
                    const isStartDate = currentStartIso && dayIso === currentStartIso;
                    const isEndDate = currentEndIso && dayIso === currentEndIso;
                    const isInRange =
                      currentStartIso &&
                      currentEndIso &&
                      dayIso >= currentStartIso &&
                      dayIso <= currentEndIso;

                    let bgClass = 'bg-white';
                    if (!cell.isCurrentMonth) {
                      bgClass = 'bg-slate-50/60 opacity-40';
                    } else if (isStartDate) {
                      bgClass = 'bg-emerald-100 ring-2 ring-emerald-600 ring-inset';
                    } else if (isEndDate) {
                      bgClass = 'bg-amber-100 ring-2 ring-amber-600 ring-inset';
                    } else if (isInRange) {
                      bgClass = 'bg-emerald-50/90';
                    } else if (holiday) {
                      bgClass = 'bg-rose-50/80';
                    } else if (isWeekend) {
                      bgClass = 'bg-slate-50';
                    }

                    return (
                      <div
                        key={idx}
                        className={`min-h-[85px] sm:min-h-[95px] p-1.5 sm:p-2 transition-all flex flex-col justify-between relative group ${bgClass}`}
                      >
                        {/* Top row in cell: day number + badges */}
                        <div className="flex items-start justify-between">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${
                              isToday
                                ? 'bg-emerald-700 text-white shadow-2xs'
                                : cell.isCurrentMonth
                                ? isWeekend
                                  ? 'text-slate-400 font-bold'
                                  : 'text-slate-900 font-extrabold'
                                : 'text-slate-400'
                            }`}
                          >
                            {toArabicDigits(cell.dayNumber)}
                          </span>

                          <div className="flex flex-col items-end gap-0.5">
                            {isToday && (
                              <span className="text-[9px] bg-emerald-700 text-white px-1 rounded font-bold">
                                اليوم
                              </span>
                            )}
                            {isStartDate && (
                              <span className="text-[9px] bg-emerald-600 text-white px-1 rounded font-bold shadow-2xs">
                                من (البداية)
                              </span>
                            )}
                            {isEndDate && (
                              <span className="text-[9px] bg-amber-600 text-white px-1 rounded font-bold shadow-2xs">
                                إلى (النهاية)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Holiday notice */}
                        {holiday && cell.isCurrentMonth && (
                          <div
                            className="mt-1 px-1 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-200 line-clamp-1"
                            title={holiday.name + (holiday.notes ? ` - ${holiday.notes}` : '')}
                          >
                            🎉 {holiday.name}
                          </div>
                        )}

                        {/* Click Actions */}
                        <div className="mt-1 pt-1 border-t border-slate-100 flex items-center justify-between gap-1 opacity-90 group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => handleDayClick(cell.date)}
                            className={`w-full py-0.5 rounded text-[10px] font-black transition-all cursor-pointer ${
                              targetField === 'start'
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-amber-600 hover:bg-amber-700 text-white'
                            }`}
                            title={`تعيين هذا التاريخ لخانة ${
                              targetField === 'start' ? 'البداية (من)' : 'النهاية (إلى)'
                            }`}
                          >
                            اختيار {targetField === 'start' ? '(من)' : '(إلى)'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legend & Quick Range Helper */}
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-bold text-slate-700">دلالات الألوان في الأجندة:</span>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <span className="w-3 h-3 rounded bg-emerald-600 inline-block" />
                    <span>تاريخ البداية (من)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <span className="w-3 h-3 rounded bg-amber-600 inline-block" />
                    <span>تاريخ النهاية (إلى)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300 inline-block" />
                    <span>نطاق تدريس الدرس</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <span className="w-3 h-3 rounded bg-rose-200 border border-rose-300 inline-block" />
                    <span>عطلة رسمية وزارية</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyFullRangeFromDate(now)}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1 transition-all cursor-pointer"
                    title={`حساب التاريخين تلقائياً بدءاً من اليوم لـ ${totalPeriods} حصص فعلية`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>حساب نطاق الحصص تلقائياً ({totalPeriods} حصص)</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Milestones & Official Holidays View */
            <div className="space-y-3">
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  قائمة الإجازات الرسمية والعطل المعتمدة من وزارة التربية والتعليم للعام الدراسي. يمكنك
                  النقر على أي مناسبة لتحديد موعدها أو الانتقال إليه في الأجندة مباشرة:
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {PALESTINIAN_MINISTRY_HOLIDAYS.map((holiday) => {
                  const sDate = parseDateSafely(holiday.startDate);
                  const isCurrentTarget =
                    (targetField === 'start' && currentStartIso === holiday.startDate) ||
                    (targetField === 'end' && currentEndIso === holiday.startDate);

                  return (
                    <div
                      key={holiday.id}
                      className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                        isCurrentTarget
                          ? 'bg-emerald-50 border-emerald-500 shadow-2xs'
                          : 'bg-white border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900">{holiday.name}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              holiday.type === 'religious'
                                ? 'bg-amber-100 text-amber-900'
                                : holiday.type === 'school_vacation'
                                ? 'bg-indigo-100 text-indigo-900'
                                : 'bg-rose-100 text-rose-900'
                            }`}
                          >
                            {holiday.type === 'religious'
                              ? 'دينية'
                              : holiday.type === 'school_vacation'
                              ? 'عطلة بين الفصلين'
                              : 'وطنية'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2 font-medium">
                          <span>📅 {formatDateDMY(holiday.startDate)}</span>
                          {holiday.startDate !== holiday.endDate && (
                            <span>إلى {formatDateDMY(holiday.endDate)}</span>
                          )}
                        </div>
                        {holiday.notes && (
                          <div className="text-[10px] text-slate-400 mt-0.5">{holiday.notes}</div>
                        )}
                      </div>

                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectDate(targetField, holiday.startDate);
                            const d = parseDateSafely(holiday.startDate);
                            setCurrentYear(d.getFullYear());
                            setCurrentMonth(d.getMonth());
                            setActiveTab('calendar');
                          }}
                          className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                            targetField === 'start'
                              ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                              : 'bg-amber-600 hover:bg-amber-700 text-white'
                          }`}
                        >
                          تطبيق على ({targetField === 'start' ? 'من' : 'إلى'})
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const d = parseDateSafely(holiday.startDate);
                            setCurrentYear(d.getFullYear());
                            setCurrentMonth(d.getMonth());
                            setActiveTab('calendar');
                          }}
                          className="px-2 py-0.5 text-[10px] text-emerald-800 hover:underline cursor-pointer"
                        >
                          عرض بالتقويم ↗
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Summary of current values */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-slate-600">التاريخ الحالي المحدد:</span>
            <span className="px-2.5 py-1 bg-white border border-emerald-300 rounded-lg text-emerald-900 font-bold">
              من: {currentStartDate || 'غير محدد'}
            </span>
            <span className="px-2.5 py-1 bg-white border border-amber-300 rounded-lg text-amber-900 font-bold">
              إلى: {currentEndDate || 'غير محدد'}
            </span>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>تأكيد وإغلاق الأجندة</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
