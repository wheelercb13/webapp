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
      className="rounded-lg border border-card-border bg-background px-3 py-2.5 text-[15px] text-foreground outline-none"
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
