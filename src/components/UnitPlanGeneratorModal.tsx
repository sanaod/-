import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Boxes,
  BookOpen,
  GraduationCap,
  Clock,
  Layers,
  CheckCircle2,
  Plus,
  Trash2,
  FileText,
  Download,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Award,
  Calendar,
  AlertCircle,
  Eye,
  FileEdit,
  ArrowRight,
  ListOrdered,
  Wand2
} from 'lucide-react';
import { LessonPlan, STANDARD_GRADES } from '../types/lessonPlan';
import { toArabicDigits } from '../utils/arabicNumerals';

interface UnitLessonItem {
  lessonNumber: number;
  title: string;
  periods: number;
  summary: string;
}

interface UnitPlanGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlansGenerated: (plans: LessonPlan[]) => void;
  defaultTeacherName?: string;
  defaultSchool?: string;
  defaultDirectorate?: string;
  defaultSubject?: string;
  defaultGrade?: string;
}

const SAMPLE_UNIT_PRESETS: Record<string, { unitTitle: string; lessons: string[] }[]> = {
  'الرياضيات': [
    {
      unitTitle: 'الوحدة الأولى: الأعداد حتى ٩٩٩٩ والقيمة المنزلية',
      lessons: [
        'قراءة الأعداد ضمن ٩٩٩٩ وكتابتها وتمثيلها على المعداد',
        'القيمة المنزلية للأعداد والصورة الموسعة',
        'مقارنة الأعداد ضمن ٩٩٩٩ وترتيبها تصاعدياً وتنازلياً',
        'تقريب الأعداد إلى أقرب عشرة ومئة وألف وتطبيقات حياتية',
      ],
    },
    {
      unitTitle: 'الوحدة الثانية: جمع الأعداد وطرحها ضمن ٩٩٩٩',
      lessons: [
        'جمع عددين ضمن ٩٩٩٩ دون حمل ومع الحمل',
        'طرح عددين ضمن ٩٩٩٩ دون استلاف ومع الاستلاف',
        'تقدير نواتج الجمع والطرح وحل المسائل اللفظية',
        'مهمة التقويم الأصيل GRASPS: ميزانية رحلة مدرسية فلسطينية',
      ],
    },
    {
      unitTitle: 'الوحدة الثالثة: الهندسة والقياس والأشكال المستوية',
      lessons: [
        'القطعة المستقيمة والشعاع والخط المستقيم',
        'الزوايا وأنواعها (القائمة، الحادة، المنفرجة)',
        'المثلث والمربع والمستطيل وخصائص كل منها',
        'حساب محيط الأشكال الهندسية وتطبيقات واقعية',
      ],
    },
  ],
  'العلوم والحياة': [
    {
      unitTitle: 'الوحدة الأولى: حالات المادة وخصائصها الفيزيائية',
      lessons: [
        'المادة في حياتنا وحالاتها الثلاث (الصلبة، السائلة، الغازية)',
        'التحولات الفيزيائية بين حالات المادة وعلاقتها بالحرارة',
        'المواد النقية والمخاليط وطرق فصلها البسيطة',
        'مهمة الأداء الأصيل: تصميم نظام تنقية مياه منزلي مستدام',
      ],
    },
    {
      unitTitle: 'الوحدة الثانية: أجهزة جسم الإنسان وصحته',
      lessons: [
        'الجهاز الهضمي: أجزاؤه ووظائفها والغذاء الصحي المتوازن',
        'الجهاز التنفسي: آلية التنفس وأهمية الهواء النقي',
        'الجهاز الدوراني: القلب والأوعية الدموية وأهمية ممارسة الرياضة',
        'العادات الصحية السليمة للوقاية من الأمراض الشائعة',
      ],
    },
  ],
  'اللغة العربية': [
    {
      unitTitle: 'الوحدة الأولى: اعتزازنا بهويتنا وقيمنا الأصيلة',
      lessons: [
        'الاستماع والمحادثة: شيم الأجداد وكرم الضيافة',
        'القراءة والفهم والاستيعاب: شجرة الزيتون المباركة',
        'التراكيب اللغوية: الجملة الاسمية والمبتدأ والخبر',
        'الإملاء والتعبير: كتابة فقرة وصفية عن موسم قطاف الزيتون',
      ],
    },
    {
      unitTitle: 'الوحدة الثانية: مدن فلسطينية وقلاع تاريخية',
      lessons: [
        'الاستماع والمحادثة: جولة في رحاب القدس العتيقة',
        'القراءة والفهم: أسوار عكا وبطولات الصمود',
        'القواعد النحوية: أدوات الاستفهام وحروف العطف',
        'التعبير الإبداعي ومهمة GRASPS: تصميم دليل سياحي للبلدة القديمة',
      ],
    },
  ],
};

export const UnitPlanGeneratorModal: React.FC<UnitPlanGeneratorModalProps> = ({
  isOpen,
  onClose,
  onPlansGenerated,
  defaultTeacherName = 'أ. عبد الرحمن دويكات',
  defaultSchool = 'مدرسة التميز النموذجية للبنين',
  defaultDirectorate = 'مديرية التربية والتعليم - نابلس',
  defaultSubject = 'الرياضيات',
  defaultGrade = 'الصف الثالث الأساسي',
}) => {
  // Step navigation: 'config' | 'generating' | 'results'
  const [step, setStep] = useState<'config' | 'generating' | 'results'>('config');

  // Basic Unit Inputs
  const [unitTitle, setUnitTitle] = useState('الوحدة الأولى: الأعداد حتى ٩٩٩٩ والقيمة المنزلية');
  const [subject, setSubject] = useState(defaultSubject);
  const [grade, setGrade] = useState(defaultGrade);
  const [numberOfLessons, setNumberOfLessons] = useState(4);
  const [semester, setSemester] = useState('الفصل الدراسي الأول');
  const [teacherName, setTeacherName] = useState(defaultTeacherName);
  const [school, setSchool] = useState(defaultSchool);
  const [directorate, setDirectorate] = useState(defaultDirectorate);
  const [periodDurationMinutes, setPeriodDurationMinutes] = useState(40);
  const [customNotes, setCustomNotes] = useState(
    'مراعاة الترابط والتسلسل البيداغوجي بين دروس الوحدة، وتضمين مهمة تقويم أصيل GRASPS وسلالم تقدير لفظية وربط معالم الدروس بالبيئة الفلسطينية.'
  );

  // Lesson Outline State
  const [lessons, setLessons] = useState<UnitLessonItem[]>([
    {
      lessonNumber: 1,
      title: 'قراءة الأعداد ضمن ٩٩٩٩ وكتابتها وتمثيلها على المعداد',
      periods: 2,
      summary: 'استكشاف الأعداد وتمثيلها حسياً ورقمياً وتحليل منازل الآحاد والعشرات والمئات والآلاف.',
    },
    {
      lessonNumber: 2,
      title: 'القيمة المنزلية للأعداد والصورة الموسعة',
      periods: 2,
      summary: 'تحديد القيمة المكانية لكل رقم في العدد وكتابته بالصورة اللفظية والموسعة.',
    },
    {
      lessonNumber: 3,
      title: 'مقارنة الأعداد ضمن ٩٩٩٩ وترتيبها تصاعدياً وتنازلياً',
      periods: 2,
      summary: 'استخدام إشارات المقارنة وترتيب الأعداد اعتماداً على المنازل من الأكبر للأصغر.',
    },
    {
      lessonNumber: 4,
      title: 'تقريب الأعداد ومهمة الأداء الأصيل (GRASPS) للوحدة',
      periods: 2,
      summary: 'تقريب الأعداد لأقرب عشرة ومئة وتطبيق مشروع حسابي تطبيقي مرتبط بمعالم فلسطين.',
    },
  ]);

  // Loading & Progress State
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentProgressText, setCurrentProgressText] = useState('');
  const [generatedPlans, setGeneratedPlans] = useState<LessonPlan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [expandedPlanIdx, setExpandedPlanIdx] = useState<number | null>(0);

  if (!isOpen) return null;

  // Handle Preset Selection
  const applyPreset = (preset: { unitTitle: string; lessons: string[] }) => {
    setUnitTitle(preset.unitTitle);
    setNumberOfLessons(preset.lessons.length);
    setLessons(
      preset.lessons.map((t, idx) => ({
        lessonNumber: idx + 1,
        title: t,
        periods: 2,
        summary: `نتاجات واستراتيجيات الدرس رقم ${idx + 1} في ${preset.unitTitle}`,
      }))
    );
  };

  // Adjust number of lessons
  const handleCountChange = (newCount: number) => {
    const validCount = Math.max(2, Math.min(8, newCount));
    setNumberOfLessons(validCount);

    setLessons((prev) => {
      if (prev.length < validCount) {
        const added: UnitLessonItem[] = [];
        for (let i = prev.length; i < validCount; i++) {
          added.push({
            lessonNumber: i + 1,
            title: `الدرس ${i + 1}: تطبيقات متقدمة في ${unitTitle}`,
            periods: 2,
            summary: `تعميق المفاهيم وتطبيقات التعلم النشط للدرس ${i + 1}.`,
          });
        }
        return [...prev, ...added];
      } else {
        return prev.slice(0, validCount);
      }
    });
  };

  // AI Suggest Lessons for current unit
  const handleAiSuggestLessons = async () => {
    setIsSuggesting(true);
    setError(null);
    try {
      const res = await fetch('/api/suggest-unit-lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          grade,
          unitTitle,
          numberOfLessons,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.lessons) && data.lessons.length > 0) {
        setLessons(data.lessons);
        setNumberOfLessons(data.lessons.length);
      }
    } catch (err: any) {
      console.warn('Fallback suggestion:', err);
    } finally {
      setIsSuggesting(false);
    }
  };

  // Update specific lesson
  const updateLesson = (idx: number, field: keyof UnitLessonItem, val: any) => {
    setLessons((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  // Delete lesson
  const removeLesson = (idx: number) => {
    if (lessons.length <= 2) return;
    const nextLessons = lessons
      .filter((_, i) => i !== idx)
      .map((item, i) => ({ ...item, lessonNumber: i + 1 }));
    setLessons(nextLessons);
    setNumberOfLessons(nextLessons.length);
  };

  // Add lesson
  const addLesson = () => {
    if (lessons.length >= 8) return;
    const newIdx = lessons.length + 1;
    const item: UnitLessonItem = {
      lessonNumber: newIdx,
      title: `الدرس ${newIdx}: مهارات استقصائية في ${unitTitle}`,
      periods: 2,
      summary: `أنشطة تفاعلية وتقويم بنائي للدرس رقم ${newIdx}.`,
    };
    setLessons([...lessons, item]);
    setNumberOfLessons(lessons.length + 1);
  };

  // Main Generation Handler
  const handleGenerateUnitPlans = async () => {
    setStep('generating');
    setProgressPercent(10);
    setCurrentProgressText('جارِ تحليل البنية البيداغوجية للوحدة وتوزيع الأهداف...');
    setError(null);

    try {
      // Simulate progressive feedback
      const timer1 = setTimeout(() => {
        setProgressPercent(35);
        setCurrentProgressText(`جارِ بناء خطط التحليل التكيفي والكفايات لـ (${lessons.length}) دروس...`);
      }, 700);

      const timer2 = setTimeout(() => {
        setProgressPercent(65);
        setCurrentProgressText('جارِ صياغة مهام التقويم الأصيل (GRASPS) وسلالم التقدير اللفظي...');
      }, 1500);

      const res = await fetch('/api/generate-unit-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitTitle,
          subject,
          grade,
          lessons,
          numberOfLessons,
          semester,
          teacherName,
          school,
          directorate,
          periodDurationMinutes,
          customNotes,
        }),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'فشل في توليد تحضير الوحدة');
      }

      setProgressPercent(100);
      setCurrentProgressText('اكتمل توليد تحضير الوحدة بنجاح!');
      setGeneratedPlans(data.plans || []);
      setTimeout(() => {
        setStep('results');
      }, 600);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'حدث خطأ غير متوقع أثناء توليد خطط الوحدة');
      setStep('config');
    }
  };

  // Save / Apply all generated plans to the application
  const handleApplyAllPlans = () => {
    if (generatedPlans.length === 0) return;
    onPlansGenerated(generatedPlans);
    onClose();
  };

  // Export all unit plans as single Word Document (.doc)
  const handleExportWordAll = () => {
    if (generatedPlans.length === 0) return;

    let allLessonsHtml = '';
    generatedPlans.forEach((plan, idx) => {
      allLessonsHtml += `
        <div style="page-break-before: ${idx > 0 ? 'always' : 'auto'}; margin-bottom: 30px;">
          <h2 style="color: #1e3a8a; border-bottom: 2px solid #3b82f6; padding-bottom: 6px;">
            الدرس (${toArabicDigits(idx + 1)}): ${plan.header.lessonTitle}
          </h2>
          <p><strong>الوحدة:</strong> ${unitTitle} | <strong>الحصص:</strong> ${toArabicDigits(plan.header.totalPeriods)} حصص | <strong>التاريخ:</strong> ${toArabicDigits(plan.header.date)}</p>
          
          <h3>أولاً: الكفايات التكاملية الأربعة:</h3>
          <ul>
            ${plan.section1.integrativeCompetencies.map((c) => `<li><strong>${c.title}:</strong> ${c.description}</li>`).join('')}
          </ul>

          <h3>ثانياً: مهمة التقويم الأصيل (GRASPS):</h3>
          <p><strong>العنوان:</strong> ${plan.section3Assessment.graspsTask.title}</p>
          <p><strong>الدور:</strong> ${plan.section3Assessment.graspsTask.role} | <strong>الجمهور:</strong> ${plan.section3Assessment.graspsTask.audience}</p>
          <p>${plan.section3Assessment.graspsTask.fullDescription}</p>

          <h3>ثالثاً: جدول سير الحصة التدريسي:</h3>
          <table border="1" cellpadding="5" cellspacing="0" style="width: 100%; border-collapse: collapse; text-align: right;">
            <tr style="background-color: #f1f5f9;">
              <th>المرحلة والزمن</th>
              <th>إجراءات المعلم ونشاط الطالب</th>
              <th>الاستراتيجيات ومصادر التعلم</th>
            </tr>
            ${plan.section2Timeline
              .map(
                (step) => `
              <tr>
                <td><strong>${step.phaseName}</strong> (${toArabicDigits(step.durationMinutes)} د)</td>
                <td>${step.teacherAndStudentActions.join('<br>• ')}</td>
                <td>${step.strategiesAndResources.join('<br>• ')}</td>
              </tr>
            `
              )
              .join('')}
          </table>
        </div>
      `;
    });

    const fullHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"><title>${unitTitle}</title>
      <style>
        body { font-family: 'Traditional Arabic', 'Amiri', Arial, sans-serif; direction: rtl; text-align: right; padding: 25px; line-height: 1.6; }
        h1 { color: #065f46; text-align: center; border-bottom: 3px double #059669; padding-bottom: 10px; font-size: 22px; }
        .unit-meta { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 8px; margin-bottom: 25px; }
      </style>
      </head>
      <body>
        <h1>منظومة عبقور - تحضير وحدة دراسية متكاملة</h1>
        <div class="unit-meta">
          <p><strong>عنوان الوحدة:</strong> ${unitTitle}</p>
          <p><strong>المبحث:</strong> ${subject} | <strong>الصف:</strong> ${grade} | <strong>الفصل:</strong> ${semester}</p>
          <p><strong>المعلم/ة:</strong> ${teacherName} | <strong>المدرسة:</strong> ${school} | <strong>المديرية:</strong> ${directorate}</p>
          <p><strong>إجمالي دروس الوحدة:</strong> ${toArabicDigits(generatedPlans.length)} دروس</p>
        </div>
        ${allLessonsHtml}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + fullHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `تحضير_${unitTitle.replace(/[\s/\\:]+/g, '_')}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy Unit Summary to Clipboard
  const handleCopySummary = () => {
    let text = `=== خطة تحضير وحدة دراسية كاملة ===\n`;
    text += `عنوان الوحدة: ${unitTitle}\n`;
    text += `المبحث: ${subject} | الصف: ${grade} | الفصل: ${semester}\n`;
    text += `المعلم/ة: ${teacherName} | المدرسة: ${school}\n`;
    text += `عدد الدروس: ${lessons.length} دروس\n\n`;

    lessons.forEach((l, idx) => {
      text += `[الدرس ${idx + 1}]: ${l.title} (${l.periods} حصص)\n`;
      text += `  - الهدف: ${l.summary}\n`;
    });

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  const availablePresets = SAMPLE_UNIT_PRESETS[subject] || [];

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto font-['Cairo',sans-serif]"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/80 rounded-2xl text-white shadow-inner border border-blue-400/30 flex items-center justify-center">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg md:text-xl font-bold font-['Tajawal']">
                  مولد تحضير وحدة كاملة بالذكاء الاصطناعي (AI Unit Planner)
                </h3>
                <span className="text-[11px] bg-blue-500/30 border border-blue-400/40 text-blue-200 px-2 py-0.5 rounded-full font-bold">
                  توليد شامل متسلسل ⚡
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                توليد متسلسل لكافة خطط دروس الوحدة مع الربط البيداغوجي ومهام GRASPS وسلالم التقدير
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50/70">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-800 font-bold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STAGE 1: CONFIGURATION */}
          {step === 'config' && (
            <div className="space-y-6">
              {/* Unit Info Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-['Tajawal']">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>بيانات الوحدة التعليمية والمبحث:</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">الخطوة ١ من ٢: إعداد المحتوى</span>
                </div>

                {/* Subject & Grade & Semester */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">المبحث / المادة:</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="الرياضيات">الرياضيات</option>
                      <option value="العلوم والحياة">العلوم والحياة</option>
                      <option value="اللغة العربية">اللغة العربية</option>
                      <option value="الدراسات الاجتماعية">الدراسات الاجتماعية</option>
                      <option value="التربية الإسلامية">التربية الإسلامية</option>
                      <option value="التكنولوجيا والبرمجة">التكنولوجيا والبرمجة</option>
                      <option value="اللغة الإنجليزية">اللغة الإنجليزية</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">الصف الدراسي:</label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    >
                      {STANDARD_GRADES.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">الفصل الدراسي:</label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="الفصل الدراسي الأول">الفصل الدراسي الأول</option>
                      <option value="الفصل الدراسي الثاني">الفصل الدراسي الثاني</option>
                    </select>
                  </div>
                </div>

                {/* Unit Title Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-800 text-xs">
                      عنوان الوحدة التعليمية الكامل:
                    </label>
                    {availablePresets.length > 0 && (
                      <span className="text-[11px] text-blue-700 font-bold">وحدات مقترحة سريعة:</span>
                    )}
                  </div>

                  <input
                    type="text"
                    value={unitTitle}
                    onChange={(e) => setUnitTitle(e.target.value)}
                    placeholder="مثال: الوحدة الأولى: الأعداد الكلية والعمليات عليها"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />

                  {/* Preset Pills */}
                  {availablePresets.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {availablePresets.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => applyPreset(p)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer text-right"
                        >
                          + {p.unitTitle}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Number of Lessons Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-slate-700 text-xs">
                      عدد الدروس المخططة في الوحدة:
                    </label>
                    <span className="text-xs font-black text-blue-800 tabular-nums">
                      {toArabicDigits(numberOfLessons)} دروس
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {[2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleCountChange(num)}
                        className={`flex-1 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                          numberOfLessons === num
                            ? 'bg-blue-700 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {toArabicDigits(num)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lesson Sequence & Customizer Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-['Tajawal']">
                      <ListOrdered className="w-4 h-4 text-indigo-600" />
                      <span>قائمة وتوزيع دروس الوحدة:</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      يمكنك تعديل أسماء الدروس أو حصصها، أو النقر على الزر الذكي لتوليدها تلقائياً
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAiSuggestLessons}
                    disabled={isSuggesting}
                    className="px-3 py-1.5 bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <Wand2 className={`w-3.5 h-3.5 ${isSuggesting ? 'animate-spin' : ''}`} />
                    <span>{isSuggesting ? 'جارِ الاقتراح...' : 'اقتراح عناوين الدروس بالـ AI'}</span>
                  </button>
                </div>

                {/* Lessons List */}
                <div className="space-y-3">
                  {lessons.map((lesson, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="w-6 h-6 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-black shrink-0 tabular-nums">
                            {toArabicDigits(idx + 1)}
                          </span>
                          <input
                            type="text"
                            value={lesson.title}
                            onChange={(e) => updateLesson(idx, 'title', e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                            placeholder={`عنوان الدرس ${idx + 1}...`}
                          />
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-xl text-xs">
                            <span className="text-[11px] text-slate-500">الحصص:</span>
                            <input
                              type="number"
                              min={1}
                              max={6}
                              value={lesson.periods}
                              onChange={(e) =>
                                updateLesson(idx, 'periods', Number(e.target.value) || 2)
                              }
                              className="w-8 text-center font-bold text-slate-900 bg-transparent text-xs"
                            />
                          </div>

                          {lessons.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeLesson(idx)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="حذف هذا الدرس من الوحدة"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Brief lesson summary */}
                      <input
                        type="text"
                        value={lesson.summary}
                        onChange={(e) => updateLesson(idx, 'summary', e.target.value)}
                        placeholder="نتاجات ومحتوى الدرس باختصار..."
                        className="w-full bg-white/70 border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] text-slate-700"
                      />
                    </div>
                  ))}

                  {lessons.length < 8 && (
                    <button
                      type="button"
                      onClick={addLesson}
                      className="w-full py-2 border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/50 rounded-2xl text-xs font-bold text-slate-600 hover:text-blue-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة درس إضافي للوحدة</span>
                    </button>
                  )}
                </div>

                {/* Pedagogical Focus Notes */}
                <div className="pt-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    توجيهات بيداغوجية خاصة بالوحدة (اختياري):
                  </label>
                  <textarea
                    rows={2}
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                    placeholder="مثل: التركيز على استراتيجيات التعلم النشط، مهمة تقويم أصيل ختامية، ربط بالبيئة المحلية..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* STAGE 2: GENERATION IN PROGRESS */}
          {step === 'generating' && (
            <div className="py-12 px-4 text-center space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-linear-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-blue-500/20 animate-bounce">
                <Boxes className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-900 font-['Tajawal']">
                  جارِ توليد تحضير وحدة «{unitTitle}» بالذكاء الاصطناعي
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  يتم الآن بناء {toArabicDigits(lessons.length)} خطط درس نموذجية متسلسلة تشمل الجداول الرباعية وسلالم التقدير ومهمات GRASPS
                </p>
              </div>

              {/* Progress Bar */}
              <div className="max-w-md mx-auto space-y-2">
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className="bg-linear-to-r from-blue-600 via-indigo-600 to-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>{currentProgressText}</span>
                  <span className="font-mono tabular-nums">{toArabicDigits(progressPercent)}%</span>
                </div>
              </div>

              {/* Current lesson checklist preview */}
              <div className="max-w-md mx-auto bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs text-right space-y-2">
                <span className="text-[11px] font-bold text-slate-400 block mb-1">
                  دروس الوحدة قيد الإعداد:
                </span>
                {lessons.map((l, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    <span className="font-semibold truncate">
                      الدرس {toArabicDigits(i + 1)}: {l.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STAGE 3: RESULTS & REVIEW */}
          {step === 'results' && (
            <div className="space-y-5">
              {/* Success Banner */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-950">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold font-['Tajawal']">
                      تم بنجاح توليد تحضير وحدة: «{unitTitle}»
                    </h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      تتضمن {toArabicDigits(generatedPlans.length)} خطط درس نموذجية متكاملة وجاهزة للاعتماد
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleCopySummary}
                    className="px-3 py-1.5 bg-white text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedSummary ? 'تم النسخ!' : 'نسخ الملخص'}</span>
                  </button>

                  <button
                    onClick={handleExportWordAll}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تصدير الوحدة Word</span>
                  </button>
                </div>
              </div>

              {/* Generated Plans Accordion List */}
              <div className="space-y-3">
                {generatedPlans.map((plan, idx) => {
                  const isExpanded = expandedPlanIdx === idx;
                  return (
                    <div
                      key={plan.id || idx}
                      className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs transition-all"
                    >
                      {/* Plan Header Card */}
                      <div
                        onClick={() => setExpandedPlanIdx(isExpanded ? null : idx)}
                        className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/80 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0">
                            {toArabicDigits(idx + 1)}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs sm:text-sm font-bold text-slate-900 font-['Tajawal']">
                                {plan.header.lessonTitle}
                              </h5>
                              <span className="text-[10px] bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.2 rounded-full font-bold">
                                {toArabicDigits(plan.header.totalPeriods)} حصص
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              مهمة أصيلة: {plan.section3Assessment.graspsTask.title} • {toArabicDigits(plan.section2Timeline.length)} خطوات سير
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-slate-400">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>

                      {/* Expanded Plan Preview */}
                      {isExpanded && (
                        <div className="p-4 pt-0 border-t border-slate-100 bg-slate-50/50 space-y-3 text-xs">
                          {/* Integrative Competencies */}
                          <div>
                            <span className="font-bold text-slate-800 text-[11px] block mb-1">
                              الكفايات التكاملية المستهدفة:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {plan.section1.integrativeCompetencies.slice(0, 2).map((c, ci) => (
                                <div key={ci} className="bg-white p-2 rounded-lg border border-slate-200">
                                  <span className="font-bold text-blue-900 block">{c.title}</span>
                                  <span className="text-[11px] text-slate-600">{c.description}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* GRASPS Task */}
                          <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-3 text-purple-950">
                            <span className="font-bold text-[11px] block mb-0.5">
                              مهمة التقويم الأصيل (GRASPS): {plan.section3Assessment.graspsTask.title}
                            </span>
                            <p className="text-[11px] text-purple-900/90 leading-relaxed">
                              {plan.section3Assessment.graspsTask.fullDescription}
                            </p>
                          </div>

                          {/* Timeline steps overview */}
                          <div>
                            <span className="font-bold text-slate-800 text-[11px] block mb-1">
                              مراحل الحصة (الجدول الرباعي):
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {plan.section2Timeline.map((step, si) => (
                                <span
                                  key={si}
                                  className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-700"
                                >
                                  {step.phaseName} ({toArabicDigits(step.durationMinutes)} د)
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {step === 'config' && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                إلغاء
              </button>

              <button
                type="button"
                onClick={handleGenerateUnitPlans}
                className="px-5 py-2 bg-linear-to-r from-blue-700 via-indigo-700 to-purple-800 hover:from-blue-800 hover:to-purple-900 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-blue-200" />
                <span>توليد تحضير الوحدة كاملة بالذكاء الاصطناعي ({toArabicDigits(lessons.length)} دروس)</span>
              </button>
            </>
          )}

          {step === 'generating' && (
            <div className="w-full text-center text-xs text-slate-500 font-semibold py-1">
              يرجى الانتظار قليلاً ريثما تكتمل صياغة وتوزيع خطط الوحدة...
            </div>
          )}

          {step === 'results' && (
            <>
              <button
                type="button"
                onClick={() => setStep('config')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ArrowRight className="w-4 h-4" />
                <span>تعديل بيانات الوحدة</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  إغلاق
                </button>

                <button
                  type="button"
                  onClick={handleApplyAllPlans}
                  className="px-5 py-2 bg-linear-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>إدراج كافة خطط الوحدة ({toArabicDigits(generatedPlans.length)}) إلى خططي</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
