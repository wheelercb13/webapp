// A task has "gone quiet" once its updated_at (auto-refreshed by a DB
// trigger on every edit, status toggle, or repeat advance) is older
// than this many days. Rolling from "now" rather than a calendar day,
// so no timezone handling is needed here.
export const SLIPPING_THRESHOLD_DAYS = 14;

export function slippingCutoffIso(thresholdDays: number = SLIPPING_THRESHOLD_DAYS): string {
  return new Date(Date.now() - thresholdDays * 24 * 60 * 60 * 1000).toISOString();
}

export function daysSince(isoTimestamp: string): number {
  const ms = Date.now() - new Date(isoTimestamp).getTime();
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}
