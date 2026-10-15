import { LessonPlan, EducationalResource } from '../types/lessonPlan';
import { formatDateDMY, toArabicDigits } from './arabicNumerals';
import { formatDateToIso } from './palestinianCalendar';

export const STORAGE_KEYS = {
  PLANS: 'educational_expert_lesson_plans_v1',
  ACTIVE_PLAN_ID: 'educational_expert_active_plan_id_v1',
  RESOURCES: 'educational_expert_resources_v1',
  STUDENT_RECORDS: 'abqoor_student_records_v1',
  SUPERVISOR_REVIEWS: 'abqoor_supervisor_reviews_v1',
  PERSONAL_OER: 'palestinian_oer_personal_library_v1',
  SIM_TASKS: 'educational_assessment_sim_tasks_v1',
  DAILY_REMINDERS: 'daily_pedagogical_reminders_v1',
  PINNED_SECTIONS: 'abqoor_pinned_sections_v1',
  SAFETY_SNAPSHOT: 'abqoor_safety_snapshot_before_restore',
};

export interface ComprehensiveBackupData {
  app: string;
  version: string;
  backupType: 'comprehensive' | 'plans_only' | 'emergency';
  exportDate: string;
  exportDateFormatted: string;
  systemName: string;
  author: string;
  totalPlansCount: number;
  totalResourcesCount: number;
  plans: LessonPlan[];
  resources?: EducationalResource[];
  studentRecords?: any[];
  supervisorReviews?: Record<string, any>;
  personalOerLibrary?: any[];
  assessmentTasks?: any[];
  dailyReminders?: any[];
  pinnedSections?: string[];
}

export type BackupData = ComprehensiveBackupData;

export interface SafetySnapshot {
  timestamp: string;
  dateFormatted: string;
  label: string;
  plansCount: number;
  resourcesCount: number;
  data: ComprehensiveBackupData;
}

/**
 * Estimates localStorage usage in KB and safe status.
 */
export function getStorageUsageEstimate(): {
  usedKb: number;
  formattedSize: string;
  isNearLimit: boolean;
  totalPlans: number;
  totalResources: number;
} {
  let totalLength = 0;
  let totalPlans = 0;
  let totalResources = 0;

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const val = localStorage.getItem(key) || '';
        totalLength += key.length + val.length;
        if (key === STORAGE_KEYS.PLANS) {
          try {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) totalPlans = parsed.length;
          } catch (e) {}
        }
        if (key === STORAGE_KEYS.RESOURCES) {
          try {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) totalResources = parsed.length;
          } catch (e) {}
        }
      }
    }
  } catch (e) {
    // In case access is restricted
  }

  const usedKb = Math.round((totalLength * 2) / 1024); // UTF-16 characters = ~2 bytes
  const isNearLimit = usedKb > 4000; // Browsers typically allow 5MB

  return {
    usedKb,
    formattedSize: `${toArabicDigits(usedKb)} ك.ب`,
    isNearLimit,
    totalPlans,
    totalResources,
  };
}

/**
 * Safely sets an item in localStorage with quota error detection.
 */
export function safeSetLocalStorage(key: string, value: string): { success: boolean; error?: string } {
  try {
    localStorage.setItem(key, value);
    return { success: true };
  } catch (err: any) {
    const isQuotaExceeded =
      err?.name === 'QuotaExceededError' ||
      err?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err?.code === 22 ||
      err?.code === 1014;

    const errorMsg = isQuotaExceeded
      ? 'تحذير أمني: نفدت مساحة التخزين المتاحة في المتصفح! يُرجى تصدير نسخة احتياطية فوراً لحماية بياناتك.'
      : `فشل حفظ البيانات في المتصفح: ${err?.message || 'خطأ تخزين غير معروف'}`;

    console.error(`[Abqoor Storage Safe Error]: ${key}`, err);
    return { success: false, error: errorMsg };
  }
}

/**
 * Creates an automatic safety rollback snapshot before any risky restore/replace action.
 */
export function createSafetyRollbackSnapshot(label = 'نقطة استعادة أمان تلقائية قبل الاستيراد'): boolean {
  try {
    const now = new Date();
    const plansRaw = localStorage.getItem(STORAGE_KEYS.PLANS);
    const resourcesRaw = localStorage.getItem(STORAGE_KEYS.RESOURCES);
    const studentsRaw = localStorage.getItem(STORAGE_KEYS.STUDENT_RECORDS);
    const supervisorRaw = localStorage.getItem(STORAGE_KEYS.SUPERVISOR_REVIEWS);
    const personalOerRaw = localStorage.getItem(STORAGE_KEYS.PERSONAL_OER);
    const simTasksRaw = localStorage.getItem(STORAGE_KEYS.SIM_TASKS);
    const dailyRemindersRaw = localStorage.getItem(STORAGE_KEYS.DAILY_REMINDERS);
    const pinnedRaw = localStorage.getItem(STORAGE_KEYS.PINNED_SECTIONS);

    const plans: LessonPlan[] = plansRaw ? JSON.parse(plansRaw) : [];
    const resources: EducationalResource[] = resourcesRaw ? JSON.parse(resourcesRaw) : [];

    const snapshotData: ComprehensiveBackupData = {
      app: 'Abqoor-Educational-Planning-System',
      version: '2.5.0',
      backupType: 'comprehensive',
      exportDate: now.toISOString(),
      exportDateFormatted: formatDateDMY(now),
      systemName: 'منظومة عبقور للتخطيط التربوي وتحضير الدروس',
      author: 'منظومة عبقور',
      totalPlansCount: plans.length,
      totalResourcesCount: resources.length,
      plans,
      resources,
      studentRecords: studentsRaw ? JSON.parse(studentsRaw) : undefined,
      supervisorReviews: supervisorRaw ? JSON.parse(supervisorRaw) : undefined,
      personalOerLibrary: personalOerRaw ? JSON.parse(personalOerRaw) : undefined,
      assessmentTasks: simTasksRaw ? JSON.parse(simTasksRaw) : undefined,
      dailyReminders: dailyRemindersRaw ? JSON.parse(dailyRemindersRaw) : undefined,
      pinnedSections: pinnedRaw ? JSON.parse(pinnedRaw) : undefined,
    };

    const snapshot: SafetySnapshot = {
      timestamp: now.toISOString(),
      dateFormatted: formatDateDMY(now),
      label,
      plansCount: plans.length,
      resourcesCount: resources.length,
      data: snapshotData,
    };

    localStorage.setItem(STORAGE_KEYS.SAFETY_SNAPSHOT, JSON.stringify(snapshot));
    return true;
  } catch (err) {
    console.error('Failed to create safety rollback snapshot:', err);
    return false;
  }
}

/**
 * Retrieves the stored safety rollback snapshot if available.
 */
export function getSafetyRollbackSnapshot(): SafetySnapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAFETY_SNAPSHOT);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.data && Array.isArray(parsed.data.plans)) {
      return parsed as SafetySnapshot;
    }
  } catch (err) {
    console.warn('Failed to read safety rollback snapshot:', err);
  }
  return null;
}

/**
 * Restores all data from the safety rollback snapshot.
 */
export function restoreSafetySnapshot(): {
  success: boolean;
  plans: LessonPlan[];
  resources: EducationalResource[];
  message: string;
} {
  const snapshot = getSafetyRollbackSnapshot();
  if (!snapshot || !snapshot.data) {
    return {
      success: false,
      plans: [],
      resources: [],
      message: 'لم يتم العثور على أي نقطة استعادة أمان سابقة.',
    };
  }

  try {
    const { data } = snapshot;
    if (data.plans) {
      localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(data.plans));
    }
    if (data.resources) {
      localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(data.resources));
    }
    if (data.studentRecords) {
      localStorage.setItem(STORAGE_KEYS.STUDENT_RECORDS, JSON.stringify(data.studentRecords));
    }
    if (data.supervisorReviews) {
      localStorage.setItem(STORAGE_KEYS.SUPERVISOR_REVIEWS, JSON.stringify(data.supervisorReviews));
    }
    if (data.personalOerLibrary) {
      localStorage.setItem(STORAGE_KEYS.PERSONAL_OER, JSON.stringify(data.personalOerLibrary));
    }
    if (data.assessmentTasks) {
      localStorage.setItem(STORAGE_KEYS.SIM_TASKS, JSON.stringify(data.assessmentTasks));
    }
    if (data.dailyReminders) {
      localStorage.setItem(STORAGE_KEYS.DAILY_REMINDERS, JSON.stringify(data.dailyReminders));
    }
    if (data.pinnedSections) {
      localStorage.setItem(STORAGE_KEYS.PINNED_SECTIONS, JSON.stringify(data.pinnedSections));
    }

    return {
      success: true,
      plans: data.plans || [],
      resources: data.resources || [],
      message: `تم التراجع بنجاح إلى نقطة الأمان المؤرخة في (${snapshot.dateFormatted}) واستعادة (${toArabicDigits(
        data.plans.length
      )}) خطة.`,
    };
  } catch (err: any) {
    return {
      success: false,
      plans: [],
      resources: [],
      message: `فشل استرجاع نقطة الأمان: ${err?.message || 'خطأ غير متوقع'}`,
    };
  }
}

/**
 * Downloads a comprehensive backup of all system data: plans, resources, student records,
 * and pedagogical guides as a single verified JSON file.
 */
export function exportAllPlansToJson(plans: LessonPlan[], customResources?: EducationalResource[]): void {
  const now = new Date();
  const dateIso = formatDateToIso(now);
  const dateFormatted = formatDateDMY(now);

  // Retrieve all persistent modules safely
  let resourcesToSave = customResources;
  if (!resourcesToSave) {
    try {
      const resRaw = localStorage.getItem(STORAGE_KEYS.RESOURCES);
      if (resRaw) resourcesToSave = JSON.parse(resRaw);
    } catch (e) {}
  }
  resourcesToSave = resourcesToSave || [];

  let studentRecords: any[] | undefined;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENT_RECORDS);
    if (raw) studentRecords = JSON.parse(raw);
  } catch (e) {}

  let supervisorReviews: Record<string, any> | undefined;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUPERVISOR_REVIEWS);
    if (raw) supervisorReviews = JSON.parse(raw);
  } catch (e) {}

  let personalOerLibrary: any[] | undefined;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PERSONAL_OER);
    if (raw) personalOerLibrary = JSON.parse(raw);
  } catch (e) {}

  let assessmentTasks: any[] | undefined;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SIM_TASKS);
    if (raw) assessmentTasks = JSON.parse(raw);
  } catch (e) {}

  let dailyReminders: any[] | undefined;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DAILY_REMINDERS);
    if (raw) dailyReminders = JSON.parse(raw);
  } catch (e) {}

  let pinnedSections: string[] | undefined;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PINNED_SECTIONS);
    if (raw) pinnedSections = JSON.parse(raw);
  } catch (e) {}

  const backupObject: ComprehensiveBackupData = {
    app: 'Abqoor-Educational-Planning-System',
    version: '2.5.0',
    backupType: 'comprehensive',
    exportDate: now.toISOString(),
    exportDateFormatted: dateFormatted,
    systemName: 'منظومة عبقور للتخطيط التربوي وتحضير الدروس',
    author: 'الأستاذ عبد الرحمن دويكات',
    totalPlansCount: plans.length,
    totalResourcesCount: resourcesToSave.length,
    plans,
    resources: resourcesToSave,
    studentRecords,
    supervisorReviews,
    personalOerLibrary,
    assessmentTasks,
    dailyReminders,
    pinnedSections,
  };

  const jsonString = JSON.stringify(backupObject, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `نسخة_احتياطية_شاملة_منظومة_عبقور_${dateIso}.json`;
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Validates individual plan structure ensuring required fields exist.
 */
function sanitizePlanData(item: any): LessonPlan | null {
  if (!item || typeof item !== 'object' || !item.header) return null;

  const planId = item.id || `plan-imported-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const rawDate = item.header.startDate || item.header.date;
  const validStartDate =
    rawDate && typeof rawDate === 'string' && rawDate.match(/^\d{4}-\d{2}-\d{2}$/)
      ? rawDate
      : formatDateToIso(rawDate || new Date());

  const validEndDate =
    item.header.endDate && typeof item.header.endDate === 'string' && item.header.endDate.match(/^\d{4}-\d{2}-\d{2}$/)
      ? item.header.endDate
      : validStartDate;

  return {
    ...item,
    id: planId,
    title: item.title || item.header.lessonTitle || 'خطة درس مستوردة',
    templateType: item.templateType || 'executive',
    header: {
      ...item.header,
      country: item.header.country || 'دولة فلسطين',
      ministry: item.header.ministry || 'وزارة التربية والتعليم',
      subject: item.header.subject || '',
      grade: item.header.grade || 'الصف الثالث الأساسي',
      section: item.header.section || 'أ',
      lessonTitle: item.header.lessonTitle || item.title || 'درس بدون عنوان',
      startDate: validStartDate,
      endDate: validEndDate,
      date: item.header.date || validStartDate,
    },
    section1: item.section1 || {
      integrativeCompetencies: [],
      studentCharacteristics: { individualDifferences: '', specialNeeds: '', environmentalAdaptation: '' },
      learningResources: { textbook: '', tangibleMedia: '', digitalReadiness: '' },
      ethicsAndSafety: { digitalSafety: '', contentAccuracyAndLanguage: '' },
      reflectiveQuestions: [],
    },
    section2Timeline: Array.isArray(item.section2Timeline) ? item.section2Timeline : [],
    section3Assessment: item.section3Assessment || { graspsModel: {}, formativeEvaluationTools: [], authenticityRubric: [] },
    section4Environment: item.section4Environment || {},
    section5Reflection: item.section5Reflection || {},
    section6Signatures: item.section6Signatures || {},
  };
}

/**
 * Validates and parses imported JSON data, supporting comprehensive backups,
 * emergency backups, legacy arrays, and individual plans.
 */
export function parseAndValidateBackupJson(
  jsonText: string
): {
  success: boolean;
  plans: LessonPlan[];
  resources?: EducationalResource[];
  studentRecords?: any[];
  supervisorReviews?: Record<string, any>;
  personalOerLibrary?: any[];
  assessmentTasks?: any[];
  dailyReminders?: any[];
  metadata?: {
    exportDate?: string;
    systemName?: string;
    totalPlansCount?: number;
    totalResourcesCount?: number;
    backupType?: string;
    isComprehensive?: boolean;
  };
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonText);

    let extractedPlans: any[] = [];
    let extractedResources: EducationalResource[] = [];
    let studentRecords: any[] | undefined;
    let supervisorReviews: Record<string, any> | undefined;
    let personalOerLibrary: any[] | undefined;
    let assessmentTasks: any[] | undefined;
    let dailyReminders: any[] | undefined;

    let metadata: {
      exportDate?: string;
      systemName?: string;
      totalPlansCount?: number;
      totalResourcesCount?: number;
      backupType?: string;
      isComprehensive?: boolean;
    } = {};

    // 1. Comprehensive or Standard Backup format ({ app: "...", plans: [...] })
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.plans)) {
      extractedPlans = parsed.plans;
      if (Array.isArray(parsed.resources)) {
        extractedResources = parsed.resources.filter((r: any) => r && r.id && r.title);
      }
      if (Array.isArray(parsed.studentRecords)) studentRecords = parsed.studentRecords;
      if (parsed.supervisorReviews && typeof parsed.supervisorReviews === 'object') {
        supervisorReviews = parsed.supervisorReviews;
      }
      if (Array.isArray(parsed.personalOerLibrary)) personalOerLibrary = parsed.personalOerLibrary;
      if (Array.isArray(parsed.assessmentTasks)) assessmentTasks = parsed.assessmentTasks;
      if (Array.isArray(parsed.dailyReminders)) dailyReminders = parsed.dailyReminders;

      metadata = {
        exportDate: parsed.exportDateFormatted || parsed.exportDate || parsed.exportedAt,
        systemName: parsed.systemName || parsed.system,
        totalPlansCount: parsed.totalPlansCount || extractedPlans.length,
        totalResourcesCount: extractedResources.length,
        backupType: parsed.backupType || (parsed.type === 'emergency_recovery_backup' ? 'emergency' : 'standard'),
        isComprehensive: extractedResources.length > 0 || !!studentRecords,
      };
    }
    // 2. Direct Array format ([{ id, header... }, ...])
    else if (Array.isArray(parsed)) {
      extractedPlans = parsed;
      metadata = {
        totalPlansCount: extractedPlans.length,
        totalResourcesCount: 0,
        backupType: 'direct_array',
        isComprehensive: false,
      };
    }
    // 3. Single plan format ({ id, header, section1... })
    else if (parsed && typeof parsed === 'object' && parsed.header) {
      extractedPlans = [parsed];
      metadata = {
        totalPlansCount: 1,
        totalResourcesCount: 0,
        backupType: 'single_plan',
        isComprehensive: false,
      };
    } else {
      return {
        success: false,
        plans: [],
        error: 'الملف لا يحتوي على خطط دروس متوافقة مع منظومة عبقور أو هيكل التخطيط التربوي الوزاري.',
      };
    }

    // Sanitize and validate plans
    const validPlans: LessonPlan[] = [];
    for (const item of extractedPlans) {
      const sanitized = sanitizePlanData(item);
      if (sanitized) {
        validPlans.push(sanitized);
      }
    }

    if (validPlans.length === 0) {
      return {
        success: false,
        plans: [],
        error: 'لم يتم العثور على أي خطة درس سليمة وقابلة للاسترجاع داخل الملف المحدد.',
      };
    }

    return {
      success: true,
      plans: validPlans,
      resources: extractedResources,
      studentRecords,
      supervisorReviews,
      personalOerLibrary,
      assessmentTasks,
      dailyReminders,
      metadata: {
        ...metadata,
        totalPlansCount: validPlans.length,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      plans: [],
      error: `تعذر قراءة ملف الـ JSON: ${err?.message || 'تنسيق الملف غير صالح'}`,
    };
  }
}

/**
 * Merges imported plans with existing plans.
 * If replaceAll is true, replaces existing plans (keeping a blank plan if required).
 * If false, updates matching plans by id and appends new ones.
 */
export function mergeImportedPlans(
  currentPlans: LessonPlan[],
  importedPlans: LessonPlan[],
  mode: 'merge' | 'replace' = 'merge'
): LessonPlan[] {
  if (mode === 'replace') {
    return importedPlans;
  }

  // Merge logic: preserve existing plans, update existing if IDs match, append new ones
  const planMap = new Map<string, LessonPlan>();

  // Add existing plans
  currentPlans.forEach((p) => {
    planMap.set(p.id, p);
  });

  // Merge imported plans
  importedPlans.forEach((p) => {
    planMap.set(p.id, p);
  });

  return Array.from(planMap.values());
}

/**
 * Merges imported resources with existing educational resources.
 */
export function mergeImportedResources(
  currentResources: EducationalResource[],
  importedResources: EducationalResource[],
  mode: 'merge' | 'replace' = 'merge'
): EducationalResource[] {
  if (mode === 'replace') {
    return importedResources.length > 0 ? importedResources : currentResources;
  }

  const resMap = new Map<string, EducationalResource>();
  currentResources.forEach((r) => resMap.set(r.id, r));
  importedResources.forEach((r) => resMap.set(r.id, r));

  return Array.from(resMap.values());
}
