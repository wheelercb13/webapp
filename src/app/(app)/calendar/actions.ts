"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function disconnectCalendar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase.from("calendar_connections").delete().eq("user_id", user.id);
  }

  revalidatePath("/calendar");
  redirect("/calendar", "replace");
}
