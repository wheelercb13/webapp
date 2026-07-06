-- Google Calendar connection is personal per-user (like Routines/Inbox/
-- Ideas/Library) -- each login connects their own Google account.
-- calendar_links maps a (shared) task to the google_event_id it was
-- synced to, per connecting user, since two different users could each
-- link the same shared task to two different personal calendars.

create table public.calendar_connections (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null unique default auth.uid() references auth.users(id) on delete cascade,
  refresh_token     text not null,
  access_token      text,
  token_expiry      timestamptz,
  google_calendar_id text not null default 'primary',
  created_at        timestamptz not null default now()
);

alter table public.calendar_connections enable row level security;

create policy "calendar_connections_select_own" on public.calendar_connections
  for select using (user_id = auth.uid());
create policy "calendar_connections_insert_own" on public.calendar_connections
  for insert with check (user_id = auth.uid());
create policy "calendar_connections_update_own" on public.calendar_connections
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "calendar_connections_delete_own" on public.calendar_connections
  for delete using (user_id = auth.uid());

create table public.calendar_links (
  id             uuid primary key default gen_random_uuid(),
  task_id        uuid not null references public.tasks(id) on delete cascade,
  user_id        uuid not null default auth.uid() references auth.users(id) on delete cascade,
  google_event_id text not null,
  synced_at      timestamptz not null default now(),
  unique (task_id, user_id)
);

alter table public.calendar_links enable row level security;

create policy "calendar_links_select_own" on public.calendar_links
  for select using (user_id = auth.uid());
create policy "calendar_links_insert_own" on public.calendar_links
  for insert with check (user_id = auth.uid());
create policy "calendar_links_update_own" on public.calendar_links
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "calendar_links_delete_own" on public.calendar_links
  for delete using (user_id = auth.uid());

insert into public.functions (key, label, access_level) values
  ('calendar', 'Calendar', 'general');
