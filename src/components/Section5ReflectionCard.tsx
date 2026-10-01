import React, { useState } from 'react';
import { Section5SelfReflection } from '../types/lessonPlan';
import { BrainCircuit, TrendingUp, Share2, CheckCircle2, Edit3, Check } from 'lucide-react';
import { toArabicDigits } from '../utils/arabicNumerals';

interface Section5ReflectionCardProps {
  data: Section5SelfReflection;
  onChange: (data: Section5SelfReflection) => void;
}

export const Section5ReflectionCard: React.FC<Section5ReflectionCardProps> = ({ data, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div dir="rtl" className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden text-right">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-xs">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-bold font-['Tajawal']">
              خامساً: التأمل الذاتي والتطور المهني
            </h3>
            <p className="text-xs text-slate-300">
              (يُستكمل بعد تنفيذ الدرس - إطار تقييم أداء المعلم للدرجة ٤)
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
              تعديل التأمل
            </>
          )}
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* نقاط القوة والأثر الملموس */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-bold text-slate-800">
              نقاط القوة والأثر الملموس على تعلم الطلبة:
            </h4>
          </div>

          <div className="space-y-2">
            {data.strengthsAndImpact.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/80 text-xs text-emerald-950 flex items-start gap-2"
              >
                <span className="text-emerald-600 font-bold">•</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const updated = [...data.strengthsAndImpact];
                      updated[idx] = e.target.value;
                      onChange({ ...data, strengthsAndImpact: updated });
                    }}
                    className="w-full p-1 border border-slate-300 rounded-md bg-white text-xs font-normal text-right"
                  />
                ) : (
                  <span className="leading-relaxed">{toArabicDigits(item)}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* فرص التحسين ومجتمعات التعلم المهني */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-5 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1.5 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              فرص التحسين المكتشفة للحصص القادمة:
            </span>
            {isEditing ? (
              <textarea
                rows={3}
                value={data.improvementOpportunities}
                onChange={(e) => onChange({ ...data, improvementOpportunities: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-right"
              />
            ) : (
              <p className="text-slate-700 leading-relaxed">{toArabicDigits(data.improvementOpportunities)}</p>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1.5 flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-blue-600" />
              نقل الخبرة ومجتمعات التعلم المهني (PLC):
            </span>
            {isEditing ? (
              <textarea
                rows={3}
                value={data.professionalLearningCommunities}
                onChange={(e) =>
                  onChange({ ...data, professionalLearningCommunities: e.target.value })
                }
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-right"
              />
            ) : (
              <p className="text-slate-700 leading-relaxed">
                {toArabicDigits(data.professionalLearningCommunities)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
