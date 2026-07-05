// Single-user app: "today" means the user's local calendar day, not the
// server's (UTC on Vercel), which can be several hours ahead in the evening.
export const APP_TIMEZONE = "America/New_York";

export function todayString(timeZone: string = APP_TIMEZONE): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(new Date());
}
