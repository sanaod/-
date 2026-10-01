import React, { useState } from 'react';
import { X, RotateCcw, Sparkles, Plus, Minus, Info } from 'lucide-react';
import { toArabicDigits } from '../utils/arabicNumerals';

interface AbacusSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AbacusSimulationModal: React.FC<AbacusSimulationModalProps> = ({ isOpen, onClose }) => {
  // Columns: Ones, Tens, Hundreds, Thousands
  const [ones, setOnes] = useState<number>(0);
  const [tens, setTens] = useState<number>(3);
  const [hundreds, setHundreds] = useState<number>(8);
  const [thousands, setThousands] = useState<number>(7);

  if (!isOpen) return null;

  const totalValue = thousands * 1000 + hundreds * 100 + tens * 10 + ones;

  const handlePreset = (o: number, t: number, h: number, th: number) => {
    setOnes(o);
    setTens(t);
    setHundreds(h);
    setThousands(th);
  };

  // The columns start strictly from الآحاد ثم العشرات ثم المئات ثم آحاد الآلاف
  const columns = [
    {
      name: 'منزلة الآحاد',
      value: ones,
      setValue: setOnes,
      multiplier: 1,
      multiplierLabel: '×١',
      color: 'bg-rose-600',
      lightColor: 'bg-rose-50 text-rose-900 border-rose-300',
      beadColor: 'bg-rose-500 hover:bg-rose-600 text-white',
    },
    {
      name: 'منزلة العشرات',
      value: tens,
      setValue: setTens,
      multiplier: 10,
      multiplierLabel: '×١٠',
      color: 'bg-blue-600',
      lightColor: 'bg-blue-50 text-blue-900 border-blue-300',
      beadColor: 'bg-blue-500 hover:bg-blue-600 text-white',
    },
    {
      name: 'منزلة المئات',
      value: hundreds,
      setValue: setHundreds,
      multiplier: 100,
      multiplierLabel: '×١٠٠',
      color: 'bg-amber-600',
      lightColor: 'bg-amber-50 text-amber-900 border-amber-300',
      beadColor: 'bg-amber-500 hover:bg-amber-600 text-white',
    },
    {
      name: 'منزلة آحاد الآلاف',
      value: thousands,
      setValue: setThousands,
      multiplier: 1000,
      multiplierLabel: '×١٠٠٠',
      color: 'bg-emerald-600',
      lightColor: 'bg-emerald-50 text-emerald-900 border-emerald-300',
      beadColor: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    },
  ];

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto text-right"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-linear-to-r from-emerald-800 to-teal-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-xs">
              <Sparkles className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-['Tajawal']">
                المعداد الرقمي التفاعلي ولوحة المنازل
              </h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                تبدأ المنازل من اليمين: الآحاد، ثم العشرات، ثم المئات، ثم آحاد الآلاف
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick Presets with Eastern Arabic Numerals */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-emerald-600" />
                أمثلة واردة في خطة درس القيمة المنزلية (بالأرقام العربية المشرقية):
              </span>
              <button
                onClick={() => handlePreset(0, 0, 0, 0)}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                تصفير المعداد
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handlePreset(0, 3, 8, 7)}
                className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg text-xs font-bold transition-colors"
              >
                مخيم الفارعة (٧٨٣٠ نسمة)
              </button>
              <button
                onClick={() => handlePreset(8, 0, 2, 1)}
                className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-lg text-xs font-bold transition-colors"
              >
                ارتفاع جبل الجرمق (١٢٠٨ م)
              </button>
              <button
                onClick={() => handlePreset(2, 7, 5, 3)}
                className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-lg text-xs font-bold transition-colors"
              >
                تدريب الاستكشاف (٣٥٧٢)
              </button>
              <button
                onClick={() => handlePreset(7, 1, 6, 8)}
                className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded-lg text-xs font-bold transition-colors"
              >
                بطاقة الخروج (٨٦١٧)
              </button>
              <button
                onClick={() => handlePreset(4, 2, 9, 3)}
                className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold transition-colors"
              >
                لغز الأذكياء (٣٩٢٤)
              </button>
            </div>
          </div>

          {/* Value Display Card with Eastern Arabic Numerals */}
          <div className="bg-linear-to-b from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-lg text-center space-y-3">
            <div className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
              العدد الإجمالي المتشكل على المعداد
            </div>
            <div className="text-6xl font-black tracking-widest text-emerald-400 font-['Cairo']">
              {toArabicDigits(totalValue)}
            </div>
            <div className="pt-2 border-t border-slate-700/80 text-sm font-medium text-slate-200 flex flex-wrap items-center justify-center gap-1.5">
              <span className="text-amber-400 font-bold ml-2">الصورة الموسعة للعدد (من الآحاد إلى الآلاف):</span>
              <span className="font-bold text-rose-300">{toArabicDigits(ones)}</span>
              <span>+</span>
              <span className="font-bold text-blue-300">{toArabicDigits(tens * 10)}</span>
              <span>+</span>
              <span className="font-bold text-amber-300">{toArabicDigits(hundreds * 100)}</span>
              <span>+</span>
              <span className="font-bold text-emerald-300">{toArabicDigits(thousands * 1000)}</span>
              <span>=</span>
              <span className="font-black text-emerald-400 text-base">{toArabicDigits(totalValue)}</span>
            </div>
          </div>

          {/* Abacus Vertical Columns: Starting from الآحاد (Right) to آحاد الآلاف (Left) */}
          <div className="grid grid-cols-4 gap-3 md:gap-4 p-4 bg-amber-50/50 rounded-2xl border-2 border-amber-200/80">
            {columns.map((col, idx) => (
              <div key={idx} className="flex flex-col items-center">
                {/* Column header */}
                <div className={`w-full text-center py-2 px-1 rounded-xl text-xs md:text-sm font-bold border ${col.lightColor}`}>
                  {col.name}
                  <div className="text-[11px] font-normal opacity-90">
                    ({col.multiplierLabel})
                  </div>
                </div>

                {/* Abacus Wire / Rod */}
                <div className="relative w-full h-56 my-3 flex flex-col justify-end items-center bg-slate-100 rounded-xl border border-slate-200 overflow-hidden shadow-inner p-2">
                  {/* Central metal rod */}
                  <div className="absolute inset-y-0 w-1.5 bg-slate-400 rounded-full shadow-xs" />

                  {/* Beads stack */}
                  <div className="z-10 w-full flex flex-col-reverse items-center gap-1 pb-1">
                    {Array.from({ length: col.value }).map((_, beadIdx) => (
                      <div
                        key={beadIdx}
                        className={`w-10 md:w-12 h-4.5 rounded-full shadow-md flex items-center justify-center text-[10px] font-bold border border-white/40 transform transition-all duration-150 ${col.beadColor}`}
                      >
                        ●
                      </div>
                    ))}
                  </div>

                  {col.value === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400 font-medium">
                      صفر (فارغ)
                    </div>
                  )}
                </div>

                {/* Counter & Controls with Eastern Arabic Digits */}
                <div className="w-full flex items-center justify-between bg-white rounded-xl p-1.5 border border-slate-200 shadow-xs">
                  <button
                    onClick={() => col.setValue(Math.max(0, col.value - 1))}
                    disabled={col.value === 0}
                    title="إنقاص خرزة"
                    className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-4 h-4 text-slate-700" />
                  </button>
                  <span className="font-black text-xl text-slate-800 font-['Cairo']">
                    {toArabicDigits(col.value)}
                  </span>
                  <button
                    onClick={() => col.setValue(Math.min(9, col.value + 1))}
                    disabled={col.value === 9}
                    title="زيادة خرزة"
                    className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4 text-slate-700" />
                  </button>
                </div>

                {/* Calculated value in Eastern Arabic Numerals */}
                <div className="mt-2 text-xs font-bold text-slate-700">
                  القيمة: {toArabicDigits(col.value * col.multiplier)}
                </div>
              </div>
            ))}
          </div>

          <div className="text-xs text-slate-600 bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl flex items-start gap-2 leading-relaxed">
            <span className="font-bold text-emerald-900 shrink-0">القاعدة الذهبية للقيمة المنزلية:</span>
            <span>
              «تبدأ المنازل من اليمين بمنزلة <strong>الآحاد</strong>، تليها <strong>العشرات</strong>، ثم <strong>المئات</strong>، ثم <strong>آحاد الآلاف</strong>. الصفر يحفظ المنزلة وتكون قيمته صفراً، وكل حركة لمنزلة جهة اليسار تضاعف قيمة الرقم بمقدار عشرة أضعاف (١٠×)».
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm transition-colors shadow-xs"
          >
            إغلاق المحاكاة
          </button>
        </div>
      </div>
    </div>
  );
};
