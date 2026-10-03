import { ResourceType } from '../types/lessonPlan';

/**
 * Intelligent utility to analyze educational content, textbook excerpts, and any uploaded file
 * (PDF, Word, Excel, PowerPoint, images, audio, video, exams, links, etc.)
 * and automatically infer:
 * - compatible title matching the source
 * - resource type
 * - subject
 * - grade
 * - specific lesson title
 * - source info & tags
 */

export interface InferredResourceMeta {
  title: string;
  lessonTitle: string;
  subject: string;
  grade: string;
  sourceInfo?: string;
  tags: string[];
  inferredType?: ResourceType;
}

export function analyzeContentLocally(
  text: string,
  currentFileName?: string,
  fileMimeOrExt?: string
): InferredResourceMeta {
  const clean = text.trim();
  const lower = clean.toLowerCase();
  const fileNameClean = currentFileName ? currentFileName.trim() : '';
  const fileNameLower = fileNameClean.toLowerCase();
  const combined = `${fileNameClean} ${clean}`.trim();
  const combinedLower = combined.toLowerCase();

  // 1. Detect Resource Type
  let inferredType: ResourceType = 'document';

  // Check file extension first
  const ext = (fileMimeOrExt || (fileNameClean.includes('.') ? fileNameClean.split('.').pop() : ''))
    ?.toLowerCase()
    .replace('.', '') || '';

  if (['ppt', 'pptx', 'odp', 'key'].includes(ext) || /عرض تقديمي|بوربوينت|شرائح|presentation|powerpoint/i.test(combined)) {
    inferredType = 'presentation';
  } else if (['xls', 'xlsx', 'csv', 'ods'].includes(ext) || /جدول بيانات|اكسل|إكسل|رصد درجات|spreadsheet|excel/i.test(combined)) {
    inferredType = 'spreadsheet';
  } else if (['mp3', 'wav', 'm4a', 'ogg', 'aac', 'flac'].includes(ext) || /تسجيل صوتي|ملف صوتي|استماع|نص استماع|تلاوة|بودكاست|audio/i.test(combined)) {
    inferredType = 'audio';
  } else if (['mp4', 'webm', 'mov', 'avi', 'mkv', 'flv'].includes(ext) || /فيديو تعليمي|مقطع مرئي|درس مصور|فيلم وثائقي|شرح مصور|video/i.test(combined)) {
    inferredType = 'video';
  } else if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif', 'bmp'].includes(ext) || /صورة|خريطة|مخطط|انفوجرافيك|رسم توضيحي|لوحة|image/i.test(combined)) {
    inferredType = 'image';
  } else if (/ورقة عمل|أوراق عمل|ورقة تدريب|مهمة أدائية|نشاط صفي|تدريبات|worksheet/i.test(combined)) {
    inferredType = 'worksheet';
  } else if (/امتحان|اختبار|بنك أسئلة|ورقة تقييم|مذاكرة|quiz|exam|test/i.test(combined)) {
    inferredType = 'exam';
  } else if (/دليل المعلم|دليل المعلمين|الخطة الفصلية|توزيع المنهاج|خطط سنوية/i.test(combined)) {
    inferredType = 'curriculum_guide';
  } else if (/^https?:\/\/|^www\./i.test(clean) || /رابط|موقع|منصة|يوتيوب|محاكي|link/i.test(combined)) {
    inferredType = 'link';
  } else if (/كتاب|منهاج|طبعة|الوحدة|فصل دراسي|textbook/i.test(combined)) {
    inferredType = 'textbook';
  } else if (/معيار|نتاج|كفاية|مؤشر أداء|standard/i.test(combined)) {
    inferredType = 'standard';
  } else if (/ملاحظات|فكرة|ملحوظة|تأمل|note/i.test(combined)) {
    inferredType = 'note';
  }

  // 2. Detect Subject
  let subject = 'العلوم والحياة';
  if (
    /رياضيات|أعداد|كسور|ضرب|قسمة|جمع|طرح|معداد|قيمة منزلية|هندسة|محيط|مساحة|زوايا|معادلة|إحصاء|بيانات|math/i.test(
      combined
    )
  ) {
    subject = 'الرياضيات';
  } else if (
    /لغة عربية|عربي|قراءة|نص|قصيدة|فاعل|مفعول|أفعال|حروف|إملاء|همزة|تعبير|مبتدأ|خبر|معجم|مرادفات|استيعاب|شاعر|نحو/i.test(
      combined
    )
  ) {
    subject = 'اللغة العربية';
  } else if (
    /إسلامية|تربية إسلامية|قرآن|سورة|آية|حديث|نبي|رسول|صلاة|زكاة|صوم|أخلاق|مسجد|وضوء|توحيد|سيرة|فقه|تجويد/i.test(
      combined
    )
  ) {
    subject = 'التربية الإسلامية';
  } else if (
    /اجتماعية|دراسات اجتماعية|تنشئة|جغرافيا|تاريخ|فلسطين|القدس|خريطة|تضاريس|مناخ|أودية|جبال|سهول|نكبة|تراث|وطنية|بلادنا/i.test(
      combined
    )
  ) {
    subject = 'الدراسات الاجتماعية';
  } else if (
    /تكنولوجيا|برمجة|حاسوب|خوارزمية|رقمي|إنترنت|شبكة|أمان|روبوت|تطبيق|ذكاء اصطناعي|سكراتش|scratch/i.test(
      combined
    )
  ) {
    subject = 'التكنولوجيا';
  } else if (
    /english|unit|lesson|vocabulary|grammar|reading|speaking|writing|phonics/i.test(
      combinedLower
    )
  ) {
    subject = 'اللغة الإنجليزية';
  } else if (
    /تربية فنية|فنون|رسم|ألوان|لوحة|تظليل|أشغال|خط عربي/i.test(combined)
  ) {
    subject = 'التربية الفنية';
  } else if (
    /تربية رياضية|رياضة|لياقة|جمباز|كرة قدم|كرة سلة|سباق/i.test(combined)
  ) {
    subject = 'التربية الرياضية';
  } else if (
    /علوم|مادة|طاقة|حياة|خلية|نبات|حيوان|ماء|تبخر|تكاثف|انصهار|دورة|جهاز|هضمي|تنفسي|بيئة|حرارة|ضوء|مغناطيس|science/i.test(
      combined
    )
  ) {
    subject = 'العلوم والحياة';
  }

  // 3. Detect Grade Level
  let grade = 'الصف الرابع الأساسي';
  if (/الصف الأول الأساسي|الأول الأساسي|صف أول|الصف الأول|grade 1/i.test(combined)) grade = 'الصف الأول الأساسي';
  else if (/الصف الثاني الأساسي|الثاني الأساسي|صف ثاني|الصف الثاني|grade 2/i.test(combined)) grade = 'الصف الثاني الأساسي';
  else if (/الصف الثالث الأساسي|الثالث الأساسي|صف ثالث|الصف الثالث|grade 3/i.test(combined)) grade = 'الصف الثالث الأساسي';
  else if (/الصف الرابع الأساسي|الرابع الأساسي|صف رابع|الصف الرابع|grade 4/i.test(combined)) grade = 'الصف الرابع الأساسي';
  else if (/الصف الخامس الأساسي|الخامس الأساسي|صف خامس|الصف الخامس|grade 5/i.test(combined)) grade = 'الصف الخامس الأساسي';
  else if (/الصف السادس الأساسي|السادس الأساسي|صف سادس|الصف السادس|grade 6/i.test(combined)) grade = 'الصف السادس الأساسي';
  else if (/الصف السابع الأساسي|السابع الأساسي|صف سابع|الصف السابع|grade 7/i.test(combined)) grade = 'الصف السابع الأساسي';
  else if (/الصف الثامن الأساسي|الثامن الأساسي|صف ثامن|الصف الثامن|grade 8/i.test(combined)) grade = 'الصف الثامن الأساسي';
  else if (/الصف التاسع الأساسي|التاسع الأساسي|صف تاسع|الصف التاسع|grade 9/i.test(combined)) grade = 'الصف التاسع الأساسي';
  else if (/الصف العاشر الأساسي|العاشر الأساسي|صف عاشر|الصف العاشر|grade 10/i.test(combined)) grade = 'الصف العاشر الأساسي';
  else if (/الحادي عشر|أول ثانوي|grade 11/i.test(combined)) grade = 'الصف الحادي عشر';
  else if (/الثاني عشر|توجيهي|ثاني ثانوي|grade 12/i.test(combined)) grade = 'الصف الثاني عشر (التوجيهي)';

  // 4. Extract Specific Lesson Title
  let lessonTitle = '';

  // Clean filename if provided
  let cleanName = fileNameClean
    .replace(/\.[^/.]+$/, '') // remove extension
    .replace(/[-_]/g, ' ')   // replace dashes/underscores with space
    .replace(/^(ورقة عمل|اوراق عمل|عرض تقديمي|بوربوينت|تسجيل صوتي|فيديو|كتاب|امتحان|اختبار|دليل المعلم|ملف|مستند)[\s:–-]*/i, '')
    .trim();

  // Remove common grade/subject repetitions from cleanName to leave the pure lesson title
  cleanName = cleanName
    .replace(/(للصف|صف|الصف)\s+[^\s]+/gi, '')
    .replace(new RegExp(subject, 'gi'), '')
    .replace(/\s+/g, ' ')
    .trim();

  // First priority: explicit regex in text or filename
  const lessonMatch = clean.match(
    /(?:الدرس|درس|عنوان الدرس|موضوع الدرس|الوحدة|فصل)[\s:–-]+([^\n.,؛()]{4,55})/
  );
  if (lessonMatch && lessonMatch[1]) {
    lessonTitle = lessonMatch[1].trim();
  }

  // Second priority: cleanName if meaningful
  if (!lessonTitle && cleanName && cleanName.length > 3 && !/^(document|file|image|scan|img|new|unnamed)$/i.test(cleanName)) {
    lessonTitle = cleanName;
  }

  // Third priority: first heading line of content
  if (!lessonTitle) {
    const lines = clean
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 3 && l.length < 60 && !l.startsWith('http') && !l.startsWith('['));
    if (lines.length > 0) {
      lessonTitle = lines[0].replace(/^[#*•\-\d.\s]+/, '').trim();
    }
  }

  // Fallback
  if (!lessonTitle || lessonTitle.length < 3) {
    lessonTitle = `مفاهيم وتطبيقات في ${subject}`;
  }

  // Sanitize punctuation
  lessonTitle = lessonTitle.replace(/[:"'\-_]/g, '').trim();

  // 5. Construct Compatible Resource Title matching the source!
  // Format title dynamically based on source type, subject, grade, and lesson name
  let resourceTitle = '';
  const shortGrade = grade.replace(' الأساسي', '');

  switch (inferredType) {
    case 'worksheet':
      resourceTitle = `ورقة عمل: ${subject} (${shortGrade}) - ${lessonTitle}`;
      break;
    case 'presentation':
      resourceTitle = `عرض تقديمي: ${subject} (${shortGrade}) - ${lessonTitle}`;
      break;
    case 'audio':
      resourceTitle = `تسجيل صوتي: ${subject} (${shortGrade}) - ${lessonTitle}`;
      break;
    case 'video':
      resourceTitle = `فيديو تعليمي: ${subject} (${shortGrade}) - ${lessonTitle}`;
      break;
    case 'exam':
      resourceTitle = `اختبار تقويمي: ${subject} (${shortGrade}) - ${lessonTitle}`;
      break;
    case 'spreadsheet':
      resourceTitle = `جدول بيانات: ${subject} (${shortGrade}) - ${lessonTitle}`;
      break;
    case 'image':
      resourceTitle = `وسيلة بصرية: ${subject} (${shortGrade}) - ${lessonTitle}`;
      break;
    case 'curriculum_guide':
      resourceTitle = `دليل المعلم: ${subject} (${shortGrade}) - ${lessonTitle}`;
      break;
    case 'link':
      resourceTitle = `رابط تعليمي: ${subject} - ${lessonTitle}`;
      break;
    case 'textbook':
      resourceTitle = `كتاب ${subject} (${shortGrade}) - ${lessonTitle}`;
      break;
    case 'standard':
      resourceTitle = `معايير ونتاجات: ${subject} (${shortGrade}) - ${lessonTitle}`;
      break;
    case 'note':
      resourceTitle = `ملاحظات تحضير: ${subject} (${shortGrade}) - ${lessonTitle}`;
      break;
    case 'document':
    default:
      if (ext) {
        resourceTitle = `مستند [${ext.toUpperCase()}]: ${subject} (${shortGrade}) - ${lessonTitle}`;
      } else {
        resourceTitle = `مستند تعليمي: ${subject} (${shortGrade}) - ${lessonTitle}`;
      }
      break;
  }

  // 6. Detect page / source info if present
  let sourceInfo: string | undefined = undefined;
  const pageMatch = clean.match(/(?:صفحة|ص|page)[\s:–-]*([٠-٩\d]+(?:\s*-\s*[٠-٩\d]+)?)/i);
  if (pageMatch) {
    sourceInfo = `الكتاب المدرسي المعتمد ص (${pageMatch[1]})`;
  } else if (fileNameClean) {
    sourceInfo = `ملف مرفق: ${fileNameClean}`;
  }

  // 7. Generate relevant tags
  const tags: string[] = [subject, grade];
  if (inferredType !== 'document') {
    const typeLabelMap: Record<string, string> = {
      worksheet: 'ورقة عمل',
      presentation: 'عرض تقديمي',
      audio: 'ملف صوتي',
      video: 'فيديو تعليمي',
      exam: 'اختبارات',
      spreadsheet: 'جداول بيانات',
      image: 'وسائل بصرية',
      curriculum_guide: 'دليل المعلم',
      link: 'روابط إلكترونية',
      textbook: 'كتاب مدرسي',
      standard: 'معايير',
    };
    if (typeLabelMap[inferredType]) {
      tags.push(typeLabelMap[inferredType]);
    }
  }
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
    inferredType,
  };
}
