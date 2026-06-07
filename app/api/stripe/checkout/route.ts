import { NextResponse } from 'next/server';
import { getPlan, getStripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabaseServer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type AccessRow = {
  is_pro: boolean | null;
  email?: string | null;
  pro_expires_at?: string | null;
};

const ATTRIBUTION_KEYS = [
  'original_source',
  'utm_campaign',
  'utm_content',
] as const;

function isActivePro(row: AccessRow | null | undefined) {
  return (
    row?.is_pro === true &&
    (!row.pro_expires_at || new Date(row.pro_expires_at).getTime() > Date.now())
  );
}

function cleanAttribution(input: unknown) {
  const source = input && typeof input === 'object' ? input : {};
  const attribution: Record<string, string> = {};

  for (const key of ATTRIBUTION_KEYS) {
    const value = (source as Record<string, unknown>)[key];
    if (typeof value === 'string' && value.trim()) {
      attribution[key] = value.trim().slice(0, 500);
    }
  }

  return attribution;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const plan = getPlan(String(body?.plan || ''));
    const attribution = cleanAttribution(body?.attribution);

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

    const { data: accessByUserId, error: accessByUserIdError } = await supabaseAdmin()
  .from('user_access')
  .select('is_pro, email, pro_expires_at')
  .eq('user_id', user.id)
  .maybeSingle();

if (accessByUserIdError) {
  console.error('Checkout access check user_id error:', accessByUserIdError);
}

let alreadyPro = isActivePro(accessByUserId);

if (!alreadyPro && user.email) {
  const { data: accessByEmail, error: accessByEmailError } = await supabaseAdmin()
    .from('user_access')
    .select('is_pro, email, pro_expires_at')
    .eq('email', user.email.toLowerCase())
    .maybeSingle();

  if (accessByEmailError) {
    console.error('Checkout access check email error:', accessByEmailError);
  }

  alreadyPro = isActivePro(accessByEmail);
}

if (alreadyPro) {
  return NextResponse.json(
    {
      error:
        'You already have Pro access. Please go back to the dashboard and refresh.',
      alreadyPro: true,
    },
    { status: 409 },
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
        ...attribution,
      },
      allow_promotion_codes: true,
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
          ...attribution,
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
