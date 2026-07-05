-- Repeating tasks: same row keeps advancing its own due_date on
-- completion (no history table -- see src/lib/recurrence.ts for the
-- next-occurrence math). repeat_unit IS NULL means "does not repeat",
-- the existing behavior for every task today.

alter table public.tasks add column repeat_unit text check (repeat_unit in ('day','week','month','year'));
alter table public.tasks add column repeat_interval integer not null default 1 check (repeat_interval > 0);
alter table public.tasks add column repeat_weekdays integer[]; -- 0=Sun..6=Sat; only meaningful when repeat_unit = 'week'
alter table public.tasks add column repeat_until date; -- null = never ends
