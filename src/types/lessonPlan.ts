export interface LessonHeader {
  country: string;
  ministry: string;
  school: string;
  directorate: string;
  teacherName: string;
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
    startYear: string;
    endDay: string;
    endDate: string;
    endYear: string;
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

export const STANDARD_GRADES = [
  'الصف الأول',
  'الصف الثاني',
  'الصف الأول الأساسي',
  'الصف الثاني الأساسي',
  'الصف الثالث الأساسي',
  'الرابع الأساسي',
  'الخامس الأساسي',
  'السادس الأساسي',
  'السابع الأساسي',
  'الثامن الأساسي',
  'التاسع الأساسي',
  'العاشر الأساسي',
];
