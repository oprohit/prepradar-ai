/**
 * lib/diagnostic-engine.ts
 * Core placement readiness diagnostic, weakness vector calculator, and adaptive sprint generator.
 */

export type Pillar = 'quant' | 'coreCS' | 'dsa' | 'communication';
export type TargetTier = 'product' | 'service' | 'startup';

export interface DiagnosticOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface DiagnosticQuestion {
  id: string;
  pillar: Pillar;
  concept: string;
  prompt: string;
  codeSnippet?: string;
  options: DiagnosticOption[];
}

export interface CriticalGap {
  pillar: Pillar;
  concept: string;
  severity: 'critical' | 'moderate';
  missedQuestionId: string;
  remedyAction: string;
}

export interface WeaknessVector {
  pillarScores: Record<Pillar, number>;
  priScore: number; // 0-100 Placement Readiness Index
  statusLabel: string;
  criticalGaps: CriticalGap[];
  testedPillars: Pillar[];
}

export interface DailySprintTask {
  day: number;
  pillar: Pillar;
  concept: string;
  title: string;
  estimatedMinutes: number;
  objective: string;
  drillType: 'coding' | 'mcq' | 'system-design' | 'behavioral-audio';
  targetCompanyContext: string;
}

// 4-Pillar Diagnostic Question Bank (Every pillar tested with tagged concept)
export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 'q_quant_1',
    pillar: 'quant',
    concept: 'speed-work-rates',
    prompt: 'Machine A finishes a batch job in 6 hours. Machine B finishes the same job in 4 hours. If both machines run concurrently for 2 hours, what fraction of the batch remains unprocessed?',
    options: [
      { id: 'opt_q1_a', text: '1/6 of the batch', isCorrect: true, explanation: 'Rate = 1/6 + 1/4 = 5/12 per hour. In 2 hours, 10/12 = 5/6 is completed. Remaining = 1/6.' },
      { id: 'opt_q1_b', text: '1/4 of the batch', isCorrect: false, explanation: 'Incorrect rate addition.' },
      { id: 'opt_q1_c', text: '1/3 of the batch', isCorrect: false, explanation: 'Did not account for 2-hour duration.' },
      { id: 'opt_q1_d', text: '1/12 of the batch', isCorrect: false, explanation: 'Calculated 1-hour remainder instead of 2-hour.' }
    ]
  },
  {
    id: 'q_core_1',
    pillar: 'coreCS',
    concept: 'hash-indexing',
    prompt: 'A database table contains 10,000,000 user logs. An application frequently executes: SELECT * FROM logs WHERE timestamp BETWEEN $1 AND $2. Which indexing strategy guarantees the lowest I/O cost?',
    options: [
      { id: 'opt_c1_a', text: 'B+ Tree Index on (timestamp)', isCorrect: true, explanation: 'B+ trees maintain sorted leaf nodes linked sequentially, making range scans (BETWEEN) O(log N + K).' },
      { id: 'opt_c1_b', text: 'Hash Index on (timestamp)', isCorrect: false, explanation: 'Hash indexes only support equality lookups (=) in O(1) and cannot perform range queries.' },
      { id: 'opt_c1_c', text: 'Full-text Gin Index', isCorrect: false, explanation: 'GIN indexes are designed for text token search, not scalar range ordering.' },
      { id: 'opt_c1_d', text: 'Bitmap index on user_id', isCorrect: false, explanation: 'Does not accelerate the timestamp range filter.' }
    ]
  },
  {
    id: 'q_dsa_1',
    pillar: 'dsa',
    concept: 'dp-knapsack',
    prompt: 'You must choose items with given weights and values to maximize value within a weight limit W. If each item can be chosen at most once, what is the minimum space complexity for the dynamic programming array?',
    codeSnippet: 'dp[w] = max(dp[w], dp[w - weight[i]] + value[i])',
    options: [
      { id: 'opt_d1_a', text: 'O(W) 1D array iterating weights backward', isCorrect: true, explanation: 'Iterating capacity backward prevents overwriting values needed from the previous item state.' },
      { id: 'opt_d1_b', text: 'O(W) 1D array iterating weights forward', isCorrect: false, explanation: 'Forward iteration allows multiple choices of the same item (Unbounded Knapsack).' },
      { id: 'opt_d1_c', text: 'Strictly O(N * W) 2D matrix only', isCorrect: false, explanation: '2D matrix can be space-optimized to 1D since only the prior row is needed.' },
      { id: 'opt_d1_d', text: 'O(N) greedy sorting by value/weight ratio', isCorrect: false, explanation: 'Greedy ratio sorting only works for Fractional Knapsack, not 0/1.' }
    ]
  },
  {
    id: 'q_comm_1',
    pillar: 'communication',
    concept: 'star-method-behavioral',
    prompt: 'In a behavioral round, an interviewer asks: "Tell me about a time a production bug occurred because of your code." Which response structure earns the highest hiring manager score?',
    options: [
      { id: 'opt_m1_a', text: 'STAR structure: State incident impact, own root cause, describe immediate rollback, and detail the regression test added to prevent recurrence.', isCorrect: true, explanation: 'Demonstrates accountability, technical composure, and systemic prevention.' },
      { id: 'opt_m1_b', text: 'Explain that the QA team missed the staging release verification.', isCorrect: false, explanation: 'Blaming others signals poor team maturity.' },
      { id: 'opt_m1_c', text: 'State that you have never introduced a production bug.', isCorrect: false, explanation: 'Disqualifies candidate for lack of honesty or real-world experience.' },
      { id: 'opt_m1_d', text: 'Divert to a different project where everything went smoothly.', isCorrect: false, explanation: 'Fails to answer the direct interview inquiry.' }
    ]
  }
];

/**
 * Computes exact weakness vector from student answers.
 * Guarantees all 4 pillars are measured and sorts critical gaps by lowest pillar scores.
 */
export function computeWeaknessVector(
  questions: DiagnosticQuestion[],
  answers: Record<string, string> // { questionId: optionId }
): WeaknessVector {
  const scores: Record<Pillar, { total: number; correct: number }> = {
    quant: { total: 0, correct: 0 },
    coreCS: { total: 0, correct: 0 },
    dsa: { total: 0, correct: 0 },
    communication: { total: 0, correct: 0 }
  };

  const missedItems: {
    pillar: Pillar;
    concept: string;
    missedQuestionId: string;
    remedyAction: string;
  }[] = [];

  for (const q of questions) {
    scores[q.pillar].total += 1;
    const selectedOpt = q.options.find(o => o.id === answers[q.id]);
    if (selectedOpt?.isCorrect) {
      scores[q.pillar].correct += 1;
    } else {
      let remedy = 'Review core fundamentals and algorithmic patterns.';
      if (q.concept === 'speed-work-rates') remedy = 'Practice LCM-rate arithmetic shortcuts for multi-agent work problems.';
      if (q.concept === 'hash-indexing') remedy = 'Deep dive into B+ Tree leaf node traversal vs O(1) Hash bucket equality constraints.';
      if (q.concept === 'dp-knapsack') remedy = 'Drill 0/1 Knapsack 1D memory array reverse-order iteration patterns.';
      if (q.concept === 'star-method-behavioral') remedy = 'Structure behavioral answers into Situation, Task, Action, and Measurable Prevention.';

      missedItems.push({
        pillar: q.pillar,
        concept: q.concept,
        missedQuestionId: q.id,
        remedyAction: remedy
      });
    }
  }

  // Guard against untested pillars
  const testedPillars: Pillar[] = [];
  for (const p of ['quant', 'coreCS', 'dsa', 'communication'] as const) {
    if (scores[p].total === 0) {
      throw new Error(`Untested pillar detected: ${p}. Diagnostic must measure all 4 pillars.`);
    }
    testedPillars.push(p);
  }

  // Calculate percentage per pillar
  const pillarScores: Record<Pillar, number> = {
    quant: Math.round((scores.quant.correct / scores.quant.total) * 100),
    coreCS: Math.round((scores.coreCS.correct / scores.coreCS.total) * 100),
    dsa: Math.round((scores.dsa.correct / scores.dsa.total) * 100),
    communication: Math.round((scores.communication.correct / scores.communication.total) * 100)
  };

  // Weighted overall Placement Readiness Index (PRI)
  const priScore = Math.round(
    pillarScores.dsa * 0.35 +
    pillarScores.coreCS * 0.25 +
    pillarScores.quant * 0.25 +
    pillarScores.communication * 0.15
  );

  let statusLabel = 'Critical Vulnerability';
  if (priScore >= 75) statusLabel = 'Tier-1 Interview Ready';
  else if (priScore >= 50) statusLabel = 'Placement Competitive';
  else if (priScore >= 25) statusLabel = 'Placement Vulnerable';

  // CRITICAL FIX: Sort missed concepts strictly by lowest pillar score ascending
  missedItems.sort((a, b) => pillarScores[a.pillar] - pillarScores[b.pillar]);

  const criticalGaps: CriticalGap[] = missedItems.slice(0, 2).map(item => ({
    pillar: item.pillar,
    concept: item.concept,
    severity: pillarScores[item.pillar] === 0 ? 'critical' : 'moderate',
    missedQuestionId: item.missedQuestionId,
    remedyAction: item.remedyAction
  }));

  return {
    pillarScores,
    priScore,
    statusLabel,
    criticalGaps,
    testedPillars
  };
}

/**
 * Generates an adaptive 7-day sprint targeting the diagnosed concepts,
 * tuned in difficulty by the student's target company tier.
 */
export function generateAdaptiveSprint(
  weakness: WeaknessVector,
  tier: TargetTier
): DailySprintTask[] {
  const topGaps = weakness.criticalGaps;
  const primaryConcept = topGaps[0]?.concept || 'dp-knapsack';
  const secondaryConcept = topGaps[1]?.concept || 'hash-indexing';

  const tierContext =
    tier === 'product'
      ? 'Target: Tier 1 Product (Zoho, Amazon, Google) - Focus on Space/Time tradeoffs'
      : tier === 'startup'
      ? 'Target: High-Growth Startup - Focus on full-stack architecture & rapid delivery'
      : 'Target: Service Core (TCS Digital, Cognizant, Accenture) - Focus on syntax accuracy';

  return [
    {
      day: 1,
      pillar: topGaps[0]?.pillar || 'dsa',
      concept: primaryConcept,
      title: `Day 1 Priority Sprint: Master ${primaryConcept.toUpperCase()}`,
      estimatedMinutes: 45,
      objective: `Eliminate primary failure vector in ${primaryConcept}. Implement 2 foundational drills.`,
      drillType: topGaps[0]?.pillar === 'communication' ? 'behavioral-audio' : 'coding',
      targetCompanyContext: tierContext
    },
    {
      day: 2,
      pillar: topGaps[1]?.pillar || 'coreCS',
      concept: secondaryConcept,
      title: `Day 2 Core Drill: Deep Dive ${secondaryConcept.toUpperCase()}`,
      estimatedMinutes: 40,
      objective: `Resolve secondary gap in ${secondaryConcept}. Practice query execution and index optimization.`,
      drillType: 'mcq',
      targetCompanyContext: tierContext
    },
    {
      day: 3,
      pillar: 'dsa',
      concept: 'sliding-window',
      title: 'Day 3 Speed Drill: Sliding Window & Substrings',
      estimatedMinutes: 30,
      objective: 'Optimize O(N^2) brute force loops into O(N) linear sliding window algorithms.',
      drillType: 'coding',
      targetCompanyContext: tierContext
    },
    {
      day: 4,
      pillar: 'quant',
      concept: 'speed-arithmetic',
      title: 'Day 4 Aptitude Sprint: 20-Second Calculation Shortcuts',
      estimatedMinutes: 30,
      objective: 'Solve 10 multi-worker and percentage ratio problems under timed exam conditions.',
      drillType: 'mcq',
      targetCompanyContext: tierContext
    },
    {
      day: 5,
      pillar: 'coreCS',
      concept: 'dbms-transactions',
      title: 'Day 5 Systems Drill: Isolation Levels & Row Locks',
      estimatedMinutes: 35,
      objective: 'Understand Dirty Reads, Non-repeatable reads, and MVCC in PostgreSQL / MySQL.',
      drillType: 'system-design',
      targetCompanyContext: tierContext
    },
    {
      day: 6,
      pillar: 'communication',
      concept: 'star-method-behavioral',
      title: 'Day 6 Mock Interview: STAR Behavioral Simulation',
      estimatedMinutes: 25,
      objective: 'Record structured answer for unexpected failure & team conflict scenarios.',
      drillType: 'behavioral-audio',
      targetCompanyContext: tierContext
    },
    {
      day: 7,
      pillar: 'dsa',
      concept: 'comprehensive-mock',
      title: 'Day 7 Full Re-evaluation Assessment',
      estimatedMinutes: 60,
      objective: 'Simulate full 60-minute company placement round to record final Placement Readiness Index.',
      drillType: 'coding',
      targetCompanyContext: tierContext
    }
  ];
}

// 90-Second Demo Presets (Stored strictly as sample inputs into the generic engine)
export const DEMO_PRESETS = {
  presetA: {
    label: 'Profile A (Target: Product Tier 1 - Zoho/Amazon)',
    tier: 'product' as TargetTier,
    // Answers correctly on Quant & Comm, Misses CoreCS & DSA
    answers: {
      q_quant_1: 'opt_q1_a', // Correct (Quant 100%)
      q_core_1: 'opt_c1_b',  // Wrong (Selected Hash for range -> flags hash-indexing)
      q_dsa_1: 'opt_d1_b',   // Wrong (Selected Forward iteration -> flags dp-knapsack)
      q_comm_1: 'opt_m1_a'   // Correct (Comm 100%)
    }
  },
  presetB: {
    label: 'Profile B (Target: Core Service Tier 2 - TCS/Accenture)',
    tier: 'service' as TargetTier,
    // Answers correctly on CoreCS & DSA, Misses Quant & Communication
    answers: {
      q_quant_1: 'opt_q1_b', // Wrong (Missed LCM arithmetic -> flags speed-work-rates)
      q_core_1: 'opt_c1_a',  // Correct (CoreCS 100%)
      q_dsa_1: 'opt_d1_a',   // Correct (DSA 100%)
      q_comm_1: 'opt_m1_b'   // Wrong (Blamed QA -> flags star-method-behavioral)
    }
  }
};
