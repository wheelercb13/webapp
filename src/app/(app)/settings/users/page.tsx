import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function UsersPage() {
  const admin = createAdminClient();
  const { data } = await admin.auth.admin.listUsers();
  const users = data?.users ?? [];

  return (
    <div className="mx-auto flex w-full max-w-[468px] flex-col px-[22px]">
      <div className="flex items-end justify-between gap-3 pb-[26px] pt-9">
        <h1 className="font-serif text-[34px] font-medium leading-[1.02] tracking-[-0.01em] text-foreground-display">
          Users
        </h1>
        <Link
          href="/settings/users/new"
          className="inline-flex items-center justify-center shrink-0 rounded-full bg-accent px-5 py-2.5 text-[12px] font-semibold text-background transition-opacity hover:opacity-90"
        >
          Create New
        </Link>
      </div>

      <div className="border-t border-hairline">
        {users.map((user) => (
          <Link
            key={user.id}
            href={`/settings/users/${user.id}`}
            className="flex items-center gap-3.5 border-b border-hairline py-[15px]"
          >
            <span className="text-[15px] text-foreground">{user.email}</span>
          </Link>
        ))}
        {users.length === 0 && (
          <p className="py-4 text-[14px] text-muted">No users yet — tap Create New above.</p>
        )}
      </div>
    </div>
  );
}
