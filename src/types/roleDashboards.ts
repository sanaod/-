/**
 * Multi-Role Dashboard & OER Application Types
 * منظومة عبقور — لوحات التحكم المخصصة وتقارير التعليم المفتوح
 */

import { LessonPlan } from './lessonPlan';

export type UserRole = 'teacher' | 'supervisor' | 'principal';

export type StudentCompetencyMasteryLevel = 'mastered' | 'developing' | 'needs_support';

export interface StudentCompetencyRecord {
  id: string;
  studentName: string;
  studentNumber?: string;
  grade: string;
  section: string;
  subject: string;
  competencyCode: string;
  competencyTitle: string;
  masteryLevel: StudentCompetencyMasteryLevel;
  observedIndicator: string;
  assessmentDate: string;
  teacherNotes?: string;
  supportPlanSuggested?: string;
}

export interface TeacherOerApplicationStatus {
  id: string;
  teacherName: string;
  subject: string;
  grade: string;
  school: string;
  directorate: string;
  completedPlansCount: number;
  sourceDiversityScore: number;          // 0 - 100%
  competencyClarityScore: number;        // 0 - 100%
  oerComplianceScore: number;            // 0 - 100%
  status: 'approved' | 'needs_revision' | 'in_review';
  statusLabel: string;
  latestPlanId: string;
  latestPlanTitle: string;
  supervisorNotes?: string;
  sectionToRevise?: string;
  lastUpdated: string;
}

export interface SupervisorReviewAction {
  planId: string;
  status: 'approved' | 'needs_revision';
  supervisorName: string;
  directives: string;
  sectionToRevise?: 'section1_competencies' | 'section2_learning_situation' | 'section3_assessment' | 'resources_triad' | 'general';
  reviewDate: string;
  referenceToGuideChapter?: string;      // رقم الفصل أو البند في دليل المعلم لمصادر OER
}

export interface SchoolOerMetrics {
  schoolName: string;
  directorate: string;
  academicYear: string;
  totalTeachers: number;
  activeOerTeachers: number;
  schoolCommitmentRate: number;          // نسبة التزام المدرسة بتطبيق OER (0 - 100%)
  grades1To4CoverageRate: number;        // نسبة تغطية الصفوف 1-4 (0 - 100%)
  totalPlansCount: number;
  approvedPlansCount: number;
  pendingPlansCount: number;
  needsRevisionCount: number;
  totalUniqueResourcesCount: number;
  selfAddedResourcesCount: number;
  primaryOerUsageCount: number;
  alternative1UsageCount: number;
  alternative2UsageCount: number;
  monthlyTrends: {
    monthName: string;
    plansCreated: number;
    adherenceRate: number;
  }[];
  gradeCoverageBreakdown: {
    grade: string;
    plansCount: number;
    coveragePct: number;
    isPrimaryStage: boolean;             // الصفوف 1-4
  }[];
}

export type ReportType = 
  | 'official_lesson_plan'
  | 'student_competencies_record'
  | 'school_oer_statistics';

export type ReportExportFormat = 'pdf' | 'word' | 'excel' | 'share_link';
