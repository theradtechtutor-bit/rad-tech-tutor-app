create table if not exists public.billing_customers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  stripe_customer_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pro_access_grants (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_checkout_session_id text unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan_key text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists pro_access_grants_user_active_idx
  on public.pro_access_grants(user_id, status);

alter table public.billing_customers enable row level security;
alter table public.pro_access_grants enable row level security;

drop policy if exists "Users can view own billing customer" on public.billing_customers;
create policy "Users can view own billing customer"
on public.billing_customers
for select
using (auth.uid() = user_id);

drop policy if exists "Users can view own pro grants" on public.pro_access_grants;
create policy "Users can view own pro grants"
on public.pro_access_grants
for select
using (auth.uid() = user_id);
