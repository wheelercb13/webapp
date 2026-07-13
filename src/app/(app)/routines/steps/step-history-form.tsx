"use client";

import { useActionState } from "react";
import type { StepHistoryFormState } from "./actions";

export function StepHistoryForm({
  action,
  entries,
}: {
  action: (
    state: StepHistoryFormState,
    formData: FormData
  ) => Promise<StepHistoryFormState>;
  entries: { date: string; label: string; completed: boolean }[];
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col">
        {entries.map((entry) => (
          <label
            key={entry.date}
            className="flex items-center justify-between gap-3 border-b border-hairline py-[13px] last:border-b-0"
          >
            <span className="text-[15px] text-foreground">{entry.label}</span>
            <input
              type="checkbox"
              name={`cycle_${entry.date}`}
              defaultChecked={entry.completed}
              className="h-4 w-4"
            />
          </label>
        ))}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center self-end rounded-full bg-accent px-5 py-2.5 text-[12px] font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save"}
      </button>
      {state?.error && <p className="text-[13px] text-delete-text">{state.error}</p>}
    </form>
  );
}
