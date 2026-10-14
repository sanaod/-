import React, { useState, useMemo } from 'react';
import {
  School,
  Award,
  CheckCircle2,
  Calendar,
  Layers,
  Users,
  Download,
  Share2,
  TrendingUp,
  BarChart3,
  PieChart,
  FileSpreadsheet,
  FileText,
  Printer,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { LessonPlan, EducationalResource } from '../types/lessonPlan';
import { SchoolOerMetrics } from '../types/roleDashboards';
import { calculateSchoolOerMetrics } from '../utils/roleDashboardMetrics';
import {
  exportSchoolOerStatsToExcel,
  exportSchoolOerStatsToWord,
  shareReportLink,
} from '../utils/oerReportsExporter';
import { toArabicDigits, toArabicPercent, formatDateDMY } from '../utils/arabicNumerals';

interface PrincipalRoleDashboardProps {
  plans: LessonPlan[];
  resources: EducationalResource[];
  onOpenReportsCenter?: (defaultReport?: string) => void;
  onOpenEditor?: () => void;
}

export const PrincipalRoleDashboard: React.FC<PrincipalRoleDashboardProps> = ({
  plans,
  resources,
  onOpenReportsCenter,
  onOpenEditor,
}) => {
  const [activeReportPeriod, setActiveReportPeriod] = useState<'semester' | 'monthly'>('semester');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Dynamic school metrics calculation
  const metrics = useMemo(() => {
    return calculateSchoolOerMetrics(plans, resources);
  }, [plans, resources]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleExportExcel = () => {
    exportSchoolOerStatsToExcel(metrics);
    showToast('تم تصدير التقرير الإحصائي المدرسي إلى Excel (.csv) بترميز عربي! 📊');
  };

  const handleExportWord = () => {
    exportSchoolOerStatsToWord(metrics);
    showToast('تم تصدير التقرير الإحصائي المدرسي إلى Word (.doc) المعتمد للمديرية! 📑');
  };

  const handleShareLink = async () => {
    const res = await shareReportLink(
      `تقرير التزام مدرسة ${metrics.schoolName} بالتعليم المفتوح OER`,
      `نسبة الالتزام: ${toArabicPercent(metrics.schoolCommitmentRate)} | تغطية الصفوف ١-٤: ${toArabicPercent(metrics.grades1To4CoverageRate)}.`
    );
    if (res.success) {
      showToast(res.method === 'web_share' ? 'تمت المشاركة بنجاح!' : 'تم نسخ رابط التقرير للحافظة! 📋');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 left-6 z-50 bg-amber-950 text-white px-5 py-3 rounded-2xl shadow-xl border border-amber-400 flex items-center gap-3 animate-slideUp">
          <CheckCircle2 className="w-5 h-5 text-amber-300 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-l from-amber-800 via-orange-800 to-slate-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-amber-500/40 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-400/20 text-amber-200 border border-amber-400/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>🟠 لوحة مدير المدرسة</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/20">
                {metrics.schoolName} — {metrics.academicYear}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black font-['Tajawal'] tracking-tight">
              لوحة قياس التزام المدرسة بتطبيق التعليم المفتوح OER
            </h2>
            <p className="text-xs sm:text-sm text-amber-100 max-w-2xl leading-relaxed">
              تقارير شمولية لإدارة المدرسة: نسبة الالتزام المؤسسي، تغطية صفوف المرحلة الأساسية الأولى (١-٤)، والتقارير الشهرية والفصلية القابلة للتصدير للمديرية والوزارة.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onOpenReportsCenter && (
              <button
                type="button"
                onClick={() => onOpenReportsCenter('school_oer_statistics')}
                className="px-4 py-2.5 bg-linear-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-black rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md hover:scale-[1.02] transition-all cursor-pointer border border-emerald-300/40"
              >
                <Download className="w-4 h-4 text-emerald-100 shrink-0" />
                <span>مركز التقارير والتصدير 📄</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportWord}
              className="px-3.5 py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 border border-white/20 transition-all cursor-pointer"
              title="تصدير تقرير المديرية Word"
            >
              <FileText className="w-4 h-4 text-amber-200 shrink-0" />
              <span>تصدير Word 📑</span>
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3.5 py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 border border-white/20 transition-all cursor-pointer"
              title="تصدير تقرير المديرية Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-200 shrink-0" />
              <span>تصدير Excel 📊</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Principal Indicators Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: نسبة التزام المدرسة بتطبيق OER */}
        <div className="bg-white rounded-3xl p-5 border-2 border-amber-500/20 shadow-sm hover:border-amber-500 transition-all hover:shadow-md group">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-black text-slate-600">نسبة التزام المدرسة بـ OER</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <School className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-3xl font-black text-amber-800 font-['Tajawal']">
              {toArabicPercent(metrics.schoolCommitmentRate)}
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900">
              {metrics.schoolCommitmentRate >= 80 ? 'التزام نموذجي 🏆' : 'التزام جيد'}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-orange-600 h-full rounded-full transition-all duration-700"
              style={{ width: `${metrics.schoolCommitmentRate}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            نسبة المعلمين والخطط التي توظف ثلاثي المصادر والكفايات الوزارية.
          </p>
        </div>

        {/* Metric 2: تغطية الصفوف 1-4 الأساسية */}
        <div className="bg-white rounded-3xl p-5 border-2 border-amber-500/20 shadow-sm hover:border-amber-500 transition-all hover:shadow-md group">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-black text-slate-600">تغطية الصفوف الأساسية (١–٤)</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-3xl font-black text-emerald-800 font-['Tajawal']">
              {toArabicPercent(metrics.grades1To4CoverageRate)}
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              أولوية الوزارة الأولى
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-700"
              style={{ width: `${metrics.grades1To4CoverageRate}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            شمول خطط نموذجية ومصادر OER لكافة صفوف المرحلة الأولى.
          </p>
        </div>

        {/* Metric 3: المعلمون النشطون في OER */}
        <div className="bg-white rounded-3xl p-5 border-2 border-amber-500/20 shadow-sm hover:border-amber-500 transition-all hover:shadow-md group">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-black text-slate-600">المعلمون النشطون بـ OER</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-3xl font-black text-blue-900 font-['Tajawal']">
              {toArabicDigits(metrics.activeOerTeachers)} / {toArabicDigits(metrics.totalTeachers)}
            </div>
            <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
              {Math.round((metrics.activeOerTeachers / (metrics.totalTeachers || 1)) * 100)}% مشاركة
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            معلمون أعدوا خططاً تعتمد المنهاج وبنك المصادر المفتوحة.
          </p>
        </div>

        {/* Metric 4: المصادر الفريدة المستثمرة */}
        <div className="bg-white rounded-3xl p-5 border-2 border-amber-500/20 shadow-sm hover:border-amber-500 transition-all hover:shadow-md group">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-black text-slate-600">المصادر المفتوحة المستثمرة</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-3xl font-black text-purple-900 font-['Tajawal']">
              {toArabicDigits(metrics.totalUniqueResourcesCount)}
            </div>
            <span className="text-xs font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full">
              بوابة + روافد + منهاجي
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            تم استثمارها في {toArabicDigits(metrics.totalPlansCount)} خطة دراسية معتمدة.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION: مصفوفة تغطية الصفوف الدراسية الأساسية (١-٤) والتقارير الشهرية/الفصلية */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: تغطية الصفوف 1-4 الأساسية */}
        <div className="lg:col-span-2 bg-white rounded-3xl border-2 border-amber-500/20 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold">
                ⭐
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 font-['Tajawal']">
                  مصفوفة تغطية الصفوف الأساسية (١–٤) بمنهجية OER
                </h3>
                <p className="text-xs text-slate-500">
                  وفق الدليل الوطني للتعليم المستند لمصادر التعليم المفتوحة
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-black">
              المرحلة الإلزامية الأولى
            </span>
          </div>

          <div className="space-y-3">
            {metrics.gradeCoverageBreakdown.map((gradeItem, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border transition-all ${
                  gradeItem.isPrimaryStage
                    ? 'bg-amber-50/50 border-amber-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{gradeItem.grade}</span>
                    {gradeItem.isPrimaryStage && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-200 text-amber-900">
                        مرحلة أساسية ١-٤
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-600 font-semibold">
                      {toArabicDigits(gradeItem.plansCount)} خطط منجزة
                    </span>
                    <span className="font-black text-xs text-amber-900">
                      {toArabicPercent(gradeItem.coveragePct)}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      gradeItem.isPrimaryStage
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600'
                        : 'bg-slate-400'
                    }`}
                    style={{ width: `${gradeItem.coveragePct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: التقارير الشهرية والفصلية القابلة للتصدير */}
        <div className="bg-white rounded-3xl border-2 border-amber-500/20 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-black text-slate-900 font-['Tajawal']">
                التقارير الشهرية والفصلية
              </h3>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setActiveReportPeriod('semester')}
                className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  activeReportPeriod === 'semester'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'text-slate-600'
                }`}
              >
                فصلي
              </button>
              <button
                type="button"
                onClick={() => setActiveReportPeriod('monthly')}
                className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  activeReportPeriod === 'monthly'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'text-slate-600'
                }`}
              >
                شهري
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {metrics.monthlyTrends.map((trend, i) => (
              <div key={i} className="p-3 bg-slate-50 hover:bg-amber-50/60 rounded-2xl border border-slate-200 transition-colors flex items-center justify-between">
                <div>
                  <div className="text-xs font-black text-slate-900">{trend.monthName}</div>
                  <div className="text-[11px] text-slate-500">
                    {toArabicDigits(trend.plansCreated)} خطة درس منتجة
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-xs font-black text-amber-900">
                    {toArabicPercent(trend.adherenceRate)}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-bold">التزام معتمد</div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <button
              type="button"
              onClick={handleExportWord}
              className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>تصدير التقرير الفصلي الشامل للمديرية 📑</span>
            </button>
            <button
              type="button"
              onClick={handleExportExcel}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>تصدير بيانات المؤشرات بصيغة Excel 📊</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
