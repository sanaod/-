import React, { useState } from 'react';
import {
  X,
  GraduationCap,
  Sparkles,
  CalendarDays,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowLeft,
  CalendarRange,
  ChevronLeft,
  FileText,
  Printer,
  Download,
  Users,
  Compass,
  Trophy,
  Sunrise,
  Sunset,
  Zap,
} from 'lucide-react';
import { getAcademicYearInfo } from '../utils/academicYear';
import { toArabicDigits } from '../utils/arabicNumerals';

interface AcademicYearMilestonesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSemesterPlanModal?: () => void;
  onOpenDashboard?: () => void;
  onOpenExportModal?: () => void;
  onOpenPrintView?: () => void;
}

export const AcademicYearMilestonesModal: React.FC<AcademicYearMilestonesModalProps> = ({
  isOpen,
  onClose,
  onOpenSemesterPlanModal,
  onOpenDashboard,
  onOpenExportModal,
  onOpenPrintView,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'start' | 'semester1' | 'semester2' | 'end'>('all');
  const yearInfo = getAcademicYearInfo();

  if (!isOpen) return null;

  const milestones = [
    {
      id: 'start',
      title: 'بداية العام الدراسي',
      subtitle: 'افتتاح العام وانطلاقة المناهج والتهيئة الصفية',
      timing: 'أيلول / سبتمبر (انطلاقة العام)',
      status: 'مرحلة الافتتاح',
      statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      gradient: 'from-emerald-900 via-teal-900 to-slate-900',
      border: 'border-emerald-500/60 hover:border-emerald-400',
      iconBg: 'bg-linear-to-br from-emerald-500 to-teal-600 text-white',
      badgeBg: 'bg-emerald-600/30 text-emerald-200 border-emerald-500/50',
      icon: Sunrise,
      checklist: [
        'إعداد خطة التوزيع السنوي والفصلي للمواد الموكلة',
        'تهيِئة البيئة الصفية الآمنة والمحفزة وترتيب المقاعد',
        'استلام وتوزيع الكتب المدرسية والوسائط الملموسة',
        'إجراء التشخيص الأولي واستكشاف مستويات الطلبة',
        'اللقاء التعريفي الأول مع أولياء الأمور وتوضيح الروتينات',
      ],
      actionLabel: 'إعداد خطة الافتتاح',
      action: onOpenSemesterPlanModal,
    },
    {
      id: 'semester1',
      title: 'الفصل الدراسي الأول',
      subtitle: 'التعليم النشط، متابعة النتاجات والتقويم الأول',
      timing: 'سبتمبر - يناير (١٦ أسبوعاً تعليماً)',
      status: yearInfo.semesterName.includes('الأول') ? 'الفصل الحالي الجاري' : 'مكتمل / قادم',
      statusColor: yearInfo.semesterName.includes('الأول')
        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 ring-1 ring-blue-400/50'
        : 'bg-slate-700/40 text-slate-300 border-slate-600',
      gradient: 'from-blue-950 via-indigo-950 to-slate-900',
      border: 'border-blue-500/60 hover:border-blue-400',
      iconBg: 'bg-linear-to-br from-blue-500 to-indigo-600 text-white',
      badgeBg: 'bg-blue-600/30 text-blue-200 border-blue-500/50',
      icon: BookOpen,
      checklist: [
        'تنفيذ دروس التحضير التكيفي والتنفيذي بانتظام',
        'تطبيق مهام التقويم الأصيل GRASPS في الأسبوع الـ ٨',
        'إجراء اختبارات منتصف ونهاية الفصل الدراسي الأول',
        'رصد درجات أداء الطلبة وتوثيق السجل الأكاديمي',
        'تنظيم معارض النتاجات الطلابية للفصل الأول',
      ],
      actionLabel: 'تحضير خطة الفصل الأول',
      action: onOpenSemesterPlanModal,
    },
    {
      id: 'semester2',
      title: 'الفصل الدراسي الثاني',
      subtitle: 'التعمق المهاري، المبادرات التفاعلية والتخرج',
      timing: 'فبراير - يونيو (١٦ أسبوعاً تعليماً)',
      status: yearInfo.semesterName.includes('الثاني') ? 'الفصل الحالي الجاري' : 'قادم',
      statusColor: yearInfo.semesterName.includes('الثاني')
        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 ring-1 ring-purple-400/50'
        : 'bg-slate-700/40 text-slate-300 border-slate-600',
      gradient: 'from-purple-950 via-fuchsia-950 to-slate-900',
      border: 'border-purple-500/60 hover:border-purple-400',
      iconBg: 'bg-linear-to-br from-purple-500 to-fuchsia-600 text-white',
      badgeBg: 'bg-purple-600/30 text-purple-200 border-purple-500/50',
      icon: Compass,
      checklist: [
        'استكمال النتاجات والمفاهيم المتقدمة للمناهج',
        'إطلاق المبادرات المدرسية والمشاريع التراكمية',
        'متابعة الخطط العلاجية والإثرائية الفردية',
        'تنفيذ تقويم المهارات الحياتية والتعلم القائم على المشاريع',
        'إعداد الاختبارات الختامية للفصل الثاني',
      ],
      actionLabel: 'تحضير خطة الفصل الثاني',
      action: onOpenSemesterPlanModal,
    },
    {
      id: 'end',
      title: 'نهاية العام الدراسي',
      subtitle: 'حفل الحصاد، تكريم المتفوقين والتقرير الختامي',
      timing: 'حزيران / يونيو (محطة التتويج والإنجاز)',
      status: 'مرحلة الختام والتكريم',
      statusColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      gradient: 'from-amber-950 via-rose-950 to-slate-900',
      border: 'border-amber-500/60 hover:border-amber-400',
      iconBg: 'bg-linear-to-br from-amber-500 to-rose-600 text-white',
      badgeBg: 'bg-amber-600/30 text-amber-200 border-amber-500/50',
      icon: Award,
      checklist: [
        'حساب معدلات التميز العامة واستخراج كشوف النتاجات',
        'إعداد وتصدير التقرير التجميعي الإحصائي للمعلم',
        'طباعة وتكريم الطلبة المتفوقين بشهادات تقدير وزارية',
        'أرشفة وتأمين الخطط والسجلات السنوية إلكترونياً',
        'جلسة التأمل الذاتي وتحديد التطلعات للعام الجديد',
      ],
      actionLabel: 'عرض تقرير الإنجاز الختامي',
      action: onOpenDashboard,
    },
  ];

  const filteredMilestones =
    activeTab === 'all' ? milestones : milestones.filter((m) => m.id === activeTab);

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 overflow-y-auto text-right"
    >
      <div className="bg-slate-950 border border-slate-800 text-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-linear-to-r from-emerald-950 via-teal-950 to-slate-950 p-5 border-b border-emerald-800/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <CalendarDays className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-['Tajawal'] text-white">
                  محطات العام الدراسي (بدايته، نهايته، والفصلين الأول والثاني)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {yearInfo.academicYearFormatted}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                أيقونات تفاعلية شاملة لمتابعة سير العملية التعليمية وإنجاز الخطط الرسمية
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-rose-900/60 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700 hover:border-rose-500/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Banner Illustration */}
          <div className="relative rounded-2xl overflow-hidden border border-emerald-500/30 shadow-xl group">
            <img
              src="/src/assets/images/academic_year_milestones_1791454511178.jpg"
              alt="العام الدراسي ومحطاته الرسمية"
              className="w-full h-44 sm:h-52 object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/60 to-transparent flex flex-col justify-end p-4 sm:p-6">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold mb-1">
                <Sparkles className="w-4 h-4" />
                <span>التقويم السنوي المعتمد لمنظومة التميز التربوي</span>
              </div>
              <h3 className="text-lg sm:text-2xl font-black text-white font-['Tajawal']">
                دليل الأيقونات الموحد للعام الدراسي {yearInfo.academicYearFormatted}
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl hidden sm:block">
                متابعة منظمة لبداية العام الدراسي، نتاجات الفصل الأول، انطلاقة الفصل الثاني، وتتويج الإنجازات في نهاية العام.
              </p>
            </div>
          </div>

          {/* Quick Filter Bar */}
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              عرض كافة المحطات (٤)
            </button>
            <button
              onClick={() => setActiveTab('start')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'start'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sunrise className="w-3.5 h-3.5" />
              <span>بداية العام</span>
            </button>
            <button
              onClick={() => setActiveTab('semester1')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'semester1'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>الفصل الأول</span>
            </button>
            <button
              onClick={() => setActiveTab('semester2')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'semester2'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>الفصل الثاني</span>
            </button>
            <button
              onClick={() => setActiveTab('end')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'end'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>نهاية العام</span>
            </button>
          </div>

          {/* Icon Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMilestones.map((item) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.id}
                  className={`bg-linear-to-b ${item.gradient} border ${item.border} rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group`}
                >
                  <div>
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-2xl ${item.iconBg} p-2.5 flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform`}
                        >
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold font-['Tajawal'] text-white group-hover:text-amber-300 transition-colors">
                            {item.title}
                          </h4>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold border mt-0.5 ${item.badgeBg}`}
                          >
                            {item.timing}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black border shrink-0 ${item.statusColor}`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-4">
                      {item.subtitle}
                    </p>

                    {/* Checklist */}
                    <div className="space-y-2 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 mb-4">
                      <span className="block text-[11px] font-bold text-amber-300 mb-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        المهام والأنشطة التربوية الرئيسة:
                      </span>
                      <ul className="space-y-1.5 text-xs text-slate-200">
                        {item.checklist.map((task, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Card Action */}
                  {item.action && (
                    <button
                      onClick={() => {
                        onClose();
                        item.action?.();
                      }}
                      className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-white/10 hover:border-white/30 cursor-pointer shadow-xs"
                    >
                      <span>{item.actionLabel}</span>
                      <ChevronLeft className="w-4 h-4 text-amber-300" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-900 border-t border-slate-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              الحالة الحالية المحسوبة تلقائياً: <strong className="text-emerald-400">{yearInfo.semesterName}</strong> ({yearInfo.academicYearFormatted})
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onOpenPrintView && (
              <button
                onClick={() => {
                  onClose();
                  onOpenPrintView();
                }}
                className="flex-1 sm:flex-none px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>طباعة السجل الرسمي</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
