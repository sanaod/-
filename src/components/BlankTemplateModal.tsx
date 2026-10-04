import React, { useState } from 'react';
import {
  X,
  Printer,
  FileDown,
  FileEdit,
  Sparkles,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Clock,
  Layers,
  Award,
  ArrowRight,
  Download,
  Info,
} from 'lucide-react';
import { LessonPlan, STANDARD_GRADES } from '../types/lessonPlan';
import { createBlankLessonPlan, exportBlankTemplateToWord } from '../utils/blankPlanTemplate';

interface BlankTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePlan: (newPlan: LessonPlan) => void;
  onOpenResourcesModal?: () => void;
}

export const BlankTemplateModal: React.FC<BlankTemplateModalProps> = ({
  isOpen,
  onClose,
  onCreatePlan,
  onOpenResourcesModal,
}) => {
  const [activeTab, setActiveTab] = useState<'sheet' | 'create' | 'guide'>('sheet');

  // Fast creation inputs
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [school, setSchool] = useState('');

  if (!isOpen) return null;

  const handleCreateDigitalPlan = () => {
    const blankPlan = createBlankLessonPlan({
      subject: subject.trim() || 'المبحث الدراسي',
      grade: grade.trim() || 'الصف الدراسي',
      lessonTitle: lessonTitle.trim() || 'درس جديد',
      teacherName: teacherName.trim(),
      school: school.trim(),
    });
    onCreatePlan(blankPlan);
    onClose();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto text-right font-['Cairo',sans-serif]"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-4 flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="bg-linear-to-r from-emerald-950 via-slate-900 to-slate-900 text-white p-5 flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 flex items-center justify-center border border-emerald-500/40 text-emerald-300">
              <FileEdit className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-['Tajawal']">
                استمارة التحضير المفرغة - النموذج الوزاري المعتمد
              </h2>
              <p className="text-xs text-slate-300">
                نسخة مفرغة صممت خصيصاً لمساعدة المعلم على إعداد وتوثيق الدروس الورقية والرقمية
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="bg-slate-100/90 border-b border-slate-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => setActiveTab('sheet')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'sheet'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>معاينة وطباعة الاستمارة (A4)</span>
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'create'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>بدء خطة مفرغة في المحرر</span>
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'guide'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>إرشادات التميز للمعلم</span>
            </button>
          </div>

          {/* Quick Actions in Tab Header */}
          {activeTab === 'sheet' && (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة فورية (A4)</span>
              </button>
              <button
                onClick={exportBlankTemplateToWord}
                className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <FileDown className="w-3.5 h-3.5 text-blue-200" />
                <span>تنزيل مستند Word (.doc)</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          {/* TAB 1: Printable Blank Sheet View */}
          {activeTab === 'sheet' && (
            <div className="space-y-6">
              {/* Informational callout */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950 flex items-start gap-3 no-print">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">استمارة ورقية مفرغة معتمدة مطابقة لمعايير وزارة التربية والتعليم:</p>
                  <p className="text-emerald-800 leading-relaxed text-[11px]">
                    تحتوي هذه النسخة على الترويسة الرسمية، وجداول مسطرة ومنقطة لكتابة الكفايات وسير الحصة الرباعي ومهمات التقويم الأصيل (GRASPS) وسلالم التقدير اللفظية ومساحات للتوقيع والاعتماد. يمكنك طباعتها فوراً واستخدامها في التحضير اليدوي أو حفظها كملف Word.
                  </p>
                </div>
              </div>

              {/* Printable Document Sheet Frame */}
              <div className="bg-white border-2 border-slate-300 rounded-xl p-6 sm:p-8 text-slate-900 shadow-sm space-y-6 text-xs leading-relaxed print:border-none print:shadow-none print:p-0">
                {/* Official Header Table */}
                <div className="border-b-2 border-slate-800 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-black text-sm text-slate-900">دولة فلسطين</p>
                      <p className="font-bold text-slate-800">وزارة التربية والتعليم</p>
                      <p className="text-slate-600">مديرية التربية والتعليم: .......................................</p>
                    </div>

                    <div className="text-center space-y-1">
                      <h1 className="text-base sm:text-lg font-black text-slate-900 font-['Tajawal']">
                        استمارة تحضير درس نموذجية (نسخة مفرغة)
                      </h1>
                      <p className="text-[11px] font-semibold text-slate-500">
                        مستند إلى إطار تقييم أداء المعلم ومعايير التميز (الدرجة 4)
                      </p>
                    </div>

                    <div className="text-left space-y-1">
                      <p className="text-slate-600">المدرسة: .......................................</p>
                      <p className="text-slate-600">العام الدراسي: ٢٠٢٦ / ٢٠٢٧م</p>
                      <p className="text-slate-600">الفصل الدراسي: .............................</p>
                    </div>
                  </div>
                </div>

                {/* Lesson Header Metadata Box */}
                <div>
                  <h3 className="font-bold text-emerald-900 border-r-4 border-emerald-600 pr-2 mb-2">
                    بطاقة بيانات الدرس الأساسية
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border border-slate-300 p-2.5 rounded-lg bg-slate-50/50">
                    <div>
                      <span className="font-bold text-slate-700">المبحث: </span>
                      <span className="text-slate-400">.................................</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">الصف والشعبة: </span>
                      <span className="text-slate-400">.................................</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">اسم المعلم/ة: </span>
                      <span className="text-slate-400">.................................</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">تاريخ التنفيذ: </span>
                      <span className="text-slate-400">.... / .... / ٢٠٢٦م</span>
                    </div>
                    <div className="col-span-2 sm:col-span-3">
                      <span className="font-bold text-slate-700">عنوان الدرس: </span>
                      <span className="text-slate-400">.....................................................................................................</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">الزمن: </span>
                      <span className="text-slate-700 font-semibold">( 40 ) دقيقة</span>
                    </div>
                  </div>
                </div>

                {/* Section 1: Adaptive Planning */}
                <div className="space-y-3">
                  <h3 className="font-bold text-emerald-900 border-r-4 border-emerald-600 pr-2">
                    القسم الأول: التخطيط التكيفي والكفايات التكاملية
                  </h3>

                  {/* Competencies Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-slate-300 text-right">
                      <thead>
                        <tr className="bg-slate-100 text-slate-800 font-bold">
                          <th className="border border-slate-300 p-2 w-1/3">مجال الكفاية التكاملية</th>
                          <th className="border border-slate-300 p-2 w-2/3">المؤشر السلوكي والإجرائي المستهدف</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-slate-300 p-2.5 font-semibold text-slate-800">
                            كفاية التفكير الناقد وحل المشكلات
                          </td>
                          <td className="border border-slate-300 p-2.5 h-12 text-slate-300">
                            .........................................................................................................................................
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-slate-300 p-2.5 font-semibold text-slate-800">
                            كفاية المواطنة والهوية الوطنية
                          </td>
                          <td className="border border-slate-300 p-2.5 h-12 text-slate-300">
                            .........................................................................................................................................
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-slate-300 p-2.5 font-semibold text-slate-800">
                            كفاية الحساب / القرائية والتعبير
                          </td>
                          <td className="border border-slate-300 p-2.5 h-12 text-slate-300">
                            .........................................................................................................................................
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Student Differences & Resources */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50/50">
                      <p className="font-bold text-slate-800 mb-1">الفروق الفردية والتعلم التعاوني:</p>
                      <p className="text-slate-300 leading-6">
                        ...................................................................<br/>
                        ...................................................................
                      </p>
                    </div>
                    <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50/50">
                      <p className="font-bold text-slate-800 mb-1">ذوو الإعاقة وصعوبات التعلم:</p>
                      <p className="text-slate-300 leading-6">
                        ...................................................................<br/>
                        ...................................................................
                      </p>
                    </div>
                    <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50/50">
                      <p className="font-bold text-slate-800 mb-1">المحسوسات والجاهزية الرقمية:</p>
                      <p className="text-slate-300 leading-6">
                        ...................................................................<br/>
                        ...................................................................
                      </p>
                    </div>
                  </div>

                  {/* Reflective Questions */}
                  <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50/30">
                    <p className="font-bold text-slate-800 mb-1">الأسئلة التأملية السابرة والمحفزة للتفكير:</p>
                    <p className="text-slate-400">١. ......................................................................................................................................................................................................</p>
                    <p className="text-slate-400 mt-1">٢. ......................................................................................................................................................................................................</p>
                  </div>
                </div>

                {/* Section 2: 4-Phase Timeline */}
                <div className="space-y-3">
                  <h3 className="font-bold text-emerald-900 border-r-4 border-emerald-600 pr-2">
                    القسم الثاني: سير الحصة الرباعي المعتمد (٤٠ دقيقة)
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-slate-300 text-right">
                      <thead>
                        <tr className="bg-slate-100 text-slate-800 font-bold">
                          <th className="border border-slate-300 p-2 w-1/5">المرحلة والزمن</th>
                          <th className="border border-slate-300 p-2 w-2/5">إجراءات ونشاط المعلم والمتعلم</th>
                          <th className="border border-slate-300 p-2 w-1/5">الاستراتيجيات والمصادر</th>
                          <th className="border border-slate-300 p-2 w-1/5">التقويم والتغذية الراجعة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Phase 1 */}
                        <tr>
                          <td className="border border-slate-300 p-2.5 align-top bg-sky-50/30">
                            <span className="font-bold text-sky-900 block">١. التمهيد والتهيئة</span>
                            <span className="text-[10px] text-slate-500 font-bold">٥ دقائق (إثارة الدافعية)</span>
                          </td>
                          <td className="border border-slate-300 p-2.5 h-16 text-slate-300 align-top">
                            .........................................................................................<br/>
                            .........................................................................................
                          </td>
                          <td className="border border-slate-300 p-2.5 text-slate-300 align-top">
                            ...................................................<br/>
                            ...................................................
                          </td>
                          <td className="border border-slate-300 p-2.5 text-slate-300 align-top">
                            ...................................................<br/>
                            ...................................................
                          </td>
                        </tr>

                        {/* Phase 2 */}
                        <tr>
                          <td className="border border-slate-300 p-2.5 align-top bg-emerald-50/30">
                            <span className="font-bold text-emerald-900 block">٢. العرض والاستكشاف</span>
                            <span className="text-[10px] text-slate-500 font-bold">١٥ دقيقة (المحسوسات والمفاهيم)</span>
                          </td>
                          <td className="border border-slate-300 p-2.5 h-20 text-slate-300 align-top">
                            .........................................................................................<br/>
                            .........................................................................................<br/>
                            .........................................................................................
                          </td>
                          <td className="border border-slate-300 p-2.5 text-slate-300 align-top">
                            ...................................................<br/>
                            ...................................................
                          </td>
                          <td className="border border-slate-300 p-2.5 text-slate-300 align-top">
                            ...................................................<br/>
                            ...................................................
                          </td>
                        </tr>

                        {/* Phase 3 */}
                        <tr>
                          <td className="border border-slate-300 p-2.5 align-top bg-amber-50/30">
                            <span className="font-bold text-amber-900 block">٣. التطبيق والتعميق</span>
                            <span className="text-[10px] text-slate-500 font-bold">١٢ دقيقة (GRASPS والتمايز)</span>
                          </td>
                          <td className="border border-slate-300 p-2.5 h-20 text-slate-300 align-top">
                            .........................................................................................<br/>
                            .........................................................................................<br/>
                            .........................................................................................
                          </td>
                          <td className="border border-slate-300 p-2.5 text-slate-300 align-top">
                            ...................................................<br/>
                            ...................................................
                          </td>
                          <td className="border border-slate-300 p-2.5 text-slate-300 align-top">
                            ...................................................<br/>
                            ...................................................
                          </td>
                        </tr>

                        {/* Phase 4 */}
                        <tr>
                          <td className="border border-slate-300 p-2.5 align-top bg-purple-50/30">
                            <span className="font-bold text-purple-900 block">٤. الخاتمة والتقويم</span>
                            <span className="text-[10px] text-slate-500 font-bold">٨ دقائق (بطاقة الخروج)</span>
                          </td>
                          <td className="border border-slate-300 p-2.5 h-16 text-slate-300 align-top">
                            .........................................................................................<br/>
                            .........................................................................................
                          </td>
                          <td className="border border-slate-300 p-2.5 text-slate-300 align-top">
                            ...................................................<br/>
                            ...................................................
                          </td>
                          <td className="border border-slate-300 p-2.5 text-slate-300 align-top">
                            ...................................................<br/>
                            ...................................................
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Section 3: Assessment & GRASPS */}
                <div className="space-y-3">
                  <h3 className="font-bold text-emerald-900 border-r-4 border-emerald-600 pr-2">
                    القسم الثالث: التقويم الأصيل (GRASPS) وسلم التقدير اللفظي (Rubric)
                  </h3>

                  {/* GRASPS Box */}
                  <div className="border border-slate-300 p-3 rounded-lg bg-slate-50/50 space-y-1.5">
                    <p className="font-bold text-slate-800">مهمة التقويم الأصيل (GRASPS):</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                      <div><span className="font-bold text-slate-700">الدور: </span><span className="text-slate-400">..............................</span></div>
                      <div><span className="font-bold text-slate-700">الجمهور: </span><span className="text-slate-400">..............................</span></div>
                      <div><span className="font-bold text-slate-700">الموقف: </span><span className="text-slate-400">..............................</span></div>
                      <div><span className="font-bold text-slate-700">المنتج: </span><span className="text-slate-400">..............................</span></div>
                      <div className="col-span-2"><span className="font-bold text-slate-700">المعايير: </span><span className="text-slate-400">...................................................................</span></div>
                    </div>
                  </div>

                  {/* Rubric Matrix */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-slate-300 text-right">
                      <thead>
                        <tr className="bg-slate-100 text-slate-800 font-bold">
                          <th className="border border-slate-300 p-2 w-1/4">معيار التقييم</th>
                          <th className="border border-slate-300 p-2">مبتدئ (١)</th>
                          <th className="border border-slate-300 p-2">نامٍ (٢)</th>
                          <th className="border border-slate-300 p-2">كفء (٣)</th>
                          <th className="border border-slate-300 p-2">متميز (٤)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[1, 2, 3].map((num) => (
                          <tr key={num} className="h-12">
                            <td className="border border-slate-300 p-2 font-bold text-slate-700">
                              المعيار {num}: <span className="text-slate-300 font-normal">........................</span>
                            </td>
                            <td className="border border-slate-300 p-1.5 text-slate-300 text-center">........................</td>
                            <td className="border border-slate-300 p-1.5 text-slate-300 text-center">........................</td>
                            <td className="border border-slate-300 p-1.5 text-slate-300 text-center">........................</td>
                            <td className="border border-slate-300 p-1.5 text-slate-300 text-center">........................</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Section 4 & 5: Environment & Reflection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border border-slate-300 rounded-lg p-3 bg-slate-50/30">
                    <h4 className="font-bold text-slate-800 mb-1.5">القسم الرابع: بيئة التعلم والشراكة الأسرية</h4>
                    <p className="text-[11px] font-semibold text-slate-600">الروتين الصفي والمناخ الآمن:</p>
                    <p className="text-slate-300 mb-2">......................................................................................................</p>
                    <p className="text-[11px] font-semibold text-slate-600">الشراكة مع ولي الأمر (مهمة منزلية):</p>
                    <p className="text-slate-300">......................................................................................................</p>
                  </div>

                  <div className="border border-slate-300 rounded-lg p-3 bg-slate-50/30">
                    <h4 className="font-bold text-slate-800 mb-1.5">القسم الخامس: التأمل الذاتي وشواهد ملف الإنجاز</h4>
                    <p className="text-[11px] font-semibold text-slate-600">نقاط القوة وشواهد التميز:</p>
                    <p className="text-slate-300 mb-2">......................................................................................................</p>
                    <p className="text-[11px] font-semibold text-slate-600">فرص التحسين ومجتمعات التعلم (PLC):</p>
                    <p className="text-slate-300">......................................................................................................</p>
                  </div>
                </div>

                {/* Section 6: Official Signatures */}
                <div className="border-t-2 border-slate-400 pt-4">
                  <h4 className="font-bold text-slate-800 mb-2">القسم السادس: الاعتمادات والملاحظات الرسمية</h4>
                  <div className="grid grid-cols-3 gap-3 border border-slate-300 p-3 rounded-lg text-center text-[11px]">
                    <div className="space-y-1 border-l border-slate-300 pl-2">
                      <p className="font-bold text-slate-800">المعلم/ة المنفذ/ة</p>
                      <p className="text-slate-400">الاسم: .......................................</p>
                      <p className="text-slate-400">التوقيع: .....................................</p>
                      <p className="text-slate-400">التاريخ: ..... / ..... / ٢٠٢٦م</p>
                    </div>
                    <div className="space-y-1 border-l border-slate-300 pl-2">
                      <p className="font-bold text-slate-800">مدير/ة المدرسة</p>
                      <p className="text-slate-400">الاسم: .......................................</p>
                      <p className="text-slate-400">التوقيع والختم: ..........................</p>
                      <p className="text-slate-400">التوجيه: .....................................</p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-slate-800">المشرف/ة التربوي/ة</p>
                      <p className="text-slate-400">الاسم: .......................................</p>
                      <p className="text-slate-400">التوقيع: .....................................</p>
                      <p className="text-slate-400">التوجيه: .....................................</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Fast Digital Plan Setup */}
          {activeTab === 'create' && (
            <div className="max-w-xl mx-auto py-4 space-y-5">
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-2">
                  <FileEdit className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 font-['Tajawal']">
                  بدء إعداد خطة درس مفرغة في المحرر الرقمي
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  أدخل البيانات الأساسية للدرس وسيقوم النظام بفتح نموذج تحضير فارغ مهيأ بالكامل بجميع الأقسام الستة والترويسة المعتمدة لتقوم بتعبئته وحفظه.
                </p>
              </div>

              {onOpenResourcesModal && (
                <div
                  onClick={() => {
                    onClose();
                    onOpenResourcesModal();
                  }}
                  className="p-3.5 bg-linear-to-r from-emerald-50 via-teal-50 to-emerald-100/60 border-2 border-dashed border-emerald-400 hover:border-emerald-600 rounded-2xl flex items-center justify-between gap-3 cursor-pointer group transition-all shadow-2xs hover:shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs relative">
                      <Layers className="w-5 h-5 text-emerald-100" />
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 text-amber-950 font-black rounded-full flex items-center justify-center text-[9px]">
                        +
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-emerald-950">إضافة مصادر ومناهج تعليمية لدعم التحضير</h4>
                      <p className="text-[11px] text-emerald-800">ارفع نصوص المنهاج أو أوراق العمل لاستعراضها أثناء كتابة الخطة</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-800 bg-white px-3 py-1.5 rounded-lg border border-emerald-300 shrink-0 group-hover:bg-emerald-50">
                    ＋ إضافة الآن
                  </span>
                </div>
              )}

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">عنوان الدرس *</label>
                  <input
                    type="text"
                    placeholder="مثال: درس الكسور المتكافئة أو القراءة الاستيعابية..."
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">المبحث الدراسي *</label>
                    <input
                      type="text"
                      placeholder="مثال: الرياضيات، اللغة العربية، العلوم..."
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">الصف الدراسي *</label>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setGrade('الصف الأول')}
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold transition-colors ${
                            grade === 'الصف الأول' || grade === 'الصف الأول الأساسي'
                              ? 'bg-emerald-700 text-white'
                              : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 border border-slate-200'
                          }`}
                        >
                          الصف الأول
                        </button>
                        <button
                          type="button"
                          onClick={() => setGrade('الصف الثاني')}
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold transition-colors ${
                            grade === 'الصف الثاني' || grade === 'الصف الثاني الأساسي'
                              ? 'bg-emerald-700 text-white'
                              : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 border border-slate-200'
                          }`}
                        >
                          الصف الثاني
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      list="blank-grade-datalist"
                      placeholder="اختر أو اكتب الصف (مثال: الصف الأول، الصف الثاني...)"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                    />
                    <datalist id="blank-grade-datalist">
                      {STANDARD_GRADES.map((g) => (
                        <option key={g} value={g} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">اسم المعلم/ة</label>
                    <input
                      type="text"
                      placeholder="اسم المعلم/ة..."
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">المدرسة</label>
                    <input
                      type="text"
                      placeholder="اسم المدرسة..."
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleCreateDigitalPlan}
                    className="w-full py-2.5 bg-linear-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-300" />
                    <span>إنشاء الخطة والبدء بالتحضير الفوري</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Teacher Excellence Guidelines */}
          {activeTab === 'guide' && (
            <div className="space-y-4 max-w-2xl mx-auto py-2">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 text-xs leading-relaxed">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Award className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-sm font-bold text-slate-900 font-['Tajawal']">
                    دليل المعلم لإعداد خطة نموذجية تحقق مؤشرات التميز (الدرجة 4)
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-800 mb-1">١. التخطيط التكيفي (القسم الأول):</p>
                    <p className="text-slate-600 text-[11px]">
                      احرص على ربط الدرس بأربع كفايات تكاملية (التفكير الناقد، المواطنة والهوية الوطنية، الحساب أو القرائية، والتعلم الرقمي). وخصص أنشطة ومحسوسات ملائمة للطلبة ذوي الاحتياجات أو صعوبات التعلم.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-800 mb-1">٢. التوازن الزمني لسير الحصة (القسم الثاني):</p>
                    <p className="text-slate-600 text-[11px]">
                      توزيع الدقائق الموصى به لدرس مدته ٤٠ دقيقة هو:
                      <br/>
                      • <b>التمهيد والتهيئة:</b> ٥ دقائق (إثارة الدافعية والمثيرات البصرية).
                      <br/>
                      • <b>العرض والاستكشاف:</b> ١٥ دقيقة (التعلم النشط والمحسوسات).
                      <br/>
                      • <b>التطبيق والتعميق:</b> ١٢ دقيقة (مهمة GRASPS والعمل التعاوني).
                      <br/>
                      • <b>الخاتمة والتقويم:</b> ٨ دقائق (بطاقة الخروج Exit Ticket والواجب الأسري).
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-800 mb-1">٣. مهمة التقويم الأصيل وسلالم التقدير (القسم الثالث):</p>
                    <p className="text-slate-600 text-[11px]">
                      صغ مهمة واقعية (GRASPS) تمنح الطالب دوراً حقيقياً في المجتمع (مثل: موثق، مرشد، مهندس، حاسب)، وحدد سلم تقدير لفظي (Rubric) من أربعة مستويات واضحة الأوصاف (مبتدئ، نامٍ، كفء، متميز).
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-800 mb-1">٤. الشراكة الأسرية والتأمل الذاتي (القسمان الرابع والخامس):</p>
                    <p className="text-slate-600 text-[11px]">
                      صمم بطاقة تفاعلية منزلية قصيرة يشارك فيها ولي الأمر، وسجل انطباعاتك في التأمل الذاتي وشواهد ملف الإنجاز لنقاشها في مجتمع التعلم المهني (PLC).
                    </p>
                  </div>
                </div>

                <div className="pt-2 text-center">
                  <button
                    onClick={() => setActiveTab('sheet')}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2"
                  >
                    <span>معاينة الاستمارة المفرغة للطباعة</span>
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
