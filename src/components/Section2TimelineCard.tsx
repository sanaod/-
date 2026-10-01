import React, { useState } from 'react';
import { LessonPhase, LessonPlan } from '../types/lessonPlan';
import {
  Clock,
  PlayCircle,
  Layers,
  CheckCircle2,
  Flag,
  Edit3,
  Check,
  Plus,
  Trash2,
  Sparkles,
  Calculator,
  Compass,
  BookOpen,
  Cpu,
  Target,
  Wand2,
} from 'lucide-react';
import { toArabicDigits } from '../utils/arabicNumerals';

interface Section2TimelineCardProps {
  timeline: LessonPhase[];
  totalMinutes: number;
  onOpenAbacusModal: () => void;
  onOpenExitTicketModal: () => void;
  onChange: (timeline: LessonPhase[]) => void;
  plan?: LessonPlan;
}

export const Section2TimelineCard: React.FC<Section2TimelineCardProps> = ({
  timeline,
  totalMinutes,
  onOpenAbacusModal,
  onOpenExitTicketModal,
  onChange,
  plan,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const currentTotal = timeline.reduce((acc, p) => acc + (p.durationMinutes || 0), 0);

  // Determine contextual interactive simulator tool based on subject & lesson from attached resource/plan
  const subject = plan?.header?.subject || '';
  const lessonTitle = plan?.header?.lessonTitle || '';

  const getInteractiveToolConfig = () => {
    if (/رياضيات/i.test(subject) && /قيمة منزلية|أعداد|منازل/i.test(lessonTitle)) {
      return {
        label: 'المعداد الرقمي التفاعلي',
        shortDesc: 'محاكي تمثيل الأعداد ولوحة المنازل',
        icon: Calculator,
        btnColor: 'bg-emerald-600/80 hover:bg-emerald-600 border-emerald-400/40',
      };
    } else if (/رياضيات/i.test(subject) && /كسور|هندسة|مساحة/i.test(lessonTitle)) {
      return {
        label: 'محاكي الكسور والمجسمات التفاعلي',
        shortDesc: 'أشرطة الكسور والمقارنة البصرية',
        icon: Calculator,
        btnColor: 'bg-teal-600/80 hover:bg-teal-600 border-teal-400/40',
      };
    } else if (/علوم|مادة|طاقة|بيئة|خلية|ماء/i.test(subject) || /مادة|ماء|خلية|كائنات|تنفس|ضوء/i.test(lessonTitle)) {
      return {
        label: 'مختبر المحاكاة العلمي التفاعلي',
        shortDesc: 'محاكاة التجارب والظواهر الحسية',
        icon: Sparkles,
        btnColor: 'bg-cyan-600/80 hover:bg-cyan-600 border-cyan-400/40',
      };
    } else if (/عربية|لغة|قراءة|إملاء|نصوص/i.test(subject) || /قراءة|نص|قصيدة|تعبير/i.test(lessonTitle)) {
      return {
        label: 'مختبر القراءة والمعجم الرقمي التفاعلي',
        shortDesc: 'تحليل النصوص والمفردات والتراكيب',
        icon: BookOpen,
        btnColor: 'bg-blue-600/80 hover:bg-blue-600 border-blue-400/40',
      };
    } else if (/اجتماعية|جغرافيا|تاريخ/i.test(subject) || /فلسطين|خريطة|تضاريس|مدن/i.test(lessonTitle)) {
      return {
        label: 'الخريطة التفاعلية وأطلس فلسطين',
        shortDesc: 'استكشاف معالم وجغرافية الوطن',
        icon: Compass,
        btnColor: 'bg-amber-600/80 hover:bg-amber-600 border-amber-400/40',
      };
    } else if (/تكنولوجيا|حاسوب|برمجة/i.test(subject)) {
      return {
        label: 'محاكي البرمجة والخوارزميات التفاعلي',
        shortDesc: 'تطبيق الأوامر البرمجية والأمان الرقمي',
        icon: Cpu,
        btnColor: 'bg-indigo-600/80 hover:bg-indigo-600 border-indigo-400/40',
      };
    }
    return {
      label: 'الوسيلة الرقمية والمحاكي التفاعلي',
      shortDesc: 'محاكاة تفاعلية للمفاهيم',
      icon: Sparkles,
      btnColor: 'bg-emerald-600/80 hover:bg-emerald-600 border-emerald-400/40',
    };
  };

  const toolConfig = getInteractiveToolConfig();
  const ToolIcon = toolConfig.icon;

  // Extract exit ticket prompt from phase 4 if present
  const phase4 = timeline.find((p) => p.phaseName.includes('الخاتمة') || p.phaseName.includes('التقويم'));
  const exitTicketAction = phase4?.teacherAndStudentActions.find(
    (a) => a.includes('بطاقة الخروج') || a.includes('Exit Ticket')
  );

  const getPhaseColor = (index: number) => {
    switch (index) {
      case 0:
        return { border: 'border-blue-300', bg: 'bg-blue-50/50', badge: 'bg-blue-600', text: 'text-blue-900' };
      case 1:
        return { border: 'border-emerald-300', bg: 'bg-emerald-50/50', badge: 'bg-emerald-600', text: 'text-emerald-900' };
      case 2:
        return { border: 'border-purple-300', bg: 'bg-purple-50/50', badge: 'bg-purple-600', text: 'text-purple-900' };
      default:
        return { border: 'border-rose-300', bg: 'bg-rose-50/50', badge: 'bg-rose-600', text: 'text-rose-900' };
    }
  };

  return (
    <div dir="rtl" className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden text-right">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl text-white shadow-xs">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-bold font-['Tajawal']">
              ثانياً: مخطط سير الحصة والأنشطة المتمركزة حول المتعلم
            </h3>
            <p className="text-xs text-slate-300">
              جدول الحصة التفصيلي الرباعي المتوافق مع المصادر والمراجع المرفقة
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Dynamic interactive simulator shortcut */}
          <button
            onClick={onOpenAbacusModal}
            className={`px-3 py-1.5 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border shadow-2xs ${toolConfig.btnColor}`}
            title={toolConfig.shortDesc}
          >
            <ToolIcon className="w-3.5 h-3.5 text-white/90" />
            <span>{toolConfig.label}</span>
          </button>

          {/* Contextual Exit ticket shortcut */}
          <button
            onClick={onOpenExitTicketModal}
            className="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-rose-400/40 shadow-2xs"
            title="معاينة وطباعة بطاقات الخروج المخصصة للدرس"
          >
            <Flag className="w-3.5 h-3.5 text-rose-200" />
            <span>بطاقة الخروج (Exit Ticket)</span>
          </button>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition-colors"
          >
            {isEditing ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                حفظ
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4" />
                تعديل المخطط
              </>
            )}
          </button>
        </div>
      </div>

      {/* Resource & Simulator Dynamic Match Banner */}
      <div className="px-4 py-2.5 bg-emerald-50/70 border-b border-emerald-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-emerald-950 font-bold">
          <Wand2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>الأداة التفاعلية وبطاقة الخروج مكيفتان تلقائياً وفق المبحث:</span>
          <span className="bg-emerald-700 text-white px-2 py-0.5 rounded-md text-[11px]">
            {subject || 'مبحث معتمد'}
          </span>
          {lessonTitle && (
            <span className="text-slate-600 hidden sm:inline">• الدرس: {toArabicDigits(lessonTitle)}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500">
            مجموع زمن الحصة: {toArabicDigits(currentTotal)} من {toArabicDigits(totalMinutes)} دقيقة
          </span>
        </div>
      </div>

      {/* Phases Timeline Container */}
      <div className="p-4 md:p-6 space-y-5">
        {timeline.map((phase, idx) => {
          const colors = getPhaseColor(idx);
          const isPhase2 = idx === 1; // العرض والاستكشاف
          const isPhase4 = idx === 3 || phase.phaseName.includes('الخاتمة'); // الخاتمة

          return (
            <div
              key={phase.id || idx}
              className={`rounded-2xl border-2 ${colors.border} ${colors.bg} p-4 md:p-5 transition-all space-y-3.5`}
            >
              {/* Phase Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-7 h-7 rounded-xl ${colors.badge} text-white flex items-center justify-center font-bold text-xs shadow-2xs`}
                  >
                    {toArabicDigits(idx + 1)}
                  </span>
                  <div>
                    <h4 className={`text-sm md:text-base font-bold ${colors.text}`}>
                      {toArabicDigits(phase.phaseName)}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-white px-2.5 py-1 rounded-lg border border-slate-300 shadow-2xs">
                    ⏱️ {toArabicDigits(phase.durationMinutes)} دقائق
                  </span>
                  {isEditing && (
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={phase.durationMinutes}
                      onChange={(e) => {
                        const updated = [...timeline];
                        updated[idx].durationMinutes = Number(e.target.value);
                        onChange(updated);
                      }}
                      className="w-16 px-2 py-1 text-xs border border-slate-300 rounded-lg text-center bg-white"
                    />
                  )}
                </div>
              </div>

              {/* Special Contextual Tool Banner in Phase 2 */}
              {isPhase2 && (
                <div className="p-3 bg-linear-to-r from-emerald-100/90 to-teal-50 border border-emerald-300 rounded-xl flex flex-wrap items-center justify-between gap-2 shadow-2xs text-xs">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-700 text-white rounded-lg">
                      <ToolIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-emerald-950">الأداة الرقمية التفاعلية المعتمدة للمصدر:</strong>
                      <span className="text-emerald-800 mr-1.5 font-bold">{toolConfig.label}</span>
                      <span className="text-[11px] text-slate-600 block sm:inline sm:mr-1">({toolConfig.shortDesc})</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenAbacusModal}
                    className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>تشغيل الأداة التفاعلية</span>
                  </button>
                </div>
              )}

              {/* Special Contextual Exit Ticket Banner in Phase 4 */}
              {isPhase4 && (
                <div className="p-3 bg-linear-to-r from-rose-100/90 to-amber-50 border border-rose-300 rounded-xl flex flex-wrap items-center justify-between gap-2 shadow-2xs text-xs">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-rose-700 text-white rounded-lg">
                      <Flag className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-rose-950">بطاقة الخروج السريعة المتوافقة مع الدرس (Exit Ticket):</strong>
                      <div className="text-[11px] text-slate-800 font-semibold mt-0.5">
                        {exitTicketAction
                          ? toArabicDigits(exitTicketAction)
                          : `تطبيق التحدي الختامي الفردي لدرس (${lessonTitle || 'المبحث'}) وتأكيد تحقق النتاجات.`}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenExitTicketModal}
                    className="px-3 py-1 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>معاينة وطباعة البطاقة</span>
                  </button>
                </div>
              )}

              {/* 3 Columns details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* 1. إجراءات المعلم وأنشطة المتعلم */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="font-bold text-slate-800 mb-2 flex items-center gap-1.5 pb-1.5 border-b border-slate-100">
                    <PlayCircle className="w-3.5 h-3.5 text-blue-600" />
                    إجراءات المعلم وأنشطة المتعلم:
                  </div>
                  {isEditing ? (
                    <div className="space-y-1.5">
                      {phase.teacherAndStudentActions.map((act, i) => (
                        <div key={i} className="flex gap-1">
                          <input
                            type="text"
                            value={act}
                            onChange={(e) => {
                              const updated = [...timeline];
                              updated[idx].teacherAndStudentActions[i] = e.target.value;
                              onChange(updated);
                            }}
                            className="w-full p-1 border border-slate-300 rounded-md text-[11px] text-right"
                          />
                          <button
                            onClick={() => {
                              const updated = [...timeline];
                              updated[idx].teacherAndStudentActions.splice(i, 1);
                              onChange(updated);
                            }}
                            className="p-1 text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const updated = [...timeline];
                          updated[idx].teacherAndStudentActions.push('إجراء جديد للمتعلم أو المعلم...');
                          onChange(updated);
                        }}
                        className="text-[11px] text-blue-600 font-bold hover:underline flex items-center gap-0.5 mt-1"
                      >
                        <Plus className="w-3 h-3" /> إضافة إجراء
                      </button>
                    </div>
                  ) : (
                    <ul className="space-y-1.5 text-slate-700 leading-relaxed">
                      {phase.teacherAndStudentActions.map((act, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-blue-500 font-bold">•</span>
                          <span>{toArabicDigits(act)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* 2. الاستراتيجيات ومصادر التعلم */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="font-bold text-slate-800 mb-2 flex items-center gap-1.5 pb-1.5 border-b border-slate-100">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    الاستراتيجيات ومصادر التعلم:
                  </div>
                  {isEditing ? (
                    <div className="space-y-1.5">
                      {phase.strategiesAndResources.map((strat, i) => (
                        <div key={i} className="flex gap-1">
                          <input
                            type="text"
                            value={strat}
                            onChange={(e) => {
                              const updated = [...timeline];
                              updated[idx].strategiesAndResources[i] = e.target.value;
                              onChange(updated);
                            }}
                            className="w-full p-1 border border-slate-300 rounded-md text-[11px] text-right"
                          />
                          <button
                            onClick={() => {
                              const updated = [...timeline];
                              updated[idx].strategiesAndResources.splice(i, 1);
                              onChange(updated);
                            }}
                            className="p-1 text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const updated = [...timeline];
                          updated[idx].strategiesAndResources.push('استراتيجية جديدة...');
                          onChange(updated);
                        }}
                        className="text-[11px] text-emerald-600 font-bold hover:underline flex items-center gap-0.5 mt-1"
                      >
                        <Plus className="w-3 h-3" /> إضافة استراتيجية
                      </button>
                    </div>
                  ) : (
                    <ul className="space-y-1.5 text-slate-700 leading-relaxed">
                      {phase.strategiesAndResources.map((strat, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{toArabicDigits(strat)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* 3. التقويم والتغذية الراجعة */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="font-bold text-slate-800 mb-2 flex items-center gap-1.5 pb-1.5 border-b border-slate-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                    التقويم والتغذية الراجعة:
                  </div>
                  {isEditing ? (
                    <div className="space-y-1.5">
                      {phase.assessmentAndFeedback.map((evalItem, i) => (
                        <div key={i} className="flex gap-1">
                          <input
                            type="text"
                            value={evalItem}
                            onChange={(e) => {
                              const updated = [...timeline];
                              updated[idx].assessmentAndFeedback[i] = e.target.value;
                              onChange(updated);
                            }}
                            className="w-full p-1 border border-slate-300 rounded-md text-[11px] text-right"
                          />
                          <button
                            onClick={() => {
                              const updated = [...timeline];
                              updated[idx].assessmentAndFeedback.splice(i, 1);
                              onChange(updated);
                            }}
                            className="p-1 text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const updated = [...timeline];
                          updated[idx].assessmentAndFeedback.push('أداة تقويم جديدة...');
                          onChange(updated);
                        }}
                        className="text-[11px] text-purple-600 font-bold hover:underline flex items-center gap-0.5 mt-1"
                      >
                        <Plus className="w-3 h-3" /> إضافة تقويم
                      </button>
                    </div>
                  ) : (
                    <ul className="space-y-1.5 text-slate-700 leading-relaxed">
                      {phase.assessmentAndFeedback.map((evalItem, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-purple-500 font-bold">•</span>
                          <span>{toArabicDigits(evalItem)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
