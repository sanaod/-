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
  totalPeriods: number;
  currentPeriod: number;
  periodDurationMinutes: number;
  date: string;
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

export type ResourceType = 'textbook' | 'document' | 'link' | 'standard' | 'image' | 'note';

export interface EducationalResource {
  id: string;
  type: ResourceType;
  title: string;
  content: string;
  sourceInfo?: string;
  createdAt: string;
  tags?: string[];
  fileSize?: string;
  inferredSubject?: string;
  inferredGrade?: string;
  inferredLessonTitle?: string;
}

export interface LessonPlan {
  id: string;
  title: string;
  header: LessonHeader;
  section1: Section1AdaptivePlanning;
  section2Timeline: LessonPhase[];
  section3Assessment: Section3ContinuousAssessment;
  section4Environment: Section4LearningEnvironment;
  section5Reflection: Section5SelfReflection;
  section6Signatures: Section6Signatures;
  attachedResources?: EducationalResource[];
}
