"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updatePageVisibility(pageKey: string, visible: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from("page_visibility")
    .upsert(
      { user_id: user.id, page_key: pageKey, visible },
      { onConflict: "user_id,page_key" }
    );

  revalidatePath("/settings/page-view");
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/inbox");
  revalidatePath("/ideas");
}
