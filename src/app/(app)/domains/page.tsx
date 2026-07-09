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
    <div className="mx-auto flex w-full max-w-[468px] flex-col px-[22px]">
      <div className="flex items-end justify-between gap-3 pb-[26px] pt-9">
        <h1 className="font-serif text-[34px] font-medium leading-[1.02] tracking-[-0.01em] text-foreground-display">
          Task Domains
        </h1>
        <Link
          href="/domains/new"
          className="shrink-0 rounded-full bg-accent px-4 py-2.5 text-[12px] font-semibold text-background transition-opacity hover:opacity-90"
        >
          Create New
        </Link>
      </div>

      <div className="border-t border-hairline">
        {domains.map((domain, index) => (
          <div
            key={domain.id}
            className="flex items-center gap-3.5 border-b border-hairline py-[15px]"
          >
            <Link
              href={`/domains/${domain.id}`}
              className="flex min-w-0 flex-1 items-center gap-3.5"
            >
              <span
                className={`h-[11px] w-[11px] shrink-0 rounded-full ${DOMAIN_COLOR_CLASSES[domain.color]}`}
              />
              <span className="text-[16px] text-foreground">{domain.name}</span>
            </Link>
            <div className="flex shrink-0 flex-col gap-px">
              <form action={reorderDomain.bind(null, domain.id, "up")}>
                <button
                  type="submit"
                  disabled={index === 0}
                  aria-label="Move up"
                  className="flex h-[13px] w-6 items-center justify-center text-[9px] leading-none text-faint hover:text-foreground disabled:opacity-30"
                >
                  ▲
                </button>
              </form>
              <form action={reorderDomain.bind(null, domain.id, "down")}>
                <button
                  type="submit"
                  disabled={index === domains.length - 1}
                  aria-label="Move down"
                  className="flex h-[13px] w-6 items-center justify-center text-[9px] leading-none text-faint hover:text-foreground disabled:opacity-30"
                >
                  ▼
                </button>
              </form>
            </div>
          </div>
        ))}
        {domains.length === 0 && (
          <p className="py-4 text-[14px] text-muted">No domains yet — tap Create New above.</p>
        )}
      </div>
    </div>
  );
}
