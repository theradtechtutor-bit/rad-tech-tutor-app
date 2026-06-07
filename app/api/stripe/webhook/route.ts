import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { getProExpiresAt } from '@/lib/stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const ATTRIBUTION_KEYS = [
  'original_source',
  'utm_campaign',
  'utm_content',
] as const;

function getSessionAttribution(session: Stripe.Checkout.Session) {
  const attribution: Record<string, string> = {};

  for (const key of ATTRIBUTION_KEYS) {
    const value = session.metadata?.[key];
    if (value) {
      attribution[key] = value;
    }
  }

  return attribution;
}

async function capturePosthogPurchase({
  userId,
  email,
  plan,
  sessionId,
  attribution,
}: {
  userId: string;
  email: string;
  plan: string | null;
  sessionId: string;
  attribution: Record<string, string>;
}) {
  const key = process.env.POSTHOG_API_KEY;
  const host = process.env.POSTHOG_HOST ?? 'https://us.i.posthog.com';

  if (!key) return;

  try {
    await fetch(`${host.replace(/\/$/, '')}/capture/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: key,
        event: 'purchase_completed',
        distinct_id: userId,
        properties: {
          source: 'stripe_webhook',
          user_email: email,
          plan,
          stripe_session_id: sessionId,
          ...attribution,
          $set: {
            email,
            ...attribution,
          },
        },
      }),
    });
  } catch (error) {
    console.error('PostHog purchase capture failed:', error);
  }
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err: any) {
    console.error('Webhook signature error:', err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.user_id ?? null;
    const userEmail =
      session.metadata?.user_email ??
      session.customer_details?.email ??
      session.customer_email ??
      '';

    const email = userEmail.toLowerCase();
    const plan = session.metadata?.plan_key ?? null;
    const attribution = getSessionAttribution(session);
    const now = new Date().toISOString();
    const proExpiresAt = getProExpiresAt(plan);

    if (userId) {
      console.log('Granting PRO by user_id:', userId);

      await supabase.from('user_access').upsert({
        user_id: userId,
        email,
        is_pro: true,
        pro_expires_at: proExpiresAt,
        updated_at: now,
      });

      await supabase.from('user_events').insert({
        user_id: userId,
        event_type: 'purchase_completed',
        metadata: {
          plan,
          user_email: email,
          stripe_session_id: session.id,
          source: 'stripe_webhook_user_id',
          ...attribution,
        },
      });

      await capturePosthogPurchase({
        userId,
        email,
        plan,
        sessionId: session.id,
        attribution,
      });

      return NextResponse.json({ received: true });
    }

    if (email) {
      console.warn('Missing user_id. Granting PRO by email:', email);

      const { data, error } = await supabase
        .from('user_access')
        .update({
          is_pro: true,
          pro_expires_at: proExpiresAt,
          updated_at: now,
        })
        .eq('email', email)
        .select('user_id')
        .maybeSingle();

      if (error) {
        console.error('Email fallback update failed:', error);
      }

      if (data?.user_id) {
        await supabase.from('user_events').insert({
          user_id: data.user_id,
          event_type: 'purchase_completed',
          metadata: {
            plan,
            user_email: email,
            stripe_session_id: session.id,
            source: 'stripe_webhook_email_fallback',
            ...attribution,
          },
        });

        await capturePosthogPurchase({
          userId: data.user_id,
          email,
          plan,
          sessionId: session.id,
          attribution,
        });
      } else {
        console.error('No matching user_access row for paid email:', email);
      }

      return NextResponse.json({ received: true });
    }

    console.error('No user_id or email found for completed checkout:', session.id);
  }

  return NextResponse.json({ received: true });
}
