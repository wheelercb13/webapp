import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Domain, Idea } from "@/lib/types";
import { sendIdeaToTask } from "../../actions";
import { SendToTaskForm } from "./send-to-task-form";

export default async function SendIdeaToTaskPage({
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

  if (idea.linked_task_id) {
    redirect(`/ideas/${id}`);
  }

  const { data: domainsData } = (await supabase
    .from("domains")
    .select("*")
    .order("name")) as { data: Domain[] | null };

  const domains = domainsData ?? [];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
        Send &quot;{idea.title}&quot; to a Task
      </h1>
      <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
        <SendToTaskForm action={sendIdeaToTask.bind(null, idea.id)} domains={domains} />
      </div>
    </div>
  );
}
