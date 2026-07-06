-- Lets Domains and Routines be manually reordered instead of always
-- sorting alphabetically. Backfill existing rows in their current
-- (alphabetical) order so nothing visibly jumps around on first load;
-- routines are scoped per-user (like the rest of that table), so the
-- backfill numbering restarts per user rather than globally.

alter table public.domains add column sort_order integer;
alter table public.routines add column sort_order integer;

with ordered as (
  select id, row_number() over (order by name) as rn
  from public.domains
)
update public.domains d set sort_order = ordered.rn
from ordered where d.id = ordered.id;

with ordered as (
  select id, row_number() over (partition by user_id order by name) as rn
  from public.routines
)
update public.routines r set sort_order = ordered.rn
from ordered where r.id = ordered.id;

alter table public.domains alter column sort_order set not null;
alter table public.routines alter column sort_order set not null;
