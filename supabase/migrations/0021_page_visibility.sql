-- Per-user "Page View" setting: unlike functions/System Access (shared,
-- admin-only role gate), this is a personal preference each user sets for
-- themselves under /settings/page-view -- carved out of the otherwise
-- admin-only /settings gate in proxy.ts. Absence of a row means visible
-- (default-on), so existing users see no change until they opt to hide
-- something.

create table public.page_visibility (
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  page_key   text not null,
  visible    boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (user_id, page_key)
);

alter table public.page_visibility enable row level security;

create policy "page_visibility_select_own" on public.page_visibility
  for select using (user_id = auth.uid());
create policy "page_visibility_insert_own" on public.page_visibility
  for insert with check (user_id = auth.uid());
create policy "page_visibility_update_own" on public.page_visibility
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function public.set_updated_at_page_visibility()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger page_visibility_set_updated_at
  before update on public.page_visibility
  for each row execute function public.set_updated_at_page_visibility();
