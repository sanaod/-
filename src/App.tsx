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
} from 'lucide-react';

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

  // Modals
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isWorksheetModalOpen, setIsWorksheetModalOpen] = useState(false);
  const [isBlankModalOpen, setIsBlankModalOpen] = useState(false);
  const [isAbacusModalOpen, setIsAbacusModalOpen] = useState(false);
  const [isExitTicketModalOpen, setIsExitTicketModalOpen] = useState(false);
  const [isParentCardModalOpen, setIsParentCardModalOpen] = useState(false);
  const [isResourcesModalOpen, setIsResourcesModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPlansViewerModalOpen, setIsPlansViewerModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<LessonPlan | null>(null);
  const [selectedResourceForPlanning, setSelectedResourceForPlanning] = useState<EducationalResource | null>(null);

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
        onOpenAbacusModal={() => setIsAbacusModalOpen(true)}
        onOpenWorksheetModal={() => setIsWorksheetModalOpen(true)}
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
          {/* Hero Pedagogical Context Banner */}
          <section className="bg-linear-to-b from-emerald-950 via-slate-900 to-slate-900 text-white py-4 sm:py-6 px-3 sm:px-6 lg:px-8 border-b border-emerald-900/40">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-3xl">
                <div className="flex flex-wrap items-center gap-1.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-full text-[11px] sm:text-xs font-bold border border-amber-500/40 shadow-xs">
                    <span>📌</span>
                    <span>استمارة التحضير المفرغة المعتمدة (الصفحة الرئيسية للمنظومة)</span>
                  </div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] sm:text-[11px] font-semibold border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                    <span>معايير التميز الوزارية</span>
                  </div>
                </div>
                <h2 className="text-lg sm:text-2xl font-black font-['Tajawal'] tracking-wide">
                  {currentPlan.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  النموذج الرسمي المفرغ المعتمد للتخطيط والتحضير الصفي وفق معايير التميز وإطار تقييم أداء المعلم. يمكنك كتابة عناصر الخطة مباشرة في الحقول أدناه أو الاستعانة بمساعد الذكاء الاصطناعي.
                </p>
              </div>

              {/* Action Buttons Grid: Fully Responsive on Mobile (2 cols), Tablet (4 cols), and Desktop (flex/wrap) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:flex xl:flex-wrap items-center gap-2 w-full md:w-auto">
                <button
                  onClick={handleClearCurrentPlan}
                  title="مسح وتفريغ الحقول الحالية للبدء من الصفر"
                  className="min-h-[42px] px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-amber-400/50 shadow-xs cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-amber-200 shrink-0" />
                  <span className="truncate">تفريغ الحقول</span>
                </button>
                <button
                  onClick={handleCreateNewBlankPlan}
                  title="بدء نموذج تحضير مفرغ جديد"
                  className="min-h-[42px] px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-emerald-400/50 shadow-xs cursor-pointer"
                >
                  <FileEdit className="w-4 h-4 text-emerald-200 shrink-0" />
                  <span className="truncate">تحضير جديد</span>
                </button>
                <button
                  onClick={() => setIsWorksheetModalOpen(true)}
                  title="توليد أوراق عمل تفاعلية ذكية متوافقة مع المادة بالذكاء الاصطناعي"
                  className="min-h-[42px] px-3 py-2 bg-linear-to-r from-teal-700 via-teal-800 to-emerald-800 hover:from-teal-800 hover:to-emerald-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs border border-teal-500/50 cursor-pointer"
                >
                  <FileCheck className="w-4 h-4 text-teal-200 shrink-0" />
                  <span className="truncate">أوراق عمل AI</span>
                </button>
                <button
                  onClick={() => setIsAbacusModalOpen(true)}
                  title="المحاكي الرقمي والأداة التفاعلية المتوافقة مع الدرس"
                  className="min-h-[42px] px-3 py-2 bg-emerald-900/90 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-emerald-500/40 shadow-xs cursor-pointer"
                >
                  <Calculator className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span className="truncate">المحاكي</span>
                </button>
                <button
                  onClick={() => setIsResourcesModalOpen(true)}
                  title="إدارة ورفع المصادر والمناهج والمراجع التعليمية"
                  className="min-h-[42px] px-3 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-emerald-500/60 shadow-xs cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span className="truncate">المصادر ({toArabicDigits(resources.length)})</span>
                </button>
                <button
                  onClick={() => setIsAiModalOpen(true)}
                  className="min-h-[42px] px-3 py-2 bg-linear-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span className="truncate">توليد بالـ AI</span>
                </button>
                <button
                  onClick={() => setIsExportModalOpen(true)}
                  className="min-h-[42px] px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <FileDown className="w-4 h-4 text-blue-200 shrink-0" />
                  <span className="truncate">تصدير الخطة</span>
                </button>
                <button
                  onClick={() => setViewMode('official-print')}
                  className="min-h-[42px] px-3 py-2 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-emerald-800 shrink-0" />
                  <span className="truncate">معاينة PDF</span>
                </button>
                <button
                  onClick={() => handleRequestDeletePlan(currentPlan)}
                  title="حذف هذه الخطة نهائياً من المنظومة عند وجود أخطاء أو الرغبة بالتراجع"
                  className="min-h-[42px] px-3 py-2 bg-rose-700/90 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-rose-500/50 shadow-xs col-span-2 sm:col-span-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-rose-200 shrink-0" />
                  <span className="truncate">حذف الخطة</span>
                </button>
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

                {/* Quick Link to Resources in Subnav */}
                <button
                  onClick={() => setIsResourcesModalOpen(true)}
                  className="px-2.5 sm:px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1.5 border border-emerald-300/80 shrink-0 transition-colors shadow-2xs"
                  title="فتح بنك المصادر والمراجع التعليمية والمناهج"
                >
                  <Layers className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>بنك المصادر ({toArabicDigits(resources.length)})</span>
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
        onGoToDashboard={() => {
          setIsPlansViewerModalOpen(false);
          setViewMode('dashboard');
        }}
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
