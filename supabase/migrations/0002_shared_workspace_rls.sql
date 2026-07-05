-- Move from per-owner RLS to a shared workspace: any authenticated user
-- (regardless of identity) can read/write all domains/tasks. user_id stays
-- as a "created by" audit column but no longer gates access.

drop policy "domains_select_own" on public.domains;
drop policy "domains_insert_own" on public.domains;
drop policy "domains_update_own" on public.domains;
drop policy "domains_delete_own" on public.domains;

create policy "domains_select_authenticated" on public.domains
  for select using (auth.role() = 'authenticated');
create policy "domains_insert_authenticated" on public.domains
  for insert with check (auth.role() = 'authenticated');
create policy "domains_update_authenticated" on public.domains
  for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "domains_delete_authenticated" on public.domains
  for delete using (auth.role() = 'authenticated');

drop policy "tasks_select_own" on public.tasks;
drop policy "tasks_insert_own" on public.tasks;
drop policy "tasks_update_own" on public.tasks;
drop policy "tasks_delete_own" on public.tasks;

create policy "tasks_select_authenticated" on public.tasks
  for select using (auth.role() = 'authenticated');
create policy "tasks_insert_authenticated" on public.tasks
  for insert with check (auth.role() = 'authenticated');
create policy "tasks_update_authenticated" on public.tasks
  for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "tasks_delete_authenticated" on public.tasks
  for delete using (auth.role() = 'authenticated');

-- Domain names are now shared workspace-wide, not per-creator.
alter table public.domains drop constraint if exists domains_user_id_name_key;
alter table public.domains add constraint domains_name_key unique (name);
