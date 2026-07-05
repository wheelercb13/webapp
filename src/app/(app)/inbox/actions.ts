"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type InboxFormState = { error?: string; success?: boolean } | undefined;

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
  await supabase.from("inbox_items").update({ resolved: true }).eq("id", id);
  revalidatePath("/inbox");
}

export async function deleteInboxItem(id: string) {
  const supabase = await createClient();
  await supabase.from("inbox_items").delete().eq("id", id);
  revalidatePath("/inbox");
}
