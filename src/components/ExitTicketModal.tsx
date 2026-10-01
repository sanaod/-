import React from 'react';
import { X, Printer, CheckCircle2, Flag, Sparkles, BookOpen } from 'lucide-react';
import { LessonPlan } from '../types/lessonPlan';
import { toArabicDigits } from '../utils/arabicNumerals';

interface ExitTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: LessonPlan;
}

export const ExitTicketModal: React.FC<ExitTicketModalProps> = ({ isOpen, onClose, plan }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const subject = plan.header.subject || '';
  const lessonTitle = plan.header.lessonTitle || '';

  // Extract explicit exit ticket task from Phase 4
  const exitPhase = plan.section2Timeline.find(
    (p) => p.phaseName.includes('الخاتمة') || p.phaseName.includes('التقويم')
  );
  
  let exitTaskText = exitPhase?.teacherAndStudentActions.find(
    (a) => a.includes('بطاقة الخروج') || a.includes('Exit Ticket')
  );

  // If not formatted or generic, derive a smart customized prompt based on subject & lesson
  if (!exitTaskText && exitPhase && exitPhase.teacherAndStudentActions.length > 0) {
    exitTaskText = exitPhase.teacherAndStudentActions[0];
  }

  if (!exitTaskText) {
    if (/رياضيات/i.test(subject)) {
      exitTaskText = `اكتب عدداً أو مسألة تمثل مفهوم (${lessonTitle}) وحلها موضحاً خطوات تفكيرك الرياضي.`;
    } else if (/علوم/i.test(subject)) {
      exitTaskText = `فسر بأسلوبك العلمي ظاهرة (${lessonTitle}) واذكر مثالاً حياً من بيئتك المحلية في فلسطين.`;
    } else if (/عربية/i.test(subject)) {
      exitTaskText = `صغ جملة مفيدة تتضمن الفكرة الرئيسة لدرس (${lessonTitle}) مع الضبط اللغوي السليم.`;
    } else if (/اجتماعية|جغرافيا/i.test(subject)) {
      exitTaskText = `حدد معلمين جغرافيين أو حدثاً بارزاً من درس (${lessonTitle}) واذكر دلالته الوطنية.`;
    } else {
      exitTaskText = `لخص المفهوم الأساسي الذي تعلمته اليوم في (${lessonTitle}) وقدم مثالاً تطبيقياً عليه.`;
    }
  }

  // Determine dynamic response placeholder text based on subject
  let responseAreaLabel = 'مساحة إجابة الطالب / تلخيص الفهم وحل التحدي الختامي:';
  if (/رياضيات/i.test(subject)) {
    responseAreaLabel = 'مساحة إجابة الطالب / كتابة الحل وتوضيح خطوات التفكير الرياضي:';
  } else if (/علوم/i.test(subject)) {
    responseAreaLabel = 'مساحة إجابة الطالب / تفسير الظاهرة وتدوين الملاحظة والاستنتاج العلمي:';
  } else if (/عربية/i.test(subject)) {
    responseAreaLabel = 'مساحة إجابة الطالب / كتابة الجملة المعبرة وتحديد الفكرة الرئيسة:';
  } else if (/اجتماعية/i.test(subject)) {
    responseAreaLabel = 'مساحة إجابة الطالب / تحديد المعلم الجغرافي أو التاريخي وأهميته:';
  } else if (/إسلامية/i.test(subject)) {
    responseAreaLabel = 'مساحة إجابة الطالب / تدوين السلوك أو القيمة المستفادة وتطبيقها العملي:';
  } else if (/تكنولوجيا/i.test(subject)) {
    responseAreaLabel = 'مساحة إجابة الطالب / كتابة الخطوات المنطقية أو قاعدة الأمان الرقمي:';
  }

  const attachedResource = plan.attachedResources?.[0];

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto text-right font-['Cairo',sans-serif]"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-linear-to-r from-emerald-800 to-teal-900 text-white p-4.5 flex items-center justify-between no-print">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-700/60 rounded-xl">
              <Flag className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-['Tajawal']">
                بطاقة الخروج السريعة للطلبة (Exit Ticket)
              </h3>
              <p className="text-xs text-emerald-100">
                مخصصة ومتوافقة تلقائياً مع درس: {toArabicDigits(lessonTitle)} ({subject})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Printer className="w-4 h-4" />
              طباعة البطاقات
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Cards (Two cards per sheet for economic printing) */}
        <div className="p-6 space-y-6 printable-area bg-slate-50 text-right">
          {[1, 2].map((cardNum) => (
            <div
              key={cardNum}
              className="bg-white border-2 border-dashed border-emerald-600 rounded-2xl p-5 shadow-xs relative overflow-hidden"
            >
              {/* Badge */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-3 mb-3.5">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-full">
                      {plan.header.ministry} - {plan.header.school}
                    </span>
                    {attachedResource && (
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        مرجع: {attachedResource.title}
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mt-1">
                    بطاقة الخروج (Exit Ticket) - مبحث {subject}
                  </h4>
                  <p className="text-xs text-slate-600">
                    الدرس: {toArabicDigits(lessonTitle)} | الصف: {plan.header.grade}
                  </p>
                </div>
                <div className="text-right text-xs text-slate-600 space-y-1">
                  <div>اسم الطالب/ـة: ____________________</div>
                  <div>الشعبة: ______ | التاريخ: {toArabicDigits(plan.header.date)}</div>
                </div>
              </div>

              {/* Task Section */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-900 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 leading-relaxed">
                  <span className="text-emerald-800 font-extrabold ml-1">🎯 المهمة والتحدي الختامي:</span>
                  <span>{toArabicDigits(exitTaskText)}</span>
                </div>

                {/* Response area for student */}
                <div className="border border-slate-300 rounded-xl p-3 min-h-[95px] bg-slate-50/60">
                  <div className="text-[11px] font-semibold text-slate-500 mb-2">
                    {responseAreaLabel}
                  </div>
                  <div className="border-b border-slate-200 my-3"></div>
                  <div className="border-b border-slate-200 my-3"></div>
                  <div className="border-b border-slate-200 my-3"></div>
                </div>

                {/* Self reflection emojis */}
                <div className="flex items-center justify-between pt-1 text-xs text-slate-700">
                  <span className="font-bold">مدى فهمي لدرس اليوم:</span>
                  <div className="flex items-center gap-3 text-xs">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" className="rounded-sm text-emerald-600" />
                      <span>🌟 ممتاز ومتقن</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" className="rounded-sm text-emerald-600" />
                      <span>👍 جيد وأحتاج تدريباً</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" className="rounded-sm text-emerald-600" />
                      <span>❓ لدي استفسار</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-between items-center no-print text-xs text-slate-600">
          <span>* تم تصميم بطاقتين في الصفحة لتوفير الطباعة وتوزيعها سريعاً في آخر ٤ دقائق من الحصة.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
