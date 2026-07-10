import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/actions";
import { FUNCTION_ROUTES } from "@/lib/access";
import type { FunctionAccess } from "@/lib/types";
import { BackButton } from "@/components/back-button";
import { NavMenu } from "@/components/nav-menu";

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

  const navItems = [
    { href: "/", label: "Today" },
    ...(canAccess("/inbox") ? [{ href: "/inbox", label: "Inbox" }] : []),
    ...(canAccess("/ideas") ? [{ href: "/ideas", label: "Ideas" }] : []),
    ...(canAccess("/domains") ? [{ href: "/domains", label: "Tasks" }] : []),
    ...(canAccess("/routines") ? [{ href: "/routines", label: "Routines" }] : []),
    ...(canAccess("/library") ? [{ href: "/library", label: "Library" }] : []),
    ...(isAdmin ? [{ href: "/settings", label: "Settings" }] : []),
  ];

  return (
    <div className="flex flex-1 flex-col bg-background">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-hairline bg-background/[.86] px-[22px] py-4 backdrop-blur-md">
        <BackButton />
        <div className="ml-auto flex items-center gap-3.5">
          {user && (
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.09em] text-muted">
              {user.user_metadata?.name || user.email}
            </span>
          )}
          <form action={logout}>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full border border-button-border px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-foreground transition-colors hover:bg-white/[.06]"
            >
              Log out
            </button>
          </form>
        </div>
      </header>

      <main className="flex flex-1 flex-col pb-24">{children}</main>

      <NavMenu items={navItems} />
    </div>
  );
}
