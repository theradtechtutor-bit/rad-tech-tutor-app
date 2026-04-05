import { readFile } from "node:fs/promises";
import path from "node:path";

export type CeChoice = "A" | "B" | "C" | "D";

export type CeQuestionServer = {
  id: string;
  prompt: string;
  choices: { A: string; B: string; C: string; D: string };
  correct: CeChoice;
};

export type CeQuestionsFile = {
  courseId: string;
  totalQuestions: number;
  passPct: number;
  questions: CeQuestionServer[];
};

export async function loadCeQuestionsFile(questionJsonPath: string) {
  // questionJsonPath is like: data/ce/ce01/questions.mock.json
  const abs = path.join(process.cwd(), questionJsonPath);
  const raw = await readFile(abs, "utf8");
  const parsed = JSON.parse(raw) as CeQuestionsFile;

  if (!parsed?.questions?.length) throw new Error("CE questions file empty");
  return parsed;
}

// Client-safe version (NO correct answers)
export function toClientQuestions(file: CeQuestionsFile) {
  return {
    courseId: file.courseId,
    totalQuestions: file.totalQuestions,
    passPct: file.passPct,
    questions: file.questions.map((q) => ({
      id: q.id,
      prompt: q.prompt,
      choices: q.choices,
    })),
  };
}
