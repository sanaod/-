import React, { useState } from 'react';
import {
  LessonPlan,
  ExecutivePlanData,
  ExecutiveStage,
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
} from 'lucide-react';
import { toArabicDigits } from '../utils/arabicNumerals';

interface ExecutivePlanEditorProps {
  plan: LessonPlan;
  onChange: (updatedPlan: LessonPlan) => void;
  onOpenUnitPlanModal?: () => void;
  onOpenResourcesModal?: () => void;
}

export const ExecutivePlanEditor: React.FC<ExecutivePlanEditorProps> = ({
  plan,
  onChange,
  onOpenUnitPlanModal,
  onOpenResourcesModal,
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

  return (
    <div className="space-y-6 text-slate-800">
      {/* 1. Official Header Card: المؤسسة والبيانات العامة والترويسة الرسمية */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-linear-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-md text-lg">
              ١
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-1">
                ⭐ النموذج الرئيسي المعتمد (SMART + GRASPS)
              </div>
              <h2 className="text-lg sm:text-xl font-black">نموذج خطة تحضير درس (البيانات العامة وكفايات التعلّم)</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onOpenUnitPlanModal && (
              <button
                type="button"
                onClick={onOpenUnitPlanModal}
                className="px-3 py-1.5 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>تحضير الوحدة الكاملة</span>
              </button>
            )}
          </div>
        </div>

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
              <label className="block text-xs font-bold text-slate-600 mb-1">الصف:</label>
              <input
                type="text"
                value={plan.header.grade}
                onChange={(e) =>
                  onChange({
                    ...plan,
                    header: { ...plan.header, grade: e.target.value },
                  })
                }
                placeholder="مثال: الثالث الأساسي"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">عنوان الدرس / الوحدة:</label>
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

          {/* Timeframe Detailed Period (من: اليوم/التاريخ/السنة - إلى: اليوم/التاريخ/السنة) */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs mb-3">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>الفترة الزمنية (توزيع الحصص والتواريخ):</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* من */}
              <div className="bg-white p-3 rounded-lg border border-emerald-100 space-y-2">
                <div className="text-xs font-black text-emerald-800">من:</div>
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
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">التاريخ</label>
                    <input
                      type="text"
                      value={data.timeframeDetails.startDate}
                      onChange={(e) =>
                        handleUpdate({
                          ...data,
                          timeframeDetails: { ...data.timeframeDetails, startDate: e.target.value },
                        })
                      }
                      placeholder="15/10/2026"
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">السنة</label>
                    <input
                      type="text"
                      value={data.timeframeDetails.startYear}
                      onChange={(e) =>
                        handleUpdate({
                          ...data,
                          timeframeDetails: { ...data.timeframeDetails, startYear: e.target.value },
                        })
                      }
                      placeholder="2026م"
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* إلى */}
              <div className="bg-white p-3 rounded-lg border border-emerald-100 space-y-2">
                <div className="text-xs font-black text-emerald-800">إلى:</div>
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
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">التاريخ</label>
                    <input
                      type="text"
                      value={data.timeframeDetails.endDate}
                      onChange={(e) =>
                        handleUpdate({
                          ...data,
                          timeframeDetails: { ...data.timeframeDetails, endDate: e.target.value },
                        })
                      }
                      placeholder="19/10/2026"
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">السنة</label>
                    <input
                      type="text"
                      value={data.timeframeDetails.endYear}
                      onChange={(e) =>
                        handleUpdate({
                          ...data,
                          timeframeDetails: { ...data.timeframeDetails, endYear: e.target.value },
                        })
                      }
                      placeholder="2026م"
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-medium"
                    />
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
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-linear-to-r from-slate-900 via-emerald-950 to-teal-900 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-400 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-md text-lg">
              ٢
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black">تفاصيل خطة التنفيذ التنفيذية للدرس</h2>
              <p className="text-xs text-teal-200">
                الأهداف • الإجراءات والأنشطة • التقويم • المصادر والأدوات • الزمن
              </p>
            </div>
          </div>

          {/* Filter / Nav tabs for stages */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
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
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  activeStageTab === st.id
                    ? 'bg-teal-400 text-slate-950 shadow-xs'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                مرحلة {toArabicDigits(st.id)}
              </button>
            ))}
          </div>
        </div>

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
                      <span className="w-7 h-7 rounded-lg bg-emerald-800 text-white font-black text-xs flex items-center justify-center shrink-0">
                        {toArabicDigits(stage.id)}
                      </span>
                      <h3 className="text-sm sm:text-base font-black text-slate-900">{stage.stageName}</h3>
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
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-linear-to-r from-amber-700 via-amber-800 to-slate-900 text-white p-4 sm:p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-md text-lg">
            ٣
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black">ملاحظات وتأملات المعلم حول الدرس</h2>
            <p className="text-xs text-amber-200">
              نقاط القوة • جوانب تحتاج إلى تحسين وتطوير • مقترحات للدروس القادمة
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-800 mb-1">
              نقاط القوة في تنفيذ الدرس:
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
              جوانب تحتاج إلى تحسين وتطوير:
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
              مقترحات للدروس القادمة:
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
    </div>
  );
};
