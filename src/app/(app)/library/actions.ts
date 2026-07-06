"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type NoteFormState = { error?: string } | undefined;

function parseTags(formData: FormData): string[] {
  const raw = (formData.get("tags") as string) ?? "";
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export async function createNote(
  _state: NoteFormState,
  formData: FormData
): Promise<NoteFormState> {
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

  revalidatePath("/library");
  redirect("/library", "replace");
}

export async function updateNote(
  noteId: string,
  _state: NoteFormState,
  formData: FormData
): Promise<NoteFormState> {
  const content = (formData.get("content") as string)?.trim();
  const tags = parseTags(formData);

  if (!content) {
    return { error: "Content is required." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("notes")
    .update({ content, tags })
    .eq("id", noteId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/library");
  redirect("/library", "replace");
}

export async function deleteNote(noteId: string) {
  const supabase = await createClient();
  await supabase.from("notes").delete().eq("id", noteId);
  revalidatePath("/library");
  redirect("/library", "replace");
}
