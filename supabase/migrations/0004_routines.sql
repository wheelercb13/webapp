-- Routines are personal per-user data (unlike the shared Domains/Tasks
-- workspace) -- habits like "take meds" don't make sense shared across
-- logins. RLS is scoped directly to user_id on every table (denormalized,
-- matching how tasks.user_id already sits alongside domain_id) rather than
-- joining through parent tables.

create table public.routines (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name       text not null check (char_length(trim(name)) > 0),
  cadence    text not null default 'daily' check (cadence in ('daily','weekly')),
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

alter table public.routines enable row level security;

create policy "routines_select_own" on public.routines
  for select using (user_id = auth.uid());
create policy "routines_insert_own" on public.routines
  for insert with check (user_id = auth.uid());
create policy "routines_update_own" on public.routines
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "routines_delete_own" on public.routines
  for delete using (user_id = auth.uid());

create table public.routine_steps (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  routine_id uuid not null references public.routines(id) on delete cascade,
  label      text not null check (char_length(trim(label)) > 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.routine_steps enable row level security;

create policy "routine_steps_select_own" on public.routine_steps
  for select using (user_id = auth.uid());
create policy "routine_steps_insert_own" on public.routine_steps
  for insert with check (user_id = auth.uid());
create policy "routine_steps_update_own" on public.routine_steps
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "routine_steps_delete_own" on public.routine_steps
  for delete using (user_id = auth.uid());

create table public.routine_completions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users(id) on delete cascade,
  routine_step_id uuid not null references public.routine_steps(id) on delete cascade,
  cycle_date      date not null,
  completed_at    timestamptz not null default now(),
  unique (routine_step_id, cycle_date)
);

alter table public.routine_completions enable row level security;

create policy "routine_completions_select_own" on public.routine_completions
  for select using (user_id = auth.uid());
create policy "routine_completions_insert_own" on public.routine_completions
  for insert with check (user_id = auth.uid());
create policy "routine_completions_delete_own" on public.routine_completions
  for delete using (user_id = auth.uid());

create index routine_steps_routine_id_idx on public.routine_steps (routine_id);
create index routine_completions_step_id_idx on public.routine_completions (routine_step_id);

insert into public.functions (key, label, access_level) values
  ('routines', 'Routines', 'general');
