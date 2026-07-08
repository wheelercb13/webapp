// Resolved inbox items are auto-deleted once they've sat resolved this
// long -- same pattern as completed-task retention, just keyed off
// resolved_at instead of updated_at.
export const RESOLVED_INBOX_RETENTION_DAYS = 14;

export function resolvedInboxCutoffIso(
  retentionDays: number = RESOLVED_INBOX_RETENTION_DAYS
): string {
  return new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();
}
