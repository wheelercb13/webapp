import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateUser } from "../actions";
import { UserForm } from "../user-form";
import { DeleteUserButton } from "../delete-user-button";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data } = await admin.auth.admin.getUserById(id);

  if (!data?.user) {
    redirect("/settings/users");
  }

  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();
  const isCurrentUser = currentUser?.id === id;
  const canManageAdmin = !!currentUser?.app_metadata?.is_admin;

  return (
    <div className="mx-auto flex w-full max-w-[468px] flex-col px-[22px]">
      <div className="pb-[26px] pt-9">
        <h1 className="font-serif text-[34px] font-medium leading-[1.02] tracking-[-0.01em] text-foreground-display">
          {data.user.user_metadata?.name || data.user.email}
        </h1>
      </div>
      <div className="mb-4 rounded-xl border border-card-border p-4">
        <UserForm
          action={updateUser.bind(null, id)}
          initialEmail={data.user.email}
          initialName={data.user.user_metadata?.name}
          initialIsAdmin={!!data.user.app_metadata?.is_admin}
          canManageAdmin={canManageAdmin}
          passwordRequired={false}
          submitLabel="Save"
        />
      </div>
      {!isCurrentUser && <DeleteUserButton userId={id} />}
    </div>
  );
}
