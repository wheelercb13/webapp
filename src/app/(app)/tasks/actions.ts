"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { nextOccurrence } from "@/lib/recurrence";
import type { RepeatUnit } from "@/lib/recurrence";
import type { Task, TaskPriority } from "@/lib/types";

function revalidateTaskPaths(domainId: string, taskId?: string) {
  revalidatePath("/");
  revalidatePath("/domains");
  revalidatePath(`/domains/${domainId}`);
  if (taskId) {
    revalidatePath(`/domains/${domainId}/tasks/${taskId}`);
  }
}

export type TaskFormState = { error?: string } | undefined;

function parseRepeatFields(formData: FormData, due_date: string | null) {
  const repeatUnitRaw = (formData.get("repeatUnit") as string) || "";
  const repeat_unit = (repeatUnitRaw || null) as RepeatUnit | null;

  if (!repeat_unit) {
    return { repeat_unit: null, repeat_interval: 1, repeat_weekdays: null, repeat_until: null };
  }

  if (!due_date) {
    return { error: "Due date is required for repeating tasks." } as const;
  }

  const repeat_interval = Math.max(
    1,
    parseInt(formData.get("repeatInterval") as string, 10) || 1
  );
  const repeat_weekdays =
    repeat_unit === "week"
      ? formData.getAll("repeatWeekday").map((v) => Number(v))
      : null;

  if (repeat_unit === "week" && repeat_weekdays?.length === 0) {
    return { error: "Select at least one day." } as const;
  }

  const repeatEnds = formData.get("repeatEnds") as string;
  const repeat_until =
    repeatEnds === "on" ? (formData.get("repeatUntil") as string) || null : null;

  return { repeat_unit, repeat_interval, repeat_weekdays, repeat_until };
}

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

  const repeatFields = parseRepeatFields(formData, due_date);
  if ("error" in repeatFields) {
    return { error: repeatFields.error };
  }

  const supabase = await createClient();

  const { data: last } = (await supabase
    .from("tasks")
    .select("sort_order")
    .eq("domain_id", domainId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle()) as { data: Pick<Task, "sort_order"> | null };
  const sortOrder = (last?.sort_order ?? 0) + 1;

  const { error } = await supabase.from("tasks").insert({
    domain_id: domainId,
    title,
    notes,
    due_date,
    priority,
    sort_order: sortOrder,
    ...repeatFields,
  });

  if (error) {
    return { error: error.message };
  }

  revalidateTaskPaths(domainId);
  redirect(`/domains/${domainId}`, "replace");
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

  const repeatFields = parseRepeatFields(formData, due_date);
  if ("error" in repeatFields) {
    return { error: repeatFields.error };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ title, notes, due_date, priority, ...repeatFields })
    .eq("id", taskId);

  if (error) {
    return { error: error.message };
  }

  revalidateTaskPaths(domainId, taskId);
  redirect(`/domains/${domainId}/tasks/${taskId}`, "replace");
}

export async function toggleTaskStatus(domainId: string, taskId: string) {
  const supabase = await createClient();
  const { data: task } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .single();

  if (!task) {
    return;
  }

  if (task.status === "open") {
    if (task.repeat_unit && task.due_date) {
      const next = nextOccurrence(task.due_date, {
        unit: task.repeat_unit,
        interval: task.repeat_interval,
        weekdays: task.repeat_weekdays,
      });
      if (!task.repeat_until || next <= task.repeat_until) {
        await supabase.from("tasks").update({ due_date: next }).eq("id", taskId);
        revalidateTaskPaths(domainId, taskId);
        return;
      }
    }
    await supabase.from("tasks").update({ status: "done" }).eq("id", taskId);
  } else {
    await supabase.from("tasks").update({ status: "open" }).eq("id", taskId);
  }

  revalidateTaskPaths(domainId, taskId);
}

export async function deleteTask(domainId: string, taskId: string) {
  const supabase = await createClient();
  await supabase.from("tasks").delete().eq("id", taskId);
  revalidateTaskPaths(domainId, taskId);
  redirect(`/domains/${domainId}`, "replace");
}

export async function reorderTask(domainId: string, taskId: string, direction: "up" | "down") {
  const supabase = await createClient();
  const { data } = (await supabase
    .from("tasks")
    .select("id, sort_order")
    .eq("domain_id", domainId)
    .eq("status", "open")
    .order("sort_order", { ascending: true })) as {
    data: Pick<Task, "id" | "sort_order">[] | null;
  };

  const tasks = data ?? [];
  const index = tasks.findIndex((t) => t.id === taskId);
  const swapIndex = direction === "up" ? index - 1 : index + 1;

  if (index === -1 || swapIndex < 0 || swapIndex >= tasks.length) {
    return;
  }

  const current = tasks[index];
  const swap = tasks[swapIndex];

  await Promise.all([
    supabase.from("tasks").update({ sort_order: swap.sort_order }).eq("id", current.id),
    supabase.from("tasks").update({ sort_order: current.sort_order }).eq("id", swap.id),
  ]);

  revalidateTaskPaths(domainId);
}
