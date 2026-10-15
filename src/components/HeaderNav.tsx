import React, { useRef, useState } from 'react';
import {
  Sparkles,
  Printer,
  BookOpen,
  Layers,
  FileDown,
  FileEdit,
  Menu,
  X,
  ChevronDown,
  Trash2,
  Award,
  FolderOpen,
  Settings,
  Share2,
  CheckCircle,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { LessonPlan } from '../types/lessonPlan';
import { toArabicDigits } from '../utils/arabicNumerals';
import { WhatsAppHeaderButton } from './WhatsAppContactButton';
import { exportAllPlansToJson, parseAndValidateBackupJson } from '../utils/backupRestore';

interface HeaderNavProps {
  plans: LessonPlan[];
  activePlanId: string;
  onSelectPlan: (id: string) => void;
  onOpenAiGenerator: () => void;
  onOpenPalestinianOerHub?: () => void;
  onOpenSmartGuideModal?: () => void;
  onOpenCompetenciesModal?: () => void;
  onOpenPrintView: () => void;
  onOpenResourcesModal: () => void;
  resourcesCount: number;
  onResetToDefault: () => void;
  onImportPlan: (plan: LessonPlan) => void;
  currentPlan: LessonPlan;
  onOpenExportModal: () => void;
  onOpenIntegrationToolModal?: () => void;
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
  currentUser?: string;
  onLogout?: () => void;
  [key: string]: any;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  plans,
  activePlanId,
  onSelectPlan,
  onOpenAiGenerator,
  onOpenPalestinianOerHub,
  onOpenSmartGuideModal,
  onOpenCompetenciesModal,
  onOpenPrintView,
  onOpenResourcesModal,
  resourcesCount,
  onResetToDefault,
  onImportPlan,
  currentPlan,
  onOpenExportModal,
  onOpenIntegrationToolModal,
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
  currentUser = 'أ. أحمد المعلم',
  onLogout,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentPlan, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${currentPlan.header?.lessonTitle || 'خطة_درس'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setMoreMenuOpen(false);
  };

  return (
    <header dir="rtl" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs no-print transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 min-h-[4.5rem] gap-4">
          
          {/* Right Side: Logo & System Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              onClick={onSelectBlankPlan || onNewBlankPlan}
              className="flex items-center gap-3.5 sm:gap-4 cursor-pointer group select-none"
              title="الصفحة الرئيسية لمنظومة عبقور"
            >
              <img
                src="/abqoor_logo.jpg"
                alt="شعار منظومة عبقور"
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full object-cover shadow-lg border-3 border-emerald-600 bg-white group-hover:scale-105 transition-transform shrink-0"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/logo.png';
                }}
              />
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black font-['Tajawal'] text-slate-900 tracking-tight leading-tight">
                    منظومة عبقور للتخطيط التربوي وتحضير الدروس
                  </h1>
                  <span className="text-[11px] font-extrabold bg-emerald-100 text-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-300 shadow-2xs shrink-0">
                    منهاج فلسطيني PS 🇵🇸
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-emerald-800 mt-1">
                  التعليم المستند إلى مصادر التعليم المفتوحة — منهاج فلسطيني PS
                </p>
              </div>
            </div>
          </div>

          {/* Center/Main Navigation: Exactly 4 Buttons */}
          <div className="hidden md:flex items-center gap-2">
            
            {/* 1. تحضير جديد */}
            <button
              type="button"
              onClick={onOpenAiGenerator}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
              title="تحضير درس جديد بالذكاء الاصطناعي ومصادر OER"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>تحضير جديد</span>
            </button>

            {/* 2. بنك المصادر */}
            <button
              type="button"
              onClick={onOpenResourcesModal}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
              title="بنك المصادر والمناهج المعتمدة"
            >
              <Layers className="w-4 h-4 text-teal-700" />
              <span>بنك المصادر ({toArabicDigits(resourcesCount)})</span>
            </button>

            {/* 3. مكتبة الكفايات */}
            <button
              type="button"
              onClick={onOpenCompetenciesModal}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
              title="مكتبة الكفايات الوطنية الفلسطينية"
            >
              <Award className="w-4 h-4 text-amber-600" />
              <span>مكتبة الكفايات</span>
            </button>

            {/* 4. عرض خططي */}
            <button
              type="button"
              onClick={onOpenPlansViewer || (() => onChangeView?.('dashboard'))}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
              title="استعراض قائمة خططي (قيد العمل / مكتملة)"
            >
              <FolderOpen className="w-4 h-4 text-blue-600" />
              <span>عرض خططي</span>
            </button>

          </div>

          {/* Left Side: Auto-save status & ⋮ المزيد Menu */}
          <div className="flex items-center gap-2">
            
            {/* Auto Save Badge */}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>محفوظ ✅</span>
            </div>

            {/* ⋮ المزيد Menu Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                title="المزيد من الخيارات (طباعة، تصدير، نسخ، حذف، إعدادات)"
              >
                <span>⋮ المزيد</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {moreMenuOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 mb-1 bg-slate-50/70 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="overflow-hidden">
                      <span className="block text-[11px] font-bold text-slate-900 truncate">{currentUser}</span>
                      <span className="block text-[9px] text-slate-500">مسجل الدخول رسمياً</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setMoreMenuOpen(false); onOpenPrintView(); }}
                    className="w-full px-4 py-2 text-right text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-slate-500" />
                    <span>طباعة الخطة (A4)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setMoreMenuOpen(false); onOpenExportModal(); }}
                    className="w-full px-4 py-2 text-right text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <FileDown className="w-4 h-4 text-blue-600" />
                    <span>تصدير (PDF / Word)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setMoreMenuOpen(false); onOpenIntegrationToolModal?.(); }}
                    className="w-full px-4 py-2 text-right text-xs font-bold text-emerald-800 hover:bg-emerald-50 flex items-center gap-2 cursor-pointer"
                  >
                    <span className="text-sm">🐍</span>
                    <span>أداة ربط بايثون والمصادر المفتوحة OER</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setMoreMenuOpen(false); onSelectBlankPlan?.(); }}
                    className="w-full px-4 py-2 text-right text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <FileEdit className="w-4 h-4 text-amber-600" />
                    <span>استمارة تحضير مفرغة (نسخ)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setMoreMenuOpen(false); onOpenBackupRestoreModal?.(); }}
                    className="w-full px-4 py-2 text-right text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-slate-600" />
                    <span>الإعدادات والنسخ الاحتياطي</span>
                  </button>

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    type="button"
                    onClick={() => { setMoreMenuOpen(false); onRequestDeletePlan?.(); }}
                    className="w-full px-4 py-2 text-right text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-rose-500" />
                    <span>حذف هذه الخطة</span>
                  </button>

                  {onLogout && (
                    <>
                      <div className="border-t border-slate-100 my-1"></div>
                      <button
                        type="button"
                        onClick={() => { setMoreMenuOpen(false); onLogout(); }}
                        className="w-full px-4 py-2 text-right text-xs font-bold text-amber-700 hover:bg-amber-50 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-amber-600" />
                        <span>تسجيل الخروج</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Mobile Navigation Bar (4 Buttons) */}
        <div className="flex md:hidden items-center justify-between gap-1 pb-2 pt-1 border-t border-slate-100">
          <button
            type="button"
            onClick={onOpenAiGenerator}
            className="flex-1 py-1.5 bg-emerald-700 text-white rounded-lg text-[11px] font-black flex items-center justify-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>تحضير جديد</span>
          </button>
          <button
            type="button"
            onClick={onOpenResourcesModal}
            className="flex-1 py-1.5 bg-white text-slate-800 border border-slate-200 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1"
          >
            <Layers className="w-3 h-3 text-teal-700" />
            <span>المصادر</span>
          </button>
          <button
            type="button"
            onClick={onOpenCompetenciesModal}
            className="flex-1 py-1.5 bg-white text-slate-800 border border-slate-200 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1"
          >
            <Award className="w-3 h-3 text-amber-600" />
            <span>الكفايات</span>
          </button>
          <button
            type="button"
            onClick={onOpenPlansViewer || (() => onChangeView?.('dashboard'))}
            className="flex-1 py-1.5 bg-white text-slate-800 border border-slate-200 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1"
          >
            <FolderOpen className="w-3 h-3 text-blue-600" />
            <span>خططي</span>
          </button>
        </div>

      </div>
    </header>
  );
};

