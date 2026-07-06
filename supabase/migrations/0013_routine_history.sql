-- Permanent record of every routine/step ever created and the longest
-- streak it ever held, independent of the live routines/routine_steps
-- rows -- deleting a routine on the Routines page must NOT delete its
-- history. source_routine_id/source_step_id are soft links (ON DELETE
-- SET NULL) so a history row survives its live counterpart being
-- deleted; app code keeps name/cadence/label snapshots in sync with the
-- live row while it still exists, then they simply freeze once it's gone.

create table public.routine_history (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null default auth.uid() references auth.users(id) on delete cascade,
  source_routine_id uuid references public.routines(id) on delete set null,
  name              text not null,
  cadence           text not null check (cadence in ('daily','weekly')),
  created_at        timestamptz not null default now()
);

alter table public.routine_history enable row level security;

create policy "routine_history_select_own" on public.routine_history
  for select using (user_id = auth.uid());
create policy "routine_history_insert_own" on public.routine_history
  for insert with check (user_id = auth.uid());
create policy "routine_history_update_own" on public.routine_history
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "routine_history_delete_own" on public.routine_history
  for delete using (user_id = auth.uid());

create table public.routine_step_history (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null default auth.uid() references auth.users(id) on delete cascade,
  routine_history_id    uuid not null references public.routine_history(id) on delete cascade,
  source_step_id        uuid references public.routine_steps(id) on delete set null,
  step_label            text not null,
  longest_streak_days   integer not null default 0,
  streak_start_cycle_date date,
  streak_end_cycle_date   date,
  updated_at            timestamptz not null default now()
);

alter table public.routine_step_history enable row level security;

create policy "routine_step_history_select_own" on public.routine_step_history
  for select using (user_id = auth.uid());
create policy "routine_step_history_insert_own" on public.routine_step_history
  for insert with check (user_id = auth.uid());
create policy "routine_step_history_update_own" on public.routine_step_history
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "routine_step_history_delete_own" on public.routine_step_history
  for delete using (user_id = auth.uid());

-- Backfill one history row per existing routine/step, preserving each
-- routine's real creation date. Longest streak starts at 0 here -- a
-- one-off script recomputes the real historical bests from existing
-- routine_completions data right after this migration runs.
insert into public.routine_history (user_id, source_routine_id, name, cadence, created_at)
select user_id, id, name, cadence, created_at from public.routines;

insert into public.routine_step_history (user_id, routine_history_id, source_step_id, step_label)
select rs.user_id, rh.id, rs.id, rs.label
from public.routine_steps rs
join public.routine_history rh on rh.source_routine_id = rs.routine_id;
