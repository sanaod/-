export interface MinistryHoliday {
  id: string;
  name: string;
  type: 'national' | 'religious' | 'school_vacation' | 'emergency';
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  notes?: string;
}

/**
 * قائمة الإجازات الرسمية والعطل المدرسية المعتمدة لدى وزارة التربية والتعليم الفلسطينية
 * (تغطي العام الدراسي وإجازات المناسبات الدينية والوطنية)
 */
export const PALESTINIAN_MINISTRY_HOLIDAYS: MinistryHoliday[] = [
  {
    id: 'h-hijri-new-year',
    name: 'رأس السنة الهجرية 1448هـ',
    type: 'religious',
    startDate: '2026-06-16',
    endDate: '2026-06-16',
    notes: 'إجازة رسمية معتمدة من وزارة التربية والتعليم',
  },
  {
    id: 'h-prophet-birthday',
    name: 'ذكرى المولد النبوي الشريف',
    type: 'religious',
    startDate: '2026-08-25',
    endDate: '2026-08-25',
    notes: 'إجازة دينية رسمية',
  },
  {
    id: 'h-independence-day',
    name: 'يوم إعلان الاستقلال الفلسطيني',
    type: 'national',
    startDate: '2026-11-15',
    endDate: '2026-11-15',
    notes: 'عطلة وطنية رسمية في جميع المدارس والمؤسسات التعليمية',
  },
  {
    id: 'h-western-christmas',
    name: 'عيد الميلاد المجيد (التقويم الغربي)',
    type: 'religious',
    startDate: '2026-12-25',
    endDate: '2026-12-25',
    notes: 'إجازة رسمية للمدارس',
  },
  {
    id: 'h-new-year-revolution',
    name: 'رأس السنة الميلادية وانطلاقة الثورة',
    type: 'national',
    startDate: '2027-01-01',
    endDate: '2027-01-01',
    notes: 'عطلة رسمية بالمدارس',
  },
  {
    id: 'h-eastern-christmas',
    name: 'عيد الميلاد المجيد (التقويم الشرقي)',
    type: 'religious',
    startDate: '2027-01-07',
    endDate: '2027-01-07',
    notes: 'إجازة رسمية للمدارس',
  },
  {
    id: 'h-midyear-break',
    name: 'عطلة منتصف العام الدراسي (بين الفصلين)',
    type: 'school_vacation',
    startDate: '2027-01-16',
    endDate: '2027-01-28',
    notes: 'عطلة الشتاء والتقييم بين الفصلين لوزارة التربية والتعليم',
  },
  {
    id: 'h-isra-miraj',
    name: 'ذكرى الإسراء والمعراج',
    type: 'religious',
    startDate: '2027-02-04',
    endDate: '2027-02-04',
    notes: 'إجازة رسمية في المدارس',
  },
  {
    id: 'h-eid-al-fitr',
    name: 'عيد الفطر المبارك',
    type: 'religious',
    startDate: '2027-03-09',
    endDate: '2027-03-12',
    notes: 'إجازة رسمية معتمدة (4 أيام)',
  },
  {
    id: 'h-land-day',
    name: 'يوم الأرض الخالد',
    type: 'national',
    startDate: '2027-03-30',
    endDate: '2027-03-30',
    notes: 'مناسبة وطنية وإجازة بالمدارس',
  },
  {
    id: 'h-labor-day',
    name: 'يوم العمال العالمي',
    type: 'national',
    startDate: '2027-05-01',
    endDate: '2027-05-01',
    notes: 'إجازة رسمية',
  },
  {
    id: 'h-eid-al-adha',
    name: 'وقفة عرفة وعيد الأضحى المبارك',
    type: 'religious',
    startDate: '2027-05-16',
    endDate: '2027-05-20',
    notes: 'إجازة رسمية معتمدة (5 أيام)',
  },
];

/**
 * دالة آمنة لتحليل وتنظيف أي تاريخ أو نص مهما كانت صيغته بدون التسبب في أي انهيار
 */
export function parseDateSafely(input?: any): Date {
  if (!input) return new Date();
  if (input instanceof Date && !isNaN(input.getTime())) return new Date(input.getTime());

  if (typeof input === 'string') {
    // استبدال الأرقام المشرقية بالأرقام القياسية
    const arabicToWestern: Record<string, string> = {
      '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
      '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
    };
    let clean = input.replace(/[٠-٩]/g, (d) => arabicToWestern[d] || d);
    // إزالة علامات المحاذاة الخفية وحرف م أو هـ
    clean = clean.replace(/[\u200E\u200F\u202A-\u202E\u061C]/g, '').replace(/[مهـ]/g, '').trim();

    // فحص YYYY-MM-DD
    const isoMatch = clean.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
    if (isoMatch) {
      const year = parseInt(isoMatch[1], 10);
      const month = parseInt(isoMatch[2], 10) - 1;
      const day = parseInt(isoMatch[3], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) return d;
    }

    // فحص DD/MM/YYYY أو DD-MM-YYYY
    const dmyMatch = clean.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
    if (dmyMatch) {
      const day = parseInt(dmyMatch[1], 10);
      const month = parseInt(dmyMatch[2], 10) - 1;
      const year = parseInt(dmyMatch[3], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) return d;
    }

    const standardParsed = new Date(clean);
    if (!isNaN(standardParsed.getTime())) {
      return standardParsed;
    }
  }

  return new Date();
}

/**
 * تحويل آمن لأي تاريخ لصيغة YYYY-MM-DD
 */
export function formatDateToIso(input?: any): string {
  const d = parseDateSafely(input);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * فحص ما إذا كان اليوم عطلة أسبوعية في فلسطين (الجمعة أو السبت)
 * JS getDay(): 0 = الأحد, 1 = الإثنين, 2 = الثلاثاء, 3 = الأربعاء, 4 = الخميس, 5 = الجمعة, 6 = السبت
 */
export function isWeekendDay(date: Date): boolean {
  if (!date || isNaN(date.getTime())) return false;
  const day = date.getDay();
  return day === 5 || day === 6; // Friday (5) or Saturday (6)
}

/**
 * Convenience helper to check if a date string or Date is a weekend (Friday or Saturday)
 */
export function isWeekend(dateInput: Date | string): boolean {
  const d = parseDateSafely(dateInput);
  return isWeekendDay(d);
}

/**
 * Convenience helper to check if a date string has an official holiday
 */
export function isHoliday(
  dateStr: string,
  holidays: MinistryHoliday[] = PALESTINIAN_MINISTRY_HOLIDAYS
): MinistryHoliday | null {
  return getHolidayForDate(dateStr, holidays);
}

/**
 * البحث عن إجازة رسمية في تاريخ معين
 */
export function getHolidayForDate(
  dateStr: string,
  holidays: MinistryHoliday[] = PALESTINIAN_MINISTRY_HOLIDAYS
): MinistryHoliday | null {
  const target = parseDateSafely(dateStr);
  target.setHours(0, 0, 0, 0);

  for (const h of holidays) {
    const start = parseDateSafely(h.startDate);
    start.setHours(0, 0, 0, 0);
    const end = parseDateSafely(h.endDate);
    end.setHours(23, 59, 59, 999);

    if (target >= start && target <= end) {
      return h;
    }
  }
  return null;
}

export interface DayStatus {
  dateStr: string;
  isTeaching: boolean;
  dayNameArabic: string;
  isWeekend: boolean;
  holidayName?: string;
  notes?: string;
}

const ARABIC_DAY_NAMES = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

/**
 * فحص حالة يوم معين (تدريس أم عطلة أسبوعية أم إجازة رسمية)
 */
export function checkDayStatus(
  dateInput: Date | string,
  holidays: MinistryHoliday[] = PALESTINIAN_MINISTRY_HOLIDAYS
): DayStatus {
  const d = parseDateSafely(dateInput);
  const dateStr = formatDateToIso(d);
  const dayIndex = d.getDay();
  const dayNameArabic = ARABIC_DAY_NAMES[dayIndex] || 'الأحد';
  const weekend = isWeekendDay(d);
  const holiday = getHolidayForDate(dateStr, holidays);

  if (weekend) {
    return {
      dateStr,
      isTeaching: false,
      dayNameArabic,
      isWeekend: true,
      notes: 'عطلة أسبوعية (الجمعة والسبت)',
    };
  }

  if (holiday) {
    return {
      dateStr,
      isTeaching: false,
      dayNameArabic,
      isWeekend: false,
      holidayName: holiday.name,
      notes: `إجازة رسمية: ${holiday.name}`,
    };
  }

  return {
    dateStr,
    isTeaching: true,
    dayNameArabic,
    isWeekend: false,
  };
}

export interface TeachingCalendarAnalysis {
  startDate: string;
  endDate: string;
  totalCalendarDays: number;
  weekendDaysCount: number;
  holidayDaysCount: number;
  netTeachingDays: number;
  netTeachingWeeks: number;
  holidaysEncountered: { name: string; dateRange: string }[];
  weeklyBreakdown: {
    weekIndex: number;
    weekStartDate: string;
    weekEndDate: string;
    teachingDaysInWeek: number;
    holidaysInWeek: string[];
  }[];
}

/**
 * حساب أيام وأسابيع التدريس الفعلية بين تاريخين مع استبعاد الجمعة والسبت والإجازات الرسمية
 */
export function analyzeTeachingCalendar(
  startDateStr: string,
  endDateStr: string,
  holidays: MinistryHoliday[] = PALESTINIAN_MINISTRY_HOLIDAYS
): TeachingCalendarAnalysis {
  const start = parseDateSafely(startDateStr);
  const end = parseDateSafely(endDateStr);

  const startIso = formatDateToIso(start);
  const endIso = formatDateToIso(end);

  if (start > end) {
    return {
      startDate: startIso,
      endDate: endIso,
      totalCalendarDays: 1,
      weekendDaysCount: 0,
      holidayDaysCount: 0,
      netTeachingDays: 1,
      netTeachingWeeks: 0.2,
      holidaysEncountered: [],
      weeklyBreakdown: [],
    };
  }

  let curr = new Date(start.getTime());
  curr.setHours(0, 0, 0, 0);
  const last = new Date(end.getTime());
  last.setHours(0, 0, 0, 0);

  let totalDays = 0;
  let weekendDays = 0;
  let holidayDays = 0;
  let teachingDays = 0;

  const holidaysEncounteredMap = new Map<string, string[]>();
  const weeklyBreakdown: {
    weekIndex: number;
    weekStartDate: string;
    weekEndDate: string;
    teachingDaysInWeek: number;
    holidaysInWeek: string[];
  }[] = [];

  let currentWeekNum = 1;
  let currentWeekStart = new Date(curr.getTime());
  let currentWeekTeachingCount = 0;
  let currentWeekHolidays: string[] = [];

  let safetyCounter = 0;
  while (curr <= last && safetyCounter < 150) {
    safetyCounter++;
    totalDays++;
    const status = checkDayStatus(curr, holidays);

    if (status.isWeekend) {
      weekendDays++;
    } else if (status.holidayName) {
      holidayDays++;
      if (!currentWeekHolidays.includes(status.holidayName)) {
        currentWeekHolidays.push(status.holidayName);
      }
      if (!holidaysEncounteredMap.has(status.holidayName)) {
        holidaysEncounteredMap.set(status.holidayName, []);
      }
      holidaysEncounteredMap.get(status.holidayName)!.push(status.dateStr);
    } else {
      teachingDays++;
      currentWeekTeachingCount++;
    }

    // Check if end of week (Thursday = 4) or last day of range
    if (curr.getDay() === 4 || curr.getTime() >= last.getTime()) {
      weeklyBreakdown.push({
        weekIndex: currentWeekNum,
        weekStartDate: formatDateToIso(currentWeekStart),
        weekEndDate: formatDateToIso(curr),
        teachingDaysInWeek: currentWeekTeachingCount,
        holidaysInWeek: [...currentWeekHolidays],
      });

      // Prepare next week
      currentWeekNum++;
      const nextDay = new Date(curr.getTime());
      nextDay.setDate(nextDay.getDate() + 1);
      // Skip Friday (5) and Saturday (6) to land on Sunday (0)
      while (nextDay.getDay() === 5 || nextDay.getDay() === 6) {
        nextDay.setDate(nextDay.getDate() + 1);
      }
      currentWeekStart = new Date(nextDay.getTime());
      currentWeekTeachingCount = 0;
      currentWeekHolidays = [];
    }

    curr.setDate(curr.getDate() + 1);
  }

  const holidaysEncountered = Array.from(holidaysEncounteredMap.entries()).map(([name, dates]) => {
    const first = dates[0];
    const final = dates[dates.length - 1];
    const range = first === final ? first : `${first} إلى ${final}`;
    return { name, dateRange: range };
  });

  const netTeachingWeeks = Math.round((teachingDays / 5) * 10) / 10;

  return {
    startDate: startIso,
    endDate: endIso,
    totalCalendarDays: totalDays,
    weekendDaysCount: weekendDays,
    holidayDaysCount: holidayDays,
    netTeachingDays: teachingDays,
    netTeachingWeeks,
    holidaysEncountered,
    weeklyBreakdown,
  };
}

/**
 * الحصول على الأيام التعليمية المتاحة متتالية بدون الجمعة والسبت والإجازات
 */
export function getNextTeachingDays(
  startDateStr?: string | Date | null,
  daysNeeded: number = 2,
  holidays: MinistryHoliday[] = PALESTINIAN_MINISTRY_HOLIDAYS
): {
  startDate: string;
  endDate: string;
  teachingDates: string[];
  holidaysPassed: string[];
} {
  const safeStart = parseDateSafely(startDateStr);
  let curr = new Date(safeStart.getTime());
  curr.setHours(0, 0, 0, 0);

  const needed = Math.max(1, Math.min(Number(daysNeeded) || 1, 60));
  const teachingDates: string[] = [];
  const holidaysPassedSet = new Set<string>();

  let safetyCounter = 0;
  while (teachingDates.length < needed && safetyCounter < 100) {
    safetyCounter++;
    const status = checkDayStatus(curr, holidays);
    if (status.isTeaching) {
      teachingDates.push(status.dateStr);
    } else if (status.holidayName) {
      holidaysPassedSet.add(status.holidayName);
    }
    curr.setDate(curr.getDate() + 1);
  }

  const startIso = teachingDates[0] || formatDateToIso(safeStart);
  const endIso = teachingDates[teachingDates.length - 1] || startIso;

  return {
    startDate: startIso,
    endDate: endIso,
    teachingDates,
    holidaysPassed: Array.from(holidaysPassedSet),
  };
}
