alter table public.routine_steps add column weekday integer check (weekday between 0 and 6);
alter table public.routine_steps add column only_show_on_weekday boolean not null default false;

-- Existing weekly-routine steps behaved as Monday-anchored; backfill
-- weekday=1 (Monday) so their cycle/streak behavior is unchanged after
-- this migration.
update public.routine_steps rs
set weekday = 1
from public.routines r
where rs.routine_id = r.id and r.cadence = 'weekly' and rs.weekday is null;
