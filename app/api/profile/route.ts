import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // Always return auth identity even if profile row doesn't exist yet
  return NextResponse.json({
    user: { id: user.id, email: user.email },
    profile: profile || null
  });
}

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();

  const first = body.first_name || "";
  const last = body.last_name || "";
  const display = body.display_name || (first + " " + last).trim();

  const { error } = await supabase.from("profiles").upsert({
    user_id: user.id,
    first_name: first,
    last_name: last,
    display_name: display
  });

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
