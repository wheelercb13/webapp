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
      className="w-[112px] rounded-full border border-button-border bg-background px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-foreground outline-none transition-colors hover:bg-white/[.06]"
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
