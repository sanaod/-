export type ReminderCategory =
  | 'lesson_prep'      // تحضير الدرس والأنشطة
  | 'resources'        // تجهيز الوسائل والمحسوسات
  | 'remedial'         // متابعة الخطة العلاجية
  | 'formative_eval'   // تقويم تكويني وبطاقات خروج
  | 'grasps_task'      // تطبيق مهمة أداء أصيل
  | 'reflection'       // تأمل ذاتي وتغذية راجعة
  | 'general';         // مهام وملاحظات عامة

export type ReminderPriority = 'low' | 'medium' | 'high';

export interface DailyPedagogicalReminder {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  note: string;
  linkedPlanId?: string;
  linkedPlanTitle?: string;
  linkedSubject?: string;
  linkedGrade?: string;
  category: ReminderCategory;
  priority: ReminderPriority;
  completed: boolean;
  completedAt?: string;
  tags?: string[];
  createdAt: string;
}

export const REMINDER_CATEGORY_CONFIG: Record<
  ReminderCategory,
  { label: string; bg: string; text: string; border: string; iconName: string; dotColor: string }
> = {
  lesson_prep: {
    label: 'تحضير دراسي مسبق',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    iconName: 'BookOpen',
    dotColor: 'bg-emerald-600',
  },
  resources: {
    label: 'وسائل ومحسوسات رقمية',
    bg: 'bg-teal-50',
    text: 'text-teal-800',
    border: 'border-teal-200',
    iconName: 'Calculator',
    dotColor: 'bg-teal-600',
  },
  remedial: {
    label: 'متابعة علاجية وتمايز',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    iconName: 'Layers',
    dotColor: 'bg-amber-600',
  },
  formative_eval: {
    label: 'تقويم تكويني وبطاقات خروج',
    bg: 'bg-cyan-50',
    text: 'text-cyan-800',
    border: 'border-cyan-200',
    iconName: 'BrainCircuit',
    dotColor: 'bg-cyan-600',
  },
  grasps_task: {
    label: 'مهمة أصيلة GRASPS',
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-200',
    iconName: 'Award',
    dotColor: 'bg-purple-600',
  },
  reflection: {
    label: 'تأمل وتغذية راجعة',
    bg: 'bg-indigo-50',
    text: 'text-indigo-800',
    border: 'border-indigo-200',
    iconName: 'Sparkles',
    dotColor: 'bg-indigo-600',
  },
  general: {
    label: 'ملاحظة تربوية عامة',
    bg: 'bg-slate-100',
    text: 'text-slate-800',
    border: 'border-slate-200',
    iconName: 'CalendarDays',
    dotColor: 'bg-slate-600',
  },
};
