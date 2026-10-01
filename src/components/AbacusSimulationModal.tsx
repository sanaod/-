import React, { useState, useEffect } from 'react';
import {
  X,
  RotateCcw,
  Sparkles,
  Plus,
  Minus,
  Info,
  Layers,
  Thermometer,
  CloudRain,
  Flame,
  Snowflake,
  Calculator,
  BookOpen,
  Compass,
  Cpu,
} from 'lucide-react';
import { LessonPlan } from '../types/lessonPlan';
import { toArabicDigits } from '../utils/arabicNumerals';

interface AbacusSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: LessonPlan;
}

export const AbacusSimulationModal: React.FC<AbacusSimulationModalProps> = ({
  isOpen,
  onClose,
  plan,
}) => {
  const subject = plan?.header?.subject || 'الرياضيات';
  const lessonTitle = plan?.header?.lessonTitle || '';

  // Determine initial active mode according to subject
  const getInitialTab = (): 'abacus' | 'science' | 'arabic' | 'social' => {
    if (/علوم|مادة|طاقة|ماء/i.test(subject) || /مادة|ماء|خلية/i.test(lessonTitle)) {
      return 'science';
    }
    if (/عربية|لغة|قراءة|نص/i.test(subject)) {
      return 'arabic';
    }
    if (/اجتماعية|جغرافيا|فلسطين/i.test(subject)) {
      return 'social';
    }
    return 'abacus';
  };

  const [activeTab, setActiveTab] = useState<'abacus' | 'science' | 'arabic' | 'social'>('abacus');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(getInitialTab());
    }
  }, [isOpen, subject, lessonTitle]);

  // ================= State for Abacus (Math) =================
  const [ones, setOnes] = useState<number>(0);
  const [tens, setTens] = useState<number>(3);
  const [hundreds, setHundreds] = useState<number>(8);
  const [thousands, setThousands] = useState<number>(7);

  const totalValue = thousands * 1000 + hundreds * 100 + tens * 10 + ones;

  const handleAbacusPreset = (o: number, t: number, h: number, th: number) => {
    setOnes(o);
    setTens(t);
    setHundreds(h);
    setThousands(th);
  };

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

  // ================= State for Science Lab Simulator =================
  const [temperature, setTemperature] = useState<number>(25); // Celsius
  const [matterState, setMatterState] = useState<'صلبة (جليد)' | 'سائلة (ماء)' | 'غازية (بخار)'>('سائلة (ماء)');

  useEffect(() => {
    if (temperature <= 0) {
      setMatterState('صلبة (جليد)');
    } else if (temperature >= 100) {
      setMatterState('غازية (بخار)');
    } else {
      setMatterState('سائلة (ماء)');
    }
  }, [temperature]);

  // ================= State for Arabic Reading Lab =================
  const [selectedWord, setSelectedWord] = useState<string>('القُدْسُ');
  const arabicWords = [
    { word: 'القُدْسُ', root: 'ق-د-س', type: 'اسم علم ومعلم وطني', analysis: 'مبتدأ مرفوع بالضمة، زهرة المدائن وعاصمة فلسطين الأبدية.' },
    { word: 'يَتَصَاعَدُ', root: 'ص-ع-د', type: 'فعل مضارع', analysis: 'فعل مضارع مرفوع، يدل على حركة بخار الماء للأعلى في دورة الطبيعة.' },
    { word: 'المَنَازِلُ', root: 'ن-ز-ل', type: 'اسم جمع تكسير', analysis: 'مفردها منزلة، تدل على رتبة وموقع الأرقام في النظام العشري.' },
    { word: 'الجَرْمَقُ', root: 'ج-ر-م-ق', type: 'اسم جبل فلسطيني', analysis: 'أعلى قمم فلسطين بارتفاع ١٢٠٨ متراً يقع في الجليل الأعلى.' },
  ];

  if (!isOpen) return null;

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto text-right font-['Cairo',sans-serif]"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-4 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-linear-to-r from-slate-900 via-emerald-950 to-teal-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600/80 rounded-2xl text-white shadow-sm border border-emerald-400/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold font-['Tajawal']">
                  المحاكي الرقمي التفاعلي المتوافق مع المصادر
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {subject}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                أداة تفاعلية حسية لدعم مرحلتي العرض والتطبيق متوافقة مع درس: {toArabicDigits(lessonTitle || 'الدرس المستهدف')}
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

        {/* Tab switchers */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 flex flex-wrap gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('abacus')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'abacus'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>المعداد الرقمي ولوحة المنازل (الرياضيات)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('science')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'science'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>مختبر محاكاة العلوم (حالات المادة ودورة الماء)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('arabic')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'arabic'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>مختبر القراءة والتحليل اللغوي (اللغة العربية)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('social')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'social'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>أطلس ومعالم فلسطين التفاعلي (الدراسات)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* ================= TAB 1: ABACUS ================= */}
          {activeTab === 'abacus' && (
            <div className="space-y-6">
              {/* Presets */}
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-emerald-600" />
                  أمثلة واردة في خطة درس القيمة المنزلية (بالأرقام العربية المشرقية):
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleAbacusPreset(0, 3, 8, 7)}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 transition-colors shadow-2xs"
                  >
                    ٧٨٣٠ (مخيم الفارعة)
                  </button>
                  <button
                    onClick={() => handleAbacusPreset(8, 0, 2, 1)}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 transition-colors shadow-2xs"
                  >
                    ١٢٠٨ (جبل الجرمق)
                  </button>
                  <button
                    onClick={() => handleAbacusPreset(2, 7, 5, 3)}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 transition-colors shadow-2xs"
                  >
                    ٣٥٧٢ (نشاط الكتاب)
                  </button>
                  <button
                    onClick={() => handleAbacusPreset(0, 0, 0, 0)}
                    className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 rounded-lg text-xs font-bold text-slate-700 transition-colors"
                  >
                    تصفير
                  </button>
                </div>
              </div>

              {/* Total Display */}
              <div className="bg-linear-to-r from-emerald-900 to-teal-900 text-white p-5 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-emerald-200 block mb-1">العدد الإجمالي المتشكل على المعداد:</span>
                  <div className="text-3xl sm:text-4xl font-black font-['Tajawal'] tracking-wider text-white">
                    {toArabicDigits(totalValue)}
                  </div>
                </div>

                <div className="text-xs bg-white/10 px-4 py-2.5 rounded-xl backdrop-blur-xs space-y-1">
                  <div className="font-semibold text-emerald-200">الصورة الموسعة للعدد:</div>
                  <div className="font-bold text-sm text-white">
                    {toArabicDigits(ones)} + {toArabicDigits(tens * 10)} + {toArabicDigits(hundreds * 100)} + {toArabicDigits(thousands * 1000)} = {toArabicDigits(totalValue)}
                  </div>
                </div>
              </div>

              {/* Columns Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {columns.map((col, index) => (
                  <div
                    key={index}
                    className={`border-2 rounded-2xl p-3.5 flex flex-col items-center justify-between text-center ${col.lightColor} shadow-2xs`}
                  >
                    <div className="w-full pb-2 border-b border-slate-200/60 mb-2">
                      <span className="text-xs font-bold block">{col.name}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">{col.multiplierLabel}</span>
                    </div>

                    <div className="text-2xl font-black font-['Tajawal'] my-1">
                      {toArabicDigits(col.value)}
                    </div>

                    <div className="text-[11px] font-bold text-slate-600 mb-3">
                      القيمة: {toArabicDigits(col.value * col.multiplier)}
                    </div>

                    <div className="flex items-center gap-1.5 w-full">
                      <button
                        type="button"
                        onClick={() => col.setValue(Math.max(0, col.value - 1))}
                        className="flex-1 py-1.5 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 flex items-center justify-center font-bold text-slate-700 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => col.setValue(Math.min(9, col.value + 1))}
                        className={`flex-1 py-1.5 rounded-lg flex items-center justify-center font-bold transition-colors ${col.beadColor}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 2: SCIENCE LAB ================= */}
          {activeTab === 'science' && (
            <div className="space-y-6">
              <div className="bg-linear-to-r from-blue-900 to-teal-900 text-white p-5 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-blue-200 block mb-1">الحالة الفيزيائية للمادة:</span>
                  <div className="text-2xl sm:text-3xl font-black font-['Tajawal'] text-white flex items-center gap-2">
                    {matterState === 'صلبة (جليد)' && <Snowflake className="w-7 h-7 text-cyan-300" />}
                    {matterState === 'سائلة (ماء)' && <CloudRain className="w-7 h-7 text-blue-300" />}
                    {matterState === 'غازية (بخار)' && <Flame className="w-7 h-7 text-amber-300" />}
                    <span>{matterState}</span>
                  </div>
                </div>

                <div className="text-right text-xs bg-white/10 px-4 py-2 rounded-xl backdrop-blur-xs">
                  <div className="text-blue-200">درجة الحرارة الحالية:</div>
                  <div className="text-2xl font-black text-white font-['Tajawal']">
                    {toArabicDigits(temperature)} °س
                  </div>
                </div>
              </div>

              {/* Temperature Slider */}
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Thermometer className="w-4 h-4 text-rose-600" />
                    التحكم في درجة الحرارة (التسخين والتبريد):
                  </span>
                  <span>{toArabicDigits(temperature)} درجة مئوية</span>
                </div>

                <input
                  type="range"
                  min={-20}
                  max={120}
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />

                <div className="flex justify-between text-[11px] text-slate-500 font-semibold pt-1">
                  <span>-٢٠ °س (تجمد تام)</span>
                  <span>٠ °س (درجة الانصهار)</span>
                  <span>١٠٠ °س (درجة الغليان والتبخر)</span>
                </div>
              </div>

              {/* Visual Simulated Beaker */}
              <div className="border-2 border-slate-300 rounded-2xl p-6 bg-slate-900 text-white text-center space-y-3 relative overflow-hidden min-h-[160px] flex flex-col justify-center items-center">
                <div className="text-sm font-bold text-emerald-300">
                  {matterState === 'صلبة (جليد)' && 'المادة في حالة صلبة: الجسيمات متقاربة جداً وتهتز في مكانها، الشكل والحجم ثابتان.'}
                  {matterState === 'سائلة (ماء)' && 'المادة في حالة سائلة: الجسيمات تنزلق فوق بعضها البعض، تأخذ شكل الوعاء والحجم ثابت.'}
                  {matterState === 'غازية (بخار)' && 'المادة في حالة غازية: الجسيمات متباعدة جداً وتتحرك بحرية وسرعة هائلة وتنتشر في الفضاء.'}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setTemperature(-10)}
                    className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 rounded-lg text-xs font-bold text-white flex items-center gap-1"
                  >
                    <Snowflake className="w-3.5 h-3.5" />
                    تبريد (جليد)
                  </button>
                  <button
                    onClick={() => setTemperature(25)}
                    className="px-3 py-1.5 bg-teal-700 hover:bg-teal-600 rounded-lg text-xs font-bold text-white flex items-center gap-1"
                  >
                    <CloudRain className="w-3.5 h-3.5" />
                    درجة الغرفة (ماء)
                  </button>
                  <button
                    onClick={() => setTemperature(105)}
                    className="px-3 py-1.5 bg-rose-700 hover:bg-rose-600 rounded-lg text-xs font-bold text-white flex items-center gap-1"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    تسخين وغليان (بخار)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: ARABIC READING LAB ================= */}
          {activeTab === 'arabic' && (
            <div className="space-y-5">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  اختر كلمة من الدرس للتحليل الصرفي والدلالي والنحوي:
                </span>
                <div className="flex flex-wrap gap-2">
                  {arabicWords.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedWord(item.word)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        selectedWord === item.word
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {item.word}
                    </button>
                  ))}
                </div>
              </div>

              {(() => {
                const currentObj = arabicWords.find((w) => w.word === selectedWord) || arabicWords[0];
                return (
                  <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-xs text-slate-400">الكلمة المستهدفة:</span>
                        <div className="text-2xl font-black text-slate-900 font-['Tajawal']">
                          {currentObj.word}
                        </div>
                      </div>
                      <div className="text-left text-xs bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-200 font-bold">
                        الجذر اللغوي: {currentObj.root}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <strong className="text-slate-700 block mb-1">نوع الكلمة:</strong>
                        <span>{currentObj.type}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <strong className="text-slate-700 block mb-1">التحليل والسياق الدلالي:</strong>
                        <span>{currentObj.analysis}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ================= TAB 4: PALESTINE ATLAS ================= */}
          {activeTab === 'social' && (
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-3 shadow-2xs">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-600" />
                  أبرز معالم وتضاريس فلسطين الواردة في المناهج:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                    <strong className="text-emerald-950 font-bold block">جبل الجرمق (أعلى قمة في فلسطين)</strong>
                    <p className="text-slate-700">ارتفاعه ١٢٠٨ متراً يقع في الجليل الأعلى شمال فلسطين، مغطى بأشجار البلوط والسنديان.</p>
                  </div>
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                    <strong className="text-emerald-950 font-bold block">مخيم الفارعة (شمال شرق نابلس)</strong>
                    <p className="text-slate-700">يبلغ عدد سكانه ٧٨٣٠ نسمة بالقرب من ينابيع وادي الفارعة الخصبة.</p>
                  </div>
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                    <strong className="text-emerald-950 font-bold block">القدس الشريف (زهرة المدائن)</strong>
                    <p className="text-slate-700">العاصمة التاريخية والأبدية لدولة فلسطين، تضم المسجد الأقصى المبارك وكنيسة القيامة.</p>
                  </div>
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                    <strong className="text-emerald-950 font-bold block">البحر الميت (أخفض نقطة في العالم)</strong>
                    <p className="text-slate-700">ينخفض ٤٣٠ متراً تحت مستوى سطح البحر، غني بالمعادن والأملاح الطبيعية.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0 text-xs text-slate-600">
          <span>* يوظف المعلم هذا المحاكي الرقمي على شاشة الصف أو أجهزة الطلبة لتحقيق التعلم الحسي النشط.</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
          >
            إغلاق المحاكي
          </button>
        </div>
      </div>
    </div>
  );
};
