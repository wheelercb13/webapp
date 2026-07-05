"use client";

import { useState } from "react";
import type { Task } from "@/lib/types";
import { updateTask, toggleTaskStatus, deleteTask } from "./actions";
import { TaskForm } from "./task-form";

export function TaskRow({ task }: { task: Task }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li className="rounded-lg border border-black/10 p-3 dark:border-white/10">
        <TaskForm
          action={updateTask.bind(null, task.domain_id, task.id)}
          initial={task}
          submitLabel="Save"
        />
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="mt-2 text-sm text-zinc-600 underline dark:text-zinc-400"
        >
          Cancel
        </button>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-black/10 px-4 py-3 dark:border-white/10">
      <div className="flex flex-col gap-0.5">
        <span
          className={`text-black dark:text-zinc-50 ${task.status === "done" ? "line-through opacity-60" : ""}`}
        >
          {task.title}
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {task.due_date ? `Due ${task.due_date}` : "No due date"} · {task.priority}
          {task.notes ? ` · ${task.notes}` : ""}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <form
          action={toggleTaskStatus.bind(null, task.domain_id, task.id, task.status)}
        >
          <button
            type="submit"
            className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-black hover:bg-black/[.04] dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/[.06]"
          >
            {task.status === "open" ? "Mark done" : "Reopen"}
          </button>
        </form>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-black hover:bg-black/[.04] dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/[.06]"
        >
          Edit
        </button>
        <form action={deleteTask.bind(null, task.domain_id, task.id)}>
          <button
            type="submit"
            className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-black hover:bg-black/[.04] dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/[.06]"
          >
            Delete
          </button>
        </form>
      </div>
    </li>
  );
}
