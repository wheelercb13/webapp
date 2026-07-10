import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Routine, RoutineStep, RoutineCompletion } from "@/lib/types";
import { computeStreak, currentCycleDate } from "@/lib/routines";
import { StepCheckbox } from "@/app/(app)/routines/steps/step-checkbox";
import { reorderStep } from "@/app/(app)/routines/steps/actions";

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
    redirect("/routines");
  }

  const { data: stepsData } = (await supabase
    .from("routine_steps")
    .select("*")
    .eq("routine_id", id)
    .order("sort_order", { ascending: true })) as { data: RoutineStep[] | null };

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

  return (
    <div className="mx-auto flex w-full max-w-[468px] flex-col px-[22px]">
      <div className="flex items-end justify-between gap-3 pb-[26px] pt-9">
        <h1 className="font-serif text-[34px] font-medium leading-[1.02] tracking-[-0.01em] text-foreground-display">
          {routine.name}
        </h1>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/routines/${routine.id}/edit`}
            className="inline-flex items-center justify-center rounded-full border border-button-border px-5 py-2.5 text-[12px] font-semibold text-foreground transition-colors hover:bg-white/[.06]"
          >
            Edit
          </Link>
          <Link
            href={`/routines/${routine.id}/steps/new`}
            className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-[12px] font-semibold text-background transition-opacity hover:opacity-90"
          >
            Create New Step
          </Link>
        </div>
      </div>

      <div className="border-t border-hairline">
        {steps.map((step, index) => {
          const completions = completionsByStep.get(step.id) ?? new Set<string>();
          const cycleDate = currentCycleDate(routine.cadence, step.weekday);
          const checked = completions.has(cycleDate);
          const streak = computeStreak(routine.cadence, step.weekday, completions);

          return (
            <div key={step.id} className="flex items-center gap-2 border-b border-hairline">
              <div className="min-w-0 flex-1">
                <StepCheckbox
                  routineId={routine.id}
                  stepId={step.id}
                  cadence={routine.cadence}
                  weekday={step.weekday}
                  label={step.label}
                  checked={checked}
                  streak={streak}
                  bordered={false}
                />
              </div>
              <Link
                href={`/routines/${routine.id}/steps/${step.id}/edit`}
                className="inline-flex items-center justify-center shrink-0 rounded-full border border-button-border px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-foreground transition-colors hover:bg-white/[.06]"
              >
                Edit
              </Link>
              <div className="flex shrink-0 flex-col gap-px">
                <form action={reorderStep.bind(null, routine.id, step.id, "up")}>
                  <button
                    type="submit"
                    disabled={index === 0}
                    aria-label="Move up"
                    className="flex h-[13px] w-6 items-center justify-center text-[9px] leading-none text-faint hover:text-foreground disabled:opacity-30"
                  >
                    ▲
                  </button>
                </form>
                <form action={reorderStep.bind(null, routine.id, step.id, "down")}>
                  <button
                    type="submit"
                    disabled={index === steps.length - 1}
                    aria-label="Move down"
                    className="flex h-[13px] w-6 items-center justify-center text-[9px] leading-none text-faint hover:text-foreground disabled:opacity-30"
                  >
                    ▼
                  </button>
                </form>
              </div>
            </div>
          );
        })}
        {steps.length === 0 && (
          <p className="py-4 text-[14px] text-muted">
            No steps yet — tap Create New Step above.
          </p>
        )}
      </div>
    </div>
  );
}
