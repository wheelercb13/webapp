-- Phase 2: domains + tasks, single-user, RLS-scoped to auth.uid()
-- pgcrypto (for gen_random_uuid()) is enabled by default on Supabase projects.

-- DOMAINS ---------------------------------------------------------------
create table public.domains (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name       text not null check (char_length(trim(name)) > 0),
  color      text not null check (color in (
               'red','orange','amber','yellow','green',
               'teal','blue','purple','pink','gray'
             )),
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

alter table public.domains enable row level security;

create policy "domains_select_own" on public.domains
  for select using (user_id = auth.uid());
create policy "domains_insert_own" on public.domains
  for insert with check (user_id = auth.uid());
create policy "domains_update_own" on public.domains
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "domains_delete_own" on public.domains
  for delete using (user_id = auth.uid());

-- TASKS -------------------------------------------------------------------
create table public.tasks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  domain_id  uuid not null references public.domains(id) on delete cascade,
  title      text not null check (char_length(trim(title)) > 0),
  notes      text,
  due_date   date,
  priority   text not null default 'med' check (priority in ('low','med','high')),
  status     text not null default 'open' check (status in ('open','done')),
  source     text not null default 'typed' check (source in ('voice','typed','calendar')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tasks enable row level security;

create policy "tasks_select_own" on public.tasks
  for select using (user_id = auth.uid());
create policy "tasks_insert_own" on public.tasks
  for insert with check (user_id = auth.uid());
create policy "tasks_update_own" on public.tasks
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "tasks_delete_own" on public.tasks
  for delete using (user_id = auth.uid());

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

create index tasks_user_status_due_idx on public.tasks (user_id, status, due_date);
create index tasks_domain_id_idx on public.tasks (domain_id);
