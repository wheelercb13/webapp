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
    <div className="mx-auto flex w-full max-w-[468px] flex-col px-[22px]">
      <div className="pb-[26px] pt-9">
        <h1 className="font-serif text-[34px] font-medium leading-[1.02] tracking-[-0.01em] text-foreground-display">
          {idea.title}
        </h1>
      </div>

      <div className="mb-[26px] flex flex-col gap-2 rounded-xl border border-card-border p-4 text-[14px] text-muted">
        <p>Stage: {idea.stage}</p>
        <p>Priority: {idea.priority}</p>
        {idea.tags.length > 0 && <p>Tags: {idea.tags.join(", ")}</p>}
        {idea.notes && <p>Notes: {idea.notes}</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/ideas/${idea.id}/edit`}
          className="rounded-full border border-button-border px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-foreground transition-colors hover:bg-white/[.06]"
        >
          Edit
        </Link>
        {linkedTask ? (
          <Link
            href={`/domains/${linkedTask.domain_id}/tasks/${linkedTask.id}`}
            className="rounded-full bg-accent px-4 py-2 text-[12px] font-semibold text-background transition-opacity hover:opacity-90"
          >
            View linked task
          </Link>
        ) : (
          <Link
            href={`/ideas/${idea.id}/send`}
            className="rounded-full bg-accent px-4 py-2 text-[12px] font-semibold text-background transition-opacity hover:opacity-90"
          >
            Send to Task
          </Link>
        )}
      </div>
    </div>
  );
}
