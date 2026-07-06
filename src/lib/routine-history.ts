import type { createClient } from "@/lib/supabase/server";
import { longestStreak } from "./routines";
import type { RoutineCadence } from "./types";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

async function ensureRoutineHistory(
  supabase: SupabaseClient,
  routineId: string
): Promise<string | null> {
  const { data: existing } = await supabase
    .from("routine_history")
    .select("id")
    .eq("source_routine_id", routineId)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: routine } = await supabase
    .from("routines")
    .select("name, cadence, created_at")
    .eq("id", routineId)
    .single();

  if (!routine) return null;

  const { data } = await supabase
    .from("routine_history")
    .insert({
      source_routine_id: routineId,
      name: routine.name,
      cadence: routine.cadence,
      created_at: routine.created_at,
    })
    .select("id")
    .single();

  return data?.id ?? null;
}

async function ensureRoutineStepHistory(
  supabase: SupabaseClient,
  stepId: string
): Promise<string | null> {
  const { data: existing } = await supabase
    .from("routine_step_history")
    .select("id")
    .eq("source_step_id", stepId)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: step } = await supabase
    .from("routine_steps")
    .select("label, routine_id")
    .eq("id", stepId)
    .single();

  if (!step) return null;

  const routineHistoryId = await ensureRoutineHistory(supabase, step.routine_id);
  if (!routineHistoryId) return null;

  const { data } = await supabase
    .from("routine_step_history")
    .insert({
      routine_history_id: routineHistoryId,
      source_step_id: stepId,
      step_label: step.label,
    })
    .select("id")
    .single();

  return data?.id ?? null;
}

// Call whenever a routine is created -- makes it show up in the History
// page immediately (0-day streak) instead of only appearing after its
// first completion.
export async function recordRoutineCreated(supabase: SupabaseClient, routineId: string) {
  await ensureRoutineHistory(supabase, routineId);
}

// Call whenever a step is created -- same reasoning as above.
export async function recordStepCreated(supabase: SupabaseClient, stepId: string) {
  await ensureRoutineStepHistory(supabase, stepId);
}

// Keeps the history snapshot in sync with the live row while it still
// exists (renames, cadence changes). No-op if the routine has no
// history row yet or has already been deleted.
export async function syncRoutineHistorySnapshot(
  supabase: SupabaseClient,
  routineId: string,
  name: string,
  cadence: RoutineCadence
) {
  await supabase
    .from("routine_history")
    .update({ name, cadence })
    .eq("source_routine_id", routineId);
}

export async function syncRoutineStepHistorySnapshot(
  supabase: SupabaseClient,
  stepId: string,
  label: string
) {
  await supabase.from("routine_step_history").update({ step_label: label }).eq("source_step_id", stepId);
}

// Call after every completion toggle -- recomputes the longest streak
// ever held for this step from its full completion history, and updates
// the permanent record if this run beats the previous best. Lazily
// (re)creates the history row if it's missing (e.g. was deleted from the
// History page while the live routine kept going), so tracking never
// silently stops.
export async function recordStreakIfBest(
  supabase: SupabaseClient,
  stepId: string,
  cadence: RoutineCadence
) {
  const { data: completions } = await supabase
    .from("routine_completions")
    .select("cycle_date")
    .eq("routine_step_id", stepId);

  const best = longestStreak(cadence, new Set((completions ?? []).map((c) => c.cycle_date)));
  if (!best) return;

  const stepHistoryId = await ensureRoutineStepHistory(supabase, stepId);
  if (!stepHistoryId) return;

  const { data: current } = await supabase
    .from("routine_step_history")
    .select("longest_streak_days")
    .eq("id", stepHistoryId)
    .single();

  if (best.length > (current?.longest_streak_days ?? 0)) {
    await supabase
      .from("routine_step_history")
      .update({
        longest_streak_days: best.length,
        streak_start_cycle_date: best.startDate,
        streak_end_cycle_date: best.endDate,
      })
      .eq("id", stepHistoryId);
  }
}
