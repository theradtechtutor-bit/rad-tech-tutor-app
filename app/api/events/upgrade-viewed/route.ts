import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { ok: false, reason: 'not_signed_in' },
        { status: 401 },
      );
    }

    await supabaseAdmin()
      .from('user_events')
      .insert({
        user_id: user.id,
        event_type: 'upgrade_viewed',
        metadata: {
          source: 'upgrade_page',
        },
      });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || 'Failed to log upgrade_viewed' },
      { status: 500 },
    );
  }
}
