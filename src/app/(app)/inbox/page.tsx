import { createClient } from "@/lib/supabase/server";
import type { InboxItem } from "@/lib/types";
import { resolvedInboxCutoffIso } from "@/lib/inbox-retention";
import { CaptureForm } from "./capture-form";
import { ConvertMenu } from "./convert-menu";
import { resolveInboxItem, deleteInboxItem } from "./actions";

export default async function InboxPage() {
  const supabase = await createClient();

  await supabase
    .from("inbox_items")
    .delete()
    .eq("resolved", true)
    .lt("resolved_at", resolvedInboxCutoffIso());

  const { data: unresolvedData } = (await supabase
    .from("inbox_items")
    .select("*")
    .eq("resolved", false)
    .order("captured_at", { ascending: true })) as { data: InboxItem[] | null };

  const { data: resolvedData } = (await supabase
    .from("inbox_items")
    .select("*")
    .eq("resolved", true)
    .order("resolved_at", { ascending: false })) as { data: InboxItem[] | null };

  const unresolvedItems = unresolvedData ?? [];
  const resolvedItems = resolvedData ?? [];

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
      <div className="mb-[30px] border-t border-hairline">
        {unresolvedItems.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-2.5 border-b border-hairline py-[15px]"
          >
            <span className="text-[15px] text-foreground">{item.raw_text}</span>
            <div className="flex items-center justify-between gap-3">
              <ConvertMenu itemId={item.id} />
              <div className="flex shrink-0 gap-1.5">
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
          </div>
        ))}
        {unresolvedItems.length === 0 && (
          <p className="py-4 text-[14px] text-muted">
            Inbox is empty — capture something above.
          </p>
        )}
      </div>

      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
        Resolved
      </div>
      <div className="border-t border-hairline">
        {resolvedItems.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-2.5 border-b border-hairline py-[15px]"
          >
            <span className="text-[15px] text-foreground">{item.raw_text}</span>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[12px] text-muted">
                Resolved {item.resolved_at ? item.resolved_at.slice(0, 10) : ""}
              </span>
              <form action={deleteInboxItem.bind(null, item.id)}>
                <button
                  type="submit"
                  className="shrink-0 rounded-full border border-delete-border px-[11px] py-[5px] text-[10px] font-semibold uppercase tracking-[0.05em] text-delete-text transition-colors hover:bg-white/[.06]"
                >
                  Delete
                </button>
              </form>
            </div>
          </div>
        ))}
        {resolvedItems.length === 0 && (
          <p className="py-4 text-[14px] text-muted">No resolved items.</p>
        )}
      </div>
    </div>
  );
}
