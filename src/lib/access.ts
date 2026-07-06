// Maps a URL path prefix to the `functions` table row (see
// src/lib/types.ts FunctionAccess) that gates it. Add an entry here plus a
// seed row in a migration to gate a new feature the same way -- the
// gating logic in proxy.ts and the nav in layout.tsx both read from this
// single map instead of hardcoding per-feature checks.
//
// "/system" is intentionally NOT here -- it's always admin-only,
// hardcoded, so it can never be reconfigured to General via the System
// Access UI it hosts.
export const FUNCTION_ROUTES: Record<string, string> = {
  "/domains": "domains",
  "/users": "users",
  "/routines": "routines",
  "/inbox": "inbox",
  "/ideas": "ideas",
  "/library": "library",
  "/calendar": "calendar",
};
