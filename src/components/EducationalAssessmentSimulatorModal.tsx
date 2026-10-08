/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  X,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Move,
  Filter,
  FileDown,
  Printer,
  RotateCcw,
  BookOpen,
  Target,
  Award,
  Layers,
  Info,
  ChevronRight,
  ChevronLeft,
  CalendarRange,
  Zap,
  Check,
  BrainCircuit,
  FileText,
  Sliders,
  Bell,
  ArrowRight,
  ListFilter,
  CheckSquare,
} from 'lucide-react';
import { LessonPlan } from '../types/lessonPlan';
import { toArabicDigits } from '../utils/arabicNumerals';
import { getHijriDate, formatDualCalendarDate } from '../utils/hijriCalendar';
import {
  checkDayStatus,
  formatDateToIso,
  parseDateSafely,
  PALESTINIAN_MINISTRY_HOLIDAYS,
  isWeekend,
} from '../utils/palestinianCalendar';

export interface AssessmentTask {
  id: string;
  title: string;
  type: 'grasps' | 'exam' | 'project' | 'worksheet' | 'exit_ticket' | 'portfolio' | 'unit_eval';
  subject: string;
  grade: string;
  dueDate: string; // YYYY-MM-DD
  weightPoints: number; // e.g. 10, 20, 100
  estimatedHours: number; // e.g. 1, 2, 4
  competency: string;
  status: 'planned' | 'in_progress' | 'submitted' | 'graded';
  description?: string;
  linkedPlanId?: string;
}

interface EducationalAssessmentSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: LessonPlan[];
  activePlanId?: string;
  onSelectPlan?: (id: string) => void;
}

const TASK_TYPE_CONFIG: Record<
  AssessmentTask['type'],
  { label: string; bg: string; text: string; border: string; iconStr: string; colorHex: string }
> = {
  grasps: {
    label: 'مهمة أصيلة (GRASPS)',
    bg: 'bg-purple-100',
    text: 'text-purple-900',
    border: 'border-purple-300',
    iconStr: '🎯',
    colorHex: '#7c3aed',
  },
  exam: {
    label: 'اختبار / تقويم تحصيلي',
    bg: 'bg-rose-100',
    text: 'text-rose-900',
    border: 'border-rose-300',
    iconStr: '📝',
    colorHex: '#e11d48',
  },
  project: {
    label: 'مشروع فردي / جماعي',
    bg: 'bg-blue-100',
    text: 'text-blue-900',
    border: 'border-blue-300',
    iconStr: '📊',
    colorHex: '#2563eb',
  },
  worksheet: {
    label: 'ورقة عمل تفاعلية',
    bg: 'bg-teal-100',
    text: 'text-teal-900',
    border: 'border-teal-300',
    iconStr: '🧩',
    colorHex: '#0d9488',
  },
  exit_ticket: {
    label: 'بطاقة خروج / تكويني',
    bg: 'bg-emerald-100',
    text: 'text-emerald-900',
    border: 'border-emerald-300',
    iconStr: '🏷️',
    colorHex: '#059669',
  },
  portfolio: {
    label: 'ملف إنجاز الطالب',
    bg: 'bg-amber-100',
    text: 'text-amber-900',
    border: 'border-amber-300',
    iconStr: '📁',
    colorHex: '#d97706',
  },
  unit_eval: {
    label: 'تقويم ختامي للوحدة',
    bg: 'bg-cyan-100',
    text: 'text-cyan-900',
    border: 'border-cyan-300',
    iconStr: '🏁',
    colorHex: '#0891b2',
  },
};

const LOCAL_STORAGE_TASKS_KEY = 'educational_expert_assessment_simulator_v1';

export const EducationalAssessmentSimulatorModal: React.FC<
  EducationalAssessmentSimulatorModalProps
> = ({ isOpen, onClose, plans, activePlanId, onSelectPlan }) => {
  // Navigation month state (Default to current month or October 2026)
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date(2026, 9, 1)); // Oct 2026
  const [selectedTaskType, setSelectedTaskType] = useState<string>('all');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');

  // Drag and Drop State
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [lastRescheduledInfo, setLastRescheduledInfo] = useState<{
    task: AssessmentTask;
    prevDate: string;
    newDate: string;
  } | null>(null);

  // Modal forms & messages
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<AssessmentTask | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Form input states
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<AssessmentTask['type']>('grasps');
  const [formSubject, setFormSubject] = useState('الرياضيات');
  const [formGrade, setFormGrade] = useState('الصف الثالث الأساسي');
  const [formDueDate, setFormDueDate] = useState('2026-10-15');
  const [formPoints, setFormPoints] = useState(20);
  const [formHours, setFormHours] = useState(2);
  const [formCompetency, setFormCompetency] = useState('التفكير الناقد وحل المشكلات');
  const [formDescription, setFormDescription] = useState('');

  // Initial Assessment Tasks loaded or seeded from active plans
  const [tasks, setTasks] = useState<AssessmentTask[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_TASKS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}

    // Seed realistic assessment tasks from plans
    const defaultTasks: AssessmentTask[] = [
      {
        id: 'task-1',
        title: 'مهمة GRASPS: تصميم مجسم القيمة المنزلية لأعداد فلسطين',
        type: 'grasps',
        subject: 'الرياضيات',
        grade: 'الصف الثالث الأساسي',
        dueDate: '2026-10-12',
        weightPoints: 25,
        estimatedHours: 3,
        competency: 'التطبيق والنمذجة الرياضية',
        status: 'in_progress',
        description: 'بناء مجسم تفاعلي يمثل ارتفاعات الجبال الفلسطينية كجبل الجرمق والعاصور.',
      },
      {
        id: 'task-2',
        title: 'اختبار قصري تحصيلي: القيمة المنزلية والجمع حتى 9999',
        type: 'exam',
        subject: 'الرياضيات',
        grade: 'الصف الثالث الأساسي',
        dueDate: '2026-10-18',
        weightPoints: 20,
        estimatedHours: 1,
        competency: 'الحساب والرياضيات',
        status: 'planned',
        description: 'اختبار تحريري قصري يغطي مستويات الفهم والتطبيق.',
      },
      {
        id: 'task-3',
        title: 'بطاقة خروج: مقارنة الأعداد والترتيب التصاعدي',
        type: 'exit_ticket',
        subject: 'الرياضيات',
        grade: 'الصف الثالث الأساسي',
        dueDate: '2026-10-08',
        weightPoints: 5,
        estimatedHours: 0.5,
        competency: 'التقويم التكويني السريع',
        status: 'submitted',
        description: 'بطاقات تقييم فورية في نهاية الحصة لقياس استيعاب الرموز > < =.',
      },
      {
        id: 'task-4',
        title: 'مشروع بحثي: جمع طوابع المعالم الوطنية الفلسطينية',
        type: 'project',
        subject: 'الدراسات الاجتماعية',
        grade: 'الصف الثالث الأساسي',
        dueDate: '2026-10-22',
        weightPoints: 20,
        estimatedHours: 4,
        competency: 'المواطنة والهوية الوطنية',
        status: 'planned',
        description: 'إعداد ألبوم صور ومعلومات عن المدن الفلسطينية والقدس الشريف.',
      },
      {
        id: 'task-5',
        title: 'ورقة عمل تفاعلية: استكشاف الكائنات الحية وبيئاتها',
        type: 'worksheet',
        subject: 'العلوم والحياة',
        grade: 'الصف الثالث الأساسي',
        dueDate: '2026-10-26',
        weightPoints: 10,
        estimatedHours: 1,
        competency: 'الاستقصاء والتجريب العملي',
        status: 'planned',
        description: 'حل أسئلة الاستكشاف والملاحظة العلمية للبيئة المحلية.',
      },
      {
        id: 'task-6',
        title: 'تجميع ملف إنجاز الطالب (Portfolio) للفصل الأول',
        type: 'portfolio',
        subject: 'اللغة العربية',
        grade: 'الصف الثالث الأساسي',
        dueDate: '2026-10-29',
        weightPoints: 20,
        estimatedHours: 2,
        competency: 'القرائية والتعبير اللغوي',
        status: 'planned',
        description: 'جمع نتاجات التعبير الكتابي والخط العربي والقراءة الإجهارية.',
      },
    ];

    // Add extra tasks from plans if available
    plans.forEach((p, idx) => {
      if (p.section3Assessment?.graspsTask?.title && idx > 0) {
        defaultTasks.push({
          id: `task-plan-${p.id}`,
          title: `مهمة GRASPS: ${p.section3Assessment.graspsTask.title}`,
          type: 'grasps',
          subject: p.header.subject || 'المادة الدراسية',
          grade: p.header.grade || 'الصف الثالث الأساسي',
          dueDate: p.header.endDate || '2026-10-20',
          weightPoints: 20,
          estimatedHours: 2,
          competency: 'حل المشكلات الواقعية',
          status: 'planned',
          description: p.section3Assessment.graspsTask.fullDescription || p.section3Assessment.graspsTask.situation,
          linkedPlanId: p.id,
        });
      }
    });

    return defaultTasks;
  });

  // Save tasks to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(tasks));
    } catch (e) {}
  }, [tasks]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Calendar Days Calculation for current displayed month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-indexed

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const daysInMonth = lastDayOfMonth.getDate();
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

    const days: {
      dateObj: Date;
      dateIso: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      dayStatus: ReturnType<typeof checkDayStatus>;
      hijriInfo: ReturnType<typeof getHijriDate>;
      tasks: AssessmentTask[];
      workloadLevel: 'light' | 'medium' | 'heavy';
      totalPoints: number;
    }[] = [];

    // Preceding padding days from previous month to align Sunday
    for (let i = 0; i < startDayOfWeek; i++) {
      const prevDate = new Date(year, month, -startDayOfWeek + i + 1);
      const iso = formatDateToIso(prevDate);
      days.push({
        dateObj: prevDate,
        dateIso: iso,
        dayNumber: prevDate.getDate(),
        isCurrentMonth: false,
        dayStatus: checkDayStatus(prevDate),
        hijriInfo: getHijriDate(prevDate),
        tasks: [],
        workloadLevel: 'light',
        totalPoints: 0,
      });
    }

    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const iso = formatDateToIso(dateObj);
      const dayStatus = checkDayStatus(dateObj);
      const hijriInfo = getHijriDate(dateObj);

      // Tasks for this date
      const dayTasks = tasks.filter((t) => {
        const matchesDate = t.dueDate === iso;
        const matchesType = selectedTaskType === 'all' || t.type === selectedTaskType;
        const matchesSubject =
          selectedSubjectFilter === 'all' ||
          t.subject.toLowerCase().includes(selectedSubjectFilter.toLowerCase());
        return matchesDate && matchesType && matchesSubject;
      });

      const totalPoints = dayTasks.reduce((acc, t) => acc + t.weightPoints, 0);
      let workloadLevel: 'light' | 'medium' | 'heavy' = 'light';
      if (dayTasks.length >= 3 || totalPoints >= 40) workloadLevel = 'heavy';
      else if (dayTasks.length >= 2 || totalPoints >= 20) workloadLevel = 'medium';

      days.push({
        dateObj,
        dateIso: iso,
        dayNumber: d,
        isCurrentMonth: true,
        dayStatus,
        hijriInfo,
        tasks: dayTasks,
        workloadLevel,
        totalPoints,
      });
    }

    // Trailing padding days to fill 35 or 42 grid cells
    const remaining = 35 - days.length;
    if (remaining > 0) {
      for (let i = 1; i <= remaining; i++) {
        const nextDate = new Date(year, month + 1, i);
        const iso = formatDateToIso(nextDate);
        days.push({
          dateObj: nextDate,
          dateIso: iso,
          dayNumber: i,
          isCurrentMonth: false,
          dayStatus: checkDayStatus(nextDate),
          hijriInfo: getHijriDate(nextDate),
          tasks: [],
          workloadLevel: 'light',
          totalPoints: 0,
        });
      }
    }

    return days;
  }, [currentDate, tasks, selectedTaskType, selectedSubjectFilter]);

  // Overall stats
  const totalTasksCount = tasks.length;
  const totalPointsAll = tasks.reduce((acc, t) => acc + t.weightPoints, 0);
  const heavyDaysCount = calendarDays.filter((d) => d.isCurrentMonth && d.workloadLevel === 'heavy').length;

  // Month header text in dual calendar format
  const monthHeaderFormatted = useMemo(() => {
    const gMonthNames = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    const gMonth = gMonthNames[currentDate.getMonth()];
    const gYear = toArabicDigits(currentDate.getFullYear());

    const middleOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 15);
    const hijriInfo = getHijriDate(middleOfMonth);

    return {
      gregorian: `${gMonth} ${gYear}م`,
      hijri: `${hijriInfo.monthName} ${toArabicDigits(hijriInfo.year)}هـ`,
    };
  }, [currentDate]);

  // Handle Drag & Drop Task Rescheduling
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, dateIso: string) => {
    e.preventDefault();
    if (dragOverDate !== dateIso) {
      setDragOverDate(dateIso);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverDate(null);
  };

  const handleDrop = (e: React.DragEvent, targetDateIso: string) => {
    e.preventDefault();
    setDragOverDate(null);

    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (!taskId) return;

    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    if (targetTask.dueDate === targetDateIso) return;

    // Check if target date is a weekend or official holiday
    const dayStatus = checkDayStatus(targetDateIso);
    let noteWarning = '';
    if (dayStatus.isWeekend) {
      noteWarning = ' ⚠️ تنبيه: تم النقل ليوم عطلة أسبوعية (الجمعة/السبت).';
    } else if (dayStatus.holidayName) {
      noteWarning = ` ⚠️ تنبيه: تم النقل إلى يوم إجازة رسمية (${dayStatus.holidayName}).`;
    }

    setLastRescheduledInfo({
      task: targetTask,
      prevDate: targetTask.dueDate,
      newDate: targetDateIso,
    });

    const updated = tasks.map((t) => (t.id === taskId ? { ...t, dueDate: targetDateIso } : t));
    setTasks(updated);
    setDraggedTaskId(null);

    const dualDateInfo = formatDualCalendarDate(targetDateIso);
    showToast(
      `✨ تم نقل "${targetTask.title.substring(0, 25)}..." بنجاح إلى تاريخ (${dualDateInfo.gregorianFull} | ${dualDateInfo.hijriFull}).${noteWarning}`
    );
  };

  const handleUndoReschedule = () => {
    if (!lastRescheduledInfo) return;
    const { task, prevDate } = lastRescheduledInfo;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, dueDate: prevDate } : t)));
    setLastRescheduledInfo(null);
    showToast(`↩️ تم التراجع وإعادة الموعد إلى (${prevDate}).`);
  };

  // AI Auto Balance Deadlines
  const handleAiAutoBalance = () => {
    // Automatically spread out heavy tasks away from weekends and holidays
    let movedCount = 0;
    const sorted = [...tasks].sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    const dateTaskCountMap: Record<string, number> = {};
    sorted.forEach((t) => {
      dateTaskCountMap[t.dueDate] = (dateTaskCountMap[t.dueDate] || 0) + 1;
    });

    const balanced = sorted.map((task) => {
      const status = checkDayStatus(task.dueDate);
      const isBusy = (dateTaskCountMap[task.dueDate] || 0) > 2;

      if (status.isWeekend || status.holidayName || isBusy) {
        // Find next clean teaching day
        let checkDate = parseDateSafely(task.dueDate);
        let tries = 0;
        while (tries < 14) {
          tries++;
          checkDate.setDate(checkDate.getDate() + 1);
          const iso = formatDateToIso(checkDate);
          const cStatus = checkDayStatus(iso);
          const currentLoad = dateTaskCountMap[iso] || 0;

          if (cStatus.isTeaching && currentLoad < 2) {
            dateTaskCountMap[task.dueDate]--;
            dateTaskCountMap[iso] = (dateTaskCountMap[iso] || 0) + 1;
            movedCount++;
            return { ...task, dueDate: iso };
          }
        }
      }
      return task;
    });

    setTasks(balanced);
    showToast(`🪄 تم إعادة توزيع وتوازن (${toArabicDigits(movedCount)}) مهام تقويم تلقائياً بعيداً عن العطل والازدحام!`);
  };

  // Quick Task Form Submit
  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingTask) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id
            ? {
                ...t,
                title: formTitle,
                type: formType,
                subject: formSubject,
                grade: formGrade,
                dueDate: formDueDate,
                weightPoints: Number(formPoints) || 10,
                estimatedHours: Number(formHours) || 1,
                competency: formCompetency,
                description: formDescription,
              }
            : t
        )
      );
      showToast('✅ تم تعديل تفاصيل مهمة التقويم بنجاح.');
    } else {
      const newTask: AssessmentTask = {
        id: `task-${Date.now()}`,
        title: formTitle,
        type: formType,
        subject: formSubject,
        grade: formGrade,
        dueDate: formDueDate,
        weightPoints: Number(formPoints) || 10,
        estimatedHours: Number(formHours) || 1,
        competency: formCompetency,
        status: 'planned',
        description: formDescription,
      };
      setTasks((prev) => [newTask, ...prev]);
      showToast('🎉 تمت إضافة مهمة التقويم التربوي الجديدة بنجاح.');
    }

    setIsAddTaskModalOpen(false);
    setEditingTask(null);
    setFormTitle('');
    setFormDescription('');
  };

  const handleEditTask = (task: AssessmentTask) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormType(task.type);
    setFormSubject(task.subject);
    setFormGrade(task.grade);
    setFormDueDate(task.dueDate);
    setFormPoints(task.weightPoints);
    setFormHours(task.estimatedHours);
    setFormCompetency(task.competency);
    setFormDescription(task.description || '');
    setIsAddTaskModalOpen(true);
  };

  const handleDeleteTask = (id: string) => {
    if (confirm('هل أنت تأكد من حذف هذه المهمة من محاكي التقويم؟')) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      showToast('🗑️ تم حذف المهمة.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        dir="rtl"
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden text-right font-['Cairo',sans-serif]"
      >
        {/* Toast Alert Floating Badge */}
        {toastMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-xs font-black shadow-2xl border border-emerald-400 flex items-center gap-2 animate-bounce">
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 1. Modal Top Bar Header */}
        <div className="bg-linear-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-amber-400 via-amber-500 to-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-lg border border-amber-300 shrink-0">
              <CalendarRange className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black font-['Tajawal'] tracking-wide">
                  محاكي التقويم التربوي والتقويم المزدوج (هجري / ميلادي)
                </h2>
                <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 rounded-full text-[10px] font-black shadow-2xs">
                  سحب وإفلات تفاعلي 🖐️
                </span>
                <span className="px-2 py-0.5 bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 rounded-full text-[10px] font-bold">
                  🇵🇸 التقويم الفلسطيني المعتمد
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                تصور تواريخ المهام المعقدة والمستمرة (GRASPS، الاختبارات، المشاريع)، مع إمكانية السحب والإفلات لإعادة جدولة مواعيد التسليم وتجنب الازدحام.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAiAutoBalance}
              className="px-3.5 py-2 bg-linear-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer border border-amber-300"
              title="توزيع وتوازن مواعيد التسليم تلقائياً بالذكاء الاصطناعي بعيداً عن العطل"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>موازنة المواعيد (AI) 🪄</span>
            </button>

            <button
              onClick={() => {
                setEditingTask(null);
                setFormTitle('');
                setFormDescription('');
                setIsAddTaskModalOpen(true);
              }}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مهمة تقويم</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Controls & Calendar Navigation Toolbar */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Dual Month Navigation */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white border border-slate-300 rounded-2xl p-1 shadow-xs">
              <button
                onClick={() =>
                  setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
                }
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-700 transition-colors cursor-pointer"
                title="الشهر السابق"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="px-3 text-center min-w-[200px]">
                <span className="block text-xs font-black text-slate-900 font-['Tajawal']">
                  {monthHeaderFormatted.gregorian}
                </span>
                <span className="block text-[11px] font-bold text-emerald-800">
                  {monthHeaderFormatted.hijri}
                </span>
              </div>

              <button
                onClick={() =>
                  setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
                }
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-700 transition-colors cursor-pointer"
                title="الشهر التالي"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setCurrentDate(new Date(2026, 9, 1))}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              اليوم / الشهر الحالي
            </button>

            {lastRescheduledInfo && (
              <button
                onClick={handleUndoReschedule}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer animate-pulse"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-700" />
                <span>تراجع عن النقل المباشر</span>
              </button>
            )}
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Task Type Filter */}
            <div className="flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-600 font-bold">نوع التقويم:</span>
              <select
                value={selectedTaskType}
                onChange={(e) => setSelectedTaskType(e.target.value)}
                className="bg-white border border-slate-300 text-slate-800 text-xs rounded-xl px-2.5 py-1.5 font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">كافة الأنواع ({toArabicDigits(totalTasksCount)})</option>
                {Object.entries(TASK_TYPE_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>
                    {cfg.iconStr} {cfg.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Filter */}
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="bg-white border border-slate-300 text-slate-800 text-xs rounded-xl px-2.5 py-1.5 font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">كافة المباحث</option>
              <option value="الرياضيات">الرياضيات</option>
              <option value="اللغة العربية">اللغة العربية</option>
              <option value="العلوم والحياة">العلوم والحياة</option>
              <option value="الدراسات الاجتماعية">الدراسات الاجتماعية</option>
            </select>
          </div>
        </div>

        {/* 3. Main Modal Body: Dual Calendar Grid & Tasks Drawer */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-slate-100/60 space-y-4">
          
          {/* Instructional Drag-and-Drop Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-950">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-600 text-white rounded-lg shrink-0">
                <Move className="w-4 h-4" />
              </div>
              <p className="leading-relaxed font-medium">
                <strong>طريقة الجدولة التفاعلية:</strong> يمكنك إسقاط أي بطاقة مهمة تقويم عبر سحبها بالماوس أو إصبعك إلى اليوم المطلوب في التقويم لإعادة جدولة تاريخ التسليم تلقائياً، وسيتم تحديث التقويم الهجري والميلادي فوراً.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-emerald-200 font-bold text-[11px] text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>🟢 هادئ</span>
              </span>
              <span className="inline-flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-amber-200 font-bold text-[11px] text-amber-800">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>🟡 متوسط</span>
              </span>
              <span className="inline-flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-rose-200 font-bold text-[11px] text-rose-800">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>🔴 ازدحام تسليم</span>
              </span>
            </div>
          </div>

          {/* Dual Calendar Grid */}
          <div className="bg-white border border-slate-200 rounded-3xl p-3 sm:p-4 shadow-xs space-y-2">
            {/* Day Names Row (7 columns) */}
            <div className="grid grid-cols-7 gap-1.5 text-center font-bold text-xs text-slate-700 bg-slate-50 py-2.5 rounded-2xl border border-slate-200">
              <div className="text-slate-800">الأحد</div>
              <div className="text-slate-800">الإثنين</div>
              <div className="text-slate-800">الثلاثاء</div>
              <div className="text-slate-800">الأربعاء</div>
              <div className="text-slate-800">الخميس</div>
              <div className="text-rose-700 font-black bg-rose-50/50 rounded-lg py-0.5">
                الجمعة (عطلة)
              </div>
              <div className="text-rose-700 font-black bg-rose-50/50 rounded-lg py-0.5">
                السبت (عطلة)
              </div>
            </div>

            {/* Dates Grid (7 columns) */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map((dayItem, idx) => {
                const isDragOverTarget = dragOverDate === dayItem.dateIso;
                const isWeekendDay = dayItem.dayStatus.isWeekend;
                const isHolidayDay = Boolean(dayItem.dayStatus.holidayName);

                return (
                  <div
                    key={`${dayItem.dateIso}-${idx}`}
                    onDragOver={(e) => handleDragOver(e, dayItem.dateIso)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, dayItem.dateIso)}
                    className={`min-h-[110px] sm:min-h-[130px] p-1.5 rounded-2xl border transition-all flex flex-col justify-between relative ${
                      !dayItem.isCurrentMonth
                        ? 'bg-slate-50/40 border-slate-100 text-slate-400 opacity-60'
                        : isWeekendDay
                        ? 'bg-rose-50/30 border-rose-100/80'
                        : isHolidayDay
                        ? 'bg-amber-50/40 border-amber-200'
                        : 'bg-white border-slate-200 hover:border-emerald-300 shadow-2xs'
                    } ${
                      isDragOverTarget
                        ? 'ring-4 ring-emerald-500 bg-emerald-100/50 scale-[1.02] shadow-lg border-emerald-400 z-20'
                        : ''
                    }`}
                  >
                    {/* Header Row: Gregorian Day + Dual Hijri Day */}
                    <div className="flex items-start justify-between gap-1 pb-1 border-b border-slate-100">
                      <div className="flex items-baseline gap-1">
                        <span
                          className={`text-xs sm:text-sm font-black font-['Tajawal'] ${
                            !dayItem.isCurrentMonth
                              ? 'text-slate-400'
                              : isWeekendDay
                              ? 'text-rose-700'
                              : 'text-slate-900'
                          }`}
                        >
                          {toArabicDigits(dayItem.dayNumber)}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400">
                          {dayItem.dateObj.toLocaleString('ar-EG', { month: 'short' })}
                        </span>
                      </div>

                      {/* Hijri Day Badge */}
                      <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-md text-[9px] font-black tracking-tight">
                        {toArabicDigits(dayItem.hijriInfo.day)} {dayItem.hijriInfo.monthName.split(' ')[0]}
                      </span>
                    </div>

                    {/* Holiday or Weekend Banner if applicable */}
                    {isHolidayDay && (
                      <div className="my-0.5 px-1 py-0.5 bg-amber-100 text-amber-900 rounded-md text-[9px] font-bold truncate border border-amber-300">
                        🎉 {dayItem.dayStatus.holidayName}
                      </div>
                    )}

                    {/* Day Tasks Stack */}
                    <div className="flex-1 my-1 space-y-1 overflow-y-auto max-h-[80px]">
                      {dayItem.tasks.map((task) => {
                        const typeCfg = TASK_TYPE_CONFIG[task.type] || TASK_TYPE_CONFIG.grasps;
                        const isCurrentlyDragged = draggedTaskId === task.id;

                        return (
                          <div
                            key={task.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            onClick={() => handleEditTask(task)}
                            className={`p-1.5 rounded-xl border text-[10px] font-bold cursor-grab active:cursor-grabbing transition-all hover:scale-[1.02] shadow-2xs group relative ${
                              typeCfg.bg
                            } ${typeCfg.text} ${typeCfg.border} ${
                              isCurrentlyDragged ? 'opacity-40 ring-2 ring-slate-900' : ''
                            }`}
                            title={`سحب النقل: ${task.title} (${task.weightPoints} درجة) - انقر للتعديل`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className="truncate max-w-[90%]">
                                {typeCfg.iconStr} {task.title}
                              </span>
                              <Move className="w-2.5 h-2.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            </div>

                            <div className="flex items-center justify-between text-[9px] opacity-90 border-t border-black/10 pt-0.5">
                              <span className="truncate">{task.subject}</span>
                              <span className="px-1 bg-white/70 rounded-md font-mono text-[9px] tabular-nums">
                                {toArabicDigits(task.weightPoints)}د
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Day Footer Status Indicator */}
                    <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[9px]">
                      {dayItem.tasks.length > 0 ? (
                        <span
                          className={`font-black px-1.5 py-0.2 rounded-md ${
                            dayItem.workloadLevel === 'heavy'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : dayItem.workloadLevel === 'medium'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}
                        >
                          {toArabicDigits(dayItem.tasks.length)} مهام ({toArabicDigits(dayItem.totalPoints)}د)
                        </span>
                      ) : (
                        <span className="text-slate-300 text-[9px]">متاح</span>
                      )}

                      {isDragOverTarget && (
                        <span className="text-emerald-700 font-black animate-pulse">إسقاط هنا 🎯</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Assessment Tasks List & Quick Management Section */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ListFilter className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-black font-['Tajawal'] text-slate-900">
                  قائمة كافة مهام التقويم المجدولة بالمحاكي ({toArabicDigits(tasks.length)})
                </h3>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                <span>إجمالي درجات التقييم:</span>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 rounded-full border border-emerald-300 font-mono tabular-nums">
                  {toArabicDigits(totalPointsAll)} درجة
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {tasks.map((task) => {
                const typeCfg = TASK_TYPE_CONFIG[task.type] || TASK_TYPE_CONFIG.grasps;
                const dualDate = formatDualCalendarDate(task.dueDate);

                return (
                  <div
                    key={task.id}
                    className={`p-3.5 rounded-2xl border bg-slate-50/80 hover:bg-white transition-all space-y-2 border-slate-200 hover:border-emerald-300 shadow-2xs group relative`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black border ${typeCfg.bg} ${typeCfg.text} ${typeCfg.border}`}
                        >
                          {typeCfg.iconStr} {typeCfg.label}
                        </span>
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-emerald-800 transition-colors">
                          {task.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleEditTask(task)}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="تعديل"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between text-[11px] text-slate-600 gap-1">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-bold text-slate-800">{dualDate.gregorianFull}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono text-emerald-700 font-black">
                          {toArabicDigits(task.weightPoints)} درجة
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 5. Add / Edit Task Sub-Modal Overlay */}
        {isAddTaskModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 space-y-4 text-right animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-black font-['Tajawal'] text-slate-900">
                  {editingTask ? 'تعديل مهمة تقويم تربوي' : 'إضافة مهمة تقويم جديدة للمحاكي'}
                </h3>
                <button
                  onClick={() => setIsAddTaskModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTask} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    عنوان مهمة التقويم:
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="مثال: مهمة GRASPS لتمثيل أرقام فلسطين أو اختبار تحصيلي قصير..."
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      نوع التقويم:
                    </label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as AssessmentTask['type'])}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-emerald-500"
                    >
                      {Object.entries(TASK_TYPE_CONFIG).map(([key, cfg]) => (
                        <option key={key} value={key}>
                          {cfg.iconStr} {cfg.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      تاريخ التسليم (الموعد):
                    </label>
                    <input
                      type="date"
                      required
                      value={formDueDate}
                      onChange={(e) => setFormDueDate(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      المادة الدراسية:
                    </label>
                    <input
                      type="text"
                      value={formSubject}
                      onChange={(e) => setFormSubject(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      الوزن النسبي (الدرجات):
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={formPoints}
                      onChange={(e) => setFormPoints(Number(e.target.value))}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الوصف والملاحظات التعليمية:
                  </label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="ملاحظات حول طريقة التسليم أو الشروط التقييمية..."
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddTaskModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md"
                  >
                    {editingTask ? 'حفظ التعديلات' : 'إضافة إلى المحاكي'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
