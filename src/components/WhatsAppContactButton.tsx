import React from 'react';

const WHATSAPP_URL =
  'https://wa.me/972569560022?text=' +
  encodeURIComponent('السلام عليكم ورحمة الله، أود التواصل والاستفسار بخصوص منظومة عبقور للتخطيط التربوي وتحضير الدروس.');

/**
 * Authentic WhatsApp vector icon
 */
export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    className={className}
  >
    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.667-.699c.974.534 1.764.847 2.793.848h.005c3.18 0 5.767-2.586 5.768-5.766.001-3.182-2.585-5.834-5.773-5.834zm0-2.172c4.418 0 8 3.582 8 8 0 4.418-3.582 8-8 8-1.396 0-2.709-.36-3.855-.989l-4.176 1.094 1.115-4.072c-.672-1.187-1.084-2.559-1.084-4.033 0-4.418 3.582-8 8-8zm3.415 11.294c-.144.406-.833.774-1.157.824-.312.048-.707.072-2.316-.583-1.874-.764-3.076-2.673-3.17-2.797-.093-.125-.758-1.009-.758-1.925 0-.916.48-1.365.651-1.551.171-.187.374-.233.499-.233.125 0 .249.002.359.007.115.006.27-.044.422.324.156.375.53 1.294.577 1.388.047.094.078.203.016.328-.063.125-.094.203-.187.312-.094.11-.198.245-.282.329-.094.094-.192.196-.083.383.11.187.487.804 1.044 1.3 1.161 1.034 2.14 1.354 2.443 1.504.303.15.481.129.66-.078.179-.208.766-.893.97-1.199.203-.306.406-.255.679-.156.273.099 1.73.816 2.027.964.297.148.495.221.568.346.073.125.073.723-.071 1.129z" />
  </svg>
);

/**
 * Header / Navbar compact contact button
 */
export const WhatsAppHeaderButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      title="اتصل بنا عبر الواتساب للاستفسارات والدعم الفني"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-97 cursor-pointer ring-1 ring-emerald-700/30 ${
        compact ? 'p-2' : ''
      }`}
    >
      <WhatsAppIcon className="w-4 h-4 text-emerald-100" />
      {!compact && <span>اتصل بنا عبر واتساب</span>}
    </a>
  );
};

/**
 * Floating WhatsApp Contact Button with subtle badge and tooltip
 */
export const FloatingWhatsAppButton: React.FC = () => {
  return (
    <aside
      aria-label="تواصل عبر الواتساب"
      className="fixed bottom-5 left-5 z-40 flex items-center gap-2 group no-print select-none animate-in fade-in slide-in-from-bottom-3 duration-300"
    >
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        title="تواصل معنا مباشرة عبر تطبيق الواتساب"
        className="flex items-center gap-2.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 border-2 border-white ring-4 ring-emerald-500/20"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-100"></span>
        </span>
        <WhatsAppIcon className="w-5 h-5 text-white shrink-0" />
        <span className="text-xs font-black font-['Tajawal'] tracking-wide">
          اتصل بنا عبر واتساب
        </span>
      </a>
    </aside>
  );
};
