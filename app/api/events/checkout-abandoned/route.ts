import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const plan = String(body?.plan || 'unknown');

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { ok: false, reason: 'not_signed_in' },
        { status: 401 }
      );
    }

await supabaseAdmin().from('user_events' as any).insert({      user_id: user.id,
      event_type: 'checkout_abandoned',
      metadata: {
        source: 'stripe_cancel_page',
        plan,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || 'Failed to log checkout_abandoned' },
      { status: 500 }
    );
  }
}