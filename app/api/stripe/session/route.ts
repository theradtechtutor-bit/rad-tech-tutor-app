import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabaseServer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session_id.' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const userId = session.metadata?.user_id;
    const paid = session.payment_status === 'paid' || session.status === 'complete';

    if (userId !== user.id) {
      return NextResponse.json({ error: 'Session does not belong to current user.' }, { status: 403 });
    }

    if (paid) {
      const admin = supabaseAdmin();
      await admin.from('billing_customers').upsert({
        user_id: user.id,
        email: user.email || null,
        stripe_customer_id: typeof session.customer === 'string' ? session.customer : null,
      }, { onConflict: 'user_id' });

      await admin.from('pro_access_grants').upsert({
        user_id: user.id,
        stripe_checkout_session_id: session.id,
        stripe_customer_id: typeof session.customer === 'string' ? session.customer : null,
        stripe_subscription_id: typeof session.subscription === 'string' ? session.subscription : null,
        plan_key: session.metadata?.plan_key || null,
        status: 'active',
      }, { onConflict: 'stripe_checkout_session_id' });
    }

    return NextResponse.json({
      ok: true,
      paid,
      customerEmail: session.customer_details?.email || user.email || null,
      planKey: session.metadata?.plan_key || null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Unable to verify session.' }, { status: 500 });
  }
}
