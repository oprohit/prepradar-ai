import { NextRequest, NextResponse } from 'next/server';
import { evaluatePracticeSubmission } from '@/lib/gemini-evaluator';

export async function POST(req: NextRequest) {
  try {
    const { concept, solution, targetTier } = await req.json();

    if (!concept || typeof solution !== 'string') {
      return NextResponse.json(
        { error: 'Missing required parameters: concept and solution' },
        { status: 400 }
      );
    }

    const evaluation = await evaluatePracticeSubmission(concept, solution, targetTier || 'product');
    return NextResponse.json(evaluation);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal evaluation failure' },
      { status: 500 }
    );
  }
}
