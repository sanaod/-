import React from 'react';
import { X, Printer, HeartHandshake, CheckSquare } from 'lucide-react';
import { LessonPlan } from '../types/lessonPlan';
import { toArabicDigits } from '../utils/arabicNumerals';

interface ParentCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: LessonPlan;
}

export const ParentCardModal: React.FC<ParentCardModalProps> = ({ isOpen, onClose, plan }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const familyData = plan.section4Environment.familyPartnership;

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto text-right"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-linear-to-r from-teal-800 to-emerald-900 text-white p-4 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-teal-300" />
            <h3 className="text-lg font-bold font-['Tajawal']">{toArabicDigits(familyData.cardTitle)} (شراكة الأسرة والمدرسة)</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              طباعة البطاقة الأسرية
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Card Area */}
        <div className="p-6 printable-area bg-slate-50 text-right">
          <div className="bg-white border-2 border-teal-600 rounded-2xl p-6 shadow-sm space-y-4">
            {/* Top official banner */}
            <div className="flex justify-between items-center border-b-2 border-teal-100 pb-4">
              <div>
                <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                  {plan.header.country} - {plan.header.ministry}
                </span>
                <h4 className="text-lg font-black text-slate-900 mt-2 font-['Tajawal']">
                  {toArabicDigits(familyData.cardTitle)}
                </h4>
                <p className="text-xs text-slate-500">
                  مبحث: {plan.header.subject} | الدرس: {toArabicDigits(plan.header.lessonTitle)}
                </p>
              </div>
              <div className="text-right text-xs text-slate-600 space-y-1">
                <div>اسم الطالب/ـة: ___________________</div>
                <div>الصف: {plan.header.grade} ({plan.header.section})</div>
                <div>المدرسة: {plan.header.school}</div>
              </div>
            </div>

            {/* Introduction & Value Message */}
            <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-3.5 text-xs text-teal-900 leading-relaxed">
              <span className="font-bold ml-1">ولي الأمر الفاضل / الأسرة الكريمة:</span>
              {toArabicDigits(familyData.instructions)}
            </div>

            {/* Student Task Box */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <h5 className="text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                مهمة الطالب التفاعلية في المنزل:
              </h5>
              <p className="text-xs text-slate-700 leading-relaxed">
                {toArabicDigits(familyData.studentTask)}
              </p>

              {/* Table for home recording */}
              <div className="mt-3 overflow-hidden rounded-lg border border-slate-300">
                <table className="w-full text-xs text-center border-collapse">
                  <thead className="bg-slate-200 text-slate-800 font-bold">
                    <tr>
                      <th className="p-2 border-b border-l border-slate-300">م</th>
                      <th className="p-2 border-b border-l border-slate-300">الشيء / المنتج المكتشف</th>
                      <th className="p-2 border-b border-l border-slate-300">العدد المكتوب</th>
                      <th className="p-2 border-b border-slate-300">الصورة الموسعة أو التحليل (من الآحاد للآلاف)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {[1, 2, 3].map((row) => (
                      <tr key={row} className="h-9">
                        <td className="border-l border-slate-300 font-bold text-slate-500">{toArabicDigits(row)}</td>
                        <td className="border-l border-slate-300"></td>
                        <td className="border-l border-slate-300"></td>
                        <td></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Parent Role & Signature */}
            <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900">
              <div className="font-bold mb-1">دور ولي الأمر والملاحظات الأسرية:</div>
              <p className="leading-relaxed mb-3">{toArabicDigits(familyData.parentRole)}</p>
              <div className="flex justify-between items-center pt-2 border-t border-amber-200/80 font-bold text-slate-800">
                <span>توقيع ولي الأمر: _______________________</span>
                <span>التاريخ: ____ / ____ / ________م</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-slate-200 text-center text-xs text-slate-500 no-print">
          تُسلَّم هذه البطاقة للطالب بنهاية الحصة لإشراك الأسرة وتوثيق الشراكة في ملف الإنجاز المدرسي.
        </div>
      </div>
    </div>
  );
};
