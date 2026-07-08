import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Domain, InboxItem } from "@/lib/types";
import { convertInboxToTask } from "../../../actions";
import { InboxToTaskForm } from "./inbox-to-task-form";

export default async function ConvertInboxToTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: item } = (await supabase
    .from("inbox_items")
    .select("*")
    .eq("id", id)
    .single()) as { data: InboxItem | null };

  if (!item || item.resolved) {
    redirect("/inbox");
  }

  const { data: domainsData } = (await supabase
    .from("domains")
    .select("*")
    .order("name")) as { data: Domain[] | null };

  const domains = domainsData ?? [];

  return (
    <div className="mx-auto flex w-full max-w-[468px] flex-col px-[22px]">
      <div className="pb-[26px] pt-9">
        <h1 className="font-serif text-[34px] font-medium leading-[1.02] tracking-[-0.01em] text-foreground-display">
          Convert to Task
        </h1>
      </div>
      <div className="rounded-xl border border-card-border p-4">
        <InboxToTaskForm
          action={convertInboxToTask.bind(null, item.id)}
          rawText={item.raw_text}
          domains={domains}
        />
      </div>
    </div>
  );
}
