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
    <div className="mx-auto flex w-full max-w-[468px] flex-col px-[22px]">
      <div className="pb-[26px] pt-9">
        <h1 className="font-serif text-[34px] font-medium leading-[1.02] tracking-[-0.01em] text-foreground-display">
          Send &quot;{idea.title}&quot; to a Task
        </h1>
      </div>
      <div className="rounded-xl border border-card-border p-4">
        <SendToTaskForm action={sendIdeaToTask.bind(null, idea.id)} domains={domains} />
      </div>
    </div>
  );
}
