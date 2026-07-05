import { APP_TIMEZONE, todayString } from "./date";
import type { RoutineCadence } from "./types";

function toUtcDate(dateString: string): Date {
  const [y, m, d] = dateString.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// Monday-anchored week, computed in the app's fixed timezone.
function currentWeekStart(timeZone: string = APP_TIMEZONE): string {
  const date = toUtcDate(todayString(timeZone));
  const dayOfWeek = date.getUTCDay(); // 0 = Sunday
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  date.setUTCDate(date.getUTCDate() - daysSinceMonday);
  return toDateString(date);
}

export function currentCycleDate(
  cadence: RoutineCadence,
  timeZone: string = APP_TIMEZONE
): string {
  return cadence === "daily" ? todayString(timeZone) : currentWeekStart(timeZone);
}

export function previousCycleDate(cadence: RoutineCadence, cycleDate: string): string {
  const date = toUtcDate(cycleDate);
  date.setUTCDate(date.getUTCDate() - (cadence === "daily" ? 1 : 7));
  return toDateString(date);
}

// Walks backward from the current cycle (or the previous one, if the
// current cycle isn't completed yet) counting consecutive completed
// cycles. A gap stops the count, so missing a cycle resets the streak
// to zero on the next completion.
export function computeStreak(
  cadence: RoutineCadence,
  completedCycleDates: Set<string>,
  timeZone: string = APP_TIMEZONE
): number {
  let cursor = currentCycleDate(cadence, timeZone);
  if (!completedCycleDates.has(cursor)) {
    cursor = previousCycleDate(cadence, cursor);
  }

  let streak = 0;
  while (completedCycleDates.has(cursor)) {
    streak++;
    cursor = previousCycleDate(cadence, cursor);
  }
  return streak;
}
