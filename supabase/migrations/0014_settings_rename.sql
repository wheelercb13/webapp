-- "System" was renamed to "Settings" and the Users page moved under it
-- (mirroring Calendar's earlier move) -- both are now reached only via
-- /settings, which is hardcoded admin-only in proxy.ts, so the "users"
-- functions row/toggle no longer serves a purpose.

delete from public.functions where key = 'users';
