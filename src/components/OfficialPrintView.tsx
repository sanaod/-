import React, { useRef, useState } from 'react';
import { LessonPlan } from '../types/lessonPlan';
import { Printer, ArrowRight, Download, Loader2, CheckCircle2, FileText, FileCode } from 'lucide-react';
import { toArabicDigits } from '../utils/arabicNumerals';
import { exportLessonPlanToPdf } from '../utils/pdfExport';
import { exportToWord, exportToHtml } from '../utils/exportUtils';

interface OfficialPrintViewProps {
  plan: LessonPlan;
  onBack: () => void;
}

export const OfficialPrintView: React.FC<OfficialPrintViewProps> = ({ plan, onBack }) => {
  const documentContainerRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportProgress, setExportProgress] = useState<string>('');

  const handlePrintBrowser = () => {
    window.print();
  };

  const handleExportJsPdf = async () => {
    if (!documentContainerRef.current) return;
    setIsExportingPdf(true);
    setExportProgress('جاري تحضير وتنسيق الصفحات...');

    try {
      const sanitizedTitle = (plan.header.lessonTitle || 'خطة_درس')
        .replace(/[/\\?%*:|"<>]/g, '-')
        .trim();
      const fileName = `${sanitizedTitle}_نموذج_رسمي.pdf`;

      await exportLessonPlanToPdf(documentContainerRef.current, {
        fileName,
        onProgress: (msg) => setExportProgress(msg),
      });

      setExportProgress('تم إنشاء ملف الـ PDF بنجاح!');
      setTimeout(() => {
        setIsExportingPdf(false);
        setExportProgress('');
      }, 1500);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('حدث خطأ أثناء إنشاء ملف PDF. يمكنك استخدام زر "طباعة المتصفح" كخيار بديل.');
      setIsExportingPdf(false);
      setExportProgress('');
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-200/80 p-2 sm:p-5 md:p-8 text-right font-['Cairo',sans-serif]">
      {/* Top action toolbar (hidden on print) */}
      <div className="max-w-4xl mx-auto mb-4 sm:mb-6 bg-white p-3.5 sm:p-4 rounded-2xl shadow-md border border-slate-300 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors order-2 sm:order-1"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للمحرر التفاعلي</span>
          </button>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3 order-1 sm:order-2">
            {/* Primary jsPDF Export Button */}
            <button
              onClick={handleExportJsPdf}
              disabled={isExportingPdf}
              className="col-span-2 sm:col-span-1 px-4 sm:px-5 py-2.5 bg-linear-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-200" />
                  <span className="truncate">{exportProgress || 'جاري المعالجة...'}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-emerald-200 shrink-0" />
                  <span>تصدير كملف PDF (jsPDF)</span>
                </>
              )}
            </button>

            {/* Native Browser Print Option */}
            <button
              onClick={handlePrintBrowser}
              className="px-3 sm:px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <Printer className="w-4 h-4 text-slate-300 shrink-0" />
              <span>طباعة A4</span>
            </button>

            {/* Quick Word Export */}
            <button
              onClick={() => exportToWord(plan)}
              className="px-3 sm:px-3.5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              title="تصدير الخطة كملف Microsoft Word"
            >
              <FileText className="w-4 h-4 text-blue-200 shrink-0" />
              <span>Word</span>
            </button>

            {/* Quick HTML Export */}
            <button
              onClick={() => exportToHtml(plan)}
              className="col-span-2 sm:col-span-1 px-3 sm:px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              title="تصدير كصفحة ويب HTML"
            >
              <FileCode className="w-4 h-4 text-emerald-200 shrink-0" />
              <span>HTML ويب</span>
            </button>
          </div>
        </div>

        {/* Mobile helper notice */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>💡 للمعاينة المثالية: تدعم المنظومة الجوال والتابلت وشاشات الكمبيوتر.</span>
          <span className="font-semibold text-emerald-800 hidden sm:inline">إعداد وتصميم: أ. عبد الرحمن دويكات</span>
        </div>

        {isExportingPdf && (
          <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
            <span>{exportProgress}</span>
          </div>
        )}
      </div>

      {/* Official Multi-Page Document Container */}
      <div
        ref={documentContainerRef}
        dir="rtl"
        className="max-w-4xl mx-auto space-y-6 sm:space-y-8 print:space-y-0 official-document-wrapper text-right overflow-x-auto"
      >
        {/* ================= PAGE 1 ================= */}
        <div className="official-print-page bg-white border-2 border-black p-6 md:p-9 shadow-xl relative min-h-[1050px] flex flex-col justify-between">
          <div>
            {/* Top Header */}
            <div className="flex items-center justify-between gap-4 mb-5 border-b-2 border-black pb-3">
              <div className="text-right space-y-0.5 text-xs font-bold text-black">
                <p>{plan.header.country}</p>
                <p>{plan.header.ministry}</p>
                <p>{plan.header.school}</p>
              </div>

              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <img
                    src="/logo.png"
                    alt="شعار منظومة عبقور"
                    className="w-12 h-12 rounded-full object-cover border-2 border-amber-400 shadow-xs"
                  />
                  <div>
                    <h2 className="text-sm font-black text-black font-['Tajawal']">
                      منظومة عبقور للتخطيط التربوي وتحضير الدروس
                    </h2>
                    <span className="text-[10px] text-slate-700 font-bold block">
                      إعداد وتصميم: الأستاذ عبد الرحمن دويكات
                    </span>
                  </div>
                </div>
                <h1 className="text-base md:text-lg font-extrabold text-black font-['Tajawal'] underline decoration-1 underline-offset-4">
                  {plan.header.subject ? `نموذج تحضير درس (مبحث ${plan.header.subject})` : 'نموذج استمارة تحضير درس مفرغة'}
                </h1>
                <p className="text-[11px] font-medium text-slate-700">
                  {plan.header.grade
                    ? `مستند إلى إطار تقييم أداء المعلم وكتب المنهاج المعتمدة (${plan.header.grade})`
                    : 'مستند إلى إطار تقييم أداء المعلم ومعايير التميز والتخطيط التكيفي الوزاري'}
                </p>
              </div>

              <div className="text-left space-y-0.5 text-xs font-bold text-black">
                <p>العام الدراسي: ٢٠٢٦/٢٠٢٥م</p>
                <p>الفصل: {plan.header.semester}</p>
                <p className="text-emerald-800">النموذج الوزاري المعتمد</p>
              </div>
            </div>

            {/* General Info Grid Box */}
            <div className="border border-black mb-6 overflow-hidden text-xs">
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

            {/* أولاً: عملية التحليل والتخطيط التكيفي */}
            <div>
              <div className="bg-slate-200/90 border border-black px-3 py-1 font-bold text-xs md:text-sm text-black mb-2 text-right">
                أولاً: عملية التحليل والتخطيط التكيفي (المحتوى، البيئة، المصادر، والمتعلمين)
              </div>

              <div className="border border-black divide-y divide-black text-xs text-right">
                {/* الكفايات التكاملية المستهدفة */}
                <div className="grid grid-cols-12">
                  <div className="col-span-3 bg-slate-100 p-2 font-bold border-l border-black flex items-center">
                    الكفايات التكاملية المستهدفة
                  </div>
                  <div className="col-span-9 p-2 space-y-1">
                    {plan.section1.integrativeCompetencies.map((comp, idx) => (
                      <div key={idx} className="leading-relaxed">
                        <span className="font-bold text-black">• {comp.title}: </span>
                        <span className="text-slate-800">{toArabicDigits(comp.description)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* خصائص الطلبة والتخطيط التكيفي */}
                <div className="grid grid-cols-12">
                  <div className="col-span-3 bg-slate-100 p-2 font-bold border-l border-black flex items-center">
                    تحليل خصائص الطلبة والتخطيط التكيفي
                  </div>
                  <div className="col-span-9 p-2 space-y-1">
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

                {/* مصادر OER والجاهزية الرقمية */}
                <div className="grid grid-cols-12">
                  <div className="col-span-3 bg-slate-100 p-2 font-bold border-l border-black flex items-center">
                    مصادر التعلم المفتوحة (OER) والجاهزية الرقمية
                  </div>
                  <div className="col-span-9 p-2 space-y-1">
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

                {/* أخلاقيات التكنولوجيا */}
                <div className="grid grid-cols-12">
                  <div className="col-span-3 bg-slate-100 p-2 font-bold border-l border-black flex items-center">
                    أخلاقيات التكنولوجيا والسلامة العلمية
                  </div>
                  <div className="col-span-9 p-2 space-y-1">
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

                {/* الأسئلة التأملية */}
                <div className="grid grid-cols-12">
                  <div className="col-span-3 bg-slate-100 p-2 font-bold border-l border-black flex items-center">
                    الأسئلة التأملية المثيرة للتفكير
                  </div>
                  <div className="col-span-9 p-2 space-y-0.5">
                    {plan.section1.reflectiveQuestions.map((q, idx) => (
                      <div key={idx} className="font-semibold text-slate-800">
                        « {toArabicDigits(q)} »
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Page 1 Footer */}
          <div className="pt-4 border-t border-slate-300 mt-4 flex items-center justify-between text-[10px] text-slate-600">
            <span>{plan.header.ministry} - {plan.header.school}</span>
            <span className="font-semibold text-slate-700">إعداد وتصميم: الأستاذ عبد الرحمن دويكات (الحقوق محفوظة برخصة المشاع الإبداعي CC BY-NC-SA 4.0)</span>
            <span>الصفحة ١ من ٤</span>
          </div>
        </div>

        <div className="page-break" />

        {/* ================= PAGE 2 ================= */}
        <div className="official-print-page bg-white border-2 border-black p-6 md:p-9 shadow-xl relative min-h-[1050px] flex flex-col justify-between">
          <div>
            {/* Header running strip */}
            <div className="flex items-center justify-between text-xs border-b border-black pb-2 mb-4 font-semibold text-slate-700">
              <span>{plan.header.country} - {plan.header.ministry}</span>
              <span>مبحث: {plan.header.subject} | الدرس: {toArabicDigits(plan.header.lessonTitle)}</span>
              <span>{plan.header.school}</span>
            </div>

            <div className="bg-slate-200/90 border border-black px-3 py-1.5 font-bold text-xs md:text-sm text-black mb-3 text-right">
              ثانياً: مخطط سير الحصة والأنشطة المتمركزة حول المتعلم (الحصة {toArabicDigits(plan.header.currentPeriod)} من {toArabicDigits(plan.header.totalPeriods)} - {toArabicDigits(plan.header.periodDurationMinutes)} دقيقة)
            </div>

            <div className="border border-black overflow-hidden text-xs text-right">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-black text-center font-bold">
                    <th className="p-2 border-l border-black w-24">المرحلة والزمن</th>
                    <th className="p-2 border-l border-black">إجراءات المعلم والأنشطة المتمركزة حول المتعلم</th>
                    <th className="p-2 border-l border-black w-44">الاستراتيجيات ومصادر التعلم</th>
                    <th className="p-2 w-44">التقويم والتغذية الراجعة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black">
                  {plan.section2Timeline.map((phase) => (
                    <tr key={phase.id} className="align-top">
                      <td className="p-2 border-l border-black font-bold text-center bg-slate-50">
                        <div>{toArabicDigits(phase.phaseName)}</div>
                        <div className="text-[11px] text-slate-600 mt-1">({toArabicDigits(phase.durationMinutes)} دقائق)</div>
                      </td>
                      <td className="p-2 border-l border-black space-y-1.5 leading-relaxed text-right">
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

          {/* Page 2 Footer */}
          <div className="pt-4 border-t border-slate-300 mt-4 flex items-center justify-between text-[10px] text-slate-600">
            <span>مخطط سير الحصة المتمركزة حول المتعلم</span>
            <span className="font-semibold text-slate-700">إعداد وتصميم: الأستاذ عبد الرحمن دويكات (الحقوق محفوظة برخصة المشاع الإبداعي CC BY-NC-SA 4.0)</span>
            <span>الصفحة ٢ من ٤</span>
          </div>
        </div>

        <div className="page-break" />

        {/* ================= PAGE 3 ================= */}
        <div className="official-print-page bg-white border-2 border-black p-6 md:p-9 shadow-xl relative min-h-[1050px] flex flex-col justify-between">
          <div>
            {/* Header running strip */}
            <div className="flex items-center justify-between text-xs border-b border-black pb-2 mb-4 font-semibold text-slate-700">
              <span>{plan.header.country} - {plan.header.ministry}</span>
              <span>مبحث: {plan.header.subject} | {toArabicDigits(plan.header.lessonTitle)}</span>
              <span>{plan.header.school}</span>
            </div>

            {/* ثالثاً: المتابعة والتقويم المستمر */}
            <div className="mb-5">
              <div className="bg-slate-200/90 border border-black px-3 py-1 font-bold text-xs md:text-sm text-black mb-2 text-right">
                ثالثاً: المتابعة والتقويم المستمر والأنشطة العلاجية والبديلة
              </div>

              <div className="border border-black divide-y divide-black text-xs text-right">
                {/* مهمة GRASPS */}
                <div className="grid grid-cols-12">
                  <div className="col-span-3 bg-slate-100 p-2 font-bold border-l border-black">
                    أدوات التقويم ومهمة التقويم الأصيل
                  </div>
                  <div className="col-span-9 p-2 space-y-1.5">
                    <div className="leading-relaxed">
                      <span className="font-bold text-black">• مهمة التقويم الأصيل (GRASPS): </span>
                      <span className="italic">{toArabicDigits(plan.section3Assessment.graspsTask.fullDescription)}</span>
                    </div>

                    {/* Rubric Matrix */}
                    <div className="mt-1 border border-slate-300 rounded-xs overflow-hidden">
                      <table className="w-full text-[10px] text-right border-collapse">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-300 font-bold text-center">
                            <th className="p-1 border-l border-slate-300 text-right">المعيار</th>
                            <th className="p-1 border-l border-slate-300">١: مبتدئ</th>
                            <th className="p-1 border-l border-slate-300">٢: نامٍ</th>
                            <th className="p-1 border-l border-slate-300">٣: كفء</th>
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

                {/* العلاجية */}
                <div className="grid grid-cols-12">
                  <div className="col-span-3 bg-slate-100 p-2 font-bold border-l border-black">
                    الأنشطة العلاجية (دون المتوقع)
                  </div>
                  <div className="col-span-9 p-2 space-y-1">
                    {plan.section3Assessment.remedialActivities.map((rem, i) => (
                      <div key={i}>
                        <span className="font-bold text-black">• {toArabicDigits(rem.title)}: </span>
                        <span>{toArabicDigits(rem.description)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* الإثرائية */}
                <div className="grid grid-cols-12">
                  <div className="col-span-3 bg-slate-100 p-2 font-bold border-l border-black">
                    الأنشطة البديلة والإثرائية
                  </div>
                  <div className="col-span-9 p-2 space-y-1">
                    <div>
                      <span className="font-bold text-black">• {plan.section3Assessment.enrichmentActivities.title}: </span>
                      <span>{toArabicDigits(plan.section3Assessment.enrichmentActivities.puzzleOrChallenge)}</span>
                    </div>
                    <div>
                      <span className="font-bold text-black">• تدريب الأقران: </span>
                      <span>{toArabicDigits(plan.section3Assessment.enrichmentActivities.peerTutoring)}</span>
                    </div>
                  </div>
                </div>

                {/* التغذية الراجعة */}
                <div className="grid grid-cols-12">
                  <div className="col-span-3 bg-slate-100 p-2 font-bold border-l border-black">
                    التغذية الراجعة الفورية المعتمدة
                  </div>
                  <div className="col-span-9 p-2 space-y-1">
                    {plan.section3Assessment.immediateFeedback.map((fb, i) => (
                      <div key={i}>• {toArabicDigits(fb)}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* رابعاً: إدارة بيئة التعلم */}
            <div>
              <div className="bg-slate-200/90 border border-black px-3 py-1 font-bold text-xs md:text-sm text-black mb-2 text-right">
                رابعاً: إدارة بيئة التعلم ومناخه والتواصل مع الأسرة
              </div>

              <div className="border border-black divide-y divide-black text-xs text-right">
                <div className="grid grid-cols-12">
                  <div className="col-span-3 bg-slate-100 p-2 font-bold border-l border-black">
                    إدارة البيئة الصفية والدعم النفسي
                  </div>
                  <div className="col-span-9 p-2 space-y-1">
                    <div>
                      <span className="font-bold text-black">• الروتينات الصفية: </span>
                      <span>{toArabicDigits(plan.section4Environment.classroomRoutines)}</span>
                    </div>
                    <div>
                      <span className="font-bold text-black">• البيئة الآمنة: </span>
                      <span>{toArabicDigits(plan.section4Environment.safeAndMotivatingClimate)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-12">
                  <div className="col-span-3 bg-slate-100 p-2 font-bold border-l border-black">
                    الشراكة مع أولياء الأمور
                  </div>
                  <div className="col-span-9 p-2 space-y-0.5">
                    <span className="font-bold text-black">• {toArabicDigits(plan.section4Environment.familyPartnership.cardTitle)}: </span>
                    <span>{toArabicDigits(plan.section4Environment.familyPartnership.studentTask)}</span>
                    <div className="text-[11px] text-slate-600">
                      <strong>دور ولي الأمر:</strong> {toArabicDigits(plan.section4Environment.familyPartnership.parentRole)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Page 3 Footer */}
          <div className="pt-4 border-t border-slate-300 mt-4 flex items-center justify-between text-[10px] text-slate-600">
            <span>التقويم الأصيل وإدارة بيئة التعلم</span>
            <span className="font-semibold text-slate-700">إعداد وتصميم: الأستاذ عبد الرحمن دويكات (الحقوق محفوظة برخصة المشاع الإبداعي CC BY-NC-SA 4.0)</span>
            <span>الصفحة ٣ من ٤</span>
          </div>
        </div>

        <div className="page-break" />

        {/* ================= PAGE 4 ================= */}
        <div className="official-print-page bg-white border-2 border-black p-6 md:p-9 shadow-xl relative min-h-[1050px] flex flex-col justify-between">
          <div>
            {/* Header running strip */}
            <div className="flex items-center justify-between text-xs border-b border-black pb-2 mb-4 font-semibold text-slate-700">
              <span>{plan.header.country} - {plan.header.ministry}</span>
              <span>مبحث: {plan.header.subject} | {toArabicDigits(plan.header.lessonTitle)}</span>
              <span>{plan.header.school}</span>
            </div>

            {/* خامساً: التأمل الذاتي والتطور المهني */}
            <div className="mb-6">
              <div className="bg-slate-200/90 border border-black px-3 py-1 font-bold text-xs md:text-sm text-black mb-2 text-right">
                خامساً: التأمل الذاتي والتطور المهني (بعد تنفيذ الدرس)
              </div>

              <div className="border border-black divide-y divide-black text-xs text-right">
                <div className="grid grid-cols-12">
                  <div className="col-span-3 bg-slate-100 p-2.5 font-bold border-l border-black">
                    نقاط القوة والأثر الملموس على تعلم الطلبة
                  </div>
                  <div className="col-span-9 p-2.5 space-y-1">
                    {plan.section5Reflection.strengthsAndImpact.map((item, i) => (
                      <div key={i}>• {toArabicDigits(item)}</div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-12">
                  <div className="col-span-3 bg-slate-100 p-2.5 font-bold border-l border-black">
                    فرص التحسين ونقل الخبرة
                  </div>
                  <div className="col-span-9 p-2.5 space-y-1">
                    <div>
                      <span className="font-bold text-black">• فرصة التحسين: </span>
                      <span>{toArabicDigits(plan.section5Reflection.improvementOpportunities)}</span>
                    </div>
                    <div>
                      <span className="font-bold text-black">• مجتمعات التعلم المهني (PLC): </span>
                      <span>{toArabicDigits(plan.section5Reflection.professionalLearningCommunities)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* سادساً: التوقيع والاعتماد الرسمي */}
            <div className="mb-4">
              <div className="bg-slate-200/90 border border-black px-3 py-1 font-bold text-xs md:text-sm text-black mb-2 text-right">
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
          </div>

          {/* Page 4 Footer & Official Seal Stamp watermark */}
          <div className="pt-4 border-t border-slate-300 mt-4 text-[10px] text-slate-600 flex justify-between items-center">
            <span>نموذج تحضير صفي معتمد ومطابق لمعايير جودة التعليم والتقييم الأصيل (الدرجة ٤)</span>
            <span className="font-semibold text-slate-700">إعداد وتصميم: الأستاذ عبد الرحمن دويكات (الحقوق محفوظة برخصة المشاع الإبداعي CC BY-NC-SA 4.0)</span>
            <span>الصفحة ٤ من ٤</span>
          </div>
        </div>
      </div>
    </div>
  );
};
