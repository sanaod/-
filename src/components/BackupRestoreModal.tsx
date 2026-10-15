import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Download,
  Upload,
  Database,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  Layers,
  BookOpen,
  ShieldCheck,
  FolderArchive,
  RotateCcw,
  HardDrive,
  FileText,
  Bookmark,
} from 'lucide-react';
import { LessonPlan, EducationalResource } from '../types/lessonPlan';
import { toArabicDigits } from '../utils/arabicNumerals';
import {
  exportAllPlansToJson,
  parseAndValidateBackupJson,
  mergeImportedPlans,
  mergeImportedResources,
  createSafetyRollbackSnapshot,
  getSafetyRollbackSnapshot,
  restoreSafetySnapshot,
  getStorageUsageEstimate,
  SafetySnapshot,
  STORAGE_KEYS,
} from '../utils/backupRestore';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: LessonPlan[];
  resources?: EducationalResource[];
  onPlansUpdated: (newPlans: LessonPlan[], activeId?: string, newResources?: EducationalResource[]) => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
  plans,
  resources = [],
  onPlansUpdated,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [previewPlans, setPreviewPlans] = useState<LessonPlan[] | null>(null);
  const [previewResources, setPreviewResources] = useState<EducationalResource[] | null>(null);
  const [previewMetadata, setPreviewMetadata] = useState<{
    exportDate?: string;
    systemName?: string;
    totalPlansCount?: number;
    totalResourcesCount?: number;
    isComprehensive?: boolean;
    backupType?: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Safety snapshot and storage status
  const [safetySnapshot, setSafetySnapshot] = useState<SafetySnapshot | null>(null);
  const [storageEstimate, setStorageEstimate] = useState(getStorageUsageEstimate());

  useEffect(() => {
    if (isOpen) {
      setSafetySnapshot(getSafetyRollbackSnapshot());
      setStorageEstimate(getStorageUsageEstimate());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Export All Data as comprehensive JSON
  const handleExportBackup = () => {
    try {
      setIsProcessing(true);
      exportAllPlansToJson(plans, resources);
      setSuccessMessage(
        `تم تصدير وحفظ النسخة الاحتياطية الشاملة (${toArabicDigits(plans.length)} خطة معتمدة، و${toArabicDigits(
          resources.length
        )} مصدراً تعليمياً) كملف JSON بنجاح!`
      );
      setTimeout(() => {
        setSuccessMessage(null);
        setIsProcessing(false);
      }, 4000);
    } catch (err: any) {
      setErrorMessage(`حدث خطأ أثناء التصدير: ${err?.message || 'تعذر تنزيل الملف'}`);
      setIsProcessing(false);
    }
  };

  // Handle File Upload & Parsing
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = parseAndValidateBackupJson(content);

      if (result.success && result.plans.length > 0) {
        setPreviewPlans(result.plans);
        setPreviewResources(result.resources || null);
        setPreviewMetadata(result.metadata || null);
      } else {
        setPreviewPlans(null);
        setPreviewResources(null);
        setPreviewMetadata(null);
        setErrorMessage(result.error || 'الملف المحدد غير صالح أو لا يحتوي على خطط متوافقة مع المنظومة.');
      }
    };

    reader.onerror = () => {
      setErrorMessage('تعذر قراءة محتوى الملف المحدد من جهازك.');
    };

    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Apply Import to State & LocalStorage with Auto-Snapshot Protection
  const handleApplyImport = () => {
    if (!previewPlans || previewPlans.length === 0) return;

    try {
      // 1. Create an auto safety snapshot before modifying anything
      createSafetyRollbackSnapshot('نقطة أمان تلقائية قبل استيراد خطط جديدة');

      // 2. Merge or replace plans
      const mergedPlans = mergeImportedPlans(plans, previewPlans, importMode);

      // 3. Merge or replace resources if included in backup
      let mergedResources = resources;
      if (previewResources && previewResources.length > 0) {
        mergedResources = mergeImportedResources(resources, previewResources, importMode);
        try {
          localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(mergedResources));
        } catch (e) {}
      }

      // 4. Update state
      onPlansUpdated(mergedPlans, previewPlans[0].id, mergedResources);

      setSuccessMessage(
        importMode === 'replace'
          ? `تم استرجاع النسخة الاحتياطية بنجاح (${toArabicDigits(
              previewPlans.length
            )} خطة معتمدة). تم أيضاً حفظ نقطة أمان للتراجع عند الحاجة.`
          : `تم دمج واستيراد (${toArabicDigits(previewPlans.length)} خطة) بنجاح ليصبح الإجمالي (${toArabicDigits(
              mergedPlans.length
            )} خطة).`
      );

      // Refresh snapshot state
      setSafetySnapshot(getSafetyRollbackSnapshot());
      setStorageEstimate(getStorageUsageEstimate());

      setPreviewPlans(null);
      setPreviewResources(null);
      setPreviewMetadata(null);

      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 2500);
    } catch (err: any) {
      setErrorMessage(`تعذر تطبيق الاستيراد: ${err?.message || 'حدث خطأ غير متوقع'}`);
    }
  };

  // Rollback to previous safety snapshot
  const handleRollbackSafetySnapshot = () => {
    if (!safetySnapshot) return;
    const confirmed = window.confirm(
      `هل ترغب بالتراجع عن آخر عملية استيراد واستعادة الحالة السابقة المؤرخة في (${safetySnapshot.dateFormatted})؟`
    );
    if (!confirmed) return;

    const res = restoreSafetySnapshot();
    if (res.success) {
      onPlansUpdated(res.plans, res.plans[0]?.id, res.resources);
      setSuccessMessage(res.message);
      setSafetySnapshot(null);
      setStorageEstimate(getStorageUsageEstimate());
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 3000);
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div
      dir="rtl"
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs text-right font-['Cairo',sans-serif] overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col">
        {/* Top Header */}
        <div className="bg-linear-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center shadow-inner shrink-0">
              <Database className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black font-['Tajawal'] text-white">
                  النسخ الاحتياطي واسترجاع البيانات (JSON Backup)
                </h3>
                <span className="px-2 py-0.5 bg-amber-400 text-amber-950 rounded-full text-[10px] font-black">
                  حفظ شامل 💾
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                تصدير كافة خططك والمصادر التعليمية المرفوعة كملف موحد واستعادتها بأمان مع دعم التراجع التلقائي
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/15 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2.5 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('export');
              setErrorMessage(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'export'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>تصدير نسخة احتياطية شاملة (تنزيل JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('import');
              setErrorMessage(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'import'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>استيراد واسترجاع (رفع JSON)</span>
          </button>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border-b border-rose-200 text-xs font-bold text-rose-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 bg-emerald-50 border-b border-emerald-200 text-xs font-bold text-emerald-950 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Tab Body */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto max-h-[60vh]">
          {/* TAB 1: EXPORT */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              {/* Info banner */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950 leading-relaxed space-y-1">
                  <p className="font-black text-sm">حفظ كامل وموثوق لكافة بياناتك التعليمية:</p>
                  <p className="text-emerald-800">
                    يقوم هذا الزر بتجميع جميع خطط الدروس والوحدات والمصادر التعليمية وكتب المنهج وسجلات كفايات الطلبة
                    المحفوظة محلياً في ملف JSON موحد ومعتمد. يمكنك حفظه على فلاشة، أو بريدك الإلكتروني، أو السحابة،
                    واسترجاعه بأمان في أي وقت على أي جهاز آخر.
                  </p>
                </div>
              </div>

              {/* Plans & Storage Stats Summary Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200/80">
                  <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold shrink-0">
                    <FolderArchive className="w-5 h-5 text-emerald-200" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block">خطط الدروس المعتمدة:</span>
                    <span className="text-base font-black text-slate-900 font-['Tajawal']">
                      {toArabicDigits(plans.length)} خطة
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200/80">
                  <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold shrink-0">
                    <BookOpen className="w-5 h-5 text-teal-200" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block">المصادر وكتب المنهج:</span>
                    <span className="text-base font-black text-slate-900 font-['Tajawal']">
                      {toArabicDigits(resources.length)} مرجع ومصدر
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200/80">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold shrink-0">
                    <HardDrive className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block">حجم التخزين المحلي:</span>
                    <span className="text-base font-black text-slate-900 font-['Tajawal']">
                      {storageEstimate.formattedSize}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleExportBackup}
                disabled={isProcessing || plans.length === 0}
                className="w-full py-4 bg-linear-to-r from-emerald-700 via-teal-700 to-emerald-800 hover:from-emerald-800 hover:to-teal-900 text-white rounded-2xl text-sm font-black flex items-center justify-center gap-2.5 transition-all shadow-md hover:shadow-lg active:scale-98 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-5 h-5 text-emerald-200" />
                <span>تصدير وتحميل النسخة الاحتياطية الشاملة الآن (.json)</span>
              </button>

              <div className="text-[11px] text-slate-500 text-center">
                * لن تفقد أي خطة أو مرجع، وسيتم تنزيل الملف مباشرة إلى مجلد التنزيلات على جهازك.
              </div>
            </div>
          )}

          {/* TAB 2: IMPORT */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              {/* Rollback Snapshot Notice if available */}
              {safetySnapshot && (
                <div className="p-3.5 bg-amber-50/90 border border-amber-300 rounded-2xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-amber-700 shrink-0" />
                    <div>
                      <span className="font-bold text-amber-950 block">تتوفر نقطة أمان تلقائية محفوظة:</span>
                      <span className="text-amber-800 text-[11px]">
                        مؤرخة في ({safetySnapshot.dateFormatted}) تشمل ({toArabicDigits(safetySnapshot.plansCount)} خطة)
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRollbackSafetySnapshot}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-[11px] transition-all shadow-xs cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <span>استرجاع نقطة الأمان</span>
                  </button>
                </div>
              )}

              {/* File Upload Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-6 border-2 border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/40 hover:bg-teal-50 rounded-3xl flex flex-col items-center justify-center text-center gap-3 transition-colors cursor-pointer group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileSelected}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <Upload className="w-7 h-7 text-teal-100" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 group-hover:text-teal-900">
                    انقر هنا لاختيار ملف النسخة الاحتياطية (.json)
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    يدعم نسخ عبقور الشاملة، ونسخ الطوارئ، وملفات الخطط الفردية أو المجمعة
                  </p>
                </div>
              </div>

              {/* Preview Box if file parsed */}
              {previewPlans && previewPlans.length > 0 && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-700" />
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        معاينة النسخة المكتشفة ({toArabicDigits(previewPlans.length)} خطة
                        {previewResources && previewResources.length > 0
                          ? `، و${toArabicDigits(previewResources.length)} مصدر إثرائي`
                          : ''}
                        )
                      </h4>
                    </div>

                    {previewMetadata?.exportDate && (
                      <span className="text-[11px] text-slate-500 font-bold">
                        تاريخ التصدير: {previewMetadata.exportDate}
                      </span>
                    )}
                  </div>

                  {/* List preview of plans in file */}
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                    {previewPlans.map((p, idx) => (
                      <div
                        key={p.id || idx}
                        className="p-2 bg-white rounded-xl border border-slate-200 text-xs flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-bold text-slate-800 truncate">
                            {p.header?.lessonTitle || p.title || 'خطة درس'}
                          </span>
                          <span className="text-[11px] text-slate-500 shrink-0">
                            ({p.header?.subject || 'مادة'} - {p.header?.grade || 'المرحلة'})
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {p.header?.teacherName || 'معلم'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Safety Assurance Note */}
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      سيتم حفظ نقطة أمان تلقائية لحالتك الحالية قبل تطبيق الاستيراد لتتمكن من التراجع فوراً عند الحاجة.
                    </span>
                  </div>

                  {/* Merge or Replace Selector */}
                  <div className="pt-2 border-t border-slate-200">
                    <label className="block text-xs font-bold text-slate-700 mb-2">طريقة الاسترجاع:</label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setImportMode('merge')}
                        className={`p-2.5 rounded-xl border font-bold text-right transition-all cursor-pointer ${
                          importMode === 'merge'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              importMode === 'merge' ? 'bg-emerald-600' : 'bg-slate-300'
                            }`}
                          />
                          <span>دمج ذكي (مستحسن)</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-normal">
                          يحتفظ بالخطط الحالية ويضيف الخطط والمراجع المستوردة
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setImportMode('replace')}
                        className={`p-2.5 rounded-xl border font-bold text-right transition-all cursor-pointer ${
                          importMode === 'replace'
                            ? 'bg-amber-50 border-amber-500 text-amber-950 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              importMode === 'replace' ? 'bg-amber-600' : 'bg-slate-300'
                            }`}
                          />
                          <span>استبدال كامل</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-normal">
                          استبدال كافة الخطط بالنسخة (مع حفظ نقطة تراجع)
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Apply Button */}
                  <button
                    type="button"
                    onClick={handleApplyImport}
                    className="w-full py-3 bg-linear-to-r from-teal-700 to-emerald-800 hover:from-teal-800 hover:to-emerald-900 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer mt-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>تأكيد استيراد واسترجاع الخطط إلى المنظومة</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>🔒 النسخ الاحتياطي يعمل محلياً بالكامل على متصفحك لضمان سرية وخصوصية بياناتك.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
