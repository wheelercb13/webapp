import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Task } from "@/lib/types";
import { describeRepeatRule } from "@/lib/recurrence";
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
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <h1
        className={`text-xl font-semibold text-black dark:text-zinc-50 ${task.status === "done" ? "line-through opacity-60" : ""}`}
      >
        {task.title}
      </h1>

      <div className="flex flex-col gap-2 rounded-lg border border-black/10 p-4 text-sm text-zinc-600 dark:border-white/10 dark:text-zinc-400">
        <p>{task.due_date ? `Due ${task.due_date}` : "No due date"}</p>
        <p>Priority: {task.priority}</p>
        {task.repeat_unit && (
          <p>
            Repeats:{" "}
            {describeRepeatRule({
              unit: task.repeat_unit,
              interval: task.repeat_interval,
              weekdays: task.repeat_weekdays,
            })}
            {task.repeat_until ? ` until ${task.repeat_until}` : " (never ends)"}
          </p>
        )}
        {task.notes && <p>Notes: {task.notes}</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        <form action={toggleTaskStatus.bind(null, domainId, task.id)}>
          <button
            type="submit"
            className="rounded-full border border-black/10 px-4 py-1.5 text-sm font-medium text-black hover:bg-black/[.04] dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/[.06]"
          >
            {task.status === "open" ? "Mark done" : "Reopen"}
          </button>
        </form>
        <Link
          href={`/domains/${domainId}/tasks/${task.id}/edit`}
          className="rounded-full border border-black/10 px-4 py-1.5 text-sm font-medium text-black hover:bg-black/[.04] dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/[.06]"
        >
          Edit
        </Link>
        <form action={deleteTask.bind(null, domainId, task.id)}>
          <button
            type="submit"
            className="rounded-full border border-red-600/30 px-4 py-1.5 text-sm font-medium text-red-600 hover:bg-red-600/10 dark:text-red-400"
          >
            Delete
          </button>
        </form>
      </div>
    </div>
  );
}
