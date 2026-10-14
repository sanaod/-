import React, { useState } from 'react';
import {
  X,
  FileText,
  FileSpreadsheet,
  Download,
  Share2,
  Printer,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Award,
  Layers,
  Sparkles,
  School,
  Calendar,
  Check,
  Copy,
} from 'lucide-react';
import { LessonPlan, EducationalResource } from '../types/lessonPlan';
import { StudentCompetencyRecord, SchoolOerMetrics } from '../types/roleDashboards';
import {
  calculateTeacherOerMetrics,
  calculateSchoolOerMetrics,
  getStoredStudentRecords,
} from '../utils/roleDashboardMetrics';
import {
  exportStudentCompetenciesToExcel,
  exportStudentCompetenciesToWord,
  exportSchoolOerStatsToExcel,
  exportSchoolOerStatsToWord,
  exportOfficialPlanToExcel,
  shareReportLink,
} from '../utils/oerReportsExporter';
import { exportToWord } from '../utils/exportUtils';
import { toArabicDigits, toArabicPercent, formatDateDMY } from '../utils/arabicNumerals';

interface OerReportsCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: LessonPlan;
  allPlans: LessonPlan[];
  resources: EducationalResource[];
  defaultReportTab?: 'official_lesson_plan' | 'student_competencies_record' | 'school_oer_statistics';
  onOpenPrintView?: () => void;
}

export const OerReportsCenterModal: React.FC<OerReportsCenterModalProps> = ({
  isOpen,
  onClose,
  currentPlan,
  allPlans,
  resources,
  defaultReportTab = 'official_lesson_plan',
  onOpenPrintView,
}) => {
  const [activeTab, setActiveTab] = useState<'official_lesson_plan' | 'student_competencies_record' | 'school_oer_statistics'>(
    defaultReportTab
  );
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const studentRecords = getStoredStudentRecords();
  const schoolMetrics = calculateSchoolOerMetrics(allPlans, resources);

  // 1. Export Handlers for: خطة درس بصيغة معتمدة رسمياً
  const handleExportPlanWord = () => {
    exportToWord(currentPlan);
    showToast('تم تصدير خطة الدرس الرسمية إلى مستند Word (.doc) بنجاح! 📑');
  };

  const handleExportPlanExcel = () => {
    exportOfficialPlanToExcel(currentPlan);
    showToast('تم تصدير خطة الدرس إلى جدول Excel (.csv) بنجاح! 📊');
  };

  const handleExportPlanPdf = () => {
    if (onOpenPrintView) {
      onClose();
      onOpenPrintView();
    } else {
      window.print();
    }
  };

  const handleSharePlanLink = async () => {
    const res = await shareReportLink(
      `خطة درس: ${currentPlan.header.lessonTitle || currentPlan.title}`,
      `خطة درس معتمدة رسمياً في مبحث ${currentPlan.header.subject} للصف ${currentPlan.header.grade}.`
    );
    if (res.success) {
      showToast(res.method === 'web_share' ? 'تمت مشاركة الخطة بنجاح!' : 'تم نسخ رابط الخطة للحافظة بنجاح! 📋');
    }
  };

  // 2. Export Handlers for: سجل متابعة كفايات الطلبة
  const handleExportStudentWord = () => {
    exportStudentCompetenciesToWord(studentRecords, {
      subject: currentPlan.header.subject,
      grade: currentPlan.header.grade,
      school: currentPlan.header.school,
      teacherName: currentPlan.header.teacherName,
    });
    showToast('تم تصدير سجل كفايات الطلبة إلى مستند Word (.doc) بنجاح! 📑');
  };

  const handleExportStudentExcel = () => {
    exportStudentCompetenciesToExcel(studentRecords, {
      subject: currentPlan.header.subject,
      grade: currentPlan.header.grade,
      school: currentPlan.header.school,
    });
    showToast('تم تصدير سجل كفايات الطلبة إلى جدول Excel (.csv) بنجاح! 📊');
  };

  const handleShareStudentLink = async () => {
    const res = await shareReportLink(
      'سجل متابعة كفايات الطلبة المعتمد',
      `سجل كفايات الطلبة لمدرسة ${currentPlan.header.school || 'الرواد'} متضمناً ${toArabicDigits(studentRecords.length)} طالباً وطالبة.`
    );
    if (res.success) {
      showToast(res.method === 'web_share' ? 'تمت المشاركة بنجاح!' : 'تم نسخ رابط السجل للحافظة بنجاح! 📋');
    }
  };

  // 3. Export Handlers for: إحصائيات استخدام المصادر المفتوحة في المدرسة
  const handleExportSchoolStatsWord = () => {
    exportSchoolOerStatsToWord(schoolMetrics);
    showToast('تم تصدير تقرير إحصائيات التعليم المفتوح للمدرسة إلى Word (.doc)! 📑');
  };

  const handleExportSchoolStatsExcel = () => {
    exportSchoolOerStatsToExcel(schoolMetrics);
    showToast('تم تصدير تقرير إحصائيات التعليم المفتوح للمدرسة إلى Excel (.csv)! 📊');
  };

  const handleShareSchoolStatsLink = async () => {
    const res = await shareReportLink(
      `إحصائيات تطبيق التعليم المفتوح بمدرسة ${schoolMetrics.schoolName}`,
      `نسبة التزام المدرسة: ${toArabicPercent(schoolMetrics.schoolCommitmentRate)} | تغطية الصفوف ١-٤: ${toArabicPercent(schoolMetrics.grades1To4CoverageRate)}.`
    );
    if (res.success) {
      showToast(res.method === 'web_share' ? 'تمت المشاركة بنجاح!' : 'تم نسخ رابط التقرير للحافظة بنجاح! 📋');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-5xl w-full border-2 border-emerald-600/40 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scaleUp">
        {/* Toast */}
        {toastMsg && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-900 text-white px-5 py-2.5 rounded-full shadow-lg border border-emerald-400 flex items-center gap-2 text-xs font-bold animate-slideDown">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
              📄
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black font-['Tajawal'] tracking-wide">
                  مركز التقارير المعتمدة لمنهجية التعليم المفتوح OER
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                  صيغ معتمدة رسمياً 🇵🇸
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                توليد وتصدير التقارير الرسمية الثلاثة بأربع صيغ قياسية: PDF — Word — Excel — رابط مشاركة
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reports Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 sm:px-6 pt-4 bg-slate-50 border-b border-slate-200 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('official_lesson_plan')}
            className={`px-4 py-3 border-b-2 font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'official_lesson_plan'
                ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>١. خطة درس بصيغة معتمدة رسمياً</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('student_competencies_record')}
            className={`px-4 py-3 border-b-2 font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'student_competencies_record'
                ? 'border-teal-600 text-teal-800 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4 text-teal-600" />
            <span>٢. سجل متابعة كفايات الطلبة</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('school_oer_statistics')}
            className={`px-4 py-3 border-b-2 font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'school_oer_statistics'
                ? 'border-amber-600 text-amber-900 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <School className="w-4 h-4 text-amber-600" />
            <span>٣. إحصائيات استخدام المصادر المفتوحة في المدرسة</span>
          </button>
        </div>

        {/* Modal Body / Report Preview & Action Toolbar */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* TAB 1: خطة درس بصيغة معتمدة رسمياً */}
          {activeTab === 'official_lesson_plan' && (
            <div className="space-y-5 animate-fadeIn">
              {/* 4 Action Export Toolbar */}
              <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-black text-emerald-950">تصدير خطة الدرس الحالية:</h4>
                  <p className="text-[11px] text-emerald-800 font-medium">
                    «{currentPlan.header.lessonTitle || currentPlan.title}» • {currentPlan.header.subject} • {currentPlan.header.grade}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportPlanPdf}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                    title="طباعة وتصدير PDF رسمي"
                  >
                    <Printer className="w-4 h-4 text-amber-300" />
                    <span>تصدير PDF 🖨️</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportPlanWord}
                    className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                    title="تنزيل ملف Microsoft Word (.doc)"
                  >
                    <FileText className="w-4 h-4 text-blue-200" />
                    <span>تصدير Word 📑</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportPlanExcel}
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                    title="تنزيل جدول بيانات Excel (.csv)"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                    <span>تصدير Excel 📊</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSharePlanLink}
                    className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                    title="مشاركة الرابط عبر التطبيقات"
                  >
                    <Share2 className="w-4 h-4 text-emerald-700" />
                    <span>مشاركة الرابط 🔗</span>
                  </button>
                </div>
              </div>

              {/* Preview Box */}
              <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 text-slate-900 space-y-4 shadow-inner">
                <div className="text-center border-b-2 border-slate-900 pb-4">
                  <div className="text-xs font-bold text-slate-700">دولة فلسطين 🇵🇸 — وزارة التربية والتعليم العالي</div>
                  <h3 className="text-base font-black text-slate-900 mt-1">
                    استمارة التخطيط التربوي وتحضير الدروس المعتمدة
                  </h3>
                  <div className="text-xs text-slate-600 mt-0.5">
                    المبحث: {currentPlan.header.subject} • الصف: {currentPlan.header.grade} • المعلم/ة: {currentPlan.header.teacherName}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">المدرسة:</span>
                    <span className="font-bold">{currentPlan.header.school || '—'}</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">المديرية:</span>
                    <span className="font-bold">{currentPlan.header.directorate || '—'}</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">العام الدراسي:</span>
                    <span className="font-bold">2025 / 2026م</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">عدد الحصص:</span>
                    <span className="font-bold">{toArabicDigits(currentPlan.header.totalPeriods || 2)} حصص</span>
                  </div>
                </div>

                {/* Competencies Preview */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="text-xs font-black text-emerald-900">الكفايات المستهدفة:</span>
                  <div className="text-xs text-slate-700">
                    {(currentPlan.section1?.integrativeCompetencies || []).map((c, i) => (
                      <span key={i} className="inline-block bg-emerald-50 text-emerald-950 px-2 py-0.5 rounded mr-1 mb-1 font-bold">
                        • {c.title}: {c.description}
                      </span>
                    ))}
                  </div>
                </div>

                {/* OER Resources Triad Preview */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                  <span className="text-xs font-black text-teal-900">مصادر التعليم المفتوحة OER المعتمدة:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                      <span className="font-black text-emerald-900 block">المصدر الرئيسي:</span>
                      <span className="text-slate-700 font-semibold">
                        {currentPlan.oerData?.activities?.[0]?.primaryResource?.title || 'كتاب ودليل المعلم (elearn.edu.ps)'}
                      </span>
                    </div>
                    <div className="p-2 bg-teal-50 rounded-lg border border-teal-200">
                      <span className="font-black text-teal-900 block">المصدر البديل 1:</span>
                      <span className="text-slate-700 font-semibold">
                        {currentPlan.oerData?.activities?.[0]?.alternativeResource1?.title || 'محاكاة روافد الرقمية'}
                      </span>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="font-black text-blue-900 block">المصدر البديل 2:</span>
                      <span className="text-slate-700 font-semibold">
                        {currentPlan.oerData?.activities?.[0]?.alternativeResource2?.title || 'أوراق عمل منهاجي والمحسوسات'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: سجل متابعة كفايات الطلبة */}
          {activeTab === 'student_competencies_record' && (
            <div className="space-y-5 animate-fadeIn">
              {/* 4 Action Export Toolbar */}
              <div className="p-4 bg-teal-50/80 rounded-2xl border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-black text-teal-950">سجل كفايات الطلبة الرصدي:</h4>
                  <p className="text-[11px] text-teal-800 font-medium">
                    يتضمن {toArabicDigits(studentRecords.length)} طالباً مصنفين حسب مستويات التمكن الثلاثة (متمكن، في طور التمكن، بحاجة دعم).
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportStudentWord}
                    className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                    title="تنزيل سجل الكفايات Word (.doc)"
                  >
                    <FileText className="w-4 h-4 text-blue-200" />
                    <span>تصدير Word 📑</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportStudentExcel}
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                    title="تنزيل جدول كفايات الطلبة Excel (.csv)"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                    <span>تصدير Excel 📊</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                    title="طباعة السجل الرسمي"
                  >
                    <Printer className="w-4 h-4 text-amber-300" />
                    <span>طباعة PDF 🖨️</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShareStudentLink}
                    className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                    title="مشاركة رابط السجل"
                  >
                    <Share2 className="w-4 h-4 text-teal-700" />
                    <span>مشاركة الرابط 🔗</span>
                  </button>
                </div>
              </div>

              {/* Records Table Preview */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-inner">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-slate-100 font-black text-slate-700 border-b border-slate-200">
                      <th className="p-3">اسم الطالب/ة</th>
                      <th className="p-3">الصف</th>
                      <th className="p-3">الكفاية المستهدفة</th>
                      <th className="p-3">مستوى التمكن</th>
                      <th className="p-3">المؤشر الملاحظ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentRecords.slice(0, 6).map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{s.studentName}</td>
                        <td className="p-3 text-slate-600">{s.grade}</td>
                        <td className="p-3 font-semibold text-teal-900">{s.competencyTitle}</td>
                        <td className="p-3">
                          {s.masteryLevel === 'mastered' ? (
                            <span className="font-bold text-emerald-700">متمكن 🟢</span>
                          ) : s.masteryLevel === 'developing' ? (
                            <span className="font-bold text-amber-700">في طور التمكن 🟡</span>
                          ) : (
                            <span className="font-bold text-rose-700">بحاجة دعم 🔴</span>
                          )}
                        </td>
                        <td className="p-3 text-slate-500 text-[11px] truncate max-w-xs">{s.observedIndicator}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-2.5 text-center text-xs text-slate-500 bg-slate-50 border-t border-slate-100">
                  معاينة ٦ طلاب من أصل {toArabicDigits(studentRecords.length)} مسجلين بالسجل المعتمد.
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: إحصائيات استخدام المصادر المفتوحة في المدرسة */}
          {activeTab === 'school_oer_statistics' && (
            <div className="space-y-5 animate-fadeIn">
              {/* 4 Action Export Toolbar */}
              <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-black text-amber-950">تقرير إحصائيات التعليم المفتوح OER للمدرسة:</h4>
                  <p className="text-[11px] text-amber-800 font-medium">
                    نسبة التزام المدرسة {toArabicPercent(schoolMetrics.schoolCommitmentRate)} • تغطية الصفوف ١–٤: {toArabicPercent(schoolMetrics.grades1To4CoverageRate)}.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportSchoolStatsWord}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                    title="تنزيل تقرير المدرسة Word (.doc)"
                  >
                    <FileText className="w-4 h-4 text-amber-200" />
                    <span>تصدير Word 📑</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportSchoolStatsExcel}
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                    title="تنزيل تقرير المدرسة Excel (.csv)"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                    <span>تصدير Excel 📊</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                    title="طباعة التقرير PDF"
                  >
                    <Printer className="w-4 h-4 text-amber-300" />
                    <span>طباعة PDF 🖨️</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShareSchoolStatsLink}
                    className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                    title="مشاركة رابط التقرير"
                  >
                    <Share2 className="w-4 h-4 text-amber-700" />
                    <span>مشاركة الرابط 🔗</span>
                  </button>
                </div>
              </div>

              {/* School Metrics Preview Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-center">
                  <div className="text-xs text-amber-800 font-bold">نسبة التزام المدرسة</div>
                  <div className="text-2xl font-black text-amber-900 mt-1 font-['Tajawal']">
                    {toArabicPercent(schoolMetrics.schoolCommitmentRate)}
                  </div>
                  <div className="text-[10px] text-amber-700 mt-0.5">مطابقة لمعايير OER</div>
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
                  <div className="text-xs text-emerald-800 font-bold">تغطية الصفوف الأساسية (١–٤)</div>
                  <div className="text-2xl font-black text-emerald-900 mt-1 font-['Tajawal']">
                    {toArabicPercent(schoolMetrics.grades1To4CoverageRate)}
                  </div>
                  <div className="text-[10px] text-emerald-700 mt-0.5">وفق دليل المعلم الصادر عن الوزارة</div>
                </div>

                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 text-center">
                  <div className="text-xs text-blue-800 font-bold">المصادر المفتوحة المستثمرة</div>
                  <div className="text-2xl font-black text-blue-900 mt-1 font-['Tajawal']">
                    {toArabicDigits(schoolMetrics.totalUniqueResourcesCount)} مصدراً
                  </div>
                  <div className="text-[10px] text-blue-700 mt-0.5">بوابة + روافد + منهاجي</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold">
              تحدث بيانات كافة التقارير تلقائياً ولحظياً مع حفظ أو تعديل أي خطة درس جديدة في المنظومة.
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold cursor-pointer transition-colors"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};
