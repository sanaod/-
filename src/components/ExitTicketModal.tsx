import React from 'react';
import { X, Printer, CheckCircle2 } from 'lucide-react';
import { LessonPlan } from '../types/lessonPlan';
import { toArabicDigits } from '../utils/arabicNumerals';

interface ExitTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: LessonPlan;
}

export const ExitTicketModal: React.FC<ExitTicketModalProps> = ({ isOpen, onClose, plan }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const exitPhase = plan.section2Timeline.find((p) => p.phaseName.includes('الخاتمة') || p.phaseName.includes('التقويم'));
  const exitActions = exitPhase?.teacherAndStudentActions || [];

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto text-right"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-linear-to-r from-emerald-800 to-teal-900 text-white p-4 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            <h3 className="text-lg font-bold font-['Tajawal']">بطاقة الخروج السريعة للطلبة (Exit Ticket)</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              طباعة البطاقات
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Cards (Two cards per sheet for economic printing) */}
        <div className="p-6 space-y-6 printable-area bg-slate-50 text-right">
          {[1, 2].map((cardNum) => (
            <div
              key={cardNum}
              className="bg-white border-2 border-dashed border-emerald-500 rounded-2xl p-5 shadow-xs relative overflow-hidden"
            >
              {/* Badge */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-3 mb-4">
                <div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    {plan.header.ministry} - {plan.header.school}
                  </span>
                  <h4 className="text-base font-bold text-slate-800 mt-1">
                    بطاقة الخروج (Exit Ticket) - {plan.header.subject}
                  </h4>
                  <p className="text-xs text-slate-500">
                    الدرس: {toArabicDigits(plan.header.lessonTitle)} | الصف: {plan.header.grade}
                  </p>
                </div>
                <div className="text-right text-xs text-slate-600 space-y-1">
                  <div>اسم الطالب/ـة: ____________________</div>
                  <div>الشعبة: ______ | التاريخ: _________</div>
                </div>
              </div>

              {/* Task Section */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-800 bg-slate-100 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-emerald-700 font-extrabold ml-1">المهمة السريعة المطلوبة:</span>
                  {exitActions.length > 0 ? toArabicDigits(exitActions[0]) : 'أجب عن التحدي الختامي لتأكيد تحقيق نتاجات الحصة بدقة.'}
                </div>

                {/* Response area for student */}
                <div className="border border-slate-300 rounded-xl p-3 min-h-[90px] bg-slate-50/50">
                  <div className="text-[11px] text-slate-400 mb-2">مساحة إجابة الطالب / تفكيك الرقم أو التعبير بالصورة الموسعة:</div>
                  <div className="border-b border-slate-200 my-3"></div>
                  <div className="border-b border-slate-200 my-3"></div>
                </div>

                {/* Self reflection emojis */}
                <div className="flex items-center justify-between pt-2 text-xs text-slate-600">
                  <span className="font-semibold">مدى فهمي لدرس اليوم:</span>
                  <div className="flex items-center gap-4 text-sm">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" className="rounded-sm text-emerald-600" />
                      <span>🌟 ممتاز ومتقن</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" className="rounded-sm text-emerald-600" />
                      <span>👍 أحتاج تدريباً بسيطاً</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" className="rounded-sm text-emerald-600" />
                      <span>❓ أحتاج مساعدة المعلم</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-slate-200 text-center text-xs text-slate-500 no-print">
          يمكنك طباعة ورقتين في كل صفحة A4 وتوزيعها على الطلبة في آخر ٤ دقائق من الحصة
        </div>
      </div>
    </div>
  );
};
