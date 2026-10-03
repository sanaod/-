import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  RotateCcw,
  Sparkles,
  Plus,
  Minus,
  Info,
  Layers,
  Thermometer,
  CloudRain,
  Flame,
  Snowflake,
  Calculator,
  BookOpen,
  Compass,
  Cpu,
  CheckCircle2,
  Sun,
  Droplets,
  Wind,
  Leaf,
  GraduationCap,
  HelpCircle,
  Volume2,
  Award,
  ChevronRight,
  ShieldCheck,
  HeartHandshake,
  DoorClosed,
  Wand2,
  Target,
  Check,
  Play,
  Sliders,
  Clock,
  Lightbulb,
  FileCheck,
  Grid,
  Zap,
  Activity,
  Heart,
  Eye,
  Star,
  BookmarkCheck,
  CheckSquare,
  Square,
  Circle,
  FileText,
} from 'lucide-react';
import { LessonPlan } from '../types/lessonPlan';
import { toArabicDigits } from '../utils/arabicNumerals';

interface AbacusSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: LessonPlan;
  plans?: LessonPlan[];
  onSelectPlan?: (id: string) => void;
  onUpdatePlan?: (updated: LessonPlan) => void;
}

export type SimulatorTab =
  | 'active_lesson_lab' // المختبر التفاعلي المتكيف لدرسك النشط
  | 'early_math' // الصف الأول: محسوسات الأعداد والمجموعات
  | 'abacus' // الصف الثالث وما بعده: المعداد ولوحة المنازل
  | 'ta_marbouta' // الصف الثاني: التاء المربوطة والمفتوحة
  | 'arabic_reading' // اللغة العربية: التحليل اللغوي
  | 'photosynthesis' // العلوم: البناء الضوئي
  | 'science_matter' // العلوم: حالات المادة
  | 'social_atlas' // الدراسات: تضاريس ومعالم
  | 'islamic_ethics'; // التربية الإسلامية: مواقف الآداب

// Helper to generate dynamic formative quiz matching the exact prepared lesson
function generateLessonQuiz(
  subject: string,
  grade: string,
  title: string,
  competencies?: { title: string; description: string }[]
) {
  const t = title.toLowerCase();
  const s = subject.toLowerCase();

  if (/كسر|كسور|أجزاء/i.test(t)) {
    return {
      question: `في درس «${title}»، ما الكسر الذي يمثل تظليل ٣ أجزاء من أصل ٤ أجزاء متساوية؟`,
      options: [
        { id: '1', text: '٣/٤ (ثلاثة أرباع)', correct: true },
        { id: '2', text: '٤/٣ (أربعة أثلاث)', correct: false },
        { id: '3', text: '١/٣ (ثلث واحد)', correct: false },
      ],
    };
  }
  if (/ضرب|مصفوف|جدول الضرب/i.test(t)) {
    return {
      question: `في درس «${title}»، إذا رتب معلم ٥ صفوف من المقاعد في كل صف ٦ طلاب، فما جملة الضرب التي تعبر عن ذلك؟`,
      options: [
        { id: '1', text: '٥ × ٦ = ٣٠ طالباً', correct: true },
        { id: '2', text: '٥ + ٦ = ١١ طالباً', correct: false },
        { id: '3', text: '٦ ÷ ٥ = ١ طالب', correct: false },
      ],
    };
  }
  if (/مساحة|محيط|هندسة|أشكال/i.test(t)) {
    return {
      question: `في درس «${title}»، كيف نحسب مساحة شكل مستطيل طوله ٦ سم وعرضه ٤ سم؟`,
      options: [
        { id: '1', text: 'المساحة = الطول × العرض = ٢٤ سم²', correct: true },
        { id: '2', text: 'المساحة = الطول + العرض = ١٠ سم', correct: false },
        { id: '3', text: 'المساحة = ٢ × (الطول + العرض) = ٢٠ سم', correct: false },
      ],
    };
  }
  if (/قيمة منزلية|منازل|أعداد ضمن|قراءة الأعداد/i.test(t) || (/رياض/i.test(s) && /أعداد/i.test(t))) {
    return {
      question: `في درس «${title}»، ما هي القيمة المنزلية للرقم في منزلة المئات مقارنة بمنزلة العشرات؟`,
      options: [
        { id: '1', text: 'قيمة الرقم في المئات تساوي ١٠ أضعاف قيمته في العشرات', correct: true },
        { id: '2', text: 'قيمة الرقم في المئات أصغر من قيمته في العشرات', correct: false },
        { id: '3', text: 'قيمة الرقم متساوية في جميع المنازل دون تغيير', correct: false },
      ],
    };
  }
  if (/هضم|تنفس|أجهزة|جسم|قلب|دوران|حواس|عظام|صحة/i.test(t)) {
    return {
      question: `في درس «${title}»، ما العضو أو الجهاز المسؤول عن تبادل الغازات وتزويد الدم بالأكسجين؟`,
      options: [
        { id: '1', text: 'الرئتان (الجهاز التنفسي)', correct: true },
        { id: '2', text: 'المعدة (الجهاز الهضمي)', correct: false },
        { id: '3', text: 'العضلات (الجهاز العضلي)', correct: false },
      ],
    };
  }
  if (/بناء ضوئي|نبات|ورقة|غذاء النبات/i.test(t)) {
    return {
      question: `في درس «${title}»، ما الغاز الأساسي الذي يمتصه النبات من الهواء لصنع غذائه بالبناء الضوئي؟`,
      options: [
        { id: '1', text: 'غاز ثاني أكسيد الكربون (CO2)', correct: true },
        { id: '2', text: 'غاز النيتروجين فقط', correct: false },
        { id: '3', text: 'غاز الأكسجين للتغذية', correct: false },
      ],
    };
  }
  if (/كهرباء|دارة|مصباح|بطارية|مغناطيس/i.test(t)) {
    return {
      question: `في درس «${title}»، متى يضيء المصباح الكهربائي في الدارة الكهربائية البسيطة؟`,
      options: [
        { id: '1', text: 'عندما تكون الدارة مغلقة ويسري التيار الكهربائي', correct: true },
        { id: '2', text: 'عندما تكون الدارة مفتوحة والقاطع مفصول', correct: false },
        { id: '3', text: 'بدون الحاجة لمصدر طاقة كهربائية', correct: false },
      ],
    };
  }
  if (/مادة|دورة الماء|حرارة|انصهار|تبخر/i.test(t) || /علوم/i.test(s)) {
    return {
      question: `في درس «${title}»، ماذا نسمي تحول الماء من الحالة السائلة إلى الغازية بفعل الحرارة؟`,
      options: [
        { id: '1', text: 'التبخر', correct: true },
        { id: '2', text: 'الانصهار', correct: false },
        { id: '3', text: 'التكاثف', correct: false },
      ],
    };
  }
  if (/تاء|إملاء/i.test(t)) {
    return {
      question: `في درس «${title}»، كيف ننطق التاء المربوطة (ـة / ة) عند الوقف عليها بالسكون؟`,
      options: [
        { id: '1', text: 'تنطق هاءً ساكنة (هـ)', correct: true },
        { id: '2', text: 'تنطق تاءً صريحة واضحة (ت)', correct: false },
        { id: '3', text: 'لا تلفظ بأي صوت', correct: false },
      ],
    };
  }
  if (/إنجليز|english|انجليز/i.test(s) || /english|unit/i.test(t)) {
    return {
      question: `In the lesson «${title}», which approach ensures best mastery of the targeted language skill?`,
      options: [
        { id: '1', text: 'Active communicative practice, correct pronunciation, and context application', correct: true },
        { id: '2', text: 'Rote memorization without speaking or listening', correct: false },
        { id: '3', text: 'Translating word-by-word without proper sentence structure', correct: false },
      ],
    };
  }
  if (/تكنولوجيا|حاسوب|برمجة|رقمي/i.test(s) || /خوارزمي|برمج/i.test(t)) {
    return {
      question: `في درس «${title}»، ما هو المبدأ الأساسي لبناء خوارزمية حاسوبية سليمة؟`,
      options: [
        { id: '1', text: 'تسلسل الخطوات المنطقية بوضوح للوصول من المدخلات إلى المخرجات', correct: true },
        { id: '2', text: 'تنفيذ الأوامر عشوائياً دون ترتيب محدد', correct: false },
        { id: '3', text: 'إلغاء مرحلة المعالجة والاعتماد على التخمين', correct: false },
      ],
    };
  }
  if (/إسلام|دين|قرآن|حديث/i.test(s)) {
    return {
      question: `في درس «${title}»، ما التوجيه الإسلامي والقيمة الأخلاقية الكبرى المستفادة؟`,
      options: [
        { id: '1', text: 'الالتزام بحسن الخلق والآداب ومراعاة حقوق الزملاء والمجتمع', correct: true },
        { id: '2', text: 'التصرف بفردية دون مراعاة الآخرين', correct: false },
        { id: '3', text: 'ترك الواجبات والمسؤوليات اليومية', correct: false },
      ],
    };
  }
  if (/اجتماع|فلسطين|جغرافيا|تاريخ/i.test(s) || /قدس|يافا|عكا/i.test(t)) {
    return {
      question: `في درس «${title}»، ما القيمة الوطنية المرجوة من دراسة معالم وجغرافيا وتاريخ فلسطين؟`,
      options: [
        { id: '1', text: 'التمسك بالهوية الوطنية والتراث والحفاظ على الأرض والمقدسات', correct: true },
        { id: '2', text: 'نسيان أسماء المدن والمعالم الفلسطينية', correct: false },
        { id: '3', text: 'عدم الاكتراث بالبيئة والمواقع التراثية', correct: false },
      ],
    };
  }
  if (/عرب|قراءة|لغة|نحو/i.test(s)) {
    return {
      question: `في درس «${title}»، ما الذي يميز الفكرة المحورية والأسلوب اللغوي في هذا الدرس؟`,
      options: [
        { id: '1', text: 'الدقة في توظيف المفردات والتمييز بين المعاني النحوية والصرفية', correct: true },
        { id: '2', text: 'تجاهل علامات الترقيم والحركات الإعرابية', correct: false },
        { id: '3', text: 'الحفظ العشوائي بدون تمييز نوع الكلمة', correct: false },
      ],
    };
  }
  if (competencies && competencies.length > 0) {
    const comp = competencies[0];
    return {
      question: `في درس «${title}»، كيف يتحقق نتاج: (${comp.title}) بنجاح؟`,
      options: [
        { id: '1', text: `تطبيق: ${comp.description.slice(0, 75)}... عملياً في مواقف الحياة`, correct: true },
        { id: '2', text: 'تجاهل الأنشطة العملية والتركيز فقط على التلقين النظري', correct: false },
        { id: '3', text: 'المرور السريع دون تنفيذ مهام التقييم الأصيل', correct: false },
      ],
    };
  }
  return {
    question: `في درس «${title}»، كيف تتحقق الكفاية الأساسية المستهدفة من التخطيط الصفي؟`,
    options: [
      { id: '1', text: 'توظيف المفهوم في حل المسائل الحياتية وتعميق الفهم بالأنشطة العملية', correct: true },
      { id: '2', text: 'الحفظ المجرد دون ممارسة أو تطبيق صفي', correct: false },
      { id: '3', text: 'الاكتفاء بالقراءة السطحية دون استقصاء', correct: false },
    ],
  };
}

export const AbacusSimulationModal: React.FC<AbacusSimulationModalProps> = ({
  isOpen,
  onClose,
  plan,
  plans,
  onSelectPlan,
  onUpdatePlan,
}) => {
  const subject = plan?.header?.subject || 'الرياضيات';
  const grade = plan?.header?.grade || 'الصف الثالث الأساسي';
  const lessonTitle = plan?.header?.lessonTitle || plan?.title || '';
  const periodDuration = plan?.header?.periodDurationMinutes || 40;

  // Plan sections for deep dynamic synchronization
  const reflectiveQuestions = plan?.section1?.reflectiveQuestions || (plan?.section1 as any)?.inquiryQuestions || [];
  const bigIdeas = (plan?.section1 as any)?.bigIdeas || plan?.section1?.ethicsAndSafety?.contentAccuracyAndLanguage || '';
  const competencies = plan?.section1?.integrativeCompetencies || [];
  const textbookResource = plan?.section1?.learningResources?.textbook || '';
  const tangibleMedia = plan?.section1?.learningResources?.tangibleMedia || '';
  const digitalReadiness = plan?.section1?.learningResources?.digitalReadiness || '';
  const attachedResources = plan?.attachedResources || [];
  const phase1 = plan?.section2Timeline?.[0];
  const phase2 = plan?.section2Timeline?.[1];
  const phase3 = plan?.section2Timeline?.[2];
  const phase4 = plan?.section2Timeline?.[3];
  const graspsTask = plan?.section3Assessment?.graspsTask;
  const remedialActivities = plan?.section3Assessment?.remedialActivities || [];
  const enrichmentActivities = plan?.section3Assessment?.enrichmentActivities;

  // Determine recommended simulator according to the active lesson
  const recommendedTab: SimulatorTab = 'active_lesson_lab';

  const matchingSpecializedTab = useMemo((): SimulatorTab => {
    const text = `${subject} ${grade} ${lessonTitle}`.toLowerCase();

    // Check Grade 1 early math
    if ((text.includes('أول') || text.includes('1')) && (text.includes('رياض') || text.includes('أعداد') || text.includes('مجموع'))) {
      return 'early_math';
    }

    // Check Grade 2 Ta Marbouta or spelling
    if (text.includes('ثاني') && (text.includes('عرب') || text.includes('تاء') || text.includes('قريتي') || text.includes('قراء'))) {
      return 'ta_marbouta';
    }

    // Check Science - Photosynthesis
    if (text.includes('بناء ضوئي') || text.includes('نبات') || text.includes('غذاء') || text.includes('ورقة')) {
      return 'photosynthesis';
    }

    // Check Science - Matter & Water Cycle
    if (text.includes('مادة') || text.includes('ماء') || text.includes('حرار') || text.includes('طاقة') || text.includes('علوم')) {
      return 'science_matter';
    }

    // Check Social Studies & Palestine Geography
    if (text.includes('اجتماع') || text.includes('تضاريس') || text.includes('جغرافيا') || text.includes('فلسطين') || text.includes('قدس') || text.includes('خريطة')) {
      return 'social_atlas';
    }

    // Check Islamic Studies
    if (text.includes('إسلام') || text.includes('استئذان') || text.includes('آداب') || text.includes('أخلاق') || text.includes('دين')) {
      return 'islamic_ethics';
    }

    // Check Arabic Reading & text analysis
    if (text.includes('عرب') || text.includes('قراء') || text.includes('لغ')) {
      return 'arabic_reading';
    }

    // Default Math Abacus
    return 'abacus';
  }, [subject, grade, lessonTitle]);

  const [activeTab, setActiveTab] = useState<SimulatorTab>(recommendedTab);

  // Auto-switch to the tailored tab whenever modal opens or plan changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab('active_lesson_lab');
    }
  }, [isOpen, plan?.id]);

  // =========================================================================
  // MODULE 0: Dynamic Adaptive Lesson Lab (المختبر المتكيف للدرس النشط)
  // =========================================================================
  const isMathSubject = /رياضيات|حساب|أرقام|أعداد|كسور|هندسة|ضرب|قسمة/i.test(subject) || /أعداد|منازل|قيمة|ضرب|قسمة|جمع|طرح|كسور/i.test(lessonTitle);
  const isScienceSubject = /علوم|أحياء|كيمياء|فيزياء|طبيعة/i.test(subject) || /مادة|بناء|نبات|طاقة|خلية|ماء|حرارة|أجهزة|جسم|قلب|تنفس/i.test(lessonTitle);
  const isArabicSubject = /عرب|لغة|قراءة|نصوص|إملاء/i.test(subject) || /تاء|قراءة|قصيدة|كلمات|جملة/i.test(lessonTitle);
  const isSocialSubject = /اجتماع|جغرافيا|تاريخ|وطنية/i.test(subject) || /فلسطين|خريطة|تضاريس|قدس/i.test(lessonTitle);
  const isIslamicSubject = /إسلام|دين|قرآن|حديث|تربية دينية/i.test(subject) || /آداب|استئذان|أخلاق|صلاة/i.test(lessonTitle);
  const isTechSubject = /تكنولوجيا|حاسوب|برمجة|رقمي|ذكاء/i.test(subject) || /خوارزمية|برمجة/i.test(lessonTitle);
  const isEnglishSubject = /إنجليز|english|انجليز/i.test(subject) || /english|unit|lesson/i.test(lessonTitle);
  const isUniversalSubject = !isMathSubject && !isScienceSubject && !isArabicSubject && !isSocialSubject && !isIslamicSubject && !isTechSubject && !isEnglishSubject;

  // Math sub-topic specialization
  const isMultiplication = /ضرب|مصفوف|جدول الضرب/i.test(lessonTitle) || /ضرب/i.test(subject);
  const isFractions = /كسر|كسور|أجزاء|نصف|ربع|ثلث|سدس/i.test(lessonTitle);
  const isGeometry = /هندسة|مساحة|محيط|أشكال|زوايا|مثلث|مستطيل|مربع/i.test(lessonTitle);
  const [mathSubMode, setMathSubMode] = useState<'auto' | 'place_value' | 'multiplication' | 'fractions' | 'geometry'>('auto');

  const resolvedMathMode = useMemo(() => {
    if (mathSubMode !== 'auto') return mathSubMode;
    if (isMultiplication) return 'multiplication';
    if (isFractions) return 'fractions';
    if (isGeometry) return 'geometry';
    return 'place_value';
  }, [mathSubMode, isMultiplication, isFractions, isGeometry]);

  // Science sub-topic specialization
  const isBodySystems = /جسم|أجهزة|هضمي|تنفسي|قلب|دوران|حواس|عضلات|عظام|صحة/i.test(lessonTitle);
  const isPlants = /نبات|بناء ضوئي|ورقة|غذاء النبات|جذور|ساق/i.test(lessonTitle);
  const isCircuits = /كهرباء|دارة|مصباح|بطارية|شحنات|مغناطيس/i.test(lessonTitle);
  const [scienceSubMode, setScienceSubMode] = useState<'auto' | 'states_of_matter' | 'photosynthesis' | 'body_systems' | 'circuits'>('auto');

  const resolvedScienceMode = useMemo(() => {
    if (scienceSubMode !== 'auto') return scienceSubMode;
    if (isBodySystems) return 'body_systems';
    if (isPlants) return 'photosynthesis';
    if (isCircuits) return 'circuits';
    return 'states_of_matter';
  }, [scienceSubMode, isBodySystems, isPlants, isCircuits]);

  // Dynamic interactive lesson simulation states
  const [activePhaseIndex, setActivePhaseIndex] = useState<number>(1); // Default to Phase 2 (العرض والنمذجة)
  const [interactiveQuizChoice, setInteractiveQuizChoice] = useState<string | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  // Math State
  const [mathInteractiveValue, setMathInteractiveValue] = useState<number>(() => {
    const numMatch = lessonTitle.match(/\d+/);
    if (numMatch) return parseInt(numMatch[0], 10);
    return 7830;
  });
  const [multFactorA, setMultFactorA] = useState<number>(5);
  const [multFactorB, setMultFactorB] = useState<number>(6);
  const [fractionNum, setFractionNum] = useState<number>(3);
  const [fractionDenom, setFractionDenom] = useState<number>(4);
  const [geoWidth, setGeoWidth] = useState<number>(6);
  const [geoHeight, setGeoHeight] = useState<number>(4);

  // Science State
  const [scienceSliderTemp, setScienceSliderTemp] = useState<number>(45);
  const [scienceSliderFactor, setScienceSliderFactor] = useState<number>(75);
  const [activeOrgan, setActiveOrgan] = useState<'heart' | 'lungs' | 'stomach' | 'brain' | 'kidneys'>('heart');
  const [circuitSwitchClosed, setCircuitSwitchClosed] = useState<boolean>(true);

  // Arabic State - dynamic extraction from prepared content
  const dynamicArabicWords = useMemo(() => {
    const rawWords = `${lessonTitle} ${textbookResource} ${competencies.map((c) => c.title + ' ' + c.description).join(' ')}`
      .replace(/[^\u0600-\u06FF\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !['في', 'على', 'من', 'إلى', 'عن', 'مع', 'هذا', 'هذه', 'ذلك', 'درس', 'الدرس', 'الصف', 'الفصل', 'كتاب'].includes(w));
    const unique = Array.from(new Set(rawWords));
    return unique.length > 0 ? unique.slice(0, 8) : ['القُدْسُ', 'القراءة', 'الوطن', 'المعرفة', 'التعاون'];
  }, [lessonTitle, textbookResource, competencies]);

  const [customArabicWord, setCustomArabicWord] = useState<string>(() => {
    return dynamicArabicWords[0] || 'القُدْسُ';
  });
  const [customWordInput, setCustomWordInput] = useState<string>('');

  // Social State
  const [selectedLandmarkName, setSelectedLandmarkName] = useState<string>('القدس الشريف');

  // Islamic State
  const [islamicScenarioChoice, setIslamicScenarioChoice] = useState<number | null>(null);

  // English State
  const [selectedEnglishWord, setSelectedEnglishWord] = useState<string>('Learning');

  // Universal Subject Simulator State (for any custom or unclassified subject)
  const [universalActiveStep, setUniversalActiveStep] = useState<number>(0);
  const [universalInquiryRating, setUniversalInquiryRating] = useState<number>(85);
  const [universalMasteredCompetencies, setUniversalMasteredCompetencies] = useState<Record<number, boolean>>({});

  // Exit Ticket state
  const [exitTicketRating, setExitTicketRating] = useState<number>(4);
  const [exitTicketStudentNote, setExitTicketStudentNote] = useState<string>('');
  const [hasSavedFeedback, setHasSavedFeedback] = useState<boolean>(false);

  const [studentPracticeChecks, setStudentPracticeChecks] = useState<Record<number, boolean>>({
    0: true,
    1: false,
    2: false,
  });

  // Dynamic lesson quiz matching active prepared plan
  const currentQuiz = useMemo(() => {
    return generateLessonQuiz(subject, grade, lessonTitle, competencies);
  }, [subject, grade, lessonTitle, competencies]);

  // Synchronize states automatically when lesson plan changes
  useEffect(() => {
    if (lessonTitle) {
      const numMatch = lessonTitle.match(/\d+/);
      if (numMatch) {
        setMathInteractiveValue(parseInt(numMatch[0], 10));
      }
      setInteractiveQuizChoice(null);
      setQuizFeedback(null);
      setIslamicScenarioChoice(null);
      setUniversalActiveStep(0);

      const landmarks = ['القدس', 'يافا', 'عكا', 'حيفا', 'الخليل', 'نابلس', 'أريحا', 'جبل الجرمق', 'غزة', 'بيت لحم'];
      const foundLm = landmarks.find((lm) => lessonTitle.includes(lm));
      if (foundLm) {
        setSelectedLandmarkName(foundLm === 'القدس' ? 'القدس الشريف' : foundLm);
      }
    }
  }, [lessonTitle, plan?.id]);

  useEffect(() => {
    if (dynamicArabicWords.length > 0 && !dynamicArabicWords.includes(customArabicWord)) {
      setCustomArabicWord(dynamicArabicWords[0]);
    }
  }, [dynamicArabicWords]);

  // Handle saving simulation insights to the active plan
  const handleSaveSimulationToPlan = () => {
    if (!plan || !onUpdatePlan) return;

    const note = `[توثيق المحاكي الرقمي المتكيف] تم تنفيذ محاكاة تفاعلية متطابقة مع محاور درس (${lessonTitle})، حقق الطلبة تقييماً ذاتياً بمستوى (${toArabicDigits(exitTicketRating)} نجوم)، مع استيعاب النشاط التفاعلي والنمذجة الحسية.`;

    const updatedPlan: LessonPlan = {
      ...plan,
      section5Reflection: {
        ...plan.section5Reflection,
        improvementOpportunities: plan.section5Reflection.improvementOpportunities
          ? `${plan.section5Reflection.improvementOpportunities}\n\n${note}`
          : note,
      },
    };

    onUpdatePlan(updatedPlan);
    setHasSavedFeedback(true);
    setTimeout(() => setHasSavedFeedback(false), 3000);
  };

  // =========================================================================
  // MODULE 1: Early Math & Counting Manipulatives (الصف الأول: ١ إلى ٩)
  // =========================================================================
  const [basketA, setBasketA] = useState<number>(4);
  const [basketB, setBasketB] = useState<number>(3);
  const [manipulativeType, setManipulativeType] = useState<'olives' | 'oranges' | 'stars'>('olives');

  const comparisonSymbol = basketA > basketB ? '>' : basketA < basketB ? '<' : '=';
  const comparisonText =
    basketA > basketB
      ? 'المجموعة الأولى أكبر من المجموعة الثانية'
      : basketA < basketB
      ? 'المجموعة الأولى أصغر من المجموعة الثانية'
      : 'المجموعتان متساويتان تماماً (تكافؤ)';

  // =========================================================================
  // MODULE 2: Abacus Place Value (الصف الثالث وما بعده)
  // =========================================================================
  const [ones, setOnes] = useState<number>(0);
  const [tens, setTens] = useState<number>(3);
  const [hundreds, setHundreds] = useState<number>(8);
  const [thousands, setThousands] = useState<number>(7);

  // Sync initial presets based on lesson
  useEffect(() => {
    if (lessonTitle.includes('9999') || lessonTitle.includes('قيمة منزلية')) {
      setOnes(0);
      setTens(3);
      setHundreds(8);
      setThousands(7); // 7830
    }
  }, [lessonTitle]);

  const totalAbacusValue = thousands * 1000 + hundreds * 100 + tens * 10 + ones;

  const abacusColumns = [
    {
      name: 'منزلة الآحاد',
      value: ones,
      setValue: setOnes,
      multiplier: 1,
      multiplierLabel: '×١',
      color: 'bg-rose-600',
      lightColor: 'bg-rose-50 text-rose-900 border-rose-300',
      beadColor: 'bg-rose-500 hover:bg-rose-600 text-white',
    },
    {
      name: 'منزلة العشرات',
      value: tens,
      setValue: setTens,
      multiplier: 10,
      multiplierLabel: '×١٠',
      color: 'bg-blue-600',
      lightColor: 'bg-blue-50 text-blue-900 border-blue-300',
      beadColor: 'bg-blue-500 hover:bg-blue-600 text-white',
    },
    {
      name: 'منزلة المئات',
      value: hundreds,
      setValue: setHundreds,
      multiplier: 100,
      multiplierLabel: '×١٠٠',
      color: 'bg-amber-600',
      lightColor: 'bg-amber-50 text-amber-900 border-amber-300',
      beadColor: 'bg-amber-500 hover:bg-amber-600 text-white',
    },
    {
      name: 'منزلة آحاد الآلاف',
      value: thousands,
      setValue: setThousands,
      multiplier: 1000,
      multiplierLabel: '×١٠٠٠',
      color: 'bg-emerald-600',
      lightColor: 'bg-emerald-50 text-emerald-900 border-emerald-300',
      beadColor: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    },
  ];

  // =========================================================================
  // MODULE 3: Ta Marbouta vs Open Ta Lab (الصف الثاني: التاء المربوطة والمفتوحة)
  // =========================================================================
  const initialTaWords = [
    { id: 'w1', word: 'قَرْيَة', correct: 'marbouta', testPause: 'قَرْيَهْ (هاء)', category: 'تاء مربوطة' },
    { id: 'w2', word: 'بَيْت', correct: 'maftouha', testPause: 'بَيْتْ (تاء)', category: 'تاء مفتوحة' },
    { id: 'w3', word: 'جَمِيلَة', correct: 'marbouta', testPause: 'جَمِيلَهْ (هاء)', category: 'تاء مربوطة' },
    { id: 'w4', word: 'نَبَات', correct: 'maftouha', testPause: 'نَبَاتْ (تاء)', category: 'تاء مفتوحة' },
    { id: 'w5', word: 'زَيْتُونَة', correct: 'marbouta', testPause: 'زَيْتُونَهْ (هاء)', category: 'تاء مربوطة' },
    { id: 'w6', word: 'بُيُوت', correct: 'maftouha', testPause: 'بُيُوتْ (تاء)', category: 'تاء مفتوحة' },
    { id: 'w7', word: 'شَجَرَة', correct: 'marbouta', testPause: 'شَجَرَهْ (هاء)', category: 'تاء مربوطة' },
    { id: 'w8', word: 'وَقْت', correct: 'maftouha', testPause: 'وَقْتْ (تاء)', category: 'تاء مفتوحة' },
  ];

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [testedPause, setTestedPause] = useState(false);
  const [taScore, setTaScore] = useState(0);
  const [taFeedback, setTaFeedback] = useState<string | null>(null);

  const activeTaWord = initialTaWords[currentWordIndex];

  const handleClassifyTa = (choice: 'marbouta' | 'maftouha') => {
    if (choice === activeTaWord.correct) {
      setTaScore((s) => s + 1);
      setTaFeedback(`إجابة صحيحة وممتازة! الكلمة هي (${activeTaWord.category}). عند الوقف نطقناها: ${activeTaWord.testPause}`);
    } else {
      setTaFeedback(`انتبه! عند الوقف عليها تنطق: ${activeTaWord.testPause}، إذن هي (${activeTaWord.category}).`);
    }
  };

  const handleNextTaWord = () => {
    setTestedPause(false);
    setTaFeedback(null);
    setCurrentWordIndex((prev) => (prev + 1) % initialTaWords.length);
  };

  // =========================================================================
  // MODULE 4: Photosynthesis & Plant Biology (العلوم: البناء الضوئي)
  // =========================================================================
  const [sunlightPct, setSunlightPct] = useState<number>(80);
  const [waterPct, setWaterPct] = useState<number>(75);
  const [co2Pct, setCo2Pct] = useState<number>(70);

  // Photosynthesis efficiency is limited by the minimum factor (Liebig's Law of the Minimum)
  const photosynthesisRate = Math.round(
    (Math.min(sunlightPct, waterPct, co2Pct) * 0.7 +
      ((sunlightPct + waterPct + co2Pct) / 3) * 0.3)
  );

  const plantHealth =
    photosynthesisRate > 65
      ? 'نبتة نضرة وخضراء يانعة (إنتاج غذاء وأكسجين بمعدل ممتاز)'
      : photosynthesisRate > 30
      ? 'نبتة في حالة نمو بطيء (أحد العوامل غير كافٍ)'
      : 'نبتة ذابلة ومتوقفة عن البناء الضوئي (نقص حاد في الضوء أو الماء)';

  // =========================================================================
  // MODULE 5: Matter States Lab (العلوم: حالات المادة والحرارة)
  // =========================================================================
  const [temperature, setTemperature] = useState<number>(25);
  const matterState =
    temperature <= 0 ? 'صلبة (جليد)' : temperature >= 100 ? 'غازية (بخار)' : 'سائلة (ماء)';

  // =========================================================================
  // MODULE 6: Arabic Reading Lab (اللغة العربية: قراءة القدس والمفردات)
  // =========================================================================
  const [selectedWord, setSelectedWord] = useState<string>('القُدْسُ');
  const arabicWords = [
    {
      word: 'القُدْسُ',
      root: 'ق-د-س',
      type: 'اسم علم مؤنث ومعلم وطني',
      analysis: 'مبتدأ مرفوع بالضمة، زهرة المدائن وعاصمة فلسطين الأبدية، أرض الإسراء والمعراج.',
    },
    {
      word: 'زَهْرَةُ',
      root: 'ز-ه-ر',
      type: 'اسم مفرد مؤنث (خبر)',
      analysis: 'خبر المبتدأ مرفوع، دلالة جمالية على بهاء ومكانة القدس في قلوب العرب والمسلمين.',
    },
    {
      word: 'يَتَصَاعَدُ',
      root: 'ص-ع-د',
      type: 'فعل مضارع',
      analysis: 'فعل مضارع مرفوع، يدل على حركة التسامي والارتفاع نحو سماء الوطن.',
    },
    {
      word: 'الجَرْمَقُ',
      root: 'ج-ر-م-ق',
      type: 'اسم جبل فلسطيني',
      analysis: 'أعلى قمم فلسطين بارتفاع ١٢٠٨ متراً يقع في الجليل الأعلى شمال فلسطين.',
    },
    {
      word: 'الصَّامِدُونَ',
      root: 'ص-م-د',
      type: 'جمع مذكر سالم',
      analysis: 'اسم فاعل مرفوع بالواو، يعبر عن ثبات أهل فلسطين على أرضهم ورباطهم.',
    },
  ];

  // =========================================================================
  // MODULE 7: Islamic Studies & Ethics Simulator (التربية الإسلامية: الآداب)
  // =========================================================================
  const [knockCount, setKnockCount] = useState<number>(1);
  const [standPosition, setStandPosition] = useState<'front' | 'side'>('side');
  const [identifySelf, setIdentifySelf] = useState<boolean>(true);

  const [showExportMenu, setShowExportMenu] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleExportWord = () => {
    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"><title>تقرير المحاكي التفاعلي - ${lessonTitle}</title>
      <style>body { direction: rtl; font-family: 'Traditional Arabic', Arial, sans-serif; font-size: 14pt; line-height: 1.6; padding: 20px; }</style>
      </head>
      <body>
        <h1 style="text-align:center; color:#064e3b;">تقرير المحاكي الرقمي والأداة التفاعلية</h1>
        <p style="text-align:center; font-weight:bold;">المبحث: ${subject} | الصف: ${grade} | الدرس: ${lessonTitle}</p>
        <hr/>
        <h3>وصف المحاكي والأنشطة:</h3>
        <p>هذا التقرير يوثق نشاط المحاكي التفاعلي المصمم لربط المحسوس بالمجرد وفق خطة الدرس المعتمدة.</p>
        <h3>العناصر والكفايات المرتبطة:</h3>
        <ul>
          ${competencies.map(c => `<li><b>${c.title}:</b> ${c.description}</li>`).join('')}
        </ul>
        <br/><hr/>
        <p style="text-align:center; font-size:10pt; color:#64748b;">منظومة عبقور للتخطيط التربوي - الأستاذ عبد الرحمن دويكات</p>
      </body></html>
    `;
    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `المحاكي_التفاعلي_${lessonTitle || 'درس'}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleExportText = () => {
    const textContent = `========================================\n` +
      `تقرير المحاكي الرقمي التفاعلي\n` +
      `المبحث: ${subject} | الصف: ${grade}\n` +
      `الدرس: ${lessonTitle}\n` +
      `========================================\n\n` +
      `الكفايات التعليمية:\n` +
      (competencies.map((c, i) => `${i+1}. ${c.title}: ${c.description}`).join('\n') || '') +
      `\n\n----------------------------------------\n` +
      `منظومة عبقور للتخطيط التربوي - الأستاذ عبد الرحمن دويكات`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `المحاكي_التفاعلي_${lessonTitle || 'درس'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleExportJson = () => {
    const exportData = {
      subject,
      grade,
      lessonTitle,
      competencies,
      bigIdeas,
      exportDate: '2026-10-15',
      author: 'الأستاذ عبد الرحمن دويكات'
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `المحاكي_${lessonTitle || 'درس'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setShowExportMenu(false);
  };

  const handleExportHtml = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>تقرير المحاكي التفاعلي - ${lessonTitle}</title>
<style>
  body { font-family: 'Tajawal', Arial, sans-serif; background: #f8fafc; color: #1e293b; padding: 30px; margin: 0; direction: rtl; text-align: right; }
  .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
  h1 { color: #064e3b; text-align: center; font-size: 24px; margin-bottom: 5px; }
  .meta { text-align: center; color: #0f766e; font-size: 14px; margin-bottom: 25px; font-weight: bold; }
  h3 { color: #1e3a8a; border-bottom: 2px solid #3b82f6; padding-bottom: 6px; margin-top: 25px; font-size: 16px; }
  .card { background: #f1f5f9; padding: 15px; border-radius: 12px; margin-bottom: 12px; }
  .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; }
</style>
</head>
<body>
  <div class="container">
    <h1>تقرير المحاكي الرقمي والأداة التفاعلية</h1>
    <div class="meta">المبحث: ${subject} | الصف: ${grade} | الدرس: ${lessonTitle}</div>
    
    <h3>وصف الأنشطة والمحاكي:</h3>
    <div class="card">
      <p>هذا التقرير يوثق نشاط المحاكي التفاعلي المصمم لربط المحسوس بالمجرد وفق خطة الدرس المعتمدة في منظومة عبقور للتخطيط التربوي.</p>
    </div>

    <h3>الكفايات التعليمية المرتبطة بالدرس:</h3>
    <ul>
      ${competencies.map(c => `<li><b>${c.title}:</b> ${c.description}</li>`).join('')}
    </ul>

    <div class="footer">
      منظومة عبقور للتخطيط التربوي - الأستاذ عبد الرحمن دويكات | التقرير الرقمي التفاعلي
    </div>
  </div>
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `المحاكي_${lessonTitle || 'درس'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleCopyText = () => {
    const textContent = `محاكي درس: ${lessonTitle} (${subject} - ${grade})`;
    navigator.clipboard.writeText(textContent);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
    setShowExportMenu(false);
  };

  if (!isOpen) return null;

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto text-right font-['Cairo',sans-serif]"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-4 flex flex-col max-h-[94vh]">
        {/* Top Header */}
        <div className="bg-linear-to-r from-slate-900 via-emerald-950 to-teal-900 text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600/80 rounded-2xl text-white shadow-sm border border-emerald-400/30">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold font-['Tajawal'] text-white">
                  الأداة والمختبر الرقمي التفاعلي المتوافق
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/30 text-emerald-200 border border-emerald-400/40">
                  متطابق 100% مع المحتوى المحضر
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                تطابق بيداغوجي فوري مع درس: <span className="font-bold text-white">«{lessonTitle || 'الدرس المستهدف'}»</span> — ({grade} • {subject})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick Plan Switcher if multiple plans exist */}
            {plans && plans.length > 1 && onSelectPlan && (
              <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1.5 rounded-xl border border-white/20 text-xs">
                <span className="text-emerald-300 font-bold text-[11px] hidden sm:inline">الخطة المحضرة:</span>
                <select
                  value={plan?.id}
                  onChange={(e) => onSelectPlan(e.target.value)}
                  className="bg-slate-900 text-white rounded-lg text-xs font-bold border border-slate-700 px-2 py-1 outline-none cursor-pointer max-w-[160px] sm:max-w-[200px] truncate"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Context Notice Banner */}
        <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-2 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-950 shrink-0">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              تمت موائمة المحاكي الرقمي التفاعلي بالكامل مع درس <strong className="font-bold text-emerald-900">«{lessonTitle || 'المحضر'}»</strong> وكتاب المنهاج ومراحله الأربع.
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Export All Formats Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-3 py-1 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                title="تصدير وتحميل المحاكي التفاعلي بجميع الصيغ (Word, PDF, TXT, JSON)"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>تصدير المحاكي بجميع الصيغ 📥</span>
              </button>

              {showExportMenu && (
                <div className="absolute left-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 space-y-1 text-xs font-['Tajawal'] text-slate-800">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 border-b border-slate-100">
                    اختر صيغة تحميل المحاكي:
                  </div>

                  <button
                    onClick={handleExportWord}
                    className="w-full text-right px-3 py-2 hover:bg-emerald-50 rounded-xl flex items-center gap-2 font-bold text-slate-700 transition-colors cursor-pointer"
                  >
                    <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center text-xs">W</span>
                    <span>تصدير مستند Word (.doc)</span>
                  </button>

                  <button
                    onClick={() => {
                      handlePrint();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-right px-3 py-2 hover:bg-emerald-50 rounded-xl flex items-center gap-2 font-bold text-slate-700 transition-colors cursor-pointer"
                  >
                    <span className="w-6 h-6 bg-slate-100 text-slate-700 rounded-lg flex items-center justify-center text-xs">🖨️</span>
                    <span>طباعة مباشرة / PDF (A4)</span>
                  </button>

                  <button
                    onClick={handleExportText}
                    className="w-full text-right px-3 py-2 hover:bg-emerald-50 rounded-xl flex items-center gap-2 font-bold text-slate-700 transition-colors cursor-pointer"
                  >
                    <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center text-xs">TXT</span>
                    <span>تصدير ملف نصي (.txt)</span>
                  </button>

                  <button
                    onClick={handleExportJson}
                    className="w-full text-right px-3 py-2 hover:bg-emerald-50 rounded-xl flex items-center gap-2 font-bold text-slate-700 transition-colors cursor-pointer"
                  >
                    <span className="w-6 h-6 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center text-xs">JSON</span>
                    <span>تصدير بيانات JSON (.json)</span>
                  </button>

                  <button
                    onClick={handleExportHtml}
                    className="w-full text-right px-3 py-2 hover:bg-emerald-50 rounded-xl flex items-center gap-2 font-bold text-slate-700 transition-colors cursor-pointer"
                  >
                    <span className="w-6 h-6 bg-rose-100 text-rose-700 rounded-lg flex items-center justify-center text-xs">HTML</span>
                    <span>تصدير صفحة ويب (.html)</span>
                  </button>

                  <button
                    onClick={() => {
                      handleCopyText();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-right px-3 py-2 hover:bg-emerald-50 rounded-xl flex items-center gap-2 font-bold text-slate-700 transition-colors cursor-pointer"
                  >
                    <span className="w-6 h-6 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center text-xs">📋</span>
                    <span>{copiedText ? 'تم النسخ ✓' : 'نسخ اسم وتقرير المحاكي'}</span>
                  </button>
                </div>
              )}
            </div>

            <span className="text-[11px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-lg shrink-0">
              تكامل الكفايات والمحسوسات
            </span>
          </div>
        </div>

        {/* Tab switchers - all available simulators with visual recommendation tag */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0 touch-pan-x">
          {/* 0. Dedicated Active Lesson Simulator */}
          <button
            type="button"
            onClick={() => setActiveTab('active_lesson_lab')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all ${
              activeTab === 'active_lesson_lab'
                ? 'bg-linear-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white shadow-sm ring-2 ring-emerald-400/50'
                : 'bg-emerald-50 text-emerald-950 border border-emerald-300 hover:bg-emerald-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>المختبر التفاعلي لدرسك المحضر: «{lessonTitle ? (lessonTitle.length > 22 ? lessonTitle.slice(0, 22) + '...' : lessonTitle) : 'الدرس النشط'}»</span>
            <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full shadow-2xs">
              متطابق مع خطتك
            </span>
          </button>

          {/* 1. Early Math */}
          <button
            type="button"
            onClick={() => setActiveTab('early_math')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all ${
              activeTab === 'early_math'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>محسوسات الأعداد والمجموعات (١-٩)</span>
            {matchingSpecializedTab === 'early_math' && (
              <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md font-extrabold mr-1">★ موصى به</span>
            )}
          </button>

          {/* 2. Abacus */}
          <button
            type="button"
            onClick={() => setActiveTab('abacus')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all ${
              activeTab === 'abacus'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>المعداد الرقمي ولوحة المنازل (الرياضيات)</span>
            {matchingSpecializedTab === 'abacus' && (
              <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md font-extrabold mr-1">★ موصى به</span>
            )}
          </button>

          {/* 3. Ta Marbouta Lab */}
          <button
            type="button"
            onClick={() => setActiveTab('ta_marbouta')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all ${
              activeTab === 'ta_marbouta'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>صيد وتصنيف التاء المربوطة والمفتوحة</span>
            {matchingSpecializedTab === 'ta_marbouta' && (
              <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md font-extrabold mr-1">★ موصى به</span>
            )}
          </button>

          {/* 4. Photosynthesis Lab */}
          <button
            type="button"
            onClick={() => setActiveTab('photosynthesis')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all ${
              activeTab === 'photosynthesis'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Leaf className="w-3.5 h-3.5" />
            <span>مختبر البناء الضوئي والغذاء (العلوم)</span>
            {matchingSpecializedTab === 'photosynthesis' && (
              <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md font-extrabold mr-1">★ موصى به</span>
            )}
          </button>

          {/* 5. States of Matter */}
          <button
            type="button"
            onClick={() => setActiveTab('science_matter')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all ${
              activeTab === 'science_matter'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>حالات المادة ودورة الماء</span>
            {matchingSpecializedTab === 'science_matter' && (
              <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md font-extrabold mr-1">★ موصى به</span>
            )}
          </button>

          {/* 6. Arabic Reading & Analysis */}
          <button
            type="button"
            onClick={() => setActiveTab('arabic_reading')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all ${
              activeTab === 'arabic_reading'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>مختبر القراءة والتحليل الصرفي</span>
            {matchingSpecializedTab === 'arabic_reading' && (
              <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md font-extrabold mr-1">★ موصى به</span>
            )}
          </button>

          {/* 7. Palestine Atlas */}
          <button
            type="button"
            onClick={() => setActiveTab('social_atlas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all ${
              activeTab === 'social_atlas'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>أطلس ومعالم فلسطين التفاعلي</span>
            {matchingSpecializedTab === 'social_atlas' && (
              <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md font-extrabold mr-1">★ موصى به</span>
            )}
          </button>

          {/* 8. Islamic Ethics */}
          <button
            type="button"
            onClick={() => setActiveTab('islamic_ethics')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all ${
              activeTab === 'islamic_ethics'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>محاكي الآداب الإسلامية والاستئذان</span>
            {matchingSpecializedTab === 'islamic_ethics' && (
              <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md font-extrabold mr-1">★ موصى به</span>
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* ========================================================================= */}
          {/* TAB 0: DYNAMIC ACTIVE LESSON LAB (المختبر المتكيف للدرس النشط تلقائياً)    */}
          {/* ========================================================================= */}
          {activeTab === 'active_lesson_lab' && (
            <div className="space-y-6">
              {/* Dynamic Lesson Context Header */}
              <div className="bg-linear-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-5 rounded-3xl border border-emerald-500/30 shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 bg-amber-400 text-slate-950 font-black text-xs rounded-full flex items-center gap-1 shadow-xs">
                        <Sparkles className="w-3.5 h-3.5" />
                        محاكي متكيف ذاتياً مع درسك المحضر
                      </span>
                      <span className="px-2.5 py-0.5 bg-white/15 text-emerald-200 text-xs rounded-full font-bold">
                        {grade} • {subject}
                      </span>
                      {periodDuration && (
                        <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs rounded-full font-bold border border-emerald-500/30">
                          {toArabicDigits(periodDuration)} دقيقة
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black font-['Tajawal'] text-white">
                      {lessonTitle || 'درس التحضير الصفي الحالي'}
                    </h3>
                    {competencies.length > 0 && (
                      <p className="text-xs text-emerald-200/90 leading-relaxed">
                        الكفاية المستهدفة:{' '}
                        <strong className="text-white">
                          {competencies[0]?.description || competencies[0]?.title}
                        </strong>
                      </p>
                    )}
                    {bigIdeas && (
                      <p className="text-[11px] text-slate-300 line-clamp-1">
                        الفكرة الكبرى:{' '}
                        <span className="text-emerald-200 font-semibold">{bigIdeas}</span>
                      </p>
                    )}
                  </div>

                  <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/20 text-center shrink-0 space-y-1">
                    <span className="text-[11px] text-emerald-300 block font-bold">حالة المواءمة التفاعلية</span>
                    <div className="inline-flex items-center gap-1 text-xs text-white font-extrabold bg-emerald-600/80 px-2.5 py-1 rounded-xl">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                      <span>متطابق بنسبة ١٠٠٪</span>
                    </div>
                  </div>
                </div>

                {/* 4 Phases Flow Progress Selector */}
                <div className="mt-5 pt-4 border-t border-emerald-700/50">
                  <span className="text-xs font-bold text-emerald-200 block mb-2.5">
                    مراحل سير الحصة الرباعي (انقر لتشغيل المحاكي المتوافق مع المرحلة):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { idx: 0, title: '١. التهيئة واستثارة الدافعية', icon: Clock, time: '٥ دقائق' },
                      { idx: 1, title: '٢. العرض والنمذجة والتجريب', icon: Wand2, time: '١٥ دقيقة' },
                      { idx: 2, title: '٣. الممارسة والتطبيق', icon: Target, time: '١٥ دقيقة' },
                      { idx: 3, title: '٤. التقويم وبطاقة الخروج', icon: Award, time: '٥ دقائق' },
                    ].map((step) => {
                      const StepIcon = step.icon;
                      const isActive = activePhaseIndex === step.idx;
                      return (
                        <button
                          key={step.idx}
                          type="button"
                          onClick={() => setActivePhaseIndex(step.idx)}
                          className={`p-2.5 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                            isActive
                              ? 'bg-white text-slate-900 border-white shadow-md ring-2 ring-amber-300'
                              : 'bg-white/10 text-emerald-100 border-white/15 hover:bg-white/15'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <StepIcon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-emerald-300'}`} />
                            <span className={`text-[10px] font-bold ${isActive ? 'text-emerald-800' : 'text-emerald-300'}`}>
                              {toArabicDigits(step.time)}
                            </span>
                          </div>
                          <span className="text-xs font-bold mt-1 line-clamp-1">{step.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Dynamic Workbench for Selected Phase */}
              {activePhaseIndex === 0 && (
                /* Phase 1: Warm-up */
                <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-600 text-white rounded-xl shadow-xs">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-amber-950 font-['Tajawal']">
                        مرحلة التهيئة الحافزة والربط بالتعلم السابق لدرس ({lessonTitle || subject})
                      </h4>
                      <p className="text-xs text-amber-800">
                        استثارة تفكير الطلبة، وربط المعرفة السابقة بالجديدة، وتوظيف الأسئلة التأملية المحضرة.
                      </p>
                    </div>
                  </div>

                  {/* Real Inquiry Questions from Section 1 */}
                  <div className="bg-white p-4.5 rounded-2xl border border-amber-200 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                      <span>الأسئلة التأملية المحورية للتهيئة من الخطة المحضرة:</span>
                    </div>
                    {reflectiveQuestions.length > 0 ? (
                      <div className="space-y-2">
                        {reflectiveQuestions.map((q: any, qIdx: number) => (
                          <div
                            key={qIdx}
                            className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 leading-relaxed text-sm font-bold text-slate-900"
                          >
                            «{typeof q === 'string' ? q : q.question}»
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200 leading-relaxed text-sm font-bold text-slate-900">
                        {isMathSubject
                          ? `«كيف نستخدم ${lessonTitle} في حل مشكلات حياتية في بيئتنا ومجتمعنا الفلسطيني؟»`
                          : isScienceSubject
                          ? `«ما الذي تتوقع حدوثه إذا تغيرت الظروف الطبيعية المحيطة بنا في موضوع ${lessonTitle}؟»`
                          : `«ما هو الأثر الذي يتركه تطبيق مفاهيم درس ${lessonTitle} في سلوكنا اليومي؟»`}
                      </div>
                    )}

                    {/* Teacher & Student Roles from Prepared Timeline */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <strong className="text-emerald-800 block mb-1">إجراءات وأنشطة التهيئة في خطتك:</strong>
                        <p className="text-slate-700 leading-relaxed">
                          {phase1?.teacherAndStudentActions && phase1.teacherAndStudentActions.length > 0
                            ? phase1.teacherAndStudentActions.join(' • ')
                            : 'طرح سؤال التحدي، استثارة دافعية الطلبة، وإدارة العصف الذهني التفاعلي.'}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <strong className="text-blue-800 block mb-1">الاستراتيجيات والتقويم المعتمد:</strong>
                        <p className="text-slate-700 leading-relaxed">
                          {phase1?.strategiesAndResources && phase1.strategiesAndResources.length > 0
                            ? phase1.strategiesAndResources.join(' • ')
                            : 'المشاركة النشطة، التفكير الفردي ثم المشاركة الثنائية (Think-Pair-Share)، وتدوين التوقعات.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <span className="font-semibold text-emerald-700">
                        الوسائل والمحسوسات: {phase1?.strategiesAndResources?.[0] || tangibleMedia || textbookResource || 'المحسوسات والأدوات الصفية'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setActivePhaseIndex(1)}
                        className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center gap-1 shadow-xs transition-colors"
                      >
                        الانتقال لمرحلة العرض والنمذجة
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activePhaseIndex === 1 && (
                /* Phase 2: Modeling & Interactive Simulation */
                <div className="space-y-4">
                  {/* MATHEMATICS INTERACTIVE LABS */}
                  {isMathSubject && (
                    <div className="bg-slate-50 border-2 border-emerald-300 rounded-3xl p-5 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-emerald-700 text-white rounded-xl shadow-xs">
                            <Calculator className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 font-['Tajawal']">
                              المختبر الرياضي التفاعلي لدرس: {lessonTitle}
                            </h4>
                            <p className="text-xs text-slate-600">
                              محاكاة حسية بصرية مباشرة متوافقة مع مفاهيم ونتاجات الدرس المحضر.
                            </p>
                          </div>
                        </div>

                        {/* Mode pills */}
                        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
                          <button
                            type="button"
                            onClick={() => setMathSubMode('place_value')}
                            className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                              resolvedMathMode === 'place_value' ? 'bg-emerald-700 text-white' : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            لوحة المنازل
                          </button>
                          <button
                            type="button"
                            onClick={() => setMathSubMode('multiplication')}
                            className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                              resolvedMathMode === 'multiplication' ? 'bg-emerald-700 text-white' : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            مصفوفات الضرب
                          </button>
                          <button
                            type="button"
                            onClick={() => setMathSubMode('fractions')}
                            className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                              resolvedMathMode === 'fractions' ? 'bg-emerald-700 text-white' : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            الكسور
                          </button>
                          <button
                            type="button"
                            onClick={() => setMathSubMode('geometry')}
                            className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                              resolvedMathMode === 'geometry' ? 'bg-emerald-700 text-white' : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            المساحة والمحيط
                          </button>
                        </div>
                      </div>

                      {/* Sub-widget 1: MULTIPLICATION ARRAYS */}
                      {resolvedMathMode === 'multiplication' && (
                        <div className="bg-white p-4.5 rounded-2xl border border-emerald-200 space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <span className="text-xs font-bold text-slate-800">
                              نمذجة جملة الضرب بالمصفوفات والمجموعات المتساوية:
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-emerald-800">
                                العامل الأول (الصفوف): {toArabicDigits(multFactorA)}
                              </span>
                              <input
                                type="range"
                                min={1}
                                max={10}
                                value={multFactorA}
                                onChange={(e) => setMultFactorA(Number(e.target.value))}
                                className="w-24 accent-emerald-700"
                              />
                              <span className="text-xs font-bold text-blue-800 mr-2">
                                العامل الثاني (الأعمدة): {toArabicDigits(multFactorB)}
                              </span>
                              <input
                                type="range"
                                min={1}
                                max={10}
                                value={multFactorB}
                                onChange={(e) => setMultFactorB(Number(e.target.value))}
                                className="w-24 accent-blue-700"
                              />
                            </div>
                          </div>

                          {/* Visual Grid */}
                          <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 flex flex-col items-center justify-center gap-2">
                            <div
                              className="grid gap-1.5 p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs"
                              style={{
                                gridTemplateColumns: `repeat(${multFactorB}, minmax(0, 1fr))`,
                              }}
                            >
                              {Array.from({ length: multFactorA * multFactorB }).map((_, i) => (
                                <div
                                  key={i}
                                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs hover:scale-110 transition-transform"
                                >
                                  {toArabicDigits(i + 1)}
                                </div>
                              ))}
                            </div>

                            <div className="text-center space-y-1 mt-2">
                              <div className="text-2xl font-black font-['Tajawal'] text-emerald-950">
                                {toArabicDigits(multFactorA)} × {toArabicDigits(multFactorB)} = {toArabicDigits(multFactorA * multFactorB)}
                              </div>
                              <p className="text-xs text-slate-600">
                                الخاصية التبديلية: {toArabicDigits(multFactorB)} × {toArabicDigits(multFactorA)} = {toArabicDigits(multFactorA * multFactorB)} (الناتج متماثل دائماً)
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Sub-widget 2: FRACTIONS */}
                      {resolvedMathMode === 'fractions' && (
                        <div className="bg-white p-4.5 rounded-2xl border border-emerald-200 space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <span className="text-xs font-bold text-slate-800">
                              نمذجة الكسور العادية (البسط والمقام والتمثيل البصري):
                            </span>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1.5 text-xs">
                                <span className="font-bold text-emerald-800">البسط: {toArabicDigits(fractionNum)}</span>
                                <input
                                  type="range"
                                  min={1}
                                  max={fractionDenom}
                                  value={fractionNum}
                                  onChange={(e) => setFractionNum(Math.min(Number(e.target.value), fractionDenom))}
                                  className="w-20 accent-emerald-700"
                                />
                              </div>
                              <div className="flex items-center gap-1.5 text-xs">
                                <span className="font-bold text-indigo-800">المقام: {toArabicDigits(fractionDenom)}</span>
                                <input
                                  type="range"
                                  min={2}
                                  max={12}
                                  value={fractionDenom}
                                  onChange={(e) => {
                                    const d = Number(e.target.value);
                                    setFractionDenom(d);
                                    if (fractionNum > d) setFractionNum(d);
                                  }}
                                  className="w-20 accent-indigo-700"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Linear Fraction Bar */}
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-bold text-slate-600 block">شريط الكسر الخطي:</span>
                            <div className="h-10 w-full bg-slate-100 rounded-xl overflow-hidden border border-slate-300 flex">
                              {Array.from({ length: fractionDenom }).map((_, i) => (
                                <div
                                  key={i}
                                  className={`flex-1 border-r border-white flex items-center justify-center text-xs font-bold transition-all ${
                                    i < fractionNum
                                      ? 'bg-emerald-600 text-white shadow-inner'
                                      : 'bg-slate-100 text-slate-400'
                                  }`}
                                >
                                  ١/{toArabicDigits(fractionDenom)}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center flex flex-wrap items-center justify-around gap-2 text-xs font-bold">
                            <span className="text-emerald-950 text-base">
                              الكسر: {toArabicDigits(fractionNum)} / {toArabicDigits(fractionDenom)}
                            </span>
                            <span className="text-slate-600">
                              النسبة المئوية: {toArabicDigits(Math.round((fractionNum / fractionDenom) * 100))}%
                            </span>
                            <span className="text-slate-600">
                              الأجزاء المتبقية لإكمال الواحد الصحيح: {toArabicDigits(fractionDenom - fractionNum)} / {toArabicDigits(fractionDenom)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Sub-widget 3: GEOMETRY & AREA */}
                      {resolvedMathMode === 'geometry' && (
                        <div className="bg-white p-4.5 rounded-2xl border border-emerald-200 space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <span className="text-xs font-bold text-slate-800">
                              نمذجة المساحة والمحيط للأشكال الهندسية المستوية:
                            </span>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1.5 text-xs">
                                <span className="font-bold text-emerald-800">الطول (ل): {toArabicDigits(geoWidth)} م</span>
                                <input
                                  type="range"
                                  min={2}
                                  max={12}
                                  value={geoWidth}
                                  onChange={(e) => setGeoWidth(Number(e.target.value))}
                                  className="w-20 accent-emerald-700"
                                />
                              </div>
                              <div className="flex items-center gap-1.5 text-xs">
                                <span className="font-bold text-amber-800">العرض (ض): {toArabicDigits(geoHeight)} م</span>
                                <input
                                  type="range"
                                  min={2}
                                  max={10}
                                  value={geoHeight}
                                  onChange={(e) => setGeoHeight(Number(e.target.value))}
                                  className="w-20 accent-amber-700"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Canvas Representation */}
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center min-h-[160px]">
                            <div
                              style={{
                                width: `${geoWidth * 22}px`,
                                height: `${geoHeight * 22}px`,
                              }}
                              className="border-2 border-emerald-600 bg-emerald-100/70 rounded-lg flex items-center justify-center relative shadow-sm transition-all"
                            >
                              <span className="absolute -top-5 text-[11px] font-bold text-emerald-900">
                                الطول = {toArabicDigits(geoWidth)} م
                              </span>
                              <span className="absolute -right-16 text-[11px] font-bold text-amber-900">
                                العرض = {toArabicDigits(geoHeight)} م
                              </span>
                              <span className="text-xs font-black text-emerald-950">
                                {toArabicDigits(geoWidth * geoHeight)} م²
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-center text-xs font-bold">
                            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                              <span className="text-slate-600 block mb-0.5">المساحة (الطول × العرض):</span>
                              <strong className="text-emerald-950 text-base">{toArabicDigits(geoWidth * geoHeight)} متراً مربعاً</strong>
                            </div>
                            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                              <span className="text-slate-600 block mb-0.5">المحيط (٢ × (الطول + العرض)):</span>
                              <strong className="text-amber-950 text-base">{toArabicDigits(2 * (geoWidth + geoHeight))} متراً</strong>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Sub-widget 4: PLACE VALUE & ABACUS */}
                      {resolvedMathMode === 'place_value' && (
                        <div className="space-y-4">
                          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-slate-700">العدد الحالي قيد التمثيل:</span>
                              <span className="text-3xl font-black font-['Tajawal'] text-emerald-800 tabular-nums">
                                {toArabicDigits(mathInteractiveValue)}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                              <button
                                type="button"
                                onClick={() => setMathInteractiveValue((v) => Math.max(0, v - 100))}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold"
                              >
                                - ١٠٠
                              </button>
                              <button
                                type="button"
                                onClick={() => setMathInteractiveValue((v) => Math.max(0, v - 10))}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold"
                              >
                                - ١٠
                              </button>
                              <button
                                type="button"
                                onClick={() => setMathInteractiveValue((v) => Math.max(0, v - 1))}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold"
                              >
                                - ١
                              </button>
                              <button
                                type="button"
                                onClick={() => setMathInteractiveValue((v) => Math.min(99999, v + 1))}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs"
                              >
                                + ١
                              </button>
                              <button
                                type="button"
                                onClick={() => setMathInteractiveValue((v) => Math.min(99999, v + 10))}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs"
                              >
                                + ١٠
                              </button>
                              <button
                                type="button"
                                onClick={() => setMathInteractiveValue((v) => Math.min(99999, v + 100))}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs"
                              >
                                + ١٠٠
                              </button>
                            </div>
                          </div>

                          {/* Decomposition Matrix */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                              { name: 'آحاد الآلاف', mult: 1000, color: 'bg-emerald-50 border-emerald-300 text-emerald-900', badge: 'bg-emerald-700' },
                              { name: 'المئات', mult: 100, color: 'bg-amber-50 border-amber-300 text-amber-900', badge: 'bg-amber-600' },
                              { name: 'العشرات', mult: 10, color: 'bg-blue-50 border-blue-300 text-blue-900', badge: 'bg-blue-600' },
                              { name: 'الآحاد', mult: 1, color: 'bg-rose-50 border-rose-300 text-rose-900', badge: 'bg-rose-600' },
                            ].map((col) => {
                              const digit = Math.floor((mathInteractiveValue % (col.mult * 10)) / col.mult);
                              const placeVal = digit * col.mult;
                              return (
                                <div key={col.mult} className={`p-4 rounded-2xl border-2 ${col.color} text-center space-y-2`}>
                                  <div className="flex items-center justify-between">
                                    <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${col.badge}`}>
                                      {col.name}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-bold">×{toArabicDigits(col.mult)}</span>
                                  </div>
                                  <div className="text-3xl font-black font-['Tajawal'] tabular-nums">
                                    {toArabicDigits(digit)}
                                  </div>
                                  <div className="text-xs font-bold text-slate-600 pt-1 border-t border-slate-200/60">
                                    القيمة: <strong className="text-slate-900">{toArabicDigits(placeVal)}</strong>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Expanded notation formula */}
                          <div className="p-3 bg-emerald-100/70 border border-emerald-300 rounded-xl text-center text-xs font-bold text-emerald-950 flex flex-wrap items-center justify-center gap-2">
                            <span>الصورة الموسعة:</span>
                            <span className="font-['Tajawal'] text-sm tracking-wide bg-white px-3 py-1 rounded-lg border border-emerald-300 shadow-2xs">
                              {toArabicDigits(Math.floor(mathInteractiveValue / 1000) * 1000)} +{' '}
                              {toArabicDigits(Math.floor((mathInteractiveValue % 1000) / 100) * 100)} +{' '}
                              {toArabicDigits(Math.floor((mathInteractiveValue % 100) / 10) * 10)} +{' '}
                              {toArabicDigits(mathInteractiveValue % 10)} = {toArabicDigits(mathInteractiveValue)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SCIENCE INTERACTIVE LABS */}
                  {isScienceSubject && (
                    <div className="bg-slate-50 border-2 border-cyan-300 rounded-3xl p-5 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-cyan-700 text-white rounded-xl shadow-xs">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 font-['Tajawal']">
                              المختبر العلمي الرقمي لدرس: {lessonTitle}
                            </h4>
                            <p className="text-xs text-slate-600">
                              ضبط المتغيرات التجريبية، وملاحظة الاستجابة الحيوية وتغير الحالة الفيزيائية.
                            </p>
                          </div>
                        </div>

                        {/* Science Sub-mode pills */}
                        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
                          <button
                            type="button"
                            onClick={() => setScienceSubMode('body_systems')}
                            className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                              resolvedScienceMode === 'body_systems' ? 'bg-cyan-700 text-white' : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            أجهزة الجسم
                          </button>
                          <button
                            type="button"
                            onClick={() => setScienceSubMode('states_of_matter')}
                            className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                              resolvedScienceMode === 'states_of_matter' ? 'bg-cyan-700 text-white' : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            حالات المادة
                          </button>
                          <button
                            type="button"
                            onClick={() => setScienceSubMode('photosynthesis')}
                            className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                              resolvedScienceMode === 'photosynthesis' ? 'bg-cyan-700 text-white' : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            البناء الضوئي
                          </button>
                          <button
                            type="button"
                            onClick={() => setScienceSubMode('circuits')}
                            className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                              resolvedScienceMode === 'circuits' ? 'bg-cyan-700 text-white' : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            الدارة الكهربائية
                          </button>
                        </div>
                      </div>

                      {/* Science 1: BODY SYSTEMS */}
                      {resolvedScienceMode === 'body_systems' && (
                        <div className="bg-white p-4.5 rounded-2xl border border-cyan-200 space-y-4">
                          <span className="text-xs font-bold text-slate-800 block">
                            اختر العضو أو الجهاز لاستكشاف وظيفته الحيوية وتأثيره الصحي:
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                            {[
                              { id: 'heart', name: 'القلب (الدوراني)', icon: Heart, color: 'text-rose-600 bg-rose-50 border-rose-200' },
                              { id: 'lungs', name: 'الرئتان (التنفسي)', icon: Wind, color: 'text-sky-600 bg-sky-50 border-sky-200' },
                              { id: 'stomach', name: 'المعدة (الهضمي)', icon: Activity, color: 'text-amber-600 bg-amber-50 border-amber-200' },
                              { id: 'brain', name: 'الدماغ (العصبي)', icon: Lightbulb, color: 'text-purple-600 bg-purple-50 border-purple-200' },
                              { id: 'kidneys', name: 'الكليتان (البولي)', icon: Droplets, color: 'text-teal-600 bg-teal-50 border-teal-200' },
                            ].map((org) => {
                              const OrgIcon = org.icon;
                              const isSel = activeOrgan === org.id;
                              return (
                                <button
                                  key={org.id}
                                  type="button"
                                  onClick={() => setActiveOrgan(org.id as any)}
                                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                                    isSel
                                      ? `${org.color} ring-2 ring-cyan-600 font-extrabold shadow-xs`
                                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                  }`}
                                >
                                  <OrgIcon className="w-5 h-5" />
                                  <span className="text-xs">{org.name}</span>
                                </button>
                              );
                            })}
                          </div>

                          <div className="p-4 bg-cyan-50/70 border border-cyan-200 rounded-2xl space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-black text-cyan-950 text-sm">
                                {activeOrgan === 'heart' && 'القلب - عضلة الضخ الرئيسية في الجهاز الدوراني'}
                                {activeOrgan === 'lungs' && 'الرئتان - تبادل الأكسجين وثاني أكسيد الكربون في الجهاز التنفسي'}
                                {activeOrgan === 'stomach' && 'المعدة والأمعاء - تفكيك الطعام وامتصاص العناصر المغذية'}
                                {activeOrgan === 'brain' && 'الدماغ والجهاز العصبي - مركز التحكم والتفكير والإحساس'}
                                {activeOrgan === 'kidneys' && 'الكليتان - تنقية الدم والتخلص من الفضلات والسوائل الزائدة'}
                              </span>
                              <span className="bg-cyan-200 text-cyan-900 px-2 py-0.5 rounded-full font-bold text-[10px]">
                                نتاج تعليمي معتمد
                              </span>
                            </div>
                            <p className="text-slate-700 leading-relaxed">
                              {activeOrgan === 'heart' && 'ينبض القلب بمعدل ٧٠-٨٠ نبضة في الدقيقة، ويضخ الدم المحمل بالأكسجين والغذاء لكافة خلايا الجسم. يحافظ النشاط الرياضي والغذاء الصحي قليل الدهون على كفاءة الشرايين.'}
                              {activeOrgan === 'lungs' && 'تحتوي الرئتان على ملايين الحويصلات الهوائية الدقيقة. يضمن التنفس العميق في الهواء النقي تجديد طاقة الجسم ونقاء الدورة الدموية.'}
                              {activeOrgan === 'stomach' && 'تفرز المعدة عصارات هاضمة وإنزيمات لتحويل الطعام المعقد إلى عناصر أولية يمتصها الدم لتوليد الطاقة وبناء الأنسجة.'}
                              {activeOrgan === 'brain' && 'يحتوي الدماغ على مليارات الخلايا العصبية المترابطة، وينسق حركات الجسم، الذاكرة، والاستجابة للمؤثرات البيئية المحيطة.'}
                              {activeOrgan === 'kidneys' && 'تنقي الكلى حوالي ١٨٠ لتراً من السوائل يومياً، وشرب الماء الكافي يومياً يقي الجسم من الترسبات ويحافظ على التوازن الملحي.'}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Science 2: STATES OF MATTER */}
                      {resolvedScienceMode === 'states_of_matter' && (
                        <div className="bg-white p-4.5 rounded-2xl border border-cyan-200 space-y-4">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                            <span className="flex items-center gap-1 text-rose-700">
                              <Thermometer className="w-4 h-4" />
                              درجة الحرارة / الطاقة الحرارية:
                            </span>
                            <span className="font-black text-slate-900 text-base">{toArabicDigits(scienceSliderTemp)}°م</span>
                          </div>
                          <input
                            type="range"
                            min={-10}
                            max={110}
                            value={scienceSliderTemp}
                            onChange={(e) => setScienceSliderTemp(Number(e.target.value))}
                            className="w-full accent-rose-600"
                          />

                          {/* Dynamic visual state */}
                          <div className="p-4 bg-linear-to-r from-sky-50 via-cyan-50 to-amber-50 rounded-2xl border border-cyan-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="space-y-1">
                              <span className="font-bold text-slate-700 block">الحالة الفيزيائية الحالية للمادة:</span>
                              <strong className="text-base font-black text-cyan-950 block">
                                {scienceSliderTemp <= 0 && 'الحالة الصلبة (جليد) ❄️ - جزيئات متراصة ثابتة الشكل والحجم'}
                                {scienceSliderTemp > 0 && scienceSliderTemp < 100 && 'الحالة السائلة (ماء جاري) 💧 - جزيئات حرة الحركة تأخذ شكل الإناء'}
                                {scienceSliderTemp >= 100 && 'الحالة الغازية (بخار ماء متصاعد) 💨 - جزيئات سريعة متباعدة تملأ الحيز'}
                              </strong>
                              <p className="text-slate-600">
                                {scienceSliderTemp >= 100 ? 'عملية تبخر وغليان مستمر لطبقات الجو' : scienceSliderTemp <= 0 ? 'عملية تجمد وتماسك بلوري' : 'حالة استقرار وانسياب'}
                              </p>
                            </div>
                            <span className="px-3 py-1 bg-cyan-700 text-white rounded-xl font-bold shadow-2xs">
                              {scienceSliderTemp >= 100 ? 'غازي' : scienceSliderTemp <= 0 ? 'صلب' : 'سائل'}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Science 3: PHOTOSYNTHESIS */}
                      {resolvedScienceMode === 'photosynthesis' && (
                        <div className="bg-white p-4.5 rounded-2xl border border-cyan-200 space-y-4">
                          <span className="text-xs font-bold text-slate-800 block">
                            مختبر نمو النبات وصنع الغذاء بالبناء الضوئي:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="space-y-1">
                              <div className="flex justify-between font-bold text-amber-800">
                                <span>شدة ضوء الشمس:</span>
                                <span>{toArabicDigits(scienceSliderTemp)}%</span>
                              </div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                value={scienceSliderTemp}
                                onChange={(e) => setScienceSliderTemp(Number(e.target.value))}
                                className="w-full accent-amber-600"
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between font-bold text-blue-800">
                                <span>نسبة الماء والرطوبة:</span>
                                <span>{toArabicDigits(scienceSliderFactor)}%</span>
                              </div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                value={scienceSliderFactor}
                                onChange={(e) => setScienceSliderFactor(Number(e.target.value))}
                                className="w-full accent-blue-600"
                              />
                            </div>
                          </div>

                          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center text-xs font-bold text-emerald-950">
                            معدل إنتاج الأكسجين والغذاء: {toArabicDigits(Math.round((scienceSliderTemp * scienceSliderFactor) / 100))}% • حالة الورقة:{' '}
                            {scienceSliderTemp > 30 && scienceSliderFactor > 30 ? 'نضرة خضراء يانعة 🌱' : 'شاحبة بحاجة لضوء أو ري ⚠️'}
                          </div>
                        </div>
                      )}

                      {/* Science 4: CIRCUITS */}
                      {resolvedScienceMode === 'circuits' && (
                        <div className="bg-white p-4.5 rounded-2xl border border-cyan-200 space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800">
                              نمذجة الدارة الكهربائية البسيطة:
                            </span>
                            <button
                              type="button"
                              onClick={() => setCircuitSwitchClosed(!circuitSwitchClosed)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                                circuitSwitchClosed ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-800'
                              }`}
                            >
                              القاطع: {circuitSwitchClosed ? 'مغلق (سريان التيار)' : 'مفتوح (قطع التيار)'}
                            </button>
                          </div>

                          <div className="p-5 bg-slate-900 text-white rounded-2xl flex flex-col items-center justify-center gap-3">
                            <div className={`p-4 rounded-full transition-all ${circuitSwitchClosed ? 'bg-amber-400 text-slate-950 shadow-lg ring-8 ring-amber-400/30 scale-110' : 'bg-slate-700 text-slate-400'}`}>
                              <Zap className="w-8 h-8" />
                            </div>
                            <span className="text-xs font-bold">
                              {circuitSwitchClosed ? 'المصباح مضاء 💡 - الدارة مغلقة والشحنات تسري بانتظام' : 'المصباح مطفأ ❌ - الدارة مفتوحة ولا يسري تيار'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ARABIC INTERACTIVE LAB */}
                  {isArabicSubject && (
                    <div className="bg-slate-50 border-2 border-blue-300 rounded-3xl p-5 space-y-4">
                      <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                        <div className="p-2 bg-blue-700 text-white rounded-xl shadow-xs">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 font-['Tajawal']">
                            مختبر التحليل اللغوي والمعجمي المتوافق لدرس: {lessonTitle}
                          </h4>
                          <p className="text-xs text-slate-600">
                            تطبيق القواعد الصرفية، التمييز الإملائي، وإعراب المفردات المستخلصة من درسك.
                          </p>
                        </div>
                      </div>

                      <div className="bg-white p-4.5 rounded-2xl border border-blue-200 space-y-3">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-bold text-slate-700">كلمات مستخلصة من درسك:</span>
                          {dynamicArabicWords.map((w) => (
                            <button
                              key={w}
                              type="button"
                              onClick={() => setCustomArabicWord(w)}
                              className={`px-3 py-1 rounded-lg font-bold border transition-colors ${
                                customArabicWord === w
                                  ? 'bg-blue-700 text-white border-blue-700'
                                  : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-blue-50'
                              }`}
                            >
                              {w}
                            </button>
                          ))}
                        </div>

                        {/* Interactive Word Typing Input */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
                          <input
                            type="text"
                            value={customWordInput}
                            onChange={(e) => setCustomWordInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && customWordInput.trim()) {
                                setCustomArabicWord(customWordInput.trim());
                                setCustomWordInput('');
                              }
                            }}
                            placeholder="أو اكتب أي كلمة من درسك المحضر لتحليلها..."
                            className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (customWordInput.trim()) {
                                setCustomArabicWord(customWordInput.trim());
                                setCustomWordInput('');
                              }
                            }}
                            className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors shrink-0"
                          >
                            تحليل المفردة
                          </button>
                        </div>

                        <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2 text-xs text-slate-800">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-black text-blue-900 font-['Tajawal']">
                              التحليل اللغوي لمفردة: «{customArabicWord}»
                            </span>
                            <span className="bg-blue-200 text-blue-900 px-2 py-0.5 rounded-md font-bold text-[11px]">
                              مطابق للمنهاج المحضر
                            </span>
                          </div>
                          <ul className="space-y-1.5 text-slate-700">
                            <li>• نوع الكلمة: {customArabicWord.startsWith('ال') ? 'اسم معرف بأل التعريف' : customArabicWord.endsWith('ة') ? 'اسم مؤنث بالتاء المربوطة' : 'اسم / مفردة لغوية قابلة للتحليل'}</li>
                            <li>• علامة الإعراب المتوقعة: الضمة الظاهرة في حالة الرفع، الفتحة في النصب، والكسرة في الجر</li>
                            <li>• القاعدة الإملائية: {customArabicWord.endsWith('ة') ? 'تاء مربوطة تنطق هاء عند الوقف وتاء عند الوصل' : customArabicWord.endsWith('ت') ? 'تاء مفتوحة تنطق تاء وصلاً ووقفاً' : customArabicWord.includes('أ') || customArabicWord.includes('إ') ? 'همزة قطع ظاهرة' : customArabicWord.startsWith('ال') ? 'همزة وصل تسقط في درج الكلام' : 'حروف صحيحة سالمة'}</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ISLAMIC STUDIES INTERACTIVE LAB */}
                  {isIslamicSubject && (
                    <div className="bg-slate-50 border-2 border-emerald-300 rounded-3xl p-5 space-y-4">
                      <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                        <div className="p-2 bg-emerald-700 text-white rounded-xl shadow-xs">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 font-['Tajawal']">
                            محاكي المواقف والأحكام الإسلامية لدرس: {lessonTitle}
                          </h4>
                          <p className="text-xs text-slate-600">
                            تدريب الطلبة على اتخاذ القرار الأخلاقي والتطبيقي وفق التوجيه النبوي والآداب الإسلامية.
                          </p>
                        </div>
                      </div>

                      <div className="bg-white p-4.5 rounded-2xl border border-emerald-200 space-y-3 text-xs">
                        <span className="font-bold text-slate-800 block text-sm">
                          موقف تطبيقي تفاعلي: ماذا تفعل لتطبيق آداب هذا الدرس؟
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setIslamicScenarioChoice(1)}
                            className={`p-3 rounded-xl border text-right font-bold transition-all ${
                              islamicScenarioChoice === 1
                                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-emerald-50'
                            }`}
                          >
                            أ) ألتزم بالتوجيه النبوي بحسن المعاملة والاستئذان وبدء السلام ومراعاة مشاعر الآخرين.
                          </button>
                          <button
                            type="button"
                            onClick={() => setIslamicScenarioChoice(2)}
                            className={`p-3 rounded-xl border text-right font-bold transition-all ${
                              islamicScenarioChoice === 2
                                ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-rose-50'
                            }`}
                          >
                            ب) أتصرف بتسرع دون استئذان أو اهتمام بالحقوق المشتركة.
                          </button>
                        </div>

                        {islamicScenarioChoice && (
                          <div className={`p-3 rounded-xl border font-bold text-xs ${islamicScenarioChoice === 1 ? 'bg-emerald-50 text-emerald-950 border-emerald-300' : 'bg-rose-50 text-rose-950 border-rose-300'}`}>
                            {islamicScenarioChoice === 1
                              ? 'أحسنت! هذا هو التطبيق العملي السليم الذي يحقق كفايات التربية الإسلامية ويغرس القيم النبيلة.'
                              : 'تذكر دائماً أن ديننا الحنيف يعلمنا التأدب وحسن الخلق ومراعاة النظام وحقوق الجميع.'}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* SOCIAL STUDIES INTERACTIVE LAB */}
                  {isSocialSubject && (
                    <div className="bg-slate-50 border-2 border-emerald-300 rounded-3xl p-5 space-y-4">
                      <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                        <div className="p-2 bg-emerald-700 text-white rounded-xl shadow-xs">
                          <Compass className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 font-['Tajawal']">
                            أطلس ومعالم فلسطين التفاعلي لدرس: {lessonTitle}
                          </h4>
                          <p className="text-xs text-slate-600">
                            استكشاف الجغرافيا والمعالم التراثية والربط بالهوية الوطنية الفلسطينية.
                          </p>
                        </div>
                      </div>

                      <div className="bg-white p-4.5 rounded-2xl border border-emerald-200 space-y-3 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-700">اختر معلماً أو مدينة للدراسة:</span>
                          {['القدس الشريف', 'يافا وعكا', 'جبل الجرمق', 'أريحا والبحر الميت', 'نابلس والخليل'].map((city) => (
                            <button
                              key={city}
                              type="button"
                              onClick={() => setSelectedLandmarkName(city)}
                              className={`px-3 py-1 rounded-lg font-bold border transition-colors ${
                                selectedLandmarkName === city
                                  ? 'bg-emerald-700 text-white border-emerald-700'
                                  : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-emerald-50'
                              }`}
                            >
                              {city}
                            </button>
                          ))}
                        </div>

                        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5 text-xs text-slate-800">
                          <strong className="text-sm font-black text-emerald-950 block font-['Tajawal']">
                            معلومات الموقع الجغرافي: {selectedLandmarkName}
                          </strong>
                          <p className="text-slate-700 leading-relaxed">
                            موقع تاريخي وجغرافي أصيل يعزز ثبات أبناء شعبنا على أرضهم، ويوفر للطلبة فرصة المقارنة بين السهول الساحلية والجبال الشامخة والأغوار الفلسطينية.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TECHNOLOGY INTERACTIVE LAB */}
                  {isTechSubject && (
                    <div className="bg-slate-50 border-2 border-indigo-300 rounded-3xl p-5 space-y-4">
                      <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                        <div className="p-2 bg-indigo-700 text-white rounded-xl shadow-xs">
                          <Cpu className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 font-['Tajawal']">
                            مختبر التفكير الحوسبي والبرمجة لدرس: {lessonTitle}
                          </h4>
                          <p className="text-xs text-slate-600">
                            تسلسل الخوارزميات، المنطق البرمجي، وتوظيف التكنولوجيا في حل المسائل.
                          </p>
                        </div>
                      </div>

                      <div className="bg-white p-4.5 rounded-2xl border border-indigo-200 space-y-3 text-xs">
                        <span className="font-bold text-slate-800 block">
                          مخطط تسلسل الخوارزمية التفاعلية للدرس:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center font-bold">
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-950">
                            ١. المدخلات (Input): جمع البيانات والشروط
                          </div>
                          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-950">
                            ٢. المعالجة (Process): تطبيق القواعد والتحليل
                          </div>
                          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950">
                            ٣. المخرجات (Output): إظهار النتيجة الصحيحة
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ENGLISH LANGUAGE INTERACTIVE LAB */}
                  {isEnglishSubject && (
                    <div className="bg-slate-50 border-2 border-teal-300 rounded-3xl p-5 space-y-4">
                      <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                        <div className="p-2 bg-teal-700 text-white rounded-xl shadow-xs">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 font-['Tajawal']">
                            Interactive English Language Workbench: {lessonTitle}
                          </h4>
                          <p className="text-xs text-slate-600">
                            Active vocabulary practice, contextual pronunciation, and sentence structures.
                          </p>
                        </div>
                      </div>

                      <div className="bg-white p-4.5 rounded-2xl border border-teal-200 space-y-3 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-700">Target Keywords:</span>
                          {['Lesson Vocabulary', 'Key Sentence', 'Speaking Role', 'Phonics & Pronunciation'].map((item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => setSelectedEnglishWord(item)}
                              className={`px-3 py-1 rounded-lg font-bold border transition-colors ${
                                selectedEnglishWord === item
                                  ? 'bg-teal-700 text-white border-teal-700'
                                  : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-teal-50'
                              }`}
                            >
                              {item}
                            </button>
                          ))}
                        </div>

                        <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl space-y-2 text-slate-800">
                          <strong className="text-sm font-black text-teal-950 block">
                            Contextual Practice: {selectedEnglishWord}
                          </strong>
                          <p className="text-slate-700 leading-relaxed">
                            Practice speaking and expressing ideas matching the prepared lesson objectives. Incorporates dialogic reading and communicative peer exchange.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* UNIVERSAL ADAPTIVE CONCEPT LAB (for any custom or unclassified subject) */}
                  {isUniversalSubject && (
                    <div className="bg-slate-50 border-2 border-emerald-300 rounded-3xl p-5 space-y-4">
                      <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                        <div className="p-2 bg-emerald-700 text-white rounded-xl shadow-xs">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 font-['Tajawal']">
                            المختبر التفاعلي المتكيف الشامل لدرس: {lessonTitle || subject}
                          </h4>
                          <p className="text-xs text-slate-600">
                            محاكاة تفاعلية مباشرة لخطوات الأنشطة ومؤشرات الكفايات المحضرة في خطتك الصفيّة.
                          </p>
                        </div>
                      </div>

                      {/* Interactive Step-by-Step Task Runner */}
                      <div className="bg-white p-4.5 rounded-2xl border border-emerald-200 space-y-4 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-bold text-slate-800 text-sm">
                            محاكي تنفيذ خطوات النشاط الصفي العملي خطوة بخطوة:
                          </span>
                          <span className="text-[11px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                            تطبيق إجرائي فوري
                          </span>
                        </div>

                        {/* Interactive Steps Tracker */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {[
                            {
                              step: 0,
                              title: '١. النمذجة والاستكشاف الموجه',
                              desc: phase2?.teacherAndStudentActions?.[0] || 'طرح المعلم للتطبيق العملي واستعراض الوسائل والمحسوسات مع الطلبة.',
                            },
                            {
                              step: 1,
                              title: '٢. التجريب التشاركي والمحاكاة',
                              desc: phase2?.teacherAndStudentActions?.[1] || 'قيام الطلبة بملاحظة الظاهرة، تطبيق الإجراءات وتدوين النتائج.',
                            },
                            {
                              step: 2,
                              title: '٣. الاستنتاج وصياغة المفهوم',
                              desc: phase2?.teacherAndStudentActions?.[2] || 'ربط الملاحظات بالمعرفة السابقة واستخلاص القواعد والمفاهيم الأساسية.',
                            },
                          ].map((st) => (
                            <button
                              key={st.step}
                              type="button"
                              onClick={() => setUniversalActiveStep(st.step)}
                              className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                                universalActiveStep === st.step
                                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                                  : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                              }`}
                            >
                              <strong className="block mb-1 text-xs">{st.title}</strong>
                              <p className={`line-clamp-2 text-[11px] ${universalActiveStep === st.step ? 'text-emerald-100' : 'text-slate-600'}`}>
                                {st.desc}
                              </p>
                            </button>
                          ))}
                        </div>

                        {/* Selected Step Execution Card */}
                        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-emerald-950 text-xs">
                              الإجراء العملي المحدد للخطوة المحددة في خطتك:
                            </span>
                            <span className="text-[10px] bg-white px-2 py-0.5 rounded-md font-bold text-emerald-800 border border-emerald-300">
                              الوسائل: {phase2?.strategiesAndResources?.[0] || tangibleMedia || 'المحسوسات والوسائط'}
                            </span>
                          </div>
                          <p className="text-slate-800 leading-relaxed font-medium">
                            {phase2?.teacherAndStudentActions?.[universalActiveStep] ||
                              `تنفيذ النشاط التعليمي الهادف لتحقيق مخرجات درس (${lessonTitle}) عبر تفاعل الطلبة واستكشافهم.`}
                          </p>
                        </div>

                        {/* Investigation Slider */}
                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                          <div className="flex items-center justify-between font-bold text-slate-800">
                            <span>مستوى انخراط وتفاعل المتعلمين في التجريب والملاحظة:</span>
                            <span className="text-emerald-700 font-extrabold text-sm">{toArabicDigits(universalInquiryRating)}%</span>
                          </div>
                          <input
                            type="range"
                            min={20}
                            max={100}
                            value={universalInquiryRating}
                            onChange={(e) => setUniversalInquiryRating(Number(e.target.value))}
                            className="w-full accent-emerald-700"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation to next phase */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setActivePhaseIndex(0)}
                      className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold"
                    >
                      ← العودة للتهيئة
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePhaseIndex(2)}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                    >
                      الانتقال للممارسة والتطبيق
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {activePhaseIndex === 2 && (
                /* Phase 3: Guided Practice & Collaborative Tasks */
                <div className="bg-purple-50 border-2 border-purple-300 rounded-3xl p-5 space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-purple-200">
                    <div className="p-2 bg-purple-700 text-white rounded-xl shadow-xs">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-purple-950 font-['Tajawal']">
                        مرحلة الممارسة الموجهة والتعلم التعاوني لدرس ({lessonTitle || subject})
                      </h4>
                      <p className="text-xs text-purple-800">
                        متابعة عمل المجموعات المتمايزة، تنفيذ مهمة التقويم الأصيل، وتقديم التغذية الراجعة الفورية.
                      </p>
                    </div>
                  </div>

                  {/* Real GRASPS Mission if exists */}
                  {graspsTask && (
                    <div className="bg-white p-4.5 rounded-2xl border border-purple-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-950 text-sm">
                          مهمة التقويم الأصيل GRASPS المحضرة للدرس: «{graspsTask.title}»
                        </span>
                        <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold">
                          المهمة الأدائية
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed bg-purple-50/50 p-2.5 rounded-xl border border-purple-100">
                        {graspsTask.situation || graspsTask.fullDescription}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                        <div><strong>الموقف:</strong> {graspsTask.situation}</div>
                        <div><strong>الدور:</strong> {graspsTask.role}</div>
                        <div><strong>الجمهور:</strong> {graspsTask.audience}</div>
                        <div><strong>المنتج:</strong> {graspsTask.product}</div>
                      </div>
                    </div>
                  )}

                  {/* Student Collaborative Tasks from Section 2 */}
                  <div className="bg-white p-4.5 rounded-2xl border border-purple-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 block">
                        مؤشرات إنجاز الأنشطة الجماعية وتوزيع الأدوار التعاونية:
                      </span>
                      <span className="text-[11px] bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full font-bold">
                        تكامل الكفايات
                      </span>
                    </div>

                    <div className="space-y-2">
                      {[
                        {
                          id: 0,
                          text: phase3?.teacherAndStudentActions?.[0] || 'توظيف المحسوسات والأدوات في تمثيل المفهوم وفق التعليمات المحددة.',
                        },
                        {
                          id: 1,
                          text: phase3?.teacherAndStudentActions?.[1] || 'توزيع الأدوار داخل المجموعة التعاونية (المنسق، القارئ، الكاتب، المعزز والميقاتي).',
                        },
                        {
                          id: 2,
                          text: phase3?.teacherAndStudentActions?.[2] || 'استخراج النتيجة وتدوينها في ورقة النشاط أو بطاقة التعلم بدقة وموضوعية.',
                        },
                      ].map((item) => (
                        <label
                          key={item.id}
                          className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:bg-purple-50/50 cursor-pointer text-xs font-semibold text-slate-800 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={studentPracticeChecks[item.id] || false}
                            onChange={(e) =>
                              setStudentPracticeChecks((prev) => ({
                                ...prev,
                                [item.id]: e.target.checked,
                              }))
                            }
                            className="w-4 h-4 rounded-md accent-purple-700"
                          />
                          <span>{item.text}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Remedial & Enrichment Differentiated Cards from Prepared Plan */}
                  {(remedialActivities.length > 0 || enrichmentActivities) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {remedialActivities.length > 0 && (
                        <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                            <HelpCircle className="w-4 h-4 text-amber-700" />
                            <span>خطة الدعم والمعالجة المحضرة:</span>
                          </div>
                          <strong className="block text-slate-900 font-bold">{remedialActivities[0].title}</strong>
                          <p className="text-slate-700 leading-relaxed text-[11px]">{remedialActivities[0].description}</p>
                        </div>
                      )}
                      {enrichmentActivities && (
                        <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                            <Sparkles className="w-4 h-4 text-emerald-700" />
                            <span>تحدي التميز والإثراء المحضر:</span>
                          </div>
                          <strong className="block text-slate-900 font-bold">{enrichmentActivities.title}</strong>
                          <p className="text-slate-700 leading-relaxed text-[11px]">
                            {enrichmentActivities.puzzleOrChallenge || enrichmentActivities.peerTutoring}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setActivePhaseIndex(1)}
                      className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold"
                    >
                      ← العودة للعرض والنمذجة
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePhaseIndex(3)}
                      className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                    >
                      الانتقال للتقويم وبطاقة الخروج
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {activePhaseIndex === 3 && (
                /* Phase 4: Formative Quiz & Digital Exit Ticket */
                <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-5 space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-rose-200">
                    <div className="p-2 bg-rose-700 text-white rounded-xl shadow-xs">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-rose-950 font-['Tajawal']">
                        التقويم التكويني وبطاقة الخروج الفورية لدرس: {lessonTitle}
                      </h4>
                      <p className="text-xs text-rose-800">
                        تحقق فوري من استيعاب الطلبة للنتاج التعليمي الأساسي ومواءمة التغذية الراجعة مع الخطة.
                      </p>
                    </div>
                  </div>

                  {/* Formative Question tailored to the Prepared Lesson */}
                  <div className="bg-white p-4.5 rounded-2xl border border-rose-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        السؤال التقييمي المباشر المتوافق مع نتاجات الدرس:
                      </span>
                      <span className="text-[11px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">
                        تقويم تكويني ختامي
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-900 bg-rose-50/60 p-3 rounded-xl border border-rose-200/60 leading-relaxed">
                      {currentQuiz.question}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                      {currentQuiz.options.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setInteractiveQuizChoice(opt.id);
                            if (opt.correct) {
                              setQuizFeedback('إجابة نموذجية وممتازة! تحققت كفاية الدرس بنجاح تام.');
                            } else {
                              setQuizFeedback('حاول مجدداً، تأمل في المعطيات والمحاكاة المنفذة سابقاً.');
                            }
                          }}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                            interactiveQuizChoice === opt.id
                              ? opt.correct
                                ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                                : 'bg-rose-700 text-white border-rose-700 shadow-sm'
                              : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {opt.text}
                        </button>
                      ))}
                    </div>

                    {quizFeedback && (
                      <div
                        className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                          quizFeedback.includes('ممتازة')
                            ? 'bg-emerald-50 text-emerald-950 border-emerald-300'
                            : 'bg-amber-50 text-amber-950 border-amber-300'
                        }`}
                      >
                        {quizFeedback.includes('ممتازة') ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Info className="w-4 h-4 text-amber-600 shrink-0" />
                        )}
                        <span>{quizFeedback}</span>
                      </div>
                    )}
                  </div>

                  {/* Digital Exit Ticket Card & Save to Plan */}
                  <div className="bg-white p-4.5 rounded-2xl border border-rose-200 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">
                        بطاقة الخروج الرقمية (تقييم مستوى الاستيعاب الذاتي):
                      </span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setExitTicketRating(star)}
                            className={`p-1 rounded-md transition-colors ${
                              exitTicketRating >= star ? 'text-amber-500' : 'text-slate-300'
                            }`}
                          >
                            <Star className="w-4 h-4 fill-current" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <input
                      type="text"
                      value={exitTicketStudentNote}
                      onChange={(e) => setExitTicketStudentNote(e.target.value)}
                      placeholder="ملحوظة ختامية من المعلم أو تلخيص الطالب لما تعلمه في الحصة..."
                      className="w-full p-2 border border-slate-300 rounded-xl text-xs"
                    />

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      {hasSavedFeedback ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          تم تثبيت نتائج وتأملات المحاكاة في الخطة المحضرة!
                        </span>
                      ) : (
                        <span className="text-slate-500">
                          يمكنك حفظ هذه المخرجات مباشرة في تأملات الخطة وملاحظاتها البيداغوجية.
                        </span>
                      )}

                      {onUpdatePlan && (
                        <button
                          type="button"
                          onClick={handleSaveSimulationToPlan}
                          className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <BookmarkCheck className="w-3.5 h-3.5" />
                          <span>تثبيت نتائج المحاكي في الخطة</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Direct Jump Grid to All Specialized Simulators */}
              <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  الانتقال السريع إلى المحاكيات التخصصية الأخرى المتوفرة بالمنظومة:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab('early_math')}
                    className="p-2 bg-white hover:bg-emerald-50 border border-slate-200 rounded-xl text-right font-bold text-slate-800 flex items-center gap-1.5 transition-colors"
                  >
                    <Calculator className="w-3.5 h-3.5 text-emerald-700" />
                    <span>محسوسات (١-٩)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('abacus')}
                    className="p-2 bg-white hover:bg-emerald-50 border border-slate-200 rounded-xl text-right font-bold text-slate-800 flex items-center gap-1.5 transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5 text-emerald-700" />
                    <span>المعداد ولوحة المنازل</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('ta_marbouta')}
                    className="p-2 bg-white hover:bg-emerald-50 border border-slate-200 rounded-xl text-right font-bold text-slate-800 flex items-center gap-1.5 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                    <span>التاء المربوطة والمفتوحة</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('photosynthesis')}
                    className="p-2 bg-white hover:bg-emerald-50 border border-slate-200 rounded-xl text-right font-bold text-slate-800 flex items-center gap-1.5 transition-colors"
                  >
                    <Leaf className="w-3.5 h-3.5 text-emerald-700" />
                    <span>مختبر البناء الضوئي</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('science_matter')}
                    className="p-2 bg-white hover:bg-emerald-50 border border-slate-200 rounded-xl text-right font-bold text-slate-800 flex items-center gap-1.5 transition-colors"
                  >
                    <Thermometer className="w-3.5 h-3.5 text-emerald-700" />
                    <span>حالات المادة والحرارة</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('arabic_reading')}
                    className="p-2 bg-white hover:bg-emerald-50 border border-slate-200 rounded-xl text-right font-bold text-slate-800 flex items-center gap-1.5 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                    <span>القراءة والتحليل الصرفي</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('social_atlas')}
                    className="p-2 bg-white hover:bg-emerald-50 border border-slate-200 rounded-xl text-right font-bold text-slate-800 flex items-center gap-1.5 transition-colors"
                  >
                    <Compass className="w-3.5 h-3.5 text-emerald-700" />
                    <span>أطلس فلسطين التفاعلي</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('islamic_ethics')}
                    className="p-2 bg-white hover:bg-emerald-50 border border-slate-200 rounded-xl text-right font-bold text-slate-800 flex items-center gap-1.5 transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>آداب الاستئذان الإسلامية</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 1: EARLY MATH (الصف الأول: محسوسات الأعداد والمجموعات ١-٩)            */}
          {/* ========================================================================= */}
          {activeTab === 'early_math' && (
            <div className="space-y-6">
              {/* Type Switcher */}
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-700" />
                    <span>محاكي المحسوسات وتكوين المجموعات (الصف الأول الأساسي):</span>
                  </h4>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    أداة حسية ملموسة لمساعدة الطفل على العد التصاعدي والتنازلي من 1 إلى 9، ومقارنة المجموعات.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-amber-300 text-xs">
                  <button
                    onClick={() => setManipulativeType('olives')}
                    className={`px-2.5 py-1 rounded-lg font-bold ${
                      manipulativeType === 'olives' ? 'bg-emerald-700 text-white' : 'text-slate-700'
                    }`}
                  >
                    حبات زيتون 🫒
                  </button>
                  <button
                    onClick={() => setManipulativeType('oranges')}
                    className={`px-2.5 py-1 rounded-lg font-bold ${
                      manipulativeType === 'oranges' ? 'bg-orange-600 text-white' : 'text-slate-700'
                    }`}
                  >
                    برتقال يافا 🍊
                  </button>
                  <button
                    onClick={() => setManipulativeType('stars')}
                    className={`px-2.5 py-1 rounded-lg font-bold ${
                      manipulativeType === 'stars' ? 'bg-amber-600 text-white' : 'text-slate-700'
                    }`}
                  >
                    نجوم التفوق ⭐
                  </button>
                </div>
              </div>

              {/* Two Interactive Baskets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                {/* Basket A */}
                <div className="border-2 border-emerald-300 bg-emerald-50/50 p-5 rounded-3xl flex flex-col justify-between items-center text-center space-y-4">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-emerald-900 bg-white px-3 py-1 rounded-full border border-emerald-300">
                      السلة الأولى (أ)
                    </span>
                    <span className="text-2xl font-black font-['Tajawal'] text-emerald-800 tabular-nums">
                      العدد: {toArabicDigits(basketA)}
                    </span>
                  </div>

                  {/* Visual Items Canvas */}
                  <div className="min-h-[120px] w-full bg-white rounded-2xl border-2 border-dashed border-emerald-300 p-4 flex flex-wrap items-center justify-center gap-3">
                    {basketA === 0 ? (
                      <span className="text-xs text-slate-400 font-medium">سلة فارغة (العدد صفر)</span>
                    ) : (
                      Array.from({ length: basketA }).map((_, i) => (
                        <div
                          key={i}
                          className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-2xl shadow-xs transition-transform hover:scale-110 cursor-pointer"
                        >
                          {manipulativeType === 'olives' ? '🫒' : manipulativeType === 'oranges' ? '🍊' : '⭐'}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-2 w-full">
                    <button
                      onClick={() => setBasketA((c) => Math.max(0, c - 1))}
                      className="flex-1 py-2 bg-white hover:bg-slate-100 rounded-xl border border-slate-300 text-slate-800 font-bold flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <Minus className="w-4 h-4 text-rose-600" />
                      <span>إنقاص (١)</span>
                    </button>
                    <button
                      onClick={() => setBasketA((c) => Math.min(9, c + 1))}
                      className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 rounded-xl text-white font-bold flex items-center justify-center gap-1 shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة (١)</span>
                    </button>
                  </div>
                </div>

                {/* Basket B */}
                <div className="border-2 border-blue-300 bg-blue-50/50 p-5 rounded-3xl flex flex-col justify-between items-center text-center space-y-4">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-blue-900 bg-white px-3 py-1 rounded-full border border-blue-300">
                      السلة الثانية (ب)
                    </span>
                    <span className="text-2xl font-black font-['Tajawal'] text-blue-800 tabular-nums">
                      العدد: {toArabicDigits(basketB)}
                    </span>
                  </div>

                  {/* Visual Items Canvas */}
                  <div className="min-h-[120px] w-full bg-white rounded-2xl border-2 border-dashed border-blue-300 p-4 flex flex-wrap items-center justify-center gap-3">
                    {basketB === 0 ? (
                      <span className="text-xs text-slate-400 font-medium">سلة فارغة (العدد صفر)</span>
                    ) : (
                      Array.from({ length: basketB }).map((_, i) => (
                        <div
                          key={i}
                          className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-300 flex items-center justify-center text-2xl shadow-xs transition-transform hover:scale-110 cursor-pointer"
                        >
                          {manipulativeType === 'olives' ? '🫒' : manipulativeType === 'oranges' ? '🍊' : '⭐'}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-2 w-full">
                    <button
                      onClick={() => setBasketB((c) => Math.max(0, c - 1))}
                      className="flex-1 py-2 bg-white hover:bg-slate-100 rounded-xl border border-slate-300 text-slate-800 font-bold flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <Minus className="w-4 h-4 text-rose-600" />
                      <span>إنقاص (١)</span>
                    </button>
                    <button
                      onClick={() => setBasketB((c) => Math.min(9, c + 1))}
                      className="flex-1 py-2 bg-blue-700 hover:bg-blue-800 rounded-xl text-white font-bold flex items-center justify-center gap-1 shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة (١)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Comparison Card (أكبر من / أصغر من / يساوي) */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-emerald-300 block mb-1">المقارنة المنطقية بين المجموعتين:</span>
                  <div className="text-lg font-bold">{comparisonText}</div>
                </div>
                <div className="flex items-center gap-4 bg-white/10 px-5 py-2.5 rounded-2xl">
                  <span className="text-2xl font-black text-emerald-400 tabular-nums">{toArabicDigits(basketA)}</span>
                  <span className="text-3xl font-black text-amber-300">{comparisonSymbol}</span>
                  <span className="text-2xl font-black text-blue-400 tabular-nums">{toArabicDigits(basketB)}</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: ABACUS & PLACE VALUE (الصف الثالث: القيمة المنزلية ضمن ٩٩٩٩)        */}
          {/* ========================================================================= */}
          {activeTab === 'abacus' && (
            <div className="space-y-6">
              {/* Presets */}
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-emerald-600" />
                  أمثلة واردة في خطة درس القيمة المنزلية (بالأرقام المشرقية):
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setOnes(0);
                      setTens(3);
                      setHundreds(8);
                      setThousands(7);
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 transition-colors shadow-2xs"
                  >
                    ٧٨٣٠ (مخيم الفارعة)
                  </button>
                  <button
                    onClick={() => {
                      setOnes(8);
                      setTens(0);
                      setHundreds(2);
                      setThousands(1);
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 transition-colors shadow-2xs"
                  >
                    ١٢٠٨ (جبل الجرمق)
                  </button>
                  <button
                    onClick={() => {
                      setOnes(2);
                      setTens(7);
                      setHundreds(5);
                      setThousands(3);
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 transition-colors shadow-2xs"
                  >
                    ٣٥٧٢ (نشاط الكتاب)
                  </button>
                  <button
                    onClick={() => {
                      setOnes(0);
                      setTens(0);
                      setHundreds(0);
                      setThousands(0);
                    }}
                    className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 rounded-lg text-xs font-bold text-slate-700 transition-colors"
                  >
                    تصفير
                  </button>
                </div>
              </div>

              {/* Total Display */}
              <div className="bg-linear-to-r from-emerald-900 to-teal-900 text-white p-5 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-emerald-200 block mb-1">العدد الإجمالي المتشكل على المعداد:</span>
                  <div className="text-3xl sm:text-4xl font-black font-['Tajawal'] tracking-wider text-white">
                    {toArabicDigits(totalAbacusValue)}
                  </div>
                </div>

                <div className="text-xs bg-white/10 px-4 py-2.5 rounded-xl backdrop-blur-xs space-y-1">
                  <div className="font-semibold text-emerald-200">الصورة الموسعة للعدد:</div>
                  <div className="font-bold text-sm text-white">
                    {toArabicDigits(ones)} + {toArabicDigits(tens * 10)} + {toArabicDigits(hundreds * 100)} + {toArabicDigits(thousands * 1000)} = {toArabicDigits(totalAbacusValue)}
                  </div>
                </div>
              </div>

              {/* Columns Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {abacusColumns.map((col, index) => (
                  <div
                    key={index}
                    className={`border-2 rounded-2xl p-3.5 flex flex-col items-center justify-between text-center ${col.lightColor} shadow-2xs`}
                  >
                    <div className="w-full pb-2 border-b border-slate-200/60 mb-2">
                      <span className="text-xs font-bold block">{col.name}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">{col.multiplierLabel}</span>
                    </div>

                    <div className="text-2xl font-black font-['Tajawal'] my-1">
                      {toArabicDigits(col.value)}
                    </div>

                    <div className="text-[11px] font-bold text-slate-600 mb-3">
                      القيمة: {toArabicDigits(col.value * col.multiplier)}
                    </div>

                    <div className="flex items-center gap-1.5 w-full">
                      <button
                        type="button"
                        onClick={() => col.setValue(Math.max(0, col.value - 1))}
                        className="flex-1 py-1.5 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 flex items-center justify-center font-bold text-slate-700 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => col.setValue(Math.min(9, col.value + 1))}
                        className={`flex-1 py-1.5 rounded-lg flex items-center justify-center font-bold transition-colors ${col.beadColor}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: TA MARBOUTA VS OPEN TA (الصف الثاني: التاء المربوطة والمفتوحة)     */}
          {/* ========================================================================= */}
          {activeTab === 'ta_marbouta' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-700" />
                    <span>مختبر صيد وتصنيف التاء المربوطة والمفتوحة (الصف الثاني):</span>
                  </h4>
                  <p className="text-[11px] text-blue-800 mt-0.5">
                    قاعدة صوتية سحرية: قف على الكلمة بالسكون، إذا نُطقت (هاء) فهي تاء مربوطة (ـة / ة)، وإذا بقيت (تاء) فهي تاء مفتوحة (ت).
                  </p>
                </div>
                <div className="text-xs font-bold bg-white text-blue-900 px-3 py-1.5 rounded-xl border border-blue-300">
                  مجموع النقاط: {toArabicDigits(taScore)} ⭐
                </div>
              </div>

              {/* Main Classification Arena */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 text-center space-y-5">
                <span className="text-xs text-slate-400">الكلمة المستهدفة الحالية:</span>
                <div className="text-4xl sm:text-5xl font-black font-['Tajawal'] text-amber-300 tracking-wider">
                  {activeTaWord.word}
                </div>

                {/* Pause Test Feature */}
                <div>
                  <button
                    onClick={() => setTestedPause(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-all shadow-md"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>اختبار الوقف بالسكون (استمع للصوت)</span>
                  </button>

                  {testedPause && (
                    <div className="mt-3 p-3 bg-white/10 rounded-2xl max-w-md mx-auto text-sm text-emerald-200 font-bold border border-white/20">
                      عند الوقف عليها بالسكون: «{activeTaWord.testPause}»
                    </div>
                  )}
                </div>

                {/* Choice Buttons (Two Baskets) */}
                <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto pt-2">
                  <button
                    onClick={() => handleClassifyTa('marbouta')}
                    className="p-4 bg-linear-to-b from-purple-800 to-indigo-900 hover:from-purple-700 hover:to-indigo-800 rounded-2xl border-2 border-purple-400 text-white font-bold transition-transform hover:scale-105 shadow-md space-y-1"
                  >
                    <div className="text-2xl">🧺 (ـة / ة)</div>
                    <div className="text-sm">سلة التاء المربوطة</div>
                  </button>

                  <button
                    onClick={() => handleClassifyTa('maftouha')}
                    className="p-4 bg-linear-to-b from-teal-800 to-emerald-900 hover:from-teal-700 hover:to-emerald-800 rounded-2xl border-2 border-teal-400 text-white font-bold transition-transform hover:scale-105 shadow-md space-y-1"
                  >
                    <div className="text-2xl">🧺 (ت)</div>
                    <div className="text-sm">سلة التاء المفتوحة</div>
                  </button>
                </div>

                {/* Feedback & Next */}
                {taFeedback && (
                  <div className="p-3 bg-emerald-950/80 border border-emerald-400 text-emerald-200 rounded-xl text-xs font-bold max-w-lg mx-auto flex items-center justify-between gap-3">
                    <span>{taFeedback}</span>
                    <button
                      onClick={handleNextTaWord}
                      className="px-3 py-1 bg-white text-slate-900 rounded-lg text-xs font-black shrink-0 hover:bg-slate-200"
                    >
                      الكلمة التالية ❯
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: PHOTOSYNTHESIS (العلوم: البناء الضوئي وصنع الغذاء في النبات)      */}
          {/* ========================================================================= */}
          {activeTab === 'photosynthesis' && (
            <div className="space-y-6">
              {/* Header card */}
              <div className="bg-linear-to-r from-emerald-900 to-teal-900 text-white p-5 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-emerald-200 block mb-1">مختبر مصنع الغذاء في الورقة الخضراء:</span>
                  <div className="text-2xl font-black font-['Tajawal'] text-white">
                    كفاءة البناء الضوئي: {toArabicDigits(photosynthesisRate)}٪
                  </div>
                  <p className="text-xs text-emerald-200 mt-1">{plantHealth}</p>
                </div>

                <div className="text-right text-xs bg-white/10 px-4 py-2.5 rounded-xl backdrop-blur-xs space-y-1">
                  <div className="text-emerald-200 font-semibold">المعادلة الكيميائية الحيوية:</div>
                  <div className="font-bold text-white">
                    ضوء الشمس + ماء + ثاني أكسيد الكربون ➔ سكر (غلوكوز) + أكسجين
                  </div>
                </div>
              </div>

              {/* Sliders Grid: 3 Factors */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Sunlight */}
                <div className="bg-amber-50/70 border border-amber-300 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                    <span className="flex items-center gap-1.5">
                      <Sun className="w-4 h-4 text-amber-600" />
                      شدة ضوء الشمس:
                    </span>
                    <span>{toArabicDigits(sunlightPct)}٪</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={sunlightPct}
                    onChange={(e) => setSunlightPct(Number(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <span className="text-[10px] text-amber-800 block">
                    يمتصه صبغ الكلوروفيل في البلاستيدات الخضراء.
                  </span>
                </div>

                {/* 2. Water */}
                <div className="bg-blue-50/70 border border-blue-300 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                    <span className="flex items-center gap-1.5">
                      <Droplets className="w-4 h-4 text-blue-600" />
                      كمية الماء الممتصة:
                    </span>
                    <span>{toArabicDigits(waterPct)}٪</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={waterPct}
                    onChange={(e) => setWaterPct(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <span className="text-[10px] text-blue-800 block">
                    تمتصه الشعيرات الجذرية وينقله الخشب إلى الأوراق.
                  </span>
                </div>

                {/* 3. CO2 */}
                <div className="bg-teal-50/70 border border-teal-300 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-teal-900">
                    <span className="flex items-center gap-1.5">
                      <Wind className="w-4 h-4 text-teal-600" />
                      ثاني أكسيد الكربون (CO2):
                    </span>
                    <span>{toArabicDigits(co2Pct)}٪</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={co2Pct}
                    onChange={(e) => setCo2Pct(Number(e.target.value))}
                    className="w-full accent-teal-600 cursor-pointer"
                  />
                  <span className="text-[10px] text-teal-800 block">
                    يدخل عبر الثغور التنفسية المنتشرة في سطح الورقة.
                  </span>
                </div>
              </div>

              {/* Plant Visual Chamber */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-right space-y-2 flex-1">
                  <span className="text-xs text-emerald-400 font-bold">مخرجات المصنع الحيوي:</span>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-white/10 rounded-xl border border-white/20">
                      <span className="text-slate-300 block">سكر الغلوكوز (الغذاء):</span>
                      <strong className="text-lg text-amber-300">{toArabicDigits(photosynthesisRate)} غ/ساعة</strong>
                    </div>
                    <div className="p-3 bg-white/10 rounded-xl border border-white/20">
                      <span className="text-slate-300 block">غاز الأكسجين الصاعد:</span>
                      <strong className="text-lg text-cyan-300">{toArabicDigits(photosynthesisRate * 1.2)} مل/دقيقة</strong>
                    </div>
                  </div>
                </div>

                {/* Plant Icon Graphic */}
                <div className="w-28 h-28 rounded-full border-4 border-emerald-500 bg-emerald-950/60 flex items-center justify-center text-5xl shrink-0 shadow-lg">
                  {photosynthesisRate > 65 ? '🌿' : photosynthesisRate > 30 ? '🌱' : '🥀'}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: STATES OF MATTER (العلوم: حالات المادة وتغيرات الحرارة)            */}
          {/* ========================================================================= */}
          {activeTab === 'science_matter' && (
            <div className="space-y-6">
              <div className="bg-linear-to-r from-blue-900 to-teal-900 text-white p-5 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-blue-200 block mb-1">الحالة الفيزيائية للمادة:</span>
                  <div className="text-2xl sm:text-3xl font-black font-['Tajawal'] text-white flex items-center gap-2">
                    {matterState === 'صلبة (جليد)' && <Snowflake className="w-7 h-7 text-cyan-300" />}
                    {matterState === 'سائلة (ماء)' && <CloudRain className="w-7 h-7 text-blue-300" />}
                    {matterState === 'غازية (بخار)' && <Flame className="w-7 h-7 text-amber-300" />}
                    <span>{matterState}</span>
                  </div>
                </div>

                <div className="text-right text-xs bg-white/10 px-4 py-2 rounded-xl backdrop-blur-xs">
                  <div className="text-blue-200">درجة الحرارة الحالية:</div>
                  <div className="text-2xl font-black text-white font-['Tajawal']">
                    {toArabicDigits(temperature)} °س
                  </div>
                </div>
              </div>

              {/* Temperature Slider */}
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Thermometer className="w-4 h-4 text-rose-600" />
                    التحكم في درجة الحرارة (التسخين والتبريد):
                  </span>
                  <span>{toArabicDigits(temperature)} درجة مئوية</span>
                </div>

                <input
                  type="range"
                  min={-20}
                  max={120}
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />

                <div className="flex justify-between text-[11px] text-slate-500 font-semibold pt-1">
                  <span>-٢٠ °س (تجمد تام)</span>
                  <span>٠ °س (درجة الانصهار)</span>
                  <span>١٠٠ °س (درجة الغليان والتبخر)</span>
                </div>
              </div>

              {/* Visual Simulated Beaker */}
              <div className="border-2 border-slate-300 rounded-2xl p-6 bg-slate-900 text-white text-center space-y-3 relative overflow-hidden min-h-[160px] flex flex-col justify-center items-center">
                <div className="text-sm font-bold text-emerald-300">
                  {matterState === 'صلبة (جليد)' && 'المادة في حالة صلبة: الجسيمات متقاربة جداً وتهتز في مكانها، الشكل والحجم ثابتان.'}
                  {matterState === 'سائلة (ماء)' && 'المادة في حالة سائلة: الجسيمات تنزلق فوق بعضها البعض، تأخذ شكل الوعاء والحجم ثابت.'}
                  {matterState === 'غازية (بخار)' && 'المادة في حالة غازية: الجسيمات متباعدة جداً وتتحرك بحرية وسرعة هائلة وتنتشر في الفضاء.'}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setTemperature(-10)}
                    className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 rounded-lg text-xs font-bold text-white flex items-center gap-1"
                  >
                    <Snowflake className="w-3.5 h-3.5" />
                    تبريد (جليد)
                  </button>
                  <button
                    onClick={() => setTemperature(25)}
                    className="px-3 py-1.5 bg-teal-700 hover:bg-teal-600 rounded-lg text-xs font-bold text-white flex items-center gap-1"
                  >
                    <CloudRain className="w-3.5 h-3.5" />
                    درجة الغرفة (ماء)
                  </button>
                  <button
                    onClick={() => setTemperature(105)}
                    className="px-3 py-1.5 bg-rose-700 hover:bg-rose-600 rounded-lg text-xs font-bold text-white flex items-center gap-1"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    تسخين وغليان (بخار)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: ARABIC READING & TEXT ANALYSIS (اللغة العربية: القراءة والنصوص)    */}
          {/* ========================================================================= */}
          {activeTab === 'arabic_reading' && (
            <div className="space-y-5">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  اختر كلمة من الدرس للتحليل الصرفي والدلالي والنحوي:
                </span>
                <div className="flex flex-wrap gap-2">
                  {arabicWords.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedWord(item.word)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        selectedWord === item.word
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {item.word}
                    </button>
                  ))}
                </div>
              </div>

              {(() => {
                const currentObj = arabicWords.find((w) => w.word === selectedWord) || arabicWords[0];
                return (
                  <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-xs text-slate-400">الكلمة المستهدفة:</span>
                        <div className="text-2xl font-black text-slate-900 font-['Tajawal']">
                          {currentObj.word}
                        </div>
                      </div>
                      <div className="text-left text-xs bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-200 font-bold">
                        الجذر اللغوي: {currentObj.root}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <strong className="text-slate-700 block mb-1">نوع الكلمة:</strong>
                        <span>{currentObj.type}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <strong className="text-slate-700 block mb-1">التحليل والسياق الدلالي:</strong>
                        <span>{currentObj.analysis}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 7: PALESTINE ATLAS & GEOGRAPHY (الدراسات الاجتماعية: التضاريس)        */}
          {/* ========================================================================= */}
          {activeTab === 'social_atlas' && (
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-3 shadow-2xs">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-600" />
                  أبرز معالم وتضاريس فلسطين الواردة في المناهج المعتمدة:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                    <strong className="text-emerald-950 font-bold block">جبل الجرمق (أعلى قمة في فلسطين)</strong>
                    <p className="text-slate-700">ارتفاعه ١٢٠٨ متراً يقع في الجليل الأعلى شمال فلسطين، مغطى بأشجار البلوط والسنديان.</p>
                  </div>
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                    <strong className="text-emerald-950 font-bold block">مخيم الفارعة (شمال شرق نابلس)</strong>
                    <p className="text-slate-700">يبلغ عدد سكانه ٧٨٣٠ نسمة بالقرب من ينابيع وادي الفارعة الخصبة.</p>
                  </div>
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                    <strong className="text-emerald-950 font-bold block">القدس الشريف (زهرة المدائن)</strong>
                    <p className="text-slate-700">العاصمة التاريخية والأبدية لدولة فلسطين، تضم المسجد الأقصى المبارك وكنيسة القيامة.</p>
                  </div>
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                    <strong className="text-emerald-950 font-bold block">البحر الميت (أخفض نقطة في العالم)</strong>
                    <p className="text-slate-700">ينخفض ٤٣٠ متراً تحت مستوى سطح البحر، غني بالمعادن والأملاح الطبيعية.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 8: ISLAMIC ETHICS & LIFE SITUATIONS (التربية الإسلامية: الآداب)       */}
          {/* ========================================================================= */}
          {activeTab === 'islamic_ethics' && (
            <div className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <DoorClosed className="w-4 h-4 text-emerald-700" />
                    <span>محاكي آداب الاستئذان وحرمة البيوت (التربية الإسلامية):</span>
                  </h4>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    «الاستئذان ثلاث، فإن أُذن لك وإلا فارجع» — تطبيق تفاعلي لغرس القيم النبوية في نفوس الطلبة.
                  </p>
                </div>
              </div>

              {/* Interactive Situation Decision Box */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 space-y-5 text-center">
                <span className="text-xs text-emerald-300 font-bold">الموقف الصفي: ذهبت لزيارة صديقك في بيته:</span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* Step 1: Knocks */}
                  <div className="bg-white/10 p-4 rounded-2xl border border-white/20 space-y-2">
                    <span className="text-slate-300 font-bold block">عدد طرقات الباب:</span>
                    <div className="text-3xl font-black text-amber-300 tabular-nums">
                      {toArabicDigits(knockCount)}
                    </div>
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => setKnockCount((c) => Math.max(1, c - 1))}
                        className="p-1 bg-white/20 rounded-lg"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setKnockCount((c) => Math.min(5, c + 1))}
                        className="p-1 bg-white/20 rounded-lg"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      {knockCount <= 3 ? '✅ متوافق مع السنة النبوية' : '⚠️ الزيادة عن ٣ غير مستحبة'}
                    </span>
                  </div>

                  {/* Step 2: Standing Position */}
                  <div className="bg-white/10 p-4 rounded-2xl border border-white/20 space-y-2">
                    <span className="text-slate-300 font-bold block">موضع الوقوف أمام الباب:</span>
                    <div className="flex flex-col gap-1.5 pt-1">
                      <button
                        onClick={() => setStandPosition('side')}
                        className={`py-1.5 px-2 rounded-lg font-bold transition-colors ${
                          standPosition === 'side' ? 'bg-emerald-600 text-white' : 'bg-white/10 text-slate-300'
                        }`}
                      >
                        على يمين أو يسار الباب
                      </button>
                      <button
                        onClick={() => setStandPosition('front')}
                        className={`py-1.5 px-2 rounded-lg font-bold transition-colors ${
                          standPosition === 'front' ? 'bg-rose-700 text-white' : 'bg-white/10 text-slate-300'
                        }`}
                      >
                        في مواجهة الباب مباشرة
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      {standPosition === 'side' ? '✅ لحفظ حرمة البيت والنظر' : '❌ مكروه لعدم كشف عورات البيت'}
                    </span>
                  </div>

                  {/* Step 3: Self Identification */}
                  <div className="bg-white/10 p-4 rounded-2xl border border-white/20 space-y-2">
                    <span className="text-slate-300 font-bold block">عند السؤال: (مَن بالباب؟):</span>
                    <div className="flex flex-col gap-1.5 pt-1">
                      <button
                        onClick={() => setIdentifySelf(true)}
                        className={`py-1.5 px-2 rounded-lg font-bold transition-colors ${
                          identifySelf ? 'bg-emerald-600 text-white' : 'bg-white/10 text-slate-300'
                        }`}
                      >
                        أذكر اسمي صريحاً (أنا أحمد)
                      </button>
                      <button
                        onClick={() => setIdentifySelf(false)}
                        className={`py-1.5 px-2 rounded-lg font-bold transition-colors ${
                          !identifySelf ? 'bg-rose-700 text-white' : 'bg-white/10 text-slate-300'
                        }`}
                      >
                        أقول مبهمًا: (أنا!)
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      {identifySelf ? '✅ كما علمنا النبي ﷺ' : '❌ كره النبي ﷺ قول: أنا'}
                    </span>
                  </div>
                </div>

                {/* Islamic Verdict Badge */}
                <div className="p-3 bg-white/15 rounded-2xl max-w-lg mx-auto text-xs font-bold border border-white/20">
                  {knockCount <= 3 && standPosition === 'side' && identifySelf ? (
                    <span className="text-emerald-300 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      سلوك إسلامي مثالي متوافق تماماً مع الهدي النبوي الشريف! (الدرجة 4 في مصفوفة القيم).
                    </span>
                  ) : (
                    <span className="text-amber-300 flex items-center justify-center gap-1.5">
                      <Info className="w-4 h-4 text-amber-400" />
                      راجع الآداب النبوية: اطرق ٣ مرات كحد أقصى، قف جانباً، واذكر اسمك بوضوح.
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-emerald-700" />
            <span>
              يوظف المعلم هذا المحاكي التفاعلي على الشاشة الصفية أو في مجموعات التعلم لربط المحسوس بالمجرد.
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs w-full sm:w-auto"
          >
            إغلاق المحاكي
          </button>
        </div>
      </div>
    </div>
  );
};
