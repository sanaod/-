import React, { useState } from 'react';
import { 
  Award, Sparkles, X, FileText, Download, Copy, Printer, 
  Check, FileCheck, Layers, BookOpen, Target, ShieldCheck
} from 'lucide-react';
import { toArabicDigits } from '../utils/arabicNumerals';
import { Section3ContinuousAssessment } from '../types/lessonPlan';

type GraspsTaskType = Section3ContinuousAssessment['graspsTask'];

interface AuthenticTaskGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonContext: {
    subject: string;
    grade: string;
    lessonTitle: string;
  };
  initialTask?: GraspsTaskType;
  onApplyTask: (task: GraspsTaskType) => void;
}

export const AuthenticTaskGeneratorModal: React.FC<AuthenticTaskGeneratorModalProps> = ({
  isOpen,
  onClose,
  lessonContext,
  initialTask,
  onApplyTask
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const [task, setTask] = useState<GraspsTaskType>(initialTask || {
    title: 'مهمة الأداء الأصيل (تصميم مشروع تطبيقي)',
    role: 'خبير تربوي / مهندس بيئي / باحث علمي',
    audience: 'المجتمع المدرسي، أولياء الأمور، أو زملاء الصف',
    situation: 'مواجهة تحدٍ حقيقي أو مشكلة واقعية مرتبطة بمفاهيم الدرس وتوظيفها في الحياة اليومية',
    product: 'تقرير ميداني، مجسم تعليمي، عرض تقديمي تفاعلي، أو مبادرة تطبيقية',
    standards: 'معايير التميز الوزارية وربط المفهوم بالواقع',
    fullDescription: 'يقوم الطلبة بصياغة وتنفيذ مشروع تطبيقي عملي يوظفون فيه المهارات والمعارف المكتسبة في حل مشكلة حياتية واقعية وفق معايير الجودة والتميز.'
  });

  if (!isOpen) return null;

  const handleAiGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const subject = lessonContext.subject || 'المبحث';
      const grade = lessonContext.grade || 'الصف';
      const lesson = lessonContext.lessonTitle || 'الدرس';

      setTask({
        title: `مهمة التقويم الأصيل المتقدمة لدرس: "${lesson}"`,
        role: `باحث / خبير مختص في مادة ${subject} لـ ${grade}`,
        audience: 'لجان التحكيم المدرسية والمجتمع المحلي والزملاء',
        situation: `حاجة المجتمع المحلي لحل ابتكاري ومستدام مرتبط بمفاهيم وتطبيقات ${lesson}`,
        product: 'نموذج تطبيقي تفاعلي / خريطة مفاهيمية ذكية / كتيب إرشادي رقمي',
        standards: 'معايير التميز الوزارية وربط المفهوم بالواقع',
        fullDescription: `بصفتك مختصاً في ${subject}، طوّر مشروعاً تطبيقياً متكاملاً يعالج تحدياً واقعياً في درس "${lesson}"، موظفاً مهارات التفكير العليا وحل المشكلات.`
      });
      setIsGenerating(false);
    }, 800);
  };

  const handleCopy = () => {
    const text = `=== مهمة التقويم الأصيل (GRASPS) ===\n` +
      `المبحث: ${lessonContext.subject} | الصف: ${lessonContext.grade} | الدرس: ${lessonContext.lessonTitle}\n\n` +
      `عنوان المهمة: ${task.title}\n` +
      `الدور (Role): ${task.role}\n` +
      `الجمهور (Audience): ${task.audience}\n` +
      `الموقف (Situation): ${task.situation}\n` +
      `المنتج (Product): ${task.product}\n\n` +
      `الوصف الكامل:\n${task.fullDescription}`;

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleExportWord = () => {
    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"><title>مهمة التقويم الأصيل GRASPS</title>
      <style>
        body { font-family: 'Traditional Arabic', 'Amiri', Arial, sans-serif; direction: rtl; text-align: right; padding: 20px; }
        h1 { color: #6b21a8; font-size: 20px; border-bottom: 2px solid #6b21a8; padding-bottom: 8px; }
        h2 { color: #1e293b; font-size: 16px; margin-top: 15px; }
        p, li { font-size: 14px; line-height: 1.6; color: #334155; }
        .meta { background: #f3e8ff; padding: 10px; border: 1px solid #d8b4fe; margin-bottom: 20px; }
        .badge { font-weight: bold; color: #581c87; }
      </style>
      </head>
      <body>
        <h1>منظومة عبقور - مهمة التقويم الأصيل (GRASPS)</h1>
        <div class="meta">
          <p><strong>المبحث:</strong> ${lessonContext.subject || 'غير محدد'} | <strong>الصف:</strong> ${lessonContext.grade || 'غير محدد'}</p>
          <p><strong>عنوان الدرس:</strong> ${lessonContext.lessonTitle || 'بدون عنوان'}</p>
        </div>
        
        <h2>عنوان المهمة: ${task.title}</h2>
        <p><span class="badge">الدور (Role):</span> ${task.role}</p>
        <p><span class="badge">الجمهور (Audience):</span> ${task.audience}</p>
        <p><span class="badge">الموقف (Situation):</span> ${task.situation}</p>
        <p><span class="badge">المنتج المطلوب (Product):</span> ${task.product}</p>
        
        <h2>الوصف التفصيلي للمهمة:</h2>
        <p>${task.fullDescription}</p>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `مهمة_التقويم_الأصيل_${lessonContext.lessonTitle || 'درس'}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleExportText = () => {
    const textContent = `منظومة عبقور - مهمة التقويم الأصيل (GRASPS)\n` +
      `المبحث: ${lessonContext.subject} | الصف: ${lessonContext.grade} | الدرس: ${lessonContext.lessonTitle}\n\n` +
      `العنوان: ${task.title}\n` +
      `الدور: ${task.role}\n` +
      `الجمهور: ${task.audience}\n` +
      `الموقف: ${task.situation}\n` +
      `المنتج: ${task.product}\n\n` +
      `الوصف:\n${task.fullDescription}`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `مهمة_أصيل_${lessonContext.lessonTitle || 'درس'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleExportJson = () => {
    const exportData = {
      lessonContext,
      task,
      exportDate: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `مهمة_أصيل_${lessonContext.lessonTitle || 'درس'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setShowExportMenu(false);
  };

  const handleExportHtml = () => {
    const htmlDoc = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>مهمة التقويم الأصيل - ${lessonContext.lessonTitle}</title>
  <style>
    body { font-family: 'Tajawal', Tahoma, sans-serif; background: #fdf4ff; color: #1e293b; padding: 30px; margin: 0; direction: rtl; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(107,33,168,0.1); }
    h1 { color: #7e22ce; font-size: 24px; border-bottom: 3px solid #7e22ce; padding-bottom: 10px; margin-bottom: 20px; }
    .meta { background: #f3e8ff; border: 1px solid #d8b4fe; padding: 15px; border-radius: 12px; margin-bottom: 25px; }
    .box { background: #faf5ff; border: 1px solid #e9d5ff; padding: 15px; border-radius: 12px; margin-bottom: 15px; }
    .label { font-weight: bold; color: #6b21a8; }
    .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>مهمة التقويم الأصيل (GRASPS)</h1>
    <div class="meta">
      <p><strong>المبحث:</strong> ${lessonContext.subject || 'غير محدد'} | <strong>الصف:</strong> ${lessonContext.grade || 'غير محدد'}</p>
      <p><strong>عنوان الدرس:</strong> ${lessonContext.lessonTitle || 'بدون عنوان'}</p>
    </div>

    <div class="box">
      <p><strong>عنوان المهمة:</strong> ${task.title}</p>
      <p><span class="label">الدور (Role):</span> ${task.role}</p>
      <p><span class="label">الجمهور (Audience):</span> ${task.audience}</p>
      <p><span class="label">الموقف (Situation):</span> ${task.situation}</p>
      <p><span class="label">المنتج (Product):</span> ${task.product}</p>
    </div>

    <div class="box">
      <p class="label">الوصف التفصيلي:</p>
      <p>${task.fullDescription}</p>
    </div>

    <div class="footer">تم التوليد والتصدير عبر منظومة عبقور للتخطيط التربوي الذكي © 2026</div>
  </div>
</body>
</html>`;
    const blob = new Blob([htmlDoc], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `مهمة_أصيل_${lessonContext.lessonTitle || 'درس'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handlePrint = () => {
    window.print();
    setShowExportMenu(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        dir="rtl" 
        className="bg-white rounded-3xl shadow-2xl border border-purple-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden text-right"
      >
        {/* Header Bar */}
        <div className="bg-linear-to-r from-purple-800 via-indigo-800 to-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl border border-white/20">
              <Award className="w-6 h-6 text-purple-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black font-['Tajawal'] tracking-wide">
                مولد مهمة التقويم الأصيل (GRASPS)
              </h2>
              <p className="text-xs text-purple-200">
                {lessonContext.subject} ({lessonContext.grade}) - {lessonContext.lessonTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAiGenerate}
              disabled={isGenerating}
              className="px-3.5 py-2 bg-purple-500 hover:bg-purple-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
              title="توليد وتحديث مهمة أصيلة بالذكاء الاصطناعي"
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'جاري التوليد...' : 'توليد ذكي بالـ AI'}</span>
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

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-purple-50/30">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">عنوان المهمة الأصيلة:</label>
            <input
              type="text"
              value={task.title}
              onChange={(e) => setTask({ ...task, title: e.target.value })}
              className="w-full text-xs sm:text-sm p-2.5 bg-white border border-purple-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-purple-950 block mb-1">الدور (Role):</label>
              <input
                type="text"
                value={task.role}
                onChange={(e) => setTask({ ...task, role: e.target.value })}
                className="w-full text-xs p-2 bg-white border border-purple-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-purple-950 block mb-1">الجمهور (Audience):</label>
              <input
                type="text"
                value={task.audience}
                onChange={(e) => setTask({ ...task, audience: e.target.value })}
                className="w-full text-xs p-2 bg-white border border-purple-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-purple-950 block mb-1">الموقف أو التحدي (Situation):</label>
              <input
                type="text"
                value={task.situation}
                onChange={(e) => setTask({ ...task, situation: e.target.value })}
                className="w-full text-xs p-2 bg-white border border-purple-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-purple-950 block mb-1">المنتج أو الأداء (Product):</label>
              <input
                type="text"
                value={task.product}
                onChange={(e) => setTask({ ...task, product: e.target.value })}
                className="w-full text-xs p-2 bg-white border border-purple-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">الوصف التفصيلي الكامل للمهمة:</label>
            <textarea
              rows={4}
              value={task.fullDescription}
              onChange={(e) => setTask({ ...task, fullDescription: e.target.value })}
              className="w-full text-xs sm:text-sm p-3 bg-white border border-purple-200 rounded-xl text-slate-800 leading-relaxed focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Footer Bar & Export Actions */}
        <div className="bg-white border-t border-slate-200 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onApplyTask(task);
                onClose();
              }}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4 text-purple-200" />
              <span>إدراج في الخطة الحالية</span>
            </button>

            <button
              onClick={handleCopy}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Copy className="w-4 h-4 text-slate-600" />
              <span>{copiedText ? 'تم النسخ!' : 'نسخ النص'}</span>
            </button>
          </div>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-blue-200" />
              <span>تصدير بجميع الصيغ</span>
            </button>

            {showExportMenu && (
              <div className="absolute left-0 bottom-full mb-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={handleExportWord}
                  className="w-full text-right px-4 py-2.5 hover:bg-purple-50 text-xs font-bold text-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>مستند Microsoft Word (.doc)</span>
                </button>
                <button
                  onClick={handleExportHtml}
                  className="w-full text-right px-4 py-2.5 hover:bg-purple-50 text-xs font-bold text-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  <span>صفحة ويب HTML (.html)</span>
                </button>
                <button
                  onClick={handleExportText}
                  className="w-full text-right px-4 py-2.5 hover:bg-purple-50 text-xs font-bold text-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>ملف نصي عادي (.txt)</span>
                </button>
                <button
                  onClick={handleExportJson}
                  className="w-full text-right px-4 py-2.5 hover:bg-purple-50 text-xs font-bold text-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-purple-600" />
                  <span>بيانات JSON (.json)</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="w-full text-right px-4 py-2.5 hover:bg-purple-50 text-xs font-bold text-slate-700 flex items-center gap-2.5 transition-colors border-t border-slate-100 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-slate-700" />
                  <span>طباعة مباشرة / PDF (A4)</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
