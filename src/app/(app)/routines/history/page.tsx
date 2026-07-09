import { createClient } from "@/lib/supabase/server";
import type { Routine, RoutineHistory, RoutineStep, RoutineStepHistory } from "@/lib/types";
import { formatDateDisplay } from "@/lib/date";
import { deleteRoutineHistory, resetStepStreak } from "./actions";

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

  const { data: liveStepsData } = (await supabase
    .from("routine_steps")
    .select("id, sort_order")) as { data: Pick<RoutineStep, "id" | "sort_order">[] | null };
  const liveStepSortOrder = new Map((liveStepsData ?? []).map((s) => [s.id, s.sort_order]));

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

  // Active routines keep the live step order (matches the Routine page,
  // re-sorts automatically if steps are reordered there). Steps whose live
  // row no longer exists (deleted step, or the whole routine was deleted)
  // have no sort_order to anchor to, so they fall back to alphabetical --
  // stable across reloads, unlike leaving the DB's unspecified row order.
  for (const list of stepsByRoutine.values()) {
    list.sort((a, b) => {
      const aOrder = a.source_step_id ? liveStepSortOrder.get(a.source_step_id) : undefined;
      const bOrder = b.source_step_id ? liveStepSortOrder.get(b.source_step_id) : undefined;
      if (aOrder !== undefined && bOrder !== undefined) return aOrder - bOrder;
      if (aOrder !== undefined) return -1;
      if (bOrder !== undefined) return 1;
      return a.step_label.localeCompare(b.step_label);
    });
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
              {routine.cadence} · created {formatDateDisplay(routine.created_at)}
              {!isActive &&
                routine.deleted_at &&
                ` · deleted ${formatDateDisplay(routine.deleted_at)}`}
            </p>
          </div>
          {!isActive && (
            <form action={deleteRoutineHistory.bind(null, routine.id)}>
              <button
                type="submit"
                className="shrink-0 rounded-full border border-delete-border px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-delete-text transition-colors hover:bg-white/[.06]"
              >
                Delete
              </button>
            </form>
          )}
        </div>
        <div className="flex flex-col gap-0.5 border-t border-hairline pt-2">
          {(stepsByRoutine.get(routine.id) ?? []).map((step, index) => (
            <div
              key={step.id}
              className={`flex items-start justify-between gap-3 rounded-lg px-2.5 py-2 ${
                index % 2 === 1 ? "bg-white/[.03]" : ""
              }`}
            >
              <div>
                <p className="text-[13px] text-foreground">{step.step_label}</p>
                <p className="text-[12px] text-muted">
                  {step.longest_streak_days > 0 ? (
                    <>
                      {step.longest_streak_days}-day streak (
                      {formatDateDisplay(step.streak_start_cycle_date!)} →{" "}
                      {formatDateDisplay(step.streak_end_cycle_date!)})
                    </>
                  ) : (
                    "no streak yet"
                  )}
                </p>
                {isActive && (
                  <p className="text-[12px] text-muted">
                    Completed {step.completion_count} time{step.completion_count === 1 ? "" : "s"}
                    {step.streak_start_cycle_date &&
                      ` · Last Reset ${formatDateDisplay(step.streak_start_cycle_date)}`}
                  </p>
                )}
              </div>
              {isActive && (
                <form action={resetStepStreak.bind(null, step.id)}>
                  <button
                    type="submit"
                    className="shrink-0 rounded-full border border-button-border px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-foreground transition-colors hover:bg-white/[.06]"
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
