import { createClient } from "@/lib/supabase/server";
import type { FunctionAccess } from "@/lib/types";
import { FunctionAccessRow } from "./function-access-row";

export default async function SystemAccessPage() {
  const supabase = await createClient();
  const { data } = (await supabase
    .from("functions")
    .select("*")
    .order("label")) as { data: FunctionAccess[] | null };

  const functions = data ?? [];

  return (
    <div className="mx-auto flex w-full max-w-[468px] flex-col px-[22px]">
      <div className="pb-[26px] pt-9">
        <h1 className="font-serif text-[34px] font-medium leading-[1.02] tracking-[-0.01em] text-foreground-display">
          System Access
        </h1>
      </div>

      <table className="w-full overflow-hidden rounded-xl border border-card-border">
        <thead>
          <tr className="border-b border-hairline">
            <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
              Function
            </th>
            <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
              General
            </th>
            <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
              Admin
            </th>
          </tr>
        </thead>
        <tbody>
          {functions.map((fn) => (
            <FunctionAccessRow
              key={fn.key}
              funcKey={fn.key}
              label={fn.label}
              accessLevel={fn.access_level}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
