import React from 'react';
import { LessonPlan, OerLessonPlanData } from '../types/lessonPlan';
import { toArabicDigits } from '../utils/arabicNumerals';
import { ensureOerData } from '../data/oerPalestinianCurriculum';

interface OerPrintDocumentProps {
  plan: LessonPlan;
}

export const OerPrintDocument: React.FC<OerPrintDocumentProps> = ({ plan }) => {
  const planWithOer = ensureOerData(plan);
  const oer: OerLessonPlanData = planWithOer.oerData!;
  const h = oer.lessonInfo;

  return (
    <div className="space-y-6 sm:space-y-8 print:space-y-0 official-document-wrapper text-right font-['Tajawal']" dir="rtl">
      {/* ================= PAGE 1: بيانات الدرس والكفايات والموقف التعليمي ================= */}
      <div className="official-print-page bg-white border-2 border-black p-6 md:p-8 shadow-xl relative min-h-[1050px] flex flex-col justify-between">
        <div>
          {/* Header State & Ministry */}
          <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4 text-xs">
            <div className="text-right space-y-0.5 font-bold">
              <div>دولة فلسطين 🇵🇸</div>
              <div>وزارة التربية والتعليم العالي</div>
              <div>مديرية التربية والتعليم: {h.directorate || plan.header.directorate || '...............'}</div>
              <div>مدرسة: {h.school || plan.header.school || '...............'}</div>
            </div>

            <div className="text-center px-2">
              <div className="text-[11px] font-black border border-black px-3 py-0.5 rounded-md inline-block mb-1 bg-slate-100">
                دليل المعلم الفلسطيني للتعليم المستند إلى مصادر التعليم المفتوحة OER
              </div>
              <h1 className="text-lg md:text-xl font-black text-black">
                استمارة خطة درس (الصفوف ١–٤ الأساسية)
              </h1>
              <div className="text-xs font-bold text-slate-800">
                المعتمدة عبر البوابة التعليمية الرسمية elearn.edu.ps
              </div>
            </div>

            <div className="text-left space-y-0.5 font-bold">
              <div>اسم المعلم/ة: {h.teacherName || plan.header.teacherName || '...............'}</div>
              <div>العام الدراسي: 2025 / 2026م</div>
              <div>الفصل الدراسي: {h.semester || plan.header.semester || 'الأول'}</div>
              <div>التاريخ: {h.date || plan.header.date || '—'}</div>
            </div>
          </div>

          {/* Table 1: بيانات الدرس */}
          <div className="border border-black mb-4 text-xs">
            <div className="grid grid-cols-12 border-b border-black">
              <div className="col-span-2 bg-slate-100 p-2 font-bold border-l border-black">
                المبحث / المادة:
              </div>
              <div className="col-span-4 p-2 font-semibold border-l border-black">
                {h.subject || '—'}
              </div>
              <div className="col-span-2 bg-slate-100 p-2 font-bold border-l border-black">
                الصف والشعبة:
              </div>
              <div className="col-span-4 p-2 font-semibold">
                {h.grade || '—'} (شعبة: {h.section || 'أ'})
              </div>
            </div>

            <div className="grid grid-cols-12 border-b border-black">
              <div className="col-span-2 bg-slate-100 p-2 font-bold border-l border-black">
                عنوان الدرس:
              </div>
              <div className="col-span-6 p-2 font-semibold border-l border-black">
                {h.lessonTitle || '—'}
              </div>
              <div className="col-span-2 bg-slate-100 p-2 font-bold border-l border-black">
                مدة الحصة:
              </div>
              <div className="col-span-2 p-2 font-semibold">
                {toArabicDigits(h.durationMinutes || 40)} دقيقة
              </div>
            </div>

            {h.unitTitle && (
              <div className="grid grid-cols-12">
                <div className="col-span-2 bg-slate-100 p-2 font-bold border-l border-black">
                  الوحدة الدراسية:
                </div>
                <div className="col-span-10 p-2 font-semibold">
                  {h.unitTitle}
                </div>
              </div>
            )}
          </div>

          {/* Table 2: الكفايات المستهدفة */}
          <div className="border border-black mb-4 text-xs">
            <div className="bg-slate-100 p-1.5 font-black border-b border-black text-center text-sm">
              الكفايات المستهدفة ومؤشرات الأداء (وفق دليل OER الفلسطيني)
            </div>

            <div className="grid grid-cols-12 border-b border-black">
              <div className="col-span-3 bg-slate-100 p-2 font-bold border-l border-black">
                الكفاية العامة:
              </div>
              <div className="col-span-9 p-2 leading-relaxed">
                {oer.targetCompetencies.generalCompetency || '—'}
              </div>
            </div>

            <div className="grid grid-cols-12 border-b border-black">
              <div className="col-span-3 bg-slate-100 p-2 font-bold border-l border-black">
                الكفاية الخاصة:
              </div>
              <div className="col-span-9 p-2 leading-relaxed">
                {oer.targetCompetencies.specificCompetency || '—'}
              </div>
            </div>

            <div className="grid grid-cols-12">
              <div className="col-span-3 bg-slate-100 p-2 font-bold border-l border-black flex items-center">
                مؤشرات أداء قابلة للملاحظة:
              </div>
              <div className="col-span-9 p-2">
                <ol className="list-decimal list-inside space-y-1">
                  {oer.targetCompetencies.observableIndicators.map((ind, i) => (
                    <li key={i} className="leading-relaxed">
                      {ind}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          {/* Table 3: أنشطة الموقف التعليمي ومصادر التعليم المفتوحة OER */}
          <div className="border border-black text-xs">
            <div className="bg-slate-100 p-1.5 font-black border-b border-black text-center text-sm">
              الموقف التعليمي ومصادر التعليم المفتوحة OER (رئيسي + بديلان لكل نشاط)
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 bg-slate-100 border-b border-black font-bold text-center divide-x divide-x-reverse divide-black text-[11px]">
              <div className="col-span-2 p-1.5">المرحلة والزمن</div>
              <div className="col-span-4 p-1.5">الخطوات الإجرائية وأدوار الطلبة والمنتج</div>
              <div className="col-span-4 p-1.5">مصادر التعليم المفتوحة (رئيسي + بديلان)</div>
              <div className="col-span-2 p-1.5">التقويم (تكويني / منتج)</div>
            </div>

            {/* Activities Rows */}
            {oer.activities.map((act, index) => (
              <div
                key={act.id}
                className="grid grid-cols-12 border-b last:border-b-0 border-black divide-x divide-x-reverse divide-black"
              >
                {/* 1. المرحلة والزمن */}
                <div className="col-span-2 p-2 bg-slate-50/50 flex flex-col justify-between">
                  <div className="font-bold text-slate-900 leading-snug">
                    {act.title}
                  </div>
                  <div className="mt-2 text-[10px] font-black text-slate-700 bg-white border border-black p-1 rounded text-center">
                    {toArabicDigits(act.allocatedTimeMinutes)} دقيقة
                  </div>
                </div>

                {/* 2. الخطوات الإجرائية وأدوار الطلبة */}
                <div className="col-span-4 p-2 space-y-1.5">
                  <p className="leading-relaxed text-[11px] text-slate-900">
                    {act.description}
                  </p>
                  <div className="pt-1 border-t border-slate-300 text-[10px] space-y-0.5">
                    <div>
                      <strong>دور الطلبة:</strong> {act.studentRoles === 'individual' ? 'فردي' : act.studentRoles === 'pairs' ? 'ثنائي' : act.studentRoles === 'groups' ? 'مجموعات تعاونية' : 'جماعي صفي'} {act.studentRolesDetails ? `(${act.studentRolesDetails})` : ''}
                    </div>
                    {act.expectedProducts && (
                      <div>
                        <strong>المنتج المتوقع:</strong> {act.expectedProducts}
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. مصادر التعلم المفتوحة (رئيسي + بديلان) */}
                <div className="col-span-4 p-2 space-y-1.5 text-[10px]">
                  {/* رئيسي */}
                  <div className="bg-emerald-50 p-1.5 rounded border border-emerald-400">
                    <span className="font-black text-emerald-950 block">
                      🌟 رئيسي: {act.primaryResource.title}
                    </span>
                    <div className="text-slate-600 mt-0.5">
                      النوع: {act.primaryResource.type === 'book' ? 'كتاب' : act.primaryResource.type === 'video' ? 'فيديو' : act.primaryResource.type === 'link' ? 'رابط' : act.primaryResource.type === 'image' ? 'صورة' : 'بيئي/محسوس'} • الرخصة: {act.primaryResource.licenseType === 'ministry_elearn' ? '🟢 معتمد elearn.edu.ps' : 'مشاع إبداعي OER'}
                    </div>
                  </div>

                  {/* بديل 1 */}
                  <div className="bg-blue-50/70 p-1 rounded border border-blue-300">
                    <span className="font-bold text-blue-950 block">
                      🔄 بديل ١: {act.alternativeResource1.title}
                    </span>
                  </div>

                  {/* بديل 2 */}
                  <div className="bg-amber-50/70 p-1 rounded border border-amber-300">
                    <span className="font-bold text-amber-950 block">
                      🔄 بديل ٢ (أوفلاين): {act.alternativeResource2.title}
                    </span>
                  </div>
                </div>

                {/* 4. التقويم */}
                <div className="col-span-2 p-2 space-y-1 text-[10px] bg-slate-50/30">
                  <div>
                    <span className="font-black text-emerald-900 block">تكويني:</span>
                    <span className="text-slate-800 leading-snug">{act.formativeAssessment || 'ملاحظة وتغذية راجعة'}</span>
                  </div>
                  <div className="pt-1 border-t border-slate-200">
                    <span className="font-black text-purple-900 block">تقويم المنتج:</span>
                    <span className="text-slate-800 leading-snug">{act.productAssessment || 'سلم تقدير / قائمة رصد'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Page 1 Notice */}
        <div className="pt-2 text-[10px] text-slate-500 flex justify-between border-t border-slate-300">
          <span>منظومة عبقور للتخطيط التربوي • دليل المعلم لمصادر التعليم المفتوحة OER</span>
          <span>صفحة ١ من ٢</span>
        </div>
      </div>

      {/* ================= PAGE 2: التقويم الختامي والبدائل والتأمل والتوقيعات ================= */}
      <div className="official-print-page bg-white border-2 border-black p-6 md:p-8 shadow-xl relative min-h-[1050px] flex flex-col justify-between mt-6 print:mt-0">
        <div>
          {/* Header mini for page 2 */}
          <div className="flex items-center justify-between border-b border-black pb-2 mb-4 text-xs font-bold">
            <div>تابع: استمارة خطة درس OER — {h.lessonTitle}</div>
            <div>المبحث: {h.subject} • الصف: {h.grade}</div>
          </div>

          {/* Section: التقويم الختامي الموزون */}
          <div className="border border-black mb-4 text-xs">
            <div className="bg-slate-100 p-2 font-black border-b border-black text-center text-sm">
              التقويم الختامي والربط بمؤشرات الكفاية (Summative Assessment)
            </div>

            <div className="grid grid-cols-12 border-b border-black">
              <div className="col-span-3 bg-slate-100 p-2.5 font-bold border-l border-black">
                مهمة التقويم الختامي:
              </div>
              <div className="col-span-9 p-2.5 leading-relaxed">
                {oer.summativeAssessment.description || '—'}
              </div>
            </div>

            <div className="grid grid-cols-12 border-b border-black">
              <div className="col-span-3 bg-slate-100 p-2.5 font-bold border-l border-black">
                أداة التقويم المعتمدة:
              </div>
              <div className="col-span-9 p-2.5 leading-relaxed">
                {oer.summativeAssessment.assessmentTool || 'سلم تقدير لفظي (Rubric)'}
              </div>
            </div>

            <div className="grid grid-cols-12">
              <div className="col-span-3 bg-slate-100 p-2.5 font-bold border-l border-black">
                الربط بمؤشرات الكفاية:
              </div>
              <div className="col-span-9 p-2.5 leading-relaxed">
                {oer.summativeAssessment.alignmentWithIndicators || '—'}
              </div>
            </div>
          </div>

          {/* Section: البدائل والملاحظات وما بعد الدرس */}
          <div className="border border-black mb-5 text-xs">
            <div className="bg-slate-100 p-2 font-black border-b border-black text-center text-sm">
              بدائل وملاحظات وتأملات ما بعد الدرس (دليل OER)
            </div>

            <div className="grid grid-cols-12 border-b border-black">
              <div className="col-span-3 bg-slate-100 p-2.5 font-bold border-l border-black">
                حلول عند تعذر مصدر أو انقطاع التقنية:
              </div>
              <div className="col-span-9 p-2.5 leading-relaxed">
                {oer.contingenciesAndNotes.sourceContingencies || 'الاعتماد على البدائل الأوفلاين والمحسوسات البيئية.'}
              </div>
            </div>

            <div className="grid grid-cols-12 border-b border-black">
              <div className="col-span-3 bg-slate-100 p-2.5 font-bold border-l border-black">
                ما بعد الدرس (التأمل الذاتي للمعلم):
              </div>
              <div className="col-span-9 p-2.5 leading-relaxed">
                {oer.contingenciesAndNotes.postLessonReflection || 'تم استيفاء نتاجات التعلم وتحقيق مؤشرات الأداء بنجاح.'}
              </div>
            </div>

            <div className="grid grid-cols-12">
              <div className="col-span-3 bg-slate-100 p-2.5 font-bold border-l border-black">
                متابعة الطلبة والدعم والإثراء:
              </div>
              <div className="col-span-9 p-2.5 leading-relaxed">
                {oer.contingenciesAndNotes.followUpActions || 'تقديم أوراق عمل تشخيصية ودعم فردي للطلبة المحتاجين.'}
              </div>
            </div>
          </div>

          {/* Signatures & Certification Box */}
          <div className="border-2 border-black p-4 text-xs space-y-4 mb-4">
            <div className="font-black text-center text-sm border-b border-black pb-1">
              الاعتماد والتوقيعات الإشرافية
            </div>

            <div className="grid grid-cols-3 gap-6 text-center pt-2">
              {/* Teacher */}
              <div className="space-y-4">
                <div className="font-bold">معلم / معلمة المبحث</div>
                <div className="text-slate-800 font-semibold">
                  الاسم: {h.teacherName || '....................'}
                </div>
                <div className="text-[11px] text-slate-600">التوقيع: ....................</div>
                <div className="text-[11px] text-slate-600">التاريخ: {h.date || '..../..../2026'}</div>
              </div>

              {/* Principal */}
              <div className="space-y-4 border-r border-l border-black px-2">
                <div className="font-bold">مدير / مديرة المدرسة</div>
                <div className="text-slate-800 font-semibold">
                  الاسم: ....................
                </div>
                <div className="text-[11px] text-slate-600">التوقيع والختم: ....................</div>
                <div className="text-[11px] text-slate-600">التاريخ: ..../..../2026</div>
              </div>

              {/* Supervisor */}
              <div className="space-y-4">
                <div className="font-bold">المشرف / المشرفة التربوية</div>
                <div className="text-slate-800 font-semibold">
                  الاسم: ....................
                </div>
                <div className="text-[11px] text-slate-600">التوقيع والتوجيهات: ....................</div>
                <div className="text-[11px] text-slate-600">التاريخ: ..../..../2026</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Page 2 */}
        <div className="pt-2 text-[10px] text-slate-500 flex justify-between border-t border-slate-300">
          <span>دولة فلسطين • وزارة التربية والتعليم العالي • البوابة التعليمية elearn.edu.ps</span>
          <span>صفحة ٢ من ٢</span>
        </div>
      </div>
    </div>
  );
};
