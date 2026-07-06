"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string };

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 left-1/2 z-30 flex w-full max-w-[468px] -translate-x-1/2 justify-between border-t border-hairline bg-background/[.92] px-3.5 pb-[calc(0.7rem+env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-md">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-[5px] px-[3px] pb-0.5 pt-1"
          >
            <span
              className={`h-[2px] w-4 rounded-full ${active ? "bg-accent" : "bg-transparent"}`}
            />
            <span
              className={`text-[9.5px] font-semibold uppercase tracking-[0.05em] ${
                active ? "text-accent" : "text-disabled-line"
              }`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
