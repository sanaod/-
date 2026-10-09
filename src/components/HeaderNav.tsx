import React, { useRef, useState } from 'react';
import {
  Sparkles,
  Printer,
  Calculator,
  BookOpen,
  Sunrise,
  FileCheck,
  Target,
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
  Database,
  QrCode,
  Clapperboard,
  Share2,
} from 'lucide-react';
import { LessonPlan } from '../types/lessonPlan';
import { toArabicDigits } from '../utils/arabicNumerals';
import { WhatsAppHeaderButton, WhatsAppIcon } from './WhatsAppContactButton';
import { exportAllPlansToJson, parseAndValidateBackupJson } from '../utils/backupRestore';

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
  onOpenShareModal?: () => void;
  onOpenBlankTemplateModal?: () => void;
  onNewBlankPlan?: () => void;
  onSelectBlankPlan?: () => void;
  onDeletePlan?: (planId: string) => void;
  onOpenPlansViewer?: () => void;
  onRequestDeletePlan?: () => void;
  isCurrentPlanBlank?: boolean;
  currentView?: 'editor' | 'dashboard';
  onChangeView?: (view: 'editor' | 'dashboard') => void;
  onOpenBackupRestoreModal?: () => void;
  onOpenQrModal?: () => void;
  onOpenMotionGraphicsModal?: () => void;
  onOpenAssessmentSimulatorModal?: () => void;
  onOpenAcademicMilestonesModal?: () => void;
  onOpenAndroidAppModal?: () => void;
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
  onOpenShareModal,
  onOpenBlankTemplateModal,
  onNewBlankPlan,
  onSelectBlankPlan,
  onDeletePlan,
  onOpenPlansViewer,
  onRequestDeletePlan,
  isCurrentPlanBlank,
  currentView = 'editor',
  onChangeView,
  onOpenBackupRestoreModal,
  onOpenQrModal,
  onOpenMotionGraphicsModal,
  onOpenAssessmentSimulatorModal,
  onOpenAcademicMilestonesModal,
  onOpenAndroidAppModal,
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

  const handleExportAllPlans = () => {
    exportAllPlansToJson(plans);
    setIsMobileMenuOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const validation = parseAndValidateBackupJson(content);
        if (validation.success && validation.plans.length > 0) {
          if (validation.plans.length === 1) {
            onImportPlan(validation.plans[0]);
          } else if (onOpenBackupRestoreModal) {
            onOpenBackupRestoreModal();
          } else {
            validation.plans.forEach((p) => onImportPlan(p));
          }
        }
      } catch (err) {
        console.error('Failed to parse JSON file:', err);
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
        <div className="flex items-center justify-between py-2 sm:py-3 min-h-[4.5rem] sm:min-h-[5.5rem] gap-3">
          
          {/* Right Side: All Icons Dropdown Menu & Logo/Title */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">



            {/* Logo, Title & Ministry Context (Home Link) */}
            <div
              onClick={onSelectBlankPlan || onNewBlankPlan}
              className="flex items-center gap-3 sm:gap-4 shrink-0 cursor-pointer group select-none"
              title="الصفحة الرئيسية للمنظومة: استمارة التحضير المفرغة المعتمدة"
            >
            <div className="relative group shrink-0">
              <div className="absolute -inset-1 rounded-full bg-linear-to-tr from-amber-400 via-emerald-500 to-teal-400 opacity-80 blur-xs group-hover:opacity-100 transition duration-300"></div>
              <img
                src="/abqoor_logo.jpg"
                alt="شعار منظومة عبقور للتخطيط التربوي وتحضير الدروس"
                className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full object-cover shadow-2xl border-3 sm:border-4 border-amber-300 ring-2 sm:ring-4 ring-emerald-500/30 transition-transform group-hover:scale-105 shrink-0 bg-white"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src.includes('abqoor_logo.jpg')) {
                    target.src = '/logo.png';
                  } else if (target.src.includes('logo.png')) {
                    target.src = '/logo.jpg';
                  } else {
                    target.style.display = 'none';
                    if (target.nextElementSibling) {
                      (target.nextElementSibling as HTMLElement).style.display = 'flex';
                    }
                  }
                }}
              />
              <div
                style={{ display: 'none' }}
                className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full bg-linear-to-tr from-emerald-800 to-teal-700 items-center justify-center text-white shadow-md ring-2 ring-emerald-500/30 shrink-0"
              >
                <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-200" />
              </div>
            </div>
            
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black font-['Tajawal'] text-slate-900 leading-tight flex items-center gap-1.5">
                  <span className="text-emerald-800 group-hover:text-emerald-700 transition-colors">منظومة عبقور</span>
                  <span className="hidden sm:inline text-slate-900">للتخطيط التربوي وتحضير الدروس</span>
                </h1>
                <span className="text-xs font-extrabold bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-300 shadow-2xs">
                  عبقور التربوي 👑
                </span>
                <span className="hidden lg:inline-flex items-center gap-1 text-xs font-bold bg-emerald-100 text-emerald-950 px-3 py-1 rounded-full border border-emerald-300 shadow-2xs">
                  <span>المعايير الوزارية المعتمدة</span>
                </span>
                <span className="hidden xl:inline-flex items-center gap-1 text-[11px] font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-300" title="رخصة المشاع الإبداعي CC BY-NC-SA 4.0">
                  <span>CC BY-NC-SA 4.0</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 hidden sm:block font-semibold truncate max-w-md lg:max-w-none mt-1">
                إعداد وتصميم: <strong className="text-emerald-800 font-extrabold">الأستاذ عبد الرحمن دويكات</strong> | المنصة المعتمدة للتخطيط الصفي
              </p>

              {/* Stacked Quick Icons Directly Below System Name in Two Organized Rows (أيقونات سريعة مرتبة في صفين منظمين تحت الاسم مباشرة) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1.5">
                <button
                  type="button"
                  onClick={onOpenAiGenerator}
                  title="تحضير درس فوري بالذكاء الاصطناعي"
                  className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span className="truncate">تحضير AI</span>
                </button>
                <button
                  type="button"
                  onClick={onSelectBlankPlan || onNewBlankPlan}
                  title="استمارة التحضير المفرغة المعتمدة"
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 transition-all"
                >
                  <FileEdit className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">المفرغة 📌</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenPrintView}
                  title="طباعة الاستمارة الرسمية A4"
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 transition-all"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  <span className="truncate">طباعة A4</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenExportModal}
                  title="تصدير الخطة بصيغ Word و PDF"
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 transition-all"
                >
                  <FileDown className="w-3.5 h-3.5 text-blue-100 shrink-0" />
                  <span className="truncate">تصدير</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenResourcesModal}
                  title="إضافة وإدارة بنك المصادر والمناهج"
                  className="px-2.5 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 transition-all"
                >
                  <Layers className="w-3.5 h-3.5 text-teal-200 shrink-0" />
                  <span className="truncate">المصادر ({toArabicDigits(resourcesCount)})</span>
                </button>
                {onOpenAcademicMilestonesModal && (
                  <button
                    type="button"
                    onClick={onOpenAcademicMilestonesModal}
                    title="محطات العام الدراسي (افتتاح - فصل 1 - فصل 2 - ختام)"
                    className="px-2.5 py-1 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 transition-all"
                  >
                    <CalendarRange className="w-3.5 h-3.5 text-indigo-200 shrink-0" />
                    <span className="truncate">محطات العام 🗓️</span>
                  </button>
                )}
                {onOpenAndroidAppModal && (
                  <button
                    type="button"
                    onClick={onOpenAndroidAppModal}
                    title="تنزيل وتحميل تطبيق أندرويد (APK / PWA / Google Play)"
                    className="px-2.5 py-1 bg-linear-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-sm cursor-pointer active:scale-95 transition-all border border-emerald-300/60 ring-2 ring-emerald-500/20 col-span-2 sm:col-span-2"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
                    <span className="truncate">تنزيل وتحميل التطبيق 📱</span>
                  </button>
                )}
              </div>
            </div>
          </div>
          </div>

          {/* Quick Icons Stack Beside System Name (أيقونات الوصول السريع المكدسة والمنظمة بجانب اسم المنظومة) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Inline Quick Action Icons Dock */}
            <div className="hidden sm:flex items-center gap-1 bg-white/95 p-1 rounded-2xl border border-emerald-300/60 shadow-2xs backdrop-blur-xs">
              {/* Quick AI Plan */}
              <button
                onClick={onOpenAiGenerator}
                title="توليد خطة درس نموذجية بالذكاء الاصطناعي"
                className="p-1.5 text-emerald-800 hover:text-emerald-900 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer group flex items-center gap-1 text-xs font-bold"
              >
                <Sparkles className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span className="hidden xl:inline text-[11px]">تحضير AI</span>
              </button>

              {/* Quick Blank Form */}
              <button
                onClick={onSelectBlankPlan || onNewBlankPlan}
                title="استمارة التحضير المفرغة المعتمدة (الصفحة الرئيسية)"
                className="p-1.5 text-amber-800 hover:text-amber-900 hover:bg-amber-50 rounded-xl transition-all cursor-pointer group flex items-center gap-1 text-xs font-bold"
              >
                <FileEdit className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                <span className="hidden xl:inline text-[11px]">المفرغة 📌</span>
              </button>

              {/* Quick Print A4 */}
              <button
                onClick={onOpenPrintView}
                title="معاينة وطباعة استمارة الدرس الرسمية A4"
                className="p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer group flex items-center gap-1 text-xs font-bold"
              >
                <Printer className="w-4 h-4 text-slate-800 group-hover:scale-110 transition-transform" />
                <span className="hidden xl:inline text-[11px]">طباعة</span>
              </button>

              {/* Quick Export */}
              <button
                onClick={onOpenExportModal}
                title="تصدير الخطة بصيغ Word و PDF و HTML"
                className="p-1.5 text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-xl transition-all cursor-pointer group flex items-center gap-1 text-xs font-bold"
              >
                <FileDown className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="hidden xl:inline text-[11px]">تصدير</span>
              </button>

              {/* Quick Share via Web Share API */}
              {onOpenShareModal && (
                <button
                  onClick={onOpenShareModal}
                  title="مشاركة الخطة مع الزملاء عبر تطبيقات المراسلة (Web Share API)"
                  className="p-1.5 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer group flex items-center gap-1 text-xs font-bold"
                >
                  <Share2 className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span className="hidden xl:inline text-[11px]">مشاركة</span>
                </button>
              )}

              {/* Quick Backup/Restore */}
              {onOpenBackupRestoreModal && (
                <button
                  onClick={onOpenBackupRestoreModal}
                  title="نسخ احتياطي واستيراد الخطط (JSON)"
                  className="p-1.5 text-teal-700 hover:text-teal-900 hover:bg-teal-50 rounded-xl transition-all cursor-pointer group flex items-center gap-1 text-xs font-bold"
                >
                  <Database className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
                  <span className="hidden xl:inline text-[11px]">نسخ احتياطي</span>
                </button>
              )}
            </div>

            {/* Direct QR Code Generator Button */}
            {onOpenQrModal && (
              <button
                onClick={onOpenQrModal}
                className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-linear-to-r from-teal-600 via-emerald-600 to-teal-700 hover:from-teal-700 hover:to-emerald-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer border border-teal-400/60"
                title="تصميم وتوليد رمز الاستجابة السريعة (QR) للمنظومة"
              >
                <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-200 shrink-0" />
                <span className="hidden md:inline">QR المنظومة 📱</span>
              </button>
            )}

            {/* Motion Graphics Video Generator Button */}
            {onOpenMotionGraphicsModal && (
              <button
                onClick={onOpenMotionGraphicsModal}
                className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-linear-to-r from-purple-700 via-indigo-700 to-purple-800 hover:from-purple-800 hover:to-indigo-900 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer border border-purple-400/60"
                title="توليد ومعاينة فيديو موشن جرافيك تعليمي متناسب مع تحضير الدرس الحالي"
              >
                <Clapperboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-200 shrink-0" />
                <span className="hidden lg:inline">موشن جرافيك 🎬</span>
              </button>
            )}

            {/* Direct WhatsApp Contact Button (Desktop / Tablet) */}
            <div className="hidden sm:block">
              <WhatsAppHeaderButton />
            </div>

            {/* Active Plan Quick Badge (Desktop / Tablet) */}
            <div className="hidden 2xl:flex items-center gap-2 bg-slate-100/90 hover:bg-slate-200/80 px-3 py-1.5 rounded-xl border border-slate-200 text-xs transition-colors">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span className="font-bold text-slate-700">الدرس الحالي:</span>
              <span className="font-extrabold text-slate-900 truncate max-w-[160px]">
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

      {/* 2. Dedicated Main Stacked Toolbar Directly Below System Name (شريط الأيقونات المكدس والمنظم أسفل اسم المنظومة) */}
      <div className="bg-slate-50/95 border-t border-slate-200/90 py-2 sm:py-2.5">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-2">
          
          {/* Stack Tier Row A: مسار التخطيط والذكاء الاصطناعي والمناهج (AI & Planning Tier) */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 bg-white rounded-2xl border border-emerald-200/90 shadow-2xs">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-800 text-emerald-50 rounded-xl text-[11px] font-black shrink-0 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                <span>مكدس التخطيط والـ AI:</span>
              </span>

              {/* AI Plan Generator CTA */}
              <button
                onClick={onOpenAiGenerator}
                className="px-2.5 py-1.5 bg-linear-to-r from-emerald-700 via-emerald-800 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
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
                  className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200/90 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer group active:scale-95"
                >
                  <Boxes className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform shrink-0" />
                  <span>وحدة كاملة</span>
                </button>
              )}

              {/* Semester Plan Guide CTA */}
              {onOpenSemesterPlanModal && (
                <button
                  onClick={onOpenSemesterPlanModal}
                  title="توليد وعرض الخطة الفصلية الموحدة ودليل توزيع الحصص"
                  className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200/90 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer group active:scale-95"
                >
                  <CalendarRange className="w-3.5 h-3.5 text-teal-600 group-hover:scale-110 transition-transform shrink-0" />
                  <span>الخطة الفصلية</span>
                </button>
              )}

              {/* Interactive Worksheet CTA */}
              {onOpenWorksheetModal && (
                <button
                  onClick={onOpenWorksheetModal}
                  title="توليد ورقة عمل تفاعلية ذكية متوافقة مع الدرس بالذكاء الاصطناعي"
                  className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer group active:scale-95"
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-teal-600 group-hover:scale-110 transition-transform shrink-0" />
                  <span>ورقة عمل AI</span>
                </button>
              )}
            </div>

            {/* Quick Helper Badges */}
            <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200/60">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>مخرجات متوافقة مع النموذج الوزاري الفلسطيني المعتمد</span>
            </div>
          </div>

          {/* Stack Tier Row B: مسار أدوات التقويم والقياس والأنشطة والتحليل (Assessment & Evaluation Tier) */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 bg-white rounded-2xl border border-purple-200/90 shadow-2xs">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-purple-900 text-purple-50 rounded-xl text-[11px] font-black shrink-0 shadow-2xs">
                <Activity className="w-3.5 h-3.5 text-purple-300" />
                <span>مكدس التقويم والقياس:</span>
              </span>

              {/* Assessment Hub CTA */}
              {onOpenAssessmentModal && (
                <button
                  onClick={onOpenAssessmentModal}
                  title="توليد وإدارة أدوات التقويم التشخيصي، التكويني، والختامي"
                  className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer group active:scale-95"
                >
                  <Activity className="w-3.5 h-3.5 text-purple-600 group-hover:scale-110 transition-transform shrink-0" />
                  <span>أدوات التقويم</span>
                </button>
              )}

              {/* Authentic Task CTA (GRASPS) */}
              {onOpenAuthenticTaskModal && (
                <button
                  onClick={onOpenAuthenticTaskModal}
                  title="توليد وتصميم مهمة التقويم الأصيل GRASPS بالذكاء الاصطناعي"
                  className="px-2.5 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-900 border border-pink-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer group active:scale-95"
                >
                  <Award className="w-3.5 h-3.5 text-pink-600 group-hover:scale-110 transition-transform shrink-0" />
                  <span>المهمة الأصيلة (GRASPS)</span>
                </button>
              )}

              {/* Rubric Generator CTA */}
              {onOpenRubricModal && (
                <button
                  onClick={onOpenRubricModal}
                  title="توليد وتصميم سلم التقدير اللفظي Rubric"
                  className="px-2.5 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-900 border border-violet-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer group active:scale-95"
                >
                  <ListTree className="w-3.5 h-3.5 text-violet-600 group-hover:scale-110 transition-transform shrink-0" />
                  <span>سلم التقدير (Rubric)</span>
                </button>
              )}

              {/* Educational Assessment Calendar Simulator */}
              {onOpenAssessmentSimulatorModal && (
                <button
                  onClick={onOpenAssessmentSimulatorModal}
                  title="محاكي التقويم التربوي لتصور تواريخ المهام المعقدة"
                  className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                >
                  <CalendarRange className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>محاكي التقويم 🗓️</span>
                </button>
              )}

              {/* Interactive Tool / Abacus Simulator */}
              <button
                onClick={onOpenAbacusModal}
                title="المحاكي الرقمي والأداة التفاعلية (المعداد)"
                className="px-2.5 py-1.5 bg-slate-50 hover:bg-emerald-50 text-emerald-900 border border-emerald-200/80 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
              >
                <Calculator className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>المحاكي الرقمي</span>
              </button>
            </div>

            {/* Resources Manager CTA */}
            <button
              onClick={onOpenResourcesModal}
              title="إدارة ورفع المصادر والمناهج والمراجع التعليمية بسهولة"
              className="px-2.5 py-1.5 bg-linear-to-r from-emerald-100 to-teal-50 hover:from-emerald-200 hover:to-teal-100 text-emerald-950 border border-emerald-400 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer group shadow-2xs shrink-0 active:scale-95"
            >
              <div className="relative p-0.5 bg-emerald-700 group-hover:bg-emerald-800 text-white rounded-md shadow-2xs transition-colors shrink-0">
                <Layers className="w-3.5 h-3.5 text-emerald-100" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 text-amber-950 rounded-full flex items-center justify-center text-[8px] font-black">
                  +
                </span>
              </div>
              <span>إضافة المصادر</span>
              <span className="px-1.5 py-0.2 bg-emerald-800 text-white rounded-full text-[10px] font-black tabular-nums">
                {toArabicDigits(resourcesCount)}
              </span>
            </button>
          </div>

          {/* Stack Tier Row C: أنماط العمل وسجل الخطط والمخرجات الرسمية (Workspace & Outputs Tier) */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 text-slate-100 rounded-xl text-[11px] font-black shrink-0 shadow-2xs">
                <LayoutDashboard className="w-3.5 h-3.5 text-emerald-300" />
                <span>مكدس العمل والإنتاجية:</span>
              </span>

              {/* View Modes Tabs */}
              {onChangeView && (
                <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 gap-0.5">
                  <button
                    onClick={() => onChangeView('editor')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      currentView === 'editor' && !isCurrentPlanBlank
                        ? 'bg-emerald-700 text-white shadow-xs ring-1 ring-emerald-800/20'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                    title="الانتقال إلى محرر الخطة للتعديل والكتابة"
                  >
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    <span>محرر الخطة</span>
                  </button>

                  <button
                    onClick={() => onChangeView('dashboard')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      currentView === 'dashboard'
                        ? 'bg-emerald-700 text-white shadow-xs ring-1 ring-emerald-800/20'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                    title="لوحة الإنتاجية المفهرسة حسب المادة واسم المعلم"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
                    <span>لوحة الإنتاجية</span>
                    <span className="px-1.5 py-0.2 bg-emerald-800/80 text-white rounded-full text-[10px] font-extrabold tabular-nums">
                      {toArabicDigits(plans.length)}
                    </span>
                  </button>

                  <button
                    onClick={onSelectBlankPlan || onNewBlankPlan}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      currentView === 'editor' && isCurrentPlanBlank
                        ? 'bg-amber-500 text-white shadow-xs ring-1 ring-amber-600/30'
                        : 'text-amber-800 hover:bg-amber-100/70'
                    }`}
                    title="استمارة التحضير المفرغة المعتمدة (الصفحة الرئيسية للمنظومة)"
                  >
                    <FileEdit className="w-3.5 h-3.5 shrink-0" />
                    <span>الاستمارة المفرغة (📌)</span>
                  </button>
                </div>
              )}

              {/* View Plans Modal Trigger Button */}
              <button
                onClick={onOpenPlansViewer}
                title="عرض واستعراض كافة خطط الدروس المحفوظة في المنظومة والتبديل المباشر بينها"
                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300/80 hover:border-emerald-400 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-2xs hover:shadow-xs cursor-pointer active:scale-95"
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
                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300/80 hover:border-rose-400 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-2xs hover:shadow-xs cursor-pointer group active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600 group-hover:text-rose-700 shrink-0 transition-colors" />
                <span>حذف الخطة</span>
              </button>
            </div>

            {/* Output, Export & Print Hub */}
            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
              {/* Backup & Restore JSON CTA */}
              {onOpenBackupRestoreModal && (
                <button
                  type="button"
                  onClick={onOpenBackupRestoreModal}
                  title="تصدير نسخة احتياطية موحدة لكافة الخطط المخزنة في المتصفح كملف JSON أو استيرادها"
                  className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 rounded-xl text-xs font-black flex items-center gap-1 transition-all shadow-2xs hover:shadow-xs cursor-pointer active:scale-95"
                >
                  <Database className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>نسخ احتياطي JSON</span>
                </button>
              )}

              {/* Export Hub Button */}
              <button
                onClick={onOpenExportModal}
                title="تصدير الخطة بصيغ Word و PDF و HTML و JSON"
                className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300/80 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs hover:shadow-xs cursor-pointer active:scale-95"
              >
                <FileDown className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                <span>تصدير</span>
              </button>

              {/* Official Print View */}
              <button
                onClick={onOpenPrintView}
                className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer active:scale-95"
                title="معاينة وطباعة استمارة الدرس الرسمية A4"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span>الطباعة الرسمية A4</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Mobile Dedicated Stacked & Organized Quick-Action Strip (الهواتف الذكية والأجهزة الصغيرة) */}
      <div className="md:hidden bg-slate-50 border-t border-slate-200/90 px-2.5 py-2 space-y-2">
        {/* Mobile Workspace Modes Tabs */}
        {onChangeView && (
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => {
                if (onSelectBlankPlan) onSelectBlankPlan();
                else if (onNewBlankPlan) onNewBlankPlan();
                if (onChangeView) onChangeView('editor');
              }}
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
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
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
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
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                currentView === 'dashboard'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>الإنتاجية ({toArabicDigits(plans.length)})</span>
            </button>
          </div>
        )}

        {/* Mobile Stack Tier 1: التخطيط والذكاء الاصطناعي */}
        <div className="bg-white p-1.5 rounded-xl border border-emerald-200/80 shadow-2xs space-y-1">
          <div className="text-[10px] font-black text-emerald-800 px-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>مكدس التخطيط والـ AI:</span>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 touch-pan-x">
            <button
              onClick={onOpenAiGenerator}
              className="px-2.5 py-1.5 bg-linear-to-r from-emerald-700 to-teal-800 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0 shadow-2xs cursor-pointer active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span>تحضير AI</span>
            </button>
            {onOpenUnitPlanModal && (
              <button
                onClick={onOpenUnitPlanModal}
                className="px-2 py-1.5 bg-blue-50 text-blue-900 border border-blue-200 rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer active:scale-95"
              >
                <Boxes className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>وحدة كاملة</span>
              </button>
            )}
            {onOpenSemesterPlanModal && (
              <button
                onClick={onOpenSemesterPlanModal}
                className="px-2 py-1.5 bg-teal-50 text-teal-900 border border-teal-200 rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer active:scale-95"
              >
                <CalendarRange className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>الخطة الفصلية</span>
              </button>
            )}
            {onOpenWorksheetModal && (
              <button
                onClick={onOpenWorksheetModal}
                className="px-2 py-1.5 bg-slate-50 text-slate-800 border border-slate-200 rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer active:scale-95"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>ورقة عمل AI</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Stack Tier 2: التقويم والقياس والمخرجات */}
        <div className="bg-white p-1.5 rounded-xl border border-purple-200/80 shadow-2xs space-y-1">
          <div className="text-[10px] font-black text-purple-900 px-1 flex items-center gap-1">
            <Activity className="w-3 h-3 text-purple-600" />
            <span>مكدس التقويم والمخرجات السريعة:</span>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 touch-pan-x">
            {onOpenAssessmentModal && (
              <button
                onClick={onOpenAssessmentModal}
                className="px-2 py-1.5 bg-purple-50 text-purple-900 border border-purple-200 rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer active:scale-95"
              >
                <Activity className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>التقويم</span>
              </button>
            )}
            {onOpenAuthenticTaskModal && (
              <button
                onClick={onOpenAuthenticTaskModal}
                className="px-2 py-1.5 bg-pink-50 text-pink-900 border border-pink-200 rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer active:scale-95"
              >
                <Award className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                <span>مهمة أصيلة</span>
              </button>
            )}
            {onOpenRubricModal && (
              <button
                onClick={onOpenRubricModal}
                className="px-2 py-1.5 bg-violet-50 text-violet-900 border border-violet-200 rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer active:scale-95"
              >
                <ListTree className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                <span>Rubric</span>
              </button>
            )}
            <button
              onClick={onOpenPrintView}
              className="px-2.5 py-1.5 bg-slate-900 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer active:scale-95"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span>طباعة A4</span>
            </button>
            <button
              onClick={onOpenExportModal}
              className="px-2 py-1.5 bg-blue-50 text-blue-900 border border-blue-200 rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer active:scale-95"
            >
              <FileDown className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>تصدير</span>
            </button>
            <button
              onClick={onOpenPlansViewer}
              className="px-2 py-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer active:scale-95"
            >
              <FolderKanban className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>الخطط ({toArabicDigits(plans.length)})</span>
            </button>
            <button
              onClick={onOpenResourcesModal}
              className="px-2 py-1.5 bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-lg text-[11px] font-black flex items-center gap-1 shrink-0 cursor-pointer active:scale-95"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>المصادر ({toArabicDigits(resourcesCount)})</span>
            </button>
          </div>
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

                {onOpenShareModal && (
                  <button
                    onClick={() => {
                      onOpenShareModal();
                      setIsMobileMenuOpen(false);
                    }}
                    className="p-2.5 bg-linear-to-r from-emerald-600 to-teal-700 text-white rounded-xl flex items-center justify-center gap-1.5 col-span-2 shadow-2xs font-black"
                  >
                    <Share2 className="w-3.5 h-3.5 text-emerald-200" />
                    <span>مشاركة الخطة مع الزملاء (Web Share 📱)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Additional Actions row (JSON Export / Import & Delete) */}
            <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2 px-1">
              <div className="flex flex-wrap items-center gap-1.5">
                {onOpenBackupRestoreModal && (
                  <button
                    onClick={() => {
                      onOpenBackupRestoreModal();
                      setIsMobileMenuOpen(false);
                    }}
                    className="px-2.5 py-1.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-lg flex items-center gap-1 font-bold"
                  >
                    <Database className="w-3.5 h-3.5 text-amber-700" />
                    <span>نسخ احتياطي واستيراد</span>
                  </button>
                )}
                <button
                  onClick={handleExportAllPlans}
                  className="px-2.5 py-1.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg flex items-center gap-1 font-bold"
                  title="تصدير كافة الخطط كملف JSON"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-700" />
                  <span>تصدير الكل (JSON)</span>
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
