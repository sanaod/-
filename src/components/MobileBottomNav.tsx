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
} from 'lucide-react';

interface MobileBottomNavProps {
  currentView: 'editor' | 'dashboard' | 'official-print';
  onChangeView: (view: 'editor' | 'dashboard' | 'official-print') => void;
  onOpenToolsHub: () => void;
  onOpenExportModal: () => void;
  onOpenAiModal: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onChangeView,
  onOpenToolsHub,
  onOpenExportModal,
  onOpenAiModal,
}) => {
  return (
    <nav
      aria-label="التنقل السريع للجوال"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-2xl px-1 py-1 no-print"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 4px)' }}
    >
      <div className="grid grid-cols-5 items-center justify-items-center h-14 max-w-lg mx-auto">
        {/* Tab 1: Editor / Home */}
        <button
          type="button"
          onClick={() => onChangeView('editor')}
          className={`flex flex-col items-center justify-center w-full h-full min-h-[44px] transition-colors rounded-xl cursor-pointer ${
            currentView === 'editor'
              ? 'text-emerald-700 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-lg ${currentView === 'editor' ? 'bg-emerald-50' : ''}`}>
            <FileEdit className="w-5 h-5 shrink-0" />
          </div>
          <span className="text-[10px] font-bold mt-0.5 tracking-tight">الرئيسية</span>
        </button>

        {/* Tab 2: Master Tools Hub */}
        <button
          type="button"
          onClick={onOpenToolsHub}
          className="flex flex-col items-center justify-center w-full h-full min-h-[44px] text-amber-600 hover:text-amber-700 transition-colors rounded-xl cursor-pointer"
        >
          <div className="p-1 rounded-lg bg-amber-50">
            <Zap className="w-5 h-5 shrink-0 text-amber-600 fill-amber-100" />
          </div>
          <span className="text-[10px] font-bold mt-0.5 tracking-tight">الأدوات (٢٢)</span>
        </button>

        {/* Tab 3: Center Primary Action (AI Generator Quick Trigger) */}
        <button
          type="button"
          onClick={onOpenAiModal}
          className="flex flex-col items-center justify-center -mt-3.5 group cursor-pointer"
          title="تحضير درس جديد بالذكاء الاصطناعي"
        >
          <div className="w-11 h-11 rounded-full bg-linear-to-tr from-emerald-700 via-teal-700 to-emerald-800 text-white flex items-center justify-center shadow-lg ring-4 ring-white group-active:scale-95 transition-transform">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <span className="text-[10px] font-black text-emerald-800 mt-0.5">تحضير AI</span>
        </button>

        {/* Tab 4: Teacher Dashboard */}
        <button
          type="button"
          onClick={() => onChangeView('dashboard')}
          className={`flex flex-col items-center justify-center w-full h-full min-h-[44px] transition-colors rounded-xl cursor-pointer ${
            currentView === 'dashboard'
              ? 'text-teal-700 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-lg ${currentView === 'dashboard' ? 'bg-teal-50' : ''}`}>
            <LayoutDashboard className="w-5 h-5 shrink-0" />
          </div>
          <span className="text-[10px] font-bold mt-0.5 tracking-tight">الإنتاجية</span>
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
