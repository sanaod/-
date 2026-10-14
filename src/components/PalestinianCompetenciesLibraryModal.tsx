import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  Sparkles,
  Award,
  Layers,
  ArrowRight,
  ExternalLink,
  Plus,
  Trash2,
  Edit3,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Check,
  TrendingUp,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  FileCheck,
  MessageSquare,
  Brain,
  Lightbulb,
  Users,
  Compass,
  AlertCircle,
  FileText,
} from 'lucide-react';
import {
  CompetencyItem,
  MinistryFrameworkMeta,
  ObservablePerformanceIndicator,
  SuggestedLearningSituation,
  SuggestedResourceLink,
} from '../types/palestinianCompetencies';
import {
  getStoredPalestinianCompetencies,
  savePalestinianCompetencies,
  getStoredMinistryFrameworkMeta,
  saveMinistryFrameworkMeta,
  resetToDefaultMinistryFramework,
  filterCompetencies,
  calculateSemesterCompetencyCoverage,
} from '../data/palestinianCompetenciesRegistry';
import { CompetencySemesterProgressBar } from './CompetencySemesterProgressBar';
import { LessonPlan } from '../types/lessonPlan';
import { toArabicDigits, toArabicPercent } from '../utils/arabicNumerals';

interface PalestinianCompetenciesLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: LessonPlan;
  allPlans?: LessonPlan[];
  onApplyCompetenciesToPlan?: (appliedData: {
    competencies: { title: string; description: string }[];
    indicators: ObservablePerformanceIndicator[];
    learningSituations: SuggestedLearningSituation[];
    suggestedResources: SuggestedResourceLink[];
  }) => void;
  onSelectCompetencyToNewPlan?: (competencyTitle: string) => void;
}

export const PalestinianCompetenciesLibraryModal: React.FC<PalestinianCompetenciesLibraryModalProps> = ({
  isOpen,
  onClose,
  currentPlan,
  allPlans = [],
  onApplyCompetenciesToPlan,
  onSelectCompetencyToNewPlan,
}) => {
  // State for competencies and metadata
  const [competencies, setCompetencies] = useState<CompetencyItem[]>([]);
  const [frameworkMeta, setFrameworkMeta] = useState<MinistryFrameworkMeta>(getStoredMinistryFrameworkMeta());

  // Active view tab
  const [activeTab, setActiveTab] = useState<'explorer' | 'progress' | 'management'>('explorer');

  // Filter States - prefilled with currentPlan context
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'general' | 'subject_specific'>('all');
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected competencies IDs for multi-selection
  const [selectedCompetencyIds, setSelectedCompetencyIds] = useState<Set<string>>(new Set());

  // Expanded items for detailed preview
  const [expandedCompetencyId, setExpandedCompetencyId] = useState<string | null>(null);

  // New Competency Form Modal or Drawer
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingCompetency, setEditingCompetency] = useState<CompetencyItem | null>(null);

  // Notification Banner
  const [notification, setNotification] = useState<string | null>(null);

  // Form State for Adding / Editing
  const [formTitle, setFormTitle] = useState('');
  const [formStatement, setFormStatement] = useState('');
  const [formCategory, setFormCategory] = useState<'general' | 'subject_specific'>('subject_specific');
  const [formDomain, setFormDomain] = useState<'communication' | 'critical_thinking' | 'creativity' | 'participation_responsibility' | 'subject_domain'>('subject_domain');
  const [formSubject, setFormSubject] = useState('الرياضيات');
  const [formGrades, setFormGrades] = useState('الصف الرابع, الصف الخامس');
  const [formOfficialRef, setFormOfficialRef] = useState('تعميم وزاري حديث - 2026');
  const [formIndicatorStatement, setFormIndicatorStatement] = useState('');
  const [formIndicatorAction, setFormIndicatorAction] = useState('');
  const [formSituationTitle, setFormSituationTitle] = useState('');
  const [formSituationDesc, setFormSituationDesc] = useState('');

  // Load from storage when modal opens
  useEffect(() => {
    if (isOpen) {
      const stored = getStoredPalestinianCompetencies();
      setCompetencies(stored);
      setFrameworkMeta(getStoredMinistryFrameworkMeta());

      // Auto pre-fill filters from current plan
      if (currentPlan) {
        if (currentPlan.header.subject) {
          setSelectedSubject(currentPlan.header.subject);
        }
        if (currentPlan.header.grade) {
          setSelectedGrade(currentPlan.header.grade);
        }
      }
    }
  }, [isOpen, currentPlan]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Filtered competencies based on user selection
  const filteredCompetencies = useMemo(() => {
    return filterCompetencies({
      allCompetencies: competencies,
      subject: selectedSubject,
      grade: selectedGrade,
      categoryFilter,
      domainFilter,
      searchQuery,
    });
  }, [competencies, selectedSubject, selectedGrade, categoryFilter, domainFilter, searchQuery]);

  // Semester Coverage Report
  const coverageReport = useMemo(() => {
    return calculateSemesterCompetencyCoverage({
      plans: allPlans.length > 0 ? allPlans : (currentPlan ? [currentPlan] : []),
      allCompetencies: competencies,
      targetSubject: selectedSubject,
      targetGrade: selectedGrade,
    });
  }, [allPlans, currentPlan, competencies, selectedSubject, selectedGrade]);

  // Toggle selection
  const toggleSelectCompetency = (id: string) => {
    setSelectedCompetencyIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    const next = new Set(selectedCompetencyIds);
    filteredCompetencies.forEach((c) => next.add(c.id));
    setSelectedCompetencyIds(next);
    showNotification(`تم تحديد ${toArabicDigits(filteredCompetencies.length)} كفايات بنجاح`);
  };

  const handleClearSelection = () => {
    setSelectedCompetencyIds(new Set());
  };

  // Apply Selected Competencies to Current Plan
  const handleApplySelectedToPlan = () => {
    if (selectedCompetencyIds.size === 0) {
      showNotification('يرجى تحديد كفاية واحدة على الأقل لتطبيقها على الخطة');
      return;
    }

    const selectedItems = competencies.filter((c) => selectedCompetencyIds.has(c.id));
    const appliedCompetencies = selectedItems.map((c) => ({
      title: `${c.code}: ${c.title}`,
      description: `${c.statement} (المجال: ${c.domainLabel} — المرجع: ${c.officialReference})`,
    }));

    const indicators: ObservablePerformanceIndicator[] = [];
    const learningSituations: SuggestedLearningSituation[] = [];
    const suggestedResources: SuggestedResourceLink[] = [];

    selectedItems.forEach((c) => {
      indicators.push(...c.performanceIndicators);
      learningSituations.push(...c.learningSituations);
      suggestedResources.push(...c.suggestedResources);
    });

    if (onApplyCompetenciesToPlan) {
      onApplyCompetenciesToPlan({
        competencies: appliedCompetencies,
        indicators,
        learningSituations,
        suggestedResources,
      });
    }

    showNotification(
      `تم إدراج ${toArabicDigits(selectedItems.length)} كفايات و ${toArabicDigits(indicators.length)} مؤشرات أداء بنجاح في خطة الدرس!`
    );

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  // Export Framework JSON
  const handleExportFramework = () => {
    const exportData = {
      metadata: frameworkMeta,
      competencies,
      exportDate: new Date().toISOString(),
      sourceSystem: 'منظومة عبقور لتخطيط الدروس - دولة فلسطين',
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `اطار_الكفايات_الوطنية_الفلسطينية_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('تم تصدير ملف إطار الكفايات الوزاري (JSON) بنجاح');
  };

  // Import Framework JSON
  const handleImportFramework = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.competencies && Array.isArray(parsed.competencies)) {
          setCompetencies(parsed.competencies);
          savePalestinianCompetencies(parsed.competencies);
          if (parsed.metadata) {
            setFrameworkMeta(parsed.metadata);
            saveMinistryFrameworkMeta(parsed.metadata);
          }
          showNotification(`تم استيراد ${toArabicDigits(parsed.competencies.length)} كفاية بنجاح من الملف الوزاري`);
        } else if (Array.isArray(parsed)) {
          setCompetencies(parsed);
          savePalestinianCompetencies(parsed);
          showNotification(`تم استيراد ${toArabicDigits(parsed.length)} كفاية بنجاح`);
        } else {
          showNotification('الملف غير متطابق مع بنية إطار الكفايات المعتمد');
        }
      } catch (err) {
        console.error('Import error:', err);
        showNotification('حدث خطأ أثناء قراءة ملف JSON');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // Reset to Default Framework
  const handleResetToDefault = () => {
    if (window.confirm('هل أنت متأكد من استعادة إطار الكفايات الوزاري الافتراضي الأصلي؟ سيتم تحديث جميع السجلات إلى المعايير المعتمدة من الوزارة.')) {
      const { competencies: defaultComps, meta: defaultMeta } = resetToDefaultMinistryFramework();
      setCompetencies(defaultComps);
      setFrameworkMeta(defaultMeta);
      showNotification('تمت استعادة إطار الكفايات الوزاري الرسمي المحدث بنجاح');
    }
  };

  // Save New or Edited Competency
  const handleSaveCompetencyForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formStatement.trim()) {
      showNotification('يرجى ملء عنوان الكفاية ونصها المعتمد');
      return;
    }

    const domainLabelMap: Record<string, string> = {
      communication: 'التواصل والاتصال',
      critical_thinking: 'التفكير الناقد وحل المشكلات',
      creativity: 'الإبداع والابتكار',
      participation_responsibility: 'المشاركة والمسؤولية والمواطنة',
      subject_domain: `كفايات ${formSubject} التخصصية`,
    };

    const newIndicators: ObservablePerformanceIndicator[] = formIndicatorStatement.trim()
      ? [
          {
            id: `IND-MAN-${Date.now()}`,
            code: `IND-${formCategory === 'general' ? 'GEN' : 'SPEC'}-${Date.now().toString().slice(-4)}`,
            statement: formIndicatorStatement.trim(),
            observableAction: formIndicatorAction.trim() || 'ملاحظة أداء وسلوك الطالب في الغرفة الصفية.',
            suggestedAssessmentMethod: 'سلم تقدير لفظي أو ملاحظة صفية مباشرة.',
          },
        ]
      : [];

    const newSituations: SuggestedLearningSituation[] = formSituationTitle.trim()
      ? [
          {
            id: `SIT-MAN-${Date.now()}`,
            title: formSituationTitle.trim(),
            contextDescription: formSituationDesc.trim() || 'موقف صفي واقعي يربط المفهوم بالبيئة الفلسطينية.',
            teacherRole: 'التيسير والتوجيه الإيجابي.',
            studentRole: 'المشاركة والاستقصاء النشط.',
            durationMinutes: 20,
            authenticPalestineContext: 'سياق تعليمي من واقع المجتمع الفلسطيني.',
            assessmentOpportunity: 'ملاحظة سلوك الطالب وتفاعل المجموعة.',
          },
        ]
      : [];

    const gradesArray = formGrades
      .split(',')
      .map((g) => g.trim())
      .filter((g) => g.length > 0);

    if (editingCompetency) {
      // Update
      const updatedList = competencies.map((c) => {
        if (c.id === editingCompetency.id) {
          return {
            ...c,
            title: formTitle.trim(),
            statement: formStatement.trim(),
            category: formCategory,
            domain: formDomain,
            domainLabel: domainLabelMap[formDomain] || 'كفايات معتمدة',
            subject: formCategory === 'general' ? 'جميع المباحث الدراسية' : formSubject,
            grades: gradesArray.length > 0 ? gradesArray : ['جميع الصفوف'],
            officialReference: formOfficialRef.trim(),
            versionDate: new Date().toISOString().slice(0, 10),
            lastModifiedBy: 'teacher_admin' as const,
            isCustom: true,
            performanceIndicators:
              newIndicators.length > 0
                ? [...newIndicators, ...c.performanceIndicators]
                : c.performanceIndicators,
            learningSituations:
              newSituations.length > 0
                ? [...newSituations, ...c.learningSituations]
                : c.learningSituations,
          };
        }
        return c;
      });
      setCompetencies(updatedList);
      savePalestinianCompetencies(updatedList);
      showNotification('تم تحديث الكفاية وحفظ التعديلات الوزارية بنجاح');
    } else {
      // Create new
      const newItem: CompetencyItem = {
        id: `COMP-CUSTOM-${Date.now()}`,
        code: `COMP-${formCategory === 'general' ? 'GEN' : 'SPEC'}-${Date.now().toString().slice(-4)}`,
        category: formCategory,
        domain: formDomain,
        domainLabel: domainLabelMap[formDomain] || 'كفايات معتمدة',
        title: formTitle.trim(),
        statement: formStatement.trim(),
        subject: formCategory === 'general' ? 'جميع المباحث الدراسية' : formSubject,
        grades: gradesArray.length > 0 ? gradesArray : ['جميع الصفوف'],
        stage: 'all',
        topics: ['موضوعات المنهاج الفلسطيني المستحدثة'],
        officialReference: formOfficialRef.trim() || 'تحديث مدرسي محلي 2026',
        versionDate: new Date().toISOString().slice(0, 10),
        lastModifiedBy: 'teacher_admin',
        isCustom: true,
        performanceIndicators: newIndicators,
        learningSituations: newSituations,
        suggestedResources: [
          {
            id: `RES-${Date.now()}`,
            title: 'المصادر المفتوحة عبر البوابة التعليمية الفلسطينية',
            provider: 'elearn_edu_ps',
            providerLabel: 'البوابة التعليمية الفلسطينية',
            url: 'https://elearn.edu.ps',
            type: 'guide',
          },
        ],
      };
      const updatedList = [newItem, ...competencies];
      setCompetencies(updatedList);
      savePalestinianCompetencies(updatedList);
      showNotification('تمت إضافة الكفاية الوزارية الجديدة وحفظها محلياً دون الحاجة لإعادة برمجة!');
    }

    // Reset Form
    setIsAddingNew(false);
    setEditingCompetency(null);
    setFormTitle('');
    setFormStatement('');
    setFormIndicatorStatement('');
    setFormIndicatorAction('');
    setFormSituationTitle('');
    setFormSituationDesc('');
  };

  const handleStartEdit = (c: CompetencyItem) => {
    setEditingCompetency(c);
    setFormTitle(c.title);
    setFormStatement(c.statement);
    setFormCategory(c.category);
    setFormDomain(c.domain as any);
    setFormSubject(c.subject);
    setFormGrades(c.grades.join(', '));
    setFormOfficialRef(c.officialReference);
    setFormIndicatorStatement('');
    setFormIndicatorAction('');
    setFormSituationTitle('');
    setFormSituationDesc('');
    setIsAddingNew(true);
  };

  const handleDeleteCompetency = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الكفاية؟')) {
      const updated = competencies.filter((c) => c.id !== id);
      setCompetencies(updated);
      savePalestinianCompetencies(updated);
      setSelectedCompetencyIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      showNotification('تم حذف الكفاية');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-6xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* ========================================================= */}
        {/* Modal Header */}
        {/* ========================================================= */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 px-5 py-4 border-b border-emerald-800/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-inner">
              <Award className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  مكتبة الكفايات الوطنية الفلسطينية
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                    وزارة التربية والتعليم العالي
                  </span>
                </h3>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                وفق إطار الكفايات الوطني الرسمي — مؤشرات أداء قابلة للقياس، ومواقف تعليمية، وربط بالمصادر المعتمدة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 flex items-center justify-between animate-in slide-in-from-top">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {notification}
            </span>
            <button type="button" onClick={() => setNotification(null)} className="opacity-80 hover:opacity-100">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* Navigation Tabs */}
        {/* ========================================================= */}
        <div className="bg-slate-850 px-4 py-2 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <button
              type="button"
              onClick={() => setActiveTab('explorer')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'explorer'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              مستكشف الكفايات والربط بالدرس
              <span className="px-1.5 py-0.2 bg-slate-900/50 rounded-full text-[10px] font-mono">
                {toArabicDigits(filteredCompetencies.length)}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('progress')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'progress'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              شريط ونسبة تغطية الفصل
              <span className="px-1.5 py-0.2 bg-emerald-950 text-emerald-300 rounded-full text-[10px] font-mono font-bold">
                {toArabicPercent(coverageReport.coveragePercentage)}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('management')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'management'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              تحديثات الوزارة وإدارة الإطار
            </button>
          </div>

          {/* Quick Apply Selection Action Bar */}
          {selectedCompetencyIds.size > 0 && activeTab === 'explorer' && (
            <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-600/60 px-3 py-1.5 rounded-xl">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                تم تحديد {toArabicDigits(selectedCompetencyIds.size)} كفاية
              </span>

              <button
                type="button"
                onClick={handleApplySelectedToPlan}
                className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-lg text-xs flex items-center gap-1 transition-all shadow-sm"
              >
                <span>تطبيق على خطتي الحالية</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleClearSelection}
                className="text-slate-400 hover:text-rose-400 text-xs px-1"
                title="إلغاء التحديد"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* Main Content Body */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: EXPLORER & LINK TO CURRENT LESSON */}
          {activeTab === 'explorer' && (
            <div className="space-y-4">
              {/* Compact Semester Progress preview header */}
              <CompetencySemesterProgressBar
                report={coverageReport}
                selectedSubject={selectedSubject}
                selectedGrade={selectedGrade}
                compact={true}
              />

              {/* Filters Bar */}
              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <Filter className="w-4 h-4" />
                    تصفية الكفايات المستهدفة للمستوى والدرس
                  </span>

                  {(selectedSubject || selectedGrade || searchQuery || categoryFilter !== 'all' || domainFilter !== 'all') && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSubject('');
                        setSelectedGrade('');
                        setSearchQuery('');
                        setCategoryFilter('all');
                        setDomainFilter('all');
                      }}
                      className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
                    >
                      إعادة ضبط الفلاتر
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                  {/* Subject Dropdown */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      المبحث الدراسي:
                    </label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-hidden focus:border-emerald-500"
                    >
                      <option value="">جميع المباحث</option>
                      <option value="الرياضيات">الرياضيات</option>
                      <option value="اللغة العربية">اللغة العربية</option>
                      <option value="العلوم والحياة">العلوم والحياة</option>
                      <option value="الدراسات الاجتماعية">الدراسات الاجتماعية والتنشئة</option>
                      <option value="التربية الإسلامية">التربية الإسلامية</option>
                      <option value="اللغة الإنجليزية">اللغة الإنجليزية (English)</option>
                      <option value="التكنولوجيا والبرمجة">التكنولوجيا والبرمجة</option>
                    </select>
                  </div>

                  {/* Grade Dropdown */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      الصف الدراسي:
                    </label>
                    <select
                      value={selectedGrade}
                      onChange={(e) => setSelectedGrade(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-hidden focus:border-emerald-500"
                    >
                      <option value="">جميع الصفوف</option>
                      <option value="الصف الأول">الصف الأول</option>
                      <option value="الصف الثاني">الصف الثاني</option>
                      <option value="الصف الثالث">الصف الثالث</option>
                      <option value="الصف الرابع">الصف الرابع</option>
                      <option value="الصف الخامس">الصف الخامس</option>
                      <option value="الصف السادس">الصف السادس</option>
                    </select>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      نوع الكفاية:
                    </label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-hidden focus:border-emerald-500"
                    >
                      <option value="all">الكل (عامة وتخصصية)</option>
                      <option value="general">كفايات عامة متداخلة</option>
                      <option value="subject_specific">كفايات خاصة بالمادة</option>
                    </select>
                  </div>

                  {/* Domain Filter */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      المجال التربوي:
                    </label>
                    <select
                      value={domainFilter}
                      onChange={(e) => setDomainFilter(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-hidden focus:border-emerald-500"
                    >
                      <option value="all">جميع المجالات</option>
                      <option value="communication">تواصل واتصال</option>
                      <option value="critical_thinking">تفكير ناقد وحل مشكلات</option>
                      <option value="creativity">إبداع وابتكار</option>
                      <option value="participation_responsibility">مشاركة ومسؤولية ومواطنة</option>
                      <option value="subject_domain">كفايات تخصصية للمادة</option>
                    </select>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث بالنص أو مؤشر الأداء أو الموقف التعليمي أو رمز الكفاية..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-9 pl-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Selection Bar & Count */}
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs px-1">
                <span className="font-bold text-slate-300">
                  عرض {toArabicDigits(filteredCompetencies.length)} كفاية معتمدة من الوزارة
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllFiltered}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
                  >
                    تحديد الكل المعروض ({toArabicDigits(filteredCompetencies.length)})
                  </button>
                  {selectedCompetencyIds.size > 0 && (
                    <button
                      type="button"
                      onClick={handleClearSelection}
                      className="text-xs text-slate-400 hover:text-slate-300 underline cursor-pointer"
                    >
                      إلغاء التحديد
                    </button>
                  )}
                </div>
              </div>

              {/* Competencies List */}
              {filteredCompetencies.length === 0 ? (
                <div className="bg-slate-800/40 rounded-2xl p-8 border border-dashed border-slate-700 text-center space-y-3">
                  <Compass className="w-10 h-10 text-slate-500 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-300">لا توجد كفايات مطابقة لمعايير البحث الحالية</h4>
                  <p className="text-xs text-slate-500">
                    جرب تغيير المبحث أو الصف أو مسح نص البحث لعرض بقية الكفايات الوطنية المعتمدة.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSubject('');
                      setSelectedGrade('');
                      setSearchQuery('');
                      setCategoryFilter('all');
                      setDomainFilter('all');
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold inline-block"
                  >
                    عرض جميع الكفايات
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {filteredCompetencies.map((comp) => {
                    const isSelected = selectedCompetencyIds.has(comp.id);
                    const isExpanded = expandedCompetencyId === comp.id;
                    const isCovered = coverageReport.coveredCompetencyIds.includes(comp.id);

                    return (
                      <div
                        key={comp.id}
                        className={`bg-slate-850 rounded-2xl border transition-all ${
                          isSelected
                            ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg'
                            : 'border-slate-700/70 hover:border-slate-600'
                        }`}
                      >
                        {/* Card Header Row */}
                        <div className="p-4 flex items-start gap-3">
                          {/* Selection Checkbox */}
                          <button
                            type="button"
                            onClick={() => toggleSelectCompetency(comp.id)}
                            className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-black'
                                : 'bg-slate-900 border-slate-600 text-transparent hover:border-emerald-400'
                            }`}
                          >
                            <Check className="w-4 h-4" />
                          </button>

                          {/* Info */}
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 rounded-md text-[10px] font-mono font-bold">
                                {comp.code}
                              </span>

                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  comp.category === 'general'
                                    ? 'bg-purple-950/70 text-purple-300 border border-purple-800/60'
                                    : 'bg-teal-950/70 text-teal-300 border border-teal-800/60'
                                }`}
                              >
                                {comp.domainLabel}
                              </span>

                              <span className="text-[11px] text-slate-400">
                                {comp.subject} • {comp.grades.join('، ')}
                              </span>

                              {isCovered ? (
                                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full text-[10px] font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  مغطاة في خطط الفصل
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-amber-950/60 text-amber-300 border border-amber-800/50 rounded-full text-[10px] font-medium">
                                  بانتظار التغطية
                                </span>
                              )}
                            </div>

                            <h4 className="text-sm font-black text-white hover:text-emerald-300 transition-colors">
                              {comp.title}
                            </h4>

                            <p className="text-xs text-slate-300 leading-relaxed">
                              {comp.statement}
                            </p>

                            <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400 flex-wrap">
                              <span className="flex items-center gap-1 text-slate-400">
                                <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                                {toArabicDigits(comp.performanceIndicators.length)} مؤشرات أداء قابلة للقياس
                              </span>

                              <span className="flex items-center gap-1 text-slate-400">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                {toArabicDigits(comp.learningSituations.length)} مواقف تعليمية واقعية
                              </span>

                              <span className="text-slate-500">
                                المرجع: {comp.officialReference}
                              </span>
                            </div>
                          </div>

                          {/* Quick Action Buttons */}
                          <div className="flex flex-col gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                toggleSelectCompetency(comp.id);
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                                isSelected
                                  ? 'bg-emerald-500 text-slate-950 font-black'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                              }`}
                            >
                              {isSelected ? (
                                <>
                                  <Check className="w-3.5 h-3.5" /> محددة
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" /> تحديد
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => setExpandedCompetencyId(isExpanded ? null : comp.id)}
                              className="px-2.5 py-1 text-slate-400 hover:text-white text-xs flex items-center justify-center gap-1"
                            >
                              <span>{isExpanded ? 'إخفاء' : 'تفاصيل'}</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        {/* Expandable Details: Performance Indicators & Learning Situations */}
                        {isExpanded && (
                          <div className="border-t border-slate-700/60 p-4 bg-slate-900/60 space-y-4 rounded-b-2xl">
                            {/* Performance Indicators */}
                            <div>
                              <h5 className="text-xs font-black text-emerald-400 mb-2 flex items-center gap-1.5">
                                <FileCheck className="w-4 h-4" />
                                مؤشرات الأداء القابلة للملاحظة والقياس في الغرفة الصفية:
                              </h5>
                              <div className="space-y-2">
                                {comp.performanceIndicators.map((ind) => (
                                  <div
                                    key={ind.id}
                                    className="bg-slate-800/90 rounded-xl p-3 border border-slate-700/70 text-xs space-y-1.5"
                                  >
                                    <div className="flex items-center justify-between font-bold text-slate-200">
                                      <span className="flex items-center gap-1.5 text-emerald-300">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                        {ind.statement}
                                      </span>
                                      <span className="text-[10px] font-mono text-slate-400">
                                        {ind.code}
                                      </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                                      <div className="bg-slate-900/60 rounded-lg p-2 border border-slate-800">
                                        <span className="font-bold text-slate-400 block mb-0.5">
                                          السلوك الملاحظ المقاس:
                                        </span>
                                        <span className="text-slate-300">{ind.observableAction}</span>
                                      </div>

                                      <div className="bg-slate-900/60 rounded-lg p-2 border border-slate-800">
                                        <span className="font-bold text-slate-400 block mb-0.5">
                                          طريقة التقويم المقترحة:
                                        </span>
                                        <span className="text-slate-300">{ind.suggestedAssessmentMethod}</span>
                                      </div>
                                    </div>

                                    {ind.levelDescriptors && (
                                      <div className="pt-1.5 grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px]">
                                        <div className="p-1.5 rounded bg-rose-950/30 border border-rose-900/40 text-rose-200">
                                          <span className="font-bold block">مبتدئ:</span>
                                          {ind.levelDescriptors.beginner}
                                        </div>
                                        <div className="p-1.5 rounded bg-amber-950/30 border border-amber-900/40 text-amber-200">
                                          <span className="font-bold block">نامٍ:</span>
                                          {ind.levelDescriptors.developing}
                                        </div>
                                        <div className="p-1.5 rounded bg-blue-950/30 border border-blue-900/40 text-blue-200">
                                          <span className="font-bold block">كفء:</span>
                                          {ind.levelDescriptors.competent}
                                        </div>
                                        <div className="p-1.5 rounded bg-emerald-950/30 border border-emerald-900/40 text-emerald-200">
                                          <span className="font-bold block">متميز:</span>
                                          {ind.levelDescriptors.distinguished}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Suggested Learning Situations */}
                            <div>
                              <h5 className="text-xs font-black text-amber-400 mb-2 flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4" />
                                المواقف التعليمية التعلمية المقترحة (الواقع الفلسطيني):
                              </h5>
                              <div className="space-y-2">
                                {comp.learningSituations.map((sit) => (
                                  <div
                                    key={sit.id}
                                    className="bg-amber-950/20 rounded-xl p-3 border border-amber-800/40 text-xs space-y-1.5"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-amber-200">
                                        {sit.title}
                                      </span>
                                      <span className="text-[10px] bg-amber-900/50 text-amber-300 px-2 py-0.5 rounded-full font-mono">
                                        {toArabicDigits(sit.durationMinutes)} دقيقة
                                      </span>
                                    </div>

                                    <p className="text-slate-300 text-[11px] leading-relaxed">
                                      {sit.contextDescription}
                                    </p>

                                    {sit.authenticPalestineContext && (
                                      <div className="text-[11px] text-emerald-300 bg-emerald-950/40 p-2 rounded-lg border border-emerald-900/40">
                                        <span className="font-bold">الارتباط بالبيئة الفلسطينية: </span>
                                        {sit.authenticPalestineContext}
                                      </div>
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                                      <div>
                                        <span className="font-bold text-slate-400">دور المعلم: </span>
                                        <span className="text-slate-300">{sit.teacherRole}</span>
                                      </div>
                                      <div>
                                        <span className="font-bold text-slate-400">دور الطالب: </span>
                                        <span className="text-slate-300">{sit.studentRole}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Suggested Resources */}
                            {comp.suggestedResources && comp.suggestedResources.length > 0 && (
                              <div>
                                <h5 className="text-xs font-black text-blue-400 mb-2 flex items-center gap-1.5">
                                  <ExternalLink className="w-4 h-4" />
                                  المصادر التعليمية المفتوحة المعتمدة المرتبطة:
                                </h5>
                                <div className="flex flex-wrap gap-2">
                                  {comp.suggestedResources.map((res) => (
                                    <a
                                      key={res.id}
                                      href={res.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                                    >
                                      <span>{res.title}</span>
                                      <span className="text-[10px] text-emerald-400 font-bold">
                                        ({res.providerLabel})
                                      </span>
                                      <ExternalLink className="w-3 h-3 text-slate-400" />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Single Apply button */}
                            <div className="pt-2 flex justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCompetencyIds(new Set([comp.id]));
                                  setTimeout(() => {
                                    handleApplySelectedToPlan();
                                  }, 50);
                                }}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                                تطبيق هذه الكفاية ومؤشراتها على خطة الدرس الحالية
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROGRESS & SEMESTER COVERAGE DASHBOARD */}
          {activeTab === 'progress' && (
            <div className="space-y-5">
              {/* Main Progress Bar Component */}
              <CompetencySemesterProgressBar
                report={coverageReport}
                selectedSubject={selectedSubject}
                selectedGrade={selectedGrade}
                onSelectCompetencyToPlan={(compTitle) => {
                  if (onSelectCompetencyToNewPlan) {
                    onSelectCompetencyToNewPlan(compTitle);
                    onClose();
                  } else {
                    showNotification(`تم اختيار كفاية «${compTitle}» للدرس القادم`);
                  }
                }}
              />

              {/* Detailed Breakdown Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Covered Competencies List */}
                <div className="bg-slate-850 rounded-2xl p-4 border border-slate-700/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-black text-sm text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      الكفايات التي تم تغطيتها ({toArabicDigits(coverageReport.coveredCompetenciesCount)})
                    </h5>
                    <span className="text-xs text-slate-400 font-mono">
                      {toArabicPercent(coverageReport.coveragePercentage)}
                    </span>
                  </div>

                  {coverageReport.coveredCompetenciesCount === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-6">
                      لم يتم تسجيل أي كفاية مغطاة بعد في الخطط المفحوصة لهذا المستوى.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {competencies
                        .filter((c) => coverageReport.coveredCompetencyIds.includes(c.id))
                        .map((c) => (
                          <div
                            key={c.id}
                            className="p-2.5 rounded-xl bg-slate-900 border border-emerald-900/40 text-xs flex items-center justify-between"
                          >
                            <div>
                              <span className="font-bold text-slate-200 block">{c.title}</span>
                              <span className="text-[10px] text-slate-400">{c.domainLabel} • {c.code}</span>
                            </div>
                            <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full text-[10px] font-bold">
                              مغطاة
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Uncovered Competencies List */}
                <div className="bg-slate-850 rounded-2xl p-4 border border-slate-700/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-black text-sm text-amber-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                      كفايات بحاجة لتخطيط ومواقف تعليمية ({toArabicDigits(coverageReport.uncoveredCompetencies.length)})
                    </h5>
                    <span className="text-xs text-slate-400">
                      مستهدفة للفصل
                    </span>
                  </div>

                  {coverageReport.uncoveredCompetencies.length === 0 ? (
                    <div className="p-6 text-center space-y-2">
                      <Award className="w-8 h-8 text-emerald-400 mx-auto" />
                      <p className="text-xs text-emerald-300 font-bold">
                        أحسنت! تم تحقيق تغطية كاملة بنسبة 100% لجميع الكفايات المقررة لهذا المستوى.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {coverageReport.uncoveredCompetencies.map((c) => (
                        <div
                          key={c.id}
                          className="p-2.5 rounded-xl bg-slate-900 border border-amber-900/40 text-xs flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <span className="font-bold text-slate-200 block truncate">{c.title}</span>
                            <span className="text-[10px] text-slate-400">{c.domainLabel} • {c.code}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCompetencyIds(new Set([c.id]));
                              setActiveTab('explorer');
                            }}
                            className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-[11px] font-bold shrink-0 transition-colors"
                          >
                            تحديد واستكشاف
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MANAGEMENT & MINISTRY FRAMEWORK UPDATES */}
          {activeTab === 'management' && (
            <div className="space-y-5">
              {/* Framework Metadata Banner */}
              <div className="bg-gradient-to-r from-emerald-950 via-slate-850 to-slate-900 p-5 rounded-2xl border border-emerald-800/50 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800">
                      {frameworkMeta.authority}
                    </span>
                    <h4 className="text-base font-black text-white mt-2">
                      {frameworkMeta.frameworkName}
                    </h4>
                    <p className="text-xs text-slate-300 mt-1">
                      {frameworkMeta.officialCircular} — الإصدار: {frameworkMeta.version} ({frameworkMeta.issuanceDate})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportFramework}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-4 h-4 text-emerald-400" />
                      تصدير الإطار (JSON)
                    </button>

                    <label className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
                      <Upload className="w-4 h-4" />
                      استيراد تحديث وزاري (JSON)
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportFramework}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={handleResetToDefault}
                      className="px-3 py-2 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                      title="استعادة الإطار الوزاري الأصلي"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      استعادة الإطار الوزاري
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-400 border-t border-slate-800 pt-2">
                  {frameworkMeta.description}
                </p>
              </div>

              {/* Add New Competency Button / Form */}
              <div className="bg-slate-850 rounded-2xl p-5 border border-slate-700/70 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-black text-sm text-white flex items-center gap-2">
                      <Plus className="w-4 h-4 text-emerald-400" />
                      إضافة كفاية جديدة أو تعديل كفاية قائمة وفق تعميم وزاري
                    </h5>
                    <p className="text-xs text-slate-400">
                      يمكنك إدخال تعديل وزاري جديد فور صدوره وحفظه في مصفوفة الكفايات دون الحاجة لإعادة برمجة المنظومة.
                    </p>
                  </div>

                  {!isAddingNew && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCompetency(null);
                        setFormTitle('');
                        setFormStatement('');
                        setFormIndicatorStatement('');
                        setFormIndicatorAction('');
                        setFormSituationTitle('');
                        setFormSituationDesc('');
                        setIsAddingNew(true);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      إضافة كفاية جديدة
                    </button>
                  )}
                </div>

                {/* The Form */}
                {isAddingNew && (
                  <form onSubmit={handleSaveCompetencyForm} className="space-y-4 pt-3 border-t border-slate-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          عنوان الكفاية (المستهدفة بالتعميم):
                        </label>
                        <input
                          type="text"
                          required
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                          placeholder="مثال: التفكير الخوارزمي في الرياضيات التطبيقية"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          رقم التعميم أو الوثيقة الوزارية:
                        </label>
                        <input
                          type="text"
                          value={formOfficialRef}
                          onChange={(e) => setFormOfficialRef(e.target.value)}
                          placeholder="مثال: تعميم وزاري رقم ت/ك/2026/105"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        نص الكفاية الكامل المعتمد:
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={formStatement}
                        onChange={(e) => setFormStatement(e.target.value)}
                        placeholder="نص الكفاية الإجرائي وفق الصياغة المعتمدة من الوزارة..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          تصنيف الكفاية:
                        </label>
                        <select
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value as any)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
                        >
                          <option value="subject_specific">كفاية خاصة بمبحث محدد</option>
                          <option value="general">كفاية عامة متداخلة</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          المجال التربوي:
                        </label>
                        <select
                          value={formDomain}
                          onChange={(e) => setFormDomain(e.target.value as any)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
                        >
                          <option value="communication">تواصل واتصال</option>
                          <option value="critical_thinking">تفكير ناقد وحل مشكلات</option>
                          <option value="creativity">إبداع وابتكار</option>
                          <option value="participation_responsibility">مشاركة ومسؤولية ومواطنة</option>
                          <option value="subject_domain">كفايات تخصصية للمبحث</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          المبحث (إن كانت تخصصية):
                        </label>
                        <input
                          type="text"
                          value={formSubject}
                          onChange={(e) => setFormSubject(e.target.value)}
                          placeholder="الرياضيات، العلوم، إلخ"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        الصفوف المستهدفة (مفصولة بفاصلة):
                      </label>
                      <input
                        type="text"
                        value={formGrades}
                        onChange={(e) => setFormGrades(e.target.value)}
                        placeholder="الصف الرابع, الصف الخامس"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
                      />
                    </div>

                    {/* Indicator addition */}
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-2">
                      <span className="font-bold text-xs text-emerald-400 block">
                        مؤشر أداء قابل للملاحظة والقياس (مقترح أولي):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={formIndicatorStatement}
                          onChange={(e) => setFormIndicatorStatement(e.target.value)}
                          placeholder="صياغة المؤشر: يميز / يحلل / يبرهن..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                        <input
                          type="text"
                          value={formIndicatorAction}
                          onChange={(e) => setFormIndicatorAction(e.target.value)}
                          placeholder="السلوك المقاس في الغرفة الصفية..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>

                    {/* Learning Situation addition */}
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-2">
                      <span className="font-bold text-xs text-amber-400 block">
                        موقف تعليمي تعلمي مقترح في السياق الفلسطيني:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={formSituationTitle}
                          onChange={(e) => setFormSituationTitle(e.target.value)}
                          placeholder="عنوان الموقف: رحلة صلبة / مناظرة..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                        <input
                          type="text"
                          value={formSituationDesc}
                          onChange={(e) => setFormSituationDesc(e.target.value)}
                          placeholder="وصف الموقف ودور الطالب في سياق فلسطين..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingNew(false);
                          setEditingCompetency(null);
                        }}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                      >
                        إلغاء
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                      >
                        <Check className="w-4 h-4" />
                        {editingCompetency ? 'حفظ التعديلات' : 'إضافة إلى المصفوفة المعتمدة'}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Editable Competencies Table */}
              <div className="bg-slate-850 rounded-2xl p-4 border border-slate-700/70 space-y-3">
                <h5 className="font-black text-sm text-white">
                  جدول الكفايات المعتمدة القابلة للإدارة والتحديث ({toArabicDigits(competencies.length)})
                </h5>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {competencies.map((comp) => (
                    <div
                      key={comp.id}
                      className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs hover:border-slate-700 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-emerald-400 font-bold">{comp.code}</span>
                          <span className="font-bold text-white truncate">{comp.title}</span>
                          {comp.isCustom && (
                            <span className="px-1.5 py-0.2 bg-amber-950 text-amber-300 rounded text-[9px] font-bold">
                              مُحدث محلياً
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-[11px] truncate mt-0.5">
                          {comp.subject} • {comp.domainLabel} • {comp.officialReference}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(comp)}
                          className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="تعديل الكفاية"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCompetency(comp.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="حذف الكفاية"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* Modal Footer */}
        {/* ========================================================= */}
        <div className="bg-slate-900 px-5 py-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>
              الإطار الوطني المعتمد للكفايات — وزارة التربية والتعليم العالي الفلسطينية
            </span>
          </div>

          <div className="flex items-center gap-2">
            {selectedCompetencyIds.size > 0 && activeTab === 'explorer' && (
              <button
                type="button"
                onClick={handleApplySelectedToPlan}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all"
              >
                <Check className="w-4 h-4" />
                تطبيق {toArabicDigits(selectedCompetencyIds.size)} كفاية محددة على خطتي
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors"
            >
              إغلاق النافذة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
