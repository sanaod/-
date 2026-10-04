import React, { useState } from 'react';
import { 
  CheckCircle2, Sparkles, X, FileText, Download, Copy, Printer, 
  HelpCircle, Activity, Award, Check, FileCheck, Layers, BookOpen
} from 'lucide-react';
import { toArabicDigits } from '../utils/arabicNumerals';

interface AssessmentHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonContext: {
    subject: string;
    grade: string;
    lessonTitle: string;
  };
  onApplyToPlan?: (assessmentData: {
    diagnostic: string[];
    formative: string[];
    summative: string[];
  }) => void;
}

export const AssessmentHubModal: React.FC<AssessmentHubModalProps> = ({
  isOpen,
  onClose,
  lessonContext,
  onApplyToPlan
}) => {
  const [activeTab, setActiveTab] = useState<'diagnostic' | 'formative' | 'summative' | 'all'>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Assessment content state
  const [diagnosticItems, setDiagnosticItems] = useState<string[]>([
    'سبر المعارف السابقة وطرح أسئلة استكشافية حول المفاهيم الأساسية للدرس.',
    'ورقة عمل تشخيصية قصيرة (3 أسئلة) لتحديد نقاط القوة والفجوات المعرفية لدى الطلبة.',
    'تقييم الاستعداد القبلي عبر استراتيجية (اعرف - أريد أن أعرف - تعلمت KWL).'
  ]);

  const [formativeItems, setFormativeItems] = useState<string[]>([
    'بطاقة الخروج (Exit Ticket) في نهاية الحصة لقياس مدى تحقق هدف التعلم.',
    'أسئلة المراقبة المستمرة خلال الأنشطة الجماعية واستراتيجية الرؤوس المرقمة.',
    'تقييم الأقران باستخدام بطاقة الملاحظة السريعة والملاحظة الصفية المباشرة.',
    'طرح أسئلة سبر تفكير الطلبة (ما دليلك؟ كيف توصلت لهذه الإجابة؟).'
  ]);

  const [summativeItems, setSummativeItems] = useState<string[]>([
    'مهمة التقويم الأصيل (GRASPS): تطبيق عملي لإنتاج منتج أو حل مشكلة واقعية.',
    'سلم التقدير اللفظي (Analytic Rubric) المقسم إلى 4 مستويات أداء (متطور، تمكن، قيد النمو، بدايات).',
    'اختبار قصري ختامي تحريري يغطي المستويات المعرفية الثلاثة (تذكر، فهم، تطبيق).',
    'ملف انجاز الطالب (Portfolio) وتقديم تقرير ختامي للمخرجات.'
  ]);

  if (!isOpen) return null;

  const handleAiGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const subject = lessonContext.subject || 'المادة الدراسية';
      const grade = lessonContext.grade || 'الصف';
      const title = lessonContext.lessonTitle || 'الدرس';

      setDiagnosticItems([
        `أسئلة سبر المعارف القبلية المرتبطة بمبحث ${subject} لدرس "${title}".`,
        `استراتيجية العصف الذهني الاستكشافي للتعرف على التصورات البديلة للطلبة في ${grade}.`,
        'استبيان قصير قبلي لقياس مستوى الجاهزية والدافعية للتعلم.'
      ]);

      setFormativeItems([
        `بطاقة الخروج التكوينية لتقييم فهم مفاهيم ${title} فورياً.`,
        'استراتيجية الدقيقة الواحدة للتفكير والكتابة (Minute Paper).',
        'الملاحظة الصفية المباشرة أثناء العمل التعاوني وتقديم تغذية راجعة فورية.',
        'طرح أسئلة ذات مستويات عليا ومتابعة إجابات الطلبة.'
      ]);

      setSummativeItems([
        `مهمة التقويم الأصيل (GRASPS) الخاصة بدرس "${title}" وفق معايير التميز الوزارية.`,
        'سلم التقدير اللفظي (Rubric) لتقييم مهارات ومخرجات الطلبة بموضوعية.',
        'الاكتمال والتحقق الختامي من تحقيق الأهداف السلوكية والمعرفية والوجدانية.'
      ]);

      setIsGenerating(false);
    }, 800);
  };

  const handleCopy = () => {
    const fullText = `=== منظومة عبقور: تقرير التقويم الشامل (تشخيصي، تكويني، ختامي) ===\n\n` +
      `المبحث: ${lessonContext.subject} | الصف: ${lessonContext.grade} | الدرس: ${lessonContext.lessonTitle}\n\n` +
      `1. التقويم التشخيصي (القبلي):\n` + diagnosticItems.map((item, i) => `- ${item}`).join('\n') + `\n\n` +
      `2. التقويم التكويني (المستمر):\n` + formativeItems.map((item, i) => `- ${item}`).join('\n') + `\n\n` +
      `3. التقويم الختامي (البعدي):\n` + summativeItems.map((item, i) => `- ${item}`).join('\n');

    navigator.clipboard.writeText(fullText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleExportWord = () => {
    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"><title>تقرير التقويم الشامل</title>
      <style>
        body { font-family: 'Traditional Arabic', 'Amiri', Arial, sans-serif; direction: rtl; text-align: right; padding: 20px; }
        h1 { color: #047857; font-size: 20px; border-bottom: 2px solid #047857; padding-bottom: 8px; }
        h2 { color: #1e293b; font-size: 16px; margin-top: 15px; }
        p, li { font-size: 14px; line-height: 1.6; color: #334155; }
        .meta { background: #f8fafc; padding: 10px; border: 1px solid #cbd5e1; margin-bottom: 20px; }
      </style>
      </head>
      <body>
        <h1>منظومة عبقور للتهيئة والتقويم التربوي</h1>
        <div class="meta">
          <p><strong>المبحث:</strong> ${lessonContext.subject || 'غير محدد'} | <strong>الصف:</strong> ${lessonContext.grade || 'غير محدد'}</p>
          <p><strong>عنوان الدرس:</strong> ${lessonContext.lessonTitle || 'استمارة التقويم الشامل'}</p>
        </div>
        
        <h2>أولاً: التقويم التشخيصي (القبلي)</h2>
        <ul>${diagnosticItems.map(item => `<li>${item}</li>`).join('')}</ul>

        <h2>ثانياً: التقويم التكويني (المستمر أثناء الحصة)</h2>
        <ul>${formativeItems.map(item => `<li>${item}</li>`).join('')}</ul>

        <h2>ثالثاً: التقويم الختامي (البعدي ومهمة GRASPS)</h2>
        <ul>${summativeItems.map(item => `<li>${item}</li>`).join('')}</ul>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `تقرير_التقويم_الشامل_${lessonContext.lessonTitle || 'درس'}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleExportText = () => {
    const textContent = `منظومة عبقور - تقرير التقويم الشامل\n` +
      `المبحث: ${lessonContext.subject} | الصف: ${lessonContext.grade} | الدرس: ${lessonContext.lessonTitle}\n\n` +
      `--- التقويم التشخيصي ---\n` + diagnosticItems.join('\n') + `\n\n` +
      `--- التقويم التكويني ---\n` + formativeItems.join('\n') + `\n\n` +
      `--- التقويم الختامي ---\n` + summativeItems.join('\n');

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `التقويم_الشامل_${lessonContext.lessonTitle || 'درس'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleExportJson = () => {
    const exportData = {
      lessonContext,
      diagnosticItems,
      formativeItems,
      summativeItems,
      exportDate: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `التقويم_الشامل_${lessonContext.lessonTitle || 'درس'}.json`;
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
  <title>تقرير التقويم الشامل - ${lessonContext.lessonTitle}</title>
  <style>
    body { font-family: 'Tajawal', Tahoma, sans-serif; background: #f8fafc; color: #1e293b; padding: 30px; margin: 0; direction: rtl; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    h1 { color: #047857; font-size: 24px; border-bottom: 3px solid #047857; padding-bottom: 10px; margin-bottom: 20px; }
    .meta { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 12px; margin-bottom: 25px; }
    .section-title { font-size: 18px; color: #0f766e; margin-top: 25px; margin-bottom: 10px; font-weight: bold; border-right: 4px solid #0d9488; padding-right: 10px; }
    ul { margin: 0; padding-right: 20px; }
    li { margin-bottom: 8px; font-size: 15px; line-height: 1.6; }
    .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>منظومة عبقور للتهيئة والتقويم التربوي</h1>
    <div class="meta">
      <p><strong>المبحث:</strong> ${lessonContext.subject || 'غير محدد'} | <strong>الصف:</strong> ${lessonContext.grade || 'غير محدد'}</p>
      <p><strong>عنوان الدرس:</strong> ${lessonContext.lessonTitle || 'بدون عنوان'}</p>
    </div>

    <div class="section-title">1. التقويم التشخيصي (القبلي)</div>
    <ul>${diagnosticItems.map(item => `<li>${item}</li>`).join('')}</ul>

    <div class="section-title">2. التقويم التكويني (المستمر أثناء الحصة)</div>
    <ul>${formativeItems.map(item => `<li>${item}</li>`).join('')}</ul>

    <div class="section-title">3. التقويم الختامي (البعدي ومهمة GRASPS)</div>
    <ul>${summativeItems.map(item => `<li>${item}</li>`).join('')}</ul>

    <div class="footer">تم التوليد والتصدير عبر منظومة عبقور للتخطيط التربوي الذكي © 2026</div>
  </div>
</body>
</html>`;
    const blob = new Blob([htmlDoc], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `التقويم_الشامل_${lessonContext.lessonTitle || 'درس'}.html`;
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
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-right"
      >
        {/* Header Bar */}
        <div className="bg-linear-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl border border-white/20">
              <Activity className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black font-['Tajawal'] tracking-wide">
                مركز توليد التقويم (التشخيصي • التكويني • الختامي)
              </h2>
              <p className="text-xs text-emerald-200">
                {lessonContext.subject} ({lessonContext.grade}) - {lessonContext.lessonTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAiGenerate}
              disabled={isGenerating}
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
              title="توليد وتحديث استراتيجيات التقويم بالذكاء الاصطناعي"
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

        {/* Sub Navigation Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              عرض الكل (شامل)
            </button>
            <button
              onClick={() => setActiveTab('diagnostic')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'diagnostic'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              1. التقويم التشخيصي (القبلي)
            </button>
            <button
              onClick={() => setActiveTab('formative')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'formative'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              2. التقويم التكويني (المستمر)
            </button>
            <button
              onClick={() => setActiveTab('summative')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'summative'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              3. التقويم الختامي (البعدي)
            </button>
          </div>

          <div className="text-xs text-slate-500 font-bold">
            معايير التميز الوزارية للإشراف التربوي
          </div>
        </div>

        {/* Modal Body / Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-slate-50/50">
          
          {/* Diagnostic Section */}
          {(activeTab === 'all' || activeTab === 'diagnostic') && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-600 text-white rounded-xl shadow-xs">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-black text-amber-950 font-['Tajawal']">
                      التقويم التشخيصي (Diagnostic Assessment / القبلي)
                    </h3>
                    <p className="text-xs text-amber-800">
                      يُستخدم قبل بدء التدريس لتحديد مستوى المعارف السابقة، كشف التصورات البديلة، وقياس الاستعداد.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mt-2">
                {diagnosticItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-white p-3 rounded-xl border border-amber-200/80 shadow-2xs">
                    <span className="w-5 h-5 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {toArabicDigits(idx + 1)}
                    </span>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const updated = [...diagnosticItems];
                        updated[idx] = e.target.value;
                        setDiagnosticItems(updated);
                      }}
                      className="w-full text-xs sm:text-sm font-medium bg-transparent border-b border-transparent hover:border-amber-300 focus:border-amber-500 focus:outline-hidden py-0.5"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formative Section */}
          {(activeTab === 'all' || activeTab === 'formative') && (
            <div className="bg-teal-50/70 border border-teal-200 rounded-2xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-teal-600 text-white rounded-xl shadow-xs">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-black text-teal-950 font-['Tajawal']">
                      التقويم التكويني (Formative Assessment / المستمر وأثناء الحصة)
                    </h3>
                    <p className="text-xs text-teal-800">
                      يُستخدم أثناء التعلم (Assessment for Learning) لتقديم تغذية راجعة فورية، بطاقات خروج، ومتابعة الفهم.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mt-2">
                {formativeItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-white p-3 rounded-xl border border-teal-200/80 shadow-2xs">
                    <span className="w-5 h-5 bg-teal-100 text-teal-800 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {toArabicDigits(idx + 1)}
                    </span>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const updated = [...formativeItems];
                        updated[idx] = e.target.value;
                        setFormativeItems(updated);
                      }}
                      className="w-full text-xs sm:text-sm font-medium bg-transparent border-b border-transparent hover:border-teal-300 focus:border-teal-500 focus:outline-hidden py-0.5"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summative Section */}
          {(activeTab === 'all' || activeTab === 'summative') && (
            <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-600 text-white rounded-xl shadow-xs">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-black text-purple-950 font-['Tajawal']">
                      التقويم الختامي (Summative Assessment / البعدي ومهمة GRASPS)
                    </h3>
                    <p className="text-xs text-purple-800">
                      يُستخدم في نهاية وحدة التعلم أو الدرس (Assessment of Learning) لقياس تحقق النواتج الشاملة.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mt-2">
                {summativeItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-white p-3 rounded-xl border border-purple-200/80 shadow-2xs">
                    <span className="w-5 h-5 bg-purple-100 text-purple-800 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {toArabicDigits(idx + 1)}
                    </span>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const updated = [...summativeItems];
                        updated[idx] = e.target.value;
                        setSummativeItems(updated);
                      }}
                      className="w-full text-xs sm:text-sm font-medium bg-transparent border-b border-transparent hover:border-purple-300 focus:border-purple-500 focus:outline-hidden py-0.5"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Bar & Export Actions */}
        <div className="bg-white border-t border-slate-200 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {onApplyToPlan && (
              <button
                onClick={() => {
                  onApplyToPlan({
                    diagnostic: diagnosticItems,
                    formative: formativeItems,
                    summative: summativeItems
                  });
                  onClose();
                }}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Check className="w-4 h-4 text-emerald-200" />
                <span>إدراج في الخطة الحالية</span>
              </button>
            )}

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
                  className="w-full text-right px-4 py-2.5 hover:bg-emerald-50 text-xs font-bold text-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>مستند Microsoft Word (.doc)</span>
                </button>
                <button
                  onClick={handleExportHtml}
                  className="w-full text-right px-4 py-2.5 hover:bg-emerald-50 text-xs font-bold text-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  <span>صفحة ويب HTML (.html)</span>
                </button>
                <button
                  onClick={handleExportText}
                  className="w-full text-right px-4 py-2.5 hover:bg-emerald-50 text-xs font-bold text-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>ملف نصي عادي (.txt)</span>
                </button>
                <button
                  onClick={handleExportJson}
                  className="w-full text-right px-4 py-2.5 hover:bg-emerald-50 text-xs font-bold text-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-purple-600" />
                  <span>بيانات JSON (.json)</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="w-full text-right px-4 py-2.5 hover:bg-emerald-50 text-xs font-bold text-slate-700 flex items-center gap-2.5 transition-colors border-t border-slate-100 cursor-pointer"
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
