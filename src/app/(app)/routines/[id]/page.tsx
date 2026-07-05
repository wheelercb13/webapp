import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Routine, RoutineStep, RoutineCompletion } from "@/lib/types";
import { computeStreak, currentCycleDate } from "@/lib/routines";
import { StepCheckbox } from "@/app/(app)/routines/steps/step-checkbox";

export default async function RoutineDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: routine } = (await supabase
    .from("routines")
    .select("*")
    .eq("id", id)
    .single()) as { data: Routine | null };

  if (!routine) {
    notFound();
  }

  const { data: stepsData } = (await supabase
    .from("routine_steps")
    .select("*")
    .eq("routine_id", id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })) as { data: RoutineStep[] | null };

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

  const cycleDate = currentCycleDate(routine.cadence);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
          {routine.name}
        </h1>
        <div className="flex items-center gap-2">
          <Link
            href={`/routines/${routine.id}/edit`}
            className="rounded-full border border-black/10 px-4 py-1.5 text-sm font-medium text-black hover:bg-black/[.04] dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/[.06]"
          >
            Edit
          </Link>
          <Link
            href={`/routines/${routine.id}/steps/new`}
            className="rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            Create New Step
          </Link>
        </div>
      </div>

      <ul className="flex flex-col gap-2">
        {steps.map((step) => {
          const completions = completionsByStep.get(step.id) ?? new Set<string>();
          const checked = completions.has(cycleDate);
          const streak = computeStreak(routine.cadence, completions);

          return (
            <li key={step.id} className="flex flex-col gap-1">
              <StepCheckbox
                routineId={routine.id}
                stepId={step.id}
                cadence={routine.cadence}
                label={step.label}
                checked={checked}
                streak={streak}
              />
              <Link
                href={`/routines/${routine.id}/steps/${step.id}/edit`}
                className="self-end text-xs text-zinc-500 underline dark:text-zinc-400"
              >
                Edit step
              </Link>
            </li>
          );
        })}
        {steps.length === 0 && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No steps yet — tap Create New Step above.
          </p>
        )}
      </ul>
    </div>
  );
}
