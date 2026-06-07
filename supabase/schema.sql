-- Run this in Supabase Dashboard → SQL Editor

-- Entries table
create table if not exists entries (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users(id) on delete cascade not null,
  date             date not null,
  kind             text check (kind in ('income', 'expense')) not null,
  tag              text not null,
  note             text not null default '',
  person           text not null default '',
  amount           numeric not null,
  original_amount  numeric,
  original_currency text default 'NGN',
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- Row-level security
alter table entries enable row level security;

create policy "Users access own entries"
  on entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- User settings table
create table if not exists user_settings (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  dark_mode        boolean not null default true,
  display_currency text not null default 'NGN',
  rate_usd         integer not null default 1620,
  rate_eur         integer not null default 1750,
  expense_tags     text[] not null default array['Essentials', 'Work & Ministry', 'Personal'],
  income_tags      text[] not null default array['Research & Grants', 'Consulting & Service', 'Hustle & Returns'],
  updated_at       timestamptz default now()
);

alter table user_settings enable row level security;

create policy "Users access own settings"
  on user_settings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Performance indexes
create index if not exists entries_user_date on entries(user_id, date desc);
create index if not exists entries_user_month on entries(user_id, date_trunc('month', date::timestamptz));
