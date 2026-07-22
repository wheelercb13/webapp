"use client";

import { useActionState, useId, useState } from "react";
import type { Task } from "@/lib/types";
import type { TaskFormState } from "./actions";
import { WeekdayCheckboxes } from "@/components/weekday-checkboxes";

// Yearly has no entry here on purpose -- the "Every" dropdown is hidden
// for it per the confirmed design, and the interval silently defaults to
// 1 server-side (parseRepeatFields already falls back to 1 when the
// repeatInterval field is absent from the submission).
const EVERY_OPTIONS: Partial<Record<string, number[]>> = {
  day: [1, 2, 3, 4, 5, 6, 7],
  week: [1, 2, 3, 4],
  month: Array.from({ length: 12 }, (_, i) => i + 1),
};

type TaskFormInitial = Pick<
  Task,
  | "title"
  | "notes"
  | "due_date"
  | "priority"
  | "repeat_unit"
  | "repeat_interval"
  | "repeat_weekdays"
  | "repeat_until"
>;

export function TaskForm({
  action,
  initial,
  submitLabel,
}: {
  action: (state: TaskFormState, formData: FormData) => Promise<TaskFormState>;
  initial?: Partial<TaskFormInitial>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const id = useId();

  const [repeatUnit, setRepeatUnit] = useState(initial?.repeat_unit ?? "");
  const [repeatEnds, setRepeatEnds] = useState(initial?.repeat_until ? "on" : "never");

  const everyOptions = EVERY_OPTIONS[repeatUnit];

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex items-end gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <label htmlFor={`${id}-title`} className="text-[12px] text-muted">
            Title
          </label>
          <input
            id={`${id}-title`}
            name="title"
            required
            defaultValue={initial?.title}
            className="rounded-lg border border-card-border bg-transparent px-3 py-2.5 text-[15px] text-foreground outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={`${id}-priority`} className="text-[12px] text-muted">
            Priority
          </label>
          <select
            id={`${id}-priority`}
            name="priority"
            defaultValue={initial?.priority ?? "med"}
            className="w-[82px] rounded-full border border-button-border bg-background px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-foreground outline-none transition-colors hover:bg-white/[.06]"
          >
            <option value="low">low</option>
            <option value="med">med</option>
            <option value="high">high</option>
          </select>
        </div>
      </div>

      <div className="flex items-end gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <label htmlFor={`${id}-notes`} className="text-[12px] text-muted">
            Notes
          </label>
          <input
            id={`${id}-notes`}
            name="notes"
            defaultValue={initial?.notes ?? undefined}
            className="rounded-lg border border-card-border bg-transparent px-3 py-2.5 text-[15px] text-foreground outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={`${id}-due_date`} className="text-[12px] text-muted">
            Due date
          </label>
          <input
            id={`${id}-due_date`}
            name="due_date"
            type="date"
            defaultValue={initial?.due_date ?? undefined}
            className="rounded-lg border border-card-border bg-transparent px-3 py-2.5 text-[15px] text-foreground outline-none"
          />
        </div>
      </div>

      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor={`${id}-repeatUnit`} className="text-[12px] text-muted">
            Repeat
          </label>
          <select
            id={`${id}-repeatUnit`}
            name="repeatUnit"
            value={repeatUnit}
            onChange={(e) => setRepeatUnit(e.target.value)}
            className="w-[150px] rounded-full border border-button-border bg-background px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-foreground outline-none transition-colors hover:bg-white/[.06]"
          >
            <option value="">Does not repeat</option>
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
        </div>

        {everyOptions && (
          <div className="flex flex-col gap-1">
            <label htmlFor={`${id}-repeatInterval`} className="text-[12px] text-muted">
              Every
            </label>
            <select
              id={`${id}-repeatInterval`}
              name="repeatInterval"
              defaultValue={initial?.repeat_interval ?? 1}
              className="w-[68px] rounded-full border border-button-border bg-background px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-foreground outline-none transition-colors hover:bg-white/[.06]"
            >
              {everyOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        )}

        {repeatUnit && (
          <div className="flex flex-col gap-1">
            <label htmlFor={`${id}-repeatEnds`} className="text-[12px] text-muted">
              Ends
            </label>
            <select
              id={`${id}-repeatEnds`}
              name="repeatEnds"
              value={repeatEnds}
              onChange={(e) => setRepeatEnds(e.target.value)}
              className="w-[100px] rounded-full border border-button-border bg-background px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-foreground outline-none transition-colors hover:bg-white/[.06]"
            >
              <option value="never">Never</option>
              <option value="on">On date</option>
            </select>
          </div>
        )}
      </div>

      {repeatUnit === "week" && (
        <div className="flex flex-col gap-1">
          <label className="text-[12px] text-muted">On</label>
          <WeekdayCheckboxes name="repeatWeekday" defaultValues={initial?.repeat_weekdays ?? []} />
        </div>
      )}

      <div className="flex items-end gap-4">
        {repeatUnit && repeatEnds === "on" && (
          <div className="flex flex-col gap-1">
            <label htmlFor={`${id}-repeatUntil`} className="text-[12px] text-muted">
              End date
            </label>
            <input
              id={`${id}-repeatUntil`}
              name="repeatUntil"
              type="date"
              defaultValue={initial?.repeat_until ?? undefined}
              className="rounded-lg border border-card-border bg-transparent px-3 py-2.5 text-[15px] text-foreground outline-none"
            />
          </div>
        )}
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center ml-auto rounded-full bg-accent px-5 py-2.5 text-[12px] font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
      </div>
      {state?.error && <p className="text-[13px] text-delete-text">{state.error}</p>}
    </form>
  );
}
