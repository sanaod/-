import React, { useState } from 'react';
import {
  X,
  FileDown,
  FileText,
  FileCode,
  Printer,
  Copy,
  CheckCircle2,
  Sparkles,
  Download,
  Share2,
  ExternalLink,
} from 'lucide-react';
import { LessonPlan } from '../types/lessonPlan';
import { toArabicDigits } from '../utils/arabicNumerals';
import { exportToWord, exportToHtml } from '../utils/exportUtils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: LessonPlan;
  onOpenPdfPrint: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  plan,
  onOpenPdfPrint,
}) => {
  const [copied, setCopied] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleWordExport = () => {
    exportToWord(plan);
    setSuccessMsg('تم تنزيل مستند Microsoft Word (.doc) بنجاح!');
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleHtmlExport = () => {
    exportToHtml(plan);
    setSuccessMsg('تم تنزيل صفحة الويب المستقلة HTML (.html) بنجاح!');
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handlePdfExport = () => {
    onClose();
    onOpenPdfPrint();
  };

  const handleCopySummary = () => {
    const summary = `
خطة درس: ${plan.header.lessonTitle}
المبحث: ${plan.header.subject} | الصف: ${plan.header.grade}
المعلم/ة: ${plan.header.teacherName} | المدرسة: ${plan.header.school}
الدولة: ${plan.header.country} - ${plan.header.ministry}

الكفايات التكاملية:
${plan.section1.integrativeCompetencies.map((c) => `- ${c.title}: ${c.description}`).join('\n')}

مهمة التقويم الأصيل (GRASPS):
${plan.section3Assessment.graspsTask.title}
${plan.section3Assessment.graspsTask.fullDescription}
    `.trim();

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto text-right font-['Cairo',sans-serif]"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-4 flex flex-col">
        {/* Header */}
        <div className="bg-linear-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/80 rounded-2xl text-white shadow-sm border border-blue-400/30">
              <FileDown className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-['Tajawal']">
                مركز تصدير خطة الدرس
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                تصدير متعدد الصيغ يشمل Microsoft Word و PDF و HTML وصفحة الويب
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-xs text-emerald-900 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Body Cards */}
        <div className="p-6 space-y-4">
          <div className="text-xs text-slate-500 font-medium">
            الخطة الحالية المستهدفة:{' '}
            <strong className="text-slate-800">
              {plan.header.subject} - {plan.header.grade}: {toArabicDigits(plan.header.lessonTitle)}
            </strong>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {/* 1. Word (.doc / .docx) */}
            <button
              type="button"
              onClick={handleWordExport}
              className="p-4 rounded-2xl border-2 border-blue-200 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50 transition-all flex items-center justify-between gap-3 text-right group shadow-2xs"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-800 transition-colors">
                      تصدير كملف Word (.doc / .docx)
                    </h4>
                    <span className="text-[10px] bg-blue-600 text-white px-2 py-0.2 rounded-full font-bold">
                      شائع ومفضل
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    مستند مايكروسوفت وورد قابل للتعديل والطباعة مع جداول وزارية رسمية منسقة بدقة
                  </p>
                </div>
              </div>
              <Download className="w-5 h-5 text-blue-600 shrink-0" />
            </button>

            {/* 2. PDF Official Print */}
            <button
              type="button"
              onClick={handlePdfExport}
              className="p-4 rounded-2xl border-2 border-rose-200 hover:border-rose-500 bg-rose-50/40 hover:bg-rose-50 transition-all flex items-center justify-between gap-3 text-right group shadow-2xs"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <Printer className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-rose-800 transition-colors">
                      تصدير كملف PDF رسمي (A4)
                    </h4>
                    <span className="text-[10px] bg-rose-600 text-white px-2 py-0.2 rounded-full font-bold">
                      جاهز للاعتماد
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    معاينة وطباعة النموذج الوزاري المعتمد بدقة عالية مع ترويسة وشعار الوزارة والتوقيعات
                  </p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-rose-600 shrink-0" />
            </button>

            {/* 3. Standalone HTML */}
            <button
              type="button"
              onClick={handleHtmlExport}
              className="p-4 rounded-2xl border-2 border-emerald-200 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50 transition-all flex items-center justify-between gap-3 text-right group shadow-2xs"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <FileCode className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                      تصدير كصفحة ويب مستقلة HTML (.html)
                    </h4>
                    <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.2 rounded-full font-bold">
                      أوفلاين
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ملف ويب تفاعلي كامل مدمج بالتنسيق يعمل دون إنترنت على أي هاتف أو كمبيوتر
                  </p>
                </div>
              </div>
              <Download className="w-5 h-5 text-emerald-700 shrink-0" />
            </button>
          </div>

          {/* Quick Copy Action */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 border border-slate-200"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-800 font-extrabold">تم نسخ ملخص الخطة إلى الحافظة!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>نسخ ملخص الخطة نصياً للصق السريع في (الواتساب / منصات التعليم)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>* جميع الصيغ تدعم الأرقام العربية المشرقية والاتجاه الكامل من اليمين لليسار (RTL).</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
