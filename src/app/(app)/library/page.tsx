import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Note } from "@/lib/types";

const TAG_COLORS = [
  "#c8a35e",
  "#b8563f",
  "#7d8f69",
  "#6f8ba8",
  "#a855f7",
  "#3b82f6",
  "#f59e0b",
  "#22c55e",
];

function tagColor(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = (hash * 31 + tag.charCodeAt(i)) >>> 0;
  return TAG_COLORS[hash % TAG_COLORS.length];
}

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const { q, tag } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("notes").select("*").order("created_at", { ascending: false });
  if (tag) {
    query = query.contains("tags", [tag]);
  }
  if (q) {
    query = query.ilike("content", `%${q}%`);
  }

  const { data } = (await query) as { data: Note[] | null };
  const notes = data ?? [];
  const filtered = Boolean(q || tag);

  const { data: allNotesData } = (await supabase.from("notes").select("tags")) as {
    data: { tags: string[] }[] | null;
  };
  const allTags = Array.from(new Set((allNotesData ?? []).flatMap((n) => n.tags))).sort();

  return (
    <div className="mx-auto flex w-full max-w-[468px] flex-col px-[22px]">
      <div className="flex items-end justify-between gap-3 pb-[22px] pt-9">
        <h1 className="font-serif text-[34px] font-medium leading-[1.02] tracking-[-0.01em] text-foreground-display">
          Library
        </h1>
        <Link
          href="/library/new"
          className="shrink-0 rounded-full bg-accent px-4 py-2.5 text-[12px] font-semibold text-background transition-opacity hover:opacity-90"
        >
          Create New
        </Link>
      </div>

      <form className="mb-[22px] flex items-center gap-2.5">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search notes…"
          className="flex-1 rounded-lg border border-card-border bg-transparent px-3 py-2.5 text-[14px] text-foreground outline-none"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full border border-button-border px-[15px] py-2.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-foreground transition-colors hover:bg-white/[.06]"
        >
          Search
        </button>
      </form>

      {allTags.length > 0 && (
        <>
          <div className="mb-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
            Collections
          </div>
          <div className="mb-[30px] flex flex-wrap gap-2">
            {allTags.map((t) => (
              <Link
                key={t}
                href={`/library?tag=${encodeURIComponent(t)}`}
                className="inline-flex items-center gap-[7px] rounded-full border border-card-border px-3 py-[5px] text-[12px] text-foreground"
              >
                <span
                  className="h-[7px] w-[7px] shrink-0 rounded-full"
                  style={{ backgroundColor: tagColor(t) }}
                />
                {t}
              </Link>
            ))}
          </div>
        </>
      )}

      {filtered && (
        <p className="mb-3 text-[13px] text-muted">
          {tag ? (
            <>Filtered by tag &quot;{tag}&quot; — </>
          ) : (
            <>Search results for &quot;{q}&quot; — </>
          )}
          <Link href="/library" className="underline">
            clear
          </Link>
        </p>
      )}

      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
        Notes
      </div>
      <div className="border-t border-hairline">
        {notes.map((note) => (
          <div key={note.id} className="border-b border-hairline py-[18px]">
            <Link
              href={`/library/${note.id}/edit`}
              className="mb-2.5 block whitespace-pre-wrap text-[14.5px] leading-[1.55] text-[#d9d3c8]"
            >
              {note.content.length > 300 ? `${note.content.slice(0, 300)}…` : note.content}
            </Link>
            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-[7px]">
                {note.tags.map((t) => (
                  <Link
                    key={t}
                    href={`/library?tag=${encodeURIComponent(t)}`}
                    className="rounded-full border border-card-border px-[9px] py-[3px] text-[10.5px] uppercase tracking-[0.06em] text-muted"
                  >
                    {t}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
        {notes.length === 0 && (
          <p className="py-4 text-[14px] text-muted">
            {filtered ? "No notes match." : "No notes yet — tap Create New above."}
          </p>
        )}
      </div>
    </div>
  );
}
