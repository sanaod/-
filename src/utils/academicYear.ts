import { toArabicDigits } from './arabicNumerals';

export interface AcademicYearInfo {
  startYear: number;
  endYear: number;
  academicYearFormatted: string; // e.g., "٢٠٢٦ / ٢٠٢٧م"
  academicYearNumeric: string; // e.g., "2026 / 2027"
  semesterName: string; // e.g., "الفصل الدراسي الأول" or "الفصل الدراسي الثاني"
}

/**
 * Calculates the current or specified academic year automatically based on standard school calendar rules.
 * Academic year rollover happens in August (Month 8).
 * - Months 8-12 (Aug - Dec) of Year Y => Academic Year: Y / Y+1 (e.g. 2026/2027)
 * - Months 1-7 (Jan - Jul) of Year Y => Academic Year: Y-1 / Y (e.g. 2025/2026)
 */
export function getAcademicYearInfo(dateInput?: Date | string | null): AcademicYearInfo {
  let date: Date;

  if (!dateInput) {
    date = new Date();
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    const parsed = new Date(dateInput);
    date = isNaN(parsed.getTime()) ? new Date() : parsed;
  }

  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed: 0 = Jan, 7 = Aug, 11 = Dec

  let startYear: number;
  let endYear: number;
  let semesterName: string;

  // School year rollover starts in August (month 7 in 0-indexed JS Date)
  if (month >= 7) {
    startYear = year;
    endYear = year + 1;
    // Aug - Jan is Semester 1
    semesterName = 'الفصل الدراسي الأول';
  } else {
    startYear = year - 1;
    endYear = year;
    // Feb - Jun is Semester 2 (Jul is prep / summer)
    if (month >= 1 && month <= 5) {
      semesterName = 'الفصل الدراسي الثاني';
    } else if (month === 0) {
      semesterName = 'الفصل الدراسي الأول'; // January is end of Semester 1
    } else {
      semesterName = 'الفصل الصيفي / التخطيط للعام الجديد';
    }
  }

  const startArabic = toArabicDigits(startYear);
  const endArabic = toArabicDigits(endYear);

  return {
    startYear,
    endYear,
    academicYearFormatted: `${startArabic} / ${endArabic}م`,
    academicYearNumeric: `${startYear} / ${endYear}`,
    semesterName,
  };
}

/**
 * Returns auto-calculated academic year string (e.g., "٢٠٢٦ / ٢٠٢٧م").
 */
export function getCurrentAcademicYear(dateInput?: Date | string | null): string {
  return getAcademicYearInfo(dateInput).academicYearFormatted;
}

/**
 * Returns auto-calculated semester name (e.g., "الفصل الدراسي الأول").
 */
export function getCurrentSemesterName(dateInput?: Date | string | null): string {
  return getAcademicYearInfo(dateInput).semesterName;
}
