import { createClient } from "@/lib/supabase/server";
import type { Routine, RoutineHistory, RoutineStepHistory } from "@/lib/types";
import { deleteRoutineHistory, resetStepCounter } from "./actions";

export default async function RoutineHistoryPage() {
  const supabase = await createClient();

  const { data: liveRoutinesData } = (await supabase
    .from("routines")
    .select("*")
    .order("sort_order")) as { data: Routine[] | null };
  const liveRoutines = liveRoutinesData ?? [];

  const { data: historyData } = (await supabase.from("routine_history").select("*")) as {
    data: RoutineHistory[] | null;
  };
  const allHistories = historyData ?? [];

  const liveOrderById = new Map(liveRoutines.map((r, index) => [r.id, index]));
  const activeHistories = allHistories
    .filter((h) => h.source_routine_id !== null)
    .sort(
      (a, b) =>
        (liveOrderById.get(a.source_routine_id!) ?? 0) -
        (liveOrderById.get(b.source_routine_id!) ?? 0)
    );

  const deletedHistories = allHistories
    .filter((h) => h.source_routine_id === null)
    .sort((a, b) => {
      const aTime = a.deleted_at ? new Date(a.deleted_at).getTime() : 0;
      const bTime = b.deleted_at ? new Date(b.deleted_at).getTime() : 0;
      return aTime - bTime;
    });

  const historyIds = allHistories.map((h) => h.id);
  const { data: stepHistoryData } =
    historyIds.length > 0
      ? ((await supabase
          .from("routine_step_history")
          .select("*")
          .in("routine_history_id", historyIds)) as { data: RoutineStepHistory[] | null })
      : { data: [] as RoutineStepHistory[] };

  const stepsByRoutine = new Map<string, RoutineStepHistory[]>();
  for (const step of stepHistoryData ?? []) {
    const list = stepsByRoutine.get(step.routine_history_id) ?? [];
    list.push(step);
    stepsByRoutine.set(step.routine_history_id, list);
  }

  function renderRoutine(routine: RoutineHistory, isActive: boolean) {
    return (
      <div
        key={routine.id}
        className="flex flex-col gap-2 rounded-xl border border-card-border p-4"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[15px] text-foreground">{routine.name}</p>
            <p className="text-[12px] text-muted">
              {routine.cadence} · created {routine.created_at.slice(0, 10)}
              {!isActive && routine.deleted_at && ` · deleted ${routine.deleted_at.slice(0, 10)}`}
            </p>
          </div>
          {!isActive && (
            <form action={deleteRoutineHistory.bind(null, routine.id)}>
              <button
                type="submit"
                className="shrink-0 rounded-full border border-delete-border px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-delete-text transition-colors hover:bg-white/[.06]"
              >
                Delete
              </button>
            </form>
          )}
        </div>
        <div className="flex flex-col gap-2.5 border-t border-hairline pt-2">
          {(stepsByRoutine.get(routine.id) ?? []).map((step) => (
            <div key={step.id} className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[13px] text-muted">
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
                {isActive && (
                  <p className="text-[12px] text-muted">
                    Completed {step.completion_count} time{step.completion_count === 1 ? "" : "s"}
                  </p>
                )}
              </div>
              {isActive && (
                <form action={resetStepCounter.bind(null, step.id)}>
                  <button
                    type="submit"
                    className="shrink-0 rounded-full border border-button-border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-foreground transition-colors hover:bg-white/[.06]"
                  >
                    Reset
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[468px] flex-col px-[22px]">
      <div className="pb-[26px] pt-9">
        <h1 className="font-serif text-[34px] font-medium leading-[1.02] tracking-[-0.01em] text-foreground-display">
          Routine History
        </h1>
      </div>

      <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
        Active
      </div>
      <div className="mb-[30px] flex flex-col gap-3">
        {activeHistories.map((routine) => renderRoutine(routine, true))}
        {activeHistories.length === 0 && (
          <p className="text-[14px] text-muted">No active routines.</p>
        )}
      </div>

      <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
        Deleted
      </div>
      <div className="flex flex-col gap-3">
        {deletedHistories.map((routine) => renderRoutine(routine, false))}
        {deletedHistories.length === 0 && (
          <p className="text-[14px] text-muted">No deleted routines.</p>
        )}
      </div>
    </div>
  );
}
