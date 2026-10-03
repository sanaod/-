import React, { useState, useMemo } from 'react';
import { LessonPlan } from '../types/lessonPlan';
import { toArabicDigits } from '../utils/arabicNumerals';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  Filter,
  Search,
  Printer,
  Sparkles,
  Calculator,
  ArrowUpRight,
  TrendingUp,
  Award,
  Layers,
  FileText,
  Calendar,
  Eye,
  SlidersHorizontal,
  ChevronLeft,
  PieChart as PieIcon,
  BarChart2,
  Compass,
  AlertCircle,
  HelpCircle,
  PlusCircle,
  Download,
  GraduationCap,
  X,
  RotateCcw,
  FileEdit,
  FileDown,
  Trash2,
  Folder,
  FolderOpen,
  FolderTree,
  FolderKanban,
  UserCheck,
  User,
  Users,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  Tag,
  FileCheck2,
} from 'lucide-react';
import { TeacherReportPdfModal } from './TeacherReportPdfModal';
import { TeacherAchievementsVisualizer, getStageFromGrade, STAGE_CONFIG } from './TeacherAchievementsVisualizer';
import { TeacherMonthlyCalendar } from './TeacherMonthlyCalendar';

export type FolderIndexingMode = 'by_subject' | 'by_teacher' | 'tree' | 'table';

interface TeacherDashboardProps {
  plans: LessonPlan[];
  activePlanId: string;
  onSelectPlan: (id: string) => void;
  onOpenEditor: () => void;
  onOpenAiGenerator: () => void;
  onOpenWorksheetModal?: (planId?: string) => void;
  onOpenPrintView: (planId?: string) => void;
  onOpenBlankTemplateModal?: () => void;
  onDeletePlan?: (planId: string) => void;
  onOpenResourcesModal?: () => void;
  resourcesCount?: number;
  onOpenAbacusModal?: () => void;
}

// Subject color mappings
const SUBJECT_COLORS: Record<string, { bg: string; fill: string; stroke: string; lightBg: string; text: string }> = {
  الرياضيات: {
    bg: 'bg-emerald-600',
    fill: '#059669',
    stroke: '#047857',
    lightBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    text: 'text-emerald-700',
  },
  'اللغة العربية': {
    bg: 'bg-blue-600',
    fill: '#2563eb',
    stroke: '#1d4ed8',
    lightBg: 'bg-blue-50 text-blue-800 border-blue-200',
    text: 'text-blue-700',
  },
  'العلوم والحياة': {
    bg: 'bg-purple-600',
    fill: '#7c3aed',
    stroke: '#6d28d9',
    lightBg: 'bg-purple-50 text-purple-800 border-purple-200',
    text: 'text-purple-700',
  },
  'الدراسات الاجتماعية': {
    bg: 'bg-amber-600',
    fill: '#d97706',
    stroke: '#b45309',
    lightBg: 'bg-amber-50 text-amber-800 border-amber-200',
    text: 'text-amber-700',
  },
  'التربية الإسلامية': {
    bg: 'bg-teal-600',
    fill: '#0d9488',
    stroke: '#0f766e',
    lightBg: 'bg-teal-50 text-teal-800 border-teal-200',
    text: 'text-teal-700',
  },
  'التكنولوجيا والبرمجة': {
    bg: 'bg-cyan-600',
    fill: '#0891b2',
    stroke: '#0e7490',
    lightBg: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    text: 'text-cyan-700',
  },
  التكنولوجيا: {
    bg: 'bg-cyan-600',
    fill: '#0891b2',
    stroke: '#0e7490',
    lightBg: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    text: 'text-cyan-700',
  },
  'اللغة الإنجليزية': {
    bg: 'bg-indigo-600',
    fill: '#4f46e5',
    stroke: '#4338ca',
    lightBg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    text: 'text-indigo-700',
  },
  افتراضي: {
    bg: 'bg-slate-600',
    fill: '#475569',
    stroke: '#334155',
    lightBg: 'bg-slate-50 text-slate-800 border-slate-200',
    text: 'text-slate-700',
  },
};

const getSubjectStyle = (subjectName: string) => {
  for (const key of Object.keys(SUBJECT_COLORS)) {
    if (subjectName.includes(key)) {
      return SUBJECT_COLORS[key];
    }
  }
  return SUBJECT_COLORS['افتراضي'];
};

// Teacher avatar & badge color styling
const TEACHER_COLORS = [
  { bg: 'bg-emerald-50 text-emerald-800 border-emerald-300', dot: 'bg-emerald-600', badge: 'bg-emerald-600 text-white' },
  { bg: 'bg-blue-50 text-blue-800 border-blue-300', dot: 'bg-blue-600', badge: 'bg-blue-600 text-white' },
  { bg: 'bg-purple-50 text-purple-800 border-purple-300', dot: 'bg-purple-600', badge: 'bg-purple-600 text-white' },
  { bg: 'bg-amber-50 text-amber-800 border-amber-300', dot: 'bg-amber-600', badge: 'bg-amber-600 text-white' },
  { bg: 'bg-rose-50 text-rose-800 border-rose-300', dot: 'bg-rose-600', badge: 'bg-rose-600 text-white' },
  { bg: 'bg-cyan-50 text-cyan-800 border-cyan-300', dot: 'bg-cyan-600', badge: 'bg-cyan-600 text-white' },
  { bg: 'bg-indigo-50 text-indigo-800 border-indigo-300', dot: 'bg-indigo-600', badge: 'bg-indigo-600 text-white' },
  { bg: 'bg-teal-50 text-teal-800 border-teal-300', dot: 'bg-teal-600', badge: 'bg-teal-600 text-white' },
];

const getTeacherBadgeStyle = (teacherName: string) => {
  if (!teacherName) return TEACHER_COLORS[0];
  let hash = 0;
  for (let i = 0; i < teacherName.length; i++) {
    hash = teacherName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % TEACHER_COLORS.length;
  return TEACHER_COLORS[index];
};

// 4 Lesson Phases Standard definition
const STANDARD_PHASES = [
  {
    key: 'phase1',
    label: '١. التمهيد والتهيئة',
    sub: 'إثارة الدافعية والربط الاستكشافي',
    color: '#0284c7', // Sky / Cyan
    colorTailwind: 'bg-sky-600',
    recommendedPctRange: '10% - 15%',
    minPct: 10,
    maxPct: 15,
  },
  {
    key: 'phase2',
    label: '٢. العرض والاستكشاف',
    sub: 'النمذجة والمحسوسات والمفاهيم',
    color: '#059669', // Emerald
    colorTailwind: 'bg-emerald-600',
    recommendedPctRange: '35% - 40%',
    minPct: 35,
    maxPct: 40,
  },
  {
    key: 'phase3',
    label: '٣. التطبيق والتعميق',
    sub: 'المهام الأصيلة GRASPS والتمايز',
    color: '#d97706', // Amber
    colorTailwind: 'bg-amber-600',
    recommendedPctRange: '30% - 35%',
    minPct: 30,
    maxPct: 35,
  },
  {
    key: 'phase4',
    label: '٤. الخاتمة والتقويم',
    sub: 'بطاقات الخروج والتغذية الختامية',
    color: '#7c3aed', // Purple
    colorTailwind: 'bg-purple-600',
    recommendedPctRange: '15% - 20%',
    minPct: 15,
    maxPct: 20,
  },
];

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  plans,
  activePlanId,
  onSelectPlan,
  onOpenEditor,
  onOpenAiGenerator,
  onOpenWorksheetModal,
  onOpenPrintView,
  onOpenBlankTemplateModal,
  onDeletePlan,
  onOpenResourcesModal,
  resourcesCount = 0,
  onOpenAbacusModal,
}) => {
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState<string>('all');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('all');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [chartMetric, setChartMetric] = useState<'plans' | 'periods'>('plans');
  const [hoveredPhaseIndex, setHoveredPhaseIndex] = useState<number | null>(null);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [isReportPdfModalOpen, setIsReportPdfModalOpen] = useState(false);

  // Folder Indexing state (Default: by subject, easily toggled by teacher or tree)
  const [indexingMode, setIndexingMode] = useState<FolderIndexingMode>('by_subject');
  const [expandedSubjectFolders, setExpandedSubjectFolders] = useState<Record<string, boolean>>({});
  const [expandedTeacherFolders, setExpandedTeacherFolders] = useState<Record<string, boolean>>({});
  const [expandedTreeSubjects, setExpandedTreeSubjects] = useState<Record<string, boolean>>({});

  const activePlan = useMemo(
    () => plans.find((p) => p.id === activePlanId) || plans[0],
    [plans, activePlanId]
  );

  // Extract unique subjects
  const subjectList = useMemo(() => {
    const set = new Set<string>();
    plans.forEach((p) => {
      const s = p.header.subject.split('-')[0].trim();
      set.add(s);
    });
    return Array.from(set).sort();
  }, [plans]);

  // Extract unique teachers
  const teacherList = useMemo(() => {
    const set = new Set<string>();
    plans.forEach((p) => {
      const t = p.header.teacherName?.trim();
      if (t) set.add(t);
    });
    return Array.from(set).sort();
  }, [plans]);

  // Count plans per teacher
  const teacherCounts = useMemo(() => {
    const map: Record<string, number> = {};
    plans.forEach((p) => {
      const t = p.header.teacherName?.trim() || 'معلم غير محدد';
      map[t] = (map[t] || 0) + 1;
    });
    return map;
  }, [plans]);

  // Extract unique grade levels, ensuring الصف الأول and الصف الثاني are always available
  const gradeList = useMemo(() => {
    const defaultGrades = ['الصف الأول', 'الصف الثاني'];
    const set = new Set<string>(defaultGrades);
    plans.forEach((p) => {
      const g = p.header.grade?.trim();
      if (g) {
        set.add(g);
      }
    });
    return Array.from(set);
  }, [plans]);

  // Count plans per subject
  const subjectCounts = useMemo(() => {
    const map: Record<string, number> = {};
    plans.forEach((p) => {
      const s = p.header.subject.split('-')[0].trim();
      map[s] = (map[s] || 0) + 1;
    });
    return map;
  }, [plans]);

  // Count plans per grade
  const gradeCounts = useMemo(() => {
    const map: Record<string, number> = {
      'الصف الأول': 0,
      'الصف الثاني': 0,
    };
    plans.forEach((p) => {
      const g = p.header.grade?.trim();
      if (g) {
        map[g] = (map[g] || 0) + 1;
        if (g.includes('الأول') && g !== 'الصف الأول') {
          map['الصف الأول'] = (map['الصف الأول'] || 0) + 1;
        }
        if (g.includes('الثاني') && g !== 'الصف الثاني') {
          map['الصف الثاني'] = (map['الصف الثاني'] || 0) + 1;
        }
      }
    });
    return map;
  }, [plans]);

  // Filtered plans
  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const matchSubject =
        selectedSubjectFilter === 'all' ||
        plan.header.subject.toLowerCase().includes(selectedSubjectFilter.toLowerCase());
      const matchTeacher =
        selectedTeacherFilter === 'all' ||
        (plan.header.teacherName?.trim() || '').toLowerCase().includes(selectedTeacherFilter.toLowerCase());
      const stage = getStageFromGrade(plan.header.grade || '');
      const matchStage =
        selectedStageFilter === 'all' || stage.key === selectedStageFilter;
      const matchGrade =
        selectedGradeFilter === 'all' ||
        (selectedGradeFilter === 'الصف الأول'
          ? plan.header.grade.includes('الأول')
          : selectedGradeFilter === 'الصف الثاني'
          ? plan.header.grade.includes('الثاني')
          : plan.header.grade.toLowerCase().includes(selectedGradeFilter.toLowerCase()));
      const matchSearch =
        searchQuery.trim() === '' ||
        plan.header.lessonTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.header.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.header.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.header.teacherName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSubject && matchTeacher && matchStage && matchGrade && matchSearch;
    });
  }, [plans, selectedSubjectFilter, selectedTeacherFilter, selectedStageFilter, selectedGradeFilter, searchQuery]);

  const isFilterActive =
    selectedSubjectFilter !== 'all' ||
    selectedTeacherFilter !== 'all' ||
    selectedStageFilter !== 'all' ||
    selectedGradeFilter !== 'all' ||
    searchQuery.trim() !== '';

  const handleResetFilters = () => {
    setSelectedSubjectFilter('all');
    setSelectedTeacherFilter('all');
    setSelectedStageFilter('all');
    setSelectedGradeFilter('all');
    setSearchQuery('');
  };

  // Toggle helpers for folders (Default open if not explicitly set to false)
  const isSubjectOpen = (subject: string) => expandedSubjectFolders[subject] !== false;
  const isTeacherOpen = (teacher: string) => expandedTeacherFolders[teacher] !== false;
  const isTreeSubjectOpen = (subject: string) => expandedTreeSubjects[subject] !== false;

  const toggleSubjectFolder = (subject: string) => {
    setExpandedSubjectFolders((prev) => ({
      ...prev,
      [subject]: prev[subject] !== undefined ? !prev[subject] : false,
    }));
  };

  const toggleTeacherFolder = (teacher: string) => {
    setExpandedTeacherFolders((prev) => ({
      ...prev,
      [teacher]: prev[teacher] !== undefined ? !prev[teacher] : false,
    }));
  };

  const toggleTreeSubject = (subject: string) => {
    setExpandedTreeSubjects((prev) => ({
      ...prev,
      [subject]: prev[subject] !== undefined ? !prev[subject] : false,
    }));
  };

  const expandAllFolders = () => {
    const sMap: Record<string, boolean> = {};
    subjectList.forEach((s) => (sMap[s] = true));
    const tMap: Record<string, boolean> = {};
    teacherList.forEach((t) => (tMap[t] = true));
    setExpandedSubjectFolders(sMap);
    setExpandedTeacherFolders(tMap);
    setExpandedTreeSubjects(sMap);
  };

  const collapseAllFolders = () => {
    const sMap: Record<string, boolean> = {};
    subjectList.forEach((s) => (sMap[s] = false));
    const tMap: Record<string, boolean> = {};
    teacherList.forEach((t) => (tMap[t] = false));
    setExpandedSubjectFolders(sMap);
    setExpandedTeacherFolders(tMap);
    setExpandedTreeSubjects(sMap);
  };

  // Data structure for folders indexed by Subject
  const subjectFoldersData = useMemo(() => {
    const map: Record<
      string,
      {
        subject: string;
        style: ReturnType<typeof getSubjectStyle>;
        plans: LessonPlan[];
        totalPeriods: number;
        totalMinutes: number;
        teachers: {
          teacherName: string;
          badgeStyle: ReturnType<typeof getTeacherBadgeStyle>;
          plans: LessonPlan[];
          totalPeriods: number;
          totalMinutes: number;
        }[];
      }
    > = {};

    // Populate every known subject
    subjectList.forEach((s) => {
      map[s] = {
        subject: s,
        style: getSubjectStyle(s),
        plans: [],
        totalPeriods: 0,
        totalMinutes: 0,
        teachers: [],
      };
    });

    filteredPlans.forEach((plan) => {
      const s = plan.header.subject.split('-')[0].trim();
      if (!map[s]) {
        map[s] = {
          subject: s,
          style: getSubjectStyle(s),
          plans: [],
          totalPeriods: 0,
          totalMinutes: 0,
          teachers: [],
        };
      }
      map[s].plans.push(plan);
      map[s].totalPeriods += Number(plan.header.totalPeriods) || 1;
      map[s].totalMinutes +=
        (Number(plan.header.periodDurationMinutes) || 40) * (Number(plan.header.totalPeriods) || 1);
    });

    // Sub-group each subject folder by teacher
    Object.values(map).forEach((folder) => {
      const tMap: Record<string, LessonPlan[]> = {};
      folder.plans.forEach((p) => {
        const t = p.header.teacherName?.trim() || 'معلم غير محدد';
        if (!tMap[t]) tMap[t] = [];
        tMap[t].push(p);
      });
      folder.teachers = Object.entries(tMap).map(([teacherName, tPlans]) => ({
        teacherName,
        badgeStyle: getTeacherBadgeStyle(teacherName),
        plans: tPlans,
        totalPeriods: tPlans.reduce((acc, p) => acc + (Number(p.header.totalPeriods) || 1), 0),
        totalMinutes: tPlans.reduce(
          (acc, p) =>
            acc + (Number(p.header.periodDurationMinutes) || 40) * (Number(p.header.totalPeriods) || 1),
          0
        ),
      }));
    });

    // Only return folders that have plans, or if no filter is active return all known subjects
    return Object.values(map).filter((f) => !isFilterActive || f.plans.length > 0);
  }, [filteredPlans, subjectList, isFilterActive]);

  // Data structure for folders indexed by Teacher's Name
  const teacherFoldersData = useMemo(() => {
    const map: Record<
      string,
      {
        teacherName: string;
        badgeStyle: ReturnType<typeof getTeacherBadgeStyle>;
        plans: LessonPlan[];
        totalPeriods: number;
        totalMinutes: number;
        subjects: {
          subjectName: string;
          style: ReturnType<typeof getSubjectStyle>;
          plans: LessonPlan[];
          totalPeriods: number;
          totalMinutes: number;
        }[];
      }
    > = {};

    // Populate every known teacher
    teacherList.forEach((t) => {
      map[t] = {
        teacherName: t,
        badgeStyle: getTeacherBadgeStyle(t),
        plans: [],
        totalPeriods: 0,
        totalMinutes: 0,
        subjects: [],
      };
    });

    filteredPlans.forEach((plan) => {
      const t = plan.header.teacherName?.trim() || 'معلم غير محدد';
      if (!map[t]) {
        map[t] = {
          teacherName: t,
          badgeStyle: getTeacherBadgeStyle(t),
          plans: [],
          totalPeriods: 0,
          totalMinutes: 0,
          subjects: [],
        };
      }
      map[t].plans.push(plan);
      map[t].totalPeriods += Number(plan.header.totalPeriods) || 1;
      map[t].totalMinutes +=
        (Number(plan.header.periodDurationMinutes) || 40) * (Number(plan.header.totalPeriods) || 1);
    });

    // Sub-group each teacher folder by subject
    Object.values(map).forEach((folder) => {
      const sMap: Record<string, LessonPlan[]> = {};
      folder.plans.forEach((p) => {
        const s = p.header.subject.split('-')[0].trim();
        if (!sMap[s]) sMap[s] = [];
        sMap[s].push(p);
      });
      folder.subjects = Object.entries(sMap).map(([subjectName, sPlans]) => ({
        subjectName,
        style: getSubjectStyle(subjectName),
        plans: sPlans,
        totalPeriods: sPlans.reduce((acc, p) => acc + (Number(p.header.totalPeriods) || 1), 0),
        totalMinutes: sPlans.reduce(
          (acc, p) =>
            acc + (Number(p.header.periodDurationMinutes) || 40) * (Number(p.header.totalPeriods) || 1),
          0
        ),
      }));
    });

    // Only return folders that have plans, or if no filter is active return all known teachers
    return Object.values(map).filter((f) => !isFilterActive || f.plans.length > 0);
  }, [filteredPlans, teacherList, isFilterActive]);

  // Scope plans for metrics & charts: when filters are applied, metrics adapt to the filtered scope
  const targetPlans = isFilterActive && filteredPlans.length > 0 ? filteredPlans : plans;

  // Aggregated Statistics
  const stats = useMemo(() => {
    const totalPlans = targetPlans.length;
    const totalPeriods = targetPlans.reduce((acc, p) => acc + (Number(p.header.totalPeriods) || 1), 0);
    const totalMinutesPlanned = targetPlans.reduce(
      (acc, p) => acc + (Number(p.header.periodDurationMinutes) || 40) * (Number(p.header.totalPeriods) || 1),
      0
    );
    const avgDuration =
      totalPlans > 0
        ? Math.round(
            targetPlans.reduce((acc, p) => acc + (Number(p.header.periodDurationMinutes) || 40), 0) / totalPlans
          )
        : 40;

    // Subject breakdown
    const subjectMap: Record<string, { count: number; periods: number; minutes: number; plans: LessonPlan[] }> = {};
    targetPlans.forEach((p) => {
      const s = p.header.subject.split('-')[0].trim();
      if (!subjectMap[s]) {
        subjectMap[s] = { count: 0, periods: 0, minutes: 0, plans: [] };
      }
      subjectMap[s].count += 1;
      subjectMap[s].periods += Number(p.header.totalPeriods) || 1;
      subjectMap[s].minutes += (Number(p.header.periodDurationMinutes) || 40) * (Number(p.header.totalPeriods) || 1);
      subjectMap[s].plans.push(p);
    });

    const subjectStats = Object.entries(subjectMap).map(([subject, data]) => ({
      subject,
      count: data.count,
      periods: data.periods,
      minutes: data.minutes,
      plans: data.plans,
      percentage: totalPlans > 0 ? Math.round((data.count / totalPlans) * 100) : 0,
      style: getSubjectStyle(subject),
    }));

    // Average duration across the 4 phases
    let p1MinutesTotal = 0;
    let p2MinutesTotal = 0;
    let p3MinutesTotal = 0;
    let p4MinutesTotal = 0;
    let validTimelineCount = 0;

    targetPlans.forEach((plan) => {
      const timeline = plan.section2Timeline;
      if (Array.isArray(timeline) && timeline.length >= 4) {
        p1MinutesTotal += Number(timeline[0]?.durationMinutes) || 5;
        p2MinutesTotal += Number(timeline[1]?.durationMinutes) || 15;
        p3MinutesTotal += Number(timeline[2]?.durationMinutes) || 12;
        p4MinutesTotal += Number(timeline[3]?.durationMinutes) || 8;
        validTimelineCount++;
      } else if (Array.isArray(timeline) && timeline.length > 0) {
        p1MinutesTotal += Math.round((Number(plan.header.periodDurationMinutes) || 40) * 0.12);
        p2MinutesTotal += Math.round((Number(plan.header.periodDurationMinutes) || 40) * 0.4);
        p3MinutesTotal += Math.round((Number(plan.header.periodDurationMinutes) || 40) * 0.3);
        p4MinutesTotal += Math.round((Number(plan.header.periodDurationMinutes) || 40) * 0.18);
        validTimelineCount++;
      }
    });

    const countForAvg = validTimelineCount || 1;
    const avgP1 = Math.round((p1MinutesTotal / countForAvg) * 10) / 10;
    const avgP2 = Math.round((p2MinutesTotal / countForAvg) * 10) / 10;
    const avgP3 = Math.round((p3MinutesTotal / countForAvg) * 10) / 10;
    const avgP4 = Math.round((p4MinutesTotal / countForAvg) * 10) / 10;
    const sumAvgMinutes = avgP1 + avgP2 + avgP3 + avgP4 || 40;

    const phaseStats = [
      {
        ...STANDARD_PHASES[0],
        avgMinutes: avgP1,
        percentage: Math.round((avgP1 / sumAvgMinutes) * 100),
      },
      {
        ...STANDARD_PHASES[1],
        avgMinutes: avgP2,
        percentage: Math.round((avgP2 / sumAvgMinutes) * 100),
      },
      {
        ...STANDARD_PHASES[2],
        avgMinutes: avgP3,
        percentage: Math.round((avgP3 / sumAvgMinutes) * 100),
      },
      {
        ...STANDARD_PHASES[3],
        avgMinutes: avgP4,
        percentage: Math.round((avgP4 / sumAvgMinutes) * 100),
      },
    ];

    let balanceScore = 100;
    phaseStats.forEach((phase) => {
      if (phase.percentage < phase.minPct) {
        balanceScore -= Math.min(20, (phase.minPct - phase.percentage) * 3);
      } else if (phase.percentage > phase.maxPct) {
        balanceScore -= Math.min(20, (phase.percentage - phase.maxPct) * 3);
      }
    });
    balanceScore = Math.max(65, Math.min(98, Math.round(balanceScore)));

    const graspsCount = targetPlans.filter((p) => p.section3Assessment?.graspsTask?.title?.trim()).length;
    const rubricCount = targetPlans.filter(
      (p) => Array.isArray(p.section3Assessment?.rubric) && p.section3Assessment.rubric.length >= 3
    ).length;
    const signedCount = targetPlans.filter((p) => p.section6Signatures?.teacher?.name?.trim()).length;

    const competencyHits: Record<string, number> = {
      'التفكير الناقد وحل المشكلات': 0,
      'المواطنة والهوية الوطنية': 0,
      'الحساب والرياضيات': 0,
      'القرائية والتعبير اللغوي': 0,
      'الاستقصاء والتجريب العملي': 0,
      'التعلم الرقمي والتكنولوجي': 0,
    };

    targetPlans.forEach((p) => {
      const compList = p.section1?.integrativeCompetencies || [];
      compList.forEach((c) => {
        const text = `${c.title} ${c.description}`;
        if (text.includes('ناقد') || text.includes('مشكلات') || text.includes('تحليل')) {
          competencyHits['التفكير الناقد وحل المشكلات']++;
        }
        if (text.includes('مواطن') || text.includes('وطن') || text.includes('فلسطين') || text.includes('هوية')) {
          competencyHits['المواطنة والهوية الوطنية']++;
        }
        if (text.includes('حساب') || text.includes('رياض') || text.includes('أرقام')) {
          competencyHits['الحساب والرياضيات']++;
        }
        if (text.includes('قراء') || text.includes('لغ') || text.includes('تعبير') || text.includes('نطق')) {
          competencyHits['القرائية والتعبير اللغوي']++;
        }
        if (text.includes('استقصاء') || text.includes('تجرب') || text.includes('علم') || text.includes('مختبر')) {
          competencyHits['الاستقصاء والتجريب العملي']++;
        }
        if (text.includes('رقمي') || text.includes('محاكاة') || text.includes('حاسوب') || text.includes('تطبيق')) {
          competencyHits['التعلم الرقمي والتكنولوجي']++;
        }
      });
    });

    return {
      totalPlans,
      totalOverallPlans: plans.length,
      totalPeriods,
      totalMinutesPlanned,
      avgDuration,
      subjectStats,
      phaseStats,
      sumAvgMinutes,
      balanceScore,
      graspsCount,
      rubricCount,
      signedCount,
      competencyHits,
    };
  }, [targetPlans, plans.length]);

  // Max value for Bar Chart scaling
  const maxBarValue = useMemo(() => {
    if (stats.subjectStats.length === 0) return 1;
    const values = stats.subjectStats.map((s) => (chartMetric === 'plans' ? s.count : s.periods));
    return Math.max(...values, 3);
  }, [stats.subjectStats, chartMetric]);

  // Donut Chart Math
  const donutSlices = useMemo(() => {
    let currentAngle = -90; // Start at top
    const radius = 68;
    const strokeWidth = 28;
    const cx = 95;
    const cy = 95;
    const circumference = 2 * Math.PI * radius;

    return stats.phaseStats.map((phase) => {
      const angle = (phase.percentage / 100) * 360;
      const strokeDasharray = `${(phase.percentage / 100) * circumference} ${circumference}`;
      const strokeDashoffset = -((currentAngle + 90) / 360) * circumference;
      currentAngle += angle;

      return {
        ...phase,
        strokeDasharray,
        strokeDashoffset,
        cx,
        cy,
        radius,
        strokeWidth,
      };
    });
  }, [stats.phaseStats]);

  const handlePrintDashboard = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* 1. Main Title & Identity Header Card (العنوان الرئيسي وهوية المنظومة) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="relative group shrink-0">
              <img
                src="/logo.png"
                alt="شعار منظومة عبقور"
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-amber-400 shadow-md ring-2 ring-emerald-500/20 group-hover:scale-105 transition-transform"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs font-semibold text-slate-500 mb-1">
                <span className="text-emerald-800 font-bold">منظومة عبقور للتخطيط التربوي</span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-700 font-bold">لوحة معلومات المتابعة والإنتاجية</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-900 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  إعداد وتصميم: أ. عبد الرحمن دويكات
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-['Tajawal'] text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-emerald-600 shrink-0" />
                <span>لوحة مؤشرات إنتاجية المعلم وتوزيع زمن الحصص والمجلدات المفهرسة</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
                متابعة إحصائية فورية لخطط الدروس المحضرة، وتوزيع الخطط حسب المباحث والمعلمين، ومعدل توزيع زمن الحصص على المراحل الأربعة وفق معايير التميز التربوي.
              </p>
            </div>
          </div>

          {/* Quick Summary Pill Counters */}
          <div className="flex flex-wrap items-center gap-2 shrink-0 self-start md:self-center">
            <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-bold text-emerald-900">
                إجمالي الخطط: <strong className="text-emerald-700 tabular-nums">{toArabicDigits(plans.length)}</strong>
              </span>
            </div>
            <div className="bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-purple-700" />
              <span className="text-xs font-bold text-purple-900">
                المعلمون: <strong className="text-purple-700 tabular-nums">{toArabicDigits(teacherList.length)}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Dedicated Action Toolbar Directly Below Main Title (شريط الأدوات المنظّم أسفل العنوان الرئيسي) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-xs no-print">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Group 1: Navigation & New Preparation (التنقل السريع والتحضير) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenEditor}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-300 hover:border-slate-400 shadow-2xs hover:shadow-xs active:scale-97 cursor-pointer"
              title="الانتقال إلى محرر الخطة للتعديل والكتابة"
            >
              <ChevronLeft className="w-4 h-4 text-slate-700 shrink-0" />
              <span>العودة إلى محرر الخطة</span>
            </button>

            <button
              onClick={onOpenAiGenerator}
              className="px-4 py-2 bg-linear-to-r from-emerald-700 via-emerald-800 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs hover:shadow-sm active:scale-97 cursor-pointer"
              title="توليد خطة درس نموذجية بالذكاء الاصطناعي"
            >
              <Sparkles className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>تحضير درس جديد بالـ AI</span>
            </button>

            {onOpenBlankTemplateModal && (
              <button
                onClick={onOpenBlankTemplateModal}
                className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-amber-300 hover:border-amber-400 shadow-2xs hover:shadow-xs active:scale-97 cursor-pointer"
                title="استمارة تحضير مفرغة رسمية للبدء المباشر"
              >
                <FileEdit className="w-4 h-4 text-amber-700 shrink-0" />
                <span>استمارة مفرغة 📌</span>
              </button>
            )}
          </div>

          {/* Vertical Divider */}
          <div className="hidden lg:block h-7 w-px bg-slate-200 shrink-0" />

          {/* Group 2: Resources & Pedagogical Lab (المصادر والأدوات الرقمية) */}
          <div className="flex flex-wrap items-center gap-2">
            {onOpenResourcesModal && (
              <button
                onClick={onOpenResourcesModal}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-emerald-300 hover:border-emerald-400 shadow-2xs hover:shadow-xs active:scale-97 cursor-pointer"
                title="بنك المصادر والمناهج والمراجع التعليمية"
              >
                <Layers className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>المصادر والمناهج</span>
                <span className="px-1.5 py-0.2 bg-emerald-700 text-white rounded-full text-[10px] font-extrabold tabular-nums">
                  {toArabicDigits(resourcesCount)}
                </span>
              </button>
            )}

            {onOpenAbacusModal && (
              <button
                onClick={onOpenAbacusModal}
                className="px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-teal-300 hover:border-teal-400 shadow-2xs hover:shadow-xs active:scale-97 cursor-pointer"
                title="تشغيل الأداة الرقمية والمحاكي التفاعلي المتوافق مع الدرس"
              >
                <Calculator className="w-4 h-4 text-teal-700 shrink-0" />
                <span>الأداة التفاعلية / المحاكي</span>
              </button>
            )}
          </div>

          {/* Vertical Divider */}
          <div className="hidden xl:block h-7 w-px bg-slate-200 shrink-0" />

          {/* Group 3: Reports & Official Print (التقارير والطباعة الرسمية) */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Generate & Download Comprehensive PDF Report Button */}
            <button
              onClick={() => setIsReportPdfModalOpen(true)}
              className="px-4 py-2 bg-linear-to-r from-emerald-600 via-teal-700 to-emerald-800 hover:from-emerald-700 hover:to-teal-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs hover:shadow-sm active:scale-97 ring-1 ring-emerald-500/30 cursor-pointer"
              title="توليد وتحميل تقرير PDF إحصائي شامل لإنتاجية المعلم وتوزيع الخطط الدراسية"
            >
              <FileDown className="w-4 h-4 text-emerald-200 shrink-0" />
              <span>توليد تقرير PDF</span>
            </button>

            <button
              onClick={() => setIsReportPdfModalOpen(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs hover:shadow-xs active:scale-97 cursor-pointer"
              title="معاينة وطباعة تقرير الإنتاجية الرسمي A4"
            >
              <Printer className="w-4 h-4 text-slate-200 shrink-0" />
              <span>طباعة تقرير الإنتاجية</span>
            </button>
          </div>

        </div>
      </div>

      {/* Interactive Global Filter Toolbar: Subject, Grade Level & Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 font-['Tajawal']">
              تصفية الخطط والإحصائيات المعروضة
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              (تحديد المادة أو الصف الدراسي لتخصيص المؤشرات)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 tabular-nums">
              عرض {toArabicDigits(filteredPlans.length)} من أصل {toArabicDigits(plans.length)} خطة
            </span>
            {isFilterActive && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-rose-700 hover:text-rose-800 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors flex items-center gap-1 border border-rose-200"
              >
                <RotateCcw className="w-3 h-3" />
                <span>إلغاء التصفية</span>
              </button>
            )}
          </div>
        </div>

        {/* Dropdowns & Search Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* 1. Subject Dropdown */}
          <div className="lg:col-span-3">
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>المادة الدراسية:</span>
            </label>
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 font-semibold text-slate-800 rounded-xl px-3 py-2 border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-shadow"
            >
              <option value="all">كافة المباحث الدراسية ({toArabicDigits(plans.length)})</option>
              {subjectList.map((s) => (
                <option key={s} value={s}>
                  {s} ({toArabicDigits(subjectCounts[s] || 0)})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Educational Stage Dropdown (المرحلة الدراسية) */}
          <div className="lg:col-span-3">
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
              <span>المرحلة الدراسية:</span>
            </label>
            <select
              value={selectedStageFilter}
              onChange={(e) => setSelectedStageFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 font-semibold text-slate-800 rounded-xl px-3 py-2 border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 transition-shadow"
            >
              <option value="all">كافة المراحل التعليمية ({toArabicDigits(plans.length)})</option>
              {Object.values(STAGE_CONFIG).map((st) => (
                <option key={st.key} value={st.key}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Teacher Dropdown */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>المعلم:</span>
            </label>
            <select
              value={selectedTeacherFilter}
              onChange={(e) => setSelectedTeacherFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 font-semibold text-slate-800 rounded-xl px-3 py-2 border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 transition-shadow"
            >
              <option value="all">كافة المعلمين ({toArabicDigits(teacherList.length)})</option>
              {teacherList.map((t) => (
                <option key={t} value={t}>
                  {t} ({toArabicDigits(teacherCounts[t] || 0)})
                </option>
              ))}
            </select>
          </div>

          {/* 4. Grade Level Dropdown */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              <span>الصف:</span>
            </label>
            <select
              value={selectedGradeFilter}
              onChange={(e) => setSelectedGradeFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 font-semibold text-slate-800 rounded-xl px-3 py-2 border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-shadow"
            >
              <option value="all">كافة الصفوف ({toArabicDigits(plans.length)})</option>
              {gradeList.map((g) => (
                <option key={g} value={g}>
                  {g} ({toArabicDigits(gradeCounts[g] || 0)})
                </option>
              ))}
            </select>
          </div>

          {/* 5. Search Keyword */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span>بحث سريع:</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="الدرس، المعلم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-slate-50 text-slate-800 rounded-xl pl-7 pr-2.5 py-2 border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Active Filter Tags */}
        {isFilterActive && (
          <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-slate-100 text-xs">
            <span className="text-[11px] font-bold text-slate-500">الفلاتر المطبقة:</span>
            {selectedSubjectFilter !== 'all' && (
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded-lg text-xs font-semibold">
                <span>المبحث: {selectedSubjectFilter}</span>
                <button
                  onClick={() => setSelectedSubjectFilter('all')}
                  className="text-emerald-700 hover:text-emerald-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedStageFilter !== 'all' && (
              <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-900 border border-purple-300 px-2.5 py-0.5 rounded-lg text-xs font-semibold">
                <span>المرحلة: {STAGE_CONFIG[selectedStageFilter]?.shortLabel || selectedStageFilter}</span>
                <button
                  onClick={() => setSelectedStageFilter('all')}
                  className="text-purple-700 hover:text-purple-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedTeacherFilter !== 'all' && (
              <span className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-900 border border-teal-300 px-2.5 py-0.5 rounded-lg text-xs font-semibold">
                <span>المعلم: {selectedTeacherFilter}</span>
                <button
                  onClick={() => setSelectedTeacherFilter('all')}
                  className="text-teal-700 hover:text-teal-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedGradeFilter !== 'all' && (
              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-900 border border-blue-300 px-2.5 py-0.5 rounded-lg text-xs font-semibold">
                <span>الصف: {selectedGradeFilter}</span>
                <button
                  onClick={() => setSelectedGradeFilter('all')}
                  className="text-blue-700 hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchQuery.trim() !== '' && (
              <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 border border-slate-300 px-2.5 py-0.5 rounded-lg text-xs font-semibold">
                <span>بحث: «{searchQuery}»</span>
                <button onClick={() => setSearchQuery('')} className="text-slate-500 hover:text-slate-800">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-slate-500 hover:text-rose-700 underline font-medium mr-1"
            >
              مسح الكل
            </button>
          </div>
        )}
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* KPI 1: Total Plans */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">الخطط المحضرة</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black font-['Tajawal'] text-slate-900 tabular-nums">
              {toArabicDigits(stats.totalPlans)}
            </span>
            <span className="text-xs font-semibold text-slate-500">خطة درس</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1 border-t border-slate-100 pt-2">
            <span>موزعة على</span>
            <span className="font-bold text-slate-800 tabular-nums">
              {toArabicDigits(stats.subjectStats.length)}
            </span>
            <span>مباحث دراسية</span>
          </div>
        </div>

        {/* KPI 2: Total Periods */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">الحصص المخططة</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black font-['Tajawal'] text-slate-900 tabular-nums">
              {toArabicDigits(stats.totalPeriods)}
            </span>
            <span className="text-xs font-semibold text-slate-500">حصة صفية</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1 border-t border-slate-100 pt-2">
            <span>إجمالي</span>
            <span className="font-bold text-slate-800 tabular-nums">
              {toArabicDigits(stats.totalMinutesPlanned)}
            </span>
            <span>دقيقة تدريس</span>
          </div>
        </div>

        {/* KPI 3: Average Class Duration */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">معدل زمن الحصة</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black font-['Tajawal'] text-slate-900 tabular-nums">
              {toArabicDigits(stats.avgDuration)}
            </span>
            <span className="text-xs font-semibold text-slate-500">دقيقة / حصة</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 font-semibold flex items-center gap-1 border-t border-slate-100 pt-2">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>متوافق مع المعيار الوزاري</span>
          </div>
        </div>

        {/* KPI 4: Timing Balance Index */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-purple-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">توازن سير الحصة</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black font-['Tajawal'] text-slate-900 tabular-nums">
              {toArabicDigits(stats.balanceScore)}%
            </span>
            <span className="text-xs font-semibold text-emerald-600">ممتاز</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1 border-t border-slate-100 pt-2">
            <span>مطابقة توزيع المراحل الـ 4</span>
          </div>
        </div>

        {/* KPI 5: Authentic Assessment Complete */}
        <div className="col-span-2 sm:col-span-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-teal-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">اكتمال GRASPS والروبك</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black font-['Tajawal'] text-slate-900 tabular-nums">
              {toArabicDigits(
                stats.totalPlans > 0 ? Math.round((stats.graspsCount / stats.totalPlans) * 100) : 100
              )}
              %
            </span>
            <span className="text-xs font-semibold text-slate-500">تقييم أصيل</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1 border-t border-slate-100 pt-2">
            <span className="font-bold text-teal-800 tabular-nums">{toArabicDigits(stats.rubricCount)}</span>
            <span>خطط بسلالم تقدير لفظية</span>
          </div>
        </div>
      </div>

      {/* Visualizer Component: Teacher Achievements Visualizer with Recharts */}
      <TeacherAchievementsVisualizer
        plans={filteredPlans}
        selectedSubjectFilter={selectedSubjectFilter}
        onSelectSubjectFilter={(sub) => setSelectedSubjectFilter(sub)}
        selectedStageFilter={selectedStageFilter}
        onSelectStageFilter={(stage) => setSelectedStageFilter(stage)}
        selectedTeacherFilter={selectedTeacherFilter}
        onSelectTeacherFilter={(teacher) => setSelectedTeacherFilter(teacher)}
      />

      {/* Monthly Planning & Pedagogical Tasks Calendar (تقويم التخطيط والمهام الشهرية) */}
      <TeacherMonthlyCalendar
        plans={plans}
        activePlanId={activePlanId}
        onSelectPlan={onSelectPlan}
        onOpenEditor={onOpenEditor}
        onOpenPrintView={onOpenPrintView}
      />

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Bar Chart - Plans by Subject (7 cols on lg) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-base font-bold font-['Tajawal'] text-slate-900">
                    عدد خطط الدروس والحصص لكل مادة دراسية
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  توزيع أعباء التحضير والإنتاجية الصفية بحسب المباحث التعليمية
                </p>
              </div>

              {/* Metric Toggle Buttons */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200">
                <button
                  onClick={() => setChartMetric('plans')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    chartMetric === 'plans'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  عدد الخطط ({toArabicDigits(stats.totalPlans)})
                </button>
                <button
                  onClick={() => setChartMetric('periods')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    chartMetric === 'periods'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  إجمالي الحصص ({toArabicDigits(stats.totalPeriods)})
                </button>
              </div>
            </div>

            {/* Custom Responsive SVG Bar Chart */}
            <div className="pt-6 pb-2">
              <div className="h-64 sm:h-72 w-full flex items-end gap-4 sm:gap-6 px-2 sm:px-4 relative border-b border-slate-200">
                {/* Horizontal Guide Grid Lines */}
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between text-[10px] text-slate-400">
                  <div className="border-b border-dashed border-slate-200 w-full h-0 flex items-center justify-start pr-1">
                    <span className="tabular-nums font-mono">{toArabicDigits(maxBarValue)}</span>
                  </div>
                  <div className="border-b border-dashed border-slate-200 w-full h-0 flex items-center justify-start pr-1">
                    <span className="tabular-nums font-mono">{toArabicDigits(Math.round(maxBarValue * 0.66))}</span>
                  </div>
                  <div className="border-b border-dashed border-slate-200 w-full h-0 flex items-center justify-start pr-1">
                    <span className="tabular-nums font-mono">{toArabicDigits(Math.round(maxBarValue * 0.33))}</span>
                  </div>
                  <div className="w-full h-0 flex items-center justify-start pr-1">
                    <span className="tabular-nums font-mono">{toArabicDigits(0)}</span>
                  </div>
                </div>

                {/* Bars */}
                {stats.subjectStats.map((item, idx) => {
                  const val = chartMetric === 'plans' ? item.count : item.periods;
                  const heightPct = Math.max(12, Math.round((val / maxBarValue) * 100));
                  const isHovered = hoveredBarIndex === idx;

                  return (
                    <div
                      key={item.subject}
                      className="flex-1 flex flex-col items-center h-full justify-end group relative z-10 cursor-pointer"
                      onMouseEnter={() => setHoveredBarIndex(idx)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                      onClick={() => {
                        setSelectedSubjectFilter(
                          selectedSubjectFilter === item.subject ? 'all' : item.subject
                        );
                      }}
                      title={`${item.subject}: ${val} (${chartMetric === 'plans' ? 'خطة' : 'حصة'})`}
                    >
                      {/* Tooltip on hover */}
                      {isHovered && (
                        <div className="absolute -top-12 z-30 bg-slate-900 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-lg pointer-events-none whitespace-nowrap animate-fade-in">
                          <p className="text-[11px] text-emerald-300">{item.subject}</p>
                          <p className="tabular-nums">
                            {chartMetric === 'plans'
                              ? `${toArabicDigits(item.count)} خطة (${toArabicDigits(item.percentage)}%)`
                              : `${toArabicDigits(item.periods)} حصة (${toArabicDigits(item.minutes)} دقيقة)`}
                          </p>
                        </div>
                      )}

                      {/* Bar Value Indicator */}
                      <span className="text-xs font-bold text-slate-700 mb-1 tabular-nums transition-transform group-hover:scale-110">
                        {toArabicDigits(val)}
                      </span>

                      {/* The Bar */}
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full max-w-[56px] rounded-t-xl transition-all duration-300 relative overflow-hidden ${
                          item.style.bg
                        } ${
                          selectedSubjectFilter === item.subject
                            ? 'ring-4 ring-emerald-300 shadow-md'
                            : 'hover:brightness-110 hover:shadow-md'
                        }`}
                      >
                        {/* Subtle gloss overlay */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-white/25" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* X-Axis Labels */}
              <div className="flex items-start gap-4 sm:gap-6 px-2 sm:px-4 mt-2">
                {stats.subjectStats.map((item) => (
                  <div
                    key={item.subject}
                    className="flex-1 text-center cursor-pointer"
                    onClick={() => {
                      setSelectedSubjectFilter(
                        selectedSubjectFilter === item.subject ? 'all' : item.subject
                      );
                    }}
                  >
                    <span
                      className={`text-xs font-bold block truncate transition-colors ${
                        selectedSubjectFilter === item.subject
                          ? 'text-emerald-700 font-black'
                          : 'text-slate-700 hover:text-emerald-700'
                      }`}
                    >
                      {item.subject}
                    </span>
                    <span className="text-[10px] text-slate-400 block tabular-nums">
                      {toArabicDigits(item.count)} {item.count === 1 ? 'خطة' : 'خطط'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Filter Info Tagline */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>انقر على أي عمود لتصفية جدول الخطط والتحليلات الخاصة به.</span>
            </div>
            {selectedSubjectFilter !== 'all' && (
              <button
                onClick={() => setSelectedSubjectFilter('all')}
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                إلغاء التصفية (عرض الكل)
              </button>
            )}
          </div>
        </div>

        {/* Chart 2: Donut Chart - Class Duration & Phase Distribution (5 cols on lg) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-teal-700" />
                <h3 className="text-base font-bold font-['Tajawal'] text-slate-900">
                  معدل توزيع زمن الحصة على المراحل
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                توزيع الدقائق والنسب المئوية لسير الحصة الرباعي المعتمد وزارياً
              </p>
            </div>

            {/* Donut and Center Metric */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-5">
              <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 190 190">
                  {donutSlices.map((slice, idx) => (
                    <circle
                      key={slice.key}
                      cx={slice.cx}
                      cy={slice.cy}
                      r={slice.radius}
                      fill="none"
                      stroke={slice.color}
                      strokeWidth={slice.strokeWidth}
                      strokeDasharray={slice.strokeDasharray}
                      strokeDashoffset={slice.strokeDashoffset}
                      className="transition-all duration-300 cursor-pointer hover:opacity-85"
                      style={{
                        transformOrigin: 'center',
                        transform: hoveredPhaseIndex === idx ? 'scale(1.04)' : 'scale(1)',
                      }}
                      onMouseEnter={() => setHoveredPhaseIndex(idx)}
                      onMouseLeave={() => setHoveredPhaseIndex(null)}
                    />
                  ))}
                </svg>

                {/* Center Content in Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-2">
                  <span className="text-[11px] font-bold text-slate-400">متوسط الحصة</span>
                  <span className="text-2xl font-black font-['Tajawal'] text-slate-900 tabular-nums">
                    {toArabicDigits(stats.sumAvgMinutes)}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">دقيقة تدريسية</span>
                </div>
              </div>

              {/* Legend with interactive highlights */}
              <div className="space-y-2.5 w-full sm:w-auto flex-1">
                {stats.phaseStats.map((phase, idx) => {
                  const isHovered = hoveredPhaseIndex === idx;
                  return (
                    <div
                      key={phase.key}
                      onMouseEnter={() => setHoveredPhaseIndex(idx)}
                      onMouseLeave={() => setHoveredPhaseIndex(null)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer ${
                        isHovered
                          ? 'bg-slate-50 border-slate-300 shadow-2xs'
                          : 'border-transparent hover:bg-slate-50/70'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: phase.color }}
                          />
                          <span className="font-bold text-slate-800">{phase.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-slate-900 tabular-nums font-mono">
                            {toArabicDigits(phase.avgMinutes)} د
                          </span>
                          <span className="text-[11px] text-slate-400 tabular-nums">
                            ({toArabicDigits(phase.percentage)}%)
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5 pr-5">
                        <span>الموصى به وزارياً:</span>
                        <span className="font-mono text-slate-500">{phase.recommendedPctRange}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Pedagogical Time Balance Note */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900">
            <div className="flex items-center gap-2 font-bold mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>تقييم التوازن الزمني للحصص:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-emerald-800">
              توزيع وقت الحصة لديك يمنح مرحلتي «العرض والاستكشاف» و«التطبيق والتعميق» النسبة الكبرى (
              {toArabicDigits(stats.phaseStats[1]?.percentage + stats.phaseStats[2]?.percentage)}%)، وهو
              المؤشر الأساسي للتعلم المتمركز حول الطالب وفق إطار تقييم أداء المعلم المتميز.
            </p>
          </div>
        </div>
      </div>

      {/* Secondary Analytics: Subject-by-Subject Phase Duration Comparison & Competencies */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Subject-by-Subject Horizon Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-base font-bold font-['Tajawal'] text-slate-900">
                مقارنة توزيع زمن مراحل الحصة بحسب المادة الدراسية
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تتبع دقائق المراحل الأربعة في خطط كل مبحث لاكتشاف الفروق البيداغوجية
              </p>
            </div>
          </div>

          {/* Legend for the 4 phases */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            {STANDARD_PHASES.map((p) => (
              <div key={p.key} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: p.color }} />
                <span className="text-slate-700">{p.label}</span>
              </div>
            ))}
          </div>

          {/* Stacked Bars for each subject */}
          <div className="space-y-4">
            {stats.subjectStats.map((sub) => {
              // Calculate avg minutes for this subject
              let s1 = 0,
                s2 = 0,
                s3 = 0,
                s4 = 0;
              sub.plans.forEach((p) => {
                const t = p.section2Timeline || [];
                s1 += Number(t[0]?.durationMinutes) || 5;
                s2 += Number(t[1]?.durationMinutes) || 16;
                s3 += Number(t[2]?.durationMinutes) || 12;
                s4 += Number(t[3]?.durationMinutes) || 7;
              });
              const c = sub.plans.length || 1;
              const m1 = Math.round(s1 / c);
              const m2 = Math.round(s2 / c);
              const m3 = Math.round(s3 / c);
              const m4 = Math.round(s4 / c);
              const tot = m1 + m2 + m3 + m4 || 40;

              const pct1 = Math.round((m1 / tot) * 100);
              const pct2 = Math.round((m2 / tot) * 100);
              const pct3 = Math.round((m3 / tot) * 100);
              const pct4 = 100 - (pct1 + pct2 + pct3);

              return (
                <div key={sub.subject} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{sub.subject}</span>
                      <span className="text-[11px] text-slate-400">
                        ({toArabicDigits(sub.count)} {sub.count === 1 ? 'خطة' : 'خطط'})
                      </span>
                    </div>
                    <span className="font-semibold text-slate-600 tabular-nums">
                      إجمالي {toArabicDigits(tot)} دقيقة
                    </span>
                  </div>

                  {/* Multi-segment Horizontal Bar */}
                  <div className="h-5 w-full bg-slate-100 rounded-lg overflow-hidden flex shadow-2xs">
                    <div
                      style={{ width: `${pct1}%`, backgroundColor: STANDARD_PHASES[0].color }}
                      className="h-full flex items-center justify-center text-[10px] text-white font-bold tabular-nums"
                      title={`١. التمهيد: ${m1} د (${pct1}%)`}
                    >
                      {pct1 >= 10 && `${toArabicDigits(m1)}د`}
                    </div>
                    <div
                      style={{ width: `${pct2}%`, backgroundColor: STANDARD_PHASES[1].color }}
                      className="h-full flex items-center justify-center text-[10px] text-white font-bold tabular-nums"
                      title={`٢. العرض والاستكشاف: ${m2} د (${pct2}%)`}
                    >
                      {pct2 >= 12 && `${toArabicDigits(m2)}د`}
                    </div>
                    <div
                      style={{ width: `${pct3}%`, backgroundColor: STANDARD_PHASES[2].color }}
                      className="h-full flex items-center justify-center text-[10px] text-white font-bold tabular-nums"
                      title={`٣. التطبيق والتعميق: ${m3} د (${pct3}%)`}
                    >
                      {pct3 >= 12 && `${toArabicDigits(m3)}د`}
                    </div>
                    <div
                      style={{ width: `${pct4}%`, backgroundColor: STANDARD_PHASES[3].color }}
                      className="h-full flex items-center justify-center text-[10px] text-white font-bold tabular-nums"
                      title={`٤. الخاتمة والتقويم: ${m4} د (${pct4}%)`}
                    >
                      {pct4 >= 10 && `${toArabicDigits(m4)}د`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Competencies & Pedagogical Coverage (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold font-['Tajawal'] text-slate-900">
                تغطية الكفايات التكاملية في الخطط
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                مدى إدماج الكفايات الأساسية في التخطيط التكيفي (القسم الأول)
              </p>
            </div>

            <div className="space-y-3">
              {Object.entries(stats.competencyHits).map(([compName, count]) => {
                const pct = stats.totalPlans > 0 ? Math.min(100, Math.round((count / stats.totalPlans) * 100)) : 0;
                return (
                  <div key={compName} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{compName}</span>
                      <div className="flex items-center gap-1.5 tabular-nums">
                        <span className="font-bold text-slate-900">{toArabicDigits(count)} خطة</span>
                        <span className="text-[11px] text-slate-400">({toArabicDigits(pct)}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              نسبة شمول الكفايات التكاملية تدعم ملف الإنجاز المهني للمعلم وتوفر شواهد موثقة للمشرف التربوي.
            </span>
          </div>
        </div>
      </div>

      {/* Indexed Folders System: By Subject and By Teacher */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        {/* Section Header with View Modes and Summary Counters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                <FolderTree className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold font-['Tajawal'] text-slate-900">
                سجل الخطط والمجلدات المفهرسة للإنتاجية التربوية
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              تنظيم وفهرسة الخطط الدراسية في مجلدات ذكية حسب المادة التعليمية وحسب اسم المعلم لتوثيق ملفات الإنجاز والمتابعة
            </p>
          </div>

          {/* Folder Mode Switcher segmented control */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                onClick={() => setIndexingMode('by_subject')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  indexingMode === 'by_subject'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="عرض المجلدات مفهرسة حسب المادة الدراسية"
              >
                <Folder className="w-3.5 h-3.5 text-emerald-600" />
                <span>حسب المادة ({toArabicDigits(subjectList.length)})</span>
              </button>

              <button
                onClick={() => setIndexingMode('by_teacher')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  indexingMode === 'by_teacher'
                    ? 'bg-white text-purple-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="عرض المجلدات مفهرسة حسب اسم المعلم"
              >
                <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>حسب المعلم ({toArabicDigits(teacherList.length)})</span>
              </button>

              <button
                onClick={() => setIndexingMode('tree')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  indexingMode === 'tree'
                    ? 'bg-white text-blue-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="عرض الشجرة الهرمية المتداخلة: المادة ⇦ المعلم"
              >
                <FolderTree className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">شجرة الفهرسة</span>
                <span className="sm:hidden">شجرة</span>
              </button>

              <button
                onClick={() => setIndexingMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  indexingMode === 'table'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="العرض الجدولي الشامل"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">جدول شامل</span>
                <span className="sm:hidden">جدول</span>
              </button>
            </div>

            {/* Quick PDF Report Button */}
            <button
              onClick={() => setIsReportPdfModalOpen(true)}
              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-emerald-200 shadow-2xs"
              title="توليد وتحميل تقرير PDF إحصائي شامل"
            >
              <FileDown className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">تقرير PDF</span>
            </button>
          </div>
        </div>

        {/* Toolbar & Folder Expansion Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 pt-1 border-b border-slate-100 text-xs">
          {/* Quick Stats & Expand/Collapse All */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-slate-600">
              إجمالي الخطط المفهرسة: <strong className="text-slate-900">{toArabicDigits(filteredPlans.length)}</strong> خطة
            </span>
            <span className="text-slate-300">|</span>
            {indexingMode !== 'table' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={expandAllFolders}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>فتح كافة المجلدات</span>
                </button>
                <span className="text-slate-300">·</span>
                <button
                  onClick={collapseAllFolders}
                  className="text-[11px] font-bold text-slate-600 hover:text-slate-900 hover:underline flex items-center gap-1"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>طي كافة المجلدات</span>
                </button>
              </div>
            )}
          </div>

          {/* Inline Search and reset */}
          <div className="flex items-center gap-2">
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="بحث داخل المجلدات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            {isFilterActive && (
              <button
                onClick={handleResetFilters}
                title="إعادة ضبط كافة الفلاتر"
                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Folder Navigation Chips */}
        {indexingMode === 'by_subject' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-[11px] font-bold text-slate-500 shrink-0 flex items-center gap-1">
              <Folder className="w-3 h-3 text-slate-400" />
              <span>انتقال سريع للمجلد:</span>
            </span>
            {subjectFoldersData.map((f) => {
              const isOpen = isSubjectOpen(f.subject);
              return (
                <button
                  key={f.subject}
                  onClick={() => toggleSubjectFolder(f.subject)}
                  className={`shrink-0 px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                    isOpen
                      ? 'bg-slate-800 text-white border-slate-800 shadow-2xs'
                      : `${f.style.lightBg} hover:opacity-90`
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${f.style.bg}`} />
                  <span>{f.subject}</span>
                  <span className="text-[10px] opacity-75 font-bold tabular-nums">
                    ({toArabicDigits(f.plans.length)})
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {indexingMode === 'by_teacher' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-[11px] font-bold text-slate-500 shrink-0 flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-purple-500" />
              <span>ملفات المعلمين:</span>
            </span>
            {teacherFoldersData.map((f) => {
              const isOpen = isTeacherOpen(f.teacherName);
              return (
                <button
                  key={f.teacherName}
                  onClick={() => toggleTeacherFolder(f.teacherName)}
                  className={`shrink-0 px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                    isOpen
                      ? 'bg-purple-900 text-white border-purple-900 shadow-2xs'
                      : `${f.badgeStyle.bg} hover:opacity-90`
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${f.badgeStyle.dot}`} />
                  <span>{f.teacherName}</span>
                  <span className="text-[10px] opacity-75 font-bold tabular-nums">
                    ({toArabicDigits(f.plans.length)})
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Empty state when no plans match */}
        {filteredPlans.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Folder className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">لا توجد خطط تطابق شروط البحث أو الفهرسة</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              يمكنك مسح عبارة البحث أو اختيار «كافة المباحث» و«كافة المعلمين»، أو البدء بتحضير خطة درس جديدة بالذكاء الاصطناعي.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              إلغاء التصفية
            </button>
          </div>
        ) : (
          <div>
            {/* VIEW MODE 1: FOLDERS BY SUBJECT */}
            {indexingMode === 'by_subject' && (
              <div className="space-y-4">
                {subjectFoldersData.map((folder) => {
                  const isOpen = isSubjectOpen(folder.subject);
                  return (
                    <div
                      key={folder.subject}
                      className={`border rounded-2xl overflow-hidden transition-all duration-200 bg-white ${
                        isOpen ? 'border-slate-300 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Folder Header */}
                      <div
                        onClick={() => toggleSubjectFolder(folder.subject)}
                        className={`p-4 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 select-none transition-colors ${
                          isOpen ? 'bg-slate-50/90 border-b border-slate-200' : 'hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                              folder.style.lightBg
                            }`}
                          >
                            {isOpen ? (
                              <FolderOpen className="w-5 h-5" />
                            ) : (
                              <Folder className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900 font-['Tajawal']">
                                مجلد مادة: {folder.subject}
                              </h4>
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 tabular-nums">
                                {toArabicDigits(folder.plans.length)} خطط
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                              <span>إجمالي: <strong className="text-slate-800 tabular-nums">{toArabicDigits(folder.totalPeriods)}</strong> حصص</span>
                              <span>·</span>
                              <span><strong className="text-slate-800 tabular-nums">{toArabicDigits(folder.totalMinutes)}</strong> دقيقة تدريس</span>
                              <span>·</span>
                              <span>
                                المعلمون المشاركون: {folder.teachers.map((t) => t.teacherName).join('، ')}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end md:self-auto">
                          <div className="flex -space-x-1.5 space-x-reverse">
                            {folder.teachers.map((t) => (
                              <span
                                key={t.teacherName}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${t.badgeStyle.bg}`}
                                title={`المعلم: ${t.teacherName} (${toArabicDigits(t.plans.length)} خطة)`}
                              >
                                {t.teacherName}
                              </span>
                            ))}
                          </div>
                          <div className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors">
                            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>
                      </div>

                      {/* Folder Content (When Open) */}
                      {isOpen && (
                        <div className="p-4 space-y-5 bg-slate-50/40">
                          {folder.teachers.map((t) => (
                            <div key={t.teacherName} className="space-y-2.5">
                              {/* Sub-header for Teacher inside Subject Folder */}
                              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                                  <span className={`w-2.5 h-2.5 rounded-full ${t.badgeStyle.dot}`} />
                                  <span>ملف المعلم: {t.teacherName}</span>
                                  <span className="text-[11px] font-normal text-slate-500 tabular-nums">
                                    ({toArabicDigits(t.plans.length)} خطة · {toArabicDigits(t.totalPeriods)} حصص)
                                  </span>
                                </div>
                              </div>

                              {/* Lesson Plan Cards for this Teacher */}
                              <div className="grid grid-cols-1 gap-3">
                                {t.plans.map((plan) => {
                                  const isCurrent = plan.id === activePlanId;
                                  const timeline = plan.section2Timeline || [];
                                  const p1 = Number(timeline[0]?.durationMinutes) || 5;
                                  const p2 = Number(timeline[1]?.durationMinutes) || 15;
                                  const p3 = Number(timeline[2]?.durationMinutes) || 12;
                                  const p4 = Number(timeline[3]?.durationMinutes) || 8;
                                  const totMins = p1 + p2 + p3 + p4 || Number(plan.header.periodDurationMinutes) || 40;

                                  return (
                                    <div
                                      key={plan.id}
                                      className={`p-3.5 rounded-xl border transition-all ${
                                        isCurrent
                                          ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                                          : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                                      }`}
                                    >
                                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                        <div className="space-y-1.5 flex-1 min-w-0">
                                          <div className="flex flex-wrap items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full shrink-0 ${folder.style.bg}`} />
                                            <h5 className="font-bold text-slate-900 text-sm">
                                              {plan.header.lessonTitle || plan.title}
                                            </h5>
                                            {isCurrent && (
                                              <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                                                <CheckCircle2 className="w-2.5 h-2.5" />
                                                <span>الخطة النشطة</span>
                                              </span>
                                            )}
                                            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                                              {plan.header.grade} {plan.header.section && `(${plan.header.section})`}
                                            </span>
                                          </div>

                                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                            <span className="inline-flex items-center gap-1 tabular-nums font-medium">
                                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                                              <span>
                                                {toArabicDigits(plan.header.totalPeriods || 1)} حصص ({toArabicDigits(plan.header.periodDurationMinutes || 40)} د / حصة)
                                              </span>
                                            </span>
                                            <span className="text-slate-300">|</span>
                                            <span className="inline-flex items-center gap-1">
                                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                              <span>{plan.header.date || '٢٠٢٦م'}</span>
                                            </span>
                                            {plan.section3Assessment?.graspsTask?.title && (
                                              <>
                                                <span className="text-slate-300">|</span>
                                                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                  <span>تقويم أصيل GRASPS مكتمل</span>
                                                </span>
                                              </>
                                            )}
                                          </div>

                                          {/* Mini Timeline Bar */}
                                          <div className="pt-1 max-w-sm">
                                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-2xs">
                                              <div
                                                style={{ width: `${(p1 / totMins) * 100}%`, backgroundColor: STANDARD_PHASES[0].color }}
                                                title={`تهيئة: ${p1} د`}
                                              />
                                              <div
                                                style={{ width: `${(p2 / totMins) * 100}%`, backgroundColor: STANDARD_PHASES[1].color }}
                                                title={`عرض: ${p2} د`}
                                              />
                                              <div
                                                style={{ width: `${(p3 / totMins) * 100}%`, backgroundColor: STANDARD_PHASES[2].color }}
                                                title={`تطبيق: ${p3} د`}
                                              />
                                              <div
                                                style={{ width: `${(p4 / totMins) * 100}%`, backgroundColor: STANDARD_PHASES[3].color }}
                                                title={`خاتمة: ${p4} د`}
                                              />
                                            </div>
                                            <div className="flex items-center justify-between text-[9px] text-slate-400 tabular-nums mt-0.5">
                                              <span>تهيئة ({toArabicDigits(p1)}د)</span>
                                              <span>عرض ({toArabicDigits(p2)}د)</span>
                                              <span>تطبيق ({toArabicDigits(p3)}د)</span>
                                              <span>خاتمة ({toArabicDigits(p4)}د)</span>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex items-center gap-1.5 shrink-0 no-print self-start md:self-center">
                                          <button
                                            onClick={() => {
                                              onSelectPlan(plan.id);
                                              onOpenEditor();
                                            }}
                                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                                            title="فتح الخطة في محرر الخطط للتعديل"
                                          >
                                            <span>تحرير</span>
                                            <ArrowUpRight className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            onClick={() => {
                                              onSelectPlan(plan.id);
                                              onOpenPrintView(plan.id);
                                            }}
                                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
                                            title="معاينة وطباعة رسمية A4"
                                          >
                                            <Printer className="w-4 h-4" />
                                          </button>
                                          {onOpenAbacusModal && (
                                            <button
                                              onClick={() => {
                                                onSelectPlan(plan.id);
                                                onOpenAbacusModal();
                                              }}
                                              className="p-1.5 text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200"
                                              title="تشغيل الأداة التفاعلية والمحاكي الرقمي المتوافق مع هذا الدرس"
                                            >
                                              <Sparkles className="w-4 h-4 text-emerald-600" />
                                            </button>
                                          )}
                                          {onDeletePlan && (
                                            <button
                                              onClick={() => onDeletePlan(plan.id)}
                                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                                              title="حذف هذه الخطة"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* VIEW MODE 2: FOLDERS BY TEACHER */}
            {indexingMode === 'by_teacher' && (
              <div className="space-y-4">
                {teacherFoldersData.map((folder) => {
                  const isOpen = isTeacherOpen(folder.teacherName);
                  return (
                    <div
                      key={folder.teacherName}
                      className={`border rounded-2xl overflow-hidden transition-all duration-200 bg-white ${
                        isOpen ? 'border-slate-300 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Teacher Folder Header */}
                      <div
                        onClick={() => toggleTeacherFolder(folder.teacherName)}
                        className={`p-4 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 select-none transition-colors ${
                          isOpen ? 'bg-slate-50/90 border-b border-slate-200' : 'hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                              folder.badgeStyle.bg
                            }`}
                          >
                            <UserCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900 font-['Tajawal']">
                                ملف المعلم: {folder.teacherName}
                              </h4>
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 tabular-nums">
                                {toArabicDigits(folder.plans.length)} خطة محضرة
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                              <span>إجمالي: <strong className="text-slate-800 tabular-nums">{toArabicDigits(folder.totalPeriods)}</strong> حصص مخطط لها</span>
                              <span>·</span>
                              <span><strong className="text-slate-800 tabular-nums">{toArabicDigits(folder.totalMinutes)}</strong> دقيقة تدريسية</span>
                              <span>·</span>
                              <span>
                                المباحث المسندة: {folder.subjects.map((s) => s.subjectName).join('، ')}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end md:self-auto">
                          <div className="flex -space-x-1.5 space-x-reverse">
                            {folder.subjects.map((s) => (
                              <span
                                key={s.subjectName}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${s.style.lightBg}`}
                                title={`مبحث: ${s.subjectName} (${toArabicDigits(s.plans.length)} خطة)`}
                              >
                                {s.subjectName}
                              </span>
                            ))}
                          </div>
                          <div className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors">
                            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>
                      </div>

                      {/* Folder Content (When Open) */}
                      {isOpen && (
                        <div className="p-4 space-y-5 bg-slate-50/40">
                          {folder.subjects.map((s) => (
                            <div key={s.subjectName} className="space-y-2.5">
                              {/* Sub-header for Subject inside Teacher Folder */}
                              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                                  <span className={`w-2.5 h-2.5 rounded-full ${s.style.bg}`} />
                                  <span>مبحث: {s.subjectName}</span>
                                  <span className="text-[11px] font-normal text-slate-500 tabular-nums">
                                    ({toArabicDigits(s.plans.length)} خطة · {toArabicDigits(s.totalPeriods)} حصص)
                                  </span>
                                </div>
                              </div>

                              {/* Lesson Plan Cards */}
                              <div className="grid grid-cols-1 gap-3">
                                {s.plans.map((plan) => {
                                  const isCurrent = plan.id === activePlanId;
                                  const timeline = plan.section2Timeline || [];
                                  const p1 = Number(timeline[0]?.durationMinutes) || 5;
                                  const p2 = Number(timeline[1]?.durationMinutes) || 15;
                                  const p3 = Number(timeline[2]?.durationMinutes) || 12;
                                  const p4 = Number(timeline[3]?.durationMinutes) || 8;
                                  const totMins = p1 + p2 + p3 + p4 || Number(plan.header.periodDurationMinutes) || 40;

                                  return (
                                    <div
                                      key={plan.id}
                                      className={`p-3.5 rounded-xl border transition-all ${
                                        isCurrent
                                          ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                                          : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                                      }`}
                                    >
                                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                        <div className="space-y-1.5 flex-1 min-w-0">
                                          <div className="flex flex-wrap items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full shrink-0 ${s.style.bg}`} />
                                            <h5 className="font-bold text-slate-900 text-sm">
                                              {plan.header.lessonTitle || plan.title}
                                            </h5>
                                            {isCurrent && (
                                              <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                                                <CheckCircle2 className="w-2.5 h-2.5" />
                                                <span>الخطة النشطة</span>
                                              </span>
                                            )}
                                            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                                              {plan.header.grade} {plan.header.section && `(${plan.header.section})`}
                                            </span>
                                          </div>

                                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                            <span className="inline-flex items-center gap-1 tabular-nums font-medium">
                                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                                              <span>
                                                {toArabicDigits(plan.header.totalPeriods || 1)} حصص ({toArabicDigits(plan.header.periodDurationMinutes || 40)} د / حصة)
                                              </span>
                                            </span>
                                            <span className="text-slate-300">|</span>
                                            <span className="inline-flex items-center gap-1">
                                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                              <span>{plan.header.date || '٢٠٢٦م'}</span>
                                            </span>
                                            {plan.section3Assessment?.graspsTask?.title && (
                                              <>
                                                <span className="text-slate-300">|</span>
                                                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                  <span>تقويم أصيل GRASPS مكتمل</span>
                                                </span>
                                              </>
                                            )}
                                          </div>

                                          {/* Mini Timeline Bar */}
                                          <div className="pt-1 max-w-sm">
                                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-2xs">
                                              <div
                                                style={{ width: `${(p1 / totMins) * 100}%`, backgroundColor: STANDARD_PHASES[0].color }}
                                                title={`تهيئة: ${p1} د`}
                                              />
                                              <div
                                                style={{ width: `${(p2 / totMins) * 100}%`, backgroundColor: STANDARD_PHASES[1].color }}
                                                title={`عرض: ${p2} د`}
                                              />
                                              <div
                                                style={{ width: `${(p3 / totMins) * 100}%`, backgroundColor: STANDARD_PHASES[2].color }}
                                                title={`تطبيق: ${p3} د`}
                                              />
                                              <div
                                                style={{ width: `${(p4 / totMins) * 100}%`, backgroundColor: STANDARD_PHASES[3].color }}
                                                title={`خاتمة: ${p4} د`}
                                              />
                                            </div>
                                            <div className="flex items-center justify-between text-[9px] text-slate-400 tabular-nums mt-0.5">
                                              <span>تهيئة ({toArabicDigits(p1)}د)</span>
                                              <span>عرض ({toArabicDigits(p2)}د)</span>
                                              <span>تطبيق ({toArabicDigits(p3)}د)</span>
                                              <span>خاتمة ({toArabicDigits(p4)}د)</span>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex items-center gap-1.5 shrink-0 no-print self-start md:self-center">
                                          <button
                                            onClick={() => {
                                              onSelectPlan(plan.id);
                                              onOpenEditor();
                                            }}
                                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                                            title="فتح الخطة في محرر الخطط للتعديل"
                                          >
                                            <span>تحرير</span>
                                            <ArrowUpRight className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            onClick={() => {
                                              onSelectPlan(plan.id);
                                              onOpenPrintView(plan.id);
                                            }}
                                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
                                            title="معاينة وطباعة رسمية A4"
                                          >
                                            <Printer className="w-4 h-4" />
                                          </button>
                                          {onOpenAbacusModal && (
                                            <button
                                              onClick={() => {
                                                onSelectPlan(plan.id);
                                                onOpenAbacusModal();
                                              }}
                                              className="p-1.5 text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200"
                                              title="تشغيل الأداة التفاعلية والمحاكي الرقمي المتوافق مع هذا الدرس"
                                            >
                                              <Sparkles className="w-4 h-4 text-emerald-600" />
                                            </button>
                                          )}
                                          {onDeletePlan && (
                                            <button
                                              onClick={() => onDeletePlan(plan.id)}
                                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                                              title="حذف هذه الخطة"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* VIEW MODE 3: HIERARCHICAL TREE VIEW */}
            {indexingMode === 'tree' && (
              <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-200">
                <div className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                  <FolderTree className="w-4 h-4 text-blue-600" />
                  <span>الشجرة الهيكلية المفهرسة: المادة الدراسية ⇦ اسم المعلم ⇦ خطط الدروس والإنتاجية</span>
                </div>

                {subjectFoldersData.map((folder) => {
                  const isOpen = isTreeSubjectOpen(folder.subject);
                  return (
                    <div key={folder.subject} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                      {/* Tree Root: Subject */}
                      <div
                        onClick={() => toggleTreeSubject(folder.subject)}
                        className="p-3 bg-slate-50 hover:bg-slate-100/80 cursor-pointer flex items-center justify-between select-none border-b border-slate-100"
                      >
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                          {isOpen ? <FolderOpen className="w-4 h-4 text-amber-500" /> : <Folder className="w-4 h-4 text-amber-500" />}
                          <span>مجلد المادة: {folder.subject}</span>
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full tabular-nums">
                            {toArabicDigits(folder.plans.length)} خطة
                          </span>
                        </div>
                        <div className="text-slate-400">
                          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </div>
                      </div>

                      {/* Tree Branch: Teachers */}
                      {isOpen && (
                        <div className="p-3 pr-6 space-y-3 border-r-2 border-slate-200 mr-4 my-2">
                          {folder.teachers.map((t) => (
                            <div key={t.teacherName} className="space-y-2">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                                <span className={`w-2 h-2 rounded-full ${t.badgeStyle.dot}`} />
                                <span className="bg-purple-50 text-purple-900 px-2 py-0.5 rounded-md border border-purple-200">
                                  المعلم: {t.teacherName}
                                </span>
                                <span className="text-[11px] text-slate-400 tabular-nums">
                                  ({toArabicDigits(t.plans.length)} دروس)
                                </span>
                              </div>

                              {/* Tree Leaf: Lesson items */}
                              <div className="space-y-1.5 pr-4 border-r-2 border-emerald-100 mr-2">
                                {t.plans.map((p) => {
                                  const isCurrent = p.id === activePlanId;
                                  return (
                                    <div
                                      key={p.id}
                                      className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-3 ${
                                        isCurrent ? 'bg-emerald-50 border-emerald-300 font-bold' : 'bg-white border-slate-200 hover:bg-slate-50'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <FileText className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                        <span className="text-slate-900 truncate">{p.header.lessonTitle || p.title}</span>
                                        <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-xs shrink-0">
                                          {p.header.grade}
                                        </span>
                                        {isCurrent && (
                                          <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded-full">
                                            النشطة
                                          </span>
                                        )}
                                      </div>

                                      <div className="flex items-center gap-1 shrink-0">
                                        <button
                                          onClick={() => {
                                            onSelectPlan(p.id);
                                            onOpenEditor();
                                          }}
                                          className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-bold"
                                        >
                                          تحرير
                                        </button>
                                        <button
                                          onClick={() => {
                                            onSelectPlan(p.id);
                                            onOpenPrintView(p.id);
                                          }}
                                          className="p-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                                          title="طباعة"
                                        >
                                          <Printer className="w-3.5 h-3.5" />
                                        </button>
                                        {onOpenAbacusModal && (
                                          <button
                                            onClick={() => {
                                              onSelectPlan(p.id);
                                              onOpenAbacusModal();
                                            }}
                                            className="p-1 text-emerald-600 hover:text-emerald-800 rounded-lg hover:bg-emerald-50"
                                            title="الأداة التفاعلية"
                                          >
                                            <Sparkles className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* VIEW MODE 4: COMPREHENSIVE FLAT TABLE VIEW */}
            {indexingMode === 'table' && (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-bold">
                      <th className="py-3 px-3">عنوان الدرس والمبحث</th>
                      <th className="py-3 px-3">اسم المعلم/المعلمة</th>
                      <th className="py-3 px-3">الصف والشعبة</th>
                      <th className="py-3 px-3">الحصص والزمن</th>
                      <th className="py-3 px-3">توزيع مراحل سير الحصة</th>
                      <th className="py-3 px-3">التقويم الأصيل (GRASPS)</th>
                      <th className="py-3 px-3">تاريخ الخطة</th>
                      <th className="py-3 px-3 text-center no-print">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPlans.map((plan) => {
                      const style = getSubjectStyle(plan.header.subject);
                      const teacherStyle = getTeacherBadgeStyle(plan.header.teacherName);
                      const isCurrent = plan.id === activePlanId;
                      const timeline = plan.section2Timeline || [];
                      const p1 = Number(timeline[0]?.durationMinutes) || 5;
                      const p2 = Number(timeline[1]?.durationMinutes) || 15;
                      const p3 = Number(timeline[2]?.durationMinutes) || 12;
                      const p4 = Number(timeline[3]?.durationMinutes) || 8;
                      const totMins = p1 + p2 + p3 + p4 || Number(plan.header.periodDurationMinutes) || 40;

                      return (
                        <tr
                          key={plan.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isCurrent ? 'bg-emerald-50/40' : ''
                          }`}
                        >
                          {/* Title & Subject */}
                          <td className="py-3 px-3">
                            <div className="flex items-start gap-2.5">
                              <span
                                className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${style.bg}`}
                              />
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-slate-900 line-clamp-1">
                                    {plan.header.lessonTitle || plan.title}
                                  </span>
                                  {isCurrent && (
                                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-xs">
                                      الحالية
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-slate-500 font-medium">
                                  مبحث: {plan.header.subject}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Teacher Name */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${teacherStyle.bg}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${teacherStyle.dot}`} />
                              <span>{plan.header.teacherName || 'غير محدد'}</span>
                            </span>
                          </td>

                          {/* Grade & Section */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="font-semibold text-slate-800">{plan.header.grade}</span>
                            {plan.header.section && (
                              <span className="text-slate-400 text-[11px]"> ({plan.header.section})</span>
                            )}
                          </td>

                          {/* Periods & Duration */}
                          <td className="py-3 px-3 whitespace-nowrap tabular-nums">
                            <div className="font-bold text-slate-900">
                              {toArabicDigits(plan.header.totalPeriods || 1)} حصص
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {toArabicDigits(plan.header.periodDurationMinutes || 40)} د / حصة
                            </div>
                          </td>

                          {/* Mini Phase Timeline Bar */}
                          <td className="py-3 px-3 min-w-[140px]">
                            <div className="space-y-1">
                              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-2xs">
                                <div
                                  style={{ width: `${(p1 / totMins) * 100}%`, backgroundColor: STANDARD_PHASES[0].color }}
                                  title={`تهيئة: ${p1} د`}
                                />
                                <div
                                  style={{ width: `${(p2 / totMins) * 100}%`, backgroundColor: STANDARD_PHASES[1].color }}
                                  title={`عرض: ${p2} د`}
                                />
                                <div
                                  style={{ width: `${(p3 / totMins) * 100}%`, backgroundColor: STANDARD_PHASES[2].color }}
                                  title={`تطبيق: ${p3} د`}
                                />
                                <div
                                  style={{ width: `${(p4 / totMins) * 100}%`, backgroundColor: STANDARD_PHASES[3].color }}
                                  title={`خاتمة: ${p4} د`}
                                />
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-slate-400 tabular-nums">
                                <span>{toArabicDigits(p1)}د</span>
                                <span>{toArabicDigits(p2)}د</span>
                                <span>{toArabicDigits(p3)}د</span>
                                <span>{toArabicDigits(p4)}د</span>
                              </div>
                            </div>
                          </td>

                          {/* GRASPS Assessment Status */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            {plan.section3Assessment?.graspsTask?.title ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>مكتمل ({plan.section3Assessment.rubric?.length || 0} معايير)</span>
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">قيد التطوير</span>
                            )}
                          </td>

                          {/* Date */}
                          <td className="py-3 px-3 whitespace-nowrap text-slate-500 font-medium tabular-nums">
                            {plan.header.date || '٢٠٢٦م'}
                          </td>

                          {/* Quick Action buttons */}
                          <td className="py-3 px-3 text-center whitespace-nowrap no-print">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  onSelectPlan(plan.id);
                                  onOpenEditor();
                                }}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 border border-emerald-200"
                                title="فتح الخطة في المحرر للتعديل"
                              >
                                <span>تحرير</span>
                                <ArrowUpRight className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => {
                                  onSelectPlan(plan.id);
                                  onOpenPrintView(plan.id);
                                }}
                                className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                title="معاينة الطباعة الرسمية (PDF A4)"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                              {onOpenAbacusModal && (
                                <button
                                  onClick={() => {
                                    onSelectPlan(plan.id);
                                    onOpenAbacusModal();
                                  }}
                                  className="p-1 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
                                  title="تشغيل الأداة التفاعلية المتوافقة مع هذا الدرس المحضر"
                                >
                                  <Sparkles className="w-4 h-4" />
                                </button>
                              )}
                              {onDeletePlan && (
                                <button
                                  onClick={() => onDeletePlan(plan.id)}
                                  className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="حذف هذه الخطة نهائياً"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Teacher Statistical Report PDF Modal */}
      <TeacherReportPdfModal
        isOpen={isReportPdfModalOpen}
        onClose={() => setIsReportPdfModalOpen(false)}
        plans={plans}
        activePlan={activePlan}
        filteredPlans={filteredPlans}
        activeSubjectFilter={selectedSubjectFilter}
        activeGradeFilter={selectedGradeFilter}
      />
    </div>
  );
};
