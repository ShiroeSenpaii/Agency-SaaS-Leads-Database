-- Enable extension for UUID generation
create extension if not exists pgcrypto;

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  summary text not null default '',
  category text not null default '',
  tags text[] not null default '{}',
  status text not null default 'new',
  source_url text,
  notes text not null default '',
  demand_fit integer not null default 0,
  budget_potential integer not null default 0,
  execution_confidence integer not null default 0,
  total_score integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_validated_at timestamptz,
  validation_status text not null default 'unknown',
  evidence_links text[] not null default '{}'
);

create unique index if not exists opportunities_user_source_url_unique
  on public.opportunities (user_id, source_url)
  where source_url is not null;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  niche text not null default '',
  constraints text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.client_saved_opportunities (
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (client_id, opportunity_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists opportunities_set_updated_at on public.opportunities;
create trigger opportunities_set_updated_at
before update on public.opportunities
for each row execute function public.set_updated_at();

drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

alter table public.opportunities enable row level security;
alter table public.clients enable row level security;
alter table public.client_saved_opportunities enable row level security;

drop policy if exists "opportunities_select_own" on public.opportunities;
drop policy if exists "opportunities_insert_own" on public.opportunities;
drop policy if exists "opportunities_update_own" on public.opportunities;
drop policy if exists "opportunities_delete_own" on public.opportunities;
drop policy if exists "clients_select_own" on public.clients;
drop policy if exists "clients_insert_own" on public.clients;
drop policy if exists "clients_update_own" on public.clients;
drop policy if exists "clients_delete_own" on public.clients;
drop policy if exists "client_saved_select_own" on public.client_saved_opportunities;
drop policy if exists "client_saved_insert_own" on public.client_saved_opportunities;
drop policy if exists "client_saved_update_own" on public.client_saved_opportunities;
drop policy if exists "client_saved_delete_own" on public.client_saved_opportunities;

-- Opportunities policies
create policy "opportunities_select_own" on public.opportunities
for select using (auth.uid() = user_id);

create policy "opportunities_insert_own" on public.opportunities
for insert with check (auth.uid() = user_id);

create policy "opportunities_update_own" on public.opportunities
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "opportunities_delete_own" on public.opportunities
for delete using (auth.uid() = user_id);

-- Clients policies
create policy "clients_select_own" on public.clients
for select using (auth.uid() = user_id);

create policy "clients_insert_own" on public.clients
for insert with check (auth.uid() = user_id);

create policy "clients_update_own" on public.clients
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "clients_delete_own" on public.clients
for delete using (auth.uid() = user_id);

-- Join table policies
create policy "client_saved_select_own" on public.client_saved_opportunities
for select using (auth.uid() = user_id);

create policy "client_saved_insert_own" on public.client_saved_opportunities
for insert with check (auth.uid() = user_id);

create policy "client_saved_update_own" on public.client_saved_opportunities
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "client_saved_delete_own" on public.client_saved_opportunities
for delete using (auth.uid() = user_id);
