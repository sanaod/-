import React, { useState } from 'react';
import { Section6Signatures } from '../types/lessonPlan';
import { FileCheck, Stamp, Award, Edit3, Check, RefreshCw } from 'lucide-react';
import { toArabicDigits } from '../utils/arabicNumerals';

interface Section6SignaturesCardProps {
  data: Section6Signatures;
  onChange: (data: Section6Signatures) => void;
  title?: string;
  subtitle?: string;
  stepNumber?: string | number;
  headerDefaults?: {
    teacherName?: string;
    principalName?: string;
    supervisorName?: string;
    date?: string;
  };
}

export const Section6SignaturesCard: React.FC<Section6SignaturesCardProps> = ({
  data,
  onChange,
  title = 'سادساً: التوقيع والاعتماد الرسمي',
  subtitle = 'اعتمادات المعلم، الإدارة المدرسية، والإشراف التربوي',
  stepNumber,
  headerDefaults,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleSyncWithHeader = () => {
    if (!headerDefaults) return;
    onChange({
      teacher: {
        ...data.teacher,
        name: data.teacher.name || headerDefaults.teacherName || '',
        date: data.teacher.date || headerDefaults.date || '',
      },
      schoolPrincipal: {
        ...data.schoolPrincipal,
        name: data.schoolPrincipal.name || headerDefaults.principalName || '',
        date: data.schoolPrincipal.date || headerDefaults.date || '',
      },
      educationalSupervisor: {
        ...data.educationalSupervisor,
        name: data.educationalSupervisor.name || headerDefaults.supervisorName || '',
        date: data.educationalSupervisor.date || headerDefaults.date || '',
      },
    });
  };

  return (
    <div dir="rtl" className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden text-right">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {stepNumber ? (
            <div className="min-w-10 px-2.5 h-10 rounded-xl bg-emerald-400 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-md text-sm sm:text-base">
              {stepNumber}
            </div>
          ) : (
            <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-xs">
              <FileCheck className="w-5 h-5" />
            </div>
          )}
          <div>
            <h3 className="text-base md:text-lg font-bold font-['Tajawal']">
              {title}
            </h3>
            <p className="text-xs text-slate-300">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing && headerDefaults && (
            <button
              type="button"
              onClick={handleSyncWithHeader}
              className="px-3 py-1.5 bg-emerald-700/60 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="مزامنة الأسماء تلقائياً من ترويسة الدرس"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>مزامنة مع الترويسة</span>
            </button>
          )}

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {isEditing ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                حفظ
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4" />
                تعديل الاعتمادات
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-3.5 sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 text-xs">
          {/* المعلم */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-800 text-sm">إعداد وتوقيع المعلم/ة</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                منفذ الدرس
              </span>
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={data.teacher.name}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      teacher: { ...data.teacher, name: e.target.value },
                    })
                  }
                  className="w-full p-1.5 border border-slate-300 rounded-lg text-xs text-right"
                />
                <input
                  type="text"
                  value={data.teacher.date}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      teacher: { ...data.teacher, date: e.target.value },
                    })
                  }
                  className="w-full p-1.5 border border-slate-300 rounded-lg text-xs text-right"
                />
                <textarea
                  rows={2}
                  value={data.teacher.notes}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      teacher: { ...data.teacher, notes: e.target.value },
                    })
                  }
                  className="w-full p-1.5 border border-slate-300 rounded-lg text-xs text-right"
                />
              </div>
            ) : (
              <div className="space-y-2 text-slate-700">
                <div><strong>الاسم:</strong> {data.teacher.name}</div>
                <div><strong>التاريخ:</strong> {toArabicDigits(data.teacher.date)}</div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-900 block mb-0.5">ملاحظات المعلم الذاتية:</span>
                  <p className="text-slate-600 leading-relaxed">{toArabicDigits(data.teacher.notes)}</p>
                </div>
              </div>
            )}
          </div>

          {/* مدير المدرسة */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-800 text-sm">اعتماد مدير/ة المدرسة</span>
              <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Stamp className="w-3 h-3" /> ختم الإدارة
              </span>
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={data.schoolPrincipal.name}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      schoolPrincipal: { ...data.schoolPrincipal, name: e.target.value },
                    })
                  }
                  className="w-full p-1.5 border border-slate-300 rounded-lg text-xs text-right"
                />
                <input
                  type="text"
                  value={data.schoolPrincipal.date}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      schoolPrincipal: { ...data.schoolPrincipal, date: e.target.value },
                    })
                  }
                  className="w-full p-1.5 border border-slate-300 rounded-lg text-xs text-right"
                />
                <textarea
                  rows={2}
                  value={data.schoolPrincipal.directives}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      schoolPrincipal: { ...data.schoolPrincipal, directives: e.target.value },
                    })
                  }
                  className="w-full p-1.5 border border-slate-300 rounded-lg text-xs text-right"
                />
              </div>
            ) : (
              <div className="space-y-2 text-slate-700">
                <div><strong>الاسم:</strong> {data.schoolPrincipal.name}</div>
                <div><strong>التاريخ:</strong> {toArabicDigits(data.schoolPrincipal.date)}</div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-900 block mb-0.5">توجيهات الإدارة المدرسية:</span>
                  <p className="text-slate-600 leading-relaxed">{toArabicDigits(data.schoolPrincipal.directives)}</p>
                </div>
              </div>
            )}
          </div>

          {/* المشرف التربوي */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-800 text-sm">اعتماد المشرف/ة التربوي/ة</span>
              <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Award className="w-3 h-3" /> الدرجة ٤ (تميز)
              </span>
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={data.educationalSupervisor.name}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      educationalSupervisor: {
                        ...data.educationalSupervisor,
                        name: e.target.value,
                      },
                    })
                  }
                  className="w-full p-1.5 border border-slate-300 rounded-lg text-xs text-right"
                />
                <input
                  type="text"
                  value={data.educationalSupervisor.date}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      educationalSupervisor: {
                        ...data.educationalSupervisor,
                        date: e.target.value,
                      },
                    })
                  }
                  className="w-full p-1.5 border border-slate-300 rounded-lg text-xs text-right"
                />
                <textarea
                  rows={2}
                  value={data.educationalSupervisor.directives}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      educationalSupervisor: {
                        ...data.educationalSupervisor,
                        directives: e.target.value,
                      },
                    })
                  }
                  className="w-full p-1.5 border border-slate-300 rounded-lg text-xs text-right"
                />
              </div>
            ) : (
              <div className="space-y-2 text-slate-700">
                <div><strong>الاسم:</strong> {data.educationalSupervisor.name}</div>
                <div><strong>التاريخ:</strong> {toArabicDigits(data.educationalSupervisor.date)}</div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-900 block mb-0.5">توجيهات الإشراف التربوي:</span>
                  <p className="text-slate-600 leading-relaxed">{toArabicDigits(data.educationalSupervisor.directives)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
