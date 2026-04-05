import { NextResponse } from "next/server";
import { z } from "zod";
import fs from "node:fs/promises";
import path from "node:path";
import { requireAuth } from "@/lib/auth/requireAuth";
import { getValidatorUsername } from "@/lib/validator/session";
import { CE_COURSES } from "@/lib/ce/catalog";
import { recordValidatorAttempt, ensureValidatorCertificate, getValidatorSummary } from "@/lib/validator/store";

type ChoiceKey = "A" | "B" | "C" | "D";

const BodySchema = z.object({
  answers: z.record(z.string(), z.enum(["A", "B", "C", "D"])),
});

function getCourseOrNull(courseId: string) {
  return CE_COURSES.find((c) => c.slug === courseId) ?? null;
}

async function loadQuestions(questionJsonPath: string) {
  const abs = path.join(process.cwd(), questionJsonPath);
  const raw = await fs.readFile(abs, "utf8");
  return JSON.parse(raw);
}

export async function POST(req: Request, { params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;

  const course = getCourseOrNull(courseId);
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  const auth = await requireAuth();
  if (auth.kind === "none") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const bodyJson = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(bodyJson);
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const bank = await loadQuestions(course.questionJsonPath);
  const questions: Array<{ id: string; correct: ChoiceKey }> = bank.questions ?? [];
  const passPct: number = Number(bank.passPct ?? course.passPct ?? 75);

  const answers = parsed.data.answers;

  let correctCount = 0;
  const perQuestion: Record<string, boolean> = {};

  for (const q of questions) {
    const pick = answers[q.id];
    const isCorrect = pick === q.correct;
    perQuestion[q.id] = isCorrect;
    if (isCorrect) correctCount += 1;
  }

  const total = questions.length || Object.keys(answers).length || 1;
  const scorePct = Math.round((correctCount / total) * 1000) / 10;
  const passed = scorePct >= passPct;

  // Validator path: store locally, enforce 3 attempts, issue local certificate
  if (auth.kind === "validator") {
    const vUser = await getValidatorUsername();
    if (!vUser) {
      return NextResponse.json({ error: "Validator not logged in" }, { status: 401 });
    }
    const sumBefore = await getValidatorSummary(courseId, vUser);
    if (sumBefore.attemptsUsed >= 3) {
      return NextResponse.json({ ok: false, locked: true, ...sumBefore }, { status: 403 });
    }

    const usedNow = await recordValidatorAttempt(courseId, vUser, scorePct, passed);
    const remaining = Math.max(0, 3 - usedNow);

    let certNumber: string | null = null;
    if (passed) {
      const cert = await ensureValidatorCertificate(courseId, vUser, scorePct);
      certNumber = cert.cert_number;
    }

    return NextResponse.json({
      ok: true,
      courseId,
      scorePct,
      passed,
      passPct,
      attemptsUsed: usedNow,
      attemptsRemaining: remaining,
      perQuestion,
      certNumber,
      reviewer: true,
    });
  }

  // User path: Supabase DB is source of truth
  const { user, supabase } = auth;

  const { data: attemptRows, error: attemptErr } = await supabase
    .from("ce_attempts")
    .select("id, created_at")
    .eq("user_id", user.id)
    .eq("course_id", courseId);

  if (attemptErr) {
    return NextResponse.json(
      { error: "Database not ready", detail: "Missing table ce_attempts. Run SUPABASE_CE_SCHEMA.sql in Supabase." },
      { status: 500 }
    );
  }

  const attemptsUsed = attemptRows?.length ?? 0;
  const maxAttempts = 3;
  if (attemptsUsed >= maxAttempts) {
    return NextResponse.json({ ok: false, locked: true, attemptsUsed, attemptsRemaining: 0 }, { status: 403 });
  }

  const { error: insertErr } = await supabase.from("ce_attempts").insert({
    user_id: user.id,
    course_id: courseId,
    score_pct: scorePct,
    passed,
    answers,
  });

  if (insertErr) return NextResponse.json({ error: "Failed to save attempt" }, { status: 500 });

  const attemptsUsedNow = attemptsUsed + 1;
  const attemptsRemaining = Math.max(0, maxAttempts - attemptsUsedNow);

  let certNumber: string | null = null;

  if (passed) {
    const { data: certExisting, error: certSelErr } = await supabase
      .from("ce_certificates")
      .select("cert_number")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle();

    if (certSelErr) {
      return NextResponse.json(
        { error: "Database not ready", detail: "Missing table ce_certificates. Run SUPABASE_CE_SCHEMA.sql in Supabase." },
        { status: 500 }
      );
    }

    if (certExisting?.cert_number) {
      certNumber = certExisting.cert_number;
    } else {
      const dateStamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
      const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
      certNumber = `RTT-${courseId.toUpperCase()}-${dateStamp}-${rand}`;

      const { error: certInsErr } = await supabase.from("ce_certificates").insert({
        user_id: user.id,
        course_id: courseId,
        cert_number: certNumber,
        score_pct: scorePct,
      });

      if (certInsErr) return NextResponse.json({ error: "Failed to issue certificate" }, { status: 500 });
    }
  }

  return NextResponse.json({
    ok: true,
    courseId,
    scorePct,
    passed,
    passPct,
    attemptsUsed: attemptsUsedNow,
    attemptsRemaining,
    perQuestion,
    certNumber,
  });
}
