import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Idea } from "@/lib/types";
import { updateIdea, deleteIdea } from "../../actions";
import { IdeaForm } from "../../idea-form";

export default async function EditIdeaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: idea } = (await supabase
    .from("ideas")
    .select("*")
    .eq("id", id)
    .single()) as { data: Idea | null };

  if (!idea) {
    redirect("/ideas");
  }

  return (
    <div className="mx-auto flex w-full max-w-[468px] flex-col px-[22px]">
      <div className="pb-[26px] pt-9">
        <h1 className="font-serif text-[34px] font-medium leading-[1.02] tracking-[-0.01em] text-foreground-display">
          Edit Idea
        </h1>
      </div>
      <div className="mb-4 rounded-xl border border-card-border p-4">
        <IdeaForm action={updateIdea.bind(null, idea.id)} initial={idea} submitLabel="Save" />
      </div>
      <form action={deleteIdea.bind(null, idea.id)}>
        <button
          type="submit"
          className="rounded-full border border-delete-border px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-delete-text transition-colors hover:bg-white/[.06]"
        >
          Delete
        </button>
      </form>
    </div>
  );
}
