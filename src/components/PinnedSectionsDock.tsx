import React, { useState, useEffect } from 'react';
import { LessonPlan } from '../types/lessonPlan';
import {
  Pin,
  PinOff,
  Minimize2,
  Maximize2,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  Clock,
  Target,
  Compass,
  FileText,
  Users2,
  Award,
  BookOpen,
  X,
  LayoutTemplate,
  MoveUp,
} from 'lucide-react';
import { toArabicDigits } from '../utils/arabicNumerals';
import { getStageOrdinal, formatStageNameWithOrdinal } from '../utils/executivePlanDefaults';

export interface PinnedSectionMeta {
  id: string;
  title: string;
  shortTitle: string;
  model: 'executive' | 'adaptive';
  icon: any;
}

export const ALL_SECTIONS_META: Record<string, PinnedSectionMeta> = {
  // Executive Model
  'sec-exec-1': {
    id: 'sec-exec-1',
    title: 'أولاً: البيانات العامة وكفايات التعلّم والأهداف الذكية',
    shortTitle: 'البيانات والأهداف الذكية (SMART)',
    model: 'executive',
    icon: Target,
  },
  'sec-exec-2': {
    id: 'sec-exec-2',
    title: 'ثانياً: تفاصيل خطة التنفيذ التنفيذية للدرس (المراحل الخمس)',
    shortTitle: 'تفاصيل مراحل الدرس الخمس',
    model: 'executive',
    icon: Clock,
  },
  'sec-exec-3': {
    id: 'sec-exec-3',
    title: 'ثالثاً: ملاحظات وتأملات المعلم حول الدرس',
    shortTitle: 'تأملات المعلم ونقاط القوة',
    model: 'executive',
    icon: Compass,
  },
  'sec-exec-4': {
    id: 'sec-exec-4',
    title: 'رابعاً: التوقيع والاعتماد الرسمي',
    shortTitle: 'التوقيعات والاعتماد الرسمي',
    model: 'executive',
    icon: FileText,
  },

  // Adaptive Model
  'sec-adapt-header': {
    id: 'sec-adapt-header',
    title: 'البيانات العامة وترويسة الدرس الرسمية',
    shortTitle: 'ترويسة الدرس والبيانات',
    model: 'adaptive',
    icon: BookOpen,
  },
  'sec-adapt-1': {
    id: 'sec-adapt-1',
    title: '١. التخطيط التكيفي، الكفايات والأسئلة التأملية',
    shortTitle: 'التخطيط التكيفي والكفايات',
    model: 'adaptive',
    icon: Compass,
  },
  'sec-adapt-2': {
    id: 'sec-adapt-2',
    title: '٢. سير الحصة الرباعي ومراحل التنفيذ',
    shortTitle: 'سير الحصة الرباعي والزمن',
    model: 'adaptive',
    icon: Clock,
  },
  'sec-adapt-3': {
    id: 'sec-adapt-3',
    title: '٣. التقويم الأصيل GRASPS وسلالم التقدير',
    shortTitle: 'التقويم الأصيل GRASPS',
    model: 'adaptive',
    icon: Target,
  },
  'sec-adapt-4': {
    id: 'sec-adapt-4',
    title: '٤. بيئة التعلم والشراكة الوالدية والمجتمعية',
    shortTitle: 'بيئة التعلم والشراكة الوالدية',
    model: 'adaptive',
    icon: Users2,
  },
  'sec-adapt-5': {
    id: 'sec-adapt-5',
    title: '٥. التأمل الذاتي والنمو المهني الـ PLC',
    shortTitle: 'التأمل الذاتي والـ PLC',
    model: 'adaptive',
    icon: Sparkles,
  },
  'sec-adapt-6': {
    id: 'sec-adapt-6',
    title: '٦. الاعتماد والتوقيع الرسمي',
    shortTitle: 'الاعتماد والتوقيع',
    model: 'adaptive',
    icon: FileText,
  },
};

interface PinnedSectionsDockProps {
  plan: LessonPlan;
  pinnedSectionIds: string[];
  onTogglePin: (sectionId: string) => void;
  onClearAllPins?: () => void;
}

export const PinnedSectionsDock: React.FC<PinnedSectionsDockProps> = ({
  plan,
  pinnedSectionIds,
  onTogglePin,
  onClearAllPins,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [dockPosition, setDockPosition] = useState<'floating' | 'top-bar'>('floating');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Sync active tab with available pinned sections
  useEffect(() => {
    if (pinnedSectionIds.length > 0) {
      if (!pinnedSectionIds.includes(activeTabId)) {
        setActiveTabId(pinnedSectionIds[0]);
      }
    } else {
      setActiveTabId('');
    }
  }, [pinnedSectionIds, activeTabId]);

  if (!pinnedSectionIds || pinnedSectionIds.length === 0) {
    return null;
  }

  const currentSectionId = activeTabId || pinnedSectionIds[0];
  const meta = ALL_SECTIONS_META[currentSectionId] || {
    id: currentSectionId,
    title: 'قسم مثبت',
    shortTitle: 'قسم مثبت',
    model: 'executive',
    icon: Pin,
  };
  const IconComponent = meta.icon || Pin;

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 2000);
  };

  const handleScrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Add a temporal pulse highlight
      el.classList.add('ring-4', 'ring-amber-400', 'ring-offset-2', 'transition-all');
      setTimeout(() => {
        el.classList.remove('ring-4', 'ring-amber-400', 'ring-offset-2');
      }, 2500);
    }
  };

  const renderSectionContent = () => {
    const execData = plan.executiveData;

    // 1. Executive Section 1: Objectives & General Data
    if (currentSectionId === 'sec-exec-1') {
      const smartObjectives = execData?.smartObjectives || [];
      return (
        <div className="space-y-3 text-right">
          {/* Quick Context Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-2 bg-emerald-50 rounded-xl border border-emerald-200/70 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 font-bold block">المبحث:</span>
              <span className="font-black text-emerald-900 truncate block">{plan.header.subject || 'غير محدد'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold block">الصف:</span>
              <span className="font-black text-emerald-900 truncate block">{plan.header.grade || 'غير محدد'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold block">عنوان الدرس:</span>
              <span className="font-black text-emerald-900 truncate block">{plan.header.lessonTitle || 'غير محدد'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold block">الفترة / الحصص:</span>
              <span className="font-black text-emerald-900 truncate block">
                {toArabicDigits(plan.header.totalPeriods || 1)} حصص ({toArabicDigits(plan.header.periodDurationMinutes || 40)} د)
              </span>
            </div>
          </div>

          {/* Targeted Competencies */}
          {(execData?.learningCompetencies || execData?.valuesAndEthics) && (
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="font-black text-slate-800 flex items-center gap-1.5 text-[11px]">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span>الكفايات المستهدفة والقيم:</span>
              </div>
              {execData.learningCompetencies && (
                <p className="text-[11px] text-slate-700 leading-snug">
                  <span className="font-bold text-emerald-800">كفايات التعلّم: </span>
                  {execData.learningCompetencies}
                </p>
              )}
              {execData.valuesAndEthics && (
                <p className="text-[11px] text-slate-700 leading-snug">
                  <span className="font-bold text-teal-800">القيم والأخلاق: </span>
                  {execData.valuesAndEthics}
                </p>
              )}
            </div>
          )}

          {/* SMART Objectives List (Primary reason teachers pin this section!) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-black text-slate-900">
                  الأهداف الذكية SMART ({toArabicDigits(smartObjectives.length)}):
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                انسخ أي هدف بضغطة زر لاستخدامه في الأنشطة أدناه
              </span>
            </div>

            {smartObjectives.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-2 bg-slate-50 rounded-lg">لم يتم إدخال أهداف ذكية بعد.</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5 pl-1 scrollbar-thin">
                {smartObjectives.map((goal, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-2 p-2 bg-white rounded-lg border border-sky-100 hover:border-sky-300 shadow-2xs group transition-all"
                  >
                    <div className="flex items-start gap-2 flex-1">
                      <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-900 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                        {toArabicDigits(idx + 1)}
                      </span>
                      <p className="text-xs text-slate-800 leading-relaxed font-medium">{goal}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyText(goal, `goal-${idx}`)}
                      className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 shrink-0 transition-all cursor-pointer ${
                        copiedKey === `goal-${idx}`
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 hover:bg-sky-100 text-slate-700 hover:text-sky-900'
                      }`}
                      title="نسخ نص الهدف إلى الحافظة"
                    >
                      {copiedKey === `goal-${idx}` ? (
                        <>
                          <Check className="w-3 h-3 text-white" />
                          <span>تم!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-500" />
                          <span>نسخ</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    // 2. Executive Section 2: Stages List
    if (currentSectionId === 'sec-exec-2') {
      const stages = execData?.executiveStages || [];
      return (
        <div className="space-y-2 text-right">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">مراحل خطة التنفيذ التنفيذية (٥ مراحل):</span>
            <span className="text-[10px] text-slate-500">
              إجمالي الزمن: {toArabicDigits(stages.reduce((acc, s) => acc + (s.durationMinutes || 0), 0))} دقيقة
            </span>
          </div>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5 pl-1 scrollbar-thin">
            {stages.map((st) => (
              <div
                key={st.id}
                className="p-2.5 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 shadow-2xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-800 text-white text-[10px] font-black">
                      {getStageOrdinal(st.id)}
                    </span>
                    <span className="text-xs font-black text-slate-900">
                      {formatStageNameWithOrdinal(st.stageName, st.id)}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-800 px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-200">
                    {toArabicDigits(st.durationMinutes)} د
                  </span>
                </div>
                {st.goals && (
                  <p className="text-[11px] text-slate-600 line-clamp-2">
                    <span className="font-bold text-slate-800">الأهداف: </span>
                    {st.goals}
                  </p>
                )}
                {st.procedures?.mainDescription && (
                  <p className="text-[11px] text-slate-700 bg-slate-50 p-1.5 rounded-lg border border-slate-100 line-clamp-2">
                    <span className="font-bold text-emerald-900">الإجراءات: </span>
                    {st.procedures.mainDescription}
                  </p>
                )}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-500">
                  <span>التقويم: {st.assessment ? st.assessment.substring(0, 40) + '...' : 'غير محدد'}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyText(st.procedures?.mainDescription || st.goals || '', `stage-${st.id}`)}
                    className="text-emerald-700 hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
                  >
                    <Copy className="w-2.5 h-2.5" />
                    <span>نسخ</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 3. Executive Section 3: Reflection
    if (currentSectionId === 'sec-exec-3') {
      const ref = execData?.teacherReflection;
      return (
        <div className="space-y-2 text-right text-xs">
          <div className="p-2 bg-amber-50 rounded-lg border border-amber-200">
            <span className="font-black text-amber-900 block text-[11px] mb-0.5">نقاط القوة في الدرس:</span>
            <p className="text-slate-800 text-[11px] leading-relaxed">{ref?.strengths || 'لم تُدون بعد'}</p>
          </div>
          <div className="p-2 bg-rose-50 rounded-lg border border-rose-200">
            <span className="font-black text-rose-900 block text-[11px] mb-0.5">فرص التحسين والتطوير:</span>
            <p className="text-slate-800 text-[11px] leading-relaxed">{ref?.improvementsNeeded || 'لم تُدون بعد'}</p>
          </div>
          <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
            <span className="font-black text-blue-900 block text-[11px] mb-0.5">مقترحات للدروس القادمة:</span>
            <p className="text-slate-800 text-[11px] leading-relaxed">{ref?.futureSuggestions || 'لم تُدون بعد'}</p>
          </div>
        </div>
      );
    }

    // 4. Executive Section 4 / Signatures
    if (currentSectionId === 'sec-exec-4' || currentSectionId === 'sec-adapt-6') {
      const sigs = plan.section6Signatures;
      return (
        <div className="space-y-2 text-right text-xs">
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div className="flex justify-between font-bold text-slate-800 text-[11px]">
              <span>معلم المبحث: {sigs?.teacher?.name || plan.header.teacherName || 'غير مسجل'}</span>
              <span>التاريخ: {sigs?.teacher?.date || plan.header.date || '—'}</span>
            </div>
            {sigs?.teacher?.notes && <p className="text-[10px] text-slate-600">ملاحظات: {sigs.teacher.notes}</p>}
          </div>
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div className="flex justify-between font-bold text-slate-800 text-[11px]">
              <span>مدير المدرسة: {sigs?.schoolPrincipal?.name || plan.header.principalName || 'غير مسجل'}</span>
              <span>التاريخ: {sigs?.schoolPrincipal?.date || '—'}</span>
            </div>
            {sigs?.schoolPrincipal?.directives && (
              <p className="text-[10px] text-slate-600">توجيهات: {sigs.schoolPrincipal.directives}</p>
            )}
          </div>
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div className="flex justify-between font-bold text-slate-800 text-[11px]">
              <span>المشرف التربوي: {sigs?.educationalSupervisor?.name || plan.header.supervisorName || 'غير مسجل'}</span>
              <span>التاريخ: {sigs?.educationalSupervisor?.date || '—'}</span>
            </div>
            {sigs?.educationalSupervisor?.directives && (
              <p className="text-[10px] text-slate-600">توجيهات: {sigs.educationalSupervisor.directives}</p>
            )}
          </div>
        </div>
      );
    }

    // Adaptive Section Header
    if (currentSectionId === 'sec-adapt-header') {
      return (
        <div className="space-y-2 text-right text-xs">
          <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 font-bold block">المدرسة:</span>
              <span className="font-bold text-slate-800">{plan.header.school || 'غير محدد'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold block">المعلم:</span>
              <span className="font-bold text-slate-800">{plan.header.teacherName || 'غير محدد'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold block">المبحث والصف:</span>
              <span className="font-bold text-slate-800">
                {plan.header.subject} - {plan.header.grade}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold block">عنوان الدرس:</span>
              <span className="font-black text-emerald-800">{plan.header.lessonTitle || 'غير محدد'}</span>
            </div>
          </div>
        </div>
      );
    }

    // Adaptive Section 1
    if (currentSectionId === 'sec-adapt-1') {
      const s1 = plan.section1;
      return (
        <div className="space-y-2 text-right text-xs">
          {s1?.integrativeCompetencies && s1.integrativeCompetencies.length > 0 && (
            <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 space-y-1">
              <span className="font-black text-emerald-900 block text-[11px]">الكفايات التكاملية:</span>
              {s1.integrativeCompetencies.map((c, i) => (
                <p key={i} className="text-slate-800 text-[11px] leading-relaxed">
                  • <span className="font-bold">{c.title}:</span> {c.description}
                </p>
              ))}
            </div>
          )}
          {s1?.reflectiveQuestions && s1.reflectiveQuestions.length > 0 && (
            <div className="p-2 bg-teal-50 rounded-lg border border-teal-200 space-y-1">
              <span className="font-black text-teal-900 block text-[11px]">الأسئلة التأملية المحفزة:</span>
              {s1.reflectiveQuestions.map((q, i) => (
                <p key={i} className="text-slate-800 text-[11px] leading-relaxed">
                  ❓ {q}
                </p>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Adaptive Section 2
    if (currentSectionId === 'sec-adapt-2') {
      const timeline = plan.section2Timeline || [];
      return (
        <div className="space-y-1.5 text-right text-xs max-h-56 overflow-y-auto pr-0.5 pl-1 scrollbar-thin">
          {timeline.map((phase, idx) => (
            <div key={idx} className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1">
              <div className="flex justify-between font-bold text-slate-900">
                <span>
                  {toArabicDigits(idx + 1)}. {phase.phaseName}
                </span>
                <span className="text-emerald-700">{toArabicDigits(phase.durationMinutes)} دقيقة</span>
              </div>
              {phase.teacherAndStudentActions && phase.teacherAndStudentActions.length > 0 && (
                <p className="text-[11px] text-slate-600 line-clamp-2">
                  {phase.teacherAndStudentActions.join(' • ')}
                </p>
              )}
            </div>
          ))}
        </div>
      );
    }

    // Adaptive Section 3 (GRASPS)
    if (currentSectionId === 'sec-adapt-3') {
      const grasps = plan.section3Assessment?.graspsTask;
      return (
        <div className="space-y-1.5 text-right text-xs">
          <div className="grid grid-cols-2 gap-1.5">
            <div className="p-2 bg-purple-50 rounded-lg border border-purple-200">
              <span className="text-[10px] font-black text-purple-900 block">الهدف (Goal):</span>
              <span className="text-[11px] text-slate-800">{grasps?.title || grasps?.fullDescription || '—'}</span>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg border border-purple-200">
              <span className="text-[10px] font-black text-purple-900 block">الدور (Role):</span>
              <span className="text-[11px] text-slate-800">{grasps?.role || '—'}</span>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg border border-purple-200">
              <span className="text-[10px] font-black text-purple-900 block">الجمهور (Audience):</span>
              <span className="text-[11px] text-slate-800">{grasps?.audience || '—'}</span>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg border border-purple-200">
              <span className="text-[10px] font-black text-purple-900 block">المنتج (Product):</span>
              <span className="text-[11px] text-slate-800">{grasps?.product || '—'}</span>
            </div>
          </div>
        </div>
      );
    }

    // Default fallback
    return (
      <div className="p-3 text-center text-xs text-slate-500 bg-slate-50 rounded-lg">
        القسم مثبت ويتم حفظ بياناته مباشرة مع محرر الخطة.
      </div>
    );
  };

  // Top Docked Mode (Sticky Bar at top of viewport)
  if (dockPosition === 'top-bar') {
    return (
      <aside
        aria-label="شريط الأقسام المثبتة العلوي"
        className="fixed top-14 left-0 right-0 z-40 bg-slate-900/95 text-white border-b-2 border-amber-400 shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-top-2 duration-200 no-print"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-400 text-slate-950 rounded-lg text-xs font-black shadow-xs">
                <Pin className="w-3.5 h-3.5 rotate-45 fill-slate-950" />
                <span>أقسام مثبتة ({toArabicDigits(pinnedSectionIds.length)})</span>
              </div>

              {/* Tabs for pinned sections */}
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none max-w-md">
                {pinnedSectionIds.map((id) => {
                  const sMeta = ALL_SECTIONS_META[id] || { shortTitle: id };
                  const isActive = id === currentSectionId;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setActiveTabId(id)}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      {sMeta.shortTitle}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleScrollToSection(currentSectionId)}
                className="px-2 py-1 bg-emerald-700/80 hover:bg-emerald-700 text-emerald-100 rounded-md font-bold flex items-center gap-1 cursor-pointer transition-colors"
                title="التمرير المباشر لهذا القسم في الصفحة"
              >
                <ExternalLink className="w-3 h-3" />
                <span className="hidden sm:inline">انتقال للقسم</span>
              </button>

              <button
                type="button"
                onClick={() => setDockPosition('floating')}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md font-bold flex items-center gap-1 cursor-pointer transition-colors"
                title="تحويل إلى نافذة عائمة جانبية"
              >
                <LayoutTemplate className="w-3 h-3 text-amber-300" />
                <span className="hidden sm:inline">نافذة عائمة</span>
              </button>

              <button
                type="button"
                onClick={() => onTogglePin(currentSectionId)}
                className="px-2 py-1 bg-rose-900/60 hover:bg-rose-800 text-rose-200 rounded-md font-bold flex items-center gap-1 cursor-pointer transition-colors"
                title="إلغاء تثبيت هذا القسم"
              >
                <PinOff className="w-3 h-3" />
                <span className="hidden sm:inline">إلغاء التثبيت</span>
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                title={isExpanded ? 'طي المحتوى' : 'توسيع المحتوى'}
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Expanded Drawer Content */}
          {isExpanded && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-700 max-h-64 overflow-y-auto">
              <div className="bg-white text-slate-900 p-3 rounded-xl shadow-inner">{renderSectionContent()}</div>
            </div>
          )}
        </div>
      </aside>
    );
  }

  // Floating Window Mode (Default bottom-left corner in RTL)
  return (
    <aside
      aria-label="نافذة الأقسام المثبتة العائمة"
      className="fixed bottom-16 sm:bottom-6 left-3 sm:left-6 z-40 max-w-[94vw] sm:max-w-md w-full transition-all duration-300 text-slate-900 font-['Cairo',sans-serif] no-print"
    >
      {/* Minimized Pill */}
      {!isExpanded ? (
        <div className="flex items-center gap-1.5 bg-slate-900/95 text-white p-1.5 pl-3 rounded-2xl shadow-2xl border-2 border-amber-400 backdrop-blur-md animate-bounce-subtle">
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-2 hover:text-amber-300 transition-colors cursor-pointer text-xs font-black"
          >
            <div className="w-7 h-7 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
              <Pin className="w-3.5 h-3.5 rotate-45 fill-slate-950" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1.5">
                <span className="text-amber-300">📌 قسم مثبت</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-emerald-300 font-bold">
                  {toArabicDigits(pinnedSectionIds.length)}
                </span>
              </div>
              <p className="text-[10px] text-slate-300 truncate max-w-[180px] sm:max-w-[220px]">
                {meta.shortTitle}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 cursor-pointer"
            title="توسيع النافذة"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        /* Expanded Floating Card */
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-amber-400/90 overflow-hidden ring-4 ring-slate-950/10 flex flex-col max-h-[82vh] sm:max-h-[580px]">
          {/* Card Header */}
          <div className="bg-linear-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-3 sm:p-3.5 flex items-center justify-between gap-2 border-b border-amber-400/50">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-xs">
                <Pin className="w-4 h-4 rotate-45 fill-slate-950" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    📌 لوحة الأقسام المثبتة ({toArabicDigits(pinnedSectionIds.length)})
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-black text-white truncate">{meta.shortTitle}</h3>
              </div>
            </div>

            {/* Header Control Buttons */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => handleScrollToSection(currentSectionId)}
                className="p-1.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-emerald-200 hover:text-white transition-colors cursor-pointer"
                title="التمرير المباشر لهذا القسم في الصفحة"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setDockPosition('top-bar')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 transition-colors cursor-pointer"
                title="تثبيت كشريط علوي دائم"
              >
                <LayoutTemplate className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                title="تصغير النافذة"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => onTogglePin(currentSectionId)}
                className="p-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 transition-colors cursor-pointer"
                title="إلغاء تثبيت هذا القسم"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Sub-tabs if multiple sections are pinned */}
          {pinnedSectionIds.length > 1 && (
            <div className="bg-slate-100 p-1.5 border-b border-slate-200 flex items-center gap-1 overflow-x-auto scrollbar-none">
              {pinnedSectionIds.map((id) => {
                const sMeta = ALL_SECTIONS_META[id] || { shortTitle: id };
                const isActive = id === currentSectionId;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTabId(id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-slate-200'
                    }`}
                  >
                    {sMeta.shortTitle}
                  </button>
                );
              })}
            </div>
          )}

          {/* Body Content */}
          <div className="p-3.5 overflow-y-auto flex-1 space-y-3 bg-slate-50/50">
            {renderSectionContent()}
          </div>

          {/* Footer Bar */}
          <div className="bg-white p-2.5 px-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
              <span>يظل هذا القسم معروضاً أمامك أثناء كتابة باقي أقسام الخطة.</span>
            </div>
            {onClearAllPins && pinnedSectionIds.length > 1 && (
              <button
                type="button"
                onClick={onClearAllPins}
                className="text-[10px] text-rose-600 hover:text-rose-800 font-bold hover:underline cursor-pointer"
              >
                إلغاء تثبيت الكل
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};
