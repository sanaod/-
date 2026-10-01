import React, { useState } from 'react';
import { LessonPhase } from '../types/lessonPlan';
import { Clock, PlayCircle, Layers, CheckCircle2, Flag, Edit3, Check, Plus, Trash2, Sparkles } from 'lucide-react';
import { toArabicDigits } from '../utils/arabicNumerals';

interface Section2TimelineCardProps {
  timeline: LessonPhase[];
  totalMinutes: number;
  onOpenAbacusModal: () => void;
  onOpenExitTicketModal: () => void;
  onChange: (timeline: LessonPhase[]) => void;
}

export const Section2TimelineCard: React.FC<Section2TimelineCardProps> = ({
  timeline,
  totalMinutes,
  onOpenAbacusModal,
  onOpenExitTicketModal,
  onChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const currentTotal = timeline.reduce((acc, p) => acc + (p.durationMinutes || 0), 0);

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
              جدول الحصة التفصيلي الرباعي (التمهيد، العرض، التطبيق، الخاتمة)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick interactive shortcuts */}
          <button
            onClick={onOpenAbacusModal}
            className="px-3 py-1.5 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-emerald-400/40"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            المعداد الرقمي التفاعلي
          </button>
          <button
            onClick={onOpenExitTicketModal}
            className="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-rose-400/40"
          >
            <Flag className="w-3.5 h-3.5 text-rose-200" />
            بطاقة الخروج (Exit Ticket)
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

      {/* Progress & Time summary bar */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">توزيع زمن الحصة المبرمج:</span>
          <span
            className={`px-2.5 py-0.5 rounded-full font-bold ${
              currentTotal === totalMinutes
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}
          >
            {toArabicDigits(currentTotal)} دقيقة من إجمالي {toArabicDigits(totalMinutes)} دقيقة
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span>المعايير المعتمدة: التمهيد ٥د • العرض ١٥د • التطبيق ١٢د • الخاتمة ٨د</span>
        </div>
      </div>

      {/* Table / Timeline view */}
      <div className="p-5 space-y-4">
        {timeline.map((phase, idx) => {
          const colors = getPhaseColor(idx);
          return (
            <div
              key={phase.id}
              className={`rounded-2xl border ${colors.border} ${colors.bg} p-4.5 transition-all hover:shadow-xs`}
            >
              {/* Phase header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-white font-bold text-xs ${colors.badge}`}>
                    المرحلة {toArabicDigits(idx + 1)}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 font-['Tajawal']">
                    {toArabicDigits(phase.phaseName)}
                  </h4>
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
                          <span className="text-emerald-500 font-bold">-</span>
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
                      {phase.assessmentAndFeedback.map((fb, i) => (
                        <div key={i} className="flex gap-1">
                          <input
                            type="text"
                            value={fb}
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
                          updated[idx].assessmentAndFeedback.push('أداة تقويم أو تغذية راجعة...');
                          onChange(updated);
                        }}
                        className="text-[11px] text-purple-600 font-bold hover:underline flex items-center gap-0.5 mt-1"
                      >
                        <Plus className="w-3 h-3" /> إضافة تقويم
                      </button>
                    </div>
                  ) : (
                    <ul className="space-y-1.5 text-slate-700 leading-relaxed">
                      {phase.assessmentAndFeedback.map((fb, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-purple-500 font-bold">*</span>
                          <span>{toArabicDigits(fb)}</span>
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
