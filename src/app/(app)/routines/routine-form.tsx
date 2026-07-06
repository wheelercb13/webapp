"use client";

import { useActionState, useId } from "react";
import type { Routine } from "@/lib/types";
import type { RoutineFormState } from "./actions";

export function RoutineForm({
  action,
  initial,
  submitLabel,
}: {
  action: (state: RoutineFormState, formData: FormData) => Promise<RoutineFormState>;
  initial?: Pick<Routine, "name" | "cadence">;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const id = useId();

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-name`} className="text-sm text-zinc-600 dark:text-zinc-400">
          Name
        </label>
        <input
          id={`${id}-name`}
          name="name"
          required
          defaultValue={initial?.name}
          className="rounded border border-black/10 bg-transparent px-3 py-2 text-black dark:border-white/10 dark:text-zinc-50"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-cadence`} className="text-sm text-zinc-600 dark:text-zinc-400">
          Cadence
        </label>
        <select
          id={`${id}-cadence`}
          name="cadence"
          defaultValue={initial?.cadence ?? "daily"}
          className="rounded border border-black/10 bg-background px-3 py-2 text-black dark:border-white/10 dark:text-zinc-50"
        >
          <option value="daily">daily</option>
          <option value="weekly">weekly</option>
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
