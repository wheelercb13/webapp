"use client";

import { useRouter } from "next/navigation";

export function ConvertMenu({ itemId }: { itemId: string }) {
  const router = useRouter();

  return (
    <select
      defaultValue=""
      onChange={(e) => {
        const target = e.target.value;
        if (target) {
          router.push(`/inbox/${itemId}/send/${target}`);
        }
      }}
      className="rounded-full border border-button-border bg-background px-[11px] py-[5px] text-[10px] font-semibold uppercase tracking-[0.05em] text-foreground outline-none transition-colors hover:bg-white/[.06]"
    >
      <option value="" disabled>
        Convert…
      </option>
      <option value="task">Task</option>
      <option value="idea">Idea</option>
      <option value="note">Note</option>
    </select>
  );
}
