"use client";

import { useActionState, useId, useState } from "react";
import type { Task } from "@/lib/types";
import type { TaskFormState } from "./actions";

const WEEKDAYS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

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
          className="rounded border border-black/10 bg-white px-3 py-2 text-black dark:border-white/10 dark:bg-black dark:text-zinc-50"
        >
          <option value="low">low</option>
          <option value="med">med</option>
          <option value="high">high</option>
        </select>
      </div>

      <div className="flex w-full flex-col gap-3 border-t border-black/10 pt-3 dark:border-white/10">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor={`${id}-repeatUnit`} className="text-sm text-zinc-600 dark:text-zinc-400">
              Repeat
            </label>
            <select
              id={`${id}-repeatUnit`}
              name="repeatUnit"
              value={repeatUnit}
              onChange={(e) => setRepeatUnit(e.target.value)}
              className="rounded border border-black/10 bg-white px-3 py-2 text-black dark:border-white/10 dark:bg-black dark:text-zinc-50"
            >
              <option value="">Does not repeat</option>
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
              <option value="year">Yearly</option>
            </select>
          </div>

          {repeatUnit && (
            <div className="flex flex-col gap-1">
              <label htmlFor={`${id}-repeatInterval`} className="text-sm text-zinc-600 dark:text-zinc-400">
                Every
              </label>
              <input
                id={`${id}-repeatInterval`}
                name="repeatInterval"
                type="number"
                min={1}
                defaultValue={initial?.repeat_interval ?? 1}
                className="w-20 rounded border border-black/10 bg-transparent px-3 py-2 text-black dark:border-white/10 dark:text-zinc-50"
              />
            </div>
          )}
        </div>

        {repeatUnit === "week" && (
          <div className="flex flex-col gap-1">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">On</span>
            <div className="flex flex-wrap gap-3">
              {WEEKDAYS.map((day) => (
                <label key={day.value} className="flex items-center gap-1 text-sm text-black dark:text-zinc-50">
                  <input
                    type="checkbox"
                    name="repeatWeekday"
                    value={day.value}
                    defaultChecked={initial?.repeat_weekdays?.includes(day.value)}
                    className="h-4 w-4"
                  />
                  {day.label}
                </label>
              ))}
            </div>
          </div>
        )}

        {repeatUnit && (
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor={`${id}-repeatEnds`} className="text-sm text-zinc-600 dark:text-zinc-400">
                Ends
              </label>
              <select
                id={`${id}-repeatEnds`}
                name="repeatEnds"
                value={repeatEnds}
                onChange={(e) => setRepeatEnds(e.target.value)}
                className="rounded border border-black/10 bg-white px-3 py-2 text-black dark:border-white/10 dark:bg-black dark:text-zinc-50"
              >
                <option value="never">Never</option>
                <option value="on">On date</option>
              </select>
            </div>
            {repeatEnds === "on" && (
              <div className="flex flex-col gap-1">
                <label htmlFor={`${id}-repeatUntil`} className="text-sm text-zinc-600 dark:text-zinc-400">
                  End date
                </label>
                <input
                  id={`${id}-repeatUntil`}
                  name="repeatUntil"
                  type="date"
                  defaultValue={initial?.repeat_until ?? undefined}
                  className="rounded border border-black/10 bg-transparent px-3 py-2 text-black dark:border-white/10 dark:text-zinc-50"
                />
              </div>
            )}
          </div>
        )}
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
