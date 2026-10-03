import React, { useState } from 'react';
import { Section1AdaptivePlanning } from '../types/lessonPlan';
import { Compass, Users, BookOpen, ShieldCheck, HelpCircle, Edit3, Check, Sparkles, Loader2, Layers } from 'lucide-react';
import { toArabicDigits } from '../utils/arabicNumerals';

interface Section1CardProps {
  data: Section1AdaptivePlanning;
  lessonContext: { subject: string; grade: string; lessonTitle: string };
  onChange: (data: Section1AdaptivePlanning) => void;
  onOpenResourcesModal?: () => void;
}

export const Section1Card: React.FC<Section1CardProps> = ({ data, lessonContext, onChange, onOpenResourcesModal }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [refining, setRefining] = useState(false);

  const handleRefineWithAi = async () => {
    setRefining(true);
    try {
      const res = await fetch('/api/refine-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionName: 'أولاً: عملية التحليل والتخطيط التكيفي (الكفايات والأسئلة التأملية والتكيف)',
          currentContent: data,
          instruction: 'قم بتحسين الصياغة لتعزيز التفكير الناقد والمواطنة وتعميق الأسئلة التأملية ومصادر التعلم المفتوحة OER باللغة العربية وبأرقام عربية مشرقية.',
          lessonContext,
        }),
      });
      const result = await res.json();
      if (result.refinedText) {
        alert('تم تحسين الصياغة بنجاح من المساعد التربوي الذكي! يمكنك مراجعتها.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRefining(false);
    }
  };

  return (
    <div dir="rtl" className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden text-right">
      {/* Section Header */}
      <div className="bg-slate-900 text-white p-4.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-xs">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-bold font-['Tajawal']">
              أولاً: عملية التحليل والتخطيط التكيفي
            </h3>
            <p className="text-xs text-slate-300">
              (المحتوى، البيئة التعليمية، المصادر، والمتعلمين)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefineWithAi}
            disabled={refining}
            className="px-3 py-1.5 bg-emerald-600/80 hover:bg-emerald-600 text-emerald-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-emerald-400/30"
          >
            {refining ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            )}
            تحسين ذكي بالـ AI
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
                تعديل القسم
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-3.5 sm:p-5 space-y-6">
        {/* 1. الكفايات التكاملية المستهدفة */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-600" />
            <h4 className="text-sm font-bold text-slate-800">الكفايات التكاملية المستهدفة:</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.integrativeCompetencies.map((comp, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-emerald-200/80 bg-emerald-50/40 relative hover:border-emerald-300 transition-colors"
              >
                <div className="text-xs font-bold text-emerald-950 mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {toArabicDigits(comp.title)}
                </div>
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={comp.description}
                    onChange={(e) => {
                      const updated = [...data.integrativeCompetencies];
                      updated[idx].description = e.target.value;
                      onChange({ ...data, integrativeCompetencies: updated });
                    }}
                    className="w-full text-xs p-1.5 border border-slate-300 rounded-lg bg-white text-right"
                  />
                ) : (
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {comp.description ? toArabicDigits(comp.description) : (
                      <span className="text-slate-400 font-normal italic text-[11px] block">
                        [انقر على "تعديل القسم" أو "تحسين ذكي بالـ AI" لصياغة هذه الكفاية...]
                      </span>
                    )}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 2. خصائص الطلبة والتخطيط التكيفي */}
        <div className="border-t border-slate-100 pt-5">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-blue-600" />
            <h4 className="text-sm font-bold text-slate-800">تحليل خصائص الطلبة والتخطيط التكيفي:</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-blue-50/40 border border-blue-200">
              <span className="font-bold text-blue-900 block mb-1">الفروق الفردية:</span>
              {isEditing ? (
                <textarea
                  rows={3}
                  value={data.studentCharacteristics.individualDifferences}
                  placeholder="مراعاة الفروق الفردية وتقسيم المجموعات..."
                  onChange={(e) =>
                    onChange({
                      ...data,
                      studentCharacteristics: {
                        ...data.studentCharacteristics,
                        individualDifferences: e.target.value,
                      },
                    })
                  }
                  className="w-full p-1.5 border border-slate-300 rounded-lg bg-white text-right"
                />
              ) : (
                <p className="text-slate-700 leading-relaxed">
                  {data.studentCharacteristics.individualDifferences ? (
                    toArabicDigits(data.studentCharacteristics.individualDifferences)
                  ) : (
                    <span className="text-slate-400 font-normal italic text-[11px] block">
                      [بيان التمايز ومراعاة الفروق الفردية...]
                    </span>
                  )}
                </p>
              )}
            </div>

            <div className="p-3 rounded-xl bg-purple-50/40 border border-purple-200">
              <span className="font-bold text-purple-900 block mb-1">ذوو الاحتياجات الخاصة:</span>
              {isEditing ? (
                <textarea
                  rows={3}
                  value={data.studentCharacteristics.specialNeeds}
                  placeholder="تكييف الأنشطة لذوي الاحتياجات والصعوبات..."
                  onChange={(e) =>
                    onChange({
                      ...data,
                      studentCharacteristics: {
                        ...data.studentCharacteristics,
                        specialNeeds: e.target.value,
                      },
                    })
                  }
                  className="w-full p-1.5 border border-slate-300 rounded-lg bg-white text-right"
                />
              ) : (
                <p className="text-slate-700 leading-relaxed">
                  {data.studentCharacteristics.specialNeeds ? (
                    toArabicDigits(data.studentCharacteristics.specialNeeds)
                  ) : (
                    <span className="text-slate-400 font-normal italic text-[11px] block">
                      [تكييفات ذوي الاحتياجات وصعوبات التعلم...]
                    </span>
                  )}
                </p>
              )}
            </div>

            <div className="p-3 rounded-xl bg-amber-50/40 border border-amber-200 sm:col-span-2 lg:col-span-1">
              <span className="font-bold text-amber-900 block mb-1">التكييف البيئي والمحسوسات:</span>
              {isEditing ? (
                <textarea
                  rows={3}
                  value={data.studentCharacteristics.environmentalAdaptation}
                  placeholder="تجهيز البيئة الصفية والمحسوسات والوسائط..."
                  onChange={(e) =>
                    onChange({
                      ...data,
                      studentCharacteristics: {
                        ...data.studentCharacteristics,
                        environmentalAdaptation: e.target.value,
                      },
                    })
                  }
                  className="w-full p-1.5 border border-slate-300 rounded-lg bg-white text-right"
                />
              ) : (
                <p className="text-slate-700 leading-relaxed">
                  {data.studentCharacteristics.environmentalAdaptation ? (
                    toArabicDigits(data.studentCharacteristics.environmentalAdaptation)
                  ) : (
                    <span className="text-slate-400 font-normal italic text-[11px] block">
                      [المحسوسات والتكييف المكاني والبيئي...]
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 3. مصادر التعلم المفتوحة OER والجاهزية الرقمية */}
        <div className="border-t border-slate-100 pt-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-bold text-slate-800">مصادر التعلم المفتوحة (OER) والجاهزية الرقمية:</h4>
            </div>
            {onOpenResourcesModal && (
              <button
                type="button"
                onClick={onOpenResourcesModal}
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 border border-emerald-200"
                title="تصفح بنك المصادر ورفع مراجع إضافية"
              >
                <Layers className="w-3.5 h-3.5 text-emerald-700" />
                <span>تصفح بنك المصادر والمناهج</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">الكتاب المدرسي المعتمد:</span>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={data.learningResources.textbook}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      learningResources: { ...data.learningResources, textbook: e.target.value },
                    })
                  }
                  className="w-full p-1.5 border border-slate-300 rounded-lg bg-white text-right"
                />
              ) : (
                <p className="text-slate-700">{toArabicDigits(data.learningResources.textbook)}</p>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">وسائط ملموسة ومحسوسات:</span>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={data.learningResources.tangibleMedia}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      learningResources: { ...data.learningResources, tangibleMedia: e.target.value },
                    })
                  }
                  className="w-full p-1.5 border border-slate-300 rounded-lg bg-white text-right"
                />
              ) : (
                <p className="text-slate-700">{toArabicDigits(data.learningResources.tangibleMedia)}</p>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">الجاهزية الرقمية الصامتة:</span>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={data.learningResources.digitalReadiness}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      learningResources: { ...data.learningResources, digitalReadiness: e.target.value },
                    })
                  }
                  className="w-full p-1.5 border border-slate-300 rounded-lg bg-white text-right"
                />
              ) : (
                <p className="text-slate-700">{toArabicDigits(data.learningResources.digitalReadiness)}</p>
              )}
            </div>
          </div>
        </div>

        {/* 4. أخلاقيات التكنولوجيا والسلامة العلمية */}
        <div className="border-t border-slate-100 pt-5">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-bold text-slate-800">أخلاقيات التكنولوجيا والسلامة العلمية واللغوية:</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-emerald-50/30 border border-emerald-200">
              <span className="font-bold text-emerald-950 block mb-1">الأمان الرقمي وسلامة الاستخدام:</span>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={data.ethicsAndSafety.digitalSafety}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      ethicsAndSafety: { ...data.ethicsAndSafety, digitalSafety: e.target.value },
                    })
                  }
                  className="w-full p-1.5 border border-slate-300 rounded-lg bg-white text-right"
                />
              ) : (
                <p className="text-slate-700">{toArabicDigits(data.ethicsAndSafety.digitalSafety)}</p>
              )}
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/30 border border-emerald-200">
              <span className="font-bold text-emerald-950 block mb-1">دقة المحتوى والسلامة اللغوية:</span>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={data.ethicsAndSafety.contentAccuracyAndLanguage}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      ethicsAndSafety: {
                        ...data.ethicsAndSafety,
                        contentAccuracyAndLanguage: e.target.value,
                      },
                    })
                  }
                  className="w-full p-1.5 border border-slate-300 rounded-lg bg-white text-right"
                />
              ) : (
                <p className="text-slate-700">{toArabicDigits(data.ethicsAndSafety.contentAccuracyAndLanguage)}</p>
              )}
            </div>
          </div>
        </div>

        {/* 5. الأسئلة التأملية المثيرة للتفكير */}
        <div className="border-t border-slate-100 pt-5">
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <h4 className="text-sm font-bold text-slate-800">الأسئلة التأملية المثيرة للتفكير (سؤالان سابران):</h4>
          </div>

          <div className="space-y-2">
            {data.reflectiveQuestions.map((q, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/90 text-xs font-semibold text-amber-950 flex items-start gap-2"
              >
                <span className="text-amber-600 font-bold">«</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={q}
                    onChange={(e) => {
                      const updated = [...data.reflectiveQuestions];
                      updated[idx] = e.target.value;
                      onChange({ ...data, reflectiveQuestions: updated });
                    }}
                    className="w-full p-1 border border-slate-300 rounded-md bg-white font-normal text-right"
                  />
                ) : (
                  <span>{toArabicDigits(q)} »</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
