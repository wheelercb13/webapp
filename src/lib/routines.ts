import { APP_TIMEZONE, todayString, toUtcDate, toDateString } from "./date";
import type { RoutineCadence } from "./types";

// Week anchored to a given weekday (0=Sun..6=Sat), computed in the app's
// fixed timezone. Steps without their own weekday anchor to Monday (1),
// matching the routine-wide default this replaced.
function currentWeekStart(anchorWeekday: number, timeZone: string = APP_TIMEZONE): string {
  const date = toUtcDate(todayString(timeZone));
  const dayOfWeek = date.getUTCDay(); // 0 = Sunday
  const daysSinceAnchor = (dayOfWeek - anchorWeekday + 7) % 7;
  date.setUTCDate(date.getUTCDate() - daysSinceAnchor);
  return toDateString(date);
}

export function currentCycleDate(
  cadence: RoutineCadence,
  weekday: number | null = 1,
  timeZone: string = APP_TIMEZONE
): string {
  return cadence === "daily" ? todayString(timeZone) : currentWeekStart(weekday ?? 1, timeZone);
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
  weekday: number | null,
  completedCycleDates: Set<string>,
  timeZone: string = APP_TIMEZONE
): number {
  let cursor = currentCycleDate(cadence, weekday, timeZone);
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

export type StreakRun = { length: number; startDate: string; endDate: string };

// Scans *all* completions (not just recent ones) for the longest run of
// consecutive cycles ever completed -- used for the permanent Routine
// History record, unlike computeStreak() which only cares about the
// streak still active right now.
export function longestStreak(
  cadence: RoutineCadence,
  completedCycleDates: Set<string>
): StreakRun | null {
  if (completedCycleDates.size === 0) return null;

  const stepMs = (cadence === "daily" ? 1 : 7) * 24 * 60 * 60 * 1000;
  const sorted = Array.from(completedCycleDates)
    .map((d) => toUtcDate(d).getTime())
    .sort((a, b) => a - b);

  let bestLength = 1;
  let bestStart = sorted[0];
  let bestEnd = sorted[0];
  let curLength = 1;
  let curStart = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] - sorted[i - 1] === stepMs) {
      curLength++;
    } else {
      curLength = 1;
      curStart = sorted[i];
    }
    if (curLength > bestLength) {
      bestLength = curLength;
      bestStart = curStart;
      bestEnd = sorted[i];
    }
  }

  return {
    length: bestLength,
    startDate: toDateString(new Date(bestStart)),
    endDate: toDateString(new Date(bestEnd)),
  };
}
