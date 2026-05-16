create table if not exists app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz default now()
);

insert into app_settings (key, value)
values ('access_blocking_enabled', 'true')
on conflict (key) do nothing;

create table if not exists blocked_access (
  id uuid primary key default gen_random_uuid(),

  type text not null check (
    type in ('email', 'user_id', 'device_id', 'distinct_id', 'ip')
  ),

  value text not null,
  reason text,
  is_active boolean not null default true,

  -- free_only protects paid users from accidental device/IP blocks.
  -- Use applies_to = 'all' only when you intentionally want to block a specific email/user_id even if they are Pro.
  applies_to text not null default 'free_only' check (applies_to in ('free_only', 'all')),

  created_at timestamptz default now()
);

alter table blocked_access
add column if not exists applies_to text not null default 'free_only'
check (applies_to in ('free_only', 'all'));

create unique index if not exists blocked_access_type_value_unique
on blocked_access (type, value);

-- Turn feature off:
-- update app_settings set value = 'false', updated_at = now() where key = 'access_blocking_enabled';

-- Turn feature back on:
-- update app_settings set value = 'true', updated_at = now() where key = 'access_blocking_enabled';
