"use client";

import { useActionState, useEffect, useId } from "react";
import type { Task } from "@/lib/types";
import type { TaskFormState } from "./actions";

export function TaskForm({
  action,
  initial,
  submitLabel,
  onSuccess,
}: {
  action: (state: TaskFormState, formData: FormData) => Promise<TaskFormState>;
  initial?: Pick<Task, "title" | "notes" | "due_date" | "priority">;
  submitLabel: string;
  onSuccess?: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const id = useId();

  useEffect(() => {
    if (state?.success) {
      onSuccess?.();
    }
  }, [state, onSuccess]);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-title`} className="text-sm text-zinc-600 dark:text-zinc-400">
          Title
        </label>
        <input
          id={`${id}-title`}
          name="title"
          required
          defaultValue={initial?.title}
          className="rounded border border-black/10 bg-transparent px-3 py-2 text-black dark:border-white/10 dark:text-zinc-50"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-notes`} className="text-sm text-zinc-600 dark:text-zinc-400">
          Notes
        </label>
        <input
          id={`${id}-notes`}
          name="notes"
          defaultValue={initial?.notes ?? undefined}
          className="rounded border border-black/10 bg-transparent px-3 py-2 text-black dark:border-white/10 dark:text-zinc-50"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-due_date`} className="text-sm text-zinc-600 dark:text-zinc-400">
          Due date
        </label>
        <input
          id={`${id}-due_date`}
          name="due_date"
          type="date"
          defaultValue={initial?.due_date ?? undefined}
          className="rounded border border-black/10 bg-transparent px-3 py-2 text-black dark:border-white/10 dark:text-zinc-50"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-priority`} className="text-sm text-zinc-600 dark:text-zinc-400">
          Priority
        </label>
        <select
          id={`${id}-priority`}
          name="priority"
          defaultValue={initial?.priority ?? "med"}
          className="rounded border border-black/10 bg-transparent px-3 py-2 text-black dark:border-white/10 dark:text-zinc-50"
        >
          <option value="low">low</option>
          <option value="med">med</option>
          <option value="high">high</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
      {state?.error && (
        <p className="w-full text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
    </form>
  );
}
