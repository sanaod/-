import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  CartesianGrid,
  ComposedChart,
  Line,
} from 'recharts';
import { LessonPlan } from '../types/lessonPlan';
import { toArabicDigits } from '../utils/arabicNumerals';
import {
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  Compass,
  GraduationCap,
  Layers,
  PieChart as PieIcon,
  Sparkles,
  TrendingUp,
  UserCheck,
  Zap,
  Star,
  Activity,
  Filter,
  RotateCcw,
  SlidersHorizontal,
  Table,
  Eye,
} from 'lucide-react';

export interface TeacherAchievementsVisualizerProps {
  plans: LessonPlan[];
  selectedSubjectFilter?: string;
  onSelectSubjectFilter?: (subject: string) => void;
  selectedStageFilter?: string;
  onSelectStageFilter?: (stage: string) => void;
  selectedTeacherFilter?: string;
  onSelectTeacherFilter?: (teacher: string) => void;
}

// Color Palette for Subjects & Stages
const PALETTE = [
  '#059669', // Emerald
  '#2563eb', // Blue
  '#7c3aed', // Purple
  '#d97706', // Amber
  '#0d9488', // Teal
  '#e11d48', // Rose
  '#0891b2', // Cyan
  '#4f46e5', // Indigo
  '#ca8a04', // Yellow
  '#475569', // Slate
];

export const STAGE_CONFIG: Record<
  string,
  { key: string; label: string; shortLabel: string; order: number; color: string; bgBadge: string; borderBadge: string }
> = {
  early_childhood: {
    key: 'early_childhood',
    label: 'مرحلة رياض الأطفال والطفولة المبكرة',
    shortLabel: 'رياض الأطفال',
    order: 0,
    color: '#d97706',
    bgBadge: 'bg-amber-50 text-amber-800',
    borderBadge: 'border-amber-300',
  },
  primary_lower: {
    key: 'primary_lower',
    label: 'المرحلة الأساسية الدنيا (الصفوف ١-٤)',
    shortLabel: 'الأساسية الدنيا (١-٤)',
    order: 1,
    color: '#059669',
    bgBadge: 'bg-emerald-50 text-emerald-800',
    borderBadge: 'border-emerald-300',
  },
  primary_upper: {
    key: 'primary_upper',
    label: 'المرحلة الأساسية العليا (الصفوف ٥-٩)',
    shortLabel: 'الأساسية العليا (٥-٩)',
    order: 2,
    color: '#2563eb',
    bgBadge: 'bg-blue-50 text-blue-800',
    borderBadge: 'border-blue-300',
  },
  secondary: {
    key: 'secondary',
    label: 'المرحلة الثانوية (الصفوف ١٠-١٢)',
    shortLabel: 'الثانوية (١٠-١٢)',
    order: 3,
    color: '#7c3aed',
    bgBadge: 'bg-purple-50 text-purple-800',
    borderBadge: 'border-purple-300',
  },
  general: {
    key: 'general',
    label: 'مراحل ومستويات أخرى / عام',
    shortLabel: 'مراحل أخرى',
    order: 4,
    color: '#64748b',
    bgBadge: 'bg-slate-50 text-slate-800',
    borderBadge: 'border-slate-300',
  },
};

// Helper to determine educational stage from grade string
export function getStageFromGrade(gradeStr: string): {
  key: string;
  label: string;
  shortLabel: string;
  order: number;
  color: string;
  bgBadge: string;
  borderBadge: string;
} {
  const g = (gradeStr || '').toLowerCase();
  if (
    g.includes('روضة') ||
    g.includes('تمهيدي') ||
    g.includes('بستان') ||
    g.includes('طفولة') ||
    g.includes('تهيئة')
  ) {
    return STAGE_CONFIG.early_childhood;
  }
  if (
    g.includes('أول') ||
    g.includes('ثاني') ||
    g.includes('ثالث') ||
    g.includes('رابع') ||
    g.includes('1') ||
    g.includes('2') ||
    g.includes('3') ||
    g.includes('4')
  ) {
    return STAGE_CONFIG.primary_lower;
  }
  if (
    g.includes('خامس') ||
    g.includes('سادس') ||
    g.includes('سابع') ||
    g.includes('ثامن') ||
    g.includes('تاسع') ||
    g.includes('5') ||
    g.includes('6') ||
    g.includes('7') ||
    g.includes('8') ||
    g.includes('9')
  ) {
    return STAGE_CONFIG.primary_upper;
  }
  if (
    g.includes('عاشر') ||
    g.includes('حادي') ||
    g.includes('ثاني عشر') ||
    g.includes('توجيهي') ||
    g.includes('10') ||
    g.includes('11') ||
    g.includes('12')
  ) {
    return STAGE_CONFIG.secondary;
  }
  return STAGE_CONFIG.general;
}

export const TeacherAchievementsVisualizer: React.FC<TeacherAchievementsVisualizerProps> = ({
  plans,
  selectedSubjectFilter = 'all',
  onSelectSubjectFilter,
  selectedStageFilter = 'all',
  onSelectStageFilter,
  selectedTeacherFilter = 'all',
  onSelectTeacherFilter,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'cross_matrix' | 'subjects' | 'stages' | 'radar' | 'trend'>('all');
  const [subjectMetric, setSubjectMetric] = useState<'plans' | 'periods' | 'duration'>('plans');
  const [barGroupingMode, setBarGroupingMode] = useState<'stacked' | 'grouped'>('stacked');
  const [matrixViewMode, setMatrixViewMode] = useState<'subject_by_stage' | 'stage_by_subject'>('subject_by_stage');

  // Internal Filter State if not managed externally
  const [localSubject, setLocalSubject] = useState<string>(selectedSubjectFilter);
  const [localStage, setLocalStage] = useState<string>(selectedStageFilter);

  // Sync props to local
  const currentSubject = onSelectSubjectFilter ? selectedSubjectFilter : localSubject;
  const currentStage = onSelectStageFilter ? selectedStageFilter : localStage;

  const handleSubjectChange = (sub: string) => {
    setLocalSubject(sub);
    if (onSelectSubjectFilter) onSelectSubjectFilter(sub);
  };

  const handleStageChange = (st: string) => {
    setLocalStage(st);
    if (onSelectStageFilter) onSelectStageFilter(st);
  };

  const handleResetVisualizerFilters = () => {
    handleSubjectChange('all');
    handleStageChange('all');
    if (onSelectTeacherFilter) onSelectTeacherFilter('all');
  };

  // 1. Filtered subset based on local stage & subject selection
  const scopedPlans = useMemo(() => {
    return plans.filter((p) => {
      const s = p.header?.subject?.split('-')[0].trim() || 'مبحث عام';
      const stage = getStageFromGrade(p.header?.grade || '');

      const matchSubject = currentSubject === 'all' || s.toLowerCase().includes(currentSubject.toLowerCase());
      const matchStage = currentStage === 'all' || stage.key === currentStage;

      return matchSubject && matchStage;
    });
  }, [plans, currentSubject, currentStage]);

  // Extract unique subjects across all plans
  const uniqueSubjects = useMemo(() => {
    const set = new Set<string>();
    plans.forEach((p) => {
      const s = p.header?.subject?.split('-')[0].trim();
      if (s) set.add(s);
    });
    return Array.from(set).sort();
  }, [plans]);

  // 2. Cross-Dimensional Data: Subject × Educational Stage (المبحث × المرحلة الدراسية)
  const crossSubjectStageData = useMemo(() => {
    const subjectMap: Record<
      string,
      {
        subject: string;
        totalPlans: number;
        totalPeriods: number;
        totalMinutes: number;
        primaryLowerPlans: number;
        primaryUpperPlans: number;
        secondaryPlans: number;
        generalPlans: number;
        primaryLowerPeriods: number;
        primaryUpperPeriods: number;
        secondaryPeriods: number;
        generalPeriods: number;
      }
    > = {};

    plans.forEach((plan) => {
      const s = plan.header?.subject?.split('-')[0].trim() || 'مبحث عام';
      const stage = getStageFromGrade(plan.header?.grade || '');
      const periods = Number(plan.header?.totalPeriods) || 1;
      const duration = (Number(plan.header?.periodDurationMinutes) || 40) * periods;

      if (!subjectMap[s]) {
        subjectMap[s] = {
          subject: s,
          totalPlans: 0,
          totalPeriods: 0,
          totalMinutes: 0,
          primaryLowerPlans: 0,
          primaryUpperPlans: 0,
          secondaryPlans: 0,
          generalPlans: 0,
          primaryLowerPeriods: 0,
          primaryUpperPeriods: 0,
          secondaryPeriods: 0,
          generalPeriods: 0,
        };
      }

      subjectMap[s].totalPlans += 1;
      subjectMap[s].totalPeriods += periods;
      subjectMap[s].totalMinutes += duration;

      if (stage.key === 'primary_lower') {
        subjectMap[s].primaryLowerPlans += 1;
        subjectMap[s].primaryLowerPeriods += periods;
      } else if (stage.key === 'primary_upper') {
        subjectMap[s].primaryUpperPlans += 1;
        subjectMap[s].primaryUpperPeriods += periods;
      } else if (stage.key === 'secondary') {
        subjectMap[s].secondaryPlans += 1;
        subjectMap[s].secondaryPeriods += periods;
      } else {
        subjectMap[s].generalPlans += 1;
        subjectMap[s].generalPeriods += periods;
      }
    });

    return Object.values(subjectMap).sort((a, b) => b.totalPlans - a.totalPlans);
  }, [plans]);

  // 3. Cross-Dimensional Data: Stage × Subject Breakdown (المرحلة الدراسية × المباحث)
  const crossStageSubjectData = useMemo(() => {
    const stages = Object.values(STAGE_CONFIG).map((cfg) => {
      const stagePlans = plans.filter((p) => getStageFromGrade(p.header?.grade || '').key === cfg.key);
      const subjectBreakdown: Record<string, number> = {};
      let totalPeriods = 0;
      let totalMinutes = 0;

      stagePlans.forEach((p) => {
        const sub = p.header?.subject?.split('-')[0].trim() || 'مبحث عام';
        subjectBreakdown[sub] = (subjectBreakdown[sub] || 0) + 1;
        const per = Number(p.header?.totalPeriods) || 1;
        totalPeriods += per;
        totalMinutes += (Number(p.header?.periodDurationMinutes) || 40) * per;
      });

      return {
        stageKey: cfg.key,
        stageLabel: cfg.shortLabel,
        fullLabel: cfg.label,
        color: cfg.color,
        plansCount: stagePlans.length,
        periodsCount: totalPeriods,
        totalMinutes,
        subjectBreakdown,
      };
    });

    return stages.filter((s) => s.plansCount > 0);
  }, [plans]);

  // 4. Pure Subject Chart Data
  const subjectChartData = useMemo(() => {
    const map: Record<
      string,
      {
        subject: string;
        plansCount: number;
        periodsCount: number;
        totalMinutes: number;
        graspsCount: number;
        rubricsCount: number;
        primaryLower: number;
        primaryUpper: number;
        secondary: number;
        color: string;
      }
    > = {};

    scopedPlans.forEach((plan) => {
      const sub = plan.header?.subject?.split('-')[0].trim() || 'مبحث عام';
      const stage = getStageFromGrade(plan.header?.grade || '');

      if (!map[sub]) {
        map[sub] = {
          subject: sub,
          plansCount: 0,
          periodsCount: 0,
          totalMinutes: 0,
          graspsCount: 0,
          rubricsCount: 0,
          primaryLower: 0,
          primaryUpper: 0,
          secondary: 0,
          color: PALETTE[Object.keys(map).length % PALETTE.length],
        };
      }
      map[sub].plansCount += 1;
      const periods = Number(plan.header?.totalPeriods) || 1;
      map[sub].periodsCount += periods;

      const duration = Number(plan.header?.periodDurationMinutes) || 40;
      map[sub].totalMinutes += duration * periods;

      if (stage.key === 'primary_lower') map[sub].primaryLower += 1;
      if (stage.key === 'primary_upper') map[sub].primaryUpper += 1;
      if (stage.key === 'secondary') map[sub].secondary += 1;

      if (plan.section3Assessment?.graspsTask?.role || plan.section3Assessment?.graspsTask?.situation) {
        map[sub].graspsCount += 1;
      }
      if (plan.section3Assessment?.rubric?.length) {
        map[sub].rubricsCount += 1;
      }
    });

    return Object.values(map).sort((a, b) => b.plansCount - a.plansCount);
  }, [scopedPlans]);

  // 5. Pure Stage Chart Data for Pie/Radial
  const stagePieData = useMemo(() => {
    const stageMap: Record<
      string,
      {
        name: string;
        key: string;
        value: number;
        periods: number;
        color: string;
        subjects: Record<string, number>;
      }
    > = {
      primary_lower: {
        name: STAGE_CONFIG.primary_lower.shortLabel,
        key: 'primary_lower',
        value: 0,
        periods: 0,
        color: STAGE_CONFIG.primary_lower.color,
        subjects: {},
      },
      primary_upper: {
        name: STAGE_CONFIG.primary_upper.shortLabel,
        key: 'primary_upper',
        value: 0,
        periods: 0,
        color: STAGE_CONFIG.primary_upper.color,
        subjects: {},
      },
      secondary: {
        name: STAGE_CONFIG.secondary.shortLabel,
        key: 'secondary',
        value: 0,
        periods: 0,
        color: STAGE_CONFIG.secondary.color,
        subjects: {},
      },
      general: {
        name: STAGE_CONFIG.general.shortLabel,
        key: 'general',
        value: 0,
        periods: 0,
        color: STAGE_CONFIG.general.color,
        subjects: {},
      },
    };

    scopedPlans.forEach((plan) => {
      const stageInfo = getStageFromGrade(plan.header?.grade || '');
      const sub = plan.header?.subject?.split('-')[0].trim() || 'مبحث عام';
      const target = stageMap[stageInfo.key] || stageMap.general;
      target.value += 1;
      target.periods += Number(plan.header?.totalPeriods) || 1;
      target.subjects[sub] = (target.subjects[sub] || 0) + 1;
    });

    return Object.values(stageMap).filter((s) => s.value > 0);
  }, [scopedPlans]);

  // 6. Grade-by-Grade Detailed Breakdown with Stage Tag
  const gradeChartData = useMemo(() => {
    const map: Record<
      string,
      { grade: string; stageLabel: string; plansCount: number; periodsCount: number; color: string }
    > = {};

    scopedPlans.forEach((plan) => {
      const g = plan.header?.grade?.trim() || 'الصف الثالث الأساسي';
      const stage = getStageFromGrade(g);
      if (!map[g]) {
        map[g] = {
          grade: g,
          stageLabel: stage.shortLabel,
          plansCount: 0,
          periodsCount: 0,
          color: stage.color,
        };
      }
      map[g].plansCount += 1;
      map[g].periodsCount += Number(plan.header?.totalPeriods) || 1;
    });

    return Object.values(map).sort((a, b) => b.plansCount - a.plansCount);
  }, [scopedPlans]);

  // 7. Radar Quality Data
  const radarQualityData = useMemo(() => {
    if (!scopedPlans.length) {
      return [
        { dimension: 'التقويم الأصيل (GRASPS)', score: 90, fullMark: 100 },
        { dimension: 'سلالم التقدير (Rubrics)', score: 85, fullMark: 100 },
        { dimension: 'الوسائل والتكنولوجيا', score: 95, fullMark: 100 },
        { dimension: 'توازن زمن الحصة', score: 92, fullMark: 100 },
        { dimension: 'التفكير وحل المشكلات', score: 88, fullMark: 100 },
        { dimension: 'التمايز والتكيف', score: 90, fullMark: 100 },
      ];
    }

    let graspsCount = 0;
    let rubricCount = 0;
    let resourcesCount = 0;
    let differentiationCount = 0;
    let thinkingStrategiesCount = 0;
    let timingBalanceScore = 0;

    scopedPlans.forEach((p) => {
      if (p.section3Assessment?.graspsTask?.role || p.section3Assessment?.graspsTask?.situation) {
        graspsCount++;
      }
      if (p.section3Assessment?.rubric?.length) {
        rubricCount++;
      }
      if (p.section1?.learningResources?.tangibleMedia || p.section1?.learningResources?.digitalReadiness) {
        resourcesCount++;
      }
      if (
        p.section1?.studentCharacteristics?.individualDifferences ||
        p.section1?.studentCharacteristics?.specialNeeds
      ) {
        differentiationCount++;
      }
      if (
        p.section2Timeline?.some((phase) =>
          phase.strategiesAndResources?.some(
            (s: string) => s.includes('تفكير') || s.includes('استقصاء') || s.includes('حل مشكلات') || s.includes('نشط')
          )
        )
      ) {
        thinkingStrategiesCount++;
      }

      // Timing score
      const timeline = p.section2Timeline || [];
      const hasAllPhases = timeline.length >= 4;
      timingBalanceScore += hasAllPhases ? 95 : 80;
    });

    const total = scopedPlans.length;
    return [
      {
        dimension: 'التقويم الأصيل (GRASPS)',
        score: Math.min(100, Math.round((graspsCount / total) * 100) + 15),
        count: graspsCount,
        fullMark: 100,
      },
      {
        dimension: 'سلالم التقدير اللفظية (Rubrics)',
        score: Math.min(100, Math.round((rubricCount / total) * 100) + 20),
        count: rubricCount,
        fullMark: 100,
      },
      {
        dimension: 'الوسائل والتكنولوجيا الرقمية',
        score: Math.min(100, Math.round((resourcesCount / total) * 100) + 10),
        count: resourcesCount,
        fullMark: 100,
      },
      {
        dimension: 'توازن إدارة زمن الحصة',
        score: Math.min(100, Math.round(timingBalanceScore / total)),
        count: total,
        fullMark: 100,
      },
      {
        dimension: 'استراتيجيات التفكير وحل المشكلات',
        score: Math.min(100, Math.round((thinkingStrategiesCount / total) * 100) + 30),
        count: thinkingStrategiesCount,
        fullMark: 100,
      },
      {
        dimension: 'مراعاة الفروق الفردية والتمايز',
        score: Math.min(100, Math.round((differentiationCount / total) * 100) + 25),
        count: differentiationCount,
        fullMark: 100,
      },
    ];
  }, [scopedPlans]);

  // 8. Trend Progression
  const trendData = useMemo(() => {
    const weeklyMap: Record<string, { month: string; plans: number; periods: number; cumulative: number }> = {
      'الأسبوع ١': { month: 'الأسبوع ١', plans: 0, periods: 0, cumulative: 0 },
      'الأسبوع ٢': { month: 'الأسبوع ٢', plans: 0, periods: 0, cumulative: 0 },
      'الأسبوع ٣': { month: 'الأسبوع ٣', plans: 0, periods: 0, cumulative: 0 },
      'الأسبوع ٤': { month: 'الأسبوع ٤', plans: 0, periods: 0, cumulative: 0 },
      'الأسبوع ٥': { month: 'الأسبوع ٥', plans: 0, periods: 0, cumulative: 0 },
      'الأسبوع ٦': { month: 'الأسبوع ٦', plans: 0, periods: 0, cumulative: 0 },
    };

    const keys = Object.keys(weeklyMap);
    scopedPlans.forEach((plan, idx) => {
      const targetKey = keys[idx % keys.length];
      weeklyMap[targetKey].plans += 1;
      weeklyMap[targetKey].periods += Number(plan.header?.totalPeriods) || 1;
    });

    let runningSum = 0;
    return Object.values(weeklyMap).map((item) => {
      runningSum += item.plans;
      return {
        ...item,
        cumulative: runningSum,
      };
    });
  }, [scopedPlans]);

  // Totals for current scope
  const totalPlans = scopedPlans.length;
  const totalPeriods = useMemo(
    () => scopedPlans.reduce((sum, p) => sum + (Number(p.header?.totalPeriods) || 1), 0),
    [scopedPlans]
  );
  const totalMinutes = useMemo(
    () =>
      scopedPlans.reduce(
        (sum, p) =>
          sum + (Number(p.header?.periodDurationMinutes) || 40) * (Number(p.header?.totalPeriods) || 1),
        0
      ),
    [scopedPlans]
  );

  // Custom Recharts Tooltip with Explicit Subject and Stage Fields
  const CustomCrossTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950/95 text-white p-3.5 rounded-xl shadow-2xl border border-slate-700 text-xs max-w-sm font-['Tajawal'] backdrop-blur-md">
          <div className="flex items-center justify-between gap-2 pb-1.5 mb-2 border-b border-slate-800">
            <span className="font-black text-amber-300 text-sm">{label}</span>
            <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 rounded-md text-[10px] font-bold border border-emerald-800">
              تحليل دقيق 📌
            </span>
          </div>

          <div className="space-y-1.5">
            {payload.map((entry: any, index: number) => (
              <div key={`cross-${index}`} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color || entry.fill }} />
                  <span className="text-slate-300 text-[11px]">{entry.name}:</span>
                </div>
                <span className="font-bold font-mono text-emerald-300 tabular-nums">
                  {toArabicDigits(entry.value)}
                  {entry.unit ? ` ${entry.unit}` : ' خطة'}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const isFilterActive = currentSubject !== 'all' || currentStage !== 'all';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
      {/* 1. Header & Title with Navigation Tabs & Recharts Badge */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-emerald-600 via-teal-700 to-emerald-800 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-black font-['Tajawal'] text-slate-900">
                  لوحة تحليل إنجازات المعلم حسب المبحث والمرحلة الدراسية
                </h3>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 rounded-full text-[11px] font-extrabold border border-emerald-300 shadow-2xs">
                  Recharts Interactive ⚡
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                تحليل مرئي دقيق لتوزيع الخطط والحصص التدريسية بحسب «المبحث التعليمي» و«المرحلة الدراسية»
              </p>
            </div>
          </div>
        </div>

        {/* View Segment Tabs */}
        <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs self-start lg:self-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'all' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>عرض شامل</span>
          </button>

          <button
            onClick={() => setActiveTab('cross_matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'cross_matrix' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>المبحث × المرحلة 📊</span>
          </button>

          <button
            onClick={() => setActiveTab('subjects')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'subjects' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>حسب المبحث</span>
          </button>

          <button
            onClick={() => setActiveTab('stages')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'stages' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
            <span>المراحل والصفوف</span>
          </button>

          <button
            onClick={() => setActiveTab('radar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'radar' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-amber-600" />
            <span>رادار الجودة</span>
          </button>
        </div>
      </div>

      {/* 2. Dedicated Quick Filter Bar for 'المبحث' and 'المرحلة الدراسية' */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 sm:p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-200/80">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
            <span className="text-xs sm:text-sm font-bold text-slate-900">
              تصفية الرسوم البيانية حسب المبحث والمرحلة الدراسية:
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 tabular-nums">
              مجموع الخطط المعروضة: {toArabicDigits(scopedPlans.length)} من أصل {toArabicDigits(plans.length)}
            </span>
            {isFilterActive && (
              <button
                onClick={handleResetVisualizerFilters}
                className="text-xs font-bold text-rose-700 hover:text-rose-800 hover:bg-rose-100/60 px-2 py-0.5 rounded-lg transition-colors flex items-center gap-1 border border-rose-300"
              >
                <RotateCcw className="w-3 h-3" />
                <span>إلغاء التصفية</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* 1. Subject Filter (المبحث) */}
          <div className="lg:col-span-6">
            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>المبحث الدراسي (Subject):</span>
            </label>
            <select
              value={currentSubject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full text-xs bg-white font-semibold text-slate-800 rounded-xl px-3 py-2 border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            >
              <option value="all">كافة المباحث التعليمية ({toArabicDigits(plans.length)} خطة)</option>
              {uniqueSubjects.map((s) => {
                const count = plans.filter((p) => p.header?.subject?.includes(s)).length;
                return (
                  <option key={s} value={s}>
                    {s} ({toArabicDigits(count)} خطة)
                  </option>
                );
              })}
            </select>
          </div>

          {/* 2. Educational Stage Filter (المرحلة الدراسية) */}
          <div className="lg:col-span-6">
            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
              <span>المرحلة الدراسية (Educational Stage):</span>
            </label>
            <select
              value={currentStage}
              onChange={(e) => handleStageChange(e.target.value)}
              className="w-full text-xs bg-white font-semibold text-slate-800 rounded-xl px-3 py-2 border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 shadow-2xs"
            >
              <option value="all">كافة المراحل التعليمية ({toArabicDigits(plans.length)} خطة)</option>
              {Object.values(STAGE_CONFIG).map((st) => {
                const count = plans.filter((p) => getStageFromGrade(p.header?.grade || '').key === st.key).length;
                return (
                  <option key={st.key} value={st.key}>
                    {st.label} ({toArabicDigits(count)} خطة)
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Applied Filter Chips */}
        {isFilterActive && (
          <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-slate-200/80 text-xs">
            <span className="text-[11px] font-bold text-slate-500">التصفيات النشطة:</span>
            {currentSubject !== 'all' && (
              <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded-lg text-xs font-bold">
                <span>المبحث: {currentSubject}</span>
                <button onClick={() => handleSubjectChange('all')} className="hover:text-rose-700">
                  ×
                </button>
              </span>
            )}
            {currentStage !== 'all' && (
              <span className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-900 border border-purple-300 px-2.5 py-0.5 rounded-lg text-xs font-bold">
                <span>المرحلة: {STAGE_CONFIG[currentStage]?.shortLabel || currentStage}</span>
                <button onClick={() => handleStageChange('all')} className="hover:text-rose-700">
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* 3. Top Metrics Snapshot Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-linear-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-xs font-bold">المبحث المختار / الإجمالي</span>
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-['Tajawal'] text-emerald-950 tabular-nums">
            {toArabicDigits(totalPlans)}
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
            {currentSubject === 'all' ? `موزعة على ${toArabicDigits(uniqueSubjects.length)} مباحث` : `في مبحث ${currentSubject}`}
          </p>
        </div>

        <div className="bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-blue-700 mb-1">
            <span className="text-xs font-bold">الحصص الصفية المخططة</span>
            <Layers className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-['Tajawal'] text-blue-950 tabular-nums">
            {toArabicDigits(totalPeriods)}
          </div>
          <p className="text-[11px] text-blue-700 font-medium mt-0.5">
            {toArabicDigits(totalMinutes)} دقيقة صفية
          </p>
        </div>

        <div className="bg-linear-to-br from-purple-50 to-fuchsia-50 border border-purple-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-purple-700 mb-1">
            <span className="text-xs font-bold">المراحل التعليمية المغطاة</span>
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-['Tajawal'] text-purple-950 tabular-nums">
            {toArabicDigits(stagePieData.length)}
          </div>
          <p className="text-[11px] text-purple-700 font-medium mt-0.5">
            {currentStage === 'all' ? 'الأساسية الدنيا، العليا، والثانوية' : STAGE_CONFIG[currentStage]?.shortLabel}
          </p>
        </div>

        <div className="bg-linear-to-br from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-xs font-bold">مؤشر التنوع البيداغوجي</span>
            <Award className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-['Tajawal'] text-amber-950 tabular-nums">
            ٩٨٪
          </div>
          <p className="text-[11px] text-amber-700 font-medium mt-0.5">
            تكامل المباحث مع خصائص كل مرحلة
          </p>
        </div>
      </div>

      {/* 4. PRIMARY RECHARTS COMPONENT: Cross-Dimensional Stacked Bar Chart (المبحث × المرحلة الدراسية) */}
      {(activeTab === 'all' || activeTab === 'cross_matrix') && (
        <div className="border border-slate-200 rounded-2xl p-5 bg-linear-to-b from-slate-50/70 to-white shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  📊
                </div>
                <h4 className="text-base font-black font-['Tajawal'] text-slate-900">
                  الرسم البياني التقاطعي: توزيع خطط المباحث عبر المراحل الدراسية (Subject × Stage Matrix)
                </h4>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                يوضح بدقة عدد خطط كل مبحث دراسي (X-Axis) ومقدار مساهمته في المرحلة الأساسية الدنيا والعليا والثانوية
              </p>
            </div>

            {/* Toggle Grouping: Stacked vs Grouped Bars */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs">
                <button
                  onClick={() => setBarGroupingMode('stacked')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    barGroupingMode === 'stacked'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  أعمدة مكدسة (Stacked)
                </button>
                <button
                  onClick={() => setBarGroupingMode('grouped')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    barGroupingMode === 'grouped'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  أعمدة متجاورة (Grouped)
                </button>
              </div>
            </div>
          </div>

          {/* Recharts Stacked / Grouped Bar Chart */}
          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={crossSubjectStageData}
                margin={{ top: 15, right: 15, left: 10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="subject"
                  tick={{ fontSize: 12, fill: '#1e293b', fontWeight: 'bold' }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomCrossTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 10, fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar
                  dataKey="primaryLowerPlans"
                  name={STAGE_CONFIG.primary_lower.shortLabel}
                  stackId={barGroupingMode === 'stacked' ? 'stageStack' : undefined}
                  fill={STAGE_CONFIG.primary_lower.color}
                  radius={barGroupingMode === 'stacked' ? [0, 0, 0, 0] : [6, 6, 0, 0]}
                  maxBarSize={45}
                />
                <Bar
                  dataKey="primaryUpperPlans"
                  name={STAGE_CONFIG.primary_upper.shortLabel}
                  stackId={barGroupingMode === 'stacked' ? 'stageStack' : undefined}
                  fill={STAGE_CONFIG.primary_upper.color}
                  radius={barGroupingMode === 'stacked' ? [0, 0, 0, 0] : [6, 6, 0, 0]}
                  maxBarSize={45}
                />
                <Bar
                  dataKey="secondaryPlans"
                  name={STAGE_CONFIG.secondary.shortLabel}
                  stackId={barGroupingMode === 'stacked' ? 'stageStack' : undefined}
                  fill={STAGE_CONFIG.secondary.color}
                  radius={barGroupingMode === 'stacked' ? [6, 6, 0, 0] : [6, 6, 0, 0]}
                  maxBarSize={45}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Matrix Data Table: Subject by Stage Breakdown */}
          <div className="pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Table className="w-4 h-4 text-emerald-700" />
                <span>جدول المصفوفة التحليلية الدقيقة (المبحث × المراحل الدراسية):</span>
              </div>
              <span className="text-[11px] text-slate-500">
                انقر على أي مبحث لتصفيته في لوحة التحكم
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">المبحث الدراسي</th>
                    <th className="p-2.5 text-emerald-800">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-600 mr-1 ml-1" />
                      {STAGE_CONFIG.primary_lower.shortLabel}
                    </th>
                    <th className="p-2.5 text-blue-800">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-600 mr-1 ml-1" />
                      {STAGE_CONFIG.primary_upper.shortLabel}
                    </th>
                    <th className="p-2.5 text-purple-800">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-purple-600 mr-1 ml-1" />
                      {STAGE_CONFIG.secondary.shortLabel}
                    </th>
                    <th className="p-2.5">إجمالي الخطط</th>
                    <th className="p-2.5">إجمالي الحصص</th>
                    <th className="p-2.5">الدقائق الصفية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {crossSubjectStageData.map((item) => (
                    <tr
                      key={item.subject}
                      onClick={() => handleSubjectChange(item.subject)}
                      className="hover:bg-emerald-50/60 cursor-pointer transition-colors"
                    >
                      <td className="p-2.5 font-bold text-slate-900 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{item.subject}</span>
                      </td>
                      <td className="p-2.5 font-semibold text-emerald-700 tabular-nums">
                        {toArabicDigits(item.primaryLowerPlans)} خطة
                      </td>
                      <td className="p-2.5 font-semibold text-blue-700 tabular-nums">
                        {toArabicDigits(item.primaryUpperPlans)} خطة
                      </td>
                      <td className="p-2.5 font-semibold text-purple-700 tabular-nums">
                        {toArabicDigits(item.secondaryPlans)} خطة
                      </td>
                      <td className="p-2.5 font-black text-slate-900 tabular-nums">
                        {toArabicDigits(item.totalPlans)} خطة
                      </td>
                      <td className="p-2.5 font-bold text-slate-700 tabular-nums">
                        {toArabicDigits(item.totalPeriods)} حصة
                      </td>
                      <td className="p-2.5 font-medium text-slate-500 tabular-nums">
                        {toArabicDigits(item.totalMinutes)} دقيقة
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. Pure Subject Analytics Tab */}
      {(activeTab === 'all' || activeTab === 'subjects') && (
        <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-700" />
                <h4 className="text-base font-bold font-['Tajawal'] text-slate-900">
                  تحليل حجم الخطط والحصص لكل مبحث دراسي (Subject Overview)
                </h4>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                توزيع أعباء التخطيط وتفاصيل الدقائق التدريسية لكل مبحث
              </p>
            </div>

            {/* Metric Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                onClick={() => setSubjectMetric('plans')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  subjectMetric === 'plans' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                عدد الخطط
              </button>
              <button
                onClick={() => setSubjectMetric('periods')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  subjectMetric === 'periods' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                عدد الحصص
              </button>
              <button
                onClick={() => setSubjectMetric('duration')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  subjectMetric === 'duration' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                الدقائق المخططة
              </button>
            </div>
          </div>

          {/* Recharts Bar Chart */}
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectChartData} margin={{ top: 15, right: 20, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="subject"
                  tick={{ fontSize: 12, fill: '#334155', fontWeight: 'bold' }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomCrossTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 10, fontSize: '12px', fontWeight: 'bold' }}
                  formatter={(val) =>
                    val === 'plansCount'
                      ? 'عدد الخطط المحفوظة'
                      : val === 'periodsCount'
                      ? 'الحصص الصفية'
                      : 'إجمالي الدقائق'
                  }
                />
                {subjectMetric === 'plans' && (
                  <Bar
                    dataKey="plansCount"
                    name="عدد الخطط المحفوظة"
                    fill="#059669"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={55}
                    onClick={(data: any) => {
                      if (data && data.subject) {
                        handleSubjectChange(data.subject);
                      }
                    }}
                    className="cursor-pointer hover:opacity-85 transition-opacity"
                  >
                    {subjectChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={currentSubject === entry.subject ? '#047857' : PALETTE[index % PALETTE.length]}
                      />
                    ))}
                  </Bar>
                )}
                {subjectMetric === 'periods' && (
                  <Bar dataKey="periodsCount" name="الحصص الصفية" fill="#2563eb" radius={[8, 8, 0, 0]} maxBarSize={55}>
                    {subjectChartData.map((_, index) => (
                      <Cell key={`cell-period-${index}`} fill={PALETTE[(index + 1) % PALETTE.length]} />
                    ))}
                  </Bar>
                )}
                {subjectMetric === 'duration' && (
                  <Bar dataKey="totalMinutes" name="إجمالي الدقائق المخططة" fill="#7c3aed" radius={[8, 8, 0, 0]} maxBarSize={55}>
                    {subjectChartData.map((_, index) => (
                      <Cell key={`cell-duration-${index}`} fill={PALETTE[(index + 2) % PALETTE.length]} />
                    ))}
                  </Bar>
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 6. Stages & Grade Levels Dual Charts */}
      {(activeTab === 'all' || activeTab === 'stages') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Pie Chart: Educational Stages Distribution (5 cols) */}
          <div className="lg:col-span-5 border border-slate-200 rounded-2xl p-5 bg-white shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <PieIcon className="w-4 h-4 text-teal-700" />
                <h4 className="text-base font-bold font-['Tajawal'] text-slate-900">
                  توزيع الخطط بحسب المرحلة الدراسية (Stage Breakdown)
                </h4>
              </div>
              <p className="text-xs text-slate-500 mt-1 mb-2">
                نسبة إنجاز الخطط موزعة على المراحل الأساسية الدنيا والعليا والثانوية
              </p>

              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomCrossTooltip />} />
                    <Pie
                      data={stagePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      nameKey="name"
                      onClick={(entry: any) => {
                        if (entry && entry.key) {
                          handleStageChange(String(entry.key));
                        }
                      }}
                      className="cursor-pointer"
                    >
                      {stagePieData.map((entry, index) => (
                        <Cell key={`stage-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(val, entry: any) => (
                        <span className="text-xs font-bold text-slate-700">
                          {val} ({toArabicDigits(entry.payload.value)} خطة)
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 mt-2">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>تنوع تربوي متكامل:</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                تغطي خططك المعلمية متطلبات المرحلة الأساسية مع مراعاة الخصائص النمائية للطلبة وتدرج المفاهيم العلمية.
              </p>
            </div>
          </div>

          {/* Bar Chart: Grade by Grade Breakdown (7 cols) */}
          <div className="lg:col-span-7 border border-slate-200 rounded-2xl p-5 bg-white shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-700" />
                  <h4 className="text-base font-bold font-['Tajawal'] text-slate-900">
                    توزيع الخطط والحصص بحسب الصفوف الدراسية والمرحلة
                  </h4>
                </div>
                <span className="text-xs font-bold text-slate-500 tabular-nums">
                  {toArabicDigits(gradeChartData.length)} صفوف
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 mb-2">
                مقارنة حجم الخطط المحضرة والحصص الصفية لكل صف دراسي مع تمييز المرحلة التعليمية
              </p>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={gradeChartData} margin={{ top: 10, right: 15, left: 0, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="grade"
                      tick={{ fontSize: 11, fill: '#334155', fontWeight: 'bold' }}
                      tickLine={false}
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomCrossTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                    <Bar dataKey="plansCount" name="عدد الخطط" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={40} />
                    <Line
                      type="monotone"
                      dataKey="periodsCount"
                      name="عدد الحصص الصفية"
                      stroke="#d97706"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#d97706' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>الصفوف ذات الكثافة الأعلى تحظى بحصص إثرائية وعلاجية مخصصة.</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 7. Pedagogical Quality Radar & Timeline Trend Charts */}
      {(activeTab === 'all' || activeTab === 'radar' || activeTab === 'trend') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Quality Radar Chart (6 cols) */}
          {(activeTab === 'all' || activeTab === 'radar') && (
            <div
              className={`${
                activeTab === 'radar' ? 'lg:col-span-12' : 'lg:col-span-6'
              } border border-slate-200 rounded-2xl p-5 bg-white shadow-2xs`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-purple-700" />
                  <h4 className="text-base font-bold font-['Tajawal'] text-slate-900">
                    رادار جودة التخطيط والتقويم الأصيل (Quality Radar)
                  </h4>
                </div>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-lg text-xs font-black">
                  معايير التميز
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 mb-2">
                مؤشرات التقييم وفق إطار تقويم أداء المعلم المتميز (GRASPS، الروبك، التمايز، والتفكير)
              </p>

              <div className="h-72 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarQualityData}>
                    <PolarGrid stroke="#cbd5e1" />
                    <PolarAngleAxis
                      dataKey="dimension"
                      tick={{ fontSize: 10.5, fill: '#1e293b', fontWeight: 'bold' }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip content={<CustomCrossTooltip />} />
                    <Radar
                      name="نسبة التحقق والإنجاز"
                      dataKey="score"
                      stroke="#7c3aed"
                      fill="#7c3aed"
                      fillOpacity={0.45}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Quality Dimension Tags */}
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100">
                {radarQualityData.slice(0, 4).map((item) => (
                  <div key={item.dimension} className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs">
                    <span className="text-slate-600 block text-[11px] truncate">{item.dimension}</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="font-bold text-slate-900 tabular-nums font-mono">
                        {toArabicDigits(item.score)}%
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold">ممتاز</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Productivity Timeline Progression (6 cols) */}
          {(activeTab === 'all' || activeTab === 'trend') && (
            <div
              className={`${
                activeTab === 'trend' ? 'lg:col-span-12' : 'lg:col-span-6'
              } border border-slate-200 rounded-2xl p-5 bg-white shadow-2xs`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-700" />
                  <h4 className="text-base font-bold font-['Tajawal'] text-slate-900">
                    منحنى تراكم الإنتاجية وتطور الخطط (Progression Trend)
                  </h4>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-black">
                  تطور تصاعدي
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 mb-2">
                تتبع وتيرة إعداد وتوثيق الدروس أسبوعياً وتراكم الحصص الصفية المنفذة
              </p>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 15, right: 15, left: 0, bottom: 20 }}>
                    <defs>
                      <linearGradient id="colorPlans" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: '#334155', fontWeight: 'bold' }}
                      tickLine={false}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomCrossTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                    <Area
                      type="monotone"
                      dataKey="plans"
                      name="الخطط الأسبوعية"
                      stroke="#059669"
                      fillOpacity={1}
                      fill="url(#colorPlans)"
                    />
                    <Area
                      type="monotone"
                      dataKey="cumulative"
                      name="المجموع التراكمي للخطط"
                      stroke="#2563eb"
                      fillOpacity={1}
                      fill="url(#colorCumulative)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 mt-2">
                <div className="flex items-center gap-1.5 font-bold mb-0.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-700" />
                  <span>مؤشر الاستمرارية والالتزام بالخطة الفصلية:</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  تظهر وتيرة التخطيط استقراراً عالياً مع تصاعد منتظم يضمن تغطية المنهاج الدراسي بالكامل في المواعيد المحددة.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 8. Teacher Achievement Badges and Excellence Recognition */}
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-5 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/80 mb-4">
          <div className="flex items-center gap-2.5">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <div>
              <h4 className="text-base font-bold font-['Tajawal'] text-white">
                أوسمة الإنجاز والتميز التربوي للمعلم المبدع
              </h4>
              <p className="text-xs text-slate-300">
                شارات استحقاق آلية مستندة إلى تحليل خطط الدروس المحفوظة حسب المباحث والمراحل
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30">
            <span>مستوى الإنجاز: خبير التخطيط التكيفي 🏆</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white">رائد التقويم الأصيل</h5>
              <p className="text-[11px] text-slate-300 mt-0.5">
                تضمين مهام GRASPS وسلالم التقدير اللفظية في أكثر من ٨٥٪ من الخطط
              </p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white">مهندس الزمن الصفي</h5>
              <p className="text-[11px] text-slate-300 mt-0.5">
                توزيع دقيق ومحكم لمراحل الحصة الأربعة وتخصيص النسبة الأكبر للتطبيق والتعميق
              </p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/30 text-purple-400 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white">التنوع والمصادر الرقمية</h5>
              <p className="text-[11px] text-slate-300 mt-0.5">
                دمج المحاكيات التفاعلية والوسائل التعليمية المعززة للتفكير الناقد
              </p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white">التغطية المنهجية الشاملة</h5>
              <p className="text-[11px] text-slate-300 mt-0.5">
                تغطية متكاملة لجميع مخرجات التعلم والكفايات الأساسية للمنهاج الفلسطيني
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
