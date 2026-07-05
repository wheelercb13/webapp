import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "./actions";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-zinc-50 dark:bg-black">
      <p className="text-lg text-black dark:text-zinc-50">
        Dashboard — logged in as {user.email}
      </p>
      <form action={logout}>
        <button
          type="submit"
          className="rounded-full border border-black/10 px-5 py-2 text-sm font-medium text-black transition-colors hover:bg-black/[.04] dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/[.06]"
        >
          Log out
        </button>
      </form>
    </div>
  );
}
