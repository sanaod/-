import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Sparkles,
  Loader2,
  BookOpen,
  GraduationCap,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
  Plus,
  Wand2,
  Calendar,
  Layers3,
  RotateCcw,
  Home,
  ArrowRight,
  ArrowLeft,
  FileEdit,
  FolderOpen,
  Target,
  Award,
  Trash2,
  Edit3,
  Save,
  Search,
  Check,
  Heart,
  Brain,
  Wrench,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  CheckSquare,
  FileText,
} from 'lucide-react';
import {
  EducationalResource,
  LessonPlan,
  STANDARD_GRADES,
} from '../types/lessonPlan';
import { toArabicDigits } from '../utils/arabicNumerals';
import { ensureExecutiveData, createDefaultExecutiveData } from '../utils/executivePlanDefaults';
import { EducationalStagePickerModal } from './EducationalStagePickerModal';
import { INITIAL_PALESTINIAN_COMPETENCIES } from '../data/palestinianCompetenciesRegistry';
import { CompetencyItem } from '../types/palestinianCompetencies';

interface AiGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanGenerated: (plan: LessonPlan) => void;
  resources: EducationalResource[];
  onOpenResourcesModal: () => void;
  selectedResourceForPlanning?: EducationalResource | null;
}

// Session storage keys to maintain state safely across wizard navigation
export const STEP1_SESSION_KEY = 'abqoor_wizard_step1_session_v1';
export const STEP2_SESSION_KEY = 'abqoor_wizard_step2_session_v1';
export const STEP3_SESSION_KEY = 'abqoor_wizard_step3_session_v1';

export type ObjectiveDomain = 'cognitive' | 'skill' | 'affective';

export interface LessonObjective {
  id: string;
  text: string;
  domain: ObjectiveDomain;
}

export interface ChosenCompetency {
  id: string;
  code: string;
  title: string;
  statement?: string;
  domainLabel: string;
  category: 'general' | 'subject_specific' | 'custom';
  isCustom?: boolean;
}

export type AssessmentType = 'diagnostic' | 'formative' | 'summative' | 'self_peer';

export interface AssessmentToolItem {
  id: string;
  name: string;
  type: AssessmentType;
  linkedObjectiveId?: string;
  instructions: string;
  questionsOrIndicators: string;
  expectedAnswerOrCriteria: string;
  durationMinutes: number;
  recordingMethod: string;
  toolCategory: 'checklist' | 'rating_scale' | 'verbal_rubric' | 'observation' | 'qa' | 'grasps' | 'descriptive_rubric';
}

export interface LessonAssignment {
  homework: string;
  appliedTask: string;
  studentInstructions: string;
  requiredResources: string;
  expectedDurationMinutes: number;
  evaluationCriteria: string;
}

export const AiGeneratorModal: React.FC<AiGeneratorModalProps> = ({
  isOpen,
  onClose,
  onPlanGenerated,
  resources,
  onOpenResourcesModal,
  selectedResourceForPlanning,
}) => {
  // Wizard current step:
  // 1 = Basic Lesson Info
  // 2 = Objectives & Competencies
  // 3 = Assessment & Evaluation Tools & Assignments
  // 4 = Final Review & Generation
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);

  // =========================================================================
  // STEP 1 STATE: The 7 Required Basic Info Fields
  // =========================================================================
  const [grade, setGrade] = useState('الصف الثالث الأساسي');
  const [subject, setSubject] = useState('الرياضيات');
  const [semester, setSemester] = useState('الفصل الدراسي الأول');
  const [unitTitle, setUnitTitle] = useState('الوحدة الأولى: الأعداد ضمن ٩٩٩٩');
  const [lessonTitle, setLessonTitle] = useState('القيمة المنزلية للأعداد ضمن ٩٩٩٩');
  const [currentPeriod, setCurrentPeriod] = useState<number>(1);
  const [periodDurationMinutes, setPeriodDurationMinutes] = useState<number>(40);

  // Additional School / Context Fields
  const [totalPeriods, setTotalPeriods] = useState<number>(2);
  const [country, setCountry] = useState('دولة فلسطين');
  const [ministry, setMinistry] = useState('وزارة التربية والتعليم العالي');
  const [school, setSchool] = useState('مدرسة المعري الأساسية للبنين');
  const [directorate, setDirectorate] = useState('مديرية نابلس');
  const [teacherName, setTeacherName] = useState('أ. أحمد المعلم');
  const [selectedTemplateType, setSelectedTemplateType] = useState<'executive' | 'adaptive'>('executive');
  const [customNotes, setCustomNotes] = useState(
    'التركيز على استقصاء علمي وتجارب حسية واستخدام استراتيجيات التعلم النشط ومهمة تقويم أصيل GRASPS وسلالم التقدير والربط بالبيئة المحلية الفلسطينية.'
  );

  // UI / State helpers
  const [activeResource, setActiveResource] = useState<EducationalResource | null>(null);
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // =========================================================================
  // STEP 2 STATE: Objectives (الأهداف التعليمية) & Competencies (الكفايات)
  // =========================================================================
  const [objectives, setObjectives] = useState<LessonObjective[]>([]);
  const [selectedCompetencies, setSelectedCompetencies] = useState<ChosenCompetency[]>([]);

  // Objectives form state
  const [newObjectiveText, setNewObjectiveText] = useState('');
  const [newObjectiveDomain, setNewObjectiveDomain] = useState<ObjectiveDomain>('cognitive');
  const [editingObjectiveId, setEditingObjectiveId] = useState<string | null>(null);
  const [editingObjectiveText, setEditingObjectiveText] = useState('');
  const [editingObjectiveDomain, setEditingObjectiveDomain] = useState<ObjectiveDomain>('cognitive');
  const [objectivesFilterTab, setObjectivesFilterTab] = useState<'all' | ObjectiveDomain>('all');

  // Competencies form state & selector
  const [competenciesSearchQuery, setCompetenciesSearchQuery] = useState('');
  const [competenciesCategoryFilter, setCompetenciesCategoryFilter] = useState<'all' | 'subject_specific' | 'general'>('all');
  const [isCustomCompetencyFormOpen, setIsCustomCompetencyFormOpen] = useState(false);
  const [customCompetencyTitle, setCustomCompetencyTitle] = useState('');
  const [customCompetencyDomain, setCustomCompetencyDomain] = useState('كفاية تخصصية خاصة بالمبحث');
  const [customCompetencyStatement, setCustomCompetencyStatement] = useState('');
  const [isCompetencyPickerExpanded, setIsCompetencyPickerExpanded] = useState(false);

  // =========================================================================
  // STEP 3 STATE: Assessment Tools (التقويم التربوي وأدوات التقييم) & Assignments
  // =========================================================================
  const [assessmentTools, setAssessmentTools] = useState<AssessmentToolItem[]>([]);
  const [assignment, setAssignment] = useState<LessonAssignment>({
    homework: 'حل التدريبات رقم (١، ٣، ٥) من صفحة الكتاب المدرسي المرتبطة بالدرس.',
    appliedTask: 'تصميم بطاقة أو ملصق بسيط في البيت يوضح تطبيقات الدرس في الحياة اليومية الفلسطينية.',
    studentInstructions: 'اقرأ السؤال بتمعن، واستخدم الأدوات الهندسية أو الأرقام بدقة، ثم اعرض عملك على زملائك.',
    requiredResources: 'الكتاب المدرسي، الدفتر، الأقلام الملونة، مسطرة.',
    expectedDurationMinutes: 15,
    evaluationCriteria: 'الدقة في الحل، نظافة التنظيم، الالتزام بالوقت، ووضوح الخطوات.',
  });

  // New Assessment Tool Form state
  const [isNewAssessmentFormOpen, setIsNewAssessmentFormOpen] = useState(false);
  const [newToolName, setNewToolName] = useState('');
  const [newToolType, setNewToolType] = useState<AssessmentType>('formative');
  const [newToolLinkedObjId, setNewToolLinkedObjId] = useState('');
  const [newToolInstructions, setNewToolInstructions] = useState('');
  const [newToolQuestions, setNewToolQuestions] = useState('');
  const [newToolCriteria, setNewToolCriteria] = useState('');
  const [newToolDuration, setNewToolDuration] = useState<number>(10);
  const [newToolRecordingMethod, setNewToolRecordingMethod] = useState('قائمة رصد تقديرية / سلم تقدير');
  const [newToolCategory, setNewToolCategory] = useState<AssessmentToolItem['toolCategory']>('checklist');
  const [assessmentFilterTab, setAssessmentFilterTab] = useState<'all' | AssessmentType>('all');

  // =========================================================================
  // Session Storage Persistence
  // =========================================================================
  useEffect(() => {
    if (!isOpen) return;

    // Load Step 1 session
    try {
      const savedStep1 = sessionStorage.getItem(STEP1_SESSION_KEY);
      if (savedStep1) {
        const parsed = JSON.parse(savedStep1);
        if (parsed.grade) setGrade(parsed.grade);
        if (parsed.subject) setSubject(parsed.subject);
        if (parsed.semester) setSemester(parsed.semester);
        if (parsed.unitTitle) setUnitTitle(parsed.unitTitle);
        if (parsed.lessonTitle) setLessonTitle(parsed.lessonTitle);
        if (parsed.currentPeriod !== undefined) setCurrentPeriod(Number(parsed.currentPeriod));
        if (parsed.periodDurationMinutes !== undefined) setPeriodDurationMinutes(Number(parsed.periodDurationMinutes));
        if (parsed.totalPeriods !== undefined) setTotalPeriods(Number(parsed.totalPeriods));
      }
    } catch (e) {}

    // Load Step 2 session
    try {
      const savedStep2 = sessionStorage.getItem(STEP2_SESSION_KEY);
      if (savedStep2) {
        const parsed = JSON.parse(savedStep2);
        if (Array.isArray(parsed.objectives) && parsed.objectives.length > 0) {
          setObjectives(parsed.objectives);
        }
        if (Array.isArray(parsed.selectedCompetencies) && parsed.selectedCompetencies.length > 0) {
          setSelectedCompetencies(parsed.selectedCompetencies);
        }
      }
    } catch (e) {}

    // Load Step 3 session
    try {
      const savedStep3 = sessionStorage.getItem(STEP3_SESSION_KEY);
      if (savedStep3) {
        const parsed = JSON.parse(savedStep3);
        if (Array.isArray(parsed.assessmentTools) && parsed.assessmentTools.length > 0) {
          setAssessmentTools(parsed.assessmentTools);
        }
        if (parsed.assignment) {
          setAssignment(parsed.assignment);
        }
      }
    } catch (e) {}

    // Synchronize active teacher name from localStorage if available
    try {
      const savedUser = localStorage.getItem('abqoor_username_v1');
      if (savedUser) setTeacherName(savedUser);
    } catch (e) {}
  }, [isOpen]);

  // Persist Step 1 session
  useEffect(() => {
    if (!isOpen) return;
    try {
      sessionStorage.setItem(
        STEP1_SESSION_KEY,
        JSON.stringify({ grade, subject, semester, unitTitle, lessonTitle, currentPeriod, periodDurationMinutes, totalPeriods })
      );
    } catch (e) {}
  }, [isOpen, grade, subject, semester, unitTitle, lessonTitle, currentPeriod, periodDurationMinutes, totalPeriods]);

  // Persist Step 2 session
  useEffect(() => {
    if (!isOpen) return;
    try {
      sessionStorage.setItem(STEP2_SESSION_KEY, JSON.stringify({ objectives, selectedCompetencies }));
    } catch (e) {}
  }, [isOpen, objectives, selectedCompetencies]);

  // Persist Step 3 session
  useEffect(() => {
    if (!isOpen) return;
    try {
      sessionStorage.setItem(STEP3_SESSION_KEY, JSON.stringify({ assessmentTools, assignment }));
    } catch (e) {}
  }, [isOpen, assessmentTools, assignment]);

  // Sync with attached resource if selected
  const applyResourceToFields = (res: EducationalResource) => {
    setActiveResource(res);
    if (res.inferredSubject) setSubject(res.inferredSubject);
    if (res.inferredGrade) setGrade(res.inferredGrade);

    let resolvedTitle = res.inferredLessonTitle || res.title;
    resolvedTitle = resolvedTitle
      .replace(
        /^(كتاب|ورقة عمل|عرض تقديمي|تسجيل صوتي|فيديو تعليمي|اختبار تقويمي|جدول بيانات|وسيلة بصرية|دليل المعلم|مستند|رابط تعليمي|معايير ونتاجات|ملاحظات تحضير)[\s:–-]*[^\-]+- /i,
        ''
      )
      .trim();
    if (resolvedTitle) setLessonTitle(resolvedTitle);

    setCustomNotes(
      `الاستناد التام إلى المصدر المرفق: "${res.title}". يرجى مراعاة نصوصه وأهدافه وتدريباته بدقة في بناء سير الحصة، ومهمة التقويم الأصيل GRASPS، وسلم التقدير اللفظي Rubric.`
    );

    setActionNotice(`تمت مزامنة العناوين تلقائياً وفق المصدر: «${res.title}»`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  useEffect(() => {
    if (!isOpen) return;
    if (selectedResourceForPlanning) {
      applyResourceToFields(selectedResourceForPlanning);
    } else if (resources.length > 0 && !activeResource) {
      applyResourceToFields(resources[0]);
    }
  }, [isOpen, selectedResourceForPlanning, resources]);

  // Initialize default objectives and competencies if entering step 2/3
  const ensureDefaultObjectivesAndCompetencies = () => {
    if (objectives.length === 0) {
      const title = lessonTitle || 'الدرس';
      const initialObjs: LessonObjective[] = [
        {
          id: 'obj-default-cog-1',
          domain: 'cognitive',
          text: `أن يوضح الطالب المفاهيم والمعارف الأساسية المتعلقة بـ (${title}) بدقة.`,
        },
        {
          id: 'obj-default-skill-1',
          domain: 'skill',
          text: `أن يطبق الطالب المهارات الأدائية والحلول الإجرائية المرتبطة بـ (${title}) في مواقف وأنشطة تعليمية.`,
        },
        {
          id: 'obj-default-aff-1',
          domain: 'affective',
          text: `أن يقدّر الطالب أهمية موضوع (${title}) وتطبيقاته الإيجابية في البيئة والمجتمع الفلسطينين.`,
        },
      ];
      setObjectives(initialObjs);
    }

    if (selectedCompetencies.length === 0) {
      const generalComp = INITIAL_PALESTINIAN_COMPETENCIES.find((c) => c.code === 'GEN-CRIT-02') || INITIAL_PALESTINIAN_COMPETENCIES[0];
      const subjectComp = INITIAL_PALESTINIAN_COMPETENCIES.find((c) => {
        if (!subject) return false;
        return c.category === 'subject_specific' && (c.subject.includes(subject) || subject.includes(c.subject));
      });

      const initialSelected: ChosenCompetency[] = [];
      if (generalComp) {
        initialSelected.push({
          id: generalComp.id,
          code: generalComp.code,
          title: generalComp.title,
          statement: generalComp.statement,
          domainLabel: generalComp.domainLabel,
          category: 'general',
        });
      }
      if (subjectComp && subjectComp.id !== generalComp?.id) {
        initialSelected.push({
          id: subjectComp.id,
          code: subjectComp.code,
          title: subjectComp.title,
          statement: subjectComp.statement,
          domainLabel: subjectComp.domainLabel,
          category: 'subject_specific',
        });
      }
      setSelectedCompetencies(initialSelected);
    }
  };

  // Initialize default assessment tools if entering step 3
  const ensureDefaultAssessmentTools = () => {
    if (assessmentTools.length === 0) {
      const defaultObjs = objectives.length > 0 ? objectives : [
        { id: 'obj-default-cog-1', domain: 'cognitive' as ObjectiveDomain, text: `أن يوضح الطالب مفاهيم الدرس.` }
      ];
      const defaults: AssessmentToolItem[] = [
        {
          id: 'assess-1',
          name: 'أسئلة التهيئة واستقصاء المعارف السابقة',
          type: 'diagnostic',
          linkedObjectiveId: defaultObjs[0]?.id,
          instructions: 'طرح أسئلة شفوية قصيرة لاستكشاف المعارف السابقة للطلبة وتمهيدهم للدرس.',
          questionsOrIndicators: 'ماذا تعرفون عن المفاهيم السابقة المرتبطة بالعنوان؟',
          expectedAnswerOrCriteria: 'إجابات صحيحة تعكس الاستعداد لتعلم المفاهيم الجديدة.',
          durationMinutes: 5,
          recordingMethod: 'ملاحظة المشاركة الشفوية وسجل المتابعة الصفية',
          toolCategory: 'qa',
        },
        {
          id: 'assess-2',
          name: 'قائمة رصد التفاعل التكويني',
          type: 'formative',
          linkedObjectiveId: defaultObjs[1]?.id || defaultObjs[0]?.id,
          instructions: 'متابعة أداء الطلبة أثناء العمل الجماعي وتطبيق الأنشطة واستخدام المحسوسات.',
          questionsOrIndicators: 'مدى دقة تطبيق الخطوات والتعاون بين أعضاء المجموعة.',
          expectedAnswerOrCriteria: 'مستويات أداء متقدمة وكفء لدى فرق العمل.',
          durationMinutes: 10,
          recordingMethod: 'قائمة رصد تقديرية (نعم / لا / أحياناً)',
          toolCategory: 'checklist',
        },
        {
          id: 'assess-3',
          name: 'مهمة التقويم الختامي الأصيل (GRASPS)',
          type: 'summative',
          linkedObjectiveId: defaultObjs[defaultObjs.length - 1]?.id || defaultObjs[0]?.id,
          instructions: 'تكليف الطلبة بتنفيذ مهمة أدائية تطبيقية مرتبطة بواقع البيئة المحلية الفلسطينية.',
          questionsOrIndicators: 'تنفيذ المهمة بدقة وفق المعايير المحددة بسلم التقدير.',
          expectedAnswerOrCriteria: 'منتج طلابي إيجابي يوضح فهم واستيعاب نتاجات التعلم.',
          durationMinutes: 10,
          recordingMethod: 'سلم تقدير لفظي (متميز، كفء، نامٍ، مبتدئ)',
          toolCategory: 'grasps',
        },
      ];
      setAssessmentTools(defaults);
    }
  };

  if (!isOpen) return null;

  // Validate Step 1
  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!grade.trim()) errors.grade = 'يرجى اختيار أو إدخال الصف الدراسي.';
    if (!subject.trim()) errors.subject = 'يرجى إدخال اسم المبحث أو المادة الدراسية.';
    if (!semester.trim()) errors.semester = 'يرجى اختيار الفصل الدراسي.';
    if (!unitTitle.trim()) errors.unitTitle = 'يرجى إدخال عنوان أو اسم الوحدة الدراسية.';
    if (!lessonTitle.trim()) errors.lessonTitle = 'يرجى إدخال عنوان الدرس بدقة.';
    if (!currentPeriod || currentPeriod < 1) errors.currentPeriod = 'رقم الحصة يجب أن يكون رقماً صحيحاً (١ أو أكثر).';
    if (!periodDurationMinutes || periodDurationMinutes < 15 || periodDurationMinutes > 180) {
      errors.periodDurationMinutes = 'زمن الحصة يجب أن يكون بين ١٥ و ١٨٠ دقيقة.';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedFromStep1ToStep2 = () => {
    setError(null);
    if (!validateStep1()) {
      setError('يرجى تصحيح واستكمال الحقول الإلزامية المشار إليها باللون الأحمر للمتابعة.');
      return;
    }
    ensureDefaultObjectivesAndCompetencies();
    setWizardStep(2);
  };

  const handleProceedFromStep2ToStep3 = () => {
    setError(null);
    if (objectives.length === 0) {
      setError('يرجى إضافة هدف تعليمي واحد على الأقل للمتابعة إلى الخطوة التالية.');
      return;
    }
    ensureDefaultAssessmentTools();
    setWizardStep(3);
  };

  const handleProceedFromStep3ToStep4 = () => {
    setError(null);
    if (assessmentTools.length === 0) {
      setError('يرجى إضافة أداة تقويم واحدة على الأقل قبل المتابعة للمراجعة النهائية.');
      return;
    }
    setWizardStep(4);
  };

  const handleClearFields = () => {
    const confirmed = window.confirm('هل ترغب بمسح كافة حقول بيانات الدرس والبدء من جديد؟');
    if (!confirmed) return;
    setGrade('');
    setSubject('');
    setSemester('الفصل الدراسي الأول');
    setUnitTitle('');
    setLessonTitle('');
    setCurrentPeriod(1);
    setPeriodDurationMinutes(40);
    setTotalPeriods(1);
    setValidationErrors({});
    setError(null);
    setActiveResource(null);
    try {
      sessionStorage.removeItem(STEP1_SESSION_KEY);
    } catch (e) {}
    setActionNotice('تم مسح الحقول وإعادة الضبط بنجاح.');
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleReturnToHome = () => {
    onClose();
  };

  // Objectives Operations (Step 2)
  const handleAddObjective = () => {
    if (!newObjectiveText.trim()) {
      setError('يرجى كتابة نص الهدف التعليمي قبل الإضافة.');
      return;
    }
    setError(null);
    const newObj: LessonObjective = {
      id: `obj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      text: newObjectiveText.trim(),
      domain: newObjectiveDomain,
    };
    setObjectives((prev) => [...prev, newObj]);
    setNewObjectiveText('');
    setActionNotice('تمت إضافة الهدف التعليمي بنجاح.');
    setTimeout(() => setActionNotice(null), 2500);
  };

  const handleStartEditObjective = (obj: LessonObjective) => {
    setEditingObjectiveId(obj.id);
    setEditingObjectiveText(obj.text);
    setEditingObjectiveDomain(obj.domain);
  };

  const handleSaveEditObjective = (id: string) => {
    if (!editingObjectiveText.trim()) {
      setError('نص الهدف لا يمكن أن يكون فارغاً.');
      return;
    }
    setError(null);
    setObjectives((prev) =>
      prev.map((o) => (o.id === id ? { ...o, text: editingObjectiveText.trim(), domain: editingObjectiveDomain } : o))
    );
    setEditingObjectiveId(null);
    setEditingObjectiveText('');
    setActionNotice('تم تعديل الهدف التعليمي بنجاح.');
    setTimeout(() => setActionNotice(null), 2500);
  };

  const handleDeleteObjective = (id: string) => {
    setObjectives((prev) => prev.filter((o) => o.id !== id));
    if (editingObjectiveId === id) setEditingObjectiveId(null);
    setActionNotice('تم حذف الهدف.');
    setTimeout(() => setActionNotice(null), 2500);
  };

  const handleAddSuggestedObjective = (domain: ObjectiveDomain, text: string) => {
    const newObj: LessonObjective = {
      id: `obj-sug-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      text,
      domain,
    };
    setObjectives((prev) => [...prev, newObj]);
    setActionNotice('تم إدراج الهدف المقترح.');
    setTimeout(() => setActionNotice(null), 2500);
  };

  // Competencies Operations (Step 2)
  const handleToggleCompetency = (comp: CompetencyItem) => {
    const isAlreadySelected = selectedCompetencies.some((c) => c.id === comp.id);
    if (isAlreadySelected) {
      setSelectedCompetencies((prev) => prev.filter((c) => c.id !== comp.id));
      setActionNotice(`تم إلغاء اختيار: ${comp.title}`);
    } else {
      const chosen: ChosenCompetency = {
        id: comp.id,
        code: comp.code,
        title: comp.title,
        statement: comp.statement,
        domainLabel: comp.domainLabel,
        category: comp.category,
      };
      setSelectedCompetencies((prev) => [...prev, chosen]);
      setActionNotice(`تم اختيار الكفاية: ${comp.title}`);
    }
    setTimeout(() => setActionNotice(null), 2500);
  };

  const handleRemoveChosenCompetency = (id: string) => {
    setSelectedCompetencies((prev) => prev.filter((c) => c.id !== id));
    setActionNotice('تمت إزالة الكفاية من الخطة.');
    setTimeout(() => setActionNotice(null), 2500);
  };

  const handleAddCustomCompetency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCompetencyTitle.trim()) {
      setError('يرجى كتابة عنوان الكفاية المصاغة.');
      return;
    }
    setError(null);
    const customComp: ChosenCompetency = {
      id: `comp-custom-${Date.now()}`,
      code: 'كفاية مصاغة',
      title: customCompetencyTitle.trim(),
      statement: customCompetencyStatement.trim() || undefined,
      domainLabel: customCompetencyDomain.trim() || 'كفاية خاصة بالدرس',
      category: 'custom',
      isCustom: true,
    };
    setSelectedCompetencies((prev) => [...prev, customComp]);
    setCustomCompetencyTitle('');
    setCustomCompetencyStatement('');
    setIsCustomCompetencyFormOpen(false);
    setActionNotice('تمت إضافة الكفاية المصاغة بنجاح.');
    setTimeout(() => setActionNotice(null), 2500);
  };

  // Assessment Tools Operations (Step 3)
  const handleAddAssessmentTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newToolName.trim()) {
      setError('يرجى كتابة اسم أداة التقويم.');
      return;
    }
    setError(null);
    const newTool: AssessmentToolItem = {
      id: `tool-${Date.now()}`,
      name: newToolName.trim(),
      type: newToolType,
      linkedObjectiveId: newToolLinkedObjId || objectives[0]?.id,
      instructions: newToolInstructions.trim() || 'تنفيذ الأداة بحسب تعليمات المعلم في الغرفة الصفية.',
      questionsOrIndicators: newToolQuestions.trim() || 'مؤشرات الأداء المقترحة للتحقق من تحقيق الهدف.',
      expectedAnswerOrCriteria: newToolCriteria.trim() || 'مستوى الأداء المطلوب للتحقق من إتقان النتاج.',
      durationMinutes: Number(newToolDuration) || 10,
      recordingMethod: newToolRecordingMethod.trim() || 'رصد تقديري',
      toolCategory: newToolCategory,
    };
    setAssessmentTools((prev) => [...prev, newTool]);
    setNewToolName('');
    setNewToolInstructions('');
    setNewToolQuestions('');
    setNewToolCriteria('');
    setIsNewAssessmentFormOpen(false);
    setActionNotice('تمت إضافة أداة التقويم بنجاح.');
    setTimeout(() => setActionNotice(null), 2500);
  };

  const handleDeleteAssessmentTool = (id: string) => {
    setAssessmentTools((prev) => prev.filter((t) => t.id !== id));
    setActionNotice('تم حذف أداة التقويم.');
    setTimeout(() => setActionNotice(null), 2500);
  };

  // Filter Palestinian Competencies
  const filteredPalestinianCompetencies = useMemo(() => {
    return INITIAL_PALESTINIAN_COMPETENCIES.filter((comp) => {
      if (competenciesCategoryFilter === 'general' && comp.category !== 'general') return false;
      if (competenciesCategoryFilter === 'subject_specific' && comp.category !== 'subject_specific') return false;
      if (competenciesSearchQuery.trim()) {
        const q = competenciesSearchQuery.trim().toLowerCase();
        return (
          comp.title.toLowerCase().includes(q) ||
          comp.statement.toLowerCase().includes(q) ||
          comp.domainLabel.toLowerCase().includes(q) ||
          comp.code.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [competenciesCategoryFilter, competenciesSearchQuery]);

  const assessmentTypeInfo = (type: AssessmentType) => {
    switch (type) {
      case 'diagnostic':
        return { label: 'التقويم القبلي', badge: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'formative':
        return { label: 'التقويم التكويني (البنائي)', badge: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'summative':
        return { label: 'التقويم الختامي', badge: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'self_peer':
        return { label: 'التقويم الذاتي وتقويم الأقران', badge: 'bg-purple-100 text-purple-900 border-purple-300' };
    }
  };

  const domainInfo = (domain: ObjectiveDomain) => {
    switch (domain) {
      case 'cognitive':
        return { label: 'المجال المعرفي', short: 'معرفي', badgeClass: 'bg-blue-100 text-blue-900 border-blue-300', activeTabClass: 'bg-blue-800 text-white border-blue-800', icon: Brain };
      case 'skill':
        return { label: 'المجال المهاري', short: 'مهاري', badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300', activeTabClass: 'bg-emerald-800 text-white border-emerald-800', icon: Wrench };
      case 'affective':
        return { label: 'المجال الوجداني والقيمي', short: 'وجداني', badgeClass: 'bg-amber-100 text-amber-900 border-amber-300', activeTabClass: 'bg-amber-800 text-white border-amber-800', icon: Heart };
    }
  };

  // Final Generation Trigger (Step 4)
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          grade,
          lessonTitle,
          unitTitle,
          semester,
          totalPeriods,
          currentPeriod,
          periodDurationMinutes,
          country,
          ministry,
          school,
          directorate,
          teacherName,
          customNotes: `${customNotes}
الأهداف التعليمية المحددة:
${objectives.map((o) => `- [${domainInfo(o.domain).label}]: ${o.text}`).join('\n')}
الكفايات المستهدفة:
${selectedCompetencies.map((c) => `- ${c.title} (${c.domainLabel})`).join('\n')}
أدوات التقويم التربوي والواجبات:
${assessmentTools.map((t) => `- [${assessmentTypeInfo(t.type).label}] ${t.name}: ${t.instructions} (طريقة الرصد: ${t.recordingMethod})`).join('\n')}
الواجب المنزلي: ${assignment.homework}
المهمة التطبيقية: ${assignment.appliedTask}`,
          resources,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'حدث خطأ أثناء توليد خطة الدرس');
      }

      const baseExec = data.plan?.executiveData || createDefaultExecutiveData(data.plan);
      const planWithResources: LessonPlan = {
        ...data.plan,
        templateType: selectedTemplateType,
        header: {
          ...data.plan.header,
          semester: semester || data.plan.header.semester,
          unitTitle: unitTitle || data.plan.header.unitTitle,
          currentPeriod: Number(currentPeriod) || 1,
          totalPeriods: Number(totalPeriods) || 1,
          periodDurationMinutes: Number(periodDurationMinutes) || 40,
        },
        executiveData: {
          ...baseExec,
          smartObjectives:
            objectives.length > 0
              ? objectives.map((o) => `[${domainInfo(o.domain).label}] ${o.text}`)
              : baseExec.smartObjectives,
          learningCompetencies:
            selectedCompetencies.length > 0
              ? selectedCompetencies.map((c) => `${c.title} (${c.domainLabel})`).join(' • ')
              : baseExec.learningCompetencies,
        },
        attachedResources: resources.length > 0 ? [...resources] : undefined,
      };

      onPlanGenerated(planWithResources);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'تعذر الاتصال بالخادم الذكي لإعداد الخطة');
    } finally {
      setLoading(false);
    }
  };

  const quickSubjects = ['الرياضيات', 'العلوم والحياة', 'اللغة العربية', 'التربية الإسلامية', 'التنشئة الوطنية والاجتماعية', 'اللغة الإنجليزية'];
  const quickSemesters = ['الفصل الدراسي الأول', 'الفصل الدراسي الثاني', 'الفصل الصيفي'];

  // Counts
  const cognitiveCount = objectives.filter((o) => o.domain === 'cognitive').length;
  const skillCount = objectives.filter((o) => o.domain === 'skill').length;
  const affectiveCount = objectives.filter((o) => o.domain === 'affective').length;

  return (
    <div
      dir="rtl"
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto text-right font-['Cairo',sans-serif] animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-4 flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="bg-linear-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center shadow-inner shrink-0">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black font-['Tajawal'] text-white">
                  مسار التحضير التربوي الذكي
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-amber-950 shadow-xs">
                  {wizardStep === 1 && 'الخطوة ١: بيانات الدرس الأساسية'}
                  {wizardStep === 2 && 'الخطوة ٢: الأهداف والكفايات'}
                  {wizardStep === 3 && 'الخطوة ٣: التقويم التربوي والواجبات'}
                  {wizardStep === 4 && 'الخطوة ٤: المراجعة والاعتماد'}
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                {wizardStep === 1 && 'المرحلة الأولى: إدخال ومراجعة بيانات الدرس الأساسية لمرة واحدة'}
                {wizardStep === 2 && 'المرحلة الثانية: تحديد الأهداف التعليمية وربط كفايات المنهاج الفلسطيني'}
                {wizardStep === 3 && 'المرحلة الحالية: إنشاء أدوات التقويم التربوي والواجبات والمهام'}
                {wizardStep === 4 && 'المرحلة النهائية: المراجعة وتوليد الخطة التربوية الشاملة'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReturnToHome}
            disabled={loading}
            className="p-2 text-white/80 hover:text-white hover:bg-white/15 rounded-full transition-colors cursor-pointer disabled:opacity-50"
            title="إغلاق والعودة إلى الرئيسية"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress Bar (4 Steps) */}
        <div className="bg-slate-100 border-b border-slate-200 px-3 sm:px-6 py-2.5 flex items-center justify-between text-xs font-bold text-slate-600 overflow-x-auto scrollbar-none">
          {/* Step 1 */}
          <button
            type="button"
            onClick={() => setWizardStep(1)}
            className={`flex items-center gap-1.5 shrink-0 cursor-pointer ${wizardStep === 1 ? 'text-emerald-950 font-black' : 'text-slate-600 hover:text-emerald-800'}`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${wizardStep === 1 ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'}`}>١</span>
            <span>بيانات الدرس</span>
          </button>

          <span className="text-slate-300 mx-1">←</span>

          {/* Step 2 */}
          <button
            type="button"
            onClick={() => {
              if (validateStep1()) {
                ensureDefaultObjectivesAndCompetencies();
                setWizardStep(2);
              }
            }}
            className={`flex items-center gap-1.5 shrink-0 cursor-pointer ${wizardStep === 2 ? 'text-emerald-950 font-black' : 'text-slate-600 hover:text-emerald-800'}`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${wizardStep === 2 ? 'bg-emerald-700 text-white' : wizardStep > 2 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>٢</span>
            <span>الأهداف والكفايات</span>
          </button>

          <span className="text-slate-300 mx-1">←</span>

          {/* Step 3 */}
          <button
            type="button"
            onClick={() => {
              if (validateStep1() && objectives.length > 0) {
                ensureDefaultAssessmentTools();
                setWizardStep(3);
              }
            }}
            className={`flex items-center gap-1.5 shrink-0 cursor-pointer ${wizardStep === 3 ? 'text-emerald-950 font-black' : 'text-slate-600 hover:text-emerald-800'}`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${wizardStep === 3 ? 'bg-emerald-700 text-white' : wizardStep > 3 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>٣</span>
            <span>التقويم والواجبات</span>
          </button>

          <span className="text-slate-300 mx-1">←</span>

          {/* Step 4 */}
          <div className={`flex items-center gap-1.5 shrink-0 ${wizardStep === 4 ? 'text-emerald-950 font-black' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${wizardStep === 4 ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-600'}`}>٤</span>
            <span>المراجعة والاعتماد</span>
          </div>
        </div>

        {/* Draft Safety Banner */}
        <div className="bg-amber-50/90 border-b border-amber-200/80 px-4 sm:px-6 py-2 text-xs text-amber-950 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-bold">
            <Clock className="w-4 h-4 text-amber-700 shrink-0" />
            <span>جلسة عمل نشطة ومحفوظة تلقائياً — لن تفقد أي قيمة عند التنقل بين خطوات التحضير.</span>
          </div>
          <span className="text-[10px] text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-md font-black shrink-0 border border-emerald-300">
            تخزين آمن 🔒
          </span>
        </div>

        {/* Notifications and Alerts */}
        {actionNotice && (
          <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-xs font-bold text-emerald-950 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-rose-50 border-b border-rose-200 text-xs font-bold text-rose-900 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 1: واجهة بيانات الدرس الأساسية                                */}
        {/* ================================================================= */}
        {wizardStep === 1 && (
          <div className="p-5 sm:p-6 space-y-5 flex-1 overflow-y-auto">
            {resources.length > 0 && (
              <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-emerald-950 block">
                      تتوفر ({toArabicDigits(resources.length)}) مصادر وكتب منهاج في مكتبتك:
                    </span>
                    <span className="text-[11px] text-emerald-800 block">
                      يمكنك مزامنة عنوان الدرس والوحدة تلقائياً بالضغط على أحد المصادر.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {resources.slice(0, 2).map((res) => (
                    <button
                      key={res.id}
                      type="button"
                      onClick={() => applyResourceToFields(res)}
                      className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-[11px] font-bold transition-all cursor-pointer truncate max-w-[140px]"
                      title={res.title}
                    >
                      {res.title}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={onOpenResourcesModal}
                    className="p-1 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100 rounded-lg"
                    title="فتح بنك المصادر"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-emerald-700" />
                      <span>١. الصف الدراسي *</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsStageModalOpen(true)}
                      className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>كافة المراحل 🎓</span>
                    </button>
                  </div>

                  <select
                    value={grade}
                    onChange={(e) => {
                      setGrade(e.target.value);
                      if (validationErrors.grade) setValidationErrors((prev) => ({ ...prev, grade: '' }));
                    }}
                    className={`w-full p-2.5 text-xs bg-white border rounded-xl font-bold focus:outline-hidden transition-all ${
                      validationErrors.grade ? 'border-rose-400 bg-rose-50/40' : 'border-slate-300 focus:border-emerald-600'
                    }`}
                  >
                    <option value="">-- اختر الصف الدراسي --</option>
                    {STANDARD_GRADES.slice(0, 15).map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                  {validationErrors.grade && <p className="text-[11px] text-rose-600 font-bold">{validationErrors.grade}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-700" />
                    <span>٢. المادة الدراسية *</span>
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      if (validationErrors.subject) setValidationErrors((prev) => ({ ...prev, subject: '' }));
                    }}
                    placeholder="مثال: الرياضيات، العلوم والحياة..."
                    className={`w-full p-2.5 text-xs bg-white border rounded-xl font-bold focus:outline-hidden transition-all ${
                      validationErrors.subject ? 'border-rose-400 bg-rose-50/40' : 'border-slate-300 focus:border-emerald-600'
                    }`}
                  />
                  {validationErrors.subject && <p className="text-[11px] text-rose-600 font-bold">{validationErrors.subject}</p>}

                  <div className="flex flex-wrap gap-1 pt-1">
                    {quickSubjects.slice(0, 4).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setSubject(s);
                          setValidationErrors((prev) => ({ ...prev, subject: '' }));
                        }}
                        className={`text-[10px] px-2 py-0.5 rounded-lg border font-bold transition-all cursor-pointer ${
                          subject === s ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-teal-700" />
                    <span>٣. الفصل الدراسي *</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {quickSemesters.map((sem) => (
                      <button
                        key={sem}
                        type="button"
                        onClick={() => {
                          setSemester(sem);
                          if (validationErrors.semester) setValidationErrors((prev) => ({ ...prev, semester: '' }));
                        }}
                        className={`p-2 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer ${
                          semester === sem ? 'bg-teal-700 text-white border-teal-700 shadow-2xs' : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {sem.replace('الفصل الدراسي ', '')}
                      </button>
                    ))}
                  </div>
                  {validationErrors.semester && <p className="text-[11px] text-rose-600 font-bold">{validationErrors.semester}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Layers3 className="w-4 h-4 text-teal-700" />
                    <span>٤. الوحدة الدراسية *</span>
                  </label>
                  <input
                    type="text"
                    value={unitTitle}
                    onChange={(e) => {
                      setUnitTitle(e.target.value);
                      if (validationErrors.unitTitle) setValidationErrors((prev) => ({ ...prev, unitTitle: '' }));
                    }}
                    placeholder="مثال: الوحدة الأولى: الأعداد والعمليات"
                    className={`w-full p-2.5 text-xs bg-white border rounded-xl font-bold focus:outline-hidden transition-all ${
                      validationErrors.unitTitle ? 'border-rose-400 bg-rose-50/40' : 'border-slate-300 focus:border-teal-600'
                    }`}
                  />
                  {validationErrors.unitTitle && <p className="text-[11px] text-rose-600 font-bold">{validationErrors.unitTitle}</p>}
                </div>
              </div>

              <div className="space-y-1 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200">
                <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <FileEdit className="w-4 h-4 text-emerald-700" />
                  <span>٥. عنوان الدرس المعتمد *</span>
                </label>
                <input
                  type="text"
                  value={lessonTitle}
                  onChange={(e) => {
                    setLessonTitle(e.target.value);
                    if (validationErrors.lessonTitle) setValidationErrors((prev) => ({ ...prev, lessonTitle: '' }));
                  }}
                  placeholder="مثال: القيمة المنزلية للأعداد ضمن ٩٩٩٩..."
                  className={`w-full p-3 text-xs sm:text-sm bg-white border rounded-xl font-bold focus:outline-hidden transition-all ${
                    validationErrors.lessonTitle ? 'border-rose-400 bg-rose-50/40' : 'border-emerald-300 focus:border-emerald-600'
                  }`}
                />
                {validationErrors.lessonTitle && <p className="text-[11px] text-rose-600 font-bold">{validationErrors.lessonTitle}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-700" />
                    <span>٦. رقم الحصة (الفترة) *</span>
                  </label>
                  <select
                    value={currentPeriod}
                    onChange={(e) => setCurrentPeriod(Number(e.target.value))}
                    className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl font-bold focus:outline-hidden"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((p) => (
                      <option key={p} value={p}>الحصة {toArabicDigits(p)} ({p})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-700" />
                    <span>٧. زمن الحصة بالدقائق *</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={15}
                      max={180}
                      value={periodDurationMinutes}
                      onChange={(e) => setPeriodDurationMinutes(Number(e.target.value))}
                      className="w-28 p-2.5 text-xs bg-white border border-slate-300 rounded-xl font-bold text-center"
                    />
                    <div className="flex items-center gap-1">
                      {[35, 40, 45].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setPeriodDurationMinutes(mins)}
                          className={`px-2 py-1 rounded-lg border text-[10px] font-bold cursor-pointer ${
                            periodDurationMinutes === mins ? 'bg-blue-700 text-white border-blue-700' : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {toArabicDigits(mins)} د
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleReturnToHome}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 w-full sm:w-auto cursor-pointer"
                >
                  <Home className="w-4 h-4 text-slate-600" />
                  <span>العودة إلى الرئيسية</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearFields}
                  className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 w-full sm:w-auto cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-rose-600" />
                  <span>مسح الحقول</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleProceedFromStep1ToStep2}
                className="w-full sm:w-auto px-6 py-2.5 bg-linear-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <span>متابعة: الأهداف والكفايات</span>
                <ArrowLeft className="w-4 h-4 text-emerald-200" />
              </button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 2: الأهداف التعليمية والكفايات                                 */}
        {/* ================================================================= */}
        {wizardStep === 2 && (
          <div className="p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto">
            <div className="bg-emerald-50/80 border border-emerald-300 p-4 rounded-2xl shadow-xs space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-emerald-950 block">بيانات الدرس المحققة (المرحلة ١):</span>
                    <span className="text-[11px] text-emerald-800">محفوظة تلقائياً</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setWizardStep(1)}
                  className="px-3 py-1 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>تعديل بيانات الدرس ✏️</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="bg-white/70 p-2 rounded-xl border border-emerald-100">
                  <span className="text-slate-500 text-[10px] block font-bold">الصف والمبحث:</span>
                  <span className="font-black text-slate-900">{grade} • {subject}</span>
                </div>
                <div className="bg-white/70 p-2 rounded-xl border border-emerald-100">
                  <span className="text-slate-500 text-[10px] block font-bold">الفصل والوحدة:</span>
                  <span className="font-black text-slate-900 truncate block">{semester} • {unitTitle}</span>
                </div>
                <div className="bg-white/70 p-2 rounded-xl border border-emerald-100">
                  <span className="text-slate-500 text-[10px] block font-bold">عنوان الدرس:</span>
                  <span className="font-black text-emerald-900 truncate block">{lessonTitle}</span>
                </div>
                <div className="bg-white/70 p-2 rounded-xl border border-emerald-100">
                  <span className="text-slate-500 text-[10px] block font-bold">الحصة والزمن:</span>
                  <span className="font-black text-slate-900">الحصة ({toArabicDigits(currentPeriod)}) • {toArabicDigits(periodDurationMinutes)} د</span>
                </div>
              </div>
            </div>

            {/* Objectives Section */}
            <div className="space-y-4 bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                <div>
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-700" />
                    <span>الأهداف التعليمية ونواتج التعلم (SMART Objectives)</span>
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">تصنيف الأهداف حسب المجالات (معرفي، مهاري، وجداني).</p>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-blue-100 text-blue-900 border border-blue-200">معرفي: {toArabicDigits(cognitiveCount)}</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-900 border border-emerald-200">مهاري: {toArabicDigits(skillCount)}</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-200">وجداني: {toArabicDigits(affectiveCount)}</span>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-300 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-black text-slate-800">اختر المجال التعليمي:</label>
                  <div className="grid grid-cols-3 gap-1.5 w-full sm:w-auto">
                    {(['cognitive', 'skill', 'affective'] as ObjectiveDomain[]).map((dom) => {
                      const dInfo = domainInfo(dom);
                      const isSelected = newObjectiveDomain === dom;
                      const Icon = dInfo.icon;
                      return (
                        <button
                          key={dom}
                          type="button"
                          onClick={() => setNewObjectiveDomain(dom)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-black flex items-center justify-center gap-1 transition-all cursor-pointer ${
                            isSelected ? dInfo.activeTabClass + ' shadow-2xs' : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{dInfo.short}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newObjectiveText}
                    onChange={(e) => setNewObjectiveText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddObjective();
                      }
                    }}
                    placeholder="صياغة هدف إجرائي (مثال: أن يشرح الطالب...)"
                    className="flex-1 p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold focus:bg-white focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddObjective}
                    className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة</span>
                  </button>
                </div>
              </div>

              {/* List of Objectives */}
              <div className="space-y-2">
                {objectives.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-3">لم تتم إضافة أهداف بعد.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {objectives.map((obj, idx) => {
                      const dInfo = domainInfo(obj.domain);
                      const isEditing = editingObjectiveId === obj.id;
                      if (isEditing) {
                        return (
                          <div key={obj.id} className="p-3 bg-white border-2 border-emerald-500 rounded-xl space-y-2">
                            <input
                              type="text"
                              value={editingObjectiveText}
                              onChange={(e) => setEditingObjectiveText(e.target.value)}
                              className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-bold"
                            />
                            <div className="flex items-center justify-end gap-1.5">
                              <button type="button" onClick={() => setEditingObjectiveId(null)} className="px-3 py-1 bg-slate-100 rounded-lg text-xs cursor-pointer">إلغاء</button>
                              <button type="button" onClick={() => handleSaveEditObjective(obj.id)} className="px-3 py-1 bg-emerald-700 text-white rounded-lg text-xs font-black cursor-pointer">حفظ</button>
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div key={obj.id} className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-2 shadow-2xs">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${dInfo.badgeClass}`}>{dInfo.short}</span>
                            <p className="text-xs font-bold text-slate-900 truncate">{obj.text}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button type="button" onClick={() => handleStartEditObjective(obj)} className="p-1.5 text-slate-500 hover:text-emerald-700 cursor-pointer"><Edit3 className="w-3.5 h-3.5" /></button>
                            <button type="button" onClick={() => handleDeleteObjective(obj.id)} className="p-1.5 text-slate-400 hover:text-rose-700 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Competencies Section */}
            <div className="space-y-4 bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                <div>
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-700" />
                    <span>كفايات الدرس (الإطار الوطني الفلسطيني 🇵🇸)</span>
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCustomCompetencyFormOpen((prev) => !prev)}
                  className="px-3 py-1 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>صياغة كفاية جديدة ✍️</span>
                </button>
              </div>

              {isCustomCompetencyFormOpen && (
                <form onSubmit={handleAddCustomCompetency} className="bg-white p-4 rounded-xl border-2 border-emerald-500 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">عنوان الكفاية *</label>
                      <input
                        type="text"
                        value={customCompetencyTitle}
                        onChange={(e) => setCustomCompetencyTitle(e.target.value)}
                        placeholder="عنوان الكفاية..."
                        className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">مجال الكفاية</label>
                      <input
                        type="text"
                        value={customCompetencyDomain}
                        onChange={(e) => setCustomCompetencyDomain(e.target.value)}
                        className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-bold"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setIsCustomCompetencyFormOpen(false)} className="px-3 py-1 bg-slate-100 rounded-lg text-xs cursor-pointer">إلغاء</button>
                    <button type="submit" className="px-4 py-1 bg-emerald-700 text-white rounded-lg text-xs font-black cursor-pointer">إضافة الكفاية</button>
                  </div>
                </form>
              )}

              {/* Selected Competencies */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedCompetencies.map((comp) => (
                  <div key={comp.id} className="p-3 bg-white border border-emerald-200 rounded-xl flex items-start justify-between gap-2 shadow-2xs">
                    <div>
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900">{comp.code}</span>
                      <p className="text-xs font-black text-slate-900 mt-1">{comp.title}</p>
                    </div>
                    <button type="button" onClick={() => handleRemoveChosenCompetency(comp.id)} className="p-1 text-slate-400 hover:text-rose-700 cursor-pointer"><X className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>

              {/* Competency Picker Tray */}
              <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => setIsCompetencyPickerExpanded((prev) => !prev)}
                  className="w-full p-3 bg-slate-50 hover:bg-slate-100 flex items-center justify-between cursor-pointer text-right text-xs font-black text-slate-900"
                >
                  <span>استعراض كفايات المنهاج الفلسطيني المعتمدة ({toArabicDigits(filteredPalestinianCompetencies.length)})</span>
                  {isCompetencyPickerExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {isCompetencyPickerExpanded && (
                  <div className="p-3 space-y-3 border-t border-slate-200">
                    <input
                      type="text"
                      value={competenciesSearchQuery}
                      onChange={(e) => setCompetenciesSearchQuery(e.target.value)}
                      placeholder="ابحث في الكفايات..."
                      className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-bold"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {filteredPalestinianCompetencies.map((comp) => {
                        const isSelected = selectedCompetencies.some((c) => c.id === comp.id);
                        return (
                          <div key={comp.id} className={`p-2 rounded-xl border text-right flex flex-col justify-between ${isSelected ? 'bg-emerald-50 border-emerald-500' : 'bg-slate-50 border-slate-200'}`}>
                            <div>
                              <span className="text-[10px] font-black text-slate-500">{comp.domainLabel}</span>
                              <h5 className="text-xs font-black text-slate-900">{comp.title}</h5>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleToggleCompetency(comp)}
                              className={`mt-2 px-2.5 py-1 rounded-lg text-xs font-black self-end cursor-pointer ${isSelected ? 'bg-emerald-700 text-white' : 'bg-white text-emerald-900 border border-emerald-300'}`}
                            >
                              {isSelected ? 'مختارة ✓' : '+ اختيار'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setWizardStep(1)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>السابق: بيانات الدرس</span>
              </button>

              <button
                type="button"
                onClick={handleProceedFromStep2ToStep3}
                className="px-6 py-2.5 bg-linear-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 shadow-md cursor-pointer"
              >
                <span>متابعة: التقويم التربوي والواجبات</span>
                <ArrowLeft className="w-4 h-4 text-emerald-200" />
              </button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 3: التقويم التربوي وأدوات التقييم والواجبات                       */}
        {/* ================================================================= */}
        {wizardStep === 3 && (
          <div className="p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto">
            
            {/* Step 3 Banner & Objectives Linkage Check */}
            <div className="bg-emerald-50/80 border border-emerald-300 p-4 rounded-2xl shadow-xs space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-emerald-700" />
                  <span className="text-xs font-black text-emerald-950">
                    قسم التقويم التربوي وأدوات التقييم والواجبات (المرحلة العاشرة):
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className="text-xs text-emerald-800 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>مراجعة الأهداف ({toArabicDigits(objectives.length)})</span>
                </button>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                أنشئ أدوات التقويم القبلي والتكويني والختامي والذاتي، وحدد الواجبات المنزلية والمهام التطبيقية المرتبطة بأهداف الدرس بدقة.
              </p>
            </div>

            {/* Assessment Tools Section */}
            <div className="space-y-4 bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                <div>
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-emerald-700" />
                    <span>أدوات التقويم التربوي والقياس</span>
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    (قائمة رصد، سلم تقدير، بطاقة ملاحظة، مهمة أداء أصيلة GRASPS، أسئلة شفوية أو كتابية)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsNewAssessmentFormOpen((prev) => !prev)}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة أداة تقويم جديدة 🛠️</span>
                </button>
              </div>

              {/* Add New Assessment Tool Form */}
              {isNewAssessmentFormOpen && (
                <form onSubmit={handleAddAssessmentTool} className="bg-white p-4 rounded-xl border-2 border-emerald-500 space-y-3 animate-in fade-in shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-950">إضافة وتكوين أداة تقويم تربوية جديدة:</span>
                    <button type="button" onClick={() => setIsNewAssessmentFormOpen(false)} className="text-slate-400 hover:text-slate-600 text-xs">إغلاق</button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">اسم الأداة *</label>
                      <input
                        type="text"
                        value={newToolName}
                        onChange={(e) => setNewToolName(e.target.value)}
                        placeholder="مثال: سلم تقدير أداء الطلبة في تمثيل الكسور"
                        className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">نوع التقويم</label>
                      <select
                        value={newToolType}
                        onChange={(e) => setNewToolType(e.target.value as AssessmentType)}
                        className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-bold"
                      >
                        <option value="diagnostic">التقويم القبلي (استقصاء المعارف السابقة)</option>
                        <option value="formative">التقويم التكويني / البنائي (أثناء التعلم)</option>
                        <option value="summative">التقويم الختامي (التحقق من تحقيق الأهداف)</option>
                        <option value="self_peer">التقويم الذاتي وتقويم الأقران</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">الهدف التعليمي المرتبط</label>
                      <select
                        value={newToolLinkedObjId}
                        onChange={(e) => setNewToolLinkedObjId(e.target.value)}
                        className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-bold"
                      >
                        {objectives.map((o) => (
                          <option key={o.id} value={o.id}>[{domainInfo(o.domain).short}] {o.text.substring(0, 40)}...</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">طريقة رصد النتائج</label>
                      <input
                        type="text"
                        value={newToolRecordingMethod}
                        onChange={(e) => setNewToolRecordingMethod(e.target.value)}
                        placeholder="قائمة رصد، سلم تقدير، علامات..."
                        className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">الزمن المخصص (دقائق)</label>
                      <input
                        type="number"
                        value={newToolDuration}
                        onChange={(e) => setNewToolDuration(Number(e.target.value))}
                        className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-bold text-center"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">تعليمات التنفيذ ومؤشرات الأداء أو الأسئلة</label>
                    <textarea
                      rows={2}
                      value={newToolQuestions}
                      onChange={(e) => setNewToolQuestions(e.target.value)}
                      placeholder="اكتب الأسئلة أو مؤشرات الأداء السلوكية القابلة للملاحظة والقياس..."
                      className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-bold leading-relaxed"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button type="button" onClick={() => setIsNewAssessmentFormOpen(false)} className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-bold cursor-pointer">إلغاء</button>
                    <button type="submit" className="px-4 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-black cursor-pointer shadow-xs">اعتماد أداة التقويم</button>
                  </div>
                </form>
              )}

              {/* Assessment Tools List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-black text-slate-800">أدوات التقويم المعتمدة ({toArabicDigits(assessmentTools.length)}):</span>
                  <div className="flex items-center gap-1 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setAssessmentFilterTab('all')}
                      className={`px-2 py-0.5 rounded-md border cursor-pointer ${assessmentFilterTab === 'all' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600'}`}
                    >
                      الكل
                    </button>
                    {(['diagnostic', 'formative', 'summative', 'self_peer'] as AssessmentType[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setAssessmentFilterTab(t)}
                        className={`px-2 py-0.5 rounded-md border cursor-pointer ${assessmentFilterTab === t ? 'bg-emerald-800 text-white' : 'bg-white text-slate-600'}`}
                      >
                        {assessmentTypeInfo(t).label.split(' ')[1] || assessmentTypeInfo(t).label}
                      </button>
                    ))}
                  </div>
                </div>

                {assessmentTools.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">لم يتم إدراج أدوات تقويم بعد.</p>
                ) : (
                  <div className="space-y-2.5 max-h-64 overflow-y-auto">
                    {assessmentTools
                      .filter((tool) => assessmentFilterTab === 'all' || tool.type === assessmentFilterTab)
                      .map((tool) => {
                        const tInfo = assessmentTypeInfo(tool.type);
                        const linkedObj = objectives.find((o) => o.id === tool.linkedObjectiveId);
                        return (
                          <div key={tool.id} className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${tInfo.badge}`}>{tInfo.label}</span>
                                <h5 className="text-xs font-black text-slate-900">{tool.name}</h5>
                              </div>
                              <button type="button" onClick={() => handleDeleteAssessmentTool(tool.id)} className="p-1 text-slate-400 hover:text-rose-700 cursor-pointer" title="حذف الأداة">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <p className="text-xs text-slate-700 leading-relaxed font-bold">{tool.instructions}</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-100 text-slate-600">
                              <div>
                                <span className="font-black text-slate-800">مؤشرات الأداء:</span> {tool.questionsOrIndicators}
                              </div>
                              <div>
                                <span className="font-black text-slate-800">طريقة الرصد:</span> {tool.recordingMethod} ({toArabicDigits(tool.durationMinutes)} د)
                              </div>
                            </div>

                            {linkedObj && (
                              <div className="text-[10px] bg-emerald-50 text-emerald-900 px-2.5 py-1 rounded-lg border border-emerald-200 font-bold truncate">
                                🎯 مرتبطة بالهدف: {linkedObj.text}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>

            {/* Assignments & Applied Tasks Section */}
            <div className="space-y-4 bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200">
                <FileText className="w-5 h-5 text-emerald-700" />
                <span>الواجبات والمهام التطبيقية المنزلية</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800">الواجب المنزلي المقرر:</label>
                  <textarea
                    rows={2}
                    value={assignment.homework}
                    onChange={(e) => setAssignment({ ...assignment, homework: e.target.value })}
                    className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl font-bold leading-relaxed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800">المهمة التطبيقية أو الإثرائية:</label>
                  <textarea
                    rows={2}
                    value={assignment.appliedTask}
                    onChange={(e) => setAssignment({ ...assignment, appliedTask: e.target.value })}
                    className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl font-bold leading-relaxed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800">التعليمات للطلبة:</label>
                  <input
                    type="text"
                    value={assignment.studentInstructions}
                    onChange={(e) => setAssignment({ ...assignment, studentInstructions: e.target.value })}
                    className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800">الموارد اللازمة:</label>
                  <input
                    type="text"
                    value={assignment.requiredResources}
                    onChange={(e) => setAssignment({ ...assignment, requiredResources: e.target.value })}
                    className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800">معايير التقييم:</label>
                  <input
                    type="text"
                    value={assignment.evaluationCriteria}
                    onChange={(e) => setAssignment({ ...assignment, evaluationCriteria: e.target.value })}
                    className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Step 3 Navigation */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setWizardStep(2)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>السابق: الأهداف والكفايات</span>
              </button>

              <button
                type="button"
                onClick={handleProceedFromStep3ToStep4}
                className="px-6 py-2.5 bg-linear-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 shadow-md cursor-pointer"
              >
                <span>متابعة: المراجعة والاعتماد النهائي</span>
                <ArrowLeft className="w-4 h-4 text-emerald-200" />
              </button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 4: المراجعة النهائية والاعتماد (Generation Step)                */}
        {/* ================================================================= */}
        {wizardStep === 4 && (
          <form onSubmit={handleGenerate} className="p-4 sm:p-6 space-y-5 flex-1 overflow-y-auto">
            <div className="bg-emerald-50/90 border border-emerald-300 p-4 rounded-2xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  <span className="text-xs font-black text-emerald-950">
                    ملخص التحضير الشامل (جميع الأقسام مكتملة):
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setWizardStep(3)}
                  className="text-xs text-emerald-800 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>تعديل التقويم والواجبات</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block">الصف والمبحث:</span>
                  <span className="font-bold text-slate-900">{grade} • {subject}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">الفصل والوحدة:</span>
                  <span className="font-bold text-slate-900 truncate block">{semester} • {unitTitle}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">عنوان الدرس:</span>
                  <span className="font-bold text-emerald-900 truncate block">{lessonTitle}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">أدوات التقويم والواجبات:</span>
                  <span className="font-bold text-slate-900">{toArabicDigits(assessmentTools.length)} أدوات قياس</span>
                </div>
              </div>
            </div>

            {/* Template Selection */}
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-2">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>نموذج التخطيط والتحضير المعتمد:</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-right">
                <button
                  type="button"
                  onClick={() => setSelectedTemplateType('executive')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all text-right flex flex-col justify-between cursor-pointer ${
                    selectedTemplateType === 'executive' ? 'bg-emerald-800 text-white border-emerald-800' : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>النموذج التنفيذي الوزاري (الرئيسي)</span>
                    {selectedTemplateType === 'executive' && <CheckCircle2 className="w-4 h-4 text-emerald-300" />}
                  </div>
                  <span className="text-[10px] mt-1 block font-normal opacity-90">خطة الدرس التنفيذية الرسمية (أهداف SMART + أدوات التقويم والواجبات)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTemplateType('adaptive')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all text-right flex flex-col justify-between cursor-pointer ${
                    selectedTemplateType === 'adaptive' ? 'bg-emerald-800 text-white border-emerald-800' : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>النموذج التكيفي الشامل</span>
                    {selectedTemplateType === 'adaptive' && <CheckCircle2 className="w-4 h-4 text-emerald-300" />}
                  </div>
                  <span className="text-[10px] mt-1 block font-normal opacity-90">نموذج التخطيط التكيفي ذو المحاور الستة والتحليل البيداغوجي الموسع</span>
                </button>
              </div>
            </div>

            {/* Final Generation Action */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setWizardStep(3)}
                disabled={loading}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>السابق: التقويم والواجبات</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>جاري التوليد والتحليل التربوي...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>توليد واعتماد الخطة التربوية الشاملة 🚀</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>

      <EducationalStagePickerModal
        isOpen={isStageModalOpen}
        onClose={() => setIsStageModalOpen(false)}
        selectedGrade={grade}
        onSelectGrade={(g) => {
          setGrade(g);
          setValidationErrors((prev) => ({ ...prev, grade: '' }));
        }}
        title="تحديد الصف لجميع المراحل الدراسية (المسار الذكي)"
      />
    </div>
  );
};
