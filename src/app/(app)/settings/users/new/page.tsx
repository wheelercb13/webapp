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
    <div className="mx-auto flex w-full max-w-[468px] flex-col px-[22px]">
      <div className="pb-[26px] pt-9">
        <h1 className="font-serif text-[34px] font-medium leading-[1.02] tracking-[-0.01em] text-foreground-display">
          Create User
        </h1>
      </div>
      <div className="rounded-xl border border-card-border p-4">
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
