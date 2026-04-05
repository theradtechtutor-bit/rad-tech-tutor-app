import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/requireAuth";
import { getValidatorUsername } from "@/lib/validator/session";
import { getValidatorSummary } from "@/lib/validator/store";

export async function GET(_req: Request, { params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;

  const auth = await requireAuth();
  if (auth.kind === "none") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (auth.kind === "validator") {
    const vUser = await getValidatorUsername();
    if (!vUser) return NextResponse.json({ error: "Validator not logged in" }, { status: 401 });
    const s = await getValidatorSummary(courseId, vUser);
    return NextResponse.json({
      ok: true,
      courseId,
      attemptsUsed: s.attemptsUsed,
      attemptsRemaining: s.attemptsRemaining,
      maxAttempts: s.maxAttempts,
      lastAttempt: s.lastAttempt,
      certificate: s.certificate,
      reviewer: true,
      reviewerUser: vUser,
      passedAlready: !!(s.certificate || s.lastAttempt?.passed),
    });
  }

  const { user, supabase } = auth;

  const { data: attempts, error: attemptErr } = await supabase
    .from("ce_attempts")
    .select("id, created_at, score_pct, passed")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .order("created_at", { ascending: false });

  if (attemptErr) {
    return NextResponse.json(
      { error: "Database not ready", detail: "Missing table ce_attempts. Run SUPABASE_CE_SCHEMA.sql in Supabase." },
      { status: 500 }
    );
  }

  const attemptsUsed = attempts?.length ?? 0;
  const maxAttempts = 3;
  const attemptsRemaining = Math.max(0, maxAttempts - attemptsUsed);
  const lastAttempt = attempts?.[0] ?? null;

  const { data: cert, error: certErr } = await supabase
    .from("ce_certificates")
    .select("cert_number, issued_at, score_pct")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .maybeSingle();

  if (certErr) {
    return NextResponse.json(
      { error: "Database not ready", detail: "Missing table ce_certificates. Run SUPABASE_CE_SCHEMA.sql in Supabase." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    courseId,
    attemptsUsed,
    attemptsRemaining,
    maxAttempts,
    lastAttempt,
    certificate: cert ? { ...cert } : null,
    passedAlready: !!(cert || lastAttempt?.passed),
  });
}
