import Link from "next/link";
import type { Task } from "@/lib/types";
import { describeRepeatRule } from "@/lib/recurrence";
import { toggleTaskStatus } from "./actions";

export function TaskRow({ task }: { task: Task }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-[10px] border border-card-border px-[15px] py-3.5">
      <Link href={`/domains/${task.domain_id}/tasks/${task.id}`} className="min-w-0 flex-1">
        <div
          className={`mb-[3px] text-[15px] ${
            task.status === "done" ? "text-disabled-line line-through" : "text-foreground"
          }`}
        >
          {task.title}
        </div>
        <div className="text-[12px] leading-[1.4] text-muted">
          {task.due_date ? `Due ${task.due_date}` : "No due date"} · {task.priority}
          {task.repeat_unit &&
            ` · ${describeRepeatRule({
              unit: task.repeat_unit,
              interval: task.repeat_interval,
              weekdays: task.repeat_weekdays,
            })}`}
        </div>
      </Link>
      {task.status === "open" && (
        <form action={toggleTaskStatus.bind(null, task.domain_id, task.id)}>
          <button
            type="submit"
            className="shrink-0 rounded-full border border-button-border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-foreground transition-colors hover:bg-white/[.06]"
          >
            Done
          </button>
        </form>
      )}
    </div>
  );
}
