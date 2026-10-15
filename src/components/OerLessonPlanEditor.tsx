import React, { useState } from 'react';
import {
  LessonPlan,
  OerLessonPlanData,
  OerActivityStage,
  OerResourceItem,
  OerResourceType,
  OerLicenseType,
  OerStudentRole,
  EDUCATIONAL_STAGES,
  STANDARD_GRADES,
  EducationalResource,
} from '../types/lessonPlan';
import {
  OER_PALESTINIAN_DATABASE,
  OerCurriculumEntry,
  ensureOerData,
} from '../data/oerPalestinianCurriculum';
import { auditPlanCompliance } from '../utils/smartPedagogicalAdvisor';
import {
  Sparkles,
  BookOpen,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  Trash2,
  FileText,
  Video,
  Link2,
  Image as ImageIcon,
  Leaf,
  Users2,
  User,
  Users,
  Compass,
  Award,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  FolderOpen,
  ShieldCheck,
  Check,
  Globe,
  Printer,
  Share2,
  Lightbulb,
  ArrowRight,
  Target,
} from 'lucide-react';
import { toArabicDigits } from '../utils/arabicNumerals';

interface OerLessonPlanEditorProps {
  plan: LessonPlan;
  onChange: (updatedPlan: LessonPlan) => void;
  onOpenUnitPlanModal?: () => void;
  onOpenResourcesModal?: () => void;
  onOpenAiModal?: () => void;
  onOpenShareModal?: () => void;
  resourcesCount?: number;
  resources?: EducationalResource[];
  onApplyResource?: (resource: EducationalResource) => void;
  onOpenPalestinianOerHub?: () => void;
  onOpenCompetenciesModal?: () => void;
  onOpenSmartGuideModal?: () => void;
  onAddResource?: (resource: EducationalResource, linkToCurrentPlan?: boolean) => void;
}

const PRIMARY_GRADES_1_TO_4 = [
  'الصف الأول الأساسي',
  'الصف الثاني الأساسي',
  'الصف الثالث الأساسي',
  'الصف الرابع الأساسي',
];

const RESOURCE_TYPES_CONFIG: Record<
  OerResourceType,
  { label: string; icon: React.FC<{ className?: string }>; color: string; bg: string; border: string }
> = {
  book: {
    label: 'كتاب / دليل',
    icon: BookOpen,
    color: 'text-amber-800',
    bg: 'bg-amber-50',
    border: 'border-amber-300',
  },
  video: {
    label: 'فيديو تفاعلي',
    icon: Video,
    color: 'text-rose-800',
    bg: 'bg-rose-50',
    border: 'border-rose-300',
  },
  link: {
    label: 'رابط / منصة',
    icon: Link2,
    color: 'text-blue-800',
    bg: 'bg-blue-50',
    border: 'border-blue-300',
  },
  image: {
    label: 'صورة / بطاقة',
    icon: ImageIcon,
    color: 'text-purple-800',
    bg: 'bg-purple-50',
    border: 'border-purple-300',
  },
  environmental: {
    label: 'بيئي / محسوس',
    icon: Leaf,
    color: 'text-emerald-800',
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
  },
};

const LICENSE_CONFIG: Record<
  OerLicenseType,
  { label: string; badge: string; isMinistry: boolean }
> = {
  ministry_elearn: {
    label: 'معتمد من وزارة التربية والتعليم العالي عبر البوابة التعليمية elearn.edu.ps',
    badge: 'bg-emerald-100 text-emerald-950 border-emerald-400 font-black',
    isMinistry: true,
  },
  creative_commons: {
    label: 'مشاع إبداعي مفتوح (Creative Commons OER)',
    badge: 'bg-blue-100 text-blue-900 border-blue-300 font-bold',
    isMinistry: false,
  },
  public_domain: {
    label: 'ملكية عامة (Public Domain)',
    badge: 'bg-slate-100 text-slate-800 border-slate-300 font-semibold',
    isMinistry: false,
  },
  local_teacher: {
    label: 'إعداد المعلم / مصدر بيئي ومحلي',
    badge: 'bg-amber-100 text-amber-900 border-amber-300 font-semibold',
    isMinistry: false,
  },
};

const STUDENT_ROLES_CONFIG: Record<
  OerStudentRole,
  { label: string; icon: React.FC<{ className?: string }>; desc: string }
> = {
  individual: {
    label: 'فردي',
    icon: User,
    desc: 'عمل ذاتي مستقل لكل طالب',
  },
  pairs: {
    label: 'ثنائي (أقران)',
    icon: Users,
    desc: 'تعلم تشاركي وتبادل أدوار بين الزميلين',
  },
  groups: {
    label: 'مجموعات تعاونية',
    icon: Users2,
    desc: 'مجموعات رباعية أو خماسية غير متجانسة بمهام محددة',
  },
  collective: {
    label: 'صفي جماعي',
    icon: Globe,
    desc: 'تفاعل حواري وعصف ذهني على مستوى الصف بأكمله',
  },
};

export const OerLessonPlanEditor: React.FC<OerLessonPlanEditorProps> = ({
  plan,
  onChange,
  onOpenUnitPlanModal,
  onOpenResourcesModal,
  onOpenAiModal,
  onOpenShareModal,
  resourcesCount = 0,
  resources = [],
  onApplyResource,
  onOpenPalestinianOerHub,
  onOpenCompetenciesModal,
  onOpenSmartGuideModal,
  onAddResource,
}) => {
  const planWithOer = ensureOerData(plan);
  const oer: OerLessonPlanData = planWithOer.oerData!;

  // Controls whether showing simplified grades (1-4) or all educational grades (1-12)
  const [showAllGrades, setShowAllGrades] = useState(false);

  // Curriculum Preset Selection Modal / Drawer state
  const [isCurriculumPickerOpen, setIsCurriculumPickerOpen] = useState(false);
  const [selectedCurriculumPreset, setSelectedCurriculumPreset] = useState<string>('');

  // Add Open Resource Modal State
  const [isAddResourceModalOpen, setIsAddResourceModalOpen] = useState(false);
  const [newResTitle, setNewResTitle] = useState('');
  const [newResType, setNewResType] = useState<'video' | 'book' | 'image' | 'link' | 'file' | 'activity'>('book');
  const [newResUrl, setNewResUrl] = useState('');
  const [newResSource, setNewResSource] = useState('وزارة التربية والتعليم العالي');
  const [newResLicense, setNewResLicense] = useState<'open' | 'public_domain' | 'shared_rights'>('open');
  const [newResNotes, setNewResNotes] = useState('');
  const [newResLinkToPlan, setNewResLinkToPlan] = useState(true);

  // Updates OER data & synchronizes common fields with top-level plan header
  const handleUpdateOer = (updatedOer: OerLessonPlanData) => {
    const updatedPlan: LessonPlan = {
      ...planWithOer,
      oerData: updatedOer,
      header: {
        ...planWithOer.header,
        subject: updatedOer.lessonInfo.subject,
        grade: updatedOer.lessonInfo.grade,
        section: updatedOer.lessonInfo.section,
        date: updatedOer.lessonInfo.date,
        lessonTitle: updatedOer.lessonInfo.lessonTitle,
        unitTitle: updatedOer.lessonInfo.unitTitle || planWithOer.header.unitTitle,
        teacherName: updatedOer.lessonInfo.teacherName,
        school: updatedOer.lessonInfo.school,
        directorate: updatedOer.lessonInfo.directorate,
        periodDurationMinutes: updatedOer.lessonInfo.durationMinutes,
        totalPeriods: updatedOer.lessonInfo.totalPeriods,
        semester: updatedOer.lessonInfo.semester,
      },
    };
    onChange(updatedPlan);
  };

  // Quick field updates for lesson info
  const handleUpdateLessonInfo = (field: keyof OerLessonPlanData['lessonInfo'], value: any) => {
    handleUpdateOer({
      ...oer,
      lessonInfo: {
        ...oer.lessonInfo,
        [field]: value,
      },
    });
  };

  // Quick updates for competencies
  const handleUpdateCompetency = (field: keyof OerLessonPlanData['targetCompetencies'], value: any) => {
    handleUpdateOer({
      ...oer,
      targetCompetencies: {
        ...oer.targetCompetencies,
        [field]: value,
      },
    });
  };

  // Indicator operations
  const handleAddIndicator = () => {
    handleUpdateCompetency('observableIndicators', [
      ...oer.targetCompetencies.observableIndicators,
      'مؤشر أداء جديد قابل للملاحظة والقياس مرتبط بالكفاية الخاصة...',
    ]);
  };

  const handleUpdateIndicator = (index: number, val: string) => {
    const next = [...oer.targetCompetencies.observableIndicators];
    next[index] = val;
    handleUpdateCompetency('observableIndicators', next);
  };

  const handleRemoveIndicator = (index: number) => {
    if (oer.targetCompetencies.observableIndicators.length <= 1) return;
    const next = oer.targetCompetencies.observableIndicators.filter((_, i) => i !== index);
    handleUpdateCompetency('observableIndicators', next);
  };

  // Activity Stage Operations
  const handleUpdateActivity = (index: number, updater: (prev: OerActivityStage) => OerActivityStage) => {
    const next = oer.activities.map((act, i) => (i === index ? updater(act) : act));
    handleUpdateOer({
      ...oer,
      activities: next,
    });
  };

  const handleAddActivity = () => {
    const newIdx = oer.activities.length + 1;
    const newAct: OerActivityStage = {
      id: `oer-act-${Date.now()}`,
      stageType: 'step',
      title: `الخطوة ${newIdx}: نشاط استقصائي وتطبيقي جديد`,
      allocatedTimeMinutes: 10,
      description: 'الخطوات الإجرائية التفصيلية للنشاط وتوزيع المهام واستراتيجية التدريس المتبعة.',
      studentRoles: 'groups',
      studentRolesDetails: 'تعاون جماعي في مجموعات صغيرة لتحقيق نتاجات النشاط.',
      expectedProducts: 'مخرجات أو منتج تعليمي ملموس يوضح الفهم والاستيعاب.',
      primaryResource: {
        title: 'الكتاب المدرسي المقرر أو البوابة التعليمية elearn.edu.ps',
        type: 'book',
        directUrl: 'https://elearn.edu.ps',
        licenseType: 'ministry_elearn',
        notes: 'المصدر الرئيسي المعتمد.',
      },
      alternativeResource1: {
        title: 'فيديو أو برمجية محاكاة من منصة روافد OER',
        type: 'video',
        directUrl: 'https://rawafed.edu.ps',
        licenseType: 'creative_commons',
        notes: 'البديل الأول المتاح للمشاع الإبداعي.',
      },
      alternativeResource2: {
        title: 'بطاقات حسية أو خامات ومحسوسات من البيئة المحلية',
        type: 'environmental',
        licenseType: 'local_teacher',
        notes: 'البديل الثاني الأوفلاين عند تعذر الإنترنت والكهرباء.',
      },
      formativeAssessment: 'ملاحظة وتغذية راجعة فورية أثناء التطبيق الصفي.',
      productAssessment: 'تقويم منتج النشاط وفق معايير الدقة والإنجاز.',
    };
    handleUpdateOer({
      ...oer,
      activities: [...oer.activities, newAct],
    });
  };

  const handleRemoveActivity = (index: number) => {
    if (oer.activities.length <= 2) return;
    const next = oer.activities.filter((_, i) => i !== index);
    handleUpdateOer({
      ...oer,
      activities: next,
    });
  };

  // Apply Palestinian preset from curriculum database
  const handleApplyPreset = (entry: OerCurriculumEntry) => {
    handleUpdateOer({
      ...oer,
      lessonInfo: {
        ...oer.lessonInfo,
        subject: entry.subject,
        grade: entry.grade,
        lessonTitle: entry.lessonTitle,
        unitTitle: entry.unitTitle,
      },
      targetCompetencies: {
        generalCompetency: entry.generalCompetency,
        specificCompetency: entry.specificCompetency,
        observableIndicators: [...entry.observableIndicators],
      },
      activities: entry.suggestedActivities.map((act, idx) => ({
        id: `oer-act-${Date.now()}-${idx}`,
        stageType: act.stageType,
        title: act.title,
        allocatedTimeMinutes: act.allocatedTimeMinutes,
        description: act.description,
        studentRoles: act.studentRoles,
        studentRolesDetails: act.studentRolesDetails,
        expectedProducts: act.expectedProducts,
        primaryResource: { ...act.primaryResource },
        alternativeResource1: { ...act.alternativeResource1 },
        alternativeResource2: { ...act.alternativeResource2 },
        formativeAssessment: act.formativeAssessment,
        productAssessment: act.productAssessment,
      })),
      summativeAssessment: { ...entry.summativeAssessment },
      contingenciesAndNotes: {
        sourceContingencies: entry.contingencies.sourceContingencies,
        postLessonReflection: entry.contingencies.postLessonReflection,
        followUpActions: entry.contingencies.followUpActions,
      },
    });
    setIsCurriculumPickerOpen(false);
  };

  // Total allocated time
  const totalAllocatedMinutes = oer.activities.reduce((sum, a) => sum + (Number(a.allocatedTimeMinutes) || 0), 0);
  const durationTarget = Number(oer.lessonInfo.durationMinutes) || 40;

  return (
    <div className="space-y-6 oer-lesson-plan-editor font-['Tajawal']" dir="rtl">
      {/* ===================== Top Official Context & Badge Banner ===================== */}
      <div className="bg-linear-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl border-2 border-emerald-500/50 relative overflow-hidden space-y-4">
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        
        {/* Row 1: Top Bar - Single horizontal row right to left */}
        <div className="flex flex-wrap items-center gap-2.5 pb-3 border-b border-emerald-700/60">
          <span className="bg-amber-400 text-slate-950 px-3 py-1 rounded-full text-xs font-black shadow-xs flex items-center gap-1.5 shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-900" />
            <span>دليل المعلم الفلسطيني OER</span>
          </span>
          <span className="bg-emerald-800/90 text-emerald-100 border border-emerald-400/40 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shrink-0">
            <span>🇵🇸 وزارة التربية والتعليم العالي</span>
          </span>
          <span className="bg-teal-800/90 text-teal-100 border border-teal-400/40 px-3 py-1 rounded-full text-xs font-bold shrink-0">
            البوابة التعليمية elearn.edu.ps
          </span>
          <span className="bg-blue-900/70 text-blue-100 border border-blue-400/40 px-3 py-1 rounded-full text-xs font-bold shrink-0">
            المرحلة المستهدفة: الصفوف ١–٤ قابلة للتوسع
          </span>
        </div>

        {/* Row 2: Title & Description horizontal layout */}
        <div className="space-y-1.5">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-wide">
            واجهة بناء خطة الدرس المستندة إلى مصادر التعليم المفتوحة (OER)
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-4xl">
            هيكل بيداغوجي متكامل يربط بين الكفايات العامة والخاصة ومؤشرات الأداء القابلة للملاحظة، مع إلزامية توفير مصدر رئيسي وبديلين لكل نشاط تعليمي لضمان استمرارية التعلم تحت كافة الظروف.
          </p>
        </div>

        {/* Row 3: Middle Actions Bar - Single horizontal row right to left */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => setIsCurriculumPickerOpen(true)}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md hover:scale-[1.01] active:scale-97 transition-all cursor-pointer border border-amber-300 shrink-0"
            title="استيراد من قاعدة بيانات الكفايات OER"
          >
            <FolderOpen className="w-4 h-4 text-slate-950 shrink-0" />
            <span>استيراد من قاعدة بيانات الكفايات OER ⚡</span>
          </button>

          {onOpenCompetenciesModal && (
            <button
              type="button"
              onClick={onOpenCompetenciesModal}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-black rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md hover:scale-[1.01] active:scale-97 transition-all cursor-pointer border border-emerald-400/60 shrink-0"
              title="مكتبة الكفايات الوطنية"
            >
              <Award className="w-4 h-4 text-amber-300 shrink-0" />
              <span>مكتبة الكفايات الوطنية 🎯</span>
            </button>
          )}

          {onOpenPalestinianOerHub && (
            <button
              type="button"
              onClick={onOpenPalestinianOerHub}
              className="px-4 py-2.5 bg-teal-700 hover:bg-teal-600 text-white font-black rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md hover:scale-[1.01] active:scale-97 transition-all cursor-pointer border border-teal-400/60 shrink-0"
              title="مصادر معتمدة OER — PS"
            >
              <span className="text-amber-300">🇵🇸</span>
              <Globe className="w-4 h-4 text-emerald-200 shrink-0" />
              <span>مصادر معتمدة OER — PS 📚</span>
            </button>
          )}

          {onOpenSmartGuideModal && (
            <button
              type="button"
              onClick={onOpenSmartGuideModal}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md hover:scale-[1.01] active:scale-97 transition-all cursor-pointer border border-amber-300 shrink-0"
              title="مرشد عبقور وفحص التوافق"
            >
              <Lightbulb className="w-4 h-4 text-slate-950 shrink-0 animate-pulse" />
              <span>مرشد عبقور وفحص التوافق 💡</span>
            </button>
          )}

          {onOpenAiModal && (
            <button
              type="button"
              onClick={onOpenAiModal}
              className="px-3.5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 border border-emerald-400/50 shadow-md hover:scale-[1.01] transition-all cursor-pointer shrink-0"
              title="توليد ذكي (AI)"
            >
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span>توليد ذكي (AI) ⚡</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsAddResourceModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md hover:scale-[1.01] active:scale-97 transition-all cursor-pointer border border-emerald-400 shrink-0"
            title="إضافة مصدر مفتوح جديد"
          >
            <Plus className="w-4 h-4 text-amber-300 shrink-0" />
            <span>➕ إضافة مصدر مفتوح</span>
          </button>
        </div>

      </div>



      {/* ===================== SECTION 1: بيانات الدرس ===================== */}
      <section className="bg-white rounded-3xl border-2 border-slate-200/90 shadow-sm overflow-hidden transition-all hover:border-emerald-300">
        <div className="bg-linear-to-r from-emerald-50 via-teal-50 to-white px-5 sm:px-7 py-4 border-b border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black text-base shadow-xs">
              ١
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                بيانات الدرس الأساسية (دليل المعلم الفلسطيني OER)
              </h2>
              <p className="text-xs text-slate-600">
                المادة، الصف، الشعبة، التاريخ، المدة الزمنية، واسم المعلم والمدرسة
              </p>
            </div>
          </div>

          {/* Toggle Grade Scope */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAllGrades(!showAllGrades)}
              className="text-xs font-bold text-emerald-800 bg-white hover:bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>{showAllGrades ? '🔍 إظهار صفوف المرحلة الأولى (١-٤ فقط)' : '🌐 توسيع لكافة الصفوف (١-١٢)'}</span>
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-7 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* 1. المادة */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700">
                المبحث / المادة <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={oer.lessonInfo.subject}
                onChange={(e) => handleUpdateLessonInfo('subject', e.target.value)}
                placeholder="مثال: الرياضيات، اللغة العربية..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 text-xs sm:text-sm font-bold focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-hidden"
              />
            </div>

            {/* 2. الصف */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700">
                الصف الدراسي <span className="text-rose-500">*</span>
              </label>
              <select
                value={oer.lessonInfo.grade}
                onChange={(e) => handleUpdateLessonInfo('grade', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 text-xs sm:text-sm font-bold focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-hidden cursor-pointer"
              >
                {showAllGrades
                  ? STANDARD_GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))
                  : PRIMARY_GRADES_1_TO_4.map((g) => (
                      <option key={g} value={g}>
                        ⭐ {g} (المرحلة الأولى)
                      </option>
                    ))}
              </select>
            </div>

            {/* 3. الشعبة */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700">
                الشعبة <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={oer.lessonInfo.section}
                onChange={(e) => handleUpdateLessonInfo('section', e.target.value)}
                placeholder="أ، ب، ج، د..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 text-xs sm:text-sm font-bold focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-hidden text-center"
              />
            </div>

            {/* 4. التاريخ */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700">
                التاريخ <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={oer.lessonInfo.date}
                onChange={(e) => handleUpdateLessonInfo('date', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 text-xs sm:text-sm font-bold focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-hidden"
              />
            </div>

            {/* 5. مدة الحصة بالدقائق */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700">
                مدة الحصة (بالدقائق) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="20"
                  max="120"
                  step="5"
                  value={oer.lessonInfo.durationMinutes}
                  onChange={(e) => handleUpdateLessonInfo('durationMinutes', parseInt(e.target.value, 10) || 40)}
                  className="w-full pl-12 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 text-xs sm:text-sm font-bold focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-hidden"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 pointer-events-none">
                  دقيقة
                </span>
              </div>
            </div>

            {/* 6. اسم المعلم */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700">
                اسم المعلم/ة <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={oer.lessonInfo.teacherName}
                onChange={(e) => handleUpdateLessonInfo('teacherName', e.target.value)}
                placeholder="اسم المعلم/ة الكامل"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 text-xs sm:text-sm font-bold focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-hidden"
              />
            </div>
          </div>

          {/* Row 2: عنوان الدرس والوحدة والمدرسة والمديرية */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
            <div className="space-y-1.5 sm:col-span-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-slate-700">
                  عنوان الدرس وموضوعه <span className="text-rose-500">*</span>
                </label>
                {oer.lessonInfo.lessonTitle?.trim() && onOpenSmartGuideModal && (
                  <button
                    type="button"
                    onClick={onOpenSmartGuideModal}
                    className="text-[11px] font-black text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-2.5 py-0.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                    title="فتح مقترحات المنهاج وثلاثي المصادر والمواقف وفحص التوافق"
                  >
                    <Lightbulb className="w-3 h-3 text-amber-700 animate-pulse" />
                    <span>مرشد عبقور التربوي 💡</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                value={oer.lessonInfo.lessonTitle}
                onChange={(e) => handleUpdateLessonInfo('lessonTitle', e.target.value)}
                placeholder="مثلاً: القيمة المنزلية للأعداد ضمن ٩٩٩٩، قراءة النص الجهرية..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 text-xs sm:text-sm font-bold focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-hidden"
              />
              {oer.lessonInfo.lessonTitle?.trim() && (
                <div className="mt-1.5 p-2.5 bg-gradient-to-r from-amber-50 via-orange-50 to-emerald-50 border border-amber-300/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                    <span className="text-slate-800 font-bold">
                      المساعد الذكي: جاهز باقتراحات المنهاج الفلسطيني فوراً (الكفايات، الأهداف، ثلاثي المصادر، الموقف التعليمي، ودعم/إثراء).
                    </span>
                  </div>
                  {onOpenSmartGuideModal && (
                    <button
                      type="button"
                      onClick={onOpenSmartGuideModal}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-black shrink-0 transition-all cursor-pointer shadow-xs flex items-center gap-1 self-end sm:self-auto"
                    >
                      <span>معاينة وتطبيق الاقتراحات ⚡</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700">
                اسم المدرسة
              </label>
              <input
                type="text"
                value={oer.lessonInfo.school}
                onChange={(e) => handleUpdateLessonInfo('school', e.target.value)}
                placeholder="مدرسة..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 text-xs sm:text-sm font-bold focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700">
                مديرية التربية والتعليم
              </label>
              <input
                type="text"
                value={oer.lessonInfo.directorate}
                onChange={(e) => handleUpdateLessonInfo('directorate', e.target.value)}
                placeholder="مديرية..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 text-xs sm:text-sm font-bold focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-hidden"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Live Compliance & Pedagogical Guide Callout */}
      {(() => {
        const compliance = auditPlanCompliance(planWithOer);
        return (
          <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl p-4 sm:p-5 border border-slate-700 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0 mt-0.5">
                <Lightbulb className="w-5 h-5 text-amber-400" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                    <span>مرشد عبقور وفحص التوافق الوزاري</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold">
                      نسبة التوافق: {toArabicDigits(compliance.overallScore)}%
                    </span>
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {compliance.warnings.length === 0 ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      خطة الدرس مطابقة بالكامل للمنهاج ومعايير OER الفلسطينية (مصادر متعددة، كفايات مربوطة، ومؤشرات واضحة).
                    </span>
                  ) : (
                    <span>
                      تم رصد {toArabicDigits(compliance.warnings.length)} تنبيهات: «{compliance.warnings[0].title}». انقر لفتح المرشد التربوي ومعاينتها وإصلاحها تلقائياً.
                    </span>
                  )}
                </p>
              </div>
            </div>

            {onOpenSmartGuideModal && (
              <button
                type="button"
                onClick={onOpenSmartGuideModal}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                <span>فتح المرشد الذكي وفحص التوافق</span>
              </button>
            )}
          </div>
        );
      })()}

      {/* ===================== SECTION 2: الكفايات المستهدفة ===================== */}
      <section className="bg-white rounded-3xl border-2 border-slate-200/90 shadow-sm overflow-hidden transition-all hover:border-emerald-300">
        <div className="bg-linear-to-r from-blue-50 via-teal-50 to-white px-5 sm:px-7 py-4 border-b border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-700 text-white flex items-center justify-center font-black text-base shadow-xs">
              ٢
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <span>الكفايات المستهدفة</span>
                <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md">
                  كفاية عامة ← كفاية خاصة ← مؤشرات أداء قابلة للملاحظة
                </span>
              </h2>
              <p className="text-xs text-slate-600">
                التسلسل البيداغوجي المعتمد في دليل المعلم الفلسطيني للتعليم المستند لمصادر التعليم المفتوحة OER
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCurriculumPickerOpen(true)}
            className="text-xs font-black text-blue-900 bg-blue-100/90 hover:bg-blue-200 border border-blue-300 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-700" />
            <span>اقتراح كفايات المنهاج الفلسطيني 🇵🇸</span>
          </button>
        </div>

        <div className="p-5 sm:p-7 space-y-6">
          {/* كفاية عامة & كفاية خاصة */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* كفاية عامة */}
            <div className="bg-blue-50/40 rounded-2xl p-4 border border-blue-200/80 space-y-2">
              <div className="flex items-center gap-2 text-blue-900 font-black text-xs sm:text-sm">
                <Target className="w-4 h-4 text-blue-700 shrink-0" />
                <span>الكفاية العامة (General Competency)</span>
              </div>
              <p className="text-[11px] text-blue-800/80">
                المهارات الحياتية والقدرات العليا التراكمية في المبحث والمواطنة والتعلم المستدام.
              </p>
              <textarea
                rows={3}
                value={oer.targetCompetencies.generalCompetency}
                onChange={(e) => handleUpdateCompetency('generalCompetency', e.target.value)}
                placeholder="مثال: التفكير الرياضي والحس العددي وتوظيف الأعداد في حل مشكلات حياتية واقعية..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-blue-200 bg-white text-slate-900 text-xs sm:text-sm font-semibold focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all outline-hidden resize-none leading-relaxed"
              />
            </div>

            {/* كفاية خاصة */}
            <div className="bg-teal-50/40 rounded-2xl p-4 border border-teal-200/80 space-y-2">
              <div className="flex items-center gap-2 text-teal-900 font-black text-xs sm:text-sm">
                <Compass className="w-4 h-4 text-teal-700 shrink-0" />
                <span>الكفاية الخاصة (Specific Competency)</span>
              </div>
              <p className="text-[11px] text-teal-800/80">
                الكفاية المعرفية والتطبيقية المباشرة المرتبطة بموضوع الدرس وأنشطته.
              </p>
              <textarea
                rows={3}
                value={oer.targetCompetencies.specificCompetency}
                onChange={(e) => handleUpdateCompetency('specificCompetency', e.target.value)}
                placeholder="مثال: تحديد القيمة المنزلية لكل رقم في عدد مكون من ٤ منازل، وتمثيله بطرق متعددة..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-teal-200 bg-white text-slate-900 text-xs sm:text-sm font-semibold focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 transition-all outline-hidden resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* مؤشرات أداء قابلة للملاحظة والقياس */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>مؤشرات أداء قابلة للملاحظة والقياس (Observable Performance Indicators)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  سلوكيات ومخرجات محددة يقوم بها الطالب ويمكن للمعلم رصدها وتقويمها مباشرة
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddIndicator}
                className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-emerald-300"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-800" />
                <span>إضافة مؤشر أداء</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {oer.targetCompetencies.observableIndicators.map((indicator, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/90 group hover:border-emerald-300 transition-all"
                >
                  <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs font-black shrink-0">
                    {toArabicDigits(idx + 1)}
                  </span>
                  <input
                    type="text"
                    value={indicator}
                    onChange={(e) => handleUpdateIndicator(idx, e.target.value)}
                    placeholder="صياغة مؤشر الأداء بفعل سلوكي واضح..."
                    className="flex-1 bg-white px-3 py-1.5 rounded-xl border border-slate-300 text-slate-900 text-xs sm:text-sm font-semibold focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveIndicator(idx)}
                    disabled={oer.targetCompetencies.observableIndicators.length <= 1}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    title="حذف هذا المؤشر"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== SECTION 3 & 4: الموقف التعليمي ومصادر OER ===================== */}
      <section className="bg-white rounded-3xl border-2 border-slate-200/90 shadow-sm overflow-hidden transition-all hover:border-emerald-300">
        <div className="bg-linear-to-r from-teal-50 via-emerald-50 to-white px-5 sm:px-7 py-4 border-b border-teal-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-800 text-white flex items-center justify-center font-black text-base shadow-xs">
              ٣
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <span>الموقف التعليمي ومصادر التعليم المفتوحة OER</span>
                <span className="text-xs font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md">
                  تمهيد → خطوات موزعة بزمن محدد → أدوار الطلبة → منتجات متوقعة
                </span>
              </h2>
              <p className="text-xs text-slate-600">
                لكل نشاط: <strong className="text-emerald-800 font-black">مصدر رئيسي + بديلان على الأقل</strong> (كتاب — فيديو — رابط — صورة — بيئي) مع بيان الرخصة وروابط مباشرة
              </p>
            </div>
          </div>

          {/* Time tracker indicator */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-2 ${
                totalAllocatedMinutes === durationTarget
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                  : 'bg-amber-50 text-amber-900 border-amber-300'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>
                إجمالي زمن الأنشطة:{' '}
                <strong className="text-sm font-black">{toArabicDigits(totalAllocatedMinutes)}</strong> /{' '}
                {toArabicDigits(durationTarget)} دقيقة
              </span>
            </div>

            <button
              type="button"
              onClick={handleAddActivity}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة خطوة إجرائية</span>
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-7 space-y-6">
          {oer.activities.map((act, actIdx) => {
            const isInduction = act.stageType === 'induction';
            const isClosure = act.stageType === 'closure';

            return (
              <div
                key={act.id}
                className="bg-slate-50/70 border-2 border-slate-200 rounded-3xl p-5 sm:p-6 space-y-5 hover:border-teal-400/80 transition-all shadow-2xs"
              >
                {/* Header row of activity */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2.5 flex-1">
                    <span
                      className={`px-2.5 py-1 rounded-xl text-xs font-black ${
                        isInduction
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : isClosure
                          ? 'bg-purple-100 text-purple-900 border border-purple-300'
                          : 'bg-teal-100 text-teal-900 border border-teal-300'
                      }`}
                    >
                      {isInduction ? '🌟 التمهيد والتهيئة' : isClosure ? '🏁 الختام والغلق' : `⚡ الخطوة ${actIdx + 1}`}
                    </span>

                    <input
                      type="text"
                      value={act.title}
                      onChange={(e) =>
                        handleUpdateActivity(actIdx, (prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="flex-1 bg-white px-3 py-1.5 rounded-xl border border-slate-300 text-slate-900 text-xs sm:text-sm font-black focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 transition-all outline-hidden"
                      placeholder="عنوان النشاط أو الموقف التعليمي..."
                    />
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    {/* Time input */}
                    <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-slate-300 text-xs font-bold">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="number"
                        min="2"
                        max="60"
                        step="1"
                        value={act.allocatedTimeMinutes}
                        onChange={(e) =>
                          handleUpdateActivity(actIdx, (prev) => ({
                            ...prev,
                            allocatedTimeMinutes: parseInt(e.target.value, 10) || 5,
                          }))
                        }
                        className="w-10 text-center font-black text-slate-900 outline-hidden"
                      />
                      <span className="text-slate-500">دقيقة</span>
                    </div>

                    {/* Delete Activity */}
                    <button
                      type="button"
                      onClick={() => handleRemoveActivity(actIdx)}
                      disabled={oer.activities.length <= 2}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
                      title="حذف هذا النشاط"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Grid: Description & Student Roles & Expected Products */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* الخطوات الإجرائية للموقف التعليمي */}
                  <div className="lg:col-span-6 space-y-1.5">
                    <label className="block text-xs font-black text-slate-700 flex items-center justify-between">
                      <span>إجراءات التدريس والخطوات الموزعة</span>
                      <span className="text-[11px] text-slate-500 font-normal">دور المعلم والتوجيه الصفي</span>
                    </label>
                    <textarea
                      rows={4}
                      value={act.description}
                      onChange={(e) =>
                        handleUpdateActivity(actIdx, (prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="صف خطوات تنفيذ النشاط بوضوح، وكيف يتم تقديم المفهوم وطرح الأسئلة السابرة..."
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 bg-white text-slate-900 text-xs sm:text-sm font-semibold focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 transition-all outline-hidden resize-none leading-relaxed"
                    />
                  </div>

                  {/* أدوار الطلبة والمنتجات المتوقعة */}
                  <div className="lg:col-span-6 space-y-3">
                    {/* دور الطلبة: أزرار الاختيار (فردي / ثنائي / مجموعات / جماعي) */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black text-slate-700">
                        أدوار الطلبة (نمط التفاعل الصفي)
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {(['individual', 'pairs', 'groups', 'collective'] as OerStudentRole[]).map((roleKey) => {
                          const config = STUDENT_ROLES_CONFIG[roleKey];
                          const Icon = config.icon;
                          const isSelected = act.studentRoles === roleKey;
                          return (
                            <button
                              key={roleKey}
                              type="button"
                              onClick={() =>
                                handleUpdateActivity(actIdx, (prev) => ({
                                  ...prev,
                                  studentRoles: roleKey,
                                }))
                              }
                              className={`p-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-teal-700 text-white border-teal-700 shadow-xs scale-102'
                                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5 shrink-0" />
                              <span>{config.label}</span>
                            </button>
                          );
                        })}
                      </div>
                      <input
                        type="text"
                        value={act.studentRolesDetails}
                        onChange={(e) =>
                          handleUpdateActivity(actIdx, (prev) => ({
                            ...prev,
                            studentRolesDetails: e.target.value,
                          }))
                        }
                        placeholder="تفصيل دور الطلبة داخل النشاط..."
                        className="w-full mt-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-semibold focus:border-teal-600 outline-hidden"
                      />
                    </div>

                    {/* المنتجات المتوقعة */}
                    <div className="space-y-1">
                      <label className="block text-xs font-black text-slate-700">
                        المنتجات المتوقعة (Expected Products)
                      </label>
                      <input
                        type="text"
                        value={act.expectedProducts}
                        onChange={(e) =>
                          handleUpdateActivity(actIdx, (prev) => ({
                            ...prev,
                            expectedProducts: e.target.value,
                          }))
                        }
                        placeholder="مثلاً: رسم بياني، بطاقة قراءة، نموذج ملموس، حل ورقة العمل..."
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs sm:text-sm font-semibold focus:border-teal-600 outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* ===================== مصادر التعليم المفتوحة OER للنشاط (رئيسي + بديلان) ===================== */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-300/80 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-700" />
                      <h4 className="text-xs sm:text-sm font-black text-slate-900">
                        مصادر التعليم للنشاط: مصدر رئيسي + بديلان على الأقل (حسب دليل OER الفلسطيني)
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>متوافق كلياً مع معايير رخص المشاع الإبداعي والاعتماد الوزاري</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* 1. المصدر الرئيسي */}
                    <ResourceEditorCard
                      label="🌟 المصدر الرئيسي (Primary OER)"
                      badgeColor="bg-emerald-600 text-white"
                      resource={act.primaryResource}
                      onChange={(updatedRes) =>
                        handleUpdateActivity(actIdx, (prev) => ({
                          ...prev,
                          primaryResource: updatedRes,
                        }))
                      }
                    />

                    {/* 2. البديل الأول */}
                    <ResourceEditorCard
                      label="🔄 البديل الأول (Alternative 1)"
                      badgeColor="bg-blue-600 text-white"
                      resource={act.alternativeResource1}
                      onChange={(updatedRes) =>
                        handleUpdateActivity(actIdx, (prev) => ({
                          ...prev,
                          alternativeResource1: updatedRes,
                        }))
                      }
                    />

                    {/* 3. البديل الثاني */}
                    <ResourceEditorCard
                      label="🔄 البديل الثاني الأوفلاين (Alternative 2)"
                      badgeColor="bg-amber-600 text-white"
                      resource={act.alternativeResource2}
                      onChange={(updatedRes) =>
                        handleUpdateActivity(actIdx, (prev) => ({
                          ...prev,
                          alternativeResource2: updatedRes,
                        }))
                      }
                    />
                  </div>
                </div>

                {/* تقويم النشاط: تكويني + منتج */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-200 space-y-1">
                    <span className="text-xs font-black text-emerald-950 block">
                      🔄 التقويم التكويني (أثناء العمل والملاحظة)
                    </span>
                    <input
                      type="text"
                      value={act.formativeAssessment}
                      onChange={(e) =>
                        handleUpdateActivity(actIdx, (prev) => ({
                          ...prev,
                          formativeAssessment: e.target.value,
                        }))
                      }
                      placeholder="كيف يتحقق المعلم من استيعاب الطلبة أثناء النشاط؟"
                      className="w-full bg-white px-3 py-1.5 rounded-xl border border-emerald-200 text-xs text-slate-900 font-semibold focus:border-emerald-600 outline-hidden"
                    />
                  </div>

                  <div className="bg-purple-50/50 p-3 rounded-2xl border border-purple-200 space-y-1">
                    <span className="text-xs font-black text-purple-950 block">
                      🎯 تقويم المنتج ومخرجات الطلبة
                    </span>
                    <input
                      type="text"
                      value={act.productAssessment}
                      onChange={(e) =>
                        handleUpdateActivity(actIdx, (prev) => ({
                          ...prev,
                          productAssessment: e.target.value,
                        }))
                      }
                      placeholder="أداة التحقق من جودة المنتج (قائمة شطب، سلم تقدير...)"
                      className="w-full bg-white px-3 py-1.5 rounded-xl border border-purple-200 text-xs text-slate-900 font-semibold focus:border-purple-600 outline-hidden"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===================== SECTION 5: التقويم الشامل والختامي ===================== */}
      <section className="bg-white rounded-3xl border-2 border-slate-200/90 shadow-sm overflow-hidden transition-all hover:border-emerald-300">
        <div className="bg-linear-to-r from-purple-50 via-teal-50 to-white px-5 sm:px-7 py-4 border-b border-purple-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-700 text-white flex items-center justify-center font-black text-base shadow-xs">
            ٤
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span>منظومة التقويم الشامل</span>
              <span className="text-xs font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-md">
                تكويني → تقويم المنتج → تقويم ختامي مرتبط بمؤشرات الكفاية
              </span>
            </h2>
            <p className="text-xs text-slate-600">
              ربط الأدوات التقويمية بنتائج التعلم المستهدفة وسلالم التقدير اللفظية
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-7 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* وصف التقويم الختامي */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-black text-slate-700">
                مهمة التقويم الختامي (Summative Assessment Task)
              </label>
              <textarea
                rows={3}
                value={oer.summativeAssessment.description}
                onChange={(e) =>
                  handleUpdateOer({
                    ...oer,
                    summativeAssessment: {
                      ...oer.summativeAssessment,
                      description: e.target.value,
                    },
                  })
                }
                placeholder="صف مهمة الأداء الختامية أو الاختبار القصير الموجه لقياس تحقق الكفاية الخاصة..."
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 bg-slate-50/50 text-slate-900 text-xs sm:text-sm font-semibold focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 transition-all outline-hidden resize-none leading-relaxed"
              />
            </div>

            {/* أداة التقويم */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700">
                أداة التقويم المختارة
              </label>
              <textarea
                rows={3}
                value={oer.summativeAssessment.assessmentTool}
                onChange={(e) =>
                  handleUpdateOer({
                    ...oer,
                    summativeAssessment: {
                      ...oer.summativeAssessment,
                      assessmentTool: e.target.value,
                    },
                  })
                }
                placeholder="مثلاً: سلم تقدير لفظي (Rubric) من ٤ مستويات، بطاقة خروج، قائمة رصد..."
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 bg-slate-50/50 text-slate-900 text-xs sm:text-sm font-semibold focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 transition-all outline-hidden resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* الربط بمؤشرات الكفاية */}
          <div className="bg-purple-50/40 p-4 rounded-2xl border border-purple-200/80 space-y-2">
            <label className="block text-xs font-black text-purple-950 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-purple-700" />
              <span>الربط المباشر بمؤشرات الكفاية (Alignment With Competency Indicators)</span>
            </label>
            <input
              type="text"
              value={oer.summativeAssessment.alignmentWithIndicators}
              onChange={(e) =>
                handleUpdateOer({
                  ...oer,
                  summativeAssessment: {
                    ...oer.summativeAssessment,
                    alignmentWithIndicators: e.target.value,
                  },
                })
              }
              placeholder="يوضح المعلم هنا كيف تقيس أسئلة ومهمات التقويم كل مؤشر من مؤشرات الأداء السابقة بدقة..."
              className="w-full px-3.5 py-2 rounded-xl border border-purple-200 bg-white text-slate-900 text-xs sm:text-sm font-semibold focus:border-purple-600 outline-hidden"
            />
          </div>
        </div>
      </section>

      {/* ===================== SECTION 6: بدائل وملاحظات ما بعد الدرس ===================== */}
      <section className="bg-white rounded-3xl border-2 border-slate-200/90 shadow-sm overflow-hidden transition-all hover:border-emerald-300">
        <div className="bg-linear-to-r from-amber-50 via-teal-50 to-white px-5 sm:px-7 py-4 border-b border-amber-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-700 text-white flex items-center justify-center font-black text-base shadow-xs">
            ٥
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span>بدائل وملاحظات (التدابير الاحترازية والتأمل البيداغوجي)</span>
              <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                حلول عند تعذر مصدر — ما بعد الدرس
              </span>
            </h2>
            <p className="text-xs text-slate-600">
              خطط بديلة للطوارئ وانقطاع الإنترنت وتأمل المعلم الذاتي لتطوير الممارسات
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-7 space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* حلول عند تعذر مصدر */}
            <div className="bg-amber-50/40 p-4 rounded-2xl border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 text-amber-950 font-black text-xs sm:text-sm">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>حلول وتدابير عند تعذر مصدر أو انقطاع التقنية</span>
              </div>
              <p className="text-[11px] text-amber-900/80">
                ما الذي سيفعله المعلم فوراً إذا انقطعت الكهرباء أو الإنترنت أو تعذر تشغيل الرابط؟
              </p>
              <textarea
                rows={4}
                value={oer.contingenciesAndNotes.sourceContingencies}
                onChange={(e) =>
                  handleUpdateOer({
                    ...oer,
                    contingenciesAndNotes: {
                      ...oer.contingenciesAndNotes,
                      sourceContingencies: e.target.value,
                    },
                  })
                }
                placeholder="الاعتماد الفوري على الخامات البيئية والمحسوسات الملموسة والبطاقات الورقية المطبوعة مسبقاً..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200 bg-white text-slate-900 text-xs sm:text-sm font-semibold focus:border-amber-600 outline-hidden resize-none leading-relaxed"
              />
            </div>

            {/* ما بعد الدرس: التأمل الذاتي */}
            <div className="bg-emerald-50/40 p-4 rounded-2xl border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2 text-emerald-950 font-black text-xs sm:text-sm">
                <Lightbulb className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>ما بعد الدرس: التأمل الذاتي وفرص التحسين</span>
              </div>
              <p className="text-[11px] text-emerald-900/80">
                ملاحظات المعلم بعد الحصة: ما الذي نجح بقوة؟ وما التحديات؟
              </p>
              <textarea
                rows={4}
                value={oer.contingenciesAndNotes.postLessonReflection}
                onChange={(e) =>
                  handleUpdateOer({
                    ...oer,
                    contingenciesAndNotes: {
                      ...oer.contingenciesAndNotes,
                      postLessonReflection: e.target.value,
                    },
                  })
                }
                placeholder="تفاعل الطلبة مع المحسوسات، النقاط التي استوعبها الجميع، والمهارات التي تحتاج لمزيد من التدريب..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-white text-slate-900 text-xs sm:text-sm font-semibold focus:border-emerald-600 outline-hidden resize-none leading-relaxed"
              />
            </div>

            {/* متابعة الطلبة والدعم الفردي */}
            <div className="bg-blue-50/40 p-4 rounded-2xl border border-blue-200 space-y-2">
              <div className="flex items-center gap-2 text-blue-950 font-black text-xs sm:text-sm">
                <Users2 className="w-4 h-4 text-blue-700 shrink-0" />
                <span>متابعة الطلبة ذوي الدعم الإضافي والموهوبين</span>
              </div>
              <p className="text-[11px] text-blue-900/80">
                إجراءات التدخل العلاجي للطلبة المحتاجين وأنشطة التحدي والإثراء
              </p>
              <textarea
                rows={4}
                value={oer.contingenciesAndNotes.followUpActions}
                onChange={(e) =>
                  handleUpdateOer({
                    ...oer,
                    contingenciesAndNotes: {
                      ...oer.contingenciesAndNotes,
                      followUpActions: e.target.value,
                    },
                  })
                }
                placeholder="تخصيص بطاقة دعم علاجي منزلية ومهمة تحدٍ إضافية للطلبة المتميزين..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-blue-200 bg-white text-slate-900 text-xs sm:text-sm font-semibold focus:border-blue-600 outline-hidden resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===================== CURRICULUM PRESET PICKER MODAL ===================== */}
      {isCurriculumPickerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border-2 border-emerald-500 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-linear-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-400 text-slate-950 rounded-2xl font-black">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black font-['Tajawal'] flex items-center gap-2">
                    <span>قاعدة بيانات الكفايات والمصادر المفتوحة OER للمنهاج الفلسطيني 🇵🇸</span>
                  </h3>
                  <p className="text-xs text-emerald-200 mt-0.5">
                    اختر خطة نموذجية معتمدة لتعبئة الكفايات والمصادر الرئيسية والبديلة تلقائياً
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCurriculumPickerOpen(false)}
                className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Content List */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              <div className="text-xs text-slate-600 bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                <span>
                  جميع النماذج أدناه مستقاة مباشرة من <strong>دليل المعلم للتعليم المستند إلى مصادر التعليم المفتوحة OER</strong> ومربوطة بمصادر معتمدة من وزارة التربية والتعليم العالي عبر <strong>elearn.edu.ps</strong> و<strong>منصة روافد</strong>.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {OER_PALESTINIAN_DATABASE.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4.5 space-y-3 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="bg-emerald-800 text-white px-2.5 py-0.5 rounded-lg text-xs font-black">
                          {entry.subject}
                        </span>
                        <span className="bg-blue-100 text-blue-900 border border-blue-300 px-2.5 py-0.5 rounded-lg text-xs font-bold">
                          {entry.grade}
                        </span>
                      </div>

                      <h4 className="text-sm font-black text-slate-900">{entry.lessonTitle}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {entry.unitTitle}
                      </p>

                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs space-y-1">
                        <span className="text-[11px] font-black text-teal-800 block">
                          الكفاية الخاصة:
                        </span>
                        <p className="text-slate-700 line-clamp-2 text-[11px]">
                          {entry.specificCompetency}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApplyPreset(entry)}
                      className="w-full mt-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>تطبيق واستيراد هذه الخطة ⚡</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsCurriculumPickerOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== ADD OPEN SOURCE MODAL ===================== */}
      {isAddResourceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-2 border-emerald-500 space-y-5 animate-in fade-in zoom-in-95 duration-200" dir="rtl">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black">
                  ➕
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 font-['Tajawal']">إضافة مصدر مفتوح جديد (OER)</h3>
                  <p className="text-xs text-slate-500">إثراء بنك المصادر المفتوحة الفلسطيني وفق منهاج وزارة التربية والتعليم</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddResourceModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
              {/* 1. اسم المصدر */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  اسم المصدر <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newResTitle}
                  onChange={(e) => setNewResTitle(e.target.value)}
                  placeholder="مثال: فيديو تفاعلي لجدول الضرب، دليل المعلم..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs sm:text-sm font-bold focus:bg-white focus:border-emerald-600 outline-hidden"
                />
              </div>

              {/* 2. النوع */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  نوع المصدر <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newResType}
                  onChange={(e) => setNewResType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs sm:text-sm font-bold focus:bg-white focus:border-emerald-600 outline-hidden cursor-pointer"
                >
                  <option value="video">🎥 فيديو تفاعلي</option>
                  <option value="book">📖 كتاب / دليل</option>
                  <option value="image">🖼️ صورة / بطاقة تعليمية</option>
                  <option value="link">🔗 رابط / منصة تعليمية</option>
                  <option value="file">📄 ملف / وثيقة PDF</option>
                  <option value="activity">⚡ نشاط تطبيقي / مهمة</option>
                </select>
              </div>

              {/* 3. الرابط / المسار */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  الرابط / المسار <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newResUrl}
                  onChange={(e) => setNewResUrl(e.target.value)}
                  placeholder="https://elearn.edu.ps/... أو مسار الملف"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs sm:text-sm font-semibold focus:bg-white focus:border-emerald-600 outline-hidden text-left"
                  dir="ltr"
                />
              </div>

              {/* 4. المرجع / الجهة المصدرة */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  المرجع / الجهة المصدرة <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newResSource}
                  onChange={(e) => setNewResSource(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs sm:text-sm font-bold focus:bg-white focus:border-emerald-600 outline-hidden cursor-pointer"
                >
                  <option value="وزارة التربية والتعليم العالي">وزارة التربية والتعليم العالي</option>
                  <option value="بوابة التعليم الإلكتروني elearn.edu.ps">بوابة التعليم الإلكتروني elearn.edu.ps</option>
                  <option value="منصة روافد التعليمية">منصة روافد التعليمية</option>
                  <option value="منصة خارجية معتمدة">منصة خارجية معتمدة</option>
                  <option value="إعداد المعلم / مصدر محلي">إعداد المعلم / مصدر محلي</option>
                </select>
              </div>

              {/* 5. الرخصة */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  رخصة الاستخدام <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newResLicense}
                  onChange={(e) => setNewResLicense(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs sm:text-sm font-bold focus:bg-white focus:border-emerald-600 outline-hidden cursor-pointer"
                >
                  <option value="open">🟢 مفتوح (Creative Commons OER)</option>
                  <option value="public_domain">🟡 ملكية عامة (Public Domain)</option>
                  <option value="shared_rights">🔵 بحقوق مشاركة تربوية</option>
                </select>
              </div>

              {/* 6. ملاحظات موجزة */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  ملاحظات موجزة (ما يغطي هذا المصدر من موضوعات)
                </label>
                <textarea
                  rows={3}
                  value={newResNotes}
                  onChange={(e) => setNewResNotes(e.target.value)}
                  placeholder="اكتب باختصار الموضوعات والكفايات التي يغطيها هذا المصدر..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs sm:text-sm font-medium focus:bg-white focus:border-emerald-600 outline-hidden"
                />
              </div>

              {/* Checkbox: ربط بالخطة الحالية */}
              <div className="flex items-center gap-2 pt-2 border-t">
                <input
                  type="checkbox"
                  id="linkToPlanCheck"
                  checked={newResLinkToPlan}
                  onChange={(e) => setNewResLinkToPlan(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="linkToPlanCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                  🔗 ربط تلقائي بالخطة الحالية (تحديث مصادر الدرس النشط)
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setIsAddResourceModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!newResTitle.trim()) {
                    alert('يرجى إدخال عنوان المصدر');
                    return;
                  }
                  const mappedType =
                    newResType === 'video'
                      ? 'video'
                      : newResType === 'book'
                      ? 'textbook'
                      : newResType === 'image'
                      ? 'image'
                      : newResType === 'link'
                      ? 'link'
                      : newResType === 'file'
                      ? 'document'
                      : 'worksheet';

                  const newResObj: EducationalResource = {
                    id: `custom-res-${Date.now()}`,
                    type: mappedType as any,
                    title: newResTitle.trim(),
                    content: newResNotes.trim() || newResUrl.trim() || 'مصدر مفتوح معتمد',
                    sourceInfo: newResSource,
                    createdAt: new Date().toLocaleDateString('ar-PS'),
                    tags: [newResType, 'مصدر مفتوح', 'OER'],
                    fileDataUrl: newResUrl.trim(),
                  };

                  if (onAddResource) {
                    onAddResource(newResObj, newResLinkToPlan);
                  } else {
                    try {
                      const existing = JSON.parse(localStorage.getItem('educational_expert_resources_v1') || '[]');
                      localStorage.setItem('educational_expert_resources_v1', JSON.stringify([newResObj, ...existing]));
                    } catch (e) {}
                  }

                  setIsAddResourceModalOpen(false);
                  setNewResTitle('');
                  setNewResUrl('');
                  setNewResNotes('');
                  alert('✅ تم إضافة وحفظ المصدر المفتوح بنجاح في بنك المصادر!');
                }}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <span>✅ إضافة وحفظ في بنك المصادر المفتوحة</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Subcomponent for editing an individual OER Resource (Primary or Alternative)
 */
interface ResourceEditorCardProps {
  label: string;
  badgeColor: string;
  resource: OerResourceItem;
  onChange: (updated: OerResourceItem) => void;
}

const ResourceEditorCard: React.FC<ResourceEditorCardProps> = ({
  label,
  badgeColor,
  resource,
  onChange,
}) => {
  const currentTypeConfig = RESOURCE_TYPES_CONFIG[resource.type || 'book'] || RESOURCE_TYPES_CONFIG.book;
  const currentLicenseConfig = LICENSE_CONFIG[resource.licenseType || 'ministry_elearn'] || LICENSE_CONFIG.ministry_elearn;

  return (
    <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200 space-y-2.5 flex flex-col justify-between">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-1">
          <span className={`px-2 py-0.5 rounded-md text-[11px] font-black ${badgeColor}`}>
            {label}
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${currentTypeConfig.bg} ${currentTypeConfig.color} ${currentTypeConfig.border} font-bold`}>
            {currentTypeConfig.label}
          </span>
        </div>

        {/* Title Input */}
        <div>
          <label className="block text-[10px] font-black text-slate-600 mb-0.5">
            عنوان ووصف المصدر
          </label>
          <input
            type="text"
            value={resource.title}
            onChange={(e) => onChange({ ...resource, title: e.target.value })}
            placeholder="مثال: كتاب الرياضيات، فيديو روافد..."
            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-bold focus:border-teal-600 outline-hidden"
          />
        </div>

        {/* Type & License */}
        <div className="grid grid-cols-2 gap-2">
          {/* النوع */}
          <div>
            <label className="block text-[10px] font-black text-slate-600 mb-0.5">النوع</label>
            <select
              value={resource.type}
              onChange={(e) => onChange({ ...resource, type: e.target.value as OerResourceType })}
              className="w-full px-2 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-bold focus:border-teal-600 outline-hidden cursor-pointer"
            >
              <option value="book">📖 كتاب / دليل</option>
              <option value="video">🎥 فيديو تفاعلي</option>
              <option value="link">🔗 رابط / منصة</option>
              <option value="image">🖼️ صورة / بطاقة</option>
              <option value="environmental">🌱 بيئي / محسوس</option>
            </select>
          </div>

          {/* الرخصة */}
          <div>
            <label className="block text-[10px] font-black text-slate-600 mb-0.5">الرخصة / الاعتماد</label>
            <select
              value={resource.licenseType}
              onChange={(e) => onChange({ ...resource, licenseType: e.target.value as OerLicenseType })}
              className="w-full px-2 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-bold focus:border-teal-600 outline-hidden cursor-pointer"
            >
              <option value="ministry_elearn">🟢 معتمد elearn.edu.ps</option>
              <option value="creative_commons">🔵 مشاع إبداعي CC OER</option>
              <option value="public_domain">🟡 ملكية عامة</option>
              <option value="local_teacher">🟠 مصدر محلي / إعداد المعلم</option>
            </select>
          </div>
        </div>

        {/* Direct URL */}
        <div>
          <label className="block text-[10px] font-black text-slate-600 mb-0.5 flex items-center justify-between">
            <span>رابط مباشر (URL)</span>
            {resource.directUrl && (
              <a
                href={resource.directUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-teal-700 hover:text-teal-900 font-black inline-flex items-center gap-0.5"
              >
                <span>تجربة الرابط</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </label>
          <input
            type="url"
            value={resource.directUrl || ''}
            onChange={(e) => onChange({ ...resource, directUrl: e.target.value })}
            placeholder="https://elearn.edu.ps/..."
            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-semibold focus:border-teal-600 outline-hidden text-left"
            dir="ltr"
          />
        </div>
      </div>

      {/* License Badge Preview */}
      <div className="pt-1">
        <span className={`block text-[10px] p-1.5 rounded-lg border text-center leading-tight ${currentLicenseConfig.badge}`}>
          {currentLicenseConfig.isMinistry && '⭐ '}
          {currentLicenseConfig.label}
        </span>
      </div>
    </div>
  );
};
