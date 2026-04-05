# Auth + Stripe setup

## Supabase auth
Enable these providers in Supabase Auth:
- Google
- Email / Password
- Email OTP (optional, already supported)

Set your Google OAuth redirect URL to:
- `https://YOUR_DOMAIN/auth/callback`
- `http://localhost:3000/auth/callback`
- `http://localhost:3001/auth/callback`

## Stripe env vars
Add these to `.env.local` and your hosting provider env settings:

- `STRIPE_SECRET_KEY=`
- `STRIPE_WEBHOOK_SECRET=`
- `STRIPE_PRICE_PRO_1M=`
- `STRIPE_PRICE_PRO_3M=`
- `STRIPE_PRICE_PRO_6M=`

## Supabase migration
Run the new migration in `supabase/migrations/20260306_create_billing_tables.sql`.

## Stripe webhook
Point your Stripe webhook to:
- `/api/stripe/webhook`

Recommended events:
- `checkout.session.completed`
- `customer.subscription.deleted`
