/**
 * Utility functions for Eastern Arabic numerals conversion and RTL formatting.
 * الأرقام العربية المشرقية (٠، ١، ٢، ٣، ٤، ٥، ٦، ٧، ٨، ٩)
 */

export const toArabicDigits = (val: string | number | undefined | null): string => {
  if (val === undefined || val === null) return '';
  const str = String(val);
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return str.replace(/[0-9]/g, (digit) => arabicDigits[parseInt(digit, 10)]);
};

export const toArabicNumber = (num: number): string => {
  return toArabicDigits(num);
};

export const toArabicPercent = (num: number): string => {
  return `${toArabicDigits(num)}٪`;
};

/**
 * Formats a date string (YYYY-MM-DD, ISO date, or any standard date) into Year/Month/Day format (yyyy/m/d).
 * Formats dates explicitly starting with YEAR, then MONTH, then DAY (سنة / شهر / يوم).
 * Example: "2026-10-05" => "٢٠٢٦/١٠/٥"
 */
export function formatDateYMD(
  dateInput: string | Date | undefined | null,
  convertToArabicNumerals = true,
  includeM = false
): string {
  if (!dateInput) return '';

  if (typeof dateInput === 'string') {
    let cleanStr = dateInput.trim();
    if (!cleanStr) return '';

    // Remove invisible marks and Arabic 'm' / 'h' if present
    cleanStr = cleanStr.replace(/[\u200E\u200F\u202A-\u202E\u061C]/g, '').replace(/[مهـ]/g, '').trim();

    // Convert Eastern Arabic numerals to Western digits for robust parsing
    const normalized = cleanStr.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());

    // If input matches YYYY-MM-DD or YYYY/M/D or YYYY.M.D
    const ymdMatch = normalized.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
    if (ymdMatch) {
      const year = ymdMatch[1];
      const month = parseInt(ymdMatch[2], 10);
      const day = parseInt(ymdMatch[3], 10);
      const res = `${year}/${month}/${day}${includeM ? 'م' : ''}`;
      return convertToArabicNumerals ? toArabicDigits(res) : res;
    }

    // If input matches DD/MM/YYYY or DD-MM-YYYY or D/M/YYYY
    const dmyMatch = normalized.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
    if (dmyMatch) {
      const day = parseInt(dmyMatch[1], 10);
      const month = parseInt(dmyMatch[2], 10);
      const year = dmyMatch[3];
      const res = `${year}/${month}/${day}${includeM ? 'م' : ''}`;
      return convertToArabicNumerals ? toArabicDigits(res) : res;
    }
  }

  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) {
    return convertToArabicNumerals ? toArabicDigits(String(dateInput)) : String(dateInput);
  }

  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();

  const formatted = `${year}/${month}/${day}${includeM ? 'م' : ''}`;
  return convertToArabicNumerals ? toArabicDigits(formatted) : formatted;
}

// Alias for backward compatibility across all modules
export const formatDateDMY = formatDateYMD;

/**
 * Formats a timeframe range starting with Year/Month/Day (yyyy/m/d).
 * Example: startDate="2026-10-05", endDate="2026-10-08"
 * => "من ٢٠٢٦/١٠/٥ إلى ٢٠٢٦/١٠/٨"
 */
export function formatTimeframeYMD(
  startDate?: string,
  endDate?: string,
  holidayNotice?: string
): string {
  if (!startDate && !endDate) return '';
  const startStr = formatDateYMD(startDate);
  const endStr = formatDateYMD(endDate || startDate);
  const notice = holidayNotice ? ` ${holidayNotice}` : '';

  if (startStr && endStr && startStr !== endStr) {
    return `من ${startStr} إلى ${endStr}${notice}`;
  }
  return `تاريخ التنفيذ: ${startStr || endStr}${notice}`;
}

// Alias for backward compatibility
export const formatTimeframeDMY = formatTimeframeYMD;
