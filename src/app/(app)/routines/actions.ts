"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { RoutineCadence } from "@/lib/types";

export type RoutineFormState = { error?: string } | undefined;

export async function createRoutine(
  _state: RoutineFormState,
  formData: FormData
): Promise<RoutineFormState> {
  const name = (formData.get("name") as string)?.trim();
  const cadence = formData.get("cadence") as RoutineCadence;

  if (!name) {
    return { error: "Name is required." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("routines")
    .insert({ name, cadence })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "You already have a routine with that name." };
    }
    return { error: error.message };
  }

  revalidatePath("/routines");
  revalidatePath("/");
  redirect(`/routines/${data.id}`, "replace");
}

export async function updateRoutine(
  routineId: string,
  _state: RoutineFormState,
  formData: FormData
): Promise<RoutineFormState> {
  const name = (formData.get("name") as string)?.trim();
  const cadence = formData.get("cadence") as RoutineCadence;

  if (!name) {
    return { error: "Name is required." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("routines")
    .update({ name, cadence })
    .eq("id", routineId);

  if (error) {
    if (error.code === "23505") {
      return { error: "You already have a routine with that name." };
    }
    return { error: error.message };
  }

  revalidatePath("/routines");
  revalidatePath(`/routines/${routineId}`);
  revalidatePath("/");
  redirect(`/routines/${routineId}`, "replace");
}

export async function deleteRoutine(routineId: string) {
  const supabase = await createClient();
  await supabase.from("routines").delete().eq("id", routineId);
  revalidatePath("/routines");
  revalidatePath("/");
  redirect("/routines", "replace");
}
