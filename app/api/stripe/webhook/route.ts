import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

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

      const plan = session.metadata?.plan_key ?? null;
      const now = new Date().toISOString();

      if (userId) {
        console.log('Granting PRO by user_id:', userId);

        await supabase.from('user_access').upsert({
          user_id: userId,
          email: userEmail.toLowerCase(),
          is_pro: true,
          updated_at: now,
        });

        await supabase.from('user_events').insert({
          user_id: userId,
          event_type: 'purchase_completed',
          metadata: {
            plan,
            user_email: userEmail,
            stripe_session_id: session.id,
            source: 'stripe_webhook_user_id',
          },
        });

        return NextResponse.json({ received: true });
      }

      if (userEmail) {
        console.warn('Missing user_id. Granting PRO by email:', userEmail);

        const { data, error } = await supabase
          .from('user_access')
          .update({
            is_pro: true,
            updated_at: now,
          })
          .eq('email', userEmail.toLowerCase())
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
              user_email: userEmail,
              stripe_session_id: session.id,
              source: 'stripe_webhook_email_fallback',
            },
          });
        } else {
          console.error(
            'No matching user_access row for paid email:',
            userEmail,
          );
        }

        return NextResponse.json({ received: true });
      }

      console.error(
        'No user_id or email found for completed checkout:',
        session.id,
      );
    }

  return NextResponse.json({ received: true });
}
