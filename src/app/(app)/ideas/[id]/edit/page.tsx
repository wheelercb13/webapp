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
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
        Edit Idea
      </h1>
      <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
        <IdeaForm
          action={updateIdea.bind(null, idea.id)}
          initial={idea}
          submitLabel="Save"
        />
      </div>
      <form action={deleteIdea.bind(null, idea.id)}>
        <button
          type="submit"
          className="rounded-full border border-red-600/30 px-4 py-1.5 text-sm font-medium text-red-600 hover:bg-red-600/10 dark:text-red-400"
        >
          Delete idea
        </button>
      </form>
    </div>
  );
}
