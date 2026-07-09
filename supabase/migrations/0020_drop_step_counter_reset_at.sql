-- Reset now targets the streak (longest_streak_days/streak_start_cycle_date/
-- streak_end_cycle_date) instead of completion_count, and "Last Reset" is
-- derived from streak_start_cycle_date directly -- this column is unused.
alter table public.routine_step_history drop column counter_reset_at;
