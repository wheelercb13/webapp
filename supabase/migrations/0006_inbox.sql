-- Inbox is personal per-user (like Routines), not shared like
-- Domains/Tasks -- a catch-all for anything one person captures that
-- needs routing later. Manual-entry only for now (voice comes in the
-- last build phase); resolved_into stays unused until Idea Ledger and
-- Notes exist to convert into.

create table public.inbox_items (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  raw_text      text not null check (char_length(trim(raw_text)) > 0),
  captured_at   timestamptz not null default now(),
  resolved      boolean not null default false,
  resolved_into text check (resolved_into in ('task','idea','note'))
);

alter table public.inbox_items enable row level security;

create policy "inbox_items_select_own" on public.inbox_items
  for select using (user_id = auth.uid());
create policy "inbox_items_insert_own" on public.inbox_items
  for insert with check (user_id = auth.uid());
create policy "inbox_items_update_own" on public.inbox_items
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "inbox_items_delete_own" on public.inbox_items
  for delete using (user_id = auth.uid());

create index inbox_items_user_resolved_idx on public.inbox_items (user_id, resolved, captured_at);

insert into public.functions (key, label, access_level) values
  ('inbox', 'Inbox', 'general');
