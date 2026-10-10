import { LessonPlan } from '../types/lessonPlan';
import { toArabicDigits, formatDateYMD } from './arabicNumerals';

/**
 * Checks if the Web Share API is available in the current browser/device environment.
 */
export function isWebShareSupported(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

/**
 * Generates an elegantly formatted plain text summary of the lesson plan,
 * optimized for messaging apps (WhatsApp, Telegram, Signal, Email, SMS).
 */
export function generatePlanShareText(plan: LessonPlan): string {
  const h = plan.header;
  const isExecutive = (plan.templateType || 'executive') === 'executive' && !!plan.executiveData;
  const exec = plan.executiveData;

  const lines: string[] = [];

  lines.push('📋 *خطة تحضير درس وزارية معتمدة - منظومة عبقور*');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push(`📚 *المبحث:* ${h.subject || 'غير محدد'}`);
  lines.push(`🎓 *الصف الدراسي:* ${h.grade || 'غير محدد'}`);
  lines.push(`📖 *عنوان الدرس:* ${h.lessonTitle || plan.title || 'خطة درس'}`);
  lines.push(`⏱️ *عدد الحصص:* ${toArabicDigits(h.totalPeriods || 1)} حصص (${toArabicDigits(h.periodDurationMinutes || 40)} دقيقة للحصة)`);

  if (h.date || h.startDate) {
    const sDateFormatted = formatDateYMD(h.startDate || h.date);
    const eDateFormatted = h.endDate && h.endDate !== h.startDate ? formatDateYMD(h.endDate) : '';
    lines.push(`📅 *التاريخ والفترة:* ${sDateFormatted}${eDateFormatted ? ` إلى ${eDateFormatted}` : ''}`);
  }

  if (h.school) {
    lines.push(`🏫 *المدرسة:* ${h.school}`);
  }
  if (h.teacherName) {
    lines.push(`👨‍🏫 *إعداد المعلم/ة:* ${h.teacherName}`);
  }

  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Core Competencies & SMART Objectives
  if (isExecutive && exec) {
    if (exec.learningCompetencies) {
      lines.push('🎯 *كفايات التعلّم المستهدفة:*');
      lines.push(`${exec.learningCompetencies}`);
      lines.push('');
    }

    if (exec.smartObjectives && exec.smartObjectives.length > 0) {
      lines.push('⭐ *الأهداف الذكية (SMART):*');
      exec.smartObjectives.forEach((obj, idx) => {
        lines.push(`${toArabicDigits(idx + 1)}. ${obj}`);
      });
      lines.push('');
    }

    // Stages / Phases summary
    if (exec.executiveStages && exec.executiveStages.length > 0) {
      lines.push('📑 *مراحل تنفيذ الدرس:*');
      exec.executiveStages.forEach((stage) => {
        lines.push(`• *${stage.stageName}* (${toArabicDigits(stage.durationMinutes)} د):`);
        if (stage.goals) lines.push(`  - الأهداف: ${stage.goals}`);
        if (stage.procedures?.mainDescription) {
          const shortDesc = stage.procedures.mainDescription.split('\n')[0].slice(0, 120);
          lines.push(`  - الإجراءات: ${shortDesc}...`);
        }
      });
      lines.push('');
    }

    // GRASPS Authentic Assessment Task
    const stage3 = exec.executiveStages.find((s) => s.id === 3);
    if (stage3?.procedures?.grasps?.goal) {
      lines.push('🏆 *مهمة التقويم الأصيل (GRASPS):*');
      lines.push(`- الهدف: ${stage3.procedures.grasps.goal}`);
      if (stage3.procedures.grasps.performance) {
        lines.push(`- المنتج والأداء: ${stage3.procedures.grasps.performance}`);
      }
      lines.push('');
    }

    // Reflection snippet
    if (exec.teacherReflection?.strengths) {
      lines.push('💡 *نقاط القوة والتأمل:*');
      lines.push(`${exec.teacherReflection.strengths}`);
      lines.push('');
    }
  } else {
    // Adaptive plan format
    if (plan.section1?.integrativeCompetencies && plan.section1.integrativeCompetencies.length > 0) {
      lines.push('🎯 *الكفايات التكاملية:*');
      plan.section1.integrativeCompetencies.forEach((c) => {
        lines.push(`• *${c.title}:* ${c.description}`);
      });
      lines.push('');
    }

    if (plan.section2Timeline && plan.section2Timeline.length > 0) {
      lines.push('📑 *مخطط سير الحصة:*');
      plan.section2Timeline.forEach((phase) => {
        const desc = phase.teacherAndStudentActions?.[0] || phase.strategiesAndResources?.join('، ') || '';
        lines.push(`• *${phase.phaseName}* (${toArabicDigits(phase.durationMinutes)} د)${desc ? `: ${desc}` : ''}`);
      });
      lines.push('');
    }

    if (plan.section3Assessment?.graspsTask?.title) {
      lines.push('🏆 *مهمة التقويم الأصيل (GRASPS):*');
      lines.push(`• ${plan.section3Assessment.graspsTask.title}`);
      lines.push(`• ${plan.section3Assessment.graspsTask.fullDescription.slice(0, 150)}...`);
      lines.push('');
    }
  }

  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('✨ تم إعداد ومشاركة الخطة عبر *منظومة عبقور للتخطيط والتمكّن التربوي الذكي*');
  
  if (typeof window !== 'undefined' && window.location?.href) {
    lines.push(`🔗 رابط المنظومة: ${window.location.href}`);
  }

  return lines.join('\n');
}

/**
 * Executes native Web Share API with rich fallback support.
 */
export async function sharePlanViaWebShare(plan: LessonPlan): Promise<{
  success: boolean;
  cancelled?: boolean;
  error?: string;
}> {
  if (!isWebShareSupported()) {
    return {
      success: false,
      error: 'متصفحك الحالي لا يدعم ميزة المشاركة المباشرة (Web Share API). يمكنك استخدام خيارات الإرسال المباشرة إلى واتساب وتيليجرام أدناه.',
    };
  }

  const h = plan.header;
  const shareTitle = `خطة تحضير درس: ${h.lessonTitle || plan.title} (${h.subject || 'المبحث'} - ${h.grade || 'الصف'})`;
  const shareText = generatePlanShareText(plan);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  try {
    const shareData: ShareData = {
      title: shareTitle,
      text: shareText,
    };
    if (shareUrl) {
      shareData.url = shareUrl;
    }

    // Check navigator.canShare if supported by browser
    if (typeof navigator.canShare === 'function' && !navigator.canShare(shareData)) {
      if (navigator.canShare({ title: shareTitle, text: shareText })) {
        await navigator.share({ title: shareTitle, text: shareText });
        return { success: true };
      }
    }

    await navigator.share(shareData);
    return { success: true };
  } catch (err: any) {
    // User cancelled the native share picker
    if (err?.name === 'AbortError') {
      return { success: false, cancelled: true };
    }
    // Attempt fallback with title and text only
    try {
      if (err?.name === 'TypeError') {
        await navigator.share({ title: shareTitle, text: shareText });
        return { success: true };
      }
    } catch (retryErr: any) {
      if (retryErr?.name === 'AbortError') {
        return { success: false, cancelled: true };
      }
    }
    console.warn('Web Share API execution error:', err);
    return {
      success: false,
      error: err?.message || 'تعذر استكمال المشاركة عبر المتصفح. يمكنك استخدام أزرار المراسلة المباشرة أدناه.',
    };
  }
}

/**
 * Builds direct WhatsApp URL with the formatted plan text.
 */
export function getWhatsAppShareUrl(plan: LessonPlan): string {
  const text = generatePlanShareText(plan);
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

/**
 * Builds direct Telegram share URL.
 */
export function getTelegramShareUrl(plan: LessonPlan): string {
  const text = generatePlanShareText(plan);
  const url = typeof window !== 'undefined' ? window.location.href : '';
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
}

/**
 * Builds direct mailto URL.
 */
export function getEmailShareUrl(plan: LessonPlan): string {
  const h = plan.header;
  const subject = `خطة تحضير درس: ${h.lessonTitle || plan.title} (${h.subject} - ${h.grade})`;
  const body = generatePlanShareText(plan);
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
