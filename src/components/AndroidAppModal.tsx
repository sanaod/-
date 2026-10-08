import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Download,
  CheckCircle2,
  Sparkles,
  Zap,
  Globe2,
  ShieldCheck,
  Layers,
  ArrowRight,
  ExternalLink,
  Laptop,
  Flame,
  Info,
  QrCode,
  Share2,
} from 'lucide-react';
import { toArabicDigits } from '../utils/arabicNumerals';

interface AndroidAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenQrModal?: () => void;
}

export const AndroidAppModal: React.FC<AndroidAppModalProps> = ({
  isOpen,
  onClose,
  onOpenQrModal,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [activeGuideTab, setActiveTab] = useState<'pwa' | 'playstore' | 'features'>('pwa');

  useEffect(() => {
    // Check if app is already running in standalone mode (installed PWA)
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallSuccess(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert(
        'لتثبيت التطبيق على جهازك الأندرويد مباشرة:\n1. اضغط على قائمة الخيارات (⋮) أعلى متصفح Chrome.\n2. اختر "التثبيت على الشاشة الرئيسية" أو "تثبيت التطبيق" (Install App).\n3. سيظهر تطبيق عبقور فوراً بين تطبيقات هاتفك!'
      );
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setInstallSuccess(true);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error('PWA install prompt error:', err);
    }
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 overflow-y-auto text-right"
    >
      <div className="bg-slate-950 border border-emerald-500/50 text-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-linear-to-r from-emerald-950 via-teal-950 to-slate-950 p-5 border-b border-emerald-800/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-['Tajawal'] text-white">
                  تطبيق أندرويد منظومة عبقور 📱
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Google Play & WebAPK
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                نسخة معتمدة ومخصصة للهواتف والأجهزة اللوحية تعمل بدون إنترنت وبسرعة فائقة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-rose-900/60 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700 hover:border-rose-500/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Main Hero Card */}
          <div className="bg-linear-to-br from-emerald-900/90 via-teal-950 to-slate-950 border-2 border-emerald-500/60 p-5 sm:p-6 rounded-3xl relative overflow-hidden shadow-xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-5 relative z-10">
              <div className="space-y-2 text-center sm:text-right">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
                  <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>تثبيت فوري على الهواتف الذكية والأجهزة اللوحية</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white font-['Tajawal']">
                  منظومة عبقور لتخطيط الدروس (Android App)
                </h3>
                <p className="text-xs text-slate-200 max-w-lg leading-relaxed">
                  احصل على التطبيق الكامل على هاتفك مباشرة بشاشة مستقلة بدون شريط المتصفح، مع إمكانية استخدام وتوليد الخطط بدون إنترنت.
                </p>
              </div>

              {/* Install Trigger Button */}
              <div className="shrink-0 w-full sm:w-auto">
                <button
                  onClick={handleInstallClick}
                  className="w-full sm:w-auto px-6 py-3.5 bg-linear-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl text-sm transition-all shadow-xl hover:shadow-2xl hover:scale-[1.03] active:scale-97 cursor-pointer flex items-center justify-center gap-2.5 border border-white/20"
                >
                  <Download className="w-5 h-5 text-slate-950 shrink-0" />
                  <span>{isInstalled ? 'التطبيق مثبت على جهازك ✓' : 'تثبيت التطبيق فوراً (1-Click)'}</span>
                </button>
              </div>
            </div>

            {installSuccess && (
              <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-400/50 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>تمت إضافة تطبيق عبقور بنجاح إلى شاشة هاتفك الرئيسية! يمكنك فتحه الآن كتطبيق مستقل.</span>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab('pwa')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeGuideTab === 'pwa'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>التثبيت المباشر (PWA App)</span>
            </button>
            <button
              onClick={() => setActiveTab('playstore')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeGuideTab === 'playstore'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <Globe2 className="w-4 h-4" />
              <span>النشر على متجر Google Play</span>
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeGuideTab === 'features'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>مميزات تطبيق الأندرويد</span>
            </button>
          </div>

          {/* Tab 1: PWA Instructions */}
          {activeGuideTab === 'pwa' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-emerald-400" />
                <span>خطوات تثبيت تطبيق الأندرويد على جميع متصفحات الهواتف:</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 font-black text-sm flex items-center justify-center border border-emerald-500/30">
                    ١
                  </div>
                  <h5 className="text-xs font-bold text-white">متصفح جوجل كروم (Chrome)</h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    افتح القائمة (⋮) أعلى اليسار، ثم اضغط على <strong>"تثبيت التطبيق"</strong> أو <strong>"إضافة إلى الشاشة الرئيسية"</strong>.
                  </p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 font-black text-sm flex items-center justify-center border border-teal-500/30">
                    ٢
                  </div>
                  <h5 className="text-xs font-bold text-white">متصفح سامسونج (Samsung Internet)</h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    اضغط على أيقونة القائمة (≡) بالأسفل ثم اختر <strong>"إضافة صفحة إلى"</strong> ➔ <strong>"الشاشة الرئيسية"</strong>.
                  </p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 font-black text-sm flex items-center justify-center border border-purple-500/30">
                    ٣
                  </div>
                  <h5 className="text-xs font-bold text-white">أجهزة آيفون و آيباد (iOS Safari)</h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    اضغط على زر المشاركة (Share) في متصفح Safari ثم اختر <strong>"Add to Home Screen"</strong>.
                  </p>
                </div>
              </div>

              {onOpenQrModal && (
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="text-xs text-slate-300">
                      تريد مسح كود الـ QR بفرع هاتفك للتثبيت؟
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenQrModal();
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
                  >
                    عرض رمز QR للهاتف
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Google Play Guide */}
          {activeGuideTab === 'playstore' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900 border border-emerald-500/30 rounded-2xl space-y-3">
                <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                  <Globe2 className="w-5 h-5 text-emerald-400" />
                  <span>دليل تحويل منظومة عبقور إلى ملف APK / AAB لنشره على متجر Google Play:</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  تم إعداد ملفات الـ Web App Manifest وأدوات PWA بالكامل وفق معايير جوجل لتقنية <strong>TWA (Trusted Web Activity)</strong> و <strong>WebAPK</strong>. يمكنك تحويل الرابط الحالي فوراً لملف تطبيق جاهز للنشر خطوة بخطوة:
                </p>

                <div className="space-y-2 text-xs text-slate-200">
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2">
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold rounded">الخطوة 1</span>
                    <span>افتح موقع PWABuilder المعني بتوليد حزم متجر Play (pwabuilder.com).</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2">
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold rounded">الخطوة 2</span>
                    <span>أدخل رابط المنظومة الحالية واضغط على <strong>Build Android Package</strong>.</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2">
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold rounded">الخطوة 3</span>
                    <span>قم بتنزيل حزمة <code>.aab</code> ورفعها على حساب جوجل بلي للناشرين (Google Play Console).</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Android App Features */}
          {activeGuideTab === 'features' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Zap className="w-4 h-4" />
                  <span>عمل كامل بدون إنترنت (Offline Ready)</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  جميع أدوات التحضير، الخطة الفصلية، والنماذج المعتمدة محفوظة محلياً وتعمل في الفصل دون الحاجة لشبكة إنترنت مستمرة.
                </p>
              </div>

              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1.5">
                <div className="flex items-center gap-2 text-blue-400 font-bold">
                  <Smartphone className="w-4 h-4" />
                  <span>شاشة مستقلة وسرعة استجابة عالية</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  واجهة تطبيق ذكية تلغي متصفح الإنترنت وتتيح أقصى مساحة رؤية وتحرير سلس للأجهزة اللوحية والهواتف.
                </p>
              </div>

              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1.5">
                <div className="flex items-center gap-2 text-purple-400 font-bold">
                  <Layers className="w-4 h-4" />
                  <span>حفظ آلي وتحديث متزامن</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  تزامن فوري لكافة دروسك ووحداتك التعليمية مع ذاكرة الجهاز لحمايتها من الضياع أو الانقطاع.
                </p>
              </div>

              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1.5">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>أمان تام وخصوصية مطلقة</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  بيانات المعلم وخططه ملك له بالكامل، مخزنة محلياً ولا يتم مشاركة ملفاته دون إذنه.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-900 border-t border-slate-800 p-4 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400">
            * يدعم أندرويد 5.0 والإصدارات الأحدث كلياً
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
