import { NextResponse } from "next/server";
import { getValidatorUsername } from "@/lib/validator/session";

export async function GET() {
  const username = await getValidatorUsername();
  return NextResponse.json({ authenticated: !!username, username: username || null });
}
