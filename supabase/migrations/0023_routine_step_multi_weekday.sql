-- Weekly routine steps can now repeat on multiple days instead of just one.
-- Each selected weekday keeps its own independent 7-day streak chain (the
-- existing cycle-date math is unchanged, just invoked once per weekday);
-- this migration only changes storage from a single day to a set of days.

alter table public.routine_steps add column weekdays integer[];

update public.routine_steps
set weekdays = array[weekday]
where weekday is not null;

alter table public.routine_steps drop column weekday;
