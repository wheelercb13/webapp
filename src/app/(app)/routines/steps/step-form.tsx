"use client";

import { useActionState, useId } from "react";
import type { RoutineCadence, RoutineStep } from "@/lib/types";
import type { StepFormState } from "./actions";

const WEEKDAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export function StepForm({
  action,
  cadence,
  initial,
  submitLabel,
}: {
  action: (state: StepFormState, formData: FormData) => Promise<StepFormState>;
  cadence: RoutineCadence;
  initial?: Pick<RoutineStep, "label" | "weekday">;
  submitLabel: string;
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
          defaultValue={initial?.label}
          className="rounded-lg border border-card-border bg-transparent px-3 py-2.5 text-[15px] text-foreground outline-none"
        />
      </div>

      {cadence === "weekly" && (
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor={`${id}-weekday`} className="text-[12px] text-muted">
              Repeats on
            </label>
            <select
              id={`${id}-weekday`}
              name="weekday"
              defaultValue={initial?.weekday ?? 1}
              className="w-[120px] rounded-full border border-button-border bg-background px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-foreground outline-none transition-colors hover:bg-white/[.06]"
            >
              {WEEKDAYS.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-[12px] font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Saving…" : submitLabel}
          </button>
        </div>
      )}

      {cadence !== "weekly" && (
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center self-end rounded-full bg-accent px-5 py-2.5 text-[12px] font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
      )}
      {state?.error && <p className="text-[13px] text-delete-text">{state.error}</p>}
    </form>
  );
}
