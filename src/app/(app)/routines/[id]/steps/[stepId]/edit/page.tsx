import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Routine, RoutineStep } from "@/lib/types";
import { formatDateDisplay, todayString } from "@/lib/date";
import { recentCycleDates, recentOccurrenceDates } from "@/lib/routines";
import { updateStepAndHistory, deleteStep } from "@/app/(app)/routines/steps/actions";
import { StepEditForm } from "@/app/(app)/routines/steps/step-edit-form";

export default async function EditStepPage({
  params,
}: {
  params: Promise<{ id: string; stepId: string }>;
}) {
  const { id: routineId, stepId } = await params;
  const supabase = await createClient();

  const { data: routine } = (await supabase
    .from("routines")
    .select("*")
    .eq("id", routineId)
    .single()) as { data: Routine | null };

  if (!routine) {
    redirect("/routines");
  }

  const { data: step } = (await supabase
    .from("routine_steps")
    .select("*")
    .eq("id", stepId)
    .eq("routine_id", routineId)
    .single()) as { data: RoutineStep | null };

  if (!step) {
    redirect(`/routines/${routineId}`);
  }

  const dates =
    routine.cadence === "daily"
      ? recentCycleDates("daily", null, 7)
      : recentOccurrenceDates(step.weekdays ?? [], 7);
  const today = todayString();

  const { data: completions } = (await supabase
    .from("routine_completions")
    .select("cycle_date")
    .eq("routine_step_id", stepId)
    .in("cycle_date", dates)) as { data: { cycle_date: string }[] | null };
  const completedDates = new Set((completions ?? []).map((c) => c.cycle_date));

  const historyEntries = dates.map((date) => ({
    date,
    label: date === today ? `${formatDateDisplay(date)} (Today)` : formatDateDisplay(date),
    completed: completedDates.has(date),
  }));

  return (
    <div className="mx-auto flex w-full max-w-[468px] flex-col px-[22px]">
      <div className="pb-[26px] pt-9">
        <h1 className="font-serif text-[34px] font-medium leading-[1.02] tracking-[-0.01em] text-foreground-display">
          Edit Step
        </h1>
      </div>
      <div className="mb-4 rounded-xl border border-card-border p-4">
        <StepEditForm
          action={updateStepAndHistory.bind(null, routineId, stepId, routine.cadence, step.weekdays)}
          cadence={routine.cadence}
          initial={step}
          historyEntries={historyEntries}
        />
      </div>

      <form action={deleteStep.bind(null, routineId, stepId)}>
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full border border-delete-border px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-delete-text transition-colors hover:bg-white/[.06]"
        >
          Delete
        </button>
      </form>
    </div>
  );
}
