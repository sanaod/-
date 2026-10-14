/**
 * Smart Pedagogical Guide & Compliance Checker Types
 * منظومة عبقور — المساعد التربوي الذكي ووحدة فحص التوافق
 */

import { ObservablePerformanceIndicator, SuggestedLearningSituation, SuggestedResourceLink } from './palestinianCompetencies';
import { EducationalResource, OerResourceItem } from './lessonPlan';

export interface TargetedCompetencySuggestion {
  generalCompetency: {
    code: string;
    title: string;
    statement: string;
    domainLabel: string;
  };
  specificCompetency: {
    code: string;
    title: string;
    statement: string;
    subject: string;
  };
}

export interface MeasurableObjectiveOption {
  id: string;
  type: 'cognitive' | 'skill' | 'affective' | 'competency_based';
  typeLabel: string;                      // معرفي استيعابي / مهاري إجرائي / قيمي واتجاهي
  objectiveStatement: string;             // صياغة الهدف السلوكي
  performanceIndicator: string;           // مؤشر الأداء القابل للملاحظة والقياس
  suggestedAssessmentMethod: string;      // طريقة وأداة التقويم المقترحة
  isSelected: boolean;
  isCustom?: boolean;
}

export interface CurriculumResourceTriad {
  primaryResource: {
    id: string;
    title: string;
    provider: string;                     // البوابة التعليمية الفلسطينية elearn.edu.ps / كتاب المنهاج
    url: string;
    type: string;
    pedagogicalNotes: string;
  };
  alternativeResource1: {
    id: string;
    title: string;
    provider: string;                     // منصة منهاجي / منصة روافد
    url: string;
    type: string;
    pedagogicalNotes: string;
  };
  alternativeResource2: {
    id: string;
    title: string;
    provider: string;                     // مكتبة المحتوى الفلسطيني / خامات بيئية محلية
    url: string;
    type: string;
    pedagogicalNotes: string;
  };
}

export interface LearningSituationStep {
  stepNumber: number;
  phaseName: string;                      // التمهيد والاستثارة / الاستكشاف والاستقصاء / البناء والتطبيق / الختام والتقويم
  durationMinutes: number;
  teacherAction: string;
  studentAction: string;
  expectedProducts: string[];
}

export interface CompleteLearningSituationSuggestion {
  title: string;
  contextDescription: string;
  authenticPalestineContext: string;
  totalDurationMinutes: number;
  steps: LearningSituationStep[];
  expectedProducts: string[];
}

export interface DifferentiatedActivitiesSuggestion {
  supportActivities: {
    id: string;
    title: string;
    strategy: string;                    // نمذجة محسوسة / تعلم بالقرين / تبسيط خطوات
    description: string;
    materialsNeeded: string;
  }[];
  enrichmentActivities: {
    id: string;
    title: string;
    challengeType: string;               // مسألة غير روتينية / مشروع تطبيقي / استقصاء بيئي
    description: string;
  }[];
}

export interface SmartPedagogicalSuggestionPackage {
  id: string;
  lessonContext: {
    subject: string;
    grade: string;
    lessonTitle: string;
    topic: string;
  };
  targetCompetencies: TargetedCompetencySuggestion;
  objectiveOptions: MeasurableObjectiveOption[];
  resourcesTriad: CurriculumResourceTriad;
  learningSituation: CompleteLearningSituationSuggestion;
  differentiatedActivities: DifferentiatedActivitiesSuggestion;
  generatedDate: string;
  isAiEnhanced?: boolean;
}

export type ComplianceWarningCategory =
  | 'single_source'            // الاعتماد على مصدر واحد فقط
  | 'unlinked_competency'      // عدم ربط النشاط بكفاية مستهدفة
  | 'external_source'          // استخدام مصدر خارج المنهاج المقرر
  | 'unclear_assessment';      // عدم وضوح مؤشرات التقويم

export interface ComplianceWarning {
  id: string;
  category: ComplianceWarningCategory;
  severity: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  pedagogicalRationale: string;
  suggestedFix: string;
  quickFixData?: any;
}

export interface PedagogicalComplianceAuditResult {
  overallScore: number;                   // 0 - 100
  status: 'compliant' | 'needs_attention' | 'critical_gaps';
  statusLabel: string;
  warnings: ComplianceWarning[];
  passedChecks: {
    id: string;
    title: string;
    description: string;
  }[];
  lastAuditDate: string;
}
