-- Weekly routine steps now always filter to their Repeat On weekday on the
-- Today view (no opt-in needed), so the per-step override is dead.

alter table public.routine_steps drop column only_show_on_weekday;
