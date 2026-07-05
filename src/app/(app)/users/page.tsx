import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function UsersPage() {
  const admin = createAdminClient();
  const { data } = await admin.auth.admin.listUsers();
  const users = data?.users ?? [];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-black dark:text-zinc-50">Users</h1>
        <Link
          href="/users/new"
          className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          Create New
        </Link>
      </div>

      <ul className="flex flex-col gap-2">
        {users.map((user) => (
          <li key={user.id}>
            <Link
              href={`/users/${user.id}`}
              className="flex items-center rounded-lg border border-black/10 px-4 py-3 hover:bg-black/[.02] dark:border-white/10 dark:hover:bg-white/[.04]"
            >
              <span className="text-black dark:text-zinc-50">{user.email}</span>
            </Link>
          </li>
        ))}
        {users.length === 0 && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No users yet — tap Create New above.
          </p>
        )}
      </ul>
    </div>
  );
}
