"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function deleteRoutineHistory(routineHistoryId: string) {
  const supabase = await createClient();
  await supabase.from("routine_history").delete().eq("id", routineHistoryId);
  revalidatePath("/routines/history");
}
