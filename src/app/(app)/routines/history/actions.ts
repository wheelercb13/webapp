"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function deleteRoutineHistory(routineHistoryId: string) {
  const supabase = await createClient();
  // Server-side guard in addition to hiding the button in the UI --
  // active routines (source_routine_id still set) can't be deleted from
  // History; delete the live routine from the Routines page instead.
  await supabase
    .from("routine_history")
    .delete()
    .eq("id", routineHistoryId)
    .is("source_routine_id", null);
  revalidatePath("/routines/history");
}

export async function resetStepStreak(stepHistoryId: string) {
  const supabase = await createClient();
  await supabase
    .from("routine_step_history")
    .update({
      longest_streak_days: 0,
      streak_start_cycle_date: null,
      streak_end_cycle_date: null,
    })
    .eq("id", stepHistoryId);
  revalidatePath("/routines/history");
}
