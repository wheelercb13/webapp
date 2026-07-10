import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Idea, IdeaStage } from "@/lib/types";

const STAGE_DOT_COLOR: Record<IdeaStage, string> = {
  idea: "#6b7280",
  drafting: "#f59e0b",
  published: "#22c55e",
};

export default async function IdeasPage() {
  const supabase = await createClient();
  const { data } = (await supabase
    .from("ideas")
    .select("*")
    .order("created_at", { ascending: false })) as { data: Idea[] | null };

  const ideas = data ?? [];

  return (
    <div className="mx-auto flex w-full max-w-[468px] flex-col px-[22px]">
      <div className="flex items-end justify-between gap-3 pb-[26px] pt-9">
        <h1 className="font-serif text-[34px] font-medium leading-[1.02] tracking-[-0.01em] text-foreground-display">
          Idea Ledger
        </h1>
        <Link
          href="/ideas/new"
          className="inline-flex items-center justify-center shrink-0 rounded-full bg-accent px-5 py-2.5 text-[12px] font-semibold text-background transition-opacity hover:opacity-90"
        >
          Create New
        </Link>
      </div>

      <div className="border-t border-hairline">
        {ideas.map((idea) => (
          <Link
            key={idea.id}
            href={`/ideas/${idea.id}`}
            className="flex items-center gap-3.5 border-b border-hairline py-4"
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: STAGE_DOT_COLOR[idea.stage] }}
            />
            <span className="flex-1 text-[15px] text-foreground">{idea.title}</span>
            <span className="whitespace-nowrap text-[11px] uppercase tracking-[0.05em] text-muted">
              {idea.stage} · {idea.priority}
            </span>
          </Link>
        ))}
        {ideas.length === 0 && (
          <p className="py-4 text-[14px] text-muted">No ideas yet — tap Create New above.</p>
        )}
      </div>
    </div>
  );
}
