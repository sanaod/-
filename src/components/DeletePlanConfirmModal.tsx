import React, { useState, useEffect } from 'react';
import { LessonPlan } from '../types/lessonPlan';
import { toArabicDigits } from '../utils/arabicNumerals';
import {
  AlertTriangle,
  Trash2,
  X,
  RotateCcw,
  BookOpen,
  User,
  ShieldAlert,
  ShieldCheck,
  Lock,
  KeyRound,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface DeletePlanConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: LessonPlan;
  onConfirmDelete: (planId: string) => void;
  onClearFieldsInstead?: () => void;
}

// Allowed passcodes for Designer Abdurrahman Dweikat authorization
const DESIGNER_PASSCODES = ['دويكات', '2026', '00972569560022', 'abdurrahman', 'عبدالرحمن'];

export const DeletePlanConfirmModal: React.FC<DeletePlanConfirmModalProps> = ({
  isOpen,
  onClose,
  plan,
  onConfirmDelete,
  onClearFieldsInstead,
}) => {
  const [enteredCode, setEnteredCode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEnteredCode('');
      setAuthError(null);
      setIsAuthorized(false);
    }
  }, [isOpen]);

  if (!isOpen || !plan) return null;

  const planTitle = plan.header?.lessonTitle || plan.title || 'خطة الدرس الحالية';
  const planSubject = plan.header?.subject || 'مبحث تعليمي';
  const teacherName = plan.header?.teacherName || 'غير محدد';
  const grade = plan.header?.grade || 'غير محدد';

  const handleVerifyAndConfirmDelete = () => {
    const trimmed = enteredCode.trim().toLowerCase();
    const isCodeValid = DESIGNER_PASSCODES.some((code) => trimmed === code.toLowerCase());

    if (!isCodeValid && !isAuthorized) {
      setAuthError('عذراً، حذف الخطة مقتصر حصراً على الأستاذ عبد الرحمن دويكات (مصمم المنظومة). يرجى إدخال رمز التحقق الأمني المعتمد.');
      return;
    }

    onConfirmDelete(plan.id);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-plan-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 text-right font-['Tajawal']"
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header with Designer Authority Branding & Security Warning */}
        <div className="bg-linear-to-r from-rose-900 via-rose-800 to-red-900 text-white p-5 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 border border-white/30 shadow-inner">
              <ShieldAlert className="w-6 h-6 text-rose-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold mb-0.5">
                <Lock className="w-3.5 h-3.5" />
                <span>صلاحية أمنية محصورة بمصمم المنظومة</span>
              </div>
              <h3 id="delete-plan-modal-title" className="text-lg font-black flex items-center gap-2">
                <span>حذف الخطة · إشراف أ. عبد الرحمن دويكات</span>
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors shrink-0"
            title="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Official Policy Banner */}
          <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl space-y-1 text-amber-950">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>سياسة الأمان وحماية الخطط التربوية:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-900">
              بناءً على المعايير الوزارية وحماية جهود المعلمين من الحذف العرضي أو فقدان السجلات، فإن <strong>حذف أي خطة نهائياً من قاعدة بيانات المنظومة هو صلاحية حصرية للأستاذ عبد الرحمن دويكات (مصمم ومطور المنظومة)</strong>.
            </p>
          </div>

          {/* Target Plan Details Card */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <div className="text-[11px] font-bold text-slate-500">الخطة المستهدفة بالحذف:</div>
            <div className="font-black text-slate-900 text-sm">{planTitle}</div>
            <div className="flex flex-wrap items-center gap-2.5 text-slate-600 text-[11px] pt-1 border-t border-slate-200">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                <span>{planSubject}</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>المعلم: {teacherName}</span>
              </span>
              <span>·</span>
              <span className="bg-white px-2 py-0.2 rounded-md border border-slate-200 font-semibold">
                {grade}
              </span>
            </div>
          </div>

          {/* Verification Input for Designer Abdurrahman Dweikat */}
          <div className="p-3.5 bg-rose-50/50 border border-rose-200 rounded-xl space-y-2.5">
            <label className="block font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-rose-700" />
                <span>رمز التحقق والاعتماد لمصمم المنظومة (أ. عبد الرحمن دويكات):</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">مطلوب للتأكيد</span>
            </label>

            <div className="relative">
              <input
                type="password"
                placeholder="أدخل رمز التحقق الأمني المعتمد..."
                value={enteredCode}
                onChange={(e) => {
                  setEnteredCode(e.target.value);
                  setAuthError(null);
                }}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-rose-500 shadow-2xs"
              />
            </div>

            {authError && (
              <div className="p-2.5 bg-rose-100/80 border border-rose-300 rounded-lg text-rose-900 text-[11px] font-bold flex items-start gap-1.5 animate-shake">
                <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <div className="text-[10px] text-slate-500 leading-normal flex items-center gap-1">
              <span>💡</span>
              <span>
                رمز التحقق متاح للأستاذ عبد الرحمن دويكات للتأكيد المباشر لحذف الخطط ذات الأخطاء الجسيمة.
              </span>
            </div>
          </div>

          {/* Alternative action for general teachers */}
          {onClearFieldsInstead && (
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-[11px]">
              <div className="text-emerald-900 font-medium">
                <strong>للمعلمين:</strong> هل ترغب في تفريغ الحقول وإعادة الكتابة دون حذف الخطة؟
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onClearFieldsInstead();
                }}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shrink-0 flex items-center gap-1 transition-colors shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>تفريغ الحقول فقط</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-colors"
          >
            إلغاء والتراجع
          </button>

          <button
            onClick={handleVerifyAndConfirmDelete}
            className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-97"
          >
            <Trash2 className="w-4 h-4" />
            <span>تأكيد الحذف بصلاحية أ. عبد الرحمن دويكات</span>
          </button>
        </div>
      </div>
    </div>
  );
};
