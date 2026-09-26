'use client';

import React, { useState } from 'react';
import { DIAGNOSTIC_QUESTIONS, DiagnosticQuestion } from '@/lib/diagnostic-engine';
import { CheckCircle2, AlertCircle, ArrowRight, BrainCircuit, RotateCcw } from 'lucide-react';

interface DiagnosticQuizProps {
  answers: Record<string, string>;
  onAnswerChange: (questionId: string, optionId: string) => void;
  onComplete: () => void;
}

export function DiagnosticQuiz({ answers, onAnswerChange, onComplete }: DiagnosticQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQ = DIAGNOSTIC_QUESTIONS[currentIndex];
  const selectedOptionId = answers[currentQ.id];
  const isAnswered = Boolean(selectedOptionId);
  const isLastQuestion = currentIndex === DIAGNOSTIC_QUESTIONS.length - 1;

  const pillarColorMap: Record<string, string> = {
    quant: 'text-amber-400 bg-amber-950/40 border-amber-800/50',
    coreCS: 'text-sky-400 bg-sky-950/40 border-sky-800/50',
    dsa: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50',
    communication: 'text-purple-400 bg-purple-950/40 border-purple-800/50'
  };

  const allAnswered = DIAGNOSTIC_QUESTIONS.every(q => answers[q.id]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
      {/* Quiz Header & Step Indicators */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">4-Pillar Diagnostic Assessment</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Question {currentIndex + 1} of {DIAGNOSTIC_QUESTIONS.length} • Concept: <span className="font-mono text-slate-200">{currentQ.concept}</span>
          </p>
        </div>

        {/* Question Navigation Tabs */}
        <div className="flex items-center gap-2">
          {DIAGNOSTIC_QUESTIONS.map((q, idx) => {
            const answered = Boolean(answers[q.id]);
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  isCurrent
                    ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900'
                    : answered
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                    : 'bg-slate-950 text-slate-500 border border-slate-800'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Question Box */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${pillarColorMap[currentQ.pillar]}`}>
            {currentQ.pillar}
          </span>
          <span className="text-xs text-slate-500">Tag: #{currentQ.concept}</span>
        </div>

        <h4 className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed">
          {currentQ.prompt}
        </h4>

        {currentQ.codeSnippet && (
          <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-emerald-400 font-mono overflow-x-auto">
            <code>{currentQ.codeSnippet}</code>
          </pre>
        )}

        {/* Options Grid */}
        <div className="space-y-2.5 pt-2">
          {currentQ.options.map(opt => {
            const isSelected = selectedOptionId === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onAnswerChange(currentQ.id, opt.id)}
                className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all ${
                  isSelected
                    ? opt.isCorrect
                      ? 'bg-emerald-950/30 border-emerald-500/80 text-white shadow-sm'
                      : 'bg-rose-950/30 border-rose-500/80 text-white shadow-sm'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-950'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center border text-[11px] font-bold shrink-0 ${
                      isSelected
                        ? opt.isCorrect
                          ? 'border-emerald-400 bg-emerald-500 text-slate-950'
                          : 'border-rose-400 bg-rose-500 text-slate-950'
                        : 'border-slate-700 text-slate-500'
                    }`}
                  >
                    {opt.id.slice(-1).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <span>{opt.text}</span>
                    {isSelected && (
                      <p className={`text-xs mt-2 pt-2 border-t font-normal ${
                        opt.isCorrect ? 'text-emerald-400 border-emerald-900/50' : 'text-rose-300 border-rose-900/50'
                      }`}>
                        <span className="font-semibold">{opt.isCorrect ? '✓ Correct: ' : '✗ Flaw Detected: '}</span>
                        {opt.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-800/80">
        <button
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="text-xs text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none px-3 py-1.5"
        >
          Previous
        </button>

        <div className="flex items-center gap-3">
          {!isLastQuestion ? (
            <button
              onClick={() => setCurrentIndex(prev => Math.min(DIAGNOSTIC_QUESTIONS.length - 1, prev + 1))}
              disabled={!isAnswered}
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all disabled:opacity-40"
            >
              Next Question <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onComplete}
              disabled={!allAnswered}
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-40"
            >
              Compile Weakness Vector <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
