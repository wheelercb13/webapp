import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Domain } from "@/lib/types";
import { updateDomain, deleteDomain } from "../../actions";
import { DomainForm } from "../../domain-form";

export default async function EditDomainPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: domain } = (await supabase
    .from("domains")
    .select("*")
    .eq("id", id)
    .single()) as { data: Domain | null };

  if (!domain) {
    redirect("/domains");
  }

  return (
    <div className="mx-auto flex w-full max-w-[468px] flex-col px-[22px]">
      <div className="pb-[26px] pt-9">
        <h1 className="font-serif text-[34px] font-medium leading-[1.02] tracking-[-0.01em] text-foreground-display">
          Edit Domain
        </h1>
      </div>
      <div className="mb-4 rounded-xl border border-card-border p-4">
        <DomainForm
          action={updateDomain.bind(null, domain.id)}
          initial={domain}
          submitLabel="Save"
        />
      </div>
      <form action={deleteDomain.bind(null, domain.id)}>
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full border border-delete-border px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-delete-text transition-colors hover:bg-white/[.06]"
        >
          Delete
        </button>
      </form>
    </div>
  );
}
