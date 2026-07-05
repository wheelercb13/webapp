import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/actions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <nav className="flex items-center justify-between border-b border-black/10 px-6 py-3 dark:border-white/10">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm font-medium text-black hover:underline dark:text-zinc-50"
          >
            Today
          </Link>
          <Link
            href="/domains"
            className="text-sm font-medium text-black hover:underline dark:text-zinc-50"
          >
            Domains
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {user?.email && (
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {user.email}
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
        </div>
      </nav>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
