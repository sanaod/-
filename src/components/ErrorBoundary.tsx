import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle, Download, ShieldCheck } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  copiedBackupNotice?: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    copiedBackupNotice: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Abqoor Educational System:', error, errorInfo);
  }

  /**
   * Safe restart that NEVER clears localStorage!
   * Guarantees all lesson plans, educational resources, and teacher data remain 100% intact.
   */
  private handleReset = () => {
    try {
      sessionStorage.clear();
    } catch (e) {}
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  /**
   * Emergency download: exports all saved lesson plans and resources
   * to a local JSON file directly from localStorage before reloading.
   */
  private handleEmergencyExport = () => {
    try {
      const rawPlans = localStorage.getItem('educational_expert_lesson_plans_v1');
      const rawResources = localStorage.getItem('educational_expert_resources_v1');
      const emergencyBackup = {
        system: 'منظومة عبقور للتخطيط التربوي وتحضير الدروس',
        type: 'emergency_recovery_backup',
        exportedAt: new Date().toISOString(),
        plans: rawPlans ? JSON.parse(rawPlans) : [],
        resources: rawResources ? JSON.parse(rawResources) : [],
      };

      const blob = new Blob([JSON.stringify(emergencyBackup, null, 2)], {
        type: 'application/json;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `نسخة_طوارئ_خطط_عبقور_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 1000);

      this.setState({ copiedBackupNotice: true });
      setTimeout(() => this.setState({ copiedBackupNotice: false }), 4000);
    } catch (err) {
      console.error('Failed emergency export', err);
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div dir="rtl" className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-['Cairo',sans-serif]">
          <div className="bg-white border-2 border-slate-300 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center shadow-xl space-y-4">
            <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 font-['Tajawal']">
                تم رصد حالة استثنائية في واجهة المنظومة
              </h1>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold mt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>بياناتك وخططك الدراسية محفوظة بأمان تام في المتصفح</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              حدث خطأ برمجي غير متوقع في عرض الواجهة. يمكنك إعادة تشغيل المنظومة بأمان دون أي فقدان لبياناتك، أو تنزيل نسخة احتياطية فورية على جهازك.
            </p>

            {this.state.error?.message && (
              <details className="text-right text-[11px] bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-500 cursor-pointer">
                <summary className="font-bold text-slate-700 hover:text-slate-900 select-none">
                  عرض التفاصيل التقنية للخطأ
                </summary>
                <p className="mt-1 font-mono text-[10px] text-rose-600 break-all dir-ltr text-left">
                  {this.state.error.message}
                </p>
              </details>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إعادة تشغيل المنظومة بأمان</span>
              </button>

              <button
                type="button"
                onClick={this.handleEmergencyExport}
                className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2 transition-all shadow-2xs active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4 text-teal-700" />
                <span>تنزيل نسخة طوارئ (JSON)</span>
              </button>
            </div>

            {this.state.copiedBackupNotice && (
              <p className="text-[11px] text-emerald-700 font-bold animate-in fade-in">
                ✅ تم تنزيل نسخة الطوارئ بنجاح على جهازك!
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
