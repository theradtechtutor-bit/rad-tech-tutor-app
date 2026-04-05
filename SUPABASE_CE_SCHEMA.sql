-- CE attempts + certificates (run in Supabase SQL editor)

-- 1) Attempts
create table if not exists public.ce_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null,
  created_at timestamptz not null default now(),
  score_pct numeric not null,
  passed boolean not null,
  answers jsonb not null
);

create index if not exists ce_attempts_user_course_idx
  on public.ce_attempts (user_id, course_id, created_at desc);

-- 2) Certificates
create table if not exists public.ce_certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null,
  cert_number text not null unique,
  issued_at timestamptz not null default now(),
  score_pct numeric not null
);

create unique index if not exists ce_certificates_user_course_uniq
  on public.ce_certificates (user_id, course_id);

-- Enable RLS
alter table public.ce_attempts enable row level security;
alter table public.ce_certificates enable row level security;

-- Policies: user can read/insert their own
drop policy if exists "ce_attempts_select_own" on public.ce_attempts;
create policy "ce_attempts_select_own"
  on public.ce_attempts for select
  using (auth.uid() = user_id);

drop policy if exists "ce_attempts_insert_own" on public.ce_attempts;
create policy "ce_attempts_insert_own"
  on public.ce_attempts for insert
  with check (auth.uid() = user_id);

drop policy if exists "ce_certificates_select_own" on public.ce_certificates;
create policy "ce_certificates_select_own"
  on public.ce_certificates for select
  using (auth.uid() = user_id);

drop policy if exists "ce_certificates_insert_own" on public.ce_certificates;
create policy "ce_certificates_insert_own"
  on public.ce_certificates for insert
  with check (auth.uid() = user_id);
