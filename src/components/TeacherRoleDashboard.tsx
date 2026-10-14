import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Award,
  Layers,
  Users,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Plus,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  FileText,
  Share2,
  ExternalLink,
  ChevronDown,
  Sparkles,
  TrendingUp,
  BarChart2,
  RefreshCw,
  Edit3,
  Check,
  UserCheck,
  GraduationCap,
} from 'lucide-react';
import { LessonPlan, EducationalResource } from '../types/lessonPlan';
import { StudentCompetencyRecord, StudentCompetencyMasteryLevel } from '../types/roleDashboards';
import {
  calculateTeacherOerMetrics,
  getStoredStudentRecords,
  saveStudentRecords,
} from '../utils/roleDashboardMetrics';
import {
  exportStudentCompetenciesToExcel,
  exportStudentCompetenciesToWord,
  shareReportLink,
} from '../utils/oerReportsExporter';
import { toArabicDigits, toArabicPercent, formatDateDMY } from '../utils/arabicNumerals';

interface TeacherRoleDashboardProps {
  plans: LessonPlan[];
  resources: EducationalResource[];
  activePlanId: string;
  onSelectPlan: (id: string) => void;
  onOpenEditor: () => void;
  onOpenCompetenciesLibrary?: () => void;
  onOpenPalestinianOerHub?: () => void;
  onOpenReportsCenter?: (defaultReport?: string) => void;
}

export const TeacherRoleDashboard: React.FC<TeacherRoleDashboardProps> = ({
  plans,
  resources,
  activePlanId,
  onSelectPlan,
  onOpenEditor,
  onOpenCompetenciesLibrary,
  onOpenPalestinianOerHub,
  onOpenReportsCenter,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [studentLevelFilter, setStudentLevelFilter] = useState<'all' | StudentCompetencyMasteryLevel>('all');
  const [searchStudentQuery, setSearchStudentQuery] = useState('');
  const [students, setStudents] = useState<StudentCompetencyRecord[]>(() => getStoredStudentRecords());
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // New Student modal / inline entry state
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGrade, setNewStudentGrade] = useState('الصف الثالث الأساسي');
  const [newStudentSection, setNewStudentSection] = useState('أ');
  const [newStudentSubject, setNewStudentSubject] = useState('الرياضيات');
  const [newStudentCompTitle, setNewStudentCompTitle] = useState('القيمة المنزلية والتمثيل البصري');
  const [newStudentLevel, setNewStudentLevel] = useState<StudentCompetencyMasteryLevel>('mastered');
  const [newStudentIndicator, setNewStudentIndicator] = useState('');
  const [newStudentNotes, setNewStudentNotes] = useState('');

  // Calculate dynamic teacher metrics
  const metrics = useMemo(() => {
    return calculateTeacherOerMetrics(
      plans,
      resources,
      selectedSubject === 'all' ? undefined : selectedSubject,
      selectedGrade === 'all' ? undefined : selectedGrade
    );
  }, [plans, resources, selectedSubject, selectedGrade]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Filtered Students list
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSubject = selectedSubject === 'all' || s.subject.includes(selectedSubject);
      const matchGrade = selectedGrade === 'all' || s.grade.includes(selectedGrade);
      const matchLevel = studentLevelFilter === 'all' || s.masteryLevel === studentLevelFilter;
      const matchQuery =
        !searchStudentQuery.trim() ||
        s.studentName.toLowerCase().includes(searchStudentQuery.toLowerCase()) ||
        s.competencyTitle.toLowerCase().includes(searchStudentQuery.toLowerCase()) ||
        s.observedIndicator.toLowerCase().includes(searchStudentQuery.toLowerCase());

      return matchSubject && matchGrade && matchLevel && matchQuery;
    });
  }, [students, selectedSubject, selectedGrade, studentLevelFilter, searchStudentQuery]);

  // Update student mastery level
  const handleUpdateStudentLevel = (id: string, newLevel: StudentCompetencyMasteryLevel) => {
    const updated = students.map((s) => (s.id === id ? { ...s, masteryLevel: newLevel } : s));
    setStudents(updated);
    saveStudentRecords(updated);
    showToast('تم تحديث مستوى تمكن الطالب تلقائياً وحفظه في السجل! 🎯');
  };

  // Add new student competency record
  const handleSaveNewStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentIndicator.trim()) {
      showToast('يرجى ملء اسم الطالب ومؤشر الأداء الملاحظ على الأقل.');
      return;
    }

    const newRecord: StudentCompetencyRecord = {
      id: `std-custom-${Date.now()}`,
      studentName: newStudentName.trim(),
      grade: newStudentGrade,
      section: newStudentSection,
      subject: newStudentSubject,
      competencyCode: 'SPEC-PAL-NEW',
      competencyTitle: newStudentCompTitle.trim(),
      masteryLevel: newStudentLevel,
      observedIndicator: newStudentIndicator.trim(),
      assessmentDate: new Date().toISOString().slice(0, 10),
      teacherNotes: newStudentNotes.trim() || undefined,
    };

    const updated = [newRecord, ...students];
    setStudents(updated);
    saveStudentRecords(updated);
    setIsAddingStudent(false);
    setNewStudentName('');
    setNewStudentIndicator('');
    setNewStudentNotes('');
    showToast(`تمت إضافة الطالب «${newRecord.studentName}» إلى سجل الكفايات بنجاح! 🟢`);
  };

  // Export handlers
  const handleExportExcel = () => {
    exportStudentCompetenciesToExcel(filteredStudents, {
      subject: selectedSubject === 'all' ? undefined : selectedSubject,
      grade: selectedGrade === 'all' ? undefined : selectedGrade,
    });
    showToast('تم تصدير سجل الكفايات إلى جدول Excel (.csv) بترميز عربي سليم! 📊');
  };

  const handleExportWord = () => {
    exportStudentCompetenciesToWord(filteredStudents, {
      subject: selectedSubject === 'all' ? undefined : selectedSubject,
      grade: selectedGrade === 'all' ? undefined : selectedGrade,
    });
    showToast('تم تصدير سجل الكفايات إلى مستند Word (.doc) رسمي معتمد! 📑');
  };

  const handleShareLink = async () => {
    const res = await shareReportLink(
      'سجل متابعة كفايات الطلبة — منظومة عبقور',
      `سجل كفايات الطلبة: تم رصد ${toArabicDigits(filteredStudents.length)} طالباً وطالبة.`
    );
    if (res.success) {
      showToast(res.method === 'web_share' ? 'تمت المشاركة بنجاح!' : 'تم نسخ الرابط للحافظة بنجاح! 📋');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 left-6 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-emerald-400 flex items-center gap-3 animate-slideUp">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-l from-emerald-800 via-teal-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-emerald-600/40 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>🟢 لوحة المعلم المعتمدة</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/20">
                منهجية التعليم المفتوح OER
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black font-['Tajawal'] tracking-tight">
              مؤشرات إنجاز المعلم وسجل كفايات الطلبة
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
              متابعة دقيقة ومؤشرات حية لتطبيق معايير وزارة التربية والتعليم العالي: تغطية الكفايات الوطنية، تنوع ثلاثي المصادر، وتصنيف إتقان الطلبة (متمكن، في طور التمكن، بحاجة دعم).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onOpenReportsCenter && (
              <button
                type="button"
                onClick={() => onOpenReportsCenter('student_competencies_record')}
                className="px-4 py-2.5 bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md hover:scale-[1.02] transition-all cursor-pointer border border-amber-300"
              >
                <Download className="w-4 h-4 text-slate-950 shrink-0" />
                <span>مركز التقارير والتصدير 📄</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenEditor}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 border border-white/20 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-emerald-200 shrink-0" />
              <span>محرر خطة الدرس 📝</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Teacher Indicator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: عدد الخطط المكتملة */}
        <div className="bg-white rounded-3xl p-5 border-2 border-emerald-500/20 shadow-sm hover:border-emerald-500 transition-all hover:shadow-md group">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-black text-slate-600">عدد الخطط المكتملة</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-3xl font-black text-slate-900 font-['Tajawal']">
              {toArabicDigits(metrics.completedPlansCount)}
            </div>
            <span className="text-xs font-bold text-slate-500">
              من أصل {toArabicDigits(metrics.totalPlansCount)} خطة
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            خطط متكاملة تتضمن بيانات الدرس، الكفايات، والأنشطة الصفية.
          </p>
        </div>

        {/* Metric 2: نسبة تغطية الكفايات */}
        <div className="bg-white rounded-3xl p-5 border-2 border-emerald-500/20 shadow-sm hover:border-emerald-500 transition-all hover:shadow-md group">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-black text-slate-600">نسبة تغطية الكفايات</span>
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5 text-teal-600" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-3xl font-black text-emerald-800 font-['Tajawal']">
              {toArabicPercent(metrics.competencyCoveragePct)}
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
              {metrics.competencyCoveragePct >= 70 ? 'تغطية ممتازة 🌟' : 'قيد الاستكمال'}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, metrics.competencyCoveragePct)}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
            <span>تواصل، تفكير ناقد، إبداع، مسؤولية</span>
            {onOpenCompetenciesLibrary && (
              <button
                type="button"
                onClick={onOpenCompetenciesLibrary}
                className="text-emerald-700 font-bold hover:underline"
              >
                المكتبة 🎯
              </button>
            )}
          </div>
        </div>

        {/* Metric 3: تنوع المصادر المستخدمة */}
        <div className="bg-white rounded-3xl p-5 border-2 border-emerald-500/20 shadow-sm hover:border-emerald-500 transition-all hover:shadow-md group">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-black text-slate-600">تنوع المصادر المستخدمة</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-3xl font-black text-slate-900 font-['Tajawal']">
              {toArabicDigits(metrics.totalDistinctSourcesCount)}
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              ثلاثي OER معتمد
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-600">
            <span className="bg-slate-100 px-1.5 py-0.5 rounded">elearn ({toArabicDigits(metrics.sourceTypesBreakdown.elearnPortal)})</span>
            <span className="bg-slate-100 px-1.5 py-0.5 rounded">روافد ({toArabicDigits(metrics.sourceTypesBreakdown.rawafedInteractive)})</span>
            <span className="bg-slate-100 px-1.5 py-0.5 rounded">منهاجي ({toArabicDigits(metrics.sourceTypesBreakdown.minhajiWorksheets)})</span>
          </div>
        </div>

        {/* Metric 4: المصادر التي أضافها بنفسه */}
        <div className="bg-white rounded-3xl p-5 border-2 border-emerald-500/20 shadow-sm hover:border-emerald-500 transition-all hover:shadow-md group">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-black text-slate-600">المصادر المضافة ذاتياً</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-3xl font-black text-blue-900 font-['Tajawal']">
              {toArabicDigits(metrics.selfAddedResourcesCount)}
            </div>
            <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
              بنك المصادر الخاص
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            مواد ومحسوسات أضافها المعلم تدعم احتياجات طلبته المحلية.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION: سجل تقدم الطلبة مقسماً حسب الكفايات (متمكن — في طور التمكن — بحاجة دعم) */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl border-2 border-emerald-500/30 shadow-sm overflow-hidden">
        {/* Section Header with Quick Actions */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-white px-5 sm:px-7 py-5 border-b border-emerald-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-xs shrink-0">
              <GraduationCap className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 font-['Tajawal']">
                  سجل تقدم الطلبة الموزع حسب الكفايات الوطنية
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-800 text-white">
                  {toArabicDigits(filteredStudents.length)} طالب/ة
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                تصنيف إتقان الطلبة الإجرائي: متمكن 🟢 — في طور التمكن 🟡 — بحاجة دعم 🔴 وفق المعايير الوزارية
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddingStudent(!isAddingStudent)}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Plus className="w-4 h-4 text-amber-300 shrink-0" />
              <span>رصد كفاية لطالب جديد ➕</span>
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3 py-2 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="تصدير إلى جدول Excel (.csv بترميز عربي)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Excel 📊</span>
            </button>

            <button
              type="button"
              onClick={handleExportWord}
              className="px-3 py-2 bg-white hover:bg-blue-50 text-blue-800 border border-blue-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="تصدير إلى مستند Word (.doc)"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Word 📑</span>
            </button>

            <button
              type="button"
              onClick={handleShareLink}
              className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl transition-colors cursor-pointer"
              title="مشاركة سجل الكفايات"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3 Level Stat Badges Filter Strip */}
        <div className="p-5 sm:p-6 bg-slate-50/60 border-b border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {/* Level 1: متمكن */}
            <div
              onClick={() => setStudentLevelFilter(studentLevelFilter === 'mastered' ? 'all' : 'mastered')}
              className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                studentLevelFilter === 'mastered'
                  ? 'bg-emerald-50 border-emerald-500 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-600" />
                <div>
                  <div className="text-xs font-black text-slate-900">متمكن (مستوى متقدم) 🟢</div>
                  <div className="text-[11px] text-slate-500">يحقق مؤشر الكفاية باستقلالية تامة</div>
                </div>
              </div>
              <div className="text-lg font-black text-emerald-800 font-['Tajawal']">
                {toArabicDigits(metrics.studentProgressSummary.mastered)} ({toArabicPercent(metrics.studentProgressSummary.masteredPct)})
              </div>
            </div>

            {/* Level 2: في طور التمكن */}
            <div
              onClick={() => setStudentLevelFilter(studentLevelFilter === 'developing' ? 'all' : 'developing')}
              className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                studentLevelFilter === 'developing'
                  ? 'bg-amber-50 border-amber-500 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-amber-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500" />
                <div>
                  <div className="text-xs font-black text-slate-900">في طور التمكن (متوسط) 🟡</div>
                  <div className="text-[11px] text-slate-500">يحقق الكفاية بمساعدة أو توجيه جزئي</div>
                </div>
              </div>
              <div className="text-lg font-black text-amber-800 font-['Tajawal']">
                {toArabicDigits(metrics.studentProgressSummary.developing)} ({toArabicPercent(metrics.studentProgressSummary.developingPct)})
              </div>
            </div>

            {/* Level 3: بحاجة دعم */}
            <div
              onClick={() => setStudentLevelFilter(studentLevelFilter === 'needs_support' ? 'all' : 'needs_support')}
              className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                studentLevelFilter === 'needs_support'
                  ? 'bg-rose-50 border-rose-500 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-rose-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-600" />
                <div>
                  <div className="text-xs font-black text-slate-900">بحاجة دعم ومساندة 🔴</div>
                  <div className="text-[11px] text-slate-500">يتطلب خطة علاجية وأنشطة تمايز محسوسة</div>
                </div>
              </div>
              <div className="text-lg font-black text-rose-800 font-['Tajawal']">
                {toArabicDigits(metrics.studentProgressSummary.needsSupport)} ({toArabicPercent(metrics.studentProgressSummary.needsSupportPct)})
              </div>
            </div>
          </div>

          {/* Search & Filter Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchStudentQuery}
                onChange={(e) => setSearchStudentQuery(e.target.value)}
                placeholder="ابحث بالاسم، الكفاية، أو مؤشر الأداء..."
                className="w-full pr-10 pl-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
              {studentLevelFilter !== 'all' && (
                <button
                  type="button"
                  onClick={() => setStudentLevelFilter('all')}
                  className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  إلغاء التصفية ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Inline Add Student Form */}
        {isAddingStudent && (
          <form onSubmit={handleSaveNewStudent} className="p-5 sm:p-6 bg-emerald-50/70 border-b border-emerald-200 space-y-4 animate-slideDown">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-emerald-950 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-700" />
                <span>رصد مستوى كفاية جديد لطالب/ة</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsAddingStudent(false)}
                className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                إغلاق ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">اسم الطالب/ة *</label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="مثال: خالد محمد ناصر"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold focus:border-emerald-600 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">الصف والشعبة</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newStudentGrade}
                    onChange={(e) => setNewStudentGrade(e.target.value)}
                    className="w-3/4 px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold"
                  />
                  <input
                    type="text"
                    value={newStudentSection}
                    onChange={(e) => setNewStudentSection(e.target.value)}
                    placeholder="شعبة"
                    className="w-1/4 px-2 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">المبحث</label>
                <input
                  type="text"
                  value={newStudentSubject}
                  onChange={(e) => setNewStudentSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">مستوى التمكن الملاحظ *</label>
                <select
                  value={newStudentLevel}
                  onChange={(e) => setNewStudentLevel(e.target.value as StudentCompetencyMasteryLevel)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-black cursor-pointer"
                >
                  <option value="mastered">🟢 متمكن (استقلالية تامة)</option>
                  <option value="developing">🟡 في طور التمكن (توجيه جزئي)</option>
                  <option value="needs_support">🔴 بحاجة دعم (تيسير علاجي)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">عنوان الكفاية المستهدفة</label>
                <input
                  type="text"
                  value={newStudentCompTitle}
                  onChange={(e) => setNewStudentCompTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">المؤشر السلوكي الملاحظ *</label>
                <input
                  type="text"
                  required
                  value={newStudentIndicator}
                  onChange={(e) => setNewStudentIndicator(e.target.value)}
                  placeholder="مثال: يبرهن على فهم المسألة اللفظية ويوظف المحسوسات..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1">ملاحظات وخطة الدعم المقترحة</label>
              <input
                type="text"
                value={newStudentNotes}
                onChange={(e) => setNewStudentNotes(e.target.value)}
                placeholder="توجيهات علاجية أو إثرائية..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingStudent(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black cursor-pointer shadow-xs"
              >
                حفظ وإدراج في السجل ✓
              </button>
            </div>
          </form>
        )}

        {/* Student Records List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-xs font-black border-b border-slate-200">
                <th className="py-3 px-4">اسم الطالب/ة</th>
                <th className="py-3 px-4">الصف والشعبة</th>
                <th className="py-3 px-4">الكفاية المستهدفة ومؤشر الأداء الملاحظ</th>
                <th className="py-3 px-4">مستوى التمكن</th>
                <th className="py-3 px-4">ملاحظات وخطة الدعم</th>
                <th className="py-3 px-4 text-center">تحديث المستوى</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    لا توجد سجلات مطابقة للبحث أو التصفية الحالية.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs shrink-0">
                          {student.studentName.charAt(0)}
                        </div>
                        <span>{student.studentName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-semibold">
                      {student.grade} ({student.section})
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-emerald-950 truncate">{student.competencyTitle}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                        {student.observedIndicator}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {student.masteryLevel === 'mastered' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          <span>متمكن 🟢</span>
                        </span>
                      ) : student.masteryLevel === 'developing' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>في طور التمكن 🟡</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-100 text-rose-900 border border-rose-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                          <span>بحاجة دعم 🔴</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-[11px] max-w-xs">
                      <div>{student.teacherNotes || '—'}</div>
                      {student.supportPlanSuggested && (
                        <div className="text-rose-700 font-bold mt-0.5">
                          خطة: {student.supportPlanSuggested}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1 bg-slate-100 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => handleUpdateStudentLevel(student.id, 'mastered')}
                          title="ترقية إلى: متمكن 🟢"
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black transition-all cursor-pointer ${
                            student.masteryLevel === 'mastered'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-600 hover:bg-emerald-100'
                          }`}
                        >
                          🟢
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStudentLevel(student.id, 'developing')}
                          title="تعيين إلى: في طور التمكن 🟡"
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black transition-all cursor-pointer ${
                            student.masteryLevel === 'developing'
                              ? 'bg-amber-500 text-slate-950 shadow-xs'
                              : 'text-slate-600 hover:bg-amber-100'
                          }`}
                        >
                          🟡
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStudentLevel(student.id, 'needs_support')}
                          title="تعيين إلى: بحاجة دعم 🔴"
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black transition-all cursor-pointer ${
                            student.masteryLevel === 'needs_support'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'text-slate-600 hover:bg-rose-100'
                          }`}
                        >
                          🔴
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
