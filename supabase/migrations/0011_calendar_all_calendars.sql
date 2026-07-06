-- Read-only display now pulls events from every calendar the connected
-- Google account can see (merged and sorted), not just "primary" --
-- necessary because calendars subscribed from elsewhere (e.g. an Apple
-- Calendar feed) show up as separate entries in Google Calendar, not
-- merged into primary. google_calendar_id is no longer read anywhere.

alter table public.calendar_connections drop column if exists google_calendar_id;
