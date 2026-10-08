import { LessonPlan } from '../types/lessonPlan';

export interface SmartPlanAlert {
  id: string;
  planId: string;
  title: string;
  subject: string;
  grade: string;
  teacherName: string;
  dueDate: string; // YYYY-MM-DD
  daysRemaining: number; // negative = overdue, 0 = today, positive = upcoming
  urgency: 'overdue' | 'urgent_today' | 'upcoming_soon' | 'normal';
  message: string;
  category: 'lesson_delivery' | 'unit_plan' | 'assessment_task' | 'reflection';
}

/**
 * Analyzes all saved lesson plans and generates smart date-based deadline and execution alerts.
 */
export function generateSmartPlanAlerts(plans: LessonPlan[]): SmartPlanAlert[] {
  const alerts: SmartPlanAlert[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  plans.forEach((plan, idx) => {
    const lessonDateStr = plan.header?.date || plan.header?.startDate;
    if (!lessonDateStr) return;

    const dueDate = new Date(lessonDateStr);
    if (isNaN(dueDate.getTime())) return;
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    const daysRemaining = Math.round(diffTime / (1000 * 60 * 60 * 24));

    // We flag plans that are overdue, today, or due within the next 5 days
    let urgency: SmartPlanAlert['urgency'] = 'normal';
    if (daysRemaining < 0) {
      urgency = 'overdue';
    } else if (daysRemaining === 0) {
      urgency = 'urgent_today';
    } else if (daysRemaining <= 5) {
      urgency = 'upcoming_soon';
    } else {
      return; // Skip plans far in the future to keep the notification center focused on immediate tasks
    }

    const title = plan.header?.lessonTitle || plan.title || `خطة درس #${idx + 1}`;
    const subject = plan.header?.subject || 'المبحث العام';
    const grade = plan.header?.grade || 'الصف';
    const teacherName = plan.header?.teacherName || 'المعلم';

    let message = '';
    if (daysRemaining < 0) {
      message = `مضى موعد التنفيذ المحدد قبل ${Math.abs(daysRemaining)} يوم (تاريخ الخطة: ${lessonDateStr})`;
    } else if (daysRemaining === 0) {
      message = `موعد تنفيذ الدرس واستحقاق التحضير هو **اليوم** (${lessonDateStr})`;
    } else {
      message = `متبقي ${daysRemaining} أيام على موعد التنفيذ المقرّر (${lessonDateStr})`;
    }

    alerts.push({
      id: `alert-${plan.id || idx}-${lessonDateStr}`,
      planId: plan.id,
      title,
      subject,
      grade,
      teacherName,
      dueDate: lessonDateStr,
      daysRemaining,
      urgency,
      message,
      category: 'lesson_delivery',
    });
  });

  // Sort by urgency: overdue first, then today, then upcoming soon
  const urgencyWeight = { overdue: 0, urgent_today: 1, upcoming_soon: 2, normal: 3 };
  return alerts.sort((a, b) => {
    if (urgencyWeight[a.urgency] !== urgencyWeight[b.urgency]) {
      return urgencyWeight[a.urgency] - urgencyWeight[b.urgency];
    }
    return a.daysRemaining - b.daysRemaining;
  });
}
