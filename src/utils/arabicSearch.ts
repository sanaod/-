/**
 * Arabic Search and Normalization Utilities
 * يوفر وظائف مطابقة ذكية للغة العربية مع معالجة الهمزات والتاء المربوطة والتشكيل والأرقام ومطابقة الصفوف
 */

const GRADE_NUM_MAP: Record<string, string[]> = {
  '1': ['اول', 'الأول', 'الاول', '١'],
  '2': ['ثاني', 'الثاني', '٢'],
  '3': ['ثالث', 'الثالث', '٣'],
  '4': ['رابع', 'الرابع', '٤'],
  '5': ['خامس', 'الخامس', '٥'],
  '6': ['سادس', 'السادس', '٦'],
  '7': ['سابع', 'السابع', '٧'],
  '8': ['ثامن', 'الثامن', '٨'],
  '9': ['تاسع', 'التاسع', '٩'],
  '10': ['عاشر', 'العاشر', '١٠'],
  '11': ['حادي عشر', 'الحادي عشر', '١١'],
  '12': ['ثاني عشر', 'الثاني عشر', 'توجيهي', '١٢'],
};

/**
 * Normalizes Arabic text for flexible search matching:
 * - Strips tashkeel (diacritics: fatha, damma, kasra, sukun, shadda, tanween)
 * - Normalizes alef variants (أ, إ, آ, ٱ -> ا)
 * - Normalizes taa marbuta & haa (ة -> ه)
 * - Normalizes alef maksura & yaa (ى -> ي)
 * - Removes tatweel (ـ)
 * - Converts Arabic-Indic numerals (٠-٩) to Latin (0-9)
 */
export function normalizeArabic(text: string | undefined | null): string {
  if (!text) return '';
  return text
    .toString()
    .trim()
    .toLowerCase()
    // Remove diacritics / tashkeel
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Remove tatweel (kashida)
    .replace(/\u0640/g, '')
    // Normalize Alefs
    .replace(/[أإآٱ]/g, 'ا')
    // Normalize Taa Marbuta
    .replace(/ة/g, 'ه')
    // Normalize Yaa / Alef Maksura
    .replace(/ى/g, 'ي')
    // Convert Eastern Arabic numerals ٠-٩ to 0-9
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    // Convert Persian numerals
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06F0));
}

/**
 * Checks whether target string matches the search query using Arabic normalization
 */
export function arabicTextMatches(target: string | undefined | null, query: string): boolean {
  if (!query || query.trim() === '') return true;
  if (!target) return false;

  const normTarget = normalizeArabic(target);
  const normQuery = normalizeArabic(query);

  if (normTarget.includes(normQuery)) {
    return true;
  }

  // Check multi-word queries: all words should match
  const words = normQuery.split(/\s+/).filter(Boolean);
  if (words.length > 1 && words.every((w) => normTarget.includes(w))) {
    return true;
  }

  // Check grade number/word aliases if query is short
  for (const [num, aliases] of Object.entries(GRADE_NUM_MAP)) {
    const isQueryNumOrAlias = normQuery === num || aliases.some((a) => normalizeArabic(a) === normQuery);
    if (isQueryNumOrAlias) {
      // Check if target has the number or any alias
      if (normTarget.includes(num)) return true;
      for (const a of aliases) {
        if (normTarget.includes(normalizeArabic(a))) return true;
      }
    }
  }

  return false;
}

export type SearchScope = 'all' | 'lessonTitle' | 'subject' | 'grade';

export interface PlanSearchOptions {
  query: string;
  scope: SearchScope;
}

/**
 * Tests whether a lesson plan matches the search query and specific scope
 * (اسم الدرس أو المادة أو الصف)
 */
export function matchesPlanSearch(
  plan: {
    header: {
      lessonTitle?: string;
      subject?: string;
      grade?: string;
      teacherName?: string;
    };
    title?: string;
  },
  query: string,
  scope: SearchScope = 'all'
): boolean {
  if (!query || query.trim() === '') return true;

  const lessonTitle = plan.header.lessonTitle || plan.title || '';
  const subject = plan.header.subject || '';
  const grade = plan.header.grade || '';
  const teacher = plan.header.teacherName || '';

  switch (scope) {
    case 'lessonTitle':
      return arabicTextMatches(lessonTitle, query);

    case 'subject':
      return arabicTextMatches(subject, query);

    case 'grade':
      return arabicTextMatches(grade, query);

    case 'all':
    default:
      return (
        arabicTextMatches(lessonTitle, query) ||
        arabicTextMatches(subject, query) ||
        arabicTextMatches(grade, query) ||
        arabicTextMatches(teacher, query)
      );
  }
}
