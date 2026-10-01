/**
 * Intelligent utility to analyze educational content, textbook excerpts, or files
 * and automatically infer: title, subject, grade, lessonTitle, and relevant tags.
 */

export interface InferredResourceMeta {
  title: string;
  lessonTitle: string;
  subject: string;
  grade: string;
  sourceInfo?: string;
  tags: string[];
}

export function analyzeContentLocally(text: string, currentFileName?: string): InferredResourceMeta {
  const clean = text.trim();
  const lower = clean.toLowerCase();

  // 1. Detect Subject
  let subject = 'العلوم والحياة';
  if (
    /رياضيات|أعداد|كسور|ضرب|قسمة|جمع|طرح|معداد|قيمة منزلية|هندسة|محيط|مساحة|زوايا|معادلة|إحصاء|بيانات/.test(
      clean
    )
  ) {
    subject = 'الرياضيات';
  } else if (
    /لغة عربية|قراءة|نص|قصيدة|فاعل|مفعول|أفعال|حروف|إملاء|همزة|تعبير|مبتدأ|خبر|معجم|مرادفات|استيعاب|شاعر/.test(
      clean
    )
  ) {
    subject = 'اللغة العربية';
  } else if (
    /إسلامية|قرآن|سورة|آية|حديث|نبي|رسول|صلاة|زكاة|صوم|أخلاق|مسجد|وضوء|توحيد|سيرة|فقه/.test(
      clean
    )
  ) {
    subject = 'التربية الإسلامية';
  } else if (
    /اجتماعية|جغرافيا|تاريخ|فلسطين|القدس|خريطة|تضاريس|مناخ|أودية|جبال|سهول|نكبة|تراث|وطنية|بلادنا/.test(
      clean
    )
  ) {
    subject = 'الدراسات الاجتماعية';
  } else if (
    /تكنولوجيا|برمجة|حاسوب|خوارزمية|رقمي|إنترنت|شبكة|أمان|روبوت|تطبيق|ذكاء اصطناعي/.test(
      clean
    )
  ) {
    subject = 'التكنولوجيا';
  } else if (
    /english|unit|lesson|vocabulary|grammar|reading|speaking|writing|phonics/.test(
      lower
    )
  ) {
    subject = 'اللغة الإنجليزية';
  } else if (
    /علوم|مادة|طاقة|حياة|خلية|نبات|حيوان|ماء|تبخر|تكاثف|انصهار|دورة|جهاز|هضمي|تنفسي|بيئة|حرارة|ضوء/.test(
      clean
    )
  ) {
    subject = 'العلوم والحياة';
  }

  // 2. Detect Grade
  let grade = 'الرابع الأساسي';
  if (/الصف الأول|الأول الأساسي|صف أول|grade 1/i.test(clean)) grade = 'الأول الأساسي';
  else if (/الصف الثاني|الثاني الأساسي|صف ثاني|grade 2/i.test(clean)) grade = 'الثاني الأساسي';
  else if (/الصف الثالث|الثالث الأساسي|صف ثالث|grade 3/i.test(clean)) grade = 'الثالث الأساسي';
  else if (/الصف الرابع|الرابع الأساسي|صف رابع|grade 4/i.test(clean)) grade = 'الرابع الأساسي';
  else if (/الصف الخامس|الخامس الأساسي|صف خامس|grade 5/i.test(clean)) grade = 'الخامس الأساسي';
  else if (/الصف السادس|السادس الأساسي|صف سادس|grade 6/i.test(clean)) grade = 'السادس الأساسي';
  else if (/الصف السابع|السابع الأساسي|صف سابع|grade 7/i.test(clean)) grade = 'السابع الأساسي';
  else if (/الصف الثامن|الثامن الأساسي|صف ثامن|grade 8/i.test(clean)) grade = 'الثامن الأساسي';
  else if (/الصف التاسع|التاسع الأساسي|صف تاسع|grade 9/i.test(clean)) grade = 'التاسع الأساسي';
  else if (/الصف العاشر|العاشر الأساسي|grade 10/i.test(clean)) grade = 'العاشر الأساسي';

  // 3. Extract Specific Lesson Title from content headings
  let lessonTitle = '';

  // Look for explicit pattern: درس (...) or الدرس (...) or عنوان: (...) or الوحدة (...)
  const lessonMatch = clean.match(
    /(?:الدرس|درس|عنوان الدرس|موضوع الدرس|الوحدة|فصل)[\s:–-]+([^\n.,؛()]{4,45})/
  );
  if (lessonMatch && lessonMatch[1]) {
    lessonTitle = lessonMatch[1].trim();
  }

  // If no explicit keyword, extract first short heading line
  if (!lessonTitle) {
    const lines = clean
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 3 && l.length < 50 && !l.startsWith('http'));
    if (lines.length > 0) {
      lessonTitle = lines[0].replace(/^[#*•\-\d.\s]+/, '').trim();
    }
  }

  // Fallback if still empty
  if (!lessonTitle && currentFileName) {
    lessonTitle = currentFileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  }
  if (!lessonTitle || lessonTitle.length < 3) {
    lessonTitle = `مفاهيم وتطبيقات في ${subject}`;
  }

  // Clean up punctuation in lesson title
  lessonTitle = lessonTitle.replace(/[:"'\-_]/g, '').trim();

  // 4. Construct overall Resource Title
  const resourceTitle = `كتاب ${subject} - ${lessonTitle}`;

  // 5. Detect page / source info if present
  let sourceInfo: string | undefined = undefined;
  const pageMatch = clean.match(/(?:صفحة|ص|page)[\s:–-]*([٠-٩\d]+(?:\s*-\s*[٠-٩\d]+)?)/i);
  if (pageMatch) {
    sourceInfo = `الكتاب المدرسي المعتمد ص (${pageMatch[1]})`;
  }

  // 6. Generate relevant tags
  const tags: string[] = [subject, grade];
  if (lessonTitle) {
    const words = lessonTitle.split(' ').filter((w) => w.length > 3);
    tags.push(...words.slice(0, 2));
  }

  return {
    title: resourceTitle,
    lessonTitle,
    subject,
    grade,
    sourceInfo,
    tags: Array.from(new Set(tags)),
  };
}
