'use client';

import React from 'react';
import { DailySprintTask, TargetTier } from '@/lib/diagnostic-engine';
import { Calendar, Clock, Target, PlayCircle, Sparkles } from 'lucide-react';

interface SprintPlanViewProps {
  sprintTasks: DailySprintTask[];
  targetTier: TargetTier;
  onStartPractice: (task: DailySprintTask) => void;
}

export function SprintPlanView({ sprintTasks, targetTier, onStartPractice }: SprintPlanViewProps) {
  const tierBadges: Record<TargetTier, { label: string; color: string }> = {
    product: { label: 'Product Tier 1 (Zoho, Amazon, Google)', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800' },
    service: { label: 'Service Core (TCS Digital, Cognizant)', color: 'text-sky-400 bg-sky-950/40 border-sky-800' },
    startup: { label: 'High-Growth Tech Startup', color: 'text-amber-400 bg-amber-950/40 border-amber-800' }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">Adaptive 7-Day Sprint Plan</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic curriculum mapped to eliminate diagnosed concept gaps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${tierBadges[targetTier].color}`}>
            {tierBadges[targetTier].label}
          </span>
        </div>
      </div>

      {/* Daily Tasks List */}
      <div className="space-y-3">
        {sprintTasks.map(task => {
          const isHighPriority = task.day === 1 || task.day === 2;

          return (
            <div
              key={task.day}
              className={`p-4 rounded-xl border transition-all ${
                isHighPriority
                  ? 'bg-slate-950/90 border-emerald-600/40 hover:border-emerald-500/60 relative overflow-hidden shadow-lg shadow-emerald-950/30'
                  : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {isHighPriority && (
                <div className="absolute top-0 right-0 bg-emerald-500/10 border-l border-b border-emerald-500/30 text-[10px] text-emerald-300 font-bold px-3 py-0.5 rounded-bl-lg flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" /> Diagnosed Priority Gap
                </div>
              )}

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-black ${
                      isHighPriority ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}>
                      D{task.day}
                    </span>
                    <h4 className="text-sm font-bold text-white">{task.title}</h4>
                    <span className="text-[10px] bg-slate-900 border border-slate-700 text-slate-300 px-2 py-0.5 rounded font-mono">
                      #{task.concept}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 pl-8">{task.objective}</p>
                </div>

                <div className="flex items-center gap-4 pl-8 md:pl-0 shrink-0">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{task.estimatedMinutes}m</span>
                  </div>

                  <button
                    onClick={() => onStartPractice(task)}
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all ${
                      isHighPriority
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    <PlayCircle className="w-3.5 h-3.5" /> Start Drill
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
