import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Domain, Task } from "@/lib/types";
import { DOMAIN_COLOR_CLASSES } from "@/lib/colors";
import { completedTaskCutoffIso } from "@/lib/task-retention";
import { TaskRow } from "@/app/(app)/tasks/task-row";
import { reorderTask } from "@/app/(app)/tasks/actions";

export default async function DomainDetailPage({
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

  await supabase
    .from("tasks")
    .delete()
    .eq("domain_id", id)
    .eq("status", "done")
    .lt("updated_at", completedTaskCutoffIso());

  const { data: tasksData } = (await supabase
    .from("tasks")
    .select("*")
    .eq("domain_id", id)
    .order("sort_order", { ascending: true })) as { data: Task[] | null };

  const tasks = tasksData ?? [];
  const activeTasks = tasks.filter((t) => t.status === "open");
  const completedTasks = tasks.filter((t) => t.status === "done");

  return (
    <div className="mx-auto flex w-full max-w-[468px] flex-col px-[22px]">
      <div className="flex items-end justify-between gap-3 pb-[26px] pt-9">
        <h1 className="flex items-center gap-3 font-serif text-[34px] font-medium leading-[1.02] tracking-[-0.01em] text-foreground-display">
          <span
            className={`h-3 w-3 shrink-0 rounded-full ${DOMAIN_COLOR_CLASSES[domain.color]}`}
          />
          {domain.name}
        </h1>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/domains/${domain.id}/edit`}
            className="rounded-full border border-button-border px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-foreground transition-colors hover:bg-white/[.06]"
          >
            Edit
          </Link>
          <Link
            href={`/domains/${domain.id}/tasks/new`}
            className="rounded-full bg-accent px-4 py-2 text-[12px] font-semibold text-background transition-opacity hover:opacity-90"
          >
            Create New Task
          </Link>
        </div>
      </div>

      <div className="mb-[26px] flex flex-col gap-2">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
          Active
        </h2>
        <div className="flex flex-col gap-2.5">
          {activeTasks.map((task, index) => (
            <div key={task.id} className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <TaskRow task={task} />
              </div>
              <div className="flex shrink-0 flex-col gap-px">
                <form action={reorderTask.bind(null, id, task.id, "up")}>
                  <button
                    type="submit"
                    disabled={index === 0}
                    aria-label="Move up"
                    className="flex h-[13px] w-6 items-center justify-center text-[9px] leading-none text-faint hover:text-foreground disabled:opacity-30"
                  >
                    ▲
                  </button>
                </form>
                <form action={reorderTask.bind(null, id, task.id, "down")}>
                  <button
                    type="submit"
                    disabled={index === activeTasks.length - 1}
                    aria-label="Move down"
                    className="flex h-[13px] w-6 items-center justify-center text-[9px] leading-none text-faint hover:text-foreground disabled:opacity-30"
                  >
                    ▼
                  </button>
                </form>
              </div>
            </div>
          ))}
          {activeTasks.length === 0 && (
            <p className="text-[14px] text-muted">No active tasks in this domain.</p>
          )}
        </div>
      </div>

      {completedTasks.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
            Completed
          </h2>
          <div className="flex flex-col gap-2.5">
            {completedTasks.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
