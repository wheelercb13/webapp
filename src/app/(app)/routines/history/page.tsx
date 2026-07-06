import { createClient } from "@/lib/supabase/server";
import type { RoutineHistory, RoutineStepHistory } from "@/lib/types";
import { deleteRoutineHistory } from "./actions";

export default async function RoutineHistoryPage() {
  const supabase = await createClient();

  const { data: historyData } = (await supabase
    .from("routine_history")
    .select("*")
    .order("created_at", { ascending: false })) as { data: RoutineHistory[] | null };
  const routineHistories = historyData ?? [];

  const { data: stepHistoryData } =
    routineHistories.length > 0
      ? ((await supabase
          .from("routine_step_history")
          .select("*")
          .in(
            "routine_history_id",
            routineHistories.map((r) => r.id)
          )) as { data: RoutineStepHistory[] | null })
      : { data: [] as RoutineStepHistory[] };

  const stepsByRoutine = new Map<string, RoutineStepHistory[]>();
  for (const step of stepHistoryData ?? []) {
    const list = stepsByRoutine.get(step.routine_history_id) ?? [];
    list.push(step);
    stepsByRoutine.set(step.routine_history_id, list);
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
        Routine History
      </h1>

      <ul className="flex flex-col gap-3">
        {routineHistories.map((routine) => (
          <li
            key={routine.id}
            className="flex flex-col gap-2 rounded-lg border border-black/10 p-4 dark:border-white/10"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-black dark:text-zinc-50">{routine.name}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {routine.cadence} · created {routine.created_at.slice(0, 10)}
                  {!routine.source_routine_id && " · deleted"}
                </p>
              </div>
              <form action={deleteRoutineHistory.bind(null, routine.id)}>
                <button
                  type="submit"
                  className="rounded-full border border-red-600/30 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-600/10 dark:text-red-400"
                >
                  Delete
                </button>
              </form>
            </div>
            <ul className="flex flex-col gap-1 border-t border-black/10 pt-2 dark:border-white/10">
              {(stepsByRoutine.get(routine.id) ?? []).map((step) => (
                <li key={step.id} className="text-sm text-zinc-600 dark:text-zinc-400">
                  {step.step_label}:{" "}
                  {step.longest_streak_days > 0 ? (
                    <>
                      {step.longest_streak_days}-day streak ({step.streak_start_cycle_date} →{" "}
                      {step.streak_end_cycle_date})
                    </>
                  ) : (
                    "no streak yet"
                  )}
                </li>
              ))}
            </ul>
          </li>
        ))}
        {routineHistories.length === 0 && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No routine history yet.
          </p>
        )}
      </ul>
    </div>
  );
}
