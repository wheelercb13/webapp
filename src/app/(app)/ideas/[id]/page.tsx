import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Idea, Task } from "@/lib/types";

export default async function IdeaDetailPage({
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

  let linkedTask: Task | null = null;
  if (idea.linked_task_id) {
    const { data } = (await supabase
      .from("tasks")
      .select("*")
      .eq("id", idea.linked_task_id)
      .single()) as { data: Task | null };
    linkedTask = data;
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
        {idea.title}
      </h1>

      <div className="flex flex-col gap-2 rounded-lg border border-black/10 p-4 text-sm text-zinc-600 dark:border-white/10 dark:text-zinc-400">
        <p>Stage: {idea.stage}</p>
        <p>Priority: {idea.priority}</p>
        {idea.tags.length > 0 && <p>Tags: {idea.tags.join(", ")}</p>}
        {idea.notes && <p>Notes: {idea.notes}</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/ideas/${idea.id}/edit`}
          className="rounded-full border border-black/10 px-4 py-1.5 text-sm font-medium text-black hover:bg-black/[.04] dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/[.06]"
        >
          Edit
        </Link>
        {linkedTask ? (
          <Link
            href={`/domains/${linkedTask.domain_id}/tasks/${linkedTask.id}`}
            className="rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            View linked task
          </Link>
        ) : (
          <Link
            href={`/ideas/${idea.id}/send`}
            className="rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            Send to Task
          </Link>
        )}
      </div>
    </div>
  );
}
