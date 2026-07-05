import { createClient } from "@/lib/supabase/server";
import type { InboxItem } from "@/lib/types";
import { CaptureForm } from "./capture-form";
import { resolveInboxItem, deleteInboxItem } from "./actions";

export default async function InboxPage() {
  const supabase = await createClient();
  const { data } = (await supabase
    .from("inbox_items")
    .select("*")
    .eq("resolved", false)
    .order("captured_at", { ascending: true })) as { data: InboxItem[] | null };

  const items = data ?? [];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-50">Inbox</h1>

      <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
        <CaptureForm />
      </div>

      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-black/10 px-4 py-3 dark:border-white/10"
          >
            <span className="text-black dark:text-zinc-50">{item.raw_text}</span>
            <div className="flex shrink-0 items-center gap-2">
              <form action={resolveInboxItem.bind(null, item.id)}>
                <button
                  type="submit"
                  className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-black hover:bg-black/[.04] dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/[.06]"
                >
                  Resolve
                </button>
              </form>
              <form action={deleteInboxItem.bind(null, item.id)}>
                <button
                  type="submit"
                  className="rounded-full border border-red-600/30 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-600/10 dark:text-red-400"
                >
                  Delete
                </button>
              </form>
            </div>
          </li>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Inbox is empty — capture something above.
          </p>
        )}
      </ul>
    </div>
  );
}
