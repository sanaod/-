export interface LessonHeader {
  country: string;
  ministry: string;
  school: string;
  directorate: string;
  teacherName: string;
  principalName?: string;
  supervisorName?: string;
  subject: string;
  grade: string;
  section: string;
  lessonTitle: string;
  unitTitle?: string;
  totalPeriods: number;
  currentPeriod: number;
  periodDurationMinutes: number;
  date: string;
  startDate?: string;
  endDate?: string;
  timeframe?: string;
  semester: string;
}

export interface Section1AdaptivePlanning {
  integrativeCompetencies: {
    title: string;
    description: string;
  }[];
  studentCharacteristics: {
    individualDifferences: string;
    specialNeeds: string;
    environmentalAdaptation: string;
  };
  learningResources: {
    textbook: string;
    tangibleMedia: string;
    digitalReadiness: string;
  };
  ethicsAndSafety: {
    digitalSafety: string;
    contentAccuracyAndLanguage: string;
  };
  reflectiveQuestions: string[];
}

export interface LessonPhase {
  id: string;
  phaseName: string;
  durationMinutes: number;
  teacherAndStudentActions: string[];
  strategiesAndResources: string[];
  assessmentAndFeedback: string[];
}

export interface RubricCriterion {
  criterion: string;
  level1: string; // مبتدئ
  level2: string; // نامٍ
  level3: string; // كفء
  level4: string; // متميز
}

export interface Section3ContinuousAssessment {
  graspsTask: {
    title: string;
    role: string;
    audience: string;
    situation: string;
    product: string;
    standards: string;
    fullDescription: string;
  };
  rubric: RubricCriterion[];
  remedialActivities: {
    title: string;
    description: string;
  }[];
  enrichmentActivities: {
    title: string;
    puzzleOrChallenge: string;
    peerTutoring: string;
  };
  immediateFeedback: string[];
}

export interface Section4LearningEnvironment {
  classroomRoutines: string;
  safeAndMotivatingClimate: string;
  familyPartnership: {
    cardTitle: string;
    instructions: string;
    studentTask: string;
    parentRole: string;
  };
}

export interface Section5SelfReflection {
  strengthsAndImpact: string[];
  improvementOpportunities: string;
  professionalLearningCommunities: string;
}

export interface Section6Signatures {
  teacher: {
    name: string;
    date: string;
    notes: string;
  };
  schoolPrincipal: {
    name: string;
    date: string;
    directives: string;
  };
  educationalSupervisor: {
    name: string;
    date: string;
    directives: string;
  };
}

export type ResourceType =
  | 'textbook'
  | 'curriculum_guide'
  | 'worksheet'
  | 'document'
  | 'presentation'
  | 'spreadsheet'
  | 'image'
  | 'audio'
  | 'video'
  | 'exam'
  | 'link'
  | 'standard'
  | 'note';

export interface EducationalResource {
  id: string;
  type: ResourceType;
  title: string;
  content: string;
  sourceInfo?: string;
  createdAt: string;
  tags?: string[];
  fileSize?: string;
  fileName?: string;
  fileExt?: string;
  fileDataUrl?: string;
  inferredSubject?: string;
  inferredGrade?: string;
  inferredLessonTitle?: string;
}

export type PlanTemplateType = 'executive' | 'adaptive';

export interface ExecutiveResourceConditions {
  competencyAlignment: boolean;    // الارتباط بالكفايات
  contentAccuracy: boolean;        // دقة المحتوى
  languageIntegrity: boolean;      // سلامة اللغة
  ageAppropriate: boolean;         // المواءمة مع المرحلة العمرية
  palestinianCulture: boolean;     // المواءمة مع الثقافة الفلسطينية
  integrationValues: boolean;      // تعزيز التكامل والمواطنة والقيم والأخلاق
}

export interface ExecutiveGraspsDetails {
  goal: string;        // الهدف (Goal)
  role: string;        // الدور (Role)
  audience: string;    // الجمهور (Audience)
  situation: string;   // الموقف (Situation)
  performance: string; // الأداء والمنتج (Performance)
  standards: string;   // المعايير (Standards)
  steps: string[];     // خطوات تنفيذ المهمة
  rubricScaleNote: string; // مقياس متدرج لتقويم أداء الطلبة
}

export interface ExecutiveClosureOptions {
  worksheet: boolean;             // ورقة عمل تفاعلية
  videoSummary: boolean;          // فيديو يلخص الحصة
  posterOrSummaryBoard: boolean;  // ملصق / صورة / لوحة ملخصة
  learnedCards: boolean;          // بطاقات يكتب فيها ما تم تعلمه
  keyQuestionsCards: boolean;     // بطاقات يجيب فيها الطلبة عن الأسئلة الرئيسة
  closingCompetitions: boolean;   // مسابقات تعليمية ختامية
}

export interface ExecutiveStage {
  id: number;
  stageName: string; // المرحلة المحددة بالوثيقة
  goals: string;     // الأهداف
  procedures: {
    mainDescription: string;
    resourceName?: string;
    reflectiveQuestionsExample?: string;
    resourceConditions?: ExecutiveResourceConditions;
    activeLearningMethods?: string;
    studentProducts?: string;
    grasps?: ExecutiveGraspsDetails;
    howWorksheetUsed?: string;
    immediateFeedback?: string;
    closureOptions?: ExecutiveClosureOptions;
  };
  assessment: string;
  resourcesAndTools: string;
  durationMinutes: number;
}

export interface ExecutivePlanData {
  timeframeDetails: {
    startDay: string;
    startDate: string;
    startYear?: string;
    startSemester?: string; // الفصل الدراسي: e.g. "الفصل الدراسي الأول"
    endDay: string;
    endDate: string;
    endYear?: string;
    endSemester?: string;   // الفصل الدراسي: e.g. "الفصل الدراسي الأول"
    autoUpdateDate?: boolean; // خيار تحديث التاريخ تلقائياً
  };
  learningCompetencies: string;           // كفايات التعلّم: المهارات والمعارف الأساسية الخاصة بالمبحث
  valuesAndEthics: string;                // القيم والأخلاق المراد تعزيزها: المواطنة، التعاون، الأمانة، المهارات الحياتية
  studentCharacteristicsAnalysis: string; // تحليل خصائص الطلبة
  environmentalAnalysis: string;          // تحليل البيئة المحيطة
  smartObjectives: string[];              // أهداف ذكية (SMART Objectives)
  executiveStages: ExecutiveStage[];      // مراحل جدول تفاصيل خطة التنفيذ التنفيذية للدرس (الـ 5 مراحل)
  teacherReflection: {
    strengths: string;                    // نقاط القوة في تنفيذ الدرس
    improvementsNeeded: string;           // جوانب تحتاج إلى تحسين وتطوير
    futureSuggestions: string;            // مقترحات للدروس القادمة
  };
}

export interface LessonPlan {
  id: string;
  title: string;
  templateType?: PlanTemplateType;
  header: LessonHeader;
  section1: Section1AdaptivePlanning;
  section2Timeline: LessonPhase[];
  section3Assessment: Section3ContinuousAssessment;
  section4Environment: Section4LearningEnvironment;
  section5Reflection: Section5SelfReflection;
  section6Signatures: Section6Signatures;
  executiveData?: ExecutivePlanData;
  attachedResources?: EducationalResource[];
}

export interface EducationalStageGroup {
  id: string;
  name: string;
  shortName: string;
  badgeColor: string;
  grades: string[];
}

export const EDUCATIONAL_STAGES: EducationalStageGroup[] = [
  {
    id: 'early_childhood',
    name: 'مرحلة رياض الأطفال والطفولة المبكرة',
    shortName: 'رياض الأطفال',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    grades: [
      'الروضة (تمهيدي)',
      'الروضة (بستان)',
      'التهيئة المبكرة (الطفولة المبكرة)',
    ],
  },
  {
    id: 'primary_lower',
    name: 'المرحلة الأساسية الدنيا (الصفوف ١ - ٤)',
    shortName: 'الأساسية الدنيا (١-٤)',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    grades: [
      'الصف الأول الأساسي',
      'الصف الثاني الأساسي',
      'الصف الثالث الأساسي',
      'الصف الرابع الأساسي',
    ],
  },
  {
    id: 'primary_upper',
    name: 'المرحلة الأساسية العليا (الصفوف ٥ - ٩)',
    shortName: 'الأساسية العليا (٥-٩)',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    grades: [
      'الصف الخامس الأساسي',
      'الصف السادس الأساسي',
      'الصف السابع الأساسي',
      'الصف الثامن الأساسي',
      'الصف التاسع الأساسي',
    ],
  },
  {
    id: 'secondary',
    name: 'المرحلة الثانوية (الصفوف ١٠ - ١٢ وتوجيهي)',
    shortName: 'الثانوية (١٠-١٢)',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    grades: [
      'الصف العاشر الأساسي',
      'الصف الحادي عشر (العلمي)',
      'الصف الحادي عشر (الأدبي)',
      'الصف الحادي عشر (الريادة والأعمال)',
      'الصف الحادي عشر (التكنولوجي والمهني)',
      'الصف الثاني عشر (التوجيهي - العلمي)',
      'الصف الثاني عشر (التوجيهي - الأدبي)',
      'الصف الثاني عشر (التوجيهي - الريادة والأعمال)',
      'الصف الثاني عشر (التوجيهي - التكنولوجي والمهني)',
      'الصف الثاني عشر (التوجيهي - الشرعي)',
    ],
  },
];

export const STANDARD_GRADES: string[] = [
  // رياض الأطفال
  'الروضة (تمهيدي)',
  'الروضة (بستان)',
  // الأساسية الدنيا
  'الصف الأول الأساسي',
  'الصف الثاني الأساسي',
  'الصف الثالث الأساسي',
  'الصف الرابع الأساسي',
  // الأساسية العليا
  'الصف الخامس الأساسي',
  'الصف السادس الأساسي',
  'الصف السابع الأساسي',
  'الصف الثامن الأساسي',
  'الصف التاسع الأساسي',
  // الثانوية والتوجيهي
  'الصف العاشر الأساسي',
  'الصف الحادي عشر (العلمي)',
  'الصف الحادي عشر (الأدبي)',
  'الصف الحادي عشر (الريادة والأعمال)',
  'الصف الحادي عشر (التكنولوجي والمهني)',
  'الصف الثاني عشر (التوجيهي - العلمي)',
  'الصف الثاني عشر (التوجيهي - الأدبي)',
  'الصف الثاني عشر (التوجيهي - الريادة والأعمال)',
  'الصف الثاني عشر (التوجيهي - التكنولوجي والمهني)',
  'الصف الثاني عشر (التوجيهي - الشرعي)',
  // أسماء شائعة ومختصرة للتوافق مع الخطط السابقة
  'الصف الأول',
  'الصف الثاني',
  'الرابع الأساسي',
  'الخامس الأساسي',
  'السادس الأساسي',
  'السابع الأساسي',
  'الثامن الأساسي',
  'التاسع الأساسي',
];

