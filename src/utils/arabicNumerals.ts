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
 * Formats a date string (YYYY-MM-DD or ISO date) into Day/Month/Year format (DD/MM/YYYY).
 * Formats dates explicitly starting with DAY, then MONTH, then YEAR (يوم / شهر / سنة).
 * Example: "2026-10-05" => "٠٥/١٠/٢٠٢٦م"
 */
export function formatDateDMY(
  dateInput: string | Date | undefined | null,
  convertToArabicNumerals = true,
  includeM = true
): string {
  if (!dateInput) return '';
  
  if (typeof dateInput === 'string') {
    const cleanStr = dateInput.trim();
    if (!cleanStr) return '';

    // If input matches YYYY-MM-DD
    const isoMatch = cleanStr.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
    if (isoMatch) {
      const year = isoMatch[1];
      const month = isoMatch[2].padStart(2, '0');
      const day = isoMatch[3].padStart(2, '0');
      const res = `${day}/${month}/${year}${includeM ? 'م' : ''}`;
      return convertToArabicNumerals ? toArabicDigits(res) : res;
    }

    // If input matches DD/MM/YYYY or DD-MM-YYYY
    const dmyMatch = cleanStr.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
    if (dmyMatch) {
      const day = dmyMatch[1].padStart(2, '0');
      const month = dmyMatch[2].padStart(2, '0');
      const year = dmyMatch[3];
      const res = `${day}/${month}/${year}${includeM ? 'م' : ''}`;
      return convertToArabicNumerals ? toArabicDigits(res) : res;
    }
  }

  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) {
    return convertToArabicNumerals ? toArabicDigits(String(dateInput)) : String(dateInput);
  }

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  const formatted = `${day}/${month}/${year}${includeM ? 'م' : ''}`;
  return convertToArabicNumerals ? toArabicDigits(formatted) : formatted;
}

/**
 * Formats a timeframe range starting with Day/Month/Year.
 * Example: startDate="2026-10-05", endDate="2026-10-08"
 * => "من ٠٥/١٠/٢٠٢٦م إلى ٠٨/١٠/٢٠٢٦م"
 */
export function formatTimeframeDMY(
  startDate?: string,
  endDate?: string,
  holidayNotice?: string
): string {
  if (!startDate && !endDate) return '';
  const startStr = formatDateDMY(startDate);
  const endStr = formatDateDMY(endDate || startDate);
  const notice = holidayNotice ? ` ${holidayNotice}` : '';

  if (startStr && endStr && startStr !== endStr) {
    return `من ${startStr} إلى ${endStr}${notice}`;
  }
  return `تاريخ التنفيذ: ${startStr || endStr}${notice}`;
}
