-- Scope was simplified: Calendar sync is read-only display of today's
-- Google Calendar events on the Today view, not two-way task<->event
-- syncing. calendar_links (task_id <-> google_event_id) is unused --
-- drop it. The connect/disconnect page also moved from a general-access
-- nav item ("/calendar") to an admin-only System sub-page
-- ("/system/calendar"), so its functions row no longer serves a purpose
-- (System itself is already hardcoded admin-only in proxy.ts).

drop table if exists public.calendar_links;

delete from public.functions where key = 'calendar';
