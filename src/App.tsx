/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LessonPlan } from './types/lessonPlan';
import { defaultExemplarPlans, palestineMathGrade3Plan } from './data/exemplarPlans';
import { HeaderNav } from './components/HeaderNav';
import { LessonHeaderCard } from './components/LessonHeaderCard';
import { Section1Card } from './components/Section1Card';
import { Section2TimelineCard } from './components/Section2TimelineCard';
import { Section3AssessmentCard } from './components/Section3AssessmentCard';
import { Section4EnvironmentCard } from './components/Section4EnvironmentCard';
import { Section5ReflectionCard } from './components/Section5ReflectionCard';
import { Section6SignaturesCard } from './components/Section6SignaturesCard';
import { OfficialPrintView } from './components/OfficialPrintView';
import { AbacusSimulationModal } from './components/AbacusSimulationModal';
import { AiGeneratorModal } from './components/AiGeneratorModal';
import { ExitTicketModal } from './components/ExitTicketModal';
import { ParentCardModal } from './components/ParentCardModal';
import {
  Compass,
  Clock,
  Target,
  Users2,
  BrainCircuit,
  FileCheck,
  Sparkles,
  Calculator,
  Printer,
  ChevronDown,
  Info,
  CheckCircle2,
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'educational_expert_lesson_plans_v1';
const ACTIVE_PLAN_KEY = 'educational_expert_active_plan_id_v1';

export default function App() {
  const [plans, setPlans] = useState<LessonPlan[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load plans from localStorage', e);
    }
    return defaultExemplarPlans;
  });

  const [activePlanId, setActivePlanId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(ACTIVE_PLAN_KEY);
      if (savedId) return savedId;
    } catch (e) {}
    return palestineMathGrade3Plan.id;
  });

  const [viewMode, setViewMode] = useState<'editor' | 'official-print'>('editor');
  const [activeTab, setActiveTab] = useState<string>('all');

  // Modals
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAbacusModalOpen, setIsAbacusModalOpen] = useState(false);
  const [isExitTicketModalOpen, setIsExitTicketModalOpen] = useState(false);
  const [isParentCardModalOpen, setIsParentCardModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(plans));
      localStorage.setItem(ACTIVE_PLAN_KEY, activePlanId);
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [plans, activePlanId]);

  const currentPlan = plans.find((p) => p.id === activePlanId) || plans[0] || palestineMathGrade3Plan;

  const updateCurrentPlan = (updated: LessonPlan) => {
    setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handlePlanGenerated = (newPlan: LessonPlan) => {
    setPlans((prev) => [newPlan, ...prev]);
    setActivePlanId(newPlan.id);
  };

  const handleResetToDefault = () => {
    if (confirm('هل تريد استعادة النسخة الأصلية النموذجية لدرس القيمة المنزلية المرفق بالملف؟')) {
      setPlans(defaultExemplarPlans);
      setActivePlanId(palestineMathGrade3Plan.id);
    }
  };

  const handleImportPlan = (imported: LessonPlan) => {
    const planWithId = { ...imported, id: imported.id || `plan-${Date.now()}` };
    setPlans((prev) => [planWithId, ...prev]);
    setActivePlanId(planWithId.id);
  };

  if (viewMode === 'official-print') {
    return (
      <OfficialPrintView
        plan={currentPlan}
        onBack={() => setViewMode('editor')}
      />
    );
  }

  const navSections = [
    { id: 'all', label: 'كافة الأقسام', icon: Sparkles },
    { id: 'sec1', label: '١. التخطيط التكيفي', icon: Compass },
    { id: 'sec2', label: '٢. سير الحصة الرباعي', icon: Clock },
    { id: 'sec3', label: '٣. التقويم الأصيل GRASPS', icon: Target },
    { id: 'sec4', label: '٤. بيئة التعلم والشراكة', icon: Users2 },
    { id: 'sec5', label: '٥. التأمل الذاتي والـ PLC', icon: BrainCircuit },
    { id: 'sec6', label: '٦. الاعتماد والتوقيع', icon: FileCheck },
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-['Cairo',sans-serif] text-right">
      {/* Top Navbar */}
      <HeaderNav
        plans={plans}
        activePlanId={currentPlan.id}
        onSelectPlan={(id) => setActivePlanId(id)}
        onOpenAiGenerator={() => setIsAiModalOpen(true)}
        onOpenAbacusModal={() => setIsAbacusModalOpen(true)}
        onOpenPrintView={() => setViewMode('official-print')}
        onResetToDefault={handleResetToDefault}
        onImportPlan={handleImportPlan}
        currentPlan={currentPlan}
      />

      {/* Hero Pedagogical Context Banner */}
      <section className="bg-linear-to-b from-emerald-950 via-slate-900 to-slate-900 text-white py-6 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-semibold border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>مستند إلى إطار تقييم أداء المعلم وكتب المنهاج الفلسطيني والعربي</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-['Tajawal'] tracking-wide">
              {currentPlan.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              نموذج تحضير صفي شامل يعتمد التخطيط التكيفي، الكفايات التكاملية، والمحسوسات، ومهمات التقويم الأصيل (GRASPS)، وسلالم التقدير اللفظية (Rubric)، والشراكة الأسرية التفاعلية.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAbacusModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-700/80 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors border border-emerald-500/40 shadow-xs"
            >
              <Calculator className="w-4 h-4 text-emerald-200" />
              فتح المعداد التفاعلي الرقمي
            </button>
            <button
              onClick={() => setViewMode('official-print')}
              className="px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-md"
            >
              <Printer className="w-4 h-4 text-emerald-800" />
              معاينة النموذج الوزاري الرسمي (A4)
            </button>
          </div>
        </div>
      </section>

      {/* Sub-nav Category Tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 scrollbar-none">
            {navSections.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-200' : 'text-slate-500'}`} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header / Institutional Metadata */}
        <LessonHeaderCard
          header={currentPlan.header}
          onChange={(header) => updateCurrentPlan({ ...currentPlan, header })}
        />

        {/* Section 1: Adaptive Planning */}
        {(activeTab === 'all' || activeTab === 'sec1') && (
          <Section1Card
            data={currentPlan.section1}
            lessonContext={{
              subject: currentPlan.header.subject,
              grade: currentPlan.header.grade,
              lessonTitle: currentPlan.header.lessonTitle,
            }}
            onChange={(section1) => updateCurrentPlan({ ...currentPlan, section1 })}
          />
        )}

        {/* Section 2: Timeline */}
        {(activeTab === 'all' || activeTab === 'sec2') && (
          <Section2TimelineCard
            timeline={currentPlan.section2Timeline}
            totalMinutes={currentPlan.header.periodDurationMinutes}
            onOpenAbacusModal={() => setIsAbacusModalOpen(true)}
            onOpenExitTicketModal={() => setIsExitTicketModalOpen(true)}
            onChange={(section2Timeline) => updateCurrentPlan({ ...currentPlan, section2Timeline })}
          />
        )}

        {/* Section 3: Assessment & GRASPS */}
        {(activeTab === 'all' || activeTab === 'sec3') && (
          <Section3AssessmentCard
            data={currentPlan.section3Assessment}
            onChange={(section3Assessment) => updateCurrentPlan({ ...currentPlan, section3Assessment })}
          />
        )}

        {/* Section 4: Learning Environment & Parents */}
        {(activeTab === 'all' || activeTab === 'sec4') && (
          <Section4EnvironmentCard
            data={currentPlan.section4Environment}
            onOpenParentCardModal={() => setIsParentCardModalOpen(true)}
            onChange={(section4Environment) => updateCurrentPlan({ ...currentPlan, section4Environment })}
          />
        )}

        {/* Section 5: Self Reflection */}
        {(activeTab === 'all' || activeTab === 'sec5') && (
          <Section5ReflectionCard
            data={currentPlan.section5Reflection}
            onChange={(section5Reflection) => updateCurrentPlan({ ...currentPlan, section5Reflection })}
          />
        )}

        {/* Section 6: Official Signatures */}
        {(activeTab === 'all' || activeTab === 'sec6') && (
          <Section6SignaturesCard
            data={currentPlan.section6Signatures}
            onChange={(section6Signatures) => updateCurrentPlan({ ...currentPlan, section6Signatures })}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-700">
            منظومة خبير التخطيط التربوي ومصمم المناهج التعليمية المعتمد
          </p>
          <p>
            مستند إلى إطار تقييم أداء المعلم وكتب المنهاج المعتمدة، وفق مؤشرات التميز والتقويم الأصيل.
          </p>
        </div>
      </footer>

      {/* Modals */}
      <AiGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onPlanGenerated={handlePlanGenerated}
      />

      <AbacusSimulationModal
        isOpen={isAbacusModalOpen}
        onClose={() => setIsAbacusModalOpen(false)}
      />

      <ExitTicketModal
        isOpen={isExitTicketModalOpen}
        onClose={() => setIsExitTicketModalOpen(false)}
        plan={currentPlan}
      />

      <ParentCardModal
        isOpen={isParentCardModalOpen}
        onClose={() => setIsParentCardModalOpen(false)}
        plan={currentPlan}
      />
    </div>
  );
}
