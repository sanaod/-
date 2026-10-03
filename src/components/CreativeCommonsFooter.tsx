import React, { useState } from 'react';
import { ShieldCheck, Info, Check, Award, HeartHandshake, Sparkles, ExternalLink, X } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppContactButton';

interface CreativeCommonsFooterProps {
  compact?: boolean;
}

export const CreativeCommonsFooter: React.FC<CreativeCommonsFooterProps> = ({ compact = false }) => {
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);

  return (
    <>
      <footer className={`bg-slate-900 text-slate-300 border-t border-slate-800 ${compact ? 'py-4' : 'py-8'} no-print`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Creator and Attribution Branding */}
            <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-right">
              <img
                src="/logo.png"
                alt="شعار منظومة عبقور"
                className="w-12 h-12 rounded-full object-cover shadow-lg ring-2 ring-emerald-500/40 border-2 border-amber-400 shrink-0"
              />
              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h4 className="text-sm sm:text-base font-bold text-white font-['Tajawal'] flex items-center gap-1.5">
                    <span>منظومة عبقور للتخطيط التربوي</span>
                    <span className="text-amber-400 text-xs">👑</span>
                  </h4>
                  <span className="px-2 py-0.5 text-[11px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full">
                    الحقوق محفوظة
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  جميع الحقوق محفوظة لصالح الأستاذ عبد الرحمن دويكات © ٢٠٢٦م — إعداد وتصميم: الأستاذ عبد الرحمن دويكات
                </p>
              </div>
            </div>

            {/* Creative Commons License Badge & Modal Trigger */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-2xl px-3.5 py-2">
                {/* SVG Creative Commons Icons */}
                <div className="flex items-center gap-1 text-slate-300">
                  {/* CC Icon */}
                  <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-black border border-slate-600 text-white" title="Creative Commons">
                    CC
                  </span>
                  {/* BY Icon */}
                  <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[9px] font-bold border border-slate-600 text-white" title="نسب المصنف (BY)">
                    BY
                  </span>
                  {/* NC Icon */}
                  <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[9px] font-bold border border-slate-600 text-white" title="غير تجاري (NC)">
                    NC
                  </span>
                  {/* SA Icon */}
                  <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[9px] font-bold border border-slate-600 text-white" title="الترخيص بالمثل (SA)">
                    SA
                  </span>
                </div>

                <div className="text-right text-[11px] leading-tight">
                  <span className="text-emerald-400 font-bold block">رخصة المشاع الإبداعي (CC BY-NC-SA 4.0)</span>
                  <span className="text-slate-400 text-[10px]">نَسْب الم拋نّف — غير تجاري — الترخيص بالمثل 4.0 دولية</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="https://wa.me/972569560022?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%20%D9%88%D8%B1%D8%AD%D9%85%D8%A9%20%D8%A7%D9%84%D9%84%D9%87%D8%8C%20%D8%A3%D9%88%D8%AF%20%D8%A7%D9%84%D8%AA%D9%88%D8%A7%D8%B5%D9%84%20%D9%88%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%A8%D8%AE%D8%B5%D9%88%D8%B5%20%D9%85%D9%86%D8%B8%D9%88%D9%85%D8%A9%20%D8%B9%D8%A8%D9%82%D9%88%D8%B1%20%D9%84%D9%84%D8%AA%D8%AE%D8%B7%D9%8A%D8%B7%20%D8%A7%D9%84%D8%AA%D8%B1%D8%A8%D9%88%D9%8A."
                  target="_blank"
                  rel="noopener noreferrer"
                  title="تواصل مع مصمم المنظومة عبر الواتساب"
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-97"
                >
                  <WhatsAppIcon className="w-4 h-4 text-white" />
                  <span>اتصل بنا عبر واتساب</span>
                </a>

                <button
                  type="button"
                  onClick={() => setIsLicenseModalOpen(true)}
                  className="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>تفاصيل الرخصة والحقوق</span>
                </button>
              </div>
            </div>

          </div>

          {/* Bottom disclaimer bar */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2 text-center sm:text-right">
            <span>
              تم التطوير والتصميم لخدمة المعلمين والمعلمات والمشرفين التربويين في صياغة خطط تعليمية نموذجية وتوليد المخرجات وفق أعلى معايير الجودة.
            </span>
            <span className="text-slate-400 font-medium whitespace-nowrap">
              إعداد وتصميم: أ. عبد الرحمن دويكات
            </span>
          </div>
        </div>
      </footer>

      {/* License & Rights Explanation Modal */}
      {isLicenseModalOpen && (
        <div
          dir="rtl"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto text-right font-['Cairo',sans-serif]"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-linear-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/20 rounded-2xl border border-emerald-400/30 text-emerald-300">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-['Tajawal'] text-white">
                    رخصة المشاع الإبداعي وحقوق الملكية الفكرية
                  </h3>
                  <p className="text-xs text-emerald-200/90 mt-0.5">
                    إعداد وتصميم وتطوير الأستاذ عبد الرحمن دويكات
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLicenseModalOpen(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 text-slate-700 text-sm">
              {/* Main Banner */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                <Award className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-950 text-sm">
                    الحقوق محفوظة لصالح الأستاذ عبد الرحمن دويكات
                  </h4>
                  <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                    تم إعداد وتصميم وتطوير <strong>منظومة عبقور للتخطيط التربوي وتحضير الدروس</strong> بالكامل بواسطة <strong>الأستاذ عبد الرحمن دويكات</strong> لتوفير أدوات تخطيط تربوي احترافية تدعم المعلمين وفق النماذج الوزارية المعتمدة ومعايير التميز والتقويم الأصيل.
                  </p>
                </div>
              </div>

              {/* CC License Breakdown */}
              <div className="space-y-3">
                <h5 className="font-bold text-slate-900 text-xs flex items-center gap-2 border-b border-slate-200 pb-2">
                  <HeartHandshake className="w-4 h-4 text-teal-700" />
                  <span>شروط رخصة المشاع الإبداعي (CC BY-NC-SA 4.0):</span>
                </h5>

                <div className="grid grid-cols-1 gap-2.5 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-black flex items-center justify-center shrink-0 text-[10px]">
                      BY
                    </span>
                    <div>
                      <strong className="text-slate-900">نَسْب الم拋نّف (Attribution):</strong>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        يجب نَسب العمل وذكر اسم المصمم والمعد (<strong>الأستاذ عبد الرحمن دويكات</strong>) عند مشاركة الخطط أو الاستفادة من المنظومة في أي وسيط أو شكل.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-black flex items-center justify-center shrink-0 text-[10px]">
                      NC
                    </span>
                    <div>
                      <strong className="text-slate-900">غير تجاري (Non-Commercial):</strong>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        لا يُسمح باستخدام هذه المنظومة أو مخرجاتها لأغراض تجارية أو ربحية أو إعادة بيعها دون إذن خطي مسبق من صاحب الحقوق.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-black flex items-center justify-center shrink-0 text-[10px]">
                      SA
                    </span>
                    <div>
                      <strong className="text-slate-900">الترخيص بالمثل (ShareAlike):</strong>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        إذا قمت بتعديل أو تحوير أو البناء على هذا العمل لأغراض تعليمية، يجب عليك توزيع مساهماتك بموجب نفس رخصة المشاع الإبداعي الأصلية.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-100 p-3 rounded-xl text-[11px] text-slate-600 leading-relaxed text-center">
                رخصة المشاع الإبداعي الدولية نَسب المُصنَّف - غير تجاري - الترخيص بالمثل 4.0 (Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License)
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <span className="text-xs text-slate-500">
                إعداد وتصميم: أ. عبد الرحمن دويكات
              </span>
              <button
                type="button"
                onClick={() => setIsLicenseModalOpen(false)}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                فهمت وموافق
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
