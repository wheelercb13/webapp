"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { IdeaStage, Task, TaskPriority } from "@/lib/types";

export type InboxFormState = { error?: string; success?: boolean } | undefined;
export type InboxConvertFormState = { error?: string } | undefined;

function parseTags(formData: FormData): string[] {
  const raw = (formData.get("tags") as string) ?? "";
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export async function captureInboxItem(
  _state: InboxFormState,
  formData: FormData
): Promise<InboxFormState> {
  const raw_text = (formData.get("raw_text") as string)?.trim();

  if (!raw_text) {
    return { error: "Can't capture an empty note." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("inbox_items").insert({ raw_text });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/inbox");
  return { success: true };
}

export async function resolveInboxItem(id: string) {
  const supabase = await createClient();
  await supabase
    .from("inbox_items")
    .update({ resolved: true, resolved_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/inbox");
}

export async function deleteInboxItem(id: string) {
  const supabase = await createClient();
  await supabase.from("inbox_items").delete().eq("id", id);
  revalidatePath("/inbox");
}

export async function convertInboxToTask(
  inboxItemId: string,
  _state: InboxConvertFormState,
  formData: FormData
): Promise<InboxConvertFormState> {
  const domainId = formData.get("domainId") as string;
  const title = (formData.get("title") as string)?.trim();
  const due_date = (formData.get("due_date") as string) || null;
  const priority = formData.get("priority") as TaskPriority;

  if (!domainId) {
    return { error: "Please choose a domain." };
  }
  if (!title) {
    return { error: "Title is required." };
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

  const { data: task, error } = await supabase
    .from("tasks")
    .insert({ domain_id: domainId, title, due_date, priority, sort_order: sortOrder })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  await supabase
    .from("inbox_items")
    .update({ resolved: true, resolved_into: "task", resolved_at: new Date().toISOString() })
    .eq("id", inboxItemId);

  revalidatePath("/inbox");
  revalidatePath("/domains");
  revalidatePath(`/domains/${domainId}`);
  revalidatePath("/");
  redirect(`/domains/${domainId}/tasks/${task.id}`, "replace");
}

export async function convertInboxToIdea(
  inboxItemId: string,
  _state: InboxConvertFormState,
  formData: FormData
): Promise<InboxConvertFormState> {
  const title = (formData.get("title") as string)?.trim();
  const stage = formData.get("stage") as IdeaStage;
  const priority = formData.get("priority") as TaskPriority;
  const tags = parseTags(formData);

  if (!title) {
    return { error: "Title is required." };
  }

  const supabase = await createClient();
  const { data: idea, error } = await supabase
    .from("ideas")
    .insert({ title, stage, priority, tags })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  await supabase
    .from("inbox_items")
    .update({ resolved: true, resolved_into: "idea", resolved_at: new Date().toISOString() })
    .eq("id", inboxItemId);

  revalidatePath("/inbox");
  revalidatePath("/ideas");
  redirect(`/ideas/${idea.id}`, "replace");
}

export async function convertInboxToNote(
  inboxItemId: string,
  _state: InboxConvertFormState,
  formData: FormData
): Promise<InboxConvertFormState> {
  const content = (formData.get("content") as string)?.trim();
  const tags = parseTags(formData);

  if (!content) {
    return { error: "Content is required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("notes").insert({ content, tags });

  if (error) {
    return { error: error.message };
  }

  await supabase
    .from("inbox_items")
    .update({ resolved: true, resolved_into: "note", resolved_at: new Date().toISOString() })
    .eq("id", inboxItemId);

  revalidatePath("/inbox");
  revalidatePath("/library");
  redirect("/library", "replace");
}
