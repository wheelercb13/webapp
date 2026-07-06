// Completed tasks are auto-deleted once they've sat untouched this long
// -- "inactivity" is the same updated_at signal Slipping already uses,
// just applied to done tasks instead of open ones.
export const COMPLETED_TASK_RETENTION_DAYS = 7;

export function completedTaskCutoffIso(
  retentionDays: number = COMPLETED_TASK_RETENTION_DAYS
): string {
  return new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();
}
