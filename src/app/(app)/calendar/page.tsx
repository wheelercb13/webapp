import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { buildAuthUrl } from "@/lib/google-calendar";
import type { CalendarConnection } from "@/lib/types";
import { disconnectCalendar } from "./actions";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: connection } = (await supabase
    .from("calendar_connections")
    .select("*")
    .eq("user_id", user?.id ?? "")
    .maybeSingle()) as { data: CalendarConnection | null };

  const hdrs = await headers();
  const host = hdrs.get("host");
  const proto = hdrs.get("x-forwarded-proto") ?? "http";
  const redirectUri = `${proto}://${host}/api/calendar/callback`;
  const authUrl = buildAuthUrl(redirectUri);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-50">Calendar</h1>

      {error && (
        <p className="rounded-lg border border-red-600/30 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          Google Calendar connection failed: {error}
        </p>
      )}

      <div className="flex flex-col gap-3 rounded-lg border border-black/10 p-4 dark:border-white/10">
        {connection ? (
          <>
            <p className="text-sm text-black dark:text-zinc-50">
              Connected to Google Calendar (&quot;{connection.google_calendar_id}&quot;).
            </p>
            <form action={disconnectCalendar}>
              <button
                type="submit"
                className="rounded-full border border-red-600/30 px-4 py-1.5 text-sm font-medium text-red-600 hover:bg-red-600/10 dark:text-red-400"
              >
                Disconnect
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Connect your Google Calendar to sync tasks as time-blocks.
            </p>
            <a
              href={authUrl}
              className="self-start rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
            >
              Connect Google Calendar
            </a>
          </>
        )}
      </div>
    </div>
  );
}
