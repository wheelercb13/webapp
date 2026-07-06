import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Note } from "@/lib/types";

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

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-black dark:text-zinc-50">Library</h1>
        <Link
          href="/library/new"
          className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          Create New
        </Link>
      </div>

      <form className="flex items-center gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search notes…"
          className="flex-1 rounded border border-black/10 bg-transparent px-3 py-2 text-black dark:border-white/10 dark:text-zinc-50"
        />
        <button
          type="submit"
          className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-black hover:bg-black/[.04] dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/[.06]"
        >
          Search
        </button>
      </form>

      {filtered && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {tag ? (
            <>
              Filtered by tag &quot;{tag}&quot; —{" "}
            </>
          ) : (
            <>Search results for &quot;{q}&quot; — </>
          )}
          <Link href="/library" className="underline">
            clear
          </Link>
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {notes.map((note) => (
          <li
            key={note.id}
            className="flex flex-col gap-2 rounded-lg border border-black/10 px-4 py-3 dark:border-white/10"
          >
            <Link
              href={`/library/${note.id}/edit`}
              className="whitespace-pre-wrap text-black hover:underline dark:text-zinc-50"
            >
              {note.content.length > 300 ? `${note.content.slice(0, 300)}…` : note.content}
            </Link>
            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {note.tags.map((t) => (
                  <Link
                    key={t}
                    href={`/library?tag=${encodeURIComponent(t)}`}
                    className="rounded-full border border-black/10 px-2 py-0.5 text-xs text-zinc-600 hover:bg-black/[.04] dark:border-white/10 dark:text-zinc-400 dark:hover:bg-white/[.06]"
                  >
                    {t}
                  </Link>
                ))}
              </div>
            )}
          </li>
        ))}
        {notes.length === 0 && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {filtered ? "No notes match." : "No notes yet — tap Create New above."}
          </p>
        )}
      </ul>
    </div>
  );
}
