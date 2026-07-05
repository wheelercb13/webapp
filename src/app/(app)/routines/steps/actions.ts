"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { currentCycleDate } from "@/lib/routines";
import type { RoutineCadence } from "@/lib/types";

export type StepFormState = { error?: string } | undefined;

function revalidateRoutinePaths(routineId: string) {
  revalidatePath("/");
  revalidatePath("/routines");
  revalidatePath(`/routines/${routineId}`);
}

export async function createStep(
  routineId: string,
  _state: StepFormState,
  formData: FormData
): Promise<StepFormState> {
  const label = (formData.get("label") as string)?.trim();

  if (!label) {
    return { error: "Label is required." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("routine_steps")
    .insert({ routine_id: routineId, label });

  if (error) {
    return { error: error.message };
  }

  revalidateRoutinePaths(routineId);
  redirect(`/routines/${routineId}`);
}

export async function updateStep(
  routineId: string,
  stepId: string,
  _state: StepFormState,
  formData: FormData
): Promise<StepFormState> {
  const label = (formData.get("label") as string)?.trim();

  if (!label) {
    return { error: "Label is required." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("routine_steps")
    .update({ label })
    .eq("id", stepId);

  if (error) {
    return { error: error.message };
  }

  revalidateRoutinePaths(routineId);
  redirect(`/routines/${routineId}`);
}

export async function deleteStep(routineId: string, stepId: string) {
  const supabase = await createClient();
  await supabase.from("routine_steps").delete().eq("id", stepId);
  revalidateRoutinePaths(routineId);
  redirect(`/routines/${routineId}`);
}

export async function toggleStepCompletion(
  routineId: string,
  stepId: string,
  cadence: RoutineCadence,
  currentlyCompleted: boolean
) {
  const supabase = await createClient();
  const cycleDate = currentCycleDate(cadence);

  if (currentlyCompleted) {
    await supabase
      .from("routine_completions")
      .delete()
      .eq("routine_step_id", stepId)
      .eq("cycle_date", cycleDate);
  } else {
    await supabase
      .from("routine_completions")
      .insert({ routine_step_id: stepId, cycle_date: cycleDate });
  }

  revalidateRoutinePaths(routineId);
}
