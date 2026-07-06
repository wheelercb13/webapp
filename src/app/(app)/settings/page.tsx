import Link from "next/link";

const SETTINGS_PAGES = [
  { label: "Calendar", href: "/settings/calendar", color: "#3b82f6" },
  { label: "System Access", href: "/settings/access", color: "#a855f7" },
  { label: "Users", href: "/settings/users", color: "#22c55e" },
];

export default function SettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-[468px] flex-col px-[22px]">
      <div className="pb-[26px] pt-9">
        <h1 className="font-serif text-[34px] font-medium leading-[1.02] tracking-[-0.01em] text-foreground-display">
          Settings
        </h1>
      </div>

      <div className="border-t border-hairline">
        {SETTINGS_PAGES.map((page) => (
          <Link
            key={page.href}
            href={page.href}
            className="flex items-center gap-3.5 border-b border-hairline py-[17px]"
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: page.color }}
            />
            <span className="flex-1 text-[16px] text-foreground">{page.label}</span>
            <span className="text-[16px] leading-none text-faint">›</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
