"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type NavItem = { href: string; label: string };

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavMenu({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] right-3.5 z-30"
    >
      {open && (
        <div className="absolute bottom-[calc(100%+10px)] right-0 flex w-44 flex-col gap-0.5 rounded-xl border border-card-border bg-background p-2 shadow-lg">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-[13px] font-medium transition-colors hover:bg-white/[.06] ${
                  active ? "text-accent" : "text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open menu"
        aria-expanded={open}
        className="flex h-11 w-11 flex-col items-center justify-center gap-[4px] rounded-lg border border-card-border bg-background/[.92] backdrop-blur-md transition-colors hover:bg-white/[.06]"
      >
        <span className="block h-[2px] w-[18px] rounded-full bg-foreground" />
        <span className="block h-[2px] w-[18px] rounded-full bg-foreground" />
        <span className="block h-[2px] w-[18px] rounded-full bg-foreground" />
      </button>
    </div>
  );
}
