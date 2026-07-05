import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Routine } from "@/lib/types";

export default async function RoutinesPage() {
  const supabase = await createClient();
  const { data } = (await supabase
    .from("routines")
    .select("*")
    .order("name")) as { data: Routine[] | null };

  const routines = data ?? [];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
          Routines
        </h1>
        <Link
          href="/routines/new"
          className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          Create New
        </Link>
      </div>

      <ul className="flex flex-col gap-2">
        {routines.map((routine) => (
          <li key={routine.id}>
            <Link
              href={`/routines/${routine.id}`}
              className="flex items-center justify-between rounded-lg border border-black/10 px-4 py-3 hover:bg-black/[.02] dark:border-white/10 dark:hover:bg-white/[.04]"
            >
              <span className="text-black dark:text-zinc-50">{routine.name}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {routine.cadence}
              </span>
            </Link>
          </li>
        ))}
        {routines.length === 0 && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No routines yet — tap Create New above.
          </p>
        )}
      </ul>
    </div>
  );
}
