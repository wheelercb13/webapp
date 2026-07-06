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
  allowUncheck = true,
  bordered = true,
}: {
  routineId: string;
  stepId: string;
  cadence: RoutineCadence;
  label: string;
  checked: boolean;
  streak: number;
  allowUncheck?: boolean;
  bordered?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleChange() {
    startTransition(() => {
      toggleStepCompletion(routineId, stepId, cadence, checked);
    });
  }

  const locked = checked && !allowUncheck;

  return (
    <label
      className={`flex cursor-pointer items-center gap-3.5 py-[13px] ${bordered ? "border-b border-hairline" : ""}`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={isPending || locked}
        onChange={handleChange}
        className="sr-only"
      />
      <span
        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px] text-[11px] font-bold ${
          checked
            ? "border-accent bg-accent text-background"
            : "border-[rgba(236,231,221,0.26)] bg-transparent"
        }`}
      >
        {checked && "✓"}
      </span>
      <span
        className={`flex-1 text-[15px] ${
          checked ? "text-disabled-line line-through" : "text-foreground"
        }`}
      >
        {label}
      </span>
      {streak > 0 ? (
        <span className="whitespace-nowrap text-[12.5px] text-accent">🔥 {streak}</span>
      ) : (
        <span className="text-[13px] text-[#4f4a42]">—</span>
      )}
    </label>
  );
}
