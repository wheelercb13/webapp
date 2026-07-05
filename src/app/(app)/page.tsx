import { createClient } from "@/lib/supabase/server";
import type {
  Task,
  TaskPriority,
  TaskWithDomain,
  Routine,
  RoutineStep,
  RoutineCompletion,
} from "@/lib/types";
import { DOMAIN_COLOR_CLASSES } from "@/lib/colors";
import { todayString } from "@/lib/date";
import { computeStreak, currentCycleDate } from "@/lib/routines";
import { toggleTaskStatus } from "@/app/(app)/tasks/actions";
import { StepCheckbox } from "@/app/(app)/routines/steps/step-checkbox";

type TaskRow = Task & { domains: { name: string; color: TaskWithDomain["domain_color"] } | null };

const PRIORITY_WEIGHT: Record<TaskPriority, number> = { high: 0, med: 1, low: 2 };

export default async function TodayPage() {
  const supabase = await createClient();
  const today = todayString();

  const { data: routinesData } = (await supabase
    .from("routines")
    .select("*")
    .order("name")) as { data: Routine[] | null };
  const routines = routinesData ?? [];

  const { data: stepsData } =
    routines.length > 0
      ? ((await supabase
          .from("routine_steps")
          .select("*")
          .in(
            "routine_id",
            routines.map((r) => r.id)
          )
          .order("sort_order", { ascending: true })) as { data: RoutineStep[] | null })
      : { data: [] as RoutineStep[] };
  const steps = stepsData ?? [];

  const { data: completionsData } =
    steps.length > 0
      ? ((await supabase
          .from("routine_completions")
          .select("*")
          .in(
            "routine_step_id",
            steps.map((s) => s.id)
          )) as { data: RoutineCompletion[] | null })
      : { data: [] as RoutineCompletion[] };

  const completionsByStep = new Map<string, Set<string>>();
  for (const completion of completionsData ?? []) {
    const set = completionsByStep.get(completion.routine_step_id) ?? new Set();
    set.add(completion.cycle_date);
    completionsByStep.set(completion.routine_step_id, set);
  }

  const stepsByRoutine = new Map<string, RoutineStep[]>();
  for (const step of steps) {
    const list = stepsByRoutine.get(step.routine_id) ?? [];
    list.push(step);
    stepsByRoutine.set(step.routine_id, list);
  }

  const { data } = (await supabase
    .from("tasks")
    .select("*, domains(name, color)")
    .eq("status", "open")
    .or(`due_date.is.null,due_date.lte.${today}`)) as { data: TaskRow[] | null };

  const tasks = (data ?? [])
    .filter((t) => t.domains !== null)
    .map((t) => ({
      ...t,
      domain_name: t.domains!.name,
      domain_color: t.domains!.color,
    })) as TaskWithDomain[];

  tasks.sort((a, b) => {
    const aDue = a.due_date ?? "9999-12-31";
    const bDue = b.due_date ?? "9999-12-31";
    if (aDue !== bDue) return aDue < bDue ? -1 : 1;
    if (a.priority !== b.priority) {
      return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
    }
    return a.created_at < b.created_at ? -1 : a.created_at > b.created_at ? 1 : 0;
  });

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-50">Today</h1>

      {routines.length > 0 && (
        <div className="flex flex-col gap-4">
          {routines.map((routine) => (
            <div key={routine.id} className="flex flex-col gap-2">
              <h2 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {routine.name}
              </h2>
              <ul className="flex flex-col gap-2">
                {(stepsByRoutine.get(routine.id) ?? []).map((step) => {
                  const completions = completionsByStep.get(step.id) ?? new Set<string>();
                  const cycleDate = currentCycleDate(routine.cadence);
                  const checked = completions.has(cycleDate);
                  const streak = computeStreak(routine.cadence, completions);
                  return (
                    <li key={step.id}>
                      <StepCheckbox
                        routineId={routine.id}
                        stepId={step.id}
                        cadence={routine.cadence}
                        label={step.label}
                        checked={checked}
                        streak={streak}
                        allowUncheck={false}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {tasks.map((task) => {
          const overdue = task.due_date !== null && task.due_date < today;
          return (
            <li
              key={task.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-black/10 px-4 py-3 dark:border-white/10"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${DOMAIN_COLOR_CLASSES[task.domain_color]}`}
                />
                <div className="flex flex-col gap-0.5">
                  <span className="text-black dark:text-zinc-50">{task.title}</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {task.domain_name} ·{" "}
                    {task.due_date
                      ? overdue
                        ? `Overdue (${task.due_date})`
                        : `Due ${task.due_date}`
                      : "No due date"}{" "}
                    · {task.priority}
                  </span>
                </div>
              </div>
              <form
                action={toggleTaskStatus.bind(null, task.domain_id, task.id, task.status)}
              >
                <button
                  type="submit"
                  className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-black hover:bg-black/[.04] dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/[.06]"
                >
                  Mark done
                </button>
              </form>
            </li>
          );
        })}
        {tasks.length === 0 && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Nothing due right now.
          </p>
        )}
      </ul>
    </div>
  );
}
