import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Loader2,
  BookOpen,
  GraduationCap,
  Clock,
  Building2,
  User,
  AlertCircle,
  Layers,
  CheckCircle2,
  Plus,
  Wand2,
} from 'lucide-react';
import { EducationalResource, LessonPlan, STANDARD_GRADES, EDUCATIONAL_STAGES } from '../types/lessonPlan';
import { toArabicDigits } from '../utils/arabicNumerals';
import { ensureExecutiveData } from '../utils/executivePlanDefaults';
import { EducationalStagePickerModal } from './EducationalStagePickerModal';

interface AiGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanGenerated: (plan: LessonPlan) => void;
  resources: EducationalResource[];
  onOpenResourcesModal: () => void;
  selectedResourceForPlanning?: EducationalResource | null;
}

export const AiGeneratorModal: React.FC<AiGeneratorModalProps> = ({
  isOpen,
  onClose,
  onPlanGenerated,
  resources,
  onOpenResourcesModal,
  selectedResourceForPlanning,
}) => {
  const [subject, setSubject] = useState('العلوم والحياة');
  const [grade, setGrade] = useState('الرابع الأساسي');
  const [lessonTitle, setLessonTitle] = useState('حالات المادة والتحولات الفيزيائية');
  const [totalPeriods, setTotalPeriods] = useState(2);
  const [currentPeriod, setCurrentPeriod] = useState(1);
  const [periodDurationMinutes, setPeriodDurationMinutes] = useState(40);
  const [country, setCountry] = useState('دولة فلسطين');
  const [ministry, setMinistry] = useState('وزارة التربية والتعليم');
  const [school, setSchool] = useState('مدرسة المعري الأساسية للبنين');
  const [directorate, setDirectorate] = useState('مديرية نابلس');
  const [teacherName, setTeacherName] = useState('أ. عبد الرحمن دويكات');
  const [selectedTemplateType, setSelectedTemplateType] = useState<'executive' | 'adaptive'>('executive');
  const [customNotes, setCustomNotes] = useState(
    'التركيز على استقصاء علمي وتجارب حسية واستخدام استراتيجيات التعلم النشط ومهمة تقويم أصيل GRASPS وسلالم التقدير والربط بالبيئة المحلية الفلسطينية مع استخدام الأرقام العربية المشرقية ومنازل الآحاد ثم العشرات ثم المئات ثم الآلاف.'
  );

  const [activeResource, setActiveResource] = useState<EducationalResource | null>(null);
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [autoUpdatedNotice, setAutoUpdatedNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyResourceToFields = (res: EducationalResource) => {
    setActiveResource(res);
    if (res.inferredSubject) setSubject(res.inferredSubject);
    if (res.inferredGrade) setGrade(res.inferredGrade);
    
    let resolvedTitle = res.inferredLessonTitle || res.title;
    resolvedTitle = resolvedTitle
      .replace(/^(كتاب|ورقة عمل|عرض تقديمي|تسجيل صوتي|فيديو تعليمي|اختبار تقويمي|جدول بيانات|وسيلة بصرية|دليل المعلم|مستند|رابط تعليمي|معايير ونتاجات|ملاحظات تحضير)[\s:–-]*[^\-]+- /i, '')
      .trim();
    if (resolvedTitle) setLessonTitle(resolvedTitle);

    setCustomNotes(
      `الاستناد التام إلى المصدر المرفق: "${res.title}". يرجى مراعاة نصوصه وأهدافه وتدريباته بدقة في بناء سير الحصة، ومهمة التقويم الأصيل GRASPS، وسلم التقدير اللفظي Rubric.`
    );

    setAutoUpdatedNotice(`تمت مزامنة العناوين تلقائياً وفق المصدر: «${res.title}»`);
    setTimeout(() => setAutoUpdatedNotice(null), 3500);
  };

  // Sync fields whenever selected resource changes or modal opens with resources
  useEffect(() => {
    if (!isOpen) return;

    if (selectedResourceForPlanning) {
      applyResourceToFields(selectedResourceForPlanning);
    } else if (resources.length > 0 && !activeResource) {
      applyResourceToFields(resources[0]);
    }
  }, [isOpen, selectedResourceForPlanning, resources]);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          grade,
          lessonTitle,
          totalPeriods,
          currentPeriod,
          periodDurationMinutes,
          country,
          ministry,
          school,
          directorate,
          teacherName,
          customNotes,
          resources,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'حدث خطأ أثناء توليد خطة الدرس');
      }

      // Ensure executive model data is prepared and templateType is assigned
      const withExec = ensureExecutiveData(data.plan);
      const planWithResources: LessonPlan = {
        ...withExec,
        templateType: selectedTemplateType,
        attachedResources: resources.length > 0 ? [...resources] : undefined,
      };

      onPlanGenerated(planWithResources);
      onClose();

      if (data.isFallback) {
        setTimeout(() => {
          alert('تم إعداد وتخصيص خطة الدرس بنجاح وفق المعايير الوزارية الرسمية ونموذج التميز للدرجة 4.');
        }, 300);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'تعذر الاتصال بالخادم الذكي لإعداد الخطة');
    } finally {
      setLoading(false);
    }
  };

  const sampleSubjects = [
    {
      sub: 'الرياضيات',
      gr: 'الصف الأول',
      title: 'الأعداد من 1 إلى 9 وتمثيل المجموعات بالمحسوسات',
      notes: 'المحسوسات والمشابك الخشبية، العد التصاعدي والتنازلي، التمييز البصري والكمي، التعلم باللعب ومجموعات التعلم.',
    },
    {
      sub: 'اللغة العربية',
      gr: 'الصف الثاني',
      title: 'درس قريتي الجميلة - القراءة الجهرية المعبرة والتاء المربوطة',
      notes: 'قراءة نموذجية، نطق سليم لمخارج الحروف، التمييز الصوتي بين التاء المربوطة والمفتوحة، ولعب الأدوار.',
    },
    {
      sub: 'العلوم والحياة',
      gr: 'الرابع الأساسي',
      title: 'حالات المادة ودورة الماء في الطبيعة',
      notes: 'تجارب استقصائية حسية، الربط بجبال فلسطين ومصادر المياه الجوفية، مهمة GRASPS إرشادية بيئية.',
    },
    {
      sub: 'اللغة العربية',
      gr: 'الرابع الأساسي',
      title: 'القدس زهرة المدائن - قراءة استيعابية وتعبير أدبي',
      notes: 'قراءة جهرية معبرة، التمييز بين الحقيقة والرأي، مفردات تراثية ومشاعر الانتماء الوطني والعروبة.',
    },
    {
      sub: 'الرياضيات',
      gr: 'الثالث الأساسي',
      title: 'القيمة المنزلية للأعداد ضمن ٩٩٩٩',
      notes: 'المحسوسات والمعداد، البدء بمنازل الآحاد ثم العشرات ثم المئات ثم آحاد الآلاف، الصورة الموسعة.',
    },
    {
      sub: 'التربية الإسلامية',
      gr: 'الخامس الأساسي',
      title: 'آداب الاستئذان وحرمة البيوت',
      notes: 'لعب الأدوار، الاستشهاد بالآيات القرآنية والأحاديث الشريفة، وغرس القيم الأخلاقية والتراحم.',
    },
    {
      sub: 'الدراسات الاجتماعية',
      gr: 'السادس الأساسي',
      title: 'تضاريس فلسطين والمناخ والسهول الساحلية',
      notes: 'تحليل الخرائط الجغرافية، الربط بمدن يافا وحيفا والقدس، وأهمية حماية الأرض والتراث الزراعي.',
    },
    {
      sub: 'التكنولوجيا',
      gr: 'السابع الأساسي',
      title: 'أمن المعلومات والحوسبة السحابية والأمان الرقمي',
      notes: 'تطبيق مفاهيم الخوارزميات، التفكير المنطقي، وأخلاقيات استخدام الإنترنت والسلامة الرقمية.',
    },
  ];

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto text-right"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-linear-to-r from-emerald-800 to-teal-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-700/60 rounded-xl">
              <Sparkles className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-['Tajawal']">إعداد وتوليد خطة درس نموذجية بالذكاء الاصطناعي</h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                تتطابق العناوين والمباحث تلقائياً مع المصادر والمراجع التعليمية المرفقة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-white/20 rounded-full transition-colors text-white disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleGenerate} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Auto-updated notification toast */}
          {autoUpdatedNotice && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-bold flex items-center gap-2 shadow-2xs">
              <Wand2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{autoUpdatedNotice}</span>
            </div>
          )}

          {/* Attached Resources Multi-Sync Strip - Large & Distinctive */}
          <div className="bg-linear-to-r from-emerald-50 via-teal-50/80 to-emerald-100/60 border-2 border-emerald-300 p-4 rounded-2xl space-y-3 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shrink-0 shadow-xs relative">
                  <Layers className="w-5 h-5 text-emerald-100" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 text-amber-950 font-black rounded-full flex items-center justify-center text-[10px] shadow-xs border border-white">
                    +
                  </span>
                </div>
                <div>
                  <div className="text-xs font-black text-emerald-950 flex items-center gap-2">
                    <span>المصادر والمناهج المرفقة للتحضير:</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-emerald-800 text-white font-black shadow-2xs">
                      {toArabicDigits(resources.length)} مصادر
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800/90 mt-0.5">
                    {resources.length === 0
                      ? 'ارفع أو الصق نصوص درس المنهاج أو ورقة العمل ليقوم الـ AI ببناء الخطة بدقة بناءً عليها'
                      : 'تم تفعيل التوليد الذكي المستند لنصوص وبيانات المصادر المرفقة أدناه'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenResourcesModal}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black shrink-0 transition-all shadow-xs hover:shadow-md hover:scale-[1.02] flex items-center justify-center gap-1.5 cursor-pointer ring-1 ring-emerald-500/30"
              >
                <Plus className="w-4 h-4 text-emerald-200" />
                <span>إضافة أو رفع مصادر ومناهج</span>
              </button>
            </div>

            {/* Quick selector of active resource to sync titles */}
            {resources.length > 0 && (
              <div className="pt-2.5 border-t border-emerald-200">
                <span className="block text-[11px] font-bold text-emerald-900 mb-1.5 flex items-center gap-1">
                  <Wand2 className="w-3.5 h-3.5 text-emerald-600" />
                  اختر مصدراً لمزامنة وتغيير العناوين تلقائياً معه:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {resources.map((res) => {
                    const isSelected = activeResource?.id === res.id;
                    return (
                      <button
                        key={res.id}
                        type="button"
                        onClick={() => applyResourceToFields(res)}
                        className={`text-[11px] px-3 py-1.5 rounded-xl border transition-all text-right ${
                          isSelected
                            ? 'bg-emerald-800 text-white border-emerald-800 font-bold shadow-xs'
                            : 'bg-white hover:bg-emerald-100 text-emerald-950 border-emerald-300'
                        }`}
                      >
                        {res.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick Inspirations for Different Subjects */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              أو اختر من النماذج المقترحة السريعة:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {sampleSubjects.map((st, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => {
                    setSubject(st.sub);
                    setGrade(st.gr);
                    setLessonTitle(st.title);
                    setCustomNotes(st.notes);
                    setActiveResource(null);
                  }}
                  className={`text-[11px] px-2.5 py-1 rounded-xl border transition-all text-right ${
                    subject === st.sub && !activeResource
                      ? 'bg-emerald-700 text-white border-emerald-700 font-bold shadow-xs'
                      : 'bg-slate-100 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-300 border-slate-200 text-slate-700'
                  }`}
                >
                  {st.sub} - {st.gr}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                المادة / المبحث (تلقائي) *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="مثال: العلوم والحياة، اللغة العربية، الرياضيات"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-right font-semibold"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>الصف والشعبة *</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsStageModalOpen(true)}
                  className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 transition-all shadow-2xs cursor-pointer"
                  title="استعراض واختيار الصف لكافة المراحل التعليمية"
                >
                  <GraduationCap className="w-3 h-3 text-emerald-700" />
                  <span>كافة المراحل 🎓</span>
                </button>
              </div>

              {/* Quick stage selector tags */}
              <div className="flex items-center gap-1 mb-1.5 overflow-x-auto pb-0.5 scrollbar-thin text-[10px]">
                {EDUCATIONAL_STAGES.map((stg) => (
                  <button
                    key={stg.id}
                    type="button"
                    onClick={() => setIsStageModalOpen(true)}
                    className={`px-1.5 py-0.5 rounded border font-semibold whitespace-nowrap transition-colors ${stg.badgeColor} hover:opacity-90`}
                    title={`انقر لاختيار صف من ${stg.name}`}
                  >
                    {stg.shortName}
                  </button>
                ))}
              </div>

              <input
                type="text"
                required
                list="ai-grade-datalist"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="الصف لجميع المراحل (اختر أو اكتب، مثال: العاشر، التوجيهي، الثالث...)"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-right font-semibold"
              />
              <datalist id="ai-grade-datalist">
                {STANDARD_GRADES.map((g) => (
                  <option key={g} value={g} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              عنوان الدرس المراد تحضيره (يتطابق تلقائياً مع المصدر) *
            </label>
            <input
              type="text"
              required
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              placeholder="مثال: حالات المادة والتحولات الفيزيائية"
              className="w-full px-3 py-2 text-xs font-bold text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-right"
            />
          </div>

          {/* Timing & Periods */}
          <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                زمن الحصة (دقيقة)
              </label>
              <input
                type="number"
                min={20}
                max={90}
                value={periodDurationMinutes}
                onChange={(e) => setPeriodDurationMinutes(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-center font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                إجمالي حصص الدرس
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={totalPeriods}
                onChange={(e) => setTotalPeriods(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-center font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                الحصة المستهدفة
              </label>
              <input
                type="number"
                min={1}
                max={totalPeriods}
                value={currentPeriod}
                onChange={(e) => setCurrentPeriod(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-center font-bold"
              />
            </div>
          </div>

          {/* School & Teacher Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                المدرسة والمديرية
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="المدرسة"
                  className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-right"
                />
                <input
                  type="text"
                  value={directorate}
                  onChange={(e) => setDirectorate(e.target.value)}
                  placeholder="المديرية"
                  className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-right"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                اسم المعلم/ة
              </label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                placeholder="اسم المعلم"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-right"
              />
            </div>
          </div>

          {/* Template Model Selection */}
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl space-y-2">
            <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>اختر نموذج التحضير الافتراضي (يتم توليد كلا النموذجين بالذكاء الاصطناعي آلياً):</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-right">
              <button
                type="button"
                onClick={() => setSelectedTemplateType('executive')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-right flex flex-col justify-between ${
                  selectedTemplateType === 'executive'
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                    : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>النموذج الأول (الرئيسي المعتمد)</span>
                  {selectedTemplateType === 'executive' && <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />}
                </div>
                <span className={`text-[10px] mt-1 block font-normal ${selectedTemplateType === 'executive' ? 'text-emerald-100' : 'text-slate-500'}`}>
                  خطة التنفيذ التنفيذية (أهداف SMART + مهمة GRASPS + ٥ مراحل)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplateType('adaptive')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-right flex flex-col justify-between ${
                  selectedTemplateType === 'adaptive'
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                    : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>النموذج الثاني (التكيفي الشامل)</span>
                  {selectedTemplateType === 'adaptive' && <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />}
                </div>
                <span className={`text-[10px] mt-1 block font-normal ${selectedTemplateType === 'adaptive' ? 'text-emerald-100' : 'text-slate-500'}`}>
                  النموذج التربوي التكيفي ذو المحاور الستة والتحليل الشامل
                </span>
              </button>
            </div>
          </div>

          {/* Custom Pedagogical Focus */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              توجيهات وأهداف خاصة (مستندة للمصدر):
            </label>
            <textarea
              rows={2}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="مثال: الاستناد للمصدر المرفق ومراعاة نصوصه وأهدافه وتدريباته..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-right leading-relaxed"
            />
          </div>

          {/* Footer CTA */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              * سيتم إنشاء خطة كاملة ومحكمة متطابقة مع مراجعك
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>جاري التوليد والتحليل التربوي...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>توليد الخطة الوزارية المتكاملة</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Educational Stages Picker Modal */}
      <EducationalStagePickerModal
        isOpen={isStageModalOpen}
        onClose={() => setIsStageModalOpen(false)}
        selectedGrade={grade}
        onSelectGrade={(g) => setGrade(g)}
        title="تحديد الصف لجميع المراحل الدراسية (المولد الذكي)"
      />
    </div>
  );
};
