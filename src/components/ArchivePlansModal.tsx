import React from 'react';
import { LessonPlan } from '../types/lessonPlan';
import { toArabicDigits } from '../utils/arabicNumerals';
import { Archive, X, RotateCcw, Trash2, BookOpen, ShieldCheck } from 'lucide-react';

interface ArchivePlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: LessonPlan[];
  onToggleArchive: (planId: string) => void;
  onDeletePlan: (planId: string) => void;
  onSelectPlan: (planId: string) => void;
  onOpenEditor: () => void;
}

export const ArchivePlansModal: React.FC<ArchivePlansModalProps> = ({
  isOpen,
  onClose,
  plans,
  onToggleArchive,
  onDeletePlan,
  onSelectPlan,
  onOpenEditor,
}) => {
  if (!isOpen) return null;

  const archivedPlans = plans.filter((p) => p.isArchived);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="archive-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200 text-right"
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 text-white p-5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <Archive className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="archive-modal-title" className="text-lg font-black font-['Tajawal']">
                  أرشيف الخطط الدراسية غير النشطة
                </h3>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 tabular-nums">
                  {toArabicDigits(archivedPlans.length)} خطة مؤرشفة
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                نقل الخطط غير النشطة إلى الأرشيف لاستعادة مساحة لوحة التحكم الرئيسية وإدارتها بسهولة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3 bg-slate-50/60">
          {archivedPlans.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-2xl">
                📂
              </div>
              <h4 className="text-base font-black text-slate-800 font-['Tajawal']">الأرشيف فارغ حالياً</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                لا توجد أي خطط مؤرشفة. يمكنك أرشفة الخطط القديمة أو غير النشطة من لوحة التحكم لتنظيم مساحتك وجعلها أكثر سرعة.
              </p>
            </div>
          ) : (
            archivedPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-amber-400/60 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-lg text-[10px] font-black">
                      مؤرشف 📁
                    </span>
                    <h4 className="text-sm font-black text-slate-900 font-['Tajawal']">
                      {plan.title || plan.header?.lessonTitle || 'خطة درس بدون عنوان'}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {plan.header?.subject || 'المبحث'} • {plan.header?.grade || 'الصف'} • المديرية: {plan.header?.directorate || 'فلسطين'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Restore button */}
                  <button
                    type="button"
                    onClick={() => {
                      onToggleArchive(plan.id);
                    }}
                    className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    title="استعادة الخطة إلى لوحة التحكم الرئيسية"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>استعادة</span>
                  </button>

                  {/* Open plan */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectPlan(plan.id);
                      onOpenEditor();
                      onClose();
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    معاينة
                  </button>

                  {/* Delete permanently */}
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('هل أنت متأكد من حذف هذه الخطة المؤرشفة نهائياً؟')) {
                        onDeletePlan(plan.id);
                      }
                    }}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                    title="حذف نهائي"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>الخطط المؤرشفة لا تظهر في قائمة لوحة التحكم الرئيسية، مما يوفر مساحة واسعة للعمل.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all cursor-pointer"
          >
            إغلاق الأرشيف
          </button>
        </div>
      </div>
    </div>
  );
};
