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
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex items-end gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <label htmlFor={`${id}-name`} className="text-[12px] text-muted">
            Name
          </label>
          <input
            id={`${id}-name`}
            name="name"
            required
            defaultValue={initial?.name}
            className="rounded-lg border border-card-border bg-transparent px-3 py-2.5 text-[15px] text-foreground outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={`${id}-cadence`} className="text-[12px] text-muted">
            Cadence
          </label>
          <select
            id={`${id}-cadence`}
            name="cadence"
            defaultValue={initial?.cadence ?? "daily"}
            className="rounded-full border border-button-border bg-background px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-foreground outline-none transition-colors hover:bg-white/[.06]"
          >
            <option value="daily">daily</option>
            <option value="weekly">weekly</option>
          </select>
        </div>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="self-end rounded-full bg-accent px-5 py-2.5 text-[12px] font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
      {state?.error && <p className="text-[13px] text-delete-text">{state.error}</p>}
    </form>
  );
}
