/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LessonPlan, EducationalResource } from './types/lessonPlan';
import { defaultExemplarPlans, palestineMathGrade3Plan } from './data/exemplarPlans';
import { defaultBlankPlan, getBlankLessonPlan } from './data/blankPlan';
import { HeaderNav } from './components/HeaderNav';
import { LessonHeaderCard } from './components/LessonHeaderCard';
import { Section1Card } from './components/Section1Card';
import { Section2TimelineCard } from './components/Section2TimelineCard';
import { Section3AssessmentCard } from './components/Section3AssessmentCard';
import { Section4EnvironmentCard } from './components/Section4EnvironmentCard';
import { Section5ReflectionCard } from './components/Section5ReflectionCard';
import { Section6SignaturesCard } from './components/Section6SignaturesCard';
import { OfficialPrintView } from './components/OfficialPrintView';
import { AbacusSimulationModal } from './components/AbacusSimulationModal';
import { AiGeneratorModal } from './components/AiGeneratorModal';
import { ExitTicketModal } from './components/ExitTicketModal';
import { ParentCardModal } from './components/ParentCardModal';
import { ResourcesManagerModal } from './components/ResourcesManagerModal';
import { ExportModal } from './components/ExportModal';
import { TeacherDashboard } from './components/TeacherDashboard';
import { BlankTemplateModal } from './components/BlankTemplateModal';
import { CreativeCommonsFooter } from './components/CreativeCommonsFooter';
import { PlansViewerModal } from './components/PlansViewerModal';
import { DeletePlanConfirmModal } from './components/DeletePlanConfirmModal';
import { InteractiveWorksheetModal } from './components/InteractiveWorksheetModal';
import { AssessmentHubModal } from './components/AssessmentHubModal';
import { AuthenticTaskGeneratorModal } from './components/AuthenticTaskGeneratorModal';
import { RubricGeneratorModal } from './components/RubricGeneratorModal';
import { UnitPlanGeneratorModal } from './components/UnitPlanGeneratorModal';
import { FloatingWhatsAppButton } from './components/WhatsAppContactButton';
import { toArabicDigits } from './utils/arabicNumerals';
import { analyzeContentLocally } from './utils/resourceAnalyzer';
import {
  Compass,
  Clock,
  Target,
  Users2,
  BrainCircuit,
  FileCheck,
  Sparkles,
  Calculator,
  Printer,
  ChevronDown,
  Info,
  CheckCircle2,
  Layers,
  FileDown,
  LayoutDashboard,
  FileEdit,
  RotateCcw,
  Trash2,
  FolderKanban,
  Boxes,
  CalendarRange,
  Award,
  Activity,
  FileCheck2,
  FolderOpen,
  Filter,
  Wand2,
  BookOpen,
} from 'lucide-react';
import { SemesterPlanModal } from './components/SemesterPlanModal';

const LOCAL_STORAGE_KEY = 'educational_expert_lesson_plans_v1';
const ACTIVE_PLAN_KEY = 'educational_expert_active_plan_id_v1';

export default function App() {
  const [plans, setPlans] = useState<LessonPlan[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasBlank = parsed.some((p: LessonPlan) => p.id === defaultBlankPlan.id || p.id.startsWith('plan-blank'));
          if (!hasBlank) {
            const merged = [defaultBlankPlan, ...parsed];
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
            return merged;
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load plans from localStorage', e);
    }
    return [defaultBlankPlan, ...defaultExemplarPlans];
  });

  const [activePlanId, setActivePlanId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(ACTIVE_PLAN_KEY);
      if (savedId) return savedId;
    } catch (e) {}
    return defaultBlankPlan.id;
  });

  const [viewMode, setViewMode] = useState<'editor' | 'official-print' | 'dashboard'>('editor');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [actionCategoryFilter, setActionCategoryFilter] = useState<'all' | 'ai' | 'resources' | 'plans' | 'export'>('all');

  // Modals
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isUnitPlanModalOpen, setIsUnitPlanModalOpen] = useState(false);
  const [isSemesterPlanModalOpen, setIsSemesterPlanModalOpen] = useState(false);
  const [isWorksheetModalOpen, setIsWorksheetModalOpen] = useState(false);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [isAuthenticTaskModalOpen, setIsAuthenticTaskModalOpen] = useState(false);
  const [isRubricModalOpen, setIsRubricModalOpen] = useState(false);
  const [isBlankModalOpen, setIsBlankModalOpen] = useState(false);
  const [isAbacusModalOpen, setIsAbacusModalOpen] = useState(false);
  const [isExitTicketModalOpen, setIsExitTicketModalOpen] = useState(false);
  const [isParentCardModalOpen, setIsParentCardModalOpen] = useState(false);
  const [isResourcesModalOpen, setIsResourcesModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPlansViewerModalOpen, setIsPlansViewerModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<LessonPlan | null>(null);
  const [selectedResourceForPlanning, setSelectedResourceForPlanning] = useState<EducationalResource | null>(null);

  const handleUnitPlansGenerated = (newPlans: LessonPlan[]) => {
    if (!newPlans || newPlans.length === 0) return;
    setPlans((prev) => [...newPlans, ...prev]);
    setActivePlanId(newPlans[0].id);
    setViewMode('editor');
  };

  const handleRequestDeletePlan = (targetPlan?: LessonPlan) => {
    setPlanToDelete(targetPlan || currentPlan);
  };

  const handleConfirmDelete = (planIdToDelete: string) => {
    const remainingPlans = plans.filter((p) => p.id !== planIdToDelete);
    if (remainingPlans.length === 0) {
      const freshBlank = getBlankLessonPlan();
      setPlans([freshBlank]);
      setActivePlanId(freshBlank.id);
    } else {
      setPlans(remainingPlans);
      if (activePlanId === planIdToDelete) {
        setActivePlanId(remainingPlans[0].id);
      }
    }
    setPlanToDelete(null);
  };

  // User Added Resources
  const [resources, setResources] = useState<EducationalResource[]>(() => {
    try {
      const saved = localStorage.getItem('educational_expert_resources_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [
      {
        id: 'res-default-1',
        type: 'textbook',
        title: 'كتاب الرياضيات للصف الثالث - الفصل الأول (ص ١٠-١٢)',
        content: 'الدرس الثاني: القيمة المنزلية للأعداد ضمن ٩٩٩٩، كتابة الأعداد بالصورة الموسعة، تمثيل الأعداد على المعداد ولوحة المنازل، وربط الأعداد بمعالم فلسطين (جبل الجرمق ١٢٠٨ م ومخيم الفارعة ٧٨٣٠ نسمة).',
        sourceInfo: 'الطبعة الرابعة ٢٠٢٢',
        createdAt: '٢٠٢٦/١٠/١٥م',
        tags: ['رياضيات', 'الصف الثالث', 'قيمة منزلية'],
      },
    ];
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(plans));
      localStorage.setItem(ACTIVE_PLAN_KEY, activePlanId);
      localStorage.setItem('educational_expert_resources_v1', JSON.stringify(resources));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [plans, activePlanId, resources]);

  const currentPlan = plans.find((p) => p.id === activePlanId) || plans[0] || defaultBlankPlan;

  const updateCurrentPlan = (updated: LessonPlan) => {
    setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleApplyResourceToCurrentPlan = (resource: EducationalResource) => {
    const meta = resource.inferredLessonTitle
      ? {
          subject: resource.inferredSubject || currentPlan.header.subject,
          grade: resource.inferredGrade || currentPlan.header.grade,
          lessonTitle: resource.inferredLessonTitle,
        }
      : analyzeContentLocally(resource.content, resource.fileName, resource.fileExt);

    const updatedPlan: LessonPlan = {
      ...currentPlan,
      title: resource.title,
      header: {
        ...currentPlan.header,
        lessonTitle: meta.lessonTitle || currentPlan.header.lessonTitle,
        subject: meta.subject || currentPlan.header.subject,
        grade: meta.grade || currentPlan.header.grade,
      },
      section1: {
        ...currentPlan.section1,
        learningResources: {
          ...currentPlan.section1.learningResources,
          textbook: resource.sourceInfo || resource.title,
        },
      },
      attachedResources: [
        ...(currentPlan.attachedResources || []).filter((r) => r.id !== resource.id),
        resource,
      ],
    };

    updateCurrentPlan(updatedPlan);
    setViewMode('editor');
  };

  const handlePlanGenerated = (newPlan: LessonPlan) => {
    setPlans((prev) => [newPlan, ...prev]);
    setActivePlanId(newPlan.id);
  };

  const handleCreateNewBlankPlan = () => {
    const newBlank = getBlankLessonPlan();
    setPlans((prev) => [newBlank, ...prev]);
    setActivePlanId(newBlank.id);
    setViewMode('editor');
  };

  const isCurrentPlanBlank =
    currentPlan.id === defaultBlankPlan.id ||
    currentPlan.id.startsWith('plan-blank') ||
    !currentPlan.header.lessonTitle;

  const handleSelectBlankPlan = () => {
    const blank = plans.find((p) => p.id === defaultBlankPlan.id || p.id.startsWith('plan-blank'));
    if (blank) {
      setActivePlanId(blank.id);
    } else {
      handleCreateNewBlankPlan();
    }
    setViewMode('editor');
  };

  const handleClearCurrentPlan = () => {
    if (confirm('هل تريد تفريغ ومسح كافة الحقول الحالية للبدء من الصفر؟')) {
      const freshBlank = getBlankLessonPlan();
      updateCurrentPlan({
        ...freshBlank,
        id: currentPlan.id,
        title: 'استمارة تحضير درس مفرغة (جاهزة للإدخال)',
      });
    }
  };

  const handleDeletePlan = (planIdToDelete: string) => {
    const targetPlan = plans.find((p) => p.id === planIdToDelete) || currentPlan;
    handleRequestDeletePlan(targetPlan);
  };

  const handleResetToDefault = () => {
    if (confirm('هل تريد استعادة الصفحة الرئيسية المفرغة المعتمدة للمنظومة والبدء من جديد؟')) {
      const freshBlank = getBlankLessonPlan();
      setPlans([freshBlank, ...defaultExemplarPlans]);
      setActivePlanId(freshBlank.id);
      setViewMode('editor');
    }
  };

  const handleImportPlan = (imported: LessonPlan) => {
    const planWithId = { ...imported, id: imported.id || `plan-${Date.now()}` };
    setPlans((prev) => [planWithId, ...prev]);
    setActivePlanId(planWithId.id);
  };

  if (viewMode === 'official-print') {
    return (
      <OfficialPrintView
        plan={currentPlan}
        onBack={() => setViewMode('editor')}
      />
    );
  }

  const navSections = [
    { id: 'all', label: 'كافة الأقسام', icon: Sparkles },
    { id: 'sec1', label: '١. التخطيط التكيفي', icon: Compass },
    { id: 'sec2', label: '٢. سير الحصة الرباعي', icon: Clock },
    { id: 'sec3', label: '٣. التقويم الأصيل GRASPS', icon: Target },
    { id: 'sec4', label: '٤. بيئة التعلم والشراكة', icon: Users2 },
    { id: 'sec5', label: '٥. التأمل الذاتي والـ PLC', icon: BrainCircuit },
    { id: 'sec6', label: '٦. الاعتماد والتوقيع', icon: FileCheck },
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-['Cairo',sans-serif] text-right">
      {/* Top Navbar */}
      <HeaderNav
        plans={plans}
        activePlanId={currentPlan.id}
        onSelectPlan={(id) => setActivePlanId(id)}
        onOpenAiGenerator={() => setIsAiModalOpen(true)}
        onOpenUnitPlanModal={() => setIsUnitPlanModalOpen(true)}
        onOpenSemesterPlanModal={() => setIsSemesterPlanModalOpen(true)}
        onOpenAbacusModal={() => setIsAbacusModalOpen(true)}
        onOpenWorksheetModal={() => setIsWorksheetModalOpen(true)}
        onOpenAssessmentModal={() => setIsAssessmentModalOpen(true)}
        onOpenAuthenticTaskModal={() => setIsAuthenticTaskModalOpen(true)}
        onOpenRubricModal={() => setIsRubricModalOpen(true)}
        onOpenPrintView={() => setViewMode('official-print')}
        onOpenResourcesModal={() => setIsResourcesModalOpen(true)}
        resourcesCount={resources.length}
        onResetToDefault={handleResetToDefault}
        onImportPlan={handleImportPlan}
        currentPlan={currentPlan}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenBlankTemplateModal={() => setIsBlankModalOpen(true)}
        onNewBlankPlan={handleCreateNewBlankPlan}
        onSelectBlankPlan={handleSelectBlankPlan}
        onDeletePlan={handleDeletePlan}
        onOpenPlansViewer={() => setIsPlansViewerModalOpen(true)}
        onRequestDeletePlan={() => handleRequestDeletePlan(currentPlan)}
        isCurrentPlanBlank={isCurrentPlanBlank}
        currentView={viewMode === 'dashboard' ? 'dashboard' : 'editor'}
        onChangeView={(view) => setViewMode(view)}
      />

      {viewMode === 'dashboard' ? (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <TeacherDashboard
            plans={plans}
            activePlanId={currentPlan.id}
            onSelectPlan={(id) => {
              setActivePlanId(id);
              setViewMode('editor');
            }}
            onOpenEditor={() => setViewMode('editor')}
            onOpenAiGenerator={() => setIsAiModalOpen(true)}
            onOpenUnitPlanModal={() => setIsUnitPlanModalOpen(true)}
            onOpenSemesterPlanModal={() => setIsSemesterPlanModalOpen(true)}
            onOpenWorksheetModal={(planId) => {
              if (planId) setActivePlanId(planId);
              setIsWorksheetModalOpen(true);
            }}
            onOpenPrintView={(planId) => {
              if (planId) setActivePlanId(planId);
              setViewMode('official-print');
            }}
            onOpenBlankTemplateModal={() => setIsBlankModalOpen(true)}
            onDeletePlan={handleDeletePlan}
            onOpenResourcesModal={() => setIsResourcesModalOpen(true)}
            resourcesCount={resources.length}
            onOpenAbacusModal={() => setIsAbacusModalOpen(true)}
          />
        </main>
      ) : (
        <>
          {/* Hero Pedagogical Context & Categorized Quick Action Hub */}
          <section className="bg-linear-to-b from-emerald-950 via-slate-900 to-slate-900 text-white py-5 sm:py-7 px-3 sm:px-6 lg:px-8 border-b border-emerald-900/50 shadow-md">
            <div className="max-w-7xl mx-auto space-y-5">
              
              {/* Top Row: Abqoor Prominent Logo, Plan Title, Ministry Badges & Primary Output CTAs */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                
                {/* Large Featured Logo Emblem & Title */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
                  <div className="relative group shrink-0">
                    <div className="absolute -inset-2 rounded-full bg-linear-to-tr from-amber-400 via-emerald-400 to-teal-300 opacity-85 blur-md group-hover:opacity-100 transition duration-300"></div>
                    <img
                      src="/abqoor_logo.jpg"
                      alt="شعار منظومة عبقور للتخطيط التربوي وتحضير الدروس"
                      className="relative w-32 h-32 sm:w-44 sm:h-44 md:w-52 md:h-52 lg:w-56 lg:h-56 rounded-full object-cover shadow-2xl border-4 border-amber-300 ring-4 ring-emerald-500/40 shrink-0 bg-white transition-transform group-hover:scale-[1.03]"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src.includes('abqoor_logo.jpg')) {
                          target.src = '/logo.png';
                        } else if (target.src.includes('logo.png')) {
                          target.src = '/logo.jpg';
                        } else {
                          target.style.display = 'none';
                          if (target.nextElementSibling) {
                            (target.nextElementSibling as HTMLElement).style.display = 'flex';
                          }
                        }
                      }}
                    />
                    <div
                      style={{ display: 'none' }}
                      className="relative w-32 h-32 sm:w-44 sm:h-44 md:w-52 md:h-52 lg:w-56 lg:h-56 rounded-full bg-linear-to-tr from-emerald-800 via-teal-800 to-amber-700 items-center justify-center text-white shadow-2xl ring-4 ring-emerald-500/40 shrink-0"
                    >
                      <BookOpen className="w-16 h-16 sm:w-20 sm:h-20 text-emerald-200" />
                    </div>
                  </div>

                  <div className="space-y-2 text-center sm:text-right max-w-2xl">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-bold border border-amber-500/40 shadow-xs">
                        <span>📌</span>
                        <span>استمارة التحضير المفرغة المعتمدة (الرئيسية)</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-semibold border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>معايير التميز وإطار تقييم أداء المعلم</span>
                      </div>
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-teal-500/20 text-teal-200 rounded-full text-[11px] font-bold border border-teal-500/30">
                        <span>🇵🇸 وزارة التربية والتعليم</span>
                      </div>
                    </div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-['Tajawal'] tracking-wide text-white leading-snug">
                      {currentPlan.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300/95 leading-relaxed">
                      منظومة عبقور الشاملة للتخطيط الصفي والتوزيع الفصلي وفق التقويم المدرسي المعتمد. يمكنك استخدام أيقونات الوصول السريع المصنفة أدناه لتوليد الخطط، أوراق العمل، والمهام الأصيلة، أو تحرير النموذج مباشرة.
                    </p>
                  </div>
                </div>

                {/* Direct High-Frequency Action Buttons */}
                <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2.5 shrink-0 pt-2 lg:pt-0">
                  <button
                    onClick={() => setViewMode('official-print')}
                    className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-97 cursor-pointer"
                    title="معاينة وطباعة الاستمارة الرسمية المعتمدة A4"
                  >
                    <Printer className="w-4.5 h-4.5 text-emerald-800 shrink-0" />
                    <span>معاينة وطباعة PDF</span>
                  </button>

                  <button
                    onClick={() => setIsExportModalOpen(true)}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-97 cursor-pointer"
                    title="تصدير الخطة بصيغ Word و HTML و JSON"
                  >
                    <FileDown className="w-4.5 h-4.5 text-blue-200 shrink-0" />
                    <span>تصدير الخطة</span>
                  </button>
                </div>
              </div>

              {/* Categorized Quick-Access Action Hub (مركز الوصول السريع المنظم للأدوات والأيقونات) */}
              <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3 sm:p-4.5 backdrop-blur-md space-y-4 shadow-xl">
                
                {/* 1. Category Filter Selector Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-800 pb-3">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                    <span className="text-slate-400 text-[11px] ml-1 flex items-center gap-1">
                      <Filter className="w-3.5 h-3.5 text-emerald-400" />
                      <span>تصنيف الأيقونات:</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => setActionCategoryFilter('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        actionCategoryFilter === 'all'
                          ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/40'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                      }`}
                    >
                      <span>🌟 كافة الأدوات</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActionCategoryFilter('ai')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                        actionCategoryFilter === 'ai'
                          ? 'bg-linear-to-r from-emerald-600 to-teal-600 text-white shadow-sm ring-2 ring-emerald-400/40'
                          : 'bg-slate-800 text-emerald-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>التخطيط والتوليد بالـ AI</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActionCategoryFilter('resources')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                        actionCategoryFilter === 'resources'
                          ? 'bg-linear-to-r from-teal-600 to-cyan-700 text-white shadow-sm ring-2 ring-teal-400/40'
                          : 'bg-slate-800 text-teal-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5 text-teal-300" />
                      <span>المناهج والوسائل ({toArabicDigits(resources.length)})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActionCategoryFilter('plans')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                        actionCategoryFilter === 'plans'
                          ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-400/40'
                          : 'bg-slate-800 text-amber-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                      }`}
                    >
                      <FileEdit className="w-3.5 h-3.5 text-amber-300" />
                      <span>إدارة ونماذج التحضير</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActionCategoryFilter('export')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                        actionCategoryFilter === 'export'
                          ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/40'
                          : 'bg-slate-800 text-blue-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                      }`}
                    >
                      <Printer className="w-3.5 h-3.5 text-blue-300" />
                      <span>الطباعة والتصدير</span>
                    </button>
                  </div>

                  <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-400">
                    <span>💡 رتّبنا الأدوات حسب الأولوية لتسهيل الوصول والتنقل السريع.</span>
                  </div>
                </div>

                {/* 2. Structured Action Cards Grid (مرتبة ومبوبة حسب الفئة) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
                  
                  {/* === GROUP 1: AI PLANNING & GENERATION === */}
                  {(actionCategoryFilter === 'all' || actionCategoryFilter === 'ai') && (
                    <>
                      {/* AI Single Lesson Generator */}
                      <button
                        onClick={() => setIsAiModalOpen(true)}
                        className="p-3 bg-linear-to-br from-emerald-800/90 via-teal-900/90 to-emerald-950 border border-emerald-500/60 hover:border-emerald-400 rounded-xl text-right flex flex-col justify-between gap-2 transition-all hover:scale-[1.02] hover:shadow-lg active:scale-97 cursor-pointer group shadow-sm min-h-[96px]"
                        title="توليد خطة درس نموذجية كاملة بالأقسام الستة بالذكاء الاصطناعي"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="w-8 h-8 rounded-lg bg-emerald-600/40 flex items-center justify-center border border-emerald-400/30 group-hover:bg-emerald-500/50 transition-colors">
                            <Sparkles className="w-4 h-4 text-amber-300" />
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-md border border-emerald-500/30">
                            AI فوري
                          </span>
                        </div>
                        <div>
                          <span className="block font-black text-xs text-white group-hover:text-emerald-200 transition-colors font-['Tajawal']">
                            تحضير درس بالـ AI
                          </span>
                          <span className="block text-[10px] text-slate-300/80 truncate">
                            خطة متكاملة للأقسام 1-6
                          </span>
                        </div>
                      </button>

                      {/* AI Unit Plan Generator */}
                      <button
                        onClick={() => setIsUnitPlanModalOpen(true)}
                        className="p-3 bg-linear-to-br from-blue-900/90 via-indigo-950 to-purple-950 border border-blue-500/60 hover:border-blue-400 rounded-xl text-right flex flex-col justify-between gap-2 transition-all hover:scale-[1.02] hover:shadow-lg active:scale-97 cursor-pointer group shadow-sm min-h-[96px]"
                        title="توليد وتصميم تحضير وحدة كاملة بمجموع دروسها مع رفع المناهج"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="w-8 h-8 rounded-lg bg-blue-600/40 flex items-center justify-center border border-blue-400/30 group-hover:bg-blue-500/50 transition-colors">
                            <Boxes className="w-4 h-4 text-blue-200" />
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded-md border border-blue-500/30">
                            وحدة كاملة
                          </span>
                        </div>
                        <div>
                          <span className="block font-black text-xs text-white group-hover:text-blue-200 transition-colors font-['Tajawal']">
                            تحضير وحدة (AI)
                          </span>
                          <span className="block text-[10px] text-slate-300/80 truncate">
                            وحدة شاملة + رفع المصادر
                          </span>
                        </div>
                      </button>

                      {/* Semester Plan & Periods Distribution */}
                      <button
                        onClick={() => setIsSemesterPlanModalOpen(true)}
                        className="p-3 bg-linear-to-br from-teal-900/90 via-emerald-950 to-cyan-950 border border-teal-500/60 hover:border-cyan-400 rounded-xl text-right flex flex-col justify-between gap-2 transition-all hover:scale-[1.02] hover:shadow-lg active:scale-97 cursor-pointer group shadow-sm min-h-[96px]"
                        title="توليد وعرض الخطة الفصلية الموحدة ودليل توزيع الحصص بالتقويم الفلسطيني"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="w-8 h-8 rounded-lg bg-teal-600/40 flex items-center justify-center border border-teal-400/30 group-hover:bg-teal-500/50 transition-colors">
                            <CalendarRange className="w-4 h-4 text-cyan-200" />
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-teal-500/20 text-cyan-300 rounded-md border border-teal-500/30">
                            فصلي 🇵🇸
                          </span>
                        </div>
                        <div>
                          <span className="block font-black text-xs text-white group-hover:text-cyan-200 transition-colors font-['Tajawal']">
                            الخطة الفصلية
                          </span>
                          <span className="block text-[10px] text-slate-300/80 truncate">
                            توزيع الحصص والتقويم
                          </span>
                        </div>
                      </button>

                      {/* Interactive Worksheets AI */}
                      <button
                        onClick={() => setIsWorksheetModalOpen(true)}
                        className="p-3 bg-linear-to-br from-teal-900/80 via-slate-900 to-slate-950 border border-teal-500/50 hover:border-teal-400 rounded-xl text-right flex flex-col justify-between gap-2 transition-all hover:scale-[1.02] hover:shadow-md active:scale-97 cursor-pointer group shadow-sm min-h-[96px]"
                        title="توليد أوراق عمل تفاعلية ذكية متوافقة مع المادة بالذكاء الاصطناعي"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="w-8 h-8 rounded-lg bg-teal-700/40 flex items-center justify-center border border-teal-400/30 group-hover:bg-teal-600/50 transition-colors">
                            <FileCheck className="w-4 h-4 text-teal-200" />
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-teal-500/20 text-teal-300 rounded-md">
                            أوراق عمل
                          </span>
                        </div>
                        <div>
                          <span className="block font-black text-xs text-white group-hover:text-teal-200 transition-colors font-['Tajawal']">
                            أوراق عمل AI
                          </span>
                          <span className="block text-[10px] text-slate-300/80 truncate">
                            أنشطة تفاعلية متمايزة
                          </span>
                        </div>
                      </button>

                      {/* Authentic Task Generator (GRASPS) */}
                      <button
                        onClick={() => setIsAuthenticTaskModalOpen(true)}
                        className="p-3 bg-linear-to-br from-purple-900/80 via-slate-900 to-indigo-950 border border-purple-500/50 hover:border-purple-400 rounded-xl text-right flex flex-col justify-between gap-2 transition-all hover:scale-[1.02] hover:shadow-md active:scale-97 cursor-pointer group shadow-sm min-h-[96px]"
                        title="توليد مهمة تقويم أصيل واقعية وفق إطار GRASPS"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="w-8 h-8 rounded-lg bg-purple-700/40 flex items-center justify-center border border-purple-400/30 group-hover:bg-purple-600/50 transition-colors">
                            <Target className="w-4 h-4 text-pink-200" />
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded-md">
                            GRASPS
                          </span>
                        </div>
                        <div>
                          <span className="block font-black text-xs text-white group-hover:text-purple-200 transition-colors font-['Tajawal']">
                            المهام الأصيلة
                          </span>
                          <span className="block text-[10px] text-slate-300/80 truncate">
                            مواقف واقعية ومحاكاة
                          </span>
                        </div>
                      </button>

                      {/* Rubric Generator */}
                      <button
                        onClick={() => setIsRubricModalOpen(true)}
                        className="p-3 bg-linear-to-br from-indigo-900/80 via-slate-900 to-purple-950 border border-indigo-500/50 hover:border-indigo-400 rounded-xl text-right flex flex-col justify-between gap-2 transition-all hover:scale-[1.02] hover:shadow-md active:scale-97 cursor-pointer group shadow-sm min-h-[96px]"
                        title="توليد سلالم التقدير اللفظية Rubric لمهمة الدرس"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="w-8 h-8 rounded-lg bg-indigo-700/40 flex items-center justify-center border border-indigo-400/30 group-hover:bg-indigo-600/50 transition-colors">
                            <Award className="w-4 h-4 text-indigo-200" />
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-md">
                            Rubric
                          </span>
                        </div>
                        <div>
                          <span className="block font-black text-xs text-white group-hover:text-indigo-200 transition-colors font-['Tajawal']">
                            سلم التقدير
                          </span>
                          <span className="block text-[10px] text-slate-300/80 truncate">
                            المعايير الوزارية ٤ مستويات
                          </span>
                        </div>
                      </button>
                    </>
                  )}

                  {/* === GROUP 2: RESOURCES & CURRICULUM TOOLS === */}
                  {(actionCategoryFilter === 'all' || actionCategoryFilter === 'resources') && (
                    <>
                      {/* Resources Bank & Uploader */}
                      <button
                        onClick={() => setIsResourcesModalOpen(true)}
                        className="p-3 bg-linear-to-br from-emerald-800 via-teal-800 to-emerald-900 border-2 border-emerald-400/80 hover:border-emerald-300 rounded-xl text-right flex flex-col justify-between gap-2 transition-all hover:scale-[1.02] hover:shadow-lg active:scale-97 cursor-pointer group shadow-md min-h-[96px] ring-2 ring-emerald-500/20"
                        title="إدارة ورفع المصادر والمناهج والمراجع التعليمية بسهولة"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center border border-emerald-200/40 group-hover:bg-white/30 transition-colors">
                            <Layers className="w-4 h-4 text-emerald-100" />
                          </div>
                          <span className="text-[10px] font-black px-2 py-0.5 bg-amber-400 text-amber-950 rounded-full shadow-2xs tabular-nums">
                            +{toArabicDigits(resources.length)} مصدر
                          </span>
                        </div>
                        <div>
                          <span className="block font-black text-xs text-white group-hover:text-emerald-200 transition-colors font-['Tajawal']">
                            إضافة المصادر
                          </span>
                          <span className="block text-[10px] text-emerald-100/90 truncate">
                            رفع كتب PDF والدلائل
                          </span>
                        </div>
                      </button>

                      {/* Interactive Simulator / Abacus */}
                      <button
                        onClick={() => setIsAbacusModalOpen(true)}
                        className="p-3 bg-linear-to-br from-slate-800 via-slate-900 to-emerald-950 border border-slate-700 hover:border-emerald-400 rounded-xl text-right flex flex-col justify-between gap-2 transition-all hover:scale-[1.02] hover:shadow-md active:scale-97 cursor-pointer group shadow-sm min-h-[96px]"
                        title="المحاكي الرقمي والأداة التفاعلية المتوافقة مع الدرس"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="w-8 h-8 rounded-lg bg-emerald-800/40 flex items-center justify-center border border-emerald-500/30 group-hover:bg-emerald-700/50 transition-colors">
                            <Calculator className="w-4 h-4 text-emerald-300" />
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-800 text-emerald-300 rounded-md border border-slate-700">
                            تفاعلي
                          </span>
                        </div>
                        <div>
                          <span className="block font-black text-xs text-white group-hover:text-emerald-200 transition-colors font-['Tajawal']">
                            المحاكي الرقمي
                          </span>
                          <span className="block text-[10px] text-slate-300/80 truncate">
                            المعداد ولوحة المنازل
                          </span>
                        </div>
                      </button>

                      {/* Productivity Dashboard */}
                      <button
                        onClick={() => setViewMode('dashboard')}
                        className="p-3 bg-linear-to-br from-slate-800 via-slate-900 to-teal-950 border border-slate-700 hover:border-teal-400 rounded-xl text-right flex flex-col justify-between gap-2 transition-all hover:scale-[1.02] hover:shadow-md active:scale-97 cursor-pointer group shadow-sm min-h-[96px]"
                        title="لوحة الإنتاجية المفهرسة والإحصاءات والتقويم الشهري"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="w-8 h-8 rounded-lg bg-teal-800/40 flex items-center justify-center border border-teal-500/30 group-hover:bg-teal-700/50 transition-colors">
                            <LayoutDashboard className="w-4 h-4 text-teal-300" />
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-800 text-teal-300 rounded-md border border-slate-700">
                            إحصاءات
                          </span>
                        </div>
                        <div>
                          <span className="block font-black text-xs text-white group-hover:text-teal-200 transition-colors font-['Tajawal']">
                            لوحة الإنتاجية
                          </span>
                          <span className="block text-[10px] text-slate-300/80 truncate">
                            متابعة الإنجاز والتقويم
                          </span>
                        </div>
                      </button>

                      {/* Family Partnership Card */}
                      <button
                        onClick={() => setIsParentCardModalOpen(true)}
                        className="p-3 bg-linear-to-br from-slate-800 via-slate-900 to-indigo-950 border border-slate-700 hover:border-indigo-400 rounded-xl text-right flex flex-col justify-between gap-2 transition-all hover:scale-[1.02] hover:shadow-md active:scale-97 cursor-pointer group shadow-sm min-h-[96px]"
                        title="بطاقة الشراكة الأسرية التفاعلية مع ولي الأمر"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="w-8 h-8 rounded-lg bg-indigo-800/40 flex items-center justify-center border border-indigo-500/30 group-hover:bg-indigo-700/50 transition-colors">
                            <Users2 className="w-4 h-4 text-indigo-300" />
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-800 text-indigo-300 rounded-md border border-slate-700">
                            منزلي
                          </span>
                        </div>
                        <div>
                          <span className="block font-black text-xs text-white group-hover:text-indigo-200 transition-colors font-['Tajawal']">
                            الشراكة الأسرية
                          </span>
                          <span className="block text-[10px] text-slate-300/80 truncate">
                            بطاقة متابعة ولي الأمر
                          </span>
                        </div>
                      </button>
                    </>
                  )}

                  {/* === GROUP 3: PLANS & TEMPLATES MANAGEMENT === */}
                  {(actionCategoryFilter === 'all' || actionCategoryFilter === 'plans') && (
                    <>
                      {/* Blank Template Setup Modal */}
                      <button
                        onClick={() => setIsBlankModalOpen(true)}
                        className="p-3 bg-linear-to-br from-amber-900/80 via-slate-900 to-amber-950 border border-amber-500/60 hover:border-amber-400 rounded-xl text-right flex flex-col justify-between gap-2 transition-all hover:scale-[1.02] hover:shadow-md active:scale-97 cursor-pointer group shadow-sm min-h-[96px]"
                        title="استمارة تحضير مفرغة رسمية للطباعة أو البدء الرقمي الفوري"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="w-8 h-8 rounded-lg bg-amber-600/40 flex items-center justify-center border border-amber-400/30 group-hover:bg-amber-500/50 transition-colors">
                            <FileEdit className="w-4 h-4 text-amber-300" />
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded-md border border-amber-500/30">
                            الرئيسية
                          </span>
                        </div>
                        <div>
                          <span className="block font-black text-xs text-white group-hover:text-amber-200 transition-colors font-['Tajawal']">
                            استمارة مفرغة
                          </span>
                          <span className="block text-[10px] text-slate-300/80 truncate">
                            نموذج وزاري فارغ جاهز
                          </span>
                        </div>
                      </button>

                      {/* Plans Catalog Viewer */}
                      <button
                        onClick={() => setIsPlansViewerModalOpen(true)}
                        className="p-3 bg-linear-to-br from-slate-800 via-slate-900 to-emerald-950 border border-slate-700 hover:border-emerald-400 rounded-xl text-right flex flex-col justify-between gap-2 transition-all hover:scale-[1.02] hover:shadow-md active:scale-97 cursor-pointer group shadow-sm min-h-[96px]"
                        title="عرض واستعراض كافة خطط الدروس المحفوظة في المنظومة والتبديل المباشر بينها"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="w-8 h-8 rounded-lg bg-emerald-800/40 flex items-center justify-center border border-emerald-500/30 group-hover:bg-emerald-700/50 transition-colors">
                            <FolderKanban className="w-4 h-4 text-emerald-300" />
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-md border border-emerald-500/30">
                            {toArabicDigits(plans.length)} خطة
                          </span>
                        </div>
                        <div>
                          <span className="block font-black text-xs text-white group-hover:text-emerald-200 transition-colors font-['Tajawal']">
                            سجل الخطط
                          </span>
                          <span className="block text-[10px] text-slate-300/80 truncate">
                            استعراض وتبديل الخطط
                          </span>
                        </div>
                      </button>

                      {/* Clear Fields to Start Blank */}
                      <button
                        onClick={handleClearCurrentPlan}
                        className="p-3 bg-linear-to-br from-slate-800 via-slate-900 to-amber-950 border border-slate-700 hover:border-amber-400 rounded-xl text-right flex flex-col justify-between gap-2 transition-all hover:scale-[1.02] hover:shadow-md active:scale-97 cursor-pointer group shadow-sm min-h-[96px]"
                        title="تفريغ ومسح كافة الحقول الحالية للبدء من الصفر"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="w-8 h-8 rounded-lg bg-amber-800/40 flex items-center justify-center border border-amber-500/30 group-hover:bg-amber-700/50 transition-colors">
                            <RotateCcw className="w-4 h-4 text-amber-300" />
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-800 text-amber-300 rounded-md border border-slate-700">
                            تصفير
                          </span>
                        </div>
                        <div>
                          <span className="block font-black text-xs text-white group-hover:text-amber-200 transition-colors font-['Tajawal']">
                            تفريغ الحقول
                          </span>
                          <span className="block text-[10px] text-slate-300/80 truncate">
                            بدء إدخال جديد من الصفر
                          </span>
                        </div>
                      </button>

                      {/* Delete Plan Button */}
                      <button
                        onClick={() => handleRequestDeletePlan(currentPlan)}
                        className="p-3 bg-linear-to-br from-rose-950/80 via-slate-900 to-slate-950 border border-rose-600/50 hover:border-rose-400 rounded-xl text-right flex flex-col justify-between gap-2 transition-all hover:scale-[1.02] hover:shadow-md active:scale-97 cursor-pointer group shadow-sm min-h-[96px]"
                        title="حذف هذه الخطة نهائياً من المنظومة عند وجود أخطاء أو الرغبة بالتراجع"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="w-8 h-8 rounded-lg bg-rose-800/40 flex items-center justify-center border border-rose-500/30 group-hover:bg-rose-700/50 transition-colors">
                            <Trash2 className="w-4 h-4 text-rose-300" />
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-rose-500/20 text-rose-300 rounded-md border border-rose-500/30">
                            تراجع
                          </span>
                        </div>
                        <div>
                          <span className="block font-black text-xs text-rose-200 group-hover:text-rose-100 transition-colors font-['Tajawal']">
                            حذف الخطة
                          </span>
                          <span className="block text-[10px] text-rose-300/70 truncate">
                            حذف الخطة المعروضة
                          </span>
                        </div>
                      </button>
                    </>
                  )}

                  {/* === GROUP 4: EXPORT, PRINT & ASSESSMENT === */}
                  {(actionCategoryFilter === 'all' || actionCategoryFilter === 'export') && (
                    <>
                      {/* Exit Ticket Generator */}
                      <button
                        onClick={() => setIsExitTicketModalOpen(true)}
                        className="p-3 bg-linear-to-br from-slate-800 via-slate-900 to-purple-950 border border-slate-700 hover:border-purple-400 rounded-xl text-right flex flex-col justify-between gap-2 transition-all hover:scale-[1.02] hover:shadow-md active:scale-97 cursor-pointer group shadow-sm min-h-[96px]"
                        title="بطاقات خروج الحصة Exit Ticket للتقويم التكويني والختامي"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="w-8 h-8 rounded-lg bg-purple-800/40 flex items-center justify-center border border-purple-500/30 group-hover:bg-purple-700/50 transition-colors">
                            <Clock className="w-4 h-4 text-purple-300" />
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-800 text-purple-300 rounded-md border border-slate-700">
                            تكويني
                          </span>
                        </div>
                        <div>
                          <span className="block font-black text-xs text-white group-hover:text-purple-200 transition-colors font-['Tajawal']">
                            بطاقة الخروج
                          </span>
                          <span className="block text-[10px] text-slate-300/80 truncate">
                            Exit Ticket ختام الحصة
                          </span>
                        </div>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Sub-nav Category Tabs */}
          <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-2xs">
            <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between overflow-x-auto py-2 sm:py-2.5 scrollbar-none touch-pan-x gap-2">
                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                  {navSections.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1 sm:gap-1.5 shrink-0 transition-all ${
                          isActive
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-200' : 'text-slate-500'}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Quick Link to Resources in Subnav - Distinctive & Large */}
                <button
                  onClick={() => setIsResourcesModalOpen(true)}
                  className="px-3.5 py-1.5 bg-linear-to-r from-emerald-100 to-teal-50 hover:from-emerald-200 hover:to-teal-100 text-emerald-950 rounded-xl text-xs font-black flex items-center gap-2 border-2 border-emerald-500/80 shrink-0 transition-all shadow-xs hover:shadow-sm hover:scale-[1.02] cursor-pointer ring-1 ring-emerald-500/20"
                  title="فتح وإضافة بنك المصادر والمراجع التعليمية والمناهج"
                >
                  <div className="relative p-0.5 bg-emerald-700 text-white rounded-md shrink-0">
                    <Layers className="w-4 h-4 text-emerald-100" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 text-amber-950 rounded-full flex items-center justify-center text-[8px] font-black">
                      +
                    </span>
                  </div>
                  <span>إضافة المصادر ({toArabicDigits(resources.length)})</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Body */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
            {/* Header / Institutional Metadata */}
            <LessonHeaderCard
              header={currentPlan.header}
              onChange={(header) => updateCurrentPlan({ ...currentPlan, header })}
              onOpenUnitPlanModal={() => setIsUnitPlanModalOpen(true)}
              onOpenSemesterPlanModal={() => setIsSemesterPlanModalOpen(true)}
              onOpenResourcesModal={() => setIsResourcesModalOpen(true)}
              resourcesCount={resources.length}
            />

            {/* Section 1: Adaptive Planning */}
            {(activeTab === 'all' || activeTab === 'sec1') && (
              <Section1Card
                data={currentPlan.section1}
                lessonContext={{
                  subject: currentPlan.header.subject,
                  grade: currentPlan.header.grade,
                  lessonTitle: currentPlan.header.lessonTitle,
                }}
                onChange={(section1) => updateCurrentPlan({ ...currentPlan, section1 })}
                onOpenResourcesModal={() => setIsResourcesModalOpen(true)}
              />
            )}

            {/* Section 2: Timeline */}
            {(activeTab === 'all' || activeTab === 'sec2') && (
              <Section2TimelineCard
                timeline={currentPlan.section2Timeline}
                totalMinutes={currentPlan.header.periodDurationMinutes}
                onOpenAbacusModal={() => setIsAbacusModalOpen(true)}
                onOpenExitTicketModal={() => setIsExitTicketModalOpen(true)}
                onOpenWorksheetModal={() => setIsWorksheetModalOpen(true)}
                onChange={(section2Timeline) => updateCurrentPlan({ ...currentPlan, section2Timeline })}
                plan={currentPlan}
              />
            )}

            {/* Section 3: Assessment & GRASPS */}
            {(activeTab === 'all' || activeTab === 'sec3') && (
              <Section3AssessmentCard
                data={currentPlan.section3Assessment}
                onChange={(section3Assessment) => updateCurrentPlan({ ...currentPlan, section3Assessment })}
                onOpenWorksheetModal={() => setIsWorksheetModalOpen(true)}
                onOpenAssessmentModal={() => setIsAssessmentModalOpen(true)}
                onOpenAuthenticTaskModal={() => setIsAuthenticTaskModalOpen(true)}
                onOpenRubricModal={() => setIsRubricModalOpen(true)}
              />
            )}

            {/* Section 4: Learning Environment & Parents */}
            {(activeTab === 'all' || activeTab === 'sec4') && (
              <Section4EnvironmentCard
                data={currentPlan.section4Environment}
                onOpenParentCardModal={() => setIsParentCardModalOpen(true)}
                onChange={(section4Environment) => updateCurrentPlan({ ...currentPlan, section4Environment })}
              />
            )}

            {/* Section 5: Self Reflection */}
            {(activeTab === 'all' || activeTab === 'sec5') && (
              <Section5ReflectionCard
                data={currentPlan.section5Reflection}
                onChange={(section5Reflection) => updateCurrentPlan({ ...currentPlan, section5Reflection })}
              />
            )}

            {/* Section 6: Official Signatures */}
            {(activeTab === 'all' || activeTab === 'sec6') && (
              <Section6SignaturesCard
                data={currentPlan.section6Signatures}
                onChange={(section6Signatures) => updateCurrentPlan({ ...currentPlan, section6Signatures })}
              />
            )}
          </main>
        </>
      )}

      {/* Footer & Creative Commons License */}
      <CreativeCommonsFooter />

      {/* Modals */}
      <AiGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => {
          setIsAiModalOpen(false);
          setSelectedResourceForPlanning(null);
        }}
        onPlanGenerated={handlePlanGenerated}
        resources={resources}
        onOpenResourcesModal={() => setIsResourcesModalOpen(true)}
        selectedResourceForPlanning={selectedResourceForPlanning}
      />

      <UnitPlanGeneratorModal
        isOpen={isUnitPlanModalOpen}
        onClose={() => setIsUnitPlanModalOpen(false)}
        onPlansGenerated={handleUnitPlansGenerated}
        defaultTeacherName={currentPlan.header.teacherName}
        defaultSchool={currentPlan.header.school}
        defaultDirectorate={currentPlan.header.directorate}
        defaultSubject={currentPlan.header.subject}
        defaultGrade={currentPlan.header.grade}
      />

      <ResourcesManagerModal
        isOpen={isResourcesModalOpen}
        onClose={() => setIsResourcesModalOpen(false)}
        resources={resources}
        onAddResource={(newRes) => {
          setResources((prev) => [newRes, ...prev]);
          setSelectedResourceForPlanning(newRes);
        }}
        onDeleteResource={(id) => setResources((prev) => prev.filter((r) => r.id !== id))}
        onGenerateWithResources={(selectedRes) => {
          if (selectedRes) {
            setSelectedResourceForPlanning(selectedRes);
          } else if (resources.length > 0) {
            setSelectedResourceForPlanning(resources[0]);
          }
          setIsResourcesModalOpen(false);
          setIsAiModalOpen(true);
        }}
        onApplyToCurrentPlan={handleApplyResourceToCurrentPlan}
        currentPlanTitle={currentPlan.title}
      />

      <AbacusSimulationModal
        isOpen={isAbacusModalOpen}
        onClose={() => setIsAbacusModalOpen(false)}
        plan={currentPlan}
        plans={plans}
        onSelectPlan={(id) => setActivePlanId(id)}
        onUpdatePlan={updateCurrentPlan}
      />

      <InteractiveWorksheetModal
        isOpen={isWorksheetModalOpen}
        onClose={() => setIsWorksheetModalOpen(false)}
        plan={currentPlan}
        onSaveToResources={(newRes) => {
          setResources((prev) => [newRes, ...prev]);
        }}
      />

      <AssessmentHubModal
        isOpen={isAssessmentModalOpen}
        onClose={() => setIsAssessmentModalOpen(false)}
        lessonContext={{
          subject: currentPlan.header.subject,
          grade: currentPlan.header.grade,
          lessonTitle: currentPlan.header.lessonTitle
        }}
        onApplyToPlan={(data) => {
          // Update Section 3 or other parts if desired
        }}
      />

      <AuthenticTaskGeneratorModal
        isOpen={isAuthenticTaskModalOpen}
        onClose={() => setIsAuthenticTaskModalOpen(false)}
        lessonContext={{
          subject: currentPlan.header.subject,
          grade: currentPlan.header.grade,
          lessonTitle: currentPlan.header.lessonTitle
        }}
        initialTask={currentPlan.section3Assessment.graspsTask}
        onApplyTask={(newTask) => {
          updateCurrentPlan({
            ...currentPlan,
            section3Assessment: {
              ...currentPlan.section3Assessment,
              graspsTask: newTask
            }
          });
        }}
      />

      <RubricGeneratorModal
        isOpen={isRubricModalOpen}
        onClose={() => setIsRubricModalOpen(false)}
        lessonContext={{
          subject: currentPlan.header.subject,
          grade: currentPlan.header.grade,
          lessonTitle: currentPlan.header.lessonTitle
        }}
        initialRubric={currentPlan.section3Assessment.rubric}
        onApplyRubric={(newRubric) => {
          updateCurrentPlan({
            ...currentPlan,
            section3Assessment: {
              ...currentPlan.section3Assessment,
              rubric: newRubric
            }
          });
        }}
      />

      <ExitTicketModal
        isOpen={isExitTicketModalOpen}
        onClose={() => setIsExitTicketModalOpen(false)}
        plan={currentPlan}
      />

      <ParentCardModal
        isOpen={isParentCardModalOpen}
        onClose={() => setIsParentCardModalOpen(false)}
        plan={currentPlan}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        plan={currentPlan}
        onOpenPdfPrint={() => setViewMode('official-print')}
      />

      <BlankTemplateModal
        isOpen={isBlankModalOpen}
        onClose={() => setIsBlankModalOpen(false)}
        onCreatePlan={(newPlan) => {
          handlePlanGenerated(newPlan);
          setViewMode('editor');
        }}
        onOpenResourcesModal={() => setIsResourcesModalOpen(true)}
      />

      <PlansViewerModal
        isOpen={isPlansViewerModalOpen}
        onClose={() => setIsPlansViewerModalOpen(false)}
        plans={plans}
        activePlanId={currentPlan.id}
        onSelectPlan={(id) => {
          setActivePlanId(id);
          setViewMode('editor');
        }}
        onRequestDeletePlan={(plan) => {
          setIsPlansViewerModalOpen(false);
          handleRequestDeletePlan(plan);
        }}
        onOpenEditor={() => {
          setIsPlansViewerModalOpen(false);
          setViewMode('editor');
        }}
        onOpenPrintView={(planId) => {
          setIsPlansViewerModalOpen(false);
          if (planId) setActivePlanId(planId);
          setViewMode('official-print');
        }}
        onOpenNewBlank={() => {
          setIsPlansViewerModalOpen(false);
          handleCreateNewBlankPlan();
        }}
        onOpenAiGenerator={() => {
          setIsPlansViewerModalOpen(false);
          setIsAiModalOpen(true);
        }}
        onOpenUnitPlanModal={() => {
          setIsPlansViewerModalOpen(false);
          setIsUnitPlanModalOpen(true);
        }}
        onOpenSemesterPlanModal={() => {
          setIsPlansViewerModalOpen(false);
          setIsSemesterPlanModalOpen(true);
        }}
        onGoToDashboard={() => {
          setIsPlansViewerModalOpen(false);
          setViewMode('dashboard');
        }}
      />

      <SemesterPlanModal
        isOpen={isSemesterPlanModalOpen}
        onClose={() => setIsSemesterPlanModalOpen(false)}
        savedPlans={plans}
        defaultSubject={currentPlan.header.subject}
        defaultGrade={currentPlan.header.grade}
        teacherName={currentPlan.header.teacherName}
        schoolName={currentPlan.header.school}
        onImportLessonsToApp={handleUnitPlansGenerated}
      />

      <DeletePlanConfirmModal
        isOpen={planToDelete !== null}
        onClose={() => setPlanToDelete(null)}
        plan={planToDelete || undefined}
        onConfirmDelete={handleConfirmDelete}
        onClearFieldsInstead={handleClearCurrentPlan}
      />

      {/* Floating WhatsApp Contact Button */}
      <FloatingWhatsAppButton />
    </div>
  );
}
