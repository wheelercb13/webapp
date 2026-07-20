"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { currentCycleDate, recentCycleDates, recentOccurrenceDates } from "@/lib/routines";
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
  cadence: RoutineCadence,
  _state: StepFormState,
  formData: FormData
): Promise<StepFormState> {
  const label = (formData.get("label") as string)?.trim();

  if (!label) {
    return { error: "Label is required." };
  }

  const weekdaysRaw = formData.getAll("weekday").map(Number);
  if (cadence === "weekly" && weekdaysRaw.length === 0) {
    return { error: "Select at least one day." };
  }
  const weekdays = cadence === "weekly" ? weekdaysRaw : null;

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
    .insert({ routine_id: routineId, label, sort_order: sortOrder, weekdays })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  await recordStepCreated(supabase, data.id);

  revalidateRoutinePaths(routineId);
  redirect(`/routines/${routineId}`, "replace");
}

// Saves the step's label/weekdays and its "Last 7 Days" completion edits in
// one submit. `renderWeekdays` is the weekdays the edit page was rendered
// with (bound server-side, not read from formData) -- it's what the
// "Last 7 Days" checkboxes' dates were computed from, so it must be used
// to re-derive those same dates even if the user also changes "Repeats on"
// in this same submit.
export async function updateStepAndHistory(
  routineId: string,
  stepId: string,
  cadence: RoutineCadence,
  renderWeekdays: number[] | null,
  _state: StepFormState,
  formData: FormData
): Promise<StepFormState> {
  const label = (formData.get("label") as string)?.trim();

  if (!label) {
    return { error: "Label is required." };
  }

  const weekdaysRaw = formData.getAll("weekday").map(Number);
  if (cadence === "weekly" && weekdaysRaw.length === 0) {
    return { error: "Select at least one day." };
  }
  const weekdays = cadence === "weekly" ? weekdaysRaw : null;

  const supabase = await createClient();
  const { error } = await supabase
    .from("routine_steps")
    .update({ label, weekdays })
    .eq("id", stepId);

  if (error) {
    return { error: error.message };
  }

  await syncRoutineStepHistorySnapshot(supabase, stepId, label);

  const dates =
    cadence === "daily"
      ? recentCycleDates("daily", null, 7)
      : recentOccurrenceDates(renderWeekdays ?? [], 7);

  const { data: existing } = (await supabase
    .from("routine_completions")
    .select("cycle_date")
    .eq("routine_step_id", stepId)
    .in("cycle_date", dates)) as { data: { cycle_date: string }[] | null };
  const existingDates = new Set((existing ?? []).map((c) => c.cycle_date));

  for (const date of dates) {
    const shouldBeComplete = formData.get(`cycle_${date}`) === "on";
    const isComplete = existingDates.has(date);

    if (shouldBeComplete && !isComplete) {
      await supabase.from("routine_completions").insert({ routine_step_id: stepId, cycle_date: date });
      await incrementStepCounter(supabase, stepId);
    } else if (!shouldBeComplete && isComplete) {
      await supabase
        .from("routine_completions")
        .delete()
        .eq("routine_step_id", stepId)
        .eq("cycle_date", date);
    }
  }

  await recordStreakIfBest(supabase, stepId, cadence);

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

