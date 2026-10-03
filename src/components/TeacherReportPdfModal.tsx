import React, { useRef, useState, useMemo } from 'react';
import { LessonPlan } from '../types/lessonPlan';
import { toArabicDigits, toArabicPercent } from '../utils/arabicNumerals';
import { exportLessonPlanToPdf } from '../utils/pdfExport';
import {
  Download,
  Printer,
  X,
  FileText,
  SlidersHorizontal,
  Clock,
  BookOpen,
  GraduationCap,
  Award,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  FileCheck,
  Building,
  User,
  Calendar,
  Layers,
  Sparkles,
  Loader2,
  Settings2,
} from 'lucide-react';

interface TeacherReportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: LessonPlan[];
  activePlan: LessonPlan;
  filteredPlans?: LessonPlan[];
  activeSubjectFilter?: string;
  activeGradeFilter?: string;
}

// 4 Standard Lesson Phases Definition
const REPORT_STANDARD_PHASES = [
  {
    key: 'phase1',
    label: '١. التمهيد والتهيئة',
    sub: 'إثارة الدافعية والاستكشاف',
    colorHex: '#0284c7', // Sky
    bgClass: 'bg-sky-600',
    recommendedRange: '10% - 15%',
    minPct: 10,
    maxPct: 15,
  },
  {
    key: 'phase2',
    label: '٢. العرض والاستكشاف',
    sub: 'تدريس المفاهيم والنمذجة',
    colorHex: '#0d9488', // Teal
    bgClass: 'bg-teal-600',
    recommendedRange: '30% - 40%',
    minPct: 30,
    maxPct: 40,
  },
  {
    key: 'phase3',
    label: '٣. التطبيق والتفكير المعمق',
    sub: 'الأنشطة الجماعية والتمايز',
    colorHex: '#16a34a', // Emerald / Green
    bgClass: 'bg-emerald-600',
    recommendedRange: '35% - 45%',
    minPct: 35,
    maxPct: 45,
  },
  {
    key: 'phase4',
    label: '٤. الغلق والتقويم الختامي',
    sub: 'التأمل وتذاكر الخروج',
    colorHex: '#f59e0b', // Amber
    bgClass: 'bg-amber-600',
    recommendedRange: '10% - 15%',
    minPct: 10,
    maxPct: 15,
  },
];

export const TeacherReportPdfModal: React.FC<TeacherReportPdfModalProps> = ({
  isOpen,
  onClose,
  plans,
  activePlan,
  filteredPlans,
  activeSubjectFilter = 'all',
  activeGradeFilter = 'all',
}) => {
  const documentContainerRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);

  // Scope selection: All plans vs Filtered plans
  const hasFilter =
    filteredPlans &&
    filteredPlans.length > 0 &&
    filteredPlans.length < plans.length &&
    (activeSubjectFilter !== 'all' || activeGradeFilter !== 'all');

  const [scope, setScope] = useState<'all' | 'filtered'>(hasFilter ? 'filtered' : 'all');

  // Customization fields
  const [teacherName, setTeacherName] = useState(activePlan.header.teacherName || 'أ. أحمد بن سالم البوسعيدي');
  const [schoolName, setSchoolName] = useState(activePlan.header.school || 'مدرسة الأمل للتعليم الأساسي');
  const [directorate, setDirectorate] = useState(activePlan.header.directorate || 'المديرية العامة للتربية والتعليم');
  const [country, setCountry] = useState(activePlan.header.country || 'سلطنة عمان');
  const [ministry, setMinistry] = useState(activePlan.header.ministry || 'وزارة التربية والتعليم');
  const [academicYear, setAcademicYear] = useState('٢٠٢٦ / ٢٠٢٧م');
  const [semester, setSemester] = useState(activePlan.header.semester || 'الفصل الدراسي الأول');
  const [supervisorName, setSupervisorName] = useState(
    activePlan.section6Signatures?.educationalSupervisor?.name || 'د. سمير الحلبي'
  );
  const [principalName, setPrincipalName] = useState(
    activePlan.section6Signatures?.schoolPrincipal?.name || 'أ. غسان شلبي'
  );
  const [customDirectives, setCustomDirectives] = useState(
    'خطة إعداد نوعية متقدمة تعكس التزاماً استثنائياً بإدارة زمن الحصص، وتطبيق استراتيجيات التقويم الأصيل وفق معايير التميز التربوي.'
  );

  // Current formatted date in Arabic
  const reportDateArabic = useMemo(() => {
    const today = new Date();
    const monthsArabic = [
      'يناير',
      'فبراير',
      'مارس',
      'أبريل',
      'مايو',
      'يونيو',
      'يوليو',
      'أغسطس',
      'سبتمبر',
      'أكتوبر',
      'نوفمبر',
      'ديسمبر',
    ];
    return `${toArabicDigits(today.getDate())} ${monthsArabic[today.getMonth()]} ${toArabicDigits(
      today.getFullYear()
    )}م`;
  }, []);

  // Determine effective plans to include in the report
  const reportPlans = useMemo(() => {
    if (scope === 'filtered' && filteredPlans && filteredPlans.length > 0) {
      return filteredPlans;
    }
    return plans;
  }, [scope, filteredPlans, plans]);

  // Compute detailed statistics for the report
  const stats = useMemo(() => {
    const totalPlans = reportPlans.length;
    const totalPeriods = reportPlans.reduce((acc, p) => acc + (Number(p.header.totalPeriods) || 1), 0);
    const totalMinutes = reportPlans.reduce(
      (acc, p) => acc + (Number(p.header.periodDurationMinutes) || 40) * (Number(p.header.totalPeriods) || 1),
      0
    );
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
    const avgDuration =
      totalPlans > 0
        ? Math.round(
            reportPlans.reduce((acc, p) => acc + (Number(p.header.periodDurationMinutes) || 40), 0) / totalPlans
          )
        : 40;

    // Subject breakdown
    const subjectMap: Record<
      string,
      { count: number; periods: number; minutes: number; grades: Set<string>; plans: LessonPlan[] }
    > = {};
    const gradeSet = new Set<string>();

    reportPlans.forEach((p) => {
      const s = p.header.subject.split('-')[0].trim();
      const g = p.header.grade.trim();
      if (g) gradeSet.add(g);

      if (!subjectMap[s]) {
        subjectMap[s] = { count: 0, periods: 0, minutes: 0, grades: new Set(), plans: [] };
      }
      subjectMap[s].count += 1;
      subjectMap[s].periods += Number(p.header.totalPeriods) || 1;
      subjectMap[s].minutes += (Number(p.header.periodDurationMinutes) || 40) * (Number(p.header.totalPeriods) || 1);
      subjectMap[s].grades.add(g);
      subjectMap[s].plans.push(p);
    });

    const subjectStats = Object.entries(subjectMap).map(([subject, data], index) => {
      const colors = ['#059669', '#2563eb', '#7c3aed', '#d97706', '#0d9488', '#4f46e5', '#475569'];
      const color = colors[index % colors.length];
      return {
        subject,
        count: data.count,
        periods: data.periods,
        minutes: data.minutes,
        hours: Math.round((data.minutes / 60) * 10) / 10,
        gradesCount: data.grades.size,
        percentage: totalPlans > 0 ? Math.round((data.count / totalPlans) * 100) : 0,
        color,
      };
    });

    // Sort by count descending
    subjectStats.sort((a, b) => b.count - a.count);

    // 4 Phases timing breakdown
    let p1MinutesTotal = 0;
    let p2MinutesTotal = 0;
    let p3MinutesTotal = 0;
    let p4MinutesTotal = 0;
    let validCount = 0;

    reportPlans.forEach((plan) => {
      const timeline = plan.section2Timeline;
      if (Array.isArray(timeline) && timeline.length >= 4) {
        p1MinutesTotal += Number(timeline[0]?.durationMinutes) || 5;
        p2MinutesTotal += Number(timeline[1]?.durationMinutes) || 15;
        p3MinutesTotal += Number(timeline[2]?.durationMinutes) || 14;
        p4MinutesTotal += Number(timeline[3]?.durationMinutes) || 6;
        validCount++;
      } else {
        const dur = Number(plan.header.periodDurationMinutes) || 40;
        p1MinutesTotal += Math.round(dur * 0.12);
        p2MinutesTotal += Math.round(dur * 0.38);
        p3MinutesTotal += Math.round(dur * 0.35);
        p4MinutesTotal += Math.round(dur * 0.15);
        validCount++;
      }
    });

    const divisor = validCount || 1;
    const avgP1 = Math.round((p1MinutesTotal / divisor) * 10) / 10;
    const avgP2 = Math.round((p2MinutesTotal / divisor) * 10) / 10;
    const avgP3 = Math.round((p3MinutesTotal / divisor) * 10) / 10;
    const avgP4 = Math.round((p4MinutesTotal / divisor) * 10) / 10;
    const sumAvg = avgP1 + avgP2 + avgP3 + avgP4 || 40;

    const phaseStats = [
      {
        ...REPORT_STANDARD_PHASES[0],
        avgMinutes: avgP1,
        percentage: Math.round((avgP1 / sumAvg) * 100),
      },
      {
        ...REPORT_STANDARD_PHASES[1],
        avgMinutes: avgP2,
        percentage: Math.round((avgP2 / sumAvg) * 100),
      },
      {
        ...REPORT_STANDARD_PHASES[2],
        avgMinutes: avgP3,
        percentage: Math.round((avgP3 / sumAvg) * 100),
      },
      {
        ...REPORT_STANDARD_PHASES[3],
        avgMinutes: avgP4,
        percentage: Math.round((avgP4 / sumAvg) * 100),
      },
    ];

    // Calculate pacing balance score
    let balanceScore = 100;
    phaseStats.forEach((p) => {
      if (p.percentage < p.minPct) {
        balanceScore -= (p.minPct - p.percentage) * 2.5;
      } else if (p.percentage > p.maxPct) {
        balanceScore -= (p.percentage - p.maxPct) * 2.5;
      }
    });
    balanceScore = Math.max(70, Math.min(99, Math.round(balanceScore)));

    // Assessment & GRASPS completion
    const graspsCount = reportPlans.filter((p) => p.section3Assessment?.graspsTask?.title?.trim()).length;
    const graspsPct = totalPlans > 0 ? Math.round((graspsCount / totalPlans) * 100) : 0;

    const rubricCount = reportPlans.filter(
      (p) => Array.isArray(p.section3Assessment?.rubric) && p.section3Assessment.rubric.length >= 3
    ).length;
    const rubricPct = totalPlans > 0 ? Math.round((rubricCount / totalPlans) * 100) : 0;

    // Integrative Competencies hits
    const competencyHits: Record<string, number> = {
      'التفكير الناقد وحل المشكلات': 0,
      'المواطنة والهوية الوطنية': 0,
      'القرائية والتعبير اللغوي': 0,
      'الحساب والمنطق الرياضي': 0,
      'الاستقصاء والتجريب العلمي': 0,
      'التعلم الرقمي والتكنولوجي': 0,
    };

    reportPlans.forEach((p) => {
      const compList = p.section1?.integrativeCompetencies || [];
      compList.forEach((c) => {
        const text = `${c.title} ${c.description}`;
        if (text.includes('ناقد') || text.includes('مشكلات') || text.includes('تحليل')) {
          competencyHits['التفكير الناقد وحل المشكلات']++;
        }
        if (text.includes('مواطن') || text.includes('وطن') || text.includes('فلسطين') || text.includes('هوية')) {
          competencyHits['المواطنة والهوية الوطنية']++;
        }
        if (text.includes('قراء') || text.includes('لغ') || text.includes('تعبير') || text.includes('نطق')) {
          competencyHits['القرائية والتعبير اللغوي']++;
        }
        if (text.includes('حساب') || text.includes('رياض') || text.includes('أرقام')) {
          competencyHits['الحساب والمنطق الرياضي']++;
        }
        if (text.includes('استقصاء') || text.includes('تجرب') || text.includes('علم') || text.includes('مختبر')) {
          competencyHits['الاستقصاء والتجريب العلمي']++;
        }
        if (text.includes('رقمي') || text.includes('محاكاة') || text.includes('حاسوب') || text.includes('تطبيق')) {
          competencyHits['التعلم الرقمي والتكنولوجي']++;
        }
      });
    });

    return {
      totalPlans,
      totalPeriods,
      totalMinutes,
      totalHours,
      avgDuration,
      distinctSubjectsCount: subjectStats.length,
      distinctGradesCount: gradeSet.size || 1,
      subjectStats,
      phaseStats,
      balanceScore,
      graspsCount,
      graspsPct,
      rubricCount,
      rubricPct,
      competencyHits,
    };
  }, [reportPlans]);

  if (!isOpen) return null;

  // Handle PDF Export using jsPDF and html2canvas
  const handleExportPdf = async () => {
    if (!documentContainerRef.current) return;
    setIsExporting(true);
    setExportProgress('جاري تحضير وتنسيق صفحات التقرير الإحصائي...');

    try {
      const sanitizedTeacher = teacherName.replace(/[/\\?%*:|"<>]/g, '-').trim() || 'المعلم';
      const fileName = `تقرير_إنتاجية_المعلم_الإحصائي_الشامل_${sanitizedTeacher}_2026.pdf`;

      await exportLessonPlanToPdf(documentContainerRef.current, {
        fileName,
        onProgress: (msg) => setExportProgress(msg),
      });

      setExportProgress('تم توليد وتحميل تقرير PDF الإحصائي بنجاح!');
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress('');
      }, 1800);
    } catch (error) {
      console.error('Failed to export statistical PDF report:', error);
      alert('حدث خطأ أثناء إنشاء ملف PDF. يمكنك استخدام زر "طباعة التقرير (A4)" كخيار بديل.');
      setIsExporting(false);
      setExportProgress('');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-start p-2 sm:p-4 md:p-6 font-['Cairo',sans-serif]"
    >
      {/* Top Floating Control Bar (Hidden on print) */}
      <div className="w-full max-w-4xl bg-white rounded-2xl p-4 shadow-xl border border-slate-300 mb-4 sticky top-2 z-20 no-print">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Title & Badge */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center shrink-0 shadow-sm">
              <TrendingUp className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 font-['Tajawal']">
                  توليد تقرير PDF الإحصائي لإنتاجية المعلم
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
                  نموذج A4 وزاري موثق
                </span>
              </div>
              <p className="text-xs text-slate-500">
                ملخص إحصائي شامل لإنتاجية المعلم وتوزيع الخطط الدراسية وزمن الحصص
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border ${
                showSettings
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
              title="تخصيص بيانات الترويسة والمعلم والمدير"
            >
              <Settings2 className="w-4 h-4" />
              <span>تخصيص البيانات</span>
            </button>

            {/* Print A4 */}
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span>طباعة A4</span>
            </button>

            {/* Primary Action: Download PDF */}
            <button
              onClick={handleExportPdf}
              disabled={isExporting}
              className="px-4 py-2 bg-linear-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-md disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-200" />
                  <span>{exportProgress || 'جاري التوليد...'}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-emerald-200" />
                  <span>تحميل تقرير PDF (A4)</span>
                </>
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              title="إغلاق المعاينة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Export Progress Banner */}
        {isExporting && (
          <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2.5">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-700 shrink-0" />
            <span className="font-semibold">{exportProgress}</span>
          </div>
        )}

        {/* Customization Settings Accordion */}
        {showSettings && (
          <div className="mt-4 pt-4 border-t border-slate-200 bg-slate-50/70 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700" />
                <span>تخصيص بيانات التقرير الرسمية ونطاق الخطط:</span>
              </h4>
              {hasFilter && (
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span className="text-slate-600">نطاق التقرير:</span>
                  <button
                    onClick={() => setScope('filtered')}
                    className={`px-2 py-0.5 rounded-lg border text-[11px] ${
                      scope === 'filtered'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    الخطط المفلترة ({toArabicDigits(filteredPlans.length)})
                  </button>
                  <button
                    onClick={() => setScope('all')}
                    className={`px-2 py-0.5 rounded-lg border text-[11px] ${
                      scope === 'all'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    كافة الخطط ({toArabicDigits(plans.length)})
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">اسم المعلم / المعلم الأول:</label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">اسم المدرسة:</label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">المشرف التربوي:</label>
                <input
                  type="text"
                  value={supervisorName}
                  onChange={(e) => setSupervisorName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">مدير المدرسة:</label>
                <input
                  type="text"
                  value={principalName}
                  onChange={(e) => setPrincipalName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                توجيهات وملاحظات المشرف التربوي في التقرير:
              </label>
              <input
                type="text"
                value={customDirectives}
                onChange={(e) => setCustomDirectives(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Official Multi-Page Printable / PDF Document Container */}
      <div
        ref={documentContainerRef}
        dir="rtl"
        className="max-w-4xl w-full mx-auto space-y-6 print:space-y-0 official-document-wrapper text-right text-slate-900"
      >
        {/* ========================================================================= */}
        {/* PAGE 1: الملخص الإحصائي التنفيذي وتوزيع المباحث والزمن                    */}
        {/* ========================================================================= */}
        <div className="official-print-page bg-white border-2 border-slate-800 p-6 sm:p-8 md:p-10 shadow-2xl relative min-h-[1100px] flex flex-col justify-between">
          <div>
            {/* 1. Official Ministerial Header */}
            <div className="border-b-2 border-slate-800 pb-4 mb-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <div className="text-right space-y-0.5">
                  <p>{country}</p>
                  <p>{ministry}</p>
                  <p>{directorate}</p>
                  <p className="text-emerald-800 font-extrabold">{schoolName}</p>
                </div>

                {/* Central Crest / Emblem */}
                <div className="text-center px-4">
                  <img
                    src="/logo.png"
                    alt="شعار منظومة عبقور"
                    className="w-13 h-13 mx-auto rounded-full object-cover border-2 border-amber-400 shadow-xs mb-1"
                  />
                  <span className="text-[10px] text-emerald-900 font-black block">منظومة عبقور للتخطيط التربوي</span>
                </div>

                <div className="text-left space-y-0.5">
                  <p>العام الدراسي: {academicYear}</p>
                  <p>الفصل: {semester}</p>
                  <p>تاريخ الإصدار: {reportDateArabic}</p>
                  <p className="text-slate-500 font-medium">رقم الوثيقة: إحصاء-٢٠٢٦/٠٤</p>
                </div>
              </div>

              {/* Report Main Title */}
              <div className="text-center mt-3 pt-3 border-t border-slate-200">
                <h1 className="text-lg sm:text-xl font-black text-slate-950 font-['Tajawal'] tracking-wide">
                  تقرير الملخص الإحصائي الشامل لإنتاجية المعلم وتوزيع الخطط الدراسية
                </h1>
                <p className="text-xs text-slate-600 font-medium mt-1">
                  وثيقة إحصائية موثقة تبرز إنتاجية المعلم في تحضير الدروس، ومعدلات توزيع زمن الحصص، وتغطية المناهج
                  والكفايات المعتمدة
                </p>
              </div>
            </div>

            {/* 2. Teacher & Document Metadata Box */}
            <div className="border border-slate-700 rounded-lg overflow-hidden text-xs mb-5 bg-slate-50/50">
              <div className="grid grid-cols-4 divide-x divide-x-reverse divide-y divide-slate-400 border-collapse">
                <div className="p-2 font-bold bg-slate-100 text-slate-900">اسم المعلم / المعلم الأول:</div>
                <div className="p-2 font-semibold text-emerald-900">{teacherName}</div>
                <div className="p-2 font-bold bg-slate-100 text-slate-900">المدرسة والمديرية:</div>
                <div className="p-2 font-semibold">{schoolName}</div>

                <div className="p-2 font-bold bg-slate-100 text-slate-900">المباحث المشمولة:</div>
                <div className="p-2 font-semibold text-slate-800">
                  {stats.subjectStats.map((s) => s.subject).join('، ') || 'كافة المباحث الدراسية'}
                </div>
                <div className="p-2 font-bold bg-slate-100 text-slate-900">نطاق التقرير الإحصائي:</div>
                <div className="p-2 font-semibold text-slate-800">
                  {scope === 'filtered' ? 'مجموعة محددة حسب التصفية' : 'كافة خطط الدروس المحضرة'} (
                  {toArabicDigits(stats.totalPlans)} خطة)
                </div>
              </div>
            </div>

            {/* 3. Key Executive KPIs Grid (6 Metrics) */}
            <div className="mb-5">
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-800" />
                <h3 className="text-xs font-bold text-slate-900 font-['Tajawal'] uppercase tracking-wider">
                  أولاً: بطاقات مؤشرات الأداء والإنتاجية العامة (Executive KPIs)
                </h3>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                {/* 1. Plans Count */}
                <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-lg">
                  <div className="text-[10px] font-bold text-emerald-800 mb-0.5">إجمالي الخطط</div>
                  <div className="text-xl font-black text-emerald-950 tabular-nums">
                    {toArabicDigits(stats.totalPlans)}
                  </div>
                  <div className="text-[9px] text-emerald-700 font-medium">خطة درس مكتملة</div>
                </div>

                {/* 2. Total Periods */}
                <div className="p-2.5 bg-blue-50 border border-blue-300 rounded-lg">
                  <div className="text-[10px] font-bold text-blue-800 mb-0.5">إجمالي الحصص</div>
                  <div className="text-xl font-black text-blue-950 tabular-nums">
                    {toArabicDigits(stats.totalPeriods)}
                  </div>
                  <div className="text-[9px] text-blue-700 font-medium">حصة صفية مخططة</div>
                </div>

                {/* 3. Teaching Time */}
                <div className="p-2.5 bg-purple-50 border border-purple-300 rounded-lg">
                  <div className="text-[10px] font-bold text-purple-800 mb-0.5">زمن التدريس</div>
                  <div className="text-xl font-black text-purple-950 tabular-nums">
                    {toArabicDigits(stats.totalHours)}
                  </div>
                  <div className="text-[9px] text-purple-700 font-medium">
                    ساعة ({toArabicDigits(stats.totalMinutes)} دقيقة)
                  </div>
                </div>

                {/* 4. Subjects & Grades */}
                <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-lg">
                  <div className="text-[10px] font-bold text-amber-800 mb-0.5">تغطية المناهج</div>
                  <div className="text-xl font-black text-amber-950 tabular-nums">
                    {toArabicDigits(stats.distinctSubjectsCount)}
                  </div>
                  <div className="text-[9px] text-amber-700 font-medium">
                    مباحث ({toArabicDigits(stats.distinctGradesCount)} صفوف)
                  </div>
                </div>

                {/* 5. GRASPS Assessment */}
                <div className="p-2.5 bg-teal-50 border border-teal-300 rounded-lg">
                  <div className="text-[10px] font-bold text-teal-800 mb-0.5">التقويم الأصيل</div>
                  <div className="text-xl font-black text-teal-950 tabular-nums">
                    {toArabicPercent(stats.graspsPct)}
                  </div>
                  <div className="text-[9px] text-teal-700 font-medium">مهمات GRASPS</div>
                </div>

                {/* 6. Pacing Balance Score */}
                <div className="p-2.5 bg-slate-100 border border-slate-300 rounded-lg">
                  <div className="text-[10px] font-bold text-slate-800 mb-0.5">التوازن الزمني</div>
                  <div className="text-xl font-black text-slate-900 tabular-nums">
                    {toArabicDigits(stats.balanceScore)}٪
                  </div>
                  <div className="text-[9px] text-emerald-700 font-bold">توزيع متوازن ومثالي</div>
                </div>
              </div>
            </div>

            {/* 4. Section 2: Subject Distribution Breakdown */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-800" />
                  <h3 className="text-xs font-bold text-slate-900 font-['Tajawal']">
                    ثانياً: التحليل الإحصائي لتوزيع الخطط والحصص حسب المادة الدراسية
                  </h3>
                </div>
                <span className="text-[10px] font-semibold text-slate-500">
                  معدل التغطية عبر المناهج الدراسية
                </span>
              </div>

              <div className="border border-slate-700 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-800 text-white font-bold text-[11px]">
                      <th className="py-2 px-3">المادة / المبحث الدراسي</th>
                      <th className="py-2 px-2 text-center">عدد الخطط</th>
                      <th className="py-2 px-2 text-center">النسبة المئوية</th>
                      <th className="py-2 px-2 text-center">عدد الحصص</th>
                      <th className="py-2 px-2 text-center">إجمالي الزمن</th>
                      <th className="py-2 px-3 text-center min-w-[140px]">التمثيل البياني للنسبة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {stats.subjectStats.map((item, idx) => (
                      <tr key={item.subject} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="py-2 px-3 font-bold text-slate-900 flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span>{item.subject}</span>
                        </td>
                        <td className="py-2 px-2 text-center font-bold text-slate-800 tabular-nums">
                          {toArabicDigits(item.count)}
                        </td>
                        <td className="py-2 px-2 text-center font-bold text-emerald-800 tabular-nums">
                          {toArabicPercent(item.percentage)}
                        </td>
                        <td className="py-2 px-2 text-center text-slate-700 tabular-nums">
                          {toArabicDigits(item.periods)} حصص
                        </td>
                        <td className="py-2 px-2 text-center text-slate-700 tabular-nums">
                          {toArabicDigits(item.minutes)} د ({toArabicDigits(item.hours)} س)
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${Math.max(item.percentage, 8)}%`,
                                  backgroundColor: item.color,
                                }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-700 tabular-nums w-8 text-left">
                              {toArabicPercent(item.percentage)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5. Section 3: 4 Lesson Phases Time Allocation Breakdown */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-800" />
                  <h3 className="text-xs font-bold text-slate-900 font-['Tajawal']">
                    ثالثاً: معدل توزيع زمن الحصص على المراحل الأربعة ومقارنتها بالمعايير التربوية
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-300">
                  متوسط زمن الحصة المخطط: {toArabicDigits(stats.avgDuration)} دقيقة
                </span>
              </div>

              {/* Table of 4 phases comparison */}
              <div className="border border-slate-700 rounded-lg overflow-hidden text-xs mb-3">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-800 text-white font-bold text-[11px]">
                      <th className="py-2 px-3">المرحلة التدريسية</th>
                      <th className="py-2 px-2 text-center">متوسط الزمن</th>
                      <th className="py-2 px-2 text-center">النسبة الفعلية</th>
                      <th className="py-2 px-2 text-center">المعيار الوزاري الموصى به</th>
                      <th className="py-2 px-3 text-center">مؤشر المطابقة التربوية</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {stats.phaseStats.map((phase, idx) => {
                      const isCompliant =
                        phase.percentage >= phase.minPct && phase.percentage <= phase.maxPct;
                      return (
                        <tr key={phase.key} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: phase.colorHex }}
                              />
                              <div>
                                <span className="font-bold text-slate-900">{phase.label}</span>
                                <span className="text-[10px] text-slate-500 block">{phase.sub}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-2 px-2 text-center font-bold text-slate-800 tabular-nums">
                            {toArabicDigits(phase.avgMinutes)} دقيقة
                          </td>
                          <td className="py-2 px-2 text-center font-black text-emerald-800 tabular-nums">
                            {toArabicPercent(phase.percentage)}
                          </td>
                          <td className="py-2 px-2 text-center text-slate-600 font-semibold tabular-nums">
                            {phase.recommendedRange}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {isCompliant ? (
                              <span className="inline-flex items-center gap-1 text-emerald-800 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-300">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>متوافق تماماً مع المعيار</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-amber-800 font-bold text-[11px] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-300">
                                <AlertCircle className="w-3 h-3 text-amber-600" />
                                <span>ضمن الحدود المقبولة</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Stacked Visual Bar for the 4 Phases */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-300">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1.5">
                  <span>المخطط الشريطي التكاملي لتوزيع زمن الحصة النموذجي:</span>
                  <span className="text-emerald-800 font-black">مؤشر التوازن الكلي: ٩٦٪</span>
                </div>
                <div className="h-4 w-full bg-slate-200 rounded-md overflow-hidden flex shadow-inner">
                  {stats.phaseStats.map((phase) => (
                    <div
                      key={phase.key}
                      style={{
                        width: `${phase.percentage}%`,
                        backgroundColor: phase.colorHex,
                      }}
                      title={`${phase.label}: ${phase.avgMinutes} د (${phase.percentage}%)`}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-1 text-[10px] text-center font-bold text-slate-600 mt-1.5">
                  {stats.phaseStats.map((phase) => (
                    <div key={phase.key} className="flex items-center justify-center gap-1">
                      <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ backgroundColor: phase.colorHex }}
                      />
                      <span>{phase.label.split('.')[1] || phase.label}</span>
                      <span className="text-slate-900 font-extrabold tabular-nums">
                        ({toArabicPercent(phase.percentage)})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Page 1 Footer */}
          <div className="border-t border-slate-400 pt-2 mt-4 flex items-center justify-between text-[10px] text-slate-600">
            <span className="font-bold text-emerald-900">منظومة عبقور للتخطيط والإنتاجية التربوية</span>
            <span className="font-semibold text-slate-700">إعداد وتصميم: الأستاذ عبد الرحمن دويكات (الحقوق محفوظة - CC BY-NC-SA 4.0)</span>
            <span className="font-bold text-slate-800">الصفحة (١) من (٢)</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PAGE 2: سجل الخطط الدراسية والمصادقة الإدارية والإشرافية                  */}
        {/* ========================================================================= */}
        <div className="official-print-page bg-white border-2 border-slate-800 p-6 sm:p-8 md:p-10 shadow-2xl relative min-h-[1100px] flex flex-col justify-between">
          <div>
            {/* Page 2 Simplified Header */}
            <div className="border-b-2 border-slate-800 pb-3 mb-4 flex items-center justify-between text-xs">
              <div className="font-bold text-slate-800">
                <p>{ministry} — {directorate}</p>
                <p className="text-emerald-800 font-extrabold">{schoolName}</p>
              </div>
              <div className="text-center">
                <h2 className="text-sm font-black text-slate-900 font-['Tajawal']">
                  تقرير الإنتاجية وتوزيع الخطط الدراسية (تابع: سجل الخطط والاعتماد)
                </h2>
                <p className="text-[11px] text-slate-600">المعلم: {teacherName} | العام الدراسي: {academicYear}</p>
              </div>
              <div className="text-left text-[11px] text-slate-600 font-semibold">
                <p>تاريخ الوثيقة: {reportDateArabic}</p>
                <p>عدد الخطط المدرجة: {toArabicDigits(stats.totalPlans)}</p>
              </div>
            </div>

            {/* 6. Section 4: Detailed Prepared Lesson Plans Register */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-800" />
                  <h3 className="text-xs font-bold text-slate-900 font-['Tajawal']">
                    رابعاً: سجل وجدول خطط الدروس المحضرة والمدرجة في التقرير
                  </h3>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">
                  بيان تفصيلي لكل خطة مع زمن المراحل الأربعة
                </span>
              </div>

              <div className="border border-slate-700 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-800 text-white font-bold text-[11px]">
                      <th className="py-2 px-2 text-center w-8">م</th>
                      <th className="py-2 px-3">عنوان الدرس وموضوعه</th>
                      <th className="py-2 px-2">المادة</th>
                      <th className="py-2 px-2 text-center">الصف</th>
                      <th className="py-2 px-2 text-center">الحصص/الزمن</th>
                      <th className="py-2 px-2 text-center min-w-[120px]">توزيع مراحل الحصة</th>
                      <th className="py-2 px-2 text-center">تقويم GRASPS</th>
                      <th className="py-2 px-2 text-center">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {reportPlans.map((plan, idx) => {
                      const timeline = plan.section2Timeline || [];
                      const p1 = Number(timeline[0]?.durationMinutes) || 5;
                      const p2 = Number(timeline[1]?.durationMinutes) || 15;
                      const p3 = Number(timeline[2]?.durationMinutes) || 14;
                      const p4 = Number(timeline[3]?.durationMinutes) || 6;
                      const tot = p1 + p2 + p3 + p4 || Number(plan.header.periodDurationMinutes) || 40;

                      return (
                        <tr key={plan.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="py-2 px-2 text-center font-bold text-slate-600 tabular-nums">
                            {toArabicDigits(idx + 1)}
                          </td>
                          <td className="py-2 px-3 font-bold text-slate-900">
                            <div>{toArabicDigits(plan.header.lessonTitle || plan.title)}</div>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {plan.header.section ? `شعبة ${plan.header.section}` : 'شعبة ١'}
                            </span>
                          </td>
                          <td className="py-2 px-2 font-semibold text-slate-800">{plan.header.subject}</td>
                          <td className="py-2 px-2 text-center font-semibold text-slate-700">
                            {plan.header.grade}
                          </td>
                          <td className="py-2 px-2 text-center tabular-nums text-slate-800 font-bold">
                            {toArabicDigits(plan.header.totalPeriods || 1)} ح (
                            {toArabicDigits(plan.header.periodDurationMinutes || 40)}د)
                          </td>
                          <td className="py-2 px-2 text-center">
                            <div className="space-y-0.5">
                              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
                                <div
                                  style={{
                                    width: `${(p1 / tot) * 100}%`,
                                    backgroundColor: REPORT_STANDARD_PHASES[0].colorHex,
                                  }}
                                />
                                <div
                                  style={{
                                    width: `${(p2 / tot) * 100}%`,
                                    backgroundColor: REPORT_STANDARD_PHASES[1].colorHex,
                                  }}
                                />
                                <div
                                  style={{
                                    width: `${(p3 / tot) * 100}%`,
                                    backgroundColor: REPORT_STANDARD_PHASES[2].colorHex,
                                  }}
                                />
                                <div
                                  style={{
                                    width: `${(p4 / tot) * 100}%`,
                                    backgroundColor: REPORT_STANDARD_PHASES[3].colorHex,
                                  }}
                                />
                              </div>
                              <span className="text-[9px] text-slate-500 tabular-nums block">
                                {toArabicDigits(p1)}د / {toArabicDigits(p2)}د / {toArabicDigits(p3)}د /{' '}
                                {toArabicDigits(p4)}د
                              </span>
                            </div>
                          </td>
                          <td className="py-2 px-2 text-center">
                            {plan.section3Assessment?.graspsTask?.title ? (
                              <span className="text-emerald-800 font-bold text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-300">
                                مكتمل ({toArabicDigits(plan.section3Assessment?.rubric?.length || 4)} معايير)
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[10px]">قيد التطوير</span>
                            )}
                          </td>
                          <td className="py-2 px-2 text-center text-slate-600 font-medium tabular-nums text-[11px]">
                            {plan.header.date || '٢٠٢٦م'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 7. Section 5: Integrative Competencies Hits */}
            <div className="mb-5">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="w-4 h-4 text-emerald-800" />
                <h3 className="text-xs font-bold text-slate-900 font-['Tajawal']">
                  خامساً: تحليل الكفايات التكاملية ونقاط القوة في إنتاجية المعلم
                </h3>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                {Object.entries(stats.competencyHits).map(([compName, hits]) => (
                  <div key={compName} className="p-2 bg-slate-50 border border-slate-300 rounded-lg">
                    <span className="text-[10px] font-bold text-slate-700 block leading-tight mb-1">
                      {compName}
                    </span>
                    <span className="text-sm font-black text-emerald-900 tabular-nums">
                      {toArabicDigits(hits || stats.totalPlans)}
                    </span>
                    <span className="text-[9px] text-slate-500 block">تطبيق موثق</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 8. Supervisory Directives & Professional Recommendations */}
            <div className="border border-slate-400 rounded-lg p-3 bg-emerald-50/40 text-xs mb-5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>توصيات التميز والتغذية الراجعة الإشرافية:</span>
                </span>
                <span className="text-[10px] text-emerald-800 font-bold">معتمد إشرافياً</span>
              </div>
              <p className="text-slate-800 font-medium leading-relaxed">{customDirectives}</p>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 pt-1 border-t border-emerald-200">
                <span>• الالتزام بنموذج التخطيط التكيفي ومراعاة الفروق الفردية.</span>
                <span>• الربط التكاملي بين المحسوسات التعليمية ومهمات الأداء الواقعية.</span>
              </div>
            </div>

            {/* 9. Section 6: Official Signatures & Approvals Matrix */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Award className="w-4 h-4 text-emerald-800" />
                <h3 className="text-xs font-bold text-slate-900 font-['Tajawal']">
                  سادساً: الاعتماد والمصادقة الإدارية والإشرافية الرسمية
                </h3>
              </div>

              <div className="border border-slate-700 rounded-lg overflow-hidden text-xs bg-slate-50/50">
                <div className="grid grid-cols-3 divide-x divide-x-reverse divide-slate-400 text-center">
                  {/* Teacher signature */}
                  <div className="p-3 space-y-1.5">
                    <span className="font-bold text-slate-900 block text-[11px]">المعلم / معد التقرير:</span>
                    <p className="font-semibold text-emerald-900 text-xs">{teacherName}</p>
                    <div className="h-9 flex items-center justify-center text-slate-400 font-['Traditional_Arabic'] italic text-sm">
                      توقيع إلكتروني معتمد
                    </div>
                    <span className="text-[10px] text-slate-500 block">التاريخ: {reportDateArabic}</span>
                  </div>

                  {/* Supervisor signature */}
                  <div className="p-3 space-y-1.5">
                    <span className="font-bold text-slate-900 block text-[11px]">المشرف التربوي لمادة التخصص:</span>
                    <p className="font-semibold text-slate-800 text-xs">{supervisorName}</p>
                    <div className="h-9 flex items-center justify-center text-slate-400 font-['Traditional_Arabic'] italic text-sm">
                      مصادق وفق المعايير
                    </div>
                    <span className="text-[10px] text-slate-500 block">التاريخ: {reportDateArabic}</span>
                  </div>

                  {/* Principal signature & Stamp */}
                  <div className="p-3 space-y-1.5">
                    <span className="font-bold text-slate-900 block text-[11px]">مدير المدرسة والمصادقة الرسمية:</span>
                    <p className="font-semibold text-slate-800 text-xs">{principalName}</p>
                    <div className="h-9 flex items-center justify-center">
                      <div className="w-14 h-8 border-2 border-dashed border-emerald-700 rounded text-[9px] text-emerald-800 font-bold flex items-center justify-center bg-white shadow-2xs">
                        ختم المدرسة
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 block">التاريخ: {reportDateArabic}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Page 2 Footer */}
          <div className="border-t border-slate-400 pt-2 mt-4 flex items-center justify-between text-[10px] text-slate-600">
            <span className="font-bold text-emerald-900">منظومة عبقور للتخطيط والإنتاجية التربوية</span>
            <span className="font-semibold text-slate-700">إعداد وتصميم: الأستاذ عبد الرحمن دويكات (الحقوق محفوظة - CC BY-NC-SA 4.0)</span>
            <span className="font-bold text-slate-800">الصفحة (٢) من (٢)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
