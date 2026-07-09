// Single-user app: "today" means the user's local calendar day, not the
// server's (UTC on Vercel), which can be several hours ahead in the evening.
export const APP_TIMEZONE = "America/New_York";

export function zonedDateString(date: Date, timeZone: string = APP_TIMEZONE): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(date);
}

export function todayString(timeZone: string = APP_TIMEZONE): string {
  return zonedDateString(new Date(), timeZone);
}

// 0 = Sunday .. 6 = Saturday, in the app's fixed timezone.
export function zonedWeekday(timeZone: string = APP_TIMEZONE): number {
  return toUtcDate(todayString(timeZone)).getUTCDay();
}

export function toUtcDate(dateString: string): Date {
  const [y, m, d] = dateString.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// Converts a YYYY-MM-DD date (or an ISO timestamp -- only its date portion
// is used) into MM-DD-YYYY for display everywhere in the UI.
export function formatDateDisplay(dateString: string): string {
  const [year, month, day] = dateString.slice(0, 10).split("-");
  return `${month}-${day}-${year}`;
}

function getTimeZoneOffsetMs(date: Date, timeZone: string): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).formatToParts(date).map((p) => [p.type, p.value])
  );
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );
  return asUtc - date.getTime();
}

// Returns the UTC instant corresponding to local midnight of `dateString`
// (YYYY-MM-DD) in `timeZone` -- needed to bound "today" as a real time
// range (e.g. for Google Calendar's timeMin/timeMax) rather than just a
// calendar-day string.
export function zonedStartOfDayUtc(dateString: string, timeZone: string = APP_TIMEZONE): Date {
  const [y, m, d] = dateString.split("-").map(Number);
  const naiveGuess = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
  const offsetMs = getTimeZoneOffsetMs(naiveGuess, timeZone);
  return new Date(naiveGuess.getTime() - offsetMs);
}
