import React, { useMemo, useState } from 'react';
import { LessonPlan } from '../types/lessonPlan';
import { toArabicDigits, toArabicPercent, formatDateYMD } from '../utils/arabicNumerals';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import {
  Compass,
  Layers,
  BarChart2,
  PieChart as PieIcon,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  BookOpen,
  Calendar,
  Filter,
  Search,
  Printer,
  Copy,
  Check,
  BrainCircuit,
  Award,
  Zap,
  ShieldAlert,
  ArrowUpRight,
  ChevronDown,
  Info,
  Lightbulb,
} from 'lucide-react';

interface CompetencyDistributionDashboardProps {
  plans: LessonPlan[];
  selectedSubjectFilter?: string;
  selectedGradeFilter?: string;
  selectedTeacherFilter?: string;
  onSelectPlan?: (planId: string) => void;
  onOpenEditor?: () => void;
}

// 8 Core Pedagogical Competency Domains defined in official standards
export interface CompetencyDomainConfig {
  id: string;
  name: string;
  shortName: string;
  description: string;
  category: 'cognitive' | 'practical' | 'social' | 'values';
  color: string;
  fill: string;
  bgBadge: string;
  borderBadge: string;
  textBadge: string;
  keywords: string[];
}

export const CORE_COMPETENCY_DOMAINS: CompetencyDomainConfig[] = [
  {
    id: 'conceptual',
    name: 'الكفايات المفاهيمية والمعرفية الأساسية',
    shortName: 'الفهم المفاهيمي والمعرفي',
    description: 'استيعاب البنية المعرفية، المفاهيم الأساسية، التعاريف، والقواعد الرياضية والعلمية بدقة.',
    category: 'cognitive',
    color: '#059669', // emerald-600
    fill: '#10b981',
    bgBadge: 'bg-emerald-50',
    borderBadge: 'border-emerald-200',
    textBadge: 'text-emerald-800',
    keywords: ['مفاهيم', 'معرف', 'استيعاب', 'قوانين', 'حقائق', 'تعريف', 'قيمة منزلية', 'بنية'],
  },
  {
    id: 'problem_solving',
    name: 'كفايات حل المشكلات والتطبيق الحياتي',
    shortName: 'حل المشكلات والتطبيق',
    description: 'توظيف المعرفة والمهارات الرياضية/العلمية في مواقف وسياقات حياتية واقعية غير نمطية.',
    category: 'practical',
    color: '#2563eb', // blue-600
    fill: '#3b82f6',
    bgBadge: 'bg-blue-50',
    borderBadge: 'border-blue-200',
    textBadge: 'text-blue-800',
    keywords: ['حل مشكلات', 'مسائل', 'حياتية', 'تطبيق', 'واقعي', 'نمذجة', 'سياق', 'استخدام'],
  },
  {
    id: 'critical_thinking',
    name: 'كفايات التفكير الناقد والاستنتاج والبرهان',
    shortName: 'التفكير الناقد والاستنتاج',
    description: 'تحليل البيانات، المقارنة، التبرير المنطقي، صياغة الفرضيات والاستنتاج الاستقرائي والاستنباطي.',
    category: 'cognitive',
    color: '#7c3aed', // purple-600
    fill: '#8b5cf6',
    bgBadge: 'bg-purple-50',
    borderBadge: 'border-purple-200',
    textBadge: 'text-purple-800',
    keywords: ['تفكير ناقد', 'استنتاج', 'تحليل', 'تبرير', 'مقارنة', 'منطق', 'برهان', 'استدلال'],
  },
  {
    id: 'modeling_simulation',
    name: 'كفايات النمذجة والمحاكاة بالمحسوسات والرقميات',
    shortName: 'النمذجة والمحسوسات الرقمية',
    description: 'تمثيل الأفكار المجردة باستخدام المحسوسات، المعداد، الرسوم البيانية، والمختبرات الافتراضية.',
    category: 'practical',
    color: '#0d9488', // teal-600
    fill: '#14b8a6',
    bgBadge: 'bg-teal-50',
    borderBadge: 'border-teal-200',
    textBadge: 'text-teal-800',
    keywords: ['معداد', 'نمذجة', 'محاكاة', 'محسوسات', 'مجسمات', 'رسم', 'تمثيل', 'PhET', 'رقمي'],
  },
  {
    id: 'scientific_communication',
    name: 'كفايات التواصل العلمي والتعبير الرياضي',
    shortName: 'التواصل العلمي واللغوي',
    description: 'التعبير الدقيق عن الأفكار والنتائج شفوياً وكتابياً باستخدام الرموز والمصطلحات المعتمدة.',
    category: 'social',
    color: '#ea580c', // orange-600
    fill: '#f97316',
    bgBadge: 'bg-orange-50',
    borderBadge: 'border-orange-200',
    textBadge: 'text-orange-800',
    keywords: ['تواصل', 'تعبير', 'مصطلحات', 'رموز', 'عرض', 'صياغة', 'مناقشة', 'شرح'],
  },
  {
    id: 'collaboration',
    name: 'كفايات التعلم التشاركي وتقويم الأقران',
    shortName: 'التعلم التشاركي والأقران',
    description: 'العمل الجماعي الفعال، تبادل الأدوار، تقويم الأقران، والمشاركة في الحوار الصفي البناء.',
    category: 'social',
    color: '#0284c7', // sky-600
    fill: '#0ea5e9',
    bgBadge: 'bg-sky-50',
    borderBadge: 'border-sky-200',
    textBadge: 'text-sky-800',
    keywords: ['تشاركي', 'أقران', 'مجموعات', 'تعاون', 'حوار', 'فريق', 'تبادل'],
  },
  {
    id: 'digital_safety',
    name: 'كفايات الاستعداد الرقمي والمواطنة والسلامة',
    shortName: 'الاستعداد والسلامة الرقمية',
    description: 'الاستخدام الآمن والمسؤول للأدوات الرقمية، التوثيق الأمين، والسلامة أثناء التجريب والمختبر.',
    category: 'values',
    color: '#4f46e5', // indigo-600
    fill: '#6366f1',
    bgBadge: 'bg-indigo-50',
    borderBadge: 'border-indigo-200',
    textBadge: 'text-indigo-800',
    keywords: ['رقمية', 'سلامة', 'أمان', 'مواطنة', 'أخلاقيات', 'توثيق', 'بيئة آمنة'],
  },
  {
    id: 'national_values',
    name: 'الكفايات القيمية والوطنية والوجدانية',
    shortName: 'القيم والارتباط الوطني',
    description: 'تعزيز الهوية الوطنية الفلسطينية، ربط التعلم بالبيئة والتراث، وتقدير قيمة العمل والعلم.',
    category: 'values',
    color: '#be123c', // rose-700
    fill: '#e11d48',
    bgBadge: 'bg-rose-50',
    borderBadge: 'border-rose-200',
    textBadge: 'text-rose-800',
    keywords: ['فلسطين', 'وطني', 'هوية', 'قيم', 'تراث', 'بيئة', 'وجداني', 'أخلاق'],
  },
];

export const CompetencyDistributionDashboard: React.FC<CompetencyDistributionDashboardProps> = ({
  plans,
  selectedSubjectFilter = 'all',
  selectedGradeFilter = 'all',
  selectedTeacherFilter = 'all',
  onSelectPlan,
  onOpenEditor,
}) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'frequency' | 'balance' | 'gaps' | 'plans'>('matrix');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState<'all' | 'sem1' | 'sem2'>('all');
  const [copied, setCopied] = useState(false);

  // Compute detailed competency frequency and gap distribution across plans & semesters
  const analyticsData = useMemo(() => {
    // 1. Filtered Plans based on active filters
    const targetPlans = plans.filter((p) => {
      const matchSubject =
        selectedSubjectFilter === 'all' || p.header.subject.includes(selectedSubjectFilter);
      const matchGrade =
        selectedGradeFilter === 'all' || p.header.grade === selectedGradeFilter;
      const matchTeacher =
        selectedTeacherFilter === 'all' || p.header.teacherName?.trim() === selectedTeacherFilter;
      return matchSubject && matchGrade && matchTeacher;
    });

    const activePlans = targetPlans.length > 0 ? targetPlans : plans;

    // 2. Frequency mapping per competency domain and semester
    const domainCounts: Record<
      string,
      {
        config: CompetencyDomainConfig;
        sem1Count: number;
        sem2Count: number;
        totalCount: number;
        linkedPlans: Array<{
          planId: string;
          lessonTitle: string;
          subject: string;
          grade: string;
          semester: string;
          competencyText: string;
        }>;
      }
    > = {};

    CORE_COMPETENCY_DOMAINS.forEach((domain) => {
      domainCounts[domain.id] = {
        config: domain,
        sem1Count: 0,
        sem2Count: 0,
        totalCount: 0,
        linkedPlans: [],
      };
    });

    // Subject breakdown per domain for matrix
    const subjectMatrix: Record<string, Record<string, number>> = {};

    activePlans.forEach((plan) => {
      const isSem2 = plan.header.semester?.includes('الثاني');
      const semKey = isSem2 ? 'sem2' : 'sem1';
      const semLabel = isSem2 ? 'الفصل الدراسي الثاني' : 'الفصل الدراسي الأول';
      const subKey = plan.header.subject.split('-')[0].trim() || 'الرياضيات';

      if (!subjectMatrix[subKey]) {
        subjectMatrix[subKey] = {};
        CORE_COMPETENCY_DOMAINS.forEach((d) => {
          subjectMatrix[subKey][d.id] = 0;
        });
      }

      // Collect all text from plan section 1 (Integrative Competencies), section 2, section 3
      const section1Competencies = plan.section1?.integrativeCompetencies || [];
      const planTextBlob = [
        plan.header.lessonTitle,
        plan.header.subject,
        ...section1Competencies.map((c) => `${c.title} ${c.description}`),
        plan.section1?.studentCharacteristics?.environmentalAdaptation || '',
        plan.section1?.ethicsAndSafety?.digitalSafety || '',
        plan.section1?.ethicsAndSafety?.contentAccuracyAndLanguage || '',
        plan.section3Assessment?.graspsTask?.title || '',
        plan.section3Assessment?.graspsTask?.situation || '',
        ...(plan.section3Assessment?.rubric?.map((r) => `${r.criterion} ${r.level4}`) || []),
      ]
        .join(' ')
        .toLowerCase();

      // Check each domain against the plan
      CORE_COMPETENCY_DOMAINS.forEach((domain) => {
        let isMatched = false;
        let matchedSnippet = '';

        // Match from section 1 explicitly if available
        const explicitMatch = section1Competencies.find(
          (c) =>
            domain.keywords.some((kw) => c.title.toLowerCase().includes(kw)) ||
            domain.keywords.some((kw) => c.description.toLowerCase().includes(kw))
        );

        if (explicitMatch) {
          isMatched = true;
          matchedSnippet = `${explicitMatch.title}: ${explicitMatch.description}`;
        } else {
          // Fallback keyword scanning in entire plan
          const kwMatch = domain.keywords.find((kw) => planTextBlob.includes(kw.toLowerCase()));
          if (kwMatch) {
            isMatched = true;
            matchedSnippet = `كفاية مدمجة بالدرس تتعلق بـ (${domain.shortName})`;
          }
        }

        if (isMatched) {
          if (isSem2) {
            domainCounts[domain.id].sem2Count += 1;
          } else {
            domainCounts[domain.id].sem1Count += 1;
          }
          domainCounts[domain.id].totalCount += 1;
          subjectMatrix[subKey][domain.id] += 1;

          domainCounts[domain.id].linkedPlans.push({
            planId: plan.id,
            lessonTitle: plan.header.lessonTitle || plan.title || 'خطة درس',
            subject: plan.header.subject,
            grade: plan.header.grade,
            semester: semLabel,
            competencyText: matchedSnippet,
          });
        }
      });
    });

    // 3. Gap Diagnostics: Identify domains with low or zero coverage
    const gapThreshold = 2; // Less than 2 occurrences considered a planning gap
    const detectedGaps: Array<{
      id: string;
      domain: CompetencyDomainConfig;
      severity: 'critical' | 'moderate' | 'balanced';
      totalCount: number;
      sem1Count: number;
      sem2Count: number;
      gapDescription: string;
      riskAnalysis: string;
      remedialAdvice: string;
    }> = [];

    CORE_COMPETENCY_DOMAINS.forEach((domain) => {
      const data = domainCounts[domain.id];
      let severity: 'critical' | 'moderate' | 'balanced' = 'balanced';
      let gapDescription = '';
      let riskAnalysis = '';
      let remedialAdvice = '';

      if (data.totalCount === 0) {
        severity = 'critical';
        gapDescription = `غياب تام لكفايات (${domain.name}) في كافة الخطط المحفوظة.`;
        riskAnalysis = `خطر اقتصار التحضير على المعارف السطحية دون بناء الكفايات المستهدفة في المعايير الوزارية.`;
        remedialAdvice = `يُنصح بإدراج معيار محدد ونشاط تفاعلي مخصص لهذه الكفاية في خطة الدرس القادمة.`;
      } else if (data.sem1Count > 0 && data.sem2Count === 0) {
        severity = 'critical';
        gapDescription = `انقطاع وفجوة في الفصل الدراسي الثاني (مغطاة في الفصل الأول فقط بعدد ${toArabicDigits(data.sem1Count)} مرات).`;
        riskAnalysis = `فقدان استمرارية وتراكم الخبرة الكفائية لدى الطلاب عند الانتقال للموضوعات المتقدمة.`;
        remedialAdvice = `تعزيز تضمين الكفاية في وحدات الفصل الثاني عبر مهام أصيلة وأنشطة استقصائية.`;
      } else if (data.sem2Count > 0 && data.sem1Count === 0) {
        severity = 'moderate';
        gapDescription = `تأخر البدء في تنمية الكفاية حتى الفصل الثاني (غير مفعلة بالفصل الأول).`;
        riskAnalysis = `صعوبة تمكن الطلاب من الكفاية المركبة لعدم التأسيس التدريجي لها مبكراً.`;
        remedialAdvice = `إدخال أنشطة تمهيدية مبسطة في الأسابيع الأولى من الفصل الدراسي.`;
      } else if (data.totalCount < gapThreshold) {
        severity = 'moderate';
        gapDescription = `تكرار منخفض وغير كافٍ (${toArabicDigits(data.totalCount)} مرة فقط في العام).`;
        riskAnalysis = `عدم وصول الطلبة لمستوى الإتقان والاستقلالية (Mastery) في الكفاية.`;
        remedialAdvice = `تكرار توظيف الكفاية في مواقف صفية مختلفة لترسيخ التعلم.`;
      } else {
        severity = 'balanced';
        gapDescription = `تغطية متوازنة ومستمرة عبر الفصول (${toArabicDigits(data.totalCount)} خطط).`;
        riskAnalysis = `استيفاء مثالي لمعايير التخطيط ونواتج التعلم المتكاملة.`;
        remedialAdvice = `مواصلة تعميق الكفاية وتوثيق نماذج إبداعية من إنجازات الطلبة.`;
      }

      detectedGaps.push({
        id: domain.id,
        domain,
        severity,
        totalCount: data.totalCount,
        sem1Count: data.sem1Count,
        sem2Count: data.sem2Count,
        gapDescription,
        riskAnalysis,
        remedialAdvice,
      });
    });

    // 4. Recharts Datasets
    const chartFrequencyData = CORE_COMPETENCY_DOMAINS.map((domain) => {
      const d = domainCounts[domain.id];
      return {
        name: domain.shortName,
        fullName: domain.name,
        'الفصل الأول': d.sem1Count,
        'الفصل الثاني': d.sem2Count,
        'إجمالي التكرار': d.totalCount,
        fill: domain.fill,
      };
    });

    const chartBalanceData = CORE_COMPETENCY_DOMAINS.map((domain) => ({
      name: domain.shortName,
      value: domainCounts[domain.id].totalCount || 0,
      fill: domain.fill,
    })).filter((item) => item.value > 0);

    const totalCompetencyInstances = Object.values(domainCounts).reduce(
      (acc, d) => acc + d.totalCount,
      0
    );

    const criticalGapsCount = detectedGaps.filter((g) => g.severity === 'critical').length;
    const moderateGapsCount = detectedGaps.filter((g) => g.severity === 'moderate').length;
    const balancedCount = detectedGaps.filter((g) => g.severity === 'balanced').length;

    return {
      activePlansCount: activePlans.length,
      domainCounts,
      detectedGaps,
      subjectMatrix,
      chartFrequencyData,
      chartBalanceData,
      totalCompetencyInstances,
      criticalGapsCount,
      moderateGapsCount,
      balancedCount,
    };
  }, [plans, selectedSubjectFilter, selectedGradeFilter, selectedTeacherFilter]);

  // Copy Markdown Gap Analysis Report
  const handleCopyReport = () => {
    const md = `# تقرير تحليل توزيع الكفايات التعليمية وفجوات التخطيط عبر الفصول الدراسية
العام الدراسي: ٢٠٢٦ / ٢٠٢٧م | تاريخ التحليل: ${formatDateYMD(new Date())}
المبحث: ${selectedSubjectFilter === 'all' ? 'كافة المباحث' : selectedSubjectFilter} | الخطط المفحوصة: ${analyticsData.activePlansCount} خطة

## 📊 الملخص الإحصائي
- إجمالي الكفايات المدمجة: ${analyticsData.totalCompetencyInstances}
- الكفايات المغطاة بتوازن: ${analyticsData.balancedCount} من أصل ٨
- فجوات حرجة بحاجة لتدخل: ${analyticsData.criticalGapsCount}
- فجوات متوسطة (تكرار منخفض): ${analyticsData.moderateGapsCount}

## ⚠️ تشخيص فجوات التخطيط والتوصيات
${analyticsData.detectedGaps
  .map(
    (g, idx) => `### ${idx + 1}. ${g.domain.name} [الحالة: ${g.severity === 'critical' ? '🔴 حرجة' : g.severity === 'moderate' ? '🟡 متوسطة' : '🟢 متوازنة'}]
- **التكرار:** الفصل الأول (${g.sem1Count}) | الفصل الثاني (${g.sem2Count}) | الإجمالي (${g.totalCount})
- **التشخيص:** ${g.gapDescription}
- **المخاطر التربوية:** ${g.riskAnalysis}
- **الإجراء العلاجي المقترح:** ${g.remedialAdvice}`
  )
  .join('\n\n')}
`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="competency-matrix-section"
      dir="rtl"
      className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6 text-right scroll-mt-6"
    >
      {/* 1. Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-indigo-700 via-purple-700 to-teal-700 text-white flex items-center justify-center shrink-0 shadow-md ring-2 ring-indigo-500/20">
            <Compass className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-black font-['Tajawal'] text-slate-900">
                لوحة تحليل توزيع الكفايات وفجوات التخطيط عبر الفصول
              </h3>
              <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-900 rounded-full text-[11px] font-black border border-indigo-300 shadow-2xs">
                مصفوفة الكفايات 🧭
              </span>
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded-full text-[11px] font-black border border-amber-300 shadow-2xs">
                كاشف الفجوات الذكي ⚠️
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              تحليل بصري دقيق يوضح مدى تكرار كل كفاية تعليمية عبر الفصول الدراسية (الفصل الأول مقابل الفصل الثاني)، وكشف الفجوات في التخطيط التدريسي لضمان تغطية متوازنة لكافة المعايير.
            </p>
          </div>
        </div>

        {/* View Mode Selector Tabs & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
          <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/90 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'matrix'
                  ? 'bg-indigo-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="عرض مصفوفة التغطية والفجوات"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>مصفوفة التغطية</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('frequency')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'frequency'
                  ? 'bg-purple-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="عرض مخطط التكرار الفصلي"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>التكرار الفصلي</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('gaps')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'gaps'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="تقرير تشخيص الفجوات والتوصيات"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>تقرير الفجوات ({toArabicDigits(analyticsData.criticalGapsCount + analyticsData.moderateGapsCount)})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('balance')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'balance'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="عرض ميزان الأبعاد الكفائية"
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span>ميزان الكفايات</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyReport}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer border border-slate-200"
              title="نسخ تقرير الفجوات بتنسيق Markdown"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer border border-slate-200"
              title="طباعة تقرير الكفايات"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Executive Statistics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Balanced Competencies */}
        <div className="p-4 rounded-2xl bg-linear-to-br from-emerald-50 via-teal-50 to-white border border-emerald-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600">كفايات متوازنة ومستمرة</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black font-['Tajawal'] text-emerald-950 tabular-nums">
              {toArabicDigits(analyticsData.balancedCount)} / ٨
            </span>
            <span className="text-[11px] font-bold text-emerald-700">تغطية مثالية</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 border-t border-emerald-100 pt-1.5">
            تكرار متوازن عبر الفصلين الأول والثاني
          </p>
        </div>

        {/* KPI 2: Critical Planning Gaps */}
        <div className="p-4 rounded-2xl bg-linear-to-br from-rose-50 via-red-50 to-white border border-rose-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600">فجوات تخطيط حرجة</span>
            <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black font-['Tajawal'] text-rose-950 tabular-nums">
              {toArabicDigits(analyticsData.criticalGapsCount)}
            </span>
            <span className="text-[11px] font-bold text-rose-700">غياب أو انقطاع</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 border-t border-rose-100 pt-1.5">
            كفايات غير مغطاة أو مقطوعة في أحد الفصول
          </p>
        </div>

        {/* KPI 3: Moderate Low Frequency */}
        <div className="p-4 rounded-2xl bg-linear-to-br from-amber-50 via-yellow-50 to-white border border-amber-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600">كفايات بتكرار منخفض</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-2xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black font-['Tajawal'] text-amber-950 tabular-nums">
              {toArabicDigits(analyticsData.moderateGapsCount)}
            </span>
            <span className="text-[11px] font-bold text-amber-800">حاجة لتعزيز</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 border-t border-amber-100 pt-1.5">
            تكرار أقل من مرتين خلال العام الدراسي
          </p>
        </div>

        {/* KPI 4: Total Plan Links */}
        <div className="p-4 rounded-2xl bg-linear-to-br from-indigo-50 via-purple-50 to-white border border-indigo-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600">إجمالي الروابط الكفائية</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black font-['Tajawal'] text-indigo-950 tabular-nums">
              {toArabicDigits(analyticsData.totalCompetencyInstances)}
            </span>
            <span className="text-[11px] font-bold text-indigo-700">كفاية موثقة</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 border-t border-indigo-100 pt-1.5">
            في {toArabicDigits(analyticsData.activePlansCount)} خطة درس محفوظة
          </p>
        </div>
      </div>

      {/* 3. Main Visual Showcase Area */}
      <div className="space-y-4">
        {/* VIEW 1: Coverage Matrix & Gap Heatmap */}
        {activeTab === 'matrix' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <h4 className="text-sm font-black text-slate-900 font-['Tajawal']">
                  مصفوفة تغطية الكفايات وفجوات التخطيط بحسب المباحث والفصول الدراسية
                </h4>
                <p className="text-[11px] text-slate-500">
                  خريطة حرارية تبين مدى كثافة توظيف كل كفاية ومواقع الفجوات التي لم يتم تغطيتها
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-[11px] font-bold">
                <span className="flex items-center gap-1 text-emerald-800">
                  <span className="w-3 h-3 rounded-md bg-emerald-600 inline-block" />
                  تغطية كافية (3+ مرات)
                </span>
                <span className="flex items-center gap-1 text-amber-800">
                  <span className="w-3 h-3 rounded-md bg-amber-400 inline-block" />
                  تغطية متوسطة (1-2)
                </span>
                <span className="flex items-center gap-1 text-rose-800">
                  <span className="w-3 h-3 rounded-md bg-rose-200 border border-rose-400 inline-block" />
                  فجوة تخطيط (0)
                </span>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
              <table className="w-full text-right text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-800 font-black border-b border-slate-200">
                    <th className="p-3.5 min-w-[200px]">الكفاية التعليمية الأساسية</th>
                    <th className="p-3.5 text-center min-w-[100px]">الفصل الأول</th>
                    <th className="p-3.5 text-center min-w-[100px]">الفصل الثاني</th>
                    <th className="p-3.5 text-center min-w-[100px]">إجمالي التكرار</th>
                    <th className="p-3.5 min-w-[140px]">حالة التغطية</th>
                    <th className="p-3.5 min-w-[180px]">التشخيص والإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {CORE_COMPETENCY_DOMAINS.map((domain) => {
                    const data = analyticsData.domainCounts[domain.id];
                    const sem1 = data.sem1Count;
                    const sem2 = data.sem2Count;
                    const total = data.totalCount;

                    // Status Indicator
                    let statusBadge = (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-bold border border-emerald-300 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        تغطية ممتازة
                      </span>
                    );

                    if (total === 0) {
                      statusBadge = (
                        <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-900 font-bold border border-rose-300 flex items-center gap-1 w-fit">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-700" />
                          فجوة حرجة (صفر)
                        </span>
                      );
                    } else if (sem1 > 0 && sem2 === 0) {
                      statusBadge = (
                        <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-900 font-bold border border-rose-300 flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
                          مفقودة بالفصل الثاني
                        </span>
                      );
                    } else if (total < 2) {
                      statusBadge = (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-bold border border-amber-300 flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                          تكرار منخفض
                        </span>
                      );
                    }

                    return (
                      <tr key={domain.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: domain.color }}
                              />
                              <strong className="font-black text-slate-900 font-['Tajawal']">
                                {domain.name}
                              </strong>
                            </div>
                            <p className="text-[11px] text-slate-500 pr-4 leading-relaxed line-clamp-1">
                              {domain.description}
                            </p>
                          </div>
                        </td>

                        {/* Sem 1 cell */}
                        <td className="p-3.5 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-lg font-black tabular-nums ${
                              sem1 >= 3
                                ? 'bg-emerald-600 text-white'
                                : sem1 >= 1
                                ? 'bg-amber-400 text-slate-950'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}
                          >
                            {toArabicDigits(sem1)}
                          </span>
                        </td>

                        {/* Sem 2 cell */}
                        <td className="p-3.5 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-lg font-black tabular-nums ${
                              sem2 >= 3
                                ? 'bg-emerald-600 text-white'
                                : sem2 >= 1
                                ? 'bg-amber-400 text-slate-950'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}
                          >
                            {toArabicDigits(sem2)}
                          </span>
                        </td>

                        {/* Total cell */}
                        <td className="p-3.5 text-center">
                          <strong className="text-sm font-black text-slate-900 tabular-nums">
                            {toArabicDigits(total)} خطط
                          </strong>
                        </td>

                        {/* Status badge */}
                        <td className="p-3.5">{statusBadge}</td>

                        {/* Action note */}
                        <td className="p-3.5 text-[11px] text-slate-600">
                          {total === 0 ? (
                            <span className="text-rose-700 font-bold">⚠️ أضف معياراً لهذه الكفاية في درسك القادم</span>
                          ) : sem1 > 0 && sem2 === 0 ? (
                            <span className="text-amber-800 font-bold">💡 عزز الكفاية في الفصل الثاني</span>
                          ) : (
                            <span className="text-emerald-800">✅ تغطية مستمرة ومكتملة</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 2: Frequency Bar & Stacked Chart */}
        {activeTab === 'frequency' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <h4 className="text-sm font-black text-slate-900 font-['Tajawal']">
                  مخطط الأعمدة المقارن: تكرار الكفايات بين الفصل الأول والفصل الثاني
                </h4>
                <p className="text-[11px] text-slate-500">
                  مقارنة تتبعية لعدد مرات تفعيل كل كفاية تعليمية عبر فصول العام
                </p>
              </div>
            </div>

            <div className="h-80 sm:h-96 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analyticsData.chartFrequencyData}
                  margin={{ top: 20, right: 20, left: 10, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '12px',
                      textAlign: 'right',
                      direction: 'rtl',
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: 10, fontSize: 11, fontWeight: 700 }} />
                  <Bar dataKey="الفصل الأول" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="الفصل الثاني" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* VIEW 3: Competency Balance Donut */}
        {activeTab === 'balance' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <h4 className="text-sm font-black text-slate-900 font-['Tajawal']">
                  ميزان الأبعاد الكفائية: الحصص النسبية لتوزيع الكفايات
                </h4>
                <p className="text-[11px] text-slate-500">
                  تحليل التوازن بين الكفايات المعرفية، والتطبيقية، والتفكير الناقد، والقيمية
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-6 h-72 sm:h-80 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        color: '#fff',
                        fontSize: '12px',
                        textAlign: 'right',
                        direction: 'rtl',
                      }}
                    />
                    <Pie
                      data={analyticsData.chartBalanceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={105}
                      paddingAngle={4}
                      dataKey="value"
                      nameKey="name"
                    >
                      {analyticsData.chartBalanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} stroke="#ffffff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Legend wrapperStyle={{ paddingTop: 10, fontSize: 11, fontWeight: 700 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="lg:col-span-6 space-y-3">
                <h5 className="text-xs font-black text-slate-800 font-['Tajawal']">
                  التوزيع النسبي للكفايات المفعلة في المناهج:
                </h5>
                <div className="space-y-2">
                  {CORE_COMPETENCY_DOMAINS.map((domain) => {
                    const count = analyticsData.domainCounts[domain.id].totalCount;
                    const pct = analyticsData.totalCompetencyInstances > 0
                      ? Math.round((count / analyticsData.totalCompetencyInstances) * 100)
                      : 0;
                    return (
                      <div key={domain.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: domain.color }} />
                            {domain.shortName}
                          </span>
                          <span className="font-black text-slate-900 tabular-nums">
                            {toArabicDigits(count)} ({toArabicDigits(pct)}٪)
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: domain.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: Gap Diagnostic & Action Recommendations */}
        {activeTab === 'gaps' && (
          <div className="space-y-4">
            <div className="bg-linear-to-r from-amber-50 via-orange-50 to-white p-4 rounded-2xl border border-amber-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500 text-slate-950 rounded-xl">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 font-['Tajawal']">
                    تقرير تشخيص الفجوات وخريطة التدخلات التربوية المقترحة
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    إرشادات مباشرة لردم الفجوات الكفائية في الخطط القادمة وضمان شمولية نواتج التعلم
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analyticsData.detectedGaps.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border space-y-3 transition-all ${
                    item.severity === 'critical'
                      ? 'bg-rose-50/70 border-rose-200 hover:border-rose-300'
                      : item.severity === 'moderate'
                      ? 'bg-amber-50/70 border-amber-200 hover:border-amber-300'
                      : 'bg-emerald-50/70 border-emerald-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 border-b border-black/5 pb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: item.domain.color }}
                      />
                      <h5 className="text-xs font-black text-slate-900 font-['Tajawal']">
                        {item.domain.name}
                      </h5>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.severity === 'critical'
                          ? 'bg-rose-600 text-white'
                          : item.severity === 'moderate'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {item.severity === 'critical'
                        ? 'فجوة حرجة'
                        : item.severity === 'moderate'
                        ? 'تكرار منخفض'
                        : 'متوازنة'}
                    </span>
                  </div>

                  <div className="text-xs space-y-2 text-slate-700">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 bg-white/70 p-2 rounded-xl border border-black/5">
                      <span>الفصل الأول: <strong>{toArabicDigits(item.sem1Count)}</strong></span>
                      <span>الفصل الثاني: <strong>{toArabicDigits(item.sem2Count)}</strong></span>
                      <span>الإجمالي: <strong>{toArabicDigits(item.totalCount)}</strong></span>
                    </div>

                    <p>
                      <strong className="text-slate-900">التشخيص: </strong>
                      {item.gapDescription}
                    </p>

                    {item.severity !== 'balanced' && (
                      <p className="text-rose-800 text-[11px]">
                        <strong>المخاطر: </strong>
                        {item.riskAnalysis}
                      </p>
                    )}

                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-[11px] text-indigo-900 space-y-0.5">
                      <strong className="block text-indigo-950">💡 الإجراء التربوي المقترح:</strong>
                      <p>{item.remedialAdvice}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 5: Competency Plans Explorer */}
        {activeTab === 'plans' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h4 className="text-sm font-black text-slate-900 font-['Tajawal']">
                  مستكشف الكفايات والدروس المرتبطة
                </h4>
                <p className="text-[11px] text-slate-500">
                  استعراض الخطط والدروس التي قامت بتفعيل كل كفاية تعليمية
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="بحث في الكفايات أو الدروس..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-3 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-3">
              {CORE_COMPETENCY_DOMAINS.map((domain) => {
                const data = analyticsData.domainCounts[domain.id];
                const matchingPlans = data.linkedPlans.filter((p) =>
                  !searchQuery.trim() ||
                  p.lessonTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  domain.name.toLowerCase().includes(searchQuery.toLowerCase())
                );

                if (searchQuery.trim() && matchingPlans.length === 0) return null;

                return (
                  <div
                    key={domain.id}
                    className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: domain.color }} />
                        <h5 className="text-xs font-black text-slate-900 font-['Tajawal']">
                          {domain.name}
                        </h5>
                      </div>
                      <span className="text-[11px] font-bold text-slate-600 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                        {toArabicDigits(matchingPlans.length)} خطط مرتبطة
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
                      {matchingPlans.length === 0 ? (
                        <div className="col-span-full py-2 text-center text-[11px] text-slate-500">
                          لا توجد خطط تفعل هذه الكفاية حالياً (فجوة تخطيط)
                        </div>
                      ) : (
                        matchingPlans.map((planItem, idx) => (
                          <div
                            key={idx}
                            className="bg-white border border-slate-200 rounded-xl p-2.5 space-y-1 shadow-2xs hover:border-indigo-300 transition-colors"
                          >
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-slate-900 truncate">
                                {planItem.lessonTitle}
                              </span>
                              <span className="text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded shrink-0">
                                {planItem.semester.split(' ')[2] || planItem.semester}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 line-clamp-1">
                              {planItem.competencyText}
                            </p>
                            {onSelectPlan && (
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectPlan(planItem.planId);
                                  if (onOpenEditor) onOpenEditor();
                                }}
                                className="text-[10px] text-indigo-700 hover:text-indigo-900 font-bold flex items-center gap-1 pt-1 cursor-pointer"
                              >
                                <span>عرض الخطة</span>
                                <ArrowUpRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
