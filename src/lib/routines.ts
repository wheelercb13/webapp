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

function nextDay(dateString: string): string {
  const date = toUtcDate(dateString);
  date.setUTCDate(date.getUTCDate() + 1);
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

// A weekly step's occurrence sequence is every calendar day whose weekday
// is in its `weekdays` set, in order -- a Mon/Wed/Fri step's sequence is
// ...Mon, Wed, Fri, Mon, Wed, Fri... with Tue/Thu/Sat/Sun simply not part
// of it. previousOccurrenceDate/nextOccurrenceDate/currentOccurrenceDate
// walk that sequence one calendar day at a time (bounded, since `weekdays`
// always has at least one element) so a multi-day step's streak treats
// "the next time it's scheduled" as the unit of consecutiveness, not a
// fixed 7-day gap -- days it doesn't repeat on can't break (or extend) it.
function previousOccurrenceDate(weekdays: number[], cycleDate: string): string {
  const date = toUtcDate(cycleDate);
  do {
    date.setUTCDate(date.getUTCDate() - 1);
  } while (!weekdays.includes(date.getUTCDay()));
  return toDateString(date);
}

function nextOccurrenceDate(weekdays: number[], cycleDate: string): string {
  const date = toUtcDate(cycleDate);
  do {
    date.setUTCDate(date.getUTCDate() + 1);
  } while (!weekdays.includes(date.getUTCDay()));
  return toDateString(date);
}

function currentOccurrenceDate(weekdays: number[], timeZone: string = APP_TIMEZONE): string {
  const today = todayString(timeZone);
  const todayWeekday = toUtcDate(today).getUTCDay();
  return weekdays.includes(todayWeekday) ? today : previousOccurrenceDate(weekdays, today);
}

// Same idea as recentCycleDates, but for a weekly step that repeats on
// several weekdays at once -- the last `count` occurrence dates in its
// sequence, most recent (today, if scheduled) first.
export function recentOccurrenceDates(
  weekdays: number[],
  count: number,
  timeZone: string = APP_TIMEZONE
): string[] {
  const dates: string[] = [];
  let cursor = currentOccurrenceDate(weekdays, timeZone);
  for (let i = 0; i < count; i++) {
    dates.push(cursor);
    cursor = previousOccurrenceDate(weekdays, cursor);
  }
  return dates;
}

// Walks backward from the current cycle (or the previous one, if the
// current cycle isn't completed yet) counting consecutive completed
// cycles. A gap stops the count, so missing a cycle resets the streak
// to zero on the next completion. For weekly steps this walks the full
// occurrence sequence across all of `weekdays` (see above), so e.g. a
// Mon-Thu step's streak carries Thursday -> next Monday uninterrupted --
// Friday/Saturday/Sunday aren't scheduled, so they can't break it.
export function computeStreak(
  cadence: RoutineCadence,
  weekdays: number[] | null,
  completedCycleDates: Set<string>,
  timeZone: string = APP_TIMEZONE
): number {
  if (cadence === "daily") {
    let cursor = todayString(timeZone);
    if (!completedCycleDates.has(cursor)) {
      cursor = previousCycleDate("daily", cursor);
    }
    let streak = 0;
    while (completedCycleDates.has(cursor)) {
      streak++;
      cursor = previousCycleDate("daily", cursor);
    }
    return streak;
  }

  const days = weekdays && weekdays.length > 0 ? weekdays : [1];
  let cursor = currentOccurrenceDate(days, timeZone);
  if (!completedCycleDates.has(cursor)) {
    cursor = previousOccurrenceDate(days, cursor);
  }

  let streak = 0;
  while (completedCycleDates.has(cursor)) {
    streak++;
    cursor = previousOccurrenceDate(days, cursor);
  }
  return streak;
}

export type StreakRun = { length: number; startDate: string; endDate: string };

// Scans *all* completions (not just recent ones) for the longest run of
// consecutive cycles ever completed -- used for the permanent Routine
// History record, unlike computeStreak() which only cares about the
// streak still active right now.
//
// For weekly steps, "consecutive" means back-to-back in the step's own
// occurrence sequence (see computeStreak's comment) -- a completed date is
// part of the same run as the previous one iff it's exactly that date's
// nextOccurrenceDate, so a Mon-Thu step's Thursday-then-next-Monday counts
// as consecutive while a Mon-Thu step that skips Tuesday does not.
export function longestStreak(
  cadence: RoutineCadence,
  completedCycleDates: Set<string>,
  weekdays: number[] | null = null
): StreakRun | null {
  if (completedCycleDates.size === 0) return null;

  const sorted = Array.from(completedCycleDates).sort();

  let bestLength = 1;
  let bestStart = sorted[0];
  let bestEnd = sorted[0];
  let curLength = 1;
  let curStart = sorted[0];

  const days = weekdays && weekdays.length > 0 ? weekdays : [1];

  for (let i = 1; i < sorted.length; i++) {
    const expectedNext =
      cadence === "daily" ? nextDay(sorted[i - 1]) : nextOccurrenceDate(days, sorted[i - 1]);
    if (sorted[i] === expectedNext) {
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

  return { length: bestLength, startDate: bestStart, endDate: bestEnd };
}
