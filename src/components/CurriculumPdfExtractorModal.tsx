import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileText,
  FileSpreadsheet,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BookOpen,
  Calendar,
  Layers,
  Clock,
  ArrowRight,
  Download,
  Trash2,
  Eye,
  FileUp,
  Table,
  Check,
  ChevronLeft,
  Info,
  CalendarRange,
  Zap,
} from 'lucide-react';
import { SemesterPlanDocument, SemesterPlanRow } from '../types/semesterPlan';
import { LessonPlan } from '../types/lessonPlan';
import { toArabicDigits } from '../utils/arabicNumerals';

interface CurriculumPdfExtractorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPlan: (extractedPlan: SemesterPlanDocument) => void;
  onImportLessonsToApp?: (lessons: LessonPlan[]) => void;
  currentSubject?: string;
  currentGrade?: string;
  teacherName?: string;
  schoolName?: string;
}

const SAMPLE_CURRICULUM_TEMPLATES = [
  {
    id: 'sample-math-g3',
    subject: 'الرياضيات',
    grade: 'الصف الثالث الأساسي',
    semester: 'الفصل الدراسي الأول',
    weeklyPeriods: 5,
    title: 'جدول توزيع منهاج الرياضيات الوزاري (الصف الثالث)',
    snippet: `وزارة التربية والتعليم - الإدارة العامة للمناهج
جدول توزيع المحتوى الدراسي لمبحث الرياضيات - الصف الثالث الأساسي - الفصل الدراسي الأول
الوحدة الأولى: الأعداد حتى 9999 والقيمة المنزلية (20 حصة)
- الدرس 1: مراجعة الأعداد والتمثيل على المعداد (4 حصص)
- الدرس 2: القيمة المنزلية والصورة الموسعة (4 حصص)
- الدرس 3: مقارنة الأعداد وترتيبها (4 حصص)
- الدرس 4: تقريب الأعداد لأقرب عشرة ومئة (4 حصص)
- الدرس 5: مهمة تقويم أصيل GRASPS وتطبيقات حياتية (4 حصص)
الوحدة الثانية: جمع الأعداد وطرحها ضمن 9999 (25 حصة)
- الدرس 1: الجمع بدون حمل والجمع مع الحمل (5 حصص)
- الدرس 2: خواص عملية الجمع والتقدير (5 حصص)
- الدرس 3: الطرح بدون استلاف ومع الاستلاف (5 حصص)
- الدرس 4: العلاقة بين الجمع والطرح وحل مسائل حياتية (5 حصص)
- الدرس 5: ورقة عمل إثرائية وتقويم بنائي (5 حصص)
الوحدة الثالثة: الهندسة والقياس والمجسمات (20 حصة)
- الدرس 1: النقطة والقطعة المستقيمة والشعاع (4 حصص)
- الدرس 2: الزوايا وأنواعها (قائمة، حادة، منفرجة) (4 حصص)
- الدرس 3: الأشكال الرباعية والمثلثات وخصائصها (4 حصص)
- الدرس 4: المحيط ووحدات قياس الطول (4 حصص)
- الدرس 5: المجسمات والمكعب ومتوازي المستطيلات (4 حصص)
الوحدة الرابعة: جمع وتنظيم البيانات والإحصاء (15 حصة)
- الدرس 1: جمع البيانات وجداول الإشارات (5 حصص)
- الدرس 2: التمثيل بالصور والأعمدة البيانية (5 حصص)
- الدرس 3: مهمة الأداء الختامية والمراجعة الشاملة (5 حصص)`,
  },
  {
    id: 'sample-science-g4',
    subject: 'العلوم والحياة',
    grade: 'الصف الرابع الأساسي',
    semester: 'الفصل الدراسي الأول',
    weeklyPeriods: 4,
    title: 'جدول توزيع منهاج العلوم والحياة (الصف الرابع)',
    snippet: `وزارة التربية والتعليم - دليل توزيع منهاج العلوم والحياة - الصف الرابع الأساسي
الوحدة الأولى: الكائنات الحية وتكيفها في البيئة الفلسطينية (16 حصة)
- الدرس 1: خصائص الكائنات الحية وحاجاتها (4 حصص)
- الدرس 2: تكيف النباتات مع البيئة الجافة والجبلية (4 حصص)
- الدرس 3: تكيف الحيوانات وسلوكيات البقاء (4 حصص)
- الدرس 4: السلاسل الغذائية والمحميات الطبيعية في فلسطين (4 حصص)
الوحدة الثانية: المادة وحالاتها وتحولاتها (16 حصة)
- الدرس 1: حالات المادة وخصائص كل حالة (4 حصص)
- الدرس 2: أثر الحرارة في تحولات المادة (انصهار وتجمد) (4 حصص)
- الدرس 3: التبخر والتكاثف ودورة الماء في الطبيعة (4 حصص)
- الدرس 4: المخاليط وطرق فصلها عملياً (4 حصص)
الوحدة الثالثة: القوى والحركة والآلات البسيطة (16 حصة)
- الدرس 1: مفهوم الحركة والموقع والسرعة (4 حصص)
- الدرس 2: أنواع القوى: الجاذبية والاحتكاك والمغناطيسية (4 حصص)
- الدرس 3: الآلات البسيطة: الرافعة والسطح المائل (4 حصص)
- الدرس 4: السلامة في التعامل مع القوى والحركة (4 حصص)
الوحدة الرابعة: كوكب الأرض ومصادر الطاقة المتجددة (12 حصة)
- الدرس 1: طبقات الأرض والصخور والمعادن (4 حصص)
- الدرس 2: الطاقة الشمسية وطاقة الرياح في فلسطين (4 حصص)
- الدرس 3: مهمة GRASPS الاستقصائية البيئية والتقويم الختامي (4 حصص)`,
  },
  {
    id: 'sample-arabic-g5',
    subject: 'اللغة العربية',
    grade: 'الصف الخامس الأساسي',
    semester: 'الفصل الدراسي الأول',
    weeklyPeriods: 6,
    title: 'جدول توزيع منهاج لغتنا الجميلة (الصف الخامس)',
    snippet: `وزارة التربية والتعليم - الخطة الفصلية لمبحث اللغة العربية (لغتنا الجميلة) - الصف الخامس
الوحدة الأولى: أحب لغتي ووطني (18 حصة)
- الدرس 1: نص الاستماع والمحادثة وفهم المسموع (3 حصص)
- الدرس 2: القراءة الجهرية التفسيرية وتحليل المعاني (6 حصص)
- الدرس 3: أقسام الكلام (اسم، فعل، حرف) والتدريبات (4 حصص)
- الدرس 4: همزتا الوصل والقطع في الأسماء والأفعال (3 حصص)
- الدرس 5: التعبير الكتابي وبناء الفقرة المترابطة (2 حصة)
الوحدة الثانية: في رحاب الطبيعة والتاريخ (18 حصة)
- الدرس 1: نص القراءة وتحليل الأفكار والصور الفنية (6 حصص)
- الدرس 2: الجملة الاسمية: المبتدأ والخبر وعلامات رفعهما (5 حصص)
- الدرس 3: الهمزة المتوسطة على نبرة وقاعدة الحركات (4 حصص)
- الدرس 4: كتابة القصة القصيرة والخط العربي (3 حصص)
الوحدة الثالثة: قيم إنسانية وإبداع (18 حصة)
- الدرس 1: النصوص الأدبية والشعر وتذوق الجماليات (6 حصص)
- الدرس 2: الجملة الفعلية: الفعل والفاعل والمفعول به (5 حصص)
- الدرس 3: الهمزة المتوسطة على واو وتطبيقات إملائية (4 حصص)
- الدرس 4: فن الرسالة الإخوانية ومهمة GRASPS الأدبية (3 حصص)
الوحدة الرابعة: عقول مفكرة وتجارب ملهمة (18 حصة)
- الدرس 1: القراءة التفسيرية للنصوص العلمية والإثرائية (6 حصص)
- الدرس 2: علامات الترقيم ومواضع استخدامها (4 حصص)
- الدرس 3: مراجعة شاملة للقواعد النحوية والإملائية (4 حصص)
- الدرس 4: المشروع التعبيري النهائي والتقويم الختامي (4 حصص)`,
  },
];

export const CurriculumPdfExtractorModal: React.FC<CurriculumPdfExtractorModalProps> = ({
  isOpen,
  onClose,
  onApplyPlan,
  onImportLessonsToApp,
  currentSubject = 'الرياضيات',
  currentGrade = 'الصف الثالث الأساسي',
  teacherName = 'أ. عبد الرحمن دويكات',
  schoolName = 'مدرسة التميز النموذجية للبنين',
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'templates'>('upload');
  
  // File state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [fileMime, setFileMime] = useState<string>('application/pdf');
  const [fileSizeText, setFileSizeText] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Text & Settings state
  const [textSnippet, setTextSnippet] = useState<string>('');
  const [subject, setSubject] = useState<string>(currentSubject);
  const [grade, setGrade] = useState<string>(currentGrade);
  const [semester, setSemester] = useState<string>('الفصل الدراسي الأول');
  const [weeklyPeriods, setWeeklyPeriods] = useState<number>(5);
  const [totalWeeks, setTotalWeeks] = useState<number>(16);
  const [startDate, setStartDate] = useState<string>('2026-09-01');
  const [endDate, setEndDate] = useState<string>('2027-01-15');
  const [customNotes, setCustomNotes] = useState<string>('');

  // Processing & Extraction state
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractionStage, setExtractionStage] = useState<number>(0);
  const [extractedPlan, setExtractedPlan] = useState<SemesterPlanDocument | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<'table' | 'units' | 'competencies'>('table');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle file selection
  const handleFileChange = (file: File) => {
    if (!file) return;
    setUploadedFile(file);
    setFileName(file.name);
    setFileMime(file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'));
    
    // Format size
    const sizeKb = Math.round(file.size / 1024);
    setFileSizeText(sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} ميجابايت` : `${sizeKb} كيلوبايت`);
    setErrorMessage(null);

    // Read base64
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFileBase64(result);
    };
    reader.onerror = () => {
      setErrorMessage('تعذر قراءة الملف، يرجى المحاولة مرة أخرى.');
    };
    reader.readAsDataURL(file);

    // Auto-detect subject / grade from file name
    const lowerName = file.name.toLowerCase();
    if (/رياضيات|math/i.test(lowerName)) setSubject('الرياضيات');
    else if (/علوم|science/i.test(lowerName)) setSubject('العلوم والحياة');
    else if (/عرب|لغة عربية/i.test(lowerName)) setSubject('اللغة العربية');
    else if (/إسلام|دين/i.test(lowerName)) setSubject('التربية الإسلامية');
    else if (/اجتماع|جغرافيا|تاريخ/i.test(lowerName)) setSubject('الدراسات الاجتماعية');
    else if (/تكنو|حاسوب/i.test(lowerName)) setSubject('التكنولوجيا');
    else if (/english/i.test(lowerName)) setSubject('اللغة الإنجليزية');

    if (/أول|1/i.test(lowerName)) setGrade('الصف الأول الأساسي');
    else if (/ثاني|2/i.test(lowerName)) setGrade('الصف الثاني الأساسي');
    else if (/ثالث|3/i.test(lowerName)) setGrade('الصف الثالث الأساسي');
    else if (/رابع|4/i.test(lowerName)) setGrade('الصف الرابع الأساسي');
    else if (/خامس|5/i.test(lowerName)) setGrade('الصف الخامس الأساسي');
    else if (/سادس|6/i.test(lowerName)) setGrade('الصف السادس الأساسي');
    else if (/سابع|7/i.test(lowerName)) setGrade('الصف السابع الأساسي');
    else if (/ثامن|8/i.test(lowerName)) setGrade('الصف الثامن الأساسي');
    else if (/تاسع|9/i.test(lowerName)) setGrade('الصف التاسع الأساسي');
    else if (/عاشر|10/i.test(lowerName)) setGrade('الصف العاشر الأساسي');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Load sample template
  const handleSelectSample = (sample: (typeof SAMPLE_CURRICULUM_TEMPLATES)[0]) => {
    setSubject(sample.subject);
    setGrade(sample.grade);
    setSemester(sample.semester);
    setWeeklyPeriods(sample.weeklyPeriods);
    setTextSnippet(sample.snippet);
    setFileName(sample.title);
    setUploadedFile(null);
    setFileBase64('');
    setActiveTab('paste');
    setErrorMessage(null);
  };

  // Perform AI Extraction
  const handleStartExtraction = async () => {
    if (!fileBase64 && !textSnippet.trim()) {
      setErrorMessage('يرجى رفع ملف المنهاج (PDF/صورة) أو لصق نص جدول توزيع المحتوى للبدء.');
      return;
    }

    setIsExtracting(true);
    setErrorMessage(null);
    setExtractionStage(1);

    const stageTimer1 = setTimeout(() => setExtractionStage(2), 800);
    const stageTimer2 = setTimeout(() => setExtractionStage(3), 1800);
    const stageTimer3 = setTimeout(() => setExtractionStage(4), 2800);

    try {
      const response = await fetch('/api/extract-curriculum-semester-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileData: fileBase64 || undefined,
          mimeType: fileMime,
          fileName,
          textSnippet: textSnippet.trim() || undefined,
          subjectOverride: subject,
          gradeOverride: grade,
          semesterOverride: semester,
          weeklyPeriodsCount: Number(weeklyPeriods) || 5,
          totalSemesterWeeks: Number(totalWeeks) || 16,
          startDate,
          endDate,
          teacherName,
          school: schoolName,
          customNotes,
        }),
      });

      const data = await response.json();
      if (data.plan) {
        setExtractionStage(5);
        setExtractedPlan(data.plan);
      } else {
        throw new Error(data.error || 'فشل في استخراج بيانات المنهاج');
      }
    } catch (err: any) {
      console.error('Error in curriculum extraction:', err);
      setErrorMessage(err.message || 'حدث خطأ أثناء معالجة واستخراج بيانات المنهاج.');
    } finally {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);
      setIsExtracting(false);
    }
  };

  // Apply extracted plan to the semester plan editor
  const handleConfirmApply = () => {
    if (!extractedPlan) return;
    onApplyPlan(extractedPlan);
    onClose();
  };

  // Import lessons directly to the app
  const handleImportToLessons = () => {
    if (!extractedPlan || !onImportLessonsToApp) return;
    
    const convertedPlans: LessonPlan[] = extractedPlan.rows.map((row, idx) => {
      const planId = `curriculum-imported-${Date.now()}-${idx + 1}`;
      return {
        id: planId,
        title: `${extractedPlan.subject} - ${row.lessonTitle}`,
        header: {
          country: extractedPlan.country || 'دولة فلسطين',
          ministry: extractedPlan.ministry || 'وزارة التربية والتعليم',
          directorate: extractedPlan.directorate || 'مديرية التربية والتعليم',
          school: extractedPlan.school || schoolName,
          teacherName: extractedPlan.teacherName || teacherName,
          subject: extractedPlan.subject,
          grade: extractedPlan.grade,
          section: extractedPlan.section || 'الشعبة الأولى',
          semester: extractedPlan.semester,
          academicYear: extractedPlan.academicYear,
          lessonTitle: row.lessonTitle,
          unitTitle: row.unitTitle,
          totalPeriods: row.lessonPeriods,
          currentPeriod: 1,
          periodDurationMinutes: 40,
          date: row.startDate || new Date().toISOString().split('T')[0],
        },
        section1: {
          integrativeCompetencies: row.unitCompetencyGoals.map((g, gIdx) => ({
            id: `comp-${gIdx + 1}`,
            title: `الكفاية المستهدفة ${gIdx + 1}`,
            description: g,
            achieved: false,
          })),
          studentCharacteristics: {
            individualDifferences: 'مراعاة الفروق الفردية وتقديم أنشطة متمايزة تناسب كافة المستويات.',
            specialNeeds: 'توفير الدعم الاستدراكي والوسائل المحسوسة للطلبة ذوي صعوبات التعلم.',
            environmentalAdaptation: 'بيئة صفية تفاعلية تعتمد على المحسوسات ومصادر OER الرقمية.',
          },
          learningResources: {
            textbook: row.learningResourcesOer[0] || 'الكتاب المدرسي المعتمد',
            tangibleMedia: row.learningResourcesOer[1] || 'وسائط ومحسوسات صفية',
            digitalReadiness: row.learningResourcesOer.slice(2).join('، ') || 'منصة روافد ومصادر OER',
          },
          ethicsAndSafety: {
            digitalSafety: 'الاستخدام الآمن والمسؤول للمصادر والمواقع الرقمية.',
            contentAccuracyAndLanguage: 'الدقة العلمية واللغوية والسلامة الفكرية.',
          },
          reflectiveQuestions: [
            `كيف أسهمت أنشطة هذا الدرس في تحقيق النتاجات الكفائية لوحدة "${row.unitTitle}"؟`,
            'ما التحديات التي واجهت الطلبة في استيعاب المفهوم وكيف عولجت؟',
          ],
        },
        section2Timeline: [
          {
            id: 'phase-1',
            phaseName: 'التهيئة الحافزة والربط واستثارة الدافعية',
            durationMinutes: 5,
            teacherAndStudentActions: [
              'استثارة المعارف القبلية وطرح تساؤل استقصائي تفاعلي يربط الدرس بالواقع.',
              'توضيح أهداف ونتاجات الدرس ومعايير النجاح.',
            ],
            strategiesAndResources: [row.teachingStrategies[0] || 'العصف الذهني والحوار'],
            assessmentAndFeedback: ['أسئلة تشخيصية سابرة وتغذية راجعة فورية.'],
            differentiation: 'مراعاة سرعة الاستجابة وتقديم تلميحات تشجيعية.',
          },
          {
            id: 'phase-2',
            phaseName: 'البناء المعرفي والتعلم النشط والاستقصاء',
            durationMinutes: 20,
            teacherAndStudentActions: [
              'تنفيذ أنشطة التعلم النشط والتجريب العملي بالمحسوسات والمجموعات.',
              'مناقشة النتائج وتقديم التغذية الراجعة البنائية الفورية.',
            ],
            strategiesAndResources: row.teachingStrategies,
            assessmentAndFeedback: ['ملاحظة أداء المجموعات والتوجيه المستمر.'],
            differentiation: 'مهام متدرجة الصعوبة تراعي مستويات بلوم المتنوعة.',
          },
          {
            id: 'phase-3',
            phaseName: 'التطبيق العملي وحل المشكلات',
            durationMinutes: 10,
            teacherAndStudentActions: [
              'حل تدريبات الكتاب المدرسي وأوراق العمل التفاعلية OER.',
              'تبادل الأعمال بين المجموعات وتصويب الأخطاء الشائعة.',
            ],
            strategiesAndResources: ['التعلم التعاوني الموجه', 'التطبيقات العملية'],
            assessmentAndFeedback: ['تقييم أوراق العمل والملاحظة المباشرة.'],
            differentiation: 'دعم فردي للطلبة المحتاجين وتحديات للمتميزين.',
          },
          {
            id: 'phase-4',
            phaseName: 'الغلق المعرفي والتقويم الختامي والتأمل',
            durationMinutes: 5,
            teacherAndStudentActions: [
              'تلخيص المفاهيم الأساسية وتطبيق بطاقة الخروج السريعة (Exit Ticket).',
              'تكليف الطلبة بمهمة بيتية تطبيقية تعزز الشراكة الأسرية.',
            ],
            strategiesAndResources: row.assessmentMethods,
            assessmentAndFeedback: ['بطاقة خروج وتغذية راجعة ختامية.'],
            differentiation: 'خيارات تعبير متنوعة وتقويم ذاتي.',
          },
        ],
        section3Assessment: {
          graspsTask: {
            title: `مهمة أداء أصيل: ${row.lessonTitle}`,
            goal: row.unitCompetencyGoals[0] || 'تطبيق المهارات في سياق واقعي',
            role: 'باحث / منتج ومبتكر طلابي',
            audience: 'الزملاء والمجتمع المدرسي والأسرة',
            situation: 'موقف تطبيقي يعالج تحدياً من البيئة المعاشة',
            product: 'تقرير مصور / نموذج تطبيقي / بطاقة تفاعلية',
            standards: 'الدقة العلمية والوضوح والإبداع في التنفيذ',
            fullDescription: `مهمة أدائية أصيلة تطبيقية لدرس ${row.lessonTitle} ترتكز على نتاجات الوحدة وتتيح للطلبة إنتاج مخرجات تعلم حقيقية.`,
          },
          rubric: [
            {
              criterion: 'الدقة العلمية والمفاهيمية',
              level1: 'صعوبة في تطبيق المفاهيم وتكرار الأخطاء',
              level2: 'تطبيق مقبول مع حاجة للتوجيه في بعض المفاهيم',
              level3: 'تطبيق جيد مع وجود أخطاء طفيفة غير جوهرية',
              level4: 'تطبيق دقيق وخالٍ من الأخطاء مع عمق في التفسير',
            },
            {
              criterion: 'توظيف الاستراتيجيات ومصادر OER',
              level1: 'اقتصار على الحد الأدنى',
              level2: 'توظيف محدود لمصادر التعلم',
              level3: 'توظيف مناسب لمصادر التعلم',
              level4: 'توظيف مبدع ومتنوع للمصادر المفتوحة',
            },
          ],
          remedialActivities: [
            {
              title: 'خطة الدعم والمساندة الفردية',
              description: 'جلسات استدراكية وتدريبات حسية تفاعلية مبسطة لترسيخ المفاهيم الأساسية.',
            },
          ],
          enrichmentActivities: {
            title: 'أنشطة الإثراء والتحدي الإبداعي',
            puzzleOrChallenge: 'مسألة مركبة وتحدٍ إبداعي يربط الدرس بالمشروعات الحياتية.',
            peerTutoring: 'قيادة مجموعة تعلم تعاونية وتدريب الزملاء.',
          },
          immediateFeedback: [
            'تعزيز إيجابي لفظي فوري للإجابات المتميزة.',
            'توجيه تصويبي بناء ينمي ما وراء المعرفة لدى المتعلم.',
          ],
        },
        section4Environment: {
          classroomRoutines: 'روتين بدء الحصة، توزيع الأدوار التشاركية، وضبط الانتقال بين الأنشطة.',
          safeAndMotivatingClimate: 'بيئة آمنة نفسياً تحفز على المبادرة وتتقبل الخطأ كفرصة للتعلم.',
          familyPartnership: {
            cardTitle: `بطاقة شراكة أسرية: درس ${row.lessonTitle}`,
            instructions: 'متابعة نتاجات التعلم ودعم الطالب في تطبيق الأنشطة الحياتية.',
            studentTask: 'مناقشة المفاهيم المكتسبة مع الأسرة وربطها بالمنزل.',
            parentRole: 'التحفيز المستمر وتوفير البيئة الداعمة وتسجيل التوقيع في كراسة المتابعة.',
          },
        },
        section5Reflection: {
          strengthsAndImpact: [
            'تفاعل ملموس من الطلبة مع أنشطة التعلم النشط ومصادر OER.',
            'تحسن واضح في مهارات التواصل وحل المشكلات.',
          ],
          improvementOpportunities: 'تعزيز استراتيجيات تفريد التعليم وإعطاء وقت أوسع للتأمل الذاتي.',
          professionalLearningCommunities: 'مشاركة نتائج تطبيق الخطة مع معلمي المبحث في المدرسة والمديرية.',
        },
        section6Signatures: {
          teacher: {
            name: extractedPlan.teacherName || teacherName,
            date: row.startDate || '٢٠٢٦م',
            notes: 'تم تنفيذ الدرس وفق الخطة المعتمدة مع مراعاة المرونة التكيفية.',
          },
          schoolPrincipal: {
            name: extractedPlan.principalName || 'مدير المدرسة',
            date: '٢٠٢٦م',
            directives: 'مبارك الجهود، يرجى الاستمرار في تفعيل التقويم الأصيل GRASPS.',
          },
          educationalSupervisor: {
            name: extractedPlan.supervisorName || 'المشرف التربوي',
            date: '٢٠٢٦م',
            directives: 'تخطيط نوعي متميز متوافق مع معايير جودة التعليم.',
          },
        },
      };
    });

    onImportLessonsToApp(convertedPlans);
    onClose();
  };

  return (
    <div
      dir="rtl"
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200 text-right overflow-y-auto"
    >
      <div className="relative w-full max-w-5xl max-h-[94vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto">
        {/* Top Header Banner */}
        <div className="bg-linear-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between gap-3 shrink-0 border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shrink-0 shadow-md border border-white/20">
              <FileUp className="w-6 h-6 text-emerald-100" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-xl font-black font-['Tajawal'] tracking-wide">
                  استخراج وتوزيع المنهاج الدراسي من ملفات PDF وجداول المحتوى
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-amber-950 shadow-2xs">
                  ذكاء اصطناعي (AI)
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-400 text-cyan-950 shadow-2xs">
                  تقليل الإدخال اليدوي ⚡
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                ارفع جدول توزيع المحتوى (PDF / صورة / وورد) وسيقوم الذكاء الاصطناعي بتفكيك الدروس وتوزيع الحصص والأسابيع والتقويم فورياً
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-colors shrink-0"
            title="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-rose-50 border-b border-rose-200 text-rose-800 px-4 py-2.5 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-1 shrink-0">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {!extractedPlan ? (
            <>
              {/* Input Method Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setActiveTab('upload')}
                    className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeTab === 'upload'
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    <span>رفع ملف PDF أو صورة المنهاج</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('paste')}
                    className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeTab === 'paste'
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>لصق نص / جدول المنهاج</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('templates')}
                    className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeTab === 'templates'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-slate-100 text-amber-800 hover:bg-amber-50'
                    }`}
                  >
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>نماذج وجداول وزارية جاهزة (للتجربة)</span>
                  </button>
                </div>

                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  يدعم PDF، JPG، PNG، ومستندات Word
                </span>
              </div>

              {/* Tab 1: File Upload Dropzone */}
              {activeTab === 'upload' && (
                <div className="space-y-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.txt"
                    className="hidden"
                  />

                  {!uploadedFile ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                      }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                        isDragOver
                          ? 'border-emerald-500 bg-emerald-50 scale-[1.01]'
                          : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-inner">
                        <Upload className="w-8 h-8 text-emerald-700 animate-bounce" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-800 font-['Tajawal']">
                          اسحب وأفلت ملف المنهاج أو جدول التوزيع هنا، أو انقر للاختيار
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                          يدعم ملفات PDF، صور الجداول الممسوحة ضوئياً، ومستندات Word الخاصة بجداول توزيع المنهاج الصادرة عن وزارة التربية والتعليم
                        </p>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shadow-2xs">
                          📄 PDF
                        </span>
                        <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shadow-2xs">
                          🖼️ PNG / JPG
                        </span>
                        <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shadow-2xs">
                          📝 DOCX / TXT
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-emerald-50/70 border-2 border-emerald-300 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 text-sm">{fileName}</span>
                            <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-md text-[10px] font-bold">
                              جاهز للاستخراج
                            </span>
                          </div>
                          <span className="text-xs text-slate-500">{fileSizeText} • {fileMime}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          تغيير الملف
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedFile(null);
                            setFileBase64('');
                            setFileName('');
                          }}
                          className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                          title="حذف الملف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Text / Table Paste */}
              {activeTab === 'paste' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      الصق نص أو جدول توزيع المنهاج الدراسي:
                    </label>
                    {fileName && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        المصدر: {fileName}
                      </span>
                    )}
                  </div>
                  <textarea
                    rows={8}
                    value={textSnippet}
                    onChange={(e) => setTextSnippet(e.target.value)}
                    placeholder={`مثال:\nالوحدة الأولى: الأعداد والقيمة المنزلية (20 حصة)\n- الدرس الأول: قراءة الأعداد وكتابتها (5 حصص)\n- الدرس الثاني: القيمة المكانية والصورة الموسعة (5 حصص)\n- الدرس الثالث: المقارنة والترتيب (5 حصص)\n- الدرس الرابع: التقريب والمسائل الحياتية (5 حصص)\nالوحدة الثانية: الهندسة والقياس (20 حصة)...`}
                    className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden leading-relaxed font-mono"
                  />
                </div>
              )}

              {/* Tab 3: Preset Templates */}
              {activeTab === 'templates' && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-700 block">
                    اختر أحد نماذج توزيع المناهج الوزارية الفلسطينية للتجربة والاستخراج الفوري:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {SAMPLE_CURRICULUM_TEMPLATES.map((sample) => (
                      <div
                        key={sample.id}
                        onClick={() => handleSelectSample(sample)}
                        className="bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-400 rounded-2xl p-4 transition-all cursor-pointer shadow-2xs hover:shadow-md space-y-2 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-md">
                              {sample.subject}
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold">{sample.grade}</span>
                          </div>
                          <h4 className="text-xs font-black text-slate-900 font-['Tajawal']">
                            {sample.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 line-clamp-3 mt-1 leading-relaxed">
                            {sample.snippet.split('\n').slice(2, 6).join(' • ')}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
                        >
                          تحميل واستخراج هذا المنهاج ⚡
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Extraction Parameters Config Bar */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <CalendarRange className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-black text-slate-800">
                    إعدادات المبحث والتقويم المستهدف للتوزيع:
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">المبحث التعليمي</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="الرياضيات"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">الصف الدراسي</label>
                    <input
                      type="text"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      placeholder="الصف الثالث الأساسي"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">الفصل الدراسي</label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 text-xs"
                    >
                      <option value="الفصل الدراسي الأول">الفصل الدراسي الأول</option>
                      <option value="الفصل الدراسي الثاني">الفصل الدراسي الثاني</option>
                      <option value="الفصل الدراسي الثالث">الفصل الدراسي الثالث</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">الحصص أسبوعياً</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={weeklyPeriods}
                      onChange={(e) => setWeeklyPeriods(Number(e.target.value) || 5)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 text-xs text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">من تاريخ (البداية)</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs cursor-pointer font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">إلى تاريخ (النهاية)</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs cursor-pointer font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    توجيهات أو ملاحظات إضافية للذكاء الاصطناعي (اختياري):
                  </label>
                  <input
                    type="text"
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    placeholder="مثال: ركز على التعلم النشط وتطبيقات OER للمنهاج الفلسطيني ومهمات تقويم أصيل GRASPS"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Action Trigger Button */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    يقوم النموذج باستخراج كافة الوحدات والدروس وتوليد الحصص والمصادر والتقويم تلقائياً.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleStartExtraction}
                  disabled={isExtracting || (!fileBase64 && !textSnippet.trim())}
                  className="px-6 py-3 bg-linear-to-r from-emerald-600 via-teal-700 to-cyan-800 hover:from-emerald-700 hover:to-cyan-900 text-white rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-98 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-cyan-200" />
                      <span>جاري فحص وتفكيك المنهاج بالذكاء الاصطناعي...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                      <span>⚡ بدء استخراج المنهاج والتوزيع التلقائي على الخطة الفصلية</span>
                    </>
                  )}
                </button>
              </div>

              {/* Live Extraction Progress Indicator */}
              {isExtracting && (
                <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3 animate-in fade-in duration-200 border border-emerald-500/40 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-200 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      مراحل التحليل البيداغوجي للمنهاج:
                    </span>
                    <span className="text-xs font-black text-amber-300">
                      المرحلة {toArabicDigits(extractionStage)} من ٥
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[11px]">
                    <div className={`p-2 rounded-xl border transition-all ${
                      extractionStage >= 1
                        ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 font-bold'
                        : 'bg-slate-800/40 border-slate-700 text-slate-400'
                    }`}>
                      ١. 📄 فحص بنية الوثيقة
                    </div>
                    <div className={`p-2 rounded-xl border transition-all ${
                      extractionStage >= 2
                        ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 font-bold'
                        : 'bg-slate-800/40 border-slate-700 text-slate-400'
                    }`}>
                      ٢. 🔍 استخراج الوحدات والدروس
                    </div>
                    <div className={`p-2 rounded-xl border transition-all ${
                      extractionStage >= 3
                        ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 font-bold'
                        : 'bg-slate-800/40 border-slate-700 text-slate-400'
                    }`}>
                      ٣. ⏱️ توزيع الحصص والأسابيع
                    </div>
                    <div className={`p-2 rounded-xl border transition-all ${
                      extractionStage >= 4
                        ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 font-bold'
                        : 'bg-slate-800/40 border-slate-700 text-slate-400'
                    }`}>
                      ٤. 🌐 ربط مصادر OER والتقويم
                    </div>
                    <div className={`p-2 rounded-xl border transition-all ${
                      extractionStage >= 5
                        ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 font-bold'
                        : 'bg-slate-800/40 border-slate-700 text-slate-400'
                    }`}>
                      ٥. ✅ بناء الخطة المكتملة
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Extracted Plan Review & Results Drawer */
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Extraction Success Header Banner */}
              <div className="bg-linear-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 border border-white/30">
                    <CheckCircle2 className="w-7 h-7 text-emerald-200" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black font-['Tajawal']">
                        تم بنجاح استخراج وتوزيع بيانات المنهاج!
                      </h3>
                      <span className="px-2 py-0.5 bg-amber-400 text-amber-950 rounded-full text-xs font-black">
                        جاهز للاعتماد
                      </span>
                    </div>
                    <p className="text-xs text-emerald-100 mt-0.5">
                      {extractedPlan.title} • مبحث {extractedPlan.subject} ({extractedPlan.grade})
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setExtractedPlan(null);
                      setExtractionStage(0);
                    }}
                    className="px-3.5 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    استخراج ملف آخر
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmApply}
                    className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs sm:text-sm font-black shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>تطبيق وتوزيع على الخطة الفصلية الحالية</span>
                  </button>
                </div>
              </div>

              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <span className="text-[11px] text-slate-500 font-bold block mb-1">عدد الوحدات المستخرجة</span>
                  <span className="text-lg font-black text-emerald-800">
                    {toArabicDigits(new Set(extractedPlan.rows.map((r) => r.unitTitle)).size)} وحدات
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <span className="text-[11px] text-slate-500 font-bold block mb-1">إجمالي الدروس والموضوعات</span>
                  <span className="text-lg font-black text-blue-800">
                    {toArabicDigits(extractedPlan.rows.length)} درساً
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <span className="text-[11px] text-slate-500 font-bold block mb-1">إجمالي الحصص الموزعة</span>
                  <span className="text-lg font-black text-purple-800">
                    {toArabicDigits(extractedPlan.rows.reduce((sum, r) => sum + r.lessonPeriods, 0))} حصة
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <span className="text-[11px] text-slate-500 font-bold block mb-1">المدى الزمني للفصل</span>
                  <span className="text-lg font-black text-amber-800">
                    {toArabicDigits(extractedPlan.totalSemesterWeeks)} أسبوعاً
                  </span>
                </div>
              </div>

              {/* Preview Mode Switcher */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setPreviewTab('table')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    previewTab === 'table'
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  جدول توزيع الحصص التفصيلي ({toArabicDigits(extractedPlan.rows.length)})
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewTab('competencies')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    previewTab === 'competencies'
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  الكفايات العامة والنتاجات ({toArabicDigits(extractedPlan.generalCompetencies.length)})
                </button>
              </div>

              {/* Table Preview */}
              {previewTab === 'table' && (
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs max-h-96 overflow-y-auto">
                  <table className="w-full border-collapse text-right text-xs leading-relaxed">
                    <thead>
                      <tr className="bg-slate-800 text-white font-bold text-[11px]">
                        <th className="p-2 border-l border-slate-700 w-8 text-center">م</th>
                        <th className="p-2 border-l border-slate-700 min-w-[130px]">الوحدة</th>
                        <th className="p-2 border-l border-slate-700 min-w-[150px]">اسم الدرس والموضوع</th>
                        <th className="p-2 border-l border-slate-700 w-16 text-center">الحصص</th>
                        <th className="p-2 border-l border-slate-700 min-w-[130px]">المدى الزمني</th>
                        <th className="p-2 border-l border-slate-700 min-w-[130px]">مصادر التعلم (OER)</th>
                        <th className="p-2 border-l border-slate-700 min-w-[120px]">استراتيجيات التدريس</th>
                        <th className="p-2 min-w-[120px]">التقويم المستمر</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {extractedPlan.rows.map((row, idx) => (
                        <tr key={row.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                          <td className="p-2 text-center font-bold text-slate-500 border-l border-slate-200">
                            {toArabicDigits(idx + 1)}
                          </td>
                          <td className="p-2 font-bold text-emerald-950 border-l border-slate-200">
                            {row.unitTitle}
                          </td>
                          <td className="p-2 font-bold text-blue-950 border-l border-slate-200">
                            {row.lessonTitle}
                          </td>
                          <td className="p-2 text-center font-black text-emerald-800 bg-emerald-50/40 border-l border-slate-200">
                            {toArabicDigits(row.lessonPeriods)}
                          </td>
                          <td className="p-2 text-[11px] text-amber-900 border-l border-slate-200">
                            {row.timeframe}
                          </td>
                          <td className="p-2 text-[11px] text-slate-700 border-l border-slate-200">
                            {row.learningResourcesOer.slice(0, 2).join(' • ')}
                          </td>
                          <td className="p-2 text-[11px] text-slate-700 border-l border-slate-200">
                            {row.teachingStrategies.slice(0, 2).join(' • ')}
                          </td>
                          <td className="p-2 text-[11px] text-purple-900">
                            {row.assessmentMethods.slice(0, 2).join(' • ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Competencies Preview */}
              {previewTab === 'competencies' && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
                  <h4 className="font-black text-slate-800 font-['Tajawal']">الكفايات العامة المستهدفة للمنهاج:</h4>
                  <ul className="list-disc list-inside space-y-1.5 text-slate-700">
                    {extractedPlan.generalCompetencies.map((comp, cIdx) => (
                      <li key={cIdx} className="leading-relaxed">
                        {comp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Bottom Extra Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
                {onImportLessonsToApp && (
                  <button
                    type="button"
                    onClick={handleImportToLessons}
                    className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    title="تحويل كافة دروس هذا المنهاج إلى خطط دروس يومية جاهزة في المنظومة"
                  >
                    <Download className="w-4 h-4 text-indigo-200" />
                    <span>تحويل واستيراد كافة الدروس كخطط يومية ({toArabicDigits(extractedPlan.rows.length)} درساً)</span>
                  </button>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleConfirmApply}
                    className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-black shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>اعتماد وتوزيع في جدول الخطة الفصلية</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-3 sm:p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0 text-xs font-bold text-slate-600">
          <span>منظومة خبير التخطيط التربوي المعتمد • استخراج تلقائي فائق الدقة للمناهج الدراسية</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
