import React, { useState, useMemo } from 'react';
import { LessonPlan, EducationalResource } from '../types/lessonPlan';
import { UserRole } from '../types/roleDashboards';
import {
  LayoutDashboard,
  PlusCircle,
  FolderOpen,
  Library,
  Sparkles,
  Award,
  Settings,
  BookOpen,
  CheckCircle2,
  Clock,
  Printer,
  FileDown,
  Share2,
  ShieldCheck,
  User,
  Boxes,
  CalendarRange,
  FileCheck2,
  Activity,
  TrendingUp,
  Archive,
  ArrowRight,
  Database,
  Smartphone,
  ChevronLeft,
  Search,
  Filter,
  Check,
  Trash2,
  Layers,
  HelpCircle,
  ExternalLink,
  School,
  FileEdit,
  Copy,
} from 'lucide-react';
import { toArabicDigits, toArabicPercent, formatDateDMY } from '../utils/arabicNumerals';

export type DashboardNavSection =
  | 'home'
  | 'new_prep'
  | 'my_plans'
  | 'library'
  | 'activities'
  | 'assessment'
  | 'settings';

interface AbqoorHomeDashboardProps {
  plans: LessonPlan[];
  resources: EducationalResource[];
  activePlanId: string;
  onSelectPlan: (id: string) => void;
  onOpenEditor: () => void;
  onOpenAiGenerator: () => void;
  onOpenUnitPlanModal: () => void;
  onOpenSemesterPlanModal: () => void;
  onOpenWorksheetModal: () => void;
  onOpenAssessmentModal: () => void;
  onOpenAuthenticTaskModal: () => void;
  onOpenRubricModal: () => void;
  onOpenPrintView: () => void;
  onOpenResourcesModal: () => void;
  onOpenExportModal: () => void;
  onOpenShareModal: () => void;
  onOpenBlankTemplateModal: () => void;
  onNewBlankPlan: () => void;
  onDeletePlan: (id: string) => void;
  onDuplicatePlan?: (id: string) => void;
  onOpenPalestinianOerHub: () => void;
  onOpenCompetenciesModal: () => void;
  onOpenSmartGuideModal: () => void;
  onOpenReportsCenter: (tab?: string) => void;
  onOpenAbacusModal: () => void;
  onOpenBackupRestore: () => void;
  onOpenAssessmentSimulatorModal: () => void;
  onOpenAcademicMilestonesModal: () => void;
  onOpenAndroidAppModal: () => void;
  onOpenIntegrationToolModal?: () => void;
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  onToggleArchivePlan: (id: string) => void;
  onOpenArchiveModal: () => void;
  currentUser?: string;
  onUpdateUsername?: (name: string) => void;
  onOpenExitTicketModal?: () => void;
  onOpenParentCardModal?: () => void;
  onOpenCurriculumPdfExtractor?: () => void;
  onOpenPlansViewer?: () => void;
}

export const AbqoorHomeDashboard: React.FC<AbqoorHomeDashboardProps> = ({
  plans = [],
  resources = [],
  activePlanId,
  onSelectPlan,
  onOpenEditor,
  onOpenAiGenerator,
  onOpenUnitPlanModal,
  onOpenSemesterPlanModal,
  onOpenWorksheetModal,
  onOpenAssessmentModal,
  onOpenAuthenticTaskModal,
  onOpenRubricModal,
  onOpenPrintView,
  onOpenResourcesModal,
  onOpenExportModal,
  onOpenShareModal,
  onOpenBlankTemplateModal,
  onNewBlankPlan,
  onDeletePlan,
  onDuplicatePlan,
  onOpenPalestinianOerHub,
  onOpenCompetenciesModal,
  onOpenSmartGuideModal,
  onOpenReportsCenter,
  onOpenAbacusModal,
  onOpenBackupRestore,
  onOpenAssessmentSimulatorModal,
  onOpenAcademicMilestonesModal,
  onOpenAndroidAppModal,
  onOpenIntegrationToolModal,
  currentRole,
  onChangeRole,
  onToggleArchivePlan,
  onOpenArchiveModal,
  currentUser = 'أ. أحمد المعلم',
  onUpdateUsername,
  onOpenExitTicketModal,
  onOpenParentCardModal,
  onOpenCurriculumPdfExtractor,
  onOpenPlansViewer,
}) => {
  // Current active navigation section
  const [activeNavSection, setActiveNavSection] = useState<DashboardNavSection>('home');

  // Filter state for "تحاضيري المحفوظة"
  const [plansFilter, setPlansFilter] = useState<'all' | 'completed' | 'in_progress'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Editing username local modal/state
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInputValue, setNameInputValue] = useState(currentUser);

  // Compute metrics
  const activePlans = useMemo(() => plans.filter((p) => !p.isArchived), [plans]);
  const archivedPlansCount = useMemo(() => plans.filter((p) => p.isArchived).length, [plans]);
  const completedPlans = useMemo(
    () => activePlans.filter((p) => p.section6Signatures?.educationalSupervisor?.name || p.header?.lessonTitle),
    [activePlans]
  );
  const inProgressPlans = useMemo(
    () => activePlans.filter((p) => !p.section6Signatures?.educationalSupervisor?.name),
    [activePlans]
  );
  const completionRate =
    activePlans.length > 0 ? Math.round((completedPlans.length / activePlans.length) * 100) : 85;

  // Filter & Sort state for "تحاضيري المحفوظة"
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('all');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'title'>('date_desc');

  const availableGrades = useMemo(() => {
    const set = new Set<string>();
    activePlans.forEach((p) => {
      if (p.header?.grade) set.add(p.header.grade);
    });
    return Array.from(set);
  }, [activePlans]);

  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    activePlans.forEach((p) => {
      if (p.header?.subject) set.add(p.header.subject);
    });
    return Array.from(set);
  }, [activePlans]);

  // Filtered and sorted plans list
  const filteredPlans = useMemo(() => {
    let list = activePlans;
    if (plansFilter === 'completed') list = completedPlans;
    if (plansFilter === 'in_progress') list = inProgressPlans;

    if (selectedGradeFilter !== 'all') {
      list = list.filter((p) => p.header?.grade === selectedGradeFilter);
    }
    if (selectedSubjectFilter !== 'all') {
      list = list.filter((p) => p.header?.subject === selectedSubjectFilter);
    }

    if (selectedSemesterFilter !== 'all') {
      if (selectedSemesterFilter === 'unspecified') {
        list = list.filter((p) => !p.header?.semester);
      } else {
        list = list.filter((p) => {
          const sem = p.header?.semester || '';
          if (selectedSemesterFilter === 'first') {
            return sem.includes('الأول') || sem.includes('أول');
          }
          if (selectedSemesterFilter === 'second') {
            return sem.includes('الثاني') || sem.includes('ثاني');
          }
          return true;
        });
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.header?.lessonTitle?.toLowerCase().includes(q) ||
          p.header?.subject?.toLowerCase().includes(q) ||
          p.header?.grade?.toLowerCase().includes(q) ||
          p.header?.unitTitle?.toLowerCase().includes(q)
      );
    }

    list = [...list].sort((a, b) => {
      if (sortBy === 'title') {
        const titleA = a.title || a.header?.lessonTitle || '';
        const titleB = b.title || b.header?.lessonTitle || '';
        return titleA.localeCompare(titleB, 'ar');
      }
      const dateA = new Date(a.header?.date || a.header?.startDate || 0).getTime();
      const dateB = new Date(b.header?.date || b.header?.startDate || 0).getTime();
      return sortBy === 'date_desc' ? dateB - dateA : dateA - dateB;
    });

    return list;
  }, [activePlans, completedPlans, inProgressPlans, plansFilter, selectedGradeFilter, selectedSubjectFilter, selectedSemesterFilter, searchQuery, sortBy]);

  // Role info
  const roleInfo = {
    teacher: { name: 'المعلم', badge: '🟢 معلم صف', desc: 'إعداد وتحضير الخطط الصفية وفق المنهاج الفلسطيني ومصادر OER' },
    supervisor: { name: 'المشرف التربوي', badge: '🔵 مشرف تربوي', desc: 'متابعة واعتماد خطط المعلمين وإرشادهم ميدانياً' },
    principal: { name: 'مدير المدرسة', badge: '🟠 مدير مدرسة', desc: 'متابعة مؤشرات الأداء المؤسسي وتقارير الجودة' },
  }[currentRole] || {
    name: 'المعلم',
    badge: '🟢 معلم صف',
    desc: 'إعداد وتحضير الخطط الصفية وفق المنهاج الفلسطيني ومصادر OER',
  };

  // Navigation Items (The 7 Core Functions Requested by User)
  const navTabs: { id: DashboardNavSection; label: string; icon: React.ComponentType<{ className?: string }>; count?: number }[] = [
    { id: 'home', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'new_prep', label: 'إنشاء تحضير جديد', icon: PlusCircle },
    { id: 'my_plans', label: 'تحاضيري المحفوظة', icon: FolderOpen, count: activePlans.length },
    { id: 'library', label: 'مكتبتي التربوية ومصادري', icon: Library, count: resources.length },
    { id: 'activities', label: 'الأنشطة وأوراق العمل', icon: Sparkles },
    { id: 'assessment', label: 'التقويم التربوي', icon: Award },
    { id: 'settings', label: 'الإعدادات وبيانات المعلم', icon: Settings },
  ];

  const handleSaveTeacherName = () => {
    if (nameInputValue.trim() && onUpdateUsername) {
      onUpdateUsername(nameInputValue.trim());
    }
    setIsEditingName(false);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-900 font-['Cairo',sans-serif] flex flex-col">
      
      {/* 1. TOP CORE NAVIGATION BAR (The 7 Pillars Requested by User) */}
      <nav aria-label="أقسام لوحة التحكم الرئيسية" className="sticky top-16 z-30 bg-white border-b border-slate-200/90 shadow-2xs backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2.5 scrollbar-none touch-pan-x">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeNavSection === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveNavSection(tab.id)}
                  className={`px-3 sm:px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-600/30'
                      : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-300' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                        isActive ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {toArabicDigits(tab.count)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* SECTION 1: الرئيسية (Overview & Quick Cards) */}
        {activeNavSection === 'home' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Welcome Greeting Banner */}
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-md border border-emerald-800/60 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/30">
                    {roleInfo.badge}
                  </span>
                  <span className="px-3 py-1 bg-white/10 text-slate-200 rounded-full text-xs font-bold border border-white/15">
                    المنهاج الفلسطيني المعتمد PS 🇵🇸
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black font-['Tajawal'] tracking-tight">
                  أهلاً بك، {currentUser} 🌸
                </h2>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-2xl font-medium">
                  {roleInfo.desc}. جميع تحضيراتك وكتب المنهاج وسجلات التقويم محفوظة تلقائياً ومحمية بنظام أمان فوري.
                </p>
              </div>

              {/* Stats Badge */}
              <div className="flex items-center gap-3 bg-slate-950/60 p-4 rounded-2xl border border-emerald-500/30 shrink-0 self-start md:self-auto">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/30 text-emerald-300 flex items-center justify-center font-black text-lg border border-emerald-500/40">
                  {toArabicPercent(completionRate)}
                </div>
                <div>
                  <span className="text-xs text-slate-300 font-bold block">نسبة الإنجاز الكفائي</span>
                  <span className="text-xs font-black text-amber-300 flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>جاهز للاعتماد والمتابعة</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div
                onClick={() => setActiveNavSection('my_plans')}
                className="p-4 bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 rounded-2xl transition-all cursor-pointer shadow-2xs group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 group-hover:text-emerald-700">الخطط النشطة</span>
                  <FolderOpen className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-2xl font-black text-slate-900 font-['Tajawal'] mt-2 block">
                  {toArabicDigits(activePlans.length)}
                </span>
                <span className="text-[11px] text-slate-400 mt-1 block">خطط قابلة للتحرير</span>
              </div>

              <div
                onClick={() => {
                  setPlansFilter('completed');
                  setActiveNavSection('my_plans');
                }}
                className="p-4 bg-white hover:bg-teal-50/50 border border-slate-200 hover:border-teal-300 rounded-2xl transition-all cursor-pointer shadow-2xs group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 group-hover:text-teal-700">الخطط المكتملة</span>
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                </div>
                <span className="text-2xl font-black text-teal-700 font-['Tajawal'] mt-2 block">
                  {toArabicDigits(completedPlans.length)}
                </span>
                <span className="text-[11px] text-teal-600 font-bold mt-1 block">معتمدة رسمياً 🟢</span>
              </div>

              <div
                onClick={() => setActiveNavSection('library')}
                className="p-4 bg-white hover:bg-amber-50/50 border border-slate-200 hover:border-amber-300 rounded-2xl transition-all cursor-pointer shadow-2xs group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 group-hover:text-amber-700">المصادر وكتب المنهاج</span>
                  <Library className="w-4 h-4 text-amber-600" />
                </div>
                <span className="text-2xl font-black text-amber-700 font-['Tajawal'] mt-2 block">
                  {toArabicDigits(resources.length)}
                </span>
                <span className="text-[11px] text-slate-400 mt-1 block">مصادر OER وكتب</span>
              </div>

              <div
                onClick={() => setActiveNavSection('assessment')}
                className="p-4 bg-white hover:bg-purple-50/50 border border-slate-200 hover:border-purple-300 rounded-2xl transition-all cursor-pointer shadow-2xs group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 group-hover:text-purple-700">التقويم والأنشطة</span>
                  <Award className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-2xl font-black text-purple-700 font-['Tajawal'] mt-2 block">
                  {toArabicDigits(activePlans.length * 4)}
                </span>
                <span className="text-[11px] text-slate-400 mt-1 block">مؤشرات ومعايير متابعة</span>
              </div>
            </div>

            {/* The 6 Core Working Hubs (Interactive Grid) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 font-['Tajawal'] flex items-center gap-2">
                  <LayoutDashboard className="w-5 h-5 text-emerald-700" />
                  <span>الوظائف والأقسام الرئيسية لمنظومة عبقور</span>
                </h3>
                <span className="text-xs font-bold text-slate-500">اختر القسم للمتابعة السريعة</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* 1. إنشاء تحضير جديد */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between group">
                  <div className="space-y-2.5">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                      <PlusCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-900 font-['Tajawal']">
                        إنشاء تحضير جديد
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        توليد تحضير ذكي متكامل بالـ AI، استمارة تحضير مفرغة، تخطيط وحدة دراسية، أو خطة فصلية.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onOpenAiGenerator}
                      className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>تحضير ذكي (AI)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveNavSection('new_prep')}
                      className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      title="استعراض خيارات التحضير"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 2. تحاضيري المحفوظة */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group">
                  <div className="space-y-2.5">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <FolderOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-900 font-['Tajawal']">
                        تحاضيري المحفوظة ({toArabicDigits(activePlans.length)})
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        استعراض كافة الخطط المحفوظة والجارية في المتصفح، مع إمكانية التعديل، الطباعة، أو الأرشفة.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveNavSection('my_plans')}
                      className="flex-1 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-blue-200" />
                      <span>استعراض خططي</span>
                    </button>
                    <button
                      type="button"
                      onClick={onOpenEditor}
                      className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      title="فتح الخطة الحالية في المحرر"
                    >
                      <FileEdit className="w-4 h-4 text-emerald-700" />
                    </button>
                  </div>
                </div>

                {/* 3. مكتبتي التربوية ومصادري */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between group">
                  <div className="space-y-2.5">
                    <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all">
                      <Library className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-900 font-['Tajawal']">
                        مكتبتي التربوية ومصادري
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        بنك المراجع والكتب المدرسية، مستودع OER الفلسطيني، ومكتبة الكفايات الوطنية للصفوف الأساسية.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onOpenResourcesModal}
                      className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-200" />
                      <span>بنك المصادر والمناهج</span>
                    </button>
                    <button
                      type="button"
                      onClick={onOpenPalestinianOerHub}
                      className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      title="مستودع OER"
                    >
                      <Layers className="w-4 h-4 text-teal-700" />
                    </button>
                  </div>
                </div>

                {/* 4. الأنشطة وأوراق العمل */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-purple-400 hover:shadow-md transition-all flex flex-col justify-between group">
                  <div className="space-y-2.5">
                    <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
                      <FileCheck2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-900 font-['Tajawal']">
                        الأنشطة وأوراق العمل
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        أوراق عمل تفاعلية قابلة للطباعة، مهمات تقويمية أصيلة GRASPS، سلالم تقدير لفظية، وتذاكر خروج.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onOpenWorksheetModal}
                      className="flex-1 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                    >
                      <FileCheck2 className="w-3.5 h-3.5 text-purple-200" />
                      <span>ورقة عمل تفاعلية</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveNavSection('activities')}
                      className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      title="عرض كافة أدوات الأنشطة"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 5. التقويم التربوي */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-rose-400 hover:shadow-md transition-all flex flex-col justify-between group">
                  <div className="space-y-2.5">
                    <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-all">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-900 font-['Tajawal']">
                        التقويم التربوي والتقارير
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        سجلات تقويم كفايات الطلبة، محاكي الاختبارات والتقويم الصفي، ومحطات العام الدراسي الوزاري.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenReportsCenter('student_competencies_record')}
                      className="flex-1 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                    >
                      <Activity className="w-3.5 h-3.5 text-rose-200" />
                      <span>سجل كفايات الطلبة</span>
                    </button>
                    <button
                      type="button"
                      onClick={onOpenAssessmentSimulatorModal}
                      className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      title="محاكي التقويم"
                    >
                      <Award className="w-4 h-4 text-rose-600" />
                    </button>
                  </div>
                </div>

                {/* 6. الإعدادات وبيانات المعلم */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all flex flex-col justify-between group">
                  <div className="space-y-2.5">
                    <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center group-hover:bg-slate-800 group-hover:text-white transition-all">
                      <Settings className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-900 font-['Tajawal']">
                        الإعدادات وبيانات المعلم
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        بيانات المعلم والمدرسة، إدارة النسخ الاحتياطي والأمان، ونقاط التراجع، وتبديل الدور التربوي.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onOpenBackupRestore}
                      className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                    >
                      <Database className="w-3.5 h-3.5 text-amber-300" />
                      <span>النسخ الاحتياطي والأمان</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveNavSection('settings')}
                      className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      title="عرض الإعدادات"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Quick Access to Recent Active Plans */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-sm sm:text-base font-black text-slate-900 font-['Tajawal']">
                    آخر التحاضير قيد العمل والمتابعة
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveNavSection('my_plans')}
                  className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>عرض كافة الخطط ({toArabicDigits(activePlans.length)})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {activePlans.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <p className="text-xs text-slate-500">لا توجد خطط نشطة حالياً.</p>
                  <button
                    type="button"
                    onClick={onOpenAiGenerator}
                    className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    إنشاء تحضيرك الأول الآن
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {activePlans.slice(0, 4).map((plan, idx) => {
                    const isCompleted = !!plan.section6Signatures?.educationalSupervisor?.name;
                    return (
                      <div
                        key={plan.id || idx}
                        className="p-3.5 bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {toArabicDigits(idx + 1)}
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-black text-slate-900 font-['Tajawal']">
                              {plan.title || plan.header?.lessonTitle || 'خطة درس معتمدة'}
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {plan.header?.subject || 'الرياضيات'} • {plan.header?.grade || 'الصف الثالث الأساسي'} •{' '}
                              الفترة: {toArabicDigits(plan.header?.totalPeriods || 1)} حصص
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                              isCompleted
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isCompleted ? 'معتمد 🟢' : 'قيد العمل 🟡'}
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              onSelectPlan(plan.id);
                              onOpenEditor();
                            }}
                            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                          >
                            <FileEdit className="w-3.5 h-3.5" />
                            <span>متابعة التحرير</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              onSelectPlan(plan.id);
                              onOpenPrintView();
                            }}
                            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-xl transition-all cursor-pointer"
                            title="طباعة الخطة (A4)"
                          >
                            <Printer className="w-4 h-4 text-slate-500" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 2: إنشاء تحضير جديد */}
        {activeNavSection === 'new_prep' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <PlusCircle className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 font-['Tajawal']">
                    إنشاء وتوليد تحضير تربوي جديد
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    اختر الطريقة الأنسب لك لبدء تحضير درسك وفق النموذج الرسمي لوزارة التربية والتعليم الفلسطينية
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Option A: التحضير الذكي بالذكاء الاصطناعي */}
              <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-white rounded-3xl p-6 border-2 border-emerald-400 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-sm">
                    <Sparkles className="w-6 h-6 text-amber-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base sm:text-lg font-black text-emerald-950 font-['Tajawal']">
                        التحضير الذكي الشامل (AI + OER)
                      </h4>
                      <span className="px-2 py-0.5 bg-amber-400 text-amber-950 rounded-full text-[10px] font-black">
                        مستحسن ⭐
                      </span>
                    </div>
                    <p className="text-xs text-emerald-900/80 mt-1.5 leading-relaxed">
                      توليد آلي فوري لخطة الدرس المتوافقة مع النموذج الوزاري، ربط كفايات المنهاج، واقتراح مصادر OER
                      المعتمدة واستراتيجيات التعلم النشط خلال ثوانٍ معدودة.
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-emerald-200/60">
                  <button
                    type="button"
                    onClick={onOpenAiGenerator}
                    className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer active:scale-98"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>بدء التحضير الذكي الفوري</span>
                  </button>
                </div>
              </div>

              {/* Option B: استمارة تحضير مفرغة */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-slate-400 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center shadow-2xs">
                    <FileEdit className="w-6 h-6 text-slate-700" />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-black text-slate-900 font-['Tajawal']">
                      استمارة تحضير مفرغة (إدخال يدوي)
                    </h4>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      بدء خطة جديدة فارغة معتمدة مطابقة للنموذج الرسمي بجميع أقسامه الستة (الترويس، الكفايات، سير الحصة،
                      التقويم، والبيئة الصفية) لإدخال بياناتك بحرية تامة.
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onNewBlankPlan();
                      onOpenEditor();
                    }}
                    className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98"
                  >
                    <span>فتح استمارة جديدة فارغة</span>
                  </button>
                  <button
                    type="button"
                    onClick={onOpenBlankTemplateModal}
                    className="px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-bold transition-all cursor-pointer"
                    title="خيارات القوالب المفرغة"
                  >
                    نماذج القوالب
                  </button>
                </div>
              </div>

              {/* Option C: تخطيط وحدة دراسية كاملة */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-blue-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shadow-2xs">
                    <Boxes className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-black text-slate-900 font-['Tajawal']">
                      تخطيط وحدة دراسية كاملة
                    </h4>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      بناء مصفوفة ترابطية لكامل دروس الوحدة التعليمية وتوزيع الحصص والمفاهيم الكبرى ونتاجات التعلم
                      المشتركة دفعة واحدة.
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={onOpenUnitPlanModal}
                    className="w-full py-3.5 bg-blue-700 hover:bg-blue-800 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98"
                  >
                    <Boxes className="w-4 h-4 text-blue-200" />
                    <span>توليد وتخطيط وحدة دراسية</span>
                  </button>
                </div>
              </div>

              {/* Option D: الخطة الفصلية */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-teal-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shadow-2xs">
                    <CalendarRange className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-black text-slate-900 font-['Tajawal']">
                      الخطة الفصلية وتوزيع المنهاج
                    </h4>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      إعداد الخطة الفصلية وتوزيع الوحدات والدروس عبر أسابيع الفصل الدراسي الأول والثاني وفق التقويم
                      الأكاديمي الفلسطيني.
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={onOpenSemesterPlanModal}
                    className="w-full py-3.5 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98"
                  >
                    <CalendarRange className="w-4 h-4 text-teal-200" />
                    <span>إعداد الخطة الفصلية</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SECTION 3: تحاضيري المحفوظة */}
        {activeNavSection === 'my_plans' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header & Filter Controls */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-6 h-6 text-emerald-700" />
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 font-['Tajawal']">
                      تحاضيري وخططي المحفوظة ({toArabicDigits(activePlans.length)})
                    </h3>
                    <p className="text-xs text-slate-500">
                      قائمة الخطط المخزنة محلياً في متصفحك مع إمكانية الفتح، التعديل، الطباعة، أو الأرشفة
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onOpenArchiveModal}
                    className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Archive className="w-3.5 h-3.5 text-amber-700" />
                    <span>أرشيف الخطط ({toArabicDigits(archivedPlansCount)})</span>
                  </button>

                  <button
                    type="button"
                    onClick={onOpenAiGenerator}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-emerald-200" />
                    <span>تحضير جديد</span>
                  </button>
                </div>
              </div>

              {/* Filter Tabs and Search Input */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                  <button
                    type="button"
                    onClick={() => setPlansFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      plansFilter === 'all'
                        ? 'bg-slate-900 text-white font-black'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    الكل ({toArabicDigits(activePlans.length)})
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlansFilter('completed')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      plansFilter === 'completed'
                        ? 'bg-emerald-700 text-white font-black'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    مكتملة ومعتمدة 🟢 ({toArabicDigits(completedPlans.length)})
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlansFilter('in_progress')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      plansFilter === 'in_progress'
                        ? 'bg-amber-600 text-white font-black'
                        : 'bg-amber-50 hover:bg-amber-100 text-amber-800'
                    }`}
                  >
                    قيد العمل والتحضير 🟡 ({toArabicDigits(inProgressPlans.length)})
                  </button>
                </div>

                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث بالعنوان أو المادة..."
                    className="w-full pr-8 pl-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-hidden text-right"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5" />
                </div>
              </div>

              {/* Advanced Grade, Subject, Semester & Sort Filters Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <select
                    value={selectedGradeFilter}
                    onChange={(e) => setSelectedGradeFilter(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                  >
                    <option value="all">تصفية حسب الصف: الكل</option>
                    {availableGrades.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={selectedSubjectFilter}
                    onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                  >
                    <option value="all">تصفية حسب المبحث: الكل</option>
                    {availableSubjects.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={selectedSemesterFilter}
                    onChange={(e) => setSelectedSemesterFilter(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                  >
                    <option value="all">الفصل الدراسي: جميع الفصول</option>
                    <option value="first">الفصل الدراسي الأول</option>
                    <option value="second">الفصل الدراسي الثاني</option>
                    <option value="unspecified">غير محدد</option>
                  </select>
                </div>
                <div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                  >
                    <option value="date_desc">ترتيب: الأحدث حفظاً</option>
                    <option value="date_asc">ترتيب: الأقدم حفظاً</option>
                    <option value="title">ترتيب: عنوان الدرس أ-ي</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Plans List */}
            {filteredPlans.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 space-y-3">
                <FolderOpen className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">لا توجد خطط تطابق البحث أو الفلتر المحدد.</p>
                <button
                  type="button"
                  onClick={() => {
                    setPlansFilter('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
                >
                  إعادة ضبط الفلتر
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredPlans.map((plan) => {
                  const isCompleted = !!plan.section6Signatures?.educationalSupervisor?.name;
                  return (
                    <div
                      key={plan.id}
                      className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                              isCompleted
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}
                          >
                            {isCompleted ? 'خطة مكتملة ومعتمدة 🟢' : 'قيد العمل والإعداد 🟡'}
                          </span>

                          <span className="text-[11px] text-slate-400 font-bold">
                            {formatDateDMY(plan.header?.date || plan.header?.startDate || new Date().toISOString())}
                          </span>
                        </div>

                        <h4 className="text-base font-black text-slate-900 font-['Tajawal'] group-hover:text-emerald-800 transition-colors">
                          {plan.title || plan.header?.lessonTitle || 'خطة درس معتمدة'}
                        </h4>

                        <div className="flex items-center gap-2 text-xs text-slate-600 font-medium flex-wrap">
                          <span className="bg-slate-100 px-2.5 py-1 rounded-lg">
                            {plan.header?.subject || 'الرياضيات'}
                          </span>
                          <span className="bg-slate-100 px-2.5 py-1 rounded-lg">
                            {plan.header?.grade || 'الصف الثالث'}
                          </span>
                          <span className="bg-slate-100 px-2.5 py-1 rounded-lg">
                            الشعبة: {plan.header?.section || 'أ'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectPlan(plan.id);
                            onOpenEditor();
                          }}
                          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                        >
                          <FileEdit className="w-3.5 h-3.5" />
                          <span>فتح وتعديل</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectPlan(plan.id);
                              onOpenPrintView();
                            }}
                            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                            title="طباعة رسمية A4"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (onDuplicatePlan) {
                                onDuplicatePlan(plan.id);
                              }
                            }}
                            className="p-2 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-xl transition-all cursor-pointer"
                            title="إنشاء نسخة مطابقة (تكرار الخطة)"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onToggleArchivePlan(plan.id)}
                            className="p-2 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-all cursor-pointer"
                            title="نقل إلى الأرشيف"
                          >
                            <Archive className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('هل أنت متأكد من حذف هذا التحضير نهائياً من المكتبة؟')) {
                                onDeletePlan(plan.id);
                              }
                            }}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                            title="حذف الخطة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SECTION 4: مكتبتي التربوية ومصادري */}
        {activeNavSection === 'library' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Library className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 font-['Tajawal']">
                    مكتبتي التربوية وبنك المصادر والمناهج
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    إدارة الكتب المدرسية والمناهج المعتمدة، مستودع OER الفلسطيني، ومكتبة الكفايات الوطنية
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenResourcesModal}
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-2xs shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span>إضافة مرجع أو كتاب مدرسي</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Card 1: بنك المصادر والمناهج المرفوعة */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-amber-400 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-amber-700" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-black text-slate-900 font-['Tajawal']">
                        المراجع وكتب المنهاج المرفوعة
                      </h4>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full text-xs font-bold">
                        {toArabicDigits(resources.length)} مراجع
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      كتب الرياضيات، اللغة العربية، والعلوم المحفوظة ومربوطة بصفحات التحضير والدروس.
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={onOpenResourcesModal}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <span>فتح بنك المصادر ({toArabicDigits(resources.length)})</span>
                  </button>
                </div>
              </div>

              {/* Card 2: مستودع مصادر OER الفلسطيني */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-teal-400 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
                    <Layers className="w-6 h-6 text-teal-700" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900 font-['Tajawal']">
                      مستودع مصادر OER الفلسطيني 🇵🇸
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      الروابط والمواد التعليمية المفتوحة من بوابة التعلم الإلكتروني (elearn.edu.ps) ومنصة روافد التعليمية.
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={onOpenPalestinianOerHub}
                    className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <span>تصفح مستودع OER</span>
                  </button>
                </div>
              </div>

              {/* Card 3: مكتبة الكفايات الوطنية الفلسطينية */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-emerald-400 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Award className="w-6 h-6 text-emerald-700" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900 font-['Tajawal']">
                      مكتبة الكفايات الوطنية الفلسطينية
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      الإطار الوطني المعتمد لكفايات المعارف والمهارات والمواقف والقيم للصفوف الأساسية (١-٤).
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={onOpenCompetenciesModal}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <span>استعراض مصفوفة الكفايات</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SECTION 5: الأنشطة وأوراق العمل */}
        {activeNavSection === 'activities' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                  <FileCheck2 className="w-6 h-6 text-purple-700" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 font-['Tajawal']">
                    الأنشطة الصفية وأوراق العمل التفاعلية
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    أدوات بناء الأنشطة الصفية وأوراق العمل التفاعلية والمهام التقويمية للطلبة
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Tool 1: ورقة عمل تفاعلية */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-purple-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
                    <FileCheck2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900 font-['Tajawal']">
                      ورقة عمل تفاعلية للطلبة
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      توليد ورقة عمل قابلة للتنزيل والطباعة ومطابقة لمحتوى الدرس الحالي مع أسئلة متدرجة المستويات.
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={onOpenWorksheetModal}
                    className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <span>إنشاء ورقة عمل الآن</span>
                  </button>
                </div>
              </div>

              {/* Tool 2: المهمات الأصيلة GRASPS */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900 font-['Tajawal']">
                      المهمات التقويمية الأصيلة (GRASPS)
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      بناء مهمات واقعية ترتبط ببيئة الطالب الفلسطيني: الهدف، الدور، الجمهور، الموقف، والمنتج.
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={onOpenAuthenticTaskModal}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <span>مولد المهمات الأصيلة</span>
                  </button>
                </div>
              </div>

              {/* Tool 3: سلالم التقدير اللفظية (الروبرك) */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-blue-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900 font-['Tajawal']">
                      سلالم التقدير اللفظية (الروبرك)
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      تصميم روبرك تحليلي معياري لتقييم أداء الطلبة عبر مستويات الإتقان الأربعة (مبتدئ، نامٍ، كفء، متميز).
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={onOpenRubricModal}
                    className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <span>مولد الروبرك المعياري</span>
                  </button>
                </div>
              </div>

              {/* Tool 4: محاكي المعداد ولوحة المنازل */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-amber-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900 font-['Tajawal']">
                      محاكي المعداد ولوحة المنازل الحسابية
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      أداة بصرية تفاعلية لتمثيل الأعداد والقيمة المنزلية والعمليات الحسابية للصفوف الأساسية.
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={onOpenAbacusModal}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <span>تشغيل محاكي المعداد</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SECTION 6: التقويم التربوي */}
        {activeNavSection === 'assessment' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                  <Award className="w-6 h-6 text-rose-700" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 font-['Tajawal']">
                    التقويم التربوي والتقارير الميدانية
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    سجلات متابعة الطلبة، محاكي الاختبارات، والأجندة الأكاديمية لوزارة التربية والتعليم
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Assessment 1: سجلات تقويم كفايات الطلبة */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-rose-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900 font-['Tajawal']">
                      سجلات تقويم كفايات الطلبة
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      رصد مستويات إتقان الطلبة، استخراج تقارير الأداء الصفية، وجاهزيتها للتصدير والطباعة الرسمية.
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onOpenReportsCenter('student_competencies_record')}
                    className="w-full py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <span>فتح سجل تقويم الطلبة</span>
                  </button>
                </div>
              </div>

              {/* Assessment 2: محاكي الاختبارات والتقويم الصفي */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900 font-['Tajawal']">
                      محاكي الاختبارات والتقويم الصفي
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      إعداد نماذج الاختبارات القصيرة، التقويم التشخيصي، والتقويم التكويني المعياري للطلبة.
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={onOpenAssessmentSimulatorModal}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <span>تشغيل محاكي الاختبارات</span>
                  </button>
                </div>
              </div>

              {/* Assessment 3: الروزنامة والمحطات الأكاديمية الفلسطينية */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-blue-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
                    <CalendarRange className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900 font-['Tajawal']">
                      محطات العام الدراسي والروزنامة الوزارية
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      الفترات التقويمية الأربع، مواعيد الامتحانات، والعطل المدرسية المعتمدة لوزارة التربية والتعليم.
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={onOpenAcademicMilestonesModal}
                    className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <span>عرض الأجندة والمحطات الوزارية</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SECTION 7: الإعدادات وبيانات المعلم */}
        {activeNavSection === 'settings' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
                  <Settings className="w-6 h-6 text-slate-700" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 font-['Tajawal']">
                    الإعدادات وبيانات المعلم والأمان
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    إدارة بيانات الحساب، الدور التربوي، النسخ الاحتياطي الشامل ونقاط الأمان
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Card 1: بيانات المعلم والملف الشخصي */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-700" />
                    <h4 className="text-sm font-black text-slate-900 font-['Tajawal']">
                      بيانات المعلم والمدرسة
                    </h4>
                  </div>
                  {!isEditingName && (
                    <button
                      type="button"
                      onClick={() => setIsEditingName(true)}
                      className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
                    >
                      تعديل الاسم
                    </button>
                  )}
                </div>

                {isEditingName ? (
                  <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <label className="block text-xs font-bold text-slate-700">اسم المعلم المعتمد:</label>
                    <input
                      type="text"
                      value={nameInputValue}
                      onChange={(e) => setNameInputValue(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:border-emerald-600 focus:outline-hidden"
                    />
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleSaveTeacherName}
                        className="px-4 py-1.5 bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        حفظ التعديل
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNameInputValue(currentUser);
                          setIsEditingName(false);
                        }}
                        className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                      <span className="text-slate-500 font-medium">اسم المعلم / المعلمة:</span>
                      <span className="font-bold text-slate-900">{currentUser}</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                      <span className="text-slate-500 font-medium">الجهة المشرفة:</span>
                      <span className="font-bold text-emerald-800">وزارة التربية والتعليم العالي 🇵🇸</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                      <span className="text-slate-500 font-medium">المرحلة الدراسية:</span>
                      <span className="font-bold text-slate-900">المرحلة الأساسية (الصفوف ١-٤)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Card 2: الدور التربوي والصلاحيات */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <School className="w-5 h-5 text-teal-700" />
                    <h4 className="text-sm font-black text-slate-900 font-['Tajawal']">
                      الدور التربوي النشط
                    </h4>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold">
                    {roleInfo.badge}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => onChangeRole('teacher')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                      currentRole === 'teacher'
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>معلم صف</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeRole('supervisor')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                      currentRole === 'supervisor'
                        ? 'bg-blue-700 text-white border-blue-700 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>مشرف تربوي</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeRole('principal')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                      currentRole === 'principal'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>مدير مدرسة</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  يؤثر اختيار الدور على أدوات التدقيق والمراجعة والتقارير الميدانية المعروضة في المنظومة.
                </p>
              </div>

              {/* Card 3: النسخ الاحتياطي واسترجاع البيانات (المرحلة الأولى) */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Database className="w-5 h-5 text-emerald-700" />
                  <h4 className="text-sm font-black text-slate-900 font-['Tajawal']">
                    النسخ الاحتياطي والأمان الشامل
                  </h4>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  تصدير نسخة احتياطية شاملة JSON لجميع خططك والمصادر المرفوعة وسجلات كفايات الطلبة، مع ميزة التراجع
                  الفوري عن أي استيراد خاطئ.
                </p>

                <button
                  type="button"
                  onClick={onOpenBackupRestore}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                >
                  <Database className="w-4 h-4 text-emerald-200" />
                  <span>فتح نافذة النسخ الاحتياطي والاسترجاع</span>
                </button>
              </div>

              {/* Card 4: تطبيق الجوال ومرشد عبقور */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Smartphone className="w-5 h-5 text-purple-700" />
                  <h4 className="text-sm font-black text-slate-900 font-['Tajawal']">
                    التطبيق على الهاتف والمساعد الذكي
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={onOpenAndroidAppModal}
                    className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex flex-col items-center gap-1.5 transition-all cursor-pointer text-center"
                  >
                    <Smartphone className="w-5 h-5 text-emerald-600" />
                    <span>تطبيق الهاتف</span>
                  </button>

                  <button
                    type="button"
                    onClick={onOpenSmartGuideModal}
                    className="p-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-xs font-bold text-amber-900 flex flex-col items-center gap-1.5 transition-all cursor-pointer text-center"
                  >
                    <Sparkles className="w-5 h-5 text-amber-600" />
                    <span>مرشد عبقور</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 mt-auto">
        <p>منظومة عبقور للتخطيط التربوي وتوظيف مصادر OER © ٢٠٢٦ • وزارة التربية والتعليم العالي • فلسطين 🇵🇸</p>
      </footer>
    </div>
  );
};
