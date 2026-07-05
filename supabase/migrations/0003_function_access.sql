-- Configurable access levels for gated app functions (currently Users,
-- Domains). "System"/"System Access" are intentionally NOT rows here --
-- they stay hardcoded admin-only in application code so no one can set
-- them to General and reopen a path to self-granting admin.

create table public.functions (
  key          text primary key,
  label        text not null,
  access_level text not null default 'admin' check (access_level in ('general','admin')),
  updated_at   timestamptz not null default now()
);

alter table public.functions enable row level security;

create policy "functions_select_authenticated" on public.functions
  for select using (auth.role() = 'authenticated');

create policy "functions_update_admin" on public.functions
  for update
  using (coalesce((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false))
  with check (coalesce((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false));

create or replace function public.set_updated_at_functions()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger functions_set_updated_at
  before update on public.functions
  for each row execute function public.set_updated_at_functions();

insert into public.functions (key, label, access_level) values
  ('users', 'Users', 'admin'),
  ('domains', 'Domains', 'general');
