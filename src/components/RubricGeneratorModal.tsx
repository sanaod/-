import React, { useState } from 'react';
import { 
  FileText, Sparkles, X, Download, Copy, Printer, 
  Check, FileCheck, Layers, BookOpen, Target, Award, ListTree
} from 'lucide-react';
import { toArabicDigits } from '../utils/arabicNumerals';
import { RubricCriterion } from '../types/lessonPlan';

interface RubricGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonContext: {
    subject: string;
    grade: string;
    lessonTitle: string;
  };
  initialRubric?: RubricCriterion[];
  onApplyRubric: (rubric: RubricCriterion[]) => void;
}

export const RubricGeneratorModal: React.FC<RubricGeneratorModalProps> = ({
  isOpen,
  onClose,
  lessonContext,
  initialRubric,
  onApplyRubric
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const [rubric, setRubric] = useState<RubricCriterion[]>(initialRubric && initialRubric.length > 0 ? initialRubric : [
    {
      criterion: 'التمكن المعرفي وفهم المفاهيم',
      level1: 'يحتاج مساعدة في استرجاع المفاهيم الأساسية',
      level2: 'يسترجع المفاهيم الأساسية ببعض التوجيه',
      level3: 'يستوعب المفاهيم بدقة ويوظفها بشكل صحيح',
      level4: 'يحلل المفاهيم ويربطها بعمق وابتكار'
    },
    {
      criterion: 'التنفيذ والمهارة العملية (المنتج)',
      level1: 'ينفذ خطوات بسيطة وغير مكتملة للمهمة',
      level2: 'ينفذ المهمة بحدودها الدنيا المطلوبة',
      level3: 'ينفذ المهمة بدقة وكفاءة ووفق المعايير',
      level4: 'ينفذ المهمة بتميز إبداعي وجودة عالية استثنائية'
    },
    {
      criterion: 'التواصل والتعاون الفعال',
      level1: 'يتردد في المشاركة والعمل الجماعي',
      level2: 'يشارك بفعالية محدودة مع الزملاء',
      level3: 'يتعاون بانسجام ويعرض أفكاره بوضوح',
      level4: 'يقود النقاش ويدعم الفريق ويلهم الآخرين'
    },
    {
      criterion: 'التفكير النقدي وحل المشكلات',
      level1: 'يعتمد على الحلول التقليدية الجاهزة',
      level2: 'يقترح حلولاً بسيطة للمشكلات',
      level3: 'يطرح حلولاً منطقية ومبررة للتحديات',
      level4: 'يابتكر حلولاً إبداعية غير تقليدية للتحديات'
    }
  ]);

  if (!isOpen) return null;

  const handleAiGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const subject = lessonContext.subject || 'المبحث';
      const grade = lessonContext.grade || 'الصف';
      const lesson = lessonContext.lessonTitle || 'الدرس';

      setRubric([
        {
          criterion: `عمق الفهم العلمي لمفاهيم ${lesson}`,
          level1: 'يظهر فهماً سطحياً ويتعثر في ربط الأفكار',
          level2: 'يدرك المفاهيم الرئيسية مع حاجة لتوجيه',
          level3: 'يمتلك فهماً راسخاً ودقيقاً لمحتوى الدرس',
          level4: 'يحلل بعمق ويستنبط استنتاجات متقدمة ذات صلة'
        },
        {
          criterion: 'جودة مخرجات المهمة وتطبيق المعايير',
          level1: 'المنتج المقدم غير مكتمل وينقصه التنسيق',
          level2: 'المنتج مستوفٍ للمتطلبات الأساسية فقط',
          level3: 'المنتج متقن ومنظم ويلبي كافة المعايير المطلوبة',
          level4: 'المنتج متميز وعالي الجودة بمواصفات إبداعية'
        },
        {
          criterion: `التوظيف العملي والمهاري في مادة ${subject}`,
          level1: 'يواجه صعوبة في تطبيق المهارة عملياً',
          level2: 'يطبق المهارة في مواقف مألوفة',
          level3: 'يوظف المهارة ببراعة في مواقف جديدة',
          level4: 'يبدع في تصميم وتطبيقات عملية متقدمة'
        },
        {
          criterion: 'التواصل، العرض، والمسؤولية الفردية',
          level1: 'يعرض نتائجه بخجل وضعف في التواصل',
          level2: 'يعرض الأفكار بشكل مقبول ومقبول للجمهور',
          level3: 'يعرض الأفكار بثقة ووضوح وتفاعل إيجابي',
          level4: 'يتميز بإلقاء مؤثر واستدلال مقنع وتنظيم مذهل'
        }
      ]);
      setIsGenerating(false);
    }, 800);
  };

  const handleCriterionChange = (index: number, field: keyof RubricCriterion, value: string) => {
    const updated = [...rubric];
    updated[index] = { ...updated[index], [field]: value };
    setRubric(updated);
  };

  const addCriterion = () => {
    setRubric([
      ...rubric,
      {
        criterion: 'معيار جديد',
        level1: 'مستوى الأداء 1 (يحتاج دعم)',
        level2: 'مستوى الأداء 2 (مقبول / نامٍ)',
        level3: 'مستوى الأداء 3 (كفء / متقن)',
        level4: 'مستوى الأداء 4 (متميز / متقدم)'
      }
    ]);
  };

  const removeCriterion = (index: number) => {
    if (rubric.length <= 1) return;
    setRubric(rubric.filter((_, i) => i !== index));
  };

  const handleCopy = () => {
    let text = `=== سلم التقدير اللفظي (Rubric) ===\n` +
      `المبحث: ${lessonContext.subject} | الصف: ${lessonContext.grade} | الدرس: ${lessonContext.lessonTitle}\n\n`;
    
    rubric.forEach((r, idx) => {
      text += `المعيار ${idx + 1}: ${r.criterion}\n`;
      text += `  - 1 (مبتدئ): ${r.level1}\n`;
      text += `  - 2 (نامٍ): ${r.level2}\n`;
      text += `  - 3 (كفء): ${r.level3}\n`;
      text += `  - 4 (متميز): ${r.level4}\n\n`;
    });

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleExportWord = () => {
    let rowsHtml = '';
    rubric.forEach((r, idx) => {
      rowsHtml += `
        <tr>
          <td style="border: 1px solid #cbd5e1; padding: 8px; font-weight: bold; background: #f8fafc;">${toArabicDigits(idx + 1)}. ${r.criterion}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px; font-size: 13px;">${r.level1}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px; font-size: 13px;">${r.level2}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px; font-size: 13px;">${r.level3}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px; font-size: 13px; font-weight: bold; color: #6b21a8;">${r.level4}</td>
        </tr>
      `;
    });

    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"><title>سلم التقدير اللفظي Rubric</title>
      <style>
        body { font-family: 'Traditional Arabic', 'Amiri', Arial, sans-serif; direction: rtl; text-align: right; padding: 20px; }
        h1 { color: #6b21a8; font-size: 20px; border-bottom: 2px solid #6b21a8; padding-bottom: 8px; text-align: center; }
        .meta { background: #f3e8ff; padding: 10px; border: 1px solid #d8b4fe; margin-bottom: 20px; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th { background: #581c87; color: white; padding: 10px; border: 1px solid #4c1d95; font-size: 14px; text-align: center; }
      </style>
      </head>
      <body>
        <h1>سلم التقدير اللفظي (Rubric) لمهمة الدرس</h1>
        <div class="meta">
          <p><strong>المبحث:</strong> ${lessonContext.subject || 'غير محدد'} | <strong>الصف:</strong> ${lessonContext.grade || 'غير محدد'}</p>
          <p><strong>عنوان الدرس:</strong> ${lessonContext.lessonTitle || 'بدون عنوان'}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>المعيار / الأبعاد</th>
              <th>المستوى 1 (مبتدئ)</th>
              <th>المستوى 2 (نامٍ)</th>
              <th>المستوى 3 (كفء)</th>
              <th>المستوى 4 (متميز)</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `سلم_التقدير_Rubric_${lessonContext.lessonTitle || 'درس'}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleExportText = () => {
    let textContent = `منظومة عبقور - سلم التقدير اللفظي (Rubric)\n` +
      `المبحث: ${lessonContext.subject} | الصف: ${lessonContext.grade} | الدرس: ${lessonContext.lessonTitle}\n\n`;
    
    rubric.forEach((r, idx) => {
      textContent += `[المعيار ${idx + 1}]: ${r.criterion}\n`;
      textContent += ` - مبتدئ: ${r.level1}\n`;
      textContent += ` - نامٍ: ${r.level2}\n`;
      textContent += ` - كفء: ${r.level3}\n`;
      textContent += ` - متميز: ${r.level4}\n\n`;
    });

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `سلم_التقدير_${lessonContext.lessonTitle || 'درس'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleExportJson = () => {
    const exportData = {
      lessonContext,
      rubric,
      exportDate: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `سلم_التقدير_${lessonContext.lessonTitle || 'درس'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setShowExportMenu(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div dir="rtl" className="bg-white rounded-3xl shadow-2xl border border-purple-100 w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-700/80 rounded-2xl text-white shadow-inner flex items-center justify-center">
              <ListTree className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold font-['Tajawal'] flex items-center gap-2">
                مولد ومخصص سلم التقدير اللفظي (Rubric)
                <span className="text-xs bg-purple-500/30 border border-purple-400/40 px-2.5 py-0.5 rounded-full text-purple-200 font-normal">
                  التقويم الأصيل
                </span>
              </h3>
              <p className="text-xs text-purple-200 mt-0.5">
                {lessonContext.subject || 'المبحث'} • {lessonContext.grade || 'الصف'} • {lessonContext.lessonTitle || 'الدرس'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAiGenerate}
              disabled={isGenerating}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
              title="توليد سلم تقدير متقدم بالذكاء الاصطناعي خصيصاً للدرس"
            >
              <Sparkles className={`w-4 h-4 text-amber-100 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'جارِ التوليد بالذكاء الاصطناعي...' : 'توليد بالذكاء الاصطناعي (AI)'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-slate-200 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Rubric Preview & Editor */}
        <div className="p-6 overflow-y-auto space-y-6 bg-slate-50 flex-1">
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-purple-950 font-['Tajawal']">
                إدارة أبعاد ومعايير ومستويات سلم التقدير اللفظي
              </h4>
              <p className="text-xs text-purple-800 mt-0.5">
                يمكنك التعديل مباشرة على محتوى المستويات أو إضافة معايير جديدة وتطبيقها فوراً على خطة الدرس في القسم الثالث.
              </p>
            </div>
            <button
              onClick={addCriterion}
              className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>+ إضافة معيار تقييم جديد</span>
            </button>
          </div>

          {/* Rubric Table View / Edit */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="p-3 font-bold w-1/5 border-l border-slate-700">المعيار / البعد</th>
                    <th className="p-3 font-bold w-1/5 border-l border-slate-700">1. مستوى مبتدئ</th>
                    <th className="p-3 font-bold w-1/5 border-l border-slate-700">2. مستوى نامٍ</th>
                    <th className="p-3 font-bold w-1/5 border-l border-slate-700">3. مستوى كفء</th>
                    <th className="p-3 font-bold w-1/5 border-l border-slate-700 flex items-center justify-between">
                      <span>4. مستوى متميز</span>
                      <span className="text-[10px] font-normal text-slate-300">إجراءات</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {rubric.map((r, index) => (
                    <tr key={index} className="hover:bg-purple-50/40 transition-colors">
                      <td className="p-3 border-l border-slate-200 font-bold bg-slate-50/80 align-top">
                        <textarea
                          rows={2}
                          value={r.criterion}
                          onChange={(e) => handleCriterionChange(index, 'criterion', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold text-xs resize-y"
                          placeholder="اسم المعيار..."
                        />
                      </td>
                      <td className="p-3 border-l border-slate-200 align-top">
                        <textarea
                          rows={3}
                          value={r.level1}
                          onChange={(e) => handleCriterionChange(index, 'level1', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs resize-y"
                        />
                      </td>
                      <td className="p-3 border-l border-slate-200 align-top">
                        <textarea
                          rows={3}
                          value={r.level2}
                          onChange={(e) => handleCriterionChange(index, 'level2', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs resize-y"
                        />
                      </td>
                      <td className="p-3 border-l border-slate-200 align-top">
                        <textarea
                          rows={3}
                          value={r.level3}
                          onChange={(e) => handleCriterionChange(index, 'level3', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs resize-y"
                        />
                      </td>
                      <td className="p-3 align-top">
                        <div className="flex flex-col gap-2">
                          <textarea
                            rows={3}
                            value={r.level4}
                            onChange={(e) => handleCriterionChange(index, 'level4', e.target.value)}
                            className="w-full p-2 bg-purple-50/50 border border-purple-200 rounded-lg text-purple-950 font-medium text-xs resize-y"
                          />
                          {rubric.length > 1 && (
                            <button
                              onClick={() => removeCriterion(index)}
                              className="self-start text-[11px] text-rose-600 hover:text-rose-800 font-bold transition-colors cursor-pointer px-2 py-0.5 bg-rose-50 rounded-md border border-rose-200"
                            >
                              حذف المعيار
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-white border-t border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Copy className="w-4 h-4 text-slate-500" />
              <span>{copiedText ? 'تم النسخ بنجاح!' : 'نسخ السلم'}</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>تصدير المستند</span>
              </button>

              {showExportMenu && (
                <div className="absolute bottom-full mb-2 right-0 bg-white border border-slate-200 shadow-xl rounded-2xl p-2 w-48 z-20 space-y-1 text-xs">
                  <button
                    onClick={handleExportWord}
                    className="w-full text-right px-3 py-2 hover:bg-purple-50 text-slate-700 hover:text-purple-900 rounded-xl font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>ملف Word (.doc)</span>
                  </button>
                  <button
                    onClick={handleExportText}
                    className="w-full text-right px-3 py-2 hover:bg-purple-50 text-slate-700 hover:text-purple-900 rounded-xl font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>ملف نصي (.txt)</span>
                  </button>
                  <button
                    onClick={handleExportJson}
                    className="w-full text-right px-3 py-2 hover:bg-purple-50 text-slate-700 hover:text-purple-900 rounded-xl font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-amber-600" />
                    <span>بيانات JSON</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>طباعة</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              onClick={() => {
                onApplyRubric(rubric);
                onClose();
              }}
              className="px-5 py-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 text-emerald-300" />
              <span>تطبيق السلم على القسم الثالث بالخطة</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
