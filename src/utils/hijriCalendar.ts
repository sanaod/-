/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { toArabicDigits } from './arabicNumerals';

export interface HijriDateInfo {
  day: number;
  monthNumber: number;
  monthName: string;
  year: number;
  formattedShort: string;
  formattedFull: string;
}

export const HIJRI_MONTH_NAMES_AR = [
  'محرم',
  'صفر',
  'ربيع الأول',
  'ربيع الثاني',
  'جمادى الأولى',
  'جمادى الآخرة',
  'رجب',
  'شعبان',
  'رمضان',
  'شوال',
  'ذو القعدة',
  'ذو الحجة',
];

/**
 * Converts a Gregorian Date into a Hijri date object with day, month name, year, and formatted string.
 * Uses Intl.DateTimeFormat with fallback arithmetic.
 */
export function getHijriDate(dateInput: Date | string): HijriDateInfo {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const safeDate = isNaN(d.getTime()) ? new Date() : d;

  try {
    const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });

    const parts = formatter.formatToParts(safeDate);
    let day = 1;
    let monthNumber = 1;
    let year = 1448;

    parts.forEach((p) => {
      if (p.type === 'day') day = parseInt(p.value.replace(/[^\d]/g, ''), 10) || 1;
      if (p.type === 'month') monthNumber = parseInt(p.value.replace(/[^\d]/g, ''), 10) || 1;
      if (p.type === 'year') year = parseInt(p.value.replace(/[^\d]/g, ''), 10) || 1448;
    });

    const monthName = HIJRI_MONTH_NAMES_AR[(monthNumber - 1) % 12] || 'ربيع الأول';
    const dayStr = toArabicDigits(day);
    const yearStr = toArabicDigits(year);

    return {
      day,
      monthNumber,
      monthName,
      year,
      formattedShort: `${dayStr} ${monthName}`,
      formattedFull: `${dayStr} ${monthName} ${yearStr}هـ`,
    };
  } catch (e) {
    // Fallback mathematical approximation if Intl islamic calendar is unavailable
    const julianDay = Math.floor((safeDate.getTime() / 86400000) + 2440587.5);
    const l = julianDay - 1948440 + 10632;
    const n = Math.floor((l - 1) / 10631);
    const l1 = l - 10631 * n + 354;
    const j = (Math.floor((10985 - l1) / 5316)) * (Math.floor((50 * l1) / 17719)) + (Math.floor(l1 / 5670)) * (Math.floor((43 * l1) / 15238));
    const l2 = l1 - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
    const monthNumber = Math.floor((24 * l2) / 709);
    const day = l2 - Math.floor((709 * monthNumber) / 24);
    const year = 30 * n + j - 30;

    const monthName = HIJRI_MONTH_NAMES_AR[(monthNumber - 1) % 12] || 'ربيع الأول';
    const dayStr = toArabicDigits(day);
    const yearStr = toArabicDigits(year);

    return {
      day,
      monthNumber,
      monthName,
      year,
      formattedShort: `${dayStr} ${monthName}`,
      formattedFull: `${dayStr} ${monthName} ${yearStr}هـ`,
    };
  }
}

/**
 * Formats a Gregorian date into dual Gregorian / Hijri display string
 * e.g. "الثلاثاء ٦ أكتوبر ٢٠٢٦م | ٢٤ ربيع الأول ١٤٤٨هـ"
 */
export function formatDualCalendarDate(dateInput: Date | string): {
  gregorianFull: string;
  hijriFull: string;
  combined: string;
} {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const safeDate = isNaN(d.getTime()) ? new Date() : d;

  const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const dayName = dayNames[safeDate.getDay()];
  const gDay = toArabicDigits(safeDate.getDate());
  const gMonth = monthNames[safeDate.getMonth()];
  const gYear = toArabicDigits(safeDate.getFullYear());

  const gregorianFull = `${dayName} ${gDay} ${gMonth} ${gYear}م`;
  const hijriInfo = getHijriDate(safeDate);
  const hijriFull = hijriInfo.formattedFull;

  return {
    gregorianFull,
    hijriFull,
    combined: `${gregorianFull} (${hijriFull})`,
  };
}
