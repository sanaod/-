import React, { useRef, useState } from 'react';
import {
  Sparkles,
  Printer,
  Calculator,
  BookOpen,
  Download,
  Upload,
  RotateCcw,
  CheckCircle,
  Layers,
  FileDown,
  LayoutDashboard,
  FileText,
  TrendingUp,
  FileEdit,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  Smartphone,
  Monitor,
  Tablet,
  Trash2,
  FolderKanban,
  FolderTree,
  FileCheck2,
  Activity,
  Award,
  ListTree,
  Boxes,
  Plus,
  CalendarRange,
} from 'lucide-react';
import { LessonPlan } from '../types/lessonPlan';
import { toArabicDigits } from '../utils/arabicNumerals';
import { WhatsAppHeaderButton, WhatsAppIcon } from './WhatsAppContactButton';

interface HeaderNavProps {
  plans: LessonPlan[];
  activePlanId: string;
  onSelectPlan: (id: string) => void;
  onOpenAiGenerator: () => void;
  onOpenUnitPlanModal?: () => void;
  onOpenSemesterPlanModal?: () => void;
  onOpenAbacusModal: () => void;
  onOpenWorksheetModal?: () => void;
  onOpenAssessmentModal?: () => void;
  onOpenAuthenticTaskModal?: () => void;
  onOpenRubricModal?: () => void;
  onOpenPrintView: () => void;
  onOpenResourcesModal: () => void;
  resourcesCount: number;
  onResetToDefault: () => void;
  onImportPlan: (plan: LessonPlan) => void;
  currentPlan: LessonPlan;
  onOpenExportModal: () => void;
  onOpenBlankTemplateModal?: () => void;
  onNewBlankPlan?: () => void;
  onSelectBlankPlan?: () => void;
  onDeletePlan?: (planId: string) => void;
  onOpenPlansViewer?: () => void;
  onRequestDeletePlan?: () => void;
  isCurrentPlanBlank?: boolean;
  currentView?: 'editor' | 'dashboard';
  onChangeView?: (view: 'editor' | 'dashboard') => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  plans,
  activePlanId,
  onSelectPlan,
  onOpenAiGenerator,
  onOpenUnitPlanModal,
  onOpenSemesterPlanModal,
  onOpenAbacusModal,
  onOpenWorksheetModal,
  onOpenAssessmentModal,
  onOpenAuthenticTaskModal,
  onOpenRubricModal,
  onOpenPrintView,
  onOpenResourcesModal,
  resourcesCount,
  onResetToDefault,
  onImportPlan,
  currentPlan,
  onOpenExportModal,
  onOpenBlankTemplateModal,
  onNewBlankPlan,
  onSelectBlankPlan,
  onDeletePlan,
  onOpenPlansViewer,
  onRequestDeletePlan,
  isCurrentPlanBlank,
  currentView = 'editor',
  onChangeView,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentPlan, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${currentPlan.header.lessonTitle || 'خطة_درس'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setIsMobileMenuOpen(false);
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
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm no-print transition-all">
      {/* 1. Top Identity & Title Header Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
          
          {/* Logo, Title & Ministry Context (Home Link) */}
          <div
            onClick={onSelectBlankPlan || onNewBlankPlan}
            className="flex items-center gap-3 shrink-0 cursor-pointer group select-none"
            title="الصفحة الرئيسية للمنظومة: استمارة التحضير المفرغة المعتمدة"
          >
            <div className="relative group">
              <img
                src="/logo.png"
                alt="شعار منظومة عبقور"
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover shadow-md ring-2 ring-emerald-500/40 border-2 border-amber-300 transition-transform group-hover:scale-105 shrink-0"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  if (target.nextElementSibling) {
                    (target.nextElementSibling as HTMLElement).style.display = 'flex';
                  }
                }}
              />
              <div
                style={{ display: 'none' }}
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-linear-to-tr from-emerald-800 to-teal-700 items-center justify-center text-white shadow-sm ring-2 ring-emerald-500/20 shrink-0"
              >
                <BookOpen className="w-5 h-5 text-emerald-200" />
              </div>
            </div>
            
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-base md:text-lg font-black font-['Tajawal'] text-slate-900 leading-tight flex items-center gap-1.5">
                  <span className="text-emerald-800 group-hover:text-emerald-700 transition-colors">منظومة عبقور</span>
                  <span className="hidden sm:inline text-slate-800">للتخطيط التربوي وتحضير الدروس</span>
                </h1>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                  عبقور التربوي 👑
                </span>
                <span className="hidden lg:inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full border border-emerald-300">
                  <span>المعايير الوزارية</span>
                </span>
                <span className="hidden xl:inline-flex items-center gap-1 text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-300" title="رخصة المشاع الإبداعي CC BY-NC-SA 4.0">
                  <span>CC BY-NC-SA 4.0</span>
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-600 hidden sm:block truncate max-w-md lg:max-w-none mt-0.5">
                إعداد وتصميم: <strong className="text-emerald-800 font-bold">الأستاذ عبد الرحمن دويكات</strong> | نظام التخطيط الصفي والتكافل المهني
              </p>
            </div>
          </div>

          {/* Left Side: Active Plan Indicator, WhatsApp Contact & Mobile Menu Toggle */}
          <div className="flex items-center gap-2">
            {/* Direct WhatsApp Contact Button (Desktop / Tablet) */}
            <div className="hidden sm:block">
              <WhatsAppHeaderButton />
            </div>

            {/* Active Plan Quick Badge (Desktop / Tablet) */}
            <div className="hidden lg:flex items-center gap-2 bg-slate-100/90 hover:bg-slate-200/80 px-3 py-1.5 rounded-xl border border-slate-200 text-xs transition-colors">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span className="font-bold text-slate-700">الدرس الحالي:</span>
              <span className="font-extrabold text-slate-900 truncate max-w-[180px] xl:max-w-[240px]">
                {currentPlan.header?.lessonTitle || currentPlan.title || 'استمارة تحضير مفرغة'}
              </span>
              <span className="text-[10px] bg-white px-1.5 py-0.5 rounded-md border border-slate-200 text-slate-600 font-bold">
                {currentPlan.header?.grade || 'الصف'}
              </span>
            </div>

            {/* Mobile WhatsApp Quick Icon */}
            <div className="sm:hidden">
              <WhatsAppHeaderButton compact />
            </div>

            {/* Mobile Menu Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors md:hidden"
              aria-label="قائمة الخيارات والأدوات"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-rose-600" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Dedicated Main Toolbar Below Title (شريط الأدوات المنظّم أسفل العنوان) */}
      <div className="bg-slate-50/95 border-t border-slate-200/90 py-2">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* Desktop & Laptop Toolbar */}
          <div className="hidden lg:flex flex-wrap items-center justify-between gap-2 py-1">
            
            {/* Group 1: Navigation & Workspace Modes (أنماط العمل والتنقل) */}
            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
              {onChangeView && (
                <div className="flex flex-wrap items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs gap-1">
                  {/* Plan Editor Button */}
                  <button
                    onClick={() => onChangeView('editor')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      currentView === 'editor' && !isCurrentPlanBlank
                        ? 'bg-emerald-700 text-white shadow-xs ring-1 ring-emerald-800/20'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    title="الانتقال إلى محرر الخطة للتعديل والكتابة"
                  >
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    <span>محرر الخطة</span>
                  </button>

                  {/* Productivity Dashboard Button */}
                  <button
                    onClick={() => onChangeView('dashboard')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      currentView === 'dashboard'
                        ? 'bg-emerald-700 text-white shadow-xs ring-1 ring-emerald-800/20'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    title="لوحة الإنتاجية المفهرسة حسب المادة واسم المعلم"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
                    <span>لوحة الإنتاجية</span>
                    <span className="px-1.5 py-0.2 bg-emerald-800/80 text-white rounded-full text-[10px] font-extrabold tabular-nums">
                      {toArabicDigits(plans.length)}
                    </span>
                  </button>

                  {/* Blank Official Template Tab Button (Home Page) */}
                  <button
                    onClick={onSelectBlankPlan || onNewBlankPlan}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      currentView === 'editor' && isCurrentPlanBlank
                        ? 'bg-amber-500 text-white shadow-xs ring-1 ring-amber-600/30'
                        : 'text-amber-800 hover:bg-amber-50'
                    }`}
                    title="استمارة التحضير المفرغة المعتمدة (الصفحة الرئيسية للمنظومة)"
                  >
                    <FileEdit className="w-3.5 h-3.5 shrink-0" />
                    <span>الاستمارة المفرغة (📌)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Group 2: Plans Catalog & Delete on Errors (سجل الخطط وحذف الأخطاء) */}
            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
              {/* View Plans Modal Trigger Button */}
              <button
                onClick={onOpenPlansViewer}
                title="عرض واستعراض كافة خطط الدروس المحفوظة في المنظومة والتبديل المباشر بينها"
                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300/80 hover:border-emerald-400 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-2xs hover:shadow-xs cursor-pointer"
              >
                <FolderKanban className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>عرض الخطط</span>
                <span className="px-1.5 py-0.2 bg-emerald-700 text-white rounded-full text-[10px] font-extrabold tabular-nums">
                  {toArabicDigits(plans.length)}
                </span>
              </button>

              {/* Delete Current Plan when Errors Exist Button */}
              <button
                onClick={() => {
                  if (onRequestDeletePlan) {
                    onRequestDeletePlan();
                  } else if (onDeletePlan) {
                    onDeletePlan(activePlanId);
                  }
                }}
                title="حذف الخطة المعروضة الحالية عند وجود أخطاء في التحضير أو الرغبة بالتراجع"
                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300/80 hover:border-rose-400 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-2xs hover:shadow-xs cursor-pointer group"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600 group-hover:text-rose-700 shrink-0 transition-colors" />
                <span>حذف الخطة</span>
              </button>
            </div>

            {/* Group 3: Smart Teacher Tools (الأدوات التربوية الذكية) */}
            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
              {/* AI Plan Generator CTA */}
              <button
                onClick={onOpenAiGenerator}
                className="px-2.5 py-1.5 bg-linear-to-r from-emerald-700 via-emerald-800 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                title="توليد خطة درس نموذجية بالذكاء الاصطناعي وفق معايير التميز الوزارية"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span>تحضير بالـ AI</span>
              </button>

              {/* Unit Plan Generator CTA */}
              {onOpenUnitPlanModal && (
                <button
                  onClick={onOpenUnitPlanModal}
                  title="توليد تحضير وحدة دراسية كاملة بالذكاء الاصطناعي بمجموع دروسها"
                  className="px-2.5 py-1.5 bg-linear-to-r from-blue-700 via-indigo-700 to-purple-800 hover:from-blue-800 hover:to-purple-900 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer group"
                >
                  <Boxes className="w-3.5 h-3.5 text-blue-200 group-hover:scale-110 transition-transform shrink-0" />
                  <span>تحضير وحدة كاملة (AI)</span>
                </button>
              )}

              {/* Semester Plan & Periods Distribution Guide CTA */}
              {onOpenSemesterPlanModal && (
                <button
                  onClick={onOpenSemesterPlanModal}
                  title="توليد وعرض الخطة الفصلية الموحدة ودليل توزيع الحصص بجميع الصيغ"
                  className="px-2.5 py-1.5 bg-linear-to-r from-teal-700 via-emerald-800 to-cyan-800 hover:from-teal-800 hover:to-cyan-900 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer group"
                >
                  <CalendarRange className="w-3.5 h-3.5 text-cyan-200 group-hover:scale-110 transition-transform shrink-0" />
                  <span>الخطة الفصلية وتوزيع الحصص</span>
                </button>
              )}

              {/* Interactive Worksheet CTA */}
              {onOpenWorksheetModal && (
                <button
                  onClick={onOpenWorksheetModal}
                  title="توليد ورقة عمل تفاعلية ذكية متوافقة مع الدرس بالذكاء الاصطناعي"
                  className="px-2.5 py-1.5 bg-linear-to-r from-teal-700 to-emerald-800 hover:from-teal-800 hover:to-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-2xs hover:shadow-xs cursor-pointer group"
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-teal-200 group-hover:scale-110 transition-transform shrink-0" />
                  <span>ورقة عمل AI</span>
                </button>
              )}

              {/* Assessment Hub CTA (Diagnostic, Formative, Summative) */}
              {onOpenAssessmentModal && (
                <button
                  onClick={onOpenAssessmentModal}
                  title="توليد وإدارة أدوات التقويم التشخيصي، التكويني، والختامي بالذكاء الاصطناعي"
                  className="px-2.5 py-1.5 bg-linear-to-r from-purple-700 via-indigo-700 to-emerald-800 hover:from-purple-800 hover:to-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-2xs hover:shadow-xs cursor-pointer group"
                >
                  <Activity className="w-3.5 h-3.5 text-purple-200 group-hover:scale-110 transition-transform shrink-0" />
                  <span>التقويم الشامل</span>
                </button>
              )}

              {/* Authentic Task CTA (GRASPS) */}
              {onOpenAuthenticTaskModal && (
                <button
                  onClick={onOpenAuthenticTaskModal}
                  title="توليد وتصميم مهمة التقويم الأصيل GRASPS بالذكاء الاصطناعي"
                  className="px-2.5 py-1.5 bg-linear-to-r from-indigo-700 via-purple-800 to-pink-800 hover:from-indigo-800 hover:to-pink-900 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-2xs hover:shadow-xs cursor-pointer group"
                >
                  <Award className="w-3.5 h-3.5 text-pink-200 group-hover:scale-110 transition-transform shrink-0" />
                  <span>المهمة الأصيلة</span>
                </button>
              )}

              {/* Rubric Generator CTA */}
              {onOpenRubricModal && (
                <button
                  onClick={onOpenRubricModal}
                  title="توليد وتصميم سلم التقدير اللفظي Rubric الخاص بمهمة الدرس بالذكاء الاصطناعي"
                  className="px-2.5 py-1.5 bg-linear-to-r from-purple-800 via-violet-700 to-indigo-800 hover:from-purple-900 hover:to-indigo-900 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-2xs hover:shadow-xs cursor-pointer group"
                >
                  <ListTree className="w-3.5 h-3.5 text-purple-200 group-hover:scale-110 transition-transform shrink-0" />
                  <span>سلم التقدير Rubric</span>
                </button>
              )}

              {/* Interactive Tool / Simulator */}
              <button
                onClick={onOpenAbacusModal}
                title="المحاكي الرقمي والأداة التفاعلية المتوافقة مع الدرس المحضر"
                className="px-2.5 py-1.5 bg-white hover:bg-emerald-50/80 text-emerald-900 border border-emerald-300/80 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs hover:shadow-xs cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>المحاكي التفاعلي</span>
              </button>

              {/* Resources Manager CTA - Distinctive & Large */}
              <button
                onClick={onOpenResourcesModal}
                title="إدارة ورفع المصادر والمناهج والمراجع التعليمية بسهولة"
                className="px-3.5 py-1.5 bg-linear-to-r from-emerald-100 via-teal-50 to-emerald-50 hover:from-emerald-200 hover:to-teal-100 text-emerald-950 border-2 border-emerald-500/80 hover:border-emerald-600 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-xs hover:shadow-md hover:scale-[1.03] active:scale-97 cursor-pointer ring-2 ring-emerald-500/20 group"
              >
                <div className="relative p-1 bg-emerald-700 group-hover:bg-emerald-800 text-white rounded-lg shadow-xs transition-colors shrink-0">
                  <Layers className="w-4 h-4 text-emerald-100" />
                  <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-amber-400 text-amber-950 rounded-full flex items-center justify-center text-[10px] font-black border border-white">
                    +
                  </span>
                </div>
                <span className="font-extrabold text-[12px] text-emerald-950">إضافة المصادر</span>
                <span className="px-2 py-0.5 bg-emerald-800 group-hover:bg-emerald-900 text-white rounded-full text-[11px] font-black tabular-nums shadow-2xs">
                  {toArabicDigits(resourcesCount)}
                </span>
              </button>

              {/* Blank Form Modal CTA */}
              {onOpenBlankTemplateModal && (
                <button
                  onClick={onOpenBlankTemplateModal}
                  title="استمارة تحضير مفرغة رسمية للطباعة أو البدء الفوري"
                  className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                >
                  <FileEdit className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>استمارة مفرغة</span>
                </button>
              )}
            </div>

            {/* Group 4: Output, Export & Print Hub (المخرجات والطباعة الرسمية) */}
            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
              {/* Export Hub Button */}
              <button
                onClick={onOpenExportModal}
                title="تصدير الخطة بصيغ Word و PDF و HTML و JSON"
                className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300/80 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs hover:shadow-xs cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                <span>تصدير</span>
              </button>

              {/* Official Print View */}
              <button
                onClick={onOpenPrintView}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                title="معاينة وطباعة استمارة الدرس الرسمية A4"
              >
                <Printer className="w-3.5 h-3.5 text-slate-200 shrink-0" />
                <span>الطباعة الرسمية</span>
              </button>
            </div>
          </div>

          {/* Tablet & Medium Screen Layout (md to lg / 768px - 1023px): Two-Row Grid Structure */}
          <div className="hidden md:flex lg:hidden flex-col gap-2 py-1">
            {/* Tablet Row 1: Workspace Views & Plan Management */}
            <div className="flex items-center justify-between gap-2">
              {onChangeView && (
                <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs gap-1">
                  <button
                    onClick={() => onChangeView('editor')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      currentView === 'editor' && !isCurrentPlanBlank
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>محرر الخطة</span>
                  </button>
                  <button
                    onClick={() => onChangeView('dashboard')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      currentView === 'dashboard'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>لوحة الإنتاجية ({toArabicDigits(plans.length)})</span>
                  </button>
                  <button
                    onClick={onSelectBlankPlan || onNewBlankPlan}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      currentView === 'editor' && isCurrentPlanBlank
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-amber-800 hover:bg-amber-50'
                    }`}
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    <span>المفرغة 📌</span>
                  </button>
                </div>
              )}

              <div className="flex items-center gap-1.5">
                <button
                  onClick={onOpenPlansViewer}
                  className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <FolderKanban className="w-3.5 h-3.5 text-emerald-700" />
                  <span>عرض الخطط ({toArabicDigits(plans.length)})</span>
                </button>
                <button
                  onClick={() => {
                    if (onRequestDeletePlan) onRequestDeletePlan();
                    else if (onDeletePlan) onDeletePlan(activePlanId);
                  }}
                  className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>حذف الخطة</span>
                </button>
              </div>
            </div>

            {/* Tablet Row 2: Smart Tools & Outputs */}
            <div className="flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onOpenAiGenerator}
                  className="px-2.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                  <span>تحضير بالـ AI</span>
                </button>
                {onOpenUnitPlanModal && (
                  <button
                    onClick={onOpenUnitPlanModal}
                    className="px-2.5 py-1.5 bg-blue-800 hover:bg-blue-900 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 shadow-xs cursor-pointer"
                    title="توليد تحضير وحدة دراسية كاملة"
                  >
                    <Boxes className="w-3.5 h-3.5 text-blue-200" />
                    <span>وحدة كاملة</span>
                  </button>
                )}
                {onOpenSemesterPlanModal && (
                  <button
                    onClick={onOpenSemesterPlanModal}
                    className="px-2.5 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 shadow-xs cursor-pointer"
                    title="الخطة الفصلية الموحدة وتوزيع الحصص"
                  >
                    <CalendarRange className="w-3.5 h-3.5 text-cyan-200" />
                    <span>الخطة الفصلية</span>
                  </button>
                )}
                {onOpenWorksheetModal && (
                  <button
                    onClick={onOpenWorksheetModal}
                    className="px-2.5 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 shadow-xs cursor-pointer"
                  >
                    <FileCheck2 className="w-3.5 h-3.5 text-teal-200" />
                    <span>ورقة عمل AI</span>
                  </button>
                )}
                {onOpenAssessmentModal && (
                  <button
                    onClick={onOpenAssessmentModal}
                    className="px-2.5 py-1.5 bg-purple-800 hover:bg-purple-900 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 shadow-xs cursor-pointer"
                  >
                    <Activity className="w-3.5 h-3.5 text-purple-200" />
                    <span>التقويم الشامل</span>
                  </button>
                )}
                {onOpenAuthenticTaskModal && (
                  <button
                    onClick={onOpenAuthenticTaskModal}
                    className="px-2.5 py-1.5 bg-indigo-800 hover:bg-indigo-900 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 shadow-xs cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5 text-pink-200" />
                    <span>المهمة الأصيلة</span>
                  </button>
                )}
                {onOpenRubricModal && (
                  <button
                    onClick={onOpenRubricModal}
                    className="px-2.5 py-1.5 bg-purple-900 hover:bg-purple-950 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 shadow-xs cursor-pointer"
                  >
                    <ListTree className="w-3.5 h-3.5 text-purple-200" />
                    <span>سلم التقدير</span>
                  </button>
                )}
                <button
                  onClick={onOpenAbacusModal}
                  className="px-2.5 py-1.5 bg-white text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Calculator className="w-3.5 h-3.5 text-emerald-600" />
                  <span>المحاكي</span>
                </button>
                <button
                  onClick={onOpenResourcesModal}
                  className="px-3 py-1.5 bg-linear-to-r from-emerald-100 to-teal-50 hover:from-emerald-200 hover:to-teal-100 text-emerald-950 border-2 border-emerald-400 rounded-xl text-xs font-black flex items-center gap-1.5 shrink-0 shadow-2xs hover:shadow-xs cursor-pointer ring-1 ring-emerald-500/20"
                  title="إدارة ورفع المصادر والمناهج والمراجع التعليمية"
                >
                  <div className="relative p-0.5 bg-emerald-700 text-white rounded-md shrink-0">
                    <Layers className="w-3.5 h-3.5" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 text-amber-950 rounded-full flex items-center justify-center text-[8px] font-black">
                      +
                    </span>
                  </div>
                  <span>إضافة المصادر ({toArabicDigits(resourcesCount)})</span>
                </button>
                {onOpenBlankTemplateModal && (
                  <button
                    onClick={onOpenBlankTemplateModal}
                    className="px-2.5 py-1.5 bg-amber-50 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <FileEdit className="w-3.5 h-3.5 text-amber-700" />
                    <span>استمارة مفرغة</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={onOpenExportModal}
                  className="px-2.5 py-1.5 bg-blue-50 text-blue-900 border border-blue-300 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5 text-blue-700" />
                  <span>تصدير</span>
                </button>
                <button
                  onClick={onOpenPrintView}
                  className="px-2.5 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-200" />
                  <span>طباعة A4</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Mobile Dedicated Quick-Action Strip & Navigation (الهواتف الذكية والأجهزة الصغيرة) */}
      <div className="md:hidden bg-slate-50 border-t border-slate-200/90 px-3 py-2 space-y-2">
        {/* Mobile Workspace Modes Tabs */}
        {onChangeView && (
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => {
                if (onSelectBlankPlan) onSelectBlankPlan();
                else if (onNewBlankPlan) onNewBlankPlan();
                if (onChangeView) onChangeView('editor');
              }}
              className={`flex-1 py-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                currentView === 'editor' && isCurrentPlanBlank
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-amber-800'
              }`}
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>المفرغة 📌</span>
            </button>
            <button
              onClick={() => onChangeView('editor')}
              className={`flex-1 py-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                currentView === 'editor' && !isCurrentPlanBlank
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>المحرر</span>
            </button>
            <button
              onClick={() => onChangeView('dashboard')}
              className={`flex-1 py-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                currentView === 'dashboard'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>الإنتاجية ({toArabicDigits(plans.length)})</span>
            </button>
            <button
              onClick={onOpenResourcesModal}
              className="flex-1 py-2 rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 bg-emerald-100 text-emerald-950 border border-emerald-400 shadow-2xs transition-all hover:bg-emerald-200"
              title="إضافة وإدارة المصادر التعليمية والمناهج"
            >
              <div className="relative p-0.5 bg-emerald-700 text-white rounded-md shrink-0">
                <Layers className="w-3.5 h-3.5" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 text-amber-950 rounded-full flex items-center justify-center text-[8px] font-black">
                  +
                </span>
              </div>
              <span>إضافة المصادر ({toArabicDigits(resourcesCount)})</span>
            </button>
          </div>
        )}

        {/* Mobile Horizontal Quick-Action Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 touch-pan-x">
          <button
            onClick={onOpenAiGenerator}
            className="px-2.5 py-1.5 bg-linear-to-r from-emerald-700 to-teal-800 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 shrink-0 shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
            <span>تحضير AI</span>
          </button>

          {onOpenUnitPlanModal && (
            <button
              onClick={onOpenUnitPlanModal}
              className="px-2.5 py-1.5 bg-linear-to-r from-blue-700 to-indigo-800 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 shrink-0 shadow-2xs cursor-pointer"
              title="تحضير وحدة كاملة بالذكاء الاصطناعي"
            >
              <Boxes className="w-3.5 h-3.5 text-blue-200 shrink-0" />
              <span>وحدة كاملة</span>
            </button>
          )}

          {onOpenSemesterPlanModal && (
            <button
              onClick={onOpenSemesterPlanModal}
              className="px-2.5 py-1.5 bg-linear-to-r from-teal-700 to-cyan-800 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 shrink-0 shadow-2xs cursor-pointer"
              title="الخطة الفصلية وتوزيع الحصص"
            >
              <CalendarRange className="w-3.5 h-3.5 text-cyan-200 shrink-0" />
              <span>الخطة الفصلية</span>
            </button>
          )}

          {onOpenWorksheetModal && (
            <button
              onClick={onOpenWorksheetModal}
              className="px-2.5 py-1.5 bg-linear-to-r from-teal-700 to-emerald-800 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 shrink-0 shadow-2xs cursor-pointer"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-teal-200 shrink-0" />
              <span>ورقة عمل AI</span>
            </button>
          )}

          {onOpenAssessmentModal && (
            <button
              onClick={onOpenAssessmentModal}
              className="px-2.5 py-1.5 bg-linear-to-r from-purple-700 to-indigo-800 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 shrink-0 shadow-2xs cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-purple-200 shrink-0" />
              <span>التقويم الشامل</span>
            </button>
          )}

          {onOpenAuthenticTaskModal && (
            <button
              onClick={onOpenAuthenticTaskModal}
              className="px-2.5 py-1.5 bg-linear-to-r from-indigo-700 to-purple-800 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 shrink-0 shadow-2xs cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-pink-200 shrink-0" />
              <span>المهمة الأصيلة</span>
            </button>
          )}

          {onOpenRubricModal && (
            <button
              onClick={onOpenRubricModal}
              className="px-2.5 py-1.5 bg-linear-to-r from-purple-800 to-indigo-900 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 shrink-0 shadow-2xs cursor-pointer"
            >
              <ListTree className="w-3.5 h-3.5 text-purple-200 shrink-0" />
              <span>سلم التقدير</span>
            </button>
          )}

          <button
            onClick={onOpenAbacusModal}
            className="px-2.5 py-1.5 bg-white text-emerald-900 border border-emerald-300 rounded-xl text-[11px] font-bold flex items-center gap-1 shrink-0 shadow-2xs cursor-pointer"
          >
            <Calculator className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>المحاكي</span>
          </button>

          <button
            onClick={onOpenPlansViewer}
            className="px-2.5 py-1.5 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-xl text-[11px] font-bold flex items-center gap-1 shrink-0 shadow-2xs cursor-pointer"
          >
            <FolderKanban className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>الخطط ({toArabicDigits(plans.length)})</span>
          </button>

          <button
            onClick={onOpenExportModal}
            className="px-2.5 py-1.5 bg-blue-50 text-blue-900 border border-blue-300 rounded-xl text-[11px] font-bold flex items-center gap-1 shrink-0 shadow-2xs cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5 text-blue-700 shrink-0" />
            <span>تصدير</span>
          </button>

          <button
            onClick={onOpenPrintView}
            className="px-2.5 py-1.5 bg-slate-800 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 shrink-0 shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-200 shrink-0" />
            <span>طباعة A4</span>
          </button>

          <button
            onClick={() => {
              if (onRequestDeletePlan) onRequestDeletePlan();
              else if (onDeletePlan) onDeletePlan(activePlanId);
            }}
            className="px-2.5 py-1.5 bg-rose-50 text-rose-800 border border-rose-300 rounded-xl text-[11px] font-bold flex items-center gap-1 shrink-0 shadow-2xs cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>حذف الخطة</span>
          </button>
        </div>

        {/* Mobile Plan Selector in Editor mode */}
        {currentView === 'editor' && (
          <div className="flex flex-col gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-600 shrink-0">الخطة:</span>
              <select
                value={activePlanId}
                onChange={(e) => onSelectPlan(e.target.value)}
                className="text-xs bg-slate-50 font-bold text-slate-800 rounded-lg px-2.5 py-1.5 border border-slate-300 w-full focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.header.lessonTitle
                      ? `${p.header.subject || 'مبحث'} - ${p.header.grade || 'الصف'}: ${p.header.lessonTitle}`
                      : p.title || 'استمارة تحضير مفرغة'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

        {/* Mobile Dropdown Drawer when open */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-200 bg-white space-y-3 animate-in slide-in-from-top-2 duration-150 text-right">
            
            {/* Direct WhatsApp Contact CTA */}
            <a
              href="https://wa.me/972569560022?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%20%D9%88%D8%B1%D8%AD%D9%85%D8%A9%20%D8%A7%D9%84%D9%84%D9%87%D8%8C%20%D8%A3%D9%88%D8%AF%20%D8%A7%D9%84%D8%AA%D9%88%D8%A7%D8%B5%D9%84%20%D9%88%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%A8%D8%AE%D8%B5%D9%88%D8%B5%20%D9%85%D9%86%D8%B8%D9%88%D9%85%D8%A9%20%D8%B9%D8%A8%D9%82%D9%88%D8%B1%20%D9%84%D9%84%D8%AA%D8%AE%D8%B7%D9%8A%D8%B7%20%D8%A7%D9%84%D8%AA%D8%B1%D8%A8%D9%88%D9%8A."
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center justify-center gap-2 shadow-xs font-black text-xs"
            >
              <WhatsAppIcon className="w-4 h-4 text-white shrink-0" />
              <span>تواصل مباشر مع المصمم عبر الواتساب</span>
            </a>

            {/* Section 1: AI Tools */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-black text-emerald-900 px-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>أدوات التوليد والتخطيط بالـ AI:</span>
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  onClick={() => {
                    onOpenAiGenerator();
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-2.5 bg-linear-to-r from-emerald-700 to-teal-800 text-white rounded-xl flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>تحضير درس AI</span>
                </button>

                {onOpenUnitPlanModal && (
                  <button
                    onClick={() => {
                      onOpenUnitPlanModal();
                      setIsMobileMenuOpen(false);
                    }}
                    className="p-2.5 bg-linear-to-r from-blue-700 to-indigo-800 text-white rounded-xl flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Boxes className="w-3.5 h-3.5 text-blue-200" />
                    <span>تحضير وحدة AI</span>
                  </button>
                )}

                {onOpenSemesterPlanModal && (
                  <button
                    onClick={() => {
                      onOpenSemesterPlanModal();
                      setIsMobileMenuOpen(false);
                    }}
                    className="p-2.5 bg-linear-to-r from-teal-700 to-cyan-800 text-white rounded-xl flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <CalendarRange className="w-3.5 h-3.5 text-cyan-200" />
                    <span>الخطة الفصلية 🇵🇸</span>
                  </button>
                )}

                {onOpenWorksheetModal && (
                  <button
                    onClick={() => {
                      onOpenWorksheetModal();
                      setIsMobileMenuOpen(false);
                    }}
                    className="p-2.5 bg-teal-800 text-white rounded-xl flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <FileCheck2 className="w-3.5 h-3.5 text-teal-200" />
                    <span>أوراق عمل AI</span>
                  </button>
                )}
              </div>
            </div>

            {/* Section 2: Resources & Curriculum Tools */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-black text-teal-900 px-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-teal-600" />
                <span>المناهج والوسائل والمصادر:</span>
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  onClick={() => {
                    onOpenResourcesModal();
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-2.5 bg-emerald-100 text-emerald-950 border border-emerald-400 font-black rounded-xl flex items-center justify-center gap-1.5 shadow-2xs col-span-2"
                >
                  <Layers className="w-4 h-4 text-emerald-700" />
                  <span>إضافة وإدارة بنك المصادر ({toArabicDigits(resourcesCount)})</span>
                </button>

                <button
                  onClick={() => {
                    onOpenAbacusModal();
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-2.5 bg-slate-100 border border-slate-300 text-slate-800 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Calculator className="w-3.5 h-3.5 text-emerald-700" />
                  <span>المحاكي الرقمي</span>
                </button>

                <button
                  onClick={() => {
                    if (onChangeView) onChangeView('dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-2.5 bg-slate-100 border border-slate-300 text-slate-800 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-teal-700" />
                  <span>لوحة الإنتاجية</span>
                </button>
              </div>
            </div>

            {/* Section 3: Plans Management & Export */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-black text-slate-900 px-1 flex items-center gap-1">
                <FileEdit className="w-3.5 h-3.5 text-slate-600" />
                <span>إدارة ونماذج التحضير والتصدير:</span>
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  onClick={() => {
                    if (onOpenBlankTemplateModal) onOpenBlankTemplateModal();
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-2.5 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <FileEdit className="w-3.5 h-3.5 text-amber-700" />
                  <span>استمارة مفرغة 📌</span>
                </button>

                <button
                  onClick={() => {
                    if (onOpenPlansViewer) onOpenPlansViewer();
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <FolderKanban className="w-3.5 h-3.5 text-emerald-700" />
                  <span>عرض الخطط ({toArabicDigits(plans.length)})</span>
                </button>

                <button
                  onClick={() => {
                    onOpenPrintView();
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-2.5 bg-slate-900 text-white rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-300" />
                  <span>طباعة PDF (A4)</span>
                </button>

                <button
                  onClick={() => {
                    onOpenExportModal();
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-2.5 bg-blue-700 text-white rounded-xl flex items-center justify-center gap-1.5"
                >
                  <FileDown className="w-3.5 h-3.5 text-blue-200" />
                  <span>تصدير Word/HTML</span>
                </button>
              </div>
            </div>

            {/* Additional Actions row (JSON Export / Import & Delete) */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 px-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportJson}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 font-semibold"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>حفظ JSON</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 font-semibold"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-600" />
                  <span>استيراد</span>
                </button>
                <button
                  onClick={() => {
                    if (onRequestDeletePlan) {
                      onRequestDeletePlan();
                    } else if (onDeletePlan) {
                      onDeletePlan(activePlanId);
                    }
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center gap-1 font-bold"
                  title="حذف الخطة الحالية لوجود أخطاء"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>حذف</span>
                </button>
              </div>

              <button
                onClick={() => {
                  onResetToDefault();
                  setIsMobileMenuOpen(false);
                }}
                className="px-2.5 py-1.5 text-rose-700 hover:bg-rose-50 rounded-lg flex items-center gap-1 font-bold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>استعادة الأصلي</span>
              </button>
            </div>

            {/* Creator Credit & License in Mobile Menu */}
            <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-[11px] text-slate-700 text-center space-y-0.5">
              <p className="font-bold text-emerald-950">
                إعداد وتصميم: الأستاذ عبد الرحمن دويكات
              </p>
              <p className="text-slate-500 text-[10px]">
                الحقوق محفوظة برخصة المشاع الإبداعي (CC BY-NC-SA 4.0)
              </p>
            </div>
          </div>
        )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />
    </header>
  );
};
