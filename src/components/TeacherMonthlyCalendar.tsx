import React, { useState, useMemo } from 'react';
import { LessonPlan } from '../types/lessonPlan';
import { toArabicDigits } from '../utils/arabicNumerals';
import {
  Calendar as CalendarIcon,
  ChevronRight,
  ChevronLeft,
  Clock,
  BookOpen,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Eye,
  FileEdit,
  Award,
  AlertCircle,
  CalendarDays,
  Sparkles,
  Layers,
  Filter,
  CheckSquare,
  GraduationCap,
  Printer,
  X,
  Tag,
} from 'lucide-react';

export interface CalendarTask {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  subject?: string;
  grade?: string;
  type: 'lesson' | 'quiz' | 'remedial' | 'enrichment' | 'grasps' | 'supervision' | 'general';
  planId?: string;
  completed: boolean;
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
}

interface TeacherMonthlyCalendarProps {
  plans: LessonPlan[];
  activePlanId?: string;
  onSelectPlan?: (id: string) => void;
  onOpenEditor?: () => void;
  onOpenPrintView?: (planId?: string) => void;
}

const ARABIC_MONTHS = [
  'كانون الثاني (يناير)',
  'شباط (فبراير)',
  'آذار (مارس)',
  'نيسان (أبريل)',
  'أيار (مايو)',
  'حزيران (يونيو)',
  'تموز (يوليو)',
  'آب (أغسطس)',
  'أيلول (سبتمبر)',
  'تشرين الأول (أكتوبر)',
  'تشرين الثاني (نوفمبر)',
  'كانون الأول (ديسمبر)',
];

const ARABIC_DAYS = [
  { name: 'الأحد', short: 'أحد' },
  { name: 'الإثنين', short: 'إثن' },
  { name: 'الثلاثاء', short: 'ثلا' },
  { name: 'الأربعاء', short: 'أرب' },
  { name: 'الخميس', short: 'خمي' },
  { name: 'الجمعة', short: 'جمع' },
  { name: 'السبت', short: 'سبت' },
];

const TASK_TYPE_CONFIG: Record<
  CalendarTask['type'],
  { label: string; bgBadge: string; textBadge: string; border: string; icon: any; dotColor: string }
> = {
  lesson: {
    label: 'خطة درس',
    bgBadge: 'bg-emerald-50',
    textBadge: 'text-emerald-800',
    border: 'border-emerald-200',
    icon: BookOpen,
    dotColor: 'bg-emerald-600',
  },
  quiz: {
    label: 'اختبار / تقويم',
    bgBadge: 'bg-rose-50',
    textBadge: 'text-rose-800',
    border: 'border-rose-200',
    icon: AlertCircle,
    dotColor: 'bg-rose-600',
  },
  remedial: {
    label: 'حصة علاجية',
    bgBadge: 'bg-amber-50',
    textBadge: 'text-amber-800',
    border: 'border-amber-200',
    icon: Layers,
    dotColor: 'bg-amber-600',
  },
  enrichment: {
    label: 'نشاط إثرائي',
    bgBadge: 'bg-blue-50',
    textBadge: 'text-blue-800',
    border: 'border-blue-200',
    icon: Sparkles,
    dotColor: 'bg-blue-600',
  },
  grasps: {
    label: 'مهمة GRASPS',
    bgBadge: 'bg-purple-50',
    textBadge: 'text-purple-800',
    border: 'border-purple-200',
    icon: Award,
    dotColor: 'bg-purple-600',
  },
  supervision: {
    label: 'زيارة إشرافية',
    bgBadge: 'bg-teal-50',
    textBadge: 'text-teal-800',
    border: 'border-teal-200',
    icon: GraduationCap,
    dotColor: 'bg-teal-600',
  },
  general: {
    label: 'مهمة عامة',
    bgBadge: 'bg-slate-100',
    textBadge: 'text-slate-800',
    border: 'border-slate-200',
    icon: CalendarDays,
    dotColor: 'bg-slate-600',
  },
};

export const TeacherMonthlyCalendar: React.FC<TeacherMonthlyCalendarProps> = ({
  plans,
  activePlanId,
  onSelectPlan,
  onOpenEditor,
  onOpenPrintView,
}) => {
  // Current date anchor
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => today.toISOString().split('T')[0], [today]);

  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-indexed
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);

  // Custom added tasks by the teacher
  const [customTasks, setCustomTasks] = useState<CalendarTask[]>([
    {
      id: 'task-def-1',
      title: 'مراجعة أوراق عمل القيمة المنزلية والتغذية الراجعة',
      date: todayStr,
      time: '09:00 ص',
      subject: 'الرياضيات',
      grade: 'الصف الثالث الأساسي',
      type: 'remedial',
      completed: false,
      priority: 'high',
      notes: 'التركيز على الطلاب الذين يحتاجون تعزيز مهارة تمثيل الأعداد على المعداد',
    },
    {
      id: 'task-def-2',
      title: 'تطبيق مهمة الأداء الأصيل (GRASPS) لدرس القيمة المنزلية',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2).toISOString().split('T')[0],
      time: '10:30 ص',
      subject: 'الرياضيات',
      grade: 'الصف الثالث الأساسي',
      type: 'grasps',
      completed: false,
      priority: 'medium',
      notes: 'توزيع سلم التقدير اللفظي (الروبك) على المجموعات قبل البدء',
    },
    {
      id: 'task-def-3',
      title: 'اجتماع لجنة المبحث وتبادل الخبرات التعليمية',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5).toISOString().split('T')[0],
      time: '12:00 م',
      subject: 'عام',
      type: 'supervision',
      completed: true,
      priority: 'low',
    },
  ]);

  // Modal for adding a new pedagogical task
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDate, setNewTaskDate] = useState(todayStr);
  const [newTaskTime, setNewTaskTime] = useState('08:30 ص');
  const [newTaskSubject, setNewTaskSubject] = useState('الرياضيات');
  const [newTaskGrade, setNewTaskGrade] = useState('الصف الثالث الأساسي');
  const [newTaskType, setNewTaskType] = useState<CalendarTask['type']>('lesson');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskNotes, setNewTaskNotes] = useState('');

  // Task Filter State
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Convert Lesson Plans into Scheduled Calendar Tasks
  const autoPlanTasks = useMemo(() => {
    return plans.map((plan, idx) => {
      // Try to parse plan date or distribute across current month
      let dateVal = plan.header?.date?.trim();
      // If date is empty or invalid, assign a predictable date in current month for demonstration
      if (!dateVal || !dateVal.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const dayOffset = (idx * 3) % 26 + 1;
        const d = new Date(currentYear, currentMonth, dayOffset);
        dateVal = d.toISOString().split('T')[0];
      }

      const task: CalendarTask = {
        id: `plan-task-${plan.id}`,
        title: plan.header?.lessonTitle || plan.title || 'خطة درس غير معنونة',
        date: dateVal,
        time: `${plan.header?.currentPeriod || 1} (الحصة ${toArabicDigits(plan.header?.currentPeriod || 1)})`,
        subject: plan.header?.subject || 'مبحث عام',
        grade: plan.header?.grade || 'الصف الثالث الأساسي',
        type: 'lesson',
        planId: plan.id,
        completed: idx === 0, // Mock completed for first
        priority: 'high',
        notes: `المدة: ${toArabicDigits(plan.header?.periodDurationMinutes || 40)} دقيقة | الحصص: ${toArabicDigits(
          plan.header?.totalPeriods || 1
        )}`,
      };
      return task;
    });
  }, [plans, currentYear, currentMonth]);

  // Combined tasks list
  const allTasks = useMemo(() => {
    return [...autoPlanTasks, ...customTasks];
  }, [autoPlanTasks, customTasks]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    if (typeFilter === 'all') return allTasks;
    return allTasks.filter((t) => t.type === typeFilter);
  }, [allTasks, typeFilter]);

  // Tasks mapped by date string "YYYY-MM-DD"
  const tasksByDate = useMemo(() => {
    const map: Record<string, CalendarTask[]> = {};
    filteredTasks.forEach((task) => {
      if (!map[task.date]) {
        map[task.date] = [];
      }
      map[task.date].push(task);
    });
    return map;
  }, [filteredTasks]);

  // Calendar matrix calculation for the current month
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const startDayIndex = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, ...
    const totalDays = lastDayOfMonth.getDate();

    // Previous month filler days
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    const days: {
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
    }[] = [];

    // Prepend previous month days
    for (let i = startDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const prevDate = new Date(currentYear, currentMonth - 1, dayNum);
      const dStr = prevDate.toISOString().split('T')[0];
      days.push({
        dateStr: dStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        isSelected: dStr === selectedDateStr,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const curDate = new Date(currentYear, currentMonth, i);
      const dStr = curDate.toISOString().split('T')[0];
      days.push({
        dateStr: dStr,
        dayNumber: i,
        isCurrentMonth: true,
        isToday: dStr === todayStr,
        isSelected: dStr === selectedDateStr,
      });
    }

    // Append next month days to complete 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(currentYear, currentMonth + 1, i);
      const dStr = nextDate.toISOString().split('T')[0];
      days.push({
        dateStr: dStr,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        isSelected: dStr === selectedDateStr,
      });
    }

    return days;
  }, [currentYear, currentMonth, todayStr, selectedDateStr]);

  // Tasks for the selected date
  const selectedDayTasks = useMemo(() => {
    return tasksByDate[selectedDateStr] || [];
  }, [tasksByDate, selectedDateStr]);

  // Upcoming 7 days tasks summary
  const upcomingTasks = useMemo(() => {
    const now = new Date(todayStr).getTime();
    const sevenDaysLater = now + 7 * 24 * 60 * 60 * 1000;
    return allTasks
      .filter((t) => {
        const taskTime = new Date(t.date).getTime();
        return taskTime >= now && taskTime <= sevenDaysLater;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [allTasks, todayStr]);

  // Handlers for month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDateStr(todayStr);
  };

  const handleToggleTaskCompletion = (taskId: string) => {
    setCustomTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setCustomTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: CalendarTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      date: newTaskDate,
      time: newTaskTime,
      subject: newTaskSubject,
      grade: newTaskGrade,
      type: newTaskType,
      priority: newTaskPriority,
      completed: false,
      notes: newTaskNotes.trim(),
    };

    setCustomTasks((prev) => [newTask, ...prev]);
    setSelectedDateStr(newTaskDate);
    setIsAddTaskModalOpen(false);

    // Reset Form
    setNewTaskTitle('');
    setNewTaskNotes('');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6 font-['Tajawal']">
      {/* 1. Header with Month Navigator & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-emerald-600 via-teal-700 to-emerald-800 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-900">
                تقويم التخطيط وجدول المهام التربوية (Teacher Monthly Calendar)
              </h3>
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 rounded-full text-[11px] font-extrabold border border-emerald-300 shadow-2xs">
                جدول زمني تفاعلي 📅
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              متابعة مواعيد تنفيذ خطط الدروس، والاختبارات، والحصص العلاجية، والمهام الأدائية شهرياً
            </p>
          </div>
        </div>

        {/* Month Selector & Controls */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-700 hover:text-slate-900 hover:bg-white rounded-lg transition-all"
              title="الشهر السابق"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 text-xs font-black text-slate-900 min-w-[150px] text-center">
              {ARABIC_MONTHS[currentMonth]} {toArabicDigits(currentYear)}
            </span>

            <button
              onClick={handleNextMonth}
              className="p-1.5 text-slate-700 hover:text-slate-900 hover:bg-white rounded-lg transition-all"
              title="الشهر القادم"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleGoToToday}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all border border-slate-300 shadow-2xs"
            title="الانتقال إلى اليوم الحالي"
          >
            اليوم 📍
          </button>

          <button
            onClick={() => {
              setNewTaskDate(selectedDateStr || todayStr);
              setIsAddTaskModalOpen(true);
            }}
            className="px-3.5 py-1.5 bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-97 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مهمة جديدة</span>
          </button>
        </div>
      </div>

      {/* 1.5 Smart Reminders & Deadlines Notification Center */}
      {upcomingTasks.length > 0 && (
        <div className="bg-linear-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-purple-700 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-bold text-purple-950 font-['Tajawal']">
                  مركز التذكير الذكي بالمواعيد النهائية والاستحقاقات القريبة
                </h4>
                <span className="bg-purple-200 text-purple-900 px-2 py-0.5 rounded-full text-[10px] font-extrabold tabular-nums">
                  {toArabicDigits(upcomingTasks.length)} مهام مستحقة في الـ ٧ أيام القادمة
                </span>
              </div>
              <p className="text-xs text-purple-800/80 mt-0.5">
                تنبيهات فورية لمواعيد تسليم المهام الأصيلة (GRASPS)، الحصص العلاجية، والدروس المجدولة القادمة.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
            {upcomingTasks.slice(0, 3).map((t) => (
              <button
                key={`reminder-${t.id}`}
                onClick={() => setSelectedDateStr(t.date)}
                className="px-3 py-1.5 bg-white hover:bg-purple-100 text-purple-950 border border-purple-200 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-purple-600" />
                <span className="truncate max-w-[140px]">{t.title}</span>
                <span className="text-[10px] text-purple-700 font-mono tabular-nums">({t.date})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. Type Filter & KPI Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
        {/* Type Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-bold text-slate-600 flex items-center gap-1 text-[11px] ml-1">
            <Filter className="w-3.5 h-3.5 text-emerald-700" />
            <span>نوع النشاط:</span>
          </span>

          <button
            onClick={() => setTypeFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              typeFilter === 'all'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            الكل ({toArabicDigits(allTasks.length)})
          </button>

          {Object.entries(TASK_TYPE_CONFIG).map(([typeKey, cfg]) => {
            const count = allTasks.filter((t) => t.type === typeKey).length;
            if (count === 0 && typeKey !== 'lesson' && typeKey !== 'grasps') return null;
            return (
              <button
                key={typeKey}
                onClick={() => setTypeFilter(typeKey)}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                  typeFilter === typeKey
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${cfg.dotColor}`} />
                <span>
                  {cfg.label} ({toArabicDigits(count)})
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Month Stats */}
        <div className="flex items-center gap-3 text-slate-600 text-[11px] font-semibold">
          <span>
            خطط هذا الشهر: <strong className="text-emerald-700 tabular-nums">{toArabicDigits(autoPlanTasks.length)}</strong>
          </span>
          <span className="text-slate-300">|</span>
          <span>
            مهام إضافية: <strong className="text-purple-700 tabular-nums">{toArabicDigits(customTasks.length)}</strong>
          </span>
        </div>
      </div>

      {/* 3. Main Grid Layout: Calendar (8 Cols) + Day Inspector & Upcoming (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 3.1. Monthly Calendar Grid (8 cols on lg) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {ARABIC_DAYS.map((day, idx) => (
              <div
                key={day.name}
                className={`py-2 text-xs font-black rounded-lg ${
                  idx === 5 ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-700'
                }`}
              >
                <span className="hidden sm:inline">{day.name}</span>
                <span className="sm:hidden">{day.short}</span>
              </div>
            ))}
          </div>

          {/* Days Grid Cells */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {calendarDays.map((day, index) => {
              const dayTasks = tasksByDate[day.dateStr] || [];
              const isSelected = day.dateStr === selectedDateStr;
              const hasTasks = dayTasks.length > 0;

              return (
                <div
                  key={`${day.dateStr}-${index}`}
                  onClick={() => setSelectedDateStr(day.dateStr)}
                  className={`min-h-[85px] sm:min-h-[100px] p-1.5 sm:p-2 rounded-xl border flex flex-col justify-between transition-all cursor-pointer relative group ${
                    isSelected
                      ? 'bg-emerald-50/90 border-emerald-500 shadow-md ring-2 ring-emerald-400/40 z-10'
                      : day.isToday
                      ? 'bg-amber-50/70 border-amber-300'
                      : day.isCurrentMonth
                      ? 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50/80'
                      : 'bg-slate-50/50 border-slate-100 text-slate-400'
                  }`}
                >
                  {/* Day Number and Today Badge */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs sm:text-sm font-black tabular-nums font-mono ${
                        isSelected
                          ? 'text-emerald-900 font-extrabold'
                          : day.isToday
                          ? 'w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs'
                          : day.isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {toArabicDigits(day.dayNumber)}
                    </span>

                    {hasTasks && (
                      <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                        {toArabicDigits(dayTasks.length)}
                      </span>
                    )}
                  </div>

                  {/* Day Mini Task Chips */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dayTasks.slice(0, 2).map((task) => {
                      const cfg = TASK_TYPE_CONFIG[task.type] || TASK_TYPE_CONFIG.general;
                      return (
                        <div
                          key={task.id}
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md truncate border flex items-center gap-1 ${
                            cfg.bgBadge
                          } ${cfg.textBadge} ${cfg.border} ${task.completed ? 'line-through opacity-60' : ''}`}
                          title={`${task.title} (${task.subject || ''})`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dotColor}`} />
                          <span className="truncate">{task.title}</span>
                        </div>
                      );
                    })}

                    {dayTasks.length > 2 && (
                      <div className="text-[9px] font-bold text-slate-500 text-left pl-1">
                        +{toArabicDigits(dayTasks.length - 2)} أخرى
                      </div>
                    )}
                  </div>

                  {/* Highlight bar for selected day */}
                  {isSelected && (
                    <div className="absolute bottom-0 left-2 right-2 h-1 bg-emerald-600 rounded-t-full" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 3.2. Selected Day Inspector & Upcoming Schedule (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Selected Date Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-emerald-700" />
                <h4 className="text-sm font-black text-slate-900">
                  مهام وخطط يوم: <span className="text-emerald-700">{selectedDateStr}</span>
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500 tabular-nums">
                {toArabicDigits(selectedDayTasks.length)} نشاط
              </span>
            </div>

            {selectedDayTasks.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs space-y-2">
                <CalendarIcon className="w-8 h-8 mx-auto text-slate-300" />
                <p>لا توجد مهام أو خطط مجدولة في هذا اليوم.</p>
                <button
                  onClick={() => {
                    setNewTaskDate(selectedDateStr);
                    setIsAddTaskModalOpen(true);
                  }}
                  className="text-xs text-emerald-700 font-bold hover:underline"
                >
                  + جدولة مهمة أو درس الآن
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1">
                {selectedDayTasks.map((task) => {
                  const cfg = TASK_TYPE_CONFIG[task.type] || TASK_TYPE_CONFIG.general;
                  return (
                    <div
                      key={task.id}
                      className={`p-3 rounded-xl border transition-all ${
                        task.completed ? 'bg-slate-50 border-slate-200 opacity-75' : 'bg-white border-slate-200 shadow-2xs hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1">
                          <button
                            onClick={() => handleToggleTaskCompletion(task.id)}
                            className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors shrink-0"
                            title={task.completed ? 'إلغاء وضع الاكتمال' : 'وضع علامة مكتمل'}
                          >
                            {task.completed ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </button>

                          <div>
                            <h5
                              className={`text-xs font-bold text-slate-900 ${
                                task.completed ? 'line-through text-slate-500' : ''
                              }`}
                            >
                              {task.title}
                            </h5>

                            <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                              <span className={`px-1.5 py-0.2 rounded-md font-semibold border ${cfg.bgBadge} ${cfg.textBadge} ${cfg.border}`}>
                                {cfg.label}
                              </span>
                              {task.subject && (
                                <span className="text-slate-600 font-medium">· {task.subject}</span>
                              )}
                              {task.grade && (
                                <span className="text-slate-400 font-normal">({task.grade})</span>
                              )}
                            </div>

                            {task.notes && (
                              <p className="text-[10px] text-slate-500 mt-1 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                {task.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          {task.planId && (
                            <button
                              onClick={() => {
                                if (onSelectPlan) onSelectPlan(task.planId!);
                                if (onOpenEditor) onOpenEditor();
                              }}
                              className="p-1 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="فتح الخطة في المحرر"
                            >
                              <FileEdit className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {!task.planId && (
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="حذف المهمة"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming 7 Days Fast List */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-700" />
                <h4 className="text-xs font-black text-slate-900">
                  الاستحقاقات والدروس القادمة (٧ أيام)
                </h4>
              </div>
              <span className="text-[11px] font-bold text-slate-500 tabular-nums">
                {toArabicDigits(upcomingTasks.length)} نشاط
              </span>
            </div>

            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {upcomingTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedDateStr(task.date)}
                  className="p-2 bg-white rounded-xl border border-slate-200 text-xs flex items-center justify-between gap-2 hover:border-emerald-300 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                    <span className="font-bold text-slate-800 truncate">{task.title}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 tabular-nums shrink-0">
                    {task.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Add Task Modal */}
      {isAddTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-emerald-700" />
                <h4 className="text-base font-black text-slate-900">
                  جدولة مهمة أو موعد تعليمي جديد
                </h4>
              </div>
              <button
                onClick={() => setIsAddTaskModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  عنوان المهمة أو الدرس: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تطبيق نشاط القيمة المنزلية التفاعلي..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">التاريخ:</label>
                  <input
                    type="date"
                    required
                    value={newTaskDate}
                    onChange={(e) => setNewTaskDate(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">التوقيت / الحصة:</label>
                  <input
                    type="text"
                    placeholder="مثال: الحصة الثالثة (10:00 ص)"
                    value={newTaskTime}
                    onChange={(e) => setNewTaskTime(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المبحث الدراسي:</label>
                  <input
                    type="text"
                    value={newTaskSubject}
                    onChange={(e) => setNewTaskSubject(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الصف الدراسي:</label>
                  <input
                    type="text"
                    value={newTaskGrade}
                    onChange={(e) => setNewTaskGrade(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">نوع النشاط:</label>
                  <select
                    value={newTaskType}
                    onChange={(e) => setNewTaskType(e.target.value as CalendarTask['type'])}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    <option value="lesson">خطة درس نموذجية</option>
                    <option value="quiz">اختبار قصير / تقويم</option>
                    <option value="remedial">حصة علاجية</option>
                    <option value="enrichment">نشاط إثرائي</option>
                    <option value="grasps">مهمة أداء أصيل GRASPS</option>
                    <option value="supervision">زيارة إشرافية / اجتماع</option>
                    <option value="general">مهمة عامة</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الأولوية:</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    <option value="high">عالية 🔴</option>
                    <option value="medium">متوسطة 🟡</option>
                    <option value="low">عادية 🟢</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات وتوجيهات:</label>
                <textarea
                  rows={2}
                  placeholder="ملاحظات حول الوسائل، المجموعات، أو أوراق العمل المطلوبة..."
                  value={newTaskNotes}
                  onChange={(e) => setNewTaskNotes(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddTaskModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>حفظ المهمة في التقويم</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
