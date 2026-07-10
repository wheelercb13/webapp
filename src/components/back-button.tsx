"use client";

import { useRouter, usePathname } from "next/navigation";
import { getParentPath } from "@/lib/navigation";

export function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/") return null;

  return (
    <button
      type="button"
      onClick={() => router.push(getParentPath(pathname))}
      className="inline-flex items-center justify-center rounded-full border border-button-border px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-foreground transition-colors hover:bg-white/[.06]"
    >
      ← Back
    </button>
  );
}
