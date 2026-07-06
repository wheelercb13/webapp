-- Notes/quotes/highlights library is personal per-user (like Routines/
-- Inbox/Ideas), not shared like Domains/Tasks. Source is "manual" for
-- everything captured through this feature; "voice" is reserved for
-- when voice capture ships and can route straight into a note.

create table public.notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  content    text not null check (char_length(trim(content)) > 0),
  tags       text[] not null default '{}',
  source     text not null default 'manual' check (source in ('manual','voice')),
  created_at timestamptz not null default now()
);

alter table public.notes enable row level security;

create policy "notes_select_own" on public.notes
  for select using (user_id = auth.uid());
create policy "notes_insert_own" on public.notes
  for insert with check (user_id = auth.uid());
create policy "notes_update_own" on public.notes
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "notes_delete_own" on public.notes
  for delete using (user_id = auth.uid());

insert into public.functions (key, label, access_level) values
  ('library', 'Library', 'general');
