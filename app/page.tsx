'use client';

import React, { useState, useMemo } from 'react';
import {
  DIAGNOSTIC_QUESTIONS,
  computeWeaknessVector,
  generateAdaptiveSprint,
  DEMO_PRESETS,
  TargetTier,
  DailySprintTask
} from '@/lib/diagnostic-engine';
import { ReadinessRadar } from '@/components/ReadinessRadar';
import { DiagnosticQuiz } from '@/components/DiagnosticQuiz';
import { SprintPlanView } from '@/components/SprintPlanView';
import { PracticeSandbox } from '@/components/PracticeSandbox';
import { JudgeDemoToolbar } from '@/components/JudgeDemoToolbar';
import { Sparkles, BrainCircuit, ShieldCheck, Zap, BookOpen, Layers } from 'lucide-react';

export default function PlacementDashboard() {
  const [targetTier, setTargetTier] = useState<TargetTier>('product');
  const [answers, setAnswers] = useState<Record<string, string>>(DEMO_PRESETS.presetA.answers);
  const [activePresetLabel, setActivePresetLabel] = useState<string>('Profile A (Product Tier 1: Zoho/Amazon)');
  const [reassessedDelta, setReassessedDelta] = useState<number>(0);
  const [activePracticeTask, setActivePracticeTask] = useState<DailySprintTask | null>(null);

  // Compute weakness vector strictly from actual answers given (all 4 pillars measured)
  const weaknessVector = useMemo(() => {
    return computeWeaknessVector(DIAGNOSTIC_QUESTIONS, answers);
  }, [answers]);

  // Generate 7-day adaptive sprint mapped to diagnosed weak concepts
  const sprintTasks = useMemo(() => {
    return generateAdaptiveSprint(weaknessVector, targetTier);
  }, [weaknessVector, targetTier]);

  function handleAnswerChange(questionId: string, optionId: string) {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    setActivePresetLabel('Judge Improvised Mode (Live Answers Computed)');
    setReassessedDelta(0); // reset delta on new answer change
  }

  function handleLoadPresetA() {
    setTargetTier(DEMO_PRESETS.presetA.tier);
    setAnswers(DEMO_PRESETS.presetA.answers);
    setActivePresetLabel(DEMO_PRESETS.presetA.label);
    setReassessedDelta(0);
    setActivePracticeTask(null);
  }

  function handleLoadPresetB() {
    setTargetTier(DEMO_PRESETS.presetB.tier);
    setAnswers(DEMO_PRESETS.presetB.answers);
    setActivePresetLabel(DEMO_PRESETS.presetB.label);
    setReassessedDelta(0);
    setActivePracticeTask(null);
  }

  function handleReset() {
    setAnswers({});
    setActivePresetLabel('Fresh Diagnostic (Awaiting Answers)');
    setReassessedDelta(0);
    setActivePracticeTask(null);
  }

  function handleApplyDelta(delta: number) {
    setReassessedDelta(prev => prev + delta);
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BrainCircuit className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                PrepRadar AI <span className="text-xs bg-emerald-950 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-800">v1.0</span>
              </h1>
              <p className="text-xs text-slate-400">
                Autonomous 4-Pillar Placement Readiness Engine • GDGoC-CIT Hackathon
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Status</span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Generic Vector Pipeline Operational
            </span>
          </div>
        </div>
      </header>

      {/* Judge Demo Quick Toolbar */}
      <JudgeDemoToolbar
        onLoadPresetA={handleLoadPresetA}
        onLoadPresetB={handleLoadPresetB}
        onReset={handleReset}
        targetTier={targetTier}
        onTierChange={setTargetTier}
        activePresetLabel={activePresetLabel}
      />

      {/* Top Section: Radar & Diagnostic Test */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Readiness Radar & Score Card */}
        <div className="lg:col-span-6 space-y-6">
          <ReadinessRadar
            weakness={weaknessVector}
            reassessedDelta={reassessedDelta}
          />

          {/* Value Proposition Callout */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 text-xs text-slate-300 space-y-3">
            <div className="flex items-center gap-2 font-bold text-white">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>How Personalization Works (No Hardcoded Tier Branches)</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Every question is tagged with a pillar (<code className="text-emerald-300">dsa</code>, <code className="text-sky-300">coreCS</code>, <code className="text-amber-300">quant</code>, <code className="text-purple-300">communication</code>) and a specific concept. The engine computes mathematical per-pillar scores from your actual answers, isolates the lowest two pillars, and targets the exact missed concepts.
            </p>
          </div>
        </div>

        {/* Right Column: Interactive 4-Pillar Diagnostic Test */}
        <div className="lg:col-span-6 space-y-6">
          <DiagnosticQuiz
            answers={answers}
            onAnswerChange={handleAnswerChange}
            onComplete={() => {
              // Quiz compiled; scroll to sprint
              const el = document.getElementById('sprint-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </div>
      </div>

      {/* Interactive Practice Sandbox Modal/Drawer */}
      {activePracticeTask && (
        <div id="practice-section" className="animate-in fade-in zoom-in-95 duration-300">
          <PracticeSandbox
            task={activePracticeTask}
            onApplyDelta={handleApplyDelta}
            onClose={() => setActivePracticeTask(null)}
          />
        </div>
      )}

      {/* Adaptive 7-Day Sprint Plan */}
      <div id="sprint-section">
        <SprintPlanView
          sprintTasks={sprintTasks}
          targetTier={targetTier}
          onStartPractice={task => {
            setActivePracticeTask(task);
            const el = document.getElementById('practice-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      </div>

      {/* Footer Benchmarks */}
      <footer className="border-t border-slate-800/80 pt-6 text-center text-xs text-slate-500">
        <p>PrepRadar AI • Built for GDGoC-CIT Hackathon • $0 Free-Tier Architecture • Zero Fake Writes</p>
      </footer>
    </main>
  );
}
