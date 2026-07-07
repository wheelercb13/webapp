-- Lets Tasks (within a Domain) and Routine Steps (within a Routine) be
-- manually reordered, same up/down pattern as Domains/Routines already
-- have. Default/backfill order follows the existing "what needs
-- attention" rule: due date, then priority, then creation order --
-- matching how Today already sorts tasks, rather than an arbitrary
-- append-only order (tasks don't have a natural alphabetical identity
-- like a domain/routine name does).

alter table public.tasks add column sort_order integer;
alter table public.routine_steps alter column sort_order drop default;

with ordered as (
  select id,
    row_number() over (
      partition by domain_id
      order by
        due_date nulls last,
        case priority when 'high' then 0 when 'med' then 1 when 'low' then 2 end,
        created_at
    ) as rn
  from public.tasks
)
update public.tasks t set sort_order = ordered.rn
from ordered where t.id = ordered.id;

alter table public.tasks alter column sort_order set not null;

-- routine_steps.sort_order already exists (added in 0004_routines.sql)
-- but every row defaults to 0 -- nothing ever assigned real values, so
-- effective order today is just created_at. Backfill using that same
-- created_at order, scoped per routine, to preserve current visible order.
with ordered as (
  select id,
    row_number() over (partition by routine_id order by sort_order, created_at) as rn
  from public.routine_steps
)
update public.routine_steps rs set sort_order = ordered.rn
from ordered where rs.id = ordered.id;
