alter table public.inbox_items add column resolved_at timestamptz;

-- Existing resolved items have no resolved_at (column didn't exist before);
-- backfill to now() so they get a fresh retention window instead of being
-- immediately eligible for the new 14-day auto-deletion.
update public.inbox_items set resolved_at = now() where resolved = true and resolved_at is null;
