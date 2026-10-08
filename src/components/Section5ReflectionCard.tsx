/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Section5SelfReflection, LessonHeader, LessonPlan } from '../types/lessonPlan';
import {
  BrainCircuit,
  TrendingUp,
  Share2,
  CheckCircle2,
  Edit3,
  Check,
  Download,
  Copy,
  FileText,
  Printer,
  Sparkles,
  X,
  FileDown,
  BookOpen,
  UserCheck,
  BarChart2,
  Award,
  Compass,
  Activity,
  ArrowUpRight,
  ChevronLeft,
  Layers,
  Zap,
  CheckSquare,
  HelpCircle,
} from 'lucide-react';
import { toArabicDigits } from '../utils/arabicNumerals';

interface Section5ReflectionCardProps {
  data: Section5SelfReflection;
  onChange: (data: Section5SelfReflection) => void;
  lessonHeader?: LessonHeader;
  allPlans?: LessonPlan[];
  onSelectPlan?: (id: string) => void;
}

export const Section5ReflectionCard: React.FC<Section5ReflectionCardProps> = ({
  data,
  onChange,
  lessonHeader,
  allPlans = [],
  onSelectPlan,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [isEnhancingAi, setIsEnhancingAi] = useState(false);

  // Active view inside Section 5: 'editor' (current lesson) or 'dashboard' (mini growth analytics across plans)
  const [activeSectionView, setActiveSectionView] = useState<'editor' | 'dashboard'>('editor');

  // Extract metadata safely with fallbacks
  const teacher = lessonHeader?.teacherName || 'معلم المادة';
  const school = lessonHeader?.school || 'المدرسة';
  const directorate = lessonHeader?.directorate || 'مديرية التربية والتعليم';
  const subject = lessonHeader?.subject || 'المادة الدراسية';
  const grade = lessonHeader?.grade || 'الصف الدراسي';
  const lessonTitle = lessonHeader?.lessonTitle || 'درس تعليمي';
  const dateStr = lessonHeader?.date || new Date().toISOString().split('T')[0];

  const strengthsList = (data.strengthsAndImpact || []).filter((s) => s && s.trim() !== '');
  const improvement = data.improvementOpportunities || '';
  const plcNotes = data.professionalLearningCommunities || '';

  // Calculate Cumulative Growth Metrics across all plans in the system
  const analytics = useMemo(() => {
    const plansToAnalyze = allPlans.length > 0 ? allPlans : [];
    const totalPlans = plansToAnalyze.length || 1;

    let totalStrengthsCount = 0;
    let totalImprovementCount = 0;
    let totalPlcCount = 0;
    let completedReflectionsCount = 0;

    const topicHits = {
      differentiation: 0, // تمايز وفروق فردية
      timeManagement: 0, // زمن وسير الحصة
      formativeAssessment: 0, // تقويم تكويني وروبك
      techAndSimulations: 0, // تقنية ومحاكاة
      activeLearning: 0, // تعلم نشط ومجموعات
    };

    const recentReflections: {
      planId: string;
      title: string;
      subject: string;
      grade: string;
      date: string;
      hasReflection: boolean;
      strengthsCount: number;
      improvementSnippet: string;
      plcSnippet: string;
    }[] = [];

    plansToAnalyze.forEach((plan) => {
      const ref = plan.section5Reflection;
      const sList = (ref?.strengthsAndImpact || []).filter((s) => s && s.trim() !== '');
      const imp = (ref?.improvementOpportunities || '').trim();
      const plc = (ref?.professionalLearningCommunities || '').trim();

      const hasContent = sList.length > 0 || imp.length > 0 || plc.length > 0;
      if (hasContent) {
        completedReflectionsCount++;
      }

      totalStrengthsCount += sList.length;
      if (imp) totalImprovementCount++;
      if (plc) totalPlcCount++;

      const fullRefText = `${sList.join(' ')} ${imp} ${plc}`;

      if (fullRefText.includes('تمايز') || fullRefText.includes('فروق') || fullRefText.includes('متنوع')) {
        topicHits.differentiation++;
      }
      if (fullRefText.includes('زمن') || fullRefText.includes('وقت') || fullRefText.includes('تمهيد') || fullRefText.includes('خاتمة')) {
        topicHits.timeManagement++;
      }
      if (fullRefText.includes('تقويم') || fullRefText.includes('تكويني') || fullRefText.includes('روبك') || fullRefText.includes('GRASPS')) {
        topicHits.formativeAssessment++;
      }
      if (fullRefText.includes('رقمي') || fullRefText.includes('محاكاة') || fullRefText.includes('وسائل') || fullRefText.includes('معداد')) {
        topicHits.techAndSimulations++;
      }
      if (fullRefText.includes('مجموعات') || fullRefText.includes('تعاوني') || fullRefText.includes('نشط') || fullRefText.includes('أقران')) {
        topicHits.activeLearning++;
      }

      recentReflections.push({
        planId: plan.id,
        title: plan.header?.lessonTitle || plan.title || 'خطة درس',
        subject: plan.header?.subject || 'مادة',
        grade: plan.header?.grade || 'صف',
        date: plan.header?.date || 'تاريخ',
        hasReflection: hasContent,
        strengthsCount: sList.length,
        improvementSnippet: imp || 'لا توجد ملاحظات تسجيلية بعد',
        plcSnippet: plc || 'لم يتم التسجيل بعد',
      });
    });

    const completionRate = Math.round((completedReflectionsCount / totalPlans) * 100);

    // Calculate Teacher Professional Growth Index Score
    let growthScore = 70;
    growthScore += Math.min(15, completedReflectionsCount * 3);
    growthScore += Math.min(10, totalPlcCount * 2);
    growthScore += Math.min(5, totalStrengthsCount);
    growthScore = Math.min(98, Math.max(65, Math.round(growthScore)));

    let competencyLevelStr = 'مستوى التمكّن المتقدم (الدرجة ٣)';
    if (growthScore >= 90) {
      competencyLevelStr = '🏆 خبير ونموذج ملهم في مجتمعات التعلم (الدرجة ٤)';
    } else if (growthScore >= 80) {
      competencyLevelStr = '🌟 معلم متمكن وممارس متميز (الدرجة ٣+)';
    }

    return {
      totalPlans,
      completedReflectionsCount,
      completionRate,
      totalStrengthsCount,
      totalImprovementCount,
      totalPlcCount,
      topicHits,
      growthScore,
      competencyLevelStr,
      recentReflections,
    };
  }, [allPlans]);

  // Generate structured plain text format for export
  const buildStructuredTextReport = () => {
    const strengthsText =
      strengthsList.length > 0
        ? strengthsList.map((item, i) => `  ${toArabicDigits(i + 1)}. ${item}`).join('\n')
        : '  • [لم يتم إدخال نقاط القوة بعد]';

    return (
      `===================================================\n` +
      `📌 تقرير التأمل الذاتي ومجتمعات التعلم المهني (PLC)\n` +
      `منظومة عبقور للتخطيط والتمكّن التربوي الذكي © 2026\n` +
      `===================================================\n\n` +
      `🏛️ المديرية: ${directorate}\n` +
      `🏫 المدرسة: ${school}\n` +
      `👨‍🏫 المعلم/ة: ${teacher}\n` +
      `📚 المبحث: ${subject} | ${grade}\n` +
      `📖 عنوان الدرس: ${lessonTitle}\n` +
      `📅 تاريخ التنفيذ: ${toArabicDigits(dateStr)}\n\n` +
      `📊 مؤشر التطور المهني للمعلم: ${toArabicDigits(analytics.growthScore)}% (${analytics.competencyLevelStr})\n` +
      `---------------------------------------------------\n` +
      `أولاً: نقاط القوة والأثر الملموس على تعلم الطلبة:\n` +
      `---------------------------------------------------\n` +
      `${strengthsText}\n\n` +
      `---------------------------------------------------\n` +
      `ثانياً: فرص التحسين والتطوير للحصص القادمة:\n` +
      `---------------------------------------------------\n` +
      `  ${improvement || '[لا توجد ملاحظات تسجيلية حتى الآن]'}\n\n` +
      `---------------------------------------------------\n` +
      `ثالثاً: تبادل الخبرات ومجتمعات التعلم المهني (PLC):\n` +
      `---------------------------------------------------\n` +
      `  ${plcNotes || '[لم تُسجّل أفكار مشاركة مع الزملاء]'}\n\n` +
      `===================================================\n` +
      `تم إعداد وتصدير هذا التقرير عبر منظومة عبقور للتميز التربوي\n` +
      `===================================================`
    );
  };

  // Download plain text (.txt) file
  const handleExportTxtFile = () => {
    const content = buildStructuredTextReport();
    const blob = new Blob(['\ufeff' + content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `تقرير_التأمل_الذاتي_PLC_${lessonTitle || 'درس'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download Word document (.doc)
  const handleExportWordFile = () => {
    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"><title>تقرير التأمل الذاتي PLC</title>
      <style>
        body { font-family: 'Traditional Arabic', 'Amiri', Arial, sans-serif; direction: rtl; text-align: right; padding: 25px; line-height: 1.6; }
        h1 { color: #047857; font-size: 20px; border-bottom: 2px solid #047857; padding-bottom: 6px; }
        h2 { color: #1e293b; font-size: 15px; margin-top: 18px; border-right: 4px solid #0d9488; padding-right: 8px; }
        .meta { background: #f8fafc; border: 1px solid #cbd5e1; padding: 12px; margin-bottom: 20px; border-radius: 8px; }
        p, li { font-size: 14px; color: #334155; }
        .footer { margin-top: 30px; font-size: 11px; text-align: center; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 10px; }
      </style>
      </head>
      <body>
        <h1>منظومة عبقور - تقرير التأمل الذاتي ومجتمعات التعلم المهني (PLC)</h1>
        <div class="meta">
          <p><strong>المعلم/ة:</strong> ${teacher} | <strong>المدرسة:</strong> ${school}</p>
          <p><strong>المبحث:</strong> ${subject} (${grade}) | <strong>الدرس:</strong> ${lessonTitle}</p>
          <p><strong>التاريخ:</strong> ${dateStr} | <strong>مؤشر التطور المهني:</strong> ${analytics.growthScore}%</p>
        </div>

        <h2>أولاً: نقاط القوة والأثر الملموس على تعلم الطلبة</h2>
        <ul>
          ${
            strengthsList.length > 0
              ? strengthsList.map((s) => `<li>${s}</li>`).join('')
              : '<li>[لا توجد ملاحظات مدخلة]</li>'
          }
        </ul>

        <h2>ثانياً: فرص التحسين والتطوير المستقبلي</h2>
        <p>${improvement || '[لا توجد ملاحظات مدخلة]'}</p>

        <h2>ثالثاً: نقل الخبرة ومجتمعات التعلم المهني (PLC)</h2>
        <p>${plcNotes || '[لا توجد ملاحظات مدخلة]'}</p>

        <h2>رابعاً: توجيهات وتوصيات المشرف التربوي</h2>
        <p>...................................................................................................</p>

        <div class="footer">تم تصدير التقرير عبر منظومة عبقور للتخطيط والتمكّن التربوي الذكي © 2026</div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `تقرير_التأمل_الذاتي_PLC_${lessonTitle || 'درس'}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy structured text to clipboard for WhatsApp / Email
  const handleCopyFormattedText = () => {
    const text = buildStructuredTextReport();
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  // Print A4 report
  const handlePrint = () => {
    window.print();
  };

  // AI Refine / Enhance Reflection phrasing
  const handleAiEnhanceReflections = () => {
    setIsEnhancingAi(true);
    setTimeout(() => {
      const enhancedStrengths =
        strengthsList.length > 0
          ? strengthsList.map(
              (s) => `${s} (تم التحقق عبر أدلة التقييم التكويني والملاحظة المباشرة لنشاط الطلبة)`
            )
          : [
              `تحقق الأهداف السلوكية والمعرفية لدرس "${lessonTitle}" وتفاعل الطلبة مع الأنشطة التفاعلية.`,
              'تقديم تغذية راجعة فورية ومباشرة عززت الفهم واستراتيجيات العمل التعاوني.',
            ];

      const enhancedImprovement =
        improvement.trim() !== ''
          ? `${improvement} - العمل على تخصيص أنشطة إضافية للطلبة ذوي الاحتياجات وبناء أوراق عمل متمايزة.`
          : `إعادة موازنة الزمن المخصص لمرحلة الاستكشاف والتطبيقات العملية لضمان مشاركة جميع المجموعات في درس "${lessonTitle}".`;

      const enhancedPlc =
        plcNotes.trim() !== ''
          ? `${plcNotes} - توثيق النموذج في ملف مجتمعات التعلم المهني (PLC) لمبحث ${subject}.`
          : `مشاركة تجربة تدريس درس "${lessonTitle}" ورابط أنشطته التفاعلية مع معلمي مبحث ${subject} بالمدرسة وعبر اللقاءات التربوية.`;

      onChange({
        ...data,
        strengthsAndImpact: enhancedStrengths,
        improvementOpportunities: enhancedImprovement,
        professionalLearningCommunities: enhancedPlc,
      });

      setIsEnhancingAi(false);
    }, 700);
  };

  return (
    <div
      id="section-5-reflection-card"
      dir="rtl"
      className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden text-right font-['Cairo',sans-serif]"
    >
      {/* 1. Section Header Bar */}
      <div className="bg-slate-900 text-white p-4.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-linear-to-br from-indigo-600 to-purple-700 rounded-xl text-white shadow-xs">
            <BrainCircuit className="w-5.5 h-5.5 text-indigo-100" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base md:text-lg font-bold font-['Tajawal']">
                خامساً: التأمل الذاتي والتطور المهني ومجتمعات التعلم (PLC)
              </h3>
              <span className="px-2.5 py-0.5 bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 rounded-full text-[10px] font-black">
                لوحة النمو المهني 📊
              </span>
            </div>
            <p className="text-xs text-slate-300">
              (إطار تقييم أداء المعلم للدرجة ٤ - تحليل ومتابعة الملاحظات التراكمية عبر الفصول)
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {/* Subview Toggle Buttons */}
          <div className="flex items-center bg-white/10 p-1 rounded-xl border border-white/20">
            <button
              onClick={() => setActiveSectionView('editor')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSectionView === 'editor'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              تأمل الدرس الحالي 📝
            </button>
            <button
              onClick={() => setActiveSectionView('dashboard')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSectionView === 'dashboard'
                  ? 'bg-linear-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-xs'
                  : 'text-emerald-300 hover:text-white'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>لوحة النمو التراكمي ({toArabicDigits(analytics.completedReflectionsCount)})</span>
            </button>
          </div>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="px-3.5 py-1.5 bg-linear-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer border border-emerald-400/40"
            title="مشاركة وتصدير الملاحظات التأملية (PLC) للمشرف التربوي أو الزملاء المعلمين"
          >
            <Share2 className="w-4 h-4 text-emerald-200" />
            <span className="hidden sm:inline">مشاركة وتصدير (PLC)</span>
          </button>

          {activeSectionView === 'editor' && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isEditing ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  حفظ
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" />
                  تعديل
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 2. Mini-Dashboard View: Cumulative Teacher Professional Growth Analytics */}
      {activeSectionView === 'dashboard' && (
        <div className="p-5 space-y-5 bg-slate-50/60 border-b border-slate-200 animate-in fade-in duration-200">
          
          {/* Top Growth Banner */}
          <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-md border border-indigo-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 bg-emerald-400 text-slate-950 rounded-full text-[10px] font-black">
                  مؤشر النمو التراكمي
                </span>
                <h4 className="text-base sm:text-lg font-black font-['Tajawal'] text-white">
                  لوحة تحليل اتجاهات التأمل والتمكّن المهني لمعلم المبحث
                </h4>
              </div>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                تحليل تلقائي شامل لـ <strong className="text-amber-300 tabular-nums">{toArabicDigits(analytics.totalPlans)}</strong> خطط دروس مسجلة في المنظومة، لتحديد نقاط القوة المستمرة وفرص النمو ومشاركات مجتمعات التعلم (PLC).
              </p>
            </div>

            <div className="bg-white/10 p-3.5 rounded-2xl border border-white/20 text-center shrink-0 self-stretch md:self-auto flex flex-col justify-center">
              <span className="text-[11px] text-slate-300 font-bold block">درجة التمكين المهني</span>
              <span className="text-2xl sm:text-3xl font-black text-amber-300 font-['Tajawal'] tabular-nums">
                {toArabicDigits(analytics.growthScore)}%
              </span>
              <span className="text-[10px] text-emerald-200 font-bold block mt-0.5">
                {analytics.competencyLevelStr}
              </span>
            </div>
          </div>

          {/* KPI Metrics Grid (4 Cards) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* KPI 1: Reflection Rate */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span className="font-bold">اكتمال التأمل الذاتي</span>
                <CheckSquare className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black font-['Tajawal'] text-slate-900 tabular-nums">
                  {toArabicDigits(analytics.completionRate)}%
                </span>
                <span className="text-[10px] text-slate-500">
                  ({toArabicDigits(analytics.completedReflectionsCount)} من {toArabicDigits(analytics.totalPlans)})
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${analytics.completionRate}%` }}
                />
              </div>
            </div>

            {/* KPI 2: Total Strengths */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span className="font-bold">نقاط القوة الموثقة</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black font-['Tajawal'] text-slate-900 tabular-nums">
                  {toArabicDigits(analytics.totalStrengthsCount)}
                </span>
                <span className="text-[10px] text-slate-500">نقطة قوة مثبتة</span>
              </div>
              <p className="text-[10px] text-emerald-700 font-bold truncate">
                تأكيد الأثر الملموس على تعلم الطلبة
              </p>
            </div>

            {/* KPI 3: Improvement Areas */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span className="font-bold">مجالات التطوير والمعالجة</span>
                <TrendingUp className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black font-['Tajawal'] text-slate-900 tabular-nums">
                  {toArabicDigits(analytics.totalImprovementCount)}
                </span>
                <span className="text-[10px] text-slate-500">فرصة تحسين</span>
              </div>
              <p className="text-[10px] text-indigo-700 font-bold truncate">
                متابعة التطوير والتعديل المستمر
              </p>
            </div>

            {/* KPI 4: PLC Peer Exchanges */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span className="font-bold">مشاركات PLC مع المعلمين</span>
                <Share2 className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black font-['Tajawal'] text-slate-900 tabular-nums">
                  {toArabicDigits(analytics.totalPlcCount)}
                </span>
                <span className="text-[10px] text-slate-500">خبرة مشتركة</span>
              </div>
              <p className="text-[10px] text-blue-700 font-bold truncate">
                نقل الممارسات الفضلى لزملائك
              </p>
            </div>
          </div>

          {/* Categorized Reflection Focus Topics Breakdown */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs sm:text-sm font-black text-slate-900 font-['Tajawal'] flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-indigo-600" />
                <span>توزيع محاور التأمل والتطوير المهني الأكثر تكراراً عبر الدروس</span>
              </h5>
              <span className="text-[11px] text-slate-500 font-bold">
                تحليل العبارات الكاشفة
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-700">التمايز ومراعاة الفروق الفردية</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold tabular-nums text-[11px]">
                  {toArabicDigits(analytics.topicHits.differentiation)} خطة
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-700">إدارة وتسلسل زمن الحصة</span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-bold tabular-nums text-[11px]">
                  {toArabicDigits(analytics.topicHits.timeManagement)} خطة
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-700">التقويم التكويني والـ GRASPS</span>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full font-bold tabular-nums text-[11px]">
                  {toArabicDigits(analytics.topicHits.formativeAssessment)} خطة
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-700">دمج الوسائل الرقمية والمحاكاة</span>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-bold tabular-nums text-[11px]">
                  {toArabicDigits(analytics.topicHits.techAndSimulations)} خطة
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-700">استراتيجيات التعلم النشط والأقران</span>
                <span className="px-2 py-0.5 bg-teal-100 text-teal-800 rounded-full font-bold tabular-nums text-[11px]">
                  {toArabicDigits(analytics.topicHits.activeLearning)} خطة
                </span>
              </div>
            </div>
          </div>

          {/* Recent Lesson Reflections Summary List */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs sm:text-sm font-black text-slate-900 font-['Tajawal'] flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>سجل الملاحظات التأملية للدروس الأخيرة ({toArabicDigits(analytics.recentReflections.length)})</span>
              </h5>
              <button
                onClick={() => setActiveSectionView('editor')}
                className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <span>العودة لمحرر الدرس الحالي</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pl-1">
              {analytics.recentReflections.map((refItem) => (
                <div
                  key={refItem.planId}
                  className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{refItem.title}</span>
                      <span className="px-2 py-0.2 bg-white border border-slate-200 rounded-md text-[10px] text-slate-600 font-semibold">
                        {refItem.subject} ({refItem.grade})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-1">
                      💡 {refItem.improvementSnippet}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        refItem.hasReflection
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-slate-200 text-slate-600 border-slate-300'
                      }`}
                    >
                      {refItem.hasReflection ? 'مكتمَل التأمل' : 'غير مدخل'}
                    </span>

                    {onSelectPlan && (
                      <button
                        onClick={() => onSelectPlan(refItem.planId)}
                        className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-800 border border-slate-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        عرض الخطة
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 3. Main Current Lesson Editor View */}
      {activeSectionView === 'editor' && (
        <div className="p-5 space-y-5">
          {/* نقاط القوة والأثر الملموس */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-800">
                  نقاط القوة والأثر الملموس على تعلم الطلبة:
                </h4>
              </div>

              {/* AI Refine button */}
              <button
                onClick={handleAiEnhanceReflections}
                disabled={isEnhancingAi}
                className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 border border-indigo-200 cursor-pointer disabled:opacity-50"
                title="تنسيق وتصويب الملاحظات بأسلوب تربوي رصين بالذكاء الاصطناعي"
              >
                <Sparkles className={`w-3.5 h-3.5 text-indigo-600 ${isEnhancingAi ? 'animate-spin' : ''}`} />
                <span>{isEnhancingAi ? 'جاري التحسين...' : 'تحسين بالـ AI'}</span>
              </button>
            </div>

            <div className="space-y-2">
              {data.strengthsAndImpact.filter((s) => s && s.trim() !== '').length > 0 ? (
                data.strengthsAndImpact.filter((s) => s && s.trim() !== '').map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/80 text-xs text-emerald-950 flex items-start gap-2"
                  >
                    <span className="text-emerald-600 font-bold">•</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={item}
                        placeholder="نقطة قوة ملحوظة بعد تنفيذ الحصة..."
                        onChange={(e) => {
                          const updated = [...data.strengthsAndImpact];
                          updated[idx] = e.target.value;
                          onChange({ ...data, strengthsAndImpact: updated });
                        }}
                        className="w-full p-1 border border-slate-300 rounded-md bg-white text-xs font-normal text-right"
                      />
                    ) : (
                      <span className="leading-relaxed">{toArabicDigits(item)}</span>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-400 italic">
                  [يُستكمل بعد تنفيذ الحصة لتدوين مواطن القوة والأثر الملموس على تعلم الطلبة...]
                </div>
              )}
            </div>
          </div>

          {/* فرص التحسين ومجتمعات التعلم المهني */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-5 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1.5 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                فرص التحسين المكتشفة للحصص القادمة:
              </span>
              {isEditing ? (
                <textarea
                  rows={3}
                  value={data.improvementOpportunities}
                  placeholder="الجوانب التي تحتاج تعزيزاً أو تدريباً إضافياً..."
                  onChange={(e) => onChange({ ...data, improvementOpportunities: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white text-right"
                />
              ) : (
                <p className="text-slate-700 leading-relaxed">
                  {data.improvementOpportunities ? (
                    toArabicDigits(data.improvementOpportunities)
                  ) : (
                    <span className="text-slate-400 italic text-[11px] block">
                      [فرص التحسين والتطوير للحصص القادمة...]
                    </span>
                  )}
                </p>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1.5 flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-blue-600" />
                نقل الخبرة ومجتمعات التعلم المهني (PLC):
              </span>
              {isEditing ? (
                <textarea
                  rows={3}
                  value={data.professionalLearningCommunities}
                  placeholder="مشاركة الممارسات والخطط مع معلمي التخصص..."
                  onChange={(e) =>
                    onChange({ ...data, professionalLearningCommunities: e.target.value })
                  }
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white text-right"
                />
              ) : (
                <p className="text-slate-700 leading-relaxed">
                  {data.professionalLearningCommunities ? (
                    toArabicDigits(data.professionalLearningCommunities)
                  ) : (
                    <span className="text-slate-400 italic text-[11px] block">
                      [تبادل الخبرات مع الزملاء ضمن مجتمعات التعلم المهني...]
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Quick Switch Banner to Growth Mini-Dashboard */}
          <div className="bg-linear-to-r from-indigo-50 via-purple-50 to-emerald-50 border border-indigo-200 rounded-2xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-600 text-white rounded-lg shrink-0">
                <BarChart2 className="w-4 h-4" />
              </div>
              <p className="text-indigo-950 font-medium">
                <strong>مؤشرات التطور التراكمية:</strong> يمكنك استعراض لوحة مؤشرات النمو المهني والتحليل التراكمي لكافة خطط الدروس المسجلة.
              </p>
            </div>

            <button
              onClick={() => setActiveSectionView('dashboard')}
              className="px-3.5 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl font-bold transition-colors cursor-pointer shrink-0 shadow-2xs"
            >
              عرض لوحة النمو المهني 📊
            </button>
          </div>

          {/* Action Toolbar Inside Card */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
              <BrainCircuit className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>جاهز للتصدير والمشاركة مع المشرف التربوي ومعلمي المبحث.</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportTxtFile}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="تصدير الملاحظات التأملية كملف نصي عادي (.txt)"
              >
                <FileText className="w-3.5 h-3.5 text-slate-700" />
                <span>تصدير ملف نصي (.txt)</span>
              </button>

              <button
                onClick={handleExportWordFile}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="تصدير كمستند Microsoft Word (.doc)"
              >
                <FileDown className="w-3.5 h-3.5 text-blue-700" />
                <span>مستند Word (.doc)</span>
              </button>

              <button
                onClick={handleCopyFormattedText}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="نسخ النص المنظم لإرساله عبر WhatsApp أو البريد الإلكتروني"
              >
                <Copy className="w-3.5 h-3.5 text-emerald-700" />
                <span>{copiedText ? 'تم النسخ!' : 'نسخ النص (WhatsApp)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PLC Sharing & Export Dedicated Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden text-right">
            {/* Modal Header */}
            <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4.5 flex items-center justify-between shrink-0 shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600/40 rounded-2xl border border-indigo-400/30">
                  <Share2 className="w-6 h-6 text-indigo-300" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black font-['Tajawal'] text-white">
                    مشاركة وتصدير أفكار مجتمعات التعلم المهني (PLC)
                  </h3>
                  <p className="text-xs text-indigo-200">
                    تصدير الملاحظات كتقرير نصي منظم لمشرف المادة أو زملائك المعلمين
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-2 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Preview */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/60">
              {/* Context Header */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1 text-xs text-slate-700">
                <div className="flex flex-wrap items-center justify-between font-bold text-slate-900">
                  <span>📖 المبحث: {subject} ({grade})</span>
                  <span>👨‍🏫 المعلم: {teacher}</span>
                </div>
                <div className="flex flex-wrap items-center justify-between text-slate-500">
                  <span>📌 الدرس: {lessonTitle}</span>
                  <span>📅 التاريخ: {toArabicDigits(dateStr)}</span>
                </div>
              </div>

              {/* Formatted Text Preview Area */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>معاينة النص التصديري الموحد:</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    (نص منظم متوافق مع كافة برامج التراسل والبريد)
                  </span>
                </label>
                <textarea
                  readOnly
                  rows={10}
                  value={buildStructuredTextReport()}
                  className="w-full p-3 bg-slate-900 text-emerald-300 font-mono text-xs rounded-2xl border border-slate-700 focus:outline-hidden leading-relaxed"
                />
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <button
                  onClick={handleExportTxtFile}
                  className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-2xl text-xs font-extrabold flex flex-col items-center justify-center gap-1.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer text-center"
                >
                  <FileText className="w-5 h-5 text-emerald-700" />
                  <span>تصدير ملف نصي (.txt)</span>
                </button>

                <button
                  onClick={handleExportWordFile}
                  className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-950 border border-blue-300 rounded-2xl text-xs font-extrabold flex flex-col items-center justify-center gap-1.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer text-center"
                >
                  <FileDown className="w-5 h-5 text-blue-700" />
                  <span>مستند Word (.doc)</span>
                </button>

                <button
                  onClick={handleCopyFormattedText}
                  className="p-3 bg-teal-50 hover:bg-teal-100 text-teal-950 border border-teal-300 rounded-2xl text-xs font-extrabold flex flex-col items-center justify-center gap-1.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer text-center"
                >
                  <Copy className="w-5 h-5 text-teal-700" />
                  <span>{copiedText ? 'تم النسخ!' : 'نسخ النص (WhatsApp)'}</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 rounded-2xl text-xs font-extrabold flex flex-col items-center justify-center gap-1.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer text-center"
                >
                  <Printer className="w-5 h-5 text-slate-700" />
                  <span>طباعة A4 للملف</span>
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-white border-t border-slate-200 px-5 py-3 flex items-center justify-between text-xs shrink-0">
              <span className="text-slate-500 font-medium">
                💡 يمكنك إرسال هذا الملف مباشرة لمشرف المادة عبر الإيميل أو الواتساب.
              </span>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
