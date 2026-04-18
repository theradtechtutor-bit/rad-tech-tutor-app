import { NextResponse } from 'next/server';
import { getPlan, getStripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabaseServer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const plan = getPlan(String(body?.plan || ''));

    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan selected.' },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Please sign in before checkout.' },
        { status: 401 },
      );
    }

    const origin = new URL(req.url).origin;
    const stripe = getStripe();
    const priceId = process.env[plan.priceIdEnv];

    if (!priceId) {
      return NextResponse.json(
        {
          error: `Missing ${plan.priceIdEnv} in environment variables.`,
        },
        { status: 500 },
      );
    }

    console.log('CHECKOUT API HIT');

    const session = await stripe.checkout.sessions.create({
      mode: plan.mode,
      customer_email: user.email || undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/app/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/app/upgrade/cancel?plan=${plan.key}`,
      metadata: {
        user_id: user.id,
        user_email: user.email ?? '',
        plan_key: plan.key,
      },
      // allow_promotion_codes: true,
      discounts: [{ promotion_code: 'promo_1TNWpnQWzkAYyzOJpkHXx3GC' }],
    });

    console.log('ABOUT TO INSERT EVENT');

    await supabaseAdmin()
      .from('user_events')
      .insert({
        user_id: user.id,
        event_type: 'checkout_started',
        metadata: {
          plan: plan.key,
          user_email: user.email ?? '',
          stripe_session_id: session.id,
          source: 'upgrade_page',
        },
      });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('STRIPE CHECKOUT ERROR:', error);
    console.error('STRIPE MESSAGE:', error?.message);
    console.error('STRIPE CODE:', error?.code);
    console.error('STRIPE PARAM:', error?.param);

    return NextResponse.json(
      { error: error?.message || 'Unable to start checkout.' },
      { status: 500 },
    );
  }
}
