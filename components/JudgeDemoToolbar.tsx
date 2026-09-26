'use client';

import React from 'react';
import { TargetTier } from '@/lib/diagnostic-engine';
import { Sparkles, RefreshCw, UserCheck, ShieldCheck } from 'lucide-react';

interface JudgeDemoToolbarProps {
  onLoadPresetA: () => void;
  onLoadPresetB: () => void;
  onReset: () => void;
  targetTier: TargetTier;
  onTierChange: (tier: TargetTier) => void;
  activePresetLabel: string;
  onOpenGuidedDemo: () => void;
}

export function JudgeDemoToolbar({
  onLoadPresetA,
  onLoadPresetB,
  onReset,
  targetTier,
  onTierChange,
  activePresetLabel,
  onOpenGuidedDemo
}: JudgeDemoToolbarProps) {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-6 backdrop-blur-md">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left: Active Mode Info */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Judge Evaluation Mode
            </div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>{activePresetLabel}</span>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-emerald-400 font-mono">
                Generic Vector Pipeline Active
              </span>
            </div>
          </div>
        </div>

        {/* Center: Target Tier Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-500 font-bold px-2 uppercase">Tier:</span>
          {(['product', 'service', 'startup'] as TargetTier[]).map(t => (
            <button
              key={t}
              onClick={() => onTierChange(t)}
              className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-all capitalize ${
                targetTier === t
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Right: Quick Demo Preset Injectors */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenGuidedDemo}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3.5 py-1.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all ring-1 ring-emerald-300"
          >
            <Sparkles className="w-3.5 h-3.5" /> Watch 7-Step Journey (90s Demo)
          </button>

          <button
            onClick={onLoadPresetA}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl transition-all"
          >
            <UserCheck className="w-3.5 h-3.5 text-sky-400" /> Load Preset A (Product)
          </button>

          <button
            onClick={onLoadPresetB}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl transition-all"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-400" /> Load Preset B (Service)
          </button>

          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white border border-slate-800 px-3 py-1.5 rounded-xl transition-all"
            title="Reset to fresh diagnostic"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>
    </div>
  );
}
