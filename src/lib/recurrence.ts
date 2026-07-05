import { toUtcDate, toDateString } from "./date";

export type RepeatUnit = "day" | "week" | "month" | "year";

export type RepeatRule = {
  unit: RepeatUnit;
  interval: number;
  weekdays: number[] | null; // 0=Sun..6=Sat; only meaningful when unit === "week"
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function addDays(dateStr: string, n: number): string {
  const date = toUtcDate(dateStr);
  date.setUTCDate(date.getUTCDate() + n);
  return toDateString(date);
}

// Adds calendar months, clamping to the last valid day of the target
// month (e.g. Jan 31 + 1 month -> Feb 28, not an overflowed March date).
function addMonths(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const targetIndex = m - 1 + n;
  const targetYear = y + Math.floor(targetIndex / 12);
  const targetMonth = ((targetIndex % 12) + 12) % 12;
  const daysInTargetMonth = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  const clampedDay = Math.min(d, daysInTargetMonth);
  return toDateString(new Date(Date.UTC(targetYear, targetMonth, clampedDay)));
}

function addYears(dateStr: string, n: number): string {
  return addMonths(dateStr, n * 12);
}

function mondayOffset(sundayBasedDow: number): number {
  return (sundayBasedDow + 6) % 7;
}

function startOfWeekMonday(dateStr: string): string {
  const date = toUtcDate(dateStr);
  date.setUTCDate(date.getUTCDate() - mondayOffset(date.getUTCDay()));
  return toDateString(date);
}

export function nextOccurrence(dueDate: string, rule: RepeatRule): string {
  switch (rule.unit) {
    case "day":
      return addDays(dueDate, rule.interval);
    case "month":
      return addMonths(dueDate, rule.interval);
    case "year":
      return addYears(dueDate, rule.interval);
    case "week": {
      if (!rule.weekdays || rule.weekdays.length === 0) {
        return addDays(dueDate, rule.interval * 7);
      }
      const weekStart = startOfWeekMonday(dueDate);
      const offsets = [...rule.weekdays].map(mondayOffset).sort((a, b) => a - b);
      const dueOffset = mondayOffset(toUtcDate(dueDate).getUTCDay());
      const nextInSameWeek = offsets.find((o) => o > dueOffset);
      if (nextInSameWeek !== undefined) {
        return addDays(weekStart, nextInSameWeek);
      }
      const nextActiveWeekStart = addDays(weekStart, rule.interval * 7);
      return addDays(nextActiveWeekStart, offsets[0]);
    }
  }
}

export function describeRepeatRule(rule: RepeatRule): string {
  const unitLabel = rule.interval === 1 ? rule.unit : `${rule.unit}s`;
  const base = `Every ${rule.interval === 1 ? "" : `${rule.interval} `}${unitLabel}`;

  if (rule.unit === "week" && rule.weekdays && rule.weekdays.length > 0) {
    const days = [...rule.weekdays]
      .sort((a, b) => a - b)
      .map((d) => WEEKDAY_LABELS[d])
      .join(", ");
    return `${base} on ${days}`;
  }

  return base;
}
