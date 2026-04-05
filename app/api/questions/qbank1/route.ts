import { NextResponse } from 'next/server';
import { loadQuestions } from '@/lib/load-questions';

export async function GET() {
  const questions = await loadQuestions('data/questions/qbank1_core_skills.json');
  return NextResponse.json({ questions });
}
