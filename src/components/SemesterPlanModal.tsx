import React, { useState, useMemo } from 'react';
import {
  X,
  CalendarRange,
  FileDown,
  Printer,
  Sparkles,
  Layers,
  BookOpen,
  GraduationCap,
  Clock,
  CheckCircle2,
  Plus,
  Trash2,
  FileEdit,
  Download,
  Copy,
  Check,
  Table as TableIcon,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  FileText,
  Building,
  School,
  UserCheck,
  Search,
  Wand2,
  RotateCcw,
  Loader2,
  SlidersHorizontal,
  Calendar,
  Compass,
  FolderPlus,
  BookmarkPlus,
  Link2,
  Globe,
  CalendarDays,
  CalendarCheck,
  Flag,
  Info,
  ShieldAlert,
  AlertCircle,
} from 'lucide-react';
import { SemesterPlanDocument, SemesterPlanRow } from '../types/semesterPlan';
import { LessonPlan } from '../types/lessonPlan';
import { toArabicDigits } from '../utils/arabicNumerals';
import {
  ALL_SEMESTER_PLANS,
  sampleMathSemesterPlan,
  sampleScienceSemesterPlan,
  sampleArabicSemesterPlan,
} from '../data/sampleSemesterPlans';
import {
  exportSemesterPlanToWord,
  exportSemesterPlanToExcel,
  exportSemesterPlanToCsv,
  exportSemesterPlanToMarkdown,
  exportSemesterPlanToJson,
} from '../utils/semesterExportUtils';
import {
  MinistryHoliday,
  PALESTINIAN_MINISTRY_HOLIDAYS,
  analyzeTeachingCalendar,
  getNextTeachingDays,
  checkDayStatus,
} from '../utils/palestinianCalendar';

interface SemesterPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedPlans?: LessonPlan[];
  defaultSubject?: string;
  defaultGrade?: string;
  teacherName?: string;
  schoolName?: string;
  onImportLessonsToApp?: (newPlans: LessonPlan[]) => void;
}

const AVAILABLE_SUBJECTS = [
  'الرياضيات',
  'العلوم والحياة',
  'اللغة العربية',
  'التربية الإسلامية',
  'الدراسات الاجتماعية',
  'اللغة الإنجليزية',
];

const STANDARD_GRADES = [
  'الصف الأول الأساسي',
  'الصف الثاني الأساسي',
  'الصف الثالث الأساسي',
  'الصف الرابع الأساسي',
  'الصف الخامس الأساسي',
  'الصف السادس الأساسي',
  'الصف السابع الأساسي',
  'الصف الثامن الأساسي',
  'الصف التاسع الأساسي',
  'الصف العاشر الأساسي',
  'الحادي عشر (علمي/أدبي)',
  'الثاني عشر (التوجيهي)',
];

const OER_RESOURCE_PRESETS = [
  { label: '🌐 منصة روافد التعليمية (OER)', type: 'منصة OER رقمية', url: 'https://rawafed.edu.ps' },
  { label: '📹 قناة فلسطين التعليمية', type: 'فيديو تعليمي OER', url: 'https://youtube.com/@PalestineEduChannel' },
  { label: '🧪 محاكاة الفتيات والعلوم (PhET)', type: 'برمجية محاكاة تفاعلية', url: 'https://phet.colorado.edu' },
  { label: '🧩 برمجية جيوجبرا (GeoGebra)', type: 'برمجية رياضيات تفاعلية', url: 'https://geogebra.org' },
  { label: '📝 بطاقات التعلم الاستدراكي (OER)', type: 'بطاقات وعلاج استدراكي', url: 'https://rawafed.edu.ps/cards' },
  { label: '📚 المكتبة الإلكترونية الموحدة', type: 'كتاب ومصادر إلكترونية', url: 'https://moe.edu.ps/library' },
  { label: '📱 أنشطة Wordwall & Kahoot', type: 'تطبيقات التعلم باللعب', url: 'https://wordwall.net' },
  { label: '📐 مجسمات ومحسوسات صفية', type: 'وسائط ومحسوسات ملموسة', url: '' },
];

const BOOK_RESOURCE_PRESETS = [
  { label: '📚 الكتاب المدرسي المقرر (الجزء الأول)', type: 'كتاب مدرسي معتمد' },
  { label: '📘 الكتاب المدرسي المقرر (الجزء الثاني)', type: 'كتاب مدرسي معتمد' },
  { label: '📗 دليل المعلم والأنشطة الإثرائية', type: 'دليل المعلم والأنشطة' },
  { label: '📙 كراسة التمارين والأنشطة التطبيقية', type: 'كراسة تمارين' },
  { label: '📓 قصص ومراجع إثرائية مساندة', type: 'قصص ومراجع إثرائية' },
  { label: '📱 الكتاب الإلكتروني التفاعلي OER', type: 'كتاب إلكتروني تفاعلي' },
];

export const SemesterPlanModal: React.FC<SemesterPlanModalProps> = ({
  isOpen,
  onClose,
  savedPlans = [],
  defaultSubject = 'الرياضيات',
  defaultGrade = 'الصف الثالث الأساسي',
  teacherName = 'أ. عبد الرحمن دويكات',
  schoolName = 'مدرسة التميز النموذجية للبنين',
  onImportLessonsToApp,
}) => {
  // Current plan state
  const [currentPlan, setCurrentPlan] = useState<SemesterPlanDocument>(() => {
    return ALL_SEMESTER_PLANS[defaultSubject] || sampleMathSemesterPlan;
  });

  const [selectedSubjectKey, setSelectedSubjectKey] = useState<string>(defaultSubject);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnit, setFilterUnit] = useState<string>('all');
  const [isCopied, setIsCopied] = useState(false);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [isSuccessAlert, setIsSuccessAlert] = useState<string | null>(null);

  // AI Generator Wizard state
  const [isAiWizardOpen, setIsAiWizardOpen] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiSubject, setAiSubject] = useState(defaultSubject);
  const [aiGrade, setAiGrade] = useState(defaultGrade);
  const [aiSemester, setAiSemester] = useState('الفصل الدراسي الأول');
  const [aiWeeks, setAiWeeks] = useState(16);
  const [aiWeeklyPeriods, setAiWeeklyPeriods] = useState(5);
  const [aiCustomTopics, setAiCustomTopics] = useState('');
  const [aiStartDate, setAiStartDate] = useState('2026-09-01');

  // Add Resource Modal state
  const [isAddResourceModalOpen, setIsAddResourceModalOpen] = useState(false);
  const [newResourceTitle, setNewResourceTitle] = useState('');
  const [newResourceType, setNewResourceType] = useState('منصة OER رقمية');
  const [newResourceTargetScope, setNewResourceTargetScope] = useState<'all' | 'specific_row' | 'specific_unit'>('all');
  const [selectedTargetRowId, setSelectedTargetRowId] = useState<string>('');
  const [selectedTargetUnit, setSelectedTargetUnit] = useState<string>('');
  const [newResourceUrl, setNewResourceUrl] = useState('');

  // Add Book Modal state
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [bookTitle, setBookTitle] = useState('');
  const [bookPart, setBookPart] = useState('الكتاب المدرسي المقرر - الجزء الأول');
  const [bookTargetScope, setBookTargetScope] = useState<'all' | 'specific_row' | 'specific_unit'>('all');

  // Semester Time Period state (من تاريخ - إلى تاريخ)
  const [semesterStartDate, setSemesterStartDate] = useState<string>(
    currentPlan.semesterStartDate || '2026-09-01'
  );
  const [semesterEndDate, setSemesterEndDate] = useState<string>(
    currentPlan.semesterEndDate || '2027-01-15'
  );
  const [aiEndDate, setAiEndDate] = useState<string>('2027-01-15');

  // Palestinian Ministry Holidays & Calendar state
  const [holidaysList, setHolidaysList] = useState<MinistryHoliday[]>(PALESTINIAN_MINISTRY_HOLIDAYS);
  const [isHolidaysModalOpen, setIsHolidaysModalOpen] = useState(false);
  const [includeMinistryHolidays, setIncludeMinistryHolidays] = useState(true);
  const [newHolidayName, setNewHolidayName] = useState('');
  const [newHolidayType, setNewHolidayType] = useState<'national' | 'religious' | 'school_vacation' | 'emergency'>('national');
  const [newHolidayStart, setNewHolidayStart] = useState('');
  const [newHolidayEnd, setNewHolidayEnd] = useState('');

  // Analyze teaching calendar with Fridays, Saturdays, and Ministry Holidays excluded
  const calendarAnalysis = useMemo(() => {
    return analyzeTeachingCalendar(
      semesterStartDate,
      semesterEndDate,
      includeMinistryHolidays ? holidaysList : []
    );
  }, [semesterStartDate, semesterEndDate, holidaysList, includeMinistryHolidays]);

  // Extract unique units for filter
  const unitList = useMemo(() => {
    const set = new Set<string>();
    currentPlan.rows.forEach((r) => set.add(r.unitTitle));
    return Array.from(set);
  }, [currentPlan]);

  // Compute total periods and statistics
  const stats = useMemo(() => {
    const totalPeriods = currentPlan.rows.reduce((acc, r) => acc + (Number(r.lessonPeriods) || 0), 0);
    const uniqueUnitsCount = new Set(currentPlan.rows.map((r) => r.unitTitle)).size;
    const lessonsCount = currentPlan.rows.length;
    const avgPeriodsPerWeek =
      currentPlan.totalSemesterWeeks > 0
        ? Math.round((totalPeriods / currentPlan.totalSemesterWeeks) * 10) / 10
        : 5;

    return {
      totalPeriods,
      uniqueUnitsCount,
      lessonsCount,
      avgPeriodsPerWeek,
    };
  }, [currentPlan]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return currentPlan.rows.filter((r) => {
      const matchUnit = filterUnit === 'all' || r.unitTitle === filterUnit;
      const query = searchQuery.trim().toLowerCase();
      const matchQuery =
        query === '' ||
        r.unitTitle.toLowerCase().includes(query) ||
        r.lessonTitle.toLowerCase().includes(query) ||
        r.timeframe.toLowerCase().includes(query) ||
        r.unitCompetencyGoals.some((g) => g.toLowerCase().includes(query)) ||
        r.learningResourcesOer.some((res) => res.toLowerCase().includes(query)) ||
        r.teachingStrategies.some((s) => s.toLowerCase().includes(query)) ||
        r.assessmentMethods.some((a) => a.toLowerCase().includes(query));
      return matchUnit && matchQuery;
    });
  }, [currentPlan, filterUnit, searchQuery]);

  if (!isOpen) return null;

  // Switch preset
  const handleSelectSubjectPreset = (subjectKey: string) => {
    setSelectedSubjectKey(subjectKey);
    const found = ALL_SEMESTER_PLANS[subjectKey];
    if (found) {
      setCurrentPlan({
        ...found,
        teacherName: teacherName || found.teacherName,
        school: schoolName || found.school,
      });
      setIsSuccessAlert(`تم تحميل الخطة الفصلية المعتمدة لمبحث ${subjectKey} بنجاح!`);
      setTimeout(() => setIsSuccessAlert(null), 3000);
    }
  };

  // Compile dynamically from saved plans in the system
  const handleCompileFromSavedPlans = () => {
    if (!savedPlans || savedPlans.length === 0) {
      alert('لا توجد خطط دروس محفوظة حالياً في المنظومة لتجميع الخطة الفصلية منها.');
      return;
    }

    const newRows: SemesterPlanRow[] = savedPlans.map((p, idx) => {
      const weekNum = idx + 1;
      const unitTitle = p.header.unitTitle || `الوحدة التعليمية ${Math.ceil((idx + 1) / 4)}: ${p.header.subject}`;
      const goals = p.section1?.integrativeCompetencies?.map((c) => `${c.title}: ${c.description}`) || [
        'تحقيق النتاجات الأساسية للدرس',
      ];
      const oer = [
        p.section1?.learningResources?.textbook || 'الكتاب المدرسي المعتمد',
        p.section1?.learningResources?.tangibleMedia || 'وسائط ومحسوسات',
        p.section1?.learningResources?.digitalReadiness || 'منصات ومصادر رقمية OER',
      ].filter(Boolean);

      const strategies =
        p.section2Timeline?.flatMap((ph) => ph.strategiesAndResources).slice(0, 3) || ['التعلم النشط والتعاوني'];
      const assessments = [
        p.section3Assessment?.graspsTask?.title ? `مهمة GRASPS: ${p.section3Assessment.graspsTask.title}` : '',
        'تقويم تكويني سابر',
        'ملاحظة الأداء والمشاركة',
      ].filter(Boolean);

      return {
        id: `compiled-${p.id}`,
        unitNumber: Math.ceil((idx + 1) / 4),
        unitTitle,
        unitCompetencyGoals: goals,
        lessonNumber: idx + 1,
        lessonTitle: p.header.lessonTitle || p.title || `درس ${idx + 1}`,
        lessonPeriods: p.header.totalPeriods || 2,
        unitTotalPeriods: 8,
        timeframe: `الأسبوع (${toArabicDigits(weekNum)})`,
        timeframeWeekNumber: weekNum,
        learningResourcesOer: oer,
        teachingStrategies: strategies,
        assessmentMethods: assessments,
      };
    });

    const first = savedPlans[0];
    const compiledPlan: SemesterPlanDocument = {
      id: `compiled-plan-${Date.now()}`,
      title: `الخطة الفصلية الموحدة وتوزيع الحصص المستخرجة من الخطط المحفوظة`,
      academicYear: '٢٠٢٦ / ٢٠٢٧م',
      semester: first.header.semester || 'الفصل الدراسي الأول',
      country: first.header.country || 'دولة فلسطين',
      ministry: first.header.ministry || 'وزارة التربية والتعليم',
      directorate: first.header.directorate || 'مديرية التربية والتعليم',
      school: first.header.school || schoolName,
      subject: first.header.subject || 'مبحث تعليمي',
      grade: first.header.grade || defaultGrade,
      section: first.header.section || 'الشعبة الأولى',
      teacherName: first.header.teacherName || teacherName,
      supervisorName: 'المشرف التربوي للمبحث',
      principalName: 'مدير المدرسة',
      weeklyPeriodsCount: first.header.totalPeriods || 5,
      totalSemesterWeeks: Math.max(16, newRows.length),
      totalSemesterPeriods: newRows.reduce((a, b) => a + b.lessonPeriods, 0),
      generalCompetencies: [
        'توظيف الكفايات التكاملية المستهدفة في منهاج المبحث.',
        'تفعيل التقويم الأصيل GRASPS وسلالم التقدير اللفظية.',
      ],
      rows: newRows,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCurrentPlan(compiledPlan);
    setIsSuccessAlert(`تم بنجاح تجميع وبناء الخطة الفصلية وتوزيع الحصص من (${toArabicDigits(savedPlans.length)}) خطة درس محفوظة!`);
    setTimeout(() => setIsSuccessAlert(null), 3500);
  };

  // Generate with AI
  const handleGenerateWithAi = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/generate-semester-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: aiSubject,
          grade: aiGrade,
          semester: aiSemester,
          totalSemesterWeeks: Number(aiWeeks) || 16,
          weeklyPeriodsCount: Number(aiWeeklyPeriods) || 5,
          teacherName: teacherName || currentPlan.teacherName,
          school: schoolName || currentPlan.school,
          startDate: aiStartDate,
          unitTopics: aiCustomTopics.split('\n').map((s) => s.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (data.plan) {
        setCurrentPlan(data.plan);
        setSelectedSubjectKey(aiSubject);
        setIsAiWizardOpen(false);
        setIsSuccessAlert(`تم بنجاح توليد الخطة الفصلية وتوزيع الحصص لمبحث ${aiSubject} (${toArabicDigits(data.plan.rows.length)} درساً)!`);
        setTimeout(() => setIsSuccessAlert(null), 3500);
      } else {
        throw new Error(data.error || 'فشل التوليد');
      }
    } catch (err: any) {
      console.warn('Backend semester generation error, falling back:', err);
      const preset = ALL_SEMESTER_PLANS[aiSubject];
      if (preset) {
        setCurrentPlan(preset);
      }
      setIsAiWizardOpen(false);
      setIsSuccessAlert(`تم تجهيز الخطة وتوزيع الحصص بنجاح!`);
      setTimeout(() => setIsSuccessAlert(null), 3500);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Import all lessons from this plan to the app's saved plans
  const handleImportAllLessonsToApp = () => {
    if (!onImportLessonsToApp || currentPlan.rows.length === 0) return;

    const convertedPlans: LessonPlan[] = currentPlan.rows.map((row, idx) => {
      const planId = `imported-lesson-${Date.now()}-${idx + 1}`;
      return {
        id: planId,
        title: `${currentPlan.subject} - ${row.lessonTitle}`,
        header: {
          country: currentPlan.country || 'دولة فلسطين',
          ministry: currentPlan.ministry || 'وزارة التربية والتعليم',
          directorate: currentPlan.directorate || 'مديرية التربية والتعليم',
          school: currentPlan.school || schoolName,
          teacherName: currentPlan.teacherName || teacherName,
          subject: currentPlan.subject,
          grade: currentPlan.grade,
          section: currentPlan.section || 'الشعبة الأولى',
          semester: currentPlan.semester,
          academicYear: currentPlan.academicYear,
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
            individualDifferences: 'تفاوت مراعاة الفروق الفردية وأنماط التعلم البصري والسمعي والحركي.',
            specialNeeds: 'تقديم الدعم الاستدراكي للطلبة ذوي الاحتياجات الخاصة والبطء التعلمي.',
            environmentalAdaptation: 'تكيف البيئة الصفية والتعلم التفاعلي بالمحسوسات والتطبيقات الرقمية.',
          },
          learningResources: {
            textbook: row.learningResourcesOer[0] || 'الكتاب المدرسي المعتمد',
            tangibleMedia: row.learningResourcesOer[1] || 'وسائط ومحسوسات تعليمية',
            digitalReadiness: row.learningResourcesOer.slice(2).join('، ') || 'منصة روافد ومصادر OER',
          },
          ethicsAndSafety: {
            digitalSafety: 'الاستخدام الآمن والمسؤول للمصادر الرقمية والإنترنت.',
            contentAccuracyAndLanguage: 'الدقة العلمية واللغوية والسلامة الفكرية.',
          },
          reflectiveQuestions: [
            `كيف أسهمت أنشطة هذا الدرس في تحقيق نتاجات وحدة "${row.unitTitle}"؟`,
            'ما التحديات التي واجهت الطلبة في استيعاب المفهوم وكيف عولجت؟',
          ],
        },
        section2Timeline: [
          {
            id: 'phase-1',
            phaseName: 'التهيئة الحافزة والربط واستثارة الدافعية',
            durationMinutes: 5,
            teacherAndStudentActions: [
              'استثارة المعارف القبلية وطرح تساؤل استقصائي تفاعلي.',
              'توضيح أهداف الدرس والنتاجات المنتظرة وتوزيع المهام.',
            ],
            strategiesAndResources: [row.teachingStrategies[0] || 'العصف الذهني والحوار'],
            assessmentAndFeedback: ['أسئلة تشخيصية سابرة وتغذية راجعة شفاهية فوريّة.'],
            differentiation: 'مراعاة سرعة الاستجابة وتقديم تلميحات تشجيعية.',
          },
          {
            id: 'phase-2',
            phaseName: 'البناء المعرفي والتعلم النشط والاستقصاء',
            durationMinutes: 20,
            teacherAndStudentActions: [
              'تنفيذ أنشطة التعلم التعاوني والتجريب العملي المنظم.',
              'مناقشة الأفكار وتقديم التغذية الراجعة البنائية الفورية.',
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
              'تبادل الأعمال بين المجموعات وتقييم الأقران.',
            ],
            strategiesAndResources: ['التعلم التعاوني الموجه', 'التطبيقات العملية'],
            assessmentAndFeedback: ['تقييم أوراق العمل والملاحظة المباشرة.'],
            differentiation: 'دعم فردي للطلبة المحتاجين وأنشطة تحدٍ للمتفوقين.',
          },
          {
            id: 'phase-4',
            phaseName: 'الغلق المعرفي والتقويم الختامي والتأمل',
            durationMinutes: 5,
            teacherAndStudentActions: [
              'تلخيص الأفكار الرئيسة وتطبيق بطاقة الخروج Exit Ticket.',
              'تكليف الطلبة بمهمة بيتية تطبيقية مرتبطة بالبيئة.',
            ],
            strategiesAndResources: row.assessmentMethods,
            assessmentAndFeedback: ['بطاقة خروج وتغذية راجعة ختامية.'],
            differentiation: 'تنوع خيارات التعبير والتقويم الذاتي.',
          },
        ],
        section3Assessment: {
          graspsTask: {
            title: `مهمة أداء أصيل: ${row.lessonTitle}`,
            goal: row.unitCompetencyGoals[0] || 'تطبيق المهارات في سياق واقعي',
            role: 'باحث / منتج ومبتكر طلابي',
            audience: 'الزملاء والمجتمع المدرسي',
            situation: 'موقف تطبيقي يعالج تحدياً من البيئة المعاشة',
            product: 'تقرير مصور / نموذج تطبيقي / عرض تقديمي',
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
          classroomRoutines: 'روتين بدء الحصة، توزيع الأدوار التشاركية، واستخدام الإشارات الصامتة.',
          safeAndMotivatingClimate: 'بيئة آمنة نفسياً تحفز على المبادرة وتتقبل الخطأ كفرصة للتعلم.',
          familyPartnership: {
            cardTitle: `بطاقة شراكة أسرية: درس ${row.lessonTitle}`,
            instructions: 'متابعة نتاجات التعلم ودعم الطالب في تنفيذ الأنشطة الواقعية.',
            studentTask: 'مناقشة المفاهيم المكتسبة مع الأسرة وربطها بالمنزل.',
            parentRole: 'التحفيز المستمر وتوفير البيئة الداعمة وتسجيل الملاحظات في كراسة المتابعة.',
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
            name: currentPlan.teacherName || teacherName,
            date: row.startDate || '٢٠٢٦م',
            notes: 'تم تنفيذ الدرس وفق الخطة المعتمدة مع مراعاة المرونة التكيفية.',
          },
          schoolPrincipal: {
            name: currentPlan.principalName || 'مدير المدرسة',
            date: '٢٠٢٦م',
            directives: 'مبارك الجهود، يرجى الاستمرار في تفعيل التقويم الأصيل GRASPS.',
          },
          educationalSupervisor: {
            name: currentPlan.supervisorName || 'المشرف التربوي',
            date: '٢٠٢٦م',
            directives: 'تخطيط نوعي متميز متوافق مع معايير جودة التعليم.',
          },
        },
      };
    });

    onImportLessonsToApp(convertedPlans);
    setIsSuccessAlert(`تم بنجاح استيراد (${toArabicDigits(convertedPlans.length)}) خطة درس كاملة إلى المنظومة!`);
    setTimeout(() => {
      setIsSuccessAlert(null);
      onClose();
    }, 1800);
  };

  // Add new lesson row
  const handleAddRow = () => {
    const newIdx = currentPlan.rows.length + 1;
    const newRow: SemesterPlanRow = {
      id: `row-custom-${Date.now()}`,
      unitNumber: Math.ceil(newIdx / 4),
      unitTitle: `الوحدة التعليمية ${Math.ceil(newIdx / 4)}: موضوعات جديدة`,
      unitCompetencyGoals: ['تحقيق أهداف التعلم الأساسية والكفايات الخاصة بالوحدة'],
      lessonNumber: newIdx,
      lessonTitle: `الدرس ${newIdx}: عنوان الدرس والموضوع`,
      lessonPeriods: 5,
      unitTotalPeriods: 20,
      timeframe: `الأسبوع (${toArabicDigits(newIdx)}): منتصف الشهر`,
      timeframeWeekNumber: newIdx,
      learningResourcesOer: ['الكتاب المدرسي', 'منصة روافد التعليمية OER', 'أوراق عمل تفاعلية'],
      teachingStrategies: ['التعلم النشط والتعاوني', 'الاستقصاء الموجه', 'حل المشكلات'],
      assessmentMethods: ['تقويم تشخيصي', 'ملاحظة مباشرة', 'بطاقة خروج'],
    };

    setCurrentPlan((prev) => ({
      ...prev,
      rows: [...prev.rows, newRow],
      totalSemesterPeriods: prev.totalSemesterPeriods + 5,
    }));
  };

  // Duplicate existing row
  const handleDuplicateRow = (rowId: string) => {
    const target = currentPlan.rows.find((r) => r.id === rowId);
    if (!target) return;
    const newRow: SemesterPlanRow = {
      ...target,
      id: `row-dup-${Date.now()}`,
      lessonTitle: `${target.lessonTitle} (متابعة / جزء إضافي)`,
      lessonNumber: target.lessonNumber + 1,
    };
    setCurrentPlan((prev) => {
      const idx = prev.rows.findIndex((r) => r.id === rowId);
      const updated = [...prev.rows];
      updated.splice(idx + 1, 0, newRow);
      return {
        ...prev,
        rows: updated,
        totalSemesterPeriods: prev.totalSemesterPeriods + target.lessonPeriods,
      };
    });
  };

  // Remove row
  const handleRemoveRow = (rowId: string) => {
    if (currentPlan.rows.length <= 1) return;
    setCurrentPlan((prev) => {
      const filtered = prev.rows.filter((r) => r.id !== rowId);
      return {
        ...prev,
        rows: filtered,
        totalSemesterPeriods: filtered.reduce((a, b) => a + (Number(b.lessonPeriods) || 0), 0),
      };
    });
  };

  // Update specific row cell
  const handleUpdateRow = (rowId: string, field: keyof SemesterPlanRow, value: any) => {
    setCurrentPlan((prev) => {
      const updated = prev.rows.map((r) => {
        if (r.id !== rowId) return r;
        return { ...r, [field]: value };
      });
      return {
        ...prev,
        rows: updated,
        totalSemesterPeriods: updated.reduce((a, b) => a + (Number(b.lessonPeriods) || 0), 0),
      };
    });
  };

  // Add learning resource to plan rows
  const handleAddResourceToPlan = (
    titleToAdd?: string,
    scopeOverride?: 'all' | 'specific_row' | 'specific_unit',
    targetRowIdOverride?: string
  ) => {
    const resourceText = titleToAdd || newResourceTitle.trim();
    if (!resourceText) {
      alert('يرجى كتابة عنوان المصدر التعليمي أو اختيار أحد المصادر الجاهزة.');
      return;
    }

    const scope = scopeOverride || newResourceTargetScope;
    const targetRowId = targetRowIdOverride || selectedTargetRowId;
    const targetUnit = selectedTargetUnit;

    setCurrentPlan((prev) => {
      const updatedRows = prev.rows.map((row) => {
        let shouldAdd = false;
        if (scope === 'all') {
          shouldAdd = true;
        } else if (scope === 'specific_row' && row.id === targetRowId) {
          shouldAdd = true;
        } else if (scope === 'specific_unit' && row.unitTitle === targetUnit) {
          shouldAdd = true;
        }

        if (shouldAdd) {
          if (!row.learningResourcesOer.includes(resourceText)) {
            return {
              ...row,
              learningResourcesOer: [...row.learningResourcesOer, resourceText],
            };
          }
        }
        return row;
      });

      return {
        ...prev,
        rows: updatedRows,
      };
    });

    setIsSuccessAlert(`تمت إضافة المصدر التعليمي "${resourceText}" بنجاح إلى الخطة الفصلية!`);
    setTimeout(() => setIsSuccessAlert(null), 3000);

    setNewResourceTitle('');
    setNewResourceUrl('');
    setIsAddResourceModalOpen(false);
  };

  // Remove single resource item from row
  const handleRemoveResourceFromRow = (rowId: string, resourceIndex: number) => {
    setCurrentPlan((prev) => ({
      ...prev,
      rows: prev.rows.map((row) => {
        if (row.id !== rowId) return row;
        const newResources = [...row.learningResourcesOer];
        newResources.splice(resourceIndex, 1);
        return {
          ...row,
          learningResourcesOer: newResources,
        };
      }),
    }));
  };

  // Add book to plan rows
  const handleAddBookToPlan = (
    titleToAdd?: string,
    scopeOverride?: 'all' | 'specific_row' | 'specific_unit',
    targetRowIdOverride?: string
  ) => {
    const rawTitle = titleToAdd || bookTitle.trim() || bookPart;
    const finalBookText = rawTitle.startsWith('📖') || rawTitle.startsWith('📚') || rawTitle.startsWith('📘') || rawTitle.startsWith('📗') || rawTitle.startsWith('📙') || rawTitle.startsWith('📓')
      ? rawTitle
      : `📖 ${rawTitle}`;

    const scope = scopeOverride || bookTargetScope;
    const targetRowId = targetRowIdOverride || selectedTargetRowId;
    const targetUnit = selectedTargetUnit;

    setCurrentPlan((prev) => {
      const updatedRows = prev.rows.map((row) => {
        let shouldAdd = false;
        if (scope === 'all') {
          shouldAdd = true;
        } else if (scope === 'specific_row' && row.id === targetRowId) {
          shouldAdd = true;
        } else if (scope === 'specific_unit' && row.unitTitle === targetUnit) {
          shouldAdd = true;
        }

        if (shouldAdd) {
          if (!row.learningResourcesOer.includes(finalBookText)) {
            return {
              ...row,
              learningResourcesOer: [finalBookText, ...row.learningResourcesOer],
            };
          }
        }
        return row;
      });

      return {
        ...prev,
        rows: updatedRows,
      };
    });

    setIsSuccessAlert(`تمت إضافة الكتاب "${finalBookText}" بنجاح إلى مصادر الخطة الفصلية!`);
    setTimeout(() => setIsSuccessAlert(null), 3000);

    setBookTitle('');
    setIsAddBookModalOpen(false);
  };

  // Handle recalculating and applying dates to plan rows with Palestinian Calendar (Friday/Saturday & Ministry Holidays)
  const handleApplySemesterDates = (
    sDate: string,
    eDate: string,
    customHolidaysList?: MinistryHoliday[],
    useHolidaysToggle?: boolean
  ) => {
    if (!sDate || !eDate) return;
    const start = new Date(sDate);
    const end = new Date(eDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      alert('يرجى اختيار تاريخ بداية سابق لتاريخ النهاية بشكل صحيح.');
      return;
    }

    const holidaysToUse = (useHolidaysToggle ?? includeMinistryHolidays)
      ? (customHolidaysList || holidaysList)
      : [];

    const analysis = analyzeTeachingCalendar(sDate, eDate, holidaysToUse);

    let currentTeachingStartDate = sDate;

    setCurrentPlan((prev) => {
      const updatedRows = prev.rows.map((row, idx) => {
        // Calculate next teaching days range for this lesson
        const result = getNextTeachingDays(currentTeachingStartDate, 5, holidaysToUse);

        // Advance to next available day
        const nextDay = new Date(result.endDate);
        nextDay.setDate(nextDay.getDate() + 1);
        currentTeachingStartDate = nextDay.toISOString().split('T')[0];

        const holidaysPassedText = result.holidaysPassed.length > 0
          ? ` (يتخلله: ${result.holidaysPassed.join('، ')})`
          : ' (أيام تدريس فعلية)';

        const formatShortDate = (dStr: string) => {
          const parts = dStr.split('-');
          if (parts.length === 3) {
            return `${parts[0]}/${parts[1]}/${parts[2]}`;
          }
          return dStr;
        };

        const newTimeframe = `الأسبوع (${toArabicDigits(idx + 1)}): من ${formatShortDate(result.startDate)} إلى ${formatShortDate(result.endDate)}${holidaysPassedText}`;

        return {
          ...row,
          timeframe: newTimeframe,
          timeframeWeekNumber: idx + 1,
          startDate: result.startDate,
          endDate: result.endDate,
        };
      });

      return {
        ...prev,
        semesterStartDate: sDate,
        semesterEndDate: eDate,
        totalSemesterWeeks: Math.max(1, Math.round(analysis.netTeachingWeeks)),
        rows: updatedRows,
      };
    });

    setIsSuccessAlert(
      `تم تطبيق التقويم الفلسطيني المعتمد (استبعاد الجمعة والسبت والإجازات): ${toArabicDigits(analysis.netTeachingDays)} يوماً تعليمياً مقسمة على ${toArabicDigits(analysis.netTeachingWeeks)} أسبوعاً!`
    );
    setTimeout(() => setIsSuccessAlert(null), 3500);
  };

  // Add custom holiday handler
  const handleAddCustomHoliday = () => {
    if (!newHolidayName.trim() || !newHolidayStart) {
      alert('يرجى كتابة اسم المناسبة/الإجازة وتاريخ البداية.');
      return;
    }
    const end = newHolidayEnd || newHolidayStart;
    const newHol: MinistryHoliday = {
      id: `custom-hol-${Date.now()}`,
      name: newHolidayName.trim(),
      type: newHolidayType,
      startDate: newHolidayStart,
      endDate: end,
      notes: 'إجازة مضافة من المعلم/ة',
    };
    const updated = [...holidaysList, newHol];
    setHolidaysList(updated);
    setNewHolidayName('');
    setNewHolidayStart('');
    setNewHolidayEnd('');
    handleApplySemesterDates(semesterStartDate, semesterEndDate, updated);
  };

  // Remove holiday
  const handleRemoveHoliday = (holidayId: string) => {
    const updated = holidaysList.filter((h) => h.id !== holidayId);
    setHolidaysList(updated);
    handleApplySemesterDates(semesterStartDate, semesterEndDate, updated);
  };

  // Reset holidays to Ministry Defaults
  const handleResetMinistryHolidays = () => {
    setHolidaysList(PALESTINIAN_MINISTRY_HOLIDAYS);
    handleApplySemesterDates(semesterStartDate, semesterEndDate, PALESTINIAN_MINISTRY_HOLIDAYS);
  };

  // Copy to clipboard
  const handleCopyToClipboard = () => {
    let text = `=== ${currentPlan.title} ===\n`;
    text += `المبحث: ${currentPlan.subject} | الصف: ${currentPlan.grade} | العام: ${currentPlan.academicYear}\n`;
    text += `المعلم/ة: ${currentPlan.teacherName} | المدرسة: ${currentPlan.school}\n`;
    text += `إجمالي الحصص: ${stats.totalPeriods} حصة | إجمالي الأسابيع: ${currentPlan.totalSemesterWeeks} أسبوعاً\n\n`;

    currentPlan.rows.forEach((r, idx) => {
      text += `[${idx + 1}] الوحدة: ${r.unitTitle}\n`;
      text += `    الدرس: ${r.lessonTitle} (${r.lessonPeriods} حصص من أصل ${r.unitTotalPeriods} حصص بالوحدة)\n`;
      text += `    المدة: ${r.timeframe}\n`;
      text += `    أهداف الوحدة: ${r.unitCompetencyGoals.join('، ')}\n`;
      text += `    مصادر التعلم (OER): ${r.learningResourcesOer.join('، ')}\n`;
      text += `    الاستراتيجيات: ${r.teachingStrategies.join('، ')}\n`;
      text += `    التقويم: ${r.assessmentMethods.join('، ')}\n\n`;
    });

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div
      dir="rtl"
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200 text-right overflow-y-auto"
    >
      <div className="relative w-full max-w-7xl max-h-[96vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto">
        {/* Modal Top Header Banner */}
        <div className="bg-linear-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 shrink-0 border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shrink-0 shadow-md border border-white/20">
              <CalendarRange className="w-6 h-6 text-emerald-100" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-xl font-black font-['Tajawal'] tracking-wide">
                  الخطة الفصلية الموحدة ودليل توزيع الحصص الدراسية
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-amber-950 shadow-2xs">
                  معتمد وزارياً (OER)
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-400 text-cyan-950 shadow-2xs">
                  تصدير بكافة الصيغ
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                توزيع الوحدات، الأهداف الكفائية، الحصص، المدى الزمني، المصادر المفتوحة OER، الاستراتيجيات والتقويم
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-colors shrink-0"
              title="إغلاق النافذة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Alert Toast */}
        {isSuccessAlert && (
          <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-1 shrink-0">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{isSuccessAlert}</span>
          </div>
        )}

        {/* AI Generator Collapsible Box */}
        {isAiWizardOpen && (
          <div className="bg-linear-to-br from-slate-900 via-teal-950 to-emerald-950 text-white p-4 sm:p-5 border-b border-teal-800 animate-in slide-in-from-top-2 shrink-0">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-400/40">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-cyan-100">
                    توليد الخطة الفصلية ودليل توزيع الحصص بالذكاء الاصطناعي (AI)
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    حدد المبحث والصف وعدد الأسابيع، وسيقوم الذكاء الاصطناعي ببناء جدول الحصص الشامل والمتكامل
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAiWizardOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">المبحث التعليمي</label>
                <input
                  type="text"
                  value={aiSubject}
                  onChange={(e) => setAiSubject(e.target.value)}
                  placeholder="مثال: الرياضيات، العلوم، اللغة العربية"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">الصف الدراسي</label>
                <select
                  value={aiGrade}
                  onChange={(e) => setAiGrade(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500"
                >
                  {STANDARD_GRADES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">الفصل الدراسي</label>
                <select
                  value={aiSemester}
                  onChange={(e) => setAiSemester(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="الفصل الدراسي الأول">الفصل الدراسي الأول</option>
                  <option value="الفصل الدراسي الثاني">الفصل الدراسي الثاني</option>
                  <option value="الفصل الدراسي الثالث">الفصل الدراسي الثالث</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">الحصص أسبوعياً</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={aiWeeklyPeriods}
                    onChange={(e) => setAiWeeklyPeriods(Number(e.target.value) || 5)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500"
                  />
                  <span className="text-[11px] text-slate-400 shrink-0">حصص</span>
                </div>
              </div>

              <div className="sm:col-span-2 grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    من تاريخ (بداية الفصل)
                  </label>
                  <input
                    type="date"
                    value={aiStartDate}
                    onChange={(e) => setAiStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    إلى تاريخ (نهاية الفصل)
                  </label>
                  <input
                    type="date"
                    value={aiEndDate}
                    onChange={(e) => setAiEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 font-medium"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  وحدات وموضوعات مقترحة (اختياري - سطر لكل وحدة)
                </label>
                <input
                  type="text"
                  value={aiCustomTopics}
                  onChange={(e) => setAiCustomTopics(e.target.value)}
                  placeholder="اتركه فارغاً للتوليد الوزاري التلقائي، أو اكتب عناوين الوحدات"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-300">
                <span className="font-bold">مباحث سريعة:</span>
                {AVAILABLE_SUBJECTS.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setAiSubject(sub)}
                    className={`px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                      aiSubject === sub
                        ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleGenerateWithAi}
                disabled={isGeneratingAi}
                className="px-4 py-2 bg-linear-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {isGeneratingAi ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-200" />
                    <span>جاري التوليد البيداغوجي وفق المعايير الوزارية...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-cyan-200" />
                    <span>⚡ بدء التوليد الآلي للخطة ودليل توزيع الحصص</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Toolbar: Presets, AI Trigger, Import, and Export Hub */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 sm:p-4 space-y-3 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Primary Action Buttons: AI Wizard, Add Resource, & Subject Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsAiWizardOpen(!isAiWizardOpen)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-linear-to-r from-emerald-600 via-teal-700 to-cyan-800 hover:from-emerald-700 hover:to-cyan-900 text-white shadow-sm hover:shadow-md flex items-center gap-1.5 transition-all cursor-pointer border border-cyan-400/40 ring-1 ring-emerald-400/20"
                title="فتح نموذج توليد الخطة الفصلية ودليل توزيع الحصص بالذكاء الاصطناعي"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-200 animate-pulse" />
                <span>توليد بالذكاء الاصطناعي (AI)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsAddResourceModalOpen(true);
                  if (currentPlan.rows.length > 0 && !selectedTargetRowId) {
                    setSelectedTargetRowId(currentPlan.rows[0].id);
                  }
                  if (unitList.length > 0 && !selectedTargetUnit) {
                    setSelectedTargetUnit(unitList[0]);
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-linear-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-800 text-white shadow-sm hover:shadow-md flex items-center gap-1.5 transition-all cursor-pointer border border-amber-300/40 ring-1 ring-amber-400/20"
                title="إضافة مصدر تعلم إضافي (OER) إلى الخطة الفصلية وتوزيع الحصص"
              >
                <FolderPlus className="w-3.5 h-3.5 text-amber-200" />
                <span>إضافة مصدر (OER)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsAddBookModalOpen(true);
                  if (currentPlan.rows.length > 0 && !selectedTargetRowId) {
                    setSelectedTargetRowId(currentPlan.rows[0].id);
                  }
                  if (unitList.length > 0 && !selectedTargetUnit) {
                    setSelectedTargetUnit(unitList[0]);
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-linear-to-r from-blue-700 via-indigo-700 to-blue-800 hover:from-blue-800 hover:to-indigo-900 text-white shadow-sm hover:shadow-md flex items-center gap-1.5 transition-all cursor-pointer border border-blue-400/40 ring-1 ring-blue-400/20"
                title="إضافة كتاب مدرسي مقرر أو مرجع تعليمي إلى مصادر الخطة الفصلية"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-200" />
                <span>إضافة كتاب</span>
              </button>

              <span className="text-xs font-bold text-slate-700 flex items-center gap-1 mr-2 ml-1">
                <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                <span>النماذج الفصلية المعتمدة:</span>
              </span>

              {AVAILABLE_SUBJECTS.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => handleSelectSubjectPreset(sub)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentPlan.subject === sub
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white hover:bg-emerald-50 text-slate-700 border border-slate-300'
                  }`}
                >
                  {sub}
                </button>
              ))}

              {savedPlans.length > 0 && (
                <button
                  type="button"
                  onClick={handleCompileFromSavedPlans}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-linear-to-r from-blue-700 to-indigo-800 text-white shadow-xs hover:from-blue-800 hover:to-indigo-900 transition-all flex items-center gap-1.5 cursor-pointer ml-1"
                  title="تجميع تلقائي لجدول الحصص من خطط دروسك المحفوظة بالمنظومة"
                >
                  <Wand2 className="w-3.5 h-3.5 text-blue-200" />
                  <span>تجميع من خططي ({toArabicDigits(savedPlans.length)})</span>
                </button>
              )}

              {onImportLessonsToApp && currentPlan.rows.length > 0 && (
                <button
                  type="button"
                  onClick={handleImportAllLessonsToApp}
                  className="px-3 py-1.5 rounded-xl text-xs font-black bg-linear-to-r from-indigo-700 to-purple-800 hover:from-indigo-800 hover:to-purple-900 text-white shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  title="تحويل دروس هذه الخطة الفصلية إلى خطط دروس فعلية داخل المنظومة للتحضير"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-200" />
                  <span>استيراد الدروس للمنظومة ({toArabicDigits(currentPlan.rows.length)})</span>
                </button>
              )}
            </div>

            {/* Quick Export Hub Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => exportSemesterPlanToWord(currentPlan)}
                className="px-2.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                title="تصدير الخطة الفصلية كملف وورد رسمي بصيغة .doc"
              >
                <FileText className="w-3.5 h-3.5 text-blue-200" />
                <span>Word (.doc)</span>
              </button>

              <button
                type="button"
                onClick={() => exportSemesterPlanToExcel(currentPlan)}
                className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                title="تصدير جدول الحصص بصيغة إكسل .xls"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
                <span>Excel (.xls)</span>
              </button>

              <button
                type="button"
                onClick={() => exportSemesterPlanToCsv(currentPlan)}
                className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                title="تصدير جدول الحصص بصيغة CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-slate-300" />
                <span>CSV</span>
              </button>

              <button
                type="button"
                onClick={() => exportSemesterPlanToMarkdown(currentPlan)}
                className="px-2.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                title="تصدير الخطة كملف Markdown (.md)"
              >
                <FileDown className="w-3.5 h-3.5 text-purple-200" />
                <span>Markdown</span>
              </button>

              <button
                type="button"
                onClick={handleCopyToClipboard}
                className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="نسخ الجدول كاملاً إلى الحافظة"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
                <span>{isCopied ? 'تم النسخ!' : 'نسخ'}</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                title="طباعة الخطة الفصلية وتوزيع الحصص A4 عرضي"
              >
                <Printer className="w-3.5 h-3.5 text-slate-300" />
                <span>طباعة رسمية</span>
              </button>
            </div>
          </div>

          {/* Semester Time Period Control Bar (من تاريخ - إلى تاريخ) & Palestinian Calendar Rules */}
          <div className="bg-linear-to-r from-teal-50 via-emerald-50 to-cyan-50 border border-teal-200/90 rounded-2xl p-3.5 space-y-3 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-800 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <CalendarDays className="w-5 h-5 text-cyan-200" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-teal-950 font-['Tajawal'] text-xs sm:text-sm">
                      الفترة الزمنية للفصل الدراسي والتقويم المعتمد:
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-700 text-white shadow-2xs">
                      الجمعة والسبت عطلة أسبوعية 🇵🇸
                    </span>
                  </div>
                  <span className="text-[11px] text-teal-800/90">
                    يتم استبعاد العطلات الأسبوعية (الجمعة والسبت) والإجازات الرسمية المعتمدة من وزارة التربية والتعليم تلقائياً عند احتساب المدى الزمني
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-teal-300/80 shadow-2xs">
                  <span className="font-bold text-teal-900 text-[11px] shrink-0">من تاريخ:</span>
                  <input
                    type="date"
                    value={semesterStartDate}
                    onChange={(e) => {
                      setSemesterStartDate(e.target.value);
                      handleApplySemesterDates(e.target.value, semesterEndDate);
                    }}
                    className="text-xs font-bold text-slate-900 bg-transparent focus:outline-hidden cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-teal-300/80 shadow-2xs">
                  <span className="font-bold text-teal-900 text-[11px] shrink-0">إلى تاريخ:</span>
                  <input
                    type="date"
                    value={semesterEndDate}
                    onChange={(e) => {
                      setSemesterEndDate(e.target.value);
                      handleApplySemesterDates(semesterStartDate, e.target.value);
                    }}
                    className="text-xs font-bold text-slate-900 bg-transparent focus:outline-hidden cursor-pointer"
                  />
                </div>

                {/* Quick Semester Term Presets */}
                <div className="flex flex-wrap items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setSemesterStartDate('2026-09-01');
                      setSemesterEndDate('2027-01-15');
                      handleApplySemesterDates('2026-09-01', '2027-01-15');
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-teal-100 text-teal-900 border border-teal-300 rounded-lg text-[11px] font-bold transition-colors cursor-pointer shadow-2xs"
                    title="الفصل الأول: 01/09/2026 - 15/01/2027"
                  >
                    🗓️ الفصل الأول
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSemesterStartDate('2027-02-01');
                      setSemesterEndDate('2027-05-30');
                      handleApplySemesterDates('2027-02-01', '2027-05-30');
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-teal-100 text-teal-900 border border-teal-300 rounded-lg text-[11px] font-bold transition-colors cursor-pointer shadow-2xs"
                    title="الفصل الثاني: 01/02/2027 - 30/05/2027"
                  >
                    🗓️ الفصل الثاني
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsHolidaysModalOpen(true)}
                    className="px-3 py-1 bg-linear-to-r from-emerald-800 to-teal-900 hover:from-emerald-900 hover:to-teal-950 text-white rounded-lg text-[11px] font-black transition-all cursor-pointer shadow-2xs flex items-center gap-1 border border-emerald-500/30"
                    title="عرض وتحديث جدول الإجازات الرسمية والعطل المعتمدة من وزارة التربية والتعليم الفلسطينية"
                  >
                    <Flag className="w-3.5 h-3.5 text-amber-300" />
                    <span>الإجازات الرسمية ({toArabicDigits(calendarAnalysis.holidayDaysCount)} أيام)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Palestinian Calendar Live Stats Summary Bar */}
            <div className="pt-2 border-t border-teal-200/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-bold text-teal-950 flex items-center gap-1">
                  <CalendarCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>تحليل التقويم المدرسي:</span>
                </span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 font-extrabold rounded-md border border-emerald-300">
                  🏫 أيام التدريس الفعلية: {toArabicDigits(calendarAnalysis.netTeachingDays)} يوماً
                </span>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-800 font-bold rounded-md border border-slate-300">
                  🌴 العطلات الأسبوعية (الجمعة والسبت): {toArabicDigits(calendarAnalysis.weekendDaysCount)} يوماً
                </span>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold rounded-md border border-amber-300">
                  🕌 الإجازات والمناسبات الرسمية: {toArabicDigits(calendarAnalysis.holidayDaysCount)} أيام ({toArabicDigits(calendarAnalysis.holidaysEncountered.length)} مناسبة)
                </span>
              </div>

              <label className="flex items-center gap-1.5 cursor-pointer select-none font-bold text-teal-900">
                <input
                  type="checkbox"
                  checked={includeMinistryHolidays}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIncludeMinistryHolidays(checked);
                    handleApplySemesterDates(semesterStartDate, semesterEndDate, holidaysList, checked);
                  }}
                  className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span>تفعيل مراعاة الإجازات الرسمية لوزارة التربية</span>
              </label>
            </div>
          </div>

          {/* Institutional Metadata & KPI Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 pt-1 text-xs">
            <div className="p-2.5 bg-white rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 block mb-0.5 flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-emerald-600" />
                المبحث والصف
              </span>
              <span className="font-extrabold text-slate-800 line-clamp-1">
                {currentPlan.subject} - {currentPlan.grade}
              </span>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 block mb-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-600" />
                الحصص الأسبوعية
              </span>
              <span className="font-extrabold text-emerald-700 tabular-nums">
                {toArabicDigits(currentPlan.weeklyPeriodsCount)} حصص / أسبوع
              </span>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 block mb-0.5 flex items-center gap-1">
                <Layers className="w-3 h-3 text-emerald-600" />
                إجمالي حصص الفصل
              </span>
              <span className="font-black text-emerald-800 text-sm tabular-nums">
                {toArabicDigits(stats.totalPeriods)} حصة موزعة
              </span>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 block mb-0.5 flex items-center gap-1">
                <CalendarRange className="w-3 h-3 text-emerald-600" />
                مدة الفصل والأسابيع
              </span>
              <span className="font-extrabold text-slate-800 tabular-nums block">
                {toArabicDigits(currentPlan.totalSemesterWeeks)} أسبوعاً
              </span>
              <span className="text-[10px] text-teal-700 font-bold block mt-0.5">
                ({semesterStartDate} ⬅️ {semesterEndDate})
              </span>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 block mb-0.5 flex items-center gap-1">
                <TableIcon className="w-3 h-3 text-emerald-600" />
                الوحدات والدروس
              </span>
              <span className="font-extrabold text-slate-800 tabular-nums">
                {toArabicDigits(stats.uniqueUnitsCount)} وحدات ({toArabicDigits(stats.lessonsCount)} درس)
              </span>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 block mb-0.5 flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-emerald-600" />
                المعلم/ة المنفذ
              </span>
              <span className="font-bold text-slate-800 line-clamp-1">
                {currentPlan.teacherName}
              </span>
            </div>
          </div>

          {/* Search, Unit Filter & Add Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
            <div className="flex flex-1 items-center gap-2 max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="بحث سريع بالدرس، الوحدة، الاستراتيجية، التقويم..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-3 pr-9 py-1.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <select
                value={filterUnit}
                onChange={(e) => setFilterUnit(e.target.value)}
                className="text-xs bg-white font-semibold text-slate-800 rounded-xl px-2.5 py-1.5 border border-slate-300 focus:ring-2 focus:ring-emerald-500 shrink-0"
              >
                <option value="all">كافة الوحدات ({toArabicDigits(unitList.length)})</option>
                {unitList.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleAddRow}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer shrink-0 self-end sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة سطر درس جديد للجدول</span>
            </button>
          </div>
        </div>

        {/* Table Container Body */}
        <div className="flex-1 overflow-auto p-3 sm:p-5">
          <div className="border border-slate-300 rounded-2xl overflow-hidden shadow-xs bg-white">
            <table className="w-full border-collapse text-right text-xs leading-relaxed">
              <thead>
                <tr className="bg-linear-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white text-center font-bold text-[11px] sm:text-xs">
                  <th className="p-2.5 border-l border-emerald-700 w-9 shrink-0">م</th>
                  <th className="p-2.5 border-l border-emerald-700 min-w-[140px] text-right">الوحدة التعليمية</th>
                  <th className="p-2.5 border-l border-emerald-700 min-w-[170px] text-right">أهداف الوحدة الكفائية</th>
                  <th className="p-2.5 border-l border-emerald-700 min-w-[150px] text-right">اسم الدرس والموضوع</th>
                  <th className="p-2.5 border-l border-emerald-700 w-16">حصص الدرس</th>
                  <th className="p-2.5 border-l border-emerald-700 w-16">إجمالي الوحدة</th>
                  <th className="p-2.5 border-l border-emerald-700 min-w-[130px]">المدة الزمنية (أسابيع / تواريخ)</th>
                  <th className="p-2.5 border-l border-emerald-700 min-w-[150px] text-right">مصادر التعلم (OER)</th>
                  <th className="p-2.5 border-l border-emerald-700 min-w-[150px] text-right">استراتيجيات التدريس</th>
                  <th className="p-2.5 border-l border-emerald-700 min-w-[140px] text-right">التقويم المستمر</th>
                  <th className="p-2.5 w-18 shrink-0 no-print">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-500">
                      لا توجد أسطر تطابق البحث الحالي
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row, index) => {
                    const isEditing = editingRowId === row.id;

                    return (
                      <tr
                        key={row.id}
                        className={`hover:bg-emerald-50/40 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
                        }`}
                      >
                        {/* 1. م */}
                        <td className="p-2.5 text-center font-bold text-slate-500 border-l border-slate-200 tabular-nums">
                          {toArabicDigits(index + 1)}
                        </td>

                        {/* 2. الوحدة التعليمية */}
                        <td className="p-2.5 border-l border-slate-200">
                          {isEditing ? (
                            <input
                              type="text"
                              value={row.unitTitle}
                              onChange={(e) => handleUpdateRow(row.id, 'unitTitle', e.target.value)}
                              className="w-full p-1 text-xs border border-emerald-400 rounded-md bg-white"
                            />
                          ) : (
                            <span className="font-extrabold text-emerald-950 block">{row.unitTitle}</span>
                          )}
                        </td>

                        {/* 3. أهداف الوحدة الكفائية */}
                        <td className="p-2.5 border-l border-slate-200">
                          {isEditing ? (
                            <textarea
                              rows={2}
                              value={row.unitCompetencyGoals.join('\n')}
                              onChange={(e) =>
                                handleUpdateRow(
                                  row.id,
                                  'unitCompetencyGoals',
                                  e.target.value.split('\n').filter(Boolean)
                                )
                              }
                              className="w-full p-1 text-xs border border-emerald-400 rounded-md bg-white"
                            />
                          ) : (
                            <ul className="list-disc list-inside space-y-0.5 text-slate-700 text-[11px]">
                              {row.unitCompetencyGoals.map((g, i) => (
                                <li key={i} className="line-clamp-2">
                                  {g}
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>

                        {/* 4. اسم الدرس والموضوع */}
                        <td className="p-2.5 border-l border-slate-200 font-bold text-blue-950">
                          {isEditing ? (
                            <input
                              type="text"
                              value={row.lessonTitle}
                              onChange={(e) => handleUpdateRow(row.id, 'lessonTitle', e.target.value)}
                              className="w-full p-1 text-xs border border-emerald-400 rounded-md bg-white"
                            />
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                              <span>{row.lessonTitle}</span>
                            </div>
                          )}
                        </td>

                        {/* 5. عدد حصص الدرس */}
                        <td className="p-2.5 border-l border-slate-200 text-center font-bold text-emerald-900 bg-emerald-50/50 tabular-nums">
                          {isEditing ? (
                            <input
                              type="number"
                              min={1}
                              max={20}
                              value={row.lessonPeriods}
                              onChange={(e) => handleUpdateRow(row.id, 'lessonPeriods', Number(e.target.value) || 1)}
                              className="w-12 text-center p-1 text-xs border border-emerald-400 rounded-md bg-white"
                            />
                          ) : (
                            <span className="text-xs font-black">{toArabicDigits(row.lessonPeriods)}</span>
                          )}
                        </td>

                        {/* 6. إجمالي حصص الوحدة */}
                        <td className="p-2.5 border-l border-slate-200 text-center font-bold text-slate-800 bg-slate-100/60 tabular-nums">
                          {isEditing ? (
                            <input
                              type="number"
                              min={1}
                              max={60}
                              value={row.unitTotalPeriods}
                              onChange={(e) =>
                                handleUpdateRow(row.id, 'unitTotalPeriods', Number(e.target.value) || 1)
                              }
                              className="w-12 text-center p-1 text-xs border border-emerald-400 rounded-md bg-white"
                            />
                          ) : (
                            <span className="text-xs">{toArabicDigits(row.unitTotalPeriods)}</span>
                          )}
                        </td>

                        {/* 7. المدة الزمنية باليوم والتاريخ أو بالأسابيع */}
                        <td className="p-2.5 border-l border-slate-200 text-center font-semibold text-amber-900 bg-amber-50/30">
                          {isEditing ? (
                            <input
                              type="text"
                              value={row.timeframe}
                              onChange={(e) => handleUpdateRow(row.id, 'timeframe', e.target.value)}
                              className="w-full p-1 text-xs border border-emerald-400 rounded-md bg-white text-center"
                            />
                          ) : (
                            <span className="text-[11px] font-bold block">{row.timeframe}</span>
                          )}
                        </td>

                        {/* 8. مصادر التعلم (OER) */}
                        <td className="p-2.5 border-l border-slate-200 text-slate-700">
                          {isEditing ? (
                            <textarea
                              rows={2}
                              value={row.learningResourcesOer.join('، ')}
                              onChange={(e) =>
                                handleUpdateRow(
                                  row.id,
                                  'learningResourcesOer',
                                  e.target.value.split(/[،,]/).map((s) => s.trim()).filter(Boolean)
                                )
                              }
                              className="w-full p-1 text-xs border border-emerald-400 rounded-md bg-white"
                            />
                          ) : (
                            <div className="flex flex-col gap-1.5">
                              <div className="flex flex-wrap gap-1 items-center">
                                {row.learningResourcesOer.map((res, i) => (
                                  <span
                                    key={i}
                                    className="group relative inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-100/80 text-emerald-950 px-1.5 py-0.5 rounded-md border border-emerald-200/60"
                                  >
                                    <span>{res}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveResourceFromRow(row.id, i)}
                                      className="text-emerald-700 hover:text-rose-700 hover:bg-rose-100 rounded-xs p-0.5 opacity-60 group-hover:opacity-100 transition-opacity cursor-pointer"
                                      title="حذف المصدر"
                                    >
                                      <X className="w-2.5 h-2.5" />
                                    </button>
                                  </span>
                                ))}
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedTargetRowId(row.id);
                                    setNewResourceTargetScope('specific_row');
                                    setIsAddResourceModalOpen(true);
                                  }}
                                  className="text-[10px] font-extrabold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors cursor-pointer shadow-2xs no-print"
                                  title="إضافة مصدر تعليمي خاص بهذا الدرس"
                                >
                                  <FolderPlus className="w-3 h-3 text-amber-700" />
                                  <span>+ مصدر</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedTargetRowId(row.id);
                                    setBookTargetScope('specific_row');
                                    setIsAddBookModalOpen(true);
                                  }}
                                  className="text-[10px] font-extrabold bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300/80 px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors cursor-pointer shadow-2xs no-print"
                                  title="إضافة كتاب مدرسي مقرر لهذا الدرس"
                                >
                                  <BookOpen className="w-3 h-3 text-blue-700" />
                                  <span>+ كتاب</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </td>

                        {/* 9. استراتيجيات التدريس */}
                        <td className="p-2.5 border-l border-slate-200 text-slate-700">
                          {isEditing ? (
                            <textarea
                              rows={2}
                              value={row.teachingStrategies.join('، ')}
                              onChange={(e) =>
                                handleUpdateRow(
                                  row.id,
                                  'teachingStrategies',
                                  e.target.value.split(/[،,]/).map((s) => s.trim()).filter(Boolean)
                                )
                              }
                              className="w-full p-1 text-xs border border-emerald-400 rounded-md bg-white"
                            />
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {row.teachingStrategies.map((s, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] font-semibold bg-blue-50 text-blue-900 border border-blue-200/60 px-1.5 py-0.5 rounded-md"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* 10. التقويم */}
                        <td className="p-2.5 border-l border-slate-200 text-slate-700">
                          {isEditing ? (
                            <textarea
                              rows={2}
                              value={row.assessmentMethods.join('، ')}
                              onChange={(e) =>
                                handleUpdateRow(
                                  row.id,
                                  'assessmentMethods',
                                  e.target.value.split(/[،,]/).map((s) => s.trim()).filter(Boolean)
                                )
                              }
                              className="w-full p-1 text-xs border border-emerald-400 rounded-md bg-white"
                            />
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {row.assessmentMethods.map((a, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] font-semibold bg-purple-50 text-purple-900 border border-purple-200/60 px-1.5 py-0.5 rounded-md"
                                >
                                  {a}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* 11. إجراءات */}
                        <td className="p-2 text-center no-print">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => setEditingRowId(isEditing ? null : row.id)}
                              className={`p-1 rounded-lg transition-colors ${
                                isEditing
                                  ? 'bg-emerald-600 text-white'
                                  : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-100'
                              }`}
                              title={isEditing ? 'حفظ التعديل' : 'تعديل السطر'}
                            >
                              {isEditing ? <Check className="w-3.5 h-3.5" /> : <FileEdit className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDuplicateRow(row.id)}
                              className="p-1 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                              title="تكرار هذا الدرس"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRemoveRow(row.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="حذف هذا الدرس من الخطة"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100/90 font-bold border-t-2 border-slate-300 text-slate-800 text-xs">
                  <td colSpan={4} className="p-2.5 text-left pl-4 font-black">
                    المجموع الكلي لحصص الفصل الدراسي:
                  </td>
                  <td className="p-2.5 text-center font-black text-emerald-800 bg-emerald-100/70 border-l border-slate-300 tabular-nums text-sm">
                    {toArabicDigits(stats.totalPeriods)} حصة
                  </td>
                  <td colSpan={6} className="p-2.5 text-slate-600 text-[11px]">
                    موزعة على {toArabicDigits(currentPlan.totalSemesterWeeks)} أسبوعاً بواقع {toArabicDigits(currentPlan.weeklyPeriodsCount)} حصص أسبوعياً
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Ministerial Signatures Footer */}
          <div className="mt-6 border-t-2 border-slate-300 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-center text-slate-700">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">معلم/ة المبحث</span>
              <p className="text-slate-800 font-semibold">{currentPlan.teacherName}</p>
              <p className="text-[11px] text-slate-500 mt-2">التوقيع: .......................................</p>
              <p className="text-[10px] text-slate-400 mt-1">تاريخ الاعتماد: ..... / ..... / ٢٠٢٦م</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">المشرف/ة التربوي/ة</span>
              <p className="text-slate-800 font-semibold">{currentPlan.supervisorName}</p>
              <p className="text-[11px] text-slate-500 mt-2">التوقيع: .......................................</p>
              <p className="text-[10px] text-slate-400 mt-1">الملاحظات والتوجيهات: معتمد وفق المعايير</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">مدير/ة المدرسة</span>
              <p className="text-slate-800 font-semibold">{currentPlan.principalName}</p>
              <p className="text-[11px] text-slate-500 mt-2">التوقيع والختم: ..........................</p>
              <p className="text-[10px] text-slate-400 mt-1">خاتم الصرح المدرسي الرسمي</p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="p-3 sm:p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs font-bold">
          <div className="flex items-center gap-2 text-slate-600">
            <span>صيغ التصدير المتاحة:</span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-900 rounded-md">Word (.doc)</span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-md">Excel (.xls)</span>
            <span className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded-md">CSV</span>
            <span className="px-2 py-0.5 bg-purple-100 text-purple-900 rounded-md">Markdown</span>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md">PDF طباعة</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl transition-colors cursor-pointer"
            >
              إغلاق النافذة
            </button>
          </div>
        </div>

        {/* Add Resource Modal Overlay */}
        {isAddResourceModalOpen && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
            role="dialog"
            aria-modal="true"
          >
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 overflow-hidden text-right space-y-4">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center border border-amber-300 shrink-0">
                    <FolderPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 font-['Tajawal']">
                      إضافة مصدر تعلم إضافي (OER)
                    </h3>
                    <p className="text-xs text-slate-500">
                      ربط مصادر ومواد تعليمية مفتوحة بالخطة الفصلية وتوزيع الحصص
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddResourceModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  اختيار سريع لمصادر OER الجاهزة:
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
                  {OER_RESOURCE_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setNewResourceTitle(preset.label);
                        setNewResourceType(preset.type);
                        if (preset.url) setNewResourceUrl(preset.url);
                      }}
                      className="text-[11px] font-bold bg-white hover:bg-amber-50 hover:border-amber-300 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors text-right flex items-center gap-1 cursor-pointer"
                    >
                      <BookmarkPlus className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual Input Fields */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    اسم/عنوان المصدر التعليمي <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newResourceTitle}
                    onChange={(e) => setNewResourceTitle(e.target.value)}
                    placeholder="مثال: منصة روافد - فيديو تفاعلي - ورقة عمل رقمية..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">تصنيف المصدر</label>
                    <select
                      value={newResourceType}
                      onChange={(e) => setNewResourceType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-900"
                    >
                      <option value="منصة OER رقمية">منصة OER رقمية</option>
                      <option value="فيديو تعليمي OER">فيديو تعليمي OER</option>
                      <option value="برمجية محاكاة تفاعلية">برمجية محاكاة تفاعلية</option>
                      <option value="بطاقات وعلاج استدراكي">بطاقات وعلاج استدراكي</option>
                      <option value="أوراق عمل تفاعلية">أوراق عمل تفاعلية</option>
                      <option value="وسائط ومحسوسات ملموسة">وسائط ومحسوسات ملموسة</option>
                      <option value="كتاب ومصادر إلكترونية">كتاب ومصادر إلكترونية</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">نطاق تطبيق المصدر</label>
                    <select
                      value={newResourceTargetScope}
                      onChange={(e) => setNewResourceTargetScope(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-900"
                    >
                      <option value="all">🌟 تطبيق على كافة دروس الخطة</option>
                      <option value="specific_row">📌 تطبيق على درس محدد</option>
                      <option value="specific_unit">📚 تطبيق على وحدة كاملة</option>
                    </select>
                  </div>
                </div>

                {newResourceTargetScope === 'specific_row' && (
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">اختر الدرس المستهدف:</label>
                    <select
                      value={selectedTargetRowId}
                      onChange={(e) => setSelectedTargetRowId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-900"
                    >
                      {currentPlan.rows.map((row, idx) => (
                        <option key={row.id} value={row.id}>
                          درس {toArabicDigits(idx + 1)}: {row.lessonTitle} ({row.unitTitle})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {newResourceTargetScope === 'specific_unit' && (
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">اختر الوحدة المستهدفة:</label>
                    <select
                      value={selectedTargetUnit}
                      onChange={(e) => setSelectedTargetUnit(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-900"
                    >
                      {unitList.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    رابط المصدر أو المنصة (اختياري)
                  </label>
                  <div className="relative">
                    <Link2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={newResourceUrl}
                      onChange={(e) => setNewResourceUrl(e.target.value)}
                      placeholder="https://rawafed.edu.ps/..."
                      dir="ltr"
                      className="w-full text-xs pl-3 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddResourceModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => handleAddResourceToPlan()}
                  className="px-5 py-2 bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl font-black shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة المصدر للخطة الفصلية</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Book Modal Overlay */}
        {isAddBookModalOpen && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
            role="dialog"
            aria-modal="true"
          >
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 overflow-hidden text-right space-y-4">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-700 flex items-center justify-center border border-blue-300 shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 font-['Tajawal']">
                      إضافة كتاب مدرسي / مرجع إلى الخطة الفصلية
                    </h3>
                    <p className="text-xs text-slate-500">
                      ربط الكتب المدرسية المقررة وأدلة المعلم بمصادر التعلم
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddBookModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Preset Books */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  اختيار سريع للكتب والكتب المدرسية الجاهزة:
                </label>
                <div className="flex flex-wrap gap-1.5 p-1 bg-slate-50 rounded-xl border border-slate-200">
                  {BOOK_RESOURCE_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setBookTitle(preset.label);
                        setBookPart(preset.label);
                      }}
                      className="text-[11px] font-bold bg-white hover:bg-blue-50 hover:border-blue-300 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors text-right flex items-center gap-1 cursor-pointer"
                    >
                      <BookmarkPlus className="w-3 h-3 text-blue-600 shrink-0" />
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual Book Input Fields */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    اسم/عنوان الكتاب أو المرجع المدرسي <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    placeholder={`الكتاب المدرسي المقرر لمبحث ${currentPlan.subject} - ${currentPlan.grade}`}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">نطاق إدراج الكتاب بالخطة</label>
                  <select
                    value={bookTargetScope}
                    onChange={(e) => setBookTargetScope(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900 font-medium"
                  >
                    <option value="all">🌟 إدراج بكافة دروس الخطة الفصلية</option>
                    <option value="specific_row">📌 إدراج لدرس محدد فقط</option>
                    <option value="specific_unit">📚 إدراج لوحدة تعليمية كاملة</option>
                  </select>
                </div>

                {bookTargetScope === 'specific_row' && (
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">اختر الدرس المستهدف:</label>
                    <select
                      value={selectedTargetRowId}
                      onChange={(e) => setSelectedTargetRowId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900"
                    >
                      {currentPlan.rows.map((row, idx) => (
                        <option key={row.id} value={row.id}>
                          درس {toArabicDigits(idx + 1)}: {row.lessonTitle} ({row.unitTitle})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {bookTargetScope === 'specific_unit' && (
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">اختر الوحدة المستهدفة:</label>
                    <select
                      value={selectedTargetUnit}
                      onChange={(e) => setSelectedTargetUnit(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900"
                    >
                      {unitList.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddBookModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => handleAddBookToPlan()}
                  className="px-5 py-2 bg-linear-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white rounded-xl font-black shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>إضافة الكتاب للخطة</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Palestinian Ministry Official Holidays & Calendar Modal Overlay */}
        {isHolidaysModalOpen && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl p-5 overflow-hidden text-right space-y-4 my-auto">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-emerald-700 to-teal-900 text-white flex items-center justify-center shadow-md shrink-0">
                    <Flag className="w-6 h-6 text-amber-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 font-['Tajawal']">
                        التقويم المدرسي والإجازات الرسمية لوزارة التربية والتعليم الفلسطينية
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-amber-950">
                        معتمد وزارياً 🇵🇸
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      قائمة المناسبات الوطنية والدينية والعطل المدرسية المستبعدة تلقائياً من أيام التدريس الفعلية
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsHolidaysModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Palestinian Calendar KPI Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200 text-xs">
                <div className="p-2 bg-white rounded-xl border border-emerald-200 text-center">
                  <span className="text-[10px] font-bold text-slate-500 block">🏫 أيام التدريس الفعلية</span>
                  <span className="text-base font-black text-emerald-800">
                    {toArabicDigits(calendarAnalysis.netTeachingDays)} يوماً
                  </span>
                  <span className="text-[10px] text-emerald-600 block">({toArabicDigits(calendarAnalysis.netTeachingWeeks)} أسبوعاً)</span>
                </div>

                <div className="p-2 bg-white rounded-xl border border-emerald-200 text-center">
                  <span className="text-[10px] font-bold text-slate-500 block">🌴 عطلة نهاية الأسبوع (الجمعة والسبت)</span>
                  <span className="text-base font-black text-slate-800">
                    {toArabicDigits(calendarAnalysis.weekendDaysCount)} يوماً
                  </span>
                  <span className="text-[10px] text-slate-500 block">(مستثناة تلقائياً)</span>
                </div>

                <div className="p-2 bg-white rounded-xl border border-emerald-200 text-center">
                  <span className="text-[10px] font-bold text-slate-500 block">🕌 المناسبات والإجازات الرسمية</span>
                  <span className="text-base font-black text-amber-800">
                    {toArabicDigits(calendarAnalysis.holidayDaysCount)} أيام
                  </span>
                  <span className="text-[10px] text-amber-700 block">({toArabicDigits(calendarAnalysis.holidaysEncountered.length)} إجازة بالفصل)</span>
                </div>
              </div>

              {/* Add Custom Holiday Section */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2.5">
                <span className="text-xs font-bold text-slate-800 block flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5 text-emerald-700" />
                  <span>إضافة إجازة رسمية أو مناسبة طارئة جديدة للتقويم:</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                  <div className="sm:col-span-1">
                    <input
                      type="text"
                      value={newHolidayName}
                      onChange={(e) => setNewHolidayName(e.target.value)}
                      placeholder="اسم المناسبة / الإجازة"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold"
                    />
                  </div>
                  <div>
                    <select
                      value={newHolidayType}
                      onChange={(e) => setNewHolidayType(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-900"
                    >
                      <option value="national">مناسبة وطنية 🇵🇸</option>
                      <option value="religious">إجازة دينية 🕌</option>
                      <option value="school_vacation">عطلة مدرسية ❄️</option>
                      <option value="emergency">إجازة طارئة ⚠️</option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="date"
                      value={newHolidayStart}
                      onChange={(e) => setNewHolidayStart(e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold cursor-pointer"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={handleAddCustomHoliday}
                      className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة للتقويم</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* List of Official Holidays */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    جدول الإجازات المعتمدة ({toArabicDigits(holidaysList.length)} إجازة ومناسبة):
                  </span>
                  <button
                    type="button"
                    onClick={handleResetMinistryHolidays}
                    className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>استعادة إجازات وزارة التربية الافتراضية</span>
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-2xl divide-y divide-slate-100 bg-white text-xs">
                  {holidaysList.map((holiday) => {
                    const isEncountered = calendarAnalysis.holidaysEncountered.some(
                      (h) => h.name === holiday.name
                    );

                    return (
                      <div
                        key={holiday.id}
                        className={`p-2.5 flex flex-wrap items-center justify-between gap-2 transition-colors ${
                          isEncountered ? 'bg-amber-50/70' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">
                            {holiday.type === 'religious'
                              ? '🕌'
                              : holiday.type === 'national'
                              ? '🇵🇸'
                              : holiday.type === 'school_vacation'
                              ? '❄️'
                              : '⚠️'}
                          </span>
                          <div>
                            <span className="font-extrabold text-slate-900 block">
                              {holiday.name}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {holiday.startDate === holiday.endDate
                                ? `تاريخ الإجازة: ${holiday.startDate}`
                                : `من ${holiday.startDate} إلى ${holiday.endDate}`}
                              {holiday.notes ? ` • ${holiday.notes}` : ''}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isEncountered && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-200 text-amber-950">
                              تتخلل الفصل الدراسي الحالي
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveHoliday(holiday.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="حذف هذه الإجازة من التقويم"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium">
                  يتم المزامنة تلقائياً مع الخطة الفصلية وتحديث تواريخ الدروس
                </span>
                <button
                  type="button"
                  onClick={() => {
                    handleApplySemesterDates(semesterStartDate, semesterEndDate);
                    setIsHolidaysModalOpen(false);
                  }}
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-black text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>تطبيق وإغلاق</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
