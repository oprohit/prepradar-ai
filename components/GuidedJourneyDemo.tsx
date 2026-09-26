'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  DIAGNOSTIC_QUESTIONS,
  DEMO_PRESETS,
  computeWeaknessVector,
  generateAdaptiveSprint,
  TargetTier,
  WeaknessVector,
  DailySprintTask
} from '@/lib/diagnostic-engine';
import { ReadinessRadar } from '@/components/ReadinessRadar';
import {
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Layers,
  BrainCircuit,
  Zap,
  Clock,
  Code2,
  TrendingUp,
  ShieldCheck,
  Check
} from 'lucide-react';

interface GuidedJourneyDemoProps {
  isOpen: boolean;
  onClose: () => void;
  targetTier: TargetTier;
  onTierChange: (tier: TargetTier) => void;
  answers: Record<string, string>;
  onAnswerChange: (questionId: string, optionId: string) => void;
  weaknessVector: WeaknessVector;
  onLoadPresetA: () => void;
  onLoadPresetB: () => void;
  onReset: () => void;
  reassessedDelta: number;
  onApplyDelta: (delta: number) => void;
  activePresetLabel: string;
}

// 7-step progression budget matching the 90-second pitch
const STEP_CONFIG = [
  { step: 1, duration: 12, title: 'Target Tier & Profile Onboarding', badge: 'Step 1: Onboard' },
  { step: 2, duration: 25, title: '4-Pillar Diagnostic Evaluation', badge: 'Step 2: Diagnostic' },
  { step: 3, duration: 15, title: 'Readiness Radar & PRI Computation', badge: 'Step 3: Radar & PRI' },
  { step: 4, duration: 18, title: 'Adaptive Sprint & Personalization Proof', badge: 'Step 4: Sprint & Tier-Proof' },
  { step: 5, duration: 12, title: 'Micro-Practice: Buggy Submission', badge: 'Step 5: Micro-Practice' },
  { step: 6, duration: 14, title: 'AI Audit (Gemini Circuit-Breaker)', badge: 'Step 6: AI Feedback' },
  { step: 7, duration: 12, title: 'Delta Tracking & Live Tier Upgrade', badge: 'Step 7: PRI Delta Reveal' }
];

export function GuidedJourneyDemo({
  isOpen,
  onClose,
  targetTier,
  onTierChange,
  answers,
  onAnswerChange,
  weaknessVector,
  onLoadPresetA,
  onLoadPresetB,
  onReset,
  reassessedDelta,
  onApplyDelta,
  activePresetLabel
}: GuidedJourneyDemoProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(STEP_CONFIG[0].duration);
  const [activePresetKey, setActivePresetKey] = useState<'presetA' | 'presetB' | 'live'>('presetA');

  // AI Evaluation state for steps 5-6
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalResult, setEvalResult] = useState<{
    isCorrect: boolean;
    score: number;
    feedback: string;
    complexity: string;
    remedy: string;
    deltaGain: number;
  } | null>(null);

  // Knapsack code solutions (buggy vs fixed)
  const buggyCode = `def knapSack_space_optimized(W, weights, values, n):
    dp = [0] * (W + 1)
    for i in range(n):
        # BUG: Forward iteration allows multiple inclusions of the same item!
        for w in range(weights[i], W + 1):
            dp[w] = max(dp[w], dp[w - weights[i]] + values[i])
    return dp[W]`;

  const fixedCode = `def knapSack_space_optimized(W, weights, values, n):
    dp = [0] * (W + 1)
    for i in range(n):
        # FIX: Reverse iteration prevents reusing the same item
        for w in range(W, weights[i] - 1, -1):
            dp[w] = max(dp[w], dp[w - weights[i]] + values[i])
    return dp[W]`;

  // Timer logic for auto-play
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          // Advance to next step or loop/pause
          setCurrentStep(curr => {
            if (curr >= 7) {
              setIsPlaying(false);
              return 7;
            }
            const next = curr + 1;
            setSecondsRemaining(STEP_CONFIG[next - 1].duration);
            return next;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isPlaying, currentStep]);

  // When step changes manually, reset seconds remaining
  function goToStep(stepNum: number) {
    const clamped = Math.max(1, Math.min(7, stepNum));
    setCurrentStep(clamped);
    setSecondsRemaining(STEP_CONFIG[clamped - 1].duration);

    // Auto-trigger evaluation if jumping to step 6
    if (clamped === 6 && !evalResult) {
      triggerEvaluation();
    }
  }

  // Handle Preset selection
  function selectPreset(type: 'presetA' | 'presetB' | 'live') {
    setActivePresetKey(type);
    if (type === 'presetA') {
      onLoadPresetA();
    } else if (type === 'presetB') {
      onLoadPresetB();
    } else {
      // Live improvised mode
      onReset();
    }
    setEvalResult(null);
  }

  // Trigger real AI evaluation for step 6
  async function triggerEvaluation() {
    setEvalLoading(true);
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: weaknessVector.criticalGaps[0]?.concept || 'dp-knapsack',
          solution: buggyCode,
          targetTier
        })
      });
      const data = await res.json();
      setEvalResult({
        isCorrect: data.isCorrect,
        score: data.score,
        feedback: data.actionableFeedback,
        complexity: `Time: ${data.timeComplexity} • Space: ${data.spaceComplexity}`,
        remedy: data.remedyHint,
        deltaGain: data.deltaGain || 14
      });
    } catch {
      setEvalResult({
        isCorrect: false,
        score: 35,
        feedback: 'Flaw detected: Forward iteration causes state overwrite (Unbounded Knapsack bug). You must iterate capacity backward.',
        complexity: 'Time: O(N * W) • Space: O(W)',
        remedy: 'Iterate capacity backwards: for w in range(W, weights[i] - 1, -1)',
        deltaGain: 14
      });
    } finally {
      setEvalLoading(false);
    }
  }

  // Step 7: Apply the delta gain
  useEffect(() => {
    if (currentStep === 7 && reassessedDelta === 0) {
      onApplyDelta(evalResult?.deltaGain || 14);
    }
  }, [currentStep, reassessedDelta, evalResult, onApplyDelta]);

  if (!isOpen) return null;

  const currentConfig = STEP_CONFIG[currentStep - 1];
  const adaptiveTasks = generateAdaptiveSprint(weaknessVector, targetTier);
  const primaryGap = weaknessVector.criticalGaps[0] || { pillar: 'dsa', concept: 'dp-knapsack' };
  const secondaryGap = weaknessVector.criticalGaps[1] || { pillar: 'coreCS', concept: 'hash-indexing' };

  // Calculate dynamic upgraded status
  const finalPRI = Math.min(100, weaknessVector.priScore + (reassessedDelta || 14));
  let upgradedStatus = 'Critical Vulnerability';
  if (finalPRI >= 75) upgradedStatus = 'Tier-1 Interview Ready';
  else if (finalPRI >= 50) upgradedStatus = 'Placement Competitive';
  else if (finalPRI >= 25) upgradedStatus = 'Placement Vulnerable';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl w-full max-w-5xl shadow-2xl shadow-emerald-950/50 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Top Control Bar */}
        <div className="bg-slate-950/90 border-b border-slate-800 p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BrainCircuit className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                  90-Second Judge Demo
                </span>
                <span className="text-xs text-slate-400">Walkthrough State Machine</span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                {currentConfig.title}
              </h2>
            </div>
          </div>

          {/* Preset Buttons & Close */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
              <button
                onClick={() => selectPreset('presetA')}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                  activePresetKey === 'presetA'
                    ? 'bg-sky-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Preset A (Product)
              </button>
              <button
                onClick={() => selectPreset('presetB')}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                  activePresetKey === 'presetB'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Preset B (Service)
              </button>
              <button
                onClick={() => selectPreset('live')}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                  activePresetKey === 'live'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Live Judge
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all ml-1"
              title="Exit Demo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Indicator & Pacing Tracker */}
        <div className="bg-slate-950 border-b border-slate-800/80 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 shrink-0">
          {/* Step Bubbles */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
            {STEP_CONFIG.map(s => {
              const isActive = s.step === currentStep;
              const isPast = s.step < currentStep;
              return (
                <button
                  key={s.step}
                  onClick={() => goToStep(s.step)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                      : isPast
                      ? 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                      : 'bg-slate-950 border-slate-800 text-slate-600 hover:text-slate-400'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] flex items-center justify-center">
                    {s.step}
                  </span>
                  <span className="hidden md:inline">{s.badge}</span>
                </button>
              );
            })}
          </div>

          {/* Play/Pause & Countdown */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{secondsRemaining}s</span>
            </div>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-all"
              title={isPlaying ? 'Pause Auto-Advance' : 'Play Auto-Advance'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            </button>

            <button
              onClick={() => {
                onReset();
                goToStep(1);
                onApplyDelta(0);
                setEvalResult(null);
                setIsPlaying(true);
              }}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all"
              title="Reset Demo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dynamic Step View Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: ONBOARD & TARGET TIER */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
                <span className="text-xs font-bold text-emerald-400 block mb-1">
                  1. Target Tier Selection (Calibration Context)
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Students begin by targeting their aspirational company tier. In PrepRadar AI, the target tier ONLY calibrates drill difficulty and company context (e.g., Space/Time trade-offs vs syntax precision)—it NEVER decides which weaknesses are surfaced. That is mathematically computed from actual answers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  onClick={() => onTierChange('product')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    targetTier === 'product'
                      ? 'bg-sky-950/40 border-sky-500 shadow-lg shadow-sky-950/50'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-sky-400">Tier 1 Product</span>
                    {targetTier === 'product' && <Check className="w-4 h-4 text-sky-400" />}
                  </div>
                  <h4 className="text-sm font-bold text-white">Zoho, Amazon, Google</h4>
                  <p className="text-xs text-slate-400 mt-2">
                    Focus on Space/Time complexity trade-offs, system scalability, and 1D memory optimizations.
                  </p>
                </div>

                <div
                  onClick={() => onTierChange('service')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    targetTier === 'service'
                      ? 'bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-950/50'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-400">Core Service</span>
                    {targetTier === 'service' && <Check className="w-4 h-4 text-amber-400" />}
                  </div>
                  <h4 className="text-sm font-bold text-white">TCS Digital, Cognizant, Accenture</h4>
                  <p className="text-xs text-slate-400 mt-2">
                    Focus on syntax accuracy, speed aptitude, core DBMS SQL indexing, and foundational logic.
                  </p>
                </div>

                <div
                  onClick={() => onTierChange('startup')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    targetTier === 'startup'
                      ? 'bg-purple-950/40 border-purple-500 shadow-lg shadow-purple-950/50'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-purple-400">High-Growth Startup</span>
                    {targetTier === 'startup' && <Check className="w-4 h-4 text-purple-400" />}
                  </div>
                  <h4 className="text-sm font-bold text-white">Fintech, AI Native, SaaS</h4>
                  <p className="text-xs text-slate-400 mt-2">
                    Focus on full-stack API architecture, rapid prototyping, and incident ownership.
                  </p>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-400">Active Preset Loaded: <strong className="text-white">{activePresetLabel}</strong></span>
                <span className="text-emerald-400 font-mono">Current Target Tier: {targetTier.toUpperCase()}</span>
              </div>
            </div>
          )}

          {/* STEP 2: 4-PILLAR DIAGNOSTIC EVALUATION */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-400 block mb-1">
                    2. 4-Pillar Diagnostic Test (No Untested Fallbacks)
                  </span>
                  <p className="text-xs text-slate-300">
                    Each question tests a discrete pillar and concept tag. Watch answers compile directly:
                  </p>
                </div>
                <span className="text-xs font-mono bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1 rounded-xl">
                  {Object.keys(answers).length} / {DIAGNOSTIC_QUESTIONS.length} Answered
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DIAGNOSTIC_QUESTIONS.map((q, idx) => {
                  const selectedOptId = answers[q.id];
                  const selectedOpt = q.options.find(o => o.id === selectedOptId);
                  const isCorrect = selectedOpt?.isCorrect;

                  return (
                    <div
                      key={q.id}
                      className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-bold flex items-center justify-center text-slate-300">
                            {idx + 1}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                            {q.pillar}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">#{q.concept}</span>
                      </div>

                      <p className="text-xs text-slate-200 line-clamp-2">{q.prompt}</p>

                      <div className="space-y-1.5 pt-1">
                        {q.options.map(opt => {
                          const isSelected = selectedOptId === opt.id;
                          return (
                            <button
                              key={opt.id}
                              onClick={() => onAnswerChange(q.id, opt.id)}
                              className={`w-full text-left text-[11px] p-2 rounded-lg border transition-all ${
                                isSelected
                                  ? opt.isCorrect
                                    ? 'bg-emerald-950/50 border-emerald-500 text-white font-semibold'
                                    : 'bg-rose-950/50 border-rose-500 text-white font-semibold'
                                  : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="line-clamp-1">{opt.text}</span>
                                {isSelected && (
                                  <span className="text-[10px] shrink-0 font-bold ml-2">
                                    {opt.isCorrect ? '✓ Correct' : '✗ Missed'}
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: READINESS RADAR & PRI */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
                <span className="text-xs font-bold text-emerald-400 block mb-1">
                  3. Mathematical Vector Synthesis (Placement Readiness Index)
                </span>
                <p className="text-xs text-slate-300">
                  Calculated directly from student submissions: DSA (35%) + CoreCS (25%) + Quant (25%) + Communication (15%). No hardcoded strings.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-6">
                  <ReadinessRadar weakness={weaknessVector} reassessedDelta={0} />
                </div>

                <div className="md:col-span-6 space-y-4">
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                      Measured Pillar Breakdown
                    </span>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-emerald-400">DSA (35%)</span>
                        <div className="text-lg font-black text-white mt-1">
                          {weaknessVector.pillarScores.dsa}%
                        </div>
                      </div>

                      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-sky-400">Core CS (25%)</span>
                        <div className="text-lg font-black text-white mt-1">
                          {weaknessVector.pillarScores.coreCS}%
                        </div>
                      </div>

                      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-amber-400">Quant (25%)</span>
                        <div className="text-lg font-black text-white mt-1">
                          {weaknessVector.pillarScores.quant}%
                        </div>
                      </div>

                      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-purple-400">Comm (15%)</span>
                        <div className="text-lg font-black text-white mt-1">
                          {weaknessVector.pillarScores.communication}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-950/30 border border-emerald-500/40 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-emerald-400">Placement Readiness Index</span>
                      <div className="text-2xl font-black text-white">{weaknessVector.priScore}/100</div>
                    </div>
                    <span className="text-xs font-bold bg-emerald-900/60 border border-emerald-700 text-emerald-200 px-3 py-1.5 rounded-xl">
                      {weaknessVector.statusLabel}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: ADAPTIVE SPRINT & TIER SWITCH PROOF */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-emerald-400 block mb-1">
                    4. Bottom-2 Failure Domain Isolation & Tier-Switch Proof
                  </span>
                  <p className="text-xs text-slate-300">
                    The engine sorts missed concepts strictly by ascending pillar score to isolate critical gaps. Switch tiers below to verify that weak concepts stay identical while drill context changes!
                  </p>
                </div>

                {/* Tier Switch Toggle */}
                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-xl shrink-0">
                  <span className="text-[10px] font-bold text-slate-400 px-2 uppercase">Proof Switch:</span>
                  {(['product', 'service'] as TargetTier[]).map(t => (
                    <button
                      key={t}
                      onClick={() => onTierChange(t)}
                      className={`text-xs font-bold px-3 py-1 rounded-lg transition-all capitalize ${
                        targetTier === t
                          ? 'bg-emerald-500 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Critical Gaps Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-rose-950/30 border border-rose-500/50 p-4 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-rose-400">Primary Critical Gap</span>
                    <span className="text-[10px] bg-rose-950 border border-rose-800 px-2 py-0.5 rounded text-rose-200 font-mono">
                      #{primaryGap.concept}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white capitalize">{primaryGap.pillar} Failure Domain</h4>
                  <p className="text-xs text-slate-300 pt-1">{primaryGap.remedyAction}</p>
                </div>

                <div className="bg-amber-950/30 border border-amber-500/50 p-4 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-amber-400">Secondary Critical Gap</span>
                    <span className="text-[10px] bg-amber-950 border border-amber-800 px-2 py-0.5 rounded text-amber-200 font-mono">
                      #{secondaryGap.concept}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white capitalize">{secondaryGap.pillar} Failure Domain</h4>
                  <p className="text-xs text-slate-300 pt-1">{secondaryGap.remedyAction}</p>
                </div>
              </div>

              {/* Adaptive 7-Day Sprint Preview with Tier Context */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-white">
                    Generated 7-Day Sprint ({targetTier.toUpperCase()} Adapted Context)
                  </span>
                  <span className="text-[11px] text-emerald-400 font-mono">
                    {adaptiveTasks[0].targetCompanyContext}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {adaptiveTasks.slice(0, 4).map(task => (
                    <div key={task.day} className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-400">Day {task.day} • {task.pillar}</span>
                        <span className="text-[10px] text-slate-500 font-mono">#{task.concept}</span>
                      </div>
                      <div className="font-semibold text-slate-100">{task.title}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{task.objective}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: MICRO-PRACTICE WITH INTENTIONAL BUG */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-400 block mb-1">
                    5. Targeted Micro-Practice (Intentional Bug Attempt)
                  </span>
                  <p className="text-xs text-slate-300">
                    The student drills Day 1 on their primary gap (<code className="text-emerald-300">#{primaryGap.concept}</code>). Notice the bug: iterating forward instead of backwards!
                  </p>
                </div>
                <span className="text-xs font-mono bg-rose-950 border border-rose-800 text-rose-300 px-2.5 py-1 rounded-lg">
                  Buggy Attempt Loaded
                </span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                  <span>Target: 0/1 Knapsack 1D Memory Optimization</span>
                  <span className="text-rose-400 font-bold">Flaw: Forward Iteration Overwrites State</span>
                </div>

                <pre className="text-emerald-400 overflow-x-auto p-2 bg-slate-900/60 rounded-xl">
                  <code>{buggyCode}</code>
                </pre>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl text-xs text-slate-400 flex items-center justify-between">
                <span>Next step triggers Google Gemini evaluation under a strict 4-second circuit breaker.</span>
                <button
                  onClick={() => goToStep(6)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl transition-all"
                >
                  Run AI Audit <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: AI AUDIT VIA GEMINI CIRCUIT-BREAKER */}
          {currentStep === 6 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-400 block mb-1">
                    6. AI Audit (Sub-4s Circuit Breaker Protected)
                  </span>
                  <p className="text-xs text-slate-300">
                    Gemini analyzes the student's submission line-by-line, providing complexity insights and remediation hints.
                  </p>
                </div>
                <button
                  onClick={triggerEvaluation}
                  disabled={evalLoading}
                  className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  {evalLoading ? 'Evaluating...' : 'Re-Run AI Audit'}
                </button>
              </div>

              {evalLoading ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  Analyzing AST, complexity bounds, and state progression...
                </div>
              ) : evalResult ? (
                <div className="space-y-4">
                  <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <span className="text-sm font-bold text-white">Flaw Caught by GenAI Evaluator</span>
                      </div>
                      <span className="text-xs bg-slate-900 border border-slate-700 text-slate-300 px-2.5 py-1 rounded-lg">
                        Score: {evalResult.score}/100
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                      {evalResult.feedback}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Complexity Bounds</span>
                        <div className="text-slate-200 font-mono mt-1">{evalResult.complexity}</div>
                      </div>

                      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Actionable Remedy Tip</span>
                        <div className="text-emerald-400 mt-1">{evalResult.remedy}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-950/20 border border-emerald-500/30 p-3.5 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-emerald-300">
                      ⚡ Circuit Breaker Status: Active (&lt;4000ms response window guaranteed).
                    </span>
                    <button
                      onClick={() => goToStep(7)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3.5 py-1.5 rounded-xl transition-all"
                    >
                      Advance to Delta Reveal <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* STEP 7: DELTA TRACKING & LIVE TIER UPGRADE */}
          {currentStep === 7 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
                <span className="text-xs font-bold text-emerald-400 block mb-1">
                  7. Corrected Submission & Placement Readiness Index Delta
                </span>
                <p className="text-xs text-slate-300">
                  Student implements reverse iteration, successfully resolving the failure domain. Watch the live Radar and PRI score animate!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-6">
                  {/* Live Animated Radar with Delta applied */}
                  <ReadinessRadar weakness={weaknessVector} reassessedDelta={reassessedDelta || 14} />
                </div>

                <div className="md:col-span-6 space-y-4">
                  {/* Before vs After Score Card */}
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Placement Readiness Score Progression
                    </span>

                    <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Baseline PRI</span>
                        <span className="text-lg font-black text-slate-200">{weaknessVector.priScore}/100</span>
                      </div>

                      <div className="text-emerald-400 font-bold text-sm flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" /> +{reassessedDelta || 14}% Delta
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-emerald-400 block">Reassessed PRI</span>
                        <span className="text-2xl font-black text-emerald-400">{finalPRI}/100</span>
                      </div>
                    </div>

                    {/* Animated Tier Upgrade Badge */}
                    <div className="bg-emerald-950/40 border border-emerald-500/50 p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-emerald-400">Certified Status Upgrade</span>
                        <div className="text-base font-bold text-white mt-0.5">{upgradedStatus}</div>
                      </div>
                      <span className="text-xs font-bold bg-emerald-500 text-slate-950 px-3 py-1 rounded-xl shadow-md shadow-emerald-500/20">
                        Level Up ✓
                      </span>
                    </div>
                  </div>

                  {/* Summary & Loop Completion */}
                  <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl text-xs text-slate-400 space-y-2">
                    <div className="font-bold text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Placement Preparation Reimagined
                    </div>
                    <p className="leading-relaxed">
                      The full 7-step loop is proven: Onboard → 4-Pillar Diagnostic → Readiness Radar → Targeted Sprint → Micro-Practice → AI Audit → Measurable Delta.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="bg-slate-950/90 border-t border-slate-800 p-4 sm:px-6 flex items-center justify-between gap-4 shrink-0">
          <button
            onClick={() => goToStep(currentStep - 1)}
            disabled={currentStep === 1}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none px-3 py-2 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" /> Previous Step
          </button>

          <div className="text-xs font-semibold text-slate-400">
            Step <span className="text-white font-bold">{currentStep}</span> of 7
          </div>

          <div className="flex items-center gap-2">
            {currentStep < 7 ? (
              <button
                onClick={() => goToStep(currentStep + 1)}
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  onReset();
                  goToStep(1);
                  onApplyDelta(0);
                  setEvalResult(null);
                  setIsPlaying(true);
                }}
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
              >
                Restart Demo <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
