import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  BookOpen,
  Layers,
  Clock,
  Award,
  Users,
  Compass,
  FileCheck,
  ExternalLink,
  Plus,
  Trash2,
  Edit3,
  Check,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Brain,
  Zap,
} from 'lucide-react';
import { LessonPlan, EducationalResource, OerResourceItem } from '../types/lessonPlan';
import {
  SmartPedagogicalSuggestionPackage,
  PedagogicalComplianceAuditResult,
  ComplianceWarning,
  MeasurableObjectiveOption,
  CurriculumResourceTriad,
  CompleteLearningSituationSuggestion,
  DifferentiatedActivitiesSuggestion,
} from '../types/smartPedagogicalGuide';
import {
  generateInstantPedagogicalSuggestions,
  auditPlanCompliance,
} from '../utils/smartPedagogicalAdvisor';
import { toArabicDigits, toArabicPercent } from '../utils/arabicNumerals';

interface SmartPedagogicalGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: LessonPlan;
  onApplySuggestionsToPlan: (updatedPlan: LessonPlan) => void;
  onOpenPalestinianOerHub?: () => void;
  onOpenCompetenciesLibrary?: () => void;
}

export const SmartPedagogicalGuideModal: React.FC<SmartPedagogicalGuideModalProps> = ({
  isOpen,
  onClose,
  currentPlan,
  onApplySuggestionsToPlan,
  onOpenPalestinianOerHub,
  onOpenCompetenciesLibrary,
}) => {
  // Navigation tabs: 'suggestions' | 'compliance' | 'inputs'
  const [activeTab, setActiveTab] = useState<'suggestions' | 'compliance'>('suggestions');

  // Input states
  const [subject, setSubject] = useState(currentPlan.header.subject || 'الرياضيات');
  const [grade, setGrade] = useState(currentPlan.header.grade || 'الصف الرابع');
  const [lessonTitle, setLessonTitle] = useState(currentPlan.header.lessonTitle || currentPlan.title || 'الدرس النموذجي');
  const [topic, setTopic] = useState(currentPlan.header.lessonTitle || '');

  // Main Suggestions Package
  const [packageData, setPackageData] = useState<SmartPedagogicalSuggestionPackage | null>(null);

  // Compliance Audit Result
  const [auditResult, setAuditResult] = useState<PedagogicalComplianceAuditResult>(
    auditPlanCompliance(currentPlan)
  );

  // Editing State for in-place modifications
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // AI loading state
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Synchronize when opening
  useEffect(() => {
    if (isOpen) {
      const initialSub = currentPlan.header.subject || 'الرياضيات';
      const initialGrade = currentPlan.header.grade || 'الصف الرابع';
      const initialTitle = currentPlan.header.lessonTitle || currentPlan.title || 'الدرس النموذجي';

      setSubject(initialSub);
      setGrade(initialGrade);
      setLessonTitle(initialTitle);
      setTopic(initialTitle);

      const generated = generateInstantPedagogicalSuggestions({
        subject: initialSub,
        grade: initialGrade,
        lessonTitle: initialTitle,
        topic: initialTitle,
      });

      setPackageData(generated);
      setAuditResult(auditPlanCompliance(currentPlan));
    }
  }, [isOpen, currentPlan]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Re-generate suggestions based on modified inputs
  const handleRegenerateInstant = () => {
    const generated = generateInstantPedagogicalSuggestions({
      subject,
      grade,
      lessonTitle,
      topic,
    });
    setPackageData(generated);
    showToast('تم تحديث الاقتراحات التربوية فوراً وفق المنهاج الفلسطيني!');
  };

  // Deep AI enhancement via server endpoint
  const handleGenerateAiDeep = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/pedagogical-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          grade,
          lessonTitle,
          topic,
          currentPlanId: currentPlan.id,
        }),
      });

      const data = await res.json();
      if (data.success && data.suggestionPackage) {
        setPackageData(data.suggestionPackage);
        showToast('تم تعميق وتوليد الاقتراحات بواسطة المساعد الذكي مع الالتزام بالمعايير الرسمية!');
      } else {
        handleRegenerateInstant();
      }
    } catch (err) {
      console.warn('AI route unavailable, falling back to instant grounded engine:', err);
      handleRegenerateInstant();
    } finally {
      setIsAiLoading(false);
    }
  };

  // Quick Fix for Compliance Warnings
  const handleQuickFix = (warning: ComplianceWarning) => {
    if (!packageData) return;

    const basePlan = { ...currentPlan };

    if (warning.category === 'single_source') {
      // Add alternative resources from the triad
      const res1: EducationalResource = {
        id: `res-alt-fix-1-${Date.now()}`,
        title: packageData.resourcesTriad.alternativeResource1.title,
        type: 'link',
        content: packageData.resourcesTriad.alternativeResource1.url,
        sourceInfo: packageData.resourcesTriad.alternativeResource1.provider,
        createdAt: new Date().toISOString(),
        tags: ['بديل_معتمد', subject],
      };
      const res2: EducationalResource = {
        id: `res-alt-fix-2-${Date.now()}`,
        title: packageData.resourcesTriad.alternativeResource2.title,
        type: 'worksheet',
        content: packageData.resourcesTriad.alternativeResource2.url,
        sourceInfo: packageData.resourcesTriad.alternativeResource2.provider,
        createdAt: new Date().toISOString(),
        tags: ['بديل_معتمد', subject],
      };

      basePlan.attachedResources = [
        res1,
        res2,
        ...(basePlan.attachedResources || []),
      ];

      if (basePlan.oerData && basePlan.oerData.activities.length > 0) {
        basePlan.oerData.activities[0].alternativeResource1 = {
          title: packageData.resourcesTriad.alternativeResource1.title,
          type: 'video',
          directUrl: packageData.resourcesTriad.alternativeResource1.url,
          licenseType: 'ministry_elearn',
        };
        basePlan.oerData.activities[0].alternativeResource2 = {
          title: packageData.resourcesTriad.alternativeResource2.title,
          type: 'environmental',
          directUrl: packageData.resourcesTriad.alternativeResource2.url,
          licenseType: 'ministry_elearn',
        };
      }

      onApplySuggestionsToPlan(basePlan);
      setAuditResult(auditPlanCompliance(basePlan));
      showToast('تم تطبيق الإصلاح: إضافة مصدرين بديلين معتمدين من روافد ومنهاجي بنجاح!');
    } else if (warning.category === 'unlinked_competency') {
      // Link the target competencies
      basePlan.section1 = {
        ...basePlan.section1,
        integrativeCompetencies: [
          {
            title: packageData.targetCompetencies.generalCompetency.title,
            description: packageData.targetCompetencies.generalCompetency.statement,
          },
          {
            title: packageData.targetCompetencies.specificCompetency.title,
            description: packageData.targetCompetencies.specificCompetency.statement,
          },
          ...(basePlan.section1?.integrativeCompetencies || []),
        ],
      };

      if (basePlan.oerData) {
        basePlan.oerData.targetCompetencies = {
          generalCompetency: packageData.targetCompetencies.generalCompetency.title,
          specificCompetency: packageData.targetCompetencies.specificCompetency.title,
          observableIndicators: packageData.objectiveOptions.map((o) => o.performanceIndicator),
        };
      }

      onApplySuggestionsToPlan(basePlan);
      setAuditResult(auditPlanCompliance(basePlan));
      showToast('تم تطبيق الإصلاح: ربط أنشطة الدرس بكفايات المنهاج الوطني ومؤشراتها الإجرائية!');
    } else if (warning.category === 'external_source') {
      // Replace external source with official elearn resource
      const officialRes: EducationalResource = {
        id: `res-official-fix-${Date.now()}`,
        title: packageData.resourcesTriad.primaryResource.title,
        type: 'textbook',
        content: packageData.resourcesTriad.primaryResource.url,
        sourceInfo: packageData.resourcesTriad.primaryResource.provider,
        createdAt: new Date().toISOString(),
        tags: ['منهاج_فلسطيني_معتمد', subject],
      };

      basePlan.attachedResources = [officialRes];
      if (basePlan.oerData && basePlan.oerData.activities.length > 0) {
        basePlan.oerData.activities[0].primaryResource = {
          title: packageData.resourcesTriad.primaryResource.title,
          type: 'book',
          directUrl: packageData.resourcesTriad.primaryResource.url,
          licenseType: 'ministry_elearn',
        };
      }

      onApplySuggestionsToPlan(basePlan);
      setAuditResult(auditPlanCompliance(basePlan));
      showToast('تم تطبيق الإصلاح: اعتماد المرجع الرسمي من البوابة التعليمية الفلسطينية!');
    } else if (warning.category === 'unclear_assessment') {
      // Clarify assessment indicators
      const newRubric = packageData.objectiveOptions.map((obj, i) => ({
        criterion: obj.objectiveStatement,
        level1: `صعوبة في تمثيل ${obj.performanceIndicator}`,
        level2: `يحقق جزءاً من ${obj.performanceIndicator} بمساعدة المعلم`,
        level3: `يطبق ${obj.performanceIndicator} بدقة واستقلالية تامة`,
        level4: `يتميز ويبتكر في ${obj.performanceIndicator} ويفسر لزملائه`,
      }));

      basePlan.section3Assessment = {
        ...basePlan.section3Assessment,
        rubric: newRubric,
        immediateFeedback: [
          'تغذية راجعة فورية مبنية على مؤشرات الأداء السلوكية المقاسة في سلم التقدير.',
          'تعزيز الإجابات المبرهنة وتقديم بطاقات استدراك للمفاهيم غير المتقنة.',
        ],
      };

      if (basePlan.oerData) {
        basePlan.oerData.targetCompetencies.observableIndicators = packageData.objectiveOptions.map(
          (o) => o.performanceIndicator
        );
      }

      onApplySuggestionsToPlan(basePlan);
      setAuditResult(auditPlanCompliance(basePlan));
      showToast('تم تطبيق الإصلاح: صياغة مؤشرات أداء سلوكية قابلة للملاحظة وبناء سلم تقدير وصفي!');
    }
  };

  // Apply complete suggestions package to current plan
  const handleApplyFullPackageToPlan = () => {
    if (!packageData) return;

    const basePlan = { ...currentPlan };

    // 1. Update Header
    basePlan.header = {
      ...basePlan.header,
      subject,
      grade,
      lessonTitle,
    };
    basePlan.title = lessonTitle;

    // 2. Update Section 1: Integrative Competencies & Learning Resources
    basePlan.section1 = {
      ...basePlan.section1,
      integrativeCompetencies: [
        {
          title: packageData.targetCompetencies.generalCompetency.title,
          description: packageData.targetCompetencies.generalCompetency.statement,
        },
        {
          title: packageData.targetCompetencies.specificCompetency.title,
          description: packageData.targetCompetencies.specificCompetency.statement,
        },
      ],
      learningResources: {
        textbook: packageData.resourcesTriad.primaryResource.title,
        tangibleMedia: packageData.resourcesTriad.alternativeResource2.title,
        digitalReadiness: packageData.resourcesTriad.alternativeResource1.url,
      },
    };

    // 3. Update Section 3: Assessment & Differentiated remedial / enrichment
    const newRubric = packageData.objectiveOptions.map((obj) => ({
      criterion: obj.objectiveStatement,
      level1: `مبتدئ: يظهر تفاوتاً في ${obj.performanceIndicator}`,
      level2: `نامٍ: يحقق المطلوب بمساعدة أو تلميح`,
      level3: `كفء: ينجز ${obj.performanceIndicator} باستقلالية وموضوعية`,
      level4: `متميز: يتفوق ويقدم حلولاً وأدلة مبتكرة`,
    }));

    basePlan.section3Assessment = {
      ...basePlan.section3Assessment,
      rubric: newRubric,
      remedialActivities: packageData.differentiatedActivities.supportActivities.map((s) => ({
        title: s.title,
        description: `${s.description} (الاستراتيجية: ${s.strategy})`,
      })),
      enrichmentActivities: {
        title: packageData.differentiatedActivities.enrichmentActivities[0]?.title || 'تحدي المتميزين',
        puzzleOrChallenge: packageData.differentiatedActivities.enrichmentActivities[0]?.description || '',
        peerTutoring: packageData.differentiatedActivities.enrichmentActivities[1]?.description || '',
      },
    };

    // 4. Update OER Data if active
    if (basePlan.oerData) {
      basePlan.oerData.lessonInfo = {
        ...basePlan.oerData.lessonInfo,
        subject,
        grade,
        lessonTitle,
      };

      basePlan.oerData.targetCompetencies = {
        generalCompetency: packageData.targetCompetencies.generalCompetency.title,
        specificCompetency: packageData.targetCompetencies.specificCompetency.title,
        observableIndicators: packageData.objectiveOptions.map((o) => o.performanceIndicator),
      };

      // Apply the 4 steps of the learning situation into activities
      basePlan.oerData.activities = packageData.learningSituation.steps.map((step, idx) => ({
        id: `act-guide-step-${idx + 1}`,
        stageType: idx === 0 ? 'induction' : idx === 3 ? 'closure' : 'step',
        title: step.phaseName,
        allocatedTimeMinutes: step.durationMinutes,
        description: `الموقف الصفي: ${step.teacherAction}\nدور الطالب: ${step.studentAction}`,
        studentRoles: idx === 1 ? 'groups' : idx === 0 ? 'collective' : 'individual',
        studentRolesDetails: step.studentAction,
        expectedProducts: step.expectedProducts.join(' — '),
        primaryResource: {
          title: packageData.resourcesTriad.primaryResource.title,
          type: 'book',
          directUrl: packageData.resourcesTriad.primaryResource.url,
          licenseType: 'ministry_elearn',
        },
        alternativeResource1: {
          title: packageData.resourcesTriad.alternativeResource1.title,
          type: 'video',
          directUrl: packageData.resourcesTriad.alternativeResource1.url,
          licenseType: 'ministry_elearn',
        },
        alternativeResource2: {
          title: packageData.resourcesTriad.alternativeResource2.title,
          type: 'environmental',
          directUrl: packageData.resourcesTriad.alternativeResource2.url,
          licenseType: 'ministry_elearn',
        },
        formativeAssessment: `ملاحظة أداء الطالب وتقييم منتج: ${step.expectedProducts[0] || 'النشاط'}`,
        productAssessment: step.expectedProducts[0] || 'سلم تقدير الخطوة',
      }));
    }

    // 5. Attach Resources Triad
    const r1: EducationalResource = {
      id: `res-guide-1-${Date.now()}`,
      title: packageData.resourcesTriad.primaryResource.title,
      type: 'textbook',
      content: packageData.resourcesTriad.primaryResource.url,
      sourceInfo: packageData.resourcesTriad.primaryResource.provider,
      createdAt: new Date().toISOString(),
      tags: ['أساسي', subject],
    };
    const r2: EducationalResource = {
      id: `res-guide-2-${Date.now()}`,
      title: packageData.resourcesTriad.alternativeResource1.title,
      type: 'link',
      content: packageData.resourcesTriad.alternativeResource1.url,
      sourceInfo: packageData.resourcesTriad.alternativeResource1.provider,
      createdAt: new Date().toISOString(),
      tags: ['بديل_تفاعلي', subject],
    };
    const r3: EducationalResource = {
      id: `res-guide-3-${Date.now()}`,
      title: packageData.resourcesTriad.alternativeResource2.title,
      type: 'worksheet',
      content: packageData.resourcesTriad.alternativeResource2.url,
      sourceInfo: packageData.resourcesTriad.alternativeResource2.provider,
      createdAt: new Date().toISOString(),
      tags: ['بديل_ورقي', subject],
    };

    basePlan.attachedResources = [r1, r2, r3, ...(basePlan.attachedResources || [])];

    onApplySuggestionsToPlan(basePlan);
    setAuditResult(auditPlanCompliance(basePlan));
    showToast('تم تطبيق الحزمة التربوية المتكاملة بنجاح في خطة الدرس! 🎯🇵🇸');

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-6xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* ========================================================= */}
        {/* Modal Header */}
        {/* ========================================================= */}
        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-emerald-950 px-5 py-4 border-b border-amber-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner">
              <Lightbulb className="w-6 h-6 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  مرشد عبقور التربوي الذكي
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                    دليلٌ استرشادي وليس حاكماً 🇵🇸
                  </span>
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                مقترحات فورية ملتزمة حصراً بالمنهاج الفلسطيني الرسمي ومصادر التعليم المفتوحة OER مع حرية كاملة للتعديل والإضافة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 flex items-center justify-between animate-in slide-in-from-top shrink-0">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {notification}
            </span>
            <button type="button" onClick={() => setNotification(null)}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* Lesson Context Inputs Bar */}
        {/* ========================================================= */}
        <div className="bg-slate-850 px-5 py-3 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 flex-1 min-w-[280px]">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-0.5">المبحث الدراسي:</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="الرياضيات"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-0.5">الصف الدراسي:</label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="الصف الرابع"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 mb-0.5">عنوان الدرس وموضوعه:</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="مثال: القيمة المنزلية ضمن الملايين وتطبيقاتها الحياتية"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={handleRegenerateInstant}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1 shrink-0 transition-all cursor-pointer shadow-sm"
                  title="تحديث الاقتراحات فوراً"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>تحديث</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="bg-slate-900 px-5 py-2 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('suggestions')}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'suggestions'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              الاقتراحات التربوية الفورية (5 محاور)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('compliance')}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'compliance'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              وحدة «فحص التوافق» والمعايير الوزارية
              {auditResult.warnings.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-mono">
                  {toArabicDigits(auditResult.warnings.length)} تنبيهات
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGenerateAiDeep}
              disabled={isAiLoading}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin' : ''}`} />
              <span>{isAiLoading ? 'جاري التوليد...' : 'توليد ذكي متقدم (AI)'}</span>
            </button>

            <button
              type="button"
              onClick={handleApplyFullPackageToPlan}
              className="px-4 py-1.5 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <Check className="w-4 h-4" />
              <span>تطبيق الحزمة كاملة في خطتي</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* Main Content Area */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: SMART SUGGESTIONS (5 REQUIRED DIMENSIONS) */}
          {activeTab === 'suggestions' && packageData && (
            <div className="space-y-6">
              {/* Guidance Philosophy Banner */}
              <div className="bg-amber-950/30 border border-amber-600/40 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-amber-200/90">
                <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-black text-amber-300 block mb-0.5">
                    فلسفة «مرشد عبقور»: دليلٌ استشاري يُلهم المعلم ولا يُلزمه
                  </span>
                  جميع الاقتراحات أدناه مستقاة مباشرة من إطار الكفايات الوطني الفلسطيني ومصادر OER المعتمدة. يحق لك كمعلم تعديل أي بند، حذفه، إضافة بديل، أو دمجه بحرية تامة في خطتك.
                </div>
              </div>

              {/* 1. الكفايات المستهدفة من المنهاج */}
              <div className="bg-slate-850 rounded-2xl p-5 border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sm text-emerald-400 flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400" />
                    ١. الكفايات المستهدفة من المنهاج الفلسطيني الرسمي
                  </h4>
                  {onOpenCompetenciesLibrary && (
                    <button
                      type="button"
                      onClick={onOpenCompetenciesLibrary}
                      className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <span>تصفح مكتبة الكفايات الكاملة</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* General Competency */}
                  <div className="bg-slate-900/90 rounded-xl p-3.5 border border-purple-800/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-800/60 text-[10px] font-bold">
                        كفاية عامة: {packageData.targetCompetencies.generalCompetency.domainLabel}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {packageData.targetCompetencies.generalCompetency.code}
                      </span>
                    </div>
                    <h5 className="font-bold text-xs text-white">
                      {packageData.targetCompetencies.generalCompetency.title}
                    </h5>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {packageData.targetCompetencies.generalCompetency.statement}
                    </p>
                  </div>

                  {/* Subject-Specific Competency */}
                  <div className="bg-slate-900/90 rounded-xl p-3.5 border border-teal-800/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-teal-950 text-teal-300 border border-teal-800/60 text-[10px] font-bold">
                        كفاية تخصصية: مبحث {packageData.targetCompetencies.specificCompetency.subject}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {packageData.targetCompetencies.specificCompetency.code}
                      </span>
                    </div>
                    <h5 className="font-bold text-xs text-white">
                      {packageData.targetCompetencies.specificCompetency.title}
                    </h5>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {packageData.targetCompetencies.specificCompetency.statement}
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. 3 خيارات لأهداف ومؤشرات قابلة للتعديل */}
              <div className="bg-slate-850 rounded-2xl p-5 border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="font-black text-sm text-amber-400 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-amber-400" />
                    ٢. ثلاثة خيارات لأهداف ومؤشرات أداء قابلة للتعديل والحذف
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    يمكنك تعديل أي صياغة مباشرة بالنقر على مربع النص
                  </span>
                </div>

                <div className="space-y-3">
                  {packageData.objectiveOptions.map((opt, idx) => (
                    <div
                      key={opt.id}
                      className="bg-slate-900 rounded-xl p-3.5 border border-slate-700/70 space-y-2 hover:border-amber-400/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-800/60 text-[10px] font-bold">
                          الخيار {toArabicDigits(idx + 1)}: {opt.typeLabel}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400">
                            طريقة التقويم: {opt.suggestedAssessmentMethod}
                          </span>
                        </div>
                      </div>

                      {/* Editable Objective Statement */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-0.5">
                          صياغة الهدف السلوكي:
                        </label>
                        <input
                          type="text"
                          value={opt.objectiveStatement}
                          onChange={(e) => {
                            const updated = [...packageData.objectiveOptions];
                            updated[idx].objectiveStatement = e.target.value;
                            setPackageData({ ...packageData, objectiveOptions: updated });
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-amber-400"
                        />
                      </div>

                      {/* Editable Performance Indicator */}
                      <div>
                        <label className="block text-[10px] font-bold text-emerald-400 mb-0.5">
                          مؤشر الأداء القابل للملاحظة والقياس (Observable Indicator):
                        </label>
                        <input
                          type="text"
                          value={opt.performanceIndicator}
                          onChange={(e) => {
                            const updated = [...packageData.objectiveOptions];
                            updated[idx].performanceIndicator = e.target.value;
                            setPackageData({ ...packageData, objectiveOptions: updated });
                          }}
                          className="w-full bg-slate-950 border border-emerald-900/60 rounded-lg px-2.5 py-1.5 text-xs text-emerald-300 focus:outline-hidden focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. ثلاثي المصادر: مصدر رئيسي + مصدرين بديلين */}
              <div className="bg-slate-850 rounded-2xl p-5 border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sm text-blue-400 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-400" />
                    ٣. ثلاثي المصادر التعليمية المعتمدة (رئيسي + مصدران بديلان)
                  </h4>
                  {onOpenPalestinianOerHub && (
                    <button
                      type="button"
                      onClick={onOpenPalestinianOerHub}
                      className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <span>فتح مستكشف OER الفلسطيني</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Primary Resource */}
                  <div className="bg-slate-900 rounded-xl p-3.5 border-2 border-emerald-500/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-md text-[10px] font-black">
                        المصدر الرئيسي المعتمد
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold">الأولوية ١</span>
                    </div>
                    <h5 className="font-bold text-xs text-white">
                      {packageData.resourcesTriad.primaryResource.title}
                    </h5>
                    <p className="text-[10px] text-slate-400">
                      الجهة: {packageData.resourcesTriad.primaryResource.provider}
                    </p>
                    <p className="text-[11px] text-slate-300">
                      {packageData.resourcesTriad.primaryResource.pedagogicalNotes}
                    </p>
                    <a
                      href={packageData.resourcesTriad.primaryResource.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:underline pt-1"
                    >
                      <span>فتح الرابط المباشر</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Alternative 1 */}
                  <div className="bg-slate-900 rounded-xl p-3.5 border border-teal-500/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-teal-950 text-teal-300 border border-teal-800 rounded-md text-[10px] font-bold">
                        مصدر بديل رقم ١ (تفاعلي/رقمي)
                      </span>
                    </div>
                    <h5 className="font-bold text-xs text-white">
                      {packageData.resourcesTriad.alternativeResource1.title}
                    </h5>
                    <p className="text-[10px] text-slate-400">
                      الجهة: {packageData.resourcesTriad.alternativeResource1.provider}
                    </p>
                    <p className="text-[11px] text-slate-300">
                      {packageData.resourcesTriad.alternativeResource1.pedagogicalNotes}
                    </p>
                    <a
                      href={packageData.resourcesTriad.alternativeResource1.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-teal-400 hover:underline pt-1"
                    >
                      <span>فتح المنصة</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Alternative 2 */}
                  <div className="bg-slate-900 rounded-xl p-3.5 border border-amber-500/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 rounded-md text-[10px] font-bold">
                        مصدر بديل رقم ٢ (ملموس/ورقي)
                      </span>
                    </div>
                    <h5 className="font-bold text-xs text-white">
                      {packageData.resourcesTriad.alternativeResource2.title}
                    </h5>
                    <p className="text-[10px] text-slate-400">
                      الجهة: {packageData.resourcesTriad.alternativeResource2.provider}
                    </p>
                    <p className="text-[11px] text-slate-300">
                      {packageData.resourcesTriad.alternativeResource2.pedagogicalNotes}
                    </p>
                    <a
                      href={packageData.resourcesTriad.alternativeResource2.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:underline pt-1"
                    >
                      <span>فتح أوراق العمل</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* 4. موقف تعليمي كامل: خطوات — أنشطة — منتجات — زمن مقترح */}
              <div className="bg-slate-850 rounded-2xl p-5 border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sm text-purple-400 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    ٤. موقف تعليمي صفي متكامل (خطوات — أنشطة — منتجات — زمن مقترح)
                  </h4>
                  <span className="px-2.5 py-1 bg-purple-950 text-purple-300 rounded-full text-xs font-bold font-mono">
                    الزمن الكلي: {toArabicDigits(packageData.learningSituation.totalDurationMinutes)} دقيقة
                  </span>
                </div>

                <div className="p-3 bg-purple-950/20 border border-purple-900/40 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-purple-200 block">
                    {packageData.learningSituation.title}
                  </span>
                  <p className="text-slate-300 text-[11px]">
                    {packageData.learningSituation.contextDescription}
                  </p>
                  <p className="text-[11px] text-emerald-300 font-medium">
                    السياق الفلسطيني: {packageData.learningSituation.authenticPalestineContext}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {packageData.learningSituation.steps.map((st) => (
                    <div
                      key={st.stepNumber}
                      className="bg-slate-900 rounded-xl p-3 border border-slate-700 text-xs space-y-2 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-black text-amber-400 text-xs">
                            الخطوة {toArabicDigits(st.stepNumber)}
                          </span>
                          <span className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] font-mono text-slate-300">
                            {toArabicDigits(st.durationMinutes)} د
                          </span>
                        </div>
                        <h6 className="font-bold text-slate-200 mb-1">{st.phaseName}</h6>
                        <div className="text-[11px] text-slate-300 space-y-1">
                          <p><strong className="text-slate-400">دور المعلم:</strong> {st.teacherAction}</p>
                          <p><strong className="text-slate-400">دور الطالب:</strong> {st.studentAction}</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800 text-[10px] text-emerald-400 font-bold">
                        منتج التعلم: {st.expectedProducts.join('، ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. أنشطة دعم للمتعثرين + أنشطة إثراء للمتميزين */}
              <div className="bg-slate-850 rounded-2xl p-5 border border-slate-700/80 space-y-3">
                <h4 className="font-black text-sm text-teal-400 flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-400" />
                  ٥. تمايز التعليم: أنشطة دعم للمتعثرين وأنشطة إثراء للمتميزين
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Support Activities */}
                  <div className="bg-slate-900 rounded-xl p-4 border border-rose-900/40 space-y-2">
                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold block w-fit">
                      أنشطة دعم وتيسير (للطلبة الذين يحتاجون مساعدة)
                    </span>
                    <div className="space-y-2">
                      {packageData.differentiatedActivities.supportActivities.map((sup) => (
                        <div key={sup.id} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                          <span className="font-bold text-rose-200 block mb-0.5">{sup.title}</span>
                          <p className="text-[11px] text-slate-300 leading-relaxed">{sup.description}</p>
                          <span className="text-[10px] text-slate-400 block mt-1">الاستراتيجية: {sup.strategy}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Enrichment Activities */}
                  <div className="bg-slate-900 rounded-xl p-4 border border-amber-900/40 space-y-2">
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold block w-fit">
                      أنشطة إثراء وتحدٍ (للطلبة المتميزين والموهوبين)
                    </span>
                    <div className="space-y-2">
                      {packageData.differentiatedActivities.enrichmentActivities.map((enr) => (
                        <div key={enr.id} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                          <span className="font-bold text-amber-200 block mb-0.5">{enr.title}</span>
                          <p className="text-[11px] text-slate-300 leading-relaxed">{enr.description}</p>
                          <span className="text-[10px] text-slate-400 block mt-1">نوع التحدي: {enr.challengeType}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMPLIANCE AUDIT ENGINE */}
          {activeTab === 'compliance' && (
            <div className="space-y-6">
              {/* Compliance Score Header */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-3xl p-5 border border-slate-700/80 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <h4 className="font-black text-base text-white">
                        تقرير وحدة فحص التوافق والمعايير الوزارية
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      فحص آلي وفوري لخطة الدرس الحالية وفق محددات المنهاج الفلسطيني ومعايير التعليم المفتوح OER
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-left sm:text-right">
                      <span className="text-3xl font-black font-mono text-emerald-400">
                        {toArabicPercent(auditResult.overallScore)}
                      </span>
                      <div className="text-[11px] font-bold text-slate-300">
                        {auditResult.statusLabel}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden border border-slate-700">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      auditResult.overallScore >= 85
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        : auditResult.overallScore >= 60
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                        : 'bg-gradient-to-r from-rose-500 to-red-600'
                    }`}
                    style={{ width: `${auditResult.overallScore}%` }}
                  />
                </div>
              </div>

              {/* Warnings List */}
              <div className="space-y-3.5">
                <h5 className="font-black text-sm text-slate-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  ملاحظات وتنبيهات فحص التوافق ({toArabicDigits(auditResult.warnings.length)})
                </h5>

                {auditResult.warnings.length === 0 ? (
                  <div className="bg-emerald-950/40 border border-emerald-700/60 rounded-2xl p-6 text-center space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                    <h5 className="font-black text-sm text-emerald-200">
                      خطة الدرس متوافقة بنسبة 100% مع جميع المعايير الوزارية!
                    </h5>
                    <p className="text-xs text-slate-300">
                      تم استيفاء معايير تعدد المصادر، ربط الكفايات، اعتماد المنهاج، ووضوح مؤشرات التقويم بدقة متناهية.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {auditResult.warnings.map((w) => (
                      <div
                        key={w.id}
                        className={`rounded-2xl p-4 border transition-all ${
                          w.severity === 'danger'
                            ? 'bg-rose-950/20 border-rose-800/60'
                            : 'bg-amber-950/20 border-amber-800/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  w.severity === 'danger'
                                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                                }`}
                              >
                                {w.category === 'single_source'
                                  ? 'تنبيه: الاعتماد على مصدر واحد'
                                  : w.category === 'unlinked_competency'
                                  ? 'تنبيه: عدم ربط النشاط بكفاية'
                                  : w.category === 'external_source'
                                  ? 'تنبيه: مصدر خارج المنهاج'
                                  : 'تنبيه: عدم وضوح مؤشرات التقويم'}
                              </span>
                              <h5 className="font-black text-xs text-white">{w.title}</h5>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed">
                              {w.message}
                            </p>

                            <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] space-y-1 mt-2">
                              <span className="font-bold text-amber-300 block">
                                المسوغ التربوي والمعيار الوزاري:
                              </span>
                              <p className="text-slate-400">{w.pedagogicalRationale}</p>
                              <div className="pt-1 text-emerald-400 font-bold">
                                الحل المقترح: {w.suggestedFix}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0">
                            <button
                              type="button"
                              onClick={() => handleQuickFix(w)}
                              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                            >
                              <Zap className="w-3.5 h-3.5" />
                              <span>إصلاح تلقائي فوري ⚡</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Passed Checks */}
              {auditResult.passedChecks.length > 0 && (
                <div className="bg-slate-850 rounded-2xl p-4 border border-slate-700/70 space-y-2.5">
                  <h5 className="font-black text-xs text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    المعايير التي اجتازتها الخطة بنجاح ({toArabicDigits(auditResult.passedChecks.length)})
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {auditResult.passedChecks.map((p) => (
                      <div key={p.id} className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                        <span className="font-bold text-slate-200 block">{p.title}</span>
                        <span className="text-[10px] text-slate-400">{p.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* Modal Footer Actions */}
        {/* ========================================================= */}
        <div className="bg-slate-900 px-5 py-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              نظام «عبقور» الذكي — يلتزم حصراً بالمناهج ومصادر OER الفلسطينية المعتمدة
            </span>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'suggestions' && packageData && (
              <button
                type="button"
                onClick={handleApplyFullPackageToPlan}
                className="px-4 py-2 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
              >
                <Check className="w-4 h-4" />
                تطبيق الاقتراحات في خطتي
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              إغلاق النافذة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
