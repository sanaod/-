import React, { useState, useMemo } from 'react';
import { LessonPlan } from '../types/lessonPlan';
import { toArabicDigits } from '../utils/arabicNumerals';
import {
  FolderKanban,
  BookOpen,
  Search,
  X,
  CheckCircle2,
  Trash2,
  Printer,
  ArrowUpRight,
  Sparkles,
  FileEdit,
  Clock,
  Calendar,
  Layers,
  LayoutDashboard,
  Boxes,
  CalendarRange,
  Database,
} from 'lucide-react';

interface PlansViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: LessonPlan[];
  activePlanId: string;
  onSelectPlan: (id: string) => void;
  onRequestDeletePlan: (plan: LessonPlan) => void;
  onOpenEditor: () => void;
  onOpenPrintView: (planId: string) => void;
  onOpenNewBlank?: () => void;
  onOpenAiGenerator?: () => void;
  onOpenUnitPlanModal?: () => void;
  onOpenSemesterPlanModal?: () => void;
  onGoToDashboard?: () => void;
  onOpenBackupRestore?: () => void;
}

export const PlansViewerModal: React.FC<PlansViewerModalProps> = ({
  isOpen,
  onClose,
  plans,
  activePlanId,
  onSelectPlan,
  onRequestDeletePlan,
  onOpenEditor,
  onOpenPrintView,
  onOpenNewBlank,
  onOpenAiGenerator,
  onOpenUnitPlanModal,
  onOpenSemesterPlanModal,
  onGoToDashboard,
  onOpenBackupRestore,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  // Extract unique subjects
  const subjectList = useMemo(() => {
    const set = new Set<string>();
    plans.forEach((p) => {
      const s = p.header?.subject?.split('-')[0]?.trim();
      if (s) set.add(s);
    });
    return Array.from(set);
  }, [plans]);

  // Filter plans
  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const matchSubject =
        selectedSubject === 'all' ||
        (plan.header?.subject || '').toLowerCase().includes(selectedSubject.toLowerCase());
      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        query === '' ||
        (plan.header?.lessonTitle || plan.title || '').toLowerCase().includes(query) ||
        (plan.header?.subject || '').toLowerCase().includes(query) ||
        (plan.header?.teacherName || '').toLowerCase().includes(query) ||
        (plan.header?.grade || '').toLowerCase().includes(query);
      return matchSubject && matchSearch;
    });
  }, [plans, selectedSubject, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="plans-viewer-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 text-right"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-linear-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-4 sm:p-5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0 border border-white/30 shadow-inner">
              <FolderKanban className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="plans-viewer-modal-title" className="text-base sm:text-lg font-black font-['Tajawal']">
                  سجل وعرض الخطط الدراسية المحفوظة
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100 border border-emerald-400/40 tabular-nums">
                  {toArabicDigits(plans.length)} خطة
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                استعراض الخطط والتبديل المباشر بينها، أو حذف أي خطة عند وجود أخطاء فيها
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenBackupRestore && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenBackupRestore();
                }}
                className="px-3 py-1.5 bg-amber-400 text-amber-950 hover:bg-amber-300 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                title="تصدير كافة الخطط كملف JSON أو استيراد نسخة احتياطية"
              >
                <Database className="w-3.5 h-3.5" />
                <span>نسخ احتياطي / استيراد</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-colors shrink-0 cursor-pointer"
              title="إغلاق النافذة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Subject Filter Bar */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 space-y-2.5 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="بحث بالدرس، المبحث، المعلم، الصف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-9 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Subject Selector */}
            <div className="flex items-center gap-1 shrink-0">
              <BookOpen className="w-4 h-4 text-emerald-600 hidden sm:block" />
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="text-xs bg-white font-semibold text-slate-800 rounded-xl px-3 py-2 border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 w-full sm:w-auto"
              >
                <option value="all">كافة المباحث ({toArabicDigits(plans.length)})</option>
                {subjectList.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Plans List Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 divide-y divide-slate-100">
          {filteredPlans.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">لا توجد خطط تطابق البحث</h4>
              <p className="text-xs text-slate-500">جرب مسح عبارة البحث أو اختيار مبحث آخر</p>
            </div>
          ) : (
            filteredPlans.map((plan) => {
              const isCurrent = plan.id === activePlanId;
              const lessonTitle = plan.header?.lessonTitle || plan.title || 'استمارة تحضير مفرغة';
              const subject = plan.header?.subject || 'مبحث تعليمي';
              const teacher = plan.header?.teacherName || 'غير محدد';
              const grade = plan.header?.grade || 'غير محدد';

              return (
                <div
                  key={plan.id}
                  className={`pt-3 first:pt-0 p-3 sm:p-4 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Plan Info */}
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {lessonTitle}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>الخطة النشطة حالياً بالمحرر</span>
                          </span>
                        )}
                        <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          {grade}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500 pt-0.5">
                        <span className="font-semibold text-slate-700">
                          المبحث: {subject}
                        </span>
                        <span>·</span>
                        <span>المعلم: {teacher}</span>
                        <span>·</span>
                        <span className="tabular-nums">
                          {toArabicDigits(plan.header?.totalPeriods || 1)} حصص ({toArabicDigits(plan.header?.periodDurationMinutes || 40)} د / حصة)
                        </span>
                        <span>·</span>
                        <span>{plan.header?.date || '٢٠٢٦م'}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0 self-start md:self-center">
                      <button
                        onClick={() => {
                          onSelectPlan(plan.id);
                          onOpenEditor();
                          onClose();
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                          isCurrent
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                        title="فتح وتحرير هذه الخطة في المحرر"
                      >
                        <span>{isCurrent ? 'الاستمرار بالتحرير' : 'اختيار وتفعيل'}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          onSelectPlan(plan.id);
                          onOpenPrintView(plan.id);
                          onClose();
                        }}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
                        title="معاينة وطباعة رسمية A4"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {/* Explicit Delete Button when Plan has errors */}
                      <button
                        onClick={() => onRequestDeletePlan(plan)}
                        className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                        title="حذف هذه الخطة عند وجود أخطاء في التحضير"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>حذف (أخطاء)</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer Quick Shortcuts */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5 shrink-0 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {onOpenUnitPlanModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenUnitPlanModal();
                }}
                className="px-3 py-1.5 bg-linear-to-r from-blue-700 via-indigo-700 to-purple-800 hover:from-blue-800 hover:to-purple-900 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer group"
                title="توليد تحضير وحدة دراسية كاملة بالذكاء الاصطناعي بمجموع دروسها"
              >
                <Boxes className="w-3.5 h-3.5 text-blue-200 group-hover:scale-110 transition-transform" />
                <span>تحضير وحدة كاملة (AI)</span>
              </button>
            )}
            {onOpenSemesterPlanModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSemesterPlanModal();
                }}
                className="px-3 py-1.5 bg-linear-to-r from-teal-700 via-emerald-800 to-cyan-800 hover:from-teal-800 hover:to-cyan-900 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer group"
                title="توليد وعرض الخطة الفصلية الموحدة ودليل توزيع الحصص"
              >
                <CalendarRange className="w-3.5 h-3.5 text-cyan-200 group-hover:scale-110 transition-transform" />
                <span>الخطة الفصلية وتوزيع الحصص</span>
              </button>
            )}
            {onGoToDashboard && (
              <button
                onClick={() => {
                  onClose();
                  onGoToDashboard();
                }}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-emerald-700" />
                <span>لوحة الإنتاجية والمجلدات المفهرسة</span>
              </button>
            )}
            {onOpenNewBlank && (
              <button
                onClick={() => {
                  onClose();
                  onOpenNewBlank();
                }}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl font-bold flex items-center gap-1.5 transition-colors"
              >
                <FileEdit className="w-3.5 h-3.5 text-amber-700" />
                <span>استمارة مفرغة جديدة</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
