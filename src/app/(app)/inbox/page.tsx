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
    <div className="mx-auto flex w-full max-w-[468px] flex-col px-[22px]">
      <div className="pb-[26px] pt-9">
        <h1 className="font-serif text-[34px] font-medium leading-[1.02] tracking-[-0.01em] text-foreground-display">
          Inbox
        </h1>
      </div>

      <div className="mb-[34px] rounded-xl border border-card-border p-4">
        <CaptureForm />
      </div>

      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
        Unresolved
      </div>
      <div className="border-t border-hairline">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3.5 border-b border-hairline py-[15px]"
          >
            <span className="flex-1 text-[15px] text-foreground">{item.raw_text}</span>
            <div className="flex shrink-0 gap-2">
              <form action={resolveInboxItem.bind(null, item.id)}>
                <button
                  type="submit"
                  className="rounded-full border border-button-border px-[11px] py-[5px] text-[10px] font-semibold uppercase tracking-[0.05em] text-foreground transition-colors hover:bg-white/[.06]"
                >
                  Resolve
                </button>
              </form>
              <form action={deleteInboxItem.bind(null, item.id)}>
                <button
                  type="submit"
                  className="rounded-full border border-delete-border px-[11px] py-[5px] text-[10px] font-semibold uppercase tracking-[0.05em] text-delete-text transition-colors hover:bg-white/[.06]"
                >
                  Delete
                </button>
              </form>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="py-4 text-[14px] text-muted">
            Inbox is empty — capture something above.
          </p>
        )}
      </div>
    </div>
  );
}
