import { toUtcDate, toDateString, zonedDateString } from "./date";
import type { Task, TaskPriority } from "./types";

// A task's "slipping" threshold depends on its priority. High priority has
// no day-count grace -- it's slipping the moment it's overdue (or, lacking
// a due date, the moment the day after it was created begins). Med/Low use
// a day-count threshold checked against *either* signal: overdue by more
// than the threshold, or untouched (updated_at) for more than the
// threshold -- whichever trips first.
export const SLIPPING_THRESHOLD_DAYS: Record<Exclude<TaskPriority, "high">, number> = {
  med: 7,
  low: 14,
};

export function slippingCutoffIso(thresholdDays: number): string {
  return new Date(Date.now() - thresholdDays * 24 * 60 * 60 * 1000).toISOString();
}

function daysBeforeDateString(dateString: string, days: number): string {
  const date = toUtcDate(dateString);
  date.setUTCDate(date.getUTCDate() - days);
  return toDateString(date);
}

export function isSlipping(
  task: Pick<Task, "priority" | "due_date" | "updated_at" | "created_at">,
  today: string
): boolean {
  if (task.priority === "high") {
    if (task.due_date) return task.due_date < today;
    return zonedDateString(new Date(task.created_at)) < today;
  }

  const thresholdDays = SLIPPING_THRESHOLD_DAYS[task.priority];
  const overdueCutoff = daysBeforeDateString(today, thresholdDays);
  const pastDueByThreshold = !!task.due_date && task.due_date < overdueCutoff;
  const inactive = task.updated_at < slippingCutoffIso(thresholdDays);
  return pastDueByThreshold || inactive;
}

export function daysSince(isoTimestamp: string): number {
  const ms = Date.now() - new Date(isoTimestamp).getTime();
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}

export function daysOverdue(dueDate: string, today: string): number {
  const diffMs = toUtcDate(today).getTime() - toUtcDate(dueDate).getTime();
  return Math.round(diffMs / (24 * 60 * 60 * 1000));
}
