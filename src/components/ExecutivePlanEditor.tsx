import React, { useState, useEffect, useRef } from 'react';
import {
  LessonPlan,
  ExecutivePlanData,
  ExecutiveStage,
  STANDARD_GRADES,
  EDUCATIONAL_STAGES,
} from '../types/lessonPlan';
import {
  Sparkles,
  Target,
  Clock,
  Compass,
  CheckCircle2,
  BookOpen,
  Award,
  Layers,
  HelpCircle,
  Plus,
  Trash2,
  Calendar,
  CalendarDays,
  FileCheck2,
  CheckSquare,
  Square,
  Users2,
  Video,
  Lightbulb,
  FileText,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  GraduationCap,
  Share2,
} from 'lucide-react';
import { toArabicDigits, formatDateDMY } from '../utils/arabicNumerals';
import {
  getNextTeachingDays,
  PALESTINIAN_MINISTRY_HOLIDAYS,
  formatDateToIso,
} from '../utils/palestinianCalendar';
import { parseDateParts, getStageOrdinal, formatStageNameWithOrdinal } from '../utils/executivePlanDefaults';
import { getCurrentSemesterName } from '../utils/academicYear';
import { AcademicYearAgendaModal } from './AcademicYearAgendaModal';
import { EducationalStagePickerModal } from './EducationalStagePickerModal';
import { Section6SignaturesCard } from './Section6SignaturesCard';
import { PinSectionButton } from './PinSectionButton';

interface ExecutivePlanEditorProps {
  plan: LessonPlan;
  onChange: (updatedPlan: LessonPlan) => void;
  onOpenUnitPlanModal?: () => void;
  onOpenResourcesModal?: () => void;
  onOpenAiModal?: () => void;
  onOpenShareModal?: () => void;
  pinnedSections?: string[];
  onTogglePinSection?: (sectionId: string) => void;
}

export const ExecutivePlanEditor: React.FC<ExecutivePlanEditorProps> = ({
  plan,
  onChange,
  onOpenUnitPlanModal,
  onOpenResourcesModal,
  onOpenAiModal,
  onOpenShareModal,
  pinnedSections = [],
  onTogglePinSection,
}) => {
  const data: ExecutivePlanData = plan.executiveData!;

  const handleUpdate = (updatedData: ExecutivePlanData) => {
    onChange({
      ...plan,
      executiveData: updatedData,
    });
  };

  const updateStage = (stageId: number, updater: (stage: ExecutiveStage) => ExecutiveStage) => {
    const newStages = data.executiveStages.map((st) => (st.id === stageId ? updater(st) : st));
    handleUpdate({
      ...data,
      executiveStages: newStages,
    });
  };

  // Quick state for collapsing sections if user wants
  const [activeStageTab, setActiveStageTab] = useState<number | 'all'>('all');

  const startDatePickerRef = useRef<HTMLInputElement>(null);
  const endDatePickerRef = useRef<HTMLInputElement>(null);

  // Apply today's date automatically
  const applyTodayDateAutomatically = () => {
    const today = new Date();
    const todayIso = today.toISOString().split('T')[0];
    const sParts = parseDateParts(todayIso);

    const totalPeriods = Math.max(1, Number(plan.header.totalPeriods) || 2);
    const nextTeaching = getNextTeachingDays(todayIso, totalPeriods, PALESTINIAN_MINISTRY_HOLIDAYS);
    const eParts = parseDateParts(nextTeaching.endDate);

    const updatedTimeframe = {
      ...data.timeframeDetails,
      startDay: sParts.day,
      startDate: sParts.date,
      startSemester: sParts.semester,
      startYear: sParts.year,
      endDay: eParts.day,
      endDate: eParts.date,
      endSemester: eParts.semester,
      endYear: eParts.year,
      autoUpdateDate: true,
    };

    onChange({
      ...plan,
      header: {
        ...plan.header,
        date: sParts.date,
        startDate: todayIso,
        endDate: nextTeaching.endDate,
        semester: sParts.semester,
      },
      executiveData: {
        ...data,
        timeframeDetails: updatedTimeframe,
      },
    });
  };

  // Run auto-update if requested or on initial load if dates or semester are missing or legacy default
  useEffect(() => {
    if (
      data.timeframeDetails.autoUpdateDate !== false &&
      (!data.timeframeDetails.startDate ||
        !data.timeframeDetails.startSemester ||
        data.timeframeDetails.startDate.includes('...') ||
        data.timeframeDetails.startDate === '15/10/2026')
    ) {
      applyTodayDateAutomatically();
    }
  }, []);

  const handleStartDatePickerChange = (isoDate: string) => {
    if (!isoDate) return;
    const sParts = parseDateParts(isoDate);
    const totalPeriods = Math.max(1, Number(plan.header.totalPeriods) || 2);
    const nextTeaching = getNextTeachingDays(isoDate, totalPeriods, PALESTINIAN_MINISTRY_HOLIDAYS);
    const eParts = parseDateParts(nextTeaching.endDate);

    const updatedTimeframe = {
      ...data.timeframeDetails,
      startDay: sParts.day,
      startDate: sParts.date,
      startSemester: sParts.semester,
      startYear: sParts.year,
      endDay: eParts.day,
      endDate: eParts.date,
      endSemester: eParts.semester,
      endYear: eParts.year,
    };

    onChange({
      ...plan,
      header: {
        ...plan.header,
        startDate: isoDate,
        endDate: nextTeaching.endDate,
        date: sParts.date,
        semester: sParts.semester,
      },
      executiveData: {
        ...data,
        timeframeDetails: updatedTimeframe,
      },
    });
  };

  const handleEndDatePickerChange = (isoDate: string) => {
    if (!isoDate) return;
    const eParts = parseDateParts(isoDate);
    const updatedTimeframe = {
      ...data.timeframeDetails,
      endDay: eParts.day,
      endDate: eParts.date,
      endSemester: eParts.semester,
      endYear: eParts.year,
    };

    onChange({
      ...plan,
      header: {
        ...plan.header,
        endDate: isoDate,
      },
      executiveData: {
        ...data,
        timeframeDetails: updatedTimeframe,
      },
    });
  };

  const handleStartDateTextChange = (text: string) => {
    const sParts = parseDateParts(text);
    const updatedTimeframe = {
      ...data.timeframeDetails,
      startDate: text,
      startDay: sParts.day || data.timeframeDetails.startDay,
      startSemester: sParts.semester || data.timeframeDetails.startSemester || 'الفصل الدراسي الأول',
      startYear: sParts.year || data.timeframeDetails.startYear,
    };
    handleUpdate({
      ...data,
      timeframeDetails: updatedTimeframe,
    });
  };

  const handleEndDateTextChange = (text: string) => {
    const eParts = parseDateParts(text);
    const updatedTimeframe = {
      ...data.timeframeDetails,
      endDate: text,
      endDay: eParts.day || data.timeframeDetails.endDay,
      endSemester: eParts.semester || data.timeframeDetails.endSemester || 'الفصل الدراسي الأول',
      endYear: eParts.year || data.timeframeDetails.endYear,
    };
    handleUpdate({
      ...data,
      timeframeDetails: updatedTimeframe,
    });
  };

  // Academic Year Agenda Modal State & Handlers
  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);
  const [agendaTargetField, setAgendaTargetField] = useState<'start' | 'end'>('start');
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);

  const openAgendaModal = (target: 'start' | 'end') => {
    setAgendaTargetField(target);
    setIsAgendaModalOpen(true);
  };

  const handleAgendaSelectDate = (target: 'start' | 'end', isoDate: string) => {
    if (target === 'start') {
      handleStartDatePickerChange(isoDate);
    } else {
      handleEndDatePickerChange(isoDate);
    }
  };

  const handleAgendaSelectRange = (startIso: string, endIso: string) => {
    const sParts = parseDateParts(startIso);
    const eParts = parseDateParts(endIso);
    const updatedTimeframe = {
      ...data.timeframeDetails,
      startDay: sParts.day,
      startDate: sParts.date,
      startSemester: sParts.semester,
      startYear: sParts.year,
      endDay: eParts.day,
      endDate: eParts.date,
      endSemester: eParts.semester,
      endYear: eParts.year,
      autoUpdateDate: true,
    };

    onChange({
      ...plan,
      header: {
        ...plan.header,
        startDate: startIso,
        endDate: endIso,
        date: sParts.date,
        semester: sParts.semester,
      },
      executiveData: {
        ...data,
        timeframeDetails: updatedTimeframe,
      },
    });
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* 1. Official Header Card: المؤسسة والبيانات العامة والترويسة الرسمية */}
      <div
        id="sec-exec-1"
        className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all duration-300 ${
          pinnedSections.includes('sec-exec-1')
            ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-md'
            : 'border-slate-200'
        }`}
      >
        <div className="bg-linear-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="min-w-14 px-3 h-10 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-md text-sm sm:text-base">
              أولاً
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-1">
                ⭐ النموذج الرئيسي المعتمد (SMART + GRASPS)
              </div>
              <h2 className="text-lg sm:text-xl font-black">أولاً: البيانات العامة وكفايات التعلّم والأهداف</h2>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {onTogglePinSection && (
              <PinSectionButton
                sectionId="sec-exec-1"
                sectionTitle="البيانات العامة والأهداف الذكية"
                isPinned={pinnedSections.includes('sec-exec-1')}
                onToggle={onTogglePinSection}
                variant="dark"
              />
            )}
            {onOpenAiModal && (
              <button
                type="button"
                onClick={onOpenAiModal}
                title="توليد وتعبئة خطة تحضير الدرس بالذكاء الاصطناعي وفق المعايير الوزارية"
                className="px-3.5 py-1.5 bg-linear-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer border border-amber-300 group"
              >
                <Sparkles className="w-4 h-4 text-emerald-950 group-hover:rotate-12 transition-transform" />
                <span>توليد التحضير (AI)</span>
              </button>
            )}
            {onOpenUnitPlanModal && (
              <button
                type="button"
                onClick={onOpenUnitPlanModal}
                className="px-3 py-1.5 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>تحضير الوحدة الكاملة</span>
              </button>
            )}
            {onOpenShareModal && (
              <button
                type="button"
                onClick={onOpenShareModal}
                title="مشاركة الخطة مع الزملاء عبر تطبيقات المراسلة (Web Share API)"
                className="px-3.5 py-1.5 bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-xs border border-emerald-400/40 cursor-pointer active:scale-95"
              >
                <Share2 className="w-4 h-4 text-emerald-200" />
                <span>مشاركة الخطة 📱</span>
              </button>
            )}
          </div>
        </div>

        {/* Pinned Section Notification Banner */}
        {pinnedSections.includes('sec-exec-1') && (
          <div className="bg-amber-400/15 border-b border-amber-400/40 px-4 py-2 flex items-center justify-between text-xs text-amber-950 font-bold">
            <div className="flex items-center gap-2">
              <span className="text-base">📌</span>
              <span>هذا القسم مُثبّت: يظل محتوى الأهداف الذكية وبيانات الدرس معروضاً أمامك في الشريط العائم أثناء كتابة باقي مراحل الخطة.</span>
            </div>
            {onTogglePinSection && (
              <button
                type="button"
                onClick={() => onTogglePinSection('sec-exec-1')}
                className="text-[11px] text-amber-900 font-black hover:underline cursor-pointer bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded border border-amber-300"
              >
                إلغاء التثبيت ✕
              </button>
            )}
          </div>
        )}

        <div className="p-4 sm:p-6 space-y-6">
          {/* Main Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">المبحث:</label>
              <input
                type="text"
                value={plan.header.subject}
                onChange={(e) =>
                  onChange({
                    ...plan,
                    header: { ...plan.header, subject: e.target.value },
                  })
                }
                placeholder="مثال: الرياضيات"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-600">الصف الدراسي:</label>
                <button
                  type="button"
                  onClick={() => setIsGradeModalOpen(true)}
                  className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 transition-all shadow-2xs cursor-pointer"
                  title="استعراض واختيار الصف لكافة المراحل التعليمية"
                >
                  <GraduationCap className="w-3 h-3 text-emerald-700" />
                  <span>كافة المراحل 🎓</span>
                </button>
              </div>
              <input
                type="text"
                list="executive-grade-datalist"
                value={plan.header.grade}
                onChange={(e) =>
                  onChange({
                    ...plan,
                    header: { ...plan.header, grade: e.target.value },
                  })
                }
                placeholder="الصف لجميع المراحل (اختر أو اكتب)"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <datalist id="executive-grade-datalist">
                {STANDARD_GRADES.map((g) => (
                  <option key={g} value={g} />
                ))}
              </datalist>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-600">عنوان الدرس / الوحدة:</label>
                {onOpenAiModal && (
                  <button
                    type="button"
                    onClick={onOpenAiModal}
                    className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                    title="توليد وتعبئة خطة الدرس بالذكاء الاصطناعي"
                  >
                    <Sparkles className="w-3 h-3 text-amber-700" />
                    <span>توليد التحضير 🪄</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                value={plan.header.lessonTitle}
                onChange={(e) =>
                  onChange({
                    ...plan,
                    title: e.target.value ? `خطة: ${e.target.value}` : plan.title,
                    header: { ...plan.header, lessonTitle: e.target.value },
                  })
                }
                placeholder="مثال: القيمة المنزلية للأعداد ضمن 9999"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-emerald-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">عدد الحصص:</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={plan.header.totalPeriods}
                  onChange={(e) =>
                    onChange({
                      ...plan,
                      header: { ...plan.header, totalPeriods: Number(e.target.value) || 1 },
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <span className="text-xs font-bold text-slate-500 shrink-0">حصص</span>
              </div>
            </div>
          </div>

          {/* Timeframe Detailed Period (من: اليوم/التاريخ/الفصل الدراسي - إلى: اليوم/التاريخ/الفصل الدراسي) */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-2 border-b border-emerald-200/60">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <Calendar className="w-4 h-4 text-emerald-700" />
                <span>الفترة الزمنية وتوزيع الحصص والتواريخ:</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>تحديث التاريخ تلقائياً مفعل</span>
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => openAgendaModal('start')}
                  title="فتح أجندة العام والتقويم المدرسي المعتمد لتغيير وتحديد تواريخ الدرس"
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer border border-amber-400"
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>🗓️ أجندة العام المدرسي</span>
                </button>
                <button
                  type="button"
                  onClick={applyTodayDateAutomatically}
                  title="تحديث فوري لتواريخ اليوم الحالي وأيام الأسبوع والفصل الدراسي"
                  className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>⚡ تحديث لتاريخ اليوم تلقائياً</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* من */}
              <div className="bg-white p-3 rounded-lg border border-emerald-100 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-800">من (بداية الدرس):</span>
                  <span className="text-[10px] text-slate-500 font-medium">اليوم / التاريخ / الفصل الدراسي</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">اليوم</label>
                    <input
                      type="text"
                      value={data.timeframeDetails.startDay}
                      onChange={(e) =>
                        handleUpdate({
                          ...data,
                          timeframeDetails: { ...data.timeframeDetails, startDay: e.target.value },
                        })
                      }
                      placeholder="الأحد"
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-medium focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5 flex items-center justify-between">
                      <span>التاريخ</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openAgendaModal('start')}
                          className="px-1.5 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded text-[10px] font-bold transition-colors cursor-pointer border border-emerald-300"
                          title="فتح أجندة العام لتغيير تاريخ البداية"
                        >
                          🗓️ أجندة العام
                        </button>
                        <button
                          type="button"
                          onClick={() => startDatePickerRef.current?.showPicker ? startDatePickerRef.current.showPicker() : startDatePickerRef.current?.focus()}
                          className="text-emerald-700 hover:text-emerald-900 cursor-pointer text-xs"
                          title="اختيار من التقويم السريع"
                        >
                          📅
                        </button>
                      </div>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={data.timeframeDetails.startDate}
                        onChange={(e) => handleStartDateTextChange(e.target.value)}
                        placeholder="DD/MM/YYYY"
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-medium focus:ring-1 focus:ring-emerald-500"
                      />
                      <input
                        ref={startDatePickerRef}
                        type="date"
                        className="sr-only"
                        onChange={(e) => handleStartDatePickerChange(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">الفصل الدراسي</label>
                    <select
                      value={data.timeframeDetails.startSemester || plan.header.semester || 'الفصل الدراسي الأول'}
                      onChange={(e) => {
                        const val = e.target.value;
                        const updatedTf = {
                          ...data.timeframeDetails,
                          startSemester: val,
                          startYear: val,
                        };
                        handleUpdate({
                          ...data,
                          timeframeDetails: updatedTf,
                        });
                        onChange({
                          ...plan,
                          header: { ...plan.header, semester: val },
                          executiveData: {
                            ...data,
                            timeframeDetails: updatedTf,
                          },
                        });
                      }}
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-bold text-emerald-900 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="الفصل الدراسي الأول">الفصل الدراسي الأول</option>
                      <option value="الفصل الدراسي الثاني">الفصل الدراسي الثاني</option>
                      <option value="الفصل الصيفي">الفصل الصيفي</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* إلى */}
              <div className="bg-white p-3 rounded-lg border border-emerald-100 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-800">إلى (نهاية الدرس):</span>
                  <span className="text-[10px] text-slate-500 font-medium">اليوم / التاريخ / الفصل الدراسي</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">اليوم</label>
                    <input
                      type="text"
                      value={data.timeframeDetails.endDay}
                      onChange={(e) =>
                        handleUpdate({
                          ...data,
                          timeframeDetails: { ...data.timeframeDetails, endDay: e.target.value },
                        })
                      }
                      placeholder="الخميس"
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-medium focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5 flex items-center justify-between">
                      <span>التاريخ</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openAgendaModal('end')}
                          className="px-1.5 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded text-[10px] font-bold transition-colors cursor-pointer border border-amber-300"
                          title="فتح أجندة العام لتغيير تاريخ النهاية"
                        >
                          🗓️ أجندة العام
                        </button>
                        <button
                          type="button"
                          onClick={() => endDatePickerRef.current?.showPicker ? endDatePickerRef.current.showPicker() : endDatePickerRef.current?.focus()}
                          className="text-emerald-700 hover:text-emerald-900 cursor-pointer text-xs"
                          title="اختيار من التقويم السريع"
                        >
                          📅
                        </button>
                      </div>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={data.timeframeDetails.endDate}
                        onChange={(e) => handleEndDateTextChange(e.target.value)}
                        placeholder="DD/MM/YYYY"
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-medium focus:ring-1 focus:ring-emerald-500"
                      />
                      <input
                        ref={endDatePickerRef}
                        type="date"
                        className="sr-only"
                        onChange={(e) => handleEndDatePickerChange(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">الفصل الدراسي</label>
                    <select
                      value={data.timeframeDetails.endSemester || plan.header.semester || 'الفصل الدراسي الأول'}
                      onChange={(e) => {
                        const val = e.target.value;
                        const updatedTf = {
                          ...data.timeframeDetails,
                          endSemester: val,
                          endYear: val,
                        };
                        handleUpdate({
                          ...data,
                          timeframeDetails: updatedTf,
                        });
                        onChange({
                          ...plan,
                          executiveData: {
                            ...data,
                            timeframeDetails: updatedTf,
                          },
                        });
                      }}
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-bold text-emerald-900 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="الفصل الدراسي الأول">الفصل الدراسي الأول</option>
                      <option value="الفصل الدراسي الثاني">الفصل الدراسي الثاني</option>
                      <option value="الفصل الصيفي">الفصل الصيفي</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Competencies, Values & Learner Analysis */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">
                كفايات التعلّم (المهارات والمعارف الأساسية الخاصة بالمبحث):
              </label>
              <textarea
                rows={2}
                value={data.learningCompetencies}
                onChange={(e) =>
                  handleUpdate({
                    ...data,
                    learningCompetencies: e.target.value,
                  })
                }
                placeholder="المهارات والمعارف الأساسية الخاصة بالمبحث..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm leading-relaxed focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">
                القيم والأخلاق المراد تعزيزها (المواطنة، التعاون، الأمانة، المهارات الحياتية المراد تعزيزها):
              </label>
              <textarea
                rows={2}
                value={data.valuesAndEthics}
                onChange={(e) =>
                  handleUpdate({
                    ...data,
                    valuesAndEthics: e.target.value,
                  })
                }
                placeholder="المواطنة، التعاون، الأمانة، المهارات الحياتية..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm leading-relaxed focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* خصائص الطلبة والبيئة المحيطة */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="text-xs font-black text-slate-900 flex items-center gap-2">
                <Users2 className="w-4 h-4 text-emerald-700" />
                <span>خصائص الطلبة والبيئة المحيطة:</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  • تحليل خصائص الطلبة:
                </label>
                <textarea
                  rows={2}
                  value={data.studentCharacteristicsAnalysis}
                  onChange={(e) =>
                    handleUpdate({
                      ...data,
                      studentCharacteristicsAnalysis: e.target.value,
                    })
                  }
                  placeholder="تحليل خصائص الطلبة، المستويات، الفروق الفردية..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  • تحليل البيئة المحيطة:
                </label>
                <textarea
                  rows={2}
                  value={data.environmentalAnalysis}
                  onChange={(e) =>
                    handleUpdate({
                      ...data,
                      environmentalAnalysis: e.target.value,
                    })
                  }
                  placeholder="تحليل البيئة الصفية والمادية والتجهيزات المتاحة..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* أهداف ذكية (SMART Objectives) */}
            <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black text-sky-950 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-sky-700" />
                    <span>أهداف ذكية (SMART Objectives):</span>
                  </h3>
                  <p className="text-[11px] text-sky-800 mt-0.5">
                    محددة (Specific) • قابلة للقياس (Measurable) • قابلة للتحقيق (Achievable) • ذات صلة بالكفاية (Relevant) • محددة بزمن (Time-bound)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleUpdate({
                      ...data,
                      smartObjectives: [
                        ...data.smartObjectives,
                        `أن يتقن الطالب مهارة ${plan.header.lessonTitle} بدقة بنسبة 85%.`,
                      ],
                    })
                  }
                  className="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة هدف ذكي</span>
                </button>
              </div>

              <div className="space-y-2">
                {data.smartObjectives.map((goal, gIdx) => (
                  <div key={gIdx} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-sky-200 text-sky-900 text-xs font-black flex items-center justify-center shrink-0">
                      {toArabicDigits(gIdx + 1)}
                    </span>
                    <input
                      type="text"
                      value={goal}
                      onChange={(e) => {
                        const newGoals = [...data.smartObjectives];
                        newGoals[gIdx] = e.target.value;
                        handleUpdate({ ...data, smartObjectives: newGoals });
                      }}
                      className="flex-1 px-3 py-1.5 bg-white border border-sky-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                    {data.smartObjectives.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newGoals = data.smartObjectives.filter((_, idx) => idx !== gIdx);
                          handleUpdate({ ...data, smartObjectives: newGoals });
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                        title="حذف الهدف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. جدول تفاصيل خطة التنفيذ التنفيذية للدرس (المراحل الخمس) */}
      <div
        id="sec-exec-2"
        className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all duration-300 ${
          pinnedSections.includes('sec-exec-2')
            ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-md'
            : 'border-slate-200'
        }`}
      >
        <div className="bg-linear-to-r from-slate-900 via-emerald-950 to-teal-900 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="min-w-14 px-3 h-10 rounded-xl bg-teal-400 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-md text-sm sm:text-base">
              ثانياً
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black">ثانياً: تفاصيل خطة التنفيذ التنفيذية للدرس</h2>
              <p className="text-xs text-teal-200">
                الأهداف • الإجراءات والأنشطة • التقويم • المصادر والأدوات • الزمن
              </p>
            </div>
          </div>

          {/* Filter / Nav tabs for stages & AI generation */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 flex-wrap">
            {onTogglePinSection && (
              <PinSectionButton
                sectionId="sec-exec-2"
                sectionTitle="خطة التنفيذ ومراحل الدرس"
                isPinned={pinnedSections.includes('sec-exec-2')}
                onToggle={onTogglePinSection}
                variant="dark"
              />
            )}
            {onOpenAiModal && (
              <button
                type="button"
                onClick={onOpenAiModal}
                className="px-2.5 py-1 rounded-lg text-xs font-black bg-linear-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 transition-all flex items-center gap-1.5 shrink-0 shadow-2xs border border-amber-300 cursor-pointer"
                title="توليد أنشطة وإجراءات التحضير بالذكاء الاصطناعي"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                <span>توليد التحضير (AI)</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveStageTab('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                activeStageTab === 'all'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              جميع المراحل (٥)
            </button>
            {data.executiveStages.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setActiveStageTab(st.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  activeStageTab === st.id
                    ? 'bg-teal-400 text-slate-950 shadow-xs'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {getStageOrdinal(st.id)}
              </button>
            ))}
          </div>
        </div>

        {/* Pinned Section Notification Banner */}
        {pinnedSections.includes('sec-exec-2') && (
          <div className="bg-amber-400/15 border-b border-amber-400/40 px-4 py-2 flex items-center justify-between text-xs text-amber-950 font-bold">
            <div className="flex items-center gap-2">
              <span className="text-base">📌</span>
              <span>هذا القسم مُثبّت: تظل مراحل الحصة والأنشطة والزمن معروضة أمامك في الشريط العائم أثناء التمرير.</span>
            </div>
            {onTogglePinSection && (
              <button
                type="button"
                onClick={() => onTogglePinSection('sec-exec-2')}
                className="text-[11px] text-amber-900 font-black hover:underline cursor-pointer bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded border border-amber-300"
              >
                إلغاء التثبيت ✕
              </button>
            )}
          </div>
        )}

        {/* Detailed Stages List */}
        <div className="p-4 sm:p-6 space-y-6">
          {data.executiveStages
            .filter((st) => activeStageTab === 'all' || activeStageTab === st.id)
            .map((stage) => {
              return (
                <div
                  key={stage.id}
                  className="rounded-xl border-2 border-slate-200 overflow-hidden shadow-xs hover:border-emerald-500/50 transition-all bg-white"
                >
                  {/* Stage Top Bar */}
                  <div className="bg-slate-100 p-3.5 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 h-7 rounded-lg bg-emerald-800 text-white font-black text-xs flex items-center justify-center shrink-0">
                        {getStageOrdinal(stage.id)}
                      </span>
                      <h3 className="text-sm sm:text-base font-black text-slate-900">
                        {formatStageNameWithOrdinal(stage.stageName, stage.id)}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-emerald-700" />
                        الزمن:
                      </span>
                      <input
                        type="number"
                        min="1"
                        max="90"
                        value={stage.durationMinutes}
                        onChange={(e) =>
                          updateStage(stage.id, (st) => ({
                            ...st,
                            durationMinutes: Number(e.target.value) || 5,
                          }))
                        }
                        className="w-16 px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold text-center focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                      <span className="text-xs font-bold text-slate-500">دقيقة</span>
                    </div>
                  </div>

                  {/* Stage Content Grid */}
                  <div className="p-4 sm:p-5 space-y-4">
                    {/* Goals Row */}
                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1">الأهداف:</label>
                      <textarea
                        rows={2}
                        value={stage.goals}
                        onChange={(e) =>
                          updateStage(stage.id, (st) => ({
                            ...st,
                            goals: e.target.value,
                          }))
                        }
                        placeholder="الأهداف المحددة لهذه المرحلة من الدرس..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    {/* Procedures and Activities (Specific to stage) */}
                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200/60 space-y-3">
                      <label className="block text-xs font-black text-emerald-950">
                        الإجراءات والأنشطة:
                      </label>

                      <textarea
                        rows={3}
                        value={stage.procedures.mainDescription}
                        onChange={(e) =>
                          updateStage(stage.id, (st) => ({
                            ...st,
                            procedures: {
                              ...st.procedures,
                              mainDescription: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-xs leading-relaxed font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />

                      {/* STAGE 1 Specific Inputs: المصدر التعليمي، أسئلة تأملية، وشروط اختيار المصدر */}
                      {stage.id === 1 && (
                        <div className="space-y-3 pt-2 border-t border-emerald-200/60">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                • اسم المصدر التعليمي:
                              </label>
                              <input
                                type="text"
                                value={stage.procedures.resourceName || ''}
                                onChange={(e) =>
                                  updateStage(1, (st) => ({
                                    ...st,
                                    procedures: {
                                      ...st.procedures,
                                      resourceName: e.target.value,
                                    },
                                  }))
                                }
                                placeholder="فيديو تعليمي تفاعلي، مجسم معداد، لعبة حركية..."
                                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                • مثال أسئلة تأملية حول المصدر:
                              </label>
                              <input
                                type="text"
                                value={stage.procedures.reflectiveQuestionsExample || ''}
                                onChange={(e) =>
                                  updateStage(1, (st) => ({
                                    ...st,
                                    procedures: {
                                      ...st.procedures,
                                      reflectiveQuestionsExample: e.target.value,
                                    },
                                  }))
                                }
                                placeholder="ما العلاقة بين ما شاهدتموه ومفهوم درسنا اليوم؟"
                                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                              />
                            </div>
                          </div>

                          {/* شروط اختيار المصدر التعليمي (Checkboxes matching PDF) */}
                          <div className="bg-white p-3 rounded-lg border border-emerald-200/80">
                            <div className="text-[11px] font-black text-emerald-900 mb-2">
                              شروط اختيار المصدر التعليمي:
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {[
                                { key: 'competencyAlignment', label: 'الارتباط بالكفايات' },
                                { key: 'contentAccuracy', label: 'دقة المحتوى' },
                                { key: 'languageIntegrity', label: 'سلامة اللغة' },
                                { key: 'ageAppropriate', label: 'المواءمة مع المرحلة العمرية' },
                                { key: 'palestinianCulture', label: 'المواءمة مع الثقافة الفلسطينية' },
                                { key: 'integrationValues', label: 'تعزيز التكامل والمواطنة والقيم والأخلاق' },
                              ].map((cond) => {
                                const currentChecked =
                                  stage.procedures.resourceConditions?.[
                                    cond.key as keyof typeof stage.procedures.resourceConditions
                                  ] ?? true;
                                return (
                                  <label
                                    key={cond.key}
                                    className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={currentChecked}
                                      onChange={(e) => {
                                        const prevConds =
                                          stage.procedures.resourceConditions || {
                                            competencyAlignment: true,
                                            contentAccuracy: true,
                                            languageIntegrity: true,
                                            ageAppropriate: true,
                                            palestinianCulture: true,
                                            integrationValues: true,
                                          };
                                        updateStage(1, (st) => ({
                                          ...st,
                                          procedures: {
                                            ...st.procedures,
                                            resourceConditions: {
                                              ...prevConds,
                                              [cond.key]: e.target.checked,
                                            },
                                          },
                                        }));
                                      }}
                                      className="rounded text-emerald-700 focus:ring-emerald-500 w-3.5 h-3.5"
                                    />
                                    <span>[ {currentChecked ? '✓' : ' '} ] {cond.label}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* STAGE 3 Specific Inputs: نموذج GRASPS مفصل */}
                      {stage.id === 3 && (
                        <div className="space-y-3 pt-2 border-t border-emerald-200/60">
                          <div className="bg-white p-3.5 rounded-lg border border-emerald-200">
                            <div className="text-xs font-black text-emerald-950 mb-2 flex items-center gap-1.5">
                              <Award className="w-4 h-4 text-emerald-700" />
                              <span>مهمة تقويم أصيلة مبنية على نموذج GRASPS:</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">• الهدف (Goal):</label>
                                <input
                                  type="text"
                                  value={stage.procedures.grasps?.goal || ''}
                                  onChange={(e) =>
                                    updateStage(3, (st) => ({
                                      ...st,
                                      procedures: {
                                        ...st.procedures,
                                        grasps: { ...st.procedures.grasps!, goal: e.target.value },
                                      },
                                    }))
                                  }
                                  className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">• الدور (Role):</label>
                                <input
                                  type="text"
                                  value={stage.procedures.grasps?.role || ''}
                                  onChange={(e) =>
                                    updateStage(3, (st) => ({
                                      ...st,
                                      procedures: {
                                        ...st.procedures,
                                        grasps: { ...st.procedures.grasps!, role: e.target.value },
                                      },
                                    }))
                                  }
                                  className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">• الجمهور (Audience):</label>
                                <input
                                  type="text"
                                  value={stage.procedures.grasps?.audience || ''}
                                  onChange={(e) =>
                                    updateStage(3, (st) => ({
                                      ...st,
                                      procedures: {
                                        ...st.procedures,
                                        grasps: { ...st.procedures.grasps!, audience: e.target.value },
                                      },
                                    }))
                                  }
                                  className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">• الموقف (Situation):</label>
                                <input
                                  type="text"
                                  value={stage.procedures.grasps?.situation || ''}
                                  onChange={(e) =>
                                    updateStage(3, (st) => ({
                                      ...st,
                                      procedures: {
                                        ...st.procedures,
                                        grasps: { ...st.procedures.grasps!, situation: e.target.value },
                                      },
                                    }))
                                  }
                                  className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">• الأداء والمنتج (Performance):</label>
                                <input
                                  type="text"
                                  value={stage.procedures.grasps?.performance || ''}
                                  onChange={(e) =>
                                    updateStage(3, (st) => ({
                                      ...st,
                                      procedures: {
                                        ...st.procedures,
                                        grasps: { ...st.procedures.grasps!, performance: e.target.value },
                                      },
                                    }))
                                  }
                                  className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">• المعايير (Standards):</label>
                                <input
                                  type="text"
                                  value={stage.procedures.grasps?.standards || ''}
                                  onChange={(e) =>
                                    updateStage(3, (st) => ({
                                      ...st,
                                      procedures: {
                                        ...st.procedures,
                                        grasps: { ...st.procedures.grasps!, standards: e.target.value },
                                      },
                                    }))
                                  }
                                  className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs"
                                />
                              </div>
                            </div>

                            {/* خطوات تنفيذ المهمة */}
                            <div className="mt-3 pt-3 border-t border-slate-200">
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                • خطوات تنفيذ المهمة:
                              </label>
                              <div className="space-y-1.5">
                                {(stage.procedures.grasps?.steps || ['خطوة 1', 'خطوة 2']).map((step, sIdx) => (
                                  <div key={sIdx} className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-500">{toArabicDigits(sIdx + 1)}.</span>
                                    <input
                                      type="text"
                                      value={step}
                                      onChange={(e) => {
                                        const newSteps = [...(stage.procedures.grasps?.steps || [])];
                                        newSteps[sIdx] = e.target.value;
                                        updateStage(3, (st) => ({
                                          ...st,
                                          procedures: {
                                            ...st.procedures,
                                            grasps: { ...st.procedures.grasps!, steps: newSteps },
                                          },
                                        }));
                                      }}
                                      className="flex-1 px-2.5 py-1 bg-slate-50 border border-slate-300 rounded text-xs"
                                    />
                                  </div>
                                ))}
                              </div>
                              <p className="text-[11px] font-semibold text-emerald-800 mt-2">
                                • مقياس متدرج لتقويم أداء الطلبة (سلالم التقدير ومقاييس الأداء)
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* STAGE 4 Specific Inputs: ورقة العمل التفاعلية */}
                      {stage.id === 4 && (
                        <div className="space-y-2 pt-2 border-t border-emerald-200/60">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              • كيف ستُستخدم الورقة؟
                            </label>
                            <input
                              type="text"
                              value={stage.procedures.howWorksheetUsed || ''}
                              onChange={(e) =>
                                updateStage(4, (st) => ({
                                  ...st,
                                  procedures: {
                                    ...st.procedures,
                                    howWorksheetUsed: e.target.value,
                                  },
                                }))
                              }
                              placeholder="تنفيذ فردي / جماعي، توزيع إلكتروني، تقييم أقران..."
                              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              • تقديم تغذية راجعة فورية للطلبة:
                            </label>
                            <input
                              type="text"
                              value={stage.procedures.immediateFeedback || ''}
                              onChange={(e) =>
                                updateStage(4, (st) => ({
                                  ...st,
                                  procedures: {
                                    ...st.procedures,
                                    immediateFeedback: e.target.value,
                                  },
                                }))
                              }
                              placeholder="ملاحظات فورية شفهية، بطاقات تصويب سريعة..."
                              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                            />
                          </div>
                        </div>
                      )}

                      {/* STAGE 5 Specific Inputs: الغلق (التلخيص والختام) والخيارات */}
                      {stage.id === 5 && (
                        <div className="space-y-2 pt-2 border-t border-emerald-200/60">
                          <div className="bg-white p-3 rounded-lg border border-emerald-200">
                            <div className="text-[11px] font-black text-emerald-900 mb-2">
                              غلق الدرس من خلال التلخيص وتسليط الضوء على أبرز ملامح الدرس عبر الخيارات التالية:
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {[
                                { key: 'worksheet', label: 'ورقة عمل تفاعلية' },
                                { key: 'videoSummary', label: 'فيديو يلخص الحصة' },
                                { key: 'posterOrSummaryBoard', label: 'ملصق / صورة / لوحة ملخصة' },
                                { key: 'learnedCards', label: 'بطاقات يكتب فيها ما تم تعلمه' },
                                { key: 'keyQuestionsCards', label: 'بطاقات يجيب فيها الطلبة عن الأسئلة الرئيسة' },
                                { key: 'closingCompetitions', label: 'مسابقات تعليمية ختامية' },
                              ].map((opt) => {
                                const checked =
                                  stage.procedures.closureOptions?.[
                                    opt.key as keyof typeof stage.procedures.closureOptions
                                  ] ?? false;
                                return (
                                  <label
                                    key={opt.key}
                                    className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={(e) => {
                                        const prevOpts =
                                          stage.procedures.closureOptions || {
                                            worksheet: false,
                                            videoSummary: true,
                                            posterOrSummaryBoard: true,
                                            learnedCards: true,
                                            keyQuestionsCards: true,
                                            closingCompetitions: true,
                                          };
                                        updateStage(5, (st) => ({
                                          ...st,
                                          procedures: {
                                            ...st.procedures,
                                            closureOptions: {
                                              ...prevOpts,
                                              [opt.key]: e.target.checked,
                                            },
                                          },
                                        }));
                                      }}
                                      className="rounded text-emerald-700 focus:ring-emerald-500 w-3.5 h-3.5"
                                    />
                                    <span>[ {checked ? '✓' : ' '} ] {opt.label}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Assessment & Resources Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-xs font-black text-slate-700 mb-1">التقويم:</label>
                        <textarea
                          rows={2}
                          value={stage.assessment}
                          onChange={(e) =>
                            updateStage(stage.id, (st) => ({
                              ...st,
                              assessment: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-700 mb-1">المصادر والأدوات:</label>
                        <textarea
                          rows={2}
                          value={stage.resourcesAndTools}
                          onChange={(e) =>
                            updateStage(stage.id, (st) => ({
                              ...st,
                              resourcesAndTools: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* 3. ملاحظات وتأملات المعلم حول الدرس (صفحة 4 في الوثيقة) */}
      <div
        id="sec-exec-3"
        className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all duration-300 ${
          pinnedSections.includes('sec-exec-3')
            ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-md'
            : 'border-slate-200'
        }`}
      >
        <div className="bg-linear-to-r from-amber-700 via-amber-800 to-slate-900 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="min-w-14 px-3 h-10 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-md text-sm sm:text-base">
              ثالثاً
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black">ثالثاً: ملاحظات وتأملات المعلم حول الدرس</h2>
              <p className="text-xs text-amber-200">
                نقاط القوة • جوانب تحتاج إلى تحسين وتطوير • مقترحات للدروس القادمة
              </p>
            </div>
          </div>

          {onTogglePinSection && (
            <PinSectionButton
              sectionId="sec-exec-3"
              sectionTitle="ملاحظات وتأملات المعلم"
              isPinned={pinnedSections.includes('sec-exec-3')}
              onToggle={onTogglePinSection}
              variant="dark"
            />
          )}
        </div>

        {/* Pinned Section Notification Banner */}
        {pinnedSections.includes('sec-exec-3') && (
          <div className="bg-amber-400/15 border-b border-amber-400/40 px-4 py-2 flex items-center justify-between text-xs text-amber-950 font-bold">
            <div className="flex items-center gap-2">
              <span className="text-base">📌</span>
              <span>هذا القسم مُثبّت: تظل ملاحظات وتأملات الدرس معروضة أمامك في الشريط العائم.</span>
            </div>
            {onTogglePinSection && (
              <button
                type="button"
                onClick={() => onTogglePinSection('sec-exec-3')}
                className="text-[11px] text-amber-900 font-black hover:underline cursor-pointer bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded border border-amber-300"
              >
                إلغاء التثبيت ✕
              </button>
            )}
          </div>
        )}

        <div className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-800 mb-1">
              أولاً: نقاط القوة في تنفيذ الدرس:
            </label>
            <textarea
              rows={2}
              value={data.teacherReflection.strengths}
              onChange={(e) =>
                handleUpdate({
                  ...data,
                  teacherReflection: {
                    ...data.teacherReflection,
                    strengths: e.target.value,
                  },
                })
              }
              placeholder="اكتب نقاط القوة والتفاعل الإيجابي أثناء تنفيذ الحصة..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-800 mb-1">
              ثانياً: جوانب تحتاج إلى تحسين وتطوير:
            </label>
            <textarea
              rows={2}
              value={data.teacherReflection.improvementsNeeded}
              onChange={(e) =>
                handleUpdate({
                  ...data,
                  teacherReflection: {
                    ...data.teacherReflection,
                    improvementsNeeded: e.target.value,
                  },
                })
              }
              placeholder="الفرص التحسينية والتحديات التي واجهتها أثناء التدريس..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-800 mb-1">
              ثالثاً: مقترحات للدروس القادمة:
            </label>
            <textarea
              rows={2}
              value={data.teacherReflection.futureSuggestions}
              onChange={(e) =>
                handleUpdate({
                  ...data,
                  teacherReflection: {
                    ...data.teacherReflection,
                    futureSuggestions: e.target.value,
                  },
                })
              }
              placeholder="المقترحات والتطبيقات المزمع تنفيذها في الحصص المقبلة..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 4. التوقيع والاعتماد الرسمي (كما في النموذج الثاني) */}
      <div id="sec-exec-4">
        <Section6SignaturesCard
          data={
            plan.section6Signatures || {
              teacher: {
                name: plan.header.teacherName || '',
                date: plan.header.date || plan.header.startDate || '',
                notes: '',
              },
              schoolPrincipal: {
                name: plan.header.principalName || '',
                date: plan.header.date || plan.header.startDate || '',
                directives: '',
              },
              educationalSupervisor: {
                name: plan.header.supervisorName || '',
                date: plan.header.date || plan.header.startDate || '',
                directives: '',
              },
            }
          }
          onChange={(signatures) => {
            onChange({
              ...plan,
              section6Signatures: signatures,
            });
          }}
          title="رابعاً: التوقيع والاعتماد الرسمي"
          subtitle="اعتمادات المعلم المنفذ، الإدارة المدرسية، والإشراف التربوي المعتمد"
          stepNumber="رابعاً"
          headerDefaults={{
            teacherName: plan.header.teacherName,
            principalName: plan.header.principalName,
            supervisorName: plan.header.supervisorName,
            date: plan.header.date || plan.header.startDate,
          }}
          isPinned={pinnedSections.includes('sec-exec-4')}
          onTogglePin={() => onTogglePinSection?.('sec-exec-4')}
          sectionId="sec-exec-4"
        />
      </div>

      {/* مودال أجندة العام الدراسي لتغيير التاريخ في خانتي التاريخ */}
      <AcademicYearAgendaModal
        isOpen={isAgendaModalOpen}
        onClose={() => setIsAgendaModalOpen(false)}
        initialTargetField={agendaTargetField}
        currentStartDate={data.timeframeDetails.startDate}
        currentEndDate={data.timeframeDetails.endDate}
        totalPeriods={Math.max(1, Number(plan.header.totalPeriods) || 2)}
        onSelectDate={handleAgendaSelectDate}
        onSelectRange={handleAgendaSelectRange}
      />

      {/* مودال اختيار الصف لكافة المراحل التعليمية */}
      <EducationalStagePickerModal
        isOpen={isGradeModalOpen}
        onClose={() => setIsGradeModalOpen(false)}
        selectedGrade={plan.header.grade}
        onSelectGrade={(gradeName) =>
          onChange({
            ...plan,
            header: { ...plan.header, grade: gradeName },
          })
        }
        title="تحديد الصف لكافة المراحل الدراسية (الخطة التنفيذية)"
      />
    </div>
  );
};
