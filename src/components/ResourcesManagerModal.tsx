import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  BookOpen,
  FileText,
  Link as LinkIcon,
  Target,
  Sparkles,
  Plus,
  Trash2,
  Upload,
  ExternalLink,
  CheckCircle2,
  FileCheck,
  StickyNote,
  Image as ImageIcon,
  Layers,
  ArrowRight,
  Info,
  Wand2,
  GraduationCap,
} from 'lucide-react';
import { EducationalResource, ResourceType } from '../types/lessonPlan';
import { toArabicDigits } from '../utils/arabicNumerals';
import { analyzeContentLocally, InferredResourceMeta } from '../utils/resourceAnalyzer';

interface ResourcesManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  resources: EducationalResource[];
  onAddResource: (resource: EducationalResource) => void;
  onDeleteResource: (id: string) => void;
  onGenerateWithResources: (selectedResource?: EducationalResource) => void;
}

export const ResourcesManagerModal: React.FC<ResourcesManagerModalProps> = ({
  isOpen,
  onClose,
  resources,
  onAddResource,
  onDeleteResource,
  onGenerateWithResources,
}) => {
  const [activeType, setActiveType] = useState<ResourceType>('textbook');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sourceInfo, setSourceInfo] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [inferredMeta, setInferredMeta] = useState<InferredResourceMeta | null>(null);
  const [autoUpdatedNotice, setAutoUpdatedNotice] = useState<string | null>(null);
  const [isSuccessFeedback, setIsSuccessFeedback] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Automatically update titles whenever meaningful content is entered or pasted
  const applyAutoInference = (rawText: string, fileName?: string) => {
    if (!rawText || rawText.trim().length < 8) return;
    const meta = analyzeContentLocally(rawText, fileName);
    setInferredMeta(meta);

    // Auto-update title if empty or default
    setTitle(meta.title);
    if (meta.sourceInfo && !sourceInfo) {
      setSourceInfo(meta.sourceInfo);
    }
    if (meta.tags.length > 0) {
      setTagInput(meta.tags.join('، '));
    }

    setAutoUpdatedNotice(`تم تغيير العنوان تلقائياً: «${meta.title}» (${meta.subject} - ${meta.grade})`);
    setTimeout(() => setAutoUpdatedNotice(null), 3500);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    // Auto-infer if substantial text is pasted
    if (newContent.length > 25 && (!title || title.startsWith('كتاب') || title.length < 5)) {
      applyAutoInference(newContent);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    const fileSizeKb = Math.round(file.size / 1024);
    const cleanFileName = fileName.replace(/\.[^/.]+$/, '');

    setSourceInfo(`ملف مرفق: ${fileName} (${toArabicDigits(fileSizeKb)} كيلوبايت)`);

    // If text file, read text and auto-infer
    if (file.type.includes('text') || fileName.endsWith('.txt') || fileName.endsWith('.md') || fileName.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const textResult = (event.target?.result as string) || '';
        setContent(textResult);
        applyAutoInference(textResult, cleanFileName);
      };
      reader.readAsText(file);
    } else {
      const defaultContent = `[مستند مرفق: ${fileName}] - يرجى كتابة أو لصق ملخص محتوى الدرس والأهداف المراد إعداد الخطة على أساسها.`;
      setContent(defaultContent);
      applyAutoInference(cleanFileName, cleanFileName);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleManualAutoDetect = () => {
    if (!content.trim()) {
      alert('يرجى كتابة أو لصق نص المصدر أولاً ليتمكن النظام من استخراج العناوين تلقائياً.');
      return;
    }
    applyAutoInference(content);
  };

  const handleSaveResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const meta = inferredMeta || analyzeContentLocally(content);
    const tags = tagInput
      .split(/[,،]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    const newRes: EducationalResource = {
      id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      type: activeType,
      title: title.trim(),
      content: content.trim(),
      sourceInfo: sourceInfo.trim() || undefined,
      createdAt: new Date().toLocaleDateString('ar-EG'),
      tags: tags.length > 0 ? tags : meta.tags,
      inferredSubject: meta.subject,
      inferredGrade: meta.grade,
      inferredLessonTitle: meta.lessonTitle,
    };

    onAddResource(newRes);
    setTitle('');
    setContent('');
    setSourceInfo('');
    setTagInput('');
    setInferredMeta(null);
    setIsSuccessFeedback(true);
    setTimeout(() => setIsSuccessFeedback(false), 2000);
  };

  const handleApplyPreset = (preset: {
    type: ResourceType;
    title: string;
    content: string;
    info: string;
    tags: string;
    sub: string;
    grade: string;
    lesson: string;
  }) => {
    setActiveType(preset.type);
    setTitle(preset.title);
    setContent(preset.content);
    setSourceInfo(preset.info);
    setTagInput(preset.tags);
    setInferredMeta({
      title: preset.title,
      lessonTitle: preset.lesson,
      subject: preset.sub,
      grade: preset.grade,
      sourceInfo: preset.info,
      tags: preset.tags.split('، '),
    });
    setAutoUpdatedNotice(`تم تغيير العنوان للمصدر المختار: «${preset.title}»`);
    setTimeout(() => setAutoUpdatedNotice(null), 3000);
  };

  const samplePresets = [
    {
      type: 'textbook' as ResourceType,
      title: 'كتاب العلوم - درس دورة الماء في الطبيعة ص ٤٢',
      content: 'تتبخر مياه البحار والمحيطات بفعل حرارة الشمس، ثم يتصاعد بخار الماء لطبقات الجو العليا ويتكاثف ليشكل الغيوم، وعندما تبرد تسقط على شكل أمطار وثلوج وتعود للمياه الجوفية والوديان والينابيع في فلسطين.',
      info: 'المنهاج الفلسطيني للصف الرابع - الفصل الأول',
      tags: 'العلوم والحياة، بيئة، دورة الماء، الرابع الأساسي',
      sub: 'العلوم والحياة',
      grade: 'الرابع الأساسي',
      lesson: 'دورة الماء في الطبيعة والتحولات الفيزيائية',
    },
    {
      type: 'standard' as ResourceType,
      title: 'كتاب اللغة العربية - قراءة نص فلسطين قلب العروبة',
      content: 'قراءة جهرية معبرة مراعياً علامات الترقيم، استخراج الأفكار الرئيسة، والتمييز بين الجمل التي تعبر عن حقائق تاريخية عن مدن القدس ويافا وحيفا والجمل التي تعبر عن مشاعر الشاعر وعواطفه.',
      info: 'كتاب لغتنا الجميلة للصف الخامس ص ٢٨',
      tags: 'اللغة العربية، قراءة استيعابية، مهارات تفكير، الخامس الأساسي',
      sub: 'اللغة العربية',
      grade: 'الخامس الأساسي',
      lesson: 'فلسطين قلب العروبة - قراءة استيعابية وتعبير أدبي',
    },
    {
      type: 'textbook' as ResourceType,
      title: 'كتاب الرياضيات - جمع الكسور غير متجانسة المقامات',
      content: 'لجمع كسرين عاديين مقامهما مختلف، نوحد المقامات أولاً بإيجاد المضاعف المشترك الأصغر للمقامين، ثم نجمع البسطين ونبقي المقام الموحد كما هو، مع كتابة الناتج في أبسط صورة ممكنة.',
      info: 'كتاب الرياضيات للصف الخامس ص ٦٤',
      tags: 'الرياضيات، الكسور العادية، جمع الكسور، الخامس الأساسي',
      sub: 'الرياضيات',
      grade: 'الخامس الأساسي',
      lesson: 'جمع الكسور العادية غير متجانسة المقامات وطرحها',
    },
    {
      type: 'note' as ResourceType,
      title: 'كتاب التكنولوجيا - أمن المعلومات والحوسبة السحابية',
      content: 'مفهوم الأمان الرقمي وكلمات المرور القوية والتشفير، مخاطر التصيد الإلكتروني، وتطبيق قواعد الاستخدام الآمن للإنترنت في إنجاز البحوث المدرسية وحماية الخصوصية.',
      info: 'منهاج التكنولوجيا للصف السابع ص ٥٢',
      tags: 'التكنولوجيا، الأمان الرقمي، الحوسبة السحابية، السابع الأساسي',
      sub: 'التكنولوجيا',
      grade: 'السابع الأساسي',
      lesson: 'أمن المعلومات والحوسبة السحابية والأمان الرقمي',
    },
  ];

  const typeIcons: Record<ResourceType, { icon: any; label: string; color: string; bg: string }> = {
    textbook: { icon: BookOpen, label: 'كتاب مدرسي / منهاج', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
    document: { icon: FileText, label: 'ملف أو مستند مرفق', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
    link: { icon: LinkIcon, label: 'رابط أو موقع إلكتروني', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
    standard: { icon: Target, label: 'معايير ونتاجات وزارية', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
    note: { icon: StickyNote, label: 'ملاحظات وأفكار المعلم', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
    image: { icon: ImageIcon, label: 'صورة أو وسيلة بصرية', color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200' },
  };

  if (!isOpen) return null;

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto text-right"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-4 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-linear-to-r from-slate-900 via-emerald-950 to-teal-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600/80 rounded-2xl text-white shadow-sm border border-emerald-400/30">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold font-['Tajawal']">
                  مركز إضافة المصادر مع التعديل التلقائي للعناوين
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {toArabicDigits(resources.length)} مصادر مضافة
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                تغيير العناوين والمباحث تلقائياً بمجرد إرفاق نصوص الكتب أو الملفات لتوليد خطط دقيقة متطابقة مع مراجعك
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

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Top Quick Presets */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              نماذج جاهزة سريعة (انقر لتطبيق المصدر وتغيير العناوين فوراً):
            </span>
            <div className="flex flex-wrap gap-2">
              {samplePresets.map((sp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(sp)}
                  className="text-xs px-3 py-1.5 bg-white hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-300 border border-slate-200 rounded-xl text-slate-700 transition-colors shadow-2xs text-right flex items-center gap-1.5"
                >
                  <Wand2 className="w-3 h-3 text-emerald-600" />
                  <span>{sp.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Auto Updated Toast Banner */}
          {autoUpdatedNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 font-bold flex items-center gap-2 animate-fade-in shadow-2xs">
              <Wand2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{autoUpdatedNotice}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Form: Add New Resource (7 cols) */}
            <form onSubmit={handleSaveResource} className="lg:col-span-7 space-y-4">
              <div className="border border-slate-200 rounded-2xl p-4.5 bg-white shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-emerald-600" />
                    إضافة مصدر وتحديث بيانات التخطيط
                  </h4>
                  {isSuccessFeedback && (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> تم الحفظ في قائمة المصادر!
                    </span>
                  )}
                </div>

                {/* Resource Type Selector Pills */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    نوع المصدر أو المرجع:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(Object.keys(typeIcons) as ResourceType[]).map((t) => {
                      const item = typeIcons[t];
                      const Icon = item.icon;
                      const isSelected = activeType === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setActiveType(t)}
                          className={`p-2 rounded-xl text-[11px] font-bold border transition-all flex flex-col items-center gap-1 text-center ${
                            isSelected
                              ? `${item.bg} ${item.color} ring-2 ring-emerald-500 font-extrabold shadow-xs`
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Content / Excerpt First with Auto-detect trigger */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      نص المحتوى أو المقتطف أو التلخيص من الكتاب المدرسي *
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200"
                      >
                        <Upload className="w-3 h-3" />
                        رفع ملف من الجهاز
                      </button>
                      <button
                        type="button"
                        onClick={handleManualAutoDetect}
                        className="text-[11px] text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200"
                      >
                        <Wand2 className="w-3 h-3" />
                        تحديث العناوين تلقائياً
                      </button>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".txt,.md,.json,.pdf,.doc,.docx"
                      className="hidden"
                    />
                  </div>
                  <textarea
                    rows={4}
                    required
                    value={content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="الصق نص الدرس من الكتاب المدرسي، أو الأهداف والنتاجات، وسيقوم النظام فوراً بتحليل النص وتحديث العنوان والمبحث تلقائياً..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden leading-relaxed"
                  />
                </div>

                {/* Inferred Live Intelligence Bar */}
                {inferredMeta && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between text-emerald-900 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Wand2 className="w-3.5 h-3.5 text-emerald-600" />
                        تم استنتاج بيانات الدرس تلقائياً من المحتوى:
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 border-t border-emerald-200/60">
                      <div>
                        <span className="text-slate-500">المبحث: </span>
                        <strong className="text-emerald-800">{inferredMeta.subject}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">الصف: </span>
                        <strong className="text-emerald-800">{inferredMeta.grade}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">الدرس: </span>
                        <strong className="text-emerald-800 line-clamp-1">{inferredMeta.lessonTitle}</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* Title (Auto-updated or editable) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      عنوان المصدر (يتغير تلقائياً حسب المحتوى ويمكنك تعديله) *
                    </label>
                  </div>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: كتاب العلوم - حالات المادة والتحولات الفيزيائية"
                    className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-slate-50/70 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                {/* Metadata & Tags */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">
                      مرجع أو صفحة (تلقائي أو مخصص):
                    </label>
                    <input
                      type="text"
                      value={sourceInfo}
                      onChange={(e) => setSourceInfo(e.target.value)}
                      placeholder="مثال: الفصل الأول، صفحة ٤٢، نشاط (٣)"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">
                      وسوم دلالية:
                    </label>
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="مثال: علوم، تجارب، الصف الخامس"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  حفظ المصدر وتحديث العناوين المقترحة
                </button>
              </div>
            </form>

            {/* Right List: Active Resources (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  المصادر المرفقة حالياً ({toArabicDigits(resources.length)}):
                </h4>
                {resources.length > 0 && (
                  <span className="text-[11px] text-slate-500">جاهزة للاستخدام</span>
                )}
              </div>

              {resources.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50/50 space-y-2">
                  <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
                  <div className="text-xs font-bold text-slate-700">لا توجد مصادر مضافة بعد</div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    الصق مقتطف كتاب أو ارفع ملفاً، وسيتغير عنوان الدرس والمبحث تلقائياً بما يلائم المصدر.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {resources.map((res) => {
                    const iconConfig = typeIcons[res.type] || typeIcons.textbook;
                    const Icon = iconConfig.icon;
                    return (
                      <div
                        key={res.id}
                        className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs hover:border-emerald-300 transition-all space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`p-1.5 rounded-lg border ${iconConfig.bg} ${iconConfig.color}`}>
                              <Icon className="w-3.5 h-3.5" />
                            </span>
                            <div>
                              <h5 className="text-xs font-bold text-slate-900 line-clamp-1">
                                {res.title}
                              </h5>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                <span>{iconConfig.label}</span>
                                {res.inferredSubject && (
                                  <span className="bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.2 rounded-md border border-emerald-200">
                                    {res.inferredSubject}
                                  </span>
                                )}
                                {res.inferredGrade && (
                                  <span className="text-slate-400">• {res.inferredGrade}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onDeleteResource(res.id)}
                            title="حذف المصدر"
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded-xl border border-slate-100 leading-relaxed">
                          {res.content}
                        </p>

                        <div className="flex items-center justify-between pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onGenerateWithResources(res);
                            }}
                            className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 hover:underline"
                          >
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            توليد خطة درس بهذا المصدر ➜
                          </button>
                          {res.sourceInfo && (
                            <span className="text-[10px] text-slate-400">{res.sourceInfo}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-600 flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              يتم استخراج المبحث والصف وعنوان الدرس تلقائياً ونقلها مباشرة إلى نافذة التوليد.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
            >
              إغلاق
            </button>
            <button
              onClick={() => {
                onClose();
                onGenerateWithResources(resources[0]);
              }}
              className="px-5 py-2.5 bg-linear-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>توليد الخطة بالعناوين المستنتجة من المصادر</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
