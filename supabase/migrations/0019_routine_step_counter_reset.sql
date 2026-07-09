alter table public.routine_step_history add column counter_reset_at timestamptz not null default now();
