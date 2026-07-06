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
    <div className="mx-auto flex w-full max-w-[468px] flex-col px-[22px]">
      <div className="pb-[26px] pt-9">
        <h1 className="font-serif text-[34px] font-medium leading-[1.02] tracking-[-0.01em] text-foreground-display">
          Routine History
        </h1>
      </div>

      <div className="flex flex-col gap-3">
        {routineHistories.map((routine) => (
          <div key={routine.id} className="flex flex-col gap-2 rounded-xl border border-card-border p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[15px] text-foreground">{routine.name}</p>
                <p className="text-[12px] text-muted">
                  {routine.cadence} · created {routine.created_at.slice(0, 10)}
                  {!routine.source_routine_id && " · deleted"}
                </p>
              </div>
              <form action={deleteRoutineHistory.bind(null, routine.id)}>
                <button
                  type="submit"
                  className="shrink-0 rounded-full border border-delete-border px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-delete-text transition-colors hover:bg-white/[.06]"
                >
                  Delete
                </button>
              </form>
            </div>
            <div className="flex flex-col gap-1 border-t border-hairline pt-2">
              {(stepsByRoutine.get(routine.id) ?? []).map((step) => (
                <p key={step.id} className="text-[13px] text-muted">
                  {step.step_label}:{" "}
                  {step.longest_streak_days > 0 ? (
                    <>
                      {step.longest_streak_days}-day streak ({step.streak_start_cycle_date} →{" "}
                      {step.streak_end_cycle_date})
                    </>
                  ) : (
                    "no streak yet"
                  )}
                </p>
              ))}
            </div>
          </div>
        ))}
        {routineHistories.length === 0 && (
          <p className="text-[14px] text-muted">No routine history yet.</p>
        )}
      </div>
    </div>
  );
}
