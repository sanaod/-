import React, { useState, useMemo } from 'react';
import { LessonPlan, EducationalResource } from '../types/lessonPlan';
import { UserRole } from '../types/roleDashboards';
import {
  BookOpen,
  PlusCircle,
  FolderOpen,
  Library,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Printer,
  FileDown,
  Share2,
  ShieldCheck,
  School,
  User,
  Bell,
  ChevronDown,
  Boxes,
  CalendarRange,
  FileCheck2,
  Award,
  Layers,
  Activity,
  TrendingUp,
  HelpCircle,
  Check,
  Archive,
} from 'lucide-react';
import { toArabicDigits, toArabicPercent, formatDateDMY } from '../utils/arabicNumerals';

interface AbqoorHomeDashboardProps {
  plans: LessonPlan[];
  resources: EducationalResource[];
  activePlanId: string;
  onSelectPlan: (id: string) => void;
  onOpenEditor: () => void;
  onOpenAiGenerator: () => void;
  onOpenUnitPlanModal: () => void;
  onOpenSemesterPlanModal: () => void;
  onOpenWorksheetModal: () => void;
  onOpenAssessmentModal: () => void;
  onOpenAuthenticTaskModal: () => void;
  onOpenRubricModal: () => void;
  onOpenPrintView: () => void;
  onOpenResourcesModal: () => void;
  onOpenExportModal: () => void;
  onOpenShareModal: () => void;
  onOpenBlankTemplateModal: () => void;
  onNewBlankPlan: () => void;
  onDeletePlan: (id: string) => void;
  onOpenPalestinianOerHub: () => void;
  onOpenCompetenciesModal: () => void;
  onOpenSmartGuideModal: () => void;
  onOpenReportsCenter: (tab?: string) => void;
  onOpenAbacusModal: () => void;
  onOpenBackupRestore: () => void;
  onOpenAssessmentSimulatorModal: () => void;
  onOpenAcademicMilestonesModal: () => void;
  onOpenAndroidAppModal: () => void;
  onOpenIntegrationToolModal?: () => void;
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  onToggleArchivePlan: (id: string) => void;
  onOpenArchiveModal: () => void;
}

export const AbqoorHomeDashboard: React.FC<AbqoorHomeDashboardProps> = ({
  plans,
  resources,
  activePlanId,
  onSelectPlan,
  onOpenEditor,
  onOpenAiGenerator,
  onOpenUnitPlanModal,
  onOpenSemesterPlanModal,
  onOpenWorksheetModal,
  onOpenAssessmentModal,
  onOpenAuthenticTaskModal,
  onOpenRubricModal,
  onOpenPrintView,
  onOpenResourcesModal,
  onOpenExportModal,
  onOpenShareModal,
  onOpenBlankTemplateModal,
  onNewBlankPlan,
  onDeletePlan,
  onOpenPalestinianOerHub,
  onOpenCompetenciesModal,
  onOpenSmartGuideModal,
  onOpenReportsCenter,
  onOpenAbacusModal,
  onOpenBackupRestore,
  onOpenAssessmentSimulatorModal,
  onOpenAcademicMilestonesModal,
  onOpenAndroidAppModal,
  onOpenIntegrationToolModal,
  currentRole,
  onChangeRole,
  onToggleArchivePlan,
  onOpenArchiveModal,
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [activePlansTab, setActivePlansTab] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [activeLibraryTab, setActiveLibraryTab] = useState<'competencies' | 'resources' | 'templates' | 'groups'>('competencies');
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);

  // Compute metrics (excluding archived plans from active dashboard)
  const activePlans = useMemo(() => plans.filter((p) => !p.isArchived), [plans]);
  const archivedPlansCount = useMemo(() => plans.filter((p) => p.isArchived).length, [plans]);
  const totalPlansCount = activePlans.length;
  const completedPlans = activePlans.filter((p) => p.section6Signatures?.educationalSupervisor?.name || p.header?.lessonTitle);
  const inProgressPlans = activePlans.filter((p) => !p.section6Signatures?.educationalSupervisor?.name);

  const completionRate = totalPlansCount > 0 ? Math.round((completedPlans.length / totalPlansCount) * 100) : 80;

  // Role info and labels
  const roleInfo = {
    teacher: { name: 'الأستاذ المعلم', badge: '🟢 معلم', desc: 'إعداد وتحضير الخطط الصفية وفق المنهاج الفلسطيني ومصادر OER' },
    supervisor: { name: 'المشرف التربوي', badge: '🔵 مشرف', desc: 'متابعة واعتماد خطط المعلمين وإرشادهم ميدانياً' },
    principal: { name: 'مدير المدرسة', badge: '🟠 مدير', desc: 'متابعة مؤشرات الأداء المؤسسي وتقارير الجودة' },
  }[currentRole];

  // Filtered plans based on tab
  const displayedPlans = useMemo(() => {
    if (activePlansTab === 'completed') return completedPlans;
    if (activePlansTab === 'in_progress') return inProgressPlans;
    return plans;
  }, [plans, activePlansTab, completedPlans, inProgressPlans]);

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-900 font-['Cairo',sans-serif] flex flex-col">
      
      {/* 1. FIXED TOP BAR (الشعار → الرئيسية → مساعدتي → حسابي) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo & System Title */}
          <div className="flex items-center gap-3">
            <img
              src="/abqoor_logo.jpg"
              alt="عبقور"
              className="w-10 h-10 rounded-full object-cover border-2 border-emerald-600 shadow-xs bg-white"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/logo.png';
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900 font-['Tajawal']">
                  منظومة عبقور
                </h1>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-extrabold">
                  منهاج فلسطين 🇵🇸
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">التعليم المستند إلى مصادر OER</p>
            </div>
          </div>

          {/* Navigation Items: الشعار → الرئيسية → مساعدتي → حسابي */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* الرئيسية */}
            <button
              type="button"
              onClick={onOpenEditor}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>الرئيسية</span>
            </button>

            {/* مساعدتي (مرشد عبقور) */}
            <button
              type="button"
              onClick={onOpenSmartGuideModal}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>مساعدتي</span>
            </button>

            {/* الأرشيف */}
            <button
              type="button"
              onClick={onOpenArchiveModal}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              title="أرشيف الخطط الدراسية القديمة غير النشطة"
            >
              <Archive className="w-3.5 h-3.5 text-amber-600" />
              <span>الأرشيف ({toArabicDigits(archivedPlansCount)})</span>
            </button>

            {/* حسابي / الدور */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <span className="hidden md:inline-block text-[11px] font-bold text-slate-700 px-2">حسابي:</span>
              <button
                type="button"
                onClick={() => onChangeRole(currentRole === 'teacher' ? 'supervisor' : currentRole === 'supervisor' ? 'principal' : 'teacher')}
                className="px-2.5 py-1 bg-emerald-700 text-white rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1"
                title="تغيير الدور (معلم / مشرف / مدير)"
              >
                <span>{roleInfo.badge}</span>
              </button>
            </div>

            {/* Auto-save status indicator: محفوظ تلقائياً */}
            <div className="hidden lg:flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>محفوظ ✅</span>
            </div>

          </div>

        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Welcome & Role Status */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-emerald-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-block px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/40">
              {roleInfo.badge}
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-['Tajawal'] tracking-wide">
              أهلاً بك، {roleInfo.name} 🇵🇸
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-xl">
              {roleInfo.desc}. النظام يحفظ كل تعديلاتك تلقائياً دون الحاجة لضغط زر حفظ.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-emerald-500/30 shrink-0">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-black text-base border border-emerald-500/40">
              {toArabicPercent(completionRate)}
            </div>
            <div>
              <span className="text-[11px] text-slate-300 font-bold block">نسبة الإنجاز الكفائي</span>
              <span className="text-xs font-black text-amber-300 flex items-center gap-1 mt-0.5">
                <span>تحديث لحظي ✅</span>
              </span>
            </div>
          </div>
        </div>

        {/* OER Smart Guidance Notice */}
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
          <div className="p-2 bg-amber-500 text-slate-950 rounded-xl shrink-0 mt-0.5 font-black">
            💡
          </div>
          <div className="space-y-1 flex-1">
            <h4 className="text-xs sm:text-sm font-black text-amber-950">
              توجيه OER الذكي (حسب دورك الحالي):
            </h4>
            <p className="text-xs text-amber-900 leading-relaxed font-medium">
              {currentRole === 'teacher' && 'التزم بربط كل خطة درس بكفاية معتمدة من منهاج الصفوف ١-٤ ومصدرين معتمدين (بوابة التعلم الإلكتروني أو روافد).'}
              {currentRole === 'supervisor' && 'لديك ٣ خطط صفية بانتظار الاعتماد الميداني ومطابقة معايير مصادر التعلم المفتوحة.'}
              {currentRole === 'principal' && 'نسبة التزام المدرسة بتطبيق نموذج OER بلغت ٨٨٪ مع تقارير فصلية جاهزة للتصدير.'}
            </p>
          </div>
        </div>

        {/* 2. الشاشة الرئيسية تعرض ثلاثة خيارات فقط (Three Main Options ONLY) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Option 1: 🟢 أنشئ خطة جديدة */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-emerald-500/40 hover:border-emerald-600 hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-black text-slate-900 font-['Tajawal']">
                  🟢 أنشئ خطة جديدة
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  خطوات مبسطة متتالية لإنشاء وتوليد خطة درس رسمية متوافقة مع نموذج وزارة التربية والتعليم.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={onOpenEditor}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <span>ابدأ خطوة التحضير</span>
                <ArrowRight className="w-4 h-4 text-emerald-200" />
              </button>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <button onClick={onOpenAiGenerator} className="hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>توليد ذكي بالـ AI</span>
                </button>
                <button onClick={onNewBlankPlan} className="hover:text-purple-700 font-bold cursor-pointer text-purple-700 flex items-center gap-1">
                  <span>⭐ نماذج التحضير (عبقور)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Option 2: 📂 خططي */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-blue-500/40 hover:border-blue-600 hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                <FolderOpen className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-black text-slate-900 font-['Tajawal']">
                  📂 خططي (قيد العمل / مكتملة)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  استعراض الخطط المصنفة بلون مميز: أخضر للمكتمل، وأصفر للجارية قيد العمل.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-center text-xs font-bold">
                <button
                  onClick={() => setActivePlansTab('in_progress')}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    activePlansTab === 'in_progress' ? 'bg-amber-100 border-amber-300 text-amber-900 font-black' : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}
                >
                  قيد العمل ({toArabicDigits(inProgressPlans.length)}) 🟡
                </button>
                <button
                  onClick={() => setActivePlansTab('completed')}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    activePlansTab === 'completed' ? 'bg-emerald-100 border-emerald-300 text-emerald-900 font-black' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}
                >
                  مكتملة ({toArabicDigits(completedPlans.length)}) 🟢
                </button>
              </div>

              <button
                type="button"
                onClick={onOpenEditor}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <span>استعراض وإدارة الخطط</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </button>
            </div>
          </div>

          {/* Option 3: 📚 المكتبة */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-amber-500/40 hover:border-amber-600 hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all">
                <Library className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-black text-slate-900 font-['Tajawal']">
                  📚 المكتبة (كفايات • مصادر)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  قائمة بسيطة لمكتبة الكفايات الوطنية الفلسطينية، مصادر OER المعتمدة، والقوالب الاسترشادية.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-center text-xs font-bold">
                <button
                  onClick={onOpenCompetenciesModal}
                  className="p-2 bg-slate-100 hover:bg-amber-50 text-slate-800 rounded-xl border border-slate-200 transition-all cursor-pointer"
                >
                  كفايات المنهاج 🎯
                </button>
                <button
                  onClick={onOpenPalestinianOerHub}
                  className="p-2 bg-slate-100 hover:bg-amber-50 text-slate-800 rounded-xl border border-slate-200 transition-all cursor-pointer"
                >
                  مصادر OER 🇵🇸
                </button>
              </div>

              <button
                type="button"
                onClick={onOpenPalestinianOerHub}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <span>فتح المكتبة الشاملة</span>
                <ArrowRight className="w-4 h-4 text-amber-200" />
              </button>
            </div>
          </div>

        </div>

        {/* Quick Glance Statistics */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-slate-900 font-['Tajawal'] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>نظرة سريعة (أرقام الإنجاز الفوري)</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-bold">تحديث تلقائي</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div onClick={onOpenEditor} className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-center cursor-pointer hover:bg-emerald-100 transition-all">
              <span className="text-2xl font-black text-emerald-800 font-['Tajawal'] block">{toArabicDigits(totalPlansCount)}</span>
              <span className="text-xs font-bold text-emerald-900 mt-1 block">إجمالي الخطط</span>
            </div>
            <div onClick={onOpenEditor} className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl text-center cursor-pointer hover:bg-blue-100 transition-all">
              <span className="text-2xl font-black text-blue-800 font-['Tajawal'] block">{toArabicDigits(completedPlans.length)}</span>
              <span className="text-xs font-bold text-blue-900 mt-1 block">مكتملة 🟢</span>
            </div>
            <div onClick={onOpenResourcesModal} className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-center cursor-pointer hover:bg-amber-100 transition-all">
              <span className="text-2xl font-black text-amber-800 font-['Tajawal'] block">{toArabicDigits(resources.length)}</span>
              <span className="text-xs font-bold text-amber-900 mt-1 block">مصادر OER 📚</span>
            </div>
            <div onClick={() => onOpenReportsCenter('official_lesson_plan')} className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl text-center cursor-pointer hover:bg-purple-100 transition-all">
              <span className="text-2xl font-black text-purple-800 font-['Tajawal'] block">{toArabicPercent(completionRate)}</span>
              <span className="text-xs font-bold text-purple-900 mt-1 block">نسبة الإنجاز 🎯</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-slate-900 font-['Tajawal'] flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>آخر النشاطات والإجراءات</span>
            </h3>
            <button onClick={onOpenEditor} className="text-xs font-bold text-emerald-700 hover:underline">
              عرض الكل ←
            </button>
          </div>

          <div className="space-y-2">
            {activePlans.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">لا توجد خطط نشطة حالياً. كل الخطط تمت جدولتها أو أرشفتها.</p>
            ) : (
              activePlans.slice(0, 3).map((plan, idx) => (
                <div key={plan.id || idx} className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {toArabicDigits(idx + 1)}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 font-['Tajawal']">{plan.title || plan.header?.lessonTitle || 'خطة درس معتمدة'}</h4>
                      <p className="text-[11px] text-slate-500">{plan.header?.subject || 'الرياضيات'} • {plan.header?.grade || 'الصف الثالث الأساسي'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-black">
                      نشط 🟢
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectPlan(plan.id);
                        onOpenEditor();
                      }}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      فتح
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleArchivePlan(plan.id)}
                      className="p-2 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-all cursor-pointer"
                      title="نقل إلى الأرشيف لاستعادة مساحة لوحة التحكم الرئيسية"
                    >
                      <Archive className="w-4 h-4 text-amber-600" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* «المزيد» (Secondary Tools Hidden under More) */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-slate-900 font-['Tajawal'] flex items-center gap-2">
              <Boxes className="w-4 h-4 text-slate-700" />
              <span>أدوات إضافية (تحت زر المزيد)</span>
            </h3>
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <span>{showMoreMenu ? 'إخفاء الأدوات' : 'عرض المزيد'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMoreMenu ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showMoreMenu && (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 pt-3 border-t border-slate-100">
              <button onClick={onOpenAiGenerator} className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span>التحضير بالـ AI</span>
              </button>
              <button onClick={onOpenUnitPlanModal} className="p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 rounded-2xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer">
                <Boxes className="w-5 h-5 text-blue-600" />
                <span>مولد وحدة كاملة</span>
              </button>
              <button onClick={onOpenSemesterPlanModal} className="p-3 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-900 rounded-2xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer">
                <CalendarRange className="w-5 h-5 text-teal-600" />
                <span>الخطة الفصلية</span>
              </button>
              <button onClick={onOpenWorksheetModal} className="p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 rounded-2xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer">
                <FileCheck2 className="w-5 h-5 text-purple-600" />
                <span>ورقة عمل تفاعلية</span>
              </button>
              <button onClick={onOpenPrintView} className="p-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 rounded-2xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer">
                <Printer className="w-5 h-5 text-slate-700" />
                <span>طباعة PDF</span>
              </button>
              <button onClick={() => onOpenReportsCenter()} className="p-3 bg-slate-900 text-white rounded-2xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer">
                <FileDown className="w-5 h-5 text-amber-300" />
                <span>مركز التقارير</span>
              </button>
              <button onClick={onOpenIntegrationToolModal} className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-950 rounded-2xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer">
                <span className="text-xl">🐍</span>
                <span>أداة بايثون وOER</span>
              </button>
            </div>
          )}
        </div>

        {/* OER FAQ Modal or Section */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-slate-900 font-['Tajawal'] flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span>الأسئلة الشائعة حول منهجية المصادر المفتوحة OER</span>
            </h3>
            <button
              onClick={() => setFaqOpen(!faqOpen)}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              {faqOpen ? 'إغلاق الأسئلة' : 'عرض الإجابات'}
            </button>
          </div>

          {faqOpen && (
            <div className="space-y-3 pt-3 border-t border-slate-100 text-xs text-slate-700 leading-relaxed">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="font-black text-slate-900">س ١: ما المقصود بمصادر التعلم المفتوحة OER في المنهاج الفلسطيني؟</p>
                <p className="mt-1 text-slate-600">هي المواد التعليمية والمقررات الرقمية المتاحة ضمن تراخيص تسمح للجميع بإعادة استخدامها وتكييفها، مثل بوابة التعلم الإلكتروني الفلسطينية ومنصة روافد.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="font-black text-slate-900">س ٢: كيف أضمن توافق خطتي مع معايير وزارة التربية والتعليم؟</p>
                <p className="mt-1 text-slate-600">من خلال ربط الهدف بكفاية وطنية معتمدة للصفوف ١-٤ واستخدام «مرشد عبقور» للتدقيق الآلي الفوري.</p>
              </div>
            </div>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 mt-auto">
        <p>منظومة عبقور للتخطيط التربوي وتوظيف مصادر OER © ٢٠٢٦ • وزارة التربية والتعليم العالي • فلسطين 🇵🇸</p>
      </footer>
    </div>
  );
};
