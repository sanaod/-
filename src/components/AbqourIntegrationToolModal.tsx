/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Abqour Lesson Plan Integration Tool Modal
 * أداة إنشاء وربط نماذج خطة الدرس بمنظومة عبقور مع ربط مباشر بمكتبة المصادر المفتوحة
 */

import React, { useState, useMemo } from 'react';
import {
  X,
  FileCode,
  FileText,
  Download,
  Copy,
  CheckCircle2,
  Sparkles,
  Search,
  ExternalLink,
  BookOpen,
  Layers,
  Play,
  RotateCcw,
  Upload,
  ArrowRight,
  Globe,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { LessonPlan } from '../types/lessonPlan';
import { toArabicDigits } from '../utils/arabicNumerals';
import {
  AbqourLessonPlanJson,
  SAMPLE_PYTHON_LESSON_PLAN,
  convertAbqourJsonToLessonPlan,
  exportPlanToAbqourJson,
  formatPlanForAbqourText,
  generatePythonScriptForPlan,
  generateOerSearchLinks,
  triggerFileDownload,
} from '../utils/abqourIntegrationTool';

interface AbqourIntegrationToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: LessonPlan;
  onApplyPlan: (newPlan: LessonPlan) => void;
}

type ActiveTab = 'import' | 'export' | 'oer_search' | 'python_code';

export const AbqourIntegrationToolModal: React.FC<AbqourIntegrationToolModalProps> = ({
  isOpen,
  onClose,
  currentPlan,
  onApplyPlan,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('import');

  // Import State
  const [importInput, setImportInput] = useState<string>(
    JSON.stringify(SAMPLE_PYTHON_LESSON_PLAN, null, 2)
  );
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  // OER Search State
  const [searchTopic, setSearchTopic] = useState<string>(
    currentPlan.header.lessonTitle || 'Animals and Their Habitats'
  );

  // New OER Resource Form
  const [newResTitle, setNewResTitle] = useState('');
  const [newResUrl, setNewResUrl] = useState('');
  const [newResType, setNewResType] = useState('video');
  const [newResDesc, setNewResDesc] = useState('');

  // Copy Feedback State
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Python simulation output state
  const [simulationResult, setSimulationResult] = useState<string | null>(null);

  // Parsed Preview for import
  const parsedPlanPreview = useMemo(() => {
    if (!importInput.trim()) return null;
    try {
      const parsed = JSON.parse(importInput);
      if (parsed && typeof parsed === 'object') {
        return parsed as AbqourLessonPlanJson;
      }
    } catch {
      return null;
    }
    return null;
  }, [importInput]);

  if (!isOpen) return null;

  const handleCopy = (text: string, typeKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(typeKey);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleLoadSample = () => {
    setImportInput(JSON.stringify(SAMPLE_PYTHON_LESSON_PLAN, null, 2));
    setImportError(null);
    setImportSuccess('تم تحميل نموذج درس الحيوانات وبيئاتها (Grade 5) بنجاح!');
    setTimeout(() => setImportSuccess(null), 3000);
  };

  const handleApplyImported = () => {
    setImportError(null);
    try {
      if (!importInput.trim()) {
        setImportError('يرجى إدخال كود JSON أو نص الخطة أولاً.');
        return;
      }
      const parsed = JSON.parse(importInput) as AbqourLessonPlanJson;
      if (!parsed.header || (!parsed.header.topic && !parsed.header.school)) {
        setImportError('بنية JSON غير متوافقة؛ يجب أن يحتوي الكائن على بيانات header.');
        return;
      }
      const fullPlan = convertAbqourJsonToLessonPlan(parsed);
      onApplyPlan(fullPlan);
      onClose();
    } catch (err: any) {
      setImportError(`خطأ في تحليل صيغة JSON: ${err?.message || 'تأكد من سلامة الصياغة'}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setImportInput(text);
        setImportSuccess(`تم تحميل الملف (${file.name}) بنجاح!`);
        setTimeout(() => setImportSuccess(null), 3000);
      }
    };
    reader.readAsText(file);
  };

  const handleAddOerResource = () => {
    if (!newResTitle.trim() || !newResUrl.trim()) return;

    const newResource = {
      title: newResTitle.trim(),
      url: newResUrl.trim(),
      type: newResType,
      description: newResDesc.trim(),
    };

    // Update current plan with the new attached resource
    const updatedAttached = [
      ...(currentPlan.attachedResources || []),
      {
        id: `res-oer-${Date.now()}`,
        title: newResource.title,
        type: (newResource.type === 'video' ? 'video' : newResource.type === 'pdf' ? 'document' : 'link') as any,
        content: `${newResource.description}\nالرابط: ${newResource.url}`,
        sourceInfo: newResource.url,
        createdAt: new Date().toISOString(),
        tags: ['OER', newResource.type],
      },
    ];

    onApplyPlan({
      ...currentPlan,
      attachedResources: updatedAttached,
    });

    setNewResTitle('');
    setNewResUrl('');
    setNewResDesc('');
    setImportSuccess('تم ربط المصدر المفتوح بالخطة الحالية بنجاح!');
    setTimeout(() => setImportSuccess(null), 3000);
  };

  const handleRunPythonSimulation = () => {
    const txt = formatPlanForAbqourText(currentPlan);
    const jsonStr = JSON.stringify(exportPlanToAbqourJson(currentPlan), null, 2);
    setSimulationResult(
      `[PYTHON 3.12 VIRTUAL RUNNER]\n` +
      `$ python abqour_integration_tool.py\n\n` +
      `${txt}\n\n` +
      `✅ Files generated and saved successfully:\n` +
      ` • ABQOUR_LESSON_PLAN.txt (${new Blob([txt]).size} bytes)\n` +
      ` • ABQOUR_LESSON_PLAN_DATA.json (${new Blob([jsonStr]).size} bytes)\n` +
      `Status: SUCCESS (Exit Code: 0)`
    );
  };

  const searchLinks = generateOerSearchLinks(searchTopic);

  // Generated outputs
  const currentJsonData = exportPlanToAbqourJson(currentPlan);
  const currentJsonString = JSON.stringify(currentJsonData, null, 2);
  const currentTxtString = formatPlanForAbqourText(currentPlan);
  const currentPyScript = generatePythonScriptForPlan(currentPlan);

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md overflow-y-auto font-['Cairo',sans-serif]"
    >
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-emerald-100 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-l from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between border-b border-emerald-700/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-emerald-500 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <FileCode className="w-6 h-6 text-amber-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black font-['Tajawal'] tracking-wide">
                  أداة إنشاء وربط نماذج خطة الدرس بمنظومة عبقور
                </h2>
                <span className="text-[10px] font-black bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded-full">
                  Python & OER 🐍
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 font-medium mt-0.5">
                توليد ومزامنة نماذج الدروس مع مكتبات المصادر التعليمية المفتوحة وصيغ بايثون المعتمدة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 bg-slate-100/80 border-b border-slate-200 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('import')}
            className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 cursor-pointer border-t border-x ${
              activeTab === 'import'
                ? 'bg-white text-emerald-800 border-slate-200 shadow-xs font-black'
                : 'bg-transparent text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>استيراد وتوليد فوري (JSON / Text)</span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 cursor-pointer border-t border-x ${
              activeTab === 'export'
                ? 'bg-white text-emerald-800 border-slate-200 shadow-xs font-black'
                : 'bg-transparent text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>تصدير ومزامنة الملفات (TXT / JSON / PY)</span>
          </button>

          <button
            onClick={() => setActiveTab('oer_search')}
            className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 cursor-pointer border-t border-x ${
              activeTab === 'oer_search'
                ? 'bg-white text-emerald-800 border-slate-200 shadow-xs font-black'
                : 'bg-transparent text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <Globe className="w-4 h-4 text-teal-600" />
            <span>محرك بحث وربط المصادر المفتوحة OER</span>
          </button>

          <button
            onClick={() => setActiveTab('python_code')}
            className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 cursor-pointer border-t border-x ${
              activeTab === 'python_code'
                ? 'bg-white text-emerald-800 border-slate-200 shadow-xs font-black'
                : 'bg-transparent text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <FileCode className="w-4 h-4 text-amber-600" />
            <span>كود بايثون والمحاكي المباشر 🐍</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          
          {/* Notifications */}
          {importSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{importSuccess}</span>
            </div>
          )}

          {importError && (
            <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          {/* TAB 1: IMPORT & LOAD */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200">
                <div>
                  <h4 className="text-sm font-black text-emerald-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    استيراد خطة جاهزة أو تحميل النموذج القياسي
                  </h4>
                  <p className="text-xs text-emerald-800/80">
                    يمكنك لصق كود JSON الناتج من أداة بايثون أو الضغط لتحميل درس «Animals and Their Habitats».
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                    <span>تحميل نموذج بايثون القياسي (Grade 5)</span>
                  </button>

                  <label className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all">
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>رفع ملف (.json / .txt)</span>
                    <input
                      type="file"
                      accept=".json,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-slate-500" />
                    محتوى كود JSON لخطة الدرس (AbqourLessonPlan.to_json)
                  </label>
                  <button
                    type="button"
                    onClick={() => setImportInput('')}
                    className="text-[11px] text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    تفريغ الحقل
                  </button>
                </div>
                <textarea
                  value={importInput}
                  onChange={(e) => setImportInput(e.target.value)}
                  dir="ltr"
                  rows={10}
                  className="w-full p-3 font-mono text-xs bg-slate-900 text-emerald-300 border border-slate-700 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                  placeholder="Paste JSON here..."
                />
              </div>

              {/* Parsed Preview Card */}
              {parsedPlanPreview && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-xs font-black text-slate-800">
                        معاينة تفاصيل الخطة المستخرجة: {parsedPlanPreview.header?.topic || 'بدون عنوان'}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">
                      الصف: {parsedPlanPreview.header?.class} | المدة: {parsedPlanPreview.header?.duration}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">المدرسة والمعلم</span>
                      <span className="font-bold text-slate-800 truncate block">
                        {parsedPlanPreview.header?.teacher} — {parsedPlanPreview.header?.school}
                      </span>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">الأهداف التعليمية</span>
                      <span className="font-bold text-emerald-700">
                        {toArabicDigits(parsedPlanPreview.objectives?.length || 0)} أهداف مستهدفة
                      </span>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">خطوات الإجراءات</span>
                      <span className="font-bold text-blue-700">
                        {toArabicDigits(Object.keys(parsedPlanPreview.procedures || {}).length)} مراحل زمنية
                      </span>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">مصادر OER المربوطة</span>
                      <span className="font-bold text-teal-700">
                        {toArabicDigits(parsedPlanPreview.resources?.open_access?.length || 0)} روابط مباشرة
                      </span>
                    </div>
                  </div>

                  {parsedPlanPreview.vocabulary && parsedPlanPreview.vocabulary.length > 0 && (
                    <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-800 ml-1">المفردات:</span>
                      {parsedPlanPreview.vocabulary.join(' • ')}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  إلغاء
                </button>

                <button
                  type="button"
                  onClick={handleApplyImported}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-2 transition-all cursor-pointer active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>تطبيق الخطة في منظومة عبقور الآن 🚀</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: EXPORT & SYNC */}
          {activeTab === 'export' && (
            <div className="space-y-5">
              <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4">
                <h4 className="text-sm font-black text-blue-950 flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-blue-600" />
                  تصدير الخطة الحالية بصيغ أداة الربط لمنظومة عبقور
                </h4>
                <p className="text-xs text-blue-800/80 mt-0.5">
                  تصدير متوافق 100% مع مخرجات سكربت بايثون: ملف بيانات JSON، ملف النص المنسق للطباعة، وسكربت بايثون الكامل.
                </p>
              </div>

              {/* 3 Export Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. TXT Format */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-all">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-700">
                      <FileText className="w-5 h-5 text-slate-800" />
                    </div>
                    <h5 className="font-bold text-slate-900 text-xs">
                      ABQOUR_LESSON_PLAN.txt
                    </h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      ملف نصي منسق بالكامل بالفواصل والأقسام ليُنسخ مباشرة إلى الحقول والتقارير المدرسية.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => handleCopy(currentTxtString, 'txt')}
                      className="flex-1 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {copiedType === 'txt' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedType === 'txt' ? 'تم النسخ' : 'نسخ'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerFileDownload(currentTxtString, 'ABQOUR_LESSON_PLAN.txt')}
                      className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>تنزيل TXT</span>
                    </button>
                  </div>
                </div>

                {/* 2. JSON Format */}
                <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-all">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <FileCode className="w-5 h-5 text-emerald-800" />
                    </div>
                    <h5 className="font-bold text-emerald-950 text-xs">
                      ABQOUR_LESSON_PLAN_DATA.json
                    </h5>
                    <p className="text-[11px] text-emerald-800/80 leading-relaxed">
                      ملف بيانات JSON المهيكل المتوافق مع دالة AbqourLessonPlan.to_json() ومكتبة OER.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-emerald-200">
                    <button
                      type="button"
                      onClick={() => handleCopy(currentJsonString, 'json')}
                      className="flex-1 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {copiedType === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedType === 'json' ? 'تم النسخ' : 'نسخ'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerFileDownload(currentJsonString, 'ABQOUR_LESSON_PLAN_DATA.json', 'application/json')}
                      className="flex-1 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>تنزيل JSON</span>
                    </button>
                  </div>
                </div>

                {/* 3. Python Script */}
                <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-all">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                      <span className="text-lg">🐍</span>
                    </div>
                    <h5 className="font-bold text-amber-950 text-xs">
                      abqour_lesson_plan.py
                    </h5>
                    <p className="text-[11px] text-amber-800/80 leading-relaxed">
                      سكربت بايثون مستقل وكامل جاهز للتشغيل بأمر python لتوليد وتحديث الخطة على أي جهاز.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-amber-200">
                    <button
                      type="button"
                      onClick={() => handleCopy(currentPyScript, 'py')}
                      className="flex-1 py-1.5 bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {copiedType === 'py' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedType === 'py' ? 'تم النسخ' : 'نسخ'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerFileDownload(currentPyScript, 'abqour_lesson_plan.py')}
                      className="flex-1 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>تنزيل Python</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Text Preview Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">معاينة النص المنسق الفعلي (ABQOUR_LESSON_PLAN.txt):</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(currentTxtString, 'txt-preview')}
                    className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedType === 'txt-preview' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>نسخ النص كاملاً</span>
                  </button>
                </div>
                <pre
                  dir="ltr"
                  className="p-4 bg-slate-950 text-slate-200 rounded-2xl text-xs font-mono max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed border border-slate-800"
                >
                  {currentTxtString}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: OER SEARCH & LINKER */}
          {activeTab === 'oer_search' && (
            <div className="space-y-5">
              
              {/* Search Bar */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Search className="w-4 h-4 text-emerald-600" />
                    محرك البحث الفوري في منصات المصادر التعليمية المفتوحة (OER Direct Search)
                  </h4>
                  <span className="text-[11px] text-slate-500 font-bold">
                    وفق دالة search_and_link_oer()
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={searchTopic}
                    onChange={(e) => setSearchTopic(e.target.value)}
                    placeholder="اكتب موضوع الدرس للبحث (مثال: Animals and Their Habitats)..."
                    className="flex-1 px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setSearchTopic(currentPlan.header.lessonTitle || 'Animals and Their Habitats')}
                    className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                    title="استرجاع عنوان الدرس الحالي"
                  >
                    عنوان الدرس الحالي
                  </button>
                </div>

                {/* Direct Platform Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
                  {searchLinks.map((plat, idx) => (
                    <a
                      key={idx}
                      href={plat.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 rounded-xl flex items-center justify-between transition-all group shadow-2xs"
                    >
                      <div className="overflow-hidden">
                        <span className="text-xs font-black text-slate-900 group-hover:text-emerald-800 block truncate">
                          {plat.name}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {plat.platform}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 group-hover:text-emerald-600 shrink-0">
                        <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-sm">
                          {plat.badge}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Add New OER Resource Card */}
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-emerald-700" />
                  إضافة مصدر تعليمي مفتوح وربطه مباشرة بالخطة الحالية (OpenResource)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">عنوان المصدر (Title)</label>
                    <input
                      type="text"
                      value={newResTitle}
                      onChange={(e) => setNewResTitle(e.target.value)}
                      placeholder="مثال: National Geographic Habitats Video"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">الرابط المباشر (URL)</label>
                    <input
                      type="url"
                      value={newResUrl}
                      onChange={(e) => setNewResUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">نوع المصدر (Type)</label>
                    <select
                      value={newResType}
                      onChange={(e) => setNewResType(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                    >
                      <option value="video">فيديو تعليمي (Video)</option>
                      <option value="interactive">نشاط تفاعلي / ورقة عمل (Interactive)</option>
                      <option value="pdf">ملف قراءة / دليل (PDF)</option>
                      <option value="image">لوحة بصرية / صورة (Image)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">الوصف ورخصة الاستخدام (Description)</label>
                  <input
                    type="text"
                    value={newResDesc}
                    onChange={(e) => setNewResDesc(e.target.value)}
                    placeholder="مقطع فيديو تفاعلي يستعرض تكيف الحيوانات في ٥ بيئات طبيعية (CC BY-NC 4.0)..."
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleAddOerResource}
                    disabled={!newResTitle.trim() || !newResUrl.trim()}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ربط المصدر بالخطة الحالية فوراً</span>
                  </button>
                </div>
              </div>

              {/* Currently Linked OER List */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-teal-600" />
                  المصادر المفتوحة المرتبطة بالخطة الحالية ({toArabicDigits(currentPlan.attachedResources?.length || 0)}):
                </h4>

                {(!currentPlan.attachedResources || currentPlan.attachedResources.length === 0) ? (
                  <p className="text-xs text-slate-400 bg-slate-50 p-4 rounded-xl text-center">
                    لا توجد مصادر OER مرتبطة حتى الآن. يمكنك استخدام النموذج أعلاه أو استيراد نموذج الدرس القياسي.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {currentPlan.attachedResources.map((res, i) => (
                      <div
                        key={res.id || i}
                        className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <span className="px-2 py-0.5 bg-teal-100 text-teal-800 text-[10px] font-black rounded-md uppercase shrink-0">
                            {res.type}
                          </span>
                          <div className="truncate">
                            <span className="font-bold text-slate-900 block truncate">{res.title}</span>
                            <span className="text-[11px] text-slate-500 block truncate">{res.content}</span>
                          </div>
                        </div>

                        {res.sourceInfo && (
                          <a
                            href={res.sourceInfo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 text-emerald-700 rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0"
                          >
                            <span>فتح الرابط</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 4: PYTHON CODE VIEWER & LIVE RUNNER */}
          {activeTab === 'python_code' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-50/70 border border-amber-200 p-3.5 rounded-2xl">
                <div>
                  <h4 className="text-sm font-black text-amber-950 flex items-center gap-1.5">
                    <span className="text-base">🐍</span>
                    محرك بايثون التكاملي المعتمد (Abqour Lesson Plan Integration Tool)
                  </h4>
                  <p className="text-xs text-amber-900/80 mt-0.5">
                    الكود المصدري الأصلي الذي طورته المنظومة لربط نماذج الدروس مع OER وتوليد مخرجات JSON وTXT.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleRunPythonSimulation}
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    <span>تشغيل محاكاة بايثون في المتصفح ⚡</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(currentPyScript, 'full-py')}
                    className="px-3 py-2 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    {copiedType === 'full-py' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>نسخ الكود البرمجي</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => triggerFileDownload(currentPyScript, 'abqour_integration_tool.py')}
                    className="px-3 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تنزيل ملف .py</span>
                  </button>
                </div>
              </div>

              {/* Simulation Result Terminal */}
              {simulationResult && (
                <div className="space-y-1 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5 text-emerald-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      مخرجات التشغيل الحي لمحاكي بايثون (Terminal Console):
                    </span>
                    <button
                      type="button"
                      onClick={() => setSimulationResult(null)}
                      className="text-[10px] text-slate-400 hover:text-slate-600"
                    >
                      إغلاق المخرجات
                    </button>
                  </div>
                  <pre
                    dir="ltr"
                    className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs rounded-2xl border border-emerald-900/60 max-h-72 overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner"
                  >
                    {simulationResult}
                  </pre>
                </div>
              )}

              {/* Python Script Code Viewer */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  كود بايثون البرمجي الكامل (مع بيانات الخطة الحالية):
                </label>
                <pre
                  dir="ltr"
                  className="p-4 bg-slate-900 text-amber-200/95 font-mono text-xs rounded-2xl border border-slate-800 max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed"
                >
                  {currentPyScript}
                </pre>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-bold">منظومة عبقور للتخطيط التربوي</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">مكتبة المصادر المفتوحة OER & Python Engine</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-bold cursor-pointer transition-all"
            >
              إغلاق
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
