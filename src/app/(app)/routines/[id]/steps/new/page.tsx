import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Routine } from "@/lib/types";
import { createStep } from "@/app/(app)/routines/steps/actions";
import { StepForm } from "@/app/(app)/routines/steps/step-form";

export default async function NewStepPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: routineId } = await params;
  const supabase = await createClient();

  const { data: routine } = (await supabase
    .from("routines")
    .select("*")
    .eq("id", routineId)
    .single()) as { data: Routine | null };

  if (!routine) {
    redirect("/routines");
  }

  return (
    <div className="mx-auto flex w-full max-w-[468px] flex-col px-[22px]">
      <div className="pb-[26px] pt-9">
        <h1 className="font-serif text-[34px] font-medium leading-[1.02] tracking-[-0.01em] text-foreground-display">
          Create Step
        </h1>
      </div>
      <div className="rounded-xl border border-card-border p-4">
        <StepForm
          action={createStep.bind(null, routineId, routine.cadence)}
          cadence={routine.cadence}
          submitLabel="Add Step"
        />
      </div>
    </div>
  );
}
