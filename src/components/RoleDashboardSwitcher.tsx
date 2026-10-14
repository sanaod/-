import React from 'react';
import { UserRole } from '../types/roleDashboards';
import { User, ShieldCheck, School, Sparkles, Download, Layers } from 'lucide-react';

interface RoleDashboardSwitcherProps {
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  onOpenReportsCenter?: () => void;
  completedPlansCount?: number;
  schoolCommitmentRate?: number;
  teachersCount?: number;
}

export const RoleDashboardSwitcher: React.FC<RoleDashboardSwitcherProps> = ({
  currentRole,
  onChangeRole,
  onOpenReportsCenter,
  completedPlansCount = 0,
  schoolCommitmentRate = 88,
  teachersCount = 6,
}) => {
  return (
    <div className="bg-white border-2 border-slate-200/90 rounded-3xl p-3 sm:p-4 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3 no-print">
      {/* Role Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-black text-slate-700 ml-1 hidden sm:inline-block">
          الدور والمستوى الرقابي:
        </span>

        {/* 1. لوحة المعلم */}
        <button
          type="button"
          onClick={() => onChangeRole('teacher')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer ${
            currentRole === 'teacher'
              ? 'bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white shadow-md ring-2 ring-emerald-400/40 scale-[1.02]'
              : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-200'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
          <span>🟢 لوحة المعلم</span>
        </button>

        {/* 2. لوحة المشرف */}
        <button
          type="button"
          onClick={() => onChangeRole('supervisor')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer ${
            currentRole === 'supervisor'
              ? 'bg-gradient-to-r from-blue-800 via-indigo-800 to-blue-900 text-white shadow-md ring-2 ring-blue-400/40 scale-[1.02]'
              : 'bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-900 border border-slate-200'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shrink-0" />
          <span>🔵 لوحة المشرف التربوي</span>
        </button>

        {/* 3. لوحة المدير */}
        <button
          type="button"
          onClick={() => onChangeRole('principal')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer ${
            currentRole === 'principal'
              ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white shadow-md ring-2 ring-amber-400/40 scale-[1.02]'
              : 'bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-slate-200'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
          <span>🟠 لوحة مدير المدرسة</span>
        </button>
      </div>

      {/* Right / Quick Indicators & Reports Center Button */}
      <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>البيانات تحدث تلقائياً ولحظياً ⚡</span>
        </div>

        {onOpenReportsCenter && (
          <button
            type="button"
            onClick={onOpenReportsCenter}
            className="px-3.5 py-2 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer border border-slate-700 active:scale-95"
            title="فتح مركز التقارير الرسمية الثلاثة بصيغ PDF و Word و Excel والمشاركة"
          >
            <Download className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>التقارير المعتمدة (PDF/Word/Excel) 📄</span>
          </button>
        )}
      </div>
    </div>
  );
};
