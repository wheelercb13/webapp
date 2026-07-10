import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Routine, RoutineStep } from "@/lib/types";
import { updateStep, deleteStep } from "@/app/(app)/routines/steps/actions";
import { StepForm } from "@/app/(app)/routines/steps/step-form";

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

  return (
    <div className="mx-auto flex w-full max-w-[468px] flex-col px-[22px]">
      <div className="pb-[26px] pt-9">
        <h1 className="font-serif text-[34px] font-medium leading-[1.02] tracking-[-0.01em] text-foreground-display">
          Edit Step
        </h1>
      </div>
      <div className="mb-4 rounded-xl border border-card-border p-4">
        <StepForm
          action={updateStep.bind(null, routineId, stepId)}
          cadence={routine.cadence}
          initial={step}
          submitLabel="Save"
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
