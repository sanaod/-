/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  FileEdit,
  LayoutDashboard,
  Zap,
  Printer,
  FileDown,
  Sparkles,
  Layers,
} from 'lucide-react';
import { toArabicDigits } from '../utils/arabicNumerals';

interface MobileBottomNavProps {
  currentView: 'editor' | 'dashboard' | 'official-print';
  onChangeView: (view: 'editor' | 'dashboard' | 'official-print') => void;
  onOpenToolsHub: () => void;
  onOpenExportModal: () => void;
  onOpenAiModal: () => void;
  onOpenResourcesModal?: () => void;
  resourcesCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onChangeView,
  onOpenToolsHub,
  onOpenExportModal,
  onOpenAiModal,
  onOpenResourcesModal,
  resourcesCount = 0,
}) => {
  return (
    <nav
      aria-label="التنقل السريع للجوال"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-2xl px-1 py-1 no-print"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 4px)' }}
    >
      <div className="grid grid-cols-5 items-center justify-items-center h-14 max-w-lg mx-auto">
        {/* Tab 1: Dashboard / Home */}
        <button
          type="button"
          onClick={() => onChangeView('dashboard')}
          className={`flex flex-col items-center justify-center w-full h-full min-h-[44px] transition-colors rounded-xl cursor-pointer ${
            currentView === 'dashboard'
              ? 'text-emerald-700 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-lg ${currentView === 'dashboard' ? 'bg-emerald-50' : ''}`}>
            <LayoutDashboard className="w-5 h-5 shrink-0" />
          </div>
          <span className="text-[10px] font-bold mt-0.5 tracking-tight">الرئيسية</span>
        </button>

        {/* Tab 2: Lesson Plan Editor */}
        <button
          type="button"
          onClick={() => onChangeView('editor')}
          className={`flex flex-col items-center justify-center w-full h-full min-h-[44px] transition-colors rounded-xl cursor-pointer ${
            currentView === 'editor'
              ? 'text-teal-700 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-lg ${currentView === 'editor' ? 'bg-teal-50' : ''}`}>
            <FileEdit className="w-5 h-5 shrink-0" />
          </div>
          <span className="text-[10px] font-bold mt-0.5 tracking-tight">محرر التحضير</span>
        </button>

        {/* Tab 3: Center Primary Action - New Plan */}
        <div className="flex flex-col items-center justify-center -mt-3.5">
          <div className="flex items-center bg-linear-to-r from-emerald-800 via-teal-800 to-emerald-900 p-1.5 rounded-full shadow-lg ring-3 ring-white border border-emerald-300/40">
            <button
              type="button"
              onClick={onOpenAiModal}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95 transition-all cursor-pointer shadow-md"
              title="إنشاء تحضير درس جديد بالذكاء الاصطناعي"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
            </button>
          </div>
          <span className="text-[9px] font-black text-emerald-800 mt-0.5 tracking-tight">تحضير جديد</span>
        </div>

        {/* Tab 4: Resources Bank */}
        <button
          type="button"
          onClick={onOpenResourcesModal}
          className="flex flex-col items-center justify-center w-full h-full min-h-[44px] text-amber-700 hover:text-amber-800 transition-colors rounded-xl cursor-pointer relative"
        >
          <div className="p-1 rounded-lg bg-amber-50">
            <Layers className="w-5 h-5 shrink-0 text-amber-600" />
          </div>
          <span className="text-[10px] font-bold mt-0.5 tracking-tight">
            المصادر ({toArabicDigits(resourcesCount)})
          </span>
        </button>

        {/* Tab 5: Export & Print */}
        <button
          type="button"
          onClick={() => onChangeView('official-print')}
          className={`flex flex-col items-center justify-center w-full h-full min-h-[44px] transition-colors rounded-xl cursor-pointer ${
            currentView === 'official-print'
              ? 'text-blue-700 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-lg ${currentView === 'official-print' ? 'bg-blue-50' : ''}`}>
            <Printer className="w-5 h-5 shrink-0" />
          </div>
          <span className="text-[10px] font-bold mt-0.5 tracking-tight">طباعة PDF</span>
        </button>
      </div>
    </nav>
  );
};
