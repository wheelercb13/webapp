import Link from "next/link";

const SYSTEM_FUNCTIONS = [{ label: "System Access", href: "/system/access" }];

export default function SystemPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-50">System</h1>

      <ul className="flex flex-col gap-2">
        {SYSTEM_FUNCTIONS.map((fn) => (
          <li key={fn.href}>
            <Link
              href={fn.href}
              className="flex items-center rounded-lg border border-black/10 px-4 py-3 hover:bg-black/[.02] dark:border-white/10 dark:hover:bg-white/[.04]"
            >
              <span className="text-black dark:text-zinc-50">{fn.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
