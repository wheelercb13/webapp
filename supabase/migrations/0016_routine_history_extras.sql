-- Tracks when a routine's live counterpart was actually deleted (set
-- explicitly by the deleteRoutine action right before the row goes away,
-- since the FK's ON DELETE SET NULL alone gives no timestamp) --
-- needed to list deleted routines oldest-deleted-first on the History
-- page. Also adds a manually-resettable per-step completion tally,
-- independent of the permanent longest-streak record and the real
-- completion history -- resetting it never touches streak math.

alter table public.routine_history add column deleted_at timestamptz;
alter table public.routine_step_history add column completion_count integer not null default 0;
