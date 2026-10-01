import React, { useState } from 'react';
import { Section4LearningEnvironment } from '../types/lessonPlan';
import { Users2, HeartHandshake, Smile, Edit3, Check, Printer } from 'lucide-react';
import { toArabicDigits } from '../utils/arabicNumerals';

interface Section4EnvironmentCardProps {
  data: Section4LearningEnvironment;
  onOpenParentCardModal: () => void;
  onChange: (data: Section4LearningEnvironment) => void;
}

export const Section4EnvironmentCard: React.FC<Section4EnvironmentCardProps> = ({
  data,
  onOpenParentCardModal,
  onChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div dir="rtl" className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden text-right">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-600 rounded-xl text-white shadow-xs">
            <Users2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-bold font-['Tajawal']">
              رابعاً: إدارة بيئة التعلم ومناخه والتواصل مع الأسرة
            </h3>
            <p className="text-xs text-slate-300">
              الروتينات الصفية • البيئة الآمنة • بطاقة الشراكة والتواصل المنزلي
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenParentCardModal}
            className="px-3 py-1.5 bg-teal-600/80 hover:bg-teal-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-teal-400/40"
          >
            <Printer className="w-3.5 h-3.5 text-teal-200" />
            معاينة وطباعة بطاقة الأسرة
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
                تعديل البيئة
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* 1. الروتينات الصفية والبيئة الآمنة */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-teal-50/40 border border-teal-200">
            <span className="font-bold text-teal-950 block mb-1.5 flex items-center gap-1.5 text-sm">
              <Smile className="w-4 h-4 text-teal-600" />
              الروتينات الصفية وقواعد الانتقال:
            </span>
            {isEditing ? (
              <textarea
                rows={3}
                value={data.classroomRoutines}
                onChange={(e) => onChange({ ...data, classroomRoutines: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-right"
              />
            ) : (
              <p className="text-slate-700 leading-relaxed">{toArabicDigits(data.classroomRoutines)}</p>
            )}
          </div>

          <div className="p-4 rounded-xl bg-teal-50/40 border border-teal-200">
            <span className="font-bold text-teal-950 block mb-1.5 flex items-center gap-1.5 text-sm">
              <Smile className="w-4 h-4 text-teal-600" />
              البيئة الآمنة والمحفزة والدعم النفسي:
            </span>
            {isEditing ? (
              <textarea
                rows={3}
                value={data.safeAndMotivatingClimate}
                onChange={(e) => onChange({ ...data, safeAndMotivatingClimate: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-right"
              />
            ) : (
              <p className="text-slate-700 leading-relaxed">{toArabicDigits(data.safeAndMotivatingClimate)}</p>
            )}
          </div>
        </div>

        {/* 2. الشراكة والتواصل مع أولياء الأمور */}
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
              <HeartHandshake className="w-4 h-4 text-teal-600" />
              بطاقة الشراكة والتواصل المنزلي: {toArabicDigits(data.familyPartnership.cardTitle)}
            </div>
            <button
              onClick={onOpenParentCardModal}
              className="text-xs text-teal-700 font-bold hover:underline"
            >
              عرض وتجهيز البطاقة المنزلية ←
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-700">
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">مهمة الطالب التفاعلية:</span>
              <p className="leading-relaxed">{toArabicDigits(data.familyPartnership.studentTask)}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">دور ولي الأمر والمتابعة:</span>
              <p className="leading-relaxed">{toArabicDigits(data.familyPartnership.parentRole)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
