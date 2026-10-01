import React, { useState } from 'react';
import { LessonHeader } from '../types/lessonPlan';
import { School, User, Calendar, Clock, BookOpen, Layers, Edit3, Check } from 'lucide-react';
import { toArabicDigits } from '../utils/arabicNumerals';

interface LessonHeaderCardProps {
  header: LessonHeader;
  onChange: (header: LessonHeader) => void;
}

export const LessonHeaderCard: React.FC<LessonHeaderCardProps> = ({ header, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (field: keyof LessonHeader, val: any) => {
    onChange({
      ...header,
      [field]: val,
    });
  };

  return (
    <div dir="rtl" className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden transition-all hover:shadow-md text-right">
      {/* Top Banner */}
      <div className="bg-linear-to-r from-emerald-800 via-teal-800 to-emerald-950 text-white p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-200 tracking-wide">
            <span>{header.country}</span>
            <span>•</span>
            <span>{header.ministry}</span>
            <span>•</span>
            <span>{header.directorate}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-['Tajawal'] mt-1 flex items-center gap-2">
            <School className="w-6 h-6 text-emerald-300 shrink-0" />
            {header.school}
          </h2>
          <p className="text-xs text-emerald-100/90 mt-1">
            نموذج تحضير درس مكتمل التطبيق (مستند إلى إطار تقييم أداء المعلم وكتب {header.subject})
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-3.5 py-1.5 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition-colors border border-white/20 backdrop-blur-xs"
        >
          {isEditing ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              حفظ البيانات
            </>
          ) : (
            <>
              <Edit3 className="w-4 h-4" />
              تعديل بيانات الرأس
            </>
          )}
        </button>
      </div>

      {/* Grid of Lesson Details */}
      <div className="p-5">
        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">اسم المعلم/ة</label>
              <input
                type="text"
                value={header.teacherName}
                onChange={(e) => handleChange('teacherName', e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-right"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">المادة / المبحث</label>
              <input
                type="text"
                value={header.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-right"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">عنوان الدرس</label>
              <input
                type="text"
                value={header.lessonTitle}
                onChange={(e) => handleChange('lessonTitle', e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-right"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">الصف والشعبة</label>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  value={header.grade}
                  onChange={(e) => handleChange('grade', e.target.value)}
                  placeholder="الصف"
                  className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-right"
                />
                <input
                  type="text"
                  value={header.section}
                  onChange={(e) => handleChange('section', e.target.value)}
                  placeholder="الشعبة"
                  className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-right"
                />
              </div>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">الحصص والزمن</label>
              <div className="grid grid-cols-3 gap-1.5">
                <input
                  type="number"
                  value={header.totalPeriods}
                  onChange={(e) => handleChange('totalPeriods', Number(e.target.value))}
                  placeholder="إجمالي"
                  className="px-2 py-1.5 border border-slate-300 rounded-lg text-center"
                />
                <input
                  type="number"
                  value={header.currentPeriod}
                  onChange={(e) => handleChange('currentPeriod', Number(e.target.value))}
                  placeholder="المستهدفة"
                  className="px-2 py-1.5 border border-slate-300 rounded-lg text-center"
                />
                <input
                  type="number"
                  value={header.periodDurationMinutes}
                  onChange={(e) => handleChange('periodDurationMinutes', Number(e.target.value))}
                  placeholder="الدقائق"
                  className="px-2 py-1.5 border border-slate-300 rounded-lg text-center"
                />
              </div>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">التاريخ والمديرية</label>
              <input
                type="text"
                value={header.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-right"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 block mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                المعلم/ة
              </span>
              <span className="text-xs font-bold text-slate-800 line-clamp-1">{header.teacherName}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 block mb-1 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                المادة والمبحث
              </span>
              <span className="text-xs font-bold text-slate-800 line-clamp-1">{header.subject}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 block mb-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                الصف والشعبة
              </span>
              <span className="text-xs font-bold text-slate-800">
                {header.grade} ({header.section})
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 block mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                الحصص المستهدفة
              </span>
              <span className="text-xs font-bold text-slate-800">
                الحصة {toArabicDigits(header.currentPeriod)} من {toArabicDigits(header.totalPeriods)}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 block mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                فترة الحصة
              </span>
              <span className="text-xs font-bold text-emerald-700">
                {toArabicDigits(header.periodDurationMinutes)} دقيقة
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 block mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                التاريخ
              </span>
              <span className="text-xs font-bold text-slate-800">{toArabicDigits(header.date)}</span>
            </div>
          </div>
        )}

        {/* Lesson Title Banner */}
        <div className="mt-4 p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-xs">
              عنوان الدرس
            </span>
            <h3 className="text-sm md:text-base font-bold text-emerald-950 font-['Tajawal']">
              {toArabicDigits(header.lessonTitle)}
            </h3>
          </div>
          <span className="text-xs text-emerald-800 font-medium hidden md:inline">
            {header.directorate}
          </span>
        </div>
      </div>
    </div>
  );
};
