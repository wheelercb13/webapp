import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { RoutineStep } from "@/lib/types";
import { updateStep, deleteStep } from "@/app/(app)/routines/steps/actions";
import { StepForm } from "@/app/(app)/routines/steps/step-form";

export default async function EditStepPage({
  params,
}: {
  params: Promise<{ id: string; stepId: string }>;
}) {
  const { id: routineId, stepId } = await params;
  const supabase = await createClient();

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
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
        Edit Step
      </h1>
      <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
        <StepForm
          action={updateStep.bind(null, routineId, stepId)}
          initial={step}
          submitLabel="Save"
        />
      </div>
      <form action={deleteStep.bind(null, routineId, stepId)}>
        <button
          type="submit"
          className="rounded-full border border-red-600/30 px-4 py-1.5 text-sm font-medium text-red-600 hover:bg-red-600/10 dark:text-red-400"
        >
          Delete step
        </button>
      </form>
    </div>
  );
}
