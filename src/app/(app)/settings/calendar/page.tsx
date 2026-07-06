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
    <div className="mx-auto flex w-full max-w-[468px] flex-col px-[22px]">
      <div className="pb-[26px] pt-9">
        <h1 className="font-serif text-[34px] font-medium leading-[1.02] tracking-[-0.01em] text-foreground-display">
          Calendar
        </h1>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-delete-border px-4 py-3 text-[13px] text-delete-text">
          Google Calendar connection failed: {error}
        </p>
      )}

      <div className="flex flex-col gap-3 rounded-xl border border-card-border p-4">
        {connection ? (
          <>
            <p className="text-[14px] text-foreground">
              Connected to Google Calendar. Today&apos;s events from all your calendars
              will show on the Today view.
            </p>
            <form action={disconnectCalendar}>
              <button
                type="submit"
                className="rounded-full border border-delete-border px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-delete-text transition-colors hover:bg-white/[.06]"
              >
                Disconnect
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="text-[14px] text-muted">
              Connect your Google Calendar to show today&apos;s events on the Today view.
            </p>
            <a
              href={authUrl}
              className="self-start rounded-full bg-accent px-5 py-2.5 text-[12px] font-semibold text-background transition-opacity hover:opacity-90"
            >
              Connect Google Calendar
            </a>
          </>
        )}
      </div>
    </div>
  );
}
