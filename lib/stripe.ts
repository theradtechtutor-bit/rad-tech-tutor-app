import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Missing STRIPE_SECRET_KEY');
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      apiVersion: '2025-08-27.basil',
    });
  }

  return stripeClient;
}

export type ProPlanKey = 'pro_2w' | 'pro_1m' | 'pro_3m' | 'pro_6m';

export const PRO_PLANS: Record<
  ProPlanKey,
  {
    key: ProPlanKey;
    label: string;
    mode: 'payment' | 'subscription';
    amount: number;
    interval?: 'month';
    intervalCount?: number;
    priceIdEnv: string;
    accessDays: number;
  }
> = {
  pro_2w: {
    key: 'pro_2w',
    label: '2 Weeks',
    mode: 'payment',
    amount: 2900,
    priceIdEnv: 'STRIPE_PRICE_PRO_2W',
    accessDays: 14,
  },
  pro_1m: {
    key: 'pro_1m',
    label: '1 Month',
    mode: 'payment',
    amount: 2900,
    priceIdEnv: 'STRIPE_PRICE_PRO_1M', 
    accessDays: 30,
  },
  pro_3m: {
    key: 'pro_3m',
    label: '3 Months',
    mode: 'payment',
    amount: 7900,
    priceIdEnv: 'STRIPE_PRICE_PRO_3M',
    accessDays: 90,
  },
  pro_6m: {
    key: 'pro_6m',
    label: '6 Months',
    mode: 'payment',
    amount: 11900,
    priceIdEnv: 'STRIPE_PRICE_PRO_6M',
    accessDays: 180,
  },
};

export function getPlan(planKey: string) {
  if (!Object.prototype.hasOwnProperty.call(PRO_PLANS, planKey)) {
    return null;
  }
  return PRO_PLANS[planKey as ProPlanKey];
}

export function getProExpiresAt(planKey: string | null | undefined) {
  const plan = getPlan(String(planKey || ''));

  const accessDays = plan?.accessDays ?? 30;

  return new Date(
    Date.now() + accessDays * 24 * 60 * 60 * 1000,
  ).toISOString();
}