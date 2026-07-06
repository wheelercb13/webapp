"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Routine, RoutineCadence } from "@/lib/types";
import { recordRoutineCreated, syncRoutineHistorySnapshot } from "@/lib/routine-history";

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

  const { data: last } = (await supabase
    .from("routines")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle()) as { data: Pick<Routine, "sort_order"> | null };
  const sortOrder = (last?.sort_order ?? 0) + 1;

  const { data, error } = await supabase
    .from("routines")
    .insert({ name, cadence, sort_order: sortOrder })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "You already have a routine with that name." };
    }
    return { error: error.message };
  }

  await recordRoutineCreated(supabase, data.id);

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

  await syncRoutineHistorySnapshot(supabase, routineId, name, cadence);

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

export async function reorderRoutine(routineId: string, direction: "up" | "down") {
  const supabase = await createClient();
  const { data } = (await supabase
    .from("routines")
    .select("id, sort_order")
    .order("sort_order", { ascending: true })) as {
    data: Pick<Routine, "id" | "sort_order">[] | null;
  };

  const routines = data ?? [];
  const index = routines.findIndex((r) => r.id === routineId);
  const swapIndex = direction === "up" ? index - 1 : index + 1;

  if (index === -1 || swapIndex < 0 || swapIndex >= routines.length) {
    return;
  }

  const current = routines[index];
  const swap = routines[swapIndex];

  await Promise.all([
    supabase.from("routines").update({ sort_order: swap.sort_order }).eq("id", current.id),
    supabase.from("routines").update({ sort_order: current.sort_order }).eq("id", swap.id),
  ]);

  revalidatePath("/routines");
}
