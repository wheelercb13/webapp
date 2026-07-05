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
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
        Edit Domain
      </h1>
      <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
        <DomainForm
          action={updateDomain.bind(null, domain.id)}
          initial={domain}
          submitLabel="Save"
        />
      </div>
      <form action={deleteDomain.bind(null, domain.id)}>
        <button
          type="submit"
          className="rounded-full border border-red-600/30 px-4 py-1.5 text-sm font-medium text-red-600 hover:bg-red-600/10 dark:text-red-400"
        >
          Delete domain
        </button>
      </form>
    </div>
  );
}
