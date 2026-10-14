import React from 'react';
import { CompetencyCoverageReport } from '../types/palestinianCompetencies';
import { toArabicDigits, toArabicPercent } from '../utils/arabicNumerals';
import {
  CheckCircle2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Award,
  Layers,
  MessageSquare,
  Brain,
  Lightbulb,
  Users,
  BookOpen,
  ArrowLeft,
} from 'lucide-react';

interface CompetencySemesterProgressBarProps {
  report: CompetencyCoverageReport;
  selectedSubject?: string;
  selectedGrade?: string;
  onSelectCompetencyToPlan?: (competencyTitle: string) => void;
  compact?: boolean;
}

export const CompetencySemesterProgressBar: React.FC<CompetencySemesterProgressBarProps> = ({
  report,
  selectedSubject,
  selectedGrade,
  onSelectCompetencyToPlan,
  compact = false,
}) => {
  const {
    coveragePercentage,
    totalTargetCompetencies,
    coveredCompetenciesCount,
    generalCompetenciesCoverage,
    subjectCompetenciesCoverage,
    uncoveredCompetencies,
    plansAnalyzedCount,
  } = report;

  // Icon mapping for general domains
  const getDomainIcon = (domain: string) => {
    switch (domain) {
      case 'communication':
        return <MessageSquare className="w-3.5 h-3.5 text-blue-600" />;
      case 'critical_thinking':
        return <Brain className="w-3.5 h-3.5 text-purple-600" />;
      case 'creativity':
        return <Lightbulb className="w-3.5 h-3.5 text-amber-600" />;
      case 'participation_responsibility':
        return <Users className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-teal-600" />;
    }
  };

  const getDomainColor = (domain: string) => {
    switch (domain) {
      case 'communication':
        return 'from-blue-500 to-indigo-600';
      case 'critical_thinking':
        return 'from-purple-500 to-violet-600';
      case 'creativity':
        return 'from-amber-500 to-orange-600';
      case 'participation_responsibility':
        return 'from-emerald-500 to-teal-600';
      default:
        return 'from-slate-500 to-slate-700';
    }
  };

  // Color for overall bar
  const getProgressColor = (pct: number) => {
    if (pct >= 85) return 'from-emerald-500 via-teal-500 to-emerald-600';
    if (pct >= 50) return 'from-blue-500 via-teal-500 to-emerald-500';
    if (pct >= 25) return 'from-amber-500 via-orange-500 to-amber-600';
    return 'from-rose-500 via-amber-500 to-rose-600';
  };

  const getStatusText = (pct: number) => {
    if (pct >= 85) return 'تغطية متميزة للكفايات المقررة';
    if (pct >= 60) return 'تغطية جيدة جداً — مستمر بنجاح';
    if (pct >= 30) return 'تغطية قيد التقدم — بحاجة لتعزيز بعض المجالات';
    return 'بداية الفصل — بحاجة لتنويع الكفايات المستهدفة';
  };

  if (compact) {
    return (
      <div className="bg-slate-900/40 rounded-xl p-3 border border-slate-700/50 backdrop-blur-xs">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-bold text-slate-200 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            نسبة تغطية كفايات الفصل
          </span>
          <span className="font-black text-emerald-400 font-mono text-sm">
            {toArabicPercent(coveragePercentage)}
          </span>
        </div>
        <div className="w-full bg-slate-700/70 h-2.5 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(coveragePercentage)} transition-all duration-700`}
            style={{ width: `${coveragePercentage}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
          <span>تم تغطية {toArabicDigits(coveredCompetenciesCount)} من {toArabicDigits(totalTargetCompetencies)}</span>
          <span>{toArabicDigits(plansAnalyzedCount)} خطط مفحوصة</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl p-5 border border-slate-700/60 shadow-xl space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h4 className="font-black text-base text-slate-100">
              شريط المتابعة البصري لتغطية الكفايات الوطنية
            </h4>
            <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full text-[10px] font-bold">
              الفصل الدراسي الحالي
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {selectedSubject ? `مبحث ${selectedSubject}` : 'جميع المباحث'} — {selectedGrade ? selectedGrade : 'كل الصفوف'} — تم تحليل {toArabicDigits(plansAnalyzedCount)} خطة دراسية
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-left sm:text-right">
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 tracking-tight">
              {toArabicPercent(coveragePercentage)}
            </span>
            <div className="text-[11px] font-medium text-slate-400">
              {getStatusText(coveragePercentage)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Overall Progress Bar */}
      <div>
        <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
          <span>مستوى الإنجاز التراكمي الشامل للكفايات</span>
          <span className="text-emerald-400">
            {toArabicDigits(coveredCompetenciesCount)} من {toArabicDigits(totalTargetCompetencies)} كفاية
          </span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-4 p-0.5 border border-slate-700 overflow-hidden shadow-inner">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(coveragePercentage)} transition-all duration-1000 shadow-md`}
            style={{ width: `${Math.max(coveragePercentage, 3)}%` }}
          />
        </div>
      </div>

      {/* Sub-Bars: General Competency Domains */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
        {generalCompetenciesCoverage.map((g) => (
          <div
            key={g.domain}
            className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60 hover:border-slate-600 transition-all"
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-slate-200 flex items-center gap-1.5 truncate">
                {getDomainIcon(g.domain)}
                {g.domainLabel}
              </span>
              <span className="font-mono font-bold text-slate-300 text-[11px]">
                {toArabicPercent(g.percentage)}
              </span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${getDomainColor(g.domain)} transition-all duration-700`}
                style={{ width: `${Math.max(g.percentage, 2)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
              <span>تم تغطية: {toArabicDigits(g.covered)} من {toArabicDigits(g.total)}</span>
              {g.covered >= g.total && g.total > 0 ? (
                <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3" /> مكتمل
                </span>
              ) : (
                <span className="text-slate-500">متبقي {toArabicDigits(g.total - g.covered)}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Subject Specific Sub-Bar */}
      {subjectCompetenciesCoverage.total > 0 && (
        <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-teal-400" />
              الكفايات التخصصية لمبحث: {selectedSubject || 'المادة المحددة'}
            </span>
            <span className="font-mono font-bold text-teal-300 text-xs">
              {toArabicPercent(subjectCompetenciesCoverage.percentage)} ({toArabicDigits(subjectCompetenciesCoverage.covered)} من {toArabicDigits(subjectCompetenciesCoverage.total)})
            </span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-700"
              style={{ width: `${Math.max(subjectCompetenciesCoverage.percentage, 2)}%` }}
            />
          </div>
        </div>
      )}

      {/* Uncovered Competencies Callout & Pedagogical Advice */}
      {uncoveredCompetencies.length > 0 && (
        <div className="bg-amber-950/40 rounded-xl p-3.5 border border-amber-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300 block">
                توجيه تربوي مقترح للدروس القادمة:
              </span>
              <span className="text-slate-300 text-[11px]">
                يوجد {toArabicDigits(uncoveredCompetencies.length)} كفايات مقررة لم يتم تضمينها بعد في خططك هذا الفصل. نوصي بالتركيز على: «{uncoveredCompetencies[0].title}».
              </span>
            </div>
          </div>

          {onSelectCompetencyToPlan && (
            <button
              type="button"
              onClick={() => onSelectCompetencyToPlan(uncoveredCompetencies[0].title)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 shrink-0 transition-all"
            >
              <span>تخطيط درس لهذه الكفاية</span>
              <ArrowLeft className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
