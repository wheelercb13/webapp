import { createClient } from "@/lib/supabase/server";
import type { PageVisibility } from "@/lib/types";
import { PAGE_VIEW_OPTIONS } from "@/lib/access";
import { PageVisibilityRow } from "./page-visibility-row";

export default async function PageViewSettingsPage() {
  const supabase = await createClient();
  const { data } = (await supabase.from("page_visibility").select("*")) as {
    data: PageVisibility[] | null;
  };
  const visibleByKey = Object.fromEntries((data ?? []).map((p) => [p.page_key, p.visible]));

  return (
    <div className="mx-auto flex w-full max-w-[468px] flex-col px-[22px]">
      <div className="pb-[10px] pt-9">
        <h1 className="font-serif text-[34px] font-medium leading-[1.02] tracking-[-0.01em] text-foreground-display">
          Page View
        </h1>
      </div>
      <p className="mb-[22px] text-[13px] text-muted">
        Turn off a page to hide it from your menu and block direct access to it. Related
        items elsewhere in the app (like Inbox conversions or Today&apos;s task list) are
        hidden too.
      </p>

      <div className="border-t border-hairline">
        {PAGE_VIEW_OPTIONS.map((page) => (
          <PageVisibilityRow
            key={page.key}
            pageKey={page.key}
            label={page.label}
            visible={visibleByKey[page.key] ?? true}
          />
        ))}
      </div>
    </div>
  );
}
