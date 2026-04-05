import { NextResponse } from "next/server";
import { clearValidatorCookie } from "@/lib/validator/session";

export async function POST() {
  await clearValidatorCookie();
  return NextResponse.json({ ok: true });
}
