"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TaskPriority, TaskStatus } from "@/lib/types";

function revalidateTaskPaths(domainId: string) {
  revalidatePath("/");
  revalidatePath("/domains");
  revalidatePath(`/domains/${domainId}`);
}

export type TaskFormState = { error?: string } | undefined;

export async function createTask(
  domainId: string,
  _state: TaskFormState,
  formData: FormData
): Promise<TaskFormState> {
  const title = (formData.get("title") as string)?.trim();
  const notes = (formData.get("notes") as string)?.trim() || null;
  const due_date = (formData.get("due_date") as string) || null;
  const priority = formData.get("priority") as TaskPriority;

  if (!title) {
    return { error: "Title is required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("tasks").insert({
    domain_id: domainId,
    title,
    notes,
    due_date,
    priority,
  });

  if (error) {
    return { error: error.message };
  }

  revalidateTaskPaths(domainId);
}

export async function updateTask(
  domainId: string,
  taskId: string,
  _state: TaskFormState,
  formData: FormData
): Promise<TaskFormState> {
  const title = (formData.get("title") as string)?.trim();
  const notes = (formData.get("notes") as string)?.trim() || null;
  const due_date = (formData.get("due_date") as string) || null;
  const priority = formData.get("priority") as TaskPriority;

  if (!title) {
    return { error: "Title is required." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ title, notes, due_date, priority })
    .eq("id", taskId);

  if (error) {
    return { error: error.message };
  }

  revalidateTaskPaths(domainId);
}

export async function toggleTaskStatus(
  domainId: string,
  taskId: string,
  currentStatus: TaskStatus
) {
  const nextStatus: TaskStatus = currentStatus === "open" ? "done" : "open";
  const supabase = await createClient();
  await supabase.from("tasks").update({ status: nextStatus }).eq("id", taskId);
  revalidateTaskPaths(domainId);
}

export async function deleteTask(domainId: string, taskId: string) {
  const supabase = await createClient();
  await supabase.from("tasks").delete().eq("id", taskId);
  revalidateTaskPaths(domainId);
}
