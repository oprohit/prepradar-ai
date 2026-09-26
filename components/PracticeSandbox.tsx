'use client';

import React, { useState } from 'react';
import { DailySprintTask } from '@/lib/diagnostic-engine';
import { PracticeEvaluationResult } from '@/lib/gemini-evaluator';
import { Code2, Sparkles, CheckCircle2, AlertTriangle, ArrowUpRight, Loader2 } from 'lucide-react';

interface PracticeSandboxProps {
  task: DailySprintTask;
  onApplyDelta: (delta: number) => void;
  onClose: () => void;
}

export function PracticeSandbox({ task, onApplyDelta, onClose }: PracticeSandboxProps) {
  const [solutionText, setSolutionText] = useState(
    task.concept === 'dp-knapsack'
      ? `def knapSack_space_optimized(W, weights, values, n):
    # Initialize 1D array of capacity W + 1
    dp = [0] * (W + 1)
    
    # Iterate through items
    for i in range(n):
        # Iterate weights backwards to prevent duplicate item use
        for w in range(W, weights[i] - 1, -1):
            dp[w] = max(dp[w], dp[w - weights[i]] + values[i])
            
    return dp[W]`
      : `// Explaining Hash Indexing vs B+Tree Indexing:
B+ Trees maintain sorted order across leaves, allowing O(log N) range queries.
Hash indexes compute bucket hashes in O(1), but cannot perform range lookups.`
  );

  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<PracticeEvaluationResult | null>(null);
  const [applied, setApplied] = useState(false);

  async function handleEvaluate() {
    setLoading(true);
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: task.concept,
          solution: solutionText,
          targetTier: 'product'
        })
      });

      const data = await res.json();
      setEvaluation(data);
    } catch (err: any) {
      console.error('Evaluation error:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleReassess() {
    if (evaluation && !applied) {
      onApplyDelta(evaluation.deltaGain);
      setApplied(true);
    }
  }

  return (
    <div className="bg-slate-900/95 border border-emerald-500/40 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden shadow-2xl shadow-emerald-950/40">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">Interactive Practice Sandbox</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Target Concept: <span className="font-mono text-emerald-300 font-bold">{task.concept}</span> • {task.title}
          </p>
        </div>

        <button
          onClick={onClose}
          className="text-xs text-slate-400 hover:text-white px-3 py-1 rounded-lg border border-slate-800 hover:bg-slate-800"
        >
          Exit Drill
        </button>
      </div>

      {/* Objective & Instructions */}
      <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 mb-4 text-xs text-slate-300">
        <span className="font-bold text-emerald-400 block mb-1">Challenge Objective:</span>
        {task.objective}
      </div>

      {/* Code / Solution Editor Area */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span>Your Implementation / Response</span>
          <span className="text-[10px] text-slate-500 font-normal">Python / Pseudo-code / Analytical Structure</span>
        </label>

        <textarea
          value={solutionText}
          onChange={e => setSolutionText(e.target.value)}
          rows={7}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-slate-100 focus:outline-none focus:border-emerald-500/80 transition-all resize-y"
        />

        <div className="flex items-center justify-between pt-1">
          <div className="text-[11px] text-slate-500">
            Powered by Google Gemini (4-Second Circuit-Breaker Protected)
          </div>

          <button
            onClick={handleEvaluate}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Evaluating Solution...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" /> Run AI Evaluation
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Evaluation Result Card */}
      {evaluation && (
        <div className="mt-6 border-t border-slate-800 pt-5 space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              {evaluation.isCorrect ? (
                <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">
                    {evaluation.isCorrect ? 'Concept Verified & Mastered' : 'Partial Understanding Detected'}
                  </span>
                  <span className="text-[10px] bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-slate-300">
                    Score: {evaluation.score}/100
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{evaluation.actionableFeedback}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                onClick={handleReassess}
                disabled={applied}
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all ${
                  applied
                    ? 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                }`}
              >
                {applied ? 'Readiness Score Updated ✓' : `Apply +${evaluation.deltaGain}% Reassessment Delta`}
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
              <span className="text-slate-500 font-semibold block text-[10px] uppercase">Complexity Analysis</span>
              <p className="text-slate-200 mt-1 font-mono text-[11px]">
                Time: {evaluation.timeComplexity} • Space: {evaluation.spaceComplexity}
              </p>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
              <span className="text-slate-500 font-semibold block text-[10px] uppercase">Actionable Remediation Tip</span>
              <p className="text-slate-200 mt-1 text-[11px]">{evaluation.remedyHint}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
