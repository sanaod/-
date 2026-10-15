import React, { useState, useMemo } from 'react';
import { LessonPlan } from '../types/lessonPlan';
import { toArabicDigits } from '../utils/arabicNumerals';
import {
  FolderKanban,
  BookOpen,
  Search,
  X,
  CheckCircle2,
  Trash2,
  Printer,
  ArrowUpRight,
  Sparkles,
  FileEdit,
  Layers,
  LayoutDashboard,
  Boxes,
  CalendarRange,
  Database,
  Share2,
  Code2,
  ExternalLink,
  PlusCircle,
  Tag,
  Braces,
  Copy,
  Check,
  Download,
  FileText,
  Terminal,
  Cpu,
} from 'lucide-react';
import { matchesPlanSearch } from '../utils/arabicSearch';
import { HighlightMatch } from './HighlightMatch';
import { abqourEnglishHabitatsPlan } from '../data/exemplarPlans';

export type PlanCategoryType = 'all' | 'abqour' | 'executive' | 'adaptive';

/**
 * Checks if a plan belongs to the Abqour Integration Tool / Python & OER Model
 */
export function isAbqourIntegrationPlan(plan: LessonPlan): boolean {
  if (!plan) return false;
  if (plan.id?.includes('abqour')) return true;
  if ((plan.templateType as any) === 'abqour' || (plan.templateType as any) === 'abqour-oer') return true;
  if (plan.title?.includes('عبقور') || plan.title?.toLowerCase().includes('abqour')) return true;
  if (
    plan.header?.school?.toLowerCase().includes('model international') ||
    plan.header?.teacherName?.toLowerCase().includes('ahmed mohamed')
  ) {
    return true;
  }
  if (
    plan.header?.subject?.toLowerCase().includes('english') &&
    (plan.header?.lessonTitle?.toLowerCase().includes('habitats') || plan.title?.toLowerCase().includes('habitats'))
  ) {
    return true;
  }
  if (
    plan.attachedResources &&
    plan.attachedResources.some((r) =>
      r.tags?.some((t) => t.toLowerCase().includes('abqour') || t.toLowerCase().includes('oer'))
    )
  ) {
    return true;
  }
  return false;
}

interface PlansViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: LessonPlan[];
  activePlanId: string;
  onSelectPlan: (id: string) => void;
  onRequestDeletePlan: (plan: LessonPlan) => void;
  onOpenEditor: () => void;
  onOpenPrintView: (planId: string) => void;
  onOpenShareModal?: (planId: string) => void;
  onOpenNewBlank?: () => void;
  onOpenAiGenerator?: () => void;
  onOpenUnitPlanModal?: () => void;
  onOpenSemesterPlanModal?: () => void;
  onGoToDashboard?: () => void;
  onOpenBackupRestore?: () => void;
  onOpenIntegrationToolModal?: () => void;
  onAddAbqourPlan?: () => void;
}

export const PlansViewerModal: React.FC<PlansViewerModalProps> = ({
  isOpen,
  onClose,
  plans,
  activePlanId,
  onSelectPlan,
  onRequestDeletePlan,
  onOpenEditor,
  onOpenPrintView,
  onOpenShareModal,
  onOpenNewBlank,
  onOpenAiGenerator,
  onOpenUnitPlanModal,
  onOpenSemesterPlanModal,
  onGoToDashboard,
  onOpenBackupRestore,
  onOpenIntegrationToolModal,
  onAddAbqourPlan,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<PlanCategoryType>('all');
  
  // State for inspecting raw JSON technical payload
  const [viewingJsonPlan, setViewingJsonPlan] = useState<LessonPlan | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);

  // Extract unique subjects
  const subjectList = useMemo(() => {
    const set = new Set<string>();
    plans.forEach((p) => {
      const s = p.header?.subject?.split('-')[0]?.trim();
      if (s) set.add(s);
    });
    return Array.from(set);
  }, [plans]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    let all = plans.length;
    let abqour = 0;
    let executive = 0;
    let adaptive = 0;

    plans.forEach((p) => {
      if (isAbqourIntegrationPlan(p)) {
        abqour++;
      } else if (p.templateType === 'executive') {
        executive++;
      } else {
        adaptive++;
      }
    });

    return { all, abqour, executive, adaptive };
  }, [plans]);

  // Filter plans based on Category, Subject, and Search
  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      // 1. Category Filter
      if (selectedCategory === 'abqour' && !isAbqourIntegrationPlan(plan)) {
        return false;
      }
      if (selectedCategory === 'executive' && (isAbqourIntegrationPlan(plan) || plan.templateType !== 'executive')) {
        return false;
      }
      if (selectedCategory === 'adaptive' && (isAbqourIntegrationPlan(plan) || plan.templateType === 'executive')) {
        return false;
      }

      // 2. Subject Filter
      const matchSubject =
        selectedSubject === 'all' ||
        (plan.header?.subject || '').toLowerCase().includes(selectedSubject.toLowerCase());

      // 3. Search Query
      const matchSearch =
        searchQuery.trim() === '' ||
        matchesPlanSearch(plan, searchQuery, 'all');

      return matchSubject && matchSearch;
    });
  }, [plans, selectedCategory, selectedSubject, searchQuery]);

  const handleCopyJson = (plan: LessonPlan) => {
    const jsonStr = JSON.stringify(plan, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2500);
  };

  const handleDownloadJson = (plan: LessonPlan) => {
    const jsonStr = JSON.stringify(plan, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanTitle = (plan.header?.lessonTitle || plan.title || 'lesson-plan')
      .replace(/[\s/\\?%*:|"<>]/g, '_');
    a.download = `${cleanTitle}-${plan.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="plans-viewer-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 text-right font-['Cairo',sans-serif]"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-linear-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-4 sm:p-5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 border border-white/30 shadow-inner">
              <FolderKanban className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="plans-viewer-modal-title" className="text-base sm:text-lg font-black font-['Tajawal']">
                  سجل ومكتبة الخطط الدراسية المحفوظة
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100 border border-emerald-400/40 tabular-nums">
                  {toArabicDigits(plans.length)} خطة
                </span>
                {categoryCounts.abqour > 0 && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-500/40 text-purple-100 border border-purple-400/50 flex items-center gap-1">
                    <Code2 className="w-3 h-3 text-amber-300" />
                    <span>{toArabicDigits(categoryCounts.abqour)} نموذج مدمج</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                استعراض الخطط حسب الفئات المعتمدة والتمييز بين الخطط العادية وخطط النموذج المدمج (Integration Tool)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenIntegrationToolModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenIntegrationToolModal();
                }}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer border border-purple-400/40"
                title="فتح أداة ربط خطط الدرس بمنظومة عبقور والمصادر المفتوحة OER"
              >
                <Code2 className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">أداة الربط (Integration Tool)</span>
              </button>
            )}

            {onOpenBackupRestore && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenBackupRestore();
                }}
                className="px-3 py-1.5 bg-amber-400 text-amber-950 hover:bg-amber-300 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                title="تصدير كافة الخطط كملف JSON أو استيراد نسخة احتياطية"
              >
                <Database className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">نسخ احتياطي</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-colors shrink-0 cursor-pointer"
              title="إغلاق النافذة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Categories Tab Bar */}
        <div className="bg-slate-100/90 border-b border-slate-200 px-3 sm:px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1.5 min-w-max">
            {/* Category 1: All */}
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>كافة التحضيرات</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {toArabicDigits(categoryCounts.all)}
              </span>
            </button>

            {/* Category 2: Abqour Integration Tool Model (Only if present) */}
            {categoryCounts.abqour > 0 && (
              <button
                type="button"
                onClick={() => setSelectedCategory('abqour')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  selectedCategory === 'abqour'
                    ? 'bg-purple-700 text-white shadow-xs ring-2 ring-purple-300'
                    : 'bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-300'
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-amber-400" />
                <span>⭐ النموذج المدمج (Integration Tool)</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    selectedCategory === 'abqour' ? 'bg-white text-purple-900' : 'bg-purple-200 text-purple-900'
                  }`}
                >
                  {toArabicDigits(categoryCounts.abqour)}
                </span>
              </button>
            )}

            {/* Category 3: Executive (SMART) */}
            <button
              type="button"
              onClick={() => setSelectedCategory('executive')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedCategory === 'executive'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>النماذج التنفيذية (SMART)</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  selectedCategory === 'executive' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {toArabicDigits(categoryCounts.executive)}
              </span>
            </button>

            {/* Category 4: Adaptive & Standard */}
            <button
              type="button"
              onClick={() => setSelectedCategory('adaptive')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedCategory === 'adaptive'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              <span>النماذج التكيفية والمعيارية</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  selectedCategory === 'adaptive' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {toArabicDigits(categoryCounts.adaptive)}
              </span>
            </button>
          </div>
        </div>

        {/* Abqour Category Banner (Active when 'abqour' category is selected and plans exist) */}
        {selectedCategory === 'abqour' && categoryCounts.abqour > 0 && (
          <div className="mx-3 sm:mx-4 mt-3 p-3 sm:p-3.5 bg-linear-to-r from-purple-50 via-indigo-50 to-purple-100/70 border border-purple-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-right shrink-0 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Code2 className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h4 className="text-xs font-black text-purple-950 font-['Tajawal'] flex items-center gap-1.5">
                  <span>فئة خطط النموذج المدمج لمنظومة عبقور (Integration Tool)</span>
                  <span className="text-[10px] bg-purple-200 text-purple-900 px-2 py-0.2 rounded-md font-bold">
                    English & OER
                  </span>
                </h4>
                <p className="text-[11px] text-purple-800">
                  نماذج متميزة تم إنشاؤها عبر النموذج المدمج ومترابطة مع سكريبتات بايثون ومصادر OER المفتوحة العالمية.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {onOpenIntegrationToolModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenIntegrationToolModal();
                  }}
                  className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Code2 className="w-3.5 h-3.5 text-purple-200" />
                  <span>فتح أداة الربط OER 🐍</span>
                </button>
              )}
              {onAddAbqourPlan && (
                <button
                  type="button"
                  onClick={() => {
                    onAddAbqourPlan();
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-purple-50 text-purple-900 border border-purple-300 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-purple-700" />
                  <span>استيراد نموذج عبقور المعتمد</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Search & Subject Filter Bar */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 space-y-2.5 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="بحث بالدرس، المبحث، المعلم، الصف، أو وسوم النموذج المدمج..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-9 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Subject Selector */}
            <div className="flex items-center gap-1 shrink-0">
              <BookOpen className="w-4 h-4 text-emerald-600 hidden sm:block" />
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="text-xs bg-white font-semibold text-slate-800 rounded-xl px-3 py-2 border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 w-full sm:w-auto"
              >
                <option value="all">كافة المباحث ({toArabicDigits(plans.length)})</option>
                {subjectList.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Plans List Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 divide-y divide-slate-100">
          {filteredPlans.length === 0 ? (
            selectedCategory === 'abqour' ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center mx-auto shadow-inner">
                  <Code2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  لا توجد خطط حالياً ضمن فئة النموذج المدمج لمنظومة عبقور
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  يمكنك إضافة واستخدام نموذج درس اللغة الإنجليزية «Animals and Their Habitats» المعتمد بضغطة زر، أو فتح أداة بايثون لإنشاء وتخصيص خطة مدمجة جديدة.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  {onAddAbqourPlan && (
                    <button
                      type="button"
                      onClick={() => {
                        onAddAbqourPlan();
                        onClose();
                      }}
                      className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>🚀 إضافة واستخدام نموذج عبقور المعتمد الآن</span>
                    </button>
                  )}
                  {onOpenIntegrationToolModal && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenIntegrationToolModal();
                      }}
                      className="px-3.5 py-2 bg-white hover:bg-purple-50 text-purple-800 border border-purple-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>فتح أداة بايثون وربط OER 🐍</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 space-y-2">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">لا توجد خطط تطابق البحث والفلترة</h4>
                <p className="text-xs text-slate-500">جرب مسح عبارة البحث أو اختيار فئة أو مبحث آخر</p>
              </div>
            )
          ) : (
            filteredPlans.map((plan) => {
              const isCurrent = plan.id === activePlanId;
              const isAbqour = isAbqourIntegrationPlan(plan);
              const lessonTitle = plan.header?.lessonTitle || plan.title || 'استمارة تحضير مفرغة';
              const subject = plan.header?.subject || 'مبحث تعليمي';
              const teacher = plan.header?.teacherName || 'غير محدد';
              const grade = plan.header?.grade || 'غير محدد';

              return (
                <div
                  key={plan.id}
                  className={`pt-3 first:pt-0 p-3 sm:p-4 rounded-2xl border transition-all ${
                    isCurrent
                      ? isAbqour
                        ? 'bg-purple-50/80 border-purple-400 ring-2 ring-purple-500/25 shadow-xs'
                        : 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                      : isAbqour
                      ? 'bg-linear-to-r from-purple-50/50 via-white to-white hover:bg-purple-50/70 border-purple-200/90 shadow-2xs hover:border-purple-400'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Plan Info */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-slate-900 text-sm">
                          <HighlightMatch text={lessonTitle} query={searchQuery} />
                        </span>

                        {isCurrent && (
                          <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>الخطة النشطة حالياً بالمحرر</span>
                          </span>
                        )}

                        {/* Distinct Tag: Integration Tool vs Regular Plan */}
                        {isAbqour ? (
                          <span
                            className="text-[10px] bg-linear-to-r from-purple-700 via-indigo-700 to-purple-900 text-white font-black px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-xs border border-purple-400/40"
                            title="تم إنشاء هذه الخطة عبر النموذج المدمج (Integration Tool)"
                          >
                            <Code2 className="w-3 h-3 text-amber-300 animate-pulse" />
                            <span>⚡ تم إنشاؤها عبر النموذج المدمج (Integration Tool)</span>
                          </span>
                        ) : (
                          <span
                            className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-slate-300"
                            title="خطة تحضير اعتيادية وفق النماذج المعيارية المعتمدة"
                          >
                            <FileText className="w-2.5 h-2.5 text-slate-500" />
                            <span>خطة اعتيادية</span>
                          </span>
                        )}

                        <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          <HighlightMatch text={grade} query={searchQuery} />
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500 pt-0.5">
                        <span className="font-semibold text-slate-700">
                          المبحث: <HighlightMatch text={subject} query={searchQuery} />
                        </span>
                        <span>·</span>
                        <span>المعلم: {teacher}</span>
                        <span>·</span>
                        <span className="tabular-nums">
                          {toArabicDigits(plan.header?.totalPeriods || 1)} حصص ({toArabicDigits(plan.header?.periodDurationMinutes || 40)} د / حصة)
                        </span>
                        <span>·</span>
                        <span>{plan.header?.date || '٢٠٢٦م'}</span>
                        <span>·</span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          ID: {plan.id}
                        </span>
                      </div>

                      {/* Specialized Badges for Abqour Integration Tool Plan */}
                      {isAbqour && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 border border-purple-200 flex items-center gap-1">
                            <Terminal className="w-2.5 h-2.5 text-purple-700" />
                            <span>سكريبت بايثون لمنظومة عبقور</span>
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 border border-indigo-200">
                            🌐 مصادر مفتوحة: OER Commons · Khan Academy · TED-Ed
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                            🎯 المفردات: habitat, desert, forest, ocean, adapt
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0 self-start md:self-center">
                      {/* Select & Open in Editor */}
                      <button
                        onClick={() => {
                          onSelectPlan(plan.id);
                          onOpenEditor();
                          onClose();
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                          isCurrent
                            ? isAbqour
                              ? 'bg-purple-700 text-white shadow-xs'
                              : 'bg-emerald-700 text-white shadow-xs'
                            : isAbqour
                            ? 'bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                        title="فتح وتحرير هذه الخطة في المحرر"
                      >
                        <span>{isCurrent ? 'الاستمرار بالتحرير' : 'اختيار وتفعيل'}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>

                      {/* View Technical JSON Option */}
                      <button
                        type="button"
                        onClick={() => setViewingJsonPlan(plan)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border cursor-pointer shadow-2xs ${
                          isAbqour
                            ? 'bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-300'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                        }`}
                        title="عرض بيانات JSON الفنية والتقنية لهذه الخطة وتصديرها"
                      >
                        <Braces className="w-3.5 h-3.5 text-indigo-600" />
                        <span>عرض بيانات JSON</span>
                      </button>

                      {/* Python Integration Tool Quick Shortcut */}
                      {isAbqour && onOpenIntegrationToolModal && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectPlan(plan.id);
                            onClose();
                            onOpenIntegrationToolModal();
                          }}
                          className="px-2.5 py-1.5 text-purple-800 hover:text-purple-950 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors border border-purple-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                          title="فتح تفاصيل الخطة في أداة بايثون OER Integration Tool"
                        >
                          <Code2 className="w-3.5 h-3.5 text-purple-600" />
                          <span className="hidden sm:inline">أداة بايثون</span>
                        </button>
                      )}

                      {/* Print View */}
                      <button
                        onClick={() => {
                          onSelectPlan(plan.id);
                          onOpenPrintView(plan.id);
                          onClose();
                        }}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
                        title="معاينة وطباعة رسمية A4"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {/* Share Modal */}
                      {onOpenShareModal && (
                        <button
                          onClick={() => {
                            onSelectPlan(plan.id);
                            onOpenShareModal(plan.id);
                            onClose();
                          }}
                          className="p-1.5 text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200"
                          title="مشاركة الخطة مع الزملاء عبر تطبيقات المراسلة (Web Share API)"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      )}

                      {/* Delete Plan */}
                      <button
                        onClick={() => onRequestDeletePlan(plan)}
                        className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="حذف هذه الخطة عند وجود أخطاء في التحضير"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>حذف (أخطاء)</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer Quick Shortcuts */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5 shrink-0 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {onOpenIntegrationToolModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenIntegrationToolModal();
                }}
                className="px-3 py-1.5 bg-linear-to-r from-purple-700 via-indigo-700 to-purple-800 hover:from-purple-800 hover:to-indigo-900 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer group"
                title="أداة إنشاء وربط نماذج خطة الدرس بمنظومة عبقور مع مصادر OER المفتوحة"
              >
                <Code2 className="w-3.5 h-3.5 text-purple-200 group-hover:scale-110 transition-transform" />
                <span>أداة الربط لمنظومة عبقور (Integration Tool) 🐍</span>
              </button>
            )}
            {onOpenUnitPlanModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenUnitPlanModal();
                }}
                className="px-3 py-1.5 bg-linear-to-r from-blue-700 via-indigo-700 to-purple-800 hover:from-blue-800 hover:to-purple-900 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer group"
                title="توليد تحضير وحدة دراسية كاملة بالذكاء الاصطناعي بمجموع دروسها"
              >
                <Boxes className="w-3.5 h-3.5 text-blue-200 group-hover:scale-110 transition-transform" />
                <span>تحضير وحدة كاملة (AI)</span>
              </button>
            )}
            {onOpenSemesterPlanModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSemesterPlanModal();
                }}
                className="px-3 py-1.5 bg-linear-to-r from-teal-700 via-emerald-800 to-cyan-800 hover:from-teal-800 hover:to-cyan-900 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer group"
                title="توليد وعرض الخطة الفصلية الموحدة ودليل توزيع الحصص"
              >
                <CalendarRange className="w-3.5 h-3.5 text-cyan-200 group-hover:scale-110 transition-transform" />
                <span>الخطة الفصلية وتوزيع الحصص</span>
              </button>
            )}
            {onGoToDashboard && (
              <button
                onClick={() => {
                  onClose();
                  onGoToDashboard();
                }}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-emerald-700" />
                <span>لوحة الإنتاجية والمجلدات المفهرسة</span>
              </button>
            )}
            {onOpenNewBlank && (
              <button
                onClick={() => {
                  onClose();
                  onOpenNewBlank();
                }}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileEdit className="w-3.5 h-3.5 text-amber-700" />
                <span>استمارة مفرغة جديدة</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>

      {/* Technical JSON Viewer Sub-Modal */}
      {viewingJsonPlan && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150 text-right font-['Cairo',sans-serif]"
        >
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 text-slate-100 rounded-3xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col">
            {/* JSON Modal Header */}
            <div className="bg-slate-800/90 border-b border-slate-700 p-4 sm:p-5 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <Braces className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-base font-black text-white font-['Tajawal'] truncate">
                      بيانات الخطة التقنية (JSON Data)
                    </h4>
                    {isAbqourIntegrationPlan(viewingJsonPlan) ? (
                      <span className="text-[10px] bg-linear-to-r from-purple-600 to-indigo-600 text-white font-black px-2 py-0.5 rounded-full flex items-center gap-1 border border-purple-400/40">
                        <Code2 className="w-3 h-3 text-amber-300" />
                        <span>⚡ تم إنشاؤها عبر النموذج المدمج (Integration Tool)</span>
                      </span>
                    ) : (
                      <span className="text-[10px] bg-slate-700 text-slate-200 font-bold px-2 py-0.5 rounded-full border border-slate-600">
                        خطة اعتيادية
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    الدرس: {viewingJsonPlan.header?.lessonTitle || viewingJsonPlan.title || 'بدون عنوان'} · المعرف: {viewingJsonPlan.id}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopyJson(viewingJsonPlan)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    copiedJson
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                  title="نسخ محتوى JSON إلى الحافظة"
                >
                  {copiedJson ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>تم النسخ بنجاح!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ JSON</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadJson(viewingJsonPlan)}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-600"
                  title="تحميل كملف JSON"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">تحميل ملف</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewingJsonPlan(null)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                  title="إغلاق معاينة JSON"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Technical Metadata Bar */}
            <div className="bg-slate-950/60 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 shrink-0">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                  <span>الحجم التقريبي:</span>
                  <span className="font-mono text-slate-200 font-bold">
                    {(new Blob([JSON.stringify(viewingJsonPlan)]).size / 1024).toFixed(1)} KB
                  </span>
                </span>
                <span>·</span>
                <span>
                  عدد المفاتيح الجذرية: <span className="font-mono text-slate-200 font-bold">{Object.keys(viewingJsonPlan).length}</span>
                </span>
                <span>·</span>
                <span>
                  نوع القالب: <span className="font-mono text-purple-300 font-bold">{viewingJsonPlan.templateType || 'standard'}</span>
                </span>
              </div>

              {isAbqourIntegrationPlan(viewingJsonPlan) && (
                <div className="text-[11px] text-amber-300 font-semibold bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1">
                  <span>🐍 تدعم استيراد ومعالجة بايثون ومصادر OER Commons</span>
                </div>
              )}
            </div>

            {/* JSON Code Viewer Body */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-950 select-text">
              <pre className="font-mono text-xs text-emerald-400 whitespace-pre-wrap leading-relaxed dir-ltr text-left selection:bg-purple-900 selection:text-white">
                <code>{JSON.stringify(viewingJsonPlan, null, 2)}</code>
              </pre>
            </div>

            {/* JSON Modal Footer */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
              <span className="text-[11px]">
                {isAbqourIntegrationPlan(viewingJsonPlan)
                  ? 'نموذج منظومة عبقور المدمج مهيأ للتكامل الرقمي والذكاء الاصطناعي وتبادل البيانات بصيغة JSON'
                  : 'يمكنك استخدام بيانات JSON لإجراء عمليات النسخ الاحتياطي أو الاستيراد المباشر في المنظومة'}
              </span>
              <button
                type="button"
                onClick={() => setViewingJsonPlan(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
