"use client";

import { useTransition } from "react";
import { updatePageVisibility } from "./actions";

export function PageVisibilityRow({
  pageKey,
  label,
  visible,
}: {
  pageKey: string;
  label: string;
  visible: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleChange(next: boolean) {
    startTransition(() => {
      updatePageVisibility(pageKey, next);
    });
  }

  return (
    <label className="flex items-center justify-between gap-3 border-b border-hairline py-[15px] last:border-b-0">
      <span className="text-[15px] text-foreground">{label}</span>
      <input
        type="checkbox"
        checked={visible}
        disabled={isPending}
        onChange={(e) => handleChange(e.target.checked)}
        className="h-4 w-4"
      />
    </label>
  );
}
