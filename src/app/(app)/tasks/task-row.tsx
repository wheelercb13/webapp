import Link from "next/link";
import type { Task } from "@/lib/types";
import { describeRepeatRule } from "@/lib/recurrence";
import { toggleTaskStatus } from "./actions";

export function TaskRow({ task }: { task: Task }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-black/10 px-4 py-3 dark:border-white/10">
      <Link
        href={`/domains/${task.domain_id}/tasks/${task.id}`}
        className="flex flex-1 flex-col gap-0.5"
      >
        <span
          className={`text-black dark:text-zinc-50 ${task.status === "done" ? "line-through opacity-60" : ""}`}
        >
          {task.title}
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {task.due_date ? `Due ${task.due_date}` : "No due date"} · {task.priority}
          {task.repeat_unit &&
            ` · ${describeRepeatRule({
              unit: task.repeat_unit,
              interval: task.repeat_interval,
              weekdays: task.repeat_weekdays,
            })}`}
        </span>
      </Link>
      {task.status === "open" && (
        <form action={toggleTaskStatus.bind(null, task.domain_id, task.id)}>
          <button
            type="submit"
            className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-black hover:bg-black/[.04] dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/[.06]"
          >
            Done
          </button>
        </form>
      )}
    </li>
  );
}
