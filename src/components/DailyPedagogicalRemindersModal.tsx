import React, { useState, useMemo } from 'react';
import {
  X,
  Bell,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  FileEdit,
  Calendar,
  Clock,
  BookOpen,
  Sparkles,
  Layers,
  BrainCircuit,
  Calculator,
  Award,
  CalendarDays,
  Tag,
  Printer,
  Search,
  Filter,
  AlertCircle,
  ExternalLink,
  Check,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import {
  DailyPedagogicalReminder,
  ReminderCategory,
  ReminderPriority,
  REMINDER_CATEGORY_CONFIG,
} from '../types/dailyReminder';
import { LessonPlan } from '../types/lessonPlan';
import { toArabicDigits } from '../utils/arabicNumerals';
import { formatDateToIso } from '../utils/palestinianCalendar';

interface DailyPedagogicalRemindersModalProps {
  isOpen: boolean;
  onClose: () => void;
  reminders: DailyPedagogicalReminder[];
  onAddReminder: (reminder: Omit<DailyPedagogicalReminder, 'id' | 'createdAt'>) => void;
  onUpdateReminder: (reminder: DailyPedagogicalReminder) => void;
  onDeleteReminder: (id: string) => void;
  onToggleComplete: (id: string) => void;
  plans: LessonPlan[];
  onSelectPlan?: (planId: string) => void;
  onOpenEditor?: () => void;
}

export const DailyPedagogicalRemindersModal: React.FC<DailyPedagogicalRemindersModalProps> = ({
  isOpen,
  onClose,
  reminders,
  onAddReminder,
  onUpdateReminder,
  onDeleteReminder,
  onToggleComplete,
  plans,
  onSelectPlan,
  onOpenEditor,
}) => {
  const todayStr = useMemo(() => formatDateToIso(new Date()), []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return formatDateToIso(d);
  }, []);

  // Filter state
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State for Adding/Editing Reminder
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState(todayStr);
  const [formTime, setFormTime] = useState('08:15 ص');
  const [formCategory, setFormCategory] = useState<ReminderCategory>('lesson_prep');
  const [formPriority, setFormPriority] = useState<ReminderPriority>('medium');
  const [formNote, setFormNote] = useState('');
  const [formLinkedPlanId, setFormLinkedPlanId] = useState<string>('');

  if (!isOpen) return null;

  // Selected Linked Plan Object
  const selectedLinkedPlan = plans.find((p) => p.id === formLinkedPlanId);

  const handleOpenAddForm = (prefillCategory?: ReminderCategory, prefillPlan?: LessonPlan) => {
    setEditingReminderId(null);
    setFormTitle('');
    setFormDate(todayStr);
    setFormTime('08:15 ص');
    setFormCategory(prefillCategory || 'lesson_prep');
    setFormPriority('medium');
    setFormNote('');
    setFormLinkedPlanId(prefillPlan?.id || (plans[0]?.id || ''));
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (rem: DailyPedagogicalReminder) => {
    setEditingReminderId(rem.id);
    setFormTitle(rem.title);
    setFormDate(rem.date);
    setFormTime(rem.time || '08:15 ص');
    setFormCategory(rem.category);
    setFormPriority(rem.priority);
    setFormNote(rem.note || '');
    setFormLinkedPlanId(rem.linkedPlanId || '');
    setIsFormOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const linkedPlan = plans.find((p) => p.id === formLinkedPlanId);

    if (editingReminderId) {
      const existing = reminders.find((r) => r.id === editingReminderId);
      if (existing) {
        onUpdateReminder({
          ...existing,
          title: formTitle.trim(),
          date: formDate,
          time: formTime,
          category: formCategory,
          priority: formPriority,
          note: formNote.trim(),
          linkedPlanId: formLinkedPlanId || undefined,
          linkedPlanTitle: linkedPlan ? linkedPlan.header.lessonTitle || linkedPlan.title : undefined,
          linkedSubject: linkedPlan?.header.subject,
          linkedGrade: linkedPlan?.header.grade,
        });
      }
    } else {
      onAddReminder({
        title: formTitle.trim(),
        date: formDate,
        time: formTime,
        category: formCategory,
        priority: formPriority,
        note: formNote.trim(),
        linkedPlanId: formLinkedPlanId || undefined,
        linkedPlanTitle: linkedPlan ? linkedPlan.header.lessonTitle || linkedPlan.title : undefined,
        linkedSubject: linkedPlan?.header.subject,
        linkedGrade: linkedPlan?.header.grade,
        completed: false,
        tags: [REMINDER_CATEGORY_CONFIG[formCategory].label],
      });
    }

    setIsFormOpen(false);
  };

  // Quick template helper
  const handleApplyTemplate = (
    templateTitle: string,
    cat: ReminderCategory,
    noteText: string,
    prio: ReminderPriority = 'medium'
  ) => {
    const plan = selectedLinkedPlan || plans[0];
    const resolvedTitle = plan
      ? `${templateTitle}: ${plan.header.lessonTitle || plan.title}`
      : templateTitle;

    setFormTitle(resolvedTitle);
    setFormCategory(cat);
    setFormPriority(prio);
    setFormNote(noteText);
  };

  // Filtered list
  const filteredReminders = useMemo(() => {
    return reminders.filter((rem) => {
      // Date Filter
      if (dateFilter === 'today' && rem.date !== todayStr) return false;
      if (dateFilter === 'upcoming' && rem.date < todayStr) return false;
      if (dateFilter === 'completed' && !rem.completed) return false;

      // Category Filter
      if (categoryFilter !== 'all' && rem.category !== categoryFilter) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = rem.title.toLowerCase().includes(q);
        const matchNote = rem.note?.toLowerCase().includes(q);
        const matchPlan = rem.linkedPlanTitle?.toLowerCase().includes(q);
        const matchSubject = rem.linkedSubject?.toLowerCase().includes(q);
        if (!matchTitle && !matchNote && !matchPlan && !matchSubject) return false;
      }

      return true;
    });
  }, [reminders, dateFilter, categoryFilter, searchQuery, todayStr]);

  // Statistics
  const stats = useMemo(() => {
    const total = reminders.length;
    const completed = reminders.filter((r) => r.completed).length;
    const todayCount = reminders.filter((r) => r.date === todayStr && !r.completed).length;
    const highPriority = reminders.filter((r) => r.priority === 'high' && !r.completed).length;
    return { total, completed, todayCount, highPriority };
  }, [reminders, todayStr]);

  const handlePrintDailyAgenda = () => {
    window.print();
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-linear-to-r from-amber-600 via-amber-700 to-amber-800 text-slate-950 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 shadow-xs border-b border-amber-500/40">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-white/90 text-amber-900 rounded-2xl shadow-md">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black font-['Tajawal'] text-white">
                  الملاحظات التذكيرية اليومية والمهام المجدولة
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-white/20 text-white border border-white/30">
                  {toArabicDigits(stats.total)} ملاحظة
                </span>
              </div>
              <p className="text-xs text-amber-100 mt-1">
                تنظيم وجدولة التذكيرات الصفية والمهام التربوية المرتبطة بخطط الدروس المحفوظة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => handleOpenAddForm()}
              className="px-4 py-2 bg-white hover:bg-amber-50 text-amber-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs hover:shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-800" />
              <span>إضافة تذكير جديد</span>
            </button>

            <button
              type="button"
              onClick={handlePrintDailyAgenda}
              className="p-2 bg-black/10 hover:bg-black/20 text-white rounded-xl transition-colors cursor-pointer"
              title="طباعة جدول التذكيرات"
            >
              <Printer className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 bg-black/10 hover:bg-black/20 text-white rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top KPI Ribbon */}
        <div className="bg-amber-50/70 border-b border-amber-200/80 px-5 py-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 shrink-0" />
            <span className="text-slate-600 font-medium">تذكيرات اليوم:</span>
            <strong className="text-amber-900 font-bold">{toArabicDigits(stats.todayCount)}</strong>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0" />
            <span className="text-slate-600 font-medium">أولوية عاجلة (عالية):</span>
            <strong className="text-rose-900 font-bold">{toArabicDigits(stats.highPriority)}</strong>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
            <span className="text-slate-600 font-medium">المهام المنجزة:</span>
            <strong className="text-emerald-900 font-bold">{toArabicDigits(stats.completed)}</strong>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" />
            <span className="text-slate-600 font-medium">الخطط المرتبطة:</span>
            <strong className="text-indigo-900 font-bold">{toArabicDigits(plans.length)} خطة</strong>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-slate-50/50">
          {/* Add / Edit Form Collapsible Card */}
          {isFormOpen && (
            <form
              onSubmit={handleSaveForm}
              className="bg-white border-2 border-amber-400 rounded-3xl p-5 sm:p-6 shadow-md space-y-4 animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-500 text-slate-950 rounded-lg">
                    <FileEdit className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-black font-['Tajawal'] text-slate-900">
                    {editingReminderId ? 'تعديل الملاحظة التذكيرية' : 'إضافة ملاحظة تذكيرية يومية جديدة'}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
              </div>

              {/* Quick Template Buttons */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 block">
                  نماذج سريعة للمهام التربوية الشائعة:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      handleApplyTemplate(
                        'تجهيز بطاقات الخروج Exit Tickets',
                        'formative_eval',
                        'طباعة وتوزيع بطاقات الخروج للتقويم التكويني الختامي للدرس.',
                        'high'
                      )
                    }
                    className="px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border border-cyan-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    🎟️ بطاقات خروج
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleApplyTemplate(
                        'تجهيز المحاكيات والوسائل الرقمية والمحسوسات',
                        'resources',
                        'تشغيل محاكي المعداد الصيني التفاعلي وتجهيز مجسمات الأشكال الهندسية.',
                        'medium'
                      )
                    }
                    className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    🧪 وسائل ومحاكاة
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleApplyTemplate(
                        'تطبيق ومتابعة مهمة GRASPS الأصيلة',
                        'grasps_task',
                        'توزيع سلم التقدير اللفظي (Rubric) وتقويم أداء المجموعات في المهمة الواقعية.',
                        'high'
                      )
                    }
                    className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    🎯 مهمة GRASPS
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleApplyTemplate(
                        'تنفيذ النشاط العلاجي والدعم الفردي',
                        'remedial',
                        'متابعة الطلبة ذوي الحاجة لتعزيز الفهم المفاهيمي وتذليل الفجوات.',
                        'medium'
                      )
                    }
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    🩹 خطة علاجية
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleApplyTemplate(
                        'تدوين التأمل الذاتي والتغذية الراجعة',
                        'reflection',
                        'رصد الملاحظات الصفية وتوثيق مدى تفاعل الطلاب في دفتر الإعداد.',
                        'low'
                      )
                    }
                    className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    💡 تأمل ذاتي
                  </button>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
                {/* Title */}
                <div className="sm:col-span-8 space-y-1">
                  <label className="text-xs font-bold text-slate-700">عنوان الملاحظة التذكيرية *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="مثال: تجهيز محسوسات درس القيمة المنزلية وبطاقات العمل التشاركي..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Date */}
                <div className="sm:col-span-4 space-y-1">
                  <label className="text-xs font-bold text-slate-700">تاريخ التذكير المجدول *</label>
                  <div className="flex gap-1.5">
                    <input
                      type="date"
                      required
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setFormDate(todayStr)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-bold shrink-0 cursor-pointer"
                    >
                      اليوم
                    </button>
                  </div>
                </div>

                {/* Linked Plan Selector */}
                <div className="sm:col-span-6 space-y-1">
                  <label className="text-xs font-bold text-slate-700">ربط بخطة درس من الخطط الحالية</label>
                  <select
                    value={formLinkedPlanId}
                    onChange={(e) => setFormLinkedPlanId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">-- بدون ربط بخطة محددة (ملاحظة عامة) --</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.header.subject} | {p.header.lessonTitle || p.title} ({p.header.grade})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div className="sm:col-span-3 space-y-1">
                  <label className="text-xs font-bold text-slate-700">تصنيف المهمة</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ReminderCategory)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500"
                  >
                    {Object.entries(REMINDER_CATEGORY_CONFIG).map(([key, cfg]) => (
                      <option key={key} value={key}>
                        {cfg.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div className="sm:col-span-3 space-y-1">
                  <label className="text-xs font-bold text-slate-700">مستوى الأولوية</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as ReminderPriority)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="high">🔴 عاجلة (عالية)</option>
                    <option value="medium">🟡 متوسطة</option>
                    <option value="low">🟢 عادية (منخفضة)</option>
                  </select>
                </div>

                {/* Time */}
                <div className="sm:col-span-3 space-y-1">
                  <label className="text-xs font-bold text-slate-700">وقت التذكير / الحصة</label>
                  <input
                    type="text"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    placeholder="مثال: 08:30 ص أو الحصة الأولى"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Note Description */}
                <div className="sm:col-span-9 space-y-1">
                  <label className="text-xs font-bold text-slate-700">تفاصيل الملاحظة والإجراء التربوي المطلوب</label>
                  <input
                    type="text"
                    value={formNote}
                    onChange={(e) => setFormNote(e.target.value)}
                    placeholder="اكتب تفاصيل إضافية أو تنبيهات خاصة لتنفيذ النشاط الصفي بدقة..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingReminderId ? 'تحديث التذكير' : 'حفظ وإدراج التذكير'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Search & Filter Toolbar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Date Filters */}
            <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setDateFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  dateFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                الكل ({toArabicDigits(reminders.length)})
              </button>
              <button
                type="button"
                onClick={() => setDateFilter('today')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  dateFilter === 'today'
                    ? 'bg-amber-500 text-slate-950 shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                تذكيرات اليوم ({toArabicDigits(stats.todayCount)})
              </button>
              <button
                type="button"
                onClick={() => setDateFilter('upcoming')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  dateFilter === 'upcoming'
                    ? 'bg-indigo-700 text-white shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                القادمة
              </button>
              <button
                type="button"
                onClick={() => setDateFilter('completed')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  dateFilter === 'completed'
                    ? 'bg-emerald-700 text-white shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                المنجزة ({toArabicDigits(stats.completed)})
              </button>
            </div>

            {/* Category Filter & Search */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="all">كافة التصنيفات</option>
                {Object.entries(REMINDER_CATEGORY_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>
                    {cfg.label}
                  </option>
                ))}
              </select>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="بحث في الملاحظات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-40 sm:w-48 text-xs pl-3 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Reminders List */}
          <div className="space-y-3">
            {filteredReminders.length === 0 ? (
              <div className="py-14 text-center bg-white border border-slate-200 rounded-3xl p-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-2xs">
                  <Bell className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-black text-slate-800 font-['Tajawal']">
                  لا توجد ملاحظات تذكيرية تطابق المعايير المحددة
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  يمكنك إضافة تذكير يومي للمهام التربوية، أو ربط التذكيرات مباشرة بخطط الدروس الحالية.
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenAddForm()}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة أول تذكير الآن</span>
                </button>
              </div>
            ) : (
              filteredReminders.map((rem) => {
                const isToday = rem.date === todayStr;
                const isTomorrow = rem.date === tomorrowStr;
                const catConfig = REMINDER_CATEGORY_CONFIG[rem.category] || REMINDER_CATEGORY_CONFIG.general;

                return (
                  <div
                    key={rem.id}
                    className={`bg-white border rounded-2xl p-4 transition-all shadow-2xs hover:shadow-xs space-y-3 ${
                      rem.completed
                        ? 'border-slate-200 bg-slate-50/70 opacity-75'
                        : isToday
                        ? 'border-amber-400 ring-2 ring-amber-400/20'
                        : 'border-slate-200 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Checkbox and Title */}
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => onToggleComplete(rem.id)}
                          className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer shrink-0"
                          title={rem.completed ? 'إعادة تعيين كغير منجز' : 'تحديد كمنجز'}
                        >
                          {rem.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4
                              className={`text-xs sm:text-sm font-black font-['Tajawal'] ${
                                rem.completed ? 'line-through text-slate-500' : 'text-slate-900'
                              }`}
                            >
                              {rem.title}
                            </h4>

                            {/* Priority Badge */}
                            {rem.priority === 'high' && (
                              <span className="px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-full text-[10px] font-bold">
                                🔴 عاجلة
                              </span>
                            )}
                            {rem.priority === 'medium' && (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-[10px] font-bold">
                                🟡 متوسطة
                              </span>
                            )}

                            {/* Date Badge */}
                            {isToday && (
                              <span className="px-2 py-0.5 bg-amber-500 text-slate-950 rounded-full text-[10px] font-black shadow-2xs">
                                📌 اليوم
                              </span>
                            )}
                            {isTomorrow && (
                              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-900 rounded-full text-[10px] font-bold">
                                غداً
                              </span>
                            )}

                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${catConfig.bg} ${catConfig.text} ${catConfig.border}`}>
                              {catConfig.label}
                            </span>
                          </div>

                          {/* Note details */}
                          {rem.note && (
                            <p className="text-xs text-slate-600 font-medium leading-relaxed">
                              {rem.note}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <span className="text-[11px] text-slate-500 font-bold flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{rem.date}</span>
                          {rem.time && <span>• {rem.time}</span>}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleOpenEditForm(rem)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors cursor-pointer"
                          title="تعديل الملاحظة"
                        >
                          <FileEdit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteReminder(rem.id)}
                          className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="حذف الملاحظة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Linked Plan Anchor Card */}
                    {rem.linkedPlanTitle && (
                      <div className="mt-2 bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span className="text-slate-500 font-bold">مرتبط بخطة:</span>
                          <strong className="text-slate-900 font-bold">
                            {rem.linkedPlanTitle}
                          </strong>
                          {rem.linkedSubject && (
                            <span className="text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                              {rem.linkedSubject} {rem.linkedGrade ? `(${rem.linkedGrade})` : ''}
                            </span>
                          )}
                        </div>

                        {rem.linkedPlanId && onSelectPlan && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectPlan(rem.linkedPlanId!);
                              if (onOpenEditor) onOpenEditor();
                              onClose();
                            }}
                            className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-indigo-900 border border-indigo-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <span>فتح الخطة للتحضير</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <CalendarDays className="w-4 h-4 text-amber-600" />
            <span>يتم حفظ الملاحظات التذكيرية تلقائياً وربطها بالتقويم الشهري</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors border border-slate-300 cursor-pointer"
            >
              إغلاق
            </button>
            <button
              type="button"
              onClick={() => handleOpenAddForm()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة تذكير</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
