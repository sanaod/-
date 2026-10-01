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
