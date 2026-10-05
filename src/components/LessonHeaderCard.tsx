import React, { useState } from 'react';
import { LessonHeader, STANDARD_GRADES } from '../types/lessonPlan';
import { School, User, Calendar, Clock, BookOpen, Layers, Edit3, Check, Boxes, CalendarRange, Sparkles, Flag } from 'lucide-react';
import { toArabicDigits } from '../utils/arabicNumerals';
import {
  analyzeTeachingCalendar,
  getNextTeachingDays,
  PALESTINIAN_MINISTRY_HOLIDAYS,
} from '../utils/palestinianCalendar';

interface LessonHeaderCardProps {
  header: LessonHeader;
  onChange: (header: LessonHeader) => void;
  onOpenUnitPlanModal?: () => void;
  onOpenSemesterPlanModal?: () => void;
  onOpenResourcesModal?: () => void;
  resourcesCount?: number;
}

export const LessonHeaderCard: React.FC<LessonHeaderCardProps> = ({
  header,
  onChange,
  onOpenUnitPlanModal,
  onOpenSemesterPlanModal,
  onOpenResourcesModal,
  resourcesCount,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (field: keyof LessonHeader, val: any) => {
    onChange({
      ...header,
      [field]: val,
    });
  };

  // Palestinian Calendar Lesson Timeframe Auto-Calculator
  const handleCalculateLessonTimeframe = () => {
    const sDate = header.startDate || header.date || new Date().toISOString().split('T')[0];
    const daysNeeded = Math.max(1, header.totalPeriods || 2);
    const result = getNextTeachingDays(sDate, daysNeeded, PALESTINIAN_MINISTRY_HOLIDAYS);
    const analysis = analyzeTeachingCalendar(sDate, result.endDate, PALESTINIAN_MINISTRY_HOLIDAYS);

    const holidayNotice = analysis.holidaysEncountered.length > 0
      ? ` (يتخلله إجازة: ${analysis.holidaysEncountered.map((h) => h.name).join('، ')})`
      : ' (أيام تدريس فعلية مستثناة الجمعة والسبت والعطل)';

    onChange({
      ...header,
      startDate: sDate,
      endDate: result.endDate,
      timeframe: `من ${sDate} إلى ${result.endDate}${holidayNotice}`,
      date: sDate,
    });
  };

  return (
    <div dir="rtl" className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden transition-all hover:shadow-md text-right">
      {/* Top Banner */}
      <div className="bg-linear-to-r from-emerald-800 via-teal-800 to-emerald-950 text-white p-3.5 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative group shrink-0">
            <div className="absolute -inset-1 rounded-full bg-linear-to-tr from-amber-400 to-emerald-400 opacity-80 blur-xs"></div>
            <img
              src="/abqoor_logo.jpg"
              alt="شعار منظومة عبقور"
              className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-amber-300 shadow-md shrink-0 bg-white"
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src.includes('abqoor_logo.jpg')) {
                  target.src = '/logo.png';
                } else if (target.src.includes('logo.png')) {
                  target.src = '/logo.jpg';
                }
              }}
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold text-emerald-200 tracking-wide">
              <span>{header.country || 'دولة فلسطين'}</span>
              <span>•</span>
              <span>{header.ministry || 'وزارة التربية والتعليم'}</span>
              <span>•</span>
              <span>{header.directorate || 'مديرية التربية والتعليم'}</span>
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold font-['Tajawal'] mt-0.5 flex items-center gap-2">
              <School className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-300 shrink-0" />
              <span className="truncate">{header.school || 'اسم المدرسة / الصرح التعليمي'}</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-emerald-100/90 mt-0.5">
              منظومة عبقور - نموذج تحضير صفي مفرغ ومعتمد وفق معايير التميز الوزارية
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenResourcesModal && (
            <button
              type="button"
              onClick={onOpenResourcesModal}
              title="إدارة ورفع المناهج والكتب والمصادر التعليمية بسهولة"
              className="px-3.5 py-1.5 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl text-xs font-black text-white flex items-center gap-1.5 transition-all shadow-xs border border-emerald-300/40 cursor-pointer group"
            >
              <div className="relative p-0.5 bg-emerald-800/80 rounded-md shrink-0">
                <Layers className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition-transform" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 text-amber-950 rounded-full flex items-center justify-center text-[8px] font-black">
                  +
                </span>
              </div>
              <span>إضافة المصادر {resourcesCount !== undefined ? `(${toArabicDigits(resourcesCount)})` : ''}</span>
            </button>
          )}

          {onOpenUnitPlanModal && (
            <button
              type="button"
              onClick={onOpenUnitPlanModal}
              title="توليد تحضير وحدة دراسية كاملة مكونة من مجموعة دروس بالذكاء الاصطناعي"
              className="px-3.5 py-1.5 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow-xs border border-white/20 backdrop-blur-xs cursor-pointer group"
            >
              <Boxes className="w-4 h-4 text-blue-200 group-hover:scale-110 transition-transform" />
              <span>تحضير وحدة كاملة (AI)</span>
            </button>
          )}

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3.5 py-1.5 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition-colors border border-white/20 backdrop-blur-xs cursor-pointer"
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
      </div>

      {/* Grid of Lesson Details */}
      <div className="p-3.5 sm:p-5">
        {isEditing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 text-xs">
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
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">الصف والشعبة</label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleChange('grade', 'الصف الأول')}
                    className={`text-[10px] px-1.5 py-0.5 rounded font-bold transition-colors ${
                      header.grade === 'الصف الأول' || header.grade === 'الصف الأول الأساسي'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 border border-slate-200'
                    }`}
                  >
                    الصف الأول
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('grade', 'الصف الثاني')}
                    className={`text-[10px] px-1.5 py-0.5 rounded font-bold transition-colors ${
                      header.grade === 'الصف الثاني' || header.grade === 'الصف الثاني الأساسي'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 border border-slate-200'
                    }`}
                  >
                    الصف الثاني
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <input
                    type="text"
                    list="header-grade-datalist"
                    value={header.grade}
                    onChange={(e) => handleChange('grade', e.target.value)}
                    placeholder="الصف (اختر أو اكتب)"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-right font-medium focus:ring-1 focus:ring-emerald-500"
                  />
                  <datalist id="header-grade-datalist">
                    {STANDARD_GRADES.map((g) => (
                      <option key={g} value={g} />
                    ))}
                  </datalist>
                </div>
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

            {/* Lesson Timeframe Selection Box (من تاريخ - إلى تاريخ) */}
            <div className="sm:col-span-2 lg:col-span-3 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-teal-950 text-xs flex items-center gap-1.5 font-['Tajawal']">
                  <CalendarRange className="w-4 h-4 text-emerald-700" />
                  <span>الفترة الزمنية لتنفيذ الدرس (من تاريخ - إلى تاريخ):</span>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-700 text-white rounded-full font-bold">
                    الجمعة والسبت والإجازات مستثناة 🇵🇸
                  </span>
                </span>

                <button
                  type="button"
                  onClick={handleCalculateLessonTimeframe}
                  className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>احتساب التلقائي للفترة بالتقويم الفلسطيني</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">من تاريخ (البداية):</label>
                  <input
                    type="date"
                    value={header.startDate || ''}
                    onChange={(e) => {
                      const sDate = e.target.value;
                      handleChange('startDate', sDate);
                      handleChange('date', sDate);
                    }}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-right font-bold text-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">إلى تاريخ (النهاية):</label>
                  <input
                    type="date"
                    value={header.endDate || ''}
                    onChange={(e) => {
                      const eDate = e.target.value;
                      handleChange('endDate', eDate);
                    }}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-right font-bold text-slate-900 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
              <div className="p-2.5 sm:p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 block mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  المعلم/ة
                </span>
                <span className="text-xs font-bold text-slate-800 line-clamp-1">
                  {header.teacherName ? header.teacherName : <span className="text-slate-400 font-normal italic">[اسم المعلم/ة]</span>}
                </span>
              </div>

              <div className="p-2.5 sm:p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 block mb-1 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  المادة والمبحث
                </span>
                <span className="text-xs font-bold text-slate-800 line-clamp-1">
                  {header.subject ? header.subject : <span className="text-slate-400 font-normal italic">[المادة / المبحث]</span>}
                </span>
              </div>

              <div className="p-2.5 sm:p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 block mb-1 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  الصف والشعبة
                </span>
                <span className="text-xs font-bold text-slate-800 line-clamp-1">
                  {header.grade || 'الصف الدراسي'} ({header.section || 'الشعبة'})
                </span>
              </div>

              <div className="p-2.5 sm:p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 block mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  الحصص المستهدفة
                </span>
                <span className="text-xs font-bold text-slate-800">
                  الحصة {toArabicDigits(header.currentPeriod || 1)} من {toArabicDigits(header.totalPeriods || 1)}
                </span>
              </div>

              <div className="p-2.5 sm:p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 block mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  فترة الحصة
                </span>
                <span className="text-xs font-bold text-emerald-700">
                  {toArabicDigits(header.periodDurationMinutes || 40)} دقيقة
                </span>
              </div>

              <div className="p-2.5 sm:p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 block mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  التاريخ
                </span>
                <span className="text-xs font-bold text-slate-800">{toArabicDigits(header.date || '٢٠٢٦م')}</span>
              </div>
            </div>

            {/* Lesson Timeframe Highlight Banner */}
            <div className="p-3 bg-linear-to-r from-teal-50 via-emerald-50 to-cyan-50 border border-teal-200/90 rounded-xl flex flex-wrap items-center justify-between gap-2.5 text-xs shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-800 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <CalendarRange className="w-4 h-4 text-cyan-200" />
                </div>
                <div>
                  <span className="font-bold text-teal-950 block text-xs">
                    الفترة الزمنية لتنفيذ الدرس (من تاريخ - إلى تاريخ):
                  </span>
                  <span className="font-black text-emerald-900 text-xs sm:text-sm font-['Tajawal']">
                    {header.startDate && header.endDate
                      ? `من ${toArabicDigits(header.startDate)} إلى ${toArabicDigits(header.endDate)}`
                      : header.date
                      ? `التاريخ المعتمد: ${toArabicDigits(header.date)}`
                      : 'فترة تنفيذ الدرس المحددة بالخطة'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px]">
                <span className="px-2.5 py-1 bg-white text-teal-900 border border-teal-300/80 rounded-lg font-bold shadow-2xs flex items-center gap-1">
                  <Flag className="w-3.5 h-3.5 text-emerald-700" />
                  <span>🇵🇸 الجمعة والسبت عطلة أسبوعية + الإجازات الرسمية مستثناة</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Lesson Title Banner */}
        <div className="mt-4 p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-xs">
              عنوان الدرس
            </span>
            <h3 className="text-sm md:text-base font-bold text-emerald-950 font-['Tajawal']">
              {header.lessonTitle ? toArabicDigits(header.lessonTitle) : (
                <span className="text-slate-500 font-normal italic text-xs md:text-sm">
                  [انقر على "تعديل بيانات الرأس" لكتابة عنوان الدرس أو "توليد خطة جديدة بالذكاء الاصطناعي"]
                </span>
              )}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {onOpenSemesterPlanModal && (
              <button
                type="button"
                onClick={onOpenSemesterPlanModal}
                className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs hover:shadow-xs cursor-pointer group"
                title="توليد وعرض الخطة الفصلية الموحدة ودليل توزيع الحصص بجميع الصيغ"
              >
                <CalendarRange className="w-3.5 h-3.5 text-teal-700 group-hover:scale-110 transition-transform" />
                <span>الخطة الفصلية وتوزيع الحصص</span>
              </button>
            )}
            {onOpenUnitPlanModal && (
              <button
                type="button"
                onClick={onOpenUnitPlanModal}
                className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200/90 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs hover:shadow-xs cursor-pointer group"
                title="توليد تحضير وحدة تعليمية كاملة بمجموع دروسها"
              >
                <Boxes className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition-transform" />
                <span>تحضير وحدة كاملة (AI)</span>
              </button>
            )}
            <span className="text-xs text-emerald-800 font-medium hidden md:inline">
              {header.directorate || header.ministry || 'النموذج الوزاري المعتمد'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
