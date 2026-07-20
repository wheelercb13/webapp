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

// Most-recent-first list of the last `count` cycle dates (current cycle
// included), for a "catch up on a missed day" editor -- daily steps get
// the last N calendar days, weekly steps get the last N occurrences of
// their Repeat On weekday (spanning N weeks).
export function recentCycleDates(
  cadence: RoutineCadence,
  weekday: number | null,
  count: number,
  timeZone: string = APP_TIMEZONE
): string[] {
  const dates: string[] = [];
  let cursor = currentCycleDate(cadence, weekday, timeZone);
  for (let i = 0; i < count; i++) {
    dates.push(cursor);
    cursor = previousCycleDate(cadence, cursor);
  }
  return dates;
}

// Same idea as recentCycleDates, but for a weekly step that repeats on
// several weekdays at once -- walks backward one calendar day at a time,
// collecting the last `count` actual occurrence dates across all of the
// given weekdays, mixed together in chronological order (today first, if
// today is one of them).
export function recentOccurrenceDates(
  weekdays: number[],
  count: number,
  timeZone: string = APP_TIMEZONE
): string[] {
  const dates: string[] = [];
  const cursor = toUtcDate(todayString(timeZone));
  while (dates.length < count) {
    if (weekdays.includes(cursor.getUTCDay())) {
      dates.push(toDateString(cursor));
    }
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return dates;
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

// Finds the longest run of consecutive same-gap times in a sorted list,
// shared by longestStreak()'s daily pass and its per-weekday weekly passes.
function longestRun(sortedTimes: number[], stepMs: number): StreakRun {
  let bestLength = 1;
  let bestStart = sortedTimes[0];
  let bestEnd = sortedTimes[0];
  let curLength = 1;
  let curStart = sortedTimes[0];

  for (let i = 1; i < sortedTimes.length; i++) {
    if (sortedTimes[i] - sortedTimes[i - 1] === stepMs) {
      curLength++;
    } else {
      curLength = 1;
      curStart = sortedTimes[i];
    }
    if (curLength > bestLength) {
      bestLength = curLength;
      bestStart = curStart;
      bestEnd = sortedTimes[i];
    }
  }

  return {
    length: bestLength,
    startDate: toDateString(new Date(bestStart)),
    endDate: toDateString(new Date(bestEnd)),
  };
}

// Scans *all* completions (not just recent ones) for the longest run of
// consecutive cycles ever completed -- used for the permanent Routine
// History record, unlike computeStreak() which only cares about the
// streak still active right now.
//
// A weekly step can repeat on several weekdays, each tracked as its own
// independent 7-day chain -- so completions are grouped by the actual
// weekday of each date first, and the longest run is taken across those
// groups, rather than assuming every completion is exactly 7 days apart
// from the next (which only holds true within a single weekday's chain).
export function longestStreak(
  cadence: RoutineCadence,
  completedCycleDates: Set<string>
): StreakRun | null {
  if (completedCycleDates.size === 0) return null;

  if (cadence === "daily") {
    const sorted = Array.from(completedCycleDates)
      .map((d) => toUtcDate(d).getTime())
      .sort((a, b) => a - b);
    return longestRun(sorted, 24 * 60 * 60 * 1000);
  }

  const timesByWeekday = new Map<number, number[]>();
  for (const d of completedCycleDates) {
    const time = toUtcDate(d).getTime();
    const weekday = new Date(time).getUTCDay();
    const list = timesByWeekday.get(weekday) ?? [];
    list.push(time);
    timesByWeekday.set(weekday, list);
  }

  let best: StreakRun | null = null;
  for (const times of timesByWeekday.values()) {
    times.sort((a, b) => a - b);
    const run = longestRun(times, 7 * 24 * 60 * 60 * 1000);
    if (!best || run.length > best.length) {
      best = run;
    }
  }
  return best;
}
