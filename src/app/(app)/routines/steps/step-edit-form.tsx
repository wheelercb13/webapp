"use client";

import { useActionState, useId } from "react";
import type { RoutineCadence, RoutineStep } from "@/lib/types";
import type { StepFormState } from "./actions";
import { WeekdayCheckboxes } from "@/components/weekday-checkboxes";

export function StepEditForm({
  action,
  cadence,
  initial,
  historyEntries,
}: {
  action: (state: StepFormState, formData: FormData) => Promise<StepFormState>;
  cadence: RoutineCadence;
  initial: Pick<RoutineStep, "label" | "weekdays">;
  historyEntries: { date: string; label: string; completed: boolean }[];
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const id = useId();

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-label`} className="text-[12px] text-muted">
          Label
        </label>
        <input
          id={`${id}-label`}
          name="label"
          required
          defaultValue={initial.label}
          className="rounded-lg border border-card-border bg-transparent px-3 py-2.5 text-[15px] text-foreground outline-none"
        />
      </div>

      {cadence === "weekly" && (
        <div className="flex flex-col gap-1">
          <label className="text-[12px] text-muted">Repeats on</label>
          <WeekdayCheckboxes name="weekday" defaultValues={initial.weekdays ?? [1]} />
        </div>
      )}

      <div>
        <h2 className="mb-1 text-[12px] font-semibold uppercase tracking-[0.06em] text-muted">
          Last 7 Days
        </h2>
        <p className="mb-3 text-[13px] text-muted">
          Forgot to check this off? Fix a past day here to save your streak.
        </p>
        <div className="flex flex-col">
          {historyEntries.map((entry) => (
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
