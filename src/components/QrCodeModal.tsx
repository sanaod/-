import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  Globe,
  Share2,
  Sparkles,
  Palette,
  Layers,
  BookOpen,
  ShieldCheck,
} from 'lucide-react';
import QRCode from 'qrcode';
import { toArabicDigits } from '../utils/arabicNumerals';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultUrl?: string;
  appName?: string;
  designerName?: string;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  isOpen,
  onClose,
  defaultUrl = 'https://ais-pre-kqy4zj6hpoh4irugeqrjm3-635321306957.europe-west2.run.app',
  appName = 'منظومة عبقور للتخطيط التربوي',
  designerName = 'الأستاذ عبد الرحمن دويكات',
}) => {
  const [targetUrl, setTargetUrl] = useState(defaultUrl);
  const [qrColor, setQrColor] = useState('#065f46'); // emerald-800
  const [bgColor, setBgColor] = useState('#ffffff');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [badgeTitle, setBadgeTitle] = useState('مسح للوصول السريع للمنظومة (بدون تسجيل دخول)');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    QRCode.toDataURL(targetUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: qrColor,
        light: bgColor,
      },
    })
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('Error generating QR code:', err);
      });
  }, [targetUrl, qrColor, bgColor, isOpen]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadPng = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `QR_Code_${appName.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintQr = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html lang="ar" dir="rtl">
        <head>
          <title>رمز الاستجابة السريعة (QR) - ${appName}</title>
          <style>
            body { font-family: 'Cairo', Tahoma, sans-serif; text-align: center; padding: 40px; background: #fff; color: #1e293b; }
            .card { border: 3px solid #065f46; border-radius: 24px; padding: 40px; max-width: 500px; margin: 0 auto; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
            h1 { font-size: 24px; color: #065f46; margin-bottom: 8px; font-weight: 900; }
            p { font-size: 14px; color: #475569; margin-bottom: 20px; }
            .qr-img { width: 300px; height: 300px; margin: 20px auto; border: 4px solid #f1f5f9; border-radius: 16px; }
            .footer { margin-top: 20px; font-size: 12px; font-weight: bold; color: #0f172a; border-top: 1px dashed #cbd5e1; pt: 15px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>${appName}</h1>
            <p>${badgeTitle}</p>
            <img src="${qrDataUrl}" class="qr-img" alt="QR Code" />
            <div style="word-break: break-all; font-size: 11px; color: #64748b; margin-top: 10px;">${targetUrl}</div>
            <div class="footer">إعداد وتصميم: ${designerName}</div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const colorPresets = [
    { name: 'أخضر زمردي', dark: '#065f46', bg: '#ffffff' },
    { name: 'أزرق ملكي', dark: '#1e40af', bg: '#ffffff' },
    { name: 'أسود كلاسيكي', dark: '#0f172a', bg: '#ffffff' },
    { name: 'بنفسجي تقني', dark: '#581c87', bg: '#ffffff' },
  ];

  return (
    <div
      dir="rtl"
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200 text-right overflow-y-auto"
    >
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto">
        {/* Header */}
        <div className="bg-linear-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-5 flex items-center justify-between shrink-0 border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-md border border-white/20">
              <QrCode className="w-6 h-6 text-emerald-100" />
            </div>
            <div>
              <h3 className="text-lg font-black font-['Tajawal'] tracking-wide">
                تصميم وتوليد رمز الاستجابة السريعة (QR Code)
              </h3>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                شارك المنصة أو الخطط الدراسية بسهولة عبر مسح الكود بالكاميرا
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* QR Display Card */}
          <div className="flex flex-col items-center justify-center bg-linear-to-b from-slate-50 to-emerald-50/30 border-2 border-dashed border-emerald-300 rounded-3xl p-6 text-center space-y-4 shadow-xs">
            <div className="relative bg-white p-4 rounded-2xl shadow-lg border-2 border-emerald-500/30 group">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR Code للمنظومة"
                  className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-xl"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-slate-400">
                  جاري التوليد...
                </div>
              )}
              <div className="absolute -top-3 -right-3 bg-emerald-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md">
                فعّال ومضمون ⚡
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-black font-['Tajawal'] text-slate-900">
                {appName}
              </h4>
              <p className="text-xs font-semibold text-slate-600">{badgeTitle}</p>
              <p className="text-[11px] text-emerald-800 font-bold">تصميم: {designerName}</p>
            </div>
          </div>

          {/* Configuration Inputs */}
          <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-700" />
                <span>رابط الوجهة (URL):</span>
              </label>
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="أدخل الرابط أو المسار..."
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                <span>✨ رابط عام (Public URL) يفتح مباشرة لدى المعلمين والطلاب دون الحاجة لتسجيل الدخول أو المطالبة بالإيميل.</span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>العنوان الترويجي المرافق للكود:</span>
              </label>
              <input
                type="text"
                value={badgeTitle}
                onChange={(e) => setBadgeTitle(e.target.value)}
                placeholder="مثال: مسح للوصول السريع للمنظومة..."
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* Color Themes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-purple-700" />
                <span>اختر ثيم اللون:</span>
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setQrColor(preset.dark)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                      qrColor === preset.dark
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-white/40"
                      style={{ backgroundColor: preset.dark }}
                    />
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleDownloadPng}
              className="px-4 py-2.5 bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-100" />
              <span>تحميل كصورة PNG</span>
            </button>

            <button
              type="button"
              onClick={handlePrintQr}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span>طباعة ملصق QR</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-300"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>تم نسخ الرابط!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-600" />
                  <span>نسخ الرابط المباشر</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 text-center text-xs text-slate-500">
          يمكنك تضمين رمز الاستجابة السريعة (QR) في خططك الدراسية أو تقاريرك لسهولة مشاركتها مع الزملاء والطلاب.
        </div>
      </div>
    </div>
  );
};
