"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Domain, DomainColor } from "@/lib/types";

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

  const { data: last } = (await supabase
    .from("domains")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle()) as { data: Pick<Domain, "sort_order"> | null };
  const sortOrder = (last?.sort_order ?? 0) + 1;

  const { error } = await supabase.from("domains").insert({ name, color, sort_order: sortOrder });

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

export async function reorderDomain(domainId: string, direction: "up" | "down") {
  const supabase = await createClient();
  const { data } = (await supabase
    .from("domains")
    .select("id, sort_order")
    .order("sort_order", { ascending: true })) as {
    data: Pick<Domain, "id" | "sort_order">[] | null;
  };

  const domains = data ?? [];
  const index = domains.findIndex((d) => d.id === domainId);
  const swapIndex = direction === "up" ? index - 1 : index + 1;

  if (index === -1 || swapIndex < 0 || swapIndex >= domains.length) {
    return;
  }

  const current = domains[index];
  const swap = domains[swapIndex];

  await Promise.all([
    supabase.from("domains").update({ sort_order: swap.sort_order }).eq("id", current.id),
    supabase.from("domains").update({ sort_order: current.sort_order }).eq("id", swap.id),
  ]);

  revalidatePath("/domains");
}
