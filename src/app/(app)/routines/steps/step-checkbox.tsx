"use client";

import { useTransition } from "react";
import { toggleStepCompletion } from "./actions";
import type { RoutineCadence } from "@/lib/types";

export function StepCheckbox({
  routineId,
  stepId,
  cadence,
  label,
  checked,
  streak,
}: {
  routineId: string;
  stepId: string;
  cadence: RoutineCadence;
  label: string;
  checked: boolean;
  streak: number;
}) {
  const [isPending, startTransition] = useTransition();

  function handleChange() {
    startTransition(() => {
      toggleStepCompletion(routineId, stepId, cadence, checked);
    });
  }

  return (
    <label className="flex items-center justify-between gap-3 rounded-lg border border-black/10 px-4 py-3 dark:border-white/10">
      <span className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={checked}
          disabled={isPending}
          onChange={handleChange}
          className="h-4 w-4"
        />
        <span
          className={`text-black dark:text-zinc-50 ${checked ? "line-through opacity-60" : ""}`}
        >
          {label}
        </span>
      </span>
      <span className="text-xs text-zinc-500 dark:text-zinc-400">
        {streak > 0 ? `🔥 ${streak}` : "—"}
      </span>
    </label>
  );
}
