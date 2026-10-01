import React from 'react';
import { LessonPlan } from '../types/lessonPlan';
import { Printer, ArrowRight } from 'lucide-react';
import { toArabicDigits } from '../utils/arabicNumerals';

interface OfficialPrintViewProps {
  plan: LessonPlan;
  onBack: () => void;
}

export const OfficialPrintView: React.FC<OfficialPrintViewProps> = ({ plan, onBack }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-200/70 p-4 md:p-8 text-right font-['Cairo',sans-serif]">
      {/* Top action toolbar (hidden on print) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between bg-white p-4 rounded-2xl shadow-md border border-slate-300 no-print">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للمحرر التفاعلي
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 hidden sm:inline">
            نموذج التوثيق الوزاري المعتمد A4 (بالأرقام العربية المشرقية والاتجاه من اليمين إلى اليسار)
          </span>
          <button
            onClick={handlePrint}
            className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            طباعة / حفظ كملف PDF
          </button>
        </div>
      </div>

      {/* Official Document Container styled like the ministerial sheets */}
      <div dir="rtl" className="max-w-4xl mx-auto bg-white border-2 border-black p-6 md:p-10 shadow-2xl text-slate-900 official-document text-right">
        
        {/* ================= PAGE 1 HEADER ================= */}
        <div className="text-center space-y-1 mb-6 border-b-2 border-black pb-4">
          <h2 className="text-base font-bold text-black tracking-wide">
            {plan.header.country} - {plan.header.ministry}
          </h2>
          <h3 className="text-sm font-semibold text-black">
            {plan.header.school}
          </h3>
          <h1 className="text-xl font-extrabold text-black mt-2 font-['Tajawal'] underline decoration-1 underline-offset-4">
            نموذج تحضير درس مكتمل التطبيق (مبحث {plan.header.subject})
          </h1>
          <p className="text-xs font-medium text-slate-700">
            مستند إلى إطار تقييم أداء المعلم وكتب {plan.header.subject} للصف {plan.header.grade} ({plan.header.semester})
          </p>
        </div>

        {/* General Info Grid Box */}
        <div className="border border-black mb-8 overflow-hidden text-xs">
          <div className="grid grid-cols-4 divide-x divide-x-reverse divide-y divide-black border-collapse text-right">
            <div className="p-2 font-bold bg-slate-100 border-b border-black">اسم المعلم/ة:</div>
            <div className="p-2 border-b border-black font-semibold">{plan.header.teacherName}</div>
            <div className="p-2 font-bold bg-slate-100 border-b border-black">المادة / المبحث:</div>
            <div className="p-2 border-b border-black font-semibold">{plan.header.subject}</div>

            <div className="p-2 font-bold bg-slate-100 border-b border-black">اسم المدرسة:</div>
            <div className="p-2 border-b border-black font-semibold">{plan.header.school}</div>
            <div className="p-2 font-bold bg-slate-100 border-b border-black">عنوان الدرس:</div>
            <div className="p-2 border-b border-black font-semibold">{toArabicDigits(plan.header.lessonTitle)}</div>

            <div className="p-2 font-bold bg-slate-100 border-b border-black">عدد حصص الدرس:</div>
            <div className="p-2 border-b border-black">
              {toArabicDigits(plan.header.totalPeriods)} حصص (المستهدفة: {toArabicDigits(plan.header.currentPeriod)} من {toArabicDigits(plan.header.totalPeriods)})
            </div>
            <div className="p-2 font-bold bg-slate-100 border-b border-black">الفترة الزمنية للحصة:</div>
            <div className="p-2 border-b border-black">{toArabicDigits(plan.header.periodDurationMinutes)} دقيقة</div>

            <div className="p-2 font-bold bg-slate-100">الصف والشعبة:</div>
            <div className="p-2">{plan.header.grade} / {plan.header.section}</div>
            <div className="p-2 font-bold bg-slate-100">التاريخ والمديرية:</div>
            <div className="p-2">{toArabicDigits(plan.header.date)} - {plan.header.directorate}</div>
          </div>
        </div>

        {/* ================= أولاً: عملية التحليل والتخطيط التكيفي ================= */}
        <div className="mb-8">
          <div className="bg-slate-200/80 border border-black px-3 py-1.5 font-bold text-sm text-black mb-3 text-right">
            أولاً: عملية التحليل والتخطيط التكيفي (المحتوى، البيئة، المصادر، والمتعلمين)
          </div>

          <div className="border border-black divide-y divide-black text-xs text-right">
            {/* الكفايات التكاملية المستهدفة */}
            <div className="grid grid-cols-12">
              <div className="col-span-3 bg-slate-100 p-2.5 font-bold border-l border-black flex items-center">
                الكفايات التكاملية المستهدفة
              </div>
              <div className="col-span-9 p-2.5 space-y-1.5">
                {plan.section1.integrativeCompetencies.map((comp, idx) => (
                  <div key={idx} className="leading-relaxed">
                    <span className="font-bold text-black">• {comp.title}: </span>
                    <span className="text-slate-800">{toArabicDigits(comp.description)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* تحليل خصائص الطلبة والتخطيط التكيفي */}
            <div className="grid grid-cols-12">
              <div className="col-span-3 bg-slate-100 p-2.5 font-bold border-l border-black flex items-center">
                تحليل خصائص الطلبة والتخطيط التكيفي
              </div>
              <div className="col-span-9 p-2.5 space-y-1.5">
                <div>
                  <span className="font-bold text-black">• الفروق الفردية: </span>
                  <span>{toArabicDigits(plan.section1.studentCharacteristics.individualDifferences)}</span>
                </div>
                <div>
                  <span className="font-bold text-black">• ذوو الاحتياجات الخاصة: </span>
                  <span>{toArabicDigits(plan.section1.studentCharacteristics.specialNeeds)}</span>
                </div>
                <div>
                  <span className="font-bold text-black">• التكييف البيئي: </span>
                  <span>{toArabicDigits(plan.section1.studentCharacteristics.environmentalAdaptation)}</span>
                </div>
              </div>
            </div>

            {/* مصادر التعلم المفتوحة والجاهزية الرقمية */}
            <div className="grid grid-cols-12">
              <div className="col-span-3 bg-slate-100 p-2.5 font-bold border-l border-black flex items-center">
                مصادر التعلم المفتوحة (OER) والجاهزية الرقمية
              </div>
              <div className="col-span-9 p-2.5 space-y-1.5">
                <div>
                  <span className="font-bold text-black">• الكتاب المدرسي: </span>
                  <span>{toArabicDigits(plan.section1.learningResources.textbook)}</span>
                </div>
                <div>
                  <span className="font-bold text-black">• وسائط ملموسة: </span>
                  <span>{toArabicDigits(plan.section1.learningResources.tangibleMedia)}</span>
                </div>
                <div>
                  <span className="font-bold text-black">• الجاهزية الرقمية: </span>
                  <span>{toArabicDigits(plan.section1.learningResources.digitalReadiness)}</span>
                </div>
              </div>
            </div>

            {/* أخلاقيات التكنولوجيا والسلامة العلمية */}
            <div className="grid grid-cols-12">
              <div className="col-span-3 bg-slate-100 p-2.5 font-bold border-l border-black flex items-center">
                أخلاقيات التكنولوجيا والسلامة العلمية
              </div>
              <div className="col-span-9 p-2.5 space-y-1.5">
                <div>
                  <span className="font-bold text-black">• الأمان الرقمي: </span>
                  <span>{toArabicDigits(plan.section1.ethicsAndSafety.digitalSafety)}</span>
                </div>
                <div>
                  <span className="font-bold text-black">• دقة المحتوى والسلامة اللغوية: </span>
                  <span>{toArabicDigits(plan.section1.ethicsAndSafety.contentAccuracyAndLanguage)}</span>
                </div>
              </div>
            </div>

            {/* الأسئلة التأملية المثيرة للتفكير */}
            <div className="grid grid-cols-12">
              <div className="col-span-3 bg-slate-100 p-2.5 font-bold border-l border-black flex items-center">
                الأسئلة التأملية المثيرة للتفكير
              </div>
              <div className="col-span-9 p-2.5 space-y-1">
                {plan.section1.reflectiveQuestions.map((q, idx) => (
                  <div key={idx} className="font-semibold text-slate-800">
                    « {toArabicDigits(q)} »
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="page-break" />

        {/* ================= ثانياً: مخطط سير الحصة والأنشطة المتمركزة حول المتعلم ================= */}
        <div className="mb-8">
          <div className="bg-slate-200/80 border border-black px-3 py-1.5 font-bold text-sm text-black mb-3 text-right">
            ثانياً: مخطط سير الحصة والأنشطة المتمركزة حول المتعلم (الحصة {toArabicDigits(plan.header.currentPeriod)} من {toArabicDigits(plan.header.totalPeriods)} - {toArabicDigits(plan.header.periodDurationMinutes)} دقيقة)
          </div>

          <div className="border border-black overflow-hidden text-xs text-right">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-black text-center font-bold">
                  <th className="p-2 border-l border-black w-24">المرحلة والزمن</th>
                  <th className="p-2 border-l border-black">إجراءات المعلم والأنشطة المتمركزة حول المتعلم</th>
                  <th className="p-2 border-l border-black w-48">الاستراتيجيات ومصادر التعلم</th>
                  <th className="p-2 w-48">التقويم والتغذية الراجعة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black">
                {plan.section2Timeline.map((phase) => (
                  <tr key={phase.id} className="align-top">
                    <td className="p-2 border-l border-black font-bold text-center bg-slate-50">
                      <div>{toArabicDigits(phase.phaseName)}</div>
                      <div className="text-[11px] text-slate-600 mt-1">({toArabicDigits(phase.durationMinutes)} دقائق)</div>
                    </td>
                    <td className="p-2 border-l border-black space-y-1 leading-relaxed text-right">
                      {phase.teacherAndStudentActions.map((action, i) => (
                        <div key={i}>• {toArabicDigits(action)}</div>
                      ))}
                    </td>
                    <td className="p-2 border-l border-black space-y-1 text-slate-800 text-right">
                      {phase.strategiesAndResources.map((strat, i) => (
                        <div key={i}>- {toArabicDigits(strat)}</div>
                      ))}
                    </td>
                    <td className="p-2 space-y-1 text-slate-800 text-right">
                      {phase.assessmentAndFeedback.map((evalItem, i) => (
                        <div key={i}>* {toArabicDigits(evalItem)}</div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="page-break" />

        {/* ================= ثالثاً: المتابعة والتقويم المستمر والأنشطة العلاجية والبديلة ================= */}
        <div className="mb-8">
          <div className="bg-slate-200/80 border border-black px-3 py-1.5 font-bold text-sm text-black mb-3 text-right">
            ثالثاً: المتابعة والتقويم المستمر والأنشطة العلاجية والبديلة
          </div>

          <div className="border border-black divide-y divide-black text-xs text-right">
            {/* مهمة التقويم الأصيل GRASPS */}
            <div className="grid grid-cols-12">
              <div className="col-span-3 bg-slate-100 p-2.5 font-bold border-l border-black">
                أدوات التقويم المستمر ومهمة التقويم الأصيل
              </div>
              <div className="col-span-9 p-2.5 space-y-2">
                <div className="leading-relaxed">
                  <span className="font-bold text-black">• مهمة التقويم الأصيل (GRASPS): </span>
                  <span className="italic">{toArabicDigits(plan.section3Assessment.graspsTask.fullDescription)}</span>
                </div>
                <div className="text-slate-600 text-[11px] border-t border-slate-200 pt-1.5 grid grid-cols-2 gap-1">
                  <div><strong>الدور (Role):</strong> {plan.section3Assessment.graspsTask.role}</div>
                  <div><strong>الجمهور (Audience):</strong> {plan.section3Assessment.graspsTask.audience}</div>
                  <div><strong>الموقف (Situation):</strong> {plan.section3Assessment.graspsTask.situation}</div>
                  <div><strong>المنتج (Product):</strong> {plan.section3Assessment.graspsTask.product}</div>
                </div>

                {/* Rubric Table preview */}
                <div className="mt-2 border border-slate-300 rounded-xs overflow-hidden">
                  <div className="bg-slate-100 p-1 font-bold text-center border-b border-slate-300 text-[11px]">
                    سلم تقدير لفظي تحليلي (Rubric) مقسم لمستويات (١ إلى ٤)
                  </div>
                  <table className="w-full text-[10px] text-right border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 font-bold text-center">
                        <th className="p-1 border-l border-slate-200 text-right">المعيار</th>
                        <th className="p-1 border-l border-slate-200">١: مبتدئ</th>
                        <th className="p-1 border-l border-slate-200">٢: نامٍ</th>
                        <th className="p-1 border-l border-slate-200">٣: كفء</th>
                        <th className="p-1">٤: متميز</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {plan.section3Assessment.rubric.map((r, i) => (
                        <tr key={i}>
                          <td className="p-1 font-semibold border-l border-slate-200">{toArabicDigits(r.criterion)}</td>
                          <td className="p-1 border-l border-slate-200">{toArabicDigits(r.level1)}</td>
                          <td className="p-1 border-l border-slate-200">{toArabicDigits(r.level2)}</td>
                          <td className="p-1 border-l border-slate-200">{toArabicDigits(r.level3)}</td>
                          <td className="p-1">{toArabicDigits(r.level4)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* الأنشطة العلاجية */}
            <div className="grid grid-cols-12">
              <div className="col-span-3 bg-slate-100 p-2.5 font-bold border-l border-black">
                الأنشطة العلاجية (دعم ذوي الأداء دون المتوقع)
              </div>
              <div className="col-span-9 p-2.5 space-y-1.5">
                {plan.section3Assessment.remedialActivities.map((rem, i) => (
                  <div key={i}>
                    <span className="font-bold text-black">• {toArabicDigits(rem.title)}: </span>
                    <span>{toArabicDigits(rem.description)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* الأنشطة البديلة والإثرائية */}
            <div className="grid grid-cols-12">
              <div className="col-span-3 bg-slate-100 p-2.5 font-bold border-l border-black">
                الأنشطة البديلة والإثرائية (تحدي مواهب الطلبة)
              </div>
              <div className="col-span-9 p-2.5 space-y-1.5">
                <div>
                  <span className="font-bold text-black">• {plan.section3Assessment.enrichmentActivities.title}: </span>
                  <span>{toArabicDigits(plan.section3Assessment.enrichmentActivities.puzzleOrChallenge)}</span>
                </div>
                <div>
                  <span className="font-bold text-black">• تدريب الأقران والمساعد الصغير: </span>
                  <span>{toArabicDigits(plan.section3Assessment.enrichmentActivities.peerTutoring)}</span>
                </div>
              </div>
            </div>

            {/* التغذية الراجعة الفورية المعتمدة */}
            <div className="grid grid-cols-12">
              <div className="col-span-3 bg-slate-100 p-2.5 font-bold border-l border-black">
                التغذية الراجعة الفورية المعتمدة
              </div>
              <div className="col-span-9 p-2.5 space-y-1">
                {plan.section3Assessment.immediateFeedback.map((fb, i) => (
                  <div key={i}>• {toArabicDigits(fb)}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ================= رابعاً: إدارة بيئة التعلم ومناخه والتواصل مع الأسرة ================= */}
        <div className="mb-8">
          <div className="bg-slate-200/80 border border-black px-3 py-1.5 font-bold text-sm text-black mb-3 text-right">
            رابعاً: إدارة بيئة التعلم ومناخه والتواصل مع الأسرة
          </div>

          <div className="border border-black divide-y divide-black text-xs text-right">
            <div className="grid grid-cols-12">
              <div className="col-span-3 bg-slate-100 p-2.5 font-bold border-l border-black">
                إدارة البيئة الصفية والدعم النفسي
              </div>
              <div className="col-span-9 p-2.5 space-y-1.5">
                <div>
                  <span className="font-bold text-black">• الروتينات الصفية: </span>
                  <span>{toArabicDigits(plan.section4Environment.classroomRoutines)}</span>
                </div>
                <div>
                  <span className="font-bold text-black">• البيئة الآمنة والمحفزة: </span>
                  <span>{toArabicDigits(plan.section4Environment.safeAndMotivatingClimate)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12">
              <div className="col-span-3 bg-slate-100 p-2.5 font-bold border-l border-black">
                الشراكة والتواصل مع أولياء الأمور
              </div>
              <div className="col-span-9 p-2.5 space-y-1">
                <span className="font-bold text-black">• {toArabicDigits(plan.section4Environment.familyPartnership.cardTitle)}: </span>
                <span>{toArabicDigits(plan.section4Environment.familyPartnership.studentTask)}</span>
                <div className="text-[11px] text-slate-600 mt-1">
                  <strong>دور ولي الأمر:</strong> {toArabicDigits(plan.section4Environment.familyPartnership.parentRole)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="page-break" />

        {/* ================= خامساً: التأمل الذاتي والتطور المهني ================= */}
        <div className="mb-8">
          <div className="bg-slate-200/80 border border-black px-3 py-1.5 font-bold text-sm text-black mb-3 text-right">
            خامساً: التأمل الذاتي والتطور المهني (بعد تنفيذ الدرس)
          </div>

          <div className="border border-black divide-y divide-black text-xs text-right">
            <div className="grid grid-cols-12">
              <div className="col-span-3 bg-slate-100 p-2.5 font-bold border-l border-black">
                نقاط القوة والأثر الملموس على تعلم الطلبة
              </div>
              <div className="col-span-9 p-2.5 space-y-1.5">
                {plan.section5Reflection.strengthsAndImpact.map((item, i) => (
                  <div key={i}>• {toArabicDigits(item)}</div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-12">
              <div className="col-span-3 bg-slate-100 p-2.5 font-bold border-l border-black">
                فرص التحسين ونقل الخبرة للزملاء
              </div>
              <div className="col-span-9 p-2.5 space-y-1.5">
                <div>
                  <span className="font-bold text-black">• فرصة التحسين: </span>
                  <span>{toArabicDigits(plan.section5Reflection.improvementOpportunities)}</span>
                </div>
                <div>
                  <span className="font-bold text-black">• مجتمعات التعلم المهني: </span>
                  <span>{toArabicDigits(plan.section5Reflection.professionalLearningCommunities)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= سادساً: التوقيع والاعتماد الرسمي ================= */}
        <div className="mb-4">
          <div className="bg-slate-200/80 border border-black px-3 py-1.5 font-bold text-sm text-black mb-3 text-right">
            سادساً: التوقيع والاعتماد الرسمي
          </div>

          <div className="border border-black overflow-hidden text-xs text-right">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-black text-center font-bold">
                  <th className="p-2 border-l border-black w-1/3">إعداد وتوقيع المعلم/ة</th>
                  <th className="p-2 border-l border-black w-1/3">اعتماد وتوقيع مدير/ة المدرسة</th>
                  <th className="p-2 w-1/3">اعتماد وتوقيع المشرف/ة التربوي/ة</th>
                </tr>
              </thead>
              <tbody className="align-top divide-x divide-x-reverse divide-black">
                <tr>
                  <td className="p-3 border-l border-black space-y-2">
                    <div><strong>الاسم:</strong> {plan.section6Signatures.teacher.name}</div>
                    <div><strong>التوقيع:</strong> .....................................</div>
                    <div><strong>التاريخ:</strong> {toArabicDigits(plan.section6Signatures.teacher.date)}</div>
                    <div className="pt-2 border-t border-slate-300">
                      <strong>ملاحظات المعلم/ة الذاتية:</strong>
                      <div className="mt-1 text-slate-700">{toArabicDigits(plan.section6Signatures.teacher.notes)}</div>
                    </div>
                  </td>

                  <td className="p-3 border-l border-black space-y-2">
                    <div><strong>الاسم:</strong> {plan.section6Signatures.schoolPrincipal.name}</div>
                    <div><strong>التوقيع والختم:</strong> .................................</div>
                    <div><strong>التاريخ:</strong> {toArabicDigits(plan.section6Signatures.schoolPrincipal.date)}</div>
                    <div className="pt-2 border-t border-slate-300">
                      <strong>توجيهات الإدارة المدرسية:</strong>
                      <div className="mt-1 text-slate-700">{toArabicDigits(plan.section6Signatures.schoolPrincipal.directives)}</div>
                    </div>
                  </td>

                  <td className="p-3 space-y-2">
                    <div><strong>الاسم:</strong> {plan.section6Signatures.educationalSupervisor.name}</div>
                    <div><strong>التوقيع:</strong> .....................................</div>
                    <div><strong>التاريخ:</strong> {toArabicDigits(plan.section6Signatures.educationalSupervisor.date)}</div>
                    <div className="pt-2 border-t border-slate-300">
                      <strong>توجيهات المشرف التربوي:</strong>
                      <div className="mt-1 text-slate-700">{toArabicDigits(plan.section6Signatures.educationalSupervisor.directives)}</div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Stamp / Seal watermark */}
        <div className="text-center text-[10px] text-slate-500 pt-4 border-t border-slate-300 mt-6 flex justify-between items-center">
          <span>نموذج تحضير صفي معتمد ومطابق لمعايير جودة التعليم والتقييم الأصيل (الدرجة ٤)</span>
          <span>منظومة خبير التخطيط التربوي وتحضير الدروس</span>
        </div>
      </div>
    </div>
  );
};
