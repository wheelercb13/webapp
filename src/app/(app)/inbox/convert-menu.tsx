"use client";

import { useRouter } from "next/navigation";
import type { InboxResolution } from "@/lib/types";

const ALL_TARGETS: { value: InboxResolution; label: string }[] = [
  { value: "task", label: "Task" },
  { value: "idea", label: "Idea" },
  { value: "note", label: "Note" },
];

export function ConvertMenu({
  itemId,
  hiddenTargets = [],
}: {
  itemId: string;
  hiddenTargets?: InboxResolution[];
}) {
  const router = useRouter();
  const targets = ALL_TARGETS.filter((t) => !hiddenTargets.includes(t.value));

  if (targets.length === 0) {
    return <p className="text-[12px] text-muted">No conversion available</p>;
  }

  return (
    <select
      defaultValue=""
      onChange={(e) => {
        const target = e.target.value;
        if (target) {
          router.push(`/inbox/${itemId}/send/${target}`);
        }
      }}
      className="w-[112px] rounded-full border border-button-border bg-background px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-foreground outline-none transition-colors hover:bg-white/[.06]"
    >
      <option value="" disabled>
        Convert…
      </option>
      {targets.map((t) => (
        <option key={t.value} value={t.value}>
          {t.label}
        </option>
      ))}
    </select>
  );
}
