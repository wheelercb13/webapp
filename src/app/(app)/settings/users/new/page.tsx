import { createClient } from "@/lib/supabase/server";
import { createUser } from "../actions";
import { UserForm } from "../user-form";

export default async function NewUserPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const canManageAdmin = !!user?.app_metadata?.is_admin;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
        Create User
      </h1>
      <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
        <UserForm
          action={createUser}
          passwordRequired
          canManageAdmin={canManageAdmin}
          submitLabel="Create User"
        />
      </div>
    </div>
  );
}
