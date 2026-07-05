import { createClient } from "@supabase/supabase-js";

// Server-only: uses the secret service role key. Never import this file
// from a "use client" component -- only from "use server" action files.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
