import { DailyPedagogicalReminder } from '../types/dailyReminder';
import { LessonPlan } from '../types/lessonPlan';
import { formatDateToIso } from './palestinianCalendar';

const STORAGE_KEY = 'teacher_daily_pedagogical_reminders_v1';

export const loadDailyReminders = (plans: LessonPlan[] = []): DailyPedagogicalReminder[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load reminders from localStorage:', err);
  }

  // Seed intelligent initial reminders connected to actual plans if empty
  const today = new Date();
  const todayStr = formatDateToIso(today);
  const tomorrowStr = formatDateToIso(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1));
  const afterTomorrowStr = formatDateToIso(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2));

  const plan1 = plans[0];
  const plan2 = plans[1] || plans[0];

  const seed: DailyPedagogicalReminder[] = [
    {
      id: `rem-seed-1`,
      title: plan1 ? `تجهيز بطاقات الخروج Exit Tickets لدرس ${plan1.header.lessonTitle}` : 'تجهيز بطاقات الخروج ومحسوسات الدرس',
      date: todayStr,
      time: '08:15 ص',
      note: 'طباعة تذاكر الخروج وتجهيز المجموعات التشاركية وتوزيع سلم التقدير اللفظي لتقويم الطلبة في ختام الحصة.',
      linkedPlanId: plan1?.id,
      linkedPlanTitle: plan1?.header.lessonTitle || plan1?.title,
      linkedSubject: plan1?.header.subject || 'الرياضيات',
      linkedGrade: plan1?.header.grade || 'الصف الثالث الأساسي',
      category: 'formative_eval',
      priority: 'high',
      completed: false,
      tags: ['تقويم تكويني', 'بطاقات خروج'],
      createdAt: new Date().toISOString(),
    },
    {
      id: `rem-seed-2`,
      title: 'مراجعة أدوات المحاكي التفاعلي والمعداد الصيني الرقمي',
      date: todayStr,
      time: '10:00 ص',
      note: 'التأكد من تشغيل شاشة العرض التفاعلية وتجهيز رابط محاكي المعداد لتطبيقه مع نشاط النمذجة بالمحسوسات.',
      linkedPlanId: plan1?.id,
      linkedPlanTitle: plan1?.header.lessonTitle || plan1?.title,
      linkedSubject: plan1?.header.subject || 'الرياضيات',
      linkedGrade: plan1?.header.grade || 'الصف الثالث الأساسي',
      category: 'resources',
      priority: 'medium',
      completed: false,
      tags: ['محاكاة', 'وسائل رقمية'],
      createdAt: new Date().toISOString(),
    },
    {
      id: `rem-seed-3`,
      title: plan2 ? `متابعة المهمة الأدائية الأصيلة (GRASPS) لدرس ${plan2.header.lessonTitle}` : 'تطبيق مهمة الأداء الأصيل GRASPS',
      date: tomorrowStr,
      time: '09:30 ص',
      note: 'مراجعة معايير سلم التقدير (Rubric) وتوثيق نماذج إجابات الطلبة المميزة في ملف الإنجاز (Portfolio).',
      linkedPlanId: plan2?.id,
      linkedPlanTitle: plan2?.header.lessonTitle || plan2?.title,
      linkedSubject: plan2?.header.subject || 'الرياضيات',
      linkedGrade: plan2?.header.grade || 'الصف الثالث الأساسي',
      category: 'grasps_task',
      priority: 'high',
      completed: false,
      tags: ['GRASPS', 'تقويم أصيل'],
      createdAt: new Date().toISOString(),
    },
    {
      id: `rem-seed-4`,
      title: 'تنفيذ الخطة العلاجية المصغرة لتعزيز مهارات القيمة المنزلية',
      date: afterTomorrowStr,
      time: '11:15 ص',
      note: 'استهداف الطلاب في المستوى 1 و 2 بتمارين محسوسة ودعم الأقران لتثبيت المهارات الأساسية.',
      linkedPlanId: plan1?.id,
      linkedPlanTitle: plan1?.header.lessonTitle || plan1?.title,
      linkedSubject: plan1?.header.subject || 'الرياضيات',
      linkedGrade: plan1?.header.grade || 'الصف الثالث الأساسي',
      category: 'remedial',
      priority: 'medium',
      completed: false,
      tags: ['خطة علاجية', 'تمايز'],
      createdAt: new Date().toISOString(),
    },
  ];

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  } catch (err) {
    // Ignore storage write errors in restricted envs
  }

  return seed;
};

export const saveDailyReminders = (reminders: DailyPedagogicalReminder[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  } catch (err) {
    console.warn('Failed to save reminders to localStorage:', err);
  }
};
