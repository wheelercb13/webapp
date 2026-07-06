"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { FunctionAccessLevel } from "@/lib/types";

export async function updateFunctionAccess(
  key: string,
  accessLevel: FunctionAccessLevel
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.app_metadata?.is_admin) {
    return;
  }

  await supabase.from("functions").update({ access_level: accessLevel }).eq("key", key);

  revalidatePath("/settings/access");
  revalidatePath("/", "layout");
}
