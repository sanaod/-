import React, { useRef } from 'react';
import { Sparkles, Printer, Calculator, BookOpen, Download, Upload, RotateCcw, CheckCircle } from 'lucide-react';
import { LessonPlan } from '../types/lessonPlan';

interface HeaderNavProps {
  plans: LessonPlan[];
  activePlanId: string;
  onSelectPlan: (id: string) => void;
  onOpenAiGenerator: () => void;
  onOpenAbacusModal: () => void;
  onOpenPrintView: () => void;
  onResetToDefault: () => void;
  onImportPlan: (plan: LessonPlan) => void;
  currentPlan: LessonPlan;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  plans,
  activePlanId,
  onSelectPlan,
  onOpenAiGenerator,
  onOpenAbacusModal,
  onOpenPrintView,
  onResetToDefault,
  onImportPlan,
  currentPlan,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentPlan, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${currentPlan.header.lessonTitle || 'خطة_درس'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.header && parsed.section1 && parsed.section2Timeline) {
          onImportPlan(parsed);
          alert('تم استيراد خطة الدرس بنجاح!');
        } else {
          alert('ملف غير صالح، يجب أن يطابق بنية خطط الدروس الوزارية');
        }
      } catch (err) {
        alert('حدث خطأ أثناء قراءة ملف JSON');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-emerald-800 to-teal-700 flex items-center justify-center text-white shadow-sm ring-2 ring-emerald-500/20">
              <BookOpen className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold font-['Tajawal'] text-slate-900 leading-tight">
                  منظومة خبير التخطيط التربوي
                </h1>
                <span className="hidden md:inline text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full border border-emerald-300">
                  النموذج الوزاري المعتمد
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                إعداد وتحضير الخطط النموذجية المتكاملة وفق معايير التميز (الدرجة 4)
              </p>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Plan Switcher */}
            <div className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 px-2">الخطة:</span>
              <select
                value={activePlanId}
                onChange={(e) => onSelectPlan(e.target.value)}
                className="text-xs bg-white font-semibold text-slate-800 rounded-lg px-2.5 py-1 border border-slate-300 focus:outline-hidden"
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.header.subject} - {p.header.grade}: {p.header.lessonTitle}
                  </option>
                ))}
              </select>
            </div>

            {/* Interactive Abacus Button */}
            <button
              onClick={onOpenAbacusModal}
              title="المعداد الرقمي التفاعلي ولوحة المنازل"
              className="px-2.5 sm:px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Calculator className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">المعداد التفاعلي</span>
            </button>

            {/* AI Plan Generator CTA */}
            <button
              onClick={onOpenAiGenerator}
              className="px-3 sm:px-3.5 py-1.5 bg-linear-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>توليد خطة جديدة بالذكاء الاصطناعي</span>
            </button>

            {/* Official Print View */}
            <button
              onClick={onOpenPrintView}
              className="px-2.5 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Printer className="w-4 h-4 text-slate-200" />
              <span className="hidden sm:inline">الطباعة الرسمية (PDF)</span>
            </button>

            {/* Export / Import drop or action */}
            <button
              onClick={handleExportJson}
              title="تصدير الخطة كملف JSON"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              title="استيراد خطة من ملف JSON"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />

            <button
              onClick={onResetToDefault}
              title="استعادة نموذج درس القيمة المنزلية الأصلي المرفق"
              className="p-2 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Plan selector bar */}
        <div className="lg:hidden pb-2 pt-1 border-t border-slate-100 flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-slate-500">اختر الخطة:</span>
          <select
            value={activePlanId}
            onChange={(e) => onSelectPlan(e.target.value)}
            className="text-xs bg-slate-50 font-semibold text-slate-800 rounded-lg px-2 py-1 border border-slate-300 w-full"
          >
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.header.subject} - {p.header.grade}: {p.header.lessonTitle}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};
