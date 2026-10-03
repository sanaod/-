import React, { useState, useRef } from 'react';
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
  CheckCircle2,
  FileCheck,
  StickyNote,
  Image as ImageIcon,
  Layers,
  Info,
  Wand2,
  Video,
  Music,
  Presentation,
  FileSpreadsheet,
  FileCheck2,
  Paperclip,
  Check,
  Compass,
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
  onApplyToCurrentPlan?: (resource: EducationalResource) => void;
  currentPlanTitle?: string;
}

export const ResourcesManagerModal: React.FC<ResourcesManagerModalProps> = ({
  isOpen,
  onClose,
  resources,
  onAddResource,
  onDeleteResource,
  onGenerateWithResources,
  onApplyToCurrentPlan,
  currentPlanTitle,
}) => {
  const [activeType, setActiveType] = useState<ResourceType>('textbook');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sourceInfo, setSourceInfo] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [inferredMeta, setInferredMeta] = useState<InferredResourceMeta | null>(null);
  const [autoUpdatedNotice, setAutoUpdatedNotice] = useState<string | null>(null);
  const [isSuccessFeedback, setIsSuccessFeedback] = useState(false);
  const [attachedFileName, setAttachedFileName] = useState<string>('');
  const [attachedFileSize, setAttachedFileSize] = useState<string>('');
  const [attachedFileExt, setAttachedFileExt] = useState<string>('');
  const [attachedFileDataUrl, setAttachedFileDataUrl] = useState<string>('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [appliedResourceId, setAppliedResourceId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Automatically update titles whenever a source is attached or content entered
  const applyAutoInference = (
    rawText: string,
    fileName?: string,
    fileExt?: string,
    fileSizeStr?: string,
    dataUrl?: string
  ) => {
    const meta = analyzeContentLocally(rawText, fileName, fileExt);
    setInferredMeta(meta);

    // Auto-update title to match the attached source
    setTitle(meta.title);

    // Auto-update active type if detected
    if (meta.inferredType) {
      setActiveType(meta.inferredType);
    }

    // Auto-update sourceInfo if empty or if new file
    if (fileName && fileSizeStr) {
      setSourceInfo(`ملف مرفق: ${fileName} (${fileSizeStr})`);
    } else if (meta.sourceInfo && !sourceInfo) {
      setSourceInfo(meta.sourceInfo);
    }

    // Auto-update tags
    if (meta.tags.length > 0) {
      setTagInput(meta.tags.join('، '));
    }

    if (fileName) {
      setAttachedFileName(fileName);
      setAttachedFileExt(fileExt || (fileName.includes('.') ? fileName.split('.').pop() || '' : ''));
    }
    if (fileSizeStr) {
      setAttachedFileSize(fileSizeStr);
    }
    if (dataUrl) {
      setAttachedFileDataUrl(dataUrl);
    }

    setAutoUpdatedNotice(`تم تغيير العنوان والنوع تلقائياً ليتوافق مع المصدر: «${meta.title}» (${meta.subject} - ${meta.grade})`);
    setTimeout(() => setAutoUpdatedNotice(null), 4500);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    // Auto-infer if substantial text is pasted or if it's a URL
    if (newContent.trim().startsWith('http://') || newContent.trim().startsWith('https://')) {
      setActiveType('link');
      applyAutoInference(newContent, 'رابط إلكتروني');
    } else if (newContent.length > 15) {
      applyAutoInference(newContent, attachedFileName || undefined, attachedFileExt || undefined);
    }
  };

  const processFile = (file: File) => {
    if (!file) return;

    const fileName = file.name;
    const fileExt = fileName.includes('.') ? fileName.split('.').pop()?.toLowerCase() || '' : '';
    const sizeInKb = file.size / 1024;
    const fileSizeFormatted =
      sizeInKb > 1024
        ? `${toArabicDigits((sizeInKb / 1024).toFixed(1))} ميغابايت`
        : `${toArabicDigits(Math.round(sizeInKb))} ك.ب`;

    const cleanName = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

    // Read based on file category (supports ALL types!)
    if (
      file.type.includes('text') ||
      file.type.includes('json') ||
      ['txt', 'md', 'json', 'csv', 'xml', 'html', 'rtf'].includes(fileExt)
    ) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const textResult = (event.target?.result as string) || '';
        setContent(textResult);
        applyAutoInference(textResult, fileName, fileExt, fileSizeFormatted);
      };
      reader.readAsText(file);
    } else if (file.type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif', 'bmp'].includes(fileExt)) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = (event.target?.result as string) || '';
        const imageContent = `[وسيلة بصرية / صورة مرفقة: ${fileName}] - توظف في استثارة تفكير الطلبة والمحاكاة البصرية لموضوع الدرس وتثبيت المفاهيم.`;
        setContent(imageContent);
        applyAutoInference(cleanName, fileName, fileExt, fileSizeFormatted, dataUrl);
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('audio/') || ['mp3', 'wav', 'm4a', 'ogg', 'aac'].includes(fileExt)) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = (event.target?.result as string) || '';
        const audioContent = `[تسجيل صوتي مرفق: ${fileName}] - يوظف في مهارات الاستماع والإنصات وتنمية الذكاء اللغوي والتذوق الصوتي للدرس.`;
        setContent(audioContent);
        applyAutoInference(cleanName, fileName, fileExt, fileSizeFormatted, dataUrl);
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/') || ['mp4', 'webm', 'mov', 'avi'].includes(fileExt)) {
      const videoContent = `[مقطع فيديو تعليمي مرفق: ${fileName}] - يعرض في مرحلة التهيئة أو العرض التفاعلي لربط المفهوم بالواقع الحياتي.`;
      setContent(videoContent);
      applyAutoInference(cleanName, fileName, fileExt, fileSizeFormatted);
    } else if (['ppt', 'pptx'].includes(fileExt)) {
      const pptContent = `[عرض تقديمي PowerPoint مرفق: ${fileName}] - شرائح منظمة تتضمن أنشطة تمهيدية، تدريبات جماعية، ومخططات إيضاحية لسير الحصة.`;
      setContent(pptContent);
      applyAutoInference(cleanName, fileName, fileExt, fileSizeFormatted);
    } else if (['xls', 'xlsx'].includes(fileExt)) {
      const xlsContent = `[جدول بيانات Excel مرفق: ${fileName}] - يتضمن قوائم المعايير والدرجات وجداول قياس مؤشرات أداء الطلبة في الحصة.`;
      setContent(xlsContent);
      applyAutoInference(cleanName, fileName, fileExt, fileSizeFormatted);
    } else if (fileExt === 'pdf') {
      const pdfContent = `[وثيقة PDF مرفقة: ${fileName}] - كتاب مقرّر أو أوراق عمل مرجعية تتضمن نصوص الدرس والتمارين المعتمدة.`;
      setContent(pdfContent);
      applyAutoInference(cleanName, fileName, fileExt, fileSizeFormatted);
    } else if (['doc', 'docx'].includes(fileExt)) {
      const docContent = `[مستند Word مرفق: ${fileName}] - خطة دراسية أو ورقة عمل إثرائية وتدريبات تقويمية معتمدة.`;
      setContent(docContent);
      applyAutoInference(cleanName, fileName, fileExt, fileSizeFormatted);
    } else {
      // General fallback for ANY other format (zip, rar, epub, etc.)
      const otherContent = `[ملف تعليمي مرفق: ${fileName}] - صيغة (${fileExt.toUpperCase() || 'ملف'}). يدعم التخطيط التكاملي ومصادر التعلم.`;
      setContent(otherContent);
      applyAutoInference(cleanName, fileName, fileExt, fileSizeFormatted);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleManualAutoDetect = () => {
    if (!content.trim() && !title.trim() && !attachedFileName) {
      alert('يرجى كتابة نص، أو إدخال رابط، أو رفع ملف ليتمكن النظام من ملاءمة العناوين تلقائياً.');
      return;
    }
    applyAutoInference(content || title, attachedFileName || undefined, attachedFileExt || undefined);
  };

  const handleSaveResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const meta = inferredMeta || analyzeContentLocally(content, attachedFileName, attachedFileExt);
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
      fileName: attachedFileName || undefined,
      fileExt: attachedFileExt || undefined,
      fileSize: attachedFileSize || undefined,
      fileDataUrl: attachedFileDataUrl || undefined,
      inferredSubject: meta.subject,
      inferredGrade: meta.grade,
      inferredLessonTitle: meta.lessonTitle,
    };

    onAddResource(newRes);
    setTitle('');
    setContent('');
    setSourceInfo('');
    setTagInput('');
    setAttachedFileName('');
    setAttachedFileSize('');
    setAttachedFileExt('');
    setAttachedFileDataUrl('');
    setInferredMeta(null);
    setIsSuccessFeedback(true);
    setTimeout(() => setIsSuccessFeedback(false), 2500);
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
    setAttachedFileName('');
    setAttachedFileSize('');
    setAttachedFileExt('');
    setAttachedFileDataUrl('');
    setInferredMeta({
      title: preset.title,
      lessonTitle: preset.lesson,
      subject: preset.sub,
      grade: preset.grade,
      sourceInfo: preset.info,
      tags: preset.tags.split('، '),
      inferredType: preset.type,
    });
    setAutoUpdatedNotice(`تم تغيير العنوان والنوع تلقائياً للمصدر: «${preset.title}»`);
    setTimeout(() => setAutoUpdatedNotice(null), 3500);
  };

  const samplePresets = [
    {
      type: 'worksheet' as ResourceType,
      title: 'ورقة عمل: الرياضيات (الصف الرابع) - ضرب عدد من منزلتين في عدد من منزلة',
      content: 'أوراق عمل تدريبية تتضمن مسائل رياضية حسابية تطبيقية، واستخدام لوحة المنازل، وربط نواتج الضرب بمواقف تسوق وحساب كميات التمور والزيتون في المزارع الفلسطينية.',
      info: 'ورقة عمل علاجية وإثرائية معتمدة',
      tags: 'الرياضيات، ورقة عمل، الرابع الأساسي، ضرب الأعداد',
      sub: 'الرياضيات',
      grade: 'الصف الرابع الأساسي',
      lesson: 'ضرب عدد من منزلتين في عدد من منزلة',
    },
    {
      type: 'presentation' as ResourceType,
      title: 'عرض تقديمي: العلوم والحياة (الصف الخامس) - أجهزة جسم الإنسان',
      content: 'شرائح عرض PowerPoint تفاعلية تشرح الجهاز الهضمي والجهاز التنفسي، وظائف الأعضاء، وأهمية الغذاء المتوازن والتمارين الرياضية للحفاظ على صحة الأجهزة الحيوية.',
      info: 'عرض تقديمي PowerPoint (٢٤ شريحة)',
      tags: 'العلوم والحياة، عرض تقديمي، الخامس الأساسي، أجهزة الجسم',
      sub: 'العلوم والحياة',
      grade: 'الصف الخامس الأساسي',
      lesson: 'أجهزة جسم الإنسان ووظائفها الحيوية',
    },
    {
      type: 'audio' as ResourceType,
      title: 'تسجيل صوتي: اللغة العربية (الصف الثالث) - استماع: القدس زهرة المدائن',
      content: 'تسجيل صوتي لنص الاستماع القرائي يوضح تاريخ مدينة القدس، أسوارها وأبوابها التاريخية ومعالمها الدينية والحضارية، متبوعاً بأسئلة قياس الفهم القرائي والاستيعاب.',
      info: 'ملف صوتي MP3 عالي النقاء (٣ دقائق)',
      tags: 'اللغة العربية، استماع، ملف صوتي، الثالث الأساسي، القدس',
      sub: 'اللغة العربية',
      grade: 'الصف الثالث الأساسي',
      lesson: 'القدس زهرة المدائن - استماع وتذوق أدبي',
    },
    {
      type: 'textbook' as ResourceType,
      title: 'كتاب العلوم والحياة (الصف الرابع) - دورة الماء في الطبيعة ص ٤٢',
      content: 'تتبخر مياه البحار والمحيطات بفعل حرارة الشمس، ثم يتصاعد بخار الماء لطبقات الجو العليا ويتكاثف ليشكل الغيوم، وعندما تبرد تسقط على شكل أمطار وثلوج وتعود للمياه الجوفية والوديان والينابيع في فلسطين.',
      info: 'المنهاج الفلسطيني للصف الرابع - الفصل الأول',
      tags: 'العلوم والحياة، كتاب مدرسي، الرابع الأساسي، دورة الماء',
      sub: 'العلوم والحياة',
      grade: 'الصف الرابع الأساسي',
      lesson: 'دورة الماء في الطبيعة والتحولات الفيزيائية',
    },
    {
      type: 'exam' as ResourceType,
      title: 'اختبار تقويمي: التربية الإسلامية (الصف السادس) - أحكام التجويد وسورة لقمان',
      content: 'اختبار تقويمي قصير وبنك أسئلة حول أحكام النون الساكنة والتنوين (الإظهار والإدغام)، مع تدبر وصايا لقمان الحكيم لابنه في التواضع وبر الوالدين وإقامة الصلاة.',
      info: 'ورقة اختبار تقويمي (٢٠ علامة)',
      tags: 'التربية الإسلامية، اختبار تقويمي، السادس الأساسي، تجويد',
      sub: 'التربية الإسلامية',
      grade: 'الصف السادس الأساسي',
      lesson: 'أحكام النون الساكنة والتنوين ووصايا لقمان',
    },
    {
      type: 'link' as ResourceType,
      title: 'رابط تعليمي: التكنولوجيا - محاكي البرمجة وتصميم الخوارزميات',
      content: 'منصة ومحاكي رقمي تفاعلي لتعليم الطلبة التفكير المنطقي وبناء الخوارزميات المتسلسلة واستخدام الحلقات التكرارية والشروط البرمجية في بيئة بصرية ممتعة.',
      info: 'رابط منصة تعليمية تفاعلية',
      tags: 'التكنولوجيا، روابط تعليمية، محاكي، خوارزميات',
      sub: 'التكنولوجيا',
      grade: 'الصف السابع الأساسي',
      lesson: 'الخوارزميات والتفكير المنطقي البرمجي',
    },
  ];

  const typeConfig: Record<
    ResourceType,
    { icon: any; label: string; color: string; bg: string; badge: string }
  > = {
    textbook: { icon: BookOpen, label: 'كتاب مدرسي / منهاج', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', badge: 'كتاب' },
    curriculum_guide: { icon: Compass, label: 'دليل المعلم / خطة سنوية', color: 'text-sky-700', bg: 'bg-sky-50 border-sky-200', badge: 'دليل' },
    worksheet: { icon: FileCheck2, label: 'ورقة عمل / نشاط إثرائي', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200', badge: 'ورقة عمل' },
    presentation: { icon: Presentation, label: 'عرض تقديمي (PowerPoint)', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', badge: 'عرض PPT' },
    spreadsheet: { icon: FileSpreadsheet, label: 'جدول بيانات (Excel)', color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200', badge: 'Excel' },
    image: { icon: ImageIcon, label: 'صورة / وسيلة بصرية', color: 'text-pink-700', bg: 'bg-pink-50 border-pink-200', badge: 'صورة' },
    audio: { icon: Music, label: 'تسجيل صوتي / استماع', color: 'text-violet-700', bg: 'bg-violet-50 border-violet-200', badge: 'صوت' },
    video: { icon: Video, label: 'مقطع فيديو تعليمي', color: 'text-red-700', bg: 'bg-red-50 border-red-200', badge: 'فيديو' },
    exam: { icon: Target, label: 'اختبار / بنك أسئلة', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', badge: 'اختبار' },
    document: { icon: FileText, label: 'مستند (Word / PDF / نص)', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', badge: 'مستند' },
    link: { icon: LinkIcon, label: 'رابط أو موقع إلكتروني', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', badge: 'رابط' },
    standard: { icon: FileCheck, label: 'معايير ونتاجات وزارية', color: 'text-emerald-800', bg: 'bg-emerald-50 border-emerald-300', badge: 'معايير' },
    note: { icon: StickyNote, label: 'ملاحظات وأفكار المعلم', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200', badge: 'ملاحظة' },
  };

  const handleApplyToCurrentPlanClick = (res: EducationalResource) => {
    if (onApplyToCurrentPlan) {
      onApplyToCurrentPlan(res);
      setAppliedResourceId(res.id);
      setTimeout(() => setAppliedResourceId(null), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto text-right font-['Cairo',sans-serif]"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full border border-slate-200 overflow-hidden my-4 flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="bg-linear-to-r from-slate-900 via-emerald-950 to-teal-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600/80 rounded-2xl text-white shadow-sm border border-emerald-400/30">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold font-['Tajawal']">
                  مركز رفع جميع أنواع المصادر مع التغيير التلقائي للعناوين
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {toArabicDigits(resources.length)} مصادر متاحة
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                يدعم رفع كافة أنواع الملفات (PDF, Word, PowerPoint, Excel, صور، صوت، فيديو، وروابط) وتغيير العناوين تلقائياً لتتطابق تماماً مع المصدر
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
          {/* Quick Presets Carousel */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              نماذج جاهزة سريعة لمختلف المصادر (انقر لتطبيقها وتغيير العناوين فوراً):
            </span>
            <div className="flex flex-wrap gap-2">
              {samplePresets.map((sp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(sp)}
                  className="text-xs px-3 py-1.5 bg-white hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-300 border border-slate-200 rounded-xl text-slate-700 transition-colors shadow-2xs text-right flex items-center gap-1.5"
                >
                  <Wand2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="line-clamp-1">{sp.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Toast / Notification Banner */}
          {autoUpdatedNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 font-bold flex items-center gap-2 animate-fade-in shadow-2xs">
              <Wand2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{autoUpdatedNotice}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Form: Add/Upload Resource (7 cols) */}
            <form onSubmit={handleSaveResource} className="lg:col-span-7 space-y-4">
              <div className="border border-slate-200 rounded-2xl p-4.5 bg-white shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-emerald-600" />
                    إرفاق مصدر تعليمي (تغيير تلقائي وفوري للعناوين)
                  </h4>
                  {isSuccessFeedback && (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> تم الحفظ في بنك المصادر!
                    </span>
                  )}
                </div>

                {/* Drag & Drop Universal Upload Zone (All formats supported) */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                    isDraggingOver
                      ? 'border-emerald-500 bg-emerald-50/80 scale-[1.01]'
                      : 'border-slate-300 hover:border-emerald-400 bg-slate-50/60 hover:bg-emerald-50/20'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold text-xs mb-1">
                    <Upload className="w-4 h-4" />
                    <span>انقر لاختيار أي ملف أو اسحب وأفلت الملف هنا مباشرة</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    مسموح بجميع الأنواع: PDF, Word (doc/docx), PowerPoint (ppt/pptx), Excel (xls/xlsx), صور، صوت (mp3)، فيديو (mp4)، نصوص، وأرشيف
                  </p>
                  {attachedFileName && (
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-emerald-100/90 text-emerald-900 rounded-xl text-xs font-bold border border-emerald-300">
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>{attachedFileName} ({attachedFileSize})</span>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="*"
                    className="hidden"
                  />
                </div>

                {/* Resource Type Selector Pills (All Types Allowed) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    نوع وتصنيف المصدر (يتغير تلقائياً ويمكنك تحديده يدوياً):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 max-h-40 overflow-y-auto pr-1">
                    {(Object.keys(typeConfig) as ResourceType[]).map((t) => {
                      const item = typeConfig[t];
                      const Icon = item.icon;
                      const isSelected = activeType === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            setActiveType(t);
                            if (content.trim()) {
                              applyAutoInference(content, attachedFileName || undefined, attachedFileExt || undefined);
                            }
                          }}
                          className={`p-2 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1.5 text-right ${
                            isSelected
                              ? `${item.bg} ${item.color} ring-2 ring-emerald-500 font-extrabold shadow-xs`
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Content / Text / URL Input with Auto-detect trigger */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      نص المحتوى، المقتطف، أو الرابط الإلكتروني *
                    </label>
                    <button
                      type="button"
                      onClick={handleManualAutoDetect}
                      className="text-[11px] text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200 transition-colors"
                      title="تحليل النص وتعديل العناوين تلقائياً"
                    >
                      <Wand2 className="w-3 h-3" />
                      تحديث العناوين فوراً
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    required
                    value={content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="الصق نص الدرس، أو أهداف النشاط، أو رابط المنصة، وسيقوم النظام فوراً بتغيير العنوان والمبحث والصف ليتطابق مع المصدر..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden leading-relaxed"
                  />
                </div>

                {/* Live Preview for Image / Audio if present */}
                {attachedFileDataUrl && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[11px] font-bold text-slate-700 block mb-1.5">معاينة الملف المرفق:</span>
                    {activeType === 'image' && (
                      <img
                        src={attachedFileDataUrl}
                        alt="معاينة الصورة"
                        className="max-h-36 max-w-full rounded-lg object-contain border border-slate-300 shadow-2xs mx-auto"
                      />
                    )}
                    {activeType === 'audio' && (
                      <audio controls className="w-full h-8">
                        <source src={attachedFileDataUrl} />
                        المتصفح لا يدعم تشغيل الصوت.
                      </audio>
                    )}
                  </div>
                )}

                {/* Inferred Live Intelligence Bar */}
                {inferredMeta && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1.5 animate-fade-in">
                    <div className="flex items-center justify-between text-emerald-900 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Wand2 className="w-3.5 h-3.5 text-emerald-600" />
                        تمت مطابقة واستنتاج العناوين تلقائياً مع المصدر:
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[11px] pt-1.5 border-t border-emerald-200/60">
                      <div>
                        <span className="text-slate-500 block">المبحث الدراسي:</span>
                        <strong className="text-emerald-800 font-bold">{inferredMeta.subject}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">الصف الدراسي:</span>
                        <strong className="text-emerald-800 font-bold">{inferredMeta.grade}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">موضوع/عنوان الدرس:</span>
                        <strong className="text-emerald-800 font-bold line-clamp-1">{inferredMeta.lessonTitle}</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* Title (Automatically changed to match the source) */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    عنوان المصدر (يتغير تلقائياً ليتوافق مع المصدر المرفق) *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: ورقة عمل: الرياضيات (الصف الرابع) - القيمة المنزلية للأعداد"
                    className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-amber-50/30 border border-amber-300/80 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden shadow-2xs"
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
                      placeholder="مثال: كتاب الطالب ص ٤٢ أو ملف ورقة العمل"
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
                      placeholder="مثال: رياضيات، الصف الرابع، ضرب الأعداد"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  حفظ المصدر في المنظومة
                </button>
              </div>
            </form>

            {/* Right List: Active Resources (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  المصادر المرفوعة ({toArabicDigits(resources.length)}):
                </h4>
                {resources.length > 0 && (
                  <span className="text-[11px] text-slate-500">جاهزة للتوليد والربط</span>
                )}
              </div>

              {resources.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50/50 space-y-2">
                  <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
                  <div className="text-xs font-bold text-slate-700">لا توجد مصادر مضافة بعد</div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    ارفع أي ملف (Word, PDF, PowerPoint, Excel, صور، صوت، روابط) أو الصق نصاً، وسيتغير عنوان الدرس والمبحث تلقائياً ليتوافق مع المصدر المرفق فوراً.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                  {resources.map((res) => {
                    const iconConfig = typeConfig[res.type] || typeConfig.textbook;
                    const Icon = iconConfig.icon;
                    const isApplied = appliedResourceId === res.id;
                    return (
                      <div
                        key={res.id}
                        className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs hover:border-emerald-300 transition-all space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`p-1.5 rounded-lg border ${iconConfig.bg} ${iconConfig.color}`}>
                              <Icon className="w-4 h-4" />
                            </span>
                            <div>
                              <h5 className="text-xs font-bold text-slate-900 line-clamp-1">
                                {res.title}
                              </h5>
                              <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                                <span className={`px-1.5 py-0.2 rounded-md font-bold ${iconConfig.bg} ${iconConfig.color}`}>
                                  {iconConfig.badge}
                                </span>
                                {res.fileExt && (
                                  <span className="bg-slate-100 text-slate-700 font-extrabold px-1.5 py-0.2 rounded-md uppercase">
                                    .{res.fileExt}
                                  </span>
                                )}
                                {res.fileSize && (
                                  <span className="text-slate-400">({res.fileSize})</span>
                                )}
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

                        {/* Thumbnail preview for images */}
                        {res.fileDataUrl && res.type === 'image' && (
                          <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-100 flex justify-center">
                            <img
                              src={res.fileDataUrl}
                              alt={res.title}
                              className="max-h-24 rounded-lg object-contain"
                            />
                          </div>
                        )}

                        <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded-xl border border-slate-100 leading-relaxed">
                          {res.content}
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-slate-100 text-[11px]">
                          {/* Apply directly to current open plan */}
                          {onApplyToCurrentPlan && (
                            <button
                              type="button"
                              onClick={() => handleApplyToCurrentPlanClick(res)}
                              className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                                isApplied
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
                              }`}
                              title="تحديث عناوين الخطة المفتوحة حالياً لتتوافق مع هذا المصدر"
                            >
                              {isApplied ? <Check className="w-3 h-3" /> : <Wand2 className="w-3 h-3" />}
                              <span>{isApplied ? 'تم تحديث الخطة المفتوحة!' : 'تحديث عناوين الخطة الحالية به'}</span>
                            </button>
                          )}

                          {/* Generate with AI */}
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onGenerateWithResources(res);
                            }}
                            className="font-bold text-teal-800 hover:text-teal-950 flex items-center gap-1 hover:underline"
                          >
                            <Sparkles className="w-3 h-3 text-teal-600" />
                            توليد خطة جديدة بهذا المصدر ➜
                          </button>
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
              يتم استخراج المبحث والصف وعنوان الدرس تلقائياً ومواءمتها مع أي مصدر يتم رفعه.
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
