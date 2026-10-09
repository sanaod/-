import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Send,
  Mail,
  Sparkles,
  BookOpen,
  Check,
  Smartphone,
  Globe,
  AlertCircle,
} from 'lucide-react';
import { LessonPlan } from '../types/lessonPlan';
import { toArabicDigits } from '../utils/arabicNumerals';
import {
  isWebShareSupported,
  sharePlanViaWebShare,
  generatePlanShareText,
  getWhatsAppShareUrl,
  getTelegramShareUrl,
  getEmailShareUrl,
} from '../utils/shareUtils';
import { WhatsAppIcon } from './WhatsAppContactButton';

interface SharePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: LessonPlan;
}

export const SharePlanModal: React.FC<SharePlanModalProps> = ({
  isOpen,
  onClose,
  plan,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isErrorStatus, setIsErrorStatus] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  if (!isOpen) return null;

  const webShareSupported = isWebShareSupported();
  const planText = generatePlanShareText(plan);
  const h = plan.header;

  const handleNativeShare = async () => {
    setStatusMessage('جاري فتح نافذة المشاركة في جهازك...');
    setIsErrorStatus(false);

    const result = await sharePlanViaWebShare(plan);
    if (result.success) {
      setStatusMessage('تمت مشاركة الخطة بنجاح مع الزملاء!');
      setIsErrorStatus(false);
      setTimeout(() => setStatusMessage(null), 3500);
    } else if (result.cancelled) {
      setStatusMessage(null);
    } else {
      setStatusMessage(result.error || 'تعذر استكمال المشاركة عبر المتصفح. يمكنك استخدام خيارات الإرسال المباشرة أدناه.');
      setIsErrorStatus(true);
      setTimeout(() => setStatusMessage(null), 4500);
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(planText);
      setCopied(true);
      setStatusMessage('تم نسخ نص الخطة المنظم بالكامل إلى الحافظة!');
      setIsErrorStatus(false);
      setTimeout(() => {
        setCopied(false);
        setStatusMessage(null);
      }, 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setStatusMessage('تم نسخ رابط المنظومة بنجاح!');
      setIsErrorStatus(false);
      setTimeout(() => {
        setCopiedLink(false);
        setStatusMessage(null);
      }, 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleWhatsAppShare = () => {
    const url = getWhatsAppShareUrl(plan);
    window.open(url, '_blank', 'noopener,noreferrer');
    setStatusMessage('تم فتح تطبيق واتساب للمشاركة مع المعلمين والمجموعات.');
    setIsErrorStatus(false);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleTelegramShare = () => {
    const url = getTelegramShareUrl(plan);
    window.open(url, '_blank', 'noopener,noreferrer');
    setStatusMessage('تم فتح تيليجرام للمشاركة مع المجموعات التربوية.');
    setIsErrorStatus(false);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleEmailShare = () => {
    const url = getEmailShareUrl(plan);
    window.location.href = url;
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto text-right font-['Cairo',sans-serif]"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-4 flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-linear-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-700/80 rounded-2xl text-white shadow-sm border border-emerald-400/30">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold font-['Tajawal']">
                  مشاركة خطة الدرس مع الزملاء
                </h3>
                <span className="text-[10px] bg-emerald-400 text-slate-950 px-2 py-0.5 rounded-full font-black">
                  Web Share API 📱
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                إرسال مباشر للخطة وتفاصيلها عبر واتساب وتطبيقات المراسلة والتواصل
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Notification Toast */}
        {statusMessage && (
          <div
            className={`p-3 text-xs font-bold flex items-center gap-2 transition-all ${
              isErrorStatus
                ? 'bg-rose-50 text-rose-900 border-b border-rose-200'
                : 'bg-emerald-50 text-emerald-950 border-b border-emerald-200'
            }`}
          >
            {isErrorStatus ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{statusMessage}</span>
          </div>
        )}

        <div className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Target Plan Summary Strip */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="text-slate-600">الدرس المستهدف:</span>
              <strong className="text-slate-900 font-bold">
                {h.lessonTitle || plan.title}
              </strong>
            </div>
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <span>{h.subject || 'المبحث'}</span>
              <span>•</span>
              <span>{h.grade || 'الصف'}</span>
              <span>•</span>
              <span>{toArabicDigits(h.totalPeriods || 1)} حصص</span>
            </div>
          </div>

          {/* Primary Action 1: Web Share API Button (Prominent) */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full p-4 rounded-2xl bg-linear-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white transition-all flex items-center justify-between gap-3 text-right shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-98 cursor-pointer border border-emerald-400/40 group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0 shadow-inner group-hover:rotate-6 transition-transform">
                  <Share2 className="w-6 h-6 text-emerald-100" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm sm:text-base font-black text-white">
                      مشاركة سريعة عبر نافذة النظام (Web Share API)
                    </h4>
                    {webShareSupported ? (
                      <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black">
                        مدعوم في جهازك ✨
                      </span>
                    ) : (
                      <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">
                        تلقائي
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
                    يفتح نافذة المشاركة الرسمية على هاتفك أو حاسوبك لاختيار واتساب، تيليجرام، الرسائل، أو جهات الاتصال مباشرة.
                  </p>
                </div>
              </div>
              <Smartphone className="w-6 h-6 text-emerald-200 shrink-0 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Direct Messaging Apps Grid */}
          <div>
            <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
              <span>إرسال مباشر عبر تطبيقات المراسلة:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* WhatsApp Button */}
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="p-3.5 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100/90 border border-emerald-300 transition-all flex items-center justify-between gap-3 text-right group cursor-pointer shadow-2xs"
                title="إرسال نص الخطة مباشرة إلى واتساب"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    <WhatsAppIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-900 group-hover:text-emerald-950">
                      واتساب (WhatsApp)
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      إرسال لزملاء المبحث ومجموعات المدرسة
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-emerald-700 shrink-0" />
              </button>

              {/* Telegram Button */}
              <button
                type="button"
                onClick={handleTelegramShare}
                className="p-3.5 rounded-2xl bg-sky-50/80 hover:bg-sky-100/90 border border-sky-300 transition-all flex items-center justify-between gap-3 text-right group cursor-pointer shadow-2xs"
                title="إرسال الخطة إلى تيليجرام"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0088cc] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    <Send className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-900 group-hover:text-sky-950">
                      تيليجرام (Telegram)
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      المجموعات والقنوات التربوية
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-sky-700 shrink-0" />
              </button>

              {/* Copy Full Plan Text Button */}
              <button
                type="button"
                onClick={handleCopyText}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-300 transition-all flex items-center justify-between gap-3 text-right group cursor-pointer shadow-2xs"
                title="نسخ نص الخطة المهيكل بالكامل إلى الحافظة"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    {copied ? (
                      <Check className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Copy className="w-5 h-5 text-slate-200" />
                    )}
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-900">
                      {copied ? 'تم نسخ النص!' : 'نسخ نص الخطة كاملاً'}
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      منسق بالرموز للصق الفوري
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-600 font-bold">
                  {copied ? '✓ جاهز' : 'نسخ'}
                </span>
              </button>

              {/* Email Button */}
              <button
                type="button"
                onClick={handleEmailShare}
                className="p-3.5 rounded-2xl bg-indigo-50/80 hover:bg-indigo-100/90 border border-indigo-300 transition-all flex items-center justify-between gap-3 text-right group cursor-pointer shadow-2xs"
                title="إرسال الخطة عبر البريد الإلكتروني"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-900 group-hover:text-indigo-950">
                      البريد الإلكتروني (Email)
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      إرسال رسمي للإشراف أو الإدارة
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-indigo-700 shrink-0" />
              </button>
            </div>
          </div>

          {/* Quick Copy Link Bar */}
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-amber-950">
              <Globe className="w-4 h-4 text-amber-700 shrink-0" />
              <span>مشاركة رابط المنظومة لفتح الخطة عبر الإنترنت:</span>
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-black transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-slate-950" />
                  <span>تم نسخ الرابط!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-950" />
                  <span>نسخ الرابط</span>
                </>
              )}
            </button>
          </div>

          {/* Preview Toggle & Collapsible Box */}
          <div className="pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{showPreview ? 'إخفاء معاينة النص الموجه لتطبيقات المراسلة' : 'عرض معاينة النص المنظم المرسل للزملاء 👁️'}</span>
            </button>

            {showPreview && (
              <div className="mt-3 p-3.5 bg-slate-900 text-emerald-300 font-mono text-xs rounded-2xl max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed border border-slate-700 shadow-inner select-all">
                {planText}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-500">
          <span className="text-[11px] text-slate-600 font-medium">
            💡 تدعم المشاركة المباشرة كافة الهواتف الذكية وتطبيقات المراسلة الفورية دون الحاجة لتسجيل دخول.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors shrink-0 cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Quick floating share button for high-accessibility across mobile and desktop
 */
export const FloatingShareButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <aside
      aria-label="مشاركة خطة الدرس"
      className="fixed bottom-18 md:bottom-5 right-3 sm:right-5 z-40 flex items-center gap-2 group no-print select-none animate-in fade-in slide-in-from-bottom-3 duration-300"
    >
      <button
        type="button"
        onClick={onClick}
        title="مشاركة الخطة الحالية مع الزملاء عبر تطبيقات المراسلة (Web Share API)"
        className="flex items-center gap-2 px-3.5 py-2.5 bg-linear-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 border-2 border-white ring-4 ring-emerald-500/20 touch-manipulation cursor-pointer"
      >
        <Share2 className="w-4 h-4 text-emerald-100 group-hover:scale-110 transition-transform" />
        <span className="text-xs font-black hidden xs:inline sm:inline">مشاركة الخطة 📱</span>
      </button>
    </aside>
  );
};

