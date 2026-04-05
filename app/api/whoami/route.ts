import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/requireAuth";
import { getValidatorUsername } from "@/lib/validator/session";

export async function GET() {
  const auth = await requireAuth();

  if (auth.kind === "none") {
    return NextResponse.json({ kind: "none" });
  }

  if (auth.kind === "validator") {
    const v = await getValidatorUsername();
    return NextResponse.json({
      kind: "validator",
      validatorUsername: v,
      user: auth.user,
    });
  }

  return NextResponse.json({
    kind: "user",
    userId: auth.user?.id,
    email: auth.user?.email,
  });
}
