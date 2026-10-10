import React, { useState } from 'react';
import { LessonPlan } from '../types/lessonPlan';
import {
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Target,
  Clock,
  Layers,
  Award,
  Printer,
  Save,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { toArabicDigits } from '../utils/arabicNumerals';
import { ensureExecutiveData } from '../utils/executivePlanDefaults';

interface LessonPrepWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: LessonPlan;
  onSave: (updatedPlan: LessonPlan) => void;
  onOpenPrintView: () => void;
}

export const LessonPrepWizardModal: React.FC<LessonPrepWizardModalProps> = ({
  isOpen,
  onClose,
  plan,
  onSave,
  onOpenPrintView,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 6;

  const [workingPlan, setWorkingPlan] = useState<LessonPlan>(() => ensureExecutiveData(plan));

  if (!isOpen) return null;

  const stepsMeta = [
    { number: 1, title: 'بيانات الدرس', icon: BookOpen, desc: 'المبحث، الصف، العنوان، والزمن' },
    { number: 2, title: 'الأهداف والكفايات', icon: Target, desc: 'الكفايات التكاملية والأهداف الذكية' },
    { number: 3, title: 'إجراءات التدريس', icon: Clock, desc: 'المراحل الأربع لسير الحصة' },
    { number: 4, title: 'التمايز ومصادر التعلم', icon: Layers, desc: 'خصائص الطلبة ومصادر التعلم' },
    { number: 5, title: 'التقويم والواجب', icon: Award, desc: 'مهمة GRASPS، السلم، وبطاقة الخروج' },
    { number: 6, title: 'المراجعة والحفظ', icon: CheckCircle2, desc: 'معاينة نهائية، حفظ، وطباعة' },
  ];

  const handleHeaderChange = (field: string, value: any) => {
    setWorkingPlan((prev) => ({
      ...prev,
      header: {
        ...prev.header,
        [field]: value,
      },
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleFinishSave = () => {
    onSave(workingPlan);
    onClose();
  };

  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto font-['Cairo',sans-serif]"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="bg-linear-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600/80 rounded-2xl text-white shadow-inner border border-emerald-400/30 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg md:text-xl font-bold font-['Tajawal']">
                  معالج تحضير الدرس المتدرج (Step-by-Step Lesson Wizard)
                </h3>
                <span className="text-[11px] bg-amber-400/30 border border-amber-300/40 text-amber-200 px-2.5 py-0.5 rounded-full font-bold">
                  الخطوة {toArabicDigits(currentStep)} من {toArabicDigits(totalSteps)}
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-0.5">
                إنشاء وتعديل خطة الدرس بخطوات مساندة ومرنة وفق المعايير الوزارية
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-slate-200 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span>مرحلة التحضير الحالية:</span>
              <strong className="text-emerald-800">{stepsMeta[currentStep - 1].title}</strong>
            </span>
            <span className="text-xs font-extrabold text-emerald-700 tabular-nums">
              {toArabicDigits(progressPercent)}٪
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-linear-to-r from-emerald-600 to-teal-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Stepper Tabs */}
          <div className="grid grid-cols-6 gap-1 mt-3">
            {stepsMeta.map((st) => {
              const IconComp = st.icon;
              const isCurrent = currentStep === st.number;
              const isPassed = currentStep > st.number;
              return (
                <button
                  key={st.number}
                  type="button"
                  onClick={() => setCurrentStep(st.number)}
                  className={`py-1.5 px-1 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-emerald-700 text-white shadow-md scale-102'
                      : isPassed
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-white text-slate-500 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline truncate max-w-full">{st.title}</span>
                  <span className="sm:hidden">{toArabicDigits(st.number)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50/50 text-right">
          
          {/* STEP 1: LESSON DETAILS */}
          {currentStep === 1 && (
            <div className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="border-b border-slate-100 pb-3 mb-2">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-['Tajawal']">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>الخطوة ١: بيانات الدرس والترويسة الوزارية</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">حدد المبحث، الصف، عنوان الدرس، وزمن الحصة</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المبحث / المادة:</label>
                  <input
                    type="text"
                    value={workingPlan.header.subject || ''}
                    onChange={(e) => handleHeaderChange('subject', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الصف الدراسي:</label>
                  <input
                    type="text"
                    value={workingPlan.header.grade || ''}
                    onChange={(e) => handleHeaderChange('grade', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">عنوان الدرس الأساسي:</label>
                  <input
                    type="text"
                    value={workingPlan.header.lessonTitle || ''}
                    onChange={(e) => handleHeaderChange('lessonTitle', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-extrabold text-slate-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">عنوان الوحدة الدراسية:</label>
                  <input
                    type="text"
                    value={workingPlan.header.unitTitle || ''}
                    onChange={(e) => handleHeaderChange('unitTitle', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم المعلم/ة:</label>
                  <input
                    type="text"
                    value={workingPlan.header.teacherName || ''}
                    onChange={(e) => handleHeaderChange('teacherName', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">المدرسة والمديرية:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={workingPlan.header.school || ''}
                      onChange={(e) => handleHeaderChange('school', e.target.value)}
                      placeholder="المدرسة"
                      className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                    />
                    <input
                      type="text"
                      value={workingPlan.header.directorate || ''}
                      onChange={(e) => handleHeaderChange('directorate', e.target.value)}
                      placeholder="المديرية"
                      className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">عدد الحصص والزمن (دقيقة):</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={workingPlan.header.totalPeriods || 2}
                      onChange={(e) => handleHeaderChange('totalPeriods', Number(e.target.value))}
                      className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-center"
                    />
                    <input
                      type="number"
                      value={workingPlan.header.periodDurationMinutes || 40}
                      onChange={(e) => handleHeaderChange('periodDurationMinutes', Number(e.target.value))}
                      className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-center"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: OBJECTIVES & COMPETENCIES */}
          {currentStep === 2 && (
            <div className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="border-b border-slate-100 pb-3 mb-2">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-['Tajawal']">
                  <Target className="w-4 h-4 text-emerald-600" />
                  <span>الخطوة ٢: الكفايات التكاملية والأهداف الذكية (SMART)</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">صياغة نتاجات التعلم والكفايات الأربع للدرس</p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">الكفايات التكاملية للدرس:</label>
                {workingPlan.section1?.integrativeCompetencies?.map((comp, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <input
                      type="text"
                      value={comp.title}
                      onChange={(e) => {
                        const newComps = [...workingPlan.section1.integrativeCompetencies];
                        newComps[idx].title = e.target.value;
                        setWorkingPlan({
                          ...workingPlan,
                          section1: { ...workingPlan.section1, integrativeCompetencies: newComps },
                        });
                      }}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                      placeholder="عنوان الكفاية"
                    />
                    <textarea
                      rows={2}
                      value={comp.description}
                      onChange={(e) => {
                        const newComps = [...workingPlan.section1.integrativeCompetencies];
                        newComps[idx].description = e.target.value;
                        setWorkingPlan({
                          ...workingPlan,
                          section1: { ...workingPlan.section1, integrativeCompetencies: newComps },
                        });
                      }}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-700"
                      placeholder="وصف الكفاية وتفاصيلها"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: TEACHING PROCEDURES & 4 PHASES */}
          {currentStep === 3 && (
            <div className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="border-b border-slate-100 pb-3 mb-2">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-['Tajawal']">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>الخطوة ٣: مراحل سير الحصة الأربع (التمهيد، العرض، التطبيق، الخاتمة)</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">تفاصيل الإجراءات والأنشطة والزمن لكل مرحلة</p>
              </div>

              <div className="space-y-4">
                {workingPlan.section2Timeline?.map((phase, idx) => (
                  <div key={phase.id || idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black px-3 py-1 bg-emerald-700 text-white rounded-lg">
                        المرحلة {toArabicDigits(idx + 1)}: {phase.phaseName}
                      </span>
                      <span className="text-xs font-bold text-slate-600">
                        الزمن: {toArabicDigits(phase.durationMinutes)} دقيقة
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">إجراءات المعلم ونشاط الطالب:</label>
                      <textarea
                        rows={2}
                        value={phase.teacherAndStudentActions.join('\n')}
                        onChange={(e) => {
                          const newTimeline = [...workingPlan.section2Timeline];
                          newTimeline[idx].teacherAndStudentActions = e.target.value.split('\n');
                          setWorkingPlan({ ...workingPlan, section2Timeline: newTimeline });
                        }}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: DIFFERENTIATION & RESOURCES */}
          {currentStep === 4 && (
            <div className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="border-b border-slate-100 pb-3 mb-2">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-['Tajawal']">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>الخطوة ٤: التمايز، خصائص الطلبة، ومصادر التعلم</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">مراعاة الفروق الفردية ومصادر التعلم والكتاب المدرسي</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الفروق الفردية ودعم الأقران:</label>
                  <textarea
                    rows={3}
                    value={workingPlan.section1?.studentCharacteristics?.individualDifferences || ''}
                    onChange={(e) => {
                      setWorkingPlan({
                        ...workingPlan,
                        section1: {
                          ...workingPlan.section1,
                          studentCharacteristics: {
                            ...workingPlan.section1.studentCharacteristics,
                            individualDifferences: e.target.value,
                          },
                        },
                      });
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">مصادر التعلم والوسائط:</label>
                  <textarea
                    rows={3}
                    value={workingPlan.section1?.learningResources?.textbook || ''}
                    onChange={(e) => {
                      setWorkingPlan({
                        ...workingPlan,
                        section1: {
                          ...workingPlan.section1,
                          learningResources: {
                            ...workingPlan.section1.learningResources,
                            textbook: e.target.value,
                          },
                        },
                      });
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: ASSESSMENT & HOMEWORK */}
          {currentStep === 5 && (
            <div className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="border-b border-slate-100 pb-3 mb-2">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-['Tajawal']">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>الخطوة ٥: مهمة التقويم الأصيل (GRASPS) وبطاقة الخروج</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">تقييم نتاجات التعلم بمهمة واقعية وسلم تقدير</p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">عنوان مهمة GRASPS:</label>
                  <input
                    type="text"
                    value={workingPlan.section3Assessment?.graspsTask?.title || ''}
                    onChange={(e) => {
                      setWorkingPlan({
                        ...workingPlan,
                        section3Assessment: {
                          ...workingPlan.section3Assessment,
                          graspsTask: {
                            ...workingPlan.section3Assessment.graspsTask,
                            title: e.target.value,
                          },
                        },
                      });
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">وصف المهمة التفصيلي:</label>
                  <textarea
                    rows={3}
                    value={workingPlan.section3Assessment?.graspsTask?.fullDescription || ''}
                    onChange={(e) => {
                      setWorkingPlan({
                        ...workingPlan,
                        section3Assessment: {
                          ...workingPlan.section3Assessment,
                          graspsTask: {
                            ...workingPlan.section3Assessment.graspsTask,
                            fullDescription: e.target.value,
                          },
                        },
                      });
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: REVIEW & SAVE */}
          {currentStep === 6 && (
            <div className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-black text-slate-900 font-['Tajawal']">
                اكتملت خطوات إعداد التحضير بنجاح!
              </h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                خطة الدرس «{workingPlan.header.lessonTitle}» لمبحث {workingPlan.header.subject} جاهزة الآن للحفظ، التعديل المتقدم، أو الطباعة الرسمية.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={onOpenPrintView}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-emerald-300" />
                  <span>معاينة الطباعة الرسمية A4</span>
                </button>
                <button
                  type="button"
                  onClick={handleFinishSave}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ واعتماد الخطة</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <ArrowRight className="w-4 h-4" />
            <span>السابق</span>
          </button>

          <span className="text-xs font-bold text-slate-500">
            الخطوة {toArabicDigits(currentStep)} من {toArabicDigits(totalSteps)}
          </span>

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
            >
              <span>التالي</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishSave}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>حفظ وإنهاء</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
