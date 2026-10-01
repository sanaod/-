import React, { useState } from 'react';
import { Section3ContinuousAssessment } from '../types/lessonPlan';
import { Target, Award, Stethoscope, Lightbulb, MessageSquare, Edit3, Check, Sparkles } from 'lucide-react';
import { toArabicDigits } from '../utils/arabicNumerals';

interface Section3AssessmentCardProps {
  data: Section3ContinuousAssessment;
  onChange: (data: Section3ContinuousAssessment) => void;
}

export const Section3AssessmentCard: React.FC<Section3AssessmentCardProps> = ({ data, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeRubricTab, setActiveRubricTab] = useState<'matrix' | 'grader'>('matrix');
  // Interactive grader state (for teacher live evaluation of a student)
  const [studentName, setStudentName] = useState('أحمد محمد');
  const [studentScores, setStudentScores] = useState<number[]>([4, 3, 4, 3]);

  const totalPossible = data.rubric.length * 4;
  const currentTotalScore = studentScores.reduce((a, b) => a + b, 0);
  const percentage = Math.round((currentTotalScore / totalPossible) * 100);

  return (
    <div dir="rtl" className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden text-right">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600 rounded-xl text-white shadow-xs">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-bold font-['Tajawal']">
              ثالثاً: المتابعة والتقويم المستمر والأنشطة العلاجية والبديلة
            </h3>
            <p className="text-xs text-slate-300">
              مهمة التقويم الأصيل GRASPS • سلم التقدير اللفظي Rubric • الدعم العلاجي والإثراء
            </p>
          </div>
        </div>

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
              تعديل التقويم
            </>
          )}
        </button>
      </div>

      <div className="p-5 space-y-6">
        {/* 1. مهمة التقويم الأصيل (GRASPS) */}
        <div className="bg-linear-to-r from-purple-50 via-indigo-50 to-slate-50 border border-purple-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-purple-700" />
            <h4 className="text-sm font-bold text-purple-950 font-['Tajawal']">
              مهمة التقويم الأصيل المعتمدة (GRASPS): {toArabicDigits(data.graspsTask.title)}
            </h4>
          </div>

          {isEditing ? (
            <div className="space-y-3 mt-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">الوصف الكامل للمهمة:</label>
                <textarea
                  rows={3}
                  value={data.graspsTask.fullDescription}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      graspsTask: { ...data.graspsTask, fullDescription: e.target.value },
                    })
                  }
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white text-right"
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-600">الدور (Role):</label>
                  <input
                    type="text"
                    value={data.graspsTask.role}
                    onChange={(e) =>
                      onChange({
                        ...data,
                        graspsTask: { ...data.graspsTask, role: e.target.value },
                      })
                    }
                    className="w-full p-1.5 border border-slate-300 rounded-lg bg-white text-right"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600">الجمهور (Audience):</label>
                  <input
                    type="text"
                    value={data.graspsTask.audience}
                    onChange={(e) =>
                      onChange({
                        ...data,
                        graspsTask: { ...data.graspsTask, audience: e.target.value },
                      })
                    }
                    className="w-full p-1.5 border border-slate-300 rounded-lg bg-white text-right"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600">الموقف (Situation):</label>
                  <input
                    type="text"
                    value={data.graspsTask.situation}
                    onChange={(e) =>
                      onChange({
                        ...data,
                        graspsTask: { ...data.graspsTask, situation: e.target.value },
                      })
                    }
                    className="w-full p-1.5 border border-slate-300 rounded-lg bg-white text-right"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600">المنتج (Product):</label>
                  <input
                    type="text"
                    value={data.graspsTask.product}
                    onChange={(e) =>
                      onChange({
                        ...data,
                        graspsTask: { ...data.graspsTask, product: e.target.value },
                      })
                    }
                    className="w-full p-1.5 border border-slate-300 rounded-lg bg-white text-right"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs text-purple-900 leading-relaxed font-medium bg-white/70 p-3 rounded-xl border border-purple-200/60 my-2">
                {toArabicDigits(data.graspsTask.fullDescription)}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-slate-700 mt-3 pt-2 border-t border-purple-200/50">
                <div className="bg-white/60 p-2 rounded-lg">
                  <span className="font-bold text-purple-900 block">الدور (Role):</span>
                  {data.graspsTask.role}
                </div>
                <div className="bg-white/60 p-2 rounded-lg">
                  <span className="font-bold text-purple-900 block">الجمهور (Audience):</span>
                  {data.graspsTask.audience}
                </div>
                <div className="bg-white/60 p-2 rounded-lg">
                  <span className="font-bold text-purple-900 block">الموقف (Situation):</span>
                  {data.graspsTask.situation}
                </div>
                <div className="bg-white/60 p-2 rounded-lg">
                  <span className="font-bold text-purple-900 block">المنتج (Product):</span>
                  {data.graspsTask.product}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. سلم التقدير اللفظي التحليلي (Rubric) */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-600" />
              <h4 className="text-sm font-bold text-slate-800">
                سلم التقدير اللفظي التحليلي (Rubric) - المستويات (١ إلى ٤):
              </h4>
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setActiveRubricTab('matrix')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  activeRubricTab === 'matrix' ? 'bg-white text-purple-900 shadow-2xs font-bold' : 'text-slate-600'
                }`}
              >
                مصفوفة المعايير
              </button>
              <button
                onClick={() => setActiveRubricTab('grader')}
                className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                  activeRubricTab === 'grader' ? 'bg-white text-purple-900 shadow-2xs font-bold' : 'text-slate-600'
                }`}
              >
                <Sparkles className="w-3 h-3 text-purple-600" />
                أداة رصد الدرجات التفاعلية
              </button>
            </div>
          </div>

          {activeRubricTab === 'matrix' ? (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-right border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200 text-center">
                    <th className="p-3 border-l border-slate-200 w-1/4 text-right">المعيار التقييمي</th>
                    <th className="p-3 border-l border-slate-200 bg-rose-50 text-rose-900 w-[18%]">١: مبتدئ</th>
                    <th className="p-3 border-l border-slate-200 bg-amber-50 text-amber-900 w-[18%]">٢: نامٍ</th>
                    <th className="p-3 border-l border-slate-200 bg-blue-50 text-blue-900 w-[18%]">٣: كفء</th>
                    <th className="p-3 bg-emerald-50 text-emerald-900 w-[21%]">٤: متميز (المعيار الوزاري)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {data.rubric.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-900 border-l border-slate-200 align-top">
                        {toArabicDigits(r.criterion)}
                      </td>
                      <td className="p-3 text-slate-600 border-l border-slate-200 align-top leading-relaxed">
                        {toArabicDigits(r.level1)}
                      </td>
                      <td className="p-3 text-slate-600 border-l border-slate-200 align-top leading-relaxed">
                        {toArabicDigits(r.level2)}
                      </td>
                      <td className="p-3 text-slate-700 border-l border-slate-200 align-top leading-relaxed">
                        {toArabicDigits(r.level3)}
                      </td>
                      <td className="p-3 text-emerald-950 font-medium align-top leading-relaxed bg-emerald-50/20">
                        {toArabicDigits(r.level4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-purple-50/40 border border-purple-200 rounded-2xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-200/80 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">تقييم الطالب/ـة:</span>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="px-2.5 py-1 text-xs font-bold bg-white border border-purple-300 rounded-lg text-right"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xs font-bold text-purple-900">
                    النتيجة المحققة:{' '}
                    <span className="text-sm font-bold text-purple-700">
                      {toArabicDigits(currentTotalScore)} من {toArabicDigits(totalPossible)} ({toArabicDigits(percentage)}٪)
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      percentage >= 85
                        ? 'bg-emerald-100 text-emerald-800'
                        : percentage >= 70
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {percentage >= 85 ? 'متميز (الدرجة ٤)' : percentage >= 70 ? 'كفء' : 'يحتاج دعماً'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {data.rubric.map((r, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="text-xs font-bold text-slate-800 mb-2">{toArabicDigits(r.criterion)}</div>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      {[1, 2, 3, 4].map((lvl) => {
                        const isSelected = studentScores[idx] === lvl;
                        return (
                          <button
                            key={lvl}
                            onClick={() => {
                              const updated = [...studentScores];
                              updated[idx] = lvl;
                              setStudentScores(updated);
                            }}
                            className={`p-2 rounded-lg border text-right transition-all text-[11px] ${
                              isSelected
                                ? 'border-purple-600 bg-purple-100/70 text-purple-950 font-bold ring-2 ring-purple-400'
                                : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                            }`}
                          >
                            <div className="font-bold mb-1">
                              مستوى {toArabicDigits(lvl)}: {lvl === 1 ? 'مبتدئ' : lvl === 2 ? 'نامٍ' : lvl === 3 ? 'كفء' : 'متميز'}
                            </div>
                            <div className="line-clamp-2 text-[10px] opacity-80">
                              {toArabicDigits(lvl === 1 ? r.level1 : lvl === 2 ? r.level2 : lvl === 3 ? r.level3 : r.level4)}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. الأنشطة العلاجية والبديلة */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-5">
          {/* العلاجية */}
          <div className="p-4 rounded-xl bg-rose-50/40 border border-rose-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-rose-950 text-sm">
              <Stethoscope className="w-4 h-4 text-rose-600" />
              الأنشطة العلاجية (دعم ذوي الأداء دون المتوقع):
            </div>
            {data.remedialActivities.map((rem, i) => (
              <div key={i} className="bg-white p-2.5 rounded-lg border border-rose-100">
                <span className="font-bold text-rose-900 block">{toArabicDigits(rem.title)}:</span>
                <p className="text-slate-700 mt-0.5 leading-relaxed">{toArabicDigits(rem.description)}</p>
              </div>
            ))}
          </div>

          {/* الإثرائية */}
          <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              الأنشطة البديلة والإثرائية (تحدي مواهب الطلبة):
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-amber-100">
              <span className="font-bold text-amber-900 block">{data.enrichmentActivities.title}:</span>
              <p className="text-slate-700 mt-0.5 leading-relaxed">
                {toArabicDigits(data.enrichmentActivities.puzzleOrChallenge)}
              </p>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-amber-100">
              <span className="font-bold text-amber-900 block">تدريب الأقران والمعلم الصغير:</span>
              <p className="text-slate-700 mt-0.5 leading-relaxed">
                {toArabicDigits(data.enrichmentActivities.peerTutoring)}
              </p>
            </div>
          </div>
        </div>

        {/* 4. التغذية الراجعة الفورية */}
        <div className="border-t border-slate-100 pt-5">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-bold text-slate-800">
              التغذية الراجعة الفورية المعتمدة في الخطة:
            </h4>
          </div>
          <div className="space-y-2 text-xs">
            {data.immediateFeedback.map((fb, i) => (
              <div
                key={i}
                className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl text-emerald-950 leading-relaxed"
              >
                • {toArabicDigits(fb)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
