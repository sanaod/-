/**
 * إطار الكفايات الوطنية الفلسطينية - وزارة التربية والتعليم العالي
 * Palestinian National Competencies Framework Types
 */

export type GeneralCompetencyDomain =
  | 'communication'               // تواصل
  | 'critical_thinking'          // تفكير ناقد وحل المشكلات
  | 'creativity'                 // إبداع وابتكار
  | 'participation_responsibility'; // مشاركة ومسؤولية ومواطنة

export type CompetencyCategoryType = 'general' | 'subject_specific';

export type PerformanceMeasurementLevel =
  | 'beginner'       // مبتدئ
  | 'developing'     // نامٍ
  | 'competent'      // كفء
  | 'distinguished'; // متميز

export interface ObservablePerformanceIndicator {
  id: string;
  code: string;                           // كود المؤشر (مثال: IND-CRIT-01)
  statement: string;                      // صياغة المؤشر السلوكي الإجرائي
  observableAction: string;               // السلوك القابل للملاحظة والقياس في الغرفة الصفية
  suggestedAssessmentMethod: string;      // أسلوب التقويم (ملاحظة مباشرة / سلم تقدير / قائمة شطب / مهمة أدائية)
  levelDescriptors?: {
    beginner: string;
    developing: string;
    competent: string;
    distinguished: string;
  };
}

export interface SuggestedLearningSituation {
  id: string;
  title: string;                          // عنوان الموقف التعليمي أو المهمة الواقعية
  contextDescription: string;             // سياق الموقف التعليمي التعلّمي
  teacherRole: string;                    // دور المعلم (توجيه، تيسير، حوار)
  studentRole: string;                    // دور الطالب (استقصاء، عمل جماعي، عرض)
  durationMinutes: number;                // المدة المقترحة
  authenticPalestineContext?: string;     // ارتباط الموقف بالواقع الفلسطيني والبيئة المحلية
  assessmentOpportunity: string;          // فرصة التقويم المتاحة في الموقف
}

export interface SuggestedResourceLink {
  id: string;
  title: string;
  provider: 'elearn_edu_ps' | 'minhaji' | 'rawafed' | 'pal_library' | 'moe_curriculum' | 'other';
  providerLabel: string;
  url: string;
  type: 'video' | 'interactive' | 'worksheet' | 'simulation' | 'guide' | 'textbook' | 'article';
}

export interface CompetencyItem {
  id: string;
  code: string;                           // مثل: COMP-GEN-COMM-01 أو COMP-MATH-G4-01
  category: CompetencyCategoryType;       // عامة أو تخصصية خاصة بمادة
  domain: GeneralCompetencyDomain | 'subject_domain';
  domainLabel: string;                    // اسم المجال (تواصل، تفكير ناقد، إبداع، مسؤولية ومواطنة، كفايات المادة)
  title: string;                          // عنوان الكفاية الأساسية
  statement: string;                      // النص الكامل للكفاية وفق دليل الوزارة
  subject: string;                        // المادة الدراسية (مثل: الرياضيات، العلوم، اللغة العربية، أو "جميع المباحث")
  grades: string[];                       // الصفوف المستهدفة (مثال: ["الصف الأول", "الصف الثاني", ...] أو ["جميع الصفوف"])
  stage: 'primary' | 'middle' | 'secondary' | 'all'; // المرحلة التعليمية
  topics: string[];                       // الموضوعات والوحدات المرتبطة
  performanceIndicators: ObservablePerformanceIndicator[]; // مؤشرات الأداء القابلة للملاحظة والقياس
  learningSituations: SuggestedLearningSituation[];        // المواقف التعليمية المقترحة
  suggestedResources: SuggestedResourceLink[];             // المصادر المرتبطة المقترحة
  officialReference: string;              // رقم الصفحة أو الوثيقة في إطار الوزارة
  versionDate: string;                    // تاريخ إصدار/تحديث الكفاية
  lastModifiedBy?: 'ministry' | 'teacher_admin';
  isCustom?: boolean;                     // هل أضافها المعلم محلياً أو عدلها
}

export interface MinistryFrameworkMeta {
  frameworkName: string;                  // الإطار الوطني الفلسطيني للكفايات والتقويم التربوي
  authority: string;                      // وزارة التربية والتعليم العالي - دولة فلسطين
  version: string;                        // رقم الإصدار (مثل 2026.2)
  officialCircular: string;               // رقم التعميم الوزاري الرسمي
  issuanceDate: string;                   // تاريخ الاعتماد
  totalCompetenciesCount: number;
  description: string;
}

export interface CompetencyCoverageReport {
  totalTargetCompetencies: number;
  coveredCompetenciesCount: number;
  coveragePercentage: number;
  generalCompetenciesCoverage: {
    domain: GeneralCompetencyDomain;
    domainLabel: string;
    total: number;
    covered: number;
    percentage: number;
  }[];
  subjectCompetenciesCoverage: {
    subject: string;
    total: number;
    covered: number;
    percentage: number;
  };
  coveredCompetencyIds: string[];
  uncoveredCompetencies: CompetencyItem[];
  plansAnalyzedCount: number;
}
