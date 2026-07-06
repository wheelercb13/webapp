import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Routine } from "@/lib/types";
import { reorderRoutine } from "./actions";

export default async function RoutinesPage() {
  const supabase = await createClient();
  const { data } = (await supabase
    .from("routines")
    .select("*")
    .order("sort_order")) as { data: Routine[] | null };

  const routines = data ?? [];

  return (
    <div className="mx-auto flex w-full max-w-[468px] flex-col px-[22px]">
      <div className="flex items-end justify-between gap-2.5 pb-[26px] pt-9">
        <h1 className="font-serif text-[34px] font-medium leading-[1.02] tracking-[-0.01em] text-foreground-display">
          Routines
        </h1>
        <div className="flex shrink-0 gap-2">
          <Link
            href="/routines/history"
            className="rounded-full border border-button-border px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-foreground transition-colors hover:bg-white/[.06]"
          >
            History
          </Link>
          <Link
            href="/routines/new"
            className="rounded-full bg-accent px-4 py-2.5 text-[12px] font-semibold text-background transition-opacity hover:opacity-90"
          >
            Create New
          </Link>
        </div>
      </div>

      <div className="border-t border-hairline">
        {routines.map((routine, index) => (
          <div
            key={routine.id}
            className="flex items-center gap-3.5 border-b border-hairline py-[15px]"
          >
            <Link
              href={`/routines/${routine.id}`}
              className="flex min-w-0 flex-1 items-center gap-3.5"
            >
              <span className="h-[11px] w-[11px] shrink-0 rounded-full bg-muted" />
              <span className="text-[16px] text-foreground">{routine.name}</span>
            </Link>
            <span className="whitespace-nowrap text-[10.5px] uppercase tracking-[0.08em] text-muted">
              {routine.cadence}
            </span>
            <div className="flex shrink-0 flex-col gap-px">
              <form action={reorderRoutine.bind(null, routine.id, "up")}>
                <button
                  type="submit"
                  disabled={index === 0}
                  aria-label="Move up"
                  className="flex h-[13px] w-6 items-center justify-center text-[9px] leading-none text-faint hover:text-foreground disabled:opacity-30"
                >
                  ▲
                </button>
              </form>
              <form action={reorderRoutine.bind(null, routine.id, "down")}>
                <button
                  type="submit"
                  disabled={index === routines.length - 1}
                  aria-label="Move down"
                  className="flex h-[13px] w-6 items-center justify-center text-[9px] leading-none text-faint hover:text-foreground disabled:opacity-30"
                >
                  ▼
                </button>
              </form>
            </div>
          </div>
        ))}
        {routines.length === 0 && (
          <p className="py-4 text-[14px] text-muted">No routines yet — tap Create New above.</p>
        )}
      </div>
    </div>
  );
}
