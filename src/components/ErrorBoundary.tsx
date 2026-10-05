import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Educational Expert App:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
    } catch (e) {}
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div dir="rtl" className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-['Cairo',sans-serif]">
          <div className="bg-white border-2 border-slate-300 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center shadow-xl space-y-4">
            <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 font-['Tajawal']">
              تم رصد حالة استثنائية في واجهة المنظومة
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              يرجى النقر على زر التحديث أدناه لإعادة تشغيل المنظومة واستعادة خططك الدراسية بشكل آمن.
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold inline-flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إعادة تشغيل المنظومة فوراً</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
