"use client";

import { useActionState, useId } from "react";
import type { RoutineStep } from "@/lib/types";
import type { StepFormState } from "./actions";

export function StepForm({
  action,
  initial,
  submitLabel,
}: {
  action: (state: StepFormState, formData: FormData) => Promise<StepFormState>;
  initial?: Pick<RoutineStep, "label">;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const id = useId();

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-label`} className="text-sm text-zinc-600 dark:text-zinc-400">
          Label
        </label>
        <input
          id={`${id}-label`}
          name="label"
          required
          defaultValue={initial?.label}
          className="rounded border border-black/10 bg-transparent px-3 py-2 text-black dark:border-white/10 dark:text-zinc-50"
        />
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
