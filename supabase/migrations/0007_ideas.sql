-- Ideas are personal per-user (like Routines/Inbox), not shared like
-- Domains/Tasks -- your idea ledger isn't a household-shared thing.
-- Sending an idea to a task creates a real (shared) task row and
-- links back via linked_task_id; the idea itself stays personal.

create table public.ideas (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title          text not null check (char_length(trim(title)) > 0),
  notes          text,
  tags           text[] not null default '{}',
  stage          text not null default 'idea' check (stage in ('idea','drafting','published')),
  priority       text not null default 'med' check (priority in ('low','med','high')),
  linked_task_id uuid references public.tasks(id) on delete set null,
  created_at     timestamptz not null default now()
);

alter table public.ideas enable row level security;

create policy "ideas_select_own" on public.ideas
  for select using (user_id = auth.uid());
create policy "ideas_insert_own" on public.ideas
  for insert with check (user_id = auth.uid());
create policy "ideas_update_own" on public.ideas
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "ideas_delete_own" on public.ideas
  for delete using (user_id = auth.uid());

insert into public.functions (key, label, access_level) values
  ('ideas', 'Idea Ledger', 'general');
