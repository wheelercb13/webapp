"use client";

import { useTransition } from "react";
import { toggleStepCompletion } from "./actions";
import { WEEKDAYS } from "@/components/weekday-checkboxes";

export function StepWeekdayChips({
  routineId,
  stepId,
  label,
  weekdays,
  checkedByWeekday,
  streak,
  bordered = true,
}: {
  routineId: string;
  stepId: string;
  label: string;
  weekdays: number[];
  checkedByWeekday: Record<number, boolean>;
  streak: number | null;
  bordered?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleToggle(weekday: number, currentlyChecked: boolean) {
    startTransition(() => {
      toggleStepCompletion(routineId, stepId, "weekly", weekday, currentlyChecked);
    });
  }

  return (
    <div
      className={`flex flex-1 items-center gap-3 py-[13px] ${bordered ? "border-b border-hairline" : ""}`}
    >
      <span className="flex-1 text-[15px] text-foreground">{label}</span>
      <div className="flex shrink-0 gap-1">
        {weekdays.map((wd) => {
          const checked = checkedByWeekday[wd] ?? false;
          return (
            <button
              key={wd}
              type="button"
              disabled={isPending}
              onClick={() => handleToggle(wd, checked)}
              title={WEEKDAYS[wd].label}
              className={`flex h-6 w-6 items-center justify-center rounded-[5px] border-[1.5px] text-[10px] font-bold transition-colors ${
                checked
                  ? "border-accent bg-accent text-background"
                  : "border-[rgba(236,231,221,0.26)] bg-transparent text-muted"
              }`}
            >
              {WEEKDAYS[wd].short}
            </button>
          );
        })}
      </div>
      {streak !== null && streak > 0 ? (
        <span className="shrink-0 whitespace-nowrap text-[12.5px] text-accent">🔥 {streak}</span>
      ) : (
        <span className="shrink-0 text-[13px] text-[#4f4a42]">—</span>
      )}
    </div>
  );
}
