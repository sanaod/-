import React, { useState, useEffect, useRef } from 'react';
import { LessonPlan, EducationalResource } from '../types/lessonPlan';
import {
  InteractiveWorksheet,
  WorksheetType,
  MultipleChoiceQuestion,
  TrueFalseQuestion,
  MatchingPair,
  FillBlankQuestion,
  OpenEndedQuestion,
} from '../types/worksheet';
import { toArabicDigits } from '../utils/arabicNumerals';
import {
  FileCheck2,
  Sparkles,
  Printer,
  X,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Award,
  BookOpen,
  Share2,
  Download,
  Copy,
  Check,
  Edit3,
  Lightbulb,
  Target,
  BrainCircuit,
  MessageSquare,
  Users2,
  GraduationCap,
  Layers,
  ChevronRight,
  Eye,
  Sliders,
  Send,
  Zap,
} from 'lucide-react';

interface InteractiveWorksheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: LessonPlan;
  onSaveToResources?: (resource: EducationalResource) => void;
}

export const InteractiveWorksheetModal: React.FC<InteractiveWorksheetModalProps> = ({
  isOpen,
  onClose,
  plan,
  onSaveToResources,
}) => {
  const [activeTab, setActiveTab] = useState<'interactive' | 'student-print' | 'teacher-key' | 'customize'>('interactive');
  const [worksheetType, setWorksheetType] = useState<WorksheetType>('comprehensive');
  const [customInstructions, setCustomInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Worksheet State
  const [worksheet, setWorksheet] = useState<InteractiveWorksheet | null>(null);

  // Interactive Student Answers State
  const [userMcqAnswers, setUserMcqAnswers] = useState<Record<string, number>>({});
  const [userTfAnswers, setUserTfAnswers] = useState<Record<string, boolean>>({});
  const [userFillAnswers, setUserFillAnswers] = useState<Record<string, string>>({});
  const [userOpenAnswers, setUserOpenAnswers] = useState<Record<string, string>>({});
  const [userChallengeAnswer, setUserChallengeAnswer] = useState<string>('');
  const [showExplanations, setShowExplanations] = useState<Record<string, boolean>>({});
  const [showModelAnswers, setShowModelAnswers] = useState(false);
  const [studentNameInput, setStudentNameInput] = useState('');

  // Initial generation or load on open
  useEffect(() => {
    if (isOpen && !worksheet) {
      handleGenerateWorksheet();
    }
  }, [isOpen, plan.id]);

  const handleGenerateWorksheet = async (overrideType?: WorksheetType) => {
    setIsLoading(true);
    setIsSaved(false);
    try {
      const targetType = overrideType || worksheetType;
      const res = await fetch('/api/generate-worksheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: plan.header.subject || 'الرياضيات',
          grade: plan.header.grade || 'الثالث الأساسي',
          lessonTitle: plan.header.lessonTitle || 'درس تطبيقي',
          type: targetType,
          teacherName: plan.header.teacherName || 'الأستاذ عبد الرحمن دويكات',
          schoolName: plan.header.school || 'مدرسة التميز النموذجية',
          customNotes: customInstructions,
          planContext: {
            competencies: plan.section1?.integrativeCompetencies,
            grasps: plan.section3Assessment?.graspsTask,
            phases: plan.section2Timeline?.map((p) => p.phaseName),
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.worksheet) {
        setWorksheet(data.worksheet);
        // Reset interactive answers
        setUserMcqAnswers({});
        setUserTfAnswers({});
        setUserFillAnswers({});
        setUserOpenAnswers({});
        setUserChallengeAnswer('');
        setShowExplanations({});
        setShowModelAnswers(false);
      }
    } catch (err) {
      console.error('Failed to generate worksheet:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetAnswers = () => {
    setUserMcqAnswers({});
    setUserTfAnswers({});
    setUserFillAnswers({});
    setUserOpenAnswers({});
    setUserChallengeAnswer('');
    setShowExplanations({});
  };

  // Score Calculation
  const calculateScore = () => {
    if (!worksheet) return { earned: 0, total: 0, percentage: 0 };
    let earned = 0;
    let total = 0;

    // MCQs
    worksheet.mcqQuestions?.forEach((q) => {
      total += q.points || 2;
      if (userMcqAnswers[q.id] === q.correctAnswerIndex) {
        earned += q.points || 2;
      }
    });

    // True/False
    worksheet.trueFalseQuestions?.forEach((q) => {
      total += q.points || 2;
      if (userTfAnswers[q.id] === q.isTrue) {
        earned += q.points || 2;
      }
    });

    // Fill Blanks
    worksheet.fillBlankQuestions?.forEach((q) => {
      total += q.points || 2;
      const userAns = (userFillAnswers[q.id] || '').trim().toLowerCase();
      const correctAns = (q.blankAnswer || '').trim().toLowerCase();
      if (userAns && (userAns === correctAns || correctAns.includes(userAns))) {
        earned += q.points || 2;
      }
    });

    // Open-ended & Challenge (awarded full points if answered in interactive mode for practice)
    worksheet.openEndedQuestions?.forEach((q) => {
      total += q.points || 4;
      if (userOpenAnswers[q.id] && userOpenAnswers[q.id].trim().length > 10) {
        earned += q.points || 4;
      }
    });

    if (worksheet.challengeQuestion) {
      total += worksheet.challengeQuestion.points || 4;
      if (userChallengeAnswer && userChallengeAnswer.trim().length > 10) {
        earned += worksheet.challengeQuestion.points || 4;
      }
    }

    const percentage = total > 0 ? Math.round((earned / total) * 100) : 0;
    return { earned, total, percentage };
  };

  const scoreStats = calculateScore();

  const handleSaveToPlan = () => {
    if (!worksheet) return;
    const resource: EducationalResource = {
      id: `res-ws-${Date.now()}`,
      type: 'worksheet',
      title: worksheet.title || `ورقة عمل تفاعلية - ${plan.header.lessonTitle}`,
      content: `[ورقة عمل تفاعلية ذكية مولدة بالذكاء الاصطناعي]
المبحث: ${worksheet.subject} | الصف: ${worksheet.grade}
الدرس: ${worksheet.lessonTitle}
عدد الأسئلة: ${
        (worksheet.mcqQuestions?.length || 0) +
        (worksheet.trueFalseQuestions?.length || 0) +
        (worksheet.fillBlankQuestions?.length || 0) +
        (worksheet.openEndedQuestions?.length || 0)
      }
الدرجة الكلية: ${worksheet.totalPoints || 16}
الأهداف: ${worksheet.learningObjectives?.join(' ، ')}`,
      sourceInfo: 'منظومة عبقور للتخطيط التربوي - الأستاذ عبد الرحمن دويكات',
      createdAt: worksheet.date || '٢٠٢٦/١٠/١٥م',
      tags: [worksheet.subject, worksheet.grade, 'ورقة عمل تفاعلية', 'AI'],
    };

    if (onSaveToResources) {
      onSaveToResources(resource);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  const handleCopyText = () => {
    if (!worksheet) return;
    const textContent = `📄 ${worksheet.title}
📚 المبحث: ${worksheet.subject} | الصف: ${worksheet.grade}
👨‍🏫 إعداد: ${worksheet.teacherName} | مدرسة: ${worksheet.schoolName}
🎯 النتاجات التعليمية:
${worksheet.learningObjectives?.map((obj, i) => `${toArabicDigits(i + 1)}. ${obj}`).join('\n')}

--- أولاً: اختر الإجابة الصحيحة ---
${worksheet.mcqQuestions
  ?.map(
    (q, i) =>
      `${toArabicDigits(i + 1)}. ${q.question} (${toArabicDigits(q.points)} درجات)
${q.options.map((opt, idx) => `   [ ${String.fromCharCode(65 + idx)} ] ${opt}`).join('\n')}`
  )
  .join('\n\n')}

--- ثانياً: ضع إشارة (✓) أو (✗) مع التعليل ---
${worksheet.trueFalseQuestions
  ?.map((q, i) => `${toArabicDigits(i + 1)}. (   ) ${q.statement}`)
  .join('\n')}

--- ثالثاً: سؤال التفكير الناقد والتطبيق الواقعي ---
${worksheet.openEndedQuestions?.map((q, i) => `${toArabicDigits(i + 1)}. ${q.question}`).join('\n')}

⭐ ${worksheet.challengeQuestion?.title || 'سؤال التحدي'}:
${worksheet.challengeQuestion?.problemStatement || ''}

منظومة عبقور للتخطيط التربوي - إعداد وتصميم: الأستاذ عبد الرحمن دويكات`;

    navigator.clipboard.writeText(textContent);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleExportWord = () => {
    if (!worksheet) return;
    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"><title>${worksheet.title}</title>
      <style>
        body { direction: rtl; font-family: 'Traditional Arabic', Arial, sans-serif; font-size: 14pt; line-height: 1.6; padding: 20px; color: #111; }
        h1 { text-align: center; color: #064e3b; font-size: 18pt; }
        h3 { color: #1e3a8a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 15px; }
        p { margin: 6px 0; }
        ul { margin: 5px 0; padding-right: 20px; }
      </style>
      </head>
      <body>
        <h1>${worksheet.title}</h1>
        <p style="text-align:center; font-weight:bold; color:#0f766e;">المبحث: ${worksheet.subject} | الصف: ${worksheet.grade} | المعلم: ${worksheet.teacherName} | المدرسة: ${worksheet.schoolName}</p>
        <hr/>
        <h3>الأهداف والنتاجات التعليمية:</h3>
        <ul>${worksheet.learningObjectives?.map(o => `<li>${o}</li>`).join('') || ''}</ul>
        
        <h3>السؤال الأول: اختر الإجابة الصحيحة</h3>
        ${worksheet.mcqQuestions?.map((q, i) => `<p><b>${i+1}. ${q.question}</b> (${q.points} درجات)<br/>` + q.options.map((opt, idx) => `[${['أ','ب','ج','د'][idx]}] ${opt}`).join(' &nbsp; &nbsp; ') + `</p>`).join('') || ''}
        
        <h3>السؤال الثاني: ضع إشارة (✓) أو (✗)</h3>
        ${worksheet.trueFalseQuestions?.map((q, i) => `<p><b>${i+1}.</b> ${q.statement} &nbsp; <b>( &nbsp; )</b></p>`).join('') || ''}
        
        <h3>السؤال الثالث: التفكير الناقد والتطبيق الواقعي</h3>
        ${worksheet.openEndedQuestions?.map((q, i) => `<p><b>${i+1}.</b> ${q.question}</p><br/>`).join('') || ''}
        
        ${worksheet.challengeQuestion ? `<h3>سؤال التحدي والإبداع</h3><p><b>${worksheet.challengeQuestion.title}</b>: ${worksheet.challengeQuestion.problemStatement}</p>` : ''}
        
        <br/><hr/>
        <p style="text-align:center; font-size:10pt; color:#64748b;">منظومة عبقور للتخطيط التربوي - الأستاذ عبد الرحمن دويكات</p>
      </body></html>
    `;
    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${worksheet.title || 'ورقة_عمل_تفاعلية'}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleExportText = () => {
    if (!worksheet) return;
    const textContent = `========================================\n` +
      `ورقة عمل تفاعلية: ${worksheet.title}\n` +
      `المبحث: ${worksheet.subject} | الصف: ${worksheet.grade}\n` +
      `المعلم: ${worksheet.teacherName} | المدرسة: ${worksheet.schoolName}\n` +
      `========================================\n\n` +
      `[النتاجات التعليمية]:\n` +
      (worksheet.learningObjectives?.map((o, i) => `${i+1}. ${o}`).join('\n') || '') +
      `\n\n--- السؤال الأول: الاختيار من متعدد ---\n` +
      (worksheet.mcqQuestions?.map((q, i) => `${i+1}. ${q.question}\n` + q.options.map((opt, idx) => `   [${['أ','ب','ج','د'][idx]}] ${opt}`).join('\n')).join('\n\n') || '') +
      `\n\n--- السؤال الثاني: الصواب والخطأ ---\n` +
      (worksheet.trueFalseQuestions?.map((q, i) => `${i+1}. (   ) ${q.statement}`).join('\n') || '') +
      `\n\n--- السؤال الثالث: الأسئلة المقالية ---\n` +
      (worksheet.openEndedQuestions?.map((q, i) => `${i+1}. ${q.question}`).join('\n\n') || '') +
      `\n\n----------------------------------------\n` +
      `منظومة عبقور للتخطيط التربوي - الأستاذ عبد الرحمن دويكات`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${worksheet.title || 'ورقة_عمل'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleExportJson = () => {
    if (!worksheet) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(worksheet, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `${worksheet.title || 'ورقة_عمل'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setShowExportMenu(false);
  };

  const handleExportHtml = () => {
    if (!worksheet) return;
    const htmlContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>${worksheet.title}</title>
<style>
  body { font-family: 'Tajawal', Arial, sans-serif; background: #f8fafc; color: #1e293b; padding: 30px; margin: 0; direction: rtl; text-align: right; }
  .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
  h1 { color: #064e3b; text-align: center; font-size: 24px; margin-bottom: 5px; }
  .meta { text-align: center; color: #0f766e; font-size: 14px; margin-bottom: 25px; font-weight: bold; }
  h3 { color: #1e3a8a; border-bottom: 2px solid #3b82f6; padding-bottom: 6px; margin-top: 25px; font-size: 16px; }
  .question { background: #f1f5f9; padding: 15px; border-radius: 12px; margin-bottom: 12px; }
  .options { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px; }
  .option { background: white; border: 1px solid #cbd5e1; padding: 8px 12px; border-radius: 8px; font-size: 13px; }
  .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; }
</style>
</head>
<body>
  <div class="container">
    <h1>${worksheet.title}</h1>
    <div class="meta">المبحث: ${worksheet.subject} | الصف: ${worksheet.grade} | المعلم: ${worksheet.teacherName} | المدرسة: ${worksheet.schoolName}</div>
    
    <h3>الأهداف والنتاجات التعليمية:</h3>
    <ul>${worksheet.learningObjectives?.map(o => `<li>${o}</li>`).join('') || ''}</ul>

    <h3>السؤال الأول: اختر الإجابة الصحيحة بوضع دائرة حول رمزها</h3>
    ${worksheet.mcqQuestions?.map((q, i) => `
      <div class="question">
        <b>${i+1}. ${q.question}</b> (${q.points} درجات)
        <div class="options">
          ${q.options.map((opt, idx) => `<div class="option"><b>[${['أ','ب','ج','د'][idx]}]</b> ${opt}</div>`).join('')}
        </div>
      </div>
    `).join('') || ''}

    <h3>السؤال الثاني: ضع إشارة (✓) أمام العبارة الصحيحة وإشارة (✗) أمام العبارة غير الصحيحة</h3>
    ${worksheet.trueFalseQuestions?.map((q, i) => `
      <div class="question" style="display:flex; justify-content:space-between; align-items:center;">
        <span><b>${i+1}.</b> ${q.statement}</span>
        <span style="font-family:monospace; font-weight:bold; color:#94a3b8;">( &nbsp; &nbsp; )</span>
      </div>
    `).join('') || ''}

    <h3>السؤال الثالث: التفكير الناقد والتطبيق الواقعي</h3>
    ${worksheet.openEndedQuestions?.map((q, i) => `
      <div class="question">
        <b>${i+1}.</b> ${q.question}
        <div style="height: 60px; border-bottom: 1px dashed #cbd5e1; margin-top: 15px;"></div>
      </div>
    `).join('') || ''}

    <div class="footer">
      منظومة عبقور للتخطيط التربوي - الأستاذ عبد الرحمن دويكات | ورقة عمل تفاعلية رسمية
    </div>
  </div>
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${worksheet.title || 'ورقة_عمل'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div
        dir="rtl"
        className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]"
      >
        {/* Modal Top Header Bar */}
        <div className="bg-linear-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-emerald-800/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-linear-to-tr from-emerald-500 to-teal-400 text-white rounded-2xl shadow-md ring-2 ring-emerald-400/30">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black font-['Tajawal'] text-white">
                  أوراق العمل التفاعلية بالذكاء الاصطناعي
                </h2>
                <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-full text-[10px] font-bold">
                  متوافقة مع المناهج الوزارية ✨
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                مبحث: <strong className="text-white font-bold">{plan.header.subject}</strong> | الصف: <strong className="text-white font-bold">{plan.header.grade}</strong> | درس: <strong className="text-amber-300 font-bold">{plan.header.lessonTitle || plan.title}</strong>
              </p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleGenerateWorksheet()}
              disabled={isLoading}
              className="px-3 py-1.5 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              title="توليد وتحديث ورقة العمل بالذكاء الاصطناعي"
            >
              <Sparkles className={`w-3.5 h-3.5 text-emerald-200 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'جاري التوليد...' : 'توليد ذكي جديد'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Mode Navigation Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('interactive')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'interactive'
                  ? 'bg-emerald-700 text-white shadow-xs ring-1 ring-emerald-800'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>الوضع التفاعلي للحل</span>
            </button>

            <button
              onClick={() => setActiveTab('student-print')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'student-print'
                  ? 'bg-emerald-700 text-white shadow-xs ring-1 ring-emerald-800'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>نسخة الطالب للطباعة (A4)</span>
            </button>

            <button
              onClick={() => setActiveTab('teacher-key')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'teacher-key'
                  ? 'bg-emerald-700 text-white shadow-xs ring-1 ring-emerald-800'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-purple-600" />
              <span>نموذج إجابة المعلم والسلالم</span>
            </button>

            <button
              onClick={() => setActiveTab('customize')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'customize'
                  ? 'bg-emerald-700 text-white shadow-xs ring-1 ring-emerald-800'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              <span>تخصيص النمط والصعوبة</span>
            </button>
          </div>

          {/* Fast Export Actions with All Formats Dropdown */}
          <div className="relative flex items-center gap-1.5">
            {/* Export All Formats Button & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-3 py-1.5 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                title="تصدير ورقة العمل على جميع الصيغ (Word, PDF, TXT, JSON)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تصدير على جميع الصيغ 📥</span>
              </button>

              {showExportMenu && (
                <div className="absolute left-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 space-y-1 text-xs font-['Tajawal'] text-slate-800">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 border-b border-slate-100">
                    اختر صيغة التصدير المطلوبة:
                  </div>

                  <button
                    onClick={handleExportWord}
                    className="w-full text-right px-3 py-2 hover:bg-emerald-50 rounded-xl flex items-center gap-2 font-bold text-slate-700 transition-colors cursor-pointer"
                  >
                    <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center text-xs">W</span>
                    <span>تصدير مستند Word (.doc)</span>
                  </button>

                  <button
                    onClick={() => {
                      handlePrint();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-right px-3 py-2 hover:bg-emerald-50 rounded-xl flex items-center gap-2 font-bold text-slate-700 transition-colors cursor-pointer"
                  >
                    <span className="w-6 h-6 bg-slate-100 text-slate-700 rounded-lg flex items-center justify-center text-xs">🖨️</span>
                    <span>طباعة مباشرة / PDF (A4)</span>
                  </button>

                  <button
                    onClick={handleExportText}
                    className="w-full text-right px-3 py-2 hover:bg-emerald-50 rounded-xl flex items-center gap-2 font-bold text-slate-700 transition-colors cursor-pointer"
                  >
                    <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center text-xs">TXT</span>
                    <span>تصدير ملف نصي (.txt)</span>
                  </button>

                  <button
                    onClick={handleExportJson}
                    className="w-full text-right px-3 py-2 hover:bg-emerald-50 rounded-xl flex items-center gap-2 font-bold text-slate-700 transition-colors cursor-pointer"
                  >
                    <span className="w-6 h-6 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center text-xs">JSON</span>
                    <span>تصدير بيانات هيكلية (.json)</span>
                  </button>

                  <button
                    onClick={handleExportHtml}
                    className="w-full text-right px-3 py-2 hover:bg-emerald-50 rounded-xl flex items-center gap-2 font-bold text-slate-700 transition-colors cursor-pointer"
                  >
                    <span className="w-6 h-6 bg-rose-100 text-rose-700 rounded-lg flex items-center justify-center text-xs">HTML</span>
                    <span>تصدير صفحة ويب (.html)</span>
                  </button>

                  <button
                    onClick={() => {
                      handleCopyText();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-right px-3 py-2 hover:bg-emerald-50 rounded-xl flex items-center gap-2 font-bold text-slate-700 transition-colors cursor-pointer"
                  >
                    <span className="w-6 h-6 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center text-xs">📋</span>
                    <span>نسخ النص بالكامل للحافظة</span>
                  </button>

                  <button
                    onClick={() => {
                      handleSaveToPlan();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-right px-3 py-2 hover:bg-emerald-50 rounded-xl flex items-center gap-2 font-bold text-slate-700 transition-colors cursor-pointer border-t border-slate-100 mt-1 pt-2"
                  >
                    <span className="w-6 h-6 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center text-xs">💾</span>
                    <span>{isSaved ? 'تم الحفظ في المصادر ✓' : 'حفظ بمصادر الخطة'}</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleSaveToPlan}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                isSaved
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs'
              }`}
              title="إرفاق وحفظ ورقة العمل في مصادر الخطة"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isSaved ? 'تم الحفظ ✓' : 'حفظ'}</span>
            </button>

            <button
              onClick={handleCopyText}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title="نسخ نص ورقة العمل كاملاً"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedText ? 'تم!' : 'نسخ'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="طباعة ورقة العمل الرسمية بصيغة A4"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span>طباعة</span>
            </button>
          </div>
        </div>

        {/* Modal Main Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
              <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-bold text-slate-800 font-['Tajawal']">
                جاري توليد وتحليل ورقة العمل التفاعلية بالذكاء الاصطناعي...
              </p>
              <p className="text-xs text-slate-500">
                تطبيق معايير بلوم، التمايز الصفي، والربط بالبيئة والواقع المعاش في فلسطين.
              </p>
            </div>
          ) : !worksheet ? (
            <div className="py-16 text-center text-slate-500">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">لم يتم توليد ورقة عمل بعد</p>
              <button
                onClick={() => handleGenerateWorksheet()}
                className="mt-3 px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800"
              >
                توليد ورقة عمل الآن
              </button>
            </div>
          ) : (
            <>
              {/* TAB 1: INTERACTIVE LIVE SOLVER MODE */}
              {activeTab === 'interactive' && (
                <div className="space-y-6">
                  {/* Live Interactive Score & Progress Bar */}
                  <div className="bg-linear-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-emerald-600 text-white rounded-lg">
                          <GraduationCap className="w-4 h-4" />
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 font-['Tajawal']">
                          لوحة التقييم التفاعلي الفوري للتعلم
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600">
                        قم بحل الأسئلة أدناه والتحقق من صحة إجاباتك ومعرفة الشرح النموذجي لكل سؤال.
                      </p>
                    </div>

                    <div className="flex items-center gap-4 bg-white px-4 py-2.5 rounded-2xl border border-emerald-200 shadow-2xs">
                      <div className="text-center">
                        <span className="block text-[10px] text-slate-500 font-bold">الدرجة المحققة</span>
                        <span className="text-lg font-black text-emerald-800 tabular-nums">
                          {toArabicDigits(scoreStats.earned)} / {toArabicDigits(scoreStats.total)}
                        </span>
                      </div>
                      <div className="h-8 w-px bg-slate-200" />
                      <div className="text-center">
                        <span className="block text-[10px] text-slate-500 font-bold">نسبة الإتقان</span>
                        <span className={`text-lg font-black tabular-nums ${scoreStats.percentage >= 80 ? 'text-emerald-700' : scoreStats.percentage >= 50 ? 'text-amber-600' : 'text-slate-700'}`}>
                          ٪{toArabicDigits(scoreStats.percentage)}
                        </span>
                      </div>
                      <button
                        onClick={handleResetAnswers}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="إعادة المحاولة وتصفير الإجابات"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Worksheet Header Box */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                      <div>
                        <h4 className="text-base font-bold text-slate-900 font-['Tajawal']">{worksheet.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          إعداد المعلم: <strong className="text-slate-800 font-bold">{worksheet.teacherName}</strong> | المدرسة: <strong className="text-slate-800 font-bold">{worksheet.schoolName}</strong>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-purple-100 text-purple-900 rounded-lg text-xs font-bold border border-purple-200">
                          المدة المقترحة: {toArabicDigits(worksheet.durationMinutes || 20)} دقيقة
                        </span>
                      </div>
                    </div>

                    {/* Objectives */}
                    {worksheet.learningObjectives && worksheet.learningObjectives.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                          <Target className="w-3.5 h-3.5 text-emerald-700" />
                          <span>نتاجات التعلم المستهدفة في هذه الورقة:</span>
                        </span>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-slate-700 list-disc list-inside pr-1">
                          {worksheet.learningObjectives.map((obj, i) => (
                            <li key={i} className="leading-relaxed">
                              {obj}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Section 1: Multiple Choice Questions (MCQ) */}
                  {worksheet.mcqQuestions && worksheet.mcqQuestions.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 bg-emerald-100 text-emerald-800 font-black rounded-lg flex items-center justify-center text-xs">
                            ١
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 font-['Tajawal']">
                            السؤال الأول: اختر رمز الإجابة الصحيحة فيما يأتي
                          </h4>
                        </div>
                        <span className="text-xs font-bold text-slate-500">
                          ({toArabicDigits(worksheet.mcqQuestions.reduce((acc, q) => acc + (q.points || 2), 0))} علامات)
                        </span>
                      </div>

                      <div className="space-y-4">
                        {worksheet.mcqQuestions.map((q, qIndex) => {
                          const userSelected = userMcqAnswers[q.id];
                          const hasAnswered = userSelected !== undefined;
                          const isCorrect = userSelected === q.correctAnswerIndex;
                          const isExpShown = showExplanations[q.id];

                          return (
                            <div
                              key={q.id}
                              className={`p-4 rounded-xl border transition-all ${
                                hasAnswered
                                  ? isCorrect
                                    ? 'bg-emerald-50/50 border-emerald-300'
                                    : 'bg-rose-50/50 border-rose-300'
                                  : 'bg-slate-50/70 border-slate-200'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">
                                  <span className="font-extrabold text-emerald-800 ml-1">
                                    ({toArabicDigits(qIndex + 1)})
                                  </span>
                                  {q.question}
                                </p>
                                <span className="text-[10px] bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-600 font-bold shrink-0">
                                  {toArabicDigits(q.points || 2)} علامات
                                </span>
                              </div>

                              {/* Options Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {q.options.map((option, optIndex) => {
                                  const isThisSelected = userSelected === optIndex;
                                  const isThisCorrect = optIndex === q.correctAnswerIndex;

                                  let optionStyle = 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200';
                                  if (hasAnswered) {
                                    if (isThisCorrect) {
                                      optionStyle = 'bg-emerald-600 text-white font-bold border-emerald-700 shadow-xs';
                                    } else if (isThisSelected && !isCorrect) {
                                      optionStyle = 'bg-rose-600 text-white font-bold border-rose-700 shadow-xs';
                                    } else {
                                      optionStyle = 'bg-white/60 text-slate-400 border-slate-200 opacity-70';
                                    }
                                  }

                                  return (
                                    <button
                                      key={optIndex}
                                      onClick={() =>
                                        setUserMcqAnswers((prev) => ({
                                          ...prev,
                                          [q.id]: optIndex,
                                        }))
                                      }
                                      className={`p-3 text-right rounded-xl text-xs flex items-center gap-2.5 border transition-all cursor-pointer ${optionStyle}`}
                                    >
                                      <span
                                        className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                                          hasAnswered && isThisCorrect
                                            ? 'bg-white text-emerald-800'
                                            : hasAnswered && isThisSelected
                                            ? 'bg-white text-rose-800'
                                            : 'bg-slate-100 text-slate-700'
                                        }`}
                                      >
                                        {['أ', 'ب', 'ج', 'د'][optIndex]}
                                      </span>
                                      <span className="flex-1">{option}</span>
                                      {hasAnswered && isThisCorrect && <Check className="w-4 h-4 shrink-0 text-white" />}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Feedback & Hint Toggle */}
                              {hasAnswered && (
                                <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                                  <div className="flex items-center gap-1.5 font-bold">
                                    {isCorrect ? (
                                      <span className="text-emerald-700 flex items-center gap-1">
                                        <CheckCircle2 className="w-4 h-4" /> إجابة صحيحة وممتازة! (+{toArabicDigits(q.points || 2)})
                                      </span>
                                    ) : (
                                      <span className="text-rose-700 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" /> إجابة غير صحيحة، راجع التفسير العلمي أدناه.
                                      </span>
                                    )}
                                  </div>

                                  <button
                                    onClick={() =>
                                      setShowExplanations((prev) => ({
                                        ...prev,
                                        [q.id]: !prev[q.id],
                                      }))
                                    }
                                    className="text-xs text-teal-800 hover:text-teal-900 font-bold flex items-center gap-1 underline underline-offset-2"
                                  >
                                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                                    <span>{isExpShown ? 'إخفاء التفسير' : 'عرض التفسير والتلميح'}</span>
                                  </button>
                                </div>
                              )}

                              {isExpShown && (
                                <div className="mt-2.5 p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs space-y-1 text-amber-950 animate-in fade-in">
                                  <p className="font-bold flex items-center gap-1">
                                    <span>💡 التفسير التربوي والعلمي:</span>
                                  </p>
                                  <p className="text-amber-900 leading-relaxed">{q.explanation}</p>
                                  {q.hint && (
                                    <p className="text-[11px] text-amber-800 italic mt-1">
                                      تلميح استذكار: {q.hint}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Section 2: True or False with Justification */}
                  {worksheet.trueFalseQuestions && worksheet.trueFalseQuestions.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 bg-teal-100 text-teal-800 font-black rounded-lg flex items-center justify-center text-xs">
                            ٢
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 font-['Tajawal']">
                            السؤال الثاني: ضع إشارة (✓) أمام العبارة الصحيحة وإشارة (✗) أمام العبارة غير الصحيحة
                          </h4>
                        </div>
                        <span className="text-xs font-bold text-slate-500">
                          ({toArabicDigits(worksheet.trueFalseQuestions.reduce((acc, q) => acc + (q.points || 2), 0))} علامات)
                        </span>
                      </div>

                      <div className="space-y-3">
                        {worksheet.trueFalseQuestions.map((q, qIndex) => {
                          const userAns = userTfAnswers[q.id];
                          const hasAnswered = userAns !== undefined;
                          const isCorrect = userAns === q.isTrue;

                          return (
                            <div
                              key={q.id}
                              className={`p-3.5 rounded-xl border transition-all ${
                                hasAnswered
                                  ? isCorrect
                                    ? 'bg-emerald-50/50 border-emerald-300'
                                    : 'bg-rose-50/50 border-rose-300'
                                  : 'bg-slate-50/70 border-slate-200'
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <p className="text-xs sm:text-sm font-bold text-slate-800 flex-1 leading-relaxed">
                                  <span className="font-extrabold text-teal-800 ml-1">
                                    ({toArabicDigits(qIndex + 1)})
                                  </span>
                                  {q.statement}
                                </p>

                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    onClick={() =>
                                      setUserTfAnswers((prev) => ({
                                        ...prev,
                                        [q.id]: true,
                                      }))
                                    }
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                                      userAns === true
                                        ? q.isTrue
                                          ? 'bg-emerald-600 text-white border-emerald-700'
                                          : 'bg-rose-600 text-white border-rose-700'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    <span>✓ صواب</span>
                                  </button>

                                  <button
                                    onClick={() =>
                                      setUserTfAnswers((prev) => ({
                                        ...prev,
                                        [q.id]: false,
                                      }))
                                    }
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                                      userAns === false
                                        ? !q.isTrue
                                          ? 'bg-emerald-600 text-white border-emerald-700'
                                          : 'bg-rose-600 text-white border-rose-700'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    <span>✗ خطأ</span>
                                  </button>
                                </div>
                              </div>

                              {hasAnswered && (
                                <div className="mt-2.5 pt-2 border-t border-slate-200/80 text-xs text-slate-700">
                                  <span className="font-bold text-teal-900">التعليل العلمي والتبرير: </span>
                                  <span>{q.justification}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Section 3: Fill in the blanks with word bank */}
                  {worksheet.fillBlankQuestions && worksheet.fillBlankQuestions.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 bg-indigo-100 text-indigo-800 font-black rounded-lg flex items-center justify-center text-xs">
                            ٣
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 font-['Tajawal']">
                            السؤال الثالث: أكمل الفراغات في الجمل الآتية بالكلمات والمفاهيم المناسبة
                          </h4>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {worksheet.fillBlankQuestions.map((q, qIndex) => {
                          const userAns = userFillAnswers[q.id] || '';
                          const isCorrect = userAns.trim() === q.blankAnswer.trim();

                          return (
                            <div key={q.id} className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2">
                              <div className="text-xs sm:text-sm font-bold text-slate-800 leading-loose flex flex-wrap items-center gap-2">
                                <span>({toArabicDigits(qIndex + 1)}) {q.textBefore}</span>
                                <input
                                  type="text"
                                  value={userAns}
                                  onChange={(e) =>
                                    setUserFillAnswers((prev) => ({
                                      ...prev,
                                      [q.id]: e.target.value,
                                    }))
                                  }
                                  placeholder="اكتب الإجابة..."
                                  className={`px-2.5 py-1 rounded-lg border text-xs font-bold w-36 text-center focus:outline-hidden ${
                                    userAns
                                      ? isCorrect
                                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                                        : 'bg-rose-50 border-rose-400 text-rose-900'
                                      : 'bg-white border-slate-300'
                                  }`}
                                />
                                <span>{q.textAfter}</span>
                              </div>

                              {q.options && q.options.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 pt-1">
                                  <span className="font-bold text-slate-700">بنك الكلمات للاسترشاد:</span>
                                  {q.options.map((opt, oIdx) => (
                                    <button
                                      key={oIdx}
                                      onClick={() =>
                                        setUserFillAnswers((prev) => ({
                                          ...prev,
                                          [q.id]: opt,
                                        }))
                                      }
                                      className="px-2 py-0.5 bg-white hover:bg-indigo-50 text-indigo-900 rounded-md border border-indigo-200 font-bold transition-colors cursor-pointer"
                                    >
                                      {opt}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Section 4: Critical Thinking & Real-life Palestinian Application */}
                  {worksheet.openEndedQuestions && worksheet.openEndedQuestions.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 bg-purple-100 text-purple-800 font-black rounded-lg flex items-center justify-center text-xs">
                            ٤
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 font-['Tajawal']">
                            السؤال الرابع: التفكير الناقد والتطبيق الواقعي في بيئتنا الفلسطينية
                          </h4>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {worksheet.openEndedQuestions.map((q, qIndex) => (
                          <div key={q.id} className="p-4 bg-purple-50/40 border border-purple-200 rounded-2xl space-y-3">
                            <p className="text-xs sm:text-sm font-bold text-purple-950 leading-relaxed">
                              <span className="font-extrabold text-purple-700 ml-1">
                                ({toArabicDigits(qIndex + 1)})
                              </span>
                              {q.question}
                            </p>

                            {q.guidingPoints && q.guidingPoints.length > 0 && (
                              <div className="text-xs text-purple-900 bg-purple-100/50 p-2.5 rounded-xl space-y-1">
                                <span className="font-bold flex items-center gap-1">
                                  <BrainCircuit className="w-3.5 h-3.5 text-purple-700" />
                                  <span>إرشادات التفكير والحل:</span>
                                </span>
                                <ul className="list-disc list-inside text-[11px] pr-1 space-y-0.5">
                                  {q.guidingPoints.map((gp, gIdx) => (
                                    <li key={gIdx}>{gp}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <textarea
                              rows={3}
                              value={userOpenAnswers[q.id] || ''}
                              onChange={(e) =>
                                setUserOpenAnswers((prev) => ({
                                  ...prev,
                                  [q.id]: e.target.value,
                                }))
                              }
                              placeholder="اكتب إجابتك وتحليلك العلمي المنظم هنا..."
                              className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-purple-500"
                            />

                            <div className="flex justify-end">
                              <button
                                onClick={() => setShowModelAnswers(!showModelAnswers)}
                                className="text-xs font-bold text-purple-800 hover:text-purple-900 flex items-center gap-1"
                              >
                                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                                <span>{showModelAnswers ? 'إخفاء الإجابة النموذجية' : 'معاينة الإجابة النموذجية'}</span>
                              </button>
                            </div>

                            {showModelAnswers && (
                              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 space-y-1">
                                <span className="font-bold text-emerald-900">نموذج الإجابة المعتمد:</span>
                                <p className="leading-relaxed">{q.modelAnswer}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section 5: Challenge for High Achievers */}
                  {worksheet.challengeQuestion && (
                    <div className="bg-linear-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-300 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-600" />
                        <h4 className="text-sm font-bold text-amber-950 font-['Tajawal']">
                          {worksheet.challengeQuestion.title || 'سؤال التحدي والإبداع للمتميزين 🌟'}
                        </h4>
                      </div>

                      <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">
                        {worksheet.challengeQuestion.problemStatement}
                      </p>

                      <textarea
                        rows={2}
                        value={userChallengeAnswer}
                        onChange={(e) => setUserChallengeAnswer(e.target.value)}
                        placeholder="سجل خطوات تفكيرك وحلك الإبداعي للتحدي..."
                        className="w-full text-xs p-3 rounded-xl border border-amber-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                      />

                      {showModelAnswers && (
                        <div className="p-3 bg-white/80 border border-amber-300 rounded-xl text-xs text-amber-950">
                          <span className="font-bold text-amber-900">حل التحدي ومفتاح التفكير: </span>
                          <span>{worksheet.challengeQuestion.solution}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: PRINTABLE OFFICIAL STUDENT WORKSHEET A4 */}
              {activeTab === 'student-print' && (
                <div className="space-y-6">
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 flex items-center justify-between gap-2">
                    <span>
                      📌 هذه النسخة مصممة للطباعة المباشرة على ورق A4 وتوزيعها على الطلبة في الغرفة الصفية.
                    </span>
                    <button
                      onClick={handlePrint}
                      className="px-3 py-1 bg-slate-800 text-white rounded-lg font-bold flex items-center gap-1 shrink-0"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>طباعة A4</span>
                    </button>
                  </div>

                  {/* A4 Sheet Container */}
                  <div className="bg-white border border-slate-300 rounded-2xl p-6 sm:p-8 space-y-6 shadow-md text-slate-900 font-['Tajawal'] print:border-none print:shadow-none print:p-0">
                    {/* Header */}
                    <div className="border-b-2 border-slate-900 pb-4 text-center space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                        <div className="text-right">
                          <p>دولة فلسطين</p>
                          <p>وزارة التربية والتعليم</p>
                          <p>{worksheet.schoolName || 'مدرسة التميز النموذجية'}</p>
                        </div>
                        <div className="text-center">
                          <h3 className="text-lg font-black text-slate-900">ورقة عمل تفاعلية وتقويم صفي</h3>
                          <p className="text-xs text-emerald-800 font-bold">
                            المبحث: {worksheet.subject} | الصف: {worksheet.grade}
                          </p>
                          <p className="text-xs text-slate-600">درس: {worksheet.lessonTitle}</p>
                        </div>
                        <div className="text-left">
                          <p>التاريخ: {worksheet.date || '٢٠٢٦/١٠/١٥م'}</p>
                          <p>الزمن: {toArabicDigits(worksheet.durationMinutes || 20)} دقيقة</p>
                          <p>الدرجة: ______ / {toArabicDigits(worksheet.totalPoints || 16)}</p>
                        </div>
                      </div>

                      {/* Student Info Box */}
                      <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between text-xs font-bold text-slate-800">
                        <div>اسم الطالب/ـة: ________________________________</div>
                        <div>الشعبة: (     )</div>
                        <div>معلم المبحث: {worksheet.teacherName}</div>
                      </div>
                    </div>

                    {/* Questions Body */}
                    <div className="space-y-6 text-xs sm:text-sm">
                      {/* Q1 */}
                      {worksheet.mcqQuestions && (
                        <div className="space-y-3">
                          <h4 className="font-black text-slate-900 border-r-4 border-slate-900 pr-2">
                            السؤال الأول: اختر الإجابة الصحيحة بوضع دائرة حول رمزها:
                          </h4>
                          <div className="space-y-3 pr-2">
                            {worksheet.mcqQuestions.map((q, i) => (
                              <div key={q.id} className="space-y-1">
                                <p className="font-bold text-slate-800">
                                  {toArabicDigits(i + 1)}. {q.question}
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pr-2 text-xs">
                                  {q.options.map((opt, optIdx) => (
                                    <div key={optIdx} className="flex items-center gap-1.5">
                                      <span className="w-5 h-5 rounded-full border border-slate-400 flex items-center justify-center font-bold text-[11px]">
                                        {['أ', 'ب', 'ج', 'د'][optIdx]}
                                      </span>
                                      <span>{opt}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Q2 */}
                      {worksheet.trueFalseQuestions && (
                        <div className="space-y-3">
                          <h4 className="font-black text-slate-900 border-r-4 border-slate-900 pr-2">
                            السؤال الثاني: ضع إشارة (✓) أمام العبارة الصحيحة وإشارة (✗) أمام العبارة غير الصحيحة:
                          </h4>
                          <div className="space-y-2 pr-2">
                            {worksheet.trueFalseQuestions.map((q, i) => (
                              <div key={q.id} className="flex items-start justify-between gap-2 border-b border-dotted border-slate-200 pb-1">
                                <span>{toArabicDigits(i + 1)}. {q.statement}</span>
                                <span className="font-mono font-bold text-slate-400 shrink-0">(     )</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Q3 */}
                      {worksheet.openEndedQuestions && (
                        <div className="space-y-3">
                          <h4 className="font-black text-slate-900 border-r-4 border-slate-900 pr-2">
                            السؤال الثالث: التفكير الناقد والتطبيق العملي:
                          </h4>
                          <div className="space-y-3 pr-2">
                            {worksheet.openEndedQuestions.map((q, i) => (
                              <div key={q.id} className="space-y-2">
                                <p className="font-bold text-slate-800">{toArabicDigits(i + 1)}. {q.question}</p>
                                <div className="space-y-2 border-b border-dotted border-slate-400 pb-2">
                                  <div className="h-6 border-b border-dashed border-slate-300" />
                                  <div className="h-6 border-b border-dashed border-slate-300" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Q4 Challenge */}
                      {worksheet.challengeQuestion && (
                        <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                          <h4 className="font-black text-amber-900">
                            ⭐ {worksheet.challengeQuestion.title || 'سؤال التحدي والإبداع للمتميزين'}:
                          </h4>
                          <p className="font-bold text-slate-800">{worksheet.challengeQuestion.problemStatement}</p>
                          <div className="h-6 border-b border-dashed border-slate-300" />
                        </div>
                      )}
                    </div>

                    {/* Footer for Sheet */}
                    <div className="pt-4 border-t border-slate-300 text-center text-[10px] text-slate-500 flex justify-between">
                      <span>منظومة عبقور للتخطيط التربوي - الأستاذ عبد الرحمن دويكات</span>
                      <span>مع تمنياتنا لكم بالتفوق والتميز العلمي 🌟</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: TEACHER MODEL ANSWER KEY & RUBRIC */}
              {activeTab === 'teacher-key' && (
                <div className="space-y-6">
                  <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 text-xs text-purple-900 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-purple-950">
                      <Award className="w-4 h-4 text-purple-700" />
                      <span>دليل المعلم وسلم التصحيح المعتمد (Model Answer & Rubric)</span>
                    </div>
                    <p className="text-purple-800 leading-relaxed">
                      يحتوي هذا النموذج على مفاتيح الحل لجميع الأسئلة مع التبريرات التربوية وسلالم التقدير اللفظية لتوزيع الدرجات بدقة.
                    </p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5">
                    {/* MCQ Keys */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-slate-900 font-['Tajawal'] border-b pb-2">
                        مفتاح تصحيح أسئلة الاختيار من متعدد:
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {worksheet.mcqQuestions?.map((q, i) => (
                          <div key={q.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                            <div className="flex justify-between font-bold">
                              <span className="text-slate-800">السؤال {toArabicDigits(i + 1)}:</span>
                              <span className="text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                                الإجابة الصحيحة: [{['أ', 'ب', 'ج', 'د'][q.correctAnswerIndex]}] {q.options[q.correctAnswerIndex]}
                              </span>
                            </div>
                            <p className="text-slate-600 text-[11px]">{q.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* True/False Keys */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-slate-900 font-['Tajawal'] border-b pb-2">
                        مفتاح تصحيح أسئلة الصواب والخطأ:
                      </h4>
                      <div className="space-y-2">
                        {worksheet.trueFalseQuestions?.map((q, i) => (
                          <div key={q.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between gap-3">
                            <span className="font-bold text-slate-800">{toArabicDigits(i + 1)}. {q.statement}</span>
                            <span className={`font-bold shrink-0 ${q.isTrue ? 'text-emerald-700' : 'text-rose-700'}`}>
                              ({q.isTrue ? 'صواب ✓' : 'خطأ ✗'}) - {q.justification}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Open-Ended Model Solutions */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-slate-900 font-['Tajawal'] border-b pb-2">
                        إجابات الأسئلة المقالية ومعايير التقدير:
                      </h4>
                      <div className="space-y-3">
                        {worksheet.openEndedQuestions?.map((q, i) => (
                          <div key={q.id} className="p-4 bg-purple-50/50 rounded-xl border border-purple-200 text-xs space-y-2">
                            <p className="font-bold text-purple-950">{toArabicDigits(i + 1)}. {q.question}</p>
                            <div className="bg-white p-3 rounded-lg border border-purple-200 space-y-1">
                              <span className="font-bold text-emerald-800">نموذج الإجابة الكاملة:</span>
                              <p className="text-slate-800 leading-relaxed">{q.modelAnswer}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: CUSTOMIZE & AI REGENERATION */}
              {activeTab === 'customize' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900 font-['Tajawal']">
                      تخصيص نمط ورقة العمل وصعوبتها
                    </h3>
                    <p className="text-xs text-slate-500">
                      حدد نوع ونمط الأسئلة المطلوب توليدها بالذكاء الاصطناعي بما يلائم مستويات الطلبة في صفك.
                    </p>
                  </div>

                  {/* Type Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">نوع ورقة العمل المستهدفة:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { id: 'comprehensive', title: 'شاملة ومتدرجة المستويات', desc: 'تغطي كافة مستويات التفكير من التذكر حتى الإبداع' },
                        { id: 'formative', title: 'تكوينية صفية سريعة', desc: 'تركيز على الفحص السريع واستراتيجيات التقويم البنائي' },
                        { id: 'remedial', title: 'علاجية داعمة للمتعثرين', desc: 'تبسيط المفاهيم، محسوسات، وبطاقات استكشافية' },
                        { id: 'enrichment', title: 'إثرائية للمتميزين والموهوبين', desc: 'ألغاز ومهمات تفكير عليا وحل مشكلات مركبة' },
                        { id: 'exit_eval', title: 'تقويم ختامي للدرس', desc: 'قياس تحقق النتاجات التعليمية وربطها بالواقع' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setWorksheetType(item.id as WorksheetType)}
                          className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                            worksheetType === item.id
                              ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-900">{item.title}</span>
                            {worksheetType === item.id && <Check className="w-4 h-4 text-emerald-600" />}
                          </div>
                          <p className="text-[11px] text-slate-500">{item.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Additional Instructions input */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">
                      توجيهات وملاحظات إضافية للذكاء الاصطناعي (اختياري):
                    </label>
                    <textarea
                      rows={3}
                      value={customInstructions}
                      onChange={(e) => setCustomInstructions(e.target.value)}
                      placeholder="مثال: ركز على مسائل الجمع مع الحمل، واذكر مثالاً عن أشجار الزيتون في جنين أو القدس..."
                      className="w-full text-xs p-3 border border-slate-300 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Generate Button */}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => handleGenerateWorksheet()}
                      disabled={isLoading}
                      className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-300" />
                      <span>{isLoading ? 'جاري إعادة التوليد...' : 'تطبيق التخصيص وتوليد ورقة العمل'}</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="font-bold">منظومة عبقور للتخطيط التربوي</span>
            <span className="text-slate-300">|</span>
            <span>تصميم: <strong className="text-emerald-800 font-bold">الأستاذ عبد الرحمن دويكات</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
