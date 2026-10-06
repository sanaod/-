import React, { useState, useRef } from 'react';
import {
  X,
  Sparkles,
  TrendingUp,
  BrainCircuit,
  Award,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  Printer,
  Copy,
  Check,
  Download,
  Loader2,
  BarChart2,
  Compass,
  Zap,
  Target,
  FileText,
  ShieldCheck,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { toArabicDigits } from '../utils/arabicNumerals';

export interface AchievementTrendReportData {
  reportTitle: string;
  academicYear: string;
  generatedDate: string;
  executiveSummary: string;
  overallProficiencyIndex: string;
  trendAnalysis: {
    direction: string;
    description: string;
    rubricProgressionCommentary: string;
  };
  competenciesStrengths: Array<{
    domain: string;
    evidence: string;
    impact: string;
  }>;
  competenciesWeaknesses: Array<{
    domain: string;
    gap: string;
    risk: string;
  }>;
  semesterComparison: {
    firstSemesterOverview: string;
    secondSemesterOverview: string;
    keyDifferences: string;
    progressionInsight: string;
  };
  pedagogicalActionPlan: Array<{
    focusArea: string;
    targetSemester: string;
    actionableSteps: string[];
    recommendedTools: string[];
  }>;
  keyMetrics: {
    excellenceRate: string;
    proficiencyRate: string;
    growthSupportRate: string;
    formativeToSummativeRatio: string;
    graspsAuthenticRate: string;
  };
}

interface AchievementTrendsReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: AchievementTrendReportData | null;
  isLoading: boolean;
  onRegenerate: (customNotes?: string) => Promise<void>;
  semesterProgressionData?: Array<{
    semester: string;
    excellence: number;
    proficiency: number;
    support: number;
    criticalThinking: number;
    conceptual: number;
    practical: number;
  }>;
  subjectFilter?: string;
  gradeFilter?: string;
}

export const AchievementTrendsReportModal: React.FC<AchievementTrendsReportModalProps> = ({
  isOpen,
  onClose,
  report,
  isLoading,
  onRegenerate,
  semesterProgressionData = [],
  subjectFilter = 'الكل',
  gradeFilter = 'الكل',
}) => {
  const [copied, setCopied] = useState(false);
  const [customNote, setCustomNote] = useState('');
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleCopyMarkdown = () => {
    if (!report) return;
    const md = `# ${report.reportTitle}
العام الأكاديمي: ${report.academicYear} | تاريخ التوليد: ${report.generatedDate}
المبحث: ${subjectFilter} | الصف: ${gradeFilter}
مؤشر الإتقان العام: ${report.overallProficiencyIndex}

## 📌 الملخص التنفيذي
${report.executiveSummary}

## 📈 مسار واتجاهات التحصيل (Trend Analysis)
- **الاتجاه:** ${report.trendAnalysis.direction}
- **الوصف التحليلي:** ${report.trendAnalysis.description}
- **تطور سلالم التقدير (Rubrics):** ${report.trendAnalysis.rubricProgressionCommentary}

## 🌟 نقاط القوة في توزيع الكفايات التعليمية
${report.competenciesStrengths
  .map(
    (s, i) => `### ${i + 1}. ${s.domain}
- **الشواهد والأدلة:** ${s.evidence}
- **الأثر التعليمي:** ${s.impact}`
  )
  .join('\n\n')}

## ⚠️ نقاط الضعف والفجوات التعليمية عبر الفصول
${report.competenciesWeaknesses
  .map(
    (w, i) => `### ${i + 1}. ${w.domain}
- **الفجوة المرصودة:** ${w.gap}
- **المخاطر التربوية:** ${w.risk}`
  )
  .join('\n\n')}

## ⚖️ المقارنة بين الفصول الدراسية
- **الفصل الدراسي الأول:** ${report.semesterComparison.firstSemesterOverview}
- **الفصل الدراسي الثاني:** ${report.semesterComparison.secondSemesterOverview}
- **أبرز الفروق:** ${report.semesterComparison.keyDifferences}
- **رؤية التدرج المستقبلي:** ${report.semesterComparison.progressionInsight}

## 🎯 الخطة الإجرائية والتوصيات التربوية
${report.pedagogicalActionPlan
  .map(
    (p, i) => `### ${i + 1}. مجالات التركيز: ${p.focusArea} (المستهدف: ${p.targetSemester})
- **الخطوات الإجرائية:**
${p.actionableSteps.map((step) => `  * ${step}`).join('\n')}
- **الأدوات الموصى بها:** ${p.recommendedTools.join('، ')}`
  )
  .join('\n\n')}
`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadTxt = () => {
    if (!report) return;
    const content = `تقرير تحليل اتجاهات التحصيل ونقاط القوة والضعف في الكفايات\n${report.reportTitle}\n${report.executiveSummary}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير-اتجاهات-التحصيل-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-800/40 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-linear-to-br from-amber-400 to-amber-600 rounded-2xl shadow-md text-slate-950">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black font-['Tajawal'] text-white">
                  تقرير التحليل الذكي ومسار الكفايات
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  AI Analytics
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-1">
                تشخيص عميق لنقاط القوة والضعف في توزيع الكفايات ومستويات التحصيل عبر الفصول الدراسية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {report && (
              <>
                <button
                  type="button"
                  onClick={handleCopyMarkdown}
                  className="px-3.5 py-2 bg-indigo-900/60 hover:bg-indigo-800 text-indigo-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-indigo-700/50 cursor-pointer"
                  title="نسخ التقرير بصيغة Markdown"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'تم النسخ' : 'نسخ التقرير'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3.5 py-2 bg-indigo-900/60 hover:bg-indigo-800 text-indigo-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-indigo-700/50 cursor-pointer"
                  title="طباعة التقرير"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">طباعة</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 bg-slate-50/50">
          {/* Quick Filter & Regenerate Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
                <span className="font-bold text-slate-800">نطاق الفحص الحالي:</span>
                <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 border border-slate-200 font-bold">
                  المبحث: {subjectFilter}
                </span>
                <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 border border-slate-200 font-bold">
                  الصف: {gradeFilter}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPromptExpanded(!isPromptExpanded)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>إضافة توجيهات للمعلم</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isPromptExpanded ? 'rotate-180' : ''}`} />
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => onRegenerate(customNote)}
                  className="px-4 py-1.5 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-xs font-black shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري التحليل...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>إعادة التحليل الذكي</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {isPromptExpanded && (
              <div className="pt-2 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="مثال: ركز على أداء الطلبة في مسائل التفكير العليا بالفصل الثاني، واقترح أنشطة علاجية..."
                  className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
                <BrainCircuit className="w-8 h-8 text-purple-600 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 font-['Tajawal']">
                  جاري تشخيص البيانات واستخراج اتجاهات التحصيل...
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md">
                  يقوم محرك الذكاء الاصطناعي بمقارنة معايير سلم التقدير وتوزيع الكفايات عبر الفصول الدراسية
                </p>
              </div>
            </div>
          ) : report ? (
            <div ref={reportRef} className="space-y-6">
              {/* Executive Summary Card */}
              <div className="bg-linear-to-br from-indigo-50 via-purple-50 to-white border-2 border-indigo-200/80 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-purple-400/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-indigo-600 text-white rounded-lg">
                        <Sparkles className="w-4 h-4" />
                      </span>
                      <h3 className="text-lg font-black font-['Tajawal'] text-slate-900">
                        {report.reportTitle}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-3xl">
                      {report.executiveSummary}
                    </p>
                  </div>

                  <div className="bg-white border border-indigo-200 rounded-2xl p-4 shrink-0 shadow-2xs text-center min-w-[160px]">
                    <span className="text-[11px] font-bold text-slate-500 block">
                      مؤشر الإتقان العام
                    </span>
                    <span className="text-xl font-black text-indigo-700 font-['Tajawal'] block mt-0.5">
                      {report.overallProficiencyIndex}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-1 border border-emerald-200">
                      <TrendingUp className="w-3 h-3" />
                      {report.trendAnalysis.direction}
                    </span>
                  </div>
                </div>

                {/* Key Metric Indicators */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-indigo-100">
                  <div className="bg-white/80 border border-slate-200/80 rounded-xl p-3">
                    <span className="text-[10px] font-bold text-slate-500">نسبة التميز (مستوى 4)</span>
                    <span className="text-base font-black text-emerald-700 block mt-0.5">
                      {report.keyMetrics.excellenceRate}
                    </span>
                  </div>
                  <div className="bg-white/80 border border-slate-200/80 rounded-xl p-3">
                    <span className="text-[10px] font-bold text-slate-500">نسبة الكفاءة (مستوى 3)</span>
                    <span className="text-base font-black text-blue-700 block mt-0.5">
                      {report.keyMetrics.proficiencyRate}
                    </span>
                  </div>
                  <div className="bg-white/80 border border-slate-200/80 rounded-xl p-3">
                    <span className="text-[10px] font-bold text-slate-500">حاجة الدعم (مستوى 1+2)</span>
                    <span className="text-base font-black text-amber-700 block mt-0.5">
                      {report.keyMetrics.growthSupportRate}
                    </span>
                  </div>
                  <div className="bg-white/80 border border-slate-200/80 rounded-xl p-3">
                    <span className="text-[10px] font-bold text-slate-500">توازن التقويم التكويني</span>
                    <span className="text-base font-black text-purple-700 block mt-0.5">
                      {report.keyMetrics.formativeToSummativeRatio}
                    </span>
                  </div>
                </div>
              </div>

              {/* Semester Progression Chart (if progression data exists) */}
              {semesterProgressionData.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-indigo-600" />
                        <h4 className="text-base font-bold font-['Tajawal'] text-slate-900">
                          منحنى تطور الكفايات ومستويات الإتقان عبر الفصول الدراسية
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        مقارنة بيانية لمعدل الإتقان (مستوى 3 و4) ومستويات المهارات عبر الفصول
                      </p>
                    </div>
                  </div>

                  <div className="h-64 sm:h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={semesterProgressionData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="semester" tick={{ fontSize: 11, fill: '#475569' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#475569' }} domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderColor: '#334155',
                            borderRadius: '0.75rem',
                            color: '#fff',
                            fontSize: '12px',
                            textAlign: 'right',
                            direction: 'rtl',
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                        <Bar dataKey="excellence" name="المستوى 4: متميز (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="proficiency" name="المستوى 3: كفء (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Line
                          type="monotone"
                          dataKey="criticalThinking"
                          name="التفكير وحل المشكلات"
                          stroke="#8b5cf6"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="conceptual"
                          name="الفهم المفاهيمي"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          strokeDasharray="4 4"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Strengths and Weaknesses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. Strengths */}
                <div className="bg-emerald-50/60 border-2 border-emerald-200/90 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-emerald-200">
                      <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-2xs">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-black font-['Tajawal'] text-emerald-950">
                          نقاط القوة في توزيع الكفايات
                        </h4>
                        <span className="text-[11px] text-emerald-700">
                          المكتسبات الراسخة والتمكن الأكاديمي
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3.5">
                      {report.competenciesStrengths.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-white/90 border border-emerald-200 rounded-2xl p-3.5 space-y-2 shadow-2xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-black shrink-0">
                              {toArabicDigits(idx + 1)}
                            </span>
                            <h5 className="text-xs font-bold text-slate-900 font-['Tajawal']">
                              {item.domain}
                            </h5>
                          </div>
                          <div className="text-[11px] text-slate-600 space-y-1 pr-7">
                            <p>
                              <strong className="text-slate-800">الدليل والشاهد: </strong>
                              {item.evidence}
                            </p>
                            <p className="text-emerald-700">
                              <strong className="text-emerald-800">الأثر التعليمي: </strong>
                              {item.impact}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Weaknesses & Gaps */}
                <div className="bg-amber-50/60 border-2 border-amber-200/90 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-amber-200">
                      <div className="p-2 bg-amber-600 text-white rounded-xl shadow-2xs">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-black font-['Tajawal'] text-amber-950">
                          نقاط الضعف والفجوات التعليمية
                        </h4>
                        <span className="text-[11px] text-amber-800">
                          مجالات بحاجة لتدخل وتطوير عبر الفصول
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3.5">
                      {report.competenciesWeaknesses.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-white/90 border border-amber-200 rounded-2xl p-3.5 space-y-2 shadow-2xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-black shrink-0">
                              {toArabicDigits(idx + 1)}
                            </span>
                            <h5 className="text-xs font-bold text-slate-900 font-['Tajawal']">
                              {item.domain}
                            </h5>
                          </div>
                          <div className="text-[11px] text-slate-600 space-y-1 pr-7">
                            <p>
                              <strong className="text-slate-800">الفجوة المرصودة: </strong>
                              {item.gap}
                            </p>
                            <p className="text-rose-700">
                              <strong className="text-rose-800">المخاطر التربوية: </strong>
                              {item.risk}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Semester Comparison Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <h4 className="text-base font-bold font-['Tajawal'] text-slate-900">
                    المقارنة التحليلية بين الفصول الدراسية
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <span className="text-xs font-black text-indigo-900 block mb-1.5 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-600" />
                      الفصل الدراسي الأول (البناء التأسيسي)
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {report.semesterComparison.firstSemesterOverview}
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <span className="text-xs font-black text-purple-900 block mb-1.5 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-600" />
                      الفصل الدراسي الثاني (التطبيق والتكامل)
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {report.semesterComparison.secondSemesterOverview}
                    </p>
                  </div>
                </div>

                <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <strong className="text-indigo-950 font-bold block mb-0.5">
                      أبرز الفروق الجوهرية:
                    </strong>
                    <span className="text-indigo-900 font-medium">
                      {report.semesterComparison.keyDifferences}
                    </span>
                  </div>
                  <div className="shrink-0 bg-white px-3 py-1.5 rounded-xl border border-indigo-200 text-indigo-800 text-[11px] font-bold">
                    💡 {report.semesterComparison.progressionInsight}
                  </div>
                </div>
              </div>

              {/* Pedagogical Action Plan */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Target className="w-5 h-5 text-indigo-600" />
                  <h4 className="text-base font-bold font-['Tajawal'] text-slate-900">
                    الخطة الإجرائية والتوصيات التربوية المقترحة
                  </h4>
                </div>

                <div className="space-y-4">
                  {report.pedagogicalActionPlan.map((plan, idx) => (
                    <div
                      key={idx}
                      className="bg-linear-to-r from-slate-50 via-white to-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-indigo-600 text-white rounded-md text-xs font-black">
                            مهمة {toArabicDigits(idx + 1)}
                          </span>
                          <h5 className="text-xs sm:text-sm font-black text-slate-900 font-['Tajawal']">
                            {plan.focusArea}
                          </h5>
                        </div>
                        <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-[10px] font-bold">
                          المستهدف: {plan.targetSemester}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-700 block">
                          الخطوات العملية القابلة للتنفيذ:
                        </span>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                          {plan.actionableSteps.map((step, sIdx) => (
                            <li key={sIdx} className="flex items-start gap-1.5 bg-white p-2 rounded-xl border border-slate-200/70">
                              <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {plan.recommendedTools && plan.recommendedTools.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                          <span className="font-bold text-slate-500">الأدوات المقترحة:</span>
                          {plan.recommendedTools.map((tool, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200 text-[10px] font-medium"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>تم التحليل وفق معايير سلالم التقدير ونواتج التعلم المعتمدة</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors border border-slate-300 cursor-pointer"
            >
              إغلاق
            </button>

            {report && (
              <button
                type="button"
                onClick={handleDownloadTxt}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تحميل التقرير (TXT)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
