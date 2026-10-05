import { LessonPlan } from '../types/lessonPlan';
import { formatDateDMY, toArabicDigits } from './arabicNumerals';
import { formatDateToIso, parseDateSafely } from './palestinianCalendar';

export interface BackupData {
  app: string;
  version: string;
  exportDate: string;
  exportDateFormatted: string;
  systemName: string;
  author: string;
  totalPlansCount: number;
  plans: LessonPlan[];
}

/**
 * Downloads a backup of all saved lesson plans as a single formatted JSON file.
 */
export function exportAllPlansToJson(plans: LessonPlan[]): void {
  const now = new Date();
  const dateIso = formatDateToIso(now);
  const dateFormatted = formatDateDMY(now);

  const backupObject: BackupData = {
    app: 'Abqoor-Educational-Planning-System',
    version: '2.0.0',
    exportDate: now.toISOString(),
    exportDateFormatted: dateFormatted,
    systemName: 'منظومة عبقور للتخطيط التربوي وتحضير الدروس',
    author: 'الأستاذ عبد الرحمن دويكات',
    totalPlansCount: plans.length,
    plans,
  };

  const jsonString = JSON.stringify(backupObject, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `نسخة_احتياطية_كافة_خطط_منظومة_عبقور_${dateIso}.json`;
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Validates and parses imported JSON data, supporting both full backup format and individual plan arrays.
 */
export function parseAndValidateBackupJson(
  jsonText: string
): {
  success: boolean;
  plans: LessonPlan[];
  error?: string;
  metadata?: {
    exportDate?: string;
    systemName?: string;
    totalCount?: number;
  };
} {
  try {
    const parsed = JSON.parse(jsonText);

    let extractedPlans: LessonPlan[] = [];
    let metadata: { exportDate?: string; systemName?: string; totalCount?: number } = {};

    // 1. Full Backup format ({ app: "...", plans: [...] })
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.plans)) {
      extractedPlans = parsed.plans;
      metadata = {
        exportDate: parsed.exportDateFormatted || parsed.exportDate,
        systemName: parsed.systemName,
        totalCount: parsed.totalPlansCount,
      };
    }
    // 2. Direct Array format ([{ id, header... }, ...])
    else if (Array.isArray(parsed)) {
      extractedPlans = parsed;
    }
    // 3. Single plan format ({ id, header, section1... })
    else if (parsed && typeof parsed === 'object' && parsed.header && parsed.section1) {
      extractedPlans = [parsed as LessonPlan];
    } else {
      return {
        success: false,
        plans: [],
        error: 'الملف لا يحتوي على خطط دروس متوافقة مع منظومة عبقور أو هيكل التخطيط التربوي الوزاري.',
      };
    }

    // Sanitize and validate extracted plans
    const validPlans: LessonPlan[] = [];

    for (const item of extractedPlans) {
      if (item && typeof item === 'object' && item.header) {
        // Ensure valid ID
        const planId = item.id || `plan-imported-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        
        // Sanitize dates in header
        const rawDate = item.header.startDate || item.header.date;
        const validStartDate = rawDate && typeof rawDate === 'string' && rawDate.match(/^\d{4}-\d{2}-\d{2}$/)
          ? rawDate
          : formatDateToIso(rawDate || new Date());
        
        const validEndDate = item.header.endDate && typeof item.header.endDate === 'string' && item.header.endDate.match(/^\d{4}-\d{2}-\d{2}$/)
          ? item.header.endDate
          : validStartDate;

        validPlans.push({
          ...item,
          id: planId,
          title: item.title || item.header.lessonTitle || 'خطة درس مستوردة',
          header: {
            ...item.header,
            startDate: validStartDate,
            endDate: validEndDate,
            date: item.header.date || validStartDate,
          },
        });
      }
    }

    if (validPlans.length === 0) {
      return {
        success: false,
        plans: [],
        error: 'لم يتم العثور على أي خطة درس سليمة داخل الملف المحدد.',
      };
    }

    return {
      success: true,
      plans: validPlans,
      metadata,
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
