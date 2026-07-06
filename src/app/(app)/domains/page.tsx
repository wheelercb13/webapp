import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Domain } from "@/lib/types";
import { DOMAIN_COLOR_CLASSES } from "@/lib/colors";
import { reorderDomain } from "./actions";

export default async function DomainsPage() {
  const supabase = await createClient();
  const { data } = (await supabase
    .from("domains")
    .select("*")
    .order("sort_order")) as { data: Domain[] | null };

  const domains = data ?? [];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
          Domains
        </h1>
        <Link
          href="/domains/new"
          className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          Create New
        </Link>
      </div>

      <ul className="flex flex-col gap-2">
        {domains.map((domain, index) => (
          <li key={domain.id} className="flex items-center gap-2">
            <Link
              href={`/domains/${domain.id}`}
              className="flex flex-1 items-center gap-3 rounded-lg border border-black/10 px-4 py-3 hover:bg-black/[.02] dark:border-white/10 dark:hover:bg-white/[.04]"
            >
              <span
                className={`h-3 w-3 rounded-full ${DOMAIN_COLOR_CLASSES[domain.color]}`}
              />
              <span className="text-black dark:text-zinc-50">{domain.name}</span>
            </Link>
            <div className="flex flex-col">
              <form action={reorderDomain.bind(null, domain.id, "up")}>
                <button
                  type="submit"
                  disabled={index === 0}
                  aria-label="Move up"
                  className="flex h-5 w-6 items-center justify-center text-xs text-zinc-500 hover:text-black disabled:opacity-30 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  ▲
                </button>
              </form>
              <form action={reorderDomain.bind(null, domain.id, "down")}>
                <button
                  type="submit"
                  disabled={index === domains.length - 1}
                  aria-label="Move down"
                  className="flex h-5 w-6 items-center justify-center text-xs text-zinc-500 hover:text-black disabled:opacity-30 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  ▼
                </button>
              </form>
            </div>
          </li>
        ))}
        {domains.length === 0 && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No domains yet — tap Create New above.
          </p>
        )}
      </ul>
    </div>
  );
}
