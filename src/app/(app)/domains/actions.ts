"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { DomainColor } from "@/lib/types";

export type DomainFormState = { error?: string } | undefined;

export async function createDomain(
  _state: DomainFormState,
  formData: FormData
): Promise<DomainFormState> {
  const name = (formData.get("name") as string)?.trim();
  const color = formData.get("color") as DomainColor;

  if (!name) {
    return { error: "Name is required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("domains").insert({ name, color });

  if (error) {
    if (error.code === "23505") {
      return { error: "A domain with that name already exists." };
    }
    return { error: error.message };
  }

  revalidatePath("/domains");
  redirect("/domains", "replace");
}

export async function updateDomain(
  domainId: string,
  _state: DomainFormState,
  formData: FormData
): Promise<DomainFormState> {
  const name = (formData.get("name") as string)?.trim();
  const color = formData.get("color") as DomainColor;

  if (!name) {
    return { error: "Name is required." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("domains")
    .update({ name, color })
    .eq("id", domainId);

  if (error) {
    if (error.code === "23505") {
      return { error: "A domain with that name already exists." };
    }
    return { error: error.message };
  }

  revalidatePath("/domains");
  revalidatePath(`/domains/${domainId}`);
  revalidatePath("/");
  redirect(`/domains/${domainId}`, "replace");
}

export async function deleteDomain(domainId: string) {
  const supabase = await createClient();
  await supabase.from("domains").delete().eq("id", domainId);
  revalidatePath("/domains");
  revalidatePath("/");
  redirect("/domains", "replace");
}
