import { NextResponse } from 'next/server';

/**
 * DEV ONLY endpoint.
 * Marks a CE course as "purchased" in localStorage-style dev flow (or wherever your app checks).
 * If you later wire Stripe + Supabase, you can delete this route.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;

  // If your frontend calls this just to "pretend purchase", return ok.
  // If you need to return a shape, adjust here.
  return NextResponse.json({ ok: true, courseId });
}
