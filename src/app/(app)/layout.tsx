import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/actions";
import { FUNCTION_ROUTES } from "@/lib/access";
import type { FunctionAccess } from "@/lib/types";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdmin = !!user?.app_metadata?.is_admin;

  let accessByKey: Record<string, FunctionAccess> = {};
  if (!isAdmin) {
    const { data } = (await supabase.from("functions").select("*")) as {
      data: FunctionAccess[] | null;
    };
    accessByKey = Object.fromEntries((data ?? []).map((f) => [f.key, f]));
  }

  function canAccess(routePrefix: string) {
    if (isAdmin) return true;
    const key = FUNCTION_ROUTES[routePrefix];
    return accessByKey[key]?.access_level === "general";
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="flex items-center justify-end gap-3 border-b border-black/10 px-6 py-3 dark:border-white/10">
        {user && (
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {user.user_metadata?.name || user.email}
          </span>
        )}
        <form action={logout}>
          <button
            type="submit"
            className="rounded-full border border-black/10 px-4 py-1.5 text-sm font-medium text-black transition-colors hover:bg-black/[.04] dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/[.06]"
          >
            Log out
          </button>
        </form>
      </header>

      <main className="flex flex-1 flex-col pb-20">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-10 flex justify-around border-t border-black/10 bg-zinc-50 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] dark:border-white/10 dark:bg-black">
        <Link
          href="/"
          className="rounded-lg px-4 py-2 text-sm font-medium text-black hover:bg-black/[.04] dark:text-zinc-50 dark:hover:bg-white/[.06]"
        >
          Today
        </Link>
        {canAccess("/domains") && (
          <Link
            href="/domains"
            className="rounded-lg px-4 py-2 text-sm font-medium text-black hover:bg-black/[.04] dark:text-zinc-50 dark:hover:bg-white/[.06]"
          >
            Domains
          </Link>
        )}
        {canAccess("/users") && (
          <Link
            href="/users"
            className="rounded-lg px-4 py-2 text-sm font-medium text-black hover:bg-black/[.04] dark:text-zinc-50 dark:hover:bg-white/[.06]"
          >
            Users
          </Link>
        )}
        {isAdmin && (
          <Link
            href="/system"
            className="rounded-lg px-4 py-2 text-sm font-medium text-black hover:bg-black/[.04] dark:text-zinc-50 dark:hover:bg-white/[.06]"
          >
            System
          </Link>
        )}
      </nav>
    </div>
  );
}
