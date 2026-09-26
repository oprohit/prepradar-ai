'use client';

import React from 'react';
import { WeaknessVector, Pillar } from '@/lib/diagnostic-engine';
import { ShieldAlert, Award, Activity, CheckCircle2, ChevronRight } from 'lucide-react';

interface ReadinessRadarProps {
  weakness: WeaknessVector;
  reassessedDelta?: number;
}

export function ReadinessRadar({ weakness, reassessedDelta = 0 }: ReadinessRadarProps) {
  const { pillarScores, priScore, statusLabel, criticalGaps } = weakness;
  const currentPri = Math.min(100, priScore + reassessedDelta);

  // SVG Radar coordinates for 4 pillars (top, right, bottom, left)
  // Center is (120, 120), radius 80
  const center = 120;
  const maxR = 80;

  // Normalized scores (0-1)
  const normDSA = (pillarScores.dsa || 0) / 100;
  const normCore = (pillarScores.coreCS || 0) / 100;
  const normQuant = (pillarScores.quant || 0) / 100;
  const normComm = (pillarScores.communication || 0) / 100;

  // Points: Top=DSA, Right=CoreCS, Bottom=Quant, Left=Comm
  const ptDSA = `${center},${center - normDSA * maxR}`;
  const ptCore = `${center + normCore * maxR},${center}`;
  const ptQuant = `${center},${center + normQuant * maxR}`;
  const ptComm = `${center - normComm * maxR},${center}`;
  const polygonPoints = `${ptDSA} ${ptCore} ${ptQuant} ${ptComm}`;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">Placement Readiness Radar</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">4-Pillar Competency Vector & Gap Synthesis</p>
        </div>

        {/* PRI Score Badge */}
        <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Readiness Index</div>
            <div className="text-xs font-medium text-emerald-400">{statusLabel}</div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-white tracking-tight">{currentPri}</span>
            <span className="text-xs text-slate-500 font-bold">/100</span>
          </div>
          {reassessedDelta > 0 && (
            <span className="inline-flex items-center text-xs font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-600/40 px-2 py-0.5 rounded-full animate-pulse">
              +{reassessedDelta}% Delta
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Radar SVG Visual */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
          <svg width="240" height="240" className="overflow-visible">
            {/* Background concentric reference rings */}
            <circle cx={center} cy={center} r={maxR * 0.25} fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="2,2" />
            <circle cx={center} cy={center} r={maxR * 0.50} fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="2,2" />
            <circle cx={center} cy={center} r={maxR * 0.75} fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="2,2" />
            <circle cx={center} cy={center} r={maxR} fill="none" stroke="#475569" strokeWidth="1.5" />

            {/* Radar Crosshairs */}
            <line x1={center} y1={center - maxR - 10} x2={center} y2={center + maxR + 10} stroke="#334155" strokeWidth="1" />
            <line x1={center - maxR - 10} y1={center} x2={center + maxR + 10} y2={center} stroke="#334155" strokeWidth="1" />

            {/* Data Polygon */}
            <polygon
              points={polygonPoints}
              fill="rgba(16, 185, 129, 0.25)"
              stroke="#10B981"
              strokeWidth="2.5"
              className="transition-all duration-500"
            />

            {/* Pillar Vertex Points */}
            <circle cx={center} cy={center - normDSA * maxR} r="4" fill="#34D399" />
            <circle cx={center + normCore * maxR} cy={center} r="4" fill="#38BDF8" />
            <circle cx={center} cy={center + normQuant * maxR} r="4" fill="#F59E0B" />
            <circle cx={center - normComm * maxR} cy={center} r="4" fill="#A855F7" />

            {/* Pillar Text Labels */}
            <text x={center} y={center - maxR - 12} textAnchor="middle" className="text-[10px] fill-slate-300 font-bold">
              DSA ({pillarScores.dsa}%)
            </text>
            <text x={center + maxR + 14} y={center + 3} textAnchor="start" className="text-[10px] fill-slate-300 font-bold">
              Core CS ({pillarScores.coreCS}%)
            </text>
            <text x={center} y={center + maxR + 22} textAnchor="middle" className="text-[10px] fill-slate-300 font-bold">
              Quant ({pillarScores.quant}%)
            </text>
            <text x={center - maxR - 14} y={center + 3} textAnchor="end" className="text-[10px] fill-slate-300 font-bold">
              Comm ({pillarScores.communication}%)
            </text>
          </svg>
        </div>

        {/* Pillar Scores & Diagnosed Gaps */}
        <div className="lg:col-span-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-400 block">DSA / Algorithms</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-bold text-emerald-400">{pillarScores.dsa}%</span>
                <span className="text-[10px] text-slate-500">Weight 35%</span>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-400 block">Core CS (OS/DBMS)</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-bold text-sky-400">{pillarScores.coreCS}%</span>
                <span className="text-[10px] text-slate-500">Weight 25%</span>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-400 block">Quant Aptitude</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-bold text-amber-400">{pillarScores.quant}%</span>
                <span className="text-[10px] text-slate-500">Weight 25%</span>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-400 block">Technical Communication</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-bold text-purple-400">{pillarScores.communication}%</span>
                <span className="text-[10px] text-slate-500">Weight 15%</span>
              </div>
            </div>
          </div>

          {/* Diagnosed Gaps Section */}
          <div className="bg-slate-950/80 border border-rose-950/60 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                Diagnosed Critical Failure Domains ({criticalGaps.length})
              </span>
            </div>

            {criticalGaps.length === 0 ? (
              <div className="flex items-center gap-2 text-xs text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Zero critical vulnerabilities identified. Full competency demonstrated.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {criticalGaps.map((gap, idx) => (
                  <div key={idx} className="bg-rose-950/20 border border-rose-900/30 p-2.5 rounded-lg">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white uppercase">{gap.pillar}</span>
                      <span className="text-[10px] bg-rose-950 border border-rose-700/50 text-rose-300 px-2 py-0.5 rounded font-mono">
                        {gap.concept}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">{gap.remedyAction}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
