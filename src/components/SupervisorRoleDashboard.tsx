import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileText,
  Search,
  Filter,
  Download,
  Share2,
  Edit3,
  Check,
  X,
  ExternalLink,
  MessageSquare,
  BookOpen,
  Layers,
  Sparkles,
  Users,
  Compass,
} from 'lucide-react';
import { LessonPlan } from '../types/lessonPlan';
import { TeacherOerApplicationStatus, SupervisorReviewAction } from '../types/roleDashboards';
import {
  calculateSupervisorOerMetrics,
  saveSupervisorReview,
  getStoredSupervisorReviews,
} from '../utils/roleDashboardMetrics';
import { toArabicDigits, toArabicPercent, formatDateDMY } from '../utils/arabicNumerals';

interface SupervisorRoleDashboardProps {
  plans: LessonPlan[];
  onSelectPlan: (id: string) => void;
  onOpenEditor: () => void;
  onOpenReportsCenter?: (defaultReport?: string) => void;
  onUpdatePlanReview?: (planId: string, directives: string, status: 'approved' | 'needs_revision') => void;
}

export const SupervisorRoleDashboard: React.FC<SupervisorRoleDashboardProps> = ({
  plans,
  onSelectPlan,
  onOpenEditor,
  onOpenReportsCenter,
  onUpdatePlanReview,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'needs_revision' | 'in_review'>('all');
  const [selectedTeacherForReview, setSelectedTeacherForReview] = useState<TeacherOerApplicationStatus | null>(null);

  // Review Form States
  const [reviewDirectives, setReviewDirectives] = useState('');
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'needs_revision'>('approved');
  const [sectionToRevise, setSectionToRevise] = useState<
    'section1_competencies' | 'section2_learning_situation' | 'section3_assessment' | 'resources_triad' | 'general'
  >('resources_triad');
  const [supervisorName, setSupervisorName] = useState('د. إياد كمال طهبوب (مشرف المرحلة الأساسية)');
  const [referenceGuideBylaw, setReferenceGuideBylaw] = useState('البند ٣.٢: إلزامية توفير بدائل ورقية ورقمية لكل نشاط');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Dynamic calculations from plans
  const supervisorMetrics = useMemo(() => {
    return calculateSupervisorOerMetrics(plans);
  }, [plans]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const filteredTeachers = useMemo(() => {
    return supervisorMetrics.teachersStatusList.filter((t) => {
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchQuery =
        !searchQuery.trim() ||
        t.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.latestPlanTitle.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchQuery;
    });
  }, [supervisorMetrics, statusFilter, searchQuery]);

  // Open Review Modal for a specific teacher's plan
  const handleOpenReviewModal = (teacher: TeacherOerApplicationStatus) => {
    setSelectedTeacherForReview(teacher);
    setReviewDirectives(teacher.supervisorNotes || '');
    setReviewStatus(teacher.status === 'needs_revision' ? 'needs_revision' : 'approved');
    if (teacher.sectionToRevise) {
      setSectionToRevise(teacher.sectionToRevise as any);
    }
  };

  // Submit Review Action
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherForReview) return;

    const action: SupervisorReviewAction = {
      planId: selectedTeacherForReview.latestPlanId,
      status: reviewStatus,
      supervisorName,
      directives: reviewDirectives,
      sectionToRevise: reviewStatus === 'needs_revision' ? sectionToRevise : undefined,
      reviewDate: formatDateDMY(new Date().toISOString()),
      referenceToGuideChapter: referenceGuideBylaw,
    };

    saveSupervisorReview(action);

    if (onUpdatePlanReview) {
      onUpdatePlanReview(selectedTeacherForReview.latestPlanId, reviewDirectives, reviewStatus);
    }

    showToast(
      reviewStatus === 'approved'
        ? `تم اعتماد خطة المعلم «${selectedTeacherForReview.teacherName}» رسمياً وفق دليل OER! 🟢`
        : `تم إرسال طلب التعديل للمعلم «${selectedTeacherForReview.teacherName}» مع تحديد الجزء المطلوب! 🟡`
    );

    setSelectedTeacherForReview(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 left-6 z-50 bg-blue-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-blue-400 flex items-center gap-3 animate-slideUp">
          <CheckCircle2 className="w-5 h-5 text-blue-300 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-l from-blue-900 via-indigo-900 to-slate-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-blue-500/40 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-400/20 text-blue-200 border border-blue-400/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span>🔵 لوحة المشرف التربوي</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/20">
                الإشراف والتأهيل التربوي — وزارة التربية والتعليم
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black font-['Tajawal'] tracking-tight">
              متابعة واعتماد تطبيق منهجية OER للمعلمين
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
              تقييم جودة التحضير الصفي، التحقق من تنوع المصادر الثلاثية، وضوح مؤشرات الكفايات، وتوجيه الملاحظات الميدانية الملزمة وفق دليل المعلم الفلسطيني.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onOpenReportsCenter && (
              <button
                type="button"
                onClick={() => onOpenReportsCenter('official_lesson_plan')}
                className="px-4 py-2.5 bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md hover:scale-[1.02] transition-all cursor-pointer border border-amber-300"
              >
                <Download className="w-4 h-4 text-slate-950 shrink-0" />
                <span>تقارير الإشراف المعتمدة 📄</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenEditor}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 border border-white/20 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-blue-200 shrink-0" />
              <span>معاينة محرر الخطط 📝</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Supervisor Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: عدد المعلمين المتابعين */}
        <div className="bg-white rounded-3xl p-5 border-2 border-blue-500/20 shadow-sm hover:border-blue-500 transition-all hover:shadow-md group">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-black text-slate-600">المعلمون المتابعون</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-3xl font-black text-slate-900 font-['Tajawal']">
              {toArabicDigits(supervisorMetrics.totalTeachers)}
            </div>
            <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
              معلم / معلمة
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            موزعون على مباحث المرحلة الأساسية الأولى والمراحل العليا.
          </p>
        </div>

        {/* KPI 2: مدى تنوع المصادر الإشرافي */}
        <div className="bg-white rounded-3xl p-5 border-2 border-blue-500/20 shadow-sm hover:border-blue-500 transition-all hover:shadow-md group">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-black text-slate-600">متوسط تنوع المصادر</span>
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5 text-teal-600" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-3xl font-black text-teal-800 font-['Tajawal']">
              {toArabicPercent(supervisorMetrics.avgComplianceScore)}
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-100 text-teal-800">
              ثلاثي المصادر OER
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-600 to-blue-600 h-full rounded-full transition-all duration-700"
              style={{ width: `${supervisorMetrics.avgComplianceScore}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            توفير مصدر رئيسي من elearn وبديلين من روافد ومنهاجي.
          </p>
        </div>

        {/* KPI 3: وضوح الكفايات والمؤشرات */}
        <div className="bg-white rounded-3xl p-5 border-2 border-blue-500/20 shadow-sm hover:border-blue-500 transition-all hover:shadow-md group">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-black text-slate-600">مؤشر وضوح الكفايات</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-3xl font-black text-indigo-900 font-['Tajawal']">
              {toArabicPercent(88)}
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              مؤشرات قابلة للقياس
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            صياغة أهداف سلوكية إجرائية تبتعد عن المصطلحات الفضفاضة.
          </p>
        </div>

        {/* KPI 4: حالة الاعتماد */}
        <div className="bg-white rounded-3xl p-5 border-2 border-blue-500/20 shadow-sm hover:border-blue-500 transition-all hover:shadow-md group">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-black text-slate-600">الخطط المعتمدة إشرافياً</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-3xl font-black text-emerald-800 font-['Tajawal']">
              {toArabicDigits(supervisorMetrics.approvedCount)}
            </div>
            <span className="text-xs font-bold text-slate-500">
              {toArabicDigits(supervisorMetrics.needsRevisionCount)} طلب تعديل
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            اعتمادات رسمية موقعة وموثقة بختم الإشراف التربوي.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION: قائمة المعلمين وحالة تطبيقهم لمنهجية OER + محطة الاعتماد */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl border-2 border-blue-500/30 shadow-sm overflow-hidden">
        {/* Table Filters Header */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-white px-5 sm:px-7 py-5 border-b border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-800 text-white flex items-center justify-center shadow-xs shrink-0">
              <ShieldCheck className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 font-['Tajawal']">
                قائمة المعلمين وحالة تطبيقهم لمنهجية OER
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                فحص مدى تنوع المصادر، وضوح الكفايات، واعتماد الخطة أو طلب تعديلها مع توجيه الملاحظات
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-blue-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                الكل ({toArabicDigits(supervisorMetrics.totalTeachers)})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('approved')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'approved'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                معتمد 🟢 ({toArabicDigits(supervisorMetrics.approvedCount)})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('needs_revision')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'needs_revision'
                    ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                    : 'text-amber-800 hover:bg-amber-50'
                }`}
              >
                طلب تعديل 🟡 ({toArabicDigits(supervisorMetrics.needsRevisionCount)})
              </button>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم المعلم، المبحث، أو عنوان الدرس..."
              className="w-full pr-10 pl-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold focus:border-blue-600 outline-hidden"
            />
          </div>
        </div>

        {/* Teachers Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-xs font-black border-b border-slate-200">
                <th className="py-3 px-4">اسم المعلم/ة</th>
                <th className="py-3 px-4">المبحث والصف</th>
                <th className="py-3 px-4">أحدث خطة درس</th>
                <th className="py-3 px-4">تنوع المصادر OER</th>
                <th className="py-3 px-4">وضوح الكفايات</th>
                <th className="py-3 px-4">حالة الاعتماد</th>
                <th className="py-3 px-4 text-center">إجراء المشرف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-black text-xs shrink-0">
                        {teacher.teacherName.charAt(0)}
                      </div>
                      <div>
                        <div>{teacher.teacherName}</div>
                        <div className="text-[10px] text-slate-500 font-normal">
                          {toArabicDigits(teacher.completedPlansCount)} خطة منجزة
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-semibold">
                    <div>{teacher.subject}</div>
                    <div className="text-[11px] text-slate-500">{teacher.grade}</div>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-bold text-blue-950 truncate">{teacher.latestPlanTitle}</div>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectPlan(teacher.latestPlanId);
                        onOpenEditor();
                      }}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-bold hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <span>معاينة الخطة كاملة</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-teal-600 h-full rounded-full"
                          style={{ width: `${teacher.sourceDiversityScore}%` }}
                        />
                      </div>
                      <span className="font-black text-teal-800">{toArabicPercent(teacher.sourceDiversityScore)}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {teacher.sourceDiversityScore >= 70 ? 'ثلاثي معتمد ✓' : 'بحاجة تنويع البدائل'}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full"
                          style={{ width: `${teacher.competencyClarityScore}%` }}
                        />
                      </div>
                      <span className="font-black text-indigo-800">{toArabicPercent(teacher.competencyClarityScore)}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">مؤشرات سلوكية مقاسة</div>
                  </td>
                  <td className="py-3.5 px-4">
                    {teacher.status === 'approved' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>معتمد رسمياً 🟢</span>
                      </span>
                    ) : teacher.status === 'needs_revision' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>طلب تعديل 🟡</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-blue-100 text-blue-900 border border-blue-300">
                        <HelpCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>قيد المراجعة ⚪</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleOpenReviewModal(teacher)}
                      className="px-3 py-1.5 bg-blue-800 hover:bg-blue-900 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 mx-auto"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-300" />
                      <span>قرار المشرف ⚖️</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SUPERVISOR REVIEW MODAL (اعتماد الخطة أو طلب تعديل مع تحديد الجزء والملاحظات) */}
      {/* ========================================================================= */}
      {selectedTeacherForReview && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full border-2 border-blue-600 shadow-2xl overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                  ⚖️
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black font-['Tajawal']">
                    قرار الاعتماد والتوجيه الإشرافي (منهجية OER)
                  </h3>
                  <p className="text-xs text-blue-200 mt-0.5">
                    المعلم/ة: {selectedTeacherForReview.teacherName} — درس: {selectedTeacherForReview.latestPlanTitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTeacherForReview(null)}
                className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitReview} className="p-6 space-y-5">
              {/* Decision Selector: Approve vs Needs Revision */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-800">
                  قرار المشرف التربوي <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setReviewStatus('approved')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                      reviewStatus === 'approved'
                        ? 'bg-emerald-50 border-emerald-600 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full border-2 border-emerald-600 flex items-center justify-center">
                      {reviewStatus === 'approved' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />}
                    </div>
                    <div>
                      <div className="text-xs font-black text-emerald-950">اعتماد الخطة رسمياً 🟢</div>
                      <div className="text-[11px] text-emerald-700">تطبيق مطابق لمعايير دليل OER ومصادره</div>
                    </div>
                  </div>

                  <div
                    onClick={() => setReviewStatus('needs_revision')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                      reviewStatus === 'needs_revision'
                        ? 'bg-amber-50 border-amber-500 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-amber-300'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full border-2 border-amber-600 flex items-center justify-center">
                      {reviewStatus === 'needs_revision' && <div className="w-2.5 h-2.5 rounded-full bg-amber-600" />}
                    </div>
                    <div>
                      <div className="text-xs font-black text-amber-950">طلب تعديل واستكمال 🟡</div>
                      <div className="text-[11px] text-amber-700">إرجاع الخطة للمعلم مع تحديد النقص</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conditional Section to Revise (عند طلب تعديل مع تحديد الجزء المراد تعديله) */}
              {reviewStatus === 'needs_revision' && (
                <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-300 space-y-2 animate-fadeIn">
                  <label className="block text-xs font-black text-amber-950">
                    تحديد الجزء المراد تعديله بدقة <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={sectionToRevise}
                    onChange={(e) => setSectionToRevise(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-400 bg-white text-xs font-black text-slate-900 cursor-pointer outline-hidden"
                  >
                    <option value="resources_triad">📚 ثلاثي مصادر التعلم المفتوحة وبدائلها (إلزامية البديلين OER)</option>
                    <option value="section1_competencies">🎯 بيانات الدرس والكفايات المستهدفة ومؤشرات الأداء</option>
                    <option value="section2_learning_situation">⏱️ خطوات الموقف التعليمي والأنشطة والزمن المقترح</option>
                    <option value="section3_assessment">📊 أدوات وسلالم التقويم التكويني والختامي (Rubric)</option>
                    <option value="general">📝 تدقيق شامل وإعادة صياغة الأنشطة ومراعاة التمايز</option>
                  </select>
                  <p className="text-[11px] text-amber-800">
                    سيظهر إشعار بارز للمعلم عند فتح الخطة يحدد هذا الجزء تحديداً لتسريع الإنجاز.
                  </p>
                </div>
              )}

              {/* Supervisory Notes & Ministerial Guide Reference */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-800">
                  ملاحظات وتوجيهات المشرف التربوي الميدانية (مرتبطة بدليل الوزارة) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={reviewDirectives}
                  onChange={(e) => setReviewDirectives(e.target.value)}
                  placeholder="اكتب التوجيهات التربوية والملاحظات الصادرة عن الإشراف التربوي..."
                  className="w-full p-3.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-hidden leading-relaxed"
                />
              </div>

              {/* Reference to Palestinian OER Guide */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">اسم المشرف التربوي المعتمد</label>
                  <input
                    type="text"
                    value={supervisorName}
                    onChange={(e) => setSupervisorName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">السند من دليل المعلم لمصادر OER</label>
                  <input
                    type="text"
                    value={referenceGuideBylaw}
                    onChange={(e) => setReferenceGuideBylaw(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedTeacherForReview(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md text-white ${
                    reviewStatus === 'approved'
                      ? 'bg-emerald-700 hover:bg-emerald-800'
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {reviewStatus === 'approved' ? 'تأكيد الاعتماد الرسمي ✓' : 'إرسال طلب التعديل للمعلم ↵'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
