import { createStep } from "@/app/(app)/routines/steps/actions";
import { StepForm } from "@/app/(app)/routines/steps/step-form";

export default async function NewStepPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: routineId } = await params;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
        Create Step
      </h1>
      <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
        <StepForm action={createStep.bind(null, routineId)} submitLabel="Add Step" />
      </div>
    </div>
  );
}
