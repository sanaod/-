export type WorksheetType =
  | 'comprehensive' // شاملة متدرجة
  | 'formative' // تكوينية صفية
  | 'remedial' // علاجية داعمة
  | 'enrichment' // إثرائية للمتميزين
  | 'exit_eval'; // تقويم ختامي

export interface MultipleChoiceQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  hint?: string;
  points: number;
  selectedOptionIndex?: number;
}

export interface TrueFalseQuestion {
  id: string;
  statement: string;
  isTrue: boolean;
  justification: string;
  points: number;
  userAnswer?: boolean;
}

export interface MatchingPair {
  id: string;
  leftItem: string;
  rightItem: string;
}

export interface FillBlankQuestion {
  id: string;
  textBefore: string;
  blankAnswer: string;
  textAfter: string;
  options?: string[]; // Word bank options
  points: number;
  userAnswer?: string;
}

export interface OpenEndedQuestion {
  id: string;
  question: string;
  contextOrScenario?: string;
  guidingPoints: string[];
  modelAnswer: string;
  points: number;
  userAnswer?: string;
}

export interface ChallengeQuestion {
  id: string;
  title: string;
  problemStatement: string;
  thinkingClues: string[];
  solution: string;
  points: number;
  userAnswer?: string;
}

export interface InteractiveWorksheet {
  id: string;
  planId?: string;
  title: string;
  subject: string;
  grade: string;
  lessonTitle: string;
  schoolName: string;
  teacherName: string;
  date: string;
  type: WorksheetType;
  durationMinutes: number;
  totalPoints: number;
  learningObjectives: string[];
  instructions: string[];
  mcqQuestions: MultipleChoiceQuestion[];
  trueFalseQuestions: TrueFalseQuestion[];
  matchingPairs: MatchingPair[];
  fillBlankQuestions: FillBlankQuestion[];
  openEndedQuestions: OpenEndedQuestion[];
  challengeQuestion?: ChallengeQuestion;
  selfEvaluationCriteria: string[];
  parentNote?: string;
  createdAt: string;
}
