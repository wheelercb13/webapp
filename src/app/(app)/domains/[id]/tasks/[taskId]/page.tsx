import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Task } from "@/lib/types";
import { describeRepeatRule } from "@/lib/recurrence";
import { formatDateDisplay } from "@/lib/date";
import { toggleTaskStatus, deleteTask } from "@/app/(app)/tasks/actions";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string; taskId: string }>;
}) {
  const { id: domainId, taskId } = await params;
  const supabase = await createClient();

  const { data: task } = (await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .eq("domain_id", domainId)
    .single()) as { data: Task | null };

  if (!task) {
    redirect(`/domains/${domainId}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-[468px] flex-col px-[22px]">
      <div className="pb-[26px] pt-9">
        <h1
          className={`font-serif text-[34px] font-medium leading-[1.02] tracking-[-0.01em] text-foreground-display ${
            task.status === "done" ? "text-disabled-line line-through" : ""
          }`}
        >
          {task.title}
        </h1>
      </div>

      <div className="mb-[26px] flex flex-col gap-2 rounded-xl border border-card-border p-4 text-[14px] text-muted">
        <p>{task.due_date ? `Due ${formatDateDisplay(task.due_date)}` : "No due date"}</p>
        <p>Priority: {task.priority}</p>
        {task.repeat_unit && (
          <p>
            Repeats:{" "}
            {describeRepeatRule({
              unit: task.repeat_unit,
              interval: task.repeat_interval,
              weekdays: task.repeat_weekdays,
            })}
            {task.repeat_until ? ` until ${formatDateDisplay(task.repeat_until)}` : " (never ends)"}
          </p>
        )}
        {task.notes && <p>Notes: {task.notes}</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        <form action={toggleTaskStatus.bind(null, domainId, task.id)}>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full border border-button-border px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-foreground transition-colors hover:bg-white/[.06]"
          >
            {task.status === "open" ? "Mark done" : "Reopen"}
          </button>
        </form>
        <Link
          href={`/domains/${domainId}/tasks/${task.id}/edit`}
          className="inline-flex items-center justify-center rounded-full border border-button-border px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-foreground transition-colors hover:bg-white/[.06]"
        >
          Edit
        </Link>
        <form action={deleteTask.bind(null, domainId, task.id)}>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full border border-delete-border px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-delete-text transition-colors hover:bg-white/[.06]"
          >
            Delete
          </button>
        </form>
      </div>
    </div>
  );
}
