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
 * فحص ما إذا كان اليوم عطلة أسبوعية في فلسطين (الجمعة أو السبت)
 * JS getDay(): 0 = الأحد, 1 = الإثنين, 2 = الثلاثاء, 3 = الأربعاء, 4 = الخميس, 5 = الجمعة, 6 = السبت
 */
export function isWeekendDay(date: Date): boolean {
  const day = date.getDay();
  return day === 5 || day === 6; // Friday (5) or Saturday (6)
}

/**
 * البحث عن إجازة رسمية في تاريخ معين
 */
export function getHolidayForDate(
  dateStr: string,
  holidays: MinistryHoliday[] = PALESTINIAN_MINISTRY_HOLIDAYS
): MinistryHoliday | null {
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);

  for (const h of holidays) {
    const start = new Date(h.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(h.endDate);
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
  const d = typeof dateInput === 'string' ? new Date(dateInput) : new Date(dateInput);
  const dateStr = d.toISOString().split('T')[0];
  const dayIndex = d.getDay();
  const dayNameArabic = ARABIC_DAY_NAMES[dayIndex];
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
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return {
      startDate: startDateStr,
      endDate: endDateStr,
      totalCalendarDays: 0,
      weekendDaysCount: 0,
      holidayDaysCount: 0,
      netTeachingDays: 0,
      netTeachingWeeks: 0,
      holidaysEncountered: [],
      weeklyBreakdown: [],
    };
  }

  let curr = new Date(start);
  curr.setHours(0, 0, 0, 0);
  const last = new Date(end);
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
  let currentWeekStart = new Date(curr);
  let currentWeekTeachingCount = 0;
  let currentWeekHolidays: string[] = [];

  while (curr <= last) {
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
    if (curr.getDay() === 4 || curr.getTime() === last.getTime()) {
      weeklyBreakdown.push({
        weekIndex: currentWeekNum,
        weekStartDate: currentWeekStart.toISOString().split('T')[0],
        weekEndDate: curr.toISOString().split('T')[0],
        teachingDaysInWeek: currentWeekTeachingCount,
        holidaysInWeek: [...currentWeekHolidays],
      });

      // Prepare next week
      currentWeekNum++;
      const nextDay = new Date(curr);
      nextDay.setDate(nextDay.getDate() + 1);
      // Skip Friday (5) and Saturday (6) to land on Sunday (0)
      while (nextDay.getDay() === 5 || nextDay.getDay() === 6) {
        nextDay.setDate(nextDay.getDate() + 1);
      }
      currentWeekStart = new Date(nextDay);
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
    startDate: startDateStr,
    endDate: endDateStr,
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
  startDateStr: string,
  daysNeeded: number,
  holidays: MinistryHoliday[] = PALESTINIAN_MINISTRY_HOLIDAYS
): {
  startDate: string;
  endDate: string;
  teachingDates: string[];
  holidaysPassed: string[];
} {
  let curr = new Date(startDateStr);
  curr.setHours(0, 0, 0, 0);

  const teachingDates: string[] = [];
  const holidaysPassedSet = new Set<string>();

  while (teachingDates.length < daysNeeded) {
    const status = checkDayStatus(curr, holidays);
    if (status.isTeaching) {
      teachingDates.push(status.dateStr);
    } else if (status.holidayName) {
      holidaysPassedSet.add(status.holidayName);
    }
    curr.setDate(curr.getDate() + 1);
  }

  return {
    startDate: teachingDates[0] || startDateStr,
    endDate: teachingDates[teachingDates.length - 1] || startDateStr,
    teachingDates,
    holidaysPassed: Array.from(holidaysPassedSet),
  };
}
