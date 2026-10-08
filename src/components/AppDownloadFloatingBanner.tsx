import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Check, ShieldCheck } from 'lucide-react';

interface AppDownloadFloatingBannerProps {
  onOpenAndroidAppModal: () => void;
}

export const AppDownloadFloatingBanner: React.FC<AppDownloadFloatingBannerProps> = ({
  onOpenAndroidAppModal,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsStandalone(true);
    }
  }, []);

  if (isStandalone || !isVisible) return null;

  return (
    <div
      dir="rtl"
      className="fixed bottom-16 sm:bottom-4 right-4 left-4 sm:left-auto z-40 max-w-md bg-linear-to-r from-slate-950 via-emerald-950 to-teal-950 border-2 border-emerald-500/70 text-white p-3 rounded-2xl shadow-2xl backdrop-blur-md animate-fade-in flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shrink-0">
          <Smartphone className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-white flex items-center gap-1">
            <span>تنزيل تطبيق عبقور للأندرويد 📱</span>
          </h4>
          <p className="text-[10px] text-slate-300">
            تثبيت مباشر وسريع • يعمل بدون إنترنت • إعداد أ. عبد الرحمن دويكات
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={onOpenAndroidAppModal}
          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1 shadow-md"
        >
          <Download className="w-3.5 h-3.5" />
          <span>تحميل وتنزيل</span>
        </button>

        <button
          onClick={() => setIsVisible(false)}
          className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          title="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
