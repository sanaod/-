/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LessonPlan, EducationalResource } from './types/lessonPlan';
import { defaultExemplarPlans, palestineMathGrade3Plan, abqourEnglishHabitatsPlan } from './data/exemplarPlans';
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
import { OerLessonPlanEditor } from './components/OerLessonPlanEditor';
import { ensureExecutiveData } from './utils/executivePlanDefaults';
import { ensureOerData } from './data/oerPalestinianCurriculum';
import { AbqourIntegrationToolModal } from './components/AbqourIntegrationToolModal';
import { AbacusSimulationModal } from './components/AbacusSimulationModal';
import { AiGeneratorModal } from './components/AiGeneratorModal';
import { ExitTicketModal } from './components/ExitTicketModal';
import { ParentCardModal } from './components/ParentCardModal';
import { ResourcesManagerModal } from './components/ResourcesManagerModal';
import { PalestinianOerHubModal } from './components/PalestinianOerHubModal';
import { PalestinianCompetenciesLibraryModal } from './components/PalestinianCompetenciesLibraryModal';
import { SmartPedagogicalGuideModal } from './components/SmartPedagogicalGuideModal';
import { OerReportsCenterModal } from './components/OerReportsCenterModal';
import { AbqoorHomeDashboard } from './components/AbqoorHomeDashboard';
import { UserRole } from './types/roleDashboards';
import {
  ObservablePerformanceIndicator,
  SuggestedLearningSituation,
  SuggestedResourceLink,
} from './types/palestinianCompetencies';
import { PalestinianOerItem } from './types/palestinianOer';
import { OerResourceItem } from './types/lessonPlan';
import { ExportModal } from './components/ExportModal';
import { BackupRestoreModal } from './components/BackupRestoreModal';
import { TeacherDashboard } from './components/TeacherDashboard';
import { BlankTemplateModal } from './components/BlankTemplateModal';
import { CreativeCommonsFooter } from './components/CreativeCommonsFooter';
import { PlansViewerModal } from './components/PlansViewerModal';
import { ArchivePlansModal } from './components/ArchivePlansModal';
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
  X,
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
  Share2,
  Pin,
} from 'lucide-react';
import { PinnedSectionsDock } from './components/PinnedSectionsDock';
import { SemesterPlanModal } from './components/SemesterPlanModal';
import { CurriculumPdfExtractorModal } from './components/CurriculumPdfExtractorModal';
import { AcademicYearMilestonesModal } from './components/AcademicYearMilestonesModal';
import { AndroidAppModal } from './components/AndroidAppModal';
import { AppDownloadFloatingBanner } from './components/AppDownloadFloatingBanner';
import { SharePlanModal, FloatingShareButton } from './components/SharePlanModal';

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
          const sanitized = parsed
            .map(sanitizePlan)
            .filter((p) => p.id !== abqourEnglishHabitatsPlan.id);
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
      if (savedId && savedId !== abqourEnglishHabitatsPlan.id) return savedId;
    } catch (e) {}
    return defaultBlankPlan.id;
  });

  const [viewMode, setViewMode] = useState<'editor' | 'official-print' | 'dashboard'>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('teacher');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('abqoor_is_authenticated_v1') === 'true';
    } catch (e) {
      return true;
    }
  });
  const [currentUsername, setCurrentUsername] = useState<string>(() => {
    try {
      return localStorage.getItem('abqoor_username_v1') || 'أ. أحمد المعلم';
    } catch (e) {
      return 'أ. أحمد المعلم';
    }
  });
  const [activeTab, setActiveTab] = useState<string>('all');
  const [actionCategoryFilter, setActionCategoryFilter] = useState<'all' | 'ai' | 'resources' | 'plans' | 'export'>('all');

  // Pinned Sections Feature State (تثبيت الأقسام لتظل مرئية أثناء التمرير)
  const [pinnedSections, setPinnedSections] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('abqoor_pinned_sections_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    // Default: Pin section 1 for the executive model (smart goals and general context)
    return ['sec-exec-1'];
  });

  const handleTogglePinSection = (sectionId: string) => {
    setPinnedSections((prev) => {
      const next = prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId];
      try {
        localStorage.setItem('abqoor_pinned_sections_v1', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const handleClearAllPins = () => {
    setPinnedSections([]);
    try {
      localStorage.removeItem('abqoor_pinned_sections_v1');
    } catch (e) {}
  };

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
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isBackupRestoreModalOpen, setIsBackupRestoreModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isMotionGraphicsModalOpen, setIsMotionGraphicsModalOpen] = useState(false);
  const [isAssessmentSimulatorModalOpen, setIsAssessmentSimulatorModalOpen] = useState(false);
  const [isAcademicMilestonesModalOpen, setIsAcademicMilestonesModalOpen] = useState(false);
  const [isAndroidAppModalOpen, setIsAndroidAppModalOpen] = useState(false);
  const [isPlansViewerModalOpen, setIsPlansViewerModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<LessonPlan | null>(null);
  const [selectedResourceForPlanning, setSelectedResourceForPlanning] = useState<EducationalResource | null>(null);
  const [resourceLinkNotice, setResourceLinkNotice] = useState<string | null>(null);
  const [isPalestinianOerHubOpen, setIsPalestinianOerHubOpen] = useState(false);
  const [isCompetenciesModalOpen, setIsCompetenciesModalOpen] = useState(false);
  const [isSmartGuideModalOpen, setIsSmartGuideModalOpen] = useState(false);
  const [isReportsCenterOpen, setIsReportsCenterOpen] = useState(false);
  const [isIntegrationToolModalOpen, setIsIntegrationToolModalOpen] = useState(false);
  const [reportsCenterDefaultTab, setReportsCenterDefaultTab] = useState<
    'official_lesson_plan' | 'student_competencies_record' | 'school_oer_statistics'
  >('official_lesson_plan');

  const handleApplyIntegratedPlan = (newPlan: LessonPlan) => {
    setPlans((prev) => [newPlan, ...prev]);
    setActivePlanId(newPlan.id);
    setViewMode('editor');
    setResourceLinkNotice(`تم استيراد وتفعيل خطة درس «${newPlan.header.lessonTitle}» وربطها بنجاح مع مصادر OER! 🐍⚡`);
    setTimeout(() => setResourceLinkNotice(null), 5000);
  };

  const handleUpdatePlanReview = (planId: string, directives: string, status: 'approved' | 'needs_revision') => {
    setPlans((prev) =>
      prev.map((p) => {
        if (p.id === planId) {
          return {
            ...p,
            section6Signatures: {
              ...p.section6Signatures,
              educationalSupervisor: {
                name: 'د. إياد كمال طهبوب (مشرف المرحلة الأساسية)',
                date: formatDateDMY(new Date().toISOString()),
                directives: directives || p.section6Signatures?.educationalSupervisor?.directives || '',
              },
            },
          };
        }
        return p;
      })
    );
  };

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

  const handleAddCustomResource = (resource: EducationalResource, linkToCurrentPlan?: boolean) => {
    setResources((prev) => [resource, ...prev]);
    if (linkToCurrentPlan) {
      handleApplyResourceToCurrentPlan(resource);
    }
  };

  const handleApplyResourceToCurrentPlan = (resource: EducationalResource) => {
    const meta = resource.inferredLessonTitle
      ? {
          subject: resource.inferredSubject || currentPlan.header.subject,
          grade: resource.inferredGrade || currentPlan.header.grade,
          lessonTitle: resource.inferredLessonTitle,
        }
      : analyzeContentLocally(resource.content, resource.fileName, resource.fileExt);

    // Target specific learningResources field based on resource type
    const currentRes = { ...currentPlan.section1.learningResources };
    if (resource.type === 'textbook' || resource.type === 'curriculum_guide') {
      currentRes.textbook = resource.sourceInfo || resource.title;
    } else if (resource.type === 'worksheet' || resource.type === 'image' || resource.type === 'document') {
      currentRes.tangibleMedia = currentRes.tangibleMedia
        ? `${currentRes.tangibleMedia}، ${resource.title}`
        : resource.title;
    } else {
      currentRes.digitalReadiness = resource.content.startsWith('http') ? resource.content : resource.title;
    }

    // Automatically synchronize with executive plan stages (Stage 1 is the primary educational resource)
    const basePlanWithExec: any = ensureExecutiveData(currentPlan);
    const updatedExec: any = {
      ...(basePlanWithExec.executiveData || {}),
      executiveStages: (basePlanWithExec.executiveData?.executiveStages || []).map((stage: any, idx: number) => {
        if (idx === 0) {
          return {
            ...stage,
            procedures: {
              ...stage.procedures,
              resourceName: resource.title,
            },
            resourcesAndTools: resource.title,
          };
        }
        return stage;
      }),
    };

    const isPlanEmptyOrPlaceholder =
      !currentPlan.header.lessonTitle ||
      currentPlan.id.startsWith('plan-blank') ||
      currentPlan.title.includes('مفرغة') ||
      currentPlan.title.includes('مفرغ');

    const updatedPlan: LessonPlan = {
      ...currentPlan,
      title: isPlanEmptyOrPlaceholder
        ? (meta.lessonTitle || resource.title)
        : currentPlan.title,
      header: {
        ...currentPlan.header,
        lessonTitle: isPlanEmptyOrPlaceholder ? (meta.lessonTitle || resource.title) : currentPlan.header.lessonTitle,
        subject: meta.subject || currentPlan.header.subject,
        grade: meta.grade || currentPlan.header.grade,
      },
      section1: {
        ...currentPlan.section1,
        learningResources: currentRes,
      },
      executiveData: updatedExec,
      attachedResources: [
        resource,
        ...(currentPlan.attachedResources || []).filter((r) => r.id !== resource.id),
      ],
    };

    updateCurrentPlan(updatedPlan);
    setResourceLinkNotice(`تم تغيير المصدر المعتمد تلقائياً إلى: «${resource.title}» ورُبط بتحضير الدرس بنجاح! 🔗`);
    setTimeout(() => setResourceLinkNotice(null), 4500);
    setViewMode('editor');
  };

  const handleApplyPalestinianOerResource = (
    oerItem: PalestinianOerItem,
    targetType: 'as_primary' | 'as_induction' | 'as_step' | 'as_alternative' = 'as_primary'
  ) => {
    const resType =
      oerItem.type === 'book' || oerItem.type === 'teacher_guide'
        ? 'book'
        : oerItem.type === 'video'
        ? 'video'
        : oerItem.type === 'visual_card'
        ? 'image'
        : 'link';

    const oerResItem: OerResourceItem = {
      title: `${oerItem.title} - (${oerItem.publisherNameAr})`,
      type: resType,
      directUrl: oerItem.directUrl,
      licenseType: oerItem.publisher === 'elearn_edu_ps' ? 'ministry_elearn' : 'creative_commons',
      notes: `مصدر معتمد رسمياً: ${oerItem.publisherNameAr}. ${oerItem.suggestedUseInLesson || ''}`,
    };

    const asEduRes: EducationalResource = {
      id: `oer-${oerItem.id}-${Date.now()}`,
      type: oerItem.type === 'book' || oerItem.type === 'teacher_guide' ? 'textbook' : oerItem.type === 'video' ? 'video' : oerItem.type === 'worksheet' ? 'worksheet' : 'link',
      title: oerItem.title,
      content: oerItem.directUrl,
      sourceInfo: `${oerItem.publisherNameAr} • ${oerItem.officialBadge.text}`,
      createdAt: formatDateDMY(new Date().toISOString()),
      tags: [oerItem.subject, oerItem.grade, oerItem.topic, oerItem.publisher],
      inferredSubject: oerItem.subject,
      inferredGrade: oerItem.grade,
      inferredLessonTitle: oerItem.topic,
    };

    const isPlanEmpty = !currentPlan.header.lessonTitle || currentPlan.id.startsWith('plan-blank');
    const basePlan = ensureOerData(currentPlan);
    const currentOerData = { ...basePlan.oerData! };

    if (targetType === 'as_induction') {
      const indIdx = currentOerData.activities.findIndex((a) => a.stageType === 'induction');
      if (indIdx >= 0) {
        currentOerData.activities[indIdx].primaryResource = oerResItem;
      }
    } else if (targetType === 'as_step') {
      const stepIdx = currentOerData.activities.findIndex((a) => a.stageType === 'step');
      if (stepIdx >= 0) {
        currentOerData.activities[stepIdx].primaryResource = oerResItem;
      }
    } else if (targetType === 'as_alternative') {
      if (currentOerData.activities.length > 0) {
        currentOerData.activities[0].alternativeResource1 = oerResItem;
      }
    } else {
      if (currentOerData.activities.length > 0) {
        currentOerData.activities[0].primaryResource = oerResItem;
      }
    }

    if (isPlanEmpty) {
      currentOerData.lessonInfo.subject = oerItem.subject;
      currentOerData.lessonInfo.grade = oerItem.grade;
      currentOerData.lessonInfo.lessonTitle = oerItem.topic;
      currentOerData.lessonInfo.unitTitle = oerItem.unitTitle || currentOerData.lessonInfo.unitTitle;
    }

    const updatedPlan: LessonPlan = {
      ...basePlan,
      title: isPlanEmpty ? oerItem.topic : basePlan.title,
      header: {
        ...basePlan.header,
        subject: isPlanEmpty ? oerItem.subject : basePlan.header.subject,
        grade: isPlanEmpty ? oerItem.grade : basePlan.header.grade,
        lessonTitle: isPlanEmpty ? oerItem.topic : basePlan.header.lessonTitle,
      },
      section1: {
        ...basePlan.section1,
        learningResources: {
          ...basePlan.section1.learningResources,
          textbook: oerItem.title,
          digitalReadiness: oerItem.directUrl,
        },
      },
      oerData: currentOerData,
      attachedResources: [asEduRes, ...(basePlan.attachedResources || []).filter((r) => r.id !== asEduRes.id)],
    };

    updateCurrentPlan(updatedPlan);
    setResources((prev) => [asEduRes, ...prev.filter((r) => r.title !== asEduRes.title)]);
    setResourceLinkNotice(`تم ربط المصدر المعتمد «${oerItem.title}» بخطة درسك بنجاح! 🇵🇸🔗`);
    setTimeout(() => setResourceLinkNotice(null), 4500);
    setViewMode('editor');
  };

  const handleApplyCompetenciesToPlan = (appliedData: {
    competencies: { title: string; description: string }[];
    indicators: ObservablePerformanceIndicator[];
    learningSituations: SuggestedLearningSituation[];
    suggestedResources: SuggestedResourceLink[];
  }) => {
    const basePlan = ensureOerData(currentPlan);
    const existing = basePlan.section1.integrativeCompetencies || [];
    const existingTitles = new Set(existing.map((c) => c.title.toLowerCase()));
    const newComps = appliedData.competencies.filter((c) => !existingTitles.has(c.title.toLowerCase()));
    const updatedIntegrative = [...existing, ...newComps];

    const updatedPlan: LessonPlan = {
      ...basePlan,
      section1: {
        ...basePlan.section1,
        integrativeCompetencies: updatedIntegrative,
      },
    };

    if (updatedPlan.oerData) {
      const indicatorsStatements = appliedData.indicators.map((ind) => ind.statement);
      const existingIndicators = updatedPlan.oerData.targetCompetencies?.observableIndicators || [];
      const newUniqueIndicators = indicatorsStatements.filter((stmt) => !existingIndicators.includes(stmt));

      updatedPlan.oerData = {
        ...updatedPlan.oerData,
        targetCompetencies: {
          generalCompetency: appliedData.competencies[0]?.title || updatedPlan.oerData.targetCompetencies?.generalCompetency || '',
          specificCompetency: appliedData.competencies[1]?.title || appliedData.competencies[0]?.title || updatedPlan.oerData.targetCompetencies?.specificCompetency || '',
          observableIndicators: [...existingIndicators, ...newUniqueIndicators],
        },
      };

      if (appliedData.learningSituations && appliedData.learningSituations.length > 0) {
        const oerActivities = [...updatedPlan.oerData.activities];
        if (oerActivities.length > 0) {
          appliedData.learningSituations.forEach((sit) => {
            if (!oerActivities[0].description.includes(sit.title)) {
              oerActivities[0].description = `${oerActivities[0].description}\n• موقف تعليمي كفائي (${sit.title}): ${sit.contextDescription}`;
            }
          });
          updatedPlan.oerData.activities = oerActivities;
        }
      }
    }

    updateCurrentPlan(updatedPlan);

    if (appliedData.suggestedResources && appliedData.suggestedResources.length > 0) {
      setResources((prev) => {
        const existingUrls = new Set(prev.map((r) => r.content));
        const toAdd: EducationalResource[] = appliedData.suggestedResources
          .filter((sr) => !existingUrls.has(sr.url))
          .map((sr) => ({
            id: `res-comp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            title: sr.title,
            type: sr.type === 'video' ? 'video' : sr.type === 'worksheet' ? 'worksheet' : sr.type === 'simulation' || sr.type === 'interactive' ? 'link' : 'textbook',
            sourceInfo: `${sr.providerLabel} • كفاية معتمدة من الوزارة`,
            content: sr.url,
            createdAt: formatDateDMY(new Date().toISOString()),
            tags: ['كفايات_وزارية', currentPlan.header.subject || 'عام'],
            inferredSubject: currentPlan.header.subject,
            inferredGrade: currentPlan.header.grade,
          }));
        return [...toAdd, ...prev];
      });
    }

    setResourceLinkNotice(`تم إدراج ${toArabicDigits(appliedData.competencies.length)} كفايات ومؤشرات أدائها في خطتك بنجاح! 🎯🇵🇸`);
    setTimeout(() => setResourceLinkNotice(null), 4500);
    setViewMode('editor');
  };

  const handlePlanGenerated = (newPlan: LessonPlan) => {
    const withOer = ensureOerData(ensureExecutiveData(newPlan));
    setPlans((prev) => [withOer, ...prev]);
    setActivePlanId(withOer.id);
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

  const handleToggleArchivePlan = (planId: string) => {
    setPlans((prev) => {
      const updated = prev.map((p) => (p.id === planId ? { ...p, isArchived: !p.isArchived } : p));
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
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

  const handleDuplicatePlan = (planIdToDuplicate: string) => {
    const targetPlan = plans.find((p) => p.id === planIdToDuplicate);
    if (!targetPlan) return;
    const duplicated: LessonPlan = {
      ...targetPlan,
      id: `plan-dup-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: `${targetPlan.title || targetPlan.header?.lessonTitle || 'خطة'} (نسخة مطابقة)`,
      header: {
        ...targetPlan.header,
        lessonTitle: `${targetPlan.header?.lessonTitle || 'الدرس'} (نسخة مطابقة)`,
        date: formatDateDMY(new Date().toISOString()),
      },
    };
    setPlans((prev) => {
      const updated = [duplicated, ...prev];
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  if (viewMode === 'official-print') {
    return (
      <OfficialPrintView
        plan={currentPlan}
        onBack={() => setViewMode('editor')}
        onOpenShareModal={() => setIsShareModalOpen(true)}
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

  // Ensure all tabs and sections are fully rendered during print browser action
  useEffect(() => {
    let prevTab = activeTab;
    const handleBeforePrint = () => {
      prevTab = activeTab;
      setActiveTab('all');
    };
    const handleAfterPrint = () => {
      setActiveTab(prevTab);
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [activeTab]);

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
        onOpenIntegrationToolModal={() => setIsIntegrationToolModalOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
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
        onOpenAcademicMilestonesModal={() => setIsAcademicMilestonesModalOpen(true)}
        onOpenAndroidAppModal={() => setIsAndroidAppModalOpen(true)}
        onOpenPalestinianOerHub={() => setIsPalestinianOerHubOpen(true)}
        onOpenCompetenciesModal={() => setIsCompetenciesModalOpen(true)}
        onOpenSmartGuideModal={() => setIsSmartGuideModalOpen(true)}
        currentUser={currentUsername}
        onLogout={() => {
          setIsAuthenticated(false);
          try {
            localStorage.removeItem('abqoor_is_authenticated_v1');
          } catch (e) {}
        }}
      />

      {viewMode === 'dashboard' ? (
        <AbqoorHomeDashboard
          plans={plans}
          resources={resources}
          activePlanId={currentPlan.id}
          onSelectPlan={(id) => {
            setActivePlanId(id);
            setViewMode('editor');
          }}
          onOpenEditor={() => setViewMode('editor')}
          onOpenAiGenerator={() => setIsAiModalOpen(true)}
          onOpenUnitPlanModal={() => setIsUnitPlanModalOpen(true)}
          onOpenSemesterPlanModal={() => setIsSemesterPlanModalOpen(true)}
          onOpenWorksheetModal={() => setIsWorksheetModalOpen(true)}
          onOpenAssessmentModal={() => setIsAssessmentModalOpen(true)}
          onOpenAuthenticTaskModal={() => setIsAuthenticTaskModalOpen(true)}
          onOpenRubricModal={() => setIsRubricModalOpen(true)}
          onOpenPrintView={() => setViewMode('official-print')}
          onOpenResourcesModal={() => setIsResourcesModalOpen(true)}
          onOpenExportModal={() => setIsExportModalOpen(true)}
          onOpenIntegrationToolModal={() => setIsIntegrationToolModalOpen(true)}
          onOpenShareModal={() => setIsShareModalOpen(true)}
          onOpenBlankTemplateModal={() => setIsBlankModalOpen(true)}
          onNewBlankPlan={handleCreateNewBlankPlan}
          onDeletePlan={handleDeletePlan}
          onDuplicatePlan={handleDuplicatePlan}
          onOpenPalestinianOerHub={() => setIsPalestinianOerHubOpen(true)}
          onOpenCompetenciesModal={() => setIsCompetenciesModalOpen(true)}
          onOpenSmartGuideModal={() => setIsSmartGuideModalOpen(true)}
          onOpenReportsCenter={(tab) => {
            if (tab) setReportsCenterDefaultTab(tab as any);
            setIsReportsCenterOpen(true);
          }}
          onOpenAbacusModal={() => setIsAbacusModalOpen(true)}
          onOpenBackupRestore={() => setIsBackupRestoreModalOpen(true)}
          onOpenAssessmentSimulatorModal={() => setIsAssessmentSimulatorModalOpen(true)}
          onOpenAcademicMilestonesModal={() => setIsAcademicMilestonesModalOpen(true)}
          onOpenAndroidAppModal={() => setIsAndroidAppModalOpen(true)}
          currentRole={currentRole}
          onChangeRole={(role) => setCurrentRole(role)}
          onToggleArchivePlan={handleToggleArchivePlan}
          onOpenArchiveModal={() => setIsArchiveModalOpen(true)}
          currentUser={currentUsername}
          onUpdateUsername={(name) => {
            setCurrentUsername(name);
            try {
              localStorage.setItem('abqoor_username_v1', name);
            } catch (e) {}
          }}
          onOpenExitTicketModal={() => setIsExitTicketModalOpen(true)}
          onOpenParentCardModal={() => setIsParentCardModalOpen(true)}
          onOpenCurriculumPdfExtractor={() => setIsCurriculumPdfExtractorOpen(true)}
          onOpenPlansViewer={() => setIsPlansViewerModalOpen(true)}
        />
      ) : (
        <>
          {/* Sub-nav Category Tabs */}
          <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-2xs no-print">
            <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between overflow-x-auto py-2 sm:py-2.5 scrollbar-none touch-pan-x gap-2">
                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                  {currentPlan.templateType === 'adaptive' ? (
                    navSections.map((item) => {
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
                    })
                  ) : (currentPlan.templateType || 'oer') === 'oer' ? (
                    <div className="flex items-center gap-2 text-xs font-black text-emerald-950">
                      <span className="bg-emerald-100 border border-emerald-400 px-3 py-1 rounded-xl flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>دليل OER الفلسطيني (الصفوف ١-٤) • معتمد عبر elearn.edu.ps</span>
                      </span>
                      <span className="hidden md:inline-flex text-[11px] text-slate-600 font-semibold">
                        هيكل خماسي: بيانات الدرس ← الكفايات المستهدفة ← الموقف التعليمي ومصادر OER ← التقويم الشامل ← بدائل وملاحظات
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-black text-emerald-950">
                      <span className="bg-slate-100 border border-slate-300 px-3 py-1 rounded-xl flex items-center gap-1.5">
                        <span>📋 النموذج التنفيذي (SMART) • ٥ مراحل لتنفيذ الدرس</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Subnav Action Hub */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (pinnedSections.length === 0) {
                        const targetId = (currentPlan.templateType || 'executive') === 'executive' ? 'sec-exec-1' : 'sec-adapt-header';
                        handleTogglePinSection(targetId);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 border transition-all cursor-pointer ${
                      pinnedSections.length > 0
                        ? 'bg-amber-100/90 text-amber-950 border-amber-400 shadow-2xs hover:bg-amber-200'
                        : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    <Pin className={`w-3.5 h-3.5 ${pinnedSections.length > 0 ? 'rotate-45 fill-amber-500 text-amber-700' : 'text-slate-500'}`} />
                    <span>الأقسام المثبتة</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      pinnedSections.length > 0
                        ? 'bg-amber-400 text-slate-950 shadow-2xs'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {toArabicDigits(pinnedSections.length)}
                    </span>
                  </button>

                  <button
                    onClick={() => setIsResourcesModalOpen(true)}
                    className="px-3.5 py-1.5 bg-linear-to-r from-emerald-100 to-teal-50 hover:from-emerald-200 hover:to-teal-100 text-emerald-950 rounded-xl text-xs font-black flex items-center gap-2 border-2 border-emerald-500/80 shrink-0 transition-all shadow-xs hover:shadow-sm hover:scale-[1.02] cursor-pointer ring-1 ring-emerald-500/20"
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
          </div>

          {/* Main Content Body */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 lesson-editor-root print-friendly-lesson-editor">
            {/* Automatic Source Link Toast Notice */}
            {resourceLinkNotice && (
              <div
                dir="rtl"
                className="bg-emerald-950 text-emerald-100 p-3 sm:p-3.5 rounded-2xl border-2 border-emerald-400 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300 no-print"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-emerald-500 text-emerald-950 rounded-xl font-black shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-amber-300 block">
                      الربط التلقائي بين تحضير الدرس وبنك المصادر:
                    </span>
                    <span className="text-xs font-bold text-white">{resourceLinkNotice}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsResourcesModalOpen(true)}
                    className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    عرض بنك المصادر ({toArabicDigits(resources.length)}) 📚
                  </button>
                  <button
                    type="button"
                    onClick={() => setResourceLinkNotice(null)}
                    className="p-1 text-emerald-300 hover:text-white rounded-lg hover:bg-emerald-900/80 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Template Model Switcher */}
            <div className="bg-white border-2 border-emerald-500/50 rounded-2xl p-3.5 sm:p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
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
                      {(currentPlan.templateType || 'oer') === 'oer'
                        ? '⭐ نموذج دليل مصادر التعلم المفتوحة OER (الصفوف ١-٤)'
                        : currentPlan.templateType === 'executive'
                        ? '📋 النموذج التنفيذي (خطة التنفيذ SMART)'
                        : '📑 النموذج الثاني (التكيفي الموسع)'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    النموذج الافتراضي متوافق كلياً مع دليل المعلم الفلسطيني لمصادر التعليم المفتوحة OER ومعتمد عبر elearn.edu.ps
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 p-1.5 bg-slate-100 rounded-2xl shrink-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const updated = ensureOerData({ ...currentPlan, templateType: 'oer' });
                      updateCurrentPlan(updated);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                      (currentPlan.templateType || 'oer') === 'oer'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200'
                    }`}
                  >
                    <span className="text-amber-300">⭐</span>
                    <span>نموذج دليل OER (الصفوف ١–٤ المعتمد)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const updated = ensureExecutiveData({ ...currentPlan, templateType: 'executive' });
                      updateCurrentPlan(updated);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                      currentPlan.templateType === 'executive'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200'
                    }`}
                  >
                    <span>📋</span>
                    <span>النموذج التنفيذي (SMART)</span>
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
                    <span>📑</span>
                    <span>النموذج التكيفي الموسع</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsAiModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 bg-linear-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-xs transition-all cursor-pointer border border-amber-300 group"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-slate-950 group-hover:rotate-12 transition-transform" />
                    <span>توليد التحضير (AI)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-xs transition-all cursor-pointer border border-emerald-400/30 group"
                  >
                    <Share2 className="w-3.5 h-3.5 text-emerald-200 group-hover:scale-110 transition-transform" />
                    <span>مشاركة الخطة 📱</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-all cursor-pointer border border-slate-700 group"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-300 group-hover:scale-110 transition-transform" />
                    <span>طباعة المحرر (Print-Friendly) 🖨️</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Render Selected Template */}
            {(currentPlan.templateType || 'oer') === 'oer' ? (
              <OerLessonPlanEditor
                plan={ensureOerData(currentPlan)}
                onChange={updateCurrentPlan}
                onOpenUnitPlanModal={() => setIsUnitPlanModalOpen(true)}
                onOpenResourcesModal={() => setIsResourcesModalOpen(true)}
                resourcesCount={resources.length}
                resources={resources}
                onApplyResource={handleApplyResourceToCurrentPlan}
                onOpenAiModal={() => setIsAiModalOpen(true)}
                onOpenShareModal={() => setIsShareModalOpen(true)}
                onOpenPalestinianOerHub={() => setIsPalestinianOerHubOpen(true)}
                onOpenCompetenciesModal={() => setIsCompetenciesModalOpen(true)}
                onOpenSmartGuideModal={() => setIsSmartGuideModalOpen(true)}
                onAddResource={handleAddCustomResource}
              />
            ) : currentPlan.templateType === 'executive' ? (
              <ExecutivePlanEditor
                plan={ensureExecutiveData(currentPlan)}
                onChange={updateCurrentPlan}
                onOpenUnitPlanModal={() => setIsUnitPlanModalOpen(true)}
                onOpenResourcesModal={() => setIsResourcesModalOpen(true)}
                resourcesCount={resources.length}
                resources={resources}
                onApplyResource={handleApplyResourceToCurrentPlan}
                onOpenAiModal={() => setIsAiModalOpen(true)}
                onOpenShareModal={() => setIsShareModalOpen(true)}
                pinnedSections={pinnedSections}
                onTogglePinSection={handleTogglePinSection}
              />
            ) : (
              <>
                <LessonHeaderCard
                  header={currentPlan.header}
                  onChange={(header) => updateCurrentPlan({ ...currentPlan, header })}
                  onOpenUnitPlanModal={() => setIsUnitPlanModalOpen(true)}
                  onOpenSemesterPlanModal={() => setIsSemesterPlanModalOpen(true)}
                  onOpenResourcesModal={() => setIsResourcesModalOpen(true)}
                  onOpenAiModal={() => setIsAiModalOpen(true)}
                  onOpenShareModal={() => setIsShareModalOpen(true)}
                  resourcesCount={resources.length}
                  resources={resources}
                  attachedResources={currentPlan.attachedResources}
                  onApplyResource={handleApplyResourceToCurrentPlan}
                  isPinned={pinnedSections.includes('sec-adapt-header')}
                  onTogglePin={() => handleTogglePinSection('sec-adapt-header')}
                  sectionId="sec-adapt-header"
                />

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
                    onOpenCompetenciesModal={() => setIsCompetenciesModalOpen(true)}
                    isPinned={pinnedSections.includes('sec-adapt-1')}
                    onTogglePin={() => handleTogglePinSection('sec-adapt-1')}
                    sectionId="sec-adapt-1"
                  />
                )}

                {(activeTab === 'all' || activeTab === 'sec2') && (
                  <Section2TimelineCard
                    timeline={currentPlan.section2Timeline}
                    totalMinutes={currentPlan.header.periodDurationMinutes}
                    onOpenAbacusModal={() => setIsAbacusModalOpen(true)}
                    onOpenExitTicketModal={() => setIsExitTicketModalOpen(true)}
                    onOpenWorksheetModal={() => setIsWorksheetModalOpen(true)}
                    onChange={(section2Timeline) => updateCurrentPlan({ ...currentPlan, section2Timeline })}
                    plan={currentPlan}
                    isPinned={pinnedSections.includes('sec-adapt-2')}
                    onTogglePin={() => handleTogglePinSection('sec-adapt-2')}
                    sectionId="sec-adapt-2"
                  />
                )}

                {(activeTab === 'all' || activeTab === 'sec3') && (
                  <Section3AssessmentCard
                    data={currentPlan.section3Assessment}
                    onChange={(section3Assessment) => updateCurrentPlan({ ...currentPlan, section3Assessment })}
                    onOpenWorksheetModal={() => setIsWorksheetModalOpen(true)}
                    onOpenAssessmentModal={() => setIsAssessmentModalOpen(true)}
                    onOpenAuthenticTaskModal={() => setIsAuthenticTaskModalOpen(true)}
                    onOpenRubricModal={() => setIsRubricModalOpen(true)}
                    isPinned={pinnedSections.includes('sec-adapt-3')}
                    onTogglePin={() => handleTogglePinSection('sec-adapt-3')}
                    sectionId="sec-adapt-3"
                  />
                )}

                {(activeTab === 'all' || activeTab === 'sec4') && (
                  <Section4EnvironmentCard
                    data={currentPlan.section4Environment}
                    onOpenParentCardModal={() => setIsParentCardModalOpen(true)}
                    onChange={(section4Environment) => updateCurrentPlan({ ...currentPlan, section4Environment })}
                    isPinned={pinnedSections.includes('sec-adapt-4')}
                    onTogglePin={() => handleTogglePinSection('sec-adapt-4')}
                    sectionId="sec-adapt-4"
                  />
                )}

                {(activeTab === 'all' || activeTab === 'sec5') && (
                  <Section5ReflectionCard
                    data={currentPlan.section5Reflection}
                    lessonHeader={currentPlan.header}
                    allPlans={plans}
                    onSelectPlan={(id) => setActivePlanId(id)}
                    onChange={(section5Reflection) => updateCurrentPlan({ ...currentPlan, section5Reflection })}
                    isPinned={pinnedSections.includes('sec-adapt-5')}
                    onTogglePin={() => handleTogglePinSection('sec-adapt-5')}
                    sectionId="sec-adapt-5"
                  />
                )}

                {(activeTab === 'all' || activeTab === 'sec6') && (
                  <Section6SignaturesCard
                    data={currentPlan.section6Signatures}
                    onChange={(section6Signatures) => updateCurrentPlan({ ...currentPlan, section6Signatures })}
                    isPinned={pinnedSections.includes('sec-adapt-6')}
                    onTogglePin={() => handleTogglePinSection('sec-adapt-6')}
                    sectionId="sec-adapt-6"
                  />
                )}
              </>
            )}

            {/* Comprehensive System Tools Hub (مركز الأدوات الـ ٢٣ المتكامل) */}
            <div id="main-tools-hub" className="pt-6 border-t border-slate-200/80 no-print">
              <MainToolsIconHub
                onOpenAiModal={() => setIsAiModalOpen(true)}
                onOpenUnitPlanModal={() => setIsUnitPlanModalOpen(true)}
                onOpenSemesterPlanModal={() => setIsSemesterPlanModalOpen(true)}
                onOpenAcademicMilestonesModal={() => setIsAcademicMilestonesModalOpen(true)}
                onOpenAndroidAppModal={() => setIsAndroidAppModalOpen(true)}
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
                onOpenIntegrationToolModal={() => setIsIntegrationToolModalOpen(true)}
                onOpenShareModal={() => setIsShareModalOpen(true)}
                onOpenBackupRestoreModal={() => setIsBackupRestoreModalOpen(true)}
                onOpenMotionGraphicsModal={() => setIsMotionGraphicsModalOpen(true)}
                onOpenQrModal={() => setIsQrModalOpen(true)}
                onClearCurrentPlan={handleCreateNewBlankPlan}
                onDeleteCurrentPlan={() => handleRequestDeletePlan(currentPlan)}
              />
            </div>
          </main>
        </>
      )}

      {/* Pinned Sections Persistent Dock (تثبيت الأقسام مرئية دائماً أمام المعلم أثناء التمرير لأسفل) */}
      {viewMode === 'editor' && (
        <PinnedSectionsDock
          plan={currentPlan}
          pinnedSectionIds={pinnedSections}
          onTogglePin={handleTogglePinSection}
          onClearAllPins={handleClearAllPins}
        />
      )}

      {/* Footer & Creative Commons License */}
      <CreativeCommonsFooter />

      {/* Modals */}
      {isAiModalOpen && (
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
      )}

      {isUnitPlanModalOpen && (
        <UnitPlanGeneratorModal
          isOpen={isUnitPlanModalOpen}
          onClose={() => setIsUnitPlanModalOpen(false)}
          onPlansGenerated={handleUnitPlansGenerated}
          defaultTeacherName={currentPlan.header.teacherName}
          defaultSchool={currentPlan.header.school}
          defaultDirectorate={currentPlan.header.directorate}
          defaultSubject={currentPlan.header.subject}
          defaultGrade={currentPlan.header.grade}
          resources={resources}
          onOpenResourcesModal={() => setIsResourcesModalOpen(true)}
        />
      )}

      {isResourcesModalOpen && (
        <ResourcesManagerModal
          isOpen={isResourcesModalOpen}
          onClose={() => setIsResourcesModalOpen(false)}
          resources={resources}
          onAddResource={(newRes) => {
            setResources((prev) => [newRes, ...prev]);
            setSelectedResourceForPlanning(newRes);
            handleApplyResourceToCurrentPlan(newRes);
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
          onOpenPalestinianOerHub={() => setIsPalestinianOerHubOpen(true)}
        />
      )}

      {/* Palestinian OER Direct Integration Hub & Personal Library */}
      {isPalestinianOerHubOpen && (
        <PalestinianOerHubModal
          isOpen={isPalestinianOerHubOpen}
          onClose={() => setIsPalestinianOerHubOpen(false)}
          currentPlan={currentPlan}
          onApplyOerResourceToPlan={handleApplyPalestinianOerResource}
        />
      )}

      {/* Palestinian National Competencies Library & Semester Progress Tracker */}
      {isCompetenciesModalOpen && (
        <PalestinianCompetenciesLibraryModal
          isOpen={isCompetenciesModalOpen}
          onClose={() => setIsCompetenciesModalOpen(false)}
          currentPlan={currentPlan}
          allPlans={plans}
          onApplyCompetenciesToPlan={handleApplyCompetenciesToPlan}
          onSelectCompetencyToNewPlan={(compTitle) => {
            const fresh = getBlankLessonPlan();
            fresh.header.lessonTitle = `درس حول كفاية: ${compTitle}`;
            fresh.header.subject = currentPlan.header.subject;
            fresh.header.grade = currentPlan.header.grade;
            fresh.title = `درس: ${compTitle}`;
            const withOer = ensureOerData(fresh);
            setPlans((prev) => [withOer, ...prev]);
            setActivePlanId(withOer.id);
            setViewMode('editor');
          }}
        />
      )}

      {/* Smart Pedagogical Guide & Compliance Audit Unit (مرشد عبقور التربوي الذكي ووحدة فحص التوافق) */}
      <SmartPedagogicalGuideModal
        isOpen={isSmartGuideModalOpen}
        onClose={() => setIsSmartGuideModalOpen(false)}
        currentPlan={currentPlan}
        onApplySuggestionsToPlan={(updatedPlan) => {
          updateCurrentPlan(updatedPlan);
          setResourceLinkNotice('تم تطبيق توجيهات واقتراحات المرشد التربوي الذكي وفحص التوافق بنجاح! 💡🇵🇸');
          setTimeout(() => setResourceLinkNotice(null), 4500);
          setViewMode('editor');
        }}
        onOpenPalestinianOerHub={() => {
          setIsSmartGuideModalOpen(false);
          setIsPalestinianOerHubOpen(true);
        }}
        onOpenCompetenciesLibrary={() => {
          setIsSmartGuideModalOpen(false);
          setIsCompetenciesModalOpen(true);
        }}
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
        onOpenShareModal={() => {
          setIsExportModalOpen(false);
          setIsShareModalOpen(true);
        }}
        onOpenIntegrationToolModal={() => {
          setIsExportModalOpen(false);
          setIsIntegrationToolModalOpen(true);
        }}
        allPlans={plans}
        onOpenBackupRestore={() => {
          setIsExportModalOpen(false);
          setIsBackupRestoreModalOpen(true);
        }}
      />

      {/* Share Lesson Plan Modal (Web Share API & Messaging Apps) */}
      <SharePlanModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        plan={currentPlan}
      />

      <BackupRestoreModal
        isOpen={isBackupRestoreModalOpen}
        onClose={() => setIsBackupRestoreModalOpen(false)}
        plans={plans}
        resources={resources}
        onPlansUpdated={(newPlans, activeId, newResources) => {
          setPlans(newPlans);
          if (activeId) {
            setActivePlanId(activeId);
          }
          if (newResources && newResources.length > 0) {
            setResources(newResources);
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
        onOpenIntegrationToolModal={() => setIsIntegrationToolModalOpen(true)}
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
        onOpenShareModal={(planId) => {
          setIsPlansViewerModalOpen(false);
          if (planId) setActivePlanId(planId);
          setIsShareModalOpen(true);
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
        onOpenIntegrationToolModal={() => {
          setIsPlansViewerModalOpen(false);
          setIsIntegrationToolModalOpen(true);
        }}
        onAddAbqourPlan={() => {
          handleApplyIntegratedPlan(abqourEnglishHabitatsPlan);
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

      <ArchivePlansModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        plans={plans}
        onToggleArchive={handleToggleArchivePlan}
        onDeletePlan={handleDeletePlan}
        onSelectPlan={(id) => setActivePlanId(id)}
        onOpenEditor={() => setViewMode('editor')}
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

      <AcademicYearMilestonesModal
        isOpen={isAcademicMilestonesModalOpen}
        onClose={() => setIsAcademicMilestonesModalOpen(false)}
        onOpenSemesterPlanModal={() => setIsSemesterPlanModalOpen(true)}
        onOpenDashboard={() => setViewMode('dashboard')}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenPrintView={() => setViewMode('official-print')}
      />

      <AndroidAppModal
        isOpen={isAndroidAppModalOpen}
        onClose={() => setIsAndroidAppModalOpen(false)}
        onOpenQrModal={() => setIsQrModalOpen(true)}
      />

      {/* Abqour Lesson Plan Integration Tool Modal (Python & OER Direct Linker) */}
      <AbqourIntegrationToolModal
        isOpen={isIntegrationToolModalOpen}
        onClose={() => setIsIntegrationToolModalOpen(false)}
        currentPlan={currentPlan}
        onApplyPlan={handleApplyIntegratedPlan}
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
        onOpenResourcesModal={() => setIsResourcesModalOpen(true)}
        resourcesCount={resources.length}
      />

      {/* Floating WhatsApp Contact Button */}
      <FloatingWhatsAppButton />

      {/* Floating Quick Share Button (Web Share API) */}
      <FloatingShareButton onClick={() => setIsShareModalOpen(true)} />

      {/* Floating App Download Banner */}
      <AppDownloadFloatingBanner
        onOpenAndroidAppModal={() => setIsAndroidAppModalOpen(true)}
      />
    </div>
  );
}
