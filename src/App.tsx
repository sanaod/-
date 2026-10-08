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
import { ExecutivePlanEditor } from './components/ExecutivePlanEditor';
import { ensureExecutiveData } from './utils/executivePlanDefaults';
import { AbacusSimulationModal } from './components/AbacusSimulationModal';
import { AiGeneratorModal } from './components/AiGeneratorModal';
import { ExitTicketModal } from './components/ExitTicketModal';
import { ParentCardModal } from './components/ParentCardModal';
import { ResourcesManagerModal } from './components/ResourcesManagerModal';
import { ExportModal } from './components/ExportModal';
import { BackupRestoreModal } from './components/BackupRestoreModal';
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
import { QrCodeModal } from './components/QrCodeModal';
import { MotionGraphicsModal } from './components/MotionGraphicsModal';
import { EducationalAssessmentSimulatorModal } from './components/EducationalAssessmentSimulatorModal';
import { MainToolsIconHub } from './components/MainToolsIconHub';
import { MobileBottomNav } from './components/MobileBottomNav';
import { FloatingWhatsAppButton } from './components/WhatsAppContactButton';
import { toArabicDigits, formatDateDMY } from './utils/arabicNumerals';
import { analyzeContentLocally } from './utils/resourceAnalyzer';
import { formatDateToIso } from './utils/palestinianCalendar';
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
  Database,
  Upload,
  FileUp,
} from 'lucide-react';
import { SemesterPlanModal } from './components/SemesterPlanModal';
import { CurriculumPdfExtractorModal } from './components/CurriculumPdfExtractorModal';

const LOCAL_STORAGE_KEY = 'educational_expert_lesson_plans_v1';
const ACTIVE_PLAN_KEY = 'educational_expert_active_plan_id_v1';

export function sanitizePlan(p: any): LessonPlan {
  if (!p) return getBlankLessonPlan();
  const safeP = p || {};
  const header = safeP.header || {};
  const todayIso = new Date().toISOString().split('T')[0];

  const rawDate = header.startDate || header.date || todayIso;
  const sDate = rawDate && typeof rawDate === 'string' && rawDate.match(/^\d{4}-\d{2}-\d{2}$/)
    ? rawDate
    : formatDateToIso(rawDate);
  const eDate = header.endDate && typeof header.endDate === 'string' && header.endDate.match(/^\d{4}-\d{2}-\d{2}$/)
    ? header.endDate
    : sDate;

  const startFormatted = formatDateDMY(sDate);
  const endFormatted = formatDateDMY(eDate);

  const base: LessonPlan = {
    ...safeP,
    id: safeP.id || `plan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: safeP.title || header.lessonTitle || 'خطة درس معتمدة',
    templateType: safeP.templateType || 'executive', // Make executive model primary default!
    header: {
      ...header,
      country: header.country || 'دولة فلسطين',
      ministry: header.ministry || 'وزارة التربية والتعليم',
      school: header.school || '',
      directorate: header.directorate || '',
      teacherName: header.teacherName || '',
      subject: header.subject || '',
      grade: header.grade || 'الصف الثالث الأساسي',
      section: header.section || 'أ',
      lessonTitle: header.lessonTitle || '',
      totalPeriods: Number(header.totalPeriods) || 1,
      currentPeriod: Number(header.currentPeriod) || 1,
      periodDurationMinutes: Number(header.periodDurationMinutes) || 40,
      date: sDate,
      startDate: sDate,
      endDate: eDate,
      semester: header.semester || 'الفصل الدراسي الأول',
      timeframe: header.timeframe || `من (${startFormatted}) إلى (${endFormatted})`,
    },
    section1: safeP.section1 || defaultBlankPlan.section1,
    section2Timeline: Array.isArray(safeP.section2Timeline) ? safeP.section2Timeline : defaultBlankPlan.section2Timeline,
    section3Assessment: safeP.section3Assessment || defaultBlankPlan.section3Assessment,
    section4Environment: safeP.section4Environment || defaultBlankPlan.section4Environment,
    section5Reflection: safeP.section5Reflection || defaultBlankPlan.section5Reflection,
    section6Signatures: safeP.section6Signatures || defaultBlankPlan.section6Signatures,
  };

  return ensureExecutiveData(base);
}

export default function App() {
  const [plans, setPlans] = useState<LessonPlan[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = parsed.map(sanitizePlan);
          const hasBlank = sanitized.some((p) => p.id === defaultBlankPlan.id || p.id.startsWith('plan-blank'));
          const finalPlans = hasBlank ? sanitized : [sanitizePlan(defaultBlankPlan), ...sanitized];
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(finalPlans));
          } catch (e) {}
          return finalPlans;
        }
      }
    } catch (e) {
      console.error('Failed to load plans from localStorage', e);
    }
    const initialDefault = [defaultBlankPlan, ...defaultExemplarPlans].map(sanitizePlan);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialDefault));
    } catch (e) {}
    return initialDefault;
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
  const [isCurriculumPdfExtractorOpen, setIsCurriculumPdfExtractorOpen] = useState(false);
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
  const [isBackupRestoreModalOpen, setIsBackupRestoreModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isMotionGraphicsModalOpen, setIsMotionGraphicsModalOpen] = useState(false);
  const [isAssessmentSimulatorModalOpen, setIsAssessmentSimulatorModalOpen] = useState(false);
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
    <div dir="rtl" className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-['Cairo',sans-serif] text-right pb-16 md:pb-0 overflow-x-hidden">
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
        onOpenBackupRestoreModal={() => setIsBackupRestoreModalOpen(true)}
        onOpenQrModal={() => setIsQrModalOpen(true)}
        onOpenMotionGraphicsModal={() => setIsMotionGraphicsModalOpen(true)}
        onOpenAssessmentSimulatorModal={() => setIsAssessmentSimulatorModalOpen(true)}
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
            onOpenBackupRestore={() => setIsBackupRestoreModalOpen(true)}
            onOpenAssessmentSimulatorModal={() => setIsAssessmentSimulatorModalOpen(true)}
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
                      className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full object-cover shadow-2xl border-4 border-amber-300 ring-4 ring-emerald-500/40 shrink-0 bg-white transition-transform group-hover:scale-[1.03]"
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

                    {/* Stacked Quick Shortcuts Directly Below Name (أيقونات الوصول السريع المكدسة والمنظمة أسفل الاسم) */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                      <button
                        onClick={() => setIsAiModalOpen(true)}
                        className="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-400/40 text-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                        <span>تحضير بالـ AI</span>
                      </button>
                      <button
                        onClick={() => setIsUnitPlanModalOpen(true)}
                        className="px-2.5 py-1 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/40 text-blue-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                      >
                        <Boxes className="w-3.5 h-3.5 text-blue-300" />
                        <span>وحدة كاملة</span>
                      </button>
                      <button
                        onClick={() => setIsSemesterPlanModalOpen(true)}
                        className="px-2.5 py-1 bg-teal-600/30 hover:bg-teal-600/50 border border-teal-400/40 text-teal-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                      >
                        <CalendarRange className="w-3.5 h-3.5 text-teal-300" />
                        <span>الخطة الفصلية</span>
                      </button>
                      <button
                        onClick={() => setIsWorksheetModalOpen(true)}
                        className="px-2.5 py-1 bg-teal-600/30 hover:bg-teal-600/50 border border-teal-400/40 text-teal-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                      >
                        <FileCheck2 className="w-3.5 h-3.5 text-teal-300" />
                        <span>ورقة عمل AI</span>
                      </button>
                      <button
                        onClick={() => setIsAssessmentModalOpen(true)}
                        className="px-2.5 py-1 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/40 text-purple-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                      >
                        <Activity className="w-3.5 h-3.5 text-purple-300" />
                        <span>أدوات التقويم</span>
                      </button>
                      <button
                        onClick={() => setIsAuthenticTaskModalOpen(true)}
                        className="px-2.5 py-1 bg-pink-600/30 hover:bg-pink-600/50 border border-pink-400/40 text-pink-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                      >
                        <Award className="w-3.5 h-3.5 text-pink-300" />
                        <span>المهمة الأصيلة</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Direct High-Frequency Action Buttons - Stacked & Organized */}
                <div className="bg-slate-900/60 p-2 sm:p-2.5 rounded-2xl border border-emerald-500/30 flex flex-wrap items-center justify-center lg:justify-end gap-2 shrink-0 backdrop-blur-xs shadow-lg">
                  <div className="hidden sm:flex items-center gap-1.5 px-2 text-xs font-bold text-emerald-300">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>إجراءات فورية:</span>
                  </div>
                  <button
                    onClick={() => setViewMode('official-print')}
                    className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-97 cursor-pointer"
                    title="معاينة وطباعة الاستمارة الرسمية المعتمدة A4"
                  >
                    <Printer className="w-4 h-4 text-emerald-800 shrink-0" />
                    <span>طباعة PDF</span>
                  </button>

                  <button
                    onClick={() => setIsExportModalOpen(true)}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-97 cursor-pointer"
                    title="تصدير الخطة بصيغ Word و HTML و JSON"
                  >
                    <FileDown className="w-4 h-4 text-blue-200 shrink-0" />
                    <span>تصدير الخطة</span>
                  </button>

                  <button
                    onClick={() => setIsBackupRestoreModalOpen(true)}
                    className="px-3.5 py-2 bg-linear-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-97 cursor-pointer"
                    title="تصدير كافة الخطط كملف JSON موحد لأخذ نسخة احتياطية أو استيرادها في أي متصفح آخر"
                  >
                    <Database className="w-4 h-4 text-slate-950 shrink-0" />
                    <span>نسخ احتياطي (JSON)</span>
                  </button>
                </div>
              </div>

              {/* Master Unified Tools & Icons Hub (مركز الأدوات والأيقونات الموحد لكافة الأجهزة) */}
              <MainToolsIconHub
                onOpenAiModal={() => setIsAiModalOpen(true)}
                onOpenUnitPlanModal={() => setIsUnitPlanModalOpen(true)}
                onOpenSemesterPlanModal={() => setIsSemesterPlanModalOpen(true)}
                onOpenCurriculumPdfExtractor={() => setIsCurriculumPdfExtractorOpen(true)}
                onOpenWorksheetModal={() => setIsWorksheetModalOpen(true)}
                onOpenAssessmentSimulatorModal={() => setIsAssessmentSimulatorModalOpen(true)}
                onOpenAuthenticTaskModal={() => setIsAuthenticTaskModalOpen(true)}
                onOpenRubricModal={() => setIsRubricModalOpen(true)}
                onOpenExitTicketModal={() => setIsExitTicketModalOpen(true)}
                onOpenAbacusModal={() => setIsAbacusModalOpen(true)}
                onOpenResourcesModal={() => setIsResourcesModalOpen(true)}
                resourcesCount={resources.length}
                onOpenDashboard={() => setViewMode('dashboard')}
                onOpenParentCardModal={() => setIsParentCardModalOpen(true)}
                onOpenBlankModal={() => setIsBlankModalOpen(true)}
                onOpenPlansViewer={() => setIsPlansViewerModalOpen(true)}
                totalPlansCount={plans.length}
                onOpenPrintView={() => setViewMode('official-print')}
                onOpenExportModal={() => setIsExportModalOpen(true)}
                onOpenBackupRestoreModal={() => setIsBackupRestoreModalOpen(true)}
                onOpenMotionGraphicsModal={() => setIsMotionGraphicsModalOpen(true)}
                onOpenQrModal={() => setIsQrModalOpen(true)}
                onClearCurrentPlan={handleClearCurrentPlan}
                onDeleteCurrentPlan={() => handleRequestDeletePlan(currentPlan)}
              />
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
            {/* Template Model Switcher (النموذجان: الرئيسي والتكيفي) */}
            <div className="bg-white border-2 border-emerald-500/50 rounded-2xl p-3.5 sm:p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-700 to-teal-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-900 font-['Tajawal']">
                      نموذج تحضير الدرس المعتمد
                    </h3>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full font-black bg-amber-100 text-amber-900 border border-amber-300">
                      {(currentPlan.templateType || 'executive') === 'executive'
                        ? '⭐ النموذج الرئيسي (الرسمي المعتمد)'
                        : '📋 النموذج الثاني (التكيفي الموسع)'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    يمكنك التبديل بين النموذجين في أي وقت؛ بياناتك تُحفظ وتُزامن تلقائياً وبدقة عالية
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const updated = ensureExecutiveData({ ...currentPlan, templateType: 'executive' });
                    updateCurrentPlan(updated);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                    (currentPlan.templateType || 'executive') === 'executive'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200'
                  }`}
                >
                  <span className="text-amber-300">⭐</span>
                  <span>النموذج الرئيسي (خطة التنفيذ التنفيذية - SMART)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    updateCurrentPlan({ ...currentPlan, templateType: 'adaptive' });
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                    currentPlan.templateType === 'adaptive'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200'
                  }`}
                >
                  <span>📋</span>
                  <span>النموذج الثاني (التخطيط التكيفي الموسع)</span>
                </button>
              </div>
            </div>

            {/* Render Selected Template */}
            {(currentPlan.templateType || 'executive') === 'executive' ? (
              <ExecutivePlanEditor
                plan={ensureExecutiveData(currentPlan)}
                onChange={updateCurrentPlan}
                onOpenUnitPlanModal={() => setIsUnitPlanModalOpen(true)}
                onOpenResourcesModal={() => setIsResourcesModalOpen(true)}
              />
            ) : (
              <>
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

                {/* Section 5: Self Reflection, PLC Sharing & Growth Dashboard */}
                {(activeTab === 'all' || activeTab === 'sec5') && (
                  <Section5ReflectionCard
                    data={currentPlan.section5Reflection}
                    lessonHeader={currentPlan.header}
                    allPlans={plans}
                    onSelectPlan={(id) => setActivePlanId(id)}
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
              </>
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
        allPlans={plans}
        onOpenBackupRestore={() => {
          setIsExportModalOpen(false);
          setIsBackupRestoreModalOpen(true);
        }}
      />

      <BackupRestoreModal
        isOpen={isBackupRestoreModalOpen}
        onClose={() => setIsBackupRestoreModalOpen(false)}
        plans={plans}
        onPlansUpdated={(newPlans, activeId) => {
          setPlans(newPlans);
          if (activeId) {
            setActivePlanId(activeId);
          }
        }}
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
        onOpenBackupRestore={() => {
          setIsPlansViewerModalOpen(false);
          setIsBackupRestoreModalOpen(true);
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

      <CurriculumPdfExtractorModal
        isOpen={isCurriculumPdfExtractorOpen}
        onClose={() => setIsCurriculumPdfExtractorOpen(false)}
        onApplyPlan={(_extractedPlan) => {
          setIsCurriculumPdfExtractorOpen(false);
          setIsSemesterPlanModalOpen(true);
        }}
        onImportLessonsToApp={handleUnitPlansGenerated}
        currentSubject={currentPlan.header.subject}
        currentGrade={currentPlan.header.grade}
        teacherName={currentPlan.header.teacherName}
        schoolName={currentPlan.header.school}
      />

      <DeletePlanConfirmModal
        isOpen={planToDelete !== null}
        onClose={() => setPlanToDelete(null)}
        plan={planToDelete || undefined}
        onConfirmDelete={handleConfirmDelete}
        onClearFieldsInstead={handleClearCurrentPlan}
      />

      <QrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />

      <MotionGraphicsModal
        isOpen={isMotionGraphicsModalOpen}
        onClose={() => setIsMotionGraphicsModalOpen(false)}
        activePlan={currentPlan}
        savedPlans={plans}
        onSelectPlan={(id) => setActivePlanId(id)}
      />

      <EducationalAssessmentSimulatorModal
        isOpen={isAssessmentSimulatorModalOpen}
        onClose={() => setIsAssessmentSimulatorModalOpen(false)}
        plans={plans}
        activePlanId={currentPlan.id}
        onSelectPlan={(id) => setActivePlanId(id)}
      />

      {/* Mobile Sticky Quick Navigation Bar */}
      <MobileBottomNav
        currentView={viewMode}
        onChangeView={(view) => setViewMode(view)}
        onOpenToolsHub={() => {
          if (viewMode !== 'editor') {
            setViewMode('editor');
          }
          setTimeout(() => {
            const el = document.getElementById('main-tools-hub');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 100);
        }}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenAiModal={() => setIsAiModalOpen(true)}
      />

      {/* Floating WhatsApp Contact Button */}
      <FloatingWhatsAppButton />
    </div>
  );
}
