import { createClient } from "@/lib/supabase/server";
import type { Task, TaskPriority, TaskWithDomain } from "@/lib/types";
import { DOMAIN_COLOR_CLASSES } from "@/lib/colors";
import { todayString } from "@/lib/date";
import { toggleTaskStatus } from "@/app/(app)/tasks/actions";

type TaskRow = Task & { domains: { name: string; color: TaskWithDomain["domain_color"] } | null };

const PRIORITY_WEIGHT: Record<TaskPriority, number> = { high: 0, med: 1, low: 2 };

export default async function TodayPage() {
  const supabase = await createClient();
  const today = todayString();

  const { data } = (await supabase
    .from("tasks")
    .select("*, domains(name, color)")
    .eq("status", "open")
    .or(`due_date.is.null,due_date.lte.${today}`)) as { data: TaskRow[] | null };

  const tasks = (data ?? [])
    .filter((t) => t.domains !== null)
    .map((t) => ({
      ...t,
      domain_name: t.domains!.name,
      domain_color: t.domains!.color,
    })) as TaskWithDomain[];

  tasks.sort((a, b) => {
    const aDue = a.due_date ?? "9999-12-31";
    const bDue = b.due_date ?? "9999-12-31";
    if (aDue !== bDue) return aDue < bDue ? -1 : 1;
    if (a.priority !== b.priority) {
      return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
    }
    return a.created_at < b.created_at ? -1 : a.created_at > b.created_at ? 1 : 0;
  });

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-50">Today</h1>

      <ul className="flex flex-col gap-2">
        {tasks.map((task) => {
          const overdue = task.due_date !== null && task.due_date < today;
          return (
            <li
              key={task.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-black/10 px-4 py-3 dark:border-white/10"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${DOMAIN_COLOR_CLASSES[task.domain_color]}`}
                />
                <div className="flex flex-col gap-0.5">
                  <span className="text-black dark:text-zinc-50">{task.title}</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {task.domain_name} ·{" "}
                    {task.due_date
                      ? overdue
                        ? `Overdue (${task.due_date})`
                        : `Due ${task.due_date}`
                      : "No due date"}{" "}
                    · {task.priority}
                  </span>
                </div>
              </div>
              <form
                action={toggleTaskStatus.bind(null, task.domain_id, task.id, task.status)}
              >
                <button
                  type="submit"
                  className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-black hover:bg-black/[.04] dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/[.06]"
                >
                  Mark done
                </button>
              </form>
            </li>
          );
        })}
        {tasks.length === 0 && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Nothing due right now.
          </p>
        )}
      </ul>
    </div>
  );
}
