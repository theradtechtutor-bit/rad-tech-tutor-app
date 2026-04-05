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

export type ProPlanKey = 'pro_1m' | 'pro_3m' | 'pro_6m';

export const PRO_PLANS: Record<ProPlanKey, {
  key: ProPlanKey;
  label: string;
  mode: 'payment' | 'subscription';
  amount: number;
  interval?: 'month';
  intervalCount?: number;
  priceIdEnv: string;
}> = {
  pro_1m: {
    key: 'pro_1m',
    label: '1 Month',
    mode: 'payment',
    amount: 2900,
    priceIdEnv: 'STRIPE_PRICE_PRO_1M',
  },
  pro_3m: {
    key: 'pro_3m',
    label: '3 Months',
    mode: 'payment',
    amount: 7900,
    priceIdEnv: 'STRIPE_PRICE_PRO_3M',
  },
  pro_6m: {
    key: 'pro_6m',
    label: '6 Months',
    mode: 'payment',
    amount: 11900,
    priceIdEnv: 'STRIPE_PRICE_PRO_6M',
  },
};

export function getPlan(planKey: string) {
  if (!Object.prototype.hasOwnProperty.call(PRO_PLANS, planKey)) {
    return null;
  }
  return PRO_PLANS[planKey as ProPlanKey];
}
