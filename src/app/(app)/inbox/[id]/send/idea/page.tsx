import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { InboxItem } from "@/lib/types";
import { convertInboxToIdea } from "../../../actions";
import { InboxToIdeaForm } from "./inbox-to-idea-form";

export default async function ConvertInboxToIdeaPage({
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

  return (
    <div className="mx-auto flex w-full max-w-[468px] flex-col px-[22px]">
      <div className="pb-[26px] pt-9">
        <h1 className="font-serif text-[34px] font-medium leading-[1.02] tracking-[-0.01em] text-foreground-display">
          Convert to Idea
        </h1>
      </div>
      <div className="rounded-xl border border-card-border p-4">
        <InboxToIdeaForm
          action={convertInboxToIdea.bind(null, item.id)}
          rawText={item.raw_text}
        />
      </div>
    </div>
  );
}
