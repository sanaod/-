import React, { useState } from 'react';
import { X, Sparkles, Loader2, BookOpen, GraduationCap, Clock, Building2, User, AlertCircle } from 'lucide-react';
import { LessonPlan } from '../types/lessonPlan';
import { toArabicDigits } from '../utils/arabicNumerals';

interface AiGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanGenerated: (plan: LessonPlan) => void;
}

export const AiGeneratorModal: React.FC<AiGeneratorModalProps> = ({
  isOpen,
  onClose,
  onPlanGenerated,
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
  const [customNotes, setCustomNotes] = useState('التركيز على استقصاء علمي وتجارب حسية واستخدام استراتيجيات التعلم النشط ومهمة تقويم أصيل GRASPS وسلالم التقدير والربط بالبيئة المحلية الفلسطينية مع استخدام الأرقام العربية المشرقية ومنازل الآحاد ثم العشرات ثم المئات ثم الآلاف.');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'حدث خطأ أثناء توليد خطة الدرس');
      }

      onPlanGenerated(data.plan);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'تعذر الاتصال بالخادم الذكي لإعداد الخطة');
    } finally {
      setLoading(false);
    }
  };

  const sampleTopics = [
    { sub: 'الرياضيات', gr: 'الخامس الأساسي', title: 'جمع الكسور العادية غير متجانسة المقامات وطرحها' },
    { sub: 'اللغة العربية', gr: 'الثالث الأساسي', title: 'الأفعال الماضية والمضارعة وصيد الكلمات التراثية' },
    { sub: 'العلوم والحياة', gr: 'السادس الأساسي', title: 'الخلية النباتية والخلية الحيوانية تحت المجهر' },
    { sub: 'التربية الإسلامية', gr: 'الرابع الأساسي', title: 'آداب المسجد وعمارة بيوت الله في فلسطين' },
    { sub: 'الدراسات الاجتماعية', gr: 'السابع الأساسي', title: 'جغرافية فلسطين ومصادر المياه الطبيعية والأودية' },
  ];

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto text-right"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-linear-to-r from-emerald-800 to-teal-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-700/60 rounded-xl">
              <Sparkles className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-['Tajawal']">إعداد وتوليد خطة درس نموذجية بالذكاء الاصطناعي</h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                وفق المعايير الوزارية، التخطيط التكيفي، وسير الحصة الرباعي، والتقويم الأصيل GRASPS
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
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Inspirations */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              نماذج مقترحة سريعة للاختيار:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {sampleTopics.map((st, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => {
                    setSubject(st.sub);
                    setGrade(st.gr);
                    setLessonTitle(st.title);
                  }}
                  className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 rounded-lg text-slate-700 transition-colors"
                >
                  {st.sub} - {st.gr}: {st.title}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                المادة / المبحث *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="مثال: الرياضيات، العلوم، اللغة العربية"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-right"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                الصف والشعبة *
              </label>
              <input
                type="text"
                required
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="مثال: الثالث الأساسي / أ"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-right"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              عنوان الدرس المراد تحضيره *
            </label>
            <input
              type="text"
              required
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              placeholder="مثال: القيمة المنزلية للأعداد ضمن 9999"
              className="w-full px-3 py-2 text-sm font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-right"
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
                className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded-lg text-center font-bold"
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
                className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded-lg text-center font-bold"
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
                className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded-lg text-center font-bold"
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

          {/* Custom Pedagogical Focus */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              توجيهات تربوية خاصة (اختياري):
            </label>
            <textarea
              rows={2}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="مثال: التركيز على التعلم باللعب، دمج الطلبة من ذوي الإعاقة البصرية، ربط الدرس بالبيئة والتراث الفلسطيني، بدء المنازل من الآحاد..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-right"
            />
          </div>

          {/* Footer CTA */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              * سيتم إنشاء خطة تفصيلية بجميع الأقسام الستة ومهمة تقويم أصيل وسلم Rubric
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
                    <Loader2 className="w-4 h-4 animate-spin" />
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
    </div>
  );
};
