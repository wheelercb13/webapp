"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { IdeaStage, TaskPriority } from "@/lib/types";

export type IdeaFormState = { error?: string } | undefined;

function parseTags(formData: FormData): string[] {
  const raw = (formData.get("tags") as string) ?? "";
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export async function createIdea(
  _state: IdeaFormState,
  formData: FormData
): Promise<IdeaFormState> {
  const title = (formData.get("title") as string)?.trim();
  const notes = (formData.get("notes") as string)?.trim() || null;
  const stage = formData.get("stage") as IdeaStage;
  const priority = formData.get("priority") as TaskPriority;
  const tags = parseTags(formData);

  if (!title) {
    return { error: "Title is required." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ideas")
    .insert({ title, notes, stage, priority, tags })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/ideas");
  redirect(`/ideas/${data.id}`, "replace");
}

export async function updateIdea(
  ideaId: string,
  _state: IdeaFormState,
  formData: FormData
): Promise<IdeaFormState> {
  const title = (formData.get("title") as string)?.trim();
  const notes = (formData.get("notes") as string)?.trim() || null;
  const stage = formData.get("stage") as IdeaStage;
  const priority = formData.get("priority") as TaskPriority;
  const tags = parseTags(formData);

  if (!title) {
    return { error: "Title is required." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("ideas")
    .update({ title, notes, stage, priority, tags })
    .eq("id", ideaId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/ideas");
  revalidatePath(`/ideas/${ideaId}`);
  redirect(`/ideas/${ideaId}`, "replace");
}

export async function deleteIdea(ideaId: string) {
  const supabase = await createClient();
  await supabase.from("ideas").delete().eq("id", ideaId);
  revalidatePath("/ideas");
  redirect("/ideas", "replace");
}

export async function sendIdeaToTask(
  ideaId: string,
  _state: IdeaFormState,
  formData: FormData
): Promise<IdeaFormState> {
  const domainId = formData.get("domainId") as string;

  if (!domainId) {
    return { error: "Please choose a domain." };
  }

  const supabase = await createClient();
  const { data: idea } = await supabase
    .from("ideas")
    .select("*")
    .eq("id", ideaId)
    .single();

  if (!idea) {
    return { error: "Idea not found." };
  }

  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .insert({
      domain_id: domainId,
      title: idea.title,
      notes: idea.notes,
      priority: idea.priority,
    })
    .select()
    .single();

  if (taskError) {
    return { error: taskError.message };
  }

  await supabase.from("ideas").update({ linked_task_id: task.id }).eq("id", ideaId);

  revalidatePath("/ideas");
  revalidatePath(`/ideas/${ideaId}`);
  revalidatePath("/domains");
  revalidatePath(`/domains/${domainId}`);
  revalidatePath("/");
  redirect(`/domains/${domainId}/tasks/${task.id}`, "replace");
}
