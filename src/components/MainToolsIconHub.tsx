/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Boxes,
  CalendarRange,
  FileUp,
  FileCheck,
  Target,
  Award,
  Clock,
  Calculator,
  Layers,
  LayoutDashboard,
  Users2,
  FileEdit,
  FolderKanban,
  Printer,
  FileDown,
  Database,
  Upload,
  Clapperboard,
  QrCode,
  RotateCcw,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  LayoutGrid,
  ListFilter,
  SlidersHorizontal,
  X,
  Compass,
  Zap,
  Sunrise,
  BookOpen,
  GraduationCap,
  Smartphone,
} from 'lucide-react';
import { toArabicDigits } from '../utils/arabicNumerals';

export type ToolCategory = 'all' | 'ai' | 'assessment' | 'resources' | 'management';

export interface MainToolsIconHubProps {
  onOpenAiModal: () => void;
  onOpenUnitPlanModal: () => void;
  onOpenSemesterPlanModal: () => void;
  onOpenAcademicMilestonesModal?: () => void;
  onOpenAndroidAppModal?: () => void;
  onOpenCurriculumPdfExtractor: () => void;
  onOpenWorksheetModal: () => void;
  onOpenAssessmentSimulatorModal: () => void;
  onOpenAuthenticTaskModal: () => void;
  onOpenRubricModal: () => void;
  onOpenExitTicketModal: () => void;
  onOpenAbacusModal: () => void;
  onOpenResourcesModal: () => void;
  resourcesCount?: number;
  onOpenDashboard: () => void;
  onOpenParentCardModal: () => void;
  onOpenBlankModal: () => void;
  onOpenPlansViewer: () => void;
  totalPlansCount?: number;
  onOpenPrintView: () => void;
  onOpenExportModal: () => void;
  onOpenBackupRestoreModal: () => void;
  onOpenMotionGraphicsModal: () => void;
  onOpenQrModal: () => void;
  onClearCurrentPlan: () => void;
  onDeleteCurrentPlan: () => void;
}

export interface ToolItem {
  id: string;
  category: ToolCategory;
  title: string;
  subtitle: string;
  badge?: string;
  badgeType?: 'primary' | 'success' | 'warning' | 'info' | 'accent' | 'danger';
  icon: React.ComponentType<{ className?: string }>;
  colorGradient: string;
  borderColor: string;
  hoverBorder: string;
  iconBg: string;
  iconColor: string;
  action: () => void;
  keywords: string[];
}

export const MainToolsIconHub: React.FC<MainToolsIconHubProps> = ({
  onOpenAiModal,
  onOpenUnitPlanModal,
  onOpenSemesterPlanModal,
  onOpenAcademicMilestonesModal,
  onOpenAndroidAppModal,
  onOpenCurriculumPdfExtractor,
  onOpenWorksheetModal,
  onOpenAssessmentSimulatorModal,
  onOpenAuthenticTaskModal,
  onOpenRubricModal,
  onOpenExitTicketModal,
  onOpenAbacusModal,
  onOpenResourcesModal,
  resourcesCount = 0,
  onOpenDashboard,
  onOpenParentCardModal,
  onOpenBlankModal,
  onOpenPlansViewer,
  totalPlansCount = 1,
  onOpenPrintView,
  onOpenExportModal,
  onOpenBackupRestoreModal,
  onOpenMotionGraphicsModal,
  onOpenQrModal,
  onClearCurrentPlan,
  onDeleteCurrentPlan,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [layoutMode, setLayoutMode] = useState<'stacked' | 'grid' | 'compact'>('stacked');

  // Master definition of all 22 system tools
  const tools: ToolItem[] = useMemo(() => [
    // 1. AI Planning & Curriculum
    {
      id: 'ai-lesson',
      category: 'ai',
      title: 'تحضير درس بالـ AI',
      subtitle: 'خطة متكاملة للأقسام الـ 6',
      badge: 'AI فوري ⚡',
      badgeType: 'primary',
      icon: Sparkles,
      colorGradient: 'from-emerald-900/95 via-teal-950 to-slate-950',
      borderColor: 'border-emerald-500/70',
      hoverBorder: 'hover:border-emerald-400',
      iconBg: 'bg-emerald-600/40 border-emerald-400/40',
      iconColor: 'text-amber-300',
      action: onOpenAiModal,
      keywords: ['تحضير', 'درس', 'ذكاء', 'توليد', 'خطة', 'ai', 'فوري', 'معايير'],
    },
    {
      id: 'ai-unit',
      category: 'ai',
      title: 'تحضير وحدة كاملة',
      subtitle: 'وحدة شاملة مع رفع المصادر',
      badge: 'وحدة (AI) 📦',
      badgeType: 'info',
      icon: Boxes,
      colorGradient: 'from-blue-950/95 via-indigo-950 to-slate-950',
      borderColor: 'border-blue-500/70',
      hoverBorder: 'hover:border-blue-400',
      iconBg: 'bg-blue-600/40 border-blue-400/40',
      iconColor: 'text-blue-200',
      action: onOpenUnitPlanModal,
      keywords: ['وحدة', 'كاملة', 'مجموع', 'دروس', 'فصل', 'شامل', 'ai'],
    },
    {
      id: 'semester-plan',
      category: 'ai',
      title: 'الخطة الفصلية وتوزيع الحصص',
      subtitle: 'دليل توزيع الحصص بالتقويم الفلسطيني',
      badge: 'فصلي 🇵🇸',
      badgeType: 'success',
      icon: CalendarRange,
      colorGradient: 'from-teal-950/95 via-emerald-950 to-cyan-950',
      borderColor: 'border-teal-500/70',
      hoverBorder: 'hover:border-cyan-400',
      iconBg: 'bg-teal-600/40 border-teal-400/40',
      iconColor: 'text-cyan-200',
      action: onOpenSemesterPlanModal,
      keywords: ['فصلية', 'حصص', 'توزيع', 'تقويم', 'فلسطين', 'فصل', 'دليل'],
    },
    {
      id: 'academic-start',
      category: 'management',
      title: 'بداية العام الدراسي',
      subtitle: 'افتتاح العام والافتتاحية والتهيئة الصفية',
      badge: 'بداية العام 🌅',
      badgeType: 'success',
      icon: Sunrise,
      colorGradient: 'from-emerald-950/95 via-teal-950 to-slate-950',
      borderColor: 'border-emerald-500/70',
      hoverBorder: 'hover:border-emerald-400',
      iconBg: 'bg-emerald-600/40 border-emerald-400/40',
      iconColor: 'text-emerald-300',
      action: onOpenAcademicMilestonesModal || onOpenSemesterPlanModal,
      keywords: ['بداية', 'عام', 'دراسي', 'افتتاح', 'تهيئة', 'انطلاقة', 'توزيع'],
    },
    {
      id: 'semester-1',
      category: 'management',
      title: 'الفصل الدراسي الأول',
      subtitle: 'تحضيرات ونتاجات وتقويم الفصل الأول',
      badge: 'الفصل الأول 📘',
      badgeType: 'info',
      icon: BookOpen,
      colorGradient: 'from-blue-950/95 via-indigo-950 to-slate-950',
      borderColor: 'border-blue-500/70',
      hoverBorder: 'hover:border-blue-400',
      iconBg: 'bg-blue-600/40 border-blue-400/40',
      iconColor: 'text-blue-200',
      action: onOpenAcademicMilestonesModal || onOpenSemesterPlanModal,
      keywords: ['فصل', 'أول', 'دراسي', 'تحضير', 'اختبارات', 'نصف', 'نتاجات'],
    },
    {
      id: 'semester-2',
      category: 'management',
      title: 'الفصل الدراسي الثاني',
      subtitle: 'خطة ونتاجات ومشاريع الفصل الثاني',
      badge: 'الفصل الثاني 🧭',
      badgeType: 'accent',
      icon: Compass,
      colorGradient: 'from-purple-950/95 via-fuchsia-950 to-slate-950',
      borderColor: 'border-purple-500/70',
      hoverBorder: 'hover:border-purple-400',
      iconBg: 'bg-purple-600/40 border-purple-400/40',
      iconColor: 'text-purple-200',
      action: onOpenAcademicMilestonesModal || onOpenSemesterPlanModal,
      keywords: ['فصل', 'ثاني', 'دراسي', 'مشاريع', 'معارض', 'تخرج', 'تعمق'],
    },
    {
      id: 'academic-end',
      category: 'management',
      title: 'نهاية العام الدراسي',
      subtitle: 'الختام وحفل الحصاد وتكريم المتفوقين',
      badge: 'نهاية العام 🏆',
      badgeType: 'warning',
      icon: Award,
      colorGradient: 'from-amber-950/95 via-rose-950 to-slate-950',
      borderColor: 'border-amber-500/70',
      hoverBorder: 'hover:border-amber-400',
      iconBg: 'bg-amber-600/40 border-amber-400/40',
      iconColor: 'text-amber-300',
      action: onOpenAcademicMilestonesModal || onOpenDashboard,
      keywords: ['نهاية', 'عام', 'ختام', 'حصاد', 'تكريم', 'متفوقين', 'شهادات', 'أرشيف'],
    },
    {
      id: 'android-app',
      category: 'management',
      title: 'تطبيق أندرويد (Google Play)',
      subtitle: 'نسخة الهاتف المستقلة وتعمل بدون إنترنت',
      badge: 'أندرويد 📱',
      badgeType: 'success',
      icon: Smartphone,
      colorGradient: 'from-emerald-950/95 via-teal-950 to-slate-950',
      borderColor: 'border-emerald-500/80',
      hoverBorder: 'hover:border-emerald-400',
      iconBg: 'bg-emerald-600/40 border-emerald-400/40',
      iconColor: 'text-emerald-300',
      action: onOpenAndroidAppModal || (() => alert('جارِ فتح تثبيت تطبيق أندرويد...')),
      keywords: ['تطبيق', 'أندرويد', 'اندرويد', 'جوجل', 'بلي', 'play', 'android', 'apk', 'pwa', 'هاتف', 'تثبيت'],
    },
    {
      id: 'curriculum-extractor',
      category: 'ai',
      title: 'استخراج منهاج PDF',
      subtitle: 'تحويل وتوزيع المناهج آلياً',
      badge: 'PDF ذكي ⚡',
      badgeType: 'warning',
      icon: FileUp,
      colorGradient: 'from-cyan-950/95 via-teal-950 to-slate-950',
      borderColor: 'border-cyan-400/80',
      hoverBorder: 'hover:border-cyan-300',
      iconBg: 'bg-cyan-600/40 border-cyan-400/40',
      iconColor: 'text-cyan-200',
      action: onOpenCurriculumPdfExtractor,
      keywords: ['pdf', 'استخراج', 'منهاج', 'رفع', 'كتاب', 'جداول', 'توزيع'],
    },
    {
      id: 'interactive-worksheets',
      category: 'ai',
      title: 'أوراق عمل AI',
      subtitle: 'أنشطة وتمارين متمايزة',
      badge: 'أوراق عمل 📝',
      badgeType: 'accent',
      icon: FileCheck,
      colorGradient: 'from-teal-950/95 via-slate-900 to-slate-950',
      borderColor: 'border-teal-500/60',
      hoverBorder: 'hover:border-teal-400',
      iconBg: 'bg-teal-700/40 border-teal-400/40',
      iconColor: 'text-teal-200',
      action: onOpenWorksheetModal,
      keywords: ['أوراق', 'عمل', 'أنشطة', 'تمارين', 'تدريبات', 'متمايزة'],
    },
    {
      id: 'motion-graphics',
      category: 'ai',
      title: 'فيديو موشن جرافيك',
      subtitle: 'توليد فيديو تعليمي متحرك للدرس',
      badge: 'موشن 🎬',
      badgeType: 'primary',
      icon: Clapperboard,
      colorGradient: 'from-purple-950/95 via-indigo-950 to-slate-950',
      borderColor: 'border-purple-500/70',
      hoverBorder: 'hover:border-purple-400',
      iconBg: 'bg-purple-700/40 border-purple-400/40',
      iconColor: 'text-purple-200',
      action: onOpenMotionGraphicsModal,
      keywords: ['موشن', 'جرافيك', 'فيديو', 'متحرك', 'شرح', 'سيناريو'],
    },

    // 2. Assessment & Measurement
    {
      id: 'assessment-simulator',
      category: 'assessment',
      title: 'محاكي التقويم التربوي',
      subtitle: 'تقويم هجري/ميلادي وسحب وإفلات',
      badge: 'هجري/ميلادي 🗓️',
      badgeType: 'warning',
      icon: CalendarRange,
      colorGradient: 'from-amber-950/95 via-emerald-950 to-teal-950',
      borderColor: 'border-amber-400/80',
      hoverBorder: 'hover:border-amber-300',
      iconBg: 'bg-amber-500/30 border-amber-400/50',
      iconColor: 'text-amber-300',
      action: onOpenAssessmentSimulatorModal,
      keywords: ['محاكي', 'تقويم', 'هجري', 'ميلادي', 'سحب', 'إفلات', 'جدولة', 'مهام'],
    },
    {
      id: 'grasps-tasks',
      category: 'assessment',
      title: 'المهام الأصيلة (GRASPS)',
      subtitle: 'مواقف سياقية واقعية',
      badge: 'GRASPS 🎯',
      badgeType: 'accent',
      icon: Target,
      colorGradient: 'from-purple-950/95 via-slate-900 to-indigo-950',
      borderColor: 'border-purple-500/60',
      hoverBorder: 'hover:border-purple-400',
      iconBg: 'bg-purple-700/40 border-purple-400/40',
      iconColor: 'text-pink-200',
      action: onOpenAuthenticTaskModal,
      keywords: ['grasps', 'مهام', 'أصيلة', 'واقعية', 'دور', 'جمهور', 'سياق'],
    },
    {
      id: 'rubrics',
      category: 'assessment',
      title: 'سلم التقدير (Rubric)',
      subtitle: 'المعايير الوزارية ٤ مستويات',
      badge: 'Rubric 🏆',
      badgeType: 'info',
      icon: Award,
      colorGradient: 'from-indigo-950/95 via-slate-900 to-purple-950',
      borderColor: 'border-indigo-500/60',
      hoverBorder: 'hover:border-indigo-400',
      iconBg: 'bg-indigo-700/40 border-indigo-400/40',
      iconColor: 'text-indigo-200',
      action: onOpenRubricModal,
      keywords: ['سلم', 'تقدير', 'روبك', 'rubric', 'مستويات', 'معايير'],
    },
    {
      id: 'exit-tickets',
      category: 'assessment',
      title: 'بطاقة الخروج (Exit Ticket)',
      subtitle: 'تقويم تكويني ختامي سريع',
      badge: 'ختام الحصة ⏱️',
      badgeType: 'accent',
      icon: Clock,
      colorGradient: 'from-slate-900 via-slate-950 to-purple-950',
      borderColor: 'border-slate-700',
      hoverBorder: 'hover:border-purple-400',
      iconBg: 'bg-purple-800/40 border-purple-500/40',
      iconColor: 'text-purple-300',
      action: onOpenExitTicketModal,
      keywords: ['بطاقة', 'خروج', 'تذكرة', 'تكويني', 'ختامي', 'exit', 'ticket'],
    },

    // 3. Curriculum, Resources & Simulators
    {
      id: 'resources-bank',
      category: 'resources',
      title: 'بنك المصادر والمناهج',
      subtitle: 'رفع المراجع والكتب والدلائل',
      badge: `+${toArabicDigits(resourcesCount)} مراجع 📚`,
      badgeType: 'success',
      icon: Layers,
      colorGradient: 'from-emerald-900 via-teal-900 to-emerald-950',
      borderColor: 'border-emerald-400/80',
      hoverBorder: 'hover:border-emerald-300',
      iconBg: 'bg-white/20 border-emerald-200/40',
      iconColor: 'text-emerald-100',
      action: onOpenResourcesModal,
      keywords: ['مصادر', 'مناهج', 'مراجع', 'كتب', 'رفع', 'بنك'],
    },
    {
      id: 'abacus-simulator',
      category: 'resources',
      title: 'المحاكي الرقمي التفاعلي',
      subtitle: 'المعداد ولوحة المنازل والمختبرات',
      badge: 'محاكاة 🧮',
      badgeType: 'success',
      icon: Calculator,
      colorGradient: 'from-slate-900 via-slate-950 to-emerald-950',
      borderColor: 'border-slate-700',
      hoverBorder: 'hover:border-emerald-400',
      iconBg: 'bg-emerald-800/40 border-emerald-500/40',
      iconColor: 'text-emerald-300',
      action: onOpenAbacusModal,
      keywords: ['محاكي', 'معداد', 'حاسبة', 'رقمي', 'منازل', 'تفاعلي', 'رياضيات'],
    },
    {
      id: 'parent-card',
      category: 'resources',
      title: 'الشراكة الأسرية',
      subtitle: 'بطاقة متابعة ولي الأمر التفاعلية',
      badge: 'تواصل منزلي 👨‍👩‍👧',
      badgeType: 'info',
      icon: Users2,
      colorGradient: 'from-slate-900 via-slate-950 to-indigo-950',
      borderColor: 'border-slate-700',
      hoverBorder: 'hover:border-indigo-400',
      iconBg: 'bg-indigo-800/40 border-indigo-500/40',
      iconColor: 'text-indigo-300',
      action: onOpenParentCardModal,
      keywords: ['أسرة', 'ولي', 'أمر', 'متابعة', 'منزل', 'شراكة', 'بيت'],
    },
    {
      id: 'qr-generator',
      category: 'resources',
      title: 'رمز الاستجابة السريعة (QR)',
      subtitle: 'مشاركة المنظومة بدون تسجيل دخول',
      badge: 'QR كود 📱',
      badgeType: 'primary',
      icon: QrCode,
      colorGradient: 'from-teal-950 via-slate-900 to-slate-950',
      borderColor: 'border-teal-500/60',
      hoverBorder: 'hover:border-teal-400',
      iconBg: 'bg-teal-700/40 border-teal-400/40',
      iconColor: 'text-teal-200',
      action: onOpenQrModal,
      keywords: ['qr', 'باركود', 'مشاركة', 'سريع', 'هاتف', 'رمز'],
    },

    // 4. Management, Productivity & Print
    {
      id: 'teacher-dashboard',
      category: 'management',
      title: 'لوحة الإنتاجية والإحصاءات',
      subtitle: 'تحليلات المعلم والتقويم الشهري',
      badge: 'لوحة متكاملة 📊',
      badgeType: 'primary',
      icon: LayoutDashboard,
      colorGradient: 'from-slate-900 via-slate-950 to-teal-950',
      borderColor: 'border-slate-700',
      hoverBorder: 'hover:border-teal-400',
      iconBg: 'bg-teal-800/40 border-teal-500/40',
      iconColor: 'text-teal-300',
      action: onOpenDashboard,
      keywords: ['لوحة', 'إنتاجية', 'إحصاءات', 'معلم', 'تقويم', 'مجلدات', 'سحب'],
    },
    {
      id: 'official-print',
      category: 'management',
      title: 'معاينة وطباعة A4 (PDF)',
      subtitle: 'الاستمارة الرسمية المعتمدة',
      badge: 'طباعة فورية 🖨️',
      badgeType: 'primary',
      icon: Printer,
      colorGradient: 'from-slate-900 via-slate-950 to-emerald-950',
      borderColor: 'border-slate-700',
      hoverBorder: 'hover:border-emerald-400',
      iconBg: 'bg-emerald-700/40 border-emerald-400/40',
      iconColor: 'text-emerald-300',
      action: onOpenPrintView,
      keywords: ['طباعة', 'pdf', 'a4', 'معاينة', 'رسمية', 'استمارة'],
    },
    {
      id: 'blank-template',
      category: 'management',
      title: 'استمارة مفرغة معتمدة',
      subtitle: 'نموذج وزاري فارغ جاهز للبدء',
      badge: 'نموذج فارغ 📌',
      badgeType: 'warning',
      icon: FileEdit,
      colorGradient: 'from-amber-950/95 via-slate-950 to-slate-900',
      borderColor: 'border-amber-500/70',
      hoverBorder: 'hover:border-amber-400',
      iconBg: 'bg-amber-600/40 border-amber-400/40',
      iconColor: 'text-amber-300',
      action: onOpenBlankModal,
      keywords: ['مفرغة', 'فارغ', 'استمارة', 'نموذج', 'جاهز', 'بدء'],
    },
    {
      id: 'plans-viewer',
      category: 'management',
      title: 'سجل واستعراض الخطط',
      subtitle: 'تبديل وإدارة الخطط المحفوظة',
      badge: `${toArabicDigits(totalPlansCount)} خطة 🗂️`,
      badgeType: 'info',
      icon: FolderKanban,
      colorGradient: 'from-slate-900 via-slate-950 to-emerald-950',
      borderColor: 'border-slate-700',
      hoverBorder: 'hover:border-emerald-400',
      iconBg: 'bg-emerald-800/40 border-emerald-500/40',
      iconColor: 'text-emerald-300',
      action: onOpenPlansViewer,
      keywords: ['سجل', 'خطط', 'استعراض', 'تبديل', 'محفوظة', 'إدارة'],
    },
    {
      id: 'export-hub',
      category: 'management',
      title: 'مركز التصدير (Word/JSON)',
      subtitle: 'تنزيل بصيغ متعددة',
      badge: 'Word و PDF 💾',
      badgeType: 'info',
      icon: FileDown,
      colorGradient: 'from-blue-950/95 via-slate-950 to-slate-900',
      borderColor: 'border-blue-500/70',
      hoverBorder: 'hover:border-blue-400',
      iconBg: 'bg-blue-800/40 border-blue-500/40',
      iconColor: 'text-blue-300',
      action: onOpenExportModal,
      keywords: ['تصدير', 'word', 'doc', 'json', 'تنزيل', 'حفظ'],
    },
    {
      id: 'backup-restore',
      category: 'management',
      title: 'نسخ احتياطي واستيراد',
      subtitle: 'حفظ واستعادة كافة الخطط الموحدة',
      badge: 'نسخ شامل 🛡️',
      badgeType: 'warning',
      icon: Database,
      colorGradient: 'from-amber-950/95 via-slate-950 to-slate-900',
      borderColor: 'border-amber-400/70',
      hoverBorder: 'hover:border-amber-300',
      iconBg: 'bg-amber-600/40 border-amber-300/40',
      iconColor: 'text-amber-300',
      action: onOpenBackupRestoreModal,
      keywords: ['نسخ', 'احتياطي', 'استيراد', 'استرجاع', 'json', 'قاعدة'],
    },
    {
      id: 'clear-plan',
      category: 'management',
      title: 'تفريغ ومسح الحقول',
      subtitle: 'بدء إدخال جديد من الصفر',
      badge: 'تصفير 🔄',
      badgeType: 'accent',
      icon: RotateCcw,
      colorGradient: 'from-slate-900 via-slate-950 to-amber-950',
      borderColor: 'border-slate-700',
      hoverBorder: 'hover:border-amber-400',
      iconBg: 'bg-amber-800/40 border-amber-500/40',
      iconColor: 'text-amber-300',
      action: onClearCurrentPlan,
      keywords: ['تفريغ', 'مسح', 'تصفير', 'بدء', 'جديد', 'صفر'],
    },
    {
      id: 'delete-plan',
      category: 'management',
      title: 'حذف الخطة المعروضة',
      subtitle: 'تراجع أو حذف عند الحاجة',
      badge: 'حذف 🗑️',
      badgeType: 'danger',
      icon: Trash2,
      colorGradient: 'from-rose-950/90 via-slate-950 to-slate-900',
      borderColor: 'border-rose-600/50',
      hoverBorder: 'hover:border-rose-400',
      iconBg: 'bg-rose-800/40 border-rose-500/40',
      iconColor: 'text-rose-300',
      action: onDeleteCurrentPlan,
      keywords: ['حذف', 'تراجع', 'إزالة', 'مسح', 'خطة'],
    },
  ], [
    onOpenAiModal,
    onOpenUnitPlanModal,
    onOpenSemesterPlanModal,
    onOpenCurriculumPdfExtractor,
    onOpenWorksheetModal,
    onOpenAssessmentSimulatorModal,
    onOpenAuthenticTaskModal,
    onOpenRubricModal,
    onOpenExitTicketModal,
    onOpenAbacusModal,
    onOpenResourcesModal,
    resourcesCount,
    onOpenDashboard,
    onOpenParentCardModal,
    onOpenBlankModal,
    onOpenPlansViewer,
    totalPlansCount,
    onOpenPrintView,
    onOpenExportModal,
    onOpenBackupRestoreModal,
    onOpenMotionGraphicsModal,
    onOpenQrModal,
    onClearCurrentPlan,
    onDeleteCurrentPlan,
  ]);

  // Category metadata for stacked tier display
  const CATEGORY_SECTIONS = useMemo(() => [
    {
      id: 'ai' as const,
      title: 'مسار التخطيط والذكاء الاصطناعي والتحضير الفصلي',
      badge: 'الذكاء الاصطناعي ⚡',
      icon: Sparkles,
      description: 'توليد الخطط النموذجية، الوحدات الكاملة، دليل التوزيع الفصلي، استخراج المناهج وأوراق العمل بالفيديو التفاعلي',
      headerBg: 'bg-emerald-950/60 border-emerald-500/30',
      badgeStyle: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
      iconBg: 'bg-emerald-600/30 border-emerald-400/30',
      iconColor: 'text-amber-300',
      tierBorder: 'border-emerald-600/40 hover:border-emerald-500/70',
    },
    {
      id: 'assessment' as const,
      title: 'مسار التقويم التربوي والمهام الأصيلة والمحاكاة',
      badge: 'التقويم والقياس 🎯',
      icon: CalendarRange,
      description: 'محاكي التقويم التربوي (هجري/ميلادي)، مهام التقويم الأصيل GRASPS، سلالم التقدير Rubric، وبطاقات ختام الحصة',
      headerBg: 'bg-amber-950/60 border-amber-500/30',
      badgeStyle: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
      iconBg: 'bg-amber-600/30 border-amber-400/30',
      iconColor: 'text-amber-300',
      tierBorder: 'border-amber-600/40 hover:border-amber-500/70',
    },
    {
      id: 'resources' as const,
      title: 'مسار المناهج والمصادر الرقمية والشراكة الأسرية',
      badge: 'المناهج والوسائل 📚',
      icon: Layers,
      description: 'بنك المصادر والكتب المرفوعة، المحاكي الرقمي التفاعلي (المعداد)، بطاقات متابعة ولي الأمر، ورمز QR',
      headerBg: 'bg-teal-950/60 border-teal-500/30',
      badgeStyle: 'bg-teal-500/20 text-teal-300 border-teal-400/40',
      iconBg: 'bg-teal-600/30 border-teal-400/30',
      iconColor: 'text-teal-300',
      tierBorder: 'border-teal-600/40 hover:border-teal-500/70',
    },
    {
      id: 'management' as const,
      title: 'مسار الإدارة والإنتاجية والمخرجات الرسمية والطباعة',
      badge: 'الإنتاجية والإدارة 🖨️',
      icon: LayoutDashboard,
      description: 'لوحة الإنتاجية والإحصاءات، الاستمارة المفرغة المعتمدة، الطباعة الرسمية A4، والتصدير والنسخ الاحتياطي الشامل',
      headerBg: 'bg-blue-950/60 border-blue-500/30',
      badgeStyle: 'bg-blue-500/20 text-blue-300 border-blue-400/40',
      iconBg: 'bg-blue-600/30 border-blue-400/30',
      iconColor: 'text-blue-300',
      tierBorder: 'border-blue-600/40 hover:border-blue-500/70',
    },
  ], []);

  // Filter tools based on category and search query
  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const inTitle = tool.title.toLowerCase().includes(q);
      const inSubtitle = tool.subtitle.toLowerCase().includes(q);
      const inKeywords = tool.keywords.some((k) => k.toLowerCase().includes(q));
      return inTitle || inSubtitle || inKeywords;
    });
  }, [tools, selectedCategory, searchQuery]);

  // Render individual tool card
  const renderToolCard = (tool: ToolItem, isCompact = false) => {
    const Icon = tool.icon;
    if (isCompact) {
      return (
        <button
          key={tool.id}
          type="button"
          onClick={tool.action}
          className={`group px-3 py-2 bg-linear-to-br ${tool.colorGradient} border ${tool.borderColor} ${tool.hoverBorder} rounded-xl text-right flex items-center justify-between gap-2 transition-all hover:scale-[1.02] hover:shadow-md active:scale-95 cursor-pointer shadow-xs select-none touch-manipulation min-h-[46px]`}
          title={`${tool.title}: ${tool.subtitle}`}
        >
          <div className="flex items-center gap-2 truncate">
            <div className={`w-7 h-7 rounded-lg ${tool.iconBg} flex items-center justify-center border transition-transform group-hover:scale-105 shrink-0 shadow-2xs`}>
              <Icon className={`w-3.5 h-3.5 ${tool.iconColor}`} />
            </div>
            <div className="truncate">
              <span className="block font-black text-xs text-white group-hover:text-amber-200 transition-colors font-['Tajawal'] truncate">
                {tool.title}
              </span>
              <span className="block text-[10px] text-slate-300/80 truncate">
                {tool.subtitle}
              </span>
            </div>
          </div>
          {tool.badge && (
            <span className="text-[9px] font-black px-1.5 py-0.5 bg-black/40 text-slate-200 border border-white/10 rounded-md shrink-0">
              {tool.badge}
            </span>
          )}
        </button>
      );
    }

    return (
      <button
        key={tool.id}
        type="button"
        onClick={tool.action}
        className={`group p-2.5 sm:p-3 bg-linear-to-br ${tool.colorGradient} border ${tool.borderColor} ${tool.hoverBorder} rounded-xl sm:rounded-2xl text-right flex flex-col justify-between gap-2 transition-all hover:scale-[1.02] hover:shadow-lg active:scale-95 cursor-pointer shadow-md select-none min-h-[92px] sm:min-h-[102px] touch-manipulation`}
        title={`${tool.title}: ${tool.subtitle}`}
      >
        {/* Top Row: Icon container + Badge */}
        <div className="flex items-center justify-between w-full">
          <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${tool.iconBg} flex items-center justify-center border transition-transform group-hover:scale-105 shrink-0 shadow-2xs`}>
            <Icon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${tool.iconColor}`} />
          </div>

          {tool.badge && (
            <span className="text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 bg-black/40 text-slate-200 border border-white/10 rounded-md leading-none truncate max-w-[100px]">
              {tool.badge}
            </span>
          )}
        </div>

        {/* Bottom Row: Title + Short Subtitle */}
        <div>
          <span className="block font-black text-xs sm:text-[13px] text-white group-hover:text-amber-200 transition-colors font-['Tajawal'] leading-snug line-clamp-1">
            {tool.title}
          </span>
          <span className="block text-[10px] sm:text-[11px] text-slate-300/80 truncate mt-0.5">
            {tool.subtitle}
          </span>
        </div>
      </button>
    );
  };

  return (
    <div
      id="main-tools-hub"
      className="bg-slate-900/95 border border-slate-700/80 rounded-2xl sm:rounded-3xl p-3 sm:p-5 lg:p-6 backdrop-blur-md shadow-2xl space-y-3.5 sm:space-y-5 transition-all text-right"
    >
      {/* 1. Header Toolbar: Title, Search, Stacked / Grid / Compact Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              واجهة الأيقونات المكدسة والمنظمة 👑
            </span>
            <h3 className="text-sm sm:text-base md:text-xl font-black font-['Tajawal'] text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400 shrink-0" />
              <span>مركز الأدوات والخدمات التربوية الموحد</span>
            </h3>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed font-medium">
            جميع أدوات التخطيط والذكاء الاصطناعي والتقويم والمناهج مكدسة ومنظمة في مسارات متكاملة تتلائم مع الجوال، الأجهزة اللوحية، الحواسيب، والألواح الذكية.
          </p>
        </div>

        {/* Live Search and Stacked/Grid View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-60 min-w-[200px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث سريع في جميع الأدوات..."
              className="w-full pl-8 pr-9 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 touch-manipulation cursor-pointer"
                title="مسح البحث"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Layout Mode Toggle: Stacked (مكدس ومنظم) vs Grid (شبكة) vs Compact (مدمج) */}
          <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700 shrink-0 gap-1">
            <button
              type="button"
              onClick={() => setLayoutMode('stacked')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer touch-manipulation flex items-center gap-1.5 ${
                layoutMode === 'stacked'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="عرض مكدس ومنظم في مسارات مصنفة بوضوح (الخيار الموصى به)"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="text-[11px] font-black">مكدس ومنظم</span>
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('grid')}
              className={`p-1.5 sm:px-2 rounded-lg text-xs font-bold transition-all cursor-pointer touch-manipulation flex items-center gap-1 ${
                layoutMode === 'grid'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="عرض شبكي شامل"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">شبكة</span>
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('compact')}
              className={`p-1.5 sm:px-2 rounded-lg text-xs font-bold transition-all cursor-pointer touch-manipulation flex items-center gap-1 ${
                layoutMode === 'compact'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="عرض أشرطة مدمجة سريعة"
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">مدمج</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Responsive Category Filter Pills Bar */}
      <div className="flex items-center justify-between overflow-x-auto pb-1 scrollbar-none gap-2 touch-scroll-x -mx-1 px-1">
        <div className="flex items-center gap-1.5 shrink-0 text-xs font-bold">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 min-h-[38px] touch-manipulation ${
              selectedCategory === 'all'
                ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            <span>🌟 جميع المسارات</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900/60 tabular-nums">
              {toArabicDigits(tools.length)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('ai')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 min-h-[38px] touch-manipulation ${
              selectedCategory === 'ai'
                ? 'bg-linear-to-r from-emerald-600 to-teal-600 text-white shadow-md ring-2 ring-emerald-400/40'
                : 'bg-slate-800 text-emerald-300 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>الذكاء الاصطناعي والتخطيط</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('assessment')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 min-h-[38px] touch-manipulation ${
              selectedCategory === 'assessment'
                ? 'bg-linear-to-r from-amber-600 to-amber-700 text-white shadow-md ring-2 ring-amber-400/40'
                : 'bg-slate-800 text-amber-300 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            <CalendarRange className="w-3.5 h-3.5 text-amber-300" />
            <span>التقويم والمحاكي والمهام</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('resources')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 min-h-[38px] touch-manipulation ${
              selectedCategory === 'resources'
                ? 'bg-linear-to-r from-teal-600 to-cyan-700 text-white shadow-md ring-2 ring-teal-400/40'
                : 'bg-slate-800 text-teal-300 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-teal-300" />
            <span>المناهج والوسائل ({toArabicDigits(resourcesCount)})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('management')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 min-h-[38px] touch-manipulation ${
              selectedCategory === 'management'
                ? 'bg-linear-to-r from-blue-600 to-indigo-700 text-white shadow-md ring-2 ring-blue-400/40'
                : 'bg-slate-800 text-blue-300 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            <Printer className="w-3.5 h-3.5 text-blue-300" />
            <span>الإنتاجية والإدارة والطباعة</span>
          </button>
        </div>

        <span className="hidden xl:inline text-[11px] text-slate-400 font-medium">
          معروض: <strong className="text-emerald-400 tabular-nums">{toArabicDigits(filteredTools.length)}</strong> من أصل {toArabicDigits(tools.length)}
        </span>
      </div>

      {/* 3. Main Display Area: Stacked Tiers (الترتيب المكدس والمنظم) vs Grid vs Compact */}
      {filteredTools.length === 0 ? (
        <div className="py-8 text-center bg-slate-800/50 rounded-2xl border border-dashed border-slate-700 p-4">
          <p className="text-xs text-slate-400">
            لم يتم العثور على أداة تطابق كلمة «{searchQuery}». يمكنك مسح البحث لعرض كافة الأدوات.
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="mt-2 text-xs font-bold text-emerald-400 hover:underline cursor-pointer"
          >
            مسح كلمة البحث
          </button>
        </div>
      ) : layoutMode === 'stacked' ? (
        /* STACKED & ORGANIZED TIERS (الترتيب المكدس والمنظم حسب المسارات والوظائف) */
        <div className="space-y-3.5 sm:space-y-4">
          {CATEGORY_SECTIONS.map((section) => {
            const sectionTools = filteredTools.filter((t) => t.category === section.id);
            if (sectionTools.length === 0) return null;
            const SectionIcon = section.icon;

            return (
              <div
                key={section.id}
                className={`bg-slate-800/75 border ${section.tierBorder} rounded-2xl p-3 sm:p-4 space-y-2.5 sm:space-y-3 transition-all shadow-md`}
              >
                {/* Stacked Tier Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-700/60">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl ${section.iconBg} flex items-center justify-center border shadow-xs shrink-0`}>
                      <SectionIcon className={`w-4 h-4 ${section.iconColor}`} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-black text-white font-['Tajawal'] flex items-center gap-1.5">
                          {section.title}
                        </h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${section.badgeStyle}`}>
                          {section.badge}
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-slate-300 hidden sm:block mt-0.5">
                        {section.description}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold text-slate-300 px-2.5 py-0.5 rounded-lg bg-slate-900/80 border border-slate-700/80 shrink-0 tabular-nums">
                    {toArabicDigits(sectionTools.length)} أدوات منظمة
                  </span>
                </div>

                {/* Stacked Grid of Tool Cards */}
                <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-2.5">
                  {sectionTools.map((tool) => renderToolCard(tool, false))}
                </div>
              </div>
            );
          })}
        </div>
      ) : layoutMode === 'compact' ? (
        /* COMPACT STACKED STRIPS (عرض الأشرطة المدمجة المكدسة) */
        <div className="space-y-3">
          {CATEGORY_SECTIONS.map((section) => {
            const sectionTools = filteredTools.filter((t) => t.category === section.id);
            if (sectionTools.length === 0) return null;
            const SectionIcon = section.icon;

            return (
              <div
                key={section.id}
                className="bg-slate-800/60 border border-slate-700/70 rounded-2xl p-2.5 sm:p-3 space-y-2"
              >
                <div className="flex items-center justify-between gap-2 px-1">
                  <div className="flex items-center gap-2">
                    <SectionIcon className={`w-3.5 h-3.5 ${section.iconColor}`} />
                    <span className="text-xs font-bold text-white font-['Tajawal']">
                      {section.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 tabular-nums">
                    {toArabicDigits(sectionTools.length)}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {sectionTools.map((tool) => renderToolCard(tool, true))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* UNIFIED GRID (عرض الشبكة الشاملة) */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-2.5 transition-all">
          {filteredTools.map((tool) => renderToolCard(tool, false))}
        </div>
      )}

      {/* 4. Footer Help Tip & Guidance */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>الأيقونات مكدسة ومنظمة في طبقات وظيفية لسهولة الوصول المباشر من أي جهاز ذكي أو حاسوب.</span>
        </div>
        <span className="text-emerald-400 font-bold shrink-0">
          منظومة عبقور للتميز التربوي © 2026
        </span>
      </div>
    </div>
  );
};
