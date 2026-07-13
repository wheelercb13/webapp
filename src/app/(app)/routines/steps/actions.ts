"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { currentCycleDate } from "@/lib/routines";
import {
  recordStepCreated,
  syncRoutineStepHistorySnapshot,
  recordStreakIfBest,
  incrementStepCounter,
} from "@/lib/routine-history";
import type { RoutineCadence, RoutineStep } from "@/lib/types";

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

  const weekdayRaw = formData.get("weekday") as string | null;
  const weekday = weekdayRaw !== null && weekdayRaw !== "" ? Number(weekdayRaw) : null;

  const supabase = await createClient();

  const { data: last } = (await supabase
    .from("routine_steps")
    .select("sort_order")
    .eq("routine_id", routineId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle()) as { data: Pick<RoutineStep, "sort_order"> | null };
  const sortOrder = (last?.sort_order ?? 0) + 1;

  const { data, error } = await supabase
    .from("routine_steps")
    .insert({ routine_id: routineId, label, sort_order: sortOrder, weekday })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  await recordStepCreated(supabase, data.id);

  revalidateRoutinePaths(routineId);
  redirect(`/routines/${routineId}`, "replace");
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

  const weekdayRaw = formData.get("weekday") as string | null;
  const weekday = weekdayRaw !== null && weekdayRaw !== "" ? Number(weekdayRaw) : null;

  const supabase = await createClient();
  const { error } = await supabase
    .from("routine_steps")
    .update({ label, weekday })
    .eq("id", stepId);

  if (error) {
    return { error: error.message };
  }

  await syncRoutineStepHistorySnapshot(supabase, stepId, label);

  revalidateRoutinePaths(routineId);
  redirect(`/routines/${routineId}`, "replace");
}

export async function deleteStep(routineId: string, stepId: string) {
  const supabase = await createClient();
  await supabase.from("routine_steps").delete().eq("id", stepId);
  revalidateRoutinePaths(routineId);
  redirect(`/routines/${routineId}`, "replace");
}

export async function reorderStep(routineId: string, stepId: string, direction: "up" | "down") {
  const supabase = await createClient();
  const { data } = (await supabase
    .from("routine_steps")
    .select("id, sort_order")
    .eq("routine_id", routineId)
    .order("sort_order", { ascending: true })) as {
    data: Pick<RoutineStep, "id" | "sort_order">[] | null;
  };

  const steps = data ?? [];
  const index = steps.findIndex((s) => s.id === stepId);
  const swapIndex = direction === "up" ? index - 1 : index + 1;

  if (index === -1 || swapIndex < 0 || swapIndex >= steps.length) {
    return;
  }

  const current = steps[index];
  const swap = steps[swapIndex];

  await Promise.all([
    supabase.from("routine_steps").update({ sort_order: swap.sort_order }).eq("id", current.id),
    supabase.from("routine_steps").update({ sort_order: current.sort_order }).eq("id", swap.id),
  ]);

  revalidateRoutinePaths(routineId);
}

export async function toggleStepCompletion(
  routineId: string,
  stepId: string,
  cadence: RoutineCadence,
  weekday: number | null,
  currentlyCompleted: boolean
) {
  const supabase = await createClient();
  const cycleDate = currentCycleDate(cadence, weekday);

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
    await incrementStepCounter(supabase, stepId);
  }

  await recordStreakIfBest(supabase, stepId, cadence);

  revalidateRoutinePaths(routineId);
}
