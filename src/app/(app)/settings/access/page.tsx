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
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
        System Access
      </h1>

      <table className="w-full overflow-hidden rounded-lg border border-black/10 dark:border-white/10">
        <thead>
          <tr className="border-b border-black/10 text-sm text-zinc-600 dark:border-white/10 dark:text-zinc-400">
            <th className="px-4 py-2 text-left font-medium">Function</th>
            <th className="px-4 py-2 font-medium">General</th>
            <th className="px-4 py-2 font-medium">Admin</th>
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
