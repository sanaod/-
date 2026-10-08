import React from 'react';
import { LessonPlan, ExecutivePlanData } from '../types/lessonPlan';
import { toArabicDigits } from '../utils/arabicNumerals';

interface ExecutivePrintDocumentProps {
  plan: LessonPlan;
}

export const ExecutivePrintDocument: React.FC<ExecutivePrintDocumentProps> = ({ plan }) => {
  const data: ExecutivePlanData = plan.executiveData!;
  const h = plan.header;

  const stage1 = data.executiveStages.find((s) => s.id === 1) || data.executiveStages[0];
  const stage2 = data.executiveStages.find((s) => s.id === 2) || data.executiveStages[1];
  const stage3 = data.executiveStages.find((s) => s.id === 3) || data.executiveStages[2];
  const stage4 = data.executiveStages.find((s) => s.id === 4) || data.executiveStages[3];
  const stage5 = data.executiveStages.find((s) => s.id === 5) || data.executiveStages[4];

  return (
    <div className="space-y-6 sm:space-y-8 print:space-y-0 official-document-wrapper text-right">
      {/* ================= PAGE 1 ================= */}
      <div className="official-print-page bg-white border-2 border-black p-6 md:p-9 shadow-xl relative min-h-[1050px] flex flex-col justify-between">
        <div>
          {/* Main Title */}
          <div className="text-center mb-5 pb-2 border-b-2 border-black">
            <h1 className="text-xl md:text-2xl font-black text-black font-['Tajawal'] tracking-wide">
              نموذج خطة تحضير درس
            </h1>
            <p className="text-xs text-slate-700 font-semibold mt-1">
              النموذج التنفيذي المعتمد • وزارة التربية والتعليم
            </p>
          </div>

          {/* Table: Basic Metadata, Period, Competencies, Values & Student Characteristics */}
          <div className="border border-black mb-5 text-xs">
            {/* Row 1: المبحث & الصف */}
            <div className="grid grid-cols-12 border-b border-black">
              <div className="col-span-2 bg-slate-100 p-2 font-bold border-l border-black">
                المبحث:
              </div>
              <div className="col-span-4 p-2 font-semibold border-l border-black">
                {h.subject || '....................'}
              </div>
              <div className="col-span-2 bg-slate-100 p-2 font-bold border-l border-black">
                الصف:
              </div>
              <div className="col-span-4 p-2 font-semibold">
                {h.grade || '....................'}
              </div>
            </div>

            {/* Row 2: عنوان الدرس / الوحدة & عدد الحصص */}
            <div className="grid grid-cols-12 border-b border-black">
              <div className="col-span-2 bg-slate-100 p-2 font-bold border-l border-black">
                عنوان الدرس / الوحدة:
              </div>
              <div className="col-span-4 p-2 font-semibold border-l border-black">
                {h.lessonTitle || h.unitTitle || '....................'}
              </div>
              <div className="col-span-2 bg-slate-100 p-2 font-bold border-l border-black">
                عدد الحصص:
              </div>
              <div className="col-span-4 p-2 font-semibold">
                {toArabicDigits(h.totalPeriods)} حصص
              </div>
            </div>

            {/* Row 3: الفترة الزمنية من وإلى */}
            <div className="grid grid-cols-12 border-b border-black">
              <div className="col-span-2 bg-slate-100 p-2 font-bold border-l border-black flex items-center">
                الفترة الزمنية
              </div>
              <div className="col-span-10 divide-y divide-black">
                <div className="grid grid-cols-12 p-1.5 items-center">
                  <div className="col-span-2 font-bold text-slate-800">من:</div>
                  <div className="col-span-10 grid grid-cols-3 gap-2">
                    <span><strong>اليوم:</strong> {data.timeframeDetails.startDay}</span>
                    <span><strong>التاريخ:</strong> {data.timeframeDetails.startDate}</span>
                    <span><strong>السنة:</strong> {data.timeframeDetails.startYear}</span>
                  </div>
                </div>
                <div className="grid grid-cols-12 p-1.5 items-center">
                  <div className="col-span-2 font-bold text-slate-800">إلى:</div>
                  <div className="col-span-10 grid grid-cols-3 gap-2">
                    <span><strong>اليوم:</strong> {data.timeframeDetails.endDay}</span>
                    <span><strong>التاريخ:</strong> {data.timeframeDetails.endDate}</span>
                    <span><strong>السنة:</strong> {data.timeframeDetails.endYear}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 4: كفايات التعلم */}
            <div className="grid grid-cols-12 border-b border-black">
              <div className="col-span-3 bg-slate-100 p-2.5 font-bold border-l border-black">
                كفايات التعلّم:
              </div>
              <div className="col-span-9 p-2.5 leading-relaxed">
                <span className="font-bold">المهارات والمعارف الأساسية الخاصة بالمبحث: </span>
                <span>{data.learningCompetencies || '....................................................'}</span>
              </div>
            </div>

            {/* Row 5: القيم والأخلاق المراد تعزيزها */}
            <div className="grid grid-cols-12 border-b border-black">
              <div className="col-span-3 bg-slate-100 p-2.5 font-bold border-l border-black">
                القيم والأخلاق المراد تعزيزها:
              </div>
              <div className="col-span-9 p-2.5 leading-relaxed">
                <span>{data.valuesAndEthics || 'المواطنة، التعاون، الأمانة، المهارات الحياتية المراد تعزيزها: ....................'}</span>
              </div>
            </div>

            {/* Row 6: خصائص الطلبة والبيئة المحيطة */}
            <div className="grid grid-cols-12">
              <div className="col-span-3 bg-slate-100 p-2.5 font-bold border-l border-black flex items-center">
                خصائص الطلبة والبيئة المحيطة:
              </div>
              <div className="col-span-9 p-2.5 space-y-2 leading-relaxed">
                <div>
                  <span className="font-bold">• تحليل خصائص الطلبة: </span>
                  <span>{data.studentCharacteristicsAnalysis || '....................................................'}</span>
                </div>
                <div>
                  <span className="font-bold">• تحليل البيئة المحيطة: </span>
                  <span>{data.environmentalAnalysis || '....................................................'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: أهداف ذكية (SMART Objectives) */}
          <div className="border border-black p-3.5 mb-4 bg-slate-50/60">
            <div className="text-xs font-black text-black mb-2 flex items-center justify-between border-b border-slate-300 pb-1.5">
              <span>أهداف ذكية (SMART Objectives):</span>
              <span className="text-[11px] font-bold text-slate-700">
                محددة · قابلة للقياس · قابلة للتحقيق · ذات صلة بالكفاية · محددة بزمن
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-900 leading-relaxed min-h-[90px]">
              {data.smartObjectives && data.smartObjectives.length > 0 ? (
                data.smartObjectives.map((obj, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="font-bold shrink-0">{toArabicDigits(idx + 1)}.</span>
                    <span>{obj}</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-400">....................................................................................................................................................</div>
              )}
            </div>
          </div>
        </div>

        {/* Page 1 Footer */}
        <div className="pt-3 border-t border-slate-300 text-center text-[10px] text-slate-500 font-bold flex items-center justify-between">
          <span>منظومة عبقور للتخطيط التربوي وتحضير الدروس</span>
          <span>الصفحة (١) من (٤)</span>
          <span>إعداد وتصميم: أ. عبد الرحمن دويكات</span>
        </div>
      </div>

      {/* ================= PAGE 2 ================= */}
      <div className="official-print-page bg-white border-2 border-black p-6 md:p-9 shadow-xl relative min-h-[1050px] flex flex-col justify-between">
        <div>
          {/* Section Title */}
          <div className="text-center mb-4 pb-2 border-b-2 border-black">
            <h2 className="text-lg md:text-xl font-black text-black font-['Tajawal']">
              تفاصيل خطة التنفيذ التنفيذية للدرس
            </h2>
            <p className="text-[11px] text-slate-700 font-bold mt-0.5">
              الجزء الأول: التهيئة وعرض الأهداف ومهمة التقويم الأصيل GRASPS
            </p>
          </div>

          {/* Table for Stages 1, 2, 3 */}
          <table className="w-full border-collapse border border-black text-xs text-right">
            <thead>
              <tr className="bg-slate-200 text-black font-black border-b border-black">
                <th className="border-l border-black p-2 w-[18%] text-center">المرحلة والأهداف</th>
                <th className="border-l border-black p-2 w-[46%] text-center">الإجراءات والأنشطة</th>
                <th className="border-l border-black p-2 w-[16%] text-center">التقويم</th>
                <th className="border-l border-black p-2 w-[12%] text-center">المصادر والأدوات</th>
                <th className="p-2 w-[8%] text-center">الزمن</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black">
              {/* STAGE 1 */}
              <tr>
                <td className="border-l border-black p-2.5 align-top font-bold bg-slate-50">
                  <div className="text-emerald-950 font-black mb-1">{stage1.stageName}</div>
                  <div className="text-[11px] font-normal text-slate-700">{stage1.goals}</div>
                </td>
                <td className="border-l border-black p-2.5 align-top space-y-2 leading-relaxed">
                  <div>• {stage1.procedures.mainDescription}</div>
                  <div>• <strong>اسم المصدر التعليمي:</strong> {stage1.procedures.resourceName || '........................................'}</div>
                  <div>• <strong>مثال أسئلة تأملية حول المصدر:</strong> {stage1.procedures.reflectiveQuestionsExample || '.......................................................................'}</div>
                  <div className="mt-2 pt-1 border-t border-slate-200">
                    <div className="font-bold text-[11px] mb-1">شروط اختيار المصدر التعليمي:</div>
                    <div className="grid grid-cols-2 gap-1 text-[11px]">
                      <span>[ {stage1.procedures.resourceConditions?.competencyAlignment ? '✓' : ' '} ] الارتباط بالكفايات</span>
                      <span>[ {stage1.procedures.resourceConditions?.contentAccuracy ? '✓' : ' '} ] دقة المحتوى</span>
                      <span>[ {stage1.procedures.resourceConditions?.languageIntegrity ? '✓' : ' '} ] سلامة اللغة</span>
                      <span>[ {stage1.procedures.resourceConditions?.ageAppropriate ? '✓' : ' '} ] المواءمة مع المرحلة العمرية</span>
                      <span>[ {stage1.procedures.resourceConditions?.palestinianCulture ? '✓' : ' '} ] المواءمة مع الثقافة الفلسطينية</span>
                      <span>[ {stage1.procedures.resourceConditions?.integrationValues ? '✓' : ' '} ] تعزيز التكامل والمواطنة والقيم والأخلاق</span>
                    </div>
                  </div>
                </td>
                <td className="border-l border-black p-2.5 align-top">
                  {stage1.assessment}
                </td>
                <td className="border-l border-black p-2.5 align-top">
                  {stage1.resourcesAndTools}
                </td>
                <td className="p-2.5 align-top text-center font-bold">
                  {toArabicDigits(stage1.durationMinutes)} د
                </td>
              </tr>

              {/* STAGE 2 */}
              <tr>
                <td className="border-l border-black p-2.5 align-top font-bold bg-slate-50">
                  <div className="text-emerald-950 font-black mb-1">{stage2.stageName}</div>
                  <div className="text-[11px] font-normal text-slate-700">{stage2.goals}</div>
                </td>
                <td className="border-l border-black p-2.5 align-top space-y-2 leading-relaxed">
                  <div>
                    • مشاركة الطلبة في عرض أهداف التعلم وشرح المادة باستخدام طرائق تدريس متمركزة حول التعلم النشط (التعلم باللعب، التعلم التعاوني، حل المشكلات...)
                  </div>
                  <div>
                    • عرض مخرجات الطلبة للأنشطة التعليمية التفاعلية (مطوية، مشاهد عرض تقديمي، كتابة قصة، رسومات تعبيرية، مشاريع، تمثيلية...)
                  </div>
                </td>
                <td className="border-l border-black p-2.5 align-top">
                  {stage2.assessment}
                </td>
                <td className="border-l border-black p-2.5 align-top">
                  {stage2.resourcesAndTools}
                </td>
                <td className="p-2.5 align-top text-center font-bold">
                  {toArabicDigits(stage2.durationMinutes)} د
                </td>
              </tr>

              {/* STAGE 3 */}
              <tr>
                <td className="border-l border-black p-2.5 align-top font-bold bg-slate-50">
                  <div className="text-emerald-950 font-black mb-1">{stage3.stageName}</div>
                  <div className="text-[11px] font-normal text-slate-700">{stage3.goals}</div>
                </td>
                <td className="border-l border-black p-2.5 align-top space-y-1.5 leading-relaxed">
                  <div className="font-bold underline decoration-1">مهمة تقويم أصيلة مبنية على نموذج GRASPS:</div>
                  <div className="text-[11px] space-y-0.5">
                    <div>• <strong>الهدف (Goal):</strong> {stage3.procedures.grasps?.goal || 'تطبيق المهارات في سياق واقعي'}</div>
                    <div>• <strong>الدور (Role):</strong> {stage3.procedures.grasps?.role || 'باحث ومخطط'} | <strong>الجمهور (Audience):</strong> {stage3.procedures.grasps?.audience || 'الزملاء'}</div>
                    <div>• <strong>الموقف (Situation):</strong> {stage3.procedures.grasps?.situation || 'موقف حياتي عملي'}</div>
                    <div>• <strong>الأداء والمنتج (Performance):</strong> {stage3.procedures.grasps?.performance || 'إنتاج ملموس'}</div>
                    <div>• <strong>المعايير (Standards):</strong> {stage3.procedures.grasps?.standards || 'الدقة والوضوح'}</div>
                  </div>
                  <div className="text-[11px] pt-1">
                    <span className="font-bold">• خطوات تنفيذ المهمة: </span>
                    <span>{(stage3.procedures.grasps?.steps || ['توزيع الأدوار', 'تنفيذ المهمة']).map((s, idx) => `${toArabicDigits(idx + 1)}. ${s}`).join(' - ')}</span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-800">
                    • مقياس متدرج لتقويم أداء الطلبة (سلالم التقدير ومقاييس الأداء)
                  </div>
                </td>
                <td className="border-l border-black p-2.5 align-top">
                  {stage3.assessment}
                </td>
                <td className="border-l border-black p-2.5 align-top">
                  {stage3.resourcesAndTools}
                </td>
                <td className="p-2.5 align-top text-center font-bold">
                  {toArabicDigits(stage3.durationMinutes)} د
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Page 2 Footer */}
        <div className="pt-3 border-t border-slate-300 text-center text-[10px] text-slate-500 font-bold flex items-center justify-between">
          <span>منظومة عبقور للتخطيط التربوي وتحضير الدروس</span>
          <span>الصفحة (٢) من (٤)</span>
          <span>إعداد وتصميم: أ. عبد الرحمن دويكات</span>
        </div>
      </div>

      {/* ================= PAGE 3 ================= */}
      <div className="official-print-page bg-white border-2 border-black p-6 md:p-9 shadow-xl relative min-h-[1050px] flex flex-col justify-between">
        <div>
          {/* Section Title */}
          <div className="text-center mb-4 pb-2 border-b-2 border-black">
            <h2 className="text-lg md:text-xl font-black text-black font-['Tajawal']">
              تفاصيل خطة التنفيذ التنفيذية للدرس (تابع)
            </h2>
            <p className="text-[11px] text-slate-700 font-bold mt-0.5">
              الجزء الثاني: ورقة العمل التفاعلية والغلق وتلخيص الدرس
            </p>
          </div>

          {/* Table for Stages 4 & 5 */}
          <table className="w-full border-collapse border border-black text-xs text-right">
            <thead>
              <tr className="bg-slate-200 text-black font-black border-b border-black">
                <th className="border-l border-black p-2 w-[18%] text-center">المرحلة والأهداف</th>
                <th className="border-l border-black p-2 w-[46%] text-center">الإجراءات والأنشطة</th>
                <th className="border-l border-black p-2 w-[16%] text-center">التقويم</th>
                <th className="border-l border-black p-2 w-[12%] text-center">المصادر والأدوات</th>
                <th className="p-2 w-[8%] text-center">الزمن</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black">
              {/* STAGE 4 */}
              <tr>
                <td className="border-l border-black p-3 align-top font-bold bg-slate-50">
                  <div className="text-emerald-950 font-black mb-1">{stage4.stageName}</div>
                  <div className="text-[11px] font-normal text-slate-700">{stage4.goals}</div>
                </td>
                <td className="border-l border-black p-3 align-top space-y-2 leading-relaxed">
                  <div>• تنفيذ ورقة العمل التفاعلية فردياً أو جماعياً.</div>
                  <div>• <strong>كيف ستُستخدم الورقة؟</strong> {stage4.procedures.howWorksheetUsed || '.......................................................................'}</div>
                  <div>• <strong>تقديم تغذية راجعة فورية للطلبة:</strong> {stage4.procedures.immediateFeedback || 'ملاحظات فورية وتصويب المفاهيم'}</div>
                </td>
                <td className="border-l border-black p-3 align-top">
                  {stage4.assessment}
                </td>
                <td className="border-l border-black p-3 align-top">
                  {stage4.resourcesAndTools}
                </td>
                <td className="p-3 align-top text-center font-bold">
                  {toArabicDigits(stage4.durationMinutes)} د
                </td>
              </tr>

              {/* STAGE 5 */}
              <tr>
                <td className="border-l border-black p-3 align-top font-bold bg-slate-50">
                  <div className="text-emerald-950 font-black mb-1">{stage5.stageName}</div>
                  <div className="text-[11px] font-normal text-slate-700">{stage5.goals}</div>
                </td>
                <td className="border-l border-black p-3 align-top space-y-2.5 leading-relaxed">
                  <div>
                    غلق الدرس من خلال التلخيص وتسليط الضوء على أبرز ملامح الدرس عبر الخيارات التالية:
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded border border-slate-300">
                    <span>[ {stage5.procedures.closureOptions?.worksheet ? '✓' : ' '} ] ورقة عمل تفاعلية</span>
                    <span>[ {stage5.procedures.closureOptions?.videoSummary ? '✓' : ' '} ] فيديو يلخص الحصة</span>
                    <span>[ {stage5.procedures.closureOptions?.posterOrSummaryBoard ? '✓' : ' '} ] ملصق / صورة / لوحة ملخصة</span>
                    <span>[ {stage5.procedures.closureOptions?.learnedCards ? '✓' : ' '} ] بطاقات يكتب فيها ما تم تعلمه</span>
                    <span>[ {stage5.procedures.closureOptions?.keyQuestionsCards ? '✓' : ' '} ] بطاقات يجيب فيها الطلبة عن الأسئلة الرئيسة</span>
                    <span>[ {stage5.procedures.closureOptions?.closingCompetitions ? '✓' : ' '} ] مسابقات تعليمية ختامية</span>
                  </div>
                </td>
                <td className="border-l border-black p-3 align-top">
                  {stage5.assessment}
                </td>
                <td className="border-l border-black p-3 align-top">
                  {stage5.resourcesAndTools}
                </td>
                <td className="p-3 align-top text-center font-bold">
                  {toArabicDigits(stage5.durationMinutes)} د
                </td>
              </tr>
            </tbody>
          </table>

          {/* Quick Summary Note */}
          <div className="mt-8 p-3 bg-slate-50 border border-black text-xs text-slate-800 leading-relaxed">
            <strong>ملاحظة تنفيذية:</strong> يتم إشراك كافة الطلبة مع مراعاة التمايز والتدرج من المحسوس إلى المجرد، وتوفير التغذية الراجعة البنائية طوال مجريات الحصة الصفية.
          </div>
        </div>

        {/* Page 3 Footer */}
        <div className="pt-3 border-t border-slate-300 text-center text-[10px] text-slate-500 font-bold flex items-center justify-between">
          <span>منظومة عبقور للتخطيط التربوي وتحضير الدروس</span>
          <span>الصفحة (٣) من (٤)</span>
          <span>إعداد وتصميم: أ. عبد الرحمن دويكات</span>
        </div>
      </div>

      {/* ================= PAGE 4 ================= */}
      <div className="official-print-page bg-white border-2 border-black p-6 md:p-9 shadow-xl relative min-h-[1050px] flex flex-col justify-between">
        <div>
          {/* Main Title */}
          <div className="text-center mb-6 pb-2 border-b-2 border-black">
            <h2 className="text-xl md:text-2xl font-black text-black font-['Tajawal'] tracking-wide">
              ملاحظات وتأملات المعلم حول الدرس
            </h2>
            <p className="text-xs text-slate-700 font-semibold mt-1">
              التقويم الذاتي والمجتمعات التعلمية المهنية (PLC)
            </p>
          </div>

          {/* Box 1: نقاط القوة في تنفيذ الدرس */}
          <div className="border-2 border-black mb-6">
            <div className="bg-slate-100 p-2.5 font-bold text-xs md:text-sm text-black border-b border-black">
              نقاط القوة في تنفيذ الدرس:
            </div>
            <div className="p-4 text-xs md:text-sm text-slate-900 leading-relaxed min-h-[140px]">
              {data.teacherReflection.strengths || (
                <div className="text-slate-400">...................................................................................................................................................</div>
              )}
            </div>
          </div>

          {/* Box 2: جوانب تحتاج إلى تحسين وتطوير */}
          <div className="border-2 border-black mb-6">
            <div className="bg-slate-100 p-2.5 font-bold text-xs md:text-sm text-black border-b border-black">
              جوانب تحتاج إلى تحسين وتطوير:
            </div>
            <div className="p-4 text-xs md:text-sm text-slate-900 leading-relaxed min-h-[140px]">
              {data.teacherReflection.improvementsNeeded || (
                <div className="text-slate-400">...................................................................................................................................................</div>
              )}
            </div>
          </div>

          {/* Box 3: مقترحات للدروس القادمة */}
          <div className="border-2 border-black mb-6">
            <div className="bg-slate-100 p-2.5 font-bold text-xs md:text-sm text-black border-b border-black">
              مقترحات للدروس القادمة:
            </div>
            <div className="p-4 text-xs md:text-sm text-slate-900 leading-relaxed min-h-[140px]">
              {data.teacherReflection.futureSuggestions || (
                <div className="text-slate-400">...................................................................................................................................................</div>
              )}
            </div>
          </div>

          {/* Official Signatures Row */}
          <div className="border border-black mt-8 text-xs">
            <div className="grid grid-cols-3 divide-x divide-x-reverse divide-black text-center">
              <div className="p-3 space-y-3">
                <span className="font-bold block">توقيع المعلم/ة:</span>
                <span className="text-slate-600 block">{h.teacherName || '....................'}</span>
              </div>
              <div className="p-3 space-y-3">
                <span className="font-bold block">مدير/ة المدرسة:</span>
                <span className="text-slate-600 block">....................</span>
              </div>
              <div className="p-3 space-y-3">
                <span className="font-bold block">المشرف/ة التربوي/ة:</span>
                <span className="text-slate-600 block">....................</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page 4 Footer */}
        <div className="pt-3 border-t border-slate-300 text-center text-[10px] text-slate-500 font-bold flex items-center justify-between">
          <span>منظومة عبقور للتخطيط التربوي وتحضير الدروس</span>
          <span>الصفحة (٤) من (٤)</span>
          <span>إعداد وتصميم: أ. عبد الرحمن دويكات</span>
        </div>
      </div>
    </div>
  );
};
